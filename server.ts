import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MARKER_START = '=== HASIL KOREKSI, RUBRIK & UMPAN BALIK GURU ===';
const RECAP_MARKER = '=== REKAPITULASI KOREKSI OTOMATIS HARIAN ===';
const SKIP_FILE_KEYWORDS = ['rpp', 'materi', 'pos', 'contoh', 'template', 'master'];
const SKIP_TAB_KEYWORDS = ['materi', 'pos', 'rpp', 'nilai', 'rekap', 'lkpd', 'contoh'];

const DRIVE_ID_REGEX = /^[a-zA-Z0-9_-]{5,120}$/;

function isValidDriveId(id: unknown): id is string {
  return typeof id === 'string' && DRIVE_ID_REGEX.test(id);
}

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 10 ? token : null;
}

function isExcludedName(name: string, keywords: string[]): boolean {
  const lower = (name || '').toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function computePredicate(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
}

interface DocsParagraphElement {
  textRun?: { content?: string };
}

interface DocsStructuralElement {
  startIndex?: number;
  endIndex?: number;
  paragraph?: {
    elements?: DocsParagraphElement[];
  };
  table?: {
    tableRows?: Array<{
      tableCells?: Array<{
        content?: DocsStructuralElement[];
      }>;
    }>;
  };
}

interface DocsTab {
  tabProperties?: {
    tabId?: string;
    title?: string;
    index?: number;
  };
  documentTab?: {
    body?: {
      content?: DocsStructuralElement[];
    };
  };
  childTabs?: DocsTab[];
}

function extractTextFromStructuralElements(elements: DocsStructuralElement[] = []): string {
  const lines: string[] = [];
  for (const el of elements) {
    if (el.paragraph?.elements) {
      const text = el.paragraph.elements.map((pe) => pe.textRun?.content || '').join('');
      lines.push(text);
    } else if (el.table?.tableRows) {
      for (const row of el.table.tableRows) {
        const cellTexts = (row.tableCells || []).map((cell) =>
          extractTextFromStructuralElements(cell.content || []).replace(/\s+/g, ' ').trim()
        );
        if (cellTexts.some(Boolean)) {
          lines.push(cellTexts.join(' | ') + '\n');
        }
      }
    }
  }
  return lines.join('');
}

function flattenDocTabs(tabs: DocsTab[] = []): DocsTab[] {
  const result: DocsTab[] = [];
  for (const tab of tabs) {
    result.push(tab);
    if (tab.childTabs && tab.childTabs.length > 0) {
      result.push(...flattenDocTabs(tab.childTabs));
    }
  }
  return result;
}

function findMarkerBounds(
  elements: DocsStructuralElement[] = [],
  marker: string
): { markerStartIndex: number | null; bodyEndIndex: number } {
  let markerStartIndex: number | null = null;
  let bodyEndIndex = 1;

  for (const el of elements) {
    if (typeof el.endIndex === 'number' && el.endIndex > bodyEndIndex) {
      bodyEndIndex = el.endIndex;
    }
    if (markerStartIndex === null && el.paragraph?.elements) {
      const text = el.paragraph.elements.map((pe) => pe.textRun?.content || '').join('');
      if (text.includes(marker) && typeof el.startIndex === 'number') {
        markerStartIndex = el.startIndex;
      }
    }
  }
  return { markerStartIndex, bodyEndIndex };
}

function findTabById(tabs: DocsTab[], tabId: string): DocsTab | undefined {
  for (const t of tabs) {
    if (t.tabProperties?.tabId === tabId) return t;
    if (t.childTabs?.length) {
      const found = findTabById(t.childTabs, tabId);
      if (found) return found;
    }
  }
  return undefined;
}

function parseExistingScoreFromBlock(blockText: string): {
  score: number | null;
  identity: string | null;
  feedback: string | null;
} {
  const scoreMatch = blockText.match(/Nilai Akhir:\s*(\d{1,3})\s*\/\s*100/i);
  const identityMatch = blockText.match(/Identitas:\s*([^\n|]+)/i);
  const feedbackMatch = blockText.match(/3\.\s*Umpan Balik[^\n]*\n([\s\S]+)/i);
  return {
    score: scoreMatch ? Math.min(100, Math.max(0, Number(scoreMatch[1]))) : null,
    identity: identityMatch ? identityMatch[1].trim() : null,
    feedback: feedbackMatch ? feedbackMatch[1].trim() : null,
  };
}

async function googleFetch(url: string, accessToken: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const message = data?.error?.message || `Google API error (${res.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi pada server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // 1. Koreksi Satu Tab LKPD menggunakan Gemini AI di Server
  app.post('/api/grade', async (req, res) => {
    try {
      const { docTitle, tabName, studentIdentity, studentAnswer, kkm = 80, rubricSummary = '' } = req.body || {};
      if (typeof docTitle !== 'string' || typeof tabName !== 'string') {
        res.status(400).json({ error: 'Parameter docTitle dan tabName wajib berupa teks.' });
        return;
      }

      const numericKkm = Number.isFinite(Number(kkm)) ? Math.min(100, Math.max(0, Number(kkm))) : 80;
      const trimmedAnswer = typeof studentAnswer === 'string' ? studentAnswer.trim() : '';

      if (!trimmedAnswer) {
        res.json({
          identitas: studentIdentity || tabName,
          anggota_individu: [studentIdentity || tabName],
          score: 0,
          predicate: 'D',
          status: 'KOSONG',
          rubricBreakdown: [
            {
              aspect: 'Kelengkapan Pengerjaan LKPD',
              max: 100,
              score: 0,
              note: 'Belum ada jawaban yang diisi pada tab dokumen.',
            },
          ],
          errorTable: [
            {
              part: 'Seluruh Lembar Kerja LKPD',
              current: '[Kosong / Belum mengumpulkan]',
              explanation: 'Siswa belum mengisi jawaban pada tab Google Docs.',
              fix: 'Lengkapi seluruh bagian tugas pada tab masing-masing agar sistem dapat mengoreksi ulang otomatis.',
            },
          ],
          teacherFeedback: 'Lembar kerja masih kosong. Segera lengkapi jawaban pada tab Anda agar nilai dapat diproses.',
          recapNote: 'Belum mengumpulkan LKPD — segera kerjakan seluruh bagian lembar kerja.',
        });
        return;
      }

      const ai = getGenAI();
      const prompt = `Anda adalah Guru profesional yang mengoreksi dan menilai lembar kerja peserta didik (LKPD) secara objektif, adil, dan edukatif.
Judul Dokumen/Materi: ${docTitle}
Ringkasan Rubrik: ${rubricSummary || 'Nilai kelengkapan konsep, ketepatan perhitungan/prosedur, analisis, dan kesimpulan secara proporsional hingga total skor maksimal 100.'}
KKM: ${numericKkm} (Predikat: A = 90-100, B = 80-89, C = 70-79, D = <70).
Nama Tab: ${tabName}
Identitas Awal: ${studentIdentity || tabName}

Jawaban Siswa Terbaru:
${trimmedAnswer.slice(0, 28000)}

Tugas:
1. Identifikasi nama siswa atau seluruh anggota kelompok yang tertulis di jawaban (jika tidak tertulis di teks jawaban, gunakan Identitas Awal / Nama Tab).
2. Pecah daftar anggota menjadi array string pada anggota_individu.
3. Hitung skor tiap aspek rubrik sehingga jumlah skor_maks = 100 dan total score sesuai penjumlahan skor aspek.
4. Buat tabel kesalahan yang spesifik, ilmiah/matematis, dan konstruktif untuk setiap bagian yang keliru atau belum lengkap (jika sudah sempurna semua, beri array kosong).
5. Berikan umpan balik guru yang memotivasi dan ringkasan tindak lanjut 1-2 kalimat untuk tabel rekap nilai.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Keluarkan JSON valid berbahasa Indonesia yang jelas, akurat, dan terstruktur sesuai skema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              identitas: { type: Type.STRING },
              anggota_individu: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              score: { type: Type.NUMBER },
              rubricBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    aspect: { type: Type.STRING },
                    max: { type: Type.NUMBER },
                    score: { type: Type.NUMBER },
                    note: { type: Type.STRING },
                  },
                  required: ['aspect', 'max', 'score', 'note'],
                },
              },
              errorTable: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    part: { type: Type.STRING },
                    current: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    fix: { type: Type.STRING },
                  },
                  required: ['part', 'current', 'explanation', 'fix'],
                },
              },
              teacherFeedback: { type: Type.STRING },
              recapNote: { type: Type.STRING },
            },
            required: [
              'identitas',
              'anggota_individu',
              'score',
              'rubricBreakdown',
              'errorTable',
              'teacherFeedback',
              'recapNote',
            ],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Model AI mengembalikan respons kosong.');
      }

      const parsed = JSON.parse(rawText);
      const finalScore = Math.round(Math.min(100, Math.max(0, Number(parsed.score) || 0)));
      const predicate = computePredicate(finalScore);
      const status = finalScore >= numericKkm ? 'TUNTAS' : 'REMEDIAL';

      res.json({
        identitas: parsed.identitas || studentIdentity || tabName,
        anggota_individu:
          Array.isArray(parsed.anggota_individu) && parsed.anggota_individu.length > 0
            ? parsed.anggota_individu
            : [parsed.identitas || studentIdentity || tabName],
        score: finalScore,
        predicate,
        status,
        rubricBreakdown: Array.isArray(parsed.rubricBreakdown) ? parsed.rubricBreakdown : [],
        errorTable: Array.isArray(parsed.errorTable) ? parsed.errorTable : [],
        teacherFeedback: parsed.teacherFeedback || '',
        recapNote: parsed.recapNote || '-',
      });
    } catch (error: any) {
      console.error('Error /api/grade:', error?.message || error);
      res.status(500).json({
        error: error?.message || 'Gagal mengoreksi jawaban melalui Gemini AI.',
      });
    }
  });

  // 2. Pindai Rekursif Folder Google Drive & Multi-Tab Google Docs
  app.post('/api/workspace/scan-drive', async (req, res) => {
    try {
      const accessToken = extractBearerToken(req.headers.authorization);
      if (!accessToken) {
        res.status(401).json({ error: 'Token akses Google Workspace tidak ditemukan. Silakan masuk terlebih dahulu.' });
        return;
      }

      const { folderId, kkm = 80 } = req.body || {};
      if (!isValidDriveId(folderId)) {
        res.status(400).json({ error: 'ID Folder Google Drive tidak valid.' });
        return;
      }
      const numericKkm = Number.isFinite(Number(kkm)) ? Math.min(100, Math.max(0, Number(kkm))) : 80;

      const validToken: string = accessToken;

      const rootInfo = await googleFetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}?fields=id,name,mimeType&supportsAllDrives=true`,
        validToken
      );

      const collectedDocs: Array<{ folderId: string; folderName: string; docId: string; docTitle: string }> = [];
      const MAX_DOCS = 35;

      async function walkFolder(currentFolderId: string, currentFolderName: string, depth: number) {
        if (depth > 4 || collectedDocs.length >= MAX_DOCS) return;

        const q = encodeURIComponent(`'${currentFolderId}' in parents and trashed = false`);
        const listRes = await googleFetch(
          `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType)&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`,
          validToken
        );

        const files: Array<{ id: string; name: string; mimeType: string }> = listRes.files || [];

        for (const f of files) {
          if (collectedDocs.length >= MAX_DOCS) break;
          if (f.mimeType === 'application/vnd.google-apps.document') {
            if (!isExcludedName(f.name, SKIP_FILE_KEYWORDS)) {
              collectedDocs.push({
                folderId: currentFolderId,
                folderName: currentFolderName,
                docId: f.id,
                docTitle: f.name,
              });
            }
          }
        }

        for (const f of files) {
          if (collectedDocs.length >= MAX_DOCS) break;
          if (f.mimeType === 'application/vnd.google-apps.folder') {
            await walkFolder(f.id, f.name, depth + 1);
          }
        }
      }

      await walkFolder(folderId, rootInfo.name || 'Folder Induk', 0);

      const workspaces = [];
      for (const item of collectedDocs) {
        const docData = await googleFetch(
          `https://docs.googleapis.com/v1/documents/${encodeURIComponent(item.docId)}?includeTabsContent=true`,
          accessToken
        );

        const rawTabs: DocsTab[] = Array.isArray(docData.tabs) ? flattenDocTabs(docData.tabs) : [];
        const nilaiTab = rawTabs.find((t) => (t.tabProperties?.title || '').toLowerCase().includes('nilai'));
        const nilaiTabId = nilaiTab?.tabProperties?.tabId;

        const mappedTabs = rawTabs.map((t, idx) => {
          const title = t.tabProperties?.title || `Tab ${idx + 1}`;
          const googleTabId = t.tabProperties?.tabId || `${item.docId}-tab-${idx}`;
          const isFirst = idx === 0;
          const isKeywordExcluded = isExcludedName(title, SKIP_TAB_KEYWORDS);
          const excluded = isFirst || isKeywordExcluded;

          const bodyElements = t.documentTab?.body?.content || [];
          const fullText = extractTextFromStructuralElements(bodyElements);
          const markerIdx = fullText.indexOf(MARKER_START);
          const hasExistingMarker = markerIdx !== -1;
          const studentAnswer = (hasExistingMarker ? fullText.slice(0, markerIdx) : fullText).trim();
          const existingBlock = hasExistingMarker ? fullText.slice(markerIdx) : '';
          const existingParsed = existingBlock ? parseExistingScoreFromBlock(existingBlock) : null;

          let exclusionReason: string | undefined;
          if (title.toLowerCase().includes('nilai')) {
            exclusionReason = 'Tab Rekapitulasi Otomatis';
          } else if (isFirst) {
            exclusionReason = 'Tab Pertama (Materi / POS Acuan)';
          } else if (isKeywordExcluded) {
            exclusionReason = 'Tab Acuan / Referensi';
          }

          let score: number | null = null;
          let predicate = '-';
          let status: any = 'BELUM_DIKOREKSI';
          let recapNote = 'Siap dikoreksi oleh AI.';

          if (excluded) {
            status = 'EXCLUDED';
            recapNote = exclusionReason || 'Dikecualikan dari penilaian.';
          } else if (!studentAnswer) {
            score = 0;
            predicate = 'D';
            status = 'KOSONG';
            recapNote = 'Tab kosong — siswa belum mengisi jawaban.';
          } else if (existingParsed && existingParsed.score !== null) {
            score = existingParsed.score;
            predicate = computePredicate(score);
            status = score >= numericKkm ? 'TUNTAS' : 'REMEDIAL';
            recapNote = 'Sudah memiliki hasil koreksi sebelumnya di Google Docs (siap dikoreksi ulang).';
          }

          return {
            id: `${item.docId}__${googleTabId}`,
            googleTabId,
            tabName: title,
            excluded,
            exclusionReason,
            studentIdentity: existingParsed?.identity || title,
            members: [existingParsed?.identity || title],
            score,
            predicate,
            status,
            studentAnswerSnippet: studentAnswer,
            rubricBreakdown: [],
            errorTable: [],
            teacherFeedback: existingParsed?.feedback || '',
            recapNote,
            hasExistingMarker,
            dirtyToDocs: false,
          };
        });

        workspaces.push({
          id: `${item.folderId}__${item.docId}`,
          folderName: item.folderName,
          docId: item.docId,
          docTitle: docData.title || item.docTitle,
          docUrl: `https://docs.google.com/document/d/${item.docId}/edit`,
          kkm: numericKkm,
          rubricSummary: `Penilaian objektif LKPD ${docData.title || item.docTitle} dengan KKM ${numericKkm}`,
          nilaiTabId,
          tabs: mappedTabs,
        });
      }

      res.json({
        rootFolderName: rootInfo.name || 'Folder Induk',
        workspaces,
      });
    } catch (error: any) {
      const status = error?.status === 401 ? 401 : error?.status === 403 ? 403 : 500;
      console.error('Error /api/workspace/scan-drive:', error?.message || error);
      res.status(status).json({
        error: error?.message || 'Gagal memindai folder Google Drive.',
      });
    }
  });

  // 3. Tulis / Smart Upsert Hasil Koreksi ke Tab Google Docs (dan opsional Tab Nilai)
  app.post('/api/workspace/write-doc-tab', async (req, res) => {
    try {
      const accessToken = extractBearerToken(req.headers.authorization);
      if (!accessToken) {
        res.status(401).json({ error: 'Token akses Google Workspace tidak ditemukan.' });
        return;
      }

      const { docId, tabId, evaluation, kkm = 80, nilaiTabId, nilaiRows } = req.body || {};
      if (!isValidDriveId(docId) || typeof tabId !== 'string' || !tabId) {
        res.status(400).json({ error: 'Parameter docId dan tabId wajib diisi.' });
        return;
      }

      const docData = await googleFetch(
        `https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}?includeTabsContent=true`,
        accessToken
      );

      const allTabs: DocsTab[] = Array.isArray(docData.tabs) ? docData.tabs : [];
      const targetTab = findTabById(allTabs, tabId);
      if (!targetTab) {
        res.status(404).json({ error: 'Tab target tidak ditemukan di dokumen Google Docs.' });
        return;
      }

      const bodyElements = targetTab.documentTab?.body?.content || [];
      const { markerStartIndex, bodyEndIndex } = findMarkerBounds(bodyElements, MARKER_START);

      const requests: any[] = [];
      if (markerStartIndex !== null && bodyEndIndex - 1 > markerStartIndex) {
        requests.push({
          deleteContentRange: {
            range: {
              startIndex: markerStartIndex,
              endIndex: bodyEndIndex - 1,
              tabId,
            },
          },
        });
      }

      const waktu = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const score = Number(evaluation?.score ?? 0);
      const predicate = evaluation?.predicate || computePredicate(score);
      const statusLabel = score >= Number(kkm) ? 'TUNTAS' : 'REMEDIAL';

      const rubricLines = (evaluation?.rubricBreakdown || [])
        .map((r: any) => `- ${r.aspect}: ${r.score}/${r.max} (${r.note})`)
        .join('\n');

      const errorLines =
        Array.isArray(evaluation?.errorTable) && evaluation.errorTable.length > 0
          ? evaluation.errorTable
              .map(
                (e: any, idx: number) =>
                  `${idx + 1}. [${e.part}]\n   Jawaban saat ini: ${e.current}\n   Penjelasan: ${e.explanation}\n   Cara perbaikan: ${e.fix}`
              )
              .join('\n')
          : 'Tidak ada kesalahan ditemukan. Jawaban sudah lengkap dan tepat.';

      const blockText =
        `\n\n${MARKER_START}\n` +
        `Diperbarui Otomatis: ${waktu} WIB | Identitas: ${evaluation?.identitas || '-'}\n` +
        `Nilai Akhir: ${score}/100 | Predikat: ${predicate} | Status: ${statusLabel} (KKM >= ${kkm})\n\n` +
        `1. Rincian Skor Rubrik\n${rubricLines || '-'}\n\n` +
        `2. Penjelasan Kesalahan Jawaban & Cara Memperbaikinya\n${errorLines}\n\n` +
        `3. Umpan Balik & Tindak Lanjut Guru\n${evaluation?.teacherFeedback || '-'}\n`;

      requests.push({
        insertText: {
          text: blockText,
          endOfSegmentLocation: { tabId },
        },
      });

      // Opsional: Perbarui Tab "Nilai" di dokumen yang sama
      if (typeof nilaiTabId === 'string' && nilaiTabId && Array.isArray(nilaiRows) && nilaiRows.length > 0) {
        const nilaiTab = findTabById(allTabs, nilaiTabId);
        if (nilaiTab) {
          const nilaiElements = nilaiTab.documentTab?.body?.content || [];
          const { markerStartIndex: nMarker, bodyEndIndex: nEnd } = findMarkerBounds(
            nilaiElements,
            RECAP_MARKER
          );
          if (nMarker !== null && nEnd - 1 > nMarker) {
            requests.push({
              deleteContentRange: {
                range: {
                  startIndex: nMarker,
                  endIndex: nEnd - 1,
                  tabId: nilaiTabId,
                },
              },
            });
          }
          const recapLines = nilaiRows
            .map(
              (r: any, i: number) =>
                `${i + 1}. ${r.tabName} | ${r.studentIdentity} | Nilai: ${r.score} (${r.predicate} - ${r.status}) | Perbaikan: ${r.recapNote}`
            )
            .join('\n');
          requests.push({
            insertText: {
              text: `\n\n${RECAP_MARKER}\nSinkronisasi Terakhir: ${waktu} WIB\n\n${recapLines}\n`,
              endOfSegmentLocation: { tabId: nilaiTabId },
            },
          });
        }
      }

      await googleFetch(
        `https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}:batchUpdate`,
        accessToken,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requests }),
        }
      );

      res.json({ ok: true, docId, tabId });
    } catch (error: any) {
      const status = error?.status === 401 ? 401 : error?.status === 403 ? 403 : 500;
      console.error('Error /api/workspace/write-doc-tab:', error?.message || error);
      res.status(status).json({
        error: error?.message || 'Gagal memperbarui tab di Google Docs.',
      });
    }
  });

  // 4. Sinkronisasi Rekapitulasi Nilai Per Kelas ke Google Sheets
  app.post('/api/workspace/sync-sheet', async (req, res) => {
    try {
      const accessToken = extractBearerToken(req.headers.authorization);
      if (!accessToken) {
        res.status(401).json({ error: 'Token akses Google Workspace tidak ditemukan.' });
        return;
      }

      const { rootFolderId, spreadsheetId: providedSsId, records, kkm = 80 } = req.body || {};
      if (!Array.isArray(records) || records.length === 0) {
        res.status(400).json({ error: 'Tidak ada data nilai untuk disinkronkan.' });
        return;
      }

      let spreadsheetId = isValidDriveId(providedSsId) ? providedSsId : '';
      let spreadsheetUrl = '';

      if (!spreadsheetId) {
        const targetTitle = 'Rekapitulasi Nilai LKPD Otomatis';
        if (isValidDriveId(rootFolderId)) {
          const q = encodeURIComponent(
            `'${rootFolderId}' in parents and name = '${targetTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
          );
          const searchRes = await googleFetch(
            `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,webViewLink)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
            accessToken
          );
          if (searchRes.files?.length > 0) {
            spreadsheetId = searchRes.files[0].id;
            spreadsheetUrl = searchRes.files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
          }
        }

        if (!spreadsheetId) {
          const created = await googleFetch('https://sheets.googleapis.com/v4/spreadsheets', accessToken, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              properties: { title: targetTitle },
            }),
          });
          spreadsheetId = created.spreadsheetId;
          spreadsheetUrl = created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

          if (isValidDriveId(rootFolderId)) {
            await googleFetch(
              `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(spreadsheetId)}?addParents=${encodeURIComponent(rootFolderId)}&supportsAllDrives=true`,
              accessToken,
              { method: 'PATCH' }
            );
          }
        }
      } else {
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      }

      // Ambil daftar sheet tab yang ada
      const ssMeta = await googleFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties`,
        accessToken
      );
      const existingSheetTitles = new Set<string>(
        (ssMeta.sheets || []).map((s: any) => s.properties?.title).filter(Boolean)
      );

      // Kelompokkan record per kelas/folder
      const grouped = new Map<string, any[]>();
      for (const r of records) {
        const sheetName = String(r.folderName || 'Rekap Kelas').replace(/[\\/?*[\]:]/g, '-').slice(0, 30);
        if (!grouped.has(sheetName)) grouped.set(sheetName, []);
        grouped.get(sheetName)!.push(r);
      }

      const addSheetRequests: any[] = [];
      for (const sheetName of grouped.keys()) {
        if (!existingSheetTitles.has(sheetName)) {
          addSheetRequests.push({ addSheet: { properties: { title: sheetName } } });
        }
      }

      if (addSheetRequests.length > 0) {
        await googleFetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
          accessToken,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests: addSheetRequests }),
          }
        );
      }

      const waktu = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const sheetNames: string[] = [];
      for (const [sheetName, items] of grouped.entries()) {
        sheetNames.push(sheetName);
        const escapedSheet = `'${sheetName.replace(/'/g, "''")}'`;

        await googleFetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(escapedSheet + '!A1:J500')}:clear`,
          accessToken,
          { method: 'POST' }
        );

        const values = [
          [
            'NO',
            'KELAS / FOLDER',
            'DOKUMEN',
            'NAMA SISWA',
            'ASAL TAB',
            'NILAI',
            'PREDIKAT',
            `STATUS (KKM >= ${kkm})`,
            'TINDAK LANJUT PERBAIKAN',
            'WAKTU UPDATE',
          ],
          ...items.map((r, idx) => [
            idx + 1,
            r.folderName,
            r.docTitle,
            r.studentName,
            r.tabName,
            r.score,
            r.predicate,
            r.status,
            r.recapNote,
            `${waktu} WIB`,
          ]),
        ];

        await googleFetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(escapedSheet + '!A1')}?valueInputOption=USER_ENTERED`,
          accessToken,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values }),
          }
        );
      }

      res.json({
        ok: true,
        spreadsheetId,
        spreadsheetUrl,
        totalRows: records.length,
        sheetNames,
      });
    } catch (error: any) {
      const status = error?.status === 401 ? 401 : error?.status === 403 ? 403 : 500;
      console.error('Error /api/workspace/sync-sheet:', error?.message || error);
      res.status(status).json({
        error: error?.message || 'Gagal menyinkronkan data ke Google Sheets.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

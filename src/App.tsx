import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import {
  AppView,
  DataSourceMode,
  DocTabRecord,
  FlattenedStudentRecord,
  FolderWorkspace,
  PendingConfirmation,
} from './types';
import { DEFAULT_ROOT_FOLDER_ID, DEMO_FOLDERS } from './data/demoFolders';
import { getAccessToken, googleSignIn, initAuth, logout } from './lib/firebaseAuth';
import { TopBar } from './components/TopBar';
import { ConfirmationModal } from './components/ConfirmationModal';
import { TabDetailDrawer } from './components/TabDetailDrawer';
import { RecapView } from './components/RecapView';
import { DriveSetupView } from './components/DriveSetupView';
import { GasDeployView } from './components/GasDeployView';

interface ToastMessage {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

function extractDriveId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{5,120})/);
  if (folderMatch) return folderMatch[1];
  const docMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{5,120})/);
  if (docMatch) return docMatch[1];
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{5,120})/);
  if (idParamMatch) return idParamMatch[1];
  return /^[a-zA-Z0-9_-]{5,120}$/.test(trimmed) ? trimmed : '';
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [mode, setMode] = useState<DataSourceMode>('demo');

  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const [folderInput, setFolderInput] = useState<string>(DEFAULT_ROOT_FOLDER_ID);
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState<string>('');
  const [kkm, setKkm] = useState<number>(80);

  const [demoFolders, setDemoFolders] = useState<FolderWorkspace[]>(DEMO_FOLDERS);
  const [workspaceFolders, setWorkspaceFolders] = useState<FolderWorkspace[]>([]);
  const [rootFolderName, setRootFolderName] = useState<string>('Folder Induk Google Drive');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Siap digunakan');
  const [lastSpreadsheetUrl, setLastSpreadsheetUrl] = useState<string | null>(null);

  const [filterFolderId, setFilterFolderId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedTabRef, setSelectedTabRef] = useState<{ folderId: string; tabId: string } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isGradingSingle, setIsGradingSingle] = useState<boolean>(false);
  const [isBatchGrading, setIsBatchGrading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    label: string;
  } | null>(null);

  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const parsedFolderId = useMemo(() => extractDriveId(folderInput), [folderInput]);
  const parsedSpreadsheetId = useMemo(() => extractDriveId(spreadsheetIdInput), [spreadsheetIdInput]);

  const activeFolders = mode === 'workspace' ? workspaceFolders : demoFolders;

  const pushToast = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  useEffect(() => {
    const unsub = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setHasToken(Boolean(token));
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsub();
  }, []);

  const updateActiveFolders = (updater: (prev: FolderWorkspace[]) => FolderWorkspace[]) => {
    if (mode === 'workspace') {
      setWorkspaceFolders(updater);
    } else {
      setDemoFolders(updater);
    }
  };

  const scanGoogleDrive = async (tokenOverride?: string) => {
    const token = tokenOverride || getAccessToken();
    if (!token) {
      pushToast('Silakan masuk dengan Google terlebih dahulu.', 'warning');
      return;
    }
    if (!parsedFolderId) {
      pushToast('ID atau URL Folder Google Drive tidak valid.', 'warning');
      return;
    }

    setIsScanning(true);
    try {
      const res = await fetch('/api/workspace/scan-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          folderId: parsedFolderId,
          kkm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setHasToken(false);
        }
        throw new Error(data?.error || 'Gagal memindai Google Drive.');
      }

      setRootFolderName(data.rootFolderName || 'Folder Induk');
      setWorkspaceFolders(data.workspaces || []);
      setMode('workspace');
      setFilterFolderId('ALL');
      setLastSyncTime(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      );

      const docCount = (data.workspaces || []).length;
      if (docCount === 0) {
        pushToast(
          'Folder terpindai, namun belum ditemukan file Google Docs (selain file acuan) di dalamnya.',
          'info'
        );
      } else {
        pushToast(
          `Berhasil memindai ${docCount} dokumen Google Docs dari "${data.rootFolderName}".`,
          'success'
        );
      }
    } catch (err: any) {
      pushToast(err?.message || 'Gagal memindai Google Drive.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasToken(true);
        pushToast(`Terhubung ke Google Workspace sebagai ${result.user.email}.`, 'success');
        if (parsedFolderId) {
          await scanGoogleDrive(result.accessToken);
        }
      }
    } catch (err: any) {
      pushToast(err?.message || 'Gagal masuk dengan Google.', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setHasToken(false);
    setMode('demo');
    pushToast('Sesi Google Workspace telah keluar.', 'info');
  };

  const gradeTabWithServer = async (
    folder: FolderWorkspace,
    tab: DocTabRecord,
    answerText: string
  ): Promise<DocTabRecord> => {
    const res = await fetch('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docTitle: folder.docTitle,
        tabName: tab.tabName,
        studentIdentity: tab.studentIdentity,
        studentAnswer: answerText,
        kkm: folder.kkm || kkm,
        rubricSummary: folder.rubricSummary,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal memproses penilaian AI.');
    }

    return {
      ...tab,
      studentAnswerSnippet: answerText,
      studentIdentity: data.identitas || tab.studentIdentity,
      members: Array.isArray(data.anggota_individu) ? data.anggota_individu : tab.members,
      score: data.score,
      predicate: data.predicate,
      status: data.status,
      rubricBreakdown: data.rubricBreakdown || [],
      errorTable: data.errorTable || [],
      teacherFeedback: data.teacherFeedback || '',
      recapNote: data.recapNote || '-',
      dirtyToDocs: true,
    };
  };

  const handleRegradeSingleTab = async (folderId: string, tabId: string, updatedAnswer: string) => {
    const folder = activeFolders.find((f) => f.id === folderId);
    const tab = folder?.tabs.find((t) => t.id === tabId);
    if (!folder || !tab) return;

    setIsGradingSingle(true);
    try {
      const graded = await gradeTabWithServer(folder, tab, updatedAnswer);
      updateActiveFolders((prev) =>
        prev.map((f) =>
          f.id !== folderId
            ? f
            : {
                ...f,
                tabs: f.tabs.map((t) => (t.id === tabId ? graded : t)),
              }
        )
      );
      pushToast(`Koreksi selesai: ${graded.tabName} memperoleh nilai ${graded.score} (${graded.status}).`, 'success');
    } catch (err: any) {
      pushToast(err?.message || 'Gagal mengoreksi tab via Gemini AI.', 'error');
    } finally {
      setIsGradingSingle(false);
    }
  };

  const handleBatchGradeAll = async () => {
    const targets: Array<{ folder: FolderWorkspace; tab: DocTabRecord }> = [];
    for (const f of activeFolders) {
      for (const t of f.tabs) {
        if (!t.excluded) targets.push({ folder: f, tab: t });
      }
    }
    if (targets.length === 0) {
      pushToast('Tidak ada tab siswa yang dapat dikoreksi.', 'warning');
      return;
    }

    setIsBatchGrading(true);
    setBatchProgress({ current: 0, total: targets.length, label: 'Memulai koreksi AI...' });

    let successCount = 0;
    for (let i = 0; i < targets.length; i++) {
      const { folder, tab } = targets[i];
      setBatchProgress({
        current: i + 1,
        total: targets.length,
        label: `Mengoreksi ${folder.docTitle} · Tab "${tab.tabName}"`,
      });
      try {
        const graded = await gradeTabWithServer(folder, tab, tab.studentAnswerSnippet);
        updateActiveFolders((prev) =>
          prev.map((f) =>
            f.id !== folder.id
              ? f
              : {
                  ...f,
                  tabs: f.tabs.map((t) => (t.id === tab.id ? graded : t)),
                }
          )
        );
        successCount++;
      } catch (err: any) {
        pushToast(`Gagal pada tab "${tab.tabName}": ${err?.message}`, 'error');
      }
    }

    setLastSyncTime(
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    );
    setIsBatchGrading(false);
    setBatchProgress(null);
    pushToast(`Koreksi batch selesai (${successCount}/${targets.length} tab berhasil dinilai).`, 'success');
  };

  const writeTabsToGoogleDocs = async (items: Array<{ folder: FolderWorkspace; tab: DocTabRecord }>) => {
    const token = getAccessToken();
    if (!token) {
      pushToast('Sesi Google berakhir. Silakan masuk kembali.', 'warning');
      return;
    }

    setIsBatchGrading(true);
    setBatchProgress({ current: 0, total: items.length, label: 'Menulis hasil ke Google Docs...' });

    let updatedCount = 0;
    const docsWithNilaiUpdated = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const { folder, tab } = items[i];
      if (!tab.googleTabId || tab.score === null) continue;

      setBatchProgress({
        current: i + 1,
        total: items.length,
        label: `Memperbarui Google Docs "${folder.docTitle}" · Tab "${tab.tabName}"`,
      });

      const shouldUpdateNilai = Boolean(folder.nilaiTabId) && !docsWithNilaiUpdated.has(folder.docId);
      const nilaiRows = shouldUpdateNilai
        ? folder.tabs
            .filter((t) => !t.excluded && t.score !== null)
            .map((t) => ({
              tabName: t.tabName,
              studentIdentity: t.studentIdentity,
              score: t.score,
              predicate: t.predicate,
              status: (t.score ?? 0) >= folder.kkm ? 'Tuntas' : 'Remedial',
              recapNote: t.recapNote,
            }))
        : undefined;

      const res = await fetch('/api/workspace/write-doc-tab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          docId: folder.docId,
          tabId: tab.googleTabId,
          kkm: folder.kkm || kkm,
          nilaiTabId: shouldUpdateNilai ? folder.nilaiTabId : undefined,
          nilaiRows,
          evaluation: {
            identitas: tab.studentIdentity,
            score: tab.score,
            predicate: tab.predicate,
            rubricBreakdown: tab.rubricBreakdown,
            errorTable: tab.errorTable,
            teacherFeedback: tab.teacherFeedback,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Gagal memperbarui tab "${tab.tabName}".`);
      }
      if (shouldUpdateNilai) docsWithNilaiUpdated.add(folder.docId);
      updatedCount++;

      updateActiveFolders((prev) =>
        prev.map((f) =>
          f.id !== folder.id
            ? f
            : {
                ...f,
                tabs: f.tabs.map((t) =>
                  t.id === tab.id ? { ...t, hasExistingMarker: true, dirtyToDocs: false } : t
                ),
              }
        )
      );
    }

    setBatchProgress(null);
    setIsBatchGrading(false);
    pushToast(`Berhasil menulis hasil koreksi ke ${updatedCount} tab Google Docs.`, 'success');
  };

  const requestWriteSingleTab = (folder: FolderWorkspace, tab: DocTabRecord) => {
    setPendingConfirmation({
      title: 'Perbarui Tab Google Docs?',
      description:
        'Sistem akan mengganti blok hasil koreksi lama (di bawah penanda koreksi) dan menyisipkan nilai, rubrik, serta saran perbaikan terbaru ke dokumen Google Docs Anda.',
      items: [
        `Dokumen: ${folder.docTitle} — Tab "${tab.tabName}" (Nilai: ${tab.score}/100)`,
        ...(folder.nilaiTabId ? [`Tab Rekap "Nilai" pada dokumen "${folder.docTitle}"`] : []),
      ],
      confirmLabel: 'Konfirmasi & Tulis ke Docs',
      onConfirm: async () => {
        await writeTabsToGoogleDocs([{ folder, tab }]);
      },
    });
  };

  const requestBatchWriteDocs = () => {
    const items: Array<{ folder: FolderWorkspace; tab: DocTabRecord }> = [];
    for (const f of activeFolders) {
      for (const t of f.tabs) {
        if (!t.excluded && t.score !== null && t.googleTabId) {
          items.push({ folder: f, tab: t });
        }
      }
    }
    if (items.length === 0) {
      pushToast('Jalankan koreksi AI terlebih dahulu pada tab Google Docs Anda.', 'warning');
      return;
    }
    setPendingConfirmation({
      title: `Perbarui ${items.length} Tab Google Docs?`,
      description:
        'Aksi ini akan menulis/memperbarui blok hasil koreksi rubrik dan tabel kesalahan pada setiap tab siswa serta memperbarui Tab "Nilai" jika tersedia.',
      items: items.map(
        ({ folder, tab }) => `${folder.docTitle} · Tab "${tab.tabName}" (${tab.score}/100)`
      ),
      confirmLabel: `Perbarui ${items.length} Tab Docs`,
      onConfirm: async () => {
        await writeTabsToGoogleDocs(items);
      },
    });
  };

  const executeSyncGoogleSheet = async (records: FlattenedStudentRecord[]) => {
    const token = getAccessToken();
    if (!token) {
      pushToast('Sesi Google berakhir. Silakan masuk kembali.', 'warning');
      return;
    }

    const res = await fetch('/api/workspace/sync-sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rootFolderId: parsedFolderId,
        spreadsheetId: parsedSpreadsheetId || undefined,
        records,
        kkm,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Gagal menyinkronkan Google Sheets.');
    }

    setLastSpreadsheetUrl(data.spreadsheetUrl);
    if (data.spreadsheetId && !spreadsheetIdInput) {
      setSpreadsheetIdInput(data.spreadsheetId);
    }
    pushToast(
      `Berhasil menyinkronkan ${data.totalRows} baris siswa ke Google Sheet (${data.sheetNames.join(', ')}).`,
      'success'
    );
  };

  const requestSyncGoogleSheet = (records: FlattenedStudentRecord[]) => {
    if (records.length === 0) {
      pushToast('Belum ada data nilai untuk disinkronkan ke Google Sheet.', 'warning');
      return;
    }

    const uniqueClasses = Array.from(new Set(records.map((r) => r.folderName)));
    setPendingConfirmation({
      title: 'Sinkronkan Nilai ke Google Sheets?',
      description: parsedSpreadsheetId
        ? 'Sheet kelas pada Google Spreadsheet yang dipilih akan dibersihkan dan diisi ulang dengan data nilai terbaru.'
        : 'Sistem akan mencari atau membuat Google Spreadsheet "Rekapitulasi Nilai LKPD Otomatis" di folder Google Drive Anda lalu mengisi nilai per kelas.',
      items: [
        `Total baris siswa: ${records.length} siswa`,
        ...uniqueClasses.map((c) => `Sheet kelas: ${c}`),
      ],
      confirmLabel: 'Konfirmasi & Sinkronkan Sheet',
      onConfirm: async () => {
        await executeSyncGoogleSheet(records);
      },
    });
  };

  const buildAllRecords = (): FlattenedStudentRecord[] => {
    const out: FlattenedStudentRecord[] = [];
    for (const folder of activeFolders) {
      for (const tab of folder.tabs) {
        if (tab.excluded || tab.score === null) continue;
        const names = tab.members?.length ? tab.members : [tab.studentIdentity];
        for (const studentName of names) {
          const isTuntas = tab.score >= folder.kkm;
          out.push({
            folderId: folder.id,
            folderName: folder.folderName,
            docId: folder.docId,
            docTitle: folder.docTitle,
            studentName: studentName.toUpperCase(),
            tabName: tab.tabName,
            score: tab.score,
            predicate: tab.predicate,
            status:
              tab.status === 'KOSONG'
                ? 'Remedial (Belum Mengumpulkan)'
                : isTuntas
                ? 'Tuntas'
                : 'Remedial',
            isTuntas,
            recapNote: tab.recapNote,
          });
        }
      }
    }
    return out;
  };

  // KPI computations
  const kpi = useMemo(() => {
    const allTabs = activeFolders.flatMap((f) => f.tabs);
    const gradable = allTabs.filter((t) => !t.excluded);
    const graded = gradable.filter((t) => t.score !== null);
    const excludedCount = allTabs.filter((t) => t.excluded).length;
    const tuntasCount = graded.filter((t) => (t.score ?? 0) >= kkm).length;
    const remedialCount = graded.filter((t) => (t.score ?? 0) < kkm).length;
    const avg =
      graded.length > 0
        ? (graded.reduce((acc, t) => acc + (t.score ?? 0), 0) / graded.length)
            .toFixed(1)
            .replace('.', ',')
        : '0,0';
    const pct = graded.length > 0 ? Math.round((tuntasCount / graded.length) * 100) : 0;

    return {
      folderCount: activeFolders.length,
      gradableCount: gradable.length,
      gradedCount: graded.length,
      excludedCount,
      tuntasCount,
      remedialCount,
      avg,
      pct,
    };
  }, [activeFolders, kkm]);

  // Filtered table rows
  const filteredRows = useMemo(() => {
    const rows: Array<{ folder: FolderWorkspace; tab: DocTabRecord }> = [];
    const q = searchQuery.trim().toLowerCase();

    for (const folder of activeFolders) {
      if (filterFolderId !== 'ALL' && folder.id !== filterFolderId) continue;
      for (const tab of folder.tabs) {
        if (filterStatus === 'TUNTAS' && (tab.excluded || tab.score === null || tab.score < folder.kkm))
          continue;
        if (
          filterStatus === 'REMEDIAL' &&
          (tab.excluded || tab.score === null || tab.score >= folder.kkm || tab.status === 'KOSONG')
        )
          continue;
        if (filterStatus === 'KOSONG' && tab.status !== 'KOSONG') continue;
        if (filterStatus === 'BELUM_DIKOREKSI' && (tab.excluded || tab.score !== null)) continue;
        if (filterStatus === 'EXCLUDED' && !tab.excluded) continue;

        if (q) {
          const hay = `${folder.folderName} ${folder.docTitle} ${tab.tabName} ${tab.studentIdentity} ${tab.recapNote}`.toLowerCase();
          if (!hay.includes(q)) continue;
        }

        rows.push({ folder, tab });
      }
    }
    return rows;
  }, [activeFolders, filterFolderId, filterStatus, searchQuery]);

  const activeDrawerSelection = useMemo(() => {
    if (!selectedTabRef) return { folder: null, tab: null };
    const folder = activeFolders.find((f) => f.id === selectedTabRef.folderId) || null;
    const tab = folder?.tabs.find((t) => t.id === selectedTabRef.tabId) || null;
    return { folder, tab };
  }, [activeFolders, selectedTabRef]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeView={activeView}
        onChangeView={setActiveView}
        user={user}
        hasToken={hasToken}
        isSigningIn={isSigningIn}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Context Sub-bar */}
      <div className="bg-white border-b border-slate-200 no-print">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">
              {mode === 'workspace' ? rootFolderName : 'Pratinjau Data Contoh IPA'}
            </span>
            <span aria-hidden="true">·</span>
            <a
              href={`https://drive.google.com/drive/folders/${parsedFolderId || DEFAULT_ROOT_FOLDER_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-indigo-700 hover:underline"
            >
              <span>{(parsedFolderId || DEFAULT_ROOT_FOLDER_ID).slice(0, 12)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">KKM {kkm}</span>
            <span aria-hidden="true">·</span>
            <span>Pembaruan: {lastSyncTime}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mode === 'workspace' && hasToken ? (
              <button
                type="button"
                onClick={() => scanGoogleDrive()}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Memindai...' : 'Pindai Ulang Drive'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView('drive')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Hubungkan Folder Drive</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleBatchGradeAll}
              disabled={isBatchGrading || kpi.gradableCount === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isBatchGrading ? 'Mengoreksi AI...' : 'Jalankan Koreksi AI'}
              </span>
            </button>

            {mode === 'workspace' && hasToken && kpi.gradedCount > 0 && (
              <button
                type="button"
                onClick={requestBatchWriteDocs}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Simpan ke Docs</span>
              </button>
            )}
          </div>
        </div>

        {batchProgress && (
          <div className="bg-indigo-50 border-t border-indigo-200 px-4 sm:px-6 py-2">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-indigo-900 truncate">
                {batchProgress.label}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-40 sm:w-64 h-2 bg-indigo-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-indigo-600 transition-all duration-200"
                    style={{
                      width: `${
                        batchProgress.total > 0
                          ? Math.round((batchProgress.current / batchProgress.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono tabular-nums font-semibold text-indigo-900">
                  {batchProgress.current}/{batchProgress.total}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeView === 'dashboard' && (
          <>
            {/* KPI Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-medium text-slate-500">Dokumen Terpindai</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {kpi.folderCount}
                </div>
                <div className="text-xs text-slate-500 mt-1">Dokumen Google Docs</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-medium text-slate-500">Tab Dinilai</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {kpi.gradedCount}/{kpi.gradableCount}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {kpi.excludedCount} tab acuan dikecualikan
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-medium text-slate-500">Rata-Rata Nilai</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
                  {kpi.avg}
                </div>
                <div className="text-xs text-slate-500 mt-1">Skala 100 · KKM {kkm}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-medium text-slate-500">Tuntas</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                  {kpi.tuntasCount}
                </div>
                <div className="text-xs text-slate-500 mt-1">{kpi.pct}% memenuhi KKM</div>
              </div>

              <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-medium text-slate-500">Remedial / Kosong</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
                  {kpi.remedialCount}
                </div>
                <div className="text-xs text-slate-500 mt-1">Perlu tindak lanjut</div>
              </div>
            </div>

            {/* 2-Column Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Sidebar Struktur Folder */}
              <aside className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-800">Struktur Folder &amp; Dokumen</h2>
                  <button
                    type="button"
                    onClick={() => setFilterFolderId('ALL')}
                    className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
                  >
                    Semua
                  </button>
                </div>

                <div className="divide-y divide-slate-200">
                  {activeFolders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Belum ada dokumen terpindai. Buka menu Google Drive untuk memindai folder.
                    </div>
                  ) : (
                    activeFolders.map((f) => {
                      const activeTabs = f.tabs.filter((t) => !t.excluded);
                      const tuntas = activeTabs.filter(
                        (t) => t.score !== null && t.score >= f.kkm
                      ).length;
                      const isSelected = filterFolderId === f.id;

                      return (
                        <div
                          key={f.id}
                          className={`p-3.5 space-y-1.5 transition-colors ${
                            isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setFilterFolderId(isSelected ? 'ALL' : f.id)}
                              className="text-xs font-bold text-slate-900 hover:text-indigo-700 flex items-center gap-1.5 text-left truncate cursor-pointer"
                            >
                              <Folder className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="truncate">{f.folderName}</span>
                            </button>
                            <span className="text-[11px] font-mono tabular-nums text-emerald-700 font-semibold shrink-0">
                              {tuntas}/{activeTabs.length}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pl-5">
                            <a
                              href={f.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-600 hover:text-indigo-700 hover:underline flex items-center gap-1 truncate"
                            >
                              <FileText className="w-3 h-3 shrink-0" />
                              <span className="truncate">{f.docTitle}</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* Tabel Daftar Tab */}
              <div className="lg:col-span-9 space-y-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={filterFolderId}
                      onChange={(e) => setFilterFolderId(e.target.value)}
                      aria-label="Filter dokumen atau kelas"
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">Semua Folder / Dokumen</option>
                      {activeFolders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.folderName} · {f.docTitle}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      aria-label="Filter status"
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="TUNTAS">Tuntas (&ge; {kkm})</option>
                      <option value="REMEDIAL">Remedial (&lt; {kkm})</option>
                      <option value="KOSONG">Kosong / Belum Mengumpulkan</option>
                      <option value="BELUM_DIKOREKSI">Belum Dikoreksi AI</option>
                      <option value="EXCLUDED">Tab Acuan / Nilai</option>
                    </select>
                  </div>

                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari siswa, kelompok, atau tab..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Daftar Tab Google Docs &amp; Status Penilaian
                      </h3>
                      <p className="text-xs text-slate-500">
                        Klik baris tab untuk melihat rincian rubrik, mengedit jawaban uji, atau menulis hasil ke Google Docs.
                      </p>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
                      {filteredRows.length} tab
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs font-semibold">
                          <th className="py-3 px-4">Folder / Dokumen</th>
                          <th className="py-3 px-4">Nama Tab</th>
                          <th className="py-3 px-4">Identitas Siswa</th>
                          <th className="py-3 px-4 text-right">Nilai</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 min-w-[220px]">Fokus Perbaikan</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                              Tidak ada tab yang sesuai dengan filter saat ini.
                            </td>
                          </tr>
                        ) : (
                          filteredRows.map(({ folder, tab }) => {
                            const isTuntas = tab.score !== null && tab.score >= folder.kkm;
                            return (
                              <tr
                                key={tab.id}
                                onClick={() =>
                                  setSelectedTabRef({ folderId: folder.id, tabId: tab.id })
                                }
                                className="hover:bg-slate-50 cursor-pointer transition-colors align-top"
                              >
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-slate-900 text-xs">
                                    {folder.folderName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                                    {folder.docTitle}
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-semibold text-indigo-700 text-xs">
                                  {tab.tabName}
                                </td>
                                <td className="py-3 px-4 text-xs text-slate-800">
                                  {tab.studentIdentity}
                                </td>
                                <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                                  {tab.excluded || tab.score === null ? (
                                    <span className="text-slate-400">—</span>
                                  ) : tab.status === 'KOSONG' ? (
                                    <span className="text-red-600">0</span>
                                  ) : (
                                    <span
                                      className={
                                        isTuntas ? 'text-emerald-700' : 'text-amber-700'
                                      }
                                    >
                                      {tab.score}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-xs">
                                  {tab.excluded ? (
                                    <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                      <span>{tab.exclusionReason || 'Acuan'}</span>
                                    </span>
                                  ) : tab.status === 'KOSONG' ? (
                                    <span className="inline-flex items-center gap-1.5 text-red-700 font-semibold">
                                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span>Kosong</span>
                                    </span>
                                  ) : tab.score === null ? (
                                    <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                                      <Clock className="w-3.5 h-3.5 shrink-0" />
                                      <span>Belum Dikoreksi</span>
                                    </span>
                                  ) : isTuntas ? (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>{tab.predicate} · Tuntas</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                      <span>{tab.predicate} · Remedial</span>
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-xs text-slate-600 leading-relaxed">
                                  {tab.recapNote}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTabRef({ folderId: folder.id, tabId: tab.id });
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                                  >
                                    <span>Detail</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'recap' && (
          <RecapView
            folders={activeFolders}
            mode={mode}
            lastSpreadsheetUrl={lastSpreadsheetUrl}
            onCopySuccess={(msg) => pushToast(msg, 'success')}
            onRequestSyncSheet={requestSyncGoogleSheet}
          />
        )}

        {activeView === 'drive' && (
          <DriveSetupView
            user={user}
            hasToken={hasToken}
            isSigningIn={isSigningIn}
            onSignIn={handleSignIn}
            folderInput={folderInput}
            onFolderInputChange={setFolderInput}
            parsedFolderId={parsedFolderId}
            kkm={kkm}
            onKkmChange={setKkm}
            spreadsheetIdInput={spreadsheetIdInput}
            onSpreadsheetIdChange={setSpreadsheetIdInput}
            mode={mode}
            onSwitchMode={(newMode) => {
              setMode(newMode);
              setFilterFolderId('ALL');
              pushToast(
                newMode === 'workspace'
                  ? 'Beralih ke mode Google Workspace Live.'
                  : 'Beralih ke mode Data Contoh untuk pengujian rubrik.',
                'info'
              );
            }}
            isScanning={isScanning}
            isBatchGrading={isBatchGrading}
            batchProgress={batchProgress}
            folders={activeFolders}
            onScanDrive={() => scanGoogleDrive()}
            onBatchGradeAll={handleBatchGradeAll}
            onRequestBatchWriteDocs={requestBatchWriteDocs}
            onRequestSyncAllSheets={() => requestSyncGoogleSheet(buildAllRecords())}
          />
        )}

        {activeView === 'appscript' && (
          <GasDeployView
            folderId={parsedFolderId || DEFAULT_ROOT_FOLDER_ID}
            kkm={kkm}
            onCopied={(msg) => pushToast(msg, 'success')}
          />
        )}
      </main>

      <TabDetailDrawer
        folder={activeDrawerSelection.folder}
        tab={activeDrawerSelection.tab}
        mode={mode}
        isGrading={isGradingSingle}
        onClose={() => setSelectedTabRef(null)}
        onRegradeTab={handleRegradeSingleTab}
        onRequestWriteToDocs={requestWriteSingleTab}
      />

      <ConfirmationModal
        confirmation={pendingConfirmation}
        onClose={() => setPendingConfirmation(null)}
      />

      {/* Toast Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const styleMap = {
            success: 'bg-emerald-800 text-white',
            warning: 'bg-amber-700 text-white',
            error: 'bg-red-700 text-white',
            info: 'bg-slate-900 text-white',
          };
          return (
            <div
              key={t.id}
              className={`${styleMap[t.type]} px-4 py-3 rounded-lg shadow-lg text-xs font-medium pointer-events-auto`}
            >
              {t.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

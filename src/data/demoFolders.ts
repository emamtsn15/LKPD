import { FolderWorkspace } from '../types';

export const DEFAULT_ROOT_FOLDER_ID = '1rjmYpNU6PJjkhK0vyOV9BCADtTkVSiUL';
export const MARKER_START = '=== HASIL KOREKSI, RUBRIK & UMPAN BALIK GURU ===';

export const DEMO_FOLDERS: FolderWorkspace[] = [
  {
    id: 'sub-vii3',
    folderName: 'Kelas VII-3 — IPA',
    docId: '1f0mpNz68aY-qYdQwBlg0LxPpBzws2W7jc6mN2i0KdqE',
    docTitle: '7.3 CP4 Pengukuran & Konversi Satuan Suhu',
    docUrl: 'https://docs.google.com/document/d/1f0mpNz68aY-qYdQwBlg0LxPpBzws2W7jc6mN2i0KdqE/edit',
    kkm: 80,
    rubricSummary:
      'Konsep Skala Suhu (20%), Pengukuran & Konversi H (25%), Latihan Tim & Kuis (25%), Analisis & Berpikir Kritis (20%), Kesimpulan & Refleksi (10%)',
    tabs: [
      {
        id: 'vii3-materi',
        tabName: 'Materi',
        excluded: true,
        exclusionReason: 'Tab Pertama (Materi Acuan)',
        studentIdentity: 'Materi Ajar Suhu & Termometer',
        members: [],
        score: null,
        predicate: '-',
        status: 'EXCLUDED',
        studentAnswerSnippet: 'Perbandingan skala C : R : (F - 32) : (K - 273) = 5 : 4 : 9 : 5.',
        rubricBreakdown: [],
        errorTable: [],
        teacherFeedback: '',
        recapNote: 'Tab pertama (Materi) otomatis dilewati sistem.',
      },
      {
        id: 'vii3-nilai',
        tabName: 'Nilai',
        excluded: true,
        exclusionReason: 'Tab Rekapitulasi Otomatis',
        studentIdentity: 'Rekapitulasi Siswa Kelas VII-3',
        members: [],
        score: null,
        predicate: '-',
        status: 'EXCLUDED',
        studentAnswerSnippet: 'Tabel rekapitulasi nilai siswa kelas VII-3 yang diperbarui otomatis.',
        rubricBreakdown: [],
        errorTable: [],
        teacherFeedback: '',
        recapNote: 'Tab target penulisan rekapitulasi nilai & tindak lanjut.',
      },
      {
        id: 'vii3-tab3',
        tabName: '3 (Kelompok 3)',
        excluded: false,
        studentIdentity: 'Kelompok 3: Adhwa Amira Jasmine, Desy Afriyani, Ajeng Apriliana',
        members: ['Adhwa Amira Jasmine', 'Desy Afriyani', 'Ajeng Apriliana'],
        score: 86,
        predicate: 'B',
        status: 'TUNTAS',
        studentAnswerSnippet:
          'Bagian B, C, F (0°C-100°C, 0°R-80°R, 32°F-212°F, 273 K-373 K) benar. Bagian H: Sampel A = 30°C (24°R, 86°F, 303 K), Sampel B = 55°C (44°R, 131°F, 328 K), namun langkah perhitungannya belum ditulis. Latihan Tim No. 2 jawaban tertulis 140°F (di langkah hitung 104°F). Kuis individu belum diisi.',
        rubricBreakdown: [
          { aspect: 'Pemahaman Konsep & Titik Tetap (F)', max: 20, score: 20, note: 'Titik beku & didih 4 skala suhu tepat dengan satuan baku.' },
          { aspect: 'Pengukuran & Konversi Sampel (H)', max: 25, score: 20, note: 'Hasil tabel tepat, tetapi langkah hitung konversi belum dituliskan.' },
          { aspect: 'Latihan Konversi Tim & Kuis (Keg. 3)', max: 25, score: 19, note: 'Salah ketik jawaban No. 2 (140°F) dan kuis individu kosong.' },
          { aspect: 'Analisis & Berpikir Kritis (J-K)', max: 20, score: 19, note: 'Perbandingan suhu dan pembuktian kesetaraan sangat jelas.' },
          { aspect: 'Kesimpulan & Refleksi (L-M)', max: 10, score: 8, note: 'Kesimpulan sesuai hipotesis; refleksi perlu diperdalam.' },
        ],
        errorTable: [
          {
            part: 'Bagian H — Langkah Konversi Sampel A & B',
            current: 'Hanya terisi angka hasil di tabel (24°R, 86°F, 303 K), kolom langkah hitung kosong.',
            explanation: 'Proses matematis konversi dari Celcius ke Reamur, Fahrenheit, dan Kelvin belum ditampilkan.',
            fix: 'Tuliskan rumus dan substitusi angkanya, misal Sampel A (30°C): tR = 4/5 × 30 = 24°R; tF = (9/5 × 30) + 32 = 86°F; T = 30 + 273 = 303 K.',
          },
          {
            part: 'Kegiatan 3 — Latihan Tim No. 2 & Kuis Individu',
            current: 'Kolom jawaban No. 2 tertulis 140°F; Kuis Individu kosong.',
            explanation: 'Terjadi kesalahan ketik transposisi angka (104°F tertulis 140°F) dan bagian kuis belum dikerjakan.',
            fix: 'Ubah jawaban No. 2 menjadi 104°F sesuai langkah hitung ((9/5 × 40) + 32 = 104°F) serta lengkapi soal Kuis Individu.',
          },
        ],
        teacherFeedback:
          'Hasil kerja Kelompok 3 sudah melampaui KKTP (86 — Tuntas). Lengkapi langkah hitung pada Bagian H dan perbaiki salah ketik 104°F agar dokumentasi belajar semakin sempurna.',
        recapNote: 'Lengkapi langkah hitung konversi sampel A/B, perbaiki typo 140°F → 104°F di No. 2, dan isi Kuis Individu.',
      },
      {
        id: 'vii3-tab4',
        tabName: '4 (Kelompok 4)',
        excluded: false,
        studentIdentity: 'Kelompok 4: Vallcyo Okta Aymar, Diaz Adi Saputra',
        members: ['Vallcyo Okta Aymar', 'Diaz Adi Saputra'],
        score: 68,
        predicate: 'D',
        status: 'REMEDIAL',
        studentAnswerSnippet:
          'Bagian B, C, tabel & langkah konversi H, Latihan Tim (6 soal), dan Kuis Individu (5 soal) terisi lengkap. Penulisan Kelvin memakai tanda derajat (273°K, 303°K). Bagian Analisis (J), Berpikir Kritis (K), Kesimpulan (L), dan Refleksi (M) masih kosong seluruhnya.',
        rubricBreakdown: [
          { aspect: 'Pemahaman Konsep & Titik Tetap (F)', max: 20, score: 17, note: 'Konsep angka tepat, namun Kelvin ditulis memakai tanda derajat (°K).' },
          { aspect: 'Pengukuran & Konversi Sampel (H)', max: 25, score: 24, note: 'Data dan langkah perhitungan sampel A & B sangat lengkap.' },
          { aspect: 'Latihan Konversi Tim & Kuis (Keg. 3)', max: 25, score: 25, note: 'Seluruh 6 soal latihan tim dan 5 soal kuis benar.' },
          { aspect: 'Analisis & Berpikir Kritis (J-K)', max: 20, score: 2, note: 'Bagian J dan K belum dikerjakan.' },
          { aspect: 'Kesimpulan & Refleksi (L-M)', max: 10, score: 0, note: 'Bagian L dan M kosong.' },
        ],
        errorTable: [
          {
            part: 'Bagian F & H — Penulisan Satuan Kelvin',
            current: '273°K, 373°K, 303°K, 333°K',
            explanation: 'Dalam Sistem Internasional (SI), satuan Kelvin merupakan skala mutlak sehingga tidak menggunakan tanda derajat (°).',
            fix: 'Hapus tanda derajat dan tulis menggunakan huruf kapital K saja: 273 K, 373 K, 303 K, dan 333 K.',
          },
          {
            part: 'Bagian J, K, L, dan M (Analisis s.d. Refleksi)',
            current: '[Kosong / Belum diisi]',
            explanation: 'Tahap penarikan makna dari data eksperimen dan refleksi belum dikerjakan sehingga kehilangan 30 poin bobot penilaian.',
            fix: 'Isi Bagian J dengan membandingkan suhu Sampel B (60°C) dan Sampel A (30°C), buktikan kesetaraan suhu pada Bagian K, lalu tulis kesimpulan di Bagian L dan refleksi di Bagian M.',
          },
        ],
        teacherFeedback:
          'Kemampuan berhitung konversi suhu kalian sudah sangat kuat (skor maksimal pada Kegiatan 3). Segera lengkapi Bagian J, K, L, dan M serta hapus tanda derajat pada Kelvin agar nilai naik melampaui KKM 80.',
        recapNote: 'Hapus tanda derajat pada Kelvin (°K → K) serta kerjakan Bagian J (Analisis), K (Berpikir Kritis), L (Kesimpulan), dan M (Refleksi).',
      },
      {
        id: 'vii3-khayla',
        tabName: 'KHAYLA KURNIA PURNAMA SARI',
        excluded: false,
        studentIdentity: 'Khayla Kurnia Purnama Sari (Individu)',
        members: ['Khayla Kurnia Purnama Sari'],
        score: 80,
        predicate: 'B',
        status: 'TUNTAS',
        studentAnswerSnippet:
          'Bagian B, C, F, Latihan Tim (6 soal), J.2-J.4, K, L, M terisi sangat baik. Bagian H pengamatan Sampel A = 31°C dan Sampel B = 50°C terisi, namun tabel konversi ke °R, °F, K beserta langkah hitungnya kosong. Pada J.1 tertulis sampel bersuhu lebih tinggi adalah 31°C.',
        rubricBreakdown: [
          { aspect: 'Pemahaman Konsep & Titik Tetap (F)', max: 20, score: 20, note: 'Lengkap dan sesuai aturan penulisan satuan.' },
          { aspect: 'Pengukuran & Konversi Sampel (H)', max: 25, score: 10, note: 'Data Celcius terisi, namun tabel konversi & langkah hitung kosong.' },
          { aspect: 'Latihan Konversi Tim & Kuis (Keg. 3)', max: 25, score: 21, note: 'Langkah hitung benar, salah ketik 140°F di jawaban No. 2; kuis kosong.' },
          { aspect: 'Analisis & Berpikir Kritis (J-K)', max: 20, score: 19, note: 'Analisis mendalam; perlu koreksi angka pada J.1.' },
          { aspect: 'Kesimpulan & Refleksi (L-M)', max: 10, score: 10, note: 'Sangat runtut dan reflektif.' },
        ],
        errorTable: [
          {
            part: 'Bagian H — Tabel & Langkah Konversi Sampel A & B',
            current: 'Sampel A = 31°C, Sampel B = 50°C (kolom °R, °F, K dan langkah hitung kosong).',
            explanation: 'Data hasil pengukuran Celcius belum dikonversi ke tiga skala termometer lainnya.',
            fix: 'Hitung konversi Sampel A (31°C = 24,8°R = 87,8°F = 304 K) dan Sampel B (50°C = 40°R = 122°F = 323 K) beserta langkahnya.',
          },
          {
            part: 'Bagian J.1 — Analisis Perbandingan Suhu',
            current: 'Sampel bersuhu lebih tinggi adalah 31°C.',
            explanation: 'Tidak konsisten dengan data pengamatan Bagian H karena 50°C (Sampel B) lebih tinggi daripada 31°C (Sampel A).',
            fix: 'Perbaiki menjadi: Sampel yang bersuhu lebih tinggi adalah Sampel B (50°C) dengan selisih 19°C lebih panas dari Sampel A (31°C).',
          },
        ],
        teacherFeedback:
          'Selamat Khayla, pemahaman konsep dan analisis kamu sangat baik dan telah mencapai KKM (80 — Tuntas). Lengkapi konversi Bagian H dan perbaiki angka pada J.1 untuk nilai optimal.',
        recapNote: 'Isi konversi sampel A (31°C) & B (50°C) di Bagian H, perbaiki J.1 (50°C > 31°C), dan lengkapi Kuis Individu.',
      },
    ],
  },
  {
    id: 'sub-vii4',
    folderName: 'Kelas VII-4 — IPA',
    docId: '17Z4X4wnISILKoWCk7OzOLO4l63DqItF3wXPpk76P0Fc',
    docTitle: '7.4 Metode Ilmiah',
    docUrl: 'https://docs.google.com/document/d/17Z4X4wnISILKoWCk7OzOLO4l63DqItF3wXPpk76P0Fc/edit',
    kkm: 80,
    rubricSummary: 'Card Sorting 8 Langkah Metode Ilmiah (50%) + Gallery Walk Penerapan Eksperimen (50%)',
    tabs: [
      {
        id: 'vii4-pos',
        tabName: 'POS',
        excluded: true,
        exclusionReason: 'Tab Pertama (Petunjuk Operasional)',
        studentIdentity: 'Petunjuk Penggunaan LKPD Digital',
        members: [],
        score: null,
        predicate: '-',
        status: 'EXCLUDED',
        studentAnswerSnippet: 'Petunjuk pengerjaan LKPD kolaboratif multi-tab.',
        rubricBreakdown: [],
        errorTable: [],
        teacherFeedback: '',
        recapNote: 'Tab pertama (POS) otomatis dikecualikan dari penilaian.',
      },
      {
        id: 'vii4-nilai',
        tabName: 'Nilai',
        excluded: true,
        exclusionReason: 'Tab Rekapitulasi Otomatis',
        studentIdentity: 'Daftar Siswa Kelas VII-4',
        members: [],
        score: null,
        predicate: '-',
        status: 'EXCLUDED',
        studentAnswerSnippet: 'Tabel rekapitulasi nilai Metode Ilmiah kelas VII-4.',
        rubricBreakdown: [],
        errorTable: [],
        teacherFeedback: '',
        recapNote: 'Tab target sinkronisasi rekapitulasi kelas VII-4.',
      },
      {
        id: 'vii4-kel3',
        tabName: 'Kelompok 3=92',
        excluded: false,
        studentIdentity: 'Kelompok 3: M. Faqih Fakhrullah, Raka Putra Pratama, Althaf Fahrizi, Ahmad Reyhan',
        members: ['M. Faqih Fakhrullah', 'Raka Putra Pratama', 'Althaf Fahrizi', 'Ahmad Reyhan'],
        score: 92,
        predicate: 'A',
        status: 'TUNTAS',
        studentAnswerSnippet:
          'Card Sorting langkah 1-6 urut & akurat, namun No. 7 (Mengkomunikasikan hasil) dan No. 8 (Menarik Kesimpulan) terbalik. Gallery Walk pengaruh jenis air terhadap pertumbuhan kecambah sangat runtut dan jelas.',
        rubricBreakdown: [
          { aspect: 'Card Sorting (Urutan, Penjelasan & Contoh)', max: 50, score: 45, note: 'Langkah 1-6 sangat tepat; hanya posisi No. 7 dan No. 8 yang tertukar.' },
          { aspect: 'Gallery Walk (Penerapan Eksperimen)', max: 50, score: 47, note: 'Rancangan percobaan kecambah sangat sistematis; tambahkan angka hasil ukur.' },
        ],
        errorTable: [
          {
            part: 'Card Sorting & Gallery Walk — No. 7 dan No. 8',
            current: 'No. 7: Mengkomunikasikan hasil | No. 8: Menarik Kesimpulan',
            explanation: 'Dalam metode ilmiah, peneliti harus menarik kesimpulan dari analisis data terlebih dahulu sebelum mengomunikasikan hasilnya kepada orang lain.',
            fix: 'Tukar posisi keduanya menjadi No. 7: Menarik Kesimpulan, dan No. 8: Mengkomunikasikan Hasil.',
          },
        ],
        teacherFeedback:
          'Kinerja luar biasa (92 — Predikat A / Tuntas)! Hanya perlu menukar urutan langkah 7 dan 8 agar alur metode ilmiah baku sepenuhnya.',
        recapNote: 'Tukar urutan langkah 7 (Menarik Kesimpulan) dan langkah 8 (Mengkomunikasikan Hasil).',
      },
      {
        id: 'vii4-zahra',
        tabName: '79=Zahra',
        excluded: false,
        studentIdentity: 'Aulia Zahra Ramadhani (Individu)',
        members: ['Aulia Zahra Ramadhani'],
        score: 67,
        predicate: 'D',
        status: 'REMEDIAL',
        studentAnswerSnippet:
          'Card Sorting: No. 6 dan No. 7 keduanya diisi Mengumpulkan dan Menganalisis Data sehingga kehilangan langkah Mengkomunikasikan Hasil, dan contoh diulang sama (Mengamati es mencair). Gallery Walk: percobaan pengaruh suhu air terhadap waktu pelarutan gula (10°C = 120 dtk, 40°C = 45 dtk, 80°C = 15 dtk) sangat bagus, hanya No. 4-5 dan No. 6-7 terbalik.',
        rubricBreakdown: [
          { aspect: 'Card Sorting (Urutan, Penjelasan & Contoh)', max: 50, score: 22, note: 'Langkah 6-7 duplikat, kehilangan Mengkomunikasikan hasil, contoh berulang.' },
          { aspect: 'Gallery Walk (Penerapan Eksperimen)', max: 50, score: 45, note: 'Data kuantitatif waktu larut gula sangat kuat; rapikan urutan No. 4-7.' },
        ],
        errorTable: [
          {
            part: 'Card Sorting — No. 6, No. 7 & Kolom Contoh (No. 3–8)',
            current: 'No. 6 & 7 sama-sama "Mengumpulkan dan Menganalisis Data"; contoh No. 3-8 diulang "Mengamati es mencair".',
            explanation: 'Terjadi duplikasi langkah analisis data sehingga tahapan Mengkomunikasikan Hasil hilang, dan contoh tidak disesuaikan dengan masing-masing tahap.',
            fix: 'Ubah No. 7 menjadi Menarik Kesimpulan dan No. 8 menjadi Mengkomunikasikan Hasil, serta sesuaikan contoh tiap baris.',
          },
          {
            part: 'Gallery Walk — Urutan No. 4–5 dan No. 6–7',
            current: 'No. 4 Melakukan Percobaan sebelum No. 5 Merancang; No. 6 Kesimpulan sebelum No. 7 Analisis Data.',
            explanation: 'Rancangan percobaan harus dibuat sebelum eksperimen dilakukan, dan data harus dianalisis sebelum menarik kesimpulan.',
            fix: 'Urutkan menjadi: (4) Merancang Percobaan → (5) Melakukan Percobaan → (6) Mengumpulkan & Menganalisis Data → (7) Menarik Kesimpulan → (8) Mengkomunikasikan Hasil.',
          },
        ],
        teacherFeedback:
          'Eksperimen mandiri kamu tentang kelarutan gula pada berbagai suhu (120 dtk, 45 dtk, 15 dtk) sangat ilmiah! Perbaiki bagian Card Sorting dan urutan Gallery Walk agar nilaimu naik melampaui KKM 80.',
        recapNote: 'Perbaiki duplikasi Card Sorting No. 6–7, sesuaikan contoh tiap langkah, dan rapikan urutan Gallery Walk No. 4–7.',
      },
      {
        id: 'vii4-hanifah',
        tabName: 'Hanifah Nafisyah (Belum Mengumpulkan)',
        excluded: false,
        studentIdentity: 'Hanifah Nafisyah (Individu)',
        members: ['Hanifah Nafisyah'],
        score: 0,
        predicate: 'D',
        status: 'KOSONG',
        studentAnswerSnippet: '',
        rubricBreakdown: [
          { aspect: 'Card Sorting (Urutan, Penjelasan & Contoh)', max: 50, score: 0, note: 'Belum ada jawaban yang dikumpulkan.' },
          { aspect: 'Gallery Walk (Penerapan Eksperimen)', max: 50, score: 0, note: 'Belum ada jawaban yang dikumpulkan.' },
        ],
        errorTable: [
          {
            part: 'Seluruh Lembar Kerja LKPD',
            current: '[Kosong / Belum mengumpulkan]',
            explanation: 'Siswa belum mengisi tab lembar kerja Metode Ilmiah.',
            fix: 'Segera lengkapi kegiatan Card Sorting (8 langkah metode ilmiah) dan Gallery Walk pada tab masing-masing agar dapat dikoreksi ulang otomatis oleh sistem.',
          },
        ],
        teacherFeedback:
          'Hanifah belum mengumpulkan LKPD Metode Ilmiah. Silakan segera kerjakan pada tab Google Docs agar sistem dapat langsung mengoreksi dan memperbarui nilaimu.',
        recapNote: 'Belum mengumpulkan LKPD — segera kerjakan seluruh bagian Card Sorting dan Gallery Walk.',
      },
    ],
  },
];

export function buildGasSourceCode(folderId: string, kkm: number, triggerHour: number): string {
  const safeFolderId = folderId || DEFAULT_ROOT_FOLDER_ID;
  return `/**
 * ============================================================================
 * PORTAL OTOMATISASI KOREKSI & PENILAIAN LKPD MULTI-FOLDER GOOGLE DRIVE
 * ============================================================================
 * Fitur Utama:
 * 1. Pemindaian rekursif seluruh subfolder & file Google Docs di Folder Induk:
 *    https://drive.google.com/drive/folders/${safeFolderId}
 * 2. Koreksi Ulang Harian Otomatis (Smart Upsert):
 *    - Mengecualikan tab pertama (POS/Materi) serta tab acuan/rekap (RPP, LKPD, Contoh, Nilai).
 *    - Membaca jawaban asli siswa di atas penanda koreksi, mengoreksi ulang via Gemini API,
 *      dan memperbarui blok nilai + tabel penjelasan kesalahan tanpa duplikasi.
 * 3. Penulisan otomatis rekapitulasi nilai & tindak lanjut ke Tab "Nilai" tiap Google Docs
 *    sekaligus menyinkronkan ke Google Sheet Rekapitulasi Per Kelas.
 */

const CONFIG = {
  ROOT_FOLDER_ID: '${safeFolderId}',
  GEMINI_API_KEY: PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '',
  GEMINI_MODEL: 'gemini-2.5-flash',
  REKAP_SPREADSHEET_ID: '', // Kosongkan '' agar otomatis membuat Google Sheet baru di Folder Induk
  KKM: ${kkm},
  SKIP_FIRST_TAB: true,
  SKIP_FILE_KEYWORDS: ['rpp', 'materi', 'pos', 'contoh', 'template', 'master'],
  SKIP_TAB_KEYWORDS: ['materi', 'pos', 'rpp', 'nilai', 'rekap', 'lkpd', 'contoh'],
  MARKER_START: '${MARKER_START}'
};

function pasangTriggerHarian() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'jalankanKoreksiSeluruhFolder') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('jalankanKoreksiSeluruhFolder')
    .timeBased()
    .everyDays(1)
    .atHour(${triggerHour})
    .create();

  Logger.log('Trigger harian berhasil dipasang untuk pukul ${String(triggerHour).padStart(2, '0')}:00 setiap hari.');
}

function jalankanKoreksiSeluruhFolder() {
  if (!CONFIG.GEMINI_API_KEY) {
    throw new Error('Simpan GEMINI_API_KEY di Project Settings -> Script Properties terlebih dahulu.');
  }
  const rootFolder = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  const ss = getOrCreateRekapSpreadsheet(rootFolder);
  const logSummary = [];

  pindaiFolderRekursif(rootFolder, rootFolder.getName(), ss, logSummary);
  Logger.log('Selesai memproses ' + logSummary.length + ' tab.');
  return logSummary;
}

function pindaiFolderRekursif(folder, pathKelas, ss, logSummary) {
  const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
  while (files.hasNext()) {
    const file = files.next();
    if (isExcludedName(file.getName(), CONFIG.SKIP_FILE_KEYWORDS)) continue;

    const hasilDokumen = prosesSatuDokumenMultiTab(file, pathKelas);
    perbaruiTabNilaiDiDokumen(file.getId(), hasilDokumen);
    sinkronKeGoogleSheetKelas(ss, pathKelas, file.getName(), hasilDokumen);
    logSummary.push(...hasilDokumen);
  }

  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    const sub = subFolders.next();
    pindaiFolderRekursif(sub, sub.getName(), ss, logSummary);
  }
}

function prosesSatuDokumenMultiTab(file, pathKelas) {
  const doc = DocumentApp.openById(file.getId());
  const tabs = typeof doc.getTabs === 'function' ? doc.getTabs() : [];
  const hasilSemuaTab = [];

  tabs.forEach((tab, idx) => {
    const tabTitle = tab.getTitle();
    if (CONFIG.SKIP_FIRST_TAB && idx === 0) return;
    if (isExcludedName(tabTitle, CONFIG.SKIP_TAB_KEYWORDS)) return;

    const docTab = tab.asDocumentTab();
    if (!docTab) return;

    const body = docTab.getBody();
    const jawabanAsliSiswa = hapusBlokKoreksiLamaDanAmbilTeks(body);

    if (!jawabanAsliSiswa.trim()) {
      hasilSemuaTab.push({
        kelas: pathKelas,
        namaFile: file.getName(),
        namaTab: tabTitle,
        identitas: tabTitle,
        anggota: [tabTitle],
        nilaiAkhir: 0,
        predikat: 'D',
        status: 'Remedial (Belum Mengumpulkan)',
        ringkasanPerbaikan: 'Tab kosong — siswa belum mengisi lembar kerja.'
      });
      return;
    }

    const evaluasi = panggilGeminiKoreksi(file.getName(), tabTitle, jawabanAsliSiswa);
    sisipkanBlokKoreksiKeBody(body, evaluasi);

    hasilSemuaTab.push({
      kelas: pathKelas,
      namaFile: file.getName(),
      namaTab: tabTitle,
      identitas: evaluasi.identitas || tabTitle,
      anggota: evaluasi.anggota_individu || [evaluasi.identitas || tabTitle],
      nilaiAkhir: evaluasi.nilai_akhir || 0,
      predikat: evaluasi.predikat || 'D',
      status: (evaluasi.nilai_akhir || 0) >= CONFIG.KKM ? 'Tuntas' : 'Remedial',
      ringkasanPerbaikan: evaluasi.ringkasan_perbaikan || '-'
    });
  });

  doc.saveAndClose();
  return hasilSemuaTab;
}

function hapusBlokKoreksiLamaDanAmbilTeks(body) {
  const numChildren = body.getNumChildren();
  let markerIndex = -1;

  for (let i = 0; i < numChildren; i++) {
    const child = body.getChild(i);
    if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      if (child.asParagraph().getText().indexOf(CONFIG.MARKER_START) !== -1) {
        markerIndex = i;
        break;
      }
    }
  }

  if (markerIndex !== -1) {
    for (let j = numChildren - 1; j >= markerIndex; j--) {
      body.removeChild(body.getChild(j));
    }
  }

  return body.getText();
}

function panggilGeminiKoreksi(namaDokumen, namaTab, teksJawaban) {
  const endpoint = \`https://generativelanguage.googleapis.com/v1beta/models/\${CONFIG.GEMINI_MODEL}:generateContent?key=\${CONFIG.GEMINI_API_KEY}\`;
  const prompt = \`Koreksi dan nilai lembar kerja siswa berikut secara objektif (Skala 0-100, KKM = \${CONFIG.KKM}).
Predikat: A (90-100), B (80-89), C (70-79), D (<70).
Keluarkan JSON valid:
{
  "identitas": "Nama siswa atau daftar anggota kelompok",
  "anggota_individu": ["Nama Siswa 1"],
  "nilai_akhir": 0,
  "predikat": "D",
  "rincian_rubrik": [{"aspek": "...", "skor_maks": 25, "skor": 0, "catatan": "..."}],
  "tabel_kesalahan": [{"bagian_no": "...", "jawaban_siswa": "...", "penjelasan_kesalahan": "...", "cara_perbaikan": "..."}],
  "umpan_balik_guru": "...",
  "ringkasan_perbaikan": "..."
}
Dokumen: \${namaDokumen} | Tab: \${namaTab}
Jawaban Siswa:
\${teksJawaban.substring(0, 28000)}\`;

  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
    })
  });

  const json = JSON.parse(response.getContentText());
  return JSON.parse(json.candidates[0].content.parts[0].text);
}

function sisipkanBlokKoreksiKeBody(body, ev) {
  const waktu = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');
  const status = (ev.nilai_akhir || 0) >= CONFIG.KKM ? 'TUNTAS' : 'REMEDIAL';

  body.appendParagraph('\\n' + CONFIG.MARKER_START).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(\`Diperbarui Otomatis: \${waktu} WIB | Identitas: \${ev.identitas}\`);
  body.appendParagraph(\`Nilai Akhir: \${ev.nilai_akhir}/100 | Predikat: \${ev.predikat} | Status: \${status} (KKM >= \${CONFIG.KKM})\`);

  if (ev.rincian_rubrik && ev.rincian_rubrik.length) {
    body.appendParagraph('1. Rincian Skor Rubrik').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const rows = [['Aspek Penilaian', 'Skor Maks', 'Skor', 'Catatan']];
    ev.rincian_rubrik.forEach(r => rows.push([r.aspek, String(r.skor_maks), String(r.skor), r.catatan]));
    body.appendTable(rows);
  }

  if (ev.tabel_kesalahan && ev.tabel_kesalahan.length) {
    body.appendParagraph('2. Tabel Penjelasan Kesalahan Jawaban & Cara Memperbaikinya').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const errRows = [['Bagian / No. Soal', 'Jawaban Siswa Saat Ini', 'Penjelasan Kesalahan', 'Cara Perbaikan yang Benar']];
    ev.tabel_kesalahan.forEach(e => errRows.push([e.bagian_no, e.jawaban_siswa, e.penjelasan_kesalahan, e.cara_perbaikan]));
    body.appendTable(errRows);
  }

  body.appendParagraph('3. Umpan Balik & Tindak Lanjut Guru').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(ev.umpan_balik_guru || '-');
}

function perbaruiTabNilaiDiDokumen(docId, hasilSemuaTab) {
  const doc = DocumentApp.openById(docId);
  if (typeof doc.getTabs !== 'function') return;

  const tabNilai = doc.getTabs().find(t => t.getTitle().toLowerCase().includes('nilai'));
  if (!tabNilai) return;

  const body = tabNilai.asDocumentTab().getBody();
  const marker = '=== REKAPITULASI KOREKSI OTOMATIS HARIAN ===';
  hapusBlokDariPenanda(body, marker);

  const waktu = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');
  body.appendParagraph('\\n' + marker).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(\`Sinkronisasi Terakhir: \${waktu} WIB\`);

  const tableData = [['Nama Tab', 'Identitas Siswa / Kelompok', 'Nilai', 'Predikat', 'Status', 'Tindak Lanjut Perbaikan']];
  hasilSemuaTab.forEach(h => {
    tableData.push([h.namaTab, h.identitas, String(h.nilaiAkhir), h.predikat, h.status, h.ringkasanPerbaikan]);
  });
  body.appendTable(tableData);
  doc.saveAndClose();
}

function hapusBlokDariPenanda(body, markerText) {
  const total = body.getNumChildren();
  for (let i = 0; i < total; i++) {
    const el = body.getChild(i);
    if (el.getType() === DocumentApp.ElementType.PARAGRAPH && el.asParagraph().getText().indexOf(markerText) !== -1) {
      for (let j = total - 1; j >= i; j--) body.removeChild(body.getChild(j));
      break;
    }
  }
}

function getOrCreateRekapSpreadsheet(rootFolder) {
  if (CONFIG.REKAP_SPREADSHEET_ID) return SpreadsheetApp.openById(CONFIG.REKAP_SPREADSHEET_ID);
  const namaSheet = 'Rekapitulasi Nilai LKPD Otomatis - ' + rootFolder.getName();
  const existing = rootFolder.getFilesByName(namaSheet);
  if (existing.hasNext()) return SpreadsheetApp.openById(existing.next().getId());
  const ss = SpreadsheetApp.create(namaSheet);
  DriveApp.getFileById(ss.getId()).moveTo(rootFolder);
  return ss;
}

function sinkronKeGoogleSheetKelas(ss, namaKelas, namaDokumen, hasilSemuaTab) {
  const sheetName = namaKelas.substring(0, 30);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  sheet.clearContents();
  sheet.appendRow(['NO', 'KELAS / FOLDER', 'DOKUMEN', 'NAMA SISWA', 'ASAL TAB', 'NILAI', 'PREDIKAT', 'STATUS (KKM >= ${kkm})', 'TINDAK LANJUT PERBAIKAN', 'WAKTU UPDATE']);

  const waktu = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');
  let no = 1;
  hasilSemuaTab.forEach(h => {
    (h.anggota || [h.identitas]).forEach(namaSiswa => {
      sheet.appendRow([no++, namaKelas, namaDokumen, namaSiswa, h.namaTab, h.nilaiAkhir, h.predikat, h.status, h.ringkasanPerbaikan, waktu]);
    });
  });
}

function isExcludedName(name, keywords) {
  const lower = (name || '').toLowerCase();
  return keywords.some(k => lower.includes(k));
}`;
}

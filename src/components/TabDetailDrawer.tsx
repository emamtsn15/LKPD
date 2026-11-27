import React, { useEffect, useState } from 'react';
import { X, Sparkles, UploadCloud, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DataSourceMode, DocTabRecord, FolderWorkspace } from '../types';
import { MARKER_START } from '../data/demoFolders';

interface TabDetailDrawerProps {
  folder: FolderWorkspace | null;
  tab: DocTabRecord | null;
  mode: DataSourceMode;
  isGrading: boolean;
  onClose: () => void;
  onRegradeTab: (folderId: string, tabId: string, updatedAnswer: string) => Promise<void>;
  onRequestWriteToDocs: (folder: FolderWorkspace, tab: DocTabRecord) => void;
}

export const TabDetailDrawer: React.FC<TabDetailDrawerProps> = ({
  folder,
  tab,
  mode,
  isGrading,
  onClose,
  onRegradeTab,
  onRequestWriteToDocs,
}) => {
  const [answerDraft, setAnswerDraft] = useState('');

  useEffect(() => {
    if (tab) {
      setAnswerDraft(tab.studentAnswerSnippet || '');
    }
  }, [tab]);

  if (!folder || !tab) return null;

  const isTuntas = (tab.score ?? 0) >= folder.kkm;
  const hasScore = tab.score !== null;

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/40 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-tab-title"
    >
      <div className="bg-white w-full max-w-3xl h-full border-l border-slate-200 flex flex-col overflow-hidden shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-700">{folder.folderName}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{folder.docTitle}</span>
            </div>
            <h3 id="drawer-tab-title" className="text-base font-bold text-slate-900 mt-0.5 truncate">
              Tab: {tab.tabName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup panel detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab.excluded ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">{tab.exclusionReason}</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {tab.recapNote}
              </p>
            </div>
          ) : (
            <>
              {/* Editor Jawaban Siswa & Tombol Koreksi AI */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label
                    htmlFor="student-answer-editor"
                    className="text-xs font-semibold text-slate-800"
                  >
                    Isi Jawaban Siswa di Atas Penanda Koreksi
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isGrading}
                      onClick={() => onRegradeTab(folder.id, tab.id, answerDraft)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGrading ? 'Mengoreksi AI...' : 'Koreksi Ulang via AI'}</span>
                    </button>
                    {mode === 'workspace' && hasScore && (
                      <button
                        type="button"
                        onClick={() => onRequestWriteToDocs(folder, tab)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Tulis ke Google Docs</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="student-answer-editor"
                  rows={5}
                  value={answerDraft}
                  onChange={(e) => setAnswerDraft(e.target.value)}
                  placeholder="Isi atau ubah teks jawaban siswa untuk menguji koreksi ulang otomatis AI..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-500">
                  Pembaruan menulis ulang blok di bawah penanda{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{MARKER_START}</code>{' '}
                  tanpa menduplikasi hasil sebelumnya.
                </p>
              </div>

              <hr className="border-slate-200" />

              {/* Ringkasan Hasil Penilaian */}
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-xs font-mono text-indigo-700 font-medium">
                      {MARKER_START}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {tab.studentIdentity}
                    </h4>
                  </div>

                  {hasScore ? (
                    <div className="flex items-center gap-4 border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50">
                      <div>
                        <div className="text-[11px] font-medium text-slate-500">Nilai Akhir</div>
                        <div
                          className={`text-xl font-bold font-mono tabular-nums ${
                            isTuntas ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {tab.score}/100
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        {isTuntas ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">
                              {tab.predicate} · Tuntas
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="text-amber-700">
                              {tab.predicate} · Remedial
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-500">
                      Belum dikoreksi AI · Klik "Koreksi Ulang via AI" di atas
                    </div>
                  )}
                </div>

                {/* 1. Rincian Skor Rubrik */}
                {tab.rubricBreakdown.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800">
                      1. Rincian Skor Rubrik Penilaian
                    </h5>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            <th className="py-2.5 px-3 font-semibold">Aspek Penilaian</th>
                            <th className="py-2.5 px-3 font-semibold text-right w-20">Maks</th>
                            <th className="py-2.5 px-3 font-semibold text-right w-20">Skor</th>
                            <th className="py-2.5 px-3 font-semibold">Catatan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {tab.rubricBreakdown.map((r, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                {r.aspect}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                                {r.max}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-indigo-700">
                                {r.score}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{r.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. Tabel Penjelasan Kesalahan */}
                {hasScore && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800">
                      2. Penjelasan Kesalahan Jawaban &amp; Cara Memperbaikinya
                    </h5>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            <th className="py-2.5 px-3 font-semibold w-36">Bagian / Soal</th>
                            <th className="py-2.5 px-3 font-semibold w-1/4">Jawaban Saat Ini</th>
                            <th className="py-2.5 px-3 font-semibold w-1/4">Penjelasan Kesalahan</th>
                            <th className="py-2.5 px-3 font-semibold">Cara Perbaikan yang Benar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {tab.errorTable.length > 0 ? (
                            tab.errorTable.map((e, idx) => (
                              <tr key={idx} className="align-top">
                                <td className="py-2.5 px-3 font-semibold text-slate-900">
                                  {e.part}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">{e.current}</td>
                                <td className="py-2.5 px-3 text-amber-800">{e.explanation}</td>
                                <td className="py-2.5 px-3 text-emerald-800 font-medium">{e.fix}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-4 px-3 text-center text-emerald-700 font-medium"
                              >
                                Tidak ada kesalahan ditemukan. Jawaban sudah lengkap dan tepat.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Umpan Balik Guru */}
                {tab.teacherFeedback && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1">
                    <h5 className="text-xs font-bold text-slate-800">
                      3. Umpan Balik &amp; Tindak Lanjut Guru
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed">{tab.teacherFeedback}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

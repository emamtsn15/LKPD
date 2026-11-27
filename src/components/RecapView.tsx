import React, { useMemo, useState } from 'react';
import { ClipboardCopy, Download, Sheet, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DataSourceMode, FlattenedStudentRecord, FolderWorkspace } from '../types';

interface RecapViewProps {
  folders: FolderWorkspace[];
  mode: DataSourceMode;
  lastSpreadsheetUrl: string | null;
  onCopySuccess: (msg: string) => void;
  onRequestSyncSheet: (records: FlattenedStudentRecord[]) => void;
}

export const RecapView: React.FC<RecapViewProps> = ({
  folders,
  mode,
  lastSpreadsheetUrl,
  onCopySuccess,
  onRequestSyncSheet,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('ALL');

  const records = useMemo<FlattenedStudentRecord[]>(() => {
    const out: FlattenedStudentRecord[] = [];
    for (const folder of folders) {
      if (selectedFolderId !== 'ALL' && folder.id !== selectedFolderId) continue;
      for (const tab of folder.tabs) {
        if (tab.excluded || tab.score === null) continue;
        const names = tab.members && tab.members.length > 0 ? tab.members : [tab.studentIdentity];
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
  }, [folders, selectedFolderId]);

  const handleCopyForDocs = async () => {
    const html = `
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 10pt;">
        <tr style="background-color: #eef2ff; font-weight: bold;">
          <th>NO</th>
          <th>KELAS</th>
          <th>NAMA SISWA</th>
          <th>ASAL TAB / KELOMPOK</th>
          <th>NILAI</th>
          <th>PREDIKAT</th>
          <th>STATUS</th>
          <th>TINDAK LANJUT PERBAIKAN</th>
        </tr>
        ${records
          .map(
            (r, i) => `
          <tr>
            <td align="center">${i + 1}</td>
            <td>${r.folderName}</td>
            <td>${r.studentName}</td>
            <td>${r.tabName}</td>
            <td align="center"><strong>${r.score}</strong></td>
            <td align="center">${r.predicate}</td>
            <td align="center">${r.status}</td>
            <td>${r.recapNote}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    `;

    try {
      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob(
        [
          records
            .map(
              (r, i) =>
                `${i + 1}\t${r.folderName}\t${r.studentName}\t${r.tabName}\t${r.score}\t${r.predicate}\t${r.status}\t${r.recapNote}`
            )
            .join('\n'),
        ],
        { type: 'text/plain' }
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob }),
      ]);
      onCopySuccess('Tabel rekapitulasi disalin ke clipboard dan siap ditempel ke Tab "Nilai" Google Docs.');
    } catch {
      onCopySuccess('Silakan gunakan tombol Unduh CSV jika browser membatasi clipboard HTML.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'NO',
      'KELAS',
      'DOKUMEN',
      'NAMA SISWA',
      'ASAL TAB',
      'NILAI',
      'PREDIKAT',
      'STATUS',
      'TINDAK LANJUT PERBAIKAN',
    ];
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.folderName.replace(/"/g, '""')}"`,
      `"${r.docTitle.replace(/"/g, '""')}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.tabName.replace(/"/g, '""')}"`,
      r.score,
      r.predicate,
      `"${r.status}"`,
      `"${r.recapNote.replace(/"/g, '""')}"`,
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Rekap_Nilai_LKPD_MultiFolder.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onCopySuccess('File CSV rekapitulasi nilai per kelas berhasil diunduh.');
  };

  return (
    <section className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Rekapitulasi Nilai Per Kelas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Anggota kelompok dipecah menjadi baris siswa individual untuk sinkronisasi ke Google Sheets dan Tab Nilai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            aria-label="Filter kelas"
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Kelas / Subfolder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.folderName} · {f.docTitle}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCopyForDocs}
            disabled={records.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <ClipboardCopy className="w-3.5 h-3.5" />
            <span>Salin Tabel Docs</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>

          {mode === 'workspace' && (
            <button
              type="button"
              onClick={() => onRequestSyncSheet(records)}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sheet className="w-3.5 h-3.5" />
              <span>Sinkronkan ke Google Sheet</span>
            </button>
          )}
        </div>
      </div>

      {lastSpreadsheetUrl && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900">
          <span className="font-medium">
            Google Sheet rekapitulasi telah diperbarui dan tersimpan di folder Drive Anda.
          </span>
          <a
            href={lastSpreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline whitespace-nowrap"
          >
            <span>Buka Google Sheet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs font-semibold">
                <th className="py-3 px-4 w-12">No</th>
                <th className="py-3 px-4">Kelas / Subfolder</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Asal Tab</th>
                <th className="py-3 px-4 text-right">Nilai</th>
                <th className="py-3 px-4 text-center">Predikat</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tindak Lanjut Perbaikan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-500">
                    Belum ada tab yang memiliki nilai. Jalankan koreksi AI pada tab siswa terlebih dahulu.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={`${r.docId}-${r.tabName}-${r.studentName}-${i}`} className="hover:bg-slate-50 align-top">
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500">{i + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-700 text-xs">{r.folderName}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{r.studentName}</td>
                    <td className="py-2.5 px-4 text-xs text-slate-600">{r.tabName}</td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono tabular-nums font-bold ${
                        r.isTuntas ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {r.score}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800">
                      {r.predicate}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          r.isTuntas ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {r.isTuntas ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-600 leading-relaxed">
                      {r.recapNote}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

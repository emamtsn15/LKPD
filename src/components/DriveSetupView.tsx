import React from 'react';
import { User } from 'firebase/auth';
import { FolderSearch, Sparkles, UploadCloud, Sheet, ExternalLink } from 'lucide-react';
import { DataSourceMode, FolderWorkspace } from '../types';

interface DriveSetupViewProps {
  user: User | null;
  hasToken: boolean;
  isSigningIn: boolean;
  onSignIn: () => void;
  folderInput: string;
  onFolderInputChange: (val: string) => void;
  parsedFolderId: string;
  kkm: number;
  onKkmChange: (val: number) => void;
  spreadsheetIdInput: string;
  onSpreadsheetIdChange: (val: string) => void;
  mode: DataSourceMode;
  onSwitchMode: (mode: DataSourceMode) => void;
  isScanning: boolean;
  isBatchGrading: boolean;
  batchProgress: { current: number; total: number; label: string } | null;
  folders: FolderWorkspace[];
  onScanDrive: () => Promise<void>;
  onBatchGradeAll: () => Promise<void>;
  onRequestBatchWriteDocs: () => void;
  onRequestSyncAllSheets: () => void;
}

export const DriveSetupView: React.FC<DriveSetupViewProps> = ({
  user,
  hasToken,
  isSigningIn,
  onSignIn,
  folderInput,
  onFolderInputChange,
  parsedFolderId,
  kkm,
  onKkmChange,
  spreadsheetIdInput,
  onSpreadsheetIdChange,
  mode,
  onSwitchMode,
  isScanning,
  isBatchGrading,
  batchProgress,
  folders,
  onScanDrive,
  onBatchGradeAll,
  onRequestBatchWriteDocs,
  onRequestSyncAllSheets,
}) => {
  const totalGradedTabs = folders
    .flatMap((f) => f.tabs)
    .filter((t) => !t.excluded && t.score !== null).length;

  const totalGradableTabs = folders.flatMap((f) => f.tabs).filter((t) => !t.excluded).length;

  return (
    <section className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Koneksi Langsung Google Drive, Docs &amp; Sheets
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Masuk dengan akun Google Anda, tentukan URL atau ID Folder Induk Google Drive, lalu jalankan pemindaian rekursif dan koreksi otomatis AI.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => onSwitchMode('workspace')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'workspace'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Workspace Google Live
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('demo')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'demo'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Contoh (Uji Rubrik)
            </button>
          </div>
        </div>

        {/* Status Akun Google */}
        {!user || !hasToken ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900">
                Hubungkan Akun Google Anda
              </div>
              <p className="text-xs text-slate-600">
                Masuk dengan Google untuk memindai folder Drive, membaca tab Google Docs, menulis umpan balik, dan memperbarui Google Sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignIn}
              disabled={isSigningIn}
              className="gsi-material-button shrink-0"
            >
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span className="whitespace-nowrap">
                  {isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
            <span>
              Terhubung sebagai <strong>{user.email || user.displayName}</strong> · Siap memindai dan memperbarui dokumen Workspace Anda.
            </span>
            {parsedFolderId && (
              <a
                href={`https://drive.google.com/drive/folders/${parsedFolderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline whitespace-nowrap"
              >
                <span>Buka Folder di Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Form Konfigurasi Folder, KKM & Spreadsheet Target */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 space-y-1.5">
            <label htmlFor="drive-folder-input" className="block text-xs font-semibold text-slate-800">
              URL atau ID Folder Induk Google Drive
            </label>
            <input
              id="drive-folder-input"
              type="text"
              value={folderInput}
              onChange={(e) => onFolderInputChange(e.target.value)}
              placeholder="Tempel link folder Google Drive atau ID folder..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              ID terdeteksi: {parsedFolderId || 'Tidak valid'}
            </p>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label htmlFor="ss-id-input" className="block text-xs font-semibold text-slate-800">
              ID / Link Google Sheet Rekap (Opsional)
            </label>
            <input
              id="ss-id-input"
              type="text"
              value={spreadsheetIdInput}
              onChange={(e) => onSpreadsheetIdChange(e.target.value)}
              placeholder="Kosongkan agar dibuat otomatis di folder"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="kkm-input" className="block text-xs font-semibold text-slate-800">
              Nilai KKM
            </label>
            <input
              id="kkm-input"
              type="number"
              min={0}
              max={100}
              value={kkm}
              onChange={(e) => onKkmChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono tabular-nums text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Alur Kerja 4 Langkah Langsung */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onScanDrive}
            disabled={!hasToken || isScanning || !parsedFolderId}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <FolderSearch className="w-4 h-4" />
            <span>{isScanning ? 'Memindai Folder...' : '1. Pindai Folder Drive'}</span>
          </button>

          <button
            type="button"
            onClick={onBatchGradeAll}
            disabled={isBatchGrading || totalGradableTabs === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isBatchGrading
                ? 'Mengoreksi AI...'
                : `2. Koreksi Semua Tab (${totalGradableTabs} Tab)`}
            </span>
          </button>

          <button
            type="button"
            onClick={onRequestBatchWriteDocs}
            disabled={!hasToken || mode !== 'workspace' || totalGradedTabs === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>3. Tulis ke Google Docs ({totalGradedTabs})</span>
          </button>

          <button
            type="button"
            onClick={onRequestSyncAllSheets}
            disabled={!hasToken || mode !== 'workspace' || totalGradedTabs === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sheet className="w-4 h-4" />
            <span>4. Sinkronkan ke Google Sheet</span>
          </button>
        </div>

        {batchProgress && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
              <span>{batchProgress.label}</span>
              <span className="font-mono tabular-nums">
                {batchProgress.current}/{batchProgress.total}
              </span>
            </div>
            <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
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
          </div>
        )}
      </div>
    </section>
  );
};

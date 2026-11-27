import React, { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { buildGasSourceCode } from '../data/demoFolders';

interface GasDeployViewProps {
  folderId: string;
  kkm: number;
  onCopied: (msg: string) => void;
}

export const GasDeployView: React.FC<GasDeployViewProps> = ({ folderId, kkm, onCopied }) => {
  const [triggerHour, setTriggerHour] = useState<number>(22);

  const gasCode = useMemo(
    () => buildGasSourceCode(folderId, kkm, triggerHour),
    [folderId, kkm, triggerHour]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gasCode);
      onCopied('Kode lengkap Code.gs berhasil disalin ke clipboard.');
    } catch {
      onCopied('Gagal menyalin otomatis. Silakan blok kode lalu salin secara manual.');
    }
  };

  return (
    <section className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Otomatisasi Harian Terjadwal via Google Apps Script
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Gunakan skrip ini jika Anda ingin Google Drive menjalankan koreksi ulang otomatis setiap malam tanpa membuka browser.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <span>Jam Trigger Harian:</span>
              <select
                value={triggerHour}
                onChange={(e) => setTriggerHour(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              >
                <option value={6}>06:00 WIB</option>
                <option value={15}>15:00 WIB</option>
                <option value={20}>20:00 WIB</option>
                <option value={22}>22:00 WIB</option>
              </select>
            </label>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Kode Code.gs</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-indigo-700">01. Buat Proyek Baru</div>
            <p className="text-slate-600 leading-relaxed">
              Buka <strong>script.google.com</strong>, buat proyek baru, dan tempel kode di bawah ke dalam berkas <code className="bg-white px-1 rounded border border-slate-200">Code.gs</code>.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-indigo-700">02. Simpan Script Property</div>
            <p className="text-slate-600 leading-relaxed">
              Masuk ke <strong>Project Settings &rarr; Script Properties</strong> dan tambahkan properti <code className="bg-white px-1 rounded border border-slate-200">GEMINI_API_KEY</code>.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-indigo-700">03. Pasang Trigger Harian</div>
            <p className="text-slate-600 leading-relaxed">
              Pilih fungsi <code className="bg-white px-1 rounded border border-slate-200">pasangTriggerHarian</code> lalu klik <strong>Run</strong> satu kali untuk menjadwalkan koreksi harian.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-indigo-700">04. Tes Eksekusi Manual</div>
            <p className="text-slate-600 leading-relaxed">
              Jalankan fungsi <code className="bg-white px-1 rounded border border-slate-200">jalankanKoreksiSeluruhFolder</code> untuk menguji pemindaian folder Anda secara langsung.
            </p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="font-mono">
              Code.gs · Folder ID: {folderId} · KKM: {kkm}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed">
            {gasCode}
          </pre>
        </div>
      </div>
    </section>
  );
};

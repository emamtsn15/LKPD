import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { PendingConfirmation } from '../types';

interface ConfirmationModalProps {
  confirmation: PendingConfirmation | null;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  confirmation,
  onClose,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);

  if (!confirmation) return null;

  const handleConfirm = async () => {
    setIsExecuting(true);
    try {
      await confirmation.onConfirm();
      onClose();
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900">
                {confirmation.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {confirmation.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmation.items.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Target yang akan diperbarui ({confirmation.items.length} item):
            </div>
            <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
              {confirmation.items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isExecuting}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            {isExecuting ? 'Menyimpan ke Workspace...' : confirmation.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, Trash2, X, CheckSquare } from 'lucide-react';
import { KDKMPLocation } from '../types/kdkmp';

interface BulkDeleteConfirmModalProps {
  isOpen: boolean;
  selectedLocations: KDKMPLocation[];
  onClose: () => void;
  onConfirm: () => void;
  isAll?: boolean;
}

export const BulkDeleteConfirmModal: React.FC<BulkDeleteConfirmModalProps> = ({
  isOpen,
  selectedLocations,
  onClose,
  onConfirm,
  isAll = false
}) => {
  if (!isOpen || selectedLocations.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-700 rounded-lg text-white">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAll
                  ? 'Konfirmasi Hapus Semua Data Lokasi'
                  : `Konfirmasi Hapus ${selectedLocations.length} Lokasi Terpilih`}
              </h3>
              <p className="text-xs text-rose-100">
                Data akan dihapus permanen dari Cloud Firestore & sistem lokal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900">
                Peringatan: Tindakan ini tidak dapat dibatalkan!
              </p>
              <p className="text-rose-800 leading-relaxed">
                {isAll
                  ? 'Seluruh data gerai/gudang KDKMP beserta seluruh hasil checklist evaluasi dan riwayat transaksi akan dihapus bersih.'
                  : `Sebanyak ${selectedLocations.length} unit lokasi KDKMP yang Anda pilih akan dihapus secara bersamaan.`}
              </p>
            </div>
          </div>

          {/* List of locations to delete */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Daftar Unit yang Akan Dihapus ({selectedLocations.length}):</span>
              <span>Kode KDKMP</span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50 p-1">
              {selectedLocations.map((loc, idx) => (
                <div
                  key={loc.id}
                  className="px-3 py-2 text-xs flex items-center justify-between hover:bg-white rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] w-5">{idx + 1}.</span>
                    <div>
                      <div className="font-bold text-slate-900">{loc.namaLokasi}</div>
                      <div className="text-[10px] text-slate-500">
                        {[loc.desaKelurahan, loc.kecamatan, loc.kabupatenKota].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-semibold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                    {loc.kodeKDKMP}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
            💡 <strong>Petunjuk:</strong> Jika sewaktu-waktu Anda memerlukan data sampel acuan resmi kembali, Anda dapat mengklik tombol <em>"Reset ke Data Standar"</em> di bilah atas.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus {selectedLocations.length} Lokasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

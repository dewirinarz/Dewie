import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { KDKMPLocation } from '../types/kdkmp';

interface DeleteConfirmModalProps {
  location: KDKMPLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  location,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Lokasi KDKMP?</h3>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            Apakah Anda yakin ingin menghapus data lokasi{' '}
            <strong className="text-slate-900 font-semibold">{location.namaLokasi}</strong> (
            <span className="font-mono text-xs">{location.kodeKDKMP}</span>)? Seluruh hasil checklist dan data peninjauan
            akan terhapus.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 mb-6 border border-slate-200 text-left">
            <div>Wilayah: {location.desaKelurahan}, {location.kecamatan}, {location.kabupatenKota}</div>
            <div>Tanggal Kunjungan: {location.tanggalKunjungan || '-'}</div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Ya, Hapus Lokasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

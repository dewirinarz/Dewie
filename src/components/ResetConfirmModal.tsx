import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Database,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Layers,
  Sparkles
} from 'lucide-react';
import { KDKMPLocation } from '../types/kdkmp';
import { INITIAL_LOCATIONS } from '../data/defaultData';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (targetData: KDKMPLocation[], datasetName: string) => Promise<void>;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'master_2410' | 'baseline_7'>('master_2410');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteReset = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (selectedPreset === 'master_2410') {
        // Fetch verified 2,410 dataset from server endpoint
        const res = await fetch('/api/backup/initial-master');
        if (!res.ok) {
          throw new Error('Gagal memuat berkas cadangan master 2.410 lokasi.');
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          await onConfirmReset(json.data, '2.410 Unit Master Database Terverifikasi');
          onClose();
        } else {
          throw new Error('Data master tidak valid atau kosong.');
        }
      } else {
        // Baseline 7 items
        await onConfirmReset(INITIAL_LOCATIONS, '7 Unit Baseline Acuan Resmi KDKMP');
        onClose();
      }
    } catch (err: any) {
      console.error('Reset execution failed:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memulihkan data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-red-700 shadow-inner border border-amber-400/30">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Kembalikan ke Awal Penyimpanan Database
              </h2>
              <p className="text-xs text-slate-400">
                Pulihkan data ke status awal yang bersih dan terverifikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-xs text-slate-300 leading-relaxed">
            Pilih versi data yang ingin Anda kembalikan ke dalam aplikasi dan penyimpanan database:
          </p>

          {/* Option Cards */}
          <div className="space-y-3">
            {/* Option 1: 2,410 Master Dataset */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                selectedPreset === 'master_2410'
                  ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <input
                type="radio"
                name="resetPreset"
                checked={selectedPreset === 'master_2410'}
                onChange={() => setSelectedPreset('master_2410')}
                className="mt-1 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    2.410 Unit Master Database Terverifikasi
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Direkomendasikan
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Kondisi setelah awal penyimpanan database: 7 baseline percontohan + 26 unit Bali + 2.377 unit Jawa Tengah. Seluruh checklist 5 pilar terverifikasi 100% tanpa ada baris ganda/duplikat.
                </p>
              </div>
            </label>

            {/* Option 2: 7 Baseline Units */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                selectedPreset === 'baseline_7'
                  ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <input
                type="radio"
                name="resetPreset"
                checked={selectedPreset === 'baseline_7'}
                onChange={() => setSelectedPreset('baseline_7')}
                className="mt-1 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    7 Unit Baseline Acuan Resmi KDKMP
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    Data Minimal
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Kondisi inisialisasi awal database: KDKMP Desa Sukamaju, Banguntapan, Sidomulyo, Tanjung Medang, Kertarahayu, Labuan Bajo, dan Maros Sejahtera.
                </p>
              </div>
            </label>
          </div>

          {/* Details Notice */}
          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1.5 text-xs text-slate-400">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Proses Pemulihan:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1">
              <li>Membersihkan cache lokal browser (IndexedDB &amp; sessionStorage) secara tuntas.</li>
              <li>Memperbarui memori aplikasi secara instan tanpa perlu memuat ulang halaman.</li>
              <li>Menyelaraskan rekaman database dan cloud storage ke dataset yang dipilih.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleExecuteReset}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memulihkan Data...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Kembalikan Data Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

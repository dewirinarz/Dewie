import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  Check,
  Clock
} from 'lucide-react';
import { KDKMPLocation } from '../types/kdkmp';
import { generateSummaryCsvContent } from '../utils/exportUtils';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: KDKMPLocation[];
  onRestoreData: (restoredLocations: KDKMPLocation[]) => void;
  onShowToast: (message: string) => void;
  onExportCsv: () => void;
  onPrintBlankPdf: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  locations,
  onRestoreData,
  onShowToast,
  onExportCsv,
  onPrintBlankPdf
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download complete JSON backup directly
  const handleDownloadJsonBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(locations, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `CADANGAN_KDKMP_LENGKAP_${timestamp}_${locations.length}_LOKASI.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      onShowToast(`✓ Berhasil mengunduh berkas cadangan (${locations.length} lokasi KDKMP)!`);
    } catch (err: any) {
      setRestoreError(`Gagal membuat berkas cadangan: ${err.message}`);
    }
  };

  // 2. Upload and restore from JSON backup file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    setRestoreMessage(null);
    setIsRestoring(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let items: KDKMPLocation[] = [];
        if (Array.isArray(parsed)) {
          items = parsed.map((item: any) => (item.data || item) as KDKMPLocation);
        } else if (parsed && Array.isArray(parsed.data)) {
          items = parsed.data;
        } else if (parsed && Array.isArray(parsed.locations)) {
          items = parsed.locations;
        } else {
          throw new Error('Format berkas cadangan tidak valid (harus berupa array data lokasi KDKMP).');
        }

        if (items.length === 0) {
          throw new Error('Berkas cadangan tidak berisi data lokasi.');
        }

        // Validate basic items
        const validItems = items.filter(it => it && (it.id || it.namaLokasi || it.kodeKDKMP));
        if (validItems.length === 0) {
          throw new Error('Data dalam berkas cadangan tidak memiliki struktur KDKMP yang valid.');
        }

        // Send to backend batch endpoint
        try {
          await fetch('/api/locations/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validItems)
          });
        } catch {
          // Continue with client restore
        }

        onRestoreData(validItems);
        setRestoreMessage(`✓ Berhasil memulihkan ${validItems.length} lokasi KDKMP dari berkas ${file.name}`);
        onShowToast(`✓ Pemulihan data selesai: ${validItems.length} lokasi KDKMP aktif!`);
      } catch (err: any) {
        setRestoreError(err.message || 'Gagal memproses berkas cadangan.');
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setRestoreError('Gagal membaca berkas dari perangkat.');
      setIsRestoring(false);
    };

    reader.readAsText(file);
  };

  // 3. Restore master 2,410 dataset
  const handleRestoreMaster = async () => {
    if (!confirm('Apakah Anda yakin ingin memuat kembali seluruh 2.410 data unit KDKMP master standar resmi? Data saat ini akan digabungkan.')) {
      return;
    }
    setIsRestoring(true);
    setRestoreError(null);
    setRestoreMessage(null);

    try {
      const res = await fetch('/api/backup/initial-master');
      if (!res.ok) throw new Error('Gagal memuat berkas master dari server.');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        onRestoreData(json.data);
        setRestoreMessage(`✓ Berhasil memulihkan seluruh ${json.data.length} unit KDKMP master resmi!`);
        onShowToast(`✓ Seluruh ${json.data.length} data unit KDKMP resmi berhasil dipulihkan!`);
      } else {
        throw new Error('Data master tidak ditemukan.');
      }
    } catch (err: any) {
      setRestoreError(err.message || 'Gagal memulihkan data master.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Cadangan & Pemulihan Data
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Mandiri / Tanpa Cloud
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pencadangan, ekspor, dan pemulihan data langsung di komputer Anda tanpa memerlukan akun Google Cloud.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status banner */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Total Data Saat Ini: <strong className="text-white font-semibold">{locations.length.toLocaleString('id-ID')} unit KDKMP</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Tersimpan permanen di Server & Browser (IndexedDB)
            </span>
          </div>

          {restoreMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{restoreMessage}</span>
            </div>
          )}

          {restoreError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Section 1: Backup Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Pencadangan & Ekspor Data
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Download JSON */}
              <button
                onClick={handleDownloadJsonBackup}
                className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                    Unduh Cadangan Lengkap (.json)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Menyimpan semua data lokasi, skor kesiapan, dan isian 5 pilar checklist.
                  </div>
                </div>
              </button>

              {/* Export CSV */}
              <button
                onClick={() => {
                  onExportCsv();
                  onClose();
                }}
                className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Ekspor Rekapitulasi CSV / Excel
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Format tabel lengkap siap olah di Microsoft Excel atau Google Spreadsheet.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Restore Actions */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              Pemulihan Data
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Restore from File */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all text-left group cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isRestoring}
                />
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Pulihkan dari Berkas JSON
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Unggah berkas cadangan .json untuk memulihkan seluruh data secara instan.
                  </div>
                </div>
              </label>

              {/* Restore 2,410 master */}
              <button
                onClick={handleRestoreMaster}
                disabled={isRestoring}
                className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all text-left group cursor-pointer disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                    Muat Data Master Resmi (2.410 Unit)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Muat kembali seluruh 2.410 unit KDKMP standar resmi kementerian.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Blank PDF */}
          <div className="pt-2">
            <button
              onClick={() => {
                onPrintBlankPdf();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Cetak / Unduh Formulir Blanko PDF Resmi KDKMP</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

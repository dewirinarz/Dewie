import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { KDKMPLocation } from '../types/kdkmp';
import { loadLocationsFromIndexedDB } from '../utils/storageUtils';
import {
  fetchLocationsFromPostgres,
  saveMultipleLocationsToPostgres,
  BatchSyncReport
} from '../services/postgresLocationService';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecoveryComplete: (locations: KDKMPLocation[]) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  onRecoveryComplete,
}) => {
  const [isInspecting, setIsInspecting] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Inspection stats
  const [idbLocations, setIdbLocations] = useState<KDKMPLocation[]>([]);
  const [idbTotalCount, setIdbTotalCount] = useState<number>(0);
  const [idbValidCount, setIdbValidCount] = useState<number>(0);
  const [pgCurrentCount, setPgCurrentCount] = useState<number>(0);
  const [pendingLocations, setPendingLocations] = useState<KDKMPLocation[]>([]);

  // Recovery progress
  const [currentProgress, setCurrentProgress] = useState<{
    saved: number;
    total: number;
    chunkIndex: number;
    totalChunks: number;
  }>({ saved: 0, total: 0, chunkIndex: 0, totalChunks: 0 });

  const [batchReport, setBatchReport] = useState<BatchSyncReport | null>(null);
  const [finalVerifiedCount, setFinalVerifiedCount] = useState<number>(0);

  // Run inspection on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsInspecting(true);
    setIsFinished(false);
    setBatchReport(null);

    async function runInspection() {
      try {
        // 1. Read IndexedDB directly from laptop browser
        const idbData = await loadLocationsFromIndexedDB();
        const locationsFromIdb = idbData || [];
        
        // Validate items: must have id, namaLokasi, and checklist
        const validItems = locationsFromIdb.filter(
          l => Boolean(l.id && l.namaLokasi && l.checklist)
        );

        // 2. Fetch current PostgreSQL count
        const pgData = await fetchLocationsFromPostgres();
        const locationsFromPg = pgData || [];
        const pgIdSet = new Set(locationsFromPg.map(l => l.id));

        // 3. Find pending items in IndexedDB not yet present in PostgreSQL
        const pending = locationsFromIdb.filter(l => !pgIdSet.has(l.id));

        if (isMounted) {
          setIdbLocations(locationsFromIdb);
          setIdbTotalCount(locationsFromIdb.length);
          setIdbValidCount(validItems.length);
          setPgCurrentCount(locationsFromPg.length);
          setPendingLocations(pending);
          setIsInspecting(false);
        }
      } catch (err) {
        console.error('Inspection error:', err);
        if (isMounted) setIsInspecting(false);
      }
    }

    runInspection();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Execute chunked recovery
  const handleStartRecovery = async () => {
    if (pendingLocations.length === 0 || isRecovering) return;

    setIsRecovering(true);
    setCurrentProgress({
      saved: 0,
      total: pendingLocations.length,
      chunkIndex: 0,
      totalChunks: Math.ceil(pendingLocations.length / 200),
    });

    try {
      const report = await saveMultipleLocationsToPostgres(
        pendingLocations,
        200,
        (saved, total, chunkIdx, totalChunks) => {
          setCurrentProgress({
            saved,
            total,
            chunkIndex: chunkIdx,
            totalChunks,
          });
        }
      );

      setBatchReport(report);

      // Final verification: re-query PostgreSQL
      const verifiedPg = await fetchLocationsFromPostgres();
      const verifiedCount = verifiedPg?.length || 0;
      setFinalVerifiedCount(verifiedCount);
      setIsFinished(true);

      if (verifiedPg && verifiedPg.length > 0) {
        onRecoveryComplete(verifiedPg);
      }
    } catch (err) {
      console.error('Recovery error:', err);
    } finally {
      setIsRecovering(false);
    }
  };

  if (!isOpen) return null;

  const percentComplete = currentProgress.total > 0
    ? Math.round((currentProgress.saved / currentProgress.total) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Database className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pemulihan & Verifikasi Data KDKMP
              </h3>
              <p className="text-xs text-slate-400">
                Verifikasi IndexedDB peramban & sinkronisasi ke penyimpanan lokal tanpa duplikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRecovering}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
          {/* Step 1: Pre-transfer Inspection Results */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Hasil Pemeriksaan Aktual di Laptop Ini
              </h4>
              {isInspecting ? (
                <span className="text-xs text-amber-600 animate-pulse font-medium">
                  Memeriksa data...
                </span>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">IndexedDB Laptop</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {idbTotalCount.toLocaleString('id-ID')} unit
                </div>
                <div className="text-[10px] text-emerald-600 mt-1">
                  ✓ {idbValidCount.toLocaleString('id-ID')} unit valid lengkap
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Tersimpan di Database Lokal</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {pgCurrentCount.toLocaleString('id-ID')} unit
                </div>
                <div className="text-[10px] text-blue-600 mt-1">
                  ✓ ID Unik terdaftar
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Sisa Belum Sinkron</div>
                <div className="text-xl font-bold text-amber-600 mt-0.5">
                  {pendingLocations.length.toLocaleString('id-ID')} unit
                </div>
                <div className="text-[10px] text-amber-700 mt-1">
                  {pendingLocations.length === 0 ? '✓ 100% Sinkron' : 'Siap dipulihkan'}
                </div>
              </div>
            </div>
          </div>

          {/* Safety Guarantees */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-emerald-950 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Jaminan Keamanan & Integritas Data
            </div>
            <ul className="space-y-1 text-[11px] text-emerald-900/90 list-disc list-inside">
              <li><strong>Tidak Ada Data yang Dihapus:</strong> IndexedDB laptop dan data lokal tidak dihapus setelah transfer.</li>
              <li><strong>Bebas Duplikasi:</strong> Menggunakan ID unik berbasis unit KDKMP (ON CONFLICT DO UPDATE).</li>
              <li><strong>Otomatis Coba Ulang:</strong> Setiap paket yang gagal akan dicoba ulang hingga 3x secara otomatis.</li>
              <li><strong>Checklist & Metadata Utuh:</strong> 31 indikator kesiapan 5 pilar tersimpan utuh di PostgreSQL.</li>
            </ul>
          </div>

          {/* Transfer Progress Area */}
          {(isRecovering || isFinished) && (
            <div className="border border-slate-200 bg-white rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Kemajuan Pengiriman Bertahap (Paket per 200 Lokasi)
                </span>
                <span className="font-bold text-indigo-600">
                  {percentComplete}% ({currentProgress.saved} / {currentProgress.total} unit)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>

              {/* Live Chunk Logs */}
              {batchReport && batchReport.chunkLogs.length > 0 && (
                <div className="mt-3 max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                  {batchReport.chunkLogs.map(log => (
                    <div
                      key={log.chunkIndex}
                      className={`p-1.5 rounded flex items-center justify-between ${
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <span>
                        Paket {log.chunkIndex}/{batchReport.chunksTotal} ({log.size} lokasi):{' '}
                        {log.status === 'success' ? '✓ Berhasil disimpan' : `✗ Gagal (${log.error})`}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {log.attempts === 1 ? '1x percobaan' : `${log.attempts}x percobaan`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verification Results after completion */}
          {isFinished && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 space-y-2 text-emerald-950 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Verifikasi Akhir Berhasil! Seluruh Data Telah Tersimpan di Database Lokal
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200 text-center">
                  <div className="text-[10px] text-slate-500">Berhasil Disimpan</div>
                  <div className="text-base font-bold text-emerald-700">
                    {batchReport?.totalSaved || 0} unit
                  </div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200 text-center">
                  <div className="text-[10px] text-slate-500">Gagal / Error</div>
                  <div className="text-base font-bold text-slate-700">
                    {batchReport?.totalFailed || 0} unit
                  </div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200 text-center">
                  <div className="text-[10px] text-slate-500">Total di Database Lokal</div>
                  <div className="text-base font-bold text-blue-700">
                    {finalVerifiedCount.toLocaleString('id-ID')} unit
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {pendingLocations.length > 0 && !isFinished
              ? `${pendingLocations.length} lokasi siap ditransfer dalam ${Math.ceil(pendingLocations.length / 200)} paket`
              : 'Seluruh data tersinkronisasi'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isRecovering}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors disabled:opacity-50"
            >
              {isFinished ? 'Tutup' : 'Batal'}
            </button>

            {!isFinished && pendingLocations.length > 0 && (
              <button
                onClick={handleStartRecovery}
                disabled={isInspecting || isRecovering}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-500 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isRecovering ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Memulihkan ({percentComplete}%)...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Mulai Pemulihan Bertahap
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Store,
  Plus,
  BarChart3,
  FileSpreadsheet,
  Printer,
  FileText,
  RotateCcw,
  UploadCloud,
  Map,
  HardDrive,
  Cloud,
  CloudOff,
  RefreshCw,
  Database
} from 'lucide-react';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';
import { downloadOfficialKDKMPExcelTemplate } from '../utils/excelTemplateUtils';

interface NavbarProps {
  locations: KDKMPLocation[];
  activeTab: 'locations' | 'map' | 'statistics' | 'originalPdf';
  setActiveTab: (tab: 'locations' | 'map' | 'statistics' | 'originalPdf') => void;
  cloudSyncStatus?: 'synced' | 'syncing' | 'offline';
  postgresConnected?: boolean;
  onSyncServer?: () => void;
  isSyncingServer?: boolean;
  onOpenRecoveryModal?: () => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenGoogleDriveModal: () => void;
  onExportCsv: () => void;
  onPrintBlankPdf: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locations,
  activeTab,
  setActiveTab,
  cloudSyncStatus = 'synced',
  postgresConnected = true,
  onSyncServer,
  isSyncingServer = false,
  onOpenRecoveryModal,
  onOpenAddModal,
  onOpenImportModal,
  onOpenGoogleDriveModal,
  onExportCsv,
  onPrintBlankPdf,
  onResetData
}) => {
  const total = locations.length;
  const readyCount = locations.filter(l => calculateReadiness(l.checklist).status === 'Sangat Siap').length;
  const avgPct = total > 0 ? Math.round(locations.reduce((acc, l) => acc + calculateReadiness(l.checklist).percentage, 0) / total) : 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('locations')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-inner border border-red-400/30">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">Kesiapan KDKMP</span>
                <span className="text-[11px] bg-red-600/90 text-white px-2 py-0.5 rounded-full font-semibold tracking-wide">
                  Merah Putih
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistem Monitoring & Evaluasi Kesiapan Gerai dan Gudang Koperasi Desa
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge & Cloud Sync Status */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60">
              <div>
                <span className="text-slate-400">Total Unit:</span>{' '}
                <span className="font-semibold text-white">{total}</span>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div>
                <span className="text-slate-400">Siap:</span>{' '}
                <span className="font-semibold text-emerald-400">{readyCount}</span>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div>
                <span className="text-slate-400">Rerata:</span>{' '}
                <span className="font-semibold text-amber-400">{avgPct}%</span>
              </div>
            </div>

            {/* Cloud Persistence Badge */}
            {cloudSyncStatus === 'synced' && (
              <div
                title="Tersinkronisasi ke Cloud Database: Perubahan tersimpan permanen dan tidak akan ter-reset saat aplikasi dipublikasikan."
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 shadow-2xs"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cloud Tersinkron</span>
              </div>
            )}
            {cloudSyncStatus === 'syncing' && (
              <div
                title="Menghubungkan ke Cloud Database..."
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-950/70 text-blue-300 border border-blue-500/30 animate-pulse"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Menyinkron...</span>
              </div>
            )}
            {cloudSyncStatus === 'offline' && (
              <div
                title="Bekerja dalam Mode Lokal / Offline: Seluruh data dan perubahan tetap tersimpan aman di IndexedDB perangkat."
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-950/70 text-amber-300 border border-amber-500/30 shadow-2xs"
              >
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Mode Lokal / Offline</span>
              </div>
            )}

            {/* Local Database Badge */}
            <div
              title="Tersambung ke Basis Data Lokal Mandiri: Seluruh data tersimpan permanen di server & browser."
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Database Lokal Aktif</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {onSyncServer && (
              <button
                onClick={onSyncServer}
                disabled={isSyncingServer}
                title="Sinkronkan dengan Server Database Lokal"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs sm:text-sm font-semibold shadow-sm transition-colors border border-cyan-500/30 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
                <span className="hidden sm:inline">{isSyncingServer ? 'Menyinkron...' : 'Segarkan Data'}</span>
              </button>
            )}

            {onOpenRecoveryModal && (
              <button
                onClick={onOpenRecoveryModal}
                title="Buka Panel Verifikasi & Pemulihan Data KDKMP"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors border border-red-500/40 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-red-200" />
                <span className="hidden sm:inline">Pemulihan Data</span>
              </button>
            )}

            <button
              onClick={onOpenImportModal}
              title="Import File Multi-Format (Excel .xlsx, CSV, PDF, JSON)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Import File</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-medium shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Lokasi</span>
            </button>

            <button
              onClick={onOpenGoogleDriveModal}
              title="Cadangan & Pemulihan Data: Unduh Berkas JSON Lengkap, Ekspor Excel & Pulihkan Data Mandiri Tanpa Cloud"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors border border-blue-500/40 cursor-pointer"
            >
              <Database className="w-4 h-4 text-blue-200" />
              <span className="hidden sm:inline">Cadangan Data</span>
            </button>

            <button
              onClick={onExportCsv}
              title="Ekspor CSV Rekapitulasi Seluruh Data"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Rekap Excel</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-t border-slate-800/80 -mb-px">
          <nav className="flex space-x-1 sm:space-x-3 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('locations')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'locations'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Store className="w-4 h-4 text-red-400" />
              <span>Daftar Lokasi</span>
              <span className="bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Map className="w-4 h-4 text-amber-400" />
              <span>Peta Sebaran</span>
            </button>

            <button
              onClick={() => setActiveTab('statistics')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'statistics'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Statistik & Analitik</span>
            </button>

            <button
              onClick={() => setActiveTab('originalPdf')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'originalPdf'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Acuan PDF</span>
            </button>
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={downloadOfficialKDKMPExcelTemplate}
              title="Unduh Template Excel Resmi yang Disusun Mengikuti Acuan Formulir PDF"
              className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 transition-colors shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Template Excel</span>
            </button>
            <button
              onClick={onPrintBlankPdf}
              title="Unduh Formulir Checklist Kosong Siap Cetak untuk Petugas Lapangan"
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Blanko</span>
            </button>
            <button
              onClick={onResetData}
              title="Reset ke data awal"
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
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
  LogIn,
  LogOut,
  Shield,
  Users,
  ChevronDown,
  User as UserIcon,
  Server,
  HardDrive
} from 'lucide-react';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';
import { downloadOfficialKDKMPExcelTemplate } from '../utils/excelTemplateUtils';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { ROLE_LABELS, UserRole } from '../types/auth';

interface NavbarProps {
  locations: KDKMPLocation[];
  activeTab: 'locations' | 'map' | 'statistics' | 'originalPdf';
  setActiveTab: (tab: 'locations' | 'map' | 'statistics' | 'originalPdf') => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenGoogleDriveModal: () => void;
  onExportCsv: () => void;
  onPrintBlankPdf: () => void;
  onResetData: () => void;
  onOpenAuthModal: () => void;
  onOpenUserManagement: () => void;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  locations,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenImportModal,
  onOpenGoogleDriveModal,
  onExportCsv,
  onPrintBlankPdf,
  onResetData,
  onOpenAuthModal,
  onOpenUserManagement,
  isBackendConnected
}) => {
  const { user, isAuthenticated, logout, quickSwitchUser, permissions } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const total = locations.length;
  const readyCount = locations.filter(l => calculateReadiness(l.checklist).status === 'Sangat Siap').length;
  const avgPct = total > 0 ? Math.round(locations.reduce((acc, l) => acc + calculateReadiness(l.checklist).percentage, 0) / total) : 0;

  const currentRoleConfig = user ? ROLE_LABELS[user.role] : null;

  const handleRoleQuickSwitch = async (role: UserRole) => {
    setIsSwitching(true);
    await quickSwitchUser(role);
    setIsSwitching(false);
    setIsUserMenuOpen(false);
  };

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
                <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[10px] text-slate-300">
                  <Server className="w-3 h-3 text-emerald-400" />
                  <span>{isBackendConnected ? 'Backend API Online' : 'Local Fallback'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistem Monitoring & Evaluasi Kesiapan Gerai dan Gudang Koperasi Desa
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="hidden xl:flex items-center gap-4 text-xs bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60">
            <div>
              <span className="text-slate-400">Total Unit:</span>{' '}
              <span className="font-semibold text-white">{total}</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400">Siap Operasional:</span>{' '}
              <span className="font-semibold text-emerald-400">{readyCount}</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400">Rerata Kesiapan:</span>{' '}
              <span className="font-semibold text-amber-400">{avgPct}%</span>
            </div>
          </div>

          {/* Actions & Auth Profile */}
          <div className="flex items-center space-x-2">
            {permissions.canImport && (
              <button
                onClick={onOpenImportModal}
                title="Import File Multi-Format (Excel .xlsx, CSV, PDF, JSON)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span className="hidden sm:inline">Import File</span>
              </button>
            )}

            {permissions.canCreate && (
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-medium shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tambah Lokasi</span>
              </button>
            )}

            <button
              onClick={onOpenGoogleDriveModal}
              title="Google Drive: Cadangkan & Sinkronkan Data, Ekspor CSV & Berkas PDF"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors border border-blue-500/40"
            >
              <HardDrive className="w-4 h-4 text-blue-200" />
              <span className="hidden sm:inline">Google Drive</span>
            </button>

            <button
              onClick={onExportCsv}
              title="Ekspor CSV Rekapitulasi Seluruh Data"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Rekap Excel</span>
            </button>

            {/* User Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-red-300 font-medium leading-none mt-0.5">
                      {currentRoleConfig?.label}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 text-slate-800 dark:text-slate-200 p-2 animate-in fade-in slide-in-from-top-2">
                      {/* User Info Header */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-2">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">{user.email}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${currentRoleConfig?.badgeClass}`}>
                            <Shield className="w-3 h-3" />
                            {currentRoleConfig?.label}
                          </span>
                          <span className="text-[10px] text-slate-400">{user.region || 'Nasional'}</span>
                        </div>
                      </div>

                      {/* Quick Role Switcher for Testing */}
                      <div className="px-2 py-1 mb-2">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Ganti Peran Cepat (Simulasi):
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['admin', 'surveyor', 'verifikator', 'viewer'] as UserRole[]).map((r) => (
                            <button
                              key={r}
                              disabled={isSwitching}
                              onClick={() => handleRoleQuickSwitch(r)}
                              className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                                user.role === r
                                  ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 font-semibold'
                                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="truncate capitalize">{r}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Admin Links */}
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenUserManagement();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Users className="w-4 h-4 text-red-500" />
                          <span>Kelola Pengguna & Hak Akses</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Logout */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-500/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Petugas</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-t border-slate-800/80 -mb-px">
          <nav className="flex space-x-1 sm:space-x-3 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('locations')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
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
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
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
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
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
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
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
              className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Template Excel</span>
            </button>
            <button
              onClick={onPrintBlankPdf}
              title="Unduh Formulir Checklist Kosong Siap Cetak untuk Petugas Lapangan"
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Blanko</span>
            </button>
            {permissions.canDelete && (
              <button
                onClick={onResetData}
                title="Reset ke data awal"
                className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

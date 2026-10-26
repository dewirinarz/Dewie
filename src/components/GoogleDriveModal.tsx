import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  HardDrive,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Database,
  ExternalLink,
  Trash2,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Check,
  ShieldAlert,
  Loader2,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, googleSignOut, getAccessToken, auth } from '../services/googleAuth';
import {
  listKdkmpDriveFiles,
  uploadBackupToDrive,
  uploadSummaryCsvToDrive,
  downloadDriveFileContent,
  deleteDriveFile,
  DriveFileMetadata,
  findOrCreateKdkmpFolder,
  KDKMP_FOLDER_NAME
} from '../services/googleDriveService';
import { KDKMPLocation } from '../types/kdkmp';
import { generateSummaryCsvContent } from '../utils/exportUtils';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: KDKMPLocation[];
  onRestoreData: (restoredLocations: KDKMPLocation[]) => void;
  onShowToast: (message: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  locations,
  onRestoreData,
  onShowToast
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive files state
  const [driveFiles, setDriveFiles] = useState<DriveFileMetadata[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);

  // Backup creation state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupNote, setBackupNote] = useState('');
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Confirmation dialogs
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<DriveFileMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [confirmRestoreFile, setConfirmRestoreFile] = useState<DriveFileMetadata | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Check auth token when opened
  useEffect(() => {
    if (isOpen) {
      getAccessToken().then(tok => {
        setToken(tok);
        setCurrentUser(auth.currentUser);
        if (tok) {
          fetchFileList(tok);
        }
      });
    }
  }, [isOpen]);

  const fetchFileList = useCallback(async (activeToken: string) => {
    setIsLoadingFiles(true);
    setAuthError(null);
    try {
      const fId = await findOrCreateKdkmpFolder(activeToken);
      setFolderId(fId);
      const files = await listKdkmpDriveFiles(activeToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to list drive files:', err);
      setAuthError(err.message || 'Gagal memuat berkas dari Google Drive');
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const { user: signedInUser, accessToken } = await googleSignIn();
      setCurrentUser(signedInUser);
      setToken(accessToken);
      onShowToast(`Berhasil terhubung ke Google Drive sebagai ${signedInUser.email}`);
      await fetchFileList(accessToken);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setCurrentUser(null);
      setToken(null);
      setDriveFiles([]);
      onShowToast('Telah keluar dari akun Google Drive.');
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Perform full data backup
  const handleCreateBackup = async () => {
    if (!token) return;
    setIsBackingUp(true);
    try {
      const uploaded = await uploadBackupToDrive(locations, token, backupNote);
      setBackupNote('');
      onShowToast(`Data berhasil dicadangkan ke Google Drive (${uploaded.name})`);
      await fetchFileList(token);
    } catch (err: any) {
      console.error('Backup error:', err);
      setAuthError(err.message || 'Gagal mencadangkan data ke Google Drive');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Upload summary CSV to Drive
  const handleUploadCsv = async () => {
    if (!token) return;
    setIsExportingCsv(true);
    try {
      const csv = generateSummaryCsvContent(locations);
      const uploaded = await uploadSummaryCsvToDrive(csv, token);
      onShowToast(`Rekapitulasi CSV berhasil diunggah ke Google Drive (${uploaded.name})`);
      await fetchFileList(token);
    } catch (err: any) {
      console.error('CSV upload error:', err);
      setAuthError(err.message || 'Gagal mengunggah CSV ke Google Drive');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Execute restore after user confirmation
  const executeRestore = async () => {
    if (!token || !confirmRestoreFile) return;
    setIsRestoring(true);
    try {
      const content = await downloadDriveFileContent(confirmRestoreFile.id, token);
      const parsed = JSON.parse(content);

      let locationsToRestore: KDKMPLocation[] = [];
      if (Array.isArray(parsed)) {
        locationsToRestore = parsed;
      } else if (parsed && Array.isArray(parsed.data)) {
        locationsToRestore = parsed.data;
      } else {
        throw new Error('Format berkas cadangan JSON tidak valid atau tidak memiliki data lokasi KDKMP.');
      }

      if (locationsToRestore.length === 0) {
        throw new Error('Berkas cadangan kosong (tidak memiliki unit lokasi).');
      }

      onRestoreData(locationsToRestore);
      onShowToast(`Berhasil memulihkan ${locationsToRestore.length} data lokasi dari Google Drive!`);
      setConfirmRestoreFile(null);
      onClose();
    } catch (err: any) {
      console.error('Restore error:', err);
      setAuthError(err.message || 'Gagal memulihkan data cadangan.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Execute delete after user confirmation
  const executeDelete = async () => {
    if (!token || !confirmDeleteFile) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(confirmDeleteFile.id, token);
      onShowToast(`Berkas "${confirmDeleteFile.name}" telah dihapus dari Google Drive.`);
      setConfirmDeleteFile(null);
      await fetchFileList(token);
    } catch (err: any) {
      console.error('Delete error:', err);
      setAuthError(err.message || 'Gagal menghapus berkas dari Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return isoString;
    }
  };

  const getFileBadge = (mimeType: string, name: string) => {
    if (mimeType.includes('json') || name.endsWith('.json')) {
      return {
        label: 'Cadangan JSON',
        color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        icon: <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        isJson: true
      };
    }
    if (mimeType.includes('pdf') || name.endsWith('.pdf')) {
      return {
        label: 'PDF Checklist',
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
        icon: <FileText className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />,
        isJson: false
      };
    }
    if (mimeType.includes('csv') || name.endsWith('.csv')) {
      return {
        label: 'Rekap CSV',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        icon: <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        isJson: false
      };
    }
    return {
      label: 'Berkas',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: <FileText className="w-3.5 h-3.5 text-slate-600" />,
      isJson: false
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              {/* Google Drive Tri-color Icon Representation */}
              <HardDrive className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">Google Drive KDKMP</h3>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pencadangan awan, ekspor PDF checklist, dan sinkronisasi data KDKMP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Message */}
          {authError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Perhatian: </span>
                {authError}
              </div>
            </div>
          )}

          {/* Authentication Banner */}
          {!currentUser || !token ? (
            <div className="border border-blue-100 dark:border-blue-900/60 rounded-2xl p-5 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-slate-900 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <HardDrive className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Hubungkan dengan Google Drive
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Masuk dengan akun Google Anda untuk menyimpan cadangan berkala seluruh unit KDKMP,
                  mengarsipkan PDF checklist resmi, dan memulihkan data kapan saja.
                </p>
              </div>

              {/* Standard Official "Sign in with Google" button per workspace-integration skill */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleSignIn}
                  disabled={isLoadingAuth}
                  className="inline-flex items-center justify-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300 shadow-sm transition-all hover:shadow active:bg-slate-100 disabled:opacity-60 cursor-pointer"
                  style={{ minWidth: '220px', minHeight: '40px' }}
                >
                  {isLoadingAuth ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Menghubungkan...</span>
                    </>
                  ) : (
                    <>
                      {/* Official Google 'G' Logo SVG */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Connected Account Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {currentUser.displayName || 'Akun Google'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Terhubung
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{currentUser.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {folderId && (
                    <a
                      href={`https://drive.google.com/drive/folders/${folderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
                      title="Buka folder di tab baru"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Buka Folder Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Backup & CSV Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Backup Card */}
                <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Cadangkan Data ({locations.length} Unit)
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                      Simpan snapshot lengkap seluruh checklist, data fisik, SDM, produk, dan transaksi ke Google Drive dalam format JSON.
                    </p>
                    <input
                      type="text"
                      value={backupNote}
                      onChange={(e) => setBackupNote(e.target.value)}
                      placeholder="Catatan cadangan opsional (mis. Survey Wilayah Jatim)..."
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 mb-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    onClick={handleCreateBackup}
                    disabled={isBackingUp}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
                  >
                    {isBackingUp ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunggah Cadangan...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Cadangkan ke Google Drive</span>
                      </>
                    )}
                  </button>
                </div>

                {/* CSV Export Card */}
                <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Rekapitulasi CSV ke Drive
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                      Ekspor tabel agregat kesiapan semua unit KDKMP langsung ke folder Google Drive agar dapat dibuka langsung di Google Spreadsheet.
                    </p>
                  </div>
                  <button
                    onClick={handleUploadCsv}
                    disabled={isExportingCsv}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
                  >
                    {isExportingCsv ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunggah Rekap CSV...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Unggah Rekapitulasi CSV</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Files Stored in Google Drive */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Berkas di Folder Google Drive ({driveFiles.length})
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      /{KDKMP_FOLDER_NAME}
                    </span>
                  </div>
                  <button
                    onClick={() => token && fetchFileList(token)}
                    disabled={isLoadingFiles}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    title="Perbarui daftar berkas"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {isLoadingFiles ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <span>Menghubungi Google Drive API...</span>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="font-medium text-slate-600 dark:text-slate-400">
                      Belum ada berkas KDKMP di folder Google Drive Anda.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Gunakan tombol cadangkan di atas atau tombol "Simpan ke Drive" pada pratinjau PDF checklist untuk mengunggah berkas.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {driveFiles.map((file) => {
                      const badge = getFileBadge(file.mimeType, file.name);
                      return (
                        <div
                          key={file.id}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-2"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5 shrink-0">{badge.icon}</div>
                            <div className="min-w-0">
                              <div className="font-medium text-xs text-slate-900 dark:text-white truncate">
                                {file.name}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span className={`px-1.5 py-0.2 rounded border text-[9px] font-semibold ${badge.color}`}>
                                  {badge.label}
                                </span>
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(file.modifiedTime || file.createdTime)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* If JSON, allow Restore */}
                            {badge.isJson && (
                              <button
                                onClick={() => setConfirmRestoreFile(file)}
                                title="Pulihkan / Impor data dari cadangan ini"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span className="hidden sm:inline">Pulihkan</span>
                              </button>
                            )}

                            {/* View on Drive Link */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Buka di Google Drive"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}

                            {/* Delete File */}
                            <button
                              onClick={() => setConfirmDeleteFile(file)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Hapus berkas dari Google Drive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>REST API v3 terenkripsi via Google OAuth 2.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Dialog: Delete File (Mandatory per workspace-integration skill) */}
      {confirmDeleteFile && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Konfirmasi Hapus Berkas di Google Drive</h4>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus berkas secara permanen.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <div>
                <span className="text-slate-400">Nama Berkas: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{confirmDeleteFile.name}</span>
              </div>
              <div>
                <span className="text-slate-400">Ukuran: </span>
                <span>{formatFileSize(confirmDeleteFile.size)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setConfirmDeleteFile(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                Batal
              </button>
              <button
                disabled={isDeleting}
                onClick={executeDelete}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-xs disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Ya, Hapus Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Restore Data (Mandatory per workspace-integration skill) */}
      {confirmRestoreFile && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Pulihkan Data dari Google Drive</h4>
                <p className="text-xs text-slate-500">Konfirmasi pemulihan snapshot data aplikasi</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs space-y-1 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/40">
              <p className="font-semibold">Perhatian:</p>
              <p>
                Data yang ada di aplikasi saat ini akan diperbarui dengan data dari berkas cadangan{' '}
                <span className="font-mono font-bold">{confirmRestoreFile.name}</span>.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={isRestoring}
                onClick={() => setConfirmRestoreFile(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                Batal
              </button>
              <button
                disabled={isRestoring}
                onClick={executeRestore}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-xs disabled:opacity-60"
              >
                {isRestoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Ya, Pulihkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

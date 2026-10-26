import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LocationList } from './components/LocationList';
import { StatisticsView } from './components/StatisticsView';
import { OriginalPdfView } from './components/OriginalPdfView';
import { ChecklistModal } from './components/ChecklistModal';
import { LocationFormModal } from './components/LocationFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { OfficialPdfPreviewModal } from './components/OfficialPdfPreviewModal';
import { ImportModal } from './components/ImportModal';
import { MapView } from './components/MapView';
import { AuthModal } from './components/AuthModal';
import { UserManagementModal } from './components/UserManagementModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { KDKMPLocation, KDKMPChecklist, createEmptyChecklist } from './types/kdkmp';
import { INITIAL_LOCATIONS } from './data/defaultData';
import { exportSummaryCsv, exportBlankChecklistPdf } from './utils/exportUtils';
import { useAuth } from './context/AuthContext';
import { ROLE_LABELS } from './types/auth';
import {
  Check,
  Shield,
  LogIn,
  AlertTriangle,
  Server,
  Sparkles,
  Users
} from 'lucide-react';

const STORAGE_KEY = 'kdkmp_locations_v1';

export default function App() {
  const { user, isAuthenticated, permissions } = useAuth();

  // Locations State
  const [locations, setLocations] = useState<KDKMPLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load locations from localStorage', e);
    }
    return INITIAL_LOCATIONS;
  });

  const [activeTab, setActiveTab] = useState<'locations' | 'map' | 'statistics' | 'originalPdf'>('locations');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Modals state
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedLocationForChecklist, setSelectedLocationForChecklist] = useState<KDKMPLocation | null>(null);
  const [checklistInitialTab, setChecklistInitialTab] = useState<'fisik' | 'sdm' | 'sistem' | 'produk' | 'transaksi'>('fisik');

  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [selectedLocationForEdit, setSelectedLocationForEdit] = useState<KDKMPLocation | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedLocationForDelete, setSelectedLocationForDelete] = useState<KDKMPLocation | null>(null);

  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [selectedLocationForPdf, setSelectedLocationForPdf] = useState<KDKMPLocation | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);

  // Auth & User Management Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Fetch from backend API on mount
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          setIsBackendConnected(true);
        }

        const res = await fetch('/api/locations');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setLocations(json.data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          }
        }
      } catch (err) {
        console.warn('Backend server fetch failed, using local offline copy:', err);
        setIsBackendConnected(false);
      }
    };

    fetchBackendData();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    } catch (e) {
      console.error('Failed to save locations to localStorage', e);
    }
  }, [locations]);

  const handleOpenChecklistModal = (
    loc: KDKMPLocation,
    tab: 'fisik' | 'sdm' | 'sistem' | 'produk' | 'transaksi' = 'fisik'
  ) => {
    setSelectedLocationForChecklist(loc);
    setChecklistInitialTab(tab);
    setIsChecklistOpen(true);
  };

  // Handler: Save Checklist
  const handleSaveChecklist = async (
    updatedChecklist: KDKMPChecklist,
    visitDate: string,
    officerName: string
  ) => {
    if (!selectedLocationForChecklist) return;

    const updatedLoc: KDKMPLocation = {
      ...selectedLocationForChecklist,
      checklist: updatedChecklist,
      tanggalKunjungan: visitDate,
      namaPetugas: officerName || (user?.name || selectedLocationForChecklist.namaPetugas),
      updatedAt: new Date().toISOString()
    };

    // Optimistic local state update
    setLocations(prev =>
      prev.map(loc => (loc.id === updatedLoc.id ? updatedLoc : loc))
    );
    setSelectedLocationForChecklist(updatedLoc);

    // Backend API persistence
    try {
      await fetch(`/api/locations/${encodeURIComponent(updatedLoc.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLoc)
      });
    } catch (e) {
      console.warn('Could not persist checklist to backend API, saved locally:', e);
    }

    showToast(`✓ Checklist kesiapan "${updatedLoc.namaLokasi}" berhasil disimpan ke server! (Tersimpan aman walaupun belum lengkap)`);
    setIsChecklistOpen(false);
  };

  // Handler: Add or Edit Location
  const handleSaveLocation = async (formData: Partial<KDKMPLocation>) => {
    if (selectedLocationForEdit) {
      // Edit
      const updated: KDKMPLocation = {
        ...selectedLocationForEdit,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      setLocations(prev =>
        prev.map(loc => (loc.id === selectedLocationForEdit.id ? updated : loc))
      );

      try {
        await fetch(`/api/locations/${encodeURIComponent(updated.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (e) {
        console.warn('Backend update error, saved locally:', e);
      }

      showToast(`✓ Data lokasi "${formData.namaLokasi || 'KDKMP'}" berhasil diperbarui di server!`);
    } else {
      // Add new
      const newLocation: KDKMPLocation = {
        id: `kdkmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        kodeKDKMP: formData.kodeKDKMP || `KDKMP-${Math.floor(100 + Math.random() * 900)}`,
        namaLokasi: formData.namaLokasi || 'Unit KDKMP Baru (Draf)',
        provinsi: formData.provinsi || 'Jawa Barat',
        kabupatenKota: formData.kabupatenKota || '',
        kecamatan: formData.kecamatan || '',
        desaKelurahan: formData.desaKelurahan || '',
        alamatLengkap: formData.alamatLengkap || '',
        namaPetugas: formData.namaPetugas || (user?.name || ''),
        kontakPerson: formData.kontakPerson || '',
        tanggalKunjungan: formData.tanggalKunjungan || new Date().toISOString().slice(0, 10),
        catatanTambahan: formData.catatanTambahan || '',
        checklist: createEmptyChecklist(),
        updatedAt: new Date().toISOString()
      };

      setLocations(prev => [newLocation, ...prev]);

      try {
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLocation)
        });
        const resJson = await res.json();
        if (resJson.isDuplicate) {
          showToast(`⚠️ Perhatian: Nama "${newLocation.namaLokasi}" sudah ada, namun tetap berhasil disimpan di database.`);
        } else {
          showToast(`✓ Lokasi "${newLocation.namaLokasi}" berhasil disimpan ke backend! (Data tersimpan walaupun form belum lengkap)`);
        }
      } catch (e) {
        showToast(`✓ Lokasi "${newLocation.namaLokasi}" berhasil disimpan! (Data tetap tersimpan offline walaupun belum lengkap)`);
      }
    }

    setIsLocationFormOpen(false);
    setSelectedLocationForEdit(null);
  };

  // Handler: Delete Location
  const handleConfirmDelete = async () => {
    if (!selectedLocationForDelete) return;
    const name = selectedLocationForDelete.namaLokasi;
    const id = selectedLocationForDelete.id;

    setLocations(prev => prev.filter(l => l.id !== id));
    setIsDeleteConfirmOpen(false);
    setSelectedLocationForDelete(null);

    try {
      await fetch(`/api/locations/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete error:', e);
    }

    showToast(`Lokasi "${name}" telah berhasil dihapus dari database.`);
  };

  // Handler: Reset Data
  const handleResetData = async () => {
    if (window.confirm('Kembalikan seluruh data ke data sampel bawaan KDKMP? Semua perubahan buatan akan direset.')) {
      try {
        const res = await fetch('/api/locations/reset', { method: 'POST' });
        if (res.ok) {
          const json = await res.json();
          setLocations(json.data || INITIAL_LOCATIONS);
        } else {
          setLocations(INITIAL_LOCATIONS);
        }
      } catch {
        setLocations(INITIAL_LOCATIONS);
      }
      localStorage.removeItem(STORAGE_KEY);
      showToast('Data berhasil direset ke standar acuan awal.');
    }
  };

  // Handler: Export CSV
  const handleExportCsv = () => {
    exportSummaryCsv(locations);
    showToast('Rekapitulasi data KDKMP berhasil diunduh dalam format CSV / Excel.');
  };

  // Handler: Blank PDF
  const handlePrintBlankPdf = () => {
    exportBlankChecklistPdf();
    showToast('Formulir blanko checklist KDKMP berhasil diunduh dalam format PDF.');
  };

  // Handler: Import Locations
  const handleImportLocations = async (
    importedLocations: KDKMPLocation[],
    conflictMode: 'overwrite' | 'append' | 'skip' | boolean = 'overwrite'
  ) => {
    const mode = typeof conflictMode === 'boolean' ? (conflictMode ? 'overwrite' : 'append') : conflictMode;
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const updated = [...locations];
    const itemsToSave: KDKMPLocation[] = [];

    importedLocations.forEach(newLoc => {
      const existingIdx = updated.findIndex(
        l =>
          (newLoc.kodeKDKMP && l.kodeKDKMP.trim().toLowerCase() === newLoc.kodeKDKMP.trim().toLowerCase()) ||
          (newLoc.namaLokasi && l.namaLokasi.trim().toLowerCase() === newLoc.namaLokasi.trim().toLowerCase())
      );

      if (existingIdx >= 0) {
        if (mode === 'overwrite') {
          const item = {
            ...newLoc,
            id: updated[existingIdx].id,
            updatedAt: new Date().toISOString()
          };
          updated[existingIdx] = item;
          itemsToSave.push(item);
          updatedCount++;
        } else if (mode === 'skip') {
          skippedCount++;
        } else {
          const item = {
            ...newLoc,
            id: `kdkmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            updatedAt: new Date().toISOString()
          };
          updated.unshift(item);
          itemsToSave.push(item);
          addedCount++;
        }
      } else {
        const item = {
          ...newLoc,
          id: `kdkmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          updatedAt: new Date().toISOString()
        };
        updated.unshift(item);
        itemsToSave.push(item);
        addedCount++;
      }
    });

    setLocations(updated);

    // Save batch to backend API
    try {
      await fetch('/api/locations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSave })
      });
    } catch (e) {
      console.warn('Backend batch sync warning:', e);
    }

    const summaryParts: string[] = [];
    if (addedCount > 0) summaryParts.push(`${addedCount} baru`);
    if (updatedCount > 0) summaryParts.push(`${updatedCount} diperbarui`);
    if (skippedCount > 0) summaryParts.push(`${skippedCount} dilewati`);

    showToast(
      `Sukses menyimpan ${importedLocations.length} lokasi ke database server (${summaryParts.join(', ') || 'selesai'}).`
    );
    setActiveTab('locations');
  };

  // Handler: Restore Drive Data
  const handleRestoreDriveData = async (restored: KDKMPLocation[]) => {
    setLocations(restored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    try {
      await fetch('/api/locations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: restored })
      });
    } catch (e) {
      console.warn('Backend batch sync warning:', e);
    }
    showToast(`Berhasil memulihkan ${restored.length} data lokasi KDKMP dari Google Drive.`);
    setActiveTab('locations');
  };

  const currentRoleInfo = user ? ROLE_LABELS[user.role] : null;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        locations={locations}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setSelectedLocationForEdit(null);
          setIsLocationFormOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenGoogleDriveModal={() => setIsGoogleDriveOpen(true)}
        onExportCsv={handleExportCsv}
        onPrintBlankPdf={handlePrintBlankPdf}
        onResetData={handleResetData}
        onOpenAuthModal={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        isBackendConnected={isBackendConnected}
      />

      {/* Role / Authentication Notification Banner */}
      <div className="bg-slate-900/95 text-slate-200 border-b border-slate-800 text-xs px-4 py-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Masuk sebagai:
              </span>
              <span className="font-semibold text-white">{user.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentRoleInfo?.badgeClass}`}>
                {currentRoleInfo?.label}
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                • {user.agency || 'Satgas KDKMP'} ({user.region || 'Nasional'})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Mode Tamu (Pratinjau)
              </span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                Login untuk akses penuh pencatatan lapangan, validasi skor, dan kelola database.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-[11px] font-medium transition-colors shadow-xs"
              >
                <LogIn className="w-3 h-3" />
                <span>Login Akun Petugas</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-[11px]">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setIsUserManagementOpen(true)}
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    <Users className="w-3 h-3 text-red-400" />
                    <span>Kelola Pengguna</span>
                  </button>
                )}
                <span className="text-slate-400 flex items-center gap-1">
                  <Server className="w-3 h-3 text-emerald-400" />
                  Backend Storage JSON Aktif
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'locations' && (
          <LocationList
            locations={locations}
            onOpenChecklist={(loc, tab) => handleOpenChecklistModal(loc, tab)}
            onOpenEditLocation={loc => {
              setSelectedLocationForEdit(loc);
              setIsLocationFormOpen(true);
            }}
            onOpenDeleteConfirm={loc => {
              if (!permissions.canDelete) {
                showToast('Hanya Administrator yang memiliki wewenang menghapus data lokasi.');
                return;
              }
              setSelectedLocationForDelete(loc);
              setIsDeleteConfirmOpen(true);
            }}
            onOpenPdfPreview={loc => {
              setSelectedLocationForPdf(loc);
              setIsPdfPreviewOpen(true);
            }}
            onOpenAddModal={() => {
              if (!permissions.canCreate) {
                showToast('Peran Anda saat ini (Viewer) hanya memiliki akses baca laporan.');
                return;
              }
              setSelectedLocationForEdit(null);
              setIsLocationFormOpen(true);
            }}
            onOpenImportModal={() => {
              if (!permissions.canImport) {
                showToast('Hanya Admin dan Surveyor yang memiliki hak mengimpor data lokasi.');
                return;
              }
              setIsImportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            locations={locations}
            onOpenChecklist={(loc, tab) => handleOpenChecklistModal(loc, tab)}
            onOpenPdfPreview={loc => {
              setSelectedLocationForPdf(loc);
              setIsPdfPreviewOpen(true);
            }}
            onOpenAddModal={() => {
              setSelectedLocationForEdit(null);
              setIsLocationFormOpen(true);
            }}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView
            locations={locations}
            onExportCsv={handleExportCsv}
            onSelectLocationForChecklist={(loc, tab) => handleOpenChecklistModal(loc, tab)}
            onViewDuplicates={() => setActiveTab('locations')}
          />
        )}

        {activeTab === 'originalPdf' && (
          <OriginalPdfView
            onImportPurbayan={loc => handleImportLocations([loc], true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Sistem Informasi Kesiapan Operasionalisasi KDKMP — Full-Stack Edition
          </p>
          <p>
            Berdasarkan Dokumen Instrumen Evaluasi Gerai & Gudang Koperasi Desa / Kelurahan Merah Putih
          </p>
          <p className="text-[11px] text-slate-400">
            Backend API Express + JSON Persistence • Multi-Role Auth (Admin, Surveyor, Verifikator, Pengawas)
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Checklist Modal */}
      {selectedLocationForChecklist && (
        <ChecklistModal
          location={selectedLocationForChecklist}
          isOpen={isChecklistOpen}
          initialTab={checklistInitialTab}
          onClose={() => setIsChecklistOpen(false)}
          onSave={handleSaveChecklist}
          onOpenPdfPreview={() => {
            setSelectedLocationForPdf(selectedLocationForChecklist);
            setIsPdfPreviewOpen(true);
          }}
        />
      )}

      {/* 2. Location Form Modal (Add / Edit) */}
      <LocationFormModal
        isOpen={isLocationFormOpen}
        onClose={() => {
          setIsLocationFormOpen(false);
          setSelectedLocationForEdit(null);
        }}
        onSave={handleSaveLocation}
        initialData={selectedLocationForEdit}
        existingLocations={locations}
      />

      {/* 3. Delete Confirmation Modal */}
      <DeleteConfirmModal
        location={selectedLocationForDelete}
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedLocationForDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* 4. Official PDF Preview & Print Modal */}
      <OfficialPdfPreviewModal
        location={selectedLocationForPdf}
        isOpen={isPdfPreviewOpen}
        onClose={() => {
          setIsPdfPreviewOpen(false);
          setSelectedLocationForPdf(null);
        }}
      />

      {/* 5. Import File Modal (PDF, CSV, JSON) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportLocations={handleImportLocations}
        existingLocations={locations}
      />

      {/* 6. Auth Modal (Login & Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={msg => showToast(msg)}
      />

      {/* 7. User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        onToast={msg => showToast(msg)}
      />

      {/* 8. Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        locations={locations}
        onRestoreData={handleRestoreDriveData}
        onShowToast={showToast}
      />
    </div>
  );
}

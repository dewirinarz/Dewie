import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { KDKMPLocation, KDKMPChecklist, createEmptyChecklist } from './types/kdkmp';
import { INITIAL_LOCATIONS } from './data/defaultData';
import { exportSummaryCsv, exportBlankChecklistPdf } from './utils/exportUtils';
import {
  testConnection,
  subscribeToLocations,
  saveLocationToFirestore,
  deleteLocationFromFirestore,
  deleteMultipleLocationsFromFirestore,
  deleteAllLocationsFromFirestore,
  saveMultipleLocationsToFirestore,
  resetLocationsInFirestore
} from './services/firebase';
import {
  getQuickCachedLocations,
  loadLocationsFromIndexedDB,
  cacheLocations,
  clearLocationsCache
} from './utils/storageUtils';
import { generateRandomKDKMPCode } from './utils/kemendagriCodes';
import { Check } from 'lucide-react';

export default function App() {
  // Locations State (Initialized from quick local cache or fallback to INITIAL_LOCATIONS)
  const [locations, setLocations] = useState<KDKMPLocation[]>(() => {
    const cached = getQuickCachedLocations();
    if (cached && cached.length > 0) {
      return cached;
    }
    return INITIAL_LOCATIONS;
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');
  const [activeTab, setActiveTab] = useState<'locations' | 'map' | 'statistics' | 'originalPdf'>('locations');

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

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const isStorageReadyRef = useRef<boolean>(false);

  // Save to persistent offline cache whenever locations change, but NEVER before storage initialization
  useEffect(() => {
    if (!isStorageReadyRef.current) return;
    cacheLocations(locations, true);
  }, [locations]);

  // Connect to Firestore and subscribe to real-time updates so data persists when published
  useEffect(() => {
    let isMounted = true;

    // Check IndexedDB on mount to restore existing data and prevent resetting
    loadLocationsFromIndexedDB()
      .then((idbLocations) => {
        if (!isMounted) return;
        if (idbLocations && idbLocations.length > 0) {
          setLocations(idbLocations);
        }
        isStorageReadyRef.current = true;
      })
      .catch((err) => {
        console.warn('IndexedDB initial read error:', err);
        isStorageReadyRef.current = true;
      });

    testConnection().catch(() => {});
    const unsubscribe = subscribeToLocations(
      (cloudLocations) => {
        if (!isMounted) return;
        if (cloudLocations && cloudLocations.length > 0) {
          setLocations(cloudLocations);
          cacheLocations(cloudLocations, true);
        }
        setCloudSyncStatus('synced');
      },
      (err) => {
        console.warn('Firestore offline/fallback to local cache:', err);
        setCloudSyncStatus('offline');
      }
    );
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

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
      namaPetugas: officerName || selectedLocationForChecklist.namaPetugas,
      updatedAt: new Date().toISOString()
    };

    setLocations(prev =>
      prev.map(loc => (loc.id === updatedLoc.id ? updatedLoc : loc))
    );
    setSelectedLocationForChecklist(updatedLoc);
    setIsChecklistOpen(false);

    try {
      await saveLocationToFirestore(updatedLoc);
      showToast(`✓ Checklist kesiapan "${updatedLoc.namaLokasi}" berhasil disimpan ke Cloud!`);
    } catch (err) {
      console.error('Gagal sinkron checklist ke Cloud:', err);
      showToast(`✓ Checklist tersimpan di peramban.`);
    }
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
      setIsLocationFormOpen(false);
      setSelectedLocationForEdit(null);

      try {
        await saveLocationToFirestore(updated);
        showToast(`✓ Data lokasi "${formData.namaLokasi || 'KDKMP'}" berhasil disimpan di Cloud!`);
      } catch (err) {
        console.error('Gagal simpan ke Cloud:', err);
        showToast(`✓ Data lokasi berhasil diperbarui secara lokal.`);
      }
    } else {
      // Add new
      const newLocation: KDKMPLocation = {
        id: `kdkmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        kodeKDKMP: formData.kodeKDKMP || generateRandomKDKMPCode(formData.provinsi, formData.kabupatenKota),
        namaLokasi: formData.namaLokasi || 'Unit KDKMP Baru (Draf)',
        provinsi: formData.provinsi || 'Jawa Barat',
        kabupatenKota: formData.kabupatenKota || '',
        kecamatan: formData.kecamatan || '',
        desaKelurahan: formData.desaKelurahan || '',
        alamatLengkap: formData.alamatLengkap || '',
        namaPetugas: formData.namaPetugas || '',
        kontakPerson: formData.kontakPerson || '',
        tanggalKunjungan: formData.tanggalKunjungan || new Date().toISOString().slice(0, 10),
        catatanTambahan: formData.catatanTambahan || '',
        checklist: createEmptyChecklist(),
        updatedAt: new Date().toISOString()
      };

      setLocations(prev => [newLocation, ...prev]);
      setIsLocationFormOpen(false);
      setSelectedLocationForEdit(null);

      try {
        await saveLocationToFirestore(newLocation);
        showToast(`✓ Lokasi "${newLocation.namaLokasi}" berhasil ditambahkan & tersimpan di Cloud!`);
      } catch (err) {
        console.error('Gagal simpan ke Cloud:', err);
        showToast(`✓ Lokasi baru tersimpan di peramban.`);
      }
    }
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
      await deleteLocationFromFirestore(id);
      showToast(`Lokasi "${name}" telah berhasil dihapus dari Cloud.`);
    } catch (err) {
      console.error('Gagal hapus dari Cloud:', err);
      showToast(`Lokasi "${name}" telah berhasil dihapus.`);
    }
  };

  // Handler: Bulk Delete Locations
  const handleBulkDelete = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const count = ids.length;
    setLocations(prev => prev.filter(l => !ids.includes(l.id)));

    try {
      await deleteMultipleLocationsFromFirestore(ids);
      showToast(`✓ Sebanyak ${count} lokasi telah berhasil dihapus dari Cloud.`);
    } catch (err) {
      console.error('Gagal hapus massal dari Cloud:', err);
      showToast(`Sebanyak ${count} lokasi telah berhasil dihapus.`);
    }
  };

  // Handler: Clear All Locations
  const handleClearAllLocations = async () => {
    const count = locations.length;
    setLocations([]);
    try {
      await deleteAllLocationsFromFirestore();
      showToast(`✓ Seluruh ${count} data lokasi telah berhasil dibersihkan dari Cloud.`);
    } catch (err) {
      console.error('Gagal membersihkan seluruh data dari Cloud:', err);
      showToast(`Seluruh data lokasi telah dibersihkan.`);
    }
  };

  // Handler: Reset Data
  const handleResetData = async () => {
    if (window.confirm('Kembalikan seluruh data ke data sampel acuan KDKMP? Semua perubahan akan direset baik di Cloud maupun Lokal.')) {
      setLocations(INITIAL_LOCATIONS);
      try {
        await resetLocationsInFirestore(INITIAL_LOCATIONS);
        await clearLocationsCache();
        showToast('Data berhasil direset ke standar acuan awal (Cloud & Lokal).');
      } catch (err) {
        console.warn('Gagal reset di Cloud, mereset cache lokal:', err);
        await clearLocationsCache();
        showToast('Data berhasil direset ke standar acuan awal.');
      }
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

  // Handler: Import Locations - Memastikan seluruh data yang diimport yang terpilih masuk ke daftar lokasi
  const handleImportLocations = async (
    importedLocations: KDKMPLocation[],
    conflictMode: 'overwrite' | 'append' | 'skip' | boolean = 'append'
  ) => {
    if (!importedLocations || importedLocations.length === 0) return;

    const mode = typeof conflictMode === 'boolean' ? (conflictMode ? 'overwrite' : 'append') : conflictMode;
    const now = Date.now();
    const isoNow = new Date().toISOString();

    // Map existing locations before the import batch is processed
    const existingLocationsMap = new Map<string, KDKMPLocation>();
    locations.forEach(loc => {
      existingLocationsMap.set(loc.id, loc);
      if (loc.kodeKDKMP) existingLocationsMap.set(loc.kodeKDKMP.trim().toLowerCase(), loc);
      if (loc.namaLokasi) existingLocationsMap.set(loc.namaLokasi.trim().toLowerCase(), loc);
    });

    const updated = [...locations];
    const touchedExistingIds = new Set<string>();
    const newlyAdded: KDKMPLocation[] = [];
    let updatedCount = 0;
    let addedCount = 0;

    importedLocations.forEach((newLoc, idx) => {
      // Find matching pre-existing location from BEFORE this import started
      const matchByCode = newLoc.kodeKDKMP ? existingLocationsMap.get(newLoc.kodeKDKMP.trim().toLowerCase()) : undefined;
      const matchByName = newLoc.namaLokasi ? existingLocationsMap.get(newLoc.namaLokasi.trim().toLowerCase()) : undefined;
      const matchById = newLoc.id ? existingLocationsMap.get(newLoc.id) : undefined;
      const existingMatch = matchById || matchByCode || matchByName;

      if (mode === 'overwrite' && existingMatch && !touchedExistingIds.has(existingMatch.id)) {
        // Overwrite pre-existing location with exact imported data
        const targetIdx = updated.findIndex(l => l.id === existingMatch.id);
        if (targetIdx >= 0) {
          const merged: KDKMPLocation = {
            ...newLoc,
            id: newLoc.id || existingMatch.id,
            updatedAt: newLoc.updatedAt || isoNow
          };
          updated[targetIdx] = merged;
          touchedExistingIds.add(existingMatch.id);
          updatedCount++;
          return;
        }
      }

      // Default & Append mode: Masukkan seluruh data terpilih secara persis tanpa merubah apapun
      const preservedId = newLoc.id && !existingLocationsMap.has(newLoc.id)
        ? newLoc.id
        : (newLoc.id ? `${newLoc.id}-imp-${now}-${idx}` : `kdkmp-${now}-${idx}-${Math.random().toString(36).substring(2, 7)}`);

      const itemToInsert: KDKMPLocation = {
        ...newLoc,
        id: preservedId,
        updatedAt: newLoc.updatedAt || isoNow
      };
      newlyAdded.push(itemToInsert);
      addedCount++;
    });

    // Letakkan data baru di awal daftar lokasi agar langsung terlihat oleh pengguna
    const finalLocations = [...newlyAdded, ...updated];
    setLocations(finalLocations);
    cacheLocations(finalLocations);

    // Pindahkan tampilan langsung ke Tab "Daftar Lokasi"
    setActiveTab('locations');

    const totalMasuk = addedCount + updatedCount;
    showToast(
      `✓ Seluruh ${totalMasuk} data lokasi terpilih telah berhasil masuk ke Daftar Lokasi (${addedCount} ditambahkan${updatedCount > 0 ? `, ${updatedCount} diperbarui` : ''})!`
    );

    try {
      await saveMultipleLocationsToFirestore(finalLocations);
      showToast(`✓ Seluruh data impor tersimpan permanen di Cloud!`);
    } catch (err) {
      console.warn('Gagal sinkron impor ke Cloud:', err);
    }
  };

  // Handler: Restore Drive Data
  const handleRestoreDriveData = async (restored: KDKMPLocation[]) => {
    setLocations(restored);
    cacheLocations(restored);
    setActiveTab('locations');
    try {
      await saveMultipleLocationsToFirestore(restored);
      showToast(`Berhasil memulihkan ${restored.length} data lokasi ke Cloud & Lokal.`);
    } catch (err) {
      console.error('Gagal sinkron restore ke Cloud:', err);
      showToast(`Berhasil memulihkan ${restored.length} data lokasi KDKMP.`);
    }
  };

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
        cloudSyncStatus={cloudSyncStatus}
        onOpenAddModal={() => {
          setSelectedLocationForEdit(null);
          setIsLocationFormOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenGoogleDriveModal={() => setIsGoogleDriveOpen(true)}
        onExportCsv={handleExportCsv}
        onPrintBlankPdf={handlePrintBlankPdf}
        onResetData={handleResetData}
      />

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
              setSelectedLocationForDelete(loc);
              setIsDeleteConfirmOpen(true);
            }}
            onOpenPdfPreview={loc => {
              setSelectedLocationForPdf(loc);
              setIsPdfPreviewOpen(true);
            }}
            onOpenAddModal={() => {
              setSelectedLocationForEdit(null);
              setIsLocationFormOpen(true);
            }}
            onOpenImportModal={() => {
              setIsImportModalOpen(true);
            }}
            onBulkDelete={handleBulkDelete}
            onClearAll={handleClearAllLocations}
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
            onOpenEditLocation={loc => {
              setSelectedLocationForEdit(loc);
              setIsLocationFormOpen(true);
            }}
            onOpenDeleteConfirm={loc => {
              setSelectedLocationForDelete(loc);
              setIsDeleteConfirmOpen(true);
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
            Sistem Informasi Kesiapan Operasionalisasi KDKMP — Monitoring & Evaluasi Koperasi Desa / Kelurahan Merah Putih
          </p>
          <p>
            Berdasarkan Dokumen Instrumen Evaluasi Gerai & Gudang Koperasi Desa / Kelurahan Merah Putih
          </p>
          <p className="text-[11px] text-slate-400">
            Penyimpanan Lokal Mandiri (Offline-Ready) • Rekapitulasi Excel, PDF Resmi & Cadangan Google Drive
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

      {/* 6. Google Drive Integration Modal */}
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

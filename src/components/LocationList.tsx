import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  FileText,
  Edit,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  Phone,
  Plus,
  UploadCloud,
  Filter,
  Clock,
  RotateCcw,
  X,
  Users,
  Cpu,
  ShoppingBag,
  Receipt,
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';

export type LocationSortOption =
  | 'name_asc'
  | 'name_desc'
  | 'code_asc'
  | 'code_desc'
  | 'wilayah_asc'
  | 'wilayah_desc'
  | 'highest'
  | 'lowest'
  | 'status_asc'
  | 'status_desc'
  | 'date_desc'
  | 'date_asc'
  | 'updated_desc'
  | 'updated_asc'
  | 'updated'
  | 'name'
  | 'date';

export const formatIndonesianDate = (isoString?: string): string => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
};

export const formatRelativeTime = (isoString?: string): { text: string; isRecent: boolean } => {
  if (!isoString) return { text: '-', isRecent: false };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { text: isoString, isRecent: false };

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60 && diffSec >= 0) return { text: 'Baru saja', isRecent: true };
    if (diffMin < 60 && diffMin >= 0) return { text: `${diffMin} menit lalu`, isRecent: true };
    if (diffHours < 24 && diffHours >= 0) return { text: `${diffHours} jam lalu`, isRecent: true };
    if (diffDays === 1) return { text: 'Kemarin', isRecent: true };
    if (diffDays <= 7 && diffDays > 1) return { text: `${diffDays} hari lalu`, isRecent: true };

    const formatted = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return { text: formatted, isRecent: false };
  } catch {
    return { text: isoString, isRecent: false };
  }
};

interface LocationListProps {
  locations: KDKMPLocation[];
  onOpenChecklist: (location: KDKMPLocation, tab?: 'fisik' | 'sdm' | 'sistem' | 'produk' | 'transaksi') => void;
  onOpenEditLocation: (location: KDKMPLocation) => void;
  onOpenDeleteConfirm: (location: KDKMPLocation) => void;
  onOpenPdfPreview: (location: KDKMPLocation) => void;
  onOpenAddModal: () => void;
  onOpenImportModal?: () => void;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  onOpenChecklist,
  onOpenEditLocation,
  onOpenDeleteConfirm,
  onOpenPdfPreview,
  onOpenAddModal,
  onOpenImportModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<LocationSortOption>('name_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Available unique provinces in current data
  const provinces = useMemo(() => {
    const set = new Set<string>();
    locations.forEach(loc => {
      if (loc.provinsi) set.add(loc.provinsi);
    });
    return Array.from(set).sort();
  }, [locations]);

  // Available unique kabupaten/kota dynamically filtered by selected province
  const kabupatenList = useMemo(() => {
    const set = new Set<string>();
    locations.forEach(loc => {
      if (loc.kabupatenKota) {
        if (selectedProvince === 'all' || loc.provinsi === selectedProvince) {
          set.add(loc.kabupatenKota);
        }
      }
    });
    return Array.from(set).sort();
  }, [locations, selectedProvince]);

  // Handle Province change and reset kabupaten if no longer valid
  const handleProvinceChange = (newProvince: string) => {
    setSelectedProvince(newProvince);
    if (newProvince !== 'all' && selectedKabupaten !== 'all') {
      const stillValid = locations.some(
        l => l.provinsi === newProvince && l.kabupatenKota.toLowerCase() === selectedKabupaten.toLowerCase()
      );
      if (!stillValid) {
        setSelectedKabupaten('all');
      }
    }
  };

  // Status counts for quick filter buttons
  const statusCounts = useMemo(() => {
    let ready = 0;
    let conditional = 0;
    let notReady = 0;
    let fullyChecked = 0;
    let pending = 0;

    locations.forEach(loc => {
      const score = calculateReadiness(loc.checklist);
      if (score.status === 'Sangat Siap') ready++;
      else if (score.status === 'Siap Bersyarat') conditional++;
      else notReady++;

      if (score.adaItems === score.totalItems) fullyChecked++;
      else pending++;
    });

    return { ready, conditional, notReady, fullyChecked, pending };
  }, [locations]);

  // Detect duplicate location names (case-insensitive & whitespace trimmed)
  const duplicateNameMap = useMemo(() => {
    const map: Record<string, KDKMPLocation[]> = {};
    locations.forEach(loc => {
      const norm = (loc.namaLokasi || '').trim().toLowerCase();
      if (norm) {
        if (!map[norm]) map[norm] = [];
        map[norm].push(loc);
      }
    });
    const dupes: Record<string, KDKMPLocation[]> = {};
    Object.entries(map).forEach(([key, list]) => {
      if (list.length > 1) {
        dupes[key] = list;
      }
    });
    return dupes;
  }, [locations]);

  // Summary statistics for duplicates
  const duplicateStats = useMemo(() => {
    let totalItems = 0;
    const groups = Object.keys(duplicateNameMap).length;
    Object.values(duplicateNameMap).forEach(list => {
      totalItems += list.length;
    });
    return { totalItems, groups };
  }, [duplicateNameMap]);

  // Filtered & Sorted locations
  const filteredLocations = useMemo(() => {
    return locations
      .filter(loc => {
        const score = calculateReadiness(loc.checklist);

        // Search query matching
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          loc.namaLokasi.toLowerCase().includes(q) ||
          loc.kodeKDKMP.toLowerCase().includes(q) ||
          loc.provinsi.toLowerCase().includes(q) ||
          loc.kabupatenKota.toLowerCase().includes(q) ||
          loc.kecamatan.toLowerCase().includes(q) ||
          loc.desaKelurahan.toLowerCase().includes(q) ||
          loc.namaPetugas.toLowerCase().includes(q) ||
          loc.checklist.sdm.manajerKD.keterangan.toLowerCase().includes(q) ||
          loc.checklist.transaksi.kendalaDanDukungan.kendalaUtama.toLowerCase().includes(q);

        // Province matching
        const matchesProvince = selectedProvince === 'all' || loc.provinsi === selectedProvince;

        // Kabupaten / Kota matching
        const matchesKabupaten =
          selectedKabupaten === 'all' ||
          loc.kabupatenKota.toLowerCase() === selectedKabupaten.toLowerCase();

        // Status matching
        let matchesStatus = true;
        if (selectedStatus === 'all') {
          matchesStatus = true;
        } else if (selectedStatus === 'Sangat Siap') {
          matchesStatus = score.status === 'Sangat Siap';
        } else if (selectedStatus === 'Siap Bersyarat') {
          matchesStatus = score.status === 'Siap Bersyarat';
        } else if (selectedStatus === 'Belum Siap') {
          matchesStatus = score.status === 'Belum Siap';
        } else if (selectedStatus === 'fully_checked') {
          matchesStatus = score.adaItems === score.totalItems;
        } else if (selectedStatus === 'pending') {
          matchesStatus = score.adaItems < score.totalItems;
        } else if (selectedStatus === 'transaksi_lengkap') {
          matchesStatus = score.transaksiCompleted;
        } else if (selectedStatus === 'transaksi_pending') {
          matchesStatus = !score.transaksiCompleted;
        } else if (selectedStatus === 'duplicate_names') {
          const norm = (loc.namaLokasi || '').trim().toLowerCase();
          matchesStatus = Boolean(duplicateNameMap[norm] && duplicateNameMap[norm].length > 1);
        } else if (selectedStatus === 'recently_updated') {
          const updateTime = loc.updatedAt ? new Date(loc.updatedAt).getTime() : 0;
          const now = Date.now();
          matchesStatus = Boolean(updateTime > 0 && (now - updateTime) < 7 * 24 * 60 * 60 * 1000);
        }

        return matchesSearch && matchesProvince && matchesKabupaten && matchesStatus;
      })
      .sort((a, b) => {
        const scoreA = calculateReadiness(a.checklist);
        const scoreB = calculateReadiness(b.checklist);

        if (sortBy === 'updated' || sortBy === 'updated_desc') {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        }
        if (sortBy === 'updated_asc') {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeA - timeB;
        }
        if (sortBy === 'name' || sortBy === 'name_asc') {
          return a.namaLokasi.localeCompare(b.namaLokasi, 'id', { sensitivity: 'base' });
        }
        if (sortBy === 'name_desc') {
          return b.namaLokasi.localeCompare(a.namaLokasi, 'id', { sensitivity: 'base' });
        }
        if (sortBy === 'code_asc') {
          return (a.kodeKDKMP || '').localeCompare(b.kodeKDKMP || '', 'id', { numeric: true });
        }
        if (sortBy === 'code_desc') {
          return (b.kodeKDKMP || '').localeCompare(a.kodeKDKMP || '', 'id', { numeric: true });
        }
        if (sortBy === 'wilayah_asc') {
          const locA = `${a.provinsi || ''} ${a.kabupatenKota || ''} ${a.kecamatan || ''} ${a.desaKelurahan || ''}`;
          const locB = `${b.provinsi || ''} ${b.kabupatenKota || ''} ${b.kecamatan || ''} ${b.desaKelurahan || ''}`;
          return locA.localeCompare(locB, 'id', { sensitivity: 'base' });
        }
        if (sortBy === 'wilayah_desc') {
          const locA = `${a.provinsi || ''} ${a.kabupatenKota || ''} ${a.kecamatan || ''} ${a.desaKelurahan || ''}`;
          const locB = `${b.provinsi || ''} ${b.kabupatenKota || ''} ${b.kecamatan || ''} ${b.desaKelurahan || ''}`;
          return locB.localeCompare(locA, 'id', { sensitivity: 'base' });
        }
        if (sortBy === 'highest') {
          return scoreB.percentage - scoreA.percentage;
        }
        if (sortBy === 'lowest') {
          return scoreA.percentage - scoreB.percentage;
        }
        if (sortBy === 'status_asc') {
          const order: Record<string, number> = { 'Sangat Siap': 3, 'Siap Bersyarat': 2, 'Belum Siap': 1 };
          return (order[scoreB.status] || 0) - (order[scoreA.status] || 0);
        }
        if (sortBy === 'status_desc') {
          const order: Record<string, number> = { 'Sangat Siap': 3, 'Siap Bersyarat': 2, 'Belum Siap': 1 };
          return (order[scoreA.status] || 0) - (order[scoreB.status] || 0);
        }
        if (sortBy === 'date' || sortBy === 'date_desc') {
          const timeA = a.tanggalKunjungan ? new Date(a.tanggalKunjungan).getTime() : 0;
          const timeB = b.tanggalKunjungan ? new Date(b.tanggalKunjungan).getTime() : 0;
          return timeB - timeA;
        }
        if (sortBy === 'date_asc') {
          const timeA = a.tanggalKunjungan ? new Date(a.tanggalKunjungan).getTime() : 0;
          const timeB = b.tanggalKunjungan ? new Date(b.tanggalKunjungan).getTime() : 0;
          return timeA - timeB;
        }
        return 0;
      });
  }, [locations, searchQuery, selectedProvince, selectedKabupaten, selectedStatus, sortBy]);

  const getStatusBadge = (status: 'Sangat Siap' | 'Siap Bersyarat' | 'Belum Siap') => {
    switch (status) {
      case 'Sangat Siap':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Sangat Siap (Operasional Penuh)
          </span>
        );
      case 'Siap Bersyarat':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Siap Bersyarat (Perlu Pemenuhan)
          </span>
        );
      case 'Belum Siap':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Belum Siap (Tahap Persiapan)
          </span>
        );
    }
  };

  const toggleSort = (column: 'name' | 'code' | 'wilayah' | 'readiness' | 'status' | 'date' | 'updated') => {
    switch (column) {
      case 'name':
        setSortBy(prev => (prev === 'name_asc' || prev === 'name' ? 'name_desc' : 'name_asc'));
        break;
      case 'code':
        setSortBy(prev => (prev === 'code_asc' ? 'code_desc' : 'code_asc'));
        break;
      case 'wilayah':
        setSortBy(prev => (prev === 'wilayah_asc' ? 'wilayah_desc' : 'wilayah_asc'));
        break;
      case 'readiness':
        setSortBy(prev => (prev === 'highest' ? 'lowest' : 'highest'));
        break;
      case 'status':
        setSortBy(prev => (prev === 'status_asc' ? 'status_desc' : 'status_asc'));
        break;
      case 'date':
        setSortBy(prev => (prev === 'date_desc' || prev === 'date' ? 'date_asc' : 'date_desc'));
        break;
      case 'updated':
        setSortBy(prev => (prev === 'updated_desc' || prev === 'updated' ? 'updated_asc' : 'updated_desc'));
        break;
    }
  };

  const isSortActive = (column: 'name' | 'code' | 'wilayah' | 'readiness' | 'status' | 'date' | 'updated') => {
    if (column === 'name') return sortBy === 'name_asc' || sortBy === 'name_desc' || sortBy === 'name';
    if (column === 'code') return sortBy === 'code_asc' || sortBy === 'code_desc';
    if (column === 'wilayah') return sortBy === 'wilayah_asc' || sortBy === 'wilayah_desc';
    if (column === 'readiness') return sortBy === 'highest' || sortBy === 'lowest';
    if (column === 'status') return sortBy === 'status_asc' || sortBy === 'status_desc';
    if (column === 'date') return sortBy === 'date_desc' || sortBy === 'date_asc' || sortBy === 'date';
    if (column === 'updated') return sortBy === 'updated_desc' || sortBy === 'updated_asc' || sortBy === 'updated';
    return false;
  };

  const renderSortIcon = (column: 'name' | 'code' | 'wilayah' | 'readiness' | 'status' | 'date' | 'updated') => {
    if (column === 'name') {
      if (sortBy === 'name_asc' || sortBy === 'name') return <ArrowUp className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      if (sortBy === 'name_desc') return <ArrowDown className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    } else if (column === 'code') {
      if (sortBy === 'code_asc') return <ArrowUp className="w-3 h-3 text-red-600 shrink-0" />;
      if (sortBy === 'code_desc') return <ArrowDown className="w-3 h-3 text-red-600 shrink-0" />;
    } else if (column === 'wilayah') {
      if (sortBy === 'wilayah_asc') return <ArrowUp className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      if (sortBy === 'wilayah_desc') return <ArrowDown className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    } else if (column === 'readiness') {
      if (sortBy === 'highest') return <ArrowDown className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      if (sortBy === 'lowest') return <ArrowUp className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    } else if (column === 'status') {
      if (sortBy === 'status_asc') return <ArrowUp className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      if (sortBy === 'status_desc') return <ArrowDown className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    } else if (column === 'date') {
      if (sortBy === 'date_desc' || sortBy === 'date') return <ArrowDown className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      if (sortBy === 'date_asc') return <ArrowUp className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    } else if (column === 'updated') {
      if (sortBy === 'updated_desc' || sortBy === 'updated') return <ArrowDown className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      if (sortBy === 'updated_asc') return <ArrowUp className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    }
    return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
  };

  const getSortLabel = (sort: LocationSortOption) => {
    switch (sort) {
      case 'updated':
      case 'updated_desc':
        return 'Terakhir Diupdate (Paling Baru)';
      case 'updated_asc':
        return 'Terakhir Diupdate (Terlama)';
      case 'name':
      case 'name_asc':
        return 'Nama Lokasi (A → Z)';
      case 'name_desc':
        return 'Nama Lokasi (Z → A)';
      case 'code_asc':
        return 'Kode KDKMP (A → Z)';
      case 'code_desc':
        return 'Kode KDKMP (Z → A)';
      case 'wilayah_asc':
        return 'Wilayah (A → Z)';
      case 'wilayah_desc':
        return 'Wilayah (Z → A)';
      case 'highest':
        return 'Skor Kesiapan Tertinggi';
      case 'lowest':
        return 'Skor Kesiapan Terendah';
      case 'status_asc':
        return 'Status (Terbaik Dulu)';
      case 'status_desc':
        return 'Status (Terendah Dulu)';
      case 'date':
      case 'date_desc':
        return 'Kunjungan Terbaru';
      case 'date_asc':
        return 'Kunjungan Terlama';
      default:
        return 'Default';
    }
  };

  // Find most recently updated location
  const mostRecentlyUpdated = useMemo(() => {
    if (!locations || locations.length === 0) return null;
    return [...locations].sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    })[0];
  }, [locations]);

  // Count of recently updated locations
  const recentUpdatesCount = useMemo(() => {
    const now = Date.now();
    return locations.filter(l => {
      const t = l.updatedAt ? new Date(l.updatedAt).getTime() : 0;
      return t > 0 && (now - t) < 7 * 24 * 60 * 60 * 1000;
    }).length;
  }, [locations]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Strip */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
        {/* Row 1: Search and Dropdown Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Query */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari lokasi, desa, kecamatan, kabupaten, atau manajer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold p-0.5"
                title="Hapus kata kunci pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Province Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedProvince}
              onChange={e => handleProvinceChange(e.target.value)}
              aria-label="Filter Wilayah Provinsi"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-700 font-medium"
            >
              <option value="all">Semua Provinsi ({provinces.length})</option>
              {provinces.map(prov => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* Kabupaten / Kota Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedKabupaten}
              onChange={e => setSelectedKabupaten(e.target.value)}
              aria-label="Filter Wilayah Kabupaten atau Kota"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-700 font-medium"
            >
              <option value="all">
                Semua Kab/Kota {selectedProvince !== 'all' ? `(${selectedProvince})` : ''} ({kabupatenList.length})
              </option>
              {kabupatenList.map(kab => (
                <option key={kab} value={kab}>
                  {kab}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              aria-label="Urutkan data lokasi"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-700 font-medium"
            >
              <optgroup label="Sesuai Abjad (A - Z)">
                <option value="name_asc">Nama Lokasi (A → Z)</option>
                <option value="name_desc">Nama Lokasi (Z → A)</option>
                <option value="code_asc">Kode KDKMP (A → Z)</option>
                <option value="code_desc">Kode KDKMP (Z → A)</option>
                <option value="wilayah_asc">Wilayah / Provinsi (A → Z)</option>
                <option value="wilayah_desc">Wilayah / Provinsi (Z → A)</option>
              </optgroup>
              <optgroup label="Waktu Update & Kunjungan">
                <option value="updated_desc">🕒 Terakhir Diupdate (Paling Baru)</option>
                <option value="updated_asc">🕒 Terakhir Diupdate (Terlama)</option>
                <option value="date_desc">Kunjungan Terbaru</option>
                <option value="date_asc">Kunjungan Terlama</option>
              </optgroup>
              <optgroup label="Kesiapan & Status">
                <option value="highest">Skor Kesiapan Tertinggi</option>
                <option value="lowest">Skor Kesiapan Terendah</option>
                <option value="status_asc">Status Terbaik Dulu</option>
                <option value="status_desc">Status Terendah Dulu</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Row 2: Readiness Status Filter Dropdown & Quick Filter Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1 text-[11px]">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter Cepat:
            </span>

            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({locations.length})
            </button>

            {/* Filter: Data yang Baru / Sebelumnya Diupdate */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'recently_updated' ? 'all' : 'recently_updated')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                selectedStatus === 'recently_updated'
                  ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
              title="Tampilkan data lokasi yang sebelumnya atau baru saja diupdate"
            >
              <Clock className={`w-3.5 h-3.5 ${selectedStatus === 'recently_updated' ? 'text-white' : 'text-blue-600'}`} />
              Baru Diupdate ({recentUpdatesCount})
            </button>

            <button
              onClick={() => setSelectedStatus('Sangat Siap')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedStatus === 'Sangat Siap'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              🟢 Sangat Siap ({statusCounts.ready})
            </button>

            <button
              onClick={() => setSelectedStatus('Siap Bersyarat')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedStatus === 'Siap Bersyarat'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              🟡 Siap Bersyarat ({statusCounts.conditional})
            </button>

            <button
              onClick={() => setSelectedStatus('Belum Siap')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedStatus === 'Belum Siap'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              🔴 Belum Siap ({statusCounts.notReady})
            </button>

            <button
              onClick={() => setSelectedStatus('fully_checked')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedStatus === 'fully_checked'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
              title="Semua 31 item indikator checklist terpenuhi (Ada)"
            >
              ✓ Fully Checked ({statusCounts.fullyChecked})
            </button>

            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedStatus === 'pending'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
              title="Masih memiliki indikator yang belum terpenuhi / bertatus Tidak Ada"
            >
              <Clock className="w-3 h-3 inline mr-1" />
              Pending ({statusCounts.pending})
            </button>

            {/* Check Identical / Duplicate Location Names Filter Button */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'duplicate_names' ? 'all' : 'duplicate_names')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                selectedStatus === 'duplicate_names'
                  ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                  : duplicateStats.totalItems > 0
                  ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="Periksa dan filter lokasi yang memiliki kesamaan nama lokasi (duplikasi)"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${selectedStatus === 'duplicate_names' ? 'text-white' : 'text-amber-600'}`} />
              Cek Nama Sama ({duplicateStats.totalItems})
            </button>
          </div>

          {/* More Detailed Status Dropdown for specialized filters */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              aria-label="Pilih status kesiapan lebih lanjut"
              className="w-full sm:w-56 py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-700"
            >
              <option value="all">Pilihan Filter Status Lainnya...</option>
              <option value="recently_updated">🕒 Baru Diupdate / Riwayat Update ({recentUpdatesCount} Unit)</option>
              <option value="Sangat Siap">Sangat Siap (&ge;85%)</option>
              <option value="Siap Bersyarat">Siap Bersyarat (60–84%)</option>
              <option value="Belum Siap">Belum Siap (&lt;60%)</option>
              <option value="fully_checked">Fully Checked (Semua 31 Item Ada)</option>
              <option value="pending">Pending (Ada Item Tidak Ada)</option>
              <option value="transaksi_lengkap">Transaksi Lengkap Terisi</option>
              <option value="transaksi_pending">Transaksi Belum Lengkap</option>
              <option value="duplicate_names">⚠️ Cek Nama Sama / Duplikat ({duplicateStats.totalItems} Unit)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Active Filter Chips & View Mode Switcher */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500">
              Menampilkan <span className="font-bold text-slate-900">{filteredLocations.length}</span> dari{' '}
              <span className="font-bold text-slate-900">{locations.length}</span> lokasi
            </span>

            {/* Active Filter Badges */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-800 border border-slate-300">
                Pencarian: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-600 ml-0.5 font-bold"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedProvince !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-red-50 text-red-800 border border-red-200">
                Provinsi: {selectedProvince}
                <button
                  onClick={() => handleProvinceChange('all')}
                  className="hover:text-red-900 ml-0.5 font-bold"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedKabupaten !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                Kab/Kota: {selectedKabupaten}
                <button
                  onClick={() => setSelectedKabupaten('all')}
                  className="hover:text-blue-900 ml-0.5 font-bold"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedStatus !== 'all' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${
                selectedStatus === 'duplicate_names'
                  ? 'bg-amber-100 text-amber-950 border-amber-300 font-semibold'
                  : selectedStatus === 'recently_updated'
                  ? 'bg-blue-100 text-blue-950 border-blue-300 font-semibold'
                  : 'bg-purple-50 text-purple-800 border-purple-200'
              }`}>
                Filter: {
                  selectedStatus === 'duplicate_names'
                    ? `Nama Lokasi Sama (${duplicateStats.totalItems} Unit)`
                    : selectedStatus === 'recently_updated'
                    ? `Baru Diupdate (${recentUpdatesCount} Unit)`
                    : selectedStatus === 'fully_checked'
                    ? 'Fully Checked'
                    : selectedStatus === 'pending'
                    ? 'Pending'
                    : selectedStatus === 'transaksi_lengkap'
                    ? 'Transaksi Lengkap'
                    : selectedStatus === 'transaksi_pending'
                    ? 'Transaksi Pending'
                    : selectedStatus
                }
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="hover:text-red-700 ml-0.5 font-bold"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(searchQuery || selectedProvince !== 'all' || selectedKabupaten !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvince('all');
                  setSelectedKabupaten('all');
                  setSelectedStatus('all');
                }}
                className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold px-2 py-0.5 rounded hover:bg-red-50 transition-colors ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Semua
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Tampilan:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kartu Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tabel Rekap
            </button>
          </div>
        </div>
      </div>

      {/* Banner Spotlight: Data yang Sebelumnya / Baru Saja Diupdate */}
      {mostRecentlyUpdated && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/30 to-white border border-blue-200 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs mt-0.5 sm:mt-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-blue-950 text-xs sm:text-sm">
                  Data yang Sebelumnya Diupdate:
                </span>
                <span className="font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200 text-xs">
                  {mostRecentlyUpdated.kodeKDKMP}
                </span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {mostRecentlyUpdated.namaLokasi}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {formatRelativeTime(mostRecentlyUpdated.updatedAt).text}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {[mostRecentlyUpdated.desaKelurahan, mostRecentlyUpdated.kecamatan, mostRecentlyUpdated.kabupatenKota, mostRecentlyUpdated.provinsi].filter(Boolean).join(', ')} • Kesiapan: <strong className="text-slate-800">{calculateReadiness(mostRecentlyUpdated.checklist).percentage}%</strong> ({calculateReadiness(mostRecentlyUpdated.checklist).status}) • Tanggal: {formatIndonesianDate(mostRecentlyUpdated.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenChecklist(mostRecentlyUpdated)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Buka Checklist Unit Ini
            </button>
            <button
              onClick={() => onOpenEditLocation(mostRecentlyUpdated)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              Edit Lokasi
            </button>
            <button
              onClick={() => setSortBy('updated_desc')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                sortBy === 'updated_desc' || sortBy === 'updated'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Urutkan seluruh tabel agar data yang paling baru diupdate tampil di paling atas"
            >
              Urutkan Terupdate
            </button>
          </div>
        </div>
      )}

      {/* Duplicate Audit Active Mode Banner */}
      {selectedStatus === 'duplicate_names' && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex flex-wrap items-center justify-between gap-3 text-amber-950 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200 rounded-lg text-amber-900 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Pemeriksaan Nama Lokasi yang Sama ({duplicateStats.totalItems} Unit Terdeteksi dalam {duplicateStats.groups} Nama)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 max-w-3xl">
                Menampilkan daftar lokasi yang memiliki nama identik. Anda dapat mengklik tombol <strong>Edit</strong> pada unit yang bersangkutan untuk menambahkan identitas wilayah pembeda, atau <strong>Hapus</strong> jika terjadi duplikasi tidak disengaja.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold text-xs rounded-lg shadow-2xs transition-colors"
            >
              Tampilkan Semua Lokasi
            </button>
          </div>
        </div>
      )}

      {/* Subtle Duplicate Notification Notice when not in duplicate filter mode */}
      {selectedStatus !== 'duplicate_names' && duplicateStats.totalItems > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Pemeriksaan Integritas Nama:</strong> Ditemukan <strong>{duplicateStats.totalItems} unit lokasi</strong> dengan nama yang sama ({duplicateStats.groups} kelompok nama ganda).
            </span>
          </div>
          <button
            onClick={() => setSelectedStatus('duplicate_names')}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors shrink-0 shadow-2xs inline-flex items-center gap-1"
          >
            <span>Lihat {duplicateStats.totalItems} Nama Ganda</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredLocations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">Tidak ada data lokasi yang cocok</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Coba sesuaikan kata kunci pencarian atau bersihkan filter provinsi, kabupaten/kota, dan status kesiapan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(searchQuery || selectedProvince !== 'all' || selectedKabupaten !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvince('all');
                  setSelectedKabupaten('all');
                  setSelectedStatus('all');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 shadow-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Semua Filter
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Lokasi Baru
            </button>
            {onOpenImportModal && (
              <button
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 shadow-sm transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                Import File Form KDKMP
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map(location => {
            const score = calculateReadiness(location.checklist);
            const cl = location.checklist;

            // Commodity highlights
            const hasLPG = cl.produk.lpg3kg.status === 'ada';
            const hasPupuk = cl.produk.pupukBersubsidi.status === 'ada';
            const hasBeras = cl.produk.berasSPHP.status === 'ada';
            const hasMinyak = cl.produk.minyakita.status === 'ada';

            return (
              <div
                key={location.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {location.kodeKDKMP || 'KDKMP-ID'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug group-hover:text-red-700 transition-colors flex items-center gap-1.5 flex-wrap">
                        <span>{location.namaLokasi}</span>
                        {duplicateNameMap[(location.namaLokasi || '').trim().toLowerCase()]?.length > 1 && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full"
                            title={`Terdapat ${duplicateNameMap[(location.namaLokasi || '').trim().toLowerCase()].length} lokasi dengan nama yang sama`}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                            Nama Sama ({duplicateNameMap[(location.namaLokasi || '').trim().toLowerCase()].length}x)
                          </span>
                        )}
                      </h3>
                    </div>

                    {/* Circular Percentage Gauge */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                          score.status === 'Sangat Siap'
                            ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                            : score.status === 'Siap Bersyarat'
                            ? 'border-amber-500 text-amber-700 bg-amber-50'
                            : 'border-rose-500 text-rose-700 bg-rose-50'
                        }`}
                      >
                        {score.percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">{getStatusBadge(score.status)}</div>

                  {/* Region Information */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="font-medium text-slate-800">
                        {location.desaKelurahan}, {location.kecamatan}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 pl-5">
                      {location.kabupatenKota}, {location.provinsi}
                    </div>
                  </div>
                </div>

                {/* Card Body - Readiness Breakdown */}
                <div className="p-5 py-4 space-y-4 text-xs">
                  {/* Pillar Bars - Clickable to open component tab */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenChecklist(location, 'fisik')}
                      className="w-full text-left p-1.5 -mx-1.5 rounded-lg hover:bg-slate-50 transition-colors group/bar"
                      title="Klik untuk edit Kelengkapan Fisik & Sarpras"
                    >
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600 font-medium group-hover/bar:text-red-700 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 group-hover/bar:text-red-600" />
                          1. Fisik & Sarpras (18)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {score.fisikScore.ada}/{score.fisikScore.total} ({score.fisikScore.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${score.fisikScore.pct}%` }}
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenChecklist(location, 'sdm')}
                      className="w-full text-left p-1.5 -mx-1.5 rounded-lg hover:bg-slate-50 transition-colors group/bar"
                      title="Klik untuk edit Kelengkapan SDM"
                    >
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600 font-medium group-hover/bar:text-blue-700 flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-500" />
                          2. Kelengkapan SDM (4)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {score.sdmScore.ada}/{score.sdmScore.total} ({score.sdmScore.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${score.sdmScore.pct}%` }}
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenChecklist(location, 'sistem')}
                      className="w-full text-left p-1.5 -mx-1.5 rounded-lg hover:bg-slate-50 transition-colors group/bar"
                      title="Klik untuk edit Kelengkapan Sistem"
                    >
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600 font-medium group-hover/bar:text-purple-700 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-purple-500" />
                          3. Kelengkapan Sistem (3)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {score.sistemScore.ada}/{score.sistemScore.total} ({score.sistemScore.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all"
                          style={{ width: `${score.sistemScore.pct}%` }}
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenChecklist(location, 'produk')}
                      className="w-full text-left p-1.5 -mx-1.5 rounded-lg hover:bg-slate-50 transition-colors group/bar"
                      title="Klik untuk edit Kelengkapan Produk"
                    >
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600 font-medium group-hover/bar:text-amber-700 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-amber-500" />
                          4. Kelengkapan Produk (6)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {score.produkScore.ada}/{score.produkScore.total} ({score.produkScore.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${score.produkScore.pct}%` }}
                        />
                      </div>
                    </button>
                  </div>

                  {/* Key Commodities Badges */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <div className="text-[11px] text-slate-400 font-medium mb-1.5">Ketersediaan Komoditas Strategis:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          hasLPG ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        LPG 3kg {hasLPG ? '✓' : '✗'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          hasPupuk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        Pupuk {hasPupuk ? '✓' : '✗'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          hasBeras ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        Beras SPHP {hasBeras ? '✓' : '✗'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          hasMinyak ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        Minyakita {hasMinyak ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>

                  {/* Visit Date & Surveyor */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {location.tanggalKunjungan || '-'}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate max-w-[150px]" title={location.namaPetugas}>
                      <User className="w-3 h-3 text-slate-400" />
                      {location.namaPetugas || 'Petugas'}
                    </span>
                  </div>

                  {/* Last Update Info */}
                  <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1" title={`Diupdate: ${formatIndonesianDate(location.updatedAt)}`}>
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>Update: {formatRelativeTime(location.updatedAt).text}</span>
                    </span>
                    {formatRelativeTime(location.updatedAt).isRecent && (
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.2 rounded">
                        Baru Diupdate
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-1">
                  <button
                    onClick={() => onOpenChecklist(location)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Input & Edit Checklist
                  </button>

                  <button
                    onClick={() => onOpenPdfPreview(location)}
                    title="Pratinjau & Cetak Lembar Checklist Resmi"
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => onOpenEditLocation(location)}
                    title="Ubah Identitas Wilayah & Lokasi"
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-slate-600" />
                  </button>

                  <button
                    onClick={() => onOpenDeleteConfirm(location)}
                    title="Hapus Lokasi"
                    className="p-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header Bar with Quick Abjad Sort Controls */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">Tabel Rekapitulasi Lokasi KDKMP</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                Urutan: <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{getSortLabel(sortBy)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 text-[11px] font-medium mr-1">Sort Cepat:</span>
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'updated_desc' ? 'updated_asc' : 'updated_desc')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all inline-flex items-center gap-1 ${
                  sortBy === 'updated_desc' || sortBy === 'updated_asc' || sortBy === 'updated'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                }`}
                title="Urutkan data yang sebelumnya / paling baru diupdate ke posisi teratas"
              >
                <Clock className="w-3 h-3" />
                <span>Terakhir Diupdate {sortBy === 'updated_asc' ? '(Terlama)' : '(Terbaru)'}</span>
                {sortBy === 'updated_asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'name_asc' ? 'name_desc' : 'name_asc')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all inline-flex items-center gap-1 ${
                  sortBy === 'name_asc' || sortBy === 'name' || sortBy === 'name_desc'
                    ? 'bg-red-600 text-white border-red-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
                title="Urutkan Nama Lokasi sesuai abjad A-Z atau Z-A"
              >
                <span>Nama {sortBy === 'name_desc' ? '(Z → A)' : '(A → Z)'}</span>
                {sortBy === 'name_desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'code_asc' ? 'code_desc' : 'code_asc')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all inline-flex items-center gap-1 ${
                  sortBy === 'code_asc' || sortBy === 'code_desc'
                    ? 'bg-red-600 text-white border-red-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
                title="Urutkan Kode KDKMP sesuai abjad"
              >
                <span>Kode {sortBy === 'code_desc' ? '(Z → A)' : '(A → Z)'}</span>
                {sortBy === 'code_desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'wilayah_asc' ? 'wilayah_desc' : 'wilayah_asc')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all inline-flex items-center gap-1 ${
                  sortBy === 'wilayah_asc' || sortBy === 'wilayah_desc'
                    ? 'bg-red-600 text-white border-red-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
                title="Urutkan Wilayah sesuai abjad"
              >
                <span>Wilayah {sortBy === 'wilayah_desc' ? '(Z → A)' : '(A → Z)'}</span>
                {sortBy === 'wilayah_desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className={`py-3 px-4 transition-colors ${isSortActive('name') || isSortActive('code') ? 'bg-red-50/70 text-red-950 font-extrabold' : ''}`}>
                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className={`inline-flex items-center gap-1.5 hover:text-red-700 font-bold transition-colors group select-none text-left ${
                          isSortActive('name') ? 'text-red-700' : 'text-slate-700'
                        }`}
                        title="Klik untuk mengurutkan Nama Lokasi sesuai abjad (A-Z / Z-A)"
                      >
                        <span>Kode & Nama Lokasi KDKMP</span>
                        {renderSortIcon('name')}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSort('code')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1 font-mono transition-all ${
                          isSortActive('code')
                            ? 'bg-red-600 text-white border-red-700 font-bold shadow-xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                        }`}
                        title="Urutkan berdasarkan Kode KDKMP"
                      >
                        <span>Kode</span>
                        {renderSortIcon('code')}
                      </button>
                    </div>
                  </th>
                  <th className={`py-3 px-4 transition-colors ${isSortActive('wilayah') ? 'bg-red-50/70 text-red-950 font-extrabold' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleSort('wilayah')}
                      className={`inline-flex items-center gap-1.5 hover:text-red-700 font-bold transition-colors group select-none ${
                        isSortActive('wilayah') ? 'text-red-700' : 'text-slate-700'
                      }`}
                      title="Klik untuk mengurutkan Wilayah sesuai abjad (A-Z / Z-A)"
                    >
                      <span>Wilayah</span>
                      {renderSortIcon('wilayah')}
                    </button>
                  </th>
                  <th className={`py-3 px-4 text-center transition-colors ${isSortActive('readiness') ? 'bg-red-50/70 text-red-950 font-extrabold' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleSort('readiness')}
                      className={`inline-flex items-center justify-center gap-1.5 hover:text-red-700 font-bold transition-colors group select-none w-full ${
                        isSortActive('readiness') ? 'text-red-700' : 'text-slate-700'
                      }`}
                      title="Klik untuk mengurutkan Skor Kesiapan"
                    >
                      <span>Kesiapan</span>
                      {renderSortIcon('readiness')}
                    </button>
                  </th>
                  <th className={`py-3 px-4 transition-colors ${isSortActive('status') ? 'bg-red-50/70 text-red-950 font-extrabold' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleSort('status')}
                      className={`inline-flex items-center gap-1.5 hover:text-red-700 font-bold transition-colors group select-none ${
                        isSortActive('status') ? 'text-red-700' : 'text-slate-700'
                      }`}
                      title="Klik untuk mengurutkan berdasarkan Status Kesiapan"
                    >
                      <span>Status</span>
                      {renderSortIcon('status')}
                    </button>
                  </th>
                  <th className="py-3 px-3 text-center">Fisik (18)</th>
                  <th className="py-3 px-3 text-center">SDM (4)</th>
                  <th className="py-3 px-3 text-center">Sistem (3)</th>
                  <th className="py-3 px-3 text-center">Produk (6)</th>
                  <th className="py-3 px-3 text-center">Transaksi</th>
                  <th className={`py-3 px-4 transition-colors ${isSortActive('date') ? 'bg-red-50/70 text-red-950 font-extrabold' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleSort('date')}
                      className={`inline-flex items-center gap-1.5 hover:text-red-700 font-bold transition-colors group select-none ${
                        isSortActive('date') ? 'text-red-700' : 'text-slate-700'
                      }`}
                      title="Klik untuk mengurutkan Tanggal Kunjungan"
                    >
                      <span>Kunjungan</span>
                      {renderSortIcon('date')}
                    </button>
                  </th>
                  <th className={`py-3 px-4 transition-colors ${isSortActive('updated') ? 'bg-blue-50/80 text-blue-950 font-extrabold' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleSort('updated')}
                      className={`inline-flex items-center gap-1.5 hover:text-blue-700 font-bold transition-colors group select-none ${
                        isSortActive('updated') ? 'text-blue-700' : 'text-slate-700'
                      }`}
                      title="Klik untuk mengurutkan waktu data terakhir diupdate"
                    >
                      <span>Terakhir Diupdate</span>
                      {renderSortIcon('updated')}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLocations.map((location, idx) => {
                  const score = calculateReadiness(location.checklist);
                  return (
                    <tr key={location.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">{location.namaLokasi}</span>
                          {duplicateNameMap[(location.namaLokasi || '').trim().toLowerCase()]?.length > 1 && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded"
                              title={`Terdapat ${duplicateNameMap[(location.namaLokasi || '').trim().toLowerCase()].length} lokasi dengan nama yang sama`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                              Nama Sama ({duplicateNameMap[(location.namaLokasi || '').trim().toLowerCase()].length}x)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">{location.kodeKDKMP}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {location.desaKelurahan}, {location.kecamatan}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {location.kabupatenKota}, {location.provinsi}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-block font-bold text-xs px-2 py-0.5 rounded ${
                              score.percentage >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : score.percentage >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {score.percentage}% ({score.adaItems}/{score.totalItems})
                          </span>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                score.percentage >= 85
                                  ? 'bg-emerald-500'
                                  : score.percentage >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${score.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(score.status)}</td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenChecklist(location, 'fisik')}
                          className={`px-2 py-0.5 rounded font-semibold text-xs transition-colors hover:ring-1 hover:ring-slate-400 ${
                            score.fisikScore.ada === score.fisikScore.total
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                          title="Klik untuk edit Kelengkapan Fisik & Sarpras"
                        >
                          {score.fisikScore.ada}/18
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenChecklist(location, 'sdm')}
                          className={`px-2 py-0.5 rounded font-semibold text-xs transition-colors hover:ring-1 hover:ring-blue-400 ${
                            score.sdmScore.ada === score.sdmScore.total
                              ? 'bg-blue-50 text-blue-800 font-bold'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                          title="Klik untuk edit Kelengkapan SDM"
                        >
                          {score.sdmScore.ada}/4
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenChecklist(location, 'sistem')}
                          className={`px-2 py-0.5 rounded font-semibold text-xs transition-colors hover:ring-1 hover:ring-purple-400 ${
                            score.sistemScore.ada === score.sistemScore.total
                              ? 'bg-purple-50 text-purple-800 font-bold'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                          title="Klik untuk edit Kelengkapan Sistem"
                        >
                          {score.sistemScore.ada}/3
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenChecklist(location, 'produk')}
                          className={`px-2 py-0.5 rounded font-semibold text-xs transition-colors hover:ring-1 hover:ring-emerald-400 ${
                            score.produkScore.ada === score.produkScore.total
                              ? 'bg-emerald-50 text-emerald-800 font-bold'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                          title="Klik untuk edit Kelengkapan Produk"
                        >
                          {score.produkScore.ada}/6
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenChecklist(location, 'transaksi')}
                          className={`px-2 py-0.5 rounded font-semibold text-[11px] transition-colors hover:ring-1 hover:ring-teal-400 ${
                            score.transaksiCompleted ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'
                          }`}
                          title="Klik untuk edit Peninjauan Transaksi Gerai"
                        >
                          {score.transaksiCompleted ? '✓ Lengkap' : 'Pending'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>{location.tanggalKunjungan}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{location.namaPetugas}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 text-xs">
                            {formatRelativeTime(location.updatedAt).text}
                          </span>
                          {formatRelativeTime(location.updatedAt).isRecent && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded border border-blue-200">
                              Baru
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatIndonesianDate(location.updatedAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenChecklist(location)}
                            className="px-2.5 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-500 inline-flex items-center gap-1 text-[11px]"
                            title="Buka Form Input & Edit Checklist"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            Input & Edit
                          </button>
                          <button
                            onClick={() => onOpenPdfPreview(location)}
                            className="p-1 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                            title="Pratinjau PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditLocation(location)}
                            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="Edit Info"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteConfirm(location)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

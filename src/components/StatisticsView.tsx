import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Users,
  Cpu,
  Package,
  Layers,
  Fuel,
  Wheat,
  DollarSign,
  HelpCircle,
  BarChart,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Eye,
  MapPin,
  Calendar,
  Phone,
  Pill,
  ShoppingBag,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Truck,
  Filter,
  CheckSquare,
  Flame,
  Sprout,
  Store,
  ChevronRight,
  Info
} from 'lucide-react';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';

interface StatisticsViewProps {
  locations: KDKMPLocation[];
  onExportCsv: () => void;
  onSelectLocationForChecklist: (location: KDKMPLocation, tab?: 'fisik' | 'sdm' | 'sistem' | 'produk' | 'transaksi') => void;
  onViewDuplicates?: () => void;
}

type ProductTabFilter = 'all' | 'subsidi' | 'non_subsidi';
type LocationReadinessFilter = 'all' | 'sangat_siap' | 'siap_bersyarat' | 'belum_siap' | 'dual_ready' | 'has_subsidi' | 'has_non_subsidi';

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  locations,
  onExportCsv,
  onSelectLocationForChecklist,
  onViewDuplicates
}) => {
  const total = locations.length;

  // State for interactive detail modal
  const [selectedLocationForDetail, setSelectedLocationForDetail] = useState<KDKMPLocation | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'produk' | 'pilar' | 'profil'>('produk');
  const [productCategoryTab, setProductCategoryTab] = useState<ProductTabFilter>('all');

  // Interactive Active Locations directory state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReadiness, setFilterReadiness] = useState<LocationReadinessFilter>('all');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');
  const [selectedCommodityFilter, setSelectedCommodityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Check for duplicate location names
  const duplicateStats = useMemo(() => {
    const map: Record<string, number> = {};
    locations.forEach(l => {
      const norm = (l.namaLokasi || '').trim().toLowerCase();
      if (norm) map[norm] = (map[norm] || 0) + 1;
    });
    const duplicateNames = Object.keys(map).filter(k => map[k] > 1);
    let totalDuplicateUnits = 0;
    duplicateNames.forEach(k => {
      totalDuplicateUnits += map[k];
    });
    return {
      groups: duplicateNames.length,
      totalUnits: totalDuplicateUnits
    };
  }, [locations]);

  // Readiness scores
  const evaluated = useMemo(() => {
    return locations.map(l => ({
      location: l,
      score: calculateReadiness(l.checklist)
    }));
  }, [locations]);

  const sangatSiap = useMemo(() => evaluated.filter(e => e.score.status === 'Sangat Siap'), [evaluated]);
  const siapBersyarat = useMemo(() => evaluated.filter(e => e.score.status === 'Siap Bersyarat'), [evaluated]);
  const belumSiap = useMemo(() => evaluated.filter(e => e.score.status === 'Belum Siap'), [evaluated]);

  const avgReadiness =
    total > 0 ? Math.round(evaluated.reduce((acc, curr) => acc + curr.score.percentage, 0) / total) : 0;

  const avgFisik =
    total > 0 ? Math.round(evaluated.reduce((acc, curr) => acc + curr.score.fisikScore.pct, 0) / total) : 0;
  const avgSdm =
    total > 0 ? Math.round(evaluated.reduce((acc, curr) => acc + curr.score.sdmScore.pct, 0) / total) : 0;
  const avgSistem =
    total > 0 ? Math.round(evaluated.reduce((acc, curr) => acc + curr.score.sistemScore.pct, 0) / total) : 0;
  const avgProduk =
    total > 0 ? Math.round(evaluated.reduce((acc, curr) => acc + curr.score.produkScore.pct, 0) / total) : 0;

  // Commodities fulfillments (Subsidized & Non-subsidized)
  const countLpg = locations.filter(l => l.checklist.produk.lpg3kg.status === 'ada').length;
  const countPupuk = locations.filter(l => l.checklist.produk.pupukBersubsidi.status === 'ada').length;
  const countBeras = locations.filter(l => l.checklist.produk.berasSPHP.status === 'ada').length;
  const countMinyak = locations.filter(l => l.checklist.produk.minyakita.status === 'ada').length;
  const countGula = locations.filter(l => l.checklist.produk.gula.status === 'ada').length;
  const countObat = locations.filter(l => l.checklist.produk.obatObatan.status === 'ada').length;

  // Subsidized aggregate metrics
  const subsidizedMetrics = useMemo(() => {
    const hasAnySubsidi = locations.filter(l => {
      const p = l.checklist.produk;
      return (
        p.lpg3kg.status === 'ada' ||
        p.pupukBersubsidi.status === 'ada' ||
        p.berasSPHP.status === 'ada' ||
        p.minyakita.status === 'ada'
      );
    }).length;

    const hasAllSubsidi = locations.filter(l => {
      const p = l.checklist.produk;
      return (
        p.lpg3kg.status === 'ada' &&
        p.pupukBersubsidi.status === 'ada' &&
        p.berasSPHP.status === 'ada' &&
        p.minyakita.status === 'ada'
      );
    }).length;

    return {
      hasAnySubsidi,
      hasAllSubsidi,
      pctAny: total > 0 ? Math.round((hasAnySubsidi / total) * 100) : 0,
      pctAll: total > 0 ? Math.round((hasAllSubsidi / total) * 100) : 0
    };
  }, [locations, total]);

  // Non-subsidized aggregate metrics
  const nonSubsidizedMetrics = useMemo(() => {
    const hasAnyNonSubsidi = locations.filter(l => {
      const p = l.checklist.produk;
      return p.gula.status === 'ada' || p.obatObatan.status === 'ada';
    }).length;

    const hasAllNonSubsidi = locations.filter(l => {
      const p = l.checklist.produk;
      return p.gula.status === 'ada' && p.obatObatan.status === 'ada';
    }).length;

    let beliPutusCount = 0;
    let konsinyasiCount = 0;

    locations.forEach(l => {
      const g = l.checklist.produk.gula;
      const o = l.checklist.produk.obatObatan;

      if (g.status === 'ada') {
        if (g.skemaKerjasama === 'beli_putus') beliPutusCount++;
        else if (g.skemaKerjasama === 'konsinyasi') konsinyasiCount++;
      }
      if (o.status === 'ada') {
        if (o.skemaKerjasama === 'beli_putus') beliPutusCount++;
        else if (o.skemaKerjasama === 'konsinyasi') konsinyasiCount++;
      }
    });

    return {
      hasAnyNonSubsidi,
      hasAllNonSubsidi,
      pctAny: total > 0 ? Math.round((hasAnyNonSubsidi / total) * 100) : 0,
      pctAll: total > 0 ? Math.round((hasAllNonSubsidi / total) * 100) : 0,
      beliPutusCount,
      konsinyasiCount
    };
  }, [locations, total]);

  // Dual readiness: locations with both subsidized and non-subsidized
  const dualReadyCount = useMemo(() => {
    return locations.filter(l => {
      const p = l.checklist.produk;
      const hasSub = p.lpg3kg.status === 'ada' || p.pupukBersubsidi.status === 'ada' || p.berasSPHP.status === 'ada' || p.minyakita.status === 'ada';
      const hasNonSub = p.gula.status === 'ada' || p.obatObatan.status === 'ada';
      return hasSub && hasNonSub;
    }).length;
  }, [locations]);

  // SDM highlights
  const countManajer = locations.filter(l => l.checklist.sdm.manajerKD.status === 'ada').length;
  const countLokal = locations.filter(l => l.checklist.sdm.sdmRekrutmenAPN.masyarakatSekitar === 'ya').length;
  const countPembekalan = locations.filter(l => l.checklist.sdm.pembekalanManajer.status === 'ada').length;

  // Payment mechanism breakdown
  const countCashOnly = locations.filter(l => l.checklist.transaksi.mekanismeTransaksi.pilihan === 'cash').length;
  const countCashlessOnly = locations.filter(l => l.checklist.transaksi.mekanismeTransaksi.pilihan === 'cashless').length;
  const countBothPayments = locations.filter(l => l.checklist.transaksi.mekanismeTransaksi.pilihan === 'keduanya').length;

  // Province grouping
  const provinceMap: Record<string, { total: number; ready: number; conditional: number; notReady: number }> = {};
  evaluated.forEach(e => {
    const prov = e.location.provinsi || 'Lainnya';
    if (!provinceMap[prov]) {
      provinceMap[prov] = { total: 0, ready: 0, conditional: 0, notReady: 0 };
    }
    provinceMap[prov].total++;
    if (e.score.status === 'Sangat Siap') provinceMap[prov].ready++;
    else if (e.score.status === 'Siap Bersyarat') provinceMap[prov].conditional++;
    else provinceMap[prov].notReady++;
  });

  const [provSortCol, setProvSortCol] = useState<'prov' | 'total' | 'ready' | 'conditional' | 'notReady' | 'pct'>('prov');
  const [provSortDir, setProvSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedProvinceEntries = useMemo(() => {
    return Object.entries(provinceMap).sort((a, b) => {
      const [provA, dataA] = a;
      const [provB, dataB] = b;
      const pctA = Math.round((dataA.ready / dataA.total) * 100);
      const pctB = Math.round((dataB.ready / dataB.total) * 100);

      let cmp = 0;
      if (provSortCol === 'prov') {
        cmp = provA.localeCompare(provB, 'id', { sensitivity: 'base' });
      } else if (provSortCol === 'total') {
        cmp = dataA.total - dataB.total;
      } else if (provSortCol === 'ready') {
        cmp = dataA.ready - dataB.ready;
      } else if (provSortCol === 'conditional') {
        cmp = dataA.conditional - dataB.conditional;
      } else if (provSortCol === 'notReady') {
        cmp = dataA.notReady - dataB.notReady;
      } else if (provSortCol === 'pct') {
        cmp = pctA - pctB;
      }
      return provSortDir === 'asc' ? cmp : -cmp;
    });
  }, [provinceMap, provSortCol, provSortDir]);

  const handleToggleProvSort = (col: 'prov' | 'total' | 'ready' | 'conditional' | 'notReady' | 'pct') => {
    if (provSortCol === col) {
      setProvSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setProvSortCol(col);
      setProvSortDir(col === 'prov' ? 'asc' : 'desc');
    }
  };

  const renderProvSortIcon = (col: 'prov' | 'total' | 'ready' | 'conditional' | 'notReady' | 'pct') => {
    if (provSortCol === col) {
      return provSortDir === 'asc' ? (
        <ArrowUp className="w-3 h-3 text-red-600 inline ml-1 shrink-0" />
      ) : (
        <ArrowDown className="w-3 h-3 text-red-600 inline ml-1 shrink-0" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 text-slate-400 inline ml-1 opacity-60 group-hover:opacity-100 shrink-0" />;
  };

  // Filtered locations for the interactive directory
  const filteredLocations = useMemo(() => {
    return evaluated.filter(({ location: loc, score }) => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (loc.namaLokasi || '').toLowerCase().includes(q);
        const matchCode = (loc.kodeKDKMP || '').toLowerCase().includes(q);
        const matchProv = (loc.provinsi || '').toLowerCase().includes(q);
        const matchKab = (loc.kabupatenKota || '').toLowerCase().includes(q);
        const matchKec = (loc.kecamatan || '').toLowerCase().includes(q);
        const matchDesa = (loc.desaKelurahan || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchProv && !matchKab && !matchKec && !matchDesa) {
          return false;
        }
      }

      // Province filter
      if (selectedProvinceFilter !== 'all' && loc.provinsi !== selectedProvinceFilter) {
        return false;
      }

      // Readiness filter
      if (filterReadiness === 'sangat_siap' && score.status !== 'Sangat Siap') return false;
      if (filterReadiness === 'siap_bersyarat' && score.status !== 'Siap Bersyarat') return false;
      if (filterReadiness === 'belum_siap' && score.status !== 'Belum Siap') return false;

      const p = loc.checklist.produk;
      const hasSub = p.lpg3kg.status === 'ada' || p.pupukBersubsidi.status === 'ada' || p.berasSPHP.status === 'ada' || p.minyakita.status === 'ada';
      const hasNonSub = p.gula.status === 'ada' || p.obatObatan.status === 'ada';

      if (filterReadiness === 'dual_ready' && (!hasSub || !hasNonSub)) return false;
      if (filterReadiness === 'has_subsidi' && !hasSub) return false;
      if (filterReadiness === 'has_non_subsidi' && !hasNonSub) return false;

      // Commodity filter
      if (selectedCommodityFilter === 'lpg' && p.lpg3kg.status !== 'ada') return false;
      if (selectedCommodityFilter === 'pupuk' && p.pupukBersubsidi.status !== 'ada') return false;
      if (selectedCommodityFilter === 'beras' && p.berasSPHP.status !== 'ada') return false;
      if (selectedCommodityFilter === 'minyak' && p.minyakita.status !== 'ada') return false;
      if (selectedCommodityFilter === 'gula' && p.gula.status !== 'ada') return false;
      if (selectedCommodityFilter === 'obat' && p.obatObatan.status !== 'ada') return false;

      return true;
    });
  }, [evaluated, searchQuery, selectedProvinceFilter, filterReadiness, selectedCommodityFilter]);

  const uniqueProvinces = useMemo(() => {
    const set = new Set<string>();
    locations.forEach(l => {
      if (l.provinsi) set.add(l.provinsi);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, [locations]);

  const handleApplyQuickFilter = (readiness: LocationReadinessFilter, commodity: string = 'all') => {
    setFilterReadiness(readiness);
    setSelectedCommodityFilter(commodity);
    const targetEl = document.getElementById('direktori-lokasi-aktif-stats');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-red-400 bg-red-950/60 px-2.5 py-1 rounded border border-red-800/40">
            Executive Summary & Analytics
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">
            Statistik Kesiapan Operasionalisasi KDKMP
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Hasil monitoring dan evaluasi terpadu instrumen resmi evaluasi gerai & gudang KDKMP, komparasi pasokan <strong>Produk Subsidi & Non-Subsidi</strong>, serta direktori lokasi aktif interaktif.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <button
            onClick={() => {
              const el = document.getElementById('direktori-lokasi-aktif-stats');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4" />
            Daftar Lokasi Aktif ({total})
          </button>
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors self-start md:self-auto shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Rekapitulasi (CSV/Excel)
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Unit */}
        <div
          onClick={() => handleApplyQuickFilter('all')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-400 hover:shadow-sm transition-all group"
          title="Klik untuk melihat seluruh lokasi aktif"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold group-hover:text-slate-900 transition-colors">Total Unit KDKMP</span>
            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{Object.keys(provinceMap).length} Provinsi</span>
            <span className="text-red-600 font-semibold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
              Lihat →
            </span>
          </div>
        </div>

        {/* Rata-rata Kesiapan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Rerata Kesiapan</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{avgReadiness}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${avgReadiness}%` }} />
          </div>
        </div>

        {/* Sangat Siap */}
        <div
          onClick={() => handleApplyQuickFilter('sangat_siap')}
          className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all group"
          title="Klik untuk memfilter gerai Sangat Siap"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Sangat Siap</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{sangatSiap.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center justify-between">
            <span>{total > 0 ? Math.round((sangatSiap.length / total) * 100) : 0}% Siap Operasional</span>
            <span className="font-semibold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
              Filter →
            </span>
          </div>
        </div>

        {/* Siap Bersyarat */}
        <div
          onClick={() => handleApplyQuickFilter('siap_bersyarat')}
          className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all group"
          title="Klik untuk memfilter gerai Siap Bersyarat"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Siap Bersyarat</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{siapBersyarat.length}</div>
          <div className="text-[11px] text-amber-600 mt-1 flex items-center justify-between">
            <span>{total > 0 ? Math.round((siapBersyarat.length / total) * 100) : 0}% Butuh Pemenuhan</span>
            <span className="font-semibold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
              Filter →
            </span>
          </div>
        </div>

        {/* Belum Siap */}
        <div
          onClick={() => handleApplyQuickFilter('belum_siap')}
          className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs col-span-2 lg:col-span-1 cursor-pointer hover:border-rose-400 hover:shadow-sm transition-all group"
          title="Klik untuk memfilter gerai Belum Siap"
        >
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold">Belum Siap</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{belumSiap.length}</div>
          <div className="text-[11px] text-rose-600 mt-1 flex items-center justify-between">
            <span>{total > 0 ? Math.round((belumSiap.length / total) * 100) : 0}% Tahap Persiapan</span>
            <span className="font-semibold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
              Filter →
            </span>
          </div>
        </div>
      </div>

      {/* Duplicate Location Names Alert in Statistics View */}
      {duplicateStats.totalUnits > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-amber-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 rounded-lg text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Pemeriksaan Integritas Data: {duplicateStats.totalUnits} Lokasi Memiliki Nama yang Sama
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Terdeteksi <strong>{duplicateStats.groups} nama lokasi</strong> yang digunakan pada lebih dari 1 unit KDKMP. Periksa untuk memastikan tidak ada kesalahan entri ganda atau tambahkan nama desa/unit pembeda.
              </p>
            </div>
          </div>
          {onViewDuplicates && (
            <button
              onClick={onViewDuplicates}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              Periksa Nama Ganda di Rekap Lokasi
            </button>
          )}
        </div>
      )}

      {/* Row: 4 Pilar Kesiapan & SDM / Transaksi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pilar Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Capaian 4 Aspek Peninjauan Gudang & Gerai</h3>
              <p className="text-xs text-slate-500">Rata-rata persentase pemenuhan indikator resmi</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 text-xs">
            {/* Fisik */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  1. Fisik serta Sarana & Prasarana (18 Indikator)
                </span>
                <span className="font-bold text-slate-900">{avgFisik}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: `${avgFisik}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Bangunan gerai, gudang LPG/pupuk, listrik, air, klinik, rak display, kasir POS, armada mobil/motor
              </p>
            </div>

            {/* SDM */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  2. Kelengkapan SDM & Tata Kelola (4 Indikator)
                </span>
                <span className="font-bold text-slate-900">{avgSdm}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${avgSdm}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Ketersediaan manajer, rekrutmen APN warga lokal, koordinasi Kades, pembekalan pasca 2 tahun
              </p>
            </div>

            {/* Sistem */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-600" />
                  3. Kelengkapan Sistem Digital (3 Indikator)
                </span>
                <span className="font-bold text-slate-900">{avgSistem}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${avgSistem}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Sistem stok barang, sistem pemesanan produk, dan sistem absensi pegawai
              </p>
            </div>

            {/* Produk */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  4. Kelengkapan Pasokan Produk (6 Indikator)
                </span>
                <span className="font-bold text-slate-900">{avgProduk}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full" style={{ width: `${avgProduk}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                LPG 3kg, pupuk subsidi, beras SPHP, Minyakita, gula & obat-obatan
              </p>
            </div>
          </div>
        </div>

        {/* SDM & Transaksi Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">SDM & Mekanisme Transaksi Gerai</h3>
              <p className="text-xs text-slate-500">Kesiapan operasional pelayanan kasir & personel</p>
            </div>
            <Users className="w-4 h-4 text-blue-500" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Manajer KD/KMP Terisi
              </span>
              <span className="font-bold text-slate-900">
                {countManajer} / {total} ({total > 0 ? Math.round((countManajer / total) * 100) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Staf Warga Lokal (APN)
              </span>
              <span className="font-bold text-emerald-700">
                {countLokal} / {total} ({total > 0 ? Math.round((countLokal / total) * 100) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Pembekalan Pasca 2 Tahun
              </span>
              <span className="font-bold text-indigo-700">
                {countPembekalan} / {total} ({total > 0 ? Math.round((countPembekalan / total) * 100) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-600 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Pembayaran Digital & Tunai (Dual)
              </span>
              <span className="font-bold text-emerald-700">
                {countBothPayments} / {total} ({total > 0 ? Math.round((countBothPayments / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wilayah Table Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-slate-800">Rekapitulasi Kesiapan per Wilayah Provinsi</h4>
            <p className="text-[11px] text-slate-500">
              Total {Object.keys(provinceMap).length} Provinsi • Diurutkan berdasarkan:{' '}
              <strong className="text-slate-800">
                {provSortCol === 'prov'
                  ? `Provinsi (${provSortDir === 'asc' ? 'A → Z' : 'Z → A'})`
                  : provSortCol === 'total'
                  ? 'Total Unit'
                  : provSortCol === 'ready'
                  ? 'Sangat Siap'
                  : provSortCol === 'pct'
                  ? 'Persentase Siap'
                  : provSortCol}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Sort Abjad:</span>
            <button
              type="button"
              onClick={() => {
                setProvSortCol('prov');
                setProvSortDir('asc');
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all inline-flex items-center gap-1 cursor-pointer ${
                provSortCol === 'prov' && provSortDir === 'asc'
                  ? 'bg-red-600 text-white border-red-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Urutkan nama Provinsi A sampai Z"
            >
              <span>A → Z</span>
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                setProvSortCol('prov');
                setProvSortDir('desc');
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all inline-flex items-center gap-1 cursor-pointer ${
                provSortCol === 'prov' && provSortDir === 'desc'
                  ? 'bg-red-600 text-white border-red-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Urutkan nama Provinsi Z sampai A"
            >
              <span>Z → A</span>
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider select-none border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleToggleProvSort('prov')}
                  className={`py-3 px-4 cursor-pointer hover:bg-slate-200/80 transition-colors ${
                    provSortCol === 'prov' ? 'bg-red-50 text-red-950 font-extrabold' : ''
                  }`}
                  title="Klik untuk mengurutkan nama provinsi sesuai abjad (A-Z / Z-A)"
                >
                  <div className="flex items-center gap-1">
                    <span>Provinsi</span>
                    {renderProvSortIcon('prov')}
                  </div>
                </th>
                <th
                  onClick={() => handleToggleProvSort('total')}
                  className={`py-3 px-4 text-center cursor-pointer hover:bg-slate-200/80 transition-colors ${
                    provSortCol === 'total' ? 'bg-red-50 text-red-950 font-extrabold' : ''
                  }`}
                  title="Klik untuk mengurutkan Total Unit"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total Unit</span>
                    {renderProvSortIcon('total')}
                  </div>
                </th>
                <th
                  onClick={() => handleToggleProvSort('ready')}
                  className={`py-3 px-4 text-center cursor-pointer hover:bg-slate-200/80 transition-colors ${
                    provSortCol === 'ready' ? 'bg-red-50 text-red-950 font-extrabold' : ''
                  }`}
                  title="Klik untuk mengurutkan Sangat Siap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Sangat Siap (🟢)</span>
                    {renderProvSortIcon('ready')}
                  </div>
                </th>
                <th
                  onClick={() => handleToggleProvSort('conditional')}
                  className={`py-3 px-4 text-center cursor-pointer hover:bg-slate-200/80 transition-colors ${
                    provSortCol === 'conditional' ? 'bg-red-50 text-red-950 font-extrabold' : ''
                  }`}
                  title="Klik untuk mengurutkan Siap Bersyarat"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Siap Bersyarat (🟡)</span>
                    {renderProvSortIcon('conditional')}
                  </div>
                </th>
                <th
                  onClick={() => handleToggleProvSort('notReady')}
                  className={`py-3 px-4 text-center cursor-pointer hover:bg-slate-200/80 transition-colors ${
                    provSortCol === 'notReady' ? 'bg-red-50 text-red-950 font-extrabold' : ''
                  }`}
                  title="Klik untuk mengurutkan Belum Siap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Belum Siap (🔴)</span>
                    {renderProvSortIcon('notReady')}
                  </div>
                </th>
                <th
                  onClick={() => handleToggleProvSort('pct')}
                  className={`py-3 px-4 text-center cursor-pointer hover:bg-slate-200/80 transition-colors ${
                    provSortCol === 'pct' ? 'bg-red-50 text-red-950 font-extrabold' : ''
                  }`}
                  title="Klik untuk mengurutkan Persentase Siap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Persentase Siap</span>
                    {renderProvSortIcon('pct')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProvinceEntries.map(([prov, data]) => {
                const readyPct = Math.round((data.ready / data.total) * 100);
                return (
                  <tr
                    key={prov}
                    onClick={() => {
                      setSelectedProvinceFilter(prov);
                      const el = document.getElementById('direktori-lokasi-aktif-stats');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:bg-red-50/50 cursor-pointer transition-colors group"
                    title={`Klik untuk memfilter daftar lokasi aktif di provinsi ${prov}`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-red-700 transition-colors flex items-center justify-between">
                      <span>{prov}</span>
                      <span className="text-[10px] text-red-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                        Lihat Unit →
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">{data.total}</td>
                    <td className="py-3 px-4 text-center text-emerald-700 font-semibold">{data.ready}</td>
                    <td className="py-3 px-4 text-center text-amber-700 font-semibold">{data.conditional}</td>
                    <td className="py-3 px-4 text-center text-rose-700 font-semibold">{data.notReady}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {readyPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEKSI: RINCIAN KOMPARASI PASOKAN: PRODUK SUBSIDI VS NON-SUBSIDI */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Seksi Komparasi Produk */}
        <div className="p-5 bg-gradient-to-r from-slate-50 via-red-50/40 to-amber-50/20 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                <Package className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Rincian Komparasi Pasokan: Produk Subsidi vs Non-Subsidi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian ketersediaan, pemenuhan pasokan strategis pemerintah, serta jejaring komersial gerai KDKMP
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Filter Kategori Produk */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto text-xs font-semibold">
            <button
              onClick={() => setProductCategoryTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                productCategoryTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Komoditas
            </button>
            <button
              onClick={() => setProductCategoryTab('subsidi')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                productCategoryTab === 'subsidi'
                  ? 'bg-red-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-red-700'
              }`}
            >
              <Wheat className="w-3.5 h-3.5" />
              Produk Subsidi (4)
            </button>
            <button
              onClick={() => setProductCategoryTab('non_subsidi')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                productCategoryTab === 'non_subsidi'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Produk Non-Subsidi (2)
            </button>
          </div>
        </div>

        {/* 4 Highlight Metrics Strip */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Dual Kesiapan */}
            <div
              onClick={() => handleApplyQuickFilter('dual_ready')}
              className="p-4 bg-white rounded-xl border border-purple-200 shadow-2xs cursor-pointer hover:border-purple-400 hover:shadow-xs transition-all group"
              title="Klik untuk memfilter gerai yang siap Subsidi & Non-Subsidi sekaligus"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Dual Kesiapan</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-900">
                {dualReadyCount} <span className="text-xs font-normal text-slate-500">Unit</span>
              </div>
              <p className="text-[11px] text-purple-700 mt-1">
                {total > 0 ? Math.round((dualReadyCount / total) * 100) : 0}% gerai menyalurkan <strong>kedua jenis komoditas</strong>
              </p>
            </div>

            {/* Box 2: Total Gerai Bersubsidi */}
            <div
              onClick={() => handleApplyQuickFilter('has_subsidi')}
              className="p-4 bg-white rounded-xl border border-red-200 shadow-2xs cursor-pointer hover:border-red-400 hover:shadow-xs transition-all group"
              title="Klik untuk memfilter gerai yang memiliki pasokan subsidi"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Penyalur Subsidi Aktif</span>
                <Wheat className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-black text-red-900">
                {subsidizedMetrics.hasAnySubsidi} <span className="text-xs font-normal text-slate-500">Unit</span>
              </div>
              <p className="text-[11px] text-red-700 mt-1">
                {subsidizedMetrics.pctAny}% gerai memiliki &ge;1 komoditas bersubsidi
              </p>
            </div>

            {/* Box 3: Total Gerai Non-Subsidi */}
            <div
              onClick={() => handleApplyQuickFilter('has_non_subsidi')}
              className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all group"
              title="Klik untuk memfilter gerai yang memiliki pasokan non-subsidi"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Penyalur Non-Subsidi</span>
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-900">
                {nonSubsidizedMetrics.hasAnyNonSubsidi} <span className="text-xs font-normal text-slate-500">Unit</span>
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                {nonSubsidizedMetrics.pctAny}% gerai aktif menjual gula / apotek obat
              </p>
            </div>

            {/* Box 4: Model Skema Kemitraan Non-Subsidi */}
            <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Skema Kerjasama Komersial</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div>
                  <span className="text-xs text-slate-500 block">Beli Putus</span>
                  <span className="text-base font-black text-slate-900">{nonSubsidizedMetrics.beliPutusCount} Item</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-xs text-slate-500 block">Konsinyasi</span>
                  <span className="text-base font-black text-emerald-700">{nonSubsidizedMetrics.konsinyasiCount} Item</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Kemitraan distributor resmi & apotek mitra
              </p>
            </div>
          </div>
        </div>

        {/* Content Tabs Body */}
        <div className="p-5 space-y-6">
          {/* TAB 1: PRODUK SUBSIDI */}
          {(productCategoryTab === 'all' || productCategoryTab === 'subsidi') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Produk Subsidi
                  </h4>
                  <span className="text-xs bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                    Mandat Program Pemerintah
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {subsidizedMetrics.hasAllSubsidi} dari {total} unit ({subsidizedMetrics.pctAll}%) memiliki ke-4 komoditas subsidi lengkap
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. LPG 3 KG */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-red-300 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        Pertamina
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-red-600" />
                        LPG 3 Kg (Melon)
                      </h5>
                    </div>
                    <button
                      onClick={() => handleApplyQuickFilter('all', 'lpg')}
                      className="text-[11px] text-red-600 hover:text-red-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                      title="Lihat daftar lokasi dengan pasokan LPG 3kg"
                    >
                      Filter <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Ketersediaan Pasokan</span>
                      <span className="font-bold text-slate-900">{countLpg}/{total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (countLpg / total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                      <span className="text-red-700 font-bold">
                        {total > 0 ? Math.round((countLpg / total) * 100) : 0}% Lokasi Aktif
                      </span>
                      <span>{total - countLpg} Belum Ada</span>
                    </div>
                  </div>
                </div>

                {/* 2. PUPUK BERSUBSIDI */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-emerald-300 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Pupuk Indonesia
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-1.5">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        Pupuk Bersubsidi
                      </h5>
                    </div>
                    <button
                      onClick={() => handleApplyQuickFilter('all', 'pupuk')}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                      title="Lihat daftar lokasi dengan pasokan Pupuk Bersubsidi"
                    >
                      Filter <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Ketersediaan Pasokan</span>
                      <span className="font-bold text-slate-900">{countPupuk}/{total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (countPupuk / total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                      <span className="text-emerald-700 font-bold">
                        {total > 0 ? Math.round((countPupuk / total) * 100) : 0}% Lokasi Aktif
                      </span>
                      <span>{total - countPupuk} Belum Ada</span>
                    </div>
                  </div>
                </div>

                {/* 3. BERAS SPHP BULOG */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-amber-300 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        Perum BULOG
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-1.5">
                        <Wheat className="w-4 h-4 text-amber-600" />
                        Beras SPHP Bulog
                      </h5>
                    </div>
                    <button
                      onClick={() => handleApplyQuickFilter('all', 'beras')}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                      title="Lihat daftar lokasi dengan pasokan Beras SPHP"
                    >
                      Filter <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Ketersediaan Pasokan</span>
                      <span className="font-bold text-slate-900">{countBeras}/{total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (countBeras / total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                      <span className="text-amber-700 font-bold">
                        {total > 0 ? Math.round((countBeras / total) * 100) : 0}% Lokasi Aktif
                      </span>
                      <span>{total - countBeras} Belum Ada</span>
                    </div>
                  </div>
                </div>

                {/* 4. MINYAKITA */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-yellow-300 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded">
                        Kemendag / BUMN Pangan
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-1.5">
                        <Fuel className="w-4 h-4 text-yellow-600" />
                        Minyakita (Minyak Goreng)
                      </h5>
                    </div>
                    <button
                      onClick={() => handleApplyQuickFilter('all', 'minyak')}
                      className="text-[11px] text-yellow-800 hover:text-yellow-950 font-semibold flex items-center gap-0.5 cursor-pointer"
                      title="Lihat daftar lokasi dengan pasokan Minyakita"
                    >
                      Filter <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Ketersediaan Pasokan</span>
                      <span className="font-bold text-slate-900">{countMinyak}/{total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (countMinyak / total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                      <span className="text-yellow-800 font-bold">
                        {total > 0 ? Math.round((countMinyak / total) * 100) : 0}% Lokasi Aktif
                      </span>
                      <span>{total - countMinyak} Belum Ada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUK NON-SUBSIDI */}
          {(productCategoryTab === 'all' || productCategoryTab === 'non_subsidi') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Produk Non-Subsidi & Layanan Kesehatan Desa (Instrumen B.4.5 - B.4.6)
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                    Kemitraan Komersial & Apotek Desa
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {nonSubsidizedMetrics.hasAllNonSubsidi} dari {total} unit ({nonSubsidizedMetrics.pctAll}%) memiliki gula & apotek lengkap
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. GULA PASIR */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Kebutuhan Pokok Komersial
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        Gula Pasir (Konsumsi & UMKM)
                      </h5>
                    </div>
                    <button
                      onClick={() => handleApplyQuickFilter('all', 'gula')}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                      title="Lihat daftar lokasi dengan ketersediaan Gula Pasir"
                    >
                      Filter <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Ketersediaan Pasokan</span>
                      <span className="font-bold text-slate-900">{countGula}/{total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (countGula / total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                      <span className="text-blue-700 font-bold">
                        {total > 0 ? Math.round((countGula / total) * 100) : 0}% Lokasi Aktif
                      </span>
                      <span>{total - countGula} Belum Ada</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Skema Utama:</span>
                      <strong className="text-slate-800">
                        {locations.filter(l => l.checklist.produk.gula.skemaKerjasama === 'beli_putus').length} Beli Putus / {locations.filter(l => l.checklist.produk.gula.skemaKerjasama === 'konsinyasi').length} Konsinyasi
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Sumber Suplai:</span>
                      <strong className="text-slate-800 truncate block">PTPN / Distributor Lokal</strong>
                    </div>
                  </div>
                </div>

                {/* 2. OBAT-OBATAN & APOTEK DESA */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-emerald-300 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                        Kesehatan & P3K Desa
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-600" />
                        Obat-obatan & Apotek KDKMP
                      </h5>
                    </div>
                    <button
                      onClick={() => handleApplyQuickFilter('all', 'obat')}
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                      title="Lihat daftar lokasi dengan ketersediaan Obat-obatan / Apotek"
                    >
                      Filter <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Ketersediaan Pasokan</span>
                      <span className="font-bold text-slate-900">{countObat}/{total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (countObat / total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                      <span className="text-teal-700 font-bold">
                        {total > 0 ? Math.round((countObat / total) * 100) : 0}% Lokasi Aktif
                      </span>
                      <span>{total - countObat} Belum Ada</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Skema Utama:</span>
                      <strong className="text-slate-800">
                        {locations.filter(l => l.checklist.produk.obatObatan.skemaKerjasama === 'konsinyasi').length} Konsinyasi / {locations.filter(l => l.checklist.produk.obatObatan.skemaKerjasama === 'beli_putus').length} Beli Putus
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Mitra Farmasi:</span>
                      <strong className="text-slate-800 truncate block">Kimia Farma / Apotek Mitra / Dinkes</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEKSI INTERAKTIF: DIREKTORI LOKASI AKTIF (BISA DI-KLIK UNTUK MELIHAT DETAIL) */}
      {/* ========================================================================= */}
      <div id="direktori-lokasi-aktif-stats" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-6">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600 text-white rounded-lg">
                <Store className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-base text-slate-900">
                Direktori Lokasi Aktif KDKMP (Klik untuk Melihat Detail)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {filteredLocations.length} dari {total} unit KDKMP. Klik salah satu lokasi untuk membuka detail rincian produk subsidi, non-subsidi, sarana fisik, dan evaluasi operasional.
            </p>
          </div>

          {/* Quick Stats on View */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
              🟢 {sangatSiap.length} Sangat Siap
            </span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md border border-amber-200">
              🟡 {siapBersyarat.length} Bersyarat
            </span>
            <div className="border-l border-slate-300 pl-2 ml-1 flex items-center bg-white rounded-lg p-0.5 border">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                  viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kartu
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabel
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama lokasi, kode KDKMP, desa, kecamatan, atau kabupaten..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Provinsi */}
            <div className="w-full sm:w-56 shrink-0">
              <select
                value={selectedProvinceFilter}
                onChange={e => setSelectedProvinceFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="all">Semua Provinsi ({uniqueProvinces.length})</option>
                {uniqueProvinces.map(prov => (
                  <option key={prov} value={prov}>
                    {prov} ({locations.filter(l => l.provinsi === prov).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Komoditas Khusus */}
            <div className="w-full sm:w-52 shrink-0">
              <select
                value={selectedCommodityFilter}
                onChange={e => setSelectedCommodityFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="all">Filter Komoditas: Semua</option>
                <option value="lpg">Hanya Punya LPG 3 Kg ({countLpg})</option>
                <option value="pupuk">Hanya Punya Pupuk Subsidi ({countPupuk})</option>
                <option value="beras">Hanya Punya Beras SPHP ({countBeras})</option>
                <option value="minyak">Hanya Punya Minyakita ({countMinyak})</option>
                <option value="gula">Hanya Punya Gula Pasir ({countGula})</option>
                <option value="obat">Hanya Punya Apotek/Obat ({countObat})</option>
              </select>
            </div>
          </div>

          {/* Quick Chip Filters */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter Status:
            </span>
            <button
              onClick={() => setFilterReadiness('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                filterReadiness === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua ({total})
            </button>
            <button
              onClick={() => setFilterReadiness('sangat_siap')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                filterReadiness === 'sangat_siap'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              🟢 Sangat Siap ({sangatSiap.length})
            </button>
            <button
              onClick={() => setFilterReadiness('siap_bersyarat')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                filterReadiness === 'siap_bersyarat'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              🟡 Siap Bersyarat ({siapBersyarat.length})
            </button>
            <button
              onClick={() => setFilterReadiness('dual_ready')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                filterReadiness === 'dual_ready'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              ✨ Siap Subsidi & Non-Subsidi ({dualReadyCount})
            </button>
            <button
              onClick={() => setFilterReadiness('has_subsidi')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                filterReadiness === 'has_subsidi'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
              }`}
            >
              🌾 Ada Produk Subsidi ({subsidizedMetrics.hasAnySubsidi})
            </button>
            <button
              onClick={() => setFilterReadiness('has_non_subsidi')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                filterReadiness === 'has_non_subsidi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              💊 Ada Produk Non-Subsidi ({nonSubsidizedMetrics.hasAnyNonSubsidi})
            </button>

            {(searchQuery || selectedProvinceFilter !== 'all' || selectedCommodityFilter !== 'all' || filterReadiness !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvinceFilter('all');
                  setSelectedCommodityFilter('all');
                  setFilterReadiness('all');
                }}
                className="ml-auto text-[11px] text-red-600 hover:text-red-800 font-semibold underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>

        {/* Directory Content List/Cards */}
        <div className="p-5">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h5 className="font-bold text-slate-700 text-sm">Tidak ada lokasi yang sesuai kriteria filter</h5>
              <p className="text-xs text-slate-400 mt-1">
                Coba sesuaikan kata kunci pencarian atau ubah filter status/wilayah di atas.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvinceFilter('all');
                  setSelectedCommodityFilter('all');
                  setFilterReadiness('all');
                }}
                className="mt-3 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Tampilkan Semua Lokasi
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            /* GRID VIEW CARDS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map(({ location: loc, score }) => {
                const p = loc.checklist.produk;
                const isReady = score.status === 'Sangat Siap';
                const isConditional = score.status === 'Siap Bersyarat';

                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocationForDetail(loc);
                      setActiveModalTab('produk');
                    }}
                    className="bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                  >
                    {/* Top Status Bar indicator */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        isReady ? 'bg-emerald-500' : isConditional ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />

                    <div>
                      {/* Header Card */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {loc.kodeKDKMP || 'KDKMP'}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-700 transition-colors mt-1 line-clamp-1">
                            {loc.namaLokasi}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {loc.desaKelurahan ? `Desa ${loc.desaKelurahan}, ` : ''}{loc.kabupatenKota || loc.provinsi}
                            </span>
                          </p>
                        </div>

                        {/* Readiness Score Badge */}
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                              isReady
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isConditional
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {score.percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {score.status}
                          </span>
                        </div>
                      </div>

                      {/* Commodities Readiness Badges */}
                      <div className="my-3 pt-2.5 border-t border-slate-100 space-y-2">
                        {/* Subsidized Row */}
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Produk Subsidi:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                p.lpg3kg.status === 'ada'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                              }`}
                            >
                              LPG 3kg
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                p.pupukBersubsidi.status === 'ada'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                              }`}
                            >
                              Pupuk Sub
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                p.berasSPHP.status === 'ada'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                              }`}
                            >
                              Beras SPHP
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                p.minyakita.status === 'ada'
                                  ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                              }`}
                            >
                              Minyakita
                            </span>
                          </div>
                        </div>

                        {/* Non-Subsidized Row */}
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Produk Non-Subsidi:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                p.gula.status === 'ada'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                              }`}
                            >
                              Gula Pasir
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                p.obatObatan.status === 'ada'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                              }`}
                            >
                              Apotek / Obat
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {loc.namaPetugas ? `Petugas: ${loc.namaPetugas}` : 'KDKMP Unit'}
                      </span>
                      <span className="text-red-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                        Lihat Detail <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider select-none border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Kode & Lokasi</th>
                    <th className="py-3 px-3">Wilayah</th>
                    <th className="py-3 px-3 text-center">Kesiapan</th>
                    <th className="py-3 px-3 text-center">Produk Subsidi</th>
                    <th className="py-3 px-3 text-center">Produk Non-Subsidi</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLocations.map(({ location: loc, score }) => {
                    const p = loc.checklist.produk;
                    const subCount = [p.lpg3kg, p.pupukBersubsidi, p.berasSPHP, p.minyakita].filter(i => i.status === 'ada').length;
                    const nonSubCount = [p.gula, p.obatObatan].filter(i => i.status === 'ada').length;

                    return (
                      <tr
                        key={loc.id}
                        onClick={() => {
                          setSelectedLocationForDetail(loc);
                          setActiveModalTab('produk');
                        }}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                            {loc.kodeKDKMP}
                          </span>
                          <div className="font-bold text-slate-900 group-hover:text-red-600 transition-colors mt-0.5">
                            {loc.namaLokasi}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div>{loc.kabupatenKota || '-'}</div>
                          <div className="text-[10px] text-slate-400">{loc.provinsi}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                              score.status === 'Sangat Siap'
                                ? 'bg-emerald-100 text-emerald-800'
                                : score.status === 'Siap Bersyarat'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {score.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-semibold text-slate-800">
                            {subCount} / 4 Komoditas
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {[
                              p.lpg3kg.status === 'ada' ? 'LPG' : null,
                              p.pupukBersubsidi.status === 'ada' ? 'Pupuk' : null,
                              p.berasSPHP.status === 'ada' ? 'Beras' : null,
                              p.minyakita.status === 'ada' ? 'Minyak' : null
                            ].filter(Boolean).join(', ') || 'Belum ada'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-semibold text-slate-800">
                            {nonSubCount} / 2 Komoditas
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {[
                              p.gula.status === 'ada' ? 'Gula' : null,
                              p.obatObatan.status === 'ada' ? 'Obat' : null
                            ].filter(Boolean).join(', ') || 'Belum ada'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedLocationForDetail(loc);
                              setActiveModalTab('produk');
                            }}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-semibold text-[11px] border border-red-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Field Challenges & Support Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HelpCircle className="w-4 h-4 text-red-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Kendala Lapangan & Bentuk Dukungan yang Diperlukan (B.6)
          </h3>
        </div>

        <div className="space-y-3">
          {locations
            .filter(l => l.checklist.transaksi.kendalaDanDukungan.kendalaUtama)
            .map(l => (
              <div
                key={l.id}
                className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1.5 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{l.namaLokasi} ({l.kodeKDKMP})</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedLocationForDetail(l);
                        setActiveModalTab('profil');
                      }}
                      className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer"
                    >
                      Detail Lokasi
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => onSelectLocationForChecklist(l)}
                      className="text-[11px] text-red-600 hover:text-red-700 font-semibold underline cursor-pointer"
                    >
                      Buka Checklist
                    </button>
                  </div>
                </div>
                <div className="text-slate-700">
                  <strong className="text-slate-900">Kendala Utama:</strong>{' '}
                  {l.checklist.transaksi.kendalaDanDukungan.kendalaUtama}
                </div>
                {l.checklist.transaksi.kendalaDanDukungan.keterangan && (
                  <div className="text-slate-600 pl-2 border-l-2 border-red-500">
                    <strong className="text-slate-800">Dukungan yang Diperlukan:</strong>{' '}
                    {l.checklist.transaksi.kendalaDanDukungan.keterangan}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DETAIL LOKASI AKTIF (POPUP INSPECTION) */}
      {/* ========================================================================= */}
      {selectedLocationForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            {(() => {
              const loc = selectedLocationForDetail;
              const score = calculateReadiness(loc.checklist);
              const isReady = score.status === 'Sangat Siap';
              const isConditional = score.status === 'Siap Bersyarat';

              return (
                <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase bg-red-950/80 border border-red-800/60 px-2 py-0.5 rounded text-red-300 font-bold">
                          {loc.kodeKDKMP || 'KDKMP'}
                        </span>
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                            isReady
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                              : isConditional
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                          }`}
                        >
                          {score.percentage}% • {score.status}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5">
                        {loc.namaLokasi}
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>
                          {loc.desaKelurahan ? `Desa/Kel. ${loc.desaKelurahan}, ` : ''}
                          {loc.kecamatan ? `Kec. ${loc.kecamatan}, ` : ''}
                          {loc.kabupatenKota}, {loc.provinsi}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedLocationForDetail(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Tutup detail modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navigation Tabs in Modal */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/60 text-xs overflow-x-auto">
                    <button
                      onClick={() => setActiveModalTab('produk')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        activeModalTab === 'produk'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      Produk Subsidi & Non-Subsidi
                    </button>
                    <button
                      onClick={() => setActiveModalTab('pilar')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        activeModalTab === 'pilar'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      4 Aspek Kesiapan Gerai
                    </button>
                    <button
                      onClick={() => setActiveModalTab('profil')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        activeModalTab === 'profil'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      Profil & Kendala Lapangan
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
              {/* TAB 1: DETAIL PRODUK SUBSIDI & NON-SUBSIDI */}
              {activeModalTab === 'produk' && (() => {
                const p = selectedLocationForDetail.checklist.produk;

                return (
                  <div className="space-y-6">
                    {/* BAGIAN A: PRODUK SUBSIDI */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Wheat className="w-4 h-4 text-red-600" />
                          <h4 className="font-bold text-sm text-slate-900">
                            1. Komoditas Produk Subsidi (4 Komoditas)
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Program Perlindungan Sosial & Ketahanan Pangan
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* 1. LPG 3 KG */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <Flame className="w-3.5 h-3.5 text-red-600" /> LPG 3 Kg
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.lpg3kg.status === 'ada'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {p.lpg3kg.status === 'ada' ? '✓ Tersedia' : '✕ Tidak Ada'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Jumlah Diterima:</span>
                              <span className="font-semibold text-slate-800">{p.lpg3kg.jumlahDiterima || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Stok Saat Ini:</span>
                              <span className="font-semibold text-slate-800">{p.lpg3kg.jumlahStok || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Periode Kirim:</span>
                              <span className="font-semibold text-slate-800">{p.lpg3kg.periodePengiriman || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Mitra:</span>
                              <span className="font-semibold text-slate-800">Pertamina</span>
                            </div>
                          </div>
                          {p.lpg3kg.keterangan && (
                            <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-600">
                              <strong className="text-slate-700">Catatan:</strong> {p.lpg3kg.keterangan}
                            </div>
                          )}
                        </div>

                        {/* 2. PUPUK BERSUBSIDI */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Pupuk Bersubsidi
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.pupukBersubsidi.status === 'ada'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {p.pupukBersubsidi.status === 'ada' ? '✓ Tersedia' : '✕ Tidak Ada'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Jumlah Diterima:</span>
                              <span className="font-semibold text-slate-800">{p.pupukBersubsidi.jumlahDiterima || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Stok Saat Ini:</span>
                              <span className="font-semibold text-slate-800">{p.pupukBersubsidi.jumlahStok || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Periode Kirim:</span>
                              <span className="font-semibold text-slate-800">{p.pupukBersubsidi.periodePengiriman || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Mitra:</span>
                              <span className="font-semibold text-slate-800">Pupuk Indonesia</span>
                            </div>
                          </div>
                          {p.pupukBersubsidi.keterangan && (
                            <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-600">
                              <strong className="text-slate-700">Catatan:</strong> {p.pupukBersubsidi.keterangan}
                            </div>
                          )}
                        </div>

                        {/* 3. BERAS SPHP BULOG */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <Wheat className="w-3.5 h-3.5 text-amber-600" /> Beras SPHP Bulog
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.berasSPHP.status === 'ada'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {p.berasSPHP.status === 'ada' ? '✓ Tersedia' : '✕ Tidak Ada'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Jumlah Diterima:</span>
                              <span className="font-semibold text-slate-800">{p.berasSPHP.jumlahDiterima || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Stok Saat Ini:</span>
                              <span className="font-semibold text-slate-800">{p.berasSPHP.jumlahStok || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Periode Kirim:</span>
                              <span className="font-semibold text-slate-800">{p.berasSPHP.periodePengiriman || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Mitra:</span>
                              <span className="font-semibold text-slate-800">Perum BULOG</span>
                            </div>
                          </div>
                          {p.berasSPHP.keterangan && (
                            <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-600">
                              <strong className="text-slate-700">Catatan:</strong> {p.berasSPHP.keterangan}
                            </div>
                          )}
                        </div>

                        {/* 4. MINYAKITA */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <Fuel className="w-3.5 h-3.5 text-yellow-600" /> Minyakita
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.minyakita.status === 'ada'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {p.minyakita.status === 'ada' ? '✓ Tersedia' : '✕ Tidak Ada'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Jumlah Diterima:</span>
                              <span className="font-semibold text-slate-800">{p.minyakita.jumlahDiterima || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Stok Saat Ini:</span>
                              <span className="font-semibold text-slate-800">{p.minyakita.jumlahStok || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Periode Kirim:</span>
                              <span className="font-semibold text-slate-800">{p.minyakita.periodePengiriman || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Mitra:</span>
                              <span className="font-semibold text-slate-800">Kemendag / BUMN Pangan</span>
                            </div>
                          </div>
                          {p.minyakita.keterangan && (
                            <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-600">
                              <strong className="text-slate-700">Catatan:</strong> {p.minyakita.keterangan}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BAGIAN B: PRODUK NON-SUBSIDI */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                          <h4 className="font-bold text-sm text-slate-900">
                            2. Komoditas Produk Non-Subsidi & Farmasi
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Sembako Komersial & Layanan Kesehatan Desa
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* GULA PASIR */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" /> Gula Pasir
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.gula.status === 'ada'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {p.gula.status === 'ada' ? '✓ Tersedia' : '✕ Tidak Ada'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Sumber Supply:</span>
                              <span className="font-semibold text-slate-800">{p.gula.sumberSupply || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Skema Kerjasama:</span>
                              <span className="font-semibold text-slate-800 uppercase">
                                {p.gula.skemaKerjasama === 'beli_putus' ? 'Beli Putus' : p.gula.skemaKerjasama === 'konsinyasi' ? 'Konsinyasi' : '-'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 block text-[10px]">Periode Kirim:</span>
                              <span className="font-semibold text-slate-800">{p.gula.periodePengiriman || '-'}</span>
                            </div>
                          </div>
                          {p.gula.keterangan && (
                            <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-600">
                              <strong className="text-slate-700">Catatan:</strong> {p.gula.keterangan}
                            </div>
                          )}
                        </div>

                        {/* OBAT-OBATAN */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <Pill className="w-3.5 h-3.5 text-teal-600" /> Obat-obatan / Apotek Desa
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.obatObatan.status === 'ada'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {p.obatObatan.status === 'ada' ? '✓ Tersedia' : '✕ Tidak Ada'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Sumber Supply:</span>
                              <span className="font-semibold text-slate-800">{p.obatObatan.sumberSupply || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Skema Kerjasama:</span>
                              <span className="font-semibold text-slate-800 uppercase">
                                {p.obatObatan.skemaKerjasama === 'beli_putus' ? 'Beli Putus' : p.obatObatan.skemaKerjasama === 'konsinyasi' ? 'Konsinyasi' : '-'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 block text-[10px]">Periode Kirim:</span>
                              <span className="font-semibold text-slate-800">{p.obatObatan.periodePengiriman || '-'}</span>
                            </div>
                          </div>
                          {p.obatObatan.keterangan && (
                            <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-600">
                              <strong className="text-slate-700">Catatan:</strong> {p.obatObatan.keterangan}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 2: DETAIL 4 ASPEK KESIAPAN */}
              {activeModalTab === 'pilar' && (() => {
                const loc = selectedLocationForDetail;
                const score = calculateReadiness(loc.checklist);
                const { fisikSarpras, sdm, sistem, transaksi } = loc.checklist;

                return (
                  <div className="space-y-5">
                    {/* Scores Progress Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">1. Fisik & Sarpras</div>
                        <div className="text-lg font-black text-teal-700">{score.fisikScore.pct}%</div>
                        <div className="text-[10px] text-slate-400">{score.fisikScore.ada}/{score.fisikScore.total} Ada</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">2. SDM & Organisasi</div>
                        <div className="text-lg font-black text-blue-700">{score.sdmScore.pct}%</div>
                        <div className="text-[10px] text-slate-400">{score.sdmScore.ada}/{score.sdmScore.total} Ada</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">3. Sistem Digital</div>
                        <div className="text-lg font-black text-purple-700">{score.sistemScore.pct}%</div>
                        <div className="text-[10px] text-slate-400">{score.sistemScore.ada}/{score.sistemScore.total} Ada</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">4. Pasokan Produk</div>
                        <div className="text-lg font-black text-amber-700">{score.produkScore.pct}%</div>
                        <div className="text-[10px] text-slate-400">{score.produkScore.ada}/{score.produkScore.total} Ada</div>
                      </div>
                    </div>

                    {/* Fisik Summary */}
                    <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                      <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-teal-600" /> Fasilitas Utama Gerai & Gudang
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="p-2 bg-slate-50 rounded border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">Bangunan Gudang LPG & Pupuk:</span>
                          <strong className={fisikSarpras.bangunanGudang.status === 'ada' ? 'text-emerald-700' : 'text-rose-600'}>
                            {fisikSarpras.bangunanGudang.status === 'ada' ? '✓ Ada / Standar' : '✕ Belum Ada'}
                          </strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">Bangunan Gerai KDKMP:</span>
                          <strong className={fisikSarpras.bangunanGerai.status === 'ada' ? 'text-emerald-700' : 'text-rose-600'}>
                            {fisikSarpras.bangunanGerai.status === 'ada' ? '✓ Ada / Siap' : '✕ Belum Ada'}
                          </strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">Instalasi Listrik:</span>
                          <strong className={fisikSarpras.instalasiListrik.status === 'ada' ? 'text-emerald-700' : 'text-rose-600'}>
                            {fisikSarpras.instalasiListrik.status === 'ada' ? '✓ Aktif' : '✕ Belum Terpasang'}
                          </strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">Perangkat Kasir POS:</span>
                          <strong className={fisikSarpras.saranaPrasarana.perangkatKasir.status === 'ada' ? 'text-emerald-700' : 'text-rose-600'}>
                            {fisikSarpras.saranaPrasarana.perangkatKasir.status === 'ada' ? '✓ Siap / Aktif' : '✕ Belum Ada'}
                          </strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">Armada Logistik (Pickup/Motor):</span>
                          <strong className={
                            (fisikSarpras.saranaPrasarana.pickup4x4.status === 'ada' || fisikSarpras.saranaPrasarana.motorBakRoda3.status === 'ada')
                              ? 'text-emerald-700'
                              : 'text-rose-600'
                          }>
                            {
                              (fisikSarpras.saranaPrasarana.pickup4x4.status === 'ada' || fisikSarpras.saranaPrasarana.motorBakRoda3.status === 'ada')
                                ? '✓ Tersedia'
                                : '✕ Belum Ada'
                            }
                          </strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">Fasilitas Klinik & Apotek:</span>
                          <strong className={fisikSarpras.fasilitasKlinik.status === 'ada' ? 'text-emerald-700' : 'text-rose-600'}>
                            {fisikSarpras.fasilitasKlinik.status === 'ada' ? '✓ Ada / Siap' : '✕ Belum Ada'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* SDM & Sistem Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                        <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-600" /> SDM & Kepemimpinan
                        </h5>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-600">Manajer KDKMP:</span>
                            <span className="font-bold text-slate-900">{sdm.manajerKD.status === 'ada' ? '✓ Sudah Ada' : '✕ Belum'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-600">Warga Lokal (APN):</span>
                            <span className="font-bold text-emerald-700">{sdm.sdmRekrutmenAPN.masyarakatSekitar === 'ya' ? '✓ Ya' : 'Tidak'}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600">Pembekalan 2 Tahun:</span>
                            <span className="font-bold text-blue-700">{sdm.pembekalanManajer.status === 'ada' ? '✓ Selesai' : '✕ Belum'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                        <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" /> Transaksi & Sistem
                        </h5>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-600">Mekanisme Pembayaran:</span>
                            <span className="font-bold text-slate-900 uppercase">
                              {transaksi.mekanismeTransaksi.pilihan || 'Cash'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-600">Sistem Stok Digital:</span>
                            <span className="font-bold text-slate-900">{sistem.sistemStokBarang.status === 'ada' ? '✓ Aktif' : '✕ Belum'}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600">Waktu Operasional:</span>
                            <span className="font-bold text-slate-900">{transaksi.waktuOperasional.rangeWaktu || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: PROFIL GERAI & KENDALA LAPANGAN */}
              {activeModalTab === 'profil' && (() => {
                const loc = selectedLocationForDetail;
                const kendala = loc.checklist.transaksi.kendalaDanDukungan;

                return (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-red-600" /> Informasi Alamat & Koordinat
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Alamat Lengkap:</span>
                          <span className="font-semibold text-slate-800">{loc.alamatLengkap || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Wilayah Administrasi:</span>
                          <span className="font-semibold text-slate-800">
                            Desa {loc.desaKelurahan || '-'}, Kec. {loc.kecamatan || '-'}, {loc.kabupatenKota}, {loc.provinsi}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Petugas Verifikasi:</span>
                          <span className="font-semibold text-slate-800">{loc.namaPetugas || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tanggal Kunjungan:</span>
                          <span className="font-semibold text-slate-800">{loc.tanggalKunjungan || '-'}</span>
                        </div>
                        {loc.kontakPerson && (
                          <div>
                            <span className="text-slate-400 block text-[10px]">Kontak Person:</span>
                            <span className="font-semibold text-slate-800">{loc.kontakPerson}</span>
                          </div>
                        )}
                        {(loc.latitude && loc.longitude) ? (
                          <div>
                            <span className="text-slate-400 block text-[10px]">Titik GPS:</span>
                            <a
                              href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-red-600 hover:text-red-800 underline inline-flex items-center gap-1"
                            >
                              {loc.latitude}, {loc.longitude} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Kendala & Dukungan */}
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 space-y-2">
                      <h5 className="font-bold text-red-950 text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" /> Kendala Lapangan & Permintaan Dukungan
                      </h5>
                      <div className="space-y-2 text-[11px]">
                        <div className="bg-white p-3 rounded-lg border border-red-100">
                          <strong className="text-slate-900 block text-[10px] uppercase tracking-wider text-red-700">
                            Kendala Utama yang Dihadapi:
                          </strong>
                          <p className="text-slate-700 mt-1">
                            {kendala.kendalaUtama || 'Tidak ada kendala kritis yang dilaporkan.'}
                          </p>
                        </div>
                        {kendala.keterangan && (
                          <div className="bg-white p-3 rounded-lg border border-red-100">
                            <strong className="text-slate-900 block text-[10px] uppercase tracking-wider text-red-700">
                              Bentuk Dukungan / Solusi yang Diharapkan:
                            </strong>
                            <p className="text-slate-700 mt-1">{kendala.keterangan}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500">
                Unit ID: <strong className="text-slate-700">{selectedLocationForDetail.id}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const loc = selectedLocationForDetail;
                    setSelectedLocationForDetail(null);
                    onSelectLocationForChecklist(loc, 'produk');
                  }}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  Buka Checklist Produk
                </button>
                <button
                  onClick={() => {
                    const loc = selectedLocationForDetail;
                    setSelectedLocationForDetail(null);
                    onSelectLocationForChecklist(loc, 'fisik');
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Buka Checklist Lengkap
                </button>
                <button
                  onClick={() => setSelectedLocationForDetail(null)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  ArrowDown
} from 'lucide-react';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';

interface StatisticsViewProps {
  locations: KDKMPLocation[];
  onExportCsv: () => void;
  onSelectLocationForChecklist: (location: KDKMPLocation, tab?: 'fisik' | 'sdm' | 'sistem' | 'produk' | 'transaksi') => void;
  onViewDuplicates?: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  locations,
  onExportCsv,
  onSelectLocationForChecklist,
  onViewDuplicates
}) => {
  const total = locations.length;

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
  const evaluated = locations.map(l => ({
    location: l,
    score: calculateReadiness(l.checklist)
  }));

  const sangatSiap = evaluated.filter(e => e.score.status === 'Sangat Siap');
  const siapBersyarat = evaluated.filter(e => e.score.status === 'Siap Bersyarat');
  const belumSiap = evaluated.filter(e => e.score.status === 'Belum Siap');

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

  // Commodities fulfillments
  const countLpg = locations.filter(l => l.checklist.produk.lpg3kg.status === 'ada').length;
  const countPupuk = locations.filter(l => l.checklist.produk.pupukBersubsidi.status === 'ada').length;
  const countBeras = locations.filter(l => l.checklist.produk.berasSPHP.status === 'ada').length;
  const countMinyak = locations.filter(l => l.checklist.produk.minyakita.status === 'ada').length;
  const countGula = locations.filter(l => l.checklist.produk.gula.status === 'ada').length;
  const countObat = locations.filter(l => l.checklist.produk.obatObatan.status === 'ada').length;

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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-red-400 bg-red-950/60 px-2.5 py-1 rounded border border-red-800/40">
            Executive Summary
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">
            Statistik Kesiapan Operasionalisasi KDKMP
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Hasil monitoring dan evaluasi terpadu berdasarkan instrumen resmi List Checklist Kesiapan Operasionalisasi KDKMP.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors self-start md:self-auto shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Ekspor Rekapitulasi (CSV/Excel)
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Unit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Unit KDKMP</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Tersebar di {Object.keys(provinceMap).length} Provinsi</div>
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
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Sangat Siap</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{sangatSiap.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1">
            {total > 0 ? Math.round((sangatSiap.length / total) * 100) : 0}% Siap Operasional
          </div>
        </div>

        {/* Siap Bersyarat */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Siap Bersyarat</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{siapBersyarat.length}</div>
          <div className="text-[11px] text-amber-600 mt-1">
            {total > 0 ? Math.round((siapBersyarat.length / total) * 100) : 0}% Butuh Pemenuhan
          </div>
        </div>

        {/* Belum Siap */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold">Belum Siap</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{belumSiap.length}</div>
          <div className="text-[11px] text-rose-600 mt-1">
            {total > 0 ? Math.round((belumSiap.length / total) * 100) : 0}% Tahap Persiapan
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
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0"
            >
              Periksa Nama Ganda di Rekap Lokasi
            </button>
          )}
        </div>
      )}

      {/* Row: 4 Pilar Kesiapan & Komoditas Strategis */}
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

        {/* Ketersediaan Komoditas Strategis Nasional */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Kesiapan Pasokan Komoditas KDKMP</h3>
              <p className="text-xs text-slate-500">Persentase unit yang telah menerima pasokan aktif</p>
            </div>
            <Wheat className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>LPG 3 kg</span>
                <span className="font-bold text-slate-900">{countLpg}/{total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${total > 0 ? (countLpg / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                {total > 0 ? Math.round((countLpg / total) * 100) : 0}% Lokasi Aktif
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Pupuk Bersubsidi</span>
                <span className="font-bold text-slate-900">{countPupuk}/{total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${total > 0 ? (countPupuk / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                {total > 0 ? Math.round((countPupuk / total) * 100) : 0}% Lokasi Aktif
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Beras SPHP Bulog</span>
                <span className="font-bold text-slate-900">{countBeras}/{total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${total > 0 ? (countBeras / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                {total > 0 ? Math.round((countBeras / total) * 100) : 0}% Lokasi Aktif
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Minyakita</span>
                <span className="font-bold text-slate-900">{countMinyak}/{total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${total > 0 ? (countMinyak / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                {total > 0 ? Math.round((countMinyak / total) * 100) : 0}% Lokasi Aktif
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Gula Pasir</span>
                <span className="font-bold text-slate-900">{countGula}/{total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${total > 0 ? (countGula / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-blue-700 font-semibold mt-1 inline-block">
                {total > 0 ? Math.round((countGula / total) * 100) : 0}% Lokasi Aktif
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Obat-obatan Apotek</span>
                <span className="font-bold text-slate-900">{countObat}/{total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${total > 0 ? (countObat / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-blue-700 font-semibold mt-1 inline-block">
                {total > 0 ? Math.round((countObat / total) * 100) : 0}% Lokasi Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row: SDM & Transaksi Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* SDM Inclusivity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">SDM & Pemberdayaan</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Manajer KD/KMP Terisi</span>
              <span className="font-bold text-slate-900">
                {countManajer} / {total} ({total > 0 ? Math.round((countManajer / total) * 100) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Staf Warga Lokal (APN)</span>
              <span className="font-bold text-emerald-700">
                {countLokal} / {total} ({total > 0 ? Math.round((countLokal / total) * 100) : 0}%)
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Pembekalan Pasca 2 Thn</span>
              <span className="font-bold text-blue-700">
                {countPembekalan} / {total} ({total > 0 ? Math.round((countPembekalan / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Transaksi Gerai */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">Mekanisme Transaksi Gerai</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Keduanya (Cash & Cashless)</span>
              <span className="font-bold text-emerald-700">{countBothPayments} Unit</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Hanya Tunai (Cash)</span>
              <span className="font-bold text-amber-700">{countCashOnly} Unit</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Hanya Non-Tunai</span>
              <span className="font-bold text-blue-700">{countCashlessOnly} Unit</span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4 text-purple-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">Distribusi Kesiapan</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
              <span className="flex-1 text-slate-600">Sangat Siap (&ge;85%)</span>
              <span className="font-bold text-slate-900">{sangatSiap.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
              <span className="flex-1 text-slate-600">Siap Bersyarat (60-84%)</span>
              <span className="font-bold text-slate-900">{siapBersyarat.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500 shrink-0" />
              <span className="flex-1 text-slate-600">Belum Siap (&lt;60%)</span>
              <span className="font-bold text-slate-900">{belumSiap.length}</span>
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
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all inline-flex items-center gap-1 ${
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
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all inline-flex items-center gap-1 ${
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
                  <tr key={prov} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{prov}</td>
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
                  <button
                    onClick={() => onSelectLocationForChecklist(l)}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold underline"
                  >
                    Buka Checklist
                  </button>
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
    </div>
  );
};

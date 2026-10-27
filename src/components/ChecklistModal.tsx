import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Printer,
  Sparkles,
  Building2,
  Users,
  Cpu,
  ShoppingBag,
  Receipt,
  HelpCircle,
  Check,
  CheckCheck,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import {
  KDKMPLocation,
  KDKMPChecklist,
  calculateReadiness,
  CheckStatus,
  YesNoStatus,
  SkemaKerjasama,
  MekanismeTransaksiPilihan
} from '../types/kdkmp';
import { HandwritingScanModal } from './HandwritingScanModal';

interface ChecklistModalProps {
  location: KDKMPLocation;
  isOpen: boolean;
  initialTab?: 'fisik' | 'sdm' | 'sistem' | 'produk' | 'transaksi';
  onClose: () => void;
  onSave: (updatedChecklist: KDKMPChecklist, visitDate: string, officerName: string) => void;
  onOpenPdfPreview: () => void;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  location,
  isOpen,
  initialTab = 'fisik',
  onClose,
  onSave,
  onOpenPdfPreview
}) => {
  const [checklist, setChecklist] = useState<KDKMPChecklist>(JSON.parse(JSON.stringify(location.checklist)));
  const [tanggalKunjungan, setTanggalKunjungan] = useState<string>(location.tanggalKunjungan || '');
  const [namaPetugas, setNamaPetugas] = useState<string>(location.namaPetugas || '');
  const [activeTab, setActiveTab] = useState<'fisik' | 'sdm' | 'sistem' | 'produk' | 'transaksi'>(initialTab);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showHandwritingModal, setShowHandwritingModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleApplyHandwritingData = (data: {
    checklist: Partial<KDKMPChecklist>;
    tanggalKunjungan?: string;
    namaPetugas?: string;
    summary?: string;
  }) => {
    if (data.tanggalKunjungan) {
      setTanggalKunjungan(data.tanggalKunjungan);
    }
    if (data.namaPetugas) {
      setNamaPetugas(data.namaPetugas);
    }
    if (data.checklist) {
      setChecklist(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        if (data.checklist.fisikSarpras) {
          Object.assign(next.fisikSarpras, data.checklist.fisikSarpras);
          if (data.checklist.fisikSarpras.saranaPrasarana) {
            Object.assign(next.fisikSarpras.saranaPrasarana, data.checklist.fisikSarpras.saranaPrasarana);
          }
        }
        if (data.checklist.sdm) {
          Object.assign(next.sdm, data.checklist.sdm);
        }
        if (data.checklist.sistem) {
          Object.assign(next.sistem, data.checklist.sistem);
        }
        if (data.checklist.produk) {
          Object.assign(next.produk, data.checklist.produk);
        }
        if (data.checklist.transaksi) {
          Object.assign(next.transaksi, data.checklist.transaksi);
        }
        return next;
      });
    }
    setHasUnsavedChanges(true);
    setToastMsg('✓ Berhasil membaca tulisan tangan! Data form checklist telah diperbarui.');
    setTimeout(() => setToastMsg(null), 6000);
  };

  // Synchronize state when modal is opened or location/tab prop changes
  useEffect(() => {
    if (isOpen) {
      setChecklist(JSON.parse(JSON.stringify(location.checklist)));
      setTanggalKunjungan(location.tanggalKunjungan || '');
      setNamaPetugas(location.namaPetugas || '');
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setHasUnsavedChanges(false);
    }
  }, [isOpen, location.id, location.updatedAt, initialTab]);

  if (!isOpen) return null;

  const currentScore = calculateReadiness(checklist);

  const handleUpdate = (updater: (prev: KDKMPChecklist) => KDKMPChecklist) => {
    setChecklist(prev => {
      const next = updater(JSON.parse(JSON.stringify(prev)));
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const markAllFisik = (status: CheckStatus) => {
    handleUpdate(prev => {
      prev.fisikSarpras.bangunanGudang.status = status;
      prev.fisikSarpras.bangunanGerai.status = status;
      prev.fisikSarpras.instalasiListrik.status = status;
      prev.fisikSarpras.instalasiAirBersih.status = status;
      prev.fisikSarpras.fasilitasKlinik.status = status;
      prev.fisikSarpras.rakObatApotek.status = status;
      Object.keys(prev.fisikSarpras.saranaPrasarana).forEach(k => {
        (prev.fisikSarpras.saranaPrasarana as any)[k].status = status;
      });
      return prev;
    });
  };

  const markAllSdm = (status: CheckStatus) => {
    handleUpdate(prev => {
      prev.sdm.manajerKD.status = status;
      prev.sdm.sdmRekrutmenAPN.status = status;
      prev.sdm.koordinasiPengurusKades.status = status;
      prev.sdm.pembekalanManajer.status = status;
      return prev;
    });
  };

  const markAllSistem = (status: CheckStatus) => {
    handleUpdate(prev => {
      prev.sistem.sistemStokBarang.status = status;
      prev.sistem.sistemPemesananProduk.status = status;
      prev.sistem.sistemAbsensiPegawai.status = status;
      return prev;
    });
  };

  const markAllProduk = (status: CheckStatus) => {
    handleUpdate(prev => {
      prev.produk.lpg3kg.status = status;
      prev.produk.pupukBersubsidi.status = status;
      prev.produk.berasSPHP.status = status;
      prev.produk.minyakita.status = status;
      prev.produk.gula.status = status;
      prev.produk.obatObatan.status = status;
      return prev;
    });
  };

  const handleSave = () => {
    onSave(checklist, tanggalKunjungan, namaPetugas);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-600/90 text-white font-semibold">
                {location.kodeKDKMP}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Form Input & Edit Checklist: {location.namaLokasi}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1">
              <span>
                {location.desaKelurahan}, Kec. {location.kecamatan}, {location.kabupatenKota}, {location.provinsi}
              </span>
              {location.updatedAt && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Sebelumnya Diupdate: {new Date(location.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-300">Kesiapan:</span>
              <span
                className={`font-bold text-sm ${
                  currentScore.status === 'Sangat Siap'
                    ? 'text-emerald-400'
                    : currentScore.status === 'Siap Bersyarat'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {currentScore.percentage}% ({currentScore.adaItems}/{currentScore.totalItems} Ada)
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader: Inspection metadata inputs */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-700">Tanggal Kunjungan:</label>
              <input
                type="date"
                value={tanggalKunjungan}
                onChange={e => {
                  setTanggalKunjungan(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="py-1 px-2.5 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-700">Petugas Peninjau:</label>
              <input
                type="text"
                value={namaPetugas}
                onChange={e => {
                  setNamaPetugas(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Nama surveyor..."
                className="py-1 px-2.5 bg-white border border-slate-300 rounded text-slate-800 text-xs w-48 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHandwritingModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-xs transition-all"
              title="Pindai foto formulir tulisan tangan atau catatan surveyor"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Baca Tulisan Tangan (Scan Foto)</span>
            </button>

            <button
              type="button"
              onClick={onOpenPdfPreview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-medium text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Pratinjau PDF Cetak
            </button>
          </div>
        </div>

        {/* Toast message for handwriting scan / status */}
        {toastMsg && (
          <div className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              {toastMsg}
            </span>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="text-white hover:text-emerald-200 font-bold ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs - 5 Komponen Formulir Checklist */}
        <div className="px-5 border-b border-slate-200 bg-white flex overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('fisik')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'fisik'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Fisik & Sarpras</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              currentScore.fisikScore.ada === currentScore.fisikScore.total
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {currentScore.fisikScore.ada}/18
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sdm')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'sdm'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Kelengkapan SDM</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              currentScore.sdmScore.ada === currentScore.sdmScore.total
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {currentScore.sdmScore.ada}/4
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sistem')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'sistem'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. Kelengkapan Sistem</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              currentScore.sistemScore.ada === currentScore.sistemScore.total
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {currentScore.sistemScore.ada}/3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('produk')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'produk'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>4. Kelengkapan Produk</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              currentScore.produkScore.ada === currentScore.produkScore.total
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {currentScore.produkScore.ada}/6
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transaksi')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'transaksi'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>5. Peninjauan Transaksi</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              currentScore.transaksiCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {currentScore.transaksiCompleted ? 'Lengkap' : 'Perlu Diisi'}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
          {/* TAB 1: FISIK & SARANA PRASARANA */}
          {activeTab === 'fisik' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-teal-800 text-white p-3 rounded-lg shadow-xs">
                <div>
                  <h4 className="font-bold text-sm">A. Peninjauan Gudang dan Gerai</h4>
                  <p className="text-xs text-teal-100">Kelengkapan Fisik serta Sarana dan Prasarana (Sesuai Halaman 1 Dokumen PDF)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAllFisik('ada')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-700 hover:bg-teal-600 text-white rounded transition-colors"
                  >
                    Tandai Semua Ada
                  </button>
                  <button
                    onClick={() => markAllFisik('tidak_ada')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-900 hover:bg-teal-950 text-teal-200 rounded transition-colors"
                  >
                    Tandai Tidak Ada
                  </button>
                </div>
              </div>

              {/* 6 Indikator Utama */}
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                {[
                  {
                    no: 1,
                    key: 'bangunanGudang',
                    title: 'Ketersediaan Bangunan Gudang (termasuk tempat penyimpanan LPG 3 Kg dan Pupuk Bersubsidi)',
                    item: checklist.fisikSarpras.bangunanGudang
                  },
                  {
                    no: 2,
                    key: 'bangunanGerai',
                    title: 'Ketersediaan Bangunan Gerai',
                    item: checklist.fisikSarpras.bangunanGerai
                  },
                  {
                    no: 3,
                    key: 'instalasiListrik',
                    title: 'Ketersediaan Instalasi Listrik',
                    item: checklist.fisikSarpras.instalasiListrik
                  },
                  {
                    no: 4,
                    key: 'instalasiAirBersih',
                    title: 'Ketersediaan Instalasi Air Bersih',
                    item: checklist.fisikSarpras.instalasiAirBersih
                  },
                  {
                    no: 5,
                    key: 'fasilitasKlinik',
                    title: 'Ketersediaan Fasilitas Klinik',
                    item: checklist.fisikSarpras.fasilitasKlinik
                  },
                  {
                    no: 6,
                    key: 'rakObatApotek',
                    title: 'Ketersediaan Rak Obat-obatan / Apotek',
                    item: checklist.fisikSarpras.rakObatApotek
                  }
                ].map(({ no, key, title, item }) => (
                  <div key={key} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:bg-slate-50/60">
                    <div className="md:col-span-6 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {no}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{title}</span>
                    </div>

                    <div className="md:col-span-3 flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          name={`radio-${key}`}
                          checked={item.status === 'ada'}
                          onChange={() =>
                            handleUpdate(prev => {
                              (prev.fisikSarpras as any)[key].status = 'ada';
                              return prev;
                            })
                          }
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className={item.status === 'ada' ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                          Ada
                        </span>
                      </label>

                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          name={`radio-${key}`}
                          checked={item.status === 'tidak_ada'}
                          onChange={() =>
                            handleUpdate(prev => {
                              (prev.fisikSarpras as any)[key].status = 'tidak_ada';
                              return prev;
                            })
                          }
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                        />
                        <span className={item.status === 'tidak_ada' ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                          Tidak Ada
                        </span>
                      </label>
                    </div>

                    <div className="md:col-span-3">
                      <input
                        type="text"
                        placeholder="Keterangan kondisi / spesifikasi..."
                        value={item.keterangan}
                        onChange={e =>
                          handleUpdate(prev => {
                            (prev.fisikSarpras as any)[key].keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-indikator 7: 12 Sarana dan Prasarana */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      7
                    </span>
                    <h5 className="font-bold text-sm text-slate-800">
                      Ketersediaan Sarana dan Prasarana (12 Sub-Indikator)
                    </h5>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'rakDisplay', label: 'Rak display' },
                    { key: 'perangkatKasir', label: 'Perangkat Kasir (termasuk software)' },
                    { key: 'truk6Ban', label: 'Truk 6 Ban' },
                    { key: 'pickup4x4', label: 'Pickup 4x4' },
                    { key: 'motorBakRoda3', label: 'Motor bak roda 3' },
                    { key: 'ac', label: 'Air Conditioner (AC)' },
                    { key: 'apar', label: 'Alat Pemadam Api Ringan (APAR)' },
                    { key: 'cctv', label: 'CCTV' },
                    { key: 'kipasCeiling', label: 'Kipas Ceiling' },
                    { key: 'keranjangBelanja', label: 'Keranjang Belanja' },
                    { key: 'seragamKD', label: 'Seragam KD/KMP' },
                    { key: 'papanNamaKD', label: 'Papan Nama KD/KMP' }
                  ].map(({ key, label }) => {
                    const spItem = (checklist.fisikSarpras.saranaPrasarana as any)[key];
                    return (
                      <div
                        key={key}
                        className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-2 hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">{label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdate(prev => {
                                  (prev.fisikSarpras.saranaPrasarana as any)[key].status = 'ada';
                                  return prev;
                                })
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                spItem.status === 'ada'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-600 hover:bg-emerald-100'
                              }`}
                            >
                              Ada
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdate(prev => {
                                  (prev.fisikSarpras.saranaPrasarana as any)[key].status = 'tidak_ada';
                                  return prev;
                                })
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                spItem.status === 'tidak_ada'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-600 hover:bg-rose-100'
                              }`}
                            >
                              Tidak Ada
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Keterangan unit/spesifikasi..."
                          value={spItem.keterangan || ''}
                          onChange={e =>
                            handleUpdate(prev => {
                              (prev.fisikSarpras.saranaPrasarana as any)[key].keterangan = e.target.value;
                              return prev;
                            })
                          }
                          className="w-full text-[11px] py-1 px-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-600"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tab 1 Navigation Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-2">
                <span className="text-xs text-slate-500">
                  Komponen 1 dari 5: Fisik & Sarpras ({currentScore.fisikScore.ada}/18)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-xs transition-colors"
                    title="Simpan data saat ini meskipun komponen lainnya belum lengkap"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span>Simpan Sementara</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sdm')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Lanjut ke Kelengkapan SDM</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KELENGKAPAN SDM */}
          {activeTab === 'sdm' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-teal-800 text-white p-3.5 rounded-xl shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-300" />
                    <h4 className="font-bold text-sm sm:text-base">A.2 Kelengkapan SDM & Tata Kelola</h4>
                  </div>
                  <p className="text-xs text-teal-100 mt-0.5">
                    Verifikasi Ketersediaan Manajer KD/KMP, Rekrutmen APN dari Warga Lokal, Koordinasi Desa, dan Pelatihan Pasca 2 Tahun
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-xs bg-teal-900/80 px-2.5 py-1 rounded font-semibold text-teal-200 border border-teal-700">
                    {currentScore.sdmScore.ada}/4 Butir ({currentScore.sdmScore.pct}%)
                  </span>
                  <button
                    onClick={() => markAllSdm('ada')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-700 hover:bg-teal-600 text-white rounded transition-colors"
                  >
                    Tandai Semua Ada
                  </button>
                  <button
                    onClick={() => markAllSdm('tidak_ada')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-950 hover:bg-black text-teal-200 rounded transition-colors"
                  >
                    Tandai Tidak Ada
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                {/* 1. Ketersediaan Manajer KD/KMP */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                        1
                      </span>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800">Ketersediaan Manajer KD/KMP</h5>
                        <p className="text-[11px] text-slate-500">Pimpinan operasional harian gerai & gudang</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(prev => {
                            prev.sdm.manajerKD.status = 'ada';
                            return prev;
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          checklist.sdm.manajerKD.status === 'ada'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                        }`}
                      >
                        ✓ Ada
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(prev => {
                            prev.sdm.manajerKD.status = 'tidak_ada';
                            return prev;
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          checklist.sdm.manajerKD.status === 'tidak_ada'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                        }`}
                      >
                        ✕ Tidak Ada
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Tanggal on boarding Manajer KD/KMP :
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(prev => {
                              prev.sdm.manajerKD.tanggalOnBoarding = new Date().toISOString().slice(0, 10);
                              return prev;
                            })
                          }
                          className="text-[10px] text-teal-700 hover:underline font-medium"
                        >
                          Isi Hari Ini
                        </button>
                      </div>
                      <input
                        type="date"
                        value={checklist.sdm.manajerKD.tanggalOnBoarding || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.sdm.manajerKD.tanggalOnBoarding = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nama / Profil Manajer & Latar Belakang :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Budi Santoso, S.E. (Pengalaman Ritel 5 Tahun)..."
                        value={checklist.sdm.manajerKD.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.sdm.manajerKD.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Ketersediaan SDM rekrutmen APN */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                        2
                      </span>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800">Ketersediaan SDM rekrutmen APN</h5>
                        <p className="text-[11px] text-slate-500">Staf kasir, administrasi, gudang, dan pramuniaga gerai</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(prev => {
                            prev.sdm.sdmRekrutmenAPN.status = 'ada';
                            return prev;
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          checklist.sdm.sdmRekrutmenAPN.status === 'ada'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                        }`}
                      >
                        ✓ Ada
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(prev => {
                            prev.sdm.sdmRekrutmenAPN.status = 'tidak_ada';
                            return prev;
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          checklist.sdm.sdmRekrutmenAPN.status === 'tidak_ada'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                        }`}
                      >
                        ✕ Tidak Ada
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        SDM merupakan masyarakat sekitar KD/KMP :
                      </label>
                      <div className="flex items-center gap-2 py-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(prev => {
                              prev.sdm.sdmRekrutmenAPN.masyarakatSekitar = 'ya';
                              return prev;
                            })
                          }
                          className={`flex-1 py-1 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            checklist.sdm.sdmRekrutmenAPN.masyarakatSekitar === 'ya'
                              ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>✓ Ya (Warga Lokal Desa)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(prev => {
                              prev.sdm.sdmRekrutmenAPN.masyarakatSekitar = 'tidak';
                              return prev;
                            })
                          }
                          className={`flex-1 py-1 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            checklist.sdm.sdmRekrutmenAPN.masyarakatSekitar === 'tidak'
                              ? 'bg-slate-100 border-slate-400 text-slate-800 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Bukan Warga Sekitar</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Keterangan Jumlah Staf & Posisi :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 3 kasir & 2 gudang (pemuda desa)..."
                        value={checklist.sdm.sdmRekrutmenAPN.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.sdm.sdmRekrutmenAPN.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          '3 Kasir & 2 Gudang (Pemuda Desa)',
                          '4 Personil Toko Warga Lokal',
                          '2 Kasir & 1 Sopir Pickup'
                        ].map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.sdm.sdmRekrutmenAPN.keterangan = suggestion;
                                return prev;
                              })
                            }
                            className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Terlaksananya koordinasi dengan Pengurus KD/KMP dan/atau Kepala Desa */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                        3
                      </span>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800">
                          Koordinasi dengan Pengurus KD/KMP dan Kepala Desa/Lurah
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Sinergi kebijakan, perizinan, dukungan masyarakat dan pengurus koperasi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(prev => {
                            prev.sdm.koordinasiPengurusKades.status = 'ada';
                            return prev;
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          checklist.sdm.koordinasiPengurusKades.status === 'ada'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                        }`}
                      >
                        ✓ Ada
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(prev => {
                            prev.sdm.koordinasiPengurusKades.status = 'tidak_ada';
                            return prev;
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          checklist.sdm.koordinasiPengurusKades.status === 'tidak_ada'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                        }`}
                      >
                        ✕ Tidak Ada
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pl-0 sm:pl-9 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Mekanisme koordinasi :
                      </label>
                      <input
                        type="text"
                        placeholder="Musyawarah desa / rapat rutin..."
                        value={checklist.sdm.koordinasiPengurusKades.mekanismeKoordinasi || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.sdm.koordinasiPengurusKades.mekanismeKoordinasi = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['Musyawarah Desa', 'Rapat Koordinasi Mingguan'].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.sdm.koordinasiPengurusKades.mekanismeKoordinasi = tag;
                                return prev;
                              })
                            }
                            className="text-[10px] text-slate-600 hover:text-teal-700 underline"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tanggal pelaksanaan koordinasi :
                      </label>
                      <input
                        type="date"
                        value={checklist.sdm.koordinasiPengurusKades.tanggalKoordinasi || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.sdm.koordinasiPengurusKades.tanggalKoordinasi = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Keterangan hasil koordinasi :
                      </label>
                      <input
                        type="text"
                        placeholder="Dihadiri Kades, BPD, & Pengurus..."
                        value={checklist.sdm.koordinasiPengurusKades.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.sdm.koordinasiPengurusKades.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Pembekalan manajer KD/KMP */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                        4
                      </span>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800">
                          Pembekalan & Transfer Knowledge Pasca 2 Tahun
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Manajer telah menerima pembekalan dan siap melakukan transfer pengetahuan ke Pengurus Koperasi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(prev => {
                            prev.sdm.pembekalanManajer.status = 'ada';
                            return prev;
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          checklist.sdm.pembekalanManajer.status === 'ada'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                        }`}
                      >
                        ✓ Ada
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(prev => {
                            prev.sdm.pembekalanManajer.status = 'tidak_ada';
                            return prev;
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          checklist.sdm.pembekalanManajer.status === 'tidak_ada'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                        }`}
                      >
                        ✕ Tidak Ada
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tanggal pelaksanaan pembekalan Manajer :
                      </label>
                      <input
                        type="date"
                        value={checklist.sdm.pembekalanManajer.tanggalPembekalan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.sdm.pembekalanManajer.tanggalPembekalan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Keterangan status sertifikasi / materi :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Sertifikat TOT Manajemen Ritel KDKMP..."
                        value={checklist.sdm.pembekalanManajer.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.sdm.pembekalanManajer.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          'Sertifikat TOT Pasca 2 Tahun Terbit',
                          'Bimtek SOP Kasir, Gudang, & ERP',
                          'Pelatihan Laporan Keuangan Koperasi'
                        ].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.sdm.pembekalanManajer.keterangan = tag;
                                return prev;
                              })
                            }
                            className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab 2 Navigation Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('fisik')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Fisik & Sarpras</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-xs transition-colors"
                    title="Simpan data saat ini meskipun komponen lainnya belum lengkap"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span>Simpan Sementara</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sistem')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Lanjut ke Kelengkapan Sistem</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KELENGKAPAN SISTEM */}
          {activeTab === 'sistem' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-teal-800 text-white p-3.5 rounded-xl shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-teal-300" />
                    <h4 className="font-bold text-sm sm:text-base">A.3 Kelengkapan Sistem & Aplikasi</h4>
                  </div>
                  <p className="text-xs text-teal-100 mt-0.5">
                    Pemeriksaan Sistem Pemantauan Stok, E-Procurement B2B, dan Absensi Pegawai Gerai KDKMP
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-xs bg-teal-900/80 px-2.5 py-1 rounded font-semibold text-teal-200 border border-teal-700">
                    {currentScore.sistemScore.ada}/3 Butir ({currentScore.sistemScore.pct}%)
                  </span>
                  <button
                    onClick={() => markAllSistem('ada')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-700 hover:bg-teal-600 text-white rounded transition-colors"
                  >
                    Tandai Semua Ada
                  </button>
                  <button
                    onClick={() => markAllSistem('tidak_ada')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-950 hover:bg-black text-teal-200 rounded transition-colors"
                  >
                    Tandai Tidak Ada
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                {[
                  {
                    no: 1,
                    key: 'sistemStokBarang',
                    title: 'Sistem pemantauan stock barang',
                    item: checklist.sistem.sistemStokBarang,
                    desc: 'Aplikasi ERP / software stok barang real-time & kartu gudang',
                    suggestions: [
                      'Manual',
                      'Aplikasi Excel',
                      'Aplikasi POS & ERP KDKMP Cloud v2',
                      'Modul Kartu Stok Digital Real-Time',
                      'Integrasi Barcode Scanner Wireless',
                      'Software Kasir Desktop Offline-Online'
                    ]
                  },
                  {
                    no: 2,
                    key: 'sistemPemesananProduk',
                    title: 'Sistem pemesanan produk',
                    item: checklist.sistem.sistemPemesananProduk,
                    desc: 'Aplikasi order terintegrasi supplier/B2B (Bulog, ID FOOD, Pertamina)',
                    suggestions: [
                      'Manual',
                      'Aplikasi Excel',
                      'Portal Order B2B ID FOOD / Bulog',
                      'Sistem Restock Otomatis PO Supplier',
                      'Aplikasi Web Pemesanan Mitra Pangan',
                      'Integrasi WhatsApp API Order'
                    ]
                  },
                  {
                    no: 3,
                    key: 'sistemAbsensiPegawai',
                    title: 'Sistem absensi pegawai',
                    item: checklist.sistem.sistemAbsensiPegawai,
                    desc: 'Biometrik / fingerprint / presensi mobile GPS',
                    suggestions: [
                      'Aplikasi Simkopdes',
                      'AgriConnect',
                      'Simkopdes&AgriConnect',
                      'Biometrik Sidik Jari (Fingerprint)',
                      'Presensi Mobile berbasis Geofencing GPS',
                      'Mesin Absensi Terhubung Cloud HR',
                      'Buku Absensi Manual Terverifikasi'
                    ]
                  }
                ].map(({ no, key, title, item, desc, suggestions }) => (
                  <div key={key} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                          {no}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-800">{title}</span>
                          <p className="text-[11px] text-slate-500">{desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(prev => {
                              (prev.sistem as any)[key].status = 'ada';
                              return prev;
                            })
                          }
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                            item.status === 'ada'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                          }`}
                        >
                          ✓ Ada
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(prev => {
                              (prev.sistem as any)[key].status = 'tidak_ada';
                              return prev;
                            })
                          }
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                            item.status === 'tidak_ada'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                          }`}
                        >
                          ✕ Tidak Ada
                        </button>
                      </div>
                    </div>

                    <div className="pl-0 sm:pl-9 pt-1 space-y-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nama Aplikasi / Keterangan Spesifikasi Teknis :
                        </label>
                        <input
                          type="text"
                          placeholder="Nama aplikasi, versi software, atau mekanisme operasional..."
                          value={item.keterangan || ''}
                          onChange={e =>
                            handleUpdate(prev => {
                              (prev.sistem as any)[key].keterangan = e.target.value;
                              return prev;
                            })
                          }
                          className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-slate-500 font-semibold self-center">Rekomendasi lain:</span>
                          {suggestions.map(sug => {
                            const isSelected = item.keterangan?.trim().toLowerCase() === sug.toLowerCase();
                            return (
                              <button
                                key={sug}
                                type="button"
                                onClick={() =>
                                  handleUpdate(prev => {
                                    (prev.sistem as any)[key].keterangan = sug;
                                    (prev.sistem as any)[key].status = 'ada';
                                    return prev;
                                  })
                                }
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                  isSelected
                                    ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-2xs'
                                    : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border-slate-200'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {sug}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tab 3 Navigation Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('sdm')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Kelengkapan SDM</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-xs transition-colors"
                    title="Simpan data saat ini meskipun komponen lainnya belum lengkap"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span>Simpan Sementara</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('produk')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Lanjut ke Kelengkapan Produk</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KELENGKAPAN PRODUK */}
          {activeTab === 'produk' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-teal-800 text-white p-3.5 rounded-xl shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-teal-300" />
                    <h4 className="font-bold text-sm sm:text-base">A.4 Kelengkapan Produk Subsidi & Non-Subsidi</h4>
                  </div>
                  <p className="text-xs text-teal-100 mt-0.5">
                    Verifikasi Komoditas Pangan Strategis Nasional (4 Subsidi & 2 Non-Subsidi Sesuai Halaman 2 PDF)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-xs bg-teal-900/80 px-2.5 py-1 rounded font-semibold text-teal-200 border border-teal-700">
                    {currentScore.produkScore.ada}/6 Butir ({currentScore.produkScore.pct}%)
                  </span>
                  <button
                    onClick={() => markAllProduk('ada')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-700 hover:bg-teal-600 text-white rounded transition-colors"
                  >
                    Tandai Semua Ada
                  </button>
                  <button
                    onClick={() => markAllProduk('tidak_ada')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-950 hover:bg-black text-teal-200 rounded transition-colors"
                  >
                    Tandai Tidak Ada
                  </button>
                </div>
              </div>

              {/* Sub-indikator 1 & 2: Ketersediaan Produk Subsidi */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                      Komoditas Subsidi Strategis
                    </span>
                    <h5 className="font-bold text-sm text-slate-800">
                      1 & 2. LPG 3 kg, Pupuk Bersubsidi, Beras SPHP, & Minyakita
                    </h5>
                  </div>
                  <span className="text-[11px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded border border-red-200">
                    Pangan & Energi Rakyat
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'lpg3kg', label: 'LPG 3 kg', placeholderQty: 'Contoh: 560 tabung', unit: 'tabung', suggestions: ['Pasokan rutin Pertamina 560 tbg/minggu', 'Menunggu alokasi kuota / sub-penyalur resmi', 'Gudang penyimpanan gas siap standar K3', 'Kendala transportasi tabung dari SPPBE'] },
                    { key: 'pupukBersubsidi', label: 'Pupuk Bersubsidi (Urea / NPK)', placeholderQty: 'Contoh: 15 Ton', unit: 'ton', suggestions: ['Alokasi e-Alokasi Urea & NPK siap salur', 'Menunggu penebusan kelompok tani', 'Stok gudang pupuk mencukupi musim tanam', 'Menunggu droping produsen Pupuk Indonesia'] },
                    { key: 'berasSPHP', label: 'Beras SPHP Bulog', placeholderQty: 'Contoh: 5.000 Kg', unit: 'kg', suggestions: ['Pasokan lancar dari Perum Bulog', 'Pengajuan RPK ke Bulog sedang diproses', 'Stok cepat habis terserap warga', 'Harga tebus sesuai HET Bulog'] },
                    { key: 'minyakita', label: 'Minyak Goreng Minyakita', placeholderQty: 'Contoh: 1.500 Liter', unit: 'liter', suggestions: ['Pasokan lancar kemasan botol & bantal', 'Menunggu pengiriman distributor DMO', 'Harga jual stabil Rp 15.700/liter', 'Permintaan warga sangat tinggi'] }
                  ].map(({ key, label, placeholderQty, suggestions }) => {
                    const prod = (checklist.produk as any)[key];

                    return (
                      <div
                        key={key}
                        className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-800">{label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdate(prev => {
                                  (prev.produk as any)[key].status = 'ada';
                                  return prev;
                                })
                              }
                              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                prod.status === 'ada'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-600 hover:bg-emerald-100'
                              }`}
                            >
                              ✓ Ada
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdate(prev => {
                                  (prev.produk as any)[key].status = 'tidak_ada';
                                  return prev;
                                })
                              }
                              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                prod.status === 'tidak_ada'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-600 hover:bg-rose-100'
                              }`}
                            >
                              ✕ Tidak Ada
                            </button>
                          </div>
                        </div>

                        {/* Input 3 Kolom Keterangan PDF */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Jumlah yang sudah diterima :
                            </label>
                            <input
                              type="text"
                              placeholder={placeholderQty}
                              value={prod.jumlahDiterima || ''}
                              onChange={e =>
                                handleUpdate(prev => {
                                  (prev.produk as any)[key].jumlahDiterima = e.target.value;
                                  return prev;
                                })
                              }
                              className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Jumlah stok saat ini :
                            </label>
                            <input
                              type="text"
                              placeholder="Sisa stok gudang..."
                              value={prod.jumlahStok || ''}
                              onChange={e =>
                                handleUpdate(prev => {
                                  (prev.produk as any)[key].jumlahStok = e.target.value;
                                  return prev;
                                })
                              }
                              className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-teal-600" />
                                Periode Pengiriman (Tanggal):
                              </span>
                              {prod.periodePengiriman && (
                                <span className="text-[10px] text-teal-700 font-mono font-semibold">
                                  {prod.periodePengiriman}
                                </span>
                              )}
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="date"
                                value={prod.periodePengiriman || ''}
                                onChange={e =>
                                  handleUpdate(prev => {
                                    (prev.produk as any)[key].periodePengiriman = e.target.value;
                                    return prev;
                                  })
                                }
                                className="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-slate-800"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdate(prev => {
                                    (prev.produk as any)[key].periodePengiriman = new Date().toISOString().split('T')[0];
                                    return prev;
                                  })
                                }
                                className="px-2 py-1.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg shrink-0 border border-slate-200"
                                title="Atur ke tanggal hari ini"
                              >
                                Hari Ini
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Input Catatan & Keterangan Pasokan */}
                        <div className="pt-2 border-t border-slate-200/70">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Keterangan / Catatan Pasokan & Kendala :
                          </label>
                          <input
                            type="text"
                            placeholder={
                              prod.status === 'tidak_ada'
                                ? 'Alasan belum tersedia atau kendala alokasi pasokan...'
                                : 'Catatan kuota, distributor, armada, atau kondisi pengiriman...'
                            }
                            value={prod.keterangan || ''}
                            onChange={e =>
                              handleUpdate(prev => {
                                (prev.produk as any)[key].keterangan = e.target.value;
                                return prev;
                              })
                            }
                            className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {suggestions.map(sug => (
                              <button
                                key={sug}
                                type="button"
                                onClick={() =>
                                  handleUpdate(prev => {
                                    (prev.produk as any)[key].keterangan = sug;
                                    return prev;
                                  })
                                }
                                className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                              >
                                + {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-indikator 3: Ketersediaan Produk Non Subsidi */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                      Komoditas Non-Subsidi
                    </span>
                    <h5 className="font-bold text-sm text-slate-800">3. Gula & Obat-obatan / Apotek Desa</h5>
                  </div>
                  <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                    B2B & Kemitraan
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'gula', label: 'Gula (Pasir / Kemasan Olahan)', defaultSupply: 'PT RNI / PTPN / Distributor Lokal' },
                    { key: 'obatObatan', label: 'Obat-obatan / Apotek Desa', defaultSupply: 'Kimia Farma / PBF Berizin' }
                  ].map(({ key, label, defaultSupply }) => {
                    const prod = (checklist.produk as any)[key];
                    return (
                      <div
                        key={key}
                        className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-800">{label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdate(prev => {
                                  (prev.produk as any)[key].status = 'ada';
                                  return prev;
                                })
                              }
                              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                prod.status === 'ada'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-600 hover:bg-emerald-100'
                              }`}
                            >
                              ✓ Ada
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdate(prev => {
                                  (prev.produk as any)[key].status = 'tidak_ada';
                                  return prev;
                                })
                              }
                              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                prod.status === 'tidak_ada'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-600 hover:bg-rose-100'
                              }`}
                            >
                              ✕ Tidak Ada
                            </button>
                          </div>
                        </div>

                        {/* Input 3 Kolom Non Subsidi: Periode, Sumber Supply, Skema */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-blue-600" />
                                Periode Pengiriman (Tanggal):
                              </span>
                              {prod.periodePengiriman && (
                                <span className="text-[10px] text-blue-700 font-mono font-semibold">
                                  {prod.periodePengiriman}
                                </span>
                              )}
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="date"
                                value={prod.periodePengiriman || ''}
                                onChange={e =>
                                  handleUpdate(prev => {
                                    (prev.produk as any)[key].periodePengiriman = e.target.value;
                                    return prev;
                                  })
                                }
                                className="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-slate-800"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdate(prev => {
                                    (prev.produk as any)[key].periodePengiriman = new Date().toISOString().split('T')[0];
                                    return prev;
                                  })
                                }
                                className="px-2 py-1.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg shrink-0 border border-slate-200"
                                title="Atur ke tanggal hari ini"
                              >
                                Hari Ini
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Sumber supply produk :
                            </label>
                            <input
                              type="text"
                              placeholder={defaultSupply}
                              value={prod.sumberSupply || ''}
                              onChange={e =>
                                handleUpdate(prev => {
                                  (prev.produk as any)[key].sumberSupply = e.target.value;
                                  return prev;
                                })
                              }
                              className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Skema kerja sama :
                            </label>
                            <select
                              value={prod.skemaKerjasama || ''}
                              onChange={e =>
                                handleUpdate(prev => {
                                  (prev.produk as any)[key].skemaKerjasama = e.target.value as SkemaKerjasama;
                                  return prev;
                                })
                              }
                              className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                            >
                              <option value="">-- Pilih Skema Kerjasama --</option>
                              <option value="konsinyasi">Konsinyasi (Titip Jual)</option>
                              <option value="beli_putus">Beli Putus (Cash / Tempo)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tab 4 Navigation Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('sistem')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Kelengkapan Sistem</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-xs transition-colors"
                    title="Simpan data saat ini meskipun komponen lainnya belum lengkap"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span>Simpan Sementara</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('transaksi')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Lanjut ke Peninjauan Transaksi</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PENINJAUAN TRANSAKSI GERAI */}
          {activeTab === 'transaksi' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-teal-800 text-white p-3.5 rounded-xl shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-teal-300" />
                    <h4 className="font-bold text-sm sm:text-base">B. Peninjauan Transaksi Gerai & Evaluasi Lapangan</h4>
                  </div>
                  <p className="text-xs text-teal-100 mt-0.5">
                    Evaluasi Jam Operasional, Nilai Transaksi Harian, Komoditas Favorit, Kanal Pembayaran & Kendala (Sesuai Halaman 2 PDF)
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold border ${
                      currentScore.transaksiCompleted
                        ? 'bg-emerald-900/90 text-emerald-200 border-emerald-700'
                        : 'bg-amber-900/90 text-amber-200 border-amber-700'
                    }`}
                  >
                    {currentScore.transaksiCompleted ? '✓ Lengkap Terisi' : '⚠ Perlu Dilengkapi'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                {/* 1. Waktu Operasional */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                      1
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">Waktu Operasional KD/KMP</h5>
                      <p className="text-[11px] text-slate-500">Jadwal buka dan jam pelayanan gerai kepada masyarakat</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Range Waktu Buka :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 08.00 - 21.00 WIB"
                        value={checklist.transaksi.waktuOperasional.rangeWaktu || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.waktuOperasional.rangeWaktu = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['08.00 - 17.00 WIB', '08.00 - 21.00 WIB', '07.00 - 22.00 WIB', '06.00 - 18.00 WIB', '24 Jam Operasional'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.transaksi.waktuOperasional.rangeWaktu = preset;
                                return prev;
                              })
                            }
                            className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Keterangan Operasional :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Buka setiap hari / 2 shift kasir..."
                        value={checklist.transaksi.waktuOperasional.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.waktuOperasional.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Nilai transaksi harian */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                      2
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">Nilai Transaksi Harian (Omzet Rata-rata)</h5>
                      <p className="text-[11px] text-slate-500">Estimasi perputaran uang tunai & non-tunai per hari</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Range Nilai Omzet :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Rp 200.000 - Rp 300.000 / hari"
                        value={checklist.transaksi.nilaiTransaksiHarian.rangeNilai || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.nilaiTransaksiHarian.rangeNilai = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          'Rp 200.000 - Rp 300.000 / hari',
                          '< Rp 1.000.000 / hari',
                          'Rp 3.000.000 - Rp 7.000.000 / hari',
                          'Rp 7.000.000 - Rp 15.000.000 / hari',
                          'Rp 15.000.000 - Rp 25.000.000 / hari',
                          '> Rp 25.000.000 / hari'
                        ].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.transaksi.nilaiTransaksiHarian.rangeNilai = val;
                                return prev;
                              })
                            }
                            className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Keterangan Fluktuasi Omzet :
                      </label>
                      <input
                        type="text"
                        placeholder="Puncak transaksi saat hari pasar desa / musim panen..."
                        value={checklist.transaksi.nilaiTransaksiHarian.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.nilaiTransaksiHarian.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Jenis produk yang paling laku terjual */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                      3
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">Jenis Produk yang Paling Laku Terjual</h5>
                      <p className="text-[11px] text-slate-500">Komoditas favorit masyarakat dengan perputaran stok tercepat</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Daftar Produk & Range Jumlah :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Beras SPHP 100 sak/hari, Minyakita 150 pouch/hari..."
                        value={checklist.transaksi.produkPalingLaku.rangeJumlah || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.produkPalingLaku.rangeJumlah = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          'Beras SPHP 100 sak & Minyakita 150 pouch / hari',
                          'LPG 3 kg 80 tabung & Gula Pasir 50 kg / hari',
                          'Pupuk Bersubsidi NPK & Urea musim tanam'
                        ].map(itemStr => (
                          <button
                            key={itemStr}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.transaksi.produkPalingLaku.rangeJumlah = itemStr;
                                return prev;
                              })
                            }
                            className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                          >
                            + {itemStr}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Keterangan Perputaran :
                      </label>
                      <input
                        type="text"
                        placeholder="Keterangan perputaran persediaan..."
                        value={checklist.transaksi.produkPalingLaku.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.produkPalingLaku.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Jenis produk yang kurang laku terjual */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                      4
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">Jenis Produk yang Kurang Laku Terjual</h5>
                      <p className="text-[11px] text-slate-500">Barang dengan perputaran lambat (slow-moving items)</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nama Produk Lambat :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Sabun cuci kemasan besar, obat non-resep harga tinggi..."
                        value={checklist.transaksi.produkKurangLaku.namaProduk || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.produkKurangLaku.namaProduk = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Penyebab Kurang Peminat :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Harga lebih tinggi dari warung sekitar / ukuran terlalu besar..."
                        value={checklist.transaksi.produkKurangLaku.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.produkKurangLaku.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Mekanisme transaksi (cash/cashless) */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                      5
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">
                        Mekanisme Transaksi Pembayaran (Cash / Cashless)
                      </h5>
                      <p className="text-[11px] text-slate-500">Kesiapan kanal penerimaan uang tunai dan pembayaran digital</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                        Metode Transaksi yang Didukung :
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'cash', label: 'Cash (Tunai)' },
                          { id: 'cashless', label: 'Cashless (Non-Tunai)' },
                          { id: 'keduanya', label: 'Keduanya' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.transaksi.mekanismeTransaksi.pilihan = opt.id as MekanismeTransaksiPilihan;
                                return prev;
                              })
                            }
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                              checklist.transaksi.mekanismeTransaksi.pilihan === opt.id
                                ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Fasilitas Pembayaran (EDC / QRIS / Tunai) :
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: EDC BRI, QRIS Dinamis Bank, & Uang Tunai Kasir..."
                        value={checklist.transaksi.mekanismeTransaksi.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.mekanismeTransaksi.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          'EDC Merchant Bank BRI / Mandiri',
                          'QRIS Statis & Dinamis',
                          'Tunai Kasir Langsung',
                          'Transfer Bank Koperasi'
                        ].map(facility => (
                          <button
                            key={facility}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.transaksi.mekanismeTransaksi.keterangan = facility;
                                return prev;
                              })
                            }
                            className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                          >
                            + {facility}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Kendala yang dialami dan bentuk dukungan yang diperlukan */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                      6
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">
                        Kendala Operasional & Bentuk Dukungan yang Diperlukan
                      </h5>
                      <p className="text-[11px] text-slate-500">Catatan tantangan lapangan dan rekomendasi intervensi pemangku kepentingan</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 sm:pl-9">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Kendala Utama di Lapangan :
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Jelaskan hambatan pasokan, sinyal, modal kerja, atau kendala sarpras..."
                        value={checklist.transaksi.kendalaDanDukungan.kendalaUtama || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.kendalaDanDukungan.kendalaUtama = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          'Kestabilan Sinyal Internet Lemah',
                          'Keterlambatan Pasokan Pupuk/LPG',
                          'Kapasitas Gudang Terbatas',
                          'Keterbatasan Modal Kerja'
                        ].map(k => (
                          <button
                            key={k}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.transaksi.kendalaDanDukungan.kendalaUtama = k;
                                return prev;
                              })
                            }
                            className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                          >
                            + {k}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Bentuk Dukungan yang Diperlukan :
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Bantuan peralatan, penambahan kuota subsidi, penguat sinyal, pelatihan..."
                        value={checklist.transaksi.kendalaDanDukungan.keterangan || ''}
                        onChange={e =>
                          handleUpdate(prev => {
                            prev.transaksi.kendalaDanDukungan.keterangan = e.target.value;
                            return prev;
                          })
                        }
                        className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          'Penambahan Kuota Alokasi Pupuk & LPG',
                          'Bantuan Penguat Sinyal / Starlink',
                          'Pendampingan Teknis Aplikasi POS',
                          'Tambahan Armada Pickup / Roda 3'
                        ].map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() =>
                              handleUpdate(prev => {
                                prev.transaksi.kendalaDanDukungan.keterangan = d;
                                return prev;
                              })
                            }
                            className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                          >
                            + {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab 5 Navigation Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('produk')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Kelengkapan Produk</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Seluruh Checklist</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500">
              {hasUnsavedChanges ? (
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  Ada perubahan yang belum disimpan
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">Semua data tersimpan</span>
              )}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Data tetap dapat disimpan walaupun belum lengkap</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
            >
              Tutup
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-sm transition-colors"
              title="Data tetap dapat disimpan walaupun belum lengkap"
            >
              <Save className="w-4 h-4" />
              Simpan Hasil Checklist
            </button>
          </div>
        </div>

        {/* Handwriting Scan Modal */}
        <HandwritingScanModal
          isOpen={showHandwritingModal}
          onClose={() => setShowHandwritingModal(false)}
          onApplyData={handleApplyHandwritingData}
          locationName={location.namaLokasi}
        />
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  Check,
  RefreshCw,
  Building2,
  Users,
  Cpu,
  ShoppingBag,
  Receipt,
  FileCheck
} from 'lucide-react';
import { KDKMPChecklist, calculateReadiness } from '../types/kdkmp';

interface HandwritingScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (data: {
    checklist: Partial<KDKMPChecklist>;
    tanggalKunjungan?: string;
    namaPetugas?: string;
    summary?: string;
  }) => void;
  locationName: string;
}

export const HandwritingScanModal: React.FC<HandwritingScanModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
  locationName
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isKeyMissing, setIsKeyMissing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<{
    tanggalKunjungan?: string;
    namaPetugas?: string;
    ringkasanTulisanTangan?: string;
    checklist?: KDKMPChecklist;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMimeType(file.type || 'image/jpeg');
    setErrorMsg(null);
    setExtractedData(null);

    const reader = new FileReader();
    reader.onload = event => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generate a realistic sample handwritten form representation
  const handleLoadSampleDemo = () => {
    setErrorMsg(null);
    setFileName('Form_KDKMP_Survei_Lapangan_TulisanTangan_Scan.jpg');
    setMimeType('image/jpeg');

    // Create a demo canvas with handwritten aesthetic
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Paper background
      ctx.fillStyle = '#fbfbfa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid / line pattern
      ctx.strokeStyle = '#e6e8eb';
      ctx.lineWidth = 1;
      for (let y = 120; y < canvas.height - 40; y += 35) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.width - 40, y);
        ctx.stroke();
      }

      // Title & Header (printed)
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('LEMBAR CHECKLIST KESIAPAN KDKMP', 50, 60);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`Lokasi: ${locationName} • Evaluasi Kesiapan Operasional`, 50, 85);

      // Simulated handwriting in blue pen
      ctx.fillStyle = '#1e40af';
      ctx.font = 'italic 16px "Comic Sans MS", cursive, sans-serif';
      ctx.fillText('Tgl Kunjungan : 24 Oktober 2026', 50, 145);
      ctx.fillText('Petugas : Ir. Bambang Hidayat (Surveyor APN)', 420, 145);

      ctx.fillText('1. Fisik & Sarpras: Gudang ADA (kapasitas 80 ton), Gerai ADA', 50, 180);
      ctx.fillText('   Listrik: ADA (11.000 VA), Air: ADA (PDAM lancar)', 50, 215);
      ctx.fillText('   Fasilitas Klinik: ADA, Rak Obat: ADA', 50, 250);
      ctx.fillText('   [v] Rak display [v] Perangkat Kasir [v] CCTV [v] APAR [v] Seragam', 50, 285);
      ctx.fillText('   Catatan: Pickup 4x4 masih dalam pemesanan dealer', 50, 320);

      ctx.fillText('2. SDM: Manajer ADA (Onboarding: 2026-10-15)', 50, 390);
      ctx.fillText('   Rekrutmen warga lokal: YA (100% putra daerah)', 50, 425);
      ctx.fillText('   Koordinasi Kades: ADA (Tgl 2026-10-18)', 50, 460);

      ctx.fillText('3. Sistem: Stok ADA (Aplikasi POS Cloud), Absensi ADA', 50, 530);

      ctx.fillText('4. Produk Subsidi & Non Subsidi:', 50, 600);
      ctx.fillText('   - LPG 3kg: ADA (Diterima 560 tbg, Stok 420, Tgl Kirim: 2026-10-25)', 50, 635);
      ctx.fillText('   - Pupuk Bersubsidi: ADA (Diterima 20 Ton, Tgl Kirim: 2026-10-26)', 50, 670);
      ctx.fillText('   - Beras SPHP: ADA (Diterima 5.000 Kg, Tgl Kirim: 2026-10-24)', 50, 705);
      ctx.fillText('   - Minyakita: ADA (Diterima 1.200 Liter, Tgl Kirim: 2026-10-25)', 50, 740);
      ctx.fillText('   - Gula: ADA (Suplier: PT RNI, Skema: Beli Putus, Tgl: 2026-10-27)', 50, 775);
      ctx.fillText('   - Obat-obatan: ADA (Suplier: Kimia Farma, Tgl: 2026-10-28)', 50, 810);

      ctx.fillText('5. Transaksi: Buka 07.00 - 21.00, Omzet Rp 15 - 25 Jt/hari, QRIS & Cash', 50, 880);
      ctx.fillText('Tanda Tangan Surveyor: [Bambang H.]', 500, 940);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedImage(dataUrl);
  };

  const runHandwritingScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setErrorMsg(null);
    setIsKeyMissing(false);
    setScanStep('1/3 Membaca goresan tulisan tangan & teks formulir...');

    try {
      setTimeout(() => {
        setScanStep('2/3 Menganalisis centang (✓), angka stok, dan tanggal pengiriman...');
      }, 1200);

      setTimeout(() => {
        setScanStep('3/3 Menstandarkan data ke indikator kelengkapan KDKMP...');
      }, 2400);

      const res = await fetch('/api/scan-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: mimeType || 'image/jpeg'
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.isKeyMissing) {
          setIsKeyMissing(true);
        }
        throw new Error(json.error || 'Gagal memproses tulisan tangan dengan AI');
      }

      setExtractedData(json.data);
    } catch (err: any) {
      console.warn('API Handwriting Scan issue:', err);
      setErrorMsg(err.message || 'Gagal membaca tulisan tangan.');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Provide fallback demo simulated extraction when Gemini API key is missing
  const applySimulatedDemoResult = () => {
    const demoData = {
      tanggalKunjungan: new Date().toISOString().split('T')[0],
      namaPetugas: 'Ir. Bambang Hidayat (Surveyor Lapangan APN)',
      ringkasanTulisanTangan:
        'Catatan tulisan tangan terbaca: Kesiapan fisik gerai dan gudang sangat baik. Pasokan pupuk bersubsidi dan LPG 3 kg telah tiba dan terjadwal dengan rapi. SDM putra daerah siap bertugas.',
      checklist: {
        fisikSarpras: {
          bangunanGudang: { status: 'ada' as const, keterangan: 'Kapasitas 80 ton, bersih dan berkanopi aman' },
          bangunanGerai: { status: 'ada' as const, keterangan: 'Luas 120 m2 siap display produk' },
          instalasiListrik: { status: 'ada' as const, keterangan: 'Daya 11.000 VA stabil' },
          instalasiAirBersih: { status: 'ada' as const, keterangan: 'Sumber sumur bor & PDAM mengalir lancar' },
          fasilitasKlinik: { status: 'ada' as const, keterangan: 'Ruang periksa 1 unit bersih' },
          rakObatApotek: { status: 'ada' as const, keterangan: 'Rak kaca tertutup rapat' },
          saranaPrasarana: {
            rakDisplay: { status: 'ada' as const, keterangan: '6 unit rak gondola siap pakai' },
            perangkatKasir: { status: 'ada' as const, keterangan: '2 unit POS desktop + barcode scanner' },
            truk6Ban: { status: 'ada' as const, keterangan: 'Tersedia 1 unit kondisi prima' },
            pickup4x4: { status: 'tidak_ada' as const, keterangan: 'Tahap pengiriman dealer' },
            motorBakRoda3: { status: 'ada' as const, keterangan: '1 unit operasional desa' },
            ac: { status: 'ada' as const, keterangan: '2 unit AC split gerai dingin' },
            apar: { status: 'ada' as const, keterangan: '2 tabung 6kg tersertifikasi' },
            cctv: { status: 'ada' as const, keterangan: '4 channel aktif merekam' },
            kipasCeiling: { status: 'ada' as const, keterangan: '3 unit terpasang' },
            keranjangBelanja: { status: 'ada' as const, keterangan: '20 keranjang jinjing' },
            seragamKD: { status: 'ada' as const, keterangan: 'Lengkap untuk 6 pegawai' },
            papanNamaKD: { status: 'ada' as const, keterangan: 'Neon box depan gerai menyala' },
          }
        },
        sdm: {
          manajerKD: { status: 'ada' as const, tanggalOnBoarding: '2026-10-15', keterangan: 'Pengalaman retail 4 tahun' },
          sdmRekrutmenAPN: { status: 'ada' as const, masyarakatSekitar: 'ya' as const, keterangan: '100% pemuda-pemudi desa setempat' },
          koordinasiPengurusKades: { status: 'ada' as const, mekanismeKoordinasi: 'Rapat mingguan di balai desa', tanggalKoordinasi: '2026-10-18', keterangan: 'Dukungan penuh kepala desa' },
          pembekalanManajer: { status: 'ada' as const, tanggalPembekalan: '2026-10-20', keterangan: 'Selesai modul SOP pergudangan & kasir' },
        },
        sistem: {
          sistemStokBarang: { status: 'ada' as const, keterangan: 'Software POS real-time cloud' },
          sistemPemesananProduk: { status: 'ada' as const, keterangan: 'Aplikasi terhubung ke distributor' },
          sistemAbsensiPegawai: { status: 'ada' as const, keterangan: 'Fingerprint & mobile barcode' },
        },
        produk: {
          lpg3kg: { status: 'ada' as const, jumlahDiterima: '560 Tabung', jumlahStok: '420 Tabung', periodePengiriman: '2026-10-25', keterangan: 'Pangkalan resmi Pertamina' },
          pupukBersubsidi: { status: 'ada' as const, jumlahDiterima: '20 Ton (Urea & NPK)', jumlahStok: '16 Ton', periodePengiriman: '2026-10-26', keterangan: 'Gudang terpisah kering' },
          berasSPHP: { status: 'ada' as const, jumlahDiterima: '5.000 Kg', jumlahStok: '3.800 Kg', periodePengiriman: '2026-10-24', keterangan: 'Kemasan 5kg Bulog higienis' },
          minyakita: { status: 'ada' as const, jumlahDiterima: '1.200 Liter', jumlahStok: '900 Liter', periodePengiriman: '2026-10-25', keterangan: 'Kemasan bantal & botol 1L' },
          gula: { status: 'ada' as const, periodePengiriman: '2026-10-27', sumberSupply: 'PT RNI / PTPN Holding', skemaKerjasama: 'beli_putus' as const, keterangan: 'Gula pasir premium 1kg' },
          obatObatan: { status: 'ada' as const, periodePengiriman: '2026-10-28', sumberSupply: 'Kimia Farma Apotek Desa', skemaKerjasama: 'konsinyasi' as const, keterangan: 'Obat bebas & vitamin esensial' },
        },
        transaksi: {
          waktuOperasional: { rangeWaktu: '07.00 - 21.00 WIB (Setiap Hari)', keterangan: '2 shift kerja' },
          nilaiTransaksiHarian: { rangeNilai: 'Rp 15.000.000 - Rp 25.000.000 / hari', keterangan: 'Puncak transaksi pagi & sore' },
          produkPalingLaku: { rangeJumlah: 'Beras SPHP 150 pack/hari & LPG 3kg', keterangan: 'Kebutuhan pokok rumah tangga' },
          produkKurangLaku: { namaProduk: 'Kemasan ukuran besar 50kg', keterangan: 'Masyarakat lebih meminati kemasan 5kg' },
          mekanismeTransaksi: { pilihan: 'keduanya' as const, keterangan: 'QRIS BRI/Mandiri & Uang Tunai' },
          kendalaDanDukungan: { kendalaUtama: 'Jaringan internet kadang lambat saat hujan lebat', keterangan: 'Perlu penguat sinyal / backup modem GSM' },
        }
      }
    };

    setExtractedData(demoData as any);
    setErrorMsg(null);
  };

  const handleConfirmApply = () => {
    if (!extractedData) return;

    onApplyData({
      checklist: extractedData.checklist || {},
      tanggalKunjungan: extractedData.tanggalKunjungan,
      namaPetugas: extractedData.namaPetugas,
      summary: extractedData.ringkasanTulisanTangan
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Scan & Baca Tulisan Tangan Formulir KDKMP
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  AI OCR Vision
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Pindai foto lembar checklist tulisan tangan atau catatan kertas surveyor untuk otomatis mengisi formulir.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
          {/* Top Options: Upload, Camera, or Sample Demo */}
          {!extractedData && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Langkah 1: Unggah Foto Tulisan Tangan Formulir
                </span>
                <button
                  type="button"
                  onClick={handleLoadSampleDemo}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gunakan Contoh Scan Formulir Tulisan Tangan (Demo)
                </button>
              </div>

              {/* Upload Dropzone */}
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3 group"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Klik atau seret foto lembar kertas tulisan tangan ke sini
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Mendukung format JPG, PNG, WebP (foto kamera ponsel atau hasil scan lembar kerja)
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Pilih dari File
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Ambil Foto via Kamera
                    </button>
                  </div>
                </div>
              ) : (
                /* Image Preview with Change / Clear actions */
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-medium truncate max-w-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      {fileName || 'Foto Formulir Terpilih'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Ganti Foto
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setExtractedData(null);
                        }}
                        className="text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Image Display */}
                  <div className="relative max-h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Formulir Tulisan Tangan"
                      className="max-h-72 w-auto object-contain mx-auto"
                    />

                    {isScanning && (
                      <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white p-4 text-center">
                        <Loader2 className="w-9 h-9 animate-spin text-indigo-400 mb-3" />
                        <span className="font-bold text-sm text-white">Sedang Membaca Tulisan Tangan...</span>
                        <span className="text-xs text-indigo-200 mt-1 max-w-sm animate-pulse">{scanStep}</span>
                      </div>
                    )}
                  </div>

                  {/* Trigger Scan Button */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleLoadSampleDemo}
                      className="text-xs text-slate-500 hover:text-indigo-600 underline font-medium"
                    >
                      Muat ulang sampel demo
                    </button>

                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={runHandwritingScan}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses Gambar...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Mulai Pindai Tulisan Tangan (AI)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Error Message & Friendly Fallback */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs space-y-2 text-rose-800">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                Catatan Pemindaian:
              </div>
              <p>{errorMsg}</p>
              {isKeyMissing && (
                <p className="text-[11px] text-rose-700">
                  Kunci API Gemini (<code>GEMINI_API_KEY</code>) belum terpasang. Untuk menguji alur pengisian form, Anda dapat menggunakan tombol simulasi di bawah:
                </p>
              )}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={applySimulatedDemoResult}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gunakan Hasil Ekstraksi Contoh (Simulasi Tulisan Tangan)
                </button>
              </div>
            </div>
          )}

          {/* Extraction Results View */}
          {extractedData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Status Header */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900">
                      Tulisan Tangan Berhasil Dibaca & Diekstraksi!
                    </h4>
                    <p className="text-emerald-700 text-[11px]">
                      Data siap dimasukkan ke dalam form input checklist lokasi {locationName}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExtractedData(null);
                    setErrorMsg(null);
                  }}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium text-xs bg-white px-2.5 py-1 rounded border border-slate-200"
                >
                  <RefreshCw className="w-3 h-3" />
                  Pindai Ulang
                </button>
              </div>

              {/* Extracted Metadata Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Informasi Umum Terbaca dari Tulisan Tangan
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Tanggal Kunjungan Lapangan:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {extractedData.tanggalKunjungan || '(Tidak terdeteksi / gunakan hari ini)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Nama Petugas / Surveyor:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {extractedData.namaPetugas || '(Tidak terdeteksi)'}
                    </span>
                  </div>
                </div>

                {extractedData.ringkasanTulisanTangan && (
                  <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
                    <span className="font-bold block mb-1 text-indigo-900">Rangkuman Catatan Tulisan Tangan:</span>
                    <p className="italic leading-relaxed">{extractedData.ringkasanTulisanTangan}</p>
                  </div>
                )}
              </div>

              {/* Highlights of Extracted Checklist Pillars */}
              {extractedData.checklist && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Rincian Komponen Terbaca
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <Building2 className="w-4 h-4 mx-auto text-slate-600 mb-1" />
                      <span className="font-bold block text-slate-800">1. Fisik & Sarpras</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Teridentifikasi</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <Users className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                      <span className="font-bold block text-slate-800">2. Kelengkapan SDM</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Teridentifikasi</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <Cpu className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                      <span className="font-bold block text-slate-800">3. Sistem</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Teridentifikasi</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <ShoppingBag className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                      <span className="font-bold block text-slate-800">4. Produk & Tanggal Kirim</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Format Tanggal Siap</span>
                    </div>
                  </div>

                  {/* Highlights on Produk Periode Pengiriman */}
                  {extractedData.checklist.produk && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs space-y-1.5">
                      <div className="font-bold text-teal-900 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-teal-700" />
                        Tanggal Periode Pengiriman Produk yang Terbaca:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-teal-800">
                        <div>
                          • LPG 3kg: <span className="font-bold">{extractedData.checklist.produk.lpg3kg?.periodePengiriman || '-'}</span> (Stok: {extractedData.checklist.produk.lpg3kg?.jumlahStok || '-'})
                        </div>
                        <div>
                          • Pupuk: <span className="font-bold">{extractedData.checklist.produk.pupukBersubsidi?.periodePengiriman || '-'}</span> (Stok: {extractedData.checklist.produk.pupukBersubsidi?.jumlahStok || '-'})
                        </div>
                        <div>
                          • Beras SPHP: <span className="font-bold">{extractedData.checklist.produk.berasSPHP?.periodePengiriman || '-'}</span> (Stok: {extractedData.checklist.produk.berasSPHP?.jumlahStok || '-'})
                        </div>
                        <div>
                          • Minyakita: <span className="font-bold">{extractedData.checklist.produk.minyakita?.periodePengiriman || '-'}</span> (Stok: {extractedData.checklist.produk.minyakita?.jumlahStok || '-'})
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            Tutup
          </button>

          {extractedData ? (
            <button
              type="button"
              onClick={handleConfirmApply}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Terapkan Hasil Pindaian ke Form Checklist
            </button>
          ) : (
            <div className="text-[11px] text-slate-500">
              Unggah foto lembar checklist lalu klik "Mulai Pindai Tulisan Tangan"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

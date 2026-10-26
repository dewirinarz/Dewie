import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Check,
  Minus,
  FileSpreadsheet,
  HardDrive,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { KDKMPLocation } from '../types/kdkmp';
import { exportOfficialChecklistPdf, generateOfficialChecklistPdfBlob } from '../utils/exportUtils';
import { exportLocationToChecklistExcel } from '../utils/excelTemplateUtils';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import { uploadPdfChecklistToDrive } from '../services/googleDriveService';

interface OfficialPdfPreviewModalProps {
  location: KDKMPLocation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialPdfPreviewModal: React.FC<OfficialPdfPreviewModalProps> = ({
  location,
  isOpen,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !location) return null;

  const cl = location.checklist;
  const f = cl.fisikSarpras;
  const s = f.saranaPrasarana;
  const sdm = cl.sdm;
  const sis = cl.sistem;
  const p = cl.produk;
  const tr = cl.transaksi;

  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<{ name: string; url: string } | null>(null);
  const [driveUploadError, setDriveUploadError] = useState<string | null>(null);
  const [showConfirmDriveUpload, setShowConfirmDriveUpload] = useState(false);

  const handleDownloadPdf = () => {
    exportOfficialChecklistPdf(location);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInitiateDriveUpload = () => {
    setDriveUploadSuccess(null);
    setDriveUploadError(null);
    setShowConfirmDriveUpload(true);
  };

  const handleConfirmDriveUpload = async () => {
    setShowConfirmDriveUpload(false);
    setIsUploadingToDrive(true);
    setDriveUploadError(null);
    try {
      let activeToken = await getAccessToken();
      if (!activeToken) {
        const signResult = await googleSignIn();
        activeToken = signResult.accessToken;
      }
      const { blob, filename } = generateOfficialChecklistPdfBlob(location);
      const res = await uploadPdfChecklistToDrive(blob, filename, location.namaLokasi, activeToken);
      setDriveUploadSuccess({
        name: res.name,
        url: res.webViewLink || `https://drive.google.com/file/d/${res.id}/view`
      });
    } catch (err: any) {
      console.error('Failed to upload PDF to Drive:', err);
      setDriveUploadError(err.message || 'Gagal mengunggah berkas PDF ke Google Drive.');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const renderCheckCell = (isAda: boolean) => (
    <div className="flex items-center gap-4 text-xs font-mono">
      <span className="flex items-center gap-1">
        <span className="w-3.5 h-3.5 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
          {isAda ? '✓' : ''}
        </span>
        Ada
      </span>
      <span className="flex items-center gap-1">
        <span className="w-3.5 h-3.5 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
          {!isAda ? '✓' : ''}
        </span>
        Tidak Ada
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white">
              Pratinjau Lembar Checklist Resmi KDKMP
            </h3>
            <p className="text-xs text-slate-400">
              Format baku sesuai dokumen instrumen: {location.namaLokasi} ({location.kodeKDKMP})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInitiateDriveUpload}
              disabled={isUploadingToDrive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
              title="Simpan lembar checklist PDF unit ini langsung ke Google Drive"
            >
              {isUploadingToDrive ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <HardDrive className="w-3.5 h-3.5" />
              )}
              <span>{isUploadingToDrive ? 'Menyimpan...' : 'Simpan ke Drive'}</span>
            </button>
            <button
              onClick={() => exportLocationToChecklistExcel(location)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
              title="Unduh Formulir Checklist Unit Ini ke File Excel Sesuai PDF"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh</span> Excel
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh</span> PDF
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drive Success / Error Notification Banners */}
        {driveUploadSuccess && (
          <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-950/60 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Berkas <strong className="font-semibold">{driveUploadSuccess.name}</strong> berhasil disimpan di folder{' '}
                <strong>KDKMP_Dokumen_dan_Cadangan</strong> pada Google Drive Anda!
              </span>
            </div>
            <a
              href={driveUploadSuccess.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs text-[11px]"
            >
              <span>Buka di Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {driveUploadError && (
          <div className="px-5 py-2.5 bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-800 flex items-center justify-between text-xs text-red-700 dark:text-red-300 print:hidden">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{driveUploadError}</span>
            </div>
            <button
              onClick={() => setDriveUploadError(null)}
              className="text-red-500 hover:text-red-700 text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Document Content - Styled to match official PDF layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            ref={printRef}
            className="bg-white text-black w-full max-w-[210mm] shadow-lg p-8 sm:p-12 space-y-8 font-sans text-xs leading-normal border border-slate-300 print:shadow-none print:border-none print:p-0"
          >
            {/* === PAGE 1 === */}
            <div className="space-y-4">
              {/* Document Title */}
              <div className="text-center pb-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  List Checklist Kesiapan Operasionalisasi KDKMP
                </h1>
              </div>

              {/* Sub-header info */}
              <div className="space-y-1 text-xs border-b border-slate-300 pb-3">
                <div className="flex">
                  <span className="w-36 font-semibold text-slate-800">Lokasi KDKMP:</span>
                  <span className="text-slate-900 font-medium">
                    {location.namaLokasi} ({location.kodeKDKMP}) - {location.desaKelurahan}, Kec. {location.kecamatan},{' '}
                    {location.kabupatenKota}, {location.provinsi}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold text-slate-800">Tanggal Kunjungan:</span>
                  <span className="text-slate-900">{location.tanggalKunjungan || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold text-slate-800">Petugas Peninjau:</span>
                  <span className="text-slate-900">{location.namaPetugas || '-'}</span>
                </div>
              </div>

              {/* Section A. Peninjauan Gudang dan Gerai */}
              <div className="border border-slate-700">
                {/* Table Header Section A */}
                <div className="bg-teal-700 text-white font-bold px-3 py-1.5 text-xs">
                  A. Peninjauan Gudang dan Gerai
                </div>
                <div className="grid grid-cols-12 bg-slate-200 border-b border-slate-700 font-bold text-[11px] text-slate-900">
                  <div className="col-span-1 p-1.5 text-center border-r border-slate-700">No</div>
                  <div className="col-span-5 p-1.5 border-r border-slate-700">Indikator</div>
                  <div className="col-span-3 p-1.5 text-center border-r border-slate-700">Checklist</div>
                  <div className="col-span-3 p-1.5">Keterangan</div>
                </div>

                {/* Subheader: Kelengkapan Fisik */}
                <div className="bg-slate-100 px-3 py-1 font-bold text-[11px] text-slate-900 border-b border-slate-700">
                  Kelengkapan Fisik serta Sarana dan Prasarana
                </div>

                {/* Fisik Items 1-6 */}
                {[
                  {
                    no: 1,
                    text: 'Ketersediaan Bangunan Gudang (termasuk tempat penyimpanan LPG 3 Kg dan Pupuk Bersubsidi)',
                    item: f.bangunanGudang
                  },
                  { no: 2, text: 'Ketersediaan Bangunan Gerai', item: f.bangunanGerai },
                  { no: 3, text: 'Ketersediaan Instalasi Listrik', item: f.instalasiListrik },
                  { no: 4, text: 'Ketersediaan Instalasi Air Bersih', item: f.instalasiAirBersih },
                  { no: 5, text: 'Ketersediaan Fasilitas Klinik', item: f.fasilitasKlinik },
                  { no: 6, text: 'Ketersediaan Rak Obat-obatan / Apotek', item: f.rakObatApotek }
                ].map(({ no, text, item }) => (
                  <div key={no} className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700">{no}</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700">{text}</div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 flex items-center justify-center">
                      {renderCheckCell(item.status === 'ada')}
                    </div>
                    <div className="col-span-3 p-1.5 text-slate-700">{item.keterangan || '-'}</div>
                  </div>
                ))}

                {/* Sarpras Header (No 7) */}
                <div className="grid grid-cols-12 border-b border-slate-400 text-[11px] bg-slate-50">
                  <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">7</div>
                  <div className="col-span-11 p-1.5 font-bold text-slate-900">
                    Ketersediaan Sarana dan Prasarana
                  </div>
                </div>

                {/* 12 Sarana Prasarana Items */}
                {[
                  { key: 'rakDisplay', label: 'Rak display' },
                  { key: 'perangkatKasir', label: 'Perangkat Kasir (termasuk software )' },
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
                  const itm = (s as any)[key];
                  return (
                    <div key={key} className="grid grid-cols-12 border-b border-slate-300 text-[11px]">
                      <div className="col-span-1 p-1 text-center border-r border-slate-700" />
                      <div className="col-span-5 p-1 pl-4 border-r border-slate-700">{label}</div>
                      <div className="col-span-3 p-1 border-r border-slate-700 flex items-center justify-center">
                        {renderCheckCell(itm.status === 'ada')}
                      </div>
                      <div className="col-span-3 p-1 text-slate-700 text-[10px]">{itm.keterangan || '-'}</div>
                    </div>
                  );
                })}

                {/* Subheader: Kelengkapan SDM */}
                <div className="bg-slate-100 px-3 py-1 font-bold text-[11px] text-slate-900 border-b border-slate-700 border-t border-slate-700">
                  Kelengkapan SDM
                </div>

                {/* SDM Item 1 */}
                <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                  <div className="col-span-1 p-1.5 text-center border-r border-slate-700">1</div>
                  <div className="col-span-5 p-1.5 border-r border-slate-700">Ketersediaan Manajer KD/KMP</div>
                  <div className="col-span-3 p-1.5 border-r border-slate-700 flex items-center justify-center">
                    {renderCheckCell(sdm.manajerKD.status === 'ada')}
                  </div>
                  <div className="col-span-3 p-1.5 text-[10px]">
                    <div>Tanggal on boarding Manajer KD/KMP : {sdm.manajerKD.tanggalOnBoarding || '...'}</div>
                    {sdm.manajerKD.keterangan && <div className="text-slate-500">Ket: {sdm.manajerKD.keterangan}</div>}
                  </div>
                </div>

                {/* SDM Item 2 */}
                <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                  <div className="col-span-1 p-1.5 text-center border-r border-slate-700">2</div>
                  <div className="col-span-5 p-1.5 border-r border-slate-700">Ketersediaan SDM rekrutmen APN</div>
                  <div className="col-span-3 p-1.5 border-r border-slate-700 flex items-center justify-center">
                    {renderCheckCell(sdm.sdmRekrutmenAPN.status === 'ada')}
                  </div>
                  <div className="col-span-3 p-1.5 text-[10px]">
                    <div>
                      SDM merupakan masyarakat sekitar KD/KMP :{' '}
                      <strong>{sdm.sdmRekrutmenAPN.masyarakatSekitar ? (sdm.sdmRekrutmenAPN.masyarakatSekitar === 'ya' ? 'ya' : 'tidak') : 'ya / tidak'}</strong>
                    </div>
                    {sdm.sdmRekrutmenAPN.keterangan && <div className="text-slate-500">{sdm.sdmRekrutmenAPN.keterangan}</div>}
                  </div>
                </div>

                {/* SDM Item 3 */}
                <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                  <div className="col-span-1 p-1.5 text-center border-r border-slate-700">3</div>
                  <div className="col-span-5 p-1.5 border-r border-slate-700">
                    Terlaksananya koordinasi dengan Pengurus KD/KMP dan/atau Kepala Desa
                  </div>
                  <div className="col-span-3 p-1.5 border-r border-slate-700 flex items-center justify-center">
                    {renderCheckCell(sdm.koordinasiPengurusKades.status === 'ada')}
                  </div>
                  <div className="col-span-3 p-1.5 text-[10px] space-y-0.5">
                    <div>Mekanisme koordinasi : {sdm.koordinasiPengurusKades.mekanismeKoordinasi || '...'}</div>
                    <div>Tanggal pelaksanaan koordinasi : {sdm.koordinasiPengurusKades.tanggalKoordinasi || '...'}</div>
                  </div>
                </div>

                {/* SDM Item 4 */}
                <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                  <div className="col-span-1 p-1.5 text-center border-r border-slate-700">4</div>
                  <div className="col-span-5 p-1.5 border-r border-slate-700">
                    Manajer telah menerima pembekalan dan transfer knowledge kepada Pengurus Koperasi Pasca 2 Tahun
                  </div>
                  <div className="col-span-3 p-1.5 border-r border-slate-700 flex items-center justify-center">
                    {renderCheckCell(sdm.pembekalanManajer.status === 'ada')}
                  </div>
                  <div className="col-span-3 p-1.5 text-[10px]">
                    <div>
                      Tanggal pelaksanaan pembekalan Manajer KD/KMP :{' '}
                      {sdm.pembekalanManajer.tanggalPembekalan || '...'}
                    </div>
                    {sdm.pembekalanManajer.keterangan && <div className="text-slate-500">{sdm.pembekalanManajer.keterangan}</div>}
                  </div>
                </div>

                {/* Subheader: Kelengkapan Sistem */}
                <div className="bg-slate-100 px-3 py-1 font-bold text-[11px] text-slate-900 border-b border-slate-700 border-t border-slate-700">
                  Kelengkapan Sistem
                </div>

                {/* Sistem Items 1-3 */}
                {[
                  { no: 1, text: 'Sistem pemantauan stock barang', itm: sis.sistemStokBarang },
                  { no: 2, text: 'Sistem pemesanan produk', itm: sis.sistemPemesananProduk },
                  { no: 3, text: 'Sistem absensi pegawai', itm: sis.sistemAbsensiPegawai }
                ].map(({ no, text, itm }) => (
                  <div key={no} className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700">{no}</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700">{text}</div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 flex items-center justify-center">
                      {renderCheckCell(itm.status === 'ada')}
                    </div>
                    <div className="col-span-3 p-1.5 text-slate-700 text-[10px]">{itm.keterangan || '-'}</div>
                  </div>
                ))}
              </div>

              <div className="text-right text-[10px] text-slate-400 italic">
                - Halaman 1 dari 2 -
              </div>
            </div>

            {/* === PAGE BREAK FOR PRINT === */}
            <div className="pt-8 border-t-2 border-dashed border-slate-300 print:break-before-page">
              {/* PAGE 2: Kelengkapan Produk & Peninjauan Transaksi */}
              <div className="space-y-4">
                <div className="border border-slate-700">
                  <div className="bg-teal-700 text-white font-bold px-3 py-1.5 text-xs">
                    A. Peninjauan Gudang dan Gerai (Lanjutan)
                  </div>
                  <div className="grid grid-cols-12 bg-slate-200 border-b border-slate-700 font-bold text-[11px] text-slate-900">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700">No</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700">Indikator</div>
                    <div className="col-span-3 p-1.5 text-center border-r border-slate-700">Checklist</div>
                    <div className="col-span-3 p-1.5">Keterangan</div>
                  </div>

                  <div className="bg-slate-100 px-3 py-1 font-bold text-[11px] text-slate-900 border-b border-slate-700">
                    Kelengkapan Produk
                  </div>

                  {/* Produk Subsidi */}
                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px] bg-slate-50">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">1</div>
                    <div className="col-span-11 p-1.5 font-bold text-slate-900">
                      Ketersediaan Produksi Subsidi
                    </div>
                  </div>

                  {/* LPG 3kg */}
                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1 text-center border-r border-slate-700" />
                    <div className="col-span-5 p-1 pl-4 border-r border-slate-700 font-medium">-LPG 3 kg</div>
                    <div className="col-span-3 p-1 border-r border-slate-700 flex items-center justify-center">
                      {renderCheckCell(p.lpg3kg.status === 'ada')}
                    </div>
                    <div className="col-span-3 p-1 text-[10px] space-y-0.5">
                      <div>Jumlah yang sudah diterima : {p.lpg3kg.jumlahDiterima || '...'}</div>
                      <div>Jumlah stok : {p.lpg3kg.jumlahStok || '...'}</div>
                      <div>Periode Pengiriman : {p.lpg3kg.periodePengiriman || '...'}</div>
                    </div>
                  </div>

                  {/* Pupuk Bersubsidi */}
                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1 text-center border-r border-slate-700" />
                    <div className="col-span-5 p-1 pl-4 border-r border-slate-700 font-medium">-Pupuk Bersubsidi</div>
                    <div className="col-span-3 p-1 border-r border-slate-700 flex items-center justify-center">
                      {renderCheckCell(p.pupukBersubsidi.status === 'ada')}
                    </div>
                    <div className="col-span-3 p-1 text-[10px] space-y-0.5">
                      <div>Jumlah yang sudah diterima : {p.pupukBersubsidi.jumlahDiterima || '...'}</div>
                      <div>Jumlah stok : {p.pupukBersubsidi.jumlahStok || '...'}</div>
                      <div>Periode Pengiriman : {p.pupukBersubsidi.periodePengiriman || '...'}</div>
                    </div>
                  </div>

                  {/* Beras SPHP */}
                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1 text-center border-r border-slate-700" />
                    <div className="col-span-5 p-1 pl-4 border-r border-slate-700 font-medium">-Beras SPHP</div>
                    <div className="col-span-3 p-1 border-r border-slate-700 flex items-center justify-center">
                      {renderCheckCell(p.berasSPHP.status === 'ada')}
                    </div>
                    <div className="col-span-3 p-1 text-[10px] space-y-0.5">
                      <div>Jumlah yang sudah diterima : {p.berasSPHP.jumlahDiterima || '...'}</div>
                      <div>Jumlah stok : {p.berasSPHP.jumlahStok || '...'}</div>
                      <div>Periode Pengiriman : {p.berasSPHP.periodePengiriman || '...'}</div>
                    </div>
                  </div>

                  {/* Minyakita */}
                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">2</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700 font-medium">
                      Ketersediaan Produk Minyakita
                    </div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 flex items-center justify-center">
                      {renderCheckCell(p.minyakita.status === 'ada')}
                    </div>
                    <div className="col-span-3 p-1.5 text-[10px] space-y-0.5">
                      <div>Jumlah yang sudah diterima : {p.minyakita.jumlahDiterima || '...'}</div>
                      <div>Jumlah stok : {p.minyakita.jumlahStok || '...'}</div>
                      <div>Periode Pengiriman : {p.minyakita.periodePengiriman || '...'}</div>
                    </div>
                  </div>

                  {/* Produk Non Subsidi */}
                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px] bg-slate-50">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">3</div>
                    <div className="col-span-11 p-1.5 font-bold text-slate-900">
                      Ketersediaan Produk Non Subsidi
                    </div>
                  </div>

                  {/* Gula */}
                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1 text-center border-r border-slate-700" />
                    <div className="col-span-5 p-1 pl-4 border-r border-slate-700 font-medium">Gula</div>
                    <div className="col-span-3 p-1 border-r border-slate-700 flex items-center justify-center">
                      {renderCheckCell(p.gula.status === 'ada')}
                    </div>
                    <div className="col-span-3 p-1 text-[10px] space-y-0.5">
                      <div>Periode Pengiriman : {p.gula.periodePengiriman || '...'}</div>
                      <div>Sumber supply produk : {p.gula.sumberSupply || '...'}</div>
                      <div>
                        Skema kerja sama :{' '}
                        <strong>
                          {p.gula.skemaKerjasama
                            ? p.gula.skemaKerjasama === 'beli_putus'
                              ? 'beli putus'
                              : 'konsinyasi'
                            : 'konsinyasi / beli putus'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Obat-obatan */}
                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1 text-center border-r border-slate-700" />
                    <div className="col-span-5 p-1 pl-4 border-r border-slate-700 font-medium">Obat-obatan</div>
                    <div className="col-span-3 p-1 border-r border-slate-700 flex items-center justify-center">
                      {renderCheckCell(p.obatObatan.status === 'ada')}
                    </div>
                    <div className="col-span-3 p-1 text-[10px] space-y-0.5">
                      <div>Periode Pengiriman : {p.obatObatan.periodePengiriman || '...'}</div>
                      <div>Sumber supply produk : {p.obatObatan.sumberSupply || '...'}</div>
                      <div>
                        Skema kerja sama :{' '}
                        <strong>
                          {p.obatObatan.skemaKerjasama
                            ? p.obatObatan.skemaKerjasama === 'beli_putus'
                              ? 'beli putus'
                              : 'konsinyasi'
                            : 'konsinyasi / beli putus'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B. Peninjauan Transaksi Gerai */}
                <div className="border border-slate-700 mt-4">
                  <div className="bg-teal-700 text-white font-bold px-3 py-1.5 text-xs">
                    B. Peninjauan Transaksi Gerai
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">1</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700 font-medium">Waktu Operasional KD/KMP</div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 text-[10px] font-mono text-slate-800">
                      {tr.waktuOperasional.rangeWaktu || '(range waktu)'}
                    </div>
                    <div className="col-span-3 p-1.5 text-[10px] text-slate-700">
                      {tr.waktuOperasional.keterangan || '(keterangan)'}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">2</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700 font-medium">Nilai transaksi harian</div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 text-[10px] font-mono text-slate-800">
                      {tr.nilaiTransaksiHarian.rangeNilai || '(range nilai)'}
                    </div>
                    <div className="col-span-3 p-1.5 text-[10px] text-slate-700">
                      {tr.nilaiTransaksiHarian.keterangan || '(keterangan)'}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">3</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700 font-medium">Jenis produk yang paling laku terjual</div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 text-[10px] text-slate-800">
                      {tr.produkPalingLaku.rangeJumlah || '(range jumlah)'}
                    </div>
                    <div className="col-span-3 p-1.5 text-[10px] text-slate-700">
                      {tr.produkPalingLaku.keterangan || '(keterangan)'}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">4</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700 font-medium">Jenis produk yang kurang laku terjual</div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 text-[10px] text-slate-800">
                      {tr.produkKurangLaku.namaProduk || '(nama produk)'}
                    </div>
                    <div className="col-span-3 p-1.5 text-[10px] text-slate-700">
                      {tr.produkKurangLaku.keterangan || '(keterangan)'}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">5</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700 font-medium">Mekanisme transaksi (cash/cashless)</div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 text-[10px] font-semibold text-slate-800">
                      {tr.mekanismeTransaksi.pilihan || '(cash/cashless)'}
                    </div>
                    <div className="col-span-3 p-1.5 text-[10px] text-slate-700">
                      {tr.mekanismeTransaksi.keterangan || '(keterangan)'}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-400 text-[11px]">
                    <div className="col-span-1 p-1.5 text-center border-r border-slate-700 font-bold">6</div>
                    <div className="col-span-5 p-1.5 border-r border-slate-700 font-medium">
                      Kendala yang dialami dan bentuk dukungan yang diperlukan dalam operasionalisasi KD/KMP
                    </div>
                    <div className="col-span-3 p-1.5 border-r border-slate-700 text-[10px] text-slate-800">
                      {tr.kendalaDanDukungan.kendalaUtama || '(kendala utama)'}
                    </div>
                    <div className="col-span-3 p-1.5 text-[10px] text-slate-700">
                      {tr.kendalaDanDukungan.keterangan || '(keterangan)'}
                    </div>
                  </div>
                </div>

                {/* Signatures Block */}
                <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-800">
                  <div className="space-y-16">
                    <div>
                      <div>Mengetahui,</div>
                      <div className="font-semibold">Pengurus / Manajer KDKMP</div>
                    </div>
                    <div>
                      <div className="underline font-bold">
                        ( {location.kontakPerson.split('(')[0]?.trim() || '...................................................'} )
                      </div>
                      <div className="text-[10px] text-slate-500">Tanda Tangan & Cap Koperasi</div>
                    </div>
                  </div>

                  <div className="space-y-16">
                    <div>
                      <div>{location.kabupatenKota || 'Wilayah'}, {location.tanggalKunjungan || '....................'}</div>
                      <div className="font-semibold">Petugas Surveyor / Peninjau</div>
                    </div>
                    <div>
                      <div className="underline font-bold">
                        ( {location.namaPetugas || '...................................................'} )
                      </div>
                      <div className="text-[10px] text-slate-500">Tanda Tangan Surveyor Lapangan</div>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 italic pt-6">
                  - Halaman 2 dari 2 - Checklist Kesiapan Operasionalisasi KDKMP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center gap-2 print:hidden">
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
            <span>Tersimpan di cloud: Google Drive / KDKMP</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300"
            >
              Tutup Pratinjau
            </button>
            <button
              onClick={handleInitiateDriveUpload}
              disabled={isUploadingToDrive}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-colors disabled:opacity-60"
            >
              {isUploadingToDrive ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <HardDrive className="w-3.5 h-3.5" />
              )}
              <span>{isUploadingToDrive ? 'Mengunggah...' : 'Simpan ke Drive'}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Berkas PDF
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before mutating Drive with new PDF (Mandatory per workspace-integration) */}
      {showConfirmDriveUpload && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Simpan PDF ke Google Drive?</h4>
                <p className="text-xs text-slate-500">Konfirmasi pengunggahan berkas ke akun Google Drive Anda</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1.5">
              <div>
                <span className="text-slate-400">Unit KDKMP: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {location.namaLokasi} ({location.kodeKDKMP || '-'})
                </span>
              </div>
              <div>
                <span className="text-slate-400">Folder Tujuan: </span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">
                  Google Drive / KDKMP_Dokumen_dan_Cadangan
                </span>
              </div>
              <div>
                <span className="text-slate-400">Format: </span>
                <span>Dokumen PDF Formulir Resmi Standar Kementerian</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowConfirmDriveUpload(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDriveUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-xs"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Ya, Simpan ke Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

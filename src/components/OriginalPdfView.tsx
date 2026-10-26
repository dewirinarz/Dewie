import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Check,
  Building,
  Calendar,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { exportBlankChecklistPdf } from '../utils/exportUtils';
import { downloadOfficialKDKMPExcelTemplate } from '../utils/excelTemplateUtils';
import { PURBAYAN_PARSED_DATA } from '../utils/importParser';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';

interface OriginalPdfViewProps {
  onImportPurbayan?: (location: KDKMPLocation) => void;
  onOpenImportModal?: () => void;
}

export const OriginalPdfView: React.FC<OriginalPdfViewProps> = ({
  onImportPurbayan,
  onOpenImportModal
}) => {
  const [selectedDoc, setSelectedDoc] = useState<'purbayan' | 'blank'>('purbayan');

  const purbayanPdf = '/assets/aistudio/1._Form_KDMP_Purbayan_cf86c777.pdf';
  const blankPdf = '/assets/aistudio/List_Checklist_Operasionalisasi_KDKMP_0cdb3d76.pdf';

  const currentPdfUrl = selectedDoc === 'purbayan' ? purbayanPdf : blankPdf;
  const purbayanScore = calculateReadiness(PURBAYAN_PARSED_DATA.checklist);

  const handleImportThisDocument = () => {
    if (onImportPurbayan) {
      onImportPurbayan(PURBAYAN_PARSED_DATA);
    } else if (onOpenImportModal) {
      onOpenImportModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Document Switcher Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            Dokumen Acuan Resmi & Contoh Isian Lapangan
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {selectedDoc === 'purbayan'
              ? 'Formulir Hasil Kunjungan: KDMP Purbayan (Sukoharjo)'
              : 'Instrumen Baku: List Checklist Kesiapan Operasionalisasi KDKMP'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedDoc === 'purbayan'
              ? 'Dokumen scan fisik terisi lengkap yang dijadikan rujukan fitur import sistem (1._Form_KDMP_Purbayan_cf86c777.pdf)'
              : 'Template standar instrumen evaluasi kesiapan gerai dan gudang KDKMP nasional'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Doc Switcher Buttons */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedDoc('purbayan')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                selectedDoc === 'purbayan'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Form KDMP Purbayan (Terisi)
            </button>
            <button
              onClick={() => setSelectedDoc('blank')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                selectedDoc === 'blank'
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Instrumen Baku (Blanko)
            </button>
          </div>

          <button
            onClick={downloadOfficialKDKMPExcelTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            title="Unduh Template Excel yang dibuat 100% mengikuti acuan formulir PDF ini"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Unduh Template Excel (Acuan PDF)
          </button>

          <a
            href={currentPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Buka PDF di Tab Baru
          </a>
        </div>
      </div>

      {/* Excel Template Feature Highlights Banner */}
      <div className="bg-white rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Template Excel Resmi Sesuai Acuan Dokumen PDF (.xlsx)
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Multi-Sheet & Siap Pakai
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Berkas workbook Excel terintegrasi 4 sheet: <strong>Formulir_Checklist_PDF</strong> (layout persis PDF dengan keterangan 12 sarpras), <strong>Formulir_Blanko_PDF</strong> (blanko siap cetak/tulis), <strong>Data_Import_Batch_Massal</strong> (89 kolom lengkap dengan keterangan 12 sarana & prasarana), dan <strong>Panduan_Kamus_Data</strong> (petunjuk format tanggal YYYY-MM-DD).
              </p>
            </div>
          </div>
          <button
            onClick={downloadOfficialKDKMPExcelTemplate}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .XLSX
          </button>
        </div>
      </div>

      {/* Purbayan Data Callout Card (When viewing Purbayan) */}
      {selectedDoc === 'purbayan' && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                Skor Kesiapan: {purbayanScore.percentage}% ({purbayanScore.status})
              </span>
              <span className="text-xs text-slate-600 font-medium">
                • 29 dari 31 Indikator Terpenuhi (Ada)
              </span>
            </div>

            <button
              onClick={handleImportThisDocument}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Impor Data Formulir Purbayan ke Sistem
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px]">Identitas Unit</span>
              <span className="font-bold text-slate-900">KDMP Purbayan</span>
              <div className="text-[11px] text-slate-500 mt-0.5">Kab. Sukoharjo, Jawa Tengah</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px]">SDM & Karyawan</span>
              <span className="font-bold text-slate-900">7 Karyawan (100%)</span>
              <div className="text-[11px] text-slate-500 mt-0.5">1 Manajer, 2 Asmen, 2 Kasir, 2 Pramuniaga</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px]">Sistem Digital</span>
              <span className="font-bold text-slate-900">Excel + Agri Connect</span>
              <div className="text-[11px] text-slate-500 mt-0.5">Pengiriman data rekap AGRINAS</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px]">Komoditas Masuk</span>
              <span className="font-bold text-slate-900">LPG, Pupuk, Beras, Minyak</span>
              <div className="text-[11px] text-slate-500 mt-0.5">Beras SPHP 500kg & Minyakita 888L</div>
            </div>
          </div>
        </div>
      )}

      {/* Structural Mapping Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <span className="w-5 h-5 rounded bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
              A
            </span>
            Halaman 1: Peninjauan Gudang dan Gerai
          </div>
          <ul className="space-y-1.5 text-slate-600 pl-2">
            <li className="flex items-start gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Kelengkapan Fisik & Sarpras:</strong> 6 item bangunan & utilitas + 12 item sarana prasarana
                (Gudang, Gerai, Listrik, Air, Klinik, Rak Obat, Rak display, Kasir POS, Truk 6 ban, Pickup 4x4, Motor roda 3, AC, APAR, CCTV, Kipas, Keranjang, Seragam, Papan Nama).
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Kelengkapan SDM:</strong> Manajer KD/KMP (tgl onboarding), Rekrutmen APN (warga sekitar ya/tidak), Koordinasi Pengurus/Kades (mekanisme & tgl), Pembekalan Manajer 2 tahun.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Kelengkapan Sistem:</strong> Sistem stok barang, Sistem pemesanan produk, Sistem absensi pegawai.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <span className="w-5 h-5 rounded bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
              B
            </span>
            Halaman 2: Produk & Peninjauan Transaksi Gerai
          </div>
          <ul className="space-y-1.5 text-slate-600 pl-2">
            <li className="flex items-start gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Kelengkapan Produk Subsidi:</strong> LPG 3 kg, Pupuk Bersubsidi, Beras SPHP, Minyakita (Jumlah diterima, Stok, Periode Pengiriman).
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Kelengkapan Produk Non-Subsidi:</strong> Gula & Obat-obatan (Periode, Sumber Supply, Skema konsinyasi/beli putus).
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>B. Peninjauan Transaksi Gerai:</strong> Waktu operasional, Nilai transaksi harian, Produk paling laku, Produk kurang laku, Mekanisme transaksi (cash/cashless), Kendala & bentuk dukungan.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Embedded PDF iframe */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700">
            Tampilan Dokumen: {selectedDoc === 'purbayan' ? '1._Form_KDMP_Purbayan_cf86c777.pdf' : 'List_Checklist_Operasionalisasi_KDKMP_0cdb3d76.pdf'}
          </span>
          <span className="text-[11px] text-slate-400">Ukuran file: 2 Halaman (A4 Portrait)</span>
        </div>
        <div className="w-full h-[680px] bg-slate-100">
          <iframe
            key={currentPdfUrl}
            src={currentPdfUrl}
            title="Dokumen Acuan List Checklist Kesiapan Operasionalisasi KDKMP"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

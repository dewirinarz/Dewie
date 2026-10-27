import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building,
  Check,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  Layers,
  FileCheck2,
  CheckSquare,
  Square,
  Files,
  Download,
  Filter,
  Search,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';
import {
  parseMultipleKDKMPFiles,
  FileImportResult,
  PURBAYAN_PARSED_DATA,
  SAMPLE_BATCH_PRESETS,
  SAMPLE_BULK_25_LOCATIONS,
  downloadKDKMPExcelTemplate,
  downloadKDKMPCsvTemplate
} from '../utils/importParser';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLocations: (
    locations: KDKMPLocation[],
    conflictMode: 'overwrite' | 'append' | 'skip' | boolean
  ) => void;
  existingLocations: KDKMPLocation[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportLocations,
  existingLocations
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressInfo, setProgressInfo] = useState<{ current: number; total: number; currentFileName?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batch Results State
  const [fileResults, setFileResults] = useState<FileImportResult[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string>>(new Set());
  const [conflictMode, setConflictMode] = useState<'overwrite' | 'append' | 'skip'>('append');

  // Search & Filter in Preview
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Sangat Siap' | 'Siap Bersyarat' | 'Belum Siap'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Flatten all extracted locations from successful files
  const allExtractedLocations = useMemo(() => {
    const list: (KDKMPLocation & { sourceFile: string; fileId: string })[] = [];
    fileResults.forEach(res => {
      res.locations.forEach(loc => {
        list.push({ ...loc, sourceFile: res.fileName, fileId: res.fileId });
      });
    });
    return list;
  }, [fileResults]);

  // Filtered locations based on search and status filter
  const filteredLocations = useMemo(() => {
    return allExtractedLocations.filter(loc => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        loc.namaLokasi.toLowerCase().includes(q) ||
        loc.kodeKDKMP.toLowerCase().includes(q) ||
        loc.provinsi.toLowerCase().includes(q) ||
        loc.kabupatenKota.toLowerCase().includes(q) ||
        loc.kecamatan.toLowerCase().includes(q) ||
        loc.desaKelurahan.toLowerCase().includes(q) ||
        (loc.namaPetugas && loc.namaPetugas.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter !== 'all') {
        const score = calculateReadiness(loc.checklist);
        if (score.status !== statusFilter) return false;
      }

      return true;
    });
  }, [allExtractedLocations, searchQuery, statusFilter]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setProgressInfo({ current: 0, total: files.length, currentFileName: files[0].name });

    try {
      const results = await parseMultipleKDKMPFiles(files, (completed, total) => {
        const currentFile = files[completed - 1] ? files[completed - 1].name : '';
        setProgressInfo({ current: completed, total, currentFileName: currentFile });
      });

      setFileResults(prev => [...prev, ...results]);

      // Automatically select all newly extracted locations
      const newSelected = new Set(selectedLocationIds);
      results.forEach(res => {
        res.locations.forEach(loc => newSelected.add(loc.id));
      });
      setSelectedLocationIds(newSelected);
    } catch (err: any) {
      setErrorMessage(`Terjadi kesalahan saat memproses berkas massal: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      setIsProcessing(false);
      setProgressInfo(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      processFiles(filesArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processFiles(filesArray);
      e.target.value = ''; // Reset input so same files can be re-selected if needed
    }
  };

  // Preset 1: Single file reference from user prompt (1._Form_KDMP_Purbayan_cf86c777.pdf)
  const handleLoadPurbayanSingle = () => {
    const loc = JSON.parse(JSON.stringify(PURBAYAN_PARSED_DATA)) as KDKMPLocation;
    loc.id = `kdkmp-purbayan-${Date.now()}`;

    const singleResult: FileImportResult = {
      fileId: `file-purbayan-${Date.now()}`,
      fileName: '1._Form_KDMP_Purbayan_cf86c777.pdf',
      fileSize: 421000,
      status: 'success',
      detectedType: 'purbayan_pdf',
      message: 'Berhasil mengekstrak formulir fisik KDMP Purbayan, Kab. Sukoharjo (Kesiapan 94%).',
      locations: [loc]
    };

    setFileResults([singleResult]);
    setSelectedLocationIds(new Set([loc.id]));
    setErrorMessage(null);
  };

  // Preset 2: 25 Diverse Locations across Indonesia (Demonstrating mass import)
  const handleLoadBulk25Locations = () => {
    const timestamp = Date.now();
    const clonedLocations: KDKMPLocation[] = SAMPLE_BULK_25_LOCATIONS.map((loc, idx) => {
      const cloned = JSON.parse(JSON.stringify(loc)) as KDKMPLocation;
      cloned.id = `bulk-25-${timestamp}-${idx}`;
      return cloned;
    });

    const bulkResult: FileImportResult = {
      fileId: `file-bulk-25-${timestamp}`,
      fileName: 'Rekapitulasi_Nasional_25_Titik_KDKMP.xlsx',
      fileSize: 128500,
      status: 'success',
      detectedType: 'excel',
      message: 'Berhasil mengekstrak 25 titik unit KDKMP lintas 15 provinsi dari spreadsheet master nasional.',
      locations: clonedLocations
    };

    setFileResults(prev => [...prev, bulkResult]);
    const ids = new Set(selectedLocationIds);
    clonedLocations.forEach(l => ids.add(l.id));
    setSelectedLocationIds(ids);
    setErrorMessage(null);
  };

  // Preset 3: 4 Field Inspection Files Batch
  const handleLoadSampleBatch = () => {
    const timestamp = Date.now();
    const batchResults: FileImportResult[] = SAMPLE_BATCH_PRESETS.map((preset, idx) => {
      const loc = JSON.parse(JSON.stringify(preset.location)) as KDKMPLocation;
      loc.id = `kdkmp-batch-${timestamp}-${idx}`;

      return {
        fileId: `file-batch-${timestamp}-${idx}`,
        fileName: preset.fileName,
        fileSize: preset.fileSize,
        status: 'success',
        detectedType: idx === 0 ? 'purbayan_pdf' : 'generic_pdf',
        message: `Berhasil mengekstrak lembar evaluasi: ${loc.namaLokasi} (${loc.kodeKDKMP})`,
        locations: [loc]
      };
    });

    setFileResults(prev => [...prev, ...batchResults]);
    const ids = new Set(selectedLocationIds);
    batchResults.forEach(r => r.locations.forEach(l => ids.add(l.id)));
    setSelectedLocationIds(ids);
    setErrorMessage(null);
  };

  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = fileResults.find(f => f.fileId === fileId);
    if (!fileToRemove) return;

    // Remove location IDs associated with this file
    const idsToRemove = new Set(fileToRemove.locations.map(l => l.id));
    setSelectedLocationIds(prev => {
      const next = new Set(prev);
      idsToRemove.forEach(id => next.delete(id));
      return next;
    });

    setFileResults(prev => prev.filter(f => f.fileId !== fileId));
  };

  const toggleSelectLocation = (id: string) => {
    setSelectedLocationIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLocationIds.size === allExtractedLocations.length) {
      setSelectedLocationIds(new Set());
    } else {
      setSelectedLocationIds(new Set(allExtractedLocations.map(l => l.id)));
    }
  };

  const selectOnlyReady = () => {
    const readyIds = new Set<string>();
    allExtractedLocations.forEach(loc => {
      const score = calculateReadiness(loc.checklist);
      if (score.status === 'Sangat Siap') {
        readyIds.add(loc.id);
      }
    });
    setSelectedLocationIds(readyIds);
  };

  const handleConfirmImport = () => {
    const locationsToImport = allExtractedLocations.filter(loc => selectedLocationIds.has(loc.id));
    if (locationsToImport.length === 0) return;

    onImportLocations(locationsToImport, conflictMode);
    onClose();
  };

  // Summary counts for extracted locations
  const readyCount = allExtractedLocations.filter(
    l => calculateReadiness(l.checklist).status === 'Sangat Siap'
  ).length;
  const conditionalCount = allExtractedLocations.filter(
    l => calculateReadiness(l.checklist).status === 'Siap Bersyarat'
  ).length;
  const notReadyCount = allExtractedLocations.filter(
    l => calculateReadiness(l.checklist).status === 'Belum Siap'
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-xs">
              <Files className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Import File Dalam Jumlah Banyak (Batch Ingestion)</h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Multi-File & Bulk Excel
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dapat mengunggah puluhan hingga ratusan berkas sekaligus (.xlsx, .csv, .pdf, .json, serta scan foto formulir)
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm bg-slate-50/50">
          {/* Quick Actions & Templates Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  Alat Impor Cepat & Template Data Massal:
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Pilih aksi instan atau siapkan berkas spreadsheet Anda
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={handleLoadBulk25Locations}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
                title="Muat 25 titik lokasi KDKMP nyata lintas provinsi Indonesia"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Simulasi 25 Titik (Massal)</span>
              </button>

              <button
                onClick={handleLoadPurbayanSingle}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs shadow-xs transition-colors"
                title="Impor formulir acuan KDMP Purbayan 94%"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Form Purbayan (Acuan)</span>
              </button>

              <button
                onClick={downloadKDKMPExcelTemplate}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs transition-colors"
                title="Unduh berkas Excel resmi 4 sheet mengikuti formulir acuan PDF: Formulir PDF, Blanko, Tabel 98 Kolom (lengkap dengan Keterangan 12 Sarpras & Keterangan Masing-Masing Peninjauan Transaksi) & Panduan Kamus Data"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Template Excel (Acuan PDF)</span>
              </button>

              <button
                onClick={downloadKDKMPCsvTemplate}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs transition-colors"
                title="Unduh file format CSV tabel rekap"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Unduh Template CSV</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Multi-File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 sm:p-9 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 shadow-xs'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.json,.pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
              Tarik & Letakkan Banyak Berkas ke Sini (Multi-File Dropzone)
            </h4>
            <p className="text-xs text-slate-500 max-w-xl mx-auto mb-4 leading-relaxed">
              Pilih sekaligus 10, 20, atau 50+ berkas formulir PDF, spreadsheet Excel (<kbd className="px-1 py-0.5 bg-slate-100 border rounded text-[10px] font-mono">.xlsx/.xls</kbd>), file CSV (<kbd className="px-1 py-0.5 bg-slate-100 border rounded text-[10px] font-mono">.csv</kbd>), data JSON, atau foto instrumen lapangan.
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 shadow-sm"
            >
              <Files className="w-4 h-4 text-emerald-400" />
              Pilih Banyak Berkas Dari Komputer
            </button>
          </div>

          {/* Processing Progress Bar */}
          {isProcessing && progressInfo && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>
                    Sedang Memproses Berkas Massal ({progressInfo.current} dari {progressInfo.total})...
                  </span>
                </div>
                <span>
                  {Math.round((progressInfo.current / progressInfo.total) * 100)}%
                </span>
              </div>
              {progressInfo.currentFileName && (
                <div className="text-[11px] text-emerald-700 truncate">
                  Memproses: <span className="font-mono">{progressInfo.currentFileName}</span>
                </div>
              )}
              <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${(progressInfo.current / progressInfo.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Kendala:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Active Queue & Data Preview */}
          {fileResults.length > 0 && (
            <div className="space-y-5">
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] font-semibold">Total Berkas & Titik</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-black text-slate-900 text-lg sm:text-xl">
                      {allExtractedLocations.length}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      lokasi ({fileResults.length} berkas)
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                    {selectedLocationIds.size} unit ditandai impor
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-emerald-700 block text-[10px] font-bold uppercase tracking-wider">
                    Sangat Siap (&ge;85%)
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-black text-emerald-700 text-lg sm:text-xl">{readyCount}</span>
                    <span className="text-[11px] text-emerald-600">titik unit</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Siap operasional langsung</div>
                </div>

                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-amber-700 block text-[10px] font-bold uppercase tracking-wider">
                    Siap Bersyarat (60–84%)
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-black text-amber-700 text-lg sm:text-xl">{conditionalCount}</span>
                    <span className="text-[11px] text-amber-600">titik unit</span>
                  </div>
                  <div className="text-[10px] text-amber-600 mt-0.5">Memerlukan pemenuhan</div>
                </div>

                <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-rose-700 block text-[10px] font-bold uppercase tracking-wider">
                    Belum Siap (&lt;60%)
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-black text-rose-700 text-lg sm:text-xl">{notReadyCount}</span>
                    <span className="text-[11px] text-rose-600">titik unit</span>
                  </div>
                  <div className="text-[10px] text-rose-600 mt-0.5">Tahap inventarisasi awal</div>
                </div>
              </div>

              {/* Uploaded File Queue Strip */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Files className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Daftar Berkas Terunggah ({fileResults.length} Berkas)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={additionalFileInputRef}
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.csv,.json,.pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => additionalFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Berkas Lagi
                    </button>

                    <button
                      onClick={() => {
                        setFileResults([]);
                        setSelectedLocationIds(new Set());
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 font-medium text-xs border border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Bersihkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-44 overflow-y-auto pr-1">
                  {fileResults.map(res => (
                    <div
                      key={res.fileId}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {res.detectedType === 'excel' ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : res.detectedType === 'csv' ? (
                          <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : res.detectedType === 'image_ocr' ? (
                          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 truncate" title={res.fileName}>
                            {res.fileName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {res.locations.length} titik lokasi • {(res.fileSize / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {res.status === 'success' ? 'Sukses' : 'Peringatan'}
                        </span>
                        <button
                          onClick={() => handleRemoveFile(res.fileId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus berkas ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview Table & Controls */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Search & Selection Toolbar */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs"
                    >
                      {selectedLocationIds.size === allExtractedLocations.length ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>
                        {selectedLocationIds.size === allExtractedLocations.length
                          ? 'Batal Semua'
                          : 'Pilih Semua'}
                      </span>
                    </button>

                    <button
                      onClick={selectOnlyReady}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Pilih Hanya Sangat Siap ({readyCount})
                    </button>

                    <span className="text-xs text-slate-500 font-medium">
                      ({selectedLocationIds.size} dari {allExtractedLocations.length} terpilih)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as any)}
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">Semua Status Kesiapan</option>
                      <option value="Sangat Siap">Sangat Siap (≥85%)</option>
                      <option value="Siap Bersyarat">Siap Bersyarat (60–84%)</option>
                      <option value="Belum Siap">Belum Siap (&lt;60%)</option>
                    </select>

                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama, kode, wilayah..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                  {filteredLocations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Tidak ada titik lokasi yang sesuai dengan kata kunci pencarian atau filter.
                    </div>
                  ) : (
                    filteredLocations.map(loc => {
                      const isSelected = selectedLocationIds.has(loc.id);
                      const score = calculateReadiness(loc.checklist);
                      const cl = loc.checklist;

                      return (
                        <div
                          key={loc.id}
                          onClick={() => toggleSelectLocation(loc.id)}
                          className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'bg-white hover:bg-slate-50 opacity-60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div
                            className="w-4 h-4 text-emerald-600 rounded mt-1 shrink-0 cursor-pointer"
                          />

                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300">
                                  {loc.kodeKDKMP}
                                </span>
                                <h5 className="font-bold text-sm text-slate-900">{loc.namaLokasi}</h5>
                                {existingLocations.some(
                                  e => (e.namaLokasi || '').trim().toLowerCase() === (loc.namaLokasi || '').trim().toLowerCase()
                                ) && (
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full"
                                    title="Nama lokasi ini sama dengan data yang sudah ada di sistem"
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                    Nama Sama / Sudah Ada
                                  </span>
                                )}
                                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                  {loc.sourceFile}
                                </span>
                              </div>

                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                  score.status === 'Sangat Siap'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : score.status === 'Siap Bersyarat'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border-rose-300'
                                }`}
                              >
                                {score.percentage}% ({score.status})
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {loc.desaKelurahan ? `${loc.desaKelurahan}, ` : ''}
                                {loc.kecamatan ? `Kec. ${loc.kecamatan}, ` : ''}
                                {loc.kabupatenKota}, {loc.provinsi}
                              </span>
                              {loc.tanggalKunjungan && (
                                <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {loc.tanggalKunjungan}
                                </span>
                              )}
                              {loc.namaPetugas && (
                                <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                                  <UserCheck className="w-3 h-3 text-slate-400" />
                                  {loc.namaPetugas}
                                </span>
                              )}
                            </div>

                            {/* Mini indicators */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-1">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                Fisik: {score.fisikScore.ada}/18
                              </span>
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                SDM: {score.sdmScore.ada}/4
                              </span>
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                Sistem: {score.sistemScore.ada}/3
                              </span>
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                Produk: {score.produkScore.ada}/6
                              </span>
                              {cl.transaksi.nilaiTransaksiHarian.rangeNilai && (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                                  Omzet: {cl.transaksi.nilaiTransaksiHarian.rangeNilai}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Conflict Resolution Mode */}
              <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800">Kebijakan Impor ke Daftar Lokasi:</span>
                  <p className="text-slate-500 text-[11px]">
                    Memastikan seluruh {selectedLocationIds.size} data terpilih masuk ke daftar lokasi
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    <input
                      type="radio"
                      name="conflictMode"
                      checked={conflictMode === 'append'}
                      onChange={() => setConflictMode('append')}
                    />
                    <span className={conflictMode === 'append' ? 'font-bold text-emerald-800' : 'text-slate-600'}>
                      (Rekomendasi) Masukkan Seluruh Data Terpilih ke Daftar Lokasi
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    <input
                      type="radio"
                      name="conflictMode"
                      checked={conflictMode === 'overwrite'}
                      onChange={() => setConflictMode('overwrite')}
                    />
                    <span className={conflictMode === 'overwrite' ? 'font-bold text-slate-900' : 'text-slate-600'}>
                      Perbarui Data Sama (Upsert)
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    <input
                      type="radio"
                      name="conflictMode"
                      checked={conflictMode === 'skip'}
                      onChange={() => setConflictMode('skip')}
                    />
                    <span className={conflictMode === 'skip' ? 'font-bold text-slate-900' : 'text-slate-600'}>
                      Lewati Duplikat
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {allExtractedLocations.length > 0 && (
            <button
              onClick={handleConfirmImport}
              disabled={selectedLocationIds.size === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all cursor-pointer ${
                selectedLocationIds.size > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Masukkan Seluruh Data Terpilih ke Daftar Lokasi ({selectedLocationIds.size} Titik)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

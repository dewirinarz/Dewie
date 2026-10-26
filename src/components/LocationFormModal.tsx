import React, { useState, useEffect, useMemo } from 'react';
import { X, Building, MapPin, User, Calendar, Phone, Save, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';
import { KDKMPLocation, createEmptyChecklist } from '../types/kdkmp';
import { INDONESIA_PROVINCES } from '../data/defaultData';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: Partial<KDKMPLocation>) => void;
  initialData?: KDKMPLocation | null;
  existingLocations?: KDKMPLocation[];
}

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingLocations = []
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    kodeKDKMP: '',
    namaLokasi: '',
    provinsi: 'Jawa Barat',
    kabupatenKota: '',
    kecamatan: '',
    desaKelurahan: '',
    alamatLengkap: '',
    latitude: '',
    longitude: '',
    namaPetugas: '',
    kontakPerson: '',
    tanggalKunjungan: new Date().toISOString().slice(0, 10),
    catatanTambahan: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        kodeKDKMP: initialData.kodeKDKMP || '',
        namaLokasi: initialData.namaLokasi || '',
        provinsi: initialData.provinsi || 'Jawa Barat',
        kabupatenKota: initialData.kabupatenKota || '',
        kecamatan: initialData.kecamatan || '',
        desaKelurahan: initialData.desaKelurahan || '',
        alamatLengkap: initialData.alamatLengkap || '',
        latitude: initialData.latitude !== undefined ? String(initialData.latitude) : '',
        longitude: initialData.longitude !== undefined ? String(initialData.longitude) : '',
        namaPetugas: initialData.namaPetugas || '',
        kontakPerson: initialData.kontakPerson || '',
        tanggalKunjungan: initialData.tanggalKunjungan || new Date().toISOString().slice(0, 10),
        catatanTambahan: initialData.catatanTambahan || ''
      });
    } else {
      setFormData({
        kodeKDKMP: `KDKMP-${Math.floor(100 + Math.random() * 900)}`,
        namaLokasi: '',
        provinsi: 'Jawa Barat',
        kabupatenKota: '',
        kecamatan: '',
        desaKelurahan: '',
        alamatLengkap: '',
        latitude: '',
        longitude: '',
        namaPetugas: '',
        kontakPerson: '',
        tanggalKunjungan: new Date().toISOString().slice(0, 10),
        catatanTambahan: ''
      });
    }
  }, [initialData, isOpen]);

  // Real-time check for duplicate location names (case-insensitive & trimmed)
  const duplicateMatches = useMemo(() => {
    const trimmed = formData.namaLokasi.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) return [];
    return existingLocations.filter(loc => {
      // Exclude self if editing
      if (initialData && loc.id === initialData.id) return false;
      return (loc.namaLokasi || '').trim().toLowerCase() === trimmed;
    });
  }, [formData.namaLokasi, existingLocations, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = formData.latitude.trim() !== '' ? parseFloat(formData.latitude) : undefined;
    const parsedLng = formData.longitude.trim() !== '' ? parseFloat(formData.longitude) : undefined;

    // Fallback if empty so data can ALWAYS be saved even if incomplete
    const fallbackCode = formData.kodeKDKMP.trim() || `KDKMP-${Math.floor(100 + Math.random() * 900)}`;
    const fallbackName = formData.namaLokasi.trim() || (formData.kodeKDKMP.trim() ? `Unit ${formData.kodeKDKMP.trim()}` : 'Unit KDKMP Baru (Draf)');

    onSave({
      ...formData,
      kodeKDKMP: fallbackCode,
      namaLokasi: fallbackName,
      latitude: !isNaN(parsedLat as number) ? parsedLat : undefined,
      longitude: !isNaN(parsedLng as number) ? parsedLng : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Ubah Data: ${initialData?.namaLokasi || 'Lokasi KDKMP'}` : 'Tambah Unit Lokasi KDKMP Baru'}
              </h3>
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-0.5">
                <span>Lengkapi identitas unit koperasi dan wilayah administratif</span>
                {isEditing && initialData?.updatedAt && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    Sebelumnya Diupdate: {new Date(initialData.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          {/* Incomplete Data Allowed Reassurance Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Penyimpanan Fleksibel:</strong> Data tetap dapat disimpan kapan saja walaupun belum lengkap (sebagai draf). Anda dapat melengkapinya kembali nanti.
            </span>
          </div>

          {/* Row 1: Kode & Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Unit KDKMP
              </label>
              <input
                type="text"
                placeholder="Contoh: KDKMP-JB-045"
                value={formData.kodeKDKMP}
                onChange={e => setFormData({ ...formData, kodeKDKMP: e.target.value })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lokasi / Unit KDKMP <span className="text-slate-400 font-normal">(Bisa dilengkapi nanti)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: KDKMP Desa Sukaresmi"
                value={formData.namaLokasi}
                onChange={e => setFormData({ ...formData, namaLokasi: e.target.value })}
                className={`w-full py-2 px-3 bg-slate-50 border rounded-lg focus:bg-white focus:ring-2 focus:outline-none ${
                  duplicateMatches.length > 0
                    ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/30'
                    : 'border-slate-300 focus:ring-red-500'
                }`}
              />
            </div>
          </div>

          {/* DUPLICATE NAME WARNING BANNER */}
          {duplicateMatches.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-950 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-amber-900">
                      Peringatan: Ada Nama Lokasi yang Sama ({duplicateMatches.length} Unit Ditemukan)
                    </p>
                    <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      Duplikat Terdeteksi
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Nama <strong>"{formData.namaLokasi.trim()}"</strong> sama persis dengan unit yang sudah terdaftar di sistem:
                  </p>
                </div>
              </div>

              {/* List of duplicate locations */}
              <div className="space-y-1.5 pl-6 max-h-32 overflow-y-auto pr-1">
                {duplicateMatches.map(match => {
                  const regionText = [match.desaKelurahan, match.kecamatan, match.kabupatenKota, match.provinsi]
                    .filter(Boolean)
                    .join(', ') || 'Wilayah belum diisi';
                  return (
                    <div
                      key={match.id}
                      className="p-2 bg-white/90 rounded-lg border border-amber-200 text-[11px] flex flex-wrap items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {match.kodeKDKMP}
                        </span>
                        <span className="text-slate-700">
                          {regionText}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Kunjungan: {match.tanggalKunjungan || 'Belum diatur'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions and advice */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/80 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-800 font-medium">Tindakan Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const suffix = formData.desaKelurahan.trim()
                        ? ` (Desa ${formData.desaKelurahan.trim()})`
                        : formData.kabupatenKota.trim()
                        ? ` (${formData.kabupatenKota.trim()})`
                        : ` (Unit ${duplicateMatches.length + 1})`;
                      setFormData(prev => ({
                        ...prev,
                        namaLokasi: `${prev.namaLokasi.trim()}${suffix}`
                      }));
                    }}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-md shadow-2xs transition-colors inline-flex items-center gap-1"
                  >
                    + Tambahkan Pembeda Wilayah
                  </button>
                </div>
                <span className="text-[10px] text-amber-800 italic">
                  *Data tetap dapat disimpan jika nama memang sengaja sama.
                </span>
              </div>
            </div>
          )}

          {/* Row 2: Wilayah Administratif */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              Wilayah Administratif
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provinsi
                </label>
                <select
                  value={formData.provinsi}
                  onChange={e => setFormData({ ...formData, provinsi: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-800"
                >
                  {INDONESIA_PROVINCES.map(prov => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kabupaten Cianjur"
                  value={formData.kabupatenKota}
                  onChange={e => setFormData({ ...formData, kabupatenKota: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kecamatan Sukaresmi"
                  value={formData.kecamatan}
                  onChange={e => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Desa Sukamaju"
                  value={formData.desaKelurahan}
                  onChange={e => setFormData({ ...formData, desaKelurahan: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Latitude GPS (Opsional Peta)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: -6.7265"
                  value={formData.latitude}
                  onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Longitude GPS (Opsional Peta)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 107.0392"
                  value={formData.longitude}
                  onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Alamat Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Titik Gerai / Gudang
            </label>
            <textarea
              rows={2}
              placeholder="Jl. Raya Cipanas No. 45, RT 02 RW 03 (depan balai desa)..."
              value={formData.alamatLengkap}
              onChange={e => setFormData({ ...formData, alamatLengkap: e.target.value })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Row 4: Petugas, Kontak, & Tanggal */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Petugas Peninjau & Pengurus
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Petugas Surveyor
                </label>
                <input
                  type="text"
                  placeholder="Nama petugas..."
                  value={formData.namaPetugas}
                  onChange={e => setFormData({ ...formData, namaPetugas: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kontak Pengurus / Manajer
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad (0812-xxx)"
                  value={formData.kontakPerson}
                  onChange={e => setFormData({ ...formData, kontakPerson: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Kunjungan Peninjauan
                </label>
                <input
                  type="date"
                  value={formData.tanggalKunjungan}
                  onChange={e => setFormData({ ...formData, tanggalKunjungan: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Tambahan Lokasi
            </label>
            <input
              type="text"
              placeholder="Catatan akses jalan, kondisi geografis, dsb..."
              value={formData.catatanTambahan}
              onChange={e => setFormData({ ...formData, catatanTambahan: e.target.value })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Simpan Perubahan' : 'Tambah Lokasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

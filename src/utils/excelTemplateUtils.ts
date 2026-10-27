import * as XLSX from 'xlsx';
import { KDKMPLocation, calculateReadiness, createEmptyChecklist } from '../types/kdkmp';
import { PURBAYAN_PARSED_DATA } from './importParser';

/**
 * Builds the vertical "Formulir_Checklist_PDF" worksheet matching the exact structure
 * of the official KDKMP evaluation sheet (PDF reference).
 */
function buildVerticalFormSheet(location: KDKMPLocation, isBlank: boolean = false): XLSX.WorkSheet {
  const cl = location.checklist;
  const f = cl.fisikSarpras;
  const s = f.saranaPrasarana;
  const sdm = cl.sdm;
  const sis = cl.sistem;
  const p = cl.produk;
  const tr = cl.transaksi;

  const score = isBlank
    ? { percentage: 0, status: 'Belum Terisi' }
    : calculateReadiness(cl);

  const valStatus = (st: string) => {
    if (isBlank) return '[  ] Ada   [  ] Tidak Ada';
    return st === 'ada' ? 'Ada' : 'Tidak Ada';
  };

  const rows: (string | number)[][] = [
    // Header
    ['LIST CHECKLIST KESIAPAN OPERASIONALISASI KDKMP', '', '', '', ''],
    ['Koperasi Desa / Kelurahan Merah Putih (Acuan Resmi Formulir PDF Lapangan)', '', '', '', ''],
    ['Dokumen Acuan: 1._Form_KDMP_Purbayan & Formulir_Kosong_Checklist_Kesiapan_KDKMP', '', '', '', ''],
    ['', '', '', '', ''],

    // Identitas
    ['IDENTITAS UNIT KDKMP DAN PELAKSANAAN EVALUASI', '', '', '', ''],
    [
      'Nama Unit KDKMP',
      isBlank ? '' : location.namaLokasi || '',
      '',
      'Tanggal Kunjungan (YYYY-MM-DD)',
      isBlank ? '' : location.tanggalKunjungan || ''
    ],
    [
      'Kode KDKMP',
      isBlank ? '' : location.kodeKDKMP || '',
      '',
      'Petugas Peninjau / Surveyor',
      isBlank ? '' : location.namaPetugas || ''
    ],
    [
      'Provinsi',
      isBlank ? '' : location.provinsi || '',
      '',
      'Kontak Person / Pengurus',
      isBlank ? '' : location.kontakPerson || ''
    ],
    [
      'Kabupaten / Kota',
      isBlank ? '' : location.kabupatenKota || '',
      '',
      'Status Kesiapan Operasional',
      isBlank ? '-' : `${score.status} (${score.percentage}%)`
    ],
    [
      'Kecamatan',
      isBlank ? '' : location.kecamatan || '',
      '',
      'Desa / Kelurahan',
      isBlank ? '' : location.desaKelurahan || ''
    ],
    [
      'Alamat Lengkap',
      isBlank ? '' : location.alamatLengkap || '',
      '',
      'Catatan Khusus Lapangan',
      isBlank ? '' : location.catatanTambahan || ''
    ],
    ['', '', '', '', ''],

    // Section A
    ['A. PENINJAUAN GUDANG DAN GERAI', '', '', '', ''],
    ['No', 'Indikator Evaluasi', 'Status Checklist', 'Keterangan / Parameter Operasional', 'Catatan Lapangan'],

    // Fisik
    ['', 'Kelengkapan Fisik serta Sarana dan Prasarana', '', '', ''],
    [
      1,
      'Ketersediaan Bangunan Gudang (termasuk tempat penyimpanan LPG 3 Kg dan Pupuk Bersubsidi)',
      valStatus(f.bangunanGudang.status),
      isBlank ? '' : f.bangunanGudang.keterangan || 'Tersedia gudang aman untuk penyimpanan LPG 3 Kg dan Pupuk',
      isBlank ? '' : 'Kondisi baik & berlantai semen'
    ],
    [
      2,
      'Ketersediaan Bangunan Gerai',
      valStatus(f.bangunanGerai.status),
      isBlank ? '' : f.bangunanGerai.keterangan || 'Gerai siap melayani operasional penjualan',
      isBlank ? '' : 'Area pelayanan bersih & terang'
    ],
    [
      3,
      'Ketersediaan Instalasi Listrik',
      valStatus(f.instalasiListrik.status),
      isBlank ? '' : f.instalasiListrik.keterangan || 'Instalasi listrik terpasang dan berfungsi',
      isBlank ? '' : 'Daya 2.200 VA stabil'
    ],
    [
      4,
      'Ketersediaan Instalasi Air Bersih',
      valStatus(f.instalasiAirBersih.status),
      isBlank ? '' : f.instalasiAirBersih.keterangan || 'Instalasi air bersih tersedia lancar',
      isBlank ? '' : 'Kran dan saluran higienis'
    ],
    [
      5,
      'Ketersediaan Fasilitas Klinik',
      valStatus(f.fasilitasKlinik.status),
      isBlank ? '' : f.fasilitasKlinik.keterangan || 'Tersedia fasilitas klinik kesehatan masyarakat',
      isBlank ? '' : 'Ruang konsultasi siap'
    ],
    [
      6,
      'Ketersediaan Rak Obat-obatan / Apotek',
      valStatus(f.rakObatApotek.status),
      isBlank ? '' : f.rakObatApotek.keterangan || 'Tersedia rak penyimpanan obat-obatan desa',
      isBlank ? '' : 'Tertutup & aman dari sinar langsung'
    ],
    ['7', 'Ketersediaan Sarana dan Prasarana :', '', '', ''],
    [
      '',
      '  - Rak display',
      valStatus(s.rakDisplay.status),
      isBlank ? '(keterangan spesifikasi / jumlah unit rak)' : s.rakDisplay.keterangan || 'Tersedia dan tertata di area gerai',
      isBlank ? '' : 'Kondisi baik & rapi'
    ],
    [
      '',
      '  - Perangkat Kasir (termasuk software)',
      valStatus(s.perangkatKasir.status),
      isBlank ? '(keterangan perangkat POS & software kasir)' : s.perangkatKasir.keterangan || 'Tersedia termasuk software POS',
      isBlank ? '' : 'Sistem kasir online siap'
    ],
    [
      '',
      '  - Truk 6 Ban',
      valStatus(s.truk6Ban.status),
      isBlank ? '(keterangan unit / armada logistik truk 6 ban)' : s.truk6Ban.keterangan || '1 unit armada logistik',
      isBlank ? '' : 'Kondisi prima siap operasional'
    ],
    [
      '',
      '  - Pickup 4x4',
      valStatus(s.pickup4x4.status),
      isBlank ? '(keterangan unit / kendaraan pickup 4x4)' : s.pickup4x4.keterangan || '1 unit kendaraan pick-up',
      isBlank ? '' : 'Kondisi baik siap distribusi'
    ],
    [
      '',
      '  - Motor bak roda 3',
      valStatus(s.motorBakRoda3.status),
      isBlank ? '(keterangan unit / motor bak roda 3)' : s.motorBakRoda3.keterangan || '2 unit operasional kirim lokal',
      isBlank ? '' : 'Pengiriman warga & gang desa'
    ],
    [
      '',
      '  - Air Conditioner (AC)',
      valStatus(s.ac.status),
      isBlank ? '(keterangan unit / kapasitas pendingin AC)' : s.ac.keterangan || '4 unit pendingin ruangan',
      isBlank ? '' : 'Suhu gerai sejuk & nyaman'
    ],
    [
      '',
      '  - Alat Pemadam Api Ringan (APAR)',
      valStatus(s.apar.status),
      isBlank ? '(keterangan tabung / jenis APAR)' : s.apar.keterangan || '4 tabung APAR serbuk',
      isBlank ? '' : 'Terpasang di titik strategis'
    ],
    [
      '',
      '  - CCTV',
      valStatus(s.cctv.status),
      isBlank ? '(keterangan titik kamera / DVR CCTV)' : s.cctv.keterangan || '8 titik kamera pemantau',
      isBlank ? '' : 'Perekaman 24 jam berfungsi'
    ],
    [
      '',
      '  - Kipas Ceiling',
      valStatus(s.kipasCeiling.status),
      isBlank ? '(keterangan unit / kondisi kipas langit-langit)' : s.kipasCeiling.keterangan || 'Kipas angin langit-langit',
      isBlank ? '' : 'Sirkulasi udara gerai lancar'
    ],
    [
      '',
      '  - Keranjang Belanja',
      valStatus(s.keranjangBelanja.status),
      isBlank ? '(keterangan jumlah unit keranjang belanja)' : s.keranjangBelanja.keterangan || '10 unit keranjang belanja pengunjung',
      isBlank ? '' : 'Bersih dan tertata rapi'
    ],
    [
      '',
      '  - Seragam KD/KMP',
      valStatus(s.seragamKD.status),
      isBlank ? '(keterangan seragam dinas pengurus/karyawan)' : s.seragamKD.keterangan || 'Seragam dinas resmi pengurus & karyawan',
      isBlank ? '' : 'Lengkap seragam & ID card'
    ],
    [
      '',
      '  - Papan Nama KD/KMP',
      valStatus(s.papanNamaKD.status),
      isBlank ? '(keterangan plang papan nama identitas gerai)' : s.papanNamaKD.keterangan || 'Papan nama plang identitas terpasang jelas',
      isBlank ? '' : 'Terlihat jelas dari jalan utama'
    ],

    // SDM
    ['', 'Kelengkapan SDM', '', '', ''],
    [
      1,
      'Ketersediaan Manajer KD/KMP',
      valStatus(sdm.manajerKD.status),
      isBlank ? 'Tanggal on boarding Manajer KD/KMP : ' : `Tanggal on boarding Manajer KD/KMP : ${sdm.manajerKD.tanggalOnBoarding || '-'}`,
      isBlank ? '' : sdm.manajerKD.keterangan || 'Telah bertugas di lokasi'
    ],
    [
      2,
      'Ketersediaan SDM rekrutmen APN',
      valStatus(sdm.sdmRekrutmenAPN.status),
      isBlank ? 'SDM merupakan masyarakat sekitar KD/KMP : ya / tidak' : `SDM merupakan masyarakat sekitar KD/KMP : ${sdm.sdmRekrutmenAPN.masyarakatSekitar || 'ya'}`,
      isBlank ? '' : sdm.sdmRekrutmenAPN.keterangan || 'Merekrut warga lokal sekitar unit'
    ],
    [
      3,
      'Terlaksananya koordinasi dengan Pengurus KD/KMP dan/atau Kepala Desa',
      valStatus(sdm.koordinasiPengurusKades.status),
      isBlank
        ? 'Mekanisme koordinasi : \nTanggal pelaksanaan koordinasi : '
        : `Mekanisme: ${sdm.koordinasiPengurusKades.mekanismeKoordinasi || 'Rapat Koordinasi Perizinan'} | Tanggal: ${sdm.koordinasiPengurusKades.tanggalKoordinasi || '-'}`,
      isBlank ? '' : sdm.koordinasiPengurusKades.keterangan || 'Dukungan penuh Pemdes'
    ],
    [
      4,
      'Manajer telah menerima pembekalan dan transfer knowledge kepada Pengurus Koperasi Pasca 2 Tahun',
      valStatus(sdm.pembekalanManajer.status),
      isBlank
        ? 'Tanggal pelaksanaan pembekalan Manajer KD/KMP : '
        : `Tanggal pelaksanaan pembekalan Manajer KD/KMP : ${sdm.pembekalanManajer.tanggalPembekalan || '-'}`,
      isBlank ? '' : sdm.pembekalanManajer.keterangan || 'Sertifikat pembekalan terverifikasi'
    ],

    // Sistem
    ['', 'Kelengkapan Sistem', '', '', ''],
    [
      1,
      'Sistem pemantauan stock barang',
      valStatus(sis.sistemStokBarang.status),
      isBlank ? '' : sis.sistemStokBarang.keterangan || 'Menggunakan excel / software inventori',
      isBlank ? '' : 'Update berkala harian'
    ],
    [
      2,
      'Sistem pemesanan produk',
      valStatus(sis.sistemPemesananProduk.status),
      isBlank ? '' : sis.sistemPemesananProduk.keterangan || 'Melalui rekapitulasi data excel dikirim AGRINAS',
      isBlank ? '' : 'Rantai pasok terpusat'
    ],
    [
      3,
      'Sistem absensi pegawai',
      valStatus(sis.sistemAbsensiPegawai.status),
      isBlank ? '' : sis.sistemAbsensiPegawai.keterangan || 'Menggunakan aplikasi Agri Connect / absensi digital',
      isBlank ? '' : 'Absensi online berbasis GPS'
    ],

    // Produk
    ['', 'Kelengkapan Produk', '', '', ''],
    ['1', 'Ketersediaan Produk Subsidi :', '', '', ''],
    [
      '',
      '  - LPG 3 kg',
      valStatus(p.lpg3kg.status),
      isBlank
        ? 'Jumlah yang sudah diterima : \nJumlah stok : \nPeriode Pengiriman : '
        : `Jumlah diterima: ${p.lpg3kg.jumlahDiterima || '-'} | Stok: ${p.lpg3kg.jumlahStok || '-'} | Periode Pengiriman: ${p.lpg3kg.periodePengiriman || '-'}`,
      isBlank ? '' : p.lpg3kg.keterangan || 'Alokasi Pertamina'
    ],
    [
      '',
      '  - Pupuk Bersubsidi',
      valStatus(p.pupukBersubsidi.status),
      isBlank
        ? 'Jumlah yang sudah diterima : \nJumlah stok : \nPeriode Pengiriman : '
        : `Jumlah diterima: ${p.pupukBersubsidi.jumlahDiterima || '-'} | Stok: ${p.pupukBersubsidi.jumlahStok || '-'} | Periode Pengiriman: ${p.pupukBersubsidi.periodePengiriman || '-'}`,
      isBlank ? '' : p.pupukBersubsidi.keterangan || 'Urea & NPK'
    ],
    [
      '',
      '  - Beras SPHP',
      valStatus(p.berasSPHP.status),
      isBlank
        ? 'Jumlah yang sudah diterima : \nJumlah stok : \nPeriode Pengiriman : '
        : `Jumlah diterima: ${p.berasSPHP.jumlahDiterima || '-'} | Stok: ${p.berasSPHP.jumlahStok || '-'} | Periode Pengiriman: ${p.berasSPHP.periodePengiriman || '-'}`,
      isBlank ? '' : p.berasSPHP.keterangan || 'Bulog 5 kg'
    ],
    [
      2,
      'Ketersediaan Produk Minyakita',
      valStatus(p.minyakita.status),
      isBlank
        ? 'Jumlah yang sudah diterima : \nJumlah stok : \nPeriode Pengiriman : '
        : `Jumlah diterima: ${p.minyakita.jumlahDiterima || '-'} | Stok: ${p.minyakita.jumlahStok || '-'} | Periode Pengiriman: ${p.minyakita.periodePengiriman || '-'}`,
      isBlank ? '' : p.minyakita.keterangan || 'Kemasan 1 liter resmi'
    ],
    ['3', 'Ketersediaan Produk Non Subsidi :', '', '', ''],
    [
      '',
      '  - Gula',
      valStatus(p.gula.status),
      isBlank
        ? 'Periode Pengiriman : \nSumber supply produk : \nSkema kerja sama : beli_putus / konsinyasi'
        : `Periode: ${p.gula.periodePengiriman || '-'} | Supply: ${p.gula.sumberSupply || '-'} | Skema: ${p.gula.skemaKerjasama || 'beli_putus'}`,
      isBlank ? '' : p.gula.keterangan || 'Gula kristal putih'
    ],
    [
      '',
      '  - Obat-obatan',
      valStatus(p.obatObatan.status),
      isBlank
        ? 'Periode Pengiriman : \nSumber supply produk : \nSkema kerja sama : beli_putus / konsinyasi'
        : `Periode: ${p.obatObatan.periodePengiriman || '-'} | Supply: ${p.obatObatan.sumberSupply || '-'} | Skema: ${p.obatObatan.skemaKerjasama || 'konsinyasi'}`,
      isBlank ? '' : p.obatObatan.keterangan || 'Obat bebas / P3K'
    ],
    ['', '', '', '', ''],

    // Section B
    ['B. PENINJAUAN TRANSAKSI GERAI', '', '', '', ''],
    ['No', 'Indikator Transaksi Gerai', 'Parameter / Nilai Realisasi', 'Keterangan Detail Lapangan', 'Catatan Tambahan'],
    [
      1,
      'Waktu Operasional KD/KMP',
      isBlank ? '(range waktu, misal 08.00 - 17.00 WIB)' : tr.waktuOperasional.rangeWaktu || '08.00 - 17.00 WIB',
      isBlank ? '(keterangan jadwal buka, jam operasional, shift kerja, operasional hari libur)' : tr.waktuOperasional.keterangan || 'Buka setiap hari jam kerja operasional (08.00 - 17.00 WIB)',
      isBlank ? '' : 'Buka tepat waktu & shift teratur'
    ],
    [
      2,
      'Nilai transaksi harian',
      isBlank ? '(range nilai, misal Rp 200.000 - Rp 300.000 / hari atau < Rp 1.000.000 / hari)' : tr.nilaiTransaksiHarian.rangeNilai || 'Rp 200.000 - Rp 300.000 / hari',
      isBlank ? '(keterangan omzet harian rata-rata, tren transaksi, waktu ramai / sepi)' : tr.nilaiTransaksiHarian.keterangan || 'Omzet harian masa awal pembukaan gerai',
      isBlank ? '' : 'Pembukuan transaksi kasir tercatat rapi'
    ],
    [
      3,
      'Jenis produk yang paling laku terjual',
      isBlank ? '(komoditas pangan / sembako paling dicari warga)' : tr.produkPalingLaku.rangeJumlah || 'Beras, gula, minyak goreng',
      isBlank ? '(keterangan komoditas terlaris, perputaran stok, frekuensi pembelian)' : tr.produkPalingLaku.keterangan || 'Komoditas sembako kebutuhan harian warga cepat habis',
      isBlank ? '' : 'Permintaan warga konsisten tinggi'
    ],
    [
      4,
      'Jenis produk yang kurang laku terjual',
      isBlank ? '(nama produk barang dagangan yang perputarannya lambat)' : tr.produkKurangLaku.namaProduk || 'Kecap, sabun cuci piring, deterjen',
      isBlank ? '(keterangan faktor penyebab perputaran lambat, evaluasi pasar desa, rencana promo)' : tr.produkKurangLaku.keterangan || 'Barang non-sembako perputaran lebih lambat',
      isBlank ? '' : 'Evaluasi berkala varian produk gerai'
    ],
    [
      5,
      'Mekanisme transaksi (cash/cashless)',
      isBlank ? 'cash / cashless / keduanya' : tr.mekanismeTransaksi.pilihan || 'cash',
      isBlank ? '(keterangan kesiapan QRIS/EDC, jaringan internet kasir, kebiasaan transaksi tunai)' : tr.mekanismeTransaksi.keterangan || 'Pembayaran tunai aktif & persiapan aktivasi QRIS',
      isBlank ? '' : 'Infrastruktur kasir & koneksi pembayaran siap'
    ],
    [
      6,
      'Kendala yang dialami dan bentuk dukungan yang diperlukan dalam operasionalisasi KD/KMP',
      isBlank ? '(kendala utama operasional gerai)' : tr.kendalaDanDukungan.kendalaUtama || 'Belum ada lemari pendingin, variasi produk masih terbatas',
      isBlank ? '(keterangan bentuk dukungan: chiller/freezer, permodalan, pelatihan kasir, pasokan sembako)' : tr.kendalaDanDukungan.keterangan || 'Dibutuhkan fasilitas lemari pendingin (chiller/freezer) dan penambahan ragam sembako',
      isBlank ? '' : 'Prioritas tindak lanjut satgas daerah'
    ],
    ['', '', '', '', ''],

    // Signatures
    ['LEMBAR PENGESAHAN PENINJAUAN EVALUASI LAPANGAN', '', '', '', ''],
    [
      'Mengetahui / Membenarkan:',
      '',
      '',
      isBlank ? 'Tempat & Tanggal: ...........................................' : `${location.kabupatenKota || 'Wilayah'}, ${location.tanggalKunjungan || '13 Oktober 2026'}`,
      ''
    ],
    [
      'Pengurus / Manajer KD/KMP',
      '',
      '',
      'Petugas Surveyor / Peninjau Lapangan',
      ''
    ],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    [
      isBlank ? '( .............................................................. )' : `( ${location.kontakPerson.split('(')[0]?.trim() || 'Pengurus KDMP'} )`,
      '',
      '',
      isBlank ? '( .............................................................. )' : `( ${location.namaPetugas || 'Petugas Surveyor'} )`,
      ''
    ],
    [
      isBlank ? 'Nama Terang: .............................................' : `Nama: ${location.kontakPerson.split('(')[0]?.trim() || 'Pengurus KDMP'}`,
      '',
      '',
      isBlank ? 'Nama Terang: .............................................' : `Nama: ${location.namaPetugas || 'Petugas Surveyor'}`,
      ''
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 6 },  // A: No
    { wch: 48 }, // B: Indikator
    { wch: 22 }, // C: Status Checklist
    { wch: 60 }, // D: Keterangan
    { wch: 32 }  // E: Catatan
  ];

  // Merges for header titles & section separators
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Subtitle
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, // Ref
    { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } }, // Identitas header
    { s: { r: 12, c: 0 }, e: { r: 12, c: 4 } }, // Sec A Header
    { s: { r: 14, c: 1 }, e: { r: 14, c: 4 } }, // Fisik subheader
    { s: { r: 21, c: 1 }, e: { r: 21, c: 4 } }, // Sarpras subheader
    { s: { r: 34, c: 1 }, e: { r: 34, c: 4 } }, // SDM subheader
    { s: { r: 39, c: 1 }, e: { r: 39, c: 4 } }, // Sistem subheader
    { s: { r: 43, c: 1 }, e: { r: 43, c: 4 } }, // Produk subheader
    { s: { r: 44, c: 1 }, e: { r: 44, c: 4 } }, // Produk subsidi
    { s: { r: 49, c: 1 }, e: { r: 49, c: 4 } }, // Produk non subsidi
    { s: { r: 53, c: 0 }, e: { r: 53, c: 4 } }, // Sec B Header
    { s: { r: 61, c: 0 }, e: { r: 61, c: 4 } }, // Signature Title
    { s: { r: 62, c: 0 }, e: { r: 62, c: 2 } }, // Mengetahui
    { s: { r: 62, c: 3 }, e: { r: 62, c: 4 } }, // Date
    { s: { r: 63, c: 0 }, e: { r: 63, c: 2 } }, // Role 1
    { s: { r: 63, c: 3 }, e: { r: 63, c: 4 } }, // Role 2
    { s: { r: 66, c: 0 }, e: { r: 66, c: 2 } }, // Sign 1
    { s: { r: 66, c: 3 }, e: { r: 66, c: 4 } }, // Sign 2
    { s: { r: 67, c: 0 }, e: { r: 67, c: 2 } }, // Name 1
    { s: { r: 67, c: 3 }, e: { r: 67, c: 4 } }  // Name 2
  ];

  return ws;
}

/**
 * Builds the horizontal tabular "Data_Import_Batch_Massal" sheet with 89 columns
 * matching every single field and keterangan in the PDF evaluation checklist.
 */
function buildHorizontalBatchSheet(): XLSX.WorkSheet {
  const headers = [
    // Identitas
    'Kode KDKMP',
    'Nama Lokasi KDKMP',
    'Provinsi',
    'Kabupaten / Kota',
    'Kecamatan',
    'Desa / Kelurahan',
    'Alamat Lengkap',
    'Tanggal Kunjungan (YYYY-MM-DD)',
    'Nama Petugas Surveyor',
    'Kontak Person / Pengurus',
    'Catatan Lapangan',

    // Fisik Sarpras
    'Bangunan Gudang (Ada/Tidak Ada)',
    'Keterangan Gudang',
    'Bangunan Gerai (Ada/Tidak Ada)',
    'Keterangan Gerai',
    'Instalasi Listrik (Ada/Tidak Ada)',
    'Keterangan Listrik',
    'Instalasi Air Bersih (Ada/Tidak Ada)',
    'Keterangan Air',
    'Fasilitas Klinik (Ada/Tidak Ada)',
    'Keterangan Klinik',
    'Rak Obat Apotek (Ada/Tidak Ada)',
    'Keterangan Rak Obat',

    // Sarpras Detail (12 Sub-Indikator: Status & Keterangan)
    'Rak Display (Ada/Tidak Ada)',
    'Keterangan Rak Display',
    'Perangkat Kasir POS (Ada/Tidak Ada)',
    'Keterangan Perangkat Kasir',
    'Truk 6 Ban (Ada/Tidak Ada)',
    'Keterangan Truk 6 Ban',
    'Pickup 4x4 (Ada/Tidak Ada)',
    'Keterangan Pickup 4x4',
    'Motor Bak Roda 3 (Ada/Tidak Ada)',
    'Keterangan Motor Bak Roda 3',
    'Air Conditioner AC (Ada/Tidak Ada)',
    'Keterangan AC',
    'APAR (Ada/Tidak Ada)',
    'Keterangan APAR',
    'CCTV (Ada/Tidak Ada)',
    'Keterangan CCTV',
    'Kipas Ceiling (Ada/Tidak Ada)',
    'Keterangan Kipas Ceiling',
    'Keranjang Belanja (Ada/Tidak Ada)',
    'Keterangan Keranjang Belanja',
    'Seragam KD (Ada/Tidak Ada)',
    'Keterangan Seragam KD',
    'Papan Nama KD (Ada/Tidak Ada)',
    'Keterangan Papan Nama KD',

    // SDM
    'Manajer KD (Ada/Tidak Ada)',
    'Tanggal Onboarding Manajer (YYYY-MM-DD)',
    'SDM Rekrutmen APN (Ada/Tidak Ada)',
    'Masyarakat Sekitar (ya/tidak)',
    'Koordinasi Pengurus Kades (Ada/Tidak Ada)',
    'Mekanisme Koordinasi',
    'Tanggal Koordinasi (YYYY-MM-DD)',
    'Pembekalan Manajer 2 Thn (Ada/Tidak Ada)',
    'Tanggal Pembekalan (YYYY-MM-DD)',

    // Sistem
    'Sistem Stok Barang (Ada/Tidak Ada)',
    'Keterangan Sistem Stok',
    'Sistem Pemesanan Produk (Ada/Tidak Ada)',
    'Keterangan Pemesanan',
    'Sistem Absensi Pegawai (Ada/Tidak Ada)',
    'Keterangan Absensi',

    // Produk Subsidi
    'LPG 3kg (Ada/Tidak Ada)',
    'LPG Diterima',
    'LPG Stok',
    'LPG Periode Pengiriman (YYYY-MM-DD)',
    'Pupuk Bersubsidi (Ada/Tidak Ada)',
    'Pupuk Diterima',
    'Pupuk Stok',
    'Pupuk Periode Pengiriman (YYYY-MM-DD)',
    'Beras SPHP (Ada/Tidak Ada)',
    'Beras Diterima',
    'Beras Stok',
    'Beras Periode Pengiriman (YYYY-MM-DD)',
    'Minyakita (Ada/Tidak Ada)',
    'Minyakita Diterima',
    'Minyakita Stok',
    'Minyakita Periode Pengiriman (YYYY-MM-DD)',

    // Produk Non-Subsidi
    'Gula (Ada/Tidak Ada)',
    'Gula Periode Pengiriman (YYYY-MM-DD)',
    'Gula Sumber Supply',
    'Gula Skema (beli_putus/konsinyasi)',
    'Obat-obatan (Ada/Tidak Ada)',
    'Obat Periode Pengiriman (YYYY-MM-DD)',
    'Obat Sumber Supply',
    'Obat Skema (beli_putus/konsinyasi)',

    // Transaksi (Indikator & Keterangan untuk Masing-Masing Peninjauan Transaksi)
    'Waktu Operasional Gerai',
    'Keterangan Waktu Operasional',
    'Nilai Transaksi Harian',
    'Keterangan Nilai Transaksi Harian',
    'Produk Paling Laku Terjual',
    'Keterangan Produk Paling Laku',
    'Produk Kurang Laku Terjual',
    'Keterangan Produk Kurang Laku',
    'Mekanisme Transaksi (cash/cashless)',
    'Keterangan Mekanisme Transaksi',
    'Kendala Utama Operasional',
    'Bentuk Dukungan Diperlukan (Keterangan Dukungan)'
  ];

  const sampleRows = [
    // Row 1: KDMP Purbayan (From PDF)
    [
      'KDMP-JT-034',
      'KDMP Purbayan',
      'Jawa Tengah',
      'Kabupaten Sukoharjo',
      'Kecamatan Baki',
      'Kelurahan Purbayan',
      'Purbayan, Kec. Baki, Kabupaten Sukoharjo, Jawa Tengah (Kode Pos 57556)',
      '2026-10-13',
      'Verifikator Satgas Sukoharjo',
      'Pengurus KDMP Purbayan',
      '7 karyawan (1 Manajer, 2 Asmen, 2 Kasir, 2 Pramuniaga). Verifikasi lapangan selesai.',
      // Fisik
      'Ada', 'Tersedia gudang aman untuk penyimpanan LPG 3 Kg dan Pupuk Bersubsidi',
      'Ada', 'Gerai siap melayani operasional penjualan',
      'Ada', 'Instalasi listrik terpasang dan berfungsi',
      'Ada', 'Instalasi air bersih tersedia lancar',
      'Ada', 'Tersedia fasilitas klinik kesehatan',
      'Ada', 'Tersedia rak obat-obatan / apotek desa',
      // Sarpras (Status + Keterangan 12 Sub-Indikator)
      'Ada', 'Tersedia dan tertata rapi di area gerai',
      'Ada', 'Tersedia lengkap dengan software POS kasir',
      'Ada', '1 unit armada logistik operasional',
      'Ada', '1 unit kendaraan pick-up',
      'Ada', '2 unit operasional kirim warga lokal',
      'Ada', '4 unit pendingin ruangan (AC)',
      'Ada', '4 tabung APAR serbuk terpasang',
      'Ada', '8 titik kamera pemantau CCTV',
      'Tidak Ada', 'Belum tersedia kipas ceiling',
      'Ada', '10 unit keranjang belanja pengunjung',
      'Ada', 'Seragam dinas resmi pengurus & karyawan',
      'Ada', 'Papan nama plang identitas terpasang jelas',
      // SDM
      'Ada', '2026-10-01',
      'Ada', 'ya',
      'Ada', 'Mengurus izin NIB', '2026-06-16',
      'Ada', '2026-06-17',
      // Sistem
      'Ada', 'Menggunakan excel',
      'Ada', 'Melalui rekapitulasi data excel dikirim AGRINAS',
      'Ada', 'Menggunakan aplikasi Agri Connect',
      // Produk Subsidi
      'Ada', '25 tabung', '25 tabung', '2026-10-07',
      'Ada', '1 ton (500 kg urea ; 500 kg NPK)', '1 ton', '2026-10-09',
      'Ada', '100 pcs (@ 5 kg)', '100 pcs (500 kg)', '2026-10-10',
      'Ada', '74 karton (@ 12 pcs)', '74 karton = 888 liter', '2026-10-12',
      // Produk Non-Subsidi
      'Ada', '2026-10-12', 'Raja gula (RNI)', 'beli_putus',
      'Tidak Ada', '', '', '',
      // Transaksi (Nilai & Keterangan Masing-Masing Peninjauan Transaksi)
      '08.00 - 17.00 WIB',
      'Buka setiap hari jam kerja operasional (Senin - Minggu)',
      'Rp 200.000 - Rp 300.000 / hari',
      'Omzet harian masa awal pembukaan gerai',
      'Beras, gula',
      'Pangan pokok paling diminati warga desa, perputaran cepat',
      'Kecap, sabun cuci piring, deterjen',
      'Barang kebutuhan sekunder non-sembako perputaran lebih lambat',
      'cash',
      'Pembayaran tunai aktif, QRIS dalam persiapan aktivasi',
      'Belum ada lemari pendingin, kelengkapan produk masih terbatas',
      'Dibutuhkan fasilitas lemari pendingin (chiller/freezer) dan penambahan ragam produk komoditas'
    ],
    // Row 2: KDMP Sukajaya
    [
      'KDMP-JB-101',
      'KDMP Sukajaya',
      'Jawa Barat',
      'Kabupaten Bogor',
      'Kecamatan Cigudeg',
      'Desa Sukajaya',
      'Jl. Raya Cigudeg No. 12',
      '2026-10-20',
      'Budi Prakoso, S.T',
      '0812-3456-7890',
      'Bangunan gerai selesai 100%, siap display produk',
      'Ada', 'Gudang terpisah dengan ventilasi udara baik',
      'Ada', 'Gerai modern berpendingin AC',
      'Ada', 'Daya 3.500 VA',
      'Ada', 'Sumur bor dan tandon 1.000 L',
      'Ada', 'Posyandu integrasi',
      'Ada', 'Rak tertata di bagian depan',
      // Sarpras (Status + Keterangan 12 Sub-Indikator)
      'Ada', 'Rak gondola 6 baris siap pakai',
      'Ada', 'Komputer kasir & barcode scanner siap',
      'Ada', 'Truk Isuzu 6 ban kondisi prima',
      'Ada', 'Toyota Hilux 4x4 operasional',
      'Ada', 'Motor roda 3 Viar box',
      'Ada', '2 unit AC inverter 1.5 PK',
      'Ada', '2 tabung APAR powder 6kg',
      'Ada', '4 channel CCTV online',
      'Ada', '2 unit kipas plafon berputar normal',
      'Ada', '15 unit keranjang plastik merah',
      'Ada', 'Lengkap seragam batik & rompi KDKMP',
      'Ada', 'Plang neon box menyala terang',
      // SDM
      'Ada', '2026-10-05',
      'Ada', 'ya',
      'Ada', 'Pertemuan mingguan kantor desa', '2026-07-01',
      'Ada', '2026-07-02',
      'Ada', 'Excel terpusat',
      'Ada', 'Formulir online Agrinas',
      'Ada', 'Aplikasi absensi mobile',
      // Produk Subsidi
      'Ada', '50 tabung', '50 tabung', '2026-10-15',
      'Ada', '2 ton', '2 ton', '2026-10-16',
      'Ada', '200 pcs (1 ton)', '200 pcs', '2026-10-17',
      'Ada', '100 karton', '100 karton', '2026-10-18',
      // Produk Non-Subsidi
      'Ada', '2026-10-18', 'PT Perkebunan', 'beli_putus',
      'Ada', '2026-10-19', 'Kimia Farma Trading', 'konsinyasi',
      // Transaksi (Nilai & Keterangan Masing-Masing Peninjauan Transaksi)
      '07.30 - 18.00 WIB',
      'Melayani warga dari pagi hari hingga petang',
      '< Rp 1.000.000 / hari',
      'Omzet stabil di kisaran 700 ribu - 950 ribu per hari',
      'Beras SPHP, Minyakita, Telur',
      'Beras SPHP dan Minyakita selalu habis terjual setiap drop pasokan',
      'Makanan beku',
      'Perputaran rendah karena keterbatasan daya simpan pendingin',
      'keduanya',
      'Menerima tunai, QRIS Bank Mandiri/BRI, dan transfer bank',
      'Akses jalan kabupaten perlu perbaikan aspal',
      'Bantuan pengaspalan akses masuk gerai dan genset darurat'
    ],
    // Row 3: Blank template row ready for input
    [
      'KDMP-XX-001',
      'Nama KDMP Baru (Silakan Edit)',
      'Jawa Tengah',
      'Kabupaten Klaten',
      'Kecamatan Trucuk',
      'Desa Wonosari',
      'Alamat lengkap titik lokasi',
      '2026-10-24',
      'Nama Petugas Surveyor',
      'Kontak Pengurus (No HP)',
      'Catatan hasil evaluasi lapangan',
      'Ada', '', 'Ada', '', 'Ada', '', 'Ada', '', 'Ada', '', 'Ada', '',
      // Sarpras (Status + Keterangan 12 Sub-Indikator)
      'Ada', 'Tersedia rak display',
      'Ada', 'Perangkat kasir siap',
      'Ada', 'Armada truk 6 ban tersedia',
      'Ada', 'Kendaraan pickup 4x4 siap',
      'Ada', 'Motor bak roda 3 siap operasional',
      'Ada', 'Unit AC berfungsi sejuk',
      'Ada', 'Tabung APAR terpasang di dinding',
      'Ada', 'Kamera CCTV aktif merekam',
      'Ada', 'Kipas ceiling berfungsi baik',
      'Ada', 'Keranjang belanja tersedia',
      'Ada', 'Seragam dinas telah dibagikan',
      'Ada', 'Papan nama terpasang rapi di depan gerai',
      // SDM
      'Ada', '2026-10-10', 'Ada', 'ya', 'Ada', 'Rapat Desa', '2026-08-01', 'Ada', '2026-08-02',
      'Ada', 'Excel', 'Ada', 'AGRINAS', 'Ada', 'Agri Connect',
      // Produk Subsidi
      'Ada', '30 tabung', '30 tabung', '2026-10-12',
      'Ada', '1.5 ton', '1.5 ton', '2026-10-13',
      'Ada', '150 pcs', '150 pcs', '2026-10-14',
      'Ada', '50 karton', '50 karton', '2026-10-15',
      // Produk Non-Subsidi
      'Ada', '2026-10-15', 'Bulog', 'beli_putus',
      'Ada', '2026-10-16', 'Dinkes', 'konsinyasi',
      // Transaksi (Nilai & Keterangan Masing-Masing Peninjauan Transaksi)
      '08.00 - 17.00 WIB',
      'Buka setiap hari jam kerja operasional',
      'Rp 200.000 - Rp 300.000 / hari',
      'Omzet harian rata-rata gerai',
      'Beras, Minyak',
      'Sembako kebutuhan pokok masyarakat sekitar',
      'Bumbu instan',
      'Produk non-pokok perputaran lambat',
      'cash',
      'Transaksi tunai langsung di kasir',
      'Ruang gerai perlu ventilasi tambahan',
      'Bantuan blower exhaust dan rak etalase pendingin'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 3, 16) }));
  return ws;
}

/**
 * Maps a single KDKMPLocation into an Excel batch row array including
 * status & keterangan for all Sarpras (12 items) and Transaksi (6 items).
 */
export function locationToBatchRow(loc: KDKMPLocation): (string | number)[] {
  const cl = loc.checklist;
  const f = cl.fisikSarpras;
  const s = f.saranaPrasarana;
  const sdm = cl.sdm;
  const sis = cl.sistem;
  const p = cl.produk;
  const tr = cl.transaksi;
  const st = (v: string) => (v === 'ada' ? 'Ada' : 'Tidak Ada');

  return [
    // Identitas (11)
    loc.kodeKDKMP || '',
    loc.namaLokasi || '',
    loc.provinsi || '',
    loc.kabupatenKota || '',
    loc.kecamatan || '',
    loc.desaKelurahan || '',
    loc.alamatLengkap || '',
    loc.tanggalKunjungan || '',
    loc.namaPetugas || '',
    loc.kontakPerson || '',
    loc.catatanTambahan || '',

    // Fisik Sarpras (12)
    st(f.bangunanGudang.status), f.bangunanGudang.keterangan || '',
    st(f.bangunanGerai.status), f.bangunanGerai.keterangan || '',
    st(f.instalasiListrik.status), f.instalasiListrik.keterangan || '',
    st(f.instalasiAirBersih.status), f.instalasiAirBersih.keterangan || '',
    st(f.fasilitasKlinik.status), f.fasilitasKlinik.keterangan || '',
    st(f.rakObatApotek.status), f.rakObatApotek.keterangan || '',

    // Sarpras 12 Sub-Indikator (24: Status & Keterangan)
    st(s.rakDisplay.status), s.rakDisplay.keterangan || '',
    st(s.perangkatKasir.status), s.perangkatKasir.keterangan || '',
    st(s.truk6Ban.status), s.truk6Ban.keterangan || '',
    st(s.pickup4x4.status), s.pickup4x4.keterangan || '',
    st(s.motorBakRoda3.status), s.motorBakRoda3.keterangan || '',
    st(s.ac.status), s.ac.keterangan || '',
    st(s.apar.status), s.apar.keterangan || '',
    st(s.cctv.status), s.cctv.keterangan || '',
    st(s.kipasCeiling.status), s.kipasCeiling.keterangan || '',
    st(s.keranjangBelanja.status), s.keranjangBelanja.keterangan || '',
    st(s.seragamKD.status), s.seragamKD.keterangan || '',
    st(s.papanNamaKD.status), s.papanNamaKD.keterangan || '',

    // SDM (9)
    st(sdm.manajerKD.status), sdm.manajerKD.tanggalOnBoarding || '',
    st(sdm.sdmRekrutmenAPN.status), sdm.sdmRekrutmenAPN.masyarakatSekitar || 'ya',
    st(sdm.koordinasiPengurusKades.status), sdm.koordinasiPengurusKades.mekanismeKoordinasi || '', sdm.koordinasiPengurusKades.tanggalKoordinasi || '',
    st(sdm.pembekalanManajer.status), sdm.pembekalanManajer.tanggalPembekalan || '',

    // Sistem (6)
    st(sis.sistemStokBarang.status), sis.sistemStokBarang.keterangan || '',
    st(sis.sistemPemesananProduk.status), sis.sistemPemesananProduk.keterangan || '',
    st(sis.sistemAbsensiPegawai.status), sis.sistemAbsensiPegawai.keterangan || '',

    // Produk Subsidi (16)
    st(p.lpg3kg.status), p.lpg3kg.jumlahDiterima || '', p.lpg3kg.jumlahStok || '', p.lpg3kg.periodePengiriman || '',
    st(p.pupukBersubsidi.status), p.pupukBersubsidi.jumlahDiterima || '', p.pupukBersubsidi.jumlahStok || '', p.pupukBersubsidi.periodePengiriman || '',
    st(p.berasSPHP.status), p.berasSPHP.jumlahDiterima || '', p.berasSPHP.jumlahStok || '', p.berasSPHP.periodePengiriman || '',
    st(p.minyakita.status), p.minyakita.jumlahDiterima || '', p.minyakita.jumlahStok || '', p.minyakita.periodePengiriman || '',

    // Produk Non-Subsidi (8)
    st(p.gula.status), p.gula.periodePengiriman || '', p.gula.sumberSupply || '', p.gula.skemaKerjasama || 'beli_putus',
    st(p.obatObatan.status), p.obatObatan.periodePengiriman || '', p.obatObatan.sumberSupply || '', p.obatObatan.skemaKerjasama || 'konsinyasi',

    // Transaksi (12: Parameter & Keterangan untuk Masing-Masing Peninjauan Transaksi)
    tr.waktuOperasional.rangeWaktu || '',
    tr.waktuOperasional.keterangan || '',
    tr.nilaiTransaksiHarian.rangeNilai || '',
    tr.nilaiTransaksiHarian.keterangan || '',
    tr.produkPalingLaku.rangeJumlah || '',
    tr.produkPalingLaku.keterangan || '',
    tr.produkKurangLaku.namaProduk || '',
    tr.produkKurangLaku.keterangan || '',
    tr.mekanismeTransaksi.pilihan || '',
    tr.mekanismeTransaksi.keterangan || '',
    tr.kendalaDanDukungan.kendalaUtama || '',
    tr.kendalaDanDukungan.keterangan || ''
  ];
}

/**
 * Builds the "Panduan_Kamus_Data" sheet explaining rules, date format, and values.
 */
function buildGuideSheet(): XLSX.WorkSheet {
  const guideData = [
    ['PANDUAN PENGISIAN TEMPLATE EXCEL KESIAPAN OPERASIONALISASI KDKMP', '', ''],
    ['Mengacu pada Formulir Baku PDF Resmi (1._Form_KDMP_Purbayan & Formulir_Kosong_Checklist_Kesiapan_KDKMP)', '', ''],
    ['', '', ''],
    ['NO', 'ATURAN / KETENTUAN PENGISIAN', 'CONTOH NILAI VALID & PENJELASAN'],
    ['1', 'Struktur Berkas Workbook', 'Berkas ini memiliki 4 sheet utama: 1) Formulir_Checklist_PDF (format lembar resmi), 2) Formulir_Blanko_PDF (siap cetak/tulis), 3) Data_Import_Batch_Massal (input ratusan baris sekaligus), 4) Panduan_Kamus_Data.'],
    ['2', 'Format Tanggal (PENTING)', 'Gunakan format tanggal baku: YYYY-MM-DD (Contoh: 2026-10-13, 2026-10-24). Berlaku untuk Tanggal Kunjungan, Tanggal Onboarding Manajer, Tanggal Koordinasi, Tanggal Pembekalan, dan Periode Pengiriman Produk.'],
    ['3', 'Nilai Checklist / Ketersediaan', 'Tulis "Ada" jika terpenuhi, atau "Tidak Ada" jika belum ada/belum terpenuhi.'],
    ['4', 'Nilai Rekrutmen Warga Sekitar', 'Tulis "ya" atau "tidak" pada kolom "Masyarakat Sekitar".'],
    ['5', 'Skema Kerja Sama Produk Non-Subsidi', 'Pilihan nilai: "beli_putus" atau "konsinyasi" (sesuai formulir PDF).'],
    ['6', 'Mekanisme Transaksi Gerai', 'Pilihan nilai: "cash", "cashless", atau "keduanya".'],
    ['7', 'Periode Pengiriman Produk', 'Wajib menggunakan format tanggal YYYY-MM-DD (misal: 2026-10-07) untuk melacak jadwal distribusi LPG, Pupuk, Beras, dan Minyakita.'],
    ['8', 'Formula Penilaian Kesiapan Sistem', '• Sangat Siap: Total Skor >= 85%\n• Siap Bersyarat: Total Skor 60% s.d. 84%\n• Belum Siap: Total Skor < 60%'],
    ['9', 'Cara Impor ke Aplikasi Web', 'Buka menu "Import File / Massal" di aplikasi -> Tarik/Pilih berkas Excel ini -> Sistem akan mendeteksi seluruh data dan mengimpor otomatis ke peta & tabel!'],
    ['10', 'Keterangan Sarana dan Prasarana (12 Sub-Indikator)', 'Setiap sub-indikator sarana & prasarana (Rak Display, Perangkat Kasir, Truk 6 Ban, Pickup 4x4, Motor Bak Roda 3, AC, APAR, CCTV, Kipas Ceiling, Keranjang Belanja, Seragam KD, Papan Nama KD) memiliki kolom Keterangan untuk mencatat rincian jumlah unit, spesifikasi teknis, merk, atau kondisi operasional di lapangan.'],
    ['11', 'Keterangan Peninjauan Transaksi Gerai (Masing-Masing Indikator)', 'Setiap indikator transaksi memiliki kolom Keterangan terpisah:\n• Waktu Operasional: Keterangan shift kerja, rotasi kasir, jam buka-tutup, dan operasional hari libur.\n• Nilai Transaksi Harian: Keterangan rata-rata omzet harian, waktu ramai (peak hours), dan tren penjualan.\n• Produk Paling Laku: Keterangan komoditas sembako terlaris, perputaran stok, dan frekuensi pembelian warga.\n• Produk Kurang Laku: Keterangan barang non-sembako lambat terjual, evaluasi pasar desa, dan strategi promosi.\n• Mekanisme Transaksi: Keterangan implementasi pembayaran tunai, kesiapan QRIS/EDC, dan koneksi internet kasir.\n• Kendala & Dukungan: Keterangan kendala lapangan gerai serta bentuk fasilitasi (freezer/chiller, permodalan, pelatihan) yang diperlukan.'],
    ['', '', ''],
    ['Keterangan:', 'Template ini dibuat 100% konsisten dengan dokumen acuan PDF KDKMP.', 'Dikeluarkan oleh Satgas Evaluasi Operasional KDKMP Merah Putih']
  ];

  const ws = XLSX.utils.aoa_to_sheet(guideData);
  ws['!cols'] = [{ wch: 6 }, { wch: 42 }, { wch: 80 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }
  ];
  return ws;
}


/**
 * Generates the complete Excel Workbook (.xlsx) strictly following the PDF reference
 */
export function generateOfficialKDKMPExcelWorkbook(sampleLoc?: KDKMPLocation): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Formulir Layout PDF (Filled Sample)
  const locData = sampleLoc || PURBAYAN_PARSED_DATA;
  const wsFormulir = buildVerticalFormSheet(locData, false);
  XLSX.utils.book_append_sheet(wb, wsFormulir, 'Formulir_Checklist_PDF');

  // 2. Sheet 2: Formulir Blanko Kosong (Siap Isi/Cetak)
  const blankLoc = {
    ...PURBAYAN_PARSED_DATA,
    namaLokasi: '',
    kodeKDKMP: '',
    provinsi: '',
    kabupatenKota: '',
    kecamatan: '',
    desaKelurahan: '',
    alamatLengkap: '',
    namaPetugas: '',
    kontakPerson: '',
    tanggalKunjungan: '',
    catatanTambahan: '',
    checklist: createEmptyChecklist()
  };
  const wsBlanko = buildVerticalFormSheet(blankLoc, true);
  XLSX.utils.book_append_sheet(wb, wsBlanko, 'Formulir_Blanko_PDF');

  // 3. Sheet 3: Batch Ingestion Table (Multi-Row / 98 Columns with Sarpras & Transaksi Keterangan)
  const wsBatch = buildHorizontalBatchSheet();
  XLSX.utils.book_append_sheet(wb, wsBatch, 'Data_Import_Batch_Massal');

  // 4. Sheet 4: Data Dictionary & User Guide
  const wsGuide = buildGuideSheet();
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan_Kamus_Data');

  return wb;
}

/**
 * Downloads the master official Excel template (.xlsx) following the PDF reference.
 */
export function downloadOfficialKDKMPExcelTemplate(): void {
  const wb = generateOfficialKDKMPExcelWorkbook();
  XLSX.writeFile(wb, 'Template_Checklist_Kesiapan_KDKMP_Acuan_PDF.xlsx');
}

/**
 * Exports a specific location into an Excel workbook strictly matching the PDF layout.
 */
export function exportLocationToChecklistExcel(location: KDKMPLocation): void {
  const wb = XLSX.utils.book_new();

  // Primary Sheet: The location's specific filled evaluation sheet
  const wsFormulir = buildVerticalFormSheet(location, false);
  XLSX.utils.book_append_sheet(wb, wsFormulir, 'Lembar_Evaluasi_PDF');

  // Secondary Sheet: Tabular Batch Data Format for this specific location
  const batchHeaders = [
    // Identitas
    'Kode KDKMP',
    'Nama Lokasi KDKMP',
    'Provinsi',
    'Kabupaten / Kota',
    'Kecamatan',
    'Desa / Kelurahan',
    'Alamat Lengkap',
    'Tanggal Kunjungan (YYYY-MM-DD)',
    'Nama Petugas Surveyor',
    'Kontak Person / Pengurus',
    'Catatan Lapangan',

    // Fisik Sarpras
    'Bangunan Gudang (Ada/Tidak Ada)',
    'Keterangan Gudang',
    'Bangunan Gerai (Ada/Tidak Ada)',
    'Keterangan Gerai',
    'Instalasi Listrik (Ada/Tidak Ada)',
    'Keterangan Listrik',
    'Instalasi Air Bersih (Ada/Tidak Ada)',
    'Keterangan Air',
    'Fasilitas Klinik (Ada/Tidak Ada)',
    'Keterangan Klinik',
    'Rak Obat Apotek (Ada/Tidak Ada)',
    'Keterangan Rak Obat',

    // Sarpras Detail (12 Sub-Indikator: Status & Keterangan)
    'Rak Display (Ada/Tidak Ada)',
    'Keterangan Rak Display',
    'Perangkat Kasir POS (Ada/Tidak Ada)',
    'Keterangan Perangkat Kasir',
    'Truk 6 Ban (Ada/Tidak Ada)',
    'Keterangan Truk 6 Ban',
    'Pickup 4x4 (Ada/Tidak Ada)',
    'Keterangan Pickup 4x4',
    'Motor Bak Roda 3 (Ada/Tidak Ada)',
    'Keterangan Motor Bak Roda 3',
    'Air Conditioner AC (Ada/Tidak Ada)',
    'Keterangan AC',
    'APAR (Ada/Tidak Ada)',
    'Keterangan APAR',
    'CCTV (Ada/Tidak Ada)',
    'Keterangan CCTV',
    'Kipas Ceiling (Ada/Tidak Ada)',
    'Keterangan Kipas Ceiling',
    'Keranjang Belanja (Ada/Tidak Ada)',
    'Keterangan Keranjang Belanja',
    'Seragam KD (Ada/Tidak Ada)',
    'Keterangan Seragam KD',
    'Papan Nama KD (Ada/Tidak Ada)',
    'Keterangan Papan Nama KD',

    // SDM
    'Manajer KD (Ada/Tidak Ada)',
    'Tanggal Onboarding Manajer (YYYY-MM-DD)',
    'SDM Rekrutmen APN (Ada/Tidak Ada)',
    'Masyarakat Sekitar (ya/tidak)',
    'Koordinasi Pengurus Kades (Ada/Tidak Ada)',
    'Mekanisme Koordinasi',
    'Tanggal Koordinasi (YYYY-MM-DD)',
    'Pembekalan Manajer 2 Thn (Ada/Tidak Ada)',
    'Tanggal Pembekalan (YYYY-MM-DD)',

    // Sistem
    'Sistem Stok Barang (Ada/Tidak Ada)',
    'Keterangan Sistem Stok',
    'Sistem Pemesanan Produk (Ada/Tidak Ada)',
    'Keterangan Pemesanan',
    'Sistem Absensi Pegawai (Ada/Tidak Ada)',
    'Keterangan Absensi',

    // Produk Subsidi
    'LPG 3kg (Ada/Tidak Ada)',
    'LPG Diterima',
    'LPG Stok',
    'LPG Periode Pengiriman (YYYY-MM-DD)',
    'Pupuk Bersubsidi (Ada/Tidak Ada)',
    'Pupuk Diterima',
    'Pupuk Stok',
    'Pupuk Periode Pengiriman (YYYY-MM-DD)',
    'Beras SPHP (Ada/Tidak Ada)',
    'Beras Diterima',
    'Beras Stok',
    'Beras Periode Pengiriman (YYYY-MM-DD)',
    'Minyakita (Ada/Tidak Ada)',
    'Minyakita Diterima',
    'Minyakita Stok',
    'Minyakita Periode Pengiriman (YYYY-MM-DD)',

    // Produk Non-Subsidi
    'Gula (Ada/Tidak Ada)',
    'Gula Periode Pengiriman (YYYY-MM-DD)',
    'Gula Sumber Supply',
    'Gula Skema (beli_putus/konsinyasi)',
    'Obat-obatan (Ada/Tidak Ada)',
    'Obat Periode Pengiriman (YYYY-MM-DD)',
    'Obat Sumber Supply',
    'Obat Skema (beli_putus/konsinyasi)',

    // Transaksi (Indikator & Keterangan untuk Masing-Masing Peninjauan Transaksi)
    'Waktu Operasional Gerai',
    'Keterangan Waktu Operasional',
    'Nilai Transaksi Harian',
    'Keterangan Nilai Transaksi Harian',
    'Produk Paling Laku Terjual',
    'Keterangan Produk Paling Laku',
    'Produk Kurang Laku Terjual',
    'Keterangan Produk Kurang Laku',
    'Mekanisme Transaksi (cash/cashless)',
    'Keterangan Mekanisme Transaksi',
    'Kendala Utama Operasional',
    'Bentuk Dukungan Diperlukan (Keterangan Dukungan)'
  ];
  const row = locationToBatchRow(location);
  const wsBatch = XLSX.utils.aoa_to_sheet([batchHeaders, row]);
  wsBatch['!cols'] = batchHeaders.map(h => ({ wch: Math.max(h.length + 3, 16) }));
  XLSX.utils.book_append_sheet(wb, wsBatch, 'Data_Format_Batch');

  // Tertiary Sheet: Guide & Metadata
  const wsGuide = buildGuideSheet();
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan_Evaluasi');

  const cleanName = (location.namaLokasi || 'KDKMP').replace(/[^a-zA-Z0-9_-]/g, '_');
  const code = (location.kodeKDKMP || 'UNIT').replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Checklist_KDKMP_${code}_${cleanName}.xlsx`);
}

/**
 * Standar Kode Wilayah Kemendagri (Kepmendagri & Permendagri No. 72/2019)
 * untuk Penomoran Kode Unit KDKMP.
 * 
 * Format Kode KDKMP:
 * Diawali 2 digit kode provinsi + titik (.) + 2 digit kode kabupaten/kota
 * Contoh: 33.11.KDKMP.034 (Jawa Tengah - Kab. Sukoharjo, Unit 034)
 */

export interface KemendagriWilayah {
  kodeProvinsi: string;
  namaProvinsi: string;
  kabupatenKota: {
    kode: string; // 2 digit (01-70: Kabupaten, 71-99: Kota)
    nama: string;
    tipe: 'Kabupaten' | 'Kota';
  }[];
}

export const KEMENDAGRI_WILAYAH_LIST: KemendagriWilayah[] = [
  {
    kodeProvinsi: '11',
    namaProvinsi: 'Aceh',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Aceh Selatan', tipe: 'Kabupaten' },
      { kode: '06', nama: 'Kabupaten Aceh Besar', tipe: 'Kabupaten' },
      { kode: '08', nama: 'Kabupaten Aceh Utara', tipe: 'Kabupaten' },
      { kode: '11', nama: 'Kabupaten Bireuen', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Banda Aceh', tipe: 'Kota' },
      { kode: '73', nama: 'Kota Lhokseumawe', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '12',
    namaProvinsi: 'Sumatera Utara',
    kabupatenKota: [
      { kode: '07', nama: 'Kabupaten Deli Serdang', tipe: 'Kabupaten' },
      { kode: '06', nama: 'Kabupaten Karo', tipe: 'Kabupaten' },
      { kode: '08', nama: 'Kabupaten Simalungun', tipe: 'Kabupaten' },
      { kode: '05', nama: 'Kabupaten Langkat', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Medan', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Pematangsiantar', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '13',
    namaProvinsi: 'Sumatera Barat',
    kabupatenKota: [
      { kode: '04', nama: 'Kabupaten Tanah Datar', tipe: 'Kabupaten' },
      { kode: '06', nama: 'Kabupaten Agam', tipe: 'Kabupaten' },
      { kode: '05', nama: 'Kabupaten Padang Pariaman', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Padang', tipe: 'Kota' },
      { kode: '75', nama: 'Kota Bukittinggi', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '14',
    namaProvinsi: 'Riau',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Kampar', tipe: 'Kabupaten' },
      { kode: '08', nama: 'Kabupaten Siak', tipe: 'Kabupaten' },
      { kode: '05', nama: 'Kabupaten Pelalawan', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Pekanbaru', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Dumai', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '15',
    namaProvinsi: 'Jambi',
    kabupatenKota: [
      { kode: '04', nama: 'Kabupaten Batanghari', tipe: 'Kabupaten' },
      { kode: '05', nama: 'Kabupaten Muaro Jambi', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Jambi', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '16',
    namaProvinsi: 'Sumatera Selatan',
    kabupatenKota: [
      { kode: '10', nama: 'Kabupaten Ogan Ilir', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Ogan Komering Ilir', tipe: 'Kabupaten' },
      { kode: '06', nama: 'Kabupaten Musi Banyuasin', tipe: 'Kabupaten' },
      { kode: '08', nama: 'Kabupaten Banyuasin', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Palembang', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '17',
    namaProvinsi: 'Bengkulu',
    kabupatenKota: [
      { kode: '03', nama: 'Kabupaten Bengkulu Utara', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Bengkulu', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '18',
    namaProvinsi: 'Lampung',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Lampung Selatan', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Lampung Tengah', tipe: 'Kabupaten' },
      { kode: '07', nama: 'Kabupaten Pesawaran', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Bandar Lampung', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '19',
    namaProvinsi: 'Kepulauan Bangka Belitung',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Bangka', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Belitung', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Pangkalpinang', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '21',
    namaProvinsi: 'Kepulauan Riau',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Bintan', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Karimun', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Batam', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Tanjungpinang', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '31',
    namaProvinsi: 'DKI Jakarta',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Kepulauan Seribu', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Jakarta Selatan', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Jakarta Timur', tipe: 'Kota' },
      { kode: '73', nama: 'Kota Jakarta Pusat', tipe: 'Kota' },
      { kode: '74', nama: 'Kota Jakarta Barat', tipe: 'Kota' },
      { kode: '75', nama: 'Kota Jakarta Utara', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '32',
    namaProvinsi: 'Jawa Barat',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Bogor', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Sukabumi', tipe: 'Kabupaten' },
      { kode: '03', nama: 'Kabupaten Cianjur', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Bandung', tipe: 'Kabupaten' },
      { kode: '05', nama: 'Kabupaten Garut', tipe: 'Kabupaten' },
      { kode: '06', nama: 'Kabupaten Tasikmalaya', tipe: 'Kabupaten' },
      { kode: '07', nama: 'Kabupaten Ciamis', tipe: 'Kabupaten' },
      { kode: '08', nama: 'Kabupaten Kuningan', tipe: 'Kabupaten' },
      { kode: '09', nama: 'Kabupaten Cirebon', tipe: 'Kabupaten' },
      { kode: '10', nama: 'Kabupaten Majalengka', tipe: 'Kabupaten' },
      { kode: '11', nama: 'Kabupaten Sumedang', tipe: 'Kabupaten' },
      { kode: '12', nama: 'Kabupaten Indramayu', tipe: 'Kabupaten' },
      { kode: '13', nama: 'Kabupaten Subang', tipe: 'Kabupaten' },
      { kode: '14', nama: 'Kabupaten Purwakarta', tipe: 'Kabupaten' },
      { kode: '15', nama: 'Kabupaten Karawang', tipe: 'Kabupaten' },
      { kode: '16', nama: 'Kabupaten Bekasi', tipe: 'Kabupaten' },
      { kode: '17', nama: 'Kabupaten Bandung Barat', tipe: 'Kabupaten' },
      { kode: '18', nama: 'Kabupaten Pangandaran', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Bogor', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Sukabumi', tipe: 'Kota' },
      { kode: '73', nama: 'Kota Bandung', tipe: 'Kota' },
      { kode: '74', nama: 'Kota Cirebon', tipe: 'Kota' },
      { kode: '75', nama: 'Kota Bekasi', tipe: 'Kota' },
      { kode: '76', nama: 'Kota Depok', tipe: 'Kota' },
      { kode: '77', nama: 'Kota Cimahi', tipe: 'Kota' },
      { kode: '78', nama: 'Kota Tasikmalaya', tipe: 'Kota' },
      { kode: '79', nama: 'Kota Banjar', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '33',
    namaProvinsi: 'Jawa Tengah',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Cilacap', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Banyumas', tipe: 'Kabupaten' },
      { kode: '03', nama: 'Kabupaten Purbalingga', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Banjarnegara', tipe: 'Kabupaten' },
      { kode: '05', nama: 'Kabupaten Kebumen', tipe: 'Kabupaten' },
      { kode: '06', nama: 'Kabupaten Purworejo', tipe: 'Kabupaten' },
      { kode: '07', nama: 'Kabupaten Wonosobo', tipe: 'Kabupaten' },
      { kode: '08', nama: 'Kabupaten Magelang', tipe: 'Kabupaten' },
      { kode: '09', nama: 'Kabupaten Boyolali', tipe: 'Kabupaten' },
      { kode: '10', nama: 'Kabupaten Klaten', tipe: 'Kabupaten' },
      { kode: '11', nama: 'Kabupaten Sukoharjo', tipe: 'Kabupaten' },
      { kode: '12', nama: 'Kabupaten Wonogiri', tipe: 'Kabupaten' },
      { kode: '13', nama: 'Kabupaten Karanganyar', tipe: 'Kabupaten' },
      { kode: '14', nama: 'Kabupaten Sragen', tipe: 'Kabupaten' },
      { kode: '15', nama: 'Kabupaten Grobogan', tipe: 'Kabupaten' },
      { kode: '16', nama: 'Kabupaten Blora', tipe: 'Kabupaten' },
      { kode: '17', nama: 'Kabupaten Rembang', tipe: 'Kabupaten' },
      { kode: '18', nama: 'Kabupaten Pati', tipe: 'Kabupaten' },
      { kode: '19', nama: 'Kabupaten Kudus', tipe: 'Kabupaten' },
      { kode: '20', nama: 'Kabupaten Jepara', tipe: 'Kabupaten' },
      { kode: '21', nama: 'Kabupaten Demak', tipe: 'Kabupaten' },
      { kode: '22', nama: 'Kabupaten Semarang', tipe: 'Kabupaten' },
      { kode: '23', nama: 'Kabupaten Temanggung', tipe: 'Kabupaten' },
      { kode: '24', nama: 'Kabupaten Kendal', tipe: 'Kabupaten' },
      { kode: '25', nama: 'Kabupaten Batang', tipe: 'Kabupaten' },
      { kode: '26', nama: 'Kabupaten Pekalongan', tipe: 'Kabupaten' },
      { kode: '27', nama: 'Kabupaten Pemalang', tipe: 'Kabupaten' },
      { kode: '28', nama: 'Kabupaten Tegal', tipe: 'Kabupaten' },
      { kode: '29', nama: 'Kabupaten Brebes', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Magelang', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Surakarta', tipe: 'Kota' },
      { kode: '73', nama: 'Kota Salatiga', tipe: 'Kota' },
      { kode: '74', nama: 'Kota Semarang', tipe: 'Kota' },
      { kode: '75', nama: 'Kota Pekalongan', tipe: 'Kota' },
      { kode: '76', nama: 'Kota Tegal', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '34',
    namaProvinsi: 'DI Yogyakarta',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Kulon Progo', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Bantul', tipe: 'Kabupaten' },
      { kode: '03', nama: 'Kabupaten Gunungkidul', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Sleman', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Yogyakarta', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '35',
    namaProvinsi: 'Jawa Timur',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Pacitan', tipe: 'Kabupaten' },
      { kode: '07', nama: 'Kabupaten Malang', tipe: 'Kabupaten' },
      { kode: '09', nama: 'Kabupaten Jember', tipe: 'Kabupaten' },
      { kode: '10', nama: 'Kabupaten Banyuwangi', tipe: 'Kabupaten' },
      { kode: '15', nama: 'Kabupaten Sidoarjo', tipe: 'Kabupaten' },
      { kode: '25', nama: 'Kabupaten Gresik', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Kediri', tipe: 'Kota' },
      { kode: '73', nama: 'Kota Malang', tipe: 'Kota' },
      { kode: '78', nama: 'Kota Surabaya', tipe: 'Kota' },
      { kode: '79', nama: 'Kota Batu', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '36',
    namaProvinsi: 'Banten',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Pandeglang', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Lebak', tipe: 'Kabupaten' },
      { kode: '03', nama: 'Kabupaten Tangerang', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Serang', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Tangerang', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Cilegon', tipe: 'Kota' },
      { kode: '73', nama: 'Kota Serang', tipe: 'Kota' },
      { kode: '74', nama: 'Kota Tangerang Selatan', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '51',
    namaProvinsi: 'Bali',
    kabupatenKota: [
      { kode: '02', nama: 'Kabupaten Tabanan', tipe: 'Kabupaten' },
      { kode: '03', nama: 'Kabupaten Badung', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Gianyar', tipe: 'Kabupaten' },
      { kode: '08', nama: 'Kabupaten Buleleng', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Denpasar', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '52',
    namaProvinsi: 'Nusa Tenggara Barat',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Lombok Barat', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Lombok Tengah', tipe: 'Kabupaten' },
      { kode: '03', nama: 'Kabupaten Lombok Timur', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Sumbawa', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Mataram', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '53',
    namaProvinsi: 'Nusa Tenggara Timur',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Kupang', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Manggarai', tipe: 'Kabupaten' },
      { kode: '15', nama: 'Kabupaten Manggarai Barat', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Kupang', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '61',
    namaProvinsi: 'Kalimantan Barat',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Sambas', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Mempawah', tipe: 'Kabupaten' },
      { kode: '12', nama: 'Kabupaten Kubu Raya', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Pontianak', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Singkawang', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '62',
    namaProvinsi: 'Kalimantan Tengah',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Kotawaringin Barat', tipe: 'Kabupaten' },
      { kode: '02', nama: 'Kabupaten Kotawaringin Timur', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Palangka Raya', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '63',
    namaProvinsi: 'Kalimantan Selatan',
    kabupatenKota: [
      { kode: '03', nama: 'Kabupaten Banjar', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Barito Kuala', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Banjarmasin', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Banjarbaru', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '64',
    namaProvinsi: 'Kalimantan Timur',
    kabupatenKota: [
      { kode: '02', nama: 'Kabupaten Kutai Kartanegara', tipe: 'Kabupaten' },
      { kode: '09', nama: 'Kabupaten Penajam Paser Utara', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Balikpapan', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Samarinda', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '65',
    namaProvinsi: 'Kalimantan Utara',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Bulungan', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Tarakan', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '71',
    namaProvinsi: 'Sulawesi Utara',
    kabupatenKota: [
      { kode: '02', nama: 'Kabupaten Minahasa', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Manado', tipe: 'Kota' },
      { kode: '72', nama: 'Kota Bitung', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '72',
    namaProvinsi: 'Sulawesi Tengah',
    kabupatenKota: [
      { kode: '02', nama: 'Kabupaten Poso', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Palu', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '73',
    namaProvinsi: 'Sulawesi Selatan',
    kabupatenKota: [
      { kode: '06', nama: 'Kabupaten Gowa', tipe: 'Kabupaten' },
      { kode: '09', nama: 'Kabupaten Maros', tipe: 'Kabupaten' },
      { kode: '08', nama: 'Kabupaten Bone', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Makassar', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '74',
    namaProvinsi: 'Sulawesi Tenggara',
    kabupatenKota: [
      { kode: '05', nama: 'Kabupaten Konawe', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Kendari', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '75',
    namaProvinsi: 'Gorontalo',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Gorontalo', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Gorontalo', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '76',
    namaProvinsi: 'Sulawesi Barat',
    kabupatenKota: [
      { kode: '02', nama: 'Kabupaten Mamuju', tipe: 'Kabupaten' },
      { kode: '04', nama: 'Kabupaten Polewali Mandar', tipe: 'Kabupaten' }
    ]
  },
  {
    kodeProvinsi: '81',
    namaProvinsi: 'Maluku',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Maluku Tengah', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Ambon', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '82',
    namaProvinsi: 'Maluku Utara',
    kabupatenKota: [
      { kode: '01', nama: 'Kabupaten Halmahera Barat', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Ternate', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '91',
    namaProvinsi: 'Papua',
    kabupatenKota: [
      { kode: '03', nama: 'Kabupaten Jayapura', tipe: 'Kabupaten' },
      { kode: '71', nama: 'Kota Jayapura', tipe: 'Kota' }
    ]
  },
  {
    kodeProvinsi: '92',
    namaProvinsi: 'Papua Barat',
    kabupatenKota: [
      { kode: '02', nama: 'Kabupaten Manokwari', tipe: 'Kabupaten' }
    ]
  }
];

function cleanStr(s?: string): string {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Mencari pasangan Kode Kemendagri (Provinsi 2 digit + Titik + Kabupaten 2 digit)
 * berdasarkan nama provinsi dan kabupaten/kota yang diinputkan.
 */
export function getKemendagriCodePair(
  provinsiName?: string,
  kabupatenKotaName?: string
): { kodeProv: string; kodeKab: string; prefix: string; namaProv: string; namaKab: string } {
  const pClean = cleanStr(provinsiName);
  const kClean = cleanStr(kabupatenKotaName);

  // 1. Cari provinsi yang cocok
  let matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => {
    const pNameClean = cleanStr(p.namaProvinsi);
    return pClean && (pNameClean.includes(pClean) || pClean.includes(pNameClean));
  });

  // Alias provinsi umum (misal: "jateng", "jabar", "jatim", "diy", "jogja", "dki")
  if (!matchedProv && pClean) {
    if (pClean.includes('jateng') || pClean.includes('tengah')) matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => p.kodeProvinsi === '33');
    else if (pClean.includes('jabar') || pClean.includes('barat') && pClean.includes('jawa')) matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => p.kodeProvinsi === '32');
    else if (pClean.includes('jatim') || pClean.includes('timur') && pClean.includes('jawa')) matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => p.kodeProvinsi === '35');
    else if (pClean.includes('diy') || pClean.includes('jogja') || pClean.includes('yogya')) matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => p.kodeProvinsi === '34');
    else if (pClean.includes('dki') || pClean.includes('jakarta')) matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => p.kodeProvinsi === '31');
    else if (pClean.includes('bali')) matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => p.kodeProvinsi === '51');
    else if (pClean.includes('ntb')) matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => p.kodeProvinsi === '52');
    else if (pClean.includes('ntt')) matchedProv = KEMENDAGRI_WILAYAH_LIST.find(p => p.kodeProvinsi === '53');
  }

  // Jika provinsi tidak ditemukan, pilih secara acak dari daftar Kemendagri
  if (!matchedProv) {
    matchedProv = KEMENDAGRI_WILAYAH_LIST[Math.floor(Math.random() * KEMENDAGRI_WILAYAH_LIST.length)];
  }

  // 2. Cari kabupaten/kota yang cocok di provinsi tersebut
  let matchedKab = matchedProv.kabupatenKota.find(k => {
    const kNameClean = cleanStr(k.nama);
    return kClean && (kNameClean.includes(kClean) || kClean.includes(kNameClean));
  });

  // Jika tidak ditemukan di provinsi tersebut, periksa apakah nama kabupaten/kota cocok dengan wilayah di provinsi lain
  if (!matchedKab && kClean) {
    for (const prov of KEMENDAGRI_WILAYAH_LIST) {
      const found = prov.kabupatenKota.find(k => {
        const kNameClean = cleanStr(k.nama);
        return kNameClean.includes(kClean) || kClean.includes(kNameClean);
      });
      if (found) {
        matchedProv = prov;
        matchedKab = found;
        break;
      }
    }
  }

  // Jika tetap belum cocok, pilih acak dari kabupaten/kota di provinsi tersebut
  if (!matchedKab) {
    matchedKab = matchedProv.kabupatenKota[Math.floor(Math.random() * matchedProv.kabupatenKota.length)];
  }

  const kodeProv = matchedProv.kodeProvinsi;
  const kodeKab = matchedKab.kode;
  const prefix = `${kodeProv}.${kodeKab}`;

  return {
    kodeProv,
    kodeKab,
    prefix,
    namaProv: matchedProv.namaProvinsi,
    namaKab: matchedKab.nama
  };
}

/**
 * Menghasilkan Kode KDKMP acak sesuai standar Kemendagri.
 * 
 * Aturan:
 * Diawali 2 digit kode provinsi + titik (.) + 2 digit kode kabupaten/kota
 * Diikuti .KDKMP. dan 3 digit nomor acak (001 - 999).
 * 
 * Contoh output:
 * - "33.11.KDKMP.034" (Jawa Tengah, Kab. Sukoharjo, Unit 034)
 * - "32.03.KDKMP.001" (Jawa Barat, Kab. Cianjur, Unit 001)
 * - "35.78.KDKMP.214" (Jawa Timur, Kota Surabaya, Unit 214)
 */
export function generateRandomKDKMPCode(
  provinsiName?: string,
  kabupatenKotaName?: string,
  fixedSeq?: number | string
): string {
  const { prefix } = getKemendagriCodePair(provinsiName, kabupatenKotaName);
  
  let seqStr = '';
  if (fixedSeq !== undefined && fixedSeq !== null && fixedSeq !== '') {
    const num = parseInt(String(fixedSeq), 10);
    seqStr = isNaN(num) ? String(fixedSeq).padStart(3, '0') : String(num).padStart(3, '0');
  } else {
    // Acak 3 digit nomor unit 001 - 999
    const randomNum = Math.floor(1 + Math.random() * 999);
    seqStr = String(randomNum).padStart(3, '0');
  }

  return `${prefix}.KDKMP.${seqStr}`;
}

/**
 * Validasi apakah kode KDKMP diawali format Kemendagri (2 digit + titik + 2 digit)
 */
export function isValidKemendagriKDKMPCode(code: string): boolean {
  if (!code) return false;
  // Memeriksa awalan 2 digit angka + '.' + 2 digit angka
  return /^\d{2}\.\d{2}/.test(code.trim());
}

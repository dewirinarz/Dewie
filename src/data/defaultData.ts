import { KDKMPLocation } from '../types/kdkmp';

export const INITIAL_LOCATIONS: KDKMPLocation[] = [
  {
    id: 'kdkmp-001',
    kodeKDKMP: '32.03.KDKMP.001',
    namaLokasi: 'KDKMP Desa Sukamaju',
    provinsi: 'Jawa Barat',
    kabupatenKota: 'Kabupaten Cianjur',
    kecamatan: 'Kecamatan Sukaresmi',
    desaKelurahan: 'Desa Sukamaju',
    alamatLengkap: 'Jl. Raya Cipanas No. 45, Desa Sukamaju, Kec. Sukaresmi',
    namaPetugas: 'Drs. Hendra Setiawan (Tim Satgas KDKMP)',
    kontakPerson: 'Ahmad Fauzi (0812-3456-7890)',
    tanggalKunjungan: '2026-10-15',
    catatanTambahan: 'Lokasi strategis di jalur utama desa dekat kantor balai desa dan pasar tani.',
    updatedAt: '2026-10-15T14:30:00Z',
    checklist: {
      fisikSarpras: {
        bangunanGudang: {
          status: 'ada',
          keterangan: 'Luas gudang 120 m2, lantai beton, ventilasi standar aman untuk LPG & Pupuk'
        },
        bangunanGerai: {
          status: 'ada',
          keterangan: 'Luas gerai 80 m2, etalase siap, penerangan LED memadai'
        },
        instalasiListrik: {
          status: 'ada',
          keterangan: 'Daya PLN 5.500 VA + Genset backup 3.000 VA'
        },
        instalasiAirBersih: {
          status: 'ada',
          keterangan: 'PDAM lancar dengan toren tampungan 1.000 L'
        },
        fasilitasKlinik: {
          status: 'ada',
          keterangan: 'Ruang klinik 12 m2, bed periksa & tensimeter tersedia'
        },
        rakObatApotek: {
          status: 'ada',
          keterangan: 'Lemari obat terkunci kaca standar BPOM'
        },
        saranaPrasarana: {
          rakDisplay: { status: 'ada', keterangan: '6 unit rak gondola double & 4 single' },
          perangkatKasir: { status: 'ada', keterangan: 'PC Kasir POS + Scanner Barcode + Printer Kasir' },
          truk6Ban: { status: 'ada', keterangan: '1 unit Isuzu Elf bak besi, kondisi prima' },
          pickup4x4: { status: 'ada', keterangan: '1 unit Hilux Single Cabin operasional kebun' },
          motorBakRoda3: { status: 'ada', keterangan: '2 unit Viar 150cc antar jemput barang desa' },
          ac: { status: 'ada', keterangan: '2 unit AC Daikin 1.5 PK ruang gerai berfungsi dingin' },
          apar: { status: 'ada', keterangan: '4 unit APAR 6kg tabung serbuk kimia (berlaku s/d 2027)' },
          cctv: { status: 'ada', keterangan: '8 channel IP Camera aktif online recording' },
          kipasCeiling: { status: 'ada', keterangan: '3 unit kipas plafon di area gudang' },
          keranjangBelanja: { status: 'ada', keterangan: '25 keranjang belanja plastik merah-putih' },
          seragamKD: { status: 'ada', keterangan: '8 stel seragam kemeja bordir resmi KDKMP' },
          papanNamaKD: { status: 'ada', keterangan: 'Papan nama neon box ukuran 3x1.5 meter menyala' }
        }
      },
      sdm: {
        manajerKD: {
          status: 'ada',
          tanggalOnBoarding: '2026-09-01',
          keterangan: 'Rifki Pratama, S.E. (Lulusan Manajemen Bisnis)'
        },
        sdmRekrutmenAPN: {
          status: 'ada',
          masyarakatSekitar: 'ya',
          keterangan: '4 staf kasir & gudang 100% warga pemuda Desa Sukamaju'
        },
        koordinasiPengurusKades: {
          status: 'ada',
          mekanismeKoordinasi: 'Rapat koordinasi bulanan & grup komunikasi terpadu WA',
          tanggalKoordinasi: '2026-10-10',
          keterangan: 'Dihadiri Kepala Desa Sukamaju dan 5 Ketua RW'
        },
        pembekalanManajer: {
          status: 'ada',
          tanggalPembekalan: '2026-09-12',
          keterangan: 'Sertifikat kelulusan TOT Koperasi Pasca 2 Tahun terverifikasi'
        }
      },
      sistem: {
        sistemStokBarang: {
          status: 'ada',
          keterangan: 'Aplikasi ERP KDKMP Cloud tersinkronisasi stok real-time'
        },
        sistemPemesananProduk: {
          status: 'ada',
          keterangan: 'Portal B2B terhubung langsung dengan PBF & Bulog'
        },
        sistemAbsensiPegawai: {
          status: 'ada',
          keterangan: 'Mesin fingerprint biometrik & GPS mobile'
        }
      },
      produk: {
        lpg3kg: {
          status: 'ada',
          jumlahDiterima: '600 tabung',
          jumlahStok: '180 tabung',
          periodePengiriman: '2x seminggu (Senin & Kamis)',
          keterangan: 'Distribusi ke pangkalan berjalan tertib sesuai HET'
        },
        pupukBersubsidi: {
          status: 'ada',
          jumlahDiterima: '15 Ton (Urea & NPK)',
          jumlahStok: '4.5 Ton',
          periodePengiriman: 'Setiap awal bulan',
          keterangan: 'Penebusan melalui kartu tani / aplikasi i-Pubers'
        },
        berasSPHP: {
          status: 'ada',
          jumlahDiterima: '5.000 Kg (kemasan 5kg)',
          jumlahStok: '1.250 Kg',
          periodePengiriman: 'Mingguan dari Gudang Bulog Cianjur',
          keterangan: 'Dijual Rp 62.500/sak 5kg, peminat sangat tinggi'
        },
        minyakita: {
          status: 'ada',
          jumlahDiterima: '1.800 Liter',
          jumlahStok: '320 Liter',
          periodePengiriman: '1x per 10 hari',
          keterangan: 'Harga sesuai HET Rp 15.700/liter'
        },
        gula: {
          status: 'ada',
          periodePengiriman: '2 minggu sekali',
          sumberSupply: 'PT Perkebunan Nusantara / RNI',
          skemaKerjasama: 'konsinyasi',
          keterangan: 'Gula kristal putih kemasan 1 kg SNI'
        },
        obatObatan: {
          status: 'ada',
          periodePengiriman: 'Bulanan',
          sumberSupply: 'PBF Kimia Farma Trading & Distribution',
          skemaKerjasama: 'konsinyasi',
          keterangan: 'Obat bebas & bebas terbatas (Paracetamol, Antasida, Vitamin)'
        }
      },
      transaksi: {
        waktuOperasional: {
          rangeWaktu: '07.30 - 21.00 WIB',
          keterangan: 'Buka setiap hari (Senin s/d Minggu)'
        },
        nilaiTransaksiHarian: {
          rangeNilai: 'Rp 18.500.000 - Rp 27.000.000 / hari',
          keterangan: 'Puncak transaksi di pagi hari dan akhir pekan'
        },
        produkPalingLaku: {
          rangeJumlah: 'Beras SPHP (90 sak/hari), Minyakita (120 pouch/hari), LPG 3kg',
          keterangan: 'Kebutuhan pokok pangan desa perputaran sangat cepat'
        },
        produkKurangLaku: {
          namaProduk: 'Obat herbal kapsul kemasan besar',
          keterangan: 'Warga lebih memilih sachet atau obat generik esensial'
        },
        mekanismeTransaksi: {
          pilihan: 'keduanya',
          keterangan: '65% Cash tunai, 35% QRIS Mandiri & debit BRI'
        },
        kendalaDanDukungan: {
          kendalaUtama: 'Antrean penebusan gas LPG 3kg di pagi hari saat pasokan datang',
          keterangan: 'Perlu penambahan pallet penyimpanan dan antrean digital QR'
        }
      }
    }
  },
  {
    id: 'kdkmp-002',
    kodeKDKMP: '34.02.KDKMP.012',
    namaLokasi: 'KDKMP Kelurahan Banguntapan',
    provinsi: 'D.I. Yogyakarta',
    kabupatenKota: 'Kabupaten Bantul',
    kecamatan: 'Kecamatan Banguntapan',
    desaKelurahan: 'Kelurahan Banguntapan',
    alamatLengkap: 'Jl. Ringroad Timur No. 88, Banguntapan, Bantul',
    namaPetugas: 'Siti Rahmawati, M.Sc (Satgas Koperasi Wilayah)',
    kontakPerson: 'Bambang Triyono (0813-8877-6655)',
    tanggalKunjungan: '2026-10-18',
    catatanTambahan: 'Kesiapan sangat prima, display estetik dan sistem POS terintegrasi kasir modern.',
    updatedAt: '2026-10-18T11:20:00Z',
    checklist: {
      fisikSarpras: {
        bangunanGudang: { status: 'ada', keterangan: 'Gudang berpendingin khusus & rak pallet' },
        bangunanGerai: { status: 'ada', keterangan: 'Gerai standar mini mart modern luas 100 m2' },
        instalasiListrik: { status: 'ada', keterangan: '7.700 VA panel distribusi tersertifikasi' },
        instalasiAirBersih: { status: 'ada', keterangan: 'Sumur bor dalam + filter air bersih' },
        fasilitasKlinik: { status: 'ada', keterangan: 'Klinik pratama KDKMP standby dokter perawat desa' },
        rakObatApotek: { status: 'ada', keterangan: 'Apotek mini terdaftar dinkes kabupaten' },
        saranaPrasarana: {
          rakDisplay: { status: 'ada', keterangan: '12 unit rak modern' },
          perangkatKasir: { status: 'ada', keterangan: '2 set POS Touchscreen dual screen' },
          truk6Ban: { status: 'ada', keterangan: '1 unit Hino Dutro box pendingin' },
          pickup4x4: { status: 'ada', keterangan: '1 unit Suzuki Carry pickup' },
          motorBakRoda3: { status: 'ada', keterangan: '1 unit Viar Karya 200' },
          ac: { status: 'ada', keterangan: '3 unit AC Inverter 2 PK' },
          apar: { status: 'ada', keterangan: '6 tabung APAR CO2 dan powder' },
          cctv: { status: 'ada', keterangan: '16 channel DVR Cloud' },
          kipasCeiling: { status: 'ada', keterangan: '4 unit exhaust ceiling' },
          keranjangBelanja: { status: 'ada', keterangan: '30 keranjang tarik & tenteng' },
          seragamKD: { status: 'ada', keterangan: 'Lengkap ID card dan celemek barista/kasir' },
          papanNamaKD: { status: 'ada', keterangan: 'Papan acrilic LED 4x2 m' }
        }
      },
      sdm: {
        manajerKD: {
          status: 'ada',
          tanggalOnBoarding: '2026-08-15',
          keterangan: 'Eko Nugroho, S.Pt'
        },
        sdmRekrutmenAPN: {
          status: 'ada',
          masyarakatSekitar: 'ya',
          keterangan: '6 staf warga Banguntapan'
        },
        koordinasiPengurusKades: {
          status: 'ada',
          mekanismeKoordinasi: 'Rapat koordinasi mingguan pengurus',
          tanggalKoordinasi: '2026-10-12',
          keterangan: 'Dihadiri Lurah Banguntapan'
        },
        pembekalanManajer: {
          status: 'ada',
          tanggalPembekalan: '2026-08-25',
          keterangan: 'Lulus sertifikasi pengelola ritel koperasi'
        }
      },
      sistem: {
        sistemStokBarang: { status: 'ada', keterangan: 'Sistem Barcode Auto-Reorder' },
        sistemPemesananProduk: { status: 'ada', keterangan: 'Integrasi e-Commerce lokal' },
        sistemAbsensiPegawai: { status: 'ada', keterangan: 'Absensi wajah geofencing mobile' }
      },
      produk: {
        lpg3kg: {
          status: 'ada',
          jumlahDiterima: '800 tabung',
          jumlahStok: '220 tabung',
          periodePengiriman: '3x seminggu',
          keterangan: 'Pencatatan NIK terintegrasi subsidi tepat'
        },
        pupukBersubsidi: {
          status: 'ada',
          jumlahDiterima: '10 Ton',
          jumlahStok: '3 Ton',
          periodePengiriman: 'Dua mingguan',
          keterangan: 'Alokasi kelompok tani hortikultura'
        },
        berasSPHP: {
          status: 'ada',
          jumlahDiterima: '6.000 Kg',
          jumlahStok: '2.100 Kg',
          periodePengiriman: 'Setiap hari Selasa',
          keterangan: 'Kualitas beras pulen dan higienis'
        },
        minyakita: {
          status: 'ada',
          jumlahDiterima: '2.400 Liter',
          jumlahStok: '500 Liter',
          periodePengiriman: 'Mingguan',
          keterangan: 'Stok aman tercukupi'
        },
        gula: {
          status: 'ada',
          periodePengiriman: '1x seminggu',
          sumberSupply: 'PG Madukismo',
          skemaKerjasama: 'beli_putus',
          keterangan: 'Gula pasir premium lokal'
        },
        obatObatan: {
          status: 'ada',
          periodePengiriman: 'Dua mingguan',
          sumberSupply: 'Apotek Mitra KDKMP',
          skemaKerjasama: 'konsinyasi',
          keterangan: 'Obat P3K, vitamin daya tahan tubuh'
        }
      },
      transaksi: {
        waktuOperasional: { rangeWaktu: '06.30 - 22.00 WIB', keterangan: 'Full day 2 shift operasional' },
        nilaiTransaksiHarian: { rangeNilai: 'Rp 22.000.000 - Rp 35.000.000 / hari', keterangan: 'Sangat ramai pembeli' },
        produkPalingLaku: { rangeJumlah: 'Minyakita 180 pouch, Beras SPHP 120 sak', keterangan: 'Pangan pokok' },
        produkKurangLaku: { namaProduk: 'Sabun cuci curah jerigen besar', keterangan: 'Konsumen gemar sachet/pouch' },
        mekanismeTransaksi: { pilihan: 'keduanya', keterangan: '55% QRIS & EDC, 45% Tunai' },
        kendalaDanDukungan: {
          kendalaUtama: 'Lahan parkir mobil saat jam sibuk perlu pengaturan juru parkir',
          keterangan: 'Kerjasama dengan karang taruna untuk pembinaan parkir desa'
        }
      }
    }
  },
  {
    id: 'kdkmp-003',
    kodeKDKMP: '35.07.KDKMP.028',
    namaLokasi: 'KDKMP Desa Sidomulyo',
    provinsi: 'Jawa Timur',
    kabupatenKota: 'Kabupaten Malang',
    kecamatan: 'Kecamatan Pujon',
    desaKelurahan: 'Desa Sidomulyo',
    alamatLengkap: 'Dusun Krajan RT 04 RW 02, Desa Sidomulyo, Kec. Pujon',
    namaPetugas: 'Budi Santoso, S.Sos (Penyuluh Koperasi Daerah)',
    kontakPerson: 'Haryanto (0852-9988-1122)',
    tanggalKunjungan: '2026-10-20',
    catatanTambahan: 'Sebagian sarana dalam proses pengiriman (APAR dan truk sedang servis).',
    updatedAt: '2026-10-20T09:15:00Z',
    checklist: {
      fisikSarpras: {
        bangunanGudang: { status: 'ada', keterangan: 'Gudang cukup luas, atap seng baru' },
        bangunanGerai: { status: 'ada', keterangan: 'Gerai semi modern di balai pertemuan' },
        instalasiListrik: { status: 'ada', keterangan: '3.500 VA stabil' },
        instalasiAirBersih: { status: 'ada', keterangan: 'Sumber mata air pegunungan lancar' },
        fasilitasKlinik: { status: 'tidak_ada', keterangan: 'Ruang klinik masih tahap renovasi dinding' },
        rakObatApotek: { status: 'ada', keterangan: 'Rak obat kaca 2 susun' },
        saranaPrasarana: {
          rakDisplay: { status: 'ada', keterangan: '5 unit rak' },
          perangkatKasir: { status: 'ada', keterangan: 'Laptop POS + printer thermal' },
          truk6Ban: { status: 'tidak_ada', keterangan: 'Belum dialokasikan armada truk 6 ban' },
          pickup4x4: { status: 'ada', keterangan: '1 unit Mitsubishi L300 4x2' },
          motorBakRoda3: { status: 'ada', keterangan: '1 unit Tossa 150cc' },
          ac: { status: 'tidak_ada', keterangan: 'Daerah dingin pegunungan (hanya ventilasi alami)' },
          apar: { status: 'tidak_ada', keterangan: 'Tabung APAR sedang diisi ulang ke kota' },
          cctv: { status: 'ada', keterangan: '4 kamera analog terpasang' },
          kipasCeiling: { status: 'tidak_ada', keterangan: 'Tidak diperlukan karena hawa sejuk' },
          keranjangBelanja: { status: 'ada', keterangan: '15 keranjang' },
          seragamKD: { status: 'ada', keterangan: '4 seragam petugas' },
          papanNamaKD: { status: 'ada', keterangan: 'Spanduk papan nama kayu plat besi' }
        }
      },
      sdm: {
        manajerKD: { status: 'ada', tanggalOnBoarding: '2026-09-10', keterangan: 'Danang Wicaksono' },
        sdmRekrutmenAPN: { status: 'ada', masyarakatSekitar: 'ya', keterangan: '3 orang pemuda setempat' },
        koordinasiPengurusKades: {
          status: 'ada',
          mekanismeKoordinasi: 'Musyawarah desa selapanan',
          tanggalKoordinasi: '2026-10-05',
          keterangan: 'Kades mendukung penuh program KDKMP'
        },
        pembekalanManajer: {
          status: 'tidak_ada',
          tanggalPembekalan: '',
          keterangan: 'Menunggu jadwal gelombang 2 pelatihan provinsi'
        }
      },
      sistem: {
        sistemStokBarang: { status: 'ada', keterangan: 'Aplikasi spreadsheet terkoneksi drive' },
        sistemPemesananProduk: { status: 'ada', keterangan: 'WhatsApp Form ke distributor cabang' },
        sistemAbsensiPegawai: { status: 'tidak_ada', keterangan: 'Masih buku absensi tanda tangan manual' }
      },
      produk: {
        lpg3kg: {
          status: 'ada',
          jumlahDiterima: '400 tabung',
          jumlahStok: '90 tabung',
          periodePengiriman: '1x seminggu',
          keterangan: 'Peminat tinggi dari peternak sapi perah'
        },
        pupukBersubsidi: {
          status: 'ada',
          jumlahDiterima: '8 Ton',
          jumlahStok: '1.2 Ton',
          periodePengiriman: 'Bulanan',
          keterangan: 'Petani sayur mayur Pujon'
        },
        berasSPHP: {
          status: 'ada',
          jumlahDiterima: '3.000 Kg',
          jumlahStok: '400 Kg',
          periodePengiriman: '2 minggu sekali',
          keterangan: 'Cepat habis dalam 4 hari'
        },
        minyakita: {
          status: 'ada',
          jumlahDiterima: '800 Liter',
          jumlahStok: '120 Liter',
          periodePengiriman: 'Dua mingguan',
          keterangan: 'Stok menipis menunggu pasokan baru'
        },
        gula: {
          status: 'ada',
          periodePengiriman: 'Bulanan',
          sumberSupply: 'Koperasi Petani Tebu',
          skemaKerjasama: 'beli_putus',
          keterangan: 'Gula lokal Malang'
        },
        obatObatan: {
          status: 'tidak_ada',
          periodePengiriman: '',
          sumberSupply: '',
          skemaKerjasama: '',
          keterangan: 'Izin edar apotek desa sedang proses pengajuan'
        }
      },
      transaksi: {
        waktuOperasional: { rangeWaktu: '08.00 - 17.00 WIB', keterangan: 'Menyesuaikan jam kerja petani' },
        nilaiTransaksiHarian: { rangeNilai: 'Rp 6.000.000 - Rp 12.000.000 / hari', keterangan: 'Rata-rata omzet harian' },
        produkPalingLaku: { rangeJumlah: 'LPG 3kg & Pupuk NPK Bersubsidi', keterangan: 'Kebutuhan vital warga' },
        produkKurangLaku: { namaProduk: 'Snack modern bermerk kota', keterangan: 'Warga lebih suka jajan olahan lokal' },
        mekanismeTransaksi: { pilihan: 'cash', keterangan: '90% Tunai, sinyal seluler kadang lambat untuk QRIS' },
        kendalaDanDukungan: {
          kendalaUtama: 'Koneksi internet seluler sering blank spot saat hujan lebat',
          keterangan: 'Dibutuhkan bantuan instalasi Wi-Fi satelit / fiber optik desa'
        }
      }
    }
  },
  {
    id: 'kdkmp-004',
    kodeKDKMP: '14.03.KDKMP.005',
    namaLokasi: 'KDKMP Desa Tanjung Medang',
    provinsi: 'Riau',
    kabupatenKota: 'Kabupaten Bengkalis',
    kecamatan: 'Kecamatan Rupat Utara',
    desaKelurahan: 'Desa Tanjung Medang',
    alamatLengkap: 'Jl. Mercusuar Pantai No. 12, Pulau Rupat, Kab. Bengkalis',
    namaPetugas: 'Iskandar Zulkarnain, S.T (Satgas 3T KDKMP)',
    kontakPerson: 'Zulham Efendi (0821-7766-4433)',
    tanggalKunjungan: '2026-10-12',
    catatanTambahan: 'KDKMP wilayah kepulauan / perbatasan, transportasi bergantung kapal roro & dermaga.',
    updatedAt: '2026-10-12T16:00:00Z',
    checklist: {
      fisikSarpras: {
        bangunanGudang: { status: 'ada', keterangan: 'Gudang dermaga beton anti korosi air laut' },
        bangunanGerai: { status: 'ada', keterangan: 'Gerai 60 m2 menghadap jalan pelabuhan' },
        instalasiListrik: { status: 'ada', keterangan: 'PLN Subsektor 2.200 VA (kadang pemadaman)' },
        instalasiAirBersih: { status: 'ada', keterangan: 'Penampungan air hujan & desalinasi' },
        fasilitasKlinik: { status: 'tidak_ada', keterangan: 'Belum ada ruang medis memadai' },
        rakObatApotek: { status: 'ada', keterangan: 'Etalase obat P3K kelautan' },
        saranaPrasarana: {
          rakDisplay: { status: 'ada', keterangan: '4 unit rak besi galvanis' },
          perangkatKasir: { status: 'ada', keterangan: 'Mesin kasir Android POS portable' },
          truk6Ban: { status: 'tidak_ada', keterangan: 'Tidak ada jalan besar untuk truk 6 ban di pulau' },
          pickup4x4: { status: 'ada', keterangan: '1 unit Pickup kabin tunggal modifikasi ban lumpur' },
          motorBakRoda3: { status: 'ada', keterangan: '2 unit motor roda 3 pengangkut galon & gas' },
          ac: { status: 'tidak_ada', keterangan: 'Belum terpasang pendingin' },
          apar: { status: 'ada', keterangan: '2 tabung APAR 6kg' },
          cctv: { status: 'tidak_ada', keterangan: 'Belum dipasang' },
          kipasCeiling: { status: 'ada', keterangan: '2 unit kipas angin dinding' },
          keranjangBelanja: { status: 'ada', keterangan: '10 keranjang' },
          seragamKD: { status: 'ada', keterangan: 'Tersedia kaos berkerah logo KDKMP' },
          papanNamaKD: { status: 'ada', keterangan: 'Plang besi cat tahan cuaca laut' }
        }
      },
      sdm: {
        manajerKD: { status: 'ada', tanggalOnBoarding: '2026-08-01', keterangan: 'M. Rasyid Ridho' },
        sdmRekrutmenAPN: { status: 'ada', masyarakatSekitar: 'ya', keterangan: '2 staf pemuda nelayan' },
        koordinasiPengurusKades: {
          status: 'ada',
          mekanismeKoordinasi: 'Rapat dengan BPD dan Kades Tanjung Medang',
          tanggalKoordinasi: '2026-09-28',
          keterangan: 'Sinergi BUMDes dan KDKMP'
        },
        pembekalanManajer: {
          status: 'ada',
          tanggalPembekalan: '2026-08-10',
          keterangan: 'Sertifikasi online pasca 2 tahun'
        }
      },
      sistem: {
        sistemStokBarang: { status: 'ada', keterangan: 'Aplikasi kasir offline sync' },
        sistemPemesananProduk: { status: 'tidak_ada', keterangan: 'Pemesanan masih mengandalkan telepon agen laut' },
        sistemAbsensiPegawai: { status: 'tidak_ada', keterangan: 'Buku daftar hadir manual' }
      },
      produk: {
        lpg3kg: {
          status: 'ada',
          jumlahDiterima: '350 tabung',
          jumlahStok: '65 tabung',
          periodePengiriman: 'Tergantung jadwal kapal roro 1x seminggu',
          keterangan: 'Sangat vital untuk pasokan gas nelayan'
        },
        pupukBersubsidi: {
          status: 'tidak_ada',
          jumlahDiterima: '0',
          jumlahStok: '0',
          periodePengiriman: 'Belum ada alokasi pupuk di pulau ini',
          keterangan: 'Mayoritas warga adalah nelayan pesisir bukan petani'
        },
        berasSPHP: {
          status: 'ada',
          jumlahDiterima: '4.000 Kg',
          jumlahStok: '800 Kg',
          periodePengiriman: 'Setiap 2 minggu via kapal Dumai',
          keterangan: 'Menjaga stabilitas harga beras di pulau terluar'
        },
        minyakita: {
          status: 'ada',
          jumlahDiterima: '1.200 Liter',
          jumlahStok: '240 Liter',
          periodePengiriman: 'Dua mingguan',
          keterangan: 'Sangat diminati ibu rumah tangga'
        },
        gula: {
          status: 'ada',
          periodePengiriman: 'Bulanan',
          sumberSupply: 'Distributor Dumai',
          skemaKerjasama: 'beli_putus',
          keterangan: 'Gula pasir kemasan 1 kg'
        },
        obatObatan: {
          status: 'tidak_ada',
          periodePengiriman: '',
          sumberSupply: '',
          skemaKerjasama: '',
          keterangan: 'Menunggu rekomendasi Puskesmas Pembantu'
        }
      },
      transaksi: {
        waktuOperasional: { rangeWaktu: '07.00 - 18.00 WIB', keterangan: 'Mengikuti kedatangan kapal nelayan' },
        nilaiTransaksiHarian: { rangeNilai: 'Rp 8.000.000 - Rp 14.000.000 / hari', keterangan: 'Stabil' },
        produkPalingLaku: { rangeJumlah: 'Beras SPHP dan Minyakita', keterangan: 'Sembako dasar pulau' },
        produkKurangLaku: { namaProduk: 'Mie instan varian premium', keterangan: 'Lebih diminati mie instan standar' },
        mekanismeTransaksi: { pilihan: 'cash', keterangan: '100% Tunai karena keterbatasan sinyal perbankan' },
        kendalaDanDukungan: {
          kendalaUtama: 'Tergantung cuaca ombak laut dan jadwal kapal penyeberangan roro',
          keterangan: 'Perlu buffer stock gudang kapasitas 2x lipat dan genset cadangan otomatis'
        }
      }
    }
  },
  {
    id: 'kdkmp-005',
    kodeKDKMP: '32.16.KDKMP.077',
    namaLokasi: 'KDKMP Desa Kertarahayu',
    provinsi: 'Jawa Barat',
    kabupatenKota: 'Kabupaten Bekasi',
    kecamatan: 'Kecamatan Setu',
    desaKelurahan: 'Desa Kertarahayu',
    alamatLengkap: 'Jl. Situ Burangkeng No. 19, Kertarahayu, Setu, Kab. Bekasi',
    namaPetugas: 'Wahyu Nugroho, S.E. (Inspektur Operasional KDKMP)',
    kontakPerson: 'Nurhalim (0877-1234-5566)',
    tanggalKunjungan: '2026-10-22',
    catatanTambahan: 'Kesiapan 87%, sarana kasir modern, klinik sedang pengadaan perlengkapan obat.',
    updatedAt: '2026-10-22T13:45:00Z',
    checklist: {
      fisikSarpras: {
        bangunanGudang: { status: 'ada', keterangan: 'Gudang permanen 100 m2 dengan gerbang rolling door besi' },
        bangunanGerai: { status: 'ada', keterangan: 'Gerai kaca modern ber-AC 75 m2' },
        instalasiListrik: { status: 'ada', keterangan: 'PLN 4.400 VA aman tanpa kendala' },
        instalasiAirBersih: { status: 'ada', keterangan: 'Air tanah jernih filter karbon' },
        fasilitasKlinik: { status: 'ada', keterangan: 'Ruang klinik mandiri 15 m2' },
        rakObatApotek: { status: 'ada', keterangan: 'Rak obat aluminium tertutup' },
        saranaPrasarana: {
          rakDisplay: { status: 'ada', keterangan: '8 unit rak gondola' },
          perangkatKasir: { status: 'ada', keterangan: 'All-in-one POS touchscreen + thermal printer' },
          truk6Ban: { status: 'ada', keterangan: '1 unit Mitsubishi Canter' },
          pickup4x4: { status: 'tidak_ada', keterangan: 'Kondisi jalan aspal mulus, armada memakai 4x2' },
          motorBakRoda3: { status: 'ada', keterangan: '2 unit Viar' },
          ac: { status: 'ada', keterangan: '2 unit AC 1.5 PK' },
          apar: { status: 'ada', keterangan: '3 tabung APAR 6kg' },
          cctv: { status: 'ada', keterangan: '8 channel CCTV' },
          kipasCeiling: { status: 'ada', keterangan: '2 kipas ceiling' },
          keranjangBelanja: { status: 'ada', keterangan: '20 keranjang belanja' },
          seragamKD: { status: 'ada', keterangan: 'Lengkap rompi dan kemeja KDKMP' },
          papanNamaKD: { status: 'ada', keterangan: 'Papan nama plang neon box terang' }
        }
      },
      sdm: {
        manajerKD: { status: 'ada', tanggalOnBoarding: '2026-09-05', keterangan: 'Dedi Kurniawan' },
        sdmRekrutmenAPN: { status: 'ada', masyarakatSekitar: 'ya', keterangan: '5 staf pemuda Kertarahayu' },
        koordinasiPengurusKades: {
          status: 'ada',
          mekanismeKoordinasi: 'Rapat koordinasi bulanan',
          tanggalKoordinasi: '2026-10-14',
          keterangan: 'Kades Setu hadir dan memberikan arahan'
        },
        pembekalanManajer: {
          status: 'ada',
          tanggalPembekalan: '2026-09-20',
          keterangan: 'Selesai pelatihan manajerial pasca 2 tahun'
        }
      },
      sistem: {
        sistemStokBarang: { status: 'ada', keterangan: 'Aplikasi ERP Cloud KDKMP' },
        sistemPemesananProduk: { status: 'ada', keterangan: 'Sistem PO otomatis' },
        sistemAbsensiPegawai: { status: 'ada', keterangan: 'Aplikasi mobile absensi GPS' }
      },
      produk: {
        lpg3kg: {
          status: 'ada',
          jumlahDiterima: '560 tabung',
          jumlahStok: '140 tabung',
          periodePengiriman: '2x seminggu',
          keterangan: 'Pangkalan resmi Pertamina'
        },
        pupukBersubsidi: {
          status: 'ada',
          jumlahDiterima: '6 Ton',
          jumlahStok: '2.5 Ton',
          periodePengiriman: 'Bulanan',
          keterangan: 'Distribusi untuk kelompok tani padi desa'
        },
        berasSPHP: {
          status: 'ada',
          jumlahDiterima: '4.500 Kg',
          jumlahStok: '1.100 Kg',
          periodePengiriman: 'Mingguan dari Bulog Karawang',
          keterangan: 'Kemasan 5 kg'
        },
        minyakita: {
          status: 'ada',
          jumlahDiterima: '1.500 Liter',
          jumlahStok: '350 Liter',
          periodePengiriman: '10 hari sekali',
          keterangan: 'Ketersediaan lancar'
        },
        gula: {
          status: 'ada',
          periodePengiriman: '2 minggu sekali',
          sumberSupply: 'Perum Bulog Subdivre Bekasi',
          skemaKerjasama: 'beli_putus',
          keterangan: 'Gula Maniskita SNI'
        },
        obatObatan: {
          status: 'tidak_ada',
          periodePengiriman: '',
          sumberSupply: '',
          skemaKerjasama: '',
          keterangan: 'MoU dengan PBF dalam finalisasi legalitas'
        }
      },
      transaksi: {
        waktuOperasional: { rangeWaktu: '07.00 - 21.00 WIB', keterangan: 'Setiap hari buka' },
        nilaiTransaksiHarian: { rangeNilai: 'Rp 14.000.000 - Rp 21.000.000 / hari', keterangan: 'Ramai buruh pabrik dan petani' },
        produkPalingLaku: { rangeJumlah: 'Beras SPHP & Minyakita (150 paket gabungan)', keterangan: 'Paket sembako hemat' },
        produkKurangLaku: { namaProduk: 'Kecap botol ukuran 1 liter', keterangan: 'Lebih laris kemasan pouch refill' },
        mekanismeTransaksi: { pilihan: 'keduanya', keterangan: 'Tersedia QRIS BRImo/BCA dan uang tunai' },
        kendalaDanDukungan: {
          kendalaUtama: 'Kebutuhan tambahan rak display untuk menampung produk UMKM desa binaan',
          keterangan: 'Dukungan rak gondola tambahan dan display chiller minuman dingin'
        }
      }
    }
  },
  {
    id: 'kdkmp-006',
    kodeKDKMP: '53.15.KDKMP.019',
    namaLokasi: 'KDKMP Desa Labuan Bajo',
    provinsi: 'Nusa Tenggara Timur',
    kabupatenKota: 'Kabupaten Manggarai Barat',
    kecamatan: 'Kecamatan Komodo',
    desaKelurahan: 'Kelurahan Labuan Bajo',
    alamatLengkap: 'Jl. Waecicu No. 08, Labuan Bajo, Kab. Manggarai Barat',
    namaPetugas: 'Fransiskus Xaverius (Satgas Pendamping Lapangan NTT)',
    kontakPerson: 'Ignatius J (0812-4455-9988)',
    tanggalKunjungan: '2026-10-08',
    catatanTambahan: 'Kesiapan 48% (Belum Siap). Bangunan gerai masih persiapan partisi dan armada belum lengkap.',
    updatedAt: '2026-10-08T10:00:00Z',
    checklist: {
      fisikSarpras: {
        bangunanGudang: { status: 'ada', keterangan: 'Gudang sewa sementara 50 m2' },
        bangunanGerai: { status: 'ada', keterangan: 'Gerai dalam tahap pengecatan dan instalasi rak' },
        instalasiListrik: { status: 'ada', keterangan: 'PLN 2.200 VA' },
        instalasiAirBersih: { status: 'tidak_ada', keterangan: 'Saluran air bersih pipa induk sedang perbaikan' },
        fasilitasKlinik: { status: 'tidak_ada', keterangan: 'Belum dialokasikan ruangan' },
        rakObatApotek: { status: 'tidak_ada', keterangan: 'Belum tersedia' },
        saranaPrasarana: {
          rakDisplay: { status: 'tidak_ada', keterangan: 'Menunggu pengiriman dari Surabaya' },
          perangkatKasir: { status: 'ada', keterangan: '1 unit tablet POS Android' },
          truk6Ban: { status: 'tidak_ada', keterangan: 'Belum ada unit' },
          pickup4x4: { status: 'tidak_ada', keterangan: 'Belum ada unit' },
          motorBakRoda3: { status: 'ada', keterangan: '1 unit motor bak' },
          ac: { status: 'tidak_ada', keterangan: 'Belum terpasang' },
          apar: { status: 'tidak_ada', keterangan: 'Belum ada APAR' },
          cctv: { status: 'tidak_ada', keterangan: 'Belum ada CCTV' },
          kipasCeiling: { status: 'ada', keterangan: '1 kipas angin berdiri' },
          keranjangBelanja: { status: 'tidak_ada', keterangan: 'Belum tiba' },
          seragamKD: { status: 'ada', keterangan: 'Seragam sudah diterima' },
          papanNamaKD: { status: 'ada', keterangan: 'Papan nama kain banner terpasang' }
        }
      },
      sdm: {
        manajerKD: { status: 'ada', tanggalOnBoarding: '2026-10-01', keterangan: 'Stefanus N' },
        sdmRekrutmenAPN: { status: 'tidak_ada', masyarakatSekitar: 'ya', keterangan: 'Proses seleksi tahap 2 staf lokal' },
        koordinasiPengurusKades: {
          status: 'ada',
          mekanismeKoordinasi: 'Rapat awal pembentukan gerai KDKMP',
          tanggalKoordinasi: '2026-10-04',
          keterangan: 'Didukung oleh kelurahan setempat'
        },
        pembekalanManajer: {
          status: 'tidak_ada',
          tanggalPembekalan: '',
          keterangan: 'Jadwal pembekalan diagendakan bulan depan'
        }
      },
      sistem: {
        sistemStokBarang: { status: 'tidak_ada', keterangan: 'Belum setup sistem ERP' },
        sistemPemesananProduk: { status: 'tidak_ada', keterangan: 'Belum terhubung sistem' },
        sistemAbsensiPegawai: { status: 'tidak_ada', keterangan: 'Belum ada' }
      },
      produk: {
        lpg3kg: {
          status: 'ada',
          jumlahDiterima: '200 tabung',
          jumlahStok: '50 tabung',
          periodePengiriman: '1x seminggu',
          keterangan: 'Harga terkontrol di pulau'
        },
        pupukBersubsidi: {
          status: 'tidak_ada',
          jumlahDiterima: '0',
          jumlahStok: '0',
          periodePengiriman: '',
          keterangan: 'Wilayah perkotaan pariwisata'
        },
        berasSPHP: {
          status: 'ada',
          jumlahDiterima: '2.000 Kg',
          jumlahStok: '600 Kg',
          periodePengiriman: '2 minggu sekali dari Bulog Ruteng',
          keterangan: 'Sangat dibutuhkan warga dan UMKM warung makan'
        },
        minyakita: {
          status: 'ada',
          jumlahDiterima: '600 Liter',
          jumlahStok: '80 Liter',
          periodePengiriman: 'Dua mingguan',
          keterangan: 'Cepat laku'
        },
        gula: {
          status: 'tidak_ada',
          periodePengiriman: '',
          sumberSupply: '',
          skemaKerjasama: '',
          keterangan: 'Belum ada kontrak pengadaan gula'
        },
        obatObatan: {
          status: 'tidak_ada',
          periodePengiriman: '',
          sumberSupply: '',
          skemaKerjasama: '',
          keterangan: 'Belum tersedia'
        }
      },
      transaksi: {
        waktuOperasional: { rangeWaktu: '09.00 - 15.00 WITA', keterangan: 'Jam buka masa uji coba' },
        nilaiTransaksiHarian: { rangeNilai: 'Rp 2.500.000 - Rp 5.000.000 / hari', keterangan: 'Tahap pengenalan' },
        produkPalingLaku: { rangeJumlah: 'Beras SPHP 5kg', keterangan: 'Kebutuhan pokok rumah tangga' },
        produkKurangLaku: { namaProduk: '-', keterangan: 'Belum banyak varian komoditas' },
        mekanismeTransaksi: { pilihan: 'cash', keterangan: 'Hanya tunai' },
        kendalaDanDukungan: {
          kendalaUtama: 'Keterlambatan logistik ekspedisi kapal sarpras dari Surabaya dan biaya angkut tinggi',
          keterangan: 'Perlu percepatan distribusi rak display, komputer kasir, dan armada pickup KDKMP'
        }
      }
    }
  },
  {
    id: 'kdkmp-007',
    kodeKDKMP: '73.09.KDKMP.031',
    namaLokasi: 'KDKMP Desa Maros Sejahtera',
    provinsi: 'Sulawesi Selatan',
    kabupatenKota: 'Kabupaten Maros',
    kecamatan: 'Kecamatan Lau',
    desaKelurahan: 'Desa Maros Sejahtera',
    alamatLengkap: 'Jl. Poros Maros - Pangkep Km. 7, Desa Maros Sejahtera',
    namaPetugas: 'A. Muhammad Faisal, S.P (Satgas Regional Sulsel)',
    kontakPerson: 'Daeng Bella (0813-5566-7788)',
    tanggalKunjungan: '2026-10-17',
    catatanTambahan: 'Kesiapan 77% (Siap Bersyarat). Gudang dan produk subsidi sangat siap, klinik dalam proses perlengkapan.',
    updatedAt: '2026-10-17T15:20:00Z',
    checklist: {
      fisikSarpras: {
        bangunanGudang: { status: 'ada', keterangan: 'Gudang semi permanen luas 140 m2' },
        bangunanGerai: { status: 'ada', keterangan: 'Gerai seluas 70 m2' },
        instalasiListrik: { status: 'ada', keterangan: 'Listrik PLN 3.500 VA' },
        instalasiAirBersih: { status: 'ada', keterangan: 'PDAM lancar' },
        fasilitasKlinik: { status: 'tidak_ada', keterangan: 'Menunggu renovasi sekat ruangan' },
        rakObatApotek: { status: 'ada', keterangan: 'Rak obat aluminium terpasang' },
        saranaPrasarana: {
          rakDisplay: { status: 'ada', keterangan: '6 unit rak gondola' },
          perangkatKasir: { status: 'ada', keterangan: 'Komputer kasir & printer' },
          truk6Ban: { status: 'ada', keterangan: '1 unit truk 6 ban Mitsubishi Fuso' },
          pickup4x4: { status: 'tidak_ada', keterangan: 'Menggunakan pickup biasa 4x2' },
          motorBakRoda3: { status: 'ada', keterangan: '1 unit motor roda 3' },
          ac: { status: 'ada', keterangan: '1 unit AC 1.5 PK gerai' },
          apar: { status: 'ada', keterangan: '2 tabung APAR' },
          cctv: { status: 'ada', keterangan: '4 kamera CCTV' },
          kipasCeiling: { status: 'ada', keterangan: '2 kipas ceiling' },
          keranjangBelanja: { status: 'ada', keterangan: '15 keranjang belanja' },
          seragamKD: { status: 'ada', keterangan: 'Seragam lengkap 6 stel' },
          papanNamaKD: { status: 'ada', keterangan: 'Papan nama plang resmi KDKMP' }
        }
      },
      sdm: {
        manajerKD: { status: 'ada', tanggalOnBoarding: '2026-08-20', keterangan: 'Hasbullah Syam' },
        sdmRekrutmenAPN: { status: 'ada', masyarakatSekitar: 'ya', keterangan: '3 staf warga sekitar' },
        koordinasiPengurusKades: {
          status: 'ada',
          mekanismeKoordinasi: 'Rapat koordinasi dua mingguan',
          tanggalKoordinasi: '2026-10-11',
          keterangan: 'Koordinasi dengan pengurus Koperasi Unit Desa'
        },
        pembekalanManajer: {
          status: 'ada',
          tanggalPembekalan: '2026-09-02',
          keterangan: 'Telah mengikuti pembekalan manajemen KDKMP'
        }
      },
      sistem: {
        sistemStokBarang: { status: 'ada', keterangan: 'Aplikasi pembukuan digital' },
        sistemPemesananProduk: { status: 'ada', keterangan: 'Sistem PO via aplikasi KDKMP' },
        sistemAbsensiPegawai: { status: 'tidak_ada', keterangan: 'Absensi manual buku log' }
      },
      produk: {
        lpg3kg: {
          status: 'ada',
          jumlahDiterima: '500 tabung',
          jumlahStok: '130 tabung',
          periodePengiriman: '2x seminggu',
          keterangan: 'Alokasi aman untuk pangkalan binaan'
        },
        pupukBersubsidi: {
          status: 'ada',
          jumlahDiterima: '12 Ton (Urea & NPK Phonska)',
          jumlahStok: '3 Ton',
          periodePengiriman: 'Awal bulan',
          keterangan: 'Penebusan petani sawah irigasi Maros lancar'
        },
        berasSPHP: {
          status: 'ada',
          jumlahDiterima: '4.000 Kg',
          jumlahStok: '900 Kg',
          periodePengiriman: 'Setiap minggu',
          keterangan: 'Beras kemasan 5kg'
        },
        minyakita: {
          status: 'ada',
          jumlahDiterima: '1.200 Liter',
          jumlahStok: '280 Liter',
          periodePengiriman: 'Dua mingguan',
          keterangan: 'Kemasan bantal dan pouch'
        },
        gula: {
          status: 'ada',
          periodePengiriman: 'Bulanan',
          sumberSupply: 'PTPN XIV Sulsel',
          skemaKerjasama: 'beli_putus',
          keterangan: 'Gula pasir kristal putih'
        },
        obatObatan: {
          status: 'tidak_ada',
          periodePengiriman: '',
          sumberSupply: '',
          skemaKerjasama: '',
          keterangan: 'Menunggu kerjasama dengan apotek jejaring'
        }
      },
      transaksi: {
        waktuOperasional: { rangeWaktu: '07.30 - 19.30 WITA', keterangan: 'Buka setiap hari' },
        nilaiTransaksiHarian: { rangeNilai: 'Rp 11.000.000 - Rp 18.000.000 / hari', keterangan: 'Ramai di pagi hari' },
        produkPalingLaku: { rangeJumlah: 'Pupuk Subsidi dan Beras SPHP', keterangan: 'Kawasan pertanian produktif' },
        produkKurangLaku: { namaProduk: 'Sabun pembersih lantai galon besar', keterangan: 'Kemasan terlalu besar untuk konsumsi harian' },
        mekanismeTransaksi: { pilihan: 'keduanya', keterangan: '70% Tunai, 30% QRIS Bank Sulselbar & BRI' },
        kendalaDanDukungan: {
          kendalaUtama: 'Truk pengangkut pupuk terkadang terhambat jembatan timbang pada saat musim panen',
          keterangan: 'Dukungan koordinasi jalur logistik komoditas pertanian dengan Dinas Perhubungan'
        }
      }
    }
  }
];

export const INDONESIA_PROVINCES = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Banten',
  'Jawa Tengah',
  'D.I. Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Gorontalo',
  'Sulawesi Tengah',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Barat Daya'
];

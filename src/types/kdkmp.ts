export type CheckStatus = 'ada' | 'tidak_ada';
export type YesNoStatus = 'ya' | 'tidak' | '';
export type SkemaKerjasama = 'konsinyasi' | 'beli_putus' | '';
export type MekanismeTransaksiPilihan = 'cash' | 'cashless' | 'keduanya' | '';

export interface SaranaPrasaranaDetail {
  rakDisplay: { status: CheckStatus; keterangan: string };
  perangkatKasir: { status: CheckStatus; keterangan: string }; // termasuk software
  truk6Ban: { status: CheckStatus; keterangan: string };
  pickup4x4: { status: CheckStatus; keterangan: string };
  motorBakRoda3: { status: CheckStatus; keterangan: string };
  ac: { status: CheckStatus; keterangan: string };
  apar: { status: CheckStatus; keterangan: string };
  cctv: { status: CheckStatus; keterangan: string };
  kipasCeiling: { status: CheckStatus; keterangan: string };
  keranjangBelanja: { status: CheckStatus; keterangan: string };
  seragamKD: { status: CheckStatus; keterangan: string };
  papanNamaKD: { status: CheckStatus; keterangan: string };
}

export interface KelengkapanFisikSarpras {
  bangunanGudang: { status: CheckStatus; keterangan: string }; // termasuk penyimpanan LPG 3kg & pupuk
  bangunanGerai: { status: CheckStatus; keterangan: string };
  instalasiListrik: { status: CheckStatus; keterangan: string };
  instalasiAirBersih: { status: CheckStatus; keterangan: string };
  fasilitasKlinik: { status: CheckStatus; keterangan: string };
  rakObatApotek: { status: CheckStatus; keterangan: string };
  saranaPrasarana: SaranaPrasaranaDetail;
}

export interface KelengkapanSDM {
  manajerKD: {
    status: CheckStatus;
    tanggalOnBoarding: string;
    keterangan: string;
  };
  sdmRekrutmenAPN: {
    status: CheckStatus;
    masyarakatSekitar: YesNoStatus;
    keterangan: string;
  };
  koordinasiPengurusKades: {
    status: CheckStatus;
    mekanismeKoordinasi: string;
    tanggalKoordinasi: string;
    keterangan: string;
  };
  pembekalanManajer: {
    status: CheckStatus;
    tanggalPembekalan: string;
    keterangan: string;
  };
}

export interface KelengkapanSistem {
  sistemStokBarang: { status: CheckStatus; keterangan: string };
  sistemPemesananProduk: { status: CheckStatus; keterangan: string };
  sistemAbsensiPegawai: { status: CheckStatus; keterangan: string };
}

export interface ProdukSubsidiItem {
  status: CheckStatus;
  jumlahDiterima: string;
  jumlahStok: string;
  periodePengiriman: string;
  keterangan: string;
}

export interface ProdukNonSubsidiItem {
  status: CheckStatus;
  periodePengiriman: string;
  sumberSupply: string;
  skemaKerjasama: SkemaKerjasama;
  keterangan: string;
}

export interface KelengkapanProduk {
  lpg3kg: ProdukSubsidiItem;
  pupukBersubsidi: ProdukSubsidiItem;
  berasSPHP: ProdukSubsidiItem;
  minyakita: ProdukSubsidiItem;
  gula: ProdukNonSubsidiItem;
  obatObatan: ProdukNonSubsidiItem;
}

export interface PeninjauanTransaksiGerai {
  waktuOperasional: {
    rangeWaktu: string;
    keterangan: string;
  };
  nilaiTransaksiHarian: {
    rangeNilai: string;
    keterangan: string;
  };
  produkPalingLaku: {
    rangeJumlah: string;
    keterangan: string;
  };
  produkKurangLaku: {
    namaProduk: string;
    keterangan: string;
  };
  mekanismeTransaksi: {
    pilihan: MekanismeTransaksiPilihan;
    keterangan: string;
  };
  kendalaDanDukungan: {
    kendalaUtama: string;
    keterangan: string; // bentuk dukungan yang diperlukan
  };
}

export interface KDKMPChecklist {
  fisikSarpras: KelengkapanFisikSarpras;
  sdm: KelengkapanSDM;
  sistem: KelengkapanSistem;
  produk: KelengkapanProduk;
  transaksi: PeninjauanTransaksiGerai;
}

export interface KDKMPLocation {
  id: string;
  kodeKDKMP: string;
  namaLokasi: string;
  provinsi: string;
  kabupatenKota: string;
  kecamatan: string;
  desaKelurahan: string;
  alamatLengkap: string;
  namaPetugas: string;
  kontakPerson: string;
  tanggalKunjungan: string;
  catatanTambahan?: string;
  latitude?: number;
  longitude?: number;
  checklist: KDKMPChecklist;
  updatedAt: string;
}

export interface ReadinessScore {
  totalItems: number;
  adaItems: number;
  percentage: number;
  status: 'Sangat Siap' | 'Siap Bersyarat' | 'Belum Siap';
  fisikScore: { total: number; ada: number; pct: number };
  sdmScore: { total: number; ada: number; pct: number };
  sistemScore: { total: number; ada: number; pct: number };
  produkScore: { total: number; ada: number; pct: number };
  transaksiCompleted: boolean;
}

export function calculateReadiness(checklist: KDKMPChecklist): ReadinessScore {
  // Fisik: 6 utama + 12 sarpras = 18
  const f = checklist.fisikSarpras;
  const s = checklist.fisikSarpras.saranaPrasarana;
  let fAda = 0;
  if (f.bangunanGudang.status === 'ada') fAda++;
  if (f.bangunanGerai.status === 'ada') fAda++;
  if (f.instalasiListrik.status === 'ada') fAda++;
  if (f.instalasiAirBersih.status === 'ada') fAda++;
  if (f.fasilitasKlinik.status === 'ada') fAda++;
  if (f.rakObatApotek.status === 'ada') fAda++;
  
  if (s.rakDisplay.status === 'ada') fAda++;
  if (s.perangkatKasir.status === 'ada') fAda++;
  if (s.truk6Ban.status === 'ada') fAda++;
  if (s.pickup4x4.status === 'ada') fAda++;
  if (s.motorBakRoda3.status === 'ada') fAda++;
  if (s.ac.status === 'ada') fAda++;
  if (s.apar.status === 'ada') fAda++;
  if (s.cctv.status === 'ada') fAda++;
  if (s.kipasCeiling.status === 'ada') fAda++;
  if (s.keranjangBelanja.status === 'ada') fAda++;
  if (s.seragamKD.status === 'ada') fAda++;
  if (s.papanNamaKD.status === 'ada') fAda++;
  const fTotal = 18;

  // SDM: 4
  const sdm = checklist.sdm;
  let sdmAda = 0;
  if (sdm.manajerKD.status === 'ada') sdmAda++;
  if (sdm.sdmRekrutmenAPN.status === 'ada') sdmAda++;
  if (sdm.koordinasiPengurusKades.status === 'ada') sdmAda++;
  if (sdm.pembekalanManajer.status === 'ada') sdmAda++;
  const sdmTotal = 4;

  // Sistem: 3
  const sis = checklist.sistem;
  let sisAda = 0;
  if (sis.sistemStokBarang.status === 'ada') sisAda++;
  if (sis.sistemPemesananProduk.status === 'ada') sisAda++;
  if (sis.sistemAbsensiPegawai.status === 'ada') sisAda++;
  const sisTotal = 3;

  // Produk: 4 subsidi + 2 non-subsidi = 6
  const p = checklist.produk;
  let pAda = 0;
  if (p.lpg3kg.status === 'ada') pAda++;
  if (p.pupukBersubsidi.status === 'ada') pAda++;
  if (p.berasSPHP.status === 'ada') pAda++;
  if (p.minyakita.status === 'ada') pAda++;
  if (p.gula.status === 'ada') pAda++;
  if (p.obatObatan.status === 'ada') pAda++;
  const pTotal = 6;

  const totalItems = fTotal + sdmTotal + sisTotal + pTotal; // 31
  const adaItems = fAda + sdmAda + sisAda + pAda;
  const percentage = Math.round((adaItems / totalItems) * 100);

  let status: 'Sangat Siap' | 'Siap Bersyarat' | 'Belum Siap' = 'Belum Siap';
  if (percentage >= 85) {
    status = 'Sangat Siap';
  } else if (percentage >= 60) {
    status = 'Siap Bersyarat';
  } else {
    status = 'Belum Siap';
  }

  const tr = checklist.transaksi;
  const transaksiCompleted = Boolean(
    tr.waktuOperasional.rangeWaktu &&
    tr.nilaiTransaksiHarian.rangeNilai &&
    tr.mekanismeTransaksi.pilihan
  );

  return {
    totalItems,
    adaItems,
    percentage,
    status,
    fisikScore: { total: fTotal, ada: fAda, pct: Math.round((fAda / fTotal) * 100) },
    sdmScore: { total: sdmTotal, ada: sdmAda, pct: Math.round((sdmAda / sdmTotal) * 100) },
    sistemScore: { total: sisTotal, ada: sisAda, pct: Math.round((sisAda / sisTotal) * 100) },
    produkScore: { total: pTotal, ada: pAda, pct: Math.round((pAda / pTotal) * 100) },
    transaksiCompleted,
  };
}

export function createEmptyChecklist(): KDKMPChecklist {
  return {
    fisikSarpras: {
      bangunanGudang: { status: 'tidak_ada', keterangan: '' },
      bangunanGerai: { status: 'tidak_ada', keterangan: '' },
      instalasiListrik: { status: 'tidak_ada', keterangan: '' },
      instalasiAirBersih: { status: 'tidak_ada', keterangan: '' },
      fasilitasKlinik: { status: 'tidak_ada', keterangan: '' },
      rakObatApotek: { status: 'tidak_ada', keterangan: '' },
      saranaPrasarana: {
        rakDisplay: { status: 'tidak_ada', keterangan: '' },
        perangkatKasir: { status: 'tidak_ada', keterangan: '' },
        truk6Ban: { status: 'tidak_ada', keterangan: '' },
        pickup4x4: { status: 'tidak_ada', keterangan: '' },
        motorBakRoda3: { status: 'tidak_ada', keterangan: '' },
        ac: { status: 'tidak_ada', keterangan: '' },
        apar: { status: 'tidak_ada', keterangan: '' },
        cctv: { status: 'tidak_ada', keterangan: '' },
        kipasCeiling: { status: 'tidak_ada', keterangan: '' },
        keranjangBelanja: { status: 'tidak_ada', keterangan: '' },
        seragamKD: { status: 'tidak_ada', keterangan: '' },
        papanNamaKD: { status: 'tidak_ada', keterangan: '' },
      },
    },
    sdm: {
      manajerKD: { status: 'tidak_ada', tanggalOnBoarding: '', keterangan: '' },
      sdmRekrutmenAPN: { status: 'tidak_ada', masyarakatSekitar: '', keterangan: '' },
      koordinasiPengurusKades: { status: 'tidak_ada', mekanismeKoordinasi: '', tanggalKoordinasi: '', keterangan: '' },
      pembekalanManajer: { status: 'tidak_ada', tanggalPembekalan: '', keterangan: '' },
    },
    sistem: {
      sistemStokBarang: { status: 'tidak_ada', keterangan: '' },
      sistemPemesananProduk: { status: 'tidak_ada', keterangan: '' },
      sistemAbsensiPegawai: { status: 'tidak_ada', keterangan: '' },
    },
    produk: {
      lpg3kg: { status: 'tidak_ada', jumlahDiterima: '', jumlahStok: '', periodePengiriman: '', keterangan: '' },
      pupukBersubsidi: { status: 'tidak_ada', jumlahDiterima: '', jumlahStok: '', periodePengiriman: '', keterangan: '' },
      berasSPHP: { status: 'tidak_ada', jumlahDiterima: '', jumlahStok: '', periodePengiriman: '', keterangan: '' },
      minyakita: { status: 'tidak_ada', jumlahDiterima: '', jumlahStok: '', periodePengiriman: '', keterangan: '' },
      gula: { status: 'tidak_ada', periodePengiriman: '', sumberSupply: '', skemaKerjasama: '', keterangan: '' },
      obatObatan: { status: 'tidak_ada', periodePengiriman: '', sumberSupply: '', skemaKerjasama: '', keterangan: '' },
    },
    transaksi: {
      waktuOperasional: { rangeWaktu: '', keterangan: '' },
      nilaiTransaksiHarian: { rangeNilai: '', keterangan: '' },
      produkPalingLaku: { rangeJumlah: '', keterangan: '' },
      produkKurangLaku: { namaProduk: '', keterangan: '' },
      mekanismeTransaksi: { pilihan: '', keterangan: '' },
      kendalaDanDukungan: { kendalaUtama: '', keterangan: '' },
    },
  };
}

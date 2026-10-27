import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';

export function buildOfficialChecklistPdfDoc(location: KDKMPLocation): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cl = location.checklist;
  const f = cl.fisikSarpras;
  const s = f.saranaPrasarana;
  const sdm = cl.sdm;
  const sis = cl.sistem;
  const p = cl.produk;
  const tr = cl.transaksi;

  const checkMark = (isAda: boolean) => (isAda ? '[\u2713] Ada   [ ] Tidak Ada' : '[ ] Ada   [\u2713] Tidak Ada');
  const emptyCheck = () => '[ ] Ada   [ ] Tidak Ada';

  // --- PAGE 1 ---
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('List Checklist Kesiapan Operasionalisasi KDKMP', 105, 18, { align: 'center' });

  // Subheaders
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Lokasi KDKMP : ${location.namaLokasi || '-'} (${location.kodeKDKMP || '-'}) - ${location.desaKelurahan}, ${location.kecamatan}, ${location.kabupatenKota}, ${location.provinsi}`, 14, 27);
  doc.text(`Tanggal Kunjungan : ${location.tanggalKunjungan || '-'}   |   Petugas Peninjau : ${location.namaPetugas || '-'}`, 14, 33);

  // Table 1: Kelengkapan Fisik serta Sarana dan Prasarana
  const fisikRows: any[] = [
    [
      { content: 'Kelengkapan Fisik serta Sarana dan Prasarana', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 243, 246], textColor: [20, 20, 20] } }
    ],
    ['1', 'Ketersediaan Bangunan Gudang (termasuk tempat penyimpanan LPG 3 Kg dan Pupuk Bersubsidi)', checkMark(f.bangunanGudang.status === 'ada'), f.bangunanGudang.keterangan || '-'],
    ['2', 'Ketersediaan Bangunan Gerai', checkMark(f.bangunanGerai.status === 'ada'), f.bangunanGerai.keterangan || '-'],
    ['3', 'Ketersediaan Instalasi Listrik', checkMark(f.instalasiListrik.status === 'ada'), f.instalasiListrik.keterangan || '-'],
    ['4', 'Ketersediaan Instalasi Air Bersih', checkMark(f.instalasiAirBersih.status === 'ada'), f.instalasiAirBersih.keterangan || '-'],
    ['5', 'Ketersediaan Fasilitas Klinik', checkMark(f.fasilitasKlinik.status === 'ada'), f.fasilitasKlinik.keterangan || '-'],
    ['6', 'Ketersediaan Rak Obat-obatan / Apotek', checkMark(f.rakObatApotek.status === 'ada'), f.rakObatApotek.keterangan || '-'],
    [
      { content: '7', rowSpan: 12 },
      { content: 'Ketersediaan Sarana dan Prasarana', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [248, 249, 250] } }
    ],
    ['', '  - Rak display', checkMark(s.rakDisplay.status === 'ada'), s.rakDisplay.keterangan || '-'],
    ['', '  - Perangkat Kasir (termasuk software)', checkMark(s.perangkatKasir.status === 'ada'), s.perangkatKasir.keterangan || '-'],
    ['', '  - Truk 6 Ban', checkMark(s.truk6Ban.status === 'ada'), s.truk6Ban.keterangan || '-'],
    ['', '  - Pickup 4x4', checkMark(s.pickup4x4.status === 'ada'), s.pickup4x4.keterangan || '-'],
    ['', '  - Motor bak roda 3', checkMark(s.motorBakRoda3.status === 'ada'), s.motorBakRoda3.keterangan || '-'],
    ['', '  - Air Conditioner (AC)', checkMark(s.ac.status === 'ada'), s.ac.keterangan || '-'],
    ['', '  - Alat Pemadam Api Ringan (APAR)', checkMark(s.apar.status === 'ada'), s.apar.keterangan || '-'],
    ['', '  - CCTV', checkMark(s.cctv.status === 'ada'), s.cctv.keterangan || '-'],
    ['', '  - Kipas Ceiling', checkMark(s.kipasCeiling.status === 'ada'), s.kipasCeiling.keterangan || '-'],
    ['', '  - Keranjang Belanja', checkMark(s.keranjangBelanja.status === 'ada'), s.keranjangBelanja.keterangan || '-'],
    ['', '  - Seragam KD/KMP', checkMark(s.seragamKD.status === 'ada'), s.seragamKD.keterangan || '-'],
    ['', '  - Papan Nama KD/KMP', checkMark(s.papanNamaKD.status === 'ada'), s.papanNamaKD.keterangan || '-'],
    // Kelengkapan SDM
    [
      { content: 'Kelengkapan SDM', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 243, 246], textColor: [20, 20, 20] } }
    ],
    [
      '1',
      'Ketersediaan Manajer KD/KMP',
      checkMark(sdm.manajerKD.status === 'ada'),
      `Tanggal on boarding Manajer KD/KMP : ${sdm.manajerKD.tanggalOnBoarding || '-'}\n${sdm.manajerKD.keterangan ? 'Ket: ' + sdm.manajerKD.keterangan : ''}`.trim()
    ],
    [
      '2',
      'Ketersediaan SDM rekrutmen APN',
      checkMark(sdm.sdmRekrutmenAPN.status === 'ada'),
      `SDM merupakan masyarakat sekitar KD/KMP : ${sdm.sdmRekrutmenAPN.masyarakatSekitar || '-'}\n${sdm.sdmRekrutmenAPN.keterangan ? 'Ket: ' + sdm.sdmRekrutmenAPN.keterangan : ''}`.trim()
    ],
    [
      '3',
      'Terlaksananya koordinasi dengan Pengurus KD/KMP dan/atau Kepala Desa',
      checkMark(sdm.koordinasiPengurusKades.status === 'ada'),
      `Mekanisme koordinasi : ${sdm.koordinasiPengurusKades.mekanismeKoordinasi || '-'}\nTanggal pelaksanaan koordinasi : ${sdm.koordinasiPengurusKades.tanggalKoordinasi || '-'}\n${sdm.koordinasiPengurusKades.keterangan ? 'Ket: ' + sdm.koordinasiPengurusKades.keterangan : ''}`.trim()
    ],
    [
      '4',
      'Manajer telah menerima pembekalan dan transfer knowledge kepada Pengurus Koperasi Pasca 2 Tahun',
      checkMark(sdm.pembekalanManajer.status === 'ada'),
      `Tanggal pelaksanaan pembekalan Manajer KD/KMP : ${sdm.pembekalanManajer.tanggalPembekalan || '-'}\n${sdm.pembekalanManajer.keterangan ? 'Ket: ' + sdm.pembekalanManajer.keterangan : ''}`.trim()
    ],
    // Kelengkapan Sistem
    [
      { content: 'Kelengkapan Sistem', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 243, 246], textColor: [20, 20, 20] } }
    ],
    ['1', 'Sistem pemantauan stock barang', checkMark(sis.sistemStokBarang.status === 'ada'), sis.sistemStokBarang.keterangan || '-'],
    ['2', 'Sistem pemesanan produk', checkMark(sis.sistemPemesananProduk.status === 'ada'), sis.sistemPemesananProduk.keterangan || '-'],
    ['3', 'Sistem absensi pegawai', checkMark(sis.sistemAbsensiPegawai.status === 'ada'), sis.sistemAbsensiPegawai.keterangan || '-']
  ];

  autoTable(doc, {
    startY: 37,
    head: [
      [
        { content: 'A. Peninjauan Gudang dan Gerai', colSpan: 4, styles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ],
      ['No', 'Indikator', 'Checklist', 'Keterangan']
    ],
    body: fisikRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      textColor: [40, 40, 40],
      lineColor: [180, 180, 180],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [225, 231, 239],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 78 },
      2: { cellWidth: 38 },
      3: { cellWidth: 58 }
    },
    margin: { left: 13, right: 13 }
  });

  // Footer page 1
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Halaman 1 dari 2 - Checklist Kesiapan Operasionalisasi KDKMP', 105, 290, { align: 'center' });

  // --- PAGE 2 ---
  doc.addPage();

  // Page 2 Table Header
  const produkRows: any[] = [
    [
      { content: 'Kelengkapan Produk', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 243, 246] } }
    ],
    [
      { content: '1', rowSpan: 3 },
      { content: 'Ketersediaan Produksi Subsidi', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [248, 249, 250] } }
    ],
    [
      '  - LPG 3 kg',
      checkMark(p.lpg3kg.status === 'ada'),
      `Jumlah yang sudah diterima : ${p.lpg3kg.jumlahDiterima || '-'}\nJumlah stok : ${p.lpg3kg.jumlahStok || '-'}\nPeriode Pengiriman : ${p.lpg3kg.periodePengiriman || '-'}`
    ],
    [
      '  - Pupuk Bersubsidi',
      checkMark(p.pupukBersubsidi.status === 'ada'),
      `Jumlah yang sudah diterima : ${p.pupukBersubsidi.jumlahDiterima || '-'}\nJumlah stok : ${p.pupukBersubsidi.jumlahStok || '-'}\nPeriode Pengiriman : ${p.pupukBersubsidi.periodePengiriman || '-'}`
    ],
    [
      '',
      '  - Beras SPHP',
      checkMark(p.berasSPHP.status === 'ada'),
      `Jumlah yang sudah diterima : ${p.berasSPHP.jumlahDiterima || '-'}\nJumlah stok : ${p.berasSPHP.jumlahStok || '-'}\nPeriode Pengiriman : ${p.berasSPHP.periodePengiriman || '-'}`
    ],
    [
      '2',
      'Ketersediaan Produk Minyakita',
      checkMark(p.minyakita.status === 'ada'),
      `Jumlah yang sudah diterima : ${p.minyakita.jumlahDiterima || '-'}\nJumlah stok : ${p.minyakita.jumlahStok || '-'}\nPeriode Pengiriman : ${p.minyakita.periodePengiriman || '-'}`
    ],
    [
      { content: '3', rowSpan: 3 },
      { content: 'Ketersediaan Produk Non Subsidi', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [248, 249, 250] } }
    ],
    [
      '  Gula',
      checkMark(p.gula.status === 'ada'),
      `Periode Pengiriman : ${p.gula.periodePengiriman || '-'}\nSumber supply produk : ${p.gula.sumberSupply || '-'}\nSkema kerja sama : ${p.gula.skemaKerjasama ? (p.gula.skemaKerjasama === 'beli_putus' ? 'beli putus' : 'konsinyasi') : '-'}`
    ],
    [
      '  Obat-obatan',
      checkMark(p.obatObatan.status === 'ada'),
      `Periode Pengiriman : ${p.obatObatan.periodePengiriman || '-'}\nSumber supply produk : ${p.obatObatan.sumberSupply || '-'}\nSkema kerja sama : ${p.obatObatan.skemaKerjasama ? (p.obatObatan.skemaKerjasama === 'beli_putus' ? 'beli putus' : 'konsinyasi') : '-'}`
    ]
  ];

  autoTable(doc, {
    startY: 18,
    head: [
      [
        { content: 'A. Peninjauan Gudang dan Gerai (Lanjutan)', colSpan: 4, styles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ],
      ['No', 'Indikator', 'Checklist', 'Keterangan']
    ],
    body: produkRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [40, 40, 40],
      lineColor: [180, 180, 180],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [225, 231, 239],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 68 },
      2: { cellWidth: 38 },
      3: { cellWidth: 68 }
    },
    margin: { left: 13, right: 13 }
  });

  const lastY = (doc as any).lastAutoTable.finalY + 8;

  // Section B: Peninjauan Transaksi Gerai
  const transaksiRows: any[] = [
    [
      '1',
      'Waktu Operasional KD/KMP',
      tr.waktuOperasional.rangeWaktu || '(range waktu)',
      tr.waktuOperasional.keterangan || '(keterangan)'
    ],
    [
      '2',
      'Nilai transaksi harian',
      tr.nilaiTransaksiHarian.rangeNilai || '(range nilai)',
      tr.nilaiTransaksiHarian.keterangan || '(keterangan)'
    ],
    [
      '3',
      'Jenis produk yang paling laku terjual',
      tr.produkPalingLaku.rangeJumlah || '(range jumlah)',
      tr.produkPalingLaku.keterangan || '(keterangan)'
    ],
    [
      '4',
      'Jenis produk yang kurang laku terjual',
      tr.produkKurangLaku.namaProduk || '(nama produk)',
      tr.produkKurangLaku.keterangan || '(keterangan)'
    ],
    [
      '5',
      'Mekanisme transaksi (cash/cashless)',
      tr.mekanismeTransaksi.pilihan || '(cash/cashless)',
      tr.mekanismeTransaksi.keterangan || '(keterangan)'
    ],
    [
      '6',
      'Kendala yang dialami dan bentuk dukungan yang diperlukan dalam operasionalisasi KD/KMP',
      tr.kendalaDanDukungan.kendalaUtama || '(kendala utama)',
      tr.kendalaDanDukungan.keterangan || '(keterangan dukungan yang diperlukan)'
    ]
  ];

  autoTable(doc, {
    startY: lastY,
    head: [
      [
        { content: 'B. Peninjauan Transaksi Gerai', colSpan: 4, styles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ],
      ['No', 'Indikator', 'Parameter / Nilai', 'Keterangan']
    ],
    body: transaksiRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [40, 40, 40],
      lineColor: [180, 180, 180],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [225, 231, 239],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 68 },
      2: { cellWidth: 48 },
      3: { cellWidth: 58 }
    },
    margin: { left: 13, right: 13 }
  });

  const signY = (doc as any).lastAutoTable.finalY + 12;

  // Signature Block
  if (signY < 265) {
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    doc.text(`Mengetahui,`, 30, signY);
    doc.text(`Pengurus / Manajer KDKMP`, 30, signY + 5);
    doc.text(`( .................................................. )`, 30, signY + 25);
    doc.text(`Nama: ${location.kontakPerson.split('(')[0]?.trim() || '.......................'}`, 30, signY + 30);

    doc.text(`${location.kabupatenKota || 'Wilayah'}, ${location.tanggalKunjungan || '....................'}`, 130, signY);
    doc.text(`Petugas Surveyor / Peninjau`, 130, signY + 5);
    doc.text(`( .................................................. )`, 130, signY + 25);
    doc.text(`Nama: ${location.namaPetugas || '.......................'}`, 130, signY + 30);
  }

  // Footer page 2
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Halaman 2 dari 2 - Checklist Kesiapan Operasionalisasi KDKMP', 105, 290, { align: 'center' });

  return doc;
}

export function getOfficialChecklistPdfFileName(location: KDKMPLocation): string {
  return `Checklist_Kesiapan_${location.kodeKDKMP || 'KDKMP'}_${location.namaLokasi.replace(/\s+/g, '_')}.pdf`;
}

export function exportOfficialChecklistPdf(location: KDKMPLocation): void {
  const doc = buildOfficialChecklistPdfDoc(location);
  const filename = getOfficialChecklistPdfFileName(location);
  doc.save(filename);
}

export function generateOfficialChecklistPdfBlob(location: KDKMPLocation): { blob: Blob; filename: string } {
  const doc = buildOfficialChecklistPdfDoc(location);
  const filename = getOfficialChecklistPdfFileName(location);
  const blob = doc.output('blob');
  return { blob, filename };
}

export function exportBlankChecklistPdf(): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('a');
    link.href = '/assets/aistudio/Formulir_Kosong_Checklist_Kesiapan_KDKMP_54f73565.pdf';
    link.download = 'Formulir_Kosong_Checklist_Kesiapan_KDKMP.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const blankLocation: KDKMPLocation = {
    id: 'blank',
    kodeKDKMP: '..........................',
    namaLokasi: '....................................................',
    provinsi: '..........................',
    kabupatenKota: '..........................',
    kecamatan: '..........................',
    desaKelurahan: '..........................',
    alamatLengkap: '.......................................................................................',
    namaPetugas: '....................................................',
    kontakPerson: '....................................................',
    tanggalKunjungan: '...... / ...... / 202...',
    updatedAt: '',
    checklist: {
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
          papanNamaKD: { status: 'tidak_ada', keterangan: '' }
        }
      },
      sdm: {
        manajerKD: { status: 'tidak_ada', tanggalOnBoarding: '', keterangan: '' },
        sdmRekrutmenAPN: { status: 'tidak_ada', masyarakatSekitar: '', keterangan: '' },
        koordinasiPengurusKades: { status: 'tidak_ada', mekanismeKoordinasi: '', tanggalKoordinasi: '', keterangan: '' },
        pembekalanManajer: { status: 'tidak_ada', tanggalPembekalan: '', keterangan: '' }
      },
      sistem: {
        sistemStokBarang: { status: 'tidak_ada', keterangan: '' },
        sistemPemesananProduk: { status: 'tidak_ada', keterangan: '' },
        sistemAbsensiPegawai: { status: 'tidak_ada', keterangan: '' }
      },
      produk: {
        lpg3kg: { status: 'tidak_ada', jumlahDiterima: '', jumlahStok: '', periodePengiriman: '', keterangan: '' },
        pupukBersubsidi: { status: 'tidak_ada', jumlahDiterima: '', jumlahStok: '', periodePengiriman: '', keterangan: '' },
        berasSPHP: { status: 'tidak_ada', jumlahDiterima: '', jumlahStok: '', periodePengiriman: '', keterangan: '' },
        minyakita: { status: 'tidak_ada', jumlahDiterima: '', jumlahStok: '', periodePengiriman: '', keterangan: '' },
        gula: { status: 'tidak_ada', periodePengiriman: '', sumberSupply: '', skemaKerjasama: '', keterangan: '' },
        obatObatan: { status: 'tidak_ada', periodePengiriman: '', sumberSupply: '', skemaKerjasama: '', keterangan: '' }
      },
      transaksi: {
        waktuOperasional: { rangeWaktu: '', keterangan: '' },
        nilaiTransaksiHarian: { rangeNilai: '', keterangan: '' },
        produkPalingLaku: { rangeJumlah: '', keterangan: '' },
        produkKurangLaku: { namaProduk: '', keterangan: '' },
        mekanismeTransaksi: { pilihan: '', keterangan: '' },
        kendalaDanDukungan: { kendalaUtama: '', keterangan: '' }
      }
    }
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const emptyCheckbox = '[  ] Ada    [  ] Tidak Ada';

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('List Checklist Kesiapan Operasionalisasi KDKMP', 105, 18, { align: 'center' });

  // Subheaders
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Lokasi KDKMP: ____________________________________________________________________', 14, 27);
  doc.text('Tanggal Kunjungan: _____________________       Petugas Peninjau: _________________________________', 14, 33);

  const blankFisikRows: any[] = [
    [
      { content: 'Kelengkapan Fisik serta Sarana dan Prasarana', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 243, 246] } }
    ],
    ['1', 'Ketersediaan Bangunan Gudang (termasuk tempat penyimpanan LPG 3 Kg dan Pupuk Bersubsidi)', emptyCheckbox, ''],
    ['2', 'Ketersediaan Bangunan Gerai', emptyCheckbox, ''],
    ['3', 'Ketersediaan Instalasi Listrik', emptyCheckbox, ''],
    ['4', 'Ketersediaan Instalasi Air Bersih', emptyCheckbox, ''],
    ['5', 'Ketersediaan Fasilitas Klinik', emptyCheckbox, ''],
    ['6', 'Ketersediaan Rak Obat-obatan / Apotek', emptyCheckbox, ''],
    [
      { content: '7', rowSpan: 12 },
      { content: 'Ketersediaan Sarana dan Prasarana', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [248, 249, 250] } }
    ],
    ['', '  - Rak display', emptyCheckbox, ''],
    ['', '  - Perangkat Kasir (termasuk software )', emptyCheckbox, ''],
    ['', '  - Truk 6 Ban', emptyCheckbox, ''],
    ['', '  - Pickup 4x4', emptyCheckbox, ''],
    ['', '  - Motor bak roda 3', emptyCheckbox, ''],
    ['', '  - Air Conditioner (AC)', emptyCheckbox, ''],
    ['', '  - Alat Pemadam Api Ringan (APAR)', emptyCheckbox, ''],
    ['', '  - CCTV', emptyCheckbox, ''],
    ['', '  - Kipas Ceiling', emptyCheckbox, ''],
    ['', '  - Keranjang Belanja', emptyCheckbox, ''],
    ['', '  - Seragam KD/KMP', emptyCheckbox, ''],
    ['', '  - Papan Nama KD/KMP', emptyCheckbox, ''],
    [
      { content: 'Kelengkapan SDM', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 243, 246] } }
    ],
    ['1', 'Ketersediaan Manajer KD/KMP', emptyCheckbox, 'Tanggal on boarding Manajer KD/KMP : '],
    ['2', 'Ketersediaan SDM rekrutmen APN', emptyCheckbox, 'SDM merupakan masyarakat sekitar\nKD/KMP : ya / tidak'],
    ['3', 'Terlaksananya koordinasi dengan Pengurus KD/KMP dan/atau Kepala Desa', emptyCheckbox, 'Mekanisme koordinasi : \nTanggal pelaksanaan koordinasi : '],
    ['4', 'Manajer telah menerima pembekalan dan transfer knowledge kepada Pengurus Koperasi Pasca 2 Tahun', emptyCheckbox, 'Tanggal pelaksanaan pembekalan Manajer KD/KMP : '],
    [
      { content: 'Kelengkapan Sistem', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 243, 246] } }
    ],
    ['1', 'Sistem pemantauan stock barang', emptyCheckbox, ''],
    ['2', 'Sistem pemesanan produk', emptyCheckbox, ''],
    ['3', 'Sistem absensi pegawai', emptyCheckbox, '']
  ];

  autoTable(doc, {
    startY: 37,
    head: [
      [
        { content: 'A. Peninjauan Gudang dan Gerai', colSpan: 4, styles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ],
      ['No', 'Indikator', 'Checklist', 'Keterangan']
    ],
    body: blankFisikRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      lineColor: [180, 180, 180],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [225, 231, 239],
      textColor: [30, 41, 59],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 78 },
      2: { cellWidth: 38 },
      3: { cellWidth: 58 }
    },
    margin: { left: 13, right: 13 }
  });

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Halaman 1 dari 2 - Formulir Kosong Checklist KDKMP', 105, 290, { align: 'center' });

  // Page 2
  doc.addPage();
  const blankProdukRows: any[] = [
    [
      { content: 'Kelengkapan Produk', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 243, 246] } }
    ],
    [
      { content: '1', rowSpan: 3 },
      { content: 'Ketersediaan Produksi Subsidi', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [248, 249, 250] } }
    ],
    ['  - LPG 3 kg', emptyCheckbox, 'Jumlah yang sudah diterima :\nJumlah stok :\nPeriode Pengiriman :'],
    ['  - Pupuk Bersubsidi', emptyCheckbox, 'Jumlah yang sudah diterima :\nJumlah stok :\nPeriode Pengiriman :'],
    ['', '  - Beras SPHP', emptyCheckbox, 'Jumlah yang sudah diterima :\nJumlah stok :\nPeriode Pengiriman :'],
    ['2', 'Ketersediaan Produk Minyakita', emptyCheckbox, 'Jumlah yang sudah diterima :\nJumlah stok :\nPeriode Pengiriman :'],
    [
      { content: '3', rowSpan: 3 },
      { content: 'Ketersediaan Produk Non Subsidi', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [248, 249, 250] } }
    ],
    ['  Gula', emptyCheckbox, 'Periode Pengiriman :\nSumber supply produk :\nSkema kerja sama : konsinyasi/beli putus'],
    ['  Obat-obatan', emptyCheckbox, 'Periode Pengiriman :\nSumber supply produk :\nSkema kerja sama : konsinyasi/beli putus']
  ];

  autoTable(doc, {
    startY: 18,
    head: [
      [
        { content: 'A. Peninjauan Gudang dan Gerai (Lanjutan)', colSpan: 4, styles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ],
      ['No', 'Indikator', 'Checklist', 'Keterangan']
    ],
    body: blankProdukRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [180, 180, 180],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [225, 231, 239],
      textColor: [30, 41, 59],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 68 },
      2: { cellWidth: 38 },
      3: { cellWidth: 68 }
    },
    margin: { left: 13, right: 13 }
  });

  const nextY = (doc as any).lastAutoTable.finalY + 8;
  const blankTransaksiRows: any[] = [
    ['1', 'Waktu Operasional KD/KMP', '(range waktu)', '(keterangan)'],
    ['2', 'Nilai transaksi harian', '(range nilai)', '(keterangan)'],
    ['3', 'Jenis produk yang paling laku terjual', '(range jumlah)', '(keterangan)'],
    ['4', 'Jenis produk yang kurang laku terjual', '(nama produk)', '(keterangan)'],
    ['5', 'Mekanisme transaksi (cash/cashless)', '(cash/cashless)', '(keterangan)'],
    ['6', 'Kendala yang dialami dan bentuk dukungan yang diperlukan dalam operasionalisasi KD/KMP', '(kendala utama)', '(keterangan)']
  ];

  autoTable(doc, {
    startY: nextY,
    head: [
      [
        { content: 'B. Peninjauan Transaksi Gerai', colSpan: 4, styles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ],
      ['No', 'Indikator', '', '']
    ],
    body: blankTransaksiRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [180, 180, 180],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [225, 231, 239],
      textColor: [30, 41, 59],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 68 },
      2: { cellWidth: 48 },
      3: { cellWidth: 58 }
    },
    margin: { left: 13, right: 13 }
  });

  const blankSignY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text(`Mengetahui,`, 30, blankSignY);
  doc.text(`Pengurus / Manajer KDKMP`, 30, blankSignY + 5);
  doc.text(`( .................................................. )`, 30, blankSignY + 25);
  doc.text(`Nama: ............................................`, 30, blankSignY + 30);

  doc.text(`............................, ..... / ..... / 202...`, 130, blankSignY);
  doc.text(`Petugas Surveyor / Peninjau`, 130, blankSignY + 5);
  doc.text(`( .................................................. )`, 130, blankSignY + 25);
  doc.text(`Nama: ............................................`, 130, blankSignY + 30);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Halaman 2 dari 2 - Formulir Kosong Checklist KDKMP', 105, 290, { align: 'center' });

  doc.save('Formulir_Kosong_Checklist_Kesiapan_KDKMP.pdf');
}

export function generateSummaryCsvContent(locations: KDKMPLocation[]): string {
  const headers = [
    'No',
    'Kode KDKMP',
    'Nama Lokasi',
    'Provinsi',
    'Kabupaten/Kota',
    'Kecamatan',
    'Desa/Kelurahan',
    'Tanggal Kunjungan',
    'Skor Kesiapan (%)',
    'Status Kesiapan',
    'Skor Fisik & Sarpras (%)',
    'Skor SDM (%)',
    'Skor Sistem (%)',
    'Skor Produk (%)',
    'Transaksi Lengkap',
    'Manajer Ada',
    'Rekrutmen Lokal',
    'LPG 3kg Ada',
    'Pupuk Subsidi Ada',
    'Beras SPHP Ada',
    'Minyakita Ada',
    // Transaksi (Nilai & Keterangan Masing-Masing)
    'Waktu Operasional',
    'Keterangan Waktu Operasional',
    'Nilai Transaksi Harian',
    'Keterangan Nilai Transaksi',
    'Produk Paling Laku',
    'Keterangan Produk Paling Laku',
    'Produk Kurang Laku',
    'Keterangan Produk Kurang Laku',
    'Mekanisme Transaksi',
    'Keterangan Mekanisme Transaksi',
    'Kendala Utama',
    'Bentuk Dukungan Diperlukan'
  ];

  const rows = locations.map((loc, idx) => {
    const score = calculateReadiness(loc.checklist);
    const cl = loc.checklist;
    const tr = cl.transaksi;
    return [
      idx + 1,
      `"${loc.kodeKDKMP || ''}"`,
      `"${loc.namaLokasi.replace(/"/g, '""')}"`,
      `"${loc.provinsi}"`,
      `"${loc.kabupatenKota}"`,
      `"${loc.kecamatan}"`,
      `"${loc.desaKelurahan}"`,
      `"${loc.tanggalKunjungan}"`,
      `${score.percentage}%`,
      `"${score.status}"`,
      `${score.fisikScore.pct}%`,
      `${score.sdmScore.pct}%`,
      `${score.sistemScore.pct}%`,
      `${score.produkScore.pct}%`,
      score.transaksiCompleted ? 'Lengkap' : 'Belum Lengkap',
      cl.sdm.manajerKD.status === 'ada' ? 'Ada' : 'Tidak',
      cl.sdm.sdmRekrutmenAPN.masyarakatSekitar || 'Tidak',
      cl.produk.lpg3kg.status === 'ada' ? 'Ada' : 'Tidak',
      cl.produk.pupukBersubsidi.status === 'ada' ? 'Ada' : 'Tidak',
      cl.produk.berasSPHP.status === 'ada' ? 'Ada' : 'Tidak',
      cl.produk.minyakita.status === 'ada' ? 'Ada' : 'Tidak',
      `"${(tr.waktuOperasional.rangeWaktu || '').replace(/"/g, '""')}"`,
      `"${(tr.waktuOperasional.keterangan || '').replace(/"/g, '""')}"`,
      `"${(tr.nilaiTransaksiHarian.rangeNilai || '').replace(/"/g, '""')}"`,
      `"${(tr.nilaiTransaksiHarian.keterangan || '').replace(/"/g, '""')}"`,
      `"${(tr.produkPalingLaku.rangeJumlah || '').replace(/"/g, '""')}"`,
      `"${(tr.produkPalingLaku.keterangan || '').replace(/"/g, '""')}"`,
      `"${(tr.produkKurangLaku.namaProduk || '').replace(/"/g, '""')}"`,
      `"${(tr.produkKurangLaku.keterangan || '').replace(/"/g, '""')}"`,
      `"${(tr.mekanismeTransaksi.pilihan || '').replace(/"/g, '""')}"`,
      `"${(tr.mekanismeTransaksi.keterangan || '').replace(/"/g, '""')}"`,
      `"${(tr.kendalaDanDukungan.kendalaUtama || '').replace(/"/g, '""')}"`,
      `"${(tr.kendalaDanDukungan.keterangan || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

export function exportSummaryCsv(locations: KDKMPLocation[]): void {
  const csvContent = generateSummaryCsvContent(locations);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekapitulasi_Kesiapan_KDKMP_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

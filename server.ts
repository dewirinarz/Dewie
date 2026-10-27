import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Increase payload limit for scanned handwriting PDF & image base64
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // Initialize Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI();

  // API Route: Scan Handwriting & OCR from PDF / Scanned Images
  app.post('/api/scan-handwriting', async (req, res) => {
    try {
      const { image, mimeType = 'application/pdf', fileName = '' } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: 'Tidak ada data berkas yang dikirim.' });
      }

      // Extract raw base64 data
      const base64Data = image.replace(/^data:[^;]+;base64,/, '');
      const determinedMime = mimeType.toLowerCase().includes('pdf') || fileName.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : (mimeType || 'image/jpeg');

      const prompt = `Anda adalah ahli verifikasi formulir dan OCR dokumen survei evaluasi lapangan resmi Koperasi Desa / Kelurahan Merah Putih (KDKMP).
Tugas Anda adalah membaca dengan sangat teliti berkas formulir PDF / lembar hasil pindai (scan) tulisan tangan berikut.
Deteksi tanda centang (✓, v, x), tulisan pena tangan (catatan, tanggal kunjungan, nama petugas, nomor kontak), dan data produk/kuota.

PENTING:
- Pilihan Sistem absensi pegawai: biasanya tertulis "Aplikasi Simkopdes", "AgriConnect", atau "Simkopdes&AgriConnect".
- Pilihan Sistem pemantauan stock barang: biasanya tertulis "Manual" atau "Aplikasi Excel".
- Pilihan Sistem pemesanan produk: biasanya tertulis "Manual" atau "Aplikasi Excel".
- Tanggal kunjungan format YYYY-MM-DD jika terbaca.
- Kode unit KDKMP diawali kode provinsi + titik + kode kabupaten/kota jika ada (contoh: 33.11.KDKMP.034).

Kembalikan HANYA format JSON murni tanpa pembungkus teks luar atau markdown (tanpa \`\`\`json):
{
  "namaLokasi": "string nama KDKMP/desa",
  "kodeKDKMP": "string kode unit jika ada",
  "provinsi": "string provinsi",
  "kabupatenKota": "string kabupaten/kota",
  "kecamatan": "string kecamatan",
  "desaKelurahan": "string desa/kelurahan",
  "alamatLengkap": "string alamat lengkap",
  "tanggalKunjungan": "string YYYY-MM-DD",
  "namaPetugas": "string nama petugas surveyor/verifikator",
  "kontakPerson": "string kontak pengurus/pengelola",
  "catatanTambahan": "string catatan tulisan tangan surveyor",
  "checklist": {
    "fisikSarpras": {
      "bangunanGudang": { "status": "ada" | "tidak_ada", "keterangan": "string" },
      "bangunanGerai": { "status": "ada" | "tidak_ada", "keterangan": "string" },
      "instalasiListrik": { "status": "ada" | "tidak_ada", "keterangan": "string" },
      "instalasiAirBersih": { "status": "ada" | "tidak_ada", "keterangan": "string" },
      "fasilitasKlinik": { "status": "ada" | "tidak_ada", "keterangan": "string" },
      "rakObatApotek": { "status": "ada" | "tidak_ada", "keterangan": "string" },
      "saranaPrasarana": {
        "rakDisplay": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "perangkatKasir": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "truk6Ban": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "pickup4x4": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "motorBakRoda3": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "ac": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "apar": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "cctv": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "kipasCeiling": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "keranjangBelanja": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "seragamKD": { "status": "ada" | "tidak_ada", "keterangan": "string" },
        "papanNamaKD": { "status": "ada" | "tidak_ada", "keterangan": "string" }
      }
    },
    "sdm": {
      "manajerKD": { "status": "ada" | "tidak_ada", "tanggalOnBoarding": "string", "keterangan": "string" },
      "sdmRekrutmenAPN": { "status": "ada" | "tidak_ada", "masyarakatSekitar": "ya" | "tidak", "keterangan": "string" },
      "koordinasiPengurusKades": { "status": "ada" | "tidak_ada", "mekanismeKoordinasi": "string", "tanggalKoordinasi": "string", "keterangan": "string" },
      "pembekalanManajer": { "status": "ada" | "tidak_ada", "tanggalPembekalan": "string", "keterangan": "string" }
    },
    "sistem": {
      "sistemStokBarang": { "status": "ada" | "tidak_ada", "keterangan": "Manual" | "Aplikasi Excel" | string },
      "sistemPemesananProduk": { "status": "ada" | "tidak_ada", "keterangan": "Manual" | "Aplikasi Excel" | string },
      "sistemAbsensiPegawai": { "status": "ada" | "tidak_ada", "keterangan": "Aplikasi Simkopdes" | "AgriConnect" | "Simkopdes&AgriConnect" | string }
    },
    "produk": {
      "lpg3kg": { "status": "ada" | "tidak_ada", "jumlahDiterima": "string", "jumlahStok": "string", "periodePengiriman": "string", "keterangan": "string" },
      "pupukBersubsidi": { "status": "ada" | "tidak_ada", "jumlahDiterima": "string", "jumlahStok": "string", "periodePengiriman": "string", "keterangan": "string" },
      "berasSPHP": { "status": "ada" | "tidak_ada", "jumlahDiterima": "string", "jumlahStok": "string", "periodePengiriman": "string", "keterangan": "string" },
      "minyakita": { "status": "ada" | "tidak_ada", "jumlahDiterima": "string", "jumlahStok": "string", "periodePengiriman": "string", "keterangan": "string" },
      "gula": { "status": "ada" | "tidak_ada", "periodePengiriman": "string", "sumberSupply": "string", "skemaKerjasama": "beli_putus" | "konsinyasi", "keterangan": "string" },
      "obatObatan": { "status": "ada" | "tidak_ada", "periodePengiriman": "string", "sumberSupply": "string", "skemaKerjasama": "beli_putus" | "konsinyasi", "keterangan": "string" }
    },
    "transaksi": {
      "waktuOperasional": { "rangeWaktu": "string", "keterangan": "string" },
      "nilaiTransaksiHarian": { "rangeNilai": "string", "keterangan": "string" },
      "produkPalingLaku": { "rangeJumlah": "string", "keterangan": "string" },
      "produkKurangLaku": { "namaProduk": "string", "keterangan": "string" },
      "mekanismeTransaksi": { "pilihan": "cash" | "cashless" | "keduanya", "keterangan": "string" },
      "kendalaDanDukungan": { "kendalaUtama": "string", "keterangan": "string" }
    }
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: determinedMime
                }
              }
            ]
          }
        ]
      });

      const rawText = response.text || '{}';
      let jsonToParse = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const jsonMatch = jsonToParse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonToParse = jsonMatch[0];
      }

      const parsedData = JSON.parse(jsonToParse);
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('Error in scan-handwriting API:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Gagal memproses berkas tulisan tangan'
      });
    }
  });

  // Mount Vite development server or static build
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

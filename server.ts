import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_LOCATIONS } from './src/data/defaultData.ts';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import { getUsers, getOrCreateUser } from './src/db/users.ts';
import {
  getAllLocationsFromDb,
  upsertLocationToDb,
  upsertMultipleLocationsToDb,
  deleteLocationFromDb,
  deleteMultipleLocationsFromDb,
  resetLocationsInDb,
  getDatabaseStatus
} from './src/db/locations.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In this container environment, PORT=8080 is used by Nginx as the reverse proxy fronting the app.
// The Node/Express applet must always bind to DEFAULT_APP_PORT (3000) or 3000, never 8080.
function getAppPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (process.env.DEFAULT_APP_PORT) {
    const defaultPort = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (!isNaN(defaultPort)) return defaultPort;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const envPort = parseInt(process.env.PORT, 10);
    if (!isNaN(envPort)) return envPort;
  }
  return 3000;
}

async function startServer() {
  const app = express();
  const port = getAppPort();
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

  // Cloud SQL Database Routes: Users
  app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'User tidak terotentikasi' });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Failed to sync user to Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Gagal sinkronisasi data user' });
    }
  });

  app.get('/api/users', requireAuth, async (req: AuthRequest, res) => {
    try {
      const usersList = await getUsers();
      res.json(usersList);
    } catch (error: any) {
      console.error('Failed to fetch users from Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil data user' });
    }
  });

  // Local Database Routes: KDKMP Locations
  app.get('/api/locations', async (_req, res) => {
    try {
      const data = await getAllLocationsFromDb();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Failed to query locations from local DB:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal mengambil data lokasi' });
    }
  });

  app.post('/api/locations', async (req, res) => {
    try {
      const location = req.body;
      if (!location || !location.id) {
        return res.status(400).json({ success: false, error: 'Data lokasi tidak valid' });
      }
      await upsertLocationToDb(location);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to upsert location to local DB:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal menyimpan data lokasi' });
    }
  });

  app.delete('/api/locations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteLocationFromDb(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to delete location from local DB:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal menghapus data lokasi' });
    }
  });

  app.post('/api/locations/batch', async (req, res) => {
    try {
      const locationsList = req.body;
      if (!Array.isArray(locationsList)) {
        return res.status(400).json({ success: false, error: 'Payload harus berupa array data lokasi' });
      }
      await upsertMultipleLocationsToDb(locationsList);
      res.json({ success: true, count: locationsList.length });
    } catch (error: any) {
      console.error('Failed to batch upsert locations to local DB:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal menyimpan data lokasi massal' });
    }
  });

  app.post('/api/locations/bulk-delete', async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, error: 'Payload ids harus berupa array string' });
      }
      await deleteMultipleLocationsFromDb(ids);
      res.json({ success: true, count: ids.length });
    } catch (error: any) {
      console.error('Failed to bulk delete locations from local DB:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal menghapus data lokasi massal' });
    }
  });

  app.post('/api/locations/reset', async (req, res) => {
    try {
      const targetData = req.body?.data;
      await resetLocationsInDb(Array.isArray(targetData) ? targetData : undefined);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to reset locations in local DB:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal mereset data lokasi' });
    }
  });

  // Read verified master initial backup (2,410 rows)
  app.get('/api/backup/initial-master', (_req, res) => {
    try {
      const backupPath = path.resolve(process.cwd(), 'src/data/backup_development_db_pre_stage1.json');
      if (fs.existsSync(backupPath)) {
        const raw = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const data = raw.map((r: any) => (r.data || r));
        return res.json({ success: true, count: data.length, data });
      }
      return res.status(404).json({ success: false, error: 'File backup_development_db_pre_stage1.json tidak ditemukan' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Read baseline initial data (7 rows)
  app.get('/api/backup/baseline', (_req, res) => {
    try {
      const baselinePath = path.resolve(process.cwd(), 'src/data/backup_production_db_pre_stage1.json');
      if (fs.existsSync(baselinePath)) {
        const raw = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
        const data = raw.map((r: any) => (r.data || r));
        return res.json({ success: true, count: data.length, data });
      }
      return res.json({ success: true, count: INITIAL_LOCATIONS.length, data: INITIAL_LOCATIONS });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/db-status', async (_req, res) => {
    try {
      const status = await getDatabaseStatus();
      res.json({
        success: true,
        database: 'Penyimpanan Lokal Mandiri',
        activeDatabase: status.dbName,
        connected: status.connected,
        rowCount: status.count,
        error: status.error || null,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Read-only endpoint to audit and compare IndexedDB payload with PostgreSQL production records
  app.post('/api/audit-indexeddb', async (req, res) => {
    try {
      const idbLocations: any[] = req.body?.locations || req.body;
      if (!Array.isArray(idbLocations)) {
        return res.status(400).json({ success: false, error: 'Payload harus berupa array locations' });
      }

      // 1. Fetch current authoritative rows from PostgreSQL
      const pgLocations = await getAllLocationsFromDb();
      const pgMapById = new Map<string, any>();
      const pgMapByCode = new Map<string, any>();
      const pgMapByName = new Map<string, any>();

      pgLocations.forEach((loc: any) => {
        const code = (loc.kodeKDKMP || loc.kode_kdkmp || loc.data?.kodeKDKMP || '').trim();
        const name = (loc.namaLokasi || loc.nama_lokasi || loc.data?.namaLokasi || '').trim();
        if (loc.id) pgMapById.set(loc.id, loc);
        if (code) pgMapByCode.set(code.toLowerCase(), loc);
        if (name) pgMapByName.set(name.toLowerCase(), loc);
      });

      // 2. Analyze IndexedDB payload
      const idbMapById = new Map<string, any>();
      const idbCodeOccurrences = new Map<string, any[]>();
      const idbNameOccurrences = new Map<string, any[]>();

      const idsInIdbNotInPg: string[] = [];
      const idsInBoth: string[] = [];

      idbLocations.forEach(loc => {
        const code = (loc.kodeKDKMP || loc.kode_kdkmp || loc.data?.kodeKDKMP || '').trim();
        const name = (loc.namaLokasi || loc.nama_lokasi || loc.data?.namaLokasi || '').trim();

        if (loc.id) {
          idbMapById.set(loc.id, loc);
          if (pgMapById.has(loc.id)) {
            idsInBoth.push(loc.id);
          } else {
            idsInIdbNotInPg.push(loc.id);
          }
        }

        if (code) {
          const codeKey = code.toLowerCase();
          const list = idbCodeOccurrences.get(codeKey) || [];
          list.push({ id: loc.id, kodeKDKMP: code, namaLokasi: name });
          idbCodeOccurrences.set(codeKey, list);
        }

        if (name) {
          const nameKey = name.toLowerCase();
          const list = idbNameOccurrences.get(nameKey) || [];
          list.push({ id: loc.id, kodeKDKMP: code, namaLokasi: name });
          idbNameOccurrences.set(nameKey, list);
        }
      });

      // 3. Find duplicate codes in IndexedDB
      const duplicateCodes: Array<{
        kodeKDKMP: string;
        count: number;
        occurrences: any[];
        existsInPostgres: boolean;
        pgId?: string;
      }> = [];

      idbCodeOccurrences.forEach((list, codeKey) => {
        if (list.length > 1) {
          const pgMatch = pgMapByCode.get(codeKey);
          duplicateCodes.push({
            kodeKDKMP: list[0].kodeKDKMP,
            count: list.length,
            occurrences: list,
            existsInPostgres: Boolean(pgMatch),
            pgId: pgMatch?.id
          });
        }
      });

      // 4. Categorize the items in IndexedDB that are not in PostgreSQL by ID
      const newItemsNotInPg: any[] = [];
      const duplicateVersionOfExistingPgItems: any[] = [];

      idsInIdbNotInPg.forEach(id => {
        const loc = idbMapById.get(id);
        const code = (loc?.kodeKDKMP || loc?.kode_kdkmp || loc?.data?.kodeKDKMP || '').trim();
        const name = (loc?.namaLokasi || loc?.nama_lokasi || loc?.data?.namaLokasi || '').trim();
        const codeKey = code.toLowerCase();
        const hasPgMatch = codeKey && pgMapByCode.has(codeKey);
        if (hasPgMatch) {
          duplicateVersionOfExistingPgItems.push({
            idInIdb: id,
            kodeKDKMP: code,
            namaLokasi: name,
            pgId: pgMapByCode.get(codeKey)?.id
          });
        } else {
          newItemsNotInPg.push({
            idInIdb: id,
            kodeKDKMP: code,
            namaLokasi: name
          });
        }
      });

      res.json({
        success: true,
        summary: {
          totalIndexedDBRecords: idbLocations.length,
          uniqueIdsInIndexedDB: idbMapById.size,
          uniqueCodesInIndexedDB: idbCodeOccurrences.size,
          totalPostgresRecords: pgLocations.length,
          uniqueIdsInPostgres: pgMapById.size,
          uniqueCodesInPostgres: pgMapByCode.size,
          idsMatchingInBoth: idsInBoth.length,
          idsInIndexedDBNotInPostgres: idsInIdbNotInPg.length,
          duplicateCodesCountInIndexedDB: duplicateCodes.length,
          duplicateVersionOfExistingPgCount: duplicateVersionOfExistingPgItems.length,
          trulyNewLocationsCount: newItemsNotInPg.length,
        },
        explanation: {
          originalMasterCount: idbCodeOccurrences.size,
          whyItBecame6545: `${idbCodeOccurrences.size} (kode unik fisik asli) + ${duplicateCodes.length} (duplikat ID untuk lokasi yang sama) = ${idbLocations.length}`,
        },
        sampleDuplicateCodes: duplicateCodes.slice(0, 15),
        sampleNewLocations: newItemsNotInPg.slice(0, 15),
        sampleDuplicateVersions: duplicateVersionOfExistingPgItems.slice(0, 15),
        idsNotInPostgres: idsInIdbNotInPg
      });
    } catch (error: any) {
      console.error('Audit IndexedDB error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Mount Vite development server or static build
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
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

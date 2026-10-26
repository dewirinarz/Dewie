import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_LOCATIONS } from './src/data/defaultData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data persistence directory
const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');
const LOCATIONS_FILE = path.resolve(DATA_DIR, 'locations.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory or persisted users store
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'surveyor' | 'verifikator' | 'viewer';
  agency: string;
  region: string;
  nip?: string;
  avatar?: string;
  createdAt: string;
}

// Helper: Hash password with PBKDF2
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Helper: Generate simple signed token
const JWT_SECRET = process.env.JWT_SECRET || 'kdkmp_merah_putih_secret_key_2026';
function createAuthToken(userId: string, email: string, role: string): string {
  const payload = {
    userId,
    email,
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const strPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(strPayload).digest('base64url');
  return `${strPayload}.${signature}`;
}

function verifyAuthToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const [strPayload, signature] = token.split('.');
    if (!strPayload || !signature) return null;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(strPayload).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(strPayload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Default Seed Users
function getInitialUsers(): StoredUser[] {
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const surveyorSalt = crypto.randomBytes(16).toString('hex');
  const verifSalt = crypto.randomBytes(16).toString('hex');
  const viewerSalt = crypto.randomBytes(16).toString('hex');

  return [
    {
      id: 'usr-admin-01',
      name: 'Administrator Pusat KDKMP',
      email: 'admin@kdkmp.go.id',
      passwordHash: hashPassword('admin123', adminSalt),
      salt: adminSalt,
      role: 'admin',
      agency: 'Kementerian Koordinator Bidang Pemberdayaan Masyarakat',
      region: 'Nasional',
      nip: '19840215 200801 1 002',
      createdAt: '2026-01-01T08:00:00Z'
    },
    {
      id: 'usr-surveyor-01',
      name: 'Budi Santoso, S.Kom',
      email: 'surveyor@kdkmp.go.id',
      passwordHash: hashPassword('surveyor123', surveyorSalt),
      salt: surveyorSalt,
      role: 'surveyor',
      agency: 'Satgas Pendataan Lapangan KDKMP Wilayah 1',
      region: 'Jawa Barat & Banten',
      nip: '19920718 201802 1 004',
      createdAt: '2026-01-15T09:30:00Z'
    },
    {
      id: 'usr-verif-01',
      name: 'Siti Rahmawati, S.E., M.Si',
      email: 'verifikator@kdkmp.go.id',
      passwordHash: hashPassword('verif123', verifSalt),
      salt: verifSalt,
      role: 'verifikator',
      agency: 'Tim Verifikasi Kelayakan Koperasi Merah Putih',
      region: 'Wilayah Barat',
      nip: '19890412 201403 2 003',
      createdAt: '2026-02-01T10:00:00Z'
    },
    {
      id: 'usr-viewer-01',
      name: 'Drs. Hendro Wibowo, M.M',
      email: 'pengawas@kdkmp.go.id',
      passwordHash: hashPassword('pengawas123', viewerSalt),
      salt: viewerSalt,
      role: 'viewer',
      agency: 'Inspektorat Jenderal Pengawasan KDKMP',
      region: 'Seluruh Wilayah',
      nip: '19750921 200003 1 001',
      createdAt: '2026-02-10T11:00:00Z'
    }
  ];
}

// User Storage Functions
function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading users file:', e);
  }
  const defaultUsers = getInitialUsers();
  saveUsers(defaultUsers);
  return defaultUsers;
}

function saveUsers(users: StoredUser[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users file:', e);
  }
}

// Location Storage Functions
function loadLocations(): any[] {
  try {
    if (fs.existsSync(LOCATIONS_FILE)) {
      const raw = fs.readFileSync(LOCATIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading locations file:', e);
  }
  // Fallback to INITIAL_LOCATIONS
  const initial = INITIAL_LOCATIONS || [];
  saveLocations(initial);
  return initial;
}

function saveLocations(locations: any[]): void {
  try {
    fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(locations, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving locations file:', e);
  }
}

// Convert StoredUser to public user object
function toPublicUser(u: StoredUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    agency: u.agency,
    region: u.region,
    nip: u.nip,
    avatar: u.avatar,
    createdAt: u.createdAt,
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // JSON body parser with generous limit
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // Initialize data files
  loadUsers();
  loadLocations();

  // Authentication Middleware for protected routes
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Akses tidak diizinkan. Silakan login terlebih dahulu.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Sesi login telah berakhir atau tidak valid.' });
    }
    (req as any).user = decoded;
    next();
  };

  // ==========================================
  // AUTHENTICATION API ROUTES
  // ==========================================

  // POST /api/auth/login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email dan password harus diisi.' });
      }

      const users = loadUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

      if (!user) {
        return res.status(401).json({ success: false, error: 'Email atau kata sandi tidak cocok.' });
      }

      const hash = hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        return res.status(401).json({ success: false, error: 'Email atau kata sandi tidak cocok.' });
      }

      const token = createAuthToken(user.id, user.email, user.role);
      return res.json({
        success: true,
        user: toPublicUser(user),
        token,
        message: `Selamat datang, ${user.name} (${user.role.toUpperCase()})`
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, error: 'Gagal melakukan login. Silakan coba lagi.' });
    }
  });

  // POST /api/auth/register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, role = 'surveyor', agency = 'Satgas KDKMP', region = 'Nasional', nip } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Nama, email, dan password wajib diisi.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password minimal 6 karakter.' });
      }

      const users = loadUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (existing) {
        return res.status(409).json({ success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const newUser: StoredUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        salt,
        role: ['admin', 'surveyor', 'verifikator', 'viewer'].includes(role) ? role : 'surveyor',
        agency: agency.trim(),
        region: region.trim(),
        nip: nip?.trim() || '',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);

      const token = createAuthToken(newUser.id, newUser.email, newUser.role);
      return res.status(201).json({
        success: true,
        user: toPublicUser(newUser),
        token,
        message: 'Pendaftaran akun berhasil disetujui.'
      });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, error: 'Gagal mendaftar pengguna baru.' });
    }
  });

  // GET /api/auth/me
  app.get('/api/auth/me', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Belum login.' });
      }
      const token = authHeader.split(' ')[1];
      const decoded = verifyAuthToken(token);
      if (!decoded) {
        return res.status(401).json({ success: false, error: 'Token tidak valid atau kedaluwarsa.' });
      }

      const users = loadUsers();
      const user = users.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan.' });
      }

      return res.json({ success: true, user: toPublicUser(user) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', (_req, res) => {
    return res.json({ success: true, message: 'Berhasil keluar dari sistem.' });
  });

  // GET /api/auth/users (Admin / management)
  app.get('/api/auth/users', requireAuth, (req, res) => {
    try {
      const users = loadUsers();
      return res.json({ success: true, data: users.map(toPublicUser) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // PUT /api/auth/users/:id/role
  app.put('/api/auth/users/:id/role', requireAuth, (req, res) => {
    try {
      const currentUser = (req as any).user;
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Hanya Administrator yang dapat mengubah peran (role) pengguna.' });
      }

      const { id } = req.params;
      const { role } = req.body;
      if (!['admin', 'surveyor', 'verifikator', 'viewer'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Peran (role) tidak valid.' });
      }

      const users = loadUsers();
      const targetUser = users.find(u => u.id === id);
      if (!targetUser) {
        return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan.' });
      }

      targetUser.role = role;
      saveUsers(users);

      return res.json({ success: true, user: toPublicUser(targetUser), message: `Peran pengguna diperbarui menjadi ${role}.` });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // LOCATIONS & CHECKLIST API ROUTES
  // ==========================================

  // GET /api/locations
  app.get('/api/locations', (_req, res) => {
    try {
      const locations = loadLocations();
      return res.json({ success: true, count: locations.length, data: locations });
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      return res.status(500).json({ success: false, error: 'Gagal mengambil data lokasi dari server.' });
    }
  });

  // POST /api/locations
  app.post('/api/locations', (req, res) => {
    try {
      const newLoc = req.body;
      if (!newLoc || !newLoc.namaLokasi) {
        return res.status(400).json({ success: false, error: 'Nama lokasi wajib diisi.' });
      }

      const locations = loadLocations();

      // Check for duplicates
      const trimmedName = newLoc.namaLokasi.trim().toLowerCase();
      const duplicate = locations.find(l => l.namaLokasi.trim().toLowerCase() === trimmedName);

      const locationWithId = {
        ...newLoc,
        id: newLoc.id || `kdkmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        updatedAt: new Date().toISOString()
      };

      locations.unshift(locationWithId);
      saveLocations(locations);

      return res.status(201).json({
        success: true,
        data: locationWithId,
        isDuplicate: Boolean(duplicate),
        duplicateLocation: duplicate ? { id: duplicate.id, nama: duplicate.namaLokasi, desa: duplicate.desaKelurahan } : null,
        message: duplicate
          ? `Perhatian: Lokasi dengan nama "${duplicate.namaLokasi}" sudah ada, namun data baru tetap berhasil disimpan.`
          : 'Data lokasi berhasil disimpan ke database server.'
      });
    } catch (err: any) {
      console.error('Error creating location:', err);
      return res.status(500).json({ success: false, error: 'Gagal menyimpan data lokasi baru.' });
    }
  });

  // PUT /api/locations/:id
  app.put('/api/locations/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updatedFields = req.body;
      const locations = loadLocations();

      const index = locations.findIndex(l => l.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Lokasi tidak ditemukan di database.' });
      }

      locations[index] = {
        ...locations[index],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };

      saveLocations(locations);
      return res.json({
        success: true,
        data: locations[index],
        message: 'Data lokasi dan evaluasi berhasil diperbarui di server.'
      });
    } catch (err: any) {
      console.error('Error updating location:', err);
      return res.status(500).json({ success: false, error: 'Gagal memperbarui data lokasi.' });
    }
  });

  // DELETE /api/locations/:id
  app.delete('/api/locations/:id', (req, res) => {
    try {
      const { id } = req.params;
      const locations = loadLocations();
      const filtered = locations.filter(l => l.id !== id);

      if (filtered.length === locations.length) {
        return res.status(404).json({ success: false, error: 'Lokasi tidak ditemukan.' });
      }

      saveLocations(filtered);
      return res.json({ success: true, message: 'Data lokasi berhasil dihapus dari database server.' });
    } catch (err: any) {
      console.error('Error deleting location:', err);
      return res.status(500).json({ success: false, error: 'Gagal menghapus data lokasi.' });
    }
  });

  // POST /api/locations/batch
  app.post('/api/locations/batch', (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Daftar data lokasi tidak valid.' });
      }

      const locations = loadLocations();
      let addedCount = 0;
      let updatedCount = 0;

      for (const item of items) {
        if (!item.namaLokasi) continue;
        const existingIdx = locations.findIndex(l => (item.id && l.id === item.id) || l.namaLokasi.trim().toLowerCase() === item.namaLokasi.trim().toLowerCase());
        if (existingIdx !== -1) {
          locations[existingIdx] = {
            ...locations[existingIdx],
            ...item,
            updatedAt: new Date().toISOString()
          };
          updatedCount++;
        } else {
          locations.push({
            ...item,
            id: item.id || `kdkmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            updatedAt: new Date().toISOString()
          });
          addedCount++;
        }
      }

      saveLocations(locations);
      return res.json({
        success: true,
        data: locations,
        summary: { added: addedCount, updated: updatedCount, total: locations.length },
        message: `Berhasil mengimpor data (${addedCount} ditambahkan, ${updatedCount} diperbarui).`
      });
    } catch (err: any) {
      console.error('Error batch importing locations:', err);
      return res.status(500).json({ success: false, error: 'Gagal melakukan batch import data.' });
    }
  });

  // POST /api/locations/reset
  app.post('/api/locations/reset', (_req, res) => {
    try {
      const initial = INITIAL_LOCATIONS || [];
      saveLocations(initial);
      return res.json({ success: true, data: initial, message: 'Data lokasi berhasil di-reset ke data acuan awal KDKMP.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Gagal mereset data.' });
    }
  });

  // ==========================================
  // AI OCR HANDWRITING SCANNER
  // ==========================================
  app.post('/api/scan-handwriting', async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: 'Data gambar atau foto formulir diperlukan' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: 'GEMINI_API_KEY belum dikonfigurasi di lingkungan server (Settings > Secrets).',
          isKeyMissing: true
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const base64Data = image.replace(/^data:[^;]+;base64,/, '');

      const prompt = `Anda adalah asisten AI OCR pengenal tulisan tangan ahli khusus formulir instrumen checklist evaluasi kesiapan operasionalisasi KDKMP (Koperasi Desa/Kelurahan Merah Putih).
Tugas Anda:
1. Bacalah gambar atau foto dokumen/kertas terlampir yang memuat tulisan tangan (handwriting) surveyor, coretan, centang/checklist, silang, angka, tanggal, dan catatan manual.
2. Identifikasi tanggal kunjungan, nama petugas surveyor peninjau, serta status setiap komponen checklist (status 'ada' jika tercentang/ada tanda checklist, atau 'tidak_ada' jika dicoret/disilang/kosong).
3. Untuk bagian Produk (LPG 3 kg, pupuk, beras SPHP, minyakita, gula, obat-obatan), pastikan 'periodePengiriman' diisi dengan format tanggal (YYYY-MM-DD) jika terdapat tanggal pengiriman tertulis atau tanggal yang dimaksud.
4. Catat juga catatan tulisan tangan di kolom keterangan untuk masing-masing butir.

Output HARUS berupa JSON murni valid (tanpa markdown triple backticks \`\`\`json) dengan skema berikut:
{
  "tanggalKunjungan": "YYYY-MM-DD",
  "namaPetugas": "Nama lengkap petugas surveyor yang tertulis di kertas",
  "ringkasanTulisanTangan": "Rangkuman temuan utama tulisan tangan pada lembar kerja ini",
  "checklist": {
    "fisikSarpras": {
      "bangunanGudang": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
      "bangunanGerai": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
      "instalasiListrik": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
      "instalasiAirBersih": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
      "fasilitasKlinik": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
      "rakObatApotek": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
      "saranaPrasarana": {
        "rakDisplay": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "perangkatKasir": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "truk6Ban": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "pickup4x4": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "motorBakRoda3": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "ac": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "apar": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "cctv": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "kipasCeiling": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "keranjangBelanja": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "seragamKD": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
        "papanNamaKD": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" }
      }
    },
    "sdm": {
      "manajerKD": { "status": "ada"|"tidak_ada", "tanggalOnBoarding": "YYYY-MM-DD", "keterangan": "catatan tulisan tangan" },
      "sdmRekrutmenAPN": { "status": "ada"|"tidak_ada", "masyarakatSekitar": "ya"|"tidak"|"", "keterangan": "catatan tulisan tangan" },
      "koordinasiPengurusKades": { "status": "ada"|"tidak_ada", "mekanismeKoordinasi": "catatan mekanisme", "tanggalKoordinasi": "YYYY-MM-DD", "keterangan": "catatan tulisan tangan" },
      "pembekalanManajer": { "status": "ada"|"tidak_ada", "tanggalPembekalan": "YYYY-MM-DD", "keterangan": "catatan tulisan tangan" }
    },
    "sistem": {
      "sistemStokBarang": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
      "sistemPemesananProduk": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" },
      "sistemAbsensiPegawai": { "status": "ada"|"tidak_ada", "keterangan": "catatan tulisan tangan" }
    },
    "produk": {
      "lpg3kg": { "status": "ada"|"tidak_ada", "jumlahDiterima": "...", "jumlahStok": "...", "periodePengiriman": "YYYY-MM-DD", "keterangan": "..." },
      "pupukBersubsidi": { "status": "ada"|"tidak_ada", "jumlahDiterima": "...", "jumlahStok": "...", "periodePengiriman": "YYYY-MM-DD", "keterangan": "..." },
      "berasSPHP": { "status": "ada"|"tidak_ada", "jumlahDiterima": "...", "jumlahStok": "...", "periodePengiriman": "YYYY-MM-DD", "keterangan": "..." },
      "minyakita": { "status": "ada"|"tidak_ada", "jumlahDiterima": "...", "jumlahStok": "...", "periodePengiriman": "YYYY-MM-DD", "keterangan": "..." },
      "gula": { "status": "ada"|"tidak_ada", "periodePengiriman": "YYYY-MM-DD", "sumberSupply": "...", "skemaKerjasama": "konsinyasi"|"beli_putus"|"", "keterangan": "..." },
      "obatObatan": { "status": "ada"|"tidak_ada", "periodePengiriman": "YYYY-MM-DD", "sumberSupply": "...", "skemaKerjasama": "konsinyasi"|"beli_putus"|"", "keterangan": "..." }
    },
    "transaksi": {
      "waktuOperasional": { "rangeWaktu": "...", "keterangan": "..." },
      "nilaiTransaksiHarian": { "rangeNilai": "...", "keterangan": "..." },
      "produkPalingLaku": { "rangeJumlah": "...", "keterangan": "..." },
      "produkKurangLaku": { "namaProduk": "...", "keterangan": "..." },
      "mekanismeTransaksi": { "pilihan": "cash"|"cashless"|"keduanya"|"", "keterangan": "..." },
      "kendalaDanDukungan": { "kendalaUtama": "...", "keterangan": "..." }
    }
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (e) {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleaned);
      }

      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('Error scanning handwriting:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Terjadi kesalahan saat memproses tulisan tangan dengan AI.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      service: 'KDKMP Server API',
      timestamp: new Date().toISOString()
    });
  });

  // Setup Vite in middleware mode for dev / static for prod
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`KDKMP Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole, ROLE_LABELS } from '../types/auth';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ClipboardPen,
  CheckCheck,
  Building2,
  MapPin,
  FileBadge,
  X,
  AlertCircle,
  Sparkles,
  Check
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { login, register, quickSwitchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('surveyor');
  const [agency, setAgency] = useState('Satgas KDKMP');
  const [region, setRegion] = useState('Jawa Barat');
  const [nip, setNip] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onSuccess?.('Login berhasil! Selamat datang kembali.');
          onClose();
        } else {
          setError(res.error || 'Login gagal.');
        }
      } else {
        const res = await register({
          name,
          email,
          password,
          role,
          agency,
          region,
          nip,
        });
        if (res.success) {
          onSuccess?.('Registrasi akun berhasil disetujui!');
          onClose();
        } else {
          setError(res.error || 'Registrasi gagal.');
        }
      }
    } catch {
      setError('Terjadi kendala saat menghubungkan ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (selectedRole: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    const cred = DEMO_CREDENTIALS[selectedRole];
    setEmail(cred.email);
    setPassword(cred.pass);

    const ok = await quickSwitchUser(selectedRole);
    setIsSubmitting(false);
    if (ok) {
      onSuccess?.(`Login berhasil sebagai ${ROLE_LABELS[selectedRole].label}`);
      onClose();
    } else {
      setError(`Gagal login otomatis sebagai ${selectedRole}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header with Merah-Putih Gradient & Official Emblem */}
        <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white p-6 pb-7">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center">
              {/* Garuda / Merah Putih Symbol */}
              <div className="w-full h-full rounded-lg bg-red-600 flex flex-col overflow-hidden border border-red-700">
                <div className="flex-1 bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">KD</div>
                <div className="flex-1 bg-white flex items-center justify-center text-[10px] font-bold text-red-700">MP</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                  Sistem Informasi Kesiapan
                </span>
                <span className="text-xs text-rose-200">v2.5 Full-Stack</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">
                KDKMP Portal Otentikasi
              </h2>
              <p className="text-xs text-rose-100 mt-0.5">
                Koperasi Desa / Kelurahan Merah Putih — Republik Indonesia
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Login Preset Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Akses Cepat 1-Klik (Akun Demo Pengujian):
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Klik untuk langsung masuk</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              className="flex flex-col items-center p-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/70 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-800 dark:text-red-300 transition-all text-left text-xs font-medium group"
            >
              <div className="flex items-center gap-1.5 w-full">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="font-semibold text-[11px] truncate">Admin</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 w-full truncate">Akses Penuh</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('surveyor')}
              disabled={isSubmitting}
              className="flex flex-col items-center p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 transition-all text-left text-xs font-medium group"
            >
              <div className="flex items-center gap-1.5 w-full">
                <ClipboardPen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px] truncate">Surveyor</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 w-full truncate">Input & OCR</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('verifikator')}
              disabled={isSubmitting}
              className="flex flex-col items-center p-2 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-800 dark:text-blue-300 transition-all text-left text-xs font-medium group"
            >
              <div className="flex items-center gap-1.5 w-full">
                <CheckCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold text-[11px] truncate">Verifikator</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 w-full truncate">Validasi Skor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('viewer')}
              disabled={isSubmitting}
              className="flex flex-col items-center p-2 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 text-purple-800 dark:text-purple-300 transition-all text-left text-xs font-medium group"
            >
              <div className="flex items-center gap-1.5 w-full">
                <FileBadge className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="font-semibold text-[11px] truncate">Pengawas</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 w-full truncate">Ekspor & Rekap</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Mode Tabs */}
          <div className="flex p-1 mb-5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Masuk Akun (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Daftar Petugas Baru
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Petugas *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Contoh: Budi Santoso, S.Kom"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Peran / Role Petugas *
                    </label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="surveyor">Surveyor Lapangan (Input & OCR)</option>
                      <option value="verifikator">Tim Verifikator (Verifikasi)</option>
                      <option value="admin">Administrator Pusat (Penuh)</option>
                      <option value="viewer">Pengawas / Eksekutif (Read-Only)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      NIP / ID Petugas (Opsional)
                    </label>
                    <input
                      type="text"
                      value={nip}
                      onChange={e => setNip(e.target.value)}
                      placeholder="19900101 201501 1 001"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Instansi / Satuan Kerja
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={agency}
                        onChange={e => setAgency(e.target.value)}
                        placeholder="Satgas KDKMP Kemenko"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Wilayah Penugasan
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                        placeholder="Provinsi Jawa Barat"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email Kedinasan / Akun *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama.petugas@kdkmp.go.id"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi (Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="mt-1 text-right">
                  <span className="text-[11px] text-slate-400">
                    Default: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">admin123</code> / <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">surveyor123</code>
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl shadow-md shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {mode === 'login' ? 'Masuk ke Sistem KDKMP' : 'Daftarkan Akun Petugas'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Terhubung ke backend API terenkripsi. Hak Cipta © 2026 Koperasi Desa/Kelurahan Merah Putih.
          </p>
        </div>
      </div>
    </div>
  );
};

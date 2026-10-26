import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, ROLE_LABELS } from '../types/auth';
import { Users, Shield, Check, X, ShieldAlert, RefreshCw } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const { usersList, fetchUsers, updateUserRole, user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchUsers().finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    const ok = await updateUserRole(userId, newRole);
    setUpdatingId(null);
    if (ok) {
      onToast(`✓ Peran pengguna berhasil diperbarui menjadi ${ROLE_LABELS[newRole].label}`);
    } else {
      onToast('Gagal memperbarui peran pengguna.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Manajemen Pengguna & Hak Akses Petugas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola hak akses akun surveyor, verifikator, dan administrator sistem KDKMP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoading(true);
                fetchUsers().finally(() => setLoading(false));
              }}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama & Email</th>
                  <th className="py-3 px-3">Instansi & Wilayah</th>
                  <th className="py-3 px-3">Peran Saat Ini</th>
                  <th className="py-3 px-4 text-right">Ubah Peran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {usersList.map(u => {
                  const roleConfig = ROLE_LABELS[u.role] || ROLE_LABELS.viewer;
                  const isCurrent = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isCurrent ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {u.name}
                          {isCurrent && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                              (Anda)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                        {u.nip && <div className="text-[10px] text-slate-400">NIP: {u.nip}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <div className="font-medium text-[11px]">{u.agency || '-'}</div>
                        <div className="text-[10px] text-slate-400">{u.region || 'Nasional'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleConfig.badgeClass}`}
                        >
                          <Shield className="w-3 h-3" />
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={u.role}
                          disabled={isCurrent || updatingId === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="admin">Administrator</option>
                          <option value="verifikator">Verifikator</option>
                          <option value="surveyor">Surveyor</option>
                          <option value="viewer">Pengawas (Read-Only)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Kebijakan Keamanan Peran & Autentikasi:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                <li><strong>Administrator:</strong> Memiliki wewenang CRUD penuh, penghapusan, dan manajemen akun.</li>
                <li><strong>Verifikator:</strong> Wewenang evaluasi checklist, review instrumen, dan penerbitan rekomendasi.</li>
                <li><strong>Surveyor:</strong> Wewenang input lokasi baru, pengisian formulir, dan scan OCR AI.</li>
                <li><strong>Pengawas:</strong> Akses pembacaan (read-only) untuk pemantauan dan pengunduhan laporan.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-medium text-xs hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

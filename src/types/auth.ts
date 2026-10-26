export type UserRole = 'admin' | 'surveyor' | 'verifikator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: string; // Instansi / Satgas (contoh: Satgas KDKMP Kemenko)
  region?: string; // Wilayah Tugas (contoh: Jawa Barat, Nasional)
  avatar?: string;
  nip?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export interface RolePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canScanOCR: boolean;
  canVerify: boolean;
  canExport: boolean;
  canImport: boolean;
  canManageUsers: boolean;
}

export function getRolePermissions(role?: UserRole): RolePermissions {
  switch (role) {
    case 'admin':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canScanOCR: true,
        canVerify: true,
        canExport: true,
        canImport: true,
        canManageUsers: true,
      };
    case 'verifikator':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canScanOCR: true,
        canVerify: true,
        canExport: true,
        canImport: false,
        canManageUsers: false,
      };
    case 'surveyor':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canScanOCR: true,
        canVerify: false,
        canExport: true,
        canImport: true,
        canManageUsers: false,
      };
    case 'viewer':
    default:
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canScanOCR: false,
        canVerify: false,
        canExport: true,
        canImport: false,
        canManageUsers: false,
      };
  }
}

export const ROLE_LABELS: Record<UserRole, { label: string; description: string; badgeClass: string; icon: string }> = {
  admin: {
    label: 'Administrator Pusat',
    description: 'Akses penuh seluruh data, manajemen user, import/export, dan hapus data.',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
    icon: 'ShieldCheck',
  },
  verifikator: {
    label: 'Tim Verifikator',
    description: 'Verifikasi instrumen kesiapan, validasi kelengkapan fisik/sdm, review & scoring.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    icon: 'CheckCheck',
  },
  surveyor: {
    label: 'Surveyor Lapangan',
    description: 'Input data survei, upload/scan formulir fisik tulisan tangan, perbarui checklist.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    icon: 'ClipboardPen',
  },
  viewer: {
    label: 'Pengawas / Eksekutif',
    description: 'Akses tinjauan monitoring, melihat rekap statistik, peta, dan ekspor laporan.',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    icon: 'Eye',
  },
};

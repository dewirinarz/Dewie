import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, RolePermissions, getRolePermissions } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: RolePermissions;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    agency?: string;
    region?: string;
    nip?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickSwitchUser: (role: UserRole) => Promise<boolean>;
  usersList: User[];
  fetchUsers: () => Promise<void>;
  updateUserRole: (id: string, newRole: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'kdkmp_auth_token_v1';
const USER_KEY = 'kdkmp_auth_user_v1';

// Preset credentials for Quick Demo Login
export const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; title: string }> = {
  admin: {
    email: 'admin@kdkmp.go.id',
    pass: 'admin123',
    title: 'Administrator Pusat',
  },
  surveyor: {
    email: 'surveyor@kdkmp.go.id',
    pass: 'surveyor123',
    title: 'Surveyor Lapangan',
  },
  verifikator: {
    email: 'verifikator@kdkmp.go.id',
    pass: 'verif123',
    title: 'Tim Verifikator',
  },
  viewer: {
    email: 'pengawas@kdkmp.go.id',
    pass: 'pengawas123',
    title: 'Pengawas / Eksekutif',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Verify token on mount with backend
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user) {
            setUser(json.user);
            localStorage.setItem(USER_KEY, JSON.stringify(json.user));
          } else {
            // Invalid session
            setUser(null);
            setToken(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (err) {
        console.warn('Backend auth check warning, using cached user if available:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login gagal. Periksa email dan kata sandi.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Tidak dapat menghubungi server backend.' };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    agency?: string;
    region?: string;
    nip?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Pendaftaran gagal.' };
      }

      setUser(resData.user);
      setToken(resData.token);
      localStorage.setItem(TOKEN_KEY, resData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(resData.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Tidak dapat menghubungi server backend.' };
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const quickSwitchUser = async (role: UserRole): Promise<boolean> => {
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) return false;
    const res = await login(creds.email, creds.pass);
    return res.success;
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUsersList(json.data || []);
        }
      }
    } catch (e) {
      console.error('Failed to fetch user list:', e);
    }
  };

  const updateUserRole = async (id: string, newRole: UserRole): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/auth/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
    } catch (e) {
      console.error('Failed to update user role:', e);
    }
    return false;
  };

  const permissions = getRolePermissions(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        permissions,
        login,
        register,
        logout,
        quickSwitchUser,
        usersList,
        fetchUsers,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

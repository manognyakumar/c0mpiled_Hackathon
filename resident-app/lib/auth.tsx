/**
 * Auth Context — JWT-based authentication with localStorage persistence.
 * Provides login, logout, and current user info across the app.
 */
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AuthUser {
  user_id: number;
  user_type: 'resident' | 'guard';
  name: string;
  phone: string;
  apt_number?: string;
  photo_url?: string;
  access_token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (phone: string, password: string, userType: 'resident' | 'guard') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'rg_auth_token';
const USER_KEY = 'rg_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (stored && token) {
        const parsed = JSON.parse(stored) as AuthUser;
        parsed.access_token = token;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Route protection
  useEffect(() => {
    if (loading) return;

    const isLoginPage = pathname === '/login';

    if (!user && !isLoginPage) {
      router.replace('/login');
      return;
    }

    if (user && isLoginPage) {
      router.replace(user.user_type === 'guard' ? '/guard' : '/');
      return;
    }

    // Guard trying to access resident pages
    if (user?.user_type === 'guard' && !pathname.startsWith('/guard') && !isLoginPage) {
      router.replace('/guard');
      return;
    }

    // Resident trying to access guard pages
    if (user?.user_type === 'resident' && pathname.startsWith('/guard')) {
      router.replace('/');
      return;
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (phone: string, password: string, userType: 'resident' | 'guard') => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, user_type: userType }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || err.error || 'Login failed');
    }

    const data = await res.json();

    const authUser: AuthUser = {
      user_id: data.user_id,
      user_type: data.user_type,
      name: data.name,
      phone,
      apt_number: data.apt_number,
      photo_url: data.photo_url,
      access_token: data.access_token,
    };

    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);

    // Navigate based on role
    router.replace(userType === 'guard' ? '/guard' : '/');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        logout();
        return;
      }
      const data = await res.json();
      const authUser: AuthUser = {
        user_id: data.user_id,
        user_type: data.user_type,
        name: data.name,
        phone: data.phone,
        apt_number: data.apt_number,
        photo_url: data.photo_url,
        access_token: token,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
    } catch {
      // Silently fail — keep current session
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

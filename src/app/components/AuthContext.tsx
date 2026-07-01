import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiPost } from '../services/api';
import type { UserInfo } from '../../core/types';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  isAdmin: boolean;
  isManager: boolean;
  login: (user: UserInfo) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(json => {
        if (json?.success && json.data) {
          setUser({
            userId: json.data.userId,
            username: json.data.username,
            fullName: json.data.fullName ?? json.data.username,
            roleName: json.data.roleName,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((userData: UserInfo) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost<void>('/auth/logout', null);
    } catch {
      // Clear local state even if the server call fails
    }
    setUser(null);
  }, []);

  const role = user?.roleName ?? null;
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: user !== null, role, isAdmin, isManager, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

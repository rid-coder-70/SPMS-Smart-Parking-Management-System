import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { TOKEN_KEY } from '@/common/api';
import { AuthService } from './auth.service';
import type {
  LoginPayload,
  RegisterPayload,
  User,
} from '@/common/types';

// ─── Context shape ────────────────────────────────────────────

interface AuthContextValue {
  user:     User | null;
  token:    string | null;
  loading:  boolean;
  login:    (username: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ── Rehydrate from localStorage on mount ─────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      // Fetch current user profile to rehydrate user state
      AuthService.getMe()
        .then((data) => setUser(data))
        .catch(() => {
          // Token expired / invalid — clear it
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── login ─────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string) => {
    const data = await AuthService.login({ username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  // ── register ──────────────────────────────────────────────
  const register = useCallback(async (payload: RegisterPayload) => {
    // POST /auth/register — returns UserSummaryDto (no token)
    // Caller is responsible for navigating to /login afterwards
    await AuthService.register(payload);
  }, []);

  // ── logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────

/**
 * Usage: const { user, login, logout } = useAuth();
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}

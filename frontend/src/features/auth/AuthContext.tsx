import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import api, { TOKEN_KEY } from '@/common/api';
import type {
  AuthResponse,
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
      api.get<User>('/users/me')
        .then((res) => setUser(res.data))
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
    const payload: LoginPayload = { username, password };
    const res = await api.post<AuthResponse>('/auth/login', payload);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── register ──────────────────────────────────────────────
  const register = useCallback(async (data: RegisterPayload) => {
    // POST /auth/register — returns UserSummaryDto (no token)
    // Caller is responsible for navigating to /login afterwards
    await api.post('/auth/register', data);
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

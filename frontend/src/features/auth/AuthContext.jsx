import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef
} from "react";
import { TOKEN_KEY } from "@/common/api";
import { AuthService } from "./auth.service";
const AuthContext = createContext(null);
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1e3;
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, []);
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (token) {
      inactivityTimerRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [token, logout]);
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      AuthService.getMe().then((data) => setUser(data)).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!token) return;
    resetInactivityTimer();
    const events = ["mousemove", "keydown", "click", "scroll"];
    const handleActivity = () => resetInactivityTimer();
    events.forEach((event) => window.addEventListener(event, handleActivity));
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [token, resetInactivityTimer]);
  const login = useCallback(async (username, password) => {
    const data = await AuthService.login({ username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);
  const register = useCallback(async (payload) => {
    await AuthService.register(payload);
  }, []);
  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

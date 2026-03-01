/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { apiRequest } from "../lib/api";

type User = {
  id: string;
  username: string;
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback((response: AuthResponse) => {
    setAccessToken(response.accessToken);
    setUser(response.user);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    setSession(response);
  }, [setSession]);

  const signup = useCallback(async (username: string, password: string) => {
    const response = await apiRequest<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    setSession(response);
  }, [setSession]);

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>("/api/auth/logout", { method: "POST" }, accessToken);
    } finally {
      clearSession();
    }
  }, [accessToken, clearSession]);

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      try {
        const refresh = await apiRequest<AuthResponse>("/api/auth/refresh", { method: "POST" });
        if (!mounted) return;
        setSession(refresh);
      } catch {
        if (!mounted) return;
        clearSession();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, [clearSession, setSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    accessToken,
    loading,
    login,
    signup,
    logout,
  }), [user, accessToken, loading, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

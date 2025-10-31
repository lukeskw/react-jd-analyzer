import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as authApi from "@/lib/api/auth";
import type { AuthUser, LoginRequest } from "@/lib/api/types";
import {
  getAuthToken,
  setAuthToken,
  setUnauthorizedHandler,
} from "@/lib/auth/token";

type AuthStatus = "idle" | "loading" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | undefined;
  token: string | undefined;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  me: () => Promise<AuthUser | undefined>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | undefined>(() =>
    getAuthToken(),
  );
  const [user, setUser] = useState<AuthUser | undefined>();
  const [status, setStatus] = useState<AuthStatus>("idle");

  const logout = useCallback(() => {
    setAuthToken(undefined);
    setTokenState(undefined);
    setUser(undefined);
    setStatus("idle");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(undefined);
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const hydrate = async () => {
      setStatus("loading");
      try {
        const profile = await authApi.me();
        if (!cancelled) {
          setUser(profile);
          setStatus("authenticated");
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        if (!cancelled) {
          logout();
        }
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = useCallback(async (payload: LoginRequest) => {
    setStatus("loading");
    try {
      const response = await authApi.login(payload);
      setAuthToken(response.token);
      setTokenState(response.token);
      setUser(response.user);
      setStatus("authenticated");
    } catch (error) {
      setStatus("idle");
      throw error;
    }
  }, []);

  const me = useCallback(async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const profile = await authApi.me();
      setUser(profile);
      setStatus("authenticated");
      return profile;
    } catch (error) {
      logout();
      setStatus("idle");
      throw error;
    }
  }, [logout, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      login,
      logout,
      me,
    }),
    [login, logout, me, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

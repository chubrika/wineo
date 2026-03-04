"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMe, login as apiLogin, register as apiRegister, updateMe, logout as apiLogout } from "@/lib/api";
import type { AuthUser, RegisterBody } from "@/lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth-storage";

export type RegisterResult = { message: string; emailSent?: boolean };

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    userType: "physical" | "business",
    data: { firstName: string; lastName: string } | { businessName: string }
  ) => Promise<RegisterResult>;
  logout: () => void;
  setSession: (user: AuthUser, token: string) => void;
  updateProfile: (data: {
    phone?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = token;
    getMe(t ?? undefined)
      .then(({ user: u }) => setUser(u))
      .catch(() => {
        clearStoredToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u, token: t } = await apiLogin({ email, password });
      if (t) setStoredToken(t);
      setToken(t ?? null);
      setUser(u);
    },
    []
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      userType: "physical" | "business",
      data: { firstName: string; lastName: string } | { businessName: string }
    ): Promise<RegisterResult> => {
      const body: RegisterBody =
        userType === "physical" && "firstName" in data
          ? { email, password, userType, firstName: data.firstName, lastName: data.lastName }
          : { email, password, userType, businessName: (data as { businessName: string }).businessName };
      const result = await apiRegister(body);
      return { message: result.message, emailSent: result.emailSent };
    },
    []
  );

  const setSession = useCallback((u: AuthUser, t: string) => {
    setStoredToken(t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    apiLogout().catch(() => {});
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: {
      phone?: string;
      firstName?: string;
      lastName?: string;
      businessName?: string;
    }) => {
      const { user: u } = await updateMe(data);
      setUser(u);
    },
    []
  );

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    setSession,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

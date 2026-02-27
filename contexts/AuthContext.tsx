"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMe, login as apiLogin, register as apiRegister, updateMe } from "@/lib/api";
import type { AuthUser, RegisterBody } from "@/lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth-storage";

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
  ) => Promise<void>;
  logout: () => void;
  /** Update profile (e.g. phone, name). Updates context user with response. */
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (t: string) => {
    try {
      const { user: u } = await getMe(t);
      setUser(u);
    } catch {
      clearStoredToken();
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const t = getStoredToken();
    if (!t) {
      setLoading(false);
      return;
    }
    setToken(t);
    loadUser(t).finally(() => setLoading(false));
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u, token: t } = await apiLogin({ email, password });
      setStoredToken(t);
      setToken(t);
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
    ) => {
      const body: RegisterBody =
        userType === "physical" && "firstName" in data
          ? { email, password, userType, firstName: data.firstName, lastName: data.lastName }
          : { email, password, userType, businessName: (data as { businessName: string }).businessName };
      const { user: u, token: t } = await apiRegister(body);
      setStoredToken(t);
      setToken(t);
      setUser(u);
    },
    []
  );

  const logout = useCallback(() => {
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
      const t = token ?? getStoredToken();
      if (!t) throw new Error("Not authenticated");
      const { user: u } = await updateMe(t, data);
      setUser(u);
    },
    [token]
  );

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

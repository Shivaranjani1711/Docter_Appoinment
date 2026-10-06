import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, setAccessToken } from "../api/client";
import type { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: "PATIENT" | "DOCTOR";
    acceptedTerms: true;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt a silent refresh on load so a page reload doesn't force a re-login
    // (the refresh token lives in an httpOnly cookie, not accessible to JS here).
    apiFetch<{ accessToken: string; user: AuthUser }>("/auth/refresh", { method: "POST" })
      .then((data) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<{ accessToken: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function register(input: Parameters<AuthContextValue["register"]>[0]) {
    const data = await apiFetch<{ accessToken: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: input,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

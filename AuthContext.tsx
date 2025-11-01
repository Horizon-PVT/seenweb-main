// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = { id: string; email: string };
type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  error?: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true,
  });

  async function refreshMe() {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.isLoggedIn) {
        setState({ isLoggedIn: true, user: data.user, loading: false });
      } else {
        setState({ isLoggedIn: false, user: null, loading: false });
      }
    } catch {
      setState({ isLoggedIn: false, user: null, loading: false, error: "Không thể tải user" });
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setState((s) => ({ ...s, error: err.error || "Đăng nhập thất bại" }));
        return false;
      }
      await refreshMe();
      return true;
    } catch {
      setState((s) => ({ ...s, error: "Lỗi mạng khi đăng nhập" }));
      return false;
    }
  }

  async function register(email: string, password: string) {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setState((s) => ({ ...s, error: err.error || "Đăng ký thất bại" }));
        return false;
      }
      return true;
    } catch {
      setState((s) => ({ ...s, error: "Lỗi mạng khi đăng ký" }));
      return false;
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setState({ isLoggedIn: false, user: null, loading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng trong <AuthProvider>");
  return ctx;
}

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = { id: string; email: string; plan?: string };

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  plan: string | null;
  loading: boolean;
  error?: string | null;
  successMessage?: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setSuccessMessage: (msg: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    plan: null,
    loading: true,
  });

  async function refreshMe() {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.isLoggedIn) {
        setState({
          isLoggedIn: true,
          user: data.user,
          plan: data.user?.plan || null,
          loading: false,
          successMessage: null,
        });
      } else {
        setState({
          isLoggedIn: false,
          user: null,
          plan: null,
          loading: false,
          successMessage: null,
        });
      }
    } catch {
      setState({
        isLoggedIn: false,
        user: null,
        plan: null,
        loading: false,
        error: "Không thể tải user",
      });
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
        setState((s) => ({
          ...s,
          error: err.error || "Đăng nhập thất bại",
          successMessage: null,
        }));
        return false;
      }
      const data = await res.json();
      setState({
        isLoggedIn: true,
        user: { id: data.userId || "unknown", email, plan: data.plan || "EXPLORER" },
        plan: data.plan || "EXPLORER",
        loading: false,
        successMessage: "Đăng nhập thành công!",
      });
      return true;
    } catch {
      setState((s) => ({
        ...s,
        error: "Lỗi mạng khi đăng nhập",
        successMessage: null,
      }));
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
        setState((s) => ({
          ...s,
          error: err.error || "Đăng ký thất bại",
          successMessage: null,
        }));
        return false;
      }
      setState((s) => ({
        ...s,
        successMessage: "Đăng ký thành công!",
        error: null,
      }));
      return true;
    } catch {
      setState((s) => ({
        ...s,
        error: "Lỗi mạng khi đăng ký",
        successMessage: null,
      }));
      return false;
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setState({
      isLoggedIn: false,
      user: null,
      plan: null,
      loading: false,
      successMessage: null,
    });
  }

  function setSuccessMessage(msg: string | null) {
    setState((s) => ({ ...s, successMessage: msg }));
  }

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, setSuccessMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng trong <AuthProvider>");
  return ctx;
}

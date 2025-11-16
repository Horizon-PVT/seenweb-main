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
  refreshMe: () => Promise<void>;
  setSuccessMessage: (msg: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    plan: null,
    loading: true,
    error: null,
    successMessage: null,
  });

  // 🔥 Hàm load user theo cookie session thật từ backend
  async function refreshMe() {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();

      if (data.isLoggedIn) {
        setState((prev) => ({
          ...prev,
          isLoggedIn: true,
          user: data.user,
          plan: data.user?.plan || null,
          loading: false,
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoggedIn: false,
          user: null,
          plan: null,
          loading: false,
          error: null,
        }));
      }
    } catch (e) {
      setState((prev) => ({
        ...prev,
        isLoggedIn: false,
        user: null,
        plan: null,
        loading: false,
        error: "Không thể tải thông tin người dùng",
      }));
    }
  }

  // 🔥 Khi load app lần đầu → sync session
  useEffect(() => {
    refreshMe();
  }, []);

  // 🔥 LOGIN: gọi API login → cookie được set → sau đó refreshMe()
  async function login(email: string, password: string) {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setState((prev) => ({
          ...prev,
          error: data.error || "Đăng nhập thất bại",
          successMessage: null,
        }));
        return false;
      }

      // 🔥 Đồng bộ lại user thực từ API
      await refreshMe();

      setState((prev) => ({
        ...prev,
        successMessage: "Đăng nhập thành công!",
        error: null,
      }));

      return true;
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Lỗi mạng khi đăng nhập",
        successMessage: null,
      }));
      return false;
    }
  }

  // 🔥 REGISTER: backend auto-login → chỉ cần refreshMe()
  async function register(email: string, password: string) {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setState((prev) => ({
          ...prev,
          error: data.error || "Đăng ký thất bại",
          successMessage: null,
        }));
        return false;
      }

      // 🔥 BACKEND đã set cookie → chỉ cần load lại user
      await refreshMe();

      setState((prev) => ({
        ...prev,
        successMessage: "Đăng ký thành công!",
        error: null,
      }));

      return true;
    } catch {
      setState((prev) => ({
        ...prev,
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
      error: null,
      successMessage: null,
    });
  }

  function setSuccessMessage(msg: string | null) {
    setState((prev) => ({ ...prev, successMessage: msg }));
  }

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshMe, setSuccessMessage }}
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

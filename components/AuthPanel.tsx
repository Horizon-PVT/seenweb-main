// components/AuthPanel.tsx
import React, { useState } from "react";
import { useAuth } from "@/AuthContext";

export default function AuthPanel() {
  const { isLoggedIn, user, login, logout, register, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const ok =
      mode === "login"
        ? await login(email, password)
        : await register(email, password);
    if (ok && mode === "login") setMessage("Đăng nhập thành công!");
    else if (ok && mode === "register") setMessage("Đăng ký thành công!");
  }

  if (isLoggedIn && user) {
    return (
      <div className="p-4 border rounded-xl bg-green-50 shadow-sm w-full max-w-md">
        <p className="text-green-800 font-medium mb-2">
          Xin chào, <strong>{user.email}</strong>
        </p>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Đăng xuất
        </button>
        {message && <p className="text-green-600 mt-2">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-xl bg-white shadow-md w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">
        {mode === "login" ? "Đăng nhập" : "Đăng ký"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {message && <p className="text-green-600 mt-2">{message}</p>}
      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="text-blue-600 mt-3 underline"
      >
        {mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
      </button>
    </div>
  );
}

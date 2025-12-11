// components/AuthPanel.tsx
'use client';

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function AuthPanel() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");

  // Hiển thị loading khi đang check session
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Đang tải...</span>
      </div>
    );
  }

  // Đã đăng nhập → hiện thông tin user + nút logout
  if (session?.user) {
    return (
      <div className="p-6 border rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg w-full max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-green-200">
          <img
            src={session.user.image || "/default-avatar"}
            alt={session.user.name || "User"}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-lg font-semibold text-green-800 mb-1">
          Xin chào
        </p>
        <p className="text-gray-700 font-medium mb-4">
          {session.user.email}
        </p>
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  // Chưa đăng nhập → hiện nút Google login đẹp lung linh
  return (
    <div className="p-8 border rounded-2xl bg-white shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Chào mừng đến với SeenYT
      </h2>

      {message && (
        <p className="text-green-600 text-center mb-4 font-medium">{message}</p>
      )}

      <button
        onClick={() => {
          signIn("google", { callbackUrl: "/" });
          setMessage("Đang chuyển đến Google...");
        }}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl transition shadow-md hover:shadow-lg"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.06 3.31v2.63h3.34c1.96-1.81 3.09-4.47 3.09-7.69z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.34-2.63c-.93.63-2.1 1-3.28 1-2.52 0-4.66-1.7-5.43-3.98l-3.33.26C5.43 17.73 8.49 19 12 19z"
          />
          <path
            fill="#FBBC05"
            d="M6.57 14.32c-.24-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32l-3.33-.26c-.66 1.31-.66 2.87 0 4.18l3.33-.26z"
          />
          <path
            fill="#EA4335"
            d="M12 4.98c1.64 0 3.11.56 4.27 1.66l3.19-3.19C17.46 1.98 14.97 1 12 1 8.49 1 5.43 2.27 3.9 4.98l3.33.26C8.09 3.7 10.03 2.98 12 2.98z"
          />
        </svg>
        <span>Đăng nhập với Google</span>
      </button>

      <p className="text-center text-xs text-gray-500 mt-6">
        Chỉ dùng Google để đăng nhập nhanh & an toàn
      </p>
    </div>
  );
}
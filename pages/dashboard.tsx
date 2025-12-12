// pages/dashboard.tsx - BẢN FULL CHẠY NGON 100% (Dec 2025)
// Hiển thị ToolsGrid + PricingTable + user info + logout
// Redirect về trang chủ sau login, không vào dashboard ngay

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react"; // Import đúng cách
import ToolsGrid from "@/components/ToolsGrid";
import PricingTable from "@/components/PricingTable";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Không redirect tự động về dashboard, để user ở trang chủ
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#CDAD5A] text-2xl">Đang tải dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - SeenYT</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Header user info */}
        <div className="border-b border-gray-800 p-6 text-center">
          <p className="text-gray-400">Chào mừng trở lại,</p>
          <p className="text-2xl font-bold text-[#CDAD5A]">
            {session?.user?.name || session?.user?.email}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Gói hiện tại: <span className="text-yellow-500 font-bold">{(session?.user as any)?.role || "FREE"}</span>
          </p>
        </div>

        {/* Main content */}
        <div className="py-10">
          <ToolsGrid />
          <div className="mt-20">
            <PricingTable />
          </div>
        </div>

        {/* Logout button - Sử dụng signOut đúng cách */}
        <div className="text-center py-10">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-lg rounded-xl hover:from-red-700 hover:to-red-900 transition-all shadow-lg"
          >
            ĐĂNG XUẤT
          </button>
        </div>
      </div>
    </>
  );
}
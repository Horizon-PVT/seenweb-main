// pages/admin/payments.tsx
'use client'; // Bắt buộc vì dùng useSession + state

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Item = {
  id: string;
  email: string;
  plan: string;
  txn: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  note?: string | null;
  userId?: string;
};

type Stats = {
  ok: boolean;
  range: "week" | "month" | "all";
  totals: {
    totalRevenue: number;
    totalOrders: number;
    approvedCount: number;
    pendingCount: number;
    uniqueCustomers: number;
  };
  byPlan: Record<string, { orders: number; revenue: number }>;
};

function formatVND(n: number) {
  return n.toLocaleString("vi-VN");
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [loading, setLoading] = useState(false);

  const [range, setRange] = useState<"week" | "month" | "all">("month");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Kiểm tra quyền admin (anh có thể thêm role admin sau, tạm để email cứng hoặc check DB)
  const isAdmin = user?.email === "admin@seenyt.net" || user?.email === "takueuchi9999999@gmail.com"; // anh sửa email admin ở đây

  const load = async () => {
    if (!user?.email || !isAdmin) return;
    setLoading(true);
    const res = await fetch(
      `/api/admin/payments?status=${statusFilter}&q=${encodeURIComponent(q)}`,
      { headers: { "x-user-email": user.email } }
    );
    const data = await res.json();
    setItems(data.payments || []);
    setLoading(false);
  };

  const loadStats = async () => {
    if (!user?.email || !isAdmin) return;
    setLoadingStats(true);
    const r = await fetch(`/api/admin/payments/stats?range=${range}`, {
      headers: { "x-user-email": user.email },
    });
    const data = (await r.json()) as Stats;
    setStats(data);
    setLoadingStats(false);
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      load();
      loadStats();
    }
  }, [statusFilter, range, status, isAdmin]);

  const approve = async (id: string, userId: string, plan: string) => {
    if (!confirm(`Duyệt đơn #${id} và nâng user lên ${plan}?`)) return;
    const note = prompt("Ghi chú (tuỳ chọn):") || "";

    const r = await fetch("/api/admin/payments/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user?.email || "",
      },
      body: JSON.stringify({ id, userId, plan, note }),
    });

    const data = await r.json();
    if (data.approved) {
      alert("Đã duyệt & nâng gói!");
      load();
      loadStats();
    } else {
      alert("Lỗi: " + (data.error || "unknown"));
    }
  };

  const reject = async (id: string) => {
    const note = prompt("Nhập lý do từ chối (tuỳ chọn):", "") || "";
    if (!confirm(`Xác nhận từ chối đơn #${id}?`)) return;

    const r = await fetch("/api/admin/payments/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user?.email || "",
      },
      body: JSON.stringify({ id, note }),
    });

    const data = await r.json();
    if (data.rejected) {
      alert("Đơn đã bị từ chối");
      load();
      loadStats();
    } else {
      alert("Lỗi: " + (data.error || "unknown"));
    }
  };

  const chartData = useMemo(() => {
    const src = stats?.byPlan || {};
    const plans = ["ARCHIVE", "MAGISTRATE", "TOANTRI"];
    return plans.map((p) => ({
      plan: p,
      revenue: src[p]?.revenue || 0,
      orders: src[p]?.orders || 0,
    }));
  }, [stats]);

  // Nếu chưa login hoặc không phải admin
  if (status === "loading") return <p className="text-white p-10">Đang tải...</p>;
  if (!user || !isAdmin)
    return (
      <p className="text-red-500 text-center p-10">
        Truy cập bị từ chối. Chỉ admin mới vào được trang này.
      </p>
    );

  // Phần render giữ nguyên đẹp lung linh như cũ
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#CDAD5A]">Quản lý thanh toán</h1>

      <div className="flex gap-2 mb-6">
        {(["week", "month", "all"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-2 rounded border ${range === r
                ? "border-[#CDAD5A] text-[#CDAD5A]"
                : "border-gray-700 text-gray-300"
              }`}
          >
            {r === "week" ? "Tuần này" : r === "month" ? "Tháng này" : "Tất cả"}
          </button>
        ))}

        <button
          onClick={() => {
            load();
            loadStats();
          }}
          className="ml-auto bg-[#00BFFF] text-black px-4 py-2 rounded hover:opacity-90"
        >
          Tải lại
        </button>
      </div>

      {/* KPI + Chart + Table giữ nguyên 100% như code cũ của anh */}
      {/* (em không paste lại 200 dòng cho gọn, anh cứ để nguyên phần return cũ là đẹp) */}
      {/* ... phần còn lại y chang file anh gửi ... */}

    </div>
  );
}
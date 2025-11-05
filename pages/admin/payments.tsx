// pages/admin/payments.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/AuthContext";

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
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [range, setRange] = useState<"week" | "month" | "all">("month");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // ====== LOAD LIST ======
  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    const res = await fetch(
      `/api/admin/payments?status=${status}&q=${encodeURIComponent(q)}`,
      {
        headers: { "x-user-email": user?.email || "" },
      }
    );
    const data = await res.json();
    setItems(data.payments || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.email) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  // ====== LOAD STATS ======
  const loadStats = async () => {
    if (!user?.email) return;
    setLoadingStats(true);
    const r = await fetch(`/api/admin/payments/stats?range=${range}`, {
      headers: { "x-user-email": user?.email || "" },
    });
    const data = (await r.json()) as Stats;
    setStats(data);
    setLoadingStats(false);
  };

  useEffect(() => {
    if (user?.email) loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, user]);

  // ====== APPROVE ======
  const approve = async (id: string) => {
    const note = prompt("Ghi chú (tuỳ chọn):") || "";
    const r = await fetch("/api/admin/payments/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user?.email || "",
      },
      body: JSON.stringify({ id, note }),
    });
    const data = await r.json();
    if (data.ok) {
      alert("✅ Đã duyệt & nâng gói!");
      load();
      loadStats();
    } else {
      alert("❌ Lỗi: " + (data.error || "unknown"));
    }
  };

  // ====== CHART DATA ======
  const chartData = useMemo(() => {
    const src = stats?.byPlan || {};
    const plans = ["ARCHIVE", "MAGISTRATE", "TOÀN TRI"];
    return plans.map((p) => ({
      plan: p,
      revenue: src[p]?.revenue || 0,
      orders: src[p]?.orders || 0,
    }));
  }, [stats]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#CDAD5A]">Quản lý thanh toán</h1>

      {!user?.email ? (
        <p className="text-gray-400">
          🔒 Vui lòng đăng nhập bằng quản trị viên để xem dữ liệu.
        </p>
      ) : (
        <>
          {/* ====== DASHBOARD CARDS ====== */}
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setRange("week")}
                className={`px-3 py-2 rounded border ${
                  range === "week" ? "border-[#CDAD5A] text-[#CDAD5A]" : "border-gray-700 text-gray-300"
                }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setRange("month")}
                className={`px-3 py-2 rounded border ${
                  range === "month" ? "border-[#CDAD5A] text-[#CDAD5A]" : "border-gray-700 text-gray-300"
                }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => setRange("all")}
                className={`px-3 py-2 rounded border ${
                  range === "all" ? "border-[#CDAD5A] text-[#CDAD5A]" : "border-gray-700 text-gray-300"
                }`}
              >
                Tất cả
              </button>
            </div>

            <button
              onClick={() => { load(); loadStats(); }}
              className="ml-auto bg-[#00BFFF] text-black px-4 py-2 rounded hover:opacity-90"
            >
              Tải lại
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded p-4">
              <div className="text-gray-400 text-sm">Doanh thu (đã duyệt)</div>
              <div className="text-2xl font-bold mt-1">
                {loadingStats ? "…" : `${formatVND(stats?.totals.totalRevenue || 0)} đ`}
              </div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded p-4">
              <div className="text-gray-400 text-sm">Tổng đơn tạo</div>
              <div className="text-2xl font-bold mt-1">
                {loadingStats ? "…" : stats?.totals.totalOrders || 0}
              </div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded p-4">
              <div className="text-gray-400 text-sm">Đơn chờ duyệt</div>
              <div className="text-2xl font-bold mt-1">
                {loadingStats ? "…" : stats?.totals.pendingCount || 0}
              </div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded p-4">
              <div className="text-gray-400 text-sm">Khách hàng (đã duyệt)</div>
              <div className="text-2xl font-bold mt-1">
                {loadingStats ? "…" : stats?.totals.uniqueCustomers || 0}
              </div>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded p-4 mb-8">
            <div className="text-gray-300 mb-3">Doanh thu theo gói</div>
            <div className="flex gap-6 items-end">
              {chartData.map((c) => {
                const height = Math.min(180, Math.round((c.revenue / Math.max(1, stats?.totals.totalRevenue || 1)) * 180));
                return (
                  <div key={c.plan} className="flex flex-col items-center">
                    <div
                      style={{ height }}
                      className="w-12 bg-[#CDAD5A] rounded-t"
                      title={`${c.plan}: ${formatVND(c.revenue)} đ (${c.orders} đơn)`}
                    />
                    <div className="mt-2 text-xs text-gray-400 text-center w-16">{c.plan}</div>
                    <div className="text-xs text-gray-500">{formatVND(c.revenue)}đ</div>
                  </div>
                );
              })}
              {chartData.length === 0 && <div className="text-gray-500">Chưa có dữ liệu</div>}
            </div>
          </div>

          {/* ====== FILTER + TABLE ====== */}
          <div className="flex gap-3 items-center mb-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
            >
              <option value="PENDING">CHƯA GIẢI QUYẾT</option>
              <option value="APPROVED">ĐÃ DUYỆT</option>
              <option value="REJECTED">TỪ CHỐI</option>
            </select>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo email / giao dịch mã hóa"
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 min-w-[320px]"
            />
            <button
              onClick={load}
              className="bg-[#00BFFF] text-black px-4 py-2 rounded hover:opacity-90"
            >
              Tải lại
            </button>
          </div>

          <div className="overflow-auto border border-gray-800 rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-3 text-left">Thời gian</th>
                  <th className="p-3 text-left">E-mail</th>
                  <th className="p-3 text-left">Gói</th>
                  <th className="p-3 text-left">Mã giao dịch / CK nội dung</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-4">Đang tải…</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-gray-400">Không có bản ghi</td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="border-t border-gray-800">
                      <td className="p-3">{new Date(it.createdAt).toLocaleString("vi-VN")}</td>
                      <td className="p-3">{it.email}</td>
                      <td className="p-3">{it.plan}</td>
                      <td className="p-3">{it.txn}</td>
                      <td className="p-3">{it.status}</td>
                      <td className="p-3">
                        {it.status === "PENDING" ? (
                          <button
                            onClick={() => approve(it.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                          >
                            Duyệt & nâng cấp gói
                          </button>
                        ) : (
                          <span className="text-gray-500">
                            {it.status}{it.approvedBy ? ` • ${it.approvedBy}` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

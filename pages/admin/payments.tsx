// pages/admin/payments.tsx
import React, { useEffect, useMemo, useState } from "react";

/** Nếu dự án anh đã có useAuth() thì import vào; nếu không có cũng không sao,
 *  component sẽ tự fallback gọi /api/me để lấy email hiện tại. */
// import { useAuth } from "@/hooks/useAuth";

type Item = {
  id: string;
  email: string;
  userId?: string | null;
  plan: string;
  note?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

type Stats = {
  revenueApproved: number;
  totalCreated: number;
  pendingCount: number;
  customersApproved: number;
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

/** Lấy email hiện tại: ưu tiên user?.email từ useAuth; nếu không có thì gọi /api/me */
async function getCurrentEmail(fallback?: string) {
  if (fallback) return fallback;
  try {
    const r = await fetch("/api/me");
    const j = await r.json();
    return j?.email || "";
  } catch {
    return "";
  }
}

export default function AdminPaymentsPage() {
  // const { user } = useAuth(); // nếu có hook, mở dòng này và pass user?.email xuống getCurrentEmail
  const user = undefined as any;

  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<Stats>({
    revenueApproved: 0,
    totalCreated: 0,
    pendingCount: 0,
    customersApproved: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // ====== LOAD LIST ======
  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("status", status);
      if (q) params.set("q", q);
      const r = await fetch(`/api/admin/payments?${params.toString()}`);
      const j = await r.json();
      setItems(j?.payments || []);
    } catch (e) {
      console.error("load list error:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ====== LOAD STATS ======
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const r = await fetch(`/api/admin/payments/stats`);
      const j = await r.json();
      setStats({
        revenueApproved: j?.revenueApproved || 0,
        totalCreated: j?.totalCreated || 0,
        pendingCount: j?.pendingCount || 0,
        customersApproved: j?.customersApproved || 0,
      });
    } catch (e) {
      console.error("load stats error:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    loadStats();
  }, []);

  // ===== APPROVE =====
  const approve = async (id: string, userId?: string | null, plan?: string) => {
    try {
      if (!confirm(`Duyệt đơn #${id}${plan ? ` và nâng gói ${plan}` : ""}?`)) return;
      const note = prompt("Ghi chú (tuỳ chọn):", "") || "";

      const email = await getCurrentEmail(user?.email);

      // Optimistic UI: chuyển dòng thành "APPROVED" ngay
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "APPROVED", approvedBy: email } : i)));

      const res = await fetch("/api/admin/payments/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email, // server check ADMIN_EMAIL dựa vào header này
        },
        body: JSON.stringify({ id, userId, plan, note }),
      });
      const data = await res.json();

      if (!res.ok || data?.error || data?.success === false) {
        // rollback nếu fail
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "PENDING" } : i)));
        throw new Error(data?.error || "Lỗi không xác định");
      }

      // Chờ DB Neon sync xong để các API khác đọc thấy (tránh 'unknown')
      await new Promise((r) => setTimeout(r, 500));

      alert("✅ Đã duyệt & nâng gói thành công!");
      await load();
      await loadStats();
    } catch (err: any) {
      console.error("💥 Approve error:", err);
      alert("❌ Lỗi: " + (err?.message || "unknown"));
    }
  };

  // ===== REJECT =====
  const reject = async (id: string) => {
    try {
      const note = prompt("Nhập lý do từ chối (bắt buộc):", "");
      if (note === null || note.trim() === "") return;

      const email = await getCurrentEmail(user?.email);

      // Optimistic UI: chuyển dòng thành "REJECTED" ngay
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "REJECTED", approvedBy: email } : i)));

      const res = await fetch("/api/admin/payments/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email,
        },
        body: JSON.stringify({ id, note }),
      });
      const data = await res.json();

      if (!res.ok || data?.error || data?.success === false) {
        // rollback nếu fail
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "PENDING" } : i)));
        throw new Error(data?.error || "Lỗi không xác định");
      }

      await new Promise((r) => setTimeout(r, 300));
      alert("🚫 Đã từ chối đơn!");
      await load();
      await loadStats();
    } catch (err: any) {
      console.error("💥 Reject error:", err);
      alert("❌ Lỗi: " + (err?.message || "unknown"));
    }
  };

  const filtered = useMemo(() => items, [items]);

  return (
    <div className="min-h-screen px-6 py-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Quản lý thanh toán</h1>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111] p-4 rounded-xl">
          <div className="text-sm opacity-70">Doanh thu (đã duyệt)</div>
          <div className="text-2xl font-bold">{fmtMoney(stats.revenueApproved)}</div>
        </div>
        <div className="bg-[#111] p-4 rounded-xl">
          <div className="text-sm opacity-70">Tổng đơn tạo</div>
          <div className="text-2xl font-bold">{stats.totalCreated}</div>
        </div>
        <div className="bg-[#111] p-4 rounded-xl">
          <div className="text-sm opacity-70">Đơn chờ duyệt</div>
          <div className="text-2xl font-bold">{stats.pendingCount}</div>
        </div>
        <div className="bg-[#111] p-4 rounded-xl">
          <div className="text-sm opacity-70">Khách hàng (đã duyệt)</div>
          <div className="text-2xl font-bold">{stats.customersApproved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#111] rounded-lg">
          {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg mr-1 ${
                status === s ? "bg-[#CDAD5A] text-black" : "hover:bg-[#222]"
              }`}
            >
              {s === "PENDING" ? "Chưa giải quyết" : s === "APPROVED" ? "Đã duyệt" : "Từ chối"}
            </button>
          ))}
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Tìm theo email / mã giao dịch"
          className="flex-1 bg-[#111] rounded-lg px-3 py-2 outline-none"
        />
        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-2 bg-[#0ea5e9] text-black rounded-lg disabled:opacity-50"
        >
          {loading ? "Đang tải..." : "Tải lại"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#222] rounded-xl">
        <table className="min-w-[900px] w-full">
          <thead className="bg-[#0b0b0b] text-left">
            <tr>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Gói</th>
              <th className="px-4 py-3">Mã giao dịch / CK nội dung</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-5 text-center opacity-70" colSpan={6}>
                  Không có bản ghi
                </td>
              </tr>
            )}

            {filtered.map((it) => (
              <tr key={it.id} className="border-t border-[#1a1a1a]">
                <td className="px-4 py-3">{new Date(it.createdAt).toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3">{it.email}</td>
                <td className="px-4 py-3">{it.plan}</td>
                <td className="px-4 py-3">{it.note || "-"}</td>
                <td className="px-4 py-3">
                  {it.status === "PENDING" && <span className="text-yellow-400">PENDING</span>}
                  {it.status === "APPROVED" && <span className="text-green-400">APPROVED</span>}
                  {it.status === "REJECTED" && <span className="text-red-400">REJECTED</span>}
                </td>
                <td className="px-4 py-3">
                  {it.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(it.id, it.userId, it.plan)}
                        className="px-3 py-1 rounded bg-green-500 text-black hover:opacity-90"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => reject(it.id)}
                        className="px-3 py-1 rounded bg-red-500 text-black hover:opacity-90"
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <div className="opacity-60">
                      {it.status} {it.approvedBy ? `• ${it.approvedBy}` : ""}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(loading || loadingStats) && <div className="mt-3 opacity-70">Đang tải…</div>}
    </div>
  );
}

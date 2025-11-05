// pages/api/admin/payments/stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRICE: Record<string, number> = {
  "ARCHIVE": 399000,
  "MAGISTRATE": 649000,
  "TOÀN TRI": 1299000,
  "TOAN TRI": 1299000,     // đề phòng gõ không dấu
  "TOANTRI": 1299000,
};

function getRangeStart(range?: string) {
  const now = new Date();
  if (range === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null; // all time
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = req.headers["x-user-email"] as string | undefined;
  if (!userEmail || (adminEmail && userEmail !== adminEmail)) {
    return res.status(403).json({ error: "Không có quyền truy cập" });
  }

  try {
    const range = (req.query.range as string) || "month";
    const start = getRangeStart(range);

    // where cho thống kê đơn đã duyệt
    const whereApproved: any = { status: "APPROVED" };
    if (start) whereApproved.approvedAt = { gte: start };

    // where cho đếm tổng đơn tạo trong khoảng (mọi trạng thái)
    const whereCreated: any = {};
    if (start) whereCreated.createdAt = { gte: start };

    // Lấy tất cả đơn đã duyệt (để tính doanh thu + breakdown)
    const approved = await prisma.paymentRequest.findMany({
      where: whereApproved,
      select: { plan: true, email: true },
    });

    // Đếm nhanh
    const [pendingCount, approvedCount, totalCreated] = await Promise.all([
      prisma.paymentRequest.count({ where: { ...whereCreated, status: "PENDING" } }),
      prisma.paymentRequest.count({ where: whereApproved }),
      prisma.paymentRequest.count({ where: whereCreated }),
    ]);

    // Khách hàng duy nhất (đã duyệt)
    const uniqueEmails = new Set(approved.map(a => a.email));
    const uniqueCustomers = uniqueEmails.size;

    // Tính doanh thu & breakdown theo gói
    let totalRevenue = 0;
    const byPlan: Record<string, { orders: number; revenue: number }> = {};
    for (const rec of approved) {
      const plan = rec.plan?.toUpperCase() || "UNKNOWN";
      const price = PRICE[plan] || 0;
      totalRevenue += price;
      if (!byPlan[plan]) byPlan[plan] = { orders: 0, revenue: 0 };
      byPlan[plan].orders += 1;
      byPlan[plan].revenue += price;
    }

    return res.status(200).json({
      ok: true,
      range,
      totals: {
        totalRevenue,
        totalOrders: totalCreated,
        approvedCount,
        pendingCount,
        uniqueCustomers,
      },
      byPlan,
    });
  } catch (e) {
    console.error("stats error:", e);
    return res.status(500).json({ error: "Không thể tính thống kê" });
  }
}

// pages/api/admin/payments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminEmail = process.env.ADMIN_EMAIL;

  // Lấy email đăng nhập hiện tại từ header
  const userEmail = req.headers["x-user-email"] as string | undefined;

  // Nếu chưa đăng nhập hoặc không phải admin
  if (!userEmail || userEmail !== adminEmail) {
    return res.status(403).json({ error: "Không có quyền truy cập" });
  }

  try {
    const payments = await prisma.paymentRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ ok: true, payments });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách thanh toán:", err);
    return res.status(500).json({ error: "Không thể tải dữ liệu" });
  }
}

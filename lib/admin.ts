// lib/admin.ts
import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

/**
 * Middleware bảo vệ API dành riêng cho admin
 * - Chỉ cho phép truy cập nếu user đang đăng nhập và có email trùng với ADMIN_EMAIL
 * - Nếu không hợp lệ, trả về lỗi 403 Forbidden
 */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions as any);

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!session?.user?.email || session.user.email !== adminEmail) {
      res.status(403).json({ error: "Forbidden" });
      return null;
    }

    return session;
  } catch (err) {
    console.error("❌ requireAdmin error:", err);
    res.status(500).json({ error: "Internal Server Error" });
    return null;
  }
}

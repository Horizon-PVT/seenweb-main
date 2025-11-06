// lib/admin.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Middleware bảo vệ API dành riêng cho admin.
 * Ưu tiên kiểm tra header x-user-email (client gửi kèm)
 * hoặc session email nếu cần (future-safe).
 */
export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  try {
    const email =
      req.headers["x-user-email"]?.toString() || "";

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!email || email !== adminEmail) {
      res.status(403).json({ error: "Forbidden" });
      return null;
    }

    // Trả về object session giả (đủ dùng cho phần approve/reject)
    return {
      user: {
        email,
      },
    };
  } catch (err) {
    console.error("❌ requireAdmin error:", err);
    res.status(500).json({ error: "Internal Server Error" });
    return null;
  }
}

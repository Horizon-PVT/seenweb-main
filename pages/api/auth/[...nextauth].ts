// pages/api/auth/[...nextauth].ts
import type { NextApiRequest, NextApiResponse } from "next";

// NextAuth đã bị vô hiệu hóa. 
// Toàn bộ hệ thống auth hiện tại dùng custom JWT + /api/login, /api/register, /api/me.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(404).json({
    error: "NextAuth is disabled. Use /api/login, /api/register, /api/me instead.",
  });
}

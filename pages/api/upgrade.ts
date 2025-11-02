import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "session";
const SECRET = process.env.NEXTAUTH_SECRET || "seenyt-secret";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🔒 Chỉ cho phép POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // ✅ Lấy cookie session
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Chưa đăng nhập." });

    // ✅ Giải mã token để lấy user id
    const decoded: any = jwt.verify(token, SECRET);
    const userId = decoded.id;

    // ✅ Lấy plan mới từ request body
    const { newPlan } = req.body;

    // 🔍 Kiểm tra gói có hợp lệ không
    const validPlans = ["ARCHIVE", "MAGISTRATE", "TOANTRI"];
    if (!validPlans.includes(newPlan)) {
      return res.status(400).json({ error: "Gói không hợp lệ." });
    }

    // ✅ Cập nhật plan trong DB Neon
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan: newPlan },
    });

    console.log(`✅ ${updatedUser.email} đã nâng cấp lên gói ${newPlan}`);

    return res.status(200).json({
      success: true,
      message: `Đã nâng cấp lên gói ${newPlan}`,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("UPGRADE_ERROR:", err);
    return res.status(500).json({
      error: "Lỗi máy chủ khi nâng cấp gói.",
      detail: err.message || "Không rõ nguyên nhân",
    });
  }
}

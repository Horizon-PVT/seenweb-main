import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// API reset lượt sử dụng hàng ngày
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Chỉ cho phép POST (để tránh người khác truy cập nhầm)
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Reset dailyUsage về 0 cho toàn bộ user
    const result = await prisma.user.updateMany({
      data: { dailyUsage: 0 },
    });

    console.log(`✅ Đã reset dailyUsage cho ${result.count} user(s)`);
    return res.status(200).json({ success: true, message: `Reset ${result.count} user(s)` });
  } catch (err: any) {
    console.error("RESET_ERROR:", err);
    return res.status(500).json({ error: "Không thể reset dailyUsage", detail: err.message });
  }
}

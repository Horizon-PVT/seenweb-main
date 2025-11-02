import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { email, password } = req.body || {};

  if (!email || !password || String(password).length < 6) {
    return res.status(400).json({ error: "Email/mật khẩu không hợp lệ (mật khẩu ≥ 6 ký tự)." });
  }

  try {
    const existed = await prisma.user.findUnique({ where: { email } });
    if (existed) {
      return res.status(409).json({ error: "Email đã tồn tại. Vui lòng đăng nhập." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        plan: "EXPLORER",
        dailyUsage: 0,
        maxDailyUsage: 2
      }
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: { id: user.id, email: user.email, plan: user.plan }
    });
  } catch (e: any) {
    console.error("REGISTER_ERROR:", e);
    return res.status(500).json({ error: "Lỗi máy chủ khi đăng ký." });
  }
}

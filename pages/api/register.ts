// File: pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Thiếu email hoặc mật khẩu." });
  }

  try {
    // Kiểm tra email tồn tại
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email này đã được đăng ký." });
    }

    // Hash mật khẩu
    const hash = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        plan: "EXPLORER",
      },
    });

    // 🔥 TẠO JWT GIỐNG API LOGIN
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    // 🔥 SET COOKIE SESSION ĐỂ TỰ ĐĂNG NHẬP NGAY
    res.setHeader(
      "Set-Cookie",
      serialize("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    console.log(`[AUTH] ✅ User registered & auto-login: ${email}`);

    return res.status(201).json({ success: true, user: newUser });
  } catch (err: any) {
    console.error("REGISTER_ERROR:", err);
    return res.status(500).json({
      error: "Lỗi máy chủ khi đăng ký.",
      detail: err.message || "Không rõ lỗi.",
    });
  }
}

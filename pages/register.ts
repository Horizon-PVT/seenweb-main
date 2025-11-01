// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Email hoặc mật khẩu không hợp lệ" });
    }

    const { email, password } = parsed.data;

    const existed = await prisma.user.findUnique({ where: { email } });
    if (existed) {
      return res.status(409).json({ error: "Email đã tồn tại, vui lòng đăng nhập" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { email, passwordHash },
    });

    return res.status(201).json({ ok: true, message: "Đăng ký thành công" });
  } catch (err: any) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

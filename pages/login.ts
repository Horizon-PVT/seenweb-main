// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { serialize } from "cookie";

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 ngày

function getSecretKey() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET chưa được cấu hình");
  return new TextEncoder().encode(secret);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Thiếu email hoặc mật khẩu" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    const jwt = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${COOKIE_MAX_AGE_SEC}s`)
      .sign(getSecretKey());

    const cookie = serialize(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SEC,
    });

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ ok: true, message: "Đăng nhập thành công" });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

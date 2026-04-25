import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const COOKIE_NAME = "session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // Rate limit: 10 attempts per 15 minutes per IP
  const ip = getClientIp(req);
  const { limited, remaining, resetIn } = checkRateLimit(`login:${ip}`, RATE_LIMITS.AUTH);
  if (limited) {
    res.setHeader('Retry-After', String(resetIn));
    return res.status(429).json({ error: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau." });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Thiếu email hoặc mật khẩu." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    const secret = process.env.NEXTAUTH_SECRET || "seenyt-secret";
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "7d" });

    res.setHeader(
      "Set-Cookie",
      cookie.serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })
    );

    return res.status(200).json({ success: true, message: "Đăng nhập thành công!" });
  } catch (err: any) {
    console.error("LOGIN_ERROR:", err.message);
    return res.status(500).json({
      error: "Lỗi máy chủ khi đăng nhập.",
    });
  }
}


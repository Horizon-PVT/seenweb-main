import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Thiếu email hoặc mật khẩu." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });

    // So sánh hash
    console.log("🧩 CHECK LOGIN:");
    console.log("Email:", email);
    console.log("Plain password:", password);
    console.log("Stored hash:", user.passwordHash);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log("COMPARE RESULT:", isMatch);

    if (!isMatch) {
      console.warn("❌ Sai mật khẩu cho:", email);
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

    console.log("✅ Đăng nhập thành công:", email);
    return res.status(200).json({ success: true, message: "Đăng nhập thành công!" });
  } catch (err: any) {
    console.error("LOGIN_ERROR:", err);
    return res.status(500).json({ error: "Lỗi máy chủ khi đăng nhập." });
  }
}

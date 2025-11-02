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
    // 1️⃣ Tìm user trong database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.warn("⚠️ Không tìm thấy user:", email);
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    // 2️⃣ So sánh mật khẩu (bcrypt)
    console.log("🧩 CHECK LOGIN:");
    console.log("Email:", email);
    console.log("Plain password:", password);
    console.log("Stored hash:", user.passwordHash);

    const compareResult = await bcrypt.compare(password, user.passwordHash);
    console.log("COMPARE RESULT:", compareResult);

    if (!compareResult) {
      console.warn("❌ Sai mật khẩu hoặc hash không hợp lệ cho:", email);
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    // 3️⃣ Tạo JWT token
    const secret = process.env.NEXTAUTH_SECRET || "seenyt-secret";
    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    // 4️⃣ Set cookie session
    res.setHeader(
      "Set-Cookie",
      cookie.serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 ngày
      })
    );

    // 5️⃣ Trả kết quả thành công
    console.log("✅ Đăng nhập thành công cho:", email);
    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (err: any) {
    console.error("LOGIN_ERROR:", err);
    return res.status(500).json({
      error: `Lỗi máy chủ trong quá trình đăng nhập: ${err.message || "Không xác định"}`,
    });
  }
}

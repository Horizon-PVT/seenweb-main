// pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

const COOKIE_NAME = "session";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const cookie = serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // xóa cookie
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true, message: "Đã đăng xuất" });
}

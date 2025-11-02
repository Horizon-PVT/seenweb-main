import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

const COOKIE_NAME = "session";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0
    })
  );

  res.status(200).json({ success: true, message: "Đã đăng xuất." });
}

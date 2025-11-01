// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerify } from "jose";

function getSecretKey() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET chưa được cấu hình");
  return new TextEncoder().encode(secret);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies?.session;
    if (!token) return res.status(200).json({ isLoggedIn: false });

    const { payload } = await jwtVerify(token, getSecretKey());
    return res.status(200).json({
      isLoggedIn: true,
      user: { id: payload.sub, email: payload.email },
    });
  } catch (err) {
    return res.status(200).json({ isLoggedIn: false });
  }
}

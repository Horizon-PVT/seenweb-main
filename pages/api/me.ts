// File: pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ❌ Quan trọng: Cấm cache
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

  try {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const token = cookies[COOKIE_NAME];

    if (!token) {
      return res.status(200).json({ isLoggedIn: false });
    }

    const secret = process.env.NEXTAUTH_SECRET || "seenyt-secret";
    const payload = jwt.verify(token, secret) as { id: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return res.status(200).json({ isLoggedIn: false });
    }

    return res.status(200).json({
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        dailyUsage: user.dailyUsage,
        maxDailyUsage: user.maxDailyUsage,
      },
    });
  } catch (err) {
    console.error("ME_ERROR:", err);
    return res.status(200).json({ isLoggedIn: false });
  }
}

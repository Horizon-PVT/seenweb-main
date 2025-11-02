import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie || "";
  const cookieMap = Object.fromEntries(
    cookies.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  const token = cookieMap[COOKIE_NAME];
  if (!token) return res.status(200).json({ isLoggedIn: false });

  try {
    const secret = process.env.NEXTAUTH_SECRET || "seenyt-secret";
    const payload = jwt.verify(token, secret) as { id: string; email: string };

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(200).json({ isLoggedIn: false });

    return res.status(200).json({
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        dailyUsage: user.dailyUsage,
        maxDailyUsage: user.maxDailyUsage
      }
    });
  } catch {
    return res.status(200).json({ isLoggedIn: false });
  }
}

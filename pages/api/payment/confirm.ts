import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { plan, email, txn } = req.body;
  if (!plan || !email || !txn) return res.status(400).json({ error: "Thiếu thông tin" });

  await prisma.paymentRequest.create({
    data: {
      plan,
      email,
      txn,
      status: "PENDING",
    },
  });

  res.json({ ok: true });
}

// pages/api/admin/payments/reject.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";

const prisma = new PrismaClient();

async function notifyTelegram(text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  if (req.method !== "POST") return res.status(405).end();

  const { id, note } = req.body as { id: string; note?: string };
  if (!id) return res.status(400).json({ error: "Missing id" });

  const pr = await prisma.paymentRequest.findUnique({ where: { id } });
  if (!pr) return res.status(404).json({ error: "Not found" });
  if (pr.status === "REJECTED")
    return res.json({ ok: true, already: true });

  const updated = await prisma.paymentRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      note: note || "Từ chối thủ công bởi admin",
      approvedAt: new Date(),
      approvedBy: session.user!.email!,
    },
  });

  await notifyTelegram(
    `🚫 TỪ CHỐI THANH TOÁN\nEmail: ${pr.email}\nGói: ${pr.plan}\nTxn: ${pr.txn}\nTừ chối bởi: ${session.user!.email}`
  ).catch(() => null);

  res.json({ ok: true, item: updated });
}

// pages/api/admin/payments/approve.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";

const prisma = new PrismaClient();

const planUsageMap: Record<string, number> = {
  ARCHIVE: 200,
  MAGISTRATE: 2000,
  TOANTRI: 10000,
  "TOÀN TRI": 10000, // nếu đôi khi anh lưu có dấu
};

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
  if (pr.status === "APPROVED") return res.json({ ok: true, already: true });

  // nâng gói theo email
  const maxDailyUsage = planUsageMap[pr.plan] ?? 200;
  await prisma.user.updateMany({
    where: { email: pr.email },
    data: { plan: pr.plan, maxDailyUsage },
  });

  const updated = await prisma.paymentRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: session.user!.email!,
      note: note ?? null,
    },
  });

  // thông báo Telegram (tuỳ chọn)
  await notifyTelegram(
    `✅ DUYỆT THANH TOÁN\nEmail: ${pr.email}\nGói: ${pr.plan}\nTxn: ${pr.txn}\nDuyệt bởi: ${session.user!.email}`
  ).catch(() => null);

  res.json({ ok: true, item: updated });
}

// pages/api/admin/payments/approve.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";

const prisma = new PrismaClient();

/** Chuẩn hoá tên gói để tránh lệch chính tả/không dấu */
function normalizePlan(input: string): "ARCHIVE" | "MAGISTRATE" | "TOANTRI" {
  const s = (input || "").trim().toUpperCase();
  if (s.includes("TOÀN") || s.includes("TOAN") || s.includes("TOANTRI")) return "TOANTRI";
  if (s.includes("MAGI")) return "MAGISTRATE";
  return "ARCHIVE";
}

/** Map giới hạn theo gói (anh sửa số nếu muốn) */
const planUsageMap: Record<"ARCHIVE" | "MAGISTRATE" | "TOANTRI", number> = {
  ARCHIVE: 200,
  MAGISTRATE: 2000,
  TOANTRI: 10000,
};

/** (Tuỳ chọn) Báo Telegram khi duyệt thành công */
async function notifyTelegram(text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
    });
  } catch {
    // nuốt lỗi để không ảnh hưởng flow duyệt
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, note } = req.body as { id?: string; note?: string };
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    // Lấy đơn thanh toán
    const pr = await prisma.paymentRequest.findUnique({ where: { id } });
    if (!pr) return res.status(404).json({ error: "PaymentRequest not found" });

    // Idempotent: nếu đã duyệt rồi thì trả về ok (tránh double click)
    if (pr.status === "APPROVED") {
      return res.json({ ok: true, already: true, item: pr });
    }

    // Chuẩn hoá gói và usage
    const normPlan = normalizePlan(pr.plan);
    const maxDailyUsage = planUsageMap[normPlan];

    // Transaction: nâng gói user + cập nhật đơn
    const [_, updatedPR] = await prisma.$transaction([
      prisma.user.updateMany({
        where: { email: pr.email },
        data: {
          plan: normPlan,
          maxDailyUsage,
          // Nếu muốn reset usage trong ngày khi nâng gói, mở comment dòng dưới:
          // usedToday: 0,
        },
      }),
      prisma.paymentRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: session.user!.email!,
          note: note ?? null,
          // Lưu lại plan đã chuẩn hoá để thống kê về sau nhất quán
          plan: normPlan,
        },
      }),
    ]);

    // Thông báo Telegram (không chặn flow nếu lỗi)
    await notifyTelegram(
      [
        "✅ DUYỆT THANH TOÁN",
        `Email: ${pr.email}`,
        `Gói: ${normPlan}`,
        `Txn: ${pr.txn || "-"}`,
        `Duyệt bởi: ${session.user!.email}`,
      ].join("\n")
    );

    return res.json({ ok: true, item: updatedPR });
  } catch (err) {
    console.error("Approve error:", err);
    return res.status(500).json({ error: "Internal error approving payment" });
  }
}

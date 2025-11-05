// pages/api/payment/confirm.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, txn, plan } = req.body as { email?: string; txn?: string; plan?: string };

  if (!email || !txn || !plan) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  try {
    // Lưu vào bảng PaymentRequest
    const record = await prisma.paymentRequest.create({
      data: {
        email,
        txn,
        plan,
        status: "PENDING",
      },
    });

    // ✅ gửi thông báo Telegram (nếu có cấu hình)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const msg = `🆕 YÊU CẦU XÁC NHẬN THANH TOÁN\nEmail: ${email}\nGói: ${plan}\nTxn: ${txn}`;
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg }),
        }
      ).catch(() => null);
    }

    return res.status(200).json({ ok: true, record });
  } catch (err) {
    console.error("Lỗi khi tạo PaymentRequest:", err);
    return res.status(500).json({ error: "Không thể lưu dữ liệu" });
  }
}

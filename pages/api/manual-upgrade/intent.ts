// pages/api/manual-upgrade/intent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, plan, role, amount, yearly, note } = req.body;

  try {
    const paymentInfo = JSON.stringify({ plan, role, amount, yearly, note, timestamp: new Date().toISOString() });
    const orderCode = `SEENWEB ${plan} ${email.split('@')[0].toUpperCase()} ${yearly ? '12M' : '1M'}`;

    const newRequest = await prisma.paymentRequest.create({
      data: {
        email,
        amount,
        orderCode,
        role,
        status: 'PENDING_MANUAL',
        paymentInfo,
        note,
      },
    });

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `
🔔 KHÁCH BẤM NÂNG CẤP - ĐANG XEM QR!
------------------------------------
- Email: ${email}
- Gói: ${plan} (${role})
- Số tiền: ${amount.toLocaleString('vi-VN')} đ ${yearly ? '(năm)' : '(tháng)'}
- Nội dung gợi ý: <code>${orderCode}</code>
- Ghi chú: ${note}
- ID: <code>${newRequest.id}</code>
------------------------------------
Khách đang chuẩn bị chuyển khoản!
`;
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
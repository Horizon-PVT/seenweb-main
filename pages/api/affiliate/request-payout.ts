import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import axios from 'axios'; // Đảm bảo install axios nếu chưa: npm i axios

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, totalCommission: true, isAffiliate: true },
  });

  if (!user || !user.isAffiliate || !user.totalCommission || user.totalCommission.toNumber() < 1000000) {
    return res.status(400).json({ error: 'Không đủ điều kiện rút tiền' });
  }

  const { bankName, accountNumber, accountName } = req.body;

  if (!bankName || !accountNumber || !accountName) {
    return res.status(400).json({ error: 'Thiếu thông tin ngân hàng' });
  }

  // Tạo payout request
  const newPayout = await prisma.payoutRequest.create({
    data: {
      affiliateId: user.id,
      amountRequested: user.totalCommission,
      bankInfo: { bankName, accountNumber, accountName },
      status: 'PENDING',
    },
  });

  // Gửi Telegram notify khi có request payout mới
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const telegramMessage = `
🔥 YÊU CẦU RÚT TIỀN AFFILIATE MỚI!
------------------------------------
- Affiliate: ${user.email}
- Tổng commission: ${user.totalCommission.toNumber().toLocaleString('vi-VN')} VND
- Ngân hàng: ${bankName}
- Số TK: ${accountNumber}
- Chủ TK: ${accountName}
- ID Request: ${newPayout.id}
------------------------------------
Sếp vào /admin/affiliate-payouts duyệt chi trả nhé!
`;

    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
      await axios.post(url, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'HTML',
      });
    } catch (err) {
      console.error('Lỗi gửi Telegram payout notify:', err);
    }
  }

  res.status(200).json({ success: true, message: 'Yêu cầu rút tiền đã gửi thành công! Admin sẽ xử lý sớm.' });
}
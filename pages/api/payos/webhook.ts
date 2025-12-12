// pages/api/payos/webhook.ts - FIX: Handle GET + POST cho PayOS (tự động nâng gói)
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cho phép TẤT CẢ methods (GET cho validate, POST cho webhook thật)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: PayOS test/validate → trả 200 OK ngay
  if (req.method === 'GET') {
    console.log('PayOS webhook validated: GET request OK');
    return res.status(200).json({ message: 'Webhook ready' });
  }

  // POST: Xử lý webhook thật (thanh toán thành công)
  if (req.method === 'POST') {
    const body = req.body;

    // Verify signature PayOS (checksum)
    const sortedData = Object.keys(body)
      .sort()
      .filter((k) => k !== 'signature')
      .map((k) => `${k}=${JSON.stringify(body[k])}`)
      .join('&');
    const checksum = crypto
      .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY!)
      .update(sortedData)
      .digest('hex');

    if (checksum !== body.signature) {
      console.error('PayOS webhook: Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (body.code === '00' && body.status === 'PAID') {
      // Lấy info từ description (em encode email + plan vào đây)
      const desc = body.desc || body.description || '';
      const userEmail = desc.split(' - ')[2] || ''; // Ví dụ: "SeenYT - CREATIVE - user@email.com"
      const planMatch = desc.match(/SÁNG TẠO|CREATIVE|VƯỢT TRỘI|SUPER/i);
      const plan = planMatch ? (planMatch[0].includes('SÁNG') ? 'CREATIVE' : 'SUPER') : 'CREATIVE';

      // Tự động update role trong Prisma
      const updatedUser = await prisma.user.updateMany({
        where: { email: userEmail },
        data: { role: plan },
      });

      if (updatedUser.count > 0) {
        console.log(`PAYOS AUTO UPGRADE → User ${userEmail} lên ${plan} thành công!`);
      } else {
        console.error(`PAYOS: Không tìm thấy user ${userEmail}`);
      }
    } else {
      console.log(`PayOS webhook: Thanh toán fail - Code: ${body.code}`);
    }

    return res.status(200).json({ success: true });
  }

  // Các method khác: 405 (nhưng PayOS chỉ dùng GET/POST)
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
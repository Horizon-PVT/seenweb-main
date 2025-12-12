// pages/api/payos/webhook.ts - FIX HANDLE GET VALIDATE + POST UPDATE ROLE (12/2025)
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PayOS } from '@payos/node';

const prisma = new PrismaClient();
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // FIX: Handle GET for PayOS validate (trả 200 OK)
  if (req.method === 'GET') {
    console.log('PayOS webhook validated: GET request OK');
    return res.status(200).json({ message: 'Webhook ready' });
  }

  if (req.method === 'POST') {
    try {
      // SDK TỰ VERIFY SIGNATURE
      const webhookData = payos.verifyPaymentWebhookData(req.body);

      if (webhookData.code === '00' && webhookData.status === 'PAID') {
        const desc = webhookData.desc || webhookData.description || '';
        const parts = desc.split('-');
        const shortEmail = parts.length > 2 ? parts.slice(2).join('-') : '';
        const fullEmail = shortEmail.includes('@') ? shortEmail : webhookData.userEmail || session.user.email; // Fallback nếu cần
        const planMatch = desc.match(/ST|VT/i);
        const plan = planMatch ? (planMatch[0] === 'ST' ? 'CREATIVE' : 'SUPER') : 'CREATIVE';

        // TỰ ĐỘNG UPDATE ROLE PRISMA
        await prisma.user.updateMany({
          where: { email: fullEmail },
          data: { role: plan },
        });

        console.log(`PAYOS AUTO UPGRADE → User ${fullEmail} lên ${plan} thành công!`);
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Webhook verify error:', error);
      return res.status(400).json({ error: 'Invalid webhook' });
    }
  }

  res.status(405).end();
}
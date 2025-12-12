// pages/api/payos/webhook.ts - FIXED FROM DOCUMENT + RAW BODY FOR VERIFY
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PayOS } from '@payos/node';
import { IncomingMessage } from 'http';

const prisma = new PrismaClient();
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

// Middleware lấy raw body (PayOS cần raw string cho verify)
async function getRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export const config = {
  api: {
    bodyParser: false,  // Disable auto-parse để lấy raw body
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('PayOS GET validate OK');
    return res.status(200).json({ message: 'Webhook ready' });
  }

  if (req.method === 'POST') {
    try {
      // ✅ RAW BODY + SIGNATURE HEADER (fix từ document)
      const rawBody = await getRawBody(req as IncomingMessage);
      const signature = req.headers['x-payos-signature'] as string;

      if (!signature) {
        console.error('Missing x-payos-signature header');
        return res.status(400).json({ error: 'Missing signature' });
      }

      console.log('Webhook raw body preview:', rawBody.substring(0, 50) + '...');
      console.log('Signature preview:', signature.substring(0, 10) + '...');

      // ✅ VERIFY VỚI RAW BODY + SIGNATURE (SDK docs)
      const webhookData = payos.webhooks.verify(rawBody, signature);
      console.log('PayOS Webhook verified:', { code: webhookData.code, orderCode: webhookData.orderCode, desc: webhookData.desc });

      if (webhookData.code === '00' && webhookData.status === 'PAID') {
        // ✅ EXTRACT EMAIL TỪ DESC (như document: SeenYT-ST-email)
        let userEmail = webhookData.userEmail;
        if (!userEmail) {
          const desc = webhookData.desc || '';
          const emailMatch = desc.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          userEmail = emailMatch ? emailMatch[1] : null;
        }

        if (!userEmail) {
          console.error('No email in webhook:', webhookData.desc);
          return res.status(200).json({ success: true, error: 'No user email' });  // Return 200 để tránh retry
        }

        // ✅ XÁC ĐỊNH PLAN TỪ DESC (ST=CREATIVE, VT=SUPER)
        const desc = webhookData.desc || '';
        const planMatch = desc.match(/ST|VT/i);
        const targetRole = planMatch ? (planMatch[0].toUpperCase() === 'ST' ? 'CREATIVE' : 'SUPER') : 'CREATIVE';
        const creditsIncrement = targetRole === 'SUPER' ? 1000 : 100;

        console.log('Updating user:', { email: userEmail, role: targetRole, increment: creditsIncrement });

        // ✅ UPDATE PRISMA USER (như document)
        const updateResult = await prisma.user.updateMany({
          where: { email: userEmail },
          data: {
            role: targetRole,
            credits: { increment: creditsIncrement },
            maxDailyUsage: targetRole === 'SUPER' ? 100 : 20
          }
        });

        console.log('Prisma update result:', updateResult.count, 'users affected');

        console.log(`Webhook: Đã cập nhật User ${userEmail} lên ${targetRole} thành công!`);
      } else {
        console.log('Non-success event:', webhookData.code, webhookData.status);
      }

      // ✅ LUÔN RETURN 200 OK (như document, tránh PayOS retry)
      return res.status(200).json({ success: true });

    } catch (error: any) {
      console.error('Webhook error:', error.message || error);
      return res.status(200).json({ success: true, error: 'Internal processing error' });  // 200 OK dù error
    } finally {
      await prisma.$disconnect();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
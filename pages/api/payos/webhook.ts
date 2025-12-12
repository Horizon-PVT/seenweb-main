// pages/api/payos/webhook.ts - FIXED FULL WEBHOOK HANDLER (12/2025)
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PayOS } from '@payos/node';  // SDK PayOS v2+

const prisma = new PrismaClient();
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!  // Dùng checksum để verify webhook signature
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ HANDLE GET: PayOS test/validate URL (trả 200 ngay)
  if (req.method === 'GET') {
    console.log('PayOS webhook validated: GET request OK');
    return res.status(200).json({ message: 'Webhook ready for PayOS' });
  }

  // ✅ HANDLE POST: Xử lý webhook thực từ PayOS
  if (req.method === 'POST') {
    try {
      // VERIFY SIGNATURE TỰ ĐỘNG QUA SDK (dùng CHECKSUM_KEY)
      const webhookData = payos.webhooks.verify(req.body);  // Method đúng từ docs
      console.log('PayOS Webhook received & verified:', webhookData);  // Log để debug Vercel

      // KIỂM TRA THÀNH CÔNG (code '00' + status 'PAID')
      if (webhookData.code === '00' && webhookData.status === 'PAID') {
        // EXTRACT EMAIL AN TOÀN (từ userEmail hoặc desc)
        let userEmail = webhookData.userEmail;  // Ưu tiên từ payload
        if (!userEmail) {
          // Fallback: Parse từ desc (giả định format "OrderCode-ST/VT-email@domain.com")
          const desc = webhookData.desc || webhookData.description || '';
          const emailMatch = desc.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          userEmail = emailMatch ? emailMatch[1] : null;
        }
        if (!userEmail) {
          console.error('No email found in webhook:', webhookData);
          return res.status(400).json({ error: 'Missing user email' });
        }

        // XÁC ĐỊNH PLAN TỪ DESC (ST=CREATIVE, VT=SUPER)
        const desc = webhookData.desc || '';
        const planMatch = desc.match(/ST|VT/i);
        const plan = planMatch ? (planMatch[0].toUpperCase() === 'ST' ? 'CREATIVE' : 'SUPER') : 'CREATIVE';

        // ✅ AUTO UPDATE ROLE TRONG PRISMA (cộng credits/role nếu cần)
        const updatedUser = await prisma.user.updateMany({
          where: { email: userEmail },
          data: { 
            role: plan,  // Update role
            // Bonus: Cộng credits nếu plan SUPER (customize theo anh)
            credits: {
              increment: plan === 'SUPER' ? 1000 : 100  // Ví dụ: SUPER +1000, CREATIVE +100
            }
          },
        });

        if (updatedUser.count > 0) {
          console.log(`PAYOS SUCCESS → Updated user ${userEmail} to ${plan} (+${plan === 'SUPER' ? 1000 : 100} credits)`);
        } else {
          console.warn(`No user found for email: ${userEmail}`);
        }
      } else {
        console.log('PayOS Webhook: Non-success event', webhookData.code, webhookData.status);
      }

      // ✅ TRẢ 200 OK NGAY (PayOS yêu cầu nhanh, xử lý async sau)
      return res.status(200).json({ success: true, received: true });

    } catch (error: any) {
      console.error('PayOS Webhook ERROR:', error.message || error);  // Log chi tiết
      return res.status(400).json({ error: 'Invalid webhook signature or data' });
    }
  }

  // Không phải GET/POST → 405
  return res.status(405).json({ error: 'Method not allowed' });
}
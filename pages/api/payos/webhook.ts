import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PayOS } from '@payos/node';
import { IncomingMessage } from 'http';

// --- CẤU HÌNH VÀ KHỞI TẠO ---
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

// Hàm đọc Raw Body từ request (Bắt buộc khi dùng bodyParse: false)
async function getRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Cấu hình Next.js API
export const config = {
  api: {
    bodyParser: false,  // BẮT BUỘC: Tắt auto-parse
  },
};

// --- XỬ LÝ CHÍNH ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(200).json({ message: 'PayOS Webhook ready. Only POST is processed.' });
  }

  let webhookDataRaw: any; 
  let rawBody: string;

  try {
    rawBody = await getRawBody(req as IncomingMessage);

    // SỬA LỖI HEADER: CHỈ KIỂM TRA DẠNG CHỮ THƯỜNG (vì Node.js/Next.js chuẩn hóa Header)
    const signature = req.headers['x-payos-signature'] as string;
    
    // Log Debug
    console.log('--- WEBHOOK RECEIVED ---');
    console.log('Webhook received:', {
      timestamp: new Date().toISOString(),
      signature: signature ? signature.substring(0, 10) + '...' : 'MISSING',
      rawBodyLength: rawBody.length,
    });
    
    // Nếu thiếu chữ ký (xảy ra trong môi trường thật nếu proxy/cloud lọc header)
    if (!signature) {
      console.error('🚨 Missing x-payos-signature header');
      // Trả về 200 để PayOS không gửi lại, nhưng chúng ta không xử lý
      return res.status(200).json({ success: true, reason: 'Missing signature - ignored' }); 
    }

    // 1. XÁC THỰC HOẶC DEBUG POSTMAN
    const isDebugPostman = signature === 'test-signature-123'; // Chữ ký giả anh dùng

    if (isDebugPostman) {
        console.warn('⚠️ PHÁT HIỆN CHỮ KÝ DEBUG. Bỏ qua xác thực PayOS và Parse Body thủ công.');
        
        try {
            webhookDataRaw = JSON.parse(rawBody);
            console.log('✅ Parse body thủ công thành công.');
        } catch (parseError: any) {
            console.error('🚨 Lỗi Parse Body thủ công:', parseError.message);
            return res.status(200).json({ success: false, reason: 'Invalid JSON body for Debug' });
        }
    } else {
        // LUỒNG THẬT: CHẠY HÀM XÁC THỰC CHUẨN
        try {
            webhookDataRaw = payos.webhooks.verify(rawBody, signature);
            console.log('✅ Xác thực Webhook thành công (Real PayOS Request).');
        } catch (e: any) {
            // Đây là lỗi chữ ký không hợp lệ từ PayOS thật
            console.error('❌ Chữ ký KHÔNG hợp lệ (REAL REQUEST):', e.message);
            return res.status(200).json({ success: true, reason: 'Verification failed' });
        }
    }

    // Lấy dữ liệu từ trường 'data'
    const webhookData = webhookDataRaw.data; 

    if (!webhookData || !webhookData.orderCode) {
      console.error('Webhook: Invalid Payload Structure (Missing data or orderCode)');
      return res.status(200).json({ success: false, message: 'Invalid Payload Structure' });
    }
    
    console.log('✅ Webhook data ready for processing. OrderCode:', webhookData.orderCode);

    // 2. XỬ LÝ TRẠNG THÁI THÀNH CÔNG ('00' là PAID)
    if (webhookData.code === '00') {
      const description = webhookData.description || '';
      
      // 3. TRÍCH XUẤT EMAIL VÀ ORDERCODE
      const orderCode = webhookData.orderCode?.toString();
      let userEmail: string | null = null;
      
      // Tìm từ PaymentRequest (chính xác nhất)
      if (orderCode) {
          const request = await prisma.paymentRequest.findUnique({ where: { orderCode } });
          if (request) userEmail = request.email;
      }
      
      // Fallback: Tìm từ description (Regex)
      if (!userEmail) {
          // Regex tìm email (ít tin cậy hơn)
          const userEmailMatch = description.match(/(\S+@\S+\.\S+)$/);
          userEmail = userEmailMatch ? userEmailMatch[1].toLowerCase().trim() : null;
      }

      if (!userEmail) {
        console.error('⚠️ KHÔNG tìm thấy Email cho đơn hàng:', orderCode);
        return res.status(200).json({ success: true, reason: 'User not found' }); 
      }

      // 4. XÁC ĐỊNH ROLE VÀ USAGE
      let targetRole: 'CREATIVE' | 'SUPER' | null = null;
      const maxDailyUsage = 9999; 

      if (description.includes('SÁNG TẠO') || description.includes('CREATIVE')) {
        targetRole = 'CREATIVE';
      } else if (description.includes('VƯỢT TRỘI') || description.includes('SUPER')) {
        targetRole = 'SUPER';
      } 
      
      if (!targetRole) {
          console.warn('⚠️ Không xác định được gói từ description. Không cập nhật role.');
          return res.status(200).json({ success: true });
      }

      // 5. CẬP NHẬT PRISMA USER
      console.log('Attempting to update user:', { email: userEmail, role: targetRole, maxUsage: maxDailyUsage });
      await prisma.user.updateMany({
        where: { email: userEmail },
        data: {
          role: targetRole,
          maxDailyUsage: maxDailyUsage,
        },
      });
      console.log(`✅ Đã nâng cấp user ${userEmail} lên ${targetRole}`);

      // 6. CẬP NHẬT PAYMENT REQUEST STATUS
      if (orderCode) {
        await prisma.paymentRequest.update({
          where: { orderCode },
          data: { status: 'SUCCESS', paidAt: new Date() },
        });
        console.log(`Prisma payment request status updated for order: ${orderCode}`);
      }

    } else {
      console.log(`Non-success event for order ${webhookData.orderCode}: ${webhookData.code} - Status: ${webhookData.desc}`);
    }

    // Luôn trả về 200 OK cho PayOS (để PayOS không gửi lại webhook)
    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('🚨 FATAL Webhook error:', error.message || error);
    return res.status(200).json({ success: true, error: 'Internal processing error' });
  }
}
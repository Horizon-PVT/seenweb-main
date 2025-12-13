// app/api/payos/webhook/route.ts
import { PrismaClient } from '@prisma/client';
import { PayOS } from '@payos/node';
import { NextRequest, NextResponse } from 'next/server';
// Loại bỏ import { headers } từ 'next/headers' để tránh xung đột

// --- CẤU HÌNH VÀ KHỞI TẠO ---
// Đảm bảo PayOS được khởi tạo với các biến môi trường
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

// --- XỬ LÝ CHÍNH: Route Handler cho phương thức POST ---
export async function POST(req: NextRequest) {
  let webhookDataRaw: any;
  
  // 1. Lấy Header và Raw Body (Cách bền vững nhất trong App Router)
  
  // SỬA FIX CUỐI: Lấy signature từ req.headers.get(). 
  // Đây là cách đáng tin cậy nhất để truy cập Header trong môi trường Vercel.
  const signature = req.headers.get('x-payos-signature'); 
  
  const rawBody = await req.text(); // Lấy body dưới dạng text

  try {
    // Log Debug
    console.log('--- WEBHOOK RECEIVED (App Router Final) ---');
    console.log('Webhook received:', {
      timestamp: new Date().toISOString(),
      signature: signature ? signature.substring(0, 10) + '...' : 'MISSING',
      rawBodyLength: rawBody.length,
    });
    
    // Nếu thiếu chữ ký
    if (!signature) {
      console.error('🚨 Missing x-payos-signature header');
      return NextResponse.json({ success: true, reason: 'Missing signature - ignored' }, { status: 200 }); 
    }

    // 2. XÁC THỰC HOẶC DEBUG POSTMAN
    const isDebugPostman = signature === 'test-signature-123'; // Chữ ký giả anh dùng

    if (isDebugPostman) {
        console.warn('⚠️ PHÁT HIỆN CHỮ KÝ DEBUG. Bỏ qua xác thực PayOS và Parse Body thủ công.');
        
        try {
            webhookDataRaw = JSON.parse(rawBody);
            console.log('✅ Parse body thủ công thành công.');
        } catch (parseError: any) {
            console.error('🚨 Lỗi Parse Body thủ công:', parseError.message);
            return NextResponse.json({ success: false, reason: 'Invalid JSON body for Debug' }, { status: 200 });
        }
    } else {
        // LUỒNG THẬT: CHẠY HÀM XÁC THỰC CHUẨN
        try {
            webhookDataRaw = payos.webhooks.verify(rawBody, signature);
            console.log('✅ Xác thực Webhook thành công (Real PayOS Request).');
        } catch (e: any) {
            console.error('❌ Chữ ký KHÔNG hợp lệ (REAL REQUEST):', e.message);
            return NextResponse.json({ success: true, reason: 'Verification failed' }, { status: 200 });
        }
    }

    // Lấy dữ liệu từ trường 'data'
    const webhookData = webhookDataRaw.data; 

    if (!webhookData || !webhookData.orderCode) {
      console.error('Webhook: Invalid Payload Structure (Missing data or orderCode)');
      return NextResponse.json({ success: false, message: 'Invalid Payload Structure' }, { status: 200 });
    }
    
    console.log('✅ Webhook data ready for processing. OrderCode:', webhookData.orderCode);

    // 3. XỬ LÝ TRẠNG THÁI THÀNH CÔNG ('00' là PAID)
    if (webhookData.code === '00') {
      const description = webhookData.description || '';
      
      const orderCode = webhookData.orderCode?.toString();
      let userEmail: string | null = null;
      
      // Tìm từ PaymentRequest (chính xác nhất)
      if (orderCode) {
          const request = await prisma.paymentRequest.findUnique({ where: { orderCode } });
          if (request) userEmail = request.email;
      }
      
      // Fallback: Tìm từ description (Regex)
      if (!userEmail) {
          const userEmailMatch = description.match(/(\S+@\S+\.\S+)$/);
          userEmail = userEmailMatch ? userEmailMatch[1].toLowerCase().trim() : null;
      }

      if (!userEmail) {
        console.error('⚠️ KHÔNG tìm thấy Email cho đơn hàng:', orderCode);
        return NextResponse.json({ success: true, reason: 'User not found' }, { status: 200 }); 
      }

      // 4. XÁC ĐỊNH ROLE VÀ CẬP NHẬT
      let targetRole: 'CREATIVE' | 'SUPER' | null = null;
      const maxDailyUsage = 9999; 

      if (description.includes('SÁNG TẠO') || description.includes('CREATIVE')) {
        targetRole = 'CREATIVE';
      } else if (description.includes('VƯỢT TRỘI') || description.includes('SUPER')) {
        targetRole = 'SUPER';
      } 
      
      if (!targetRole) {
          console.warn('⚠️ Không xác định được gói từ description. Không cập nhật role.');
          return NextResponse.json({ success: true }, { status: 200 });
      }

      // CẬP NHẬT PRISMA
      console.log('Attempting to update user:', { email: userEmail, role: targetRole, maxUsage: maxDailyUsage });
      await prisma.user.updateMany({
        where: { email: userEmail },
        data: {
          role: targetRole,
          maxDailyUsage: maxDailyUsage,
        },
      });
      console.log(`✅ Đã nâng cấp user ${userEmail} lên ${targetRole}`);

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

    // Luôn trả về 200 OK cho PayOS
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('🚨 FATAL Webhook error:', error.message || error);
    return NextResponse.json({ success: true, error: 'Internal processing error' }, { status: 200 });
  }
}

// Bắt buộc phải có hàm GET cho Route Handler
export async function GET() {
    return NextResponse.json({ message: 'PayOS Webhook ready. Only POST is processed.' }, { status: 200 });
}
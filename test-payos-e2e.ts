import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment from .env.local
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

if (!PAYOS_CHECKSUM_KEY) {
    console.error("Missing PAYOS_CHECKSUM_KEY in .env.local");
    process.exit(1);
}

async function runTest() {
    const testEmail = "payos_e2e_test@example.com";
    const orderCode = Math.floor(Math.random() * 1000000000); // Random order code

    console.log(`\n===========================================`);
    console.log(`🚀 BẮT ĐẦU TEST E2E PAYOS (Mô Phỏng Trọn Vòng Lặp)`);
    console.log(`===========================================\n`);

    try {
        // 1. CLEAUP OLD TEST DATA
        console.log(`[1] Dọn dẹp dữ liệu rác cũ nếu có...`);
        const existingUser = await prisma.user.findFirst({ where: { email: testEmail } });
        if (existingUser) {
           await prisma.user.delete({ where: { id: existingUser.id } });
        }
        await prisma.paymentRequest.deleteMany({ where: { email: testEmail } });

        // 2. CREATE FAKE USER (FREE PLAN)
        console.log(`[2] Tạo tài khoản khách hàng giả lập: ${testEmail} (Gói FREE)`);
        const user = await prisma.user.create({
            data: {
                email: testEmail,
                name: "Test E2E PayOS",
                role: "FREE",
                dubbingCredits: 5,
                membershipExpiry: new Date(Date.now() - 10000), // Hết hạn
            }
        });
        console.log(`   -> Tạo thành công. Hạn sử dụng ban đầu: Đã hết hạn. Role: FREE`);

        // 3. CREATE PENDING PAYMENT REQUEST
        console.log(`[3] Khách hàng bấm thanh toán nút mua gói PRO Yearly...`);
        const paymentRequest = await prisma.paymentRequest.create({
            data: {
                orderCode: orderCode.toString(), // PayOS expects string orderCode in DB usually, wait, webhooks send number/string. Our DB expects String.
                amount: 4190000, // Gia PRO Yearly
                email: testEmail,
                userId: user.id,
                role: "PRO", // Upgrade target
                status: "PENDING_PAYOS",
                paymentInfo: JSON.stringify({ billingCycle: "YEARLY", plan: "PRO" })
            }
        });
        console.log(`   -> Tạo Pending Order trong DB thành công. Mã: ${orderCode}`);

        // 4. MOCK PAYOS WEBHOOK CALLBACK
        console.log(`[4] Giả lập Webhook gửi về từ Server PayOS sau khi khách quét QR thành công...`);
        const webhookDataObj = {
            orderCode: orderCode,
            amount: 4190000,
            description: "Thanh toan VIP",
            accountNumber: "123",
            reference: "REF123",
            transactionDateTime: "2023-10-10 10:10:10",
            currency: "VND",
            paymentLinkId: "LINK_ABC",
            code: "00",
            desc: "success",
            counterAccountBankId: "BIDV",
            counterAccountBankName: "BIDV",
            counterAccountName: "NGUYEN VAN A",
            counterAccountNumber: "123456",
            virtualAccountName: "SEENWEB",
            virtualAccountNumber: "9999"
        };

        // Create Valid Signature
        const sortedKeys = Object.keys(webhookDataObj).sort();
        const signData = sortedKeys.map(key => `${key}=${(webhookDataObj as any)[key]}`).join('&');
        const signature = crypto.createHmac('sha256', PAYOS_CHECKSUM_KEY).update(signData).digest('hex');

        const webhookPayload = {
            code: "00", // Payment success
            desc: "success",
            data: webhookDataObj,
            signature: signature
        };

        // Gửi POST request tới Webhook endpoint locally
        const webhookUrl = 'http://localhost:3000/api/payment/payos-webhook';
        console.log(`   -> Bắn Post Webhook payload lên Endpoint: ${webhookUrl}`);
        const response = await axios.post(webhookUrl, webhookPayload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`   -> Response từ Webhook Server:`, response.data);

        if (response.data.success !== true) {
             throw new Error("Webhook báo lỗi: " + response.data.message);
        }

        // 5. KIỂM TRA LẠI DATABASE (VERIFY UPGRADE)
        console.log(`\n[5] Đối soát dữ liệu Khách hàng trong Database (Check Auto-Upgrade)`);
        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
        const updatedRequest = await prisma.paymentRequest.findUnique({ where: { id: paymentRequest.id } });

        console.log(`   - Trạng thái đơn đặt hàng: ${updatedRequest?.status} (Kỳ vọng: PAID)`);
        console.log(`   - Hạng thành viên (Role): ${updatedUser?.role} (Kỳ vọng: PRO)`);
        
        const isUpgraded = updatedUser?.role === 'PRO';
        const isExpiryExtended = updatedUser?.membershipExpiry && updatedUser.membershipExpiry > new Date(Date.now() + 300 * 24 * 60 * 60 * 1000); // Yearly = > 300 days
        
        console.log(`   - Ngày hết hạn mới (Expiry): ${updatedUser?.membershipExpiry} (Kỳ vọng được cộng thêm 365 ngày)`);

        if (updatedRequest?.status === "PAID" && isUpgraded && isExpiryExtended) {
             console.log(`\n✅ TEST PASSED: Hệ thống ĐÃ NHẬN TIỀN & ĐÃ GIA HẠN GÓI THÀNH CÔNG cho khách hàng hoàn toàn Tự Động!`);
        } else {
             console.log(`\n❌ TEST FAILED: Cập nhật dữ liệu Database không chính xác!`);
        }

    } catch (e: any) {
        console.error(`\n❌ CÓ LỖI XẢY RA TRONG QUÁ TRÌNH TỰ ĐỘNG:`, e.message);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();

// pages/api/notify/telegram.ts (CODE CUỐI CÙNG: Lưu DB và Gửi Telegram)

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Import fetch để gọi Telegram API (hoặc sử dụng axios)
import axios from 'axios';

// Lấy biến môi trường (Environment Variables)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// API này đóng vai trò là Webhook nhận dữ liệu từ dịch vụ quét chuyển khoản
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed. Please use POST.' });
    }

    // Dữ liệu phải được gửi từ dịch vụ quét chuyển khoản
    const {
        email,
        role = 'BASIC', // Role mặc định
        amount,
        orderCode,
        plan, // Tên gói (ví dụ: SÁNG TẠO)
        note = ''
    } = req.body;

    try {
        // Kiểm tra các trường bắt buộc
        if (!orderCode || !amount || !email || !plan) {
            return res.status(400).json({ success: false, error: 'Missing required fields: orderCode, amount, email, or plan.' });
        }

        // 1. CHUẨN BỊ VÀ LƯU ĐƠN HÀNG VÀO DATABASE (TRẠNG THÁI CHỜ KÍCH HOẠT)
        const paymentInfoObject = { plan, role, amount, note, timestamp: new Date().toISOString() };
        const paymentInfoString = JSON.stringify(paymentInfoObject);

        const newPayment = await prisma.paymentRequest.create({
            data: {
                email: email,
                amount: amount,
                orderCode: orderCode,
                role: role,
                status: 'PENDING_MANUAL',
                paymentInfo: paymentInfoString,
            }
        });

        // 2. GỬI THÔNG BÁO TELEGRAM CHO ANH (Sau khi đã lưu vào DB)
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error("Thiếu cấu hình Telegram trong .env.local");
            // Vẫn trả về 200 vì đã lưu DB thành công, chỉ lỗi ở thông báo
            return res.status(200).json({ success: true, message: 'Payment request saved, but Telegram notification failed (config error).' });
        }

        const telegramMessage = `
🔔 CÓ ĐƠN HÀNG MỚI!
------------------------------------
- Khách: ${email}
- Số tiền: ${amount.toLocaleString('vi-VN')} đ
- Gói: ${plan} (${role})
- Nội dung CK: ${orderCode}
- ID Đơn hàng: <code>${newPayment.id}</code>
------------------------------------
Sếp check App Ngân hàng và kích hoạt ngay nhé!
`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'HTML',
        });


        // 3. Trả về thành công
        return res.status(200).json({
            success: true,
            message: 'Payment request saved and Telegram notified.',
            data: newPayment
        });

    } catch (error: any) {
        console.error("Lỗi xử lý đơn hàng tự động:", error);
        return res.status(500).json({ success: false, error: 'Internal Server Error: ' + error.message });
    }
}
// pages/api/payment/manual-confirm.ts (CODE CHỐT: Tự động lưu DB và gửi Telegram)

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Dữ liệu phải được gửi từ dịch vụ quét chuyển khoản bên ngoài
    const {
        email,
        role = 'BASIC',
        amount,
        orderCode,
        plan,
        note = ''
    } = req.body;

    try {
        if (!orderCode || !amount || !email || !plan) {
            return res.status(400).json({ success: false, error: 'Missing required fields: orderCode, amount, email, or plan.' });
        }

        // Chuẩn bị paymentInfo (JSON hợp lệ)
        const paymentInfoObject = { plan, role, amount, note, timestamp: new Date().toISOString() };
        const paymentInfoString = JSON.stringify(paymentInfoObject);

        // LƯU ĐƠN HÀNG VÀO DATABASE
        const newPayment = await prisma.paymentRequest.create({
            data: {
                email: email,
                amount: amount,
                orderCode: orderCode,
                role: role,
                status: 'PENDING_MANUAL', // TRẠNG THÁI CHỜ KÍCH HOẠT
                paymentInfo: paymentInfoString,
            }
        });

        // GỌI API TELEGRAM NỘI BỘ (pages/api/notify/telegram.ts)
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

        await axios.post('http://localhost:3000/api/notify/telegram', {
            message: telegramMessage
        });

        return res.status(200).json({
            success: true,
            message: 'Payment request saved and Telegram notified.',
            data: newPayment
        });

    } catch (error: any) {
        console.error("Lỗi tạo đơn hàng thủ công:", error);
        return res.status(500).json({ success: false, error: 'Internal Server Error: ' + error.message });
    }
}
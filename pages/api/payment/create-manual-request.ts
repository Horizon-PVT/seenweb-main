// pages/api/payment/create-manual-request.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios'; // Cần cài 'axios' nếu anh chưa có: npm install axios

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. KHAI BÁO CÁC BIẾN CẦN THIẾT
    const {
        email,
        amount,
        orderCode,
        plan, // Tên gói (ví dụ: SÁNG TẠO, VƯỢT TRỘI)
        role = 'BASIC', // Role tương ứng (ví dụ: 'BASIC', 'PRO')
        note = '' // Ghi chú thêm (nếu có)
    } = req.body;

    try {
        // Kiểm tra các trường bắt buộc
        if (!orderCode || !amount || !email || !plan) {
            return res.status(400).json({ success: false, error: 'Missing required fields: orderCode, amount, email, or plan.' });
        }

        // 2. CHUẨN BỊ DỮ LIỆU paymentInfo (CHUỖI JSON HỢP LỆ)
        const paymentInfoObject = {
            plan: plan,
            role: role,
            amount: amount,
            note: note,
            timestamp: new Date().toISOString()
        };

        const paymentInfoString = JSON.stringify(paymentInfoObject);

        // 3. LƯU ĐƠN HÀNG VÀO DATABASE
        const newPayment = await prisma.paymentRequest.create({
            data: {
                email: email,
                amount: amount,
                orderCode: orderCode,
                role: role,
                status: 'PENDING_MANUAL', // TRẠNG THÁI MÀ ADMIN DASHBOARD CẦN LỌC
                paymentInfo: paymentInfoString, // LƯU CHUỖI JSON HỢP LỆ
            }
        });

        // 4. GỌI API TELEGRAM ĐỂ GỬI THÔNG BÁO (Sử dụng API anh đã tạo: /api/notify/telegram)
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

        // Gọi API Telegram nội bộ
        await axios.post('http://localhost:3000/api/notify/telegram', {
            message: telegramMessage
        });


        // 5. Trả về kết quả thành công
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
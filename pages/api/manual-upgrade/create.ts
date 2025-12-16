// pages/api/manual-upgrade/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Bắt buộc phải login (NextAuth)
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập để nâng cấp.' });
    }

    const { role, amount, plan, note } = req.body;

    if (!role || !amount || !plan) {
        return res.status(400).json({ error: 'Thiếu thông tin gói nâng cấp.' });
    }

    try {
        // Tạo paymentInfo JSON
        const paymentInfoObject = { plan, role, amount, note, timestamp: new Date().toISOString() };
        const paymentInfoString = JSON.stringify(paymentInfoObject);

        // Generate orderCode gợi ý (có thể để user tự nhập hoặc để trống)
        const orderCode = `SEENWEB ${session.user.email.split('@')[0].toUpperCase()} ${plan}`;

        // Lưu request với status PENDING_MANUAL ngay để admin thấy
        const newRequest = await prisma.paymentRequest.create({
            data: {
                email: session.user.email,
                amount: parseInt(amount),
                orderCode: orderCode,
                role: role,
                status: 'PENDING_MANUAL',
                paymentInfo: paymentInfoString,
                note: note || '', // Ghi chú từ user
            }
        });

        // Gửi Telegram thông báo ngay
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const telegramMessage = `
🔔 YÊU CẦU NÂNG CẤP THỦ CÔNG MỚI!
------------------------------------
- Khách: ${session.user.email}
- Gói: ${plan} (${role})
- Số tiền: ${amount.toLocaleString('vi-VN')} đ
- Gợi ý nội dung CK: <code>${orderCode}</code>
- Ghi chú từ khách: ${note || 'Không có'}
- ID Đơn: <code>${newRequest.id}</code>
------------------------------------
Sếp check ngân hàng và kích hoạt giúp em nhé! 🚀
`;

            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            await axios.post(url, {
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'HTML',
            });
        }

        return res.status(200).json({ success: true, message: 'Yêu cầu nâng cấp đã được gửi! Admin sẽ xử lý sớm.' });

    } catch (error: any) {
        console.error('Lỗi tạo yêu cầu thủ công:', error);
        return res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
}
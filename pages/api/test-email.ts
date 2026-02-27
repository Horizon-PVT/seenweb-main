import { NextApiRequest, NextApiResponse } from 'next';
import { sendMasterclassWelcomeEmail } from '@/lib/email';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("🚀 Bắt đầu test luồng Automations từ API Route...");

    const testEmail = "phamanhtung.jp@gmail.com";
    const userName = "Anh Tùng (Test API)";
    let emailStatus = "";

    try {
        const emailResult = await sendMasterclassWelcomeEmail(testEmail, userName);
        if (emailResult) {
            emailStatus = "✅ Email Welcome đã được gửi THÀNH CÔNG từ cấu hình Namecheap!";
            console.log(emailStatus);
        } else {
            emailStatus = "❌ Gửi Email THẤT BẠI. Anh hãy check lại Mật khẩu App/Cấu hình Vercel.";
            console.log(emailStatus);
        }
    } catch (e) {
        emailStatus = "Lỗi kịch bản Email: " + e;
        console.error(emailStatus);
    }

    let teleStatus = "";
    try {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const msg = `✅ [TEST HỆ THỐNG] THANH TOÁN THÀNH CÔNG!\n------------------------------------\n- Khách: ${testEmail}\n- Số tiền: 849,000 đ\n- Gói: MASTERCLASS\n- Mã đơn: TEST_${Date.now()}\n------------------------------------\n👉 Hệ thống gửi Email đã được kích hoạt! 🎉`;

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: msg,
                parse_mode: 'HTML',
            });
            teleStatus = "✅ Telegram Notification đã bắn THÀNH CÔNG vào Bot của anh!";
            console.log(teleStatus);
        } else {
            teleStatus = "❌ Lỗi: Chưa tìm thấy Token Telegram trong file .env";
            console.log(teleStatus);
        }
    } catch (e: any) {
        teleStatus = "Lỗi gửi Telegram: " + (e.response?.data || e.message);
        console.error(teleStatus);
    }

    return res.status(200).json({
        emailStatus,
        teleStatus
    });
}

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export const sendMasterclassWelcomeEmail = async (toEmail: string, userName?: string) => {
    const nameToUse = userName || 'bạn';

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://seenyt.net/images/academy_masterclass_checkout.png" alt="SeenYT Academy" style="width: 100%; max-width: 600px; border-radius: 12px; shadow: 0 4px 6px rgba(0,0,0,0.1);" />
      </div>
      
      <h2 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px;">Chào mừng bạn đến với hành trình Triệu View cùng SeenYT! 🚀</h2>
      
      <p>Chào ${nameToUse}, mình là Mr. Seen từ SeenYT.</p>
      
      <p>Chúc mừng bạn đã có quyết định đúng đắn nhất hôm nay: Bắt đầu hành trình xây dựng kênh YouTube bài bản thay vì mò mẫm trong bóng tối.</p>
      
      <p>Hệ thống đã mở khóa <strong>Chương 1: Tư duy YouTube 2026</strong> dành riêng cho bạn. Để hành trình này hiệu quả nhất, bạn hãy thực hiện 2 bước sau:</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #d32f2f; margin: 25px 0;">
        <p style="margin-top: 0;"><strong>Bước 1: Học ngay bài đầu tiên</strong></p>
        <p>Kiến thức nền tảng là bước đệm quan trọng nhất.</p>
        <a href="https://seenyt.net/academy" style="display: inline-block; background-color: #d32f2f; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; margin-top: 10px;">Truy cập Academy Ngay</a>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #0056b3; margin: 25px 0;">
        <p style="margin-top: 0;"><strong>Bước 2: Tham gia cộng đồng Zalo Kín</strong></p>
        <p>Đây là nơi mình trực tiếp hỗ trợ, giải đáp thắc mắc và chia sẻ các "ngách xanh" mới nhất hàng tuần dành riêng cho học viên.</p>
        <a href="https://zalo.me/g/lhxazc331" style="display: inline-block; background-color: #0056b3; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; margin-top: 10px;">Tham gia Zalo Kín</a>
      </div>
      
      <p>Hẹn gặp bạn ở đỉnh cao của sự sáng tạo!</p>
      
      <p style="margin-top: 40px; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
        Trân trọng,<br/>
        <strong>Mr. Seen & Đội ngũ SeenYT</strong><br/>
        <a href="https://seenyt.net" style="color: #666; text-decoration: none;">seenyt.net</a>
      </p>
    </div>
  `;

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"SeenYT Academy" <noreply@seenyt.net>',
        to: toEmail,
        subject: 'Chào mừng bạn đến với hành trình Triệu View cùng SeenYT! 🚀',
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent successfully to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${toEmail}:`, error);
        return false;
    }
};

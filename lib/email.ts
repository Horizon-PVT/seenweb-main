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

export const sendRenewalReminderEmail = async (toEmail: string, userName: string | undefined, daysLeft: number) => {
    const nameToUse = userName || 'bạn';

    const timeMsg = daysLeft === 0 ? "hôm nay" : `trong ${daysLeft} ngày nữa`;
    const titleColor = daysLeft === 0 ? "#b22222" : "#d32f2f";

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://seenyt.net/images/og-image.jpg" alt="SeenYT" style="width: 100%; max-width: 600px; border-radius: 12px; shadow: 0 4px 6px rgba(0,0,0,0.1);" />
      </div>

      <h2 style="color: ${titleColor}; font-size: 24px; margin-bottom: 20px; text-align: center;">⏰ Thời gian đếm ngược: Gói dịch vụ sắp hết hạn!</h2>
      
      <p>Chào <strong>${nameToUse}</strong>,</p>
      
      <p>Hệ thống SeenYT thông báo: Gói dịch vụ của bạn sẽ hết hạn <strong>${timeMsg}</strong>.</p>
      
      <p>Đừng để luồng công việc của bạn bị gián đoạn! Hãy giữ vững đặc quyền sử dụng hệ sinh thái AI của SeenYT: Tạo video hàng loạt, đào ngách CPM cao, và nhân bản content với AI Dubbing.</p>
      
      <div style="background-color: #fff9e6; border: 2px dashed #f5b041; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #d35400;">🎁 ƯU ĐÃI GIA HẠN ĐẶC QUYỀN</h3>
        <p style="margin-bottom: 10px;">Lấy ngay mã giảm giá <strong>20%</strong> cho lần gia hạn này:</p>
        <div style="font-size: 28px; font-weight: bold; color: #e74c3c; letter-spacing: 2px;">GIAHAN20</div>
        <p style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">Áp dụng khi mua các gói PRO hoặc BASIC</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://seenyt.net/pricing" style="display: inline-block; background-color: #e74c3c; color: #fff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(231,76,60,0.3);">⚡ GIA HẠN GÓI DỊCH VỤ NGAY</a>
      </div>
      
      <p style="font-size: 14px;">Nếu bạn có bất kỳ khó khăn nào, hãy nhắn thẳng qua Zalo để bọn mình hỗ trợ lập tức.</p>
      
      <p style="margin-top: 40px; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
        Trân trọng,<br/>
        <strong>Đội ngũ SeenYT</strong><br/>
        <a href="https://seenyt.net" style="color: #3498db; text-decoration: none;">seenyt.net</a>
      </p>
    </div>
  `;

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"SeenYT" <noreply@seenyt.net>',
        to: toEmail,
        subject: `[SeenYT] Gói dịch vụ của bạn sẽ hết hạn trong ${daysLeft} ngày nữa!`,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Renewal reminder email sent successfully to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`Error sending renewal email to ${toEmail}:`, error);
        return false;
    }
};

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendZoomWelcomeEmail = async (toEmail: string, userName: string) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://seenyt.net/images/academy_masterclass_checkout.png" alt="SeenYT Academy Zoom 3 Days" style="width: 100%; max-width: 600px; border-radius: 12px; shadow: 0 4px 6px rgba(0,0,0,0.1);" />
      </div>
      
      <h2 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px;">[QUAN TRỌNG] Vé Zoom độc quyền của bạn đã được xác nhận! 🚀</h2>
      
      <p>Chào <strong>${userName}</strong>,</p>
      
      <p>Chúc mừng bạn đã xí được 1 trong 100 vé độc quyền tham gia sự kiện <strong>"Làm Chủ YouTube AI 2026: Làm ít hơn, kiếm nhiều hơn nhờ tự động hóa"</strong>.</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #d32f2f; margin: 25px 0;">
        <p style="margin-top: 0;">🗓️ <strong>Lịch học chính thức của chúng ta:</strong></p>
        <p>Thời gian: <strong>20:00 - Tối Thứ 5, Ngày 05/03/2026</strong></p>
        <p>Hình thức: Trực tuyến qua Zoom (Sẽ gửi link trước 1 tiếng).</p>
      </div>
      
      <p>Để khởi động, SeenYT có một món quà nhỏ dành riêng cho những ai có tốc độ hành động nhanh như bạn:</p>
      <p>🎁 <strong><a href="https://zalo.me/g/kqshmg192" style="color: #d32f2f; text-decoration: none;">Link Tải/Xem 50 Ngách Global Dễ Làm Nhất 2026 (Không cần lộ mặt).</a></strong></p>
      
      <p>Nhớ tham gia Nhóm Zalo Kín này ngay để lấy thêm tài liệu và nhận link Zoom vào Thứ 5 nhé:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://zalo.me/g/kqshmg192" style="display: inline-block; background-color: #0056b3; color: #fff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">Tham gia Zalo Kín Ngay</a>
      </div>
      
      <div style="background-color: #fff9e6; border: 1px dashed #f59e0b; padding: 15px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #b45309; margin-top: 0; font-size: 18px;">🔥 ƯU ĐÃI ĐẶC BIỆT KHI MỜI BẠN BÈ</h3>
        <p style="margin-bottom: 0;">Nếu bạn mời được thêm <strong>1 người bạn</strong> cùng tham gia nhóm Zalo và học Zoom, hãy nhắn tin trực tiếp cho Admin trong nhóm Zalo để nhận thêm <strong>"Cuốn Sổ Tay 100 Câu Lệnh ChatGPT Làm YouTube Siêu Tốc"</strong> trị giá 500k hoàn toàn miễn phí nhé!</p>
      </div>
      
      <p>Hẹn gặp bạn ở bên trong,</p>
      
      <p style="margin-top: 40px; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
        Trân trọng,<br/>
        <strong>Mr. Seen & Đội ngũ SeenYT</strong><br/>
        <a href="https://seenyt.net" style="color: #666; text-decoration: none;">seenyt.net</a>
      </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Mr. Seen" <founder@seenyt.net>',
    to: toEmail,
    subject: '[QUAN TRỌNG] Vé Zoom độc quyền của bạn đã được xác nhận! (Kèm quà tặng)',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Zoom Welcome email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`Error sending Zoom Welcome email to ${toEmail}:`, error);
    return false;
  }
};

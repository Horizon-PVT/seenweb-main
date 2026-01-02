import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const {
        fullName,
        email,
        phone,
        role,
        location,
        portfolio,
        reason,
        aiReady,
    } = req.body;

    // 1. Validation
    if (!fullName || !email || !phone || !role || !location || !reason || !aiReady) {
        return res.status(400).json({ error: "Vui lòng điền đầy đủ các trường bắt buộc." });
    }

    // 2. Setup Transporter
    // Expects ENV variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // 3. Send Email
        // "Send the submission to BOTH emails: phamanhtung.jp@gmail.com, dungductrinh@gmail.com"
        const recipients = ["phamanhtung.jp@gmail.com", "dungductrinh@gmail.com"];

        // Email content construction
        const htmlContent = `
      <h2>Ứng viên mới cho KODAFLOW</h2>
      <p><strong>Họ tên:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>SĐT / Zalo:</strong> ${phone}</p>
      <p><strong>Vị trí:</strong> <span style="color:blue;font-weight:bold">${role}</span></p>
      <p><strong>Khu vực:</strong> ${location}</p>
      <p><strong>Sẵn sàng học AI:</strong> ${aiReady}</p>
      <p><strong>Portfolio:</strong> <a href="${portfolio}">${portfolio || "N/A"}</a></p>
      <hr />
      <h3>Vì sao muốn làm việc tại Kodaflow?</h3>
      <p style="white-space: pre-wrap;">${reason}</p>
      <hr />
      <p><em>Email được gửi tự động từ hệ thống tuyển dụng SeenYT.</em></p>
    `;

        await transporter.sendMail({
            from: `"Kodaflow Recruitment" <${process.env.SMTP_USER}>`,
            to: recipients.join(", "),
            subject: `[KODAFLOW] Ứng tuyển: ${role} - ${fullName}`,
            html: htmlContent,
            replyTo: email,
        });

        return res.status(200).json({ success: true, message: "Hồ sơ đã được gửi thành công!" });
    } catch (error: any) {
        console.error("APPLY_ERROR:", error);
        return res.status(500).json({ error: "Lỗi gửi email. Vui lòng thử lại hoặc liên hệ trực tiếp." });
    }
}

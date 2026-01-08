import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";
import os from "os";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const form = formidable({
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            uploadDir: os.tmpdir(),
        });

        const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve([fields, files]);
            });
        });

        // Helper to get string value from fields (formidable v3 can return string[])
        const getValue = (key: string) => {
            const val = fields[key];
            if (Array.isArray(val)) return val[0];
            return val || "";
        };

        const fullName = getValue("fullName");
        const email = getValue("email");
        const phone = getValue("phone");
        const role = getValue("role");
        const location = getValue("location");
        const portfolio = getValue("portfolio");
        const reason = getValue("reason");
        const aiReady = getValue("aiReady");

        // New fields
        const gender = getValue("gender");
        const dob = getValue("dob"); // YYYY-MM-DD
        const experience = getValue("experience");
        const recentJob = getValue("recentJob");

        // 1. Validation
        if (!fullName || !email || !phone || !role || !location || !reason || !aiReady) {
            return res.status(400).json({ error: "Vui lòng điền đầy đủ các trường bắt buộc." });
        }

        // 2. Setup Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 3. Prepare Attachments
        const attachments = [];
        const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
        if (photoFile) {
            attachments.push({
                filename: photoFile.originalFilename || "photo.jpg",
                path: photoFile.filepath,
            });
        }

        // 4. Construct Email Content
        const recipientList = ["phamanhtung.jp@gmail.com", "dungductrinh@gmail.com"];

        const htmlContent = `
            <h2>Ứng viên mới cho KODAFLOW</h2>
            <p><strong>Họ tên:</strong> ${fullName}</p>
            <p><strong>Giới tính:</strong> ${gender || "N/A"}</p>
            <p><strong>Ngày sinh:</strong> ${dob || "N/A"}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>SĐT / Zalo:</strong> ${phone}</p>
            <p><strong>Vị trí:</strong> <span style="color:blue;font-weight:bold">${role}</span></p>
            <p><strong>Khu vực:</strong> ${location}</p>
            <p><strong>Công việc gần nhất:</strong> ${recentJob || "N/A"}</p>
            <p><strong>Kinh nghiệm:</strong> <br/>${(experience || "").replace(/\n/g, "<br/>")}</p>
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
            to: recipientList.join(", "),
            subject: `[KODAFLOW] Ứng tuyển: ${role} - ${fullName}`,
            html: htmlContent,
            replyTo: email,
            attachments: attachments,
        });

        return res.status(200).json({ success: true, message: "Hồ sơ đã được gửi thành công!" });
    } catch (error: any) {
        console.error("APPLY_ERROR:", error);
        return res.status(500).json({
            error: "Lỗi gửi email. Vui lòng thử lại hoặc liên hệ trực tiếp.",
            details: error.message || error.toString()
        });
    }
}

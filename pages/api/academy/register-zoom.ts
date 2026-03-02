import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { sendZoomWelcomeEmail } from '../../../lib/email-zoom';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, zalo, email } = req.body;

        if (!name || !zalo || !email) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        // 1. Save to Database
        let lead = await prisma.zoomRegistration.findUnique({
            where: { email },
        });

        if (!lead) {
            lead = await prisma.zoomRegistration.create({
                data: {
                    name,
                    zalo,
                    email,
                },
            });
        }

        // 2. Send Welcome Email
        const emailSent = await sendZoomWelcomeEmail(email, name);

        if (!emailSent) {
            console.warn(`Could not send welcome email to ${email}`);
            // We still return success as they are registered, but we note the email failed
        }

        return res.status(200).json({
            success: true,
            message: 'Đăng ký thành công và đã gửi email!',
            leadId: lead.id
        });

    } catch (error) {
        console.error('Error in Zoom Registration API:', error);
        return res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại sau.' });
    }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb', // Support large Base64 uploads
        },
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (session.user as any)?.id;
    if (!userId) {
        return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ.' });
    }

    // GET: Check Status (no quota needed for polling)
    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: "Missing id" });
        }
        try {
            const prediction = await replicate.predictions.get(id);
            console.log("Replicate Status:", prediction.status, "ID:", id);
            if (prediction?.status === 'failed') {
                console.error("Replicate Failed Logs:", prediction.logs);
            }
            return res.status(200).json(prediction);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    // POST: Create Prediction — Quota check (virtual-mc is PRO-only)
    try {
        await checkUserQuota(userId, 'virtual-mc');
    } catch (error: any) {
        if (error.message === 'PLAN_LOCKED') {
            return res.status(403).json({ error: 'PLAN_LOCKED', message: 'Tính năng Virtual MC chỉ dành cho gói PRO. Vui lòng nâng cấp!' });
        }
        if (error.message === 'FREE_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'FREE_QUOTA_EXCEEDED' });
        }
        if (error.message === 'DAILY_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'DAILY_QUOTA_EXCEEDED', message: 'Bạn đã hết lượt sử dụng hôm nay.' });
        }
        return res.status(500).json({ error: 'Lỗi kiểm tra quyền truy cập.' });
    }

    if (req.method === 'POST') {
        const { imageUrl, audioUrl } = req.body;

        if (!imageUrl || !audioUrl) {
            return res.status(400).json({ error: "Missing imageUrl or audioUrl" });
        }

        try {
            const prediction = await replicate.predictions.create({
                version: "a519cc0cfebaaeade068b23899165a11ec76aaa1d2b313d40d214f204ec957a3", // cjwbw/sadtalker (Latest Stable)
                input: {
                    driven_audio: audioUrl,   // SadTalker parameter
                    source_image: imageUrl,   // SadTalker parameter
                    enhancer: "gfpgan",       // Face enhancement
                    preprocess: "full",       // Crop full image
                    still: false,             // Enable natural head motion
                    expression_scale: 1.2,    // Increase expression intensity (Default 1.0)
                    ref_eyeblink: true,       // Use original eye blink
                    ref_pose: true            // Use original head pose
                },
            });

            // Track usage
            await incrementUserUsage(userId, 'virtual-mc');

            return res.status(201).json(prediction);

        } catch (error: any) {
            console.error("Replicate Error:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

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

    // GET: Check Status
    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: "Missing id" });
        }
        try {
            const prediction = await replicate.predictions.get(id);
            console.log("Replicate Status:", prediction.status, "ID:", id); // Logging status for debug
            if (prediction?.status === 'failed') {
                console.error("Replicate Failed Logs:", prediction.logs);
            }
            return res.status(200).json(prediction);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    // POST: Create Prediction
    // Verify User Role (Must be SUPER or ADMIN)
    const userRole = (session.user as any).role;
    if (userRole !== 'SUPER' && userRole !== 'ADMIN') {
        return res.status(403).json({ error: "Tính năng này chỉ dành cho gói PRO (SUPER member). Vui lòng nâng cấp!" });
    }

    if (req.method === 'POST') {
        const { imageUrl, audioUrl } = req.body;

        if (!imageUrl || !audioUrl) {
            return res.status(400).json({ error: "Missing imageUrl or audioUrl" });
        }

        try {
            // Logic Tracking Credit Usage (Optional for now, but recommended)
            // ...

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

            return res.status(201).json(prediction);

        } catch (error: any) {
            console.error("Replicate Error:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}

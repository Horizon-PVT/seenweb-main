import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { analyzeTopicViability } from "../../../../lib/ai-teacher";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { topic, goal, targetMarket, channelType } = req.body;

    if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
    }

    try {
        const analysis = await analyzeTopicViability(
            topic,
            goal || "1000_subs",
            targetMarket || "vn",
            channelType || "face"
        );
        return res.status(200).json(analysis);
    } catch (error) {
        console.error("Topic Analysis Error:", error);
        return res.status(500).json({ message: "Failed to analyze topic" });
    }
}

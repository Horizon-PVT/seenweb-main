import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from "../../../../lib/prisma";
import { generateTeacherRoadmap } from "../../../../lib/ai-teacher";

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

    const userEmail = session.user.email;
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const {
        channelType,
        targetMarket,
        channelTopic,
        channelGoal,
        availableTime,
        contentMix,
        timezone,
        postingTime
    } = req.body;

    // Basic validation
    if (!channelTopic || !channelGoal) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // 1. Check if roadmap exists
        let roadmap = await prisma.teacherRoadmap.findUnique({
            where: { userId: user.id },
        });

        if (roadmap) {
            return res.status(200).json({ message: "Roadmap already exists", roadmapId: roadmap.id });
        }

        // 2. AI Analysis & Generation (Step 0)
        // Generating the custom roadmap using OpenAI/Gemini
        // This might take 10-20 seconds. Frontend should show a loading state.

        // We assume the user wants to start immediately, so we generate the full plan.
        // In a more complex flow, we might just generate Day 0 first (Analysis) and then generate the rest later.
        // But for simplicity of V1, we generate all.

        let roadmapContent;
        try {
            // Generate Phase 1 (Day 0-10) only to prevent timeouts and huge token usage with new "initial" phase parameter
            roadmapContent = await generateTeacherRoadmap({
                topic: channelTopic,
                goal: channelGoal,
                availableTime: availableTime || "2h",
                contentMix: contentMix || "Mix",
                channelType: channelType || "face",
                targetMarket: targetMarket || "vn",
                userLevel: "Beginner"
            }, "initial");
        } catch (aiError) {
            console.error("AI Generation Failed:", aiError);
            // Fallback or Error? 
            // For V1 let's return error so frontend knows.
            return res.status(503).json({ message: "AI Teacher is busy. Please try again." });
        }

        // 3. Create Roadmap with Content
        roadmap = await prisma.teacherRoadmap.create({
            data: {
                userId: user.id,
                channelTopic,
                channelGoal,
                availableTime,
                contentMix,
                timezone,
                postingTime,
                content: roadmapContent, // Save the JSON
                progress: {
                    create: {
                        day: 0,
                        status: "OPEN", // Day 0 is essentially the "Analysis Result" view which leads to "Start"
                        unlockedAt: new Date(),
                    },
                },
            },
        });

        return res.status(201).json({ message: "Roadmap created", roadmap });
    } catch (error) {
        console.error("Error creating roadmap:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

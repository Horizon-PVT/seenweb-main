import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

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

    const { day, action } = req.body; // action: 'COMPLETE' | 'SKIP'

    if (typeof day !== 'number' || !['COMPLETE', 'SKIP'].includes(action)) {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        const roadmap = await prisma.teacherRoadmap.findUnique({
            where: { userId: user.id },
        });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        // Update current day
        const currentStatus = action === 'COMPLETE' ? 'COMPLETED' : 'SKIPPED';

        // Upsert ensuring we don't duplicate if already done (though logic should prevent)
        await prisma.teacherRoadmapProgress.upsert({
            where: {
                roadmapId_day: {
                    roadmapId: roadmap.id,
                    day: day
                }
            },
            update: {
                status: currentStatus,
                completedAt: new Date()
            },
            create: {
                roadmapId: roadmap.id,
                day: day,
                status: currentStatus,
                unlockedAt: new Date(), // Should have been unlocked before, but basic sanity
                completedAt: new Date()
            }
        });

        // Unlock next day
        const nextDay = day + 1;
        if (nextDay <= 30) {
            // Check if next day already exists
            const nextDayProgress = await prisma.teacherRoadmapProgress.findUnique({
                where: {
                    roadmapId_day: {
                        roadmapId: roadmap.id,
                        day: nextDay
                    }
                }
            });

            if (!nextDayProgress) {
                await prisma.teacherRoadmapProgress.create({
                    data: {
                        roadmapId: roadmap.id,
                        day: nextDay,
                        status: 'OPEN',
                        unlockedAt: new Date()
                    }
                });
            }
        }

        return res.status(200).json({ message: "Progress updated", nextDay });

    } catch (error) {
        console.error("Error updating progress:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

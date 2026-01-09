import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { ROADMAP_DATA } from "../../../../lib/teacher-roadmap-data";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
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

    try {
        const roadmap = await prisma.teacherRoadmap.findUnique({
            where: { userId: user.id },
            include: {
                progress: true,
            },
        });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        // Determine user tier logic
        // STARTER/CREATIVE/FREE users can access Day 0-10
        // PRO/SUPER/ADMIN users can access Day 11-30

        // Check if user has PRO tier for advanced content
        const isProTier = ["SUPER", "VIP", "ADMIN"].includes(user.role);
        const maxDayAllowedByTier = isProTier ? 30 : 10;

        // Filter ROADMAP_DATA based on tier and progress?
        // User requested "locked" to show paywall. So we might want to return METADATA for all days,
        // but CONTENT only for unlocked days.

        // We will return a structured object:
        // days: { [day: number]: { status: 'LOCKED' | 'OPEN' | 'COMPLETED', data: RoadmapDay | null } }

        // Use the stored AI content if available, otherwise fallback to static (or empty)
        // Type assertion for the content JSON
        const aiContent = roadmap.content as Record<string, any> | null;
        const dataSource = aiContent || ROADMAP_DATA;

        const daysResponse: Record<number, any> = {};
        const totalDays = 30;

        for (let i = 0; i <= totalDays; i++) {
            const progressItem = roadmap.progress.find((p: any) => p.day === i);
            let status = progressItem ? progressItem.status : "LOCKED";

            // If it's locked by tier (Day 11+ requires PRO)
            const lockedByTier = i > 10 && !isProTier;

            // Data for this day
            // Note: The AI might generate string keys "0", "1", so we check both i and i.toString()
            const DS = dataSource as any;
            const dayData = DS[i] || DS[i.toString()];

            let content = null;

            // Return content logic
            if ((status === 'OPEN' || status === 'COMPLETED' || status === 'SKIPPED') && !lockedByTier) {
                content = dayData;
            } else if (lockedByTier) {
                content = {
                    day: i,
                    title: dayData?.title || "VVIP CONTENT",
                    overview: "Nâng cấp lên VVIP để xem nội dung này.",
                    lockedTier: "vvip"
                };
            } else {
                content = {
                    day: i,
                    title: dayData?.title || `Ngày ${i}`,
                    lockedTier: i <= 10 ? "starter" : "vvip"
                };
            }

            daysResponse[i] = {
                status,
                lockedByTier,
                content
            };
        };

        return res.status(200).json({
            roadmap,
            days: daysResponse,
            userTier: user.role
        });

    } catch (error) {
        console.error("Error fetching roadmap:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

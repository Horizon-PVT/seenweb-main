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
        // Day 0-5: FREE (all users)
        // Day 6-20: STARTER+ (CREATIVE, SUPER, VIP, ADMIN)
        // Day 21-30: VIP only (VIP, ADMIN)

        // Check user tier levels
        const isStarter = ["CREATIVE", "SUPER", "VIP", "ADMIN"].includes(user.role);
        const isVIP = ["VIP", "ADMIN"].includes(user.role);

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

            // Tier-based access logic
            let lockedByTier = false;
            let requiredTier = "FREE";

            if (i >= 6 && i <= 20 && !isStarter) {
                lockedByTier = true;
                requiredTier = "STARTER";
            }
            if (i >= 21 && !isVIP) {
                lockedByTier = true;
                requiredTier = "VIP";
            }

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
                    title: dayData?.title || `Ngày ${i}`,
                    overview: `Nâng cấp lên ${requiredTier} để mở khóa nội dung này.`,
                    lockedTier: requiredTier.toLowerCase()
                };
            } else {
                content = {
                    day: i,
                    title: dayData?.title || `Ngày ${i}`,
                    lockedTier: i <= 5 ? "free" : i <= 20 ? "starter" : "vip"
                };
            }

            daysResponse[i] = {
                status,
                lockedByTier,
                requiredTier,
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

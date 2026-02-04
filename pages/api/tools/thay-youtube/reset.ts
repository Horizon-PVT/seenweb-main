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

    try {
        // Find existing roadmap
        const roadmap = await prisma.teacherRoadmap.findUnique({
            where: { userId: user.id },
            include: { progress: true }
        });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        // CHECK: User must complete ALL 30 days before resetting
        const totalDays = 30; // Day 0-30 = 31 entries
        const completedDays = roadmap.progress.filter(
            (p: any) => p.status === 'COMPLETED' || p.status === 'SKIPPED'
        );

        // Count unique completed days (0-30)
        const completedDayNumbers = new Set(completedDays.map((p: any) => p.day));

        // User must complete Day 0 through Day 30 (31 total days)
        const requiredDays = Array.from({ length: 31 }, (_, i) => i); // [0, 1, 2, ... 30]
        const allDaysCompleted = requiredDays.every(day => completedDayNumbers.has(day));

        if (!allDaysCompleted) {
            const remainingDays = requiredDays.filter(day => !completedDayNumbers.has(day));
            return res.status(400).json({
                message: `Bạn phải hoàn thành tất cả 30 ngày trước khi làm lại lộ trình!`,
                remainingDays: remainingDays.length,
                completedDays: completedDayNumbers.size
            });
        }

        // DELETE old progress and roadmap
        await prisma.teacherRoadmapProgress.deleteMany({
            where: { roadmapId: roadmap.id }
        });

        await prisma.teacherRoadmap.delete({
            where: { id: roadmap.id }
        });

        return res.status(200).json({
            message: "Roadmap đã được xóa. Bạn có thể bắt đầu lộ trình mới!",
            success: true
        });

    } catch (error) {
        console.error("Error resetting roadmap:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

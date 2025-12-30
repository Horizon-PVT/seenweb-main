// File: lib/quota.ts
import { prisma } from './prisma';
import { ROLES, USAGE_LIMITS } from './roles';

/**
 * Checks if a user has sufficient quota.
 * Automatically resets quota if it's a new day (UTC based).
 * Throws an error if quota is exceeded.
 */
export async function checkUserQuota(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            dailyUsage: true,
            maxDailyUsage: true,
            lastUsageDate: true,
        },
    }) as any;

    if (!user) {
        throw new Error('User not found');
    }

    // 1. Reset logic (No Cron)
    const now = new Date();
    const lastDate = user.lastUsageDate ? new Date(user.lastUsageDate) : null;

    // Use UTC comparison to ensure consistency regardless of server time
    const isNewDay = !lastDate ||
        now.getUTCFullYear() !== lastDate.getUTCFullYear() ||
        now.getUTCMonth() !== lastDate.getUTCMonth() ||
        now.getUTCDate() !== lastDate.getUTCDate();

    if (isNewDay) {
        // Reset usage in background (or await if critical consistency needed)
        // We update lastUsageDate here to mark the reset "epoch"
        await prisma.user.update({
            where: { id: userId },
            data: {
                dailyUsage: 0,
                lastUsageDate: now,
            },
        });
        // Continue with usage = 0
        return;
    }

    // 2. Check Roles (Infinite usage for VIP/ADMIN/etc)
    if (['CREATIVE', 'SUPER', 'VIP', 'ADMIN'].includes(user.role)) {
        return;
    }

    // 3. Check Quota (for FREE)
    // Ensure we use the freshly reset 0 if isNewDay was true (handled by return above)
    if (user.dailyUsage >= user.maxDailyUsage) {
        throw new Error('Bạn đã hết lượt sử dụng miễn phí hôm nay (3/3 lượt). Hãy nâng cấp gói để dùng không giới hạn!');
    }
}

/**
 * Increments the user's daily usage count.
 * Should be called AFTER a successful tool execution.
 */
export async function incrementUserUsage(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            dailyUsage: { increment: 1 },
            lastUsageDate: new Date(), // Update timestamp of latest usage
        },
    });
}

// File: lib/quota.ts
import { prisma } from './prisma';
import { ROLES, ROLE_LIMITS, FREE_ALLOWED_TOOLS, BASIC_ALLOWED_TOOLS, Role } from './roles';

const EVENT_NAME = 'TOOL_USAGE';

/**
 * STRICT QUOTA CHECK (Per Tool)
 * - FREE: 1 lifetime use per allowed tool.
 * - BASIC: 20 uses per day per allowed tool.
 * - PRO: 50 uses per day per tool (ALL TOOLS).
 */
export async function checkUserQuota(userId: string, toolId?: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, membershipExpiry: true },
    });

    if (!user) throw new Error('User not found');

    let role = (user.role || 'FREE') as Role;
    
    // ENFORCE MEMBERSHIP EXPIRATION
    const now = new Date();
    const isAdmin = role === 'ADMIN';
    if (!isAdmin && user.membershipExpiry && new Date(user.membershipExpiry) < now) {
        // Expired! Force Role back to FREE for quota purposes
        role = 'FREE';
    }

    const limit = ROLE_LIMITS[role];

    // 0. ADMIN Bypass
    if (limit.count >= 9999) return;

    if (!toolId) {
        // Fallback if no toolId provided (should not happen in strict mode, but pass for safety)
        return;
    }

    // 1. Check Allowed Tools for FREE
    if (role === 'FREE') {
        if (!FREE_ALLOWED_TOOLS.includes(toolId)) {
            throw new Error('PLAN_LOCKED'); // Show Upgrade Popup immediately
        }
    }

    // 2. Check Allowed Tools for BASIC
    if (role === 'BASIC') {
        if (!BASIC_ALLOWED_TOOLS.includes(toolId)) {
            throw new Error('PLAN_LOCKED'); // Show Upgrade Popup - need PRO plan
        }
    }

    // 3. Count Usage (Event Based)
    let usageCount = 0;

    if (limit.type === 'LIFETIME') {
        // Count ALL time usage for this tool
        usageCount = await prisma.event.count({
            where: {
                userId: userId,
                name: EVENT_NAME,
                path: toolId
            }
        });
    } else {
        // Count DAILY usage (Start of UTC Day)
        const now = new Date();
        const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        usageCount = await prisma.event.count({
            where: {
                userId: userId,
                name: EVENT_NAME,
                path: toolId,
                createdAt: {
                    gte: startOfDay
                }
            }
        });
    }

    // 4. Throw Error if Limit Reached
    if (usageCount >= limit.count) {
        if (role === 'FREE') {
            throw new Error('FREE_QUOTA_EXCEEDED'); // "Bạn đã dùng hết 1 lần miễn phí"
        }

        throw new Error('DAILY_QUOTA_EXCEEDED');
    }
}

/**
 * Increments usage by tracking an Event.
 */
export async function incrementUserUsage(userId: string, toolId?: string): Promise<void> {
    if (!toolId) return; // Must have toolId to track properly

    // Create a usage event
    await prisma.event.create({
        data: {
            name: EVENT_NAME,
            userId: userId,
            path: toolId,
        }
    });
}

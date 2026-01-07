
import { prisma } from './prisma';

export async function trackEvent(
    name: string,
    userId?: string | null,
    anonId?: string | null,
    properties?: any,
    path?: string // Usually from req.url
) {
    try {
        const now = new Date();
        // Dedupe logic: simple time-based check for specific events
        if (name === 'page_view' || name === 'tool_start' || name === 'landing_view') {
            const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);

            const whereClause: any = {
                name,
                createdAt: { gt: fiveMinsAgo }
            };
            if (userId) whereClause.userId = userId;
            else if (anonId) whereClause.anonId = anonId;
            else return; // Must have one identity

            if (path) whereClause.path = path;

            const existing = await prisma.event.findFirst({
                where: whereClause
            });

            if (existing) return;
        }

        // Deduping auth success events a bit to avoid double entry on page reloads/callback re-hits
        if (name === 'auth_login_success') {
            const oneMinAgo = new Date(now.getTime() - 60 * 1000);
            const existing = await prisma.event.findFirst({
                where: {
                    name,
                    userId,
                    createdAt: { gt: oneMinAgo }
                }
            });
            if (existing) return;
        }

        await prisma.event.create({
            data: {
                name,
                userId: userId || null,
                anonId: anonId || null,
                path: path || null,
                properties: properties ?? undefined,
            },
        });
    } catch (e) {
        console.error('Track Event Error:', e);
    }
}

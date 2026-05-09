
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    // Ensure Admin
    if (!session || (session.user as any).role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // Disable caching
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    const { from, to, source, campaign } = req.query;

    const sourceStr = Array.isArray(source) ? source[0] : source;
    const campaignStr = Array.isArray(campaign) ? campaign[0] : campaign;

    // Default to 30 days ago if missing
    const fromStr = (from as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    // Default to today if missing
    const toStr = (to as string) || new Date().toISOString().split('T')[0];

    // Normalize dates:
    // startDate = 00:00:00.000 of 'from'
    const startDate = new Date(fromStr);
    startDate.setHours(0, 0, 0, 0);

    // endDate = 23:59:59.999 of 'to'
    const endDate = new Date(toStr);
    endDate.setHours(23, 59, 59, 999);

    try {
        // 1. Sessions: Count generic page_views that have utm_source matching (or just count all if source not specified?)
        // Requirement: "Sessions from Google".
        // We look for events with name 'page_view' and properties.utm_source

        // Note: JSON filtering in Prisma can be tricky depending on DB support. Postgres supports it.
        // path: ['utm_source'] equals ...

        // Construct filters
        const attributionFilter: any = {
            firstSeenAt: {
                gte: startDate,
                lte: endDate
            }
        };
        if (sourceStr) attributionFilter.firstUtmSource = sourceStr;
        if (campaignStr) attributionFilter.firstUtmCampaign = campaignStr; // strict match or contains? strict for now

        // A. Signups (UserAttribution creation)
        const signups = await prisma.userAttribution.count({
            where: attributionFilter
        });

        // B. Logins (Events join UserAttribution)
        // We need unique users who logged in, filtered by their attribution
        // Prisma doesn't do deep joins easily in groupBy. Use finding raw or separate queries.
        // Simple approach: Find UserIDs matching attribution, then count events.

        const attributedUsers = await prisma.userAttribution.findMany({
            where: attributionFilter,
            select: { userId: true }
        });
        const userIds = attributedUsers.map(u => u.userId);

        const logins = await prisma.event.count({
            where: {
                name: 'auth_login_success',
                userId: { in: userIds },
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        const toolStarts = await prisma.event.count({
            where: {
                name: 'tool_start',
                userId: { in: userIds },
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        // C. Sessions (Raw Events)
        // Only where properties->>utm_source = source
        // If source is empty, maybe don't filter?
        const sessionWhere: any = {
            name: 'page_view',
            createdAt: { gte: startDate, lte: endDate }
        };
        if (sourceStr) {
            sessionWhere.properties = {
                path: ['utm_source'],
                equals: sourceStr
            };
        }
        if (campaignStr) {
            sessionWhere.properties = {
                path: ['utm_campaign'],
                equals: campaignStr
            };
        }

        const sessions = await prisma.event.count({
            where: sessionWhere
        });


        // Breakdown by Day + Campaign
        // This requires raw query for best performance, or processing in JS.
        // Let's return the totals first.
        // For breakdown, we'll cheat a bit and just return top campaigns or grouped data if feasible.
        // Grouping by JSON field (utm_campaign) in prisma is hard.

        // Alternative: Just return totals for now and maybe list top campaigns from UserAttribution
        const campaigns = await prisma.userAttribution.groupBy({
            by: ['firstUtmCampaign'],
            where: {
                firstSeenAt: { gte: startDate, lte: endDate },
                firstUtmSource: sourceStr || undefined
            },
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 10
        });

        // Detailed rows for the table:
        const data = campaigns.map(c => ({
            campaign: c.firstUtmCampaign || '(direct/none)',
            signups: c._count.userId,
            // We can't easily get sessions/logins per campaign without more queries.
            // For MVP, we'll return these counts.
        }));

        res.json({
            kpi: {
                sessions,
                signups,
                logins,
                toolStarts,
                conversionRate: sessions > 0 ? (toolStarts / sessions * 100).toFixed(2) : 0
            },
            breakdown: data
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Error' });
    }
}

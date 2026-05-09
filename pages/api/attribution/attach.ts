
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { UserAttributionPayload } from '@/lib/attribution';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (session.user as any).id;
    const { payload, anonId } = req.body as { payload: UserAttributionPayload | null, anonId: string };

    if (!userId) return res.status(400).json({ error: 'No user ID' });

    try {
        const existing = await prisma.userAttribution.findUnique({
            where: { userId }
        });

        // Prepare data
        const firstTouch = payload?.firstTouch;
        const lastTouch = payload?.lastTouch;

        if (!existing) {
            await prisma.userAttribution.create({
                data: {
                    userId,
                    anonId: anonId || payload?.anonId,

                    // First Touch
                    firstUtmSource: firstTouch?.utmSource,
                    firstUtmMedium: firstTouch?.utmMedium,
                    firstUtmCampaign: firstTouch?.utmCampaign,
                    firstUtmTerm: firstTouch?.utmTerm,
                    firstUtmContent: firstTouch?.utmContent,
                    firstGclid: firstTouch?.gclid,
                    firstReferrer: firstTouch?.referrer,
                    firstLandingPath: firstTouch?.landingPath,
                    firstSeenAt: firstTouch?.seenAt,

                    // Last Touch
                    lastUtmSource: lastTouch?.utmSource,
                    lastUtmMedium: lastTouch?.utmMedium,
                    lastUtmCampaign: lastTouch?.utmCampaign,
                    lastUtmTerm: lastTouch?.utmTerm,
                    lastUtmContent: lastTouch?.utmContent,
                    lastGclid: lastTouch?.gclid,
                    lastReferrer: lastTouch?.referrer,
                    lastLandingPath: lastTouch?.landingPath,
                    lastSeenAt: lastTouch?.seenAt,
                }
            });
        } else {
            // Update ONLY last touch, unless first touch was missing?
            // Requirement: "do NOT overwrite first_touch if exists"
            // But if existing record has null first_touch (legacy user?), we might want to backfill?
            // User says: "if exists: update last_touch only, do NOT overwrite first_touch"

            await prisma.userAttribution.update({
                where: { userId },
                data: {
                    // Update last touch always
                    lastUtmSource: lastTouch?.utmSource,
                    lastUtmMedium: lastTouch?.utmMedium,
                    lastUtmCampaign: lastTouch?.utmCampaign,
                    lastUtmTerm: lastTouch?.utmTerm,
                    lastUtmContent: lastTouch?.utmContent,
                    lastGclid: lastTouch?.gclid,
                    lastReferrer: lastTouch?.referrer,
                    lastLandingPath: lastTouch?.landingPath,
                    lastSeenAt: lastTouch?.seenAt,

                    // Link anonId if missing
                    anonId: existing.anonId ? undefined : (anonId || payload?.anonId)
                }
            });
        }

        res.status(200).json({ ok: true });
    } catch (e) {
        console.error('Attribution Attach Error:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

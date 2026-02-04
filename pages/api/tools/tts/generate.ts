import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

// Railway TTS server URL (set in Vercel env vars)
const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check auth
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email && process.env.NODE_ENV !== 'development') {
            return res.status(401).json({ error: 'Please login to use TTS' });
        }

        // 🛡️ STRICT QUOTA CHECK
        try {
            await checkUserQuota((session?.user as any).id, 'text-to-speech');
        } catch (error: any) {
            return res.status(403).json({ error: error.message, upgrade: true });
        }

        const { text, voice = 'alba', customVoiceId, isVN, rate } = req.body;
        // ... (rest of logic) ...
        if (isVN) {
            // ...
            // Use Edge TTS
            // ...
            if (!response.ok) {
                // ...
            }
            const audioBuffer = await response.arrayBuffer();

            // INCREMENT USAGE
            await incrementUserUsage((session?.user as any).id, 'text-to-speech');

            res.setHeader('Content-Type', 'audio/mp3');
            res.send(Buffer.from(audioBuffer));
            return;

        } else {
            // ...
            // Submit Job
            const response = await fetch(`${TTS_SERVER_URL}/job/submit`, {
                // ...
            });

            if (!response.ok) {
                // ...
            }

            const data = await response.json();

            // INCREMENT USAGE
            await incrementUserUsage((session?.user as any).id, 'text-to-speech');

            // Return Job ID
            res.status(200).json({
                success: true,
                jobId: data.job_id,
                status: 'queued'
            });
        }
    } catch (error: any) {
        console.error('TTS Generate Error:', error);
        res.status(500).json({ error: error.message || 'TTS generation failed' });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb'
        },
        responseLimit: false // Support large audio responses
    }
};

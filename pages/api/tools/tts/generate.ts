import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

// Railway TTS server URL (set in Vercel env vars)
const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

// Edge TTS endpoint (internal)
const EDGE_TTS_URL = process.env.EDGE_TTS_URL || '/api/tools/tts/edge';

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

        if (!text) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }

        if (isVN) {
            // Vietnamese - use Edge TTS via internal API
            const baseUrl = process.env.NEXTAUTH_URL || `http://${req.headers.host}`;
            const response = await fetch(`${baseUrl}/api/tools/tts/edge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': req.headers.cookie || ''
                },
                body: JSON.stringify({
                    text,
                    voice: voice || 'vi-VN-HoaiMyNeural'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Edge TTS failed: ${response.status}`);
            }

            const audioBuffer = await response.arrayBuffer();

            // INCREMENT USAGE
            await incrementUserUsage((session?.user as any).id, 'text-to-speech');

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('X-TTS-Provider', 'Edge');
            res.send(Buffer.from(audioBuffer));
            return;

        } else {
            // Non-Vietnamese - use Railway TTS server (job queue)
            const response = await fetch(`${TTS_SERVER_URL}/job/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voice: customVoiceId || voice,
                    rate: rate || 1.0
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `TTS Server failed: ${response.status}`);
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
        responseLimit: false
    }
};

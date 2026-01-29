// pages/api/tools/tts/generate.ts
// API endpoint to generate TTS audio via Pocket TTS server
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

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

        const { text, voice = 'alba', customVoiceId, isVN, rate } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Check usage limits (if not PRO)
        let user;
        if (session?.user?.email) {
            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { role: true, dailyUsage: true, maxDailyUsage: true }
            });
        }

        const isPro = (process.env.NODE_ENV === 'development')
            ? true
            : (user && ['CREATIVE', 'SUPER', 'VIP', 'ADMIN'].includes(user.role as string));

        // Free users: limit characters
        if (!isPro && text.length > 500) {
            return res.status(403).json({
                error: 'Free users can generate up to 500 characters. Upgrade to Pro for unlimited!',
                upgrade: true
            });
        }

        if (isVN) {
            // Use Edge TTS for Vietnamese (Direct response, fast enough)
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tools/tts/edge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voice,
                    rate: rate || 0
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Edge TTS failed');
            }

            const audioBuffer = await response.arrayBuffer();
            res.setHeader('Content-Type', 'audio/mp3');
            res.send(Buffer.from(audioBuffer));
            return;

        } else {
            // Use Pocket TTS (Local Python) - Submit Job for Async Processing
            const formData = new FormData();
            formData.append('text', text);
            formData.append('voice', voice);
            formData.append('type', 'tts');
            if (customVoiceId) {
                formData.append('custom_voice_id', customVoiceId);
            }

            // Submit Job
            const response = await fetch(`${TTS_SERVER_URL}/job/submit`, {
                method: 'POST',
                body: formData,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to submit job');
            }

            const data = await response.json();

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

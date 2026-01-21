// pages/api/tools/tts/generate.ts
// API endpoint to generate TTS audio via Pocket TTS server
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

// Railway TTS server URL (set in Vercel env vars)
const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check auth
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Please login to use TTS' });
        }

        const { text, voice = 'alba', customVoiceId } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Check usage limits (if not PRO)
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true, dailyUsage: true, maxDailyUsage: true }
        });

        const isPro = user && ['CREATIVE', 'SUPER', 'VIP', 'ADMIN'].includes(user.role);

        // Free users: limit characters
        if (!isPro && text.length > 500) {
            return res.status(403).json({
                error: 'Free users can generate up to 500 characters. Upgrade to Pro for unlimited!',
                upgrade: true
            });
        }

        // Call TTS server
        const formData = new FormData();
        formData.append('text', text);
        formData.append('voice', voice);
        if (customVoiceId) {
            formData.append('custom_voice_id', customVoiceId);
        }

        const ttsResponse = await fetch(`${TTS_SERVER_URL}/generate`, {
            method: 'POST',
            body: formData
        });

        if (!ttsResponse.ok) {
            const error = await ttsResponse.text();
            throw new Error(`TTS Error: ${error}`);
        }

        // Get audio buffer
        const audioBuffer = await ttsResponse.arrayBuffer();

        // Track usage
        await prisma.user.update({
            where: { email: session.user.email },
            data: { dailyUsage: { increment: 1 } }
        });

        // Return audio
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', `attachment; filename="tts_${Date.now()}.wav"`);
        res.send(Buffer.from(audioBuffer));

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

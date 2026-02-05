import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';
import { getTTSEndpoint } from '@/lib/tts-config';

// Fallback URLs
const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';
const VIENEU_TTS_URL = process.env.VIENEU_TTS_URL || 'https://seenweb-main-production.up.railway.app';

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

        const { text, voice = 'alba', customVoiceId, isVN, language = 'en', rate, engine } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }

        // Determine engine: VieNeu for VN clone voices, Edge for VN presets, Pocket for EN
        const isVietnamese = isVN || language === 'vi';
        const isCloneVoice = customVoiceId?.startsWith('custom_') || customVoiceId?.startsWith('vn_clone_');

        if (isVietnamese && isCloneVoice && engine !== 'edge') {
            // Vietnamese CLONE voice - use VieNeu TTS (Railway)
            const response = await fetch(`${VIENEU_TTS_URL}/job/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    type: 'tts',
                    text,
                    voice: voice || 'default',
                    custom_voice_id: customVoiceId || ''
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `VieNeu TTS failed: ${response.status}`);
            }

            const data = await response.json();
            await incrementUserUsage((session?.user as any).id, 'text-to-speech');

            return res.status(200).json({
                success: true,
                jobId: data.job_id,
                status: 'queued',
                engine: 'vieneu'
            });

        } else if (isVietnamese) {
            // Vietnamese PRESET voice - use Edge TTS (fast, no clone)
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
            await incrementUserUsage((session?.user as any).id, 'text-to-speech');

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('X-TTS-Provider', 'Edge');
            return res.send(Buffer.from(audioBuffer));

        } else {
            // English - use Pocket TTS (Local/Railway)
            const response = await fetch(`${TTS_SERVER_URL}/job/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    type: 'tts',
                    text,
                    voice: voice,
                    custom_voice_id: customVoiceId || ''
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `TTS Server failed: ${response.status}`);
            }

            const data = await response.json();
            await incrementUserUsage((session?.user as any).id, 'text-to-speech');

            return res.status(200).json({
                success: true,
                jobId: data.job_id,
                status: 'queued',
                engine: 'pocket'
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

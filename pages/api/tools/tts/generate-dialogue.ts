// pages/api/tools/tts/generate-dialogue.ts
// API for 2-person dialogue TTS generation
import type { NextApiRequest, NextApiResponse } from 'next';

import { checkUserQuota, incrementUserUsage } from '@/lib/quota';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 🔐 Authentication check
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Please login' });
    }

    // 🛡️ STRICT QUOTA CHECK
    try {
        await checkUserQuota((session.user as any).id, 'text-to-speech');
    } catch (error: any) {
        return res.status(403).json({ error: error.message });
    }

    try {
        const { text, voice1, voice2, speed } = req.body;


        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Parse [A] and [B] markers
        const pattern = /\[(A|B)\]\s*([\s\S]*?)(?=\[[AB]\]|$)/g;
        const segments: { speaker: 'A' | 'B', text: string }[] = [];
        let match;

        while ((match = pattern.exec(text)) !== null) {
            const speaker = match[1] as 'A' | 'B';
            const content = match[2].trim();
            if (content) {
                segments.push({ speaker, text: content });
            }
        }

        if (segments.length === 0) {
            return res.status(400).json({
                error: 'Không tìm thấy markers [A] hoặc [B]. Vui lòng dùng định dạng: [A] text... [B] text...'
            });
        }

        // Submit to Async Job Queue
        const formData = new FormData();
        formData.append('type', 'dialogue');
        formData.append('text', text);
        formData.append('voice', voice1);
        formData.append('voice2', voice2);
        // if (speed) formData.append('speed', speed.toString()); // Backend currently ignores speed for dialogue, but can add later

        const response = await fetch(`${TTS_SERVER_URL}/job/submit`, {
            method: 'POST',
            body: formData,
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            throw new Error('Server dialogue submission failed');
        }

        const data = await response.json();

        // INCREMENT USAGE
        await incrementUserUsage((session.user as any).id, 'text-to-speech');

        res.status(200).json({
            success: true,
            jobId: data.job_id,
            status: 'queued'
        });

    } catch (error: any) {
        console.error('Dialogue Generate Error:', error);
        res.status(500).json({ error: error.message });
    }
}

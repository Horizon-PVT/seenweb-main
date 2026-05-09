// pages/api/tools/tts/generate-srt.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false, // Required for file upload
    },
};

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

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
        // Parse form data with file
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        const srtFile = files.srtFile?.[0];
        const voice = (fields.voice?.[0] || 'alba') as string;
        const customVoiceId = fields.customVoiceId?.[0] as string | undefined;

        if (!srtFile) {
            return res.status(400).json({ error: 'SRT file required' });
        }

        // Read SRT file content
        const srtContent = fs.readFileSync(srtFile.filepath, 'utf-8');

        // Forward to Async TTS Job server
        const params = new URLSearchParams({
            type: 'srt',
            text: srtContent,
            voice: voice,
            custom_voice_id: customVoiceId || ''
        });

        const response = await fetch(`${TTS_SERVER_URL}/job/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        // Cleanup temp file
        fs.unlinkSync(srtFile.filepath);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.detail || 'Server error: ' + response.statusText);
        }

        const data = await response.json();

        // INCREMENT USAGE
        await incrementUserUsage((session.user as any).id, 'text-to-speech');

        return res.status(200).json({
            success: true,
            jobId: data.job_id,
            status: 'queued',
            engine: 'pocket_srt'
        });

    } catch (error: any) {
        console.error('SRT Generate Error:', error);
        res.status(500).json({ error: error.message });
    }
}

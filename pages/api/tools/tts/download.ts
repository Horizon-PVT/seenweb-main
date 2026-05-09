import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { jobId } = req.query;
    if (!jobId) {
        return res.status(400).json({ error: 'Missing jobId' });
    }

    try {
        const response = await fetch(`${TTS_SERVER_URL}/job/${jobId}/download`);
        if (!response.ok) {
            if (response.status === 404 || response.status === 400) {
                const errData = await response.json().catch(() => ({}));
                return res.status(404).json({ error: errData.detail || 'Job result not ready or failed' });
            }
            throw new Error(`Server returned ${response.status}`);
        }
        
        const audioBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', `attachment; filename="tts_${jobId}.wav"`);
        return res.send(Buffer.from(audioBuffer));
    } catch (error: any) {
        console.error('Job Download Error:', error);
        return res.status(500).json({ error: 'Failed to download job audio: ' + error.message });
    }
}

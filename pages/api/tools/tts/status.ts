import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';

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
        const response = await fetch(`${TTS_SERVER_URL}/job/${jobId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: 'Job not found' });
            }
            throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();

        // Inject the direct Cloudflare tunnel URL to bypass Vercel's 4.5MB download limit for large audio files
        if (data.status === 'completed') {
            data.resultUrl = `${TTS_SERVER_URL}/job/${jobId}/download`;
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Job Status Error:', error);
        return res.status(500).json({ error: 'Failed to fetch job status: ' + error.message });
    }
}

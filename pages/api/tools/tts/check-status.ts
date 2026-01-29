import type { NextApiRequest, NextApiResponse } from 'next';

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'http://127.0.0.1:8000';

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
            return res.status(response.status).json({ error: 'Job not found' });
        }

        const data = await response.json();

        // Return job data directly
        res.status(200).json(data);
    } catch (error: any) {
        console.error('Check Status Error:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
}

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
        // Fetch file from Python Server
        const response = await fetch(`${TTS_SERVER_URL}/job/${jobId}/download`);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Download failed or job not ready' });
        }

        const arrayBuffer = await response.arrayBuffer();

        // Forward headers if needed, or just set standard wav
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', `attachment; filename="job_${jobId}.wav"`);
        res.send(Buffer.from(arrayBuffer));

    } catch (error: any) {
        console.error('Download Proxy Error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
}

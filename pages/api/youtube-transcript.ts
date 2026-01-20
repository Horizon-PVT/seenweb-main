// pages/api/youtube-transcript.ts
// Fetches transcript/captions from YouTube video for extension integration

import type { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { videoId } = req.query;

    if (!videoId || typeof videoId !== 'string') {
        return res.status(400).json({ error: 'videoId is required' });
    }

    try {
        // Fetch transcript from YouTube
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'vi', // Try Vietnamese first
        }).catch(() =>
            // Fallback to auto-generated or English
            YoutubeTranscript.fetchTranscript(videoId)
        );

        if (!transcriptItems || transcriptItems.length === 0) {
            return res.status(404).json({
                error: 'Không tìm thấy phụ đề cho video này',
                message: 'Video không có captions/phụ đề tự động'
            });
        }

        // Combine transcript texts
        const fullTranscript = transcriptItems
            .map(item => item.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        return res.status(200).json({
            success: true,
            videoId,
            transcript: fullTranscript,
            segments: transcriptItems.length
        });

    } catch (error: any) {
        console.error('YouTube Transcript Error:', error);
        return res.status(500).json({
            error: 'Không thể lấy transcript',
            message: error.message || 'Video có thể không có phụ đề'
        });
    }
}

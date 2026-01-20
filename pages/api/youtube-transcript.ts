// pages/api/youtube-transcript.ts
// Using youtube-captions-scraper (robust library)

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSubtitles } from 'youtube-captions-scraper';

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
        // Try Vietnamese first
        let captions = await getSubtitles({
            videoID: videoId,
            lang: 'vi'
        }).catch(() => null);

        // If no VI, try English
        if (!captions) {
            captions = await getSubtitles({
                videoID: videoId,
                lang: 'en'
            }).catch(() => null);
        }

        // If still no captions, try to fetch default (without lang sometimes works or generic error)
        if (!captions) {
            // Retry with generic 'en' if strict match failed, or rely on internal fallback
            // The library throws if not found
            throw new Error('Không tìm thấy phụ đề (VI/EN)');
        }

        // Join text
        const transcript = captions
            .map((item: any) => item.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        return res.status(200).json({
            success: true,
            videoId,
            transcript,
            wordCount: transcript.split(/\s+/).length
        });

    } catch (error: any) {
        console.error('Transcript Error:', error);
        return res.status(500).json({
            error: 'Không thể lấy transcript',
            message: error.message || 'Video không có phụ đề khả dụng'
        });
    }
}

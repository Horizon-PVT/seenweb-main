// pages/api/youtube-transcript.ts
// Fetches transcript/captions from YouTube video - direct method

import type { NextApiRequest, NextApiResponse } from 'next';

interface TranscriptItem {
    text: string;
    start: number;
    duration: number;
}

async function fetchTranscript(videoId: string): Promise<string> {
    // Step 1: Get the video page to find caption tracks
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(videoUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        }
    });

    const html = await response.text();

    // Step 2: Extract captions URL from ytInitialPlayerResponse
    const captionsMatch = html.match(/"captions":\s*(\{[^}]+\})/);
    if (!captionsMatch) {
        // Try alternative pattern
        const timedTextMatch = html.match(/timedtext[^"]*videoId[^"]*[^"]+/);
        if (timedTextMatch) {
            throw new Error('Captions found but format not supported');
        }
        throw new Error('Video không có phụ đề');
    }

    // Find the captionTracks URL
    const captionTracksMatch = html.match(/"captionTracks":\s*\[(.*?)\]/s);
    if (!captionTracksMatch) {
        throw new Error('Không tìm thấy caption tracks');
    }

    // Parse and find Vietnamese or first available
    let captionUrl = '';
    const tracksStr = captionTracksMatch[1];

    // Try Vietnamese first
    const viMatch = tracksStr.match(/"baseUrl":\s*"([^"]+)"[^}]*"vssId":\s*"[^"]*vi[^"]*"/);
    if (viMatch) {
        captionUrl = viMatch[1];
    } else {
        // Get first available caption
        const firstMatch = tracksStr.match(/"baseUrl":\s*"([^"]+)"/);
        if (firstMatch) {
            captionUrl = firstMatch[1];
        }
    }

    if (!captionUrl) {
        throw new Error('Không tìm thấy URL phụ đề');
    }

    // Decode the URL
    captionUrl = captionUrl.replace(/\\u0026/g, '&').replace(/\\\//g, '/');

    // Step 3: Fetch the actual transcript
    const captionResponse = await fetch(captionUrl);
    const captionXml = await captionResponse.text();

    // Parse XML to extract text
    const textMatches = captionXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
    const transcriptParts: string[] = [];

    for (const match of textMatches) {
        let text = match[1];
        // Decode HTML entities
        text = text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\n/g, ' ');
        transcriptParts.push(text);
    }

    if (transcriptParts.length === 0) {
        throw new Error('Không thể parse phụ đề');
    }

    return transcriptParts.join(' ').replace(/\s+/g, ' ').trim();
}

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
        const transcript = await fetchTranscript(videoId);

        return res.status(200).json({
            success: true,
            videoId,
            transcript,
            wordCount: transcript.split(/\s+/).length
        });

    } catch (error: any) {
        console.error('YouTube Transcript Error:', error);
        return res.status(500).json({
            error: 'Không thể lấy transcript',
            message: error.message || 'Video có thể không có phụ đề'
        });
    }
}

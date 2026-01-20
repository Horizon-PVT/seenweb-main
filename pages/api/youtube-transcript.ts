// pages/api/youtube-transcript.ts
// Robust YouTube transcript fetching with manual JSON extraction

import type { NextApiRequest, NextApiResponse } from 'next';
import he from 'he';

async function getTranscript(videoId: string): Promise<string> {
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(pageUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        }
    });

    const html = await response.text();

    // Robustly extract captionTracks JSON
    const marker = '"captionTracks":';
    const startIdx = html.indexOf(marker);

    if (startIdx === -1) {
        throw new Error('Video không có phụ đề (captionTracks not found)');
    }

    // Find the start of the array '['
    const arrayStart = html.indexOf('[', startIdx);
    if (arrayStart === -1) {
        throw new Error('Cấu trúc phụ đề không hợp lệ');
    }

    // Bracket counting to find the closing ']'
    let bracketCount = 0;
    let arrayEnd = -1;

    for (let i = arrayStart; i < html.length; i++) {
        if (html[i] === '[') bracketCount++;
        else if (html[i] === ']') bracketCount--;

        if (bracketCount === 0) {
            arrayEnd = i + 1; // Include the closing bracket
            break;
        }
    }

    if (arrayEnd === -1) {
        throw new Error('Không thể parse dữ liệu phụ đề');
    }

    const jsonStr = html.substring(arrayStart, arrayEnd);
    let captionTracks;
    try {
        captionTracks = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error('Lỗi JSON parse phụ đề');
    }

    if (!captionTracks || captionTracks.length === 0) {
        throw new Error('Danh sách phụ đề rỗng');
    }

    // Priority: Vietnamese -> English -> First Available
    // Match 'vi' (Vietnamese) or 'vi-VN'
    let track = captionTracks.find((t: any) => t.languageCode === 'vi' || t.vssId?.startsWith('.vi'));

    // If not found, try English
    if (!track) {
        track = captionTracks.find((t: any) => t.languageCode === 'en');
    }

    // Fallback to first
    if (!track) {
        track = captionTracks[0];
    }

    console.log(`Fetching transcript from: ${track.baseUrl} (${track.name?.simpleText})`);

    // Fetch the XML transcript
    const transcriptRes = await fetch(track.baseUrl);
    const transcriptXml = await transcriptRes.text();

    // Regex to extract text from XML <text start="..." dur="...">Content</text>
    // using matchAll
    const textMatches = transcriptXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);

    const parts: string[] = [];
    for (const match of textMatches) {
        // Decode HTML entities (e.g. &#39; -> ')
        const decodedText = he.decode(match[1]);
        parts.push(decodedText);
    }

    if (parts.length === 0) {
        // Possible empty transcript or different format
        throw new Error('Nội dung phụ đề trống');
    }

    // Clean up
    return parts
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
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
        const transcript = await getTranscript(videoId);

        return res.status(200).json({
            success: true,
            videoId,
            transcript,
            wordCount: transcript.split(/\s+/).length
        });

    } catch (error: any) {
        console.error('Transcript API Error:', error.message);
        return res.status(500).json({
            error: 'Không thể lấy transcript',
            message: error.message
        });
    }
}

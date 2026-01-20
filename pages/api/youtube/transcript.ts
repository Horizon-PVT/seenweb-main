import type { NextApiRequest, NextApiResponse } from 'next';

interface TranscriptSegment {
    time: string;
    text: string;
}

interface TranscriptResponse {
    success: boolean;
    transcript?: string;
    segments?: TranscriptSegment[];
    keywords?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    language?: string;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TranscriptResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { videoId } = req.query;

    if (!videoId || typeof videoId !== 'string') {
        return res.status(400).json({ success: false, error: 'videoId required' });
    }

    try {
        console.log('[Transcript API] Fetching for videoId:', videoId);

        // Step 1: Get video page to extract caption tracks
        const videoPageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8'
            }
        });

        if (!videoPageRes.ok) {
            throw new Error(`Failed to fetch video page: ${videoPageRes.status}`);
        }

        const html = await videoPageRes.text();

        // Step 2: Extract ytInitialPlayerResponse
        const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/);
        if (!playerResponseMatch) {
            throw new Error('Could not find ytInitialPlayerResponse');
        }

        const playerResponse = JSON.parse(playerResponseMatch[1]);
        const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (!captionTracks || captionTracks.length === 0) {
            return res.status(404).json({ success: false, error: 'No captions available' });
        }

        // Step 3: Prefer Vietnamese, then English, then first available
        const track = captionTracks.find((t: any) => t.languageCode === 'vi')
            || captionTracks.find((t: any) => t.languageCode === 'en')
            || captionTracks[0];

        console.log('[Transcript API] Selected language:', track.languageCode);

        // Step 4: Fetch transcript XML
        const transcriptRes = await fetch(track.baseUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!transcriptRes.ok) {
            throw new Error(`Failed to fetch transcript: ${transcriptRes.status}`);
        }

        const xmlText = await transcriptRes.text();

        // Step 5: Parse XML
        const segments: TranscriptSegment[] = [];
        const textMatches = xmlText.matchAll(/<text start="([^"]+)"[^>]*>([^<]+)<\/text>/g);

        for (const match of textMatches) {
            const startSeconds = parseFloat(match[1]);
            const mins = Math.floor(startSeconds / 60);
            const secs = Math.floor(startSeconds % 60);
            const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

            let text = match[2];
            // Decode HTML entities
            text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

            segments.push({ time: timeStr, text: text.trim() });
        }

        const fullTranscript = segments.map(s => s.text).join(' ');

        // Step 6: Extract keywords (simple frequency analysis)
        const keywords = extractKeywords(fullTranscript);

        // Step 7: Sentiment analysis (simple)
        const sentiment = analyzeSentiment(fullTranscript);

        console.log('[Transcript API] Success:', segments.length, 'segments');

        return res.status(200).json({
            success: true,
            transcript: fullTranscript,
            segments,
            keywords,
            sentiment,
            language: track.languageCode
        });

    } catch (error: any) {
        console.error('[Transcript API] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

// Simple keyword extraction (top 10 most frequent words, excluding common words)
function extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'like', 'get', 'know', 'think', 'see', 'make', 'go', 'come', 'take', 'want', 'use']);

    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const frequency: Record<string, number> = {};

    for (const word of words) {
        if (!stopWords.has(word)) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    }

    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
}

// Simple sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'awesome', 'amazing', 'excellent', 'love', 'best', 'perfect', 'wonderful', 'fantastic', 'happy', 'beautiful', 'nice', 'better', 'enjoy', 'fun', 'easy', 'helpful', 'useful', 'recommended'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'horrible', 'difficult', 'hard', 'problem', 'issue', 'wrong', 'fail', 'error', 'disappointed', 'waste', 'useless', 'boring', 'confusing'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) positiveCount += matches.length;
    }

    for (const word of negativeWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) negativeCount += matches.length;
    }

    if (positiveCount > negativeCount * 1.5) return 'positive';
    if (negativeCount > positiveCount * 1.5) return 'negative';
    return 'neutral';
}

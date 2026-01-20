import type { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';

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

        // Fetch transcript using youtube-transcript library
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

        if (!transcriptData || transcriptData.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No captions available for this video'
            });
        }

        // Convert to our format
        const segments: TranscriptSegment[] = transcriptData.map((item: any) => {
            const seconds = Math.floor(item.offset / 1000);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            return { time: timeStr, text: item.text.trim() };
        });

        const fullTranscript = segments.map(s => s.text).join(' ');

        // Extract keywords (simple frequency analysis)
        const keywords = extractKeywords(fullTranscript);

        // Sentiment analysis (simple)
        const sentiment = analyzeSentiment(fullTranscript);

        console.log('[Transcript API] Success:', segments.length, 'segments');

        return res.status(200).json({
            success: true,
            transcript: fullTranscript,
            segments,
            keywords,
            sentiment,
            language: 'auto' // Library auto-detects
        });

    } catch (error: any) {
        console.error('[Transcript API] Error:', error);

        // Better error messages
        let errorMessage = 'Internal server error';
        if (error.message?.includes('Could not retrieve video information')) {
            errorMessage = 'Video not found or is private';
        } else if (error.message?.includes('No transcript')) {
            errorMessage = 'No captions available for this video';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return res.status(500).json({
            success: false,
            error: errorMessage
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

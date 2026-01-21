// pages/api/extension/keyword.ts - Keyword Insights for Extension
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

interface KeywordInsight {
    keyword: string;
    volume: 'very-high' | 'high' | 'medium' | 'low';
    competition: 'high' | 'medium' | 'low';
    trend: 'rising' | 'stable' | 'declining';
    score: number; // 0-100 opportunity score
    relatedKeywords: string[];
    topVideos?: {
        title: string;
        views: string;
        age: string;
    }[];
}

interface RequestBody {
    keyword: string;
}

// In-memory cache
const cache = new Map<string, { data: KeywordInsight; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getKeywordData(keyword: string): Promise<KeywordInsight> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Check cache first
    const cached = cache.get(keyword.toLowerCase());
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    let videoCount = 0;
    let avgViews = 0;
    let avgAge = 0;
    let topVideos: KeywordInsight['topVideos'] = [];
    let relatedKeywords: string[] = [];

    if (apiKey) {
        try {
            // Search for videos with this keyword
            const searchResponse = await youtube.search.list({
                key: apiKey,
                part: ['snippet'],
                q: keyword,
                type: ['video'],
                maxResults: 10,
                order: 'relevance',
            });

            const items = searchResponse.data.items || [];
            videoCount = searchResponse.data.pageInfo?.totalResults || 0;

            if (items.length > 0) {
                // Get video statistics
                const videoIds = items
                    .map(item => item.id?.videoId)
                    .filter((id): id is string => !!id);

                if (videoIds.length > 0) {
                    const statsResponse = await youtube.videos.list({
                        key: apiKey,
                        part: ['statistics', 'snippet'],
                        id: videoIds,
                    });

                    const videos = statsResponse.data.items || [];

                    // Calculate averages
                    const now = Date.now();
                    const viewCounts = videos.map(v => parseInt(v.statistics?.viewCount || '0'));
                    avgViews = viewCounts.reduce((a, b) => a + b, 0) / viewCounts.length;

                    const ages = videos.map(v => {
                        const published = new Date(v.snippet?.publishedAt || now).getTime();
                        return Math.floor((now - published) / (1000 * 60 * 60 * 24));
                    });
                    avgAge = ages.reduce((a, b) => a + b, 0) / ages.length;

                    // Get top 3 videos
                    topVideos = videos.slice(0, 3).map((v, i) => ({
                        title: v.snippet?.title || '',
                        views: formatViews(viewCounts[i]),
                        age: formatAge(ages[i])
                    }));

                    // Extract related keywords from titles
                    const allWords = videos
                        .map(v => v.snippet?.title?.toLowerCase() || '')
                        .join(' ')
                        .split(/\s+/)
                        .filter(w => w.length > 3 && !['video', 'youtube', 'watch'].includes(w));

                    // Get unique frequent words
                    const wordFreq = new Map<string, number>();
                    allWords.forEach(w => wordFreq.set(w, (wordFreq.get(w) || 0) + 1));
                    relatedKeywords = [...wordFreq.entries()]
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([word]) => word);
                }
            }
        } catch (error) {
            console.error('YouTube API Error:', error);
            // Continue with estimates
        }
    }

    // Estimate metrics based on data or use defaults
    const insight = estimateKeywordInsight(keyword, videoCount, avgViews, avgAge, relatedKeywords, topVideos);

    // Cache result
    cache.set(keyword.toLowerCase(), { data: insight, timestamp: Date.now() });

    return insight;
}

function estimateKeywordInsight(
    keyword: string,
    videoCount: number,
    avgViews: number,
    avgAge: number,
    relatedKeywords: string[],
    topVideos: KeywordInsight['topVideos']
): KeywordInsight {
    // Estimate volume based on video count
    let volume: KeywordInsight['volume'];
    if (videoCount > 1000000) volume = 'very-high';
    else if (videoCount > 100000) volume = 'high';
    else if (videoCount > 10000) volume = 'medium';
    else volume = 'low';

    // Estimate competition based on avg views and age
    let competition: KeywordInsight['competition'];
    if (avgViews > 500000 && avgAge > 180) competition = 'high';
    else if (avgViews > 50000) competition = 'medium';
    else competition = 'low';

    // Estimate trend based on avg age
    let trend: KeywordInsight['trend'];
    if (avgAge < 30) trend = 'rising';
    else if (avgAge < 90) trend = 'stable';
    else trend = 'declining';

    // Calculate opportunity score
    let score = 50;

    // Volume contribution
    if (volume === 'very-high') score += 20;
    else if (volume === 'high') score += 15;
    else if (volume === 'medium') score += 10;
    else score += 5;

    // Competition impact (lower = better)
    if (competition === 'low') score += 25;
    else if (competition === 'medium') score += 10;
    else score -= 10;

    // Trend bonus
    if (trend === 'rising') score += 15;
    else if (trend === 'stable') score += 5;
    else score -= 5;

    score = Math.max(0, Math.min(100, score));

    return {
        keyword,
        volume,
        competition,
        trend,
        score,
        relatedKeywords: relatedKeywords.length > 0
            ? relatedKeywords
            : generateRelatedKeywords(keyword),
        topVideos
    };
}

function generateRelatedKeywords(keyword: string): string[] {
    const words = keyword.toLowerCase().split(' ');
    const suggestions: string[] = [];

    // Add variations
    suggestions.push(`cách ${keyword}`);
    suggestions.push(`${keyword} cho người mới`);
    suggestions.push(`hướng dẫn ${keyword}`);
    suggestions.push(`${keyword} 2026`);
    suggestions.push(`${words[0]} tips`);

    return suggestions.slice(0, 5);
}

function formatViews(views: number): string {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
}

function formatAge(days: number): string {
    if (days < 7) return `${days} ngày`;
    if (days < 30) return `${Math.floor(days / 7)} tuần`;
    if (days < 365) return `${Math.floor(days / 30)} tháng`;
    return `${Math.floor(days / 365)} năm`;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<KeywordInsight | { error: string }>
) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { keyword }: RequestBody = req.body;

        if (!keyword || keyword.trim().length < 2) {
            return res.status(400).json({ error: 'Keyword required (min 2 chars)' });
        }

        const insight = await getKeywordData(keyword.trim());
        return res.status(200).json(insight);

    } catch (error: any) {
        console.error('Keyword Insight Error:', error);
        return res.status(500).json({ error: 'Failed to get keyword insights' });
    }
}

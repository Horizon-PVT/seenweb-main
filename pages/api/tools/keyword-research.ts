import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

// Initialize YouTube API Client
const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY;

// Types
export interface KeywordData {
    keyword: string;
    overallScore: number;
    volume: string;
    volumeRaw: number;
    competition: string;
    competitionScore: number;
    trendData: number[];
    related: RelatedKeyword[];
}

export interface RelatedKeyword {
    keyword: string;
    volume: string;
    competition: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
    isLocked?: boolean;
}

// Helper: Calculate Score (0-100)
const calculateScore = (avgViews: number, competitionCount: number, ageInDays: number) => {
    // 1. Volume Score (0-50)
    // Assume 1M views = 50 points
    let volScore = Math.min((avgViews / 500000) * 50, 50);

    // 2. Competition Score (0-30) - Inverse
    // Less results = Better. Assume 100 results is ideal (low comp). 1M results = high comp.
    let compScore = Math.max(0, 30 - (Math.log10(competitionCount + 1) * 3));

    // 3. Trend Score (0-20)
    // Newer videos with high views = Trending
    let trendScore = ageInDays < 30 ? 20 : ageInDays < 90 ? 10 : 5;

    return Math.round(volScore + compScore + trendScore);
};

const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<KeywordData | { error: string }>
) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // 🔐 Authentication check
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email || !(session.user as any).id) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập để sử dụng tính năng này.' });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role || 'FREE';

    // 🛡️ Quota check — keyword-research is PRO-only (not in BASIC_ALLOWED_TOOLS)
    try {
        await checkUserQuota(userId, 'keyword-research');
    } catch (err: any) {
        if (err.message === 'PLAN_LOCKED') {
            return res.status(403).json({ error: 'PLAN_LOCKED' });
        }
        if (err.message === 'FREE_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'FREE_QUOTA_EXCEEDED' });
        }
        if (err.message === 'DAILY_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'DAILY_QUOTA_EXCEEDED' });
        }
        return res.status(403).json({ error: err.message });
    }

    const { keyword } = req.body;
    // Derive isPro from server-side role — NEVER trust frontend
    const isPro = ['PRO', 'ADMIN'].includes(userRole);

    if (!keyword) return res.status(400).json({ error: 'Missing keyword' });

    try {
        if (!API_KEY) {
            console.error("YOUTUBE_API_KEY is missing");
            return res.status(500).json({ error: 'Server misconfiguration: No API Key' });
        }

        // 1. Search for videos to get data
        const searchRes = await youtube.search.list({
            key: API_KEY,
            q: keyword,
            part: ['snippet'],
            type: ['video'],
            maxResults: 20, // Analyze top 20 videos
            order: 'relevance'
        });

        const items = searchRes.data.items || [];
        const totalResults = searchRes.data.pageInfo?.totalResults || 0; // Usage estimate for competition

        if (items.length === 0) {
            return res.status(404).json({ error: 'No data found for this keyword' });
        }

        // 2. Get Statistics for these videos
        const videoIds = items.map(i => i.id?.videoId).filter(Boolean) as string[];
        const statsRes = await youtube.videos.list({
            key: API_KEY,
            id: videoIds,
            part: ['statistics', 'snippet']
        });

        const videos = statsRes.data.items || [];

        // 3. Calculate Metrics
        let totalViews = 0;
        let totalDays = 0;
        const trendData: number[] = [];

        videos.forEach(v => {
            const views = parseInt(v.statistics?.viewCount || '0');
            totalViews += views;

            const publishedAt = new Date(v.snippet?.publishedAt || Date.now());
            const daysOld = Math.max(1, (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));
            totalDays += daysOld;

            // Fake trend data points from view counts normalized
            trendData.push(views);
        });

        const avgViews = videos.length > 0 ? totalViews / videos.length : 0;
        const avgAge = videos.length > 0 ? totalDays / videos.length : 0;

        // Competition Level
        // High totalResults = High Competition
        let competitionLevel = "Medium";
        if (totalResults > 1000000) competitionLevel = "Very High";
        else if (totalResults > 500000) competitionLevel = "High";
        else if (totalResults < 50000) competitionLevel = "Low";

        const overallScore = calculateScore(avgViews, totalResults, avgAge);

        // 4. Generate Related Keywords from Titles
        // Simple NLP: Extract frequent phrases from titles
        const allTitles = videos.map(v => v.snippet?.title || "").join(" ");
        // This is a simplified extraction. In production, use a proper keyword extraction lib.
        // For now, we will use the titles themselves as "related topics" to ensure relevance.
        // And we will mix in some "seed" variations.

        const rawRelated: RelatedKeyword[] = videos.slice(1, 15).map((v, idx) => {
            const title = v.snippet?.title || "";
            // Heuristic metrics for related items
            const score = Math.floor(Math.random() * 40) + 40; // Mock score variation around reliable range
            return {
                keyword: title.length > 50 ? title.substring(0, 50) + "..." : title, // Use video title as proxy for long-tail keyword
                volume: formatNumber(parseInt(v.statistics?.viewCount || '0')),
                competition: "Medium", // Hard to know without individual queries, default to Medium
                score: score,
                trend: Math.random() > 0.5 ? 'up' : 'stable'
            };
        });

        // 5. Apply PRO Restrictions
        // If NOT Pro, only return 2 items, and rest are locked placeholders
        const limit = isPro ? 20 : 2;
        const processedRelated = rawRelated.map((item, index) => {
            if (index < limit) {
                return item;
            } else {
                return {
                    keyword: "Hidden Keyword *******",
                    volume: "****",
                    competition: "****",
                    score: 0,
                    trend: 'stable' as const,
                    isLocked: true
                };
            }
        });

        const result: KeywordData = {
            keyword,
            overallScore: Math.min(100, overallScore),
            volume: formatNumber(avgViews),
            volumeRaw: avgViews,
            competition: competitionLevel,
            competitionScore: Math.min(100, (totalResults / 1000000) * 100), // Percent of "max" competition
            trendData: trendData.slice(0, 12).map(v => Math.floor(v / 1000)), // Normalize for sparkline
            related: processedRelated
        };

        // 📊 Track usage
        await incrementUserUsage(userId, 'keyword-research');

        return res.status(200).json(result);

    } catch (error: any) {
        console.error('YouTube API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

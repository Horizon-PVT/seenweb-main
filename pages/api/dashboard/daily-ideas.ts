import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { google } from 'googleapis';
import { prisma } from "@/lib/prisma";
import { getCached, setCache, CACHE_PREFIXES } from '@/lib/cache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (session.user as any)?.id;

    try {
        await checkUserQuota(userId, 'scriptwriter'); // 1 free use, then upgrade
    } catch (error: any) {
        if (error.message === 'PLAN_LOCKED' || error.message === 'FREE_QUOTA_EXCEEDED' || error.message === 'DAILY_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'REQUIRE_UPGRADE', message: 'Vui lòng nâng cấp gói để tiếp tục nhận ý tưởng mỗi ngày!' });
        }
        return res.status(403).json({ error: error.message });
    }

    const { channelId } = req.query;
    if (!channelId) {
        return res.status(400).json({ error: "Missing channelId" });
    }

    // 1. Check Cache
    const cacheKey = `daily_ideas:${channelId}:${new Date().toISOString().split('T')[0]}`; // Cache per day
    const cachedIdeas = await getCached(cacheKey);

    if (cachedIdeas) {
        return res.status(200).json({ source: 'cache', ideas: cachedIdeas });
    }

    try {
        // 2. Get Channel Context (Topic)
        const channel = await prisma.youTubeChannel.findFirst({
            where: { channelId: String(channelId), userId: (session.user as any).id }
        });

        // Heuristic to determine topic: Use title or assume from DB if we had tags. 
        // For now, let's use the channel title + "popular topics" or just "trending" if generic.
        // BETTER: Use "Macro Niche" if user defined it, otherwise default.
        // Let's assume the user's channel title gives a hint, or we use a broad search related to their content.
        // MVP: Just use "Vietnam Trends" broadly if unknown, or infer from recent video titles.

        let searchTopic = "trending";
        // Attempt to extract topic from channel title or recent videos (if synced)
        if (channel?.title) {
            // Very naive extraction, just use title for now or "content creation"
            searchTopic = channel.title;
        }

        // 3. YouTube API: Hunt for Outliers (Real Data Phase)
        // This is "expensive" (100 quota), so we must cache.
        const youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY
        });

        // Search for recent videos (last 30 days) with high views match channel topic
        // We use a broader query to ensure we find *something*. 
        // If channel is "Tung Dang", searching "Tung Dang" won't find viral *others*.
        // Correct approach: We need the *Niche*. 
        // Fallback: Since we don't have explicit Niche in DB yet for all, we might rely on a passed param or default.
        // Let's use a generic 'trending' for MVP if cannot detect.
        // Actually, let's try to infer from the *User's Input* in other tools if possible? No.
        // Let's use "content creation" or "vlog" as safe defaults if title is obscure.

        const publishedAfter = new Date();
        publishedAfter.setDate(publishedAfter.getDate() - 30); // Last 30 days

        const searchRes = await youtube.search.list({
            part: ['snippet'],
            q: searchTopic, // This needs to be better, but OK for MVP
            type: 'video',
            order: 'viewCount',
            publishedAfter: publishedAfter.toISOString(),
            maxResults: 5,
            regionCode: 'VN', // Target market (Make dynamic later)
            w: 0 // workaround type
        } as any);

        const realVideos = searchRes.data.items || [];

        // Fetch Stats to calculate "Viral Ratio"
        // We need video stats (views) and channel stats (subs)
        // video stats are NOT in search result.

        let viralCandidates = [];

        if (realVideos.length > 0) {
            // 4.1 Get Video Stats
            const videoIds = realVideos.map(v => v.id?.videoId).filter(Boolean) as string[];
            const videoStatsRes = await youtube.videos.list({
                part: ['statistics'],
                id: videoIds
            });
            const videoStatsMap = new Map(videoStatsRes.data.items?.map(i => [i.id, i.statistics]));

            // 4.2 Get Channel Stats (to calculate ratio)
            const channelIds = [...new Set(realVideos.map(v => v.snippet?.channelId).filter(Boolean) as string[])];
            const channelStatsRes = await youtube.channels.list({
                part: ['statistics'],
                id: channelIds
            });
            const channelStatsMap = new Map(channelStatsRes.data.items?.map(i => [i.id, i.statistics]));

            // 4.3 Assemble & Filter Outliers
            for (const vid of realVideos) {
                const vidId = vid.id?.videoId;
                if (!vidId) continue;

                const vStats = videoStatsMap.get(vidId);
                const cStats = channelStatsMap.get(vid.snippet?.channelId || "");

                if (vStats && cStats) {
                    const views = parseInt(vStats.viewCount || "0");
                    const subs = parseInt(cStats.subscriberCount || "1"); // avoid zero div

                    const ratio = views / subs;

                    // We keep it if it has decent views (e.g. > 10k) - Low bar for MVP
                    if (views > 10000) {
                        viralCandidates.push({
                            title: vid.snippet?.title,
                            realViews: views,
                            realSubs: subs,
                            viralRatio: ratio.toFixed(1),
                            videoId: vidId,
                            channelTitle: vid.snippet?.channelTitle
                        });
                    }
                }
            }
        }

        // Sort by Viral Ratio
        viralCandidates.sort((a, b) => parseFloat(b.viralRatio) - parseFloat(a.viralRatio));
        const topCandidates = viralCandidates.slice(0, 3); // Top 3 outliers

        // 5. AI Generation (The Magic)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a YouTube Strategy Expert.
            I have found these ${topCandidates.length} viral videos in the niche "${searchTopic}".
            ${JSON.stringify(topCandidates)}

            TASK:
            Generate 10 FRESH video ideas for my channel.
            For each idea, you MUST Adapt one of the winning concepts above.
            
            IMPORTANT: Identify the language used in the "niche" and "viral videos" provided. 
            OUTPUT ALL TITLES AND HOOKS IN THAT SAME LANGUAGE. Do not default to English or Vietnamese if the content is different.

            OUTPUT JSON FORMAT:
            [
                {
                    "title": "Viral Title (In the detected language)",
                    "mainHook": "One sentence hook",
                    "viralScore": 95,
                    "difficulty": "Easy/Medium/Hard",
                    "viralReason": "Why it works? (e.g. 'Uses Curiosity Gap like [RealVideoTitle]')",
                    "dataProof": {
                        "realVideoTitle": "Title of the real viral video used as reference",
                        "realViews": 500000, 
                        "realViralRatio": 10.5
                    }
                }
            ]
            
            Strict JSON array only.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Robust JSON extraction
        const jsonStart = responseText.indexOf('[');
        const jsonEnd = responseText.lastIndexOf(']');

        let cleanedJson;
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanedJson = responseText.substring(jsonStart, jsonEnd + 1);
        } else {
            // Fallback: try to clean markdown only
            cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        const ideas = JSON.parse(cleanedJson);

        // Increment usage
        await incrementUserUsage(userId, 'scriptwriter');

        // 6. Cache & Return
        // Cache for 24 hours (86400s)
        await setCache(cacheKey, ideas, 86400);

        return res.status(200).json({ source: 'gen', ideas });

    } catch (error: any) {
        console.error("Daily Ideas Error:", error);
        return res.status(500).json({ error: error.message });
    }
}

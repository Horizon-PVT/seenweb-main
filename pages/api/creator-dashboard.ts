// pages/api/creator-dashboard.ts
// WF7: Creator Analytics Dashboard - Channel health, video performance, growth tracking
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { GoogleGenAI } from '@google/generative-ai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { checkUserQuota, incrementUserUsage } from "@/lib/quota";
import { prisma } from "@/lib/prisma";
import { getCached, setCache, generateCacheKey, CACHE_PREFIXES } from "@/lib/cache";

const CACHE_TTL_SHORT = 30 * 60; // 30 minutes
const CACHE_TTL_LONG = 6 * 60 * 60; // 6 hours

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  try {
    await checkUserQuota(session.user.id, 'creator-dashboard');
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }

  const { channelId, channelUrl, action = 'full_analysis' } = req.body;
  const userId = session.user.id;

  const apiKey = process.env.GEMINI_API_KEY;
  const youtubeKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || !youtubeKey) {
    return res.status(500).json({ error: "Server Config Error: Missing API keys" });
  }

  // Resolve channel URL to channel ID
  let resolvedChannelId = channelId;
  if (channelUrl && !resolvedChannelId) {
    try {
      const youtube = google.youtube({ version: 'v3', auth: youtubeKey });
      const urlMatch = channelUrl.match(/(?:youtube\.com\/(?:channel\/|c\/|user\/|@)([^\/?\&]+)|youtu\.be\/([^\?]+))/);

      if (urlMatch) {
        const handle = urlMatch[1];
        if (handle?.startsWith('UC')) {
          resolvedChannelId = handle;
        } else {
          const s = await youtube.search.list({ part: ['snippet'], q: handle, type: ['channel'], maxResults: 1 });
          resolvedChannelId = s.data.items?.[0]?.snippet?.channelId;
        }
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid channel URL" });
    }
  }

  if (!resolvedChannelId) {
    return res.status(400).json({ error: "Missing channelId or channelUrl" });
  }

  // Cache check
  const cacheInput = `creator:${resolvedChannelId}:${action}`;
  const cacheKey = generateCacheKey(CACHE_PREFIXES.GENERAL, cacheInput);
  const cached = await getCached<any>(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    const youtube = google.youtube({ version: 'v3', auth: youtubeKey });
    const genAI = new GoogleGenerativeAI(apiKey);

    // === Fetch Channel Data ===
    const chRes = await youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [resolvedChannelId]
    });

    const channel = chRes.data.items?.[0];
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const channelInfo = {
      title: channel.snippet?.title,
      thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url,
      subscribers: Number(channel.statistics?.subscriberCount || 0),
      totalViews: Number(channel.statistics?.viewCount || 0),
      videoCount: Number(channel.statistics?.videoCount || 0),
      description: channel.snippet?.description?.substring(0, 500)
    };

    // === Fetch Recent Videos ===
    const videoRes = await youtube.search.list({
      part: ['snippet', 'id'],
      channelId: resolvedChannelId,
      order: 'date',
      maxResults: 20,
      type: ['video']
    });

    const videoIds = (videoRes.data.items || []).map(v => v.id?.videoId).filter(Boolean) as string[];

    let videoStats: any[] = [];
    if (videoIds.length > 0) {
      const statsRes = await youtube.videos.list({
        part: ['statistics', 'contentDetails', 'snippet'],
        id: videoIds
      });
      videoStats = statsRes.data.items || [];
    }

    const videos = videoStats.map(v => ({
      id: v.id,
      title: v.snippet?.title,
      thumbnail: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.medium?.url,
      publishedAt: v.snippet?.publishedAt,
      views: Number(v.statistics?.viewCount || 0),
      likes: Number(v.statistics?.likeCount || 0),
      comments: Number(v.statistics?.commentCount || 0),
      duration: v.contentDetails?.duration || '',
      engagement: v.statistics?.likeCount && v.statistics?.viewCount
        ? ((Number(v.statistics?.likeCount) + Number(v.statistics?.commentCount)) / Math.max(Number(v.statistics?.viewCount), 1) * 100).toFixed(2)
        : '0'
    }));

    // Sort by views
    const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);
    const recentVideos = [...videos].sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()).slice(0, 10);

    // Calculate averages
    const avgViews = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length) : 0;
    const avgEngagement = videos.length > 0
      ? (videos.reduce((sum, v) => sum + parseFloat(String(v.engagement)), 0) / videos.length).toFixed(2)
      : '0';

    // === AI Analysis ===
    let aiAnalysis = null;
    if (action === 'full_analysis' || action === 'insights') {
      const analysisPrompt = `Analyze this YouTube channel and provide strategic insights.

**CHANNEL DATA:**
- Name: ${channelInfo.title}
- Subscribers: ${channelInfo.subscribers.toLocaleString()}
- Total Views: ${channelInfo.totalViews.toLocaleString()}
- Video Count: ${channelInfo.videoCount}
- Avg Views per Video: ${avgViews.toLocaleString()}
- Avg Engagement Rate: ${avgEngagement}%

**TOP 5 VIDEOS (by views):**
${topVideos.map((v, i) => `${i + 1}. "${v.title}" - ${v.views.toLocaleString()} views, ${v.engagement}% engagement`).join('\n')}

**RECENT 10 VIDEOS:**
${recentVideos.map(v => `"${v.title}" - ${v.views.toLocaleString()} views, ${v.likes} likes, ${v.comments} comments`).join('\n')}

**Return ONLY pure JSON with this EXACT structure:**
{
  "channelHealth": {
    "score": 75,
    "grade": "B+",
    "summary": "Brief health assessment in Vietnamese"
  },
  "performanceMetrics": {
    "avgViews": ${avgViews},
    "avgEngagement": "${avgEngagement}%",
    "subscriberGrowthRate": "X% monthly estimate",
    "viewsPerVideo": ${channelInfo.totalViews / Math.max(channelInfo.videoCount, 1)}
  },
  "contentAnalysis": {
    "bestPerformingType": "Video type that works best",
    "optimalUploadFrequency": "Recommendation",
    "sweetSpotDuration": "X-Y minutes recommendation",
    "bestPostingTime": "HH:MM recommendation"
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "threats": ["Threat 1", "Threat 2"],
  "topVideoCharacteristics": {
    "commonElements": ["Element 1", "Element 2", "Element 3"],
    "avgDuration": "X minutes",
    "commonTopics": ["Topic 1", "Topic 2"]
  },
  "improvementRecommendations": [
    { "priority": "High", "recommendation": "Specific recommendation in Vietnamese", "expectedImpact": "Expected impact" },
    { "priority": "Medium", "recommendation": "Medium priority recommendation", "expectedImpact": "Impact description" },
    { "priority": "Low", "recommendation": "Low priority recommendation", "expectedImpact": "Impact description" }
  ],
  "competitorBenchmarks": {
    "avgViewsNeededToRank": ${Math.round(avgViews * 1.5)},
    "avgEngagementRateNeeded": "${(parseFloat(avgEngagement) * 1.2).toFixed(2)}%",
    "estimatedDaysToTop10": "X-Y days"
  },
  "growthForecast": {
    "optimistic": "If you implement top recommendations, expected growth in 3 months",
    "realistic": "Realistic growth projection in Vietnamese",
    "conservative": "Conservative estimate"
  }
}`;

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json", temperature: 0.5, maxOutputTokens: 8192 }
      });

      const aiResponse = await model.generateContent(analysisPrompt);
      const aiText = aiResponse.response.text()?.trim() || "{}";
      aiAnalysis = JSON.parse(aiText.replace(/^```json /, '').replace(/```$/, ''));
    }

    const result = {
      channelId: resolvedChannelId,
      channel: channelInfo,
      videos: {
        all: videos,
        top: topVideos,
        recent: recentVideos
      },
      metrics: {
        avgViews,
        avgEngagement,
        totalVideos: videos.length
      },
      analysis: aiAnalysis,
      cachedAt: new Date().toISOString()
    };

    // Save to user's YouTube channels if logged in
    try {
      await prisma.youTubeChannel.upsert({
        where: { channelId: resolvedChannelId },
        create: {
          userId,
          channelId: resolvedChannelId,
          title: channelInfo.title,
          thumbnail: channelInfo.thumbnail || undefined,
          subCount: channelInfo.subscribers,
          viewCount: String(channelInfo.totalViews),
          videoCount: channelInfo.videoCount,
          recentVideos: topVideos.slice(0, 10) as any
        },
        update: {
          title: channelInfo.title,
          thumbnail: channelInfo.thumbnail || undefined,
          subCount: channelInfo.subscribers,
          viewCount: String(channelInfo.totalViews),
          videoCount: channelInfo.videoCount,
          recentVideos: topVideos.slice(0, 10) as any,
          lastSync: new Date()
        }
      });
    } catch (dbErr) {
      console.warn("Could not save channel to DB:", dbErr);
    }

    await incrementUserUsage(session.user.id, 'creator-dashboard');
    setCache(cacheKey, result, CACHE_TTL_SHORT);
    res.status(200).json(result);

  } catch (error: any) {
    console.error("Creator Dashboard Error:", error);
    if (error.response?.status === 403) {
      return res.status(403).json({ error: "YouTube API quota exceeded. Please try again later." });
    }
    res.status(500).json({ error: "Dashboard analysis failed: " + error.message });
  }
}

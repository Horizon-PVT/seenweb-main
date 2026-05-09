// pages/api/intelligence-hub.ts
// WF5: Content Intelligence Hub - Combine all research tools into one unified workflow
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from "@/lib/quota";
import { getCached, setCache, generateCacheKey, CACHE_PREFIXES } from "@/lib/cache";

const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  try {
    await checkUserQuota(session.user.id, 'intelligence-hub');
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }

  const { keyword, competitorChannel, market = 'VN' } = req.body;
  if (!keyword && !competitorChannel) {
    return res.status(400).json({ error: "Missing keyword or competitorChannel" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const youtubeKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "Server Config Error" });

  const isVN = market === 'VN';
  const outputLang = isVN ? 'Tiếng Việt' : 'English';

  // Cache key
  const cacheInput = `intel:${keyword || ''}:${competitorChannel || ''}:${market}`;
  const cacheKey = generateCacheKey(CACHE_PREFIXES.GENERAL, cacheInput);
  const cached = await getCached<any>(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    const youtube = google.youtube({ version: 'v3', auth: youtubeKey });
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 16384 }
    });

    // === Step 1: Fetch YouTube Data (Parallel) ===
    let nicheData = null;
    let rivalData = null;
    let hiddenData = null;

    if (keyword) {
      const regionCode = isVN ? 'VN' : 'US';

      // Micro Niche Data
      const [channelSearch, videoSearch] = await Promise.all([
        youtube.search.list({ part: ['snippet'], q: keyword, type: ['channel'], maxResults: 20, regionCode }),
        youtube.search.list({ part: ['snippet'], q: keyword, type: ['video'], order: 'viewCount', maxResults: 30, regionCode })
      ]);

      const channelIds = (channelSearch.data.items || []).map(i => i.snippet?.channelId).filter(Boolean) as string[] || [];
      const channels = channelIds.length
        ? (await youtube.channels.list({ part: ['snippet', 'statistics'], id: channelIds })).data.items || []
        : [];

      const lowFloorChannels = channels
        .filter((c: any) => {
          const subs = Number(c.statistics?.subscriberCount || 0);
          return subs > 500 && subs < 100000;
        })
        .slice(0, 10)
        .map((c: any) => ({
          name: c.snippet?.title,
          subscribers: Number(c.statistics?.subscriberCount || 0)
        }));

      const hotVideos = (videoSearch.data.items || []).slice(0, 15).map((v: any) => v.snippet?.title);

      nicheData = { lowFloorChannels, hotVideos };

      // Hidden Channel Data
      const hiddenSearch = await youtube.search.list({
        part: ['snippet'],
        q: keyword,
        type: ['channel'],
        maxResults: 30,
        publishedAfter: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      });

      const hiddenIds = (hiddenSearch.data.items || []).map(i => i.snippet?.channelId).filter(Boolean) as string[] || [];
      const hiddenChannels = hiddenIds.length
        ? (await youtube.channels.list({ part: ['snippet', 'statistics'], id: hiddenIds })).data.items || []
        : [];

      const risingChannels = hiddenChannels
        .filter((c: any) => {
          const subs = Number(c.statistics?.subscriberCount || 0);
          const views = Number(c.statistics?.viewCount || 0);
          return subs > 100 && subs < 50000 && views > 0 && (views / Math.max(subs, 1)) > 2;
        })
        .slice(0, 8)
        .map((c: any) => ({
          name: c.snippet?.title,
          subscribers: Number(c.statistics?.subscriberCount || 0),
          views: Number(c.statistics?.viewCount || 0)
        }));

      hiddenData = { risingChannels };
    }

    // === Step 2: Rival Scanner Data ===
    if (competitorChannel) {
      let channelId = null;
      const urlMatch = competitorChannel.match(/(?:youtube\.com\/(?:channel\/|c\/|user\/|@)([^\/?\&]+)|youtu\.be\/([^\?]+))/);

      if (urlMatch) {
        const handle = urlMatch[1];
        if (handle?.startsWith('UC')) {
          channelId = handle;
        } else {
          const s = await youtube.search.list({ part: ['snippet'], q: handle, type: ['channel'], maxResults: 1 });
          channelId = s.data.items?.[0]?.snippet?.channelId;
        }
      }

      if (channelId) {
        const [chRes, videoRes] = await Promise.all([
          youtube.channels.list({ part: ['snippet', 'statistics'], id: [channelId] }),
          youtube.search.list({ part: ['snippet'], channelId, order: 'date', maxResults: 10, type: ['video'] })
        ]);

        const ch = chRes.data.items?.[0];
        if (ch) {
          const recentVideos = (videoRes.data.items || []).map((v: any) => ({
            title: v.snippet?.title,
            views: 0
          }));

          rivalData = {
            channelName: ch.snippet?.title,
            subscribers: Number(ch.statistics?.subscriberCount || 0),
            recentVideos
          };
        }
      }
    }

    // === Step 3: AI Intelligence Synthesis ===
    const synthesisPrompt = `You are a YouTube Growth Strategist AI. Synthesize real-time data into an actionable intelligence report.

**MARKET DATA:**
${nicheData ? `Niche Analysis (${keyword}):\n- Low-floor channels: ${JSON.stringify(nicheData.lowFloorChannels)}\n- Hot videos: ${JSON.stringify(nicheData.hotVideos.slice(0, 10))}\n` : ''}
${hiddenData ? `Hidden/Rising channels: ${JSON.stringify(hiddenData.risingChannels)}\n` : ''}
${rivalData ? `Competitor Analysis (${rivalData.channelName}, ${rivalData.subscribers.toLocaleString()} subs):\n- Recent videos: ${JSON.stringify(rivalData.recentVideos.map((v: any) => v.title).slice(0, 5))}\n` : ''}

**OUTPUT LANGUAGE:** ${outputLang}

**CRITICAL INSTRUCTIONS:**
1. ALL analysis and text output MUST be in ${outputLang}.
2. Return ONLY pure JSON with this exact structure (no markdown, no explanations):
{
  "executiveSummary": "2-3 sentence strategic overview in ${outputLang}",
  "nicheAnalysis": {
    "score": 85,
    "opportunity": "Why this niche is good in ${outputLang}",
    "risks": ["Risk 1", "Risk 2"],
    "bestTiming": "Q1/Q2/Q3/Q4 recommendation",
    "topMicroNiches": ["Micro niche 1", "Micro niche 2", "Micro niche 3"]
  },
  "competitorIntel": {
    "strengths": ["Competitor strength 1", "Competitor strength 2"],
    "weaknesses": ["Competitor weakness 1", "Competitor weakness 2"],
    "untappedAngles": ["What they are missing 1", "What they are missing 2"],
    "entryDifficulty": "Easy/Medium/Hard",
    "estimatedTimeToRival": "X months"
  },
  "risingOpportunities": [
    { "topic": "Rising topic name", "reason": "Why it is rising in ${outputLang}", "potential": "High/Medium/Low" }
  ],
  "winningStrategy": {
    "step1": "First action to take in ${outputLang}",
    "step2": "Second action in ${outputLang}",
    "step3": "Third action in ${outputLang}",
    "quickWin": "One quick win in ${outputLang}"
  },
  "recommendedContentAngles": [
    { "title": "Content angle 1", "hook": "Hook idea in ${outputLang}", "diff": "How to differentiate from competitors" },
    { "title": "Content angle 2", "hook": "Hook idea", "diff": "Differentiation" },
    { "title": "Content angle 3", "hook": "Hook idea", "diff": "Differentiation" }
  ],
  "idealVideoTypes": ["Video type 1", "Video type 2", "Video type 3"],
  "estimatedCPM": "$X-$Y for ${market} market",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;

    const aiResponse = await model.generateContent(synthesisPrompt);
    const aiText = aiResponse.response.text()?.trim() || "{}";
    const intelData = JSON.parse(aiText.replace(/^```json /, '').replace(/```$/, ''));

    const result = {
      keyword,
      competitorChannel,
      market,
      rawData: { nicheData, hiddenData, rivalData },
      intelligence: intelData
    };

    await incrementUserUsage(session.user.id, 'intelligence-hub');
    setCache(cacheKey, result, CACHE_TTL_SECONDS);
    res.status(200).json(result);

  } catch (error: any) {
    console.error("Intelligence Hub Error:", error);
    res.status(500).json({ error: "Intelligence synthesis failed: " + error.message });
  }
}

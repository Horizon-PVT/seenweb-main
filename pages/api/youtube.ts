// File mới: pages/api/youtube.ts (API Route Chung Cho 3 Tools - Pages Router)

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';

const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper để extract channelId hoặc videoId từ URL
function extractFromUrl(url: string): { type: 'channel' | 'video', value: string } | null {
  // Match channel/handle
  let match = url.match(/youtube\.com\/(@|channel\/|user\/|c\/)([^\/\?]+)/);
  if (match) {
    const prefix = match[1];
    const value = match[2];
    return { type: 'channel', value: prefix === '@' ? value : value };
  }
  // Match video /watch?v=ID
  match = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (match) {
    return { type: 'video', value: match[1] };
  }
  return null;
}

// Helper để format data cho Gemini prompt
async function analyzeWithGemini(tool: string, ytData: any, params: any, language: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });  // Fix model 2025 valid
  let prompt = '';

  if (tool === 'rival') {
    prompt = `Phân tích dữ liệu YouTube sau: ${JSON.stringify(ytData)}. Phạm vi: ${params.scanScope}. Ngôn ngữ output: ${language}. Trả về JSON strict theo structure: {
      "competitorProfile": {"name": "string"},
      "strategicWeaknesses": ["string[]"],
      "successSignals": ["string[]"],
      "contentStructure": {"mainKeywords": ["string[]"], "seoEvaluation": "string"},
      "untappedNiches": ["string[]"] optional,
      "counterAttackPlan": "string"
    }. Chỉ JSON, no extra text.`;
  } else if (tool === 'hidden') {
    prompt = `Tìm kênh ẩn dựa trên query "${params.seedQuery}" và filters: subs ${params.minSubs}-${params.maxSubs}, videos >${params.minVideos}, growth >${params.growthVelocity}, competition ${params.nicheCompetition}. Dữ liệu YT: ${JSON.stringify(ytData)}. Ngôn ngữ: ${language}. JSON: {
      "risingChannels": [{"name": "string", "url": "string", "subscribers": "string", "videoCount": "string", "growthMetric": "string", "coreStrengths": ["string"]}],
      "trendingVideos": [{"title": "string", "url": "string", "viralRatio": "string", "viralStructure": ["string"]}],
      "upcomingTrends": ["string[]"]
    }. Chỉ JSON.`;
  } else if (tool === 'micro') {
    prompt = `Khai thác micro-niches từ macro "${params.macroNiche}", filters: competition ${params.competition}, search ${params.searchVolume}, monetization ${params.monetization}. Dữ liệu YT: ${JSON.stringify(ytData)}. Ngôn ngữ: ${language}. JSON: {
      "topNiches": [{"nicheName": "string", "overallScore": number, "competitionScore": number, "searchVolumeScore": number, "monetizationScore": number, "pioneerVideoTopics": ["string[]"], "miningScript": {"tone": "string", "frequency": "string", "monetizationGoal": "string"}, "lowFloorChannels": [{"name": "string", "url": "string"}]}],
      "saturatedNichesWarning": ["string[]"]
    }. Chỉ JSON.`;
  }

  try {
    const result = await model.generateContent(prompt);
    const jsonStr = await result.response.text().replace(/```json|```/g, '').trim(); // Clean nếu có markdown
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Gemini fail, fallback:', err);
    throw new Error('AI error - try again');
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  const { tool, ...params } = body;

  if (!['rival', 'hidden', 'micro'].includes(tool)) {
    return res.status(400).json({ error: 'Tool không hợp lệ' });
  }

  try {
    let ytData: any = {};

    if (tool === 'rival') {
      const urlInfo = extractFromUrl(params.targetUrl);
      if (!urlInfo) throw new Error('URL không valid');

      let channelRes, videosRes, channelId;
      if (urlInfo.type === 'video') {
        const videoRes = await youtube.videos.list({ part: ['snippet', 'statistics'], id: urlInfo.value });
        ytData.video = videoRes.data;
        channelId = videoRes.data.items?.[0].snippet?.channelId;
        if (!channelId) throw new Error('Không tìm thấy channel từ video');
        videosRes = await youtube.search.list({ part: ['snippet'], channelId, type: 'video', maxResults: 10 });
        channelRes = await youtube.channels.list({ part: ['snippet', 'statistics'], id: channelId });
      } else {
        channelRes = await youtube.channels.list({ part: ['snippet', 'statistics'], forHandle: urlInfo.value });
        channelId = channelRes.data.items?.[0].id;
        videosRes = await youtube.search.list({ part: ['snippet'], channelId, type: 'video', maxResults: 10 });
      }
      ytData = { channel: channelRes.data, videos: videosRes.data };
    } else if (tool === 'hidden') {
      const searchRes = await youtube.search.list({
        part: ['snippet'],
        q: params.seedQuery,
        type: 'channel',
        order: 'date',
        maxResults: 20
      });
      // Fetch details cho top channels
      const channelIds = searchRes.data.items?.map(item => item.snippet?.channelId).slice(0, 10) || [];
      const detailsRes = await youtube.channels.list({ part: ['snippet', 'statistics'], id: channelIds.join(',') });
      ytData = { search: searchRes.data, details: detailsRes.data };
    } else if (tool === 'micro') {
      const searchRes = await youtube.search.list({
        part: ['snippet'],
        q: params.macroNiche,
        type: 'video',
        order: 'relevance',
        maxResults: 50
      });
      ytData = searchRes.data;
    }

    if (!ytData || (ytData.items && ytData.items.length === 0)) {
      throw new Error('Không tìm thấy dữ liệu YouTube');
    }

    // Analyze với Gemini để structured output
    const analyzed = await analyzeWithGemini(tool, ytData, params, params.outputLanguage);

    res.status(200).json(analyzed);

  } catch (error: any) {
    console.error('YouTube/Gemini error:', error);
    res.status(500).json({ error: error.message || 'Lỗi server' });
  }
}
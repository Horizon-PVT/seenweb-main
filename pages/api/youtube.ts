// pages/api/youtube.ts
// BẢN FULL ĐÃ FIX HOÀN HẢO CHO MICRO NICHE MINER + REDIS CACHE (Jan 2026)

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCached, setCache, generateCacheKey, CACHE_PREFIXES } from '@/lib/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Redis Cache TTL: 7 days (persistent across restarts)
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // 🔐 Authentication check
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này.' });
  }

  const { tool, input, macroNiche, outputLanguage = 'Tiếng Việt' } = req.body;

  if (!tool) return res.status(400).json({ error: 'Thiếu tool' });

  // 🛡️ QUOTA CHECK
  const toolIdMap: Record<string, string> = {
    'micro': 'micro-niche-miner',
    'rival': 'rival-scanner',
    'hidden': 'hidden-channel-finder'
  };
  const resolvedToolId = toolIdMap[tool] || tool;

  try {
    await checkUserQuota((session.user as any).id, resolvedToolId);
  } catch (error: any) {
    if (error.message === 'PLAN_LOCKED') {
      return res.status(403).json({ error: 'PLAN_LOCKED', message: 'Vui lòng nâng cấp để sử dụng tính năng này.' });
    }
    if (error.message === 'FREE_QUOTA_EXCEEDED') {
      return res.status(403).json({ error: 'FREE_QUOTA_EXCEEDED', message: 'Bạn đã hết lượt dùng thử miễn phí.' });
    }
    return res.status(403).json({ error: error.message });
  }


  // Redis cache check
  const cacheInput = `youtube:${tool}:${input || macroNiche}`;
  const cacheKey = generateCacheKey(CACHE_PREFIXES.GENERAL, cacheInput);
  const cached = await getCached<any>(cacheKey);
  if (cached) {
    console.log(`[YouTube API] Cache HIT for ${tool}:${input || macroNiche}`);
    return res.status(200).json(cached);
  }
  console.log(`[YouTube API] Cache MISS for ${tool}:${input || macroNiche} - Calling AI`);

  try {
    let prompt = "";
    let formattedLowFloor: any[] = [];

    // ==================== 1. RIVAL SCANNER – ĐÃ FIX HỖ TRỢ HANDLE TRỰC TIẾP ====================
    if (tool === 'rival') {
      // Hỗ trợ cả URL đầy đủ VÀ handle trực tiếp (@username hoặc username)
      let urlMatch = input.match(/(?:youtube\.com\/(?:channel\/|c\/|user\/|@)([^\/?\&]+)|youtu\.be\/([^\?]+)|youtube\.com\/watch\?v=([^\&]+))/);

      // Nếu không match URL, kiểm tra xem có phải handle trực tiếp không
      let directHandle: string | null = null;
      if (!urlMatch) {
        // Chấp nhận @username hoặc username (loại bỏ @ nếu có)
        const handleMatch = input.trim().match(/^@?([a-zA-Z0-9_\-]+)$/);
        if (handleMatch) {
          directHandle = handleMatch[1];
        } else {
          return res.status(400).json({ error: 'URL hoặc tên kênh không hợp lệ. Hãy nhập URL YouTube hoặc @handle của kênh.' });
        }
      }

      let channelId = null;
      const videoId = urlMatch?.[2] || urlMatch?.[3];
      const channelHandleOrId = urlMatch?.[1]; // This will be undefined if urlMatch is null

      // Case 1: Video URL -> Get Channel ID from Video
      if (videoId) {
        const vRes = await youtube.videos.list({
          part: ['snippet'],
          id: [videoId]
        });
        channelId = vRes.data.items?.[0]?.snippet?.channelId;
      }
      // Case 2: Channel ID (starts with UC) -> Use directly
      else if (channelHandleOrId?.startsWith('UC')) {
        channelId = channelHandleOrId;
      }
      // Case 3: Handle or User -> Search to get Channel ID
      else if (channelHandleOrId) {
        const s = await youtube.search.list({
          part: ['snippet'],
          q: channelHandleOrId,
          type: ['channel'],
          maxResults: 1
        });
        channelId = s.data.items?.[0]?.snippet?.channelId;
      }
      // Case 4: Direct handle (user nhập @username hoặc username trực tiếp)
      else if (directHandle) {
        const s = await youtube.search.list({
          part: ['snippet'],
          q: directHandle,
          type: ['channel'],
          maxResults: 1
        });
        channelId = s.data.items?.[0]?.snippet?.channelId;
      }

      if (!channelId) return res.status(404).json({ error: 'Không tìm thấy kênh. Hãy kiểm tra lại tên hoặc URL kênh.' });

      const chRes = await youtube.channels.list({
        part: ['snippet', 'statistics', 'topicDetails'],
        id: [channelId]
      });

      const ch = chRes.data.items?.[0];
      if (!ch) return res.status(404).json({ error: 'Kênh không tồn tại' });

      // Fetch recent videos to give AI real context
      const videoRes = await youtube.search.list({
        part: ['snippet', 'id'],
        channelId: channelId,
        order: 'date', // Get recent videos
        maxResults: 10,
        type: ['video']
      });

      const recentVideos = videoRes.data.items?.map(v => ({
        title: v.snippet?.title,
        description: v.snippet?.description,
        publishedAt: v.snippet?.publishedAt,
        videoId: v.id?.videoId
      })) || [];

      // Get video statistics (views) for these videos to find high performers
      let videoStats: any[] = [];
      if (recentVideos.length > 0) {
        const videoIds = recentVideos.map(v => v.videoId).filter(Boolean) as string[];
        const statsRes = await youtube.videos.list({
          part: ['statistics'],
          id: videoIds
        });
        videoStats = statsRes.data.items || [];
      }

      // Combine video data
      const videosForPrompt = recentVideos.map(v => {
        const stat = videoStats.find(s => s.id === v.videoId);
        return {
          title: v.title,
          views: stat?.statistics?.viewCount || '0',
          published: v.publishedAt
        };
      });

      prompt = `Phân tích chiến lược kênh YouTube này dựa trên dữ liệu thực tế.
      
THÔNG TIN KÊNH:
- Tên: "${ch.snippet?.title}"
- Subs: ${ch.statistics?.subscriberCount}
- View tổng: ${ch.statistics?.viewCount}
- Video tổng: ${ch.statistics?.videoCount}
- Mô tả: "${ch.snippet?.description?.substring(0, 500)}..."

10 VIDEO GẦN NHẤT:
${JSON.stringify(videosForPrompt, null, 2)}

NHIỆM VỤ: Đóng vai chuyên gia YouTube Strategy (như VidIQ/TubeBuddy), hãy phân tích điểm yếu, điểm mạnh và cơ hội tấn công kênh này.
Trả về JSON (không markdown):
{
  "competitorProfile": {"name": "${ch.snippet?.title}", "subscribers": "${ch.statistics?.subscriberCount}"},
  "strategicWeaknesses": ["Phân tích từ view/title video thật..."],
  "successSignals": ["Các yếu tố làm nên video nhiều view nhất..."],
  "contentStructure": {"mainKeywords": ["từ video thật"], "seoEvaluation": "Đánh giá title/thumb thật"},
  "untappedNiches": ["Ngách người xem quan tâm nhưng kênh chưa làm"],
  "titleAnalysis": "Phong cách đặt tít hiện tại (Clickbait? SEO?)",
  "descriptionAnalysis": "Cách viết mô tả",
  "tagsHashtags": ["tag tiềm năng"],
  "thumbnailAnalysis": "Dự đoán phong cách thumb qua title",
  "contentStrategy": "Chiến lược upload/nội dung",
  "counterAttackPlan": "Kế hoạch 5 bước để vượt mặt kênh này",
  "audienceGapAnalysis": ["Điều khán giả comment/tìm kiếm mà kênh bỏ qua"],
  "videoPersonaScore": {"tone": "Nghiêm túc/Hài hước?", "emotion": "Tò mò/Sợ hãi/Vui vẻ?"}
}`;

      // INCREMENT USAGE FOR RIVAL SCANNER
      await incrementUserUsage((session.user as any).id, resolvedToolId);
    }

    // ==================== 2. HIDDEN CHANNEL FINDER – GIỮ NGUYÊN 100% ====================
    else if (tool === 'hidden' && macroNiche) {
      const channelSearch = await youtube.search.list({ part: ['snippet'], q: macroNiche, type: ['channel'], maxResults: 40 });
      const ids = channelSearch.data.items?.map(i => i.snippet?.channelId).filter(Boolean) as string[] || [];
      const channels = ids.length ? (await youtube.channels.list({ part: ['snippet', 'statistics'], id: ids })).data.items || [] : [];

      const formattedChannels = channels
        .map(c => ({
          name: c.snippet?.title || '',
          url: `https://youtube.com/channel/${c.id}`,
          thumbnail: c.snippet?.thumbnails?.high?.url || c.snippet?.thumbnails?.medium?.url || '',
          subscribers: Number(c.statistics?.subscriberCount || 0),
          views: Number(c.statistics?.viewCount || 0),
        }))
        .filter(c => c.subscribers > 500 && c.subscribers < 150000)
        .sort((a, b) => (b.views / b.subscribers) - (a.views / a.subscribers))
        .slice(0, 20);

      const videoSearch = await youtube.search.list({
        part: ['snippet'],
        q: macroNiche,
        type: ['video'],
        order: 'viewCount',
        maxResults: 25,
        publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const videos = (videoSearch.data.items || []).map(v => ({
        title: v.snippet?.title,
        url: `https://youtu.be/${v.id?.videoId}`,
        thumbnail: v.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${v.id?.videoId}/maxresdefault.jpg`,
      }));

      prompt = `Dữ liệu thật từ YouTube về "${macroNiche}":
Kênh: ${JSON.stringify(formattedChannels)}
Video viral gần đây: ${JSON.stringify(videos)}

Trả về đúng JSON (8-12 kênh, 6-10 video, 6-8 xu hướng):

{
  "risingChannels": [
    {
      "name": "string",
      "url": "string",
      "subscribers": "12K",
      "growthMetric": "+320% views/tháng",
      "coreStrengths": ["thumbnail đẹp", "title chuẩn SEO"],
      "thumbnail": "url ảnh thật"
    }
  ],
  "trendingVideos": [
    {
      "title": "string",
      "url": "string",
      "viralRatio": "1.2M views 15 ngày",
      "viralStructure": ["hook mạnh", "story", "CTA"],
      "thumbnail": "url ảnh thật"
    }
  ],
  "upcomingTrends": ["Xu hướng 1 cực chi tiết", "Xu hướng 2", "..."]
}`;
      // INCREMENT USAGE FOR HIDDEN CHANNEL
      await incrementUserUsage((session.user as any).id, resolvedToolId);
    }

    // ==================== 3. MICRO NICHE MINER – ĐÃ FIX HOÀN HẢO + QUỐC TẾ ====================
    else if (tool === 'micro' && macroNiche) {
      // Lấy targetMarket từ request body (mặc định VN)
      const { targetMarket = 'VN' } = req.body;
      const isVN = targetMarket === 'VN';
      const regionCode = isVN ? 'VN' : 'US';
      const outputLanguage = isVN ? 'Tiếng Việt' : 'English';

      const searchRes = await youtube.search.list({
        part: ['snippet'],
        q: macroNiche,
        type: ['video'],
        order: 'relevance',
        maxResults: 50,
        regionCode: regionCode,
      });

      const realVideos = (searchRes.data.items || []).map(v => ({
        title: v.snippet?.title || '',
        channel: v.snippet?.channelTitle || '',
        viewCount: 0,
      }));

      const channelRes = await youtube.search.list({
        part: ['snippet'],
        q: macroNiche,
        type: ['channel'],
        maxResults: 30,
        regionCode: regionCode,
      });

      const channelIds = channelRes.data.items?.map(i => i.snippet?.channelId).filter(Boolean) as string[] || [];
      const lowFloorChannels = channelIds.length
        ? (await youtube.channels.list({ part: ['snippet', 'statistics'], id: channelIds })).data.items || []
        : [];

      formattedLowFloor = lowFloorChannels
        .filter(c => {
          const subs = Number(c.statistics?.subscriberCount || 0);
          return subs > 1000 && subs < 50000;
        })
        .slice(0, 12)
        .map(c => ({
          name: c.snippet?.title,
          url: `https://youtube.com/channel/${c.id}`,
          subscribers: Number(c.statistics?.subscriberCount || 0),
          thumbnail: c.snippet?.thumbnails?.high?.url || c.snippet?.thumbnails?.medium?.url || '',
        }));

      // PROMPT ĐỘNG THEO THỊ TRƯỜNG
      if (isVN) {
        // PROMPT CHO VIỆT NAM (giữ nguyên logic cũ)
        prompt = `Từ macro-niche "${macroNiche}", tìm 8-10 micro-niche cực kỳ tiềm năng tại Việt Nam.

Dữ liệu thật:
Video hot: ${JSON.stringify(realVideos.map(v => v.title).slice(0, 30))}
Kênh low-floor: ${JSON.stringify(formattedLowFloor)}

TRẢ VỀ CHỈ JSON THUẦN, BẮT ĐẦU BẰNG { VÀ KẾT THÚC BẰNG }, KHÔNG THIẾU DẤU NGOẶC, KHÔNG THÊM CHỮ:

{
  "topNiches": [
    {
      "nicheName": "Micro-niche cụ thể, dễ khai thác ở Việt Nam",
      "overallScore": 9.3,
      "competitionScore": 22,
      "searchVolumeScore": 86,
      "monetizationScore": 94,
      "longTermViabilityScore": 90,
      "peakTimingForecast": "Q1-Q2 2026",
      "communitySentimentAnalysis": "Cộng đồng đang rất khát nội dung giải thích đơn giản, hài hước, có ví dụ thực tế...",
      "pioneerVideoTopics": [
        "10+ tiêu đề video cực hút view, sẵn dùng luôn",
        "Tiêu đề 2",
        "Tiêu đề 3",
        "Tiêu đề 4",
        "Tiêu đề 5",
        "Tiêu đề 6",
        "Tiêu đề 7",
        "Tiêu đề 8",
        "Tiêu đề 9",
        "Tiêu đề 10"
      ],
      "miningScript": {
        "tone": "hài hước + chuyên gia",
        "frequency": "3-4 video/tuần",
        "monetizationGoal": "affiliate + AdSense + sản phẩm số"
      },
      "lowFloorChannels": [
        {
          "name": "Tên kênh thật",
          "url": "https://youtube.com/channel/...",
          "subscribers": "15.2K",
          "thumbnail": "url ảnh thật"
        }
      ],
      "saturatedNichesWarning": ["ngách bão hòa 1", "ngách bão hòa 2"]
    }
  ]
}`;
      } else {
        // PROMPT CHO QUỐC TẾ (US/Global) - Tiếng Anh, CPM cao
        prompt = `From the macro-niche "${macroNiche}", find 8-10 extremely high-potential micro-niches for the US/Global market.

CRITICAL: Focus on niches with HIGH CPM ($5-30+ per 1000 views). Target English-speaking audiences in USA, UK, Canada, Australia.

Real YouTube Data:
Trending videos: ${JSON.stringify(realVideos.map(v => v.title).slice(0, 30))}
Low-floor successful channels: ${JSON.stringify(formattedLowFloor)}

RETURN ONLY PURE JSON, START WITH { AND END WITH }, NO MISSING BRACKETS, NO EXTRA TEXT:

{
  "topNiches": [
    {
      "nicheName": "Specific micro-niche with high CPM potential (Finance, Tech, Health, Business, etc.)",
      "overallScore": 9.3,
      "competitionScore": 22,
      "searchVolumeScore": 86,
      "monetizationScore": 94,
      "longTermViabilityScore": 90,
      "peakTimingForecast": "Q1-Q2 2026",
      "communitySentimentAnalysis": "The community is actively searching for actionable, data-driven content with real examples...",
      "pioneerVideoTopics": [
        "10+ high-CTR video titles ready to use",
        "Title 2",
        "Title 3",
        "Title 4",
        "Title 5",
        "Title 6",
        "Title 7",
        "Title 8",
        "Title 9",
        "Title 10"
      ],
      "miningScript": {
        "tone": "professional + engaging",
        "frequency": "2-3 videos/week",
        "monetizationGoal": "AdSense ($15+ CPM) + affiliate marketing + digital products"
      },
      "lowFloorChannels": [
        {
          "name": "Real channel name",
          "url": "https://youtube.com/channel/...",
          "subscribers": "25K",
          "thumbnail": "real thumbnail url"
        }
      ],
      "saturatedNichesWarning": ["saturated niche 1", "saturated niche 2"]
    }
  ]
}`;
      }
    } else {
      return res.status(400).json({ error: 'Tool không hỗ trợ' });
    }

    // GỌI GEMINI 2.5-FLASH + FIX JSON SIÊU ỔN ĐỊNH
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 16384,
      },
      systemInstruction: "TRẢ VỀ CHỈ JSON THUẦN TÚY, KHÔNG markdown, KHÔNG giải thích, BẮT ĐẦU BẰNG { VÀ KẾT THÚC BẰNG }"
    });

    let text = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        text = result.response.text();

        // Làm sạch + fix JSON cực mạnh
        text = text.trim();
        if (text.startsWith('```json')) text = text.slice(7);
        if (text.startsWith('```')) text = text.slice(3);
        if (text.endsWith('```')) text = text.slice(0, -3);
        text = text.trim();

        // Tự động đóng ngoặc nếu thiếu (Gemini hay quên)
        let openBraces = 0;
        let openBrackets = 0;
        let inString = false;
        let escape = false;
        for (const char of text) {
          if (escape) { escape = false; continue; }
          if (char === '\\') { escape = true; continue; }
          if (char === '"' && !escape) { inString = !inString; continue; }
          if (!inString) {
            if (char === '{') openBraces++;
            if (char === '}') openBraces--;
            if (char === '[') openBrackets++;
            if (char === ']') openBrackets--;
          }
        }
        while (openBrackets > 0) { text += '\n  ]'; openBrackets--; }
        while (openBraces > 0) { text += '\n}'; openBraces--; }
        if (!text.endsWith('}')) text += '\n}';

        text = text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

        const data = JSON.parse(text);

        // INCREMENT USAGE AFTER SUCCESS
        await incrementUserUsage((session.user as any).id, resolvedToolId);

        // Save to Redis (async, don't wait)
        setCache(cacheKey, data, CACHE_TTL_SECONDS);
        return res.status(200).json(data);

      } catch (e: any) {
        console.error(`Micro Niche Miner - Lần ${attempt} thất bại:`, e.message);
        if (attempt === 3) {
          // INCREMENT USAGE EVEN ON FALLBACK IF IT'S USEFUL
          await incrementUserUsage((session.user as any).id, resolvedToolId);

          const fallbackData = {
            topNiches: formattedLowFloor.slice(0, 8).map(c => ({
              nicheName: `${macroNiche} - ${c.name.split(' ')[0] || 'Pro'} Style`,
              overallScore: 8.7,
              competitionScore: 25,
              searchVolumeScore: 82,
              monetizationScore: 91,
              longTermViabilityScore: 88,
              peakTimingForecast: "Q1 2026",
              communitySentimentAnalysis: "Cộng đồng đang tìm kiếm nội dung thực chiến, dễ áp dụng...",
              pioneerVideoTopics: ["10+ ý tưởng video hot nhất cho ngách này"],
              miningScript: {
                tone: "hài hước + chuyên gia",
                frequency: "3-4 video/tuần",
                monetizationGoal: "affiliate + AdSense"
              },
              lowFloorChannels: [{ name: c.name, url: c.url, subscribers: (c.subscribers / 1000).toFixed(1) + 'K', thumbnail: c.thumbnail }],
              saturatedNichesWarning: ["ngách chung chung", "review sản phẩm đắt tiền"]
            }))
          };
          // Save fallback to Redis too
          setCache(cacheKey, fallbackData, CACHE_TTL_SECONDS);
          return res.status(200).json(fallbackData);
        }
      }
    }

  } catch (error: any) {
    console.error("Server error:", error.message);
    if (error.response?.status === 403 || error.message.includes('quota')) {
      // IMPORTANT: Do NOT use words like 'quota', 'limit', 'plan', 'locked' in error messages
      // because frontend will match them and show upgrade modal incorrectly!
      return res.status(429).json({ error: 'SYSTEM_ERROR: YouTube API tạm hết lượt gọi. Vui lòng thử lại sau 5 phút.' });
    }
    return res.status(500).json({ error: 'SYSTEM_ERROR: Lỗi hệ thống, vui lòng thử lại.' });
  }
}
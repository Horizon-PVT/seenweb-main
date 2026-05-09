// pages/api/youtube/recommend.ts
// Phase 1: AI-powered content recommendation engine
// Recommends video ideas based on channel data and competitor analysis

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

interface RecommendRequest {
  channelId: string;
  channelTitle?: string;
  niche?: string;
  targetAudience?: string;
  count?: number; // default 5
}

interface RecommendedVideo {
  title: string;
  hook: string;
  reason: string;
  estimatedViews: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  keywords: string[];
  competitors?: string[]; // channels that have done this topic
  contentAngle: string;
  format: string; // Tutorial, Review, Listicle, etc.
}

interface RecommendationResult {
  channelId: string;
  channelTitle: string;
  recommendations: RecommendedVideo[];
  nicheAnalysis: {
    currentNiche: string;
    opportunity: number; // 0-100
    competition: 'Low' | 'Medium' | 'High';
    trend: 'Rising' | 'Stable' | 'Declining';
  };
  competitorGaps: {
    topic: string;
    reason: string;
    potential: number;
  }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { channelId, channelTitle, niche, targetAudience, count = 5 } = req.body as RecommendRequest;

  if (!channelId) {
    return res.status(400).json({ error: 'Missing channelId' });
  }

  // Verify channel ownership
  const channel = await prisma.youTubeChannel.findFirst({
    where: { channelId, userId: session.user.id },
  });

  if (!channel) {
    return res.status(403).json({ error: 'Channel not found or unauthorized' });
  }

  // Prefer channelTitle from request body (most up-to-date) over DB
  const effectiveChannelTitle = channelTitle || channel.title || 'Kênh của bạn';

  const apiKey = process.env.GEMINI_API_KEY;
  const youtubeKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || !youtubeKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const youtube = google.youtube({ version: 'v3', auth: youtubeKey });

    // 1. Get channel's recent top videos to understand content pattern
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      channelId: channelId,
      type: ['video'],
      order: 'viewCount',
      maxResults: 20,
    });

    const videoIds = searchResponse.data.items
      ?.map(item => item.id?.videoId)
      .filter(Boolean) as string[];

    // 2. Get video details (views, engagement)
    const videoDetails: { id: string; title: string; views: number; likes: number }[] = [];
    if (videoIds.length > 0) {
      const detailsResponse = await youtube.videos.list({
        part: ['statistics', 'snippet'],
        id: videoIds.slice(0, 10),
      });

      detailsResponse.data.items?.forEach(item => {
        videoDetails.push({
          id: item.id!,
          title: item.snippet?.title || '',
          views: parseInt(item.statistics?.viewCount || '0'),
          likes: parseInt(item.statistics?.likeCount || '0'),
        });
      });
    }

    // 3. Get top-performing videos by engagement
    const topVideos = videoDetails
      .filter(v => v.views > 0)
      .sort((a, b) => {
        const engA = a.likes / a.views;
        const engB = b.likes / b.views;
        return engB - engA;
      })
      .slice(0, 5);

    // 4. Search for trending topics in the channel's niche
    const topVideoKeywords = topVideos
      .map(v => extractMainKeyword(v.title))
      .filter(Boolean);

    const searchQueries = topVideoKeywords.slice(0, 3).map(
      kw => `${kw} trending 2025`
    );

    // 5. Use Gemini to generate recommendations
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
Bạn là chuyên gia phân tích YouTube. Phân tích kênh "${effectiveChannelTitle}" và đưa ra gợi ý video.

THÔNG TIN KÊNH:
- Tên kênh: ${effectiveChannelTitle}
- ${channel.subCount.toLocaleString()} subscribers
- Video hiệu quả nhất: ${topVideos.slice(0, 3).map(v => `"${v.title}" (${(v.views / 1000).toFixed(0)}K views)`).join(', ')}

NGÁCH HIỆN TẠI: ${niche || 'Tự động phát hiện từ nội dung kênh'}
ĐỐI TƯỢNG: ${targetAudience || 'Người xem YouTube tiếng Việt'}

NHIỆM VỤ:
1. Phân tích ngách hiện tại của kênh
2. Đề xuất ${count} video ideas có tiềm năng cao dựa trên:
   - Xu hướng trending
   - Content gaps (những gì đối thủ chưa làm hoặc làm yếu)
   - Điểm mạnh đã được chứng minh của kênh
3. Với mỗi video idea, cung cấp:
   - Tiêu đề hấp dẫn
   - Hook trong 5 giây đầu
   - Lý do tại sao video này sẽ thành công
   - Từ khóa SEO
   - Format phù hợp (Tutorial/Review/Listicle/etc.)
   - Độ khó (Easy/Medium/Hard) dựa trên nguồn lực cần thiết
   - Ước tính views (thấp/trung bình/cao)

4. Tìm 3 content gaps - những chủ đề trong ngách mà:
   - Có lượng tìm kiếm cao
   - Ít người làm
   - Phù hợp với phong cách kênh

Trả lời bằng tiếng Việt, format JSON như sau:
{
  "recommendations": [
    {
      "title": "string",
      "hook": "string",
      "reason": "string", 
      "estimatedViews": "string",
      "difficulty": "Easy|Medium|Hard",
      "keywords": ["string"],
      "contentAngle": "string",
      "format": "string"
    }
  ],
  "nicheAnalysis": {
    "currentNiche": "string",
    "opportunity": number,
    "competition": "Low|Medium|High",
    "trend": "Rising|Stable|Declining"
  },
  "competitorGaps": [
    {
      "topic": "string",
      "reason": "string",
      "potential": number
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsed: Partial<RecommendationResult>;

    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        parsed = generateFallbackRecommendations(effectiveChannelTitle);
      }
    } else {
      parsed = generateFallbackRecommendations(effectiveChannelTitle);
    }

    const finalResult: RecommendationResult = {
      channelId,
      channelTitle: effectiveChannelTitle,
      recommendations: parsed.recommendations || generateFallbackRecommendations(effectiveChannelTitle).recommendations,
      nicheAnalysis: parsed.nicheAnalysis || { currentNiche: niche || 'General', opportunity: 70, competition: 'Medium', trend: 'Rising' },
      competitorGaps: parsed.competitorGaps || [],
    };

    return res.status(200).json(finalResult);
  } catch (error: any) {
    console.error('[youtube/recommend] Error:', error);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}

function extractMainKeyword(title: string): string {
  const stopWords = ['cách', 'làm', 'với', 'cho', 'và', 'hay', 'nhất', 'top', '2024', '2025', 'review', 'hướng dẫn'];
  const words = title
    .toLowerCase()
    .replace(/[^a-zA-ZÀ-ỹ\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.includes(w));
  return words.slice(0, 2).join(' ') || title.split(' ')[0];
}

function generateFallbackRecommendations(channelName: string, niche?: string): RecommendationResult {
  return {
    channelId: '',
    channelTitle: channelName,
    recommendations: [
      {
        title: `Top 5 Tips Tăng View X100 Cho Kênh ${channelName}`,
        hook: 'Bạn đang làm video nhưng không ai xem?',
        reason: 'Hook question + promise + urgency luôn có tỷ lệ CTR cao',
        estimatedViews: '50K - 200K',
        difficulty: 'Easy',
        keywords: ['tăng view youtube', 'seo youtube', 'thuật toán youtube'],
        contentAngle: 'Share personal journey + actionable tips',
        format: 'Tutorial',
      },
      {
        title: `So Sánh: Tool Tốt Nhất Cho YouTuber [2025]`,
        hook: 'Đây là tool mà 90% YouTuber thành công đều dùng...',
        reason: 'Comparison + year-based keywords = evergreen traffic',
        estimatedViews: '30K - 150K',
        difficulty: 'Medium',
        keywords: ['so sánh youtube tools', 'tool youtube', 'youtube tool 2025'],
        contentAngle: 'Deep comparison with real data',
        format: 'Comparison/Review',
      },
      {
        title: `Cách Tôi Đạt ${Math.floor(Math.random() * 50 + 10)}K Subcribers Trong 3 Tháng`,
        hook: `Shocking statement: ${Math.floor(Math.random() * 50 + 10)}K subscribers trong 3 tháng...`,
        reason: 'Specific numbers + journey/case study format = viral potential',
        estimatedViews: '100K - 500K',
        difficulty: 'Medium',
        keywords: ['tăng subcribers', 'case study youtube', 'growth hacking'],
        contentAngle: 'Storytelling + specific tactics',
        format: 'Case Study',
      },
      {
        title: `Những Sai Lầm Nguy Hiểm Khi Làm YouTube (99% Người Mới Mắc)`,
        hook: 'Warning: Bạn đang tự phá hủy kênh của mình',
        reason: 'Fear + curiosity gap = high click rate',
        estimatedViews: '40K - 200K',
        difficulty: 'Easy',
        keywords: ['sai lầm youtube', 'mẹo youtube', 'beginner mistakes'],
        contentAngle: 'Educational with strong examples',
        format: 'Listicle',
      },
      {
        title: `${niche || 'Nội dung'} Xu Hướng: Đây Là Điều Sẽ Bùng Nổ Trong 2025`,
        hook: 'Xu hướng này sẽ thay đổi hoàn toàn cách bạn làm content...',
        reason: 'Trend prediction + FOMO = shareability',
        estimatedViews: '60K - 300K',
        difficulty: 'Medium',
        keywords: ['xu hướng youtube 2025', 'youtube trends', 'content trends'],
        contentAngle: 'Data-driven trend analysis',
        format: 'Trend Analysis',
      },
    ],
    nicheAnalysis: {
      currentNiche: niche || 'General YouTube',
      opportunity: 75,
      competition: 'Medium',
      trend: 'Rising',
    },
    competitorGaps: [
      {
        topic: 'Shorts + Long video cross-optimization',
        reason: 'Ít người làm nhưng algorithm ưu tiên',
        potential: 85,
      },
      {
        topic: 'Niche-specific SEO optimization',
        reason: 'Content thường thiếu deep SEO',
        potential: 70,
      },
      {
        topic: 'Community engagement strategies',
        reason: 'Posting frequency cao nhưng engagement thấp',
        potential: 65,
      },
    ],
  };
}

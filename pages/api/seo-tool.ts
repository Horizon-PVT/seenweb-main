// pages/api/seo-tool.ts - Enhanced với YouTube Data API
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from "@google/genai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { checkUserQuota, incrementUserUsage } from "@/lib/quota";
import {
  searchVideos,
  analyzeTopVideos,
  extractMainKeyword,
  generateOptimizedTitle,
  compareDescriptions,
  categorizeTags,
  classifyThumbnailAngle,
  assessTopicDifficulty,
  type VideoAnalysis,
  type OptimizedTitle,
  type CategorizedTags,
  type ThumbnailAngle,
  type TopicDifficulty,
} from "@/lib/youtube-api";

// Simple Schema - Only 5 core features for reliable responses
const seoSchema = {
  type: Type.OBJECT,
  properties: {
    performanceScore: {
      type: Type.OBJECT,
      properties: {
        overall: { type: Type.NUMBER },
        keywordRepetition: { type: Type.NUMBER },
        highVolumeTags: { type: Type.NUMBER },
        rankingTags: { type: Type.NUMBER }
      }
    },
    titles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          score: { type: Type.NUMBER }
        }
      }
    },
    description: {
      type: Type.OBJECT,
      properties: {
        mainHashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        body: { type: Type.STRING },
        secondaryHashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    tags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          strength: { type: Type.STRING }
        }
      }
    },
    thumbnailIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          concept: { type: Type.STRING },
          aiPrompt: { type: Type.STRING },
          emotion: { type: Type.STRING },
          colors: { type: Type.STRING },
          thumbnailText: { type: Type.STRING }
        }
      }
    },
    uploadTimeOptimizer: {
      type: Type.OBJECT,
      properties: {
        audienceTimezone: { type: Type.STRING },
        bestTimes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              time: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    }
  }
};

// Enhanced output interface
interface OutputData {
  performanceScore?: {
    overall: number;
    keywordRepetition: number;
    highVolumeTags: number;
    rankingTags: number;
  };
  titles?: {
    text: string;
    score: number;
    keywords: string[];
  }[];
  description?: {
    mainHashtags: string[];
    body: string;
    secondaryHashtags: string[];
  };
  tags?: {
    text: string;
    strength: 'Good' | 'Balanced';
  }[];
  thumbnailIdeas?: {
    concept: string;
    emotion: string;
    colors: string;
    facialExpression: string;
    objects: string;
    thumbnailText: string;
    fontSuggestion: string;
    composition: string;
  }[];

  // NEW FIELDS - Advanced SEO Features
  hookVariations?: {
    type: string;
    script: string;
    openingLine: string;
    retentionTechnique: string;
    estimatedRetention: number;
  }[];
  ctrPrediction?: {
    overallScore: number;
    titleScore: number;
    thumbnailScore: number;
    emotionalPull: string;
    improvements: string[];
    competitorBenchmark: string;
  };
  uploadTimeOptimizer?: {
    bestTimes: {
      day: string;
      time: string;
      reason: string;
      competitionLevel: string;
    }[];
    avoidTimes: string[];
    audienceTimezone: string;
  };
  shortsSuggestions?: {
    clipTitle: string;
    hookMoment: string;
    suggestedDuration: string;
    viralPotential: number;
    caption: string;
    crossPlatform: string[];
  }[];
  competitorInsights?: {
    avgViews: string;
    commonPattern: string;
    contentGap: string;
    difficultyLevel: string;
    recommendation: string;
  };

  // Existing enhanced fields
  titleOptimized?: OptimizedTitle;
  descriptionEnhanced?: {
    firstTwoLines: string;
    keywordMapping: {
      keyword: string;
      position: string;
    }[];
    competitorComparison: string;
    differentiation: string;
  };
  tagsEnhanced?: CategorizedTags;
  thumbnailsEnhanced?: {
    angle: ThumbnailAngle;
    competitorAngle: string;
    differentiation: string;
    checklist: {
      textLength: boolean;
      singleMessage: boolean;
      clearEmotion: boolean;
    };
  }[];
  seoRealityCheck?: {
    topicDifficulty: TopicDifficulty;
    difficultyExplanation: string;
    recommendations: string[];
    prePublishChecklist: {
      item: string;
      status: boolean;
      suggestion: string;
    }[];
  };
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OutputData | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 1. Auth & Quota Check
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: "Bạn cần đăng nhập để sử dụng tính năng này." });
  }

  try {
    await checkUserQuota(session.user.id);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }

  try {
    const { coreIdea, useGrounding, targetAudience, seoGoal } = req.body;
    if (!coreIdea || !targetAudience || !seoGoal) {
      return res.status(400).json({ error: "Thiếu coreIdea, targetAudience, hoặc seoGoal." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY chưa được đặt");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // === STEP 1: Generate SEO content - SIMPLE 5 FEATURES ONLY ===
    const prompt = `Bạn là chuyên gia SEO YouTube. Tạo gói SEO với 5 phần sau:

**THÔNG TIN VIDEO**:
- Chủ đề: "${coreIdea}"
- Đối tượng: "${targetAudience}"
- Mục tiêu: "${seoGoal}"

**YÊU CẦU**:

1. **performanceScore**: 
   - overall: 95
   - keywordRepetition: 5
   - highVolumeTags: 5
   - rankingTags: 5

2. **titles** (3 tiêu đề):
   - text: Tiêu đề dưới 65 ký tự, có 2 hashtags cuối
   - score: 90-100

3. **description**:
   - mainHashtags: 5 hashtags
   - body: Mô tả 200+ từ, có emojis, 4 đoạn văn, dùng \\n để xuống dòng
   - secondaryHashtags: 10 hashtags

4. **tags** (25 tags):
   - text: từ khóa
   - strength: "Good" hoặc "Balanced"

5. **thumbnailIdeas** (3 concepts):
   - concept: Mô tả ý tưởng thumbnail bằng tiếng Việt (20+ từ)
   - aiPrompt: ENGLISH prompt for AI image generation (50+ words). Include: subject (person/object), pose, expression, background, lighting, camera angle, style. Format for Midjourney/DALL-E.
   - emotion: Cảm xúc (Curiosity/Shock/Excitement)
   - colors: Main colors (e.g., "red, yellow, dark blue")
   - thumbnailText: Text trên thumbnail (2-4 từ)

6. **uploadTimeOptimizer**:
   - audienceTimezone: "Việt Nam GMT+7"
   - bestTimes: 3 thời điểm tối ưu (day, time, reason)

**OUTPUT**: Chỉ JSON, không markdown.`;

    const ai = new GoogleGenAI({ apiKey });

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: useGrounding ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
        responseSchema: seoSchema,
      },
    });

    // === STEP 2: Fetch YouTube data ===
    let youtubeAnalysis: VideoAnalysis | null = null;
    let competitorVideos: any[] = [];
    const mainKeyword = extractMainKeyword(coreIdea);

    try {
      const videos = await searchVideos(mainKeyword, 5);
      competitorVideos = videos;
      youtubeAnalysis = await analyzeTopVideos(videos);
    } catch (error) {
      console.error('YouTube API Error (non-blocking):', (error as Error).message);
    }

    // Parse AI output
    let jsonString = aiResponse.text?.trim() || "{}";

    // Remove markdown code blocks if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```/, '').replace(/```$/, '');
    }
    jsonString = jsonString.trim();

    let parsedOutput: OutputData;
    try {
      parsedOutput = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", jsonString.substring(0, 500));
      throw new Error(`AI response is not valid JSON.`);
    }

    // === STEP 3: Enhance with YouTube data ===
    if (youtubeAnalysis && parsedOutput.titles && parsedOutput.titles.length > 0) {
      // Title optimization
      parsedOutput.titleOptimized = generateOptimizedTitle(
        parsedOutput.titles.map(t => t.text),
        youtubeAnalysis,
        mainKeyword
      );

      // Description enhancement
      const descBody = parsedOutput.description?.body || '';
      const lines = descBody.split('\n').filter(l => l.trim());
      const firstTwoLines = lines.slice(0, 2).join('\n');

      // Extract keywords from description
      const keywords = [mainKeyword, ...(parsedOutput.titles[0]?.keywords || [])];
      const keywordMapping = keywords.slice(0, 5).map(kw => {
        const pos = descBody.toLowerCase().indexOf(kw.toLowerCase());
        if (pos === -1) return { keyword: kw, position: 'Không có' };
        const charPos = pos;
        if (charPos < 200) return { keyword: kw, position: '200 ký tự đầu' };
        if (charPos < 400) return { keyword: kw, position: 'Đoạn giữa' };
        return { keyword: kw, position: 'Cuối description' };
      });

      // Compare with competitors
      const competitorDescs = competitorVideos.map(v => v.snippet?.description || '');
      const comparison = compareDescriptions(descBody, competitorDescs);

      parsedOutput.descriptionEnhanced = {
        firstTwoLines,
        keywordMapping,
        competitorComparison: comparison.first200Comparison,
        differentiation: comparison.suggestedDifferentiation,
      };

      // Tags categorization
      const allTags = parsedOutput.tags?.map(t => t.text) || [];
      const competitorTags = competitorVideos.map(v => {
        // YouTube API doesn't return tags in snippet, but we can extract from title/description
        const title = v.snippet?.title || '';
        return title.split(/\s+/).filter((w: string) => w.length > 3);
      });
      parsedOutput.tagsEnhanced = categorizeTags(allTags, competitorTags);

      // Thumbnail enhancement
      if (parsedOutput.thumbnailIdeas) {
        parsedOutput.thumbnailsEnhanced = parsedOutput.thumbnailIdeas.map((thumb, i) => {
          const angle = classifyThumbnailAngle(thumb.thumbnailText, thumb.concept);

          // Determine competitor dominant angle
          const competitorAngle = youtubeAnalysis!.titlePatterns.curiosity > youtubeAnalysis!.titlePatterns.result
            ? 'curiosity'
            : 'result';

          const differentiation = angle !== competitorAngle
            ? `✅ Angle "${angle}" khác với đối thủ (đang dùng "${competitorAngle}")`
            : `⚠️ Cùng angle với đối thủ, cân nhắc thử angle khác`;

          return {
            angle,
            competitorAngle,
            differentiation,
            checklist: {
              textLength: thumb.thumbnailText.split(/\s+/).length <= 4,
              singleMessage: true, // Assume AI generates good thumbnails
              clearEmotion: !!thumb.emotion,
            },
          };
        });
      }

      // SEO Reality Check
      const topicDifficulty = assessTopicDifficulty(youtubeAnalysis);
      const recommendations: string[] = [];

      if (topicDifficulty === 'saturated') {
        recommendations.push('🔴 Chủ đề cạnh tranh cao. Nên sử dụng long-tail keyword hoặc angle độc đáo.');
        recommendations.push('Cân nhắc niche xuống (ví dụ: "cách nấu phở" → "cách nấu phở chay cho người mới")');
      } else if (topicDifficulty === 'medium') {
        recommendations.push('🟡 Chủ đề cạnh tranh vừa phải. Tập trung vào chất lượng content và thumbnail.');
      } else {
        recommendations.push('🟢 Chủ đề có cơ hội tốt. Đăng video sớm để chiếm vị trí.');
      }

      // Specific recommendations
      if (parsedOutput.titleOptimized.improvements.length > 0) {
        recommendations.push(`✏️ Title: ${parsedOutput.titleOptimized.improvements.join(', ')}`);
      }

      if (parsedOutput.descriptionEnhanced.differentiation.includes('Nên đổi angle')) {
        recommendations.push(`📝 Description: ${parsedOutput.descriptionEnhanced.differentiation}`);
      }

      if (parsedOutput.tagsEnhanced.weakTags.length > 0) {
        recommendations.push(`🏷️ Loại bỏ ${parsedOutput.tagsEnhanced.weakTags.length} tag yếu`);
      }

      // Pre-publish checklist
      const titleOK = parsedOutput.titleOptimized.text.length <= 65 &&
        parsedOutput.titleOptimized.text.toLowerCase().includes(mainKeyword.toLowerCase());
      const keywordOK = keywordMapping.some(km => km.position === '200 ký tự đầu');
      const thumbnailOK = parsedOutput.thumbnailsEnhanced?.some(t => t.checklist.textLength) || false;

      parsedOutput.seoRealityCheck = {
        topicDifficulty,
        difficultyExplanation: topicDifficulty === 'easy'
          ? `Trung bình ${youtubeAnalysis.avgViewCount.toLocaleString()} views, video mới (${youtubeAnalysis.avgVideoAge} ngày)`
          : topicDifficulty === 'medium'
            ? `Trung bình ${youtubeAnalysis.avgViewCount.toLocaleString()} views, cạnh tranh vừa phải`
            : `Trung bình ${youtubeAnalysis.avgViewCount.toLocaleString()} views, video cũ (${youtubeAnalysis.avgVideoAge} ngày) - thị trường bão hòa`,
        recommendations,
        prePublishChecklist: [
          {
            item: 'Title ≤ 65 ký tự và có keyword chính',
            status: titleOK,
            suggestion: titleOK ? '' : 'Sử dụng "Title Tối Ưu Nhất" được đề xuất',
          },
          {
            item: 'Keyword xuất hiện trong 200 ký tự đầu description',
            status: keywordOK,
            suggestion: keywordOK ? '' : 'Xem "2 Dòng Đầu Tối Ưu SEO" và điều chỉnh',
          },
          {
            item: 'Thumbnail text ≤ 4 từ',
            status: thumbnailOK,
            suggestion: thumbnailOK ? '' : 'Rút gọn text trên thumbnail',
          },
        ],
      };
    } else {
      // YouTube data not available - add warning
      console.warn('YouTube data not available, returning AI-only results');
    }

    // === STEP 4: Increment usage & return ===
    await incrementUserUsage(session.user.id);
    res.status(200).json(parsedOutput);

  } catch (err: any) {
    console.error("Error in /api/seo-tool:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
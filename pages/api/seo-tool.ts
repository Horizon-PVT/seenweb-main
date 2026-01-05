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

// Enhanced schema with new fields
const seoSchema = {
  type: Type.OBJECT,
  properties: {
    performanceScore: {
      type: Type.OBJECT,
      description: "Overall SEO performance evaluation.",
      properties: {
        overall: { type: Type.NUMBER, description: "Overall score out of 100, must be high." },
        keywordRepetition: { type: Type.NUMBER, description: "Score for keyword repetition (out of 5), must be 5." },
        highVolumeTags: { type: Type.NUMBER, description: "Score for using high-volume tags (out of 5), must be 5." },
        rankingTags: { type: Type.NUMBER, description: "Score for using relevant ranking tags (out of 5), must be 5." }
      }
    },
    titles: {
      type: Type.ARRAY,
      description: "Generate exactly 3 title variations.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The generated title, under 65 characters, including 2 main hashtags at the end." },
          score: { type: Type.NUMBER, description: "A score for this specific title (out of 100, must be > 90)." },
          keywords: { type: Type.ARRAY, description: "List of main and secondary keywords present in this title.", items: { type: Type.STRING } }
        }
      }
    },
    description: {
      type: Type.OBJECT,
      properties: {
        mainHashtags: { type: Type.ARRAY, description: "Exactly 5 main hashtags for the start of the description.", items: { type: Type.STRING } },
        body: { type: Type.STRING, description: "The main body of the description, broken into logical paragraphs with newlines. It must include relevant emojis to enhance readability. It must also include a placeholder for a YouTube link like '[PASTE YOUR VIDEO LINK HERE]' and a contact email like 'Business Inquiries: your.email@example.com'." },
        secondaryHashtags: { type: Type.ARRAY, description: "Exactly 10 secondary hashtags for the end of the description.", items: { type: Type.STRING } }
      }
    },
    tags: {
      type: Type.ARRAY,
      description: "Generate around 30 relevant tags, not exceeding 500 characters in total. The first tag must be the main keyword.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          strength: { type: Type.STRING, description: "Either 'Good' (for high search volume/low competition) or 'Balanced'." }
        }
      }
    },
    thumbnailIdeas: {
      type: Type.ARRAY,
      description: "Generate exactly 3 diverse and ultra-detailed thumbnail concepts for A/B testing.",
      items: {
        type: Type.OBJECT,
        properties: {
          concept: { type: Type.STRING, description: "Ultra-detailed concept: subject appearance (clothing, pose), background elements, specific objects." },
          emotion: { type: Type.STRING, description: "The target emotion (e.g., Curiosity, Urgency, Surprise)." },
          colors: { type: Type.STRING, description: "Two contrasting dominant color pairs (e.g., 'Vibrant green on dark grey')." },
          facialExpression: { type: Type.STRING, description: "Detailed facial expression (e.g., 'Shocked face, wide eyes, open mouth, slight head tilt')." },
          objects: { type: Type.STRING, description: "Specific objects/icons with placement hints (e.g., 'Glowing code icon (top-left), red warning sign (bottom-right)')." },
          thumbnailText: { type: Type.STRING, description: "Short, impactful text (e.g., 'WHY?!' or 'SECRET CODE')." },
          fontSuggestion: { type: Type.STRING, description: "Font style suggestion (e.g., 'Bold, impactful sans-serif like Bebas Neue')." },
          composition: { type: Type.STRING, description: "Layout/camera angle (e.g., 'Close-up shot, subject slightly off-center right, text wraps around subject. 16:9 aspect ratio. Shallow depth of field. Dramatic lighting from above.')." },
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

  // NEW FIELDS
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

    // === STEP 1: Generate AI SEO content ===
    const prompt = `You are a world-class YouTube SEO expert AND a creative visual director, a "Signal Tuner". Your task is to generate a complete, max-spec SEO package including detailed thumbnail concepts.

    **CRITICAL INSTRUCTION**: 
    1. First, automatically detect the language of the "Video Idea & Main Keywords" provided below. 
    2. Then, you MUST generate the entire SEO package strictly in that detected language.
    3. **OUTPUT FORMAT**: Return ONLY valid JSON. Do not include any markdown formatting (like \`\`\`json), explanations, or conversational text. 
    4. **NO REPETITION**: Do not repeat emojis or text endlessly. Be concise and professional.

    - **Video Idea & Main Keywords**: "${coreIdea}"
    - **Target Audience**: "${targetAudience}"
    - **Main SEO Goal**: Optimize for "${seoGoal}"

    Based on this, and following the schema, generate the complete SEO package.
    - Description body: Structure with paragraphs, relevant emojis (max 1-2 per paragraph), placeholders for links.
    - Thumbnails: Provide vivid, concrete descriptions (subject, background, lighting, mood) for AI generation.`;

    const ai = new GoogleGenAI({ apiKey });
    const aiPromise = ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        tools: useGrounding ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
        responseSchema: seoSchema,
      },
    });

    // === STEP 2: Fetch YouTube data (parallel with AI) ===
    let youtubeAnalysis: VideoAnalysis | null = null;
    let competitorVideos: any[] = [];
    const mainKeyword = extractMainKeyword(coreIdea);

    const youtubePromise = searchVideos(mainKeyword, 5)
      .then(async (videos) => {
        competitorVideos = videos;
        return analyzeTopVideos(videos);
      })
      .catch((error) => {
        console.error('YouTube API Error (non-blocking):', error.message);
        return null;
      });

    // Wait for both
    const [aiResponse, ytAnalysis] = await Promise.all([aiPromise, youtubePromise]);
    youtubeAnalysis = ytAnalysis;

    // Parse AI output
    let jsonString = aiResponse.text?.trim() || "";

    // Remove markdown code blocks if present (Gemini sometimes adds them despite JSON mode)
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
      console.error("JSON parse error:", jsonString.substring(0, 500)); // Log start of string for debug
      throw new Error(`Phản hồi từ AI không phải là JSON hợp lệ. Lỗi: ${(parseError as Error).message}`);
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
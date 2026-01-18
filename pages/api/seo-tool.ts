// pages/api/seo-tool.ts - SeenYT Alpha Strategy Engine
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from "@google/genai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { checkUserQuota } from "@/lib/quota";
import {
  searchVideos,
  analyzeTopVideos,
  extractMainKeyword,
  type VideoAnalysis,
} from "@/lib/youtube-api";

// --- 1. NEW STRATEGY SCHEMA (VIP PRO) ---
const seoSchema = {
  type: Type.OBJECT,
  properties: {
    // A. STRATEGY ENGINE (New)
    strategy: {
      type: Type.OBJECT,
      properties: {
        hook: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER }, // 0-100
            analysis: { type: Type.STRING },
            visualInterrupt: { type: Type.STRING } // Suggestion for first 5s
          }
        },
        emotional: {
          type: Type.OBJECT,
          properties: {
            mainTrigger: { type: Type.STRING }, // Fear, Curiosity, Greed
            triggerScore: { type: Type.NUMBER }, // 0-10
            explanation: { type: Type.STRING }
          }
        },
        spyGap: {
          type: Type.OBJECT,
          properties: {
            marketStatus: { type: Type.STRING }, // Saturated, Blue Ocean
            competitorMiss: { type: Type.STRING }, // What others missed
            ourAngle: { type: Type.STRING } // How we win
          }
        }
      }
    },
    // B. CONTENT EXECUTION (Standard SEO)
    content: {
      type: Type.OBJECT,
      properties: {
        titles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              viralScore: { type: Type.NUMBER } // 0-100
            }
          }
        },
        description: {
          type: Type.OBJECT,
          properties: {
            body: { type: Type.STRING }, // Formatted with icons & paragraphs
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } } // At end
          }
        },
        tags: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              relevance: { type: Type.NUMBER } // 0-100
            }
          }
        },
        thumbnails: { // CHANGED TO ARRAY
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING }, // Vietnamese
              text: { type: Type.STRING },
              colorPalette: { type: Type.STRING },
              prompt: { type: Type.STRING } // English Detailed
            }
          }
        }
      }
    }
  }
};

// --- Interfaces ---
interface StrategyOutput {
  strategy: {
    hook: { score: number; analysis: string; visualInterrupt: string };
    emotional: { mainTrigger: string; triggerScore: number; explanation: string };
    spyGap: { marketStatus: string; competitorMiss: string; ourAngle: string };
  };
  content: {
    titles: { text: string; viralScore: number }[];
    description: { body: string; hashtags: string[] };
    tags: { text: string; relevance: number }[];
    thumbnails: { concept: string; text: string; colorPalette: string; prompt: string }[]; // Array
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StrategyOutput | { error: string }>
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  try {
    await checkUserQuota(session.user.id);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }

  const { coreIdea, useGrounding, outputLanguage = 'Tiếng Việt' } = req.body;
  if (!coreIdea) return res.status(400).json({ error: "Missing coreIdea" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server Config Error" });

  // === 1. FETCH REAL MARKET DATA (Hybrid Mode) ===
  let marketContext = "";
  try {
    // Search for top 5 videos to analyze patterns
    const searchResults = await searchVideos(coreIdea);
    if (searchResults && searchResults.length > 0) {
      const topVideos = searchResults.slice(0, 5).map((v: any, i: number) =>
        `${i + 1}. "${v.title}" (Channel: ${v.channelTitle})` // Simplified for Prompt
      ).join('\n');

      marketContext = `
**REAL MARKET DATA (Top Competitors)**:
${topVideos}
`;
    }
  } catch (err) {
    console.warn("YouTube API Fetch Failed (Fallback to AI Memory):", err);
    marketContext = "";
  }

  // === VIP PRO PROMPT ===
  const prompt = `Bạn là "SeenYT Alpha" - Chiến lược gia YouTube hàng đầu thế giới (Top 1% Global).

**TARGET LANGUAGE**: ${outputLanguage} (Must output in this language).

**INPUT**:
- Idea/Script: "${coreIdea}"
${marketContext}

**MANDATORY RULE**:
1. **ALL OUTPUT DATA MUST BE IN ${outputLanguage}**.
2. If Target Language is English, write Titles, Description, Analysis in English.
3. Ignore the language of this prompt (Vietnamese), follow **TARGET LANGUAGE**.

**QUY TRÌNH TƯ DUY (Chain of Thought)**:
1. **Phân tích Hook (30s đầu)**: Ý tưởng này có đủ giữ chân người xem không? Cần thêm cú sốc thị giác (Visual Interrupt) nào?
2. **Ma trận cảm xúc**: Video này đánh vào tử huyệt nào? (Sợ mất mát, Tò mò, Tham vọng...).
3. **Tìm khoảng trống (Spy Gap)**: Đám đông đang làm gì chán ngắt? Ta làm gì để khác biệt?

**YÊU CẦU OUTPUT (JSON)**:

A. **STRATEGY** (Phần não bộ):
- hook.score: Chấm 0-100 độ cuốn hút.
- hook.visualInterrupt: Gợi ý 1 hành động/hình ảnh gây sốc ở giây thứ 5.
- emotional.mainTrigger: Tên tử huyệt cảm xúc.
- spyGap.competitorMiss: Đối thủ thường làm sai/thiếu gì?
- spyGap.ourAngle: Góc tiếp cận "Blue Ocean" của chúng ta.

B. **CONTENT** (Phần thực thi 2026):
1. **titles**: 3 tiêu đề "Clickbait Ethical" (đạt CTR cao nhưng không lừa đảo). Score 0-100.
2. **description**:
   - MÔ TẢ PHẢI CÓ CẤU TRÚC SAU (Bắt buộc dùng Icon):
     📌 **Vấn đề**: [Nỗi đau/Hook]
     💡 **Giải pháp**: [Nội dung chính]
     📞 **Kết nối**: [Link]
   - Hashtags: 3 cái, để ở cuối cùng.
   - **LƯU Ý VỀ ĐỊNH DẠNG MÔ TẢ**:
     - Bắt buộc dùng 2 lần xuống dòng (Enter) giữa các mục để tách đoạn rõ ràng.
     - **ĐỘ DÀI**: Phần "Giải pháp/Nội dung chính" phải viết SÂU, chi tiết (tối thiểu 4-5 dòng), không viết hời hợt. Phân tích kỹ tâm lý.

3. **tags**: 15 tag chất lượng nhất (Niche drops). Relevance 0-100.
4. **thumbnails**:
   - Tạo 3 Concept khác nhau (Ví dụ: Biểu cảm sốc, So sánh, Bí ẩn).
   - Concept: Mô tả chi tiết.
   - Text: Tối đa 4 từ, gây tò mò.
   - **prompt**: Viết Prompt chi tiết cho Midjourney (Tiếng Anh 100%). Bao gồm: Subject, Lighting, Camera Angle, Style (Photorealistic/3D/Illustration), Aspect Ratio --ar 16:9.

**QUY TẮC NGÔN NGỮ (Language Rule)**:
- **DETECT** ngôn ngữ của Input.
- **OUTPUT** toàn bộ nội dung (Strategy, Titles, Description, Tags, Thumbnail Concepts) bằng **CHÍNH NGÔN NGỮ ĐÓ**.
- Ví dụ: Input Tiếng Anh -> Output Tiếng Anh. Input Tiếng Việt -> Output Tiếng Việt.
- Ngoại lệ duy nhất: 'thumbnail.prompt' luôn luôn là Tiếng Anh.`;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: seoSchema,
      },
    });

    const outputText = response.text?.trim() || "{}";
    // Sanitize
    const jsonStr = outputText.replace(/^```json /, '').replace(/```$/, '');
    const data = JSON.parse(jsonStr) as StrategyOutput;

    // Optional: Fetch YouTube data in background or parallel if needed for future advanced features
    // For now, relies purely on AI Strategy for speed and reasoning

    res.status(200).json(data);
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Lỗi xử lý chiến lược: " + error.message });
  }
}
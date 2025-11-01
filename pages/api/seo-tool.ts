// File: pages/api/seo-tool.ts (Backend - Đã cập nhật Prompt Thumbnail)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from "@google/genai";

// Giữ nguyên schema JSON
const seoSchema = {
  type: Type.OBJECT,
  properties: {
    performanceScore: {
      type: Type.OBJECT, description: "Overall SEO performance evaluation.", properties: {
        overall: { type: Type.NUMBER, description: "Overall score out of 100, must be high." },
        keywordRepetition: { type: Type.NUMBER, description: "Score for keyword repetition (out of 5), must be 5." },
        highVolumeTags: { type: Type.NUMBER, description: "Score for using high-volume tags (out of 5), must be 5." },
        rankingTags: { type: Type.NUMBER, description: "Score for using relevant ranking tags (out of 5), must be 5." }
      }
    },
    titles: {
      type: Type.ARRAY, description: "Generate exactly 3 title variations.", items: {
        type: Type.OBJECT, properties: {
          text: { type: Type.STRING, description: "The generated title, under 65 characters, including 2 main hashtags at the end." },
          score: { type: Type.NUMBER, description: "A score for this specific title (out of 100, must be > 90)." },
          keywords: { type: Type.ARRAY, description: "List of main and secondary keywords present in this title.", items: { type: Type.STRING } }
        }
      }
    },
    description: {
      type: Type.OBJECT, properties: {
        mainHashtags: { type: Type.ARRAY, description: "Exactly 5 main hashtags for the start of the description.", items: { type: Type.STRING } },
        body: { type: Type.STRING, description: "The main body of the description, broken into logical paragraphs with newlines. It must include relevant emojis to enhance readability. It must also include a placeholder for a YouTube link like '[PASTE YOUR VIDEO LINK HERE]' and a contact email like 'Business Inquiries: your.email@example.com'." },
        secondaryHashtags: { type: Type.ARRAY, description: "Exactly 10 secondary hashtags for the end of the description.", items: { type: Type.STRING } }
      }
    },
    tags: {
      type: Type.ARRAY, description: "Generate around 30 relevant tags, not exceeding 500 characters in total. The first tag must be the main keyword.", items: {
        type: Type.OBJECT, properties: {
          text: { type: Type.STRING },
          strength: { type: Type.STRING, description: "Either 'Good' (for high search volume/low competition) or 'Balanced'." }
        }
      }
    },
    // Schema Thumbnail giữ nguyên, yêu cầu chi tiết nằm trong prompt
    thumbnailIdeas: {
      type: Type.ARRAY, description: "Generate exactly 3 diverse and ultra-detailed thumbnail concepts for A/B testing.", items: {
        type: Type.OBJECT, properties: {
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


// Giữ nguyên interface OutputData và ErrorResponse
interface OutputData { /* ... */ }
interface ErrorResponse { error: string; }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OutputData | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { coreIdea, useGrounding, targetAudience, seoGoal } = req.body;
    if (!coreIdea || !targetAudience || !seoGoal) {
        return res.status(400).json({ error: "Thiếu coreIdea, targetAudience, hoặc seoGoal." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // --- PROMPT ĐÃ ĐƯỢC CẬP NHẬT ---
    const prompt = `You are a world-class YouTube SEO expert AND a creative visual director, a "Signal Tuner". Your task is to generate a complete, max-spec SEO package including ultra-detailed thumbnail concepts.

    **CRITICAL INSTRUCTION**: First, automatically detect the language of the "Video Idea & Main Keywords" provided below. Then, you MUST generate the entire SEO package strictly in that detected language.

    - **Video Idea & Main Keywords**: "${coreIdea}"
    - **Target Audience**: "${targetAudience}"
    - **Main SEO Goal**: Optimize for "${seoGoal}"

    Based on this, and following the schema, generate the complete SEO package.
    - Ensure the description body is well-structured with paragraphs, relevant emojis (like ✅, 👉, 💡, etc.), placeholders for links, and contact info.
    - **CRITICAL FOR THUMBNAILS**: The thumbnail ideas MUST be **ultra-detailed**, providing concrete, vivid descriptions suitable for direct input into an AI image generator. Describe subject appearance (clothing, pose, ethnicity if relevant), background elements, specific objects with placement hints, lighting (e.g., dramatic, soft, neon), camera angle (e.g., low angle, eye-level, dutch tilt), and overall mood for each of the 3 concepts. Make them distinct from each other.`;
    // --- Hết Prompt ---

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Hoặc model phù hợp
      contents: prompt,
      config: {
        tools: useGrounding ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
        responseSchema: seoSchema,
      },
    });

    const jsonString = response.text.trim();
    let parsedOutput: OutputData;
    try {
      parsedOutput = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Lỗi parse JSON từ Gemini (SEO Tool):", jsonString);
      throw new Error("Phản hồi từ AI không phải là JSON hợp lệ.");
    }

    res.status(200).json(parsedOutput);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/seo-tool:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
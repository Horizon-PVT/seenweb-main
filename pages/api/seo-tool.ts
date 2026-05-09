// pages/api/seo-tool.ts - SeenYT Alpha Strategy Engine
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from "@/lib/quota";
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
    // A2. VIDEO AUDIT (New - for existing video analysis)
    audit: {
      type: Type.OBJECT,
      properties: {
        titleScore: { type: Type.NUMBER }, // 0-100
        titleCritique: { type: Type.STRING }, // What's wrong with current title
        thumbnailCritique: { type: Type.STRING } // Advice for thumbnail
      }
    },
    // A3. SEO TECHNICAL CHECKLIST (New - VidIQ Gap)
    checklist: {
      type: Type.OBJECT,
      properties: {
        titleLength: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            status: { type: Type.STRING }, // "Good", "Warning", "Critical"
            message: { type: Type.STRING }
          }
        },
        wordCount: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            status: { type: Type.STRING },
            message: { type: Type.STRING }
          }
        },
        tagCount: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            status: { type: Type.STRING },
            message: { type: Type.STRING }
          }
        },
        hasQuestion: { type: Type.BOOLEAN },
        hasNumber: { type: Type.BOOLEAN }
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
  audit: {
    titleScore: number;
    titleCritique: string;
    thumbnailCritique: string;
  };
  checklist: {
    titleLength: { score: number; status: string; message: string };
    wordCount: { score: number; status: string; message: string };
    tagCount: { score: number; status: string; message: string };
    hasQuestion: boolean;
    hasNumber: boolean;
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
    await checkUserQuota(session.user.id, 'seo-tool');
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

**TARGET LANGUAGE FOR OUTPUT**: "${outputLanguage}" (MUST RESPECT THIS).

**INPUT CONTEXT**:
- Idea/Script: "${coreIdea}"
${marketContext}

**CRITICAL INSTRUCTION**:
All analysis, titles, descriptions, and text output MUST be in **${outputLanguage}**.
- If Target Language is "English", all output (except thumbnail prompt) must be in standard US English.
- If Target Language is "Japanese", output in Japanese (Natural & Native).
- If Target Language is "Vietnamese", output in Vietnamese.

**MANDATORY RULE**:
1. Ignore the language of the input script if it differs from Target Language. ALWAYS translate/adapt your thinking to **${outputLanguage}**.
2. **thumbnail.prompt** is the ONLY field that must ALWAYS be in **English**.

**QUY TRÌNH TƯ DUY (Chain of Thought - Apply in ${outputLanguage})**:
1. **Hook Analysis**: Is this 30s strong enough? Visual Interrupt?
2. **Emotional Matrix**: What triggers curiosity/fear/greed?
3. **Spy Gap**: What are competitors missing?

**YÊU CẦU OUTPUT (JSON)**:

A. **STRATEGY**:
- hook.analysis: Explain in ${outputLanguage}.
- emotional.mainTrigger: Name the emotion in ${outputLanguage}.
- emotional.explanation: Explain in ${outputLanguage}.
- spyGap: Analyze in ${outputLanguage}.
- audit.titleScore: Rate input title 0-100.
- audit.titleCritique: Critique input title in ${outputLanguage} (too long? boring? keyword missing?).
- audit.thumbnailCritique: What kind of thumbnail usually works for this topic? (in ${outputLanguage}).

**CHECKLIST (TECHNICAL AUDIT)**:
- checklist.titleLength: Check if input title is 40-60 chars. Score 0-100. Status "Good"/"Warning".
- checklist.wordCount: Check input script length. Ideal > 200 words.
- checklist.tagCount: Check if 15-20 tags are provided below.
- checklist.hasQuestion: true if input title has "?".
- checklist.hasNumber: true if input title has digit.

B. **CONTENT**:
1. **titles**: 3 viral titles in **${outputLanguage}**.
2. **description**:
   - **MUST USE THIS EXACT STRUCTURE WITH ICONS**:
     📌 **Problem**: [Hook/Pain Point] (in ${outputLanguage})
     (Double Line Break)
     💡 **Solution**: [Main Content/Value] (in ${outputLanguage}) - Write 3-4 deep sentences.
     (Double Line Break)
     📞 **Connect**: [Call to Action] (in ${outputLanguage})
   - **FORMATTING**: Use double line breaks (\\n\\n) between sections for clear separation.
   - Hashtags: 3 relevant tags at the very end.
3. **tags**: 15 high-volume tags in **${outputLanguage}**.
4. **thumbnails** (MUST GENERATE EXACTLY 3 CONCEPTS in an Array):
   - **DESIGN PRINCIPLES (Apply these strictly)**:
     1. **Stop the Scroll**: High contrast, shocking or curiosity-inducing visual.
     2. **One-idea rule**: Focus on ONE main element/message. No clutter.
     3. **Mobile Optimization**: Big faces (emotional), huge text (easy to read on phone).
   
   - **OUTPUT FORMAT (For each of the 3 concepts)**:
     - concept: Explain the visual idea in **${outputLanguage}**.
     - text: Short text overlay (Max 4 words, BIG font implied) in **${outputLanguage}**.
     - colorPalette: High contrast colors (e.g., "Yellow on Black") in **${outputLanguage}**.
     - **prompt**: Detailed Midjourney Prompt in **ENGLISH** (Focus on: Close-up shot, 8k resolution, hyper-realistic, dramatic lighting).`;

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

    await incrementUserUsage(session.user.id, 'seo-tool');
    res.status(200).json(data);
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Lỗi xử lý chiến lược: " + error.message });
  }
}
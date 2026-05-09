// pages/api/multilingual-studio.ts
// WF6: Multilingual Content Studio - Script → Translate → TTS → Video
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from "@/lib/quota";
import { getCached, setCache, generateCacheKey, CACHE_PREFIXES } from "@/lib/cache";

const CACHE_TTL_SECONDS = 3 * 24 * 60 * 60; // 3 days

const multilingualSchema = {
  type: Type.OBJECT,
  properties: {
    originalScript: { type: Type.STRING },
    translatedScripts: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.STRING },
        spanish: { type: Type.STRING },
        french: { type: Type.STRING },
        german: { type: Type.STRING },
        portuguese: { type: Type.STRING },
        vietnamese: { type: Type.STRING },
        japanese: { type: Type.STRING },
        korean: { type: Type.STRING },
        chinese: { type: Type.STRING },
        hindi: { type: Type.STRING },
        indonesian: { type: Type.STRING },
        thai: { type: Type.STRING },
        italian: { type: Type.STRING },
        russian: { type: Type.STRING },
        turkish: { type: Type.STRING },
        arabic: { type: Type.STRING },
        polish: { type: Type.STRING },
        dutch: { type: Type.STRING },
        chinese_traditional: { type: Type.STRING },
      }
    },
    visualPrompts: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.ARRAY, items: { type: Type.STRING } },
        spanish: { type: Type.ARRAY, items: { type: Type.STRING } },
        french: { type: Type.ARRAY, items: { type: Type.STRING } },
        japanese: { type: Type.ARRAY, items: { type: Type.STRING } },
        korean: { type: Type.ARRAY, items: { type: Type.STRING } },
        chinese: { type: Type.ARRAY, items: { type: Type.STRING } },
      }
    },
    titleOptimizations: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.ARRAY, items: { type: Type.STRING } },
        spanish: { type: Type.ARRAY, items: { type: Type.STRING } },
        french: { type: Type.ARRAY, items: { type: Type.STRING } },
        japanese: { type: Type.ARRAY, items: { type: Type.STRING } },
        korean: { type: Type.ARRAY, items: { type: Type.STRING } },
        chinese: { type: Type.ARRAY, items: { type: Type.STRING } },
      }
    },
    descriptionTemplates: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.STRING },
        spanish: { type: Type.STRING },
        french: { type: Type.STRING },
        japanese: { type: Type.STRING },
        korean: { type: Type.STRING },
        chinese: { type: Type.STRING },
      }
    },
    seoKeywords: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.ARRAY, items: { type: Type.STRING } },
        spanish: { type: Type.ARRAY, items: { type: Type.STRING } },
        french: { type: Type.ARRAY, items: { type: Type.STRING } },
        japanese: { type: Type.ARRAY, items: { type: Type.STRING } },
        korean: { type: Type.ARRAY, items: { type: Type.STRING } },
        chinese: { type: Type.ARRAY, items: { type: Type.STRING } },
      }
    },
    culturalNotes: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.STRING },
        spanish: { type: Type.STRING },
        french: { type: Type.STRING },
        japanese: { type: Type.STRING },
        korean: { type: Type.STRING },
        chinese: { type: Type.STRING },
      }
    },
    productionNotes: { type: Type.STRING }
  }
};

interface MultilingualOutput {
  originalScript: string;
  translatedScripts: {
    english: string;
    spanish: string;
    french: string;
    german: string;
    portuguese: string;
    vietnamese: string;
    japanese: string;
    korean: string;
    chinese: string;
    hindi: string;
    indonesian: string;
    thai: string;
    italian: string;
    russian: string;
    turkish: string;
    arabic: string;
    polish: string;
    dutch: string;
    chinese_traditional: string;
  };
  visualPrompts: {
    english: string[];
    spanish: string[];
    french: string[];
    japanese: string[];
    korean: string[];
    chinese: string[];
  };
  titleOptimizations: {
    english: string[];
    spanish: string[];
    french: string[];
    japanese: string[];
    korean: string[];
    chinese: string[];
  };
  descriptionTemplates: {
    english: string;
    spanish: string;
    french: string;
    japanese: string;
    korean: string;
    chinese: string;
  };
  seoKeywords: {
    english: string[];
    spanish: string[];
    french: string[];
    japanese: string[];
    korean: string[];
    chinese: string[];
  };
  culturalNotes: {
    english: string;
    spanish: string;
    french: string;
    japanese: string;
    korean: string;
    chinese: string;
  };
  productionNotes: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MultilingualOutput | { error: string }>
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  try {
    await checkUserQuota(session.user.id, 'multilingual-studio');
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }

  const { script, topic, targetLanguages, contentStyle } = req.body;
  if (!script && !topic) return res.status(400).json({ error: "Missing script or topic" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server Config Error" });

  const langs = targetLanguages || ['english', 'spanish', 'french'];
  const cacheInput = `multi:${script || topic}:${langs.join(',')}:${contentStyle || ''}`;
  const cacheKey = generateCacheKey(CACHE_PREFIXES.SCRIPT, cacheInput);
  const cached = await getCached<MultilingualOutput>(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const inputSource = script ? `Original Script:\n"${script}"` : `Topic to create script: "${topic}"`;

  const prompt = `You are a Multilingual Content Director AI. Adapt content for international YouTube markets.

**INPUT:**
${inputSource}
- Content Style: ${contentStyle || 'Educational Documentary'}
- Target Languages: ${langs.join(', ')}

**CRITICAL RULES:**
1. If original script is provided in Vietnamese, translate it naturally to each language.
2. If only topic is provided, write the script in Vietnamese first, then translate.
3. Visual prompts MUST be in English for AI video tools (Runway/Pika/Kling).
4. Cultural notes: Explain any cultural adaptations needed for each market.
5. Return ONLY pure JSON with this EXACT structure:

{
  "originalScript": "Original script in Vietnamese",
  "translatedScripts": {
    "english": "English translation of the script",
    "spanish": "Spanish translation",
    "french": "French translation",
    "german": "German translation",
    "portuguese": "Portuguese translation",
    "vietnamese": "Vietnamese translation (original)",
    "japanese": "Japanese translation (natural, not robotic)",
    "korean": "Korean translation (natural)",
    "chinese": "Chinese Simplified translation",
    "chinese_traditional": "Chinese Traditional translation",
    "hindi": "Hindi translation",
    "indonesian": "Indonesian translation",
    "thai": "Thai translation",
    "italian": "Italian translation",
    "russian": "Russian translation",
    "turkish": "Turkish translation",
    "arabic": "Arabic translation",
    "polish": "Polish translation",
    "dutch": "Dutch translation"
  },
  "visualPrompts": {
    "english": ["English visual prompt 1", "English visual prompt 2", "English visual prompt 3"],
    "spanish": ["Spanish visual prompt 1", "..."],
    "french": ["French visual prompt 1", "..."],
    "japanese": ["Japanese visual prompt 1", "..."],
    "korean": ["Korean visual prompt 1", "..."],
    "chinese": ["Chinese visual prompt 1", "..."]
  },
  "titleOptimizations": {
    "english": ["English YouTube title 1", "English YouTube title 2", "English YouTube title 3"],
    "spanish": ["Spanish YouTube title 1", "Spanish YouTube title 2"],
    "french": ["French YouTube title 1", "French YouTube title 2"],
    "japanese": ["Japanese YouTube title 1", "Japanese YouTube title 2"],
    "korean": ["Korean YouTube title 1", "Korean YouTube title 2"],
    "chinese": ["Chinese YouTube title 1", "Chinese YouTube title 2"]
  },
  "descriptionTemplates": {
    "english": "SEO-optimized English description with hooks and CTAs",
    "spanish": "SEO-optimized Spanish description",
    "french": "SEO-optimized French description",
    "japanese": "SEO-optimized Japanese description",
    "korean": "SEO-optimized Korean description",
    "chinese": "SEO-optimized Chinese description"
  },
  "seoKeywords": {
    "english": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "spanish": ["palabra1", "palabra2", "palabra3"],
    "french": ["mot1", "mot2", "mot3"],
    "japanese": ["キーワード1", "キーワード2"],
    "korean": ["키워드1", "키워드2"],
    "chinese": ["关键词1", "关键词2"]
  },
  "culturalNotes": {
    "english": "Cultural adaptation notes for English-speaking markets (US/UK/AU)",
    "spanish": "Notes for Spanish-speaking markets (LatAm vs Spain differences)",
    "french": "Notes for French-speaking markets",
    "japanese": "Cultural notes for Japanese market - formal vs casual language",
    "korean": "Cultural notes for Korean market - honorifics importance",
    "chinese": "Cultural notes for Chinese market - regional differences"
  },
  "productionNotes": "Cross-cultural production tips for filming the same content across markets"
}

Generate 3-5 visual prompts for English, 3 for Spanish, 2 each for French/Japanese/Korean/Chinese markets. Each visual prompt max 25 words in English.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: multilingualSchema,
      },
    });

    const text = response.text?.trim() || "{}";
    const jsonStr = text.replace(/^```json /, '').replace(/```$/, '');
    const data = JSON.parse(jsonStr) as MultilingualOutput;

    await incrementUserUsage(session.user.id, 'multilingual-studio');
    setCache(cacheKey, data, CACHE_TTL_SECONDS);
    res.status(200).json(data);

  } catch (error: any) {
    console.error("Multilingual Studio Error:", error);
    res.status(500).json({ error: "Multilingual adaptation failed: " + error.message });
  }
}

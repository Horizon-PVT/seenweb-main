// pages/api/video-pipeline.ts
// WF4: Video Automation Pipeline - AI Script → AI Video → TTS → Dubbing
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from "@/lib/quota";
import { getCached, setCache, generateCacheKey, CACHE_PREFIXES } from "@/lib/cache";

const CACHE_TTL_SECONDS = 3 * 24 * 60 * 60; // 3 days

const pipelineSchema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    generatedScript: { type: Type.STRING },
    visualPrompts: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    voiceoverScript: { type: Type.STRING },
    estimatedDuration: { type: Type.STRING },
    productionTips: { type: Type.STRING },
    thumbnailConcept: { type: Type.STRING },
    thumbnailPrompt: { type: Type.STRING },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  }
};

interface PipelineOutput {
  topic: string;
  generatedScript: string;
  visualPrompts: string[];
  voiceoverScript: string;
  estimatedDuration: string;
  productionTips: string;
  thumbnailConcept: string;
  thumbnailPrompt: string;
  tags: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PipelineOutput | { error: string }>
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  try {
    await checkUserQuota(session.user.id, 'video-pipeline');
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }

  const { topic, style, tone, duration = 5, targetAudience } = req.body;
  if (!topic) return res.status(400).json({ error: "Missing topic" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server Config Error" });

  // Cache check
  const cacheInput = `pipeline:${topic}:${style}:${tone}:${duration}:${targetAudience || ''}`;
  const cacheKey = generateCacheKey(CACHE_PREFIXES.VIDEO, cacheInput);
  const cached = await getCached<PipelineOutput>(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const prompt = `You are an Expert AI Video Production Director. Create a complete video production pipeline for AI-generated video.

**INPUT:**
- Topic: "${topic}"
- Style: ${style || 'Educational Documentary'}
- Tone: ${tone || 'Professional & Engaging'}
- Target Duration: ${duration} minutes
- Target Audience: ${targetAudience || 'General viewers'}

**CRITICAL RULES FOR AI VIDEO TOOLS (Runway Gen-3, Pika, Kling):**
1. Each visual segment MUST be 5-8 seconds (AI tools limit: ~8s/clip)
2. Visual prompts MUST be in ENGLISH
3. ONE main subject per scene
4. SIMPLE actions only (walk, turn, look, smile)

**OUTPUT FORMAT - Return ONLY pure JSON with this EXACT structure:**

{
  "topic": "The video topic (1-2 sentences)",
  "generatedScript": "Full narration script in Vietnamese (matching input language), 1 paragraph per visual segment",
  "visualPrompts": ["English visual prompt 1 (max 30 words)", "English visual prompt 2", ...],
  "voiceoverScript": "Clean Vietnamese voiceover text (no stage directions, just narration)",
  "estimatedDuration": "X minutes Y seconds",
  "productionTips": "Brief production notes for filming/editing",
  "thumbnailConcept": "Thumbnail visual concept in Vietnamese",
  "thumbnailPrompt": "Detailed Midjourney/AI thumbnail prompt in English (for concept visualization)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

IMPORTANT: 
- Generate ${Math.ceil(duration * 60 / 7)} visual prompts for ${duration} minute video
- Visual prompts should be diverse and create visual variety
- Script should match the visual pacing (1-2 paragraphs per prompt)
- Return ONLY JSON, no markdown, no explanations`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: pipelineSchema,
      },
    });

    const text = response.text?.trim() || "{}";
    const jsonStr = text.replace(/^```json /, '').replace(/```$/, '');
    const data = JSON.parse(jsonStr) as PipelineOutput;

    await incrementUserUsage(session.user.id, 'video-pipeline');
    setCache(cacheKey, data, CACHE_TTL_SECONDS);
    res.status(200).json(data);

  } catch (error: any) {
    console.error("Pipeline Error:", error);
    res.status(500).json({ error: "Pipeline generation failed: " + error.message });
  }
}

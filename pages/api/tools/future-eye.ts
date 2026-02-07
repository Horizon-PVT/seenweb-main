import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';
import { GoogleGenAI, Type } from "@google/genai";

// ---------------------------------------------------------
// 1. SCHEMAS (UPDATED)
// ---------------------------------------------------------

const topicsSchema = {
    type: Type.OBJECT,
    properties: {
        topics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    pillar: { type: Type.STRING },
                    title: { type: Type.STRING },
                    hook: { type: Type.STRING },
                    cpm_potential: { type: Type.STRING }
                },
                required: ["pillar", "title", "hook", "cpm_potential"]
            }
        }
    },
    required: ["topics"]
};

// NEW: Segment-based Script Schema
const scriptSchema = {
    type: Type.OBJECT,
    properties: {
        script: {
            type: Type.OBJECT,
            properties: {
                totalDuration: { type: Type.STRING }, // e.g. "9:30"
                segments: { // Renamed from chapters
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            content_vi: { type: Type.STRING }, // Primary VI
                            content_en: { type: Type.STRING }, // Reference EN
                            duration: { type: Type.STRING } // e.g. "15s"
                        },
                        required: ["id", "content_vi", "content_en", "duration"]
                    }
                }
            },
            required: ["totalDuration", "segments"]
        },
        attributeTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ["script", "attributeTags"]
};

const translationSchema = {
    type: Type.OBJECT,
    properties: {
        translatedSegments: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ["translatedSegments"]
};

// Visual sync needs to read the segments now
const visualSyncSchema = {
    type: Type.OBJECT,
    properties: {
        visualSync: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.STRING },
                    shotType: { type: Type.STRING },
                    narrativeBeat: { type: Type.STRING },
                    voiceoverScript: { type: Type.STRING },
                    aiPrompt: { type: Type.STRING },
                    transitionToNext: { type: Type.STRING },
                    continuityNote: { type: Type.STRING },
                    earthStudioCoords: {
                        type: Type.OBJECT,
                        properties: {
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER },
                            altitude: { type: Type.NUMBER },
                            tilt: { type: Type.NUMBER },
                            heading: { type: Type.NUMBER }
                        },
                        required: ["lat", "lng", "altitude", "tilt", "heading"]
                    }
                },
                required: ["timestamp", "shotType", "narrativeBeat", "voiceoverScript", "aiPrompt", "transitionToNext", "continuityNote", "earthStudioCoords"]
            }
        }
    },
    required: ["visualSync"]
};


// ---------------------------------------------------------
// 2. API HANDLER
// ---------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" });
    const userId = (session.user as any).id;

    // Quota check (PRO-only tool)
    try {
        await checkUserQuota(userId, 'future-eye');
    } catch (error: any) {
        if (error.message === 'PLAN_LOCKED') {
            return res.status(403).json({ error: 'PLAN_LOCKED' });
        }
        if (error.message === 'FREE_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'FREE_QUOTA_EXCEEDED' });
        }
        if (error.message === 'DAILY_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'DAILY_QUOTA_EXCEEDED' });
        }
        throw error;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server configuration error" });
    const ai = new GoogleGenAI({ apiKey });

    try {
        const { action, location, year, topic, scriptContent, textToTranslate, targetLanguage, segmentsToTranslate, cpm } = req.body;

        // TOPICS (Unchanged)
        if (action === "generate_topics") {
            const prompt = `ROLE: Future Tech Strategist (Year ${year}).
TASK: Generate 12 specific future infrastructure/tech concepts for "${location}".
STRICT OUTPUT: JSON Only.

VECTORS (2 topics each):
1. AI Governance
2. Megastructures
3. Future Mobility
4. Biotech
5. Energy
6. Digital Economy

RULES:
- Specific to ${location} (mention real districts/landmarks).
- Tone: Definitive, Engineering, Sci-Fi.
- **CPM LOGIC**: Analyze the niche value. 
  - IF Finance/Biotech/AI: Estimate $35-$60.
  - IF General Tech/Infra: Estimate $15-$30.
  - IF Social/Culture: Estimate $8-$15.
  - RETURN a realistic range strings (e.g. "$32-$45").

JSON FORMAT:
{
  "topics": [
    { "pillar": "...", "title": "...", "hook": "...", "cpm_potential": "Based on Niche (e.g. $42-$55)" }
  ]
}`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json", responseSchema: topicsSchema },
            });
            await incrementUserUsage(userId, 'future-eye');
            return res.status(200).json(JSON.parse(response.text || "{}"));
        }

        // SCRIPT (UPDATED for Table + Duration)
        if (action === "generate_script") {
            const prompt = `ROLE: Documentary Screenwriter (Year 2050).
TASK: Write a PROFESSIONAL BROADCAST SCRIPT about "${topic}" in ${location}.

CRITICAL LENGTH REQUIREMENT:
- The script MUST be long enough for an 8-10 minute video.
- Total Word Count: MINIMUM 1500 WORDS.
- DO NOT WRITE SUMMARIES. Write the EXACT spoken word-for-word narration.
- If the script is too short, the user will reject it. EXPAND on every detail.

STRUCTURE:
- Split into 15-20 granular "Segments" for a 3-column table.
- Each segment should be a substantial block of narration (approx 60-90 words each).

COLUMNS:
- ID (STT)
- Content (Vietnamese & English) - The spoken narration.
- Duration (Time estimate, e.g., "0:45")

TONE: "History from the Future". Past tense. Highly specific, immersive, and dramatic.

OUTPUT JSON SCHEMA:
{
  "script": { 
     "totalDuration": "String (e.g. 9:15)",
     "segments": [
        { "id": 1, "content_vi": "Full refined Vietnamese narration...", "content_en": "Full English translation...", "duration": "0:45" }
     ]
  },
  "attributeTags": ["tag1", "tag2"]
}`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json", responseSchema: scriptSchema },
            });
            const data = JSON.parse(response.text || "{}");
            data.cpm = cpm; // Pass CPM back
            await incrementUserUsage(userId, 'future-eye');
            return res.status(200).json(data);
        }

        // TRANSLATE (Updated for Segments)
        if (action === "translate_adapter") {
            if (!segmentsToTranslate || !targetLanguage) return res.status(400).json({ error: "Missing segments/language" });

            // We translate an array of strings to maintain table structure
            const prompt = `Translate these script segments to ${targetLanguage}.
Tone: Documentary.
Keep the same number of segments. Return JSON array of strings.

INPUT SEGMENTS:
${JSON.stringify(segmentsToTranslate)}`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json", responseSchema: translationSchema },
            });
            await incrementUserUsage(userId, 'future-eye');
            return res.status(200).json(JSON.parse(response.text || "{}"));
        }

        // VISUAL SYNC (Updated to read segments)
        if (action === "generate_visual_sync") {
            const prompt = `ROLE: Cinematographer.
TASK: Create visual sync table for this ENTIRE 8-10 minute video.
LOCATION: ${location}. YEAR: ${year}.

CRITICAL: You MUST generate enough entries to cover the FULL duration.
Generate at least 60 entries at 8-10 second intervals = ~8-10 min coverage.

SCRIPT STRUCTURE:
${JSON.stringify(scriptContent).substring(0, 10000)}

REQUIREMENTS:
- Generate at least 60 entries.
- timestamp: 0:00, 0:10, 0:20, ... up to 9:00 or beyond.
- Cover ALL narrative beats from the script.
- shotType: Drone, Close-up, Tracking, Wide, Aerial, etc.
- aiPrompt: English, detailed, photorealistic.
- earthStudioCoords: Lat/Lng for ${location}.

JSON ONLY.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json", responseSchema: visualSyncSchema },
            });
            await incrementUserUsage(userId, 'future-eye');
            return res.status(200).json(JSON.parse(response.text || "{}"));
        }

        return res.status(400).json({ error: "Invalid Action" });
    } catch (error: any) {
        console.error("Future Eye Error:", error);
        return res.status(500).json({ error: error.message || "Server Error" });
    }
}

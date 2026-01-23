
// pages/api/admin/tools/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const session = await getServerSession(req, res, authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { trends, lang, type } = req.body;

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('Gemini API Key loaded:', apiKey ? 'YES' : 'NO');

        if (!apiKey) {
            return res.status(500).json({ error: 'Missing GEMINI_API_KEY in .env' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // User explicitly stated they have access to "gemini-2.5-flash".
        // Switching to this specific model as requested.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const selectedTopic = trends[0];

        let userPrompt = '';
        const trend = trends[0]; // trends is an array, take the first one or iterate if needed. using selectedTopic here effectively.
        // Assuming trends[0] is the object we want, let's stick to using 'selectedTopic' variable you created or just use 'trend'
        // Ideally the previous code used selectedTopic. I will use selectedTopic.

        userPrompt = `
            You are an expert AI Investigative Journalist and Media Analyst (like a digital Tucker Carlson or Russell Brand, but neutral and data-driven). 
            Your goal is to "Expose the Truth" behind current trending topics, specifically looking for MEDIA BIAS, HIDDEN AGENDAS, or DETAILS THEY MISSED.

            **CRITICAL SAFETY GUIDELINES (To avoid YouTube Strikes):**
            1. NEVER say "This is fake news" directly. Instead, say "Let's look at what the mainstream narrative is missing" or "Here is the context they didn't tell you".
            2. Focus on ANALYSIS and QUESTIONS (e.g., "Why are they pushing this now?") rather than absolute claims.
            3. Cite "Online discourse", "X user reports", or "Data patterns" as your source.
            4. Tone: Urgent, eye-opening, "Red Pill", but professional and analytical.

            **INPUT CONTEXT:**
            Topic: "${selectedTopic.name}"
            Region: "${lang}" (Target Audience Language)
            Format: "${type}" (Shorts = 60s, Long = 10m)
            Context Data: ${JSON.stringify(selectedTopic)}

            **SCRIPT STRUCTURE (${type === 'shorts' ? 'Vertical 60s' : 'Horizontal Deep Dive'}):**
            
            ${type === 'shorts' ? `
            [00-05s] THE HOOK: A questions or statement that challenges the mainstream view. (e.g., "You think you know about ${selectedTopic.name}? You're wrong.")
            [05-45s] THE EXPOSE: 3 rapid-fire points showing the hidden angle, contradiction, or hypocrisy.
            [45-60s] THE CTA: "Subscribe for the truth they won't show you."
            ` : `
            [INTRO] The Mainstream Narrative vs. The Reality.
            [SECTION 1] The "Official" Story (Briefly).
            [SECTION 2] The Gap: What X (Twitter) is finding that TV is ignoring.
            [SECTION 3] Follow the Money/Agenda: Who benefits from this story?
            [CONCLUSION] Final verdict. "Stay doubtful. Stay tuned."
            `}

            **OUTPUT FORMAT:**
            Return strictly a JSON object with:
            {
                "title": "A viral, clickbaity title (e.g., 'The TRUTH about ${selectedTopic.name}...')",
                "content": "The full script with timestamps.",
                "tags": ["tag1", "tag2"]
            }
        `;

        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();
        console.log("Raw Gemini Response:", text); // Debug log

        // Clean markdown code blocks if present
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Fix potential trailing commas or formatting issues if needed

        let scriptData;
        try {
            scriptData = JSON.parse(cleanJson);
        } catch (parseError) {
            // Fallback: Try extracting JSON if mixed with text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    scriptData = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    throw new Error("Failed to parse AI JSON output");
                }
            } else {
                throw new Error("AI did not return valid JSON");
            }
        }

        res.status(200).json({
            scripts: [{ ...scriptData, type }],
            status: 'success',
            model: 'gemini-2.5-flash'
        });

    } catch (error: any) {
        console.error('Gemini Generate Error:', error);
        res.status(500).json({
            error: `AI Error: ${error.message}`
        });
    }
}

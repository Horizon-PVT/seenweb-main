
// pages/api/admin/tools/trends.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST || 'twitter-trends-api.p.rapidapi.com';
        const woeid = req.query.woeid || '1'; // Default to Global (1)

        if (!apiKey) throw new Error('Missing RAPIDAPI_KEY in .env');

        // Fetch Trends via RapidAPI
        const response = await fetch(`https://${apiHost}/trends?woeid=${woeid}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('RapidAPI Error:', response.status, err);
            return res.status(response.status).json({ error: `RapidAPI Failed: ${err}` });
        }

        const data = await response.json();
        console.log('RapidAPI Response Structure:', JSON.stringify(data).substring(0, 200));

        let trends = [];
        if (Array.isArray(data) && data[0]?.trends) {
            trends = data[0].trends;
        } else if (data.trends) {
            trends = data.trends;
        } else if (Array.isArray(data)) {
            trends = data;
        }

        const formattedTrends = trends
            .map((t: any) => ({
                name: t.name || t.topic || "Unknown",
                url: t.url || `https://twitter.com/search?q=${encodeURIComponent(t.name || "")}`,
                tweet_volume: t.tweet_volume || t.volume || 0,
                query: t.query,
                timestamp: new Date().toISOString(),
                category: "Uncategorized" // Default
            }))
            .sort((a: any, b: any) => b.tweet_volume - a.tweet_volume)
            .slice(0, 50);

        // --- AI CATEGORIZATION (Gemini 2.5 Flash) ---
        if (process.env.GEMINI_API_KEY) {
            try {
                const { GoogleGenerativeAI } = require("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                // User requirement: Only use gemini-2.5-flash
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const topicList = formattedTrends.map((t: any) => t.name).join(", ");
                const prompt = `Classify these Twitter trends into exactly one of these categories: [News, Entertainment, Sports, Tech, Business, Politics, Other]. 
                Return strictly JSON object where keys are trend names and values are categories. 
                Trends: ${topicList}`;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text();

                // Clean markdown JSON if present
                const jsonStr = responseText.replace(/```json|```/g, "").trim();
                const categories = JSON.parse(jsonStr);

                // Merge categories
                formattedTrends.forEach((t: any) => {
                    if (categories[t.name]) {
                        t.category = categories[t.name];
                    }
                });
                console.log("AI Categorization Success");
            } catch (aiErr) {
                console.error("AI Categorization Failed (Non-fatal):", aiErr);
            }
        }

        res.status(200).json({
            trends: formattedTrends,
            region: woeid === '1' ? 'Worldwide' : 'United States'
        });

    } catch (error: any) {
        console.error('Trend API Error:', error);
        res.status(500).json({ error: error.message });
    }
}

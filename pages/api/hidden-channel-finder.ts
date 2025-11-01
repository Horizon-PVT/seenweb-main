// File: pages/api/hidden-channel-finder.ts (Backend cho Tìm Kênh Ẩn)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

// Định nghĩa kiểu dữ liệu Output (hoặc import)
interface ChannelData { name: string; url: string; subscribers: string; videoCount: string; growthMetric: string; coreStrengths: string[]; }
interface VideoData { title: string; url: string; viralRatio: string; viralStructure: string[]; }
interface OutputData { risingChannels: ChannelData[]; trendingVideos: VideoData[]; upcomingTrends: string[]; }
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
    const { seedQuery, minSubs, maxSubs, minVideos, growthVelocity, nicheCompetition, outputLanguage } = req.body;

    if (!seedQuery || outputLanguage === undefined) {
        return res.status(400).json({ error: "Thiếu seedQuery hoặc outputLanguage." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    const competitionText = nicheCompetition === 0 ? "Thấp" : "Trung bình";

    // --- Copy Prompt từ HiddenChannelFinderTool.tsx ---
    const prompt = `You are "Gnosis Portal," a master AI for uncovering hidden YouTube trends and channels, operating in "ORACLE EYE" mode. Use Google Search to find real-time data that closely matches the user's precise filters.

    **CRITICAL INSTRUCTIONS**:
    1. Your response MUST be a single, valid JSON object. Do not include any text outside of the JSON structure. Do not use markdown like \`\`\`json.
    2. All text content in the JSON MUST be in this language: "${outputLanguage}".
    3. Provide estimations for subscriber and video counts based on your search findings. Prefix these estimations with a tilde (~).

    **ORACLE EYE Search Parameters**:
    - Seed Query/Niche: "${seedQuery}"
    - Subscriber Range: Between ${minSubs || 'any'} and ${maxSubs || 'any'} subscribers.
    - Growth Velocity: Find channels with approximately ${growthVelocity} growth in views/subs over the last 30 days.
    - Minimum Videos: The channel should have at least ${minVideos || 'any'} videos.
    - Niche Competition: Look for content in niches with ${competitionText} competition.

    **JSON Structure to Follow**:
    {
      "risingChannels": [
        {
          "name": "Channel name found via search",
          "url": "Direct URL to the YouTube channel found via search",
          "subscribers": "Estimated subscriber count (e.g., '~8,500 Subs')",
          "videoCount": "Estimated total video count (e.g., '~25 Videos')",
          "growthMetric": "Example: '+280% views in 30 days'",
          "coreStrengths": ["List 2-3 key success factors"]
        }
      ],
      "trendingVideos": [
        {
          "title": "Video title found via search",
          "url": "Direct URL to the video",
          "viralRatio": "Calculated Viral Ratio (Views/Subs), e.g., '8.5x'",
          "viralStructure": ["List 3 factors that made this video successful"]
        }
      ],
      "upcomingTrends": ["Predict 3-5 potential explosive topics for the next 60 days based on search data"]
    }

    Generate a maximum of 5 rising channels and 5 trending videos that best fit the ORACLE EYE parameters. Now, activate the Gnosis Portal and return the JSON.`;
    // --- Hết Prompt ---


    const ai = new GoogleGenAI({ apiKey });
    // Model này có thể cần grounding (search)
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // Hoặc model hỗ trợ grounding tốt hơn
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Bật grounding
      },
    });

    const rawText = response.text.trim();
    const jsonMatch = rawText.match(/{.*}|\[.*]/s); // Cố gắng trích xuất JSON

    if (!jsonMatch) {
        console.error("Gemini response did not contain valid JSON (Hidden Channel):", rawText);
        throw new Error("Phản hồi từ AI không chứa JSON hợp lệ.");
    }

    const jsonString = jsonMatch[0];
    let parsedOutput: OutputData;
    try {
        parsedOutput = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("Lỗi parse JSON từ Gemini (Hidden Channel):", jsonString);
        throw new Error("Phản hồi từ AI không phải là JSON hợp lệ.");
    }

    // Kiểm tra cấu trúc cơ bản
    if (!parsedOutput.risingChannels || !parsedOutput.trendingVideos || !parsedOutput.upcomingTrends) {
         throw new Error("Phản hồi AI không tuân theo cấu trúc JSON được yêu cầu.");
    }

    res.status(200).json(parsedOutput);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/hidden-channel-finder:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
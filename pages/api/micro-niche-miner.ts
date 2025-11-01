// File: pages/api/micro-niche-miner.ts (Backend cho Micro Niche Miner)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

// Định nghĩa kiểu Output (hoặc import)
interface NicheData { nicheName: string; overallScore: number; competitionScore: number; searchVolumeScore: number; monetizationScore: number; pioneerVideoTopics: string[]; miningScript: { tone: string; frequency: string; monetizationGoal: string; }; lowFloorChannels: { name: string; url: string; }[]; }
interface OutputData { topNiches: NicheData[]; saturatedNichesWarning: string[]; }
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
    const { macroNiche, competition, searchVolume, monetization, outputLanguage } = req.body;

    if (!macroNiche || competition === undefined || searchVolume === undefined || monetization === undefined || !outputLanguage) {
        return res.status(400).json({ error: "Thiếu thông tin đầu vào." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // --- Copy Prompt từ handleSubmit của MicroNicheMinerTool.tsx ---
    const competitionText = competition <= 25 ? 'Very Low' : 'Low';
    const searchVolumeText = searchVolume < 60 ? 'Medium' : 'High';
    const monetizationText = monetization < 60 ? 'Low' : 'High';

    const prompt = `You are a "Micro Niche Miner" AI, an expert at identifying high-potential, low-competition YouTube niches. Your task is to use Google Search to find real-time data and generate a detailed analysis based on the user's criteria.

    **CORE MANDATE**: Your absolute primary goal is to find niches that EXACTLY match the user's filter criteria. A "golden niche" is defined as having the lowest possible competition score and the highest possible search volume and monetization scores. You must strictly adhere to this definition.

    **CRITICAL INSTRUCTIONS**:
    1. Your response MUST be a single, valid JSON object. Do not include any text outside the JSON structure or use markdown formatting.
    2. All text content in the JSON MUST be in this language: "${outputLanguage}".

    **Mining Parameters**:
    - Macro Niche: "${macroNiche}"
    - Strict Competition Level Filter: "${competitionText}" (0-100 score, lower is better)
    - Strict Search Volume Filter: "${searchVolumeText}" (0-100 score, higher is better)
    - Strict Monetization Potential Filter: "${monetizationText}" (0-100 score, higher is better)

    **JSON Structure to Follow (STRICT ADHERENCE REQUIRED)**:
    {
      "topNiches": [
        {
          "nicheName": "The specific micro niche name",
          "overallScore": 9.2, // Calculated based on the other scores, prioritizing low competition and high volume.
          "competitionScore": 15, // CRITICAL: This score (0-100) MUST align with the user's '${competitionText}' request. Aim for a score under ${competition + 5}.
          "searchVolumeScore": 85, // CRITICAL: This score (0-100) MUST align with the user's '${searchVolumeText}' request. Aim for a score above ${searchVolume - 5}.
          "monetizationScore": 70, // CRITICAL: This score (0-100) MUST align with the user's '${monetizationText}' request. Aim for a score above ${monetization - 5}.
          "pioneerVideoTopics": [ "Video Title 1", "Video Title 2", "Video Title 3", "Video Title 4", "Video Title 5", "Video Title 6", "Video Title 7", "Video Title 8", "Video Title 9", "Video Title 10"],
          "miningScript": { "tone": "...", "frequency": "...", "monetizationGoal": "..." },
          "lowFloorChannels": [ { "name": "...", "url": "..." } ]
        }
      ],
      "saturatedNichesWarning": [ "Saturated Niche 1", "Saturated Niche 2" ]
    }

    Generate exactly 10 top niches that strictly fit the parameters. Now, activate the Micro Niche Miner and return the complete JSON analysis.`;
    // --- Hết Prompt ---


    const ai = new GoogleGenAI({ apiKey });
    // Model này cần grounding
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest", // Hoặc model phù hợp
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Bật grounding
        // Không cần responseSchema vì prompt yêu cầu JSON rõ ràng
      },
    });

    const rawText = response.text.trim();
    const jsonMatch = rawText.match(/{.*}|\[.*]/s); // Trích xuất JSON

    if (!jsonMatch) {
        console.error("Gemini response did not contain valid JSON (Micro Niche):", rawText);
        throw new Error("Phản hồi từ AI không chứa JSON hợp lệ.");
    }

    const jsonString = jsonMatch[0];
    let parsedOutput: OutputData;
    try {
        parsedOutput = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("Lỗi parse JSON từ Gemini (Micro Niche):", jsonString);
        throw new Error("Phản hồi từ AI không phải là JSON hợp lệ.");
    }

    // Kiểm tra cấu trúc cơ bản
    if (!parsedOutput.topNiches || !parsedOutput.saturatedNichesWarning) {
        throw new Error("Phản hồi AI không tuân theo cấu trúc JSON được yêu cầu.");
    }

    res.status(200).json(parsedOutput);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/micro-niche-miner:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
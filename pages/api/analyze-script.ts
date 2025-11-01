// File: pages/api/analyze-script.ts (Backend cho Phân tích kịch bản)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from "@google/genai"; // Cần Type cho schema

interface AnalyzeResponse {
  prompts: string[];
}
interface ErrorResponse { error: string; }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { script } = req.body;

    if (!script) {
        return res.status(400).json({ error: "Thiếu nội dung kịch bản (script)." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // --- Copy Prompt từ handleAnalyzeScript ---
    const analysisPrompt = `You are an expert film director AI specializing in creating visual concepts from scripts. Your task is to analyze the following script and generate a series of detailed image prompts for key scenes, ensuring character consistency.

    **CRITICAL INSTRUCTIONS**:
    1.  **Identify Main Characters**: First, identify the main characters and create a consistent physical description for each. This is crucial for visual continuity.
    2.  **Identify Key Scenes**: Break down the script into key visual moments that need an accompanying image.
    3.  **Generate Prompts**: For each key scene, create a detailed, high-quality image generation prompt. Each prompt MUST reference the consistent character descriptions you identified. The prompt should specify shot type (e.g., close-up, wide shot), action, emotion, and setting.
    4.  **Output Format**: You MUST return a single, valid JSON object with the following structure: \`{ "prompts": ["prompt 1", "prompt 2", ...] }\`. Do not include any other text or markdown.

    **Script to Analyze**:
    """
    ${script}
    """

    Now, perform the analysis and return the JSON output.`;
    // --- Hết Prompt ---

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // Model phù hợp cho phân tích text
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonString = response.text.trim();
    let parsedOutput: AnalyzeResponse;
    try {
        parsedOutput = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("Lỗi parse JSON từ Gemini (Analyze Script):", jsonString);
        throw new Error("Phản hồi từ AI không phải là JSON hợp lệ.");
    }

    if (!parsedOutput.prompts) {
         throw new Error("Phản hồi AI không chứa trường 'prompts'.");
    }

    res.status(200).json(parsedOutput); // Trả về { prompts: [...] }

  } catch (err: any) {
    console.error("Lỗi trong API route /api/analyze-script:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
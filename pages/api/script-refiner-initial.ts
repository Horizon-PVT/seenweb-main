// File: pages/api/script-refiner-initial.ts (Backend lần đầu)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from "@google/genai"; // Cần Type cho schema

// Định nghĩa schema JSON mà AI phải trả về
const refinerSchema = {
  type: Type.OBJECT,
  properties: {
    refinedScript: { type: Type.STRING, description: "The completely rewritten script based on instructions." },
    diffScript: { type: Type.STRING, description: "HTML diff comparing original and refined, using <ins> and <del> tags." },
    metrics: {
      type: Type.OBJECT,
      properties: {
        uniqueness: { type: Type.STRING, description: "Uniqueness score (e.g., '85% Unique')." },
        similarity: { type: Type.STRING, description: "Similarity score (e.g., '15% Similar')." },
        readTime: { type: Type.STRING, description: "Estimated read time (e.g., 'Approx. 5 minutes')." },
        wordCount: { type: Type.NUMBER, description: "Word count of the refined script." }
      }
    }
  }
};

// Định nghĩa kiểu dữ liệu Output (hoặc import)
interface OutputData {
  refinedScript: string;
  diffScript: string;
  metrics: {
    uniqueness: string;
    similarity: string;
    readTime: string;
    wordCount: number;
  };
}
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
    const { originalScript, rewriteLevel, optimizeGoal, language, initialChatRequest } = req.body;

    if (!originalScript || !rewriteLevel || !optimizeGoal || !language) {
        return res.status(400).json({ error: "Thiếu thông tin đầu vào." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // --- Copy Prompt từ handleSubmit của ScriptRefinerTool.tsx ---
    const prompt = `You are a "Script Refiner" AI. Rewrite the following text based on the user's instructions and return a JSON object matching the schema.

    **Original Text**:
    """
    ${originalScript}
    """

    **Instructions**:
    - Rewrite Level: ${rewriteLevel} (Minor changes, Standard rewrite, or Complete reimagination)
    - Optimization Goal: ${optimizeGoal} (Improve Clarity, Engagement, or SEO)
    - Language: ${language === 'Original' ? 'Keep the original language' : `Translate to ${language}`}
    - Additional User Guidance: "${initialChatRequest || 'None'}"

    **Task**:
    1. Generate the 'refinedScript'.
    2. Generate a 'diffScript' comparing the original and refined versions, using standard HTML <ins> for additions and <del> for deletions. Ensure correct HTML structure.
    3. Calculate the following 'metrics': uniqueness, similarity, readTime, wordCount.

    Return ONLY the single JSON object matching the schema.`;
    // --- Hết Prompt ---

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // Model hỗ trợ JSON response
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: refinerSchema, // Áp dụng schema
      },
    });

    const jsonString = response.text.trim();
    let parsedOutput: OutputData;
    try {
        parsedOutput = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("Lỗi parse JSON từ Gemini (Refiner Initial):", jsonString);
        throw new Error("Phản hồi từ AI không phải là JSON hợp lệ.");
    }

    // Kiểm tra cấu trúc cơ bản
    if (!parsedOutput.refinedScript || !parsedOutput.diffScript || !parsedOutput.metrics) {
        throw new Error("Phản hồi AI không tuân theo cấu trúc JSON được yêu cầu.");
    }

    res.status(200).json(parsedOutput);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/script-refiner-initial:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
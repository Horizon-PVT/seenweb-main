// File: pages/api/veocity-analyze.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from "@google/genai";

interface Scene { originalText: string; prompt: string; }
interface AnalysisResponse { masterCharacterPrompt: string; scenes: Scene[]; }
interface ErrorResponse { error: string; }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse | ErrorResponse>
) {
  if (req.method !== 'POST') { return res.status(405).json({ error: `Method ${req.method} Not Allowed` }); }
  try {
    const { script, userApiKey } = req.body;
    if (!script) { return res.status(400).json({ error: "Thiếu kịch bản (script)." }); }
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) { return res.status(500).json({ error: "Lỗi cấu hình API Key." }); }
    const ai = new GoogleGenAI({ apiKey });

    // Step 1: Create Master Character Prompt
    const charPrompt = `Phân tích kịch bản sau và tạo một "master prompt" chi tiết để mô tả nhân vật chính (hoặc các nhân vật) một cách nhất quán. Mô tả này phải bao gồm ngoại hình, quần áo, và phong cách chung. Chỉ trả về phần prompt mô tả. Kịch bản: """${script}"""`;
    let charResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: charPrompt });
    const generatedMasterPrompt = charResponse.text.trim();

    // Step 2: Break script into scenes
    const scenePrompt = `Dựa vào kịch bản sau, hãy chia nó thành các cảnh quay (scenes) logic, mỗi cảnh không quá 8 giây. Với mỗi cảnh, hãy tạo một prompt mô tả hành động, bối cảnh, và biểu cảm. KHÔNG mô tả nhân vật, chỉ tập trung vào hành động. Trả về một mảng JSON chứa các đối tượng có key "originalText" (trích đoạn kịch bản gốc) và "prompt" (prompt cho cảnh đó). Kịch bản: """${script}"""`;
    let sceneResponse = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: scenePrompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { originalText: { type: Type.STRING }, prompt: { type: Type.STRING } } } } }
    });
    const parsedScenes: Scene[] = JSON.parse(sceneResponse.text.trim());

    res.status(200).json({ masterCharacterPrompt: generatedMasterPrompt, scenes: parsedScenes });
  } catch (err: any) {
    console.error("Lỗi trong API route /api/veocity-analyze:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
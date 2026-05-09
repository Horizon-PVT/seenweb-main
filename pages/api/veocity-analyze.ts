// File: pages/api/veocity-analyze.ts (Bản Fix CUỐI: Thống nhất Model 2.5 Flash + Character Consistency)

import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from '@google/genai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Corrected path
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

interface Scene { originalText: string; prompt: string; }
interface AnalysisResponse { masterCharacterPrompt: string; scenes: Scene[]; }
interface ErrorResponse { error: string; }

// Hàm phụ trợ: Gọi AI để phát hiện ngôn ngữ
async function detectLanguage(ai: GoogleGenAI, script: string): Promise<string> {
  const detectionPrompt = `Analyze the following script and identify the main language used. Respond ONLY with the language name (e.g., English, Vietnamese, Spanish). Script: """${script.substring(0, 500)}"""`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // ĐÃ SỬA: Dùng model thống nhất
    contents: detectionPrompt
  });
  return response.text?.trim() || "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse | ErrorResponse>
) {
  if (req.method !== 'POST') { return res.status(405).json({ error: `Method ${req.method} Not Allowed` }); }

  // 🔐 Authentication check
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này.' });
  }

  // 🛡️ STRICT QUOTA CHECK
  try {
    await checkUserQuota((session.user as any).id, 'velocity');
  } catch (error: any) {
    if (error.message === 'PLAN_LOCKED' || error.message === 'FREE_QUOTA_EXCEEDED') {
      return res.status(403).json({ error: error.message });
    }
    return res.status(403).json({ error: error.message });
  }

  try {
    const { script, userApiKey } = req.body;
    if (!script) { return res.status(400).json({ error: "Thiếu kịch bản (script)." }); }


    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) { return res.status(500).json({ error: "Lỗi cấu hình API Key." }); }

    const ai = new GoogleGenAI({ apiKey });

    // --- BƯỚC MỚI: PHÁT HIỆN NGÔN NGỮ (Dùng 2.5-flash) ---
    const outputLanguage = await detectLanguage(ai, script);
    console.log(`Kodaflow AI detected input language: ${outputLanguage}`);

    // --- BƯỚC 1 & 2: TẠO PROMPT VỚI NGÔN NGỮ ĐÃ PHÁT HIỆN (ENFORCE CONSISTENCY) ---
    const analysisPrompt = `
      Bạn là Đạo diễn Phim AI. Nhiệm vụ của bạn là chuyển đổi kịch bản sau thành các Prompt tạo video chuyên nghiệp cho Veo3, với TÍNH NHẤT QUÁN NHÂN VẬT TUYỆT ĐỐI.

      YÊU CẦU QUAN TRỌNG:
      1. Ngôn ngữ Output: ${outputLanguage}.
      2. Master Prompt: Tạo mô tả ngắn gọn ngoại hình các nhân vật (Ngôn ngữ: ${outputLanguage}). LÀM CHO NÓ CHI TIẾT (tuổi, quần áo, phong cách cố định).
      3. Chia cảnh: Chia kịch bản thành các cảnh quay (4-8s). MỖI CẢNH PHẢI NHẤT QUÁN VỚI MASTER PROMPT.

      QUY TẮC BẮT BUỘC CHO NHẤT QUÁN (ENFORCE CONSISTENCY):
      - Trong MỖI "prompt" cảnh: BẮT ĐẦU bằng [MASTER CHARACTER PROMPT] (copy nguyên văn), sau đó là LỜI THOẠI GỐC, dấu hai chấm (:), và mô tả hình ảnh (KHÔNG thay đổi ngoại hình nhân vật).
      - Ví dụ: "[MASTER: Anh Minh là chàng trai 28 tuổi, tóc đen ngắn, mặc sơ mi trắng, đeo kính cận] Chị Lan ơi, em vừa đọc báo... : Close-up của Anh Minh (giữ nguyên ngoại hình master) mỉm cười tự tin, chỉ tay vào tờ báo.
      - KHÔNG được thay đổi ngoại hình: Luôn tham chiếu master để Veo3 match character qua các frame.
      - Lời thoại (Dialogue): Trường "prompt" PHẢI BẮT ĐẦU bằng LỜI THOẠI GỐC, sau đó là dấu hai chấm (:) và mô tả hình ảnh bằng ${outputLanguage}.

      KỊCH BẢN GỐC: """${script}"""
      
      OUTPUT JSON:
      Trả về kết quả JSON với cấu trúc sau:
      {
        "masterCharacterPrompt": "Mô tả ngắn gọn ngoại hình các nhân vật chính (Ngôn ngữ: ${outputLanguage}).",
        "scenes": [
          {
            "originalText": "Lời thoại gốc",
            "prompt": "Prompt hình ảnh chi tiết với MASTER injected (Ngôn ngữ: ${outputLanguage})"
          }
        ]
      }
    `;

    // Gọi AI Phân tích (Dùng 2.5-flash)
    let sceneResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2  // Thêm: Giảm randomness để consistent hơn
      }
    });

    // Xử lý và làm sạch JSON
    let jsonText = sceneResponse.text?.trim() || "";
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(jsonText);

    let masterPrompt = parsedData.masterCharacterPrompt || "Không có mô tả nhân vật chung.";
    let finalScenes = parsedData.scenes && Array.isArray(parsedData.scenes) ? parsedData.scenes : [];

    // --- LAYER 2: POST-PROCESS - Enforce consistency bằng code (Backup nếu AI quên) ---
    // Inject master vào mỗi prompt nếu chưa có
    finalScenes = finalScenes.map((scene: Scene) => ({
      originalText: scene.originalText,
      prompt: `${masterPrompt} ${scene.prompt}` // Prefix master để Veo3 match character
    }));

    // INCREMENT USAGE
    await incrementUserUsage((session.user as any).id, 'velocity');

    res.status(200).json({ masterCharacterPrompt: masterPrompt, scenes: finalScenes });

  } catch (err: any) {
    console.error("Lỗi API Veocity:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
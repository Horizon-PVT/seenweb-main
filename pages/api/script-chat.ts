// File: pages/api/script-chat.ts (Bản Sửa Lỗi Hoàn Chỉnh)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | ErrorResponse> // Trả về text hoặc lỗi
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { currentScript, chatRequest } = req.body;

    if (!currentScript || !chatRequest) {
        return res.status(400).json({ error: "Thiếu currentScript hoặc chatRequest." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // --- Copy Prompt từ handleChatSubmit ---
    // Đảm bảo dấu backtick ` ở đầu và cuối là đúng
    const prompt = `Bạn là một trợ lý biên kịch. Hãy chỉnh sửa kịch bản sau đây dựa trên yêu cầu của người dùng.
KỊCH BẢN HIỆN TẠI:
---
${currentScript}
---
YÊU CẦU CHỈNH SỬA CỦA NGƯỜI DÙNG: "${chatRequest}"
---
Hãy viết lại TOÀN BỘ kịch bản mới đã được chỉnh sửa theo yêu cầu. Vẫn giữ nguyên định dạng "DIALOGUE:" và "HƯỚNG DẪN ĐỌC:". Không thêm bất kỳ lời bình luận nào.`; // <--- Đảm bảo có dấu ` ở cuối

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Dùng model mạnh hơn
      contents: prompt,
    });

    const editedScriptText = response.text.trim();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(editedScriptText);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/script-chat:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
} // <--- Đảm bảo có dấu } này để đóng hàm handler
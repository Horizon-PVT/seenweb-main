// File: pages/api/script-writer.ts (Backend cho Viết Kịch Bản)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

interface ErrorResponse {
  error: string;
}

// Lưu ý: Gemini API trả về stream text, không phải JSON ở đây
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | ErrorResponse> // Trả về text hoặc lỗi
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { idea, goal, level, tone, style, length } = req.body;

    if (!idea || !goal || !level || !tone || !style || length === undefined) {
        return res.status(400).json({ error: "Thiếu thông tin đầu vào (idea, goal, level, tone, style, length)." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // --- Copy Prompt từ ScriptwriterTool.tsx ---
    // Lưu ý: Prompt này yêu cầu output dạng text, không phải JSON
    const prompt = `Bạn là một chuyên gia viết kịch bản YouTube bậc thầy. Đầu tiên, hãy xác định ngôn ngữ của 'Dữ Liệu Gốc' (Ý tưởng chính). Sau đó, hãy tạo ra một kịch bản BẰNG CHÍNH NGÔN NGỮ ĐÓ dựa trên các thông số sau:
    - Dữ Liệu Gốc (Ý tưởng chính): "${idea}"
    - Mục Tiêu: ${goal}
    - Cấp Độ Phức Tạp: ${level}
    - Tông Giọng: ${tone}
    - Phong Cách: ${style}
    - Độ dài video dự kiến: ${length} phút.

    QUAN TRỌNG: Đầu ra chỉ được chứa kịch bản ở định dạng "KỊCH BẢN ÂM THANH". Tuyệt đối chỉ bao gồm hai cột:
    1. DIALOGUE: Lời thoại hoặc lời dẫn của người nói.
    2. HƯỚNG DẪN ĐỌC: Chỉ dẫn về ngữ điệu, tốc độ, cảm xúc khi đọc (ví dụ: "nói nhanh, hào hứng", "chậm lại, nhấn mạnh").
    Không thêm bất kỳ định dạng nào khác. Bắt đầu ngay với kịch bản.`;
    // --- Hết Prompt ---

    const ai = new GoogleGenAI({ apiKey });

    // Sử dụng generateContent vì API route không dễ xử lý stream trực tiếp trả về client
    // Nếu cần stream, cách làm sẽ phức tạp hơn. Trước mắt lấy full text.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Hoặc model phù hợp
      contents: prompt,
    });

    const scriptText = response.text.trim();

    // Trả về kết quả dạng text
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(scriptText);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/script-writer:", err);
    // Đảm bảo trả về JSON lỗi nếu có lỗi
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
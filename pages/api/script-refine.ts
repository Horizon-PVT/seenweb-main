// File: pages/api/script-refine.ts (Bản Sửa Lỗi Hoàn Chỉnh)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

interface ErrorResponse {
  error: string;
}

// Định nghĩa lại kiểu dữ liệu languages để dùng trong code
const languages: { [key: string]: string } = { "en": "English", "es": "Spanish", "fr": "French", "de": "German", "zh-CN": "Chinese (Simplified)", "ja": "Japanese", "ko": "Korean", "ru": "Russian", "ar": "Arabic", "pt": "Portuguese" };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | ErrorResponse> // Trả về text hoặc lỗi
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { currentScript, type, tone, length, style, lang } = req.body; // Thêm style vào đây

    if (!currentScript || !type) {
        return res.status(400).json({ error: "Thiếu currentScript hoặc type." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    let prompt = ''; // Khởi tạo prompt rỗng

    // --- Xây dựng Prompt dựa trên 'type' ---
    if (type === 'refine') {
        if (!tone || length === undefined) return res.status(400).json({ error: "Thiếu tone hoặc length cho 'refine'." });
        // Đảm bảo dấu backtick ` ở đầu và cuối là đúng
        prompt = `Bạn là một chuyên gia biên kịch. Hãy tinh chỉnh lại kịch bản sau đây theo các thông số mới, nhưng cố gắng giữ lại nội dung cốt lõi.
Thông số mới: Tông giọng: ${tone}, Độ dài: Khoảng ${length} phút.
KỊCH BẢN HIỆN TẠI:
---
${currentScript}
---
Hãy viết lại TOÀN BỘ kịch bản đã được tinh chỉnh. Vẫn giữ nguyên định dạng "DIALOGUE:" và "HƯỚNG DẪN ĐỌC:". Không thêm lời bình luận.`; // <--- Đảm bảo có dấu ` ở cuối
    } else if (type === 'consistency') {
        // Đảm bảo dấu backtick ` ở đầu và cuối là đúng
        prompt = `Bạn là một biên tập viên kịch bản. Hãy rà soát và chỉnh sửa kịch bản sau để đảm bảo giọng văn, ngôn từ của người dẫn chuyện (hoặc các nhân vật) được thống nhất từ đầu đến cuối.
KỊCH BẢN HIỆN TẠI:
---
${currentScript}
---
Hãy viết lại TOÀN BỘ kịch bản đã được đồng nhất. Vẫn giữ nguyên định dạng "DIALOGUE:" và "HƯỚNG DẪN ĐỌC:". Không thêm lời bình luận.`; // <--- Đảm bảo có dấu ` ở cuối
    } else if (type === 'translate') {
        if (!lang) return res.status(400).json({ error: "Thiếu lang (ngôn ngữ đích) cho 'translate'." });
        const langName = languages[lang as keyof typeof languages] || lang;
        const originalTone = tone || 'không xác định';
        const originalStyle = style || 'không xác định'; // Sử dụng style đã lấy từ req.body

        // Đảm bảo dấu backtick ` ở đầu và cuối là đúng
        prompt = `Bạn là một dịch giả kịch bản chuyên nghiệp, chuyên về nội dung sáng tạo cho các nền tảng video. Nhiệm vụ của bạn là dịch kịch bản sau đây sang ngôn ngữ '${langName}' một cách tự nhiên, phù hợp với văn hóa bản địa.

YÊU CẦU CỐT LÕI: Không dịch một cách máy móc. Hãy điều chỉnh ngôn từ để giữ trọn vẹn Tông Giọng ('${originalTone}') và Phong Cách ('${originalStyle}') đã được xác định của kịch bản gốc (nếu có thể suy ra từ kịch bản). Phần 'HƯỚNG DẪN ĐỌC' cũng phải được dịch lại để phản ánh đúng chỉ dẫn về ngữ điệu trong ngôn ngữ đích.

Giữ nguyên định dạng hai cột: 'DIALOGUE:' và 'HƯỚNG DẪN ĐỌC:'.

KỊCH BẢN GỐC:
---
${currentScript}
---

Kịch bản đã dịch sang '${langName}':`; // <--- Đảm bảo có dấu ` ở cuối
    } else {
        return res.status(400).json({ error: "Loại hành động (type) không hợp lệ." });
    }
    // --- Hết xây dựng Prompt ---

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Hoặc model phù hợp
      contents: prompt,
    });

    const refinedScriptText = response.text.trim();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(refinedScriptText);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/script-refine:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
} // <--- Đảm bảo có dấu } này để đóng hàm handler
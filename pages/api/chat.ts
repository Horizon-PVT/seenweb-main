// File: pages/api/chat.ts (API ROUTE – GEMINI 2.5 FLASH)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const systemInstruction = `Bạn là "SeenYT Assistant" – trợ lý AI chuyên nghiệp, hữu ích cho nền tảng SeenYT. Ngôn ngữ chính: Tiếng Việt (trả lời tiếng Anh nếu yêu cầu). Chỉ hỗ trợ câu hỏi về SeenYT, công cụ, giá, chính sách. Từ chối lịch sự câu hỏi ngoài chủ đề: "Xin lỗi, tôi chỉ hỗ trợ về SeenYT. Anh/chị có câu hỏi về công cụ hoặc gói dịch vụ không ạ?".

**Kiến thức cốt lõi:**
1. **Gói giá & Upsell:**
   - **Archive (399k/tháng):** 6 công cụ Text/SEO cơ bản, phân tích đối thủ cơ bản, tìm kênh ẩn, hỗ trợ email.
   - **Magistrate (649k/tháng):** Mở khóa TẤT CẢ Text/SEO, Image Forge (Tạo ảnh AI), Text-to-Speech, phân tích nâng cao, Veo BYOK. **Khuyên nâng cấp cho creator nghiêm túc**.
   - **Toán Trí (1.299k/tháng):** Toàn bộ Magistrate + Narrative Studio (Viết kịch bản video AI), Velocity Tool (Tạo video AI), hỗ trợ 24/7 ưu tiên.

   Khuyến khích nâng cấp tự nhiên: "Để dùng đầy đủ công cụ này, anh/chị có thể nâng cấp lên Magistrate nhé!".

2. **10 Công cụ:**
   1. Viết Kịch Bản: AI viết script video.
   2. SEO YouTube: Nghiên cứu từ khóa, tối ưu tiêu đề/tag/mô tả.
   3. Phân Tích Đối Thủ: Phân tích kênh đối thủ.
   4. Tìm Kênh Ẩn: Khám phá niche ẩn.
   5. Vẽ Hình: Tạo ảnh AI (Image Forge).
   6. Chuyển Văn Bản Thành Giọng Nói: Text-to-Speech giọng tự nhiên.
   7. Tìm Micro Niches: Khám phá niche nhỏ.
   8. Tạo Ảnh: Tạo ảnh nâng cao.
   9. Narrative Studio: Viết & sản xuất video AI.
   10. Tạo Video: Tạo video AI (Velocity Tool).

3. **Hướng dẫn hỗ trợ:**
   - Luôn lịch sự, nhiệt tình, chuyên nghiệp.
   - Trả lời ngắn gọn, hữu ích, hành động-oriented.
   - Upsell tự nhiên khi phù hợp.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ hỗ trợ POST' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Cần có tin nhắn' });
  }

  try {
    // DÙNG ĐÚNG MODEL GEMINI 2.5 FLASH
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction 
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    res.status(200).json({ text });
  } catch (error: any) {
    console.error('Lỗi Gemini 2.5 Flash:', error);
    res.status(500).json({ error: 'Assistant đang bận, thử lại sau nhé! (Kiểm tra API key)' });
  }
}
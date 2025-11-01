// File: pages/api/veocity-start-generation.ts (Bản Cập Nhật - Xử lý lỗi 429)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

interface StartResponse { operationName: string; }
interface ErrorResponse { error: string; }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StartResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { finalPrompt, aspectRatio, userApiKey } = req.body;

  try {
    if (!finalPrompt || !aspectRatio) {
        return res.status(400).json({ error: "Thiếu prompt hoặc aspectRatio." });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Lỗi cấu hình API Key." });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Bắt đầu tác vụ, KHÔNG await kết quả cuối cùng
    const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio as any
        }
    });

    // Trả về operation name ngay lập tức
    res.status(200).json({ operationName: operation.name });

  } catch (err: any) {
    console.error("Lỗi trong API route /api/veocity-start-generation:", err);
    let errorMessage = `Lỗi từ máy chủ: ${err.message || "Không xác định"}`;

    // Kiểm tra mã lỗi 429
    if (err.status === 429 || (err.message && err.message.includes("quota"))) {
        errorMessage = "LỖI HẠN MỨC (429): API Key đã vượt quá giới hạn sử dụng hoặc chưa bật thanh toán cho dịch vụ Veo. Vui lòng kiểm tra trang quản lý API Key của bạn.";
        return res.status(500).json({ error: errorMessage });
    }

    res.status(500).json({ error: errorMessage });
  }
}
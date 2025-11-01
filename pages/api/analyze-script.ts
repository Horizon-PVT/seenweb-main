// pages/api/analyze-script.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Kiểu dữ liệu phản hồi từ AI / công cụ phân tích.
 */
interface AnalyzeResponse {
  title: string;
  summary: string;
  sentiment: string;
  keywords: string[];
  suggestions: string[];
}

/**
 * API: /api/analyze-script
 * Dùng để phân tích nội dung video / đoạn văn bản.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res
        .status(400)
        .json({ error: "Thiếu nội dung cần phân tích (content)" });
    }

    // 🧠 Gọi API phân tích (ở đây ví dụ, bạn thay bằng model AI thực tế)
    const response = await fetch("https://api-internal.seenweb.ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: content }),
    });

    // Kiểm tra phản hồi
    if (!response.ok) {
      const errText = await response.text();
      console.error("Analyze API error:", errText);
      return res
        .status(response.status)
        .json({ error: "Phân tích thất bại từ phía AI." });
    }

    // ✅ Sửa lỗi TypeScript: response.text có thể undefined
    const rawText = (await response.text()) || "";
    const jsonString = rawText.trim();

    let parsedOutput: AnalyzeResponse;

    try {
      parsedOutput = JSON.parse(jsonString);
    } catch (parseErr) {
      console.warn("Phản hồi không phải JSON hợp lệ, trả dữ liệu fallback.");
      parsedOutput = {
        title: "Không thể phân tích",
        summary: "AI không trả kết quả JSON hợp lệ.",
        sentiment: "unknown",
        keywords: [],
        suggestions: [],
      };
    }

    // ✅ Trả về kết quả
    return res.status(200).json({
      success: true,
      data: parsedOutput,
    });
  } catch (err: any) {
    console.error("Lỗi trong API /api/analyze-script:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Lỗi máy chủ không xác định.",
    });
  }
}

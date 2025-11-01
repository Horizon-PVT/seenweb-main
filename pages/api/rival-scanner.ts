// File: pages/api/rival-scanner.ts (Đây là Backend)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

// Định nghĩa kiểu dữ liệu trả về (tùy chọn nhưng nên có)
interface OutputData {
  competitorProfile?: { name: string };
  strategicWeaknesses?: string[];
  // ... thêm các trường khác nếu bạn cần kiểm tra
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OutputData | ErrorResponse> // Kiểu trả về có thể là dữ liệu hoặc lỗi
) {
  // 1. Chỉ chấp nhận gọi bằng 'POST'
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']); // Cho trình duyệt biết chỉ chấp nhận POST
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // 2. Lấy dữ liệu mà frontend (React) gửi lên
    const { targetUrl, scanScope, outputLanguage } = req.body;

    // Kiểm tra dữ liệu đầu vào (tùy chọn nhưng nên có)
    if (!targetUrl || !scanScope || !outputLanguage) {
        return res.status(400).json({ error: "Thiếu thông tin targetUrl, scanScope, hoặc outputLanguage trong yêu cầu." });
    }

    // 3. LẤY API KEY BÍ MẬT TỪ .env.local (An toàn 100%)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      // Không nên trả về lỗi này trực tiếp cho người dùng vì lý do bảo mật
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // 4. Copy y hệt logic prompt từ file RivalScannerTool.tsx cũ
    // (Bạn có thể copy prompt dài của bạn vào đây)
    const prompt = `You are an elite YouTube strategist AI, "Rival Scanner". Your mission is to use Google Search to find real-time, accurate information about the provided URL and then decode the opponent's strategy.

    **CRITICAL INSTRUCTIONS**:
    1. Your entire response MUST be a single, valid JSON object and nothing else. Do not add any text before or after the JSON block. Do not use markdown formatting like \`\`\`json.
    2. You MUST generate the entire analysis in the specified output language: "${outputLanguage}".

    **Analysis Parameters**:
    - Opponent's URL to search for and analyze: "${targetUrl}"
    - Scan Scope: "${scanScope}". 
        - If 'channel', analyze the 5 most recent videos and overall channel structure based on search results.
        - If 'video', focus solely on the single video URL provided based on search results.
        - If 'niche', analyze how the opponent fits into their market niche and find missing opportunities based on search results.

    **JSON Structure to Follow**:
    {
      "competitorProfile": { "name": "The channel or video name found via search" },
      "strategicWeaknesses": ["Exactly 3 major strategic weaknesses discovered"],
      "successSignals": ["Exactly 3 key success factors discovered"],
      "contentStructure": {
        "mainKeywords": ["Top 3 main keywords identified"],
        "seoEvaluation": "Brief evaluation of their description/tags usage"
      },
      "untappedNiches": ["Exactly 3 potential niches they are missing. If none are found or scope is not 'niche', this can be an empty array."],
      "counterAttackPlan": "A concise, actionable plan to outperform them."
    }

    Now, execute the analysis and provide the JSON output.`;


    // 5. Gọi Google AI từ máy chủ (an toàn)
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // Hoặc model bạn muốn dùng
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Sử dụng grounding nếu cần
      },
    });

    const jsonString = response.text.trim();
    // Cố gắng parse JSON, nếu lỗi thì báo lỗi rõ ràng
    let parsedOutput: OutputData;
    try {
        parsedOutput = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("Lỗi parse JSON từ Gemini:", jsonString);
        throw new Error("Phản hồi từ AI không phải là JSON hợp lệ.");
    }


    // 6. Trả kết quả về cho frontend
    res.status(200).json(parsedOutput);

  } catch (err: any) {
    // Ghi lại lỗi chi tiết trên server để debug
    console.error("Lỗi trong API route /api/rival-scanner:", err);
    // Trả về lỗi chung chung cho người dùng
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
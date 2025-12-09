// File: pages/api/narrative-studio.ts (Bản Sửa Lỗi mime_type)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type, GenerateImagesConfig, Modality } from "@google/genai";

interface SceneAnalysis {
  imagePrompt: string;
  narrationText: string;
}

interface AnalysisResponse {
  scenes: SceneAnalysis[];
}

interface ImageResponse {
    imageUrl: string; // Base64 string (data:image/jpeg;base64,...)
}

interface ErrorResponse { error: string; }

// Định nghĩa lại kiểu dữ liệu languages để dùng trong code
const languages: { [key: string]: string } = { "en": "English", "es": "Spanish", "fr": "French", "de": "German", "zh-CN": "Chinese (Simplified)", "ja": "Japanese", "ko": "Korean", "ru": "Russian", "ar": "Arabic", "pt": "Portuguese" };


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse | ImageResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
    return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
  }
  const ai = new GoogleGenAI({ apiKey });

  const { action, script, sceneCount, imageStyle, imagePrompt, aspectRatio = '3:4' } = req.body;

  try {
    if (action === 'analyze') {
      // --- Xử lý Phân tích Kịch bản ---
      if (!script || !imageStyle) {
        return res.status(400).json({ error: "Thiếu script hoặc imageStyle cho hành động 'analyze'." });
      }

      const prompt = `Bạn là một AI đạo diễn truyện tranh. Phân tích kịch bản sau đây và chia nó thành chính xác ${sceneCount || '8'} cảnh/khung hình. Với mỗi cảnh, hãy tạo:
      1.  'imagePrompt': Một lời nhắc (prompt) chi tiết để tạo ảnh theo phong cách '${imageStyle}'. Nếu phong cách là "SÁCH TÔ MÀU (LINE ART)", hãy tạo prompt cho ảnh nghệ thuật đường nét, trắng đen, rõ ràng, phù hợp để tô màu.
      2.  'narrationText': Lời thoại hoặc lời dẫn truyện tương ứng cho cảnh đó.
      Trả về một mảng JSON của các đối tượng với key 'imagePrompt' và 'narrationText'. Kịch bản gốc: """${script}"""`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT, // Trả về object có key 'scenes'
            properties: {
                scenes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            imagePrompt: { type: Type.STRING },
                            narrationText: { type: Type.STRING }
                        }
                    }
                }
            }
          }
        }
      });

      const jsonString = response.text.trim();
      let parsedOutput: { scenes: SceneAnalysis[] };
      try {
        parsedOutput = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Lỗi parse JSON từ Gemini (Narrative Analyze):", jsonString);
        throw new Error("Phản hồi phân tích từ AI không phải là JSON hợp lệ.");
      }

      if (!parsedOutput.scenes) {
         throw new Error("Phản hồi phân tích từ AI không chứa trường 'scenes'.");
      }

      res.status(200).json({ scenes: parsedOutput.scenes });

    } else if (action === 'generateImage') {
      // --- Xử lý Tạo Ảnh ---
      if (!imagePrompt) {
        return res.status(400).json({ error: "Thiếu imagePrompt cho hành động 'generateImage'." });
      }

      // *** SỬA LỖI Ở ĐÂY ***
      const config: GenerateImagesConfig = {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg', // Sửa từ 'jpeg' thành 'image/jpeg'
        aspectRatio: aspectRatio as any,
      };
      // *** HẾT SỬA LỖI ***

      // Gọi model trực tiếp:
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001', // Chỉ định model ở đây
        prompt: imagePrompt,
        config: config,
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        res.status(200).json({ imageUrl: imageUrl });
      } else {
        throw new Error("API generateImages không trả về hình ảnh nào.");
      }

    } else {
      return res.status(400).json({ error: "Hành động (action) không hợp lệ." });
    }

  } catch (err: any) {
    console.error(`Lỗi trong API route /api/narrative-studio (action: ${action}):`, err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
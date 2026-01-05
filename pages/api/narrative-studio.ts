// pages/api/narrative-studio.ts
// *** KHAI BÁO NÀY CẦN PHẢI Ở ĐẦU ĐỂ CHẠY TRÊN NODEJS ***
export const config = {
  runtime: 'nodejs',
};

import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type, GenerateImagesConfig } from "@google/genai";

interface SceneAnalysis {
  imagePrompt: string;
  narrationText: string;
}

interface AnalysisResponse {
  scenes: SceneAnalysis[];
  bookSummary: string; // THÊM TRƯỜNG NÀY
}

interface ImageResponse {
  imageUrl: string;
}

interface ErrorResponse { error: string; }

const languages: { [key: string]: string } = {
  "en": "English", "es": "Spanish", "fr": "French", "de": "German", "zh-CN": "Chinese (Simplified)",
  "ja": "Japanese", "ko": "Korean", "ru": "Russian", "ar": "Arabic", "pt": "Portuguese", "vi": "Vietnamese"
};

// Khởi tạo AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse | ImageResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "Thiếu GEMINI_API_KEY trong biến môi trường." });
  }

  const { action, storyIdea, style, language, numberOfScenes, imagePrompt, aspectRatio, coverPrompt } = req.body;

  if (action === 'analyze') {
    // --- Xử lý Phân tích Cảnh (Gemini) ---
    if (!storyIdea) {
      return res.status(400).json({ error: "Thiếu 'storyIdea' cho hành động 'analyze'." });
    }

    const lang = languages[language as string] || 'English';

    const prompt = `Bạn là chuyên gia tạo sách kể chuyện. Nhiệm vụ của bạn là chia câu chuyện sau thành ${numberOfScenes} cảnh VÀ tạo một TÓM TẮT HẤP DẪN (Blurb) dài khoảng 4-5 câu cho bìa sau của sách.
    Mỗi cảnh phải có một 'imagePrompt' (Lệnh tạo ảnh chi tiết) và 'narrationText' (Lời kể).
    - Ngôn ngữ: ${lang}.
    - Phong cách minh họa: ${style}.
    - Câu chuyện: "${storyIdea}".
    
    Yêu cầu:
    1. 'imagePrompt' phải chi tiết.
    2. 'narrationText' phải ngắn gọn.
    3. Trả về **CHỈ JSON** với cấu trúc sau. Đảm bảo toàn bộ nội dung trong JSON là hợp lệ:
    {
      "bookSummary": "string (Tóm tắt sách 4-5 câu)", 
      "scenes": [
        { "imagePrompt": "string", "narrationText": "string" },
        // ... ${numberOfScenes} scenes
      ]
    }`;

    const analysisSchema = {
      type: Type.OBJECT,
      properties: {
        bookSummary: { type: Type.STRING }, // FIELD MỚI
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              imagePrompt: { type: Type.STRING },
              narrationText: { type: Type.STRING },
            },
            required: ['imagePrompt', 'narrationText'],
          },
        },
      },
      required: ['bookSummary', 'scenes'],
    };


    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: analysisSchema,
        },
      });

      const cleanJson = (response.text?.replace(/```json|```/g, '') || '').trim();
      const parsedOutput: AnalysisResponse = JSON.parse(cleanJson);

      if (!parsedOutput.scenes || !parsedOutput.bookSummary) {
        throw new Error("Phản hồi phân tích từ AI không chứa trường 'scenes' hoặc 'bookSummary'.");
      }

      res.status(200).json({
        scenes: parsedOutput.scenes,
        bookSummary: parsedOutput.bookSummary // TRẢ VỀ TRƯỜNG MỚI
      });

    } catch (e: any) {
      console.error("Lỗi AI phân tích cảnh:", e);
      return res.status(500).json({ error: e.message || "Lỗi AI phân tích cảnh. Vui lòng kiểm tra lại prompt." });
    }

  } else if (action === 'generateImage') {
    // --- Xử lý Tạo Ảnh ---
    if (!imagePrompt || !aspectRatio) {
      return res.status(400).json({ error: "Thiếu imagePrompt hoặc aspectRatio." });
    }

    const config: GenerateImagesConfig = {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio as any,
    };

    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: config,
      });

      if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image) {
        const imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        res.status(200).json({ imageUrl: imageUrl });
      } else {
        throw new Error("API generateImages không trả về hình ảnh nào.");
      }
    } catch (e) {
      console.error("Lỗi tạo ảnh:", e);
      return res.status(500).json({ error: "Lỗi AI tạo ảnh. Đảm bảo prompt không vi phạm chính sách." });
    }

  } else if (action === 'generateCover') {
    // --- Xử lý Tạo Bìa Sách (Imagen) ---
    if (!coverPrompt) {
      return res.status(400).json({ error: "Thiếu coverPrompt cho hành động 'generateCover'." });
    }

    const finalPrompt = coverPrompt;

    const config: GenerateImagesConfig = {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      // Dùng 16:9 cho ảnh bìa nghệ thuật
      aspectRatio: '16:9',
    };

    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: config,
      });

      if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image) {
        const imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        res.status(200).json({ imageUrl: imageUrl });
      } else {
        throw new Error("API generateImages không trả về hình ảnh nào.");
      }
    } catch (e) {
      console.error("Lỗi tạo bìa:", e);
      return res.status(500).json({ error: "Lỗi AI tạo bìa. Đảm bảo prompt không vi phạm chính sách." });
    }

  } else {
    res.status(400).json({ error: "Hành động không hợp lệ." });
  }
}
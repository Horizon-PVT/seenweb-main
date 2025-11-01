// File: pages/api/image-forge.ts (Bản Sửa Lỗi Cú Pháp Gọi Model)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, GenerateImagesConfig, NegativePrompt, Modality } from "@google/genai";

interface ImageResponse {
  generatedImages: string[];
}
interface ErrorResponse { error: string; }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const {
        prompt,
        numImages = 1,
        aspectRatio = '16:9',
        negativePrompt,
        seed,
        referenceImageBase64,
        referenceImageMimeType
    } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Thiếu prompt." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    const ai = new GoogleGenAI({ apiKey });
    let imageUrls: string[] = [];

    // --- Logic gọi API (ĐÃ SỬA CÚ PHÁP) ---
    if (referenceImageBase64 && referenceImageMimeType) {
        // Dùng generateContent với model Vision
        const imagePart = { inlineData: { data: referenceImageBase64, mimeType: referenceImageMimeType } };
        const textPart = { text: prompt };

        // SỬA LỖI: Gọi model trực tiếp trong generateContent
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Chỉ định model ở đây
            contents: [{ parts: [imagePart, textPart] }],
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                imageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
        if (imageUrls.length === 0) {
             throw new Error("Model Vision không trả về hình ảnh nào.");
        }

    } else {
        // Dùng generateImages cho text-to-image
        const config: GenerateImagesConfig = {
            numberOfImages: Number(numImages) || 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio as any,
        };
        if (negativePrompt) config.negativePrompt = negativePrompt as NegativePrompt;
        if (seed && !isNaN(parseInt(seed))) config.seed = parseInt(seed);

        // SỬA LỖI: Gọi model trực tiếp trong generateImages
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001', // Chỉ định model ở đây
            prompt: prompt,
            config: config,
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
             imageUrls = response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        } else {
            throw new Error("API generateImages không trả về hình ảnh nào.");
        }
    }
    // --- Hết Logic gọi API ---

    res.status(200).json({ generatedImages: imageUrls });

  } catch (err: any) {
    console.error("Lỗi trong API route /api/image-forge:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
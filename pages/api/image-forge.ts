import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI, Modality, GenerateImagesConfig, NegativePrompt } from "@google/genai";

/** FIX 413: allow larger JSON bodies for base64 images */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

interface ImageResponse {
  generatedImages: string[];
}
interface ErrorResponse {
  error: string;
}

type Ref = { base64: string; mimeType: string };

function isValidImageMime(mime: any) {
  return typeof mime === "string" && mime.startsWith("image/");
}
function isLikelyBase64(b64: any) {
  return typeof b64 === "string" && b64.length > 50 && /^[A-Za-z0-9+/=]+$/.test(b64);
}
function clampInt(v: any, min: number, max: number, fallback: number) {
  const n = parseInt(String(v), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY." });

    const {
      prompt,
      aspectRatio = "16:9",
      numImages = 2,
      negativePrompt,
      seed,
      faceLock = true,
      styleRef,
      characterRefs,
    } = req.body || {};

    const safePrompt = typeof prompt === "string" ? prompt.trim() : "";
    const allowedRatios = new Set(["16:9", "1:1", "9:16"]);
    const ratio = allowedRatios.has(aspectRatio) ? aspectRatio : "16:9";
    const n = clampInt(numImages, 1, 4, 2);

    const ai = new GoogleGenAI({ apiKey });

    // Collect refs
    const style: Ref | null =
      styleRef?.base64 && styleRef?.mimeType && isLikelyBase64(styleRef.base64) && isValidImageMime(styleRef.mimeType)
        ? { base64: styleRef.base64, mimeType: styleRef.mimeType }
        : null;

    const chars: Ref[] = Array.isArray(characterRefs)
      ? characterRefs
          .slice(0, 3)
          .filter((r: any) => r?.base64 && r?.mimeType && isLikelyBase64(r.base64) && isValidImageMime(r.mimeType))
          .map((r: any) => ({ base64: r.base64, mimeType: r.mimeType }))
      : [];

    const hasRefs = !!style || chars.length > 0;

    // If refs exist => use Gemini image mode (best for consistency with references)
    if (hasRefs) {
      const parts: any[] = [];

      if (style) parts.push({ inlineData: { data: style.base64, mimeType: style.mimeType } });
      for (const c of chars) parts.push({ inlineData: { data: c.base64, mimeType: c.mimeType } });

      const instruction: string[] = [];
      instruction.push(safePrompt || "Generate a high-quality image using the references.");
      instruction.push(`ASPECT_RATIO: ${ratio}`);

      if (style) {
        instruction.push("STYLE_REF: Match overall tone, colors, lighting, and rendering style to the style reference.");
      }
      if (chars.length) {
        instruction.push("CHARACTER_REF: Preserve the character identity from the character reference images.");
        if (faceLock) {
          instruction.push(
            "FACE_LOCK: Strongly preserve the same identity (facial features, age range, vibe). Keep consistency across outputs."
          );
        }
      }
      if (typeof negativePrompt === "string" && negativePrompt.trim()) {
        instruction.push(`NEGATIVE: ${negativePrompt.trim()}`);
      }
      if (seed !== undefined && seed !== null && String(seed).trim() !== "") {
        instruction.push(`SEED: ${String(seed).trim()}`);
      }

      parts.push({ text: instruction.join("\n") });

      // One image per call => call n times
      const calls = Array.from({ length: n }, async () => {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: [{ parts }],
          config: { responseModalities: [Modality.IMAGE] },
        });

        const outParts = response.candidates?.[0]?.content?.parts || [];
        for (const p of outParts) {
          if (p.inlineData?.mimeType?.startsWith("image/") && p.inlineData?.data) {
            return `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`;
          }
        }
        throw new Error("Model không trả về ảnh (refs mode).");
      });

      const generatedImages = await Promise.all(calls);
      return res.status(200).json({ generatedImages });
    }

    // Otherwise => text-to-image with Imagen
    if (!safePrompt) return res.status(400).json({ error: "Thiếu prompt." });

    const configImg: GenerateImagesConfig = {
      numberOfImages: n,
      outputMimeType: "image/jpeg",
      aspectRatio: ratio as any,
    };

    if (typeof negativePrompt === "string" && negativePrompt.trim()) {
      configImg.negativePrompt = negativePrompt.trim() as NegativePrompt;
    }

    const parsedSeed = Number.isFinite(Number(seed)) ? parseInt(String(seed), 10) : undefined;
    if (parsedSeed !== undefined && !Number.isNaN(parsedSeed)) configImg.seed = parsedSeed;

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: safePrompt,
      config: configImg,
    });

    const imageUrls =
      response.generatedImages?.map((img) => `data:image/jpeg;base64,${img.image.imageBytes}`) || [];
    if (!imageUrls.length) throw new Error("Imagen không trả về ảnh.");

    return res.status(200).json({ generatedImages: imageUrls });
  } catch (err: any) {
    console.error("API /api/image-forge error:", err);
    return res.status(500).json({ error: err?.message || "Server error." });
  }
}

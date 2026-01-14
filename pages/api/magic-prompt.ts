import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

type Ok = { prompt: string };
type Err = { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 🔐 Authentication check
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Bạn cần đăng nhập để sử dụng tính năng này." });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY." });

    const { prompt, aspectRatio, numImages, hasStyleRef, characterCount } = req.body || {};
    const p = typeof prompt === "string" ? prompt.trim() : "";
    if (!p) return res.status(400).json({ error: "Thiếu prompt để magic." });

    const ai = new GoogleGenAI({ apiKey });

    const sys = [
      "You are an expert prompt engineer for image generation.",
      "Rewrite the user's Vietnamese prompt into a clearer, richer, professional prompt.",
      "Keep it concise but complete.",
      "Return ONLY the rewritten prompt text. No bullets, no quotes, no markdown.",
      "Do not mention policy or safety systems.",
      "Prefer cinematic, high-end commercial photography language when appropriate.",
    ].join(" ");

    const user = [
      `User prompt: ${p}`,
      `Constraints: aspectRatio=${aspectRatio || "16:9"}, numImages=${numImages || 2}`,
      `References: hasStyleRef=${!!hasStyleRef}, characterCount=${Number(characterCount) || 0}`,
      "If characterCount > 0, emphasize identity consistency and facial feature preservation.",
      "If hasStyleRef, emphasize matching tone/color/lighting/style.",
    ].join("\n");

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${sys}\n\n${user}` }] },
      ],
    });

    const text = resp.candidates?.[0]?.content?.parts?.map((x: any) => x.text).filter(Boolean).join("")?.trim();
    if (!text) return res.status(500).json({ error: "Magic prompt failed." });

    return res.status(200).json({ prompt: text });
  } catch (e: any) {
    console.error("magic-prompt error", e);
    return res.status(500).json({ error: e?.message || "Server error." });
  }
}

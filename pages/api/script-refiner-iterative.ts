// File: pages/api/script-refiner-iterative.ts (Backend chỉnh sửa nhanh)
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';
import { GoogleGenAI } from '@google/genai';

interface ErrorResponse { error: string; }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | ErrorResponse> // Chỉ trả về text
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Auth check
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = (session.user as any).id;

    // Quota check (PRO-only tool)
    try {
      await checkUserQuota(userId, 'script-refiner');
    } catch (error: any) {
      if (error.message === 'PLAN_LOCKED') {
        return res.status(403).json({ error: 'PLAN_LOCKED' });
      }
      if (error.message === 'FREE_QUOTA_EXCEEDED') {
        return res.status(403).json({ error: 'FREE_QUOTA_EXCEEDED' });
      }
      if (error.message === 'DAILY_QUOTA_EXCEEDED') {
        return res.status(403).json({ error: 'DAILY_QUOTA_EXCEEDED' });
      }
      throw error;
    }

    const { currentScript, iterativeChatRequest } = req.body;

    if (!currentScript || !iterativeChatRequest) {
      return res.status(400).json({ error: "Thiếu currentScript hoặc iterativeChatRequest." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // --- Copy Prompt từ handleIterativeSubmit ---
    const prompt = `You are an AI editor. Take the following script and modify it based on the user's request. Output ONLY the new, complete, modified script as plain text, without any commentary or formatting like markdown.

    **Current Script**:
    """
    ${currentScript}
    """

    **User's Edit Request**: "${iterativeChatRequest}"

    **New Script**:`;
    // --- Hết Prompt ---

    const ai = new GoogleGenAI({ apiKey });
    // Không cần stream, lấy full text
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Dùng model mạnh hơn
      contents: prompt,
    });

    const editedScriptText = response.text?.trim() || "";

    await incrementUserUsage(userId, 'script-refiner');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(editedScriptText);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/script-refiner-iterative:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
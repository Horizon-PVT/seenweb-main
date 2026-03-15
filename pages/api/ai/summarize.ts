import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 🔐 Authentication check
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        return res.status(401).json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này.' });
    }

    const userId = (session.user as any)?.id;

    try {
        // Enforce quota limits for summary tool
        await checkUserQuota(userId, 'script-writer'); // Use script-writer or similar tool limit

        const { transcript } = req.body;

        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        // Limit transcript length for API efficiency
        const maxChars = 50000;
        const cleanTranscript = transcript.substring(0, maxChars);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Bạn là một AI chuyên phân tích video YouTube. Hãy tạo một bản tóm tắt CHI TIẾT và CÓ GIÁ TRỊ từ kịch bản video sau.

YÊU CẦU:
1. **Tóm tắt chính (2-3 câu)**: Nội dung cốt lõi của video
2. **Các điểm chính (Key Points)**: 
   - Liệt kê 5-7 điểm quan trọng nhất
   - Mỗi điểm viết 1-2 câu giải thích
   - Dùng bullet points (-)
3. **Insights/Học được gì**:
   - 3 bài học/insight chính
   - Viết ngắn gọn, dễ hiểu
4. **Tone**: Chuyên nghiệp nhưng thân thiện, phù hợp với YouTuber Việt Nam

TRANSCRIPT:
${cleanTranscript}

TÓM TẮT:`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        // Increment usage after success
        await incrementUserUsage(userId, 'script-writer');

        return res.status(200).json({
            success: true,
            summary: summary.trim(),
            transcriptLength: transcript.length,
            model: 'gemini-1.5-flash'
        });

    } catch (error: any) {
        console.error('[API Summary Error]:', error);
        
        if (error.message === 'PLAN_LOCKED' || error.message === 'FREE_QUOTA_EXCEEDED' || error.message === 'DAILY_QUOTA_EXCEEDED') {
             return res.status(403).json({ error: 'REQUIRE_UPGRADE', message: 'Vui lòng nâng cấp gói dịch vụ để dùng tiếp!' });
        }
        
        return res.status(500).json({
            error: 'Failed to generate summary',
            details: error.message
        });
    }
}

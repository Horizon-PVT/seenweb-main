import { NextApiRequest, NextApiResponse } from 'next';
export const maxDuration = 60; // Cứu cánh lỗi Vercel Timeout (504 An error occurred)
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withCache, CACHE_PREFIXES } from '@/lib/cache';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache TTL: 7 days (same as default)
const NICHE_CACHE_TTL = 7 * 24 * 60 * 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Auth Check
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Quota Check — niche-engine is PRO-only
    const userId = (session.user as any)?.id;
    if (!userId) {
        return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ.' });
    }

    try {
        await checkUserQuota(userId, 'niche-engine');
    } catch (error: any) {
        if (error.message === 'PLAN_LOCKED') {
            return res.status(403).json({ error: 'PLAN_LOCKED', message: 'Tính năng này chỉ dành cho gói PRO. Vui lòng nâng cấp!' });
        }
        if (error.message === 'FREE_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'FREE_QUOTA_EXCEEDED', message: 'Bạn đã hết lượt dùng thử miễn phí.' });
        }
        if (error.message === 'DAILY_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'DAILY_QUOTA_EXCEEDED', message: 'Bạn đã hết lượt sử dụng hôm nay.' });
        }
        return res.status(500).json({ error: 'Lỗi kiểm tra quyền truy cập.' });
    }

    const { action, nicheSlug, nicheTitle, context } = req.body;

    if (!action || !nicheSlug) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Use gemini-2.5-flash (same as other tools)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = '';
        let cacheInput = '';

        if (action === 'ANALYZE') {
            cacheInput = `niche:analyze:${nicheSlug}`;
            prompt = `
                Đóng vai chuyên gia YouTube Strategist (triệu sub).
                
                Nhiệm vụ: Phân tích NGÁCH "${nicheTitle}" (Slug: ${nicheSlug}) để sản xuất Long-form Video (15-30 phút).
                
                Hãy trả về kết quả dưới dạng MARKDOWN, cấu trúc gồm 3 phần:
                
                ### 1. Tại sao ngách này WIN? (Cơ hội & Tiềm năng)
                - Giải thích tâm lý người xem.
                - CPM ước tính (thấp/trung bình/cao).
                - Đối thủ cạnh tranh (Red/Blue Ocean).
                
                ### 2. Chân dung khán giả (Avatar)
                - Họ là ai? (Tuổi, sở thích).
                - Nỗi đau/Mong muốn của họ là gì?
                
                ### 3. Format Video chiến thắng (Winning Format)
                - Cấu trúc video đề xuất (VD: Listicle, Storytelling, Vs...).
                - B-roll nên dùng gì?
                - Tone giọng (Voiceover) nên thế nào?
                
                Yêu cầu: Ngắn gọn, súc tích, đi thẳng vào vấn đề. Tối đa 400 từ.
            `;
        }
        else if (action === 'GENERATE_SCRIPT') {
            // For script, we use a combination of nicheSlug + a hash of context for uniqueness
            // But typically the same niche produces similar scripts, so just use slug
            cacheInput = `niche:script:${nicheSlug}`;
            prompt = `
                Dựa trên phân tích sau:
                ---
                ${context}
                ---
                
                Nhiệm vụ: Tạo GÓI TRIỂN KHAI VIDEO HOÀN CHỈNH cho ngách "${nicheTitle}".
                
                Trả về MARKDOWN chi tiết:
                
                ## 1. Metadata Vàng
                - **Tiêu đề (3 options - High CTR):**
                - **Concept Thumbnail:** Mô tả chi tiết hình ảnh, text trên thumb.
                
                ## 2. Kịch Bản Chi Tiết (Outline theo phút)
                - **00:00 - 00:45 (HOOK):** Kịch bản lời thoại gây tò mò cực mạnh + hình ảnh (Visual cues).
                - **00:45 - 02:00 (Intro & Context):** ...
                - **02:00 - End (Body):** Chia thành các chương (Chapter) cụ thể.
                
                ## 3. Resource Kit (Cho AI Tool)
                - **Prompt tạo ảnh (Midjourney/Flux):** (Tiếng Anh)
                - **Gợi ý Visual/Stock:** Nguồn nên tìm.
                
                ## 4. Checklist Sản Xuất
                - Trước khi quay/edit.
                - Checklist tối ưu SEO khi upload.
            `;
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        // Use Redis cache wrapper - will return cached result if exists
        const content = await withCache(
            CACHE_PREFIXES.GENERAL,
            cacheInput,
            async () => {
                console.log(`[NicheEngine] Cache MISS - Calling Gemini for ${action}:${nicheSlug}`);
                const result = await model.generateContent(prompt);
                const response = result.response;
                return response.text();
            },
            NICHE_CACHE_TTL
        );

        // Track usage
        await incrementUserUsage(userId, 'niche-engine');

        console.log(`[NicheEngine] Returning content for ${action}:${nicheSlug}`);
        return res.status(200).json({ content });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ error: "Failed to generate content" });
    }
}

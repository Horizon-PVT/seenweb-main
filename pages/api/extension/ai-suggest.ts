// pages/api/extension/ai-suggest.ts - AI Quick Actions for Extension
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from "@google/genai";

type ActionType = 'generate-titles' | 'optimize-description' | 'suggest-tags';

interface RequestBody {
    action: ActionType;
    videoData: {
        title: string;
        description?: string;
        tags?: string[];
        niche?: string;
    };
}

interface TitleSuggestion {
    text: string;
    reason: string;
    viralScore: number;
}

interface DescriptionSuggestion {
    text: string;
    improvements: string[];
}

interface TagSuggestion {
    text: string;
    category: 'high-intent' | 'mid-tail' | 'trending' | 'related';
    searchVolume: 'high' | 'medium' | 'low';
}

type AIResponse =
    | { type: 'titles'; suggestions: TitleSuggestion[] }
    | { type: 'description'; suggestion: DescriptionSuggestion }
    | { type: 'tags'; suggestions: TagSuggestion[] };

// --- SCHEMAS ---
const titleSchema = {
    type: Type.OBJECT,
    properties: {
        titles: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    viralScore: { type: Type.NUMBER }
                }
            }
        }
    }
};

const descriptionSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING },
                improvements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        }
    }
};

const tagsSchema = {
    type: Type.OBJECT,
    properties: {
        tags: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    category: { type: Type.STRING },
                    searchVolume: { type: Type.STRING }
                }
            }
        }
    }
};

// --- PROMPTS ---
function getTitlePrompt(videoData: RequestBody['videoData']): string {
    return `Bạn là chuyên gia SEO YouTube hàng đầu. Phân tích video sau và tạo 5 tiêu đề viral:

**THÔNG TIN VIDEO**:
- Tiêu đề gốc: "${videoData.title}"
- Mô tả: "${videoData.description?.substring(0, 500) || 'Không có'}"
- Tags: ${videoData.tags?.slice(0, 10).join(', ') || 'Không có'}

**YÊU CẦU**:
1. Tạo 5 tiêu đề thay thế, mỗi cái dùng hook khác nhau:
   - Curiosity Gap (tò mò)
   - Fear/Urgency (sợ mất mát)
   - Numbers/Listicle (số liệu cụ thể)
   - Controversy (tranh cãi nhẹ)
   - Result/Transformation (kết quả)

2. Mỗi tiêu đề:
   - Dưới 60 ký tự
   - Có keyword chính ở đầu
   - Tạo cảm xúc mạnh

3. Giải thích ngắn gọn tại sao mỗi tiêu đề hiệu quả.

4. Chấm điểm viralScore 0-100 dựa trên CTR tiềm năng.

**OUTPUT bằng TIẾNG VIỆT** (hoặc ngôn ngữ của title gốc).`;
}

function getDescriptionPrompt(videoData: RequestBody['videoData']): string {
    return `Bạn là chuyên gia tối ưu YouTube Description. Viết lại description tối ưu SEO:

**THÔNG TIN VIDEO**:
- Tiêu đề: "${videoData.title}"
- Mô tả gốc: "${videoData.description || 'Không có mô tả'}"

**YÊU CẦU DESCRIPTION MỚI**:
1. **CẤU TRÚC** (bắt buộc):
   📌 **Hook** (2-3 câu gợi tò mò)
   
   💡 **Nội dung chính** (3-5 bullets về video)
   
   🎯 **CTA** (đăng ký, like, bình luận)
   
   📞 **Liên kết** (để placeholder [LINK])
   
   ⏱️ **Timestamps** (gợi ý format)
   
   #️⃣ **Hashtags** (3-5 hashtags cuối)

2. **NGUYÊN TẮC**:
   - 200 ký tự đầu phải có keyword chính
   - Dùng xuống dòng rõ ràng
   - Có emoji để tăng thu hút
   - Tổng độ dài: 500-1000 ký tự

3. Liệt kê các cải tiến so với description gốc.

**OUTPUT bằng TIẾNG VIỆT** (hoặc ngôn ngữ của content gốc).`;
}

function getTagsPrompt(videoData: RequestBody['videoData']): string {
    return `Bạn là chuyên gia Tags YouTube. Đề xuất 15 tags tối ưu:

**THÔNG TIN VIDEO**:
- Tiêu đề: "${videoData.title}"
- Tags hiện tại: ${videoData.tags?.join(', ') || 'Không có'}
- Niche: ${videoData.niche || 'Auto-detect từ title'}

**YÊU CẦU**:
1. Tạo 15 tags, chia thành các loại:
   - **high-intent**: Long-tail keywords (3+ từ), cạnh tranh thấp (5 tags)
   - **mid-tail**: 2 từ, cân bằng volume/competition (5 tags)
   - **trending**: Tags đang hot trong niche (3 tags)
   - **related**: Chủ đề liên quan mở rộng (2 tags)

2. Mỗi tag kèm đánh giá searchVolume: high/medium/low

3. KHÔNG dùng tags quá chung như "video", "youtube", "hay"

**LƯU Ý**: Tags bằng TIẾNG VIỆT (hoặc ngôn ngữ của title).`;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AIResponse | { error: string }>
) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'AI not configured' });
    }

    try {
        const { action, videoData }: RequestBody = req.body;

        if (!action || !videoData?.title) {
            return res.status(400).json({ error: 'Missing action or videoData.title' });
        }

        const ai = new GoogleGenAI({ apiKey });
        let prompt: string;
        let schema: any;

        switch (action) {
            case 'generate-titles':
                prompt = getTitlePrompt(videoData);
                schema = titleSchema;
                break;
            case 'optimize-description':
                prompt = getDescriptionPrompt(videoData);
                schema = descriptionSchema;
                break;
            case 'suggest-tags':
                prompt = getTagsPrompt(videoData);
                schema = tagsSchema;
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const outputText = response.text?.trim() || "{}";
        const jsonStr = outputText.replace(/^```json\s*/, '').replace(/```$/, '');
        const data = JSON.parse(jsonStr);

        // Format response based on action
        if (action === 'generate-titles') {
            return res.status(200).json({
                type: 'titles',
                suggestions: data.titles || []
            });
        } else if (action === 'optimize-description') {
            return res.status(200).json({
                type: 'description',
                suggestion: data.description || { text: '', improvements: [] }
            });
        } else {
            return res.status(200).json({
                type: 'tags',
                suggestions: data.tags || []
            });
        }

    } catch (error: any) {
        console.error('AI Suggest Error:', error);
        return res.status(500).json({ error: 'AI processing failed: ' + error.message });
    }
}

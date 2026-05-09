// AI Coach Chat API - Connects to DeepSeek with Smart Gating + RAG
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { AI_COACH_LIMITS, AI_COACH_SYSTEM_PROMPT, canAccessTool, getUpgradeMessage } from '@/lib/ai-coach-config';
import { searchKnowledge } from '@/lib/pinecone';
import { localSearch } from '@/lib/youtube-knowledge';
import { searchVidIQDocuments } from '@/lib/vidiq-knowledge';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ChatRequest {
    messages: Message[];
    mode: 'fast' | 'deep' | 'max';
}

// Check quota and return remaining
async function checkAndIncrementQuota(userId: string, userRole: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const limit = AI_COACH_LIMITS[userRole] || AI_COACH_LIMITS.FREE;

    // Count today's usage
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const usedToday = await prisma.event.count({
        where: {
            userId,
            name: 'AI_COACH_CHAT',
            createdAt: { gte: startOfDay },
        },
    });

    if (usedToday >= limit) {
        return { allowed: false, remaining: 0, limit };
    }

    // Track this usage
    await prisma.event.create({
        data: {
            name: 'AI_COACH_CHAT',
            userId,
            path: 'ai-coach',
        },
    });

    return { allowed: true, remaining: limit - usedToday - 1, limit };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập để sử dụng AI Coach' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true },
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userRole = user.role || 'FREE';

    // Check quota
    const quota = await checkAndIncrementQuota(user.id, userRole);
    if (!quota.allowed) {
        return res.status(429).json({
            error: `Bạn đã hết ${quota.limit} lượt chat hôm nay. Nâng cấp để chat nhiều hơn!`,
            remaining: 0,
            limit: quota.limit,
        });
    }

    const { messages, mode } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Get DeepSeek API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        console.error('DEEPSEEK_API_KEY not configured');
        return res.status(500).json({
            error: 'AI Coach đang bảo trì. Vui lòng thử lại sau.'
        });
    }

    try {
        // Get the latest user message for RAG search
        const latestUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

        // Search knowledge base (try Pinecone first, fallback to local)
        let knowledgeContext = '';
        try {
            const relevantDocs = await searchKnowledge(latestUserMessage, 3);
            if (relevantDocs.length > 0) {
                knowledgeContext = `
[KIẾN THỨC THAM KHẢO]
Dựa trên dữ liệu SeenYT, đây là thông tin liên quan:
${relevantDocs.map((doc, i) => `${i + 1}. ${doc}`).join('\n\n')}

Hãy sử dụng thông tin trên để trả lời chính xác hơn. Nếu thông tin không liên quan, bỏ qua.
`;
            }
        } catch (ragError) {
            // Fallback to local search + VidIQ knowledge
            console.log('Pinecone not available, using local + VidIQ search');
            const localDocs = localSearch(latestUserMessage, 2);
            const vidiqDocs = searchVidIQDocuments(latestUserMessage, 2);
            const combinedDocs = [...localDocs, ...vidiqDocs];

            if (combinedDocs.length > 0) {
                knowledgeContext = `
[KIẾN THỨC THAM KHẢO - SeenYT + VidIQ]
${combinedDocs.map((doc, i) => `${i + 1}. ${doc}`).join('\n\n')}
`;
            }
        }

        // Build context about user's access level
        const accessContext = `
[THÔNG TIN USER]
- Gói hiện tại: ${userRole === 'FREE' ? 'Miễn phí' : userRole === 'BASIC' ? 'Basic' : userRole === 'PRO' ? 'Pro' : userRole}
- Còn ${quota.remaining} lượt chat hôm nay

[QUY TẮC GỌI CÔNG CỤ]
${userRole === 'FREE' || userRole === 'USER' ? `
- User FREE chỉ được dùng: Viết Kịch Bản, SEO cơ bản, Tìm Ngách
- Khi user hỏi phân tích kênh, phân tích video, phân tích đối thủ: 
  Hãy giải thích tính năng premium này và gợi ý nâng cấp gói Basic/Pro
  Vẫn cho lời khuyên chung hữu ích dựa trên kiến thức
` : userRole === 'BASIC' ? `
- User Basic được dùng: Tất cả tools cơ bản + Phân tích kênh, Tạo thumbnail
- Có thể gợi ý các tính năng nâng cao của gói Pro
` : `
- User Pro có quyền truy cập đầy đủ mọi tính năng
`}
${knowledgeContext}`;

        // Prepare messages with system prompt
        const fullMessages: Message[] = [
            { role: 'system', content: AI_COACH_SYSTEM_PROMPT + accessContext },
            ...messages.slice(-10), // Keep last 10 messages for context
        ];

        // Choose model based on mode
        const model = mode === 'max' ? 'deepseek-reasoner' : 'deepseek-chat';
        const temperature = mode === 'fast' ? 0.7 : mode === 'deep' ? 0.5 : 0.3;

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: fullMessages,
                temperature,
                max_tokens: mode === 'fast' ? 1500 : mode === 'deep' ? 3000 : 4000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('DeepSeek API error:', response.status, errorData);
            return res.status(500).json({
                error: 'AI Coach không phản hồi. Vui lòng thử lại.'
            });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({ error: 'Không nhận được phản hồi từ AI' });
        }

        return res.status(200).json({
            content,
            remaining: quota.remaining,
            limit: quota.limit,
        });

    } catch (error) {
        console.error('AI Coach error:', error);
        return res.status(500).json({
            error: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
        });
    }
}

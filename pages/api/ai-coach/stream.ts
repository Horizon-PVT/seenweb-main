// AI Coach Streaming Chat API - Server-Sent Events
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { AI_COACH_LIMITS, AI_COACH_SYSTEM_PROMPT } from '@/lib/ai-coach-config';
import { localSearch } from '@/lib/youtube-knowledge';
import { searchVidIQDocuments } from '@/lib/vidiq-knowledge';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Disable body parser for streaming
export const config = {
    api: {
        bodyParser: true,
    },
};

// Check quota and return remaining
async function checkAndIncrementQuota(userId: string, userRole: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const limit = AI_COACH_LIMITS[userRole] || AI_COACH_LIMITS.FREE;

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

    await prisma.event.create({
        data: {
            name: 'AI_COACH_CHAT',
            userId,
            path: 'ai-coach',
        },
    });

    return { allowed: true, remaining: limit - usedToday - 1, limit };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    }) as unknown as { id: string; role: string | null; aiCoachSettings: any } | null;

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userRole = user.role || 'FREE';
    const quota = await checkAndIncrementQuota(user.id, userRole);

    if (!quota.allowed) {
        return res.status(429).json({
            error: `Bạn đã hết ${quota.limit} lượt chat hôm nay.`,
            remaining: 0,
        });
    }

    const { messages, mode } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'AI Coach đang bảo trì' });
    }

    try {
        // Get knowledge context from local + VidIQ sources
        const latestUserMessage = messages.filter((m: Message) => m.role === 'user').pop()?.content || '';
        let knowledgeContext = '';

        try {
            const localDocs = localSearch(latestUserMessage, 2);
            const vidiqDocs = searchVidIQDocuments(latestUserMessage, 2);
            const combined = [...localDocs, ...vidiqDocs];
            if (combined.length > 0) {
                knowledgeContext = `\n[KIẾN THỨC THAM KHẢO]\n${combined.map((doc: string, i: number) => `${i + 1}. ${doc}`).join('\n\n')}\n`;
            }
        } catch {
            // Knowledge search failed, continue without context
        }

        // Build personalization context from user settings
        const settings = user.aiCoachSettings || {};
        let personalizationContext = '';
        if (settings.enabled !== false && (settings.nickname || settings.channelInfo || settings.personality || settings.helpStyle)) {
            personalizationContext = `\n[CÁ NHÂN HÓA CHO USER NÀY]`;
            if (settings.nickname) {
                personalizationContext += `\n- Gọi user là: "${settings.nickname}"`;
            }
            if (settings.channelInfo) {
                personalizationContext += `\n- Thông tin kênh: ${settings.channelInfo}`;
            }
            if (settings.personality) {
                personalizationContext += `\n- Tính cách mong muốn: ${settings.personality}`;
            }
            if (settings.personalityTags?.length) {
                personalizationContext += `\n- Phong cách: ${settings.personalityTags.join(', ')}`;
            }
            if (settings.helpStyle) {
                personalizationContext += `\n- Cách hỗ trợ: ${settings.helpStyle}`;
            }
            if (settings.additionalInfo) {
                personalizationContext += `\n- Thông tin thêm: ${settings.additionalInfo}`;
            }
            personalizationContext += '\n';
        }

        const accessContext = `
[THÔNG TIN USER]
- Gói: ${userRole === 'FREE' ? 'Miễn phí' : userRole === 'BASIC' ? 'Basic' : 'Pro'}
- Còn ${quota.remaining} lượt chat
${personalizationContext}
[QUY TẮC QUAN TRỌNG]
Cuối mỗi câu trả lời, LUÔN thêm block sau:

---
**💡 Câu hỏi gợi ý:**
1. [Câu hỏi liên quan 1]
2. [Câu hỏi liên quan 2]
3. [Câu hỏi liên quan 3]

(Thay [Câu hỏi] bằng câu hỏi thực tế liên quan đến chủ đề vừa thảo luận)
${knowledgeContext}`;

        const fullMessages: Message[] = [
            { role: 'system', content: AI_COACH_SYSTEM_PROMPT + accessContext },
            ...messages.slice(-10),
        ];

        const model = mode === 'max' ? 'deepseek-reasoner' : 'deepseek-chat';
        const temperature = mode === 'fast' ? 0.7 : mode === 'deep' ? 0.5 : 0.3;

        // Streaming request to DeepSeek
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
                stream: true,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('DeepSeek error:', error);
            return res.status(500).json({ error: 'AI không phản hồi' });
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        // Send initial data
        res.write(`data: ${JSON.stringify({ type: 'start', remaining: quota.remaining })}\n\n`);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
            res.write(`data: ${JSON.stringify({ type: 'error', error: 'No stream' })}\n\n`);
            res.end();
            return;
        }

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (streamError) {
            console.error('Stream error:', streamError);
            res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Streaming error:', error);
        return res.status(500).json({ error: 'Có lỗi xảy ra' });
    }
}

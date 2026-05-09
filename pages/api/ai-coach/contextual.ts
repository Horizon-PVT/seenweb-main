// pages/api/ai-coach/contextual.ts
// Phase 4: Context-Aware AI Coach - Reads channel data to give specific advice

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { question, channelId } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // 1. Get user's channel data
    const channels = await prisma.youTubeChannel.findMany({
      where: { userId: session.user.id },
    });

    const primaryChannel = channelId
      ? channels.find(c => c.channelId === channelId)
      : channels[0];

    // 2. Get recent analytics snapshots
    const analytics = primaryChannel
      ? await prisma.channelAnalytics.findMany({
          where: { channelId: primaryChannel.channelId },
          orderBy: { snapshotDate: 'desc' },
          take: 7,
        })
      : [];

    // 3. Get user's roadmap progress
    const roadmap = await prisma.teacherRoadmap.findUnique({
      where: { userId: session.user.id },
      include: { progress: { take: 5, orderBy: { day: 'desc' } } },
    });

    // 4. Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        role: true,
        streakDays: true,
        aiCoachSettings: true,
      },
    });

    // Build context for AI
    const context = `
THÔNG TIN USER:
- Tên: ${user?.name || 'Unknown'}
- Tier: ${user?.role || 'FREE'}
- Streak: ${user?.streakDays || 0} ngày
- Ngách: ${(user?.aiCoachSettings as any)?.channelInfo?.niche || 'Chưa xác định'}

KÊNH YOUTUBE:
${primaryChannel ? `
- Tên kênh: ${primaryChannel.title || 'Unknown'}
- Subscribers: ${primaryChannel.subCount.toLocaleString()}
- Tổng views: ${primaryChannel.viewCount || 'N/A'}
- Số video: ${primaryChannel.videoCount}
- Health Score: ${(primaryChannel.channelHealth as any)?.score || 'N/A'}

VIDEO GẦN ĐÂY:
${(primaryChannel.recentVideos as any[])?.slice(0, 5).map((v, i) =>
  `${i + 1}. "${v.title}" - ${v.views?.toLocaleString() || 'N/A'} views`
).join('\n') || 'Chưa có dữ liệu'}

HEALTH ISSUES:
${(primaryChannel.channelHealth as any)?.issues?.join('\n') || 'Không có vấn đề nổi bật'}
` : 'Chưa kết nối kênh YouTube'}

PROGRESS ROADMAP:
${roadmap ? `
- Ngày hiện tại: ${roadmap.progress.find(p => p.status === 'OPEN')?.day || roadmap.progress[0]?.day || 0}/30
- Trạng thái: ${roadmap.progress.find(p => p.status === 'OPEN')?.status || 'Đang xây dựng'}
` : 'Chưa có roadmap'}

CÂU HỎI CỦA USER:
"${question}"

NHIỆM VỤ:
Trả lời câu hỏi của user DỰA TRÊN DỮ LIỆU TRÊN. Đưa ra:
1. Phân tích cụ thể dựa trên data thực tế của user
2. Gợi ý hành động cụ thể có thể làm ngay
3. Lý do tại sao nên làm theo gợi ý đó
4. Nếu chưa có kênh → hướng dẫn bước đầu tiên

Trả lời bằng tiếng Việt, thân thiện, có emoji phù hợp.
Format: Markdown với headers và bullet points.
`;

    // 5. Generate AI response
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(context);
    const response = result.response.text();

    return res.status(200).json({
      response,
      context: {
        channel: primaryChannel ? {
          title: primaryChannel.title,
          subscribers: primaryChannel.subCount,
          healthScore: (primaryChannel.channelHealth as any)?.score || null,
        } : null,
        roadmapDay: roadmap?.progress.find(p => p.status === 'OPEN')?.day || 0,
        streak: user?.streakDays || 0,
      },
    });
  } catch (error: any) {
    console.error('[ai-coach/contextual] Error:', error);
    return res.status(500).json({ error: 'Failed to generate coaching response' });
  }
}

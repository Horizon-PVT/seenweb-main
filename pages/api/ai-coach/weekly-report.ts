// pages/api/ai-coach/weekly-report.ts
// Phase 4: Weekly Report - AI-generated weekly performance summary

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

  const { channelId } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const channels = await prisma.youTubeChannel.findMany({
      where: { userId: session.user.id },
    });

    const primaryChannel = channelId
      ? channels.find(c => c.channelId === channelId)
      : channels[0];

    // Get analytics for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const thisWeekAnalytics = primaryChannel
      ? await prisma.channelAnalytics.findMany({
          where: {
            channelId: primaryChannel.channelId,
            snapshotDate: { gte: sevenDaysAgo },
          },
          orderBy: { snapshotDate: 'desc' },
        })
      : [];

    const lastWeekAnalytics = primaryChannel
      ? await prisma.channelAnalytics.findMany({
          where: {
            channelId: primaryChannel.channelId,
            snapshotDate: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
          },
        })
      : [];

    // Get calendar events for this week
    const weekEvents = await prisma.contentCalendar.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: { gte: sevenDaysAgo },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, streakDays: true },
    });

    // Calculate week-over-week changes
    const thisWeekTotalViews = thisWeekAnalytics.reduce((sum, a) => sum + Number(a.totalViews), 0);
    const lastWeekTotalViews = lastWeekAnalytics.reduce((sum, a) => sum + Number(a.totalViews), 0);
    const viewsChange = lastWeekTotalViews > 0
      ? ((thisWeekTotalViews - lastWeekTotalViews) / lastWeekTotalViews * 100)
      : 0;

    const thisWeekSubs = thisWeekAnalytics[0]?.subscribers || primaryChannel?.subCount || 0;
    const lastWeekSubs = lastWeekAnalytics[0]?.subscribers || primaryChannel?.subCount || 0;
    const subsChange = lastWeekSubs > 0 ? ((thisWeekSubs - lastWeekSubs) / lastWeekSubs * 100) : 0;

    const publishedVideos = weekEvents.filter(e => e.status === 'PUBLISHED').length;
    const scheduledVideos = weekEvents.filter(e => e.status === 'SCHEDULED').length;

    // Generate AI weekly report
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Tạo báo cáo tuần CHO USER: ${user?.name || 'Unknown'}

SỐ LIỆU TUẦN NÀY:
${primaryChannel ? `
- Kênh: ${primaryChannel.title || 'Unknown'}
- Views tuần này: ${thisWeekTotalViews.toLocaleString()} (${viewsChange >= 0 ? '+' : ''}${viewsChange.toFixed(1)}% vs tuần trước)
- Subscribers: ${thisWeekSubs.toLocaleString()} (${subsChange >= 0 ? '+' : ''}${subsChange.toFixed(1)}% vs tuần trước)
- Videos đã đăng: ${publishedVideos}
- Videos đã lên lịch: ${scheduledVideos}
` : 'Chưa kết nối kênh YouTube'}

STREAK: ${user?.streakDays || 0} ngày

NHIỆM VỤ:
Tạo báo cáo tuần theo format sau:

# 📊 Báo Cáo Tuần Của Bạn

## 🎯 Tổng Quan
(Một paragraph tóm tắt tuần)

## 📈 Số Liệu Nổi Bật
- Views: [số]
- Subscribers: [số]
- Videos: [số]
- Streak: [ngày]

## ✅ Điều Đã Làm Tốt
(3 điểm mạnh của tuần này)

## ⚠️ Cần Cải Thiện
(3 điểm cần cải thiện)

## 🎯 Mục Tiêu Tuần Sau
(3-5 mục tiêu SMART cụ thể)

## 💡 Insights
(2-3 insights ngắn gọn từ dữ liệu)

## 📅 Lịch Đăng Video Tuần Sau
(Gợi ý ngày/giờ tốt nhất để đăng dựa trên data)

Trả lời bằng tiếng Việt, thân thiện, có emoji.
Format: Markdown.
`;

    const result = await model.generateContent(prompt);
    const report = result.response.text();

    return res.status(200).json({
      report,
      stats: {
        viewsThisWeek: thisWeekTotalViews,
        viewsChange,
        subscribers: thisWeekSubs,
        subsChange,
        publishedVideos,
        scheduledVideos,
        streak: user?.streakDays || 0,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[ai-coach/weekly-report] Error:', error);
    return res.status(500).json({ error: 'Failed to generate weekly report' });
  }
}

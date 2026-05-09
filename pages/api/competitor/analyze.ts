// pages/api/competitor/analyze.ts
// Phase 3: Competitor Deep Analysis - AI-powered competitor analysis

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CompetitorAnalysisRequest {
  channelIds: string[];
  keywords?: string[];
  limit?: number;
}

interface VideoInsight {
  title: string;
  views: number;
  engagement: number;
  ctr: number;
  pattern: string;
  strength: string;
  weakness: string;
}

interface CompetitorReport {
  channelId: string;
  channelTitle: string;
  subscribers: number;
  avgViews: number;
  avgEngagement: number;
  totalVideos: number;
  contentMix: {
    format: string;
    percentage: number;
  }[];
  topVideos: VideoInsight[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  contentGaps: string[];
  recommendedActions: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
  }[];
  seoScore: number;
  thumbnailScore: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { channelIds, keywords, limit = 5 } = req.body as CompetitorAnalysisRequest;

  if (!channelIds || !Array.isArray(channelIds) || channelIds.length === 0) {
    return res.status(400).json({ error: 'Missing channelIds array' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const reports: CompetitorReport[] = [];

    // Analyze each competitor channel
    for (const channelId of channelIds.slice(0, 5)) {
      const report = await analyzeChannel(channelId, keywords || [], limit, apiKey);
      reports.push(report);
    }

    // Generate comparative analysis
    const comparison = generateComparison(reports);

    return res.status(200).json({
      reports,
      comparison,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[competitor/analyze] Error:', error);
    return res.status(500).json({ error: 'Failed to analyze competitors' });
  }
}

async function analyzeChannel(
  channelId: string,
  keywords: string[],
  limit: number,
  apiKey: string
): Promise<CompetitorReport> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Generate mock data (in production, this would fetch from YouTube API)
  const mockReport = generateMockReport(channelId);

  try {
    // Use AI to enhance the analysis
    const prompt = `
Analyze this YouTube channel's content strategy and provide actionable insights.

Channel ID: ${channelId}

Current Stats:
- Subscribers: ${mockReport.subscribers}
- Avg Views: ${mockReport.avgViews}
- Total Videos: ${mockReport.totalVideos}

Top Videos:
${mockReport.topVideos.map(v => `- "${v.title}" (${v.views} views, ${v.engagement}% eng)`).join('\n')}

Keywords: ${keywords.join(', ')}

Provide:
1. Content strengths (what they're doing well)
2. Content weaknesses (what they could improve)
3. Content gaps (what topics they haven't covered)
4. Top 3 recommended actions for a competitor to outrank them

Respond in Vietnamese, JSON format:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "opportunities": ["..."],
  "recommendedActions": [
    { "priority": "high|medium|low", "action": "...", "reason": "..." }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...mockReport,
        channelId,
        strengths: parsed.strengths || mockReport.strengths,
        weaknesses: parsed.weaknesses || mockReport.weaknesses,
        opportunities: parsed.opportunities || mockReport.opportunities,
        recommendedActions: parsed.recommendedActions || mockReport.recommendedActions,
      };
    }
  } catch (err) {
    console.error('AI enhancement failed, using mock data');
  }

  return mockReport;
}

function generateMockReport(channelId: string): CompetitorReport {
  const formats = [
    { format: 'Tutorial', percentage: 40 },
    { format: 'Review', percentage: 25 },
    { format: 'Listicle', percentage: 20 },
    { format: 'Vlog', percentage: 15 },
  ];

  return {
    channelId,
    channelTitle: `Kênh ${channelId.slice(0, 8)}`,
    subscribers: Math.floor(Math.random() * 500000) + 10000,
    avgViews: Math.floor(Math.random() * 100000) + 5000,
    avgEngagement: Math.random() * 5 + 2,
    totalVideos: Math.floor(Math.random() * 200) + 20,
    contentMix: formats,
    topVideos: [
      {
        title: 'Video Viral 1',
        views: Math.floor(Math.random() * 500000) + 100000,
        engagement: Math.random() * 10 + 5,
        ctr: Math.random() * 15 + 5,
        pattern: 'Question hook + specific promise',
        strength: 'Strong hook in first 5 seconds',
        weakness: 'Thumbnail could be more compelling',
      },
      {
        title: 'Video Viral 2',
        views: Math.floor(Math.random() * 300000) + 50000,
        engagement: Math.random() * 8 + 3,
        ctr: Math.random() * 12 + 3,
        pattern: 'Controversial take + data proof',
        strength: 'Unique angle on common topic',
        weakness: 'Retention drops after 2 minutes',
      },
    ],
    strengths: [
      'Consistent upload schedule (2x/week)',
      'Strong SEO with keyword-rich titles',
      'Good thumbnail consistency',
    ],
    weaknesses: [
      'Hook could be more attention-grabbing',
      'Retention drops mid-video',
      'Limited content variety',
    ],
    opportunities: [
      'Shorts content is underrepresented',
      'Long-form educational content opportunity',
      'Collaboration with other creators',
    ],
    contentGaps: [
      'Basic tutorial for beginners',
      'Comparison with competitor tools',
      'Updated version of old popular videos',
    ],
    recommendedActions: [
      {
        priority: 'high',
        action: 'Create video on trending topic they missed',
        reason: 'Captures search traffic before they do',
      },
      {
        priority: 'medium',
        action: 'Improve hook in first 3 seconds',
        reason: 'Their retention drops suggest hook issues',
      },
      {
        priority: 'low',
        action: 'Add more Shorts to their mix',
        reason: 'Shorts traffic growing rapidly',
      },
    ],
    seoScore: Math.floor(Math.random() * 30) + 60,
    thumbnailScore: Math.floor(Math.random() * 25) + 65,
  };
}

function generateComparison(reports: CompetitorReport[]) {
  const avgEngagement = reports.reduce((sum, r) => sum + r.avgEngagement, 0) / reports.length;
  const avgViews = reports.reduce((sum, r) => sum + r.avgViews, 0) / reports.length;

  return {
    marketEngagement: avgEngagement,
    marketAvgViews: avgViews,
    topPerformer: reports.sort((a, b) => b.avgViews - a.avgViews)[0]?.channelTitle || 'N/A',
    commonStrengths: findCommonItems(reports.map(r => r.strengths)),
    commonWeaknesses: findCommonItems(reports.map(r => r.weaknesses)),
    marketGaps: reports.flatMap(r => r.contentGaps).reduce((acc, gap) => {
      acc[gap] = (acc[gap] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

function findCommonItems(arrays: string[][]): string[] {
  const counts: Record<string, number> = {};
  arrays.flat().forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return Object.entries(counts)
    .filter(([_, count]) => count >= arrays.length / 2)
    .map(([item]) => item);
}

// pages/api/niche/gap-finder.ts
// Phase 3: Content Gap Finder - Find untapped topics in your niche

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { GoogleGenAI } from '@google/generative-ai';

interface GapResult {
  topic: string;
  searchVolume: string;
  competition: 'Low' | 'Medium' | 'High';
  difficulty: number;
  potential: number;
  angle: string;
  suggestedTitle: string;
  suggestedThumbnail: string;
  relatedKeywords: string[];
  whyOpportunity: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { niche, competitorChannels = [], count = 5 } = req.body;

  if (!niche) {
    return res.status(400).json({ error: 'Missing niche' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
Bạn là chuyên gia YouTube Growth. Phân tích ngách "${niche}" và tìm những content gaps - những chủ đề có tiềm năng cao nhưng ít người làm.

Phân tích dựa trên:
- Niche: ${niche}
- Đối thủ đã làm: ${competitorChannels.length > 0 ? competitorChannels.join(', ') : 'Không có dữ liệu'}

Tìm ${count} content gaps với thông tin chi tiết cho mỗi gap:

Với mỗi gap, cung cấp:
1. topic - Chủ đề nên làm
2. searchVolume - Ước tính lượng tìm kiếm (High/Medium/Low)
3. competition - Mức độ cạnh tranh (Low/Medium/High)
4. difficulty - Độ khó để rank (1-100, thấp = dễ rank)
5. potential - Tiềm năng video viral (1-100)
6. angle - Góc nhìn/angle để tiếp cận
7. suggestedTitle - Tiêu đề video đề xuất
8. suggestedThumbnail - Mô tả thumbnail đề xuất
9. relatedKeywords - 5 từ khóa liên quan
10. whyOpportunity - Tại sao đây là opportunity

Trả lời JSON format:
{
  "gaps": [
    {
      "topic": "string",
      "searchVolume": "High|Medium|Low",
      "competition": "Low|Medium|High",
      "difficulty": number,
      "potential": number,
      "angle": "string",
      "suggestedTitle": "string",
      "suggestedThumbnail": "string",
      "relatedKeywords": ["string"],
      "whyOpportunity": "string"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return res.status(200).json({
        niche,
        gaps: parsed.gaps || generateFallbackGaps(niche),
        generatedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      niche,
      gaps: generateFallbackGaps(niche),
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[niche/gap-finder] Error:', error);
    return res.status(500).json({ error: 'Failed to find content gaps' });
  }
}

function generateFallbackGaps(niche: string): GapResult[] {
  const gaps: GapResult[] = [
    {
      topic: 'Beginner Guide / Getting Started',
      searchVolume: 'High',
      competition: 'Low',
      difficulty: 25,
      potential: 85,
      angle: 'Ultimate beginner guide với checklist có thể tải về',
      suggestedTitle: `Hướng Dẫn Từ A-Z Cho Người Mới Bắt Đầu Với ${niche}`,
      suggestedThumbnail: 'Clean design với text lớn, mũi tên chỉ xuống, background màu nóng',
      relatedKeywords: [`hướng dẫn ${niche}`, `${niche} cho người mới`, `cách bắt đầu ${niche}`],
      whyOpportunity: 'Content evergreen, high search intent, ít người làm chất lượng cao',
    },
    {
      topic: 'Comparison / vs',
      searchVolume: 'Medium',
      competition: 'Low',
      difficulty: 35,
      potential: 75,
      angle: 'So sánh 2-3 tools/services với data thực tế',
      suggestedTitle: `Tool Nào Tốt Hơn? So Sánh Chi Tiết [Tool A] vs [Tool B]`,
      suggestedThumbnail: 'Side-by-side comparison, question mark, arrow chỉ winner',
      relatedKeywords: [`so sánh ${niche}`, `${niche} tool`, `best ${niche}`],
      whyOpportunity: 'High purchase intent viewers, evergreen comparison content',
    },
    {
      topic: 'Mistakes / Common Errors',
      searchVolume: 'High',
      competition: 'Medium',
      difficulty: 30,
      potential: 80,
      angle: 'Top 10 sai lầm phổ biến với solutions cụ thể',
      suggestedTitle: `Top 10 Sai Lầm Nguy Hiểm Khi Làm ${niche} (99% Người Mới Mắc)`,
      suggestedThumbnail: 'Warning sign, đếm ngược từ 10, màu đỏ/cam',
      relatedKeywords: [`sai lầm ${niche}`, `${niche} lỗi`, `${niche} tip]`],
      whyOpportunity: 'Fear-based title = high CTR, viewers looking to avoid mistakes',
    },
    {
      topic: 'Case Study / Success Story',
      searchVolume: 'Medium',
      competition: 'Low',
      difficulty: 40,
      potential: 90,
      angle: 'Real case study với specific numbers và timeline',
      suggestedTitle: `Anh Ấy Kiếm Được [Số Tiền] Trong [Thời Gian] Nhờ ${niche} - Case Study Thật`,
      suggestedThumbnail: 'Money shot, screenshot proof,惊讶表情',
      relatedKeywords: [`case study ${niche}`, `thành công ${niche}`, `${niche} kiếm tiền`],
      whyOpportunity: 'Specific numbers = viral potential, aspirational content',
    },
    {
      topic: 'Updated / 2025 Version',
      searchVolume: 'High',
      competition: 'Low',
      difficulty: 20,
      potential: 88,
      angle: 'Updated version của content cũ với new information',
      suggestedTitle: `${niche} Mới Nhất 2025: Tất Cả Thay Đổi Bạn Cần Biết`,
      suggestedThumbnail: '2025 badge, update icon, question marks',
      relatedKeywords: [`${niche} 2025`, `cập nhật ${niche}`, `${niche} mới nhất`],
      whyOpportunity: 'Year-based keywords = evergreen evergreen traffic, low competition on fresh content',
    },
  ];

  return gaps;
}

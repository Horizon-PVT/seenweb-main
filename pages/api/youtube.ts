// pages/api/youtube.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';

const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Giữ nguyên model 2.5 như anh muốn
const MODEL_NAME = "gemini-2.5-flash";

// Hàm Clean JSON mạnh hơn (Gemini 2.5 hay nói thêm câu dẫn, hàm này sẽ cắt bỏ hết)
function cleanJSON(text: string): string {
  // Xóa markdown json
  let cleaned = text.replace(/```json|```/g, '').trim();
  // Tìm điểm bắt đầu { và kết thúc } để cắt bỏ lời dẫn thừa
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  return cleaned;
}

function extractFromUrl(url: string): { type: 'channel' | 'video', value: string } | null {
  const patterns = [
    /youtube\.com\/@([^\/?&]+)/,
    /youtube\.com\/channel\/([^\?&#]+)/,
    /youtube\.com\/c\/([^\/?&]+)/,
    /youtube\.com\/user\/([^\/?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^\/?&]+)/
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) {
      return {
        type: pattern.source.includes('watch') || pattern.source.includes('youtu.be') ? 'video' : 'channel',
        value: match[1]
      };
    }
  }
  return null;
}

async function analyzeWithGemini(tool: string, ytData: any, params: any, language: string) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7, // 2.5 cần nhiệt độ này để sáng tạo nhưng không bị "bay" quá
    },
  });

  const lang = language === "English" ? "English" : "Tiếng Việt";
  
  // Rút gọn dữ liệu đầu vào để Gemini 2.5 tiêu hóa dễ hơn
  // Nếu để nguyên raw data, token sẽ bị tràn -> gây lỗi JSON
  const dataInput = JSON.stringify(ytData).slice(0, 20000); 

  let prompt = "";

  if (tool === 'rival') {
    prompt = `Bạn là chuyên gia phân tích đối thủ YouTube hàng đầu Việt Nam. 
Phân tích cực chi tiết, gắt gao, dựa trên dữ liệu để đưa ra chiến lược phản công chuẩn xác cho khách hàng. Tập trung vào tối ưu hóa tiêu đề, mô tả, nội dung, tags/hashtags, thumbnail để vượt đối thủ.

Dữ liệu kênh: ${JSON.stringify(ytData, null, 2)}

TRẢ VỀ CHỈ JSON, KHÔNG THÊM CHỮ NÀO:
{
  "competitorProfile": {"name": "Tên kênh chính xác"},
  "strategicWeaknesses": ["string", "string", ...],
  "successSignals": ["string", "string", ...],
  "contentStructure": {
    "mainKeywords": ["từ khóa chính", "từ khóa phụ"],
    "seoEvaluation": "đánh giá chi tiết SEO (điểm mạnh/yếu, cơ hội cải thiện)"
  },
  "untappedNiches": ["ngách chưa khai thác", "..."],
  "titleAnalysis": "Phân tích tiêu đề: length trung bình, mức độ clickbait, keywords tích hợp, gợi ý 5 tiêu đề mới để vượt đối thủ",
  "descriptionAnalysis": "Phân tích mô tả: length, CTA, SEO keywords, gợi ý mô tả tối ưu cho video mới",
  "tagsHashtags": ["gợi ý 10-15 tags/hashtags tối ưu dựa trên đối thủ, để tăng reach"],
  "thumbnailAnalysis": "Phân tích thumbnail: màu sắc, text overlay, appeal visual, gợi ý thiết kế thumbnail để CTR cao hơn",
  "contentStrategy": "Chiến lược nội dung: cấu trúc video (hook 0-10s, body, CTA), length lý tưởng, edit style, gợi ý cải thiện để giữ retention",
  "counterAttackPlan": "Kế hoạch phản công 30-60 ngày cực chi tiết: lịch đăng (ví dụ: 3 video/tuần), 5 ý tưởng video cụ thể (tiêu đề + mô tả + tags), SEO plan, thumbnail ideas, mục tiêu view/sub"
}`;
  } else if (tool === 'hidden') {
    prompt = `Tìm kênh ẩn đang bùng nổ từ dữ liệu sau. Tập trung kênh nhỏ nhưng tăng trưởng điên cuồng.
Ngôn ngữ: ${lang}

Dữ liệu: ${JSON.stringify(ytData)}

JSON only:
{
  "risingChannels": [{"name":"string","url":"https://youtube.com/@handle","subscribers":"12.5K","videoCount":"42","growthMetric":"+380% 30 ngày","coreStrengths":["thumbnail đẹp","title clickbait chuẩn","edit nhanh"],"thumbnail":"https://yt3.ggpht.com/..." }],
  "trendingVideos": [{"title":"string","url":"string","viralRatio":"1.2M views 7 ngày","viralStructure":["hook 3s","storytelling","CTA cuối"]}],
  "upcomingTrends": ["string","string"]
}`;
  } else if (tool === 'micro') {
    // Sửa prompt Micro một chút để chắc chắn hơn
    prompt = `Đóng vai chuyên gia YouTube Strategist. Nhiệm vụ: Tìm 8-10 micro-niche (ngách nhỏ) TIỀM NĂNG CAO từ lĩnh vực lớn "${params.macroNiche}".
Ngôn ngữ đầu ra: ${lang}.

Yêu cầu chỉ số (ước lượng):
- Cạnh tranh: ${params.competition}/50 (Càng thấp càng tốt)
- Tìm kiếm: ${params.searchVolume}/100 (Càng cao càng tốt)
- Kiếm tiền (Ads/Affiliate): ${params.monetization}/100

Dựa trên xu hướng video thực tế: ${JSON.stringify(ytData)}

BẮT BUỘC TRẢ VỀ JSON HỢP LỆ (Không Markdown, không lời dẫn):
{
  "topNiches": [{
    "nicheName": "Tên ngách cụ thể (VD: Chế biến món ăn cho người tiểu đường)",
    "overallScore": 8.5,
    "competitionScore": 20,
    "searchVolumeScore": 75,
    "monetizationScore": 90,
    "pioneerVideoTopics": ["Tiêu đề video 1", "Tiêu đề video 2", "Tiêu đề video 3... (tổng 5-10 cái)"],
    "miningScript": {"tone":"Thân thiện/Chuyên gia","frequency":"2 video/tuần","monetizationGoal":"Adsense + Affiliate"},
    "lowFloorChannels": [{"name":"Tên kênh tham khảo","url":"URL kênh hoặc video"}]
  }],
  "saturatedNichesWarning": ["Ngách 1 đã bão hòa", "Ngách 2 quá cạnh tranh"]
}`;
  }

  const result = await model.generateContent(prompt);
  let text = result.response.text();

  // --- LOGIC CLEAN JSON MỚI ---
  // 1. Xóa markdown code block
  text = text.replace(/```json|```/g, '');
  
  // 2. Tìm vị trí dấu { đầu tiên và } cuối cùng để cắt bỏ lời dẫn thừa
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1) {
    text = text.substring(firstOpen, lastClose + 1);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini Parse Error. Raw text:", text);
    throw new Error("AI trả về dữ liệu lỗi. Vui lòng thử lại lần nữa.");
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });
  const { tool, ...params } = req.body;

  if (!['rival', 'hidden', 'micro'].includes(tool)) {
    return res.status(400).json({ error: 'Tool không hợp lệ' });
  }

  try {
    let ytData: any = {};

    if (tool === 'rival') {
        const info = extractFromUrl(params.targetUrl);
        if (!info) throw new Error('URL không hợp lệ');
  
        let channelId: string;
        if (info.type === 'video') {
          const v = await youtube.videos.list({ part: ['snippet'], id: [info.value] });
          channelId = v.data.items?.[0]?.snippet?.channelId!;
        } else {
          const c = await youtube.channels.list({
            part: ['snippet,statistics'],
            ...(info.value.startsWith('UC') ? { id: [info.value] } : { forHandle: info.value })
          });
          channelId = c.data.items?.[0]?.id!;
        }
  
        const [channelDetail, videos] = await Promise.all([
          youtube.channels.list({ part: ['snippet,statistics,topicDetails'], id: [channelId] }),
          youtube.search.list({ part: ['snippet'], channelId, type: 'video', order: 'date', maxResults: 30 })
        ]);
        ytData = { channel: channelDetail.data.items?.[0], videos: videos.data.items };

    } else if (tool === 'hidden') {
      const search = await youtube.search.list({
        part: ['snippet'],
        q: params.seedQuery,
        type: 'channel',
        maxResults: 50,
      });
      const ids = search.data.items?.map(i => i.snippet?.channelId).filter(Boolean)?.slice(0, 20) || [];
      const details = ids.length ? await youtube.channels.list({
        part: ['snippet,statistics'],
        id: ids.join(',')
      }) : { data: { items: [] } };

      const channelsWithThumbnail = details.data.items?.map(ch => ({
        id: ch.id,
        name: ch.snippet?.title || 'Unknown',
        description: ch.snippet?.description || '',
        subscribers: ch.statistics?.subscriberCount ? ch.statistics.subscriberCount.toLocaleString() : 'Hidden',
        videoCount: ch.statistics?.videoCount ? ch.statistics.videoCount.toLocaleString() : '0',
        thumbnail: ch.snippet?.thumbnails?.high?.url || ch.snippet?.thumbnails?.medium?.url || null
      })) || [];

      ytData = { 
        search: search.data, 
        details: { ...details.data, channelsWithThumbnail } 
      };

    } else if (tool === 'micro') {
      const search = await youtube.search.list({
        part: ['snippet'],
        q: params.macroNiche,
        type: 'video',
        order: 'relevance',
        maxResults: 40 // Tăng lên 40 để có nhiều dữ liệu hơn cho 2.5 phân tích
      });

      // --- KHẮC PHỤC CHÍNH Ở ĐÂY ---
      // Thay vì gửi search.data (nặng 100%), ta chỉ gửi Title, Desc, ChannelName (nhẹ 5%)
      // Điều này giúp Gemini 2.5 không bị loạn và trả về JSON chuẩn xác.
      ytData = search.data.items?.map(item => ({
        t: item.snippet?.title,        // Viết tắt key cho nhẹ token
        d: item.snippet?.description,
        c: item.snippet?.channelTitle
      })) || [];
    }

    const result = await analyzeWithGemini(tool, ytData, params, params.outputLanguage || 'Tiếng Việt');
    res.status(200).json(result);

  } catch (error: any) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message || "Lỗi hệ thống." });
  }
}
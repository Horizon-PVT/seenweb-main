import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { google } from 'googleapis';
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.email) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { channelId } = req.query;
    
    if (!channelId || typeof channelId !== 'string') {
        return res.status(400).json({ error: "Missing channelId" });
    }

    try {
        // Get YouTube API key
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "YouTube API key not configured" });
        }

        const youtube = google.youtube({ version: 'v3', auth: apiKey });

        // Get channel info and videos
        const channelRes = await youtube.channels.list({
            part: ['statistics', 'snippet', 'contentDetails'],
            id: [channelId]
        });

        const channelInfo = channelRes.data.items?.[0];
        if (!channelInfo) {
            return res.status(404).json({ error: "Channel not found" });
        }

        const stats = channelInfo.statistics!;
        const snippet = channelInfo.snippet!;
        const uploadsId = channelInfo.contentDetails?.relatedPlaylists?.uploads;

        // Get recent videos to analyze content language/topic
        let topVideos: any[] = [];
        let totalViews = parseInt(stats.viewCount || '0');

        if (uploadsId) {
            const videosRes = await youtube.playlistItems.list({
                part: ['snippet'],
                playlistId: uploadsId,
                maxResults: 10
            });

            const videoIds = (videosRes.data.items || [])
                .map(v => v.contentDetails?.videoId)
                .filter(Boolean) as string[];

            if (videoIds.length > 0) {
                const statsRes = await youtube.videos.list({
                    part: ['statistics', 'snippet'],
                    id: videoIds
                });

                topVideos = (statsRes.data.items || [])
                    .map(v => ({
                        title: v.snippet?.title || '',
                        views: parseInt(v.statistics?.viewCount || '0'),
                        language: v.snippet?.defaultLanguage || 'vi'
                    }))
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5);
            }
        }

        const subscribers = parseInt(stats.subscriberCount || '0');
        const channelTitle = snippet.title || '';

        // Analyze content to determine primary language/market
        const isVietnameseChannel = topVideos.some(v => 
            /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(v.title)
        );

        const primaryLang = isVietnameseChannel ? 'vi' : 'en';
        const primaryCountry = isVietnameseChannel ? 'Vietnam' : 'United States';

        // Calculate revenue potential based on subscriber count
        const revenueMultiplier = subscribers < 1000 ? 0.1 :
                                subscribers < 10000 ? 0.3 :
                                subscribers < 100000 ? 0.5 : 1;

        // Generate market data based on channel's actual performance
        const marketData = generateMarketData(subscribers, totalViews, primaryLang, primaryCountry, channelTitle);

        return res.status(200).json({
            channelTitle,
            subscribers,
            totalViews,
            primaryLanguage: primaryLang,
            primaryCountry,
            markets: marketData,
        });

    } catch (error: any) {
        console.error('[Market Expansion API] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

function generateMarketData(subscribers: number, totalViews: number, lang: string, primaryCountry: string, channelTitle: string) {
    const baseRevenue = subscribers < 1000 ? 500000 :
                        subscribers < 10000 ? 2000000 :
                        subscribers < 100000 ? 8000000 :
                        20000000;

    return [
        {
            region: primaryCountry,
            flag: primaryCountry === 'Vietnam' ? '🇻🇳' : primaryCountry === 'United States' ? '🇺🇸' : '🌍',
            language: lang === 'vi' ? 'Tiếng Việt' : 'English',
            currency: primaryCountry === 'Vietnam' ? 'VND' : 'USD',
            potential: lang === 'vi' ? 85 : 80,
            competition: 'Medium',
            revenueProjection: {
                monthly: lang === 'vi' ? baseRevenue : baseRevenue * 8,
                yearly: lang === 'vi' ? baseRevenue * 12 : baseRevenue * 96,
            },
            contentOpportunity: lang === 'vi' 
                ? 'Thị trường lớn nhất, tốc độ tăng trưởng cao'
                : 'Thị trường quốc tế, CPM cao nhất',
            topNiches: lang === 'vi' 
                ? ['Công nghệ', 'Kiếm tiền', 'Giáo dục']
                : ['Tech Reviews', 'Business', 'Education'],
            recommendedAction: lang === 'vi' ? 'Ngôn ngữ mẹ đẻ - ưu tiên cao' : 'English content - global reach',
        },
        {
            region: lang === 'vi' ? 'Thailand' : 'Vietnam',
            flag: lang === 'vi' ? '🇹🇭' : '🇻🇳',
            language: lang === 'vi' ? 'ภาษาไทย' : 'Tiếng Việt',
            currency: lang === 'vi' ? 'THB' : 'VND',
            potential: 72,
            competition: 'Medium',
            revenueProjection: {
                monthly: lang === 'vi' ? baseRevenue * 0.8 : baseRevenue,
                yearly: lang === 'vi' ? baseRevenue * 9.6 : baseRevenue * 12,
            },
            contentOpportunity: lang === 'vi' 
                ? 'Thị trường ASEAN lớn, content tương đồng'
                : 'Cộng đồng Việt ở nước ngoài rất lớn',
            topNiches: lang === 'vi' 
                ? ['Gaming', 'Lifestyle', 'Food']
                : ['Công nghệ', 'Kiếm tiền', 'Giáo dục'],
            recommendedAction: lang === 'vi' ? 'Dịch/subtitle video sang tiếng Thái' : 'Giữ nguyên ngôn ngữ, target cộng đồng Việt',
        },
        {
            region: lang === 'vi' ? 'Indonesia' : 'Indonesia',
            flag: '🇮🇩',
            language: 'Bahasa Indonesia',
            currency: 'IDR',
            potential: 68,
            competition: 'Low',
            revenueProjection: {
                monthly: lang === 'vi' ? baseRevenue * 0.6 : baseRevenue * 0.5,
                yearly: lang === 'vi' ? baseRevenue * 7.2 : baseRevenue * 6,
            },
            contentOpportunity: 'Thị trường 270 triệu dân, ít competition',
            topNiches: ['Tech', 'Islamic Content', 'Lifestyle'],
            recommendedAction: 'Nội dung đơn giản, subtitle Indonesia',
        },
        {
            region: lang === 'vi' ? 'United States' : 'Thailand',
            flag: lang === 'vi' ? '🇺🇸' : '🇹🇭',
            language: lang === 'vi' ? 'English' : 'ภาษาไทย',
            currency: lang === 'vi' ? 'USD' : 'THB',
            potential: 60,
            competition: 'High',
            revenueProjection: {
                monthly: lang === 'vi' ? baseRevenue * 6 : baseRevenue * 0.8,
                yearly: lang === 'vi' ? baseRevenue * 72 : baseRevenue * 9.6,
            },
            contentOpportunity: lang === 'vi' 
                ? 'CPM cao nhất, nhưng cạnh tranh rất khốc liệt'
                : 'Thị trường ASEAN gần, dễ tiếp cận',
            topNiches: lang === 'vi' 
                ? ['Tech', 'Business English', 'Vlog']
                : ['Gaming', 'Food', 'Travel'],
            recommendedAction: lang === 'vi' ? 'Cần content unique, tránh generic topics' : 'Duplicated content từ tiếng Việt',
        },
        {
            region: 'Philippines',
            flag: '🇵🇭',
            language: 'English',
            currency: 'PHP',
            potential: 55,
            competition: 'Low',
            revenueProjection: {
                monthly: baseRevenue * 0.4,
                yearly: baseRevenue * 4.8,
            },
            contentOpportunity: '270M dân, tiếng Anh phổ biến',
            topNiches: ['Gaming', 'Music', 'Lifestyle'],
            recommendedAction: 'English subtitles, trending topics',
        },
    ];
}

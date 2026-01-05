// lib/youtube-api.ts
// YouTube Data API v3 Integration với Caching
import { google } from 'googleapis';

const youtube = google.youtube('v3');

// Simple in-memory cache
interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Get cached data or fetch new
 */
function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return Promise.resolve(cached.data as T);
    }

    return fetcher().then(data => {
        cache.set(key, { data, timestamp: now });
        return data;
    });
}

/**
 * Search videos by keyword
 */
export async function searchVideos(keyword: string, maxResults: number = 5) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY not configured');
    }

    const cacheKey = `yt_search_${keyword}_${maxResults}`;

    return getCached(cacheKey, async () => {
        try {
            const response = await youtube.search.list({
                key: apiKey,
                part: ['snippet'],
                q: keyword,
                type: ['video'],
                maxResults,
                order: 'relevance', // Lấy video relevance cao nhất
                relevanceLanguage: 'vi', // Ưu tiên tiếng Việt, có thể auto-detect sau
            });

            const videoIds = (response.data.items?.map(item => item.id?.videoId) ?? []).filter((id): id is string => typeof id === 'string');

            // Lấy thêm statistics (views, likes, etc.)
            if (videoIds.length > 0) {
                const statsResponse = await youtube.videos.list({
                    key: apiKey,
                    part: ['statistics', 'snippet', 'contentDetails'],
                    id: videoIds,
                });

                return statsResponse.data.items || [];
            }

            return [];
        } catch (error: any) {
            console.error('YouTube API Error:', error.message);
            throw new Error('Failed to fetch YouTube data');
        }
    });
}

/**
 * Analyze top videos for SEO insights
 */
export interface VideoAnalysis {
    avgTitleLength: number;
    titlePatterns: {
        curiosity: number;    // ? ! ...
        result: number;       // how to, cách, guide
        mistake: number;      // don't, tránh, sai lầm
        comparison: number;   // vs, so sánh
    };
    avgViewCount: number;
    avgVideoAge: number; // in days
    topTitles: string[];
}

export async function analyzeTopVideos(videos: any[]): Promise<VideoAnalysis> {
    if (!videos || videos.length === 0) {
        return {
            avgTitleLength: 0,
            titlePatterns: { curiosity: 0, result: 0, mistake: 0, comparison: 0 },
            avgViewCount: 0,
            avgVideoAge: 0,
            topTitles: [],
        };
    }

    const titles = videos.map(v => v.snippet?.title || '');
    const avgTitleLength = Math.round(
        titles.reduce((sum, t) => sum + t.length, 0) / titles.length
    );

    // Pattern detection
    const patterns = {
        curiosity: titles.filter(t => /[?!]|\.\.\./.test(t)).length,
        result: titles.filter(t => /(how to|cách|guide|hướng dẫn|tutorial)/i.test(t)).length,
        mistake: titles.filter(t => /(don't|tránh|sai lầm|mistake|never)/i.test(t)).length,
        comparison: titles.filter(t => /(vs|so sánh|compare|hay)/i.test(t)).length,
    };

    // View count
    const viewCounts = videos.map(v => parseInt(v.statistics?.viewCount || '0'));
    const avgViewCount = Math.round(
        viewCounts.reduce((sum, vc) => sum + vc, 0) / viewCounts.length
    );

    // Video age (days since published)
    const now = Date.now();
    const ages = videos.map(v => {
        const published = new Date(v.snippet?.publishedAt || now).getTime();
        return Math.floor((now - published) / (1000 * 60 * 60 * 24));
    });
    const avgVideoAge = Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);

    return {
        avgTitleLength,
        titlePatterns: patterns,
        avgViewCount,
        avgVideoAge,
        topTitles: titles,
    };
}

/**
 * Extract main keyword from title/idea
 */
export function extractMainKeyword(text: string): string {
    // Simple extraction: lấy 2-4 từ đầu tiên (loại bỏ stop words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'với', 'và', 'các', 'của'];
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.includes(w));

    return words.slice(0, 3).join(' ');
}

/**
 * Generate optimized title based on competitor data
 */
export interface OptimizedTitle {
    text: string;
    reasoning: string;
    improvements: string[];
}

export function generateOptimizedTitle(
    aiTitles: string[],
    analysis: VideoAnalysis,
    keyword: string
): OptimizedTitle {
    // Chọn title AI tốt nhất
    const bestAiTitle = aiTitles[0] || keyword;

    // Determine dominant pattern
    const { titlePatterns } = analysis;
    const maxPattern = Object.entries(titlePatterns).reduce((a, b) =>
        titlePatterns[a[0] as keyof typeof titlePatterns] > titlePatterns[b[0] as keyof typeof titlePatterns] ? a : b
    )[0];

    // Suggest different hook if possible
    const suggestedHook =
        maxPattern === 'result' ? 'curiosity' :
            maxPattern === 'curiosity' ? 'mistake' :
                'result';

    const improvements: string[] = [];
    let optimizedText = bestAiTitle;

    // 1. Length check (≤ 65 chars)
    if (optimizedText.length > 65) {
        optimizedText = optimizedText.substring(0, 62) + '...';
        improvements.push('Rút ngắn xuống ≤ 65 ký tự');
    }

    // 2. Keyword position (should be in first 1/3)
    const firstThird = Math.floor(optimizedText.length / 3);
    const keywordPos = optimizedText.toLowerCase().indexOf(keyword.toLowerCase());
    if (keywordPos > firstThird) {
        improvements.push('Di chuyển keyword lên đầu title');
        // Reconstruct title with keyword first
        optimizedText = `${keyword}: ${optimizedText.replace(new RegExp(keyword, 'gi'), '').trim()}`;
        if (optimizedText.length > 65) {
            optimizedText = optimizedText.substring(0, 62) + '...';
        }
    }

    // 3. Add hook if missing
    const hasHook = /[?!]/.test(optimizedText);
    if (!hasHook && suggestedHook === 'curiosity') {
        improvements.push('Thêm curiosity hook (?, !)');
    } else if (suggestedHook === 'mistake' && !/tránh|sai lầm|don't/i.test(optimizedText)) {
        improvements.push('Xem xét angle "sai lầm cần tránh"');
    }

    const reasoning = `Dựa trên phân tích ${analysis.topTitles.length} video top: `
        + `độ dài trung bình ${analysis.avgTitleLength} ký tự, `
        + `pattern phổ biến nhất là "${maxPattern}". `
        + `Đề xuất sử dụng "${suggestedHook}" hook để khác biệt.`;

    return {
        text: optimizedText,
        reasoning,
        improvements,
    };
}

/**
 * Compare description with competitors
 */
export function compareDescriptions(
    myDesc: string,
    competitorDescriptions: string[]
): {
    first200Comparison: string;
    suggestedDifferentiation: string;
} {
    const my200 = myDesc.substring(0, 200).toLowerCase();
    const competitor200s = competitorDescriptions.map(d => d.substring(0, 200).toLowerCase());

    // Check similarity (simple keyword overlap)
    const myKeywords = my200.split(/\s+/).filter(w => w.length > 3);
    const overlapCounts = competitor200s.map(comp => {
        const compKeywords = comp.split(/\s+/).filter(w => w.length > 3);
        const overlap = myKeywords.filter(k => compKeywords.includes(k)).length;
        return overlap / myKeywords.length;
    });

    const avgOverlap = overlapCounts.reduce((a, b) => a + b, 0) / overlapCounts.length;

    const first200Comparison = avgOverlap > 0.6
        ? '⚠️ 200 ký tự đầu có nhiều overlap với đối thủ (>60%)'
        : avgOverlap > 0.4
            ? '✅ Có sự khác biệt vừa phải với đối thủ'
            : '✅ Rất khác biệt so với đối thủ';

    const suggestedDifferentiation = avgOverlap > 0.6
        ? 'Nên đổi angle hoặc nhấn mạnh unique value proposition ngay từ đầu'
        : 'Giữ nguyên approach hiện tại';

    return {
        first200Comparison,
        suggestedDifferentiation,
    };
}

/**
 * Categorize tags
 */
export interface CategorizedTags {
    highIntent: { text: string; reason: string }[];
    midTail: { text: string }[];
    entity: { text: string }[];
    related: { text: string }[];
    competitorOverlap: string[];
    weakTags: { text: string; reason: string }[];
}

export function categorizeTags(
    tags: string[],
    competitorTags: string[][] = []
): CategorizedTags {
    const allCompetitorTags = competitorTags.flat().map(t => t.toLowerCase());
    const competitorOverlap = tags.filter(tag =>
        allCompetitorTags.includes(tag.toLowerCase())
    );

    // Simple heuristic categorization
    const highIntent: { text: string; reason: string }[] = [];
    const midTail: { text: string }[] = [];
    const entity: { text: string }[] = [];
    const related: { text: string }[] = [];
    const weakTags: { text: string; reason: string }[] = [];

    tags.forEach(tag => {
        const lower = tag.toLowerCase();
        const wordCount = tag.split(/\s+/).length;

        // Very generic (1 word, common) = weak
        if (wordCount === 1 && ['video', 'tutorial', 'guide', 'tips', 'how'].includes(lower)) {
            weakTags.push({ text: tag, reason: 'Quá chung, cạnh tranh cao' });
            return;
        }

        // Long-tail (3+ words) = high intent
        if (wordCount >= 3) {
            highIntent.push({ text: tag, reason: 'Long-tail keyword, cạnh tranh thấp' });
        }
        // 2 words = mid-tail
        else if (wordCount === 2) {
            midTail.push({ text: tag });
        }
        // Proper noun / brand / topic = entity
        else if (/^[A-Z]/.test(tag) || /\d/.test(tag)) {
            entity.push({ text: tag });
        }
        // Others = related
        else {
            related.push({ text: tag });
        }
    });

    return {
        highIntent,
        midTail,
        entity,
        related,
        competitorOverlap,
        weakTags,
    };
}

/**
 * Classify thumbnail angle
 */
export type ThumbnailAngle = 'curiosity' | 'result' | 'contrarian';

export function classifyThumbnailAngle(thumbnailText: string, concept: string): ThumbnailAngle {
    const combined = `${thumbnailText} ${concept}`.toLowerCase();

    if (/why|what|how|secret|hidden|\?/.test(combined)) {
        return 'curiosity';
    } else if (/result|success|số liệu|kết quả|achieved|won/.test(combined)) {
        return 'result';
    } else {
        return 'contrarian';
    }
}

/**
 * Assess topic difficulty based on competitor data
 */
export type TopicDifficulty = 'easy' | 'medium' | 'saturated';

export function assessTopicDifficulty(analysis: VideoAnalysis): TopicDifficulty {
    const { avgViewCount, avgVideoAge } = analysis;

    // Heuristic:
    // - High views + old videos = saturated
    // - Low views + recent videos = easy
    // - Mixed = medium

    if (avgViewCount > 500000 && avgVideoAge > 180) {
        return 'saturated';
    } else if (avgViewCount < 50000 || avgVideoAge < 30) {
        return 'easy';
    } else {
        return 'medium';
    }
}

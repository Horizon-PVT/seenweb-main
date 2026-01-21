// pages/api/extension/seo-score.ts - SEO Score Calculator for Extension
import type { NextApiRequest, NextApiResponse } from 'next';

interface SEOBreakdown {
    score: number;
    issues: string[];
}

interface SEOScoreResponse {
    overallScore: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    breakdown: {
        title: SEOBreakdown;
        description: SEOBreakdown;
        tags: SEOBreakdown;
        thumbnail: SEOBreakdown;
    };
    tips: string[];
}

interface RequestBody {
    videoId: string;
    title: string;
    description: string;
    tags: string[];
    hasThumbnail?: boolean;
}

// --- SCORING FUNCTIONS ---

function scoreTitle(title: string): SEOBreakdown {
    const issues: string[] = [];
    let score = 100;

    // Length check (optimal: 40-60 chars)
    if (title.length < 30) {
        score -= 20;
        issues.push('Title quá ngắn (< 30 ký tự)');
    } else if (title.length > 70) {
        score -= 15;
        issues.push('Title quá dài (> 70 ký tự), YouTube sẽ cắt bớt');
    } else if (title.length > 60) {
        score -= 5;
        issues.push('Title hơi dài, nên rút xuống < 60 ký tự');
    }

    // Uppercase check (ALL CAPS is bad)
    if (title === title.toUpperCase() && title.length > 10) {
        score -= 10;
        issues.push('Không nên viết toàn chữ IN HOA');
    }

    // Hook elements
    const hasQuestion = /\?/.test(title);
    const hasNumbers = /\d/.test(title);
    const hasEmotionalWords = /(đừng|bí mật|sai lầm|tránh|không thể|tuyệt vời|đáng sợ|kinh ngạc)/i.test(title);
    const hasPowerWords = /(cách|hướng dẫn|mẹo|tips|secrets|free|miễn phí)/i.test(title);

    if (!hasQuestion && !hasNumbers && !hasEmotionalWords) {
        score -= 10;
        issues.push('Thiếu hook (số, câu hỏi, hoặc từ gợi cảm xúc)');
    }

    if (hasNumbers) score += 5;
    if (hasEmotionalWords) score += 5;
    if (hasPowerWords) score += 5;

    return { score: Math.min(100, Math.max(0, score)), issues };
}

function scoreDescription(description: string): SEOBreakdown {
    const issues: string[] = [];
    let score = 100;

    // Length check (optimal: 200-5000 chars)
    if (description.length < 100) {
        score -= 30;
        issues.push('Description quá ngắn (< 100 ký tự)');
    } else if (description.length < 200) {
        score -= 15;
        issues.push('Description nên dài hơn (> 200 ký tự)');
    }

    // First 200 chars are crucial
    const first200 = description.substring(0, 200);

    // Check for links
    const hasLinks = /(https?:\/\/|www\.)/i.test(description);
    if (!hasLinks) {
        score -= 10;
        issues.push('Thiếu link trong description');
    }

    // Check for CTA
    const hasCTA = /(subscribe|đăng ký|follow|theo dõi|like|comment|chia sẻ|share)/i.test(description);
    if (!hasCTA) {
        score -= 10;
        issues.push('Thiếu Call-to-Action (đăng ký, like, share)');
    }

    // Check for timestamps
    const hasTimestamps = /\d{1,2}:\d{2}/.test(description);
    if (hasTimestamps) {
        score += 10; // Bonus for timestamps
    }

    // Check for hashtags
    const hasHashtags = /#\w+/.test(description);
    if (!hasHashtags) {
        score -= 5;
        issues.push('Nên thêm 3-5 hashtags');
    }

    // Check for emojis (good for engagement)
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(description);
    if (hasEmojis) {
        score += 5; // Bonus for emojis
    }

    return { score: Math.min(100, Math.max(0, score)), issues };
}

function scoreTags(tags: string[]): SEOBreakdown {
    const issues: string[] = [];
    let score = 100;

    // Tag count (optimal: 8-15)
    if (tags.length === 0) {
        score -= 40;
        issues.push('Không có tags');
    } else if (tags.length < 5) {
        score -= 20;
        issues.push(`Quá ít tags (${tags.length}/15 tags tối đa)`);
    } else if (tags.length < 8) {
        score -= 10;
        issues.push('Nên thêm tags (8-15 tags là tối ưu)');
    }

    // Check for mix of short and long-tail keywords
    const shortTags = tags.filter(t => t.split(' ').length === 1);
    const longTailTags = tags.filter(t => t.split(' ').length >= 3);

    if (longTailTags.length === 0 && tags.length > 0) {
        score -= 15;
        issues.push('Thiếu long-tail keywords (3+ từ)');
    }

    if (shortTags.length === tags.length && tags.length > 0) {
        score -= 10;
        issues.push('Cần mix giữa tags ngắn và dài');
    }

    // Check for very generic tags
    const genericTags = tags.filter(t =>
        ['video', 'youtube', 'viral', 'trending', 'hay', 'hot'].includes(t.toLowerCase())
    );
    if (genericTags.length > 0) {
        score -= 5;
        issues.push(`Có ${genericTags.length} tags quá chung chung`);
    }

    return { score: Math.min(100, Math.max(0, score)), issues };
}

function scoreThumbnail(hasThumbnail: boolean): SEOBreakdown {
    // Since we can't analyze thumbnail content from extension, just basic checks
    if (hasThumbnail) {
        return {
            score: 85,
            issues: ['Không thể phân tích nội dung thumbnail từ extension']
        };
    }
    return {
        score: 50,
        issues: ['Không phát hiện custom thumbnail']
    };
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
}

function generateTips(breakdown: SEOScoreResponse['breakdown']): string[] {
    const tips: string[] = [];

    // Find lowest scoring areas
    const areas = [
        { name: 'Title', data: breakdown.title },
        { name: 'Description', data: breakdown.description },
        { name: 'Tags', data: breakdown.tags },
        { name: 'Thumbnail', data: breakdown.thumbnail },
    ].sort((a, b) => a.data.score - b.data.score);

    // Get top 3 issues from lowest scoring areas
    for (const area of areas) {
        for (const issue of area.data.issues.slice(0, 2)) {
            tips.push(issue);
            if (tips.length >= 5) break;
        }
        if (tips.length >= 5) break;
    }

    // Add generic tip if needed
    if (tips.length === 0) {
        tips.push('SEO đã được tối ưu tốt! Tiếp tục duy trì.');
    }

    return tips;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SEOScoreResponse | { error: string }>
) {
    // Allow CORS for extension
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { title, description, tags, hasThumbnail = true }: RequestBody = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Missing title' });
        }

        // Calculate scores
        const titleScore = scoreTitle(title);
        const descriptionScore = scoreDescription(description || '');
        const tagsScore = scoreTags(tags || []);
        const thumbnailScore = scoreThumbnail(hasThumbnail);

        // Calculate weighted overall score
        const overallScore = Math.round(
            titleScore.score * 0.30 +      // Title: 30%
            descriptionScore.score * 0.25 + // Description: 25%
            tagsScore.score * 0.25 +        // Tags: 25%
            thumbnailScore.score * 0.20     // Thumbnail: 20%
        );

        const breakdown = {
            title: titleScore,
            description: descriptionScore,
            tags: tagsScore,
            thumbnail: thumbnailScore,
        };

        const response: SEOScoreResponse = {
            overallScore,
            grade: getGrade(overallScore),
            breakdown,
            tips: generateTips(breakdown),
        };

        return res.status(200).json(response);
    } catch (error: any) {
        console.error('SEO Score Error:', error);
        return res.status(500).json({ error: 'Failed to calculate SEO score' });
    }
}

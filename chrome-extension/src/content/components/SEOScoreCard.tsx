// SEOScoreCard.tsx - SEO Score Display Component
import { useState, useEffect } from 'react';

interface SEOBreakdown {
    score: number;
    issues: string[];
}

interface SEOScoreData {
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

interface Props {
    videoData: {
        title: string;
        description: string;
        tags: string[];
    };
}


const SEOScoreCard = ({ videoData }: Props) => {
    const [data, setData] = useState<SEOScoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Calculate locally - no API needed
        setLoading(true);
        setTimeout(() => {
            setData(calculateLocalScore(videoData));
            setLoading(false);
        }, 500); // Small delay for UX
    }, [videoData.title]);

    // Full local SEO calculation
    const calculateLocalScore = (vd: Props['videoData']): SEOScoreData => {
        const titleResult = scoreTitle(vd.title);
        const descResult = scoreDescription(vd.description);
        const tagResult = scoreTags(vd.tags);
        const thumbResult = { score: 85, issues: [] }; // Assume has thumbnail

        const overall = Math.round(
            titleResult.score * 0.30 +
            descResult.score * 0.25 +
            tagResult.score * 0.25 +
            thumbResult.score * 0.20
        );

        return {
            overallScore: overall,
            grade: overall >= 90 ? 'A' : overall >= 75 ? 'B' : overall >= 60 ? 'C' : overall >= 40 ? 'D' : 'F',
            breakdown: {
                title: titleResult,
                description: descResult,
                tags: tagResult,
                thumbnail: thumbResult,
            },
            tips: generateTips({ title: titleResult, description: descResult, tags: tagResult, thumbnail: thumbResult }),
        };
    };

    // Title scoring
    const scoreTitle = (title: string): SEOBreakdown => {
        const issues: string[] = [];
        let score = 100;

        if (title.length < 30) {
            score -= 20;
            issues.push('Title quá ngắn (< 30 ký tự)');
        } else if (title.length > 70) {
            score -= 15;
            issues.push('Title quá dài, YouTube sẽ cắt bớt');
        } else if (title.length > 60) {
            score -= 5;
        }

        if (title === title.toUpperCase() && title.length > 10) {
            score -= 10;
            issues.push('Không nên viết toàn chữ IN HOA');
        }

        const hasNumbers = /\d/.test(title);
        const hasEmotional = /(đừng|bí mật|sai lầm|tránh|tuyệt vời|kinh ngạc|why|how|secret)/i.test(title);

        if (!hasNumbers && !hasEmotional && !/[?!]/.test(title)) {
            score -= 10;
            issues.push('Thiếu hook (số, câu hỏi, từ gợi cảm xúc)');
        }

        if (hasNumbers) score = Math.min(100, score + 5);
        if (hasEmotional) score = Math.min(100, score + 5);

        return { score: Math.max(0, score), issues };
    };

    // Description scoring
    const scoreDescription = (desc: string): SEOBreakdown => {
        const issues: string[] = [];
        let score = 100;

        if (desc.length < 100) {
            score -= 30;
            issues.push('Description quá ngắn');
        } else if (desc.length < 200) {
            score -= 15;
            issues.push('Nên viết description dài hơn');
        }

        if (!/(https?:\/\/|www\.)/i.test(desc)) {
            score -= 10;
            issues.push('Thiếu link trong description');
        }

        if (!/(subscribe|đăng ký|follow|theo dõi|like)/i.test(desc)) {
            score -= 10;
            issues.push('Thiếu Call-to-Action');
        }

        if (/\d{1,2}:\d{2}/.test(desc)) score = Math.min(100, score + 10);
        if (!/#\w+/.test(desc)) {
            score -= 5;
            issues.push('Nên thêm hashtags');
        }

        return { score: Math.max(0, score), issues };
    };

    // Tags scoring
    const scoreTags = (tags: string[]): SEOBreakdown => {
        const issues: string[] = [];
        let score = 100;

        if (tags.length === 0) {
            score -= 40;
            issues.push('Không có tags');
        } else if (tags.length < 5) {
            score -= 20;
            issues.push(`Quá ít tags (${tags.length}/15)`);
        } else if (tags.length < 8) {
            score -= 10;
            issues.push('Nên thêm tags (8-15 tối ưu)');
        }

        const longTailTags = tags.filter(t => t.split(' ').length >= 3);
        if (longTailTags.length === 0 && tags.length > 0) {
            score -= 15;
            issues.push('Thiếu long-tail keywords');
        }

        return { score: Math.max(0, score), issues };
    };

    // Generate tips from issues
    const generateTips = (breakdown: SEOScoreData['breakdown']): string[] => {
        const tips: string[] = [];
        const areas = [
            { name: 'Title', data: breakdown.title },
            { name: 'Description', data: breakdown.description },
            { name: 'Tags', data: breakdown.tags },
        ].sort((a, b) => a.data.score - b.data.score);

        for (const area of areas) {
            for (const issue of area.data.issues.slice(0, 2)) {
                tips.push(issue);
                if (tips.length >= 4) break;
            }
            if (tips.length >= 4) break;
        }

        if (tips.length === 0) tips.push('SEO đã tối ưu tốt! Tiếp tục duy trì.');
        return tips;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getGradeColor = (grade: string) => {
        if (grade === 'A') return 'bg-emerald-500';
        if (grade === 'B') return 'bg-green-500';
        if (grade === 'C') return 'bg-yellow-500';
        if (grade === 'D') return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'from-emerald-400 to-emerald-600';
        if (score >= 60) return 'from-yellow-400 to-yellow-600';
        return 'from-red-400 to-red-600';
    };

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-xl border border-slate-100 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                <span className="text-red-600 text-sm">Đang tính toán...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Main Score */}
            <div className="p-4 flex items-center gap-4">
                {/* Circular Progress */}
                <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="12"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${data.overallScore * 2.64} 264`}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" className={`${getProgressColor(data.overallScore).split(' ')[0].replace('from-', 'stop-')}`} stopColor={data.overallScore >= 80 ? '#34d399' : data.overallScore >= 60 ? '#fbbf24' : '#f87171'} />
                                <stop offset="100%" className={`${getProgressColor(data.overallScore).split(' ')[1].replace('to-', 'stop-')}`} stopColor={data.overallScore >= 80 ? '#059669' : data.overallScore >= 60 ? '#d97706' : '#dc2626'} />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Score text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-black ${getScoreColor(data.overallScore)}`}>{data.overallScore}</span>
                        <span className={`text-[8px] font-bold text-white px-1.5 rounded ${getGradeColor(data.grade)}`}>
                            Grade {data.grade}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📊</span>
                        <span className="text-sm font-bold text-slate-800">SEO SCORE</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                        {data.overallScore >= 80 ? '✅ Tuyệt vời! Video được tối ưu tốt.' :
                            data.overallScore >= 60 ? '⚠️ Khá tốt, nhưng có thể cải thiện.' :
                                '🔴 Cần cải thiện nhiều để tăng ranking.'}
                    </p>
                </div>
            </div>

            {/* Breakdown Toggle */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
                <span className="font-semibold">Chi tiết phân tích</span>
                <svg
                    className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expanded Breakdown */}
            {expanded && (
                <div className="p-4 space-y-3 border-t border-slate-100 bg-slate-50/50">
                    {/* Each breakdown item */}
                    {[
                        { key: 'title', label: 'Title', icon: '📌', score: data.breakdown.title.score },
                        { key: 'description', label: 'Description', icon: '📝', score: data.breakdown.description.score },
                        { key: 'tags', label: 'Tags', icon: '🏷️', score: data.breakdown.tags.score },
                        { key: 'thumbnail', label: 'Thumbnail', icon: '🖼️', score: data.breakdown.thumbnail.score },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center gap-3">
                            <span className="text-base">{item.icon}</span>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-medium text-slate-600">{item.label}</span>
                                    <span className={`text-[10px] font-bold ${getScoreColor(item.score)}`}>{item.score}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(item.score)} transition-all duration-500`}
                                        style={{ width: `${item.score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Tips */}
                    {data.tips.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-[10px] font-bold text-slate-700 mb-2 flex items-center gap-1">
                                <span>💡</span> Gợi ý cải thiện:
                            </p>
                            <ul className="space-y-1">
                                {data.tips.slice(0, 3).map((tip, i) => (
                                    <li key={i} className="text-[9px] text-slate-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-red-400">
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SEOScoreCard;

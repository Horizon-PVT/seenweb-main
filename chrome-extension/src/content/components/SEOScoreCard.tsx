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

const API_BASE = 'https://seenyt.net';

const SEOScoreCard = ({ videoData }: Props) => {
    const [data, setData] = useState<SEOScoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetchSEOScore();
    }, [videoData.title]);

    const fetchSEOScore = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/extension/seo-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: videoData.title,
                    description: videoData.description,
                    tags: videoData.tags,
                    hasThumbnail: true,
                }),
            });

            if (!res.ok) throw new Error('API Error');
            const result = await res.json();
            setData(result);
        } catch (err) {
            setError('Không thể tính SEO Score');
            // Fallback: calculate locally
            setData(calculateLocalScore(videoData));
        } finally {
            setLoading(false);
        }
    };

    // Local fallback calculation
    const calculateLocalScore = (vd: Props['videoData']): SEOScoreData => {
        let titleScore = 70;
        let descScore = 60;
        let tagScore = 50;

        if (vd.title.length > 30 && vd.title.length < 70) titleScore += 15;
        if (/[?!]|\d/.test(vd.title)) titleScore += 10;

        if (vd.description.length > 100) descScore += 20;
        if (/(subscribe|đăng ký)/i.test(vd.description)) descScore += 10;

        if (vd.tags.length >= 5) tagScore += 20;
        if (vd.tags.length >= 10) tagScore += 10;

        const overall = Math.round(titleScore * 0.3 + descScore * 0.25 + tagScore * 0.25 + 80 * 0.2);

        return {
            overallScore: overall,
            grade: overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : 'D',
            breakdown: {
                title: { score: titleScore, issues: [] },
                description: { score: descScore, issues: [] },
                tags: { score: tagScore, issues: [] },
                thumbnail: { score: 80, issues: [] },
            },
            tips: ['Phân tích offline - kết nối API để có kết quả chi tiết hơn'],
        };
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
                <span className="text-red-600 text-sm">{error || 'Lỗi không xác định'}</span>
                <button onClick={fetchSEOScore} className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-lg">
                    Thử lại
                </button>
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

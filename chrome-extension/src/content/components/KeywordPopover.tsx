// KeywordPopover.tsx - Keyword Insights Popover Component (Offline Version)
import { useState, useEffect, useRef } from 'react';

interface KeywordInsight {
    keyword: string;
    volume: 'very-high' | 'high' | 'medium' | 'low';
    competition: 'high' | 'medium' | 'low';
    trend: 'rising' | 'stable' | 'declining';
    score: number;
    relatedKeywords: string[];
}

interface Props {
    keyword: string;
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
}

const KeywordPopover = ({ keyword, isOpen, onClose, position }: Props) => {
    const [data, setData] = useState<KeywordInsight | null>(null);
    const [loading, setLoading] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && keyword) {
            analyzeKeyword();
        }
    }, [isOpen, keyword]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Local keyword analysis (heuristic-based)
    const analyzeKeyword = () => {
        setLoading(true);

        setTimeout(() => {
            const words = keyword.toLowerCase().split(' ');
            const wordCount = words.length;

            // Heuristic scoring based on keyword characteristics
            let volumeScore = 50;
            let competitionScore = 50;

            // Long-tail keywords usually have lower competition
            if (wordCount >= 3) {
                competitionScore -= 20;
                volumeScore -= 10;
            } else if (wordCount === 1) {
                competitionScore += 20;
                volumeScore += 20;
            }

            // Common high-volume keywords
            const highVolumePatterns = /youtube|kiếm tiền|làm|cách|hướng dẫn|tutorial|how to|free|miễn phí/i;
            if (highVolumePatterns.test(keyword)) {
                volumeScore += 30;
                competitionScore += 20;
            }

            // Trend estimation (newer topics trend higher)
            const trendingPatterns = /2026|2025|ai|chatgpt|gemini|mới|new|trend/i;
            const isTrending = trendingPatterns.test(keyword);

            // Calculate opportunity score
            const opportunityScore = Math.round(
                100 - competitionScore + (volumeScore / 2) + (isTrending ? 15 : 0)
            );

            // Determine categories
            let volume: KeywordInsight['volume'] = 'medium';
            if (volumeScore >= 70) volume = 'very-high';
            else if (volumeScore >= 50) volume = 'high';
            else if (volumeScore < 30) volume = 'low';

            let competition: KeywordInsight['competition'] = 'medium';
            if (competitionScore >= 60) competition = 'high';
            else if (competitionScore < 40) competition = 'low';

            const trend: KeywordInsight['trend'] = isTrending ? 'rising' : (wordCount >= 3 ? 'stable' : 'stable');

            // Generate related keywords
            const relatedKeywords = [
                `cách ${words[0]}`,
                `${keyword} cho người mới`,
                `hướng dẫn ${keyword}`,
                `${keyword} 2026`,
                `${words[0]} tips`
            ];

            setData({
                keyword,
                volume,
                competition,
                trend,
                score: Math.min(100, Math.max(0, opportunityScore)),
                relatedKeywords
            });
            setLoading(false);
        }, 600);
    };

    const getVolumeConfig = (vol: string) => {
        switch (vol) {
            case 'very-high': return { color: 'text-red-600 bg-red-100', icon: '🔥', label: 'Rất cao' };
            case 'high': return { color: 'text-orange-600 bg-orange-100', icon: '📈', label: 'Cao' };
            case 'medium': return { color: 'text-yellow-600 bg-yellow-100', icon: '📊', label: 'Trung bình' };
            default: return { color: 'text-slate-600 bg-slate-100', icon: '📉', label: 'Thấp' };
        }
    };

    const getCompetitionConfig = (comp: string) => {
        switch (comp) {
            case 'high': return { color: 'text-red-600 bg-red-100', icon: '🔴', label: 'Cao' };
            case 'medium': return { color: 'text-yellow-600 bg-yellow-100', icon: '🟡', label: 'Trung bình' };
            default: return { color: 'text-emerald-600 bg-emerald-100', icon: '🟢', label: 'Thấp' };
        }
    };

    const getTrendConfig = (trend: string) => {
        switch (trend) {
            case 'rising': return { color: 'text-emerald-600', icon: '📈', label: 'Đang tăng' };
            case 'stable': return { color: 'text-blue-600', icon: '➡️', label: 'Ổn định' };
            default: return { color: 'text-red-600', icon: '📉', label: 'Đang giảm' };
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={popoverRef}
            className="fixed z-[10000] bg-white rounded-xl shadow-2xl border border-slate-200 w-72 overflow-hidden"
            style={{
                top: Math.min(position.y, window.innerHeight - 400),
                left: Math.min(position.x, window.innerWidth - 300),
            }}
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <span className="text-white font-bold text-sm truncate max-w-[180px]">{keyword}</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white text-lg leading-none"
                >
                    ×
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading && (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                        <p className="text-xs text-slate-500">Đang phân tích keyword...</p>
                    </div>
                )}

                {!loading && data && (
                    <div className="space-y-4">
                        {/* Opportunity Score */}
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Opportunity Score</p>
                            <div className="relative w-20 h-20 mx-auto">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        stroke={data.score >= 70 ? '#34d399' : data.score >= 40 ? '#fbbf24' : '#f87171'}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${data.score * 2.64} 264`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-2xl font-black ${data.score >= 70 ? 'text-emerald-600' : data.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {data.score}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-2">
                                {data.score >= 70 ? '✅ Cơ hội tốt!' : data.score >= 40 ? '⚡ Khả thi' : '⚠️ Cạnh tranh cao'}
                            </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 rounded-lg bg-slate-50">
                                <span className="text-lg block mb-1">{getVolumeConfig(data.volume).icon}</span>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Volume</p>
                                <p className={`text-[10px] font-bold ${getVolumeConfig(data.volume).color.split(' ')[0]}`}>
                                    {getVolumeConfig(data.volume).label}
                                </p>
                            </div>

                            <div className="text-center p-2 rounded-lg bg-slate-50">
                                <span className="text-lg block mb-1">{getCompetitionConfig(data.competition).icon}</span>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Cạnh tranh</p>
                                <p className={`text-[10px] font-bold ${getCompetitionConfig(data.competition).color.split(' ')[0]}`}>
                                    {getCompetitionConfig(data.competition).label}
                                </p>
                            </div>

                            <div className="text-center p-2 rounded-lg bg-slate-50">
                                <span className="text-lg block mb-1">{getTrendConfig(data.trend).icon}</span>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Xu hướng</p>
                                <p className={`text-[10px] font-bold ${getTrendConfig(data.trend).color}`}>
                                    {getTrendConfig(data.trend).label}
                                </p>
                            </div>
                        </div>

                        {/* Related Keywords */}
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                                <span>🔗</span> Keywords liên quan
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {data.relatedKeywords.map((kw, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                                        onClick={() => {
                                            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(kw)}`, '_blank');
                                        }}
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={() => {
                                window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`, '_blank');
                            }}
                            className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span>🔎</span> Tìm trên YouTube
                        </button>

                        {/* Disclaimer */}
                        <p className="text-[8px] text-slate-400 text-center">
                            * Phân tích dựa trên pattern. Deploy APIs để có data chính xác hơn.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeywordPopover;

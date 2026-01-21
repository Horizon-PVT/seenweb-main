// KeywordPopover.tsx - Keyword Insights Popover Component
import { useState, useEffect, useRef } from 'react';

interface KeywordInsight {
    keyword: string;
    volume: 'very-high' | 'high' | 'medium' | 'low';
    competition: 'high' | 'medium' | 'low';
    trend: 'rising' | 'stable' | 'declining';
    score: number;
    relatedKeywords: string[];
    topVideos?: {
        title: string;
        views: string;
        age: string;
    }[];
}

interface Props {
    keyword: string;
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
}

const API_BASE = 'https://seenyt.net';

const KeywordPopover = ({ keyword, isOpen, onClose, position }: Props) => {
    const [data, setData] = useState<KeywordInsight | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && keyword) {
            fetchKeywordData();
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

    const fetchKeywordData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/extension/keyword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword }),
            });

            if (!res.ok) throw new Error('API Error');
            const result = await res.json();
            setData(result);
        } catch (err) {
            setError('Không thể tải dữ liệu');
            // Fallback data
            setData({
                keyword,
                volume: 'medium',
                competition: 'medium',
                trend: 'stable',
                score: 50,
                relatedKeywords: [`cách ${keyword}`, `${keyword} hay nhất`, `hướng dẫn ${keyword}`],
            });
        } finally {
            setLoading(false);
        }
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
            className="fixed z-[10000] bg-white rounded-xl shadow-2xl border border-slate-200 w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
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
                                        stroke="url(#kw-gradient)"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${data.score * 2.64} 264`}
                                    />
                                    <defs>
                                        <linearGradient id="kw-gradient">
                                            <stop offset="0%" stopColor={data.score >= 70 ? '#34d399' : data.score >= 40 ? '#fbbf24' : '#f87171'} />
                                            <stop offset="100%" stopColor={data.score >= 70 ? '#059669' : data.score >= 40 ? '#d97706' : '#dc2626'} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-2xl font-black ${data.score >= 70 ? 'text-emerald-600' : data.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {data.score}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            {/* Volume */}
                            <div className="text-center p-2 rounded-lg bg-slate-50">
                                <span className="text-lg block mb-1">{getVolumeConfig(data.volume).icon}</span>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Volume</p>
                                <p className={`text-[10px] font-bold ${getVolumeConfig(data.volume).color.split(' ')[0]}`}>
                                    {getVolumeConfig(data.volume).label}
                                </p>
                            </div>

                            {/* Competition */}
                            <div className="text-center p-2 rounded-lg bg-slate-50">
                                <span className="text-lg block mb-1">{getCompetitionConfig(data.competition).icon}</span>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Cạnh tranh</p>
                                <p className={`text-[10px] font-bold ${getCompetitionConfig(data.competition).color.split(' ')[0]}`}>
                                    {getCompetitionConfig(data.competition).label}
                                </p>
                            </div>

                            {/* Trend */}
                            <div className="text-center p-2 rounded-lg bg-slate-50">
                                <span className="text-lg block mb-1">{getTrendConfig(data.trend).icon}</span>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Xu hướng</p>
                                <p className={`text-[10px] font-bold ${getTrendConfig(data.trend).color}`}>
                                    {getTrendConfig(data.trend).label}
                                </p>
                            </div>
                        </div>

                        {/* Related Keywords */}
                        {data.relatedKeywords.length > 0 && (
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                                    <span>🔗</span> Keywords liên quan
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.relatedKeywords.slice(0, 5).map((kw, i) => (
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
                        )}

                        {/* Top Videos */}
                        {data.topVideos && data.topVideos.length > 0 && (
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                                    <span>🎬</span> Top Videos
                                </p>
                                <div className="space-y-2">
                                    {data.topVideos.slice(0, 3).map((video, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                                            <span className="text-sm font-bold text-slate-400">{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-medium text-slate-700 truncate">{video.title}</p>
                                                <p className="text-[9px] text-slate-400">{video.views} views • {video.age}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action */}
                        <button
                            onClick={() => {
                                window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`, '_blank');
                            }}
                            className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span>🔎</span> Tìm trên YouTube
                        </button>
                    </div>
                )}

                {!loading && error && !data && (
                    <div className="text-center py-6">
                        <span className="text-3xl mb-2 block">❌</span>
                        <p className="text-xs text-slate-500">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeywordPopover;

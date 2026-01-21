// TrendPanel.tsx - Trending Videos in Niche
import { useState, useEffect } from 'react';

interface TrendingVideo {
    title: string;
    views: string;
    published: string;
    channel: string;
}

interface Props {
    currentTags: string[];
    currentTitle: string;
}

const TrendPanel = ({ currentTags, currentTitle }: Props) => {
    const [videos, setVideos] = useState<TrendingVideo[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeKeyword, setActiveKeyword] = useState<string>('');

    useEffect(() => {
        analyzeLocalTrends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const analyzeLocalTrends = () => {
        setLoading(true);

        setTimeout(() => {
            // Extract keywords from title and tags
            const titleWords = currentTitle.toLowerCase()
                .split(/[\s\-:|\[\]()]+/)
                .filter(w => w.length > 2 && !['the', 'and', 'for', 'với', 'của', 'cho', 'này', 'các'].includes(w));

            const allKeywords = [...new Set([...titleWords, ...currentTags.slice(0, 5)])].slice(0, 8);
            setKeywords(allKeywords);
            setActiveKeyword(allKeywords[0] || '');

            // Generate mock trending data based on niche
            const mockVideos = generateMockTrending(allKeywords[0] || '');
            setVideos(mockVideos);
            setLoading(false);
        }, 600);
    };

    const generateMockTrending = (keyword: string): TrendingVideo[] => {
        const templates = [
            { title: `🔥 TOP 10 ${keyword} Hot Nhất 2026`, views: '1.2M', published: '2 ngày', channel: 'TrendVN' },
            { title: `Hướng Dẫn ${keyword} Cho Người Mới Bắt Đầu`, views: '856K', published: '5 ngày', channel: 'EduMaster' },
            { title: `${keyword} 2026 - Điều Bạn PHẢI Biết`, views: '654K', published: '1 tuần', channel: 'InfoHub' },
            { title: `Sai Lầm Phổ Biến Khi ${keyword}`, views: '423K', published: '3 ngày', channel: 'ProTips' },
            { title: `${keyword} vs Đối Thủ - So Sánh Chi Tiết`, views: '312K', published: '4 ngày', channel: 'ReviewAll' },
        ];

        return templates.map(t => ({
            ...t,
            title: t.title.charAt(0).toUpperCase() + t.title.slice(1)
        }));
    };

    const handleKeywordClick = (kw: string) => {
        setActiveKeyword(kw);
        setVideos(generateMockTrending(kw));
    };

    const searchYouTube = (query: string) => {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAMSAhAB`, '_blank');
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
                <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-16 bg-slate-200 rounded"></div>
                    <div className="h-16 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Keywords */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
                <p className="text-[10px] font-bold text-orange-800 mb-2 flex items-center gap-1">
                    <span>🔥</span> Keywords đang hot
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw, i) => (
                        <button
                            key={i}
                            onClick={() => handleKeywordClick(kw)}
                            className={`px-2 py-1 text-[9px] font-medium rounded-lg transition-all ${activeKeyword === kw
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'bg-white border border-orange-200 text-orange-700 hover:bg-orange-100'
                                }`}
                        >
                            #{kw}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trending Videos */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>📈</span>
                        <span className="text-xs font-bold text-slate-700">Trending "{activeKeyword}"</span>
                    </div>
                    <button
                        onClick={() => searchYouTube(`${activeKeyword} 2026`)}
                        className="text-[9px] text-blue-600 hover:underline"
                    >
                        Xem tất cả →
                    </button>
                </div>

                <div className="divide-y divide-slate-100">
                    {videos.map((video, i) => (
                        <div
                            key={i}
                            className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3"
                            onClick={() => searchYouTube(video.title)}
                        >
                            <span className="w-5 h-5 bg-red-100 text-red-600 rounded text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                                {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-slate-800 truncate">{video.title}</p>
                                <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                                    <span className="flex items-center gap-0.5">
                                        <span>👁️</span> {video.views}
                                    </span>
                                    <span>•</span>
                                    <span>{video.published}</span>
                                    <span>•</span>
                                    <span className="text-blue-600">{video.channel}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-[10px] font-bold text-blue-800 mb-1 flex items-center gap-1">
                    <span>💡</span> Trend Tips
                </p>
                <ul className="text-[9px] text-blue-700 space-y-0.5">
                    <li>• Click keyword để xem video trending trong topic đó</li>
                    <li>• Phân tích title/thumbnail của top videos</li>
                    <li>• Tìm "gap" để tạo content khác biệt</li>
                </ul>
            </div>

            {/* Disclaimer */}
            <p className="text-[8px] text-slate-400 text-center">
                * Dữ liệu mô phỏng. Click để tìm kiếm thật trên YouTube.
            </p>
        </div>
    );
};

export default TrendPanel;

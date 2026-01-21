// AIActionsPanel.tsx - AI Quick Actions Component (Basic Offline Version)
import { useState } from 'react';

interface Props {
    videoData: {
        title: string;
        description: string;
        tags: string[];
    };
}

const AIActionsPanel = ({ videoData }: Props) => {
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Generate suggestions locally (basic patterns)
    const generateTitles = () => {
        const baseTitle = videoData.title.replace(/[|\-:].*$/, '').trim();
        const keywords = baseTitle.split(' ').slice(0, 3).join(' ');

        return [
            `🔥 ${keywords} - Bí Mật Ít Người Biết`,
            `Top 7 Sai Lầm Khi ${keywords} (Ai Cũng Mắc!)`,
            `${keywords}: Hướng Dẫn Từ A-Z Cho Người Mới`,
            `Tại Sao ${keywords} Không Hiệu Quả? (Cách Fix)`,
            `${keywords} 2026 - Chiến Lược Đột Phá Mới`
        ];
    };

    const generateDescription = () => {
        const keywords = videoData.tags.slice(0, 5).join(', ');
        return `📌 **Về Video Này**
Trong video này, mình sẽ chia sẻ về ${videoData.title.slice(0, 50)}...

💡 **Nội Dung Chính**
• Phần 1: Giới thiệu tổng quan
• Phần 2: Hướng dẫn chi tiết  
• Phần 3: Tips & Tricks nâng cao

🎯 **Dành Cho Ai?**
Video này phù hợp với những bạn đang tìm hiểu về ${keywords}.

📞 **Liên Hệ**
• Website: [YOUR WEBSITE]
• Facebook: [YOUR FB]

⏱️ **Timestamps**
00:00 Intro
01:00 Phần 1
05:00 Phần 2
10:00 Kết luận

🔔 Đừng quên LIKE, SHARE và SUBSCRIBE để ủng hộ mình nhé!

#${videoData.tags.slice(0, 3).join(' #')}`;
    };

    const generateTags = () => {
        const base = videoData.title.toLowerCase().split(' ').filter(w => w.length > 2).slice(0, 3);
        return [
            ...base,
            `${base.join(' ')} cho người mới`,
            `hướng dẫn ${base[0]}`,
            `cách ${base.join(' ')}`,
            `${base[0]} 2026`,
            `${base[0]} tips`,
            `${base[0]} ${base[1] || 'tutorial'}`,
            `${base.join(' ')} hay nhất`,
            `${base[0]} trending`,
            `${base[0]} viral`,
            `kiếm tiền ${base[0]}`,
            `${base[0]} cho youtuber`
        ].slice(0, 15);
    };

    const handleAction = (action: string) => {
        setActiveAction(action);
        setLoading(true);
        setResults([]);

        // Simulate processing delay
        setTimeout(() => {
            switch (action) {
                case 'titles':
                    setResults(generateTitles());
                    break;
                case 'description':
                    setResults([generateDescription()]);
                    break;
                case 'tags':
                    setResults(generateTags());
                    break;
            }
            setLoading(false);
        }, 800);
    };

    const copyToClipboard = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const copyAll = async () => {
        try {
            await navigator.clipboard.writeText(results.join('\n\n'));
            setCopiedIndex(-1);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    return (
        <div className="space-y-3">
            {/* Info Banner */}
            <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                <p className="text-[9px] text-purple-700 flex items-center gap-1">
                    <span>✨</span> AI gợi ý dựa trên pattern phổ biến. Hãy tùy chỉnh cho phù hợp!
                </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => handleAction('titles')}
                    disabled={loading}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 group ${activeAction === 'titles'
                            ? 'bg-red-50 border-red-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/30'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">🎯</span>
                    <span className="text-[9px] font-bold text-slate-700">Titles</span>
                </button>

                <button
                    onClick={() => handleAction('description')}
                    disabled={loading}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 group ${activeAction === 'description'
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">📝</span>
                    <span className="text-[9px] font-bold text-slate-700">Description</span>
                </button>

                <button
                    onClick={() => handleAction('tags')}
                    disabled={loading}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 group ${activeAction === 'tags'
                            ? 'bg-purple-50 border-purple-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">🏷️</span>
                    <span className="text-[9px] font-bold text-slate-700">Tags</span>
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-600 font-medium">Đang tạo gợi ý...</p>
                </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>{activeAction === 'titles' ? '🎯' : activeAction === 'description' ? '📝' : '🏷️'}</span>
                            <span className="text-xs font-bold text-slate-700">
                                {activeAction === 'titles' ? 'Gợi ý Title' : activeAction === 'description' ? 'Description Mẫu' : 'Gợi ý Tags'}
                            </span>
                        </div>
                        <button
                            onClick={copyAll}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[9px] font-bold text-slate-700 transition-colors"
                        >
                            {copiedIndex === -1 ? '✅ Copied!' : '📋 Copy All'}
                        </button>
                    </div>

                    {activeAction === 'description' ? (
                        <div className="p-3">
                            <pre className="text-[10px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                                {results[0]}
                            </pre>
                        </div>
                    ) : activeAction === 'tags' ? (
                        <div className="p-3">
                            <div className="flex flex-wrap gap-2">
                                {results.map((tag, i) => (
                                    <button
                                        key={i}
                                        onClick={() => copyToClipboard(tag, i)}
                                        className={`px-2 py-1 rounded-lg text-[9px] font-medium border transition-all hover:scale-105 ${copiedIndex === i
                                                ? 'border-green-400 bg-green-50 text-green-700'
                                                : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {results.map((item, i) => (
                                <div key={i} className="p-3 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-[11px] font-medium text-slate-800 flex-1 leading-snug">{item}</p>
                                        <button
                                            onClick={() => copyToClipboard(item, i)}
                                            className="flex-shrink-0 p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 transition-colors"
                                        >
                                            {copiedIndex === i ? (
                                                <span className="text-xs">✅</span>
                                            ) : (
                                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && (
                <div className="bg-slate-50 rounded-xl p-6 text-center">
                    <span className="text-3xl mb-3 block">✨</span>
                    <p className="text-xs text-slate-600 font-medium">Bấm vào một action để nhận gợi ý</p>
                </div>
            )}
        </div>
    );
};

export default AIActionsPanel;

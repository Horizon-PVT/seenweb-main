// AIActionsPanel.tsx - AI Quick Actions Component
import { useState } from 'react';

interface TitleSuggestion {
    text: string;
    reason: string;
    viralScore: number;
}

interface DescriptionSuggestion {
    text: string;
    improvements: string[];
}

interface TagSuggestion {
    text: string;
    category: string;
    searchVolume: string;
}

interface Props {
    videoData: {
        title: string;
        description: string;
        tags: string[];
    };
}

type ActionType = 'generate-titles' | 'optimize-description' | 'suggest-tags';

const API_BASE = 'https://seenyt.net';

const AIActionsPanel = ({ videoData }: Props) => {
    const [activeAction, setActiveAction] = useState<ActionType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Results
    const [titles, setTitles] = useState<TitleSuggestion[]>([]);
    const [description, setDescription] = useState<DescriptionSuggestion | null>(null);
    const [tags, setTags] = useState<TagSuggestion[]>([]);

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleAction = async (action: ActionType) => {
        setActiveAction(action);
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/extension/ai-suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    videoData: {
                        title: videoData.title,
                        description: videoData.description,
                        tags: videoData.tags,
                    },
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'API Error');
            }

            const result = await res.json();

            if (result.type === 'titles') {
                setTitles(result.suggestions);
                setDescription(null);
                setTags([]);
            } else if (result.type === 'description') {
                setDescription(result.suggestion);
                setTitles([]);
                setTags([]);
            } else if (result.type === 'tags') {
                setTags(result.suggestions);
                setTitles([]);
                setDescription(null);
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi xử lý AI');
        } finally {
            setLoading(false);
        }
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

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getVolumeColor = (vol: string) => {
        if (vol === 'high') return 'bg-emerald-100 text-emerald-700';
        if (vol === 'medium') return 'bg-yellow-100 text-yellow-700';
        return 'bg-slate-100 text-slate-600';
    };

    return (
        <div className="space-y-3">
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => handleAction('generate-titles')}
                    disabled={loading}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 group ${activeAction === 'generate-titles'
                            ? 'bg-red-50 border-red-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/30'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">🎯</span>
                    <span className="text-[9px] font-bold text-slate-700">Titles</span>
                </button>

                <button
                    onClick={() => handleAction('optimize-description')}
                    disabled={loading}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 group ${activeAction === 'optimize-description'
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">📝</span>
                    <span className="text-[9px] font-bold text-slate-700">Description</span>
                </button>

                <button
                    onClick={() => handleAction('suggest-tags')}
                    disabled={loading}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 group ${activeAction === 'suggest-tags'
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
                    <p className="text-xs text-slate-600 font-medium">AI đang phân tích...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <p className="text-xs text-red-600 text-center">{error}</p>
                    <button
                        onClick={() => activeAction && handleAction(activeAction)}
                        className="mt-2 mx-auto block px-4 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Titles Results */}
            {!loading && titles.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-3 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2">
                        <span>🎯</span>
                        <span className="text-xs font-bold text-red-800">Gợi ý Title ({titles.length})</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {titles.map((item, i) => (
                            <div key={i} className="p-3 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[11px] font-medium text-slate-800 flex-1 leading-snug">{item.text}</p>
                                    <button
                                        onClick={() => copyToClipboard(item.text, i)}
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
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getScoreColor(item.viralScore)}`}>
                                        CTR: {item.viralScore}%
                                    </span>
                                    <span className="text-[9px] text-slate-400">{item.reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Description Result */}
            {!loading && description && (
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>📝</span>
                            <span className="text-xs font-bold text-blue-800">Description Tối Ưu</span>
                        </div>
                        <button
                            onClick={() => copyToClipboard(description.text, 999)}
                            className="px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-[9px] font-bold text-blue-700 transition-colors"
                        >
                            {copiedIndex === 999 ? '✅ Đã copy' : '📋 Copy'}
                        </button>
                    </div>
                    <div className="p-3">
                        <pre className="text-[10px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                            {description.text}
                        </pre>
                        {description.improvements.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-[9px] font-bold text-slate-600 mb-1.5">✨ Cải tiến:</p>
                                <ul className="space-y-0.5">
                                    {description.improvements.map((imp, i) => (
                                        <li key={i} className="text-[9px] text-slate-500 pl-2 before:content-['•'] before:mr-1 before:text-blue-400">
                                            {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tags Results */}
            {!loading && tags.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-3 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>🏷️</span>
                            <span className="text-xs font-bold text-purple-800">Gợi ý Tags ({tags.length})</span>
                        </div>
                        <button
                            onClick={() => copyToClipboard(tags.map(t => t.text).join(', '), 998)}
                            className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[9px] font-bold text-purple-700 transition-colors"
                        >
                            {copiedIndex === 998 ? '✅ Đã copy' : '📋 Copy All'}
                        </button>
                    </div>
                    <div className="p-3">
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={() => copyToClipboard(tag.text, i)}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-medium border transition-all hover:scale-105 ${copiedIndex === i
                                            ? 'border-green-400 bg-green-50 text-green-700'
                                            : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                                        }`}
                                >
                                    {tag.text}
                                    <span className={`ml-1.5 px-1 py-0.5 rounded text-[8px] ${getVolumeColor(tag.searchVolume)}`}>
                                        {tag.searchVolume === 'high' ? '🔥' : tag.searchVolume === 'medium' ? '📈' : '📊'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && !titles.length && !description && !tags.length && (
                <div className="bg-slate-50 rounded-xl p-6 text-center">
                    <span className="text-3xl mb-3 block">✨</span>
                    <p className="text-xs text-slate-600 font-medium">Bấm vào một action để nhận gợi ý từ AI</p>
                </div>
            )}
        </div>
    );
};

export default AIActionsPanel;

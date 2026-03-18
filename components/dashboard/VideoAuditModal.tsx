import React, { useState, useEffect } from 'react';
import { Sparkles, X, Zap, Target, Brain, FileText, Palette, CheckCircle2, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VideoAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: {
        id: string;
        title: string;
        description?: string;
    };
}

interface StrategyOutput {
    strategy: {
        hook: { score: number; analysis: string; visualInterrupt: string };
        emotional: { mainTrigger: string; triggerScore: number; explanation: string };
        spyGap: { marketStatus: string; competitorMiss: string; ourAngle: string };
    };
    audit: {
        titleScore: number;
        titleCritique: string;
        thumbnailCritique: string;
    };
    content: {
        titles: { text: string; viralScore: number }[];
        description: { body: string; hashtags: string[] };
        tags: { text: string; relevance: number }[];
        thumbnails: { concept: string; text: string; colorPalette: string; prompt: string }[];
    };
}

export default function VideoAuditModal({ isOpen, onClose, video }: VideoAuditModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<StrategyOutput | null>(null);

    useEffect(() => {
        if (isOpen && video) {
            analyzeVideo();
        } else {
            setOutput(null);
        }
    }, [isOpen, video]);

    const analyzeVideo = async () => {
        setIsLoading(true);
        setOutput(null);

        // Construct a "Core Idea" that represents the existing video for auditing
        const inputContext = `
        VIDEO TITLE: ${video?.title || 'Unknown'}
        VIDEO DESCRIPTION: ${video?.description || 'N/A'}
        
        TASK: Audit this video and suggest improvements.
        `;

        try {
            const response = await fetch('/api/seo-tool', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coreIdea: inputContext,
                    outputLanguage: 'Tiếng Việt' // Force VN for user
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Validate the response structure before setting
                if (data?.strategy?.hook && data?.audit && data?.content?.titles) {
                    setOutput(data as StrategyOutput);
                } else {
                    toast.error('Phản hồi từ AI không đúng định dạng. Vui lòng thử lại.');
                    onClose();
                }
            } else {
                toast.error('Lỗi phân tích: ' + (data?.error || 'Không rõ lỗi'));
                onClose();
            }
        } catch (error: any) {
            toast.error('Lỗi phân tích: ' + (error?.message || 'Không thể kết nối API'));
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0b0c15] border border-blue-500/20 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#13161c]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Sparkles size={24} className={isLoading ? "animate-spin" : ""} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Tối ưu AI Video</h2>
                            <p className="text-xs text-gray-400 font-mono truncate max-w-md">
                                {video.title}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 font-sans custom-scrollbar bg-[#050505]">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-blue-400 space-y-4">
                            <Loader2 size={48} className="animate-spin" />
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-white mb-1">Đang phân tích video...</h3>
                                <p className="text-sm text-gray-400">AI đang đánh giá tiêu đề, cảm xúc và tìm điểm cải thiện.</p>
                            </div>
                        </div>
                    ) : output ? (
                        <div className="space-y-8 animate-in slide-in-from-bottom-5 fade-in duration-500">

                            {/* 1. SCORE & DIAGNOSIS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-900/5 border border-blue-500/20 flex flex-col justify-between">
                                    <h3 className="text-blue-400 text-xs font-bold uppercase flex items-center gap-2">
                                        <Activity size={14} /> Điểm Hook
                                    </h3>
                                    <div className="mt-2">
                                        <span className="text-4xl font-black text-white">{output.strategy.hook.score}</span>
                                        <span className="text-sm text-blue-400/50">/100</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 border-t border-white/5 pt-2">
                                        {output.strategy.hook.analysis}
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/20 to-purple-900/5 border border-purple-500/20 flex flex-col justify-between">
                                    <h3 className="text-purple-400 text-xs font-bold uppercase flex items-center gap-2">
                                        <Brain size={14} /> Cảm Xúc Chủ Đạo
                                    </h3>
                                    <div className="mt-2">
                                        <span className="text-2xl font-black text-white">{output.strategy.emotional.mainTrigger}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 border-t border-white/5 pt-2">
                                        {output.strategy.emotional.explanation}
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-green-900/5 border border-green-500/20 flex flex-col justify-between">
                                    <h3 className="text-green-400 text-xs font-bold uppercase flex items-center gap-2">
                                        <Zap size={14} /> Cơ Hội (Missing Gap)
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-300 font-medium italic">
                                            "{output.strategy.spyGap.competitorMiss}"
                                        </p>
                                    </div>
                                    <p className="text-xs text-green-400 mt-2 border-t border-white/5 pt-2">
                                        Góc độ của chúng ta: {output.strategy.spyGap.ourAngle}
                                    </p>
                                </div>
                            </div>

                            {/* 1.5 AUDIT SECTION (NEW) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-xl bg-red-900/10 border border-red-500/20">
                                    <h3 className="text-red-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                        <X size={14} /> Phân tích Tiêu Đề Hiện Tại
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-2xl font-black ${output.audit.titleScore < 50 ? 'text-red-500' : 'text-yellow-500'}`}>{output.audit.titleScore}/100</span>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed font-mono">
                                        "{output.audit.titleCritique}"
                                    </p>
                                </div>
                                <div className="p-5 rounded-xl bg-orange-900/10 border border-orange-500/20">
                                    <h3 className="text-orange-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                        <Palette size={14} /> Nhận xét Thumbnail (Dự kiến)
                                    </h3>
                                    <p className="text-xs text-gray-300 leading-relaxed font-mono">
                                        "{output.audit.thumbnailCritique}"
                                    </p>
                                </div>
                            </div>

                            {/* 2. SUGGESTED IMPROVEMENTS */}
                            <div className="space-y-6">
                                {/* Titles */}
                                <div className="bg-[#13161c] border border-white/5 rounded-xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                                        <FileText size={16} className="text-blue-400" />
                                        <h3 className="text-sm font-bold text-white">Gợi ý Tiêu đề Viral</h3>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        {output.content.titles.map((t, i) => (
                                            <div key={i} className="flex gap-4 items-start group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <div className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${t.viralScore >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {t.viralScore}đ
                                                </div>
                                                <div className="text-sm text-gray-300 group-hover:text-white transition-colors cursor-text select-text">
                                                    {t.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                <div className="bg-[#13161c] border border-white/5 rounded-xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                                        <Palette size={16} className="text-purple-400" />
                                        <h3 className="text-sm font-bold text-white">Ý tưởng Thumbnail mới</h3>
                                    </div>
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {output.content.thumbnails.map((thumb, i) => (
                                            <div key={i} className="bg-black/30 p-4 rounded-lg border border-white/5 flex flex-col gap-3">
                                                <div className="text-xs font-bold text-gray-500 uppercase">Concept {i + 1}</div>
                                                <p className="text-sm text-gray-300 font-medium">{thumb.concept}</p>
                                                <div className="mt-auto pt-3 border-t border-white/5">
                                                    <div className="text-xs text-gray-500 mb-1">Text trên ảnh:</div>
                                                    <div className="text-xs font-black text-white px-2 py-1 bg-white/10 rounded inline-block">
                                                        {thumb.text}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
}

function Loader2({ size, className }: { size: number, className: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

import React, { useState, useEffect } from 'react';
import { Target, X, ShieldAlert, Scan, Activity, Radar, Loader2 } from 'lucide-react';

interface ChannelAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    channelId: string;
    channelName: string;
}

interface OutputData {
    competitorProfile: {
        name: string;
        subscribers: string;
    };
    strategicWeaknesses: string[];
    successSignals: string[];
    contentStructure: {
        mainKeywords: string[];
        seoEvaluation: string;
    };
    untappedNiches: string[];
    titleAnalysis: string;
    descriptionAnalysis: string;
    tagsHashtags: string[];
    thumbnailAnalysis: string;
    contentStrategy: string;
    counterAttackPlan: string;
    audienceGapAnalysis: string[];
    videoPersonaScore: {
        tone: string;
        emotion: string;
    };
}

export default function ChannelAuditModal({ isOpen, onClose, channelId, channelName }: ChannelAuditModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<OutputData | null>(null);
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        if (isOpen && channelId) {
            performScan();
        } else {
            // Reset state when closed
            setOutput(null);
            setScanProgress(0);
        }
    }, [isOpen, channelId]);

    const performScan = async () => {
        setIsLoading(true);
        setOutput(null);
        setScanProgress(0);

        // Fake progress
        const interval = setInterval(() => {
            setScanProgress(prev => {
                const next = prev + Math.random() * 15;
                return next > 90 ? 90 : next;
            });
        }, 500);

        try {
            const response = await fetch('/api/youtube', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool: 'rival', input: channelId }),
            });

            const data = await response.json();

            clearInterval(interval);
            setScanProgress(100);

            if (response.ok && data.competitorProfile) {
                setTimeout(() => {
                    setOutput(data as OutputData);
                    setIsLoading(false);
                }, 500);
            } else {
                alert('Error: ' + (data.error || 'Unknown Error'));
                setIsLoading(false);
                onClose();
            }
        } catch (error: any) {
            clearInterval(interval);
            alert('Error: ' + error.message);
            setIsLoading(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0a140a] border border-[#003b00] w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#003b00] bg-[#050a05]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#003b00]/30 rounded-lg text-[#00ff41]">
                            <Radar size={24} className={isLoading ? "animate-spin" : ""} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-wide uppercase">Phân tích kênh AI</h2>
                            <p className="text-xs text-[#008f11] font-mono flex items-center gap-2">
                                TARGET: <span className="text-white font-bold">{channelName}</span>
                                <span className="px-1.5 py-0.5 bg-[#00ff41]/20 rounded text-[#00ff41]">{channelId}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 font-mono custom-scrollbar">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#00ff41]">
                            <div className="relative w-48 h-48 mb-8">
                                <div className="absolute inset-0 border-4 border-[#003b00] rounded-full"></div>
                                <div className="absolute inset-0 border-t-4 border-[#00ff41] rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
                                    {Math.floor(scanProgress)}%
                                </div>
                            </div>
                            <div className="text-sm tracking-[0.2em] animate-pulse">ĐANG QUÉT DỮ LIỆU KÊNH...</div>
                            <div className="mt-2 text-xs text-[#008f11]">Phân tích metrics, content gap, và điểm yếu...</div>
                        </div>
                    ) : output ? (
                        <div className="animate-in slide-in-from-bottom-5 fade-in duration-500">
                            {/* Dashboard Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Col 1: Summary */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-[#003b00]/20 border border-[#00ff41]/30 p-5 rounded-xl">
                                        <h3 className="text-[#00ff41] text-xs font-bold uppercase mb-4 flex items-center gap-2">
                                            <ShieldAlert size={16} /> Điểm Yếu Chiến Lược
                                        </h3>
                                        <ul className="space-y-3">
                                            {output.strategicWeaknesses.map((w, i) => (
                                                <li key={i} className="flex gap-2 text-xs text-gray-300">
                                                    <span className="text-red-500 font-bold shrink-0">[!]</span>
                                                    <span>{w}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-[#003b00]/20 border border-[#00ff41]/30 p-5 rounded-xl">
                                        <h3 className="text-[#00ff41] text-xs font-bold uppercase mb-4 flex items-center gap-2">
                                            <Scan size={16} /> Ngách Tiềm Năng Bỏ Lỡ
                                        </h3>
                                        <ul className="space-y-3">
                                            {output.untappedNiches.map((n, i) => (
                                                <li key={i} className="flex gap-2 text-xs text-gray-300">
                                                    <span className="text-[#00ff41] font-bold shrink-0">[+]</span>
                                                    <span>{n}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Col 2: Detailed Analysis */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-[#003b00]/10 border border-[#003b00] p-6 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-[#00ff41] text-black text-[10px] font-bold px-2 py-1">COUNTER-STRATEGY</div>
                                        <h3 className="text-[#00ff41] text-sm font-bold uppercase mb-4">Kế Hoạch Phản Công / Tối Ưu</h3>
                                        <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{output.counterAttackPlan}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/30 border border-[#003b00] p-4 rounded-lg">
                                            <div className="text-[10px] text-[#008f11] uppercase mb-1">Phân Tích Tiêu Đề</div>
                                            <p className="text-xs text-gray-400">{output.titleAnalysis}</p>
                                        </div>
                                        <div className="bg-black/30 border border-[#003b00] p-4 rounded-lg">
                                            <div className="text-[10px] text-[#008f11] uppercase mb-1">Phân Tích Thumbnail</div>
                                            <p className="text-xs text-gray-400">{output.thumbnailAnalysis}</p>
                                        </div>
                                    </div>

                                    <div className="bg-black/30 border border-[#003b00] p-4 rounded-lg">
                                        <div className="text-[10px] text-[#008f11] uppercase mb-2">Content Gap (Khán giả cần nhưng thiếu)</div>
                                        <div className="flex flex-wrap gap-2">
                                            {output.audienceGapAnalysis.map((gap, i) => (
                                                <span key={i} className="px-2 py-1 bg-[#003b00] text-[#00ff41] text-[10px] rounded border border-[#00ff41]/20">
                                                    {gap}
                                                </span>
                                            ))}
                                        </div>
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
                    background: #0a140a;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #003b00;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #00ff41;
                }
            `}</style>
        </div>
    );
}

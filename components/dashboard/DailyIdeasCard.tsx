import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Zap, Lock, BarChart2, Loader2 } from 'lucide-react';

interface DailyIdea {
    title: string;
    mainHook: string;
    viralScore: number;
    difficulty: string;
    viralReason: string;
    dataProof: {
        realVideoTitle: string;
        realViews: number;
        realViralRatio: number; // e.g., 12.5 means Views = 12.5x Subs
    };
}

interface DailyIdeasCardProps {
    role: string;
    channelId: string;
    channelTitle: string;
}

export default function DailyIdeasCard({ role, channelId }: DailyIdeasCardProps) {
    const router = useRouter();
    const [ideas, setIdeas] = useState<DailyIdea[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for manual trigger
    const [hasGenerated, setHasGenerated] = useState(false);

    // Manual Trigger Function
    const handleGenerate = async () => {
        if (!channelId) return;
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`/api/dashboard/daily-ideas`, {
                params: { channelId }
            });
            if (res.data.ideas && Array.isArray(res.data.ideas)) {
                setIdeas(res.data.ideas);
                setHasGenerated(true);
            } else {
                setError("Không tìm thấy ý tưởng phù hợp. Vui lòng thử lại sau.");
            }
        } catch (error: any) {
            console.error("Failed to fetch ideas", error);
            setError(error.response?.data?.error || "Lỗi kết nối. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to format number safely
    const fmt = (n: any) => {
        const val = typeof n === 'string' ? parseFloat(n.replace(/,/g, '')) : n;
        if (isNaN(val)) return 'N/A';
        return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(val);
    };

    const isVIP = ['PRO', 'ADMIN'].includes(role);

    // Initial State: Show Button (Keep showing this while loading to show button spinner)
    if (!hasGenerated && !ideas.length && !error) return (
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                <Zap size={32} className="text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">10 Ý Tưởng Viral Hôm Nay</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                Những ý tưởng được nghiên cứu dự trên tổng hợp cái dữ liệu trên YouTube và Google Trend!
            </p>
            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl shadow-lg shadow-yellow-500/20 flex items-center gap-2 transition-all ${loading ? 'opacity-80 cursor-wait' : 'hover:scale-105'}`}
            >
                {loading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Đang tạo ý tưởng...
                    </>
                ) : (
                    <>
                        <Zap size={20} fill="currentColor" />
                        Ý tưởng cho kênh
                    </>
                )}
            </button>
        </div>
    );

    // Only show skeleton if we are somehow loading but NOT in initial state (should not happen with logic above)
    // or if we decide to handle re-fetching later.
    if (loading && hasGenerated) return <div className="animate-pulse h-64 bg-gray-800 rounded-2xl border border-gray-700"></div>;

    if (error) return (
        <div className="bg-[#18181b] border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 mb-2">⚠️ {error}</p>
            <button onClick={() => window.location.reload()} className="text-sm underline text-gray-400">Thử lại</button>
        </div>
    );

    if (ideas.length === 0) return (
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 text-center text-gray-500">
            Không có ý tưởng mới hôm nay. Hãy thử lại sau.
        </div>
    );

    return (
        <div className="relative overflow-hidden">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-500" size={20} />
                        10 Ý Tưởng Viral Hôm Nay
                    </h2>
                    {!isVIP && (
                        <div className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/20 font-bold uppercase tracking-wider">
                            Free: 1/10
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-400 italic">
                    Những ý tưởng được nghiên cứu dựa trên tổng hợp dữ liệu trên YouTube và Google Trend!
                </p>
            </div>

            <div className="space-y-4">
                {ideas.map((idea, index) => {
                    if (!idea) return null;
                    const isLocked = !isVIP && index > 0; // Lock everything after 1st item for Free

                    return (
                        <div key={index} className={`relative group ${isLocked ? 'pointer-events-none select-none' : ''}`}>
                            <div className={`
                                bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all
                                ${isLocked ? 'opacity-30 blur-sm scale-95' : 'opacity-100'}
                            `}>
                                {/* Header: Title & Score */}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-white text-lg leading-snug max-w-[85%]">
                                        {idea.title}
                                    </h3>
                                    <div className="flex flex-col items-center bg-gray-800/50 px-2 py-1 rounded-lg border border-gray-700">
                                        <span className="text-green-400 font-black text-xl leading-none">{idea.viralScore}</span>
                                        <span className="text-[9px] text-gray-500 uppercase tracking-tighter mt-0.5">Score</span>
                                    </div>
                                </div>

                                {/* Data Proof Section (Simplified) */}
                                {idea.dataProof && (
                                    <div className="flex items-center gap-4 text-xs text-gray-400 bg-black/20 p-2 rounded-lg mb-4">
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1 border-r border-gray-700/50 pr-4">
                                            <BarChart2 size={12} className="text-blue-400 shrink-0" />
                                            <span className="truncate">Nguồn: <span className="text-gray-300">{idea.dataProof.realVideoTitle || 'N/A'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div>
                                                <span className="text-gray-500 block text-[9px]">Views</span>
                                                <span className="text-white font-mono">{fmt(idea.dataProof.realViews)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-[9px]">Ratio</span>
                                                <span className="text-green-400 font-mono font-bold">{fmt(idea.dataProof.realViralRatio)}x</span>
                                            </div>
                                        </div>
                                    </div>
                                )}


                            </div>

                            {/* Lock Overlay for Non-VIP */}
                            {isLocked && index === 1 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 top-0 left-0 w-full h-[300%] -mt-10">
                                    <div className="bg-[#18181b]/90 backdrop-blur-md border border-yellow-500/20 p-6 rounded-2xl text-center shadow-2xl max-w-sm mx-auto">
                                        <Lock size={32} className="text-yellow-500 mx-auto mb-3" />
                                        <h3 className="text-lg font-bold text-white mb-2">Mở Khóa 9 Ý Tưởng Còn Lại</h3>
                                        <p className="text-sm text-gray-400 mb-4">
                                            Nâng cấp VIP để xem toàn bộ 10 ý tưởng viral mỗi ngày kèm số liệu phân tích thật.
                                        </p>
                                        <button onClick={() => router.push('/pricing')} className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:scale-105 transition-transform">
                                            Nâng Cấp Ngay
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

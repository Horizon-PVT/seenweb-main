import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ChannelStatsCardsProps {
    subCount: number;
    viewCount: number;
    videoCount: number;
    healthScore: number;
    healthGrade: string;
}

export default function ChannelStatsCards({
    subCount,
    viewCount,
    videoCount,
    healthScore,
    healthGrade
}: ChannelStatsCardsProps) {
    const avgViews = videoCount > 0 ? Math.round(viewCount / videoCount) : 0;

    const formatNum = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
        return n.toLocaleString();
    };

    // Health gauge SVG values
    const gaugeRadius = 60;
    const gaugeCx = 75;
    const gaugeCy = 75;
    const circumference = Math.PI * gaugeRadius; // half circle
    const dashLength = (healthScore / 100) * circumference;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Health Score Gauge */}
            <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5 hover:border-yellow-500/20 transition-all group">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">Sức khỏe kênh</span>
                    <svg className="w-5 h-5 text-yellow-400/50 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                {/* SVG Gauge */}
                <div className="flex justify-center">
                    <div className="relative w-32 h-20">
                        <svg viewBox="0 0 150 90" className="w-full h-full">
                            {/* Background arc */}
                            <path
                                d={`M ${gaugeCx - gaugeRadius} ${gaugeCy} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeCx + gaugeRadius} ${gaugeCy}`}
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="10"
                                strokeLinecap="round"
                            />
                            {/* Colored arc */}
                            <path
                                d={`M ${gaugeCx - gaugeRadius} ${gaugeCy} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeCx + gaugeRadius} ${gaugeCy}`}
                                fill="none"
                                stroke={healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#eab308' : healthScore >= 40 ? '#f97316' : '#ef4444'}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${dashLength} ${circumference}`}
                                className="transition-all duration-1000"
                            />
                            {/* Score text */}
                            <text x={gaugeCx} y={gaugeCy - 12} textAnchor="middle" className="text-2xl font-bold" fill="white" fontSize="22" fontWeight="bold">{healthScore}</text>
                            <text x={gaugeCx} y={gaugeCy + 2} textAnchor="middle" fill={healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#eab308' : healthScore >= 40 ? '#f97316' : '#ef4444'} fontSize="10" fontWeight="bold">{healthGrade}</text>
                            {/* Min/Max labels */}
                            <text x={gaugeCx - gaugeRadius - 2} y={gaugeCy + 14} textAnchor="middle" fill="#6b7280" fontSize="8">0</text>
                            <text x={gaugeCx + gaugeRadius + 2} y={gaugeCy + 14} textAnchor="middle" fill="#6b7280" fontSize="8">100</text>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Subscribers */}
            <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5 hover:border-blue-500/20 transition-all group">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 font-medium">Subscribers</span>
                    <svg className="w-5 h-5 text-blue-400/50 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">{formatNum(subCount)}</div>
                <div className="flex items-center gap-1 mt-2">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">+{(subCount * 0.012).toFixed(0)}</span>
                    <span className="text-[10px] text-gray-500 ml-1">30 ngày</span>
                </div>
            </div>

            {/* Total Views */}
            <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-all group">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 font-medium">Lượt xem</span>
                    <svg className="w-5 h-5 text-purple-400/50 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">{formatNum(viewCount)}</div>
                <div className="flex items-center gap-1 mt-2">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">~{formatNum(avgViews)}/video</span>
                </div>
            </div>

            {/* Total Videos */}
            <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5 hover:border-cyan-500/20 transition-all group">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 font-medium">Tổng Video</span>
                    <svg className="w-5 h-5 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">{formatNum(videoCount)}</div>
                <div className="flex items-center gap-1 mt-2">
                    <span className="text-[10px] text-gray-500">Đã xuất bản</span>
                </div>
            </div>
        </div>
    );
}

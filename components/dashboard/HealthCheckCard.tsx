import React from 'react';
import { TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface HealthCheckCardProps {
    channel: any;
}

export default function HealthCheckCard({ channel }: HealthCheckCardProps) {
    if (!channel) return null;

    // Mock logic for Health Score (replace with real logic later)
    // Example: Score based on views/subs ratio
    const subCount = parseInt(channel.subCount || '0');
    const viewCount = parseInt(channel.viewCount || '0');
    const videoCount = parseInt(channel.videoCount || '0');

    // Simple engagement calc
    const viewsPerSub = subCount > 0 ? (viewCount / subCount) : 0;

    let healthStatus = 'Good';
    let score = 85;
    let color = 'text-green-500';

    if (viewsPerSub < 50) {
        healthStatus = 'Needs Improvement';
        score = 65;
        color = 'text-yellow-500';
    } else if (viewsPerSub > 500) {
        healthStatus = 'Excellent';
        score = 95;
        color = 'text-purple-500';
    }

    return (
        <div className="p-2">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity size={20} className="text-blue-500" />
                Sức khỏe kênh
            </h3>

            <div className="flex items-center gap-6">
                {/* Score Circle */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#333" strokeWidth="8" fill="none" />
                        <circle
                            cx="48" cy="48" r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 * (1 - score / 100)}
                            className={`${color} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-black ${color}`}>{score}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Score</span>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="text-gray-400 text-sm">Trạng thái</span>
                        <span className={`font-bold ${color}`}>{healthStatus}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="text-gray-400 text-sm">Tương tác</span>
                        <span className="font-medium text-white">{(viewsPerSub * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Đề xuất</span>
                        <button className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                            Xem chi tiết <TrendingUp size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Warning / Suggestion */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-3">
                <AlertTriangle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200">
                    <span className="font-bold text-blue-400">AI Suggestion:</span> Tỷ lệ click (CTR) của 3 video gần đây đang giảm nhẹ. Hãy thử đổi phong cách Thumbnail sáng màu hơn.
                </div>
            </div>
        </div>
    );
}

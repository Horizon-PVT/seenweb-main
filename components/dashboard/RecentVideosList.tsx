import React from 'react';
import { Play, TrendingUp, Sparkles } from 'lucide-react';

interface RecentVideosListProps {
    videos?: any[]; // Array of recent videos
    onOptimize?: (videoId: string) => void;
}

export default function RecentVideosList({ videos = [], onOptimize }: RecentVideosListProps) {
    // If no videos passed, show skeleton or empty state
    if (!videos || videos.length === 0) {
        return (
            <div className="bg-[#1a1a20] border border-gray-800 rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className="text-gray-600 mb-2">Chưa có dữ liệu video</div>
                <div className="text-sm text-gray-500">Hệ thống đang đồng bộ video từ kênh của bạn...</div>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a20] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Play size={20} className="text-red-500" fill="currentColor" />
                    Video mới nhất
                </h3>
                <button className="text-xs text-gray-400 hover:text-white transition-colors">Xem tất cả</button>
            </div>

            <div className="space-y-4">
                {videos.map((video) => (
                    <div key={video.id} className="group flex items-start gap-4 p-3 bg-gray-900/30 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 rounded-xl transition-all cursor-pointer">
                        {/* Thumbnail */}
                        <div className="relative w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play size={24} className="text-white" fill="currentColor" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white line-clamp-2 md:line-clamp-1 group-hover:text-blue-400 transition-colors">
                                {video.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                                <span className="flex items-center gap-1">
                                    <TrendingUp size={12} className={parseInt(video.views) > 1000 ? "text-green-500" : "text-yellow-500"} />
                                    {parseInt(video.views || '0').toLocaleString()} views
                                </span>
                                <span>•</span>
                                <span>{new Date(video.publishedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOptimize?.(video.id);
                            }}
                            className="hidden md:flex flex-col items-center justify-center gap-1 px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-[10px] font-bold border border-blue-600/20 transition-all shrink-0"
                        >
                            <Sparkles size={16} />
                            Tối ưu AI
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

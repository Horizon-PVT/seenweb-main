import { useState } from 'react';
import { Play, X, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface TrendVideo {
    id: string;
    title: string;
    youtubeId: string;
    thumbnailUrl: string;
    description: string;
    tags: string;
    type: 'TRENDING';
}

interface TrendGalleryProps {
    videos: TrendVideo[];
}

export default function TrendGallery({ videos }: TrendGalleryProps) {
    const [selectedVideo, setSelectedVideo] = useState<TrendVideo | null>(null);

    return (
        <div className="space-y-8">
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <p className="text-gray-500 text-lg">Chưa có video nào trong danh mục này.</p>
                    </div>
                ) : (
                    videos.map((video) => (
                        <div
                            key={video.id}
                            onClick={() => setSelectedVideo(video)}
                            className="group relative bg-[#1A1D21] rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-pink-500/10 transition-all border border-gray-800 hover:border-gray-700"
                        >
                            {/* Thumbnail Container */}
                            <div className="relative aspect-video w-full overflow-hidden">
                                <Image
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play fill="white" className="text-white ml-1" size={24} />
                                    </div>
                                </div>
                                {/* Tag */}
                                {video.tags && (
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs text-white font-medium">
                                        {video.tags}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <h3 className="font-bold text-white line-clamp-2 group-hover:text-[#CDAD5A] transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-2">
                                    {video.description || "Chưa có nhận định chi tiết..."}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#1A1D21] w-full max-w-4xl rounded-2xl overflow-hidden border border-gray-700 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h3 className="text-xl font-bold text-white truncate pr-4">{selectedVideo.title}</h3>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body - Flex on Desktop, Stack on Mobile */}
                        <div className="flex-1 overflow-y-auto p-0 md:flex">
                            {/* Video Section */}
                            <div className="w-full md:w-2/3 aspect-video bg-black">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Analysis Section */}
                            <div className="w-full md:w-1/3 p-6 space-y-6 bg-[#131517]">
                                <div>
                                    <h4 className="text-[#CDAD5A] font-bold uppercase text-xs tracking-wider mb-2">Góc nhìn chuyên gia</h4>
                                    <div className="prose prose-invert prose-sm">
                                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                            {selectedVideo.description || "Chưa có nhận định chi tiết cho video này."}
                                        </p>
                                    </div>
                                </div>

                                {selectedVideo.tags && (
                                    <div>
                                        <h4 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Phân loại</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedVideo.tags.split(',').map((tag, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-800 rounded-full text-xs text-blue-300 border border-gray-700">
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

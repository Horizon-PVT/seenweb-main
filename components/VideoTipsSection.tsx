import React, { useState } from 'react';

interface VideoData {
    id: string;
    title: string;
    description: string | null;
    youtubeId: string;
    thumbnailUrl?: string | null;
    displayOrder?: number;
}

interface VideoTipsSectionProps {
    title: string | React.ReactNode;
    subtitle: string;
    videos: VideoData[];
    tag?: string;
}

const VideoTipsSection: React.FC<VideoTipsSectionProps> = ({ title, subtitle, videos = [], tag }) => {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    // If no videos, don't render anything
    if (!videos || videos.length === 0) return null;

    // Duplicate for scrolling effect
    const allVideos = [...videos, ...videos];

    return (
        <>
            <section className="py-20 bg-black/50 border-y border-gray-800/50 overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    {tag && (
                        <span className="text-[#CDAD5A] font-bold tracking-widest text-xs uppercase mb-2 block">
                            {tag}
                        </span>
                    )}
                    <h2 className="text-4xl font-playfair text-white mb-4">
                        {title}
                    </h2>
                    <p className="text-xl text-gray-400 mb-12">{subtitle}</p>

                    <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-24 before:bg-gradient-to-r before:from-black/50 before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-24 after:bg-gradient-to-l after:from-black/50 after:to-transparent after:z-10">
                        <div className="flex animate-scroll-left">
                            {allVideos.map((video, index) => (
                                <div
                                    key={`${video.id || video.youtubeId}-${index}`}
                                    className="group flex-shrink-0 w-80 mx-4 cursor-pointer"
                                    onClick={() => setSelectedVideoId(video.youtubeId)}
                                >
                                    <div className="h-full p-4 bg-[#111] border border-gray-800 rounded-xl transition-all duration-300 hover:border-[#CDAD5A]/50 hover:bg-gray-900 group-hover:-translate-y-2">
                                        <div className="relative mb-4 overflow-hidden rounded-lg aspect-video bg-gray-900">
                                            <img
                                                src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                                                alt={video.title}
                                                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    // Fallback to mqdefault if hq not found (rare)
                                                    if (target.src.includes('hqdefault')) {
                                                        target.src = target.src.replace('hqdefault', 'mqdefault');
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {/* Optional: Episode Number or badge can go here with z-20 */}
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-[#CDAD5A] transition-colors">{video.title}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2">{video.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* YouTube Modal */}
            {selectedVideoId && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                    onClick={() => setSelectedVideoId(null)}
                >
                    <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedVideoId(null)}
                            className="absolute -top-12 right-0 text-white text-4xl hover:text-[#CDAD5A] transition-colors"
                        >
                            ×
                        </button>
                        <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoTipsSection;

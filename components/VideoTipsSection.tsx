import React, { useState } from 'react';

interface VideoData {
    id: string;
    title: string;
    youtubeId: string;
    thumbnailUrl: string | null;
    description: string | null;
}

interface VideoTipsSectionProps {
    videos: VideoData[];
}

const VideoTipsSection: React.FC<VideoTipsSectionProps> = ({ videos = [] }) => {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    if (videos.length === 0) {
        return null; // Don't render if no videos
    }

    // Duplicate for scrolling effect
    const allVideos = [...videos, ...videos];

    return (
        <>
            <section id="video-tips" className="py-20 bg-black/50 border-y border-gray-800/50 overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-playfair text-[#CDAD5A] mb-4">Video Hướng Dẫn & Tips</h2>
                    <p className="text-xl text-gray-400 mb-12">Bí kíp tăng trưởng từ chuyên gia.</p>

                    <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-24 before:bg-gradient-to-r before:from-black/50 before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-24 after:bg-gradient-to-l after:from-black/50 after:to-transparent after:z-10">
                        <div className="flex animate-scroll-left">
                            {allVideos.map((video, index) => (
                                <div
                                    key={`${video.id}-${index}`}
                                    className="group flex-shrink-0 w-80 mx-4 cursor-pointer"
                                    onClick={() => setSelectedVideoId(video.youtubeId)}
                                >
                                    <div className="h-full p-6 bg-black/30 border border-gray-800/50 transition-all duration-300 hover:border-[#CDAD5A]/50 hover:scale-105">
                                        <div className="relative mb-4 overflow-hidden rounded-lg">
                                            <img
                                                src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                                alt={video.title}
                                                className="w-full h-44 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                                        {video.description && (
                                            <p className="text-sm text-gray-400 line-clamp-3">{video.description}</p>
                                        )}
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
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedVideoId(null)}
                >
                    <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedVideoId(null)}
                            className="absolute -top-12 right-0 text-white text-4xl hover:text-[#CDAD5A] transition-colors"
                        >
                            ×
                        </button>
                        <div className="relative pb-[56.25%] h-0">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
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

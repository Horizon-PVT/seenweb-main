import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';

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
    variant?: 'default' | 'compact';
    hint?: string;
}

const ITEMS_PER_PAGE = 4;

const VideoTipsSection: React.FC<VideoTipsSectionProps> = ({ title, subtitle, videos = [], tag, variant = 'default', hint }) => {
    const { t } = useTranslation('common');
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    // If no videos, don't render anything
    if (!videos || videos.length === 0) return null;

    const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);

    const handleNext = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const handlePrev = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const currentVideos = videos.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const isCompact = variant === 'compact';

    return (
        <>
            <section className="py-20 bg-black/50 border-y border-gray-800/50 overflow-hidden relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-1/4 w-1/2 h-full bg-purple-900/10 blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        {tag && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-[#CDAD5A] font-bold tracking-widest text-xs uppercase mb-2 block"
                            >
                                {tag}
                            </motion.span>
                        )}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-playfair text-white mb-4"
                        >
                            {title}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-400"
                        >
                            {subtitle}
                        </motion.p>
                        {hint && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-sm text-gray-500 mt-2 italic animate-pulse"
                            >
                                {hint}
                            </motion.p>
                        )}
                    </div>

                    <div className="relative">
                        {/* Navigation Arrows */}
                        {totalPages > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white hover:bg-[#CDAD5A] hover:text-black transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white hover:bg-[#CDAD5A] hover:text-black transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        )}

                        <div className="min-h-[340px]">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentPage}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                                >
                                    {currentVideos.map((video, index) => (
                                        <motion.div
                                            key={video.id || video.youtubeId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            className="group cursor-pointer"
                                            onClick={() => setSelectedVideoId(video.youtubeId)}
                                        >
                                            <div className="h-full bg-[#111] border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-[#CDAD5A]/50 group-hover:shadow-[0_0_30px_rgba(205,173,90,0.15)] relative">
                                                <div className={`${isCompact ? 'h-36' : 'aspect-video'} bg-gray-900 overflow-hidden relative`}>
                                                    <img
                                                        src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                                                        alt={video.title}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            if (target.src.includes('hqdefault')) {
                                                                target.src = target.src.replace('hqdefault', 'mqdefault');
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 backdrop-blur-[2px]">
                                                        <motion.div
                                                            whileHover={{ scale: 1.15 }}
                                                            className={`${isCompact ? 'w-10 h-10' : 'w-14 h-14'} bg-red-600 rounded-full flex items-center justify-center shadow-lg text-white`}
                                                        >
                                                            <svg className={`${isCompact ? 'w-4 h-4 ml-0.5' : 'w-6 h-6 ml-1'}`} fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        </motion.div>
                                                    </div>

                                                    {/* Optional Badge */}
                                                    <div className={`absolute ${isCompact ? 'top-2 right-2 px-1.5 py-0.5 text-[9px]' : 'top-3 right-3 px-2 py-0.5 text-[10px]'} bg-black/60 backdrop-blur-md rounded font-bold text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity delay-100`}>
                                                        {isCompact ? t('video_tips.watch') : t('video_tips.watch_now')}
                                                    </div>
                                                </div>

                                                <div className={`${isCompact ? 'p-3' : 'p-5'}`}>
                                                    <h3 className={`${isCompact ? 'text-sm' : 'text-lg'} font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-[#CDAD5A] transition-colors`}>
                                                        {video.title}
                                                    </h3>
                                                    <p className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-gray-500 line-clamp-2 leading-relaxed`}>
                                                        {video.description || t('video_tips.default_desc')}
                                                    </p>
                                                </div>

                                                {/* Bottom gradient line */}
                                                <div className={`absolute bottom-0 left-0 w-full ${isCompact ? 'h-[1px]' : 'h-[2px]'} bg-gradient-to-r from-transparent via-[#CDAD5A] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Pagination Dots */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === i
                                            ? 'bg-[#CDAD5A] w-6'
                                            : 'bg-gray-700 hover:bg-gray-500'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* YouTube Modal */}
            <AnimatePresence>
                {selectedVideoId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                        onClick={() => setSelectedVideoId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedVideoId(null)}
                                className="absolute -top-12 right-0 text-white text-4xl hover:text-[#CDAD5A] transition-colors z-50 focus:outline-none"
                            >
                                ×
                            </button>
                            <div className="relative pb-[56.25%] h-0">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VideoTipsSection;

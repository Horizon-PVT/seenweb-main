import React, { useState } from 'react';
import Link from 'next/link';
import { Play, BookOpen, ArrowRight, TrendingUp, Lightbulb } from 'lucide-react';

interface KnowledgeSectionProps {
    featuredVideo?: {
        title: string;
        desc: string;
        videoId: string;
        thumb: string;
    };
    articles?: any[];
}

const KnowledgeSection: React.FC<KnowledgeSectionProps> = ({ featuredVideo, articles = [] }) => {
    // Placeholder Data (Fallback)
    const DEFAULT_VIDEO = {
        title: "Lộ Trình Làm YouTube 2026: Bắt Đầu Từ Đâu?",
        desc: "Video mở đầu cho series hướng dẫn chi tiết cách xây dựng kênh YouTube thành công trong năm 2026.",
        videoId: "yvUouUjwZKw", // Updated real ID
        thumb: "/images/thumbnail-strategy.png"
    };

    const FEATURED_VIDEO = featuredVideo || DEFAULT_VIDEO;

    const DEFAULT_ARTICLES = [
        {
            id: 1,
            tag: "AI & Tools",
            title: "Top 5 Công cụ AI giúp tăng hiệu suất làm video lên 300%",
            desc: "Khám phá các tool tự động hóa đang thay đổi cách creator làm việc...",
            date: "20 Tháng 1, 2026",
            image: "/images/academy/article-1.jpg"
        },
        {
            id: 2,
            tag: "Thuật Toán",
            title: "Giải mã thuật toán đề xuất YouTube 2026: Điều gì đã thay đổi?",
            desc: "Phân tích cập nhật mới nhất từ YouTube và cách thích nghi...",
            date: "18 Tháng 1, 2026",
            image: "/images/academy/article-2.jpg"
        },
        {
            id: 3,
            tag: "Kiếm Tiền",
            title: "Đa dạng hóa nguồn thu nhập: Không chỉ phụ thuộc vào AdSense",
            desc: "Chiến lược affiliate, booking và bán sản phẩm số hiện quả...",
            date: "15 Tháng 1, 2026",
            image: "/images/academy/article-3.jpg"
        }
    ];

    const DISPLAY_ARTICLES = articles.length > 0 ? articles : DEFAULT_ARTICLES;

    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section className="py-20 bg-[#050505] relative border-t border-gray-900">
            {/* Decoration */}
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-purple-900/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="text-[#CDAD5A] font-bold tracking-widest text-xs uppercase mb-2 block">SeenYT Academy</span>
                    <h2 className="text-4xl md:text-5xl font-playfair font-black text-white mb-4">
                        Kiến Thức <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Thực Chiến</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Không chỉ cung cấp công cụ, chúng tôi trao cho bạn tư duy và chiến lược để thành công bền vững.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: Featured Strategy Video (7 cols) */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                                <Play size={14} fill="white" className="text-white" />
                            </span>
                            Video Chiến Lược Mới Nhất
                        </h3>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(168,85,247,0.15)] group">
                            {!isPlaying ? (
                                <div
                                    className="absolute inset-0 bg-gray-900 cursor-pointer group"
                                    onClick={() => setIsPlaying(true)}
                                >
                                    {/* Thumbnail - Render First */}
                                    <img
                                        src={FEATURED_VIDEO.thumb}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt="Strategy Video"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-black/80 z-10 transition-opacity group-hover:opacity-90" />

                                    {/* Content */}
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
                                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/20 shadow-2xl">
                                            <Play size={40} fill="white" className="text-white ml-2" />
                                        </div>
                                        <h4 className="text-2xl md:text-3xl font-bold text-white mb-2 max-w-lg leading-tight drop-shadow-md">
                                            {FEATURED_VIDEO.title}
                                        </h4>
                                        <p className="text-gray-200 text-sm md:text-base max-w-md drop-shadow">
                                            {FEATURED_VIDEO.desc}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <iframe
                                    src={`https://www.youtube.com/embed/${FEATURED_VIDEO.videoId}?autoplay=1`}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Latest Articles (5 cols) */}
                    <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <BookOpen size={16} className="text-white" />
                                </span>
                                Bài Viết Chuyên Sâu
                            </h3>

                            <div className="flex flex-col gap-6">
                                {DISPLAY_ARTICLES.map((article: any) => (
                                    <Link href="/blog" key={article.id} className="block group">
                                        <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                            {/* Thumbnail - Fixed Width */}
                                            <div className="relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden border border-gray-800 group-hover:border-[#CDAD5A]/50 transition-colors">
                                                <img
                                                    src={article.coverImage || article.image || '/images/academy/article-1.jpg'}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded">
                                                        {article.tag || 'Kiến Thức'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">{article.date}</span>
                                                </div>
                                                <h3 className="text-sm font-bold text-white mb-1.5 leading-snug group-hover:text-[#CDAD5A] transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                                    {article.summary || article.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* View All Button */}
                        <div className="mt-8 pt-8 border-t border-gray-800 text-center xl:text-left">
                            <p className="text-gray-400 text-sm mb-4">
                                Khám phá kho tàng kiến thức giúp kênh của bạn cất cánh.
                            </p>
                            <Link href="/blog">
                                <button className="inline-flex items-center gap-2 text-white font-bold hover:text-[#CDAD5A] transition-colors group">
                                    Xem tất cả bài viết
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default KnowledgeSection;

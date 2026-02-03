import React, { useState } from 'react';
import { Play } from 'lucide-react';

const CreatorMeritSection: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Placeholder video ID - User needs to update this
    const YOUTUBE_VIDEO_ID = "6XMI4XJ_014"; // Replace with actual video ID

    return (
        <section className="py-20 bg-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid-pattern.png')] opacity-10 pointer-events-none" />
            <div className="absolute -left-20 top-20 w-72 h-72 bg-purple-900/20 rounded-full blur-[100px]" />
            <div className="absolute -right-20 bottom-20 w-72 h-72 bg-blue-900/20 rounded-full blur-[100px]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">

                    {/* Left: Text Content */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#CDAD5A]/20 to-transparent border border-[#CDAD5A]/30 text-[#CDAD5A] font-bold text-xs uppercase tracking-widest mb-6 animate-pulse">
                            Lời nhắn từ Founder
                        </div>

                        <h2 className="text-4xl md:text-5xl font-playfair font-black text-white leading-tight mb-6">
                            Cảm ơn bạn đã tin tưởng <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-yellow-200">
                                SeenYT
                            </span>
                        </h2>

                        <p className="text-lg text-gray-400 leading-relaxed mb-8">
                            "Hành trình làm YouTube không hề dễ dàng, nhưng bạn không đơn độc. SeenYT được tạo ra không chỉ là một công cụ, mà là người bạn đồng hành giúp bạn đi nhanh hơn, xa hơn và kiếm tiền bền vững hơn."
                        </p>

                        <div className="flex flex-col md:flex-row items-center gap-6 justify-center md:justify-start">
                            {/* Signature or Founder Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-[#CDAD5A] to-purple-600">
                                    <img
                                        src="/images/logo-seen-chat.png"
                                        alt="Tung Pham"
                                        className="w-full h-full object-cover rounded-full bg-black"
                                    />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold text-lg">Tùng Phạm</h4>
                                    <p className="text-[#CDAD5A] text-sm font-medium">Founder SeenYT</p>
                                </div>
                            </div>

                            {/* Signature Image (Optional) */}
                            {/* <img src="/images/signature.png" alt="Signature" className="h-12 opacity-80 filter invert" /> */}
                        </div>
                    </div>

                    {/* Right: Video Player */}
                    <div className="flex-1 w-full max-w-lg relative group">
                        {/* Frame/Border Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-tr from-[#CDAD5A] via-purple-600 to-blue-600 rounded-2xl opacity-70 blur group-hover:opacity-100 transition duration-1000"></div>

                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl">
                            {!isPlaying ? (
                                <div
                                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                                    onClick={() => setIsPlaying(true)}
                                >
                                    {/* Thumbnail */}
                                    <img
                                        src="/images/thumbnail-founder.jpg"
                                        alt="Founder Thumbnail"
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

                                    {/* Play Button */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-[#CDAD5A] rounded-full flex items-center justify-center pl-2 shadow-[0_0_30px_rgba(205,173,90,0.5)] group-hover:scale-110 transition-transform duration-300">
                                            <Play fill="white" className="text-white w-8 h-8" />
                                        </div>
                                        <p className="mt-6 text-white font-bold tracking-wider text-sm drop-shadow-lg">XEM VIDEO CHÀO MỪNG</p>
                                    </div>
                                </div>
                            ) : (
                                <iframe
                                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`}
                                    title="Welcome Video"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CreatorMeritSection;

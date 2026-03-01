import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    CheckCircle, Zap, Crown, Rocket, TrendingUp, Globe, Video,
    DollarSign, BarChart3, Users, Shield, Star, ArrowRight, Sparkles,
    Settings, Palette, FileText, MonitorPlay, MessageSquare, Target,
    Gift, Award, ChevronRight, Play, Timer, Quote
} from 'lucide-react';

// ============================================================
// MATRIX CODE RAIN BACKGROUND (Canvas)
// ============================================================
function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = Array(columns).fill(1);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコ0123456789<>/{}[]()=+*&^%$#@!';

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 15, 30, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(205, 173, 90, 0.10)';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ opacity: 0.35 }}
        />
    );
}

// ============================================================
// 3D SHIELD CAM KẾT (Spinning Security Shield)
// ============================================================
function CommitmentShield() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative flex flex-col items-center cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Shield container */}
            <div
                className="relative w-28 h-28 md:w-36 md:h-36 transition-all duration-700"
                style={{
                    perspective: '600px',
                }}
            >
                <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-1000"
                    style={{
                        transformStyle: 'preserve-3d',
                        animation: isHovered ? 'none' : 'shield-spin 6s linear infinite',
                        transform: isHovered ? 'rotateY(0deg) scale(1.15)' : undefined,
                    }}
                >
                    {/* Shield shape */}
                    <div className="relative w-24 h-28 md:w-32 md:h-36">
                        {/* Shield SVG */}
                        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_0_20px_rgba(205,173,90,0.5)]">
                            <defs>
                                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#CDAD5A" />
                                    <stop offset="50%" stopColor="#F5C542" />
                                    <stop offset="100%" stopColor="#CDAD5A" />
                                </linearGradient>
                                <linearGradient id="shieldInner" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(205,173,90,0.15)" />
                                    <stop offset="100%" stopColor="rgba(245,197,66,0.08)" />
                                </linearGradient>
                            </defs>
                            {/* Shield outline */}
                            <path
                                d="M50 5 L90 25 L85 75 L50 115 L15 75 L10 25 Z"
                                fill="url(#shieldInner)"
                                stroke="url(#shieldGrad)"
                                strokeWidth="2.5"
                            />
                            {/* Inner shield */}
                            <path
                                d="M50 15 L80 30 L76 72 L50 105 L24 72 L20 30 Z"
                                fill="none"
                                stroke="url(#shieldGrad)"
                                strokeWidth="1"
                                opacity="0.4"
                            />
                            {/* Checkmark */}
                            <path
                                d="M35 58 L46 70 L68 45"
                                fill="none"
                                stroke="#CDAD5A"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* Sparkle effects */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-60" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }} />
                    </div>
                </div>

                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-[#CDAD5A]/10 blur-2xl pointer-events-none" />
            </div>

            {/* Hover reveal text */}
            <div className={`mt-3 text-center transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0 max-h-20' : 'opacity-0 -translate-y-2 max-h-0'} overflow-hidden`}>
                <p className="text-[#CDAD5A] font-black text-sm md:text-base px-4">
                    HOÀN TIỀN 100%
                </p>
                <p className="text-gray-400 text-[10px] md:text-xs">
                    Không đạt view — Không thu phí
                </p>
            </div>
        </div>
    );
}

// ============================================================
// TREASURE CHEST VISUAL (Gói 1 — 10 Content Ideas)
// ============================================================
function TreasureChest() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="relative flex items-center justify-center py-6 cursor-pointer"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className="relative w-52 h-40 md:w-64 md:h-48">
                {/* Chest base */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-16 md:w-36 md:h-20 bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg border-2 border-[#CDAD5A]/50 shadow-[0_0_30px_rgba(205,173,90,0.3)]">
                    {/* Lock */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-5 bg-[#CDAD5A] rounded-sm" />
                </div>
                {/* Chest lid */}
                <div
                    className="absolute bottom-14 md:bottom-[72px] left-1/2 -translate-x-1/2 w-30 h-8 md:w-[152px] md:h-10 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg border-2 border-b-0 border-[#CDAD5A]/50 origin-bottom transition-transform duration-700"
                    style={{
                        transform: isOpen ? 'rotateX(-60deg)' : 'rotateX(0deg)',
                        width: '116px',
                    }}
                />

                {/* Content scrolls flying out */}
                {isOpen && (
                    <>
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-lg transition-all duration-700"
                                style={{
                                    left: `${25 + Math.cos(i * 36 * Math.PI / 180) * 35}%`,
                                    bottom: `${50 + Math.sin(i * 36 * Math.PI / 180) * 30 + i * 2}%`,
                                    transform: `rotate(${i * 36}deg)`,
                                    opacity: 0.9,
                                    animation: `scroll-float-${i % 3} 2s ease-in-out infinite`,
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            >
                                📜
                            </div>
                        ))}
                        {/* Golden glow */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#CDAD5A]/30 rounded-full blur-xl animate-pulse" />
                    </>
                )}

                {/* YouTube logo floating above */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-700 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <div className="w-10 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// DOMINO PHONES VISUAL (Gói 2 — Combo 5 Video)
// ============================================================
function DominoPhones() {
    const [animate, setAnimate] = useState(false);

    return (
        <div
            className="relative flex items-center justify-center py-6 cursor-pointer"
            onMouseEnter={() => setAnimate(true)}
            onMouseLeave={() => setAnimate(false)}
        >
            <div className="flex items-end gap-1 md:gap-1.5" style={{ perspective: '500px' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="relative w-10 h-[60px] md:w-12 md:h-[72px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-white/20 flex items-center justify-center transition-all shadow-lg"
                        style={{
                            transform: animate
                                ? `rotateZ(${(i - 2) * 8}deg) translateY(${Math.abs(i - 2) * -4}px)`
                                : `rotateZ(${(i - 2) * 3}deg) translateY(0px)`,
                            transitionDuration: `${400 + i * 100}ms`,
                            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                            boxShadow: animate
                                ? `0 ${10 + i * 2}px ${20 + i * 5}px rgba(0,0,0,0.4), 0 0 15px rgba(205,173,90,${0.1 + i * 0.05})`
                                : '0 5px 15px rgba(0,0,0,0.3)',
                            zIndex: 5 - Math.abs(i - 2),
                        }}
                    >
                        {/* Screen content */}
                        <div className="w-[80%] h-[75%] bg-gradient-to-b from-blue-600/20 to-purple-600/20 rounded-sm flex items-center justify-center">
                            <Play className="w-3 h-3 md:w-4 md:h-4 text-white/60" />
                        </div>
                        {/* Phone notch */}
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-gray-700 rounded-full" />
                        {/* Number badge */}
                        <div
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#CDAD5A] flex items-center justify-center text-[9px] font-black text-black shadow-md transition-all"
                            style={{
                                transform: animate ? 'scale(1.2)' : 'scale(1)',
                                transitionDelay: `${i * 100}ms`,
                            }}
                        >
                            {i + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


// ============================================================
// MAIN PAGE
// ============================================================
export default function ServicesPage() {
    const [isQuarterly, setIsQuarterly] = useState(false);
    const [portfolioVideos, setPortfolioVideos] = useState<any[]>([]);
    const [activeVideo, setActiveVideo] = useState<any>(null);
    const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
    const handleZaloContact = () => {
        window.open('https://zalo.me/0789284078', '_blank');
    };

    // Fetch portfolio videos
    useEffect(() => {
        fetch('/api/portfolio-videos')
            .then(r => r.json())
            .then(d => setPortfolioVideos(Array.isArray(d) ? d : []))
            .catch(() => { });
    }, []);

    return (
        <div className="bg-[#0A0F1E] text-gray-200 min-h-screen font-sans selection:bg-[#CDAD5A]/30 selection:text-white">
            <Head>
                <title>Dịch Vụ SeenYT — Sản Xuất Video AI & Quản Trị Kênh YouTube</title>
                <meta name="description" content="Danh mục dịch vụ thực thi SeenYT: Setup kênh chuẩn SEO, sản xuất video AI theo combo, quản trị & phát triển thương hiệu. Cam kết hoàn tiền 100%." />
            </Head>

            <Header />
            <MatrixRain />

            <main className="relative z-10">

                {/* =====================================================
            HERO SECTION
            ===================================================== */}
                <section className="relative pt-28 md:pt-36 pb-8 md:pb-12 overflow-hidden">
                    {/* Ambient glows */}
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#CDAD5A]/8 blur-[180px] rounded-full pointer-events-none" />
                    <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CDAD5A]/10 border border-[#CDAD5A]/30 text-[#CDAD5A] font-bold text-xs md:text-sm mb-6">
                            <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                            SEENYT — DỊCH VỤ THỰC THI CAM KẾT
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-playfair tracking-tight mb-5 leading-tight">
                            DANH MỤC DỊCH VỤ
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] via-[#F5C542] to-[#CDAD5A]">
                                THỰC THI SEENYT
                            </span>
                        </h1>

                        <p className="text-sm md:text-base text-gray-500 font-semibold uppercase tracking-[0.15em] mb-4">
                            Phiên bản cam kết — Không đạt, hoàn tiền
                        </p>

                        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Từ <strong className="text-white">Setup kênh</strong> đến <strong className="text-white">Sản xuất Video AI</strong> và <strong className="text-white">Quản trị trọn gói</strong> —
                            Tất cả được thực thi bởi đội ngũ chuyên gia + công nghệ AI độc quyền của SeenYT.
                        </p>
                    </div>
                </section>


                {/* =====================================================
            CAM KẾT SHIELD + BANNER
            ===================================================== */}
                <section className="py-10 md:py-14">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10">
                            {/* Shield 3D */}
                            <CommitmentShield />

                            {/* Commitment text */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-black text-white font-playfair mb-3">
                                    🛡️ CAM KẾT VÀNG CỦA SEENYT
                                </h2>
                                <div className="bg-white/[0.03] backdrop-blur-xl border border-[#CDAD5A]/20 rounded-xl p-5 md:p-6">
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        <strong className="text-[#CDAD5A]">Hoàn tiền 100%</strong> phí sản xuất nếu video không đạt được
                                        lượng view/tương tác tối thiểu như thỏa thuận ban đầu
                                        <span className="text-gray-500"> (áp dụng cho các kênh do SeenYT quản trị hoặc setup)</span>.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-3 justify-center md:justify-start">
                                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                                            <CheckCircle className="w-3 h-3" /> Cam kết bằng hợp đồng
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                                            <Shield className="w-3 h-3" /> Bảo vệ quyền lợi KH
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
                                            <Award className="w-3 h-3" /> Uy tín 5+ năm
                                        </span>
                                    </div>
                                    {/* Disclaimer */}
                                    <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                                        <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed">
                                            <strong className="text-gray-400">📌 Điều khoản:</strong> Cam kết hoàn tiền có hiệu lực khi khách hàng tuân thủ đúng lịch đăng bài và ngách nội dung mà SeenYT tư vấn. Nhằm tránh trường hợp khách hàng tự ý đổi nội dung hoặc vi phạm chính sách cộng đồng làm ảnh hưởng đến view.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* =====================================================
            SẢN PHẨM ĐÃ THỰC HIỆN (Portfolio Masonry Grid)
            ===================================================== */}
                {portfolioVideos.length > 0 && (
                    <section className="py-10 md:py-16 bg-[#111116]/50 border-y border-white/5">
                        <div className="container mx-auto px-4">
                            <div className="max-w-6xl mx-auto">
                                {/* Section header */}
                                <div className="text-center mb-8">
                                    <span className="text-[10px] md:text-xs text-[#CDAD5A] font-bold uppercase tracking-widest">Portfolio</span>
                                    <h2 className="text-2xl md:text-4xl font-black text-white font-playfair mt-1">
                                        🎬 SẢN PHẨM ĐÃ THỰC HIỆN
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-2">Những video do SeenYT sản xuất bằng công nghệ AI</p>
                                </div>

                                {/* Masonry Grid */}
                                <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                                    {portfolioVideos.map((video, idx) => (
                                        <div
                                            key={video.id}
                                            onClick={() => setActiveVideo(video)}
                                            onMouseEnter={() => setHoveredVideoId(video.id)}
                                            onMouseLeave={() => setHoveredVideoId(null)}
                                            className="block break-inside-avoid group relative rounded-xl overflow-hidden border border-white/10 hover:border-[#CDAD5A]/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(205,173,90,0.15)] hover:-translate-y-1 cursor-pointer"
                                        >
                                            {/* Thumbnail or Hover Video */}
                                            <div className="relative" style={{ aspectRatio: idx % 3 === 0 ? '9/16' : idx % 3 === 1 ? '4/5' : '1/1' }}>
                                                <img
                                                    src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                                    alt={video.title}
                                                    className={`w-full h-full object-cover transition-transform duration-700 ${hoveredVideoId === video.id ? 'scale-105 opacity-0' : ''}`}
                                                />
                                                {/* YouTube iframe on hover */}
                                                {hoveredVideoId === video.id && (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.youtubeId}&modestbranding=1&showinfo=0&rel=0`}
                                                        className="absolute inset-0 w-full h-full"
                                                        allow="autoplay; encrypted-media"
                                                        style={{ border: 'none' }}
                                                    />
                                                )}
                                                {/* AI badge */}
                                                {idx % 2 === 0 && hoveredVideoId !== video.id && (
                                                    <div className="absolute top-2 left-2 z-10">
                                                        <span className="text-[8px] bg-[#CDAD5A]/90 text-black px-1.5 py-0.5 rounded font-bold">✦ AI Video</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Title */}
                                            {hoveredVideoId !== video.id && (
                                                <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent">
                                                    <p className="text-[11px] font-bold text-white leading-tight line-clamp-2">{video.title}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* CTA below grid */}
                                <div className="text-center mt-8">
                                    <p className="text-xs text-gray-500 mb-3">Và hàng trăm video khác đã được sản xuất...</p>
                                    <button
                                        onClick={handleZaloContact}
                                        className="px-6 py-2.5 bg-white/[0.05] border border-[#CDAD5A]/30 text-[#CDAD5A] rounded-xl text-xs font-bold hover:bg-[#CDAD5A]/10 transition-all"
                                    >
                                        XEM THÊM SẢN PHẨM →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Video Lightbox Modal */}
                {activeVideo && (
                    <div
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        onClick={() => setActiveVideo(null)}
                    >
                        <div
                            className={`relative w-full ${activeVideo.youtubeUrl?.includes('shorts') ? 'max-w-sm' : 'max-w-3xl'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl font-light transition-colors"
                            >
                                ✕
                            </button>
                            {/* YouTube Embed */}
                            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ paddingBottom: activeVideo.youtubeUrl?.includes('shorts') ? '177.78%' : '56.25%' }}>
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                                    title={activeVideo.title}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            {/* Video title */}
                            <p className="text-white text-sm font-bold mt-3 text-center">{activeVideo.title}</p>
                        </div>
                    </div>
                )}


                {/* =====================================================
            GÓI 1: SETUP KÊNH CHUẨN SEO
            ===================================================== */}
                <section className="py-10 md:py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            {/* Section header */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                    <Palette className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] md:text-xs text-blue-400 font-bold uppercase tracking-widest">Gói 1</span>
                                    <h2 className="text-xl md:text-3xl font-black text-white font-playfair leading-tight">
                                        SETUP KÊNH CHUẨN SEO
                                    </h2>
                                </div>
                                <div className="ml-auto hidden md:block">
                                    <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">Nền móng vững chắc</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                {/* Main content */}
                                <div className="lg:col-span-3">
                                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 h-full group hover:border-blue-500/30 transition-all duration-500">
                                        {/* What we do */}
                                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-blue-400" />
                                            Thực hiện
                                        </h3>
                                        <ul className="space-y-3 mb-6">
                                            {[
                                                'Thiết kế bộ nhận diện AI (Avatar / Banner chuyên nghiệp)',
                                                'Cấu hình thông số kỹ thuật chuẩn 2026',
                                                'Tối ưu từ khóa ngách — SEO on-page hoàn chỉnh',
                                            ].map((f, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Bonus gifts */}
                                        <div className="bg-gradient-to-r from-[#CDAD5A]/10 to-transparent border border-[#CDAD5A]/20 rounded-xl p-4 mb-6">
                                            <h4 className="text-sm font-bold text-[#CDAD5A] mb-3 flex items-center gap-2">
                                                <Gift className="w-4 h-4" />
                                                🎁 Đặc quyền tặng thêm
                                            </h4>
                                            <ul className="space-y-2">
                                                <li className="flex items-start gap-2 text-sm text-gray-300">
                                                    <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-yellow-400" />
                                                    <span>Tặng <strong className="text-white">10 ý tưởng Content</strong> độc quyền theo đúng ngách bạn chọn</span>
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-gray-300">
                                                    <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-yellow-400" />
                                                    <span>Tặng <strong className="text-white">3 Video Short</strong> hoặc <strong className="text-white">1 Video Long (3 phút)</strong> để khởi động kênh</span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Price */}
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="text-center sm:text-left">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Giá trọn gói</p>
                                                <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                                    659k
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">Làm 1 lần, chuẩn cả đời ✨</p>
                                            </div>
                                            <button
                                                onClick={handleZaloContact}
                                                className="sm:ml-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:scale-105 transition-all shadow-[0_0_25px_rgba(59,130,246,0.3)] flex items-center gap-2"
                                            >
                                                ĐĂNG KÝ NGAY <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual: Treasure Chest */}
                                <div className="lg:col-span-2 flex items-center justify-center">
                                    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl p-4 w-full">
                                        <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mb-2">✦ Hover để mở kho báu ✦</p>
                                        <TreasureChest />
                                        <p className="text-center text-xs text-gray-500 mt-2">10 ý tưởng Content + Video khởi động</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* =====================================================
            GÓI 2: SẢN XUẤT VIDEO AI (COMBO)
            ===================================================== */}
                <section className="py-10 md:py-16 bg-[#111116]/50 border-y border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            {/* Section header */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                    <Video className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] md:text-xs text-green-400 font-bold uppercase tracking-widest">Gói 2</span>
                                    <h2 className="text-xl md:text-3xl font-black text-white font-playfair leading-tight">
                                        SẢN XUẤT VIDEO AI
                                    </h2>
                                </div>
                                <div className="ml-auto hidden md:block">
                                    <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 font-bold">Bán theo Combo</span>
                                </div>
                            </div>

                            {/* Condition note */}
                            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 mb-6 flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300">
                                    <strong className="text-blue-400">Điều kiện:</strong> Để đảm bảo tính hiệu quả và đồng bộ, SeenYT nhận sản xuất theo
                                    <strong className="text-white"> Gói tối thiểu 5 Video</strong>.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                {/* Pricing cards */}
                                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Video Short */}
                                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-green-500/30 transition-all duration-500 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />
                                        <div className="flex items-center gap-2 mb-1">
                                            <MonitorPlay className="w-4 h-4 text-green-400" />
                                            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Video Short</span>
                                        </div>
                                        <p className="text-gray-500 text-[11px] mb-4">Shorts / Reels / TikTok</p>

                                        <div className="mb-4">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Giá mỗi video</p>
                                            <p className="text-2xl font-black text-white">69k</p>
                                        </div>

                                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                                            <p className="text-xs text-green-400 font-bold">🔥 COMBO 5 VIDEO</p>
                                            <p className="text-xl font-black text-white mt-1">345k</p>
                                            <p className="text-[10px] text-gray-500">5 video viral • AI production</p>
                                        </div>

                                        <button
                                            onClick={handleZaloContact}
                                            className="w-full py-2.5 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold hover:bg-green-500/10 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            ĐẶT COMBO <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Video Long */}
                                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                                        {/* Hot badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">HOT</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Video className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Video Long</span>
                                        </div>
                                        <p className="text-gray-500 text-[11px] mb-4">YouTube Long-form 4K</p>

                                        <div className="mb-4">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Giá mỗi video</p>
                                            <p className="text-2xl font-black text-white">Từ 299k</p>
                                        </div>

                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
                                            <p className="text-xs text-emerald-400 font-bold">🔥 COMBO 5 VIDEO</p>
                                            <p className="text-xl font-black text-white mt-1">Từ 1.495k</p>
                                            <p className="text-[10px] text-gray-500">5 video chất lượng cao • Chuẩn 4K</p>
                                        </div>

                                        <button
                                            onClick={handleZaloContact}
                                            className="w-full py-2.5 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            ĐẶT COMBO <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Visual: Domino Phones */}
                                <div className="lg:col-span-2 flex items-center justify-center">
                                    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl p-4 w-full">
                                        <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mb-2">✦ Hover để xem hiệu ứng ✦</p>
                                        <DominoPhones />
                                        <p className="text-center text-xs text-gray-500 mt-2">5 video liên kết, đồng bộ nội dung</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cam kết vàng mini */}
                            <div className="mt-6 bg-gradient-to-r from-[#CDAD5A]/8 to-transparent border border-[#CDAD5A]/15 rounded-xl p-4 flex items-center gap-3">
                                <Shield className="w-5 h-5 text-[#CDAD5A] flex-shrink-0" />
                                <p className="text-xs text-gray-400">
                                    <strong className="text-[#CDAD5A]">🛡️ CAM KẾT VÀNG:</strong> Hoàn tiền 100% phí sản xuất nếu video không đạt lượng view/tương tác tối thiểu như thỏa thuận.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* =====================================================
            GÓI 3: QUẢN TRỊ & PHÁT TRIỂN THƯƠNG HIỆU
            ===================================================== */}
                <section className="py-10 md:py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            {/* Section header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                                    <Crown className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] md:text-xs text-purple-400 font-bold uppercase tracking-widest">Gói 3</span>
                                    <h2 className="text-xl md:text-3xl font-black text-white font-playfair leading-tight">
                                        QUẢN TRỊ & PHÁT TRIỂN THƯƠNG HIỆU
                                    </h2>
                                </div>
                            </div>

                            {/* TOGGLE: Tháng / Quý */}
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <span className={`text-sm font-bold transition-colors ${!isQuarterly ? 'text-white' : 'text-gray-500'}`}>Thanh toán theo Tháng</span>
                                <button
                                    onClick={() => setIsQuarterly(!isQuarterly)}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-500 ${isQuarterly ? 'bg-gradient-to-r from-[#CDAD5A] to-[#F5C542] shadow-[0_0_20px_rgba(205,173,90,0.4)]' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${isQuarterly ? 'left-[30px]' : 'left-0.5'}`} />
                                </button>
                                <span className={`text-sm font-bold transition-colors ${isQuarterly ? 'text-[#CDAD5A]' : 'text-gray-500'}`}>Theo Quý</span>
                                {isQuarterly && <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">TIẾT KIỆM 20%</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Mức 1 */}
                                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-violet-500/30 transition-all duration-500 relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/50 to-transparent rounded-t-2xl" />
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded-full">Mức 1</span>
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-1 font-playfair">Quản trị Cơ bản</h3>
                                    {!isQuarterly ? (
                                        <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400 mb-4">
                                            1.400k<span className="text-sm text-gray-400">/tháng</span>
                                        </p>
                                    ) : (
                                        <div className="mb-4">
                                            <p className="text-lg text-gray-500 line-through">4.200k</p>
                                            <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-amber-400">
                                                3.360k<span className="text-sm text-gray-400">/quý</span>
                                            </p>
                                            <p className="text-[10px] text-green-400">≈ 1.120k/tháng</p>
                                        </div>
                                    )}
                                    <ul className="space-y-2.5 mb-6">
                                        {[
                                            'Đăng bài hàng ngày đúng giờ vàng',
                                            'SEO tiêu đề, mô tả, tag',
                                            'Trực comment & tương tác',
                                            'Tối ưu thuật toán hàng ngày',
                                        ].map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-400" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={handleZaloContact}
                                        className="w-full py-2.5 border border-violet-500/30 text-violet-400 rounded-xl text-xs font-bold hover:bg-violet-500/10 transition-all"
                                    >
                                        TƯ VẤN NGAY
                                    </button>
                                </div>

                                {/* Mức 2 */}
                                <div className="bg-white/[0.03] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 group hover:border-purple-500/40 transition-all duration-500 relative shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl" />
                                    {/* Popular badge */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-lg">
                                            ⭐ Phổ biến nhất
                                        </span>
                                    </div>
                                    <div className="mb-4 mt-2">
                                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full">Mức 2</span>
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-1 font-playfair">Quản trị Chiến lược</h3>
                                    {!isQuarterly ? (
                                        <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                                            2.100k<span className="text-sm text-gray-400">/tháng</span>
                                        </p>
                                    ) : (
                                        <div className="mb-4">
                                            <p className="text-lg text-gray-500 line-through">6.300k</p>
                                            <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-amber-400">
                                                5.040k<span className="text-sm text-gray-400">/quý</span>
                                            </p>
                                            <p className="text-[10px] text-green-400">≈ 1.680k/tháng</p>
                                        </div>
                                    )}
                                    <ul className="space-y-2.5 mb-6">
                                        {[
                                            'Bao gồm toàn bộ Mức 1',
                                            'Lên kế hoạch nội dung chiến lược',
                                            'Phân tích đối thủ & xu hướng',
                                            'Tối ưu chuyển đổi doanh thu',
                                            'Báo cáo Analytics hàng tuần',
                                        ].map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-purple-400" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={handleZaloContact}
                                        className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                                    >
                                        ĐĂNG KÝ NGAY
                                    </button>
                                </div>

                                {/* Mức 3 */}
                                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-[#CDAD5A]/30 transition-all duration-500 relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#CDAD5A] to-amber-600 rounded-t-2xl" />
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold text-[#CDAD5A] uppercase tracking-widest bg-[#CDAD5A]/10 px-2 py-0.5 rounded-full">Mức 3</span>
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-1 font-playfair">Thương hiệu Trọn gói</h3>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">All-in-one</p>
                                    <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-amber-400 mb-1">
                                        Thỏa thuận
                                    </p>
                                    <p className="text-xs text-gray-500 mb-2">Theo quy mô & nhu cầu</p>
                                    {isQuarterly && <p className="text-[10px] text-green-400 mb-2">Giảm 15% tổng hợp đồng quý</p>}
                                    <ul className="space-y-2.5 mb-6">
                                        {[
                                            'Bao gồm toàn bộ Mức 1 + Mức 2',
                                            'Lên ý tưởng → Viết kịch bản',
                                            'Sản xuất Video (Short + Long)',
                                            'Quản trị toàn bộ kênh',
                                            'Chiến lược tăng trưởng doanh thu',
                                        ].map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#CDAD5A]" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={handleZaloContact}
                                        className="w-full py-2.5 border border-[#CDAD5A]/30 text-[#CDAD5A] rounded-xl text-xs font-bold hover:bg-[#CDAD5A]/10 transition-all"
                                    >
                                        LIÊN HỆ BÁO GIÁ
                                    </button>
                                </div>
                            </div>

                            {/* Quarterly bonuses — always visible to entice customers */}
                            {(
                                <div className="mt-8 bg-gradient-to-r from-[#CDAD5A]/10 to-transparent border border-[#CDAD5A]/20 rounded-2xl p-6 transition-all duration-500 animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-4">
                                        {/* Mini hourglass */}
                                        <div className="w-12 h-12 rounded-xl bg-[#CDAD5A]/10 border border-[#CDAD5A]/30 flex items-center justify-center">
                                            <Timer className="w-6 h-6 text-[#CDAD5A]" />
                                        </div>
                                        <div>
                                            <h3 className="text-base md:text-lg font-black text-[#CDAD5A]">🎁 ĐẶC QUYỀN KHI ĐĂNG KÝ THEO QUÝ</h3>
                                            <p className="text-xs text-gray-500">Nhận thêm những ưu đãi độc quyền chỉ dành cho gói Quý</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                            <p className="text-sm font-bold text-white mb-1">🎯 Zoom 1-1 (60p)</p>
                                            <p className="text-xs text-gray-400">Mr. Seen trực tiếp định hướng ngách và chiến lược nội dung riêng cho bạn.</p>
                                            <p className="text-[10px] text-[#CDAD5A] mt-1">Trị giá 2.000k</p>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                            <p className="text-sm font-bold text-white mb-1">⚡ Ưu tiên hỗ trợ</p>
                                            <p className="text-xs text-gray-400">Giải quyết mọi vấn đề kỹ thuật/bản quyền trong vòng 2h làm việc.</p>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                            <p className="text-sm font-bold text-white mb-1">🛡️ Bảo chứng kết quả</p>
                                            <p className="text-xs text-gray-400">Kích hoạt Cam kết hoàn tiền nếu không đạt chỉ số view/viral sau 90 ngày.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>


                {/* =====================================================
            WHY SEENYT
            ===================================================== */}
                <section className="py-12 md:py-16 bg-[#111116]/50 border-y border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-4xl font-black text-white font-playfair mb-3">
                                TẠI SAO CHỌN SEENYT?
                            </h2>
                            <p className="text-gray-500 text-sm">Sự khác biệt tạo nên giá trị</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                            {[
                                { icon: <Zap className="w-6 h-6 text-yellow-400" />, title: 'AI độc quyền', desc: 'Bộ công cụ SeenYT Studio: MC ảo, Voice AI, Script AI, Thumbnail AI.' },
                                { icon: <Shield className="w-6 h-6 text-blue-400" />, title: 'Cam kết hoàn tiền', desc: 'Hoàn 100% nếu không đạt KPI view/tương tác như thỏa thuận.' },
                                { icon: <BarChart3 className="w-6 h-6 text-green-400" />, title: 'Báo cáo minh bạch', desc: 'Analytics chi tiết hàng tuần. Khách hàng nắm hiệu suất real-time.' },
                                { icon: <Users className="w-6 h-6 text-purple-400" />, title: 'Hỗ trợ 24/7', desc: 'Nhóm hỗ trợ riêng Zalo/Telegram. Phản hồi trong 30 phút.' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-white/15 transition-all group">
                                    <div className="w-11 h-11 bg-white/5 rounded-lg flex items-center justify-center mb-3 border border-white/10 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-base font-bold text-white mb-1.5">{item.title}</h4>
                                    <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* =====================================================
            LỜI NHẮN TỪ MR. SEEN
            ===================================================== */}
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white/[0.03] backdrop-blur-xl border border-[#CDAD5A]/15 rounded-2xl p-6 md:p-10 relative overflow-hidden">
                                {/* Ambient glow */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#CDAD5A]/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CDAD5A] to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(205,173,90,0.3)]">
                                        <Quote className="w-5 h-5 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white font-playfair">LỜI NHẮN TỪ MR. SEEN</h3>
                                        <p className="text-xs text-gray-500">Founder SeenYT</p>
                                    </div>
                                </div>

                                <div className="text-sm md:text-base text-gray-300 leading-relaxed space-y-4 relative z-10">
                                    <p>Chào bạn, tôi là <strong className="text-[#CDAD5A]">Mr. Seen</strong>.</p>
                                    <p>
                                        Nhiều người hỏi tôi: <em className="text-white">&quot;Tại sao dịch vụ của SeenYT lại rẻ mà cam kết mạnh mẽ đến vậy?&quot;</em>.
                                        Câu trả lời rất đơn giản: <strong className="text-white">Chúng tôi không dùng sức người để làm những việc mà AI có thể làm tốt hơn gấp 10 lần.</strong>
                                    </p>
                                    <p>
                                        Tại SeenYT, chúng tôi dùng <span className="text-[#CDAD5A] font-semibold">Tư duy Master</span> để định hướng và dùng <span className="text-[#CDAD5A] font-semibold">Công nghệ AI</span> để thực thi.
                                        Mục tiêu của tôi không phải là bán cho bạn vài cái video, mà là giúp bạn sở hữu một <strong className="text-white">Tài sản số</strong> thực sự có thể tạo ra thu nhập thụ động bền vững.
                                    </p>
                                    <p className="text-[#CDAD5A] font-semibold italic">
                                        &quot;Nếu bạn đã sẵn sàng để san phẳng cuộc chơi trên YouTube, TikTok hay Facebook, hãy để tôi và đội ngũ SeenYT đồng hành cùng bạn ngay hôm nay. Chúng tôi cam kết bằng uy tín và kết quả thực tế!&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* =====================================================
            CTA SECTION
            ===================================================== */}
                <section className="py-20 md:py-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E] via-[#CDAD5A]/5 to-[#0A0F1E] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#CDAD5A]/5 blur-[200px] rounded-full pointer-events-none" />

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white font-playfair mb-5">
                            SẴN SÀNG KHỞI ĐỘNG
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-[#F5C542]">
                                KÊNH YOUTUBE AI?
                            </span>
                        </h2>
                        <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-8">
                            Liên hệ ngay để nhận tư vấn miễn phí. Đội ngũ SeenYT sẽ phân tích và đưa ra giải pháp phù hợp nhất cho bạn.
                        </p>

                        <button
                            onClick={handleZaloContact}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#CDAD5A] to-[#F5C542] text-black font-black text-lg rounded-full hover:scale-105 transition-all shadow-[0_0_50px_rgba(205,173,90,0.4)] hover:shadow-[0_0_70px_rgba(205,173,90,0.6)]"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.464 11.666c0-5.755-4.802-10.42-10.732-10.42-5.93 0-10.732 4.665-10.732 10.42 0 3.195 1.493 6.05 3.84 8.014v4.32l4.16-2.22c.866.24 1.78.37 2.732.37 5.93 0 10.732-4.665 10.732-10.42z" />
                            </svg>
                            TƯ VẤN QUA ZALO NGAY
                        </button>

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500">
                            <span>📞 Hotline: 0789.284.078</span>
                            <span className="hidden sm:inline">•</span>
                            <span>📧 Email: contact@seenyt.net</span>
                            <span className="hidden sm:inline">•</span>
                            <span>⏰ Phản hồi trong 30 phút</span>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />

            {/* =====================================================
          INLINE STYLES
          ===================================================== */}
            <style jsx global>{`
        @keyframes shield-spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        @keyframes scroll-float-0 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }
        @keyframes scroll-float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        @keyframes scroll-float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(8deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
        </div>
    );
}

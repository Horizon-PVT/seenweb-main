'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Rocket, Play } from 'lucide-react';

const HeroSection: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const router = useRouter();
  const { t } = useTranslation('common');

  // Logic check đăng nhập
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const handleTryFreeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center text-center pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-4"
    >
      {/* Video background 18s */}
      <video
        autoPlay
        muted={isMuted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay tối và Ambient Glows */}
      <div className="absolute inset-0 bg-black/70 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-purple-600/30 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-pink-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Nội dung chính */}
      <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 backdrop-blur-md animate-fade-in-up">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          SeenYT Ecosystem v2026 Đã Ra Mắt
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight animate-fade-in-up text-white" style={{ animationDelay: '0.1s' }}>
          Quy Trình Triệu View <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
            Tự Động Hóa Bằng AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Đừng làm YouTube bằng sức lực, hãy làm bằng AI. Hệ sinh thái SeenYT cung cấp bộ công cụ thông minh nhất và giải pháp trọn gói giúp bạn tăng trưởng kênh nhàn hơn, nhanh hơn.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full md:w-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleTryFreeClick}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg transition-all shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Trải nghiệm Tool AI Miễn Phí <Rocket className="w-5 h-5" />
          </button>

          <Link href="/new-youtuber" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 text-white font-bold text-lg transition-all backdrop-blur-md flex items-center justify-center gap-2">
            <Play className="w-5 h-5 text-purple-400" /> Xem Hành Trình Cho Người Mới
          </Link>
        </div>

        {/* Social Proof Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 w-full max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mb-6">Được tin dùng bởi hơn 10,000+ Creators trên đa nền tảng</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="font-black text-2xl flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Play fill="white" className="w-4 h-4" /></div> YouTube
            </div>
            <div className="font-black text-2xl flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">T</div> TikTok
            </div>
            <div className="font-black text-2xl tracking-tighter text-white" style={{ fontFamily: 'serif' }}>CreatorCamp</div>
          </div>
        </div>
      </div>

      {/* Nút toggle sound */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-8 right-6 md:right-12 z-20 bg-black/60 backdrop-blur-sm p-4 rounded-full hover:bg-black/80 transition text-white text-2xl shadow-lg border border-white/10"
        aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </section>
  );
};

export default HeroSection;

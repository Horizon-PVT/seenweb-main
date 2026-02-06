'use client';

import React, { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

type CountUpProps = {
  to: number;
  durationMs?: number;
  suffix?: string;
  formatter?: (v: number) => string;
  start?: number;
};

const CountUp: React.FC<CountUpProps> = ({
  to,
  durationMs = 1800,
  suffix = '',
  formatter,
  start = 0,
}) => {
  const [value, setValue] = React.useState(start);
  const rafRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const step = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;

      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);

      const next = Math.round(start + (to - start) * eased);
      setValue(next);

      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, durationMs, start]);

  const text = formatter ? formatter(value) : String(value);
  return <span>{text}{suffix}</span>;
};

const HeroSection: React.FC = () => {
  const viNumber = useMemo(() => new Intl.NumberFormat('vi-VN'), []);
  const [isMuted, setIsMuted] = useState(true);
  const router = useRouter();
  const { t } = useTranslation('common');

  // Logic check đăng nhập
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const handleTryFreeClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-12 relative overflow-hidden"
    >
      {/* Video background 18s */}
      <video
        autoPlay
        muted={isMuted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay tối */}
      <div className="absolute inset-0 bg-black/50 -z-9" />

      {/* Nội dung chính */}
      {/* Nội dung chính */}
      <div className="relative z-10 p-6 w-full max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-black text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] mb-6">
          {t('hero.title', 'Giúp bạn tìm đúng ngách và')} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-cyan-400">
            {t('hero.title_highlight', 'làm video lên top view')}
          </span>
        </h1>

        <h2 className="text-lg md:text-2xl text-gray-300 font-medium max-w-3xl leading-relaxed mb-8">
          {t('hero.subtitle', 'Không cần kinh nghiệm, chỉ cần làm theo từng bước.')}
        </h2>

        {/* Value Bullets */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-left text-gray-200 mb-10 text-sm md:text-base bg-black/40 p-4 rounded-xl backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>{t('hero.bullet1_q', 'Không biết làm gì?')} → <strong>{t('hero.bullet1_a', 'Chỉ cho bạn video nên làm')}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>{t('hero.bullet2_q', 'Không biết viết?')} → <strong>{t('hero.bullet2_a', 'Có sẵn kịch bản')}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>{t('hero.bullet3_q', 'Không rành SEO?')} → <strong>{t('hero.bullet3_a', 'Hướng dẫn đăng đúng cách')}</strong></span>
          </div>
        </div>

        {/* 2 NÚT CTA song song */}
        {/* 2 NÚT CTA song song */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            {/* Nút Dùng thử miễn phí */}
            <button
              onClick={handleTryFreeClick}
              className="w-full sm:w-auto min-w-[200px] bg-[#A855F7] text-white font-bold py-4 px-8 text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95"
            >
              {t('hero.cta_free', 'Dùng thử miễn phí')}
            </button>

            {/* Nút Lộ trình cho người mới */}
            <button
              onClick={() => router.push('/new-youtuber')}
              className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-[#00ffb4] to-cyan-400 text-black font-bold py-4 px-8 text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,180,0.6)] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🗺️</span> {t('hero.cta_roadmap', 'Lộ trình cho người mới')}
            </button>
          </div>

          {/* Nút Cộng Đồng (Xuống dòng) */}
          <button
            onClick={() => router.push('/community')}
            className="w-full sm:w-auto min-w-[240px] bg-transparent border border-red-600/50 text-red-500 font-bold py-3 px-8 text-base rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
          >
            {t('hero.cta_community', '🚀 GIA NHẬP CỘNG ĐỒNG')}
          </button>
        </div>

        {/* Trust Line */}
        <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm md:text-base">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          {t('hero.trust_line', 'Phù hợp YouTuber mới • Không cần kinh nghiệm • Có gói miễn phí')}
        </div>
      </div>

      {/* Social Icons Stack REMOVED - Moved to Header */}

      {/* Nút toggle sound - Moved slightly left to avoid overlap if needed, or keep as is but check layer */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-8 right-32 z-20 bg-black/60 backdrop-blur-sm p-4 rounded-full hover:bg-black/80 transition text-white text-2xl shadow-lg"
        aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </section>
  );
};

export default HeroSection;
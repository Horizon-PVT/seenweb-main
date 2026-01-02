'use client';

import React, { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

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
        poster="/images/hero-poster.jpg"
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
          Công cụ AI hỗ trợ YouTuber mới <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-cyan-400">
            làm video nhanh & đúng hướng
          </span>
        </h1>

        <h2 className="text-lg md:text-2xl text-gray-300 font-medium max-w-3xl leading-relaxed mb-8">
          Viết kịch bản, SEO YouTube, tìm niche & tạo thumbnail — tất cả trong một quy trình đơn giản cho người mới bắt đầu.
        </h2>

        {/* Value Bullets */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-left text-gray-200 mb-10 text-sm md:text-base bg-black/40 p-4 rounded-xl backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>Không biết làm gì? → <strong>AI gợi ý</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>Không rành SEO? → <strong>Tối ưu tự động</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>Không biết edit? → <strong>Vẫn làm đều</strong></span>
          </div>
        </div>

        {/* 2 NÚT CTA song song */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          {/* Nút Dùng thử miễn phí */}
          <button
            onClick={handleTryFreeClick}
            className="w-full sm:w-auto min-w-[200px] bg-[#A855F7] text-white font-bold py-4 px-8 text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95"
          >
            Dùng thử miễn phí
          </button>

          {/* Nút Xem demo */}
          <a
            href="https://youtu.be/demo_link_placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[200px] bg-transparent text-white font-bold py-4 px-8 text-lg border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>▶</span> Xem demo 3 phút
          </a>
        </div>

        {/* Trust Line */}
        <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm md:text-base">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          Phù hợp YouTuber mới • Không cần kinh nghiệm • Có gói miễn phí
        </div>
      </div>

      {/* Social Icons Stack (Fixed above Chatbot) */}
      <div className="fixed bottom-28 right-8 z-30 flex flex-col items-center gap-4">
        {/* Zalo */}
        <a
          href="https://zalo.me/g/lhxazc331"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(0,104,255,0.6)] text-[#0068FF] shadow-lg"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z" />
          </svg>
        </a>

        {/* Facebook */}
        <a
          href="https://www.facebook.com/profile.php?id=61585796132941"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(24,119,242,0.6)] text-[#1877F2] shadow-lg"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
          </svg>
        </a>

        {/* Telegram */}
        <a
          href="https://t.me/AdSeenYT"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(38,165,228,0.6)] text-[#26A5E4] shadow-lg"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </a>
      </div>

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
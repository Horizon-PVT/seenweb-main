'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

const CrushedIcon: React.FC = () => (
  <div className="w-1/2 h-1/2 animate-glitch">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full text-red-600/50"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21.582 7.042c-.28-.99-1.073-1.785-2.06-2.066C17.913 4.5 12 4.5 12 4.5s-5.913 0-7.522.476c-.987.28-1.78.1.076-2.06.282-1.61.475-1.78.28-2.06C.39 5.913 0 12 0 12s0 5.913.476 7.522c.28.99 1.073 1.785 2.06 2.066C4.087 19.5 12 19.5 12 19.5s5.913 0 7.522-.476c.987-.28 1.78-1.076 2.06-2.06.476-1.61.476-7.522.476-7.522s0-5.913-.476-7.522zM9.75 15.5v-7l6 3.5-6 3.5z"></path>
    </svg>
  </div>
);

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
  const [value, setValue] = useState(start);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const step = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;

      // easeOutCubic cho cảm giác mượt
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);

      const next = Math.round(start + (to - start) * eased);
      setValue(next);

      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTimeRef.current = null;
    };
  }, [to, durationMs, start]);

  const text = formatter ? formatter(value) : String(value);
  return <span>{text}{suffix}</span>;
};

const HeroSection: React.FC = () => {
  const viNumber = useMemo(() => new Intl.NumberFormat('vi-VN'), []);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-12 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-600 to-transparent"></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center [perspective:1000px]">
        <div className="relative w-56 h-56 md:w-72 md:h-72 [transform-style:preserve-3d] animate-[spin_40s_linear_infinite]">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={deg}
              className="absolute inset-0 border border-[#CDAD5A]/30 bg-black/50 flex items-center justify-center"
              style={{ transform: `rotateY(${deg}deg) translateZ(128px)` }}
            >
              <CrushedIcon />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 p-6 w-full">
        {/* giữ nguyên h2 như bản hiện tại để tránh multiple H1 :contentReference[oaicite:1]{index=1} */}
        <h2 className="text-6xl md:text-8xl lg:text-9xl font-playfair font-black text-white leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
          <span className="animate-liquid-pulse">SAN PHẲNG</span> CUỘC CHƠI{' '}
          <span className="animate-liquid-pulse" style={{ animationDelay: '0.3s' }}>
            YOUTUBE
          </span>
        </h2>

        <p className="mt-8 text-xl md:text-2xl text-gray-300 leading-relaxed">
          Tìm ý tưởng • chọn keyword • viết tiêu đề • tối ưu video <br />
          bằng các tool đơn giản, dễ dùng cho người mới làm YouTube.
        </p>

        {/* NÂNG NÚT LÊN: giảm margin-top so với mt-32 md:mt-48 trong file gốc :contentReference[oaicite:2]{index=2} */}
        <div className="mt-20 md:mt-32">
          <a
            href="https://zalo.me/g/lhxazc331"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#008080] text-white font-bold py-4 px-10 text-lg border-2 border-[#008080] rounded-sm transition-all duration-300 transform hover:scale-105 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow hover:emerald-glow-strong no-underline"
          >
            CỘNG ĐỒNG SEENYT
          </a>

          {/* KHỐI SỐ LIỆU (count up) */}
          <div className="mt-12 w-full max-w-5xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-6 md:px-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 items-center">
                {/* 9.600+ */}
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-cyan-300 tracking-wide">
                    <CountUp
                      to={9600}
                      suffix="+"
                      formatter={(v) => viNumber.format(v)}
                    />
                  </div>
                  <div className="mt-2 text-sm md:text-base text-white/60">Creator tin dùng</div>
                </div>

                {/* 400.000+ */}
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-rose-300 tracking-wide">
                    <CountUp
                      to={400000}
                      suffix="+"
                      formatter={(v) => viNumber.format(v)}
                    />
                  </div>
                  <div className="mt-2 text-sm md:text-base text-white/60">Video AI tạo ra</div>
                </div>

                {/* 80M+ (đếm 0 -> 80) */}
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-emerald-300 tracking-wide">
                    <CountUp to={80} suffix="M+" />
                  </div>
                  <div className="mt-2 text-sm md:text-base text-white/60">Lượt view đạt được</div>
                </div>

                {/* 98% */}
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-violet-300 tracking-wide">
                    <CountUp to={98} suffix="%" />
                  </div>
                  <div className="mt-2 text-sm md:text-base text-white/60">Creator hài lòng</div>
                </div>
              </div>
            </div>
          </div>
          {/* /KHỐI SỐ LIỆU */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';

const AffiliateSection: React.FC = () => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleJoinClick = () => {
    if (status === 'authenticated') {
      router.push('/affiliate/dashboard');
    } else {
      router.push('/api/auth/signin?callbackUrl=/affiliate/dashboard');
    }
  };

  // 20 proof data entries (loop proof)
  const proofData = [
    { name: "Nguyễn Hương Ly", commission: "63.400.000 VND" },
    { name: "Trần Văn Nam", commission: "64.500.000 VND" },
    { name: "Lê Minh Hải", commission: "58.200.000 VND" },
    { name: "Phạm Thị Lan Anh", commission: "41.700.000 VND" },
    { name: "Vũ Long Creator", commission: "29.300.000 VND" },
    { name: "Đức Anh Tech", commission: "67.100.000 VND" },
    { name: "Hoàng Thị Mai", commission: "52.800.000 VND" },
    { name: "Bùi Tuấn Kiệt MMO", commission: "48.900.000 VND" },
    { name: "Đặng Ngọc Sơn", commission: "35.600.000 VND" },
    { name: "Ngô Thị Thu Hương", commission: "39.200.000 VND" },
    { name: "Chí Thanh Review", commission: "55.300.000 VND" },
    { name: "Minh Quân Gaming", commission: "42.100.000 VND" },
    { name: "Thảo Vy TikTok", commission: "38.700.000 VND" },
    { name: "Hải Đăng Vlog", commission: "61.500.000 VND" },
    { name: "Kim Ngân Content", commission: "33.800.000 VND" },
    { name: "Quốc Bảo Tech", commission: "70.200.000 VND" },
    { name: "Yến Nhi Beauty", commission: "45.900.000 VND" },
    { name: "Khánh Linh Food", commission: "37.400.000 VND" },
    { name: "Phong Vũ Travel", commission: "51.600.000 VND" },
    { name: "Anh Thư Lifestyle", commission: "44.300.000 VND" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % proofData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="affiliate" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
          {t('affiliate.title', 'Join Affiliate – Earn Lifetime Commission with SeenYT')}
        </h2>

        {/* Neon frame */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-3xl border-4 border-cyan-500/50 shadow-2xl shadow-cyan-500/40 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: CTA button */}
            <div className="lg:col-span-3 flex justify-center">
              <button
                onClick={handleJoinClick}
                className="relative w-72 h-72 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center text-center shadow-2xl hover:shadow-red-500/50 transition-all duration-500 animate-pulse-slow group overflow-hidden"
              >
                <div className="absolute inset-0 rounded-full border-8 border-yellow-400 animate-ping opacity-75"></div>
                <div className="absolute inset-0 rounded-full border-8 border-red-400 animate-ping delay-150 opacity-75"></div>
                <span className="text-3xl font-bold text-white z-10 px-8">
                  {t('affiliate.ctaButton', 'CLICK HERE TO JOIN')}<br />{t('affiliate.ctaButtonLine2', 'AFFILIATE')}
                </span>
              </button>
            </div>

            {/* Center: Video */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-cyan-500/70">
                <video
                  className="w-full h-auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/images/affiliate/video-thumbnail.jpg"
                >
                  <source src="/videos/demo-seenyt.mp4" type="video/mp4" />
                  {t('affiliate.videoNotSupported', 'Your browser does not support video.')}
                </video>
              </div>
            </div>

            {/* Right: Proof boxes */}
            <div className="lg:col-span-3 bg-gray-800/90 p-8 rounded-2xl border border-cyan-600 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-center mb-8 text-yellow-400">
                {t('affiliate.earningsTitle', 'Affiliates Have Earned')}
              </h3>
              <div className="space-y-6">
                {proofData.slice(currentIndex, currentIndex + 3).map((item, idx) => (
                  <div key={idx} className="bg-gray-900/70 p-5 rounded-xl text-center border border-cyan-800/50">
                    <p className="font-bold text-lg text-cyan-300">{item.name}</p>
                    <p className="text-2xl font-bold text-green-400 mt-2">{item.commission}</p>
                  </div>
                ))}
                {currentIndex + 3 > proofData.length && proofData.slice(0, (currentIndex + 3) % proofData.length).map((item, idx) => (
                  <div key={`loop-${idx}`} className="bg-gray-900/70 p-5 rounded-xl text-center border border-cyan-800/50">
                    <p className="font-bold text-lg text-cyan-300">{item.name}</p>
                    <p className="text-2xl font-bold text-green-400 mt-2">{item.commission}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-400 mt-6">
                {t('affiliate.realtimeNote', 'Realtime commissions • You could be next!')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animation */}
      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
        .delay-150 { animation-delay: 150ms; }
      `}</style>
    </section>
  );
};

export default AffiliateSection;
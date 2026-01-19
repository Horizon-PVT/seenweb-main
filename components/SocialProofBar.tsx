// components/SocialProofBar.tsx
// Animated social proof bar with scrolling stats and logos
import React from 'react';
import { useTranslation } from 'next-i18next';

const PARTNER_LOGOS = [
    '/images/partners/youtube.png',
    '/images/partners/google.png',
    '/images/partners/tiktok.png',
    '/images/partners/meta.png',
];

export default function SocialProofBar() {
    const { t } = useTranslation('common');

    const STATS = [
        { number: '500+', label: t('stats.users', 'YouTubers using') },
        { number: '10K+', label: t('stats.videos', 'Videos created') },
        { number: '50M+', label: t('stats.views', 'Views achieved') },
        { number: '98%', label: t('stats.satisfaction', 'Satisfaction') },
    ];

    return (
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 py-4 overflow-hidden border-y border-gray-800">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Stats - Marquee effect */}
                <div className="w-full md:w-1/2 overflow-hidden">
                    <div className="flex items-center gap-8 md:gap-12 animate-marquee">
                        {[...STATS, ...STATS].map((stat, index) => (
                            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-yellow-400">
                                    {stat.number}
                                </span>
                                <span className="text-gray-400 text-sm md:text-base font-medium">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logos - Marquee effect reverse */}
                <div className="w-full md:w-1/2 overflow-hidden border-l border-gray-800/50 pl-0 md:pl-8">
                    <div className="flex items-center gap-8 md:gap-12 animate-marquee-reverse">
                        {[...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS].map((logo, index) => (
                            <div key={index} className="flex-shrink-0 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <div className="text-gray-500 font-bold text-lg flex items-center gap-2 select-none">
                                    {logo.includes('youtube') && <span className="text-red-600">You<span className="text-white">Tube</span></span>}
                                    {logo.includes('google') && <span className="text-white">Google</span>}
                                    {logo.includes('tiktok') && <span className="text-pink-500">TikTok</span>}
                                    {logo.includes('meta') && <span className="text-blue-500">Meta</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CSS for marquee animation */}
            <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 20s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
}

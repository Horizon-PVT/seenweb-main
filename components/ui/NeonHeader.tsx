import React from 'react';
import { useTranslation } from 'next-i18next';

const NeonHeader: React.FC = () => {
    const { t } = useTranslation('common');

    return (
        <div className="relative mb-16 text-center pt-8">
            {/* Main Title with Neon Glow */}
            <div className="relative inline-block group cursor-default">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 relative z-10 font-sans">
                    SeenYT
                </h1>

                {/* Neon Reflection */}
                <div className="absolute -inset-1 blur-2xl bg-cyan-500/20 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>

                {/* Subtitle Badge */}
                <div className="absolute -right-8 top-0 rotate-12 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse-slow">
                    STUDIO
                </div>
            </div>

            {/* Cinematic Divider */}
            <div className="flex items-center justify-center gap-4 mt-4 opacity-70">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
                <div className="text-cyan-400 text-xs font-mono tracking-[0.3em] uppercase">
                    AI Creative Suite v2.0
                </div>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
            </div>

            {/* Description */}
            <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-sm font-light leading-relaxed">
                {t('studio.subtitle', 'Khơi nguồn sáng tạo với bộ công cụ AI tối thượng.')}
            </p>
        </div>
    );
};

export default NeonHeader;

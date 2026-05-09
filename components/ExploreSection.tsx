'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { Users, Sparkles } from 'lucide-react';

const ExploreSection: React.FC = () => {
    const { t } = useTranslation('common');
    const { data: session, status } = useSession();
    const router = useRouter();

    // Top affiliates for social proof
    const topAffiliates = [
        { name: "Bùi Tuấn Kiệt", commission: "Top Affiliate" },
        { name: "Đặng Ngọc Sơn", commission: "Top Affiliate" },
        { name: "Ngô Thị Thu Hương", commission: "Top Affiliate" },
    ];

    const [currentAffiliateIndex, setCurrentAffiliateIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAffiliateIndex((prev) => (prev + 1) % topAffiliates.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleZaloContact = () => {
        window.open('https://zalo.me/0789284078', '_blank');
    };

    const handleJoinAffiliate = () => {
        if (status === 'authenticated') {
            router.push('/affiliate/dashboard');
        } else {
            router.push('/api/auth/signin?callbackUrl=/affiliate/dashboard');
        }
    };

    return (
        <section className="py-16 bg-gradient-to-b from-[#0a0a0c] to-[#0f0f12] border-t border-gray-800/50">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        {t('explore.title', 'Khám Phá Thêm')}
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        {t('explore.subtitle', 'Nâng tầm kênh YouTube với Coaching 1-1 hoặc kiếm thu nhập thụ động với Affiliate.')}
                    </p>
                </div>

                {/* Two Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

                    {/* Card 1: Coaching 1-1 */}
                    <div className="group bg-gradient-to-br from-[#1a1a1e] to-[#0f0f12] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#CDAD5A]/50 transition-all duration-300">
                        {/* Image */}
                        <div className="relative h-48 md:h-56 overflow-hidden">
                            <Image
                                src="/images/mrseen/hero-coaching-new.png"
                                alt="Mr Seen Coaching"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1e] via-transparent to-transparent" />
                            {/* Badge */}
                            <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-[#CDAD5A]/90 text-black text-xs font-bold px-3 py-1.5 rounded-full">
                                <Sparkles size={14} />
                                <span>{t('coaching.badge', 'Dịch Vụ Cao Cấp')}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {t('coaching.title', 'Coaching 1-1')} <span className="text-[#CDAD5A]">YouTube & Affiliate</span>
                            </h3>
                            <p className="text-gray-400 text-sm mb-5 line-clamp-2">
                                {t('explore.coachingDesc', 'Được hướng dẫn cá nhân bởi Mr. Seen để xây dựng kênh bền vững và tối ưu thu nhập.')}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleZaloContact}
                                    className="flex-1 px-4 py-2.5 bg-[#CDAD5A] text-black font-bold text-sm rounded-lg hover:bg-[#F2D06B] transition-colors"
                                >
                                    {t('coaching.ctaZalo', 'Liên hệ Zalo')}
                                </button>
                                <Link
                                    href="/coaching"
                                    className="px-4 py-2.5 border border-gray-700 text-white font-medium text-sm rounded-lg hover:border-[#CDAD5A] hover:text-[#CDAD5A] transition-colors"
                                >
                                    {t('coaching.ctaLearnMore', 'Tìm hiểu')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Affiliate */}
                    <div className="group bg-gradient-to-br from-[#1a1a1e] to-[#0f0f12] border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300">
                        {/* Video */}
                        <div className="relative h-48 md:h-56 overflow-hidden bg-gray-900">
                            <video
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                                poster="/images/affiliate/video-thumbnail.jpg"
                            >
                                <source src="/videos/demo-seenyt.mp4" type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1e] via-transparent to-transparent" />
                            {/* Join Button Overlay */}
                            <button
                                onClick={handleJoinAffiliate}
                                className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-lg"
                            >
                                {t('explore.join_now', '🔥 THAM GIA NGAY')}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {t('affiliate.shortTitle', 'Affiliate')} <span className="text-cyan-400">{t('explore.affiliateHighlight', '30% Hoa Hồng Trọn Đời')}</span>
                            </h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                {t('explore.affiliateDesc', 'Giới thiệu SeenYT và nhận hoa hồng trọn đời. Không giới hạn thu nhập!')}
                            </p>

                            {/* Social Proof */}
                            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3 mb-5">
                                <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                                    <Users size={18} className="text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">{t('affiliate.topEarner', 'Top Affiliate')}</p>
                                    <p className="text-sm font-bold text-white">
                                        {topAffiliates[currentAffiliateIndex].name} • <span className="text-green-400">{topAffiliates[currentAffiliateIndex].commission}</span>
                                    </p>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleJoinAffiliate}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-colors"
                                >
                                    {t('affiliate.ctaJoin', 'Tham gia ngay')}
                                </button>
                                <Link
                                    href="/affiliate"
                                    className="px-4 py-2.5 border border-gray-700 text-white font-medium text-sm rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                                >
                                    {t('affiliate.ctaLearn', 'Chi tiết')}
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ExploreSection;

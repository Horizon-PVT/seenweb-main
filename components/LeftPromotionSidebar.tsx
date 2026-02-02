import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Gift, ChevronRight, X, Sparkles } from 'lucide-react';

const PROMOTIONS = [
    {
        id: 'new-user',
        title: 'Ưu Đãi Người Mới',
        desc: 'Giảm 50% tháng đầu tiên',
        image: '/images/promotion/poster-new-user.jpg',
        link: '/pricing',
        color: 'from-blue-600 to-cyan-500'
    },
    {
        id: 'tet-event',
        title: 'Sự Kiện Tết 2026',
        desc: 'Hoa hồng Affiliate x2',
        image: '/images/promotion/poster-tet-2026.jpg',
        link: '/affiliate',
        color: 'from-red-600 to-orange-500'
    },
    {
        id: 'vip-upgrade',
        title: 'Nâng Cấp VIP',
        desc: 'Mở khóa toàn bộ tính năng AI',
        image: '/images/promotion/poster-upgrade-vip.jpg',
        link: '/pricing',
        color: 'from-purple-600 to-pink-500'
    },
    {
        id: 'affiliate-tier',
        title: 'Affiliate Tier',
        desc: 'Xem bảng thưởng hoa hồng',
        image: '/images/promotion/poster-tier-bonus.jpg',
        link: '/affiliate',
        color: 'from-green-600 to-emerald-500'
    }
];

export default function LeftPromotionSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation('common');

    return (
        <>
            {/* Toggle Button (Fixed Left) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed left-0 top-1/2 -translate-y-1/2 z-40
                    w-12 h-32 bg-gradient-to-b from-red-600 to-orange-600
                    text-white rounded-r-2xl shadow-[0_0_20px_rgba(220,38,38,0.5)]
                    flex flex-col items-center justify-center gap-2
                    hover:w-14 transition-all duration-300 border-r border-t border-b border-white/20
                    ${isOpen ? 'translate-x-[-100%]' : 'translate-x-0'}
                `}
            >
                <Gift className="w-6 h-6 animate-bounce" />
                <span className="text-[10px] font-bold writing-mode-vertical tracking-widest" style={{ writingMode: 'vertical-rl' }}>
                    HOT DEAL
                </span>
                <ChevronRight className="w-4 h-4" />
            </button>

            {/* Sidebar Content */}
            <div
                className={`
                    fixed left-0 top-0 h-full w-80 bg-[#0a0a0c]/95 backdrop-blur-xl
                    border-r border-gray-800 z-50
                    transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                    ${isOpen ? 'translate-x-0' : 'translate-x-[-100%]'}
                    shadow-[10px_0_50px_rgba(0,0,0,0.5)]
                `}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-red-900/20 to-transparent">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-bold text-white text-lg">Ưu Đãi Hot</h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Promotion List */}
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
                    {PROMOTIONS.map((promo) => (
                        <Link href={promo.link} key={promo.id}>
                            <div className="group relative rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 mb-4">
                                {/* Image */}
                                <div className="h-32 w-full bg-gray-800 relative">
                                    {/* Fallback pattern if image missing */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${promo.color} opacity-20`} />
                                    <img
                                        src={promo.image}
                                        alt={promo.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.opacity = '0'; // Hide broken image
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4 bg-gray-900/80 backdrop-blur-sm absolute bottom-0 w-full border-t border-white/10">
                                    <h4 className="font-bold text-white text-sm mb-1">{promo.title}</h4>
                                    <p className="text-xs text-yellow-400 font-medium flex items-center gap-1">
                                        {promo.desc}
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <div className="p-4 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl border border-purple-500/30 text-center mt-6">
                        <p className="text-xs text-gray-400 mb-3">Bạn muốn kiếm tiền cùng SeenYT?</p>
                        <Link href="/affiliate">
                            <button className="w-full py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-gray-200 transition">
                                Đăng Ký Affiliate Ngay
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

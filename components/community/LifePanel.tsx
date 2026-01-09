import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LifePanel() {
    // Dynamic Fake Stats to make it alive
    const [dynamicOnline, setDynamicOnline] = useState(126);
    const [dynamicActive, setDynamicActive] = useState(122);
    const [dynamicHall, setDynamicHall] = useState(17);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate randomly +/- 3
            const diff = Math.floor(Math.random() * 7) - 3;
            setDynamicOnline(prev => Math.max(100, prev + diff));
            setDynamicActive(prev => Math.max(90, prev + diff));
            // Hall fluctuates less
            setDynamicHall(prev => Math.max(5, prev + (Math.random() > 0.5 ? 1 : -1)));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-96 hidden lg:flex flex-col h-full border-l border-red-900/30 font-sans text-xs relative z-30 shadow-2xl bg-gradient-to-b from-[#2a0a0a] via-[#1a0505] to-black">

            {/* HEADER: ONLINE COUNT */}
            <div className="p-4 border-b border-red-500/10 bg-[#2a0a0a]/90 backdrop-blur z-10 flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white flex items-center gap-2 font-oswald tracking-tighter transition-all duration-500">
                    {dynamicOnline} <span className="text-red-600 text-sm font-bold tracking-widest uppercase mt-2">Online</span>
                </h1>
                <p className="text-[10px] text-red-400/60 uppercase tracking-[0.2em]">Sảnh Chung</p>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 space-y-0">

                {/* SECTION 1: DANG ONLINE */}
                <div className="p-4 py-5 border-b border-red-900/20 hover:bg-white/5 transition-colors group">
                    <h3 className="flex items-center gap-2 text-[#EAB308] font-bold uppercase tracking-wider text-[11px] mb-3">
                        <span className="text-lg">🔥</span> ĐANG ONLINE
                    </h3>
                    <ul className="space-y-2 pl-1">
                        <li className="flex items-center gap-2 text-gray-400 text-[11px] group-hover:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            <strong className="text-white transition-all duration-500">{dynamicActive}</strong> người đang hoạt động
                        </li>
                        <li className="flex items-center gap-2 text-gray-400 text-[11px] group-hover:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500/50"></span>
                            <strong className="text-white transition-all duration-500">{dynamicHall}</strong> người ở Sảnh Chung
                        </li>
                    </ul>
                </div>

                {/* SECTION 2: PROMOTIONS (Replaced Activity) */}
                <div className="p-4 py-5 space-y-5">
                    <h3 className="flex items-center gap-2 text-[#EAB308] font-bold uppercase tracking-wider text-[11px]">
                        <span className="text-lg">🎁</span> ƯU ĐÃI HOT
                    </h3>

                    {/* Promo 1: VIP Upgrade */}
                    <Link href="/pricing" className="block rounded-xl overflow-hidden border border-red-500/20 shadow-lg group relative hover:border-red-500/50 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10"></div>
                        <img src="/images/promotion/poster-upgrade-vip.jpg" alt="Upgrade VIP" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute bottom-2 left-2 z-20">
                            <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">Limited</span>
                        </div>
                    </Link>

                    {/* Promo 2: Tet Event (Requested) */}
                    <Link href="/promotions" className="block rounded-xl overflow-hidden border border-[#EAB308]/20 shadow-lg group relative hover:border-[#EAB308]/50 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10"></div>
                        <img src="/images/promotion/poster-tet-event.png" alt="Tet Event" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute bottom-2 left-2 z-20 flex flex-col items-start gap-1">
                            <div className="bg-red-600/90 text-[#FFD700] text-[10px] font-black px-2 py-1 rounded border border-[#FFD700]/50 shadow-lg uppercase tracking-wider backdrop-blur-sm animate-pulse">
                                Lì Xì Tết
                            </div>
                            <span className="text-[9px] font-bold text-gray-300 drop-shadow-md">Nhận ngay Quà Khủng</span>
                        </div>
                    </Link>

                    {/* Promo 3: Affiliate */}
                    <Link href="/affiliate" className="block rounded-xl overflow-hidden border border-red-500/20 shadow-lg group relative hover:border-red-500/50 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10"></div>
                        <img src="/images/promotion/poster-affiliate-basic.jpg" alt="Affiliate" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute bottom-2 left-2 z-20">
                            <span className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">Partner</span>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    );
}

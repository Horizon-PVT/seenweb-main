// components/FloatingSidebar.tsx
// Floating sidebar for secondary content (Ebooks, Videos, Blog, Affiliate, Coaching)
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarItem {
    id: string;
    label: string;
    icon: string;
    href?: string;
    scrollTo?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
    { id: 'ebooks', label: 'Ebooks miễn phí', icon: '📚', scrollTo: '#tech-pillars' },
    { id: 'videos', label: 'Video hướng dẫn', icon: '🎬', scrollTo: '#video-tips' },
    { id: 'blog', label: 'Blog & Tin tức', icon: '📝', href: '/blog' },
    { id: 'affiliate', label: 'Affiliate Program', icon: '💰', href: '/affiliate' },
    { id: 'coaching', label: 'Coaching 1-1', icon: '🎓', href: '/coaching' },
];

export default function FloatingSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleItemClick = (item: SidebarItem) => {
        if (item.href) {
            router.push(item.href);
        } else if (item.scrollTo) {
            const element = document.querySelector(item.scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        setIsOpen(false);
    };

    return (
        <>
            {/* Toggle Button - Fixed Right Side */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          fixed right-0 top-1/2 -translate-y-1/2 z-50
          w-14 h-28 bg-gradient-to-b from-purple-600 to-pink-600 
          text-white rounded-l-2xl shadow-xl border-l border-t border-b border-white/20
          flex flex-col items-center justify-center gap-2
          hover:w-16 transition-all duration-300
          ${isOpen ? 'opacity-50' : 'opacity-100'}
        `}
                aria-label="Mở menu phụ"
            >
                <span className="text-2xl font-bold">{isOpen ? '✕' : '☰'}</span>
                <span className="text-[10px] font-bold writing-mode-vertical hidden sm:block tracking-widest" style={{ writingMode: 'vertical-rl' }}>
                    MENU
                </span>
            </button>

            {/* Sidebar Panel */}
            <div
                className={`
          fixed right-0 top-0 h-full w-64 bg-black/95 backdrop-blur-lg
          border-l border-purple-500/30 z-40
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white">Tài nguyên & Hỗ trợ</h3>
                    <p className="text-gray-400 text-xs">Khám phá thêm từ SeenYT</p>
                </div>

                {/* Items */}
                <div className="p-2">
                    {SIDEBAR_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/20 transition-colors text-left group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <div>
                                <p className="text-white font-medium text-sm">{item.label}</p>
                            </div>
                            <span className="ml-auto text-gray-500 group-hover:text-purple-400">→</span>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <Link
                        href="/#pricing"
                        className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Xem bảng giá →
                    </Link>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

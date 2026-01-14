import React from 'react';
import { useRouter } from 'next/router';

interface PaywallPopupProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'scriptwriter' | 'seo';
}

const PAYWALL_MESSAGES = {
    scriptwriter: {
        title: '🎬 Bạn đã có 1 ý tưởng video có khả năng lên view!',
        description: 'Mở khóa để nhận toàn bộ kịch bản + hướng dẫn đăng video.',
        cta: 'Mở khóa để làm tiếp →',
    },
    seo: {
        title: '🚀 Bạn đã có 1 bộ SEO tuyệt vời cho video!',
        description: 'Mở khóa để nhận toàn bộ SEO YouTube Pro.',
        cta: 'Mở khóa SEO Pro →',
    },
};

export default function PaywallPopup({ isOpen, onClose, type }: PaywallPopupProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const message = PAYWALL_MESSAGES[type];

    const handleUpgrade = () => {
        onClose();
        router.push('/#pricing');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl p-8 max-w-md mx-4 shadow-2xl shadow-purple-900/30 animate-in zoom-in-95 fade-in duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                {/* Lock icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-purple-500/30">
                    🔒
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white text-center mb-3">
                    {message.title}
                </h3>
                <p className="text-gray-400 text-center mb-8">
                    {message.description}
                </p>

                {/* CTA Button */}
                <button
                    onClick={handleUpgrade}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]"
                >
                    {message.cta}
                </button>

                {/* Sub text */}
                <p className="text-gray-500 text-sm text-center mt-4">
                    Bắt đầu chỉ từ 149.000đ/tháng
                </p>
            </div>
        </div>
    );
}

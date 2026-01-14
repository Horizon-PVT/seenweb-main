// components/dashboard/LockedFeatureModal.tsx
import React from 'react';
import { useRouter } from 'next/router';

interface LockedFeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function LockedFeatureModal({
    isOpen,
    onClose,
    title = 'Mở khóa để làm tiếp',
    message = 'Nâng cấp gói để sử dụng đầy đủ tính năng và làm YouTube hiệu quả hơn.',
}: LockedFeatureModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

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
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl shadow-purple-900/30">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl"
                >
                    ✕
                </button>

                {/* Lock icon */}
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30">
                    🔒
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white text-center mb-3">
                    {title}
                </h3>
                <p className="text-gray-400 text-center mb-6">
                    {message}
                </p>

                {/* CTA Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleUpgrade}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                    >
                        Xem các gói phù hợp →
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors"
                    >
                        Để sau
                    </button>
                </div>
            </div>
        </div>
    );
}

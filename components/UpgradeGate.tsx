// components/UpgradeGate.tsx - Chặn ở bước cuối (Sunk Cost Trap)
import React, { useState } from 'react';
import { Lock, Zap, Share2, Crown, X } from 'lucide-react';
import SharePromoPopup from './SharePromoPopup';

interface UpgradeGateProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
    featureName?: string; // What feature they're trying to access
    userTier?: string; // FREE, STARTER, PRO, VIP
    requiredTier?: string; // Minimum tier needed
}

const TIER_HIERARCHY: Record<string, number> = {
    'FREE': 0,
    'CREATIVE': 1, // STARTER
    'SUPER': 2,    // PRO
    'VIP': 3,
    'ADMIN': 999,
};

const TIER_PRICES: Record<string, string> = {
    'CREATIVE': '149.000đ',
    'SUPER': '399.000đ',
    'VIP': '549.000đ',
};

const TIER_FEATURES: Record<string, string[]> = {
    'CREATIVE': ['Không giới hạn công cụ cơ bản', 'Làm video đều đặn hàng ngày', 'Phù hợp người mới bắt đầu'],
    'SUPER': ['TOÀN BỘ công cụ', 'Phân tích nâng cao & chiến lược', 'Narrative Studio (Storytelling)'],
    'VIP': ['AI Dubbing - Lồng tiếng tự động', 'Tạo Video AI (Velocity)', 'Support 1-1 qua Zalo'],
};

// Check if user has used share option before
const SHARE_USED_KEY = 'seenyt_share_unlock_used';

export default function UpgradeGate({
    isOpen,
    onClose,
    onUpgrade,
    featureName = 'tính năng này',
    userTier = 'FREE',
    requiredTier = 'STARTER'
}: UpgradeGateProps) {
    const [showSharePopup, setShowSharePopup] = useState(false);
    const hasUsedShare = typeof window !== 'undefined' && localStorage.getItem(SHARE_USED_KEY) === 'true';

    if (!isOpen) return null;

    const handleUpgrade = () => {
        onClose();
        if (onUpgrade) {
            onUpgrade();
        } else {
            window.location.href = '/pricing';
        }
    };

    const handleShareOption = () => {
        if (hasUsedShare) {
            alert('Bạn đã sử dụng tùy chọn share 1 lần. Vui lòng nâng cấp để tiếp tục!');
            return;
        }
        onClose();
        setShowSharePopup(true);
    };

    const currentTierLevel = TIER_HIERARCHY[userTier] || 0;
    const requiredTierLevel = TIER_HIERARCHY[requiredTier] || 1;
    const nextTier = Object.entries(TIER_HIERARCHY).find(([_, level]) => level > currentTierLevel)?.[0] || 'CREATIVE';
    const price = TIER_PRICES[requiredTier] || TIER_PRICES[nextTier] || '149.000đ';
    const features = TIER_FEATURES[requiredTier] || TIER_FEATURES[nextTier] || TIER_FEATURES['CREATIVE'];

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-gray-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Mở khóa để tiếp tục</h3>
                                    <p className="text-sm text-gray-400">Bạn cần nâng cấp gói {requiredTier}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Sunk cost message */}
                        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 text-center">
                            <p className="text-yellow-400">
                                ⚠️ Bạn đã hoàn thành <strong>{featureName}</strong>!
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                Để tải xuống hoặc copy kết quả, vui lòng nâng cấp.
                            </p>
                        </div>

                        {/* Upgrade option */}
                        <div className="bg-gradient-to-r from-[#CDAD5A]/10 to-orange-500/10 border border-[#CDAD5A]/30 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Crown className="w-6 h-6 text-[#CDAD5A]" />
                                <div>
                                    <h4 className="font-bold text-white">Gói {requiredTier}</h4>
                                    <p className="text-[#CDAD5A] font-bold">{price}/tháng</p>
                                </div>
                            </div>
                            <ul className="space-y-2 mb-4">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <span className="text-green-400">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleUpgrade}
                                className="w-full bg-gradient-to-r from-[#CDAD5A] to-orange-500 text-black font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                NÂNG CẤP NGAY
                            </button>
                        </div>

                        {/* Divider */}
                        {!hasUsedShare && userTier === 'FREE' && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-gray-800 text-gray-400">hoặc</span>
                                    </div>
                                </div>

                                {/* Share option (1 time only) */}
                                <button
                                    onClick={handleShareOption}
                                    className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium py-3 rounded-xl hover:bg-blue-600/30 transition flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share FB để mở khóa 1 lần (chỉ 1 lần duy nhất)
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Share Popup */}
            <SharePromoPopup
                isOpen={showSharePopup}
                onClose={() => setShowSharePopup(false)}
            />
        </>
    );
}

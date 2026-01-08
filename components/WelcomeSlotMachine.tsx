// components/WelcomeSlotMachine.tsx - Vòng quay may mắn sau đăng ký/đăng nhập
import React, { useState, useEffect, useCallback } from 'react';
import { X, Gift, Sparkles, Clock, Copy, CheckCircle, Share2, Zap } from 'lucide-react';

interface WelcomeSlotMachineProps {
    isOpen: boolean;
    onClose: () => void;
    onShowSharePopup?: () => void;
    userEmail?: string;
}

// Cấu hình giải thưởng mới: Chỉ 3 Ngày và 20%
const PRIZES = [
    { id: 'bonus3', label: '+3 NGÀY', value: 3, type: 'BONUS_DAYS', color: '#10b981', probability: 0.70 }, // 70% trúng 3 ngày
    { id: 'discount20', label: '-20% STARTER', value: 20, type: 'PERCENT', color: '#CDAD5A', probability: 0.30 }, // 30% trúng giảm 20%
    // Các ô phụ để vòng quay nhìn đẹp hơn, nhưng logic sẽ lái về 2 ô trên
    { id: 'bonus3_b', label: '+3 NGÀY', value: 3, type: 'BONUS_DAYS', color: '#34d399', probability: 0 },
    { id: 'discount20_b', label: '-20% STARTER', value: 20, type: 'PERCENT', color: '#fbbf24', probability: 0 },
    { id: 'bonus3_c', label: '+3 NGÀY', value: 3, type: 'BONUS_DAYS', color: '#059669', probability: 0 },
    { id: 'discount20_c', label: '-20% STARTER', value: 20, type: 'PERCENT', color: '#d97706', probability: 0 },
];

// Generate a random prize based on probability
const getRandomPrize = () => {
    const random = Math.random();
    let cumulative = 0;
    // Chỉ random trong 2 item đầu có probability > 0
    const activePrizes = PRIZES.filter(p => p.probability > 0);

    for (const prize of activePrizes) {
        cumulative += prize.probability;
        if (random <= cumulative) return prize;
    }
    return activePrizes[0];
};

export default function WelcomeSlotMachine({ isOpen, onClose, onShowSharePopup, userEmail }: WelcomeSlotMachineProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [selectedPrize, setSelectedPrize] = useState<typeof PRIZES[0] | null>(null);
    const [rotation, setRotation] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

    // Countdown timer
    useEffect(() => {
        if (!hasSpun) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [hasSpun]);

    const handleSpin = useCallback(async () => {
        if (isSpinning || hasSpun) return;

        setIsSpinning(true);

        // 1. Determine Prize locally first
        const prize = getRandomPrize();
        // Find visual index of this prize (or its duplicate) to land on
        // Để đơn giản, ta lừa visual: luôn đáp vào 1 vị trí nào đó tương ứng với prize
        // Nhưng ở đây ta có nhiều ô giống nhau. Ta chọn ô đầu tiên khớp ID.
        let prizeIndex = PRIZES.findIndex(p => p.id === prize.id);

        // Thêm chút ngẫu nhiên nếu có nhiều ô cùng loại (nhưng ở đây ta fix cứng logic cho dễ)

        // Calculate rotation
        const segmentAngle = 360 / PRIZES.length;
        // Quay ít nhất 5 vòng (1800 độ) + góc tới ô thưởng
        // Lưu ý: React xoay theo chiều kim đồng hồ.
        const targetAngle = 1800 + (360 - (prizeIndex * segmentAngle));
        // Điều chỉnh tâm ô: - segmentAngle/2

        setRotation(targetAngle);

        // 2. Wait for animation (4s)
        await new Promise(r => setTimeout(r, 4000));

        setIsSpinning(false);
        setHasSpun(true);
        setSelectedPrize(prize);
        setIsGeneratingCode(true);

        // 3. Call API to get Real Code
        try {
            const response = await fetch('/api/promotions/generate-welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: prize.type, value: prize.value }),
            });
            const data = await response.json();
            if (data.code) {
                setPromoCode(data.code);
            } else {
                // Fallback nếu lỗi
                setPromoCode(`ERROR-${prize.value}`);
            }
        } catch (error) {
            console.error(error);
            setPromoCode(`SEEN-${prize.type === 'PERCENT' ? 'SAFE' : 'GIFT'}-${Date.now().toString().slice(-4)}`);
        } finally {
            setIsGeneratingCode(false);
        }

    }, [isSpinning, hasSpun]);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(promoCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (e) {
            alert(`Mã của bạn: ${promoCode}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-md w-full border border-[#CDAD5A]/30 shadow-2xl overflow-hidden relative">

                {/* Close Button always visible */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white z-20"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-[#CDAD5A] to-orange-600 px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Vòng Quay May Mắn</h3>
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <p className="text-white/80 text-xs mt-1">Dành riêng cho thành viên mới</p>
                </div>

                <div className="p-6 space-y-6">
                    {!hasSpun ? (
                        <>
                            {/* Wheel Container */}
                            <div className="relative w-64 h-64 mx-auto my-4 transition-transform hover:scale-105">
                                {/* Pointer */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                    <div className="w-8 h-10 bg-red-600 clip-path-triangle shadow-lg border-2 border-white/20"></div>
                                </div>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-white font-bold text-xs mt-1">▼</div>

                                {/* Wheel */}
                                <div
                                    className="w-full h-full rounded-full relative overflow-hidden border-[6px] border-[#CDAD5A] shadow-[0_0_20px_rgba(205,173,90,0.3)] bg-gray-800"
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.35, 1.05)' : 'none'
                                    }}
                                >
                                    {PRIZES.map((prize, index) => {
                                        const angle = (360 / PRIZES.length) * index;
                                        return (
                                            <div
                                                key={`${prize.id}-${index}`}
                                                className="absolute w-1/2 h-[50%] origin-bottom-right flex justify-center pt-4"
                                                style={{
                                                    transform: `rotate(${angle}deg) skewY(${90 - 360 / PRIZES.length}deg)`, // Math trick for segments
                                                    background: index % 2 === 0 ? prize.color : `${prize.color}dd`, // Alternate shades
                                                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                <span
                                                    className="absolute text-white font-bold text-[10px] md:text-xs whitespace-nowrap drop-shadow-md"
                                                    style={{
                                                        // Counter-rotate text to be readable
                                                        transform: `skewY(-${90 - 360 / PRIZES.length}deg) rotate(${360 / PRIZES.length / 2 + 90}deg)`,
                                                        left: '35%',
                                                        top: '35%',
                                                    }}
                                                >
                                                    {prize.label}
                                                </span>
                                            </div>
                                        );
                                    })}

                                    {/* Center Hub */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full border-4 border-[#CDAD5A] flex items-center justify-center z-10 shadow-lg">
                                        <div className="text-2xl">🎁</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSpin}
                                disabled={isSpinning}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg transform active:scale-95 ${isSpinning
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#CDAD5A] to-orange-500 text-black hover:brightness-110 animate-pulse-slow'
                                    }`}
                            >
                                {isSpinning ? 'Đang quay...' : 'QUAY NGAY & NHẬN QUÀ'}
                            </button>
                        </>
                    ) : (
                        <div className="text-center animate-fade-in-up">
                            {/* Congratulation Header */}
                            <div className="mb-6">
                                <div className="text-5xl mb-2 animate-bounce">🎉</div>
                                <h4 className="text-2xl font-bold text-white mb-2">Chúc mừng bạn!</h4>
                                <div className="text-gray-300 text-sm">Bạn đã quay trúng phần thưởng:</div>
                                <div
                                    className="inline-block mt-3 px-6 py-2 rounded-full text-xl font-bold border-2 border-white/20 shadow-lg transform hover:scale-105 transition"
                                    style={{ backgroundColor: selectedPrize?.color, color: 'white' }}
                                >
                                    {selectedPrize?.label}
                                </div>
                            </div>

                            {/* Promo Code Display */}
                            {isGeneratingCode ? (
                                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-[#CDAD5A] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-400 text-sm">Đang tạo mã độc quyền...</span>
                                </div>
                            ) : (
                                <div className="bg-gray-800/80 p-4 rounded-xl border border-[#CDAD5A]/50 mb-6 relative group">
                                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Mã code của bạn (hết hạn trong 24h):</p>
                                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-dashed border-gray-600">
                                        <code className="flex-1 text-xl font-mono font-bold text-[#CDAD5A] tracking-widest">
                                            {promoCode}
                                        </code>
                                        <button
                                            onClick={handleCopyCode}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition text-white"
                                            title="Sao chép"
                                        >
                                            {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                        Chỉ dùng 1 lần
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons Strategy */}
                            <div className="space-y-3">
                                {/* Primary Action: Claim/Use */}
                                {selectedPrize?.type === 'PERCENT' ? (
                                    <button
                                        onClick={() => window.location.href = '/pricing'}
                                        className="w-full bg-gradient-to-r from-[#CDAD5A] to-orange-500 text-black font-bold py-3.5 rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2"
                                    >
                                        <Zap size={20} fill="currentColor" />
                                        SỬ DỤNG MÃ NGAY (Giảm 20%)
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(promoCode);
                                            window.location.href = '/claim-gift'; // Or handle claim logic directly
                                            alert('Vui lòng gửi mã này cho Admin qua Zalo để kích hoạt ngay!');
                                        }}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3.5 rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2"
                                    >
                                        <Gift size={20} />
                                        KÍCH HOẠT +3 NGÀY NGAY
                                    </button>
                                )}

                                {/* Secondary Action (Cross-sell): Share FB */}
                                {onShowSharePopup && (
                                    <div className="relative pt-4">
                                        <div className="absolute inset-x-0 top-4 flex items-center">
                                            <div className="w-full border-t border-gray-700"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-gray-900 px-3 text-xs text-gray-500">Hoặc nhận ưu đãi lớn hơn</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                onShowSharePopup();
                                            }}
                                            className="w-full mt-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                                        >
                                            <Share2 size={18} />
                                            Share FB nhận tới 15 ngày FREE!
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Countdown */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs font-mono">
                                <Clock size={12} />
                                Ưu đãi kết thúc sau: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

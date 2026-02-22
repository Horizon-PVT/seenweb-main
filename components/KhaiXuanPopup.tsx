// components/KhaiXuanPopup.tsx - Chương trình Khai Xuân 2026 🧧
import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, CheckCircle, Zap, Gift, Clock } from 'lucide-react';

interface KhaiXuanPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onShowSharePopup?: () => void;
    userEmail?: string;
    userRole?: string; // FREE, BASIC, PRO
}

// === PRIZE POOLS BY TIER ===

interface Prize {
    id: string;
    label: string;
    description: string;
    value: number;
    type: 'PERCENT' | 'BONUS_DAYS' | 'CREDITS';
    target?: string; // which plan the discount applies to
    probability: number;
    emoji: string;
}

const FREE_PRIZES: Prize[] = [
    { id: 'free_20off_basic', label: 'Giảm 20%', description: 'Giảm 20% gói Cơ Bản', value: 20, type: 'PERCENT', target: 'STARTER', probability: 0.50, emoji: '🎫' },
    { id: 'free_15off_pro', label: 'Giảm 15%', description: 'Giảm 15% gói Chuyên Nghiệp', value: 15, type: 'PERCENT', target: 'PRO', probability: 0.30, emoji: '💎' },
    { id: 'free_3days', label: '+3 Ngày', description: '+3 ngày dùng thử gói Cơ Bản', value: 3, type: 'BONUS_DAYS', probability: 0.20, emoji: '🎁' },
];

const BASIC_PRIZES: Prize[] = [
    { id: 'basic_20off_pro', label: 'Giảm 20%', description: 'Giảm 20% nâng cấp Chuyên Nghiệp', value: 20, type: 'PERCENT', target: 'PRO', probability: 0.40, emoji: '💎' },
    { id: 'basic_7days', label: '+7 Ngày', description: '+7 ngày gia hạn miễn phí', value: 7, type: 'BONUS_DAYS', probability: 0.30, emoji: '🎁' },
    { id: 'basic_30off_yearly', label: 'Giảm 30%', description: 'Giảm 30% gia hạn năm gói Cơ Bản', value: 30, type: 'PERCENT', target: 'STARTER_YEARLY', probability: 0.30, emoji: '🧧' },
];

const PRO_PRIZES: Prize[] = [
    { id: 'pro_7days', label: '+7 Ngày', description: '+7 ngày gia hạn miễn phí', value: 7, type: 'BONUS_DAYS', probability: 0.40, emoji: '🎁' },
    { id: 'pro_30off_yearly', label: 'Giảm 30%', description: 'Giảm 30% gia hạn năm Chuyên Nghiệp', value: 30, type: 'PERCENT', target: 'PRO_YEARLY', probability: 0.35, emoji: '🧧' },
    { id: 'pro_50credits', label: '+50 Credits', description: 'Tặng 50 Dubbing Credits', value: 50, type: 'CREDITS', probability: 0.25, emoji: '🎙️' },
];

function getPrizePool(role: string): Prize[] {
    if (role === 'PRO' || role === 'PROFESSIONAL') return PRO_PRIZES;
    if (role === 'BASIC' || role === 'STARTER') return BASIC_PRIZES;
    return FREE_PRIZES; // FREE, ADMIN (for testing), or any other
}

function getRandomPrize(pool: Prize[]): Prize {
    const random = Math.random();
    let cumulative = 0;
    for (const prize of pool) {
        cumulative += prize.probability;
        if (random <= cumulative) return prize;
    }
    return pool[0];
}

// Tier display info
function getTierGreeting(role: string) {
    if (role === 'PRO' || role === 'PROFESSIONAL') {
        return { title: 'Tri Ân Khách Hàng VIP', subtitle: 'Cảm ơn bạn đã đồng hành cùng SeenYT! 🙏' };
    }
    if (role === 'BASIC' || role === 'STARTER') {
        return { title: 'Ưu Đãi Nâng Cấp', subtitle: 'Mở khóa toàn bộ sức mạnh SeenYT! 🚀' };
    }
    return { title: 'Phúc Lộc Khai Xuân', subtitle: 'Bóc lì xì nhận ưu đãi đặc biệt! 🧧' };
}

export default function KhaiXuanPopup({ isOpen, onClose, onShowSharePopup, userEmail, userRole = 'FREE' }: KhaiXuanPopupProps) {
    const [phase, setPhase] = useState<'intro' | 'opening' | 'result'>('intro');
    const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
    const [envelopeShake, setEnvelopeShake] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (phase !== 'result') return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase]);

    // Envelope hover animation
    useEffect(() => {
        if (phase !== 'intro') return;
        const interval = setInterval(() => {
            setEnvelopeShake(true);
            setTimeout(() => setEnvelopeShake(false), 500);
        }, 3000);
        return () => clearInterval(interval);
    }, [phase]);

    const handleOpenEnvelope = useCallback(async () => {
        if (phase !== 'intro') return;

        // Phase 1: Opening animation
        setPhase('opening');

        // Determine prize
        const pool = getPrizePool(userRole);
        const prize = getRandomPrize(pool);

        // Wait for opening animation
        await new Promise(r => setTimeout(r, 2000));

        setSelectedPrize(prize);
        setPhase('result');
        setIsGeneratingCode(true);

        // Call API to get code
        try {
            const response = await fetch('/api/promotions/generate-welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: prize.type,
                    value: prize.value,
                    userRole: userRole,
                    target: prize.target || '',
                    prizeId: prize.id,
                }),
            });
            const data = await response.json();
            if (data.code) {
                setPromoCode(data.code);
            } else {
                setPromoCode(`XUAN26-ERROR`);
            }
        } catch (error) {
            console.error(error);
            setPromoCode(`XUAN26-${Date.now().toString().slice(-6)}`);
        } finally {
            setIsGeneratingCode(false);
        }
    }, [phase, userRole]);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(promoCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (e) {
            alert(`Mã của bạn: ${promoCode}`);
        }
    };

    const getCTAAction = () => {
        if (!selectedPrize) return { text: '', href: '' };
        if (selectedPrize.type === 'PERCENT') {
            return { text: `ÁP DỤNG MÃ NGAY`, href: '/#pricing' };
        }
        if (selectedPrize.type === 'BONUS_DAYS') {
            return { text: `KÍCH HOẠT ${selectedPrize.label} NGAY`, href: '/claim-gift' };
        }
        return { text: `NHẬN ${selectedPrize.label} NGAY`, href: '/studio' };
    };

    if (!isOpen) return null;

    const tierInfo = getTierGreeting(userRole);
    const cta = getCTAAction();

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    background: 'linear-gradient(180deg, #8B0000 0%, #DC143C 30%, #B22222 60%, #8B0000 100%)',
                    border: '2px solid rgba(255, 215, 0, 0.5)',
                }}>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-4 left-4 text-2xl opacity-30 animate-pulse">🏮</div>
                    <div className="absolute top-4 right-12 text-2xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}>🏮</div>
                    <div className="absolute bottom-4 left-6 text-xl opacity-20">🌸</div>
                    <div className="absolute bottom-4 right-6 text-xl opacity-20">🌸</div>
                    <div className="absolute top-1/4 left-2 text-lg opacity-15">🎋</div>
                    <div className="absolute top-1/4 right-2 text-lg opacity-15">🎋</div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 text-white/60 hover:text-white z-20 bg-black/20 rounded-full p-1"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center pt-6 pb-4 relative z-10 px-6">
                    <div className="text-3xl mb-1">🧧</div>
                    <h3 className="text-xl font-bold text-yellow-300 tracking-wider uppercase">
                        {tierInfo.title}
                    </h3>
                    <p className="text-white/70 text-xs mt-1">{tierInfo.subtitle}</p>
                    <div className="mt-2 inline-block bg-yellow-500/20 border border-yellow-400/30 rounded-full px-3 py-0.5">
                        <span className="text-yellow-300 text-[10px] font-bold tracking-wide">KHAI XUÂN 2026 • HẾT HẠN 15/03</span>
                    </div>
                </div>

                <div className="px-6 pb-6 relative z-10">
                    {/* PHASE: INTRO - Show envelope */}
                    {phase === 'intro' && (
                        <div className="text-center py-4">
                            {/* Envelope */}
                            <div
                                onClick={handleOpenEnvelope}
                                className={`cursor-pointer mx-auto w-48 h-56 relative transition-transform hover:scale-110 active:scale-95 ${envelopeShake ? 'animate-wiggle' : ''}`}
                                style={{ filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))' }}
                            >
                                {/* Envelope body */}
                                <div className="absolute inset-0 bg-gradient-to-b from-red-600 to-red-800 rounded-xl border-2 border-yellow-500/60 flex flex-col items-center justify-center">
                                    {/* Gold seal */}
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-yellow-300/50 mb-3">
                                        <span className="text-3xl">福</span>
                                    </div>
                                    <div className="text-yellow-300 text-sm font-bold">KHAI XUÂN 2026</div>
                                    <div className="text-yellow-200/60 text-[10px] mt-1">Nhấn để bóc lì xì</div>
                                </div>

                                {/* Sparkle effects */}
                                <div className="absolute -top-2 -right-2 text-yellow-300 text-xl animate-ping">✨</div>
                                <div className="absolute -bottom-1 -left-1 text-yellow-300 text-sm animate-ping" style={{ animationDelay: '0.7s' }}>✨</div>
                            </div>

                            <button
                                onClick={handleOpenEnvelope}
                                className="mt-6 w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 hover:brightness-110 transition-all shadow-lg"
                                style={{ boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)' }}
                            >
                                🧧 BÓC LÌ XÌ NGAY!
                            </button>
                        </div>
                    )}

                    {/* PHASE: OPENING - Animation */}
                    {phase === 'opening' && (
                        <div className="text-center py-12">
                            <div className="relative mx-auto w-32 h-32">
                                {/* Opening animation */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 animate-ping opacity-30" />
                                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 animate-pulse flex items-center justify-center">
                                    <span className="text-5xl" style={{ animation: 'spin 1s linear infinite' }}>🧧</span>
                                </div>
                            </div>
                            <p className="text-yellow-200 mt-6 text-sm animate-pulse font-medium">
                                Đang mở lì xì cho bạn...
                            </p>
                            {/* Confetti-like dots */}
                            <div className="flex justify-center gap-2 mt-4">
                                {['🎊', '✨', '🎉', '✨', '🎊'].map((e, i) => (
                                    <span key={i} className="text-lg animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PHASE: RESULT - Show prize */}
                    {phase === 'result' && selectedPrize && (
                        <div className="text-center" style={{ animation: 'slideUp 0.5s ease' }}>
                            {/* Congrats */}
                            <div className="mb-5">
                                <div className="flex justify-center gap-1 mb-2">
                                    {['🎊', '🎉', '🧧', '🎉', '🎊'].map((e, i) => (
                                        <span key={i} className="text-2xl" style={{ animation: `bounceIn 0.5s ease ${i * 0.1}s both` }}>{e}</span>
                                    ))}
                                </div>
                                <h4 className="text-2xl font-bold text-yellow-300 mb-1">Chúc mừng bạn!</h4>
                                <p className="text-white/70 text-sm">Bạn nhận được phần thưởng Khai Xuân:</p>
                                <div className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-yellow-400/50 bg-yellow-500/20 shadow-lg">
                                    <span className="text-2xl">{selectedPrize.emoji}</span>
                                    <div className="text-left">
                                        <div className="text-yellow-300 font-bold text-lg leading-tight">{selectedPrize.label}</div>
                                        <div className="text-yellow-200/60 text-[11px]">{selectedPrize.description}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code */}
                            {isGeneratingCode ? (
                                <div className="bg-black/30 p-4 rounded-xl border border-yellow-500/30 mb-4 flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-yellow-200/60 text-sm">Đang tạo mã lì xì...</span>
                                </div>
                            ) : (
                                <div className="bg-black/30 p-4 rounded-xl border border-yellow-500/40 mb-4 relative">
                                    <p className="text-[10px] text-yellow-300/60 uppercase tracking-wide mb-1.5">Mã lì xì của bạn (hết hạn 24h):</p>
                                    <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-lg border border-dashed border-yellow-600/40">
                                        <code className="flex-1 text-xl font-mono font-bold text-yellow-300 tracking-widest">
                                            {promoCode}
                                        </code>
                                        <button
                                            onClick={handleCopyCode}
                                            className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-md transition text-yellow-300"
                                            title="Sao chép"
                                        >
                                            {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-md">
                                        Chỉ dùng 1 lần
                                    </div>
                                </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="space-y-2.5">
                                {selectedPrize.type === 'BONUS_DAYS' ? (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(promoCode);
                                            window.location.href = '/claim-gift';
                                            alert('Vui lòng gửi mã này cho Admin qua Zalo để kích hoạt ngay!');
                                        }}
                                        className="w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 hover:brightness-110 shadow-lg"
                                        style={{ boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)' }}
                                    >
                                        <Gift size={18} />
                                        {cta.text}
                                    </button>
                                ) : selectedPrize.type === 'CREDITS' ? (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(promoCode);
                                            alert('Vui lòng gửi mã này cho Admin qua Zalo để nhận Credits!');
                                        }}
                                        className="w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 hover:brightness-110 shadow-lg"
                                        style={{ boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)' }}
                                    >
                                        <Gift size={18} />
                                        {cta.text}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(promoCode);
                                            window.location.href = '/#pricing';
                                        }}
                                        className="w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 hover:brightness-110 shadow-lg"
                                        style={{ boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)' }}
                                    >
                                        <Zap size={18} fill="currentColor" />
                                        {cta.text}
                                    </button>
                                )}

                                {/* Share FB option */}
                                {onShowSharePopup && (
                                    <div className="relative pt-3">
                                        <div className="absolute inset-x-0 top-3 flex items-center">
                                            <div className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-red-800 px-3 text-[10px] text-white/40">Hoặc nhận thêm ưu đãi</span>
                                        </div>
                                        <button
                                            onClick={() => { onClose(); onShowSharePopup(); }}
                                            className="w-full mt-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                                        >
                                            Share FB nhận tới 15 ngày FREE!
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Countdown */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-300/50 text-xs font-mono">
                                <Clock size={12} />
                                Ưu đãi kết thúc sau: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounceIn {
                    0% { opacity: 0; transform: scale(0.3); }
                    50% { transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes spin {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(360deg); }
                }
                .animate-wiggle {
                    animation: wiggle 0.5s ease-in-out;
                }
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-5deg); }
                    75% { transform: rotate(5deg); }
                }
            `}</style>
        </div>
    );
}

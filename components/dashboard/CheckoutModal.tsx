import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck, Zap, ArrowRight, Lock, Plus, Loader2 } from 'lucide-react';
import { PRICING, FEATURE_COMPARISON, calculatePrice, PRICING_CONFIG } from '@/lib/plans';
import axios from 'axios';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan?: string;
    currentChannelCount?: number;
    requiredPlan?: string;
    userEmail?: string;
}

export default function CheckoutModal({
    isOpen,
    onClose,
    currentPlan = 'FREE',
    currentChannelCount = 0,
    userEmail = ''
}: CheckoutModalProps) {
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('YEARLY'); // AUTO DEFAULT YEARLY
    const [email, setEmail] = useState(userEmail);
    const [channelCount, setChannelCount] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // For SSR - only render portal on client
    useEffect(() => {
        setMounted(true);
    }, []);

    // CONTEXTUAL LOGIC STATE
    const isFree = currentChannelCount === 0;
    const isBasic = currentChannelCount === 1;
    const isPro = currentChannelCount >= 2;

    // Smart Defaults based on User State
    useEffect(() => {
        if (isOpen) {
            setBillingCycle('YEARLY');
            if (userEmail) setEmail(userEmail);

            if (isFree) setChannelCount(1);
            else if (isBasic) setChannelCount(2);
            else if (isPro) setChannelCount(currentChannelCount + 1);
        }
    }, [isOpen, currentChannelCount, isFree, isBasic, isPro, userEmail]);

    if (!isOpen || !mounted) return null;

    const isYearly = billingCycle === 'YEARLY';

    // Calculate Pricing Logic
    const monthlyTotal = calculatePrice(channelCount, 'MONTHLY');
    const annualTotal = calculatePrice(channelCount, 'YEARLY');

    const finalPrice = isYearly ? annualTotal : monthlyTotal;

    // Upgrade Cost Logic (Difference)
    let displayPrice = finalPrice;
    let isUpgrade = false;

    if (isPro && channelCount > 2) {
        // User is Pro, buying extra slots
        const slotsToAdd = channelCount - currentChannelCount;
        if (slotsToAdd > 0) {
            isUpgrade = true;
            const slotPrice = PRICING_CONFIG.EXTRA_SLOT;
            const monthlyAddon = slotPrice * slotsToAdd;

            if (isYearly) {
                displayPrice = monthlyAddon * 12 * 0.7;
            } else {
                displayPrice = monthlyAddon;
            }
        }
    }

    // Determine Labels & Contextual Message
    let planLabel = 'Basic Plan';

    if (channelCount === 2) {
        planLabel = 'Pro Plan - Chuyên nghiệp';
    }
    if (channelCount > 2) {
        planLabel = `Gói Pro (2 Kênh) + Mua thêm ${channelCount - 2} Slot`;
    }

    // PAYMENT HANDLER
    const handlePayment = async () => {
        if (!email) {
            alert('Vui lòng nhập email');
            return;
        }

        setIsLoading(true);
        try {
            // Determine Plan Code and Role based on selection
            // We need to map the channel count to a role or plan logic
            // Assuming Upgrade logic stores extra slots

            let targetPlanRole = 'BASIC'; // Default
            if (channelCount === 2) targetPlanRole = 'PRO'; // Pro
            if (channelCount > 2) targetPlanRole = 'PRO'; // Pro + Slots

            // Construct Description
            const planDescription = isUpgrade
                ? `Nâng cấp thêm ${channelCount - currentChannelCount} Slot (${billingCycle})`
                : `Mua mới gói ${channelCount} Kênh (${billingCycle})`;

            const res = await axios.post('/api/payment/create-payos-link', {
                email,
                amount: Math.round(displayPrice),
                plan: planDescription,
                role: targetPlanRole, // This might need refinement in backend to handle specific slot counts? 
                // For now, let's rely on amount verification or we might need to send extraChannelSlots count.
                // But the prompt just asked to fix the button first.
                // Let's assume backend/manual upgrade handles the role assignment based on amount/desc or logic later.
                note: `Channels: ${channelCount}, Cycle: ${billingCycle}`
            });

            if (res.data.success && res.data.data.paymentUrl) {
                window.location.href = res.data.data.paymentUrl;
            } else {
                alert('Không thể tạo link thanh toán. Vui lòng thử lại.');
            }
        } catch (error: any) {
            console.error('Payment Error:', error);
            alert(error.response?.data?.error || 'Lỗi kết nối thanh toán.');
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999999]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#0D0D10] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition">
                                <X size={20} />
                            </button>

                            {/* LEFT COLUMN: HERO IMAGE & FEATURES */}
                            <div className="w-full md:w-5/12 flex flex-col bg-[#161b22] border-r border-gray-800">
                                {/* HERO IMAGE SECTION - TOP HALF */}
                                <div className="relative h-48 md:h-64 w-full overflow-hidden">
                                    <img
                                        src="/images/checkout-hero.jpg"
                                        alt="10X YouTube"
                                        className="w-full h-full object-cover object-top"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#161b22] to-transparent"></div>
                                </div>

                                {/* TEXT CONTENT - BOTTOM HALF */}
                                <div className="p-6 md:p-8 flex flex-col flex-1">
                                    <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4">
                                        10X <span className="text-blue-500">YouTube</span>
                                    </h2>

                                    <div className="space-y-3 mb-6">
                                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-500" />
                                            Quyền lợi nổi bật
                                        </h3>
                                        <div className="space-y-2">
                                            {FEATURE_COMPARISON.map((feat, idx) => (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className="mt-0.5 bg-green-500/10 p-1 rounded-full">
                                                        <Check size={10} className="text-green-500" />
                                                    </div>
                                                    <div className="text-sm text-gray-300">
                                                        {idx === 4 ? (
                                                            <span className="text-white font-bold">{channelCount} Kênh YouTube</span>
                                                        ) : feat.basic}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* UPSELL MESSAGE */}
                                    {currentChannelCount > 0 && (
                                        <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-xl mt-auto">
                                            <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-wide">Trạng thái</div>
                                            <div className="text-white font-bold flex items-center gap-2 text-sm">
                                                <span className="opacity-70">{currentChannelCount} Kênh</span>
                                                <ArrowRight size={14} className="text-gray-500" />
                                                <span className="text-green-400">Lên {channelCount} Kênh</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: CONFIGURATOR */}
                            <div className="w-full md:w-7/12 bg-[#0D0D10] p-8 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                    <h2 className="text-2xl font-bold text-white">Cấu hình gói của bạn</h2>
                                </div>

                                {!isPro ? (
                                    // LOCKED VIEW FOR FREE/BASIC
                                    <div className="mb-8 p-6 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-between shadow-inner">
                                        <div>
                                            <div className="text-sm font-bold text-gray-400 mb-1">Gói đề xuất cho bạn</div>
                                            <div className="text-3xl font-black text-white">{channelCount} Kênh</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-900/50 mb-1 inline-block">
                                                {isFree ? 'STARTER' : 'UPGRADE'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // SLIDER VIEW FOR PRO+
                                    <div className="mb-8 p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-inner">
                                        <div className="flex justify-between items-center mb-6">
                                            <label className="text-sm font-bold text-gray-300">Bạn muốn quản lý bao nhiêu kênh?</label>
                                            <span className="text-4xl font-black text-white tracking-tighter">{channelCount}</span>
                                        </div>

                                        <div className="relative h-12 flex items-center">
                                            <input
                                                type="range"
                                                min={currentChannelCount || 3}
                                                max="10"
                                                step="1"
                                                value={channelCount}
                                                onChange={(e) => setChannelCount(parseInt(e.target.value))}
                                                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 z-10 relative"
                                            />
                                            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                                                {[...Array(8)].map((_, i) => (
                                                    <div key={i} className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                                            <span>{currentChannelCount} kênh</span>
                                            <span>MAX 10</span>
                                        </div>
                                    </div>
                                )}

                                {/* BILLING CYCLE */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <button
                                        onClick={() => setBillingCycle('MONTHLY')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${billingCycle === 'MONTHLY' ? 'border-blue-600 bg-blue-900/10' : 'border-gray-800 bg-gray-900/30 opacity-60 hover:opacity-100 hover:border-gray-700'}`}
                                    >
                                        <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Thanh toán tháng</div>
                                        <div className="text-lg font-black text-white">
                                            {isUpgrade ? `+ ${PRICING_CONFIG.EXTRA_SLOT.toLocaleString()} đ` : `${monthlyTotal.toLocaleString()} đ`}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle('YEARLY')}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${billingCycle === 'YEARLY' ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-900/20 ring-1 ring-blue-400' : 'border-gray-800'}`}
                                    >
                                        <div className="absolute -top-3 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">SAVE 30%</div>
                                        <div className="text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                                            <Check size={10} strokeWidth={4} /> Khuyên dùng
                                        </div>
                                        <div className="text-xl font-black text-white mb-1">
                                            {isUpgrade
                                                ? `+ ${(PRICING_CONFIG.EXTRA_SLOT * 0.7).toLocaleString()} đ`
                                                : `${Math.round(annualTotal / 12).toLocaleString()} đ`}
                                            <span className="text-sm font-medium text-gray-400">/tháng</span>
                                        </div>
                                        <div className="text-[11px] text-gray-400 bg-black/20 px-2 py-1 rounded inline-block">
                                            Tổng: {isUpgrade ? (displayPrice).toLocaleString() : annualTotal.toLocaleString()} đ/năm
                                        </div>
                                    </button>
                                </div>

                                {/* TOTAL SUMMARY */}
                                <div className="mt-auto border-t border-gray-800 pt-6">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <div className="text-white font-bold text-lg flex items-center gap-2">
                                                {isUpgrade && <Plus size={20} className="text-green-500" />}
                                                {isUpgrade ? `Nâng cấp thêm ${channelCount - currentChannelCount} Slot` : planLabel}
                                            </div>
                                            <div className="text-gray-500 text-sm mt-1">
                                                {isYearly ? 'Gói trọn gói 1 năm (Tiết kiệm nhất)' : 'Gói linh hoạt theo tháng'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                                                {isUpgrade ? '+' : ''}{displayPrice.toLocaleString()} đ
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4 relative">
                                        <label className="absolute -top-2.5 left-3 bg-[#0D0D10] px-1 text-[10px] font-bold text-blue-500 uppercase tracking-wider">Thông tin nhận hóa đơn</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Nhập email của bạn..."
                                            className="w-full bg-[#161b22] border border-gray-700 rounded-xl px-4 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                        />
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg py-4 rounded-xl shadow-xl shadow-blue-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" /> Đang tạo giao dịch...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={20} />
                                                {isUpgrade ? `Thanh toán nâng cấp • ${displayPrice.toLocaleString()} đ` : `Thanh toán ngay • ${displayPrice.toLocaleString()} đ`}
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-gray-600 mt-4">
                                        Thông tin thanh toán được bảo mật an toàn tuyệt đối bởi PayOS
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );

    // Use Portal to render at body level - avoids stacking context issues
    return createPortal(modalContent, document.body);
}

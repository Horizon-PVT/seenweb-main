import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Loader2, ArrowRight, Users, MessageSquare, Layers, Sparkles, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredPlan?: string;
    userEmail?: string;
    forceYearly?: boolean;
    forceSixMonths?: boolean;
}

// ============== PLAN CONFIGURATION ==============
const PLAN_CONFIG: Record<string, {
    label: string;
    targetRole: string;
    monthly: number;
    sixMonths: number;
    yearly: number;
    features: string[];
    color: string;
    bgColor: string;
    licenseIncludes: string[];
}> = {
    STARTER: {
        label: 'Starter',
        targetRole: 'STARTER',
        monthly: 199000,
        sixMonths: 149000,
        yearly: 99000,
        color: 'blue',
        bgColor: 'from-blue-600 to-blue-800',
        features: ['Niche Radar - Tìm ngách tiềm năng', 'Script Studio - Viết kịch bản viral', 'Video Pipeline - Tạo video cơ bản', 'SEO Tool - Tối ưu YouTube SEO', 'AI Coach 5 messages/ngày', '1 Kênh YouTube'],
        licenseIncludes: [],
    },
    CREATOR: {
        label: 'Creator',
        targetRole: 'CREATOR',
        monthly: 399000,
        sixMonths: 299000,
        yearly: 249000,
        color: 'purple',
        bgColor: 'from-purple-600 to-purple-800',
        features: ['Tất cả tính năng Starter', 'Koda Studio Desktop App (Veo3)', 'Intelligence Hub - Phân tích xu hướng', 'Multilingual Studio - Đa ngôn ngữ', 'Rival Scanner - Phân tích đối thủ', 'AI Coach 20 messages/ngày', '2 Kênh YouTube'],
        licenseIncludes: ['Koda Studio'],
    },
    FACTORY: {
        label: 'Factory',
        targetRole: 'FACTORY',
        monthly: 699000,
        sixMonths: 549000,
        yearly: 399000,
        color: 'amber',
        bgColor: 'from-amber-600 to-amber-800',
        features: ['Tất cả tính năng Creator', 'Koda Novel Desktop - Chuyển truyện thành phim', 'Koda Factory Desktop - Multi-workers', 'Bulk Processing - Xử lý hàng loạt', 'AI Coach 50 messages/ngày', '2 Kênh YouTube'],
        licenseIncludes: ['Koda Studio', 'Koda Novel', 'Koda Factory'],
    },
    AGENCY: {
        label: 'Agency',
        targetRole: 'AGENCY',
        monthly: 1990000,
        sixMonths: 1590000,
        yearly: 1290000,
        color: 'cyan',
        bgColor: 'from-cyan-600 to-cyan-800',
        features: ['Tất cả tính năng Factory', '5 Team Seats - 5 người dùng', '5 Kênh YouTube', 'Team Dashboard', 'Bulk License Management', 'AI Coach 100 messages/ngày', 'Priority Support 24/7'],
        licenseIncludes: ['Koda Studio', 'Koda Novel', 'Koda Factory'],
    },
    ENTERPRISE: {
        label: 'Enterprise',
        targetRole: 'ENTERPRISE',
        monthly: 4990000,
        sixMonths: 3990000,
        yearly: 2990000,
        color: 'rose',
        bgColor: 'from-rose-600 to-rose-800',
        features: ['Tất cả tính năng Agency', '15 Team Seats - 15 người dùng', '10 Kênh YouTube', 'White-label Domain', 'API Access', 'Custom Workflow Development', 'Dedicated Account Manager', 'AI Coach 500 messages/ngày'],
        licenseIncludes: ['Koda Studio', 'Koda Novel', 'Koda Factory'],
    },
};

export default function CheckoutModal({
    isOpen,
    onClose,
    requiredPlan = '',
    userEmail = '',
    forceYearly = false,
    forceSixMonths = false
}: CheckoutModalProps) {
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'SIX_MONTHS' | 'YEARLY'>(
        forceYearly ? 'YEARLY' : forceSixMonths ? 'SIX_MONTHS' : 'MONTHLY'
    );
    const [email, setEmail] = useState(userEmail);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setBillingCycle(forceYearly ? 'YEARLY' : forceSixMonths ? 'SIX_MONTHS' : 'MONTHLY');
            if (userEmail) setEmail(userEmail);
        }
    }, [isOpen, forceYearly, forceSixMonths, userEmail]);

    if (!isOpen || !mounted) return null;

    // Get plan config
    const plan = PLAN_CONFIG[requiredPlan] || PLAN_CONFIG.STARTER;
    
    const getPrice = () => {
        switch (billingCycle) {
            case 'SIX_MONTHS': return plan.sixMonths * 6;
            case 'YEARLY': return plan.yearly * 12;
            default: return plan.monthly;
        }
    };

    const getMonthlyPrice = () => {
        switch (billingCycle) {
            case 'SIX_MONTHS': return plan.sixMonths;
            case 'YEARLY': return plan.yearly;
            default: return plan.monthly;
        }
    };

    const getSavingPercent = () => {
        switch (billingCycle) {
            case 'SIX_MONTHS': return Math.round((1 - plan.sixMonths / plan.monthly) * 100);
            case 'YEARLY': return Math.round((1 - plan.yearly / plan.monthly) * 100);
            default: return 0;
        }
    };

    const getSavingAmount = () => {
        const monthlyTotal = plan.monthly * 12;
        const yearlyTotal = plan.yearly * 12;
        return monthlyTotal - yearlyTotal;
    };

    const formatPrice = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // PAYMENT HANDLER
    const handlePayment = async () => {
        if (!email) {
            toast.error('Vui lòng nhập Email!');
            return;
        }

        if (!email.includes('@')) {
            toast.error('Email không hợp lệ!');
            return;
        }

        setIsLoading(true);
        try {
            const billingLabel = billingCycle === 'YEARLY' ? '1 Năm' : billingCycle === 'SIX_MONTHS' ? '6 Tháng' : 'Hàng tháng';
            const planDescription = `Nâng cấp ${plan.label} (${billingLabel})`;

            const res = await axios.post('/api/payment/create-payos-link', {
                email,
                amount: Math.round(getPrice()),
                plan: planDescription,
                role: plan.targetRole,
                note: `Cycle: ${billingCycle}`,
                billingCycle,
                isSlotUpgrade: false,
                extraChannelSlots: 0
            });

            if (res.data.success && res.data.data.paymentUrl) {
                window.location.href = res.data.data.paymentUrl;
            } else {
                toast.error('Không thể tạo link thanh toán. Vui lòng thử lại.');
            }
        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error.response?.data?.error || 'Lỗi kết nối thanh toán.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999999]" style={{ zIndex: 999999 }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl bg-[#0D0D10] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition">
                                <X size={20} />
                            </button>

                            {/* LEFT COLUMN: PLAN INFO */}
                            <div className="w-full lg:w-5/12 flex flex-col bg-gradient-to-b from-gray-900 to-[#0D0D10] border-r border-gray-800">
                                {/* Hero */}
                                <div className={`relative h-40 w-full bg-gradient-to-br ${plan.bgColor} flex items-center justify-center`}>
                                    <div className="absolute inset-0 bg-black/30"></div>
                                    <div className="relative text-center">
                                        <div className="text-5xl font-black text-white mb-2">{plan.label}</div>
                                        <div className="text-white/60 text-sm font-medium">SeenYT AI Platform</div>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    {/* License Key Info */}
                                    {plan.licenseIncludes.length > 0 && (
                                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles size={16} className="text-green-400" />
                                                <span className="text-green-400 font-bold text-sm">Bao gồm License Key</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {plan.licenseIncludes.map((license, idx) => (
                                                    <span key={idx} className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
                                                        {license}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Features */}
                                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Check size={14} className="text-yellow-500" />
                                        Quyền lợi gói {plan.label}
                                    </h3>
                                    <div className="space-y-2 flex-1">
                                        {plan.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="mt-0.5 bg-green-500/10 p-1 rounded-full flex-shrink-0">
                                                    <Check size={10} className="text-green-500" />
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {feat}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add-ons hint */}
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <p className="text-gray-500 text-xs">
                                            <span className="text-[#CDAD5A]">+169k/tháng</span> mỗi kênh YouTube thêm
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: PAYMENT CONFIGURATOR */}
                            <div className="w-full lg:w-7/12 bg-[#0D0D10] p-8 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${plan.bgColor}`}></div>
                                    <h2 className="text-2xl font-bold text-white">Thanh toán an toàn</h2>
                                </div>

                                {/* Plan Summary */}
                                <div className="mb-6 p-5 bg-gray-900/50 rounded-2xl border border-gray-800 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-gray-400">Gói đăng ký:</div>
                                            <div className={`text-2xl font-black uppercase bg-gradient-to-r ${plan.bgColor} bg-clip-text text-transparent`}>
                                                {plan.label}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-400">Tổng thanh toán</div>
                                            <div className="text-3xl font-black text-white">{formatPrice(getPrice())}đ</div>
                                            {billingCycle !== 'MONTHLY' && (
                                                <div className="text-sm text-green-400 font-medium">
                                                    Tiết kiệm {getSavingPercent()}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* BILLING CYCLE */}
                                <div className="mb-8">
                                    <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">
                                        Chọn chu kỳ thanh toán
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Monthly */}
                                        <button
                                            onClick={() => setBillingCycle('MONTHLY')}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                                                billingCycle === 'MONTHLY' 
                                                    ? `border-${plan.color}-500 bg-${plan.color}-900/20` 
                                                    : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
                                            }`}
                                        >
                                            <div className={`text-xs font-bold mb-1 ${
                                                billingCycle === 'MONTHLY' ? `text-${plan.color}-400` : 'text-gray-400'
                                            }`}>
                                                Hàng tháng
                                            </div>
                                            <div className="text-lg font-black text-white">
                                                {formatPrice(plan.monthly)}đ
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">/tháng</div>
                                        </button>

                                        {/* 6 Months */}
                                        <button
                                            onClick={() => setBillingCycle('SIX_MONTHS')}
                                            className={`p-4 rounded-xl border-2 text-center transition-all relative ${
                                                billingCycle === 'SIX_MONTHS' 
                                                    ? `border-${plan.color}-500 bg-${plan.color}-900/20` 
                                                    : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
                                            }`}
                                        >
                                            {getSavingPercent() >= 20 && (
                                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                                    -{Math.round((1 - plan.sixMonths / plan.monthly) * 100)}%
                                                </div>
                                            )}
                                            <div className={`text-xs font-bold mb-1 ${
                                                billingCycle === 'SIX_MONTHS' ? `text-${plan.color}-400` : 'text-gray-400'
                                            }`}>
                                                6 Tháng
                                            </div>
                                            <div className="text-lg font-black text-white">
                                                {formatPrice(plan.sixMonths)}đ
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">/tháng</div>
                                        </button>

                                        {/* Yearly */}
                                        <button
                                            onClick={() => setBillingCycle('YEARLY')}
                                            className={`p-4 rounded-xl border-2 text-center transition-all relative ${
                                                billingCycle === 'YEARLY' 
                                                    ? `border-${plan.color}-500 bg-${plan.color}-900/20` 
                                                    : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
                                            }`}
                                        >
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow animate-pulse">
                                                TIẾT KIỆM NHẤT
                                            </div>
                                            <div className={`text-xs font-bold mb-1 ${
                                                billingCycle === 'YEARLY' ? `text-${plan.color}-400` : 'text-gray-400'
                                            }`}>
                                                1 Năm
                                            </div>
                                            <div className="text-lg font-black text-white">
                                                {formatPrice(plan.yearly)}đ
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">/tháng</div>
                                        </button>
                                    </div>

                                    {/* Saving highlight */}
                                    {billingCycle !== 'MONTHLY' && (
                                        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                                            <span className="text-green-400 font-bold text-sm">
                                                🎉 Tiết kiệm {formatPrice(getSavingAmount())}đ/năm với gói {billingCycle === 'YEARLY' ? '1 năm' : '6 tháng'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div className="mb-8">
                                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">
                                        Email nhận License Key & Kích hoạt
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Nhập email của bạn (vd: tung@gmail.com)"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-4 text-white hover:border-gray-700 outline-none focus:border-green-500 transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        🔑 License Key sẽ được gửi tự động qua email sau khi thanh toán thành công.
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="mt-auto">
                                    <button
                                        onClick={handlePayment}
                                        disabled={isLoading}
                                        className={`w-full py-5 bg-gradient-to-r ${plan.bgColor} hover:opacity-90 text-white font-black text-lg rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isLoading ? (
                                            <><Loader2 size={20} className="animate-spin" /> Đang xử lý...</>
                                        ) : (
                                            <>THANH TOÁN QUA PAYOS <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-4 mt-4 text-gray-500 text-xs">
                                        <span className="flex items-center gap-1">
                                            <Check size={12} className="text-green-500" /> Kích hoạt tự động
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Check size={12} className="text-green-500" /> Hoàn tiền 7 ngày
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Check size={12} className="text-green-500" /> Hỗ trợ 24/7
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

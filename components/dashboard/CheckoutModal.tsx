import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredPlan?: string;
    userEmail?: string;
    forceYearly?: boolean;
}

export default function CheckoutModal({
    isOpen,
    onClose,
    requiredPlan = '',
    userEmail = '',
    forceYearly = false
}: CheckoutModalProps) {
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>(forceYearly ? 'YEARLY' : 'MONTHLY');
    const [email, setEmail] = useState(userEmail);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setBillingCycle(forceYearly ? 'YEARLY' : 'MONTHLY');
            if (userEmail) setEmail(userEmail);
        }
    }, [isOpen, forceYearly, userEmail]);

    if (!isOpen || !mounted) return null;

    const isYearly = billingCycle === 'YEARLY';

    // Exact Workflow Pricing
    let baseMonthly = 169000;
    let baseYearly = 169000 * 12 * 0.7;
    let planLabel = 'Gói Cơ Bản';
    let targetPlanRole = 'BASIC';
    let features: string[] = [];

    if (requiredPlan === 'WEBSPACE') {
        baseMonthly = 199000;
        baseYearly = Math.round(199000 * 12 * 0.7);
        planLabel = 'Webspace SEO';
        targetPlanRole = 'WEBSPACE';
        features = ["Tìm Ngách & Đối thủ", "Sinh kịch bản Viral", "Tối ưu hóa On-Page"];
    } else if (requiredPlan === 'STUDIO') {
        baseMonthly = 459000;
        baseYearly = Math.round(459000 * 12 * 0.7);
        planLabel = 'Koda Studio (Video Auto)';
        targetPlanRole = 'STUDIO';
        features = ["Render Video YouTube/Tiktok", "Hỗ trợ làm phim Veo3", "Tặng lõi Voice TTS đỉnh cao", "Tool chạy ẩn trên Window"];
    } else if (requiredPlan === 'NOVEL') {
        baseMonthly = 559000;
        baseYearly = Math.round(559000 * 12 * 0.7);
        planLabel = 'Koda Novel (Phim Truyện)';
        targetPlanRole = 'NOVEL';
        features = ["Sáng tác Truyện Chữ Auto", "Chuyển thể tiểu thuyết thành Video", "Quản lý dữ liệu nhân vật", "Lồng giọng nhân vật tự động"];
    } else if (requiredPlan === 'COMBO') {
        baseMonthly = 790000;
        baseYearly = 6990000; // Custom Anchor Decoy Price
        planLabel = 'VIP COMBO ALL-IN-ONE';
        targetPlanRole = 'VIP_COMBO';
        features = ["Mở khóa 100% Webspace", "Mở khóa 100% Koda Studio", "Mở khóa 100% Koda Novel", "Cam kết rẻ nhất hệ sinh thái"];
    }

    const finalPrice = isYearly ? baseYearly : baseMonthly;

    // PAYMENT HANDLER
    const handlePayment = async () => {
        if (!email) {
            toast.error('Vui lòng nhập Email nạp VIP!');
            return;
        }

        setIsLoading(true);
        try {
            const planDescription = `Nâng cấp ${planLabel} (${billingCycle})`;

            const res = await axios.post('/api/payment/create-payos-link', {
                email,
                amount: Math.round(finalPrice),
                plan: planDescription,
                role: targetPlanRole,
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

    const formatPrice = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

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
                            className="relative w-full max-w-4xl bg-[#0D0D10] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition">
                                <X size={20} />
                            </button>

                            {/* LEFT COLUMN: HERO & FEATURES */}
                            <div className="w-full md:w-5/12 flex flex-col bg-[#161b22] border-r border-gray-800">
                                <div className="relative h-48 md:h-64 w-full overflow-hidden">
                                    <img
                                        src="/images/checkout-hero.jpg"
                                        alt="Checkout Hero"
                                        className="w-full h-full object-cover object-top"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#161b22] to-transparent"></div>
                                </div>

                                <div className="p-6 md:p-8 flex flex-col flex-1">
                                    <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4">
                                        SEEN<span className="text-blue-500">YT</span> AI
                                    </h2>

                                    <div className="space-y-3 mb-6">
                                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-500" />
                                            Quyền lợi nổi bật gói
                                        </h3>
                                        <div className="space-y-2">
                                            {features.map((feat, idx) => (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className="mt-0.5 bg-green-500/10 p-1 rounded-full">
                                                        <Check size={10} className="text-green-500" />
                                                    </div>
                                                    <div className="text-sm text-gray-300 font-medium">
                                                        {feat}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: CONFIGURATOR */}
                            <div className="w-full md:w-7/12 bg-[#0D0D10] p-8 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                    <h2 className="text-2xl font-bold text-white">Thanh toán tự động 24/7</h2>
                                </div>

                                <div className="mb-8 p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-inner flex flex-col items-center">
                                    <div className="text-sm font-bold text-gray-400 mb-1">Bạn đang chọn Nạp Gói:</div>
                                    <div className="text-2xl font-black text-blue-400 uppercase tracking-wider text-center">{planLabel}</div>
                                </div>

                                {/* BILLING CYCLE */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <button
                                        onClick={() => setBillingCycle('MONTHLY')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${billingCycle === 'MONTHLY' ? 'border-blue-600 bg-blue-900/10' : 'border-gray-800 bg-gray-900/30 opacity-60 hover:opacity-100'}`}
                                    >
                                        <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Thanh toán tháng</div>
                                        <div className="text-lg font-black text-white">
                                            {formatPrice(baseMonthly)} đ
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={() => setBillingCycle('YEARLY')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all relative ${billingCycle === 'YEARLY' ? 'border-blue-500 bg-blue-900/10' : 'border-gray-800 bg-gray-900/30 opacity-60 hover:opacity-100'}`}
                                    >
                                        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-bounce">
                                            SIÊU TIẾT KIỆM
                                        </div>
                                        <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Thanh toán năm</div>
                                        <div className="text-lg font-black text-white">
                                            {formatPrice(baseYearly)} đ
                                        </div>
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Email kích hoạt hệ thống</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Nhập email của bạn (vd: tung@gmail.com)"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-4 text-white hover:border-gray-700 outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 italic">Tài khoản & mã sẽ được gửi về mail này ngay lập tức.</p>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <span className="text-gray-400 font-bold">Tổng thanh toán:</span>
                                        <span className="text-3xl font-black text-white">{formatPrice(finalPrice)} đ</span>
                                    </div>
                                    <button
                                        onClick={handlePayment}
                                        disabled={isLoading}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <><Loader2 size={20} className="animate-spin" /> QUÉT MÃ QR...</>
                                        ) : (
                                            <>QUÉT PAYOS NGAY <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

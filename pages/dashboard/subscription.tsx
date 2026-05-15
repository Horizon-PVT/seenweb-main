// pages/dashboard/subscription.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
    CreditCard, Clock, Calendar, Check, Star, Zap, Crown,
    ChevronRight, AlertCircle, ArrowRight, Gift, Shield,
    Download, BarChart3, Video, Users, Globe
} from 'lucide-react';

interface SubscriptionData {
    plan: string;
    expiresAt: string | null;
    daysRemaining: number | null;
    maxChannels: number;
    maxVideos: number;
    features: string[];
}

const PLAN_DETAILS: Record<string, {
    name: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    price: string;
    maxChannels: number;
    maxVideos: number;
    features: string[];
}> = {
    'FREE': {
        name: 'Miễn phí',
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/10 border-gray-400/20',
        icon: <Star size={24} />,
        price: '0đ',
        maxChannels: 0,
        maxVideos: 5,
        features: [
            '1 Kênh YouTube',
            '5 Video/tháng',
            'Video Tips cơ bản',
            'Dashboard cơ bản',
        ],
    },
    'STARTER': {
        name: 'Starter',
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10 border-blue-400/20',
        icon: <Zap size={24} />,
        price: '199.000đ/tháng',
        maxChannels: 1,
        maxVideos: 30,
        features: [
            '1 kênh YouTube',
            '30 Video/tháng',
            'Video Tips nâng cao',
            'AI Coach cơ bản',
            'Hỗ trợ qua chat',
        ],
    },
    'CREATOR': {
        name: 'Creator',
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10 border-purple-400/20',
        icon: <Video size={24} />,
        price: '399.000đ/tháng',
        maxChannels: 2,
        maxVideos: 100,
        features: [
            '2 kênh YouTube',
            '100 Video/tháng',
            'Video Tips + Tạo video',
            'AI Coach thông minh',
            'Hỗ trợ ưu tiên',
            'Analytics nâng cao',
        ],
    },
    'FACTORY': {
        name: 'Workflow Team',
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10 border-amber-400/20',
        icon: <Crown size={24} />,
        price: '699.000đ/tháng',
        maxChannels: 5,
        maxVideos: 300,
        features: [
            '5 kênh YouTube',
            '300 Video/tháng',
            'Tạo video + Video Tips',
            'AI Coach Pro',
            'Hỗ trợ 24/7',
            'Analytics + Xuất báo cáo',
            'White Label',
        ],
    },
    'AGENCY': {
        name: 'Agency',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-400/10 border-cyan-400/20',
        icon: <Users size={24} />,
        price: '1.990.000đ/tháng',
        maxChannels: 5,
        maxVideos: 1000,
        features: [
            '5 kênh YouTube',
            '1000 Video/tháng',
            'Tất cả tính năng',
            'AI Coach Enterprise',
            'Hỗ trợ riêng',
            'API Access',
            'White Label + Reseller',
            'Multi-user',
        ],
    },
};

export default function SubscriptionPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRenewModal, setShowRenewModal] = useState(false);

    // @ts-ignore
    const userRole = session?.user?.role || 'FREE';

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await fetch('/api/user/subscription');
                const data = await res.json();
                if (data.success) {
                    const planDetail = PLAN_DETAILS[data.subscription.plan] || PLAN_DETAILS['FREE'];
                    setSubscription({
                        ...data.subscription,
                        maxChannels: planDetail.maxChannels,
                        maxVideos: planDetail.maxVideos,
                        features: planDetail.features,
                    });
                }
            } catch (err) {
                console.error('Failed to fetch subscription:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    const currentPlan = PLAN_DETAILS[subscription?.plan || 'FREE'];

    const getProgressColor = (days: number | null) => {
        if (days === null) return 'bg-gray-600';
        if (days <= 7) return 'bg-red-500';
        if (days <= 14) return 'bg-amber-500';
        return 'bg-green-500';
    };

    const getProgressPercent = (days: number | null) => {
        if (days === null) return 0;
        if (days >= 30) return 100;
        return Math.round((days / 30) * 100);
    };

    if (loading) {
        return (
            <DashboardLayout userRole={userRole}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole={userRole}>
            <Head>
                <title>Quản lý gói | SeenYT Studio</title>
            </Head>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Quản lý gói cước</h1>
                    <p className="text-gray-400">Theo dõi và quản lý thông tin gói dịch vụ của bạn.</p>
                </div>

                {/* Current Plan Card */}
                {subscription && subscription.plan !== 'FREE' && (
                    <div className={`p-6 rounded-2xl border ${currentPlan?.bgColor} relative overflow-hidden`}>
                        {/* Background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-current opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                {/* Plan Info */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentPlan?.bgColor} ${currentPlan?.color}`}>
                                        {currentPlan?.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Gói hiện tại</p>
                                        <h3 className={`text-2xl font-bold ${currentPlan?.color}`}>
                                            {currentPlan?.name} Plan
                                        </h3>
                                        <p className="text-sm text-gray-400">{currentPlan?.price}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex flex-wrap items-center gap-6">
                                    {/* Days Remaining */}
                                    {subscription.daysRemaining !== null && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <Clock size={16} className={subscription.daysRemaining <= 7 ? 'text-red-400' : 'text-gray-400'} />
                                                <span className={`text-3xl font-bold ${subscription.daysRemaining <= 7 ? 'text-red-400' : 'text-white'}`}>
                                                    {subscription.daysRemaining}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Ngày còn lại</p>
                                        </div>
                                    )}

                                    {/* Expiry Date */}
                                    {subscription.expiresAt && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <Calendar size={16} className="text-gray-400" />
                                            </div>
                                            <p className="text-lg font-semibold text-white">
                                                {new Date(subscription.expiresAt).toLocaleDateString('vi-VN')}
                                            </p>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Ngày hết hạn</p>
                                        </div>
                                    )}

                                    {/* Progress Bar */}
                                    {subscription.daysRemaining !== null && (
                                        <div className="w-32">
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${getProgressColor(subscription.daysRemaining)} transition-all duration-500`}
                                                    style={{ width: `${getProgressPercent(subscription.daysRemaining)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 text-center">
                                                {subscription.daysRemaining <= 7 ? '⚠️ Sắp hết!' : ''}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Usage Stats */}
                            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Users size={14} />
                                        Kênh đã kết nối
                                    </div>
                                    <p className="text-xl font-bold text-white">
                                        {subscription.maxChannels}
                                        <span className="text-sm text-gray-500 font-normal ml-1">/ {subscription.maxChannels}</span>
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Video size={14} />
                                        Video/tháng
                                    </div>
                                    <p className="text-xl font-bold text-white">
                                        {subscription.maxVideos}
                                        <span className="text-sm text-gray-500 font-normal ml-1">quota</span>
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <BarChart3 size={14} />
                                        Analytics
                                    </div>
                                    <p className="text-sm font-medium text-green-400">Đang hoạt động</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Shield size={14} />
                                        Trạng thái
                                    </div>
                                    <p className="text-sm font-medium text-green-400 flex items-center gap-1">
                                        <Check size={14} /> Active
                                    </p>
                                </div>
                            </div>

                            {/* Alert for expiring soon */}
                            {subscription.daysRemaining !== null && subscription.daysRemaining <= 7 && (
                                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-400">Gói của bạn sắp hết hạn!</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Vui lòng gia hạn để tiếp tục sử dụng dịch vụ không bị gián đoạn.
                                        </p>
                                        <button
                                            onClick={() => router.push('/pricing')}
                                            className="mt-2 text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                                        >
                                            Gia hạn ngay <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Free Plan Banner */}
                {(!subscription || subscription.plan === 'FREE') && (
                    <div className="p-6 rounded-2xl border bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Star size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-purple-400 mb-1">Gói hiện tại</p>
                                    <h3 className="text-2xl font-bold text-white">Miễn phí</h3>
                                    <p className="text-sm text-gray-400">Khám phá các tính năng cơ bản</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/pricing')}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                            >
                                <Zap size={16} />
                                Nâng cấp ngay
                            </button>
                        </div>
                    </div>
                )}

                {/* Features List */}
                {subscription && subscription.plan !== 'FREE' && (
                    <div className="bg-[#14161B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Gift size={18} className="text-purple-400" />
                            Tính năng của gói {currentPlan?.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentPlan?.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check size={14} className="text-green-400" />
                                    </div>
                                    <span className="text-sm text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => router.push('/pricing')}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                <Zap size={16} />
                                Nâng cấp gói khác
                            </button>
                            <button
                                onClick={() => setShowRenewModal(true)}
                                className="flex-1 px-6 py-3 border border-gray-700 hover:bg-white/5 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                <CreditCard size={16} />
                                Gia hạn {currentPlan?.name}
                            </button>
                        </div>
                    </div>
                )}

                {/* Quick Actions for Free Plan */}
                {(!subscription || subscription.plan === 'FREE') && (
                    <div className="bg-[#14161B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Các gói có sẵn</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(PLAN_DETAILS).filter(([key]) => key !== 'FREE').map(([key, plan]) => (
                                <div 
                                    key={key}
                                    className={`p-4 rounded-xl border ${plan.bgColor} hover:scale-105 transition-transform cursor-pointer`}
                                    onClick={() => router.push('/pricing')}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${plan.bgColor} ${plan.color}`}>
                                        {plan.icon}
                                    </div>
                                    <h4 className={`font-bold ${plan.color}`}>{plan.name}</h4>
                                    <p className="text-2xl font-bold text-white mt-1">{plan.price.split('/')[0]}</p>
                                    <ul className="mt-3 space-y-1">
                                        <li className="text-xs text-gray-400">• {plan.maxChannels} kênh</li>
                                        <li className="text-xs text-gray-400">• {plan.maxVideos} video/tháng</li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment History Placeholder */}
                <div className="bg-[#14161B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Download size={18} className="text-gray-400" />
                            Lịch sử thanh toán
                        </h3>
                        <button className="text-xs text-purple-400 hover:text-purple-300">
                            Xem tất cả →
                        </button>
                    </div>
                    <div className="text-center py-8">
                        <CreditCard size={32} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Chưa có lịch sử thanh toán</p>
                        <p className="text-gray-600 text-xs mt-1">Các giao dịch sẽ hiển thị tại đây sau khi bạn nâng cấp gói</p>
                    </div>
                </div>
            </div>

            {/* Renew Modal */}
            {showRenewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRenewModal(false)}></div>
                    <div className="relative bg-[#1a1a20] border border-gray-700 rounded-2xl p-6 w-full max-w-md animate-fadeIn">
                        <h3 className="text-xl font-bold text-white mb-4">Gia hạn {currentPlan?.name}</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-sm text-gray-400 mb-2">Gói hiện tại</p>
                                <p className="text-lg font-bold text-white">{currentPlan?.name} - {currentPlan?.price}</p>
                            </div>
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <p className="text-sm text-purple-400 mb-2">Gia hạn thêm 30 ngày</p>
                                <p className="text-lg font-bold text-white">{currentPlan?.price}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowRenewModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-700 hover:bg-white/5 text-white font-medium rounded-xl transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    setShowRenewModal(false);
                                    router.push('/pricing');
                                }}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all"
                            >
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

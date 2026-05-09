// pages/tools/affiliate-partner.tsx
// Merged: Affiliate (Cá nhân) + White-Label (Đại lý) - Phase 6 & 7

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Users,
    DollarSign,
    BarChart3,
    Globe,
    Copy,
    Check,
    Shield,
    Building,
    TrendingUp,
    Award,
    Target,
    Star,
    User,
    Store,
    ArrowRight,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface PartnerStats {
    totalPartners: number;
    totalRevenue: number;
    activeResellers: number;
    commission: number;
}

interface Reseller {
    id: string;
    name: string;
    email: string;
    status: string;
    subscribedAt: string;
    revenue: number;
    channelCount: number;
}

interface AffiliateStats {
    totalEarnings: number;
    totalReferrals: number;
    pendingPayout: number;
    tier: 'SILVER' | 'DIAMOND' | 'PLATINUM';
}

export default function AffiliatePartnerPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isReady, setIsReady] = useState(false);
    const [activeTab, setActiveTab] = useState<'daily' | 'reseller'>('daily');
    const [copied, setCopied] = useState(false);
    
    // Stats for Reseller tab
    const [resellerStats, setResellerStats] = useState<PartnerStats>({
        totalPartners: 0,
        totalRevenue: 0,
        activeResellers: 0,
        commission: 30
    });
    const [resellers, setResellers] = useState<Reseller[]>([]);

    // Stats for Individual (Affiliate) tab
    const [affiliateStats, setAffiliateStats] = useState<AffiliateStats>({
        totalEarnings: 0,
        totalReferrals: 0,
        pendingPayout: 0,
        tier: 'SILVER'
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            setIsReady(true);
            fetchPartnerData();
            fetchAffiliateData();
        }
    }, [status, router]);

    const fetchPartnerData = async () => {
        try {
            const res = await fetch('/api/partner/stats');
            if (res.ok) {
                const data = await res.json();
                setResellerStats(data);
            }
            
            const resellersRes = await fetch('/api/partner/resellers');
            if (resellersRes.ok) {
                const data = await resellersRes.json();
                setResellers(data.resellers || []);
            }
        } catch (error) {
            console.error('Failed to fetch partner data:', error);
        }
    };

    const fetchAffiliateData = async () => {
        try {
            const res = await fetch('/api/affiliate/stats');
            if (res.ok) {
                const data = await res.json();
                setAffiliateStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch affiliate data:', error);
        }
    };

    const copyReferralLink = (type: 'affiliate' | 'reseller') => {
        const link = type === 'affiliate' 
            ? `https://seenyt.net/affiliate?ref=${session?.user?.id || 'demo'}`
            : `https://seenyt.net/join?ref=${session?.user?.id || 'demo'}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatUSD = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    if (!isReady) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-indigo-400 font-bold tracking-widest">LOADING...</div>
            </div>
        );
    }

    const commissionTiers = [
        {
            id: 'SILVER',
            name: 'Silver',
            commission: 15,
            color: 'from-gray-400 to-gray-500',
            borderColor: 'border-gray-500/30',
            bgColor: 'bg-gray-500/10',
            textColor: 'text-gray-400',
            features: ['Monthly Payouts', 'Standard Dashboard', 'Email Support'],
            popular: false
        },
        {
            id: 'DIAMOND',
            name: 'Diamond',
            commission: 35,
            color: 'from-yellow-400 to-amber-500',
            borderColor: 'border-yellow-500/50',
            bgColor: 'bg-yellow-500/10',
            textColor: 'text-yellow-400',
            features: ['Weekly Payouts', 'Real-time API', 'Custom Marketing Kits', 'Dedicated Manager'],
            popular: true
        },
        {
            id: 'PLATINUM',
            name: 'Platinum',
            commission: 25,
            color: 'from-purple-400 to-pink-500',
            borderColor: 'border-purple-500/30',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-400',
            features: ['Bi-Weekly Payouts', 'Detailed Analytics', 'Priority Support'],
            popular: false
        }
    ];

    return (
        <DashboardLayout
            userRole={(session?.user as any)?.role || 'FREE'}
            activeTool="affiliate"
            title="Affiliate & Partner - SeenYT"
        >
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                            <Award className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">Affiliate & Partner</h1>
                            <p className="text-sm text-gray-500">Chương trình giới thiệu & đại lý toàn cầu</p>
                        </div>
                    </div>

                    {/* Main Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('daily')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'daily'
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <User size={16} />
                            Cá nhân
                        </button>
                        <button
                            onClick={() => setActiveTab('reseller')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'reseller'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Building size={16} />
                            Đại lý
                        </button>
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    
                    {/* ============================================================ */}
                    {/* TAB: CÁ NHÂN (AFFILIATE)                                    */}
                    {/* ============================================================ */}
                    {activeTab === 'daily' && (
                        <motion.div
                            key="affiliate"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span className="text-xs text-green-400">+12%</span>
                                    </div>
                                    <p className="text-3xl font-black text-green-400">{formatUSD(affiliateStats.totalEarnings)}</p>
                                    <p className="text-sm text-gray-500">Tổng thu nhập</p>
                                </div>
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <span className="text-xs text-blue-400">Active</span>
                                    </div>
                                    <p className="text-3xl font-black text-white">{affiliateStats.totalReferrals}</p>
                                    <p className="text-sm text-gray-500">Người giới thiệu</p>
                                </div>
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                            <Star className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <span className="text-xs text-amber-400">Pending</span>
                                    </div>
                                    <p className="text-3xl font-black text-amber-400">{formatUSD(affiliateStats.pendingPayout)}</p>
                                    <p className="text-sm text-gray-500">Chờ thanh toán</p>
                                </div>
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <span className="text-xs text-indigo-400">Current</span>
                                    </div>
                                    <p className="text-3xl font-black text-indigo-400">{affiliateStats.tier}</p>
                                    <p className="text-sm text-gray-500">Cấp bậc hiện tại</p>
                                </div>
                            </div>

                            {/* Referral Link */}
                            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">Link giới thiệu của bạn</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Chia sẻ link này để nhận hoa hồng từ mỗi gói Premium được mua qua link của bạn.
                                </p>
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-gray-300">
                                        seenyt.net/affiliate?ref={session?.user?.id || 'demo'}
                                    </div>
                                    <button
                                        onClick={() => copyReferralLink('affiliate')}
                                        className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                                            copied 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                        }`}
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Commission Tiers */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Bảng hoa hồng</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {commissionTiers.map(tier => (
                                        <div 
                                            key={tier.id}
                                            className={`relative bg-[#111] border ${tier.borderColor} rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                                                tier.popular ? 'shadow-[0_0_40px_rgba(234,179,8,0.15)]' : ''
                                            }`}
                                        >
                                            {tier.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                                                    Phổ biến nhất
                                                </div>
                                            )}
                                            
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                                                <Star className="w-6 h-6 text-white" />
                                            </div>
                                            
                                            <p className={`text-xs font-bold uppercase tracking-widest ${tier.textColor} mb-1`}>{tier.name}</p>
                                            <div className="flex items-baseline gap-1 mb-6">
                                                <span className="text-4xl font-black text-white">{tier.commission}%</span>
                                                <span className="text-sm text-gray-500">Hoa hồng</span>
                                            </div>
                                            
                                            <ul className="space-y-3 mb-6 pb-6 border-b border-white/10">
                                                {tier.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                                                        <Check size={14} className={tier.textColor} />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                            
                                            <button className={`w-full py-3 rounded-xl font-bold transition-colors ${
                                                tier.popular 
                                                    ? `bg-gradient-to-r ${tier.color} text-white hover:opacity-90`
                                                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                            }`}>
                                                {affiliateStats.tier === tier.id ? 'Cấp bậc hiện tại' : 'Nâng cấp'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* How It Works */}
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                                <h3 className="text-xl font-bold text-white mb-6">Cách thức hoạt động</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                                            <User className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h4 className="font-bold text-white mb-2">1. Đăng ký</h4>
                                        <p className="text-sm text-gray-500">Tạo tài khoản affiliate và nhận link giới thiệu riêng</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                            <Target className="w-8 h-8 text-green-400" />
                                        </div>
                                        <h4 className="font-bold text-white mb-2">2. Chia sẻ</h4>
                                        <p className="text-sm text-gray-500">Giới thiệu SeenYT cho bạn bè, cộng đồng của bạn</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                                            <DollarSign className="w-8 h-8 text-amber-400" />
                                        </div>
                                        <h4 className="font-bold text-white mb-2">3. Nhận hoa hồng</h4>
                                        <p className="text-sm text-gray-500">Nhận thanh toán qua PayPal, Wire Transfer hoặc Crypto</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB: ĐẠI LÝ (RESELLER/PARTNER)                             */}
                    {/* ============================================================ */}
                    {activeTab === 'reseller' && (
                        <motion.div
                            key="reseller"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <span className="text-xs text-green-400">+12%</span>
                                    </div>
                                    <p className="text-3xl font-black text-white">{resellerStats.totalPartners}</p>
                                    <p className="text-sm text-gray-500">Tổng đối tác</p>
                                </div>
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span className="text-xs text-green-400">+28%</span>
                                    </div>
                                    <p className="text-3xl font-black text-green-400">{formatCurrency(resellerStats.totalRevenue)}</p>
                                    <p className="text-sm text-gray-500">Doanh thu</p>
                                </div>
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <Building className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <span className="text-xs text-blue-400">Active</span>
                                    </div>
                                    <p className="text-3xl font-black text-white">{resellerStats.activeResellers}</p>
                                    <p className="text-sm text-gray-500">Đại lý đang hoạt động</p>
                                </div>
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <span className="text-xs text-purple-400">Commission</span>
                                    </div>
                                    <p className="text-3xl font-black text-purple-400">{resellerStats.commission}%</p>
                                    <p className="text-sm text-gray-500">Hoa hồng của bạn</p>
                                </div>
                            </div>

                            {/* Referral Link */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">Link giới thiệu của bạn</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Chia sẻ link này để nhận hoa hồng {resellerStats.commission}% từ mỗi gói Premium được mua qua link của bạn.
                                </p>
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-gray-300">
                                        seenyt.net/join?ref={session?.user?.id || 'demo'}
                                    </div>
                                    <button
                                        onClick={() => copyReferralLink('reseller')}
                                        className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                                            copied 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                                        }`}
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                                        <DollarSign className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <h4 className="font-bold text-white mb-2">Hoa hồng cao</h4>
                                    <p className="text-sm text-gray-500">
                                        Nhận {resellerStats.commission}% hoa hồng cho mỗi giao dịch thành công từ đại lý của bạn.
                                    </p>
                                </div>
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                                        <Globe className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h4 className="font-bold text-white mb-2">Đa quốc gia</h4>
                                    <p className="text-sm text-gray-500">
                                        Hỗ trợ nhiều ngôn ngữ và đơn vị tiền tệ cho thị trường toàn cầu.
                                    </p>
                                </div>
                                <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                                        <Shield className="w-6 h-6 text-green-400" />
                                    </div>
                                    <h4 className="font-bold text-white mb-2">Bảo mật cao</h4>
                                    <p className="text-sm text-gray-500">
                                        Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn quốc tế.
                                    </p>
                                </div>
                            </div>

                            {/* Resellers List */}
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Danh sách đại lý</h3>
                                {resellers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-2">Chưa có đại lý nào</p>
                                        <p className="text-gray-600 text-sm">Chia sẻ link giới thiệu để phát triển mạng lưới</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {resellers.map(reseller => (
                                            <div key={reseller.id} className="bg-[#0a0a0c] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                                    {reseller.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white">{reseller.name}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            reseller.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                            {reseller.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{reseller.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-400">{formatCurrency(reseller.revenue)}</p>
                                                    <p className="text-xs text-gray-500">{reseller.channelCount} kênh</p>
                                                </div>
                                                <div className="text-right text-xs text-gray-500">
                                                    {new Date(reseller.subscribedAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Branding Settings */}
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Cài đặt Brand</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Tùy chỉnh thương hiệu của bạn để đại lý có thể nhận diện.
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên công ty/ Cá nhân</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Công ty ABC"
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Website riêng</label>
                                        <input
                                            type="url"
                                            placeholder="https://yourbrand.com"
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo (URL)</label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com/logo.png"
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Màu chủ đạo</label>
                                        <div className="flex gap-3">
                                            {['#CDAD5A', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'].map(color => (
                                                <button
                                                    key={color}
                                                    className="w-10 h-10 rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors">
                                    Lưu cài đặt
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}

// pages/tools/white-label.tsx
// Phase 7: White-Label & Scale - Partner Portal

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Crown,
    ChevronLeft,
    Users,
    DollarSign,
    BarChart3,
    Globe,
    Copy,
    Check,
    ExternalLink,
    Shield,
    Zap,
    Building
} from 'lucide-react';

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

export default function WhiteLabelPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isReady, setIsReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'resellers' | 'settings'>('overview');
    
    // Stats
    const [stats, setStats] = useState<PartnerStats>({
        totalPartners: 0,
        totalRevenue: 0,
        activeResellers: 0,
        commission: 30
    });
    const [resellers, setResellers] = useState<Reseller[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            setIsReady(true);
            fetchPartnerData();
        }
    }, [status, router]);

    const fetchPartnerData = async () => {
        try {
            const res = await fetch('/api/partner/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
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

    const copyReferralLink = () => {
        const link = `https://seenyt.net/join?ref=${session?.user?.id || 'demo'}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (!isReady) {
        return (
            <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center">
                <div className="animate-pulse text-indigo-400 font-bold tracking-widest">LOADING...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Head>
                <title>White-Label Partner - SeenYT</title>
            </Head>

            {/* Header */}
            <div className="border-b border-white/10 bg-[#0a0f14]">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Crown className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white">White-Label Partner</h1>
                                <p className="text-sm text-gray-500">Mở rộng & quy mô hệ thống</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Zap size={16} />
                                Hoa hồng: {stats.commission}%
                            </span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6">
                        {[
                            { id: 'overview' as const, label: 'Tổng quan' },
                            { id: 'resellers' as const, label: 'Đại lý' },
                            { id: 'settings' as const, label: 'Cài đặt' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
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
                                <p className="text-3xl font-black text-white">{stats.totalPartners}</p>
                                <p className="text-sm text-gray-500">Tổng đối tác</p>
                            </div>
                            <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-400" />
                                    </div>
                                    <span className="text-xs text-green-400">+28%</span>
                                </div>
                                <p className="text-3xl font-black text-green-400">{formatCurrency(stats.totalRevenue)}</p>
                                <p className="text-sm text-gray-500">Doanh thu</p>
                            </div>
                            <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Building className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <span className="text-xs text-blue-400">Active</span>
                                </div>
                                <p className="text-3xl font-black text-white">{stats.activeResellers}</p>
                                <p className="text-sm text-gray-500">Đại lý đang hoạt động</p>
                            </div>
                            <div className="bg-[#111] border border-white/10 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-xs text-purple-400">Commission</span>
                                </div>
                                <p className="text-3xl font-black text-purple-400">{stats.commission}%</p>
                                <p className="text-sm text-gray-500">Hoa hồng của bạn</p>
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Link giới thiệu của bạn</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Chia sẻ link này để nhận hoa hồng {stats.commission}% từ mỗi gói Premium được mua qua link của bạn.
                            </p>
                            <div className="flex gap-3">
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-gray-300">
                                    seenyt.net/join?ref={session?.user?.id || 'demo'}
                                </div>
                                <button
                                    onClick={copyReferralLink}
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
                                    Nhận {stats.commission}% hoa hồng cho mỗi giao dịch thành công từ đại lý của bạn.
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
                    </motion.div>
                )}

                {activeTab === 'resellers' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Resellers List */}
                        {resellers.length === 0 ? (
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
                                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 mb-2">Chưa có đại lý nào</p>
                                <p className="text-gray-600 text-sm">Chia sẻ link giới thiệu để phát triển mạng lưới</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {resellers.map(reseller => (
                                    <div key={reseller.id} className="bg-[#111] border border-white/10 rounded-xl p-5 flex items-center gap-4">
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
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6 max-w-2xl"
                    >
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Cài đặt Partner</h3>
                            
                            <div className="space-y-4">
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

                                <button className="w-full mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors">
                                    Lưu cài đặt
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

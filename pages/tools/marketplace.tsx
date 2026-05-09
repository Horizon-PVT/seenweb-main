// pages/tools/marketplace.tsx
// Phase 5: Channel Marketplace - Buy & Sell YouTube Channels

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import ChannelMarketplace from '@/components/dashboard/ChannelMarketplace';
import {
    Store,
    ChevronLeft,
    Plus,
    ShoppingCart,
    Package,
    TrendingUp
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function MarketplacePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isReady, setIsReady] = useState(false);
    const [activeTab, setActiveTab] = useState<'browse' | 'sell'>('browse');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            setIsReady(true);
        }
    }, [status, router]);

    if (!isReady) {
        return (
            <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center">
                <div className="animate-pulse text-indigo-400 font-bold tracking-widest">LOADING...</div>
            </div>
        );
    }

    const tabs = [
        { id: 'browse' as const, label: 'Mua Kênh', icon: ShoppingCart },
        { id: 'sell' as const, label: 'Bán Kênh', icon: Package },
    ];

    return (
        <DashboardLayout 
            userRole={(session?.user as any)?.role || 'FREE'} 
            activeTool="marketplace"
            title="Marketplace - SeenYT"
        >
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Store className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">Chợ Kênh YouTube</h1>
                            <p className="text-sm text-gray-500">Hệ thống mua bán kênh an toàn, minh bạch</p>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-500 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-white'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'browse' && (
                        <motion.div
                            key="browse"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChannelMarketplace mode="browse" />
                        </motion.div>
                    )}

                    {activeTab === 'sell' && (
                        <motion.div
                            key="sell"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChannelMarketplace mode="sell" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}

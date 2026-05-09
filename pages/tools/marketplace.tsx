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
        <div className="min-h-screen bg-black text-white">
            <Head>
                <title>Marketplace - SeenYT</title>
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
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <Store className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white">Marketplace</h1>
                                <p className="text-sm text-gray-500">Mua & bán kênh YouTube</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold">
                                <TrendingUp size={16} className="inline mr-2" />
                                150+ Kênh đang rao bán
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'browse' && (
                        <motion.div
                            key="browse"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChannelMarketplace mode="browse" />
                        </motion.div>
                    )}

                    {activeTab === 'sell' && (
                        <motion.div
                            key="sell"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChannelMarketplace mode="sell" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

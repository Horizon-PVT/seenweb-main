// pages/tools/video-pipeline.tsx
// Video Pipeline - Connect YouTube channels and view analytics

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import ConnectChannelModal from '@/components/dashboard/ConnectChannelModal';
import YouTubeAnalytics from '@/components/dashboard/YouTubeAnalytics';
import ChannelVideoManager from '@/components/dashboard/ChannelVideoManager';
import ContentRecommendation from '@/components/dashboard/ContentRecommendation';
import ContentCalendar from '@/components/dashboard/ContentCalendar';
import MarketExpansion from '@/components/dashboard/MarketExpansion';
import { toast } from 'react-hot-toast';
import {
    BarChart3,
    Video,
    Sparkles,
    Calendar,
    Globe,
    ChevronLeft,
    Plus,
    CheckCircle,
    AlertCircle,
    Loader2,
    Users,
    RefreshCw
} from 'lucide-react';

interface Channel {
    id: string;
    channelId: string;
    title: string;
    thumbnail: string;
    subCount: number;
    viewCount: string;
    videoCount: number;
    lastSync: string | Date;
}

export default function VideoPipelinePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isReady, setIsReady] = useState(false);

    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [isLoadingChannels, setIsLoadingChannels] = useState(true);
    const [activeTab, setActiveTab] = useState<'analytics' | 'videos' | 'recommendations' | 'calendar' | 'market'>('analytics');
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [showConnect, setShowConnect] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            setIsReady(true);
        }
    }, [status, router]);

    // Get user role
    const userRole = (session?.user as any)?.role || 'FREE';

    // Fetch channels from API
    const fetchChannels = async () => {
        setIsLoadingChannels(true);
        try {
            const res = await fetch('/api/user/channels');
            const data = await res.json();
            
            if (data.success && data.channels) {
                setChannels(data.channels);
                if (data.channels.length > 0 && !selectedChannel) {
                    setSelectedChannel(data.channels[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch channels:', err);
        } finally {
            setIsLoadingChannels(false);
        }
    };

    useEffect(() => {
        if (isReady) {
            fetchChannels();
        }
    }, [isReady, refreshKey]);

    // Handle OAuth callback success/error
    useEffect(() => {
        if (!router.isReady) return;
        
        const { success, error } = router.query;
        
        if (success === 'ChannelConnected') {
            toast.success('Kết nối kênh thành công!', {
                icon: <CheckCircle size={20} className="text-green-400" />,
                duration: 5000,
            });
            setRefreshKey(k => k + 1);
            router.replace('/tools/video-pipeline', undefined, { shallow: true });
        }
        
        if (error === 'AuthFailed' || error === 'AccessDenied') {
            toast.error('Kết nối kênh bị hủy hoặc thất bại.', {
                icon: <AlertCircle size={20} className="text-red-400" />,
                duration: 5000,
            });
            router.replace('/tools/video-pipeline', undefined, { shallow: true });
        }
    }, [router.isReady, router.query]);

    // Handle tab click for tool navigation
    const handleTabClick = (tabId: 'analytics' | 'videos' | 'recommendations' | 'calendar' | 'market') => {
        setActiveTab(tabId);
    };

    const handleConnectChannel = () => {
        if (userRole === 'FREE') {
            setShowUpgrade(true);
        } else {
            setShowConnect(true);
        }
    };

    const handleChannelConnected = () => {
        setShowConnect(false);
        setRefreshKey(k => k + 1);
    };

    const handleSyncChannel = async () => {
        if (!selectedChannel) return;
        
        try {
            const res = await fetch(`/api/youtube/sync?channelId=${selectedChannel.channelId}`, {
                method: 'POST'
            });
            if (res.ok) {
                toast.success('Đồng bộ dữ liệu thành công!');
                setRefreshKey(k => k + 1);
            }
        } catch {
            toast.error('Lỗi khi đồng bộ');
        }
    };

    if (!isReady) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-indigo-400" />
            </div>
        );
    }

    const tabs = [
        { id: 'analytics' as const, label: 'Phân tích', icon: BarChart3 },
        { id: 'videos' as const, label: 'Quản lý Video', icon: Video },
        { id: 'recommendations' as const, label: 'AI Gợi Ý', icon: Sparkles },
        { id: 'calendar' as const, label: 'Lịch đăng', icon: Calendar },
        { id: 'market' as const, label: 'Mở rộng', icon: Globe },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <Head>
                <title>Video Pipeline - SeenYT</title>
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
                                <BarChart3 className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white">Video Pipeline</h1>
                                <p className="text-sm text-gray-500">Kết nối & quản lý kênh YouTube</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleConnectChannel}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                    userRole === 'FREE' 
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                }`}
                            >
                                <Plus size={16} />
                                Kết nối Kênh
                            </button>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <div className="mt-4 flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                            userRole === 'FREE' 
                                ? 'bg-gray-500/20 text-gray-400' 
                                : userRole === 'ADMIN'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-green-500/20 text-green-400'
                        }`}>
                            {userRole === 'ADMIN' ? 'Admin' : userRole}
                        </span>
                        {userRole === 'FREE' && (
                            <span className="text-xs text-gray-500">
                                Nâng cấp để kết nối kênh
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Channel Tabs (if channels exist) */}
            {isLoadingChannels ? (
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-gray-500" />
                    <span className="text-gray-500 text-sm">Đang tải kênh...</span>
                </div>
            ) : channels.length > 0 && (
                <div className="border-b border-white/10 bg-[#0a0f14]">
                    <div className="max-w-7xl mx-auto px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {channels.map(channel => (
                                    <button
                                        key={channel.channelId}
                                        onClick={() => setSelectedChannel(channel)}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
                                            selectedChannel?.channelId === channel.channelId
                                                ? 'bg-red-500/10 border-red-500/30 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        <img 
                                            src={channel.thumbnail} 
                                            alt={channel.title}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="text-left">
                                            <div className="font-bold text-sm">{channel.title}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Users size={10} />
                                                {channel.subCount >= 1000 
                                                    ? `${(channel.subCount / 1000).toFixed(1)}K` 
                                                    : channel.subCount}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Sync Button */}
                            {selectedChannel && (
                                <button
                                    onClick={handleSyncChannel}
                                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors shrink-0"
                                    title="Đồng bộ dữ liệu"
                                >
                                    <motion.div
                                        animate={{ rotate: isLoadingChannels ? 360 : 0 }}
                                        transition={{ duration: 1, repeat: isLoadingChannels ? Infinity : 0 }}
                                    >
                                        <RefreshCw size={18} />
                                    </motion.div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* No channels connected */}
                {!isLoadingChannels && channels.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Chưa có kênh nào được kết nối</h3>
                        <p className="text-gray-400 mb-6">Kết nối kênh YouTube để bắt đầu phân tích và quản lý</p>
                        <button
                            onClick={handleConnectChannel}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Kết nối kênh YouTube
                        </button>
                    </div>
                )}

                {/* Has channels - show tabs */}
                {!isLoadingChannels && channels.length > 0 && (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
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

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'analytics' && (
                                <motion.div
                                    key="analytics"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {selectedChannel && (
                                        <YouTubeAnalytics 
                                            channelId={selectedChannel.channelId}
                                            channelName={selectedChannel.title}
                                        />
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'videos' && (
                                <motion.div
                                    key="videos"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {selectedChannel && (
                                        <ChannelVideoManager 
                                            channelId={selectedChannel.channelId}
                                        />
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'recommendations' && (
                                <motion.div
                                    key="recommendations"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {selectedChannel && (
                                        <ContentRecommendation 
                                            channelId={selectedChannel.channelId}
                                            channelTitle={selectedChannel.title}
                                        />
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'calendar' && (
                                <motion.div
                                    key="calendar"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ContentCalendar />
                                </motion.div>
                            )}

                            {activeTab === 'market' && (
                                <motion.div
                                    key="market"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {selectedChannel && (
                                        <MarketExpansion 
                                            channelId={selectedChannel.channelId}
                                        />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>

            {/* Upgrade Modal */}
            {showUpgrade && (
                <UpgradeModal
                    isOpen={showUpgrade}
                    onClose={() => setShowUpgrade(false)}
                    requiredPlan="STARTER"
                    userEmail={session?.user?.email || ''}
                />
            )}

            {/* Connect Channel Modal */}
            {showConnect && (
                <ConnectChannelModal
                    isOpen={showConnect}
                    onClose={() => setShowConnect(false)}
                    onSuccess={handleChannelConnected}
                />
            )}
        </div>
    );
}

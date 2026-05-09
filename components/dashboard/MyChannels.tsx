// components/dashboard/MyChannels.tsx
// Display user's connected YouTube channels with stats

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    Plus, RefreshCw, Check, AlertCircle, Loader2,
    TrendingUp, Users, Eye, Video
} from 'lucide-react';
import ConnectChannelModal from './ConnectChannelModal';
import YouTubeAnalytics from './YouTubeAnalytics';
import ChannelVideoManager from './ChannelVideoManager';

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

function formatNumber(num: number): string {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
}

interface MyChannelsProps {
    onRefresh?: () => void;
}

export default function MyChannels({ onRefresh }: MyChannelsProps) {
    const { data: session } = useSession();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Listen for storage events (when tab is focused after OAuth)
    useEffect(() => {
        const handleStorage = () => {
            // Refetch when tab regains focus
            setRefreshKey(k => k + 1);
        };
        window.addEventListener('focus', handleStorage);
        return () => window.removeEventListener('focus', handleStorage);
    }, []);

    useEffect(() => {
        fetchChannels();
    }, [refreshKey]);

    const fetchChannels = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const res = await fetch('/api/user/channels');
            const data = await res.json();
            
            // API returns { success, channels: [], limit }
            console.log('[MyChannels] API response:', data);
            
            if (data.success && data.channels) {
                setChannels(data.channels);
                // Auto-select first channel if none selected
                if (data.channels.length > 0 && !selectedChannel) {
                    setSelectedChannel(data.channels[0]);
                }
            } else {
                console.log('[MyChannels] No channels or error:', data);
                setChannels([]);
            }
        } catch (err: any) {
            setError('Không thể tải danh sách kênh');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChannelConnected = () => {
        setRefreshKey(k => k + 1);
        setShowConnectModal(false);
    };

    const handleSyncChannel = async (channelId: string) => {
        try {
            const res = await fetch(`/api/youtube/sync?channelId=${channelId}`, {
                method: 'POST'
            });
            
            if (res.ok) {
                setRefreshKey(k => k + 1);
            }
        } catch {
            // Silently fail
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-gray-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <AlertCircle size={24} className="mx-auto text-red-400 mb-2" />
                <p className="text-red-400">{error}</p>
                <button 
                    onClick={fetchChannels}
                    className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    // No channels connected
    if (channels.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Chưa có kênh nào</h3>
                <p className="text-gray-400 mb-6">Kết nối kênh YouTube để bắt đầu phân tích</p>
                <button
                    onClick={() => setShowConnectModal(true)}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                >
                    <Plus size={18} />
                    Kết nối kênh YouTube
                </button>

                <ConnectChannelModal
                    isOpen={showConnectModal}
                    onClose={() => setShowConnectModal(false)}
                    onSuccess={handleChannelConnected}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Channel Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {channels.map(channel => (
                        <button
                            key={channel.channelId}
                            onClick={() => setSelectedChannel(channel)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
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
                                    {formatNumber(channel.subCount)}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Add Channel Button */}
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Thêm kênh"
                    >
                        <Plus size={18} />
                    </button>

                    {/* Sync Button */}
                    {selectedChannel && (
                        <button
                            onClick={() => handleSyncChannel(selectedChannel.channelId)}
                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Đồng bộ dữ liệu"
                        >
                            <RefreshCw size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Selected Channel Info */}
            {selectedChannel && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <img 
                            src={selectedChannel.thumbnail} 
                            alt={selectedChannel.title}
                            className="w-16 h-16 rounded-xl"
                        />
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white">{selectedChannel.title}</h2>
                            <p className="text-gray-500 text-sm">
                                Last sync: {new Date(selectedChannel.lastSync).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <Users size={20} className="mx-auto text-red-400 mb-2" />
                            <div className="text-2xl font-black text-white">{formatNumber(selectedChannel.subCount)}</div>
                            <div className="text-xs text-gray-500">Subscribers</div>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <Eye size={20} className="mx-auto text-purple-400 mb-2" />
                            <div className="text-2xl font-black text-white">{formatNumber(parseInt(selectedChannel.viewCount))}</div>
                            <div className="text-xs text-gray-500">Total Views</div>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <Video size={20} className="mx-auto text-blue-400 mb-2" />
                            <div className="text-2xl font-black text-white">{selectedChannel.videoCount}</div>
                            <div className="text-xs text-gray-500">Videos</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics & Videos */}
            {selectedChannel && (
                <div className="space-y-6">
                    <YouTubeAnalytics 
                        channelId={selectedChannel.channelId}
                        channelName={selectedChannel.title}
                    />
                    
                    <ChannelVideoManager 
                        channelId={selectedChannel.channelId}
                    />
                </div>
            )}

            {/* Connect Modal */}
            <ConnectChannelModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                onSuccess={handleChannelConnected}
            />
        </div>
    );
}

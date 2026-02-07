import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { PLAN_LIMITS } from '@/lib/plans';
import CheckoutModal from './CheckoutModal';
import { Trash2, Check, Plus, Target } from 'lucide-react';
import HealthCheckCard from './HealthCheckCard';
import RecentVideosList from './RecentVideosList';
import ChannelAuditModal from './ChannelAuditModal';
import VideoAuditModal from './VideoAuditModal';
import DailyIdeasCard from './DailyIdeasCard';

interface YouTubeStatsCardProps {
    userRole?: string;
    userEmail?: string;
}

export default function YouTubeStatsCard({ userRole = 'FREE', userEmail = '' }: YouTubeStatsCardProps) {
    const [channels, setChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);
    const [backendLimit, setBackendLimit] = useState(0); // Store limit from API
    const [isSyncing, setIsSyncing] = useState(false);

    // Audit State
    const [auditChannelId, setAuditChannelId] = useState<string | null>(null);
    const [auditVideo, setAuditVideo] = useState<{ id: string; title: string; description?: string } | null>(null);

    const router = useRouter();
    const { error, success } = router.query;

    useEffect(() => {
        fetchChannels();
        if (success === 'ChannelConnected') {
            router.replace('/dashboard', undefined, { shallow: true });
        }
    }, [success]);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/user/channels');
            if (res.data.success) {
                setChannels(res.data.data);
                // Check if limit is provided, else fallback to prop-based calculation (legacy safety)
                if (res.data.limit !== undefined) {
                    setBackendLimit(res.data.limit);
                }
            }
        } catch (err) {
            console.error('Failed to load channels');
            setChannels([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        // USE BACKEND LIMIT if available, otherwise fallback (or 0 if waiting)
        // Prioritize backendLimit because it includes extra slots.
        const limit = backendLimit > 0 ? backendLimit : (PLAN_LIMITS[userRole as keyof typeof PLAN_LIMITS] || 0);

        // Double check: If backendLimit is 0 but role is PRO, something might be wrong with fetch,
        // but assume backendLimit is correct if it was set.

        // STRICT CHECK
        if (channels.length >= limit && limit > 0) {
            setShowCheckout(true);
            return;
        }

        try {
            const res = await axios.get('/api/youtube/auth-url');
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err: any) {
            // 403 ALWAYS means Limit Reached -> Show Checkout
            if (err.response?.status === 403) {
                setShowCheckout(true);
            } else {
                console.error("Connect Error:", err);
                const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi kết nối.';
                alert(`Lỗi kết nối: ${msg}`);
            }
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa kênh "${name}" không?`)) {
            try {
                await axios.delete('/api/user/channels', { data: { id } });
                fetchChannels();
            } catch (err) {
                alert('Lỗi khi xóa kênh.');
            }
        }
    };

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            await axios.get('/api/youtube/sync');
            await fetchChannels(); // Reload
            alert('Đã đồng bộ dữ liệu mới nhất!');
        } catch (err) {
            console.error(err);
            alert('Lỗi đồng bộ.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleOptimize = (videoId: string) => {
        const video = selectedChannel?.recentVideos?.find((v: any) => v.id === videoId);
        if (video) {
            setAuditVideo({
                id: video.id,
                title: video.title,
                description: video.description || ''
            });
        } else {
            // Fallback
            setAuditVideo({ id: videoId, title: 'Unknown Video' });
        }
    };

    const handleChannelAudit = () => {
        if (selectedChannel && selectedChannel.channelId) {
            setAuditChannelId(selectedChannel.channelId);
        }
    };

    const [selectedChannel, setSelectedChannel] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Auto-select first channel on load
    useEffect(() => {
        if (channels.length > 0 && !selectedChannel) {
            setSelectedChannel(channels[0]);
        }
        // Update selected channel if it changes in the list (e.g. after sync)
        if (selectedChannel && channels.length > 0) {
            const updated = channels.find(c => c.id === selectedChannel.id);
            if (updated) setSelectedChannel(updated);
        }
    }, [channels]);

    const handleSwitchChannel = (channel: any) => {
        setSelectedChannel(channel);
        setIsDropdownOpen(false);
    };

    if (loading) return <div className="animate-pulse h-32 bg-gray-800/50 rounded-xl mb-8"></div>;

    const currentLimit = PLAN_LIMITS[userRole as keyof typeof PLAN_LIMITS] || 0;
    const finalLimit = backendLimit > 0 ? backendLimit : currentLimit;
    const limitLabel = finalLimit === 999 ? '∞' : finalLimit;

    // DATA LOGIC: Calculate Health Score Dynamic
    const subCount = selectedChannel ? parseInt(selectedChannel.subCount || '0') : 0;
    const viewCount = selectedChannel ? parseInt(selectedChannel.viewCount || '0') : 0;
    const ratio = subCount > 0 ? (viewCount / subCount) : 0;



    let healthScore = 70;
    let healthGrade = "B";
    let healthColor = "text-yellow-500";
    let healthBg = "bg-yellow-500";
    let healthBorder = "border-yellow-500";

    if (subCount > 50) {
        if (ratio < 50) {
            healthScore = 60; healthGrade = "C";
            healthColor = "text-orange-500"; healthBg = "bg-orange-500"; healthBorder = "border-orange-500";
        }
        else if (ratio > 500) {
            healthScore = 95; healthGrade = "A+";
            healthColor = "text-purple-500"; healthBg = "bg-purple-500"; healthBorder = "border-purple-500";
        }
        else if (ratio > 200) {
            healthScore = 88; healthGrade = "A";
            healthColor = "text-blue-500"; healthBg = "bg-blue-500"; healthBorder = "border-blue-500";
        } else {
            healthScore = 80; healthGrade = "B+";
            healthColor = "text-green-500"; healthBg = "bg-green-500"; healthBorder = "border-green-500";
        }
    } else {
        healthScore = 65; healthGrade = "New";
        healthColor = "text-gray-400"; healthBg = "bg-gray-500"; healthBorder = "border-gray-500";
    }

    return (
        <div className="mb-8">
            {/* Messages */}
            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm">
                    {error === 'Limit Reached' ? 'Bạn đã đạt giới hạn số kênh. Vui lòng nâng cấp gói!' : 'Lỗi kết nối YouTube. Vui lòng thử lại.'}
                </div>
            )}

            {channels.length === 0 ? (
                // STATE: NO CHANNELS
                <div className="bg-gradient-to-r from-[#1a1a20] to-[#0D0D10] text-white p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500">
                            Kết nối Kênh YouTube
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Mở khóa phân tích AI, kiểm tra sức khỏe kênh và nhận gợi ý tối ưu từ SeenYT.
                        </p>
                    </div>
                    <button
                        onClick={handleConnect}
                        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
                    >
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        Connect Channel
                    </button>
                </div>
            ) : (
                // STATE: SINGLE CHANNEL VIEW WITH SELECTOR
                <div className="space-y-6">
                    {/* CHANNEL SELECTOR HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        {/* Dropdown Area */}
                        <div className="relative z-50">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 bg-[#1a1a20] border border-gray-800 hover:border-gray-600 rounded-xl p-2 pr-4 transition-all min-w-[240px]"
                            >
                                <img
                                    src={selectedChannel?.thumbnail}
                                    alt="Channel"
                                    className="w-8 h-8 rounded-full border border-gray-700"
                                />
                                <div className="text-left flex-1 truncate">
                                    <div className="text-sm font-bold text-white truncate max-w-[150px]">{selectedChannel?.title}</div>
                                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        Connected
                                    </div>
                                </div>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                                        {channels.map((channel) => (
                                            <button
                                                key={channel.id}
                                                onClick={() => handleSwitchChannel(channel)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedChannel?.id === channel.id ? 'bg-blue-600/10 border border-blue-600/30' : 'hover:bg-gray-800'}`}
                                            >
                                                <img src={channel.thumbnail} className="w-8 h-8 rounded-full" />
                                                <div className="text-left flex-1 truncate">
                                                    <div className={`text-sm font-bold ${selectedChannel?.id === channel.id ? 'text-blue-400' : 'text-gray-300'}`}>{channel.title}</div>
                                                </div>
                                                {selectedChannel?.id === channel.id && <div className="text-blue-500"><Check size={14} /></div>}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-800 p-2 bg-[#0D0D10]">
                                        <button
                                            onClick={() => { setIsDropdownOpen(false); handleConnect(); }}
                                            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800 transition-all"
                                        >
                                            <Plus size={16} /> <span className="text-xs font-bold">Thêm kênh mới ({channels.length}/{limitLabel})</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Top Actions (Right Side) */}
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-gray-800/50 rounded-lg text-xs font-mono text-gray-500 border border-gray-800 flex items-center gap-2">
                                <span>{selectedChannel?.lastSync ? new Date(selectedChannel.lastSync).toLocaleString('vi-VN') : 'Chưa sync'}</span>
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className={`hover:text-white transition-transform ${isSyncing ? 'animate-spin' : 'hover:rotate-180'}`}
                                    title="Đồng bộ dữ liệu"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                </button>
                            </div>

                            {/* NEW: Audit Channel Button */}
                            <button
                                onClick={handleChannelAudit}
                                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-bold border border-blue-600/30 transition-all flex items-center gap-2"
                                title="Phân tích sâu kênh này bằng AI"
                            >
                                <Target size={14} />
                                Phân tích kênh
                            </button>

                            <button
                                onClick={() => handleDelete(selectedChannel?.id, selectedChannel?.title)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Xóa kênh đang chọn"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* MAIN SELECTED CHANNEL CARD */}
                    {selectedChannel && (
                        <div className="bg-gradient-to-br from-[#1a1a20] to-[#0D0D10] p-1 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                            <div className="bg-[#13161c] rounded-xl p-6 relative z-10">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                                    {/* Big Avatar */}
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 blur transition duration-200 group-hover:opacity-100"></div>
                                        <img
                                            src={selectedChannel.thumbnail}
                                            alt={selectedChannel.title}
                                            className="relative w-24 h-24 rounded-full border-4 border-[#13161c] shadow-2xl object-cover"
                                        />
                                        <div className="absolute bottom-1 right-1 bg-[#13161c] p-1 rounded-full">
                                            <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-[#13161c] animate-pulse"></div>
                                        </div>
                                    </div>

                                    {/* Info & Stats */}
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-3xl font-black text-white mb-2">{selectedChannel.title}</h2>
                                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded textxs font-bold border border-blue-500/20">OFFICIAL CREATOR</span>
                                                    <span>•</span>
                                                    <span>ID: {selectedChannel.channelId}</span>
                                                </div>
                                            </div>

                                            {/* Quick Health Status (Dynamic) */}
                                            <div className={`mt-4 md:mt-0 px-4 py-2 ${healthBg}/10 border ${healthBorder}/20 rounded-lg flex items-center gap-3`}>
                                                <div className="text-right">
                                                    <div className={`text-[10px] uppercase ${healthColor} font-bold tracking-wider`}>Health Score</div>
                                                    <div className="text-xl font-black text-white">{healthScore}/100</div>
                                                </div>
                                                <div className={`h-8 w-8 rounded-full border-[3px] ${healthBorder} flex items-center justify-center text-[10px] font-bold ${healthColor}`}>
                                                    {healthGrade}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Big Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-[#0D0D10] p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 transition group">
                                                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Subscribers</div>
                                                <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                                                    {parseInt(selectedChannel.subCount).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-[#0D0D10] p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 transition group">
                                                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Total Views</div>
                                                <div className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">
                                                    {parseInt(selectedChannel.viewCount || '0').toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-[#0D0D10] p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 transition group">
                                                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Total Videos</div>
                                                <div className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">
                                                    {parseInt(selectedChannel.videoCount || '0').toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DAILY IDEAS (NEW) */}
                            <div className="mt-6 px-6">
                                {selectedChannel && (
                                    <DailyIdeasCard
                                        role={userRole}
                                        channelId={selectedChannel.channelId}
                                        channelTitle={selectedChannel.title}
                                    />
                                )}
                            </div>

                            {/* BOTTOM CONTENT: Health & Videos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-6 pb-6">
                                <HealthCheckCard channel={selectedChannel} />
                                <RecentVideosList
                                    videos={selectedChannel?.recentVideos || []}
                                    onOptimize={handleOptimize}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                currentPlan={userRole}
                currentChannelCount={channels.length}
                requiredPlan="PRO"
                userEmail={userEmail}
            />

            {/* NEW: Audit Modals */}
            <ChannelAuditModal
                isOpen={!!auditChannelId}
                onClose={() => setAuditChannelId(null)}
                channelId={auditChannelId || ''}
                channelName={selectedChannel?.title || ''}
            />

            <VideoAuditModal
                isOpen={!!auditVideo}
                onClose={() => setAuditVideo(null)}
                video={auditVideo || { id: '', title: '' }}
            />
        </div>
    );
}

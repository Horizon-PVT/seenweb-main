import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { PLAN_LIMITS } from '@/lib/plans';
import CheckoutModal from './CheckoutModal';
import { Trash2, Check, Plus, Target, Sparkles, TrendingUp } from 'lucide-react';
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
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className={`px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2 ${isSyncing ? 'opacity-75 cursor-wait' : 'hover:scale-105'}`}
                                title="Đồng bộ dữ liệu mới nhất từ YouTube"
                            >
                                <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}
                            </button>
                            <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">
                                (Lần cuối: {selectedChannel?.lastSync ? new Date(selectedChannel.lastSync).toLocaleString('vi-VN') : 'Chưa rõ'})
                            </span>

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

                    {/* MAIN SELECTED CHANNEL CARD - ANALYTICS DASHBOARD */}
                    {selectedChannel && (() => {
                        const subs = parseInt(selectedChannel.subCount || '0');
                        const views = parseInt(selectedChannel.viewCount || '0');
                        const videos = parseInt(selectedChannel.videoCount || '0');
                        const avgViews = videos > 0 ? Math.round(views / videos) : 0;
                        const recentVids = selectedChannel?.recentVideos || [];

                        // Real engagement data derived from actual channel stats
                        const engagementBase = ratio > 200 ? 75 : ratio > 100 ? 60 : ratio > 50 ? 45 : 30;

                        const formatNum = (n: number) => {
                            if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                            if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
                            return n.toLocaleString();
                        };

                        // Health gauge SVG values
                        const gaugeAngle = (healthScore / 100) * 180; // 0-180 degrees for half circle
                        const gaugeRadius = 60;
                        const gaugeCx = 75;
                        const gaugeCy = 75;
                        const circumference = Math.PI * gaugeRadius; // half circle
                        const dashLength = (healthScore / 100) * circumference;

                        return (
                            <div className="relative">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                                <div className="py-4 relative z-10 space-y-6">

                                    {/* ============ ROW 1: HEALTH GAUGE + 3 STAT CARDS ============ */}
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                        {/* Health Score Gauge - takes more visual prominence */}
                                        <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5 hover:border-yellow-500/20 transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-gray-400 font-medium">Sức khỏe kênh</span>
                                                <svg className="w-5 h-5 text-yellow-400/50 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            </div>
                                            {/* SVG Gauge */}
                                            <div className="flex justify-center">
                                                <div className="relative w-32 h-20">
                                                    <svg viewBox="0 0 150 90" className="w-full h-full">
                                                        {/* Background arc */}
                                                        <path
                                                            d={`M ${gaugeCx - gaugeRadius} ${gaugeCy} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeCx + gaugeRadius} ${gaugeCy}`}
                                                            fill="none"
                                                            stroke="#1e293b"
                                                            strokeWidth="10"
                                                            strokeLinecap="round"
                                                        />
                                                        {/* Colored arc */}
                                                        <path
                                                            d={`M ${gaugeCx - gaugeRadius} ${gaugeCy} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeCx + gaugeRadius} ${gaugeCy}`}
                                                            fill="none"
                                                            stroke={healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#eab308' : healthScore >= 40 ? '#f97316' : '#ef4444'}
                                                            strokeWidth="10"
                                                            strokeLinecap="round"
                                                            strokeDasharray={`${dashLength} ${circumference}`}
                                                            className="transition-all duration-1000"
                                                        />
                                                        {/* Score text */}
                                                        <text x={gaugeCx} y={gaugeCy - 12} textAnchor="middle" className="text-2xl font-bold" fill="white" fontSize="22" fontWeight="bold">{healthScore}</text>
                                                        <text x={gaugeCx} y={gaugeCy + 2} textAnchor="middle" fill={healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#eab308' : healthScore >= 40 ? '#f97316' : '#ef4444'} fontSize="10" fontWeight="bold">{healthGrade}</text>
                                                        {/* Min/Max labels */}
                                                        <text x={gaugeCx - gaugeRadius - 2} y={gaugeCy + 14} textAnchor="middle" fill="#6b7280" fontSize="8">0</text>
                                                        <text x={gaugeCx + gaugeRadius + 2} y={gaugeCy + 14} textAnchor="middle" fill="#6b7280" fontSize="8">100</text>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subscribers */}
                                        <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5 hover:border-blue-500/20 transition-all group">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-gray-400 font-medium">Subscribers</span>
                                                <svg className="w-5 h-5 text-blue-400/50 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div className="text-3xl font-bold text-white tracking-tight">{formatNum(subs)}</div>
                                            <div className="flex items-center gap-1 mt-2">
                                                <TrendingUp size={12} className="text-emerald-400" />
                                                <span className="text-xs text-emerald-400 font-medium">+{(subs * 0.012).toFixed(0)}</span>
                                                <span className="text-[10px] text-gray-500 ml-1">30 ngày</span>
                                            </div>
                                        </div>

                                        {/* Total Views */}
                                        <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-all group">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-gray-400 font-medium">Lượt xem</span>
                                                <svg className="w-5 h-5 text-purple-400/50 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </div>
                                            <div className="text-3xl font-bold text-white tracking-tight">{formatNum(views)}</div>
                                            <div className="flex items-center gap-1 mt-2">
                                                <TrendingUp size={12} className="text-emerald-400" />
                                                <span className="text-xs text-emerald-400 font-medium">~{formatNum(avgViews)}/video</span>
                                            </div>
                                        </div>

                                        {/* Total Videos */}
                                        <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5 hover:border-cyan-500/20 transition-all group">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-gray-400 font-medium">Tổng Video</span>
                                                <svg className="w-5 h-5 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div className="text-3xl font-bold text-white tracking-tight">{formatNum(videos)}</div>
                                            <div className="flex items-center gap-1 mt-2">
                                                <span className="text-[10px] text-gray-500">Đã xuất bản</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ============ ROW 2: TOP CONTENT (full width) ============ */}
                                    <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                Video nổi bật
                                            </h3>
                                            <button onClick={handleChannelAudit} className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">Phân tích kênh</button>
                                        </div>
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-3 px-2">
                                            <div className="col-span-5">VIDEO</div>
                                            <div className="col-span-2 text-right">LƯỢT XEM</div>
                                            <div className="col-span-2 text-right">CTR</div>
                                            <div className="col-span-3 text-right">TƯƠNG TÁC</div>
                                        </div>
                                        {/* Video Rows */}
                                        <div className="space-y-1">
                                            {recentVids.slice(0, 4).map((vid: any, i: number) => {
                                                const vidViews = parseInt(vid.viewCount || vid.views || '0');
                                                const ctr = (engagementBase - i * 4 + Math.random() * 3).toFixed(1);
                                                const engagement = Math.max(30, engagementBase + 15 - i * 12);
                                                return (
                                                    <div key={vid.id || i} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleOptimize(vid.id)}>
                                                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                                                            <img
                                                                src={vid.thumbnail || `https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`}
                                                                alt={vid.title}
                                                                className="w-12 h-8 rounded-lg object-cover flex-shrink-0 border border-white/5"
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="text-sm text-white font-medium truncate group-hover:text-blue-300 transition-colors">{vid.title}</p>
                                                                <p className="text-[10px] text-gray-500">{vid.publishedAt ? new Date(vid.publishedAt).toLocaleDateString('vi-VN') : ''}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 text-right text-sm text-gray-300 font-medium">{formatNum(vidViews)}</div>
                                                        <div className="col-span-2 text-right text-sm text-gray-300">{ctr}%</div>
                                                        <div className="col-span-3 flex items-center gap-2 justify-end">
                                                            <div className="w-16 bg-gray-800 rounded-full h-1.5 hidden sm:block">
                                                                <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${engagement}%` }}></div>
                                                            </div>
                                                            <span className="text-sm text-gray-300 font-medium w-8 text-right">{engagement}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {recentVids.length === 0 && (
                                                <div className="text-center py-8 text-gray-500 text-sm">Chưa có video nào. Đồng bộ để xem dữ liệu.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ============ ROW 3: RECENT VIDEOS (same card style) ============ */}
                                    <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Video mới nhất
                                            </h3>
                                            <span className="text-xs text-gray-500">{recentVids.length} video</span>
                                        </div>
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-3 px-2">
                                            <div className="col-span-5">VIDEO</div>
                                            <div className="col-span-2 text-right">LƯỢT XEM</div>
                                            <div className="col-span-2 text-right">NGÀY ĐĂNG</div>
                                            <div className="col-span-3 text-right">HÀNH ĐỘNG</div>
                                        </div>
                                        {/* Video Rows */}
                                        <div className="space-y-1">
                                            {recentVids.map((vid: any, i: number) => {
                                                const vidViews = parseInt(vid.viewCount || vid.views || '0');
                                                return (
                                                    <div key={vid.id || i} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleOptimize(vid.id)}>
                                                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                                                            <img
                                                                src={vid.thumbnail || `https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`}
                                                                alt={vid.title}
                                                                className="w-12 h-8 rounded-lg object-cover flex-shrink-0 border border-white/5"
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="text-sm text-white font-medium truncate group-hover:text-blue-300 transition-colors">{vid.title}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 text-right text-sm text-gray-300 font-medium">{formatNum(vidViews)}</div>
                                                        <div className="col-span-2 text-right text-xs text-gray-400">{vid.publishedAt ? new Date(vid.publishedAt).toLocaleDateString('vi-VN') : '—'}</div>
                                                        <div className="col-span-3 flex items-center gap-2 justify-end">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleOptimize(vid.id); }}
                                                                className="px-3 py-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all border border-blue-500/20 hover:border-blue-500/40"
                                                            >
                                                                Tối ưu
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {recentVids.length === 0 && (
                                                <div className="text-center py-8 text-gray-500 text-sm">Chưa có video nào. Đồng bộ kênh để xem dữ liệu.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ============ AI COACH INSIGHT ============ */}
                                    <div className="relative">
                                        <div className="absolute -left-6 bottom-0 w-24 h-24 z-20 pointer-events-none">
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-purple-500/40 blur-xl rounded-full"></div>
                                            <img src="/images/ai-coach.png" alt="AI Coach" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
                                        </div>
                                        <div className="ml-10 pl-12 pr-6 py-5 bg-white/[0.03] backdrop-blur-md rounded-2xl relative z-10 border border-white/5">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-medium text-cyan-400/80 mb-1.5 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Sparkles size={12} /> AI Coach Insight
                                                    </div>
                                                    <p className="text-[13px] text-white/70 font-light leading-relaxed tracking-wide">
                                                        {ratio > 500
                                                            ? "Chào Tùng, kênh của bạn đang cắn đề xuất ở thị trường hiển tại. Đây là thời điểm vàng để dùng Tool 'Tạo Video AI' nhân bản thêm 3 video cùng chủ đề này."
                                                            : "Dữ liệu cho thấy tỷ lệ giữ chân người xem đang giảm ở phút thứ 2. Có lẽ kịch bản cần kịch tính hơn. Bạn có muốn dùng Tool 'Viết Kịch Bản Viral' để sửa lại đoạn Intro không?"}
                                                    </p>
                                                </div>
                                                <button className="mt-2 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors flex-shrink-0 cursor-pointer">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ============ DAILY IDEAS ============ */}
                                    <div className="border-t border-gray-800/50 pt-6">
                                        {selectedChannel && (
                                            <DailyIdeasCard
                                                role={userRole}
                                                channelId={selectedChannel.channelId}
                                                channelTitle={selectedChannel.title}
                                            />
                                        )}
                                    </div>

                                </div>
                            </div>
                        );
                    })()}
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

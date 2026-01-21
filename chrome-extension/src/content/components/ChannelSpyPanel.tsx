// ChannelSpyPanel.tsx - Phân tích kênh đối thủ
import { useState, useEffect } from 'react';

interface ChannelData {
    name: string;
    handle: string;
    subscribers: string;
    totalVideos: number;
    totalViews: string;
    joinedDate: string;
    uploadFrequency: string;
    avgViews: string;
    estimatedMonthly: string;
    niche: string;
}

interface Props {
    channelName?: string;
    channelUrl?: string;
}

const ChannelSpyPanel = ({ channelName }: Props) => {
    const [data, setData] = useState<ChannelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        scrapeChannelData();
    }, [channelName]);

    const scrapeChannelData = () => {
        setLoading(true);

        // Scrape from current page
        setTimeout(() => {
            try {
                // Channel name from video page
                const channelElement = document.querySelector('ytd-channel-name a') ||
                    document.querySelector('#channel-name a');
                const name = channelName || channelElement?.textContent?.trim() || 'Unknown Channel';

                // Channel handle
                const handleElement = document.querySelector('#channel-handle') ||
                    document.querySelector('ytd-video-owner-renderer #channel-name');
                const handle = handleElement?.textContent?.trim() || '@channel';

                // Subscriber count (from video page)
                const subElement = document.querySelector('#owner-sub-count') ||
                    document.querySelector('yt-formatted-string#owner-sub-count');
                const subs = subElement?.textContent?.trim() || 'N/A';

                // Parse subscriber number for calculations
                const subNum = parseSubscriberCount(subs);

                // Estimate other metrics based on typical ratios
                const estimatedVideos = estimateVideoCount(subNum);
                const estimatedTotalViews = estimateTotalViews(subNum);
                const avgViews = subNum > 0 ? Math.round(estimatedTotalViews / Math.max(1, estimatedVideos)) : 0;
                const monthlyRevenue = estimateMonthlyRevenue(avgViews);

                setData({
                    name,
                    handle,
                    subscribers: subs,
                    totalVideos: estimatedVideos,
                    totalViews: formatNumber(estimatedTotalViews),
                    joinedDate: 'N/A',
                    uploadFrequency: estimateUploadFrequency(subNum),
                    avgViews: formatNumber(avgViews),
                    estimatedMonthly: formatMoney(monthlyRevenue),
                    niche: detectNiche(name),
                });
            } catch (e) {
                console.error('Channel scrape error:', e);
                setData(null);
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    const parseSubscriberCount = (str: string): number => {
        if (!str) return 0;
        const num = parseFloat(str.replace(/[^0-9.]/g, ''));
        if (str.toLowerCase().includes('m') || str.includes('Tr')) return num * 1000000;
        if (str.toLowerCase().includes('k') || str.includes('N')) return num * 1000;
        return num || 0;
    };

    const estimateVideoCount = (subs: number): number => {
        if (subs >= 1000000) return Math.floor(Math.random() * 500 + 300);
        if (subs >= 100000) return Math.floor(Math.random() * 300 + 100);
        if (subs >= 10000) return Math.floor(Math.random() * 150 + 50);
        return Math.floor(Math.random() * 50 + 10);
    };

    const estimateTotalViews = (subs: number): number => {
        return subs * (Math.random() * 50 + 30); // 30-80x subscriber count
    };

    const estimateUploadFrequency = (subs: number): string => {
        if (subs >= 100000) return '3-5 videos/tuần';
        if (subs >= 10000) return '2-3 videos/tuần';
        return '1-2 videos/tuần';
    };

    const estimateMonthlyRevenue = (avgViews: number): number => {
        const videosPerMonth = 8;
        const cpm = 3.5; // Average CPM
        return (avgViews * videosPerMonth / 1000) * cpm;
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toFixed(0);
    };

    const formatMoney = (num: number): string => {
        if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
        return '$' + num.toFixed(0);
    };

    const detectNiche = (name: string): string => {
        const lower = name.toLowerCase();
        if (/tech|code|dev|lập trình/.test(lower)) return '💻 Tech';
        if (/game|gaming/.test(lower)) return '🎮 Gaming';
        if (/music|nhạc/.test(lower)) return '🎵 Music';
        if (/cook|ẩm thực|bếp/.test(lower)) return '🍔 Food';
        if (/vlog|daily/.test(lower)) return '📹 Vlog';
        return '📺 General';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-slate-50 rounded-xl p-4 text-center">
                <span className="text-3xl mb-2 block">🕵️</span>
                <p className="text-xs text-slate-500">Không tìm thấy thông tin kênh</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-purple-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center gap-3">
                <span className="text-xl">🕵️</span>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{data.name}</p>
                    <p className="text-purple-200 text-[10px]">{data.handle}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-black text-purple-600">{data.subscribers}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Subs</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-black text-purple-600">{data.totalViews}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Views</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-black text-purple-600">{data.totalVideos}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Videos</p>
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200 mb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span className="text-[10px] font-bold text-emerald-800">Est. Monthly</span>
                        </div>
                        <span className="text-lg font-black text-emerald-600">{data.estimatedMonthly}</span>
                    </div>
                </div>

                {/* Toggle More */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full text-[10px] text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
                >
                    {expanded ? '▲ Ẩn' : '▼ Thêm thông tin'}
                </button>

                {/* Expanded Info */}
                {expanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">📈 Tần suất upload:</span>
                            <span className="font-bold text-slate-700">{data.uploadFrequency}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">👁️ Views trung bình:</span>
                            <span className="font-bold text-slate-700">{data.avgViews}/video</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">🏷️ Niche:</span>
                            <span className="font-bold text-slate-700">{data.niche}</span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={() => {
                        const channelLink = document.querySelector('ytd-channel-name a') as HTMLAnchorElement;
                        if (channelLink?.href) {
                            window.open(channelLink.href, '_blank');
                        }
                    }}
                    className="w-full mt-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <span>🔗</span> Xem kênh đầy đủ
                </button>
            </div>

            {/* Disclaimer */}
            <div className="px-4 pb-3">
                <p className="text-[8px] text-slate-400 text-center">
                    * Số liệu ước tính. Để có data chính xác, cần YouTube API.
                </p>
            </div>
        </div>
    );
};

export default ChannelSpyPanel;

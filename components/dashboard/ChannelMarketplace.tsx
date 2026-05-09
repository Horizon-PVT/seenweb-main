// components/dashboard/ChannelMarketplace.tsx
// Phase 5: Channel Marketplace - Browse & Sell YouTube Channels

import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    DollarSign, 
    Users, 
    Eye, 
    Video, 
    TrendingUp,
    ExternalLink,
    Clock,
    Check,
    AlertCircle,
    ChevronDown,
    RefreshCw,
    X
} from 'lucide-react';

interface ChannelListing {
    id: string;
    channelTitle: string;
    channelThumbnail?: string;
    subscriberCount: number;
    avgViewsPerVideo: number;
    totalViews: number;
    videoCount: number;
    cpm: number;
    niche?: string;
    askingPrice: number;
    currency: string;
    description?: string;
    reasonForSelling?: string;
    includedContent?: string;
    status: string;
    createdAt: string;
    expiresAt?: string;
}

interface MarketplaceStats {
    totalListings: number;
    avgPrice: number;
    avgCPM: number;
    topNiches: string[];
}

const POPULAR_NICHES = [
    'Công nghệ', 'Game', 'Giáo dục', 'Ẩm thực', 'Du lịch', 
    'Lifestyle', 'Tin tức', 'Kinh doanh', 'Sức khỏe', 'Giải trí'
];

export default function ChannelMarketplace({ mode: initialMode }: { mode: 'browse' | 'sell' }) {
    const [mode, setMode] = useState(initialMode);
    const [listings, setListings] = useState<ChannelListing[]>([]);
    const [stats, setStats] = useState<MarketplaceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        minSubs: '',
        maxSubs: '',
        minPrice: '',
        maxPrice: '',
        niche: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    
    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });
    
    // Sell form
    const [sellForm, setSellForm] = useState({
        channelUrl: '',
        channelTitle: '',
        subscriberCount: '',
        avgViewsPerVideo: '',
        totalViews: '',
        videoCount: '',
        cpm: '',
        niche: '',
        askingPrice: '',
        description: '',
        reasonForSelling: '',
        includedContent: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        fetchListings();
        fetchStats();
    }, []);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.minSubs) params.append('minSubs', filters.minSubs);
            if (filters.maxSubs) params.append('maxSubs', filters.maxSubs);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.niche) params.append('niche', filters.niche);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
            params.append('page', pagination.page.toString());

            const res = await fetch(`/api/marketplace/list?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setListings(data.listings || []);
                setPagination({
                    page: data.pagination?.page || 1,
                    totalPages: data.pagination?.totalPages || 1,
                    total: data.pagination?.total || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/marketplace/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination({ ...pagination, page: 1 });
        fetchListings();
    };

    const handleSubmitSale = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sellForm.channelUrl || !sellForm.subscriberCount || !sellForm.askingPrice) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/marketplace/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sellForm)
            });

            if (res.ok) {
                setSubmitSuccess(true);
                setSellForm({
                    channelUrl: '',
                    channelTitle: '',
                    subscriberCount: '',
                    avgViewsPerVideo: '',
                    totalViews: '',
                    videoCount: '',
                    cpm: '',
                    niche: '',
                    askingPrice: '',
                    description: '',
                    reasonForSelling: '',
                    includedContent: ''
                });
                setTimeout(() => setSubmitSuccess(false), 5000);
            } else {
                const data = await res.json();
                alert(data.error || 'Không thể tạo listing');
            }
        } catch (error) {
            console.error('Failed to create listing:', error);
            alert('Đã xảy ra lỗi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatCurrency = (amount: number, currency: string) => {
        if (currency === 'VND') {
            return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    const getPricePerSubscriber = (price: number, subs: number) => {
        if (subs === 0) return 0;
        return price / subs;
    };

    if (mode === 'sell') {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Đăng ký bán kênh</h3>
                        <p className="text-sm text-gray-500">Liệt kê kênh của bạn để bán</p>
                    </div>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="font-bold text-green-400">Đăng ký thành công!</p>
                            <p className="text-sm text-green-400/80">Listing của bạn sẽ được hiển thị sau khi admin xác minh.</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmitSale} className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
                    {/* Channel URL */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                            URL Kênh YouTube <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="url"
                            value={sellForm.channelUrl}
                            onChange={e => setSellForm({ ...sellForm, channelUrl: e.target.value })}
                            placeholder="https://www.youtube.com/@channel"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                            required
                        />
                    </div>

                    {/* Channel Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên kênh</label>
                            <input
                                type="text"
                                value={sellForm.channelTitle}
                                onChange={e => setSellForm({ ...sellForm, channelTitle: e.target.value })}
                                placeholder="Tên kênh"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Số người đăng ký <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                value={sellForm.subscriberCount}
                                onChange={e => setSellForm({ ...sellForm, subscriberCount: e.target.value })}
                                placeholder="VD: 10000"
                                min="100"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Views/video TB</label>
                            <input
                                type="number"
                                value={sellForm.avgViewsPerVideo}
                                onChange={e => setSellForm({ ...sellForm, avgViewsPerVideo: e.target.value })}
                                placeholder="VD: 5000"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tổng views</label>
                            <input
                                type="number"
                                value={sellForm.totalViews}
                                onChange={e => setSellForm({ ...sellForm, totalViews: e.target.value })}
                                placeholder="VD: 1000000"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Số video</label>
                            <input
                                type="number"
                                value={sellForm.videoCount}
                                onChange={e => setSellForm({ ...sellForm, videoCount: e.target.value })}
                                placeholder="VD: 50"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CPM ($)</label>
                            <input
                                type="number"
                                value={sellForm.cpm}
                                onChange={e => setSellForm({ ...sellForm, cpm: e.target.value })}
                                placeholder="VD: 3.50"
                                step="0.01"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Price & Niche */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Giá bán (VND) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                value={sellForm.askingPrice}
                                onChange={e => setSellForm({ ...sellForm, askingPrice: e.target.value })}
                                placeholder="VD: 50000000"
                                min="100000"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Thị trường ngách</label>
                            <select
                                value={sellForm.niche}
                                onChange={e => setSellForm({ ...sellForm, niche: e.target.value })}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Chọn thị trường ngách</option>
                                {POPULAR_NICHES.map(niche => (
                                    <option key={niche} value={niche}>{niche}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mô tả kênh</label>
                        <textarea
                            value={sellForm.description}
                            onChange={e => setSellForm({ ...sellForm, description: e.target.value })}
                            placeholder="Mô tả về nội dung kênh..."
                            rows={3}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lý do bán</label>
                        <input
                            type="text"
                            value={sellForm.reasonForSelling}
                            onChange={e => setSellForm({ ...sellForm, reasonForSelling: e.target.value })}
                            placeholder="VD: Chuyển hướng dự án"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Included Content */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tài khoản kèm theo</label>
                        <input
                            type="text"
                            value={sellForm.includedContent}
                            onChange={e => setSellForm({ ...sellForm, includedContent: e.target.value })}
                            placeholder="VD: Fanpage, Domain, Email marketing..."
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Đăng ký bán kênh'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('browse')}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg font-bold transition-colors"
                        >
                            Xem danh sách
                        </button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-bold text-blue-400">Lưu ý quan trọng</p>
                        <ul className="text-blue-400/80 mt-1 space-y-1">
                            <li>• Kênh cần tối thiểu 100 người đăng ký</li>
                            <li>• Listing sẽ được admin xác minh trước khi hiển thị</li>
                            <li>• Thời hạn listing: 30 ngày</li>
                            <li>• SeenYT hỗ trợ kết nối người mua - người bán</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // BROWSE MODE
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Tổng listing</p>
                                <p className="text-2xl font-black text-white">{stats.totalListings}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Giá TB</p>
                                <p className="text-2xl font-black text-green-400">
                                    {formatCurrency(stats.avgPrice, 'VND')}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">CPM TB</p>
                                <p className="text-2xl font-black text-yellow-400">${stats.avgCPM.toFixed(2)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Top niches</p>
                                <p className="text-lg font-bold text-white truncate">
                                    {stats.topNiches.slice(0, 2).join(', ')}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Filter className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Tìm kiếm kênh..."
                            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 rounded-lg font-bold text-sm transition-colors ${
                            showFilters 
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                                : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Filter size={16} />
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold transition-colors"
                    >
                        Tìm kiếm
                    </button>
                </form>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Người đăng ký (min)</label>
                            <input
                                type="number"
                                value={filters.minSubs}
                                onChange={e => setFilters({ ...filters, minSubs: e.target.value })}
                                placeholder="VD: 1000"
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Người đăng ký (max)</label>
                            <input
                                type="number"
                                value={filters.maxSubs}
                                onChange={e => setFilters({ ...filters, maxSubs: e.target.value })}
                                placeholder="VD: 100000"
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Giá (min)</label>
                            <input
                                type="number"
                                value={filters.minPrice}
                                onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                                placeholder="VD: 1000000"
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Giá (max)</label>
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                                placeholder="VD: 100000000"
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Thị trường ngách</label>
                            <select
                                value={filters.niche}
                                onChange={e => setFilters({ ...filters, niche: e.target.value })}
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Tất cả</option>
                                {POPULAR_NICHES.map(niche => (
                                    <option key={niche} value={niche}>{niche}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Listings Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-[#111] border border-white/10 rounded-2xl p-6 animate-pulse">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-800"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-800 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : listings.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
                    <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Chưa có kênh nào</p>
                    <p className="text-gray-600 text-sm">Hãy là người đầu tiên đăng ký bán kênh!</p>
                    <button
                        onClick={() => setMode('sell')}
                        className="mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold transition-colors"
                    >
                        Đăng ký bán kênh
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(listing => (
                            <div 
                                key={listing.id} 
                                className="bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all cursor-pointer group"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {listing.channelTitle?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white truncate">{listing.channelTitle || 'Kênh không tên'}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {listing.niche && (
                                                <span className="px-2 py-0.5 bg-white/10 rounded">{listing.niche}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-black/40 rounded-lg p-2 text-center">
                                        <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                        <p className="text-sm font-bold text-white">{formatNumber(listing.subscriberCount)}</p>
                                        <p className="text-[10px] text-gray-500">Subs</p>
                                    </div>
                                    <div className="bg-black/40 rounded-lg p-2 text-center">
                                        <Eye className="w-4 h-4 text-green-400 mx-auto mb-1" />
                                        <p className="text-sm font-bold text-white">{formatNumber(listing.avgViewsPerVideo)}</p>
                                        <p className="text-[10px] text-gray-500">Views/clip</p>
                                    </div>
                                    <div className="bg-black/40 rounded-lg p-2 text-center">
                                        <Video className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                                        <p className="text-sm font-bold text-white">{formatNumber(listing.videoCount)}</p>
                                        <p className="text-[10px] text-gray-500">Video</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-500">Giá bán</span>
                                        <span className="text-xl font-black text-green-400">
                                            {formatCurrency(listing.askingPrice, listing.currency)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Giá/subscriber</span>
                                        <span className="text-yellow-400">
                                            {formatCurrency(getPricePerSubscriber(listing.askingPrice, listing.subscriberCount), listing.currency)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        alert('Tính năng thanh toán trực tuyến đang được hoàn thiện. Vui lòng liên hệ Admin qua Zalo/Telegram để giao dịch an toàn!');
                                    }}
                                    className="w-full mt-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg font-bold text-sm transition-colors"
                                >
                                    Liên hệ mua
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => {
                                    setPagination({ ...pagination, page: pagination.page - 1 });
                                    fetchListings();
                                }}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Trước
                            </button>
                            <span className="px-4 py-2 text-gray-500">
                                Trang {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => {
                                    setPagination({ ...pagination, page: pagination.page + 1 });
                                    fetchListings();
                                }}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-black text-white mb-2">Bạn muốn bán kênh YouTube?</h3>
                <p className="text-gray-400 mb-4">Đăng ký miễn phí và tiếp cận hàng ngàn người mua tiềm năng</p>
                <button
                    onClick={() => setMode('sell')}
                    className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold transition-colors"
                >
                    Đăng ký bán kênh ngay
                </button>
            </div>
        </div>
    );
}

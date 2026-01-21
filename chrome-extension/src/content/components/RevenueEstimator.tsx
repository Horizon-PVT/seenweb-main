// RevenueEstimator.tsx - Ước tính thu nhập video
import { useState, useEffect } from 'react';

interface Props {
    views: number;
    niche?: string;
    title: string;
}

interface RevenueData {
    lowEstimate: number;
    highEstimate: number;
    avgEstimate: number;
    cpmRange: { low: number; high: number };
    detectedNiche: string;
    monthlyPotential: number;
}

// CPM ranges by niche (USD per 1000 views)
const CPM_DATA: Record<string, { low: number; high: number; name: string }> = {
    'finance': { low: 12, high: 25, name: '💰 Finance/Business' },
    'tech': { low: 8, high: 18, name: '💻 Technology' },
    'education': { low: 5, high: 12, name: '📚 Education' },
    'health': { low: 6, high: 15, name: '🏥 Health/Fitness' },
    'gaming': { low: 2, high: 6, name: '🎮 Gaming' },
    'entertainment': { low: 2, high: 5, name: '🎬 Entertainment' },
    'music': { low: 1, high: 4, name: '🎵 Music' },
    'lifestyle': { low: 2, high: 6, name: '✨ Lifestyle' },
    'food': { low: 3, high: 8, name: '🍔 Food/Cooking' },
    'travel': { low: 4, high: 10, name: '✈️ Travel' },
    'default': { low: 2, high: 6, name: '📺 General' },
};

// Keywords to detect niche
const NICHE_KEYWORDS: Record<string, string[]> = {
    'finance': ['money', 'invest', 'stock', 'crypto', 'bitcoin', 'tiền', 'đầu tư', 'chứng khoán', 'kiếm tiền', 'business', 'doanh nghiệp'],
    'tech': ['tech', 'software', 'app', 'code', 'programming', 'laptop', 'phone', 'iphone', 'android', 'công nghệ', 'lập trình'],
    'education': ['learn', 'course', 'tutorial', 'how to', 'hướng dẫn', 'học', 'giáo dục', 'bài giảng', 'lesson'],
    'gaming': ['game', 'gaming', 'gameplay', 'minecraft', 'fortnite', 'pubg', 'free fire', 'liên quân', 'lol'],
    'entertainment': ['funny', 'comedy', 'vlog', 'challenge', 'prank', 'hài', 'giải trí', 'reaction'],
    'music': ['music', 'song', 'cover', 'nhạc', 'bài hát', 'ca sĩ', 'mv', 'karaoke'],
    'health': ['fitness', 'workout', 'gym', 'health', 'diet', 'tập', 'gym', 'sức khỏe', 'giảm cân'],
    'food': ['recipe', 'cooking', 'food', 'nấu ăn', 'ẩm thực', 'món', 'bếp'],
    'travel': ['travel', 'trip', 'tour', 'du lịch', 'khám phá', 'phượt'],
    'lifestyle': ['lifestyle', 'daily', 'routine', 'cuộc sống', 'một ngày'],
};

const RevenueEstimator = ({ views, niche, title }: Props) => {
    const [data, setData] = useState<RevenueData | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        calculateRevenue();
    }, [views, title]);

    const detectNiche = (titleText: string): string => {
        const lowerTitle = titleText.toLowerCase();

        for (const [nicheKey, keywords] of Object.entries(NICHE_KEYWORDS)) {
            if (keywords.some(kw => lowerTitle.includes(kw))) {
                return nicheKey;
            }
        }
        return 'default';
    };

    const calculateRevenue = () => {
        const detectedNiche = niche || detectNiche(title);
        const cpmData = CPM_DATA[detectedNiche] || CPM_DATA['default'];

        // Calculate estimates (views / 1000 * CPM)
        const lowEstimate = (views / 1000) * cpmData.low;
        const highEstimate = (views / 1000) * cpmData.high;
        const avgEstimate = (lowEstimate + highEstimate) / 2;

        // Monthly potential (assuming similar video performance)
        const monthlyPotential = avgEstimate * 4; // 4 videos per month

        setData({
            lowEstimate,
            highEstimate,
            avgEstimate,
            cpmRange: { low: cpmData.low, high: cpmData.high },
            detectedNiche: cpmData.name,
            monthlyPotential,
        });
    };

    const formatMoney = (amount: number): string => {
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        }
        return `$${amount.toFixed(0)}`;
    };

    if (!data) return null;

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span className="text-white font-bold text-sm">Revenue Estimator</span>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {/* Big Number */}
                <div className="text-center mb-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Estimated Earnings</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-black text-emerald-600">{formatMoney(data.lowEstimate)}</span>
                        <span className="text-slate-400">—</span>
                        <span className="text-2xl font-black text-green-600">{formatMoney(data.highEstimate)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Avg: <span className="font-bold text-emerald-600">{formatMoney(data.avgEstimate)}</span>
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Niche</p>
                        <p className="text-[10px] font-bold text-slate-700">{data.detectedNiche}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">CPM Range</p>
                        <p className="text-[10px] font-bold text-slate-700">${data.cpmRange.low} - ${data.cpmRange.high}</p>
                    </div>
                </div>

                {/* Monthly Potential */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>📈</span>
                            <span className="text-[10px] font-bold text-yellow-800">Monthly Potential</span>
                        </div>
                        <span className="text-lg font-black text-yellow-600">{formatMoney(data.monthlyPotential)}</span>
                    </div>
                    <p className="text-[9px] text-yellow-700 mt-1">*Nếu upload 4 videos/tháng tương tự</p>
                </div>

                {/* Toggle Details */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full mt-3 text-[10px] text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
                >
                    {showDetails ? '▲ Ẩn chi tiết' : '▼ Xem cách tính'}
                </button>

                {/* Details */}
                {showDetails && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-[9px] text-slate-500 space-y-1">
                        <p>📌 <strong>Công thức:</strong> Views ÷ 1000 × CPM</p>
                        <p>📌 <strong>CPM</strong> = Chi phí quảng cáo / 1000 views</p>
                        <p>📌 <strong>Lưu ý:</strong> Thu nhập thực tế phụ thuộc vào nhiều yếu tố như quốc gia người xem, loại quảng cáo, thời lượng video...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueEstimator;

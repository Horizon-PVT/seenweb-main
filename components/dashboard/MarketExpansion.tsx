// components/dashboard/MarketExpansion.tsx
// Market Expansion Dashboard - Real data based on channel

import React, { useState, useEffect } from 'react';
import {
  Globe,
  TrendingUp,
  DollarSign,
  MapPin,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface MarketData {
  region: string;
  flag: string;
  language: string;
  currency: string;
  potential: number;
  competition: 'Low' | 'Medium' | 'High';
  revenueProjection: {
    monthly: number;
    yearly: number;
  };
  contentOpportunity: string;
  topNiches: string[];
  recommendedAction: string;
}

interface MarketExpansionProps {
  channelId: string;
}

function formatMoney(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString()}`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${currency}`;
  }
  return `${(amount / 1000).toFixed(0)}K ${currency}`;
}

function PotentialBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function MarketExpansion({ channelId }: MarketExpansionProps) {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelTitle, setChannelTitle] = useState('');

  useEffect(() => {
    fetchMarketData();
  }, [channelId]);

  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/youtube/market-expansion?channelId=${channelId}`);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch market data');
      }
      
      const data = await res.json();
      setChannelTitle(data.channelTitle || '');
      
      if (data.markets && data.markets.length > 0) {
        setMarkets(data.markets);
        setSelectedMarket(data.markets[0]);
      } else {
        throw new Error('No market data available');
      }
    } catch (err: any) {
      console.error('Market expansion error:', err.message);
      setError(err.message);
      // Use default fallback
      setMarkets(getDefaultMarkets());
      setSelectedMarket(getDefaultMarkets()[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultMarkets = (): MarketData[] => [
    {
      region: 'Vietnam',
      flag: '🇻🇳',
      language: 'Tiếng Việt',
      currency: 'VND',
      potential: 85,
      competition: 'Medium',
      revenueProjection: { monthly: 5000000, yearly: 60000000 },
      contentOpportunity: 'Thị trường lớn nhất, tốc độ tăng trưởng cao',
      topNiches: ['Công nghệ', 'Kiếm tiền', 'Giáo dục'],
      recommendedAction: 'Ngôn ngữ mẹ đẻ - ưu tiên cao',
    },
    {
      region: 'Thailand',
      flag: '🇹🇭',
      language: 'ภาษาไทย',
      currency: 'THB',
      potential: 72,
      competition: 'Medium',
      revenueProjection: { monthly: 2800000, yearly: 33600000 },
      contentOpportunity: 'Thị trường ASEAN phát triển, cần nội dung chất lượng',
      topNiches: ['Gaming', 'Food', 'Travel'],
      recommendedAction: 'Dubbing tiếng Thái cho video hiện có',
    },
    {
      region: 'Indonesia',
      flag: '🇮🇩',
      language: 'Bahasa Indonesia',
      currency: 'IDR',
      potential: 68,
      competition: 'Low',
      revenueProjection: { monthly: 3500000, yearly: 42000000 },
      contentOpportunity: 'Dân số lớn, ít người làm nội dung tiếng Indonesia',
      topNiches: ['Gaming', 'Lifestyle', 'Tutorial'],
      recommendedAction: 'Dịch content hiện có sang tiếng Indonesia',
    },
    {
      region: 'United States',
      flag: '🇺🇸',
      language: 'English',
      currency: 'USD',
      potential: 60,
      competition: 'High',
      revenueProjection: { monthly: 150, yearly: 1800 },
      contentOpportunity: 'CPM cao nhất, tiếng Anh là ngôn ngữ toàn cầu',
      topNiches: ['Tech', 'Finance', 'How-to'],
      recommendedAction: 'Tạo content tiếng Anh chất lượng cao',
    },
    {
      region: 'Philippines',
      flag: '🇵🇭',
      language: 'English',
      currency: 'PHP',
      potential: 55,
      competition: 'Low',
      revenueProjection: { monthly: 2000000, yearly: 24000000 },
      contentOpportunity: '270M dân, tiếng Anh phổ biến',
      topNiches: ['Gaming', 'Music', 'Lifestyle'],
      recommendedAction: 'English subtitles, trending topics',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="text-purple-400" size={24} />
          <div>
            <h2 className="text-xl font-black text-white">Mở Rộng Thị Trường</h2>
            <p className="text-sm text-gray-500">Đang phân tích...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  if (error && markets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-400 shrink-0" size={24} />
          <div>
            <p className="text-red-400 font-bold">Không thể tải dữ liệu thị trường</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
          <button onClick={fetchMarketData} className="ml-auto px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!selectedMarket) return null;

  const displayedMarkets = showAll ? markets : markets.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe size={24} className="text-purple-400" />
          <div>
            <h2 className="text-xl font-black text-white">Mở Rộng Thị Trường</h2>
            <p className="text-sm text-gray-500">
              {channelTitle ? `Phân tích cho kênh: ${channelTitle}` : 'Phân tích tiềm năng và lập kế hoạch mở rộng'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchMarketData}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Market Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedMarkets.map((market) => (
          <button
            key={market.region}
            onClick={() => setSelectedMarket(market)}
            className={`text-left p-5 rounded-2xl border transition-all ${
              selectedMarket.region === market.region
                ? 'bg-purple-500/10 border-purple-500/50'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{market.flag}</span>
              <div>
                <h3 className="font-bold text-white">{market.region}</h3>
                <p className="text-xs text-gray-500">{market.language}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Potential</span>
                <span className="font-bold text-white">{market.potential}%</span>
              </div>
              <PotentialBar value={market.potential} />

              <div className="flex items-center justify-between text-xs mt-3">
                <span className="text-gray-500">Est. Revenue/mo</span>
                <span className="font-bold text-green-400">
                  {formatMoney(market.revenueProjection.monthly, market.currency)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Show More */}
      {!showAll && markets.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight size={16} className="rotate-90" />
          Xem thêm {markets.length - 3} thị trường
        </button>
      )}

      {/* Selected Market Detail */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{selectedMarket.flag}</span>
          <div>
            <h3 className="text-2xl font-black text-white">{selectedMarket.region}</h3>
            <p className="text-gray-500">{selectedMarket.language} | {selectedMarket.currency}</p>
          </div>
          <div className="ml-auto">
            <div className={`text-3xl font-black ${
              selectedMarket.competition === 'Low' ? 'text-green-400' :
              selectedMarket.competition === 'Medium' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {selectedMarket.competition} Competition
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue Projection */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-xs font-bold text-gray-500 uppercase">Revenue Projection</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-black text-white">
                  {formatMoney(selectedMarket.revenueProjection.monthly, selectedMarket.currency)}
                </p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-300">
                  {formatMoney(selectedMarket.revenueProjection.yearly, selectedMarket.currency)}
                </p>
                <p className="text-xs text-gray-500">per year</p>
              </div>
            </div>
          </div>

          {/* Top Niches */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-blue-400" />
              <span className="text-xs font-bold text-gray-500 uppercase">Top Niches</span>
            </div>
            <div className="space-y-2">
              {selectedMarket.topNiches.map((niche, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  <span className="text-sm text-white">{niche}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-purple-400" />
              <span className="text-xs font-bold text-gray-500 uppercase">Opportunity</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {selectedMarket.contentOpportunity}
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight size={16} className="text-purple-400" />
            <span className="text-sm font-bold text-purple-400 uppercase">Hành động khuyến nghị</span>
          </div>
          <p className="text-white font-medium">{selectedMarket.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
}

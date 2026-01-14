// components/MicroNicheMinerTool.tsx
// BẢN NÂNG CẤP FULL SCREEN + QUỐC TẾ (Jan 14, 2026)

import React, { useState, useRef } from 'react';
import { CompassIcon } from './AnimatedIcons';
import type { Tool } from './ToolsGrid';

// CẤU TRÚC JSON ĐÃ ĐỒNG BỘ HOÀN TOÀN VỚI BACKEND
interface NicheData {
  nicheName: string;
  overallScore: number;
  competitionScore: number;
  searchVolumeScore: number;
  monetizationScore: number;
  longTermViabilityScore: number;
  peakTimingForecast: string;
  communitySentimentAnalysis: string;
  pioneerVideoTopics: string[];
  miningScript: {
    tone: string;
    frequency: string;
    monetizationGoal: string;
  };
  lowFloorChannels: {
    name: string;
    url?: string;
    subscribers: string;
    thumbnail?: string;
  }[];
  saturatedNichesWarning: string[];
}

interface OutputData {
  topNiches: NicheData[];
}

type TargetMarket = 'VN' | 'US';

const MARKET_OPTIONS: { value: TargetMarket; label: string; flag: string; desc: string }[] = [
  { value: 'VN', label: 'Việt Nam', flag: '🇻🇳', desc: 'Ngách Việt, CPM thấp' },
  { value: 'US', label: 'Quốc tế (US)', flag: '🌎', desc: 'Global, CPM cao' },
];

const Loader: React.FC<{ market: TargetMarket }> = ({ market }) => (
  <div className="flex flex-col items-center justify-center h-full text-center py-20">
    <div className="w-40 h-40 text-[#008080]">
      <CompassIcon />
    </div>
    <p className="mt-6 text-lg font-semibold text-[#CDAD5A] tracking-widest animate-pulse">
      {market === 'VN' ? 'ĐANG KHAI THÁC PHÂN KHÚC VÀNG...' : 'MINING GOLDEN NICHES...'}
    </p>
    <p className="mt-2 text-sm text-gray-500">
      {market === 'VN' ? 'Phân tích thị trường Việt Nam' : 'Analyzing US/Global market'}
    </p>
  </div>
);

const NicheCard: React.FC<{ niche: NicheData; delay: number; market: TargetMarket }> = ({ niche, delay, market }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isVN = market === 'VN';

  return (
    <div
      className="bg-gradient-to-br from-gray-900/80 to-black/60 border border-[#CDAD5A]/20 rounded-2xl p-6 flex flex-col transform transition-all duration-500 hover:scale-[1.02] hover:border-[#008080]/60 hover:shadow-xl hover:shadow-teal-900/20"
      style={{ animationDelay: `${delay * 0.1}s`, animation: 'fadeInUp 0.5s ease-out forwards', opacity: 0 }}
    >
      <h4 className="text-[#CDAD5A] font-black text-xl mb-4 leading-tight">
        {niche.nicheName}
      </h4>

      {/* Tổng điểm */}
      <div className="flex justify-between items-center text-sm font-bold mb-5 border-b border-gray-700/50 pb-4">
        <span className="text-[#008080] text-base">{isVN ? 'Điểm Tổng Thể' : 'Overall Score'}</span>
        <span className={`text-3xl font-black ${niche.overallScore >= 8.5 ? 'text-green-400' : niche.overallScore >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>
          {niche.overallScore.toFixed(1)}
        </span>
      </div>

      {/* 4 chỉ số chính */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-5">
        <div className="bg-black/30 rounded-lg p-3">
          <span className="block text-gray-500 text-xs mb-1">{isVN ? 'Cạnh tranh' : 'Competition'}</span>
          <span className={`font-bold text-lg ${niche.competitionScore <= 30 ? 'text-green-400' : 'text-yellow-300'}`}>
            {niche.competitionScore}/100
          </span>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <span className="block text-gray-500 text-xs mb-1">{isVN ? 'Tìm kiếm' : 'Search Vol.'}</span>
          <span className={`font-bold text-lg ${niche.searchVolumeScore >= 70 ? 'text-green-400' : 'text-yellow-300'}`}>
            {niche.searchVolumeScore}/100
          </span>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <span className="block text-gray-500 text-xs mb-1">{isVN ? 'Kiếm tiền' : 'Monetization'}</span>
          <span className={`font-bold text-lg ${niche.monetizationScore >= 80 ? 'text-green-400' : 'text-yellow-300'}`}>
            {niche.monetizationScore}/100
          </span>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <span className="block text-gray-500 text-xs mb-1">{isVN ? 'Bền vững' : 'Long-term'}</span>
          <span className={`font-bold text-lg ${niche.longTermViabilityScore >= 75 ? 'text-green-400' : 'text-yellow-300'}`}>
            {niche.longTermViabilityScore}/100
          </span>
        </div>
      </div>

      {/* Nút mở rộng */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-[#008080] hover:text-[#CDAD5A] font-bold mt-auto pt-4 border-t border-gray-800/50 transition-colors flex items-center justify-center gap-2"
      >
        {isOpen ? (isVN ? '▲ Thu gọn' : '▲ Collapse') : (isVN ? '▼ Xem chi tiết chiến lược' : '▼ View Strategy Details')}
      </button>

      {/* Nội dung chi tiết */}
      {isOpen && (
        <div className="mt-5 space-y-5 border-t border-gray-700/50 pt-5 text-sm">
          <div>
            <p className="text-[#CDAD5A] font-bold mb-2">{isVN ? '📅 Dự báo đỉnh cao:' : '📅 Peak Timing:'}</p>
            <p className="text-gray-300">{niche.peakTimingForecast}</p>
          </div>

          <div>
            <p className="text-[#CDAD5A] font-bold mb-2">{isVN ? '💬 Cộng đồng đang nghĩ gì:' : '💬 Community Sentiment:'}</p>
            <p className="text-gray-300 leading-relaxed">{niche.communitySentimentAnalysis}</p>
          </div>

          <div>
            <p className="text-[#CDAD5A] font-bold mb-3">{isVN ? '🎬 10 Chủ đề video tiên phong:' : '🎬 10 Pioneer Video Topics:'}</p>
            <ul className="list-none text-gray-400 space-y-2">
              {niche.pioneerVideoTopics.slice(0, 10).map((topic, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#008080] font-bold">{i + 1}.</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[#CDAD5A] font-bold mb-2">{isVN ? '⚡ Chiến lược khai thác:' : '⚡ Mining Strategy:'}</p>
            <div className="text-gray-400 space-y-1 bg-black/20 rounded-lg p-3">
              <p>• <strong>Tone:</strong> {niche.miningScript.tone}</p>
              <p>• <strong>{isVN ? 'Tần suất' : 'Frequency'}:</strong> {niche.miningScript.frequency}</p>
              <p>• <strong>{isVN ? 'Mục tiêu' : 'Goal'}:</strong> {niche.miningScript.monetizationGoal}</p>
            </div>
          </div>

          <div>
            <p className="text-[#CDAD5A] font-bold mb-3">{isVN ? '📺 Kênh thành công (sàn thấp):' : '📺 Successful Low-floor Channels:'}</p>
            <div className="flex flex-wrap gap-2">
              {niche.lowFloorChannels.map((ch, i) => (
                <span
                  key={i}
                  className="px-3 py-2 bg-gray-800/80 rounded-full text-white text-xs font-medium border border-gray-700"
                >
                  {ch.name} ({ch.subscribers})
                </span>
              ))}
            </div>
          </div>

          {niche.saturatedNichesWarning && niche.saturatedNichesWarning.length > 0 && (
            <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
              <p className="text-red-400 font-bold text-sm mb-1">{isVN ? '⚠️ Tránh ngách bão hòa:' : '⚠️ Avoid Saturated Niches:'}</p>
              <p className="text-red-300 text-sm">
                {niche.saturatedNichesWarning.join(' • ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MicroNicheMinerToolProps {
  onBack: () => void;
  onToolSelect: (tool: Tool) => void;
  tools: Tool[];
}

export const MicroNicheMinerTool: React.FC<MicroNicheMinerToolProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [targetMarket, setTargetMarket] = useState<TargetMarket>('VN');
  const [output, setOutput] = useState<OutputData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const isVN = targetMarket === 'VN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setOutput(null);

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'micro',
          macroNiche: input.trim(),
          targetMarket: targetMarket,
        }),
      });

      const data = await response.json();

      if (response.ok && data.topNiches && Array.isArray(data.topNiches)) {
        setOutput(data as OutputData);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        throw new Error(data.error || (isVN ? 'Phản hồi từ AI không đúng định dạng' : 'Invalid AI response format'));
      }
    } catch (error: any) {
      console.error('Lỗi tool Micro Niche:', error);
      alert((isVN ? 'Lỗi: ' : 'Error: ') + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-[#CDAD5A] hover:text-white font-bold transition-colors flex items-center gap-2"
          >
            ← {isVN ? 'Quay lại' : 'Back'}
          </button>

          {/* Market Selector */}
          <div className="flex items-center gap-2 bg-gray-900/80 rounded-full p-1 border border-gray-700/50">
            {MARKET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTargetMarket(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${targetMarket === opt.value
                    ? 'bg-gradient-to-r from-[#008080] to-teal-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                <span>{opt.flag}</span>
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#008080] via-teal-400 to-[#CDAD5A] uppercase tracking-tight mb-4">
          MICRO NICHE MINER
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          {isVN
            ? 'Dùng AI + YouTube Data khai thác 8-10 micro-niche siêu tiềm năng từ bất kỳ macro-niche nào'
            : 'Use AI + YouTube Data to discover 8-10 high-potential micro-niches from any macro-niche'
          }
        </p>

        {/* Market Badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
          <span className="text-2xl">{MARKET_OPTIONS.find(m => m.value === targetMarket)?.flag}</span>
          <span className="text-gray-300 font-medium">
            {isVN ? 'Thị trường Việt Nam' : 'US/Global Market'}
          </span>
          <span className="text-gray-500 text-sm">
            ({isVN ? 'CPM thấp, dễ cạnh tranh' : 'High CPM, English content'})
          </span>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isVN
              ? 'Nhập macro-niche: Làm đẹp • Tài chính • Ẩm thực • Gaming...'
              : 'Enter macro-niche: Finance • Health • Tech • Cooking...'
            }
            className="flex-grow p-5 bg-gray-900/80 border-2 border-gray-700/50 rounded-2xl text-white placeholder-gray-500 text-lg focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-10 py-5 bg-gradient-to-r from-[#008080] to-teal-600 text-white font-black text-lg rounded-2xl hover:from-teal-600 hover:to-[#008080] transition-all duration-300 shadow-xl shadow-teal-900/30 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading
              ? (isVN ? '⏳ ĐANG KHAI THÁC...' : '⏳ MINING...')
              : (isVN ? '🔍 TÌM NGÁCH VÀNG' : '🔍 FIND GOLDEN NICHES')
            }
          </button>
        </form>
      </div>

      {/* Results */}
      <div ref={resultRef} className="max-w-7xl mx-auto px-6 pb-20">
        {isLoading && <Loader market={targetMarket} />}

        {output && (
          <div className="animate-fadeIn">
            <h2 className="text-3xl md:text-4xl font-black text-[#008080] text-center mb-12">
              {isVN
                ? `🎯 KẾT QUẢ KHAI THÁC – ${output.topNiches.length} NGÁCH VÀNG`
                : `🎯 MINING RESULTS – ${output.topNiches.length} GOLDEN NICHES`
              }
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {output.topNiches.map((niche, i) => (
                <NicheCard key={i} niche={niche} delay={i} market={targetMarket} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};
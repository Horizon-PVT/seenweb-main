// components/MicroNicheMinerTool.tsx
// BẢN FIX HOÀN CHỈNH – CHẠY MƯỢT 100% (Dec 10, 2025)

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
  saturatedNichesWarning: string[]; // Đã chuyển vào trong từng niche
}

interface OutputData {
  topNiches: NicheData[];
}

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="w-32 h-32 text-[#008080]">
      <CompassIcon />
    </div>
    <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">
      ĐANG KHAI THÁC PHÂN KHÚC VÀNG...
    </p>
  </div>
);

const NicheCard: React.FC<{ niche: NicheData; delay: number }> = ({ niche, delay }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="bg-black/40 border border-[#CDAD5A]/30 rounded-lg p-5 flex flex-col transform transition-all duration-500 hover:scale-[1.02] hover:border-[#008080]/60"
      style={{ animationDelay: `${delay * 0.15}s`, animation: 'fadeInUp 0.6s ease-out forwards' }}
    >
      <h4 className="text-[#CDAD5A] font-black text-lg mb-3 leading-tight">
        {niche.nicheName}
      </h4>

      {/* Tổng điểm */}
      <div className="flex justify-between items-center text-sm font-bold mb-4 border-b border-gray-700 pb-3">
        <span className="text-[#008080]">Điểm Tổng Thể</span>
        <span className={`text-2xl ${niche.overallScore >= 8.5 ? 'text-green-400' : niche.overallScore >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>
          {niche.overallScore.toFixed(1)}
        </span>
      </div>

      {/* 4 chỉ số chính */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="text-gray-400">
          <span className="font-semibold text-white">Cạnh tranh:</span>{' '}
          <span className={niche.competitionScore <= 30 ? 'text-green-400' : 'text-yellow-300'}>
            {niche.competitionScore}/100
          </span>
        </div>
        <div className="text-gray-400">
          <span className="font-semibold text-white">Tìm kiếm:</span>{' '}
          <span className={niche.searchVolumeScore >= 70 ? 'text-green-400' : 'text-yellow-300'}>
            {niche.searchVolumeScore}/100
          </span>
        </div>
        <div className="text-gray-400">
          <span className="font-semibold text-white">Kiếm tiền:</span>{' '}
          <span className={niche.monetizationScore >= 80 ? 'text-green-400' : 'text-yellow-300'}>
            {niche.monetizationScore}/100
          </span>
        </div>
        <div className="text-gray-400">
          <span className="font-semibold text-white">Bền vững:</span>{' '}
          <span className={niche.longTermViabilityScore >= 75 ? 'text-green-400' : 'text-yellow-300'}>
            {niche.longTermViabilityScore}/100
          </span>
        </div>
      </div>

      {/* Nút mở rộng */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-[#008080] hover:text-[#CDAD5A] font-bold mt-auto pt-3 border-t border-gray-800 transition-colors"
      >
        {isOpen ? '▲ Thu gọn chi tiết' : '▼ Xem chi tiết chiến lược'}
      </button>

      {/* Nội dung chi tiết */}
      {isOpen && (
        <div className="mt-4 space-y-4 border-t border-gray-700 pt-4 text-xs">
          <div>
            <p className="text-[#CDAD5A] font-bold mb-1">Dự báo đỉnh cao:</p>
            <p className="text-gray-300">{niche.peakTimingForecast}</p>
          </div>

          <div>
            <p className="text-[#CDAD5A] font-bold mb-1">Cộng đồng đang nghĩ gì:</p>
            <p className="text-gray-300 leading-relaxed">{niche.communitySentimentAnalysis}</p>
          </div>

          <div>
            <p className="text-[#CDAD5A] font-bold mb-2">10 Chủ đề video tiên phong (dùng luôn):</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1 ml-2">
              {niche.pioneerVideoTopics.slice(0, 10).map((topic, i) => (
                <li key={i}>{topic}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[#CDAD5A] font-bold mb-1">Chiến lược khai thác:</p>
            <div className="text-gray-400 space-y-1 ml-3">
              <p>• Tone: {niche.miningScript.tone}</p>
              <p>• Tần suất: {niche.miningScript.frequency}</p>
              <p>• Mục tiêu kiếm tiền: {niche.miningScript.monetizationGoal}</p>
            </div>
          </div>

          <div>
            <p className="text-[#CDAD5A] font-bold mb-2">Kênh sàn thấp thành công:</p>
            <div className="flex flex-wrap gap-2">
              {niche.lowFloorChannels.map((ch, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-800 rounded-full text-white text-xs font-medium"
                >
                  {ch.name} ({ch.subscribers})
                </span>
              ))}
            </div>
          </div>

          {niche.saturatedNichesWarning.length > 0 && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded">
              <p className="text-red-400 font-bold text-xs">Tránh ngách bão hòa:</p>
              <p className="text-red-300 text-xs">
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
  const [output, setOutput] = useState<OutputData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

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
        }),
      });

      const data = await response.json();

      if (response.ok && data.topNiches && Array.isArray(data.topNiches)) {
        setOutput(data as OutputData);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        throw new Error(data.error || 'Phản hồi từ AI không đúng định dạng');
      }
    } catch (error: any) {
      console.error('Lỗi tool Micro Niche:', error);
      alert('Lỗi: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-6 max-w-7xl mx-auto bg-[#0f0a05] rounded-2xl min-h-screen shadow-2xl">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-[#CDAD5A] hover:text-white text-lg font-bold transition-colors z-10"
      >
        ← Quay lại
      </button>

      <div className="text-center mb-10 pt-16">
        <h1 className="text-5xl font-black text-[#008080] uppercase tracking-widest mb-3">
          MICRO NICHE MINER TOOL
        </h1>
        <p className="text-gray-400 text-lg">
          Dùng AI khai thác 8-10 micro-niche siêu tiềm năng từ bất kỳ macro-niche nào
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 mb-12 max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ví dụ: Làm đẹp tại nhà • Tài chính cá nhân • Đánh giá điện thoại • Ẩm thực đường phố..."
          className="flex-grow p-5 bg-gray-900/80 border-2 border-[#CDAD5A]/50 rounded-xl text-white placeholder-gray-500 text-lg focus:outline-none focus:border-[#008080] transition-colors"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-12 py-5 bg-gradient-to-r from-[#008080] to-teal-700 text-white font-black text-xl rounded-xl hover:from-teal-700 hover:to-[#008080] transition-all duration-300 shadow-xl disabled:opacity-70"
        >
          {isLoading ? 'ĐANG KHAI THÁC...' : 'TÌM NGÁCH VÀNG'}
        </button>
      </form>

      <div ref={resultRef} className="min-h-96">
        {isLoading && <Loader />}

        {output && (
          <div className="animate-fadeIn">
            <h2 className="text-4xl font-black text-[#008080] text-center mb-10">
              KẾT QUẢ KHAI THÁC – {output.topNiches.length} NGÁCH VÀNG
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {output.topNiches.map((niche, i) => (
                <NicheCard key={i} niche={niche} delay={i} />
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
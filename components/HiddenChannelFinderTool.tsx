// components/HiddenChannelFinderTool.tsx
// BẢN FULL HOÀN CHỈNH 100% – ĐÃ FIX LỖI SYNTAX, CHẠY NGON NGAY

import React, { useState, useRef } from 'react';

interface RisingChannel {
  name: string;
  url: string;
  subscribers: string;
  growthMetric: string;
  coreStrengths: string[];
  thumbnail: string;
}

interface TrendingVideo {
  title: string;
  url: string;
  viralRatio: string;
  viralStructure: string[];
  thumbnail: string;
}

interface OutputData {
  risingChannels: RisingChannel[];
  trendingVideos: TrendingVideo[];
  upcomingTrends: string[];
}

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="w-32 h-32 animate-pulse text-[#008080]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.3"/>
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="100">
          <animate attributeName="strokeDashoffset" from="251" to="0" dur="4s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
    <p className="mt-6 text-lg font-bold text-[#CDAD5A] tracking-widest animate-pulse">
      ĐANG TÌM KIẾM KÊNH ẨN & XU HƯỚNG BÙNG NỔ...
    </p>
  </div>
);

const HiddenChannelFinderTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<OutputData | null>(null);
  const [seedQuery, setSeedQuery] = useState('');
  const [outputLanguage, setOutputLanguage] = useState('Tiếng Việt');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedQuery.trim()) {
      setError('Vui lòng nhập từ khóa để tìm kiếm.');
      return;
    }

    setIsLoading(true);
    setError('');
    setOutput(null);

    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'hidden',
          macroNiche: seedQuery,
          outputLanguage,
        }),
      });

      if (!res.ok) throw new Error('Lỗi server, vui lòng thử lại.');

      const data = await res.json();

      // Bảo vệ dữ liệu
      data.risingChannels = Array.isArray(data.risingChannels) ? data.risingChannels : [];
      data.trendingVideos = Array.isArray(data.trendingVideos) ? data.trendingVideos : [];
      data.upcomingTrends = Array.isArray(data.upcomingTrends) ? data.upcomingTrends : [];

      setOutput(data);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tìm kiếm.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-sm p-4 md:p-6 space-y-6 bg-gradient-to-br from-[#0f0f0f] to-[#1a1a08]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#CDAD5A]/20 pb-4">
        <h2 className="text-2xl font-bold text-[#CDAD5A] font-playfair tracking-wider">
          TÌM KÊNH ẨN & XU HƯỚNG BÙNG NỔ
        </h2>
        <button onClick={onBack} className="text-gray-400 hover:text-white text-2xl">&times;</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
        {/* Form bên trái */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-5">
          <div>
            <label className="block text-[#CDAD5A] font-bold mb-2">TỪ KHÓA KHỞI ĐẦU</label>
            <textarea
              value={seedQuery}
              onChange={(e) => setSeedQuery(e.target.value)}
              placeholder="VD: du lịch bụi, sống tối giản, nấu ăn nhanh, kiếm tiền online..."
              className="w-full h-32 px-4 py-3 bg-black/50 border border-[#CDAD5A]/30 rounded focus:border-[#008080] outline-none text-white placeholder-gray-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-[#CDAD5A] font-bold mb-2">NGÔN NGỮ ĐẦU RA</label>
            <select
              value={outputLanguage}
              onChange={(e) => setOutputLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-[#CDAD5A]/30 rounded text-white"
            >
              <option>Tiếng Việt</option>
              <option>English</option>
            </select>
          </div>

          <button
            ref={buttonRef}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#008080] hover:bg-transparent border-2 border-[#008080] text-white font-bold text-lg rounded transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? 'ĐANG TÌM KIẾM...' : 'KÍCH HOẠT TÌM KIẾM'}
          </button>

          {error && <p className="text-red-400 text-center font-medium">{error}</p>}
        </form>

        {/* Kết quả bên phải */}
        <div className="lg:col-span-7 overflow-y-auto space-y-8 pr-2">
          {isLoading && <Loader />}

          {!isLoading && !output && (
            <div className="h-full flex items-center justify-center text-gray-600">
              <p className="text-center text-lg">Nhập từ khóa và nhấn tìm kiếm để khám phá kênh ẩn & xu hướng mới!</p>
            </div>
          )}

          {output && !isLoading && (
            <>
              {/* KÊNH ĐANG BÙNG NỔ */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4">
                  KÊNH ẨN ĐANG BÙNG NỔ ({output.risingChannels.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {output.risingChannels.map((ch, i) => (
                    <div key={i} className="bg-black/40 border border-[#CDAD5A]/30 rounded p-4 hover:border-[#008080] transition-all">
                      <div className="flex gap-4">
                        <img
                          src={ch.thumbnail || 'https://via.placeholder.com/64'}
                          alt={ch.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#CDAD5A]/50"
                          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64')}
                        />
                        <div className="flex-1">
                          <a href={ch.url} target="_blank" rel="noopener noreferrer" className="font-bold text-[#CDAD5A] hover:underline block">
                            {ch.name}
                          </a>
                          <p className="text-xs text-gray-400">{ch.subscribers} subscribers</p>
                          <p className="text-emerald-400 font-bold mt-1">{ch.growthMetric}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-300">
                        <strong>Điểm mạnh:</strong> {ch.coreStrengths.join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIDEO ĐANG VIRAL */}
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-4">
                  VIDEO ĐANG VIRAL ({output.trendingVideos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {output.trendingVideos.map((v, i) => (
                    <div key={i} className="bg-black/40 border border-red-900/50 rounded overflow-hidden hover:border-red-500 transition-all">
                      <a href={v.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-full h-40 object-cover"
                          onError={(e) => (e.currentTarget.src = 'https://i.ytimg.com/vi/invalid/hqdefault.jpg')}
                        />
                      </a>
                      <div className="p-3">
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-red-400 line-clamp-2 block">
                          {v.title}
                        </a>
                        <p className="text-xs text-red-300 mt-1">{v.viralRatio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DỰ ĐOÁN XU HƯỚNG */}
              <div className="bg-emerald-900/20 border-2 border-emerald-700/50 rounded p-5">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">
                  DỰ ĐOÁN XU HƯỚNG SẮP TỚI
                </h3>
                <ol className="space-y-3 text-gray-300">
                  {output.upcomingTrends.map((trend, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-bold text-[#CDAD5A]">{i + 1}.</span>
                      <span>{trend}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HiddenChannelFinderTool;
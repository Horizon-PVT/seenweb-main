// components/HiddenChannelFinderTool.tsx
import React, { useState, useRef } from 'react';
import { PortalIcon } from './AnimatedIcons';
import type { Tool } from './ToolsGrid';

interface ChannelData {
  name: string;
  url: string;
  subscribers: string;
  videoCount: string;
  growthMetric: string;
  coreStrengths: string[];
  thumbnail: string; // Added for pro display
}

interface VideoData {
  title: string;
  url: string;
  viralRatio: string;
  viralStructure: string[];
}

interface OutputData {
  risingChannels: ChannelData[];
  trendingVideos: VideoData[];
  upcomingTrends: string[];
}

// Loader with pro animation
const Loader = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-xl">
    <div className="relative w-32 h-32">
      <PortalIcon className="absolute inset-0 w-full h-full text-[#CDAD5A] animate-[spin_3s_linear_infinite]" />
      <div className="absolute inset-0 w-full h-full border-4 border-[#CDAD5A]/50 rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
    </div>
    <p className="mt-6 text-xl font-bold text-[#CDAD5A] animate-pulse">Đang mở cổng Dark Pool...</p>
  </div>
);

const HiddenChannelFinderTool: React.FC<{ onBack: () => void; onToolSelect: (tool: Tool) => void; tools: Tool[] }> = ({ onBack, onToolSelect, tools }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<OutputData | null>(null);
  const [seedQuery, setSeedQuery] = useState('');
  const [minSubs, setMinSubs] = useState(1000);
  const [maxSubs, setMaxSubs] = useState(50000);
  const [minVideos, setMinVideos] = useState(50); // Added for pro filter
  const [growthVelocity, setGrowthVelocity] = useState(30); // % growth
  const [nicheCompetition, setNicheCompetition] = useState('low');
  const [outputLanguage, setOutputLanguage] = useState('Tiếng Việt');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedQuery.trim()) {
      setError('Nhập từ khóa gốc đi anh!');
      return;
    }

    setIsLoading(true);
    setError('');
    setOutput(null);
    buttonRef.current?.classList.add('animate-pulse');

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'hidden',
          seedQuery: seedQuery.trim(),
          minSubs,
          maxSubs,
          minVideos,
          growthVelocity,
          nicheCompetition,
          outputLanguage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate & fallback
      const validatedData: OutputData = {
        risingChannels: data.risingChannels?.map((ch: ChannelData) => ({
          ...ch,
          thumbnail: ch.thumbnail || 'https://placeholder.com/100x100?text=No+Avatar' // Fallback thumbnail
        })) || [],
        trendingVideos: data.trendingVideos || [],
        upcomingTrends: data.upcomingTrends || []
      };

      setOutput(validatedData);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Lỗi quét Dark Pool, thử lại nhé anh!');
    } finally {
      setIsLoading(false);
      buttonRef.current?.classList.remove('animate-pulse');
    }
  };

  const handleUseChannel = (channel: ChannelData) => {
    const rivalTool = tools.find(t => t.name.includes('RIVAL') || t.name.includes('ĐỐI THỦ'));
    if (rivalTool) {
      localStorage.setItem('rivalUrlFromHidden', channel.url);
      onToolSelect(rivalTool);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gradient-to-br from-black via-[#1a1008] to-black text-white relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 z-10 relative">
        <h2 className="text-3xl font-bold text-[#CDAD5A] tracking-widest drop-shadow-lg">TÌM KÊNH ẨN - DARK POOL SCANNER</h2>
        <button onClick={onBack} className="text-3xl hover:text-gray-300 transition duration-200">&times; Trở Về</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow relative z-10">
        {/* Left Column: Form (4 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-4 space-y-6 bg-gray-800/70 p-6 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Từ Khóa Gốc (Seed Query)</label>
            <input
              type="text"
              value={seedQuery}
              onChange={(e) => setSeedQuery(e.target.value)}
              placeholder="VD: nấu ăn keto, lập trình python cho người mới..."
              className="w-full p-4 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#CDAD5A] outline-none transition-all duration-200 hover:border-gray-500"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Khoảng Subscribers</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={minSubs}
                  onChange={(e) => setMinSubs(Math.max(0, +e.target.value))}
                  placeholder="Min"
                  className="w-full p-3 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#CDAD5A] text-sm"
                />
                <span className="text-gray-400">→</span>
                <input
                  type="number"
                  value={maxSubs}
                  onChange={(e) => setMaxSubs(Math.max(minSubs, +e.target.value))}
                  placeholder="Max"
                  className="w-full p-3 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#CDAD5A] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Số Video Tối Thiểu</label>
              <input
                type="number"
                value={minVideos}
                onChange={(e) => setMinVideos(Math.max(0, +e.target.value))}
                className="w-full p-4 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#CDAD5A] outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tốc Độ Tăng Trưởng (%/tháng)</label>
              <input
                type="number"
                value={growthVelocity}
                onChange={(e) => setGrowthVelocity(Math.max(0, +e.target.value))}
                className="w-full p-4 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#CDAD5A] outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mức Cạnh Tranh Ngách</label>
              <select
                value={nicheCompetition}
                onChange={(e) => setNicheCompetition(e.target.value)}
                className="w-full p-4 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#CDAD5A] outline-none transition-all duration-200"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung Bình</option>
                <option value="high">Cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ngôn Ngữ Output</label>
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
                className="w-full p-4 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#CDAD5A] outline-none transition-all duration-200"
              >
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          <button
            ref={buttonRef}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-[#CDAD5A] to-[#e0b85a] text-black font-bold text-lg rounded-lg hover:from-[#e0b85a] hover:to-[#CDAD5A] transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-yellow-500/25"
          >
            {isLoading ? "🔍 Đang Quét..." : "🚀 SCAN DARK POOL"}
          </button>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
              <p className="text-red-400 text-center text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Right Column: Output (8 cols) */}
        <div className="lg:col-span-8 relative bg-gray-800/70 p-6 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm overflow-y-auto max-h-[calc(100vh-12rem)] space-y-6">
          {isLoading && <Loader />}

          {!output && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <PortalIcon className="w-24 h-24 opacity-30 mb-4" />
              <p className="text-lg font-medium">Sẵn sàng quét Dark Pool...</p>
              <p className="text-sm mt-2 opacity-75">Nhập từ khóa và nhấn "Scan" để bắt đầu</p>
            </div>
          )}

          {output && (
            <div className="space-y-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#CDAD5A]/20 to-[#e0b85a]/20 p-6 rounded-xl border border-[#CDAD5A]/30">
                <h3 className="text-2xl font-bold text-[#CDAD5A] mb-2">Kênh Ẩn Đang Bùng Nổ ({output.risingChannels.length})</h3>
                <p className="text-gray-400 text-sm">Kết quả quét Dark Pool - {new Date().toLocaleDateString('vi-VN')}</p>
              </div>

              {/* Rising Channels Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {output.risingChannels.length > 0 ? (
                  output.risingChannels.map((ch, i) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-[#CDAD5A]/30 shadow-lg hover:border-[#CDAD5A]/60 transition-all duration-200">
                      <div className="flex items-center mb-4">
                        <img
                          src={ch.thumbnail || 'https://placeholder.com/48x48?text=Avatar'}
                          alt={ch.name}
                          className="w-12 h-12 rounded-full border-2 border-[#CDAD5A]/50 object-cover"
                          onError={(e) => { e.currentTarget.src = 'https://placeholder.com/48x48?text=No+Avatar'; }}
                        />
                        <div className="ml-3">
                          <h4 className="text-lg font-bold text-[#CDAD5A]">{ch.name}</h4>
                          <a href={ch.url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">Xem kênh →</a>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>Subscribers: <span className="text-white font-medium">{ch.subscribers}</span></p>
                        <p>Video Count: <span className="text-white font-medium">{ch.videoCount}</span></p>
                        <p className="text-green-400">Growth: {ch.growthMetric}</p>
                        <div>
                          <h5 className="font-medium text-gray-200 mb-1">Core Strengths:</h5>
                          <ul className="list-disc pl-4 space-y-1 text-xs">
                            {ch.coreStrengths.map((strength, j) => <li key={j}>{strength}</li>)}
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUseChannel(ch)}
                        className="w-full mt-4 py-2 bg-[#008080]/80 text-white font-medium text-sm rounded-lg hover:bg-[#008080] transition-all duration-200"
                      >
                        Phân Tích Làm Đối Thủ
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-full">Chưa tìm thấy kênh ẩn nào</p>
                )}
              </div>

              {/* Trending Videos Accordion */}
              {output.trendingVideos.length > 0 && (
                <details className="group">
                  <summary className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-[#CDAD5A]/30 cursor-pointer hover:border-[#CDAD5A]/60 transition-all duration-200 flex items-center justify-between">
                    <span className="font-bold text-lg text-[#CDAD5A] flex items-center">
                      <span className="w-2 h-2 bg-[#CDAD5A] rounded-full mr-2 group-open:bg-[#e0b85a]"></span>
                      Video Trending ({output.trendingVideos.length})
                    </span>
                    <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 mt-2 bg-gray-900/50 rounded-lg border-l-4 border-[#CDAD5A]/50 space-y-4">
                    {output.trendingVideos.map((vid, i) => (
                      <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <h5 className="font-medium text-[#CDAD5A] mb-2">{vid.title}</h5>
                        <a href={vid.url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">Xem video →</a>
                        <p className="text-sm text-gray-300 mt-2">Viral Ratio: <span className="text-white font-medium">{vid.viralRatio}</span></p>
                        <div className="mt-2">
                          <h6 className="text-xs font-medium text-gray-200 mb-1">Cấu Trúc Viral:</h6>
                          <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                            {vid.viralStructure.map((struct, j) => <li key={j}>{struct}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Upcoming Trends */}
              {output.upcomingTrends.length > 0 && (
                <div className="p-6 bg-gradient-to-br from-[#CDAD5A]/20 to-[#e0b85a]/20 rounded-xl border border-[#CDAD5A]/30 shadow-lg">
                  <h4 className="text-xl font-bold text-[#CDAD5A] mb-4 flex items-center">
                    <span className="w-2 h-2 bg-[#CDAD5A] rounded-full mr-2"></span>
                    Xu Hướng Sắp Tới
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {output.upcomingTrends.map((trend, i) => (
                      <span key={i} className="px-4 py-2 bg-[#CDAD5A]/20 text-[#CDAD5A] rounded-full text-sm font-medium border border-[#CDAD5A]/30 hover:bg-[#CDAD5A]/30 transition">
                        {trend}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-700 flex gap-4">
                <button
                  onClick={() => alert('Đang phát triển: Export CSV...')}
                  className="flex-1 py-4 bg-gradient-to-r from-[#008080] to-[#00e0e0] text-black font-bold text-lg rounded-lg hover:from-[#00e0e0] hover:to-[#008080] transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                >
                  📤 Export CSV
                </button>
                <button
                  onClick={() => {
                    if (output) {
                      const dataStr = JSON.stringify(output, null, 2);
                      navigator.clipboard.writeText(dataStr);
                      alert('Đã copy kết quả quét vào clipboard!');
                    }
                  }}
                  className="px-6 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-200 border border-gray-600"
                  disabled={!output}
                >
                  📋 Copy Kết Quả
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-[pulse_2s_ease-in-out_infinite] {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HiddenChannelFinderTool;
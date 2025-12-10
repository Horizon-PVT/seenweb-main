// components/HiddenChannelFinderTool.tsx (Hoàn Chỉnh - Gọi Backend + Hiển thị Avatar & Xu Hướng)

import React, { useState, useRef } from 'react';
import { RocketIcon } from './AnimatedIcons'; // Giữ nguyên nếu có

interface RisingChannel {
  name: string;
  url: string;
  subscribers: string;
  videoCount: string;
  growthMetric: string;
  coreStrengths: string[];
  thumbnail: string; // Thêm thumbnail cho avatar
}

interface TrendingVideo {
  title: string;
  url: string;
  viralRatio: string;
  viralStructure: string[];
  thumbnail?: string; // Thêm thumbnail cho video nếu có
}

interface OutputData {
  risingChannels: RisingChannel[];
  trendingVideos: TrendingVideo[];
  upcomingTrends: string[]; // Thêm phần dự đoán xu hướng
}

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="w-32 h-32 text-[#008080]">
      <RocketIcon />
    </div>
    <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">ĐANG TÌM KIẾM KÊNH ẨN...</p>
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
    if (!seedQuery) {
      setError("Vui lòng nhập Từ khóa Khởi đầu.");
      return;
    }
    buttonRef.current?.classList.add('animate-emerald-pulse-strong');
    setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

    setIsLoading(true);
    setError('');
    setOutput(null);

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'hidden',
          seedQuery,
          outputLanguage,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Lỗi ${response.status}`);
      }

      const result = await response.json();

      if (!result.risingChannels || !result.trendingVideos || !result.upcomingTrends) {
        throw new Error("Phản hồi AI không tuân theo cấu trúc JSON được yêu cầu.");
      }

      setOutput(result as OutputData);

    } catch (err: any) {
      setError(`Lỗi: ${err.message || "Không thể tìm kiếm. Vui lòng thử lại."}`);
      console.error("Lỗi gọi API /api/youtube:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 bg-[#1a1a08] hidden-finder-bg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl text-center font-playfair text-[#CDAD5A] tracking-wider">VII. TÌM KÊNH ẨN (HIDDEN CHANNEL FINDER)</h2>
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
        {/* LEFT COLUMN - Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
          <div>
            <label className="text-sm font-bold text-[#CDAD5A] font-playfair">TỪ KHÓA KHỞI ĐẦU</label>
            <textarea value={seedQuery} onChange={e => setSeedQuery(e.target.value)} placeholder="Nhập từ khóa để khởi đầu tìm kiếm (VD: Du lịch Việt Nam, Fitness tại nhà,...)" className="w-full h-24 obsidian-textarea focus:border-[#008080]"></textarea>
          </div>
          <div>
            <label className="text-sm font-bold text-[#CDAD5A] font-playfair">NGÔN NGỮ ĐẦU RA</label>
            <select value={outputLanguage} onChange={e => setOutputLanguage(e.target.value)} className="w-full obsidian-select">
              <option>Tiếng Việt</option>
              <option>English</option>
            </select>
          </div>
          <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
            {isLoading ? "ĐANG TÌM KIẾM..." : "KÍCH HOẠT TÌM KIẾM"}
          </button>
          {error && <p className="text-red-500 text-center text-xs">{error}</p>}
        </form>

        {/* RIGHT COLUMN - Output */}
        <div className="lg:col-span-7 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-2">
          {isLoading && <Loader />}
          {!isLoading && !output && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <div className="w-24 h-24 opacity-20"><RocketIcon /></div>
              <p className="mt-4">Tên lửa đang chờ lệnh tìm kiếm...</p>
            </div>
          )}
          {output && !isLoading && (
            <>
              {/* Rising Channels - Hiển thị nhiều kênh với avatar */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2 font-playfair">KÊNH ĐANG BÙNG NỔ ({output.risingChannels.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {output.risingChannels.map((channel, i) => (
                    <div key={i} className="bg-black/40 border border-[#CDAD5A]/30 rounded-sm p-3 flex flex-col space-y-2">
                      <div className="flex items-center space-x-3">
                        <img src={channel.thumbnail} alt="Avatar" className="w-12 h-12 rounded-full" /> {/* Hiển thị avatar */}
                        <div>
                          <a href={channel.url} target="_blank" rel="noopener noreferrer" className="font-bold text-base text-[#CDAD5A] hover:underline">{channel.name}</a>
                          <p className="text-xs text-gray-400">{channel.subscribers} Subs | {channel.videoCount} Videos</p>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-400 font-bold">{channel.growthMetric}</p>
                      <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                        {channel.coreStrengths.map((strength, j) => <li key={j}>{strength}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Videos - Hiển thị nhiều video với thumbnail nếu có */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2 font-playfair">VIDEO ĐANG BÙNG NỔ ({output.trendingVideos.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {output.trendingVideos.map((video, i) => (
                    <div key={i} className="bg-black/40 border border-[#CDAD5A]/30 rounded-sm p-3 flex flex-col space-y-2">
                      {video.thumbnail && <img src={video.thumbnail} alt="Thumbnail" className="w-full h-24 object-cover rounded" />} {/* Hiển thị thumbnail nếu có */}
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="font-bold text-base text-[#CDAD5A] hover:underline">{video.title}</a>
                      <p className="text-xs text-emerald-400 font-bold">{video.viralRatio}</p>
                      <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                        {video.viralStructure.map((structure, j) => <li key={j}>{structure}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Trends - Phần dự đoán xu hướng */}
              <div className="p-4 bg-emerald-900/20 border-2 border-emerald-700/50 rounded-sm">
                <h4 className="font-bold text-emerald-400 text-base mb-2">DỰ ĐOÁN XU HƯỚNG SẮP TỚI</h4>
                <ul className="list-decimal list-inside text-xs text-gray-300 space-y-1">
                  {output.upcomingTrends.map((trend, i) => <li key={i}>{trend}</li>)}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HiddenChannelFinderTool;
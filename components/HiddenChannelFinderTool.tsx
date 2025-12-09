// File: components/HiddenChannelFinderTool.tsx (Đã sửa lại để gọi Backend)

import React, { useState, useRef } from 'react';
// Xóa: import { GoogleGenAI } from "@google/genai";
import { PortalIcon } from './AnimatedIcons';
import type { Tool } from './ToolsGrid';

// Giữ nguyên các interface
interface ChannelData {
    name: string;
    url: string;
    subscribers: string;
    videoCount: string;
    growthMetric: string;
    coreStrengths: string[];
    thumbnail?: string; // New
    nicheScore?: number; // New
}

interface VideoData {
    title: string;
    url: string;
    viralRatio: string;
    viralStructure: string[];
    thumbnail?: string; // New
}

interface OutputData {
  risingChannels: ChannelData[];
  trendingVideos: VideoData[];
  upcomingTrends: string[];
}

interface HiddenChannelFinderToolProps {
  onBack: () => void;
  onToolSelect: (tool: Tool) => void;
  tools: Tool[];
}

// Giữ nguyên Loader
const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 text-[#CDAD5A] relative">
            <div className="absolute inset-0 border-2 border-[#CDAD5A]/50 rounded-full animate-[gnosis-portal-spin_10s_linear_infinite]"></div>
            <div className="absolute inset-4 border border-[#008080] rounded-full animate-[gnosis-portal-spin_8s_linear_reverse_infinite]"></div>
            <div className="absolute inset-8 border-2 border-[#CDAD5A]/50 rounded-full animate-[gnosis-portal-spin_12s_linear_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <PortalIcon />
            </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">TRUY CẬP CỔNG GNOSIS...</p>
    </div>
);

// Bắt đầu Component
const HiddenChannelFinderTool: React.FC<HiddenChannelFinderToolProps> = ({ onBack, onToolSelect, tools }) => {
    // --- Các state giữ nguyên ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [output, setOutput] = useState<OutputData | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);

    // --- State mới cho tìm kiếm kênh ẩn ---
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('All');
    const [subRange, setSubRange] = useState('0-1k');
    const categories = ['All', 'Gaming', 'Tech', 'Education', 'Music', 'Lifestyle'];
    const subRanges = ['0-1k', '1k-10k', '10k-100k', '100k+'];

    // --- Hàm submit (giữ nguyên + thêm tìm kiếm kênh ẩn) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!urlInput && !keyword) {
            setError('Vui lòng nhập URL hoặc từ khóa.');
            return;
        }
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

        setIsLoading(true);
        setError('');
        setOutput(null);
        setSaveSuccess('');

        try {
            const response = await fetch('/api/youtube', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'hidden',
                    url: urlInput || '',
                    seedQuery: keyword,
                    category,
                    subRange,
                    outputLanguage: 'Tiếng Việt',
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Lỗi server');

            // Thêm thumbnail và niche score (mock if not from API)
            const updatedOutput = {
                ...result,
                risingChannels: result.risingChannels.map((c: ChannelData) => ({
                    ...c,
                    thumbnail: c.url ? `https://img.youtube.com/vi/${c.url.split('v=')[1]?.split('&')[0] || 'default'}/hqdefault.jpg` : '',
                    nicheScore: Math.floor(Math.random() * 100), // Mock, replace with Gemini if needed
                })),
                trendingVideos: result.trendingVideos.map((v: VideoData) => ({
                    ...v,
                    thumbnail: v.url ? `https://img.youtube.com/vi/${v.url.split('v=')[1]?.split('&')[0] || 'default'}/hqdefault.jpg` : '',
                })),
            };
            setOutput(updatedOutput);
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể truy cập cổng Gnosis. Vui lòng thử lại."}`);
            console.error("Lỗi gọi API:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Hàm lưu log ---
    const handleSaveLog = () => {
        if (output) {
            const log = JSON.stringify(output, null, 2);
            const blob = new Blob([log], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gnosis_log_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setSaveSuccess('Đã lưu!');
            setTimeout(() => setSaveSuccess(''), 2000);
        }
    };

    // --- Hàm export CSV ---
    const handleExportCSV = () => {
      if (output?.risingChannels) {
        const csv = output.risingChannels.map(c => `${c.name},${c.url},${c.subscribers},${c.videoCount},${c.growthMetric},${c.coreStrengths.join('|')},${c.nicheScore || ''}`).join('\n');
        const blob = new Blob([`Name,URL,Subscribers,Video Count,Growth Metric,Core Strengths,Niche Score\n${csv}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hidden_channels_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };

    // --- JSX return (giữ nguyên cấu trúc, thêm input mới, hiển thị thumbnail/niche) ---
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 bg-[#1a1008] seo-tuner-bg">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#CDAD5A] tracking-wider">III. TÌM KÊNH ẨN (CHANNEL DISCOVERER)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* LEFT COLUMN - Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">URL HOẶC TỪ KHÓA</label>
                        <input
                            type="text"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            placeholder="Dán URL YouTube hoặc từ khóa..."
                            className="w-full h-10 obsidian-input focus:border-[#008080]"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">TỪ KHÓA</label>
                        <input
                            type="text"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            placeholder="Nhập từ khóa (e.g., gaming, tech)..."
                            className="w-full h-10 obsidian-input focus:border-[#008080]"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-[#008080]">DANH MỤC</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full obsidian-select">
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-[#008080]">KHOẢNG SUBSCRIBER</label>
                        <select value={subRange} onChange={e => setSubRange(e.target.value)} className="w-full obsidian-select">
                            {subRanges.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <button
                        ref={buttonRef}
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "ĐANG TÌM..." : "TRUY CẬP GNOSIS"}
                    </button>
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* RIGHT COLUMN - Output */}
                <div className="lg:col-span-7 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-2">
                    {isLoading && <Loader />}
                    {!isLoading && !output && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <div className="w-24 h-24 opacity-20"><PortalIcon /></div>
                            <p className="mt-4">Channel Discoverer đang chờ lệnh...</p>
                        </div>
                    )}
                    {output && !isLoading && (
                        <>
                            {/* Rising Channels */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-2">KÊNH ĐANG TRƯỞNG THÀNH (TỪ GNOSIS)</h3>
                                <div className="p-4 border-2 border-[#008080] bg-black/50 holographic-output">
                                    <div className="flex flex-wrap gap-2 text-sm mb-2">
                                        <button onClick={handleExportCSV} className="text-xs px-3 py-1 bg-[#CDAD5A] border border-[#CDAD5A] hover:bg-transparent hover:text-[#CDAD5A] rounded-sm">
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {output.risingChannels.map((channel, i) => (
                                            <div key={i} className="p-2 bg-black/40 border border-[#CDAD5A]/50 rounded-sm">
                                                {channel.thumbnail && <img src={channel.thumbnail} alt={channel.name} className="w-full h-auto rounded-sm mb-2" />}
                                                <h4 className="text-sm font-semibold text-[#CDAD5A]">{channel.name}</h4>
                                                <a href={channel.url} target="_blank" className="text-xs text-gray-400 hover:underline">Link</a>
                                                <p className="text-xs text-gray-400">Subs: {channel.subscribers}</p>
                                                <p className="text-xs text-gray-400">Videos: {channel.videoCount}</p>
                                                <p className="text-xs text-gray-400">Growth: {channel.growthMetric}</p>
                                                <p className="text-xs text-gray-400">Strengths: {channel.coreStrengths.join(', ')}</p>
                                                <p className="text-xs text-gray-400">Niche Score: {channel.nicheScore || 'N/A'}/100</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Trending Videos */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-2">VIDEO ĐANG HOT (TỪ GNOSIS)</h3>
                                <div className="p-4 border-2 border-[#008080] bg-black/50 holographic-output">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {output.trendingVideos.map((video, i) => (
                                            <div key={i} className="p-2 bg-black/40 border border-[#CDAD5A]/50 rounded-sm">
                                                {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-full h-auto rounded-sm mb-2" />}
                                                <h4 className="text-sm font-semibold text-[#CDAD5A]">{video.title}</h4>
                                                <a href={video.url} target="_blank" className="text-xs text-gray-400 hover:underline">Link</a>
                                                <p className="text-xs text-gray-400">Viral Ratio: {video.viralRatio}</p>
                                                <p className="text-xs text-gray-400">Structure: {video.viralStructure.join(', ')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Trends */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-2">XU HƯỚNG SẮP TỚI (DỰ BÁO TỪ GNOSIS)</h3>
                                <div className="p-4 border-2 border-[#008080] bg-black/50 holographic-output">
                                    <p className="text-xs text-gray-400 mb-2">Các chủ đề tiềm năng bùng nổ (30/60/90 ngày):</p>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        {output.upcomingTrends.map((trend, i) => (
                                            <span key={i} className="px-3 py-1 bg-[#CDAD5A]/20 text-[#CDAD5A] rounded-full font-semibold">{trend}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-[#1a1008]/80 backdrop-blur-sm">
                                <button onClick={handleSaveLog} className="flex-grow bg-[#008080] text-white font-bold py-2 px-5 border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080]">LƯU VÀO ARCHIVE LOG</button>
                                <button onClick={() => alert('Chức năng xuất PDF đang được phát triển!')} className="flex-grow bg-transparent text-[#CDAD5A] font-bold py-2 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all hover:bg-[#CDAD5A] hover:text-black">XUẤT BÁO CÁO (PDF)</button>
                                <span className="text-xs text-[#CDAD5A] w-24 text-right">{saveSuccess}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
         </div>
    );
};

export default HiddenChannelFinderTool;
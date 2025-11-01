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
} //

interface VideoData {
    title: string;
    url: string;
    viralRatio: string;
    viralStructure: string[];
}

interface OutputData {
  risingChannels: ChannelData[];
  trendingVideos: VideoData[]; //
  upcomingTrends: string[];
}

interface HiddenChannelFinderToolProps {
  onBack: () => void;
  onToolSelect: (tool: Tool) => void;
  tools: Tool[]; //
}

// Giữ nguyên Loader
const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 text-[#CDAD5A] relative">
            <div className="absolute inset-0 border-2 border-[#CDAD5A]/50 rounded-full animate-[gnosis-portal-spin_10s_linear_infinite]"></div>
            <div className="absolute inset-4 border border-[#008080] rounded-full animate-[gnosis-portal-spin_8s_linear_reverse_infinite]"></div>
            <div className="absolute inset-8 border-2 border-[#CDAD5A]/50 rounded-full animate-[gnosis-portal-spin_12s_linear_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center"> {/* */}
                <PortalIcon />
            </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">TRUY CẬP CỔNG GNOSIS...</p>
    </div>
);

// Bắt đầu Component
const HiddenChannelFinderTool: React.FC<HiddenChannelFinderToolProps> = ({ onBack, onToolSelect, tools }) => { //
    // --- Các state giữ nguyên ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); //
    const [output, setOutput] = useState<OutputData | null>(null);
    const [seedQuery, setSeedQuery] = useState('');
    const [minSubs, setMinSubs] = useState(''); //
    const [maxSubs, setMaxSubs] = useState('');
    const [minVideos, setMinVideos] = useState('');
    const [growthVelocity, setGrowthVelocity] = useState('>100%');
    const [nicheCompetition, setNicheCompetition] = useState(0); //
    const [outputLanguage, setOutputLanguage] = useState('Tiếng Việt');
    const [saveSuccess, setSaveSuccess] = useState(''); //
    const buttonRef = useRef<HTMLButtonElement>(null);

    // --- Các hàm helper giữ nguyên ---
    const handleSaveLog = () => { //
      if (!output) return;
      try { //
        const logKey = `gnosisLog_${new Date().toISOString()}`;
        localStorage.setItem(logKey, JSON.stringify(output));
        setSaveSuccess('Đã lưu!');
        setTimeout(() => setSaveSuccess(''), 2000); //
      } catch (e) {
        setSaveSuccess('Lỗi!'); //
      }
    };

    const handleAnalyzeCompetitor = (channelName: string) => { //
        const rivalTool = tools.find(t => t.name === "PHÂN TÍCH ĐỐI THỦ");
        if(rivalTool) { //
            localStorage.setItem('rivalUrlFromGnosis', `Kênh YouTube: ${channelName}`);
            onToolSelect(rivalTool);
        } //
    };

    // --- HÀM handleSubmit MỚI (Gọi Backend /api/hidden-channel-finder) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seedQuery) { //
            setError("Vui lòng nhập Từ Khóa Gốc.");
            return; //
        }
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

        setIsLoading(true);
        setError('');
        setOutput(null);
        setSaveSuccess('');

        try {
            // Gọi backend /api/hidden-channel-finder
            const response = await fetch('/api/hidden-channel-finder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    seedQuery,
                    minSubs,
                    maxSubs,
                    minVideos,
                    growthVelocity,
                    nicheCompetition, // Gửi giá trị number (0 hoặc 1)
                    outputLanguage,
                }),
            });

            const result: any = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${response.status}`);
            }

            // Kiểm tra cấu trúc cơ bản
            if (!result.risingChannels || !result.trendingVideos || !result.upcomingTrends) {
                throw new Error("Phản hồi AI không tuân theo cấu trúc JSON được yêu cầu.");
            }

            setOutput(result as OutputData);

        } catch (err: any) { //
            setError(`Lỗi: ${err.message || "Không thể truy cập Cổng Gnosis."}`);
            console.error("Lỗi gọi API /api/hidden-channel-finder:", err); //
        } finally {
            setIsLoading(false); //
        }
    };

    // --- Phần JSX return giữ nguyên ---
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 bg-[#1a1008] digital-flow-bg bg-opacity-30">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#ff8c00] tracking-wider">IV. TÌM KÊNH ẨN (GNOSIS PORTAL)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
            </div> {/* */}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* LEFT COLUMN - Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
                    {/* Input Seed Query */}
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">TỪ KHÓA GỐC</label> {/* */}
                        <textarea value={seedQuery} onChange={e => setSeedQuery(e.target.value)} placeholder="Nhập chủ đề/ngách bạn quan tâm..." className="w-full h-24 obsidian-textarea focus:border-[#008080]"></textarea>
                    </div>
                    {/* Filters */}
                    <div> {/* */}
                        <label className="text-sm font-bold text-[#008080]">LỌC TÍN HIỆU (MẮT THẦN ORACLE)</label>
                        <div className="space-y-3 mt-2 text-xs">
                           <div>
                                <label>Phạm vi Subscribers</label> {/* */}
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Từ (vd: 1000)" value={minSubs} onChange={e => setMinSubs(e.target.value)} className="w-full obsidian-input bronze !p-2" /> {/* */}
                                    <input type="number" placeholder="Đến (vd: 10000)" value={maxSubs} onChange={e => setMaxSubs(e.target.value)} className="w-full obsidian-input bronze !p-2" />
                                </div>
                            </div> {/* */}
                            <div>
                                <label>Tốc độ Tăng trưởng (30 ngày)</label>
                                <select value={growthVelocity} onChange={e => setGrowthVelocity(e.target.value)} className="w-full obsidian-select bronze !p-2"> {/* */}
                                    <option>&gt;50%</option>
                                    <option>&gt;100%</option>
                                    <option>&gt;200%</option> {/* */}
                                    <option>&gt;300%</option>
                                </select>
                            </div> {/* */}
                            <div>
                                <label>Số video tối thiểu</label>
                                <input type="number" placeholder="vd: 10" value={minVideos} onChange={e => setMinVideos(e.target.value)} className="w-full obsidian-input bronze !p-2" /> {/* */}
                            </div>
                            <div>
                                <label>Cạnh tranh Ngách: <span className="font-mono text-lg text-[#CDAD5A]">{nicheCompetition === 0 ? "Thấp" : "Trung bình"}</span></label> {/* */}
                                <input type="range" min="0" max="1" step="1" value={nicheCompetition} onChange={e => setNicheCompetition(parseInt(e.target.value))} className="w-full obsidian-slider bronze" />
                            </div>
                        </div>
                     </div> {/* */}
                     {/* Output Language */}
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">NGÔN NGỮ ĐẦU RA</label>
                         <select value={outputLanguage} onChange={e => setOutputLanguage(e.target.value)} className="w-full obsidian-select"> {/* */}
                            <option>Tiếng Việt</option>
                            <option>English</option>
                        </select>
                    </div> {/* */}
                    {/* Submit Button */}
                    <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? "ĐANG MỞ CỔNG..." : "KÍCH HOẠT CỔNG GNOSIS"} {/* */}
                    </button>
                    {/* Error Message */}
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* RIGHT COLUMN - Output */}
                <div className="lg:col-span-7 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-2"> {/* */}
                    {/* Loading State */}
                    {isLoading && <Loader />}
                    {/* Initial State */}
                    {!isLoading && !output && (
                         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <div className="w-24 h-24 opacity-20"><PortalIcon /></div> {/* */}
                             <p className="mt-4">Cổng Gnosis đang chờ lệnh...</p>
                         </div>
                    )} {/* */}
                    {/* Output Display */}
                    {output && !isLoading && (
                        <>
                            {/* Rising Channels */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-2">KẾT QUẢ KÊNH ẨN (RISING CHANNELS)</h3> {/* */}
                                <div className="space-y-2">
                                {output.risingChannels.map((channel, i) => (
                                    <div key={i} className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm animate-decode" style={{animationDelay: `${i*100}ms`}}> {/* */}
                                        <div className="flex justify-between items-start flex-wrap gap-x-4">
                                            <a href={channel.url} target="_blank" rel="noopener noreferrer" className="font-bold text-base text-white hover:text-[#CDAD5A] transition-colors">{channel.name}</a> {/* */}
                                            <p className="font-bold text-lg text-emerald-400 emerald-glow">{channel.growthMetric}</p>
                                        </div> {/* */}
                                         <div className="flex gap-4 text-xs text-gray-400 mt-1">
                                            <span><strong className="text-gray-300">Subs:</strong> {channel.subscribers}</span> {/* */}
                                            <span><strong className="text-gray-300">Videos:</strong> {channel.videoCount}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">Ưu điểm cốt lõi:</p> {/* */}
                                        <ul className="list-disc list-inside text-xs text-gray-300 pl-2">
                                            {channel.coreStrengths.map((s, idx) => <li key={idx}>{s}</li>)} {/* */}
                                        </ul>
                                        <button onClick={() => handleAnalyzeCompetitor(channel.name)} className="text-xs mt-2 px-3 py-1 bg-[#008080]/50 border border-[#008080] hover:bg-[#008080] transition-colors rounded-sm">PHÂN TÍCH ĐỐI THỦ</button> {/* */}
                                    </div>
                                ))}
                                </div> {/* */}
                            </div>

                            {/* Trending Videos */}
                             <div>
                                <h3 className="text-sm font-bold text-white mb-2">KẾT QUẢ VIDEO VIRAL ẨN (TRENDING VIDEOS)</h3> {/* */}
                                <div className="space-y-2">
                                {output.trendingVideos.map((video, i) => (
                                    <div key={i} className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm animate-decode" style={{animationDelay: `${(i+5)*100}ms`}}> {/* */}
                                        <div className="flex justify-between items-start">
                                             <a href={video.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-base text-gray-200 hover:text-[#CDAD5A] transition-colors pr-4">{video.title}</a> {/* */}
                                            <p className="font-bold text-lg text-[#CDAD5A] animate-heat-glow">{video.viralRatio}</p>
                                        </div> {/* */}
                                        <p className="text-xs text-gray-400 mt-1">Cấu trúc Viral:</p>
                                        <ul className="list-disc list-inside text-xs text-gray-300 pl-2"> {/* */}
                                             {video.viralStructure.map((s, idx) => <li key={idx}>{s}</li>)}
                                        </ul> {/* */}
                                        <button onClick={() => alert("Chuyển sang công cụ VIẾT LẠI KỊCH BẢN - Đang xây dựng")} className="text-xs mt-2 px-3 py-1 bg-[#008080]/50 border border-[#008080] hover:bg-[#008080] transition-colors rounded-sm">TÁI CẤU TRÚC Ý TƯỞỞNG</button>
                                    </div> //
                                ))}
                                </div>
                             </div> {/* */}

                            {/* Upcoming Trends */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-2">XU HƯỚNG SẮP TỚI (DỰ BÁO TỪ GNOSIS)</h3>
                                <div className="p-4 border-2 border-[#008080] bg-black/50 holographic-output"> {/* */}
                                    <p className="text-xs text-gray-400 mb-2">Các chủ đề có tiềm năng bùng nổ trong 60 ngày tới:</p>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                    {output.upcomingTrends.map((trend, i) => ( //
                                        <span key={i} className="px-3 py-1 bg-[#CDAD5A]/20 text-[#CDAD5A] rounded-full font-semibold">{trend}</span>
                                    ))} {/* */}
                                    </div>
                                </div>
                             </div> {/* */}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-[#1a1008]/80 backdrop-blur-sm">
                                <button onClick={handleSaveLog} className="flex-grow bg-[#008080] text-white font-bold py-2 px-5 border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080]">LƯU VÀO ARCHIVE LOG</button> {/* */}
                                <button onClick={() => alert('Chức năng xuất PDF đang được phát triển!')} className="flex-grow bg-transparent text-[#CDAD5A] font-bold py-2 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all hover:bg-[#CDAD5A] hover:text-black">XUẤT BÁO CÁO (PDF)</button>
                                 <span className="text-xs text-[#CDAD5A] w-24 text-right">{saveSuccess}</span>
                             </div> {/* */}
                        </>
                    )}
                </div>
            </div>
         </div> //
    );
};

export default HiddenChannelFinderTool; //
// File: components/MicroNicheMinerTool.tsx (Hoàn Chỉnh - Gọi Backend)

import React, { useState, useRef } from 'react';
// Xóa: import { GoogleGenAI } from "@google/genai";
import { CompassIcon } from './AnimatedIcons'; //
import type { Tool } from './ToolsGrid'; //

// Giữ nguyên các interface
interface NicheData {
  nicheName: string;
  overallScore: number;
  competitionScore: number;
  searchVolumeScore: number;
  monetizationScore: number;
  pioneerVideoTopics: string[];
  miningScript: { //
    tone: string;
    frequency: string;
    monetizationGoal: string;
  };
  lowFloorChannels: {
    name: string;
    url: string; //
  }[];
}

interface OutputData {
  topNiches: NicheData[];
  saturatedNichesWarning: string[]; //
}

interface MicroNicheMinerToolProps {
  onBack: () => void;
  onToolSelect: (tool: Tool) => void;
  tools: Tool[]; //
}

// Giữ nguyên Loader
const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-32 h-32 text-[#008080]">
            <CompassIcon />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">ĐANG KHAI THÁC PHÂN KHÚC VÀNG...</p>
    </div>
);

// Giữ nguyên NicheCard
const NicheCard: React.FC<{ niche: NicheData, delay: number, onUse: () => void }> = ({ niche, delay, onUse }) => { //
    const [isOpen, setIsOpen] = useState(false);

    const ProgressBar: React.FC<{ label: string; value: number, invertColor?: boolean }> = ({ label, value, invertColor }) => { //
        let barClass = "progress-bar-fg";
        if (invertColor && value > 75) { //
            barClass = "bg-red-500 shadow-[0_0_8px_#ef4444]";
        } else if (invertColor && value > 50) { //
            barClass = "bg-yellow-500 shadow-[0_0_8px_#eab308]";
        }

        return (
            <div>
                <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-bold text-white">{value}/100</span>
                </div> {/* */}
                <div className="w-full progress-bar-bg rounded-full h-2">
                    <div className={`${barClass} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
                </div>
            </div>
        );
    }; //

    return (
        <div className="bg-black/40 border border-[#CDAD5A]/30 rounded-sm animate-unearth" style={{ animationDelay: `${delay}ms` }}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-3 text-left flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-base text-[#CDAD5A]">{niche.nicheName}</h4>
                    <p className="text-xs text-gray-400">Điểm tiềm năng: <span className="text-xl font-bold text-emerald-400">{niche.overallScore}/10</span></p> {/* */}
                </div>
                <span className={`text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45 text-[#CDAD5A]' : 'text-[#008080]'}`}>+</span>
            </button>
            {isOpen && (
                <div className="p-3 border-t border-[#CDAD5A]/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3"> {/* */}
                        <ProgressBar label="Cạnh tranh" value={niche.competitionScore} invertColor={true} />
                        <ProgressBar label="Lượng tìm kiếm" value={niche.searchVolumeScore} />
                        <ProgressBar label="Kiếm tiền" value={niche.monetizationScore} /> {/* */}
                    </div>
                    <div>
                        <h5 className="font-bold text-sm text-white mb-2">10 Chủ đề Video Tiên phong:</h5>
                        <ul className="list-decimal list-inside text-xs text-gray-300 space-y-1"> {/* */}
                            {niche.pioneerVideoTopics.map((topic, i) => <li key={i}>{topic}</li>)}
                        </ul>
                    </div>
                    <div> {/* */}
                        <h5 className="font-bold text-sm text-white mb-2">Kịch bản Khai thác Gọn:</h5>
                        <div className="text-xs text-gray-300 space-y-1">
                            <p><strong className="text-[#008080]">Tông giọng:</strong> {niche.miningScript.tone}</p>
                            <p><strong className="text-[#008080]">Tần suất:</strong> {niche.miningScript.frequency}</p> {/* */}
                            <p><strong className="text-[#008080]">Mục tiêu Kiếm tiền:</strong> {niche.miningScript.monetizationGoal}</p>
                        </div>
                    </div> {/* */}
                     <div>
                        <h5 className="font-bold text-sm text-white mb-2">Kênh Thấp Tầng (Bằng chứng khả thi):</h5>
                        <div className="text-xs text-gray-300 space-y-1">
                            {niche.lowFloorChannels.map((channel, i) => ( //
                                <a key={i} href={channel.url} target="_blank" rel="noopener noreferrer" className="block hover:text-[#CDAD5A] underline">{channel.name}</a>
                            ))}
                        </div> {/* */}
                    </div>
                    <button onClick={onUse} className="w-full text-xs mt-2 px-3 py-2 bg-[#008080] text-white font-bold border-2 border-[#008080] hover:bg-transparent hover:text-[#008080] transition-colors rounded-sm">SỬ DỤNG NGÁCH NÀY CHO KỊCH BẢN</button>
                </div>
            )}
        </div> /* */
    );
};

// Bắt đầu Component Chính
const MicroNicheMinerTool: React.FC<MicroNicheMinerToolProps> = ({ onBack, onToolSelect, tools }) => {
    // --- Các state giữ nguyên ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); //
    const [output, setOutput] = useState<OutputData | null>(null);
    const [macroNiche, setMacroNiche] = useState('');
    const [competition, setCompetition] = useState(20); //
    const [searchVolume, setSearchVolume] = useState(50);
    const [monetization, setMonetization] = useState(50);
    const [outputLanguage, setOutputLanguage] = useState('Tiếng Việt'); //
    const buttonRef = useRef<HTMLButtonElement>(null);

    // --- Hàm helper handleUseForScript giữ nguyên ---
    const handleUseForScript = (niche: NicheData) => { //
        const scriptTool = tools.find(t => t.name === "VIẾT KỊCH BẢN");
        if (scriptTool) { //
            const videoIdeas = niche.pioneerVideoTopics.map((title, i) => `${i+1}. ${title}`).join('\n');
            const idea = `Tôi muốn tạo video cho ngách "${niche.nicheName}". Dưới đây là 10 ý tưởng video tiềm năng để bắt đầu:\n${videoIdeas}\nHãy giúp tôi phát triển ý tưởng đầu tiên thành một kịch bản hoàn chỉnh.`; //
            localStorage.setItem('scriptIdeaFromRival', idea); //
            onToolSelect(scriptTool);
        }
    };

    // --- HÀM handleSubmit MỚI (Gọi Backend /api/micro-niche-miner) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!macroNiche) { //
            setError("Vui lòng nhập Lĩnh vực Khai thác.");
            return; //
        }
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

        setIsLoading(true);
        setError('');
        setOutput(null);

        // Không cần tạo prompt ở đây nữa

        try {
            // Gọi backend /api/micro-niche-miner
            const response = await fetch('/api/micro-niche-miner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    macroNiche,
                    competition, // Gửi giá trị number
                    searchVolume, // Gửi giá trị number
                    monetization, // Gửi giá trị number
                    outputLanguage,
                }),
            });

            const result: any = await response.json(); // Backend trả JSON

            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${response.status}`);
            }

            // Kiểm tra cấu trúc cơ bản
            if (!result.topNiches || !result.saturatedNichesWarning) {
                throw new Error("Phản hồi AI không tuân theo cấu trúc JSON được yêu cầu.");
            }

            setOutput(result as OutputData);

        } catch (err: any) { //
            setError(`Lỗi: ${err.message || "Không thể khai thác. Vui lòng thử lại."}`);
            console.error("Lỗi gọi API /api/micro-niche-miner:", err); //
        } finally {
            setIsLoading(false); //
        }
    };

    // --- Phần JSX return giữ nguyên ---
    // (Giống hệt file gốc)
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 bg-[#1a1a08] niche-miner-bg">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#CDAD5A] tracking-wider">VIII. TÌM MICRO NICHES (MICRO NICHE MINER)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
            </div> {/* */}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* LEFT COLUMN - Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
                    {/* Macro Niche Input */}
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">LĨNH VỰC KHAI THÁC</label> {/* */}
                        <textarea value={macroNiche} onChange={e => setMacroNiche(e.target.value)} placeholder="Nhập lĩnh vực lớn (Macro Niche) bạn quan tâm (VD: Đầu tư, Ẩm thực, Thú cưng,...)" className="w-full h-24 obsidian-textarea focus:border-[#008080]"></textarea>
                    </div>
                    {/* Filters */}
                    <div>
                        <label className="text-sm font-bold text-[#008080]">LỌC RỦI RO</label> {/* */}
                        <div className="space-y-3 mt-2 text-xs">
                           <div>
                                <label>Mức độ Cạnh tranh: <span className="font-mono text-lg text-[#CDAD5A]">{competition <= 25 ? "Rất Thấp" : "Thấp"}</span></label> {/* */}
                                <input type="range" min="0" max="50" value={competition} onChange={e => setCompetition(parseInt(e.target.value))} className="w-full obsidian-slider bronze" />
                           </div>
                            <div> {/* */}
                                <label>Lượng tìm kiếm Tiềm năng: <span className="font-mono text-lg text-[#CDAD5A]">{searchVolume < 60 ? "Trung bình" : "Cao"}</span></label> {/* */}
                                <input type="range" min="30" max="100" value={searchVolume} onChange={e => setSearchVolume(parseInt(e.target.value))} className="w-full obsidian-slider bronze" />
                           </div>
                            <div> {/* */}
                                <label>Khả năng Kiếm tiền: <span className="font-mono text-lg text-[#CDAD5A]">{monetization < 60 ? "Thấp" : "Cao"}</span></label> {/* */}
                                <input type="range" min="30" max="100" value={monetization} onChange={e => setMonetization(parseInt(e.target.value))} className="w-full obsidian-slider bronze" />
                           </div>
                        </div>
                    </div> {/* */}
                    {/* Output Language */}
                     <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">NGÔN NGỮ ĐẦU RA</label>
                         <select value={outputLanguage} onChange={e => setOutputLanguage(e.target.value)} className="w-full obsidian-select">
                            <option>Tiếng Việt</option> {/* */}
                            <option>English</option>
                        </select>
                    </div> {/* */}
                    {/* Submit Button */}
                    <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? "ĐANG KHAI THÁC..." : "KÍCH HOẠT KHAI THÁC"} {/* */}
                    </button>
                    {/* Error Message */}
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* RIGHT COLUMN - Output */}
                <div className="lg:col-span-7 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-2">
                    {/* Loading State */}
                    {isLoading && <Loader />} {/* */}
                    {/* Initial State */}
                    {!isLoading && !output && (
                         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <div className="w-24 h-24 opacity-20"><CompassIcon /></div> {/* */}
                             <p className="mt-4">La bàn đang chờ lệnh khai thác...</p>
                         </div>
                    )}
                    {/* Output Display */}
                    {output && !isLoading && ( //
                        <>
                            {/* Top Niches */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">BẢN ĐỒ VỊ TRÍ 10 NGÁCH VÀNG</h3> {/* */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {output.topNiches.map((niche, i) => (
                                        <NicheCard key={i} niche={niche} delay={i * 80} onUse={() => handleUseForScript(niche)} /> //
                                    ))}
                                </div>
                             </div> {/* */}

                            {/* Saturated Niches Warning */}
                            {output.saturatedNichesWarning.length > 0 && (
                                <div className="p-4 bg-red-900/20 border-2 border-red-700/50 rounded-sm"> {/* */}
                                    <h4 className="font-bold text-red-400 text-base mb-2">CẢNH BÁO: KHU VỰC BÃO HÒA</h4>
                                    <p className="text-xs text-gray-300 mb-2">Gnosis Portal cảnh báo các ngách sau có độ cạnh tranh rất cao hoặc tiềm ẩn rủi ro. Cân nhắc kỹ trước khi tham gia:</p> {/* */}
                                    <div className="flex flex-wrap gap-2">
                                        {output.saturatedNichesWarning.map(warning => (
                                            <span key={warning} className="px-2 py-1 bg-red-800/50 text-red-300 text-xs rounded-sm">{warning}</span> //
                                        ))}
                                    </div>
                                </div> //
                            )}

                            {/* Action Buttons */}
                             <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-[#1a1a08]/80 backdrop-blur-sm"> {/* */}
                                <button onClick={() => alert('Đang phát triển...')} className="flex-grow bg-[#008080] text-white font-bold py-2 px-5 border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080]">LƯU 10 NICHE VÀO LOG</button>
                                <button onClick={() => alert('Đang phát triển...')} className="flex-grow bg-transparent text-[#CDAD5A] font-bold py-2 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all hover:bg-[#CDAD5A] hover:text-black">XUẤT BÁO CÁO (PDF)</button> {/* */}
                            </div>
                        </>
                    )}
                </div> {/* */}
            </div>
        </div>
    );
}; //

export default MicroNicheMinerTool; //
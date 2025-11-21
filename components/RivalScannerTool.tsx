// File: components/RivalScannerTool.tsx (Bản Sửa Lỗi Hoàn Chỉnh)

import React, { useState, useRef } from 'react';
// Import GoogleGenAI và Type nếu bạn cần dùng OutputData, nếu không có thể xóa
// import { GoogleGenAI, Type } from "@google/genai";
import { BinocularsIcon } from './AnimatedIcons';
import type { Tool } from './ToolsGrid'; // Import kiểu Tool

// Định nghĩa lại OutputData ở đây (hoặc import từ file dùng chung/API route)
interface OutputData {
  competitorProfile: {
    name: string;
  };
  strategicWeaknesses: string[];
  successSignals: string[];
  contentStructure: {
    mainKeywords: string[];
    seoEvaluation: string;
  };
  untappedNiches?: string[];
  counterAttackPlan: string;
}

interface RivalScannerToolProps {
  onBack: () => void;
  onToolSelect: (tool: Tool) => void;
  tools: Tool[];
}

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 text-[#008080] relative">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-[#008080] emerald-glow animate-[scanner-beam-pulse_1s_infinite]" />
            </div>
            <div className="absolute inset-0">
                <div className="w-1/2 h-full float-left" style={{ animation: 'scanner-rotate-left 4s linear infinite' }}>
                    <BinocularsIcon />
                </div>
                <div className="w-1/2 h-full float-right" style={{ animation: 'scanner-rotate-right 4s linear infinite' }}>
                    <BinocularsIcon />
                </div>
            </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">GIẢI MÃ CHIẾN LƯỢC...</p>
    </div>
);

// BẮT ĐẦU COMPONENT
const RivalScannerTool: React.FC<RivalScannerToolProps> = ({ onBack, onToolSelect, tools }) => {
    // --- Các state giữ nguyên ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [output, setOutput] = useState<OutputData | null>(null);
    const [targetUrl, setTargetUrl] = useState('');
    const [scanScope, setScanScope] = useState('channel');
    const [outputLanguage, setOutputLanguage] = useState('Tiếng Việt');
    const [saveSuccess, setSaveSuccess] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);

    // --- Các hàm handleSaveProfile, handleUseForScript giữ nguyên ---
     const handleSaveProfile = () => {
        if (!output) return;
        try {
          const profileKey = `rivalProfile_${output.competitorProfile.name.replace(/\s/g, '_')}`;
          localStorage.setItem(profileKey, JSON.stringify(output));
          setSaveSuccess('Đã lưu!');
          setTimeout(() => setSaveSuccess(''), 2000);
        } catch (e) {
          console.error("Failed to save profile:", e);
          setSaveSuccess('Lưu thất bại!');
          setTimeout(() => setSaveSuccess(''), 2000);
        }
    };

    const handleUseForScript = () => {
        if (!output) return;
        const scriptTool = tools.find(t => t.name === "VIẾT KỊCH BẢN");
        if (scriptTool) {
            const weaknessesText = output.strategicWeaknesses.join(', ');
            const nichesText = output.untappedNiches ? output.untappedNiches.join(', ') : '';

            let idea = `Dựa trên phân tích đối thủ "${output.competitorProfile.name}", hãy tạo một kịch bản video khai thác các điểm yếu sau: ${weaknessesText}.`;
            if (nichesText && nichesText.length > 0) {
                idea += ` Đồng thời, tập trung vào các ngách thị trường chưa được khai thác: ${nichesText}.`;
            }

            localStorage.setItem('scriptIdeaFromRival', idea);
            onToolSelect(scriptTool);
        }
    };

    // --- Hàm handleSubmit đã sửa ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUrl) {
            setError("Vui lòng dán URL của đối thủ.");
            return;
        }
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

        setIsLoading(true);
        setError('');
        setOutput(null);
        setSaveSuccess('');

        try {
            const response = await fetch('/api/rival-scanner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetUrl,
                    scanScope,
                    outputLanguage,
                }),
            });

            // Sử dụng kiểu 'any' tạm thời hoặc định nghĩa kiểu chi tiết hơn
            const result: any = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${response.status}`);
            }

            // Kiểm tra cấu trúc cơ bản trước khi ép kiểu
            if (!result.competitorProfile || !result.strategicWeaknesses) {
                throw new Error("Dữ liệu trả về từ API không đúng cấu trúc.");
            }

            setOutput(result as OutputData);

        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể giải mã. Vui lòng thử lại."}`);
            console.error("Lỗi gọi API /api/rival-scanner:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Phần JSX return ---
    // Đảm bảo phần này giống hệt file gốc components/RivalScannerTool.tsx
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 digital-flow-bg bg-black/50">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#dd4444] tracking-wider">III. PHÂN TÍCH ĐỐI THỦ (RIVAL SCANNER)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* LEFT COLUMN */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">ĐỊNH DANH MỤC TIÊU</label>
                        <textarea value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="Dán URL kênh YouTube hoặc URL video cụ thể của đối thủ..." className="w-full h-24 obsidian-textarea focus:border-[#008080]"></textarea>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-[#008080]">PHẠM VI QUÉT</label>
                        <div className="space-y-2 mt-1 text-xs">
                            {['channel', 'video', 'niche'].map(scope => (
                                <label key={scope} className="flex items-center gap-2 p-2 bg-[#0A0A0A] border border-[#4A4A4A] rounded-sm has-[:checked]:border-[#008080] has-[:checked]:bg-[#008080]/10 transition-colors cursor-pointer">
                                    <input type="radio" name="scope" value={scope} checked={scanScope === scope} onChange={() => setScanScope(scope)} className="hidden" />
                                    <div className="w-4 h-4 border-2 border-gray-500 rounded-full flex items-center justify-center">{scanScope === scope && <div className="w-2 h-2 bg-[#008080] rounded-full"></div>}</div>
                                    <span>{scope === 'channel' ? 'Quét Kênh Toàn diện' : scope === 'video' ? 'Quét Video Cụ thể' : 'Quét Ngách Thị trường'}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">NGÔN NGỮ ĐẦU RA</label>
                         <select value={outputLanguage} onChange={e => setOutputLanguage(e.target.value)} className="w-full obsidian-select">
                            <option>Tiếng Việt</option>
                            <option>English</option>
                        </select>
                    </div>
                    <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? "ĐANG GIẢI MÃ..." : "GIẢI MÃ CHIẾN LƯỢC"}
                    </button>
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-7 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-2">
                    {isLoading && <Loader />}
                    {!isLoading && !output && (
                         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <div className="w-24 h-24 opacity-20"><BinocularsIcon /></div>
                             <p className="mt-4">Sẵn sàng quét tín hiệu đối thủ...</p>
                         </div>
                    )}
                    {output && (
                        <div className="space-y-3">
                            <div className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm">
                                <h3 className="text-lg font-bold text-[#CDAD5A] font-playfair">{output.competitorProfile.name}</h3>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 bg-black/40 border border-[#008080]/50 rounded-sm">
                                  <h4 className="font-bold text-white mb-2">B. TÍN HIỆU THÀNH CÔNG</h4>
                                  <ul className="space-y-2 text-xs">
                                    {output.successSignals.map((item, i) => (
                                      <li key={i} className="flex items-start">
                                        <span className="text-emerald-400 mr-2 mt-1">✔</span>
                                        <span className="text-gray-300">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="p-3 bg-black/40 border border-[#660000]/80 rounded-sm">
                                  <h4 className="font-bold text-white mb-2">A. LỖ HỔNG CHIẾN LƯỢC</h4>
                                  <ul className="space-y-2 text-xs">
                                    {output.strategicWeaknesses.map((item, i) => (
                                      <li key={i} className="flex items-start">
                                        <span className="text-red-500 mr-2 mt-1">✘</span>
                                        <span className="text-gray-300">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                            </div>
                             <div className="p-3 bg-black/40 border border-[#008080]/50 rounded-sm">
                                <h4 className="font-bold text-white mb-2">C. CẤU TRÚC NỘI DUNG (SEO CORE)</h4>
                                <div className="text-xs">
                                    <p className="text-gray-400">Từ khóa chính:</p>
                                    <div className="flex flex-wrap gap-2 my-2">
                                        {output.contentStructure.mainKeywords.map(kw => <span key={kw} className="px-2 py-1 bg-[#CDAD5A]/20 text-[#CDAD5A] rounded-sm">{kw}</span>)}
                                    </div>
                                    <p className="text-gray-400 mt-2">Đánh giá SEO:</p>
                                    <p className="text-gray-300">{output.contentStructure.seoEvaluation}</p>
                                </div>
                            </div>
                             {output.untappedNiches && output.untappedNiches.length > 0 && (
                                <div className="p-3 bg-black/40 border border-[#008080]/50 rounded-sm">
                                  <h4 className="font-bold text-white mb-2">D. LƯU LƯỢNG NGÁCH</h4>
                                   <p className="text-xs text-gray-400 mb-2">Các ngách thị trường tiềm năng đối thủ chưa khai thác hết:</p>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    {output.untappedNiches.map((niche, i) => (
                                       <span key={i} className="px-2 py-1 bg-[#008080]/20 text-[#00e0e0] rounded-sm">{niche}</span>
                                    ))}
                                  </div>
                                </div>
                             )}
                            <div className="p-3 bg-black/40 border border-[#008080]/50 rounded-sm">
                                <h4 className="font-bold text-white mb-2">KỊCH BẢN PHẢN CÔNG</h4>
                                <p className="text-xs text-gray-300">{output.counterAttackPlan}</p>
                            </div>
                            <div className="flex items-center gap-4 pt-2 sticky bottom-0 bg-black/80 backdrop-blur-sm">
                                <button onClick={handleSaveProfile} className="flex-grow bg-[#008080] text-white font-bold py-2 px-4 border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080] text-xs">LƯU TRỮ HỒ SƠ ĐỐI THỦ</button>
                                <button onClick={handleUseForScript} className="flex-grow bg-transparent text-[#CDAD5A] font-bold py-2 px-4 border-2 border-[#CDAD5A] rounded-sm transition-all hover:bg-[#CDAD5A] hover:text-black text-xs">SỬ DỤNG CHO KỊCH BẢN</button>
                                <span className="text-xs text-[#CDAD5A] w-24 text-right">{saveSuccess}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; // <--- Kết thúc component

// THÊM DÒNG NÀY VÀO CUỐI
export default RivalScannerTool;
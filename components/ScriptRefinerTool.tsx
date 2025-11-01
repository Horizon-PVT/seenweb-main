// File: components/ScriptRefinerTool.tsx (Hoàn Chỉnh - Gọi Backend)

import React, { useState, useRef } from 'react';
// Xóa: import { GoogleGenAI, Type } from "@google/genai";
import { HourglassIcon } from './AnimatedIcons';
import DOMPurify from 'dompurify'; // Giữ lại import này

interface ScriptRefinerToolProps {
  onBack: () => void;
}

// Giữ lại interface OutputData
interface OutputData {
  refinedScript: string;
  diffScript: string;
  metrics: {
    uniqueness: string;
    similarity: string;
    readTime: string;
    wordCount: number;
  };
}

// Giữ lại Loader
const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 text-[#008080]">
            <HourglassIcon />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">ĐANG TÁI CẤU TRÚC...</p>
    </div>
);

// Bắt đầu Component
const ScriptRefinerTool: React.FC<ScriptRefinerToolProps> = ({ onBack }) => {
    // --- Các state giữ nguyên ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [originalScript, setOriginalScript] = useState('');
    const [output, setOutput] = useState<OutputData | null>(null);
    const [diffView, setDiffView] = useState(false);
    const [rewriteLevel, setRewriteLevel] = useState('Standard');
    const [optimizeGoal, setOptimizeGoal] = useState('Engagement');
    const [language, setLanguage] = useState('Original');
    const [initialChatRequest, setInitialChatRequest] = useState('');
    const [iterativeChatRequest, setIterativeChatRequest] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    // --- Các hàm helper giữ nguyên ---
    const handleCopy = () => {
        if (output?.refinedScript) {
            navigator.clipboard.writeText(output.refinedScript).then(() => {
                setCopySuccess('Đã sao chép!');
                setTimeout(() => setCopySuccess(''), 2000);
            });
        }
    };

    const handleExport = (format: 'txt' | 'pdf') => {
        if (!output?.refinedScript) return;
        if (format === 'pdf') {
            alert('Chức năng xuất PDF đang được phát triển!');
            return;
        }
        const blob = new Blob([output.refinedScript], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'refined-script-seenvt.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- XÓA CÁC HÀM GỌI GEMINI CŨ ---
    // const runGeminiWithSchema = async (...) => { ... }; // Đã xóa
    // const runGeminiStreamForUpdate = async (...) => { ... }; // Đã xóa


    // --- HÀM handleSubmit MỚI (Gọi Backend /api/script-refiner-initial) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originalScript) {
            setError("Vui lòng nhập nội dung nguyên bản.");
            return;
        }
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

        setIsLoading(true);
        setError('');
        setOutput(null);
        setCopySuccess('');

        try {
            const response = await fetch('/api/script-refiner-initial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalScript,
                    rewriteLevel,
                    optimizeGoal,
                    language,
                    initialChatRequest,
                }),
            });

            const result: any = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${response.status}`);
            }

            if (!result.refinedScript || !result.diffScript || !result.metrics) {
                 throw new Error("Dữ liệu trả về từ API không đúng cấu trúc.");
            }

            setOutput(result as OutputData);

        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể tái cấu trúc. Vui lòng thử lại."}`);
            console.error("Lỗi gọi API /api/script-refiner-initial:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM handleIterativeSubmit MỚI (Gọi Backend /api/script-refiner-iterative) ---
    const handleIterativeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!iterativeChatRequest || !output?.refinedScript) return;

        setIsLoading(true);
        setError('');
        const currentScriptForRequest = output.refinedScript;
        const requestText = iterativeChatRequest;
        setIterativeChatRequest('');

        try {
            const response = await fetch('/api/script-refiner-iterative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentScript: currentScriptForRequest,
                    iterativeChatRequest: requestText,
                }),
            });

            const editedScriptText = await response.text();

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}: ${editedScriptText}`;
                try { errorMessage = JSON.parse(editedScriptText).error || errorMessage; } catch (e) { /* Ignore */ }
                throw new Error(errorMessage);
            }

            // Cập nhật lại refinedScript, giữ nguyên diff/metrics
            setOutput(prev => prev ? {
                ...prev,
                refinedScript: editedScriptText
            } : null);

             if (outputRef.current) {
                outputRef.current.classList.add('binary-update-effect');
                setTimeout(() => {
                    outputRef.current?.classList.remove('binary-update-effect');
                }, 500);
            }

        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể chỉnh sửa. Vui lòng thử lại."}`);
            console.error("Lỗi gọi API /api/script-refiner-iterative:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Phần JSX return giữ nguyên ---
    // (Giống hệt file gốc takeuchi999999999-png/t-ng-1-/t-ng-1--8b1251be0ac36a0ed1b7d1a7a42014a6663853b3/components/ScriptRefinerTool.tsx)
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 bg-[#1a2e1a] digital-flow-bg bg-opacity-30">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#90ee90] tracking-wider">V. VIẾT LẠI KỊCH BẢN (SCRIPT REFINER)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* LEFT COLUMN - Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-4 flex flex-col space-y-3 pr-2 overflow-y-auto">
                    {/* Original Script Input */}
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">NỘI DUNG NGUYÊN BẢN</label>
                        <textarea value={originalScript} onChange={e => setOriginalScript(e.target.value)} placeholder="Dán kịch bản hoặc văn bản gốc vào đây..." className="w-full h-48 obsidian-textarea focus:border-[#008080]"></textarea>
                    </div>
                    {/* Rewrite Options */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-xs font-bold text-[#CDAD5A]">MỨC ĐỘ VIẾT LẠI</label>
                           <select value={rewriteLevel} onChange={e => setRewriteLevel(e.target.value)} className="w-full obsidian-select">
                               <option value="Minor">Thay đổi nhỏ</option>
                               <option value="Standard">Tiêu chuẩn</option>
                               <option value="Complete">Hoàn toàn mới</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-[#CDAD5A]">MỤC TIÊU TỐI ƯU</label>
                           <select value={optimizeGoal} onChange={e => setOptimizeGoal(e.target.value)} className="w-full obsidian-select">
                               <option value="Engagement">Tương tác</option>
                               <option value="Clarity">Rõ ràng</option>
                               <option value="SEO">SEO</option>
                           </select>
                        </div>
                    </div>
                    {/* Language Option */}
                     <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">CHUYỂN NGÔN NGỮ</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full obsidian-select">
                            <option value="Original">Giữ nguyên</option>
                            <option value="English">Tiếng Anh</option>
                            <option value="Tiếng Việt">Tiếng Việt</option>
                            {/* Thêm các ngôn ngữ khác nếu API backend hỗ trợ */}
                        </select>
                    </div>
                    {/* Initial Chat Request */}
                    <div>
                        <label className="text-sm font-bold text-[#008080]">CHAT: GỬI HƯỚNG DẪN BỔ SUNG</label>
                        <input type="text" value={initialChatRequest} onChange={e => setInitialChatRequest(e.target.value)} placeholder="VD: 'Phần hook phải kịch tính hơn'..." className="w-full obsidian-input" />
                    </div>
                    {/* Submit Button */}
                    <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading && !output ? "ĐANG TÁI CẤU TRÚC..." : "TÁI CẤU TRÚC NỘI DUNG"}
                    </button>
                    {/* Error Message */}
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* RIGHT COLUMN - Output */}
                <div className="lg:col-span-6 flex flex-col space-y-3 min-h-0">
                    {/* Loading State */}
                    {isLoading && !output && <Loader />}
                    {/* Initial State */}
                    {!isLoading && !output && (
                         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <div className="w-24 h-24 opacity-20"><HourglassIcon /></div>
                             <p className="mt-4">Chờ nội dung để tái cấu trúc...</p>
                         </div>
                    )}
                    {/* Output Display */}
                    {output && (
                        <>
                            {/* Metrics Display */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center p-2 bg-black/30 border border-gray-700/50 rounded-sm">
                                <div><p className="font-bold text-lg text-[#008080]">{output.metrics.uniqueness}</p><p className="text-xs text-gray-400">Độ Độc Đáo</p></div>
                                <div><p className="font-bold text-lg text-gray-300">{output.metrics.similarity}</p><p className="text-xs text-gray-400">Độ Tương Đồng</p></div>
                                <div><p className="font-bold text-lg text-gray-300">{output.metrics.readTime}</p><p className="text-xs text-gray-400">Thời Gian Đọc</p></div>
                                <div><p className="font-bold text-lg text-gray-300">{output.metrics.wordCount}</p><p className="text-xs text-gray-400">Số Từ</p></div>
                            </div>

                            {/* Script/Diff Display */}
                            <div ref={outputRef} className={`holographic-output flex-grow p-3 text-sm overflow-y-auto whitespace-pre-wrap font-mono ${diffView ? 'diff-view' : ''}`}>
                               {isLoading && <Loader /> /* Hiển thị loader nhỏ khi đang chat */}
                               {!isLoading && (diffView
                                 ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output.diffScript) }} />
                                 : output.refinedScript
                               )}
                            </div>

                            {/* Iterative Chat Form */}
                            <form onSubmit={handleIterativeSubmit} className="space-y-2">
                               <label className="text-sm font-bold text-[#CDAD5A]">CHAT: YÊU CẦU CHỈNH SỬA THÊM</label>
                               <div className="flex items-center gap-2">
                                  <input type="text" value={iterativeChatRequest} onChange={e => setIterativeChatRequest(e.target.value)} placeholder="VD: 'Kéo dài đoạn 3 thêm 50 từ'..." className="w-full obsidian-input !py-1 text-xs" disabled={isLoading} />
                                  <button type="submit" className="text-xs p-1 px-3 bg-[#008080]/50 border border-[#008080] hover:bg-[#008080] transition-colors rounded-sm disabled:opacity-50" disabled={!iterativeChatRequest || isLoading}>Gửi</button>
                               </div>
                            </form>

                            {/* Action Buttons & Diff Toggle */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                               <div className="flex items-center gap-2">
                                  <button onClick={handleCopy} className="text-xs py-2 px-3 bg-[#008080] text-white font-bold border border-[#008080] rounded-sm hover:bg-transparent hover:text-[#008080] transition-colors" disabled={isLoading}>SAO CHÉP</button>
                                  <button onClick={() => alert('Đang phát triển...')} className="text-xs py-2 px-3 bg-[#CDAD5A] text-black font-bold border border-[#CDAD5A] rounded-sm hover:bg-transparent hover:text-[#CDAD5A] transition-colors" disabled={isLoading}>LƯU VÀO LOG</button>
                                  <button onClick={() => handleExport('txt')} className="text-xs py-2 px-3 bg-transparent border border-gray-600 rounded-sm hover:border-[#CDAD5A] hover:text-[#CDAD5A] transition-colors" disabled={isLoading}>XUẤT FILE</button>
                                  <button disabled className="text-xs py-2 px-3 bg-gray-700 text-gray-400 font-bold border border-gray-600 rounded-sm cursor-not-allowed flex items-center gap-1">🔒 TTS (MAGISTRATE)</button>
                               </div>
                               <div className="flex items-center">
                                    <label htmlFor="diff-toggle" className="text-xs text-gray-300 mr-2">Đối Chiếu</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="diff-toggle" checked={diffView} onChange={() => setDiffView(!diffView)} className="sr-only peer" disabled={isLoading} />
                                      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008080]"></div>
                                    </label>
                               </div>
                           </div>
                           {copySuccess && <p className="text-xs text-[#CDAD5A] text-right">{copySuccess}</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScriptRefinerTool;
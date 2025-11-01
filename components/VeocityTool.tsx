// File: components/VeocityTool.tsx (Hoàn Chỉnh - Đã sửa lỗi JSX và giữ logic backend)

import React, { useState, useEffect, useCallback } from 'react';
import { GearIcon } from './AnimatedIcons';

interface VeocityToolProps {
  onBack: () => void;
}

type Phase = 'setup' | 'timeline' | 'output';

interface Scene {
  id: number;
  originalText: string;
  prompt: string;
  emotion: 'Default' | 'Vui vẻ' | 'Sốc' | 'Trầm tư' | 'Kịch tính';
  status: 'pending' | 'rendering' | 'completed' | 'failed';
  videoUrl?: string; // Should be base64 data URL
  error?: string;
}

const Loader: React.FC<{text: string}> = ({text}) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 text-[#CDAD5A] animate-[spin_5s_linear_infinite]">
            <GearIcon />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">{text}</p>
    </div>
);

// Hàm helper để sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const VeocityTool: React.FC<VeocityToolProps> = ({ onBack }) => {
    const [phase, setPhase] = useState<Phase>('setup');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    // Phase 1: Setup
    const [userApiKey, setUserApiKey] = useState(''); // State mới cho BYOK
    const [script, setScript] = useState('');
    const [masterCharacterPrompt, setMasterCharacterPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [style, setStyle] = useState('Cinematic');
    const [extraNotes, setExtraNotes] = useState('');

    // Phase 2 & 3: Timeline & Output
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isRendering, setIsRendering] = useState(false);

    // --- HÀM handleAnalyzeScript (Gọi Backend /api/veocity-analyze) ---
    const handleAnalyzeScript = async () => {
        if (!script) {
            setError("Vui lòng nhập kịch bản.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage("PHÂN TÍCH KỊCH BẢN & NHÂN VẬT...");
        setError('');

        try {
            const response = await fetch('/api/veocity-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script,
                    userApiKey: userApiKey || undefined, // Gửi key của người dùng nếu có
                }),
            });
            const result: any = await response.json();
            if (!response.ok) { throw new Error(result.error || `Lỗi ${response.status}`); }

            setMasterCharacterPrompt(result.masterCharacterPrompt);
            setScenes(result.scenes.map((s: any, i: number) => ({
                id: i,
                originalText: s.originalText,
                prompt: s.prompt,
                emotion: 'Default',
                status: 'pending',
            })));

            setPhase('timeline');

        } catch (err: any) {
            setError(`Lỗi phân tích: ${err.message}`);
            if (err.message.includes("API key") || err.message.includes("401") || err.message.includes("not found")) {
                setError("Lỗi API Key. Vui lòng kiểm tra lại Key của bạn (nếu có) hoặc API Key của hệ thống.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM generateSingleScene (Logic Polling) ---
    const generateSingleScene = async (sceneId: number) => {
        const sceneIndex = scenes.findIndex(s => s.id === sceneId);
        if (sceneIndex === -1) return;

        const currentScene = scenes[sceneIndex];
        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'rendering', error: undefined } : s));

        try {
            const finalPrompt = `
                ${masterCharacterPrompt}.
                ${currentScene.prompt}.
                Emotion: ${currentScene.emotion}.
                Style: ${style}.
                ${extraNotes}
            `.trim();

            // 1. Bắt đầu tác vụ
            const startResponse = await fetch('/api/veocity-start-generation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    finalPrompt,
                    aspectRatio,
                    userApiKey: userApiKey || undefined,
                }),
            });
            const startResult: any = await startResponse.json();
            if (!startResponse.ok) { throw new Error(startResult.error || `Lỗi ${startResponse.status}`); }

            const { operationName } = startResult;

            // 2. Bắt đầu Polling
            let isDone = false;
            let videoUrl = '';
            let attempts = 0;
            const maxAttempts = 60; // Timeout sau 10 phút (60 attempts * 10s)

            while (!isDone && attempts < maxAttempts) {
                await sleep(10000); // Chờ 10 giây
                attempts++;

                const checkResponse = await fetch('/api/veocity-check-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        operationName,
                        userApiKey: userApiKey || undefined,
                    }),
                });
                const checkResult: any = await checkResponse.json();

                if (!checkResponse.ok) {
                    throw new Error(checkResult.error || `Lỗi check status ${checkResponse.status}`);
                }

                if (checkResult.done) {
                    isDone = true;
                    videoUrl = checkResult.videoUrl; // Backend đã trả về base64 data URL
                }
            }

            if (!isDone) {
                throw new Error("Quá trình render quá lâu và đã bị timeout.");
            }

            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'completed', videoUrl } : s));

        } catch (err: any) {
            console.error(`Lỗi render cảnh ${sceneId}:`, err);
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'failed', error: err.message } : s));
             if (err.message.includes("API key") || err.message.includes("401") || err.message.includes("not found")) {
                setError("Lỗi API Key. Vui lòng kiểm tra lại Key của bạn.");
                setIsRendering(false); // Stop batch rendering
            }
        }
    };

    // --- Hàm handleRenderAll ---
    const handleRenderAll = async () => {
        setIsRendering(true);
        setPhase('output'); // Move to output phase to see progress
        for (const scene of scenes) {
            // Chỉ render những cảnh chưa hoàn thành hoặc bị lỗi
            if (scene.status === 'pending' || scene.status === 'failed') {
                await generateSingleScene(scene.id);
                 // Nếu có lỗi API Key, dừng ngay lập tức
                if (error.includes("Lỗi API Key")) {
                    break;
                }
            }
        }
        setIsRendering(false);
    };

    const totalCost = scenes.length * 8 * 0.15; // Giữ nguyên tính toán này

    // --- JSX renderSetupPhase ---
    const renderSetupPhase = () => (
        <div className="animate-phase-shift lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
            <div className="p-3 border-2 border-red-700 bg-red-900/50 rounded-sm shadow-lg shadow-red-900/50">
                <h3 className="text-red-400 font-bold text-base">CẢNH BÁO CHI PHÍ QUAN TRỌNG</h3>
                <p className="text-gray-200 text-xs font-mono mt-2">VIỆC SỬ DỤNG CÔNG CỤ NÀY SẼ ĐƯỢC TÍNH PHÍ <strong className="text-white">≈ $0.15 USD/giây</strong>. MỖI CẢNH QUAY CÓ GIỚI HẠN <strong className="text-white">8 GIÂY</strong>.</p>
            </div>
            <div>
                <label className="text-sm font-bold text-[#CDAD5A] font-playfair">API KEY (Tùy chọn - BYOK)</label>
                <input
                    type="password"
                    value={userApiKey}
                    onChange={e => setUserApiKey(e.target.value)}
                    placeholder="Dán Google AI API Key của bạn (Gói Magistrate)"
                    className="w-full obsidian-input bronze !p-2"
                />
                 <p className="text-xs text-gray-400 mt-1">Nếu để trống, hệ thống sẽ sử dụng credit của gói TOÀN TRI (nếu có).</p>
            </div>
             <div>
                <label className="text-sm font-bold text-[#CDAD5A] font-playfair">NGUỒN KỊCH BẢN</label>
                <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Dán kịch bản vào đây..." className="w-full h-32 obsidian-textarea focus:border-[#CDAD5A] bronze"></textarea>
            </div>
             <div>
                <label className="text-sm font-bold text-[#008080] font-playfair">THÔNG SỐ TOÀN CỤC (GLOBAL)</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                   <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full obsidian-select">
                       <option value="16:9">16:9 (Ngang)</option>
                       <option value="9:16">9:16 (Dọc)</option>
                   </select>
                   <select value={style} onChange={e => setStyle(e.target.value)} className="w-full obsidian-select">
                       <option>Cinematic</option>
                       <option>Realistic</option>
                       <option>3D Render</option>
                   </select>
                </div>
                 <input type="text" value={extraNotes} onChange={e => setExtraNotes(e.target.value)} placeholder="Chú thích phụ (VD: 'Không dùng ánh sáng đêm')" className="w-full obsidian-input mt-2" />
            </div>
            <button onClick={handleAnalyzeScript} disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow-strong disabled:bg-gray-600">
                {isLoading ? loadingMessage : "PHÂN TÍCH & TẠO DÒNG THỜI GIAN"}
            </button>
        </div>
    );

    // --- JSX renderTimelinePhase ---
    const renderTimelinePhase = () => (
        <>
            <div className="animate-phase-shift lg:col-span-3 flex flex-col space-y-3 pr-2 overflow-y-auto">
                <h3 className="text-lg font-bold text-[#CDAD5A] font-playfair">ĐỒNG NHẤT NHÂN VẬT</h3>
                <textarea value={masterCharacterPrompt} onChange={e => setMasterCharacterPrompt(e.target.value)} className="w-full h-24 obsidian-textarea bronze"></textarea>
                <button disabled className="text-xs text-gray-500 w-full p-2 border border-gray-600 rounded-sm">🔒 KHÓA KHUÔN MẶT (TẢI LÊN)</button>
            </div>
             <div className="animate-phase-shift lg:col-span-7 flex flex-col space-y-4">
                <h3 className="text-lg font-bold text-white font-playfair">DÒNG THỜI GIAN SẢN XUẤT</h3>
                <div className="flex-grow overflow-y-auto pr-2 relative timeline pl-10">
                    {scenes.map((scene, i) => (
                        <div key={scene.id} className={`mb-4 relative timeline-item ${scene.status}`}>
                            <h4 className="font-bold text-white">Cảnh {i+1} <span className="text-xs text-gray-400">(~8 giây)</span></h4>
                            <div className="p-3 bg-black/40 border border-gray-700 rounded-sm space-y-2">
                                <div className="flex items-start gap-2">
                                    <span title="Prompt Đồng nhất được áp dụng" className="text-xl text-yellow-400 mt-1">🔒</span>
                                    <textarea value={scene.prompt} onChange={e => setScenes(scenes.map(s => s.id === scene.id ? { ...s, prompt: e.target.value } : s))} className="w-full h-16 obsidian-textarea text-xs"></textarea>
                                </div>
                                <select value={scene.emotion} onChange={e => setScenes(scenes.map(s => s.id === scene.id ? { ...s, emotion: e.target.value as any } : s))} className="w-full obsidian-select text-xs">
                                    <option>Default</option><option>Vui vẻ</option><option>Sốc</option><option>Trầm tư</option><option>Kịch tính</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-700 pt-3">
                    <p className="text-center text-sm text-red-400 font-bold mb-2">TỔNG CHI PHÍ DỰ KIẾN: ~${totalCost.toFixed(2)} USD</p>
                    <button onClick={handleRenderAll} disabled={isRendering} className="w-full bg-[#00ffc8] text-black font-bold py-3 px-5 border-2 border-[#00ffc8] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#00ffc8] active:scale-95 emerald-glow-strong disabled:bg-gray-600">
                        {isRendering ? "ĐANG RENDER..." : `TẠO TẤT CẢ (${scenes.length} CẢNH)`}
                    </button>
                </div>
            </div>
        </>
    );

    // --- JSX renderOutputPhase ---
    const renderOutputPhase = () => (
         <div className="animate-phase-shift lg:col-span-10 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white font-playfair">THƯ VIỆN & HẬU KỲ</h3>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Trạng thái: <span className={`font-bold ${isRendering ? 'text-yellow-400 animate-pulse' : 'text-emerald-400'}`}>{isRendering ? 'Đang Render...' : 'Hoàn tất'}</span></p>
                    <p className="text-xs text-gray-400">Tổng chi phí: <span className="font-bold text-red-400">${totalCost.toFixed(2)} USD</span></p>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto p-2 bg-black/20">
                {scenes.map((scene, i) => (
                    <div key={scene.id} className="aspect-video bg-black border border-gray-700 rounded-sm flex flex-col items-center justify-center text-center">
                        {scene.status === 'completed' && scene.videoUrl ? (
                             <video src={scene.videoUrl} controls className="w-full h-full object-cover"></video>
                        ) : scene.status === 'rendering' ? (
                             <div className="p-2 animate-pulse"><p className="text-xs text-yellow-400">Đang render cảnh {i+1}...</p></div>
                        ) : scene.status === 'failed' ? (
                            <div className="p-2 text-red-400">
                                <p className="text-xs font-bold">Cảnh {i+1} Thất bại</p>
                                <p className="text-[10px] mt-1 opacity-70 break-all">{scene.error}</p>
                                {/* Nút Re-render cho lỗi */}
                                <button onClick={() => generateSingleScene(scene.id)} disabled={isRendering} className="mt-1 w-full text-xs py-1 bg-[#CDAD5A] text-black hover:bg-opacity-80 disabled:bg-gray-600">
                                    Re-render
                                </button>
                            </div>
                        ) : (
                             <p className="text-xs text-gray-500">Cảnh {i+1} đang chờ</p>
                        )}
                        {/* Nút Re-render chung (chỉ hiển thị nếu đã hoàn thành) */}
                        {scene.status === 'completed' && (
                           <button onClick={() => generateSingleScene(scene.id)} disabled={isRendering} className="absolute bottom-1 right-1 text-[10px] px-1 py-0.5 bg-[#CDAD5A]/70 text-black hover:bg-opacity-100 disabled:bg-gray-600 rounded-sm backdrop-blur-sm">
                                Re-render
                           </button>
                        )}
                         {/* Nút Re-render cho pending (nếu cần render lẻ) */}
                         {scene.status === 'pending' && (
                           <button onClick={() => generateSingleScene(scene.id)} disabled={isRendering} className="mt-1 w-full text-xs py-1 bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800">
                                Render Cảnh Này
                           </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex gap-4">
                <button onClick={() => alert("Chức năng 'Gộp cảnh & Xuất Final' đang được phát triển.")} className="flex-grow bg-[#00ffc8] text-black font-bold py-3 px-5 border-2 border-[#00ffc8] rounded-sm transition-all hover:bg-transparent hover:text-[#00ffc8] disabled:bg-gray-600" disabled={isRendering || scenes.some(s => s.status !== 'completed')}>
                    GỘP CẢNH & XUẤT FINAL
                </button>
                 <button onClick={() => setPhase('timeline')} className="bg-gray-700 text-white font-bold py-3 px-5 rounded-sm hover:bg-gray-600" disabled={isRendering}>
                    QUAY LẠI TIMELINE
                </button>
            </div>
         </div>
    );

    // --- JSX return chính ---
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-2 veocity-bg relative">
            {/* Banner */}
            <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-r from-[#CDAD5A]/50 via-black/50 to-[#CDAD5A]/50 text-center text-xs font-bold text-black backdrop-blur-sm z-20">
              SỨC MẠNH VEOCITY ĐỈNH CAO CHỈ DÀNH CHO GÓI TOÀN TRI.
            </div>

            {/* Header */}
            <div className="flex justify-between items-center pt-6">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#E0E0E0] tracking-wider">VI. TẠO VIDEO (VEOCITY)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2 z-10">&times; Trở Về</button>
            </div>

            {/* Content Area */}
            {/* ĐOẠN CODE JSX ĐÃ SỬA LỖI */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* Loader khi đang tải ở phase setup */}
                {isLoading && phase === 'setup' && <div className="lg:col-span-10"><Loader text={loadingMessage}/></div>}

                {/* Phần hiển thị nội dung chính khi không loading */}
                {!isLoading && (
                    <>
                        {/* Hiển thị component tương ứng với phase hiện tại */}
                        {phase === 'setup' && renderSetupPhase()}
                        {phase === 'timeline' && renderTimelinePhase()}
                        {phase === 'output' && renderOutputPhase()}

                        {/* Hiển thị lỗi nếu có và không đang loading */}
                        {/* Cập nhật để lỗi hiển thị rõ ràng hơn */}
                        {error && !isLoading && (
                            <div className="lg:col-span-10 p-4 mt-4 border border-red-500 bg-red-900/30 rounded-sm text-center">
                                <p className="font-bold text-red-400">Đã xảy ra lỗi:</p>
                                <p className="text-xs text-gray-300 mt-1">{error}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* KẾT THÚC ĐOẠN CODE JSX ĐÃ SỬA LỖI */}
        </div>
    );
};

export default VeocityTool;
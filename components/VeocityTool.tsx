// File: components/VeocityTool.tsx (Hoàn Chỉnh - Đã dán link Extension)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { GearIcon } from './AnimatedIcons';

interface VeocityToolProps {
    onBack: () => void;
}

type Phase = 'setup' |
    'timeline' | 'output'; // Giữ phase output để hiển thị prompts

interface Scene {
    id: number;
    originalText: string;
    prompt: string;
    emotion: 'Default' | 'Vui vẻ' |
    'Sốc' | 'Trầm tư' | 'Kịch tính';
    status: 'pending' | 'rendering' | 'completed' | 'failed';
    videoUrl?: string; // Giữ lại cho tính năng mockup nếu cần
    error?: string;
}

const Loader: React.FC<{ text: string }> = ({ text }) => (
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
    const router = useRouter();
    const { t } = useTranslation('common');
    const isEN = router.locale === 'en';

    const [phase, setPhase] = useState<Phase>('setup');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    // Phase 1: Setup
    const [script, setScript] = useState('');
    const [masterCharacterPrompt, setMasterCharacterPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [style, setStyle] = useState('Cinematic');
    const [extraNotes, setExtraNotes] = useState('');

    // Phase 2 & 3: Timeline & Output
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isRendering, setIsRendering] = useState(false); // Đã bị loại bỏ trong logic mới

    // --- HÀM handleAnalyzeScript (Gọi Backend /api/veocity-analyze) ---
    const handleAnalyzeScript = async () => {
        if (!script) {
            setError("Vui lòng nhập kịch bản.");
            return;
        }
        // KHÔNG còn cần API Key của người dùng nữa
        setIsLoading(true);
        setLoadingMessage("AI ĐANG PHÂN TÍCH & TỐI ƯU HÓA PROMPT...");
        setError('');
        try {
            // **Quan trọng:** API này vẫn gọi backend để Gemini AI chia cảnh và đồng nhất nhân vật
            const response = await fetch('/api/veocity-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script,
                    // KHÔNG GỬI userApiKey
                }),
            });
            const result: any = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${response.status}`);
            }

            setMasterCharacterPrompt(result.masterCharacterPrompt);
            setScenes(result.scenes.map((s: any, i: number) => ({
                id: i,
                originalText: s.originalText,
                prompt: s.prompt,
                emotion: 'Default',
                status: 'pending', // Giữ pending để hiển thị
            })));

            setPhase('timeline');

        } catch (err: any) {
            setError(`Lỗi phân tích: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM XUẤT PROMPTS CHO EXTENSION ---
    const exportPromptsForFlow = () => {
        // Tạo Prompt đầy đủ: Master Prompt + Scene Prompt + Global Settings
        const fullPrompts = scenes.map(scene => {
            const finalPrompt = `
                ${masterCharacterPrompt}.
                ${scene.prompt}.
                Emotion: ${scene.emotion}.
                Style: ${style}.
                Aspect Ratio: ${aspectRatio}.
                ${extraNotes}
            `.trim().replace(/\n\s+/g, ' '); // Xóa khoảng trắng thừa và xuống dòng
            return finalPrompt;
        });

        const promptsText = fullPrompts.join('\n\n---\n\n'); // Tách các prompts bằng dòng "---\n\n"

        // Tạo file TXT để người dùng tải về (Bước chuyển giao dữ liệu)
        const blob = new Blob([promptsText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Kodaflow_Veocity_Prompts_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Chuyển sang phase output để hiển thị hướng dẫn
        setPhase('output');
    };

    // --- JSX renderSetupPhase (ĐÃ SỬA GIAO DIỆN VÀ DÁN LINK) ---
    const renderSetupPhase = () => (
        <div className="animate-phase-shift lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
            <div className="p-3 border-2 border-[#CDAD5A] bg-[#CDAD5A]/30 rounded-sm shadow-lg shadow-[#CDAD5A]/50">
                <h3 className="text-yellow-400 font-bold text-base">{isEN ? 'AUTOMATION GUIDE' : 'HƯỚNG DẪN TỰ ĐỘNG HÓA'}</h3>
                <p className="text-gray-200 text-xs font-mono mt-2">
                    {isEN
                        ? 'THIS TOOL USES AI TO OPTIMIZE PROMPTS. VIDEO GENERATION WILL BE AUTOMATED VIA THE '
                        : 'CÔNG CỤ NÀY DÙNG AI ĐỂ TỐI ƯU PROMPT. VIỆC TẠO VIDEO (GENERATION) SẼ ĐƯỢC THỰC HIỆN TỰ ĐỘNG BẰNG'}
                    <strong className="text-white"> {isEN ? 'FLOW EXTENSION' : 'EXTENSION FLOW'}</strong>, {isEN ? 'USING CREDITS FROM YOUR ACCOUNT.' : 'SỬ DỤNG CREDIT/QUOTA TỪ TÀI KHOẢN CỦA BẠN.'}
                </p>
                {/* ĐÃ DÁN LINK EXTENSION VÀO ĐÂY */}
                <a href="https://chromewebstore.google.com/detail/auto-flow-t%E1%BB%B1-%C4%91%E1%BB%99ng-h%C3%B3a-cho/lhcmnhdbddgagibbbgppakocflbnknoa" target="_blank" rel="noopener noreferrer" className="text-xs text-[#00ffc8] mt-1 font-bold block hover:underline">
                    👉 {isEN ? 'CLICK HERE TO INSTALL FLOW EXTENSION' : 'BẤM VÀO ĐÂY ĐỂ CÀI ĐẶT EXTENSION FLOW'}
                </a>
            </div>

            {/* KHÔNG CÒN TRƯỜNG API KEY BYOK */}

            <div>
                <label className="text-sm font-bold text-[#CDAD5A] font-playfair">{isEN ? 'SCRIPT SOURCE' : 'NGUỒN KỊCH BẢN'}</label>
                <textarea value={script} onChange={e => setScript(e.target.value)} placeholder={isEN ? "Paste script here..." : "Dán kịch bản vào đây..."} className="w-full h-32 obsidian-textarea focus:border-[#CDAD5A] bronze"></textarea>
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
            <button onClick={handleAnalyzeScript} disabled={isLoading} className="w-full mt-auto bg-[#CDAD5A] text-black font-bold py-3 px-5 
             border-2 border-[#CDAD5A] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#CDAD5A] active:scale-95 bronze-glow-strong disabled:bg-gray-600">
                {isLoading ?
                    loadingMessage : "PHÂN TÍCH & CHIA CẢNH BẰNG AI"}
            </button>
        </div>
    );

    // --- JSX renderTimelinePhase (ĐÃ SỬA NÚT) ---
    const renderTimelinePhase = () => (
        <>
            <div className="animate-phase-shift lg:col-span-3 flex flex-col space-y-3 pr-2 overflow-y-auto">
                <h3 className="text-lg font-bold text-[#CDAD5A] font-playfair">ĐỒNG NHẤT NHÂN VẬT</h3>
                <textarea value={masterCharacterPrompt} onChange={e => setMasterCharacterPrompt(e.target.value)} className="w-full h-24 obsidian-textarea bronze"></textarea>
                <p className="text-xs text-gray-400">Prompt này được AI tạo ra để đảm bảo nhân vật chính nhất quán giữa các cảnh.</p>

            </div>
            <div className="animate-phase-shift lg:col-span-7 flex flex-col space-y-4">
                <h3 className="text-lg font-bold text-white font-playfair">PROMPT TỐI ƯU CỦA KODAFLOW</h3>
                <div className="flex-grow overflow-y-auto pr-2 relative timeline pl-10">
                    {scenes.map((scene, i) => (
                        <div key={scene.id} className={`mb-4 relative timeline-item ${scene.status}`}>
                            <h4 className="font-bold text-white">Cảnh {i + 1} <span className="text-xs text-gray-400">(Tối ưu Prompt Veocity)</span></h4>
                            <div className="p-3 bg-black/40 border border-gray-700 rounded-sm space-y-2">
                                <div className="flex items-start gap-2">
                                    <span title="Prompt Đồng nhất được áp dụng" className="text-xl text-yellow-400 mt-1">🔒</span>
                                    <textarea value={scene.prompt} onChange={e => setScenes(scenes.map(s => s.id === scene.id ?
                                        { ...s, prompt: e.target.value } : s))} className="w-full h-16 obsidian-textarea text-xs"></textarea>
                                </div>
                                <select value={scene.emotion} onChange={e => setScenes(scenes.map(s => s.id === scene.id ? { ...s, emotion: e.target.value as any } : s))} className="w-full obsidian-select text-xs">
                                    <option>Default</option><option>Vui vẻ</option><option>Sốc</option><option>Trầm tư</option><option>Kịch tính</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-700 pt-3">
                    <p className="text-center text-sm text-[#00ffc8] font-bold mb-2">QUÁ TRÌNH TẠO VIDEO ĐÃ CHUYỂN QUA EXTENSION</p>
                    {/* NÚT HÀNH ĐỘNG MỚI */}
                    <button onClick={exportPromptsForFlow} className="w-full bg-[#00ffc8] text-black font-bold py-3 px-5 border-2 border-[#00ffc8] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#00ffc8] active:scale-95 emerald-glow-strong">
                        XUẤT PROMPT TỐI ƯU VÀ KÍCH HOẠT FLOW
                    </button>
                </div>
            </div>
        </>
    );

    // --- JSX renderOutputPhase (ĐÃ SỬA HIỂN THỊ HƯỚNG DẪN) ---
    const renderOutputPhase = () => (
        <div className="animate-phase-shift lg:col-span-10 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white font-playfair">XUẤT BẢN VÀ HẬU KỲ</h3>
            </div>
            <div className="p-6 bg-black/40 border-2 border-[#00ffc8] rounded-sm shadow-lg shadow-[#00ffc8]/50 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-xl text-[#00ffc8] font-bold">🎉 PROMPTS ĐÃ ĐƯỢC XUẤT THÀNH CÔNG!</p>
                <p className="text-base text-gray-300 max-w-2xl">
                    File **`Kodaflow_Veocity_Prompts.txt`** đã được tải về máy tính của bạn.
                    Bây giờ, bạn cần sử dụng Extension **Auto Flow** để tự động hóa quá trình tạo từng cảnh quay trên Veo3.
                </p>
                <ol className="text-left list-decimal list-inside text-gray-400 space-y-2">
                    <li><a href="https://chromewebstore.google.com/detail/auto-flow-t%E1%BB%B1-%C4%91%E1%BB%99ng-h%C3%B3a-cho/lhcmnhdbddgagibbbgppakocflbnknoa" target="_blank" rel="noopener noreferrer" className="text-[#00ffc8] font-bold hover:underline">Mở Veo3</a> và kích hoạt Extension **Auto Flow**.</li>
                    <li>Trong Extension, chọn **Import file (.txt)** và tải lên file Prompts vừa tải về.</li>
                    <li>Extension sẽ tự động tạo video bằng credit/quota Veo3 của bạn.</li>
                    <li>Sau khi hoàn tất, bạn tải về các clip và tự ghép chúng lại (Ghép nối, thêm nhạc nền, v.v.) bằng phần mềm chỉnh sửa chuyên dụng.</li>
                </ol>
                <button onClick={() => setPhase('timeline')} className="mt-4 bg-gray-700 text-white font-bold py-3 px-5 rounded-sm hover:bg-gray-600">
                    QUAY LẠI CHỈNH SỬA PROMPT
                </button>
            </div>
        </div>
    );

    // --- JSX return chính ---
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-2 veocity-bg relative">
            {/* Banner */}
            <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-r from-[#CDAD5A]/50 via-black/50 to-[#CDAD5A]/50 text-center text-xs font-bold text-black backdrop-blur-sm z-20">
                {isEN ? 'VEOCITY PROMPT OPTIMIZER BY KODAFLOW' : 'CÔNG CỤ TỐI ƯU HÓA PROMPT VEOCITY CỦA KODAFLOW'}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center pt-6">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#E0E0E0] tracking-wider">
                    {isEN ? 'SCRIPT PREPARATION (VEOCITY)' : 'VI. CHUẨN BỊ KỊCH BẢN (VEOCITY)'}
                </h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2 z-10">&times; {isEN ? 'Back' : 'Trở Về'}</button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* Loader khi đang tải ở phase setup */}
                {isLoading && phase === 'setup' && <div className="lg:col-span-10"><Loader text={loadingMessage} /></div>}

                {/* Phần hiển thị nội dung chính khi không loading */}
                {!isLoading && (
                    <>
                        {/* Hiển thị component tương ứng với phase hiện tại */}
                        {phase === 'setup' && renderSetupPhase()}
                        {phase === 'timeline' && renderTimelinePhase()}
                        {phase === 'output' && renderOutputPhase()}

                        {/* Hiển thị lỗi nếu có */}
                        {error && !isLoading && (
                            <div className="lg:col-span-10 p-4 mt-4 border border-red-500 bg-red-900/30 rounded-sm text-center">
                                <p className="font-bold text-red-400">Đã xảy ra lỗi:</p>
                                <p className="text-xs text-gray-300 mt-1">{error}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VeocityTool;
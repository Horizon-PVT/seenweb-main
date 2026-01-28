
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft,
    PenTool,
    Type,
    Mic,
    Film,
    Send,
    Download,
    Copy,
    Languages,
    Sparkles,
    Maximize2,
    Minimize2,
    MessageSquare,
    CheckCircle,
    Lock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Optional, but let's stick to raw or simple formatting to match original

// --- CONSTANTS (From Original) ---
const tones = ["Hùng hồn", "Châm biếm", "Chuyên gia", "Thân thiện", "Kể chuyện", "Bí ẩn", "Hài hước", "Trang trọng", "Cổ vũ", "Nhẹ nhàng", "Kịch tính", "Giáo dục", "Tin tức", "Phỏng vấn", "Triết lý", "Hoài niệm", "Tò mò", "Cảm hứng", "Thách thức", "Giản dị"];
const styles = ["Vlog", "Hồi hộp", "Dạng tin tức", "Phim tài liệu", "Đánh giá sản phẩm", "Hướng dẫn", "Phản ứng", "Thử thách", "Phim ngắn", "Hoạt hình giải thích", "Danh sách top", "ASMR", "Livestream", "Podcast", "Kịch nói", "Lịch sử", "Khoa học viễn tưởng", "Hài kịch", "Chính kịch", "Phiêu lưu"];
const languages: Record<string, string> = { "English": "en", "Spanish": "es", "French": "fr", "German": "de", "Chinese (Simplified)": "zh-CN", "Japanese": "ja", "Korean": "ko", "Russian": "ru", "Arabic": "ar", "Portuguese": "pt" };

// --- HELPER COMPONENTS ---

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
    // Simple rendering for now to avoid complexity, but styled to look like a script
    return (
        <div className="whitespace-pre-wrap font-mono text-gray-300 leading-relaxed text-lg">
            {text}
        </div>
    );
};

export default function ScriptwriterPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const userRole = (session?.user as any)?.role || 'FREE';

    // --- STATE (Strictly Replicated) ---
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("INITIALIZING...");
    const [outputScript, setOutputScript] = useState('');
    const [error, setError] = useState('');
    const [idea, setIdea] = useState('');
    const [goal, setGoal] = useState('Tăng View');
    const [level, setLevel] = useState('Nâng Cao');
    const [tone, setTone] = useState('Hùng hồn');
    const [style, setStyle] = useState('Vlog');
    const [format, setFormat] = useState('visual');
    const [length, setLength] = useState(10);
    const [chatRequest, setChatRequest] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);

    // --- LOGIC: WRITE ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idea) {
            setError("Vui lòng nhập ý tưởng.");
            return;
        }

        setIsLoading(true);
        setLoadingMessage(format === 'visual' ? "SCENE BUILDING..." : "STORY WEAVING...");
        setOutputScript('');
        setError('');

        try {
            const response = await fetch('/api/script-writer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea, goal, level, tone, style, length: Number(length), format }),
            });

            const scriptText = await response.text();

            if (!response.ok) {
                let errorMessage = `Error ${response.status}: ${scriptText}`;
                try { errorMessage = JSON.parse(scriptText).error || errorMessage; } catch (e) { /* Ignore */ }
                throw new Error(errorMessage);
            }
            setOutputScript(scriptText);
        } catch (err: any) {
            setError(err.message || "Failed to generate script.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGIC: REFINE / TRANSLATE ---
    const handleRefine = async (type: 'refine' | 'consistency' | 'translate', lang: string = 'en') => {
        if (!outputScript) return;

        // Gating Check (Visual Only implementation for this page, logic implied)
        if (['FREE', 'CREATIVE', 'USER'].includes(userRole) && type !== 'translate') { // Example logic from original
            alert("Tính năng dành riêng cho gói PRO/VIP.");
            return;
        }

        setIsLoading(true);
        setLoadingMessage(type === 'translate' ? "TRANSLATING..." : "REFINING...");
        const currentScriptForRequest = outputScript;

        // Optimistic UI updates could go here, but we wait for result to replace
        try {
            const response = await fetch('/api/script-refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentScript: currentScriptForRequest,
                    type: type,
                    tone: type === 'refine' || type === 'translate' ? tone : undefined,
                    length: type === 'refine' ? Number(length) : undefined,
                    style: type === 'translate' ? style : undefined,
                    lang: type === 'translate' ? lang : undefined,
                }),
            });

            const refinedScriptText = await response.text();

            if (!response.ok) {
                throw new Error("Refinement failed.");
            }
            setOutputScript(refinedScriptText);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGIC: CHAT ---
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatRequest || !outputScript) return;

        setIsLoading(true);
        const currentScriptForRequest = outputScript;
        const requestText = chatRequest;
        setChatRequest('');

        try {
            const response = await fetch('/api/script-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentScript: currentScriptForRequest,
                    chatRequest: requestText,
                }),
            });

            const editedScriptText = await response.text();
            if (!response.ok) throw new Error("Edit failed.");
            setOutputScript(editedScriptText);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(outputScript);
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const handleExportTxt = () => {
        const blob = new Blob([outputScript], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'screenplay.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`min-h-screen bg-[#09090b] text-[#e4e4e7] font-sans selection:bg-[#fbbf24] selection:text-black flex flex-col ${isFullScreen ? 'overflow-hidden h-screen' : ''}`}>
            <Head>
                <title>CINEMATIC WRITER | SCRIPT STUDIO</title>
            </Head>

            {/* HEADER */}
            <header className="h-16 border-b border-[#3f3f46]/40 flex items-center justify-between px-6 bg-[#09090b]/90 backdrop-blur z-50">
                <div className="flex items-center gap-4">
                    <Link href="/?tool=tools_content" className="text-[#a1a1aa] hover:text-white transition-colors flex items-center gap-2">
                        <ArrowLeft size={18} /> <span className="text-xs font-bold tracking-widest uppercase">BACK TO STUDIO</span>
                    </Link>
                    <div className="h-5 w-px bg-[#3f3f46]"></div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#fbbf24]/10 rounded border border-[#fbbf24]/20">
                            <Film size={16} className="text-[#fbbf24]" />
                        </div>
                        <h1 className="text-sm font-black tracking-[0.2em] text-white">CINEMATIC WRITER</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setIsFullScreen(!isFullScreen)} className="text-[#a1a1aa] hover:text-white transition-colors">
                        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <div className="h-5 w-px bg-[#3f3f46]"></div>
                    <div className="bg-[#fbbf24] text-black text-xs font-bold px-3 py-1 rounded">PRO STUDIO</div>
                </div>
            </header>

            {/* MAIN CONTENT GRID */}
            <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">

                {/* LEFT: TOOLS PANEL */}
                <div className="w-full md:w-80 bg-[#18181b] border-r border-[#3f3f46]/40 flex flex-col h-full z-20 shadow-2xl">
                    <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* IDEA INPUT */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={12} /> Core Concept
                                </label>
                                <textarea
                                    value={idea}
                                    onChange={e => setIdea(e.target.value)}
                                    placeholder="Describe your video idea, plot, or topic..."
                                    className="w-full h-32 bg-[#27272a] border border-[#3f3f46] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24]/50 transition-all resize-none"
                                />
                            </div>

                            {/* SELECTORS */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Goal</label>
                                        <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] rounded p-2 text-xs text-white outline-none">
                                            <option value="Tăng View">Views</option>
                                            <option value="Tăng Chuyển Đổi">Conversion</option>
                                            <option value="Xây dựng Thương Hiệu">Branding</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Level</label>
                                        <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] rounded p-2 text-xs text-white outline-none">
                                            <option value="Cơ Bản">Basic</option>
                                            <option value="Nâng Cao">Advanced</option>
                                            <option value="Tinh Hoa">Master</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Tone</label>
                                    <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] rounded p-2 text-xs text-white outline-none">
                                        {tones.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Style</label>
                                    <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] rounded p-2 text-xs text-white outline-none">
                                        {styles.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Format</label>
                                    <div className="flex gap-2 bg-[#27272a] p-1 rounded border border-[#3f3f46]">
                                        <button
                                            type="button"
                                            onClick={() => setFormat('visual')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${format === 'visual' ? 'bg-[#3f3f46] text-[#fbbf24]' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            <Film size={12} /> Visual
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormat('story')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${format === 'story' ? 'bg-[#3f3f46] text-[#fbbf24]' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            <Mic size={12} /> Story
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">
                                        <span>Length</span>
                                        <span className="text-[#fbbf24]">{length} min</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="30"
                                        value={length}
                                        onChange={e => setLength(parseInt(e.target.value))}
                                        className="w-full h-1 bg-[#3f3f46] rounded-lg appearance-none cursor-pointer accent-[#fbbf24]"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-4 border-t border-[#3f3f46] bg-[#09090b]">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-[#fbbf24] hover:bg-[#d97706] text-black font-black uppercase text-sm py-4 rounded transition-all shadow-lg hover:shadow-[#fbbf24]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div> : <PenTool size={16} />}
                            {isLoading ? 'WRITING...' : 'GENERATE SCRIPT'}
                        </button>
                        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                    </div>
                </div>

                {/* RIGHT: EDITOR AREA */}
                <div className="flex-grow flex flex-col bg-[#09090b] relative">

                    {/* Tool Bar Top */}
                    {outputScript && (
                        <div className="h-12 border-b border-[#3f3f46]/40 flex items-center justify-between px-6 bg-[#09090b]/50 backdrop-blur z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-green-500 flex items-center gap-1 font-mono"><CheckCircle size={12} /> SAVED</span>
                                {copySuccess && <span className="text-xs text-[#fbbf24] animate-fade-in">{copySuccess}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-white transition-colors" title="Copy"><Copy size={16} /></button>
                                <button onClick={handleExportTxt} className="p-2 text-gray-400 hover:text-white transition-colors" title="Export"><Download size={16} /></button>
                                <div className="h-4 w-px bg-[#3f3f46]"></div>
                                <select
                                    onChange={(e) => handleRefine('translate', e.target.value)}
                                    className="bg-transparent text-xs text-gray-400 hover:text-white outline-none cursor-pointer"
                                >
                                    <option value="">Translate...</option>
                                    {Object.entries(languages).map(([name, code]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Editor Canvas */}
                    <div className="flex-grow overflow-auto p-8 md:p-12 text-lg md:text-xl font-mono relative">
                        {!outputScript && !isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#3f3f46] pointer-events-none">
                                <Type size={64} className="mb-4 opacity-50" />
                                <h2 className="text-2xl font-black uppercase tracking-widest opacity-50">NO SCRIPT LOADED</h2>
                                <p className="text-sm font-mono mt-2 opacity-40">Ready to write your masterpiece</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-20">
                                <div className="w-16 h-1 bg-[#27272a] rounded overflow-hidden mb-4">
                                    <div className="h-full bg-[#fbbf24] animate-progress"></div>
                                </div>
                                <p className="text-[#fbbf24] font-mono text-sm tracking-widest animate-pulse">{loadingMessage}</p>
                            </div>
                        )}

                        {outputScript && (
                            <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
                                <TypewriterText text={outputScript} />
                            </div>
                        )}
                    </div>

                    {/* AI Chat / Refine Bar */}
                    {outputScript && (
                        <div className="p-4 border-t border-[#3f3f46]/40 bg-[#09090b]">
                            <div className="max-w-4xl mx-auto flex gap-3">
                                <div className="relative flex-grow">
                                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        value={chatRequest}
                                        onChange={e => setChatRequest(e.target.value)}
                                        placeholder="Ask AI to rewrite, shorten, or change tone..."
                                        className="w-full bg-[#27272a] border border-[#3f3f46] rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleChatSubmit}
                                    disabled={!chatRequest || isLoading}
                                    className="bg-[#fbbf24] hover:bg-[#d97706] text-black p-2.5 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRefine('refine')}
                                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white text-xs font-bold rounded-full transition-colors border border-[#3f3f46]"
                                    >
                                        <Sparkles size={14} className="text-[#fbbf24]" /> Refine
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #18181b;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3f3f46;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #52525b;
                }
                @keyframes progress {
                    0% { width: 0% }
                    50% { width: 70% }
                    100% { width: 95% }
                }
                .animate-progress {
                    animation: progress 20s linear forwards;
                }
            `}</style>
        </div>
    );
}

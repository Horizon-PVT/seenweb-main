
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
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
    Lock,
    FilePlus, // New Icon
    Trash2 // New Icon
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
        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg">
            {text}
        </div>
    );
};

export default function ScriptwriterPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const userRole = (session?.user as any)?.role || 'FREE';

    // --- STATE (Strictly Replicated) ---
    // --- Auto-Save Hook Logic (Hydration Safe) ---
    const useAutoSave = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
        const [value, setValue] = useState<T>(initialValue);
        const [isLoaded, setIsLoaded] = useState(false);

        // Load from storage AFTER mount
        useEffect(() => {
            const saved = localStorage.getItem(key);
            if (saved !== null) {
                if (typeof initialValue === 'number') setValue(Number(saved) as T);
                else setValue(saved as T);
            }
            setIsLoaded(true);
        }, [key]); // Run once on mount

        // Save to storage on change
        useEffect(() => {
            if (isLoaded) {
                localStorage.setItem(key, String(value));
            }
        }, [key, value, isLoaded]);

        return [value, setValue];
    };

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("INITIALIZING...");

    // Auto-Save Props
    const [outputScript, setOutputScript] = useAutoSave('sw_page_outputScript', '');
    const [idea, setIdea] = useAutoSave('sw_page_idea', '');
    const [goal, setGoal] = useAutoSave('sw_page_goal', 'Tăng View');
    const [level, setLevel] = useAutoSave('sw_page_level', 'Nâng Cao');
    const [tone, setTone] = useAutoSave('sw_page_tone', 'Hùng hồn');
    const [style, setStyle] = useAutoSave('sw_page_style', 'Vlog');
    const [format, setFormat] = useAutoSave('sw_page_format', 'visual');
    const [length, setLength] = useAutoSave('sw_page_length', 10);

    const [error, setError] = useState('');
    const [chatRequest, setChatRequest] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    // --- PROJECT HISTORY LOGIC ---
    const [showHistory, setShowHistory] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects?toolId=scriptwriter');
            const data = await res.json();
            if (data.projects) setProjects(data.projects);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveProject = async () => {
        if (!session) {
            alert("Vui lòng đăng nhập để lưu dự án!");
            return;
        }
        if (!outputScript) return;

        const name = prompt("Đặt tên dự án:", idea.substring(0, 30) + "...") || `Script ${new Date().toLocaleString()}`;

        setIsLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toolId: 'scriptwriter',
                    name,
                    id: currentProjectId, // Update if exists
                    data: { idea, goal, level, tone, style, format, length, outputScript }
                })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Lỗi không xác định");
            }

            if (data.project) {
                setCurrentProjectId(data.project.id);
                alert("✅ Đã lưu dự án thành công!");
                fetchProjects(); // Refresh list
            }
        } catch (e: any) {
            alert(`❌ Lưu thất bại: ${e.message}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadProject = (p: any) => {
        if (!p.data) return;
        setIdea(p.data.idea || '');
        setGoal(p.data.goal || 'Tăng View');
        setLevel(p.data.level || 'Nâng Cao');
        setTone(p.data.tone || 'Hùng hồn');
        setStyle(p.data.style || 'Vlog');
        setFormat(p.data.format || 'visual');
        setLength(p.data.length || 10);
        setOutputScript(p.data.outputScript || '');
        setCurrentProjectId(p.id);
        setShowHistory(false);
    };

    useEffect(() => {
        if (showHistory) fetchProjects();
    }, [showHistory]);

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
                // Check if it's a JSON error response first
                let errorJson;
                try {
                    errorJson = JSON.parse(scriptText);
                } catch (e) {
                    // Not JSON
                }

                if (response.status === 403 || (errorJson && (errorJson.error === 'PLAN_LOCKED' || errorJson.error === 'FREE_QUOTA_EXCEEDED'))) {
                    setShowUpgrade(true);
                    return; // Stop here
                }

                throw new Error((errorJson && errorJson.error) || `Error ${response.status}: ${scriptText}`);
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
                // Check if it's a JSON error response first
                let errorJson;
                try {
                    errorJson = JSON.parse(refinedScriptText);
                } catch (e) {
                    // Not JSON
                }

                if (response.status === 403 || (errorJson && (errorJson.error === 'PLAN_LOCKED' || errorJson.error === 'FREE_QUOTA_EXCEEDED'))) {
                    setShowUpgrade(true);
                    return; // Stop here
                }
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
            if (!response.ok) {
                // Check if it's a JSON error response first
                let errorJson;
                try {
                    errorJson = JSON.parse(editedScriptText);
                } catch (e) {
                    // Not JSON
                }

                if (response.status === 403 || (errorJson && (errorJson.error === 'PLAN_LOCKED' || errorJson.error === 'FREE_QUOTA_EXCEEDED'))) {
                    setShowUpgrade(true);
                    return; // Stop here
                }
                throw new Error("Edit failed.");
            }
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
                    <Link href="/#bang-cong-cu-seenyt" className="text-[#a1a1aa] hover:text-white transition-colors flex items-center gap-2">
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
                    <button
                        onClick={() => {
                            if (confirm("TẠO MỚI? Dữ liệu chưa lưu (Save) sẽ bị mất.")) {
                                setIdea('');
                                setOutputScript('');
                                setCurrentProjectId(null);
                                setChatRequest('');
                                // Reset defaults
                                setGoal('Tăng View');
                                setLevel('Nâng Cao');
                                setTone('Hùng hồn');
                                setStyle('Vlog');
                                setFormat('visual');
                                setLength(10);
                            }
                        }}
                        className="flex items-center gap-1 text-[#a1a1aa] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider mr-2"
                        title="Tạo Mới (Xóa Form)"
                    >
                        <FilePlus size={16} /> NEW
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 px-3 py-1 rounded border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-bold hover:bg-[#fbbf24]/10 transition-colors"
                    >
                        <span className="text-lg">📂</span> MY PROJECTS
                    </button>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} className="text-[#a1a1aa] hover:text-white transition-colors">
                        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <div className="h-5 w-px bg-[#3f3f46]"></div>
                    <div className="bg-[#fbbf24] text-black text-xs font-bold px-3 py-1 rounded">PRO STUDIO</div>
                </div>
            </header>

            {/* PROJECTS DRAWER */}
            {showHistory && (
                <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur flex justify-end animate-in fade-in duration-200">
                    <div className="w-96 bg-[#111] border-l border-[#fbbf24]/30 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[#fbbf24] font-bold text-xl uppercase tracking-wider">My Projects</h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white">&times;</button>
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar">
                            {projects.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-4xl mb-2">📭</p>
                                    <p>Chưa có dự án nào.</p>
                                    <p className="text-[10px] mt-2 text-gray-400">Hãy bấm "SAVE PROJECT" để lưu.</p>
                                </div>
                            ) : (
                                projects.map(p => (
                                    <div key={p.id} className="group relative p-4 bg-white/5 border border-white/10 rounded hover:border-[#fbbf24] hover:bg-white/10 transition-all">
                                        <div onClick={() => handleLoadProject(p)} className="cursor-pointer">
                                            <div className="text-[#fbbf24] font-bold text-sm mb-1 group-hover:text-white truncate pr-6">{p.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{new Date(p.updatedAt).toLocaleString()}</div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Xóa dự án này?')) {
                                                    // Delete logic
                                                    fetch(`/api/projects?id=${p.id}`, { method: 'DELETE' }).then(() => fetchProjects());
                                                }
                                            }}
                                            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="flex-grow" onClick={() => setShowHistory(false)}></div>
                </div>
            )}

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
                                <span className="text-xs text-green-500 flex items-center gap-1 font-mono"><CheckCircle size={12} /> SAVED LOCALLY</span>
                                <button
                                    onClick={handleSaveProject}
                                    className="flex items-center gap-2 px-3 py-1 rounded bg-[#fbbf24]/20 border border-[#fbbf24]/50 text-[#fbbf24] text-xs font-bold hover:bg-[#fbbf24] hover:text-black transition-colors"
                                >
                                    <span>💾</span> SAVE PROJECT
                                </button>
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
            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

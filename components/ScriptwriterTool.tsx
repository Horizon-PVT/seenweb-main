// File: components/ScriptwriterTool.tsx (Hoàn Chỉnh - Gọi Backend cho cả 3 chức năng)

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import UpgradeGate from './UpgradeGate';
import PremiumComparison from './PremiumComparison';
import { PyramidIcon } from './AnimatedIcons';
import type { Tool } from './ToolsGrid';

// Giữ nguyên các hằng số
const tones = ["Hùng hồn", "Châm biếm", "Chuyên gia", "Thân thiện", "Kể chuyện", "Bí ẩn", "Hài hước", "Trang trọng", "Cổ vũ", "Nhẹ nhàng", "Kịch tính", "Giáo dục", "Tin tức", "Phỏng vấn", "Triết lý", "Hoài niệm", "Tò mò", "Cảm hứng", "Thách thức", "Giản dị"];
const styles = ["Vlog", "Hồi hộp", "Dạng tin tức", "Phim tài liệu", "Đánh giá sản phẩm", "Hướng dẫn", "Phản ứng", "Thử thách", "Phim ngắn", "Hoạt hình giải thích", "Danh sách top", "ASMR", "Livestream", "Podcast", "Kịch nói", "Lịch sử", "Khoa học viễn tưởng", "Hài kịch", "Chính kịch", "Phiêu lưu"];
const languages = { "English": "en", "Spanish": "es", "French": "fr", "German": "de", "Chinese (Simplified)": "zh-CN", "Japanese": "ja", "Korean": "ko", "Russian": "ru", "Arabic": "ar", "Portuguese": "pt" };

interface ScriptwriterToolProps {
    tools: Tool[];
    onToolSelect: (tool: Tool) => void;
    onBack: () => void;
}

const ScriptwriterTool: React.FC<ScriptwriterToolProps> = ({ tools, onToolSelect, onBack }) => {
    const { data: session } = useSession();
    const { t } = useTranslation('common');
    const router = useRouter();
    const isEN = router.locale === 'en';

    const userRole = (session?.user as any)?.role || 'FREE';
    const [showUpgradeGate, setShowUpgradeGate] = useState(false);
    const [gateRequiredTier, setGateRequiredTier] = useState<string>('CREATIVE');
    const [gateFeatureName, setGateFeatureName] = useState<string>(isEN ? 'This feature' : 'Tính năng này');

    // --- Các state giữ nguyên ---
    // --- Auto-Save Hook Logic ---
    const useAutoSave = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
        const [value, setValue] = useState<T>(() => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem(key);
                // Handle different types
                if (saved !== null) {
                    if (typeof initialValue === 'number') return Number(saved) as T;
                    return saved as T;
                }
            }
            return initialValue;
        });

        useEffect(() => {
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, String(value));
            }
        }, [key, value]);

        return [value, setValue];
    };

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("ĐANG KIẾN TẠO...");

    // Using Auto-save for critical fields
    const [outputScript, setOutputScript] = useAutoSave('sw_outputScript', '');
    const [idea, setIdea] = useAutoSave('sw_idea', '');
    const [goal, setGoal] = useAutoSave('sw_goal', 'Tăng View');
    const [level, setLevel] = useAutoSave('sw_level', 'Nâng Cao');
    const [tone, setTone] = useAutoSave('sw_tone', 'Hùng hồn');
    const [style, setStyle] = useAutoSave('sw_style', 'Vlog');
    const [format, setFormat] = useAutoSave('sw_format', 'visual');
    const [length, setLength] = useAutoSave('sw_length', 10);

    const [error, setError] = useState('');
    const [chatRequest, setChatRequest] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    // --- Các hàm helper giữ nguyên ---
    const handleCopy = () => {
        if (userRole === 'FREE' || userRole === 'USER') {
            setGateRequiredTier('CREATIVE');
            setGateFeatureName('Sao chép kịch bản');
            setShowUpgradeGate(true);
            return;
        }

        if (outputScript) {
            navigator.clipboard.writeText(outputScript).then(() => {
                setCopySuccess('Đã sao chép!');
                setTimeout(() => setCopySuccess(''), 2000);
            });
        }
    };

    const handleExportTxt = () => {
        if (userRole === 'FREE' || userRole === 'USER') {
            setGateRequiredTier('CREATIVE');
            setGateFeatureName('Xuất file TXT');
            setShowUpgradeGate(true);
            return;
        }

        if (outputScript) {
            const blob = new Blob([outputScript], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'kich-ban-seenvt.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // --- Các useEffect giữ nguyên ---
    useEffect(() => {
        const rivalIdea = localStorage.getItem('scriptIdeaFromRival');
        if (rivalIdea) {
            setIdea(rivalIdea);
            localStorage.removeItem('scriptIdeaFromRival');
        }
    }, []);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [outputScript]);


    // --- HÀM handleSubmit (Gọi Backend /api/script-writer) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idea) {
            setError("Vui lòng nhập Dữ Liệu Gốc.");
            return;
        }

        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

        setIsLoading(true);
        setLoadingMessage(format === 'visual' ? "ĐANG DÀN CẢNH..." : "ĐANG VIẾT CÂU CHUYỆN...");
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
                let errorMessage = `Lỗi ${response.status}: ${scriptText}`;
                try { errorMessage = JSON.parse(scriptText).error || errorMessage; } catch (e) { /* Ignore */ }
                throw new Error(errorMessage);
            }
            setOutputScript(scriptText);
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể tạo kịch bản."}`);
            console.error("Lỗi gọi API /api/script-writer:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM handleRefine (Gọi Backend /api/script-refine) ---
    const handleRefine = async (type: 'refine' | 'consistency' | 'translate', lang: string = 'en') => {
        // Feature gating for Refine (SUPER)
        if (['FREE', 'CREATIVE', 'USER'].includes(userRole)) {
            setGateRequiredTier('SUPER'); // PRO tier
            setGateFeatureName('Tinh chỉnh nâng cao & Dịch thuật');
            setShowUpgradeGate(true);
            return;
        }

        if (!outputScript) return;

        setIsLoading(true);
        if (type === 'refine') setLoadingMessage("ĐANG TINH CHỈNH...");
        else if (type === 'consistency') setLoadingMessage("ĐANG ĐỒNG NHẤT...");
        else if (type === 'translate') {
            const langName = Object.keys(languages).find(key => languages[key as keyof typeof languages] === lang) || lang;
            setLoadingMessage(`ĐANG DỊCH SANG ${langName}...`);
        }
        const currentScriptForRequest = outputScript; // Giữ lại script hiện tại
        setOutputScript(''); // Xóa hiển thị tạm thời
        setError('');

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
                let errorMessage = `Lỗi ${response.status}: ${refinedScriptText}`;
                try { errorMessage = JSON.parse(refinedScriptText).error || errorMessage; } catch (e) { /* Ignore */ }
                throw new Error(errorMessage);
            }
            setOutputScript(refinedScriptText);
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể thực hiện."}`);
            console.error("Lỗi gọi API /api/script-refine:", err);
            setOutputScript(currentScriptForRequest); // Khôi phục script cũ nếu lỗi
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM handleChatSubmit (Gọi Backend /api/script-chat) ---
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatRequest || !outputScript) return;

        setIsLoading(true);
        setLoadingMessage("ĐANG CHỈNH SỬA...");
        const currentScriptForRequest = outputScript;
        setOutputScript('');
        setError('');
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
                let errorMessage = `Lỗi ${response.status}: ${editedScriptText}`;
                try { errorMessage = JSON.parse(editedScriptText).error || errorMessage; } catch (e) { /* Ignore */ }
                throw new Error(errorMessage);
            }
            setOutputScript(editedScriptText);
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể chỉnh sửa."}`);
            console.error("Lỗi gọi API /api/script-chat:", err);
            setOutputScript(currentScriptForRequest); // Khôi phục nếu lỗi
        } finally {
            setIsLoading(false);
        }
    };

    // --- Hàm handleConnect giữ nguyên ---
    const handleConnect = () => {
        // Feature gating for Video (VIP)
        if (userRole !== 'VIP' && userRole !== 'ADMIN') {
            setGateRequiredTier('VIP');
            setGateFeatureName('Kết nối tạo Video AI');
            setShowUpgradeGate(true);
            return;
        }

        const videoTool = tools.find(t => t.name.includes("TẠO VIDEO"));
        if (videoTool) {
            alert(`Đang kết nối với công cụ TẠO VIDEO...\n(Kịch bản của bạn đã được lưu tạm và sẵn sàng để sử dụng)`);
            onToolSelect(videoTool);
        }
    }

    // --- Main JSX ---
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
        if (!outputScript) return;
        const name = prompt("Enter project name:", idea.substring(0, 30) + "...") || `Script ${new Date().toLocaleTimeString()}`;

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
            if (data.project) {
                setCurrentProjectId(data.project.id);
                alert("Project Saved!");
                fetchProjects(); // Refresh list
            }
        } catch (e) {
            alert("Save failed");
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

    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 relative">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl md:text-2xl text-center font-playfair text-[#CDAD5A] tracking-wider">
                        {isEN ? 'GALAXY BUILDER: SCRIPT CORE' : 'KIẾN TẠO THIÊN HÀ: LÕI KỊCH BẢN'}
                    </h2>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 px-3 py-1 rounded border border-[#CDAD5A]/30 text-[#CDAD5A] text-xs font-bold hover:bg-[#CDAD5A]/10 transition-colors"
                    >
                        <span className="text-lg">📂</span> {isEN ? 'MY PROJECTS' : 'DỰ ÁN CỦA TÔI'}
                    </button>
                    {outputScript && (
                        <button
                            onClick={handleSaveProject}
                            className="flex items-center gap-2 px-3 py-1 rounded bg-[#CDAD5A]/20 border border-[#CDAD5A]/50 text-[#CDAD5A] text-xs font-bold hover:bg-[#CDAD5A] hover:text-black transition-colors"
                        >
                            <span>💾</span> {isEN ? 'SAVE' : 'LƯU'}
                        </button>
                    )}
                </div>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">
                    &times; {isEN ? 'Back' : 'Trở Về'}
                </button>
            </div>

            {/* ... Rest of the UI grid ... */}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 flex-grow min-h-0">
                {/* Form - Compact Left Panel */}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-2 pr-2 overflow-y-auto text-xs">
                    {/* ... Form inputs ... */}
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">{isEN ? 'RAW DATA INPUT' : 'TẠO DỮ LIỆU GỐC'}</label>
                        <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder={isEN ? 'Enter your idea, topic...' : 'Nhập ý tưởng sơ bộ, chủ đề...'} className="w-full h-24 obsidian-textarea"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-[#CDAD5A]">{isEN ? 'GOAL' : 'MỤC TIÊU'}</label>
                            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full obsidian-select">
                                <option value="Tăng View">{isEN ? 'Increase Views' : 'Tăng View'}</option>
                                <option value="Tăng Chuyển Đổi">{isEN ? 'Increase Conversion' : 'Tăng Chuyển Đổi'}</option>
                                <option value="Xây dựng Thương Hiệu">{isEN ? 'Build Brand' : 'Xây dựng Thương Hiệu'}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#CDAD5A]">{isEN ? 'LEVEL' : 'CẤP ĐỘ'}</label>
                            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full obsidian-select">
                                <option value="Cơ Bản">{isEN ? 'Basic' : 'Cơ Bản'}</option>
                                <option value="Nâng Cao">{isEN ? 'Advanced' : 'Nâng Cao'}</option>
                                <option value="Tinh Hoa">{isEN ? 'Expert' : 'Tinh Hoa'}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">{isEN ? 'TONE' : 'TÔNG GIỌNG'}</label>
                        <select value={tone} onChange={e => setTone(e.target.value)} className="w-full obsidian-select">
                            {tones.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">{isEN ? 'FORMAT' : 'ĐỊNH DẠNG'}</label>
                        <select value={format} onChange={e => setFormat(e.target.value)} className="w-full obsidian-select">
                            <option value="visual">{isEN ? 'Visual Script (Scene-by-scene)' : 'Kịch bản Phân cảnh (Visual)'}</option>
                            <option value="story">{isEN ? 'Storytelling (Story/Podcast)' : 'Kể chuyện (Story/Podcast)'}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">{isEN ? 'STYLE' : 'PHONG CÁCH'}</label>
                        <select value={style} onChange={e => setStyle(e.target.value)} className="w-full obsidian-select">
                            {styles.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">{isEN ? 'LENGTH' : 'ĐỘ DÀI'}</label>
                        <div className="flex items-center gap-2">
                            <input type="range" min="1" max="30" value={length} onChange={e => setLength(parseInt(e.target.value))} className="w-full obsidian-slider" />
                            <span className="font-mono text-lg text-[#008080] w-16 text-center">{length} {isEN ? 'min' : 'phút'}</span>
                        </div>
                    </div>
                    <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full bg-[#CDAD5A] text-black font-bold py-3 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#CDAD5A] active:scale-95 bronze-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? (isEN ? 'GENERATING...' : loadingMessage) : (isEN ? 'INITIALIZE STRUCTURE' : 'KHỞI TẠO CẤU TRÚC')}
                    </button>
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* Output section - Larger Right Panel - UNCHANGED PART 2 */}
                <div className="flex flex-col space-y-2 min-h-0">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-[#008080]">{isEN ? 'SCRIPT FRAME' : 'KHUNG KỊCH BẢN PHÂN LOẠI'}</label>
                            {currentProjectId && <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">Project ID: {currentProjectId.substring(0, 6)}...</span>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={handleCopy} title={isEN ? 'Copy' : 'Sao chép'} className="text-xs px-2 py-1 bg-black/50 border border-gray-700 hover:border-[#CDAD5A] transition-colors rounded-sm disabled:opacity-50" disabled={!outputScript || isLoading}>{isEN ? 'COPY' : 'SAO CHÉP'}</button>
                            <button onClick={handleExportTxt} title={isEN ? 'Export to .txt' : 'Xuất file .txt'} className="text-xs px-2 py-1 bg-black/50 border border-gray-700 hover:border-[#CDAD5A] transition-colors rounded-sm disabled:opacity-50" disabled={!outputScript || isLoading}>{isEN ? 'EXPORT (TXT)' : 'XUẤT (TXT)'}</button>
                            <select onChange={e => handleRefine('translate', e.target.value)} disabled={!outputScript || isLoading} className="text-xs obsidian-select !p-1 disabled:opacity-50">
                                <option>{isEN ? 'TRANSLATE...' : 'DỊCH...'}</option>
                                {Object.entries(languages).map(([name, code]) => <option key={code} value={code}>{name}</option>)}
                            </select>
                            <span className="text-xs text-[#CDAD5A] w-20 text-right">{copySuccess}</span>
                        </div>
                    </div>
                    <div ref={outputRef} className="holographic-output flex-grow p-3 text-sm overflow-y-auto relative">
                        {(isLoading && !outputScript) && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 text-[#008080]"><PyramidIcon /></div>
                                <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">{loadingMessage}</p>
                            </div>
                        )}
                        {outputScript && (
                            <>
                                {/* Custom Markdown Table Renderer - Same as before */}
                                {(() => {
                                    const hasTable = outputScript.includes('|') && outputScript.includes('---');
                                    if (hasTable && (userRole !== 'FREE' && userRole !== 'USER')) {
                                        const lines = outputScript.split('\n').filter(line => line.trim() !== '');
                                        const tableRows = lines.filter(line => line.trim().startsWith('|'));
                                        const textBefore = lines.filter(line => !line.trim().startsWith('|') && !line.startsWith('---')).join('\n');
                                        const headerRow = tableRows[0];
                                        const bodyRows = tableRows.slice(2);
                                        return (
                                            <div className="space-y-4">
                                                <div className="whitespace-pre-wrap text-gray-300 font-sans">{textBefore}</div>
                                                <div className="border border-gray-700 rounded-lg overflow-hidden">
                                                    <div className="grid grid-cols-[50%_15%_35%] bg-gray-900 border-b border-gray-700">
                                                        <div className="p-2 font-bold text-[#CDAD5A] uppercase tracking-wider border-r border-gray-700 flex items-center gap-2 text-xs"><span>🎬</span> TIME + VISUAL PROMPT</div>
                                                        <div className="p-2 font-bold text-[#CDAD5A] uppercase tracking-wider border-r border-gray-700 flex items-center gap-1 text-xs"><span>🔗</span> LINK</div>
                                                        <div className="p-2 font-bold text-[#CDAD5A] uppercase tracking-wider flex items-center gap-2 text-xs"><span>🎤</span> AUDIO</div>
                                                    </div>
                                                    <div className="divide-y divide-gray-700 bg-black/40">
                                                        {bodyRows.map((row, idx) => {
                                                            const cols = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
                                                            if (cols.length < 2) return null;
                                                            return (
                                                                <div key={idx} className="grid grid-cols-[50%_15%_35%] hover:bg-gray-800/30 transition-colors">
                                                                    <div className="p-2 border-r border-gray-700 text-gray-300 whitespace-pre-wrap text-xs">{cols[0] + (cols[1] ? ' - ' + cols[1] : '')}</div>
                                                                    <div className="p-2 border-r border-gray-700 text-gray-400 whitespace-pre-wrap text-xs italic">{cols.length >= 4 ? cols[3] : (cols.length >= 3 ? cols[2] : '-')}</div>
                                                                    <div className="p-2 text-gray-200 whitespace-pre-wrap font-sans text-xs">{cols.length >= 4 ? cols[2] : (cols.length >= 3 ? cols[1] : cols[1] || '-')}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="whitespace-pre-wrap">
                                                {(userRole === 'FREE' || userRole === 'USER') ? (
                                                    <>
                                                        <div className="text-gray-300">{outputScript.substring(0, 400)}...</div>
                                                        <div className="relative mt-4">
                                                            <div className="blur-sm select-none pointer-events-none text-gray-500">{outputScript.substring(400, 800)}</div>
                                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black flex flex-col items-center justify-center cursor-pointer rounded-lg" onClick={() => { setGateRequiredTier('CREATIVE'); setGateFeatureName('Xem toàn bộ kịch bản'); setShowUpgradeGate(true); }}>
                                                                <div className="text-4xl mb-3">🔒</div>
                                                                <p className="text-white font-bold text-center px-4">Kịch bản VIP Pro đã sẵn sàng!<br /><span className="text-xs font-normal text-[#CDAD5A]">Format: Visual Storyboard 2 Cột</span></p>
                                                                <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all">Mở khóa ngay →</button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : outputScript}
                                            </div>
                                        );
                                    }
                                })()}
                            </>
                        )}
                    </div>
                    {/* Phase 3: Live Comparison & Action Panel */}
                    {outputScript && (userRole === 'FREE' || userRole === 'USER') && (
                        <PremiumComparison toolType="script" onUpgrade={() => { setGateRequiredTier('SUPER'); setGateFeatureName('Trải nghiệm Premium'); setShowUpgradeGate(true); }} />
                    )}
                    <div className="border-t border-gray-600/50 pt-2 flex flex-col space-y-2">
                        <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                            <input type="text" value={chatRequest} onChange={e => setChatRequest(e.target.value)} placeholder="Yêu cầu chỉnh sửa nhanh..." className="w-full obsidian-input !py-1 text-xs" disabled={!outputScript || isLoading} />
                            <button type="submit" className="text-xs p-1 px-3 bg-[#008080]/50 border border-[#008080] hover:bg-[#008080] transition-colors rounded-sm disabled:opacity-50" disabled={!chatRequest || isLoading}>Gửi</button>
                        </form>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => handleRefine('refine')} className="text-xs p-2 bg-black/50 border border-gray-700 hover:border-[#CDAD5A] transition-colors rounded-sm disabled:opacity-50" disabled={!outputScript || isLoading}>TINH CHỈNH VĨ MÔ</button>
                            <button onClick={() => handleRefine('consistency')} className="text-xs p-2 bg-black/50 border border-gray-700 hover:border-[#CDAD5A] transition-colors rounded-sm disabled:opacity-50" disabled={!outputScript || isLoading}>ĐỒNG NHẤT NHÂN VẬT</button>
                            <button onClick={handleConnect} className="text-xs p-2 bg-[#008080]/50 border border-[#008080] hover:bg-[#008080] transition-colors rounded-sm disabled:opacity-50" disabled={!outputScript || isLoading}>KẾT NỐI HỢP THÀNH</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PROJECTS DRAWER */}
            {showHistory && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur flex justify-end animate-in fade-in duration-200">
                    <div className="w-96 bg-[#111] border-l border-[#CDAD5A]/30 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[#CDAD5A] font-playfair font-bold text-xl uppercase tracking-wider">My Projects</h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white">&times;</button>
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-3">
                            {projects.length === 0 ? (
                                <p className="text-gray-500 text-center italic">No saved projects yet.</p>
                            ) : (
                                projects.map(p => (
                                    <div key={p.id} onClick={() => handleLoadProject(p)} className="p-3 bg-white/5 border border-white/10 rounded cursor-pointer hover:border-[#CDAD5A] hover:bg-white/10 transition-all group">
                                        <div className="text-[#CDAD5A] font-bold text-sm mb-1 group-hover:text-white">{p.name}</div>
                                        <div className="text-[10px] text-gray-500">{new Date(p.updatedAt).toLocaleString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="flex-grow" onClick={() => setShowHistory(false)}></div>
                </div>
            )}

            {/* Upgrade Gate Modal */}
            <UpgradeGate
                isOpen={showUpgradeGate}
                onClose={() => setShowUpgradeGate(false)}
                userTier={userRole}
                requiredTier={gateRequiredTier}
                featureName={gateFeatureName}
            />
        </div>
    );
};


export default ScriptwriterTool;
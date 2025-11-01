// File: components/ScriptwriterTool.tsx (Hoàn Chỉnh - Gọi Backend cho cả 3 chức năng)

import React, { useState, useRef, useEffect } from 'react';
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
    // --- Các state giữ nguyên ---
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("ĐANG KIẾN TẠO...");
    const [outputScript, setOutputScript] = useState('');
    const [error, setError] = useState('');
    const [idea, setIdea] = useState('');
    const [goal, setGoal] = useState('Tăng View');
    const [level, setLevel] = useState('Nâng Cao');
    const [tone, setTone] = useState('Hùng hồn');
    const [style, setStyle] = useState('Vlog');
    const [length, setLength] = useState(10);
    const [chatRequest, setChatRequest] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    // --- Các hàm helper giữ nguyên ---
    const handleCopy = () => {
        if (outputScript) {
            navigator.clipboard.writeText(outputScript).then(() => {
                setCopySuccess('Đã sao chép!');
                setTimeout(() => setCopySuccess(''), 2000);
            });
        }
    };

    const handleExportTxt = () => {
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
        setLoadingMessage("ĐANG KIẾN TẠO...");
        setOutputScript('');
        setError('');

        try {
            const response = await fetch('/api/script-writer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea, goal, level, tone, style, length: Number(length) }),
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
        const videoTool = tools.find(t => t.name.includes("TẠO VIDEO"));
        if (videoTool) {
            alert(`Đang kết nối với công cụ TẠO VIDEO...\n(Kịch bản của bạn đã được lưu tạm và sẵn sàng để sử dụng)`);
            onToolSelect(videoTool);
        }
    }

    // --- Phần JSX return giữ nguyên ---
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#CDAD5A] tracking-wider">KIẾN TẠO THIÊN HÀ: LÕI KỊCH BẢN</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow min-h-0">
                {/* Form nhập liệu (không thay đổi) */}
                <form onSubmit={handleSubmit} className="md:col-span-1 flex flex-col space-y-3 pr-2 overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">TẠO DỮ LIỆU GỐC</label>
                        <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="Nhập ý tưởng sơ bộ, chủ đề..." className="w-full h-24 obsidian-textarea"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-[#CDAD5A]">MỤC TIÊU</label>
                            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full obsidian-select">
                                <option>Tăng View</option>
                                <option>Tăng Chuyển Đổi</option>
                                <option>Xây dựng Thương Hiệu</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#CDAD5A]">CẤP ĐỘ</label>
                            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full obsidian-select">
                                <option>Cơ Bản</option>
                                <option>Nâng Cao</option>
                                <option>Tinh Hoa</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">TÔNG GIỌNG</label>
                        <select value={tone} onChange={e => setTone(e.target.value)} className="w-full obsidian-select">
                            {tones.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">PHONG CÁCH</label>
                        <select value={style} onChange={e => setStyle(e.target.value)} className="w-full obsidian-select">
                            {styles.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#CDAD5A]">ĐỘ DÀI</label>
                        <div className="flex items-center gap-2">
                           <input type="range" min="1" max="120" value={length} onChange={e => setLength(parseInt(e.target.value))} className="w-full obsidian-slider" />
                           <span className="font-mono text-lg text-[#008080] w-16 text-center">{length} phút</span>
                        </div>
                    </div>
                    <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full bg-[#CDAD5A] text-black font-bold py-3 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#CDAD5A] active:scale-95 bronze-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? loadingMessage : "KHỞI TẠO CẤU TRÚC"}
                    </button>
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* Phần hiển thị kết quả và các nút chức năng (không thay đổi) */}
                <div className="md:col-span-2 flex flex-col space-y-2 min-h-0">
                     <div className="flex justify-between items-center flex-wrap gap-2">
                        <label className="text-xs font-bold text-[#008080]">KHUNG KỊCH BẢN PHÂN LOẠI</label>
                        <div className="flex items-center space-x-2">
                            <button onClick={handleCopy} title="Sao chép" className="text-xs px-2 py-1 bg-black/50 border border-gray-700 hover:border-[#CDAD5A] transition-colors rounded-sm disabled:opacity-50" disabled={!outputScript || isLoading}>SAO CHÉP</button>
                            <button onClick={handleExportTxt} title="Xuất file .txt" className="text-xs px-2 py-1 bg-black/50 border border-gray-700 hover:border-[#CDAD5A] transition-colors rounded-sm disabled:opacity-50" disabled={!outputScript || isLoading}>XUẤT (TXT)</button>
                            <select onChange={e => handleRefine('translate', e.target.value)} disabled={!outputScript || isLoading} className="text-xs obsidian-select !p-1 disabled:opacity-50">
                                <option>DỊCH...</option>
                                {Object.entries(languages).map(([name, code]) => <option key={code} value={code}>{name}</option>)}
                            </select>
                            <span className="text-xs text-[#CDAD5A] w-20 text-right">{copySuccess}</span>
                        </div>
                    </div>
                    <div ref={outputRef} className="holographic-output flex-grow p-3 text-sm overflow-y-auto whitespace-pre-wrap font-mono">
                       {(isLoading && !outputScript) && (
                           <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 text-[#008080]"><PyramidIcon/></div>
                                <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">{loadingMessage}</p> {/* Hiển thị loading message */}
                           </div>
                       )}
                       {outputScript}
                    </div>
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
        </div>
    );
};

export default ScriptwriterTool;
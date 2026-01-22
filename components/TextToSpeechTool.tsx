// File: components/TextToSpeechTool.tsx
// REDESIGNED: Modern UI, Dark Theme (Purple/Orange accents), Detailed Instructions
import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface TextToSpeechToolProps {
    onBack: () => void;
}

type Voice = {
    id: string;
    name: string;
    description?: string;
    type?: 'preset' | 'custom';
};

const TextToSpeechTool: React.FC<TextToSpeechToolProps> = ({ onBack }) => {
    const router = useRouter();
    const isEN = router.locale === 'en';

    // State
    const [scriptText, setScriptText] = useState('');
    const [voices, setVoices] = useState<Voice[]>([]);
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
    const [speed, setSpeed] = useState(1.0);

    // UI State
    const [showGuide, setShowGuide] = useState(false);

    // Cloning State
    const [showCloneModal, setShowCloneModal] = useState(false);
    const [cloneFile, setCloneFile] = useState<File | null>(null);
    const [cloneName, setCloneName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Audio & Progress
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Fetch Voices
    useEffect(() => {
        const fetchVoices = async () => {
            try {
                const res = await fetch('/api/tools/tts/voices');
                const data = await res.json();
                if (data.voices && Array.isArray(data.voices)) {
                    setVoices(data.voices);
                    if (data.voices.length > 0) setSelectedVoiceId(data.voices[0].id);
                }
            } catch (err) {
                console.error("Failed to load voices", err);
            }
        };
        fetchVoices();
    }, []);

    const handleCloneVoice = async () => {
        if (!cloneFile || !cloneName) {
            setError("Vui lòng chọn file và đặt tên.");
            return;
        }
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('audio', cloneFile);
            formData.append('name', cloneName);
            const res = await fetch('/api/tools/tts/clone', { method: 'POST', body: formData });

            if (!res.ok) throw new Error('Clone thất bại');
            const data = await res.json();

            const newVoice: Voice = { id: data.voiceId, name: data.name, type: 'custom' };
            setVoices(prev => [...prev, newVoice]);
            setSelectedVoiceId(newVoice.id);
            setShowCloneModal(false);
            setCloneFile(null);
            setCloneName('');
            alert("Đã thêm giọng mới thành công!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!scriptText) return setError("Chưa nhập văn bản!");
        setIsLoading(true);
        setError('');
        setAudioUrl(null);
        try {
            const res = await fetch('/api/tools/tts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: scriptText,
                    voice: selectedVoiceId,
                    customVoiceId: selectedVoiceId.startsWith('custom_') ? selectedVoiceId : undefined
                    // Speed backend implementation TBD, assuming standard 1.0 for now if not supported
                })
            });
            if (!res.ok) throw new Error('Tạo giọng thất bại');
            const blob = await res.blob();
            setAudioUrl(URL.createObjectURL(blob));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0f111a] text-gray-200 font-sans relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#13151f]/80 backdrop-blur z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">V</div>
                    <div>
                        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">VOICE STUDIO PRO</h1>
                        <p className="text-[10px] text-gray-500">Pocket TTS Engine • Self-Hosted</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowGuide(!showGuide)} className="px-3 py-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition">
                        📘 Hướng Dẫn
                    </button>
                    <button onClick={onBack} className="px-3 py-1.5 text-xs font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded border border-red-900/50 transition">
                        Thoát
                    </button>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 relative z-10">

                {/* LEFT: Text Input */}
                <div className="flex-1 flex flex-col p-6 pr-3 border-r border-gray-800">
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-sm font-bold text-gray-400">NỘI DUNG VĂN BẢN</label>
                        <span className="text-xs text-gray-600">{scriptText.length} ký tự</span>
                    </div>
                    <div className="relative flex-1 group">
                        <textarea
                            value={scriptText}
                            onChange={(e) => setScriptText(e.target.value)}
                            placeholder="Nhập nội dung bạn muốn chuyển thành giọng nói tại đây..."
                            className="w-full h-full bg-[#1a1d2d] border-2 border-transparent focus:border-purple-500/50 rounded-lg p-4 resize-none outline-none transition-all text-sm leading-7 text-gray-300 shadow-inner"
                        ></textarea>
                        {scriptText.length === 0 && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 pointer-events-none flex flex-col items-center">
                                <span className="text-4xl mb-2 opacity-20">✍️</span>
                                <span className="text-xs opacity-50">Gõ chữ hoặc dán nội dung vào đây</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Settings */}
                <div className="w-[350px] flex flex-col p-6 pl-3 bg-[#13151f]/50">

                    {/* Voice Select */}
                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Chọn Giọng Đọc (Voice)</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedVoiceId}
                                onChange={e => setSelectedVoiceId(e.target.value)}
                                className="flex-1 bg-[#1a1d2d] border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:border-purple-500 outline-none"
                            >
                                {voices.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.type === 'custom' ? '👤 ' : '🤖 '} {v.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowCloneModal(true)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 rounded shadow-lg shadow-purple-900/20 text-xs font-bold transition"
                                title="Thêm giọng mới (Clone)"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mb-6 space-y-4">
                        <div className="bg-[#1a1d2d] p-4 rounded-lg border border-gray-800">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-400">Tốc độ (Speed)</span>
                                <span className="text-purple-400 font-bold">{speed}x</span>
                            </div>
                            <input
                                type="range" min="0.5" max="2" step="0.1"
                                value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                    </div>

                    {/* Preview / Status */}
                    <div className="flex-1 bg-black/20 rounded-lg border border-dashed border-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                        {isLoading ? (
                            <div className="text-center animate-pulse z-10">
                                <div className="w-12 h-12 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin mx-auto mb-3"></div>
                                <p className="text-xs text-purple-400 tracking-widest font-bold">ĐANG XỬ LÝ AI...</p>
                            </div>
                        ) : audioUrl ? (
                            <div className="w-full h-full flex flex-col justify-center items-center z-10 animate-in fade-in">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 animate-bounce-slow">
                                    <span className="text-3xl">🔊</span>
                                </div>
                                <audio controls src={audioUrl} className="w-full mb-3 shadow-lg rounded-full" autoPlay />
                                <a href={audioUrl} download="voice.wav" className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                                    Tải xuống file .WAV
                                </a>
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 z-10">
                                <p className="text-xs">Bấm "Tạo Nhanh" để nghe thử</p>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        className="mt-4 w-full py-4 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <span className="text-xl group-hover:animate-ping">⚡</span> TẠO NHANH (GENERATE)
                    </button>
                    {error && <p className="mt-2 text-center text-xs text-red-500 bg-red-900/10 py-1 rounded">{error}</p>}
                </div>
            </div>

            {/* GUIDE MODAL */}
            {showGuide && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#1a1d2d] w-full max-w-2xl rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">📘 HƯỚNG DẪN SỬ DỤNG</h3>
                            <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="p-6 space-y-4 text-sm text-gray-300 max-h-[60vh] overflow-y-auto">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-purple-400">1</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Chọn Giọng Đọc</h4>
                                    <p className="text-xs text-gray-400">Chọn giọng có sẵn (Mạnh mẽ, Trầm ấm...) hoặc bấm dấu <b>(+)</b> để tự tạo giọng nói riêng của bạn (Clone).</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-purple-400">2</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Nhập Văn Bản</h4>
                                    <p className="text-xs text-gray-400">Nhập nội dung vào khung lớn bên trái. Hệ thống xử lý tốt nhất với tiếng Anh, và hỗ trợ tiếng Việt (cần chọn giọng Việt hoặc Clone giọng Việt).</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-purple-400">3</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Tạo Audio</h4>
                                    <p className="text-xs text-gray-400">Bấm nút "TẠO NHANH" màu cam. Chờ 5-10 giây để AI xử lý. File âm thanh sẽ hiện ra để bạn nghe thử và tải về.</p>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded text-xs">
                                💡 <b>Mẹo:</b> Để Clone giọng chuẩn nhất, hãy upload file âm thanh rõ ràng, không có tạp âm nền, độ dài khoảng 10-20 giây.
                            </div>
                        </div>
                        <div className="p-4 bg-gray-900 border-t border-gray-800 text-right">
                            <button onClick={() => setShowGuide(false)} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded text-white font-bold transition">Đã Hiểu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CLONE MODAL */}
            {showCloneModal && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-[#13151f] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <h3 className="text-xl font-bold text-white mb-1">Thêm Giọng Mới (Clone)</h3>
                        <p className="text-xs text-gray-500 mb-6">Tải lên file giọng mẫu (~10s) để AI học theo.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">Tên gợi nhớ</label>
                                <input
                                    type="text" value={cloneName} onChange={e => setCloneName(e.target.value)}
                                    placeholder="Ví dụ: Giọng Sếp Tùng..."
                                    className="w-full bg-[#1a1d2d] border border-gray-700 rounded p-3 text-sm focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">File âm thanh mẫu (.wav, .mp3)</label>
                                <div className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-lg p-6 text-center transition cursor-pointer relative group bg-[#1a1d2d]">
                                    <input
                                        type="file" accept=".wav,.mp3,.m4a"
                                        onChange={e => setCloneFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="text-2xl mb-2 group-hover:scale-110 transition">📂</div>
                                    <p className="text-xs text-gray-400">{cloneFile ? cloneFile.name : "Kéo thả hoặc bấm để chọn file"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowCloneModal(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-xs transition">HỦY BỎ</button>
                            <button
                                onClick={handleCloneVoice} disabled={isUploading}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
                            >
                                {isUploading ? 'ĐANG TẢI LÊN...' : 'BẮT ĐẦU CLONE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextToSpeechTool;
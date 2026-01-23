// File: components/TextToSpeechTool.tsx
// REFACTORED: POCKET TTS + VIETNAM VOICE (EDGE)
import React, { useState, useEffect } from 'react';

interface TextToSpeechToolProps {
    onBack: () => void;
}

// EDGE VOICES (VIETNAM)
const VN_VOICES = [
    { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Nữ - Bắc - Thời Sự)', gender: 'Female' },
    { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Nam - Bắc - Truyện)', gender: 'Male' },
];

const TextToSpeechTool: React.FC<TextToSpeechToolProps> = ({ onBack }) => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'POCKET' | 'EDGE'>('POCKET');

    // Common State
    const [scriptText, setScriptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Pocket State
    const [pocketVoices, setPocketVoices] = useState<any[]>([]);
    const [selectedPocketVoiceId, setSelectedPocketVoiceId] = useState<string>('');
    const [showVoiceModal, setShowVoiceModal] = useState(false);

    // Clone State
    const [showCloneModal, setShowCloneModal] = useState(false);
    const [cloneFile, setCloneFile] = useState<File | null>(null);
    const [cloneName, setCloneName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Edge State
    const [selectedEdgeVoice, setSelectedEdgeVoice] = useState('vi-VN-HoaiMyNeural');

    // Load Pocket Voices
    useEffect(() => {
        if (activeTab === 'POCKET' && pocketVoices.length === 0) {
            fetch('/api/tools/tts/voices').then(res => res.json()).then(data => {
                if (data.voices) {
                    const processed = data.voices.map((v: any) => typeof v === 'string' ? { id: v, name: v, type: 'preset' } : v);
                    setPocketVoices(processed);
                    if (processed.length > 0) setSelectedPocketVoiceId(processed[0].id);
                }
            }).catch(console.error);
        }
    }, [activeTab]);

    // Handlers
    const handleCloneVoice = async () => {
        if (!cloneFile || !cloneName) return setError("Thiếu file hoặc tên.");
        if (!cloneFile.name.toLowerCase().endsWith('.wav')) {
            return setError("Vui lòng dùng file đuôi .WAV (convertio.co) để tránh lỗi server.");
        }
        setIsUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('audio', cloneFile);
            formData.append('name', cloneName);
            const res = await fetch('/api/tools/tts/clone', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Clone failed');
            setPocketVoices(prev => [{ id: data.voiceId, name: data.name, type: 'custom' }, ...prev]);
            setSelectedPocketVoiceId(data.voiceId);
            setShowCloneModal(false);
            setCloneFile(null);
            setCloneName('');
            alert("Clone thành công!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!scriptText.trim()) return setError("Nhập nội dung đi anh!");
        setIsLoading(true);
        setError('');
        setAudioUrl(null);
        try {
            let res;
            if (activeTab === 'POCKET') {
                res = await fetch('/api/tools/tts/generate', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: scriptText,
                        voice: selectedPocketVoiceId,
                        customVoiceId: selectedPocketVoiceId.startsWith('custom_') ? selectedPocketVoiceId : undefined
                    })
                });
            } else {
                // EDGE (Vietnam)
                res = await fetch('/api/tools/tts/edge', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: scriptText, voice: selectedEdgeVoice })
                });
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Lỗi: ${res.statusText}`);
            }
            const blob = await res.blob();
            setAudioUrl(URL.createObjectURL(blob));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const currentPocketName = pocketVoices.find(v => v.id === selectedPocketVoiceId)?.name || 'Chọn Giọng';

    return (
        <div className="fixed inset-0 z-50 bg-[#0f111a] text-gray-200 font-sans flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 bg-[#13151f] flex items-center justify-between px-6 shadow-md z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition">←</button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">AUDIO STUDIO</h1>
                </div>
                {/* Tabs */}
                <div className="flex bg-gray-900 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('POCKET')}
                        className={`px-4 py-1 rounded-md text-sm font-bold transition ${activeTab === 'POCKET' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >Pocket TTS (English/Clone)</button>
                    <button
                        onClick={() => setActiveTab('EDGE')}
                        className={`px-4 py-1 rounded-md text-sm font-bold transition ${activeTab === 'EDGE' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >Giọng Việt Nam Premium</button>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className="flex-1 bg-[#0f111a] flex flex-col p-6 relative">
                    <textarea
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                        placeholder={activeTab === 'POCKET' ? "Enter text (English recommended)..." : "Nhập văn bản tiếng Việt..."}
                        className="flex-1 bg-[#1a1d2d] border border-gray-800 rounded-xl p-6 resize-none outline-none focus:border-purple-500/50 transition mb-6"
                    ></textarea>

                    <div className="flex gap-4">
                        <button onClick={handleGenerate} disabled={isLoading} className={`flex-1 py-4 bg-gradient-to-r rounded-xl font-bold text-white shadow-lg transition disabled:opacity-50 ${activeTab === 'POCKET' ? 'from-purple-600 to-pink-600 hover:shadow-purple-500/20' : 'from-orange-600 to-red-600 hover:shadow-orange-500/20'}`}>
                            {isLoading ? 'ĐANG XỬ LÝ...' : '⚡ TẠO AUDIO'}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-red-500 text-sm bg-red-900/10 p-2 rounded">{error}</p>}
                </div>

                {/* Sidebar */}
                <div className="w-[350px] bg-[#13151f] border-l border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto">

                    {/* Controls based on Tab */}
                    {activeTab === 'POCKET' ? (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">GIỌNG ĐỌC (POCKET)</label>
                            <div className="flex gap-2">
                                <button onClick={() => setShowVoiceModal(true)} className="flex-1 bg-[#1a1d2d] border border-gray-700 p-3 rounded-lg text-left font-bold text-sm hover:border-purple-500 transition">{currentPocketName}</button>
                                <button onClick={() => setShowCloneModal(true)} className="px-3 bg-purple-900/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-900/40 transition" title="Clone Giọng Mới">+</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">GIỌNG ĐỌC (VIỆT NAM)</label>
                            <div className="grid grid-cols-1 gap-2 bg-[#1a1d2d] p-2 rounded-lg border border-gray-800">
                                {VN_VOICES.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedEdgeVoice(v.id)}
                                        className={`p-3 rounded text-left text-sm flex justify-between ${selectedEdgeVoice === v.id ? 'bg-orange-900/30 text-orange-400 font-bold border border-orange-500/50' : 'text-gray-400 hover:bg-gray-800 border border-transparent'}`}
                                    >
                                        <span>{v.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 text-xs text-gray-500 italic">
                                * Công nghệ Neural TTS thế hệ mới. Đọc diễn cảm, tự nhiên.
                            </div>
                        </div>
                    )}

                    {/* Preview (Shared) */}
                    <div className="bg-[#1a1d2d] p-4 rounded-xl border border-gray-800 mt-auto">
                        <h4 className="text-xs font-bold text-gray-500 mb-3">KẾT QUẢ</h4>
                        {audioUrl ? (
                            <div>
                                <audio controls src={audioUrl} className="w-full mb-3" autoPlay />
                                <a href={audioUrl} download={`voice_${activeTab}.mp3`} className="block w-full text-center bg-gray-700 hover:bg-gray-600 py-2 rounded text-xs font-bold">Tải Xuống</a>
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 text-sm py-4">Chưa có audio</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals for Pocket - Same */}
            {showVoiceModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm">
                    {/* ... (Reuse existing modal markup) ... */}
                    <div className="bg-[#13151f] w-full max-w-4xl h-[70vh] rounded-2xl border border-gray-700 flex flex-col p-4">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold">Chọn Giọng Pocket</h3>
                            <button onClick={() => setShowVoiceModal(false)}>✕</button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 overflow-y-auto">
                            {pocketVoices.map(v => (
                                <button key={v.id} onClick={() => { setSelectedPocketVoiceId(v.id); setShowVoiceModal(false); }} className={`p-4 rounded border ${selectedPocketVoiceId === v.id ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700'}`}>
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showCloneModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1a1d2d] w-full max-w-md p-6 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Clone Giọng Mới</h3>
                        <div className="text-yellow-500 text-xs mb-4">Lưu ý: Chỉ hỗ trợ file .WAV. Tên file không dấu.</div>
                        <input className="w-full bg-black/20 border border-gray-700 rounded p-2 mb-4" placeholder="Tên gợi nhớ..." value={cloneName} onChange={e => setCloneName(e.target.value)} />
                        <input type="file" accept=".wav" onChange={e => e.target.files && setCloneFile(e.target.files[0])} className="mb-4 text-sm text-gray-400" />
                        <button onClick={handleCloneVoice} disabled={isUploading} className="w-full bg-purple-600 py-2 rounded font-bold text-white disabled:opacity-50">{isUploading ? 'Đang Upload...' : 'Clone Auto'}</button>
                        <button onClick={() => setShowCloneModal(false)} className="w-full mt-2 text-gray-500">Hủy</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextToSpeechTool;
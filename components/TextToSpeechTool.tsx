// File: components/TextToSpeechTool.tsx
// REDESIGNED: 3-column layout, 2 tabs, dialogue mode
// Color scheme: Red + White + Black text (Phong thủy)

import React, { useState, useEffect, useRef } from 'react';

interface TextToSpeechToolProps {
    onBack: () => void;
}

// Available voices
const PRESET_VOICES = [
    { id: 'alba', name: 'Alba (Nữ)', gender: 'Female' },
    { id: 'jean', name: 'Jean (Nam)', gender: 'Male' },
    { id: 'fantine', name: 'Fantine (Nữ)', gender: 'Female' },
    { id: 'marius', name: 'Marius (Nam)', gender: 'Male' },
];

const VN_VOICES = [
    { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Nữ)', gender: 'Female' },
    { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Nam)', gender: 'Male' },
];

const TextToSpeechTool: React.FC<TextToSpeechToolProps> = ({ onBack }) => {
    // Tab State: 'text' or 'file'
    const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

    // Common State
    const [scriptText, setScriptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Voice State
    const [voice1, setVoice1] = useState('vi-VN-HoaiMyNeural');
    const [voice2, setVoice2] = useState('vi-VN-NamMinhNeural');
    const [clonedVoices, setClonedVoices] = useState<{ id: string, name: string }[]>([]);

    // Dialogue Mode
    const [dialogueMode, setDialogueMode] = useState(false);

    // Initial Voice Load
    useEffect(() => {
        fetch('/api/tools/tts/voices')
            .then(res => res.json())
            .then(data => {
                if (data.voices) {
                    const customs = data.voices.filter((v: any) => v.type === 'custom');
                    setClonedVoices(customs);
                }
            })
            .catch(err => console.error("Failed to load voices:", err));
    }, []);

    // Settings
    const [speed, setSpeed] = useState(1.0);
    const [volume, setVolume] = useState(1.0);

    // SRT State
    const [srtFile, setSrtFile] = useState<File | null>(null);
    const srtInputRef = useRef<HTMLInputElement>(null);

    // Clone Modal
    const [showCloneModal, setShowCloneModal] = useState(false);
    const [cloneFile, setCloneFile] = useState<File | null>(null);
    const [cloneName, setCloneName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // All voices combined
    const allVoices = [...VN_VOICES, ...PRESET_VOICES, ...clonedVoices.map(v => ({ ...v, gender: 'Custom' }))];

    // Handle Clone Voice
    const handleCloneVoice = async () => {
        if (!cloneFile || !cloneName) return setError("Thiếu file hoặc tên.");
        setIsUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('audio', cloneFile);
            formData.append('name', cloneName);
            const res = await fetch('/api/tools/tts/clone', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Clone failed');
            setClonedVoices(prev => [{ id: data.voiceId, name: data.name }, ...prev]);
            setVoice1(data.voiceId);
            setShowCloneModal(false);
            setCloneFile(null);
            setCloneName('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle Generate (normal or dialogue)
    const handleGenerate = async () => {
        if (!scriptText.trim()) return setError("Vui lòng nhập nội dung!");
        setIsLoading(true);
        setError('');
        setAudioUrl(null);

        try {
            if (dialogueMode) {
                // Parse [A] and [B] markers
                const res = await fetch('/api/tools/tts/generate-dialogue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: scriptText,
                        voice1: voice1,
                        voice2: voice2,
                        speed: speed
                    })
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Lỗi tạo hội thoại');
                }
                const blob = await res.blob();
                setAudioUrl(URL.createObjectURL(blob));
            } else {
                // Normal single voice
                const isVN = voice1.startsWith('vi-VN');
                const endpoint = isVN ? '/api/tools/tts/edge' : '/api/tools/tts/generate';

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: scriptText,
                        voice: voice1,
                        customVoiceId: voice1.startsWith('custom_') ? voice1 : undefined,
                        rate: Math.round((speed - 1) * 100) // Convert to percentage
                    })
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Lỗi tạo audio');
                }
                const blob = await res.blob();
                setAudioUrl(URL.createObjectURL(blob));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle File Generate (TXT, SRT, DOC, DOCX)
    const handleSRTGenerate = async () => {
        if (!srtFile) return setError('Vui lòng chọn file!');
        setIsLoading(true);
        setError('');
        setAudioUrl(null);

        try {
            const formData = new FormData();
            formData.append('srtFile', srtFile);
            formData.append('voice', voice1);
            if (voice1.startsWith('custom_')) {
                formData.append('customVoiceId', voice1);
            }

            const res = await fetch('/api/tools/tts/generate-file', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Lỗi xử lý SRT');
            }
            const blob = await res.blob();
            setAudioUrl(URL.createObjectURL(blob));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Import Text Handler
    const importInputRef = useRef<HTMLInputElement>(null);
    const handleImportText = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                if (text) setScriptText(text);
            };
            reader.readAsText(file);
        } else {
            setError("Chỉ hỗ trợ import file .txt (văn bản thuần)");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white text-gray-900 font-sans flex flex-col">
            {/* Header - Red gradient */}
            <div className="h-16 bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-between px-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white font-bold"
                    >
                        ←
                    </button>
                    <h1 className="text-xl font-bold text-white">🎙️ AUDIO STUDIO</h1>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/20 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'text'
                            ? 'bg-white text-red-600 shadow'
                            : 'text-white hover:bg-white/10'
                            }`}
                    >
                        📝 Văn Bản
                    </button>
                    <button
                        onClick={() => setActiveTab('file')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'file'
                            ? 'bg-white text-red-600 shadow'
                            : 'text-white hover:bg-white/10'
                            }`}
                    >
                        📄 Upload File
                    </button>
                </div>

                <div className="w-32"></div> {/* Spacer for balance */}
            </div>

            {/* Main 3-Column Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT COLUMN - Instructions */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
                    <h3 className="text-lg font-bold text-red-600 mb-4">📖 Hướng Dẫn</h3>

                    {activeTab === 'text' ? (
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-bold text-red-500">Bước 1:</span>
                                <p>Nhập văn bản cần đọc vào ô giữa</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-bold text-red-500">Bước 2:</span>
                                <p>Chọn giọng đọc bên phải</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-bold text-red-500">Bước 3:</span>
                                <p>Nhấn "Tạo Audio" và đợi kết quả</p>
                            </div>

                            {dialogueMode && (
                                <div className="p-3 bg-red-50 rounded-lg border border-red-200 mt-4">
                                    <span className="font-bold text-red-600">💬 Chế độ Hội thoại:</span>
                                    <p className="mt-2">Dùng [A] và [B] để đánh dấu:</p>
                                    <pre className="mt-2 text-xs bg-white p-2 rounded border">
                                        {`[A] Xin chào!
[B] Chào bạn!
[A] Hôm nay thế nào?`}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-bold text-red-500">Bước 1:</span>
                                <p>Upload file .txt hoặc .srt</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-bold text-red-500">Bước 2:</span>
                                <p>Chọn giọng đọc (Preset hoặc Clone)</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-bold text-red-500">Bước 3:</span>
                                <p>Nhấn "TẠO AUDIO"</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <span className="font-bold text-yellow-700">💡 Lưu ý:</span>
                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                    <li>Upload file <b>.txt/.srt</b>.</li>
                                    <li>Nên dùng file <b>.WAV</b> để Clone giọng tốt nhất.</li>
                                    <li>Giọng Clone được lưu trữ trong <b>30 ngày</b>.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* CENTER COLUMN - Main Editor */}
                <div className="flex-1 bg-gray-100 flex flex-col p-6">
                    {activeTab === 'text' ? (
                        <>
                            <div className="flex justify-end mb-2">
                                <input
                                    type="file"
                                    ref={importInputRef}
                                    accept=".txt"
                                    className="hidden"
                                    onChange={handleImportText}
                                />
                                <button
                                    onClick={() => importInputRef.current?.click()}
                                    className="text-sm flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                                >
                                    📥 Import file (.txt)
                                </button>
                            </div>
                            <textarea
                                value={scriptText}
                                onChange={(e) => setScriptText(e.target.value)}
                                placeholder={dialogueMode
                                    ? "[A] Xin chào!\n[B] Chào bạn, hôm nay thế nào?\n[A] Tôi khỏe, cảm ơn!"
                                    : "Nhập văn bản cần chuyển thành giọng nói..."
                                }
                                className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 resize-none outline-none focus:border-red-400 transition text-gray-800 text-lg"
                            />
                            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                <span>{scriptText.length} ký tự</span>
                                {dialogueMode && <span className="text-red-500">Chế độ hội thoại đang bật</span>}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
                            <input
                                type="file"
                                ref={srtInputRef}
                                accept=".srt,.txt"
                                className="hidden"
                                onChange={(e) => setSrtFile(e.target.files?.[0] || null)}
                            />

                            {srtFile ? (
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📄</div>
                                    <p className="text-xl font-bold text-gray-800">{srtFile.name}</p>
                                    <p className="text-gray-500 mt-2">{(srtFile.size / 1024).toFixed(1)} KB</p>
                                    <button
                                        onClick={() => setSrtFile(null)}
                                        className="mt-4 text-red-500 hover:text-red-700 text-sm"
                                    >
                                        ✕ Xóa file
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-6xl mb-4 text-gray-300">📄</div>
                                    <p className="text-gray-500 mb-4">Kéo thả file vào đây hoặc</p>
                                    <button
                                        onClick={() => srtInputRef.current?.click()}
                                        className="px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                                    >
                                        Chọn File (TXT, SRT)
                                    </button>
                                    <p className="text-gray-400 text-xs mt-3">Hỗ trợ: .txt, .srt</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={activeTab === 'text' ? handleGenerate : handleSRTGenerate}
                        disabled={isLoading || (activeTab === 'text' ? !scriptText : !srtFile)}
                        className={`mt-6 w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition transform hover:-translate-y-0.5 ${isLoading || (activeTab === 'text' ? !scriptText : !srtFile)
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/30'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : '⚡ TẠO AUDIO'}
                    </button>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN - Options */}
                <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">

                    {/* Dialogue Mode Toggle */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-800">💬 Hội thoại 2 người</p>
                                <p className="text-xs text-gray-500 mt-1">Dùng [A] [B] để đánh dấu</p>
                            </div>
                            <button
                                onClick={() => setDialogueMode(!dialogueMode)}
                                className={`w-14 h-7 rounded-full transition ${dialogueMode ? 'bg-red-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${dialogueMode ? 'translate-x-8' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Voice Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-red-600 mb-2">
                            🎙️ Giọng đọc {dialogueMode ? '[A]' : ''}
                        </label>
                        <select
                            value={voice1}
                            onChange={(e) => setVoice1(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-400 outline-none bg-white"
                        >
                            <optgroup label="Giọng Việt Nam">
                                {VN_VOICES.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Giọng Quốc Tế">
                                {PRESET_VOICES.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </optgroup>
                            {clonedVoices.length > 0 && (
                                <optgroup label="Giọng Clone">
                                    {clonedVoices.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>

                        <button
                            onClick={() => setShowCloneModal(true)}
                            className="mt-2 w-full py-2 border-2 border-dashed border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                        >
                            + Clone Giọng Mới
                        </button>
                    </div>

                    {/* Voice 2 (only in dialogue mode) */}
                    {dialogueMode && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-red-600 mb-2">
                                🎙️ Giọng đọc [B]
                            </label>
                            <select
                                value={voice2}
                                onChange={(e) => setVoice2(e.target.value)}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-400 outline-none bg-white"
                            >
                                <optgroup label="Giọng Việt Nam">
                                    {VN_VOICES.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Giọng Quốc Tế">
                                    {PRESET_VOICES.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                    )}

                    {/* Speed Slider */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-gray-700">⚡ Tốc độ</label>
                            <span className="text-sm text-red-500 font-bold">{speed.toFixed(2)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full accent-red-500"
                        />
                    </div>

                    {/* Volume Slider */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-gray-700">🔊 Âm lượng</label>
                            <span className="text-sm text-red-500 font-bold">{Math.round(volume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full accent-red-500"
                        />
                    </div>

                    {/* Result */}
                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-red-600 mb-3">🎵 KẾT QUẢ</h4>
                        {audioUrl ? (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <audio controls src={audioUrl} className="w-full mb-3" autoPlay />
                                <a
                                    href={audioUrl}
                                    download={`audio_${Date.now()}.wav`}
                                    className="block w-full text-center py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                                >
                                    ⬇️ Tải Xuống
                                </a>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center text-gray-400">
                                Chưa có audio
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Clone Modal */}
            {
                showCloneModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">🎙️ Clone Giọng Mới</h3>
                            <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-200">
                                <p>💡 <b>Mẹo:</b> Nên dùng file <b>.WAV</b> (mono, 22050Hz) để có chất lượng tốt nhất.</p>
                                <p className="mt-1">Giọng sẽ được lưu trong hệ thống <b>30 ngày</b>.</p>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Upload file âm thanh (WAV/MP3) giọng mẫu của bạn (~10s).</p>

                            <input
                                className="w-full border-2 border-gray-200 rounded-lg p-3 mb-4 focus:border-red-400 outline-none"
                                placeholder="Tên giọng (VD: Giọng Anh Tùng)"
                                value={cloneName}
                                onChange={e => setCloneName(e.target.value)}
                            />

                            <input
                                type="file"
                                accept=".wav,.mp3"
                                onChange={e => e.target.files && setCloneFile(e.target.files[0])}
                                className="mb-4 text-sm text-gray-600 w-full"
                            />

                            {cloneFile && (
                                <p className="text-sm text-green-600 mb-4">✓ {cloneFile.name}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCloneModal(false)}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleCloneVoice}
                                    disabled={isUploading || !cloneFile || !cloneName}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:bg-gray-300"
                                >
                                    {isUploading ? 'Đang upload...' : 'Clone Giọng'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TextToSpeechTool;
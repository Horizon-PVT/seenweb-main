// File: components/TextToSpeechTool.tsx
// REDESIGNED: 3-column layout, 2 tabs, dialogue mode
// Color scheme: Red + White + Black text (Phong thủy)

import React, { useState, useEffect, useRef, useMemo } from 'react';
import VoiceGalleryModal from './VoiceGalleryModal';

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
    const [showVoiceGallery, setShowVoiceGallery] = useState(false);
    const [galleryTarget, setGalleryTarget] = useState<'voice1' | 'voice2'>('voice1'); // For dialogue mode

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

    // Prepare voice lists for gallery
    const combinedPresetVoices = useMemo(() => {
        // Tag them as 'preset'
        const vn = VN_VOICES.map(v => ({ ...v, type: 'preset' as const }));
        const intl = PRESET_VOICES.map(v => ({ ...v, type: 'preset' as const }));
        return [...vn, ...intl];
    }, []);

    const combinedCustomVoices = useMemo(() => {
        return clonedVoices.map(v => ({ ...v, gender: 'Custom', type: 'custom' as const }));
    }, [clonedVoices]);

    // Helper to get voice name
    const getVoiceName = (id: string) => {
        const all = [...combinedPresetVoices, ...combinedCustomVoices];
        const v = all.find(x => x.id === id);
        return v ? v.name : id;
    };

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

    // Handle Delete Voice
    const handleDeleteVoice = async (idToDelete: string) => {
        if (!idToDelete.startsWith('custom_')) return;
        if (!confirm("Bạn chắc chắn muốn xóa giọng này?")) return;

        try {
            const res = await fetch('/api/tools/tts/delete-voice', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voiceId: idToDelete })
            });
            if (!res.ok) throw new Error("Lỗi xóa giọng");

            setClonedVoices(prev => prev.filter(v => v.id !== idToDelete));
            if (voice1 === idToDelete) setVoice1('vi-VN-HoaiMyNeural');
            if (voice2 === idToDelete) setVoice2('vi-VN-NamMinhNeural');

        } catch (err: any) {
            alert("Xóa thất bại: " + err.message);
        }
    };

    // State for Progress Polling
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');

    // Poll for Job Status
    const pollJobStatus = async (jobId: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/tools/tts/check-status?jobId=${jobId}`);
                    if (!res.ok) {
                        clearInterval(interval);
                        reject(new Error("Failed to check status"));
                        return;
                    }
                    const data = await res.json();

                    if (data.status === 'processing') {
                        setProgress(data.progress || 0);
                        setStatusMessage(data.message || 'Processing...');
                    } else if (data.status === 'completed') {
                        clearInterval(interval);
                        setProgress(100);
                        setStatusMessage('Completed!');
                        resolve(data.job_id);
                    } else if (data.status === 'failed') {
                        clearInterval(interval);
                        reject(new Error(data.error || 'Job failed'));
                    }
                } catch (e) {
                    console.error("Polling error", e);
                    // Don't reject immediately on network glitch, just retry
                }
            }, 2000); // Check every 2 seconds
        });
    };

    // Handle Generate (normal or dialogue)
    const handleGenerate = async () => {
        if (!scriptText.trim()) return setError("Vui lòng nhập nội dung!");
        setIsLoading(true);
        setError('');
        setAudioUrl(null);
        setProgress(0);
        setStatusMessage('Starting...');

        try {
            if (dialogueMode) {
                // Submit Dialogue Job
                setStatusMessage('Submitting dialogue job...');
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
                const data = await res.json();

                // Poll Status
                const finishedJobId = await pollJobStatus(data.jobId);

                // Download Result
                const dlRes = await fetch(`/api/tools/tts/check-status?jobId=${finishedJobId}`); // Get correct download link logic or just use download endpoint
                // Actually the plan says: GET /job/{job_id}/download proxied via check-status? Or separate?
                // Plan: "Create check-status.ts - Proxy download when status is completed" -> Wait, check-status returns JSON.
                // We need a download link.
                // Let's call the Python download endpoint via a proxy? 
                // Currently `check-status.ts` only returns JSON.
                // Let's make a direct link to the Python server via local-worker proxy if possible? 
                // Or better: Use the same `check-status` API to get the download link?
                // Actually, let's keep it simple: server.py has /job/{id}/download.
                // WE need to access it. Since it's behind ngrok/cloudflare, the frontend cannot reach it directly easily if CORS/Auth issues.
                // But we are on localhost for now or cloudflare.
                // BETTER: Modify `check-status.ts` to handle download OR create `download-job.ts`. 
                // For now, let's fetch the blob via a new API call?
                // Actually, let's just use the `check-status` API to return the file if we add a query param `download=true`.
                // OR simpler: just fetch from python in `handleGenerate` after polling.

                // Fetch the file content via Next.js Proxy (we can reuse generate endpoint logic or make a new one).
                // Let's hack it: Server.py has /job/{id}/download.
                // We can't hit 127.0.0.1:8000 from browser if using Cloudflare.
                // We must proxy through Next.js.
                // Let's assume we create a temp `/api/tools/tts/download-job?id=...` that proxies.
                // I forgot to create that in the plan.
                // I can implement it right here inside `handleGenerate` by fetching through a proxy.
                // Wait, `check-status.ts` is just a proxy right? 
                // Let's re-read `check-status.ts` ... it calls `res.json(data)`.

                // I will add a quick `download-job` API or just fetch it here using a clever use of `generate`? No.
                // I'll create `pages/api/tools/tts/download.ts` quickly next step.
                // For now, let's assume it exists: `/api/tools/tts/download?jobId=${finishedJobId}`

                setStatusMessage('Downloading file...');
                const downloadRes = await fetch(`/api/tools/tts/download-result?jobId=${finishedJobId}`);
                if (!downloadRes.ok) throw new Error('Download failed');
                const blob = await downloadRes.blob();
                setAudioUrl(URL.createObjectURL(blob));

            } else {
                // Normal single voice
                const isVN = voice1.startsWith('vi-VN');

                if (isVN) {
                    // Keep synchronous for VN (Edge TTS)
                    setStatusMessage('Generating Vietnamese...');
                    const res = await fetch('/api/tools/tts/edge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: scriptText,
                            voice: voice1,
                            rate: Math.round((speed - 1) * 100)
                        })
                    });
                    if (!res.ok) throw new Error('Edge TTS Failed');
                    const blob = await res.blob();
                    setAudioUrl(URL.createObjectURL(blob));
                    setProgress(100);
                } else {
                    // Pocket TTS - Async Job
                    setStatusMessage('Submitting TTS job...');
                    const res = await fetch('/api/tools/tts/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: scriptText,
                            voice: voice1,
                            customVoiceId: voice1.startsWith('custom_') ? voice1 : undefined,
                            rate: Math.round((speed - 1) * 100)
                        })
                    });

                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.error || 'Lỗi tạo audio');
                    }

                    const data = await res.json();

                    // Poll
                    const finishedJobId = await pollJobStatus(data.jobId);

                    // Download
                    setStatusMessage('Downloading file...');
                    const downloadRes = await fetch(`/api/tools/tts/download-result?jobId=${finishedJobId}`);
                    if (!downloadRes.ok) throw new Error('Download failed');
                    const blob = await downloadRes.blob();
                    setAudioUrl(URL.createObjectURL(blob));
                }
            }
        } catch (err: any) {
            setError(err.message);
            setStatusMessage('Failed');
        } finally {
            setIsLoading(false);
            if (!error) setStatusMessage('Done');
        }
    };

    // Handle File Generate (TXT, SRT, DOC, DOCX)
    const handleSRTGenerate = async () => {
        if (!srtFile) return setError('Vui lòng chọn file!');
        setIsLoading(true);
        setError('');
        setAudioUrl(null);
        setProgress(0);
        setStatusMessage('Uploading & Processing...');

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
                throw new Error(errData.error || 'Lỗi xử lý file');
            }

            // Check content type to see if it returned direct audio (VN) or JSON (Async Job)
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                // Async Job
                const data = await res.json();
                const finishedJobId = await pollJobStatus(data.jobId);

                setStatusMessage('Downloading file...');
                const downloadRes = await fetch(`/api/tools/tts/download-result?jobId=${finishedJobId}`);
                if (!downloadRes.ok) throw new Error('Download failed');
                const blob = await downloadRes.blob();
                setAudioUrl(URL.createObjectURL(blob));

            } else {
                // Direct Audio (VN)
                const blob = await res.blob();
                setAudioUrl(URL.createObjectURL(blob));
                setProgress(100);
            }

        } catch (err: any) {
            setError(err.message);
            setStatusMessage('Failed');
        } finally {
            setIsLoading(false);
            if (!error) setStatusMessage('Done');
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
            {/* Header - Purple/Rose gradient */}
            <div className="h-16 bg-gradient-to-r from-indigo-900 via-purple-900 to-rose-900 flex items-center justify-between px-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white font-bold backdrop-blur-sm"
                    >
                        ←
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-wide">🎙️ AUDIO CREATOR STUDIO</h1>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/20 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'text'
                            ? 'bg-white text-purple-700 shadow-lg'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        📝 Văn Bản
                    </button>
                    <button
                        onClick={() => setActiveTab('file')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition ${activeTab === 'file'
                            ? 'bg-white text-purple-700 shadow-lg'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                <div className="w-64 bg-slate-50 border-r border-gray-200 p-6 overflow-y-auto">
                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-rose-600 mb-4">📖 Hướng Dẫn</h3>
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="p-3 bg-white rounded-lg border border-purple-100 shadow-sm">
                            <span className="font-bold text-purple-600">Bước 1:</span>
                            <p>{activeTab === 'text' ? 'Nhập nội dung' : 'Upload file'}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-purple-100 shadow-sm">
                            <span className="font-bold text-purple-600">Bước 2:</span>
                            <p>Chọn giọng đọc (Bấm nút bên phải)</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-purple-100 shadow-sm">
                            <span className="font-bold text-purple-600">Bước 3:</span>
                            <p>Nhấn "Tạo Audio"</p>
                        </div>
                    </div>
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
                                <button onClick={() => importInputRef.current?.click()} className="text-sm flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg transition font-medium">
                                    📥 Import file (.txt)
                                </button>
                            </div>
                            <textarea
                                value={scriptText}
                                onChange={(e) => setScriptText(e.target.value)}
                                placeholder="Nhập văn bản cần chuyển thành giọng nói..."
                                className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 resize-none outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition text-gray-800 text-lg shadow-inner"
                            />
                            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                <span>{scriptText.length} ký tự</span>
                                {dialogueMode && <span className="text-purple-600 font-bold">● Chế độ hội thoại đang bật</span>}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
                            <input type="file" ref={srtInputRef} accept=".srt,.txt" className="hidden" onChange={(e) => setSrtFile(e.target.files?.[0] || null)} />
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
                            : 'bg-gradient-to-r from-purple-600 to-rose-600 hover:shadow-purple-500/40 hover:scale-[1.01]'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {statusMessage || 'Đang xử lý...'}
                                </span>
                                {progress > 0 && (
                                    <div className="w-full max-w-[200px] bg-white/30 rounded-full h-1.5 mt-1">
                                        <div
                                            className="bg-white h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
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
                                className={`w-14 h-7 rounded-full transition ${dialogueMode ? 'bg-gradient-to-r from-purple-500 to-rose-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${dialogueMode ? 'translate-x-8' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Voice Selection Trigger */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">🎙️ Giọng đọc {dialogueMode && '[A]'}</label>
                        <button
                            onClick={() => { setGalleryTarget('voice1'); setShowVoiceGallery(true); }}
                            className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-purple-400 bg-white flex justify-between items-center transition group"
                        >
                            <span className="font-medium text-gray-800 truncate group-hover:text-purple-700 transition">{getVoiceName(voice1)}</span>
                            <span className="text-gray-400">▼</span>
                        </button>
                    </div>

                    {dialogueMode && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">🎙️ Giọng đọc [B]</label>
                            <button
                                onClick={() => { setGalleryTarget('voice2'); setShowVoiceGallery(true); }}
                                className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-purple-400 bg-white flex justify-between items-center transition group"
                            >
                                <span className="font-medium text-gray-800 truncate group-hover:text-purple-700 transition">{getVoiceName(voice2)}</span>
                                <span className="text-gray-400">▼</span>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setShowCloneModal(true)}
                        className="mt-2 w-full py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition text-sm font-medium"
                    >
                        + Clone Giọng Mới
                    </button>

                    {/* Speed Slider */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-gray-700">⚡ Tốc độ</label>
                            <span className="text-sm text-purple-600 font-bold">{speed.toFixed(2)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full accent-purple-600"
                        />
                    </div>

                    {/* Result */}
                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-rose-600 mb-3">🎵 KẾT QUẢ</h4>
                        {audioUrl ? (
                            <div className="bg-gray-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                                <audio controls src={audioUrl} className="w-full mb-3" autoPlay />
                                <a
                                    href={audioUrl}
                                    download={`audio_${Date.now()}.wav`}
                                    className="block w-full text-center py-3 bg-gradient-to-r from-purple-600 to-rose-600 text-white rounded-lg font-bold hover:shadow-lg transition"
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

            {/* Voice Gallery Modal */}
            <VoiceGalleryModal
                isOpen={showVoiceGallery}
                onClose={() => setShowVoiceGallery(false)}
                onSelect={(id) => {
                    if (galleryTarget === 'voice1') setVoice1(id);
                    else setVoice2(id);
                    setShowVoiceGallery(false); // Close after selection
                }}
                currentVoiceId={galleryTarget === 'voice1' ? voice1 : voice2}
                presetVoices={combinedPresetVoices}
                customVoices={combinedCustomVoices}
                onDeleteCustomVoice={handleDeleteVoice}
            />

            {/* Clone Modal */}
            {showCloneModal && (
                <div className="fixed inset-0 z-[101] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">🎙️ Clone Giọng Mới</h3>
                        <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-200">
                            <p>💡 <b>Mẹo:</b> Nên dùng file <b>.WAV</b> (mono, 22050Hz) để có chất lượng tốt nhất.</p>
                            <p className="mt-1">Giọng sẽ được lưu trong hệ thống <b>30 ngày</b>.</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Upload file âm thanh (WAV/MP3) giọng mẫu của bạn (~10s).</p>

                        <input className="w-full border-2 border-gray-200 rounded-lg p-3 mb-4 focus:border-red-400 outline-none" placeholder="Tên giọng (VD: Giọng Anh Tùng)" value={cloneName} onChange={e => setCloneName(e.target.value)} />
                        <input type="file" accept=".wav,.mp3" onChange={e => e.target.files && setCloneFile(e.target.files[0])} className="mb-4 text-sm text-gray-600 w-full" />
                        {cloneFile && (
                            <p className="text-sm text-green-600 mb-4">✓ {cloneFile.name}</p>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setShowCloneModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Hủy</button>
                            <button onClick={handleCloneVoice} disabled={isUploading || !cloneFile || !cloneName} className="flex-1 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:bg-gray-300">{isUploading ? 'Đang upload...' : 'Clone Giọng'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextToSpeechTool;
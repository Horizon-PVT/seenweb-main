import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { ArrowRight, Loader2, Edit3, Download, Check, Video as VideoIcon, Upload, Mic, Volume2 } from 'lucide-react';

interface DubbingToolProps {
    onBack?: () => void;
}

// Available Vietnamese voices - Edge TTS (free) + FPT.AI (premium/VIP)
const EDGE_VOICES = [
    { id: 'vi-VN-HoaiMyNeural', name: '👩 Nữ - Hoài My', shortName: 'Nữ', gender: 'female', color: '#ec4899', isPremium: false },
    { id: 'vi-VN-NamMinhNeural', name: '👨 Nam - Nam Minh', shortName: 'Nam', gender: 'male', color: '#3b82f6', isPremium: false },
];

const FPT_VOICES = [
    { id: 'banmai', name: '👩 Ban Mai (Bắc)', shortName: 'Ban Mai', gender: 'female', color: '#f59e0b', isPremium: true },
    { id: 'thuminh', name: '👩 Thu Minh (Bắc)', shortName: 'Thu Minh', gender: 'female', color: '#f59e0b', isPremium: true },
    { id: 'leminh', name: '👩 Lệ Minh (Trung)', shortName: 'Lệ Minh', gender: 'female', color: '#f59e0b', isPremium: true },
    { id: 'myan', name: '👩 Mỹ An (Nam)', shortName: 'Mỹ An', gender: 'female', color: '#f59e0b', isPremium: true },
    { id: 'minhquang', name: '👨 Minh Quang (Bắc)', shortName: 'Minh Quang', gender: 'male', color: '#8b5cf6', isPremium: true },
    { id: 'linhsan', name: '👨 Linh San (Nam)', shortName: 'Linh San', gender: 'male', color: '#8b5cf6', isPremium: true },
];

const ALL_VOICES = [...EDGE_VOICES, ...FPT_VOICES];

export default function DubbingTool({ onBack }: DubbingToolProps) {
    const { data: session } = useSession();
    const { t } = useTranslation('common');
    const router = useRouter();
    const isEN = router.locale === 'en';

    const [step, setStep] = useState(1); // 1: Input, 2: Edit, 3: Result
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Removed: inputMode state - now only supporting file upload

    // Data
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [projectId, setProjectId] = useState('');
    const [segments, setSegments] = useState<any[]>([]);
    const [dubbedAudioUrl, setDubbedAudioUrl] = useState('');
    const [finalVideoUrl, setFinalVideoUrl] = useState('');

    // Voice settings
    const [selectedVoice, setSelectedVoice] = useState(EDGE_VOICES[0].id);
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            addLog(`📁 Đã chọn file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        }
    };

    // NOTE: URL transcribe mode removed - only file upload is supported

    // STEP 1: Process Video (Upload mode) - CHUNKED
    const handleUploadFile = async () => {
        if (!videoFile) {
            alert('Vui lòng chọn file video!');
            return;
        }
        setLoading(true);
        setLogs(['⏳ Đang chuẩn bị upload...']);
        setUploadProgress(0);

        try {
            // 1. Chunked Upload
            const chunkSize = 1024 * 1024; // 1MB chunks
            const totalChunks = Math.ceil(videoFile.size / chunkSize);
            const uploadId = crypto.randomUUID();

            addLog(`📤 Bắt đầu upload ${totalChunks} chunks...`);

            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const end = Math.min(videoFile.size, start + chunkSize);
                const chunk = videoFile.slice(start, end);

                const formData = new FormData();
                formData.append('chunk', chunk);
                formData.append('chunkIndex', i.toString());
                formData.append('uploadId', uploadId);

                // Use fetch for chunks, we can track progress manually by chunk count
                const res = await fetch('/api/dubbing/chunk-upload', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    throw new Error(`Upload chunk ${i + 1} failed`);
                }

                const percent = Math.round(((i + 1) / totalChunks) * 100);
                setUploadProgress(percent);
            }

            addLog('✅ Upload hoàn tất! Đang xử lý video...');
            setUploadProgress(100);

            // 2. Process
            const res = await fetch('/api/dubbing/process-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uploadId,
                    originalName: videoFile.name
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Processing failed');
            }

            addLog('🎙️ Đang trích xuất và dịch thuật...');

            setProjectId(data.projectId);
            setVideoUrl(data.videoUrl); // Local video path
            setSegments(data.segments || []);
            addLog('✅ Đã dịch xong! Chuyển sang trình chỉnh sửa...');
            setTimeout(() => setStep(2), 1000);

        } catch (e: any) {
            console.error('[DubbingTool] Upload Error:', e);
            addLog(`❌ LỖI: ${e.message}`);
            alert(`Lỗi: ${e.message}`);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    // STEP 2: Synthesize & Merge
    const handleSynthesize = async () => {
        setLoading(true);
        setLogs([]);
        addLog(`🎙️ Đang tạo giọng đọc: ${ALL_VOICES.find(v => v.id === selectedVoice)?.name}...`);
        addLog(`⚡ Tốc độ: ${voiceSpeed}x`);

        try {
            // 1. Synthesize with selected voice and speed
            const resSync = await fetch('/api/dubbing/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    segments,
                    voice: selectedVoice,
                    speed: voiceSpeed
                })
            });
            const dataSync = await resSync.json();
            if (!resSync.ok) throw new Error(dataSync.error);

            setDubbedAudioUrl(dataSync.audioUrl);
            addLog(`✅ Đã tạo audio thành công!`);
            addLog('🎬 Đang ghép vào video gốc...');

            // 2. Merge
            const resMerge = await fetch('/api/dubbing/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl, dubbedAudioUrl: dataSync.audioUrl })
            });
            const dataMerge = await resMerge.json();
            if (!resMerge.ok) throw new Error(dataMerge.error);

            setFinalVideoUrl(dataMerge.videoUrl);
            addLog('🎉 Hoàn tất!');
            setTimeout(() => setStep(3), 1000);

        } catch (e: any) {
            addLog(`❌ LỖI: ${e.message}`);
            alert(`Lỗi: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const updateSegment = (index: number, newText: string) => {
        const newSegs = [...segments];
        newSegs[index].translated = newText;
        setSegments(newSegs);
    };

    const updateSegmentVoice = (index: number, voiceId: string) => {
        const newSegs = [...segments];
        newSegs[index].voice = voiceId;
        setSegments(newSegs);
    };

    // Apply default voice to all segments that don't have one
    const applyDefaultVoice = (voiceId: string) => {
        setSelectedVoice(voiceId);
        const newSegs = segments.map(seg => ({
            ...seg,
            voice: seg.voice || voiceId
        }));
        setSegments(newSegs);
    };

    // NOTE: handleProcess removed - now calling handleUploadFile directly

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[#CDAD5A]">🎙️ AI Dubbing Studio</h1>
                        <p className="text-gray-400 mt-1">{isEN ? 'Auto translate and dub videos' : 'Tự động dịch thuật và lồng tiếng Video'}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-[#CDAD5A] text-black' : 'bg-gray-700'}`}>1. Upload</div>
                        <div className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-[#CDAD5A] text-black' : 'bg-gray-700'}`}>2. Edit</div>
                        <div className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-[#CDAD5A] text-black' : 'bg-gray-700'}`}>3. Export</div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* STEP 1: INPUT - ONLY FILE UPLOAD */}
                {step === 1 && (
                    <div className="bg-black/50 border border-gray-800 rounded-2xl p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-white mb-2">📤 {isEN ? 'Upload Video' : 'Tải Video Lên'}</h2>
                            <p className="text-gray-400 text-sm">{isEN ? 'Supported: MP4, MOV, AVI... (max 500MB)' : 'Hỗ trợ: MP4, MOV, AVI... (tối đa 500MB)'}</p>
                        </div>

                        {/* Upload Area */}
                        <div className="space-y-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center cursor-pointer hover:border-[#CDAD5A] transition group"
                            >
                                {videoFile ? (
                                    <div>
                                        <VideoIcon className="w-12 h-12 mx-auto mb-3 text-[#CDAD5A]" />
                                        <p className="text-white font-bold">{videoFile.name}</p>
                                        <p className="text-gray-400 text-sm">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <p className="text-gray-500 text-xs mt-2">Click để chọn file khác</p>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500 group-hover:text-[#CDAD5A] transition" />
                                        <p className="text-gray-400">Kéo thả video vào đây hoặc <span className="text-[#CDAD5A]">click để chọn file</span></p>
                                        <p className="text-gray-600 text-sm mt-2">Hỗ trợ: MP4, MOV, AVI...</p>
                                    </div>
                                )}
                            </div>

                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                    <div
                                        className="bg-[#CDAD5A] h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleUploadFile}
                                disabled={loading || !videoFile}
                                className="w-full bg-[#CDAD5A] hover:bg-[#b09348] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                Xử lý Video
                            </button>
                        </div>

                        {/* Log Display */}
                        {logs.length > 0 && (
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mt-6">
                                <h3 className="text-sm font-bold text-gray-400 mb-2">📋 Log xử lý:</h3>
                                <div className="font-mono text-sm text-green-400 space-y-1">
                                    {logs.map((L, i) => <div key={i}>&gt; {L}</div>)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: EDITOR */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center">
                                <Edit3 className="mr-2 text-[#CDAD5A]" /> Chỉnh Sửa Kịch Bản
                            </h2>
                        </div>

                        {/* Voice Settings Panel */}
                        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Mic className="w-5 h-5 text-purple-400" />
                                Cài Đặt Giọng Đọc
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Voice Selection */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Chọn giọng đọc:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Free voices */}
                                        {EDGE_VOICES.map((voice) => (
                                            <button
                                                key={voice.id}
                                                onClick={() => setSelectedVoice(voice.id)}
                                                className={`py-2 px-3 rounded-lg text-sm font-bold transition ${selectedVoice === voice.id
                                                    ? 'bg-[#CDAD5A] text-black'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    }`}
                                            >
                                                {voice.shortName}
                                            </button>
                                        ))}
                                        {/* Premium voices - only for VIP */}
                                        {['PRO', 'ADMIN'].includes((session?.user as any)?.role) ? (
                                            FPT_VOICES.map((voice) => (
                                                <button
                                                    key={voice.id}
                                                    onClick={() => setSelectedVoice(voice.id)}
                                                    className={`py-2 px-3 rounded-lg text-sm font-bold transition border-2 ${selectedVoice === voice.id
                                                        ? 'bg-amber-500 text-black border-amber-400'
                                                        : 'bg-gray-800 text-amber-400 border-amber-600 hover:bg-gray-700'
                                                        }`}
                                                >
                                                    👑 {voice.shortName}
                                                </button>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-500 py-2 px-3 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                                                🔒 Giọng Premium (VIP only)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Speed Slider */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Tốc độ đọc: <span className="text-[#CDAD5A] font-bold">{voiceSpeed.toFixed(1)}x</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">0.5x</span>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2.0"
                                            step="0.1"
                                            value={voiceSpeed}
                                            onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#CDAD5A]"
                                        />
                                        <span className="text-xs text-gray-500">2.0x</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Segments Editor */}
                        <div className="bg-black/50 border border-gray-800 rounded-2xl p-6 max-h-[400px] overflow-y-auto">
                            {segments.length === 0 ? (
                                <p className="text-gray-500 text-center py-10">Không có segment nào.</p>
                            ) : (
                                <div className="space-y-4">
                                    {segments.map((seg, idx) => {
                                        const segVoice = ALL_VOICES.find(v => v.id === (seg.voice || selectedVoice));
                                        return (
                                            <div key={idx} className="flex gap-3 group border-b border-gray-800 pb-4">
                                                <div className="w-16 text-xs font-mono text-gray-600 pt-3 text-right shrink-0">
                                                    {new Date(seg.start * 1000).toISOString().substr(14, 5)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-xs text-gray-500 flex-1 truncate">{seg.original}</p>
                                                        {/* Per-segment voice selector */}
                                                        <select
                                                            value={seg.voice || selectedVoice}
                                                            onChange={(e) => updateSegmentVoice(idx, e.target.value)}
                                                            className="text-xs px-2 py-1 rounded border border-gray-700 bg-gray-900 text-white focus:border-[#CDAD5A] focus:outline-none"
                                                            style={{ borderColor: segVoice?.color }}
                                                        >
                                                            <optgroup label="Free">
                                                                {EDGE_VOICES.map(v => (
                                                                    <option key={v.id} value={v.id}>{v.shortName}</option>
                                                                ))}
                                                            </optgroup>
                                                            {['PRO', 'ADMIN'].includes((session?.user as any)?.role) && (
                                                                <optgroup label="👑 Premium">
                                                                    {FPT_VOICES.map(v => (
                                                                        <option key={v.id} value={v.id}>👑 {v.shortName}</option>
                                                                    ))}
                                                                </optgroup>
                                                            )}
                                                        </select>
                                                    </div>
                                                    <textarea
                                                        value={seg.translated}
                                                        onChange={(e) => updateSegment(idx, e.target.value)}
                                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-[#CDAD5A] focus:outline-none transition resize-none"
                                                        style={{ borderLeftColor: segVoice?.color, borderLeftWidth: '3px' }}
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleSynthesize}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#CDAD5A] to-orange-500 text-black py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Mic className="w-5 h-5" />}
                            🎬 Tạo Video Lồng Tiếng
                        </button>

                        {logs.length > 0 && (
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                                <div className="font-mono text-sm text-green-400 space-y-1">
                                    {logs.map((L, i) => <div key={i}>&gt; {L}</div>)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: RESULT */}
                {step === 3 && (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="text-white w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Video Đã Sẵn Sàng! 🎉</h2>
                        <p className="text-gray-400 mb-8">Hệ thống đã lồng tiếng và render hoàn tất.</p>

                        <div className="bg-black rounded-2xl p-4 max-w-2xl mx-auto mb-8">
                            <video
                                src={finalVideoUrl}
                                controls
                                className="w-full rounded-xl"
                                autoPlay
                            />
                        </div>

                        <div className="flex justify-center gap-4">
                            <a
                                href={finalVideoUrl}
                                download
                                className="bg-[#CDAD5A] hover:bg-[#b09348] text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition"
                            >
                                <Download className="w-5 h-5" /> Tải Video Về Máy
                            </a>
                            <button
                                onClick={() => { setStep(1); setVideoUrl(''); setVideoFile(null); setLogs([]); }}
                                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-xl transition"
                            >
                                Làm Video Khác
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

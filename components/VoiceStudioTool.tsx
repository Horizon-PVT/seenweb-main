import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

interface Voice {
    id: string;
    name: string;
    gender: string;
    accent: string;
    description: string;
}

const VoiceStudioTool = () => {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'tts' | 'clone'>('tts');
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('alba');
    const [voices, setVoices] = useState<Voice[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Clone states
    const [cloneName, setCloneName] = useState('');
    const [cloneFile, setCloneFile] = useState<File | null>(null);
    const [cloning, setCloning] = useState(false);
    const [clonedVoices, setClonedVoices] = useState<{ id: string, name: string }[]>([]); // Temp in-memory

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch voices
    useEffect(() => {
        fetch('/api/tools/tts/voices')
            .then(res => res.json())
            .then(data => {
                if (data.voices) setVoices(data.voices);
            })
            .catch(err => console.error(err));
    }, []);

    const handleGenerate = async () => {
        if (!text) return alert('Vui lòng nhập nội dung!');

        setGenerating(true);
        setAudioUrl(null);

        try {
            const formData = new FormData();
            formData.append('text', text);

            // Check if selected voice is custom
            const isCustom = selectedVoice.startsWith('custom_');
            if (isCustom) {
                formData.append('voice', 'custom');
                formData.append('customVoiceId', selectedVoice);
            } else {
                formData.append('voice', selectedVoice);
            }

            const res = await fetch('/api/tools/tts/generate', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to generate');
            }

            // Create blob URL
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleClone = async () => {
        if (!cloneFile) return alert('Vui lòng chọn file audio mẫu!');
        if (!cloneName) return alert('Vui lòng đặt tên cho giọng!');

        setCloning(true);
        try {
            const formData = new FormData();
            formData.append('audio', cloneFile);
            formData.append('name', cloneName);

            const res = await fetch('/api/tools/tts/clone', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.upgrade) {
                    if (confirm(data.error + '\nBạn có muốn nâng cấp ngay không?')) {
                        // Redirect to pricing or open modal
                        window.location.href = '/pricing';
                    }
                    return;
                }
                throw new Error(data.error || 'Clone failed');
            }

            // Success
            alert('Clone giọng thành công! Bạn có thể sử dụng ngay.');
            setClonedVoices(prev => [...prev, { id: data.voiceId, name: data.name }]);
            setSelectedVoice(data.voiceId);
            setActiveTab('tts');
            setCloneFile(null);
            setCloneName('');

        } catch (error: any) {
            alert(error.message);
        } finally {
            setCloning(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full flex flex-col">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">AI Voice Studio</h2>
                        <p className="text-white/80 text-sm">Chuyển văn bản thành giọng nói & Clone giọng AI</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-6 p-1 bg-white/10 rounded-lg backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('tts')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'tts'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-white hover:bg-white/10'
                            }`}
                    >
                        Text to Speech
                    </button>
                    <button
                        onClick={() => setActiveTab('clone')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'clone'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-white hover:bg-white/10'
                            }`}
                    >
                        Voice Cloning <span className="ml-1 text-[10px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full">PRO</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'tts' ? (
                        <motion.div
                            key="tts"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Voice Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn giọng đọc</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Preset Voices */}
                                    {voices.map(voice => (
                                        <button
                                            key={voice.id}
                                            onClick={() => setSelectedVoice(voice.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedVoice === voice.id
                                                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-semibold text-gray-900">{voice.name}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${voice.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                                    }`}>
                                                    {voice.gender === 'male' ? 'Nam' : 'Nữ'}
                                                </span>
                                                <span>{voice.description}</span>
                                            </div>
                                        </button>
                                    ))}

                                    {/* Cloned Voices */}
                                    {clonedVoices.map(voice => (
                                        <button
                                            key={voice.id}
                                            onClick={() => setSelectedVoice(voice.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedVoice === voice.id
                                                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-semibold text-indigo-700 flex items-center gap-2">
                                                {voice.name}
                                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">CLONE</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Giọng AI của bạn
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung cần đọc (Tối đa 500 ký tự với FREE)
                                </label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Nhập văn bản tiếng Anh hoặc tiếng Việt (để test voice clone)..."
                                    className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none text-gray-700"
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {text.length} ký tự
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !text}
                                className={`w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${generating || !text
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30'
                                    }`}
                            >
                                {generating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Đang tạo audio...
                                    </span>
                                ) : '🔊 Tạo Giọng Đọc AI'}
                            </button>

                            {/* Result */}
                            {audioUrl && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl animate-fade-in">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-green-800">✅ Đã tạo thành công!</h3>
                                        <a
                                            href={audioUrl}
                                            download="seenyt_voice.wav"
                                            className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full hover:bg-green-300 transition-colors"
                                        >
                                            Tải xuống
                                        </a>
                                    </div>
                                    <audio controls src={audioUrl} className="w-full" autoPlay />
                                </div>
                            )}

                        </motion.div>
                    ) : (
                        <motion.div
                            key="clone"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                                <h3 className="text-yellow-800 font-semibold mb-1 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Tính năng PRO
                                </h3>
                                <p className="text-sm text-yellow-700">
                                    Tạo bản sao giọng nói của chính bạn chỉ với 5 giây âm thanh mẫu.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tên giọng</label>
                                <input
                                    type="text"
                                    value={cloneName}
                                    onChange={(e) => setCloneName(e.target.value)}
                                    placeholder="Ví dụ: Giọng Thuyết Minh Chính..."
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File âm thanh mẫu (WAV, MP3)</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${cloneFile
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={(e) => setCloneFile(e.target.files?.[0] || null)}
                                    />

                                    {cloneFile ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-gray-900">{cloneFile.name}</span>
                                            <span className="text-xs text-gray-500 mt-1">{(cloneFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span className="font-medium">Click để tải lên file ghi âm</span>
                                            <span className="text-xs mt-1">Khuyên dùng: 5-10 giây, giọng nói rõ ràng, không tiếng ồn</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleClone}
                                disabled={cloning || !cloneFile || !cloneName}
                                className={`w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${cloning || !cloneFile || !cloneName
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:shadow-pink-500/30'
                                    }`}
                            >
                                {cloning ? 'Đang phân tích giọng...' : '🚀 Bắt đầu Clone Giọng'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VoiceStudioTool;

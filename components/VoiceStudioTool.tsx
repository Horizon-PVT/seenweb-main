import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import VoiceSelector from './voice/VoiceSelector';
import AudioVisualizer from './voice/AudioVisualizer';

interface Voice {
    id: string;
    name: string;
    gender: string;
    accent: string;
    description: string;
}

// Vietnamese preset voices (Edge TTS)
const VN_PRESET_VOICES: Voice[] = [
    { id: 'vi-VN-HoaiMyNeural', name: 'Hoai My', gender: 'female', accent: 'VN', description: 'Natural Vietnamese female voice' },
    { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh', gender: 'male', accent: 'VN', description: 'Warm Vietnamese male voice' },
];

const VoiceStudioTool = () => {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'tts' | 'clone'>('tts');
    const [language, setLanguage] = useState<'en' | 'vi'>('en');
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('alba');
    const [voices, setVoices] = useState<Voice[]>([]);

    // Persistence Logic
    useEffect(() => {
        const saved = localStorage.getItem('seenyt_voice_text');
        if (saved) setText(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem('seenyt_voice_text', text);
    }, [text]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false); // Visualization state

    // Polling states
    const [jobMessage, setJobMessage] = useState('Processing...');
    const [jobProgress, setJobProgress] = useState(0);

    // Clone states
    const [cloneName, setCloneName] = useState('');
    const [cloneFile, setCloneFile] = useState<File | null>(null);
    const [cloning, setCloning] = useState(false);
    const [clonedVoices, setClonedVoices] = useState<{ id: string, name: string }[]>([]);

    const [showUpgrade, setShowUpgrade] = useState(false); // NEW STATE

    const fileInputRef = useRef<HTMLInputElement>(null);
    const srtInputRef = useRef<HTMLInputElement>(null);
    const [srtFile, setSrtFile] = useState<File | null>(null);
    const [generatingSrt, setGeneratingSrt] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    const pollJobStatus = async (jobId: string) => {
        return new Promise<string>((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/tools/tts/status?jobId=${jobId}`);
                    if (!res.ok) {
                        if (res.status === 404) return; // Keep waiting
                        throw new Error('Polling failed');
                    }
                    const data = await res.json();
                    
                    setJobMessage(data.message || 'Processing...');
                    if (data.progress) setJobProgress(data.progress);

                    if (data.status === 'completed') {
                        clearInterval(interval);
                        // Using direct cloudflare URL to bypass NextJS 4.5MB serverless limits
                        resolve(data.resultUrl || `/api/tools/tts/download?jobId=${jobId}`);
                    } else if (data.status === 'failed') {
                        clearInterval(interval);
                        reject(new Error(data.error || 'Job failed on server'));
                    }
                } catch (err) {
                    clearInterval(interval);
                    reject(err);
                }
            }, 2000);
        });
    };

    // Fetch voices
    useEffect(() => {
        fetch('/api/tools/tts/voices')
            .then(res => res.json())
            .then(data => {
                if (data.voices) setVoices(data.voices);
            })
            .catch(err => console.error(err));
    }, []);

    // Handle Audio Playback events for visualizer
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
        };
    }, [audioUrl]);

    const handleGenerate = async () => {
        // --- FREEMIUM GATE CHECK ---
        const userRole = ((session?.user as any)?.role || "FREE");
        const allowed = ['PRO', 'ADMIN'].includes(userRole);
        if (!allowed) {
            setShowUpgrade(true);
            return;
        }
        // ---------------------------

        if (!text) return alert('Vui lòng nhập nội dung!');

        setGenerating(true);
        setAudioUrl(null);
        setIsPlaying(true); // Fake visualization during generation
        setJobMessage('Initializing...');
        setJobProgress(0);

        try {
            const isCustom = selectedVoice.startsWith('custom_') || selectedVoice.startsWith('vn_clone_');

            const res = await fetch('/api/tools/tts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voice: selectedVoice,
                    language,
                    isVN: language === 'vi',
                    customVoiceId: isCustom ? selectedVoice : undefined
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to generate');
            }

            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await res.json();
                if (data.jobId) {
                    const downloadUrl = await pollJobStatus(data.jobId);
                    // Pass the Direct Cloudflare Tunnel URL directly to <audio> tag
                    setAudioUrl(downloadUrl);
                } else {
                    throw new Error("Invalid async response");
                }
            } else {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            }

            // Auto play is handled by <audio autoPlay> but we reset visualizer
            setIsPlaying(false);

        } catch (error: any) {
            alert(error.message);
            setIsPlaying(false);
        } finally {
            setGenerating(false);
        }
    };

    const handleSRTGenerate = async () => {
        // --- FREEMIUM GATE CHECK ---
        const userRole = ((session?.user as any)?.role || "FREE");
        const allowed = ['PRO', 'ADMIN'].includes(userRole);
        if (!allowed) {
            setShowUpgrade(true);
            return;
        }
        // ---------------------------

        if (!srtFile) return alert('Vui lòng chọn file SRT!');

        setGenerating(true);
        setGeneratingSrt(true);
        setAudioUrl(null);
        setIsPlaying(true); // Fake visualization during generation
        setJobMessage('Uploading SRT...');
        setJobProgress(0);

        try {
            const formData = new FormData();
            formData.append('srtFile', srtFile);
            formData.append('voice', selectedVoice);

            const isCustom = selectedVoice.startsWith('custom_') || selectedVoice.startsWith('vn_clone_');
            if (isCustom) {
                formData.append('customVoiceId', selectedVoice);
            }

            const res = await fetch('/api/tools/tts/generate-srt', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to generate from SRT');
            }

            const data = await res.json();
            if (data.jobId) {
                const downloadUrl = await pollJobStatus(data.jobId);
                // Assign direct tunnel link to prevent Next.js 4.5MB crash
                setAudioUrl(downloadUrl);
            } else {
                 throw new Error("Invalid async response");
            }

            setIsPlaying(false);

        } catch (error: any) {
            alert(error.message);
            setIsPlaying(false);
        } finally {
            setGenerating(false);
            setGeneratingSrt(false);
        }
    };

    const handleClone = async () => {
        // --- FREEMIUM GATE CHECK ---
        const userRole = ((session?.user as any)?.role || "FREE");
        const allowed = ['PRO', 'ADMIN'].includes(userRole);
        if (!allowed) {
            setShowUpgrade(true);
            return;
        }
        // ---------------------------

        if (!cloneFile) return alert('Vui lòng chọn file audio mẫu!');
        if (!cloneName) return alert('Vui lòng đặt tên cho giọng!');

        // Ensure format is WAV (MP3 will fail with RIFF error on Python server)
        if (!cloneFile.name.toLowerCase().endsWith('.wav')) {
             return alert('Hệ thống hiện tại chỉ học chuẩn xác nhất qua định dạng .WAV! Vui lòng chuyển định dạng file nhạc của bạn sang WAV nhé.');
        }

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
                if (data.upgrade && confirm(data.error + '\nNâng cấp ngay?')) {
                    window.location.href = '/pricing';
                }
                throw new Error(data.error || 'Clone failed');
            }

            alert('Clone thành công!');
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
        <div className="flex flex-col h-full bg-[#0a0a0a] text-gray-200 rounded-3xl overflow-hidden border border-white/10 shadow-2xl font-sans">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#111] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Voice <span className="text-emerald-500">Studio</span></h2>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Produce Video workflow
                        </div>
                    </div>
                </div>

                {/* Language Toggle */}
                <div className="flex p-1 bg-black/40 rounded-full border border-white/10">
                    <button
                        onClick={() => { setLanguage('en'); setSelectedVoice('alba'); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => { setLanguage('vi'); setSelectedVoice('vi-VN-HoaiMyNeural'); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'vi' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Vietnamese
                    </button>
                </div>

                {/* Tabs Pills */}
                <div className="flex p-1 bg-black/40 rounded-full border border-white/10 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('tts')}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === 'tts' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Voiceover
                    </button>
                    <button
                        onClick={() => setActiveTab('clone')}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === 'clone' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Voice clone
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT PANEL: INPUT & CONTROLS */}
                <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col border-r border-white/5 bg-[#0f0f0f]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'tts' ? (
                            <motion.div
                                key="tts"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col h-full"
                            >
                                {/* Text Editor Area */}
                                <div className="flex-1 flex flex-col relative">
                                    <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#0f0f0f] to-transparent z-10 pointer-events-none"></div>
                                    
                                    {/* Top SRT Toolbar */}
                                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0f0f0f] relative z-20">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Script Editor
                                        </span>
                                        <div className="flex items-center gap-3">
                                            {srtFile ? (
                                                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl shadow-inner cursor-pointer" onClick={() => setSrtFile(null)} title="Remove file">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    </span>
                                                    <span className="text-xs font-bold text-emerald-400">{srtFile.name}</span>
                                                    <span className="text-red-400 font-bold ml-2">x</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => srtInputRef.current?.click()}
                                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white transition-all font-bold text-[11px] flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                    Upload SRT
                                                </button>
                                            )}
                                            <input ref={srtInputRef} type="file" accept=".srt" className="hidden" onChange={(e) => setSrtFile(e.target.files?.[0] || null)} />
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 relative">
                                        <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Paste the script for this video step here.\nSupports English and Vietnamese voiceover."
                                        className="w-full h-full bg-transparent text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-700 selection:bg-emerald-500/30"
                                        spellCheck={false}
                                    />
                                    {/* Line Numbers Fake (Visual only) */}
                                    <div className="absolute top-6 right-6 text-xs font-mono text-gray-600 bg-black/20 px-2 py-1 rounded">
                                        {text.length} chars
                                    </div>
                                </div>
                                </div>

                                {/* Bottom Controls Bar */}
                                <div className="p-4 bg-[#111] border-t border-white/5 flex items-center justify-between">
                                    {generating ? (
                                        <div className="flex-1 mr-6">
                                            <div className="flex justify-between text-[11px] text-gray-400 font-mono mb-2 uppercase tracking-wide">
                                                <span>{jobMessage}</span>
                                                <span>{jobProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden border border-white/5 relative">
                                                <div 
                                                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                                                    style={{ width: `${jobProgress}%` }}
                                                ></div>
                                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse mix-blend-overlay"></div>
                                            </div>
                                        </div>
                                    ) : <div></div>}
                                    
                                    <button
                                        onClick={srtFile ? handleSRTGenerate : handleGenerate}
                                        disabled={generating || (!text && !srtFile)}
                                        className={`px-8 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center gap-2 ${generating ? 'bg-gray-700 cursor-wait' : srtFile ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:shadow-amber-500/20 text-white hover:scale-105' : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-emerald-500/20 text-white hover:scale-105'}`}
                                    >
                                        {generating ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                                {srtFile ? 'ĐANG ĐỌC SRT...' : 'PROCESSING'}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                {srtFile ? '🎬 ĐỌC SRT → AUDIO' : 'GENERATE AUDIO'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="clone"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="p-8 flex flex-col items-center justify-center h-full text-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 animate-pulse-slow">
                                    <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Voice Cloning Lab</h3>
                                <p className="text-gray-400 max-w-md mb-8">Upload a 10s sample to replicate any voice using our advanced AI engine.</p>

                                <div className="w-full max-w-md space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Voice Name (e.g. Iron Man)"
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                                        value={cloneName}
                                        onChange={e => setCloneName(e.target.value)}
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/10 rounded-xl p-8 cursor-pointer hover:bg-white/5 transition-colors"
                                    >
                                        <p className="text-sm text-gray-400">{cloneFile ? cloneFile.name : '+ Upload Reference Audio'}</p>
                                        <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={e => setCloneFile(e.target.files?.[0] || null)} />
                                    </div>
                                    <button
                                        onClick={handleClone}
                                        disabled={cloning}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-purple-900/40"
                                    >
                                        {cloning ? 'CLONING...' : 'START CLONING'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT PANEL: VISUALIZER & SETTINGS */}
                <div className="w-full md:w-[40%] lg:w-[35%] bg-[#111] border-l border-white/5 flex flex-col">

                    {/* Visualizer Area */}
                    <div className="h-40 bg-[#050505] relative flex items-center justify-center border-b border-white/5">
                        <AudioVisualizer isPlaying={isPlaying} />
                        {!audioUrl && !generating && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 font-mono tracking-widest">
                                Waiting for audio
                            </div>
                        )}
                    </div>

                    {/* Output & Settings */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {audioUrl ? (
                            <div className="mb-6 p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Output Ready</span>
                                    <a href={audioUrl} download="generated_audio.wav" className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </a>
                                </div>
                                <audio ref={audioRef} controls src={audioUrl} className="w-full h-8" autoPlay />
                            </div>
                        ) : null}

                        {/* Voice Selector Component */}
                        <VoiceSelector
                            voices={language === 'vi' ? VN_PRESET_VOICES : voices}
                            selectedVoiceId={selectedVoice}
                            onSelect={setSelectedVoice}
                            clonedVoices={clonedVoices.filter(v => language === 'vi' ? v.id.startsWith('vn_clone_') : v.id.startsWith('custom_'))}
                        />

                        {/* Language Badge */}
                        <div className="mt-4 text-center">
                            <span className={`text-xs px-3 py-1 rounded-full ${language === 'vi' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {language === 'vi' ? 'Vietnamese Engine (Edge TTS)' : 'English Engine (Pocket TTS)'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default VoiceStudioTool;

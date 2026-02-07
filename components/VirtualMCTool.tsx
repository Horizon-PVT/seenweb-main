import React, { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';

export default function VirtualMCTool() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation('common');
    const isEN = router.locale === 'en';

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>(''); // starting, processing, succeeded, failed
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [showUpgrade, setShowUpgrade] = useState(false);

    // Audio visualization mock state
    const [audioVisLevel, setAudioVisLevel] = useState(0);

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setAudioVisLevel(Math.random() * 100);
            }, 100);
            return () => clearInterval(interval);
        } else {
            setAudioVisLevel(0);
        }
    }, [loading]);

    const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
    });

    const handleGenerate = async () => {
        // --- FREEMIUM GATE CHECK ---
        const userRole = ((session?.user as any)?.role || "FREE");
        const allowed = ['PRO', 'ADMIN'].includes(userRole);
        if (!allowed) {
            setShowUpgrade(true);
            return;
        }
        // ---------------------------

        if (!imageFile || !audioFile) {
            alert("Vui lòng chọn đủ Ảnh Idol và File Âm thanh!");
            return;
        }

        setLoading(true);
        setStatus("INITIALIZING...");
        setVideoUrl(null);

        try {
            // 1. Convert files to Base64/DataURI
            const imageData = await fileToDataUri(imageFile);
            const audioData = await fileToDataUri(audioFile);

            setStatus("UPLOADING ASSETS...");

            // 2. Call API Create
            const res = await fetch('/api/virtual-mc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: imageData,
                    audioUrl: audioData
                })
            });

            // Analytics
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'tool_start',
                    anonId: document.cookie.split('; ').find(row => row.startsWith('seen_anon_id='))?.split('=')[1],
                    properties: { tool: 'VirtualMC' }
                })
            }).catch(() => { });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Lỗi khởi tạo");

            const predictionId = data.id;
            setStatus("AI SYNTHESIZING...");

            // 3. Poll for status
            const interval = setInterval(async () => {
                const checkRes = await fetch(`/api/virtual-mc?id=${predictionId}`);
                const checkData = await checkRes.json();

                if (checkData.status === "succeeded") {
                    clearInterval(interval);
                    setVideoUrl(checkData.output);
                    setLoading(false);
                    setStatus("COMPLETE");
                } else if (checkData.status === "failed" || checkData.status === "canceled") {
                    clearInterval(interval);
                    setLoading(false);
                    const errorMsg = checkData.error || (checkData.logs ? "Lỗi từ Replicate: " + checkData.logs.slice(-200) : "Không xác định");
                    setStatus(`FAILED: ${checkData.status}`);
                    alert(`Tạo video thất bại! ${errorMsg}`);
                } else {
                    setStatus(`PROCESSING (${checkData.status})...`);
                }
            }, 3000);

        } catch (error: any) {
            console.error(error);
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full text-cyan-50 font-sans selection:bg-pink-500 selection:text-white">
            {/* Cyberpunk Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}>
            </div>

            {/* Header */}
            <div className="relative z-10 text-center mb-8 pt-4">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                    VIRTUAL IDOL <span className="text-2xl not-italic ml-2 border border-pink-500 text-pink-500 px-2 py-0.5 rounded text-base align-middle">PRO</span>
                </h1>
                <p className="text-cyan-300/60 text-xs tracking-[0.3em] mt-2 uppercase">Neural Rendering Engine v3.0 // Online</p>
            </div>

            {/* MAIN LAYOUT */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto p-4">

                {/* DOCTOR / INPUT PANEL */}
                <div className="lg:col-span-4 space-y-4">

                    {/* 1. VISUAL INPUT */}
                    <div className="bg-[#0a0a0f] border border-cyan-900/50 rounded-xl p-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 z-20">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
                        </div>

                        <div className="bg-gradient-to-b from-cyan-950/20 to-black p-5 rounded-lg relative">
                            <h3 className="text-cyan-400 font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                                <span className="w-1 h-3 bg-cyan-500 block"></span>
                                01. Visual Source
                            </h3>

                            <div className="relative group/upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setImageFile(e.target.files[0]);
                                            setImagePreview(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                />

                                <div className={`border-2 border-dashed ${imagePreview ? 'border-cyan-500/50' : 'border-gray-700'} rounded-lg h-64 flex flex-col items-center justify-center transition-all group-hover/upload:border-cyan-400 group-hover/upload:bg-cyan-950/20 relative overflow-hidden`}>

                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} className="w-full h-full object-cover opacity-80" />
                                            {/* Scanning Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent h-4 w-full animate-scan pointer-events-none"></div>
                                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 text-[10px] text-cyan-300 border border-cyan-800 rounded">
                                                FACE DETECTED
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="w-16 h-16 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover/upload:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                                                <span className="text-2xl opacity-70">👤</span>
                                            </div>
                                            <p className="text-cyan-100 text-sm font-bold">UPLOAD PORTRAIT</p>
                                            <p className="text-cyan-500/50 text-xs mt-1">JPG, PNG (Close-up)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. AUDIO INPUT */}
                    <div className="bg-[#0a0a0f] border border-pink-900/50 rounded-xl p-1 relative overflow-hidden">
                        <div className="bg-gradient-to-b from-pink-950/20 to-black p-5 rounded-lg">
                            <h3 className="text-pink-400 font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                                <span className="w-1 h-3 bg-pink-500 block"></span>
                                02. Audio Stream
                            </h3>

                            <div className="relative group/audio">
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => e.target.files?.[0] && setAudioFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                />

                                <div className={`border border-gray-800 bg-gray-900/50 rounded-lg p-4 flex items-center gap-4 transition-all hover:border-pink-500/50 hover:bg-pink-950/10`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${audioFile ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/50' : 'bg-gray-800 text-gray-500'}`}>
                                        🎵
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {audioFile ? (
                                            <div>
                                                <p className="text-white text-sm font-bold truncate">{audioFile.name}</p>
                                                <p className="text-pink-400 text-xs">Ready for synthesis</p>
                                                {/* Fake waveform */}
                                                <div className="flex gap-0.5 mt-2 h-3 items-end opacity-70">
                                                    {[...Array(15)].map((_, i) => (
                                                        <div key={i} className="w-1 bg-pink-500" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-gray-300 text-sm font-bold">Select Audio Source</p>
                                                <p className="text-gray-500 text-xs">MP3, WAV (Max 2min)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-gray-500 mt-3 text-right">
                                * Tip: Use <Link href="/?tool=text-to-speech" className="text-cyan-400 hover:underline">AI Voice Studio</Link> for best results.
                            </p>
                        </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !imageFile || !audioFile}
                        className={`
                            w-full py-5 rounded-xl font-black text-lg tracking-widest uppercase transition-all relative overflow-hidden group
                            ${loading || !imageFile || !audioFile
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                : 'bg-transparent text-white border border-cyan-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:border-pink-500'
                            }
                        `}
                    >
                        {/* Background Gradient Animation */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-600 via-pink-600 to-cyan-600 opacity-20 group-hover:opacity-40 transition-opacity ${loading ? 'animate-shimmer' : ''}`} style={{ backgroundSize: '200% 100%' }}></div>

                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    {status}
                                </>
                            ) : (
                                <>
                                    ⚡ INITIATE SYNC
                                </>
                            )}
                        </span>
                    </button>

                </div>

                {/* STAGE / OUTPUT PANEL */}
                <div className="lg:col-span-8 bg-black rounded-2xl border border-gray-800 relative overflow-hidden flex flex-col min-h-[500px] shadow-2xl">

                    {/* Top Bar Decoration */}
                    <div className="h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 w-full shrink-0"></div>
                    <div className="bg-[#050505] border-b border-gray-800 p-3 flex justify-between items-center shrink-0">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="uppercase text-[10px] font-mono text-gray-500 tracking-[0.2em] flex items-center gap-2">
                            <span>LIVE FEED</span>
                            <div className={`w-2 h-2 rounded-full ${videoUrl ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`}></div>
                        </div>
                    </div>

                    {/* Stage Area */}
                    <div className="flex-1 relative flex items-center justify-center bg-[url('/images/grid-bg.png')] bg-cover bg-center">

                        {/* Empty State */}
                        {!videoUrl && !loading && (
                            <div className="text-center opacity-40">
                                <div className="text-8xl mb-4 grayscale mix-blend-screen opacity-50">🎥</div>
                                <h2 className="text-2xl font-black text-white tracking-widest uppercase">IDOL STAGE OFFLINE</h2>
                                <p className="text-sm font-mono text-cyan-500 mt-2">WAITING FOR INPUT STREAM...</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                                <div className="w-24 h-24 border-t-4 border-l-4 border-cyan-500 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(6,182,212,0.4)]"></div>
                                <div className="font-mono text-cyan-400 text-xl tracking-widest animate-pulse">{status}</div>
                                {/* Tech decor */}
                                <div className="mt-8 flex gap-1 items-end h-8">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-2 bg-pink-500 animate-pulse" style={{ height: `${audioVisLevel}%`, animationDelay: `${i * 0.1}s` }}></div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Video Result */}
                        {videoUrl && (
                            <div className="relative w-full h-full flex flex-col">
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    className="w-full h-full object-contain max-h-[600px] z-10 shadow-2xl"
                                />
                                {/* Overlay Effect */}
                                <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls */}
                    {videoUrl && (
                        <div className="bg-[#0a0a0f] border-t border-gray-800 p-4 flex justify-between items-center shrink-0">
                            <div className="text-xs text-gray-500 font-mono">
                                SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => window.open(videoUrl, '_blank')}
                                    className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition uppercase tracking-wider"
                                >
                                    Open New Tab
                                </button>
                                <a
                                    href={videoUrl}
                                    download={`idol_render_${Date.now()}.mp4`}
                                    className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded uppercase tracking-wider shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex items-center gap-2"
                                >
                                    <span>⬇</span> Download Render
                                </a>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
                .glow-pink {
                    text-shadow: 0 0 10px rgba(236, 72, 153, 0.7);
                }
            `}</style>

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

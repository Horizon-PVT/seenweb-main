
import React, { useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { Wand2, Youtube, Upload, Play, Download, Check, Edit3, Volume2, ArrowRight, Loader2, Video as VideoIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';

export default function DubbingTool() {
    const { data: session } = useSession();
    const [step, setStep] = useState(1); // 1: Input, 2: Edit, 3: Result
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [showUpgrade, setShowUpgrade] = useState(false); // NEW STATE

    // Data
    const [videoUrl, setVideoUrl] = useState('');
    const [projectId, setProjectId] = useState('');
    const [segments, setSegments] = useState<any[]>([]);
    const [dubbedAudioUrl, setDubbedAudioUrl] = useState('');
    const [finalVideoUrl, setFinalVideoUrl] = useState('');

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    // STEP 1: Process Video
    const handleTranscribe = async () => {
        // --- FREEMIUM GATE CHECK ---
        const userRole = ((session?.user as any)?.role || "FREE");
        const allowed = ['SUPER', 'VIP', 'ADMIN'].includes(userRole);
        if (!allowed) {
            setShowUpgrade(true);
            return;
        }
        // ---------------------------

        if (!videoUrl) return;
        setLoading(true);
        setLogs(['Đang tải video...', 'Đang tách âm thanh...']);

        try {
            const res = await fetch('/api/dubbing/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setProjectId(data.projectId);
            setSegments(data.segments);
            addLog('Đã dịch xong! Chuyển sang trình chỉnh sửa...');
            setTimeout(() => setStep(2), 1000);
        } catch (e: any) {
            console.error(e);
            const errStr = String(e.message || '').toUpperCase();
            if (errStr.includes('PLAN_LOCKED') || errStr.includes('QUOTA') || errStr.includes('403')) {
                setShowUpgrade(true);
            } else {
                addLog(`❌ LOG LỖI KỸ THUẬT: ${e.message}`);
                alert(`Lỗi hệ thống: ${e.message}. Vui lòng thử lại link khác hoặc tải lại trang.`);
            }
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Synthesize & Merge
    const handleSynthesize = async () => {
        // --- FREEMIUM GATE CHECK ---
        const userRole = ((session?.user as any)?.role || "FREE");
        const allowed = ['SUPER', 'VIP', 'ADMIN'].includes(userRole);
        if (!allowed) {
            setShowUpgrade(true);
            return;
        }
        // ---------------------------

        setLoading(true);
        setLogs([]);
        addLog('Đang tạo giọng đọc AI (EdgeTTS)...');

        try {
            // 1. Synthesize
            const resSync = await fetch('/api/dubbing/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, segments, voice: 'vi-VN-HoaiMyNeural' })
            });
            const dataSync = await resSync.json();
            if (!resSync.ok) throw new Error(dataSync.error);

            setDubbedAudioUrl(dataSync.audioUrl);
            addLog(`Đã tạo file giọng đọc: ${dataSync.audioUrl}`);
            addLog('Đang ghép vào video gốc (Ducking)...');

            // 2. Merge
            const resMerge = await fetch('/api/dubbing/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl, dubbedAudioUrl: dataSync.audioUrl })
            });
            const dataMerge = await resMerge.json();
            if (!resMerge.ok) throw new Error(dataMerge.error);

            setFinalVideoUrl(dataMerge.videoUrl);
            addLog('Hoàn tất! Đang chuyển hướng...');
            setTimeout(() => setStep(3), 1000);

        } catch (e: any) {
            const errStr = String(e.message || '').toUpperCase();
            if (errStr.includes('PLAN_LOCKED') || errStr.includes('QUOTA') || errStr.includes('403')) {
                setShowUpgrade(true);
            } else {
                addLog(`Lỗi: ${e.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateSegment = (index: number, newText: string) => {
        const newSegs = [...segments];
        newSegs[index].translated = newText;
        setSegments(newSegs);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#CDAD5A] selection:text-black">
            <Head>
                <title>AI Dubbing Studio | SeenYT</title>
            </Head>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-gray-800 bg-black/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#CDAD5A] to-orange-500 rounded-lg flex items-center justify-center">
                            <Volume2 className="text-black w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">SeenDubbing <span className="text-[#CDAD5A] text-xs px-2 py-0.5 border border-[#CDAD5A] rounded-full">BETA</span></span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm">
                        <div className={`flex items-center ${step >= 1 ? 'text-[#CDAD5A]' : 'text-gray-600'}`}>
                            <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-2">1</div>
                            Upload
                        </div>
                        <div className="w-8 h-[1px] bg-gray-800"></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-[#CDAD5A]' : 'text-gray-600'}`}>
                            <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-2">2</div>
                            Editor
                        </div>
                        <div className="w-8 h-[1px] bg-gray-800"></div>
                        <div className={`flex items-center ${step >= 3 ? 'text-[#CDAD5A]' : 'text-gray-600'}`}>
                            <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-2">3</div>
                            Export
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20 max-w-5xl mx-auto px-4">

                {/* STEP 1: INPUT */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                                Biến Video Quốc Tế<br />Thành Video Của Bạn
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Tự động dịch thuật, lồng tiếng Việt và khớp khẩu hình (Auto-Dubbing).
                                Hỗ trợ TikTok, YouTube Shorts, Douyin.
                            </p>
                        </div>

                        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#CDAD5A]/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>

                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Dán Link Video (Youtube / TikTok)</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full bg-black border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#CDAD5A] transition shadow-inner"
                                    />
                                </div>
                                <button
                                    onClick={handleTranscribe}
                                    disabled={loading || !videoUrl}
                                    className="bg-[#CDAD5A] hover:bg-[#b09348] text-black font-bold px-8 rounded-xl flex items-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(205,173,90,0.3)] hover:shadow-[0_0_30px_rgba(205,173,90,0.5)]"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                                </button>
                            </div>

                            {/* Log Display */}
                            {logs.length > 0 && step === 1 && (
                                <div className="mt-6 p-4 bg-black/50 rounded-lg border border-gray-800 text-sm font-mono text-green-400">
                                    {logs.map((L, i) => <div key={i}>&gt; {L}</div>)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: EDITOR */}
                {step === 2 && (
                    <div className="animate-in zoom-in-95 duration-500 h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <Edit3 className="mr-2 text-[#CDAD5A]" /> Chỉnh Sửa Kịch Bản
                            </h2>
                            <button
                                onClick={handleSynthesize}
                                disabled={loading}
                                className="bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition flex items-center"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 w-4 h-4" />}
                                Tạo Video (Render)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                            {/* Preview (Placeholder for now, or embed YT if possible) */}
                            <div className="lg:col-span-1 bg-[#111] rounded-2xl border border-gray-800 p-4 flex flex-col">
                                {/* If it's a Youtube link, we can embed. For now just show info */}
                                <div className="aspect-video bg-black rounded-xl mb-4 flex items-center justify-center border border-gray-800">
                                    <VideoIcon className="w-16 h-16 text-gray-700" />
                                </div>
                                <p className="text-gray-400 text-sm mb-2">Video Gốc: <span className="text-white truncate block">{videoUrl}</span></p>

                                <div className="mt-auto bg-gray-900 p-4 rounded-xl">
                                    <h3 className="text-white font-bold mb-2 text-sm">Log xử lý:</h3>
                                    <div className="h-32 overflow-y-auto text-xs font-mono text-green-400 scrollbar-thin scrollbar-thumb-gray-700">
                                        {logs.map((L, i) => <div key={i}>&gt; {L}</div>)}
                                    </div>
                                </div>
                            </div>

                            {/* Transcript Editor */}
                            <div className="lg:col-span-2 bg-[#111] rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-gray-800 bg-black/40 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400">TIMECODE</span>
                                    <span className="text-sm font-bold text-[#CDAD5A]">VIETNAMESE (EDITABLE)</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#CDAD5A]/20">
                                    {segments.map((seg, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="w-24 text-xs font-mono text-gray-600 pt-3 text-right">
                                                {new Date(seg.start * 1000).toISOString().substr(14, 5)}
                                                {' - '}
                                                {new Date(seg.end * 1000).toISOString().substr(14, 5)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">{seg.original}</p>
                                                <textarea
                                                    value={seg.translated}
                                                    onChange={(e) => updateSegment(idx, e.target.value)}
                                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white text-base focus:border-[#CDAD5A] focus:outline-none transition resize-none h-auto overflow-hidden shadow-sm hover:border-gray-700"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: RESULT */}
                {step === 3 && (
                    <div className="text-center animate-in zoom-in duration-500 max-w-4xl mx-auto pt-10">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                            <Check className="text-black w-10 h-10" />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">Video Của Bạn Đã Sẵn Sàng! </h2>
                        <p className="text-gray-400 mb-8">Hệ thống đã tự động lồng tiếng, giảm âm lượng gốc và render hoàn tất.</p>

                        <div className="bg-[#111] border border-gray-800 rounded-3xl p-4 shadow-2xl overflow-hidden aspect-video relative max-w-2xl mx-auto mb-8">
                            <video
                                src={finalVideoUrl}
                                controls
                                className="w-full h-full rounded-xl"
                                autoPlay
                            />
                        </div>

                        <div className="flex justify-center gap-4">
                            <a
                                href={finalVideoUrl}
                                download
                                className="bg-[#CDAD5A] hover:bg-[#b09348] text-black font-bold px-8 py-3 rounded-xl flex items-center transition shadow-lg"
                            >
                                <Download className="mr-2" /> Tải Video Về Máy
                            </a>
                            <button
                                onClick={() => { setStep(1); setVideoUrl(''); }}
                                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-xl transition"
                            >
                                Làm Video Khác
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

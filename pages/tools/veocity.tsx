
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react"; // ADDED
import Link from 'next/link';
import {
    ArrowLeft,
    Monitor,
    Mic2,
    Radio,
    Film,
    Download,
    Settings,
    Play,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    ListVideo
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion'; // ADDED
import UpgradeModal from '@/components/UpgradeModal'; // ADDED

// ... (TYPES preserved)
type Phase = 'setup' | 'timeline' | 'output';

interface Scene {
    id: number;
    originalText: string;
    prompt: string;
    emotion: 'Default' | 'Vui vẻ' | 'Sốc' | 'Trầm tư' | 'Kịch tính';
    status: 'pending' | 'rendering' | 'completed' | 'failed';
    videoUrl?: string;
    error?: string;
}

const LoadingSignal: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-red-600 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
            <Radio size={40} className="text-red-500 animate-pulse" />
        </div>
        <h3 className="text-red-500 font-mono font-bold text-xl tracking-[0.2em] blink-cursor">ON AIR: {text}</h3>
        <p className="text-gray-500 text-xs mt-2 font-mono">ESTABLISHING UPLINK TO CORE...</p>
    </div>
);

export default function VeocityPage() {
    const { data: session } = useSession(); // ADDED
    const router = useRouter();
    const isEN = router.locale === 'en';

    // --- STATE ---
    const [phase, setPhase] = useState<Phase>('setup');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [showUpgrade, setShowUpgrade] = useState(false); // NEW STATE

    // Setup Phase
    const [script, setScript] = useState('');
    const [masterCharacterPrompt, setMasterCharacterPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [style, setStyle] = useState('Cinematic');
    const [extraNotes, setExtraNotes] = useState('');

    // Timeline/Output Phase
    const [scenes, setScenes] = useState<Scene[]>([]);

    // --- LOGIC: ANALYZE SCRIPT ---
    const handleAnalyzeScript = async () => {
        // Access control is handled by the backend API quota check
        // Do NOT gate here - session.user.role may be undefined even for ADMIN users

        if (!script) {
            setError("Script input required / Vui lòng nhập kịch bản.");
            return;
        }

        setIsLoading(true);
        setLoadingMessage("ANALYZING SCRIPT STRUCTURE...");
        setError('');

        try {
            const response = await fetch('/api/veocity-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script }),
            });

            const result: any = await response.json();
            if (!response.ok) {
                const errStr = String(result.error || '').toUpperCase();
                if (errStr.includes('PLAN_LOCKED') || errStr.includes('FREE_QUOTA_EXCEEDED') || errStr.includes('DAILY_QUOTA_EXCEEDED')) {
                    setShowUpgrade(true);
                    setIsLoading(false);
                    return;
                }
                throw new Error(result.error || `Error ${response.status}`);
            }

            setMasterCharacterPrompt(result.masterCharacterPrompt);
            setScenes(result.scenes.map((s: any, i: number) => ({
                id: i,
                originalText: s.originalText,
                prompt: s.prompt,
                emotion: 'Default',
                status: 'pending',
            })));

            setPhase('timeline');

        } catch (err: any) {
            console.error('Veocity Error:', err);
            setError(`Analysis Failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGIC: EXPORT PROMPTS ---
    const exportPromptsForFlow = () => {
        const fullPrompts = scenes.map(scene => {
            const finalPrompt = `
                ${masterCharacterPrompt}.
                ${scene.prompt}.
                Emotion: ${scene.emotion}.
                Style: ${style}.
                Aspect Ratio: ${aspectRatio}.
                ${extraNotes}
            `.trim().replace(/\n\s+/g, ' ');
            return finalPrompt;
        });

        const promptsText = fullPrompts.join('\n\n\n'); // Tách bằng 2 dòng trống (xuống dòng cách)
        const blob = new Blob([promptsText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Kodaflow_Veocity_Prompts_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setPhase('output');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-red-900 selection:text-white overflow-hidden flex flex-col">
            {/* ... (Header and Main omitted for brevity, logic remains same) ... */}
            <Head>
                <title>VEOCITY | BROADCAST STUDIO</title>
            </Head>

            {/* BROADCAST HEADER */}
            <header className="h-16 bg-black border-b border-red-900/30 flex items-center justify-between px-6 z-50 relative overflow-hidden">
                {/* Decorative scanning line */}
                <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

                <div className="flex items-center gap-6">
                    <Link href="/?tool=tools_content" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                        <div className="p-1 rounded bg-gray-900 group-hover:bg-red-900 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="text-xs font-mono font-bold tracking-widest uppercase">Return</span>
                    </Link>
                    <div className="h-8 w-px bg-gray-800"></div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]"></div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tighter text-white uppercase"><span className="text-red-600">VEO</span>CITY</h1>
                            <div className="text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase leading-none">Newsroom AI Studio</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Phase Indicators */}
                    <div className="hidden md:flex items-center gap-1 bg-gray-900/50 p-1 rounded border border-gray-800">
                        {['SETUP', 'RUNDOWN', 'ON AIR'].map((step, idx) => {
                            const stepCodes: Phase[] = ['setup', 'timeline', 'output'];
                            const isActive = stepCodes[idx] === phase;
                            return (
                                <div key={step} className={`px-4 py-1.5 rounded text-[10px] font-bold tracking-wider transition-all ${isActive ? 'bg-red-600 text-white shadow-lg' : 'text-gray-600'}`}>
                                    {step}
                                </div>
                            )
                        })}
                    </div>
                    <div className="h-8 w-px bg-gray-800"></div>
                    <Clock size={18} className="text-gray-600" />
                    <span className="text-xs font-mono text-gray-400">{(new Date()).toLocaleTimeString('en-US', { hour12: false })}</span>
                </div>
            </header>

            <main className="flex-grow flex p-6 gap-6 overflow-hidden relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

                {isLoading ? (
                    <div className="m-auto"><LoadingSignal text={loadingMessage} /></div>
                ) : (
                    <>
                        {/* PHASE 1: EDITOR'S DESK (SETUP) */}
                        {phase === 'setup' && (
                            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
                                {/* LEFT: TELEPROMPTER INPUT */}
                                <div className="lg:col-span-8 flex flex-col gap-4">
                                    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden flex flex-col h-[600px] shadow-2xl">
                                        <div className="h-10 bg-black border-b border-gray-800 flex items-center justify-between px-4">
                                            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                                                <Monitor size={14} /> TELEPROMPTER FEED
                                            </div>
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            </div>
                                        </div>
                                        <textarea
                                            value={script}
                                            onChange={e => setScript(e.target.value)}
                                            placeholder="ENTER SCRIPT OR PASTE WIRE COPY HERE..."
                                            className="flex-grow bg-transparent p-8 text-2xl font-serif text-white placeholder-gray-700 outline-none resize-none leading-relaxed selection:bg-white selection:text-black"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* RIGHT: CONTROL PANEL */}
                                <div className="lg:col-span-4 flex flex-col gap-4">
                                    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-6 shadow-xl">
                                        <div className="flex items-center gap-2 text-red-500 mb-6 pb-2 border-b border-gray-800">
                                            <Settings size={18} />
                                            <h3 className="font-bold tracking-widest text-sm">BROADCAST SETTINGS</h3>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-wider">Aspect Ratio</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['16:9', '9:16'].map(ratio => (
                                                        <button
                                                            key={ratio}
                                                            onClick={() => setAspectRatio(ratio as any)}
                                                            className={`py-3 rounded border text-xs font-bold transition-all ${aspectRatio === ratio ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'}`}
                                                        >
                                                            {ratio}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-wider">Visual Style</label>
                                                <select
                                                    value={style}
                                                    onChange={e => setStyle(e.target.value)}
                                                    className="w-full bg-black border border-gray-700 text-white text-sm rounded p-3 outline-none focus:border-red-600"
                                                >
                                                    <option>Cinematic</option>
                                                    <option>Realistic (News)</option>
                                                    <option>Documentary</option>
                                                    <option>3D Render</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-wider">Director Notes</label>
                                                <input
                                                    type="text"
                                                    value={extraNotes}
                                                    onChange={e => setExtraNotes(e.target.value)}
                                                    placeholder="Ex: Dark moody lighting..."
                                                    className="w-full bg-black border border-gray-700 text-white text-sm rounded p-3 outline-none focus:border-red-600"
                                                />
                                            </div>

                                            <div className="pt-4 mt-4 border-t border-gray-800">
                                                <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded mb-4">
                                                    <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold mb-2">
                                                        <AlertCircle size={14} /> REQUIRED EXTENSION
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="relative group">
                                                            <div className="absolute left-0 top-2 w-1 h-1 bg-yellow-500 rounded-full"></div>
                                                            <a href="https://chromewebstore.google.com/detail/auto-flow-t%E1%BB%B1-%C4%91%E1%BB%99ng-h%C3%B3a-cho/lhcmnhdbddgagibbbgppakocflbnknoa" target="_blank" className="block pl-3 text-[10px] text-gray-300 hover:text-white underline decoration-dotted transition-colors">
                                                                Option 1: Auto Flow (Standard)
                                                            </a>
                                                        </div>
                                                        <div className="relative group">
                                                            <div className="absolute left-0 top-2 w-1 h-1 bg-red-500 rounded-full"></div>
                                                            <a href="https://chromewebstore.google.com/detail/seenyt-veo-ai-pro-automat/dlfjhmaebmgmgibnloiinaccagcohpme" target="_blank" className="block pl-3 text-[10px] text-gray-300 hover:text-white underline decoration-dotted transition-colors">
                                                                Option 2: SeenYT Veo AI Pro (Advanced)
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <p className="mt-2 text-[9px] text-gray-500 italic">Select one extension to automate video generation.</p>
                                                </div>

                                                <button
                                                    onClick={handleAnalyzeScript}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                                                >
                                                    <Mic2 size={18} /> INITIALIZE BREAKDOWN
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PHASE 2: RUNDOWN (TIMELINE) */}
                        {phase === 'timeline' && (
                            <div className="flex-grow flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500 z-10 w-full max-w-7xl mx-auto">
                                {/* TOP: CHARACTER CONSISTENCY */}
                                <div className="bg-gray-900/90 border-l-4 border-l-yellow-500 border border-gray-800 p-4 rounded-r shadow-lg flex flex-col md:flex-row gap-4 items-start">
                                    <div className="bg-yellow-500/10 p-3 rounded">
                                        <User size={24} className="text-yellow-500" />
                                    </div>
                                    <div className="flex-grow">
                                        <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1 block">Master Character Prompt (Consistency Lock)</label>
                                        <textarea
                                            value={masterCharacterPrompt}
                                            onChange={e => setMasterCharacterPrompt(e.target.value)}
                                            className="w-full bg-transparent text-sm text-gray-300 outline-none resize-none h-16 border-b border-gray-700 focus:border-yellow-500 transition-colors placeholder-gray-600"
                                            placeholder="Define the main character visually here to keep them consistent across all scenes..."
                                        />
                                    </div>
                                </div>

                                {/* MAIN: CUE SHEET */}
                                <div className="flex-grow bg-black/40 border border-gray-800 rounded-lg overflow-hidden flex flex-col">
                                    <div className="h-10 bg-gray-900 border-b border-gray-800 grid grid-cols-12 items-center px-4 gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        <div className="col-span-1">Seq #</div>
                                        <div className="col-span-4">Visual Prompt (Camera/Action)</div>
                                        <div className="col-span-2">Emotion</div>
                                        <div className="col-span-5">Status / Notes</div>
                                    </div>

                                    <div className="flex-grow overflow-y-auto p-2 space-y-2">
                                        {scenes.map((scene, idx) => (
                                            <div key={scene.id} className="grid grid-cols-12 gap-4 items-start p-4 bg-gray-900/50 border border-gray-800 rounded hover:bg-gray-800/50 transition-colors group">
                                                <div className="col-span-1 text-2xl font-bold text-gray-700 font-mono group-hover:text-red-500 transition-colors">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</div>

                                                <div className="col-span-4">
                                                    <textarea
                                                        value={scene.prompt}
                                                        onChange={e => setScenes(scenes.map(s => s.id === scene.id ? { ...s, prompt: e.target.value } : s))}
                                                        className="w-full bg-transparent text-sm text-white outline-none resize-none h-20 border-l-2 border-gray-700 pl-3 focus:border-red-500 transition-colors font-mono leading-relaxed"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <select
                                                        value={scene.emotion}
                                                        onChange={e => setScenes(scenes.map(s => s.id === scene.id ? { ...s, emotion: e.target.value as any } : s))}
                                                        className="w-full bg-black border border-gray-700 text-xs text-white rounded p-2 outline-none focus:border-red-500"
                                                    >
                                                        <option>Default</option><option>Vui vẻ</option><option>Sốc</option><option>Trầm tư</option><option>Kịch tính</option>
                                                    </select>
                                                </div>

                                                <div className="col-span-5 flex flex-col justify-between h-full">
                                                    <div className="text-xs text-gray-500 italic border-l-2 border-gray-800 pl-3">
                                                        "{scene.originalText.substring(0, 100)}..."
                                                    </div>
                                                    <div className="flex justify-end mt-2">
                                                        <span className="text-[10px] font-bold bg-gray-800 text-gray-400 px-2 py-1 rounded uppercase tracking-wider group-hover:bg-red-900/30 group-hover:text-red-400 transition-colors">
                                                            Ready to Queue
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* BOTTOM: ACTION */}
                                <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <AlertCircle size={14} />
                                        <span>Review visual descriptions before export. Character consistency applied automatically.</span>
                                    </div>
                                    <button
                                        onClick={exportPromptsForFlow}
                                        className="bg-[#00ffc8] hover:bg-[#00e6b4] text-black font-bold py-3 px-8 rounded shadow-[0_0_20px_rgba(0,255,200,0.3)] transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
                                    >
                                        <Download size={18} /> Export Rundown & Activate Flow
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PHASE 3: OUTPUT (ON AIR) */}
                        {phase === 'output' && (
                            <div className="flex-grow flex items-center justify-center animate-in zoom-in duration-500 z-10">
                                <div className="bg-black/80 backdrop-blur border-2 border-[#00ffc8] p-10 rounded-lg shadow-[0_0_50px_rgba(0,255,200,0.15)] max-w-2xl text-center relative overflow-hidden">
                                    {/* Background Pulse */}
                                    {/* <div className="absolute top-0 left-0 w-full h-1 bg-[#00ffc8] animate-[loading_2s_ease-in-out_infinite]"></div> */}

                                    <div className="w-20 h-20 bg-[#00ffc8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={40} className="text-[#00ffc8]" />
                                    </div>

                                    <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Rundown Exported</h2>
                                    <p className="text-gray-400 mb-8 font-mono text-sm max-w-md mx-auto">
                                        File <span className="text-[#00ffc8]">Kodaflow_Veocity_Prompts.txt</span> has been generated. Initiate automated production sequence.
                                    </p>

                                    <div className="bg-gray-900 border border-gray-800 rounded p-6 text-left space-y-4 mb-8">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white shrink-0">1</div>
                                            <div className="text-sm text-gray-300">Launch <strong className="text-white">Veo3 Interface</strong> in Chrome.</div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white shrink-0">2</div>
                                            <div className="text-sm text-gray-300">Open <strong className="text-red-400">Auto Flow Extension</strong> sidebar.</div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white shrink-0">3</div>
                                            <div className="text-sm text-gray-300">Select <strong>"Import file (.txt)"</strong> and target the generated rundown file.</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => setPhase('timeline')} className="px-6 py-2 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-white transition-colors text-xs font-bold uppercase tracking-widest">
                                            Modify Rundown
                                        </button>
                                        <button onClick={() => setPhase('setup')} className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-bold uppercase tracking-widest">
                                            New Broadcast
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {error && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-900 text-white px-6 py-3 rounded shadow-lg border border-red-500 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
                    <AlertCircle size={20} />
                    <span className="font-bold text-sm tracking-wide">{error}</span>
                </div>
            )}

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

// Add keyframes for custom animations if not present in global CSS
// Example: blink-cursor, loading bar

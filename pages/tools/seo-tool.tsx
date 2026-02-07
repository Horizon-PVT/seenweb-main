
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import {
    Cpu,
    Activity,
    Target,
    Globe,
    Zap,
    FileText,
    Brain,
    ChevronLeft,
    Layers,
    Copy,
    Check
} from 'lucide-react';

// --- TYPES (Preserved from Original) ---
interface OutputData {
    strategy: {
        hook: {
            score: number;
            analysis: string;
            visualInterrupt: string;
        };
        emotional: {
            mainTrigger: string;
            triggerScore: number;
            explanation: string;
        };
        spyGap: {
            marketStatus: string;
            competitorMiss: string;
            ourAngle: string;
        };
    };
    audit: {
        titleScore: number;
        titleCritique: string;
        thumbnailCritique: string;
    };
    checklist: {
        titleLength: { score: number; status: string; message: string };
        wordCount: { score: number; status: string; message: string };
        tagCount: { score: number; status: string; message: string };
        hasQuestion: boolean;
        hasNumber: boolean;
    };
    content: {
        titles: {
            text: string;
            viralScore: number;
        }[];
        description: {
            body: string;
            hashtags: string[];
        };
        tags: {
            text: string;
            relevance: number;
        }[];
        thumbnails: {
            concept: string;
            text: string;
            colorPalette: string;
            prompt: string;
        }[];
    };
}

// --- HELPER COMPONENTS ---
const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(textToCopy);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className={`p-1.5 rounded transition-all duration-300 ${copied ? 'bg-[#00f3ff] text-black' : 'bg-transparent text-[#00f3ff] hover:bg-[#00f3ff]/10 border border-[#00f3ff]/30'}`}
            title="Copy to Clipboard"
        >
            {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
        </button>
    );
};

export default function SeoToolPage() {
    const router = useRouter();
    const isEN = router.locale === 'en';

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [output, setOutput] = useState<OutputData | null>(null);
    const [coreIdea, setCoreIdea] = useState('');
    const [activeTab, setActiveTab] = useState<'strategy' | 'content' | 'checklist'>('strategy'); // New Tab State
    const [showUpgrade, setShowUpgrade] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Holographic Grid Animation
    const [gridOffset, setGridOffset] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setGridOffset(prev => (prev + 1) % 50);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // LOGIC: File Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setCoreIdea(prev => prev + (prev ? '\n' : '') + content);
            };
            reader.readAsText(file);
        }
    };

    // LOGIC: Submit Handler (Preserved)
    // Extract scan logic
    const performAnalysis = async (inputIdea: string) => {
        setIsLoading(true);
        setError('');
        setOutput(null);

        try {
            // Auto detect language logic
            let language = 'English';
            if (/[àáâãäåæçèéêëìíîïđñòóôõöøùúûüýþÿ]/.test(inputIdea)) language = 'Tiếng Việt';
            else if (/[ぁ-ゟァ-ヿ]/.test(inputIdea)) language = 'Japanese';
            else if (/[가-힣]/.test(inputIdea)) language = 'Korean';
            else if (/[\u4e00-\u9fff]/.test(inputIdea)) language = 'Chinese';

            const response = await fetch('/api/seo-tool', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coreIdea: inputIdea,
                    outputLanguage: language
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                const errRaw = result?.error || '';
                const errStr = String(errRaw).toUpperCase();

                // ONLY show upgrade for SPECIFIC plan errors, NOT system errors
                const isPlanError = errStr.includes('PLAN_LOCKED') || errStr.includes('FREE_QUOTA_EXCEEDED') || errStr.includes('DAILY_QUOTA_EXCEEDED');
                if (response.status === 403 && isPlanError) {
                    setShowUpgrade(true);
                    setIsLoading(false);
                    return;
                }
                throw new Error(result.error);
            }

            // Artificial delay for effect
            setTimeout(() => {
                setOutput(result as OutputData);
                setIsLoading(false);
            }, 800);

        } catch (err: any) {
            console.error('SEO Tool Error:', err);
            setError(err.message || "SYSTEM FAILURE");
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coreIdea) {
            setError("MISSING DATA INPUT");
            return;
        }
        performAnalysis(coreIdea);
    };

    // Auto-scan from URL
    useEffect(() => {
        if (router.isReady && router.query.idea) {
            const idea = router.query.idea as string;
            setCoreIdea(idea);
            if (router.query.autoStart === 'true') {
                performAnalysis(idea);
            }
        }
    }, [router.isReady, router.query]);

    return (
        <div className="min-h-screen bg-[#050b14] text-[#00f3ff] font-mono overflow-x-hidden selection:bg-[#00f3ff] selection:text-black">
            <Head>
                <title>HOLO_STRATEGY | ALPHA INTELLIGENCE</title>
            </Head>

            {/* BACKGROUND EFFECTS */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#003c42] via-[#050b14] to-[#000000]"></div>
            <div
                className="fixed inset-0 pointer-events-none z-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    transform: `translateY(${gridOffset}px) perspective(500px) rotateX(20deg)`
                }}
            ></div>

            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#050b14]/80 backdrop-blur-md border-b border-[#00f3ff]/30 flex items-center justify-between px-6 z-50 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                <div className="flex items-center gap-4">
                    <Link href="/#bang-cong-cu-seenyt" className="flex items-center gap-2 text-[#00f3ff]/70 hover:text-[#00f3ff] transition-colors">
                        <ChevronLeft size={18} /> <span className="text-xs font-bold tracking-widest">EXIT_MODULE</span>
                    </Link>
                    <div className="h-8 w-px bg-[#00f3ff]/20"></div>
                    <div className="flex items-center gap-2">
                        <Brain className="text-[#00f3ff] animate-pulse" size={24} />
                        <div>
                            <h1 className="text-lg font-black tracking-[0.2em] leading-none text-white drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">ALPHA_STRATEGY</h1>
                            <p className="text-[9px] text-[#00f3ff] tracking-widest opacity-80">INTELLIGENCE ENGINE V4.0</p>
                        </div>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-[#00f3ff]/60">
                    <span className="flex items-center gap-1"><Cpu size={12} /> CORE: ONLINE</span>
                    <span className="flex items-center gap-1"><Globe size={12} /> NETWORK: SECURE</span>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto min-h-screen relative z-10 flex flex-col lg:flex-row gap-8">

                {/* LEFT: INPUT CONSOLE */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className="bg-[#0a1520]/80 border border-[#00f3ff]/30 p-1 relative group rounded-lg backdrop-blur-sm">
                        {/* Holo Corners */}
                        <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#00f3ff]"></div>
                        <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-[#00f3ff]"></div>
                        <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-[#00f3ff]"></div>
                        <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-[#00f3ff]"></div>

                        <div className="p-4 bg-[#050b14]/90 rounded h-full flex flex-col">
                            <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#00f3ff] mb-4">
                                <FileText size={14} /> INPUT_DATA_STREAM
                            </label>

                            <textarea
                                value={coreIdea}
                                onChange={e => setCoreIdea(e.target.value)}
                                placeholder="> ENTER VIDEO CONCEPT OR RAW SCRIPT DATA..."
                                className="w-full flex-grow min-h-[300px] bg-transparent border-none outline-none text-white placeholder-gray-600 font-mono text-sm resize-none custom-scrollbar"
                                spellCheck={false}
                            ></textarea>

                            <div className="mt-4 pt-4 border-t border-[#00f3ff]/20 flex gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] text-xs font-bold border border-[#00f3ff]/30 rounded transition-all flex items-center gap-2"
                                >
                                    <Layers size={14} /> LOAD_FILE
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-grow px-6 py-2 bg-[#00f3ff] hover:bg-[#fff] text-black text-xs font-bold tracking-widest rounded shadow-[0_0_15px_rgba(0,243,255,0.5)] transition-all disabled:opacity-50 disabled:shadow-none"
                                >
                                    {isLoading ? 'PROCESSING...' : 'RUN_ANALYSIS >>'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: OUTPUT HOLOGRAPHIC DISPLAY */}
                <div className="w-full lg:w-2/3 min-h-[500px] flex flex-col relative">

                    {/* LOADING STATE */}
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050b14]/80 backdrop-blur z-20">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 border-4 border-[#00f3ff]/30 rounded-full animate-ping"></div>
                                <div className="absolute inset-2 border-4 border-t-[#00f3ff] border-r-transparent border-b-[#00f3ff] border-l-transparent rounded-full animate-spin"></div>
                                <Brain className="absolute inset-0 m-auto text-[#00f3ff] animate-pulse" size={48} />
                            </div>
                            <div className="mt-8 text-center">
                                <div className="text-[#00f3ff] font-bold text-lg tracking-[0.3em] animate-pulse">ANALYZING GEOMETRY</div>
                                <div className="text-[#00f3ff]/60 text-xs mt-2">CALCULATING VIRAL VECTORS...</div>
                            </div>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!output && !isLoading && (
                        <div className="flex-grow flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-[#00f3ff]/20 rounded-lg bg-[#00f3ff]/5">
                            <Activity size={80} className="text-[#00f3ff] mb-4" />
                            <div className="text-2xl font-black tracking-widest text-[#00f3ff]">SYSTEM_READY</div>
                            <p className="text-sm">AWAITING INPUT TO COMMENCE SIMULATION</p>
                        </div>
                    )}

                    {/* RESULTS DASHBOARD */}
                    {output && !isLoading && (
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">

                            {/* TABS NAVIGATION */}
                            <div className="flex border-b border-[#00f3ff]/20">
                                <button
                                    onClick={() => setActiveTab('strategy')}
                                    className={`px-6 py-3 text-xs font-bold tracking-widest transition-all ${activeTab === 'strategy' ? 'bg-[#00f3ff]/10 text-[#00f3ff] border-b-2 border-[#00f3ff]' : 'text-gray-500 hover:text-[#00f3ff]/60'}`}
                                >
                                    1. STRATEGY
                                </button>
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`px-6 py-3 text-xs font-bold tracking-widest transition-all ${activeTab === 'content' ? 'bg-[#ff0055]/10 text-[#ff0055] border-b-2 border-[#ff0055]' : 'text-gray-500 hover:text-[#ff0055]/60'}`}
                                >
                                    2. CONTENT & THUMBNAILS
                                </button>
                                <button
                                    onClick={() => setActiveTab('checklist')}
                                    className={`px-6 py-3 text-xs font-bold tracking-widest transition-all ${activeTab === 'checklist' ? 'bg-[#00ff88]/10 text-[#00ff88] border-b-2 border-[#00ff88]' : 'text-gray-500 hover:text-[#00ff88]/60'}`}
                                >
                                    3. SEO CHECKLIST (NEW)
                                </button>
                            </div>

                            {/* TAB 1: STRATEGY */}
                            {activeTab === 'strategy' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                    {/* CARD 1 */}
                                    <div className="bg-[#00f3ff]/5 border border-[#00f3ff]/30 rounded p-4 relative overflow-hidden group hover:bg-[#00f3ff]/10 transition-all">
                                        <div className="absolute top-0 right-0 p-2 text-[#00f3ff]/20 group-hover:text-[#00f3ff]/40 transition-all"><Target size={40} /></div>
                                        <h3 className="text-[#00f3ff] text-[10px] font-bold tracking-widest uppercase mb-1">HOOK EFFICIENCY</h3>
                                        <div className="text-4xl font-black text-white mb-2 font-numeric">{output.strategy.hook.score}%</div>
                                        <div className="h-1 w-full bg-[#00f3ff]/20 rounded-full overflow-hidden mb-3">
                                            <div className="h-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" style={{ width: `${output.strategy.hook.score}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-tight border-l-2 border-[#00f3ff] pl-2">{output.strategy.hook.analysis}</p>
                                    </div>

                                    {/* CARD 2 */}
                                    <div className="bg-[#ff0055]/5 border border-[#ff0055]/30 rounded p-4 relative overflow-hidden group hover:bg-[#ff0055]/10 transition-all">
                                        <div className="absolute top-0 right-0 p-2 text-[#ff0055]/20 group-hover:text-[#ff0055]/40 transition-all"><Zap size={40} /></div>
                                        <h3 className="text-[#ff0055] text-[10px] font-bold tracking-widest uppercase mb-1">EMOTIONAL CORE</h3>
                                        <div className="text-2xl font-black text-white mb-1">{output.strategy.emotional.mainTrigger}</div>
                                        <p className="text-[10px] text-[#ff0055] mb-2">INTENSITY: {output.strategy.emotional.triggerScore}/10</p>
                                        <p className="text-xs text-gray-300 italic opacity-80">"{output.strategy.emotional.explanation}"</p>
                                    </div>

                                    {/* CARD 3 */}
                                    <div className="bg-[#aa00ff]/5 border border-[#aa00ff]/30 rounded p-4 relative overflow-hidden group hover:bg-[#aa00ff]/10 transition-all">
                                        <div className="absolute top-0 right-0 p-2 text-[#aa00ff]/20 group-hover:text-[#aa00ff]/40 transition-all"><Globe size={40} /></div>
                                        <h3 className="text-[#aa00ff] text-[10px] font-bold tracking-widest uppercase mb-1">MARKET GAP</h3>
                                        <div className="inline-block px-2 py-0.5 bg-[#aa00ff]/20 text-[#d08bff] text-[10px] rounded mb-2 font-bold border border-[#aa00ff]/40">
                                            {output.strategy.spyGap.marketStatus?.toUpperCase()}
                                        </div>
                                        <div className="text-xs text-gray-300 mb-1"><span className="text-red-400 font-bold">MISSING:</span> {output.strategy.spyGap.competitorMiss}</div>
                                        <div className="text-xs text-gray-300"><span className="text-green-400 font-bold">OUR ANGLE:</span> {output.strategy.spyGap.ourAngle}</div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: CONTENT */}
                            {activeTab === 'content' && (
                                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* TITLES */}
                                        <div className="bg-[#0a1520]/80 border border-[#00f3ff]/20 rounded p-4">
                                            <h3 className="text-white text-xs font-bold uppercase mb-4 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[#00f3ff] rounded-full shadow-[0_0_5px_#00f3ff]"></span>
                                                OPTIMIZED TITLES
                                            </h3>
                                            <div className="space-y-3">
                                                {output.content.titles.map((t, i) => (
                                                    <div key={i} className="group relative p-3 bg-black/40 border border-[#00f3ff]/10 hover:border-[#00f3ff]/40 hover:bg-[#00f3ff]/5 rounded transition-all">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="text-sm font-medium text-gray-200">{t.text}</div>
                                                            <CopyButton textToCopy={t.text} />
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="h-1 w-20 bg-gray-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-green-500" style={{ width: `${t.viralScore}%` }}></div>
                                                            </div>
                                                            <span className="text-[9px] text-green-400 font-bold">V-SCORE: {t.viralScore}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* DESCRIPTION & TAGS */}
                                        <div className="bg-[#0a1520]/80 border border-[#00f3ff]/20 rounded p-4 flex flex-col gap-4">
                                            <div>
                                                <h3 className="text-white text-xs font-bold uppercase mb-4 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-[#00f3ff] rounded-full shadow-[0_0_5px_#00f3ff]"></span>
                                                    SEO DESCRIPTION
                                                </h3>
                                                <div className="relative group">
                                                    <div className="p-3 bg-black/40 border border-[#00f3ff]/10 rounded text-xs text-gray-300 font-sans whitespace-pre-wrap h-40 overflow-y-auto custom-scrollbar">
                                                        {output.content.description.body}
                                                    </div>
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CopyButton textToCopy={output.content.description.body} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-grow">
                                                <h3 className="text-white text-xs font-bold uppercase mb-2 flex items-center justify-between">
                                                    <span>TAGS CLOUD</span>
                                                    <CopyButton textToCopy={output.content.tags.map(t => t.text).join(', ')} />
                                                </h3>
                                                <div className="flex flex-wrap gap-1.5 align-content-start h-full">
                                                    {output.content.tags.map((tag, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-[#00f3ff]/5 border border-[#00f3ff]/20 text-[#00f3ff] text-[10px] rounded hover:bg-[#00f3ff] hover:text-black transition-colors cursor-default">
                                                            {tag.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROW 3: THUMBNAILS */}
                                    <div className="bg-[#0a1520]/80 border border-[#00f3ff]/20 rounded p-6">
                                        <h3 className="text-white text-xs font-bold uppercase mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[#00f3ff] rounded-full shadow-[0_0_5px_#00f3ff]"></span>
                                            VISUAL CONCEPTS (A/B TESTING)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {output.content.thumbnails.map((thumb, i) => (
                                                <div key={i} className="bg-black/40 border border-[#00f3ff]/10 rounded p-4 flex flex-col relative group hover:border-[#00f3ff]/40 transition-all">
                                                    <div className="absolute -top-3 left-4 bg-[#050b14] px-2 text-[#00f3ff] text-[10px] font-bold border border-[#00f3ff]/30 rounded">
                                                        CONCEPT {String.fromCharCode(65 + i)}
                                                    </div>
                                                    <div className="mt-2 mb-4">
                                                        <div className="text-white font-black text-lg leading-tight uppercase mb-2 drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">
                                                            "{thumb.text}"
                                                        </div>
                                                        <p className="text-xs text-gray-400 font-sans">{thumb.concept}</p>
                                                    </div>
                                                    <div className="mt-auto space-y-2">
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                            <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: thumb.colorPalette.split(' ')[0] }}></span>
                                                            {thumb.colorPalette}
                                                        </div>
                                                        <div className="bg-[#00f3ff]/5 p-2 rounded border border-[#00f3ff]/10 text-[10px] text-[#00f3ff]/70 font-mono break-all line-clamp-2 hover:line-clamp-none transition-all cursor-help relative group/prompt">
                                                            PROMPT: {thumb.prompt}
                                                            <div className="absolute top-1 right-1 opacity-0 group-hover/prompt:opacity-100">
                                                                <CopyButton textToCopy={thumb.prompt} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: CHECKLIST (New) */}
                            {activeTab === 'checklist' && output.checklist && (
                                <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in duration-300">
                                    <div className="bg-[#0a1520]/80 border border-[#00ff88]/20 rounded p-6">
                                        <h3 className="text-white text-xs font-bold uppercase mb-6 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[#00ff88] rounded-full shadow-[0_0_5px_#00ff88]"></span>
                                            TECHNICAL SEO AUDIT (VIDIQ STANDARD)
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Left: Scorecard */}
                                            <div className="space-y-6">
                                                {/* Title Length */}
                                                <div className="flex items-center justify-between p-4 bg-black/40 rounded border border-gray-800">
                                                    <div>
                                                        <div className="text-sm font-bold text-white mb-1">Title Length</div>
                                                        <div className={`text-xs ${output.checklist.titleLength.status === 'Good' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {output.checklist.titleLength.message}
                                                        </div>
                                                    </div>
                                                    <div className={`text-xl font-bold ${output.checklist.titleLength.status === 'Good' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {output.checklist.titleLength.score}/100
                                                    </div>
                                                </div>

                                                {/* Word Count */}
                                                <div className="flex items-center justify-between p-4 bg-black/40 rounded border border-gray-800">
                                                    <div>
                                                        <div className="text-sm font-bold text-white mb-1">Script Depth</div>
                                                        <div className={`text-xs ${output.checklist.wordCount.status === 'Good' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {output.checklist.wordCount.message}
                                                        </div>
                                                    </div>
                                                    <div className={`text-xl font-bold ${output.checklist.wordCount.status === 'Good' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {output.checklist.wordCount.score}/100
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex items-center justify-between p-4 bg-black/40 rounded border border-gray-800">
                                                    <div>
                                                        <div className="text-sm font-bold text-white mb-1">Tag Volume</div>
                                                        <div className={`text-xs ${output.checklist.tagCount.status === 'Good' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {output.checklist.tagCount.message}
                                                        </div>
                                                    </div>
                                                    <div className={`text-xl font-bold ${output.checklist.tagCount.status === 'Good' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {output.checklist.tagCount.score}/100
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Engagement Checks */}
                                            <div className="space-y-4">
                                                <div className={`p-4 rounded border ${output.checklist.hasQuestion ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {output.checklist.hasQuestion ? <Check className="text-[#00ff88]" /> : <div className="text-red-500">✕</div>}
                                                        <span className="font-bold text-white">Curiosity Question in Title</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">Titles with questions ("?") have 2x higher CTR.</p>
                                                </div>

                                                <div className={`p-4 rounded border ${output.checklist.hasNumber ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {output.checklist.hasNumber ? <Check className="text-[#00ff88]" /> : <div className="text-red-500">✕</div>}
                                                        <span className="font-bold text-white">Contains Numbers/Lists</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">Numbers (e.g. "Top 5") stop the scroll effectively.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main >

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 243, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 243, 255, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 243, 255, 0.6);
                }
                .font-numeric {
                    font-variant-numeric: tabular-nums;
                }
            `}</style>
            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div >
    );
}

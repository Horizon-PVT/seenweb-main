
// pages/tools/x-trend-hunter/index.tsx
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
    Globe,
    Search,
    Zap,
    Terminal,
    Repeat,
    AlertCircle,
    FileText,
    Video,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    TrendingUp,
    Hash,
    Copy,
    Check
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function XHotNewsFetcherPro() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State
    const [loading, setLoading] = useState(false);
    const [genLoading, setGenLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('System Ready. Standby for scan...');
    const [errorDetail, setErrorDetail] = useState('');

    const [trends, setTrends] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedTrend, setSelectedTrend] = useState<any>(null);
    const [scripts, setScripts] = useState<any[]>([]);
    const [targetLang, setTargetLang] = useState('EN');
    const [regionId, setRegionId] = useState('23424977'); // Default to US
    const [regionName, setRegionName] = useState('United States');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [selectedAngle, setSelectedAngle] = useState<'explain' | 'celeb' | 'tools' | 'expose' | 'future'>('explain');

    // Auth check
    useEffect(() => {
        if (status === 'unauthenticated') router.push('/');
        if (status === 'authenticated' && (session?.user as any).role !== 'ADMIN') {
            router.push('/');
        }
    }, [status, session, router]);

    // FILTERING & PAGINATION LOGIC
    const filteredTrends = selectedCategory === 'All'
        ? trends
        : trends.filter(t => t.category === selectedCategory);

    const totalPages = Math.ceil(filteredTrends.length / ITEMS_PER_PAGE);
    const currentTrends = filteredTrends.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const uniqueCategories = ['All', ...Array.from(new Set(trends.map(t => t.category || 'Uncategorized')))].filter(Boolean);

    const handleScan = async () => {
        setLoading(true);
        setStatusMsg('Initializing connection to X-Node (RapidAPI)...');
        setErrorDetail('');
        setTrends([]);
        setSelectedCategory('All');
        setSelectedTrend(null);
        setCurrentPage(1);

        try {
            const res = await fetch(`/api/admin/tools/trends?woeid=${regionId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch trends');

            setStatusMsg('Analyzing trend data & classifying topics...');
            setTrends(data.trends || []);
            setRegionName(data.region || 'Unknown');
            setStatusMsg(`Successfully engaged. Found ${data.trends?.length || 0} active vectors in ${data.region}.`);

        } catch (e: any) {
            setStatusMsg('Connection Failed');
            setErrorDetail(e.message);
        }
        setLoading(false);
    };

    const handleGenerate = async (type: 'shorts' | 'long') => {
        if (!selectedTrend) return;
        setGenLoading(true);
        setErrorDetail('');
        setStatusMsg(`Deploying AI Agent (Gemini 2.5 Flash) for [${type.toUpperCase()}] generation...`);

        try {
            const res = await fetch('/api/admin/tools/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trends: [selectedTrend],
                    lang: targetLang,
                    type,
                    angle: selectedAngle
                })
            })

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'AI Generation Protocol Failed');

            if (data.scripts) {
                setScripts(prev => [...data.scripts, ...prev]);
                setStatusMsg('Script payload received and decoded successfully.');
            }
        } catch (e: any) {
            setStatusMsg('AI Protocol Error');
            setErrorDetail(e.message);
        }
        setGenLoading(false);
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (status === 'loading') return <div className="min-h-screen bg-[#050510] flex items-center justify-center text-cyan-500 font-mono tracking-widest">SYSTEM INITIALIZING...</div>;
    if ((session?.user as any)?.role !== 'ADMIN') return null;

    return (
        <>
            <Head>
                <title>X-Hunter Pro | SeenYT Console</title>
            </Head>

            <div className="h-screen bg-[#050510] text-gray-200 font-sans flex flex-col overflow-hidden selection:bg-cyan-500/30">

                {/* 1. TOP BAR */}
                <header className="px-6 py-0 border-b border-white/5 bg-[#0a0a16]/50 backdrop-blur-md z-50 h-[60px] flex-shrink-0 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/?tool=developer" className="text-gray-500 hover:text-cyan-400 transition-colors text-sm font-mono tracking-tighter">
                            {"< BACK_TO_BASE"}
                        </Link>
                        <div className="h-8 w-px bg-white/10"></div>
                        <h1 className="font-black text-xl text-white flex items-center gap-2 tracking-wide uppercase">
                            <Globe size={20} className="text-cyan-500 animate-pulse-slow" />
                            <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">X-Hunter</span>
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">{regionName.toUpperCase()}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Region Selector */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setRegionId('23424977')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${regionId === '23424977' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                🇺🇸 USA
                            </button>
                            <button
                                onClick={() => setRegionId('1')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${regionId === '1' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                🌍 GLOBAL
                            </button>
                        </div>

                        {/* Language Selector */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                            {['EN', 'JP', 'KR', 'ES', 'CN', 'VN'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setTargetLang(lang)}
                                    className={`w-8 h-7 flex items-center justify-center rounded-md text-[10px] font-bold transition-all ${targetLang === lang
                                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                        : 'text-gray-600 hover:text-gray-300'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* 2. MAIN GRID LAYOUT */}
                <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">

                    {/* COL 1: DATA FEED (Left) */}
                    <div className="col-span-3 border-r border-white/5 bg-[#0a0a16] flex flex-col relative group">

                        {/* Control Bar */}
                        <div className="p-4 border-b border-white/5 bg-black/20">
                            <button
                                onClick={handleScan}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group/btn ${loading
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-cyan-400 hover:scale-[1.01]'
                                    }`}
                            >
                                {loading && <Repeat className="animate-spin" size={16} />}
                                {!loading && <Zap className="text-black group-hover/btn:fill-black" size={16} />}
                                <span className="tracking-wider">{loading ? 'SCANNING...' : 'SCAN NETWORK'}</span>
                            </button>
                        </div>

                        {/* Category Filter */}
                        {trends.length > 0 && (
                            <div className="px-4 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-white/5 flex gap-2">
                                {uniqueCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                                        className={`text-[10px] px-3 py-1.5 rounded-full border transition-all font-medium ${selectedCategory === cat
                                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                                            : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {trends.length === 0 && !loading && (
                                <div className="h-40 flex flex-col items-center justify-center text-gray-700 text-xs border border-dashed border-white/10 rounded-xl m-4">
                                    <Globe size={24} className="mb-2 opacity-20" />
                                    <span>Signal Lost. Initiate Scan.</span>
                                </div>
                            )}

                            {currentTrends.map((trend, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedTrend(trend)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 group relative ${selectedTrend?.name === trend.name
                                        ? 'bg-cyan-900/10 border-cyan-500/50 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]'
                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-bold text-sm line-clamp-1 ${selectedTrend?.name === trend.name ? 'text-cyan-300' : 'text-gray-300'}`}>
                                            {trend.name}
                                        </h4>
                                        <span className={`text-[10px] font-mono px-1.5 rounded ${i < 3 ? 'bg-red-500/20 text-red-400' : 'text-gray-600'}`}>
                                            #{((currentPage - 1) * ITEMS_PER_PAGE) + i + 1}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end mt-3">
                                        <div className="flex flex-col gap-1">
                                            {trend.tweet_volume && (
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <TrendingUp size={10} className="text-green-500" />
                                                    {(trend.tweet_volume / 1000).toFixed(1)}k
                                                </span>
                                            )}
                                            {trend.category && (
                                                <span className="text-[9px] text-gray-500 hidden group-hover:block transition-all animate-fade-in">
                                                    {trend.category}
                                                </span>
                                            )}
                                        </div>
                                        <a
                                            href={trend.url}
                                            target="_blank"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-cyan-400 transition-colors"
                                        >
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {trends.length > 0 && (
                            <div className="p-3 border-t border-white/5 bg-black/20 flex justify-between items-center text-[10px] font-mono text-gray-500">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="p-1 hover:text-white disabled:opacity-20"><ChevronLeft size={14} /></button>
                                <span>PAGE {currentPage}/{totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} className="p-1 hover:text-white disabled:opacity-20"><ChevronRight size={14} /></button>
                            </div>
                        )}
                    </div>

                    {/* COL 2: ACTION CENTER (Middle) */}
                    <div className="col-span-5 bg-[#050510] relative flex flex-col">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>

                        {!selectedTrend ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center z-10">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                                    <Zap size={48} className="text-gray-700" />
                                </div>
                                <h3 className="text-xl font-light text-gray-400 mb-2">Awaiting Target Selection</h3>
                                <p className="text-sm font-mono text-gray-600 max-w-xs">Select a trending topic from the left frequency list to initiate the script generation node.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col p-10 z-10 animate-fade-in-up">
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="mb-10 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4">
                                            <Hash size={12} /> TARGET ACQUIRED
                                        </div>
                                        <h2 className="text-5xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-xl">{selectedTrend.name}</h2>
                                        <div className="flex items-center justify-center gap-4 text-sm text-gray-400 font-mono">
                                            <span>{selectedTrend.category || 'Unclassified'}</span>
                                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                            <span>{regionName}</span>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <label className="text-[10px] font-bold text-gray-500 mb-3 block text-center uppercase tracking-widest">Select Narrative Angle</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'explain', label: '1. EXPLAIN', desc: 'Simple Breakdown', color: 'blue' },
                                                { id: 'celeb', label: '2. CELEB', desc: 'Famous Figures', color: 'purple' },
                                                { id: 'tools', label: '3. TOOLS', desc: 'AI & Promo', color: 'green' },
                                                { id: 'expose', label: '4. EXPOSE', desc: 'Hidden Truth', color: 'red' },
                                                { id: 'future', label: '5. FUTURE', desc: 'Prediction', color: 'yellow' },
                                            ].map((angle) => (
                                                <button
                                                    key={angle.id}
                                                    onClick={() => setSelectedAngle(angle.id as any)}
                                                    className={`p-2 rounded-lg border text-left transition-all ${selectedAngle === angle.id
                                                        ? `bg-${angle.color}-500/20 border-${angle.color}-500 text-${angle.color}-400 shadow-lg shadow-${angle.color}-500/10`
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                                        }`}
                                                >
                                                    <div className="text-xs font-bold">{angle.label}</div>
                                                    <div className="text-[9px] opacity-70">{angle.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleGenerate('shorts')}
                                            disabled={genLoading}
                                            className="py-4 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 hover:border-pink-500/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex flex-col items-center gap-2 relative z-10">
                                                <Video className="text-pink-500 group-hover:scale-110 transition-transform" size={24} />
                                                <span className="font-bold text-white text-sm">SHORTS (60s)</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleGenerate('long')}
                                            disabled={genLoading}
                                            className="py-4 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex flex-col items-center gap-2 relative z-10">
                                                <FileText className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                                                <span className="font-bold text-white text-sm">LONG VIDEO</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {errorDetail && (
                                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 text-red-200 text-xs font-mono shadow-inner">
                                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="block mb-1 text-red-400">EXECUTION ERROR</strong>
                                            {errorDetail}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status Footer */}
                        <div className="p-3 border-t border-white/5 bg-[#0a0a16] text-[10px] font-mono text-gray-500 flex justify-between items-center z-10">
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${loading || genLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                                {statusMsg}
                            </span>
                            <span>GEMINI 2.5 FLASH [CONNECTED]</span>
                        </div>
                    </div>

                    {/* COL 3: TERMINAL OUTPUT (Right) */}
                    <div className="col-span-4 bg-[#0a0a10] border-l border-white/5 flex flex-col">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0d0d15]">
                            <h3 className="font-mono font-bold text-gray-400 text-xs flex items-center gap-2">
                                <Terminal size={12} className="text-cyan-500" />
                                SCRIPT_CONSOLE
                            </h3>
                            <span className="text-[10px] text-gray-600">{scripts.length} OUTPUTS</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                            {scripts.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-700 text-xs font-mono opacity-50">
                                    <div className="w-16 h-16 border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center mb-4">
                                        <span className="animate-pulse">_</span>
                                    </div>
                                    Awaiting Data Stream...
                                </div>
                            )}

                            {scripts.map((script, i) => (
                                <div key={i} className="rounded-lg border border-white/10 bg-[#0f0f1a] overflow-hidden shadow-2xl animate-in slide-in-from-right-4 duration-500">

                                    {/* Script Header */}
                                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide ${script.type === 'shorts' ? 'bg-pink-500 text-black' : 'bg-blue-500 text-black'}`}>
                                                {script.type?.toUpperCase() || 'RAW'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(script.content ? `${script.title}\n\n${script.content}` : JSON.stringify(script, null, 2), i)}
                                            className={`p-1.5 rounded hover:bg-white/10 transition-all ${copiedIndex === i ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                                            title="Copy to Clipboard"
                                        >
                                            {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>

                                    {/* Script Content */}
                                    <div className="p-4">
                                        <h4 className="font-bold text-white text-sm mb-3 loading-relaxed">{script.title}</h4>
                                        <div className="bg-[#050510] p-3 rounded border border-white/5 text-xs font-mono text-gray-400 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {script.content || JSON.stringify(script, null, 2)}
                                        </div>
                                    </div>

                                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Global Styles for this Page */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #050510; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333; 
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555; 
                }
            `}</style>
        </>
    );
}


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
    Check,
    Activity,
    Server,
    Wifi
} from 'lucide-react';

const ITEMS_PER_PAGE = 10; // Denser list

export default function XHotNewsFetcherPro() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State
    const [loading, setLoading] = useState(false);
    const [genLoading, setGenLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('SYSTEM STANDBY');
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

    // Mock System Stats
    const [ping, setPing] = useState(24);
    useEffect(() => {
        const interval = setInterval(() => setPing(Math.floor(Math.random() * 20) + 15), 2000);
        return () => clearInterval(interval);
    }, []);


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
        setStatusMsg('CONNECTING TO X-NODE...');
        setErrorDetail('');
        setTrends([]);
        setSelectedCategory('All');
        setSelectedTrend(null);
        setCurrentPage(1);

        try {
            const res = await fetch(`/api/admin/tools/trends?woeid=${regionId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch trends');

            setStatusMsg('ANALYZING VECTORS...');
            setTrends(data.trends || []);
            setRegionName(data.region || 'Unknown');
            setStatusMsg(`SCAN COMPLETE. ${data.trends?.length || 0} TARGETS IDENTIFIED.`);

        } catch (e: any) {
            setStatusMsg('CONNECTION FAILED');
            setErrorDetail(e.message);
        }
        setLoading(false);
    };

    const handleGenerate = async (type: 'shorts' | 'long') => {
        if (!selectedTrend) return;
        setGenLoading(true);
        setErrorDetail('');
        setStatusMsg(`DEPLOYING AGENT >> ${type.toUpperCase()} GEN...`);

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
                setStatusMsg('PAYLOAD RECEIVED.');
            }
        } catch (e: any) {
            setStatusMsg('PROTOCOL ERROR');
            setErrorDetail(e.message);
        }
        setGenLoading(false);
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (status === 'loading') return <div className="min-h-screen bg-[#000] flex items-center justify-center text-cyan-500 font-mono tracking-widest text-xs">INITIALIZING SYSTEM...</div>;
    if ((session?.user as any)?.role !== 'ADMIN') return null;

    return (
        <>
            <Head>
                <title>X-Hunter Terminal | SeenYT</title>
            </Head>

            <div className="h-screen bg-black text-gray-300 font-mono flex flex-col overflow-hidden selection:bg-cyan-900 selection:text-cyan-100">

                {/* 0. CRT EFFECT OVERLAY */}
                <div className="pointer-events-none fixed inset-0 z-[100] opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

                {/* 1. TOP STATUS BAR (Bloomberg Style) */}
                <header className="px-6 py-3 border-b border-gray-800 bg-[#050505] z-50 flex-shrink-0 flex justify-between items-center text-xs tracking-wider uppercase">
                    <div className="flex items-center gap-6">
                        <Link href="/?tool=developer" className="text-gray-500 hover:text-cyan-500 transition-colors flex items-center gap-2 font-bold">
                            <ChevronLeft size={14} /> BASE
                        </Link>
                        <div className="flex items-center gap-2 text-cyan-500 font-bold text-sm">
                            <Globe size={16} className="animate-pulse" />
                            X-TREND INTELLIGENCE
                        </div>
                        <div className="h-4 w-px bg-gray-800"></div>
                        <div className="text-gray-500 font-bold">
                            REGION: <span className="text-white">{regionName}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 font-bold">
                        <div className="flex gap-4 text-gray-600">
                            <span className="flex items-center gap-2"><Wifi size={14} /> PING: {ping}ms</span>
                            <span className="flex items-center gap-2"><Server size={14} /> CONNECTED</span>
                            <span className="flex items-center gap-2"><Activity size={14} /> {loading ? 'BUSY' : 'IDLE'}</span>
                        </div>

                        {/* Status Light */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${loading || genLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <span className={loading || genLoading ? 'text-yellow-500' : 'text-green-500'}>{statusMsg}</span>
                        </div>
                    </div>
                </header>

                {/* 2. MAIN GRID LAYOUT */}
                <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden divide-x divide-gray-800">

                    {/* COL 1: DATA FEED (Left) - Denser, High Contrast */}
                    <div className="col-span-3 bg-[#020202] flex flex-col relative">
                        <div className="p-3 border-b border-gray-800 flex gap-2">
                            <button
                                onClick={handleScan}
                                disabled={loading}
                                className={`flex-1 py-2 text-xs font-bold border border-cyan-900/50 text-cyan-500 hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors uppercase ${loading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                {loading ? 'SCANNING...' : '[ SCAN_NETWORK ]'}
                            </button>
                            <div className="flex bg-gray-900 border border-gray-800">
                                {['EN', 'JP', 'VN'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setTargetLang(lang)}
                                        className={`px-3 py-1 text-xs font-bold ${targetLang === lang ? 'bg-cyan-900 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Ticker */}
                        {trends.length > 0 && (
                            <div className="px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-gray-800 bg-gray-900/30 flex gap-2">
                                {uniqueCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                                        className={`text-xs px-3 py-1 border ${selectedCategory === cat ? 'border-cyan-700 text-cyan-400 bg-cyan-900/10' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Dense List */}
                        <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-600">
                            {trends.length === 0 && !loading && (
                                <div className="p-8 text-center text-gray-700 text-xs">
                                    NO SIGNAL
                                </div>
                            )}

                            {currentTrends.map((trend, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedTrend(trend)}
                                    className={`px-4 py-3 border-b border-gray-800 cursor-pointer group hover:bg-white/5 transition-colors ${selectedTrend?.name === trend.name ? 'bg-cyan-900/20 border-l-4 border-l-cyan-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold line-clamp-1 ${selectedTrend?.name === trend.name ? 'text-cyan-400' : 'text-gray-300'}`}>
                                            {trend.name}
                                        </h4>
                                        <span className={`text-xs font-mono opacity-50`}>
                                            {(i + 1 + (currentPage - 1) * ITEMS_PER_PAGE).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                            {trend.tweet_volume ? `${(trend.tweet_volume / 1000).toFixed(1)}K VOL` : 'N/A VOL'}
                                        </span>
                                        {selectedTrend?.name === trend.name && <span className="text-[10px] text-cyan-500 animate-pulse font-bold">ACTIVE</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="p-2 border-t border-gray-800 bg-gray-900/50 flex justify-center gap-6 text-xs text-gray-400 font-bold">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="hover:text-white disabled:opacity-30"> PREV </button>
                            <span>{currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} className="hover:text-white disabled:opacity-30"> NEXT </button>
                        </div>
                    </div>

                    {/* COL 2: ACTION CENTER (Middle) */}
                    <div className="col-span-5 bg-[#050505] relative flex flex-col">
                        {/* Grid Background */}
                        <div className="absolute inset-0 bg-[url('/images/grid-bg.png')] bg-repeat opacity-10 pointer-events-none"></div>

                        {!selectedTrend ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-800 p-8 text-center z-10">
                                <Zap size={32} className="mb-4 opacity-20" />
                                <h3 className="text-sm font-bold text-gray-700 tracking-widest uppercase mb-1">Waiting for Target</h3>
                                <p className="text-xs text-gray-800 font-mono">Select data vector from feed</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col p-6 z-10 animate-in fade-in duration-300">
                                <div className="border border-gray-800 bg-black p-6 mb-6 relative overflow-hidden">
                                    {/* Decorative corners */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>

                                    <div className="text-xs text-cyan-600 mb-2 font-black tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 bg-cyan-500 animate-ping rounded-full"></div>
                                        TARGET_LOCKED
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wide">{selectedTrend.name}</h2>
                                    <div className="grid grid-cols-2 gap-6 text-xs text-gray-500 font-mono border-t border-gray-900 pt-4">
                                        <div>CATEGORY: <span className="text-gray-300 font-bold">{selectedTrend.category || 'UNKNOWN'}</span></div>
                                        <div>VOLUME: <span className="text-gray-300 font-bold">{selectedTrend.tweet_volume || 0}</span></div>
                                        <div>URL: <a href={selectedTrend.url} target="_blank" className="text-cyan-600 hover:underline truncate block font-bold">OPEN SOURCE ↗</a></div>
                                        <div>REGION: <span className="text-gray-300 font-bold">{regionName}</span></div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="text-xs font-bold text-gray-500 mb-3 block uppercase tracking-widest">NARRATIVE_ANGLE</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'explain', label: 'EXPLAINER', color: 'text-blue-400 border-blue-900' },
                                            { id: 'celeb', label: 'CELEBRITY', color: 'text-purple-400 border-purple-900' },
                                            { id: 'tools', label: 'TECH/AI', color: 'text-green-400 border-green-900' },
                                            { id: 'expose', label: 'EXPOSE', color: 'text-red-400 border-red-900' },
                                            { id: 'future', label: 'PREDICTION', color: 'text-yellow-400 border-yellow-900' },
                                        ].map((angle) => (
                                            <button
                                                key={angle.id}
                                                onClick={() => setSelectedAngle(angle.id as any)}
                                                className={`py-3 px-2 border text-xs font-bold uppercase transition-all ${selectedAngle === angle.id
                                                    ? `bg-gray-900 ${angle.color}`
                                                    : 'bg-transparent border-gray-800 text-gray-600 hover:border-gray-600 hover:text-gray-400'
                                                    }`}
                                            >
                                                {angle.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <button
                                        onClick={() => handleGenerate('shorts')}
                                        disabled={genLoading}
                                        className="py-4 bg-cyan-900/20 border border-cyan-900/50 text-cyan-400 text-sm font-bold hover:bg-cyan-900/40 transition-all uppercase tracking-wider relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <Video size={16} /> SHORTS GEN
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => handleGenerate('long')}
                                        disabled={genLoading}
                                        className="py-4 bg-blue-900/20 border border-blue-900/50 text-blue-400 text-sm font-bold hover:bg-blue-900/40 transition-all uppercase tracking-wider relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <FileText size={16} /> VIDEO DOC
                                        </span>
                                    </button>
                                </div>

                                {errorDetail && (
                                    <div className="mt-4 text-xs font-mono text-red-500 bg-red-950/20 p-3 border border-red-900/50">
                                        ERROR :: {errorDetail}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* COL 3: TERMINAL OUTPUT (Right) */}
                    <div className="col-span-4 bg-[#0a0a0f] flex flex-col border-l border-gray-800">
                        <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d]">
                            <h3 className="font-mono font-bold text-gray-500 text-xs flex items-center gap-2 uppercase">
                                <Terminal size={14} /> OUTPUT_LOG
                            </h3>
                            <span className="text-xs text-gray-700 font-bold">{scripts.length} BLOCKS</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono">
                            {scripts.length === 0 && (
                                <div className="text-gray-800 text-xs text-center mt-20">
                                    &gt; WAITING FOR INPUT STREAM...<br />
                                    &gt; SYSTEM READY.<span className="animate-pulse">_</span>
                                </div>
                            )}

                            {scripts.map((script, i) => (
                                <div key={i} className="mb-6 text-sm font-mono group">
                                    <div className="text-gray-500 text-xs mb-2 flex items-center gap-2 border-b border-gray-800 pb-2 border-dashed">
                                        <span className="text-cyan-600 font-bold">[{script.type?.toUpperCase()}]</span>
                                        <span>{new Date().toLocaleTimeString()}</span>
                                        <button
                                            onClick={() => copyToClipboard(script.content ? `${script.title}\n\n${script.content}` : JSON.stringify(script, null, 2), i)}
                                            className={`ml-auto hover:text-cyan-400 ${copiedIndex === i ? 'text-green-500' : ''}`}
                                        >
                                            {copiedIndex === i ? 'COPIED' : 'CPY'}
                                        </button>
                                    </div>
                                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed opacity-90">
                                        <span className="text-yellow-500 font-bold block mb-1 text-base">{script.title}</span>
                                        {script.content}
                                    </div>
                                    <div className="text-gray-800 text-[10px] mt-2 text-right group-hover:text-cyan-900 transition-colors">
                                        END_OF_BLOCK
                                    </div>
                                </div>
                            ))}
                            {/* Typing cursor at the end if generating */}
                            {genLoading && <div className="text-cyan-500 text-sm animate-pulse">_</div>}
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                /* Optional: Custom scrollbar for webkit */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: #000;
                }
                ::-webkit-scrollbar-thumb {
                    background: #222;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #444;
                }
            `}</style>
        </>
    );
}

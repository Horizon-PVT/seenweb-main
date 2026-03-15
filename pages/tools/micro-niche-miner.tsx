
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Compass,
    Search,
    ArrowLeft,
    TrendingUp,
    DollarSign,
    Activity,
    Layers,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Globe,
    Flag
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';

// --- TYPES (Strictly Preserved from Original) ---
interface NicheData {
    nicheName: string;
    overallScore: number;
    competitionScore: number;
    searchVolumeScore: number;
    monetizationScore: number;
    longTermViabilityScore: number;
    peakTimingForecast: string;
    communitySentimentAnalysis: string;
    pioneerVideoTopics: string[];
    miningScript: {
        tone: string;
        frequency: string;
        monetizationGoal: string;
    };
    lowFloorChannels: {
        name: string;
        url?: string;
        subscribers: string;
        thumbnail?: string;
    }[];
    saturatedNichesWarning: string[];
}

interface OutputData {
    topNiches: NicheData[];
}

type TargetMarket = 'VN' | 'US';

const MARKET_OPTIONS: { value: TargetMarket; label: string; flag: string; desc: string }[] = [
    { value: 'VN', label: 'Việt Nam', flag: '🇻🇳', desc: 'Ngách Việt, CPM thấp' },
    { value: 'US', label: 'Quốc tế (US)', flag: '🌎', desc: 'Global, CPM cao' },
];

// --- HELPER COMPONENTS ---

const GoldLoader: React.FC<{ market: TargetMarket }> = ({ market }) => (
    <div className="flex flex-col items-center justify-center p-12">
        <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-[#CDAD5A]/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
            <div className="absolute inset-0 border-4 border-t-[#CDAD5A] border-r-transparent border-b-[#008080] border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
            <Compass className="absolute inset-0 m-auto text-[#CDAD5A] animate-pulse" size={40} />
        </div>
        <h3 className="text-[#CDAD5A] font-black text-xl tracking-[0.2em] animate-pulse">
            {market === 'VN' ? 'ĐANG KHAI THÁC...' : 'MINING DATA...'}
        </h3>
        <p className="text-[#008080] text-sm mt-2 font-mono">
            {market === 'VN' ? 'Phân tích tầng sâu thị trường Việt Nam' : 'Deep scanning US/Global market layers'}
        </p>
    </div>
);

const GoldNicheCard: React.FC<{ niche: NicheData; delay: number; market: TargetMarket }> = ({ niche, delay, market }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isVN = market === 'VN';

    // Animating entrance
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay * 150);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={`
                relative bg-black/40 border border-[#CDAD5A]/20 hover:border-[#CDAD5A]/60 rounded-xl overflow-hidden transition-all duration-500
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                group hover:shadow-[0_0_30px_rgba(205,173,90,0.1)]
            `}
        >
            {/* Top Gold Bar Decor */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#CDAD5A] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-[#F4E2AA] uppercase max-w-[70%] leading-tight">
                        {niche.nicheName}
                    </h3>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-[#008080] uppercase tracking-wider">SCORE</span>
                        <span className={`text-3xl font-black ${niche.overallScore >= 8 ? 'text-[#00ffcc]' : 'text-[#CDAD5A]'}`}>
                            {niche.overallScore.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#050b14] p-2 rounded border border-[#CDAD5A]/10">
                        <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Activity size={10} /> {isVN ? 'Cạnh tranh' : 'Competition'}</div>
                        <div className={`font-bold text-lg ${niche.competitionScore <= 40 ? 'text-green-400' : 'text-yellow-400'}`}>{niche.competitionScore}/100</div>
                    </div>
                    <div className="bg-[#050b14] p-2 rounded border border-[#CDAD5A]/10">
                        <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Search size={10} /> {isVN ? 'Tìm kiếm' : 'Volume'}</div>
                        <div className={`font-bold text-lg ${niche.searchVolumeScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{niche.searchVolumeScore}/100</div>
                    </div>
                    <div className="bg-[#050b14] p-2 rounded border border-[#CDAD5A]/10">
                        <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={10} /> {isVN ? 'Kiếm tiền' : 'Money'}</div>
                        <div className={`font-bold text-lg ${niche.monetizationScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{niche.monetizationScore}/100</div>
                    </div>
                    <div className="bg-[#050b14] p-2 rounded border border-[#CDAD5A]/10">
                        <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><TrendingUp size={10} /> {isVN ? 'Bền vững' : 'Long-term'}</div>
                        <div className={`font-bold text-lg ${niche.longTermViabilityScore >= 75 ? 'text-green-400' : 'text-yellow-400'}`}>{niche.longTermViabilityScore}/100</div>
                    </div>
                </div>

                {/* EXPAND TOGGLE */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full py-2 bg-[#CDAD5A]/10 hover:bg-[#CDAD5A]/20 text-[#CDAD5A] text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 border border-[#CDAD5A]/20"
                >
                    {isOpen ? (isVN ? 'THU GỌN' : 'COLLAPSE') : (isVN ? 'XEM CHI TIẾT' : 'SHOW DETAILS')}
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* EXPANDED CONTENT */}
            {isOpen && (
                <div className="bg-black/60 border-t border-[#CDAD5A]/20 p-6 text-sm space-y-6 animate-in slide-in-from-top-4 duration-300">

                    {/* Forecast */}
                    <div>
                        <h4 className="flex items-center gap-2 text-[#008080] font-bold mb-2 uppercase text-[10px] tracking-wider">
                            <Compass size={12} /> {isVN ? 'Dự báo thời điểm' : 'Peak Timing'}
                        </h4>
                        <p className="text-gray-300 text-xs leading-relaxed border-l-2 border-[#008080] pl-3">
                            {niche.peakTimingForecast}
                        </p>
                    </div>

                    {/* Sentiment */}
                    <div>
                        <h4 className="flex items-center gap-2 text-[#CDAD5A] font-bold mb-2 uppercase text-[10px] tracking-wider">
                            <Activity size={12} /> {isVN ? 'Tâm lý thị trường' : 'Sentiment'}
                        </h4>
                        <p className="text-gray-300 text-xs leading-relaxed border-l-2 border-[#CDAD5A] pl-3">
                            {niche.communitySentimentAnalysis}
                        </p>
                    </div>

                    {/* Topics */}
                    <div>
                        <h4 className="flex items-center gap-2 text-white font-bold mb-2 uppercase text-[10px] tracking-wider">
                            <Layers size={12} /> {isVN ? 'Video tiên phong' : 'Pioneer Topics'}
                        </h4>
                        <ul className="space-y-1.5">
                            {niche.pioneerVideoTopics.slice(0, 5).map((topic, i) => (
                                <li key={i} className="flex gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-default">
                                    <span className="text-[#CDAD5A] font-bold tabular-nums">0{i + 1}.</span>
                                    {topic}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Strategy Box */}
                    <div className="bg-[#CDAD5A]/5 border border-[#CDAD5A]/10 rounded p-3">
                        <h4 className="text-[#CDAD5A] font-bold mb-2 uppercase text-[10px] tracking-wider flex items-center gap-2">
                            ⚡ {isVN ? 'Chiến lược khai thác' : 'Mining Strategy'}
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-xs text-gray-300">
                            <div className="flex justify-between border-b border-[#CDAD5A]/10 pb-1"><span>TONE</span> <span className="text-white font-medium text-right">{niche.miningScript.tone}</span></div>
                            <div className="flex justify-between border-b border-[#CDAD5A]/10 pb-1"><span>FREQ</span> <span className="text-white font-medium text-right">{niche.miningScript.frequency}</span></div>
                            <div className="flex justify-between"><span>GOAL</span> <span className="text-white font-medium text-right">{niche.miningScript.monetizationGoal}</span></div>
                        </div>
                    </div>

                    {/* Warning */}
                    {niche.saturatedNichesWarning.length > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-red-900/10 border border-red-500/20 rounded">
                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                            <div>
                                <h4 className="text-red-500 font-bold text-[10px] uppercase mb-1">{isVN ? 'Cảnh báo bão hòa' : 'Saturation Warning'}</h4>
                                <p className="text-red-400/80 text-[10px]">{niche.saturatedNichesWarning.join(', ')}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function MicroNicheMinerPage() {
    const router = useRouter();
    const [input, setInput] = useState('');
    const [market, setMarket] = useState<TargetMarket>('VN');
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<OutputData | null>(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const isVN = market === 'VN';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setOutput(null);

        try {
            const response = await fetch('/api/youtube', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'micro', // STRICTLY KEEPING ORIGINAL LOGIC
                    macroNiche: input.trim(),
                    targetMarket: market,
                }),
            });

            const data = await response.json();

            if (response.ok && data.topNiches && Array.isArray(data.topNiches)) {
                // Formatting data just in case, similar to original component logic expectation
                setOutput(data as OutputData);
            } else {
                const errRaw = data?.error || '';
                const errStr = String(errRaw).toUpperCase();

                // ONLY show upgrade for SPECIFIC plan errors, NOT system errors
                const isPlanError = errStr.includes('PLAN_LOCKED') || errMsg.includes('REQUIRE_UPGRADE') || errStr.includes('FREE_QUOTA_EXCEEDED') || errStr.includes('DAILY_QUOTA_EXCEEDED');
                if (response.status === 403 && isPlanError) {
                    setShowUpgrade(true);
                } else {
                    console.error('Miner API Error:', errRaw);
                    alert(errRaw || 'Có lỗi xảy ra, vui lòng thử lại.');
                }
            }
        } catch (error: any) {
            console.error('Miner Network Error:', error);
            alert('Lỗi kết nối, vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#CDAD5A] font-sans selection:bg-[#CDAD5A] selection:text-black">
            <Head>
                <title>GOLD MINER | NICHE INTELLIGENCE</title>
            </Head>

            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#CDAD5A]/20 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/?tool=tools_research" className="flex items-center gap-2 text-[#CDAD5A]/60 hover:text-[#CDAD5A] transition-colors">
                        <ArrowLeft size={18} /> <span className="text-xs font-bold tracking-widest uppercase">HQ_RETURN</span>
                    </Link>
                    <div className="h-6 w-px bg-[#CDAD5A]/20"></div>
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-[#CDAD5A]/10 rounded border border-[#CDAD5A]/30">
                            <Compass size={16} />
                        </div>
                        <h1 className="text-sm font-black tracking-[0.2em] text-white">NICHE_MINER_PRO</h1>
                    </div>
                </div>

                {/* Market Toggle */}
                <div className="flex bg-black/60 rounded border border-[#CDAD5A]/20 p-1">
                    {MARKET_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setMarket(opt.value)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all
                                ${market === opt.value
                                    ? 'bg-[#CDAD5A] text-black shadow-[0_0_10px_rgba(205,173,90,0.4)]'
                                    : 'text-gray-500 hover:text-[#CDAD5A]'
                                }
                            `}
                        >
                            <span className="text-base leading-none">{opt.flag}</span>
                            <span className="hidden sm:inline">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* MAIN */}
            <main className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
                        <span className="text-[#CDAD5A]">DIGITAL GOLD</span> MINE
                    </h2>
                    <p className="text-gray-500 text-sm max-w-xl mx-auto font-mono">
                        {isVN
                            ? 'Hệ thống khai thác dữ liệu thị trường ngách tầng sâu. Tìm kiếm cơ hội CPM cao.'
                            : 'Deep layer niche market data mining system. Discover high CPM opportunities.'}
                    </p>
                </div>

                {/* SEARCH INPUT */}
                <div className="max-w-2xl mx-auto mb-16 relative z-10">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#CDAD5A] to-[#008080] rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative bg-[#0a0a0a] border border-[#CDAD5A]/30 rounded-lg p-1.5 flex shadow-2xl">
                            <div className="pl-4 flex items-center justify-center text-[#CDAD5A]/50">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={isVN ? "Nhập chủ đề lớn (VD: Tài chính, AI, Sức khỏe...)" : "Enter macro niche (e.g., Finance, AI, Health...)"}
                                className="flex-grow bg-transparent border-none outline-none text-white px-4 py-3 font-medium placeholder-gray-600"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#CDAD5A] hover:bg-[#E5C565] text-black font-black uppercase text-xs tracking-widest px-8 py-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'MINING...' : (isVN ? 'KHAI THÁC' : 'MINE DATA')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RESULTS AREA */}
                {isLoading && (
                    <div className="animate-in fade-in duration-500">
                        <GoldLoader market={market} />
                    </div>
                )}

                {!isLoading && output && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {output.topNiches.map((niche, i) => (
                            <GoldNicheCard key={i} niche={niche} delay={i} market={market} />
                        ))}
                    </div>
                )}

                {/* Empty State Decor */}
                {!isLoading && !output && (
                    <div className="flex flex-col items-center justify-center opacity-20 py-20 pointer-events-none">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="w-20 h-32 border border-[#CDAD5A] rounded"></div>
                            <div className="w-20 h-32 border border-[#CDAD5A] rounded translate-y-4"></div>
                            <div className="w-20 h-32 border border-[#CDAD5A] rounded"></div>
                        </div>
                        <p className="text-[#CDAD5A] font-black text-6xl tracking-widest opacity-20">NO DATA</p>
                    </div>
                )}
            </main>

            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#CDAD5A .5px, transparent .5px), linear-gradient(90deg, #CDAD5A .5px, transparent .5px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>
            <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-0"></div>
            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

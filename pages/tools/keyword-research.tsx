import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
    Search,
    BarChart2,
    TrendingUp,
    Shield,
    Lock,
    Zap,
    ChevronLeft,
    Activity,
    Target,
    Globe,
    Cpu,
    Filter,
    Download,
    HelpCircle,
    X,
    Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

// --- MOCK DATA ---
const MOCK_DATA = {
    keyword: "cách làm youtube",
    overallScore: 72,
    volume: "15,400",
    competition: "Low",
    competitionScore: 24,
    trendData: [40, 35, 60, 55, 70, 65, 80, 75, 90, 85, 95, 100], // Last 12 months
    related: [
        { keyword: "làm youtube kiếm tiền", volume: "12,100", competition: "Medium", score: 65, trend: "up" },
        { keyword: "hướng dẫn làm youtube 2026", volume: "8,500", competition: "Very Low", score: 89, trend: "up" },
        { keyword: "cách edit video youtube", volume: "22,000", competition: "High", score: 45, trend: "down" },
        { keyword: "ý tưởng kênh youtube", volume: "5,300", competition: "Low", score: 71, trend: "stable" },
        { keyword: "kiếm tiền online", volume: "150,000", competition: "Very High", score: 12, trend: "up" },
        { keyword: "thiết bị làm youtube", volume: "2,100", competition: "Low", score: 68, trend: "up" },
        { keyword: "nhạc không bản quyền", volume: "45,000", competition: "Medium", score: 55, trend: "stable" },
    ]
};

// --- COMPONENTS ---
import GuideModal from '@/components/GuideModal'; // Assuming GuideModal is also external or keeping it if local for now.
import UpgradeModal from '@/components/UpgradeModal';

// 1. Sparkline Chart (SVG)
const Sparkline = ({ data, color = "#CDAD5A" }: { data: number[], color?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="3"
                points={points}
                vectorEffect="non-scaling-stroke"
            />
            <path
                d={`M 0 100 L ${points.split(' ')[0]} ${points} L 100 100 Z`}
                fill={color}
                fillOpacity="0.1"
            />
        </svg>
    );
};

// 2. Score Gauge
const ScoreGauge = ({ score }: { score: number }) => {
    const getColor = (s: number) => {
        if (s >= 70) return '#00ffb4';
        if (s >= 40) return '#CDAD5A';
        return '#ef4444';
    };
    const color = getColor(score);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                    cx="50%"
                    cy="50%"
                    r="40"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                    cx="50%"
                    cy="50%"
                    r="40"
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{score}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color }}>{score >= 70 ? 'Excellent' : score >= 40 ? 'Fair' : 'Poor'}</span>
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full blur-xl opacity-20" style={{ backgroundColor: color }}></div>
        </div>
    );
};





export default function KeywordResearchPage() {
    // State
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState('');
    const [showGuide, setShowGuide] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false); // NEW STATE

    // Role is now checked server-side — no frontend bypass possible

    // --- API CALL ---
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;

        setIsSearching(true);
        setError('');
        setResult(null);

        try {
            // Artificial "Deep Analysis" Delay (1.5s) to make it feel like "Heavy Computing"
            // Also fetches data in parallel
            const [res, _] = await Promise.all([
                fetch('/api/tools/keyword-research', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        keyword: searchTerm,
                    }),
                }),
                new Promise(resolve => setTimeout(resolve, 1500))
            ]);

            const data = await res.json();

            if (!res.ok) {
                const errRaw = data?.error || '';
                const errStr = String(errRaw).toUpperCase();
                const isPlanError = errStr.includes('PLAN_LOCKED') || errMsg.includes('REQUIRE_UPGRADE') || errStr.includes('FREE_QUOTA_EXCEEDED') || errStr.includes('DAILY_QUOTA_EXCEEDED');
                if (res.status === 403 && isPlanError) {
                    setShowUpgrade(true);
                    setIsSearching(false);
                    return;
                }
                throw new Error(data.error || 'Failed to analyze keyword');
            }

            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020408] font-sans text-gray-300 selection:bg-[#CDAD5A] selection:text-black">
            <Head>
                <title>Keyword Intelligence | SeenYT PRO</title>
            </Head>

            {/* Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="fixed top-0 inset-x-0 h-14 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors">
                        <ChevronLeft size={18} className="text-gray-400" />
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <div className="flex items-center gap-2">
                        <Target className="text-[#CDAD5A]" size={18} />
                        <span className="text-sm font-bold text-white tracking-wider">KEYWORD<span className="text-[#CDAD5A]">.IO</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                    <button
                        onClick={() => setShowGuide(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded border border-white/10 transition-colors text-xs font-bold"
                    >
                        <HelpCircle size={14} /> Hướng Dẫn
                    </button>

                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-green-500" />
                        <span>API: CONNECTED</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe size={12} className="text-blue-500" />
                        <span>REGION: GLOBAL</span>
                    </div>
                    <div className="px-2 py-1 bg-[#CDAD5A]/20 text-[#CDAD5A] border border-[#CDAD5A]/30 rounded font-bold">
                        PRO PLAN
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>

            <main className="pt-20 px-6 pb-20 container mx-auto max-w-7xl">

                {/* Search Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Keyword Intelligence</h1>
                        <p className="text-xs text-gray-500">Discovery low competition trend for your next video.</p>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-[500px] group">
                        <div className="absolute inset-0 bg-[#CDAD5A] rounded-lg blur opacity-10 group-focus-within:opacity-20 transition-opacity" />
                        <div className="relative flex items-center bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden group-focus-within:border-[#CDAD5A]/50 transition-colors">
                            <Search className="ml-4 text-gray-500" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Enter keyword to analyze..."
                                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 text-sm placeholder:text-gray-700 font-mono"
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="bg-[#CDAD5A] text-black px-6 py-3 text-sm font-bold hover:bg-[#ffe18f] transition-colors disabled:opacity-50"
                            >
                                {isSearching ? <Cpu size={16} className="animate-spin" /> : 'ANALYZE'}
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {result && !isSearching && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* TOP ROW: METRICS */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* 1. Overall Score */}
                                <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Target size={100} />
                                    </div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Overall Potential</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2 relative z-10">
                                            <div className="text-5xl font-black text-white tracking-tighter">
                                                {result.overallScore}<span className="text-2xl text-gray-600">/100</span>
                                            </div>
                                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${result.overallScore >= 70 ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                result.overallScore >= 40 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${result.overallScore >= 70 ? 'bg-green-400' : result.overallScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                                                    }`} />
                                                <span className="text-[10px] font-bold uppercase">{result.overallScore >= 70 ? 'High Potential' : 'Average'}</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <ScoreGauge score={result.overallScore} />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Volume & Competition */}
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Volume */}
                                    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 relative group hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <BarChart2 size={14} /> Avg. View Volume
                                            </h3>
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-1 font-mono">{result.volume}</div>
                                        <div className="h-16 mt-4 opacity-50 group-hover:opacity-80 transition-opacity">
                                            <Sparkline data={result.trendData} color="#00ffb4" />
                                        </div>

                                    </div>

                                    {/* Competition */}
                                    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 relative group hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Shield size={14} /> Competition (Raw)
                                            </h3>
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-2">{result.competition}</div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
                                                <span>Easy</span>
                                                <span>Hard</span>
                                            </div>
                                            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${result.competitionScore < 30 ? 'bg-green-500' : result.competitionScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${result.competitionScore}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2">
                                                Higher score indicates more saturated market.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM ROW: DATA TABLE */}
                            <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden flex flex-col relative min-h-[500px]">
                                <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Related Keywords</h3>
                                        <div className="px-2 py-0.5 rounded bg-white/5 text-xs text-gray-400 font-mono border border-white/5">
                                            {result.related.length} RESULTS
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors">
                                            <Filter size={16} />
                                        </button>
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#CDAD5A]/10 hover:bg-[#CDAD5A]/20 text-[#CDAD5A] text-xs font-bold border border-[#CDAD5A]/20 rounded transition-colors">
                                            <Download size={14} /> EXPORT CSV
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto relative flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5 bg-black/20 font-mono">
                                                <th className="p-4 font-normal">Keyword</th>
                                                <th className="p-4 font-normal">Trend</th>
                                                <th className="p-4 font-normal text-right">Volume</th>
                                                <th className="p-4 font-normal text-center">Score</th>
                                                <th className="p-4 font-normal">Competition</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm font-mono">
                                            {result.related.map((item: any, idx: number) => (
                                                <tr
                                                    key={idx}
                                                    onClick={() => item.isLocked && setShowUpgrade(true)}
                                                    className={`border-b border-white/5 transition-colors group ${item.isLocked
                                                        ? 'blur-sm select-none opacity-50 relative cursor-pointer hover:opacity-70'
                                                        : 'hover:bg-white/[0.02]'
                                                        }`}
                                                >
                                                    <td className="p-4 font-sans font-medium text-gray-300 group-hover:text-white transition-colors">
                                                        {item.isLocked ? 'HIDDEN-KEYWORD-PRO-ONLY' : item.keyword}
                                                    </td>
                                                    <td className="p-4">
                                                        {item.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                                                        {item.trend === 'down' && <TrendingUp size={14} className="text-red-500 transform rotate-180" />}
                                                        {item.trend === 'stable' && <div className="w-4 h-0.5 bg-gray-600" />}
                                                    </td>
                                                    <td className="p-4 text-right text-gray-400">
                                                        {item.volume}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {item.isLocked ? (
                                                            <Lock size={12} className="mx-auto text-[#CDAD5A]" />
                                                        ) : (
                                                            <div className={`inline-block w-8 py-0.5 rounded text-[10px] font-bold border ${item.score >= 70 ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                                item.score >= 40 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                                }`}>
                                                                {item.score}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${item.competition === 'Very High' ? 'bg-red-500' :
                                                                item.competition === 'High' ? 'bg-orange-500' :
                                                                    item.competition === 'Medium' ? 'bg-yellow-500' :
                                                                        'bg-green-500'
                                                                }`} />
                                                            <span className="text-xs text-gray-500">{item.competition}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* --- INLINE UPSELL OVERLAY --- */}
                                    {result.related.some((i: any) => i.isLocked) && (
                                        <div className="absolute inset-0 top-[120px] bg-gradient-to-b from-transparent via-[#020408]/90 to-[#020408] z-10 flex flex-col items-center justify-start pt-20 backdrop-blur-[2px]">
                                            <div className="bg-[#0f0f0f]/90 border border-[#CDAD5A] p-8 rounded-2xl shadow-[0_0_50px_rgba(205,173,90,0.15)] max-w-md text-center backdrop-blur-md transform hover:scale-[1.02] transition-transform duration-300">
                                                <div className="w-12 h-12 bg-[#CDAD5A]/20 rounded-full flex items-center justify-center text-[#CDAD5A] mx-auto mb-4 ring-1 ring-[#CDAD5A]/50">
                                                    <Lock size={24} />
                                                </div>
                                                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">
                                                    Hidden Keywords
                                                </h3>
                                                <p className="text-sm text-gray-400 mb-6">
                                                    Upgrade to <strong className="text-white">PRO</strong> to reveal <strong className="text-white">all</strong> high-potential keywords hidden in this report.
                                                </p>
                                                <Link href="/pricing" className="w-full block">
                                                    <button className="w-full py-3 bg-[#CDAD5A] hover:bg-[#ffe18f] text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-[#CDAD5A]/20">
                                                        Unlock Now
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* PRO UPSIDE FOOTER */}
                                <div className="bg-gradient-to-r from-[#CDAD5A]/5 to-transparent p-4 border-t border-[#CDAD5A]/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#CDAD5A]/20 rounded-full text-[#CDAD5A]">
                                            <Lock size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#CDAD5A] uppercase tracking-wider">Pro Insight</div>
                                            <div className="text-[10px] text-gray-500">Unlock full results and advanced metrics.</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowUpgrade(true)}
                                        className="px-4 py-2 bg-[#CDAD5A] hover:bg-[#ffe18f] text-black text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-[0_0_15px_rgba(205,173,90,0.3)]"
                                    >
                                        Upgrade Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Intro State */}
                {!result && !isSearching && (
                    <div className="mt-20 flex flex-col items-center justify-center text-center opacity-30">
                        <Cpu size={80} className="text-gray-700 mb-6 animate-pulse" />
                        <h2 className="text-2xl font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">System Ready</h2>
                        <p className="text-sm text-gray-600 max-w-md font-mono">
                            Awaiting Keyword Injection...
                        </p>
                    </div>
                )}

            </main>
        </div>
    );
}

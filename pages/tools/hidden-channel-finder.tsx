
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from "next-auth/react"; // Import useSession
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import UpgradeModal from '@/components/UpgradeModal'; // Import UpgradeModal
import {
    Search,
    ArrowLeft,
    Anchor,
    Map,
    Radar,
    TrendingUp,
    PlayCircle,
    Users,
    Activity,
    Globe
} from 'lucide-react';

// --- TYPES (Strictly Preserved from Original) ---
interface RisingChannel {
    name: string;
    url: string;
    subscribers: string;
    growthMetric: string;
    coreStrengths: string[];
    thumbnail: string;
}

interface TrendingVideo {
    title: string;
    url: string;
    viralRatio: string;
    viralStructure: string[];
    thumbnail: string;
}

interface OutputData {
    risingChannels: RisingChannel[];
    trendingVideos: TrendingVideo[];
    upcomingTrends: string[];
}

const SonarLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
            <div className="absolute w-full h-full bg-cyan-500/20 rounded-full animate-ping"></div>
            <div className="absolute w-2/3 h-2/3 bg-cyan-500/30 rounded-full animate-ping delay-150"></div>
            <div className="absolute w-1/3 h-1/3 bg-cyan-500/50 rounded-full animate-ping delay-300"></div>
            <Radar size={48} className="text-cyan-400 relative z-10 animate-spin-slow" />
        </div>
        <h3 className="text-cyan-400 font-bold text-xl tracking-[0.2em] animate-pulse">
            SONAR SCANNING...
        </h3>
        <p className="text-cyan-600 text-sm mt-2 font-mono">
            Detecting hidden signals in the deep ocean
        </p>
    </div>
);

export default function HiddenChannelFinderPage() {
    const { data: session } = useSession(); // Access session
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [output, setOutput] = useState<OutputData | null>(null);
    const [seedQuery, setSeedQuery] = useState('');
    const [outputLanguage, setOutputLanguage] = useState('Tiếng Việt');
    const [showUpgrade, setShowUpgrade] = useState(false); // State for upgrade modal

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seedQuery.trim()) {
            setError('Please enter a keyword to start scanning.');
            return;
        }

        // --- FREEMIUM GATE CHECK ---
        const userRole = ((session?.user as any)?.role || "FREE");
        // Originally required SUPER (higher than CREATIVE)
        const allowed = ['SUPER', 'VIP', 'ADMIN'].includes(userRole);

        if (!allowed) {
            setShowUpgrade(true);
            return;
        }
        // ---------------------------

        setIsLoading(true);
        setError('');
        setOutput(null);

        try {
            const res = await fetch('/api/youtube', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'hidden', // STRICTLY KEEPING ORIGINAL LOGIC
                    macroNiche: seedQuery,
                    outputLanguage,
                }),
            });

            if (!res.ok) throw new Error('Server connection lost. Please retry.');

            const data = await res.json();

            // Data Safety Check
            data.risingChannels = Array.isArray(data.risingChannels) ? data.risingChannels : [];
            data.trendingVideos = Array.isArray(data.trendingVideos) ? data.trendingVideos : [];
            data.upcomingTrends = Array.isArray(data.upcomingTrends) ? data.upcomingTrends : [];

            setOutput(data);
        } catch (err: any) {
            setError(err.message || 'Sonar malfunction. Scan failed.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-cyan-50 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
            <Head>
                <title>BLUE OCEAN | HIDDEN CHANNEL FINDER</title>
            </Head>

            {/* Deep Sea Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)]"></div>
                <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            </div>

            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#020617]/80 backdrop-blur border-b border-cyan-900/30 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/?tool=tools_research" className="flex items-center gap-2 text-cyan-600 hover:text-cyan-400 transition-colors">
                        <ArrowLeft size={18} /> <span className="text-xs font-bold tracking-widest uppercase">HQ_RETURN</span>
                    </Link>
                    <div className="h-6 w-px bg-cyan-900/50"></div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-cyan-950 rounded-full border border-cyan-800">
                            <Anchor size={14} className="text-cyan-400" />
                        </div>
                        <h1 className="text-sm font-black tracking-[0.2em] text-white">BLUE OCEAN FINDER</h1>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="pt-24 px-6 pb-20 max-w-7xl mx-auto relative z-10">

                {/* HERO SEARCH */}
                <div className="max-w-4xl mx-auto mb-16 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-800 mb-6 uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        Deep Sea Exploration
                    </h2>
                    <p className="text-cyan-600/60 text-lg mb-8 max-w-2xl mx-auto">
                        Quét sóng sonar để tìm kiếm các kênh đang lên (Underdog) và các xu hướng ẩn chưa ai khai phá.
                    </p>

                    <form onSubmit={handleSubmit} className="relative z-20 bg-[#0f172a]/80 border border-cyan-900 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-grow">
                                <label className="block text-left text-xs font-bold text-cyan-600 mb-2 ml-1 uppercase tracking-wider">
                                    TARGET SUBJECT (Từ khóa)
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" size={20} />
                                    <input
                                        type="text"
                                        value={seedQuery}
                                        onChange={(e) => setSeedQuery(e.target.value)}
                                        placeholder="e.g. Solo Camping, AI Coding, Street Food..."
                                        className="w-full bg-[#020617] border border-cyan-900/50 rounded-xl py-4 pl-12 pr-4 text-cyan-50 placeholder-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-medium text-lg"
                                    />
                                </div>
                            </div>

                            <div className="md:w-48">
                                <label className="block text-left text-xs font-bold text-cyan-600 mb-2 ml-1 uppercase tracking-wider">
                                    LANGUAGE
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" size={20} />
                                    <select
                                        value={outputLanguage}
                                        onChange={(e) => setOutputLanguage(e.target.value)}
                                        className="w-full bg-[#020617] border border-cyan-900/50 rounded-xl py-4 pl-12 pr-4 text-cyan-50 focus:border-cyan-500 outline-none appearance-none cursor-pointer font-medium text-lg"
                                    >
                                        <option value="Tiếng Việt">Vietnam</option>
                                        <option value="English">Global (EN)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 disabled:grayscale tracking-widest flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'SCANNING OCEAN...' : 'ACTIVATE SONAR'} <Radar size={20} />
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-sm font-medium">
                                ⚠️ {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* RESULTS */}
                {isLoading && <SonarLoader />}

                {!isLoading && output && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-16">

                        {/* SECTION 1: RISING TREASURES */}
                        <div>
                            <h3 className="flex items-center gap-3 text-2xl font-black text-cyan-400 mb-8 uppercase tracking-widest border-b border-cyan-900/50 pb-4">
                                <Map size={24} /> Hidden Gems Found ({output.risingChannels.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {output.risingChannels.map((channel, i) => (
                                    <div key={i} className="group relative bg-[#0f172a]/50 border border-cyan-800/30 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                        <div className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img
                                                    src={channel.thumbnail || "https://via.placeholder.com/64"}
                                                    className="w-14 h-14 rounded-full border-2 border-cyan-500/50 shadow-lg object-cover"
                                                />
                                                <div>
                                                    <a href={channel.url} target="_blank" className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                                                        {channel.name}
                                                    </a>
                                                    <div className="flex items-center gap-2 text-xs text-cyan-600">
                                                        <Users size={12} /> {channel.subscribers} Subs
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="text-[10px] font-bold text-cyan-700 uppercase mb-1">GROWTH METRIC</div>
                                                <div className="text-emerald-400 font-bold font-mono text-sm bg-emerald-950/20 py-1 px-2 rounded inline-block border border-emerald-900/30">
                                                    {channel.growthMetric}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-[10px] font-bold text-cyan-700 uppercase">CORE STRENGTHS</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {channel.coreStrengths.map((s, idx) => (
                                                        <span key={idx} className="bg-cyan-950 text-cyan-300 text-xs px-2 py-1 rounded border border-cyan-900/50">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 2: VIRAL SIGNALS */}
                        <div>
                            <h3 className="flex items-center gap-3 text-2xl font-black text-rose-400 mb-8 uppercase tracking-widest border-b border-rose-900/50 pb-4">
                                <Activity size={24} /> Viral Signals Detected ({output.trendingVideos.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {output.trendingVideos.map((video, i) => (
                                    <a key={i} href={video.url} target="_blank" className="group block relative bg-[#0f172a]/50 border border-rose-900/30 rounded-xl overflow-hidden hover:border-rose-500/50 transition-all hover:shadow-[0_0_30px_rgba(244,63,94,0.1)] flex md:h-48">
                                        <div className="w-1/3 md:w-48 relative h-full">
                                            <img src={video.thumbnail} className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PlayCircle size={32} className="text-white drop-shadow-lg" />
                                            </div>
                                        </div>
                                        <div className="flex-1 p-5 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-tight mb-2">
                                                    {video.title}
                                                </h4>
                                                <div className="text-xs text-rose-300 bg-rose-950/30 px-2 py-1 rounded inline-block border border-rose-900/30 font-medium">
                                                    {video.viralRatio}
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">VIRAL FACTOR</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {video.viralStructure.slice(0, 3).map((v, idx) => (
                                                        <span key={idx} className="text-[10px] text-gray-400 border border-gray-800 px-1.5 py-0.5 rounded">
                                                            {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 3: TREND FORECAST */}
                        <div className="bg-gradient-to-r from-emerald-950/30 to-cyan-950/30 border border-emerald-900/30 rounded-2xl p-8 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>

                            <h3 className="flex items-center gap-3 text-2xl font-black text-emerald-400 mb-6 uppercase tracking-widest relative z-10">
                                <TrendingUp size={24} /> Detected Upcoming Trends
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                {output.upcomingTrends.map((trend, i) => (
                                    <div key={i} className="bg-[#020617]/60 p-4 rounded-lg border border-emerald-900/50 flex items-center gap-4">
                                        <div className="text-4xl font-black text-emerald-800/50">0{i + 1}</div>
                                        <div className="font-bold text-emerald-100">{trend}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* UPGRADE MODAL */}
            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

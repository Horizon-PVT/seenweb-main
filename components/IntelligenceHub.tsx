import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import {
    Search,
    Brain,
    TrendingUp,
    Target,
    Lightbulb,
    BarChart3,
    Zap,
    Globe,
    Users,
    ArrowRight
} from 'lucide-react';

interface IntelResult {
    keyword: string;
    competitorChannel: string;
    market: string;
    intelligence: {
        executiveSummary: string;
        nicheAnalysis: {
            score: number;
            opportunity: string;
            risks: string[];
            bestTiming: string;
            topMicroNiches: string[];
        };
        competitorIntel: {
            strengths: string[];
            weaknesses: string[];
            untappedAngles: string[];
            entryDifficulty: string;
            estimatedTimeToRival: string;
        };
        risingOpportunities: { topic: string; reason: string; potential: string }[];
        winningStrategy: {
            step1: string;
            step2: string;
            step3: string;
            quickWin: string;
        };
        recommendedContentAngles: { title: string; hook: string; diff: string }[];
        idealVideoTypes: string[];
        estimatedCPM: string;
        nextSteps: string[];
    };
}

interface IntelligenceHubProps {
    onBack?: () => void;
}

export default function IntelligenceHub({ onBack }: IntelligenceHubProps) {
    const router = useRouter();
    const { data: session } = useSession();
    
    const [keyword, setKeyword] = useState('');
    const [competitorChannel, setCompetitorChannel] = useState('');
    const [market, setMarket] = useState('VN');
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<IntelResult | null>(null);
    const [error, setError] = useState('');
    const [showUpgrade, setShowUpgrade] = useState(false);

    // Persistence Logic
    useEffect(() => {
        const savedKeyword = localStorage.getItem('seenyt_intel_keyword');
        const savedChannel = localStorage.getItem('seenyt_intel_channel');
        if (savedKeyword) setKeyword(savedKeyword);
        if (savedChannel) setCompetitorChannel(savedChannel);
    }, []);

    useEffect(() => {
        localStorage.setItem('seenyt_intel_keyword', keyword);
        localStorage.setItem('seenyt_intel_channel', competitorChannel);
    }, [keyword, competitorChannel]);
    const [activeTab, setActiveTab] = useState<'overview' | 'niche' | 'competitor' | 'strategy'>('overview');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim() && !competitorChannel.trim()) {
            setError('Please enter a keyword or competitor channel');
            return;
        }

        setIsLoading(true);
        setError('');
        setOutput(null);

        try {
            const response = await fetch('/api/intelligence-hub', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, competitorChannel, market }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errStr = String(data.error || '').toUpperCase();
                if (response.status === 403 && (errStr.includes('PLAN_LOCKED') || errStr.includes('FREE_QUOTA') || errStr.includes('DAILY_QUOTA'))) {
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(data.error || 'Analysis failed');
            }

            setOutput(data as IntelResult);
        } catch (err: any) {
            setError(err.message || 'Failed to generate intelligence report');
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Brain },
        { id: 'niche', label: 'Niche Analysis', icon: TrendingUp },
        { id: 'competitor', label: 'Competitor Intel', icon: Target },
        { id: 'strategy', label: 'Winning Strategy', icon: Zap }
    ];

    return (
        <div className="min-h-full bg-[#050b14] text-white font-sans overflow-x-hidden p-6">
            <Head>
                <title>Intelligence Hub - SeenYT</title>
            </Head>

            {/* Hero */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                    <BarChart3 size={14} className="text-blue-400" />
                    <span className="text-blue-400 text-xs font-bold tracking-wider uppercase">Intelligence Hub</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Content Signals for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Next Move</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Unify niche, trend, competitor, and channel insights for Launch Channel and Improve Channel workflows.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Keyword / Topic</label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                placeholder="e.g. AI productivity, cooking, finance..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="bg-[#050b14] px-2 text-gray-500">OR</span></div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Competitor Channel</label>
                            <input
                                type="text"
                                value={competitorChannel}
                                onChange={e => setCompetitorChannel(e.target.value)}
                                placeholder="@channel or YouTube URL"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Market</label>
                            <div className="flex gap-2">
                                {['VN', 'US'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMarket(m)}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                                            market === m
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                                : 'bg-black/40 text-gray-500 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {m === 'VN' ? 'Vietnam' : 'US / Global'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ANALYZING...
                                </>
                            ) : (
                                <>
                                    <Search size={16} /> GENERATE INTELLIGENCE REPORT
                                </>
                            )}
                        </button>

                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    </form>
                </div>

                {/* Right: Results */}
                <div className="lg:col-span-2">
                    {/* Loading */}
                    {isLoading && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-2 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
                                <Brain className="absolute inset-0 m-auto text-blue-400" size={32} />
                            </div>
                            <p className="text-blue-400 font-bold text-lg tracking-widest animate-pulse">SYNTHESIZING INTELLIGENCE</p>
                            <p className="text-gray-500 text-xs mt-2">Running 3 AI models simultaneously...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !output && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[500px]">
                            <BarChart3 size={64} className="text-white/10 mb-6" />
                            <p className="text-white/30 font-bold text-xl">INTELLIGENCE READY</p>
                            <p className="text-white/15 text-sm mt-2">Enter keyword or competitor to begin</p>
                        </div>
                    )}

                    {/* Results */}
                    {output && output.intelligence && !isLoading && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            {/* Summary Banner */}
                            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <Brain size={24} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Executive Summary</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Market: {market}</span>
                                            {keyword && <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Topic: {keyword}</span>}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{output.intelligence.executiveSummary}</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1 overflow-x-auto">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : 'text-gray-500 hover:text-white'
                                        }`}
                                    >
                                        <tab.icon size={14} /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <TrendingUp size={20} className="text-green-400" />
                                            <h4 className="text-white font-bold text-sm">Niche Score</h4>
                                        </div>
                                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                            {output.intelligence.nicheAnalysis.score}/100
                                        </div>
                                        <p className="text-gray-400 text-xs mt-2">{output.intelligence.nicheAnalysis.opportunity.substring(0, 100)}...</p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Target size={20} className="text-purple-400" />
                                            <h4 className="text-white font-bold text-sm">Entry Difficulty</h4>
                                        </div>
                                        <div className="text-3xl font-black text-purple-400">
                                            {output.intelligence.competitorIntel.entryDifficulty}
                                        </div>
                                        <p className="text-gray-400 text-xs mt-2">
                                            Est. time to rival: {output.intelligence.competitorIntel.estimatedTimeToRival}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <BarChart3 size={20} className="text-yellow-400" />
                                            <h4 className="text-white font-bold text-sm">Est. CPM</h4>
                                        </div>
                                        <div className="text-3xl font-black text-yellow-400">
                                            {output.intelligence.estimatedCPM}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Zap size={20} className="text-orange-400" />
                                            <h4 className="text-white font-bold text-sm">Quick Win</h4>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{output.intelligence.winningStrategy.quickWin}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'niche' && output.intelligence.nicheAnalysis && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h4 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4">Top Micro Niches</h4>
                                        <div className="space-y-2">
                                            {output.intelligence.nicheAnalysis.topMicroNiches.map((niche, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                                                    <span className="text-blue-400 font-black text-sm">{String(i + 1).padStart(2, '0')}</span>
                                                    <span className="text-gray-300 text-sm">{niche}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-4">Risks</h4>
                                        <div className="space-y-2">
                                            {output.intelligence.nicheAnalysis.risks.map((risk, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span className="text-red-400">⚠</span> {risk}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-4">Rising Opportunities</h4>
                                        <div className="space-y-3">
                                            {output.intelligence.risingOpportunities.map((opp, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                        opp.potential === 'High' ? 'bg-green-500/20 text-green-400' :
                                                        opp.potential === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>{opp.potential}</span>
                                                    <div>
                                                        <div className="text-gray-200 text-sm font-medium">{opp.topic}</div>
                                                        <div className="text-gray-500 text-xs">{opp.reason}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'competitor' && output.intelligence.competitorIntel && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-green-500/20 rounded-xl p-6">
                                            <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Target size={14} /> Competitor Strengths
                                            </h4>
                                            <ul className="space-y-2">
                                                {output.intelligence.competitorIntel.strengths.map((s, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                        <span className="text-green-400 mt-1">✓</span> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-white/5 border border-red-500/20 rounded-xl p-6">
                                            <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Target size={14} /> Competitor Weaknesses
                                            </h4>
                                            <ul className="space-y-2">
                                                {output.intelligence.competitorIntel.weaknesses.map((w, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                        <span className="text-red-400 mt-1">✗</span> {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-purple-500/20 rounded-xl p-6">
                                        <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Lightbulb size={14} /> Untapped Angles
                                        </h4>
                                        <div className="space-y-3">
                                            {output.intelligence.competitorIntel.untappedAngles.map((angle, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                                                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-black text-sm">{i + 1}</div>
                                                    <span className="text-gray-200 text-sm">{angle}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4">Recommended Content Angles</h4>
                                        <div className="space-y-3">
                                            {output.intelligence.recommendedContentAngles.map((angle, i) => (
                                                <div key={i} className="p-4 bg-black/40 border border-white/10 rounded-lg">
                                                    <div className="text-purple-300 font-bold text-sm mb-1">{angle.title}</div>
                                                    <div className="text-gray-400 text-xs mb-2"><strong>Hook:</strong> {angle.hook}</div>
                                                    <div className="text-gray-500 text-xs"><strong>Diff:</strong> {angle.diff}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'strategy' && output.intelligence.winningStrategy && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6">
                                        <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-6">3-Step Winning Strategy</h4>
                                        <div className="space-y-4">
                                            {[
                                                { step: 'Step 1', text: output.intelligence.winningStrategy.step1 },
                                                { step: 'Step 2', text: output.intelligence.winningStrategy.step2 },
                                                { step: 'Step 3', text: output.intelligence.winningStrategy.step3 }
                                            ].map((item, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 border border-green-500/40 rounded-xl flex items-center justify-center text-green-400 font-black text-sm">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 p-4 bg-black/40 rounded-lg border border-white/5">
                                                        <p className="text-gray-200 text-sm leading-relaxed">{item.text}</p>
                                                    </div>
                                                    {i < 2 && <ArrowRight size={16} className="flex-shrink-0 text-gray-600 self-center" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h4 className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Zap size={14} /> Next Steps
                                        </h4>
                                        <div className="space-y-2">
                                            {output.intelligence.nextSteps.map((step, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                                    <span className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 text-xs font-bold">{i + 1}</span>
                                                    {step}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h4 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Users size={14} /> Ideal Video Types
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {output.intelligence.idealVideoTypes.map((type, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-full">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

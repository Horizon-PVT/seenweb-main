

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import {
    BarChart3,
    ChevronLeft,
    TrendingUp,
    TrendingDown,
    Eye,
    ThumbsUp,
    MessageSquare,
    Users,
    PlayCircle,
    Clock,
    Zap,
    Target,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    ExternalLink
} from 'lucide-react';

interface VideoItem {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
    engagement: string;
}

interface Analysis {
    channelHealth: { score: number; grade: string; summary: string };
    performanceMetrics: any;
    contentAnalysis: any;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    improvementRecommendations: { priority: string; recommendation: string; expectedImpact: string }[];
    competitorBenchmarks: any;
    growthForecast: any;
}

interface DashboardResult {
    channelId: string;
    channel: {
        title: string;
        thumbnail: string;
        subscribers: number;
        totalViews: number;
        videoCount: number;
        description: string;
    };
    videos: { all: VideoItem[]; top: VideoItem[]; recent: VideoItem[] };
    metrics: { avgViews: number; avgEngagement: string; totalVideos: number };
    analysis: Analysis | null;
}

export default function CreatorDashboardPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            setIsReady(true);
        }
    }, [status, router]);

    const [channelUrl, setChannelUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<DashboardResult | null>(null);
    const [error, setError] = useState('');
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'analysis' | 'recommendations'>('overview');

    if (!isReady) {
        return (
            <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center">
                <div className="animate-pulse text-indigo-400 font-bold tracking-widest">LOADING...</div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!channelUrl.trim()) {
            setError('Please enter a channel URL');
            return;
        }

        setIsLoading(true);
        setError('');
        setOutput(null);

        try {
            const response = await fetch('/api/creator-dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelUrl }),
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

            setOutput(data as DashboardResult);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze channel');
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getHealthBg = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'videos', label: 'Top Videos', icon: PlayCircle },
        { id: 'analysis', label: 'AI Analysis', icon: TrendingUp },
        { id: 'recommendations', label: 'Next Steps', icon: Zap }
    ];

    return (
        <div className="min-h-screen bg-[#0a0f14] text-white font-sans overflow-x-hidden">
            <Head>
                <title>CREATOR DASHBOARD | SEENYT</title>
            </Head>

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_#0a1628_0%,_#0a0f14_60%)]"></div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#0a0f14]/90 backdrop-blur border-b border-white/10 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={18} /> <span className="text-xs font-bold tracking-widest uppercase">EXIT</span>
                    </Link>
                    <div className="h-6 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                            <BarChart3 size={16} className="text-indigo-400" />
                        </div>
                        <h1 className="text-sm font-black tracking-[0.2em] text-white">CREATOR DASHBOARD</h1>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="pt-24 px-6 pb-20 max-w-7xl mx-auto relative z-10">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
                        <BarChart3 size={14} className="text-indigo-400" />
                        <span className="text-indigo-400 text-xs font-bold tracking-wider uppercase">Channel Analytics</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Analyze Any <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Channel</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Enter a YouTube channel URL and get AI-powered analytics: health score, video performance, SWOT analysis, and actionable recommendations.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 sticky top-24">
                            <div>
                                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Channel URL or Handle</label>
                                <input
                                    type="text"
                                    value={channelUrl}
                                    onChange={e => setChannelUrl(e.target.value)}
                                    placeholder="@channel or https://youtube.com/@..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" /> ANALYZING...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 size={16} /> ANALYZE CHANNEL
                                    </>
                                )}
                            </button>

                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                            {/* Quick Stats Preview */}
                            {output && (
                                <div className="border-t border-white/10 pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs">Subscribers</span>
                                        <span className="text-white font-bold text-sm">{formatNumber(output.channel.subscribers)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs">Total Views</span>
                                        <span className="text-white font-bold text-sm">{formatNumber(output.channel.totalViews)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs">Videos</span>
                                        <span className="text-white font-bold text-sm">{output.channel.videoCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs">Health Score</span>
                                        <span className={`font-black text-sm ${output.analysis ? getHealthColor(output.analysis.channelHealth.score) : 'text-gray-400'}`}>
                                            {output.analysis ? `${output.analysis.channelHealth.score}/100 (${output.analysis.channelHealth.grade})` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right: Results */}
                    <div className="lg:col-span-2">
                        {/* Loading */}
                        {isLoading && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center">
                                <div className="relative w-24 h-24 mb-6">
                                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                                    <div className="absolute inset-2 border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
                                    <BarChart3 className="absolute inset-0 m-auto text-indigo-400" size={32} />
                                </div>
                                <p className="text-indigo-400 font-bold text-lg tracking-widest animate-pulse">ANALYZING CHANNEL</p>
                                <p className="text-gray-500 text-xs mt-2">Fetching videos and generating insights...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !output && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[500px]">
                                <BarChart3 size={64} className="text-white/10 mb-6" />
                                <p className="text-white/30 font-bold text-xl">DASHBOARD READY</p>
                                <p className="text-white/15 text-sm mt-2">Enter a channel URL to begin analysis</p>
                            </div>
                        )}

                        {/* Results */}
                        {output && !isLoading && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                {/* Channel Banner */}
                                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={output.channel.thumbnail || 'https://via.placeholder.com/80'}
                                            alt={output.channel.title}
                                            className="w-16 h-16 rounded-full border-2 border-indigo-500/50"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-xl">{output.channel.title}</h3>
                                            <div className="flex gap-4 mt-1 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><Users size={12} /> {formatNumber(output.channel.subscribers)} subs</span>
                                                <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(output.channel.totalViews)} views</span>
                                                <span className="flex items-center gap-1"><PlayCircle size={12} /> {output.channel.videoCount} videos</span>
                                            </div>
                                        </div>
                                        {output.analysis && (
                                            <div className="text-center">
                                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                                    {output.analysis.channelHealth.score}
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Health</div>
                                                <div className={`text-lg font-black ${getHealthColor(output.analysis.channelHealth.score)}`}>
                                                    {output.analysis.channelHealth.grade}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                                activeTab === tab.id
                                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                                    : 'text-gray-500 hover:text-white'
                                            }`}
                                        >
                                            <tab.icon size={14} /> {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'overview' && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                                        {[
                                            { label: 'Avg Views', value: formatNumber(output.metrics.avgViews), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                                            { label: 'Avg Engagement', value: `${output.metrics.avgEngagement}%`, icon: ThumbsUp, color: 'text-pink-400', bg: 'bg-pink-500/20' },
                                            { label: 'Total Videos', value: output.metrics.totalVideos.toString(), icon: PlayCircle, color: 'text-purple-400', bg: 'bg-purple-500/20' },
                                            { label: 'Views/Video', value: formatNumber(Math.round(output.channel.totalViews / Math.max(output.channel.videoCount, 1))), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                                                    <stat.icon size={18} className={stat.color} />
                                                </div>
                                                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                                                <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'videos' && (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        {output.videos.top.map((video, i) => (
                                            <div key={video.id || i} className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                                                <div className="flex items-center justify-center w-12 text-2xl font-black text-gray-600">{i + 1}</div>
                                                <img src={video.thumbnail || 'https://via.placeholder.com/120'} alt={video.title} className="w-32 h-20 rounded-lg object-cover flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium text-sm line-clamp-2 mb-2">{video.title}</h4>
                                                    <div className="flex gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(video.views)}</span>
                                                        <span className="flex items-center gap-1"><ThumbsUp size={12} /> {formatNumber(video.likes)}</span>
                                                        <span className="flex items-center gap-1"><MessageSquare size={12} /> {formatNumber(video.comments)}</span>
                                                        <span className={`flex items-center gap-1 ${parseFloat(video.engagement) > 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {video.engagement}% eng.
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'analysis' && output.analysis && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        {/* SWOT */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                                <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle size={14} /> Strengths</h4>
                                                <ul className="space-y-2">
                                                    {output.analysis.strengths.map((s, i) => (
                                                        <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                                                            <span className="text-green-400 mt-0.5">+</span> {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                                <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Weaknesses</h4>
                                                <ul className="space-y-2">
                                                    {output.analysis.weaknesses.map((w, i) => (
                                                        <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                                                            <span className="text-red-400 mt-0.5">-</span> {w}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                                <h4 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp size={14} /> Opportunities</h4>
                                                <ul className="space-y-2">
                                                    {output.analysis.opportunities.map((o, i) => (
                                                        <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                                                            <span className="text-blue-400 mt-0.5">↑</span> {o}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                                <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingDown size={14} /> Threats</h4>
                                                <ul className="space-y-2">
                                                    {output.analysis.threats.map((t, i) => (
                                                        <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                                                            <span className="text-yellow-400 mt-0.5">!</span> {t}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Content Analysis */}
                                        {output.analysis.contentAnalysis && (
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                                <h4 className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-4">Content Strategy Insights</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-3 bg-black/40 rounded-lg">
                                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Best Performing Type</div>
                                                        <div className="text-gray-200 text-sm font-medium">{output.analysis.contentAnalysis.bestPerformingType}</div>
                                                    </div>
                                                    <div className="p-3 bg-black/40 rounded-lg">
                                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Optimal Upload Frequency</div>
                                                        <div className="text-gray-200 text-sm font-medium">{output.analysis.contentAnalysis.optimalUploadFrequency}</div>
                                                    </div>
                                                    <div className="p-3 bg-black/40 rounded-lg">
                                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Sweet Spot Duration</div>
                                                        <div className="text-gray-200 text-sm font-medium">{output.analysis.contentAnalysis.sweetSpotDuration}</div>
                                                    </div>
                                                    <div className="p-3 bg-black/40 rounded-lg">
                                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Best Posting Time</div>
                                                        <div className="text-gray-200 text-sm font-medium">{output.analysis.contentAnalysis.bestPostingTime}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'recommendations' && output.analysis && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        {output.analysis.improvementRecommendations.map((rec, i) => (
                                            <div key={i} className={`flex gap-4 p-5 rounded-xl border ${
                                                rec.priority === 'High' ? 'bg-green-500/10 border-green-500/30' :
                                                rec.priority === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                                'bg-gray-500/10 border-gray-500/30'
                                            }`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${
                                                    rec.priority === 'High' ? 'bg-green-500/20 text-green-400' :
                                                    rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                                                        rec.priority === 'High' ? 'text-green-400' :
                                                        rec.priority === 'Medium' ? 'text-yellow-400' :
                                                        'text-gray-400'
                                                    }`}>{rec.priority} Priority</div>
                                                    <p className="text-gray-200 text-sm leading-relaxed mb-2">{rec.recommendation}</p>
                                                    <div className="text-gray-500 text-xs"><strong>Impact:</strong> {rec.expectedImpact}</div>
                                                </div>
                                            </div>
                                        ))}

                                        {output.analysis.growthForecast && (
                                            <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/30 rounded-xl p-6">
                                                <h4 className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-4">Growth Forecast</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg">
                                                        <TrendingUp size={16} className="text-green-400 mt-0.5" />
                                                        <div>
                                                            <div className="text-green-400 text-xs font-bold uppercase mb-1">Optimistic</div>
                                                            <p className="text-gray-300 text-sm">{output.analysis.growthForecast.optimistic}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg">
                                                        <Target size={16} className="text-blue-400 mt-0.5" />
                                                        <div>
                                                            <div className="text-blue-400 text-xs font-bold uppercase mb-1">Realistic</div>
                                                            <p className="text-gray-300 text-sm">{output.analysis.growthForecast.realistic}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

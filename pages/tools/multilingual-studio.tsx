

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import {
    Languages,
    Copy,
    Check,
    ChevronLeft,
    Globe,
    Mic,
    FileText,
    Wand2,
    Download,
    ArrowRight
} from 'lucide-react';

interface MultilingualOutput {
    originalScript: string;
    translatedScripts: {
        english: string;
        spanish: string;
        french: string;
        german: string;
        portuguese: string;
        vietnamese: string;
    };
    visualPrompts: {
        english: string[];
        spanish: string[];
        french: string[];
    };
    titleOptimizations: {
        english: string[];
        spanish: string[];
        french: string[];
    };
    descriptionTemplates: {
        english: string;
        spanish: string;
        french: string;
    };
    seoKeywords: {
        english: string[];
        spanish: string[];
        french: string[];
    };
    culturalNotes: {
        english: string;
        spanish: string;
        french: string;
    };
    productionNotes: string;
}

const LANG_FLAGS: Record<string, { flag: string; name: string }> = {
    english: { flag: '🇺🇸', name: 'English (US/UK)' },
    spanish: { flag: '🇪🇸', name: 'Spanish' },
    french: { flag: '🇫🇷', name: 'French' },
    german: { flag: '🇩🇪', name: 'German' },
    portuguese: { flag: '🇧🇷', name: 'Portuguese (BR)' },
    vietnamese: { flag: '🇻🇳', name: 'Vietnamese' },
    japanese: { flag: '🇯🇵', name: 'Japanese' },
    korean: { flag: '🇰🇷', name: 'Korean' },
    chinese: { flag: '🇨🇳', name: 'Chinese (Simplified)' },
    chinese_traditional: { flag: '🇹🇼', name: 'Chinese (Traditional)' },
    hindi: { flag: '🇮🇳', name: 'Hindi' },
    arabic: { flag: '🇸🇦', name: 'Arabic' },
    indonesian: { flag: '🇮🇩', name: 'Indonesian' },
    thai: { flag: '🇹🇭', name: 'Thai' },
    italian: { flag: '🇮🇹', name: 'Italian' },
    russian: { flag: '🇷🇺', name: 'Russian' },
    turkish: { flag: '🇹🇷', name: 'Turkish' },
    polish: { flag: '🇵🇱', name: 'Polish' },
    dutch: { flag: '🇳🇱', name: 'Dutch' },
};

const contentStyles = [
    "Educational Documentary",
    "Tutorial / How-to",
    "Entertainment",
    "News / Analysis",
    "Product Review",
    "Travel Vlog"
];

export default function MultilingualStudioPage() {
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

    const [inputMode, setInputMode] = useState<'script' | 'topic'>('topic');
    const [script, setScript] = useState('');
    const [topic, setTopic] = useState('');
    const [contentStyle, setContentStyle] = useState('Educational Documentary');
    const [targetLanguages, setTargetLanguages] = useState<string[]>(['english', 'spanish', 'french']);
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<MultilingualOutput | null>(null);
    const [error, setError] = useState('');
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [activeLang, setActiveLang] = useState('english');
    const [copied, setCopied] = useState('');

    if (!isReady) {
        return (
            <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
                <div className="animate-pulse text-emerald-400 font-bold tracking-widest">LOADING...</div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const input = inputMode === 'script' ? script : topic;
        if (!input.trim()) return;

        setIsLoading(true);
        setError('');
        setOutput(null);

        try {
            const response = await fetch('/api/multilingual-studio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script: inputMode === 'script' ? input : undefined,
                    topic: inputMode === 'topic' ? input : undefined,
                    targetLanguages,
                    contentStyle
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errStr = String(data.error || '').toUpperCase();
                if (response.status === 403 && (errStr.includes('PLAN_LOCKED') || errStr.includes('FREE_QUOTA') || errStr.includes('DAILY_QUOTA'))) {
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(data.error || 'Multilingual adaptation failed');
            }

            setOutput(data as MultilingualOutput);
            if (targetLanguages.length > 0) setActiveLang(targetLanguages[0]);
        } catch (err: any) {
            setError(err.message || 'Failed to adapt content');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    const toggleLanguage = (lang: string) => {
        setTargetLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const handleExport = () => {
        if (!output) return;
        let content = `=== MULTILINGUAL CONTENT STUDIO ===

--- ORIGINAL (Vietnamese) ---
${output.originalScript}

`;

        // Export all available languages
        const availableLangs = Object.keys(output.translatedScripts).filter(
            key => output.translatedScripts[key as keyof typeof output.translatedScripts]
        );

        availableLangs.forEach(lang => {
            const langName = LANG_FLAGS[lang]?.name || lang;
            const script = output.translatedScripts[lang as keyof typeof output.translatedScripts] || '';
            const titles = output.titleOptimizations[lang as keyof typeof output.titleOptimizations] || [];
            const description = output.descriptionTemplates[lang as keyof typeof output.descriptionTemplates] || '';
            const keywords = output.seoKeywords[lang as keyof typeof output.seoKeywords] || [];
            const cultural = output.culturalNotes[lang as keyof typeof output.culturalNotes] || '';

            content += `--- ${langName.toUpperCase()} ---\n`;
            content += `Script: ${script}\n`;
            if (titles.length > 0) content += `Titles: ${titles.join(', ')}\n`;
            if (description) content += `Description: ${description}\n`;
            if (keywords.length > 0) content += `Tags: ${keywords.join(', ')}\n`;
            if (cultural) content += `Cultural Notes: ${cultural}\n`;
            content += `\n`;
        });

        content += `--- PRODUCTION NOTES ---\n${output.productionNotes}`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'multilingual_content.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const currentLang = LANG_FLAGS[activeLang] || { flag: '🌐', name: activeLang };

    return (
        <div className="min-h-screen bg-[#0f0f1a] text-white font-sans">
            <Head>
                <title>MULTILINGUAL STUDIO | SEENYT</title>
            </Head>

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_#1a0533_0%,_#0f0f1a_50%)]"></div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f0f1a]/90 backdrop-blur border-b border-white/10 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={18} /> <span className="text-xs font-bold tracking-widest uppercase">EXIT</span>
                    </Link>
                    <div className="h-6 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                            <Languages size={16} className="text-emerald-400" />
                        </div>
                        <h1 className="text-sm font-black tracking-[0.2em] text-white">MULTILINGUAL STUDIO</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {output && (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 rounded-lg transition-all"
                        >
                            <Download size={14} /> EXPORT ALL
                        </button>
                    )}
                </div>
            </header>

            {/* Main */}
            <main className="pt-24 px-6 pb-20 max-w-7xl mx-auto relative z-10">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
                        <Globe size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">Go Global</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Adapt Content for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Every Market</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Translate scripts, localize titles, optimize descriptions, and generate cultural notes for multiple languages in one click.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 sticky top-24">
                            {/* Input Mode Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Input Type</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('topic')}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                                            inputMode === 'topic' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-black/40 text-gray-500 border-white/10'
                                        }`}
                                    >
                                        <Wand2 size={14} className="mx-auto mb-1" />
                                        Topic
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('script')}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                                            inputMode === 'script' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-black/40 text-gray-500 border-white/10'
                                        }`}
                                    >
                                        <FileText size={14} className="mx-auto mb-1" />
                                        Script
                                    </button>
                                </div>
                            </div>

                            {/* Input */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                                    {inputMode === 'topic' ? 'Video Topic (Vietnamese)' : 'Original Script (Vietnamese)'}
                                </label>
                                {inputMode === 'topic' ? (
                                    <textarea
                                        value={topic}
                                        onChange={e => setTopic(e.target.value)}
                                        placeholder="Nhập chủ đề video bằng tiếng Việt..."
                                        className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                                    />
                                ) : (
                                    <textarea
                                        value={script}
                                        onChange={e => setScript(e.target.value)}
                                        placeholder="Dán kịch bản gốc tiếng Việt..."
                                        className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                                    />
                                )}
                            </div>

                            {/* Style */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content Style</label>
                                <select
                                    value={contentStyle}
                                    onChange={e => setContentStyle(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                                >
                                    {contentStyles.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Language Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                    Target Languages ({targetLanguages.length} selected)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(LANG_FLAGS).map(([key, lang]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => toggleLanguage(key)}
                                            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all border ${
                                                targetLanguages.includes(key)
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                    : 'bg-black/40 text-gray-500 border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <span>{lang.flag}</span>
                                            <span className="truncate">{lang.name.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-gray-600 text-[10px] mt-2">Select multiple languages for bulk translation</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || targetLanguages.length === 0}
                                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ADAPTING...
                                    </>
                                ) : (
                                    <>
                                        <Globe size={16} /> ADAPT CONTENT
                                    </>
                                )}
                            </button>

                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                        </form>
                    </div>

                    {/* Right: Output */}
                    <div className="lg:col-span-2">
                        {/* Loading */}
                        {isLoading && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center">
                                <div className="relative w-24 h-24 mb-6">
                                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-ping"></div>
                                    <div className="absolute inset-2 border-4 border-t-emerald-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-spin"></div>
                                    <Languages className="absolute inset-0 m-auto text-emerald-400" size={32} />
                                </div>
                                <p className="text-emerald-400 font-bold text-lg tracking-widest animate-pulse">ADAPTING FOR {targetLanguages.length} MARKETS</p>
                                <p className="text-gray-500 text-xs mt-2">Translating, localizing, and optimizing...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !output && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[500px]">
                                <Languages size={64} className="text-white/10 mb-6" />
                                <p className="text-white/30 font-bold text-xl">MULTILINGUAL STUDIO</p>
                                <p className="text-white/15 text-sm mt-2">Select languages and enter content to begin</p>
                            </div>
                        )}

                        {/* Results */}
                        {output && !isLoading && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                {/* Language Tabs */}
                                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1 overflow-x-auto">
                                    {targetLanguages.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setActiveLang(lang)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                                activeLang === lang
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'text-gray-500 hover:text-white'
                                            }`}
                                        >
                                            <span>{LANG_FLAGS[lang]?.flag || '🌐'}</span>
                                            {LANG_FLAGS[lang]?.name.split(' ')[0] || lang}
                                        </button>
                                    ))}
                                </div>

                                {/* Content per Language */}
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    {/* Script */}
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider">Translated Script</h3>
                                            <button onClick={() => handleCopy(output.translatedScripts[activeLang as keyof typeof output.translatedScripts] || '', `script_${activeLang}`)} className="text-gray-500 hover:text-white transition-colors">
                                                {copied === `script_${activeLang}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                                            {output.translatedScripts[activeLang as keyof typeof output.translatedScripts] || ''}
                                        </pre>
                                    </div>

                                    {/* Titles */}
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Optimized Titles</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {(output.titleOptimizations[activeLang as keyof typeof output.titleOptimizations] || []).map((title, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-white/5 group">
                                                    <span className="text-yellow-400 font-black text-sm flex-shrink-0">{i + 1}</span>
                                                    <span className="text-gray-200 text-sm flex-1">{title}</span>
                                                    <button onClick={() => handleCopy(title, `title_${i}`)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white flex-shrink-0">
                                                        {copied === `title_${i}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider">SEO Description</h3>
                                            <button onClick={() => handleCopy(output.descriptionTemplates[activeLang as keyof typeof output.descriptionTemplates] || '', `desc_${activeLang}`)} className="text-gray-500 hover:text-white transition-colors">
                                                {copied === `desc_${activeLang}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{output.descriptionTemplates[activeLang as keyof typeof output.descriptionTemplates] || ''}</p>
                                    </div>

                                    {/* Keywords */}
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-4">SEO Keywords</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(output.seoKeywords[activeLang as keyof typeof output.seoKeywords] || []).map((kw, i) => (
                                                <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs rounded-full">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visual Prompts */}
                                    {output.visualPrompts[activeLang as keyof typeof output.visualPrompts] && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                            <h3 className="text-pink-400 font-bold text-sm uppercase tracking-wider mb-4">AI Video Prompts</h3>
                                            <div className="space-y-2">
                                                {output.visualPrompts[activeLang as keyof typeof output.visualPrompts]?.map((prompt, i) => (
                                                    <div key={i} className="group relative p-3 bg-black/40 rounded-lg border border-white/5">
                                                        <div className="text-[10px] text-pink-400 font-bold mb-1">PROMPT {i + 1}</div>
                                                        <p className="text-gray-300 text-xs font-mono">{prompt}</p>
                                                        <button onClick={() => handleCopy(prompt, `vp_${i}`)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white">
                                                            {copied === `vp_${i}` ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Cultural Notes */}
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-4">Cultural Notes</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">{output.culturalNotes[activeLang as keyof typeof output.culturalNotes] || ''}</p>
                                    </div>
                                </div>

                                {/* Production Notes */}
                                {output.productionNotes && (
                                    <div className="bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 border border-emerald-500/30 rounded-xl p-6">
                                        <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-3">Cross-Cultural Production Notes</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">{output.productionNotes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 4px; }
            `}</style>

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

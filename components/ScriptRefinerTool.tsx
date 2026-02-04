// File: components/ScriptRefinerTool.tsx
// UNIFIED: Same UI and logic as Homepage (pages/tools/script-refiner.tsx)

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import DOMPurify from 'dompurify';
import {
    ArrowLeft,
    FileText,
    Zap,
    Copy,
    Download,
    Repeat,
    Check,
    SplitSquareHorizontal,
    MessageSquare,
    Sparkles,
    Maximize2,
    Minimize2
} from 'lucide-react';

// --- TYPES ---
interface OutputData {
    refinedScript: string;
    diffScript: string;
    metrics: {
        uniqueness: string;
        similarity: string;
        readTime: string;
        wordCount: number;
    };
}

interface ScriptRefinerToolProps {
    onBack?: () => void;
}

export default function ScriptRefinerTool({ onBack }: ScriptRefinerToolProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const isEN = router.locale === 'en';

    // --- STATE ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [originalScript, setOriginalScript] = useState('');
    const [output, setOutput] = useState<OutputData | null>(null);
    const [diffView, setDiffView] = useState(false);
    const [rewriteLevel, setRewriteLevel] = useState('Standard');
    const [optimizeGoal, setOptimizeGoal] = useState('Engagement');
    const [language, setLanguage] = useState('Original');
    const [initialChatRequest, setInitialChatRequest] = useState('');
    const [iterativeChatRequest, setIterativeChatRequest] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- HANDLERS ---
    const handleCopy = () => {
        if (output?.refinedScript) {
            navigator.clipboard.writeText(output.refinedScript).then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            });
        }
    };

    const handleExport = () => {
        if (!output?.refinedScript) return;
        const blob = new Blob([output.refinedScript], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'refined-script.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- API: INITIAL REWRITE (Fixed to use API-based quota) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!originalScript) {
            setError("Please enter original content.");
            return;
        }

        setIsLoading(true);
        setError('');
        setOutput(null);
        setCopySuccess('');

        try {
            const response = await fetch('/api/script-refiner-initial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalScript,
                    rewriteLevel,
                    optimizeGoal,
                    language,
                    initialChatRequest,
                }),
            });

            const result: any = await response.json();

            // FIX: Check for PLAN errors and show modal (API-based quota)
            if (!response.ok) {
                const errRaw = result?.error || '';
                const errStr = String(errRaw).toUpperCase();

                if (response.status === 403 || errStr.includes('PLAN') || errStr.includes('QUOTA') || errStr.includes('LOCKED') || errStr.includes('LIMIT')) {
                    setShowUpgrade(true);
                    setIsLoading(false);
                    return;
                }
                throw new Error(result.error || `Error ${response.status}`);
            }

            if (!result.refinedScript || !result.diffScript || !result.metrics) {
                throw new Error("Invalid API response structure.");
            }

            setOutput(result as OutputData);

        } catch (err: any) {
            const errStr = String(err.message || '').toUpperCase();
            if (errStr.includes('PLAN') || errStr.includes('QUOTA') || errStr.includes('LOCKED') || errStr.includes('LIMIT')) {
                setShowUpgrade(true);
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- API: ITERATIVE CHAT ---
    const handleIterativeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!iterativeChatRequest || !output?.refinedScript) return;

        setIsLoading(true);
        setError('');
        const currentScriptForRequest = output.refinedScript;
        const requestText = iterativeChatRequest;
        setIterativeChatRequest('');

        try {
            const response = await fetch('/api/script-refiner-iterative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentScript: currentScriptForRequest,
                    iterativeChatRequest: requestText,
                }),
            });

            const editedScriptText = await response.text();

            if (!response.ok) {
                let errorMessage = `Error ${response.status}: ${editedScriptText}`;
                try { errorMessage = JSON.parse(editedScriptText).error || errorMessage; } catch (e) { }
                throw new Error(errorMessage);
            }

            setOutput(prev => prev ? { ...prev, refinedScript: editedScriptText } : null);

        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-full bg-gray-50 text-gray-900 font-sans flex flex-col transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : ''} notranslate`} translate="no">
            {/* HEADER */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="text-gray-500 hover:text-black transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-100 p-1.5 rounded">
                            <Sparkles size={16} className="text-emerald-600" />
                        </div>
                        <h1 className="text-sm font-bold tracking-wide uppercase text-gray-800">Script Refiner AI</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
                        title="Toggle Fullscreen Focus"
                    >
                        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-600">
                        {isLoading ? 'Processing...' : 'Ready'}
                    </div>
                </div>
            </header>

            {/* MAIN EDITOR AREA */}
            <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">

                {/* LEFT: INPUT */}
                <div className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${output ? 'lg:w-1/2' : 'lg:w-full max-w-4xl mx-auto border-r-0'}`}>
                    <div className="p-6 flex-grow flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FileText size={14} /> Original Draft
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept=".txt,.md,.srt,.vtt"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onClick={(e) => (e.currentTarget.value = '')}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const text = event.target?.result;
                                            if (typeof text === 'string') {
                                                setOriginalScript(text);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline cursor-pointer flex items-center gap-1"
                                >
                                    <Download size={12} className="rotate-180" /> Import File
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={originalScript}
                            onChange={e => setOriginalScript(e.target.value)}
                            placeholder="Paste your rough script, transcript, or import a text file..."
                            className="flex-grow w-full resize-none outline-none text-base leading-relaxed text-gray-700 placeholder-gray-300"
                        />
                    </div>

                    {/* CONTROL BAR */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Rewrite Level</label>
                                <select value={rewriteLevel} onChange={e => setRewriteLevel(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none">
                                    <option value="Minor">Minor Polish (Fix grammar)</option>
                                    <option value="Standard">Standard (Improve flow)</option>
                                    <option value="Complete">Complete Overhaul (Rewrite)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Goal</label>
                                <select value={optimizeGoal} onChange={e => setOptimizeGoal(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none">
                                    <option value="Engagement">Maximize Engagement</option>
                                    <option value="Clarity">Maximize Clarity</option>
                                    <option value="SEO">SEO Optimization</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Language</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none">
                                    <option value="Original">Keep Original</option>
                                    <option value="English">English (United States)</option>
                                    <option value="Tiếng Việt">Vietnamese</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 items-end">
                            <div className="flex-grow">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Custom Instruction (Optional)</label>
                                <input
                                    type="text"
                                    value={initialChatRequest}
                                    onChange={e => setInitialChatRequest(e.target.value)}
                                    placeholder="e.g. Make it sound more like a TED Talk..."
                                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !originalScript}
                                className="bg-emerald-600 text-white font-bold py-2 px-6 rounded shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
                            >
                                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Zap size={18} />}
                                Refine
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    </div>
                </div>

                {/* RIGHT: OUTPUT */}
                {output && (
                    <div className="flex flex-col lg:w-1/2 bg-white animate-in slide-in-from-right duration-500">
                        {/* METRICS HEADER */}
                        <div className="bg-gray-50 border-b border-gray-200 p-4 grid grid-cols-4 gap-4">
                            {[
                                { label: 'Uniqueness', value: output.metrics.uniqueness, color: 'text-emerald-600' },
                                { label: 'Similarity', value: output.metrics.similarity, color: 'text-blue-600' },
                                { label: 'Read Time', value: output.metrics.readTime, color: 'text-gray-700' },
                                { label: 'Words', value: output.metrics.wordCount, color: 'text-gray-700' },
                            ].map((m, i) => (
                                <div key={i} className="text-center">
                                    <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
                                    <div className="text-[10px] uppercase text-gray-400 font-bold">{m.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* CONTENT */}
                        <div className="flex-grow relative overflow-hidden flex flex-col bg-slate-50">
                            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white p-1 rounded-full shadow border border-gray-200">
                                <button
                                    onClick={() => setDiffView(false)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!diffView ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Final
                                </button>
                                <button
                                    onClick={() => setDiffView(true)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${diffView ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Diff
                                </button>
                            </div>

                            <div ref={outputRef} className="flex-grow overflow-y-auto p-8 font-serif text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                                    </div>
                                )}

                                {diffView ? (
                                    <div
                                        className="diff-content"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output.diffScript) }}
                                    />
                                ) : output.refinedScript}
                            </div>

                            {/* CHAT BAR */}
                            <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                                <form onSubmit={handleIterativeSubmit} className="flex gap-2 relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <MessageSquare size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={iterativeChatRequest}
                                        onChange={e => setIterativeChatRequest(e.target.value)}
                                        placeholder="Ask for changes (e.g. 'Shorten the intro', 'Make it funnier')..."
                                        className="pl-10 flex-grow bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!iterativeChatRequest || isLoading}
                                        className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        <Repeat size={16} />
                                    </button>
                                </form>

                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex gap-2">
                                        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                            {copySuccess ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            {copySuccess || 'Copy'}
                                        </button>
                                        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                            <Download size={14} /> Export
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">AI Model: Gemini 1.5 Pro</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx global>{`
                .diff-content del {
                    background-color: #fee2e2;
                    text-decoration: none;
                    color: #b91c1c;
                    padding: 0 2px;
                }
                .diff-content ins {
                    background-color: #dcfce7;
                    text-decoration: none;
                    color: #15803d;
                    padding: 0 2px;
                }
            `}</style>

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Lock, Play, FileText, CheckCircle, Loader2 } from 'lucide-react';

import { NICHE_LIBRARY, Niche } from '@/data/niche-library';

// --- ACCESS CONTROL LOGIC ---
// ALL USERS: Index 0-4 (5 niches free)
// PRO (SUPER/VIP/ADMIN): All niches
const isNicheLocked = (nicheIndex: number, userRole: string) => {
    // PRO+ users get all niches
    if (['ADMIN', 'SUPER', 'VIP'].includes(userRole)) return false;
    // All users (FREE, CREATIVE) get first 5 niches (index 0-4)
    return nicheIndex > 4; // Lock from 6th item (index 5)
};

export default function NicheEnginePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const userRole = (session?.user as any)?.role || 'FREE';

    // STATE
    const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
    const [currentStep, setCurrentStep] = useState(0); // 0: Select, 1: Info, 2: Analyze, 3: Script...

    // AI STATE
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [scriptResult, setScriptResult] = useState('');

    // STEP HANDLERS
    const handleSelectNiche = (niche: Niche, index: number) => {
        if (isNicheLocked(index, userRole)) {
            alert("Vui lòng nâng cấp lên gói PRO để mở khóa toàn bộ 20 ngách!");
            return;
        }
        setSelectedNiche(niche);
        setCurrentStep(1);
    };

    const handleAnalyze = async () => {
        if (!selectedNiche) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/tools/niche-engine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'ANALYZE',
                    nicheSlug: selectedNiche.slug,
                    nicheTitle: selectedNiche.title
                })
            });
            const data = await res.json();
            setAnalysisResult(data.content);
            setCurrentStep(2);
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối AI. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateScript = async () => {
        if (!selectedNiche) return;
        if (!analysisResult) {
            alert("Vui lòng chạy Phân Tích trước!");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/tools/niche-engine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'GENERATE_SCRIPT',
                    nicheSlug: selectedNiche.slug,
                    context: analysisResult
                })
            });
            const data = await res.json();
            setScriptResult(data.content);
            setCurrentStep(3);
        } catch (e) {
            console.error(e);
            alert("Lỗi khi sinh kịch bản.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            if (currentStep === 1) {
                setSelectedNiche(null);
                setCurrentStep(0);
            } else {
                setCurrentStep(currentStep - 1);
            }
        } else {
            router.push('/dashboard');
        }
    };

    // --- RENDER HELPERS ---
    const renderNicheCard = (niche: Niche, index: number) => {
        const locked = isNicheLocked(index, userRole);
        const isRecommended = index === 0; // First niche is recommended

        return (
            <div
                key={niche.id}
                onClick={() => handleSelectNiche(niche, index)}
                className={`
                    relative group rounded-lg border px-4 py-3 transition-all cursor-pointer h-full flex flex-col justify-between
                    ${isRecommended && !locked
                        ? 'bg-[#1a2a1f] border-emerald-500/40 hover:border-emerald-400 ring-1 ring-emerald-500/20 hover:shadow-lg hover:shadow-emerald-900/20'
                        : locked
                            ? 'bg-[#151515] border-white/5 opacity-70 hover:opacity-100'
                            : 'bg-[#1e1e1e] border-white/10 hover:border-emerald-500/50 hover:bg-[#252525] hover:shadow-lg hover:shadow-emerald-900/10'
                    }
                `}
            >
                <div>
                    {/* BADGES ROW */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {isRecommended && (
                            <span className="text-[9px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                🔥 Được đề xuất
                            </span>
                        )}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${niche.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : niche.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {niche.difficulty}
                        </span>
                        {niche.isPro && (
                            <span className="text-[9px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-1.5 py-0.5 rounded">PRO</span>
                        )}
                    </div>

                    {/* TITLE */}
                    <h3 className={`font-bold text-base mb-1 leading-tight ${locked ? 'text-gray-500' : 'text-gray-100 group-hover:text-emerald-400'}`}>
                        {niche.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-gray-400 text-xs line-clamp-2 mb-2 leading-relaxed">
                        {niche.shortDesc}
                    </p>

                    {/* RECOMMENDED MICROCOPY */}
                    {isRecommended && !locked && (
                        <p className="text-[10px] text-emerald-400/80 italic mb-2">
                            Phù hợp nhất để bắt đầu với long video.
                        </p>
                    )}

                    {/* PRO MICROCOPY */}
                    {niche.isPro && (
                        <p className="text-[9px] text-gray-500 italic">
                            Mở toàn bộ ngách nâng cao & ngách mới.
                        </p>
                    )}
                </div>

                {/* META */}
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-2">
                    <span className="bg-white/5 px-1.5 py-0.5 rounded">⏱ {niche.avgDuration}</span>
                </div>

                {/* LOCK OVERLAY */}
                {locked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-3 rounded-lg z-10 transition-opacity">
                        <Lock className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase">Khóa PRO</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white font-sans selection:bg-emerald-500/30">
            <Head>
                <title>Long Video Engine | SeenYT Studio</title>
            </Head>

            {/* HEADER */}
            <div className="border-b border-white/5 bg-[#0F0F0F] sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
                <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="font-bold text-base tracking-tight flex items-center gap-2">
                                <span className="text-emerald-500">❖</span>
                                {selectedNiche ? selectedNiche.title : "Thư viện ngách thắng 100%"}
                            </h1>
                        </div>
                    </div>
                    {selectedNiche && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStep >= 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5'}`}>1. Info</span>
                            <span className="text-gray-700">→</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStep >= 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5'}`}>2. Analysis</span>
                            <span className="text-gray-700">→</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStep >= 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5'}`}>3. Script</span>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <main className="max-w-[1920px] mx-auto px-4 lg:px-8 py-6">

                {/* MODE 0: GRID LIST */}
                {(!selectedNiche) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* HEADER SECTION */}
                        <div className="mb-6 text-center max-w-3xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                                Chọn Ngách Để Bắt Đầu
                            </h2>
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                Bạn không cần nghĩ nên làm ngách gì.<br />
                                Chọn ngách đang thắng → bấm phân tích → nhận playbook long video hoàn chỉnh:<br />
                                <span className="text-emerald-400 font-medium">kịch bản, prompt và cách triển khai.</span>
                            </p>
                            <p className="text-gray-500 text-xs mt-3 max-w-xl mx-auto leading-relaxed">
                                Hệ thống chia thành nhiều bước để tránh quá tải AI và lỗi văn bản dài.
                                Bạn chủ động bấm từng bước để kiểm soát chất lượng output.
                            </p>
                        </div>

                        {/* RESPONSIVE 5-COLUMN GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {NICHE_LIBRARY.map((niche, idx) => renderNicheCard(niche, idx))}
                        </div>
                    </div>
                )}

                {/* MODE 1+: WORKSPACE */}
                {selectedNiche && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-300">

                        {/* LEFT PANEL: STATIC INFO */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5 sticky top-20">
                                <h3 className="text-xl font-bold mb-4 text-emerald-400">Tổng Quan Ngách</h3>
                                <div className="space-y-4 text-sm text-gray-300">
                                    <div className="p-3 bg-black/20 rounded-lg">
                                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Mô tả</div>
                                        {selectedNiche.shortDesc}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-black/20 rounded-lg">
                                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Độ dài</div>
                                            {selectedNiche.avgDuration}
                                        </div>
                                        <div className="p-3 bg-black/20 rounded-lg">
                                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Rating</div>
                                            {selectedNiche.difficulty}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs uppercase font-bold mb-2">Thẻ Tags</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNiche.tags.map(t => (
                                                <span key={t} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">#{t}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ACTION BUTTONS */}
                                    <div className="pt-4 border-t border-white/5 space-y-3">
                                        {currentStep === 1 && (
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={isLoading}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
                                                PHÂN TÍCH NGÁCH
                                            </button>
                                        )}
                                        {currentStep === 2 && (
                                            <button
                                                onClick={handleGenerateScript}
                                                disabled={isLoading}
                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                SINH KỊCH BẢN CHI TIẾT
                                            </button>
                                        )}
                                        {currentStep === 3 && (
                                            <div className="text-center p-2 bg-green-500/10 text-green-400 rounded border border-green-500/20 font-bold flex items-center justify-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Hoàn Tất
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL: AI CONTENT */}
                        <div className="lg:col-span-8 min-h-[600px] bg-[#0d0d0d] rounded-2xl border border-white/5 relative overflow-hidden">

                            {/* PLACEHOLDER */}
                            {currentStep === 1 && !isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-50">
                                    <Play className="w-16 h-16 mb-4" />
                                    <p className="text-lg font-medium">Bấm "Phân Tích Ngách" để bắt đầu AI Engine</p>
                                </div>
                            )}

                            {/* LOADING OVERLAY */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                                    <p className="text-emerald-400 font-mono animate-pulse">AI đang suy nghĩ & phân tích dữ liệu...</p>
                                </div>
                            )}

                            {/* CONTENT RENDERER - STYLED */}
                            <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                                {currentStep === 2 && analysisResult && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2">
                                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
                                            <h3 className="text-emerald-400 font-bold m-0 text-sm uppercase flex items-center gap-2">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                Kết Quả Phân Tích Ngách
                                            </h3>
                                        </div>
                                        <div className="niche-content space-y-6">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ children }) => (
                                                        <div className="bg-gradient-to-r from-emerald-900/30 to-transparent border-l-4 border-emerald-500 px-4 py-3 mb-4 rounded-r-lg">
                                                            <h1 className="text-xl font-bold text-emerald-400 m-0">{children}</h1>
                                                        </div>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 mb-3 mt-6">
                                                            <h2 className="text-lg font-bold text-amber-400 m-0 flex items-center gap-2">
                                                                <span className="text-amber-500">▸</span> {children}
                                                            </h2>
                                                        </div>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="text-base font-bold text-cyan-400 mt-4 mb-2 border-b border-cyan-500/20 pb-1">{children}</h3>
                                                    ),
                                                    p: ({ children }) => (
                                                        <p className="text-gray-300 leading-relaxed mb-3 pl-2">{children}</p>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="space-y-2 my-3 pl-4">{children}</ul>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="text-gray-300 flex items-start gap-2">
                                                            <span className="text-emerald-500 mt-1.5">•</span>
                                                            <span>{children}</span>
                                                        </li>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="text-white font-semibold">{children}</strong>
                                                    ),
                                                    code: ({ children }) => (
                                                        <code className="bg-black/50 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                                                    ),
                                                }}
                                            >
                                                {analysisResult}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && scriptResult && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2">
                                        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 mb-6 sticky top-0 z-10 backdrop-blur-md">
                                            <h3 className="text-indigo-400 font-bold m-0 text-sm uppercase flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Gói Kịch Bản Hoàn Chỉnh
                                            </h3>
                                        </div>
                                        <div className="niche-content space-y-6">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ children }) => (
                                                        <div className="bg-gradient-to-r from-indigo-900/30 to-transparent border-l-4 border-indigo-500 px-4 py-3 mb-4 rounded-r-lg">
                                                            <h1 className="text-xl font-bold text-indigo-400 m-0">{children}</h1>
                                                        </div>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 mb-3 mt-8">
                                                            <h2 className="text-lg font-bold text-amber-400 m-0 flex items-center gap-2">
                                                                <span className="text-amber-500">📌</span> {children}
                                                            </h2>
                                                        </div>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="text-base font-semibold text-purple-400 mt-5 mb-2 bg-purple-500/5 px-3 py-2 rounded-lg border-l-2 border-purple-500">{children}</h3>
                                                    ),
                                                    h4: ({ children }) => (
                                                        <h4 className="text-sm font-bold text-teal-400 mt-4 mb-1">{children}</h4>
                                                    ),
                                                    p: ({ children }) => (
                                                        <p className="text-gray-300 leading-relaxed mb-3 pl-2">{children}</p>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="space-y-2 my-3 pl-4 border-l border-white/10">{children}</ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="space-y-2 my-3 pl-4 list-decimal list-inside">{children}</ol>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="text-gray-300 flex items-start gap-2">
                                                            <span className="text-indigo-400 mt-1">›</span>
                                                            <span className="flex-1">{children}</span>
                                                        </li>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="text-yellow-300 font-semibold">{children}</strong>
                                                    ),
                                                    em: ({ children }) => (
                                                        <em className="text-gray-400 italic">{children}</em>
                                                    ),
                                                    code: ({ children }) => (
                                                        <code className="bg-black/50 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                                                    ),
                                                    pre: ({ children }) => (
                                                        <pre className="bg-black/70 p-4 rounded-lg overflow-x-auto my-4 border border-white/5">{children}</pre>
                                                    ),
                                                    hr: () => (
                                                        <hr className="my-8 border-white/10" />
                                                    ),
                                                }}
                                            >
                                                {scriptResult}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* CUSTOM SCROLLBAR STYLES */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.02);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
}

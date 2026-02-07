import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Lock, Play, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { NICHE_LIBRARY, Niche } from '@/data/niche-library';
import UpgradeModal from '@/components/UpgradeModal';
import { AnimatePresence } from 'framer-motion';

interface NicheEngineToolProps {
    onBack: () => void;
}

// --- ACCESS CONTROL LOGIC ---
const isNicheLocked = (nicheIndex: number, userRole: string) => {
    if (['ADMIN', 'PRO'].includes(userRole)) return false;
    return nicheIndex > 4; // Lock from 6th item (index 5)
};

const NicheEngineTool: React.FC<NicheEngineToolProps> = ({ onBack }) => {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'FREE';

    // STATE
    const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    // AI STATE
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [scriptResult, setScriptResult] = useState('');
    const [showUpgrade, setShowUpgrade] = useState(false);

    // HANDLERS
    const handleSelectNiche = (niche: Niche, index: number) => {
        if (isNicheLocked(index, userRole)) {
            setShowUpgrade(true);
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
            if (!res.ok) {
                const errStr = String(data?.error || '').toUpperCase();
                if (res.status === 403 && (errStr.includes('PLAN_LOCKED') || errStr.includes('QUOTA_EXCEEDED'))) {
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(data?.error || 'Lỗi phân tích ngách');
            }
            setAnalysisResult(data.content);
            setCurrentStep(2);
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Lỗi kết nối AI. Vui lòng thử lại.");
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
            if (!res.ok) {
                const errStr = String(data?.error || '').toUpperCase();
                if (res.status === 403 && (errStr.includes('PLAN_LOCKED') || errStr.includes('QUOTA_EXCEEDED'))) {
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(data?.error || 'Lỗi sinh kịch bản');
            }
            setScriptResult(data.content);
            setCurrentStep(3);
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Lỗi khi sinh kịch bản.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInternalBack = () => {
        if (currentStep > 0) {
            if (currentStep === 1) {
                setSelectedNiche(null);
                setCurrentStep(0);
            } else {
                setCurrentStep(currentStep - 1);
            }
        } else {
            onBack();
        }
    };

    // RENDER HELPERS
    const renderNicheCard = (niche: Niche, index: number) => {
        const locked = isNicheLocked(index, userRole);
        const isRecommended = index === 0;

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

                    <h3 className={`font-bold text-base mb-1 leading-tight ${locked ? 'text-gray-500' : 'text-gray-100 group-hover:text-emerald-400'}`}>
                        {niche.title}
                    </h3>

                    <p className="text-gray-400 text-xs line-clamp-2 mb-2 leading-relaxed">
                        {niche.shortDesc}
                    </p>

                    {isRecommended && !locked && (
                        <p className="text-[10px] text-emerald-400/80 italic mb-2">
                            Phù hợp nhất để bắt đầu với long video.
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-2">
                    <span className="bg-white/5 px-1.5 py-0.5 rounded">⏱ {niche.avgDuration}</span>
                </div>

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
        <div className="h-full flex flex-col bg-[#0F0F0F] text-white font-sans overflow-hidden">
            {/* HEADER TOOL STYLE */}
            <div className="flex justify-between items-center px-6 py-4 bg-[#111] border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-900/30 rounded-lg">
                        <span className="text-xl">🏆</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            {selectedNiche ? selectedNiche.title : "Thư viện ngách thắng 100%"}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {selectedNiche && (
                        <div className="flex items-center gap-2 text-xs text-gray-400 mr-4">
                            <span className={`px-2 py-0.5 rounded-full ${currentStep >= 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5'}`}>1. Info</span>
                            <span>→</span>
                            <span className={`px-2 py-0.5 rounded-full ${currentStep >= 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5'}`}>2. Analysis</span>
                            <span>→</span>
                            <span className={`px-2 py-0.5 rounded-full ${currentStep >= 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5'}`}>3. Script</span>
                        </div>
                    )}
                    <button onClick={handleInternalBack} className="text-gray-400 hover:text-white transition-colors px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Quay Lại
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">

                {/* MODE 0: GRID LIST */}
                {(!selectedNiche) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
                        <div className="mb-6 text-center max-w-3xl mx-auto">
                            <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                                Chọn Ngách Để Bắt Đầu
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Chọn ngách đang thắng → bấm phân tích → nhận playbook long video hoàn chỉnh.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {NICHE_LIBRARY.map((niche, idx) => renderNicheCard(niche, idx))}
                        </div>
                    </div>
                )}

                {/* MODE 1+: WORKSPACE */}
                {selectedNiche && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95 duration-300 h-full">
                        {/* LEFT PANEL */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-[#1A1A1A] rounded-xl p-5 border border-white/5 sticky top-0">
                                <h3 className="text-lg font-bold mb-3 text-emerald-400">Tổng Quan Ngách</h3>
                                <div className="space-y-3 text-sm text-gray-300">
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
                                    {/* ACTIONS */}
                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                        {currentStep === 1 && (
                                            <button onClick={handleAnalyze} disabled={isLoading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-sm transition-all">
                                                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                PHÂN TÍCH NGÁCH
                                            </button>
                                        )}
                                        {currentStep === 2 && (
                                            <button onClick={handleGenerateScript} disabled={isLoading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-sm transition-all">
                                                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                SINH KỊCH BẢN
                                            </button>
                                        )}
                                        {currentStep === 3 && (
                                            <div className="text-center p-2 bg-green-500/10 text-green-400 rounded border border-green-500/20 font-bold flex items-center justify-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4" /> Hoàn Tất
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL */}
                        <div className="lg:col-span-8 bg-[#0d0d0d] rounded-xl border border-white/5 relative overflow-hidden flex flex-col h-full min-h-[500px]">
                            {currentStep === 1 && !isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-50">
                                    <Play className="w-12 h-12 mb-3" />
                                    <p className="font-medium text-sm">Bấm "Phân Tích Ngách" để bắt đầu</p>
                                </div>
                            )}

                            {isLoading && (
                                <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                                    <p className="text-emerald-400 text-sm animate-pulse">AI đang xử lý...</p>
                                </div>
                            )}

                            <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                                {currentStep >= 2 && analysisResult && (
                                    <div className="mb-8">
                                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded px-3 py-2 mb-4 inline-block">
                                            <h3 className="text-emerald-400 font-bold text-xs uppercase">Kết Quả Phân Tích</h3>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                            <ReactMarkdown>
                                                {analysisResult}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                                {currentStep === 3 && scriptResult && (
                                    <div className="pt-6 border-t border-white/10">
                                        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded px-3 py-2 mb-4 inline-block sticky top-0 backdrop-blur-sm">
                                            <h3 className="text-indigo-400 font-bold text-xs uppercase">Kịch Bản Chi Tiết</h3>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                            <ReactMarkdown>
                                                {scriptResult}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* CUSTOM SCROLLBAR STYLES (Scoped logic handled by class) */}

            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default NicheEngineTool;

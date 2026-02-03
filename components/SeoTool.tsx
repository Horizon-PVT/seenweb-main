// File: components/SeoTool.tsx (SeenYT Alpha Strategy UI)
import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { PhiIcon } from './AnimatedIcons';
import UpgradeModal from './UpgradeModal'; // ADDED
import { AnimatePresence } from 'framer-motion'; // ADDED

interface SeoToolProps {
    onBack: () => void;
}

// --- NEW STRATEGY DATA STRUCTURE (Matching Backend) ---
interface OutputData {
    strategy: {
        hook: {
            score: number;
            analysis: string;
            visualInterrupt: string;
        };
        emotional: {
            mainTrigger: string;
            triggerScore: number;
            explanation: string;
        };
        spyGap: {
            marketStatus: string;
            competitorMiss: string;
            ourAngle: string;
        };
    };
    content: {
        titles: {
            text: string;
            viralScore: number;
        }[];
        description: {
            body: string;
            hashtags: string[];
        };
        tags: {
            text: string;
            relevance: number;
        }[];
        thumbnails: { // CHANGED TO ARRAY
            concept: string;
            text: string;
            colorPalette: string;
            prompt: string;
        }[];
    };
}

// --- Icons ---
const StrategyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
const EmotionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

// --- Helper Components ---
const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(textToCopy);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className={`text-[10px] px-2 py-1 rounded border transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
        >
            {copied ? 'Đã Copy' : 'Copy'}
        </button>
    );
};

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-32 h-32 text-[#008080] animate-spin-slow"><PhiIcon /></div>
        <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">KHỞI ĐỘNG "SEENYT ALPHA ENGINE"...</p>
        <p className="text-xs text-gray-500 mt-1">Đang phân tích tâm lý người xem...</p>
    </div>
);

// --- MAIN COMPONENT ---
const SeoTool: React.FC<SeoToolProps> = ({ onBack }) => {
    const { data: session } = useSession();
    const { t } = useTranslation('common');
    const router = useRouter();
    const isEN = router.locale === 'en';
    const userRole = (session?.user as any)?.role || 'FREE'; // ADDED ROLE CHECK

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [output, setOutput] = useState<OutputData | null>(null);
    const [coreIdea, setCoreIdea] = useState('');
    const [showUpgrade, setShowUpgrade] = useState(false); // ADDED STATE
    const buttonRef = useRef<HTMLButtonElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ... (KEEP FILE UPLOAD) ...

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setCoreIdea(prev => prev + (prev ? '\n' : '') + content);
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- FREEMIUM GATE ---
        // Minimum Role: SUPER (Professional)
        if (['FREE', 'USER', 'CREATIVE'].includes(userRole) && userRole !== 'ADMIN') {
            setShowUpgrade(true);
            return;
        }

        if (!coreIdea) {
            setError("Chưa nhập ý tưởng!");
            return;
        }

        setIsLoading(true);
        setError('');
        setOutput(null);

        try {
            // Auto detect language
            let language = 'English';
            if (/[àáâãäåæçèéêëìíîïđñòóôõöøùúûüýþÿ]/.test(coreIdea)) language = 'Tiếng Việt';
            else if (/[ぁ-ゟァ-ヿ]/.test(coreIdea)) language = 'Japanese';
            else if (/[가-힣]/.test(coreIdea)) language = 'Korean';
            else if (/[\u4e00-\u9fff]/.test(coreIdea)) language = 'Chinese';
            else if (/[ñáéíóúü]/.test(coreIdea)) language = 'Spanish';
            else if (/[àâéèêëîïôûùüçœæ]/.test(coreIdea)) language = 'French';
            else if (/[äöüß]/.test(coreIdea)) language = 'German';
            else if (/[а-яА-ЯёЁ]/.test(coreIdea)) language = 'Russian';

            const response = await fetch('/api/seo-tool', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coreIdea,
                    outputLanguage: language
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setOutput(result as OutputData);
        } catch (err: any) {
            setError(err.message || "Lỗi Alpha Engine");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 bg-[#1a1a08] seo-tuner-bg">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-900/50">
                        <StrategyIcon />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-playfair tracking-wide">SEENYT ALPHA <span className="text-[#CDAD5A] text-sm font-normal">PRO</span></h2>
                        <p className="text-xs text-gray-400">Strategic Intelligence Engine 2026</p>
                    </div>
                </div>
                <button onClick={onBack} className="text-gray-400 hover:text-white">&times; {isEN ? 'Exit' : 'Thoát'}</button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-0">
                {/* LEFT: Input */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-4 h-full">
                    <label className="text-sm font-bold text-[#CDAD5A]">{isEN ? 'IDEA / RAW SCRIPT' : 'Ý TƯỞNG / KỊCH BẢN GỐC'}</label>
                    <textarea
                        value={coreIdea}
                        onChange={e => setCoreIdea(e.target.value)}
                        placeholder={isEN ? 'Paste your script or raw idea here...' : 'Paste kịch bản hoặc ý tưởng thô sơ vào đây...'}
                        className="w-full h-full min-h-[200px] p-4 bg-black/40 border border-gray-700 rounded-lg focus:border-[#CDAD5A] focus:ring-1 focus:ring-[#CDAD5A] text-gray-300 resize-none"
                    ></textarea>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs">📂 {isEN ? 'Upload File' : 'Upload File'}</button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    </div>
                    <button disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-[#CDAD5A] to-[#b89c4a] text-black font-bold rounded shadow-lg hover:shadow-[#CDAD5A]/20 transition-all disabled:opacity-50">
                        {isLoading ? (isEN ? 'ANALYZING...' : 'ĐANG PHÂN TÍCH...') : (isEN ? 'RUN STRATEGY 🚀' : 'CHẠY CHIẾN LƯỢC 🚀')}
                    </button>
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* RIGHT: Output Dashboard */}
                <div className="lg:col-span-9 h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
                    {isLoading && <Loader />}

                    {!isLoading && !output && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 space-y-4">
                            <div className="w-32 h-32 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center">
                                <StrategyIcon />
                            </div>
                            <p>{isEN ? 'Ready to receive data...' : 'Sẵn sàng tiếp nhận dữ liệu...'}</p>
                        </div>
                    )}

                    {output && !isLoading && (
                        <div className="space-y-6 animate-fade-in-up">

                            {/* 1. STRATEGY DASHBOARD (Top Row) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Hook Card */}
                                <div className="p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20"><StrategyIcon /></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-blue-400 font-bold text-sm">HOOK SCORE</h3>
                                        <span className={`text-2xl font-black ${output.strategy.hook.score >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>{output.strategy.hook.score}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">{output.strategy.hook.analysis}</p>
                                    <div className="bg-blue-900/20 p-2 rounded border border-blue-500/20">
                                        <p className="text-[10px] text-blue-300 font-bold uppercase mb-1">💡 Visual Interrupt</p>
                                        <p className="text-xs text-gray-300">{output.strategy.hook.visualInterrupt}</p>
                                    </div>
                                </div>

                                {/* Emotion Card */}
                                <div className="p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20"><EmotionIcon /></div>
                                    <h3 className="text-red-400 font-bold text-sm mb-1">CẢM XÚC CHỦ ĐẠO</h3>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h4 className="text-xl font-bold text-white uppercase">{output.strategy.emotional.mainTrigger}</h4>
                                        <span className="text-xs text-red-500">({output.strategy.emotional.triggerScore}/10)</span>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">"{output.strategy.emotional.explanation}"</p>
                                </div>

                                {/* Spy Gap Card */}
                                <div className="p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20"><EyeIcon /></div>
                                    <h3 className="text-purple-400 font-bold text-sm mb-1">KẺ HỞ THỊ TRƯỜNG</h3>
                                    <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded mb-2 border border-purple-500/20">
                                        {output.strategy.spyGap.marketStatus}
                                    </span>
                                    <p className="text-xs text-gray-300 mb-2">⛔ <strong>Họ thiếu:</strong> {output.strategy.spyGap.competitorMiss}</p>
                                    <p className="text-xs text-green-400">✅ <strong>Ta làm:</strong> {output.strategy.spyGap.ourAngle}</p>
                                </div>
                            </div>

                            {/* 2. TITLES (Viral Optimized) */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 font-playfair flex items-center gap-2">
                                    <span className="text-[#CDAD5A]">1.</span> TIÊU ĐỀ VIRAL
                                </h3>
                                <div className="space-y-2">
                                    {output.content.titles.map((title, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors group">
                                            <div>
                                                <p className="text-gray-200 font-semibold text-base">{title.text}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Viral Score: {title.viralScore}/100</span>
                                                </div>
                                            </div>
                                            <CopyButton textToCopy={title.text} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. DESCRIPTION (Formatted) */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 font-playfair flex items-center gap-2">
                                    <span className="text-[#CDAD5A]">2.</span> MÔ TẢ CHUẨN SEO
                                </h3>
                                <div className="p-5 bg-black/40 border border-gray-700 rounded-lg">
                                    <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                                        {output.content.description.body}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-2">
                                        {output.content.description.hashtags.map((tag, i) => (
                                            <span key={i} className="text-[#008080] font-bold text-xs">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <CopyButton textToCopy={`${output.content.description.body}\n\n${output.content.description.hashtags.join(' ')}`} />
                                    </div>
                                </div>
                            </div>

                            {/* 4. TAGS & THUMBNAILS (Split) */}
                            <div className="space-y-6">
                                {/* Tags */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-3 font-playfair flex items-center gap-2">
                                        <span className="text-[#CDAD5A]">3.</span> NICHE TAGS
                                    </h3>
                                    <div className="flex flex-wrap gap-2 p-4 bg-black/40 border border-gray-700 rounded-lg min-h-[100px] content-start">
                                        {output.content.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-700 flex items-center gap-1">
                                                {tag.text}
                                                <span className="text-[9px] text-gray-500">| {tag.relevance}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Thumbnails Grid */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-3 font-playfair flex items-center gap-2">
                                        <span className="text-[#CDAD5A]">4.</span> THUMBNAIL CONCEPTS (A/B/C Testing)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {output.content.thumbnails.map((thumb, i) => (
                                            <div key={i} className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg h-full flex flex-col">
                                                <div className="mb-3">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">OPTION {i + 1}</div>
                                                        <CopyButton textToCopy={thumb.prompt} />
                                                    </div>
                                                    <p className="text-lg font-black text-white px-2 py-1 bg-black/50 border-l-2 border-red-500 inline-block mb-2">
                                                        "{thumb.text}"
                                                    </p>
                                                    <p className="text-xs text-gray-300 italic mb-2">"{thumb.concept}"</p>
                                                </div>
                                                <div className="mt-auto pt-3 border-t border-gray-700 space-y-1">
                                                    <p className="text-[10px] text-gray-400"><strong>🎨 Màu:</strong> {thumb.colorPalette}</p>
                                                    <div className="bg-black/30 p-2 rounded text-[10px] text-gray-500 font-mono h-16 overflow-y-auto custom-scrollbar">
                                                        {thumb.prompt}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default SeoTool;
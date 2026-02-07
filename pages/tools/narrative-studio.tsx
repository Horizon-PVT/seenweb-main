
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from "next-auth/react"; // Import useSession
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import {
    ArrowLeft,
    Book,
    Feather,
    Image as ImageIcon,
    Download,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Settings,
    Palette,
    Globe,
    FileText,
    Layers,
    BookOpen
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- TYPES & CONSTANTS (Strictly Preserved) ---
type Phase = 'input' | 'process' | 'output';
type OutputView = 'preview' | 'workflow';

interface TextProperties {
    content: string;
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    fontSize: number; // vw units
    fontFamily: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    backgroundColor: string; // rgba
}

interface Scene {
    id: number;
    imagePrompt: string;
    imageUrl?: string;
    textProperties: TextProperties;
    trimSize: TrimSizeKey;
    bleedInMM: number;
    widthMM: number;
    heightMM: number;
    isLeftPage?: boolean;
}

const KDP_TRIM_SIZES = {
    '6x9 (Tiêu chuẩn)': { widthMM: 152.4, heightMM: 228.6, aspectRatio: '3:4', bleed: 3.2 },
    '8.5x8.5 (Vuông)': { widthMM: 215.9, heightMM: 215.9, aspectRatio: '1:1', bleed: 3.2 },
    '8.25x6 (Ngang)': { widthMM: 209.55, heightMM: 152.4, aspectRatio: '4:3', bleed: 3.2 },
};

type TrimSizeKey = keyof typeof KDP_TRIM_SIZES;

const imageStyles = [
    "SÁCH TÔ MÀU (LINE ART)",
    "TRUYỆN TRANH GRAPHIC NOVEL",
    "TRUYỆN TRANH MANGA/ANIME",
    "THỰC TẾ ĐIỆN ẢNH",
    "PHONG CÁCH SÁCH ẢNH TRẺ EM",
    "SƠN DẦU LÃNG MẠN",
    "WATERCOLOR DỄ THƯƠNG",
];

const languages = [
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "English" },
    { value: "zh-CN", label: "Chinese" },
    { value: "ja", label: "Japanese" },
];

const LoadingQuill: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-24 h-24 mb-6">
            <Feather size={64} className="text-[#d4af37] absolute top-0 left-0 animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full border-2 border-[#d4af37]"></div>
        </div>
        <h3 className="text-[#d4af37] font-serif font-bold text-xl tracking-widest">{text}</h3>
        <p className="text-[#8c7335] text-sm mt-2 font-serif italic">The scribe is analyzing the ancient texts...</p>
    </div>
);

export default function NarrativeStudioPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const isEN = router.locale === 'en';

    // --- STATE ---
    const [phase, setPhase] = useState<Phase>('input');
    const [bookTitle, setBookTitle] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [storyIdea, setStoryIdea] = useState('');
    const [style, setStyle] = useState(imageStyles[4]);
    const [language, setLanguage] = useState(languages[0].value);
    const [numberOfScenes, setNumberOfScenes] = useState(10);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');

    const [selectedTrimSize, setSelectedTrimSize] = useState<TrimSizeKey>('6x9 (Tiêu chuẩn)');
    const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
    const [isGeneratingCover, setIsGeneratingCover] = useState(false);

    const [outputView, setOutputView] = useState<OutputView>('preview');
    const [bookSummary, setBookSummary] = useState('');

    const [showUpgrade, setShowUpgrade] = useState(false); // NEW STATE

    const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
    const selectedKDP = KDP_TRIM_SIZES[selectedTrimSize];

    // --- LOGIC: GENERATE SCENES ---
    const handleGenerateScenes = async () => {
        // --- FREEMIUM GATE CHECK ---
        const userRole = ((session?.user as any)?.role || "FREE");
        const allowed = ['SUPER', 'VIP', 'ADMIN'].includes(userRole);
        if (!allowed) {
            setShowUpgrade(true);
            return;
        }
        // ---------------------------

        setError(null);
        setIsLoading(true);
        setLoadingMessage('1/2. Analyzing Chronicle...'); // Themed message

        if (!bookTitle || !authorName) {
            setError("Please fill in Book Title and Author Name.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/narrative-studio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'analyze',
                    storyIdea,
                    style,
                    language,
                    numberOfScenes,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                const errRaw = err.error || '';
                const errStr = String(errRaw).toUpperCase();

                const isPlanError = errStr.includes('PLAN_LOCKED') || errStr.includes('FREE_QUOTA_EXCEEDED');
                if (res.status === 403 && isPlanError) {
                    setShowUpgrade(true);
                    setIsLoading(false);
                    return;
                }
                throw new Error(errRaw || 'Unknown analysis error.');
            }

            const data = await res.json();
            setBookSummary(data.bookSummary);

            const initialScenes: Scene[] = data.scenes.map((s: any, index: number) => ({
                id: index + 1,
                imagePrompt: s.imagePrompt,
                imageUrl: undefined,
                trimSize: selectedTrimSize,
                bleedInMM: selectedKDP.bleed,
                widthMM: selectedKDP.widthMM,
                heightMM: selectedKDP.heightMM,
                isLeftPage: (index + 1) % 2 === 0,
                textProperties: {
                    content: s.narrationText,
                    x: 50, y: 85, width: 80, fontSize: 1.5,
                    fontFamily: 'serif', color: '#111827',
                    textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
            }));
            setScenes(initialScenes);
            pageRefs.current = new Array(initialScenes.length).fill(null);
            setPhase('process');

        } catch (e: any) {
            console.error("Analysis Error:", e);
            setError(e.message);
            setIsLoading(false);
        }
    };

    // --- LOGIC: GENERATE IMAGES ---
    const generateImageForScene = useCallback(async (index: number) => {
        const sceneToUpdate = scenes[index];
        if (!sceneToUpdate || sceneToUpdate.imageUrl) return;

        setLoadingMessage(`2/2. Illustrating Page ${index + 1}/${scenes.length}...`);
        setError(null);

        try {
            const aspectRatio = KDP_TRIM_SIZES[sceneToUpdate.trimSize].aspectRatio;
            const res = await fetch('/api/narrative-studio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generateImage',
                    imagePrompt: sceneToUpdate.imagePrompt,
                    aspectRatio: aspectRatio,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                const errRaw = err.error || '';
                const errStr = String(errRaw).toUpperCase();

                const isPlanError = errStr.includes('PLAN_LOCKED') || errStr.includes('FREE_QUOTA_EXCEEDED');
                if (res.status === 403 && isPlanError) {
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(errRaw || 'Image generation failed.');
            }

            const data = await res.json();
            setScenes(prevScenes => prevScenes.map((s, i) =>
                i === index ? { ...s, imageUrl: data.imageUrl } : s
            ));
        } catch (e: any) {
            console.error(`Image Gen Error Scene ${index + 1}:`, e);
            setError(`Error Scene ${index + 1}: ${e.message}. (Skipped)`);
        }
    }, [scenes, selectedTrimSize]); // Added selectedTrimSize dependency implicitly via KDP_TRIM_SIZES access, though it's constant

    useEffect(() => {
        if (phase === 'process' && scenes.length > 0) {
            const nextIndex = scenes.findIndex(s => !s.imageUrl);
            if (nextIndex !== -1) {
                setIsLoading(true);
                generateImageForScene(nextIndex);
            } else {
                setIsLoading(false);
                setPhase('output');
                setLoadingMessage('The Tome is complete!');
            }
        }
    }, [phase, scenes, generateImageForScene]);

    // --- LOGIC: GENERATE COVER ---
    const handleGenerateCover = async () => {
        if (!storyIdea || !style || !bookTitle || !authorName) {
            setError("Missing Title, Author, Idea or Style.");
            return;
        }

        const coverPrompt = `Full wrap book cover design, high quality 300 DPI, for KDP. Title: "${bookTitle}". Theme: "${storyIdea}". Style: ${style}. Wide view composition with space for text. NO TEXT characters in image.`;

        setIsGeneratingCover(true);
        setError(null);

        try {
            const res = await fetch('/api/narrative-studio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generateCover',
                    coverPrompt: coverPrompt,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                const errRaw = err.error || '';
                const errStr = String(errRaw).toUpperCase();

                const isPlanError = errStr.includes('PLAN_LOCKED') || errStr.includes('FREE_QUOTA_EXCEEDED');
                if (res.status === 403 && isPlanError) {
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(errRaw || 'Cover generation failed');
            }

            const data = await res.json();
            setCoverUrl(data.imageUrl);
        } catch (e: any) {
            console.error('Cover Gen Error:', e);
            setError(`Cover Error: ${e.message}`);
        } finally {
            setIsGeneratingCover(false);
        }
    };

    // --- LOGIC: PDF ---
    const generatePDF = async () => {
        const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
        for (let i = 0; i < scenes.length; i++) {
            if (i > 0) pdf.addPage();
            const el = document.createElement('div');
            el.style.width = '794px';
            el.style.height = '1123px';
            el.style.background = '#fff';
            el.style.position = 'fixed';
            el.style.left = '-9999px';
            document.body.appendChild(el);

            if (scenes[i].imageUrl) {
                const img = document.createElement('img');
                img.src = scenes[i].imageUrl!;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                el.appendChild(img);
                await new Promise(r => img.onload = r);
            }

            const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#fff', useCORS: true });
            pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', 0, 0, 210, 297);
            document.body.removeChild(el);
        }
        pdf.save('KDP_Manuscript_Full.pdf');
    };

    // --- UI RENDERERS ---
    const renderSpread = (spread: Scene[], spreadIndex: number) => {
        const isSinglePage = spread.length === 1;
        const isFirstPage = spreadIndex === 0;
        const { widthMM, heightMM } = selectedKDP;
        const aspectRatio = widthMM / heightMM;
        const previewHeight = 350;
        const previewWidth = previewHeight * aspectRatio;
        const spreadWidth = previewWidth * 2 + 20;

        const currentSpreadWidth = isSinglePage ? previewWidth : spreadWidth;

        return (
            <div key={spreadIndex} className="bg-[#1c140d] p-6 rounded-lg border border-[#3e2c1e] shadow-2xl relative">
                <div className="absolute top-2 left-4 text-xs font-serif text-[#8c7335] uppercase tracking-widest">
                    {isFirstPage ? `Folio I (Right ONLY)` : `Folio ${spread[0].id} & ${spread[1] ? spread[1].id : '-'}`}
                </div>

                <div className={`mx-auto flex gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isSinglePage ? 'justify-center' : 'justify-between'}`} style={{ width: currentSpreadWidth, height: previewHeight }}>
                    {isFirstPage && (
                        <div style={{ width: previewWidth, height: previewHeight }} className="bg-[#e3d5b8] opacity-10 flex items-center justify-center border-r border-[#1c140d]/20">
                            {/* Empty Left Page for First Spread */}
                        </div>
                    )}

                    {spread.map((scene) => (
                        <div
                            key={scene.id}
                            ref={(el) => { pageRefs.current[scene.id - 1] = el; }}
                            style={{ width: previewWidth, height: previewHeight }}
                            className={`relative bg-[#f4e4bc] overflow-hidden flex-shrink-0 ${scene.isLeftPage ? 'rounded-l-sm' : 'rounded-r-sm'}`}
                        >
                            <div className="absolute top-2 right-2 text-[10px] text-gray-500 z-10 font-serif">{scene.id}</div>
                            {scene.imageUrl ? (
                                <img src={scene.imageUrl} className="w-full h-full object-cover mix-blend-multiply" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#8c7335]/30">
                                    <Feather size={24} />
                                </div>
                            )}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${scene.textProperties.y}%`,
                                    left: `${scene.textProperties.x}%`,
                                    width: `${scene.textProperties.width}%`,
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '11px',
                                    color: scene.textProperties.color,
                                    textAlign: scene.textProperties.textAlign,
                                    fontFamily: scene.textProperties.fontFamily,
                                    backgroundColor: scene.textProperties.backgroundColor,
                                    padding: '6px 10px',
                                    borderRadius: '2px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}
                            >
                                {scene.textProperties.content}
                            </div>
                        </div>
                    ))}

                    {isSinglePage && !isFirstPage && (
                        <div style={{ width: previewWidth, height: previewHeight }} className="bg-[#e3d5b8] opacity-10"></div>
                    )}
                </div>

                {/* Edit Tools */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {spread.map(scene => (
                        <div key={`edit-${scene.id}`} className="bg-[#2a1f16] p-3 rounded border border-[#3e2c1e]">
                            <label className="text-[10px] text-[#8c7335] uppercase font-bold mb-1 block">Narration (Page {scene.id})</label>
                            <textarea
                                value={scene.textProperties.content}
                                onChange={(e) => setScenes(prev => prev.map((s, i) => i === scene.id - 1 ? { ...s, textProperties: { ...s.textProperties, content: e.target.value } } : s))}
                                className="w-full bg-[#1c140d] border border-[#3e2c1e] text-[#e3d5b8] text-xs p-2 rounded h-16 font-serif resize-none focus:outline-none focus:border-[#d4af37]"
                            />
                            <button
                                onClick={() => generateImageForScene(scene.id - 1)}
                                disabled={isLoading}
                                className="mt-2 text-[10px] text-[#8c7335] hover:text-[#d4af37] flex items-center gap-1 uppercase font-bold"
                            >
                                <ImageIcon size={12} /> Regenerate Art
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#120c08] text-[#e3d5b8] font-sans selection:bg-[#d4af37] selection:text-black">
            <Head>
                <title>NARRATIVE STUDIO | KDP MASTERPIECE</title>
            </Head>

            {/* VINTAGE HEADER */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#1a140f] border-b border-[#3e2c1e] flex items-center justify-between px-6 z-50 shadow-xl">
                <div className="flex items-center gap-4">
                    <Link href="/?tool=tools_content" className="text-[#8c7335] hover:text-[#d4af37] transition-colors flex items-center gap-2">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="h-6 w-px bg-[#3e2c1e]"></div>
                    <div className="flex items-center gap-3">
                        <Book size={20} className="text-[#d4af37]" />
                        <h1 className="text-sm font-serif font-bold tracking-[0.15em] text-[#e3d5b8] uppercase">Narrative Studio</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[#2a1f16] border border-[#3e2c1e] rounded text-xs font-serif text-[#8c7335]">
                        KDP STANDARD
                    </div>
                </div>
            </header>

            <main className="pt-24 px-6 pb-20 max-w-6xl mx-auto">
                {/* WIZARD STEPS */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4">
                        {['Setup', 'Process', 'Publish'].map((step, idx) => {
                            const steps: Phase[] = ['input', 'process', 'output'];
                            const isActive = steps[idx] === phase;
                            const isPast = steps.indexOf(phase) > idx;
                            return (
                                <div key={step} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold border-2 transition-all ${isActive ? 'bg-[#d4af37] text-black border-[#d4af37]' : (isPast ? 'bg-[#8c7335] text-black border-[#8c7335]' : 'bg-transparent text-[#3e2c1e] border-[#3e2c1e]')}`}>
                                        {idx + 1}
                                    </div>
                                    <span className={`text-xs uppercase font-bold tracking-widest ${isActive ? 'text-[#d4af37]' : 'text-[#3e2c1e]'}`}>{step}</span>
                                    {idx < 2 && <div className="w-8 h-px bg-[#3e2c1e]"></div>}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* PHASE 1: INPUT */}
                {phase === 'input' && (
                    <div className="bg-[#1c140d] border border-[#3e2c1e] p-8 rounded-lg shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-serif font-bold text-[#8c7335] uppercase mb-2">The Chronicle Title</label>
                                    <input
                                        type="text"
                                        value={bookTitle}
                                        onChange={e => setBookTitle(e.target.value)}
                                        placeholder="e.g. The Lost Kingdom"
                                        className="w-full bg-[#120c08] border border-[#3e2c1e] p-3 text-[#e3d5b8] font-serif rounded focus:border-[#d4af37] outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-serif font-bold text-[#8c7335] uppercase mb-2">Author (Scribe)</label>
                                    <input
                                        type="text"
                                        value={authorName}
                                        onChange={e => setAuthorName(e.target.value)}
                                        placeholder="e.g. J.R.R. Tolkien"
                                        className="w-full bg-[#120c08] border border-[#3e2c1e] p-3 text-[#e3d5b8] font-serif rounded focus:border-[#d4af37] outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-serif font-bold text-[#8c7335] uppercase mb-2">KDP Trim Size</label>
                                    <select
                                        value={selectedTrimSize}
                                        onChange={e => setSelectedTrimSize(e.target.value as TrimSizeKey)}
                                        className="w-full bg-[#120c08] border border-[#3e2c1e] p-3 text-[#e3d5b8] rounded focus:border-[#d4af37] outline-none cursor-pointer"
                                    >
                                        {Object.keys(KDP_TRIM_SIZES).map(key => (
                                            <option key={key} value={key}>{key}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-serif font-bold text-[#8c7335] uppercase mb-2">Number of Pages</label>
                                    <input
                                        type="number"
                                        min="1" max="100"
                                        value={numberOfScenes}
                                        onChange={e => setNumberOfScenes(parseInt(e.target.value))}
                                        className="w-full bg-[#120c08] border border-[#3e2c1e] p-3 text-[#e3d5b8] rounded focus:border-[#d4af37] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-xs font-serif font-bold text-[#8c7335] uppercase mb-2">Language</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[#120c08] border border-[#3e2c1e] p-3 text-[#e3d5b8] rounded focus:border-[#d4af37] outline-none cursor-pointer">
                                    {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-serif font-bold text-[#8c7335] uppercase mb-2">Art Style</label>
                                <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-[#120c08] border border-[#3e2c1e] p-3 text-[#e3d5b8] rounded focus:border-[#d4af37] outline-none cursor-pointer">
                                    {imageStyles.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-xs font-serif font-bold text-[#8c7335] uppercase mb-2">Core Narrative / Plot</label>
                            <textarea
                                value={storyIdea}
                                onChange={e => setStoryIdea(e.target.value)}
                                rows={4}
                                placeholder="Describe the journey, characters, and setting..."
                                className="w-full bg-[#120c08] border border-[#3e2c1e] p-3 text-[#e3d5b8] font-serif rounded focus:border-[#d4af37] outline-none resize-none"
                            />
                        </div>

                        <button
                            onClick={handleGenerateScenes}
                            disabled={isLoading}
                            className="w-full py-4 bg-[#d4af37] text-black font-serif font-bold text-lg uppercase tracking-widest hover:bg-[#c5a028] transition-colors rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Consulting the Oracle...' : 'Initialize Manuscript'}
                        </button>
                    </div>
                )}

                {/* PHASE 2: PROCESSING */}
                {phase === 'process' && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        {isLoading && <LoadingQuill text={loadingMessage} />}

                        {!isLoading && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {scenes.map((scene) => (
                                    <div key={scene.id} className={`aspect-[3/4] bg-[#1c140d] border border-[#3e2c1e] relative group rounded overflow-hidden ${!scene.imageUrl ? 'animate-pulse' : ''}`}>
                                        {scene.imageUrl ? (
                                            <img src={scene.imageUrl} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[#3e2c1e]">
                                                <Feather size={20} />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center text-[10px] text-[#8c7335] font-serif">
                                            Page {scene.id}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* PHASE 3: OUTPUT */}
                {phase === 'output' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">

                        {/* VIEW TOGGLE */}
                        <div className="flex justify-center gap-4 border-b border-[#3e2c1e] pb-4">
                            <button onClick={() => setOutputView('preview')} className={`flex items-center gap-2 px-4 py-2 text-sm font-serif font-bold uppercase tracking-widest transition-all ${outputView === 'preview' ? 'text-[#d4af37] border-b-2 border-[#d4af37]' : 'text-[#8c7335]'}`}>
                                <BookOpen size={16} /> Manuscript
                            </button>
                            <button onClick={() => setOutputView('workflow')} className={`flex items-center gap-2 px-4 py-2 text-sm font-serif font-bold uppercase tracking-widest transition-all ${outputView === 'workflow' ? 'text-[#d4af37] border-b-2 border-[#d4af37]' : 'text-[#8c7335]'}`}>
                                <CheckCircle size={16} /> KDP Checklist
                            </button>
                        </div>

                        {outputView === 'preview' && (
                            <div className="space-y-8">
                                {/* Summary Card */}
                                <div className="bg-[#1c140d] p-6 rounded border-l-4 border-[#d4af37]">
                                    <h3 className="text-[#d4af37] font-serif font-bold uppercase text-xs mb-2">Back Cover Blurb</h3>
                                    <p className="text-[#e3d5b8] font-serif italic leading-relaxed">{bookSummary || "Narrative not yet recorded."}</p>
                                </div>

                                {/* Spreads */}
                                <div className="space-y-12">
                                    {/* Logic to group scenes into spreads */}
                                    {(() => {
                                        const spreads = [];
                                        if (scenes.length > 0) spreads.push([scenes[0]]);
                                        for (let i = 1; i < scenes.length; i += 2) {
                                            spreads.push([scenes[i], scenes[i + 1]].filter(Boolean));
                                        }
                                        return spreads.map((spread, idx) => renderSpread(spread, idx));
                                    })()}
                                </div>
                            </div>
                        )}

                        {outputView === 'workflow' && (
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="bg-[#1c140d] border border-[#3e2c1e] p-6 rounded">
                                    <h3 className="text-[#d4af37] font-serif font-bold text-lg mb-4 flex items-center gap-2"><Download size={20} /> Publishing Artifacts</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button onClick={generatePDF} className="bg-[#2a1f16] hover:bg-[#3e2c1e] border border-[#3e2c1e] p-4 rounded flex flex-col items-center gap-2 transition-colors">
                                            <FileText size={24} className="text-[#e3d5b8]" />
                                            <span className="text-sm font-bold text-[#e3d5b8]">Download Manuscript PDF</span>
                                            <span className="text-[10px] text-[#8c7335]">Inside Content (300 DPI)</span>
                                        </button>
                                        <button onClick={handleGenerateCover} disabled={isGeneratingCover} className="bg-[#2a1f16] hover:bg-[#3e2c1e] border border-[#3e2c1e] p-4 rounded flex flex-col items-center gap-2 transition-colors">
                                            <Layers size={24} className="text-[#e3d5b8]" />
                                            <span className="text-sm font-bold text-[#e3d5b8]">{isGeneratingCover ? 'Designing...' : 'Generate Cover Art'}</span>
                                            <span className="text-[10px] text-[#8c7335]">Full Wrap (16:9 for KDP)</span>
                                        </button>
                                    </div>
                                </div>

                                {coverUrl && (
                                    <div className="bg-[#1c140d] border border-[#3e2c1e] p-4 rounded flex flex-col items-center">
                                        <img src={coverUrl} className="max-w-full h-auto shadow-xl border-4 border-[#120c08] mb-4" />
                                        <a href={coverUrl} download className="text-xs text-[#d4af37] underline uppercase font-bold tracking-widest">Download Cover Image</a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {error && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900/90 text-white px-6 py-3 rounded shadow-xl flex items-center gap-3 z-50">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}

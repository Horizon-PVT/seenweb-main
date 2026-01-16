import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

// --- TYPES ---
interface Topic {
    pillar: string;
    title: string;
    hook: string;
    cpm_potential: string;
}

interface ScriptSegment {
    id: number;
    content_vi: string;
    content_en: string;
    duration: string;
    content_translated?: string; // For other languages
}

interface VisualSyncItem {
    timestamp: string;
    shotType: string;
    narrativeBeat: string;
    voiceoverScript: string;
    aiPrompt: string;
    transitionToNext: string;
    continuityNote: string;
    earthStudioCoords: {
        lat: number;
        lng: number;
        altitude: number;
        tilt: number;
        heading: number;
    };
}

interface ScriptData {
    script: {
        totalDuration: string;
        segments: ScriptSegment[];
    };
    attributeTags?: string[];
    visualSync?: VisualSyncItem[];
    cpm?: string; // Added CPM
}

const LANGUAGES = [
    { code: 'vi', label: '🇻🇳 VI', name: 'Vietnamese' },
    { code: 'en', label: '🇺🇸 EN', name: 'English' },
    { code: 'zh', label: '🇨🇳 ZH', name: 'Chinese' },
    { code: 'ja', label: '🇯🇵 JA', name: 'Japanese' },
    { code: 'ko', label: '🇰🇷 KO', name: 'Korean' },
    { code: 'es', label: '🇪🇸 ES', name: 'Spanish' },
    { code: 'fr', label: '🇫🇷 FR', name: 'French' },
    { code: 'de', label: '🇩🇪 DE', name: 'German' },
    { code: 'ru', label: '🇷🇺 RU', name: 'Russian' },
    { code: 'th', label: '🇹🇭 TH', name: 'Thai' },
];

const FutureEyeTool: React.FC = () => {
    const { data: session } = useSession();

    // State
    const [location, setLocation] = useState('');
    const [year, setYear] = useState(2050);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [scriptData, setScriptData] = useState<ScriptData | null>(null);
    const [activeLanguage, setActiveLanguage] = useState<'vi' | 'en' | string>('vi'); // Default VI

    // Loading States
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [loadingScript, setLoadingScript] = useState(false);
    const [loadingVisual, setLoadingVisual] = useState(false);
    const [loadingTranslate, setLoadingTranslate] = useState(false);
    const [error, setError] = useState('');

    // --- ACTIONS ---

    const resetTool = () => {
        setTopics([]);
        setSelectedTopic(null);
        setScriptData(null);
        setError('');
        setLocation('');
        setActiveLanguage('vi');
    };

    const generateTopics = async () => {
        if (!location) { setError("Please enter a location"); return; }
        setLoadingTopics(true);
        setError('');
        setTopics([]);
        setSelectedTopic(null);
        setScriptData(null);

        try {
            const res = await fetch('/api/tools/future-eye', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_topics', location, year }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate topics");
            setTopics(data.topics || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingTopics(false);
        }
    };

    const generateScript = async () => {
        if (!selectedTopic) return;
        setLoadingScript(true);
        setError('');

        try {
            const res = await fetch('/api/tools/future-eye', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_script',
                    location,
                    year,
                    topic: selectedTopic.title,
                    cpm: selectedTopic.cpm_potential // Pass CPM
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate script");
            setScriptData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingScript(false);
        }
    };

    const generateVisualSync = async () => {
        if (!scriptData) return;
        setLoadingVisual(true);
        setError('');

        try {
            const res = await fetch('/api/tools/future-eye', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_visual_sync',
                    location,
                    year,
                    scriptContent: scriptData.script.segments
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate visuals");

            setScriptData(prev => prev ? { ...prev, visualSync: data.visualSync } : null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingVisual(false);
        }
    };

    const handleTranslate = async (langCode: string) => {
        setActiveLanguage(langCode);
        if (!scriptData) return;

        // If VI or EN, we already have it
        if (langCode === 'vi' || langCode === 'en') return;

        setLoadingTranslate(true);
        try {
            // Source: Prefer VI
            const segmentsToTranslate = scriptData.script.segments.map(s => s.content_vi);
            const targetLangName = LANGUAGES.find(l => l.code === langCode)?.name || langCode;

            const res = await fetch('/api/tools/future-eye', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'translate_adapter',
                    segmentsToTranslate,
                    targetLanguage: targetLangName
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Translation failed");

            // Update Script Data
            const translatedTexts = data.translatedSegments || [];

            setScriptData(prev => {
                if (!prev) return null;
                const newSegments = prev.script.segments.map((s, i) => ({
                    ...s,
                    content_translated: translatedTexts[i] || ""
                }));
                return {
                    ...prev,
                    script: { ...prev.script, segments: newSegments }
                };
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingTranslate(false);
        }
    }

    // Helper to get content based on language
    const getSegmentContent = (seg: ScriptSegment, lang: string) => {
        if (lang === 'vi') return seg.content_vi;
        if (lang === 'en') return seg.content_en;
        return seg.content_translated || "Translating...";
    };

    // Copy to clipboard
    const copyToClipboard = () => {
        if (!scriptData) return;
        const text = scriptData.script.segments.map(s => getSegmentContent(s, activeLanguage)).join('\n\n');
        navigator.clipboard.writeText(text);
    };

    const getPillarStyle = (pillar: string) => {
        const p = pillar?.toLowerCase() || '';
        if (p.includes('ai')) return 'border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-900/20';
        if (p.includes('mega')) return 'border-l-4 border-orange-500 bg-gradient-to-r from-orange-900/20';
        if (p.includes('mobility')) return 'border-l-4 border-purple-500 bg-gradient-to-r from-purple-900/20';
        if (p.includes('bio')) return 'border-l-4 border-green-500 bg-gradient-to-r from-green-900/20';
        if (p.includes('energy')) return 'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-900/20';
        return 'border-l-4 border-gray-500 bg-gray-800';
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                            🔮 FUTURE-EYE 2.0
                        </h1>
                        <p className="text-sm text-gray-500">Documentary Production Engine</p>
                    </div>
                    <button onClick={resetTool} className="text-xs text-red-400 hover:text-red-300 underline">
                        Reset Tool
                    </button>
                </div>

                {error && <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg mb-6">🚨 {error}</div>}

                {/* STEP 1: INPUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg p-3 w-full" />
                    <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-gray-900 border border-gray-700 rounded-lg p-3 w-full" />
                    <button onClick={generateTopics} disabled={loadingTopics} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">{loadingTopics ? 'Generating...' : '1. Generate Topics'}</button>
                </div>

                {/* STEP 2: TOPICS */}
                {topics.length > 0 && (
                    <div className="mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topics.map((t, i) => (
                                <div key={i} onClick={() => setSelectedTopic(t)} className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedTopic?.title === t.title ? 'border-purple-400 shadow-lg' : 'border-transparent'} ${getPillarStyle(t.pillar)}`}>
                                    <span className="text-xs font-bold uppercase opacity-70 block mb-1 flex justify-between">
                                        {t.pillar}
                                        {/* CPM Badge on Card */}
                                        <span className="text-green-400 font-mono tracking-tighter text-[10px]">
                                            💰 {t.cpm_potential?.replace("High ", "") || "$30+"}
                                        </span>
                                    </span>
                                    <h3 className="font-bold text-white mb-1 leading-tight">{t.title}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-2">{t.hook}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ACTION: GENERATE SCRIPT */}
                {selectedTopic && !scriptData && (
                    <div className="flex justify-center mb-10">
                        <button onClick={generateScript} disabled={loadingScript} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg disabled:opacity-50 animate-bounce">
                            {loadingScript ? 'Writing Deep Script (1500+ Words)...' : '2. Write Professional Script 📝'}
                        </button>
                    </div>
                )}

                {/* STEP 3: SCRIPT TABLE */}
                {scriptData && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">📄 Production Script</h2>
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-gray-400">Total Duration: <span className="text-green-400 font-bold">{scriptData.script.totalDuration}</span></p>
                                    {scriptData.cpm && (
                                        <span className="px-3 py-1 bg-green-900 border border-green-500 text-green-300 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse">
                                            💰 CPM Potential: {scriptData.cpm}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {scriptData.attributeTags?.map((tag, i) => <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 max-w-[200px] truncate">#{tag}</span>)}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-sm justify-end">
                                {LANGUAGES.map(lang => (
                                    <button key={lang.code} onClick={() => handleTranslate(lang.code)} className={`px-3 py-1 rounded text-xs font-bold ${activeLanguage === lang.code ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} disabled={loadingTranslate}>
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TABLE VIEW */}
                        <div className="overflow-x-auto rounded-lg border border-gray-800 mb-6">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="bg-gray-800 text-gray-100 uppercase text-xs">
                                    <tr>
                                        <th className="p-3 w-16 text-center">STT</th>
                                        <th className="p-3">Kịch Bản ({activeLanguage.toUpperCase()})</th>
                                        <th className="p-3 w-32 text-center">Thời Lượng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 bg-black/40">
                                    {scriptData.script.segments.map((seg) => (
                                        <tr key={seg.id} className="hover:bg-gray-800/30">
                                            <td className="p-4 text-center text-gray-500 font-mono">{seg.id}</td>
                                            <td className="p-4 leading-relaxed whitespace-pre-wrap">{getSegmentContent(seg, activeLanguage)}</td>
                                            <td className="p-4 text-center font-mono text-green-400">{seg.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={copyToClipboard} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">Copy Full Text</button>
                            {!scriptData.visualSync && (
                                <button onClick={generateVisualSync} disabled={loadingVisual} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold text-white shadow disabled:opacity-50">
                                    {loadingVisual ? 'Generating Visuals...' : '3. Generate Visual Sync 🎬'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 4: VISUAL SYNC TABLE */}
                {scriptData?.visualSync && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">🎬 Visual Production Table (Reference)</h2>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                                    <tr>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Shot</th>
                                        <th className="p-3 w-1/4">Prompt (Copy to Runway/Pika)</th>
                                        <th className="p-3 w-1/4">Context</th>
                                        <th className="p-3">Coords (Earth Studio)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {scriptData.visualSync.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-800/50">
                                            <td className="p-3 font-mono text-purple-400">{row.timestamp}</td>
                                            <td className="p-3 font-bold text-gray-300">{row.shotType}</td>
                                            <td className="p-3 italic text-gray-500 select-all cursor-copy hover:text-white transition-colors" title="Click to copy">{row.aiPrompt}</td>
                                            <td className="p-3 text-gray-300">{row.voiceoverScript.substring(0, 50)}...</td>
                                            <td className="p-3 text-xs font-mono">{row.earthStudioCoords.lat.toFixed(4)}, {row.earthStudioCoords.lng.toFixed(4)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* HELP GUIDES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <h4 className="text-sm font-bold text-green-400 mb-2">🎧 Cách làm Audio & Âm thanh</h4>
                                <ol className="list-decimal list-inside text-xs text-gray-400 space-y-1">
                                    <li>Copy cột nội dung bên bảng <strong>Script</strong>.</li>
                                    <li>Dùng <strong>ElevenLabs</strong> hoặc <strong>Vbee/FPT.AI</strong> để chuyển văn bản thành giọng đọc (Voiceover).</li>
                                    <li>Chọn nhạc nền Deep/Sci-fi phù hợp với không khí tài liệu.</li>
                                </ol>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <h4 className="text-sm font-bold text-blue-400 mb-2">🎥 Cách làm Hình ảnh (Visuals)</h4>
                                <ol className="list-decimal list-inside text-xs text-gray-400 space-y-1">
                                    <li>Copy cột <strong>Prompt</strong> ở bảng Visual trên.</li>
                                    <li>Paste vào <strong>Runway Gen-3</strong>, <strong>Pika</strong> hoặc <strong>Kling AI</strong> để tạo video.</li>
                                    <li>Dùng <strong>Google Earth Studio</strong> với tọa độ (Coords) để quay cảnh flycam 3D thành phố.</li>
                                    <li>Ghép nối các clip lại khớp với thời gian (Time).</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FutureEyeTool;

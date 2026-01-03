// File: components/SeoTool.tsx (Hoàn Chỉnh Cuối Cùng)

import React, { useState, useRef } from 'react';
import { PhiIcon } from './AnimatedIcons'; //

interface SeoToolProps {
    onBack: () => void; //
}

// Enhanced interface OutputData với các trường mới
interface OutputData {
    performanceScore?: {
        overall: number;
        keywordRepetition: number;
        highVolumeTags: number;
        rankingTags: number;
    };
    titles?: {
        text: string;
        score: number;
        keywords: string[];
    }[];
    description?: {
        mainHashtags: string[];
        body: string;
        secondaryHashtags: string[];
    };
    tags?: {
        text: string;
        strength: 'Good' | 'Balanced';
    }[];
    thumbnailIdeas?: {
        concept: string;
        emotion: string;
        colors: string;
        facialExpression: string;
        objects: string;
        thumbnailText: string;
        fontSuggestion: string;
        composition: string;
    }[];

    // NEW FIELDS
    titleOptimized?: {
        text: string;
        reasoning: string;
        improvements: string[];
    };
    descriptionEnhanced?: {
        firstTwoLines: string;
        keywordMapping: {
            keyword: string;
            position: string;
        }[];
        competitorComparison: string;
        differentiation: string;
    };
    tagsEnhanced?: {
        highIntent: { text: string; reason: string }[];
        midTail: { text: string }[];
        entity: { text: string }[];
        related: { text: string }[];
        competitorOverlap: string[];
        weakTags: { text: string; reason: string }[];
    };
    thumbnailsEnhanced?: {
        angle: 'curiosity' | 'result' | 'contrarian';
        competitorAngle: string;
        differentiation: string;
        checklist: {
            textLength: boolean;
            singleMessage: boolean;
            clearEmotion: boolean;
        };
    }[];
    seoRealityCheck?: {
        topicDifficulty: 'easy' | 'medium' | 'saturated';
        difficultyExplanation: string;
        recommendations: string[];
        prePublishChecklist: {
            item: string;
            status: boolean;
            suggestion: string;
        }[];
    };
}


// --- Component Loader (fix not defined) ---
const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-32 h-32 text-[#008080]">
            <PhiIcon />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">ĐANG DÒ TÍN HIỆU...</p>
    </div>
);

// --- Component CopyButton tái sử dụng ---
const CopyButton: React.FC<{ textToCopy: string, onCopy: () => void, disabled?: boolean }> = ({ textToCopy, onCopy, disabled }) => (
    <button
        onClick={(e) => { // Ngăn event nổi bọt lên các phần tử cha
            e.stopPropagation();
            navigator.clipboard.writeText(textToCopy);
            onCopy();
        }}
        title="Sao chép"
        disabled={disabled}
        className="ml-2 text-[10px] px-1.5 py-0.5 bg-gray-700 border border-gray-600 hover:bg-gray-600 hover:border-gray-500 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
        Copy
    </button>
);


const SeoTool: React.FC<SeoToolProps> = ({ onBack }) => { //
    // --- Các state ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); //
    const [output, setOutput] = useState<OutputData | null>(null);
    const [coreIdea, setCoreIdea] = useState('');
    const [targetAudience, setTargetAudience] = useState('YouTuber mới');
    const [seoGoal, setSeoGoal] = useState('Watch Time');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [copySuccessTitle, setCopySuccessTitle] = useState<string[]>([]); // Per title
    const [copySuccessDesc, setCopySuccessDesc] = useState('');
    const [copySuccessTags, setCopySuccessTags] = useState('');
    const [copySuccessThumbnail, setCopySuccessThumbnail] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);  // Ref for file input

    // --- Hàm helper sao chép ---
    const handleCopyTitle = (index: number, text: string) => {
        navigator.clipboard.writeText(text);
        const newSuccess = [...copySuccessTitle];
        newSuccess[index] = 'Đã copy!';
        setCopySuccessTitle(newSuccess);
        setTimeout(() => {
            newSuccess[index] = '';
            setCopySuccessTitle([...newSuccess]);
        }, 2000);
    }; //

    const handleCopyDesc = () => {
        const fullDesc = [output?.description?.mainHashtags.slice(0, 5).join(' '), output?.description?.body, output?.description?.secondaryHashtags.slice(0, 10).join(' ')].filter(Boolean).join('\n');
        navigator.clipboard.writeText(fullDesc);
        setCopySuccessDesc('Đã copy!');
        setTimeout(() => setCopySuccessDesc(''), 2000);
    }; //

    const handleCopyTags = () => {
        navigator.clipboard.writeText(output?.tags?.map(t => t.text).join(', ') || '');
        setCopySuccessTags('Đã copy!');
        setTimeout(() => setCopySuccessTags(''), 2000);
    }; //

    const handleCopyThumbnail = (index: number, text: string) => {
        navigator.clipboard.writeText(text);
        const newSuccess = [...copySuccessThumbnail];
        newSuccess[index] = 'Đã copy!';
        setCopySuccessThumbnail(newSuccess);
        setTimeout(() => {
            newSuccess[index] = '';
            setCopySuccessThumbnail([...newSuccess]);
        }, 2000);
    };

    // --- Hàm xử lý file kịch bản (read and set to coreIdea) ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setCoreIdea(prev => prev + (prev ? '\n' : '') + content);  // Append to textarea if have
            };
            if (file.type === 'text/plain') {
                reader.readAsText(file);
            } else if (file.type === 'application/pdf') {
                alert('PDF support coming soon – dán text từ PDF vào textarea tạm thời.');
            } else {
                alert('Only TXT or PDF supported');
            }
        }
    };

    // --- Hàm submit (giữ nguyên, bỏ real-time, auto detect language for 10 popular) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coreIdea) {
            setError("Vui lòng nhập Ý Tưởng Video hoặc Kịch Bản.");
            return;
        }
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

        setIsLoading(true);
        setError('');
        setOutput(null);
        setCopySuccessTitle([]);
        setCopySuccessDesc('');
        setCopySuccessTags('');
        setCopySuccessThumbnail([]);

        try {
            // Auto detect language for 10 popular (fix regex)
            let language = 'English';  // Default
            if (/[àáâãäåæçèéêëìíîïđñòóôõöøùúûüýþÿ]/.test(coreIdea)) language = 'Tiếng Việt';
            else if (/[ぁ-ゟァ-ヿ]/.test(coreIdea)) language = 'Japanese';  // Fix range
            else if (/[가-힣]/.test(coreIdea)) language = 'Korean';
            else if (/[\u4e00-\u9fff]/.test(coreIdea)) language = 'Chinese';
            else if (/[ñáéíóúü]/.test(coreIdea)) language = 'Spanish';
            else if (/[àâéèêëîïôûùüçœæ]/.test(coreIdea)) language = 'French';
            else if (/[äöüß]/.test(coreIdea)) language = 'German';
            else if (/[а-яА-ЯёЁ]/.test(coreIdea)) language = 'Russian';
            else if (/[ًٌٍَُِْ]/.test(coreIdea)) language = 'Arabic';

            const response = await fetch('/api/seo-tool', {  // Assume backend endpoint, anh adjust if different
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coreIdea,  // Now can be script
                    targetAudience,
                    seoGoal,
                    outputLanguage: language,  // Auto set
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Lỗi server');

            setOutput(result as OutputData);
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể dò tín hiệu. Vui lòng thử lại."}`);
            console.error("Lỗi gọi API:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Phần JSX return (bỏ LÕI DỮ LIỆU, outputLanguage, thumbnail only copy) ---
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 bg-[#1a1a08] seo-tuner-bg">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#CDAD5A] tracking-wider">II. SEO YOUTUBE (SIGNAL TUNER)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* LEFT COLUMN - Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
                    {/* Input Core Idea / Script */}
                    <div>
                        <label className="text-sm font-bold text-[#CDAD5A] font-playfair">Y TƯỞNG VIDEO / KỊCH BẢN</label>
                        <textarea value={coreIdea} onChange={e => setCoreIdea(e.target.value)} placeholder="Nhập ý tưởng video, từ khóa chính, or dán kịch bản đầy đủ..." className="w-full h-24 obsidian-textarea focus:border-[#008080]"></textarea>
                        <input type="file" ref={fileInputRef} accept=".txt,.pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs px-3 py-1 bg-[#008080]/50 border border-[#008080] hover:bg-[#008080] transition-colors rounded-sm">Nhập File Kịch Bản</button>
                    </div>
                    {/* Target Audience */}
                    <div>
                        <label className="text-sm font-bold text-[#008080]">ĐỐI TƯỢNG MỤC TIÊU</label>
                        <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full obsidian-select">
                            <option>YouTuber mới</option>
                            <option>YouTuber chuyên nghiệp</option>
                            {/* Add more if needed */}
                        </select>
                    </div>
                    {/* SEO Goal */}
                    <div>
                        <label className="text-sm font-bold text-[#008080]">MỤC TIÊU SEO</label>
                        <select value={seoGoal} onChange={e => setSeoGoal(e.target.value)} className="w-full obsidian-select">
                            <option>Watch Time</option>
                            <option>Click Rate</option>
                            {/* Add more if needed */}
                        </select>
                    </div>
                    {/* Submit Button */}
                    <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? "ĐANG DÒ..." : "DÒ TÍN HIỆU"}
                    </button>
                    {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* RIGHT COLUMN - Output */}
                <div className="lg:col-span-7 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-2">
                    {/* Loading State */}
                    {isLoading && <Loader />}
                    {/* Initial State */}
                    {!isLoading && !output && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <div className="w-24 h-24 opacity-20"><PhiIcon /></div>
                            <p className="mt-4">Signal Tuner đang chờ lệnh...</p>
                        </div>
                    )}
                    {/* Output Display */}
                    {output && !isLoading && (
                        <>
                            {/* Performance Score */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">ĐIỂM HIỆU SUẤT</h3>
                                <div className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm space-y-2">
                                    <p><strong className="text-[#CDAD5A]">Tổng quan:</strong> {output.performanceScore?.overall || 0}/100</p>
                                    <p><strong className="text-[#CDAD5A]">Tần suất từ khóa:</strong> {output.performanceScore?.keywordRepetition || 0}/100</p>
                                    <p><strong className="text-[#CDAD5A]">Từ khóa có lưu lượng cao:</strong> {output.performanceScore?.highVolumeTags || 0}/100</p>
                                    <p><strong className="text-[#CDAD5A]">Từ khóa xếp hạng:</strong> {output.performanceScore?.rankingTags || 0}/100</p>
                                </div>
                            </div>

                            {/* Titles */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">Ý TƯỞNG TITLE</h3>
                                <div className="space-y-2">
                                    {output.titles?.map((title, i) => (
                                        <div key={i} className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm animate-decode" style={{ animationDelay: `${i * 100}ms` }}>
                                            <p className="font-semibold text-base text-gray-200">{title.text} <span className="text-gray-400">({title.score}/100)</span></p>
                                            <p className="text-xs text-gray-400 mt-1">Từ khóa: {title.keywords.join(', ')}</p>
                                            <CopyButton textToCopy={title.text} onCopy={() => handleCopyTitle(i, title.text)} />
                                            {copySuccessTitle[i] && <p className="text-xs text-green-400 mt-1">{copySuccessTitle[i]}</p>}
                                        </div>
                                    ))}

                                    {/* Title Tối Ưu Nhất - BASED ON REAL DATA */}
                                    {output.titleOptimized && (
                                        <div className="p-3 bg-[#008080]/10 border-2 border-[#008080] rounded-sm animate-decode" style={{ animationDelay: `${(output.titles?.length || 3) * 100}ms` }}>
                                            <p className="text-xs font-bold text-[#008080] mb-2 flex items-center gap-2">
                                                <span>✨</span> TITLE TỐI ƯU NHẤT (THEO DỮ LIỆU THỰC TẾ)
                                            </p>
                                            <p className="font-semibold text-base text-white mb-2">{output.titleOptimized.text}</p>
                                            <p className="text-xs text-gray-300 mb-2">💡 {output.titleOptimized.reasoning}</p>
                                            {output.titleOptimized.improvements.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-bold text-[#CDAD5A]">Cải thiện:</p>
                                                    {output.titleOptimized.improvements.map((imp, idx) => (
                                                        <p key={idx} className="text-xs text-gray-400">• {imp}</p>
                                                    ))}
                                                </div>
                                            )}
                                            <CopyButton textToCopy={output.titleOptimized.text} onCopy={() => handleCopyTitle(output.titles?.length || 0, output.titleOptimized!.text)} />
                                            {copySuccessTitle[output.titles?.length || 0] && <p className="text-xs text-green-400 mt-1">{copySuccessTitle[output.titles?.length || 0]}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">Ý TƯỞNG DESCRIPTION</h3>

                                {/* 2 Dòng Đầu Tối Ưu SEO */}
                                {output.descriptionEnhanced && (
                                    <div className="mb-3 p-2 bg-[#CDAD5A]/10 border border-[#CDAD5A]/50 rounded-sm">
                                        <p className="text-xs font-bold text-[#CDAD5A] mb-1">📝 2 DÒNG ĐẦU TỐI ƯU SEO</p>
                                        <p className="text-sm text-gray-200 italic">{output.descriptionEnhanced.firstTwoLines}</p>
                                    </div>
                                )}

                                {/* Keyword Mapping */}
                                {output.descriptionEnhanced?.keywordMapping && (
                                    <div className="mb-3 p-2 bg-black/20 border border-gray-700 rounded-sm">
                                        <p className="text-xs font-bold text-gray-300 mb-1">🎯 KEYWORD MAPPING</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                            {output.descriptionEnhanced.keywordMapping.map((km, i) => (
                                                <p key={i} className="text-xs text-gray-400">
                                                    <span className="text-[#008080]">•</span> <strong>{km.keyword}</strong>: {km.position}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Competitor Comparison */}
                                {output.descriptionEnhanced && (
                                    <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-sm">
                                        <p className="text-xs font-bold text-blue-400 mb-1">🔍 ĐỐI CHIẾU ĐỐI THỦ</p>
                                        <p className="text-xs text-gray-300">{output.descriptionEnhanced.competitorComparison}</p>
                                        {output.descriptionEnhanced.differentiation && (
                                            <p className="text-xs text-gray-400 mt-1">→ {output.descriptionEnhanced.differentiation}</p>
                                        )}
                                    </div>
                                )}

                                {/* Full Description */}
                                <div className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm">
                                    <p className="text-xs text-gray-300 whitespace-pre-line">{output.description?.mainHashtags.slice(0, 5).join(' ')}</p>
                                    <p className="text-xs text-gray-300 whitespace-pre-line mt-2">{output.description?.body}</p>
                                    <p className="text-xs text-gray-400 mt-2">{output.description?.secondaryHashtags.slice(0, 10).join(' ')}</p>
                                    {copySuccessDesc && <p className="text-xs text-green-400 mt-2">{copySuccessDesc}</p>}
                                    <CopyButton textToCopy={[output?.description?.mainHashtags.slice(0, 5).join(' '), output?.description?.body, output?.description?.secondaryHashtags.slice(0, 10).join(' ')].filter(Boolean).join('\n')} onCopy={handleCopyDesc} />
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">Ý TƯỞNG TAGS</h3>

                                {/* Tag Categorization */}
                                {output.tagsEnhanced ? (
                                    <div className="space-y-3">
                                        {/* High-Intent Tags */}
                                        {output.tagsEnhanced.highIntent.length > 0 && (
                                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm">
                                                <p className="text-xs font-bold text-green-400 mb-1.5">⭐ HIGH-INTENT TAGS (Ưu tiên cao)</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {output.tagsEnhanced.highIntent.map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded" title={tag.reason}>
                                                            {tag.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Mid-Tail Tags */}
                                        {output.tagsEnhanced.midTail.length > 0 && (
                                            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-sm">
                                                <p className="text-xs font-bold text-blue-400 mb-1.5">🎯 MID-TAIL TAGS</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {output.tagsEnhanced.midTail.map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                                                            {tag.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Entity/Topic Tags */}
                                        {output.tagsEnhanced.entity.length > 0 && (
                                            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-sm">
                                                <p className="text-xs font-bold text-purple-400 mb-1.5">🏷️ ENTITY / TOPIC TAGS</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {output.tagsEnhanced.entity.map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                                                            {tag.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Competitor Overlap */}
                                        {output.tagsEnhanced.competitorOverlap.length > 0 && (
                                            <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-sm">
                                                <p className="text-xs font-bold text-yellow-400">🔄 TAG TƯƠNG ĐỒNG VỚI TOP VIDEO</p>
                                                <p className="text-xs text-gray-400 mt-1">{output.tagsEnhanced.competitorOverlap.slice(0, 5).join(', ')}</p>
                                            </div>
                                        )}

                                        {/* Weak Tags */}
                                        {output.tagsEnhanced.weakTags.length > 0 && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                                                <p className="text-xs font-bold text-red-400 mb-1.5">⚠️ TAG NÊN LOẠI BỎ</p>
                                                {output.tagsEnhanced.weakTags.map((tag, i) => (
                                                    <p key={i} className="text-xs text-gray-400">
                                                        <span className="line-through text-gray-500">{tag.text}</span> - {tag.reason}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Original Tag Display */
                                    <div className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm">
                                        <div className="flex flex-wrap gap-2">
                                            {output.tags?.map((tag, i) => (
                                                <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${tag.strength === 'Good' ? 'bg-[#008080]/50 text-[#008080]' : 'bg-[#CDAD5A]/50 text-[#CDAD5A]'}`}>
                                                    {tag.text}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Copy All Tags */}
                                <div className="mt-2">
                                    {copySuccessTags && <p className="text-xs text-green-400 mb-1">{copySuccessTags}</p>}
                                    <CopyButton textToCopy={output?.tags?.map(t => t.text).join(', ') || ''} onCopy={handleCopyTags} />
                                </div>
                            </div>

                            {/* Thumbnail Ideas (3 Columns, Only Copy) */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">Ý TƯỞNG THUMBNAIL (A/B Test)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {output.thumbnailIdeas?.map((idea, i) => {
                                        const enhanced = output.thumbnailsEnhanced?.[i];
                                        return (
                                            <div key={i} className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm animate-decode" style={{ animationDelay: `${(i + 5) * 100}ms` }}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-base text-gray-200 pr-4">{idea.thumbnailText}</span>
                                                </div>

                                                {/* Angle Badge */}
                                                {enhanced && (
                                                    <div className="mb-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${enhanced.angle === 'curiosity' ? 'bg-purple-500/20 text-purple-400' :
                                                                enhanced.angle === 'result' ? 'bg-blue-500/20 text-blue-400' :
                                                                    'bg-orange-500/20 text-orange-400'
                                                            }`}>
                                                            {enhanced.angle === 'curiosity' ? '🔮 CURIOSITY' :
                                                                enhanced.angle === 'result' ? '✅ RESULT' :
                                                                    '⚡ CONTRARIAN'}
                                                        </span>
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-400 mt-1">Cấu trúc Thumbnail:</p>
                                                <ul className="list-disc list-inside text-xs text-gray-300 pl-2">
                                                    <li>Concept: {idea.concept}</li>
                                                    <li>Emotion: {idea.emotion}</li>
                                                    <li>Colors: {idea.colors}</li>
                                                    <li>Facial Expression: {idea.facialExpression}</li>
                                                    <li>Objects: {idea.objects}</li>
                                                    <li>Font Suggestion: {idea.fontSuggestion}</li>
                                                    <li>Composition: {idea.composition}</li>
                                                </ul>

                                                {/* Differentiation Note */}
                                                {enhanced && (
                                                    <p className="text-xs text-gray-400 mt-2 p-1.5 bg-black/40 rounded">
                                                        💡 {enhanced.differentiation}
                                                    </p>
                                                )}

                                                {/* Checklist */}
                                                {enhanced && (
                                                    <div className="mt-2 text-xs">
                                                        <p className={enhanced.checklist.textLength ? 'text-green-400' : 'text-yellow-400'}>
                                                            {enhanced.checklist.textLength ? '✓' : '⚠'} Text ≤ 4 từ
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 mt-2">
                                                    <CopyButton textToCopy={idea.thumbnailText} onCopy={() => handleCopyThumbnail(i, idea.thumbnailText)} />
                                                </div>
                                                {copySuccessThumbnail[i] && <p className="text-xs text-green-400 mt-1">{copySuccessThumbnail[i]}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SEO Reality Check - NEW SECTION */}
                            {output.seoRealityCheck && (
                                <div className="p-4 bg-gradient-to-br from-[#008080]/10 to-[#CDAD5A]/10 border-2 border-[#008080] rounded-sm">
                                    <h3 className="text-lg font-bold text-white mb-3 font-playfair flex items-center gap-2">
                                        <span>📊</span> SEO REALITY CHECK
                                    </h3>

                                    {/* Topic Difficulty */}
                                    <div className="mb-3">
                                        <p className="text-sm font-bold text-gray-300 mb-1.5">Độ khó chủ đề:</p>
                                        <span className={`inline-block px-3 py-1.5 rounded text-sm font-bold ${output.seoRealityCheck.topicDifficulty === 'easy' ? 'bg-green-500 text-white' :
                                                output.seoRealityCheck.topicDifficulty === 'medium' ? 'bg-yellow-500 text-black' :
                                                    'bg-red-500 text-white'
                                            }`}>
                                            {output.seoRealityCheck.topicDifficulty === 'easy' ? '🟢 DỄ TIẾP CẬN' :
                                                output.seoRealityCheck.topicDifficulty === 'medium' ? '🟡 CẠNH TRANH VỪA' :
                                                    '🔴 BÃO HÒA'}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">{output.seoRealityCheck.difficultyExplanation}</p>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="mb-3">
                                        <p className="text-sm font-bold text-gray-300 mb-1.5">Khuyến nghị hành động:</p>
                                        <div className="space-y-1">
                                            {output.seoRealityCheck.recommendations.map((rec, i) => (
                                                <p key={i} className="text-sm text-gray-200 pl-2">• {rec}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pre-publish Checklist */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-300 mb-2">✓ Checklist trước khi đăng:</p>
                                        <div className="space-y-2">
                                            {output.seoRealityCheck.prePublishChecklist.map((item, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm p-2 bg-black/20 rounded">
                                                    <span className="text-lg">{item.status ? '✅' : '⚠️'}</span>
                                                    <div className="flex-1">
                                                        <span className={item.status ? 'text-green-400' : 'text-yellow-400 font-semibold'}>
                                                            {item.item}
                                                        </span>
                                                        {!item.status && item.suggestion && (
                                                            <p className="text-xs text-gray-400 mt-0.5 ml-4">→ {item.suggestion}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-[#1a1a08]/80 backdrop-blur-sm">
                                <button onClick={() => alert('Đang phát triển...')} className="flex-grow bg-[#008080] text-white font-bold py-2 px-5 border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080]">LƯU VÀO ARCHIVE LOG</button>
                                <span className="w-24"></span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    ); //
};

export default SeoTool; //
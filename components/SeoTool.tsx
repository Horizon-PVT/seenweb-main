// File: components/SeoTool.tsx (Hoàn Chỉnh Cuối Cùng)

import React, { useState, useRef } from 'react';
import { PhiIcon } from './AnimatedIcons'; //

interface SeoToolProps {
  onBack: () => void; //
}

// Giữ lại interface OutputData để ép kiểu kết quả từ backend
interface OutputData {
  performanceScore?: {
    overall: number;
    keywordRepetition: number; //
    highVolumeTags: number;
    rankingTags: number;
  };
  titles?: {
    text: string;
    score: number;
    keywords: string[];
  }[]; //
  description?: {
    mainHashtags: string[];
    body: string; //
    secondaryHashtags: string[];
  };
  tags?: {
    text: string;
    strength: 'Good' | 'Balanced'; //
  }[];
  thumbnailIdeas?: {
    concept: string;
    emotion: string;
    colors: string;
    facialExpression: string;
    objects: string;
    thumbnailText: string; //
    fontSuggestion: string;
    composition: string; //
  }[];
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
                        <input type="file" ref={fileInputRef} accept=".txt,.pdf" onChange={handleFileUpload} style={{display: 'none'}} />
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
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">Y TƯỞNG TITLE</h3>
                                <div className="space-y-2">
                                    {output.titles?.map((title, i) => (
                                        <div key={i} className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm animate-decode" style={{animationDelay: `${i*100}ms`}}>
                                            <p className="font-semibold text-base text-gray-200">{title.text} <span className="text-gray-400">({title.score}/100)</span></p>
                                            <p className="text-xs text-gray-400 mt-1">Từ khóa: {title.keywords.join(', ')}</p>
                                            <CopyButton textToCopy={title.text} onCopy={() => handleCopyTitle(i, title.text)} />
                                            {copySuccessTitle[i] && <p className="text-xs text-green-400 mt-1">{copySuccessTitle[i]}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">Y TƯỞNG DESCRIPTION</h3>
                                <div className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm">
                                    <p className="text-xs text-gray-300 whitespace-pre-line">{output.description?.mainHashtags.slice(0, 5).join(' ')}</p>
                                    <p className="text-xs text-gray-300 whitespace-pre-line mt-2">{output.description?.body}</p>
                                    <p className="text-xs text-gray-400 mt-2">{output.description?.secondaryHashtags.slice(0, 10).join(' ')}</p>
                                    {copySuccessDesc && <p className="text-xs text-green-400">{copySuccessDesc}</p>}
                                    <CopyButton textToCopy={[output?.description?.mainHashtags.slice(0, 5).join(' '), output?.description?.body, output?.description?.secondaryHashtags.slice(0, 10).join(' ')].filter(Boolean).join('\n')} onCopy={handleCopyDesc} />
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">Y TƯỞNG TAGS</h3>
                                <div className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm">
                                    <div className="flex flex-wrap gap-2">
                                        {output.tags?.map((tag, i) => (
                                            <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${tag.strength === 'Good' ? 'bg-[#008080]/50 text-[#008080]' : 'bg-[#CDAD5A]/50 text-[#CDAD5A]'}`}>
                                                {tag.text}
                                            </span>
                                        ))}
                                    </div>
                                    {copySuccessTags && <p className="text-xs text-green-400 mt-2">{copySuccessTags}</p>}
                                    <CopyButton textToCopy={output?.tags?.map(t => t.text).join(', ') || ''} onCopy={handleCopyTags} />
                                </div>
                            </div>

                            {/* Thumbnail Ideas (3 Columns, Only Copy) */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 font-playfair">Y TƯỞNG THUMBNAIL (A/B Test)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {output.thumbnailIdeas?.map((idea, i) => (
                                        <div key={i} className="p-3 bg-black/40 border border-[#CDAD5A]/50 rounded-sm animate-decode" style={{animationDelay: `${(i+5)*100}ms`}}>
                                            <div className="flex justify-between items-start">
                                                <span className="font-semibold text-base text-gray-200 pr-4">{idea.thumbnailText}</span>
                                            </div>
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
                                            <div className="flex gap-2 mt-2">
                                                <CopyButton textToCopy={idea.thumbnailText} onCopy={() => handleCopyThumbnail(i, idea.thumbnailText)} />
                                            </div>
                                            {copySuccessThumbnail[i] && <p className="text-xs text-green-400 mt-1">{copySuccessThumbnail[i]}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-[#1a1a08]/80 backdrop-blur-sm"> {/* */}
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
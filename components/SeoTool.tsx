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
    // Thu nhỏ nút copy một chút
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
    const [useGrounding, setUseGrounding] = useState(true); //
    const [targetAudience, setTargetAudience] = useState('YouTuber mới');
    const [seoGoal, setSeoGoal] = useState('Watch Time');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [copySuccessTitle, setCopySuccessTitle] = useState('');
    const [copySuccessDesc, setCopySuccessDesc] = useState('');
    const [copySuccessTags, setCopySuccessTags] = useState('');

    // --- Các hàm helper ---
    const showCopySuccess = (setter: React.Dispatch<React.SetStateAction<string>>) => {
        setter('✓ Copied!');
        setTimeout(() => setter(''), 1500);
    };

    // --- Hàm handleSubmit (Gọi Backend /api/seo-tool) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coreIdea) { setError("Vui lòng nhập Ý TƯỞNG VIDEO."); return; } //
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);
        setIsLoading(true); setError(''); setOutput(null);
        setCopySuccessTitle(''); setCopySuccessDesc(''); setCopySuccessTags('');
        try {
            const response = await fetch('/api/seo-tool', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, //
                body: JSON.stringify({ coreIdea, useGrounding, targetAudience, seoGoal }),
            });
            const result: any = await response.json(); //
            if (!response.ok) { throw new Error(result.error || `Lỗi ${response.status}`); } //
            if (!result.titles || !result.description || !result.tags) { throw new Error("Dữ liệu trả về từ API không đầy đủ cấu trúc."); } //
            setOutput(result as OutputData); //
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể tạo phản hồi."}`); //
            console.error("Lỗi gọi API /api/seo-tool:", err); //
        } finally {
            setIsLoading(false); //
        }
    };

    // --- Hàm highlightKeywords ---
    const highlightKeywords = (text: string, keywords: string[] = []) => {
         if (!keywords || !keywords.length) return text;
         const regex = new RegExp(`(${keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi'); //
         return text.split(regex).map((part, i) =>
             keywords.some(kw => new RegExp(`^${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i').test(part))
                 ? <span key={i} className="text-[#CDAD5A] font-bold">{part}</span>
                 : part
         ); //
     };

    // --- Phần JSX return ---
    return (
        <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-4 bg-[#000000] bg-opacity-30" style={{backgroundImage: 'linear-gradient(rgba(0,128,128,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.02) 1px, transparent 1px)', backgroundSize: '2rem 2rem'}}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl text-center font-playfair text-[#008080] tracking-wider">II. SEO YOUTUBE (SIGNAL TUNER)</h2>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2">&times; Trở Về</button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                {/* LEFT COLUMN - Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col space-y-4 pr-2 overflow-y-auto">
                   {/* Input Fields - Giống file gốc */}
                   <div>
                       <label className="text-sm font-bold text-[#CDAD5A] font-playfair">Ý TƯỞNG VIDEO</label>
                       <textarea value={coreIdea} onChange={e => setCoreIdea(e.target.value)} placeholder="Mô tả ý tưởng video và từ khóa chính cần SEO..." className="w-full h-32 obsidian-textarea focus:border-[#008080]"></textarea>
                   </div>
                   <div>
                       <label className="text-sm font-bold text-[#008080]">LÕI DỮ LIỆU</label>
                       <div className="flex items-center justify-between p-2 bg-[#0A0A0A] border border-[#4A4A4A] rounded-sm">
                           <span className="text-gray-300 text-xs">Sử dụng dữ liệu thời gian thực (Google Search)</span>
                           <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" checked={useGrounding} onChange={() => setUseGrounding(!useGrounding)} className="sr-only peer" />
                             <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008080]"></div>
                           </label>
                       </div>
                   </div>
                    <div>
                       <label className="text-sm font-bold text-[#CDAD5A] font-playfair">ĐỐI TƯỢNG MỤC TIÊU</label>
                       <input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full obsidian-input focus:border-[#008080]" />
                   </div>
                   <div>
                       <label className="text-xs font-bold text-[#CDAD5A]">MỤC TIÊU SEO</label>
                       <select value={seoGoal} onChange={e => setSeoGoal(e.target.value)} className="w-full obsidian-select">
                           <option>CTR</option>
                           <option>Watch Time</option>
                           <option>Subscribe</option>
                       </select>
                   </div>
                   {/* Submit Button */}
                   <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                       {isLoading ? "ĐANG DÒ TÌM TÍN HIỆU..." : "TINH CHẾ TÍN HIỆU"}
                   </button>
                   {/* Error Message */}
                   {error && <p className="text-red-500 text-center text-xs">{error}</p>}
                </form>

                {/* RIGHT COLUMN - Output */}
                <div className="lg:col-span-7 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-2">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-24 h-24 text-[#008080] relative">
                                <PhiIcon /> {/* */}
                                <div className="absolute inset-0 border-2 border-[#008080]/50 rounded-full animate-radar-ping"></div>
                                <div className="absolute inset-0 border-2 border-[#008080]/30 rounded-full animate-radar-ping" style={{animationDelay: '0.5s'}}></div> {/* */}
                            </div>
                            <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">ĐANG DÒ TÌM TÍN HIỆU...</p>
                        </div>
                    )}

                    {/* Output Display State */}
                    {output && !isLoading && (
                        <>
                            {/* Performance Score Section */}
                            {output.performanceScore && (
                                <div className="p-4 border-2 border-[#CDAD5A] bg-gradient-to-br from-[#CDAD5A]/10 to-black rounded-sm bronze-glow"> {/* */}
                                    <h3 className="text-sm font-bold text-white mb-2">BẢNG ĐÁNH GIÁ CHẤT LƯỢNG SEO</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"> {/* */}
                                        <div>
                                            <p className="text-3xl font-bold text-[#CDAD5A]">{output.performanceScore.overall}/100</p>
                                            <p className="text-xs text-gray-400">Điểm Tối Ưu</p> {/* */}
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-[#008080] flex items-center justify-center gap-1">✅ {output.performanceScore.keywordRepetition}/5</p>
                                            <p className="text-xs text-gray-400">Từ khóa Lặp lại</p> {/* */}
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-[#008080] flex items-center justify-center gap-1">✅ {output.performanceScore.highVolumeTags}/5</p>
                                            <p className="text-xs text-gray-400">Tags (High Volume)</p> {/* */}
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-[#008080] flex items-center justify-center gap-1">✅ {output.performanceScore.rankingTags}/5</p>
                                            <p className="text-xs text-gray-400">Tags (Ranking)</p> {/* */}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Titles Section */}
                            {output.titles && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-white flex items-center">
                                            KẾT QUẢ TIÊU ĐỀ (TITLE - MAX SPEC)
                                            <CopyButton
                                                textToCopy={output.titles.map(t => t.text).join('\n')}
                                                onCopy={() => showCopySuccess(setCopySuccessTitle)}
                                                disabled={isLoading}
                                            />
                                            <span className="text-xs text-[#008080] w-20 text-right ml-1">{copySuccessTitle}</span>
                                        </h3>
                                    </div>
                                    <div className="space-y-2"> {/* */}
                                        {output.titles.map((title, i) => ( //
                                            <div key={i} className={`p-3 border rounded-sm transition-all ${title.score > 90 ? 'border-[#008080] bg-[#008080]/10 animate-title-pulse' : 'border-gray-700'}`}> {/* */}
                                                <div className="flex justify-between items-start">
                                                    <p className="font-semibold text-gray-200 pr-4">{highlightKeywords(title.text, title.keywords)}</p> {/* */}
                                                    <span className="text-lg font-bold text-[#008080]">{title.score}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description Section */}
                            {output.description && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-white flex items-center">
                                            KẾT QUẢ MÔ TẢ (DESCRIPTION - MAX SPEC)
                                             <CopyButton
                                                textToCopy={`${output.description.mainHashtags.join(' ')}\n\n${output.description.body}\n\n${output.description.secondaryHashtags.join(' ')}`}
                                                onCopy={() => showCopySuccess(setCopySuccessDesc)}
                                                disabled={isLoading}
                                            />
                                             <span className="text-xs text-[#008080] w-20 text-right ml-1">{copySuccessDesc}</span>
                                        </h3>
                                    </div>
                                    <div className="p-3 border border-gray-700 rounded-sm bg-[#0A0A0A] text-gray-300 text-xs font-mono">
                                        <p className="text-[#008080]">{output.description.mainHashtags.join(' ')}</p>
                                        <div className="my-4 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: output.description.body.replace(/\n/g, '<br />') }} /> {/* */}
                                        <p className="text-[#008080]">{output.description.secondaryHashtags.join(' ')}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tags Section */}
                            {output.tags && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-white flex items-center">
                                            KẾT QUẢ THẺ TAGS (TAGS - MAX SPEC) {/* */}
                                            <CopyButton
                                                textToCopy={output.tags.map(t => t.text).join(', ')}
                                                onCopy={() => showCopySuccess(setCopySuccessTags)}
                                                disabled={isLoading}
                                            />
                                             <span className="text-xs text-[#008080] w-20 text-right ml-1">{copySuccessTags}</span>
                                        </h3>
                                    </div>
                                    <div className="p-3 border border-gray-700 rounded-sm bg-[#0A0A0A] flex flex-wrap gap-2"> {/* */}
                                        {output.tags.map((tag, i) => ( //
                                            <span key={i} className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors ${tag.strength === 'Good' ? 'bg-emerald-800/50 text-emerald-300 hover:bg-emerald-700/50' : 'bg-yellow-800/50 text-yellow-300 hover:bg-yellow-700/50'}`}> {/* */}
                                                {tag.text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Thumbnail Ideas Section */}
                            {output.thumbnailIdeas && ( //
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-2">Ý TƯỞNG THUMBNAIL (A/B Test)</h3> {/* */}
                                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                                        {output.thumbnailIdeas.map((idea, i) => ( //
                                            <div key={i} className="p-3 border border-gray-700 rounded-sm bg-[#0A0A0A] space-y-2 flex flex-col">
                                                <p><strong className="text-[#CDAD5A]">Concept:</strong> {idea.concept}</p>
                                                <p><strong className="text-[#CDAD5A]">Mục tiêu:</strong> {idea.emotion}</p> {/* */}
                                                <p><strong className="text-[#CDAD5A]">Bố cục:</strong> {idea.composition}</p>
                                                <p><strong className="text-[#CDAD5A]">Text:</strong> "{idea.thumbnailText}" <span className="text-gray-400">({idea.fontSuggestion})</span></p> {/* */}
                                                <p><strong className="text-[#CDAD5A]">Màu sắc:</strong> {idea.colors}</p>
                                                <p><strong className="text-[#CDAD5A]">Chi tiết:</strong> {idea.facialExpression} & {idea.objects}</p> {/* */}
                                                <button onClick={() => alert("Chức năng đang được xây dựng để kết nối với công cụ TẠO ẢNH.")} className="mt-auto text-xs p-1 bg-[#008080]/50 border border-[#008080] hover:bg-[#008080] transition-colors rounded-sm w-full">Tạo Ảnh</button> {/* */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Nút lưu log */}
                             <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-black/80 backdrop-blur-sm">
                                {/* Bỏ nút Copy All nếu không cần */}
                                {/* <button onClick={handleCopyAll} className="...">COPY ALL</button> */}
                                <button onClick={() => alert("Chức năng đang được xây dựng!")} className="flex-grow bg-transparent text-[#CDAD5A] font-bold py-2 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all hover:bg-[#CDAD5A] hover:text-black">LƯU VÀO ARCHIVE LOG</button> {/* */}
                                {/* Giữ khoảng trống để căn chỉnh nếu cần */}
                                <span className="w-24"></span>
                            </div>
                        </>
                    )}

                    {/* Placeholder khi không loading và không có output */}
                     {!isLoading && !output && (
                         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <div className="w-24 h-24 opacity-20"><PhiIcon /></div>
                             <p className="mt-4">Sẵn sàng dò tìm tín hiệu...</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    ); //
};

export default SeoTool; //
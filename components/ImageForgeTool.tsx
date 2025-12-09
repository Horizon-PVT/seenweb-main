// File: components/ImageForgeTool.tsx (Hoàn Chỉnh - Đã sửa lỗi nút Tải Xuống)

import React, { useState, useRef, useEffect } from 'react';
// Xóa hết import liên quan GoogleGenAI
import { AssemblingCubeIcon } from './AnimatedIcons'; //

interface ImageForgeToolProps {
  onBack: () => void; //
}

// Giữ nguyên helper fileToBase64
const fileToBase64 = (file: File): Promise<string> => { //
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error); //
    });
}; //

// Giữ nguyên các hằng số styles, emotions
const styles = [
    "Nhiếp ảnh thực tế", "Nghệ thuật số", "Điện ảnh", "Truyện tranh",
    "Kết xuất 3D", "Tranh sơn dầu", "Màu nước", "Hoạt hình Nhật Bản (Anime)",
    "Cyberpunk", "Steampunk", "Giả tưởng (Fantasy)", "Gothic",
    "Tối giản (Minimalist)", "Cổ điển (Vintage)", "Siêu thực (Surrealism)"
]; //
const emotions = [
    "Tự tin", "Sốc", "Tò mò", "Tức giận",
    "Hạnh phúc", "Buồn bã", "Ngạc nhiên", "Sợ hãi", "Bình yên"
]; //

// Giữ nguyên Loader
const Loader: React.FC<{text?: string}> = ({text = "ĐANG RÈN HÌNH ẢNH..."}) => ( //
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-32 h-32 text-[#008080]">
            <AssemblingCubeIcon />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">{text}</p>
    </div>
); //

// Bắt đầu Component
const ImageForgeTool: React.FC<ImageForgeToolProps> = ({ onBack }) => { //
    // --- Các state giữ nguyên ---
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false); //
    const [isBatchGenerating, setIsBatchGenerating] = useState(false);
    const [batchProgress, setBatchProgress] = useState('');
    const [error, setError] = useState(''); //
    const [generatedImages, setGeneratedImages] = useState<string[]>([]); //
    const [archive, setArchive] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null); //
    const [filteredImages, setFilteredImages] = useState<Set<string>>(new Set()); //
    const [activeTab, setActiveTab] = useState<'single' | 'script'>('single'); //
    const [prompt, setPrompt] = useState(''); //
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16'>('16:9'); //
    const [style, setStyle] = useState(styles[0]); //
    const [emotion, setEmotion] = useState(emotions[0]);
    const [numImages, setNumImages] = useState(1); //
    const [inlayText, setInlayText] = useState(''); //
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [negativePrompt, setNegativePrompt] = useState(''); //
    const [seed, setSeed] = useState('');
    const [faceLockFiles, setFaceLockFiles] = useState<File[]>([]); //
    const [layoutCloneFile, setLayoutCloneFile] = useState<File | null>(null); //
    const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null); //
    const [script, setScript] = useState(''); //
    const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null); //

    // --- useEffect load Archive ---
    useEffect(() => { //
        try {
            const storedArchive = localStorage.getItem('imageForgeArchive');
            if (storedArchive) { setArchive(JSON.parse(storedArchive)); }
        } catch (e) { console.error("Failed to load archive from localStorage", e); } //
    }, []);

    // --- Hàm updateArchive (vẫn có thể báo lỗi Quota) ---
    const updateArchive = (newImages: string[]) => { //
        setArchive(prev => {
            const updated = [...newImages, ...prev].slice(0, 100); // Giới hạn 100 ảnh
            try {
                localStorage.setItem('imageForgeArchive', JSON.stringify(updated)); //
            } catch (e: any) {
                // Hiển thị lỗi quota một cách thân thiện hơn
                if (e.name === 'QuotaExceededError') { //
                    setError("Lỗi: Bộ nhớ lưu trữ ảnh cũ đã đầy. Vui lòng xóa bớt ảnh cũ hoặc liên hệ hỗ trợ.");
                } else {
                    console.error("Failed to save archive to localStorage", e); //
                }
                 // Không ném lỗi ra ngoài để hàm gọi nó không bị dừng
            }
            return updated;
        });
    }; //

    // --- Hàm handleDownload (Logic không đổi) ---
    const handleDownload = (imageUrl: string) => { //
        const link = document.createElement('a');
        link.href = imageUrl; //
        link.download = `seenvt-forge-${new Date().getTime()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Hàm toggleObsidianFilter giữ nguyên ---
    const toggleObsidianFilter = (e: React.MouseEvent, imgSrc: string) => { //
        e.stopPropagation(); //
        setFilteredImages(prev => { //
            const newSet = new Set(prev);
            if (newSet.has(imgSrc)) { //
                newSet.delete(imgSrc);
            } else {
                newSet.add(imgSrc);
            }
            return newSet; //
        });
    }; //

    // --- HÀM handleSubmit (Gọi Backend /api/image-forge) - Đã sửa ---
    const handleSubmit = async (e: React.FormEvent) => { //
        e.preventDefault();
        if (activeTab === 'single' && !prompt && !referenceImageFile) { setError("Vui lòng nhập Lời Khai Sáng hoặc tải Ảnh Tham Chiếu."); return; } //
        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);
        setIsLoading(true); setError('');
        let payload: any = { numImages: numImages, aspectRatio: aspectRatio }; //
        let fullPrompt = prompt || "Generate image based on reference"; //
        if (inlayText) { fullPrompt += `... ${inlayText.toUpperCase()} ...`; } //
        if (faceLockFiles.length > 0) { fullPrompt += `... face consistent ...`; } //
        if (layoutCloneFile) { fullPrompt += `... replicate layout ...`; } //
        fullPrompt += `, style: ${style}, emotion: ${emotion}.`; //
        payload.prompt = fullPrompt; //
        if (isAdvancedMode) { if (negativePrompt) payload.negativePrompt = negativePrompt; if (seed) payload.seed = seed; } //
        if (referenceImageFile) { //
            try {
                payload.referenceImageBase64 = await fileToBase64(referenceImageFile); //
                payload.referenceImageMimeType = referenceImageFile.type; //
                payload.numImages = 1; // Giới hạn khi có ref
            } catch (fileError: any) { setError(`Lỗi xử lý file: ${fileError.message}`); setIsLoading(false); return; } //
        }
        try { //
            const response = await fetch('/api/image-forge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); //
            const result: any = await response.json(); //
            if (!response.ok) { throw new Error(result.error || `Lỗi ${response.status}`); } //
            if (!result.generatedImages || result.generatedImages.length === 0) { throw new Error("Backend không trả về ảnh."); } //
            setGeneratedImages(prev => [...result.generatedImages, ...prev]); //
            updateArchive(result.generatedImages); //
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể hợp thành."}`); //
            console.error("Lỗi /api/image-forge:", err); //
        } finally {
            setIsLoading(false); //
        }
    };

    // --- HÀM handleAnalyzeScript MỚI (Gọi Backend /api/analyze-script) ---
    const handleAnalyzeScript = async () => { //
        if (!script) { setError("Vui lòng dán kịch bản vào ô."); return; } //
        setIsAnalyzing(true); setError(''); setGeneratedPrompts([]); //

        try {
            // Gọi backend /api/analyze-script
            const response = await fetch('/api/analyze-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script }), // Gửi script đi
            });

            const result: any = await response.json(); // Backend trả { prompts: [...] }

            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${response.status}`);
            }

            if (!result.prompts) {
                 throw new Error("Backend không trả về danh sách prompts.");
            }

            setGeneratedPrompts(result.prompts); //

        } catch (err: any) {
            setError(`Lỗi phân tích: ${err.message || "Không thể phân tích kịch bản."}`); //
            console.error("Lỗi gọi API /api/analyze-script:", err); //
        } finally {
            setIsAnalyzing(false); //
        }
    };


    // --- HÀM handleBatchGenerate MỚI (Gọi Backend /api/image-forge lặp lại) ---
    const handleBatchGenerate = async () => { //
        if (generatedPrompts.length === 0) return;
        setIsBatchGenerating(true); setError(''); //
        let generatedCount = 0; //
        for (let i = 0; i < generatedPrompts.length; i++) { //
            const currentPrompt = generatedPrompts[i];
            setBatchProgress(`ĐANG TẠO ẢNH ${i + 1}/${generatedPrompts.length}...`); //
            try {
                // Gọi backend cho từng prompt
                const response = await fetch('/api/image-forge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }, //
                    body: JSON.stringify({ prompt: currentPrompt, numImages: 1, aspectRatio: '16:9' }), //
                });
                const result: any = await response.json(); //
                if (!response.ok) { throw new Error(result.error || `Lỗi ${response.status} ảnh ${i+1}`); } //
                if (!result.generatedImages || result.generatedImages.length === 0) { throw new Error(`Backend lỗi ảnh ${i+1}.`); } //
                setGeneratedImages(prev => [...result.generatedImages, ...prev]); //
                updateArchive(result.generatedImages); //
                generatedCount++; //
                if (i < generatedPrompts.length - 1) { await new Promise(resolve => setTimeout(resolve, 5000)); } // Nghỉ 5s
            } catch (err: any) {
                setError(`Lỗi ảnh ${i+1}: ${err.message}. Đã tạo ${generatedCount} ảnh.`); //
                console.error(`Lỗi batch ${i+1}:`, err);
                break; //
            }
        }
        setIsBatchGenerating(false); setBatchProgress(''); //
    };

    // --- CÁC HÀM RENDER JSX (Lấy từ file gốc 1.txt - Đầy Đủ) ---
    const renderSingleGenerator = () => ( //
        <form onSubmit={handleSubmit} className="lg:col-span-4 flex flex-col space-y-3 pr-2 overflow-y-auto">
            {/* Lời Khai Sáng */}
            <div>
                <label className="text-sm font-bold text-[#CDAD5A] font-playfair">LỜI KHAI SÁNG</label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Mô tả chi tiết hình ảnh bạn muốn tạo..." className="w-full h-28 obsidian-textarea focus:border-[#008080]"></textarea> {/* */}
            </div>
            {/* ADVANCED FEATURES */}
            <div className="space-y-3 text-xs"> {/* */}
                {/* Ảnh Tham Chiếu */}
                <div>
                   <label className="text-xs font-bold text-[#CDAD5A] uppercase">Ảnh Tham Chiếu (Image-to-Image)</label>
                   <div className="p-2 mt-1 file-input-area rounded-sm text-center"> {/* */}
                       <input type="file" accept="image/*" id="reference-image-input" className="hidden" onChange={e => setReferenceImageFile(e.target.files ? e.target.files[0] : null)} /> {/* */}
                       <label htmlFor="reference-image-input" className="cursor-pointer text-gray-400 hover:text-white">
                         {referenceImageFile ? referenceImageFile.name : "Tải ảnh lên để tái tạo (khuyến khích)"} {/* */}
                       </label>
                   </div>
                   {referenceImageFile && <p className="text-yellow-400 text-center mt-1">Chế độ tham chiếu đã kích hoạt. Các tùy chọn tỷ lệ và số lượng sẽ bị khóa.</p>} {/* */}
                </div>
                {/* Thép Văn Bản */}
                <div>
                  <label className="text-xs font-bold text-[#CDAD5A]">THÉP VĂN BẢN</label>
                  <input type="text" value={inlayText} onChange={e => setInlayText(e.target.value)} placeholder="Văn bản cần chèn (in hoa)..." className="w-full obsidian-input !p-2" /> {/* */}
                </div>
                {/* Face Lock */}
                <div>
                   <label className="text-xs font-bold text-white">FACE LOCK (KHÓA KHUÔN MẶT) <span className="text-yellow-400 font-black p-1 bg-yellow-600/30 rounded-sm">TOÀN TRI</span></label> {/* */}
                   <div className="p-2 mt-1 file-input-area rounded-sm text-center">
                       <input type="file" multiple accept="image/*" id="face-lock-input" className="hidden" onChange={e => setFaceLockFiles(Array.from(e.target.files || []))} /> {/* */}
                       <label htmlFor="face-lock-input" className="cursor-pointer text-gray-400 hover:text-white">
                         {faceLockFiles.length > 0 ? `${faceLockFiles.length} ảnh đã chọn` : "Tải lên 5-10 ảnh tham chiếu"} {/* */}
                       </label>
                   </div>
                </div>
                {/* Clone Bố Cục */}
                 <div> {/* */}
                   <label className="text-xs font-bold text-gray-400">CLONE BỐ CỤC</label> {/* */}
                   <div className="p-2 mt-1 file-input-area rounded-sm text-center">
                       <input type="file" accept="image/*" id="layout-clone-input" className="hidden" onChange={e => setLayoutCloneFile(e.target.files ? e.target.files[0] : null)} /> {/* */}
                       <label htmlFor="layout-clone-input" className="cursor-pointer text-gray-400 hover:text-white">
                         {layoutCloneFile ? layoutCloneFile.name : "Tải lên ảnh tham chiếu bố cục"} {/* */}
                       </label>
                   </div>
                </div>
            </div>
            {/* Lò Rèn Tham Số */}
            <div> {/* */}
              <label className="text-sm font-bold text-[#008080]">LÒ RÈN THAM SỐ</label> {/* */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                   {/* Tỷ lệ */}
                   <div> {/* */}
                       <label className="text-xs font-bold text-gray-400">Tỷ lệ</label> {/* */}
                       <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full obsidian-select" disabled={!!referenceImageFile}>
                           <option value="16:9">16:9 (Thumbnail)</option>
                           <option value="1:1">1:1 (Social)</option> {/* */}
                           <option value="9:16">9:16 (Shorts)</option> {/* */}
                       </select>
                   </div>
                   {/* Số lượng */}
                    <div> {/* */}
                       <label className="text-xs font-bold text-gray-400">Số lượng</label> {/* */}
                       <select value={numImages} onChange={e => setNumImages(parseInt(e.target.value))} className="w-full obsidian-select" disabled={!!referenceImageFile}>
                           <option value="1">1 ảnh</option> {/* */}
                           <option value="2">2 ảnh</option> {/* */}
                           <option value="4">4 ảnh</option>
                       </select>
                   </div> {/* */}
                   {/* Phong cách */}
                   <div>
                       <label className="text-xs font-bold text-gray-400">Phong cách</label> {/* */}
                       <select value={style} onChange={e => setStyle(e.target.value)} className="w-full obsidian-select"> {/* */}
                           {styles.map(s => <option key={s} value={s}>{s}</option>)}
                       </select> {/* */}
                   </div>
                   {/* Cảm xúc */}
                   <div> {/* */}
                       <label className="text-xs font-bold text-gray-400">Cảm xúc</label>
                       <select value={emotion} onChange={e => setEmotion(e.target.value)} className="w-full obsidian-select">
                           {emotions.map(e => <option key={e} value={e}>{e}</option>)} {/* */}
                       </select>
                   </div>
                </div>
            </div> {/* */}
            {/* ADVANCED MODE */}
            <div className="space-y-2"> {/* */}
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#008080]">CHẾ ĐỘ NÂNG CAO</label>
                    <label className="relative inline-flex items-center cursor-pointer"> {/* */}
                      <input type="checkbox" checked={isAdvancedMode} onChange={() => setIsAdvancedMode(!isAdvancedMode)} className="sr-only peer" /> {/* */}
                      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008080]"></div>
                    </label>
                </div> {/* */}
                {isAdvancedMode && ( //
                    <div className="p-2 border border-gray-700/50 rounded-sm space-y-2 text-xs">
                        <input type="text" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder="Negative Prompt (VD: blurry, text, watermark)" className="w-full obsidian-input !p-2" /> {/* */}
                        <input type="text" value={seed} onChange={e => setSeed(e.target.value)} placeholder="Seed (số để tái tạo ảnh)" className="w-full obsidian-input !p-2" /> {/* */}
                    </div>
                )}
            </div>
            {/* Submit Button */}
            <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed"> {/* */}
                {isLoading ? "ĐANG HỢP THÀNH..." : "HỢP THÀNH CẤU TẠO"} {/* */}
            </button>
        </form>
    ); //
    const renderScriptToImage = () => ( //
        <div className="lg:col-span-4 flex flex-col space-y-3 pr-2 overflow-y-auto">
            {/* Script Input */}
            <div>
                <label className="text-sm font-bold text-[#CDAD5A] font-playfair">DỮ LIỆU KỊCH BẢN</label>
                <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Dán toàn bộ kịch bản của bạn vào đây..." className="w-full h-40 obsidian-textarea focus:border-[#008080]"></textarea> {/* */}
            </div>
            {/* Analyze Button */}
             <button onClick={handleAnalyzeScript} disabled={isAnalyzing || isBatchGenerating} className="w-full bg-[#CDAD5A] text-black font-bold py-2 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all hover:bg-transparent hover:text-[#CDAD5A] active:scale-95 bronze-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isAnalyzing ? "ĐANG PHÂN TÍCH..." : "PHÂN TÍCH KỊCH BẢN"} {/* */}
            </button>
            {/* Generated Prompts Area */}
             <div className="flex-grow space-y-2 overflow-y-auto p-2 bg-black/20 border border-gray-700/50"> {/* */}
                {generatedPrompts.length === 0 && <p className="text-xs text-gray-500 text-center pt-4">Chưa có prompt nào được tạo.</p>} {/* */}
                {generatedPrompts.map((p, i) => ( //
                    <p key={i} className="text-xs p-2 bg-gray-800/50 rounded-sm font-mono text-gray-300 border-l-2 border-[#008080]">
                        <strong className="text-gray-400">Cảnh {i+1}: </strong>{p}
                    </p> //
                ))}
            </div> {/* */}
            {/* Batch Generate Button */}
            <button onClick={handleBatchGenerate} disabled={isBatchGenerating || isAnalyzing || generatedPrompts.length === 0} className="w-full bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed"> {/* */}
                {isBatchGenerating ? batchProgress : `TẠO HÀNG LOẠT (${generatedPrompts.length} ẢNH)`} {/* */}
            </button>
        </div>
    ); //

    // --- Phần JSX return chính ---
    return ( //
        <>
            {/* Modal */}
            {selectedImage && (
                <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}> {/* */}
                    <div className="image-modal-content">
                        <img src={selectedImage} alt="Enlarged view" className={filteredImages.has(selectedImage) ? 'obsidian-filter' : ''} /> {/* */}
                     </div>
                    <span className="image-modal-close" onClick={() => setSelectedImage(null)}>&times;</span> {/* */}
                </div>
            )} {/* */}
            {/* Main Content */}
            <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-2 bg-[#1a1a1a] image-forge-bg relative"> {/* */}
                {/* Banner */}
                <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-r from-[#CDAD5A]/50 via-[#008080]/50 to-[#CDAD5A]/50 text-center text-xs font-bold text-black backdrop-blur-sm z-20"> {/* */}
              SỨC MẠNH FORGE CHỈ DÀNH CHO MAGISTRATE VÀ TOÀN TRI.
            </div> {/* */}
                {/* Header */}
                <div className="flex justify-between items-center pt-6"> {/* */}
                    <h2 className="text-xl md:text-2xl text-center font-playfair text-[#E0E0E0] tracking-wider">VII. TẠO ẢNH (IMAGE FORGE)</h2> {/* */}
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2 z-10">&times; Trở Về</button> {/* */}
                </div>
                {/* Tabs */}
                <div className="border-b border-gray-700/50"> {/* */}
                    <div className="flex space-x-4">
                        <button onClick={() => setActiveTab('single')} className={`py-2 px-4 font-bold tab-button ${activeTab === 'single' ? 'active' : 'text-gray-400'}`}>Tạo Ảnh Đơn</button> {/* */}
                        <button onClick={() => setActiveTab('script')} className={`py-2 px-4 font-bold tab-button ${activeTab === 'script' ? 'active' : 'text-gray-400'}`}>Kịch Bản Ra Ảnh</button> {/* */}
                    </div>
                </div>
                 {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0"> {/* */}
                    {/* Render active tab */}
                    {activeTab === 'single' ? renderSingleGenerator() : renderScriptToImage()} {/* */}

                    {/* Right Column - Gallery */}
                    <div className="lg:col-span-6 flex flex-col space-y-3 min-h-0"> {/* */}
                        {/* Header Gallery */}
                        <div className="flex justify-between items-center"> {/* */}
                            <h3 className="text-lg font-bold text-white font-playfair">THƯ VIỆN ĐÃ TẠO</h3>
                            <div className="text-sm font-bold text-[#CDAD5A] animate-credit-flash">
                                SỐ DƯ CREDIT: <span className="font-mono">42/100</span> {/* Cần cập nhật động */} {/* */}
                            </div>
                        </div> {/* */}
                        {/* Generated Images Area */}
                        <div className="flex-grow bg-black/30 border border-gray-700/50 rounded-sm p-3 overflow-y-auto"> {/* */}
                            {(isLoading || isBatchGenerating) && generatedImages.length === 0 && <Loader text={batchProgress || undefined} />} {/* */}
                            {!isLoading && !isBatchGenerating && generatedImages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <p>Lò rèn đang chờ lệnh...</p> {/* */}
                                </div>
                            )} {/* */}
                            {generatedImages.length > 0 && ( //
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {generatedImages.map((imgSrc, i) => ( //
                                        <div key={i} className="group relative animate-forge-reveal cursor-pointer" style={{animationDelay: `${i * 50}ms`}} onClick={() => setSelectedImage(imgSrc)}> {/* */}
                                            <img src={imgSrc} alt={`Generated image ${i+1}`} className={`w-full h-auto rounded-sm border-2 border-transparent group-hover:border-[#CDAD5A] transition-all aspect-video object-cover ${filteredImages.has(imgSrc) ? 'obsidian-filter' : ''}`}/> {/* */}
                                            {/* Overlay Buttons */}
                                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1 pointer-events-none"> {/* */}
                                                {/* --- NÚT TẢI XUỐNG ĐÃ SỬA --- */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Ngăn mở modal
                                                        handleDownload(imgSrc); // Gọi hàm tải
                                                    }}
                                                    className="text-xs w-full py-1 bg-[#CDAD5A] text-black font-bold border border-[#CDAD5A] rounded-sm hover:bg-transparent hover:text-[#CDAD5A] transition-colors pointer-events-auto" // Đảm bảo button nhận click
                                                >
                                                    Tải xuống
                                                </button> {/* */}
                                                {/* --- HẾT PHẦN SỬA --- */}
                                                <button onClick={(e) => { e.stopPropagation(); alert('Đang phát triển...'); }} className="text-xs w-full py-1 bg-[#008080]/80 text-white font-bold border border-[#008080] rounded-sm hover:bg-transparent hover:text-[#008080] transition-colors pointer-events-auto">Tạo Biến Thể</button> {/* */}
                                                 <button onClick={(e) => toggleObsidianFilter(e, imgSrc)} className={`text-xs w-full py-1 text-white font-bold border rounded-sm transition-colors pointer-events-auto ${filteredImages.has(imgSrc) ? 'bg-[#CDAD5A] border-[#CDAD5A] text-black' : 'bg-transparent border-gray-500'}`}>Lọc SeenYT</button> {/* */}
                                            </div>
                                        </div>
                                    ))} {/* */}
                                </div>
                            )} {/* */}
                        </div>
                        {/* Archive Area */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-2">THƯ VIỆN ẢNH CŨ</h4> {/* */}
                            <div className="flex items-center gap-2 p-2 bg-black/30 border border-gray-700/50 rounded-sm overflow-x-auto"> {/* */}
                                {archive.length === 0 && <p className="text-xs text-gray-500">Chưa có ảnh nào trong kho lưu trữ.</p>} {/* */}
                                {archive.map((imgSrc, i) => ( //
                                    <img key={i} src={imgSrc} className="h-16 w-auto flex-shrink-0 rounded-sm cursor-pointer hover:scale-110 transition-transform aspect-video object-cover" onClick={() => setSelectedImage(imgSrc)}/> //
                                ))} {/* */}
                            </div>
                        </div> {/* */}
                    </div>
                </div> {/* */}
                 {/* Error Message */}
                 {error && <p className="text-red-500 text-center text-xs pt-2">{error}</p>} {/* */}
            </div>
        </>
    ); //
};

export default ImageForgeTool; //
// File: components/ImageForgeTool.tsx (ĐÃ CHỈNH SỬA THEO YÊU CẦU)

import React, { useState, useRef, useEffect } from 'react';
import { AssemblingCubeIcon } from './AnimatedIcons';

interface ImageForgeToolProps {
  onBack: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const styles = [
    "Nhiếp ảnh thực tế", "Nghệ thuật số", "Điện ảnh", "Truyện tranh",
    "Kết xuất 3D", "Tranh sơn dầu", "Màu nước", "Hoạt hình Nhật Bản (Anime)",
    "Cyberpunk", "Steampunk", "Giả tưởng (Fantasy)", "Gothic",
    "Tối giản (Minimalist)", "Cổ điển (Vintage)", "Siêu thực (Surrealism)"
];

const emotions = [
    "Tự tin", "Sốc", "Tò mò", "Tức giận",
    "Hạnh phúc", "Buồn bã", "Ngạc nhiên", "Sợ hãi", "Bình yên"
];

const Loader: React.FC<{text?: string}> = ({text = "ĐANG RÈN HÌNH ẢNH..."}) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-32 h-32 text-[#008080]">
            <AssemblingCubeIcon />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#008080] tracking-widest animate-pulse">{text}</p>
    </div>
);

const ImageForgeTool: React.FC<ImageForgeToolProps> = ({ onBack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [archive, setArchive] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [filteredImages, setFilteredImages] = useState<Set<string>>(new Set());

    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16'>('16:9');
    const [style, setStyle] = useState(styles[0]);
    const [emotion, setEmotion] = useState(emotions[0]);
    const [numImages, setNumImages] = useState(1);
    const [inlayText, setInlayText] = useState('');
    const [faceLockFiles, setFaceLockFiles] = useState<File[]>([]);
    const [layoutCloneFile, setLayoutCloneFile] = useState<File | null>(null);
    const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        try {
            const storedArchive = localStorage.getItem('imageForgeArchive');
            if (storedArchive) { setArchive(JSON.parse(storedArchive)); }
        } catch (e) { console.error("Failed to load archive from localStorage", e); }
    }, []);

    const updateArchive = (newImages: string[]) => {
        setArchive(prev => {
            const updated = [...newImages, ...prev].slice(0, 100);
            try {
                localStorage.setItem('imageForgeArchive', JSON.stringify(updated));
            } catch (e: any) {
                if (e.name === 'QuotaExceededError') {
                    setError("Lỗi: Bộ nhớ lưu trữ ảnh cũ đã đầy. Vui lòng xóa bớt ảnh cũ.");
                }
            }
            return updated;
        });
    };

    const handleDownload = (imageUrl: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `seenvt-forge-${new Date().getTime()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleObsidianFilter = (e: React.MouseEvent, imgSrc: string) => {
        e.stopPropagation();
        setFilteredImages(prev => {
            const newSet = new Set(prev);
            newSet.has(imgSrc) ? newSet.delete(imgSrc) : newSet.add(imgSrc);
            return newSet;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt && !referenceImageFile) {
            setError("Vui lòng nhập Lời Khai Sáng hoặc tải Ảnh Tham Chiếu.");
            return;
        }

        buttonRef.current?.classList.add('animate-emerald-pulse-strong');
        setTimeout(() => buttonRef.current?.classList.remove('animate-emerald-pulse-strong'), 1000);

        setIsLoading(true); setError('');
        let payload: any = { numImages: numImages, aspectRatio: aspectRatio };
        let fullPrompt = prompt || "Generate image based on reference";
        if (inlayText) fullPrompt += `... ${inlayText.toUpperCase()} ...`;
        if (faceLockFiles.length > 0) fullPrompt += `... face consistent ...`;
        if (layoutCloneFile) fullPrompt += `... replicate layout ...`;
        fullPrompt += `, style: ${style}, emotion: ${emotion}.`;
        payload.prompt = fullPrompt;

        if (referenceImageFile) {
            try {
                payload.referenceImageBase64 = await fileToBase64(referenceImageFile);
                payload.referenceImageMimeType = referenceImageFile.type;
                payload.numImages = 1;
            } catch (fileError: any) {
                setError(`Lỗi xử lý file: ${fileError.message}`);
                setIsLoading(false);
                return;
            }
        }

        try {
            const response = await fetch('/api/image-forge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result: any = await response.json();
            if (!response.ok) throw new Error(result.error || `Lỗi ${response.status}`);
            if (!result.generatedImages || result.generatedImages.length === 0) throw new Error("Backend không trả về ảnh.");

            setGeneratedImages(prev => [...result.generatedImages, ...prev]);
            updateArchive(result.generatedImages);
        } catch (err: any) {
            setError(`Lỗi: ${err.message || "Không thể hợp thành."}`);
            console.error("Lỗi /api/image-forge:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {selectedImage && (
                <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="image-modal-content">
                        <img src={selectedImage} alt="Enlarged view" className={filteredImages.has(selectedImage) ? 'obsidian-filter' : ''} />
                    </div>
                    <span className="image-modal-close" onClick={() => setSelectedImage(null)}>×</span>
                </div>
            )}

            <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-2 bg-[#1a1a1a] image-forge-bg relative">
                <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-r from-[#CDAD5A]/50 via-[#008080]/50 to-[#CDAD5A]/50 text-center text-xs font-bold text-black backdrop-blur-sm z-20">
                    SỨC MẠNH FORGE CHỈ DÀNH CHO MAGISTRATE VÀ TOÀN TRI.
                </div>

                <div className="flex justify-between items-center pt-6">
                    <h2 className="text-xl md:text-2xl text-center font-playfair text-[#E0E0E0] tracking-wider">VII. TẠO ẢNH (IMAGE FORGE)</h2>
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2 z-10">× Trở Về</button>
                </div>

                {/* Chỉ còn 1 tab duy nhất */}
                <div className="border-b border-gray-700/50">
                    <div className="flex space-x-4">
                        <button className="py-2 px-4 font-bold tab-button active">SeenYT Image</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-grow min-h-0">
                    {/* Form SeenYT Image (đã bỏ chế độ nâng cao) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-4 flex flex-col space-y-3 pr-2 overflow-y-auto">
                        {/* Lời Khai Sáng */}
                        <div>
                            <label className="text-sm font-bold text-[#CDAD5A] font-playfair">LỜI KHAI SÁNG</label>
                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Mô tả chi tiết hình ảnh bạn muốn tạo..." className="w-full h-28 obsidian-textarea focus:border-[#008080]"></textarea>
                        </div>

                        {/* Ảnh Tham Chiếu */}
                        <div>
                            <label className="text-xs font-bold text-[#CDAD5A] uppercase">Ảnh Tham Chiếu (Image-to-Image)</label>
                            <div className="p-2 mt-1 file-input-area rounded-sm text-center">
                                <input type="file" accept="image/*" id="reference-image-input" className="hidden" onChange={e => setReferenceImageFile(e.target.files ? e.target.files[0] : null)} />
                                <label htmlFor="reference-image-input" className="cursor-pointer text-gray-400 hover:text-white">
                                    {referenceImageFile ? referenceImageFile.name : "Tải ảnh lên để tái tạo (khuyến khích)"}
                                </label>
                            </div>
                            {referenceImageFile && <p className="text-yellow-400 text-center mt-1">Chế độ tham chiếu đã kích hoạt.</p>}
                        </div>

                        {/* Thép Văn Bản */}
                        <div>
                            <label className="text-xs font-bold text-[#CDAD5A]">THÉP VĂN BẢN</label>
                            <input type="text" value={inlayText} onChange={e => setInlayText(e.target.value)} placeholder="Văn bản cần chèn (in hoa)..." className="w-full obsidian-input !p-2" />
                        </div>

                        {/* Face Lock */}
                        <div>
                            <label className="text-xs font-bold text-white">FACE LOCK (KHÓA KHUÔN MẶT) <span className="text-yellow-400 font-black p-1 bg-yellow-600/30 rounded-sm">TOÀN TRI</span></label>
                            <div className="p-2 mt-1 file-input-area rounded-sm text-center">
                                <input type="file" multiple accept="image/*" id="face-lock-input" className="hidden" onChange={e => setFaceLockFiles(Array.from(e.target.files || []))} />
                                <label htmlFor="face-lock-input" className="cursor-pointer text-gray-400 hover:text-white">
                                    {faceLockFiles.length > 0 ? `${faceLockFiles.length} ảnh đã chọn` : "Tải lên 5-10 ảnh tham chiếu"}
                                </label>
                            </div>
                        </div>

                        {/* Clone Bố Cục */}
                        <div>
                            <label className="text-xs font-bold text-gray-400">CLONE BỐ CỤC</label>
                            <div className="p-2 mt-1 file-input-area rounded-sm text-center">
                                <input type="file" accept="image/*" id="layout-clone-input" className="hidden" onChange={e => setLayoutCloneFile(e.target.files ? e.target.files[0] : null)} />
                                <label htmlFor="layout-clone-input" className="cursor-pointer text-gray-400 hover:text-white">
                                    {layoutCloneFile ? layoutCloneFile.name : "Tải lên ảnh tham chiếu bố cục"}
                                </label>
                            </div>
                        </div>

                        {/* Lò Rèn Tham Số */}
                        <div>
                            <label className="text-sm font-bold text-[#008080]">LÒ RÈN THAM SỐ</label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Tỷ lệ</label>
                                    <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full obsidian-select" disabled={!!referenceImageFile}>
                                        <option value="16:9">16:9 (Thumbnail)</option>
                                        <option value="1:1">1:1 (Social)</option>
                                        <option value="9:16">9:16 (Shorts)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Số lượng</label>
                                    <select value={numImages} onChange={e => setNumImages(parseInt(e.target.value))} className="w-full obsidian-select" disabled={!!referenceImageFile}>
                                        <option value="1">1 ảnh</option>
                                        <option value="2">2 ảnh</option>
                                        <option value="4">4 ảnh</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Phong cách</label>
                                    <select value={style} onChange={e => setStyle(e.target.value)} className="w-full obsidian-select">
                                        {styles.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Cảm xúc</label>
                                    <select value={emotion} onChange={e => setEmotion(e.target.value)} className="w-full obsidian-select">
                                        {emotions.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Nút Hợp Thành */}
                        <button ref={buttonRef} type="submit" disabled={isLoading} className="w-full mt-auto bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isLoading ? "ĐANG HỢP THÀNH..." : "HỢP THÀNH CẤU TẠO"}
                        </button>
                    </form>

                    {/* Thư viện ảnh (giữ nguyên) */}
                    <div className="lg:col-span-6 flex flex-col space-y-3 min-h-0">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white font-playfair">THƯ VIỆN ĐÃ TẠO</h3>
                            <div className="text-sm font-bold text-[#CDAD5A] animate-credit-flash">
                                SỐ DƯ CREDIT: <span className="font-mono">42/100</span>
                            </div>
                        </div>

                        <div className="flex-grow bg-black/30 border border-gray-700/50 rounded-sm p-3 overflow-y-auto">
                            {isLoading && generatedImages.length === 0 && <Loader />}
                            {!isLoading && generatedImages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <p>Lò rèn đang chờ lệnh...</p>
                                </div>
                            )}
                            {generatedImages.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {generatedImages.map((imgSrc, i) => (
                                        <div key={i} className="group relative animate-forge-reveal cursor-pointer" style={{animationDelay: `${i * 50}ms`}} onClick={() => setSelectedImage(imgSrc)}>
                                            <img src={imgSrc} alt={`Generated ${i+1}`} className={`w-full h-auto rounded-sm border-2 border-transparent group-hover:border-[#CDAD5A] transition-all aspect-video object-cover ${filteredImages.has(imgSrc) ? 'obsidian-filter' : ''}`} />
                                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1 pointer-events-none">
                                                <button onClick={(e) => { e.stopPropagation(); handleDownload(imgSrc); }} className="text-xs w-full py-1 bg-[#CDAD5A] text-black font-bold border border-[#CDAD5A] rounded-sm hover:bg-transparent hover:text-[#CDAD5A] transition-colors pointer-events-auto">
                                                    Tải xuống
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); alert('Đang phát triển...'); }} className="text-xs w-full py-1 bg-[#008080]/80 text-white font-bold border border-[#008080] rounded-sm hover:bg-transparent hover:text-[#008080] transition-colors pointer-events-auto">
                                                    Tạo Biến Thể
                                                </button>
                                                <button onClick={(e) => toggleObsidianFilter(e, imgSrc)} className={`text-xs w-full py-1 text-white font-bold border rounded-sm transition-colors pointer-events-auto ${filteredImages.has(imgSrc) ? 'bg-[#CDAD5A] border-[#CDAD5A] text-black' : 'bg-transparent border-gray-500'}`}>
                                                    Lọc SeenYT
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-2">THƯ VIỆN ẢNH CŨ</h4>
                            <div className="flex items-center gap-2 p-2 bg-black/30 border border-gray-700/50 rounded-sm overflow-x-auto">
                                {archive.length === 0 && <p className="text-xs text-gray-500">Chưa có ảnh nào trong kho lưu trữ.</p>}
                                {archive.map((imgSrc, i) => (
                                    <img key={i} src={imgSrc} className="h-16 w-auto flex-shrink-0 rounded-sm cursor-pointer hover:scale-110 transition-transform aspect-video object-cover" onClick={() => setSelectedImage(imgSrc)} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-center text-xs pt-2">{error}</p>}
            </div>
        </>
    );
};

export default ImageForgeTool;
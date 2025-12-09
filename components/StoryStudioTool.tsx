// File: components/StoryStudioTool.tsx (Hoàn Chỉnh - Đã sửa lỗi gọi Backend và lỗi file)

import React, { useState, useRef, useCallback, useEffect } from 'react';
// Xóa: import { GoogleGenAI, Type, GenerateImagesConfig } from "@google/genai"; // - Không cần nữa
import { BookIcon } from './AnimatedIcons'; //
import html2canvas from 'html2canvas'; //
import jsPDF from 'jspdf'; //

interface NarrativeStudioToolProps {
  onBack: () => void; //
}

// Giữ nguyên các type và interface
type Phase = 'input' | 'process' | 'output'; //

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
  textProperties: TextProperties; //
} //

// Giữ nguyên các hằng số
const imageStyles = [
  "SÁCH TÔ MÀU (LINE ART)",
  "TRUYỆN TRANH GRAPHIC NOVEL",
  "TRUYỆN TRANH MANGA/ANIME",
  "THỰC TẾ ĐIỆN ẢNH",
  "TRUYỆN TRANH MÀU NƯỚC"
]; //

const fontFamilies = ['Playfair Display', 'Montserrat', 'Bangers']; //

// Giữ nguyên Loader
const Loader: React.FC<{text: string}> = ({text}) => ( //
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 text-[#CDAD5A] animate-[spin_5s_linear_infinite]">
            <BookIcon />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#CDAD5A] tracking-widest animate-pulse">{text}</p>
    </div>
); //

// Giữ nguyên TextEditorToolbar
const TextEditorToolbar: React.FC<{ //
    textProps: TextProperties;
    onUpdate: (newProps: Partial<TextProperties>) => void;
}> = ({ textProps, onUpdate }) => { //
    return (
        <div className="text-editor-toolbar">
            <div className="toolbar-item">
                <select value={textProps.fontFamily} onChange={e => onUpdate({ fontFamily: e.target.value })}> {/* */}
                    {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
            </div> {/* */}
            <div className="toolbar-item flex items-center gap-1">
                <button onClick={() => onUpdate({ fontSize: textProps.fontSize - 0.1 })} className="px-2 bg-gray-700 rounded-l">-</button>
                <span className="text-white w-8 text-center">{textProps.fontSize.toFixed(1)}</span>
                <button onClick={() => onUpdate({ fontSize: textProps.fontSize + 0.1 })} className="px-2 bg-gray-700 rounded-r">+</button>
            </div> {/* */}
            <div className="toolbar-item">
                <input type="color" value={textProps.color} onChange={e => onUpdate({ color: e.target.value })} title="Text Color"/>
            </div>
            <div className="toolbar-item">
                <input type="color" value={textProps.backgroundColor.slice(0, 7)} onChange={e => { //
                    const r = parseInt(e.target.value.slice(1, 3), 16); //
                    const g = parseInt(e.target.value.slice(3, 5), 16); //
                    const b = parseInt(e.target.value.slice(5, 7), 16);
                    const currentAlpha = parseFloat(textProps.backgroundColor.split(',')[3] || '0.4)'); //
                    onUpdate({ backgroundColor: `rgba(${r}, ${g}, ${b}, ${currentAlpha})` }); //
                }} title="Background Color" />
            </div>
            <div className="toolbar-item flex items-center">
                 <input type="range" min="0" max="1" step="0.1" value={parseFloat(textProps.backgroundColor.split(',')[3] || '0.4)')} onChange={e => {
                     const rgba = textProps.backgroundColor.replace(/[\d\.]+\)$/g, `${e.target.value})`); //
                     onUpdate({ backgroundColor: rgba }); //
                 }} title="Background Opacity" />
            </div>
            <div className="toolbar-item flex gap-1">
                {['left', 'center', 'right'].map(align => ( //
                     <button key={align} onClick={() => onUpdate({ textAlign: align as any })} className={`px-1 rounded ${textProps.textAlign === align ? 'bg-[#008080]' : 'bg-gray-700'}`}>
                         {align.charAt(0).toUpperCase()} {/* */}
                    </button>
                ))}
            </div>
        </div>
    );
}; //


// Bắt đầu Component
const NarrativeStudioTool: React.FC<NarrativeStudioToolProps> = ({ onBack }) => { //
    // --- Các state giữ nguyên ---
    const [phase, setPhase] = useState<Phase>('input'); //
    const [isLoading, setIsLoading] = useState(false); //
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(''); //
    const [script, setScript] = useState(''); //
    const [imageStyle, setImageStyle] = useState(imageStyles[0]); //
    const [sceneCount, setSceneCount] = useState('');
    const [scenes, setScenes] = useState<Scene[]>([]); //
    const [expandedScene, setExpandedScene] = useState<number | null>(0); //
    const [bookTitle, setBookTitle] = useState('Mèo Ú Đại Chiến Bánh Kem Dâu'); //
    const [authorName, setAuthorName] = useState('By tung phamanh'); //
    const [currentPageIndex, setCurrentPageIndex] = useState(0); 
    const [activeSceneId, setActiveSceneId] = useState<number | null>(null); //
    const [isExportModalOpen, setIsExportModalOpen] = useState(false); //
    const [selectedPagesForExport, setSelectedPagesForExport] = useState<Set<number>>(new Set());
    const [isExporting, setIsExporting] = useState(false); //
    const dragInfoRef = useRef<{ sceneId: number, element: HTMLElement, startX: number, startY: number, originalX: number, originalY: number } | null>(null); //

    // --- HÀM handleAnalyzeScript MỚI (Gọi Backend /api/narrative-studio) ---
    const handleAnalyzeScript = async () => { //
        if (!script) { setError("Vui lòng nhập TÀI LIỆU GỐC."); return; } //
        // Sửa lỗi: Chỉ parse khi sceneCount có giá trị
        if (sceneCount && parseInt(sceneCount) > 40) { setError("Số khung hình không được vượt quá 40."); return; } //
        setIsLoading(true); setLoadingMessage("PHÂN TÍCH CẢNH..."); setError(''); setScenes([]); //
        
        try {
            // Gọi backend /api/narrative-studio với action 'analyze'
            const response = await fetch('/api/narrative-studio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'analyze',
                    script,
                    sceneCount: sceneCount || undefined, // Gửi undefined nếu rỗng
                    imageStyle,
                }),
            });

            const result: any = await response.json(); // Backend trả { scenes: [...] }

            if (!response.ok) {
                throw new Error(result.error || `Lỗi ${response.status}`);
            }

            if (!result.scenes) {
                 throw new Error("Backend không trả về danh sách scenes.");
            }

            // Map kết quả từ backend thành cấu trúc state mong muốn (Giống code gốc)
            const parsedScenes: { imagePrompt: string; narrationText: string }[] = result.scenes; //
            setScenes(parsedScenes.map((s, i) => ({ //
                id: i,
                imagePrompt: s.imagePrompt,
                textProperties: {
                    content: s.narrationText,
                    x: 10, y: 70, width: 80, //
                    fontSize: 2.2, fontFamily: 'Playfair Display', color: '#FFFFFF',
                    textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)'
                } //
            }))); //
            setPhase('process'); //
        } catch (err: any) {
            setError(`Lỗi phân tích: ${err.message || "Không thể phân tích."}`); //
        } finally {
            setIsLoading(false); //
        }
    };

    // --- HÀM handleGenerateImages MỚI (Gọi Backend /api/narrative-studio) ---
    const handleGenerateImages = async () => { //
        setIsLoading(true); //
        const newScenes = [...scenes]; // Tạo bản sao để cập nhật //
        let errorOccurred = false; // Cờ để dừng nếu có lỗi

        for (let i = 0; i < newScenes.length; i++) { //
            // Chỉ tạo ảnh nếu chưa có
            if (!newScenes[i].imageUrl) {
                setLoadingMessage(`TẠO ẢNH ${i + 1}/${newScenes.length}...`); //
                try {
                    // Gọi backend /api/narrative-studio với action 'generateImage'
                    const response = await fetch('/api/narrative-studio', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'generateImage',
                            imagePrompt: newScenes[i].imagePrompt, //
                            aspectRatio: '3:4' // Luôn dùng 3:4 cho sách
                        }),
                    });

                    const result: any = await response.json(); // Backend trả { imageUrl: "..." }

                    if (!response.ok) {
                        throw new Error(result.error || `Lỗi ${response.status}`);
                    }

                    if (!result.imageUrl) {
                         throw new Error("Backend không trả về imageUrl.");
                    }

                    newScenes[i].imageUrl = result.imageUrl; // Cập nhật imageUrl //
                    setScenes([...newScenes]); // Cập nhật state sau mỗi ảnh thành công //
                    if (i < newScenes.length - 1) await new Promise(resolve => setTimeout(resolve, 5000)); // Nghỉ 5 giây //

                } catch (err: any) { //
                    setError(`Lỗi tạo ảnh cho cảnh ${i + 1}: ${err.message}. Dừng lại.`); //
                    errorOccurred = true;
                    // Không return hoặc break ở đây nữa để lỗi không dừng hẳn quá trình
                    // break; // Bỏ break để thử tạo các ảnh còn lại
                } finally {
                     // Dù lỗi hay không, chuyển sang ảnh tiếp theo
                }
            }
        } // Hết vòng lặp for

        // Chỉ chuyển phase nếu không có lỗi nào xảy ra trong toàn bộ quá trình
        if (!errorOccurred) {
             setPhase('output'); //
        }
        setIsLoading(false); // - Tắt loading sau khi vòng lặp kết thúc
        setLoadingMessage(''); // Reset loading message
    }; //


    // --- Các hàm xử lý kéo thả, export PDF, render phases giữ nguyên ---
    const updateSceneTextProps = (sceneId: number, newProps: Partial<TextProperties>) => { //
        setScenes(scenes.map(s => s.id === sceneId ? { ...s, textProperties: { ...s.textProperties, ...newProps } } : s)); //
    }; //

    const handleTextMouseDown = (e: React.MouseEvent, sceneId: number) => { //
        const element = e.currentTarget as HTMLElement;
        const parentBounds = element.parentElement!.getBoundingClientRect(); //
        dragInfoRef.current = {
            sceneId, element, startX: e.clientX, startY: e.clientY,
            originalX: (element.offsetLeft / parentBounds.width) * 100,
            originalY: (element.offsetTop / parentBounds.height) * 100
        }; //
        setActiveSceneId(sceneId); //
        e.stopPropagation();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => { //
        if (!dragInfoRef.current) return;
        const { element, startX, startY, originalX, originalY, sceneId } = dragInfoRef.current; // Thêm sceneId
        const parentBounds = element.parentElement!.getBoundingClientRect(); //
        const dx = ((e.clientX - startX) / parentBounds.width) * 100;
        const dy = ((e.clientY - startY) / parentBounds.height) * 100;
        // Lấy width từ state
        const currentSceneData = scenes.find(s => s.id === sceneId);
        const currentSceneWidth = currentSceneData?.textProperties.width || 80;
        const newX = Math.max(0, Math.min(100 - currentSceneWidth, originalX + dx)); //
        const newY = Math.max(0, Math.min(90, originalY + dy)); // Giới hạn dưới 90%
        element.style.left = `${newX}%`; //
        element.style.top = `${newY}%`;
    }, [scenes]); // Thêm scenes vào dependency array
    const handleMouseUp = useCallback(() => { //
        if (dragInfoRef.current) {
            const { sceneId, element } = dragInfoRef.current;
            const parentBounds = element.parentElement!.getBoundingClientRect(); //
            const finalX = (element.offsetLeft / parentBounds.width) * 100;
            const finalY = (element.offsetTop / parentBounds.height) * 100;
            updateSceneTextProps(sceneId, { x: finalX, y: finalY }); //
            dragInfoRef.current = null; //
        }
    }, [/* updateSceneTextProps có thể cần thêm vào dependency nếu nó thay đổi */]); // Bỏ dependency nếu không cần
    useEffect(() => { //
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]); //

    const startPdfExport = () => { //
        setIsExportModalOpen(false);
        setIsExporting(true);
    }; //
    
    useEffect(() => { //
        if (isExporting) {
            const performExport = async () => {
                setIsLoading(true);
                setLoadingMessage("ĐANG XUẤT BẢN PDF..."); //
    
                const pdf = new jsPDF('p', 'px', 'a4'); //
                const pdfWidth = pdf.internal.pageSize.getWidth(); //
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                const exportPages: number[] = [...selectedPagesForExport].sort((a,b) => a - b); //
                
                for (let i = 0; i < exportPages.length; i++) { //
                    const pageNum = exportPages[i];
                    const elementToCapture = document.getElementById(`export-page-${pageNum}`);
            
                    if (elementToCapture) { //
                        try { //
                            setLoadingMessage(`Đang kết xuất trang ${i + 1}/${exportPages.length}...`);
                            const canvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true, backgroundColor: '#000' }); //
                            const imgData = canvas.toDataURL('image/jpeg', 0.9); //
            
                            if (i > 0) pdf.addPage();
                            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight); //
                        } catch (e) { //
                            console.error(`Failed to capture page ${pageNum}`, e); //
                            setError(`Không thể chụp trang ${pageNum}.`); //
                        }
                    }
                }
            
                pdf.save(`${bookTitle.replace(/\s/g, '_')}.pdf`); //
                setIsLoading(false); //
                setIsExporting(false);
            };
            
            setTimeout(performExport, 100); //
        }
    }, [isExporting, selectedPagesForExport, bookTitle]); //

    const togglePageSelection = (pageNum: number) => { //
        setSelectedPagesForExport(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pageNum)) newSet.delete(pageNum);
            else newSet.add(pageNum);
            return newSet;
        });
    }; //

    // --- CÁC HÀM RENDER JSX (Lấy từ file gốc 1.txt - Đầy Đủ) ---
    const renderInputPhase = () => ( //
      <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-[#CDAD5A]">TÀI LIỆU GỐC</h3>
          <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Dán kịch bản hoặc Upload File..." className="w-full h-48 obsidian-textarea focus:border-[#CDAD5A] bronze"></textarea>
          <h3 className="text-lg font-bold text-[#008080]">PHONG CÁCH TÁC PHẨM</h3>
          <select value={imageStyle} onChange={e => setImageStyle(e.target.value)} className="w-full obsidian-select">
              {imageStyles.map(s => <option key={s}>{s}</option>)} {/* */}
          </select>
          <div>
              <input type="number" value={sceneCount} max="40" onChange={e => setSceneCount(e.target.value)} placeholder="Số khung hình (tối đa 40)" className="w-full obsidian-input" />
              <p className="text-xs text-gray-400 mt-1">Để trống nếu muốn AI tự quyết định (khuyến nghị ~8).</p> {/* */}
          </div>
          <button onClick={handleAnalyzeScript} disabled={isLoading} className="w-full bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow-strong">PHÂN TÍCH CẢNH & TẠO PROMPT</button> {/* */}
      </div>
    ); //

    const renderProcessPhase = () => ( //
        <div className="flex flex-col space-y-4 h-full">
            <h3 className="text-lg font-bold text-[#CDAD5A]">DÒNG THỜI GIAN & BỐ CỤC</h3>
            <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                {scenes.map((scene) => ( //
                    <div key={scene.id} className="bg-black/20 border border-gray-700 rounded-sm">
                        <button onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)} className="w-full p-2 text-left font-bold flex justify-between items-center"> {/* */}
                           <span>Khung hình {scene.id + 1}</span>
                           <span className={`transition-transform duration-300 ${expandedScene === scene.id ? 'rotate-90' : ''}`}>{'>'}</span> {/* */}
                        </button>
                        {expandedScene === scene.id && ( //
                            <div className="p-3 border-t border-gray-600 space-y-2">
                                <label className="text-xs font-bold text-[#CDAD5A]">Prompt Ảnh:</label> {/* */}
                                <textarea value={scene.imagePrompt} onChange={e => setScenes(scenes.map(s => s.id === scene.id ? { ...s, imagePrompt: e.target.value } : s))} className="w-full h-20 obsidian-textarea text-xs"></textarea> {/* */}
                                <label className="text-xs font-bold text-[#CDAD5A]">Lời thoại/dẫn:</label>
                                <textarea value={scene.textProperties.content} onChange={e => updateSceneTextProps(scene.id, { content: e.target.value })} className="w-full h-16 obsidian-textarea text-xs"></textarea> {/* */}
                           </div> //
                        )}
                    </div>
                ))}
            </div>
            <button onClick={handleGenerateImages} disabled={isLoading} className="w-full bg-[#CDAD5A] text-black font-bold py-3 px-5 border-2 border-[#CDAD5A] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#CDAD5A] active:scale-95 bronze-glow-strong">TẠO BẢN DỰ THẢO ẢNH (RUN API)</button> {/* */}
        </div>
    ); //

    const renderOutputPhase = () => { //
        const currentScene = scenes[currentPageIndex - 1]; //
        const pageContent = currentPageIndex === 0 //
            ? ( //
                <div className="book-page book-cover">
                    <img src={scenes[0]?.imageUrl || 'https://placehold.co/600x800/333/CDAD5A?text=Bìa+Sách'} alt="Book Cover" className="book-cover-image" />
                    <div className="cover-text-overlay">
                        <input value={bookTitle} onChange={e => setBookTitle(e.target.value)} className="text-2xl font-playfair font-bold" placeholder="Tiêu đề sách"/> {/* */}
                        <input value={authorName} onChange={e => setAuthorName(e.target.value)} className="text-lg font-montserrat" placeholder="Tên tác giả"/> {/* */}
                    </div>
                </div>
            )
            : currentScene ? ( //
                <div className="book-page">
                    <img src={currentScene.imageUrl} alt={`Page ${currentPageIndex}`} className="page-background" /> {/* */}
                    <div
                        className={`text-overlay ${activeSceneId === currentScene.id ? 'active' : ''}`} //
                         style={{
                            top: `${currentScene.textProperties.y}%`, //
                            left: `${currentScene.textProperties.x}%`,
                             width: `${currentScene.textProperties.width}%`, //
                            fontSize: `${currentScene.textProperties.fontSize}vw`,
                            fontFamily: currentScene.textProperties.fontFamily,
                            color: currentScene.textProperties.color,
                             textAlign: currentScene.textProperties.textAlign, //
                            backgroundColor: currentScene.textProperties.backgroundColor,
                        }}
                        onMouseDown={e => handleTextMouseDown(e, currentScene.id)} //
                    >
                        {activeSceneId === currentScene.id && <TextEditorToolbar textProps={currentScene.textProperties} onUpdate={(props) => updateSceneTextProps(currentScene.id, props)}/>} {/* */}
                        <div
                             contentEditable //
                            suppressContentEditableWarning
                            onBlur={e => updateSceneTextProps(currentScene.id, { content: e.currentTarget.innerText })}
                            style={{minHeight: '2em', outline: 'none'}}
                          > {/* */}
                            {currentScene.textProperties.content}
                        </div>
                    </div>
                 </div> //
            ) : null; //

        return ( //
            <div className="flex flex-col space-y-4 h-full">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#CDAD5A]">STUDIO HOÀN CHỈNH (BOOK VIEWER)</h3>
                    <button onClick={() => { setSelectedPagesForExport(new Set([...Array(scenes.length + 1).keys()])); setIsExportModalOpen(true); }} className="px-4 py-2 bg-[#008080] text-white font-bold border-2 border-[#008080] rounded-sm transition-all hover:bg-transparent hover:text-[#008080] text-sm emerald-glow-strong">XUẤT BẢN SÁCH</button> {/* */}
                </div>
                <div className="flex-grow book-viewer" onClick={() => setActiveSceneId(null)}> {/* */}
                    {pageContent}
                </div>
                <div className="flex justify-center items-center gap-4"> {/* */}
                    <button onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))} className="px-4 py-2 bg-gray-700 rounded-sm hover:bg-gray-600">Trang trước</button>
                    <span className="font-bold text-white">Trang {currentPageIndex === 0 ? 'Bìa' : currentPageIndex} / {scenes.length}</span> {/* */}
                    <button onClick={() => setCurrentPageIndex(p => Math.min(scenes.length, p + 1))} className="px-4 py-2 bg-gray-700 rounded-sm hover:bg-gray-600">Trang sau</button> {/* */}
                </div>
            </div>
        );
    }; //

    // --- Phần JSX return chính ---
    return ( //
        <>
            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="export-modal"> {/* */}
                    <div className="export-modal-content">
                        <h3 className="text-2xl font-bold text-[#CDAD5A] mb-4">Tùy chọn Xuất Bản</h3>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-6"> {/* */}
                            {[...Array(scenes.length + 1).keys()].map(pageNum => (
                                <div key={pageNum} onClick={() => togglePageSelection(pageNum)} className={`page-thumbnail ${selectedPagesForExport.has(pageNum) ? 'selected' : ''}`}> {/* */}
                                     <img src={scenes[pageNum-1]?.imageUrl || scenes[0]?.imageUrl || 'https://placehold.co/600x800/333/CDAD5A?text=...'} className="w-full aspect-[3/4] object-cover bg-gray-700"/> {/* */}
                                    <p className="text-xs text-center bg-gray-800 p-1">{pageNum === 0 ? 'Bìa' : `Trang ${pageNum}`}</p>
                                </div>
                            ))} {/* */}
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setSelectedPagesForExport(new Set([...Array(scenes.length + 1).keys()]))} className="text-xs text-gray-400 hover:text-white">Chọn tất cả</button> {/* */}
                            <button onClick={() => setSelectedPagesForExport(new Set())} className="text-xs text-gray-400 hover:text-white">Bỏ chọn tất cả</button> {/* */}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={startPdfExport} className="flex-1 bg-[#008080] text-white font-bold py-2 px-4 rounded-sm emerald-glow">Xuất PDF</button> {/* */}
                             <button disabled className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-sm cursor-not-allowed">Xuất ePUB (Sắp có)</button> {/* */}
                            <button onClick={() => setIsExportModalOpen(false)} className="bg-gray-800 text-white py-2 px-4 rounded-sm">Hủy</button>
                        </div>
                    </div>
                </div> //
            )}

            {/* Hidden Div for PDF Export */}
            {isExporting && ( //
                <div className="page-export-render-container">
                {scenes.map((scene, index) => {
                    const pageNum = index + 1;
                    if (!selectedPagesForExport.has(pageNum)) return null; //
                    return (
                    <div key={`export-${pageNum}`} id={`export-page-${pageNum}`} className="book-page" style={{ width: '827px', height: '1102px' }}>
                        <img src={scene.imageUrl} alt={`Page ${pageNum}`} className="page-background" />
                        <div className="text-overlay" style={{
                             top: `${scene.textProperties.y}%`, left: `${scene.textProperties.x}%`, width: `${scene.textProperties.width}%`, //
                            fontSize: `${scene.textProperties.fontSize * 16}px`, // Convert vw-like unit to px for export
                            fontFamily: scene.textProperties.fontFamily, color: scene.textProperties.color,
                            textAlign: scene.textProperties.textAlign, backgroundColor: scene.textProperties.backgroundColor,
                         }}> {/* */}
                            <div style={{minHeight: '2em'}}>{scene.textProperties.content}</div>
                        </div>
                    </div>
                )})}
                 {selectedPagesForExport.has(0) && ( //
                    <div id="export-page-0" className="book-page book-cover" style={{ width: '827px', height: '1102px' }}>
                         <img src={scenes[0]?.imageUrl || 'https://placehold.co/600x800/333/CDAD5A?text=Bìa+Sách'} alt="Book Cover" className="book-cover-image" /> {/* Cập nhật fallback */}
                        <div className="cover-text-overlay">
                             <div className="text-4xl font-playfair font-bold text-white">{bookTitle}</div> {/* */}
                            <div className="text-2xl font-montserrat text-white">{authorName}</div>
                        </div>
                    </div>
                )}
                </div> //
            )}

            {/* Main Content */}
            <div className="fade-in-content flex flex-col h-full text-sm p-4 md:p-6 space-y-2 narrative-studio-bg relative"> {/* */}
                {/* Banner */}
                <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-r from-[#CDAD5A]/50 via-[#66334C]/50 to-[#CDAD5A]/50 text-center text-xs font-bold text-black backdrop-blur-sm z-20">
                  SỨC MẠNH NARRATIVE STUDIO CHỈ DÀNH CHO MAGISTRATE VÀ TOÀN TRI. {/* */}
                </div> {/* */}
                {/* Header */}
                <div className="flex justify-between items-center pt-6"> {/* */}
                    <h2 className="text-xl md:text-2xl text-center font-playfair text-[#E0E0E0] tracking-wider">IX. NARRATIVE STUDIO</h2> {/* */}
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2 z-10">&times; Trở Về</button> {/* */}
                </div>
                {/* Main Area */}
                <div className="flex-grow min-h-0"> {/* */}
                    {isLoading ? <Loader text={loadingMessage} /> : ( //
                        <>
                            {phase === 'input' && renderInputPhase()}
                            {phase === 'process' && renderProcessPhase()}
                            {phase === 'output' && scenes.length > 0 && renderOutputPhase()} {/* */}
                        </>
                    )}
                </div> {/* */}
                {/* Error Message */}
                {error && <p className="text-red-500 text-center text-xs pt-2 absolute bottom-2 left-1/2 -translate-x-1/2">{error}</p>} {/* */}
            </div>
        </>
    ); //
};

export default NarrativeStudioTool; //
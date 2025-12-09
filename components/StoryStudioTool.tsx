// File: components/StoryStudioTool.tsx (Hoàn Chỉnh - Tích hợp KDP Workflow & Spread View & Giới hạn Trang 1-100)

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { BookIcon } from './AnimatedIcons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface NarrativeStudioToolProps {
  onBack: () => void;
}

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

// --- ĐỊNH NGHĨA KÍCH THƯỚC CHUẨN KDP (Đơn vị: mm) ---
const KDP_TRIM_SIZES = {
  // Dùng 3:4 (Portrait) để Imagen chấp nhận, 6x9 inch
  '6x9 (Tiêu chuẩn)': { widthMM: 152.4, heightMM: 228.6, aspectRatio: '3:4', bleed: 3.2 }, 
  // 1:1 (Square), 8.5x8.5 inch
  '8.5x8.5 (Vuông)': { widthMM: 215.9, heightMM: 215.9, aspectRatio: '1:1', bleed: 3.2 },
  // 4:3 (Landscape), 8.25x6 inch
  '8.25x6 (Ngang)': { widthMM: 209.55, heightMM: 152.4, aspectRatio: '4:3', bleed: 3.2 },
};

type TrimSizeKey = keyof typeof KDP_TRIM_SIZES; 
// ----------------------------------------------------

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

const Loader: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="w-20 h-20 text-[#CDAD5A]">
            <BookIcon />
        </div>
        <p className="mt-4 text-white text-lg font-semibold animate-pulse">{text}</p>
        <p className="mt-2 text-gray-400 text-sm">Đang phân tích và vẽ minh họa...</p>
    </div>
);

const StoryStudioTool: React.FC<NarrativeStudioToolProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<Phase>('input');
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [storyIdea, setStoryIdea] = useState('');
  const [style, setStyle] = useState(imageStyles[4]);
  const [language, setLanguage] = useState(languages[0].value);
  const [numberOfScenes, setNumberOfScenes] = useState(10); // MẶC ĐỊNH 10 CẢNH
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Đang khởi tạo...');
  
  const [selectedTrimSize, setSelectedTrimSize] = useState<TrimSizeKey>('6x9 (Tiêu chuẩn)');
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  
  const [outputView, setOutputView] = useState<OutputView>('preview'); 
  const [bookSummary, setBookSummary] = useState(''); 
  
  // Ref cho từng trang
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  
  const selectedKDP = KDP_TRIM_SIZES[selectedTrimSize];

  const handleGenerateScenes = async () => {
    setError(null);
    setIsLoading(true);
    setLoadingMessage('1/2. Đang phân tích câu chuyện...');
    
    if (!bookTitle || !authorName) {
        setError("Vui lòng điền đủ Tên Sách và Tên Tác Giả trước khi phân tích.");
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
        throw new Error(err.error || 'Lỗi không xác định khi phân tích cảnh.');
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
        // TRANG 1 LÀ LẺ (BÊN PHẢI) --> isLeftPage = false. Trang 2 là chẵn (bên trái) --> isLeftPage = true
        isLeftPage: (index + 1) % 2 === 0, 
        textProperties: {
          content: s.narrationText,
          x: 50, y: 85, width: 80, fontSize: 1.5,
          fontFamily: 'Times New Roman', color: '#111827',
          textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
      }));
      setScenes(initialScenes);
      
      pageRefs.current = new Array(initialScenes.length).fill(null);
      
      setPhase('process');

    } catch (e: any) {
      console.error("Lỗi phân tích cảnh:", e);
      setError(e.message);
      setIsLoading(false);
    }
  };

  const generateImageForScene = useCallback(async (index: number) => {
    const sceneToUpdate = scenes[index];
    if (!sceneToUpdate || sceneToUpdate.imageUrl) return; 

    setLoadingMessage(`2/2. Đang vẽ minh họa cho cảnh ${index + 1}/${scenes.length}...`);
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
            throw new Error(err.error || 'Lỗi không xác định khi tạo ảnh.');
        }

        const data = await res.json();
        
        setScenes(prevScenes => prevScenes.map((s, i) => 
            i === index ? { ...s, imageUrl: data.imageUrl } : s
        ));

    } catch (e: any) {
        setError(`Lỗi Cảnh ${index + 1}: ${e.message}. (Tự động skip. Vui lòng kiểm tra prompt của cảnh này).`);
    }
  }, [scenes]);

  useEffect(() => {
    if (phase === 'process' && scenes.length > 0) {
      const nextIndex = scenes.findIndex(s => !s.imageUrl);
      if (nextIndex !== -1) {
        setIsLoading(true);
        generateImageForScene(nextIndex);
      } else {
        setIsLoading(false);
        setPhase('output');
        setLoadingMessage('Hoàn thành! Sách đã sẵn sàng để xuất bản.');
      }
    }
  }, [phase, scenes, generateImageForScene]);
  
  const handleGenerateCover = async () => {
    if (!storyIdea || !style || !bookTitle || !authorName) {
        setError("Vui lòng điền đủ Tên Sách, Tên Tác Giả, Ý tưởng truyện và Phong cách.");
        return;
    }
    
    const coverPrompt = `Thiết kế bìa sách gập (full wrap cover) chuyên nghiệp, chất lượng cao 300 DPI, phù hợp cho in ấn KDP.
    - Tiêu đề CẦN phải được minh họa: "${bookTitle}". 
    - Chủ đề cốt lõi: "${storyIdea}". 
    - Phong cách minh họa: ${style}. 
    - Yêu cầu hình ảnh: Tạo một bố cục ấn tượng, tập trung vào **chủ đề chính** của câu chuyện để thu hút người mua. Bìa phải có **góc rộng (wide view)** để có không gian cho Tiêu đề, Tác giả và Tóm tắt sau này. Màu sắc tươi sáng, sắc nét. **KHÔNG BAO GỒM BẤT KỲ CHỮ NÀO (NO TEXT) VÀO TRONG ẢNH.**`;


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
            throw new Error(err.error || 'Lỗi không xác định khi tạo bìa.');
        }

        const data = await res.json();
        setCoverUrl(data.imageUrl);

    } catch (e: any) {
        setError(`Lỗi tạo Bìa Sách: ${e.message}.`);
    } finally {
        setIsGeneratingCover(false);
    }
  };

  const generatePDF = async () => {
    if (!scenes.length) {
        alert('Chưa có cảnh nào để xuất bản.');
        return;
    }

    const { widthMM, heightMM, bleed } = KDP_TRIM_SIZES[scenes[0].trimSize];
    
    const totalWidthMM = widthMM + 2 * bleed;
    const totalHeightMM = heightMM + 2 * bleed;

    const pdf = new jsPDF({
        unit: 'mm',
        format: [totalWidthMM, totalHeightMM],
    });

    for (let i = 0; i < scenes.length; i++) {
        if (i > 0) {
            pdf.addPage();
        }
        
        const pageElement = pageRefs.current[i];
        if (pageElement) { 
            // TẠO CANVAS: Chụp cả hình ảnh và Text Box lại
            const canvas = await html2canvas(pageElement, {
                scale: 3, // Tăng scale lên 3x (300 DPI)
                useCORS: true,
                width: pageElement.offsetWidth, 
                height: pageElement.offsetHeight,
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0); 
            
            // CHÈN ẢNH VÀO PDF: Ảnh này đã bao gồm text overlay.
            pdf.addImage(imgData, 'JPEG', 0, 0, totalWidthMM, totalHeightMM);
        }
    }
    
    pdf.save(`KDP_Interior_${selectedTrimSize}_${Date.now()}.pdf`);
    alert('Đã tạo file PDF NỘI DUNG chất lượng KDP. Tiếp theo hãy tạo BÌA SÁCH.');
  };

  const renderInputPhase = () => (
    <div className="space-y-6 pt-4">
      <h3 className="text-lg font-semibold text-[#CDAD5A]">1. Thiết lập Cấu hình Sách KDP</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
            <label htmlFor="book-title" className="text-sm font-medium text-gray-300 mb-1">Tên Sách (Tiêu đề)</label>
            <input
              id="book-title"
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="The Little Dragon Who Hated Fire"
              className="p-3 bg-[#1a1a08] border border-[#CDAD5A] text-white rounded-md focus:ring-1 focus:ring-[#CDAD5A]"
            />
        </div>
        <div className="flex flex-col">
            <label htmlFor="author-name" className="text-sm font-medium text-gray-300 mb-1">Tên Tác Giả</label>
            <input
              id="author-name"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="By Magistrate"
              className="p-3 bg-[#1a1a08] border border-[#CDAD5A] text-white rounded-md focus:ring-1 focus:ring-[#CDAD5A]"
            />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
            <label htmlFor="trim-size" className="text-sm font-medium text-gray-300 mb-1">Kích thước In Ấn (KDP Trim Size)</label>
            <select
              id="trim-size"
              value={selectedTrimSize}
              onChange={(e) => setSelectedTrimSize(e.target.value as TrimSizeKey)}
              className="p-3 bg-[#1a1a08] border border-[#CDAD5A] text-white rounded-md focus:ring-1 focus:ring-[#CDAD5A]"
            >
              {Object.keys(KDP_TRIM_SIZES).map(key => (
                  <option key={key} value={key}>{key} (Cắt Lề {KDP_TRIM_SIZES[key as TrimSizeKey].bleed}mm)</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Chọn kích thước in chuẩn để đảm bảo chất lượng KDP.</p>
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="scenes" className="text-sm font-medium text-gray-300 mb-1">Số lượng Cảnh (Trang)</label>
          <input
            id="scenes"
            type="number"
            value={numberOfScenes}
            onChange={(e) => setNumberOfScenes(Math.max(1, Math.min(100, parseInt(e.target.value))))} // ĐÃ SỬA GIỚI HẠN: 1 đến 100
            min="1" max="100"
            className="p-3 bg-[#1a1a08] border border-[#CDAD5A] text-white rounded-md focus:ring-1 focus:ring-[#CDAD5A]"
          />
          <p className="text-xs text-gray-500 mt-1">Linh hoạt từ 1 đến 100 trang. Lưu ý: KDP yêu cầu tối thiểu **24 trang** in ấn.</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-[#CDAD5A] pt-4">2. Nội dung và Phong cách</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor="language" className="text-sm font-medium text-gray-300 mb-1">Ngôn ngữ Sách</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-3 bg-[#1a1a08] border border-[#CDAD5A] text-white rounded-md focus:ring-1 focus:ring-[#CDAD5A]"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="style" className="text-sm font-medium text-gray-300 mb-1">Phong cách Minh họa</label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="p-3 bg-[#1a1a08] border border-[#CDAD5A] text-white rounded-md focus:ring-1 focus:ring-[#CDAD5A]"
          >
            {imageStyles.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col">
        <label htmlFor="story-idea" className="text-sm font-medium text-gray-300 mb-1">Tóm tắt Cốt truyện</label>
        <textarea
          id="story-idea"
          value={storyIdea}
          onChange={(e) => setStoryIdea(e.target.value)}
          rows={6}
          placeholder="Ví dụ: Một chú rồng con màu xanh tên là Draco không thích thở lửa. Cậu ấy muốn tạo ra những bong bóng xà phòng tuyệt đẹp để tặng bạn bè trong khu rừng phép thuật."
          className="p-3 bg-[#1a1a08] border border-[#CDAD5A] text-white rounded-md focus:ring-1 focus:ring-[#CDAD5A] resize-none"
        />
      </div>

      <button
        onClick={handleGenerateScenes}
        disabled={!storyIdea || !bookTitle || !authorName || isLoading}
        className="w-full bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-md transition-all hover:bg-transparent hover:text-[#008080] disabled:opacity-50"
      >
        KÍCH HOẠT XÂY DỰNG SÁCH (1. Phân Tích Cảnh)
      </button>
    </div>
  );
  
  const renderProcessPhase = () => (
    <div className="space-y-6 pt-4">
        <p className="text-gray-300 text-center">Đang vẽ từng cảnh... Vui lòng chờ cho đến khi tất cả ảnh được tạo.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scenes.map((scene, index) => (
                <div key={scene.id} className="relative aspect-square bg-[#1a1a08] rounded-lg overflow-hidden border-2" style={{borderColor: scene.imageUrl ? '#008080' : '#CDAD5A'}}>
                    <div className="absolute top-0 left-0 right-0 p-2 bg-black/60 text-center text-xs text-white font-bold z-10">Cảnh {scene.id}</div>
                    {scene.imageUrl ? (
                        <img src={scene.imageUrl} alt={`Cảnh ${scene.id}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500 text-xs p-2">
                            {error?.includes(`Cảnh ${scene.id}`) ? 'LỖI' : 'Đang vẽ...'}
                        </div>
                    )}
                </div>
            ))}
        </div>
        <button
            onClick={() => {
                setPhase('output');
                setIsLoading(false);
            }}
            disabled={isLoading || scenes.some(s => !s.imageUrl)}
            className="w-full bg-red-600 text-white font-bold py-3 px-5 border-2 border-red-600 rounded-md transition-all hover:bg-transparent hover:text-red-600 disabled:opacity-50"
        >
            BỎ QUA VÀ ĐẾN BƯỚC XUẤT BẢN
        </button>
    </div>
  );
  
  // --- TẠO VIEW MÔ PHỎNG TRANG ĐÔI (SPREADS) ---
  const renderBookPreview = () => {
      const { widthMM, heightMM } = selectedKDP;
      const aspectRatio = widthMM / heightMM;
      const previewHeight = 400;
      const previewWidth = previewHeight * aspectRatio;
      const spreadWidth = previewWidth * 2 + 10; // Chiều rộng của 2 trang + khoảng cách nhỏ

      // Gom các trang thành cặp (spreads)
      const spreads = [];
      // Trang 1 (Trang bìa trong/trang đầu tiên) luôn là trang lẻ (bên phải)
      if (scenes.length > 0) {
        spreads.push([scenes[0]]);
      }
      
      // Các cặp trang tiếp theo (trang chẵn + trang lẻ)
      for (let i = 1; i < scenes.length; i += 2) {
          spreads.push([scenes[i], scenes[i+1]].filter(s => s)); // Lọc bỏ trang lẻ cuối nếu có
      }
      
      return (
          <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
            <h4 className="text-lg font-semibold text-[#CDAD5A] pt-4 border-t border-gray-700">Tóm Tắt Sách (Blurb)</h4>
            <div className="bg-gray-800 p-4 rounded-lg shadow-xl border-l-4 border-[#008080]">
                <p className="text-gray-300 italic whitespace-pre-wrap">{bookSummary || "Chưa có tóm tắt. Vui lòng tạo lại nội dung."}</p>
                <div className="mt-3 text-xs text-gray-400">Tóm tắt này dùng để dán lên Bìa Sau (Back Cover) hoặc dùng cho Mô tả Amazon (Description).</div>
            </div>

            <h4 className="text-lg font-semibold text-[#CDAD5A] pt-4 border-t border-gray-700">Xem Trước Trải Ngang (Spreads View - L-R)</h4>
              {spreads.map((spread, spreadIndex) => {
                  const isSinglePage = spread.length === 1;
                  const isFirstPage = spreadIndex === 0; // Trang 1

                  // Chiều rộng tổng của spread: full width cho spread đôi, previewWidth cho spread đơn
                  const currentSpreadWidth = isSinglePage ? previewWidth : spreadWidth;

                  return (
                      <div key={spreadIndex} className="p-4 bg-gray-900 rounded-lg shadow-xl border border-[#CDAD5A]/30">
                          <div className="text-sm font-bold text-[#CDAD5A] mb-2">
                              {isFirstPage ? `Trang 1 (Trang Lẻ - Bên Phải)` : `Trang ${spread[0].id} & ${spread[1] ? spread[1].id : 'Trống'}`}
                          </div>
                          
                          <div 
                              className={`mx-auto flex gap-2 ${isSinglePage ? 'justify-center' : 'justify-between'}`}
                              style={{ width: currentSpreadWidth, height: previewHeight }}
                          >
                              {/* Nếu là Trang 1 (lẻ) -> chỉ hiển thị 1 trang bên phải, thêm khoảng trống bên trái */}
                              {isFirstPage && (
                                <div 
                                    style={{ width: previewWidth, height: previewHeight }}
                                    className="bg-gray-700 border-4 border-dashed border-gray-500/50 flex items-center justify-center text-gray-400 order-1"
                                >
                                    Trang Trống (Không có nội dung ở vị trí này)
                                </div>
                              )}

                              {/* Hiển thị Trang Nội Dung */}
                              {spread.map((scene) => (
                                  <div
                                      key={scene.id}
                                      ref={el => pageRefs.current[scene.id - 1] = el}
                                      style={{ width: previewWidth, height: previewHeight }}
                                      // Trang chẵn (isLeftPage=true) nằm bên trái (order-1), Trang lẻ (isLeftPage=false) nằm bên phải (order-2)
                                      className={`relative bg-white shadow-lg overflow-hidden border-4 border-dashed border-red-500/50 flex-shrink-0 ${scene.isLeftPage ? 'order-1' : 'order-2'}`}
                                  >
                                      <div className="absolute top-1 right-1 text-xs font-bold text-gray-500 z-10 p-1 bg-white/70 rounded">P.{scene.id}</div>
                                      {scene.imageUrl && (
                                          <img
                                              src={scene.imageUrl}
                                              alt={`Cảnh ${scene.id}`}
                                              className="w-full h-full object-cover" 
                                          />
                                      )}
                                      
                                      <div 
                                          style={{
                                              position: 'absolute',
                                              top: `${scene.textProperties.y}%`,
                                              left: `${scene.textProperties.x}%`,
                                              width: `${scene.textProperties.width}%`,
                                              transform: 'translate(-50%, -50%)',
                                              fontSize: '14px', 
                                              color: scene.textProperties.color,
                                              textAlign: scene.textProperties.textAlign,
                                              fontFamily: scene.textProperties.fontFamily,
                                              backgroundColor: scene.textProperties.backgroundColor, 
                                              padding: '0.5em 0.8em',
                                              borderRadius: '6px',
                                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                          }}
                                          className="flex justify-center items-center"
                                      >
                                          <p className="m-0 leading-snug">{scene.textProperties.content}</p>
                                      </div>
                                  </div>
                              ))}
                              
                              {/* THÊM TRANG TRỐNG NẾU LẺ (Trang 2 cuối cùng) */}
                              {isSinglePage && !isFirstPage && (
                                  <div 
                                    style={{ width: previewWidth, height: previewHeight }}
                                    className="bg-gray-700 border-4 border-dashed border-gray-500/50 flex items-center justify-center text-gray-400 order-2"
                                  >
                                      Trang Trống Cuối Cùng
                                  </div>
                              )}
                          </div>
                          
                          {/* KHUNG CHỈNH SỬA TƯƠNG TÁC */}
                          <div className="mt-4 space-y-3 bg-gray-900 p-3 rounded-md">
                            {spread.map(scene => (
                                <div key={`edit-${scene.id}`} className="border-b border-gray-700 pb-3 last:border-b-0">
                                    <h5 className="text-sm font-semibold text-gray-400">P.{scene.id} Chỉnh sửa</h5>
                                    <label className="text-xs font-semibold text-gray-400 block mt-2">Lời kể (Chỉnh sửa Text)</label>
                                    <textarea
                                        value={scene.textProperties.content}
                                        onChange={(e) => setScenes(prev => prev.map((s, i) => i === scene.id - 1 ? { ...s, textProperties: { ...s.textProperties, content: e.target.value } } : s))}
                                        rows={2}
                                        className="w-full p-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-md resize-none"
                                    />
                                    
                                    <label className="text-xs font-semibold text-gray-400 block mt-3">Lệnh Tạo Ảnh (Chỉnh sửa Prompt)</label>
                                    <textarea
                                        value={scene.imagePrompt}
                                        onChange={(e) => setScenes(prev => prev.map((s, i) => i === scene.id - 1 ? { ...s, imagePrompt: e.target.value } : s))}
                                        rows={2}
                                        className="w-full p-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-md resize-none"
                                    />

                                    <button
                                        onClick={() => generateImageForScene(scene.id - 1)}
                                        className="w-full bg-[#66334C] text-white font-bold py-2 px-3 border-2 border-[#66334C] rounded-md transition-all hover:bg-transparent hover:text-[#66334C] disabled:opacity-50 mt-2"
                                        disabled={isLoading || isGeneratingCover}
                                    >
                                        TẠO LẠI ẢNH CẢNH {scene.id}
                                    </button>
                                </div>
                            ))}
                          </div>

                      </div>
                  );
              })}
          </div>
      );
  }

  // --- TẠO VIEW HƯỚNG DẪN KDP CHI TIẾT ---
  const renderKDPWorkflow = () => (
      <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <h4 className="xl font-bold text-green-400">🎯 Quy Trình Xuất Bản Amazon KDP (Paperback) Hoàn Chỉnh</h4>
          
          <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-bold text-[#CDAD5A] mb-2">Bước 1: Chuẩn bị File và Thông số</h5>
              <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                  <li>**File Nội dung PDF:** Đã tạo (bấm nút Xuất bản PDF Nội dung).</li>
                  <li>**Ảnh Bìa JPEG:** Đã tạo (bấm nút TẠO BÌA SÁCH và Tải Xuống).</li>
                  <li>**Thông số Sách:**
                      <ul>
                          <li>Trim Size: **{selectedTrimSize}**</li>
                          <li>Số Trang: **{scenes.length}**</li>
                          <li>Tóm tắt (Blurb): **"{bookSummary.length > 50 ? bookSummary.substring(0, 50) + '...' : 'Chưa có tóm tắt'}"** (Được tạo tự động, dùng cho mô tả/bìa sau).</li>
                      </ul>
                  </li>
              </ol>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-bold text-[#CDAD5A] mb-2">Bước 2: Tạo File Bìa Cuối Cùng (PDF Print Ready)</h5>
              <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                  <li>Truy cập: [**KDP Cover Calculator**](https://kdp.amazon.com/cover-calculator)</li>
                  <li>Nhập các thông số Trim Size, Số Trang ({scenes.length}), Loại Giấy (White/Cream) và **Tải Mẫu Bìa (Template)**.</li>
                  <li>Sử dụng Canva/Photoshop, đặt **Ảnh Bìa JPEG (16:9)** làm nền cho Template (Phải lấp đầy toàn bộ vùng Template).</li>
                  <li>Thêm **Tiêu đề, Tác giả** vào Mặt Trước và **Tóm tắt (Blurb)** vào Mặt Sau (tránh vùng mã vạch góc dưới bên phải).</li>
                  <li>**Xuất file Bìa cuối cùng dưới dạng PDF (Print Ready) - RẤT QUAN TRỌNG.**</li>
              </ol>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-bold text-[#CDAD5A] mb-2">Bước 3: Tải Lên Amazon KDP</h5>
              <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                  <li>Tạo Paperback mới trên KDP.</li>
                  <li>**Trang 1 (Details):** Điền Tiêu đề, Tác giả, **Mô tả (Dùng Blurb đã tạo)**, Keywords, Categories.</li>
                  <li>**Trang 2 (Content):** <ul>
                          <li>KDP ISBN: Chọn **Get a free KDP ISBN**.</li>
                          <li>Trim Size: Chọn **{selectedTrimSize}** & Bleed: Chọn **Bleed**.</li>
                          <li>Hướng Đọc (**Reading Direction**): Chọn **Left to Right (L-R)** (Cho Tiếng Việt/Anh).</li>
                          <li>Tải lên **PDF Nội dung** và **PDF Bìa Cuối cùng**.</li>
                          <li>Bấm **Launch Previewer** và duyệt toàn bộ sách để kiểm tra lỗi cắt lề (margin/bleed).</li>
                      </ul>
                  </li>
                  <li>**Trang 3 (Pricing):** Đặt giá và bấm **Publish**.</li>
              </ol>
          </div>
          
          <div className="bg-red-900/50 p-3 rounded-md text-sm text-red-300">
              **⚠️ Ghi chú quan trọng:** Nếu Previewer báo lỗi **Margin** hoặc **Bleed** trên bìa, anh phải chỉnh sửa lại file Bìa PDF theo Template KDP và tải lên lại, không được bỏ qua.
          </div>
      </div>
  );

  const renderOutputPhase = () => (
    <div className="space-y-6 pt-4">
      <h3 className="xl font-semibold text-[#008080] text-center">🎉 Sách Đã Hoàn Thành!</h3>
      <p className="text-gray-300 text-center">Tổng cộng {scenes.length} trang. Sách được thiết lập cho kích thước **{selectedTrimSize}** (Cắt Lề {selectedKDP.bleed}mm).</p>

      <div className="flex flex-col md:flex-row gap-4 sticky bottom-0 bg-[#1a1a08]/80 backdrop-blur-sm p-4 rounded-lg z-10 border-t border-gray-700">
          <button
              onClick={generatePDF}
              className="flex-grow bg-[#CDAD5A] text-black font-bold py-3 px-5 border-2 border-[#CDAD5A] rounded-md transition-all hover:bg-transparent hover:text-[#CDAD5A] disabled:opacity-50"
              disabled={isLoading || isGeneratingCover}
          >
              1. XUẤT BẢN PDF NỘI DUNG (300 DPI)
          </button>
          <button
              onClick={handleGenerateCover}
              className={`flex-grow font-bold py-3 px-5 border-2 rounded-md transition-all ${isGeneratingCover ? 'bg-gray-600 text-white' : 'bg-[#66334C] text-white hover:bg-transparent hover:text-[#66334C]'}`}
              disabled={isLoading || isGeneratingCover}
          >
              {isGeneratingCover ? 'Đang tạo BÌA...' : '2. TẠO BÌA NGHỆ THUẬT (16:9)'}
          </button>
      </div>

      <div className="pt-4 border-t border-gray-700">
        <h4 className="text-lg font-semibold text-[#CDAD5A] mb-3">Tài sản Bìa Sách</h4>
        <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-gray-900 rounded-lg">
            {coverUrl ? (
                <>
                    <img 
                        src={coverUrl} 
                        alt="KDP Book Cover" 
                        className="w-full max-w-lg shadow-2xl border-4 border-white/50" 
                        style={{ aspectRatio: '16 / 9' }} 
                    />
                    {/* NÚT TẢI ẢNH BÌA */}
                    <a
                        href={coverUrl}
                        download={`KDP_Cover_Asset_${bookTitle.replace(/\s/g, '_')}.jpeg`}
                        className="bg-[#008080] text-white font-bold py-2 px-4 rounded-md transition-all hover:bg-transparent hover:text-[#008080] border-2 border-[#008080]"
                    >
                        3. Tải Xuống Ảnh Bìa Gốc (JPEG)
                    </a>
                </>
            ) : (
                <div 
                    className="w-full max-w-lg bg-gray-700 flex items-center justify-center text-center text-gray-400 p-8 rounded-lg"
                    style={{ aspectRatio: '16 / 9' }}
                >
                    Chưa có bìa. Vui lòng bấm "TẠO BÌA NGHỆ THUẬT".
                </div>
            )}
        </div>
      </div>
      
      {/* TABS XEM TRƯỚC VÀ WORKFLOW */}
      <div className="pt-6 border-t border-gray-700">
          <div className="flex mb-4 border-b border-gray-700">
              <button
                  onClick={() => setOutputView('preview')}
                  className={`px-4 py-2 font-semibold transition-colors ${outputView === 'preview' ? 'text-[#CDAD5A] border-b-2 border-[#CDAD5A]' : 'text-gray-400 hover:text-white'}`}
              >
                  👁️ Xem Trước Sách (Spread View)
              </button>
              <button
                  onClick={() => setOutputView('workflow')}
                  className={`px-4 py-2 font-semibold transition-colors ${outputView === 'workflow' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}
              >
                  📋 KDP PUBLISH WORKFLOW (Bắt Buộc)
              </button>
          </div>
          
          {outputView === 'preview' && renderBookPreview()}
          {outputView === 'workflow' && renderKDPWorkflow()}
      </div>
    </div>
  );
  
  return (
    <div className="h-full flex flex-col p-2 md:p-6 text-white overflow-hidden font-sans">
      <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-r from-[#CDAD5A]/50 via-[#66334C]/50 to-[#CDAD5A]/50 text-center text-xs font-bold text-black backdrop-blur-sm z-20">
        SỨC MẠNH NARRATIVE STUDIO CHỈ DÀNH CHO MAGISTRATE VÀ TOÀN TRI.
      </div>
      
      <div className="flex justify-between items-center pt-6">
          <h2 className="text-xl md:text-2xl text-center font-playfair text-[#E0E0E0] tracking-wider">IX. NARRATIVE STUDIO (KDP PRO)</h2>
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors pr-2 z-10">&times; Trở Về</button>
      </div>
      
      <div className="flex-grow min-h-0 overflow-y-auto pb-4">
        {isLoading || isGeneratingCover ? <Loader text={loadingMessage} /> : (
            <>
                {phase === 'input' && renderInputPhase()}
                {phase === 'process' && renderProcessPhase()}
                {phase === 'output' && scenes.length > 0 && renderOutputPhase()}
            </>
        )}
      </div>
      
      {error && <p className="text-red-500 text-center text-xs pt-2 absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-900/90 p-1 rounded-md z-30">{error}</p>}
    </div>
  );
};

export default StoryStudioTool;
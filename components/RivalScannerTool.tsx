// components/RivalScannerTool.tsx - BẢN FIX ĐẦY ĐỦ VÀ ĐỒNG BỘ
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { BinocularsIcon } from './AnimatedIcons';
import type { Tool } from './ToolsGrid';

// Interface ĐẦY ĐỦ VỚI TẤT CẢ FIELDS MỚI TỪ API
interface OutputData {
  competitorProfile: {
    name: string;
    subscribers: string; // Đã thêm
  };
  strategicWeaknesses: string[];
  successSignals: string[];
  contentStructure: {
    mainKeywords: string[];
    seoEvaluation: string;
  };
  untappedNiches: string[]; // Đã bỏ optional và fix type
  titleAnalysis: string;
  descriptionAnalysis: string;
  tagsHashtags: string[];
  thumbnailAnalysis: string;
  contentStrategy: string;
  counterAttackPlan: string;
  // <--- 2 TRƯỜNG MỚI BẮT BUỘC --->
  audienceGapAnalysis: string[];
  videoPersonaScore: {
    tone: string;
    emotion: string;
  };
}

// Loader với animation pro
const Loader = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-xl">
    <div className="relative w-32 h-32">
      <BinocularsIcon className="absolute inset-0 w-full h-full text-[#008080] animate-[spin_2s_linear_infinite]" />
      <div className="absolute inset-0 w-1 h-1 bg-[#008080] rounded-full animate-ping opacity-75"></div>
    </div>
    <p className="mt-6 text-xl font-bold text-[#008080] animate-pulse">ĐANG PHÂN TÍCH ĐỐI THỦ...</p>
    <p className="mt-2 text-sm text-gray-400">Dò quét 360 độ về chiến lược nội dung...</p>
  </div>
);

interface RivalScannerToolProps {
  onBack: () => void;
  onToolSelect: (tool: Tool) => void;
  tools: Tool[];
}

export const RivalScannerTool: React.FC<RivalScannerToolProps> = ({ onBack, onToolSelect }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const isEN = router.locale === 'en';

  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    setIsLoading(true);
    setOutput(null);

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tool: 'rival', input }),
      });

      const data = await response.json();

      if (response.ok) {
        // Kiểm tra sự tồn tại của các trường BẮT BUỘC trước khi set
        if (data && data.competitorProfile && Array.isArray(data.strategicWeaknesses)) {
          setOutput(data as OutputData);
        } else {
          throw new Error("Cấu trúc JSON phản hồi không hợp lệ từ AI.");
        }

        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        alert('Lỗi API Backend: ' + (data.error || 'Đã xảy ra lỗi không xác định từ Server.'));
      }
    } catch (error: any) {
      alert('Lỗi Frontend xử lý: ' + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (title: string, content: string | string[]) => (
    <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-[#CDAD5A]/30">
      <h3 className="text-xl font-bold text-[#CDAD5A] mb-2 border-b border-[#CDAD5A]/50 pb-1">{title}</h3>
      {Array.isArray(content) ? (
        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
          {content.map((item, i) => <li key={i} className="text-sm">{item}</li>)}
        </ul>
      ) : (
        <p className="text-gray-300 text-sm whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );

  const renderAnalysis = (title: string, content: string) => (
    <div className="mb-4 p-3 bg-black/40 rounded-lg border border-[#008080]/30">
      <h4 className="text-lg font-bold text-[#008080] mb-1">{title}</h4>
      <p className="text-gray-300 text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );

  const handleUseForScript = () => {
    // Logic cho nút "Sử dụng cho kịch bản"
    alert("Chức năng 'Sử dụng cho kịch bản' đang được phát triển!");
  };

  return (
    <div className="relative p-6 max-w-6xl mx-auto bg-[#1a1008] rounded-xl min-h-[600px] shadow-2xl">
      <button onClick={onBack} className="absolute top-4 left-4 text-[#CDAD5A] hover:text-white transition-colors">
        ← {isEN ? 'Back' : 'Quay lại'}
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-[#008080] uppercase tracking-widest">RIVAL SCANNER TOOL</h1>
        <p className="text-gray-400 mt-1">{isEN ? 'In-depth competitor analysis on YouTube.' : 'Phân tích chuyên sâu đối thủ cạnh tranh trên YouTube.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isEN ? 'Enter YouTube channel URL or Username/Handle (e.g., youtube.com/@channel)...' : 'Nhập URL hoặc Username/Handle của kênh YouTube (ví dụ: youtube.com/@tenken)...'}
          className="flex-grow p-4 bg-gray-900 border-2 border-[#CDAD5A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#008080]"
          required
        />
        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-[#008080] to-teal-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-[#008080] transition-all duration-200 shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (isEN ? 'SCANNING...' : 'ĐANG DÒ QUÉT...') : (isEN ? 'ANALYZE COMPETITOR' : 'PHÂN TÍCH ĐỐI THỦ')}
        </button>
      </form>

      <div className="relative min-h-[300px]" ref={resultRef}>
        {isLoading && <Loader />}

        {output && (
          <div className="mt-6 p-6 bg-[#1a1008] border border-[#008080]/30 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-black text-[#008080] mb-4 border-b border-[#008080] pb-2">
              BÁO CÁO SCANNER: {output.competitorProfile.name}
            </h2>
            <p className="text-xl font-bold text-[#CDAD5A] mb-4">
              Người đăng ký: {output.competitorProfile.subscribers}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cột 1: Điểm Mạnh/Yếu & Ngách */}
              <div className="lg:col-span-1">
                {renderSection("🎯 ĐIỂM YẾU CHIẾN LƯỢC", output.strategicWeaknesses)}
                {renderSection("✅ DẤU HIỆU THÀNH CÔNG", output.successSignals)}
                {renderSection("⛏️ NGÁCH CHƯA KHAI THÁC", output.untappedNiches)}
              </div>

              {/* Cột 2: Phân tích SEO/Cấu trúc */}
              <div className="lg:col-span-2">
                {renderSection("💡 KẾ HOẠCH PHẢN CÔNG 5 BƯỚC", output.counterAttackPlan)}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderAnalysis("Tiêu đề (Title) & Thumbnail", output.titleAnalysis + " | " + output.thumbnailAnalysis)}
                  {renderAnalysis("Mô tả (Description) & Thẻ", output.descriptionAnalysis)}
                </div>

                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-[#CDAD5A]/30">
                  <h3 className="text-xl font-bold text-[#CDAD5A] mb-2 border-b border-[#CDAD5A]/50 pb-1">
                    📖 Cấu Trúc Nội Dung & SEO Tổng Thể
                  </h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap mb-2">
                    <span className='font-bold text-[#008080]'>Đánh giá SEO:</span> {output.contentStructure.seoEvaluation}
                  </p>
                  <p className="text-sm font-bold text-[#008080] mt-3">Từ khóa chính:</p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {output.contentStructure.mainKeywords.map((keyword, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-700/50 rounded-full text-gray-300">{keyword}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* HÀNG MỚI: AUDIENCE GAP & PERSONA */}
            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2'>
                {renderSection("👨‍👩‍👧‍👦 KHOẢNG TRỐNG KHÁN GIẢ (AUDIENCE GAP)", output.audienceGapAnalysis)}
              </div>
              <div className='md:col-span-1 p-4 bg-gray-900/50 rounded-lg border border-[#008080]/30'>
                <h3 className="text-xl font-bold text-[#008080] mb-2 border-b border-[#008080]/50 pb-1">🎤 ĐIỂM SỐ NHÂN VẬT VIDEO</h3>
                <p className="text-gray-300 text-sm mt-2"><span className='font-bold text-[#CDAD5A]'>Tông Giọng:</span> {output.videoPersonaScore.tone}</p>
                <p className="text-gray-300 text-sm"><span className='font-bold text-[#CDAD5A]'>Cảm Xúc Chủ Đạo:</span> {output.videoPersonaScore.emotion}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-4 border-t border-gray-700 flex gap-4">
              <button
                onClick={handleUseForScript}
                className="flex-1 py-4 bg-gradient-to-r from-[#CDAD5A] to-yellow-600 text-black font-bold text-lg rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200 shadow-lg hover:shadow-yellow-500/25"
              >
                📝 SỬ DỤNG CHO KỊCH BẢN
              </button>
              <button
                onClick={() => {
                  if (output) {
                    const dataStr = JSON.stringify(output, null, 2);
                    navigator.clipboard.writeText(dataStr);
                    alert('Đã copy kết quả phân tích vào clipboard!');
                  }
                }}
                className="px-6 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-200 border border-gray-600"
                disabled={!output}
              >
                📋 Copy Kết Quả
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// components/RivalScannerTool.tsx - INTERFACE ĐÚNG VỚI API MỚI
import React, { useState, useRef } from 'react';
import { BinocularsIcon } from './AnimatedIcons';
import type { Tool } from './ToolsGrid';

// Interface FULL với tất cả fields mới từ API
interface OutputData {
  competitorProfile: { name: string };
  strategicWeaknesses: string[];
  successSignals: string[];
  contentStructure: { 
    mainKeywords: string[]; 
    seoEvaluation: string; 
  };
  untappedNiches?: string[];
  titleAnalysis: string;
  descriptionAnalysis: string;
  tagsHashtags: string[];
  thumbnailAnalysis: string;
  contentStrategy: string;
  counterAttackPlan: string;
}

// Loader với animation pro
const Loader = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-xl">
    <div className="relative w-32 h-32">
      <BinocularsIcon className="absolute inset-0 w-full h-full text-[#008080] animate-[spin_2s_linear_infinite]" />
      <div className="absolute inset-0 w-1 h-1 bg-[#008080] rounded-full animate-ping opacity-75"></div>
    </div>
    <p className="mt-6 text-xl font-bold text-[#008080] animate-pulse">Đang giải mã đối thủ...</p>
  </div>
);

const RivalScannerTool: React.FC<{ onBack: () => void; onToolSelect: (tool: Tool) => void; tools: Tool[] }> = ({ onBack, onToolSelect, tools }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<OutputData | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [outputLanguage, setOutputLanguage] = useState('Tiếng Việt');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      setError('Vui lòng dán URL đối thủ!');
      return;
    }

    setIsLoading(true);
    setError('');
    setOutput(null);
    buttonRef.current?.classList.add('animate-pulse');

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tool: 'rival', 
          targetUrl: targetUrl.trim(), 
          outputLanguage 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate & fallback nếu thiếu fields
      const validatedData: OutputData = {
        competitorProfile: data.competitorProfile || { name: 'Unknown' },
        strategicWeaknesses: data.strategicWeaknesses || [],
        successSignals: data.successSignals || [],
        contentStructure: {
          mainKeywords: data.contentStructure?.mainKeywords || [],
          seoEvaluation: data.contentStructure?.seoEvaluation || 'Chưa có dữ liệu SEO'
        },
        untappedNiches: data.untappedNiches || [],
        titleAnalysis: data.titleAnalysis || 'Chưa có phân tích tiêu đề',
        descriptionAnalysis: data.descriptionAnalysis || 'Chưa có phân tích mô tả',
        tagsHashtags: data.tagsHashtags || [],
        thumbnailAnalysis: data.thumbnailAnalysis || 'Chưa có phân tích thumbnail',
        contentStrategy: data.contentStrategy || 'Chưa có chiến lược nội dung',
        counterAttackPlan: data.counterAttackPlan || 'Chưa có kế hoạch phản công'
      };

      setOutput(validatedData);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Lỗi giải mã, thử lại nhé anh!');
    } finally {
      setIsLoading(false);
      buttonRef.current?.classList.remove('animate-pulse');
    }
  };

  const handleUseForScript = () => {
    if (!output) return;
    const idea = `Dựa trên phân tích đối thủ "${output.competitorProfile.name}", khai thác điểm yếu: ${output.strategicWeaknesses.slice(0, 3).join(', ')}. Ngách tiềm năng: ${output.untappedNiches?.slice(0, 2).join(', ') || 'N/A'}. Chiến lược: ${output.contentStrategy.slice(0, 100)}...`;
    localStorage.setItem('scriptIdeaFromRival', idea);
    const scriptTool = tools.find(t => t.name === "VIẾT KỊCH BẢN");
    if (scriptTool) onToolSelect(scriptTool);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 z-10 relative">
        <h2 className="text-3xl font-bold text-[#dd4444] tracking-widest drop-shadow-lg">RIVAL SCANNER PRO</h2>
        <button onClick={onBack} className="text-3xl hover:text-gray-300 transition duration-200">&times; Trở Về</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow relative z-10">
        {/* Left Column: Form Input (4 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-4 space-y-6 bg-gray-800/70 p-6 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL Đối Thủ (Kênh/Video)</label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://www.youtube.com/@amthucvghiepcuoi"
              className="w-full p-4 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#008080] outline-none transition-all duration-200 hover:border-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ngôn Ngữ Output</label>
            <select
              value={outputLanguage}
              onChange={(e) => setOutputLanguage(e.target.value)}
              className="w-full p-4 bg-gray-900/80 border border-gray-600 rounded-lg focus:border-[#008080] outline-none transition-all duration-200 hover:border-gray-500"
            >
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="English">English</option>
            </select>
          </div>
          
          <button
            ref={buttonRef}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-[#008080] to-[#00e0e0] text-black font-bold text-lg rounded-lg hover:from-[#00d4d4] hover:to-[#00f0f0] transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-emerald-500/25"
          >
            {isLoading ? "🔍 Đang Giải Mã..." : "🚀 GIẢI MÃ ĐỐI THỦ"}
          </button>
          
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
              <p className="text-red-400 text-center text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Right Column: Output (8 cols) */}
        <div className="lg:col-span-8 relative bg-gray-800/70 p-6 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm overflow-y-auto max-h-[calc(100vh-12rem)] space-y-6">
          {isLoading && <Loader />}
          
          {!output && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BinocularsIcon className="w-24 h-24 opacity-30 mb-4" />
              <p className="text-lg font-medium">Sẵn sàng giải mã đối thủ...</p>
              <p className="text-sm mt-2 opacity-75">Nhập URL và nhấn "Giải mã" để bắt đầu</p>
            </div>
          )}
          
          {output && (
            <div className="space-y-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#CDAD5A]/20 to-[#008080]/20 p-6 rounded-xl border border-[#CDAD5A]/30">
                <h3 className="text-2xl font-bold text-[#CDAD5A] mb-2">{output.competitorProfile.name}</h3>
                <p className="text-gray-400 text-sm">Phân tích đối thủ hoàn chỉnh - {new Date().toLocaleDateString('vi-VN')}</p>
              </div>

              {/* Core Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-red-900/20 to-red-950/20 rounded-xl border border-red-600/30 shadow-lg">
                  <h4 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Lỗ Hổng Chiến Lược
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-300">
                    {output.strategicWeaknesses.length > 0 ? (
                      output.strategicWeaknesses.map((w, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-red-400 mr-2 mt-0.5">⚠️</span>
                          <span>{w}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">Chưa phát hiện lỗ hổng rõ ràng</li>
                    )}
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 rounded-xl border border-emerald-600/30 shadow-lg">
                  <h4 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                    Tín Hiệu Thành Công
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-300">
                    {output.successSignals.length > 0 ? (
                      output.successSignals.map((s, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-emerald-400 mr-2 mt-0.5">✅</span>
                          <span>{s}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">Chưa phát hiện tín hiệu thành công rõ ràng</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Accordion Sections */}
              <div className="space-y-4">
                {/* SEO & Content */}
                <details className="group">
                  <summary className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-[#008080]/30 cursor-pointer hover:border-[#008080]/60 transition-all duration-200 flex items-center justify-between">
                    <span className="font-bold text-lg text-[#008080] flex items-center">
                      <span className="w-2 h-2 bg-[#008080] rounded-full mr-2 group-open:bg-[#00e0e0]"></span>
                      Phân Tích SEO & Nội Dung
                    </span>
                    <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 mt-2 bg-gray-900/50 rounded-lg border-l-4 border-[#008080]/50">
                    <p className="text-sm text-gray-300 mb-4">{output.contentStructure.seoEvaluation}</p>
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-200 mb-2">Keywords Chính:</h5>
                      <div className="flex flex-wrap gap-2">
                        {output.contentStructure.mainKeywords.length > 0 ? (
                          output.contentStructure.mainKeywords.map((k, i) => (
                            <span key={i} className="px-3 py-1 bg-[#008080]/20 text-[#008080] rounded-full text-xs font-medium border border-[#008080]/30">
                              {k}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs italic">Chưa xác định keywords</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{output.contentStrategy}</p>
                  </div>
                </details>

                {/* Title & Description */}
                <details className="group">
                  <summary className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-[#008080]/30 cursor-pointer hover:border-[#008080]/60 transition-all duration-200 flex items-center justify-between">
                    <span className="font-bold text-lg text-[#008080] flex items-center">
                      <span className="w-2 h-2 bg-[#008080] rounded-full mr-2 group-open:bg-[#00e0e0]"></span>
                      Phân Tích Tiêu Đề & Mô Tả
                    </span>
                    <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 mt-2 bg-gray-900/50 rounded-lg border-l-4 border-[#008080]/50">
                    <div className="space-y-4 text-sm text-gray-300">
                      <div>
                        <h5 className="font-medium text-gray-200 mb-1">🎯 Tiêu Đề:</h5>
                        <p>{output.titleAnalysis}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-200 mb-1">📝 Mô Tả:</h5>
                        <p>{output.descriptionAnalysis}</p>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Tags & Thumbnail */}
                <details className="group">
                  <summary className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-[#008080]/30 cursor-pointer hover:border-[#008080]/60 transition-all duration-200 flex items-center justify-between">
                    <span className="font-bold text-lg text-[#008080] flex items-center">
                      <span className="w-2 h-2 bg-[#008080] rounded-full mr-2 group-open:bg-[#00e0e0]"></span>
                      Tags, Hashtags & Thumbnail
                    </span>
                    <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 mt-2 bg-gray-900/50 rounded-lg border-l-4 border-[#008080]/50">
                    <div className="space-y-4 text-sm text-gray-300">
                      <div>
                        <h5 className="font-medium text-gray-200 mb-2">🏷️ Gợi Ý Tags/Hashtags:</h5>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {output.tagsHashtags.length > 0 ? (
                            output.tagsHashtags.map((t, i) => (
                              <span key={i} className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs border border-gray-600">
                                #{t}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 italic">Chưa có gợi ý tags</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-200 mb-1">🖼️ Thumbnail:</h5>
                        <p>{output.thumbnailAnalysis}</p>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Counter Attack Plan */}
                <details className="group">
                  <summary className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-[#008080]/30 cursor-pointer hover:border-[#008080]/60 transition-all duration-200 flex items-center justify-between">
                    <span className="font-bold text-lg text-[#008080] flex items-center">
                      <span className="w-2 h-2 bg-[#008080] rounded-full mr-2 group-open:bg-[#00e0e0]"></span>
                      Kế Hoạch Phản Công (30-60 Ngày)
                    </span>
                    <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 mt-2 bg-gray-900/50 rounded-lg border-l-4 border-[#008080]/50">
                    <div className="text-sm text-gray-300 space-y-3">
                      <p>{output.counterAttackPlan}</p>
                      {output.untappedNiches && output.untappedNiches.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <h5 className="font-medium text-gray-200 mb-2">🌟 Ngách Tiềm Năng Chưa Khai Thác:</h5>
                          <div className="flex flex-wrap gap-2">
                            {output.untappedNiches.map((niche, i) => (
                              <span key={i} className="px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-xs border border-emerald-500/30">
                                {niche}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-700 flex gap-4">
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

      {/* CSS Animation cho Tailwind */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-[spin_2s_linear_infinite] {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RivalScannerTool;
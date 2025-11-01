// File: components/ToolsGrid.tsx (ĐÃ THÊM LOGIC KIỂM SOÁT QUYỀN TRUY CẬP)

import React, { useState } from 'react';
import {
  PyramidIcon, PhiIcon, BinocularsIcon, PortalIcon, HourglassIcon,
  GearIcon, CubeIcon, CompassIcon, BookIcon, MicrophoneIcon
} from './AnimatedIcons';
import ScriptwriterTool from './ScriptwriterTool';
import SeoTool from './SeoTool';
import RivalScannerTool from './RivalScannerTool';
import HiddenChannelFinderTool from './HiddenChannelFinderTool';
import ScriptRefinerTool from './ScriptRefinerTool';
import MicroNicheMinerTool from './MicroNicheMinerTool';
import ImageForgeTool from './ImageForgeTool';
import StoryStudioTool from './StoryStudioTool';
import TextToSpeechTool from './TextToSpeechTool';
import VeocityTool from './VeocityTool';
import { useAuth } from '../AuthContext'; // Import Auth Context

export interface Tool {
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: React.ComponentType;
  bgColor: string;
}

const tools: Tool[] = [
  { 
    name: "VIẾT KỊCH BẢN", 
    shortDescription: "Tạo cấu trúc kịch bản video.", 
    longDescription: "Kiến tạo những câu chuyện lôi cuốn, có cấu trúc chặt chẽ, và tối ưu hóa cho thuật toán YouTube. Chỉ cần nhập ý tưởng, AI Gnosis Core sẽ phác thảo nên một kịch bản bom tấn, sẵn sàng để sản xuất.",
    icon: PyramidIcon, 
    bgColor: "#3C334D" 
  },
  { 
    name: "SEO YOUTUBE", 
    shortDescription: "Tối ưu hóa tiêu đề, mô tả và tag.",
    longDescription: "Giải mã Ma Trận YouTube. AI sẽ phân tích hàng triệu điểm dữ liệu để cung cấp cho bạn bộ tiêu đề, mô tả, và thẻ khóa có tỉ lệ chuyển đổi cao nhất, đẩy video của bạn lên đỉnh tìm kiếm.",
    icon: PhiIcon, 
    bgColor: "#003366" 
  },
  { 
    name: "PHÂN TÍCH ĐỐI THỦ", 
    shortDescription: "Lỗ hổng và chiến lược đối thủ.",
    longDescription: "Chiếu rọi mọi điểm yếu và chiến lược của đối thủ. Công cụ này vạch trần những gì đang hiệu quả, những lỗ hổng họ bỏ lại, và cơ hội vàng để bạn chiếm lĩnh thị trường.",
    icon: BinocularsIcon, 
    bgColor: "#660000" 
  },
  { 
    name: "TÌM KÊNH ẨN", 
    shortDescription: "Khám phá xu hướng bí mật.",
    longDescription: "Du hành vào những vùng đất chưa được khám phá của YouTube. AI sẽ lùng sục và phát hiện các xu hướng ngầm, các kênh 'kim cương trong đá' trước khi chúng trở nên viral.",
    icon: PortalIcon, 
    bgColor: "#663300" 
  },
  { 
    name: "VIẾT LẠI KỊCH BẢN", 
    shortDescription: "Hiệu chỉnh và tái cấu trúc nội dung.",
    longDescription: "Thuật toán Alkhemy sẽ biến những kịch bản cũ hoặc ý tưởng thô thành vàng. Tinh chỉnh câu từ, cải thiện dòng chảy, và tái cấu trúc nội dung để đạt hiệu suất lan truyền tối đa.",
    icon: HourglassIcon, 
    bgColor: "#336633" 
  },
  { 
    name: "TÌM MICRO NICHES", 
    shortDescription: "Khai thác phân khúc vàng.",
    longDescription: "Sử dụng la bàn AI để định vị những thị trường ngách vi mô đầy tiềm năng và ít cạnh tranh. Tìm ra cộng đồng đam mê của riêng bạn và trở thành tiếng nói độc tôn.",
    icon: CompassIcon, 
    bgColor: "#666600" 
  },
  { 
    name: "TẠO ẢNH", 
    shortDescription: "Chuyển đổi ý tưởng thành hình ảnh.",
    longDescription: "Chuyển hóa ngôn từ thành nghệ thuật thị giác. Tạo ra những hình thumbnail, ảnh bìa, hoặc concept art độc đáo và bắt mắt chỉ từ một vài mô tả đơn giản. Trí tưởng tượng của bạn là giới hạn duy nhất.",
    icon: CubeIcon, 
    bgColor: "#4C4C4C" 
  },
  { 
    name: "NARRATIVE STUDIO", 
    shortDescription: "Biến Text thành Sách Ảnh & Sách tô màu.",
    longDescription: "Biến Text thành sản phẩm Kể chuyện bằng Hình ảnh có cấu trúc hoặc Sách Tô Màu (Print-on-Demand Ready). Công cụ sản xuất toàn diện từ kịch bản đến file PDF/ePUB hoàn thiện.",
    icon: BookIcon, 
    bgColor: "#66334C" 
  },
  { 
    name: "TEXT-TO-SPEECH", 
    shortDescription: "Chuyển văn bản thành giọng nói chuyên nghiệp.",
    longDescription: "Thổi hồn vào từng con chữ. Chuyển đổi văn bản thành giọng nói AI chuyên nghiệp, tự nhiên và đầy cảm xúc với hàng loạt tùy chọn giọng đọc, sẵn sàng cho mọi video.",
    icon: MicrophoneIcon, 
    bgColor: "#006666" 
  },
  { 
    name: "TẠO VIDEO (Veo 3)", 
    shortDescription: "Dựng video tự động từ nội dung đầu vào.",
    longDescription: "Đỉnh cao của sáng tạo. Biến kịch bản, hình ảnh, hoặc chỉ là một ý nghĩ thoáng qua thành những thước phim chất lượng điện ảnh. Sức mạnh của một studio phim nằm trong tay bạn.",
    icon: GearIcon, 
    bgColor: "rgba(10,10,10,0.8)" 
  },
];

const ToolButton: React.FC<{ tool: Tool; onClick: () => void; isSelected: boolean, align: 'left' | 'right', isLocked: boolean }> = ({ tool, onClick, isSelected, align, isLocked }) => (
  <button 
    onClick={onClick}
    disabled={isLocked}
    className={`group w-full p-4 border border-gray-800/50 bg-black/30 backdrop-blur-sm flex items-center gap-4 transition-all duration-300 ${align === 'left' ? 'hover:-translate-x-1' : 'hover:translate-x-1'} ${isSelected ? 'border-[#008080] emerald-glow' : 'hover:bg-gray-900/40'} ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:border-[#008080]/80'}`}
  >
    <div className={`h-10 w-10 flex-shrink-0 flex items-center justify-center text-[#008080] transition-colors duration-300 ${isLocked ? 'text-gray-600' : isSelected ? 'text-[#CDAD5A]' : 'group-hover:text-[#CDAD5A]'}`}>
      {isLocked ? '🔒' : <tool.icon />}
    </div>
    <div className={`text-left ${align === 'right' && 'text-right'}`}>
      <h3 className={`font-semibold ${isLocked ? 'text-gray-500' : isSelected ? 'text-[#CDAD5A]' : 'text-white'}`}>{tool.name}</h3>
      <p className="text-xs text-gray-400">{isLocked ? 'YÊU CẦU NÂNG CẤP' : tool.shortDescription}</p>
    </div>
  </button>
);


const ToolsGrid: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const { plan } = useAuth(); // Lấy gói dịch vụ hiện tại

  // --- LOGIC KIỂM SOÁT QUYỀN TRUY CẬP (Dựa trên cấu trúc 2/3/8/10 công cụ đã chốt) ---
  const checkAccess = (toolName: string) => {
    if (plan === 'TOANTRI') return true; // Full access (10/10)

    const baseTools = ["VIẾT KỊCH BẢN", "SEO YOUTUBE"];
    const archiveTools = ["PHÂN TÍCH ĐỐI THỦ"]; // 3/10
    const magistrateTools = ["TÌM KÊNH ẨN", "VIẾT LẠI KỊCH BẢN", "TẠO ẢNH", "TEXT-TO-SPEECH", "TÌM MICRO NICHES"]; // 8/10

    if (baseTools.includes(toolName)) {
        return true; // EXPLORER (2/10)
    }
    
    if (plan === 'ARCHIVE') {
        return toolName === 'PHÂN TÍCH ĐỐI THỦ';
    }

    if (plan === 'MAGISTRATE') {
        return magistrateTools.includes(toolName);
    }
    
    // Các công cụ độc quyền của TOÀN TRI
    if (toolName === 'NARRATIVE STUDIO' || toolName === 'TẠO VIDEO (Veo 3)') {
        return false; 
    }

    // Mặc định, nếu không phải Toàn Tri và là công cụ cao cấp, trả về false
    return false;
  };
  // --- HẾT LOGIC KIỂM SOÁT QUYỀN TRUY CẬP ---


  const handleToolSelect = (tool: Tool) => {
    if (!plan || !checkAccess(tool.name)) {
        const requiredPlan = tool.name === 'PHÂN TÍCH ĐỐI THỦ' ? 'ARCHIVE' : 
                             tool.name === 'NARRATIVE STUDIO' || tool.name === 'TẠO VIDEO (Veo 3)' ? 'TOÀN TRI' : 'MAGISTRATE';
        alert(`Công cụ "${tool.name}" yêu cầu nâng cấp lên gói ${requiredPlan} để mở khóa!`);
        return;
    }
    
    if (selectedTool?.name === tool.name) {
      setSelectedTool(null);
    } else {
      setSelectedTool(tool);
    }
  };

  const toolsLeft = tools.slice(0, 5);
  const toolsRight = tools.slice(5, 10);
  const isToolSelected = selectedTool !== null;

  return (
    <section id="tools" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl text-center font-playfair text-[#CDAD5A] mb-4">Bảng Điều Khiển Tối Thượng</h2>
        <p className="text-xl text-center text-gray-400 mb-12">10 Công Cụ Quyền Năng</p>
        
        <div className={`grid gap-8 transition-all duration-500 ${isToolSelected ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Left Column */}
          <div className={`flex-col gap-4 ${isToolSelected ? 'hidden' : 'flex'}`}>
            {toolsLeft.map(tool => (
              <ToolButton 
                key={tool.name} 
                tool={tool}
                align="left"
                isLocked={!checkAccess(tool.name)}
                isSelected={selectedTool?.name === tool.name}
                onClick={() => handleToolSelect(tool)} 
              />
            ))}
          </div>

          {/* Center Console */}
          <div className={`p-1 border border-[#CDAD5A]/30 bg-black/50 relative overflow-hidden console-bg min-h-[40rem] transition-all duration-500 ${isToolSelected ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
            {!selectedTool ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-32 h-32 border-2 border-[#008080] artifact flex items-center justify-center">
                    <div className="w-16 h-16 border border-[#CDAD5A] artifact" style={{animationDelay: '-4s'}}></div>
                </div>
                <p className="mt-8 text-lg font-semibold text-[#CDAD5A] tracking-widest">CHỌN MỘT BÍ PHÁP ĐỂ KHAI ẤN</p>
              </div>
            ) : (
              <>
                {selectedTool.name === 'VIẾT KỊCH BẢN' ? (
                  <ScriptwriterTool 
                    tools={tools}
                    onToolSelect={handleToolSelect}
                    onBack={() => setSelectedTool(null)}
                  />
                ) : selectedTool.name === 'SEO YOUTUBE' ? (
                  <SeoTool 
                    onBack={() => setSelectedTool(null)}
                  />
                ) : selectedTool.name === 'PHÂN TÍCH ĐỐI THỦ' ? (
                  <RivalScannerTool
                    tools={tools}
                    onToolSelect={handleToolSelect}
                    onBack={() => setSelectedTool(null)}
                  />
                ) : selectedTool.name === 'TÌM KÊNH ẨN' ? (
                  <HiddenChannelFinderTool
                    tools={tools}
                    onToolSelect={handleToolSelect}
                    onBack={() => setSelectedTool(null)}
                  />
                ) : selectedTool.name === 'VIẾT LẠI KỊCH BẢN' ? (
                  <ScriptRefinerTool
                    onBack={() => setSelectedTool(null)}
                  />
                ) : selectedTool.name === 'TÌM MICRO NICHES' ? (
                  <MicroNicheMinerTool
                    onBack={() => setSelectedTool(null)}
                    tools={tools}
                    onToolSelect={handleToolSelect}
                  />
                ) : selectedTool.name === 'TẠO ẢNH' ? (
                  <ImageForgeTool
                    onBack={() => setSelectedTool(null)}
                  />
                ) : selectedTool.name === 'NARRATIVE STUDIO' ? (
                  <StoryStudioTool
                    onBack={() => setSelectedTool(null)}
                  />
                ) : selectedTool.name === 'TEXT-TO-SPEECH' ? (
                  <TextToSpeechTool
                    onBack={() => setSelectedTool(null)}
                  />
                ) : selectedTool.name === 'TẠO VIDEO (Veo 3)' ? (
                  <VeocityTool
                    onBack={() => setSelectedTool(null)}
                  />
                ) : (
                  <div className="fade-in-content flex flex-col h-full p-8">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                          <div className="h-16 w-16 text-[#CDAD5A]">
                            <selectedTool.icon />
                          </div>
                          <h3 className="text-3xl font-playfair text-[#CDAD5A]">{selectedTool.name}</h3>
                      </div>
                      <button onClick={() => setSelectedTool(null)} className="text-gray-400 hover:text-white">&times; Trở Về</button>
                    </div>
                    <p className="text-gray-300 flex-grow">{selectedTool.longDescription}</p>
                    <div className="mt-auto">
                        <textarea 
                            placeholder="Chức năng đang được nâng cấp..." 
                            className="w-full h-20 p-3 bg-black/50 border border-gray-700/50 rounded-sm focus:outline-none focus:border-[#CDAD5A] text-gray-200 transition-colors"
                            disabled
                        />
                        <button className="w-full mt-4 bg-gray-600 text-white font-bold py-3 px-5 border-2 border-gray-600 rounded-sm cursor-not-allowed">
                            KHAI HỎA
                        </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column */}
          <div className={`flex-col gap-4 ${isToolSelected ? 'hidden' : 'flex'}`}>
            {toolsRight.map(tool => (
              <ToolButton 
                key={tool.name}
                tool={tool}
                align="right"
                isLocked={!checkAccess(tool.name)}
                isSelected={selectedTool?.name === tool.name}
                onClick={() => handleToolSelect(tool)} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsGrid;
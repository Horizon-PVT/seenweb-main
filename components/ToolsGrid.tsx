import React, { useState } from 'react';
import {
  PyramidIcon, PhiIcon, BinocularsIcon, PortalIcon, HourglassIcon,
  GearIcon, CubeIcon, CompassIcon, BookIcon, MicrophoneIcon
} from './AnimatedIcons'; // Giả sử tồn tại file AnimatedIcons.tsx
import ScriptwriterTool from './ScriptwriterTool'; // Giả sử tồn tại
import SeoTool from './SeoTool'; // Giả sử tồn tại
import { RivalScannerTool } from './RivalScannerTool'; // Giả sử tồn tại
import HiddenChannelFinderTool from '@/components/HiddenChannelFinderTool'; // Giả sử tồn tại
import ScriptRefinerTool from './ScriptRefinerTool'; // Giả sử tồn tại
import { MicroNicheMinerTool } from './MicroNicheMinerTool'; // Giả sử tồn tại
import ImageForgeTool from './ImageForgeTool'; // Giả sử tồn tại
import StoryStudioTool from './StoryStudioTool'; // Giả sử tồn tại
import TextToSpeechTool from './TextToSpeechTool'; // Giả sử tồn tại
import VeocityTool from './VeocityTool'; // Giả sử tồn tại
import { useSession } from 'next-auth/react';

// --- INTERFACE (Từ 1.txt) ---
export interface Tool {
  id?: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
}

// --- DATA CÁC CÔNG CỤ (Từ 1.txt) ---
const tools: Tool[] = [
  { name: "VIẾT KỊCH BẢN", shortDescription: "Tạo cấu trúc kịch bản video.", longDescription: "Kiến tạo những câu chuyện lôi cuốn...", icon: PyramidIcon, bgColor: "#3C334D" },
  { name: "SEO YOUTUBE", shortDescription: "Tối ưu hóa tiêu đề, mô tả và tag.", longDescription: "Giải mã Ma Trận YouTube...", icon: PhiIcon, bgColor: "#003366" },
  { name: "PHÂN TÍCH ĐỐI THỦ", shortDescription: "Lỗ hổng và chiến lược đối thủ.", longDescription: "Chiếu rọi mọi điểm yếu và chiến lược...", icon: BinocularsIcon, bgColor: "#660000" },
  { name: "TÌM KÊNH ẨN", shortDescription: "Khám phá xu hướng bí mật.", longDescription: "Du hành vào những vùng đất chưa được khám phá...", icon: PortalIcon, bgColor: "#663300" },
  { name: "VIẾT LẠI KỊCH BẢN", shortDescription: "Hiệu chỉnh và tái cấu trúc nội dung.", longDescription: "Thuật toán Alkhemy sẽ biến những kịch bản cũ...", icon: HourglassIcon, bgColor: "#336633" },
  { name: "TÌM MICRO NICHES", shortDescription: "Khai thác phân khúc vàng.", longDescription: "Sử dụng la bàn AI để định vị những thị trường...", icon: CompassIcon, bgColor: "#666600" },
  { name: "TẠO ẢNH", shortDescription: "Chuyển đổi ý tưởng thành hình ảnh.", longDescription: "Chuyển hóa ngôn từ thành nghệ thuật thị giác...", icon: CubeIcon, bgColor: "#4C4C4C" },
  { name: "NARRATIVE STUDIO", shortDescription: "Biến Text thành Sách Ảnh & Sách tô màu.", longDescription: "Biến Text thành sản phẩm Kể chuyện bằng Hình ảnh...", icon: BookIcon, bgColor: "#66334C" },
  { name: "TEXT-TO-SPEECH", shortDescription: "Chuyển văn bản thành giọng nói chuyên nghiệp.", longDescription: "Thổi hồn vào từng con chữ...", icon: MicrophoneIcon, bgColor: "#006666" },
  { name: "TẠO VIDEO (Veo 3)", shortDescription: "Dựng video tự động từ nội dung đầu vào.", longDescription: "Đỉnh cao của sáng tạo...", icon: GearIcon, bgColor: "rgba(10,10,10,0.8)" },
];

// --- CÁC HẰNG SỐ VÀ HÀM THAY THẾ (FIX LỖI ROLES IS NOT DEFINED) ---
// Định nghĩa lại ROLES (Từ 2.txt và logic của bạn)
const ROLES = {
    FREE: 'FREE',
    ARCHIVE: 'ARCHIVE',
    MAGISTRATE: 'MAGISTRATE',
    TOANTRI: 'TOANTRI',
};

// Hàm giả lập canAccessTool (Tích hợp logic từ 1.txt và hình ảnh gói cước)
const canAccessTool = (toolName: string, userPlan: string) => {
    // TOANTRI (10/10)
    if (userPlan === ROLES.TOANTRI) return true; 

    // Các cấp công cụ dựa trên mô tả gói:
    const baseTools = ["VIẾT KỊCH BẢN", "SEO YOUTUBE"]; // FREE
    const archiveTools = ["PHÂN TÍCH ĐỐI THỦ"]; // ARCHIVE (Mở khóa thêm tool này)
    const magistrateTools = ["TÌM KÊNH ẨN", "VIẾT LẠI KỊCH BẢN", "TẠO ẢNH", "TEXT-TO-SPEECH", "TÌM MICRO NICHES"]; // MAGISTRATE (Mở khóa thêm các tool này)
    
    if (baseTools.includes(toolName)) return true; 
    // ARCHIVE (hoặc cao hơn) mở khóa Phân tích đối thủ
    if (archiveTools.includes(toolName) && (userPlan === ROLES.ARCHIVE || userPlan === ROLES.MAGISTRATE || userPlan === ROLES.TOANTRI)) return true;
    // MAGISTRATE (hoặc cao hơn) mở khóa 5 tool còn lại
    if (magistrateTools.includes(toolName) && (userPlan === ROLES.MAGISTRATE || userPlan === ROLES.TOANTRI)) return true;
    
    return false; // Locked
};

// Hàm giả lập getDailyLimit (theo logic 2.txt và hình ảnh gói cước 7281b6.jpg)
const getDailyLimit = (userPlan: string) => {
    if (userPlan === ROLES.FREE) return 2; // FREE: Giới hạn 2 lần tạo/ngày
    // Các gói trả phí còn lại: Không giới hạn lần tạo/ngày
    if (userPlan === ROLES.ARCHIVE || userPlan === ROLES.MAGISTRATE || userPlan === ROLES.TOANTRI) return 99999;
    return 0;
};

// ToolButton Component (Giữ nguyên bố cục từ 1.txt)
const ToolButton: React.FC<{ tool: Tool; onClick: () => void; isSelected: boolean, align: 'left' | 'right', isLocked: boolean }> = ({ tool, onClick, isSelected, align, isLocked }) => (
  <button 
    onClick={onClick}
    disabled={isLocked}
    className={`group w-full p-4 border border-gray-800/50 bg-black/30 backdrop-blur-sm flex items-center gap-4 transition-all duration-300 ${align === 'left' ? 'hover:-translate-x-1' : 'hover:translate-x-1'} ${isSelected ? 'border-[#008080] emerald-glow' : 'hover:bg-gray-900/40'} ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:border-[#008080]/80'}`}
  >
    <div className={`h-10 w-10 flex-shrink-0 flex items-center justify-center text-[#008080] transition-colors duration-300 ${isLocked ? 'text-gray-600' : isSelected ? 'text-[#CDAD5A]' : 'group-hover:text-[#CDAD5A]'}`}>
      {isLocked ? '🔒' : <tool.icon className="w-full h-full" />}
    </div>
    <div className={`text-left ${align === 'right' && 'text-right'}`}>
      <h3 className={`font-semibold ${isLocked ? 'text-gray-500' : isSelected ? 'text-[#CDAD5A]' : 'text-white'}`}>{tool.name}</h3>
      <p className="text-xs text-gray-400">{isLocked ? 'YÊU CẦU NÂNG CẤP' : tool.shortDescription}</p>
    </div>
  </button>
);

// ErrorFallback Component (Giữ nguyên từ 1.txt)
const ErrorFallback = ({ error, children }: { error?: Error; children: React.ReactNode }) => {
  if (error) {
    return (
      <div className="p-4 bg-red-900/50 border border-red-500 rounded text-red-300">
        <h3>Lỗi render tool: {error.message}</h3>
        <p>Kiểm tra import/export. Reload để thử lại.</p>
      </div>
    );
  }
  return <>{children}</>;
};

// --- MAIN COMPONENT ---
const ToolsGrid: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const { data: session } = useSession(); 
  // SỬA LỖI: Sử dụng ROLES.FREE đã định nghĩa ở trên
  const userRole = (session?.user as any)?.role || ROLES.FREE; 
  const [todayUsage, setTodayUsage] = useState(0); // Giả lập usage theo yêu cầu 2.txt

  // --- XỬ LÝ SỰ KIỆN CHỌN CÔNG CỤ (Tích hợp check limit theo 2.txt) ---
  const handleToolSelect = (tool: Tool) => {
    // 1. Kiểm tra quyền truy cập (Dùng canAccessTool)
    if (!canAccessTool(tool.name, userRole)) {
      let requiredRole = ROLES.TOANTRI; // Mặc định cho 2 tool cao nhất
      if (tool.name === "PHÂN TÍCH ĐỐI THỦ") {
        requiredRole = ROLES.ARCHIVE; 
      } else if (["TÌM KÊNH ẨN", "VIẾT LẠI KỊCH BẢN", "TẠO ẢNH", "TEXT-TO-SPEECH", "TÌM MICRO NICHES"].includes(tool.name)) {
        requiredRole = ROLES.MAGISTRATE; 
      }
      
      alert(`Công cụ "${tool.name}" yêu cầu nâng cấp lên gói ${requiredRole} để mở khóa!`);
      return;
    }
    
    // 2. Kiểm tra giới hạn sử dụng (Theo yêu cầu từ 2.txt)
    if (todayUsage >= getDailyLimit(userRole)) {
        alert('Bạn đã đạt giới hạn sử dụng hôm nay! Nâng cấp để dùng không giới hạn.');
        return;
    }

    // 3. Chọn/Bỏ chọn công cụ
    if (selectedTool?.name === tool.name) {
      setSelectedTool(null);
    } else {
      setSelectedTool(tool);
    }
  };

  // --- PHÂN CHIA CỘT (Giữ nguyên bố cục 5-5 từ 1.txt) ---
  const toolsLeft = tools.slice(0, 5);
  const toolsRight = tools.slice(5, 10);
  const isToolSelected = selectedTool !== null;

  return (
    <section id="tools" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl text-center font-playfair text-[#CDAD5A] mb-4">Bảng Điều Khiển Tối Thượng</h2>
        <p className="text-xl text-center text-gray-400 mb-12">10 Công Cụ Quyền Năng</p>
        
        {/* Lưới bố cục 5-2-3 khi chưa chọn tool (Từ 1.txt) */}
        <div className={`grid gap-8 transition-all duration-500 ${isToolSelected ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          
          {/* Left Column (5 tools) - Từ 1.txt */}
          <div className={`flex-col gap-4 ${isToolSelected ? 'hidden' : 'flex'}`}>
            {toolsLeft.map(tool => (
              <ToolButton 
                key={tool.name} 
                tool={tool}
                align="left"
                // Dùng canAccessTool
                isLocked={!canAccessTool(tool.name, userRole)}
                isSelected={selectedTool?.name === tool.name}
                onClick={() => handleToolSelect(tool)} 
              />
            ))}
          </div>

          {/* Center Console (Từ 1.txt) */}
          <div className={`p-1 border border-[#CDAD5A]/30 bg-black/50 relative overflow-hidden console-bg min-h-[40rem] transition-all duration-500 ${isToolSelected ? 'lg:col-span-4' : 'lg:col-span-2'}`}>
            {!selectedTool ? (
              // Trạng thái chưa chọn tool (Từ 1.txt)
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-32 h-32 border-2 border-[#008080] artifact flex items-center justify-center">
                    <div className="w-16 h-16 border border-[#CDAD5A] artifact" style={{animationDelay: '-4s'}}></div>
                </div>
                <p className="mt-8 text-lg font-semibold text-[#CDAD5A] tracking-widest">CHỌN MỘT BÍ PHÁP ĐỂ KHAI ẤN</p>
              </div>
            ) : (
              // Trạng thái đã chọn tool
              <ErrorFallback>
                {/* Switch Render cho Tool đã chọn (Từ 1.txt) */}
                {selectedTool.name === 'VIẾT KỊCH BẢN' ? (
                  <ScriptwriterTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'SEO YOUTUBE' ? (
                  <SeoTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'PHÂN TÍCH ĐỐI THỦ' ? (
                  <RivalScannerTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'TÌM KÊNH ẨN' ? (
                  <HiddenChannelFinderTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'VIẾT LẠI KỊCH BẢN' ? (
                  <ScriptRefinerTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'TÌM MICRO NICHES' ? (
                  <MicroNicheMinerTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'TẠO ẢNH' ? (
                  <ImageForgeTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'NARRATIVE STUDIO' ? (
                  <StoryStudioTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'TEXT-TO-SPEECH' ? (
                  <TextToSpeechTool onBack={() => setSelectedTool(null)} />
                ) : selectedTool.name === 'TẠO VIDEO (Veo 3)' ? (
                  <VeocityTool onBack={() => setSelectedTool(null)} />
                ) : (
                  // Giao diện Placeholder (Từ 1.txt)
                  <div className="fade-in-content flex flex-col h-full p-8">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                          <div className="h-16 w-16 text-[#CDAD5A]">
                              <selectedTool.icon className="w-full h-full" />
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
              </ErrorFallback>
            )}
          </div>

          {/* Right Column (5 tools) - Từ 1.txt */}
          <div className={`flex-col gap-4 ${isToolSelected ? 'hidden' : 'flex'}`}>
            {toolsRight.map(tool => (
              <ToolButton 
                key={tool.name}
                tool={tool}
                align="right"
                // Dùng canAccessTool
                isLocked={!canAccessTool(tool.name, userRole)}
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
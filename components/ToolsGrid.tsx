import React, { useState } from 'react';
import {
  PyramidIcon, PhiIcon, BinocularsIcon, PortalIcon, HourglassIcon,
  GearIcon, CubeIcon, CompassIcon, BookIcon, MicrophoneIcon
} from './AnimatedIcons';
import ScriptwriterTool from './ScriptwriterTool';
import SeoTool from './SeoTool';
import { RivalScannerTool } from './RivalScannerTool';
import HiddenChannelFinderTool from '@/components/HiddenChannelFinderTool';
import ScriptRefinerTool from './ScriptRefinerTool';
import { MicroNicheMinerTool } from './MicroNicheMinerTool';
import ImageForgeTool from './ImageForgeTool';
import StoryStudioTool from './StoryStudioTool';
import TextToSpeechTool from './TextToSpeechTool';
import VeocityTool from './VeocityTool';
import { useSession } from 'next-auth/react';
import { canAccessTool, type Role } from '@/lib/roles';

export interface Tool {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const toolsLeft: Tool[] = [
  { id: 'scriptwriter', name: 'Viết kịch bản YouTube', shortDescription: 'Tạo cấu trúc kịch bản video.', icon: PyramidIcon, component: ScriptwriterTool },
  { id: 'seo', name: 'SEO YouTube tối ưu', shortDescription: 'Tối ưu hóa tiêu đề, mô tả và tag.', icon: PhiIcon, component: SeoTool },
  { id: 'rival-scanner', name: 'Phân tích đối thủ (độc quyền)', shortDescription: 'Phân tích kênh đối thủ chi tiết.', icon: BinocularsIcon, component: RivalScannerTool },
  { id: 'hidden-channel-finder', name: 'Tìm kênh ẩn (độc quyền)', shortDescription: 'Khám phá kênh ngách tiềm năng.', icon: PortalIcon, component: HiddenChannelFinderTool },
  { id: 'script-refiner', name: 'Viết lại kịch bản nâng cao', shortDescription: 'Tinh chỉnh và nâng cấp kịch bản.', icon: HourglassIcon, component: ScriptRefinerTool },
];

const toolsRight: Tool[] = [
  { id: 'micro-niche-miner', name: 'Tìm Micro Niches (độc quyền)', shortDescription: 'Khám phá ngách siêu nhỏ tiềm năng.', icon: GearIcon, component: MicroNicheMinerTool },
  { id: 'image-forge', name: 'Tạo Thumbnail AI', shortDescription: 'Tạo thumbnail chuyên nghiệp.', icon: CubeIcon, component: ImageForgeTool },
  { id: 'narrative-studio', name: 'Narrative Studio (độc quyền)', shortDescription: 'Tạo nội dung kể chuyện kiếm tiền KDP.', icon: CompassIcon, component: StoryStudioTool },
  { id: 'text-to-speech', name: 'Text-to-Speech Google Cloud', shortDescription: 'Chuyển văn bản thành giọng nói tự nhiên.', icon: BookIcon, component: TextToSpeechTool },
  { id: 'velocity', name: 'Tạo Video (Velocity Tool)', shortDescription: 'Tạo video tự động từ kịch bản.', icon: MicrophoneIcon, component: VeocityTool },
];

// Danh sách ID tools độc quyền để thêm badge HOT
const exclusiveToolIds = ['rival-scanner', 'hidden-channel-finder', 'micro-niche-miner', 'narrative-studio'];

const ToolButton: React.FC<{
  tool: Tool;
  align: 'left' | 'right';
  isLocked: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ tool, align, isLocked, isSelected, onClick }) => {
  const Icon = tool.icon;
  const isExclusive = exclusiveToolIds.includes(tool.id);

  return (
    <div
      className={`relative group transition-all duration-300 ${isSelected ? 'scale-105 z-10' : 'hover:scale-105'} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={isLocked ? undefined : onClick}
    >
      <div className={`bg-gradient-to-br from-gray-900 to-black p-4 rounded-xl border-2 ${isSelected ? 'border-[#CDAD5A]' : 'border-gray-800 group-hover:border-[#CDAD5A]/60'} shadow-xl group-hover:shadow-[#CDAD5A]/50 transition-all ${align === 'right' ? 'ml-auto' : ''} max-w-md`}>
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            <Icon className="w-6 h-6 text-[#CDAD5A]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">{tool.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{tool.shortDescription}</p>
          </div>
        </div>

        {/* Badge HOT cho tools độc quyền */}
        {isExclusive && (
          <div className="absolute -top-3 -right-3">
            <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-red-600">
              HOT
            </span>
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <svg className="w-10 h-10 text-yellow-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-yellow-400 font-bold text-sm">YÊU CẦU NÂNG CẤP</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolsGrid: React.FC = () => {
  const { data: session } = useSession();
  const userRole = (session?.user?.role || 'FREE') as Role;

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const handleToolSelect = (tool: Tool) => {
    if (!canAccessTool(tool.id, userRole)) return;
    setSelectedTool(tool);
  };

  const handleBack = () => {
    setSelectedTool(null);
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black text-center mb-4 text-[#CDAD5A] uppercase tracking-wider">
          BẢNG CÔNG CỤ SEENYT 
        </h1>
        <p className="text-center text-gray-400 mb-16 text-xl"> Nền tảng công nghệ hỗ trợ Youtube /Youtuber tốt nhất 2025 theo bình chọn của cộng đồng sáng tạo số Châu Á</p>

        {selectedTool ? (
          <div className="max-w-5xl mx-auto">
            <button
              onClick={handleBack}
              className="mb-8 text-[#CDAD5A] hover:text-yellow-400 flex items-center gap-2 text-lg font-bold"
            >
              ← Quay lại bảng điều khiển
            </button>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-[#CDAD5A]/40 shadow-2xl p-10">
              <h2 className="text-3xl font-black text-[#CDAD5A] mb-8 text-center">{selectedTool.name}</h2>
              <selectedTool.component />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center"> {/* items-center để cân bằng chiều cao */}
            {/* Left Column */}
            <div className="flex flex-col gap-8 justify-center">
              {toolsLeft.map(tool => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  align="left"
                  isLocked={!canAccessTool(tool.id, userRole)}
                  isSelected={selectedTool?.id === tool.id}
                  onClick={() => handleToolSelect(tool)}
                />
              ))}
            </div>

            {/* Center - Card với biểu tượng xoay + CTA */}
            <div className="flex justify-center -mt-12"> {/* Nâng lên cao hơn */}
              <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-md rounded-3xl border-4 border-[#CDAD5A]/30 shadow-2xl shadow-[#CDAD5A]/40 p-12 text-center">
                <div className="w-64 h-64 mx-auto mb-8 animate-spin-slow">
                  <svg className="w-full h-full text-[#CDAD5A]" viewBox="0 0 200 200">
                    <path fill="currentColor" d="M100,10 L190,60 L190,140 L100,190 L10,140 L10,60 Z" opacity="0.3"/>
                    <path fill="currentColor" d="M100,50 L150,80 L150,120 L100,150 L50,120 L50,80 Z"/>
                  </svg>
                </div>
                <p className="text-4xl font-black text-[#CDAD5A] uppercase tracking-wider">
                  BẮT ĐẦU NGAY HÔM NAY!
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8 justify-center">
              {toolsRight.map(tool => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  align="right"
                  isLocked={!canAccessTool(tool.id, userRole)}
                  isSelected={selectedTool?.id === tool.id}
                  onClick={() => handleToolSelect(tool)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToolsGrid;
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
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const toolsLeft: Tool[] = [
  {
    id: 'scriptwriter',
    name: 'Viết kịch bản YouTube',
    shortDescription: 'Tạo cấu trúc kịch bản video.',
    longDescription: 'AI tạo hook viral, outline chi tiết và script đầy đủ chỉ 30 giây. Hỗ trợ đa ngôn ngữ, tối ưu retention.',
    features: ['Hook viral tự động', 'Outline chuẩn', 'Script tùy chỉnh độ dài', 'Tối ưu pacing'],
    icon: PyramidIcon,
    component: ScriptwriterTool
  },
  {
    id: 'seo',
    name: 'SEO YouTube tối ưu',
    shortDescription: 'Tối ưu tiêu đề, mô tả và tag.',
    longDescription: 'Phân tích từ khóa realtime, gợi ý title/description/tag tăng impression 200-300%.',
    features: ['Tìm từ khóa volume cao', 'Title click rate cao', 'Template description', 'Tag competitor'],
    icon: PhiIcon,
    component: SeoTool
  },
  {
    id: 'rival-scanner',
    name: 'Phân tích đối thủ (độc quyền)',
    shortDescription: 'Phân tích kênh đối thủ chi tiết.',
    longDescription: 'Quét dữ liệu kênh đối thủ: video viral, retention curve, thumbnail thành công.',
    features: ['Phân tích 100 video mới nhất', 'Xem retention curve', 'Extract title/tag', 'So sánh với kênh bạn'],
    icon: BinocularsIcon,
    component: RivalScannerTool
  },
  {
    id: 'hidden-channel-finder',
    name: 'Tìm kênh ẩn (độc quyền)',
    shortDescription: 'Khám phá kênh ngách tiềm năng.',
    longDescription: 'Tìm kênh view cao nhưng sub thấp – ngách vàng để chiếm lĩnh nhanh.',
    features: ['Filter view >100k/tháng sub <10k', 'Theo ngách/quốc gia', 'Export ý tưởng content', 'Realtime update'],
    icon: PortalIcon,
    component: HiddenChannelFinderTool
  },
  {
    id: 'script-refiner',
    name: 'Viết lại kịch bản nâng cao',
    shortDescription: 'Tinh chỉnh và nâng cấp kịch bản.',
    longDescription: 'Nâng cấp script cũ: thêm hook, cắt pacing chậm, tăng retention.',
    features: ['Phân tích script cũ', 'Gợi ý cải thiện', 'Rewrite 3 phiên bản', 'A/B test idea'],
    icon: HourglassIcon,
    component: ScriptRefinerTool
  },
];

const toolsRight: Tool[] = [
  {
    id: 'micro-niche-miner',
    name: 'Tìm Micro Niches (độc quyền)',
    shortDescription: 'Khám phá ngách siêu nhỏ tiềm năng.',
    longDescription: 'Tìm micro-niche cạnh tranh gần 0, volume ổn định – lý tưởng kiếm tiền nhanh.',
    features: ['Volume >5000/tháng', 'Cạnh tranh <20', '50 ý tưởng video', 'Dự báo CPM'],
    icon: GearIcon,
    component: MicroNicheMinerTool
  },
  {
    id: 'image-forge',
    name: 'Tạo Thumbnail AI',
    shortDescription: 'Tạo thumbnail chuyên nghiệp.',
    longDescription: 'AI tạo thumbnail viral theo trend, face swap, text overlay.',
    features: ['Từ text mô tả', 'Style MrBeast/Ali Abdaal', 'A/B test 5 phiên bản', 'Export 4K'],
    icon: CubeIcon,
    component: ImageForgeTool
  },
  {
    id: 'narrative-studio',
    name: 'Narrative Studio (độc quyền)',
    shortDescription: 'Tạo nội dung kể chuyện kiếm tiền KDP.',
    longDescription: 'Tạo story dài faceless (reddit, horror, motivation).',
    features: ['Script 10-20 phút', 'Voice synthetic', 'Gợi ý visual', 'Export ready'],
    icon: CompassIcon,
    component: StoryStudioTool
  },
  {
    id: 'text-to-speech',
    name: 'Text-to-Speech Google Cloud',
    shortDescription: 'Chuyển văn bản thành giọng nói tự nhiên.',
    longDescription: 'Voice AI chất lượng cao, tiếng Việt chuẩn miền Bắc/Nam.',
    features: ['100+ giọng', 'Tùy chỉnh cảm xúc', 'Export MP3/WAV', 'Tích hợp script'],
    icon: BookIcon,
    component: TextToSpeechTool
  },
  {
    id: 'velocity',
    name: 'Tạo Video (Velocity Tool)',
    shortDescription: 'Tạo video tự động từ kịch bản.',
    longDescription: 'Tự động hóa faceless video: stock footage, subtitle, effect, music.',
    features: ['Video 10-15 phút từ script', 'Auto subtitle', 'B-roll thông minh', 'Export 4K'],
    icon: MicrophoneIcon,
    component: VeocityTool
  },
];

const exclusiveToolIds = ['rival-scanner', 'hidden-channel-finder', 'micro-niche-miner', 'narrative-studio'];

const ToolCard: React.FC<{
  tool: Tool;
  isLocked: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenTool: () => void;
}> = ({ tool, isLocked, isExpanded, onToggleExpand, onOpenTool }) => {
  const Icon = tool.icon;
  const isExclusive = exclusiveToolIds.includes(tool.id);

  return (
    <div
      className={`relative bg-gradient-to-br from-gray-900 to-black rounded-xl border-2 ${isLocked ? 'border-yellow-600/50 opacity-80' : 'border-gray-800 hover:border-[#CDAD5A]/60'} transition-all duration-300 group shadow-xl hover:shadow-[#CDAD5A]/40 w-full ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={isLocked ? undefined : onToggleExpand}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
          <Icon className="w-8 h-8 text-[#CDAD5A]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{tool.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{tool.shortDescription}</p>
        </div>
      </div>

      {/* Accordion mở chi tiết */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-700">
          <p className="text-gray-300 text-sm mb-3">{tool.longDescription}</p>
          <ul className="space-y-1 mb-4 text-sm text-gray-400">
            {tool.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-[#CDAD5A]">✓</span> {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTool();
            }}
            className="bg-[#008080] text-white font-bold py-2 px-5 rounded text-sm hover:bg-[#008080]/80 transition"
          >
            Sử dụng ngay
          </button>
        </div>
      )}

      {isExclusive && (
        <div className="absolute -top-2 -right-2">
          <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full shadow-lg">
            HOT
          </span>
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
          <p className="text-yellow-400 font-bold text-sm">YÊU CẦU NÂNG CẤP</p>
        </div>
      )}
    </div>
  );
};

const ToolsGrid: React.FC = () => {
  const { data: session } = useSession();
  const userRole = (session?.user?.role || 'FREE') as Role;

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const handleOpenTool = (tool: Tool) => {
    if (!canAccessTool(tool.id, userRole)) return;
    setSelectedTool(tool);
  };

  const handleToggleExpand = (toolId: string) => {
    setExpandedToolId(expandedToolId === toolId ? null : toolId);
  };

  const handleBack = () => setSelectedTool(null);

  return (
    <section className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-center mb-4 text-[#CDAD5A] uppercase tracking-wider">
          BẢNG CÔNG CỤ SEENYT
        </h2>
        <p className="text-center text-gray-400 mb-16 text-xl">
          Nền tảng công nghệ hỗ trợ Youtube/Youtuber tốt nhất 2025 theo bình chọn của cộng đồng sáng tạo số Châu Á
        </p>

        {selectedTool ? (
          <div className="max-w-5xl mx-auto">
            <button onClick={handleBack} className="mb-8 text-[#CDAD5A] hover:text-yellow-400 flex items-center gap-2 text-lg font-bold">
              ← Quay lại bảng điều khiển
            </button>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-[#CDAD5A]/40 shadow-2xl p-10">
              <h2 className="text-3xl font-black text-[#CDAD5A] mb-8 text-center">{selectedTool.name}</h2>
              <selectedTool.component />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="flex flex-col gap-6">
              {toolsLeft.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isLocked={!canAccessTool(tool.id, userRole)}
                  isExpanded={expandedToolId === tool.id}
                  onToggleExpand={() => handleToggleExpand(tool.id)}
                  onOpenTool={() => handleOpenTool(tool)}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-md rounded-3xl border-4 border-[#CDAD5A]/30 shadow-2xl shadow-[#CDAD5A]/40 p-12 text-center w-full max-w-md">
                <div className="w-64 h-64 mx-auto mb-8 animate-spin-slow">
                  <svg className="w-full h-full text-[#CDAD5A]" viewBox="0 0 200 200">
                    <path fill="currentColor" d="M100,10 L190,60 L190,140 L100,190 L10,140 L10,60 Z" opacity="0.3"/>
                    <path fill="currentColor" d="M100,50 L150,80 L150,120 L100,150 L50,120 L50,80 Z"/>
                  </svg>
                </div>
                <p className="text-4xl font-black text-[#CDAD5A] uppercase tracking-wider">
                  🎯 Bắt đầu bằng 1 video làm đúng cách
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {toolsRight.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isLocked={!canAccessTool(tool.id, userRole)}
                  isExpanded={expandedToolId === tool.id}
                  onToggleExpand={() => handleToggleExpand(tool.id)}
                  onOpenTool={() => handleOpenTool(tool)}
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
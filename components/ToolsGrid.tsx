import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  PyramidIcon,
  PhiIcon,
  BinocularsIcon,
  PortalIcon,
  HourglassIcon,
  GearIcon,
  CubeIcon,
  CompassIcon,
  BookIcon,
  MicrophoneIcon,
} from "./AnimatedIcons";

import ScriptwriterTool from "./ScriptwriterTool";
import SeoTool from "./SeoTool";
import { RivalScannerTool } from "./RivalScannerTool";
import HiddenChannelFinderTool from "@/components/HiddenChannelFinderTool";
import ScriptRefinerTool from "./ScriptRefinerTool";
import { MicroNicheMinerTool } from "./MicroNicheMinerTool";
import ImageForgeTool from "./ImageForgeTool";
import StoryStudioTool from "./StoryStudioTool";
import TextToSpeechTool from "./TextToSpeechTool";
import VeocityTool from "./VeocityTool";

import { useSession } from "next-auth/react";
import { canAccessTool, type Role } from "@/lib/roles";

export interface Tool {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

/* =========================
   TOOL CONFIG
========================= */

const toolsLeft: Tool[] = [
  {
    id: "scriptwriter",
    name: "Viết kịch bản YouTube",
    shortDescription: "Tạo cấu trúc kịch bản video.",
    longDescription: "AI tạo hook viral, outline chi tiết và script đầy đủ chỉ 30 giây.",
    features: ["Hook viral", "Outline chuẩn", "Script đầy đủ", "Tối ưu retention"],
    icon: PyramidIcon,
    component: ScriptwriterTool,
  },
  {
    id: "seo",
    name: "SEO YouTube tối ưu",
    shortDescription: "Tối ưu tiêu đề, mô tả và tag.",
    longDescription: "Phân tích từ khóa realtime, tăng impression mạnh.",
    features: ["Keyword volume", "Title CTR cao", "Description chuẩn SEO"],
    icon: PhiIcon,
    component: SeoTool,
  },
  {
    id: "rival-scanner",
    name: "Phân tích đối thủ (độc quyền)",
    shortDescription: "Quét dữ liệu kênh đối thủ.",
    longDescription: "Phân tích video viral, retention, thumbnail.",
    features: ["Retention curve", "Extract title/tag", "So sánh kênh"],
    icon: BinocularsIcon,
    component: RivalScannerTool,
  },
  {
    id: "hidden-channel-finder",
    name: "Tìm kênh ẩn (độc quyền)",
    shortDescription: "Khám phá kênh ngách tiềm năng.",
    longDescription: "View cao – sub thấp – cạnh tranh thấp.",
    features: ["Ngách vàng", "Filter thông minh", "Export data"],
    icon: PortalIcon,
    component: HiddenChannelFinderTool,
  },
  {
    id: "script-refiner",
    name: "Viết lại kịch bản nâng cao",
    shortDescription: "Tinh chỉnh và nâng cấp script.",
    longDescription: "Cải thiện hook, pacing, retention.",
    features: ["Rewrite", "Gợi ý cải thiện", "A/B test idea"],
    icon: HourglassIcon,
    component: ScriptRefinerTool,
  },
];

const toolsRight: Tool[] = [
  {
    id: "micro-niche-miner",
    name: "Tìm Micro Niches (độc quyền)",
    shortDescription: "Khám phá ngách siêu nhỏ.",
    longDescription: "Cạnh tranh thấp – CPM cao.",
    features: ["50 ý tưởng video", "Dự báo CPM"],
    icon: GearIcon,
    component: MicroNicheMinerTool,
  },
  {
    id: "image-forge",
    name: "Tạo Thumbnail AI",
    shortDescription: "SeenYT Vision – Tool flagship",
    longDescription: "AI tạo thumbnail chuyên nghiệp, đồng nhất nhân vật.",
    features: ["Character ref", "Face Lock", "Style reference", "A/B test"],
    icon: CubeIcon,
    component: ImageForgeTool,
  },
  {
    id: "narrative-studio",
    name: "Narrative Studio (độc quyền)",
    shortDescription: "Tạo nội dung kể chuyện.",
    longDescription: "Story faceless kiếm tiền KDP.",
    features: ["Script dài", "Voice AI", "Export ready"],
    icon: CompassIcon,
    component: StoryStudioTool,
  },
  {
    id: "text-to-speech",
    name: "Text-to-Speech Google Cloud",
    shortDescription: "Giọng đọc tự nhiên.",
    longDescription: "Voice AI cao cấp.",
    features: ["100+ giọng", "MP3/WAV"],
    icon: BookIcon,
    component: TextToSpeechTool,
  },
  {
    id: "velocity",
    name: "Tạo Video (Velocity Tool)",
    shortDescription: "Tạo video tự động.",
    longDescription: "Faceless video từ script.",
    features: ["Auto subtitle", "Export 4K"],
    icon: MicrophoneIcon,
    component: VeocityTool,
  },
];

const exclusiveToolIds = [
  "rival-scanner",
  "hidden-channel-finder",
  "micro-niche-miner",
  "narrative-studio",
];

/* =========================
   TOOL CARD
========================= */

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
      className={`relative bg-gradient-to-br from-gray-900 to-black rounded-xl border-2
      ${
        isLocked
          ? "border-yellow-600/40"
          : "border-gray-800 hover:border-[#CDAD5A]/60"
      }
      transition-all duration-300 shadow-xl cursor-pointer`}
      onClick={isLocked ? undefined : onToggleExpand}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
          <Icon className="w-8 h-8 text-[#CDAD5A]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{tool.name}</h3>
          <p className="text-sm text-gray-400">{tool.shortDescription}</p>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-700">
          <p className="text-gray-300 text-sm mb-3">{tool.longDescription}</p>
          <ul className="text-sm text-gray-400 mb-4 space-y-1">
            {tool.features.map((f, i) => (
              <li key={i}>✓ {f}</li>
            ))}
          </ul>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTool();
            }}
            className="bg-[#008080] hover:bg-[#008080]/80 text-white font-bold py-2 px-5 rounded"
          >
            Sử dụng ngay
          </button>
        </div>
      )}

      {isExclusive && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full">
          HOT
        </span>
      )}

      {isLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
          <span className="text-yellow-400 font-bold">YÊU CẦU NÂNG CẤP</span>
        </div>
      )}
    </div>
  );
};

/* =========================
   TOOLS GRID
========================= */

const ToolsGrid: React.FC = () => {
  const { data: session } = useSession();
  const userRole = (session?.user?.role || "FREE") as Role;
  const router = useRouter();

  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const handleOpenTool = (tool: Tool) => {
    if (!canAccessTool(tool.id, userRole)) return;

    // ✅ MỞ OVERLAY FULL PAGE CHO MỌI TOOL
    router.push(
      { pathname: router.pathname, query: { ...router.query, tool: tool.id } },
      undefined,
      { shallow: true }
    );
  };

  return (
    <section
  id="tools"
  className="min-h-screen scroll-mt-28 bg-gradient-to-b from-black via-gray-900 to-black py-16 px-4"
>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-center mb-4 text-[#CDAD5A] uppercase">
          BẢNG CÔNG CỤ SEENYT
        </h2>
        <p className="text-center text-gray-400 mb-16 text-xl">
          Nền tảng công nghệ hỗ trợ Youtube/Youtuber tốt nhất 2025 theo bình chọn
          của cộng đồng sáng tạo số Châu Á
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-6">
            {toolsLeft.map((t) => (
              <ToolCard
                key={t.id}
                tool={t}
                isLocked={!canAccessTool(t.id, userRole)}
                isExpanded={expandedToolId === t.id}
                onToggleExpand={() =>
                  setExpandedToolId(expandedToolId === t.id ? null : t.id)
                }
                onOpenTool={() => handleOpenTool(t)}
              />
            ))}
          </div>

          <div className="flex justify-center items-center">
            <div className="bg-black/50 border border-[#CDAD5A]/30 rounded-3xl p-10 text-center">
              <p className="text-3xl font-black text-[#CDAD5A]">
                🎯 BẮT ĐẦU BẰNG 1 VIDEO
                <br />
                LÀM ĐÚNG CÁCH
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {toolsRight.map((t) => (
              <ToolCard
                key={t.id}
                tool={t}
                isLocked={!canAccessTool(t.id, userRole)}
                isExpanded={expandedToolId === t.id}
                onToggleExpand={() =>
                  setExpandedToolId(expandedToolId === t.id ? null : t.id)
                }
                onOpenTool={() => handleOpenTool(t)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsGrid;

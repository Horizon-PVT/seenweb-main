import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import ScriptwriterTool from "./ScriptwriterTool";
import SeoTool from "./SeoTool";
import { RivalScannerTool } from "./RivalScannerTool";
import HiddenChannelFinderTool from "./HiddenChannelFinderTool";
import ScriptRefinerTool from "./ScriptRefinerTool";
import { MicroNicheMinerTool } from "./MicroNicheMinerTool";
import StoryStudioTool from "./StoryStudioTool";
import TextToSpeechTool from "./TextToSpeechTool";
import VeocityTool from "./VeocityTool";
import VirtualMCTool from "./VirtualMCTool";

import type { Tool } from "./ToolsGrid";

// ✅ Vision SSR off (thường dùng window/drag/drop/canvas)
const ImageForgeTool = dynamic(() => import("./ImageForgeTool"), { ssr: false });

type Props = {
  toolId: string;
  onBack: () => void; // close overlay + scroll tools board
};

const ToolOverlay: React.FC<Props> = ({ toolId, onBack }) => {
  const router = useRouter();

  // ✅ Registry để:
  // - render đúng component theo id
  // - hỗ trợ "onToolSelect" (điều hướng tool -> tool)
  const registry: Record<
    string,
    {
      name: string;
      render: (ctx: {
        onBack: () => void;
        tools: Tool[];
        onToolSelect: (tool: Tool) => void;
      }) => React.ReactNode;
    }
  > = {
    scriptwriter: {
      name: "Viết kịch bản YouTube",
      render: ({ onBack, tools, onToolSelect }) => (
        <ScriptwriterTool tools={tools} onToolSelect={onToolSelect} onBack={onBack} />
      ),
    },
    seo: {
      name: "SEO YouTube tối ưu",
      render: ({ onBack }) => <SeoTool onBack={onBack} />,
    },
    "rival-scanner": {
      name: "Phân tích đối thủ",
      render: ({ onBack, tools, onToolSelect }) => (
        <RivalScannerTool onBack={onBack} tools={tools} onToolSelect={onToolSelect} />
      ),
    },
    "hidden-channel-finder": {
      name: "Tìm kênh ẩn",
      render: ({ onBack }) => <HiddenChannelFinderTool onBack={onBack} />,
    },
    "script-refiner": {
      name: "Viết lại kịch bản nâng cao",
      render: ({ onBack }) => <ScriptRefinerTool onBack={onBack} />,
    },
    "micro-niche-miner": {
      name: "Micro Niche Miner",
      render: ({ onBack, tools, onToolSelect }) => (
        <MicroNicheMinerTool onBack={onBack} tools={tools} onToolSelect={onToolSelect} />
      ),
    },
    "image-forge": {
      name: "SeenYT Vision (Thumbnail AI)",
      render: ({ onBack }) => <ImageForgeTool onBack={onBack} />,
    },
    "narrative-studio": {
      name: "Narrative Studio",
      render: ({ onBack }) => <StoryStudioTool onBack={onBack} />,
    },
    "text-to-speech": {
      name: "Text-to-Speech",
      render: ({ onBack }) => <TextToSpeechTool onBack={onBack} />,
    },
    velocity: {
      name: "Velocity Tool",
      render: ({ onBack }) => <VeocityTool onBack={onBack} />,
    },
    "virtual-mc": {
      name: "Virtual MC (Idol AI)",
      render: ({ onBack }) => <VirtualMCTool />,
    },
  };

  // ✅ tool list phục vụ cho các tool cần "tools + onToolSelect"
  // (ScriptwriterTool / RivalScannerTool / MicroNicheMinerTool…)
  const allTools: Tool[] = [
    { id: "scriptwriter", name: "Viết kịch bản YouTube", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: ScriptwriterTool as any },
    { id: "seo", name: "SEO YouTube tối ưu", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: SeoTool as any },
    { id: "rival-scanner", name: "Phân tích đối thủ", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: RivalScannerTool as any },
    { id: "hidden-channel-finder", name: "Tìm kênh ẩn", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: HiddenChannelFinderTool as any },
    { id: "script-refiner", name: "Viết lại kịch bản", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: ScriptRefinerTool as any },
    { id: "micro-niche-miner", name: "Micro Niche Miner", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: MicroNicheMinerTool as any },
    { id: "image-forge", name: "SeenYT Vision", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: ImageForgeTool as any },
    { id: "narrative-studio", name: "Narrative Studio", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: StoryStudioTool as any },
    { id: "text-to-speech", name: "Text-to-Speech", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: TextToSpeechTool as any },
    { id: "velocity", name: "Velocity Tool", shortDescription: "", longDescription: "", features: [], icon: (() => null) as any, component: VeocityTool as any },
    { id: "virtual-mc", name: "Virtual MC (Idol AI)", shortDescription: "Tạo Video MC ảo từ ảnh", longDescription: "", features: [], icon: (() => null) as any, component: VirtualMCTool as any },
  ];

  const onToolSelect = (tool: Tool) => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, tool: tool.id } },
      undefined,
      { shallow: true }
    );
  };

  const entry = registry[toolId];

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onBack} />

      {/* Panel */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-b from-[#0b0b0b] via-[#120b07] to-[#0b0b0b]">
          {/* Top bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-black/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="px-3 py-2 rounded-lg border border-[#CDAD5A]/40 text-[#CDAD5A] font-bold hover:bg-[#CDAD5A]/10 transition"
              >
                ← Quay lại bảng công cụ
              </button>

              <div className="hidden md:block">
                <div className="text-white font-black tracking-wide">
                  {entry?.name || "TOOL"}
                </div>
                <div className="text-xs text-gray-400">
                  Chế độ toàn màn hình (Full-page workspace)
                </div>
              </div>
            </div>

            <button
              onClick={onBack}
              className="text-gray-300 hover:text-white text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="h-[calc(100%-56px)] overflow-hidden">
            <div className="h-full w-full overflow-y-auto">
              <div className="min-h-full">
                {entry ? (
                  <div className="min-h-[calc(100vh-56px)]">
                    {entry.render({ onBack, tools: allTools, onToolSelect })}
                  </div>
                ) : (
                  <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6">
                    <div className="max-w-xl w-full bg-black/40 border border-[#CDAD5A]/30 rounded-2xl p-6 text-center">
                      <div className="text-[#CDAD5A] font-black text-xl">
                        Tool không tồn tại
                      </div>
                      <div className="text-gray-300 mt-2">
                        Không tìm thấy toolId: <span className="font-mono">{toolId}</span>
                      </div>
                      <button
                        onClick={onBack}
                        className="mt-5 px-4 py-2 rounded-lg bg-[#CDAD5A] text-black font-bold hover:opacity-90 transition"
                      >
                        Quay về bảng công cụ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* /Content */}
        </div>
      </div>
    </div>
  );
};

export default ToolOverlay;

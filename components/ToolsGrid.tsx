import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from 'next-i18next';
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
import VoiceStudioTool from "./VoiceStudioTool";
import VeocityTool from "./VeocityTool";
import VirtualMCTool from "./VirtualMCTool";
import UpgradeGate from "./UpgradeGate";
import FutureEyeTool from "./tools/FutureEye/FutureEyeTool";

import { useSession } from "next-auth/react";
import { canAccessTool, type Role } from "@/lib/roles";

export interface Tool {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  seoKeywords: string[];
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  isNewbie?: boolean;
  isHot?: boolean;
  isPro?: boolean;
  isExclusive?: boolean;
  isNew?: boolean;
  thumbColor?: string;
  videoSrc?: string;
  imageSrc?: string;
}

/* =========================
   TOOL DATA
   ========================= */

const toolsHot: Tool[] = [
  {
    id: "virtual-mc",
    name: "Tạo MC Ảo (Idol AI) - Nhép Miệng",
    shortDescription: "Tạo MC ảo nói chuyện từ ảnh chụp.",
    longDescription: "Công cụ tạo MC ảo nói chuyện từ ảnh chụp. Tự động hóa video dẫn chương trình, tin tức hoặc đào tạo mà không cần quay hình trực tiếp. Tiết kiệm chi phí thuê studio và thiết bị.",
    seoKeywords: ["AI Avatar", "Talking Head", "MC Ảo"],
    features: ["Upload ảnh", "Nhép môi", "15s Render"],
    icon: PortalIcon,
    component: VirtualMCTool,
    isHot: true,
    isPro: true,
    isExclusive: true,
    thumbColor: "from-pink-500 to-rose-500",
    imageSrc: "/images/tool-virtual-mc.jpg",
  },
  {
    id: "image-forge",
    name: "Tạo Ảnh - Thiết Kế Thumbnail AI",
    shortDescription: "Thiết kế Thumbnail AI High CTR.",
    longDescription: "Thiết kế ảnh thu nhỏ (Thumbnail) bằng trí tuệ nhân tạo. Tự động phân tích màu sắc và bố cục gây kích thích cú nhấp chuột (High CTR). Tạo ảnh đồng nhất nhân vật, ngữ cảnh.",
    seoKeywords: ["Thumbnail", "Face Lock", "Ảnh Bìa"],
    features: ["Face Lock", "Style Ref"],
    icon: CubeIcon,
    component: ImageForgeTool,
    isHot: true,
    isNew: true,
    thumbColor: "from-purple-500 to-indigo-600",
    imageSrc: "/images/tool-thumbnail.jpg",
  },
  {
    id: "text-to-speech",
    name: "AI Voice Studio (TTS + Clone)",
    shortDescription: "Chuyển văn bản thành giọng nói & Clone giọng AI.",
    longDescription: "Studio âm thanh AI tất cả trong một. Chuyển văn bản thành giọng nói đa ngôn ngữ, và đặc biệt tính năng Clone Giọng (Voice Cloning) chỉ từ 5 giây âm thanh mẫu.",
    seoKeywords: ["Voice AI", "Clone Voice", "TTS"],
    features: ["Voice Clone", "100+ giọng", "Đa ngôn ngữ"],
    icon: MicrophoneIcon,
    component: VoiceStudioTool,
    isHot: true,
    isNew: true,
    thumbColor: "from-teal-400 to-emerald-500",
    imageSrc: "/images/tool-tts.jpg",
  },
  {
    id: "seo",
    name: "Tối Ưu SEO & Từ Khóa",
    shortDescription: "Tối ưu từ khóa chuẩn thuật toán YouTube 2026.",
    longDescription: "Công cụ phân tích và tối ưu hóa từ khóa chuẩn thuật toán YouTube 2026. Hỗ trợ tạo tiêu đề, thẻ tag và mô tả video giúp video dễ dàng lên top tìm kiếm.",
    seoKeywords: ["SEO Tool", "Ranking", "Từ Khóa"],
    features: ["Keyword", "Tag Gen"],
    icon: PhiIcon,
    component: SeoTool,
    isHot: true,
    isNewbie: true,
    thumbColor: "from-blue-400 to-indigo-500",
    imageSrc: "/images/tool-seo.jpg",
  },
  {
    id: "micro-niche-miner",
    name: "Đào Ngách CPM Cao",
    shortDescription: "Phân tích thị trường ngách siêu nhỏ.",
    longDescription: "Phân tích sâu vào các thị trường ngách siêu nhỏ (Micro-niche) để tối ưu khả năng lên TOP. Giảm mức độ cạnh tranh bằng cách tập trung vào các cụm từ khóa dài và chủ đề chuyên biệt.",
    seoKeywords: ["CPM", "Niche Mining", "Kiếm Tiền"],
    features: ["50 ideas", "CPM Forecast"],
    icon: GearIcon,
    component: MicroNicheMinerTool,
    isHot: true,
    isNewbie: true,
    isExclusive: true,
    thumbColor: "from-yellow-400 to-orange-400",
    imageSrc: "/images/tool-niche-miner.jpg",
  },
];

const toolsContent: Tool[] = [
  {
    id: "dubbing",
    name: "AI Dubbing Studio (Lồng Tiếng)",
    shortDescription: "Tự động dịch thuật và lồng tiếng Video.",
    longDescription: "Biến video quốc tế thành video của bạn. Tự động dịch thuật, lồng tiếng Việt, khớp khẩu hình (Auto-Dubbing). Hỗ trợ tải video TikTok/YouTube và xuất bản nhanh chóng.",
    seoKeywords: ["Dubbing", "Lồng Tiếng", "Video Translator"],
    features: ["Auto Dub", "Voice AI", "Multi-Language"],
    icon: MicrophoneIcon,
    component: null as any, // Loaded in Overlay
    isHot: true,
    isNew: true,
    thumbColor: "from-yellow-500 to-amber-600",
    imageSrc: "/images/tool-dubbing-new.jpg",
  },
  {
    id: "velocity",
    name: "Tạo Video Bằng AI",
    shortDescription: "Tạo video Faceless tự động.",
    longDescription: "Phần mềm tạo video Faceless (không lộ mặt) tự động. Hỗ trợ kho Stock video chất lượng cao, tự động ghép cảnh theo nội dung, tối ưu cho YouTube Shorts, TikTok và Reels.",
    seoKeywords: ["Text to Video", "Faceless", "Auto Video"],
    features: ["Auto Stock", "Subtitle", "4K Export"],
    icon: MicrophoneIcon,
    component: VeocityTool,
    isNew: true,
    thumbColor: "from-blue-500 to-cyan-500",
    imageSrc: "/images/tool-velocity.jpg",
  },
  {
    id: "scriptwriter",
    name: "Viết Kịch Bản Viral",
    shortDescription: "Viết kịch bản chuẩn cấu trúc viral.",
    longDescription: "Công cụ viết kịch bản chuẩn cấu trúc viral. Tập trung tối ưu 30 giây đầu (Hook) để giữ chân người xem. Phù hợp cho mọi ngách nội dung từ vlog đến review.",
    seoKeywords: ["Script", "Viral Hook", "Kịch Bản"],
    features: ["Hook viral", "Interactive"],
    icon: PyramidIcon,
    component: ScriptwriterTool,
    isNewbie: true,
    thumbColor: "from-orange-400 to-amber-500",
    imageSrc: "/images/tool-scriptwriter.jpg",
  },
  {
    id: "narrative-studio",
    name: "Kể Chuyện Lịch Sử / Story",
    shortDescription: "Sáng tạo cốt truyện và dẫn dắt nội dung.",
    longDescription: "Công cụ hỗ trợ sáng tạo cốt truyện và dẫn dắt nội dung chuyên sâu. Giúp xây dựng kịch bản có chiều sâu, đa dạng bối cảnh và cảm xúc, tối ưu cho các kênh Storytelling hoặc phim ngắn.",
    seoKeywords: ["Storytelling", "History", "Kể Chuyện"],
    features: ["Script dài", "Voice AI"],
    icon: CompassIcon,
    component: StoryStudioTool,
    thumbColor: "from-cyan-600 to-blue-700",
    imageSrc: "/images/tool-narrative.jpg",
  },
  {
    id: "script-refiner",
    name: "Chỉnh Sửa & Nâng Cấp Kịch Bản",
    shortDescription: "Tối ưu hóa văn bản, chỉnh sửa giọng văn.",
    longDescription: "Giải pháp tối ưu hóa văn bản AI giúp cải thiện câu từ, chỉnh sửa giọng văn cho tự nhiên và chuyên nghiệp hơn. Phù hợp để làm mượt các kịch bản thô từ AI hoặc dịch thuật.",
    seoKeywords: ["Rewrite", "Script Doctor", "Sửa Kịch Bản"],
    features: ["Rewrite Hook", "A/B Test"],
    icon: HourglassIcon,
    component: ScriptRefinerTool,
    thumbColor: "from-gray-500 to-slate-600",
    imageSrc: "/images/tool-script-refiner.jpg",
  },
];

const toolsResearch: Tool[] = [
  {
    id: "rival-scanner",
    name: "Phân Tích Kênh Đối Thủ",
    shortDescription: "Quét và phân tích chiến lược đối thủ.",
    longDescription: "Quét và phân tích sâu chiến lược của đối thủ cạnh tranh. Cung cấp dữ liệu về từ khóa hiệu quả nhất, nguồn traffic và các mẫu nội dung đang thành công của họ.",
    seoKeywords: ["Spy Tool", "Competitor", "Soi View"],
    features: ["Retention", "Metadata"],
    icon: BinocularsIcon,
    component: RivalScannerTool,
    isExclusive: true,
    thumbColor: "from-red-500 to-orange-500",
    imageSrc: "/images/tool-rival-scanner.jpg",
  },
  {
    id: "hidden-channel-finder",
    name: "Tìm Ngách Xanh",
    shortDescription: "Khám phá kênh YouTube nhỏ tăng trưởng nhanh.",
    longDescription: "Công cụ khám phá các kênh YouTube nhỏ đang có tốc độ tăng trưởng đột biến. Giúp nhà sáng tạo tìm thấy những chủ đề \"ngách\" chưa bão hòa để khai thác sớm.",
    seoKeywords: ["Niche Finder", "Blue Ocean", "Ngách"],
    features: ["Ngách vàng", "Filter"],
    icon: PortalIcon,
    component: HiddenChannelFinderTool,
    isExclusive: true,
    thumbColor: "from-indigo-500 to-purple-500",
    imageSrc: "/images/tool-hidden-gem.jpg",
  },
];

const toolsVeryHot: Tool[] = [
  {
    id: "thay-youtube",
    name: "Thầy YouTube - Giáo Án 30 Ngày",
    shortDescription: "Giáo án 30 ngày cầm tay chỉ việc.",
    longDescription: "Đồng hành cùng bạn trong 30 ngày đầu làm YouTube. Cung cấp giáo án chi tiết hàng ngày, tool hỗ trợ, và định hướng nội dung để đạt 1000 sub đầu tiên.",
    seoKeywords: ["Giáo Án YouTube", "30 Ngày", "Thầy YouTube"],
    features: ["Lộ trình 30 ngày", "Kèm cặp 1-1", "Tool tích hợp"],
    icon: BookIcon,
    component: null as any,
    isHot: true,
    isExclusive: true,
    thumbColor: "from-red-600 to-yellow-500", // Special gradient
    imageSrc: "/images/tool-thay-youtube-new.png",
  },
  {
    id: "niche-engine",
    name: "Thư viện ngách thắng 100%",
    shortDescription: "Chọn ngách & Sinh kịch bản Long Video.",
    longDescription: "Hệ thống Long Video Engine giúp bạn chọn ngách chiến thắng, phân tích cơ hội và sinh gói triển khai nội dung chi tiết (Prompt + Script) chỉ với vài cú click.",
    seoKeywords: ["Niche", "Long Video", "Script Gen"],
    features: ["20+ Ngách Win", "Prompt Meta", "Auto-Script"],
    icon: CompassIcon,
    component: null as any,
    isHot: true,
    isExclusive: true,
    isPro: true,
    thumbColor: "from-emerald-600 to-teal-500",
    imageSrc: "/images/tool-niche-engine.jpg", // Placeholder or generic
  },
];

// Admin-only tools
const toolsDeveloper: Tool[] = [
  {
    id: "future-eye",
    name: "FUTURE-EYE AI - Video Tương Lai",
    shortDescription: "Sản xuất video documentary chất lượng quốc tế.",
    longDescription: "Công cụ AI chuyên dụng để sản xuất video YouTube ngách Tương lai/Thiên tai/Công nghệ. Tự động tạo 12 chủ đề, viết kịch bản 2000 từ, bảng visual sync với prompt Runway và tọa độ Google Earth.",
    seoKeywords: ["Documentary", "Future", "AI Video"],
    features: ["12 Topics", "Visual Sync", "Multi-lang"],
    icon: CompassIcon,
    component: FutureEyeTool,
    isHot: true,
    isExclusive: true,
    isPro: true,
    thumbColor: "from-purple-600 to-pink-600",
    imageSrc: "/images/tool-future-eye.jpg",
  },
];

/* =========================
   COMPACT CARD
   ========================= */

const CapCutCard: React.FC<{
  tool: Tool;
  isLocked: boolean;
  onOpen: () => void;
  index: number;
  showExclusiveBadge?: boolean;
  t: any;
}> = ({ tool, isLocked, onOpen, index, showExclusiveBadge = false, t }) => {
  const Icon = tool.icon;
  const [isHovered, setIsHovered] = useState(false);

  // Get translated tool name/description using tool ID as key
  const toolName = t(`tools.${tool.id}.name`, tool.name);
  const toolShortDesc = t(`tools.${tool.id}.short`, tool.shortDescription);
  const toolLongDesc = t(`tools.${tool.id}.long`, tool.longDescription);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-white/10 ring-1 ring-black/5 select-none"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* 1. THUMBNAIL AREA - COMPACT */}
      <div className={`relative w-full h-20 bg-gradient-to-r ${tool.thumbColor || 'from-gray-300 to-gray-400'} flex items-center justify-center overflow-hidden`}>

        {/* IMAGE / VIDEO */}
        {tool.imageSrc ? (
          <img
            src={tool.imageSrc}
            alt={toolName}
            className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
        ) : tool.videoSrc ? (
          <video
            src={tool.videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-white/10 opacity-20" />
            {/* Static Icon */}
            <div className="transition-all duration-300 transform group-hover:scale-110">
              <Icon className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </>
        )}

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30 backdrop-blur-[1px]">
            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9v2H6V8a6 6 0 1112 0zm-2 0V8a4 4 0 10-8 0v2h8z" /></svg>
          </div>
        )}
      </div>

      {/* 2. TEXT & BADGES AREA - COMPACT */}
      <div className="p-2 flex flex-col flex-grow bg-white relative">

        {/* BADGES */}
        <div className="flex flex-wrap gap-0.5 mb-1">
          {tool.isHot && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">🔥 {t('badges.hot', 'HOT')}</span>}
          {tool.isExclusive && <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">💎 {t('badges.exclusive', 'EXCLUSIVE')}</span>}
          {tool.isNew && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">🚀 {t('badges.new', 'NEW')}</span>}
          {tool.isNewbie && !tool.isHot && <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">🌱 {t('badges.for_beginners', 'FOR BEGINNERS')}</span>}
        </div>

        {/* TOOL NAME */}
        <h3 className="text-sm font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors truncate w-full mb-0.5">
          {toolName}
        </h3>

        <p className="text-[11px] text-gray-500 line-clamp-1 leading-snug">
          {toolShortDesc}
        </p>

        {/* HOVER REVEAL */}
        <div className={`absolute inset-x-0 bottom-0 bg-white p-2 border-t border-gray-100 shadow-[-2px_-5px_15px_rgba(0,0,0,0.05)] transition-transform duration-300 transform ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-2">
            {toolLongDesc}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================
   SECTION
   ========================= */
/* =========================
   SECTION
   ========================= */
type SectionVariant = 'default' | 'gold' | 'fire' | 'blue' | 'green';

const ToolSection: React.FC<{
  title: string;
  tools: Tool[];
  userRole: Role;
  onOpen: (tool: Tool) => void;
  isExclusiveSection?: boolean;
  variant?: SectionVariant;
  t: any;
}> = ({ title, tools, userRole, onOpen, isExclusiveSection = false, variant = 'default', t }) => {

  const getThemeClass = () => {
    switch (variant) {
      case 'gold': return 'border-amber-500/30 bg-amber-900/10';
      case 'fire': return 'border-red-500/30 bg-red-900/10';
      case 'blue': return 'border-blue-500/30 bg-blue-900/10';
      case 'green': return 'border-green-500/30 bg-green-900/10';
      default: return 'border-transparent';
    }
  };

  const getTitleColor = () => {
    switch (variant) {
      case 'gold': return 'text-amber-400';
      case 'fire': return 'text-red-400';
      case 'blue': return 'text-blue-400';
      case 'green': return 'text-emerald-400';
      default: return 'text-[#F3EFE0]';
    }
  };

  return (
    <div className={`mb-10 px-4 py-6 rounded-2xl border ${getThemeClass()} animate-fade-in-up transition-all duration-300 hover:bg-opacity-20`}>
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-1.5 h-6 rounded-full shadow-sm ${variant === 'gold' ? 'bg-amber-400' :
          variant === 'fire' ? 'bg-red-500' :
            variant === 'blue' ? 'bg-blue-500' :
              variant === 'green' ? 'bg-emerald-500' : 'bg-[#F3EFE0]'
          }`}></div>
        <h3 className={`text-xl font-bold uppercase tracking-wide ${getTitleColor()}`}>
          {title}
        </h3>
        {isExclusiveSection && (
          <span className="ml-2 px-2 py-0.5 text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full uppercase tracking-wide shadow-lg animate-pulse">
            ⭐ {t('badges.exclusive', 'EXCLUSIVE')}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tools.map((tool, i) => (
          <CapCutCard
            key={tool.id}
            index={i}
            tool={tool}
            isLocked={!canAccessTool(tool.id, userRole)}
            onOpen={() => onOpen(tool)}
            showExclusiveBadge={isExclusiveSection}
            t={t}
          />
        ))}
      </div>
    </div>
  )
};

/* =========================
   NAV & MAIN GRID
   ========================= */

type TabType = 'all' | 'newbie' | 'hot' | 'content' | 'research' | 'very_hot' | 'developer';

const ToolsGrid: React.FC = () => {
  const { data: session } = useSession();
  const userRole = ((session?.user as any)?.role || "FREE") as Role;
  const router = useRouter();
  const { t } = useTranslation('common');

  const [activeTab, setActiveTab] = useState<TabType>('all');

  const [showUpgradeGate, setShowUpgradeGate] = useState(false);
  const [selectedToolForUpsell, setSelectedToolForUpsell] = useState<Tool | null>(null);

  const handleOpenTool = (tool: Tool) => {
    if (!canAccessTool(tool.id, userRole)) {
      setSelectedToolForUpsell(tool);
      setShowUpgradeGate(true);
      return;
    }

    // Special handling for Thầy YouTube - navigate to dedicated page
    if (tool.id === 'thay-youtube') {
      router.push('/tools/thay-youtube');
      return;
    }

    // Special handling for Niche Engine
    if (tool.id === 'niche-engine') {
      router.push('/studio/niche-engine');
      return;
    }

    // Special handling for Future Eye
    if (tool.id === 'future-eye') {
      router.push('/tools/future-eye');
      return;
    }

    router.push({ pathname: router.pathname, query: { ...router.query, tool: tool.id } }, undefined, { shallow: true });
  };

  // Helper to get tools based on filter
  const allTools = [...toolsVeryHot, ...toolsHot, ...toolsContent, ...toolsResearch, ...(userRole === 'ADMIN' ? toolsDeveloper : [])];

  const getFilteredTools = () => {
    switch (activeTab) {
      case 'newbie': return allTools.filter(t => t.isNewbie);
      case 'hot': return allTools.filter(t => t.isHot);
      case 'content': return toolsContent;
      case 'research': return toolsResearch;
      case 'very_hot': return toolsVeryHot;
      case 'developer': return toolsDeveloper;
      default: return [];
    }
  };

  const navItems = [
    { id: 'all', label: t('nav.all', 'Tất cả'), icon: null },
    { id: 'newbie', label: t('nav.newbie', 'Dành cho người mới'), icon: '🌱' },
    { id: 'hot', label: t('nav.hot', 'Đang thịnh hành'), icon: '🔥' },
    { id: 'content', label: t('nav.content', 'Sáng tạo nội dung'), icon: '📝' },
    { id: 'research', label: t('nav.research', 'Nghiên cứu thị trường'), icon: '📊' },
    { id: 'very_hot', label: '🏆 ' + t('nav.learning', 'GÓC HỌC WIN!'), icon: null },
    ...(userRole === 'ADMIN' ? [{ id: 'developer', label: '🔧 ' + t('nav.developer', 'Nhà Phát Triển'), icon: null }] : []),
  ];

  return (
    <section className="min-h-screen bg-[#1F291D] pt-8 pb-24 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">

        {/* HEADER */}
        <div className="mb-8 px-2 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-black text-[#F3EFE0] mb-3 tracking-tight font-serif">
            SeenYT <span className="font-light italic text-[#CDAD5A]">Studio</span>
          </h2>
          <p className="text-[#F3EFE0]/70 text-sm md:text-base max-w-2xl font-light">
            {t('studio.subtitle', 'Khơi nguồn sáng tạo với bộ công cụ AI tối thượng. Thiết kế tinh tế, hiệu năng vượt trội.')}
          </p>
        </div>

        {/* CAPCUT STYLE NAVIGATION */}
        <div className="flex flex-wrap items-center gap-4 mb-10 border-b border-[#F3EFE0]/10 pb-1 px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isNewbie = item.id === 'newbie';
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`
                            relative px-3 py-2 text-sm font-bold transition-all duration-200 flex items-center gap-2
                            ${isActive ? 'text-[#F3EFE0]' : 'text-[#F3EFE0]/60 hover:text-[#F3EFE0]/90'}
                            ${isNewbie ? 'bg-[#F3EFE0]/10 rounded-t-lg px-4' : ''}
                        `}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}

                {/* Active Indicator Underline */}
                {isActive && (
                  <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-[#CDAD5A] shadow-[0_0_10px_#CDAD5A]" />
                )}
              </button>
            )
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[500px]">
          {activeTab === 'all' ? (
            <>
              <ToolSection title={'🏆 ' + t('sections.learning', 'Góc Học Win!')} tools={toolsVeryHot} userRole={userRole} onOpen={handleOpenTool} isExclusiveSection={true} variant="gold" t={t} />
              <ToolSection title={'🔥 ' + t('sections.trending', 'Đang Thịnh Hành')} tools={toolsHot} userRole={userRole} onOpen={handleOpenTool} variant="fire" t={t} />
              <ToolSection title={'📝 ' + t('sections.content_creation', 'Sáng Tạo Nội Dung')} tools={toolsContent} userRole={userRole} onOpen={handleOpenTool} variant="blue" t={t} />
              <ToolSection title={'📊 ' + t('sections.research', 'Nghiên Cứu Thị Trường')} tools={toolsResearch} userRole={userRole} onOpen={handleOpenTool} variant="green" t={t} />
              {userRole === 'ADMIN' && (
                <ToolSection title={'🔧 ' + t('sections.developer', 'Nhà Phát Triển')} tools={toolsDeveloper} userRole={userRole} onOpen={handleOpenTool} isExclusiveSection={true} variant="default" t={t} />
              )}
            </>
          ) : (
            <div className="animate-fade-in">
              <ToolSection
                title={navItems.find(i => i.id === activeTab)?.label || ""}
                tools={getFilteredTools()}
                userRole={userRole}
                onOpen={handleOpenTool}
                t={t}
              />
            </div>
          )}
        </div>

        <div className="mt-20 text-center border-t border-[#F3EFE0]/10 pt-8">
          <p className="text-[#F3EFE0]/40 text-xs">SeenYT Platform © 2026</p>
        </div>

      </div>

      {/* Global Upgrade Gate for Locked Tools */}
      <UpgradeGate
        isOpen={showUpgradeGate}
        onClose={() => setShowUpgradeGate(false)}
        userTier={userRole}
        requiredTier={(selectedToolForUpsell as any)?.roleMin || 'STARTER'}
        featureName={`Công cụ ${selectedToolForUpsell?.name || ''}`}
      />
    </section>
  );
};

export default ToolsGrid;

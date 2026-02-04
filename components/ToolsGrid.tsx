import React, { useState } from "react";
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
import RivalScannerTool from "./RivalScannerTool";
import HiddenChannelFinderTool from "@/components/HiddenChannelFinderTool";
import ScriptRefinerTool from "./ScriptRefinerTool";
import MicroNicheMinerTool from "./MicroNicheMinerTool";
import ImageForgeTool from "./ImageForgeTool";
import StoryStudioTool from "./StoryStudioTool";
import VoiceStudioTool from "./VoiceStudioTool";
import VeocityTool from "./VeocityTool";
import VirtualMCTool from "./VirtualMCTool";
import UpgradeGate from "./UpgradeGate";

import FutureEyeTool from "./tools/FutureEye/FutureEyeTool";

import { useSession } from "next-auth/react";
import { canAccessTool, type Role } from "@/lib/roles";

// NEW UI COMPONENTS
import AnimatedBackground from "./ui/AnimatedBackground";
import NeonHeader from "./ui/NeonHeader";
import GlassCard, { ViewMode } from "./ui/GlassCard";

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
  isComingSoon?: boolean; // New Flag
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
    isComingSoon: true, // SUSPENDED
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
  {
    id: "keyword-research",
    name: "Nghiên Cứu Từ Khóa (Keyword.io)",
    shortDescription: "Phân tích từ khóa chuyên sâu từ YouTube.",
    longDescription: "Công cụ nghiên cứu từ khóa mạnh mẽ, giúp bạn tìm ra các từ khóa có lượng tìm kiếm cao nhưng độ cạnh tranh thấp. Tích hợp AI để gợi ý chiến lược nội dung.",
    seoKeywords: ["Keyword Tool", "Research", "Từ Khóa"],
    features: ["Deep Analysis", "Volume/Competition", "AI Suggest"],
    icon: CompassIcon,
    component: null as any,
    isHot: true,
    isPro: true,
    thumbColor: "from-amber-400 to-yellow-600",
    imageSrc: "/images/tool-keyword.jpg"
  }
];

const toolsContent: Tool[] = [
  {
    id: "dubbing",
    name: "AI Dubbing Studio (Lồng Tiếng)",
    shortDescription: "Tạo video lồng tiếng tự động từ URL.",
    longDescription: "Biến video quốc tế thành video của bạn. Tự động dịch thuật, lồng tiếng Việt, khớp khẩu hình (Auto-Dubbing). Hỗ trợ tải video TikTok/YouTube và xuất bản nhanh chóng.",
    seoKeywords: ["Dubbing", "Lồng Tiếng", "Video Translator"],
    features: ["Auto Dub", "Voice AI", "Multi-Language"],
    icon: MicrophoneIcon,
    component: null as any, // Loaded in Overlay
    isHot: true,
    isNew: true,
    isComingSoon: true, // SUSPENDED
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
  {
    id: "keyword-research",
    name: "Nghiên Cứu Từ Khóa (Keyword.io)",
    shortDescription: "Phân tích từ khóa chuyên sâu từ YouTube.",
    longDescription: "Công cụ nghiên cứu từ khóa mạnh mẽ, giúp bạn tìm ra các từ khóa có lượng tìm kiếm cao nhưng độ cạnh tranh thấp. Tích hợp AI để gợi ý chiến lược nội dung.",
    seoKeywords: ["Keyword Tool", "Research", "Từ Khóa"],
    features: ["Deep Analysis", "Volume/Competition", "AI Suggest"],
    icon: CompassIcon,
    component: null as any,
    isHot: true,
    isPro: true,
    thumbColor: "from-amber-400 to-yellow-600",
    imageSrc: "/images/tool-keyword.jpg"
  }
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
  {
    id: "x-hot-news",
    name: "X-Trend Hunter Pro",
    shortDescription: "Săn trend X & Tạo video viral tự động.",
    longDescription: "Công cụ Admin chuyên dụng: Quét hot trend từ X (Twitter), phân tích cơ hội viral và tự động viết kịch bản video đa ngôn ngữ (EN/JP/KR/ES).",
    seoKeywords: ["X Trend", "Viral Script", "News Hunter"],
    features: ["Scan X API", "Auto Script", "Multi-lang"],
    icon: BinocularsIcon,
    component: null as any,
    isHot: true,
    isExclusive: true,
    isPro: true,
    thumbColor: "from-blue-600 to-cyan-500",
    imageSrc: "/images/tool-velocity.jpg", // Temporary reuse
  },
];

/* =========================
   SECTION (Collapsible + View Mode)
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
  defaultCollapsed?: boolean;
  viewMode?: ViewMode;
}> = ({ title, tools, userRole, onOpen, isExclusiveSection = false, variant = 'default', t, defaultCollapsed = false, viewMode = 'grid' }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const getThemeColor = () => {
    switch (variant) {
      case 'gold': return '#fbbf24';
      case 'fire': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      default: return '#fff';
    }
  };

  const themeColor = getThemeColor();

  // Different grid layouts for Grid vs List mode
  const gridClassName = viewMode === 'list'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 pl-4';

  return (
    <div className="mb-12 relative">
      {/* Decorative Line */}
      <div className="absolute left-0 top-3 bottom-3 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-30"></div>

      {/* Header with Collapse Button */}
      <div
        className="flex items-center gap-3 mb-6 pl-6 relative cursor-pointer group"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="absolute left-[3px] top-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}></div>

        <h3 className="text-lg md:text-xl font-black uppercase tracking-widest text-white/90 group-hover:text-white transition-colors" style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
          {title}
        </h3>

        {isExclusiveSection && (
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-[9px] font-bold text-black shadow-lg">
            PREMIUM
          </span>
        )}

        {/* Collapse Toggle */}
        <button className="ml-auto mr-2 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all">
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Tool Count */}
        <span className="text-[10px] text-gray-500 font-mono">{tools.length}</span>
      </div>

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[3000px] opacity-100'}`}>
        <div className={gridClassName}>
          {tools.map((tool, i) => (
            <GlassCard
              key={tool.id}
              index={i}
              tool={tool}
              isLocked={!canAccessTool(tool.id, userRole)}
              onOpen={() => onOpen(tool)}
              showExclusiveBadge={isExclusiveSection}
              t={t}
              viewMode={viewMode}
            />
          ))}
        </div>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [showUpgradeGate, setShowUpgradeGate] = useState(false);
  const [selectedToolForUpsell, setSelectedToolForUpsell] = useState<Tool | null>(null);

  const handleOpenTool = (tool: Tool) => {
    if (!canAccessTool(tool.id, userRole)) {
      setSelectedToolForUpsell(tool);
      setShowUpgradeGate(true);
      return;
    }

    // Special Router Logic
    const routes: Record<string, string> = {
      'rival-scanner': '/tools/rival-scanner',
      'hidden-channel-finder': '/tools/hidden-channel-finder',
      'scriptwriter': '/tools/scriptwriter',
      'narrative-studio': '/tools/narrative-studio',
      'script-refiner': '/tools/script-refiner',
      'velocity': '/tools/veocity',
      'seo': '/tools/seo-tool',
      'micro-niche-miner': '/tools/micro-niche-miner',
      'thay-youtube': '/tools/thay-youtube',
      'niche-engine': '/studio/niche-engine',
      'future-eye': '/tools/future-eye',
      'x-hot-news': '/tools/x-trend-hunter',
      'keyword-research': '/tools/keyword-research', // NEW ROUTE
    };

    if (routes[tool.id]) {
      router.push(routes[tool.id]);
      return;
    }

    router.push({ pathname: router.pathname, query: { ...router.query, tool: tool.id } }, undefined, { shallow: true });
  };

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
    { id: 'all', label: t('nav.all', 'All Modules'), icon: null },
    { id: 'newbie', label: t('nav.newbie', 'Beginners'), icon: '🌱' },
    { id: 'hot', label: t('nav.hot', 'Trending'), icon: '🔥' },
    { id: 'content', label: t('nav.content', 'Creation'), icon: '📝' },
    { id: 'research', label: t('nav.research', 'Intelligence'), icon: '📊' },
    { id: 'very_hot', label: '🏆 ' + t('nav.learning', 'Academy'), icon: null },
    ...(userRole === 'ADMIN' ? [{ id: 'developer', label: '🔧 ' + t('nav.developer', 'Dev Ops'), icon: null }] : []),
  ];

  return (
    <section className="min-h-screen relative pt-8 pb-24 font-sans overflow-hidden">

      {/* 1. ANIMATED BACKGROUND */}
      <AnimatedBackground />

      <div className="relative w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 z-10">

        {/* 2. NEON HEADER */}
        <NeonHeader />

        {/* 🔍 SEARCH BAR + VIEW TOGGLE */}
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-md transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* 🎯 WORKFLOW RECOMMENDATION - Mobile Responsive */}
        {!searchQuery && activeTab === 'all' && (
          <div className="mb-12 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xl">🎯</span>
              <h3 className="text-base md:text-lg font-bold text-white">Workflow Đề Xuất</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold hidden sm:inline">NEW</span>
            </div>
            {/* Vertical on mobile, horizontal on md+ */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
              <button
                onClick={() => router.push('/tools/micro-niche-miner')}
                className="w-full md:w-auto group flex items-center gap-3 px-4 md:px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold shrink-0">1</span>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-sm">Đào Ngách CPM Cao</p>
                  <p className="text-gray-500 text-xs">Tìm thị trường vàng</p>
                </div>
              </button>
              {/* Arrow - changes direction based on screen */}
              <span className="text-cyan-500 text-xl md:text-2xl rotate-90 md:rotate-0">→</span>
              <button
                onClick={() => router.push('/tools/scriptwriter')}
                className="w-full md:w-auto group flex items-center gap-3 px-4 md:px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 transition-all"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold shrink-0">2</span>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-sm">Viết Kịch Bản</p>
                  <p className="text-gray-500 text-xs">Script viral</p>
                </div>
              </button>
              <span className="text-cyan-500 text-xl md:text-2xl rotate-90 md:rotate-0">→</span>
              <button
                onClick={() => router.push('/tools/seo-tool')}
                className="w-full md:w-auto group flex items-center gap-3 px-4 md:px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold shrink-0">3</span>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-sm">SEO & Từ Khóa</p>
                  <p className="text-gray-500 text-xs">Tối ưu tiêu đề</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 3. GLASS NAVIGATION */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
          <div className="p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex flex-wrap justify-center">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as TabType); setSearchQuery(''); }}
                  className={`
                      relative px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 uppercase tracking-wider
                      ${isActive
                      ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. CONTENT GRID */}
        <div className="min-h-[500px] animate-fade-in-up">
          {/* SEARCH RESULTS MODE */}
          {searchQuery ? (
            <div className="animate-fade-in">
              {(() => {
                const query = searchQuery.toLowerCase();
                const searchResults = allTools.filter(tool =>
                  tool.name.toLowerCase().includes(query) ||
                  tool.shortDescription.toLowerCase().includes(query) ||
                  tool.seoKeywords?.some(k => k.toLowerCase().includes(query))
                );

                if (searchResults.length === 0) {
                  return (
                    <div className="text-center py-20">
                      <span className="text-5xl mb-4 block">🔍</span>
                      <p className="text-gray-400 text-lg">Không tìm thấy tool nào cho "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full hover:bg-cyan-500/30 transition-all"
                      >
                        Xem tất cả tools
                      </button>
                    </div>
                  );
                }

                return (
                  <ToolSection
                    title={`🔍 KẾT QUẢ TÌM KIẾM (${searchResults.length})`}
                    tools={searchResults}
                    userRole={userRole}
                    onOpen={handleOpenTool}
                    t={t}
                    viewMode={viewMode}
                  />
                );
              })()}
            </div>
          ) : activeTab === 'all' ? (
            <>
              <ToolSection title={'🏆 ' + t('sections.learning', 'ACADEMY & ROADMAP')} tools={toolsVeryHot} userRole={userRole} onOpen={handleOpenTool} isExclusiveSection={true} variant="gold" t={t} viewMode={viewMode} />
              <ToolSection title={'🔥 ' + t('sections.trending', 'TRENDING MODULES')} tools={toolsHot} userRole={userRole} onOpen={handleOpenTool} variant="fire" t={t} viewMode={viewMode} />
              <ToolSection title={'📝 ' + t('sections.content_creation', 'CREATIVE SUITE')} tools={toolsContent} userRole={userRole} onOpen={handleOpenTool} variant="blue" t={t} viewMode={viewMode} />
              <ToolSection title={'📊 ' + t('sections.research', 'MARKET INTELLIGENCE')} tools={toolsResearch} userRole={userRole} onOpen={handleOpenTool} variant="green" t={t} viewMode={viewMode} />
              {userRole === 'ADMIN' && (
                <ToolSection title={'🔧 ' + t('sections.developer', 'DEV CONSOLE')} tools={toolsDeveloper} userRole={userRole} onOpen={handleOpenTool} isExclusiveSection={true} variant="default" t={t} viewMode={viewMode} />
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
                viewMode={viewMode}
              />
            </div>
          )}
        </div>

        <div className="mt-20 text-center border-t border-white/5 pt-8">
          <p className="text-gray-600 text-[10px] font-mono tracking-widest">SeenYT Platform © 2026. All Systems Operational.</p>
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

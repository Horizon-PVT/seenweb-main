// components/dashboard/DashboardHome.tsx
// Dashboard Home - Clean, Modern, Role-based (Light Obsidian Gold Theme)

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Zap, Sparkles, TrendingUp, Video, FileText, Search, 
  BarChart3, Globe, Download, Key, CreditCard, ChevronRight,
  MessageSquare, Clock, Users, Play, ArrowUpRight, Lock,
  CheckCircle2, AlertCircle, Star, ArrowRight, Copy, Check,
  Image, PenTool, Mic, ShoppingBag, Share2
} from 'lucide-react';

interface DashboardHomeProps {
  userRole: string;
  onToolSelect: (toolId: string) => void;
  onNavigate: (path: string) => void;
}

// ============== TOOL DEFINITIONS ==============
interface ToolItem {
  id: string;
  name: string;
  desc: string;
  icon: any;
  badge?: string;
  type: 'page' | 'tool' | 'desktop';
  route?: string;
}

const TOOL_ROUTES: Record<string, string> = {
  'niche-radar': '/studio/niche-engine',
  'script-studio': '/tools/scriptwriter',
  'video-pipeline': '/tools/video-pipeline',
  'seo-tool': '/tools/seo-tool',
  'thumbnail-ai': '/tools/thumbnail-ai',
  'rival-scanner': '/tools/rival-scanner',
  'intelligence-hub': '/tools/intelligence-hub',
  'multilingual-studio': '/tools/multilingual-studio',
  'koda-studio': '/tools/desktop-apps',
  'koda-novel': '/tools/desktop-apps',
  'koda-factory': '/tools/desktop-apps',
  'team-dashboard': '/team',
  'api-access': '/api-docs',
  'ai-coach': '/dashboard/ai-coach',
};

const ALL_TOOLS: ToolItem[] = [
  { id: 'niche-radar', name: 'Niche Radar', desc: 'Đào ngách CPM cao', icon: Search, type: 'tool' },
  { id: 'script-studio', name: 'Script Studio', desc: 'Viết kịch bản viral', icon: FileText, type: 'tool' },
  { id: 'video-pipeline', name: 'Video Pipeline', desc: 'Quản lý kênh, đăng bài', icon: Video, type: 'page', route: '/tools/video-pipeline' },
  { id: 'seo-tool', name: 'SEO Tool', desc: 'Tối ưu YouTube SEO', icon: TrendingUp, type: 'page', route: '/tools/seo-tool' },
  { id: 'thumbnail-ai', name: 'Thumbnail AI', desc: 'Tạo ảnh bìa viral', icon: Image, type: 'page', route: '/tools/thumbnail-ai' },
  { id: 'rival-scanner', name: 'Rival Scanner', desc: 'Phân tích đối thủ', icon: BarChart3, type: 'page', route: '/tools/rival-scanner' },
  { id: 'intelligence-hub', name: 'Intelligence Hub', desc: 'Phân tích xu hướng', icon: Sparkles, type: 'page', route: '/tools/intelligence-hub' },
  { id: 'multilingual-studio', name: 'Multilingual', desc: 'Đa ngôn ngữ', icon: Globe, type: 'page', route: '/tools/multilingual-studio' },
  { id: 'ai-coach', name: 'AI Coach', desc: 'Chat chiến lược YouTube', icon: MessageSquare, type: 'page', route: '/dashboard/ai-coach' },
  { id: 'koda-studio', name: 'Koda Studio', desc: 'Desktop Veo3 Render', icon: Play, badge: 'DESKTOP', type: 'desktop', route: '/tools/desktop-apps' },
  { id: 'koda-novel', name: 'Koda Novel', desc: 'Chuyển truyện thành phim', icon: FileText, badge: 'DESKTOP', type: 'desktop', route: '/tools/desktop-apps' },
  { id: 'koda-factory', name: 'Koda Factory', desc: 'Multi-workers', icon: Users, badge: 'DESKTOP', type: 'desktop', route: '/tools/desktop-apps' },
  { id: 'marketplace', name: 'Chợ Kênh', desc: 'Mua bán kênh YouTube', icon: ShoppingBag, type: 'page', route: '/tools/marketplace' },
  { id: 'affiliate', name: 'Affiliate', desc: 'Kiếm tiền cùng SeenYT', icon: Share2, type: 'page', route: '/tools/affiliate-partner' },
];

// ============== TOOLS BY TIER ==============
const TOOLS_BY_TIER: Record<string, {
  tier: string;
  color: string;
  bgColor: string;
  borderColor: string;
  toolIds: string[];
}> = {
  FREE: {
    tier: 'FREE',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    toolIds: ['niche-radar', 'script-studio', 'ai-coach', 'marketplace', 'affiliate'],
  },
  STARTER: {
    tier: 'Starter',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    toolIds: ['niche-radar', 'script-studio', 'video-pipeline', 'seo-tool', 'thumbnail-ai', 'rival-scanner'],
  },
  CREATOR: {
    tier: 'Creator',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    toolIds: ['niche-radar', 'script-studio', 'video-pipeline', 'koda-studio', 'intelligence-hub', 'multilingual-studio', 'ai-coach'],
  },
  FACTORY: {
    tier: 'Factory',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    toolIds: ['niche-radar', 'script-studio', 'video-pipeline', 'koda-studio', 'koda-novel', 'koda-factory', 'intelligence-hub', 'multilingual-studio'],
  },
  AGENCY: {
    tier: 'Agency',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    toolIds: ['niche-radar', 'script-studio', 'video-pipeline', 'koda-studio', 'koda-novel', 'koda-factory', 'intelligence-hub', 'multilingual-studio', 'team-dashboard'],
  },
  ENTERPRISE: {
    tier: 'Enterprise',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    toolIds: ['niche-radar', 'script-studio', 'video-pipeline', 'koda-studio', 'koda-novel', 'koda-factory', 'intelligence-hub', 'multilingual-studio', 'team-dashboard', 'api-access'],
  },
};

// ============== HELPER FUNCTIONS ==============
const getTierConfig = (role: string) => {
  if (role === 'ADMIN') return TOOLS_BY_TIER.FACTORY;
  const tierMap: Record<string, string> = {
    'FREE': 'FREE',
    'STARTER': 'STARTER',
    'CREATOR': 'CREATOR',
    'FACTORY': 'FACTORY',
    'AGENCY': 'AGENCY',
    'ENTERPRISE': 'ENTERPRISE',
    'BASIC': 'STARTER',
    'PRO': 'CREATOR',
  };
  return TOOLS_BY_TIER[tierMap[role] || 'FREE'] || TOOLS_BY_TIER.FREE;
};

const getTierBadgeColor = (tier: string) => {
  const colors: Record<string, string> = {
    'FREE': 'bg-gray-500/20 text-gray-400',
    'STARTER': 'bg-blue-500/20 text-blue-400',
    'CREATOR': 'bg-purple-500/20 text-purple-400',
    'FACTORY': 'bg-amber-500/20 text-amber-400',
    'AGENCY': 'bg-cyan-500/20 text-cyan-400',
    'ENTERPRISE': 'bg-rose-500/20 text-rose-400',
  };
  return colors[tier] || colors.FREE;
};

const getToolById = (id: string): ToolItem | undefined => {
  return ALL_TOOLS.find(t => t.id === id);
};

export default function DashboardHome({ userRole, onToolSelect, onNavigate }: DashboardHomeProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usageData, setUsageData] = useState({ used: 0, limit: 20, channels: 0 });
  
  const tierConfig = getTierConfig(userRole);
  const isPaidUser = !['FREE'].includes(tierConfig.tier);

  // Fetch license key
  useEffect(() => {
    fetch('/api/user/license')
      .then(r => r.json())
      .then(data => {
        if (data.success) setLicenseKey(data.licenseKey);
      })
      .catch(() => {});
  }, []);

  // Get tools for current tier
  const currentTools = tierConfig.toolIds.map(id => getToolById(id)).filter(Boolean) as ToolItem[];

  // Mock usage data
  useEffect(() => {
    setUsageData({
      used: 12,
      limit: tierConfig.tier === 'FREE' ? 5 : tierConfig.tier === 'STARTER' ? 20 : 50,
      channels: isPaidUser ? (tierConfig.tier === 'FACTORY' || tierConfig.tier === 'CREATOR' ? 2 : 5) : 0,
    });
  }, [userRole]);

  const handleCopyLicense = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle tool click
  const handleToolClick = (tool: ToolItem) => {
    if (tool.type === 'tool') {
      onToolSelect(tool.id);
    } else if (tool.type === 'page' && tool.route) {
      router.push(tool.route);
    } else if (tool.type === 'desktop') {
      if (tool.route) {
        router.push(tool.route);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* ============== HEADER: Welcome + Quick Stats ============== */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        
        {/* Welcome Message */}
        <div className="flex-1">
          <h1 className="text-3xl font-black text-white mb-2">
            Chào {session?.user?.name?.split(' ')[0] || 'Creator'}! 👋
          </h1>
          <p className="text-gray-400">
            {tierConfig.tier === 'FREE' 
              ? 'Khám phá các công cụ miễn phí hoặc nâng cấp để mở khóa thêm tính năng.'
              : `Bạn đang sử dụng gói ${tierConfig.tier} - tận hưởng các tính năng premium!`
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3">
          {/* Role Badge */}
          <div className={`px-4 py-2 rounded-xl ${tierConfig.bgColor} border ${tierConfig.borderColor} flex items-center gap-2`}>
            <Star size={16} className={tierConfig.color} />
            <span className={`font-bold text-sm ${tierConfig.color}`}>{tierConfig.tier}</span>
          </div>
          
          {/* Usage */}
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-sm">
              <span className="text-white font-bold">{usageData.used}</span>
              <span className="text-gray-500"> / {usageData.limit}</span>
            </span>
          </div>

          {/* Channels */}
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Video size={16} className="text-red-400" />
            <span className="text-sm">
              <span className="text-white font-bold">{usageData.channels}</span>
              <span className="text-gray-500"> kênh</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============== QUICK ACTIONS ============== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* AI Coach - Prominent */}
        <button
          onClick={() => router.push('/dashboard/ai-coach')}
          className="group relative bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/60 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare size={28} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">AI Coach</h3>
            <p className="text-gray-400 text-sm mb-4">Trò chuyện với AI về chiến lược YouTube</p>
            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">
              Chat ngay <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Phân tích kênh */}
        <button
          onClick={() => router.push('/tools/video-pipeline')}
          className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/60 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp size={28} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Video Pipeline</h3>
            <p className="text-gray-400 text-sm mb-4">Kết nối & quản lý kênh YouTube</p>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold">
              Khám phá <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Nâng cấp / Mua thêm */}
        {tierConfig.tier === 'FREE' ? (
          <button
            onClick={() => router.push('/pricing')}
            className="group relative bg-gradient-to-br from-[#CDAD5A]/20 to-amber-600/20 border border-[#CDAD5A]/30 rounded-2xl p-6 hover:border-[#CDAD5A]/60 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#CDAD5A]/20 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CDAD5A]/10 rounded-full blur-2xl group-hover:bg-[#CDAD5A]/20 transition-all"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#CDAD5A]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard size={28} className="text-[#CDAD5A]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Nâng Cấp</h3>
              <p className="text-gray-400 text-sm mb-4">Mở khóa tất cả công cụ premium</p>
              <div className="flex items-center gap-2 text-[#CDAD5A] text-sm font-bold">
                Xem bảng giá <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={() => router.push('/pricing')}
            className="group relative bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 hover:border-green-500/60 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock size={28} className="text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Gia Hạn</h3>
              <p className="text-gray-400 text-sm mb-4">Quản lý subscription & thanh toán</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                Quản lý <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        )}
      </div>

      {/* ============== MY TOOLS ============== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={20} className={tierConfig.color} />
            Công Cụ Của Tôi
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTierBadgeColor(tierConfig.tier)}`}>
              {tierConfig.tier}
            </span>
          </h2>
          {tierConfig.tier === 'FREE' && (
            <button 
              onClick={() => router.push('/pricing')}
              className="text-sm text-[#CDAD5A] hover:text-amber-400 font-medium flex items-center gap-1"
            >
              Nâng cấp để xem thêm <ChevronRight size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentTools.map((tool) => {
            const Icon = tool.icon;
            const isDesktop = tool.type === 'desktop';
            const isLocked = isDesktop && !licenseKey;
            
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className={`
                  group relative bg-[#111] border rounded-2xl p-5 text-left transition-all hover:-translate-y-1
                  ${isDesktop 
                    ? isLocked 
                      ? 'border-gray-700/30 opacity-60' 
                      : 'border-gray-700/50 hover:border-gray-600'
                    : 'border-gray-800 hover:border-gray-700'
                  }
                  ${!isLocked ? 'hover:shadow-lg cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {/* Badge */}
                {tool.badge && (
                  <span className={`absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isDesktop ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {tool.badge}
                  </span>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${tierConfig.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={isLocked ? 'text-gray-600' : tierConfig.color} />
                </div>

                {/* Content */}
                <h3 className={`font-bold mb-1 ${isLocked ? 'text-gray-500' : 'text-white'}`}>{tool.name}</h3>
                <p className={`text-xs ${isLocked ? 'text-gray-600' : 'text-gray-500'}`}>{tool.desc}</p>

                {/* Desktop App Indicator */}
                {isDesktop && licenseKey && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1 text-green-400 text-xs">
                      <CheckCircle2 size={12} />
                      License active
                    </div>
                  </div>
                )}

                {isDesktop && isLocked && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <Lock size={12} />
                      Cần license
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============== DESKTOP APPS (If has license) ============== */}
      {licenseKey && isPaidUser && (
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-3xl border border-purple-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Download size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Desktop Applications</h2>
              <p className="text-gray-400 text-sm">Tải app về máy để sử dụng sức mạnh VGA</p>
            </div>
          </div>

          {/* License Key Display */}
          <div className="bg-black/50 border border-gray-800 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Key size={12} className="text-green-400" />
                License Key
              </div>
              <div className="font-mono text-green-400 text-lg">
                {licenseKey.substring(0, 8)}...{licenseKey.substring(licenseKey.length - 4)}
              </div>
            </div>
            <button
              onClick={handleCopyLicense}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-colors"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? 'Đã copy' : 'Copy'}
            </button>
          </div>

          {/* Desktop Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Koda Studio', desc: 'Video Veo3 Render', icon: Play, color: 'cyan', route: '/tools/desktop-apps' },
              { name: 'Koda Novel', desc: 'Chuyển truyện thành phim', icon: FileText, color: 'purple', route: '/tools/desktop-apps' },
              { name: 'Koda Factory', desc: 'Multi-workers', icon: Users, color: 'amber', route: '/tools/desktop-apps' },
            ].map((app, idx) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.name}
                  onClick={() => router.push(app.route)}
                  className="bg-white/5 hover:bg-white/10 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-all group text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      app.color === 'cyan' ? 'bg-cyan-500/20' : app.color === 'purple' ? 'bg-purple-500/20' : 'bg-amber-500/20'
                    }`}>
                      <Icon size={20} className={
                        app.color === 'cyan' ? 'text-cyan-400' : app.color === 'purple' ? 'text-purple-400' : 'text-amber-400'
                      } />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.name}</h4>
                      <p className="text-xs text-gray-500">{app.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-white transition-colors">
                    <Download size={12} />
                    Xem chi tiết
                    <ArrowUpRight size={12} className="ml-auto" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============== TIPS / Getting Started ============== */}
      {tierConfig.tier === 'FREE' && (
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Bắt đầu với SeenYT</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>1. Sử dụng <span className="text-white font-medium">Niche Radar</span> để tìm ngách tiềm năng</p>
                <p>2. Viết kịch bản với <span className="text-white font-medium">Script Studio</span></p>
                <p>3. Tối ưu video với <span className="text-white font-medium">SEO Tool</span></p>
              </div>
              <button
                onClick={() => router.push('/pricing')}
                className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-bold transition-colors"
              >
                Nâng cấp lên Creator để mở khóa thêm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

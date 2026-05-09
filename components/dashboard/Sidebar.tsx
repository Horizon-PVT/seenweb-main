// components/dashboard/Sidebar.tsx - Clean & Modern Sidebar

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { 
  Home, MessageSquare, TrendingUp, Settings, CreditCard, 
  LogOut, ChevronRight, Video, FileText, Search, 
  Sparkles, Download, Key, ChevronLeft, Star, Zap,
  BarChart3, Globe, Users, Clock, ShoppingBag, Share2
} from 'lucide-react';
import CheckoutModal from './CheckoutModal';

interface SidebarProps {
    userRole?: string;
    activeTool?: string | null;
    onToolSelect?: (toolId: string) => void;
}

export default function Sidebar({ userRole = 'FREE', activeTool, onToolSelect }: SidebarProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation('common');
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Get avatar from session
    const userAvatar = session?.user?.image;
    const userName = session?.user?.name || '';

    // Get membershipExpiry
    const membershipExpiry = (session?.user as any)?.membershipExpiry;
    let daysLeftText = '';
    if (membershipExpiry && userRole !== 'FREE' && userRole !== 'ADMIN') {
        const diff = new Date(membershipExpiry).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        if (days > 0) {
            daysLeftText = `${days}d`;
        } else {
            daysLeftText = 'Hết hạn';
        }
    }

    // Get tier color
    const getTierColor = (role: string) => {
        const colors: Record<string, { bg: string; text: string; border: string }> = {
            'FREE': { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
            'STARTER': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
            'CREATOR': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
            'FACTORY': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
            'AGENCY': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
            'ENTERPRISE': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
            'ADMIN': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
        };
        return colors[role] || colors.FREE;
    };

    const tierColor = getTierColor(userRole);

    // Navigation items
    const navItems = [
        { id: 'home', label: 'Trang chủ', icon: Home, path: '/dashboard', exact: true },
        { id: 'ai-coach', label: 'AI Coach', icon: MessageSquare, path: '/dashboard/ai-coach', badge: 'Beta', badgeColor: 'bg-purple-500/20 text-purple-400' },
        { id: 'trends', label: 'Xu hướng', icon: TrendingUp, path: '/dashboard/trends' },
        { id: 'marketplace', label: 'Chợ Kênh', icon: ShoppingBag, path: '/tools/marketplace' },
        { id: 'affiliate', label: 'Affiliate', icon: Share2, path: '/tools/affiliate-partner' },
    ];

    const toolItems = [
        { id: 'niche-radar', label: 'Niche Radar', icon: Search, toolId: 'niche-radar' },
        { id: 'script-studio', label: 'Script Studio', icon: FileText, toolId: 'script-studio' },
        { id: 'video-pipeline', label: 'Video Pipeline', icon: Video, path: '/tools/video-pipeline' },
        { id: 'intelligence', label: 'Intelligence Hub', icon: Sparkles, path: '/tools/intelligence-hub' },
        { id: 'channels', label: 'Kênh của tôi', icon: BarChart3, path: '/dashboard/trends' },
    ];

    const isActive = (item: any) => {
        if (item.path) {
            if (item.exact) return router.pathname === item.path;
            return router.pathname.startsWith(item.path);
        }
        if (item.toolId) return activeTool === item.toolId;
        return false;
    };

    const handleNavClick = (item: any) => {
        if (item.path) {
            router.push(item.path);
        }
        if (item.toolId && onToolSelect) {
            onToolSelect(item.toolId);
        }
    };

    return (
        <>
            <div 
                className={`bg-[#0D0D10] border-r border-gray-800 flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
            >

                {/* Logo */}
                <div className="p-5 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <img
                            src="/seenyt-logo.jpg"
                            alt="SeenYT"
                            className="w-10 h-10 rounded-xl shadow-lg"
                        />
                        {!isCollapsed && (
                            <span className="text-xl font-bold text-white tracking-wide">SeenYT</span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button 
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={18} className="text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    
                    {/* Main Nav */}
                    <div className="space-y-1">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const active = isActive(item);
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item)}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                        ${active 
                                            ? 'bg-[#CDAD5A]/10 text-[#CDAD5A] font-bold border border-[#CDAD5A]/20' 
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                        }
                                    `}
                                >
                                    <Icon size={20} strokeWidth={active ? 2 : 1.5} className={active ? 'text-[#CDAD5A]' : ''} />
                                    {!isCollapsed && (
                                        <>
                                            <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                                            {item.badge && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${item.badgeColor}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-800/50 my-4"></div>

                    {/* Quick Tools */}
                    {!isCollapsed && (
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 px-3 tracking-wider">
                            Công cụ nhanh
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        {toolItems.map(item => {
                            const Icon = item.icon;
                            const active = isActive(item);
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item)}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                        ${active 
                                            ? 'bg-white/10 text-white font-bold border border-white/5' 
                                            : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'
                                        }
                                    `}
                                >
                                    <Icon size={18} strokeWidth={1.5} />
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium">{item.label}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-800/50 my-4"></div>

                    {/* More Links */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setShowCheckout(true)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <CreditCard size={18} strokeWidth={1.5} />
                            {!isCollapsed && <span className="text-sm font-medium">Mua thêm kênh</span>}
                        </button>

                        <Link
                            href="/pricing"
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <Star size={18} strokeWidth={1.5} />
                            {!isCollapsed && <span className="text-sm font-medium">Bảng giá</span>}
                        </Link>

                        <Link
                            href="/guides"
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <Download size={18} strokeWidth={1.5} />
                            {!isCollapsed && <span className="text-sm font-medium">Hướng dẫn</span>}
                        </Link>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        {/* Avatar - click to show popup */}
                        <button
                            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                            className="relative"
                        >
                            {userAvatar ? (
                                <img 
                                    src={userAvatar} 
                                    alt="Avatar" 
                                    className="w-10 h-10 rounded-xl object-cover hover:ring-2 hover:ring-white/20 transition-all"
                                />
                            ) : (
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm ${tierColor.bg} hover:ring-2 hover:ring-white/20 transition-all`}>
                                    {userName.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            {!isCollapsed && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0D0D10]"></div>
                            )}
                        </button>
                        
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">
                                    {userName || 'User'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${tierColor.text} font-bold uppercase`}>
                                        {userRole}
                                    </span>
                                    {daysLeftText && (
                                        <span className="text-xs text-gray-500">
                                            • {daysLeftText}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Settings Icon */}
                        <button
                            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Settings size={16} className="text-gray-500 hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Popup - Fixed position, outside sidebar */}
            {showSettingsMenu && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-[100]"
                        onClick={() => setShowSettingsMenu(false)}
                    />
                    
                    {/* Popup Menu */}
                    <div 
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-[#1a1a20] border border-gray-700 rounded-2xl shadow-2xl p-3 z-[110] animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* User Info Header */}
                        <div className="p-3 border-b border-gray-800 mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${tierColor.bg}`}>
                                    {userRole.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-white">
                                        {session?.user?.name || 'User'}
                                    </div>
                                    <div className={`text-xs ${tierColor.text} font-bold uppercase`}>
                                        {userRole} Plan
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Menu Items */}
                        <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-colors"
                            onClick={() => setShowSettingsMenu(false)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Settings size={16} className="text-blue-400" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Cài đặt tài khoản</div>
                                <div className="text-xs text-gray-500">Hồ sơ, avatar, thông tin</div>
                            </div>
                        </Link>
                        
                        <Link
                            href="/dashboard/subscription"
                            className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-colors"
                            onClick={() => setShowSettingsMenu(false)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <CreditCard size={16} className="text-amber-400" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Quản lý gói</div>
                                <div className="text-xs text-gray-500">Nâng cấp, gia hạn, thanh toán</div>
                            </div>
                        </Link>
                        
                        {daysLeftText && userRole !== 'ADMIN' && (
                            <div className="px-3 py-2 bg-amber-500/10 rounded-lg mx-1 mb-2">
                                <div className="text-xs text-amber-400">
                                    <Clock size={12} className="inline mr-1" />
                                    Còn lại: <span className="font-bold">{daysLeftText}</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="h-px bg-gray-800 my-2"></div>
                        
                        <button
                            onClick={() => {
                                setShowSettingsMenu(false);
                                signOut({ callbackUrl: '/' });
                            }}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <LogOut size={16} className="text-red-400" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-red-400">Đăng xuất</div>
                            </div>
                        </button>
                    </div>
                </>
            )}

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                requiredPlan={userRole}
                userEmail={session?.user?.email || ''}
            />
        </>
    );
}

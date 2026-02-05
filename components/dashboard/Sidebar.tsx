import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { Home, Globe, ChevronLeft, ChevronRight, LogOut, Settings, CreditCard, Zap, TrendingUp, Search, BookOpen } from 'lucide-react';
import { TOOLS } from '@/lib/tool-config';
import { hasMinRole } from '@/lib/tab-access';
import LockedFeatureModal from './LockedFeatureModal';
import CheckoutModal from './CheckoutModal'; // Import CheckoutModal

interface SidebarProps {
    userRole?: string;
    activeTool?: string | null;
    onToolSelect?: (toolId: string) => void;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}

export default function Sidebar({ userRole = 'FREE', activeTool, onToolSelect, isCollapsed = false, toggleCollapse }: SidebarProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation('common');
    const [showLockedModal, setShowLockedModal] = useState(false);
    const [lockedMessage, setLockedMessage] = useState('');
    const [showCheckout, setShowCheckout] = useState(false); // State for Checkout Modal
    const [showSettingsMenu, setShowSettingsMenu] = useState(false); // State for Settings Dropdown

    const handleToolClick = (tool: typeof TOOLS[0]) => {
        // Check permission
        if (!hasMinRole(userRole, tool.minRole)) {
            setLockedMessage(t('sidebar.locked_message', { feature: tool.label, role: tool.minRole }));
            setShowLockedModal(true);
            return;
        }

        // Access granted
        if (onToolSelect) {
            onToolSelect(tool.id);
        }
    };

    const handleHomeClick = () => {
        if (onToolSelect) {
            onToolSelect(''); // Clear active tool to return to dashboard
        }
        router.push('/dashboard');
    };

    return (
        <>
            <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0D0D10] border-r border-gray-800 flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300`}>
                {/* Header Logo */}
                <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-2 cursor-pointer relative group`} onClick={handleHomeClick}>
                    <img
                        src="/seenyt-logo.jpg"
                        alt="SeenYT Logo"
                        className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(205,173,90,0.3)] object-cover"
                    />
                    {!isCollapsed && <span className="text-xl font-bold text-white tracking-wide whitespace-nowrap">SeenYT</span>}

                    {/* Collapse Button - Visible on hover content area mostly, but let's put it absolute */}
                    {toggleCollapse && (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
                            className="absolute -right-3 top-7 w-6 h-6 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all z-50 shadow-lg"
                            title={isCollapsed ? "Expand" : "Collapse"}
                        >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>
                    )}
                </div>

                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.05);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #444;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #666;
                    }
                `}</style>
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-20">

                    {/* Website Link (Moved Up) */}
                    <a
                        href="https://www.seenyt.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700 transition-all duration-200 cursor-pointer group mb-1
                        `}
                        title="Website"
                    >
                        <Globe size={20} strokeWidth={1.5} />
                        {!isCollapsed && <span className="text-sm font-medium">Trang chủ</span>}
                    </a>

                    {/* Dashboard Home */}
                    <div
                        onClick={handleHomeClick}
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 cursor-pointer group mb-1
                            ${!activeTool && router.pathname === '/dashboard'
                                ? 'bg-[#CDAD5A]/10 text-[#CDAD5A] font-bold border border-[#CDAD5A]/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700'
                            }
                        `}
                        title={t('sidebar.overview')}
                    >
                        <Home size={20} strokeWidth={1.5} />
                        {!isCollapsed && <span className="text-sm font-medium">{t('sidebar.overview')}</span>}
                    </div>

                    {/* AI Coach */}
                    <div
                        onClick={() => router.push('/dashboard/ai-coach')}
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 cursor-pointer group mb-1
                            ${router.pathname === '/dashboard/ai-coach'
                                ? 'bg-purple-600/20 text-purple-400 font-bold border border-purple-500/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700'
                            }
                        `}
                        title="AI Coach"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {!isCollapsed && <span className="text-sm font-medium">AI Coach</span>}
                    </div>

                    {/* Upgrade Pro - Moved UP */}
                    <div
                        onClick={() => setShowCheckout(true)}
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl cursor-pointer transition-all duration-300 group mb-2
                            bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-400 hover:text-white hover:from-purple-600 hover:to-blue-600 border border-purple-500/20 hover:border-purple-500/50
                        `}
                        title="Nâng cấp Pro"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap">Nâng cấp Pro</span>}
                    </div>

                    {/* Install Extension */}
                    <a
                        href="https://chromewebstore.google.com/detail/seenyt-youtube-seo-ai-gro/ajjimohhpmkhgagldoegomjobgpkffdc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl cursor-pointer transition-all duration-300 group mb-4
                            bg-gradient-to-r from-green-600/10 to-emerald-600/10 text-green-400 hover:text-white hover:from-green-600 hover:to-emerald-600 border border-green-500/20 hover:border-green-500/50
                        `}
                        title="Cài Extension"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Cài Extension</span>}
                    </a>

                    {/* Tools Section */}
                    {!isCollapsed && <div className="px-4 text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-wider">{t('sidebar.my_tools')}</div>}
                    {isCollapsed && <div className="h-px bg-gray-800 mx-2 my-2"></div>}

                    {/* Grouped Tools - Scrollable */}
                    <div className="max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                        {[
                            { id: 'startup', label: 'Khởi động', icon: Zap },
                            { id: 'breakthrough', label: 'Vượt rào', icon: TrendingUp },
                            { id: 'research', label: 'Nghiên cứu', icon: Search },
                            { id: 'learning', label: 'Học tập', icon: BookOpen },
                            { id: 'dev', label: 'Đang phát triển', icon: Settings }
                        ].map((group) => {
                            const groupTools = TOOLS.filter(t => t.group === group.id);
                            if (groupTools.length === 0) return null;

                            return (
                                <div key={group.id} className="mb-2">
                                    {!isCollapsed && (
                                        <div className="px-4 text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-2 tracking-wider opacity-70">
                                            {group.label}
                                        </div>
                                    )}
                                    {groupTools.map((tool) => {
                                        const isActive = activeTool === tool.id;
                                        const Icon = tool.icon;

                                        return (
                                            <div
                                                key={tool.id}
                                                onClick={() => handleToolClick(tool)}
                                                className={`
                                                flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-2 rounded-xl transition-all duration-200 cursor-pointer group relative mb-0.5
                                                ${isActive
                                                        ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-white font-medium border border-purple-500/30'
                                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                    }
                                            `}
                                                title={tool.label}
                                            >
                                                <div className={`text-lg ${isActive ? 'text-white' : (tool.color || 'text-gray-400')} transition-colors`}>
                                                    <Icon size={18} />
                                                </div>
                                                {!isCollapsed && <span className="flex-1 text-sm truncate">{tool.label}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    <div className="h-px bg-gray-800 my-4 mx-4"></div>
                </nav>

                {/* User Mini Profile & Settings */}
                <div className="p-4 border-t border-gray-800 bg-[#0a0a0c] relative">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-white ${userRole === 'VIP' ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-gradient-to-tr from-gray-700 to-gray-600'}`}>
                            {userRole.charAt(0)}
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-bold text-white truncate">{t('sidebar.my_account')}</div>
                                <div className="text-[10px] text-gray-500 truncate font-mono uppercase">{userRole} PLAN</div>
                            </div>
                        )}

                        {/* Settings / Logout Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                className={`text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800 ${isCollapsed ? 'hidden group-hover:block absolute left-8 bottom-0 bg-[#1a1a20] border border-gray-700 w-max' : ''}`}
                            >
                                <Settings size={18} />
                            </button>

                            {/* Settings Dropdown */}
                            {showSettingsMenu && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1a1a20] border border-gray-700 rounded-xl shadow-2xl p-1 z-[60] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                    <div className="px-3 py-2 border-b border-gray-700/50 mb-1">
                                        <p className="text-xs font-bold text-white">Cài đặt tài khoản</p>
                                    </div>
                                    <Link href="/pricing" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors">
                                        <CreditCard size={14} /> Quản lý gói cước
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                                    >
                                        <LogOut size={14} /> Đăng xuất
                                    </button>
                                </div>
                            )}

                            {/* Backdrop to close menu */}
                            {showSettingsMenu && (
                                <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowSettingsMenu(false)} />
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {/* Modals */}
            <LockedFeatureModal
                isOpen={showLockedModal}
                onClose={() => setShowLockedModal(false)}
                title={t('sidebar.premium_feature')}
                message={lockedMessage}
            />

            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                currentPlan={userRole}
                currentChannelCount={userRole === 'VIP' ? 10 : userRole === 'SUPER' ? 2 : 1}
                userEmail={session?.user?.email || ''}
            />
        </>
    );
}

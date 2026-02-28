import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { Home, Globe, ChevronLeft, ChevronRight, LogOut, Settings, CreditCard, ChevronDown, TrendingUp, Database, ShoppingCart, PlayCircle } from 'lucide-react';
import { TOOLS } from '@/lib/tool-config';
import { hasMinRole } from '@/lib/tab-access';
import LockedFeatureModal from './LockedFeatureModal';
import CheckoutModal from './CheckoutModal';

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
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    // Accordion State
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        research: true,
        create: false,
        niche: false,
        dev: false
    });

    const toggleGroup = (groupId: string) => {
        if (isCollapsed && toggleCollapse) {
            toggleCollapse(); // Expand if a group is clicked while collapsed
        }
        setOpenGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const handleToolClick = (tool: typeof TOOLS[0]) => {
        if (!hasMinRole(userRole, tool.minRole)) {
            setLockedMessage(t('sidebar.locked_message', { feature: tool.label, role: tool.minRole }));
            setShowLockedModal(true);
            return;
        }

        if (onToolSelect) {
            onToolSelect(tool.id);
        }
    };

    const handleHomeClick = () => {
        if (onToolSelect) {
            onToolSelect('');
        }
        router.push('/dashboard');
    };

    const accordionGroups = [
        { id: 'research', label: 'CHIẾN LƯỢC & NGHIÊN CỨU' },
        { id: 'create', label: 'SẢN XUẤT NỘI DUNG AI' },
        { id: 'niche', label: 'Ngách' },
        { id: 'dev', label: 'Đang phát triển' }
    ];

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
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.05);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255,255,255,0.1);
                    }
                `}</style>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-20">

                    {/* Website Link */}
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

                    {/* General Dashboard/Home */}
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
                                ? 'bg-[#1C2029] text-white font-bold border border-[#2A2E39]'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700'
                            }
                        `}
                        title="AI Coach"
                    >
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-500/30 flex-shrink-0 group-hover:border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_12px_rgba(168,85,247,0.6)] transition-all">
                            <img src="/images/ai-coach.png" alt="AI Coach" className="w-full h-full object-cover" />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium">AI Coach <span className="ml-2 text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider relative -top-px">Beta</span></span>}
                    </div>

                    {/* Explore Section */}
                    {!isCollapsed && <div className="px-4 text-[10px] font-bold text-gray-600 uppercase mb-2 mt-4 tracking-wider">KHÁM PHÁ</div>}
                    <div
                        onClick={() => router.push('/dashboard/trends')}
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 cursor-pointer group mb-1
                            ${router.pathname === '/dashboard/trends'
                                ? 'bg-pink-600/20 text-pink-400 font-bold border border-pink-500/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700'
                            }
                        `}
                        title="Xu hướng"
                    >
                        <TrendingUp size={20} strokeWidth={1.5} />
                        {!isCollapsed && <span className="text-sm font-medium">Xu hướng</span>}
                    </div>

                    <div className="h-px bg-gray-800/50 my-2 mx-4"></div>

                    {/* ACCORDION GROUPS */}
                    <div className="flex flex-col gap-1 mt-2">
                        {accordionGroups.map(group => {
                            const groupTools = TOOLS.filter(t => t.group === group.id);
                            if (groupTools.length === 0) return null;
                            const isOpen = openGroups[group.id];

                            return (
                                <div key={group.id} className="flex flex-col">
                                    {/* Accordion Header */}
                                    <div
                                        onClick={() => toggleGroup(group.id)}
                                        className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-lg hover:bg-white/5 transition-colors ${isOpen ? 'text-gray-200' : 'text-gray-400'}`}
                                    >
                                        {!isCollapsed ? (
                                            <>
                                                <span className="text-[12px] font-semibold tracking-wide">{group.label}</span>
                                                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-gray-300' : 'text-gray-500'}`} />
                                            </>
                                        ) : (
                                            <div className="w-full flex justify-center">
                                                <ChevronRight size={16} className={`${isOpen ? 'rotate-90 text-gray-300' : 'text-gray-500'}`} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Accordion Body */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && !isCollapsed ? 'max-h-[800px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                                        <div className="flex flex-col gap-0.5 border-l border-gray-800 ml-5 pl-2">
                                            {groupTools.map(tool => {
                                                const isActive = activeTool === tool.id;
                                                const Icon = tool.icon;
                                                return (
                                                    <div
                                                        key={tool.id}
                                                        onClick={() => handleToolClick(tool)}
                                                        className={`
                                                            flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group
                                                            ${isActive
                                                                ? 'bg-white/5 text-white font-medium'
                                                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                                            }
                                                        `}
                                                        title={tool.label}
                                                    >
                                                        <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className={`${isActive ? (tool.color || 'text-white') : 'text-gray-500 group-hover:text-gray-300'}`} />
                                                        <span className="text-[13px] font-normal truncate flex-1">{tool.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* NEW: Hệ sinh thái SeenYT */}
                        <div className="flex flex-col mt-2">
                            <div
                                onClick={() => setOpenGroups(prev => ({ ...prev, ecosystem: !prev.ecosystem }))}
                                className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-lg hover:bg-white/5 transition-colors ${openGroups.ecosystem ? 'text-blue-400' : 'text-gray-400'}`}
                            >
                                {!isCollapsed ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-semibold tracking-wide text-blue-400">HỆ SINH THÁI SEENYT</span>
                                        </div>
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${openGroups.ecosystem ? 'rotate-180 text-blue-400' : 'text-gray-500'}`} />
                                    </>
                                ) : (
                                    <div className="w-full flex justify-center text-blue-400">
                                        <ChevronRight size={16} className={`${openGroups.ecosystem ? 'rotate-90 text-blue-400' : 'text-blue-500/70'}`} />
                                    </div>
                                )}
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openGroups.ecosystem && !isCollapsed ? 'max-h-[300px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                                <div className="flex flex-col gap-0.5 border-l border-blue-900/50 ml-5 pl-2">
                                    <Link href="/academy" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group text-gray-400 hover:text-white hover:bg-blue-500/10" title="Academy">
                                        <span className="text-[13px] font-normal truncate flex-1">Academy</span>
                                    </Link>
                                    <Link href="/affiliate" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group text-gray-400 hover:text-white hover:bg-blue-500/10" title="Affiliate">
                                        <span className="text-[13px] font-normal truncate flex-1">Affiliate</span>
                                    </Link>
                                    <Link href="/coaching" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group text-gray-400 hover:text-white hover:bg-blue-500/10" title="Huấn luyện">
                                        <span className="text-[13px] font-normal truncate flex-1">Huấn luyện</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-800/50 my-4 mx-4"></div>

                    {/* Bottom Utility Links */}
                    <div
                        onClick={() => setShowCheckout(true)}
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl cursor-pointer transition-all duration-300 group mb-1
                            text-purple-400 hover:text-purple-300 hover:bg-purple-500/10
                        `}
                        title="Mua thêm kênh"
                    >
                        <ShoppingCart size={20} strokeWidth={1.5} />
                        {!isCollapsed && <span className="text-sm font-medium">Mua thêm kênh</span>}
                    </div>

                    <Link
                        href="/pricing"
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl cursor-pointer transition-all duration-300 group mb-1
                            text-gray-400 hover:text-white hover:bg-gray-800
                        `}
                        title="Bảng giá"
                    >
                        <CreditCard size={20} strokeWidth={1.5} className="group-hover:text-emerald-400 transition-colors" />
                        {!isCollapsed && <span className="text-sm font-medium">Bảng giá</span>}
                    </Link>

                    <Link
                        href="/guides"
                        className={`
                            flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl cursor-pointer transition-all duration-300 group mb-1
                            text-gray-400 hover:text-white hover:bg-gray-800
                        `}
                        title="Hướng dẫn sử dụng tools"
                    >
                        <PlayCircle size={20} strokeWidth={1.5} className="group-hover:text-red-400 transition-colors" />
                        {!isCollapsed && <span className="text-sm font-medium">Hướng dẫn sử dụng tools</span>}
                    </Link>

                </nav>

                {/* User Mini Profile & Settings */}
                <div className="p-4 border-t border-gray-800 bg-[#0a0a0c] relative">
                    <div
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer group hover:bg-gray-800/50 p-2 -m-2 rounded-xl transition-all select-none`}
                        onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    >
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-white ${userRole === 'PRO' ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-gradient-to-tr from-gray-700 to-gray-600'}`}>
                            {userRole.charAt(0)}
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-bold text-white truncate group-hover:text-gray-300 transition-colors">{t('sidebar.my_account')}</div>
                                <div className="text-[10px] text-gray-500 truncate font-mono uppercase">{userRole} PLAN</div>
                            </div>
                        )}

                        {/* Settings / Logout Trigger */}
                        <div className="relative">
                            <button
                                className={`text-gray-500 group-hover:text-white transition-colors p-1.5 rounded-lg ${isCollapsed ? 'hidden group-hover:block absolute left-8 bottom-0 bg-[#1a1a20] border border-gray-700 w-max' : ''}`}
                            >
                                <Settings size={18} />
                            </button>

                            {/* Settings Dropdown */}
                            {showSettingsMenu && (
                                <div
                                    className="absolute bottom-full right-0 mb-2 w-48 bg-[#1a1a20] border border-gray-700 rounded-xl shadow-2xl p-1 z-[60] overflow-hidden animate-in fade-in slide-in-from-bottom-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link
                                        href="/dashboard/settings"
                                        className="block px-3 py-2 border-b border-gray-700/50 mb-1 hover:bg-gray-700/30 transition-colors"
                                        onClick={() => setShowSettingsMenu(false)}
                                    >
                                        <p className="text-xs font-bold text-white">Cài đặt tài khoản</p>
                                    </Link>
                                    <Link
                                        href="/pricing"
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
                                        onClick={() => setShowSettingsMenu(false)}
                                    >
                                        <CreditCard size={14} /> Quản lý gói cước
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowSettingsMenu(false);
                                            signOut({ callbackUrl: '/' });
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                                    >
                                        <LogOut size={14} /> Đăng xuất
                                    </button>
                                </div>
                            )}

                            {/* Backdrop to close menu */}
                            {showSettingsMenu && (
                                <div
                                    className="fixed inset-0 z-[55] cursor-default"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSettingsMenu(false);
                                    }}
                                />
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
                currentChannelCount={userRole === 'PRO' ? 2 : userRole === 'BASIC' ? 1 : 0}
                userEmail={session?.user?.email || ''}
            />
        </>
    );
}

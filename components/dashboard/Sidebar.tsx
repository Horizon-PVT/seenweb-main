import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { Home, Globe } from 'lucide-react';
import { TOOLS } from '@/lib/tool-config';
import { hasMinRole } from '@/lib/tab-access';
import LockedFeatureModal from './LockedFeatureModal';

interface SidebarProps {
    userRole?: string;
    activeTool?: string | null;
    onToolSelect?: (toolId: string) => void;
}

export default function Sidebar({ userRole = 'FREE', activeTool, onToolSelect }: SidebarProps) {
    const router = useRouter();
    const [showLockedModal, setShowLockedModal] = useState(false);
    const [lockedMessage, setLockedMessage] = useState('');

    const handleToolClick = (tool: typeof TOOLS[0]) => {
        // Check permission
        if (!hasMinRole(userRole, tool.minRole)) {
            setLockedMessage(`Tính năng ${tool.label} chỉ dành cho gói ${tool.minRole} trở lên. Vui lòng nâng cấp để sử dụng!`);
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
            <div className="w-64 bg-[#0D0D10] border-r border-gray-800 flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-50">
                <div className="p-6 flex items-center gap-3 mb-2 cursor-pointer" onClick={handleHomeClick}>
                    <img
                        src="/seenyt-logo.jpg"
                        alt="SeenYT Logo"
                        className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(205,173,90,0.3)] object-cover"
                    />
                    <span className="text-xl font-bold text-white tracking-wide">SeenYT</span>
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

                    {/* Dashboard Home & External Link */}
                    <div className="flex gap-2 px-4 mb-4">
                        {/* Dashboard Overview */}
                        <div
                            onClick={handleHomeClick}
                            className={`
                  flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                  ${!activeTool && router.pathname === '/dashboard'
                                    ? 'bg-[#CDAD5A]/10 text-[#CDAD5A] font-bold border border-[#CDAD5A]/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700'
                                }
                `}
                        >
                            <Home size={20} strokeWidth={1.5} />
                            <span className="text-[10px] uppercase tracking-widest mt-1">Tổng quan</span>
                        </div>

                        {/* External Website Link */}
                        <a
                            href="https://www.seenyt.net/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700 transition-all duration-200 cursor-pointer group"
                        >
                            <Globe size={20} strokeWidth={1.5} />
                            <span className="text-[10px] uppercase tracking-widest mt-1">Website</span>
                        </a>
                    </div>

                    <div className="px-4 text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-wider">CÔNG CỤ CỦA TÔI</div>

                    {/* Dynamic Tools */}
                    {TOOLS.map((tool) => {
                        const isLocked = !hasMinRole(userRole, tool.minRole);
                        const isActive = activeTool === tool.id;

                        // Render icon correctly
                        const Icon = tool.icon;

                        return (
                            <div
                                key={tool.id}
                                onClick={() => handleToolClick(tool)}
                                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative
                  ${isActive
                                        ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-white font-medium border border-purple-500/30'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }
                `}
                            >
                                <div className={`text-lg ${isActive ? 'text-white' : (tool.color || 'text-gray-400')} transition-colors`}>
                                    <Icon size={20} />
                                </div>
                                <span className="flex-1 text-sm">{tool.label}</span>

                                {isLocked && (
                                    // Hidden lock icon as requested, but logic stays
                                    <></>
                                )}
                            </div>
                        );
                    })}

                    <div className="h-px bg-gray-800 my-4 mx-4"></div>

                    <div className="px-4 text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-wider">TÀI KHOẢN</div>
                    <Link href="/pricing" className="flex items-center gap-3 px-4 py-3 rounded-xl text-yellow-500 hover:bg-yellow-500/10 transition-all font-bold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span>Nâng cấp VIP</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-900/10 hover:text-red-500 transition-all text-sm font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>Đăng xuất</span>
                    </button>
                </nav>

                {/* User Mini Profile */}
                <div className="p-4 border-t border-gray-800 bg-[#0a0a0c]">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${userRole === 'VIP' ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-gradient-to-tr from-gray-700 to-gray-600'}`}>
                            {userRole.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-bold text-white truncate">Tài khoản của tôi</div>
                            <div className="text-[10px] text-gray-500 truncate font-mono uppercase">{userRole} PLAN</div>
                        </div>
                        {/* Settings Icon */}
                        <button className="text-gray-500 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                </div>
            </div >

            {/* Locked Feature Modal handled within Sidebar for access control feedback */}
            < LockedFeatureModal
                isOpen={showLockedModal}
                onClose={() => setShowLockedModal(false)}
                title="Tính năng cao cấp"
                message={lockedMessage}
            />
        </>
    );
}

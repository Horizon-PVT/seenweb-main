import { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    Video,
    ShoppingCart,
    Users,
    Tag,
    Settings,
    Menu,
    X,
    LogOut,
    BarChart,
    Gift,
    Wrench,
    TrendingUp,
    ChevronRight,
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
    session?: any;
}

interface NavItem {
    label: string;
    href: string;
    icon: any;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: 'Tổng quan',
        items: [
            { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Content',
        items: [
            { label: 'Blog', href: '/admin/blog', icon: FileText },
            { label: 'Ebook', href: '/admin/ebooks', icon: BookOpen },
            { label: 'Video', href: '/admin/videos', icon: Video },
        ],
    },
    {
        title: 'Kinh doanh',
        items: [
            { label: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
            { label: 'Affiliate', href: '/admin/affiliate', icon: Users },
            { label: 'Khuyến mại', href: '/admin/promotions', icon: Tag },
            { label: 'Tặng Bonus', href: '/admin/bonus-days', icon: Gift },
            { label: 'Attribution', href: '/admin/attribution', icon: BarChart },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { label: 'Cài đặt', href: '/admin/settings', icon: Settings },
        ],
    },
];

export default function AdminLayout({ children, session }: AdminLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const router = useRouter();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

    const isActive = (href: string) => {
        if (href === '/admin') {
            return router.pathname === '/admin';
        }
        return router.pathname.startsWith(href);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    const handleMouseEnter = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setHovered(true);
    };

    const handleMouseLeave = () => {
        hoverTimerRef.current = setTimeout(() => {
            setHovered(false);
        }, 200); // slight delay to prevent flicker
    };

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, []);

    const expanded = hovered;

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ====== DESKTOP SIDEBAR: auto-show on hover ====== */}
            <aside
                ref={sidebarRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out ${
                    expanded ? 'w-64' : 'w-16'
                }`}
                style={{ overflow: 'visible' }}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Logo */}
                    <div className={`flex items-center h-16 border-b border-gray-700 ${expanded ? 'px-6 justify-start space-x-2' : 'px-0 justify-center'}`}>
                        <Link href="/admin" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#008080] to-[#CDAD5A] rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">▶️</span>
                            </div>
                            {expanded && (
                                <span className="text-xl font-bold text-[#CDAD5A] whitespace-nowrap transition-opacity duration-200">
                                    SeenYT
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin">
                        {navGroups.map((group) => (
                            <div key={group.title}>
                                {expanded && (
                                    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 whitespace-nowrap">
                                        {group.title}
                                    </h3>
                                )}
                                <ul className="space-y-1 px-2">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    title={!expanded ? item.label : undefined}
                                                    className={`flex items-center rounded-lg transition-all duration-200 ${
                                                        expanded ? 'px-3 py-2 space-x-3' : 'px-0 py-2 justify-center'
                                                    } ${
                                                        active
                                                            ? 'bg-[#008080] text-white'
                                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                    }`}
                                                >
                                                    <Icon size={20} className="flex-shrink-0" />
                                                    {expanded && (
                                                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* User info & Logout */}
                    <div className="border-t border-gray-700 p-2">
                        {expanded ? (
                            <>
                                <div className="flex items-center space-x-3 mb-3 px-2">
                                    <div className="w-10 h-10 bg-[#CDAD5A] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {session?.user?.email?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {session?.user?.name || 'Admin'}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {session?.user?.email || ''}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>Đăng xuất</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleLogout}
                                title="Đăng xuất"
                                className="w-full flex items-center justify-center py-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Hover indicator strip (visual cue to hover) */}
                {!expanded && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#CDAD5A]/40 rounded-l-full" />
                )}
            </aside>

            {/* ====== MOBILE SIDEBAR: slide in/out ====== */}
            <aside
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo + Close */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
                        <Link href="/admin" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#008080] to-[#CDAD5A] rounded-lg flex items-center justify-center">
                                <span className="text-2xl">▶️</span>
                            </div>
                            <span className="text-xl font-bold text-[#CDAD5A]">SeenYT</span>
                        </Link>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                        {navGroups.map((group) => (
                            <div key={group.title}>
                                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    {group.title}
                                </h3>
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                                        active
                                                            ? 'bg-[#008080] text-white'
                                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                    }`}
                                                >
                                                    <Icon size={20} />
                                                    <span className="font-medium">{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* User info & Logout */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-[#CDAD5A] rounded-full flex items-center justify-center text-white font-bold">
                                {session?.user?.email?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {session?.user?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {session?.user?.email || ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content — add left margin matching collapsed sidebar width */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-16">
                {/* Topbar */}
                <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-white">Quản trị hệ thống</h1>
                    </div>
                    <div className="text-sm text-gray-400">
                        {session?.user?.email || ''}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

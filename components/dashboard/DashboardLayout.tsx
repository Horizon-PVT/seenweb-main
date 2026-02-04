import React from 'react';
import Sidebar from './Sidebar';
import Head from 'next/head';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole?: string;
    title?: string;
    activeTool?: string | null;
    onToolSelect?: (toolId: string) => void;
}

export default function DashboardLayout({
    children,
    userRole,
    title = 'Dashboard - SeenYT',
    activeTool,
    onToolSelect
}: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div className="min-h-screen bg-black text-white font-sans flex">
            <Head>
                <title>{title}</title>
                <meta name="robots" content="noindex" />
            </Head>

            {/* Sidebar (Desktop) */}
            <div className={`hidden md:block ${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-all duration-300`}>
                <Sidebar
                    userRole={userRole}
                    activeTool={activeTool}
                    onToolSelect={onToolSelect}
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 bg-black min-h-screen">
                {/* Mobile Header Placeholder (Can add hamburger here later) */}

                {/* Content Container */}
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

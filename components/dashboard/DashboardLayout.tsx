import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Head from 'next/head';
import AICoachChat from '../ai-coach/AICoachChat';
import ToolGuide from '../ToolGuide';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole?: string;
    title?: string;
    activeTool?: string | null;
    onToolSelect?: (toolId: string | null) => void;
}

export default function DashboardLayout({
    children,
    userRole,
    title = 'Dashboard - SeenYT',
    activeTool,
    onToolSelect
}: DashboardLayoutProps) {
    // The Sidebar handles its own hover expanding state.
    // The main layout leaves a 20px gap (w-20) for the collapsed sidebar.

    return (
        <div className="min-h-screen bg-black text-white font-sans flex">
            <Head>
                <title>{title}</title>
                <meta name="robots" content="noindex" />
            </Head>

            {/* Sidebar (Desktop) */}
            <div className={`hidden md:block w-20 flex-shrink-0`}>
                <Sidebar
                    userRole={userRole}
                    activeTool={activeTool}
                    onToolSelect={onToolSelect}
                />
            </div>

            {/* Main Content */}
            <main className={`flex-1 min-w-0 bg-black min-h-screen pb-20 md:pb-0 ${activeTool ? '' : 'pb-32'}`}>
                {/* Content Container */}
                <div className={activeTool ? 'min-h-full w-full relative' : 'p-4 md:p-8 max-w-7xl mx-auto'}>
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav 
                activeTool={activeTool} 
                onToolSelect={(id) => onToolSelect && onToolSelect(id)} 
            />

            {/* AI Coach Chat Widget */}
            <AICoachChat />

            {/* Global Tool Guide Floating Button */}
            {activeTool && <ToolGuide toolId={activeTool} />}
        </div>
    );
}



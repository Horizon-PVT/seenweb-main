// components/dashboard/CreatorHubLayout.tsx
// Phase 0: Unified Dashboard Layout for all 7 workflows + AI Coach + Academy
// Replaces DashboardLayout as the master layout

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import AICoachChat from '@/components/ai-coach/AICoachChat';
import ToolGuide from '@/components/ToolGuide';
import WorkflowSwitcher from './WorkflowSwitcher';
import { CreatorHubProvider, useCreatorHub } from '@/lib/creator-hub-context';
import { WorkflowId } from '@/lib/workflow-access';

interface CreatorHubLayoutProps {
  children: React.ReactNode;
  title?: string;
  activeTool?: string | null;
  onToolSelect?: (toolId: string) => void;
}

// Loading screen component
function HubLoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-purple-400 text-xl font-black tracking-widest animate-pulse">
          LOADING WORKSPACE...
        </p>
      </div>
    </div>
  );
}

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <HubLoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}

// Inner layout with context access
function HubLayoutInner({
  children,
  title = 'Creator Hub - SeenYT',
  activeTool,
  onToolSelect,
}: CreatorHubLayoutProps) {
  const { activeWorkflow, activeSubTool } = useCreatorHub();

  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Sidebar - collapsed by default, expands on hover */}
      <Sidebar
        activeTool={activeTool}
        onToolSelect={onToolSelect}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-20 min-h-screen transition-all duration-300">
        {/* Workflow Header (shows active workflow context) */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-white/5">
          <WorkflowSwitcher />
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Floating AI Coach Chat */}
      <AICoachChat />

      {/* Tool Guide (floating button when tool is active) */}
      {activeTool && <ToolGuide toolId={activeTool} />}
    </div>
  );
}

// Main exported component with providers
export default function CreatorHubLayout(props: CreatorHubLayoutProps) {
  return (
    <CreatorHubProvider>
      <AuthGuard>
        <HubLayoutInner {...props} />
      </AuthGuard>
    </CreatorHubProvider>
  );
}

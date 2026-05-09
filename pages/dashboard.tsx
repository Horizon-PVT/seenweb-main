// pages/dashboard.tsx - Completely Redesigned Dashboard
// Clean, Modern, Role-based with minimal complexity

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { ChevronLeft } from 'lucide-react';

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";

// Tool Components
import KodaNicheRadar from "@/components/KodaNicheRadar";
import KodaScriptStudio from "@/components/KodaScriptStudio";

// Page Components
import YouTubeAnalytics from "@/components/dashboard/YouTubeAnalytics";
import ChannelVideoManager from "@/components/dashboard/ChannelVideoManager";
import ContentRecommendation from "@/components/dashboard/ContentRecommendation";
import MultiChannelSidebar from "@/components/dashboard/MultiChannelSidebar";
import ContentCalendar from "@/components/dashboard/ContentCalendar";
import MarketExpansion from "@/components/dashboard/MarketExpansion";

// Tool-to-Component mapping
const TOOL_COMPONENTS: Record<string, React.ComponentType<{onBack: () => void}>> = {
  'niche-radar': KodaNicheRadar,
  'script-studio': KodaScriptStudio,
};

const TOOL_TITLES: Record<string, string> = {
  'niche-radar': 'Niche Radar',
  'script-studio': 'Script Studio',
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  
  // Simple state: either viewing a tool OR dashboard home
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const userRole = (session?.user as any)?.role || 'FREE';

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  useEffect(() => {
    if (!loading && router.isReady) {
      if (router.query.tool) {
        setActiveTool(router.query.tool as string);
      }
    }
  }, [loading, router.isReady, router.query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#CDAD5A]/30 border-t-[#CDAD5A] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#CDAD5A] text-lg font-bold tracking-wider">LOADING...</p>
        </div>
      </div>
    );
  }

  // ============== RENDER TOOL VIEW ==============
  if (activeTool && TOOL_COMPONENTS[activeTool]) {
    const ToolComponent = TOOL_COMPONENTS[activeTool];
    
    return (
      <DashboardLayout userRole={userRole} activeTool={activeTool} onToolSelect={setActiveTool}>
        <Head><title>{TOOL_TITLES[activeTool]} | SeenYT</title></Head>
        <div className="max-w-6xl mx-auto py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setActiveTool(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">{TOOL_TITLES[activeTool]}</h1>
          </div>
          
          {/* Tool Content */}
          <ToolComponent onBack={() => setActiveTool(null)} />
        </div>
      </DashboardLayout>
    );
  }

  // ============== MAIN DASHBOARD HOME ==============
  return (
    <DashboardLayout userRole={userRole} activeTool={null} onToolSelect={setActiveTool}>
      <Head>
        <title>Dashboard | SeenYT</title>
      </Head>

      <div className="max-w-7xl mx-auto py-6">
        <DashboardHome 
          userRole={userRole}
          onToolSelect={setActiveTool}
          onNavigate={(path) => router.push(path)}
        />
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'vi', ['common'])),
    },
  };
};

// pages/dashboard.tsx - DASHBOARD 2-LAYER UI TABS (Jan 2026)
// 4 tabs đơn giản cho user VN, giữ nguyên logic gói backend

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

// New tab components
import TabNavigation from "@/components/dashboard/TabNavigation";
import Tab1StartYouTube from "@/components/dashboard/Tab1StartYouTube";
import Tab2Optimize from "@/components/dashboard/Tab2Optimize";
import Tab3Automation from "@/components/dashboard/Tab3Automation";
import Tab4Learning from "@/components/dashboard/Tab4Learning";
import LockedFeatureModal from "@/components/dashboard/LockedFeatureModal";
import YouTubeStatsCard from "@/components/dashboard/YouTubeStatsCard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { type TabId, getTabLockMessage } from "@/lib/tab-access";

// --- SYNCHRONIZED TOOL COMPONENTS ---
import ThayYoutubeTool from "@/components/ThayYoutubeTool";
import NicheEngineTool from "@/components/NicheEngineTool";
import ImageForgeTool from "@/components/ImageForgeTool";
import TextToSpeechTool from "@/components/TextToSpeechTool"; // Correct component for AI Voice Studio
import SeoTool from "@/components/SeoTool";
import MicroNicheMinerTool from "@/components/MicroNicheMinerTool";
import VeocityTool from "@/components/VeocityTool";
import ScriptwriterTool from "@/components/ScriptwriterTool";
import StoryStudioTool from "@/components/StoryStudioTool";
import ScriptRefinerTool from "@/components/ScriptRefinerTool";
import RivalScannerTool from "@/components/RivalScannerTool";
import HiddenChannelFinderTool from "@/components/HiddenChannelFinderTool";
import KeywordResearchTool from "@/components/KeywordResearchTool";

// Development / Placeholders
import DubbingTool from "@/components/DubbingTool"; // For AI Voice Dubbing
import VirtualMCTool from "@/components/VirtualMCTool"; // For Virtual MC
import UnderConstructionTool from "@/components/UnderConstructionTool";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('start-youtube');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');

  const userRole = (session?.user as any)?.role || 'FREE';

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  // Auto-open tool from URL param (extension integration)
  useEffect(() => {
    if (!loading && router.query.tool) {
      const toolId = router.query.tool as string;
      setActiveTool(toolId);
    }
  }, [loading, router.query.tool]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setActiveTool(null);
  };

  const handleLockedTabClick = (tabId: TabId) => {
    const message = getTabLockMessage(tabId, userRole);
    if (message) {
      setLockedMessage(message);
      setShowLockedModal(true);
    }
  };

  const handleOpenTool = (toolId: string) => {
    setActiveTool(toolId);
  };

  const handleCloseTool = () => {
    setActiveTool(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#CDAD5A] text-2xl">{t('dashboard.loading')}</p>
      </div>
    );
  }

  // Render Tool INSIDE Layout
  if (activeTool) {
    return (
      <DashboardLayout userRole={userRole} activeTool={activeTool} onToolSelect={handleOpenTool}>
        <Head>
          <title>Tool - SeenYT</title>
          <meta name="robots" content="noindex" />
        </Head>
        {renderTool(activeTool, handleCloseTool)}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole} activeTool={activeTool} onToolSelect={handleOpenTool}>
      <div className="space-y-8">

        {/* Welcome Section */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Chào mừng, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-[#F2E0A0]">{session?.user?.name || "Creator"}</span>
                <span className="ml-2 text-2xl">👋</span>
              </h1>
              <p className="text-gray-400 mt-2 text-lg font-light">Hôm nay bạn muốn sáng tạo điều gì tuyệt vời?</p>
            </div>
          </div>
        </div>

        {/* YouTube Stats Card - Wrapped with glass effect */}
        <div className="backdrop-blur-sm">
          <YouTubeStatsCard userRole={userRole} userEmail={session?.user?.email || ''} />
        </div>

        {/* Main Tab System - Softer container */}
        <div className="bg-[#1a1a20]/20 rounded-3xl p-1 border border-white/5 backdrop-blur-md shadow-2xl">
          <div className="bg-[#0D0D10]/40 rounded-[22px] p-6 sm:p-8">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              userRole={userRole}
              onLockedTabClick={handleLockedTabClick}
            />

            <div className="mt-8 animate-fadeIn">
              {activeTab === 'start-youtube' && (
                <Tab1StartYouTube onOpenTool={handleOpenTool} />
              )}
              {activeTab === 'optimize' && (
                <Tab2Optimize onOpenTool={handleOpenTool} />
              )}
              {activeTab === 'automation' && (
                <Tab3Automation onOpenTool={handleOpenTool} />
              )}
              {activeTab === 'learning' && (
                <Tab4Learning onOpenTool={handleOpenTool} />
              )}
            </div>
          </div>
        </div>

        {/* Locked Tab Modal */}
        <LockedFeatureModal
          isOpen={showLockedModal}
          onClose={() => setShowLockedModal(false)}
          message={lockedMessage}
        />
      </div>
    </DashboardLayout>
  );
}

// Tool renderer
function renderTool(toolId: string, onBack: () => void) {
  // Normalize toolId if needed
  const id = toolId.toLowerCase();

  // Helper OnToolSelect for tools that need it (legacy interface)
  const dummyOnToolSelect = () => { };
  const dummyTools: any[] = [];

  switch (id) {
    // 1. thay-youtube
    case 'thay-youtube':
      return <ThayYoutubeTool onBack={onBack} />;

    // 2. niche-engine
    case 'niche-engine':
      return <NicheEngineTool onBack={onBack} />;

    // 3. image-forge
    case 'image-forge':
      return <ImageForgeTool onBack={onBack} />;

    // 4. text-to-speech
    case 'text-to-speech':
      return <TextToSpeechTool onBack={onBack} />;

    // 5. seo-tool
    case 'seo-tool':
      return <SeoTool onBack={onBack} />;

    // 6. micro-niche-miner
    case 'micro-niche-miner':
      return <MicroNicheMinerTool onBack={onBack} tools={dummyTools} onToolSelect={dummyOnToolSelect} />;

    // 7. veocity
    case 'veocity':
      return <VeocityTool onBack={onBack} />;

    // 8. scriptwriter
    case 'scriptwriter':
      return <ScriptwriterTool onBack={onBack} tools={dummyTools} onToolSelect={dummyOnToolSelect} />;

    // 9. narrative-studio
    case 'narrative-studio':
      return <StoryStudioTool onBack={onBack} />;

    // 10. script-refiner
    case 'script-refiner':
      return <ScriptRefinerTool onBack={onBack} />;

    // 11. rival-scanner
    case 'rival-scanner':
      return <RivalScannerTool onBack={onBack} tools={dummyTools} onToolSelect={dummyOnToolSelect} />;

    // 12. hidden-channel-finder
    case 'hidden-channel-finder':
      return <HiddenChannelFinderTool onBack={onBack} />;

    // 13. keyword-research
    case 'keyword-research':
      return <KeywordResearchTool onBack={onBack} />;

    // 13. ai-dubbing (Dev)
    case 'ai-dubbing':
    case 'ai-dubbing-studio':
      // Check if wrapped logic is needed. DubbingTool usually is page-level.
      // It might crash if it expects router query params or specific context.
      // But it's marked as construction, so maybe safe? 
      // User asked to mark it as dev.
      return <UnderConstructionTool title="AI Voice Dubbing" onBack={onBack} />;

    // 14. virtual-mc (Dev)
    case 'virtual-mc':
      return <UnderConstructionTool title="Virtual MC Creator" onBack={onBack} />;

    default:
      return (
        <div className="p-8 text-center text-white h-full flex flex-col items-center justify-center">
          <p className="text-xl font-bold mb-4">Tool "{toolId}" not found</p>
          <button onClick={onBack} className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
            Quay lại
          </button>
        </div>
      );
  }
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'vi', ['common'])),
    },
  };
};
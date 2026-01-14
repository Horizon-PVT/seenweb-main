// pages/dashboard.tsx - DASHBOARD 2-LAYER UI TABS (Jan 2026)
// 4 tabs đơn giản cho user VN, giữ nguyên logic gói backend

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

// New tab components
import TabNavigation from "@/components/dashboard/TabNavigation";
import Tab1StartYouTube from "@/components/dashboard/Tab1StartYouTube";
import Tab2Optimize from "@/components/dashboard/Tab2Optimize";
import Tab3Automation from "@/components/dashboard/Tab3Automation";
import Tab4Learning from "@/components/dashboard/Tab4Learning";
import LockedFeatureModal from "@/components/dashboard/LockedFeatureModal";
import { type TabId, getTabLockMessage } from "@/lib/tab-access";

// Tool components (existing)
import { MicroNicheMinerTool } from "@/components/MicroNicheMinerTool";
import ScriptwriterTool from "@/components/ScriptwriterTool";
import SeoTool from "@/components/SeoTool";
import { RivalScannerTool } from "@/components/RivalScannerTool";
import HiddenChannelFinderTool from "@/components/HiddenChannelFinderTool";
import ScriptRefinerTool from "@/components/ScriptRefinerTool";
import ImageForgeTool from "@/components/ImageForgeTool";
import TextToSpeechTool from "@/components/TextToSpeechTool";
import DubbingTool from "@/components/DubbingTool";
import VeocityTool from "@/components/VeocityTool";
import VirtualMCTool from "@/components/VirtualMCTool";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setActiveTool(null); // Close any open tool when switching tabs
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
        <p className="text-[#CDAD5A] text-2xl">Đang tải dashboard...</p>
      </div>
    );
  }

  // Render active tool if selected
  if (activeTool) {
    return (
      <div className="min-h-screen bg-black">
        <Head>
          <title>Dashboard - SeenYT</title>
          <meta name="robots" content="noindex" />
        </Head>
        {renderTool(activeTool, handleCloseTool)}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - SeenYT</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Header user info */}
        <div className="border-b border-gray-800 p-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">Chào mừng trở lại,</p>
              <p className="text-xl font-bold text-[#CDAD5A]">
                {session?.user?.name || session?.user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full">
                {userRole}
              </span>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                🏠 Trang chủ
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Main content with tabs */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            userRole={userRole}
            onLockedTabClick={handleLockedTabClick}
          />

          {/* Tab Content */}
          <div className="mt-6">
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

        {/* Locked Tab Modal */}
        <LockedFeatureModal
          isOpen={showLockedModal}
          onClose={() => setShowLockedModal(false)}
          message={lockedMessage}
        />
      </div>
    </>
  );
}

// Tool renderer
function renderTool(toolId: string, onBack: () => void) {
  // Placeholder for tools and onToolSelect (not used in standalone mode)
  const dummyTools: any[] = [];
  const dummyOnToolSelect = () => { };

  const toolMap: Record<string, React.ReactNode> = {
    'micro-niche-miner': <MicroNicheMinerTool onBack={onBack} tools={dummyTools} onToolSelect={dummyOnToolSelect} />,
    'scriptwriter': <ScriptwriterTool onBack={onBack} tools={dummyTools} onToolSelect={dummyOnToolSelect} />,
    'seo': <SeoTool onBack={onBack} />,
    'rival-scanner': <RivalScannerTool onBack={onBack} tools={dummyTools} onToolSelect={dummyOnToolSelect} />,
    'hidden-channel-finder': <HiddenChannelFinderTool onBack={onBack} />,
    'script-refiner': <ScriptRefinerTool onBack={onBack} />,
    'image-forge': <ImageForgeTool onBack={onBack} />,
    'text-to-speech': <TextToSpeechTool onBack={onBack} />,
    'ai-dubbing-studio': <DubbingTool onBack={onBack} />,
    'velocity': <VeocityTool onBack={onBack} />,
    'virtual-mc': <VirtualMCTool />,
  };

  return toolMap[toolId] || (
    <div className="p-8 text-center text-white">
      <p>Tool không tìm thấy</p>
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg">
        Quay lại
      </button>
    </div>
  );
}
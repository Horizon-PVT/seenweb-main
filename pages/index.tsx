import React, { useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

// Hardcoded Series Data (Moved from Component)
const VIDEO_SERIES_2026 = [
  { id: '1', title: 'Tư duy đúng khi làm YouTube 2026', youtubeId: 'yvUouUjwZKw', description: 'Bài 1: Khởi động hành trình' },
  { id: '2', title: 'Cách chọn ngách tiềm năng', youtubeId: '_KzRdzW5SSM', description: 'Bài 2: Chiến lược ngách' },
  { id: '3', title: 'Phân tích đối thủ & Thị trường', youtubeId: 'UgpPkYBAXL0', description: 'Bài 3: Nghiên cứu' },
  { id: '4', title: 'Quy trình sản xuất video chuẩn', youtubeId: '4SlGnwW4nOE', description: 'Bài 4: Production' },
  { id: '5', title: 'Tối ưu SEO & Thuật toán', youtubeId: 'WsyJ_JMknoY', description: 'Bài 5: SEO Mastery' },
  { id: '6', title: 'Chiến lược Thumbnail & Title', youtubeId: '-LJDDrLi76g', description: 'Bài 6: Click-Through Rate' },
  { id: '7', title: 'Kiếm tiền & Affiliate', youtubeId: 'Mv6XwQhN3ig', description: 'Bài 7: Monetization' },
  { id: '8', title: 'Xây dựng hệ thống tự động', youtubeId: '2bm-goinao4', description: 'Bài 8: Automation' },
];

const DEFAULT_TOOL_VIDEOS = [
  { id: 't1', title: 'Đào ngách cpm cao', youtubeId: 'fwIst_IscQs', description: 'Xem hướng dẫn chi tiết', thumbnailUrl: '/images/tools/tool-1.jpg' },
  { id: 't2', title: 'Phân tích kênh đối thủ', youtubeId: 'ndey_-0BBnA', description: 'Xem hướng dẫn chi tiết', thumbnailUrl: '/images/tools/tool-2.jpg' },
  { id: 't3', title: 'Công cụ tạo video', youtubeId: 'cUP6biV4cHQ', description: 'Xem hướng dẫn chi tiết', thumbnailUrl: '/images/tools/tool-3.jpg' },
  { id: 't4', title: 'Remix kịch bản', youtubeId: 'zXJ_inukLGo', description: 'Xem hướng dẫn chi tiết', thumbnailUrl: '/images/tools/tool-4.jpg' },
  { id: 't5', title: 'Kể Chuyện Lịch Sử / Story', youtubeId: '-yV4qOEkxZw', description: 'Xem hướng dẫn chi tiết', thumbnailUrl: '/images/tools/tool-5.jpg' },
  { id: 't6', title: 'Tool thư viện ngách thắng', youtubeId: 'CNbEXE6pj1Q', description: 'Xem hướng dẫn chi tiết', thumbnailUrl: '/images/tools/tool-6.jpg' },
  { id: 't7', title: 'Tool seo và từ khoá', youtubeId: 'M4UBTX8omq0', description: 'Xem hướng dẫn chi tiết', thumbnailUrl: '/images/tools/tool-7.jpg' },
];

import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import CreatorMeritSection from "../components/CreatorMeritSection";
import KnowledgeSection from "../components/KnowledgeSection";
import VideoTipsSection from "../components/VideoTipsSection";
import CoachingSection from "../components/CoachingSection";
import ToolsGrid from "../components/ToolsGrid";
import Partners from "../components/Partners";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import BlogTeaser from "../components/BlogTeaser";
import PricingTable from "../components/PricingTable";
import AffiliateSection from "../components/AffiliateSection";
import FinalCTA from "../components/FinalCTA";
import OnboardingModal from "../components/OnboardingModal";
import WorkflowSection from "../components/WorkflowSection";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";
import FloatingSidebar from "../components/FloatingSidebar";
import LeftPromotionSidebar from "@/components/LeftPromotionSidebar";
import SocialProofBar from "@/components/SocialProofBar";
import { prisma } from "../lib/prisma";

// ✅ Overlay SSR off (an toàn cho tool dùng window, AudioContext, localStorage...)
const ToolOverlay = dynamic(() => import("../components/ToolOverlay"), {
  ssr: false,
});

export default function Home({ ebooks = [], videos = [], tutorialVideos = [], featuredStrategyVideo, articles = [] }: { ebooks: any[]; videos: any[]; tutorialVideos?: any[]; featuredStrategyVideo?: any; articles?: any[] }) {
  const router = useRouter();

  const siteUrl = "https://seenyt.net";
  const title = "SeenYT - Công cụ AI YouTube thông minh nhất 2025";
  const description =
    "SeenYT - Tool AI hỗ trợ creator YouTube tạo video tự động, tìm micro niche, kênh ẩn, tối ưu SEO và kiếm tiền hiệu quả nhất.";

  // ✅ mở overlay khi có ?tool=<id>
  const toolIdRaw = router.query.tool;
  const toolId = typeof toolIdRaw === "string" ? toolIdRaw : null;
  const openAnyTool = !!toolId;

  // ✅ Close overlay + scroll to tools board
  const closeAndGoToolsBoard = async () => {
    const nextQuery = { ...router.query };
    delete (nextQuery as any).tool;

    await router.push(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true }
    );

    // wait for overlay unmount then scroll
    setTimeout(() => {
      document
        .getElementById("bang-cong-cu-seenyt")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Callback when onboarding modal goal is selected
  const handleOnboardingComplete = () => {
    // Could do analytics here or other logic
    console.log("Onboarding goal selected");
  };

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        {[
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:type", content: "website" },
          { property: "og:url", content: siteUrl },
          { property: "og:image", content: `${siteUrl}/thumbnail.jpg` },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: description },
          { name: "twitter:image", content: `${siteUrl}/thumbnail.jpg` },
        ].map((meta, i) => (
          <meta key={i} {...meta} />
        ))}
      </Head>

      <Header />
      <OnboardingModal onComplete={handleOnboardingComplete} />

      <main>
        <HeroSection />
        <CreatorMeritSection />
        <WorkflowSection />
        <Testimonials />

        {/* Tool Guides (Priority: DB -> Fallback) */}
        <VideoTipsSection
          tag="Hỗ Trợ Kỹ Thuật"
          title={<span className="text-[#CDAD5A]">Hướng Dẫn Sử Dụng Tools</span>}
          subtitle="Bộ công cụ tối ưu để phát triển kênh YouTube"
          videos={(tutorialVideos && tutorialVideos.length > 0) ? tutorialVideos : DEFAULT_TOOL_VIDEOS}
        />

        {/* Course Series (Hardcoded or DB) */}
        <VideoTipsSection
          tag="Series Độc Quyền"
          title={<>Hướng Dẫn Làm <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">YouTube 2026</span></>}
          subtitle="Trọn bộ bí kíp từ A-Z dành cho người mới bắt đầu"
          videos={VIDEO_SERIES_2026}
        />

        <KnowledgeSection featuredVideo={featuredStrategyVideo} articles={articles} />
        {/* PromotionCarousel moved to Left Sidebar */}

        {/* ✅ Anchor để nút "Quay lại menu" cuộn về đúng vị trí */}
        <section id="bang-cong-cu-seenyt">
          <ToolsGrid />
        </section>

        <section id="pricing" className="scroll-mt-20">
          <PricingTable />
        </section>

        <CoachingSection />
        <AffiliateSection />
        <FinalCTA />
        <FAQ />
      </main>
      <Footer />
      <ChatbotWidget />
      <FloatingSidebar />
      <LeftPromotionSidebar />

      {/* ✅ Overlay full-screen: mở cho TẤT CẢ tool */}
      {openAnyTool && toolId && (
        <ToolOverlay toolId={toolId} onBack={closeAndGoToolsBoard} />
      )}
    </div>
  );
}

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Fetch ebooks and videos from database
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  try {
    const [ebooks, videoTips, blogPosts] = await Promise.all([
      prisma.ebook.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.videoTip.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, slug: true, summary: true, coverImage: true, createdAt: true }
      })
    ]);

    // Alias for backward compatibility
    const videos = videoTips;

    // Categorize videos
    const tutorialVideos = videoTips.filter((v: any) => !v.type || v.type === 'TUTORIAL');
    const strategyVideos = videoTips.filter((v: any) => v.type === 'STRATEGY');
    // Featured strategy video (pick first one)
    const featuredStrategyVideo = strategyVideos.length > 0 ? {
      title: strategyVideos[0].title,
      desc: strategyVideos[0].description || '',
      videoId: strategyVideos[0].youtubeId,
      thumb: strategyVideos[0].thumbnailUrl || ''
    } : undefined;

    return {
      props: {
        ...(await serverSideTranslations(locale || 'vi', ['common'])),
        ebooks: JSON.parse(JSON.stringify(ebooks)),
        videos: JSON.parse(JSON.stringify(videos)), // This is the old videos prop, keeping for compatibility if utilized elsewhere
        tutorialVideos: JSON.parse(JSON.stringify(tutorialVideos)),
        featuredStrategyVideo: featuredStrategyVideo ? JSON.parse(JSON.stringify(featuredStrategyVideo)) : null,
        articles: JSON.parse(JSON.stringify(blogPosts)),
      },
    };
  } catch (error) {
    console.error('Error fetching ebooks/videos:', error);
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
        ebooks: [],
        videos: [],
      },
    };
  }
};

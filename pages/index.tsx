import React, { useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Link from 'next/link';
import { Wrench, GraduationCap, ShieldCheck, ArrowRight, Target, PenTool, Video, UploadCloud, DollarSign, LineChart, Database, FileText, Map, Users, Star, Sparkles, Layers, Search, Download, CheckCircle2, Globe } from "lucide-react";




import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation, Trans } from 'next-i18next';
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import CreatorMeritSection from "../components/CreatorMeritSection";

// Lazy load below-the-fold components for faster initial page load
const KnowledgeSection = dynamic(() => import("../components/KnowledgeSection"));
const VideoTipsSection = dynamic(() => import("../components/VideoTipsSection"));
const ExploreSection = dynamic(() => import("../components/ExploreSection"));
const Testimonials = dynamic(() => import("../components/Testimonials"));
const PricingTable = dynamic(() => import("../components/PricingTable"));
const FinalCTA = dynamic(() => import("../components/FinalCTA"));
const FAQ = dynamic(() => import("../components/FAQ"));
const Footer = dynamic(() => import("../components/Footer"));
const OnboardingModal = dynamic(() => import("../components/OnboardingModal"), { ssr: false });
const ChatbotWidget = dynamic(() => import("../components/ChatbotWidget"), { ssr: false });
import { prisma } from "../lib/prisma";



// Fetch ebooks and videos from database — ISR for performance (revalidate every 60s)
export const getStaticProps = async ({ locale }: { locale?: string }) => {
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
        videos: JSON.parse(JSON.stringify(videos)),
        tutorialVideos: JSON.parse(JSON.stringify(tutorialVideos)),
        featuredStrategyVideo: featuredStrategyVideo ? JSON.parse(JSON.stringify(featuredStrategyVideo)) : null,
        articles: JSON.parse(JSON.stringify(blogPosts)),
      },
      revalidate: 60, // ISR: regenerate every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching ebooks/videos:', error);
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
        ebooks: [],
        videos: [],
      },
      revalidate: 30, // Retry faster on error
    };
  }
};

export default function Home({ ebooks = [], videos = [], tutorialVideos = [], featuredStrategyVideo, articles = [] }: { ebooks: any[]; videos: any[]; tutorialVideos?: any[]; featuredStrategyVideo?: any; articles?: any[] }) {
  const router = useRouter();
  const { t } = useTranslation('common');

  // Hardcoded Series Data - will translate via t()
  const VIDEO_SERIES_2026 = [
    { id: '1', title: t('home.video_series.1_title'), youtubeId: 'yvUouUjwZKw', description: t('home.video_series.1_desc') },
    { id: '2', title: t('home.video_series.2_title'), youtubeId: '_KzRdzW5SSM', description: t('home.video_series.2_desc') },
    { id: '3', title: t('home.video_series.3_title'), youtubeId: 'UgpPkYBAXL0', description: t('home.video_series.3_desc') },
    { id: '4', title: t('home.video_series.4_title'), youtubeId: '4SlGnwW4nOE', description: t('home.video_series.4_desc') },
    { id: '5', title: t('home.video_series.5_title'), youtubeId: 'WsyJ_JMknoY', description: t('home.video_series.5_desc') },
    { id: '6', title: t('home.video_series.6_title'), youtubeId: '-LJDDrLi76g', description: t('home.video_series.6_desc') },
    { id: '7', title: t('home.video_series.7_title'), youtubeId: 'Mv6XwQhN3ig', description: t('home.video_series.7_desc') },
    { id: '8', title: t('home.video_series.8_title'), youtubeId: '2bm-goinao4', description: t('home.video_series.8_desc') },
  ];

  const DEFAULT_TOOL_VIDEOS = [
    { id: 't1', title: t('home.tool_videos.1_title'), youtubeId: 'fwIst_IscQs', description: t('home.tool_videos.1_desc'), thumbnailUrl: '/images/tools/tool-1.jpg' },
    { id: 't2', title: t('home.tool_videos.2_title'), youtubeId: 'ndey_-0BBnA', description: t('home.tool_videos.2_desc'), thumbnailUrl: '/images/tools/tool-2.jpg' },
    { id: 't3', title: t('home.tool_videos.3_title'), youtubeId: 'cUP6biV4cHQ', description: t('home.tool_videos.3_desc'), thumbnailUrl: '/images/tools/tool-3.jpg' },
    { id: 't4', title: t('home.tool_videos.4_title'), youtubeId: 'zXJ_inukLGo', description: t('home.tool_videos.4_desc'), thumbnailUrl: '/images/tools/tool-4.jpg' },
    { id: 't5', title: t('home.tool_videos.5_title'), youtubeId: '-yV4qOEkxZw', description: t('home.tool_videos.5_desc'), thumbnailUrl: '/images/tools/tool-5.jpg' },
    { id: 't6', title: t('home.tool_videos.6_title'), youtubeId: 'CNbEXE6pj1Q', description: t('home.tool_videos.6_desc'), thumbnailUrl: '/images/tools/tool-6.jpg' },
    { id: 't7', title: t('home.tool_videos.7_title'), youtubeId: 'M4UBTX8omq0', description: t('home.tool_videos.7_desc'), thumbnailUrl: '/images/tools/tool-7.jpg' },
    { id: 't8', title: t('home.tool_videos.8_title'), youtubeId: 'NGLzDUTPvgs', description: t('home.tool_videos.8_desc'), thumbnailUrl: '/images/tools/tool-8.jpg' },
  ];

  const siteUrl = "https://seenyt.net";
  const title = t('home.meta_title');
  const description = t('home.meta_description');



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

        {/* --- BƯỚC 2: THE BIG 3 ECOSYSTEM --- */}
        <section className="py-24 relative overflow-hidden bg-[#050505]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">{t('ecosystem.title')}</h2>
              <p className="text-gray-400 text-lg">{t('ecosystem.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wrench className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('ecosystem.card1_title')}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{t('ecosystem.card1_desc')}</p>
                <Link href="/dashboard" className="inline-block">
                  <div className="text-purple-400 font-semibold group-hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors">
                    {t('ecosystem.card1_cta')} <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>

              {/* Card 2 */}
              <div className="bg-[#18181b] border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(0,255,180,0.1)] hover:-translate-y-2 transition-transform duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                  <GraduationCap className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{t('ecosystem.card2_title')}</h3>
                <p className="text-gray-400 leading-relaxed mb-6 relative z-10">{t('ecosystem.card2_desc')}</p>
                <Link href="/academy" className="inline-block">
                  <div className="text-cyan-400 font-semibold group-hover:text-cyan-300 flex items-center gap-2 cursor-pointer relative z-10 transition-colors">
                    {t('ecosystem.card2_cta')} <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>

              {/* Card 3 */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('ecosystem.card3_title')}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{t('ecosystem.card3_desc')}</p>
                <Link href="/services" className="inline-block">
                  <div className="text-orange-400 font-semibold group-hover:text-orange-300 flex items-center gap-2 cursor-pointer transition-colors">
                    {t('ecosystem.card3_cta')} <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- BƯỚC 3: TIMELINE 5 BƯỚC THÀNH CÔNG --- */}
        <section className="py-24 relative bg-black border-y border-white/5 bg-gradient-to-b from-[#050505] to-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
                {t('home_timeline.title')}
              </h2>
              <p className="text-gray-400 text-lg">{t('home_timeline.subtitle')}</p>
            </div>

            {/* Horizontal Zigzag Timeline Container */}
            <div className="relative pt-12">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">

                {/* Step 1 */}
                <div className="flex flex-col items-center text-center group md:-translate-y-6">
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10 group-hover:bg-purple-900 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-purple-400 font-bold mb-1 uppercase tracking-wide text-xs">{t('home_timeline.step1_label')}</div>
                  <h3 className="text-lg font-bold text-white mb-2 px-2">{t('home_timeline.step1_title')}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{t('home_timeline.step1_desc')}</p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center group md:translate-y-12">
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10 group-hover:bg-pink-900 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                    <PenTool className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="text-pink-400 font-bold mb-1 uppercase tracking-wide text-xs">{t('home_timeline.step2_label')}</div>
                  <h3 className="text-lg font-bold text-white mb-2 px-2">{t('home_timeline.step2_title')}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{t('home_timeline.step2_desc')}</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center group md:-translate-y-6">
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10 group-hover:bg-cyan-900 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    <Video className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-cyan-400 font-bold mb-1 uppercase tracking-wide text-xs">{t('home_timeline.step3_label')}</div>
                  <h3 className="text-lg font-bold text-white mb-2 px-2">{t('home_timeline.step3_title')}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{t('home_timeline.step3_desc')}</p>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center group md:translate-y-12">
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10 group-hover:bg-orange-900 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    <UploadCloud className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-orange-400 font-bold mb-1 uppercase tracking-wide text-xs">{t('home_timeline.step4_label')}</div>
                  <h3 className="text-lg font-bold text-white mb-2 px-2">{t('home_timeline.step4_title')}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{t('home_timeline.step4_desc')}</p>
                </div>

                {/* Step 5 */}
                <div className="flex flex-col items-center text-center group hover:-translate-y-1 transition-transform md:-translate-y-6">
                  <div className="w-12 h-12 rounded-full bg-green-900/50 border-2 border-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.2)] md:shadow-[0_0_20px_rgba(34,197,94,0.4)] relative z-10 group-hover:bg-green-900">
                    <DollarSign className="w-5 h-5 text-green-400 font-bold" />
                  </div>
                  <div className="text-green-400 font-bold mb-1 uppercase tracking-wide text-xs">{t('home_timeline.step5_label')}</div>
                  <h3 className="text-lg font-bold text-white mb-2 px-2">{t('home_timeline.step5_title')}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{t('home_timeline.step5_desc')}</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* --- KHU VỰC 4: VŨ KHÍ HẠNG NẶNG (WORKFLOWS) --- */}
        <section className="py-24 relative overflow-hidden bg-[#050505] border-y border-white/5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-900/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-cyan-500/20 mb-4 inline-block">
                Hệ Sinh Thái Mới
              </span>
              <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">All-in-One <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Workflows</span></h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">Không bán công cụ lẻ tẻ. Chúng tôi mang đến cho bạn các luồng làm việc khép kín từ Idea cho đến Video cuối cùng để thống trị YouTube.</p>
            </div>

            <div className="flex flex-col gap-8">
              
              {/* Product 1: TRẠM NỘI DUNG WEB (Cloud) */}
              <div className="bg-[#111] border border-white/5 p-8 md:p-12 rounded-[2.5rem] hover:border-pink-500/30 transition-all group overflow-hidden relative flex flex-col md:flex-row items-center gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] pointer-events-none" />
                <div className="md:w-1/2 relative z-10">
                   <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.2)] group-hover:scale-110 transition-transform">
                     <Globe className="w-8 h-8 text-pink-400" />
                   </div>
                   <h3 className="text-3xl md:text-4xl font-black text-white mb-4">1. Trạm Nội Dung Web</h3>
                   <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                     Giải pháp Cloud All-in-One: Dò đài tìm ngách dễ chơi, AI Thầy Youtube viết kịch bản 10 vạn chữ chuẩn SEO, và công cụ Lồng tiếng chân thực. Mọi thứ trên mây, không cần cài đặt.
                   </p>
                   <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-pink-500" /> Dò ngách siêu nhỏ, bóc tách đối thủ</li>
                      <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-pink-500" /> Viết kịch bản tự động, tối ưu SEO kênh</li>
                   </ul>
                   <Link href="/dashboard" className="inline-flex w-full md:w-auto py-4 px-8 rounded-xl bg-white/5 border border-white/10 group-hover:bg-pink-600 group-hover:text-white group-hover:border-transparent text-white font-bold items-center justify-center gap-2 transition-all">
                      Sử Dụng Trạm Web <ArrowRight className="w-5 h-5" />
                   </Link>
                </div>
                <div className="md:w-1/2 w-full mt-8 md:mt-0 relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 group-hover:shadow-[0_0_50px_rgba(236,72,153,0.2)] transition-shadow">
                   <img src="/images/tool-niche-miner.jpg" alt="Trạm Nội Dung Web" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                </div>
              </div>

              {/* Product 2: KODA VIDEO STUDIO (BYOK) */}
              <div className="mt-8 bg-gradient-to-br from-[#18181b] to-black border border-cyan-500/30 shadow-[0_0_50px_rgba(0,255,180,0.15)] rounded-[2.5rem] overflow-hidden hover:-translate-y-2 transition-transform duration-500 group flex flex-col md:flex-row relative z-20">
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 animate-pulse rounded-[2.5rem] pointer-events-none" />
                <div className="md:w-1/2 p-8 md:p-12 xl:p-16 flex flex-col justify-center relative z-10">
                  <div className="flex gap-2 mb-6">
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Vũ Khí Hạng Nặng
                    </span>
                    <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                       Windows Desktop App
                    </span>
                  </div>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-6 leading-tight">
                    2. Koda Video <br /> <span className="text-[#00ffb4]">Studio</span>
                  </h3>
                  <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
                    Chìa khóa thay thế một studio thực thụ. <strong>Phần mềm Windows</strong> tự động cào hàng nghìn ảnh, ghép nhạc, làm hiệu ứng lách bản quyền video 4K tốc độ cao bằng sức mạnh Card Đồ Hoạ của chính bạn.
                  </p>
                  <Link href="/dashboard" className="inline-flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] w-max border border-white/20">
                    <span className="flex items-center gap-2"><Download className="w-5 h-5" /> Tải Giải Pháp Về Máy</span>
                  </Link>
                </div>
                <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-[#0a0f1e] overflow-hidden flex items-center justify-center p-8 border-t md:border-t-0 md:border-l border-white/5">
                  <div className="absolute inset-0 bg-cyan-900/30 blur-[120px] rounded-full" />
                  <div className="relative w-full max-w-md aspect-[4/3] bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-4 transform md:rotate-2 group-hover:rotate-0 transition-transform duration-500">
                    <div className="flex gap-2 mb-4 border-b border-white/5 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                    </div>
                    <div className="flex-1 flex gap-4">
                      <div className="w-1/4 bg-white/5 rounded-lg flex flex-col gap-2 p-2">
                          <div className="w-full h-8 bg-cyan-500/20 rounded border border-cyan-500/20" />
                          <div className="w-full h-8 bg-white/5 rounded" />
                          <div className="w-full h-8 bg-white/5 rounded" />
                      </div>
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="h-2/3 bg-[url('/images/noise.png')] bg-cyan-900/40 rounded-lg flex items-center justify-center border border-cyan-500/30 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <Video className="w-12 h-12 text-cyan-400/80 relative z-10 animate-pulse" />
                        </div>
                        <div className="flex-1 bg-white/5 rounded-lg border border-white/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

               {/* Product 3: KODA WEB NOVEL (BYOK) */}
               <div className="mt-8 bg-gradient-to-br from-[#18181b] to-black border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] rounded-[2.5rem] overflow-hidden hover:-translate-y-2 transition-transform duration-500 group flex flex-col md:flex-row relative z-20">
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-pink-500/5 animate-pulse rounded-[2.5rem] pointer-events-none" />
                <div className="md:w-1/2 p-8 md:p-12 xl:p-16 flex flex-col justify-center relative z-10">
                  <div className="flex gap-2 mb-6">
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Vũ Khí Hạng Nặng
                    </span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-widest shadow-lg shadow-purple-500/20">
                       Windows Desktop App
                    </span>
                  </div>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-6 leading-tight">
                    3. Koda Web <br /> <span className="text-[#e879f9]">Novel</span>
                  </h3>
                  <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
                    Cỗ máy sản xuất Truyện Chữ. Tự động cào truyện, tạo hình nhân vật, xào nấu nội dung bằng AI và xuất bản hàng loạt lên các nền tảng Web Novel lớn nhất, chỉ bằng 1 cú click!
                  </p>
                  <Link href="/dashboard" className="inline-flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] w-max border border-white/20">
                    <span className="flex items-center gap-2"><Download className="w-5 h-5" /> Tải Giải Pháp Về Máy</span>
                  </Link>
                </div>
                <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-[#0a0f1e] overflow-hidden flex items-center justify-center p-8 border-t md:border-t-0 md:border-l border-white/5">
                  <div className="absolute inset-0 bg-purple-900/30 blur-[120px] rounded-full" />
                  <div className="relative w-full max-w-md aspect-[4/3] bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-4 transform md:-rotate-2 group-hover:rotate-0 transition-transform duration-500">
                    <div className="flex gap-2 mb-4 border-b border-white/5 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                    </div>
                    <div className="flex-1 flex gap-4">
                      <div className="w-1/4 bg-white/5 rounded-lg flex flex-col gap-2 p-2">
                          <div className="w-full h-8 bg-purple-500/20 rounded border border-purple-500/20" />
                          <div className="w-full h-8 bg-white/5 rounded" />
                          <div className="w-full h-8 bg-white/5 rounded" />
                      </div>
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="h-2/3 bg-[url('/images/noise.png')] bg-purple-900/40 rounded-lg flex items-center justify-center border border-purple-500/30 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <Database className="w-12 h-12 text-purple-400/80 relative z-10 animate-pulse" />
                        </div>
                        <div className="flex-1 bg-white/5 rounded-lg border border-white/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- KHU VỰC 5: COACHING 1-1 COPYWRITING --- */}
        <section className="py-24 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-black to-black">

          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="space-y-10">
              {/* Headline */}
              <div className="text-center relative">
                <h2 className="text-3xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 leading-tight">
                  {t('home_coaching.headline_1')}<br />{t('home_coaching.headline_2')}
                </h2>
              </div>

              {/* Copywriting blocks */}
              <div className="bg-[#111] border border-orange-500/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(234,88,12,0.05)] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full" />

                <div className="flex gap-4 relative z-10">
                  <div className="mt-1 bg-red-500/10 p-2 rounded-xl w-fit h-fit border border-red-500/20 shrink-0">
                    <Target className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold text-lg mb-2">{t('home_coaching.problem_title')}</h4>
                    <p className="text-gray-300 text-lg leading-relaxed">{t('home_coaching.problem_desc')}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-white/5 relative z-10" />

                <div className="flex gap-4 relative z-10">
                  <div className="mt-1 bg-cyan-500/10 p-2 rounded-xl w-fit h-fit border border-cyan-500/20 shrink-0">
                    <Map className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-cyan-400 font-bold text-lg mb-2">{t('home_coaching.solution_title')}</h4>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      <Trans
                        i18nKey="home_coaching.solution_desc"
                        components={{ 1: <strong /> }}
                      />
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 relative z-10">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors">
                    <Star className="w-8 h-8 text-yellow-500 mb-3" />
                    <h4 className="text-white font-bold mb-2 text-lg">{t('home_coaching.perk1_title')}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{t('home_coaching.perk1_desc')}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors">
                    <Users className="w-8 h-8 text-purple-400 mb-3" />
                    <h4 className="text-white font-bold mb-2 text-lg">{t('home_coaching.perk2_title')}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{t('home_coaching.perk2_desc')}</p>
                  </div>
                </div>

                <div className="pt-8 text-center relative z-10 group">
                  <Link href="/coaching" className="relative inline-block hover:scale-105 transition-transform duration-300">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-black px-8 md:px-12 py-5 rounded-full border border-orange-500/50">
                      <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                        {t('home_coaching.cta')}
                      </span>
                    </div>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </section>

        <Testimonials />

        <section id="pricing" className="scroll-mt-20">
          <PricingTable />
        </section>

        <ExploreSection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <ChatbotWidget />
      {/* Sidebars REMOVED for clean layout */}
    </div>
  );
}

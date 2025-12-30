import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import PromotionCarousel from "../components/PromotionCarousel";
import TechPillars from "../components/TechPillars";
import ToolsGrid from "../components/ToolsGrid";
import Partners from "../components/Partners";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import BlogTeaser from "../components/BlogTeaser";
import PricingTable from "../components/PricingTable";
import AffiliateSection from "../components/AffiliateSection";
import FinalCTA from "../components/FinalCTA";
import FAQ from "../components/FAQ"; // ✅ Import FAQ
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";

// ✅ Overlay SSR off (an toàn cho tool dùng window, AudioContext, localStorage...)
const ToolOverlay = dynamic(() => import("../components/ToolOverlay"), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

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

      {isClient ? (
        <>
          <Header />
          <main>
            <HeroSection />
            <PromotionCarousel />
            <TechPillars />

            {/* ✅ Anchor để nút "Quay lại menu" cuộn về đúng vị trí */}
            <section id="bang-cong-cu-seenyt">
              <ToolsGrid />
            </section>

            <Partners />
            <Projects />
            <Testimonials />
            <BlogTeaser />

            <section id="pricing" className="scroll-mt-20">
              <PricingTable />
            </section>

            <AffiliateSection />
            <FinalCTA />
            <FAQ />
          </main>
          <Footer />
          <ChatbotWidget />

          {/* ✅ Overlay full-screen: mở cho TẤT CẢ tool */}
          {openAnyTool && toolId && (
            <ToolOverlay toolId={toolId} onBack={closeAndGoToolsBoard} />
          )}
        </>
      ) : (
        <div className="min-h-screen bg-[#0A1929] flex items-center justify-center text-[#CDAD5A]">
          Đang tải giao diện...
        </div>
      )}
    </div>
  );
}

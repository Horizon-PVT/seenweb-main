import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import PromotionCarousel from "../components/PromotionCarousel"; // ✅ THAY: Promotion thay AboutUs
import TechPillars from "../components/TechPillars";
import ToolsGrid from "../components/ToolsGrid";
import Partners from "../components/Partners";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import BlogTeaser from "../components/BlogTeaser";
import PricingTable from "../components/PricingTable";
import AffiliateSection from "../components/AffiliateSection";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const siteUrl = "https://seenyt.net";
  const title = "SeenYT - Công cụ AI YouTube thông minh nhất 2025";
  const description = "SeenYT - Tool AI hỗ trợ creator YouTube tạo video tự động, tìm micro niche, kênh ẩn, tối ưu SEO và kiếm tiền hiệu quả nhất.";

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
            <PromotionCarousel /> {/* ✅ THAY MỚI: 5 chương trình khuyến mãi carousel */}
            <TechPillars />
            <ToolsGrid />
            <Partners />
            <Projects />
            <Testimonials />
            <BlogTeaser />
            <PricingTable />
            <AffiliateSection />
            <FinalCTA />
          </main>
          <Footer />
          <ChatbotWidget />
        </>
      ) : (
        <div className="min-h-screen bg-[#0A1929] flex items-center justify-center text-[#CDAD5A]">
          Đang tải giao diện...
        </div>
      )}
    </div>
  );
}
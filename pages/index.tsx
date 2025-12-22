// pages/index.tsx - BẢN FULL ĐÃ FIX (từ 5.txt, thêm check import ToolsGrid + optimize SEO + thêm BlogTeaser)
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import AboutUs from "../components/AboutUs";
import TechPillars from "../components/TechPillars";
import ToolsGrid from "../components/ToolsGrid"; // Import đúng
import Partners from "../components/Partners";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import BlogTeaser from "../components/BlogTeaser"; // ✅ THÊM: Teaser blog trên trang chủ
import PricingTable from "../components/PricingTable";
import AffiliateSection from "../components/AffiliateSection";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Không redirect tự động về /dashboard nữa – để user ở lại trang chủ trải nghiệm
    // if (status === "authenticated") {
    //   router.push("/dashboard");
    // }
  }, [status, router]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://seenyt.net";
  const title = "SeenYT - Công cụ tối ưu YouTube & kiếm tiền AI";
  const description =
    "SeenYT cung cấp 10 công cụ độc quyền giúp bạn tối ưu YouTube, tìm ngách kiếm tiền với AI.";

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${siteUrl}/thumbnail.jpg`} />
        <meta property="og:url" content={siteUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${siteUrl}/thumbnail.jpg`} />
        <link rel="canonical" href={siteUrl} />
        {process.env.NODE_ENV === "production" && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                url: siteUrl,
                name: title,
                description: description,
                image: `${siteUrl}/thumbnail.jpg`,
              }),
            }}
          />
        )}
      </Head>

      {isClient ? (
        <>
          <Header />
          <main>
            <HeroSection />
            <AboutUs />
            <TechPillars />
            <ToolsGrid />
            <Partners />
            <Projects />
            <Testimonials />
            <BlogTeaser /> {/* ✅ THÊM: Section blog teaser ngay sau testimonials */}
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
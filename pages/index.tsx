// pages/index.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import AboutUs from "../components/AboutUs";
import TechPillars from "../components/TechPillars";
import ToolsGrid from "../components/ToolsGrid";
import Partners from "../components/Partners";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import PricingTable from "../components/PricingTable";
import AffiliateSection from "../components/AffiliateSection";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";

const siteUrl = "https://seenweb-main.vercel.app";
const ogImage = `${siteUrl}/thumbnail.jpg`;
export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    setIsClient(true);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
return (
    <div className="font-montserrat bg-[#0A1929] reflective-glare-bg"> {/* ĐÃ SỬA: Dark Navy */}
      <Head>
        <title>SeenWeb — San phẳng cuộc chơi YouTube bằng sức mạnh AI</title>
        <meta
          name="description"
          content="SeenWeb giúp sáng tạo nội dung YouTube dễ dàng hơn với công cụ AI mạnh mẽ, hỗ trợ viết kịch bản, SEO, phân tích kênh và tối ưu video."
        />
    
    <link rel="canonical" href={siteUrl} />

        {/* Open Graph */}
        <meta property="og:title" content="SeenWeb — San phẳng cuộc chơi YouTube bằng sức mạnh AI" />
        <meta
          property="og:description"
          content="Nền tảng AI giúp YouTuber sáng tạo nội dung và phát triển kênh nhanh hơn bao giờ hết."
        />
        
<meta property="og:image" content={ogImage} />
        <meta property="og:url" content={siteUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SeenWeb — San phẳng cuộc chơi YouTube bằng sức mạnh AI" />
        <meta
          name="twitter:description"
          content="AI đồng hành cùng YouTuber.
Viết, phân tích, tối ưu video hiệu quả."
        />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD Schema cho homepage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
     
           "@type": "WebSite",
              name: "SeenWeb",
              url: siteUrl,
              description:
                "SeenWeb là nền tảng AI giúp sáng tạo nội dung và phát triển kênh YouTube nhanh hơn.",
              
 publisher: {
                "@type": "Organization",
                name: "SeenWeb",
                logo: `${siteUrl}/thumbnail.jpg`,
              },
            }),
          }}
        />
    
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
            <PricingTable />
            <AffiliateSection />
            <FinalCTA />
          </main>
          <Footer />
          
 <ChatbotWidget />
        </>
      ) : (
        <div className="min-h-screen bg-[#0A1929] flex items-center justify-center text-[#CDAD5A]"> {/* ĐÃ SỬA: Dark Navy */}
          Đang tải giao diện...
        </div>
      )}
    </div>
  );
}
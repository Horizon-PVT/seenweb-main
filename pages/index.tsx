// File: pages/index.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head'; // ✅ thêm Head để SEO
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutUs from '../components/AboutUs';
import TechPillars from '../components/TechPillars';
import ToolsGrid from '../components/ToolsGrid';
import Partners from '../components/Partners';
import Projects from '../components/Projects';
import Testimonials from '../components/Testimonials';
import PricingTable from '../components/PricingTable';
import AffiliateSection from '../components/AffiliateSection';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ChatbotWidget';

const HomePage: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    setIsClient(true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="font-montserrat bg-black reflective-glare-bg">
      <Head>
        {/* ✅ SEO cơ bản */}
        <title>SeenYT - Sáng phẳng cuộc chơi YouTube bằng sức mạnh AI</title>
        <meta
          name="description"
          content="SeenYT giúp sáng tạo nội dung YouTube dễ dàng hơn với công cụ AI mạnh mẽ, hỗ trợ viết kịch bản, SEO, phân tích kênh và tối ưu video."
        />
        <meta
          name="keywords"
          content="SeenYT, YouTube AI, SEO YouTube, viết kịch bản, công cụ YouTube, trợ lý sáng tạo, AI cho YouTuber"
        />
        <meta httpEquiv="Content-Language" content="vi" />

        {/* ✅ Open Graph (khi share Facebook, Zalo, Messenger) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SeenYT - Sáng phẳng cuộc chơi YouTube" />
        <meta
          property="og:description"
          content="Nền tảng AI giúp YouTuber sáng tạo nội dung và phát triển kênh nhanh hơn bao giờ hết."
        />
        <meta property="og:url" content="https://seenyt.net" />
        <meta property="og:image" content="https://seenyt.net/thumbnail.jpg" />

        {/* ✅ Twitter card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SeenYT - Sáng phẳng cuộc chơi YouTube" />
        <meta
          name="twitter:description"
          content="SeenYT - AI đồng hành cùng YouTuber. Viết, phân tích, tối ưu video hiệu quả."
        />
        <meta name="twitter:image" content="https://seenyt.net/thumbnail.jpg" />

        {/* ✅ Favicon */}
        <link rel="icon" href="/favicon.ico" />
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
        <div className="min-h-screen bg-black flex items-center justify-center text-[#CDAD5A]">
          Đang tải giao diện...
        </div>
      )}
    </div>
  );
};

export default HomePage;

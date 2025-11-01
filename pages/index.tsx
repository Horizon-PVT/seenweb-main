// File: pages/index.tsx (ĐÃ THÊM HYDRATION FIX)
import React, { useEffect, useState } from 'react'; // <--- Thêm useState
// Sửa đường dẫn dứt khoát: dùng ../ để thoát khỏi folder pages
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
  const [isClient, setIsClient] = useState(false); // <--- Trạng thái mới

  useEffect(() => {
    // 1. Logic Mouse Tracking
    const handleMouseMove = (event: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 2. Kích hoạt render phía Client
    setIsClient(true);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

return (
    // Nội dung chính của ứng dụng
    <div className="font-montserrat bg-black reflective-glare-bg">
        {/* HYDRATION FIX: Chỉ render các component dynamic sau khi xác nhận chạy ở Client */}
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
          // Hiển thị nội dung tĩnh tối thiểu trong khi chờ Hydration
          <div className="min-h-screen bg-black flex items-center justify-center text-[#CDAD5A]">Đang tải giao diện...</div>
        )}
    </div>
  );
};

export default HomePage;
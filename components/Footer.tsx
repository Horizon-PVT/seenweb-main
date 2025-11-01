
import React from 'react';
import dynamic from 'next/dynamic'; // <-- 1. Import công cụ "dynamic"
const CodeRain = dynamic(
  () => import('./CodeRain'), // Tải file 'CodeRain.tsx'
  { ssr: false } // <-- Quan trọng: Báo Next.js không chạy cái này trên server
);

const Footer: React.FC = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="relative bg-black border-t border-gray-800/50 pt-16 pb-8 overflow-hidden">
      <CodeRain />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-2xl font-playfair font-bold text-[#CDAD5A] tracking-widest mb-4">SeenYT</h4>
            <p className="text-gray-500 max-w-md">Sang phẳng cuộc chơi YouTube bằng sức mạnh của AI tiên tiến nhất.</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Điều Hướng</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="hover:text-[#CDAD5A]">Thông Tin</a></li>
              <li><a href="#tools" onClick={(e) => handleNavClick(e, '#tools')} className="hover:text-[#CDAD5A]">Công Cụ</a></li>
              <li><a href="#pricing" onClick={(e) => handleNavClick(e, '#pricing')} className="hover:text-[#CDAD5A]">Bảng Giá</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Pháp Lý</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-[#CDAD5A]">Điều Khoản Dịch Vụ</a></li>
              <li><a href="#" className="hover:text-[#CDAD5A]">Chính Sách Bảo Mật</a></li>
              <li><a href="#" className="hover:text-[#CDAD5A]">Liên Hệ</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800/50 pt-6 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} SeenYT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
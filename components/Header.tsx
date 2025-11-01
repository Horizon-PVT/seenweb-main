// File: components/Header.tsx
import React, { useState } from 'react';
import AuthModal from './AuthModal'; // Import modal mới

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State quản lý modal

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-gray-800/50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="relative text-2xl font-playfair font-bold text-[#CDAD5A] tracking-widest cursor-pointer">
          SeenYT
          <span className="absolute top-0 left-0 w-full h-full animate-metallic-sheen"></span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="text-[#008080] hover:text-[#00b3b3] transition-colors duration-300 font-semibold">THÔNG TIN</a>
          <a href="#tools" onClick={(e) => handleNavClick(e, '#tools')} className="text-[#008080] hover:text-[#00b3b3] transition-colors duration-300 font-semibold">10 CÔNG CỤ</a>
          <a href="#pricing" onClick={(e) => handleNavClick(e, '#pricing')} className="text-[#008080] hover:text-[#00b3b3] transition-colors duration-300 font-semibold">BẢNG GIÁ</a>
        </nav>
        <div className="flex items-center space-x-4">
          <button onClick={openModal} className="text-gray-300 hover:text-white transition-colors">ĐĂNG NHẬP</button>
          <button onClick={openModal} className="bg-[#008080] text-white font-bold py-2 px-5 border border-[#008080] rounded-sm transition-all duration-300 hover:bg-transparent hover:text-[#008080] hover:shadow-[0_0_15px_#008080]">
            ĐĂNG KÍ
          </button>
        </div>
      </div>
      
      {/* RENDER MODAL */}
      <AuthModal isOpen={isModalOpen} onClose={closeModal} />

    </header>
  );
};

export default Header;
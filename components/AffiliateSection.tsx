import React from 'react';

const AffiliateSection: React.FC = () => {
  return (
    <section id="affiliate" className="py-20 border-t border-gray-800/50">
      <div className="container mx-auto px-6 text-center flex flex-col items-center">
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-[#CDAD5A] rounded-full animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute inset-4 border border-[#008080] rounded-full animate-[spin_15s_linear_reverse_infinite]"></div>
          
          <div className="w-24 h-24 [transform-style:preserve-3d] animate-[spin-cube_20s_infinite_linear]">
            <div className="cube-face" style={{transform: 'rotateY(0deg) translateZ(48px)'}}>30%</div>
            <div className="cube-face" style={{transform: 'rotateY(90deg) translateZ(48px)'}}>TRỌN ĐỜI</div>
            <div className="cube-face" style={{transform: 'rotateY(180deg) translateZ(48px)'}}>30%</div>
            <div className="cube-face" style={{transform: 'rotateY(-90deg) translateZ(48px)'}}>TRỌN ĐỜI</div>
            <div className="cube-face" style={{transform: 'rotateX(90deg) translateZ(48px)'}}>HOA HỒNG</div>
            <div className="cube-face" style={{transform: 'rotateX(-90deg) translateZ(48px)'}}>HOA HỒNG</div>
          </div>

        </div>
        <h2 className="text-4xl font-playfair text-white mb-4">Lời Thề Của Tinh Hoa</h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Gia nhập hệ thống: <span className="text-[#CDAD5A] font-bold">30% Hoa Hồng Trọn Đời</span> cho mỗi khai sáng thành công.
        </p>
        <button className="bg-transparent text-[#008080] font-bold py-3 px-8 border-2 border-[#008080] rounded-sm transition-all duration-300 hover:bg-[#008080] hover:text-white hover:shadow-[0_0_15px_#008080]">
          Trở Thành Đồng Minh
        </button>
      </div>
    </section>
  );
};

export default AffiliateSection;
import React, { useState } from 'react';

const TechPillars: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  // 14 trang preview (dùng page1.jpg đến page14.jpg anh đã upload)
  const pages = Array.from({ length: 14 }, (_, i) => ({
    thumb: `/ebook/page${i + 1}.jpg`,
    full: `/ebook/page${i + 1}.jpg`,
  }));

  return (
    <section className="py-20 bg-gradient-to-b from-black to-[#0A1929] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Title + Subtitle giống cover PDF */}
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
          Kỷ Nguyên Mới Cho Nhà Sáng Tạo YouTube
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          Giải phóng toàn bộ tiềm năng sáng tạo và thu nhập của bạn với Trí Tuệ Nhân Tạo.
        </p>

        {/* Main cover image – giống hình anh gửi mới nhất */}
        <div className="relative inline-block mb-12 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#008080] to-[#CDAD5A] rounded-3xl blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
          <img
            src="/cover.jpg" // Anh upload hình crystal YouTube neural anh gửi vào public/cover.jpg
            alt="Kỷ Nguyên Mới Cho Nhà Sáng Tạo YouTube - SeenYT AI"
            className="relative z-10 w-full max-w-3xl object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Carousel preview 14 trang PDF chạy ngang chậm lặp */}
        <div className="relative max-w-6xl mx-auto group mb-12">
          <div className="flex animate-marquee-slow group-hover:animation-paused gap-8 py-8">
            {[...pages, ...pages].map((page, idx) => (
              <img
                key={idx}
                src={page.thumb}
                alt={`Preview trang ${idx % 14 + 1} e-book SeenYT`}
                className="w-56 h-80 object-cover rounded-xl shadow-2xl cursor-pointer hover:scale-110 transition-transform duration-300 flex-shrink-0 border-4 border-gray-800 hover:border-[#CDAD5A]"
                onClick={() => setSelectedPage(idx % 14)}
              />
            ))}
          </div>
        </div>

        {/* Logo SeenYT dưới (không button tải tạm thời) */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#008080] to-[#CDAD5A] rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <span className="text-5xl">▶️</span>
            </div>
            <h3 className="text-5xl font-black text-[#CDAD5A] tracking-wider drop-shadow-lg">SeenYT</h3>
          </div>
        </div>
      </div>

      {/* Modal phóng to trang khi click thumbnail */}
      {selectedPage !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8" onClick={() => setSelectedPage(null)}>
          <div className="relative max-w-5xl max-h-full">
            <img
              src={pages[selectedPage].full}
              alt={`Trang ${selectedPage + 1} full`}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
            <button onClick={() => setSelectedPage(null)} className="absolute top-6 right-6 text-white text-6xl font-bold hover:text-[#CDAD5A] transition">
              ×
            </button>
            {selectedPage > 0 && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedPage(selectedPage - 1); }} className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-6xl hover:text-[#CDAD5A] transition">
                ‹
              </button>
            )}
            {selectedPage < pages.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedPage(selectedPage + 1); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-6xl hover:text-[#CDAD5A] transition">
                ›
              </button>
            )}
            <p className="text-center text-gray-300 mt-8 text-3xl font-bold">Trang {selectedPage + 1} / 14</p>
          </div>
        </div>
      )}

      {/* CSS carousel chậm lặp + pause hover */}
      <style jsx>{`
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 100s linear infinite; /* Siêu chậm: 100s/vòng – anh chỉnh số lớn hơn nếu muốn chậm hơn */
        }
        .group:hover .animate-marquee-slow {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TechPillars;
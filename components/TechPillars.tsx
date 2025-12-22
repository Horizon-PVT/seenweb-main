import React, { useState } from 'react';

const TechPillars: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const pages = Array.from({ length: 14 }, (_, i) => ({
    thumb: `/ebook/page${i + 1}.jpg`,
    full: `/ebook/page${i + 1}.jpg`,
  }));

  return (
    <section className="py-16 bg-gradient-to-b from-black to-[#0A1929]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Kỷ Nguyên Mới Cho Nhà Sáng Tạo YouTube
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          Giải phóng toàn bộ tiềm năng sáng tạo và thu nhập của bạn với Trí Tuệ Nhân Tạo.
        </p>

        {/* Carousel preview 14 trang – nhỏ gọn, chạy chậm */}
        <div className="relative max-w-5xl mx-auto group mb-10">
          <div className="flex animate-marquee-slow group-hover:animation-paused gap-6 py-6">
            {[...pages, ...pages].map((page, idx) => (
              <img
                key={idx}
                src={page.thumb}
                alt={`Preview trang ${idx % 14 + 1}`}
                className="w-40 h-56 object-cover rounded-lg shadow-xl cursor-pointer hover:scale-110 transition-transform duration-300 flex-shrink-0 border-4 border-gray-800 hover:border-[#CDAD5A]"
                onClick={() => setSelectedPage(idx % 14)}
              />
            ))}
          </div>
        </div>

        {/* Logo nhỏ đơn giản + text SeenYT */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-gradient-to-br from-[#008080] to-[#CDAD5A] rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-6xl">▶️</span>
          </div>
          <h3 className="text-4xl font-black text-[#CDAD5A] tracking-wider">SeenYT</h3>
        </div>
      </div>

      {/* Modal phóng to */}
      {selectedPage !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8" onClick={() => setSelectedPage(null)}>
          <div className="relative max-w-4xl max-h-full">
            <img
              src={pages[selectedPage].full}
              alt={`Trang ${selectedPage + 1} full`}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
            <button onClick={() => setSelectedPage(null)} className="absolute top-4 right-4 text-white text-5xl font-bold hover:text-[#CDAD5A]">
              ×
            </button>
            {selectedPage > 0 && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedPage(selectedPage - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-[#CDAD5A]">
                ‹
              </button>
            )}
            {selectedPage < pages.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedPage(selectedPage + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-[#CDAD5A]">
                ›
              </button>
            )}
            <p className="text-center text-gray-300 mt-6 text-2xl font-bold">Trang {selectedPage + 1} / 14</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 100s linear infinite;
        }
        .group:hover .animate-marquee-slow {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TechPillars;
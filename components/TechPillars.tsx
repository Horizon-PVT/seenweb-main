import React, { useState } from 'react';

interface EbookData {
  id: string;
  title: string;
  coverImageUrl: string | null;
  pdfUrl: string;
  description: string | null;
}

interface TechPillarsProps {
  ebooks: EbookData[];
}

const TechPillars: React.FC<TechPillarsProps> = ({ ebooks = [] }) => {
  const [selectedEbook, setSelectedEbook] = useState<EbookData | null>(null);

  const openPDF = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  if (ebooks.length === 0) {
    return null; // Don't render if no ebooks
  }

  return (
    <section className="py-16 bg-gradient-to-b from-black to-[#0A1929]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Kỷ Nguyên Mới Cho Nhà Sáng Tạo YouTube
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          Giải phóng toàn bộ tiềm năng sáng tạo và thu nhập của bạn với Trí Tuệ Nhân Tạo.
        </p>

        {/* Ebook carousel */}
        <div className="relative max-w-5xl mx-auto group mb-10">
          <div className="flex animate-marquee-slow group-hover:animation-paused gap-6 py-6">
            {[...ebooks, ...ebooks].map((ebook, idx) => (
              <div
                key={`${ebook.id}-${idx}`}
                className="w-64 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => openPDF(ebook.pdfUrl)}
              >
                {ebook.coverImageUrl ? (
                  <img
                    src={ebook.coverImageUrl}
                    alt={ebook.title}
                    className="w-full h-80 object-cover rounded-lg shadow-xl border-4 border-gray-800 hover:border-[#CDAD5A]"
                  />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-[#008080] to-[#CDAD5A] rounded-lg shadow-xl border-4 border-gray-800 hover:border-[#CDAD5A] flex items-center justify-center">
                    <span className="text-white text-xl font-bold text-center px-4">{ebook.title}</span>
                  </div>
                )}
                <h3 className="text-white font-bold mt-4 text-center">{ebook.title}</h3>
                {ebook.description && (
                  <p className="text-gray-400 text-sm mt-2 text-center line-clamp-2">{ebook.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-gradient-to-br from-[#008080] to-[#CDAD5A] rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-6xl">▶️</span>
          </div>
          <h3 className="text-4xl font-black text-[#CDAD5A] tracking-wider">SeenYT</h3>
        </div>
      </div>

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
import React from 'react';

const PillarCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="group flex flex-col items-center p-6 border border-gray-800/50 bg-black/30 backdrop-blur-sm rounded-lg transition-all duration-500 hover:border-[#CDAD5A]/50 hover:-translate-y-2">
    <div className="h-24 w-24 mb-4 flex items-center justify-center">{children}</div>
    <h3 className="text-2xl font-playfair text-white group-hover:text-[#CDAD5A] transition-colors">{title}</h3>
  </div>
);

const TechPillars: React.FC = () => {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl text-center font-playfair text-[#CDAD5A] mb-4">Phổ Công Nghệ</h2>
        <p className="text-xl text-center text-gray-400 mb-12">Cơ Chế Khai Sáng</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PillarCard title="LÕI GNOSIS">
            <div className="w-20 h-20 relative [transform-style:preserve-3d] animate-[spin_20s_linear_infinite]">
                <div className="absolute w-full h-full border-2 border-[#8B0000] opacity-70 flex items-center justify-center [transform:rotateY(0deg)_translateZ(40px)]">古</div>
                <div className="absolute w-full h-full border-2 border-[#8B0000] opacity-70 flex items-center justify-center [transform:rotateY(90deg)_translateZ(40px)]">代</div>
                <div className="absolute w-full h-full border-2 border-[#8B0000] opacity-70 flex items-center justify-center [transform:rotateY(180deg)_translateZ(40px)]">文</div>
                <div className="absolute w-full h-full border-2 border-[#8B0000] opacity-70 flex items-center justify-center [transform:rotateX(90deg)_translateZ(40px)]">字</div>
            </div>
          </PillarCard>
          <PillarCard title="MẠNG NƠ-RON">
            <svg width="80" height="80" viewBox="0 0 100 100" className="overflow-visible">
              <defs>
                <filter id="glow-blue">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="10" cy="50" r="5" fill="#7DF9FF" />
              <circle cx="50" cy="10" r="5" fill="#7DF9FF" />
              <circle cx="50" cy="90" r="5" fill="#7DF9FF" />
              <circle cx="90" cy="50" r="5" fill="#7DF9FF" />
              <circle cx="50" cy="50" r="7" fill="#7DF9FF" />
              <path d="M10 50 L 50 10 L 50 50 L 10 50" stroke="#7DF9FF" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M50 10 L 90 50 L 50 50 L 50 10" stroke="#7DF9FF" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M90 50 L 50 90 L 50 50 L 90 50" stroke="#7DF9FF" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M50 90 L 10 50 L 50 50 L 50 90" stroke="#7DF9FF" strokeWidth="1" fill="none" opacity="0.5" />
              <circle cx="50" cy="50" r="3" fill="#7DF9FF" filter="url(#glow-blue)" className="animate-ping" />
            </svg>
          </PillarCard>
          <PillarCard title="CỔNG DỮ LIỆU">
            <div className="w-20 h-20 flex items-end justify-between relative">
              <div className="w-4 bg-[#CDAD5A]/50 rounded-t-sm animate-[pulse_2s_infinite_ease-in-out_0s]" style={{ height: '60%' }}></div>
              <div className="w-4 bg-[#CDAD5A]/50 rounded-t-sm animate-[pulse_2s_infinite_ease-in-out_0.5s]" style={{ height: '80%' }}></div>
              <div className="w-4 bg-[#CDAD5A]/50 rounded-t-sm animate-[pulse_2s_infinite_ease-in-out_1s]" style={{ height: '40%' }}></div>
              <div className="w-4 bg-[#CDAD5A]/50 rounded-t-sm animate-[pulse_2s_infinite_ease-in-out_1.5s]" style={{ height: '70%' }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#CDAD5A]/20 to-transparent"></div>
            </div>
          </PillarCard>
          <PillarCard title="THUẬT TOÁN ALKHEMY">
            <div className="w-20 h-20 relative">
              <div className="absolute inset-0 border-2 border-[#008080] rounded-full animate-[spin_8s_linear_infinite]"></div>
              <div className="absolute inset-2 border-2 border-[#008080] rounded-full animate-[spin_6s_linear_reverse_infinite]"></div>
              <div className="absolute inset-4 border-2 border-[#008080] rounded-full"></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#008080]/50 group-hover:bg-[#008080] transition-colors"></div>
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-[#008080]/50 group-hover:bg-[#008080] transition-colors"></div>
            </div>
          </PillarCard>
        </div>
      </div>
    </section>
  );
};

export default TechPillars;
import React from 'react';

const partners = [
  "GOOGLE AI", "OPENAI", "AWS", "MICROSOFT", "NVIDIA", "META AI"
];
const logos = [...partners, ...partners, ...partners]; // Triple for very seamless scroll

const Partners: React.FC = () => {
  return (
    <section id="partners" className="py-16 bg-black border-y border-gray-800/50 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-playfair text-[#CDAD5A] mb-2">Ấn Tín Giao Ước</h2>
        <p className="text-gray-400 mb-10">Được hậu thuẫn bởi những người khổng lồ công nghệ.</p>
        <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-24 before:bg-gradient-to-r before:from-black before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-24 after:bg-gradient-to-l after:from-black after:to-transparent after:z-10">
          <div className="flex animate-scroll-left">
            {logos.map((logo, index) => (
              <div key={index} className="flex-shrink-0 w-64 h-24 mx-8 flex items-center justify-center">
                <div 
                  className="text-3xl font-bold tracking-widest text-[#CDAD5A]/80 border-2 border-[#CDAD5A]/50 p-4 relative animate-random-flash animate-subtle-pulse"
                  style={{ 
                    textShadow: '1px 1px 0 #000, -1px -1px 0 rgba(255,255,255,0.1)', 
                    animationDelay: `${index * 0.4}s` 
                  }}
                >
                  {logo}
                   <div className="absolute inset-0 animate-metallic-sheen-overlay::after" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(0, 255, 255, 0.15) 50%, transparent 80%)', animationDuration: '5s' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
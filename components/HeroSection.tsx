// File: components/HeroSection.tsx (ĐÃ KHẮC PHỤC LỖI HYDRATION)
import React from 'react';

const CrushedIcon: React.FC = () => (
  <div className="w-1/2 h-1/2 animate-glitch">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-red-600/50" viewBox="0 0 24 24" fill="currentColor">
      {/* ĐÃ XÓA transform="skewX(-10) skewY(5) scale(0.9)" GÂY LỖI HYDRATION */}
      <path d="M21.582 7.042c-.28-.99-1.073-1.785-2.06-2.066C17.913 4.5 12 4.5 12 4.5s-5.913 0-7.522.476c-.987.28-1.78.1.076-2.06.282-1.61.475-1.78.28-2.06C.39 5.913 0 12 0 12s0 5.913.476 7.522c.28.99 1.073 1.785 2.06 2.066C4.087 19.5 12 19.5 12 19.5s5.913 0 7.522-.476c.987-.28 1.78-1.076 2.06-2.06.476-1.61.476-7.522.476-7.522s0-5.913-.476-7.522zM9.75 15.5v-7l6 3.5-6 3.5z"></path>
    </svg>
  </div>
);

const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-12 relative overflow-hidden">
      
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-[#008080] rounded-full blur-3xl animate-[pulse_5s_infinite]"></div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center [perspective:1000px]">
          <div className="relative w-56 h-56 md:w-72 md:h-72 [transform-style:preserve-3d] animate-[spin_40s_linear_infinite]">
              {[0, 60, 120, 180, 240, 300].map(deg => (
                <div key={deg} className="absolute inset-0 border border-[#CDAD5A]/30 bg-black/50 flex items-center justify-center" style={{transform: `rotateY(${deg}deg) translateZ(128px)`}}>
                  <CrushedIcon />
                </div>
              ))}
          </div>
      </div>
      
      <div className="relative z-10 p-6">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-playfair font-black text-white leading-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
          <span className="animate-liquid-pulse">SAN PHẲNG</span> CUỘC CHƠI <span className="animate-liquid-pulse" style={{ animationDelay: '0.3s' }}>YOUTUBE</span>
        </h1>
        
        <button className="bg-[#008080] text-white font-bold py-4 px-10 text-lg border-2 border-[#008080] rounded-sm transition-all duration-300 transform hover:scale-105 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow hover:emerald-glow-strong mt-12">
          KHAI SÁNG BÍ PHÁP CỦA BẠN
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
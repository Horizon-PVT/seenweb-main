import React from 'react';

const iconBaseClass = "w-full h-full transition-all duration-500";

export const PyramidIcon = () => (
  <svg viewBox="0 0 100 100" className={iconBaseClass}>
    <g className="origin-center transition-transform duration-1000 group-hover:rotate-180">
      <path d="M50 10 L10 90" stroke="#CDAD5A" strokeWidth="2" fill="none" className="transition-transform duration-500 group-hover:-translate-x-4" />
      <path d="M50 10 L90 90" stroke="#CDAD5A" strokeWidth="2" fill="none" className="transition-transform duration-500 group-hover:translate-x-4" />
      <path d="M10 90 H 90" stroke="#CDAD5A" strokeWidth="2" fill="none" className="transition-transform duration-500 group-hover:translate-y-2" />
      <path d="M50 10 L50 90" stroke="#CDAD5A" strokeWidth="1" strokeDasharray="4" className="opacity-50 group-hover:opacity-100" />
    </g>
  </svg>
);

export const PhiIcon = () => (
  <svg viewBox="0 0 100 100" className={`${iconBaseClass} overflow-visible`}>
    <circle cx="50" cy="50" r="40" stroke="#008080" strokeWidth="1" fill="none" className="opacity-0 group-hover:opacity-50 transition-opacity animate-[pulse_3s_infinite]" style={{animationDelay: '0s'}}/>
    <circle cx="50" cy="50" r="30" stroke="#008080" strokeWidth="1" fill="none" className="opacity-0 group-hover:opacity-50 transition-opacity animate-[pulse_3s_infinite]" style={{animationDelay: '0.5s'}}/>
    <circle cx="50" cy="50" r="20" stroke="#008080" strokeWidth="1" fill="none" className="opacity-0 group-hover:opacity-50 transition-opacity animate-[pulse_3s_infinite]" style={{animationDelay: '1s'}}/>
    <text x="50" y="60" fontSize="60" textAnchor="middle" fill="#008080" className="font-playfair font-bold group-hover:fill-[#CDAD5A] transition-colors animate-heat-glow">ϕ</text>
  </svg>
);

export const BinocularsIcon = () => (
  <svg viewBox="0 0 100 100" className={iconBaseClass}>
    <g className="origin-[35px_50px] transition-transform duration-500 group-hover:rotate-12">
        <circle cx="35" cy="50" r="20" stroke="#008080" strokeWidth="2" fill="none"/>
        <path d="M35 30 L20 10" stroke="#008080" strokeWidth="2" />
    </g>
    <g className="origin-[65px_50px] transition-transform duration-500 group-hover:-rotate-12">
        <circle cx="65" cy="50" r="20" stroke="#008080" strokeWidth="2" fill="none"/>
        <path d="M65 30 L80 10" stroke="#008080" strokeWidth="2" />
    </g>
    <line x1="45" y1="35" x2="55" y2="35" stroke="#008080" strokeWidth="2"/>
  </svg>
);

export const PortalIcon = () => (
    <g className="transform-gpu group-hover:scale-110 transition-transform duration-500">
      <rect x="20" y="20" width="60" height="60" rx="30" stroke="#008080" strokeWidth="2" fill="none" className="animate-[spin_10s_linear_infinite]" />
      <rect x="25" y="25" width="50" height="50" rx="25" stroke="#CDAD5A" strokeWidth="1" fill="none" className="animate-[spin_8s_linear_reverse_infinite]" />
      <text x="50" y="55" fontSize="12" textAnchor="middle" fill="#008080" className="opacity-0 group-hover:opacity-100 transition-opacity tracking-widest font-mono animate-pulse">DECODE</text>
    </g>
);

export const HourglassIcon = () => (
    <g className="transform-gpu group-hover:rotate-[180deg] transition-transform duration-1000">
      <path d="M30 20 H70 L50 50 Z" stroke="#008080" strokeWidth="2" fill="#008080" fillOpacity="0.2" />
      <path d="M30 80 H70 L50 50 Z" stroke="#008080" strokeWidth="2" fill="#008080" fillOpacity="0.8" />
    </g>
);

export const GearIcon = () => (
    <svg viewBox="0 0 100 100" className={iconBaseClass}>
        <path d="M 50,5 A 45,45 0 0 1 50,95 A 45,45 0 0 1 50,5 Z M 50,20 A 30,30 0 0 0 50,80 A 30,30 0 0 0 50,20 Z" fill="#CDAD5A" fillRule="evenodd"/>
        <path d="M 40,0 L 60,0 60,100 40,100 Z" fill="#CDAD5A" transform="rotate(30, 50, 50)"/>
        <path d="M 40,0 L 60,0 60,100 40,100 Z" fill="#CDAD5A" transform="rotate(90, 50, 50)"/>
        <path d="M 40,0 L 60,0 60,100 40,100 Z" fill="#CDAD5A" transform="rotate(150, 50, 50)"/>
        <g className="animate-[spin_10s_linear_infinite]">
            <circle cx="50" cy="50" r="15" fill="none" stroke="#008080" strokeWidth="2" strokeDasharray="5 5"/>
        </g>
    </svg>
);

export const CubeIcon = () => (
    <g className="transform-gpu [transform-style:preserve-3d]">
        <rect x="30" y="30" width="40" height="40" stroke="#008080" strokeWidth="2" fill="none" className="transition-transform duration-500 group-hover:[transform:translateZ(10px)]" />
        <rect x="30" y="30" width="40" height="40" stroke="#008080" strokeWidth="1" fill="none" className="opacity-50 transition-transform duration-500 group-hover:[transform:translateZ(-10px)]" />
        <rect x="30" y="30" width="40" height="40" stroke="#008080" strokeWidth="1" fill="none" className="opacity-25 transition-transform duration-500 group-hover:[transform:translateZ(-20px)]" />
    </g>
);

export const CompassIcon = () => (
    <svg viewBox="0 0 100 100" className={`${iconBaseClass} overflow-visible`}>
      <defs>
        <filter id="compass-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
      </defs>
      <g className="transform-gpu transition-transform duration-500 group-hover:scale-110">
        <circle cx="50" cy="50" r="45" stroke="#CDAD5A" strokeWidth="1" fill="none" opacity="0.5" />
        <g className="animate-[spin_20s_linear_infinite]">
            <circle cx="50" cy="50" r="40" stroke="#008080" strokeWidth="2" strokeDasharray="5 15" fill="none" />
            <path d="M 50 10 V 20 M 50 80 V 90 M 10 50 H 20 M 80 50 H 90" stroke="#008080" strokeWidth="2"/>
        </g>
         <g className="animate-[spin_15s_linear_reverse_infinite]">
            <circle cx="50" cy="50" r="30" stroke="#CDAD5A" strokeWidth="1" fill="none" opacity="0.7"/>
        </g>
        <g className="group-hover:rotate-[-25deg] transition-transform duration-700">
           <path d="M50 25 L55 50 L50 75 L45 50 Z" fill="#CDAD5A" filter="url(#compass-glow)" />
           <circle cx="50" cy="50" r="4" fill="#008080" />
        </g>
      </g>
    </svg>
);


export const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#CDAD5A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={iconBaseClass}>
    <g className="group-hover:[transform:rotateY(15deg)] origin-left transition-transform duration-500">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <path d="M9 7h6" className="stroke-[#008080] group-hover:animate-pulse"/>
      <path d="M9 12h3" className="stroke-[#008080] group-hover:animate-pulse" style={{animationDelay: '0.2s'}}/>
    </g>
  </svg>
);


export const MicrophoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`${iconBaseClass} stroke-[#CDAD5A]`}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
        <g className="stroke-[#008080] opacity-0 group-hover:opacity-100 transition-opacity">
            <path d="M5.3 15.3a5 5 0 0 1 0-6.6" className="animate-[pulse_1.5s_infinite_ease-out]"/>
            <path d="M18.7 15.3a5 5 0 0 0 0-6.6" className="animate-[pulse_1.5s_infinite_ease-out_0.2s]"/>
        </g>
    </svg>
);

export const AssemblingCubeIcon = () => (
    <svg viewBox="0 0 100 100" className={`${iconBaseClass} [transform-style:preserve-3d]`}>
        <g className="[transform:translate3d(50px,50px,0px)]">
            {/* Front */}
            <rect width="50" height="50" fill="rgba(0,128,128,0.3)" stroke="#008080" strokeWidth="1" className="assembling-cube-piece [transform:translate3d(-25px,-25px,25px)]" style={{ animationDelay: '0s' }} />
            {/* Back */}
            <rect width="50" height="50" fill="rgba(0,128,128,0.3)" stroke="#008080" strokeWidth="1" className="assembling-cube-piece [transform:translate3d(-25px,-25px,-25px)]" style={{ animationDelay: '0.2s' }} />
            {/* Left */}
            <rect width="50" height="50" fill="rgba(0,128,128,0.3)" stroke="#008080" strokeWidth="1" className="assembling-cube-piece [transform:rotateY(-90deg)_translate3d(-25px,-25px,25px)]" style={{ animationDelay: '0.4s' }} />
            {/* Right */}
            <rect width="50" height="50" fill="rgba(0,128,128,0.3)" stroke="#008080" strokeWidth="1" className="assembling-cube-piece [transform:rotateY(90deg)_translate3d(-25px,-25px,25px)]" style={{ animationDelay: '0.6s' }} />
            {/* Top */}
            <rect width="50" height="50" fill="rgba(0,128,128,0.3)" stroke="#008080" strokeWidth="1" className="assembling-cube-piece [transform:rotateX(90deg)_translate3d(-25px,-25px,25px)]" style={{ animationDelay: '0.8s' }} />
            {/* Bottom */}
            <rect width="50" height="50" fill="rgba(0,128,128,0.3)" stroke="#008080" strokeWidth="1" className="assembling-cube-piece [transform:rotateX(-90deg)_translate3d(-25px,-25px,25px)]" style={{ animationDelay: '1s' }} />
        </g>
    </svg>
);
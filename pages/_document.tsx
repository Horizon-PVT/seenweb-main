// File: pages/_document.tsx (FINAL FIX - ĐÃ BAO GỒM TẤT CẢ KEYFRAME VÀ GLOWS)
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* 1. Tải Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Playfair+Display:wght@700;900&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />

        {/* 2. CUSTOM STYLES HOÀN CHỈNH (KHẮC PHỤC HIỆU ỨNG THIẾU) */}
        <style dangerouslySetInnerHTML={{__html: `
          html {
            scroll-behavior: smooth;
          }
          body {
            background-color: #000000;
            color: #E0E0E0;
            overflow-x: hidden;
          }
          .font-playfair {
            font-family: 'Playfair Display', serif;
          }
          .font-montserrat {
            font-family: 'Montserrat', sans-serif;
          }
          .font-bangers {
            font-family: 'Bangers', cursive;
          }
          /* --- CUSTOM GLOWS VÀ MOUSE TRACKING --- */
          .reflective-glare-bg::before {
            content: '';
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            background: radial-gradient(
              circle 500px at var(--mouse-x, -500px) var(--mouse-y, -500px),
              rgba(255, 255, 255, 0.04),
              transparent 80%
            );
            transition: background-position 0.1s linear;
            z-index: 1000;
          }
          .emerald-glow {
            box-shadow: 0 0 5px #008080, 0 0 15px #008080, 0 0 25px #008080;
          }
          .emerald-glow-strong {
            box-shadow: 0 0 10px #00ffc8, 0 0 30px #00ffc8, 0 0 50px #00ffc8;
          }
          .bronze-glow-strong {
            box-shadow: 0 0 10px #CDAD5A, 0 0 30px #CDAD5A, 0 0 50px #CDAD5A;
          }
          /* --- KEYFRAMES QUAN TRỌNG (ĐÃ BỊ THIẾU) --- */
          @keyframes metallic-sheen {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-metallic-sheen-overlay::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(90deg, transparent 20%, rgba(255, 255, 255, 0.2) 50%, transparent 80%);
            background-size: 200% 100%;
            animation: metallic-sheen 4s infinite linear;
            pointer-events: none;
          }
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-left {
            animation: scroll-left 60s linear infinite;
          }
          @keyframes code-rain { /* FOOTER CODE RAIN */
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes spin-cube { /* AFFILIATE ICON 3D */
            0% { transform: rotateX(0deg) rotateY(0deg); }
            100% { transform: rotateX(360deg) rotateY(360deg); }
          }
          @keyframes liquid-metal-pulse { /* HERO TEXT PULSE (BỊ THIẾU) */
            0%, 100% {
              transform: scale(1);
              text-shadow: 0 0 5px #CDAD5A, 0 0 10px #CDAD5A;
            }
            50% {
              transform: scale(1.05);
              text-shadow: 0 0 15px #CDAD5A, 0 0 30px #CDAD5A, 0 0 45px #b18e47;
            }
          }
          .animate-liquid-pulse {
            display: inline-block;
            animation: liquid-metal-pulse 4s ease-in-out infinite;
          }
          @keyframes artifact-pulse { /* TOOLS GRID ICON (BỊ THIẾU) */
            0%, 100% { transform: scale(0.95) rotate(0deg); box-shadow: 0 0 30px -10px #008080; }
            50% { transform: scale(1) rotate(45deg); box-shadow: 0 0 50px 0px #008080; }
          }
          .artifact {
            animation: artifact-pulse 8s ease-in-out infinite;
          }
          /* --- CÁC STYLE VÀ ANIMATIONS CỦA CÁC THẺ KHÁC --- */
          .cube-face {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            width: 100%;
            height: 100%;
            border: 1px solid #CDAD5A;
            background: rgba(205, 173, 90, 0.1);
            font-size: 2.5rem;
            color: #CDAD5A;
            font-family: 'Playfair Display', serif;
          }
          /* --- FORM OBSIDIAN VÀ INPUTS (ĐÃ KHẮC PHỤC VĨNH VIỄN) --- */
          .obsidian-input, .obsidian-select, .obsidian-textarea {
            background-color: #0A0A0A;
            border: 1px solid #4A4A4A;
            color: #E0E0E0;
            padding: 0.75rem;
            border-radius: 2px;
            transition: border-color 0.3s, box-shadow 0.3s;
          }
          .obsidian-input:focus, .obsidian-select:focus, .obsidian-textarea:focus {
            outline: none;
            border-color: #008080;
            box-shadow: 0 0 10px #008080;
          }
          .obsidian-input.bronze:focus, .obsidian-select.bronze:focus, .obsidian-textarea.bronze:focus {
            outline: none;
            border-color: #CDAD5A;
            box-shadow: 0 0 10px #CDAD5A;
          }
          .file-input-area {
            border: 2px dashed #4A4A4A;
            background-color: #0A0A0A;
            transition: border-color 0.3s;
          }
          .file-input-area:hover {
            border-color: #CDAD5A;
          }
        `}} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
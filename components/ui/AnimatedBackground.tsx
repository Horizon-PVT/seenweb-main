import React from 'react';

const AnimatedBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#050510]">
            {/* Deep Space Base */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050510] to-[#050510]"></div>

            {/* Aurora Orb 1 */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow mix-blend-screen"></div>

            {/* Aurora Orb 2 */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[100px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }}></div>

            {/* Moving Nebulas */}
            <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/10 blur-[80px] animate-float opacity-50"></div>

            {/* Grid Overlay for Tech feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>

            {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>
    );
};

export default AnimatedBackground;

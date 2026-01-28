import React from 'react';

interface AudioVisualizerProps {
    isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
    return (
        <div className="flex items-center justify-center gap-[2px] h-12 w-full overflow-hidden opacity-80">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className={`w-1 rounded-full bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all duration-300 ${isPlaying ? 'animate-waveform' : 'h-1'
                        }`}
                    style={{
                        height: isPlaying ? '100%' : '4px',
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: '0.8s'
                    }}
                ></div>
            ))}
        </div>
    );
};

export default AudioVisualizer;

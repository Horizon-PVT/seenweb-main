
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/components/UpgradeModal';
import {
  Search,
  ArrowLeft,
  Anchor,
  Map,
  Radar,
  TrendingUp,
  PlayCircle,
  Users,
  Activity,
  Globe
} from 'lucide-react';

// --- TYPES (Strictly Preserved from Original) ---
interface RisingChannel {
  name: string;
  url: string;
  subscribers: string;
  growthMetric: string;
  coreStrengths: string[];
  thumbnail: string;
}

interface TrendingVideo {
  title: string;
  url: string;
  viralRatio: string;
  viralStructure: string[];
  thumbnail: string;
}

interface OutputData {
  risingChannels: RisingChannel[];
  trendingVideos: TrendingVideo[];
  upcomingTrends: string[];
}

// ... imports ...
import { useTranslation } from 'next-i18next';

// ... types ...

const RadarVisualizer: React.FC = () => (
  <section className="flex flex-col items-center my-12 animate-in fade-in duration-700">
    <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
      {/* Outer Circles */}
      <div className="absolute inset-0 border border-[#00F3FF]/20 rounded-full"></div>
      <div className="absolute inset-[15%] border border-[#00F3FF]/15 rounded-full"></div>
      <div className="absolute inset-[30%] border border-[#00F3FF]/10 rounded-full"></div>
      <div className="absolute inset-[45%] border border-[#00F3FF]/5 rounded-full"></div>
      
      {/* Rotating Sweep */}
      <div className="absolute inset-0">
        <div className="radar-line absolute top-1/2 left-1/2 h-[2px] w-[50%] origin-left" style={{marginTop: '-1px'}}></div>
      </div>
      
      {/* Detected 'Underdog' Points */}
      <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-[#00F3FF] rounded-full shadow-[0_0_10px_#00F3FF] animate-pulse"></div>
      <div className="absolute bottom-[35%] right-[25%] w-1.5 h-1.5 bg-[#00F3FF]/60 rounded-full shadow-[0_0_8px_#00F3FF] animate-bounce"></div>
      <div className="absolute top-[60%] left-[15%] w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_12px_#3B82F6] animate-pulse" style={{animationDelay: "1s"}}></div>
      <div className="absolute top-[40%] right-[10%] w-1.5 h-1.5 bg-[#00F3FF] rounded-full animate-ping" style={{animationDuration: "3s"}}></div>
      
      {/* Center Hub */}
      <div className="relative z-10 w-12 h-12 bg-[#0A0B10] border-2 border-[#00F3FF] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.5)]">
        <div className="w-4 h-4 bg-[#00F3FF] rounded-full animate-pulse"></div>
      </div>
    </div>
    <div className="mt-8 text-center">
      <p className="text-xs text-[#00F3FF] uppercase tracking-[0.3em] font-bold animate-pulse">Quét tần số thấp... Đang thu nhận tín hiệu</p>
    </div>
  </section>
);

interface HiddenChannelFinderToolProps {
  onBack?: () => void;
}

export default function HiddenChannelFinderTool({ onBack }: HiddenChannelFinderToolProps) {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<OutputData | null>(null);
  const [seedQuery, setSeedQuery] = useState('');
  const [outputLanguage, setOutputLanguage] = useState('Tiếng Việt');
  const [showUpgrade, setShowUpgrade] = useState(false); // NEW: Upgrade modal state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedQuery.trim()) {
      setError('Please enter a keyword to start scanning.');
      return;
    }

    setIsLoading(true);
    setError('');
    setOutput(null);

    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'hidden', // STRICTLY KEEPING ORIGINAL LOGIC
          macroNiche: seedQuery,
          outputLanguage,
        }),
      });

      if (!res.ok) {
        // FIX: Check for PLAN errors from API response
        const errData = await res.json().catch(() => ({}));
        const errStr = String(errData.error || '').toUpperCase();
        if (res.status === 403 || errStr.includes('PLAN') || errStr.includes('QUOTA') || errStr.includes('LOCKED') || errStr.includes('LIMIT')) {
          setShowUpgrade(true);
          setIsLoading(false);
          return;
        }
        throw new Error(errData.error || 'Server connection lost. Please retry.');
      }

      const data = await res.json();

      // Data Safety Check
      data.risingChannels = Array.isArray(data.risingChannels) ? data.risingChannels : [];
      data.trendingVideos = Array.isArray(data.trendingVideos) ? data.trendingVideos : [];
      data.upcomingTrends = Array.isArray(data.upcomingTrends) ? data.upcomingTrends : [];

      setOutput(data);
    } catch (err: any) {
      // FIX: Safety net for PLAN errors in catch block
      const errStr = String(err.message || '').toUpperCase();
      if (errStr.includes('PLAN') || errStr.includes('QUOTA') || errStr.includes('LOCKED') || errStr.includes('LIMIT')) {
        setShowUpgrade(true);
      } else {
        setError(err.message || 'Sonar malfunction. Scan failed.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-[#0A0B10] text-cyan-50 font-sans selection:bg-cyan-500 selection:text-black overflow-y-auto overflow-x-hidden">
      
      {/* NEW DEEP OCEAN UI: Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .grid-overlay {
          background-image: radial-gradient(circle at 2px 2px, rgba(0, 243, 255, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .glow-text {
          text-shadow: 0 0 20px rgba(0, 243, 255, 0.5);
        }
        .glass-panel-sonar {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 243, 255, 0.2);
          box-shadow: inset 0 0 30px rgba(0, 243, 255, 0.05);
        }
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-line {
          background: linear-gradient(90deg, rgba(0, 243, 255, 0) 0%, rgba(0, 243, 255, 0.8) 100%);
          animation: radar-sweep 4s linear infinite;
        }
        .scanning-laser {
          background: linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.4), transparent);
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: -100%;
          animation: laser-move 2s ease-in-out infinite;
        }
        @keyframes laser-move {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}} />

      {/* Deep Sea Background Effects */}
      <div className="fixed inset-0 grid-overlay pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,255,0.1),transparent)] pointer-events-none z-0"></div>
{/* HEADER */}
      <header className="sticky top-0 left-0 right-0 h-16 bg-[#020617]/80 backdrop-blur border-b border-cyan-900/30 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-cyan-600 hover:text-cyan-400 transition-colors">
              <ArrowLeft size={18} /> <span className="text-xs font-bold tracking-widest uppercase">{t('toolUI.hiddenChannel.return')}</span>
            </button>
          )}
          <div className="h-6 w-px bg-cyan-900/50"></div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950 rounded-full border border-cyan-800">
              <Anchor size={14} className="text-cyan-400" />
            </div>
            <h1 className="text-sm font-black tracking-[0.2em] text-white">{t('toolUI.hiddenChannel.title')}</h1>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-8 px-6 pb-20 max-w-7xl mx-auto relative z-10">

                {/* HERO SEARCH */}
        <div className="max-w-4xl mx-auto mb-16 relative z-20">
          <header className="relative z-10 pt-8 pb-10 text-center px-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-4 glow-text bg-clip-text text-transparent bg-gradient-to-r from-[#00F3FF] via-[#0066FF] to-blue-600 drop-shadow-none">
              {t('toolUI.hiddenChannel.hero_title')}
            </h2>
            <p className="text-blue-300/80 text-lg md:text-xl font-light tracking-wide max-w-3xl mx-auto">
              {t('toolUI.hiddenChannel.hero_desc')}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="glass-panel-sonar w-full max-w-4xl p-8 rounded-3xl relative overflow-hidden mb-12 shadow-2xl">
            {/* Glow decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00F3FF]/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
              {/* Keyword Search Input */}
              <div className="md:col-span-7 flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#00F3FF]/60 font-bold ml-1">
                  {t('toolUI.hiddenChannel.target_label')}
                </label>
                <div className="relative group">
                  <input 
                    type="text"
                    value={seedQuery}
                    onChange={(e) => setSeedQuery(e.target.value)}
                    className="w-full bg-black/40 border-slate-700 text-white rounded-xl py-4 px-6 focus:ring-[#00F3FF] focus:border-[#00F3FF] transition-all duration-500 placeholder:text-slate-600 outline-none" 
                    placeholder="Ví dụ: Solo Camping, AI Art, Tech Reviews..."
                  />
                  <div className="scanning-laser pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              
              {/* Language Dropdown */}
              <div className="md:col-span-3 flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#00F3FF]/60 font-bold ml-1">
                  {t('toolUI.hiddenChannel.language_label')}
                </label>
                <select 
                  value={outputLanguage}
                  onChange={(e) => setOutputLanguage(e.target.value)}
                  className="w-full bg-black/40 border-slate-700 text-white rounded-xl py-4 px-6 focus:ring-[#00F3FF] focus:border-[#00F3FF] appearance-none cursor-pointer outline-none"
                >
                  <option value="Tiếng Việt">Tiếng Việt (VN)</option>
                  <option value="English">English (US)</option>
                  <option value="Global">Toàn Cầu (Global)</option>
                </select>
              </div>
              
              {/* Action Button */}
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[60px] bg-gradient-to-br from-[#0066FF] to-[#00F3FF] rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(0,243,255,0.4)] group relative overflow-hidden disabled:opacity-50 disabled:grayscale"
                >
                  <span className="absolute inset-0 bg-white/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-xl opacity-0 hover:opacity-100 peer-disabled:hidden"></span>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Radar size={20} className="text-white mr-2" />
                  )}
                  <span className="font-bold text-white text-sm uppercase tracking-tighter">
                    {isLoading ? t('toolUI.hiddenChannel.scanning') : t('toolUI.hiddenChannel.scan_btn')}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] text-cyan-700 font-medium z-10 relative">
              <span>Sonar Status: {isLoading ? 'Scanning...' : 'Ready'}</span>
              <span className={`w-1 h-1 rounded-full bg-[#00F3FF] ${isLoading ? 'animate-ping' : 'animate-pulse'}`}></span>
              <span>Depth: 10,000m</span>
              <span className="w-1 h-1 rounded-full bg-cyan-900"></span>
              <span>Encryption: Active</span>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-900/50 rounded text-red-400 text-sm font-medium z-10 relative">
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        {/* RESULTS */}
        {isLoading && <RadarVisualizer />}

        {!isLoading && output && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-16">

            {/* SECTION 1: RISING TREASURES */}
            <div>
              <h3 className="flex items-center gap-3 text-2xl font-black text-cyan-400 mb-8 uppercase tracking-widest border-b border-cyan-900/50 pb-4">
                <Map size={24} /> {t('toolUI.hiddenChannel.risingChannels')} ({output.risingChannels.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {output.risingChannels.map((channel, i) => (
                  <div key={i} className="group relative bg-[#0f172a]/50 border border-cyan-800/30 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={channel.thumbnail || "https://via.placeholder.com/64"}
                          className="w-14 h-14 rounded-full border-2 border-cyan-500/50 shadow-lg object-cover"
                        />
                        <div>
                          <a href={channel.url} target="_blank" className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {channel.name}
                          </a>
                          <div className="flex items-center gap-2 text-xs text-cyan-600">
                            <Users size={12} /> {channel.subscribers} Subs
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-[10px] font-bold text-cyan-700 uppercase mb-1">{t('toolUI.hiddenChannel.growth_metric')}</div>
                        <div className="text-emerald-400 font-bold font-mono text-sm bg-emerald-950/20 py-1 px-2 rounded inline-block border border-emerald-900/30">
                          {channel.growthMetric}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-cyan-700 uppercase">{t('toolUI.hiddenChannel.core_strengths')}</div>
                        <div className="flex flex-wrap gap-2">
                          {channel.coreStrengths.map((s, idx) => (
                            <span key={idx} className="bg-cyan-950 text-cyan-300 text-xs px-2 py-1 rounded border border-cyan-900/50">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: VIRAL SIGNALS */}
            <div>
              <h3 className="flex items-center gap-3 text-2xl font-black text-rose-400 mb-8 uppercase tracking-widest border-b border-rose-900/50 pb-4">
                <Activity size={24} /> {t('toolUI.hiddenChannel.trendingVideos')} ({output.trendingVideos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {output.trendingVideos.map((video, i) => (
                  <a key={i} href={video.url} target="_blank" className="group block relative bg-[#0f172a]/50 border border-rose-900/30 rounded-xl overflow-hidden hover:border-rose-500/50 transition-all hover:shadow-[0_0_30px_rgba(244,63,94,0.1)] flex md:h-48">
                    <div className="w-1/3 md:w-48 relative h-full">
                      <img src={video.thumbnail} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle size={32} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-tight mb-2">
                          {video.title}
                        </h4>
                        <div className="text-xs text-rose-300 bg-rose-950/30 px-2 py-1 rounded inline-block border border-rose-900/30 font-medium">
                          {video.viralRatio}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t('toolUI.hiddenChannel.viral_factor')}</div>
                        <div className="flex flex-wrap gap-1">
                          {video.viralStructure.slice(0, 3).map((v, idx) => (
                            <span key={idx} className="text-[10px] text-gray-400 border border-gray-800 px-1.5 py-0.5 rounded">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* SECTION 3: TREND FORECAST */}
            <div className="bg-gradient-to-r from-emerald-950/30 to-cyan-950/30 border border-emerald-900/30 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>

              <h3 className="flex items-center gap-3 text-2xl font-black text-emerald-400 mb-6 uppercase tracking-widest relative z-10">
                <TrendingUp size={24} /> {t('toolUI.hiddenChannel.upcomingTrends')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {output.upcomingTrends.map((trend, i) => (
                  <div key={i} className="bg-[#020617]/60 p-4 rounded-lg border border-emerald-900/50 flex items-center gap-4">
                    <div className="text-4xl font-black text-emerald-800/50">0{i + 1}</div>
                    <div className="font-bold text-emerald-100">{trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* UPGRADE MODAL */}
      <AnimatePresence>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </AnimatePresence>
    </div>
  );
}
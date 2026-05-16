
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // ADDED
import { AnimatePresence } from 'framer-motion'; // ADDED
import UpgradeModal from './UpgradeModal'; // ADDED
import {
  Compass,
  Search,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Globe,
  Flag
} from 'lucide-react';

// --- TYPES (Strictly Preserved from Original) ---
interface NicheData {
  nicheName: string;
  overallScore: number;
  competitionScore: number;
  searchVolumeScore: number;
  monetizationScore: number;
  longTermViabilityScore: number;
  peakTimingForecast: string;
  communitySentimentAnalysis: string;
  pioneerVideoTopics: string[];
  miningScript: {
    tone: string;
    frequency: string;
    monetizationGoal: string;
  };
  lowFloorChannels: {
    name: string;
    url?: string;
    subscribers: string;
    thumbnail?: string;
  }[];
  saturatedNichesWarning: string[];
}

interface OutputData {
  topNiches: NicheData[];
}

type TargetMarket = 'VN' | 'US';

const MARKET_OPTIONS: { value: TargetMarket; label: string; flag: string; desc: string }[] = [
  { value: 'VN', label: 'Việt Nam', flag: '🇻🇳', desc: 'Ngách Việt, CPM thấp' },
  { value: 'US', label: 'Quốc tế (US)', flag: '🌎', desc: 'Global, CPM cao' },
];

// --- HELPER COMPONENTS ---

const GoldLoader: React.FC<{ market: TargetMarket }> = ({ market }) => (
  <div className="flex flex-col items-center justify-center p-12">
    <div className="relative w-24 h-24 mb-6">
      <div className="absolute inset-0 border-4 border-[#CDAD5A]/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
      <div className="absolute inset-0 border-4 border-t-[#CDAD5A] border-r-transparent border-b-[#008080] border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
      <Compass className="absolute inset-0 m-auto text-[#CDAD5A] animate-pulse" size={40} />
    </div>
    <h3 className="text-[#CDAD5A] font-black text-xl tracking-[0.2em] animate-pulse">
      {market === 'VN' ? 'ĐANG KHAI THÁC...' : 'MINING DATA...'}
    </h3>
    <p className="text-[#008080] text-sm mt-2 font-mono">
      {market === 'VN' ? 'Phân tích tầng sâu thị trường Việt Nam' : 'Deep scanning US/Global market layers'}
    </p>
  </div>
);

const GoldNicheCard: React.FC<{ niche: NicheData; delay: number; market: TargetMarket }> = ({ niche, delay, market }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isVN = market === 'VN';

  // Animating entrance
  const [isVisible, setIsVisible] = useState(false);
  // UseEffect for animation timing
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 150);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
                relative bg-black/40 border border-[#CDAD5A]/20 hover:border-[#CDAD5A]/60 rounded-xl overflow-hidden transition-all duration-500
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                group hover:shadow-[0_0_30px_rgba(205,173,90,0.1)]
            `}
    >
      {/* Top Gold Bar Decor */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#CDAD5A] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] to-[#F4E2AA] uppercase max-w-[70%] leading-tight">
            {niche.nicheName}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#008080] uppercase tracking-wider">SCORE</span>
            <span className={`text-3xl font-black ${niche.overallScore >= 8 ? 'text-[#00ffcc]' : 'text-[#CDAD5A]'}`}>
              {niche.overallScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#050b14] p-2 rounded border border-[#CDAD5A]/10">
            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Activity size={10} /> {isVN ? 'Cạnh tranh' : 'Competition'}</div>
            <div className={`font-bold text-lg ${niche.competitionScore <= 40 ? 'text-green-400' : 'text-yellow-400'}`}>{niche.competitionScore}/100</div>
          </div>
          <div className="bg-[#050b14] p-2 rounded border border-[#CDAD5A]/10">
            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Search size={10} /> {isVN ? 'Tìm kiếm' : 'Volume'}</div>
            <div className={`font-bold text-lg ${niche.searchVolumeScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{niche.searchVolumeScore}/100</div>
          </div>
          <div className="bg-[#050b14] p-2 rounded border border-[#CDAD5A]/10">
            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={10} /> {isVN ? 'Kiếm tiền' : 'Money'}</div>
            <div className={`font-bold text-lg ${niche.monetizationScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{niche.monetizationScore}/100</div>
          </div>
          <div className="bg-[#050b14] p-2 rounded border border-[#CDAD5A]/10">
            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><TrendingUp size={10} /> {isVN ? 'Bền vững' : 'Long-term'}</div>
            <div className={`font-bold text-lg ${niche.longTermViabilityScore >= 75 ? 'text-green-400' : 'text-yellow-400'}`}>{niche.longTermViabilityScore}/100</div>
          </div>
        </div>

        {/* EXPAND TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2 bg-[#CDAD5A]/10 hover:bg-[#CDAD5A]/20 text-[#CDAD5A] text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 border border-[#CDAD5A]/20"
        >
          {isOpen ? (isVN ? 'THU GỌN' : 'COLLAPSE') : (isVN ? 'XEM CHI TIẾT' : 'SHOW DETAILS')}
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* EXPANDED CONTENT */}
      {isOpen && (
        <div className="bg-black/60 border-t border-[#CDAD5A]/20 p-6 text-sm space-y-6 animate-in slide-in-from-top-4 duration-300">

          {/* Forecast */}
          <div>
            <h4 className="flex items-center gap-2 text-[#008080] font-bold mb-2 uppercase text-[10px] tracking-wider">
              <Compass size={12} /> {isVN ? 'Dự báo thời điểm' : 'Peak Timing'}
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed border-l-2 border-[#008080] pl-3">
              {niche.peakTimingForecast}
            </p>
          </div>

          {/* Sentiment */}
          <div>
            <h4 className="flex items-center gap-2 text-[#CDAD5A] font-bold mb-2 uppercase text-[10px] tracking-wider">
              <Activity size={12} /> {isVN ? 'Tâm lý thị trường' : 'Sentiment'}
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed border-l-2 border-[#CDAD5A] pl-3">
              {niche.communitySentimentAnalysis}
            </p>
          </div>

          {/* Topics */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-bold mb-2 uppercase text-[10px] tracking-wider">
              <Layers size={12} /> {isVN ? 'Video tiên phong' : 'Pioneer Topics'}
            </h4>
            <ul className="space-y-1.5">
              {niche.pioneerVideoTopics.slice(0, 5).map((topic, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-default">
                  <span className="text-[#CDAD5A] font-bold tabular-nums">0{i + 1}.</span>
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          {/* Strategy Box */}
          <div className="bg-[#CDAD5A]/5 border border-[#CDAD5A]/10 rounded p-3">
            <h4 className="text-[#CDAD5A] font-bold mb-2 uppercase text-[10px] tracking-wider flex items-center gap-2">
              ⚡ {isVN ? 'Chiến lược khai thác' : 'Mining Strategy'}
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-300">
              <div className="flex justify-between border-b border-[#CDAD5A]/10 pb-1"><span>TONE</span> <span className="text-white font-medium text-right">{niche.miningScript.tone}</span></div>
              <div className="flex justify-between border-b border-[#CDAD5A]/10 pb-1"><span>FREQ</span> <span className="text-white font-medium text-right">{niche.miningScript.frequency}</span></div>
              <div className="flex justify-between"><span>GOAL</span> <span className="text-white font-medium text-right">{niche.miningScript.monetizationGoal}</span></div>
            </div>
          </div>

          {/* Warning */}
          {niche.saturatedNichesWarning.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-900/10 border border-red-500/20 rounded">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
              <div>
                <h4 className="text-red-500 font-bold text-[10px] uppercase mb-1">{isVN ? 'Cảnh báo bão hòa' : 'Saturation Warning'}</h4>
                <p className="text-red-400/80 text-[10px]">{niche.saturatedNichesWarning.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MicroNicheMinerToolProps {
  onBack?: () => void;
  // Add dummy props if needed for dashboard compatibility
  tools?: any;
  onToolSelect?: any;
}

export default function MicroNicheMinerTool({ onBack }: MicroNicheMinerToolProps) {
  const router = useRouter();
  const { data: session } = useSession(); // ADDED
  const userRole = (session?.user as any)?.role || 'FREE'; // ADDED

  const [input, setInput] = useState('');
  const [market, setMarket] = useState<TargetMarket>('VN');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<OutputData | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false); // ADDED

  // Persistence Logic
  React.useEffect(() => {
    const saved = localStorage.getItem('seenyt_niche_input');
    if (saved) setInput(saved);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('seenyt_niche_input', input);
  }, [input]);
  const isVN = market === 'VN';

  const saveWorkflowOutput = async (data: OutputData) => {
    if (!session) return;

    const workflowId = Array.isArray(router.query.workflow) ? router.query.workflow[0] : router.query.workflow;
    if (workflowId !== 'launch-channel') return;

    const channelId = Array.isArray(router.query.channel) ? router.query.channel[0] : router.query.channel;
    const topName = data.topNiches?.[0]?.nicheName || input.trim() || 'Niche Radar';

    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'niche-radar',
          name: `Niche Radar: ${topName}`,
          workflowId,
          stepId: 'find-niche',
          channelId,
          data: {
            input: input.trim(),
            market,
            topNiches: data.topNiches,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to save niche workflow output:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- QUOTA HANDLED SERVER-SIDE ---
    // Removed client-side block to sync with Dashboard logic. 
    // API will check for 'FREE' quota (1 use) and return 403 if exceeded.

    if (!input.trim()) return;

    setIsLoading(true);
    setOutput(null);

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'micro',
          macroNiche: input.trim(),
          targetMarket: market,
        }),
      });

      const data = await response.json();

      if (response.ok && data.topNiches && Array.isArray(data.topNiches)) {
        setOutput(data as OutputData);
        saveWorkflowOutput(data as OutputData);
      } else {
        const errRaw = data?.error || '';
        const errStr = String(errRaw).toUpperCase();

        // Handle Quota/Plan errors by showing Upgrade Modal
        if (response.status === 403 || errStr.includes('PLAN') || errStr.includes('QUOTA') || errStr.includes('LOCKED') || errStr.includes('LIMIT')) {
          setShowUpgrade(true);
          return;
        }

        throw new Error(data.error || (isVN ? 'Lỗi phản hồi hệ thống' : 'System Error'));
      }
    } catch (error: any) {
      console.error('Miner Error:', error);
      const errStr = String(error.message || '').toUpperCase();

      // Safety catch for standard errors that might contain quota keywords
      if (errStr.includes('PLAN') || errStr.includes('QUOTA') || errStr.includes('LOCKED') || errStr.includes('LIMIT')) {
        setShowUpgrade(true);
      } else {
        alert((isVN ? 'Lỗi: ' : 'Error: ') + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-y-auto bg-[#0A0A0B] text-slate-200 font-sans selection:bg-[#CDAD5A]/30">

      {/* HEADER */}
      <header className="sticky top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-xs font-medium text-slate-400 hover:text-white transition-colors border-r border-white/10 pr-6 mr-2 flex items-center gap-2">
              <ArrowLeft size={16} /> <span className="hidden sm:inline">HQ RETURN</span>
            </button>
          )}
          <div className="relative">
            <Compass className="text-[#CDAD5A] animate-pulse" size={24} />
            <div className="absolute -inset-1 bg-[#CDAD5A]/20 blur-sm rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white hidden sm:block">NICHE<span className="text-[#CDAD5A]">_MINER_PRO</span></span>
        </div>

        {/* Market Toggle */}
        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-lg">
          {MARKET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMarket(opt.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all
                  ${market === opt.value
                  ? 'bg-[#CDAD5A] text-[#0A0A0B] shadow-[0_0_10px_rgba(205,173,90,0.4)]'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="text-base leading-none">{opt.flag}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex w-full flex-1 flex-col px-6 py-10">
        <div className="mb-10 w-full">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
          `}} />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tight" style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #d97706 50%, #fbbf24 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s infinite linear' }}>
            NICHE RADAR
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-4xl font-light tracking-wide">
            {isVN
              ? 'Tìm thị trường YouTube khả thi, góc nội dung và cơ hội phát triển kênh.'
              : 'Find viable YouTube markets, content angles, and channel opportunities.'} <br />
            <span className="text-[#00F5FF]/80">{isVN ? 'Bước đầu trong workflow Launch Channel.' : 'First step in the Launch Channel workflow.'}</span>
          </p>
        </div>

        {/* SEARCH INPUT */}
        <div className="w-full relative mb-12 group z-20">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-[#CDAD5A]/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-[#121214] border border-white/10 rounded-xl p-2 flex items-center gap-2 shadow-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(12px)' }}>
              <div className="pl-4 text-[#CDAD5A] animate-pulse">
                <Search size={22} />
              </div>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isVN ? "Nhập chủ đề lớn (VD: tài chính, AI, sức khỏe...)" : "Enter a broad topic (e.g., finance, AI, health...)"}
                className="flex-grow bg-transparent border-none outline-none text-white focus:ring-0 placeholder:text-slate-600 text-lg font-medium py-4 px-2"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#CDAD5A] hover:bg-[#B6964A] text-[#0A0A0B] font-black uppercase text-xs tracking-widest px-8 py-4 rounded-lg flex items-center gap-2 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(205,173,90,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : (isVN ? 'Phân tích ngách' : 'Analyze niche')}
              </button>
            </div>
          </form>
        </div>

        {/* RESULTS AREA */}
        {isLoading && (
          <div className="animate-in fade-in duration-500">
            <GoldLoader market={market} />
          </div>
        )}

        {!isLoading && output && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {output.topNiches.map((niche, i) => (
              <GoldNicheCard key={i} niche={niche} delay={i} market={market} />
            ))}
          </div>
        )}

        {/* Empty State Decor - Skeletons */}
        {!isLoading && !output && (
          <div className="w-full grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative mt-10">
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] tracking-[0.5em] text-[#CDAD5A]/40 mb-2">SYSTEM STATUS</div>
                <div className="text-2xl font-bold text-white tracking-widest animate-[pulse_2s_infinite] opacity-80">READY TO MINE...</div>
              </div>
            </div>
            {[
              { label: 'Volume Score' },
              { label: 'Competition Level' },
              { label: 'Estimated CPM' },
              { label: 'Potential Score' }
            ].map((skeleton, i) => (
              <div key={i} className="h-48 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between opacity-40 group hover:opacity-100 transition-opacity border border-white/5 bg-white/[0.03]">
                <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-[pulse_4s_infinite]"></div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{skeleton.label}</span>
                  <div className="w-4 h-4 rounded-full border border-white/20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 w-2/3 bg-white/5 rounded overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent flex"></div>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#CDAD5A .5px, transparent .5px), linear-gradient(90deg, #CDAD5A .5px, transparent .5px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0A0A0B] to-transparent pointer-events-none z-10"></div>

      {/* FOOTER STATUS */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-[#0A0A0B]/80 backdrop-blur-sm h-10 flex items-center px-6 z-20">
        <div className="w-full flex justify-between items-center text-[10px] font-mono tracking-widest text-slate-600 uppercase">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>
              SERVER: OPTIMIZED
            </div>
            <div className="hidden sm:block">DB_NODES: {isVN ? '412' : '1,244'} CONNECTED</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">COORDINATES: 21.0285° N, 105.8542° E</div>
            <div className="text-[#CDAD5A]/60">© 2026 NICHE_MINER_V3.0.1_STABLE</div>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </AnimatePresence>
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Radar,
  Target,
  Crosshair,
  ShieldAlert,
  Scan,
  Terminal,
  Wifi,
  ChevronLeft,
  Search,
  Lock,
  Unlock,
  Activity,
  Radio
} from 'lucide-react';

interface OutputData {
  competitorProfile: {
    name: string;
    subscribers: string;
  };
  strategicWeaknesses: string[];
  successSignals: string[];
  contentStructure: {
    mainKeywords: string[];
    seoEvaluation: string;
  };
  untappedNiches: string[];
  titleAnalysis: string;
  descriptionAnalysis: string;
  tagsHashtags: string[];
  thumbnailAnalysis: string;
  contentStrategy: string;
  counterAttackPlan: string;
  audienceGapAnalysis: string[];
  videoPersonaScore: {
    tone: string;
    emotion: string;
  };
}

interface RivalScannerToolProps {
  onBack?: () => void;
}

export default function RivalScannerTool({ onBack }: RivalScannerToolProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<OutputData | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [radarAngle, setRadarAngle] = useState(0);

  // Radar Animation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fake Scan Progress
  useEffect(() => {
    if (isLoading) {
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const next = prev + Math.random() * 5;
          return next > 95 ? 95 : next;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    setIsLoading(true);
    setOutput(null);

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'rival', input }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data && data.competitorProfile) {
          setScanProgress(100);
          setTimeout(() => {
            setOutput(data as OutputData);
            setIsLoading(false);
          }, 800);

        } else {
          throw new Error("Invalid Data Structure");
        }
      } else {
        alert('Error: ' + (data.error || 'Unknown Error'));
        setIsLoading(false);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-[#050a05] text-[#00ff41] font-mono overflow-x-hidden selection:bg-[#003b00] selection:text-[#00ff41] overflow-y-auto">
      {/* <Head> <title>RIVAL SCANNER | MILITARY GRADE INTELLIGENCE</title> </Head> */}

      {/* CRT OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,255,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]"></div>
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20 radial-gradient-green"></div>

      {/* HEADER */}
      <header className="sticky top-0 left-0 right-0 h-14 bg-[#0a140a] border-b border-[#003b00] flex items-center justify-between px-6 z-40 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 hover:bg-[#003b00] px-3 py-1 rounded transition-colors text-xs font-bold tracking-widest uppercase">
              <ChevronLeft size={14} /> ABORT_MISSION
            </button>
          )}
          <div className="h-6 w-px bg-[#003b00]"></div>
          <div className="flex items-center gap-2 text-[#00ff41] animate-pulse">
            <Radar size={18} />
            <span className="font-bold tracking-[0.2em]">RIVAL_SCANNER_V3.0</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[10px] text-[#008f11]">
          <span className="flex items-center gap-2">
            <Wifi size={12} /> NET_STATUS: SECURE
          </span>
          <span className="flex items-center gap-2">
            <Activity size={12} /> SYS_LOAD: {Math.floor(Math.random() * 30) + 10}%
          </span>
          <span className="text-[#00ff41] font-bold border border-[#00ff41] px-2 py-0.5 rounded">
            CONFIDENTIAL
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-20 px-6 pb-12 max-w-7xl mx-auto min-h-full flex flex-col">

        {/* SEARCH SECTION */}
        <div className="mb-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff41]/20 to-[#003b00]/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <form onSubmit={handleSubmit} className="relative flex items-center bg-[#0a140a] border border-[#003b00] rounded-lg overflow-hidden p-2 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            <div className="pl-4 pr-2 text-[#008f11]">
              <Crosshair size={24} className={isLoading ? "animate-spin" : ""} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER TARGET COORDINATES (CHANNEL URL / HANDLE)..."
              className="bg-transparent border-none outline-none flex-1 p-4 text-[#00ff41] placeholder-[#003b00] font-bold tracking-widest uppercase"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#003b00] hover:bg-[#00ff41] hover:text-black text-[#00ff41] px-8 py-3 rounded font-bold tracking-widest uppercase transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'SCANNING...' : 'INITIATE_SCAN'}
            </button>
          </form>
        </div>

        {/* LOADING RADAR */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Radar Visual */}
            <div className="relative w-96 h-96 border-4 border-[#003b00] rounded-full flex items-center justify-center overflow-hidden bg-[#050a05] shadow-[0_0_50px_rgba(0,59,0,0.5)]">
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_19%,#003b00_20%,transparent_21%,transparent_39%,#003b00_40%,transparent_41%,transparent_59%,#003b00_60%,transparent_61%,transparent_79%,#003b00_80%,transparent_81%)]"></div>
              <div className="absolute w-full h-px bg-[#003b00]"></div>
              <div className="absolute h-full w-px bg-[#003b00]"></div>

              {/* Sweep */}
              <div
                className="absolute w-1/2 h-1/2 top-0 left-0 origin-bottom-right bg-gradient-to-r from-transparent to-[#00ff41]/50 border-r border-[#00ff41]"
                style={{ transform: `rotate(${radarAngle}deg)` }}
              ></div>

              {/* Ping Dots */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#00ff41] rounded-full animate-ping"></div>
              <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-ping delay-75"></div>

              <div className="absolute text-[#00ff41] font-bold text-xs tracking-widest mt-2">{Math.floor(scanProgress)}% COMPLETE</div>
            </div>
            <div className="mt-8 text-[#008f11] animate-pulse text-sm tracking-[0.3em] font-bold">
              ACQUIRING TARGET DATA...
            </div>
          </div>
        )}

        {/* RESULTS DASHBOARD */}
        {!isLoading && output && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* 1. TARGET PROFILE */}
            <div className="border border-[#00ff41] bg-[#003b00]/20 p-6 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-[#00ff41]/50"><Target size={48} /></div>
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tight text-white flex items-center gap-3">
                <span className="text-[#00ff41] text-lg">[TARGET_ACQUIRED]</span> {output.competitorProfile.name}
              </h2>
              <div className="flex gap-8 text-sm font-bold text-[#008f11] mt-4 border-t border-[#003b00] pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest mb-1">Subscribers</span>
                  <span className="text-[#00ff41] text-xl">{output.competitorProfile.subscribers}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest mb-1">System Audit</span>
                  <span className="text-[#00ff41] text-xl">COMPLETE</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest mb-1">Threat Level</span>
                  <span className="text-red-500 text-xl animate-pulse">HIGH</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* COL 1: WEAKNESSES & OPPORTUNITY */}
              <div className="space-y-6">
                <div className="border border-[#003b00] bg-black/50 p-4">
                  <h3 className="text-[#00ff41] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-xs border-b border-[#003b00] pb-2">
                    <ShieldAlert size={14} /> Strategic Weaknesses
                  </h3>
                  <ul className="space-y-3">
                    {output.strategicWeaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-xs text-gray-300">
                        <span className="text-red-500 font-bold">[!]</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-[#003b00] bg-black/50 p-4">
                  <h3 className="text-[#00ff41] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-xs border-b border-[#003b00] pb-2">
                    <Scan size={14} /> Untapped Niches
                  </h3>
                  <ul className="space-y-3">
                    {output.untappedNiches.map((n, i) => (
                      <li key={i} className="flex gap-2 text-xs text-gray-300 group">
                        <span className="text-[#00ff41] font-bold group-hover:animate-spin">+</span> {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* COL 2: CONTENT ANALYSIS */}
              <div className="bg-[#0a140a] border border-[#003b00] p-6 lg:col-span-2 relative">
                <div className="absolute -top-3 left-4 bg-[#0a140a] px-2 text-[#00ff41] text-xs font-bold border border-[#003b00]">
                  COUNTER_INTELLIGENCE_DATA
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="text-[10px] text-[#008f11] uppercase mb-1">Audience Gap Analysis</div>
                    <div className="text-sm text-gray-300 leading-relaxed border-l-2 border-[#00ff41] pl-3">
                      {output.audienceGapAnalysis.map((gap, i) => (
                        <p key={i} className="mb-2 last:mb-0">{gap}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#008f11] uppercase mb-1">Content Persona</div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="bg-[#003b00] px-3 py-1 rounded text-xs text-[#00ff41]">
                        TONE: {output.videoPersonaScore.tone}
                      </div>
                      <div className="bg-[#003b00] px-3 py-1 rounded text-xs text-[#00ff41]">
                        EMOTION: {output.videoPersonaScore.emotion}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-[#003b00] bg-black/30">
                    <h4 className="text-[#00ff41] font-bold text-xs uppercase mb-2">Detailed Counter-Attack Plan</h4>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap font-mono">
                      {output.counterAttackPlan}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-[#003b00] bg-black/30">
                      <h4 className="text-[#008f11] font-bold text-[10px] uppercase mb-1">Title Analysis</h4>
                      <p className="text-gray-400 text-xs">{output.titleAnalysis}</p>
                    </div>
                    <div className="p-3 border border-[#003b00] bg-black/30">
                      <h4 className="text-[#008f11] font-bold text-[10px] uppercase mb-1">Thumbnail Analysis</h4>
                      <p className="text-gray-400 text-xs">{output.thumbnailAnalysis}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO KEYS */}
            <div className="mt-8 border-t border-[#003b00] pt-6">
              <h3 className="text-[#00ff41] font-bold uppercase tracking-widest mb-4 text-xs">Decrypted Keywords & Tags</h3>
              <div className="flex flex-wrap gap-2">
                {output.tagsHashtags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 border border-[#003b00] hover:bg-[#00ff41] hover:text-black hover:font-bold transition-all text-xs text-[#008f11] cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !output && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 pointer-events-none select-none">
            <Radio size={120} className="text-[#003b00] mb-8" />
            <div className="text-[#003b00] font-black text-6xl tracking-[0.2em]">RADAR_IDLE</div>
            <p className="text-[#008f11] tracking-widest mt-4">AWAITING INPUT PARAMETERS...</p>
          </div>
        )}

      </main>

      <style jsx global>{`
                .radial-gradient-green {
                    background: radial-gradient(circle, rgba(0,255,65,0.05) 0%, rgba(0,0,0,1) 90%);
                }
            `}</style>
    </div>
  );
}
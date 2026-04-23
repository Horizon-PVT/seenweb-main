import React, { useState } from 'react';
import { Target, Search, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import MicroNicheMinerTool from './MicroNicheMinerTool';
import RivalScannerTool from './RivalScannerTool';

export default function KodaNicheRadar({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<'niche' | 'rival'>('niche');

  const dummyTools: any[] = [];
  const dummyOnToolSelect = () => {};

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* Compact Header & Tabs */}
      <div className="border-b border-white/5 bg-[#0a0a0c] relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between relative z-10">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              Koda Niche Radar
            </h1>
          </div>

          {/* Tabs (Centered) */}
          <div className="flex items-center gap-6 h-full absolute left-1/2 -translate-x-1/2">
            <button
              onClick={() => setActiveTab('niche')}
              className={`h-full px-2 font-bold text-sm border-b-[3px] transition-colors flex items-center gap-2 ${
                activeTab === 'niche' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Search className="w-4 h-4" /> 1. Đào Ngách Thắng (Niche Miner)
            </button>
            <button
              onClick={() => setActiveTab('rival')}
              className={`h-full px-2 font-bold text-sm border-b-[3px] transition-colors flex items-center gap-2 ${
                activeTab === 'rival' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> 2. Soi Đối Thủ (Rival Scanner)
            </button>
          </div>

          {/* Top Right Action */}
          {onBack && (
            <button onClick={onBack} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-md text-xs font-semibold transition border border-white/10 flex items-center gap-2 z-20">
              Đóng Radar
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-black/50">
        <div className="h-full relative">
          {activeTab === 'niche' && (
            <div className="h-full animate-fadeIn">
               {/* We wrap the existing component but pass the required props to avoid TS errors. */}
               <MicroNicheMinerTool onBack={undefined} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
            </div>
          )}
          {activeTab === 'rival' && (
            <div className="h-full animate-fadeIn">
               <RivalScannerTool onBack={undefined} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a0c] p-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Koda Niche Radar
              </h1>
            </div>
            <p className="text-gray-400 text-sm">Hệ thống phân tích rủi ro, đào ngách và bám sát đối thủ 360 độ.</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-semibold transition border border-white/10">
              Đóng Radar
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0a0a0c] border-b border-white/5 px-6 shrink-0">
        <div className="max-w-6xl mx-auto flex gap-6">
          <button
            onClick={() => setActiveTab('niche')}
            className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'niche' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Search className="w-4 h-4" /> 1. Đào Ngách Thắng (Niche Miner)
          </button>
          <button
            onClick={() => setActiveTab('rival')}
            className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'rival' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> 2. Soi Đối Thủ (Rival Scanner)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-black/50">
        <div className="h-full overflow-y-auto">
          {activeTab === 'niche' && (
            <div className="h-full animate-fadeIn">
               {/* We wrap the existing component but pass the required props to avoid TS errors. */}
               <MicroNicheMinerTool onBack={() => {}} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
            </div>
          )}
          {activeTab === 'rival' && (
            <div className="h-full animate-fadeIn">
               <RivalScannerTool onBack={() => {}} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Sparkles, MessageSquare, PenTool, Hash, ArrowRight, CheckCircle2 } from 'lucide-react';
import ScriptwriterTool from './ScriptwriterTool';
import SeoTool from './SeoTool';
import VoiceStudioTool from './VoiceStudioTool';

export default function KodaScriptStudio({ onBack }: { onBack?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const dummyTools: any[] = [];
  const dummyOnToolSelect = () => {};

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* Header & Progress Wizard Combined */}
      <div className="border-b border-white/5 bg-[#0a0a0c] pt-5 pb-8 px-6 shrink-0 flex flex-col md:flex-row items-center justify-between relative overflow-hidden z-10 gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-900/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Left: Title */}
        <div className="flex items-center gap-3 relative z-10 min-w-[250px]">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
             <Sparkles className="w-5 h-5 text-pink-400" />
           </div>
           <div>
             <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight">
               Koda Script Studio
             </h1>
           </div>
        </div>

        {/* Center: Wizard */}
        <div className="flex-1 w-full max-w-xl relative z-10">
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full z-0 overflow-hidden px-4">
                <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-500 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            </div>

            {/* Step 1 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 ${step >= 1 ? 'opacity-100' : 'opacity-40 grayscale group'}`} onClick={() => setStep(1)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 1 ? 'bg-black border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-[#0a0a0c] border-white/10 text-gray-500 group-hover:border-white/30'}`}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : <PenTool className="w-4 h-4" />}
              </div>
              <span className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>Đẻ Kịch Bản</span>
            </div>

            {/* Step 2 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 ${step >= 2 ? 'opacity-100' : 'opacity-40 grayscale group'}`} onClick={() => setStep(2)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 2 ? 'bg-black border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#0a0a0c] border-white/10 text-gray-500 group-hover:border-white/30'}`}>
                {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : <Hash className="w-4 h-4" />}
              </div>
              <span className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>Tối ưu SEO</span>
            </div>

            {/* Step 3 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 ${step >= 3 ? 'opacity-100' : 'opacity-40 grayscale group'}`} onClick={() => setStep(3)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 3 ? 'bg-black border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#0a0a0c] border-white/10 text-gray-500 group-hover:border-white/30'}`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>Giọng Nói AI</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Close */}
        <div className="flex items-center justify-end gap-4 relative z-10 min-w-[250px]">
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
              <button onClick={() => setStep(prev => Math.max(1, prev - 1) as any)} disabled={step === 1} className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-0 transition-opacity">
                Lùi
              </button>
              <button onClick={() => setStep(prev => Math.min(3, prev + 1) as any)} disabled={step === 3} className="px-4 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center gap-2 transition disabled:opacity-0">
                Tiếp <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {onBack && (
              <button onClick={onBack} className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-sm font-semibold transition border border-red-500/20">
                Đóng
              </button>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-black/50 scrollbar-thin scrollbar-thumb-white/10">
        <div className="min-h-full">
          {step === 1 && (
            <div className="animate-fadeIn p-4 md:p-0">
               <ScriptwriterTool onBack={() => {}} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
            </div>
          )}
          {step === 2 && (
            <div className="animate-fadeIn p-4 md:p-0">
               <SeoTool onBack={() => {}} />
            </div>
          )}
          {step === 3 && (
            <div className="animate-fadeIn p-4 md:p-0">
               <VoiceStudioTool />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

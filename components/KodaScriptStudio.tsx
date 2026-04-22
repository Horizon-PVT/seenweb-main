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
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a0c] p-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-900/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Koda Script Studio
              </h1>
            </div>
            <p className="text-gray-400 text-sm">Luồng làm việc khép kín: Lên ý tưởng ➔ Viết kịch bản ➔ Tối ưu chuẩn SEO.</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-semibold transition border border-white/10">
              Đóng Studio
            </button>
          )}
        </div>
      </div>

      {/* Progress Wizard */}
      <div className="bg-[#0a0a0c] border-b border-white/5 py-4 shrink-0">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full z-0 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-500 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            </div>

            {/* Step 1 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 ${step >= 1 ? 'opacity-100' : 'opacity-40 grayscale group'}`} onClick={() => setStep(1)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 1 ? 'bg-black border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-[#0a0a0c] border-white/10 text-gray-500 group-hover:border-white/30'}`}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : <PenTool className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>1. Đẻ Kịch Bản</span>
            </div>

            {/* Step 2 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 ${step >= 2 ? 'opacity-100' : 'opacity-40 grayscale group'}`} onClick={() => setStep(2)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 2 ? 'bg-black border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#0a0a0c] border-white/10 text-gray-500 group-hover:border-white/30'}`}>
                {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : <Hash className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>2. Tối ưu SEO</span>
            </div>

            {/* Step 3 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 ${step >= 3 ? 'opacity-100' : 'opacity-40 grayscale group'}`} onClick={() => setStep(3)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 3 ? 'bg-black border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#0a0a0c] border-white/10 text-gray-500 group-hover:border-white/30'}`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>3. Giọng Nói AI</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-6 max-w-2xl mx-auto">
             <button 
                onClick={() => setStep(prev => Math.max(1, prev - 1) as any)}
                disabled={step === 1}
                className="px-4 py-1.5 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-0 transition-opacity"
             >
                Lùi lại
             </button>
             <button 
                onClick={() => setStep(prev => Math.min(3, prev + 1) as any)}
                disabled={step === 3}
                className="px-6 py-1.5 text-sm font-bold bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center gap-2 transition disabled:opacity-0"
             >
                Bước tiếp theo <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-black/50">
        <div className="h-full overflow-y-auto [&>div]:h-full">
          {step === 1 && (
            <div className="h-full animate-fadeIn p-4 md:p-0">
               <ScriptwriterTool onBack={() => {}} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
            </div>
          )}
          {step === 2 && (
            <div className="h-full animate-fadeIn p-4 md:p-0">
               <SeoTool onBack={() => {}} />
            </div>
          )}
          {step === 3 && (
            <div className="h-full animate-fadeIn p-4 md:p-0">
               <VoiceStudioTool />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

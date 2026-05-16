import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Hash, MessageSquare, PenTool } from "lucide-react";
import ScriptwriterTool from "./ScriptwriterTool";
import SeoTool from "./SeoTool";
import VoiceStudioTool from "./VoiceStudioTool";

export default function KodaScriptStudio({}: { onBack?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const dummyTools: any[] = [];
  const dummyOnToolSelect = () => {};

  const steps = [
    { id: 1 as const, label: "Script", icon: PenTool, color: "purple" },
    { id: 2 as const, label: "SEO package", icon: Hash, color: "cyan" },
    { id: 3 as const, label: "Voice", icon: MessageSquare, color: "emerald" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#05080d]">
      <div className="relative z-10 shrink-0 border-b border-white/10 bg-[#071018] px-4 py-3 md:px-6">
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center">
            <div className="grid w-full max-w-2xl grid-cols-3 gap-2 rounded-lg border border-white/10 bg-black/25 p-1">
              {steps.map((item) => {
                const Icon = item.icon;
                const active = step === item.id;
                const done = step > item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setStep(item.id)}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-md text-xs font-black transition ${
                      active ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3)}
              disabled={step === 1}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:text-white disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={() => setStep((prev) => Math.min(3, prev + 1) as 1 | 2 | 3)}
              disabled={step === 3}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-40"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#05080d]">
        {step === 1 && <ScriptwriterTool onBack={() => {}} tools={dummyTools} onToolSelect={dummyOnToolSelect} />}
        {step === 2 && <SeoTool onBack={() => {}} />}
        {step === 3 && <VoiceStudioTool />}
      </div>
    </div>
  );
}

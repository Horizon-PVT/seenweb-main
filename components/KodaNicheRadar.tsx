import React, { useState } from "react";
import { Search, ShieldCheck, Target } from "lucide-react";
import MicroNicheMinerTool from "./MicroNicheMinerTool";
import RivalScannerTool from "./RivalScannerTool";

export default function KodaNicheRadar({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<"niche" | "rival">("niche");

  const dummyTools: any[] = [];
  const dummyOnToolSelect = () => {};

  return (
    <div className="flex h-full flex-col bg-[#05080d]">
      <div className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[#071018]">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="relative z-10 mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10">
              <Target className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">Niche Radar</h1>
              <p className="text-xs font-bold text-slate-500">Launch Channel workflow: niche signal and competitor pattern.</p>
            </div>
          </div>

          <div className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab("niche")}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black transition ${
                activeTab === "niche" ? "bg-cyan-300 text-slate-950" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
              }`}
            >
              <Search className="h-4 w-4" />
              Find niche
            </button>
            <button
              onClick={() => setActiveTab("rival")}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black transition ${
                activeTab === "rival" ? "bg-violet-300 text-slate-950" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Study rivals
            </button>
          </div>

          {onBack && (
            <button onClick={onBack} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white">
              Back to workflow
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-black/50">
        {activeTab === "niche" ? (
          <MicroNicheMinerTool onBack={undefined} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
        ) : (
          <RivalScannerTool onBack={undefined} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
        )}
      </div>
    </div>
  );
}

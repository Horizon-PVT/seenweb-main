import React, { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import MicroNicheMinerTool from "./MicroNicheMinerTool";
import RivalScannerTool from "./RivalScannerTool";

export default function KodaNicheRadar({}: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<"niche" | "rival">("niche");

  const dummyTools: any[] = [];
  const dummyOnToolSelect = () => {};

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#05080d]">
      <div className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[#071018]">
        <div className="relative z-10 flex min-h-14 items-center px-4 py-3 md:px-6">
          <div className="grid w-full max-w-md grid-cols-2 gap-2 overflow-x-auto rounded-lg border border-white/10 bg-black/25 p-1 [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab("niche")}
              className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-black transition ${
                activeTab === "niche" ? "bg-cyan-300 text-slate-950" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
              }`}
            >
              <Search className="h-4 w-4" />
              Find niche
            </button>
            <button
              onClick={() => setActiveTab("rival")}
              className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-black transition ${
                activeTab === "rival" ? "bg-violet-300 text-slate-950" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Study rivals
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#05080d]">
        {activeTab === "niche" ? (
          <MicroNicheMinerTool onBack={undefined} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
        ) : (
          <RivalScannerTool onBack={undefined} tools={dummyTools} onToolSelect={dummyOnToolSelect} />
        )}
      </div>
    </div>
  );
}

import React from "react";
import { useRouter } from "next/router";
import { BarChart3, Bot, Check, Clapperboard, Search, TrendingUp, Workflow } from "lucide-react";
import { CREATOR_WORKFLOWS, WorkflowId } from "@/lib/creator-workflows";

const workflowIcons: Record<WorkflowId, React.ElementType> = {
  "launch-channel": Search,
  "produce-video": Clapperboard,
  "improve-channel": TrendingUp,
};

const quickTools: Array<{ id: string; icon: React.ElementType; label: string }> = [
  { id: "niche-radar", icon: Search, label: "Niche" },
  { id: "rival-scanner", icon: BarChart3, label: "Rivals" },
  { id: "script-studio", icon: Clapperboard, label: "Script" },
  { id: "seo-tool", icon: TrendingUp, label: "SEO" },
  { id: "ai-coach", icon: Bot, label: "Coach" },
];

export default function WorkflowSwitcher() {
  const router = useRouter();
  const requestedWorkflow = Array.isArray(router.query.workflow) ? router.query.workflow[0] : router.query.workflow;
  const activeWorkflow = CREATOR_WORKFLOWS.some((workflow) => workflow.id === requestedWorkflow)
    ? (requestedWorkflow as WorkflowId)
    : "launch-channel";

  const navigateWorkflow = (workflowId: WorkflowId) => {
    router.push(`/dashboard?workflow=${workflowId}`, undefined, { shallow: true });
  };

  const navigateTool = (toolId: string) => {
    router.push(`/dashboard?tool=${toolId}`, undefined, { shallow: true });
  };

  return (
    <div className="flex flex-col gap-3 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
        {CREATOR_WORKFLOWS.map((workflow) => {
          const Icon = workflowIcons[workflow.id];
          const active = workflow.id === activeWorkflow;

          return (
            <button
              key={workflow.id}
              onClick={() => navigateWorkflow(workflow.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition ${
                active
                  ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-200"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {workflow.title}
              {active && <Check size={15} />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
        <span className="hidden text-xs font-bold text-slate-600 sm:inline">Quick tools</span>
        {quickTools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              if (id === "ai-coach") {
                router.push("/dashboard/ai-coach");
              } else {
                navigateTool(id);
              }
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-400 transition hover:border-cyan-300/30 hover:text-white"
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
        <Workflow size={16} className="hidden text-slate-600 lg:block" />
      </div>
    </div>
  );
}

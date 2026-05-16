import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  FileStack,
  Workflow,
  Youtube,
} from "lucide-react";
import { CREATOR_WORKFLOWS, WorkflowId, getCreatorTool } from "@/lib/creator-workflows";
import { WorkflowDraftData } from "@/lib/workflow-drafts";

type ToolWorkspaceShellProps = {
  activeTool: string;
  selectedWorkflow: WorkflowId;
  selectedChannelTitle?: string | null;
  workflowDraft: WorkflowDraftData;
  onBack: () => void;
  children: React.ReactNode;
};

function getToolTitle(toolId: string) {
  if (toolId === "channel-manager") return "Channel Manager";
  const tool = getCreatorTool(toolId);
  return tool?.title || toolId;
}

function getToolSubtitle(toolId: string) {
  if (toolId === "channel-manager") return "Connect channels and keep production workspaces organized.";
  const tool = getCreatorTool(toolId);
  return tool?.description || "Workflow tool";
}

export default function ToolWorkspaceShell({
  activeTool,
  selectedWorkflow,
  selectedChannelTitle,
  workflowDraft,
  onBack,
  children,
}: ToolWorkspaceShellProps) {
  const workflow = CREATOR_WORKFLOWS.find((item) => item.id === selectedWorkflow) || CREATOR_WORKFLOWS[0];
  const currentStep = workflow.steps.find((step) => step.id === workflowDraft.currentStepId) || workflow.steps[0];
  const attachedOutputs = workflowDraft.steps.reduce((total, step) => total + step.toolOutputProjectIds.length, 0);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#05080d] text-white">
      <div className="shrink-0 border-b border-white/10 bg-[#071018]/95 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <button
              onClick={onBack}
              className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
              aria-label="Back to workflow"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">
                  <Workflow size={13} />
                  {workflow.title}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  <Youtube size={13} />
                  {selectedChannelTitle || "General workspace"}
                </span>
              </div>
              <h1 className="truncate text-2xl font-black text-white">{getToolTitle(activeTool)}</h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">{getToolSubtitle(activeTool)}</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <CircleDot size={14} className="text-cyan-300" />
                Current Step
              </div>
              <div className="mt-1 truncate text-sm font-black text-white">{currentStep?.title || "Workflow"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <FileStack size={14} className="text-cyan-300" />
                Outputs
              </div>
              <div className="mt-1 text-sm font-black text-white">{attachedOutputs} saved</div>
            </div>
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-200/70">
                <CheckCircle2 size={14} className="text-emerald-300" />
                Draft
              </div>
              <div className="mt-1 text-sm font-black capitalize text-emerald-100">{workflowDraft.status.replace("_", " ")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-[#05080d]">
        {children}
      </div>
    </div>
  );
}

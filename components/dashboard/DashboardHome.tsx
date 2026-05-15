import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  FileText,
  Globe2,
  Layers,
  Lightbulb,
  Lock,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
  Workflow,
  Youtube,
  Zap,
} from "lucide-react";
import {
  CREATOR_TOOLS,
  CREATOR_WORKFLOWS,
  CanonicalToolId,
  CreatorTool,
  WorkflowId,
  WorkflowAction,
  getToolAction,
} from "@/lib/creator-workflows";
import { getCreatorCopy } from "@/lib/creator-i18n";
import { WorkflowDraftData } from "@/lib/workflow-drafts";

interface DashboardHomeProps {
  userRole: string;
  selectedWorkflow: WorkflowId;
  workflowDraft: WorkflowDraftData;
  draftSaving: boolean;
  onWorkflowSelect: (_workflowId: WorkflowId) => void;
  onWorkflowStepRun: (_stepId: string, _action: WorkflowAction) => void;
  onWorkflowStepComplete: (_stepId: string) => void;
  onToolSelect: (_toolId: string) => void;
  onNavigate: (_path: string) => void;
}

const workflowIcons = {
  target: Target,
  clapperboard: Clapperboard,
  trending: TrendingUp,
};

const toolIcons: Record<CanonicalToolId, React.ElementType> = {
  "niche-radar": Search,
  "rival-scanner": BarChart3,
  "script-studio": FileText,
  "voice-studio": Globe2,
  "video-pipeline": Clapperboard,
  "seo-tool": TrendingUp,
  "intelligence-hub": Sparkles,
  "ai-coach": Bot,
};

function statusLabel(status: CreatorTool["status"]) {
  if (status === "ready") {
    return { text: "Ready", className: "bg-emerald-400/10 text-emerald-300 border-emerald-300/20" };
  }
  if (status === "review") {
    return { text: "Review", className: "bg-amber-400/10 text-amber-300 border-amber-300/20" };
  }
  return { text: "Hidden", className: "bg-slate-400/10 text-slate-300 border-slate-300/20" };
}

export default function DashboardHome({
  userRole,
  selectedWorkflow,
  workflowDraft,
  draftSaving,
  onWorkflowSelect,
  onWorkflowStepRun,
  onWorkflowStepComplete,
  onToolSelect,
  onNavigate,
}: DashboardHomeProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const copy = getCreatorCopy(router.locale);

  const currentWorkflow = useMemo(
    () => CREATOR_WORKFLOWS.find((item) => item.id === selectedWorkflow) || CREATOR_WORKFLOWS[0],
    [selectedWorkflow]
  );

  const visibleTools = useMemo(() => CREATOR_TOOLS.filter((tool) => tool.visibleInToolbox), []);
  const groupedTools = useMemo(() => {
    return visibleTools.reduce<Record<string, CreatorTool[]>>((acc, tool) => {
      acc[tool.group] = acc[tool.group] || [];
      acc[tool.group].push(tool);
      return acc;
    }, {});
  }, [visibleTools]);

  const firstName = session?.user?.name?.split(" ")[0] || "Creator";
  const isFree = userRole === "FREE";
  const doneSteps = workflowDraft.steps.filter((step) => step.status === "done").length;
  const progressPercent = workflowDraft.steps.length > 0 ? Math.round((doneSteps / workflowDraft.steps.length) * 100) : 0;
  const currentStep = workflowDraft.steps.find((step) => step.stepId === workflowDraft.currentStepId);

  const runAction = (action: WorkflowAction) => {
    if (action.type === "tool") {
      const toolAction = getToolAction(action.toolId);
      if (toolAction.type === "tool") {
        onToolSelect(toolAction.toolId);
      } else {
        onNavigate(toolAction.href);
      }
      return;
    }
    onNavigate(action.href);
  };

  const runTool = (tool: CreatorTool) => {
    runAction(getToolAction(tool.id));
  };

  return (
    <div className="animate-fadeIn space-y-8">
      <section className="relative overflow-hidden rounded-xl border border-white/10 bg-[#071018] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_88%_8%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              <Youtube size={16} className="text-cyan-300" />
              {copy.dashboard.badge}
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-5xl">
              {router.locale === "en" ? `Hi ${firstName}, ${copy.dashboard.greeting}` : `${firstName}, ${copy.dashboard.greeting}`}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              {copy.dashboard.intro}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onWorkflowStepRun(currentWorkflow.steps[0].id, currentWorkflow.steps[0].action)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
              >
                {copy.dashboard.startWorkflow} <ArrowRight size={17} />
              </button>
              <button
                onClick={() => router.push("/dashboard/ai-coach")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-bold text-white transition hover:border-cyan-300/50 hover:bg-white/10"
              >
                <Bot size={17} className="text-cyan-300" />
                {copy.dashboard.askCoach}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 p-5 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{copy.dashboard.workspace}</div>
                <div className="mt-1 text-lg font-black text-white">{userRole || "FREE"}</div>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-black ${isFree ? "bg-slate-400/10 text-slate-300" : "bg-cyan-300/15 text-cyan-200"}`}>
                {isFree ? copy.dashboard.starterAccess : copy.dashboard.activeWorkspace}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                [CREATOR_WORKFLOWS.length.toString(), copy.dashboard.workflows],
                [visibleTools.length.toString(), copy.dashboard.tools],
                ["1", copy.dashboard.aiCoach],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-center">
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="mt-1 text-xs font-bold text-slate-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
              <div className="flex items-center gap-2 text-sm font-black text-cyan-100">
                <Lightbulb size={16} className="text-cyan-300" />
                {copy.dashboard.productRuleTitle}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {copy.dashboard.productRuleBody}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">Workflow draft</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {draftSaving ? "Saving..." : `Saved progress: ${doneSteps}/${workflowDraft.steps.length} steps`}
                  </div>
                </div>
                <div className="text-sm font-black text-cyan-200">{progressPercent}%</div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              {currentStep && (
                <div className="mt-3 text-xs font-bold text-slate-400">
                  Current step: <span className="text-cyan-200">{currentStep.stepId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {CREATOR_WORKFLOWS.map((workflow) => {
          const Icon = workflowIcons[workflow.iconKey];
          const selected = workflow.id === selectedWorkflow;
          return (
            <button
              key={workflow.id}
              onClick={() => onWorkflowSelect(workflow.id)}
              className={`group rounded-xl border p-5 text-left transition ${
                selected
                  ? "border-cyan-300/60 bg-cyan-300/[0.08] shadow-[0_0_48px_rgba(34,211,238,0.10)]"
                  : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.055]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${workflow.accent} text-slate-950`}>
                  <Icon size={22} />
                </div>
                {selected && <CheckCircle2 size={20} className="text-cyan-300" />}
              </div>
              <h2 className="mt-5 text-xl font-black text-white">{copy.workflows[workflow.id].title}</h2>
              <p className="mt-2 text-sm font-bold text-cyan-200">{copy.workflows[workflow.id].subtitle}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{copy.workflows[workflow.id].description}</p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${currentWorkflow.accent} text-slate-950`}>
              <Workflow size={21} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{copy.dashboard.selectedWorkflow}</div>
              <h2 className="text-2xl font-black text-white">{copy.workflows[currentWorkflow.id].title}</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {currentWorkflow.steps.map((step, index) => {
              const draftStep = workflowDraft.steps.find((item) => item.stepId === step.id);
              const isDone = draftStep?.status === "done";
              const isActive = draftStep?.status === "active";

              return (
                <div
                  key={step.id}
                  className={`rounded-lg border p-4 transition ${
                    isActive
                      ? "border-cyan-300/45 bg-cyan-300/[0.06]"
                      : isDone
                      ? "border-emerald-300/35 bg-emerald-300/[0.05]"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <button
                    onClick={() => onWorkflowStepRun(step.id, step.action)}
                    className="group flex w-full gap-4 text-left"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-black ${
                      isDone
                        ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                        : "border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
                    }`}>
                      {isDone ? <CheckCircle2 size={18} /> : index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-white">{copy.workflows[currentWorkflow.id].steps[index] || step.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                          isDone
                            ? "bg-emerald-300/10 text-emerald-200"
                            : isActive
                            ? "bg-cyan-300/10 text-cyan-200"
                            : "bg-slate-300/10 text-slate-300"
                        }`}>
                          {isDone ? "Done" : isActive ? "Active" : "Pending"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{step.description}</p>
                    </div>
                    <ChevronRight className="mt-2 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
                  </button>

                  {!isDone && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onWorkflowStepComplete(step.id)}
                        className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-200 transition hover:bg-emerald-300/15"
                      >
                        Mark done
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-cyan-300/20 bg-[#0b1118] p-6">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:38px_38px]" />
          <div className="relative">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-sm font-black text-white">{copy.dashboard.workflowMap}</div>
                <div className="mt-1 text-xs text-slate-500">Niche {">"} Plan {">"} Script {">"} Voice {">"} Video {">"} SEO {">"} Review</div>
              </div>
              <div className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">{copy.dashboard.canonicalIds}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Research", icon: Search, text: "Niche, demand, competitor, angle" },
                { title: "Plan", icon: Layers, text: "Pillars, calendar, batch topics" },
                { title: "Produce", icon: Clapperboard, text: "Script, voice, edit, thumbnail" },
                { title: "Optimize", icon: TrendingUp, text: "SEO, analytics, next action" },
              ].map((node, index) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.title}
                    className={`rounded-lg border border-white/10 bg-[#111924]/95 p-4 ${index === 1 ? "translate-y-6" : index === 2 ? "-translate-y-1" : ""}`}
                  >
                    <div className="flex items-center gap-2 text-sm font-black text-white">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
                        <Icon size={16} />
                      </span>
                      {node.title}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{node.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <Wand2 size={16} className="text-cyan-300" />
                {copy.dashboard.registryTitle}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {copy.dashboard.registryBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.035] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{copy.dashboard.toolboxKicker}</div>
            <h2 className="mt-2 text-2xl font-black text-white">{copy.dashboard.toolboxTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {copy.dashboard.toolboxBody}
            </p>
          </div>
          <button
            onClick={() => onNavigate("/dashboard/subscription")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition hover:border-cyan-300/50"
          >
            {copy.dashboard.planBilling} <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-6 grid gap-6">
          {Object.entries(groupedTools).map(([group, items]) => (
            <div key={group}>
              <h3 className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-slate-500">{group}</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {items.map((tool) => {
                  const Icon = toolIcons[tool.id];
                  const status = statusLabel(tool.status);
                  const statusText =
                    tool.status === "ready"
                      ? copy.dashboard.ready
                      : tool.status === "review"
                      ? copy.dashboard.review
                      : copy.dashboard.hidden;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => runTool(tool)}
                      className="group rounded-lg border border-white/10 bg-black/20 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
                          <Icon size={19} />
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${status.className}`}>
                          {statusText}
                        </span>
                      </div>
                      <h4 className="mt-4 font-black text-white">{copy.tools[tool.id].title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{copy.tools[tool.id].description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-300/10 text-amber-300">
              <Lock size={20} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{copy.dashboard.cleanupKicker}</div>
              <h2 className="text-xl font-black text-white">{copy.dashboard.cleanupTitle}</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            {copy.dashboard.cleanupBody}
          </p>
        </div>

        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/70">{copy.dashboard.nextDecisionsKicker}</div>
              <h2 className="text-xl font-black text-white">{copy.dashboard.nextDecisionsTitle}</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {copy.dashboard.nextDecisions.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-6 text-slate-300">
                <CheckCircle2 size={17} className="mt-1 shrink-0 text-cyan-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

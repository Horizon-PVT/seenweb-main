import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { CREATOR_WORKFLOWS, WorkflowAction, WorkflowId, getDashboardToolId } from "@/lib/creator-workflows";
import { WorkflowDraftData, createDefaultWorkflowDraft, normalizeWorkflowDraft } from "@/lib/workflow-drafts";

// Dynamic imports for performance
const KodaNicheRadar = dynamic(() => import('@/components/KodaNicheRadar'), { ssr: false });
const KodaScriptStudio = dynamic(() => import('@/components/KodaScriptStudio'), { ssr: false });
const SeoTool = dynamic(() => import('@/components/SeoTool'), { ssr: false });
const IntelligenceHub = dynamic(() => import('@/components/IntelligenceHub'), { ssr: false });
const VideoPipeline = dynamic(() => import('@/components/VideoPipeline'), { ssr: false });
const RivalScanner = dynamic(() => import('@/components/RivalScannerTool'), { ssr: false });
const VoiceStudio = dynamic(() => import('@/components/VoiceStudioTool'), { ssr: false });

const TOOL_COMPONENTS: Record<string, any> = {
  'niche-radar': KodaNicheRadar,
  'script-studio': KodaScriptStudio,
  'seo-tool': SeoTool,
  'intelligence-hub': IntelligenceHub,
  'video-pipeline': VideoPipeline,
  'rival-scanner': RivalScanner,
  'voice-studio': VoiceStudio,
};

const DEFAULT_WORKFLOW: WorkflowId = "launch-channel";

function getWorkflowId(value: string | string[] | undefined): WorkflowId {
  const requested = Array.isArray(value) ? value[0] : value;
  return CREATOR_WORKFLOWS.some((workflow) => workflow.id === requested) ? (requested as WorkflowId) : DEFAULT_WORKFLOW;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [workflowDraft, setWorkflowDraft] = useState<WorkflowDraftData | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const selectedWorkflow = getWorkflowId(router.query.workflow);

  // Authentication guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath || "/dashboard")}`);
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  // Handle tool from URL query
  useEffect(() => {
    if (!loading && router.isReady) {
      if (router.query.tool) {
        const requestedTool = Array.isArray(router.query.tool) ? router.query.tool[0] : router.query.tool;
        setActiveTool(getDashboardToolId(requestedTool) || requestedTool || null);
      } else {
        setActiveTool(null); // Reset to home if no tool in query
      }
    }
  }, [loading, router.isReady, router.query]);

  useEffect(() => {
    if (loading || !router.isReady || status !== "authenticated") return;

    let cancelled = false;

    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/workflow-drafts?workflowId=${selectedWorkflow}`);
        const result = await response.json();
        if (!cancelled) {
          setWorkflowDraft(normalizeWorkflowDraft(selectedWorkflow, result.draft?.data));
        }
      } catch (error) {
        console.error("Failed to fetch workflow draft:", error);
        if (!cancelled) {
          setWorkflowDraft(createDefaultWorkflowDraft(selectedWorkflow));
        }
      }
    };

    fetchDraft();

    return () => {
      cancelled = true;
    };
  }, [loading, router.isReady, selectedWorkflow, status]);

  const saveWorkflowDraft = async (nextDraft: WorkflowDraftData) => {
    const normalized = normalizeWorkflowDraft(selectedWorkflow, nextDraft);
    setWorkflowDraft(normalized);
    setDraftSaving(true);

    try {
      const response = await fetch("/api/workflow-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: selectedWorkflow,
          data: normalized,
        }),
      });
      const result = await response.json();
      setWorkflowDraft(normalizeWorkflowDraft(selectedWorkflow, result.draft?.data || normalized));
    } catch (error) {
      console.error("Failed to save workflow draft:", error);
    } finally {
      setDraftSaving(false);
    }
  };

  const updateWorkflowStep = async (stepId: string, nextStatus: "active" | "done") => {
    const baseDraft = workflowDraft || createDefaultWorkflowDraft(selectedWorkflow);
    const now = new Date().toISOString();
    const workflow = CREATOR_WORKFLOWS.find((item) => item.id === selectedWorkflow) || CREATOR_WORKFLOWS[0];
    const selectedIndex = workflow.steps.findIndex((step) => step.id === stepId);

    const nextDraft = normalizeWorkflowDraft(selectedWorkflow, {
      ...baseDraft,
      currentStepId: stepId,
      status: nextStatus === "done" ? "in_progress" : "in_progress",
      updatedAt: now,
      steps: baseDraft.steps.map((step) => {
        if (step.stepId === stepId) {
          return { ...step, status: nextStatus, updatedAt: now };
        }
        if (nextStatus === "active" && step.status === "active") {
          return { ...step, status: "pending", updatedAt: now };
        }
        return step;
      }).map((step, index) => {
        if (nextStatus === "done" && selectedIndex >= 0 && index === selectedIndex + 1 && step.status === "pending") {
          return { ...step, status: "active", updatedAt: now };
        }
        return step;
      }),
    });

    const allDone = nextDraft.steps.every((step) => step.status === "done");
    await saveWorkflowDraft({ ...nextDraft, status: allDone ? "completed" : nextDraft.status });
  };

  const runWorkflowStep = async (stepId: string, action: WorkflowAction) => {
    await updateWorkflowStep(stepId, "active");

    if (action.type === "tool") {
      const dashboardToolId = getDashboardToolId(action.toolId) || action.toolId;
      router.push(`/dashboard?workflow=${selectedWorkflow}&tool=${dashboardToolId}`, undefined, { shallow: true });
      return;
    }

    router.push(action.href);
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D10]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CDAD5A]"></div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || 'FREE';
  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null;

  return (
    <DashboardLayout 
      userRole={userRole} 
      activeTool={activeTool}
      onToolSelect={(toolId) => {
        if (toolId) {
          const dashboardToolId = getDashboardToolId(toolId) || toolId;
          router.push(`/dashboard?tool=${dashboardToolId}`, undefined, { shallow: true });
        } else {
          router.push(`/dashboard?workflow=${selectedWorkflow}`, undefined, { shallow: true });
        }
      }}
    >
      <div className="min-h-full">
        {ActiveComponent ? (
          <div className="animate-fadeIn">
            <ActiveComponent onBack={() => router.push(`/dashboard?workflow=${selectedWorkflow}`, undefined, { shallow: true })} />
          </div>
        ) : (
          <DashboardHome 
            userRole={userRole} 
            selectedWorkflow={selectedWorkflow}
            workflowDraft={workflowDraft || createDefaultWorkflowDraft(selectedWorkflow)}
            draftSaving={draftSaving}
            onWorkflowSelect={(workflowId) => {
              router.push(`/dashboard?workflow=${workflowId}`, undefined, { shallow: true });
            }}
            onWorkflowStepRun={runWorkflowStep}
            onWorkflowStepComplete={(stepId) => updateWorkflowStep(stepId, "done")}
            onToolSelect={(toolId) => {
              const dashboardToolId = getDashboardToolId(toolId) || toolId;
              router.push(`/dashboard?tool=${dashboardToolId}`, undefined, { shallow: true });
            }}
            onNavigate={(path) => router.push(path)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'vi', ['common'])),
    },
  };
};

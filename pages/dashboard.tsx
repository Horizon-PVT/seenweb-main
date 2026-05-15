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
const MyChannels = dynamic(() => import('@/components/dashboard/MyChannels'), { ssr: false });

const TOOL_COMPONENTS: Record<string, any> = {
  'niche-radar': KodaNicheRadar,
  'script-studio': KodaScriptStudio,
  'seo-tool': SeoTool,
  'intelligence-hub': IntelligenceHub,
  'video-pipeline': VideoPipeline,
  'rival-scanner': RivalScanner,
  'voice-studio': VoiceStudio,
  'channel-manager': MyChannels,
};

const DEFAULT_WORKFLOW: WorkflowId = "launch-channel";

type DashboardChannel = {
  id: string;
  channelId: string;
  title: string | null;
  thumbnail: string | null;
  subCount: number;
  videoCount: number;
};

function getWorkflowId(value: string | string[] | undefined): WorkflowId {
  const requested = Array.isArray(value) ? value[0] : value;
  return CREATOR_WORKFLOWS.some((workflow) => workflow.id === requested) ? (requested as WorkflowId) : DEFAULT_WORKFLOW;
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [workflowDraft, setWorkflowDraft] = useState<WorkflowDraftData | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const [channels, setChannels] = useState<DashboardChannel[]>([]);
  const [channelLimit, setChannelLimit] = useState(0);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const selectedWorkflow = getWorkflowId(router.query.workflow);
  const selectedChannelId = getQueryValue(router.query.channel) || null;

  const getDashboardPath = (params: { workflow?: WorkflowId; tool?: string | null; channelId?: string | null } = {}) => {
    const query = new URLSearchParams();
    query.set("workflow", params.workflow || selectedWorkflow);
    const channel = params.channelId === undefined ? selectedChannelId : params.channelId;
    if (channel) query.set("channel", channel);
    if (params.tool) query.set("tool", params.tool);
    return `/dashboard?${query.toString()}`;
  };

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

    const fetchChannels = async () => {
      setChannelsLoading(true);
      try {
        const response = await fetch("/api/user/channels");
        const result = await response.json();
        if (!cancelled) {
          setChannels(Array.isArray(result.channels) ? result.channels : []);
          setChannelLimit(typeof result.limit === "number" ? result.limit : 0);
        }
      } catch (error) {
        console.error("Failed to fetch channels:", error);
        if (!cancelled) {
          setChannels([]);
          setChannelLimit(0);
        }
      } finally {
        if (!cancelled) setChannelsLoading(false);
      }
    };

    fetchChannels();

    return () => {
      cancelled = true;
    };
  }, [loading, router.isReady, status]);

  useEffect(() => {
    if (loading || !router.isReady || status !== "authenticated") return;

    let cancelled = false;

    const fetchDraft = async () => {
      try {
        const query = new URLSearchParams({ workflowId: selectedWorkflow });
        if (selectedChannelId) query.set("channelId", selectedChannelId);
        const response = await fetch(`/api/workflow-drafts?${query.toString()}`);
        const result = await response.json();
        if (!cancelled) {
          setWorkflowDraft(normalizeWorkflowDraft(selectedWorkflow, result.draft?.data, selectedChannelId));
        }
      } catch (error) {
        console.error("Failed to fetch workflow draft:", error);
        if (!cancelled) {
          setWorkflowDraft(createDefaultWorkflowDraft(selectedWorkflow, selectedChannelId));
        }
      }
    };

    fetchDraft();

    return () => {
      cancelled = true;
    };
  }, [loading, router.isReady, selectedChannelId, selectedWorkflow, status]);

  const saveWorkflowDraft = async (nextDraft: WorkflowDraftData) => {
    const normalized = normalizeWorkflowDraft(selectedWorkflow, { ...nextDraft, channelId: selectedChannelId }, selectedChannelId);
    setWorkflowDraft(normalized);
    setDraftSaving(true);

    try {
      const response = await fetch("/api/workflow-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: selectedWorkflow,
          channelId: selectedChannelId,
          data: normalized,
        }),
      });
      const result = await response.json();
      setWorkflowDraft(normalizeWorkflowDraft(selectedWorkflow, result.draft?.data || normalized, selectedChannelId));
    } catch (error) {
      console.error("Failed to save workflow draft:", error);
    } finally {
      setDraftSaving(false);
    }
  };

  const updateWorkflowStep = async (stepId: string, nextStatus: "active" | "done") => {
    const baseDraft = workflowDraft || createDefaultWorkflowDraft(selectedWorkflow, selectedChannelId);
    const now = new Date().toISOString();
    const workflow = CREATOR_WORKFLOWS.find((item) => item.id === selectedWorkflow) || CREATOR_WORKFLOWS[0];
    const selectedIndex = workflow.steps.findIndex((step) => step.id === stepId);

    const nextDraft = normalizeWorkflowDraft(selectedWorkflow, {
      ...baseDraft,
      channelId: selectedChannelId,
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
    }, selectedChannelId);

    const allDone = nextDraft.steps.every((step) => step.status === "done");
    await saveWorkflowDraft({ ...nextDraft, status: allDone ? "completed" : nextDraft.status });
  };

  const runWorkflowStep = async (stepId: string, action: WorkflowAction) => {
    await updateWorkflowStep(stepId, "active");

    if (action.type === "tool") {
      const dashboardToolId = getDashboardToolId(action.toolId) || action.toolId;
      router.push(getDashboardPath({ tool: dashboardToolId }), undefined, { shallow: true });
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
          router.push(getDashboardPath({ tool: dashboardToolId }), undefined, { shallow: true });
        } else {
          router.push(getDashboardPath({ tool: null }), undefined, { shallow: true });
        }
      }}
    >
      <div className="min-h-full">
        {ActiveComponent ? (
          <div className="animate-fadeIn">
            <ActiveComponent onBack={() => router.push(getDashboardPath({ tool: null }), undefined, { shallow: true })} />
          </div>
        ) : (
          <DashboardHome 
            userRole={userRole} 
            selectedWorkflow={selectedWorkflow}
            channels={channels}
            selectedChannelId={selectedChannelId}
            channelLimit={channelLimit}
            channelsLoading={channelsLoading}
            workflowDraft={workflowDraft || createDefaultWorkflowDraft(selectedWorkflow, selectedChannelId)}
            draftSaving={draftSaving}
            onChannelSelect={(channelId) => {
              router.push(getDashboardPath({ channelId, tool: null }), undefined, { shallow: true });
            }}
            onWorkflowSelect={(workflowId) => {
              router.push(getDashboardPath({ workflow: workflowId, tool: null }), undefined, { shallow: true });
            }}
            onWorkflowStepRun={runWorkflowStep}
            onWorkflowStepComplete={(stepId) => updateWorkflowStep(stepId, "done")}
            onToolSelect={(toolId) => {
              const dashboardToolId = getDashboardToolId(toolId) || toolId;
              router.push(getDashboardPath({ tool: dashboardToolId }), undefined, { shallow: true });
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

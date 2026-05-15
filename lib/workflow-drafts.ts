import { CREATOR_WORKFLOWS, WorkflowId } from "@/lib/creator-workflows";

export type WorkflowStepStatus = "pending" | "active" | "done";

export type WorkflowStepDraft = {
  stepId: string;
  status: WorkflowStepStatus;
  toolOutputProjectIds: string[];
  notes?: string;
  updatedAt?: string;
};

export type WorkflowDraftData = {
  workflowId: WorkflowId;
  currentStepId: string;
  status: "draft" | "in_progress" | "completed";
  channelId?: string | null;
  steps: WorkflowStepDraft[];
  updatedAt: string;
};

export type WorkflowDraft = {
  id: string;
  name: string;
  workflowId: WorkflowId;
  data: WorkflowDraftData;
  updatedAt: string;
};

export const WORKFLOW_DRAFT_TOOL_ID = "workflow-draft";

export function isWorkflowId(value: unknown): value is WorkflowId {
  return CREATOR_WORKFLOWS.some((workflow) => workflow.id === value);
}

export function createDefaultWorkflowDraft(workflowId: WorkflowId): WorkflowDraftData {
  const workflow = CREATOR_WORKFLOWS.find((item) => item.id === workflowId) || CREATOR_WORKFLOWS[0];
  const now = new Date().toISOString();

  return {
    workflowId: workflow.id,
    currentStepId: workflow.steps[0]?.id || "",
    status: "draft",
    channelId: null,
    updatedAt: now,
    steps: workflow.steps.map((step, index) => ({
      stepId: step.id,
      status: index === 0 ? "active" : "pending",
      toolOutputProjectIds: [],
      updatedAt: now,
    })),
  };
}

export function normalizeWorkflowDraft(workflowId: WorkflowId, value: unknown): WorkflowDraftData {
  const defaults = createDefaultWorkflowDraft(workflowId);
  const raw = value && typeof value === "object" ? (value as Partial<WorkflowDraftData>) : {};
  const workflow = CREATOR_WORKFLOWS.find((item) => item.id === workflowId) || CREATOR_WORKFLOWS[0];
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];

  const steps = workflow.steps.map((step, index) => {
    const existing = rawSteps.find((item) => item?.stepId === step.id);
    const status = existing?.status === "done" || existing?.status === "active" || existing?.status === "pending"
      ? existing.status
      : index === 0
      ? "active"
      : "pending";

    return {
      stepId: step.id,
      status,
      toolOutputProjectIds: Array.isArray(existing?.toolOutputProjectIds) ? existing.toolOutputProjectIds : [],
      notes: typeof existing?.notes === "string" ? existing.notes : undefined,
      updatedAt: typeof existing?.updatedAt === "string" ? existing.updatedAt : defaults.updatedAt,
    };
  });

  const currentStepId = workflow.steps.some((step) => step.id === raw.currentStepId)
    ? String(raw.currentStepId)
    : defaults.currentStepId;

  return {
    workflowId,
    currentStepId,
    status: raw.status === "completed" || raw.status === "in_progress" || raw.status === "draft" ? raw.status : defaults.status,
    channelId: typeof raw.channelId === "string" ? raw.channelId : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : defaults.updatedAt,
    steps,
  };
}

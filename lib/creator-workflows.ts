export type CanonicalToolId =
  | "niche-radar"
  | "rival-scanner"
  | "script-studio"
  | "voice-studio"
  | "video-pipeline"
  | "seo-tool"
  | "intelligence-hub"
  | "ai-coach";

export type WorkflowId = "launch-channel" | "produce-video" | "improve-channel";

export type ToolStatus = "ready" | "review" | "hidden";

export type WorkflowAction =
  | { type: "tool"; toolId: CanonicalToolId }
  | { type: "route"; href: string };

export interface CreatorTool {
  id: CanonicalToolId;
  title: string;
  shortTitle: string;
  description: string;
  group: "Strategy" | "Research" | "Production" | "Optimization";
  stage: "strategy" | "research" | "planning" | "production" | "optimization" | "review";
  status: ToolStatus;
  dashboardToolId?: string;
  route?: string;
  aliases: string[];
  visibleInSidebar: boolean;
  visibleInToolbox: boolean;
}

export interface CreatorWorkflowStep {
  id: string;
  title: string;
  description: string;
  action: WorkflowAction;
}

export interface CreatorWorkflow {
  id: WorkflowId;
  title: string;
  subtitle: string;
  description: string;
  iconKey: "target" | "clapperboard" | "trending";
  accent: string;
  steps: CreatorWorkflowStep[];
}

export const CREATOR_TOOLS: CreatorTool[] = [
  {
    id: "niche-radar",
    title: "Niche Radar",
    shortTitle: "Niche",
    description: "Find viable YouTube niches, audience angles, and channel opportunities.",
    group: "Research",
    stage: "research",
    status: "ready",
    dashboardToolId: "niche-radar",
    aliases: ["micro-niche-miner", "niche-engine", "koda-niche-radar", "winning-niche-library"],
    visibleInSidebar: true,
    visibleInToolbox: true,
  },
  {
    id: "rival-scanner",
    title: "Rival Scanner",
    shortTitle: "Rivals",
    description: "Study competitor formats, titles, topics, thumbnails, and growth patterns.",
    group: "Research",
    stage: "research",
    status: "ready",
    dashboardToolId: "rival-scanner",
    aliases: ["competitor-analyze", "tube-spy", "hidden-channel-finder"],
    visibleInSidebar: true,
    visibleInToolbox: true,
  },
  {
    id: "script-studio",
    title: "Script Studio",
    shortTitle: "Script",
    description: "Turn ideas into hooks, outlines, voice-over scripts, CTAs, and Shorts versions.",
    group: "Production",
    stage: "production",
    status: "ready",
    dashboardToolId: "script-studio",
    aliases: ["scriptwriter", "script-writer", "koda-script-studio", "script-refiner"],
    visibleInSidebar: true,
    visibleInToolbox: true,
  },
  {
    id: "voice-studio",
    title: "Voice Studio",
    shortTitle: "Voice",
    description: "Create voiceovers, captions, dubbing, and localized audio for video production.",
    group: "Production",
    stage: "production",
    status: "review",
    dashboardToolId: "voice-studio",
    aliases: ["multilingual-studio", "text-to-speech", "dubbing", "tts", "voice-studio"],
    visibleInSidebar: false,
    visibleInToolbox: true,
  },
  {
    id: "video-pipeline",
    title: "Video Pipeline",
    shortTitle: "Video",
    description: "Connect script, voice, assets, captions, thumbnail brief, and publishing checklist.",
    group: "Production",
    stage: "production",
    status: "ready",
    dashboardToolId: "video-pipeline",
    aliases: ["velocity", "auto-short", "video-automation"],
    visibleInSidebar: true,
    visibleInToolbox: true,
  },
  {
    id: "seo-tool",
    title: "SEO Tool",
    shortTitle: "SEO",
    description: "Optimize titles, descriptions, tags, keywords, and upload metadata.",
    group: "Optimization",
    stage: "optimization",
    status: "ready",
    dashboardToolId: "seo-tool",
    aliases: ["seo", "youtube-seo", "keyword-research", "seo-score"],
    visibleInSidebar: true,
    visibleInToolbox: true,
  },
  {
    id: "intelligence-hub",
    title: "Intelligence Hub",
    shortTitle: "Intel",
    description: "Unify niche, trend, competitor, and channel insights for better decisions.",
    group: "Research",
    stage: "review",
    status: "review",
    dashboardToolId: "intelligence-hub",
    aliases: ["creator-dashboard", "trends", "daily-ideas", "future-eye"],
    visibleInSidebar: true,
    visibleInToolbox: true,
  },
  {
    id: "ai-coach",
    title: "AI Creator Coach",
    shortTitle: "Coach",
    description: "Review goals, clarify strategy, and recommend the next practical action.",
    group: "Strategy",
    stage: "strategy",
    status: "ready",
    route: "/dashboard/ai-coach",
    aliases: ["coach", "ai-coach"],
    visibleInSidebar: true,
    visibleInToolbox: true,
  },
];

export const CREATOR_WORKFLOWS: CreatorWorkflow[] = [
  {
    id: "launch-channel",
    title: "Launch a YouTube channel",
    subtitle: "From niche to the first 30-day content plan",
    description:
      "For new creators or channels that need clearer positioning: choose a niche, define the audience, map competitors, and create the first publishing plan.",
    iconKey: "target",
    accent: "from-cyan-400 to-blue-500",
    steps: [
      {
        id: "find-niche",
        title: "Find the niche",
        description: "Evaluate market demand, competition level, and durable content angles.",
        action: { type: "tool", toolId: "niche-radar" },
      },
      {
        id: "study-rivals",
        title: "Study competitors",
        description: "Break down formats, titles, topics, thumbnails, and repeatable patterns.",
        action: { type: "tool", toolId: "rival-scanner" },
      },
      {
        id: "build-plan",
        title: "Build a 30-day plan",
        description: "Use AI Coach to create pillars, series, and a realistic publishing calendar.",
        action: { type: "route", href: "/dashboard/ai-coach" },
      },
    ],
  },
  {
    id: "produce-video",
    title: "Produce a video",
    subtitle: "From one idea to a publish-ready video package",
    description:
      "For each video: write the script, create voice and captions, prepare the production brief, and package it for publishing.",
    iconKey: "clapperboard",
    accent: "from-violet-400 to-fuchsia-500",
    steps: [
      {
        id: "write-script",
        title: "Write the script",
        description: "Create hook, outline, voice-over, CTA, and a Shorts variant.",
        action: { type: "tool", toolId: "script-studio" },
      },
      {
        id: "create-voice",
        title: "Create voice and captions",
        description: "Prepare voiceover, captions, dubbing, or localization for the video.",
        action: { type: "tool", toolId: "voice-studio" },
      },
      {
        id: "build-video-package",
        title: "Build the video package",
        description: "Connect script, voice, visual prompts, thumbnail concept, and SEO checklist.",
        action: { type: "tool", toolId: "video-pipeline" },
      },
    ],
  },
  {
    id: "improve-channel",
    title: "Improve channel performance",
    subtitle: "Use SEO, intelligence, and coaching to decide the next move",
    description:
      "For channels with existing content: improve metadata, learn from data, compare competitors, and choose the next experiment.",
    iconKey: "trending",
    accent: "from-emerald-400 to-cyan-500",
    steps: [
      {
        id: "optimize-video",
        title: "Optimize publishing metadata",
        description: "Improve title, description, tags, keywords, and upload checklist.",
        action: { type: "tool", toolId: "seo-tool" },
      },
      {
        id: "review-insights",
        title: "Review content intelligence",
        description: "Combine niche, trend, competitor, and performance insights.",
        action: { type: "tool", toolId: "intelligence-hub" },
      },
      {
        id: "next-action",
        title: "Choose the next action",
        description: "Ask AI Coach what to test or improve next week.",
        action: { type: "route", href: "/dashboard/ai-coach" },
      },
    ],
  },
];

export const CANONICAL_TOOL_IDS = CREATOR_TOOLS.map((tool) => tool.id);

export function getCreatorTool(toolId: string | null | undefined) {
  if (!toolId) return undefined;
  const normalized = normalizeToolId(toolId);
  return CREATOR_TOOLS.find((tool) => tool.id === normalized);
}

export function normalizeToolId(toolId: string): CanonicalToolId | undefined {
  const direct = CREATOR_TOOLS.find((tool) => tool.id === toolId);
  if (direct) return direct.id;

  const alias = CREATOR_TOOLS.find((tool) => tool.aliases.includes(toolId));
  return alias?.id;
}

export function getDashboardToolId(toolId: string): string | undefined {
  const tool = getCreatorTool(toolId);
  return tool?.dashboardToolId;
}

export function getToolAction(toolId: CanonicalToolId): WorkflowAction {
  const tool = getCreatorTool(toolId);
  if (!tool) return { type: "route", href: "/dashboard" };
  if (tool.dashboardToolId) return { type: "tool", toolId: tool.id };
  return { type: "route", href: tool.route || "/dashboard" };
}

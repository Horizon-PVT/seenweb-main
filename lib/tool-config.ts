import {
  BarChart3,
  Bot,
  Brain,
  Clapperboard,
  FileText,
  Languages,
  Radar,
  Search,
  Sparkles,
} from "lucide-react";
import type { ElementType } from "react";

export type ToolStatus = "active" | "review" | "hidden";
export type ToolGroup = "strategy" | "research" | "production" | "optimization" | "legacy";
export type ToolRole = "FREE" | "USER" | "BASIC" | "PRO" | "ADMIN";

export interface ToolConfig {
  id: string;
  label: string;
  description: string;
  icon: ElementType;
  status: ToolStatus;
  minRole: ToolRole;
  color: string;
  group: ToolGroup;
  route?: string;
  decision: "keep" | "merge" | "hide" | "delete-later";
  notes: string;
}

export const TOOLS: ToolConfig[] = [
  {
    id: "niche-radar",
    label: "Niche Radar",
    description: "Find viable YouTube niches, audience angles, and channel opportunities.",
    icon: Radar,
    status: "active",
    minRole: "FREE",
    color: "text-cyan-300",
    group: "research",
    decision: "keep",
    notes: "Core workflow entry for channel positioning and niche selection.",
  },
  {
    id: "rival-scanner",
    label: "Rival Scanner",
    description: "Study competitor formats, topics, thumbnails, titles, and repeatable patterns.",
    icon: Search,
    status: "active",
    minRole: "FREE",
    color: "text-blue-300",
    group: "research",
    decision: "keep",
    notes: "Core research tool after niche selection.",
  },
  {
    id: "script-studio",
    label: "Script Studio",
    description: "Turn ideas into hooks, outlines, voice-over scripts, CTAs, and Shorts variants.",
    icon: FileText,
    status: "active",
    minRole: "FREE",
    color: "text-violet-300",
    group: "production",
    decision: "keep",
    notes: "Core production tool for every video workflow.",
  },
  {
    id: "voice-studio",
    label: "Voice Studio",
    description: "Create voiceovers, captions, dubbing, and localized audio for YouTube production.",
    icon: Languages,
    status: "review",
    minRole: "BASIC",
    color: "text-emerald-300",
    group: "production",
    route: "/tools/multilingual-studio",
    decision: "merge",
    notes: "Keep capability, merge multilingual, TTS, dubbing, and localization into one production step.",
  },
  {
    id: "video-pipeline",
    label: "Video Pipeline",
    description: "Connect script, voice, assets, captions, thumbnail brief, SEO, and upload checklist.",
    icon: Clapperboard,
    status: "active",
    minRole: "BASIC",
    color: "text-rose-300",
    group: "production",
    decision: "keep",
    notes: "Core workflow tool for packaging one publish-ready video.",
  },
  {
    id: "seo-tool",
    label: "SEO Tool",
    description: "Optimize titles, descriptions, tags, keywords, and publishing metadata.",
    icon: BarChart3,
    status: "active",
    minRole: "FREE",
    color: "text-amber-300",
    group: "optimization",
    decision: "keep",
    notes: "Core optimization tool before publishing and after reviewing performance.",
  },
  {
    id: "intelligence-hub",
    label: "Intelligence Hub",
    description: "Unify niche, trend, competitor, and channel insights for better content decisions.",
    icon: Brain,
    status: "review",
    minRole: "BASIC",
    color: "text-cyan-300",
    group: "research",
    decision: "merge",
    notes: "Merge hidden-channel, trend, keyword, creator dashboard, and analytics surfaces here.",
  },
  {
    id: "ai-coach",
    label: "AI Creator Coach",
    description: "Review goals, clarify strategy, and recommend the next practical action.",
    icon: Bot,
    status: "active",
    minRole: "FREE",
    color: "text-purple-300",
    group: "strategy",
    route: "/dashboard/ai-coach",
    decision: "keep",
    notes: "Core strategy layer across all creator workflows.",
  },
];

export const HIDDEN_LEGACY_TOOLS: ToolConfig[] = [
  {
    id: "marketplace",
    label: "Marketplace",
    description: "Channel marketplace surface.",
    icon: Sparkles,
    status: "hidden",
    minRole: "ADMIN",
    color: "text-slate-500",
    group: "legacy",
    route: "/tools/marketplace",
    decision: "hide",
    notes: "Separate business product, not part of YouTube creator workflow.",
  },
  {
    id: "affiliate-partner",
    label: "Affiliate Partner",
    description: "Affiliate and reseller program.",
    icon: Sparkles,
    status: "hidden",
    minRole: "ADMIN",
    color: "text-slate-500",
    group: "legacy",
    route: "/tools/affiliate-partner",
    decision: "hide",
    notes: "Revenue program, not a core creator workflow.",
  },
  {
    id: "desktop-apps",
    label: "Desktop Apps",
    description: "Desktop download and install surface.",
    icon: Sparkles,
    status: "hidden",
    minRole: "ADMIN",
    color: "text-slate-500",
    group: "legacy",
    route: "/tools/desktop-apps",
    decision: "hide",
    notes: "Keep out of primary product until it supports the core workflow.",
  },
  {
    id: "white-label",
    label: "White Label",
    description: "Agency reseller surface.",
    icon: Sparkles,
    status: "hidden",
    minRole: "ADMIN",
    color: "text-slate-500",
    group: "legacy",
    route: "/tools/white-label",
    decision: "hide",
    notes: "Business development surface, not primary creator UX.",
  },
];

export const VISIBLE_TOOLS = TOOLS.filter((tool) => tool.status !== "hidden");

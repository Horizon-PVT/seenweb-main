import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Bot,
  ChevronLeft,
  Clapperboard,
  CreditCard,
  FileText,
  FolderKanban,
  Globe2,
  Home,
  LogOut,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  Workflow,
} from "lucide-react";
import { CREATOR_TOOLS, CanonicalToolId } from "@/lib/creator-workflows";
import { getCreatorCopy } from "@/lib/creator-i18n";

interface SidebarProps {
  userRole?: string;
  activeTool?: string | null;
  onToolSelect?: (_toolId: string) => void;
}

type NavItem =
  | {
      id: string;
      label: string;
      description?: string;
      icon: React.ElementType;
      path: string;
      exact?: boolean;
      matchQuery?: string;
      badge?: string;
    }
  | {
      id: string;
      label: string;
      description?: string;
      icon: React.ElementType;
      toolId: CanonicalToolId;
      badge?: string;
    };

const primaryNav: NavItem[] = [
  { id: "home", label: "home", description: "homeDesc", icon: Home, path: "/dashboard", exact: true },
  { id: "workflows", label: "workflows", description: "workflowsDesc", icon: Workflow, path: "/dashboard?workflow=launch-channel", matchQuery: "workflow=" },
  { id: "ai-coach", label: "aiCoach", description: "aiCoachDesc", icon: Bot, toolId: "ai-coach", badge: "Core" },
  { id: "projects", label: "projects", description: "projectsDesc", icon: FolderKanban, path: "/dashboard/trends" },
];

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

const toolNav: NavItem[] = CREATOR_TOOLS.filter((tool) => tool.visibleInSidebar && tool.dashboardToolId).map((tool) => ({
  id: tool.id,
  label: tool.title,
  description: tool.description,
  icon: toolIcons[tool.id],
  toolId: tool.id,
  badge: tool.status === "review" ? "Review" : undefined,
}));

const accountNav: NavItem[] = [
  { id: "account", label: "account", description: "accountDesc", icon: User, path: "/dashboard/settings" },
  { id: "billing", label: "billing", description: "billingDesc", icon: CreditCard, path: "/dashboard/subscription" },
];

function getTierColor(role: string) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    FREE: { bg: "bg-slate-500/15", text: "text-slate-300", border: "border-slate-500/25" },
    STARTER: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/25" },
    CREATOR: { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-500/25" },
    FACTORY: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/25" },
    AGENCY: { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/25" },
    ENTERPRISE: { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/25" },
    ADMIN: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/25" },
  };

  return colors[role] || colors.FREE;
}

export default function Sidebar({ userRole = "FREE", activeTool, onToolSelect }: SidebarProps) {
  const router = useRouter();
  const copy = getCreatorCopy(router.locale);
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const userAvatar = session?.user?.image;
  const userName = session?.user?.name || "Creator";
  const tierColor = getTierColor(userRole);

  const isActive = (item: NavItem) => {
    if ("toolId" in item) return activeTool === item.toolId;
    if (item.matchQuery) return router.asPath.includes(item.matchQuery) && !activeTool;
    if (item.exact) return router.pathname === item.path && !activeTool && !router.asPath.includes("workflow=");
    return router.pathname.startsWith(item.path);
  };

  const handleNavClick = (item: NavItem) => {
    if ("toolId" in item) {
      if (onToolSelect) {
        onToolSelect(item.toolId);
      } else {
        router.push(`/dashboard?tool=${item.toolId}`);
      }
      return;
    }

    router.push(item.path);
  };

  const getNavLabel = (key: string) => {
    const nav = copy.nav as unknown as Record<string, string>;
    return nav[key] || key;
  };

  const renderNavGroup = (label: string, items: NavItem[]) => (
    <div className="space-y-1">
      {!isCollapsed && (
        <div className="px-3 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-600">
          {label}
        </div>
      )}

      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
              active
                ? "border-cyan-300/25 bg-cyan-300/10 text-white"
                : "border-transparent text-slate-500 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
            title={isCollapsed ? ("toolId" in item ? copy.tools[item.toolId].title : getNavLabel(item.label)) : undefined}
          >
            <Icon size={19} strokeWidth={active ? 2.25 : 1.8} className={active ? "text-cyan-300" : ""} />

            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{"toolId" in item ? copy.tools[item.toolId].title : getNavLabel(item.label)}</div>
                  {item.description && (
                    <div className="truncate text-[11px] text-slate-600">
                      {"toolId" in item ? copy.tools[item.toolId].description : getNavLabel(item.description)}
                    </div>
                  )}
                </div>
                {item.badge && (
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-200">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/10 bg-[#070c12] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <button className="flex min-w-0 items-center gap-3" onClick={() => router.push("/dashboard")}>
            <Image src="/seenyt-mark.png" alt="SeenYT" width={38} height={38} className="rounded-lg" />
            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <div className="text-lg font-black text-white">SeenYT</div>
                <div className="truncate text-[11px] font-bold text-slate-500">YouTube Content OS</div>
              </div>
            )}
          </button>
          {!isCollapsed && (
            <button onClick={() => setIsCollapsed(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white">
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {renderNavGroup(copy.nav.main, primaryNav)}
          <div className="my-4 h-px bg-white/10" />
          {renderNavGroup(copy.nav.coreTools, toolNav)}
          <div className="my-4 h-px bg-white/10" />
          {renderNavGroup(copy.nav.accountGroup, accountNav)}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => setShowAccountMenu(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-transparent p-2 text-left hover:border-white/10 hover:bg-white/[0.04]"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              {userAvatar ? (
                <Image src={userAvatar} alt={userName} fill sizes="40px" className="object-cover" />
              ) : (
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black ${tierColor.bg} ${tierColor.text}`}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black text-white">{userName}</div>
                <div className={`mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${tierColor.bg} ${tierColor.text} ${tierColor.border}`}>
                  {userRole}
                </div>
              </div>
            )}

            {!isCollapsed && <Settings size={17} className="text-slate-500" />}
          </button>
        </div>
      </aside>

      {showAccountMenu && (
        <>
          <button className="fixed inset-0 z-[100] cursor-default" onClick={() => setShowAccountMenu(false)} aria-label="Close account menu" />
          <div className="fixed left-1/2 top-1/2 z-[110] w-80 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#111822] p-3 shadow-2xl">
            <div className="border-b border-white/10 p-3">
              <div className="text-sm font-black text-white">{userName}</div>
              <div className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${tierColor.bg} ${tierColor.text} ${tierColor.border}`}>
                {userRole} plan
              </div>
            </div>

            <div className="py-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setShowAccountMenu(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                <Settings size={17} className="text-cyan-300" />
                {copy.nav.accountSettings}
              </Link>
              <Link
                href="/dashboard/subscription"
                onClick={() => setShowAccountMenu(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                <CreditCard size={17} className="text-cyan-300" />
                {copy.nav.planBilling}
              </Link>
            </div>

            <div className="border-t border-white/10 pt-2">
              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10"
              >
                <LogOut size={17} />
                {copy.nav.signOut}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

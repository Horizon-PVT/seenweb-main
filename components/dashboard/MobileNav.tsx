import React from "react";
import { useRouter } from "next/router";
import { Bot, Home, Search, Settings, TrendingUp, Wand2, Workflow } from "lucide-react";
import { CanonicalToolId, getToolAction } from "@/lib/creator-workflows";
import { getCreatorCopy } from "@/lib/creator-i18n";

interface MobileNavProps {
  activeTool?: string | null;
  onToolSelect: (_toolId: string | null) => void;
}

type MobileItem =
  | {
      id: string;
      label: keyof ReturnType<typeof getCreatorCopy>["mobile"];
      icon: React.ElementType;
      path: string;
      exact?: boolean;
      matchWorkflow?: boolean;
    }
  | {
      id: string;
      label: keyof ReturnType<typeof getCreatorCopy>["mobile"];
      icon: React.ElementType;
      toolId: CanonicalToolId;
    };

const navItems: MobileItem[] = [
  { id: "home", label: "home", icon: Home, path: "/dashboard", exact: true },
  { id: "workflows", label: "flow", icon: Workflow, path: "/dashboard?workflow=launch-channel", matchWorkflow: true },
  { id: "niche", label: "niche", icon: Search, toolId: "niche-radar" },
  { id: "produce", label: "create", icon: Wand2, toolId: "script-studio" },
  { id: "optimize", label: "seo", icon: TrendingUp, toolId: "seo-tool" },
  { id: "coach", label: "coach", icon: Bot, path: "/dashboard/ai-coach" },
  { id: "account", label: "account", icon: Settings, path: "/dashboard/settings" },
];

const MobileNav: React.FC<MobileNavProps> = ({ activeTool, onToolSelect }) => {
  const router = useRouter();
  const copy = getCreatorCopy(router.locale);

  const isActive = (item: MobileItem) => {
    if ("toolId" in item) return activeTool === item.toolId;
    if (item.matchWorkflow) return router.pathname === "/dashboard" && router.asPath.includes("workflow=") && !activeTool;
    if (item.exact) return router.pathname === item.path && !router.asPath.includes("workflow=") && !activeTool;
    return router.pathname.startsWith(item.path);
  };

  const handleClick = (item: MobileItem) => {
    if ("toolId" in item) {
      const action = getToolAction(item.toolId);
      if (action.type === "tool") {
        onToolSelect(action.toolId);
      } else {
        router.push(action.href);
      }
      return;
    }

    if (item.path === "/dashboard") {
      onToolSelect(null);
      return;
    }

    router.push(item.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#070c12]/95 backdrop-blur-lg md:hidden">
      <div className="flex h-16 items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 transition ${
                active ? "bg-cyan-300/10 text-cyan-300" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
              <span className="text-[10px] font-black uppercase tracking-tight">{copy.mobile[item.label]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;

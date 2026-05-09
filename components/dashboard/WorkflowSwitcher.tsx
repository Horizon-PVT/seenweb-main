// components/dashboard/WorkflowSwitcher.tsx
// Phase 0: Switch between workflows in the unified hub

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useCreatorHub } from '@/lib/creator-hub-context';
import { WORKFLOWS, WorkflowId, getWorkflowLockMessage } from '@/lib/workflow-access';
import { hasMinRole } from '@/lib/tab-access';
import {
  Globe,
  PlayCircle,
  Database,
  BarChart3,
  Network,
  Brain,
  ShoppingBag,
  GraduationCap,
  Users,
  CreditCard,
  ChevronRight,
  Sparkles,
  Lock,
  Check
} from 'lucide-react';

const WORKFLOW_ICONS: Record<WorkflowId, any> = {
  'wf1-webspace': Globe,
  'wf2-video': PlayCircle,
  'wf3-novel': Database,
  'wf4-channel': BarChart3,
  'wf5-multi': Network,
  'wf6-niche': Brain,
  'wf7-marketplace': ShoppingBag,
  'ai-coach': Sparkles,
  'academy': GraduationCap,
  'affiliate': Users,
  'billing': CreditCard,
};

const WORKFLOW_COLORS: Record<WorkflowId, string> = {
  'wf1-webspace': 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  'wf2-video': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'wf3-novel': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  'wf4-channel': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'wf5-multi': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'wf6-niche': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'wf7-marketplace': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'ai-coach': 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  'academy': 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  'affiliate': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'billing': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

export default function WorkflowSwitcher() {
  const router = useRouter();
  const { data: session } = useSession();
  const { activeWorkflow, setActiveWorkflow, hasChannel } = useCreatorHub();
  const [showDropdown, setShowDropdown] = useState(false);

  const userRole = (session?.user as any)?.role || 'FREE';

  const currentWorkflow = WORKFLOWS.find(w => w.id === activeWorkflow);
  const CurrentIcon = currentWorkflow ? WORKFLOW_ICONS[currentWorkflow.id] : Globe;

  const handleWorkflowSelect = (workflowId: WorkflowId) => {
    const workflow = WORKFLOWS.find(w => w.id === workflowId);
    if (!workflow) return;

    // Check access
    const canAccess = hasMinRole(userRole, workflow.minRole as any);
    if (!canAccess) {
      return; // Could show upgrade modal
    }

    if (workflow.requiresChannel && !hasChannel) {
      // Redirect to channel connection
      router.push('/dashboard?tab=wf4-channel');
    } else {
      setActiveWorkflow(workflowId);
      // Update URL
      router.push(`/dashboard?workflow=${workflowId}`, undefined, { shallow: true });
    }
    setShowDropdown(false);
  };

  const handleNavigateToTool = (toolPath: string) => {
    router.push(toolPath);
    setShowDropdown(false);
  };

  return (
    <div className="px-6 py-3 flex items-center justify-between">
      {/* Current Workflow */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${WORKFLOW_COLORS[activeWorkflow]} transition-all hover:scale-[1.02]`}
        >
          <CurrentIcon size={18} />
          <span className="font-bold text-sm">{currentWorkflow?.labelVi || 'Dashboard'}</span>
          <ChevronRight size={14} className={`transition-transform ${showDropdown ? 'rotate-90' : ''}`} />
        </button>

        {/* Quick tool access */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-gray-600 text-xs">Tools:</span>
          {activeWorkflow === 'wf1-webspace' && (
            <>
              <button onClick={() => handleNavigateToTool('/tools/micro-niche-miner')} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                Micro Niche
              </button>
              <button onClick={() => handleNavigateToTool('/tools/scriptwriter')} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                Scriptwriter
              </button>
              <button onClick={() => handleNavigateToTool('/tools/seo')} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                SEO Tool
              </button>
            </>
          )}
          {activeWorkflow === 'wf4-channel' && (
            <>
              <button onClick={() => handleNavigateToTool('/tools/intelligence-hub')} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                Intelligence Hub
              </button>
              <button onClick={() => handleNavigateToTool('/tools/video-pipeline')} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                Video Pipeline
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right side: breadcrumb + quick actions */}
      <div className="flex items-center gap-4">
        {/* Channel indicator */}
        {hasChannel && (
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Kênh đã kết nối</span>
          </div>
        )}

        {/* User tier badge */}
        <div className="hidden md:flex items-center gap-2">
          <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
            userRole === 'PRO' || userRole === 'ADMIN'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
              : userRole === 'BASIC'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {userRole}
          </span>
        </div>
      </div>

      {/* Workflow Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute top-14 left-6 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Chọn Workflow</p>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {WORKFLOWS.map(workflow => {
                const Icon = WORKFLOW_ICONS[workflow.id];
                const canAccess = hasMinRole(userRole, workflow.minRole as any);
                const isLocked = !canAccess || (workflow.requiresChannel && !hasChannel);
                const isActive = workflow.id === activeWorkflow;

                return (
                  <button
                    key={workflow.id}
                    onClick={() => handleWorkflowSelect(workflow.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-white/10 border border-white/10'
                        : 'hover:bg-white/5 border border-transparent'
                    } ${isLocked ? 'opacity-50' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/10' : 'bg-white/5'
                    }`}>
                      <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {workflow.labelVi}
                        </p>
                        {workflow.minRole !== 'FREE' && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                            workflow.minRole === 'PRO' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                          }`}>
                            {workflow.minRole}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{workflow.descriptionVi}</p>
                    </div>
                    {isActive && <Check size={16} className="text-purple-400 shrink-0" />}
                    {isLocked && <Lock size={14} className="text-gray-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

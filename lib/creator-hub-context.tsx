// lib/creator-hub-context.tsx
// Phase 0: Creator Hub Global State Context

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { hasMinRole } from './tab-access';
import { WORKFLOWS, WorkflowId, canAccessWorkflow } from './workflow-access';

// =============================================
// TYPES
// =============================================

export type TierLevel = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE' | 'ADMIN';

export interface Channel {
  id: string;
  channelId: string;
  title: string | null;
  thumbnail: string | null;
  subCount: number;
  videoCount: number;
  viewCount?: string;
  lastSync: string | null;
  healthScore: number | null;
  isPrimary?: boolean;
}

export interface WorkspaceState {
  // User
  userId: string | null;
  userRole: string;
  userTier: TierLevel;
  userName: string | null;
  userEmail: string | null;

  // Channel
  channels: Channel[];
  activeChannel: Channel | null;
  hasChannel: boolean;

  // Workflow
  activeWorkflow: WorkflowId;
  activeSubTool: string | null;

  // Workspace
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';

  // Loading states
  isLoadingChannels: boolean;
  isInitialized: boolean;
}

export interface WorkspaceActions {
  setActiveWorkflow: (wf: WorkflowId) => void;
  setActiveSubTool: (tool: string | null) => void;
  setActiveChannel: (channel: Channel | null) => void;
  toggleSidebar: () => void;
  refreshChannels: () => Promise<void>;
  canAccess: (workflowId: WorkflowId) => boolean;
}

// =============================================
// CONTEXT
// =============================================

const WorkspaceContext = createContext<WorkspaceState & WorkspaceActions | null>(null);

// =============================================
// PROVIDER
// =============================================

export function CreatorHubProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannelState] = useState<Channel | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowId>('wf1-webspace');
  const [activeSubTool, setActiveSubTool] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  // Derived values
  const userId = (session?.user as any)?.id || null;
  const userRole = (session?.user as any)?.role || 'FREE';
  const userTier = ((session?.user as any)?.tier || userRole === 'ADMIN' ? 'ADMIN' : userRole) as TierLevel;
  const userName = session?.user?.name || null;
  const userEmail = session?.user?.email || null;
  const hasChannel = channels.length > 0;

  // Fetch channels on mount or session change
  const refreshChannels = useCallback(async () => {
    if (status !== 'authenticated' || !userId) return;

    setIsLoadingChannels(true);
    try {
      const res = await fetch('/api/user/channels');
      if (res.ok) {
        const data = await res.json();
        const channelList: Channel[] = data.channels || [];
        setChannels(channelList);

        // Auto-select primary channel
        const primary = channelList.find((c: Channel) => c.isPrimary) || channelList[0] || null;
        setActiveChannelState(primary);
      }
    } catch (err) {
      console.error('[CreatorHub] Failed to fetch channels:', err);
    } finally {
      setIsLoadingChannels(false);
    }
  }, [status, userId]);

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      refreshChannels().then(() => setIsInitialized(true));
    } else if (status === 'unauthenticated') {
      setIsInitialized(true);
    }
  }, [status, userId, refreshChannels]);

  const setActiveChannel = useCallback((channel: Channel | null) => {
    setActiveChannelState(channel);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const canAccess = useCallback((workflowId: WorkflowId): boolean => {
    return canAccessWorkflow(userRole, workflowId, hasChannel);
  }, [userRole, hasChannel]);

  const value: WorkspaceState & WorkspaceActions = {
    // User
    userId,
    userRole,
    userTier,
    userName,
    userEmail,

    // Channel
    channels,
    activeChannel,
    hasChannel,

    // Workflow
    activeWorkflow,
    activeSubTool,

    // Workspace
    sidebarCollapsed,
    theme: 'dark',

    // Loading
    isLoadingChannels,
    isInitialized,

    // Actions
    setActiveWorkflow,
    setActiveSubTool,
    setActiveChannel,
    toggleSidebar,
    refreshChannels,
    canAccess,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// =============================================
// HOOK
// =============================================

export function useCreatorHub(): WorkspaceState & WorkspaceActions {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useCreatorHub must be used within CreatorHubProvider');
  }
  return context;
}

// =============================================
// SELECTOR HOOKS (for performance)
// =============================================

export function useUser() {
  const { userId, userRole, userTier, userName, userEmail } = useCreatorHub();
  return { userId, userRole, userTier, userName, userEmail };
}

export function useActiveChannel() {
  const { activeChannel, setActiveChannel, channels } = useCreatorHub();
  return { activeChannel, setActiveChannel, channels };
}

export function useWorkflow() {
  const { activeWorkflow, setActiveWorkflow, activeSubTool, setActiveSubTool, canAccess } = useCreatorHub();
  return { activeWorkflow, setActiveWorkflow, activeSubTool, setActiveSubTool, canAccess };
}

// lib/workspace-sync.ts
// Phase 7: Multiplayer Workspace - Real-time collaboration and sync

import { prisma } from '@/lib/prisma';

// Workspace types
export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  addedAt: Date;
  addedBy: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceItem {
  id: string;
  workspaceId: string;
  createdBy: string;
  type: 'script' | 'thumbnail' | 'calendar_event' | 'idea';
  name: string;
  data: any;
  sharedWith: string[]; // user IDs
  createdAt: Date;
  updatedAt: Date;
}

// Create workspace
export async function createWorkspace(
  ownerId: string,
  name: string
): Promise<Workspace> {
  const workspace = await prisma.systemSetting.create({
    data: {
      key: `workspace:${Date.now()}`,
      value: JSON.stringify({
        id: `ws_${Date.now()}`,
        name,
        ownerId,
        members: [{ userId: ownerId, role: 'owner', addedAt: new Date(), addedBy: ownerId }],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
  });

  return JSON.parse(workspace.value);
}

// Add member to workspace
export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: WorkspaceMember['role'],
  addedBy: string
): Promise<void> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  // Check if user is already a member
  if (workspace.members.some(m => m.userId === userId)) {
    throw new Error('User is already a member');
  }

  // Check permission
  const requester = workspace.members.find(m => m.userId === addedBy);
  if (!requester || !['owner', 'admin'].includes(requester.role)) {
    throw new Error('Permission denied');
  }

  workspace.members.push({
    userId,
    role,
    addedAt: new Date(),
    addedBy,
  });

  await updateWorkspace(workspaceId, workspace);
}

// Get workspace
export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: `workspace:${workspaceId}` },
  });

  if (!setting) return null;

  try {
    return JSON.parse(setting.value);
  } catch {
    return null;
  }
}

// Update workspace
export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Workspace>
): Promise<void> {
  const existing = await getWorkspace(workspaceId);
  if (!existing) throw new Error('Workspace not found');

  await prisma.systemSetting.update({
    where: { key: `workspace:${workspaceId}` },
    data: {
      value: JSON.stringify({ ...existing, ...data, updatedAt: new Date() }),
    },
  });
}

// Get user's workspaces
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const settings = await prisma.systemSetting.findMany({
    where: { key: { startsWith: 'workspace:' } },
  });

  const workspaces: Workspace[] = [];
  for (const setting of settings) {
    try {
      const workspace = JSON.parse(setting.value);
      if (workspace.members.some((m: WorkspaceMember) => m.userId === userId)) {
        workspaces.push(workspace);
      }
    } catch {
      // Skip invalid entries
    }
  }

  return workspaces.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

// Create shared item
export async function createWorkspaceItem(
  workspaceId: string,
  userId: string,
  type: WorkspaceItem['type'],
  name: string,
  data: any,
  sharedWith: string[] = []
): Promise<WorkspaceItem> {
  const item: WorkspaceItem = {
    id: `item_${Date.now()}`,
    workspaceId,
    createdBy: userId,
    type,
    name,
    data,
    sharedWith,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await prisma.systemSetting.create({
    data: {
      key: `workspace_item:${item.id}`,
      value: JSON.stringify(item),
    },
  });

  return item;
}

// Get workspace items
export async function getWorkspaceItems(
  workspaceId: string,
  userId: string
): Promise<WorkspaceItem[]> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return [];

  // Check if user has access
  if (!workspace.members.some(m => m.userId === userId)) {
    throw new Error('Access denied');
  }

  const settings = await prisma.systemSetting.findMany({
    where: { key: { startsWith: 'workspace_item:' } },
  });

  const items: WorkspaceItem[] = [];
  for (const setting of settings) {
    try {
      const item = JSON.parse(setting.value);
      if (item.workspaceId === workspaceId) {
        // Check if item is shared with user or user is the creator
        if (item.createdBy === userId || item.sharedWith.includes(userId)) {
          items.push(item);
        }
      }
    } catch {
      // Skip invalid entries
    }
  }

  return items.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

// Update workspace item
export async function updateWorkspaceItem(
  itemId: string,
  userId: string,
  data: Partial<WorkspaceItem>
): Promise<void> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: `workspace_item:${itemId}` },
  });

  if (!setting) throw new Error('Item not found');

  const item = JSON.parse(setting.value);
  const workspace = await getWorkspace(item.workspaceId);

  if (!workspace) throw new Error('Workspace not found');

  // Check permission
  const member = workspace.members.find((m: WorkspaceMember) => m.userId === userId);
  const isCreator = item.createdBy === userId;

  if (!member || (!isCreator && member.role === 'viewer')) {
    throw new Error('Permission denied');
  }

  await prisma.systemSetting.update({
    where: { key: `workspace_item:${itemId}` },
    data: {
      value: JSON.stringify({ ...item, ...data, updatedAt: new Date() }),
    },
  });
}

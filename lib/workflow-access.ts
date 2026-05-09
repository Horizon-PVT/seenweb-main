// lib/workflow-access.ts
// Phase 0: Workflow Access Hook - Check if user can access specific workflows

import { hasMinRole } from './tab-access';

export type WorkflowId =
  | 'wf1-webspace'    // Workflow 1: Cloud tools
  | 'wf2-video'       // Workflow 2: Desktop video studio
  | 'wf3-novel'       // Workflow 3: Desktop novel studio
  | 'wf4-channel'     // Workflow 4: YouTube channel integration
  | 'wf5-multi'       // Workflow 5: Multi-channel management
  | 'wf6-niche'       // Workflow 6: Micro niche intelligence
  | 'wf7-marketplace'  // Workflow 7: Channel marketplace
  | 'ai-coach'         // AI Coach
  | 'academy'          // Academy
  | 'affiliate'        // Affiliate program
  | 'billing';        // Billing/pricing

export interface WorkflowConfig {
  id: WorkflowId;
  label: string;
  labelVi: string;
  minRole: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE' | 'ADMIN';
  requiresChannel: boolean;  // Needs a connected YouTube channel
  description: string;
  descriptionVi: string;
}

export const WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'wf1-webspace',
    label: 'Workflow 1: Webspace',
    labelVi: 'WORKFLOW 1: Trạm Nội Dung Web',
    minRole: 'FREE',
    requiresChannel: false,
    description: 'Cloud tools: Micro Niche Miner, Scriptwriter, SEO',
    descriptionVi: 'Công cụ đám mây: Đào ngách, Viết kịch bản, SEO',
  },
  {
    id: 'wf2-video',
    label: 'Workflow 2: Video Studio',
    labelVi: 'WORKFLOW 2: Video Studio',
    minRole: 'BASIC',
    requiresChannel: false,
    description: 'Desktop app: Auto render video 4K',
    descriptionVi: 'App desktop: Tự động render video 4K',
  },
  {
    id: 'wf3-novel',
    label: 'Workflow 3: Novel Studio',
    labelVi: 'WORKFLOW 3: Novel Studio',
    minRole: 'BASIC',
    requiresChannel: false,
    description: 'Desktop app: Web novel automation',
    descriptionVi: 'App desktop: Tự động hóa web novel',
  },
  {
    id: 'wf4-channel',
    label: 'Workflow 4: Channel Integration',
    labelVi: 'WORKFLOW 4: Tích Hợp Kênh',
    minRole: 'BASIC',
    requiresChannel: false,
    description: 'YouTube analytics, video management, discovery',
    descriptionVi: 'Phân tích YouTube, quản lý video, khám phá',
  },
  {
    id: 'wf5-multi',
    label: 'Workflow 5: Multi-Channel',
    labelVi: 'WORKFLOW 5: Đa Kênh',
    minRole: 'PRO',
    requiresChannel: true,
    description: 'Content calendar, auto-publish, cross-platform',
    descriptionVi: 'Lịch nội dung, đăng tự động, đa nền tảng',
  },
  {
    id: 'wf6-niche',
    label: 'Workflow 6: Niche Intelligence',
    labelVi: 'WORKFLOW 6: Trí Tuệ Ngách',
    minRole: 'PRO',
    requiresChannel: true,
    description: 'Advanced research, trend detection, competitor AI',
    descriptionVi: 'Nghiên cứu nâng cao, phát hiện xu hướng, AI đối thủ',
  },
  {
    id: 'wf7-marketplace',
    label: 'Workflow 7: Marketplace',
    labelVi: 'WORKFLOW 7: Chợ Kênh',
    minRole: 'FREE',
    requiresChannel: false,
    description: 'Buy/sell YouTube channels',
    descriptionVi: 'Mua/bán kênh YouTube',
  },
  {
    id: 'ai-coach',
    label: 'AI Coach',
    labelVi: 'AI Coach',
    minRole: 'FREE',
    requiresChannel: false,
    description: 'Personal AI coaching',
    descriptionVi: 'Huấn luyện AI cá nhân',
  },
  {
    id: 'academy',
    label: 'Academy',
    labelVi: 'Học Viện',
    minRole: 'FREE',
    requiresChannel: false,
    description: 'Courses and tutorials',
    descriptionVi: 'Khóa học và hướng dẫn',
  },
  {
    id: 'affiliate',
    label: 'Affiliate',
    labelVi: 'Affiliate',
    minRole: 'FREE',
    requiresChannel: false,
    description: 'Earn commissions by referring users',
    descriptionVi: 'Hoa hồng giới thiệu người dùng',
  },
  {
    id: 'billing',
    label: 'Billing',
    labelVi: 'Thanh Toán',
    minRole: 'FREE',
    requiresChannel: false,
    description: 'Manage subscription and billing',
    descriptionVi: 'Quản lý đăng ký và thanh toán',
  },
];

// ENTERPRISE role check helper
function hasMinEnterpriseRole(userRole: string, minRole: string): boolean {
  if (minRole === 'ADMIN') return hasMinRole(userRole, 'ADMIN');
  if (minRole === 'ENTERPRISE') {
    return hasMinRole(userRole, 'PRO') || userRole === 'ENTERPRISE';
  }
  return hasMinRole(userRole, minRole as any);
}

export function canAccessWorkflow(
  userRole: string,
  workflowId: WorkflowId,
  hasChannel: boolean = false
): boolean {
  const workflow = WORKFLOWS.find(w => w.id === workflowId);
  if (!workflow) return false;

  if (!hasMinEnterpriseRole(userRole, workflow.minRole)) return false;
  if (workflow.requiresChannel && !hasChannel) return false;

  return true;
}

export function getWorkflowLockMessage(
  workflowId: WorkflowId,
  hasChannel: boolean = false
): string | null {
  const workflow = WORKFLOWS.find(w => w.id === workflowId);
  if (!workflow) return null;

  if (workflow.requiresChannel && !hasChannel) {
    return `Kết nối kênh YouTube trước để sử dụng ${workflow.labelVi}.`;
  }

  switch (workflow.minRole) {
    case 'BASIC':
      return `Nâng cấp lên gói BASIC để sử dụng ${workflow.labelVi}.`;
    case 'PRO':
      return `Nâng cấp lên gói PRO để sử dụng ${workflow.labelVi}.`;
    case 'ENTERPRISE':
      return `Yêu cầu gói ENTERPRISE để sử dụng ${workflow.labelVi}.`;
    default:
      return null;
  }
}

export function getWorkflowsForRole(userRole: string): WorkflowConfig[] {
  return WORKFLOWS.filter(wf => canAccessWorkflow(userRole, wf.id, false));
}

export function getWorkflowById(id: WorkflowId): WorkflowConfig | undefined {
  return WORKFLOWS.find(w => w.id === id);
}

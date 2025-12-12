// lib/roles.ts - Định nghĩa role + quyền hạn tool + usage limit (Dec 2025)
export const ROLES = {
  FREE: 'FREE',
  CREATIVE: 'CREATIVE',
  SUPER: 'SUPER',
  VIP: 'VIP',
} as const;

export type Role = keyof typeof ROLES;

// Giới hạn usage/ngày theo role
export const USAGE_LIMITS: Record<Role, number> = {
  FREE: 2, // Chỉ 2 lần/ngày cho 2 tool
  CREATIVE: Infinity, // Không giới hạn
  SUPER: Infinity,
  VIP: Infinity,
};

// Tool list (đúng 10 tool từ ToolsGrid.tsx)
export const TOOLS = [
  { id: 'scriptwriter', name: 'Viết kịch bản YouTube', roleMin: ROLES.FREE },
  { id: 'seo', name: 'SEO YouTube tối ưu', roleMin: ROLES.FREE },
  { id: 'rival-scanner', name: 'Phân tích đối thủ (độc quyền)', roleMin: ROLES.CREATIVE },
  { id: 'hidden-channel-finder', name: 'Tìm kênh ẩn (độc quyền)', roleMin: ROLES.SUPER },
  { id: 'micro-niche-miner', name: 'Tìm Micro Niches (độc quyền)', roleMin: ROLES.SUPER },
  { id: 'narrative-studio', name: 'Narrative Studio (độc quyền) – kiếm tiền KDP Amazon', roleMin: ROLES.SUPER },
  { id: 'script-refiner', name: 'Viết kịch bản nâng cao', roleMin: ROLES.SUPER },
  { id: 'image-forge', name: 'Tạo Thumbnail AI', roleMin: ROLES.SUPER },
  { id: 'text-to-speech', name: 'Text-to-Speech Google Cloud', roleMin: ROLES.SUPER },
  { id: 'velocity', name: 'Tạo Video (Velocity Tool)', roleMin: ROLES.SUPER },
] as const;

// Function check quyền truy cập tool
export function canAccessTool(toolId: string, userRole: Role) {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return false;

  const roleOrder = [ROLES.FREE, ROLES.CREATIVE, ROLES.SUPER, ROLES.VIP];
  const userIndex = roleOrder.indexOf(userRole);
  const minIndex = roleOrder.indexOf(tool.roleMin);
  return userIndex >= minIndex;
}

// Function get usage limit
export function getDailyLimit(role: Role) {
  return USAGE_LIMITS[role];
}
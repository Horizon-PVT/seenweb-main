export const ROLES = {
  FREE: 'FREE',
  CREATIVE: 'CREATIVE',
  SUPER: 'SUPER',
  VIP: 'VIP',
  ADMIN: 'ADMIN', // Thêm ADMIN
} as const;

export type Role = keyof typeof ROLES;

export const USAGE_LIMITS: Record<Role, number> = {
  FREE: 3,
  CREATIVE: Infinity,
  SUPER: Infinity,
  VIP: Infinity,
  ADMIN: Infinity, // Admin unlimited
};

export const TOOLS = [
  { id: 'scriptwriter', name: 'Viết kịch bản YouTube', roleMin: ROLES.FREE },
  { id: 'seo', name: 'SEO YouTube tối ưu', roleMin: ROLES.FREE },
  { id: 'rival-scanner', name: 'Phân tích đối thủ (độc quyền)', roleMin: ROLES.CREATIVE },
  { id: 'hidden-channel-finder', name: 'Tìm kênh ẩn (độc quyền)', roleMin: ROLES.SUPER },
  { id: 'micro-niche-miner', name: 'Tìm Micro Niches', roleMin: ROLES.FREE }, // Updated to allowed for FREE
  { id: 'narrative-studio', name: 'Narrative Studio (độc quyền) – kiếm tiền KDP Amazon', roleMin: ROLES.SUPER },
  { id: 'script-refiner', name: 'Viết kịch bản nâng cao', roleMin: ROLES.SUPER },
  { id: 'image-forge', name: 'Tạo Thumbnail AI', roleMin: ROLES.SUPER },
  { id: 'text-to-speech', name: 'Text-to-Speech Google Cloud', roleMin: ROLES.SUPER },
  { id: 'velocity', name: 'Tạo Video (Velocity Tool)', roleMin: ROLES.VIP },
  { id: 'dubbing', name: 'AI Dubbing Studio', roleMin: ROLES.VIP },
  { id: 'virtual-mc', name: 'Virtual MC', roleMin: ROLES.VIP },
] as const;

// ✅ FIX TRIỆT ĐỂ: ADMIN full quyền + roleOrder đúng thứ tự (higher role index cao hơn)
export function canAccessTool(toolId: string, userRole: Role) {
  // ADMIN mở hết mọi tool
  if (userRole === 'ADMIN') return true;

  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return false;

  // Thứ tự role: cao hơn mở được thấp hơn
  const roleOrder = [ROLES.FREE, ROLES.CREATIVE, ROLES.SUPER, ROLES.VIP, ROLES.ADMIN];
  const userIndex = roleOrder.indexOf(userRole);
  const minIndex = roleOrder.indexOf(tool.roleMin);

  // Nếu userRole không trong order (lỗi), default false
  if (userIndex === -1) return false;

  return userIndex >= minIndex;
}

export function getDailyLimit(role: Role) {
  return USAGE_LIMITS[role];
}
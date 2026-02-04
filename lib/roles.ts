export const ROLES = {
  FREE: 'FREE',
  CREATIVE: 'CREATIVE', // Basic
  SUPER: 'SUPER',       // Pro
  VIP: 'VIP',
  ADMIN: 'ADMIN',
} as const;

export type Role = keyof typeof ROLES;

// DEFINITIVE LIMITS (Per Tool)
export const ROLE_LIMITS: Record<Role, { type: 'LIFETIME' | 'DAILY', count: number }> = {
  FREE: { type: 'LIFETIME', count: 1 },      // 1 use lifetime PER TOOL
  CREATIVE: { type: 'DAILY', count: 20 },    // 20 uses daily PER TOOL
  SUPER: { type: 'DAILY', count: 50 },       // 50 uses daily PER TOOL (Hidden limit)
  VIP: { type: 'DAILY', count: 9999 },       // Unlimited
  ADMIN: { type: 'DAILY', count: 9999 },     // Unlimited
};

// Tools allowed for Free plan
export const FREE_ALLOWED_TOOLS = [
  'micro-niche-miner',
  'scriptwriter',
  'seo-tool', // seo-tool, seo alias handled in code
  'seo'
];

// Tools allowed for CREATIVE/BASIC plan (includes all FREE tools + more)
export const CREATIVE_ALLOWED_TOOLS = [
  // All FREE tools
  'micro-niche-miner',
  'scriptwriter',
  'seo-tool',
  'seo',
  // BASIC-specific tools
  'rival-scanner',        // Phân Tích Kênh Đối Thủ
  'thay-youtube',         // Thầy YouTube (Day 6-20)
  'dubbing',              // 10 credits AI Dubbing
  'image-forge',          // Tạo Ảnh - Thumbnail (NEW)
];

export const TOOLS = [
  { id: 'scriptwriter', name: 'Viết kịch bản YouTube', roleMin: ROLES.FREE },
  { id: 'seo', name: 'SEO YouTube tối ưu', roleMin: ROLES.FREE },
  { id: 'micro-niche-miner', name: 'Tìm Micro Niches', roleMin: ROLES.FREE },
  { id: 'niche-engine', name: 'Thư viện ngách thắng 100%', roleMin: ROLES.FREE },
  { id: 'thay-youtube', name: 'Thầy YouTube', roleMin: ROLES.FREE },
  { id: 'rival-scanner', name: 'Phân tích đối thủ', roleMin: ROLES.FREE },
  { id: 'hidden-channel-finder', name: 'Tìm kênh ẩn', roleMin: ROLES.FREE },
  { id: 'narrative-studio', name: 'Narrative Studio – kiếm tiền KDP Amazon', roleMin: ROLES.FREE },
  { id: 'script-refiner', name: 'Viết kịch bản nâng cao', roleMin: ROLES.FREE },
  { id: 'image-forge', name: 'Tạo Thumbnail AI', roleMin: ROLES.FREE },
  { id: 'text-to-speech', name: 'Text-to-Speech OpenAI', roleMin: ROLES.FREE },
  { id: 'velocity', name: 'Tạo Video (Velocity Tool)', roleMin: ROLES.FREE },
  { id: 'dubbing', name: 'AI Dubbing Studio', roleMin: ROLES.FREE },
  { id: 'virtual-mc', name: 'Virtual MC', roleMin: ROLES.FREE },
  { id: 'keyword-research', name: 'Nghiên cứu từ khóa', roleMin: ROLES.FREE },
] as const;

export const TTS_OPENAI_CHAR_LIMIT = 500000;

export function canAccessTool(toolId: string, userRole: Role) {
  return true; // UI always accessible
}

export function getRoleLimit(role: Role) {
  return ROLE_LIMITS[role];
}
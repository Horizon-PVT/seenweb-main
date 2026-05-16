export const ROLES = {
  FREE: 'FREE',
  STARTER: 'STARTER',   // Basic Plan
  CREATOR: 'CREATOR',   // Creator Plan  
  FACTORY: 'FACTORY',   // Factory Plan
  AGENCY: 'AGENCY',     // Agency Plan
  ENTERPRISE: 'ENTERPRISE', // Enterprise Plan
  ADMIN: 'ADMIN',
} as const;

export type Role = keyof typeof ROLES;

// DEFINITIVE LIMITS (Per Tool)
export const ROLE_LIMITS: Record<Role, { type: 'LIFETIME' | 'DAILY', count: number }> = {
  FREE: { type: 'LIFETIME', count: 1 },      // 1 use lifetime PER TOOL
  STARTER: { type: 'DAILY', count: 20 },     // 20 uses daily PER TOOL
  CREATOR: { type: 'DAILY', count: 50 },     // 50 uses daily PER TOOL
  FACTORY: { type: 'DAILY', count: 100 },    // 100 uses daily PER TOOL
  AGENCY: { type: 'DAILY', count: 200 },    // 200 uses daily PER TOOL
  ENTERPRISE: { type: 'DAILY', count: 9999 }, // Unlimited
  ADMIN: { type: 'DAILY', count: 9999 },    // Unlimited
};

// AI Coach message limits per day
export const AI_COACH_LIMITS: Record<string, number> = {
  FREE: 5,
  STARTER: 5,
  CREATOR: 20,
  FACTORY: 50,
  AGENCY: 100,
  ENTERPRISE: 500,
  ADMIN: 9999,
};

// Channel limits per plan
export const CHANNEL_LIMITS: Record<string, number> = {
  FREE: 0,
  STARTER: 1,
  CREATOR: 2,
  FACTORY: 5,
  AGENCY: 5,
  ENTERPRISE: 10,
  ADMIN: 999,
};

// Tools allowed for FREE plan
export const FREE_ALLOWED_TOOLS = [
  'micro-niche-miner',   // Đào Ngách CPM
  'scriptwriter',        // Viết Kịch Bản
  'seo-tool',            // SEO YouTube
  'seo'                  // SEO alias
];

// Tools allowed for STARTER plan (includes all FREE tools + more)
export const STARTER_ALLOWED_TOOLS = [
  // All FREE tools
  'micro-niche-miner',
  'scriptwriter',
  'seo-tool',
  'seo',
  // STARTER-specific tools
  'rival-scanner',        // Phân Tích Kênh Đối Thủ
  'image-forge',          // Tạo Ảnh - Thumbnail AI
  'video-pipeline',        // Video Automation Pipeline
  'intelligence-hub',      // Content Intelligence Hub
];

// Tools allowed for CREATOR plan (includes all STARTER tools + more)
export const CREATOR_ALLOWED_TOOLS = [
  // All STARTER tools
  ...STARTER_ALLOWED_TOOLS,
  // CREATOR-specific tools
  'multilingual-studio',   // Multilingual Studio
  'thay-youtube',          // Thầy YouTube
  'creator-dashboard',     // Creator Dashboard
  'dubbing',               // AI Dubbing
];

// Tools allowed for FACTORY plan (includes all CREATOR tools + more)
export const FACTORY_ALLOWED_TOOLS = [
  // All CREATOR tools
  ...CREATOR_ALLOWED_TOOLS,
  // FACTORY-specific tools
  'narrative-studio',      // Narrative Studio (Novel)
  'velocity',              // Video generation
  'text-to-speech',       // TTS
];

// Tools allowed for AGENCY plan (includes all FACTORY tools + more)
export const AGENCY_ALLOWED_TOOLS = [
  // All FACTORY tools
  ...FACTORY_ALLOWED_TOOLS,
  // AGENCY-specific tools
];

// Tools allowed for ENTERPRISE plan (all tools)
export const ENTERPRISE_ALLOWED_TOOLS = [
  // All AGENCY tools
  ...AGENCY_ALLOWED_TOOLS,
  // ENTERPRISE-specific tools
  'api-access',           // API Access
];

export const TOOLS = [
  // FREE tier tools
  { id: 'scriptwriter', name: 'Viết kịch bản YouTube', roleMin: ROLES.FREE },
  { id: 'seo', name: 'SEO YouTube tối ưu', roleMin: ROLES.FREE },
  { id: 'micro-niche-miner', name: 'Tìm Micro Niches', roleMin: ROLES.STARTER },
  { id: 'rival-scanner', name: 'Phân tích đối thủ', roleMin: ROLES.STARTER },
  { id: 'image-forge', name: 'Tạo Thumbnail AI', roleMin: ROLES.FREE },
  { id: 'video-pipeline', name: 'Video Automation Pipeline', roleMin: ROLES.STARTER },
  { id: 'intelligence-hub', name: 'Content Intelligence Hub', roleMin: ROLES.STARTER },
  // CREATOR tier
  { id: 'multilingual-studio', name: 'Multilingual Studio', roleMin: ROLES.CREATOR },
  { id: 'creator-dashboard', name: 'Creator Analytics Dashboard', roleMin: ROLES.CREATOR },
  { id: 'thay-youtube', name: 'Thầy YouTube', roleMin: ROLES.CREATOR },
  // FACTORY tier
  { id: 'narrative-studio', name: 'Narrative Studio (Novel)', roleMin: ROLES.FACTORY },
  { id: 'velocity', name: 'Velocity Video Tool', roleMin: ROLES.FACTORY },
  { id: 'text-to-speech', name: 'Text-to-Speech', roleMin: ROLES.FACTORY },
  // AGENCY/ENTERPRISE tier
  { id: 'api-access', name: 'API Access', roleMin: ROLES.ENTERPRISE },
] as const;

export const TTS_OPENAI_CHAR_LIMIT = 500000;

// MAX_DAILY_USAGE - for activate.ts and admin functions
export const MAX_DAILY_USAGE: Record<string, number> = {
  FREE: 1,
  STARTER: 20,
  CREATOR: 50,
  FACTORY: 100,
  AGENCY: 200,
  ENTERPRISE: 9999,
  ADMIN: 9999,
};

// Alias for payos-webhook.ts compatibility  
export const USAGE_LIMITS = MAX_DAILY_USAGE;

// Valid tool roles - MASTERCLASS is NOT a tool role, it's an Academy flag
export const VALID_TOOL_ROLES = ['FREE', 'STARTER', 'CREATOR', 'FACTORY', 'AGENCY', 'ENTERPRISE', 'ADMIN'] as const;

export function isValidToolRole(role: string): boolean {
  return VALID_TOOL_ROLES.includes(role as any);
}

export function canAccessTool(toolId: string, userRole: Role) {
  return true; // UI always accessible
}

export function getRoleLimit(role: Role) {
  return ROLE_LIMITS[role];
}

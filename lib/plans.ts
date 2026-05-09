
// lib/plans.ts
// Centralized configuration for Plan Limits & Pricing

// ============== PLAN PRICING ==============
export const PLAN_PRICES = {
  STARTER: {
    monthly: 199000,
    sixMonths: 149000,
    yearly: 99000,
    role: 'STARTER',
    tools: ['niche-radar', 'script-studio', 'video-pipeline', 'seo-tool', 'thumbnail-ai'],
    aiCoachLimit: 5,
    channelLimit: 1,
  },
  CREATOR: {
    monthly: 399000,
    sixMonths: 299000,
    yearly: 249000,
    role: 'CREATOR',
    tools: ['niche-radar', 'script-studio', 'video-pipeline', 'seo-tool', 'thumbnail-ai', 'koda-studio', 'intelligence-hub', 'multilingual-studio', 'rival-scanner'],
    aiCoachLimit: 20,
    channelLimit: 2,
    licenseIncludes: ['Koda Studio'],
  },
  FACTORY: {
    monthly: 699000,
    sixMonths: 549000,
    yearly: 399000,
    role: 'FACTORY',
    tools: ['*'], // All tools
    aiCoachLimit: 50,
    channelLimit: 2,
    licenseIncludes: ['Koda Studio', 'Koda Novel', 'Koda Factory'],
  },
  AGENCY: {
    monthly: 1990000,
    sixMonths: 1590000,
    yearly: 1290000,
    role: 'AGENCY',
    tools: ['*'], // All tools
    aiCoachLimit: 100,
    channelLimit: 5,
    userSeats: 5,
    licenseIncludes: ['Koda Studio', 'Koda Novel', 'Koda Factory'],
  },
  ENTERPRISE: {
    monthly: 4990000,
    sixMonths: 3990000,
    yearly: 2990000,
    role: 'ENTERPRISE',
    tools: ['*'], // All tools
    aiCoachLimit: 500,
    channelLimit: 10,
    userSeats: 15,
    features: ['whitelabel', 'api-access', 'custom-workflow', 'dedicated-manager'],
    licenseIncludes: ['Koda Studio', 'Koda Novel', 'Koda Factory'],
  },
};

// ============== LEGACY PRICING (for backward compatibility) ==============
export const PLAN_LIMITS = {
    FREE: 0,
    USER: 0,
    STARTER: 1,
    CREATOR: 2,
    FACTORY: 2,
    AGENCY: 5,
    ENTERPRISE: 10,
    ADMIN: 999
};

export const PRICING_CONFIG = {
    STARTER_BASE: 199000,
    CREATOR_BASE: 399000,
    FACTORY_BASE: 699000,
    AGENCY_BASE: 1990000,
    ENTERPRISE_BASE: 4990000,
    EXTRA_CHANNEL: 169000,  // Price per additional channel
    EXTRA_SEAT: 99000,      // Price per additional team seat
    AI_COACH_50: 29000,
    AI_COACH_100: 49000,
};

// Helper to calculate price
export function calculatePrice(planKey: string, channels: number, billing: 'MONTHLY' | 'SIX_MONTHS' | 'YEARLY'): number {
    const plan = PLAN_PRICES[planKey as keyof typeof PLAN_PRICES];
    if (!plan) return 0;

    let monthlyTotal = plan.monthly;

    // Add extra channels if needed
    const extraChannels = Math.max(0, channels - plan.channelLimit);
    monthlyTotal += extraChannels * PRICING_CONFIG.EXTRA_CHANNEL;

    if (billing === 'SIX_MONTHS') {
        return plan.sixMonths * 6 + extraChannels * PRICING_CONFIG.EXTRA_CHANNEL * 6;
    }

    if (billing === 'YEARLY') {
        return plan.yearly * 12 + extraChannels * PRICING_CONFIG.EXTRA_CHANNEL * 12;
    }

    return monthlyTotal;
}

// Get plan by role
export function getPlanByRole(role: string) {
    const planMap: Record<string, keyof typeof PLAN_PRICES> = {
        'STARTER': 'STARTER',
        'CREATOR': 'CREATOR',
        'FACTORY': 'FACTORY',
        'AGENCY': 'AGENCY',
        'ENTERPRISE': 'ENTERPRISE',
        'BASIC': 'STARTER', // Legacy
        'PRO': 'CREATOR',   // Legacy
    };
    return PLAN_PRICES[planMap[role] || 'STARTER'];
}

export const FEATURE_COMPARISON = [
    { name: 'Phân tích kênh (Channel Audit)', free: 'Giới hạn', starter: 'Không giới hạn', creator: 'Không giới hạn', factory: 'Không giới hạn', agency: 'Không giới hạn', enterprise: 'Không giới hạn' },
    { name: 'AI Coach tư vấn', free: '5 ngày', starter: '5/ngày', creator: '20/ngày', factory: '50/ngày', agency: '100/ngày', enterprise: '500/ngày' },
    { name: 'Bộ công cụ SEO', free: 'Cơ bản', starter: 'Nâng cao', creator: 'Nâng cao', factory: 'Nâng cao', agency: 'Nâng cao', enterprise: 'Nâng cao' },
    { name: 'Kịch bản Viral', free: 'Không', starter: 'Có', creator: 'Có', factory: 'Có', agency: 'Có', enterprise: 'Có' },
    { name: 'Kết nối đa kênh', free: '1 kênh', starter: '1 kênh', creator: '2 kênh', factory: '2 kênh', agency: '5 kênh', enterprise: '10 kênh' },
    { name: 'Koda Desktop Apps', free: 'Không', starter: 'Không', creator: 'Studio', factory: 'Studio + Novel + Factory', agency: 'Tất cả', enterprise: 'Tất cả + White-label' },
    { name: 'Team Seats', free: '-', starter: '-', creator: '-', factory: '-', agency: '5 seats', enterprise: '15 seats' },
];

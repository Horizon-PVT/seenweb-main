
// lib/plans.ts
// Centralized configuration for Plan Limits & Pricing

export const PLAN_LIMITS = {
    FREE: 0,
    USER: 0,
    CREATIVE: 1,   // Basic Plan
    SUPER: 2,      // Professional Plan
    PRO: 2,        // Alias for Pro
    VIP: 2,        // VIP (Limited to 2 for upsell)
    ADMIN: 999
};

export const PRICING_CONFIG = {
    BASIC_BASE: 169000, // 1 channel
    PRO_BASE: 338000,   // 2 channels (169k * 2) - or discount? Let's keep logic simple
    EXTRA_SLOT: 139000  // Price per additional channel (Corrected to 139k per user audio)
};

// Helper to calculate price
export function calculatePrice(channels: number, billing: 'MONTHLY' | 'YEARLY'): number {
    let monthlyTotal = 0;

    if (channels === 1) {
        monthlyTotal = 169000;
    } else if (channels === 2) {
        monthlyTotal = 299000; // Combo discount for 2
    } else {
        // 3+ Channels: Pro Base + (N-2) * Extra (139k)
        monthlyTotal = 299000 + ((channels - 2) * 139000);
    }

    if (billing === 'YEARLY') {
        const annualTotal = monthlyTotal * 12;
        return annualTotal * 0.7; // 30% discount
    }
    return monthlyTotal;
}

export const PRICING = {
    MONTHLY: {
        price: 169000,
        label: '169k / tháng',
        period: '/ tháng'
    },
    YEARLY: {
        price: 116000,
        label: '116k / tháng',
        period: '/ tháng',
        save: 'Tiết kiệm 30%',
        totalYearly: 1390000 // Display purpose
    }
};

export const FEATURE_COMPARISON = [
    { name: 'Phân tích kênh (Channel Audit)', free: 'Giới hạn', basic: 'Không giới hạn' },
    { name: 'AI Coach tư vấn', free: '5 ngày', basic: 'Full quyền lợi' },
    { name: 'Bộ công cụ SEO', free: 'Cơ bản', basic: 'Nâng cao (Pro)' },
    { name: 'Kịch bản Viral', free: 'Không', basic: 'Có' },
    { name: 'Kết nối đa kênh', free: '1 kênh', basic: '2 kênh (Pro)' }
];

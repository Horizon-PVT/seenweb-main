// lib/tab-access.ts
// Tab/Tool access configuration for 2-layer dashboard

export type UserRole = 'FREE' | 'USER' | 'BASIC' | 'PRO' | 'ADMIN';

export type TabId = 'start-youtube' | 'optimize' | 'automation' | 'learning';

// Role hierarchy for comparison
const ROLE_HIERARCHY: Record<UserRole, number> = {
    FREE: 0,
    USER: 0,
    BASIC: 1,
    PRO: 2,
    ADMIN: 99,
};

// Tab metadata
export const TABS = [
    {
        id: 'start-youtube' as TabId,
        label: 'Bắt đầu làm YouTube',
        icon: '🎬',
        minRole: 'FREE' as UserRole,
        description: 'Quy trình 3 bước để làm video',
    },
    {
        id: 'optimize' as TabId,
        label: 'Tăng view & tối ưu',
        icon: '🚀',
        minRole: 'PRO' as UserRole, // PRO+
        description: 'Công cụ nâng cao để tối ưu kênh',
    },
    {
        id: 'automation' as TabId,
        label: 'Làm nhanh & tự động',
        icon: '🤖',
        minRole: 'BASIC' as UserRole, // BASIC+ (for Dubbing)
        description: 'Tự động hóa với AI',
    },
    {
        id: 'learning' as TabId,
        label: 'Học & hướng dẫn',
        icon: '🎓',
        minRole: 'FREE' as UserRole,
        description: 'Roadmap & thư viện kiến thức',
    },
];

// Tab 3 tool access per role
export const TAB3_TOOLS = {
    'text-to-speech': { minRole: 'PRO' as UserRole, label: 'Text-to-Speech' },
    'ai-dubbing-studio': { minRole: 'BASIC' as UserRole, label: 'AI Dubbing Studio' },
    'velocity': { minRole: 'PRO' as UserRole, label: 'Tạo Video AI' },
};

// Tab 2 tools (all PRO+)
export const TAB2_TOOLS = [
    { id: 'rival-scanner', label: 'Phân tích kênh đối thủ', icon: '🔍' },
    { id: 'hidden-channel-finder', label: 'Tìm kênh ẩn tiềm năng', icon: '🔎' },
    { id: 'script-refiner', label: 'Chỉnh sửa & nâng cấp kịch bản', icon: '✍️' },
    { id: 'image-forge', label: 'Tạo Thumbnail AI', icon: '🖼️' },
];

// Helper functions
export function hasMinRole(userRole: string, minRole: UserRole): boolean {
    // Normalize legacy role names
    let normalizedRole = userRole;
    if (normalizedRole === 'USER') normalizedRole = 'FREE';
    if (normalizedRole === 'CREATIVE') normalizedRole = 'BASIC';
    if (normalizedRole === 'SUPER') normalizedRole = 'PRO';
    if (normalizedRole === 'VIP') normalizedRole = 'PRO';

    return (ROLE_HIERARCHY[normalizedRole as UserRole] ?? 0) >= ROLE_HIERARCHY[minRole];
}

export function canAccessTab(userRole: string, tabId: TabId): boolean {
    const tab = TABS.find(t => t.id === tabId);
    if (!tab) return false;
    return hasMinRole(userRole, tab.minRole);
}

export function canAccessTab3Tool(userRole: string, toolId: string): boolean {
    const tool = TAB3_TOOLS[toolId as keyof typeof TAB3_TOOLS];
    if (!tool) return false;
    return hasMinRole(userRole, tool.minRole);
}

export function getTabLockMessage(tabId: TabId, userRole: string): string | null {
    const tab = TABS.find(t => t.id === tabId);
    if (!tab) return null;

    if (hasMinRole(userRole, tab.minRole)) return null;

    // Return upsell message based on tab
    switch (tabId) {
        case 'optimize':
            return 'Nâng cấp lên PRO để mở khóa các công cụ tối ưu nâng cao.';
        case 'automation':
            return 'Nâng cấp lên BASIC để sử dụng AI Dubbing.';
        default:
            return 'Nâng cấp để mở khóa tính năng này.';
    }
}

// Niche-engine access by role
export function getNicheEngineLimit(userRole: string): number {
    const role = hasMinRole(userRole, 'ADMIN') ? 'ADMIN' :
        hasMinRole(userRole, 'PRO') ? 'PRO' :
            hasMinRole(userRole, 'BASIC') ? 'BASIC' : 'FREE';
    switch (role) {
        case 'FREE': return 5;
        case 'BASIC': return 10;
        case 'PRO': return 999;
        case 'ADMIN': return 999;
        default: return 5;
    }
}

// Thay-youtube day access by role
export function getThayYoutubeAccess(userRole: string): { minDay: number; maxDay: number } {
    const role = hasMinRole(userRole, 'ADMIN') ? 'ADMIN' :
        hasMinRole(userRole, 'PRO') ? 'PRO' :
            hasMinRole(userRole, 'BASIC') ? 'BASIC' : 'FREE';
    switch (role) {
        case 'FREE': return { minDay: 0, maxDay: 5 };
        case 'BASIC': return { minDay: 0, maxDay: 20 };
        case 'PRO': return { minDay: 0, maxDay: 30 };
        case 'ADMIN': return { minDay: 0, maxDay: 30 };
        default: return { minDay: 0, maxDay: 5 };
    }
}

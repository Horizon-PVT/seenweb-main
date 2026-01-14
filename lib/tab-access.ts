// lib/tab-access.ts
// Tab/Tool access configuration for 2-layer dashboard

export type UserRole = 'FREE' | 'USER' | 'CREATIVE' | 'SUPER' | 'VIP' | 'ADMIN';

export type TabId = 'start-youtube' | 'optimize' | 'automation' | 'learning';

// Role hierarchy for comparison
const ROLE_HIERARCHY: Record<UserRole, number> = {
    FREE: 0,
    USER: 0,
    CREATIVE: 1, // STARTER
    SUPER: 2,    // PRO
    VIP: 3,
    ADMIN: 4,
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
        minRole: 'SUPER' as UserRole, // PRO+
        description: 'Công cụ nâng cao để tối ưu kênh',
    },
    {
        id: 'automation' as TabId,
        label: 'Làm nhanh & tự động',
        icon: '🤖',
        minRole: 'CREATIVE' as UserRole, // STARTER+ (for Dubbing)
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
    'text-to-speech': { minRole: 'SUPER' as UserRole, label: 'Text-to-Speech' },
    'ai-dubbing-studio': { minRole: 'CREATIVE' as UserRole, label: 'AI Dubbing Studio' },
    'velocity': { minRole: 'VIP' as UserRole, label: 'Tạo Video AI' },
    'virtual-mc': { minRole: 'VIP' as UserRole, label: 'MC Ảo' },
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
    const normalizedRole = (userRole === 'USER' ? 'FREE' : userRole) as UserRole;
    return ROLE_HIERARCHY[normalizedRole] >= ROLE_HIERARCHY[minRole];
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
            return 'Nâng cấp lên STARTER để sử dụng AI Dubbing.';
        default:
            return 'Nâng cấp để mở khóa tính năng này.';
    }
}

// Niche-engine access by role
export function getNicheEngineLimit(userRole: string): number {
    const role = (userRole === 'USER' ? 'FREE' : userRole) as UserRole;
    switch (role) {
        case 'FREE': return 5;
        case 'CREATIVE': return 10; // STARTER
        case 'SUPER': return 999; // PRO - full
        case 'VIP': return 999;
        case 'ADMIN': return 999;
        default: return 5;
    }
}

// Thay-youtube day access by role
export function getThayYoutubeAccess(userRole: string): { minDay: number; maxDay: number } {
    const role = (userRole === 'USER' ? 'FREE' : userRole) as UserRole;
    switch (role) {
        case 'FREE': return { minDay: 0, maxDay: 5 };
        case 'CREATIVE': return { minDay: 0, maxDay: 20 }; // STARTER
        case 'SUPER': return { minDay: 0, maxDay: 20 }; // PRO
        case 'VIP': return { minDay: 0, maxDay: 30 };
        case 'ADMIN': return { minDay: 0, maxDay: 30 };
        default: return { minDay: 0, maxDay: 5 };
    }
}

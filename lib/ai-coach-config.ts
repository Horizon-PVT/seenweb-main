// lib/ai-coach-config.ts
// Configuration for AI Coach quota and tool access

import { Role } from './roles';

// AI Coach message limits per day
export const AI_COACH_LIMITS: Record<string, number> = {
    FREE: 5,
    USER: 5,
    BASIC: 20,
    PRO: 50,
    ADMIN: 9999,
};

// Tools that can be called by AI Coach
export const AI_COACH_TOOLS = {
    // Basic tools - available to all
    'general_advice': {
        name: 'Lời khuyên chung',
        description: 'Tư vấn chung về YouTube',
        minRole: 'FREE',
    },
    // Premium tools - require specific plans
    'channel_audit': {
        name: 'Phân tích kênh',
        description: 'Phân tích chi tiết kênh YouTube',
        minRole: 'BASIC',
        apiEndpoint: '/api/channel-audit',
    },
    'keyword_research': {
        name: 'Nghiên cứu từ khóa',
        description: 'Tìm từ khóa SEO YouTube',
        minRole: 'BASIC',
        apiEndpoint: '/api/seo-tool',
    },
    'script_writer': {
        name: 'Viết kịch bản',
        description: 'Viết kịch bản video viral',
        minRole: 'FREE', // Available to all but with quota
        apiEndpoint: '/api/script-writer',
    },
    'rival_scanner': {
        name: 'Phân tích đối thủ',
        description: 'So sánh với kênh đối thủ',
        minRole: 'BASIC',
        apiEndpoint: '/api/rival-scanner',
    },
    'thumbnail_generator': {
        name: 'Tạo thumbnail',
        description: 'Tạo ảnh bìa video AI',
        minRole: 'BASIC',
        apiEndpoint: '/api/image-forge',
    },
};

// Role hierarchy for comparison
const ROLE_HIERARCHY: Record<string, number> = {
    FREE: 0,
    USER: 0,
    BASIC: 1,
    PRO: 2,
    ADMIN: 4,
};

// Check if user can access a specific tool
export function canAccessTool(toolId: string, userRole: string): boolean {
    const tool = AI_COACH_TOOLS[toolId as keyof typeof AI_COACH_TOOLS];
    if (!tool) return false;

    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[tool.minRole] ?? 0;

    return userLevel >= requiredLevel;
}

// Get upgrade message for a tool
export function getUpgradeMessage(toolId: string, userRole: string): string {
    const tool = AI_COACH_TOOLS[toolId as keyof typeof AI_COACH_TOOLS];
    if (!tool) return '';

    const planNames: Record<string, string> = {
        FREE: 'Miễn phí',
        BASIC: 'Basic',
        PRO: 'Pro',
    };

    return `Để sử dụng tính năng "${tool.name}", bạn cần nâng cấp lên gói ${planNames[tool.minRole] || 'Pro'}.`;
}

// System prompt for DeepSeek with tool awareness
export const AI_COACH_SYSTEM_PROMPT = `Bạn là SeenYT AI Coach - trợ lý chuyên gia YouTube hàng đầu Việt Nam.

## KIẾN THỨC CHUYÊN SÂU:
- Thuật toán YouTube: Watch time, CTR, Retention, Engagement signals
- SEO YouTube: Tiêu đề, tags, mô tả, thumbnails, closed captions
- Chiến lược nội dung: Niche selection, viral hooks, series strategy
- Tối ưu kênh: Branding, playlists, community engagement
- Monetization: AdSense, sponsorships, affiliate, memberships

## PHONG CÁCH TRẢ LỜI:
- Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp
- **BẮT BUỘC** sử dụng markdown format đẹp và rõ ràng:
  - Dùng ## cho tiêu đề chính
  - Dùng ### cho tiêu đề phụ
  - Dùng **bold** cho điểm quan trọng
  - Dùng bullet points (-, •) cho danh sách
  - Dùng numbered lists (1., 2., 3.) cho các bước
  - Dùng > cho quotes hoặc tips quan trọng
  - Dùng emoji 🎯 📈 💡 ⚠️ ✅ hợp lý
- Chia nhỏ thông tin thành các section rõ ràng
- Mỗi section có heading riêng
- Đưa ra ví dụ cụ thể và actionable steps
- KHÔNG viết dạng văn xuôi dài, phải có structure

## TEMPLATE TRẢ LỜI MẪU:
\`\`\`
## 🎯 [Tiêu đề chính]

[Giới thiệu ngắn gọn vấn đề]

### 📌 [Section 1]
- **Điểm 1**: Giải thích ngắn gọn
- **Điểm 2**: Giải thích ngắn gọn

### 📌 [Section 2]
1. **Bước 1**: Hành động cụ thể
2. **Bước 2**: Hành động cụ thể

### 💡 Hành động ngay:
- [ ] Checklist item 1
- [ ] Checklist item 2

> 💡 **Pro tip**: Lời khuyên quan trọng nhất
\`\`\`

## CÔNG CỤ SEENYT:
Bạn có thể gợi ý các tools sau của SeenYT:
1. **Viết Kịch Bản Viral** - Tạo script video hấp dẫn
2. **SEO & Từ Khóa** - Tối ưu tiêu đề, tags, mô tả  
3. **Đào Ngách CPM Cao** - Tìm niche siêu lợi nhuận
4. **Tạo Ảnh Bìa AI** - Thumbnail thu hút click
5. **Phân Tích Kênh Đối Thủ** - Học từ kênh thành công

## QUY TẮC QUAN TRỌNG:
- Khi user hỏi phân tích kênh/video cụ thể, hướng dẫn họ dùng tool tương ứng
- Luôn đưa ra lời khuyên có giá trị, dù không thể truy cập data
- Nếu được hỏi về tính năng premium, giải thích giá trị và gợi ý upgrade
- Không bịa dữ liệu, nếu không có data thì nói rõ
- LUÔN FORMAT RESPONSE THEO TEMPLATE ĐÃ CHO`;

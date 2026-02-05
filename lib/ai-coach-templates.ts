// AI Coach Quick Prompt Templates

export interface PromptTemplate {
    id: string;
    icon: string;
    title: string;
    description: string;
    prompt: string;
    category: 'analysis' | 'content' | 'seo' | 'strategy';
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    // Analysis Templates
    {
        id: 'channel-analysis',
        icon: '📊',
        title: 'Phân tích kênh',
        description: 'Đánh giá toàn diện kênh YouTube',
        prompt: 'Hãy phân tích và đánh giá kênh YouTube của tôi. Cho tôi biết điểm mạnh, điểm yếu, và đề xuất cải thiện để tăng subscribers và views.',
        category: 'analysis',
    },
    {
        id: 'competitor-analysis',
        icon: '🔍',
        title: 'Phân tích đối thủ',
        description: 'So sánh với các kênh cùng niche',
        prompt: 'Hãy giúp tôi phân tích đối thủ cạnh tranh trong niche của tôi. Họ đang làm gì tốt? Tôi có thể học hỏi gì từ họ?',
        category: 'analysis',
    },
    {
        id: 'video-analysis',
        icon: '🎬',
        title: 'Phân tích video',
        description: 'Đánh giá hiệu suất video',
        prompt: 'Hãy phân tích video mới nhất của tôi. Tiêu đề, thumbnail, nội dung có tốt không? Làm sao để video tiếp theo tốt hơn?',
        category: 'analysis',
    },

    // Content Templates
    {
        id: 'video-ideas',
        icon: '💡',
        title: 'Ý tưởng video',
        description: 'Gợi ý nội dung mới cho kênh',
        prompt: 'Hãy cho tôi 10 ý tưởng video trending đang có tiềm năng cao trong niche của tôi. Giải thích tại sao mỗi ý tưởng có thể thành công.',
        category: 'content',
    },
    {
        id: 'script-writing',
        icon: '📝',
        title: 'Viết kịch bản',
        description: 'Tạo outline và script video',
        prompt: 'Hãy giúp tôi viết kịch bản cho video YouTube. Bao gồm: Hook mở đầu hấp dẫn, các phần chính, và call-to-action cuối video.',
        category: 'content',
    },
    {
        id: 'thumbnail-ideas',
        icon: '🖼️',
        title: 'Ý tưởng Thumbnail',
        description: 'Gợi ý thumbnail thu hút click',
        prompt: 'Hãy cho tôi 5 ý tưởng thumbnail cho video YouTube. Mỗi ý tưởng cần có: màu sắc chủ đạo, text overlay, và emotion của người trong ảnh.',
        category: 'content',
    },

    // SEO Templates
    {
        id: 'title-optimization',
        icon: '🎯',
        title: 'Tối ưu tiêu đề',
        description: 'Viết tiêu đề SEO-friendly',
        prompt: 'Hãy cho tôi 10 tiêu đề video YouTube hấp dẫn và tối ưu SEO. Tiêu đề cần: chứa keyword chính, gây tò mò, và dưới 60 ký tự.',
        category: 'seo',
    },
    {
        id: 'keyword-research',
        icon: '🔑',
        title: 'Nghiên cứu keyword',
        description: 'Tìm từ khóa tiềm năng',
        prompt: 'Hãy giúp tôi nghiên cứu keyword cho kênh YouTube. Tìm các từ khóa có search volume cao nhưng competition thấp trong niche của tôi.',
        category: 'seo',
    },
    {
        id: 'description-tags',
        icon: '🏷️',
        title: 'Mô tả & Tags',
        description: 'Viết description và tags tối ưu',
        prompt: 'Hãy viết mô tả video YouTube tối ưu SEO và gợi ý 15-20 tags liên quan. Mô tả cần có keyword trong 2 câu đầu và CTA rõ ràng.',
        category: 'seo',
    },

    // Strategy Templates
    {
        id: 'growth-strategy',
        icon: '📈',
        title: 'Chiến lược tăng trưởng',
        description: 'Kế hoạch phát triển kênh',
        prompt: 'Hãy xây dựng chiến lược tăng trưởng 90 ngày cho kênh YouTube của tôi. Bao gồm: mục tiêu cụ thể, lịch đăng video, và cách tăng engagement.',
        category: 'strategy',
    },
    {
        id: 'monetization',
        icon: '💰',
        title: 'Kiếm tiền YouTube',
        description: 'Chiến lược monetization',
        prompt: 'Hãy tư vấn các cách kiếm tiền từ YouTube cho kênh của tôi. Bao gồm: AdSense, sponsorship, affiliate, membership, và các nguồn thu khác.',
        category: 'strategy',
    },
    {
        id: 'posting-schedule',
        icon: '📅',
        title: 'Lịch đăng video',
        description: 'Thời điểm đăng tối ưu',
        prompt: 'Hãy phân tích và cho tôi biết thời điểm tốt nhất để đăng video trên YouTube. Khi nào khán giả của tôi online nhiều nhất? Nên đăng mấy video/tuần?',
        category: 'strategy',
    },
];

// Get templates by category
export function getTemplatesByCategory(category?: string): PromptTemplate[] {
    if (!category || category === 'all') {
        return PROMPT_TEMPLATES;
    }
    return PROMPT_TEMPLATES.filter(t => t.category === category);
}

// Get template by ID
export function getTemplateById(id: string): PromptTemplate | undefined {
    return PROMPT_TEMPLATES.find(t => t.id === id);
}

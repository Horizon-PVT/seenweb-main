
import {
    Compass,
    Radar,
    Video,
    PenTool,
    BookOpen,
    Ghost,
    Zap, // Idea
    Eye, // Spy
    Film, // Auto Short
    Mic, // Voice
    TrendingUp, // Trend
    Image as ImageIcon, // Thumbnail
    ShoppingBag,
    Link as LinkIcon,
    GraduationCap, // Thay Youtube
    Library, // Niche Engine
    Mic2, // Dubbing
    User // Virtual MC
} from 'lucide-react';

export interface ToolConfig {
    id: string;
    label: string;
    description: string;
    icon: any;
    status: 'active' | 'beta' | 'maintenance' | 'construction' | 'new';
    componentName?: string; // For dynamic imports
    minRole: 'FREE' | 'USER' | 'CREATIVE' | 'SUPER' | 'VIP' | 'ADMIN';
}

export const TOOLS: ToolConfig[] = [
    // 1. thay-youtube
    {
        id: 'thay-youtube',
        label: 'thay-youtube',
        description: 'Học làm YouTube bài bản',
        icon: GraduationCap,
        status: 'active',
        componentName: 'ThayYoutubeTool',
        minRole: 'FREE'
    },
    // 2. Thư viện ngách thắng 100%
    {
        id: 'niche-engine',
        label: 'Thư viện ngách thắng 100%',
        description: 'Kho tàng ý tưởng đã được kiểm chứng',
        icon: Library,
        status: 'active',
        componentName: 'NicheEngineTool',
        minRole: 'CREATIVE' // Basic
    },
    // 3. Tạo Ảnh - Thiết Kế Thumbnail AI
    {
        id: 'image-forge',
        label: 'Tạo Ảnh - Thiết Kế Thumbnail AI',
        description: 'Tạo thumbnail thu hút CTR cao',
        icon: ImageIcon,
        status: 'active',
        componentName: 'ImageForgeTool',
        minRole: 'SUPER' // Professional
    },
    // 4. AI Voice Studio (TTS + Clone)
    {
        id: 'text-to-speech',
        label: 'AI Voice Studio (TTS + Clone)',
        description: 'Chuyển văn bản thành giọng nói AI',
        icon: Mic,
        status: 'active',
        componentName: 'VoiceStudioTool',
        minRole: 'SUPER' // Professional
    },
    // 5. Tối Ưu SEO & Từ Khóa
    {
        id: 'seo-tool',
        label: 'Tối Ưu SEO & Từ Khóa',
        description: 'Tăng hạng video trên tìm kiếm',
        icon: Zap,
        status: 'active',
        componentName: 'SeoTool',
        minRole: 'SUPER' // Professional
    },
    // 6. Đào Ngách CPM Cao
    {
        id: 'micro-niche-miner',
        label: 'Đào Ngách CPM Cao',
        description: 'Tìm ngách kiếm tiền hiệu quả',
        icon: Compass,
        status: 'active',
        componentName: 'MicroNicheMinerTool',
        minRole: 'SUPER' // Professional
    },
    // 7. Tạo Video Bằng AI
    {
        id: 'veocity',
        label: 'Tạo Video Bằng AI',
        description: 'Sản xuất video tự động hóa',
        icon: Video,
        status: 'active',
        componentName: 'VeocityTool',
        minRole: 'SUPER' // Professional
    },
    // 8. Viết Kịch Bản Viral
    {
        id: 'scriptwriter',
        label: 'Viết Kịch Bản Viral',
        description: 'AI viết kịch bản triệu view',
        icon: PenTool,
        status: 'active',
        componentName: 'ScriptwriterTool',
        minRole: 'CREATIVE' // Basic
    },
    // 9. Kể Chuyện Lịch Sử / Story
    {
        id: 'narrative-studio',
        label: 'Kể Chuyện Lịch Sử / Story',
        description: 'Sáng tạo câu chuyện lôi cuốn',
        icon: BookOpen,
        status: 'active',
        componentName: 'StoryStudioTool',
        minRole: 'SUPER' // Professional
    },
    // 10. Chỉnh Sửa & Nâng Cấp Kịch Bản
    {
        id: 'script-refiner',
        label: 'Chỉnh Sửa & Nâng Cấp Kịch Bản',
        description: 'Tinh chỉnh nội dung chuyên sâu',
        icon: PenTool,
        status: 'active',
        componentName: 'ScriptRefinerTool',
        minRole: 'CREATIVE' // Basic
    },
    // 11. Phân Tích Kênh Đối Thủ
    {
        id: 'rival-scanner',
        label: 'Phân Tích Kênh Đối Thủ',
        description: 'Soi chiến lược của đối thủ',
        icon: Radar,
        status: 'active',
        componentName: 'RivalScannerTool',
        minRole: 'SUPER' // Professional
    },
    // 12. Tìm Ngách Xanh
    {
        id: 'hidden-channel-finder',
        label: 'Tìm Ngách Xanh',
        description: 'Khám phá cơ hội chưa ai biết',
        icon: Ghost,
        status: 'active',
        componentName: 'HiddenChannelFinderTool',
        minRole: 'SUPER' // Professional
    },

    // --- DEVELOPMENT TOOLS ---

    // 13. AI Voice Dubbing
    {
        id: 'ai-dubbing',
        label: 'AI Voice Dubbing',
        description: 'Lồng tiếng video tự động',
        icon: Mic2,
        status: 'construction',
        componentName: 'DubbingTool',
        minRole: 'VIP' // Development typically reserved or high tier
    },
    // 14. Virtual MC Creator
    {
        id: 'virtual-mc',
        label: 'Virtual MC Creator',
        description: 'Tạo nhân vật MC ảo',
        icon: User,
        status: 'construction',
        componentName: 'VirtualMCTool',
        minRole: 'VIP'
    }
];

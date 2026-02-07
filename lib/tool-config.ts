
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
    User, // Virtual MC
    Target, // Keyword Research
    Search, // ADDED
    FileText // ADDED
} from 'lucide-react';

export interface ToolConfig {
    id: string;
    label: string;
    description: string;
    icon: any;
    status: 'active' | 'beta' | 'maintenance' | 'construction' | 'new';
    componentName?: string; // For dynamic imports
    minRole: 'FREE' | 'USER' | 'BASIC' | 'PRO' | 'ADMIN';
    color?: string; // ADDED
    group?: 'startup' | 'breakthrough' | 'research' | 'learning' | 'dev'; // ADDED
}

export const TOOLS: ToolConfig[] = [
    // --- GROUP: HỌC TẬP ---
    // 1. thay-youtube
    {
        id: 'thay-youtube',
        label: 'Thầy YouTube - Giáo Án 30 ngày',
        description: 'Học làm YouTube bài bản',
        icon: GraduationCap,
        status: 'active',
        componentName: 'ThayYoutubeTool',
        minRole: 'FREE',
        color: 'text-red-500',
        group: 'learning'
    },
    // 2. Thư viện ngách thắng 100%
    {
        id: 'niche-engine',
        label: 'Thư viện ngách thắng 100%',
        description: 'Kho tàng ý tưởng đã được kiểm chứng',
        icon: Library,
        status: 'active',
        componentName: 'NicheEngineTool',
        minRole: 'FREE', // Freemium Teaser
        color: 'text-yellow-500',
        group: 'learning'
    },

    // --- GROUP: KHỞI ĐỘNG ---
    // 6. Đào Ngách CPM Cao (Moved)
    {
        id: 'micro-niche-miner',
        label: 'Đào Ngách CPM Cao',
        description: 'Tìm ngách có CPM cao',
        icon: Target,
        status: 'active',
        componentName: 'MicroNicheMinerTool',
        minRole: 'FREE', // Professional
        color: 'text-amber-500',
        group: 'startup'
    },
    // 8. Viết Kịch Bản Viral (Moved)
    {
        id: 'scriptwriter',
        label: 'Viết Kịch Bản Viral',
        description: 'Viết kịch bản AI',
        icon: FileText,
        status: 'active',
        componentName: 'ScriptwriterTool',
        minRole: 'FREE', // Basic
        color: 'text-purple-400',
        group: 'startup'
    },
    // 5. Tối Ưu SEO & Từ Khóa (Moved)
    {
        id: 'seo-tool',
        label: 'Tối Ưu SEO & Từ Khóa',
        description: 'Phân tích từ khóa sâu',
        icon: Search,
        status: 'active',
        componentName: 'SeoTool',
        minRole: 'FREE', // Professional
        color: 'text-green-500',
        group: 'startup'
    },

    // --- GROUP: VƯỢT RÀO ---
    // 3. Tạo Ảnh - Thiết Kế Thumbnail AI (Moved)
    {
        id: 'image-forge',
        label: 'Tạo Ảnh - Thiết Kế Thumbnail',
        description: 'Tạo thumbnail thu hút CTR cao',
        icon: ImageIcon,
        status: 'active',
        componentName: 'ImageForgeTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-pink-500',
        group: 'breakthrough'
    },
    // 4. AI Voice Studio (Moved)
    {
        id: 'text-to-speech',
        label: 'Chuyển Văn Bản -> Giọng Nói',
        description: 'Chuyển văn bản thành giọng nói AI',
        icon: Mic,
        status: 'active',
        componentName: 'VoiceStudioTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-blue-400',
        group: 'breakthrough'
    },
    // 9. Kể Chuyện Lịch Sử / Story (Moved)
    {
        id: 'narrative-studio',
        label: 'Kể Chuyện Lịch Sử / Story',
        description: 'Sáng tạo câu chuyện lôi cuốn',
        icon: BookOpen,
        status: 'active',
        componentName: 'StoryStudioTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-indigo-400',
        group: 'breakthrough'
    },
    // 7. Tạo Video Bằng AI (Moved)
    {
        id: 'veocity',
        label: 'Tạo Video Bằng AI',
        description: 'Sản xuất video tự động hóa',
        icon: Video,
        status: 'active',
        componentName: 'VeocityTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-orange-500',
        group: 'breakthrough'
    },

    // --- GROUP: NGHIÊN CỨU ---
    // 13. Nghiên Cứu Từ Khóa (Moved)
    {
        id: 'keyword-research',
        label: 'Nghiên Cứu Từ Khóa (Keyword.io)',
        description: 'Tìm ý tưởng video & phân tích cạnh tranh',
        icon: Target,
        status: 'active',
        componentName: 'KeywordResearchTool',
        minRole: 'FREE', // Freemium gate inside
        color: 'text-cyan-400',
        group: 'research'
    },
    // 10. Chỉnh Sửa & Nâng Cấp Kịch Bản (Moved)
    {
        id: 'script-refiner',
        label: 'Chỉnh Sửa & Nâng Cấp Kịch bản',
        description: 'Tinh chỉnh nội dung chuyên sâu',
        icon: PenTool,
        status: 'active',
        componentName: 'ScriptRefinerTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-teal-400',
        group: 'research'
    },
    // 11. Phân Tích Kênh Đối Thủ (Moved)
    {
        id: 'rival-scanner',
        label: 'Phân Tích Kênh Đối Thủ',
        description: 'Soi chiến lược của đối thủ',
        icon: Radar,
        status: 'active',
        componentName: 'RivalScannerTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-red-400',
        group: 'research'
    },
    // 12. Tìm Ngách Xanh (Moved)
    {
        id: 'hidden-channel-finder',
        label: 'Tìm Ngách Xanh',
        description: 'Khám phá cơ hội chưa ai biết',
        icon: Ghost,
        status: 'active',
        componentName: 'HiddenChannelFinderTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-emerald-400',
        group: 'research'
    },

    // --- GROUP: ĐANG PHÁT TRIỂN ---
    // 14. AI Voice Dubbing (Moved)
    {
        id: 'ai-dubbing',
        label: 'AI Voice Dubbing',
        description: 'Lồng tiếng video tự động',
        icon: Mic2,
        status: 'construction',
        componentName: 'DubbingTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-gray-500',
        group: 'dev'
    },
    // 15. Virtual MC Creator (Moved)
    {
        id: 'virtual-mc',
        label: 'Tạo MC Ảo (Idol AI)',
        description: 'Tạo nhân vật MC ảo',
        icon: User,
        status: 'construction',
        componentName: 'VirtualMCTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-gray-500',
        group: 'dev'
    }
];

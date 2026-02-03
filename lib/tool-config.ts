
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
    minRole: 'FREE' | 'USER' | 'CREATIVE' | 'SUPER' | 'VIP' | 'ADMIN';
    color?: string; // ADDED
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
        minRole: 'FREE',
        color: 'text-red-500' // ADDED
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
        color: 'text-yellow-500' // ADDED
    },
    // 3. Tạo Ảnh - Thiết Kế Thumbnail AI
    {
        id: 'image-forge',
        label: 'Tạo Ảnh - Thiết Kế Thumbnail AI',
        description: 'Tạo thumbnail thu hút CTR cao',
        icon: ImageIcon,
        status: 'active',
        componentName: 'ImageForgeTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-pink-500' // ADDED
    },
    // 4. AI Voice Studio (TTS + Clone)
    {
        id: 'text-to-speech',
        label: 'AI Voice Studio (TTS + Clone)',
        description: 'Chuyển văn bản thành giọng nói AI',
        icon: Mic,
        status: 'active',
        componentName: 'VoiceStudioTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-blue-400' // ADDED
    },
    // 5. Tối Ưu SEO & Từ Khóa (KEEP SUPER)
    {
        id: 'seo-tool', // Changed ID
        label: 'Tối Ưu SEO & Từ Khóa', // Reverted Label
        description: 'Phân tích từ khóa sâu',
        icon: Search,
        status: 'active',
        componentName: 'SeoTool',
        minRole: 'FREE', // FREEMIUM UNLOCKED // Professional
        color: 'text-green-500' // ADDED
    },
    // 6. Đào Ngách CPM Cao (KEEP SUPER)
    {
        id: 'micro-niche-miner',
        label: 'Đào Ngách CPM Cao', // Changed Label
        description: 'Tìm ngách có CPM cao',
        icon: Target, // Changed Icon
        status: 'active',
        componentName: 'MicroNicheMinerTool',
        minRole: 'FREE', // FREEMIUM UNLOCKED // Professional
        color: 'text-amber-500' // ADDED
    },
    // 7. Tạo Video Bằng AI
    {
        id: 'veocity',
        label: 'Tạo Video Bằng AI',
        description: 'Sản xuất video tự động hóa',
        icon: Video,
        status: 'active',
        componentName: 'VeocityTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-orange-500' // ADDED
    },
    // 8. Viết Kịch Bản Viral (KEEP CREATIVE for now)
    {
        id: 'scriptwriter', // Changed ID
        label: 'Viết Kịch Bản Viral', // Reverted Label
        description: 'Viết kịch bản AI',
        icon: FileText,
        status: 'active',
        componentName: 'ScriptwriterTool',
        minRole: 'FREE', // FREEMIUM UNLOCKED // Basic
        color: 'text-purple-400' // ADDED
    },
    // 9. Kể Chuyện Lịch Sử / Story
    {
        id: 'narrative-studio',
        label: 'Kể Chuyện Lịch Sử / Story',
        description: 'Sáng tạo câu chuyện lôi cuốn',
        icon: BookOpen,
        status: 'active',
        componentName: 'StoryStudioTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-indigo-400' // ADDED
    },
    // 10. Chỉnh Sửa & Nâng Cấp Kịch Bản
    {
        id: 'script-refiner',
        label: 'Chỉnh Sửa & Nâng Cấp Kịch Bản',
        description: 'Tinh chỉnh nội dung chuyên sâu',
        icon: PenTool,
        status: 'active',
        componentName: 'ScriptRefinerTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-teal-400' // ADDED
    },
    // 11. Phân Tích Kênh Đối Thủ
    {
        id: 'rival-scanner',
        label: 'Phân Tích Kênh Đối Thủ',
        description: 'Soi chiến lược của đối thủ',
        icon: Radar,
        status: 'active',
        componentName: 'RivalScannerTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-red-400' // ADDED
    },
    // 12. Tìm Ngách Xanh
    {
        id: 'hidden-channel-finder',
        label: 'Tìm Ngách Xanh',
        description: 'Khám phá cơ hội chưa ai biết',
        icon: Ghost,
        status: 'active',
        componentName: 'HiddenChannelFinderTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-emerald-400' // ADDED
    },
    // 13. Nghiên Cứu Từ Khóa
    {
        id: 'keyword-research',
        label: 'Nghiên Cứu Từ Khóa',
        description: 'Tìm ý tưởng video & phân tích cạnh tranh',
        icon: Target, // Using Zap or Target, imported below
        status: 'active',
        componentName: 'KeywordResearchTool',
        minRole: 'FREE', // Freemium gate inside
        color: 'text-cyan-400' // ADDED
    },

    // --- DEVELOPMENT TOOLS ---

    // 14. AI Voice Dubbing
    {
        id: 'ai-dubbing',
        label: 'AI Voice Dubbing',
        description: 'Lồng tiếng video tự động',
        icon: Mic2,
        status: 'construction',
        componentName: 'DubbingTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-gray-500' // ADDED
    },
    // 15. Virtual MC Creator
    {
        id: 'virtual-mc',
        label: 'Virtual MC Creator',
        description: 'Tạo nhân vật MC ảo',
        icon: User, // Using User icon
        status: 'construction',
        componentName: 'VirtualMCTool',
        minRole: 'FREE', // Freemium Gate
        color: 'text-gray-500' // ADDED
    }
];

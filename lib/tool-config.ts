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
    group?: 'research' | 'create' | 'niche' | 'dev'; // Updated Groups
}

export const TOOLS: ToolConfig[] = [
    // --- GROUP 1: CHIẾN LƯỢC & NGHIÊN CỨU ---
    {
        id: 'thay-youtube',
        label: 'Thầy YouTube - Giáo Án 30 ngày',
        description: 'Học làm YouTube bài bản',
        icon: GraduationCap,
        status: 'active',
        componentName: 'ThayYoutubeTool',
        minRole: 'FREE',
        color: 'text-red-500',
        group: 'research'
    },
    {
        id: 'micro-niche-miner',
        label: 'Đào Ngách CPM Cao',
        description: 'Tìm ngách có CPM cao',
        icon: Target,
        status: 'active',
        componentName: 'MicroNicheMinerTool',
        minRole: 'FREE',
        color: 'text-amber-500',
        group: 'research'
    },
    {
        id: 'hidden-channel-finder',
        label: 'Tìm Ngách Xanh',
        description: 'Khám phá cơ hội chưa ai biết',
        icon: Ghost,
        status: 'active',
        componentName: 'HiddenChannelFinderTool',
        minRole: 'FREE',
        color: 'text-emerald-400',
        group: 'research'
    },
    {
        id: 'rival-scanner',
        label: 'Phân Tích Kênh Đối Thủ',
        description: 'Soi chiến lược của đối thủ',
        icon: Radar,
        status: 'active',
        componentName: 'RivalScannerTool',
        minRole: 'FREE',
        color: 'text-red-400',
        group: 'research'
    },
    {
        id: 'keyword-research',
        label: 'Nghiên Cứu Từ Khóa',
        description: 'Tìm ý tưởng video & phân tích cạnh tranh',
        icon: Target,
        status: 'active',
        componentName: 'KeywordResearchTool',
        minRole: 'FREE',
        color: 'text-cyan-400',
        group: 'research'
    },
    {
        id: 'seo-tool',
        label: 'Tối Ưu SEO & Từ Khóa',
        description: 'Phân tích từ khóa sâu',
        icon: Search,
        status: 'active',
        componentName: 'SeoTool',
        minRole: 'FREE',
        color: 'text-green-500',
        group: 'research'
    },

    // --- GROUP 2: SẢN XUẤT NỘI DUNG AI ---
    {
        id: 'scriptwriter',
        label: 'Viết Kịch Bản Viral',
        description: 'Viết kịch bản AI',
        icon: FileText,
        status: 'active',
        componentName: 'ScriptwriterTool',
        minRole: 'FREE',
        color: 'text-purple-400',
        group: 'create'
    },
    {
        id: 'image-forge',
        label: 'Tạo Ảnh - Thiết Kế Thumbnail',
        description: 'Tạo thumbnail thu hút CTR cao',
        icon: ImageIcon,
        status: 'active',
        componentName: 'ImageForgeTool',
        minRole: 'FREE',
        color: 'text-pink-500',
        group: 'create'
    },
    {
        id: 'text-to-speech',
        label: 'Chuyển Văn Bản -> Giọng Nói',
        description: 'Chuyển văn bản thành giọng nói AI',
        icon: Mic,
        status: 'active',
        componentName: 'VoiceStudioTool',
        minRole: 'FREE',
        color: 'text-blue-400',
        group: 'create'
    },
    {
        id: 'narrative-studio',
        label: 'Làm sách KDP Amazon',
        description: 'Sáng tạo nội dung Amazon KDP',
        icon: BookOpen,
        status: 'active',
        componentName: 'StoryStudioTool',
        minRole: 'FREE',
        color: 'text-indigo-400',
        group: 'create'
    },
    {
        id: 'veocity',
        label: 'Tạo Video Bằng AI',
        description: 'Sản xuất video tự động hóa',
        icon: Video,
        status: 'active',
        componentName: 'VeocityTool',
        minRole: 'FREE',
        color: 'text-orange-500',
        group: 'create'
    },
    {
        id: 'script-refiner',
        label: 'Chỉnh Sửa & Nâng Cấp Kịch bản',
        description: 'Tinh chỉnh nội dung chuyên sâu',
        icon: PenTool,
        status: 'active',
        componentName: 'ScriptRefinerTool',
        minRole: 'FREE',
        color: 'text-teal-400',
        group: 'create'
    },

    // --- GROUP 3: NGÁCH ---
    {
        id: 'niche-engine',
        label: 'Thư viện ngách thắng 100%',
        description: 'Kho tàng ý tưởng đã được kiểm chứng',
        icon: Library,
        status: 'active',
        componentName: 'NicheEngineTool',
        minRole: 'FREE',
        color: 'text-yellow-500',
        group: 'niche'
    },

    // --- GROUP 4: ĐANG PHÁT TRIỂN ---
    {
        id: 'ai-dubbing',
        label: 'AI Voice Dubbing',
        description: 'Lồng tiếng video tự động',
        icon: Mic2,
        status: 'construction',
        componentName: 'DubbingTool',
        minRole: 'FREE',
        color: 'text-gray-500',
        group: 'dev'
    },
    {
        id: 'virtual-mc',
        label: 'Tạo MC Ảo (Idol AI)',
        description: 'Tạo nhân vật MC ảo',
        icon: User,
        status: 'construction',
        componentName: 'VirtualMCTool',
        minRole: 'FREE',
        color: 'text-gray-500',
        group: 'dev'
    }
];

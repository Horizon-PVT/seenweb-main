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
    {
        id: 'koda-niche-radar',
        label: 'Koda Niche Radar',
        description: 'Dò ngách & Phân tích đối thủ chuyên sâu',
        icon: Radar,
        status: 'active',
        minRole: 'FREE',
        color: 'text-amber-500',
        group: 'research'
    },
    {
        id: 'koda-script-studio',
        label: 'Koda Script Studio',
        description: 'Viết kịch bản & Chuẩn SEO mồi',
        icon: PenTool,
        status: 'active',
        minRole: 'FREE',
        color: 'text-purple-400',
        group: 'create'
    }
];

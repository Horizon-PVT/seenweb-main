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
    FileText, // ADDED
    Sparkles, // Video Pipeline
    Brain, // Intelligence Hub
    Languages, // Multilingual Studio
    BarChart3 // Creator Dashboard
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
    },
    // WF4: Video Automation Pipeline
    {
        id: 'video-pipeline',
        label: 'Video Automation Pipeline',
        description: 'AI generates complete video production: Script, Visual Prompts, Voiceover, Thumbnail & SEO',
        icon: Sparkles,
        status: 'new',
        minRole: 'BASIC',
        color: 'text-indigo-400',
        group: 'create'
    },
    // WF5: Content Intelligence Hub
    {
        id: 'intelligence-hub',
        label: 'Content Intelligence Hub',
        description: 'Micro Niche + Rival Scanner + Hidden Channels + SEO Analysis in one unified engine',
        icon: Brain,
        status: 'new',
        minRole: 'BASIC',
        color: 'text-cyan-400',
        group: 'research'
    },
    // WF6: Multilingual Studio
    {
        id: 'multilingual-studio',
        label: 'Multilingual Studio',
        description: 'Translate scripts, localize titles & descriptions for English, Spanish, French & more markets',
        icon: Languages,
        status: 'new',
        minRole: 'PRO',
        color: 'text-emerald-400',
        group: 'create'
    },
    // WF7: Creator Dashboard
    {
        id: 'creator-dashboard',
        label: 'Creator Analytics Dashboard',
        description: 'AI-powered channel analytics: health score, video performance, SWOT analysis & recommendations',
        icon: BarChart3,
        status: 'new',
        minRole: 'PRO',
        color: 'text-rose-400',
        group: 'research'
    }
];

// pages/tools/desktop-apps.tsx
// Desktop Apps - Koda Studio, Novel, Factory - Download & Activation Guide

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
    Monitor,
    Play,
    FileText,
    Users,
    Download,
    Key,
    Copy,
    Check,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Clock,
    Cpu,
    Sparkles,
    Layers,
    Zap,
    Shield,
    Star,
    ArrowRight,
    Settings,
    PlayCircle,
    BookOpen,
    Video
} from 'lucide-react';

const DESKTOP_DOWNLOAD_URL = 'https://drive.google.com/file/d/19ApQJY52zieN1sSGXHbIdwC6fsL5GVaC/view';

const APPS = [
    {
        id: 'studio',
        name: 'Koda Studio',
        icon: Play,
        color: 'cyan',
        colorBg: 'bg-cyan-500/20',
        colorText: 'text-cyan-400',
        colorBorder: 'border-cyan-500/30',
        tagline: 'Video AI Generator',
        description: 'Tạo video chuyên nghiệp với AI Veo3. Render video 4K, hỗ trợ voiceover, subtitle tự động.',
        features: [
            { icon: Video, text: 'Tạo video Veo3 chất lượng cao' },
            { icon: Sparkles, text: 'Hỗ trợ nhiều tỷ lệ khung hình' },
            { icon: Layers, text: 'Thêm intro/outro tự động' },
            { icon: Clock, text: 'Render nhanh hơn web 5-10x' },
            { icon: Shield, text: 'Không watermark khi render' },
        ],
        requirements: [
            'Windows 10/11',
            'Kết nối internet (để dùng Veo3 API)',
            'Tài khoản Google đăng nhập',
        ],
        useCases: ['Review videos', 'Short films', 'Marketing content', 'Social media clips'],
    },
    {
        id: 'novel',
        name: 'Koda Novel',
        icon: FileText,
        color: 'purple',
        colorBg: 'bg-purple-500/20',
        colorText: 'text-purple-400',
        colorBorder: 'border-purple-500/30',
        tagline: 'Novel to Video',
        description: 'Chuyển đổi truyện, tiểu thuyết thành video với AI. Tự động tạo scene, nhân vật, background.',
        features: [
            { icon: BookOpen, text: 'Chuyển text thành video tự động' },
            { icon: Users, text: 'Tạo nhân vật AI đồng nhất' },
            { icon: Layers, text: 'Background & scene tự động' },
            { icon: Cpu, text: 'Multi-scene generation' },
            { icon: Zap, text: '1 chapter = 5-10 phút video' },
        ],
        requirements: [
            'Windows 10/11',
            'Kết nối internet (để dùng Veo3 API)',
            'Tài khoản Google đăng nhập',
        ],
        useCases: ['Webnovel adaptations', 'Fan fiction videos', 'Story visualization', 'Content series'],
    },
    {
        id: 'factory',
        name: 'Koda Factory',
        icon: Users,
        color: 'amber',
        colorBg: 'bg-amber-500/20',
        colorText: 'text-amber-400',
        colorBorder: 'border-amber-500/30',
        tagline: 'Multi-Workers Studio',
        description: 'Quản lý nhiều worker cùng lúc. Tăng tốc production, handle mass content creation.',
        features: [
            { icon: Users, text: 'Quản lý nhiều worker AI' },
            { icon: Layers, text: 'Batch processing không giới hạn' },
            { icon: Cpu, text: 'Tự động distribute tasks' },
            { icon: Shield, text: 'Queue management thông minh' },
            { icon: Star, text: 'Template & preset system' },
        ],
        requirements: [
            'Windows 10/11',
            'Kết nối internet (để dùng Veo3 API)',
            'Tài khoản Google đăng nhập',
        ],
        useCases: ['Agency production', 'Multi-channel management', 'Mass content', 'Team collaboration'],
    },
];

export default function DesktopAppsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [licenseKey, setLicenseKey] = useState<string | null>(null);
    const [kodaTier, setKodaTier] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeApp, setActiveApp] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            setIsReady(true);
        }
    }, [status, router]);

    useEffect(() => {
        if (isReady && session) {
            fetchLicenseKey();
        }
    }, [isReady, session]);

    const fetchLicenseKey = async () => {
        try {
            const res = await fetch('/api/user/license');
            const data = await res.json();
            if (data.licenseKey) {
                setLicenseKey(data.licenseKey);
                setKodaTier(data.tier);
            }
        } catch (err) {
            console.error('Failed to fetch license:', err);
        }
    };

    const handleCopyLicense = () => {
        if (licenseKey) {
            navigator.clipboard.writeText(licenseKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (status === 'loading' || !isReady) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    const currentApp = APPS[activeApp];
    const IconComponent = currentApp.icon;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head>
                <title>Desktop Apps - Koda Studio | SeenWeb</title>
            </Head>

            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
                        <ChevronLeft size={20} />
                        Quay về Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-gray-700">
                            <Monitor size={28} className="text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Desktop Apps</h1>
                            <p className="text-gray-400">Công cụ AI Desktop - Tải về và kích hoạt</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Hero - License Key & Download */}
                    <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-900/30 via-gray-900 to-cyan-900/30 rounded-2xl p-6 border border-gray-800">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* License Key */}
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Key size={20} className="text-purple-400" />
                                    License Key của bạn
                                </h2>
                                {licenseKey ? (
                                    <div className="space-y-3">
                                        <div className="bg-black/50 rounded-xl p-4 border border-gray-700">
                                            <p className="text-xs text-gray-500 mb-2">Koda {kodaTier?.charAt(0).toUpperCase() + kodaTier?.slice(1)} License</p>
                                            <p className="font-mono text-green-400 text-lg break-all select-all">
                                                {licenseKey}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleCopyLicense}
                                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                            {copied ? 'Đã copy!' : 'Copy License Key'}
                                        </button>
                                        <p className="text-xs text-gray-500 text-center">
                                            Lưu lại license key để kích hoạt trên máy tính
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-black/30 rounded-xl p-6 border border-gray-700 text-center">
                                        <p className="text-gray-400">
                                            Nâng cấp gói CREATOR, FACTORY, AGENCY hoặc ENTERPRISE để nhận License Key
                                        </p>
                                        <Link
                                            href="/pricing"
                                            className="inline-block mt-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Xem các gói Premium
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Download */}
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Download size={20} className="text-cyan-400" />
                                    Tải Desktop App
                                </h2>
                                <div className="bg-black/50 rounded-xl p-6 border border-gray-700">
                                    <p className="text-gray-400 mb-4">
                                        Một file cài đặt duy nhất - Tự động kích hoạt tính năng theo License Key của bạn.
                                    </p>
                                    <a
                                        href={DESKTOP_DOWNLOAD_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg shadow-cyan-500/25"
                                    >
                                        <Download size={22} />
                                        Tải Koda Desktop Suite
                                        <ExternalLink size={18} />
                                    </a>
                                    <p className="text-xs text-gray-500 text-center mt-3">
                                        Google Drive • ~500MB • Windows 64-bit
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* App Selector Tabs */}
                    <motion.div variants={itemVariants}>
                        <div className="flex gap-2 bg-gray-900/50 p-2 rounded-xl border border-gray-800">
                            {APPS.map((app, idx) => {
                                const AppIcon = app.icon;
                                return (
                                    <button
                                        key={app.id}
                                        onClick={() => setActiveApp(idx)}
                                        className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold ${
                                            activeApp === idx
                                                ? `${app.colorBg} ${app.colorText} border ${app.colorBorder}`
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <AppIcon size={18} />
                                        <span className="hidden sm:inline">{app.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Selected App Detail */}
                    <motion.div
                        key={currentApp.id}
                        variants={itemVariants}
                        className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden"
                    >
                        <div className={`p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-${currentApp.color}/5`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-16 h-16 ${currentApp.colorBg} rounded-2xl flex items-center justify-center border ${currentApp.colorBorder}`}>
                                    <IconComponent size={32} className={currentApp.colorText} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{currentApp.name}</h2>
                                    <p className={`${currentApp.colorText} font-medium`}>{currentApp.tagline}</p>
                                    <p className="text-gray-400 mt-2">{currentApp.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid md:grid-cols-3 gap-8">
                            {/* Features */}
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Sparkles size={18} className="text-yellow-400" />
                                    Tính năng nổi bật
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {currentApp.features.map((feature, idx) => {
                                        const FeatureIcon = feature.icon;
                                        return (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-black/30 rounded-xl">
                                                <div className={`w-8 h-8 ${currentApp.colorBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                    <FeatureIcon size={16} className={currentApp.colorText} />
                                                </div>
                                                <span className="text-sm text-gray-300">{feature.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <h3 className="font-bold text-lg flex items-center gap-2 mt-6">
                                    <Star size={18} className="text-yellow-400" />
                                    Phù hợp với
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {currentApp.useCases.map((useCase, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-gray-300 border border-gray-700">
                                            {useCase}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Settings size={18} className="text-gray-400" />
                                    Yêu cầu hệ thống
                                </h3>
                                <div className="bg-black/30 rounded-xl p-4 space-y-2">
                                    {currentApp.requirements.map((req, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm">
                                            <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-300">{req}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Installation Guide */}
                    <motion.div variants={itemVariants} className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <BookOpen size={20} className="text-yellow-400" />
                            Hướng dẫn cài đặt & kích hoạt
                        </h2>
                        <div className="grid md:grid-cols-4 gap-4">
                            {[
                                { step: 1, title: 'Tải về', desc: 'Click nút tải phía trên', icon: Download },
                                { step: 2, title: 'Cài đặt', desc: 'Chạy file .exe đã tải', icon: Settings },
                                { step: 3, title: 'Kích hoạt', desc: 'Nhập License Key của bạn', icon: Key },
                                { step: 4, title: 'Sử dụng', desc: 'Bắt đầu tạo nội dung!', icon: PlayCircle },
                            ].map((item) => {
                                const StepIcon = item.icon;
                                return (
                                    <div key={item.step} className="bg-black/30 rounded-xl p-4 text-center relative">
                                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <StepIcon size={20} className="text-yellow-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1">Bước {item.step}</p>
                                        <p className="font-bold text-white">{item.title}</p>
                                        <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                                        {item.step < 4 && (
                                            <ArrowRight size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hidden md:block" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                            <p className="text-amber-200 text-sm">
                                <strong>Lưu ý:</strong> License Key được cấp tự động khi bạn nâng cấp gói CREATOR, FACTORY, AGENCY hoặc ENTERPRISE. 
                                Nếu chưa có License Key, vui lòng kiểm tra email hoặc liên hệ hỗ trợ.
                            </p>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4">
                        <Link
                            href="/dashboard"
                            className="bg-gray-900/50 hover:bg-gray-800/50 rounded-xl p-4 border border-gray-800 flex items-center gap-3 transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-400" />
                            <span>Quay về Dashboard</span>
                        </Link>
                        <a
                            href={DESKTOP_DOWNLOAD_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-cyan-900/30 hover:bg-cyan-800/30 rounded-xl p-4 border border-cyan-800/50 flex items-center justify-center gap-2 transition-colors font-semibold"
                        >
                            <Download size={18} className="text-cyan-400" />
                            <span>Tải lại Desktop App</span>
                        </a>
                        <Link
                            href="/pricing"
                            className="bg-purple-900/30 hover:bg-purple-800/30 rounded-xl p-4 border border-purple-800/50 flex items-center justify-center gap-2 transition-colors font-semibold"
                        >
                            <Star size={18} className="text-purple-400" />
                            <span>Nâng cấp gói</span>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

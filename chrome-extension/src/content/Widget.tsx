import { useEffect, useState, useCallback } from 'react';
import SEOScoreCard from './components/SEOScoreCard';
import AIActionsPanel from './components/AIActionsPanel';
import KeywordPopover from './components/KeywordPopover';
import RevenueEstimator from './components/RevenueEstimator';
import TitleTester from './components/TitleTester';
import ChannelSpyPanel from './components/ChannelSpyPanel';
import TrendPanel from './components/TrendPanel';
import UpgradeModal from './components/UpgradeModal';
import LockedOverlay from './components/LockedOverlay';
import UsageBanner from './components/UsageBanner';

const API_BASE = 'https://seenyt.net';

interface VideoData {
    videoId: string;
    title: string;
    tags: string[];
    views: number;
    likes: string;
    comments: string;
    description: string;
    thumbnailUrl: string;
    engagementRate: string;
    publishDate: string;
    vph: string;
}

interface UserData {
    email: string;
    name: string | null;
    image: string | null;
    role: string;
    dailyUsage: number;
    maxDailyUsage: number;
    isPro: boolean;
}

type TabType = 'stats' | 'seo' | 'ai' | 'spy' | 'trends' | 'tools' | 'more';

// Tính năng bị khóa cho FREE
const LOCKED_TABS: TabType[] = ['ai', 'spy'];


const Widget = () => {
    const [data, setData] = useState<VideoData | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('stats');
    const [darkMode, setDarkMode] = useState(false);
    const [lang, setLang] = useState<'VI' | 'EN'>('VI');

    const T = {
        VI: {
            loading: 'Đang phân tích video...',
            login: 'Đăng nhập',
            upgrade: 'Nâng cấp',
            unlock: 'Mở khóa',
            free: 'Miễn phí',
            pro: 'Pro',
            remaining: 'Còn lượt',
            outOfLimit: 'Hết lượt hôm nay!',
            unlimited: 'Không giới hạn',
            tabs: {
                stats: 'THỐNG KÊ',
                seo: 'SEO',
                ai: 'AI',
                spy: 'GÓC NHÌN',
                trends: 'XU HƯỚNG',
                abtest: 'A/B TEST',
                tools: 'CÔNG CỤ'
            },
            upsell: {
                main: 'Nâng cấp chỉ 149K',
                sub: 'Mở khóa tất cả tính năng'
            },
            placeholder: 'Nhập email tài khoản SeenYT của bạn:'
        },
        EN: {
            loading: 'Analysing Video...',
            login: 'Login',
            upgrade: 'Upgrade',
            unlock: 'Unlock',
            free: 'Free',
            pro: 'Pro',
            remaining: 'Remaining',
            outOfLimit: 'Daily limit reached!',
            unlimited: 'Unlimited',
            tabs: {
                stats: 'STATS',
                seo: 'SEO',
                ai: 'AI',
                spy: 'SPY',
                trends: 'TRENDS',
                abtest: 'A/B TEST',
                tools: 'TOOLS'
            },
            upsell: {
                main: 'Upgrade for $9',
                sub: 'Unlock all features'
            },
            placeholder: 'Enter your SeenYT account email:'
        }
    };

    // Auth state
    const [user, setUser] = useState<UserData | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeFeature, setUpgradeFeature] = useState('default');

    // Usage tracking
    const [remainingUsage, setRemainingUsage] = useState<Record<string, number>>({
        'seo-score': 3,
        'ab-tester': 2,
        'trends': 3,
    });

    // Keyword Popover State
    const [keywordPopover, setKeywordPopover] = useState<{
        isOpen: boolean;
        keyword: string;
        position: { x: number; y: number };
    }>({ isOpen: false, keyword: '', position: { x: 0, y: 0 } });

    // Get saved email from Chrome storage or prompt
    const getSavedEmail = useCallback(async (): Promise<string | null> => {
        try {
            // 1. Try localStorage first (fast, reliable on current page domain)
            const local = localStorage.getItem('seenyt_email');
            if (local) return local;

            // 2. Try Chrome Storage (cross-context)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                return new Promise((resolve) => {
                    chrome.storage.local.get(['seenyt_email'], (result: Record<string, any>) => {
                        resolve(result.seenyt_email || null);
                    });
                });
            }
            return null;
        } catch {
            return null;
        }
    }, []);

    // Save email to Chrome storage AND localStorage
    const saveEmail = useCallback(async (email: string) => {
        try {
            // Save to both for redundancy
            localStorage.setItem('seenyt_email', email);

            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ seenyt_email: email });
            }
        } catch {
            // Ignore errors
        }
    }, []);

    // Check auth status
    const checkAuth = useCallback(async (emailOverride?: string, isPolling = false) => {
        // Stop if extension context is invalid (zombie script)
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && !chrome.runtime?.id) {
                return; // Context invalidated
            }
        } catch { return; }

        if (!isPolling) setAuthLoading(true);
        try {
            const email = emailOverride || await getSavedEmail();
            if (!email) {
                setUser(null);
                if (!isPolling) setAuthLoading(false);
                return;
            }

            // Save email for next time
            if (emailOverride) {
                saveEmail(emailOverride);
            }

            // Use Background Script to fetch (Bypass CSP/CORS)
            let data;
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                const response = await new Promise<any>((resolve, reject) => {
                    chrome.runtime.sendMessage({
                        type: 'SEENYT_BG_FETCH',
                        url: `${API_BASE}/api/extension/auth-check?email=${encodeURIComponent(email)}&_t=${Date.now()}`
                    }, (res: any) => {
                        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                        else resolve(res);
                    });
                });

                if (!response.ok) throw new Error(response.error || 'Auth check failed');
                data = JSON.parse(response.text);
            } else {
                // Fallback for non-extension env (localhost dev)
                const res = await fetch(`${API_BASE}/api/extension/auth-check?email=${encodeURIComponent(email)}`);
                data = await res.json();
            }

            if (data.authenticated && data.user) {
                // Admin override: Treat ADMIN as PRO even if backend says false (due to expiry logic)
                const isUserPro = data.user.isPro || data.user.role === 'ADMIN';
                const userWithOverride = { ...data.user, isPro: isUserPro };

                setUser(userWithOverride);
                // Update remaining usage based on role
                if (isUserPro) {
                    setRemainingUsage({ 'seo-score': 999, 'ab-tester': 999, 'trends': 999 });
                } else {
                    setRemainingUsage({
                        'seo-score': Math.max(0, 3 - data.user.dailyUsage),
                        'ab-tester': Math.max(0, 2 - data.user.dailyUsage),
                        'trends': Math.max(0, 3 - data.user.dailyUsage),
                    });
                }
            } else {
                setUser(null);
                if (!isPolling && emailOverride) {
                    alert('Đăng nhập thất bại hoặc tài khoản không tồn tại. Vui lòng thử lại.');
                }
            }
        } catch (e: any) {
            // Handle context invalidation (User reloaded extension but not page)
            if (e?.message?.includes('Extension context invalidated')) {
                console.warn('[SeenYT] Extension context invalidated. Please refresh the page.');
                setUser(null);
                return;
            }
            if (!isPolling) console.error('Auth check error:', e);
            setUser(null);
        } finally {
            if (!isPolling) setAuthLoading(false);
        }
    }, [getSavedEmail, saveEmail]);

    // Detect YouTube dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            const html = document.documentElement;
            const isDark = html.getAttribute('dark') !== null ||
                document.body.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(isDark);
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Check auth on mount and poll periodically
    useEffect(() => {
        checkAuth();

        // Poll every 5 seconds to detect login changes
        // Poll every 5 seconds to detect login changes (Silent Mode)
        const interval = setInterval(() => {
            checkAuth(undefined, true);
        }, 5000);

        return () => clearInterval(interval);
    }, [checkAuth]);

    const parseMetric = (str: string | undefined): number => {
        if (!str) return 0;
        const n = parseFloat(str.replace(/,/g, ''));
        if (str.toUpperCase().includes('M')) return n * 1000000;
        if (str.toUpperCase().includes('K')) return n * 1000;
        if (str.toUpperCase().includes('B')) return n * 1000000000;
        return isNaN(n) ? 0 : n;
    };

    const scrapeVideoData = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('v');
        if (!videoId) return;

        const titleElement = document.querySelector('ytd-watch-metadata h1.ytd-watch-metadata yt-formatted-string')
            || document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string')
            || document.querySelector('#title h1 yt-formatted-string')
            || document.querySelector('ytd-watch-metadata #title h1');
        const title = titleElement?.textContent?.trim() || document.title.replace(' - YouTube', '');

        let views = 0;
        const viewCountMeta = document.querySelector('meta[itemprop="interactionCount"]');
        if (viewCountMeta) {
            views = parseInt(viewCountMeta.getAttribute('content') || '0');
        } else {
            const viewTextElem = document.querySelector('#info-container #info yt-formatted-string.ytd-video-view-count-renderer')
                || document.querySelector('ytd-video-view-count-renderer span.view-count');
            if (viewTextElem) {
                const viewText = viewTextElem.textContent?.replace(/[^0-9]/g, '') || '0';
                views = parseInt(viewText);
            }
        }

        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        const tags = keywordsMeta
            ? keywordsMeta.getAttribute('content')?.split(',').map(t => t.trim()).filter(Boolean) || []
            : [];

        let likes = '0';
        const likeSelectors = [
            'ytd-menu-renderer like-button-view-model button[aria-label*="like"] .yt-spec-button-shape-next__button-text-content',
            'like-button-view-model .yt-spec-button-shape-next__button-text-content',
            '#segmented-like-button button[aria-label] .yt-spec-button-shape-next__button-text-content',
        ];
        for (const selector of likeSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent?.trim()) {
                likes = el.textContent.trim();
                break;
            }
        }

        let comments = '0';
        const commentSelectors = ['ytd-comments-header-renderer #count yt-formatted-string span:first-child'];
        for (const selector of commentSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent?.trim()) {
                const text = el.textContent.trim();
                const match = text.match(/[\d,\.]+/);
                if (match) {
                    comments = match[0];
                    break;
                }
            }
        }

        const descElem = document.querySelector('#description-inline-expander yt-attributed-string')
            || document.querySelector('#description-inline-expander .yt-core-attributed-string');
        const description = descElem?.textContent?.trim() || '';

        let publishDate = '';
        let vph = '0';
        const datePublishedMeta = document.querySelector('meta[itemprop="datePublished"]');
        if (datePublishedMeta) {
            publishDate = datePublishedMeta.getAttribute('content') || '';
            if (publishDate && views > 0) {
                const pubTime = new Date(publishDate).getTime();
                const now = Date.now();
                const hoursSincePublish = Math.max(1, (now - pubTime) / (1000 * 60 * 60));
                const vphNum = views / hoursSincePublish;
                if (vphNum >= 1000000) vph = (vphNum / 1000000).toFixed(1) + 'M';
                else if (vphNum >= 1000) vph = (vphNum / 1000).toFixed(1) + 'K';
                else vph = vphNum.toFixed(0);
            }
        }

        const likeCount = parseMetric(likes);
        const commentCount = parseMetric(comments);
        const engagement = views > 0 ? ((likeCount + commentCount) / views * 100).toFixed(2) : '0.00';

        setData({
            videoId,
            title,
            tags,
            views,
            likes,
            comments,
            description,
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            engagementRate: engagement,
            publishDate,
            vph
        });
    };

    useEffect(() => {
        scrapeVideoData();
        const interval = setInterval(scrapeVideoData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCopyTags = async () => {
        if (data?.tags.length) {
            await navigator.clipboard.writeText(data.tags.join(', '));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadThumb = () => {
        if (data?.thumbnailUrl) {
            window.open(data.thumbnailUrl, '_blank');
        }
    };

    const formatViews = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleTagClick = (tag: string, event: React.MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setKeywordPopover({
            isOpen: true,
            keyword: tag,
            position: { x: rect.left, y: rect.bottom + 5 }
        });
    };

    const handleLogin = async () => {
        // Direct email input (works across tabs)
        const email = window.prompt(T[lang].placeholder);
        if (email && email.includes('@')) {
            checkAuth(email);
        } else if (email) {
            alert('Email không hợp lệ. Vui lòng thử lại.');
        }
    };

    const handleUpgrade = (feature?: string) => {
        setUpgradeFeature(feature || 'default');
        setShowUpgradeModal(true);
    };

    const handleTabClick = (tab: TabType) => {
        // Check if tab is locked for FREE users
        if (!user?.isPro && LOCKED_TABS.includes(tab)) {
            handleUpgrade(tab);
            return;
        }
        setActiveTab(tab);
    };

    // Determine if feature is accessible
    const canAccessTab = (tab: TabType) => {
        if (user?.isPro) return true;
        return !LOCKED_TABS.includes(tab);
    };

    // Theme classes
    const theme = {
        bg: darkMode ? 'bg-slate-900' : 'bg-white',
        text: darkMode ? 'text-white' : 'text-gray-900',
        border: darkMode ? 'border-slate-700' : 'border-red-600',
        cardBg: darkMode ? 'bg-slate-800' : 'bg-white',
        cardBorder: darkMode ? 'border-slate-700' : 'border-slate-100',
        headerBg: darkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-red-50 via-white to-white',
        tabBg: darkMode ? 'bg-slate-700' : 'bg-slate-50',
    };

    if (!data) return (
        <div className={`w-full ${theme.bg} border-2 ${theme.border} rounded-xl p-4 mb-4 flex items-center justify-center gap-3 shadow-lg`}>
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-red-600 text-sm font-bold tracking-wide">SEENYT.net - {T[lang].loading}</span>
        </div>
    );

    const tabs: { key: TabType; label: string; icon: string; gradient: string; locked?: boolean }[] = [
        { key: 'stats', label: T[lang].tabs.stats, icon: '📊', gradient: 'from-orange-500 to-red-500' },
        { key: 'seo', label: T[lang].tabs.seo, icon: '🎯', gradient: 'from-emerald-500 to-teal-500' },
        { key: 'ai', label: T[lang].tabs.ai, icon: '✨', gradient: 'from-purple-500 to-pink-500', locked: !user?.isPro },
        { key: 'spy', label: T[lang].tabs.spy, icon: '🕵️', gradient: 'from-indigo-500 to-purple-500', locked: !user?.isPro },
        { key: 'trends', label: T[lang].tabs.trends, icon: '📈', gradient: 'from-orange-500 to-amber-500' },
        { key: 'tools', label: T[lang].tabs.abtest, icon: '🔀', gradient: 'from-red-500 to-orange-500' },
        { key: 'more', label: T[lang].tabs.tools, icon: '🔧', gradient: 'from-blue-500 to-cyan-500' },
    ];

    return (
        <div className={`${theme.bg} ${theme.text} font-sans border-2 ${theme.border} rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(220,38,38,0.2)] mb-4 relative z-[2000] group hover:shadow-[0_6px_30px_rgba(220,38,38,0.3)] transition-shadow duration-300`}>

            {/* Header */}
            <div className={`${theme.headerBg} px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-red-100'} flex justify-between items-center relative z-10`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg transform -skew-x-3">
                        <span className="text-white font-black text-lg italic">S</span>
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'} tracking-tight leading-none`}>SEENYT<span className="text-red-600">.net</span></span>
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">YT SEO & AI GROWTH 🔥</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Upsell button - always visible for FREE users */}
                    {!user?.isPro && !authLoading && (
                        <button
                            onClick={() => handleUpgrade()}
                            className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[8px] font-bold rounded-lg hover:shadow-md transition-all flex items-center gap-1"
                        >
                            <span>🚀</span>
                            <span>PRO</span>
                        </button>
                    )}

                    {/* User badge / Login button */}
                    {authLoading ? (
                        <div className="w-16 h-6 bg-slate-200 rounded animate-pulse"></div>
                    ) : user ? (
                        <button
                            onClick={() => user.isPro ? null : handleUpgrade()}
                            className={`px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 ${user.isPro
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                                : `${darkMode ? 'bg-slate-700' : 'bg-slate-100'} ${darkMode ? 'text-slate-300' : 'text-slate-600'}`
                                }`}
                        >
                            {user.isPro ? '✨' : '🔒'} {user.role}
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[9px] font-bold rounded-lg hover:shadow-md transition-all"
                        >
                            {T[lang].login}
                        </button>
                    )}

                    {/* Language toggle */}
                    <button
                        onClick={() => setLang(lang === 'VI' ? 'EN' : 'VI')}
                        className={`p-1.5 rounded-lg text-[9px] font-bold ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} hover:scale-105 transition-transform`}
                        title="Switch Language"
                    >
                        {lang}
                    </button>

                    {/* Dark mode toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-600'} hover:scale-105 transition-transform`}
                        title="Toggle Dark Mode"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className={`px-2 py-2 ${theme.tabBg} border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'} flex gap-1 overflow-x-auto`}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabClick(tab.key)}
                        className={`px-2 py-1.5 rounded-lg text-[8px] font-bold transition-all relative overflow-hidden flex items-center gap-1 flex-shrink-0 ${activeTab === tab.key
                            ? 'text-white shadow-md'
                            : `${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`
                            }`}
                    >
                        {activeTab === tab.key && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient}`} />
                        )}
                        <span className="relative z-10">{tab.icon}</span>
                        <span className="relative z-10">{tab.label}</span>
                        {tab.locked && (
                            <span className="relative z-10 text-[7px] ml-0.5">🔒</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className={`p-4 min-h-[200px] relative z-10 ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-b from-white to-slate-50/50'}`}>

                {/* TAB: STATS */}
                {activeTab === 'stats' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="grid grid-cols-4 gap-2">
                            <div className={`${theme.cardBg} p-2.5 rounded-xl border ${theme.cardBorder} shadow-sm`}>
                                <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold uppercase tracking-wider mb-1`}>Views</p>
                                <p className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatViews(data.views)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2.5 rounded-xl shadow-sm">
                                <p className="text-[10px] text-red-100 font-bold uppercase tracking-wider mb-1">VPH 🔥</p>
                                <p className="text-xl font-black text-white">{data.vph}</p>
                            </div>
                            <div className={`${theme.cardBg} p-2.5 rounded-xl border ${theme.cardBorder} shadow-sm`}>
                                <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold uppercase tracking-wider mb-1`}>Engage</p>
                                <p className={`text-xl font-black ${parseFloat(data.engagementRate) > 5 ? 'text-emerald-500' : darkMode ? 'text-white' : 'text-slate-900'}`}>{data.engagementRate}%</p>
                            </div>
                            <div className={`${theme.cardBg} p-2.5 rounded-xl border ${theme.cardBorder} shadow-sm`}>
                                <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold uppercase tracking-wider mb-1`}>Likes</p>
                                <p className="text-xl font-black text-orange-500">{data.likes}</p>
                            </div>
                        </div>
                        <RevenueEstimator views={data.views} title={data.title} />
                        <div className={`${theme.cardBg} p-4 rounded-xl border ${theme.cardBorder} shadow-sm`}>
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                <span className="text-base">🏷️</span>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'} uppercase`}>Tags ({data.tags.length})</span>
                                <span className={`text-[9px] ${darkMode ? 'text-slate-500' : 'text-slate-400'} ml-auto`}>Click để phân tích</span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {data.tags.slice(0, 10).map((tag, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => handleTagClick(tag, e)}
                                        className={`text-sm ${darkMode ? 'bg-slate-700 text-orange-400 border-slate-600' : 'bg-orange-100 text-slate-900 border-orange-300'} px-3 py-1.5 rounded-lg border transition-colors font-semibold shadow-sm hover:scale-105`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: SEO */}
                {activeTab === 'seo' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                        {canAccessTab('seo') ? (
                            <div className="p-4">
                                <UsageBanner
                                    remaining={remainingUsage['seo-score']}
                                    total={3}
                                    onUpgrade={() => handleUpgrade('seo')}
                                    darkMode={darkMode}
                                    lang={lang}
                                />
                                <SEOScoreCard videoData={{ title: data.title, description: data.description, tags: data.tags }} />
                            </div>
                        ) : (
                            <LockedOverlay feature="SEO Score" onUpgrade={() => handleUpgrade('seo')} darkMode={darkMode} lang={lang} />
                        )}
                    </div>
                )}

                {/* TAB: AI */}
                {activeTab === 'ai' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                        {canAccessTab('ai') ? (
                            <AIActionsPanel videoData={{ title: data.title, description: data.description, tags: data.tags }} />
                        ) : (
                            <LockedOverlay feature="AI Title & Tags" onUpgrade={() => handleUpgrade('ai')} darkMode={darkMode} lang={lang} />
                        )}
                    </div>
                )}

                {/* TAB: SPY */}
                {activeTab === 'spy' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                        {canAccessTab('spy') ? (
                            <ChannelSpyPanel />
                        ) : (
                            <LockedOverlay feature="Competitor Spy" onUpgrade={() => handleUpgrade('spy')} darkMode={darkMode} lang={lang} />
                        )}
                    </div>
                )}

                {/* TAB: TRENDS */}
                {activeTab === 'trends' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                        {canAccessTab('trends') ? (
                            <div className="p-4">
                                <UsageBanner
                                    remaining={remainingUsage['trends']}
                                    total={3}
                                    onUpgrade={() => handleUpgrade('trends')}
                                    darkMode={darkMode}
                                    lang={lang}
                                />
                                <TrendPanel currentTags={data.tags} currentTitle={data.title} />
                            </div>
                        ) : (
                            <LockedOverlay feature="Trends" onUpgrade={() => handleUpgrade('trends')} darkMode={darkMode} lang={lang} />
                        )}
                    </div>
                )}

                {/* TAB: TOOLS */}
                {activeTab === 'tools' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                        <TitleTester />
                        <a
                            href={`https://seenyt.net/?tool=script-refiner&video=${data.videoId}`}
                            target="_blank"
                            className="w-full p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all group bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
                            <div className="text-left">
                                <p className="font-bold text-sm">Remix This Idea</p>
                                <p className="text-[10px] text-red-100">Tạo script mới từ video này →</p>
                            </div>
                        </a>
                    </div>
                )}

                {/* TAB: MORE */}
                {activeTab === 'more' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleDownloadThumb} className={`${theme.cardBg} border ${theme.cardBorder} hover:border-orange-200 p-3 rounded-xl flex flex-col items-center gap-2 group transition-all shadow-sm hover:shadow-md`}>
                                <div className="p-2 bg-orange-50 rounded-full group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </div>
                                <span className={`text-[10px] font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>Thumbnail HD</span>
                            </button>
                            <button onClick={handleCopyTags} className={`${theme.cardBg} border ${theme.cardBorder} hover:border-blue-200 p-3 rounded-xl flex flex-col items-center gap-2 group transition-all shadow-sm hover:shadow-md`}>
                                <div className="p-2 bg-blue-50 rounded-full group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </div>
                                <span className={`text-[10px] font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{copied ? "✅ Copied!" : "Copy Tags"}</span>
                            </button>
                        </div>

                        {/* SeenYT Tools Showcase */}
                        <div className={`${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-red-50 to-orange-50'} p-3 rounded-xl border ${darkMode ? 'border-slate-700' : 'border-red-200'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-base">🚀</span>
                                <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>SeenYT Pro Tools</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <a href="https://seenyt.net/?tool=script-refiner" target="_blank" className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-slate-600' : 'border-slate-200'} transition-all hover:scale-[1.02] group`}>
                                    <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">✍️</span>
                                    <p className={`text-[10px] font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>Script Refiner</p>
                                    <p className={`text-[8px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Viết script AI</p>
                                </a>
                                <a href="https://seenyt.net/?tool=seo" target="_blank" className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-green-50'} border ${darkMode ? 'border-slate-600' : 'border-slate-200'} transition-all hover:scale-[1.02] group`}>
                                    <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🎯</span>
                                    <p className={`text-[10px] font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>SEO Strategy</p>
                                    <p className={`text-[8px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Title, Tags, Desc</p>
                                </a>
                                <a href="https://seenyt.net/?tool=niche-engine" target="_blank" className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-purple-50'} border ${darkMode ? 'border-slate-600' : 'border-slate-200'} transition-all hover:scale-[1.02] group`}>
                                    <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">💎</span>
                                    <p className={`text-[10px] font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>Niche Engine</p>
                                    <p className={`text-[8px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tìm ngách vàng</p>
                                </a>
                                <a href="https://seenyt.net/?tool=all" target="_blank" className="p-2.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all hover:scale-[1.02] group">
                                    <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">⚡</span>
                                    <p className="text-[10px] font-bold text-white">Tất cả Tools</p>
                                    <p className="text-[8px] text-red-100">20+ công cụ</p>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with soft upsell */}
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50/80'} px-4 py-2 flex justify-between items-center border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                {!user?.isPro ? (
                    <button
                        onClick={() => handleUpgrade()}
                        className={`text-[9px] ${darkMode ? 'text-yellow-500' : 'text-yellow-600'} font-medium hover:underline`}
                    >
                        💎 Mở khóa AI + Spy chỉ 149K
                    </button>
                ) : (
                    <span className={`text-[9px] ${darkMode ? 'text-slate-500' : 'text-slate-400'} font-medium`}>Powered by SeenYT AI</span>
                )}
                <a href="https://seenyt.net" target="_blank" className="text-[9px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-80 transition-opacity">Open Dashboard →</a>
            </div>

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature={upgradeFeature}
                darkMode={darkMode}
            />

            {/* Keyword Popover */}
            <KeywordPopover
                keyword={keywordPopover.keyword}
                isOpen={keywordPopover.isOpen}
                onClose={() => setKeywordPopover(prev => ({ ...prev, isOpen: false }))}
                position={keywordPopover.position}
            />
        </div>
    );
};

export default Widget;

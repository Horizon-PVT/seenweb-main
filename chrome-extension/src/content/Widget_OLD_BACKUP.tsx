import { useEffect, useState } from 'react';

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
    vph: string; // Views Per Hour
}

const Widget = () => {
    const [data, setData] = useState<VideoData | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'stats' | 'tools' | 'assets'>('stats');
    const [showRemix, setShowRemix] = useState(false);
    const [remixPrompt, setRemixPrompt] = useState('');
    const [generatingScript, setGeneratingScript] = useState(false);

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

        // Title - multiple fallbacks
        const titleElement = document.querySelector('ytd-watch-metadata h1.ytd-watch-metadata yt-formatted-string')
            || document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string')
            || document.querySelector('#title h1 yt-formatted-string')
            || document.querySelector('ytd-watch-metadata #title h1');
        const title = titleElement?.textContent?.trim() || document.title.replace(' - YouTube', '');

        // Views - Try meta tag first, then text from info section
        let views = 0;
        const viewCountMeta = document.querySelector('meta[itemprop="interactionCount"]');
        if (viewCountMeta) {
            views = parseInt(viewCountMeta.getAttribute('content') || '0');
        } else {
            // Fallback: scrape from visible view count text
            const viewTextElem = document.querySelector('#info-container #info yt-formatted-string.ytd-video-view-count-renderer')
                || document.querySelector('ytd-video-view-count-renderer span.view-count');
            if (viewTextElem) {
                const viewText = viewTextElem.textContent?.replace(/[^0-9]/g, '') || '0';
                views = parseInt(viewText);
            }
        }

        // Tags from meta keywords
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        const tags = keywordsMeta
            ? keywordsMeta.getAttribute('content')?.split(',').map(t => t.trim()).filter(Boolean) || []
            : [];

        // Likes - Updated selectors for 2024/2025 YouTube UI
        let likes = '0';
        const likeSelectors = [
            'ytd-menu-renderer like-button-view-model button[aria-label*="like"] .yt-spec-button-shape-next__button-text-content',
            'like-button-view-model .yt-spec-button-shape-next__button-text-content',
            '#segmented-like-button button[aria-label] .yt-spec-button-shape-next__button-text-content',
            'ytd-toggle-button-renderer.style-scope.ytd-segmented-like-dislike-button-renderer #text',
            '#top-level-buttons-computed ytd-toggle-button-renderer:first-child #text'
        ];
        for (const selector of likeSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent?.trim()) {
                likes = el.textContent.trim();
                break;
            }
        }

        // Comments count
        let comments = '0';
        const commentSelectors = [
            'ytd-comments-header-renderer #count yt-formatted-string span:first-child',
            'ytd-comments-header-renderer h2 yt-formatted-string span',
            '#comments #count .count-text span'
        ];
        for (const selector of commentSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent?.trim()) {
                const text = el.textContent.trim();
                // Extract just the number
                const match = text.match(/[\d,\.]+/);
                if (match) {
                    comments = match[0];
                    break;
                }
            }
        }

        // Description
        const descElem = document.querySelector('#description-inline-expander yt-attributed-string')
            || document.querySelector('#description-inline-expander .yt-core-attributed-string')
            || document.querySelector('ytd-text-inline-expander yt-attributed-string');
        const description = descElem?.textContent?.trim() || '';

        // Publish Date - for VPH calculation
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
            description: description.substring(0, 100) + '...',
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

    if (!data) return (
        <div className="w-full bg-white border-2 border-red-600 rounded-xl p-4 mb-4 flex items-center justify-center gap-3 shadow-lg">
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-red-600 text-sm font-bold tracking-wide">SEENYT.net - Analysing Video...</span>
        </div>
    );

    return (
        <div className="bg-white text-gray-900 font-sans border-2 border-red-600 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(220,38,38,0.2)] mb-4 relative z-[2000] group hover:shadow-[0_6px_30px_rgba(220,38,38,0.3)] transition-shadow duration-300">

            {/* Header - BIG BRAND */}
            <div className="bg-gradient-to-r from-red-50 via-white to-white px-4 py-3 border-b border-red-100 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    {/* Big Logo Icon */}
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg transform -skew-x-3">
                        <span className="text-white font-black text-lg italic">S</span>
                    </div>
                    {/* Big Brand Name */}
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800 tracking-tight leading-none">SEENYT<span className="text-red-600">.net</span></span>
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Video Analytics</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all relative overflow-hidden ${activeTab === 'stats' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {activeTab === 'stats' && <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500" />}
                        <span className="relative z-10">STATS</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all relative overflow-hidden ${activeTab === 'tools' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {activeTab === 'tools' && <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500" />}
                        <span className="relative z-10">TOOLS</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('assets')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all relative overflow-hidden ${activeTab === 'assets' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {activeTab === 'assets' && <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400" />}
                        <span className="relative z-10">ASSETS</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 min-h-[140px] relative z-10 bg-gradient-to-b from-white to-slate-50/50">

                {/* TAB: STATS */}
                {activeTab === 'stats' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Views</p>
                                <p className="text-xl font-black text-slate-900">{formatViews(data.views)}</p>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-gradient-to-br from-red-50 to-white">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-red-600 opacity-100" />
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1">VPH 🔥</p>
                                <p className="text-xl font-black text-red-600">{data.vph}</p>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Engagement</p>
                                <p className={`text-xl font-black ${parseFloat(data.engagementRate) > 5 ? 'text-emerald-600' : 'text-slate-900'}`}>{data.engagementRate}%</p>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Likes</p>
                                <p className="text-xl font-black text-orange-600">{data.likes}</p>
                            </div>
                        </div>

                        {/* Tags Preview */}
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                <span className="text-base">🏷️</span>
                                <span className="text-sm font-bold text-slate-800 uppercase">Video Tags ({data.tags.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {data.tags.slice(0, 12).map((tag, index) => (
                                    <span key={index} className="text-sm text-slate-900 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg border border-orange-300 transition-colors font-semibold shadow-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: TOOLS */}
                {activeTab === 'tools' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                        {/* REMIX THIS IDEA - Prominent CTA */}
                        <button
                            onClick={() => setShowRemix(true)}
                            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white p-3 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all group"
                        >
                            <span className="text-2xl">🔥</span>
                            <div className="text-left">
                                <p className="font-bold text-sm">Remix This Idea</p>
                                <p className="text-[10px] text-red-100">Tạo script mới từ video này</p>
                            </div>
                            <svg className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Other tools grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <a href="https://seenyt.net/dashboard#script" target="_blank" className="bg-white hover:bg-blue-50/30 border border-slate-100 hover:border-blue-200 p-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-sm hover:shadow-md">
                                <span className="text-lg bg-blue-50 p-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">✍️</span>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600">Script Writer</p>
                                    <p className="text-[8px] text-slate-500">Tạo kịch bản AI</p>
                                </div>
                            </a>

                            <a href="https://seenyt.net/dashboard#seo" target="_blank" className="bg-white hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-200 p-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-sm hover:shadow-md">
                                <span className="text-lg bg-indigo-50 p-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">🚀</span>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 group-hover:text-indigo-600">SEO Optimizer</p>
                                    <p className="text-[8px] text-slate-500">Tối ưu tiêu đề/tag</p>
                                </div>
                            </a>

                            <a href="https://seenyt.net/dashboard#rival" target="_blank" className="bg-white hover:bg-red-50/30 border border-slate-100 hover:border-red-200 p-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-sm hover:shadow-md">
                                <span className="text-lg bg-red-50 p-1.5 rounded-lg group-hover:bg-red-100 transition-colors">🕵️</span>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 group-hover:text-red-600">Rival Spy</p>
                                    <p className="text-[8px] text-slate-500">Soi đối thủ</p>
                                </div>
                            </a>

                            <a href="https://seenyt.net/dashboard#niche" target="_blank" className="bg-white hover:bg-purple-50/30 border border-slate-100 hover:border-purple-200 p-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-sm hover:shadow-md">
                                <span className="text-lg bg-purple-50 p-1.5 rounded-lg group-hover:bg-purple-100 transition-colors">💎</span>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 group-hover:text-purple-600">Niche Finder</p>
                                    <p className="text-[8px] text-slate-500">Tìm ngách ngon</p>
                                </div>
                            </a>
                        </div>
                    </div>
                )}

                {/* TAB: ASSETS */}
                {activeTab === 'assets' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleDownloadThumb} className="bg-white hover:bg-orange-50/30 border border-slate-100 hover:border-orange-200 p-3 rounded-xl flex flex-col items-center gap-2 group transition-all shadow-sm hover:shadow-md">
                                <div className="p-2 bg-orange-50 rounded-full group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 group-hover:text-orange-600">Thumbnail HD</span>
                            </button>

                            <button onClick={handleCopyTags} className="bg-white hover:bg-blue-50/30 border border-slate-100 hover:border-blue-200 p-3 rounded-xl flex flex-col items-center gap-2 group transition-all shadow-sm hover:shadow-md">
                                <div className="p-2 bg-blue-50 rounded-full group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600">{copied ? "Đã Copy!" : "Copy Tags"}</span>
                            </button>
                        </div>

                        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-dashed border-slate-200 text-center">
                            <p className="text-[10px] text-slate-500 mb-2">More assets coming soon...</p>
                            <div className="flex justify-center gap-2 opacity-30">
                                <span className="text-xl grayscale">🎵</span>
                                <span className="text-xl grayscale">📝</span>
                                <span className="text-xl grayscale">📊</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50/80 px-4 py-2 flex justify-between items-center border-t border-slate-100 backdrop-blur-sm relative z-10">
                <span className="text-[9px] text-slate-400 font-medium">Powered by SeenYT AI</span>
                <a href="https://seenyt.net" target="_blank" className="text-[9px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-80 transition-opacity">Open Dashboard →</a>
            </div>

            {/* REMIX MODAL OVERLAY */}
            {showRemix && data && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm" onClick={() => setShowRemix(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔥</span>
                                <div>
                                    <h3 className="text-white font-bold">Remix This Idea</h3>
                                    <p className="text-red-100 text-xs">Tạo script mới từ ý tưởng video</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRemix(false)} className="text-white/80 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5 space-y-4">
                            {/* Source Video Info */}
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Video gốc</p>
                                <p className="text-sm font-semibold text-slate-800 line-clamp-2">{data.title}</p>
                            </div>

                            {/* Remix Options */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block">Góc nhìn mới</label>
                                    <input
                                        type="text"
                                        value={remixPrompt}
                                        onChange={(e) => setRemixPrompt(e.target.value)}
                                        placeholder="VD: Giải thích cho người mới bắt đầu..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <button className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-center transition-colors">
                                        <span className="text-lg">📝</span>
                                        <p className="text-[9px] font-bold text-slate-600">Tóm tắt</p>
                                    </button>
                                    <button className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-center transition-colors">
                                        <span className="text-lg">🎬</span>
                                        <p className="text-[9px] font-bold text-slate-600">Script mới</p>
                                    </button>
                                    <button className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-center transition-colors">
                                        <span className="text-lg">💡</span>
                                        <p className="text-[9px] font-bold text-slate-600">Ý tưởng</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 px-5 py-4 flex gap-3">
                            <button onClick={() => setShowRemix(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                Hủy
                            </button>
                            <button
                                onClick={async () => {
                                    if (generatingScript) return;
                                    setGeneratingScript(true);


                                    try {
                                        // 1. Get Player Data via Script Injection (Reliable & Fast & CSP Safe)
                                        // Uses inpage.js to either access global variable or call internal API
                                        const getPlayerData = (videoId: string): Promise<any> => {
                                            return new Promise((resolve) => {
                                                const requestId = Math.random().toString(36).substring(7);

                                                // Listen for the response
                                                const listener = (event: MessageEvent) => {
                                                    if (event.data?.type === 'SEENYT_PLAYER_DATA_RESULT' && event.data.requestId === requestId) {
                                                        window.removeEventListener('message', listener);
                                                        resolve(event.data.data);
                                                    }
                                                };
                                                window.addEventListener('message', listener);

                                                // Inject external script (CSP Safe)
                                                // We rely on the script being already loaded or loading it now
                                                const script = document.createElement('script');
                                                script.src = chrome.runtime.getURL('assets/inpage.js');
                                                script.onload = function () {
                                                    setTimeout(() => {
                                                        window.postMessage({
                                                            type: 'SEENYT_GET_PLAYER_DATA_REQUEST',
                                                            requestId,
                                                            videoId // Critical for API fetch
                                                        }, '*');
                                                    }, 100);
                                                    (this as any).remove();
                                                };
                                                (document.head || document.documentElement).appendChild(script);

                                                // Timeout fallback
                                                setTimeout(() => resolve(null), 3000);
                                            });
                                        };

                                        console.log('[SeenYT] Extracting player data (Advanced Mode)...');
                                        const playerData = await getPlayerData(data.videoId);

                                        let captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

                                        // Fallback: Fetch & Regex (Last resort)
                                        if (!captionTracks) {
                                            console.warn('[SeenYT] Advanced extraction failed/empty. Trying HTML regex fallback...');
                                            try {
                                                const response = await fetch(window.location.href);
                                                const html = await response.text();

                                                let regex = /"captionTracks":(\[.*?\])/;
                                                let match = html.match(regex);

                                                if (!match) {
                                                    regex = /\\"captionTracks\\":(\\[.*?\\])/;
                                                    match = html.match(regex);
                                                }

                                                if (match) {
                                                    const jsonStr = match[1].replace(/\\"/g, '"');
                                                    try {
                                                        captionTracks = JSON.parse(jsonStr);
                                                    } catch (e) {
                                                        try { captionTracks = JSON.parse(match[1]); } catch (e2) { }
                                                    }
                                                }
                                            } catch (fetchErr) {
                                                console.error('[SeenYT] Fallback regex failed', fetchErr);
                                            }
                                        }

                                        let finalTranscript = '';

                                        if (captionTracks && captionTracks.length > 0) {
                                            const track = captionTracks.find((t: any) => t.languageCode === 'vi') || captionTracks[0];

                                            if (track) {
                                                console.log('[SeenYT] Found track using base:', track.baseUrl);

                                                // PROXY FETCH HELPER (Uses inpage.js)
                                                // This ensures the fetch happens in the MAIN world with correct cookies/headers
                                                const proxyFetch = (url: string): Promise<{ success: boolean, data?: string, status?: number }> => {
                                                    return new Promise((resolve) => {
                                                        const requestId = Math.random().toString(36).substring(7);
                                                        const listener = (event: MessageEvent) => {
                                                            if (event.data?.type === 'SEENYT_main_world_FETCH_RESULT' && event.data.requestId === requestId) {
                                                                window.removeEventListener('message', listener);
                                                                resolve({
                                                                    success: event.data.success,
                                                                    data: event.data.data,
                                                                    status: event.data.status
                                                                });
                                                            }
                                                        };
                                                        window.addEventListener('message', listener);

                                                        // Send Request
                                                        setTimeout(() => {
                                                            window.postMessage({
                                                                type: 'SEENYT_main_world_FETCH_REQUEST',
                                                                requestId,
                                                                url
                                                            }, '*');
                                                        }, 50);

                                                        // Timeout
                                                        setTimeout(() => {
                                                            window.removeEventListener('message', listener);
                                                            resolve({ success: false, status: 408 }); // Timeout
                                                        }, 8000);
                                                    });
                                                };

                                                const fetchTranscript = async (url: string, format: 'json3' | 'xml') => {
                                                    try {
                                                        const targetUrl = format === 'json3' ? url + '&fmt=json3' : url;
                                                        console.log(`[SeenYT] Proxy fetching (${format})...`);

                                                        const res = await proxyFetch(targetUrl);
                                                        console.log(`[SeenYT] Proxy Result (${format}):`, res.status, res.success);

                                                        if (!res.success || !res.data) throw new Error(`Status ${res.status}`);
                                                        return { text: res.data, format };
                                                    } catch (e) {
                                                        console.warn(`[SeenYT] Fetch failed for ${format}:`, e);
                                                        return null;
                                                    }
                                                };

                                                // Retry Strategy: JSON3 -> XML
                                                let result = await fetchTranscript(track.baseUrl, 'json3');
                                                if (!result) {
                                                    console.log('[SeenYT] JSON3 failed, retrying XML...');
                                                    result = await fetchTranscript(track.baseUrl, 'xml');
                                                }

                                                if (result) {
                                                    const { text, format } = result;
                                                    if (format === 'json3') {
                                                        try {
                                                            const subData = JSON.parse(text);
                                                            if (subData.events) {
                                                                finalTranscript = subData.events
                                                                    .map((e: any) => e.segs?.map((s: any) => s.utf8).join('') || '')
                                                                    .join(' ')
                                                                    .replace(/\s+/g, ' ')
                                                                    .trim();
                                                            }
                                                        } catch (jsonErr) { console.error('[SeenYT] JSON Parse Error'); }
                                                    } else {
                                                        if (text.includes('<text')) {
                                                            const parser = new DOMParser();
                                                            const xmlDoc = parser.parseFromString(text, "text/xml");
                                                            const texts = xmlDoc.getElementsByTagName("text");
                                                            for (let i = 0; i < texts.length; i++) {
                                                                finalTranscript += (texts[i].textContent || "") + " ";
                                                            }
                                                            finalTranscript = finalTranscript.replace(/\s+/g, ' ').trim();
                                                            finalTranscript = finalTranscript.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
                                                        }
                                                    }
                                                } else {
                                                    console.error('[SeenYT] All fetch attempts failed.');
                                                }
                                            }
                                        } else {
                                            console.error('[SeenYT] No captions found even with API.');
                                        }

                                        // Prepare clipboard content
                                        let fullContent = '';
                                        if (finalTranscript) {
                                            fullContent = `📺 ${data.title}\nVideo ID: ${data.videoId}\n\n--- TRANSCRIPT ---\n\n${finalTranscript}`;

                                            // Save to storage
                                            await chrome.storage.local.set({
                                                [`transcript_${data.videoId}`]: {
                                                    transcript: finalTranscript,
                                                    timestamp: Date.now()
                                                }
                                            });
                                        } else {
                                            fullContent = `📺 ${data.title}\nVideo ID: ${data.videoId}\n\n(Chưa tìm được transcript. Vui lòng copy thủ công description)`;
                                        }

                                        // Copy to Clipboard
                                        try {
                                            await navigator.clipboard.writeText(fullContent);
                                            console.log('[SeenYT] Clipboard update success');
                                            // Optional feedback
                                            if (!finalTranscript) {
                                                alert('Không tìm thấy phụ đề (Captions) cho video này. Đã copy thông tin cơ bản.');
                                            }
                                        } catch (err) {
                                            console.warn('[SeenYT] Clipboard write failed', err);
                                            alert('Không thể copy clipboard. Vui lòng thao tác thủ công.');
                                        }

                                    } catch (e) {
                                        console.error('[SeenYT] Process failed:', e);
                                        alert('Có lỗi xảy ra. Đang mở dashboard...');
                                    }

                                    setGeneratingScript(false);
                                    // Always Open Dashboard
                                    window.open(`https://seenyt.net/dashboard?tool=script-refiner&source=extension&video=${data.videoId}&title=${encodeURIComponent(data.title)}`, '_blank');
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-bold text-white text-center transition-colors"
                            >
                                {generatingScript ? 'Đang xử lý...' : 'Tạo Script 🚀'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Widget;

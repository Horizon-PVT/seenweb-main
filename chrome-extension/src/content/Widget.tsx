import { useEffect, useState } from 'react';
import SEOScoreCard from './components/SEOScoreCard';
import AIActionsPanel from './components/AIActionsPanel';
import KeywordPopover from './components/KeywordPopover';

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

type TabType = 'stats' | 'seo' | 'ai' | 'tools' | 'assets';

const Widget = () => {
    const [data, setData] = useState<VideoData | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('stats');
    const [showRemix, setShowRemix] = useState(false);

    // Manual Transcript State
    const [manualTranscript, setManualTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Keyword Popover State
    const [keywordPopover, setKeywordPopover] = useState<{
        isOpen: boolean;
        keyword: string;
        position: { x: number; y: number };
    }>({ isOpen: false, keyword: '', position: { x: 0, y: 0 } });

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

        // Likes
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

        // Comments count
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

        // Description
        const descElem = document.querySelector('#description-inline-expander yt-attributed-string')
            || document.querySelector('#description-inline-expander .yt-core-attributed-string');
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

    // Handle tag click for keyword insights
    const handleTagClick = (tag: string, event: React.MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setKeywordPopover({
            isOpen: true,
            keyword: tag,
            position: { x: rect.left, y: rect.bottom + 5 }
        });
    };

    // --- REMIX HANDLER ---
    const handleRemix = async (prompt?: string) => {
        if (!data) return;
        setIsProcessing(true);

        try {
            // Prepare content
            let fullContent = `📺 VIDEO: ${data.title}\nID: ${data.videoId}\nLINK: https://youtu.be/${data.videoId}\n\n`;

            if (manualTranscript.trim()) {
                fullContent += `--- TRANSCRIPT ---\n${manualTranscript}`;
            } else {
                fullContent += `(Chưa có transcript - Hãy dán vào tool)`;
            }

            if (prompt) {
                fullContent += `\n\n--- YÊU CẦU ---\n${prompt}`;
            }

            // Copy to Clipboard
            await navigator.clipboard.writeText(fullContent);

            // Open Dashboard
            window.open(`https://seenyt.net/dashboard?tool=script-refiner&source=extension&video=${data.videoId}&manual=true`, '_blank');

        } catch (e) {
            alert('Lỗi: Không thể copy vào clipboard. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
            setShowRemix(false);
        }
    };

    if (!data) return (
        <div className="w-full bg-white border-2 border-red-600 rounded-xl p-4 mb-4 flex items-center justify-center gap-3 shadow-lg">
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-red-600 text-sm font-bold tracking-wide">SEENYT.net - Analysing Video...</span>
        </div>
    );

    const tabs: { key: TabType; label: string; icon: string; gradient: string }[] = [
        { key: 'stats', label: 'STATS', icon: '📊', gradient: 'from-orange-500 to-red-500' },
        { key: 'seo', label: 'SEO', icon: '🎯', gradient: 'from-emerald-500 to-teal-500' },
        { key: 'ai', label: 'AI', icon: '✨', gradient: 'from-purple-500 to-pink-500' },
        { key: 'tools', label: 'TOOLS', icon: '🔧', gradient: 'from-red-500 to-orange-500' },
        { key: 'assets', label: 'ASSETS', icon: '📦', gradient: 'from-blue-500 to-cyan-500' },
    ];

    return (
        <div className="bg-white text-gray-900 font-sans border-2 border-red-600 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(220,38,38,0.2)] mb-4 relative z-[2000] group hover:shadow-[0_6px_30px_rgba(220,38,38,0.3)] transition-shadow duration-300">

            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 via-white to-white px-4 py-3 border-b border-red-100 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg transform -skew-x-3">
                        <span className="text-white font-black text-lg italic">S</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800 tracking-tight leading-none">SEENYT<span className="text-red-600">.net</span></span>
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">VidIQ Killer 🔥</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all relative overflow-hidden flex items-center gap-1 flex-shrink-0 ${activeTab === tab.key
                                ? 'text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                            }`}
                    >
                        {activeTab === tab.key && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient}`} />
                        )}
                        <span className="relative z-10">{tab.icon}</span>
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-4 min-h-[200px] relative z-10 bg-gradient-to-b from-white to-slate-50/50">

                {/* TAB: STATS */}
                {activeTab === 'stats' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Views</p>
                                <p className="text-xl font-black text-slate-900">{formatViews(data.views)}</p>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-200 shadow-sm bg-gradient-to-br from-red-50 to-white">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-red-600 opacity-100" />
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1">VPH 🔥</p>
                                <p className="text-xl font-black text-red-600">{data.vph}</p>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Engagement</p>
                                <p className={`text-xl font-black ${parseFloat(data.engagementRate) > 5 ? 'text-emerald-600' : 'text-slate-900'}`}>{data.engagementRate}%</p>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Likes</p>
                                <p className="text-xl font-black text-orange-600">{data.likes}</p>
                            </div>
                        </div>

                        {/* Tags Preview with click for insights */}
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                <span className="text-base">🏷️</span>
                                <span className="text-sm font-bold text-slate-800 uppercase">Video Tags ({data.tags.length})</span>
                                <span className="text-[9px] text-slate-400 ml-auto">Click tag để xem insights</span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {data.tags.slice(0, 12).map((tag, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => handleTagClick(tag, e)}
                                        className="text-sm text-slate-900 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg border border-orange-300 transition-colors font-semibold shadow-sm hover:scale-105"
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
                        <SEOScoreCard
                            videoData={{
                                title: data.title,
                                description: data.description,
                                tags: data.tags
                            }}
                        />
                    </div>
                )}

                {/* TAB: AI */}
                {activeTab === 'ai' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                        <AIActionsPanel
                            videoData={{
                                title: data.title,
                                description: data.description,
                                tags: data.tags
                            }}
                        />
                    </div>
                )}

                {/* TAB: TOOLS */}
                {activeTab === 'tools' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">

                        {/* 1. MANUAL TRANSCRIPT INPUT AREA */}
                        <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-200">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📝</span>
                                    <span className="text-xs font-bold text-slate-700">Dán Transcript Video</span>
                                </div>
                                <a
                                    href="https://chromewebstore.google.com/detail/youtube-summary-with-chat/nmmicjeknamkfloonkhhcjmomieiodli"
                                    target="_blank"
                                    className="text-[9px] text-blue-600 hover:underline flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-100"
                                >
                                    <span>⬇️ Cài Tool lấy text</span>
                                </a>
                            </div>
                            <textarea
                                value={manualTranscript}
                                onChange={(e) => setManualTranscript(e.target.value)}
                                placeholder="📋 Dán nội dung transcript copy từ tool khác vào đây..."
                                className="w-full text-[10px] p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-400 min-h-[60px] resize-none"
                            />
                        </div>

                        {/* 2. REMIX BUTTON */}
                        <button
                            onClick={() => setShowRemix(true)}
                            className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all group ${manualTranscript.length > 50
                                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white'
                                : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-500'
                                }`}
                        >
                            <span className="text-2xl">🔥</span>
                            <div className="text-left">
                                <p className="font-bold text-sm">Remix This Idea</p>
                                <p className={`text-[10px] ${manualTranscript.length > 50 ? 'text-red-100' : 'text-slate-400'}`}>
                                    {manualTranscript.length > 50 ? '✅ Đã có transcript - Sẵn sàng!' : '⚠️ Chưa có transcript (vẫn tạo được)'}
                                </p>
                            </div>
                            <svg className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* 3. Other Tools */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <a href="https://seenyt.net/dashboard#rival" target="_blank" className="bg-white hover:bg-purple-50/30 border border-slate-100 hover:border-purple-200 p-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-sm hover:shadow-md">
                                <span className="text-lg bg-purple-50 p-1.5 rounded-lg group-hover:bg-purple-100 transition-colors">🕵️</span>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 group-hover:text-purple-600">Competitor Spy</p>
                                    <p className="text-[8px] text-slate-500">Soi đối thủ</p>
                                </div>
                            </a>
                            <a href="https://seenyt.net/dashboard#niche" target="_blank" className="bg-white hover:bg-emerald-50/30 border border-slate-100 hover:border-emerald-200 p-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-sm hover:shadow-md">
                                <span className="text-lg bg-emerald-50 p-1.5 rounded-lg group-hover:bg-emerald-100 transition-colors">💎</span>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 group-hover:text-emerald-600">Niche Finder</p>
                                    <p className="text-[8px] text-slate-500">Tìm ngách</p>
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

                        {/* Thumbnail Preview */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-600 mb-2 flex items-center gap-1">
                                <span>🖼️</span> Thumbnail Preview
                            </p>
                            <img
                                src={data.thumbnailUrl}
                                alt="Thumbnail"
                                className="w-full rounded-lg shadow-sm border border-slate-200"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50/80 px-4 py-2 flex justify-between items-center border-t border-slate-100 backdrop-blur-sm relative z-10">
                <span className="text-[9px] text-slate-400 font-medium">Powered by SeenYT AI</span>
                <a href="https://seenyt.net" target="_blank" className="text-[9px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-80 transition-opacity">Open Dashboard →</a>
            </div>

            {/* REMIX MODAL */}
            {showRemix && data && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm" onClick={() => setShowRemix(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔥</span>
                                <div>
                                    <h3 className="text-white font-bold">Remix This Idea</h3>
                                    <p className="text-red-100 text-xs">Tạo script mới từ ý tưởng video</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRemix(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Video gốc</p>
                                <p className="text-sm font-semibold text-slate-800 line-clamp-2">{data.title}</p>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-2 gap-3">
                                <button disabled={isProcessing} onClick={() => handleRemix('Hãy tóm tắt và rút ra bài học chính từ video này.')} className="p-3 bg-white hover:bg-slate-50 border hover:border-red-200 rounded-xl text-center group transition-all disabled:opacity-50">
                                    <span className="text-2xl mb-1 block group-hover:scale-110 transition-transform">📝</span>
                                    <span className="text-xs font-bold text-slate-600">{isProcessing ? '...' : 'Tóm Tắt'}</span>
                                </button>
                                <button disabled={isProcessing} onClick={() => handleRemix('Hãy viết lại kịch bản này theo phong cách hài hước/thú vị hơn.')} className="p-3 bg-white hover:bg-slate-50 border hover:border-red-200 rounded-xl text-center group transition-all disabled:opacity-50">
                                    <span className="text-2xl mb-1 block group-hover:scale-110 transition-transform">🎬</span>
                                    <span className="text-xs font-bold text-slate-600">{isProcessing ? 'Processing' : 'Remix Script'}</span>
                                </button>
                            </div>

                            <p className="text-[10px] text-center text-slate-400">
                                {manualTranscript ? '✅ Đã bao gồm transcript bạn dán' : '⚠️ Sẽ mở Dashboard để bạn dán transcript thủ công'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

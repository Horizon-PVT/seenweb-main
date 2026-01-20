import { useEffect, useState } from 'react';

interface ChannelData {
    subscriberCount: string;
    videoCount: string;
    totalViews: string;
    uploadsPerWeek: string;
    topVideos: { title: string; views: string }[];
}

const ChannelWidget = () => {
    const [data, setData] = useState<ChannelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'videos'>('overview');

    const scrapeChannelData = async () => {
        try {
            await new Promise(r => setTimeout(r, 1500));

            let subscriberCount = 'N/A';
            let videoCount = 'N/A';
            let totalViews = 'N/A';

            // METHOD 1: Search document body text for patterns
            // Header shows: "37,4 N người đăng ký · 91 video"
            const bodyText = document.body.innerText || '';

            // Match Vietnamese subscriber format: "37,4 N người đăng ký"
            const subMatch = bodyText.match(/(\d+[\d,\.]*\s*N)\s*người đăng ký/i);
            if (subMatch) {
                subscriberCount = subMatch[1].trim();
            } else {
                // English fallback
                const subMatchEn = bodyText.match(/(\d+[\d,\.]*[KMB]?)\s*subscribers/i);
                if (subMatchEn) subscriberCount = subMatchEn[1].trim();
            }

            // Match video count: "91 video"
            const vidMatch = bodyText.match(/(\d+)\s*video(?!\s*phổ)/i);
            if (vidMatch) {
                videoCount = vidMatch[1].trim();
            }

            // METHOD 2: Parse ytInitialData for Total Views
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const content = script.textContent || '';
                if (content.includes('viewCountText')) {
                    const viewsMatch = content.match(/"viewCountText":\{"simpleText":"([^"]+)"/);
                    if (viewsMatch) totalViews = viewsMatch[1];

                    // Fallback subscriber from ytInitialData  
                    if (subscriberCount === 'N/A') {
                        const subMatch2 = content.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
                        if (subMatch2) subscriberCount = subMatch2[1];
                    }

                    // Fallback video count
                    if (videoCount === 'N/A') {
                        const vidMatch2 = content.match(/"videosCountText":\{"runs":\[\{"text":"(\d+)"/);
                        if (vidMatch2) videoCount = vidMatch2[1];
                    }
                    break;
                }
            }

            // Get top videos from grid
            const topVideos: { title: string; views: string }[] = [];
            const videoRenderers = document.querySelectorAll('ytd-rich-item-renderer, ytd-grid-video-renderer');
            for (let i = 0; i < Math.min(5, videoRenderers.length); i++) {
                const renderer = videoRenderers[i];
                const titleEl = renderer.querySelector('#video-title');
                const viewsEl = renderer.querySelector('#metadata-line span');
                topVideos.push({
                    title: titleEl?.textContent?.trim().substring(0, 45) || `Video ${i + 1}`,
                    views: viewsEl?.textContent?.trim() || ''
                });
            }

            // Upload frequency
            let uploadsPerWeek = 'N/A';
            const totalVids = parseInt(videoCount.replace(/[^0-9]/g, '') || '0');
            if (totalVids > 0) {
                uploadsPerWeek = `~${(totalVids / 156).toFixed(1)}/wk`;
            }

            console.log('[SeenYT] Scraped:', { subscriberCount, videoCount, totalViews });

            setData({ subscriberCount, videoCount, totalViews, uploadsPerWeek, topVideos });
            setLoading(false);

        } catch (e) {
            console.error('[SeenYT] Error:', e);
            setLoading(false);
        }
    };

    useEffect(() => { scrapeChannelData(); }, []);

    if (loading) return (
        <div className="w-full bg-white border-2 border-red-600 rounded-lg py-3 flex items-center justify-center">
            <span className="text-red-500 font-bold text-sm">SEENYT.net - Loading...</span>
        </div>
    );

    if (!data) return null;

    // Revenue estimate
    const subVal = parseFloat(data.subscriberCount.replace(/[^0-9.]/g, ''));
    let money = 'N/A';
    if (!isNaN(subVal) && subVal > 0) {
        if (data.subscriberCount.match(/[MTr]/i)) {
            money = `$${(subVal * 0.8).toFixed(0)}K - $${(subVal * 12).toFixed(0)}K`;
        } else if (data.subscriberCount.match(/[NK]/i)) {
            money = `$${Math.round(subVal * 0.5)} - $${Math.round(subVal * 50)}`;
        }
    }

    return (
        <div className="w-full font-sans">
            <div className="bg-white rounded-lg border-2 border-red-600 shadow-lg overflow-hidden">

                {/* Red Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
                            <span className="text-red-600 font-black text-sm">S</span>
                        </div>
                        <span className="text-white font-bold text-sm">SEENYT.net</span>
                        <span className="text-red-200 text-xs font-medium ml-1">CHANNEL SPY</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-white/20 rounded overflow-hidden">
                            <button onClick={() => setActiveTab('overview')} className={`px-3 py-1 text-[10px] font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-red-600' : 'text-white'}`}>OVERVIEW</button>
                            <button onClick={() => setActiveTab('videos')} className={`px-3 py-1 text-[10px] font-bold transition-all ${activeTab === 'videos' ? 'bg-white text-red-600' : 'text-white'}`}>TOP VIDEOS</button>
                        </div>
                        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white/80 hover:text-white">
                            <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {!isCollapsed && (
                    <div className="p-3 bg-gradient-to-b from-white to-slate-50">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-5 gap-3">
                                <div className="text-center p-2 rounded bg-white border border-slate-100 shadow-sm">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Subscribers</p>
                                    <p className="text-xl font-black text-slate-800">{data.subscriberCount}</p>
                                </div>
                                <div className="text-center p-2 rounded bg-white border border-slate-100 shadow-sm">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Views</p>
                                    <p className="text-xl font-black text-slate-800">{data.totalViews}</p>
                                </div>
                                <div className="text-center p-2 rounded bg-red-50 border border-red-200 shadow-sm">
                                    <p className="text-[10px] text-red-500 font-bold uppercase">Est. Revenue</p>
                                    <p className="text-xl font-black text-red-600">{money}</p>
                                </div>
                                <div className="text-center p-2 rounded bg-white border border-slate-100 shadow-sm">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Videos</p>
                                    <p className="text-xl font-black text-slate-800">{data.videoCount}</p>
                                </div>
                                <div className="text-center p-2 rounded bg-white border border-slate-100 shadow-sm">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Upload Freq</p>
                                    <p className="text-xl font-black text-slate-800">{data.uploadsPerWeek}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="space-y-1.5">
                                {data.topVideos.slice(0, 5).map((video, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 bg-white rounded border border-slate-100 hover:border-red-200 transition-colors">
                                        <span className="w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded flex items-center justify-center">{i + 1}</span>
                                        <p className="flex-1 text-sm font-medium text-slate-700 truncate">{video.title}</p>
                                        <p className="text-sm font-bold text-red-600">{video.views}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChannelWidget;

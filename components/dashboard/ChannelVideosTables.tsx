import React from 'react';

interface ChannelVideosTablesProps {
    recentVids: any[];
    handleOptimize: (id: string) => void;
    handleChannelAudit: () => void;
}

export default function ChannelVideosTables({
    recentVids,
    handleOptimize,
    handleChannelAudit
}: ChannelVideosTablesProps) {
    const formatNum = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
        return n.toLocaleString();
    };

    return (
        <>
            {/* ============ ROW 2: TOP CONTENT (full width) ============ */}
            <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Video nổi bật
                    </h3>
                    <button onClick={handleChannelAudit} className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">Phân tích kênh</button>
                </div>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-3 px-2">
                    <div className="col-span-5">VIDEO</div>
                    <div className="col-span-2 text-right">LƯỢT XEM</div>
                    <div className="col-span-2 text-right">CTR</div>
                    <div className="col-span-3 text-right">TƯƠNG TÁC</div>
                </div>
                {/* Video Rows */}
                <div className="space-y-1">
                    {recentVids.slice(0, 4).map((vid: any, i: number) => {
                        const vidViews = parseInt(vid.viewCount || vid.views || '0');
                        const ctr = vid.ctr ? `${vid.ctr}%` : 'N/A';
                        const engagementStr = vid.engagement ? `${vid.engagement}%` : 'N/A';
                        const engagementValue = vid.engagement ? parseFloat(vid.engagement) : 0;
                        return (
                            <div key={vid.id || i} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleOptimize(vid.id)}>
                                <div className="col-span-5 flex items-center gap-3 min-w-0">
                                    <img
                                        src={vid.thumbnail || `https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`}
                                        alt={vid.title}
                                        className="w-12 h-8 rounded-lg object-cover flex-shrink-0 border border-white/5"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm text-white font-medium truncate group-hover:text-blue-300 transition-colors">{vid.title}</p>
                                        <p className="text-[10px] text-gray-500">{vid.publishedAt ? new Date(vid.publishedAt).toLocaleDateString('vi-VN') : ''}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 text-right text-sm text-gray-300 font-medium">{formatNum(vidViews)}</div>
                                <div className="col-span-2 text-right text-sm text-gray-300">{ctr}</div>
                                <div className="col-span-3 flex items-center gap-2 justify-end">
                                    <div className="w-16 bg-gray-800 rounded-full h-1.5 hidden sm:block">
                                        <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${engagementValue}%` }}></div>
                                    </div>
                                    <span className="text-sm text-gray-300 font-medium w-8 text-right">{engagementStr}</span>
                                </div>
                            </div>
                        );
                    })}
                    {recentVids.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">Chưa có video nào. Đồng bộ để xem dữ liệu.</div>
                    )}
                </div>
            </div>

            {/* ============ ROW 3: RECENT VIDEOS (same card style) ============ */}
            <div className="bg-[#0c1425] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Video mới nhất
                    </h3>
                    <span className="text-xs text-gray-500">{recentVids.length} video</span>
                </div>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-3 px-2">
                    <div className="col-span-5">VIDEO</div>
                    <div className="col-span-2 text-right">LƯỢT XEM</div>
                    <div className="col-span-2 text-right">NGÀY ĐĂNG</div>
                    <div className="col-span-3 text-right">HÀNH ĐỘNG</div>
                </div>
                {/* Video Rows */}
                <div className="space-y-1">
                    {recentVids.map((vid: any, i: number) => {
                        const vidViews = parseInt(vid.viewCount || vid.views || '0');
                        return (
                            <div key={vid.id || i} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleOptimize(vid.id)}>
                                <div className="col-span-5 flex items-center gap-3 min-w-0">
                                    <img
                                        src={vid.thumbnail || `https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`}
                                        alt={vid.title}
                                        className="w-12 h-8 rounded-lg object-cover flex-shrink-0 border border-white/5"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm text-white font-medium truncate group-hover:text-blue-300 transition-colors">{vid.title}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 text-right text-sm text-gray-300 font-medium">{formatNum(vidViews)}</div>
                                <div className="col-span-2 text-right text-xs text-gray-400">{vid.publishedAt ? new Date(vid.publishedAt).toLocaleDateString('vi-VN') : '—'}</div>
                                <div className="col-span-3 flex items-center gap-2 justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOptimize(vid.id); }}
                                        className="px-3 py-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all border border-blue-500/20 hover:border-blue-500/40"
                                    >
                                        Tối ưu
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {recentVids.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">Chưa có video nào. Đồng bộ kênh để xem dữ liệu.</div>
                    )}
                </div>
            </div>
        </>
    );
}

// components/dashboard/ChannelVideoManager.tsx
// Phase 1: Channel Video Manager - Video list with performance metrics, filter, and actions

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlayCircle,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  TrendingUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BarChart3,
  RefreshCw,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  duration?: string; // "10:30" format
  engagement: number; // %
  ctr?: number; // click-through rate %
  retention?: number; // avg retention %
}

interface ChannelVideoManagerProps {
  channelId: string;
  videos?: Video[]; // Optional: pass pre-fetched videos
  onVideoSelect?: (video: Video) => void;
  onVideoAudit?: (video: Video) => void;
}

type SortField = 'views' | 'publishedAt' | 'likes' | 'comments' | 'engagement';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'top' | 'recent' | 'underperforming';

function formatViews(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hôm nay';
  if (days === 1) return '1 ngày trước';
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

function PerformanceBadge({ engagement }: { engagement: number }) {
  const isGood = engagement >= 5;
  const isMedium = engagement >= 2 && engagement < 5;

  if (isGood) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
        <TrendingUp size={10} /> Top
      </span>
    );
  }
  if (isMedium) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        <Clock size={10} /> OK
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
      <AlertTriangle size={10} /> Yếu
    </span>
  );
}

function VideoCard({
  video,
  index,
  onAudit,
}: {
  video: Video;
  index: number;
  onAudit?: (video: Video) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group flex gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-200">
      {/* Rank */}
      <div className="flex items-center justify-center w-8 shrink-0">
        <span className={`text-lg font-black ${
          index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-600'
        }`}>
          {index + 1}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-800">
        <img
          src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {video.duration && (
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/20 rounded-full backdrop-blur-sm"
          >
            <ExternalLink size={16} className="text-white" />
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1">
            {video.title}
          </h4>
          <PerformanceBadge engagement={video.engagement} />
        </div>

        <p className="text-xs text-gray-500 mt-1">{timeAgo(video.publishedAt)}</p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Eye size={12} />
            <span className="text-xs font-medium">{formatViews(video.views)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <ThumbsUp size={12} />
            <span className="text-xs font-medium">{formatViews(video.likes)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MessageSquare size={12} />
            <span className="text-xs font-medium">{formatViews(video.comments)}</span>
          </div>
          <div className="text-xs text-gray-600">
            {video.engagement.toFixed(1)}% eng.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative shrink-0 flex items-start">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={16} />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-8 w-48 bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => { onAudit?.(video); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"
              >
                <BarChart3 size={14} className="text-purple-400" />
                Audit Video
              </button>
              <a
                href={`https://youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <ExternalLink size={14} className="text-blue-400" />
                Xem trên YouTube
              </a>
              <a
                href={`https://studio.youtube.com/video/${video.id}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <PlayCircle size={14} className="text-red-400" />
                YouTube Studio
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChannelVideoManager({
  channelId,
  videos: propVideos,
  onVideoSelect,
  onVideoAudit,
}: ChannelVideoManagerProps) {
  const [videos, setVideos] = useState<Video[]>(propVideos || []);
  const [isLoading, setIsLoading] = useState(!propVideos);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('views');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!propVideos) {
      fetchVideos();
    }
  }, [channelId]);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/youtube/videos?channelId=${channelId}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      } else {
        // Generate mock data for demo
        setVideos(generateMockVideos());
      }
    } catch {
      setVideos(generateMockVideos());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockVideos = (): Video[] => {
    return Array.from({ length: 30 }, (_, i) => {
      const views = Math.floor(Math.random() * 500000) + 1000;
      const likes = Math.floor(views * (Math.random() * 0.05 + 0.01));
      const comments = Math.floor(views * (Math.random() * 0.005 + 0.001));
      const daysAgo = Math.floor(Math.random() * 365);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      return {
        id: `vid_${i + 1}`,
        title: `Video ${i + 1}: Cách làm video viral với AI | ${['Review', 'Tutorial', 'Top 10', 'So sánh', 'Hướng dẫn'][i % 5]} ${['2025', 'công nghệ', 'youtube', 'kiếm tiền', 'marketing'][i % 5]}`,
        thumbnail: `https://picsum.photos/seed/${i + 1}/320/180`,
        publishedAt: date.toISOString(),
        views,
        likes,
        comments,
        duration: `${Math.floor(Math.random() * 15) + 3}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        engagement: ((likes + comments) / views * 100),
        ctr: Math.random() * 15 + 3,
        retention: Math.random() * 40 + 40,
      };
    });
  };

  // Filter and sort
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v => v.title.toLowerCase().includes(q));
    }

    // Category filter
    if (filter === 'top') {
      const medianViews = videos.sort((a, b) => b.views - a.views)[Math.floor(videos.length / 2)]?.views || 0;
      result = result.filter(v => v.views >= medianViews);
    } else if (filter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(v => new Date(v.publishedAt) >= thirtyDaysAgo);
    } else if (filter === 'underperforming') {
      const avgEngagement = videos.reduce((sum, v) => sum + v.engagement, 0) / videos.length;
      result = result.filter(v => v.engagement < avgEngagement * 0.7);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'views': cmp = a.views - b.views; break;
        case 'publishedAt': cmp = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(); break;
        case 'likes': cmp = a.likes - b.likes; break;
        case 'comments': cmp = a.comments - b.comments; break;
        case 'engagement': cmp = a.engagement - b.engagement; break;
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [videos, search, filter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-4 bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="w-8 shrink-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white/10 rounded-full" />
            </div>
            <div className="w-36 h-20 bg-white/10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/4" />
              <div className="flex gap-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-3 bg-white/10 rounded w-16" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Quản Lý Video</h2>
          <p className="text-gray-500 text-sm mt-1">{filteredVideos.length} video</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVideos}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm video..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          {([
            { key: 'all', label: 'Tất cả' },
            { key: 'top', label: 'Top' },
            { key: 'recent', label: 'Mới nhất' },
            { key: 'underperforming', label: 'Yếu' },
          ] as { key: FilterType; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                filter === f.key
                  ? 'bg-purple-500/30 text-purple-400'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-gray-500" />
          <select
            value={sortField}
            onChange={e => handleSort(e.target.value as SortField)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-400 focus:outline-none focus:border-purple-500"
          >
            <option value="views">Views</option>
            <option value="publishedAt">Ngày đăng</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
            <option value="engagement">Engagement</option>
          </select>
        </div>
      </div>

      {/* Video List */}
      <div className="space-y-2">
        {paginatedVideos.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            index={(currentPage - 1) * itemsPerPage + i}
            onAudit={onVideoAudit}
          />
        ))}

        {paginatedVideos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <PlayCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p>Không có video nào phù hợp</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500">
            Trang {currentPage} / {totalPages} — {filteredVideos.length} video
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === currentPage
                      ? 'bg-purple-500/30 text-purple-400 border border-purple-500/30'
                      : 'text-gray-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

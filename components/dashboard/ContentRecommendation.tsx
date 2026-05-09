// components/dashboard/ContentRecommendation.tsx
// Phase 1: AI-powered content recommendation widget

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
  BarChart3,
  Users,
  Clock,
  Zap
} from 'lucide-react';

interface RecommendedVideo {
  title: string;
  hook: string;
  reason: string;
  estimatedViews: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  keywords: string[];
  contentAngle: string;
  format: string;
}

interface CompetitorGap {
  topic: string;
  reason: string;
  potential: number;
}

interface NicheAnalysis {
  currentNiche: string;
  opportunity: number;
  competition: 'Low' | 'Medium' | 'High';
  trend: 'Rising' | 'Stable' | 'Declining';
}

interface ContentRecommendationProps {
  channelId: string;
  channelTitle?: string;
  compact?: boolean;
  onSelectIdea?: (idea: RecommendedVideo) => void;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    Easy: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Dễ' },
    Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Trung bình' },
    Hard: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Khó' },
  };
  const c = config[difficulty] || config.Medium;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function OpportunityGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#facc15' : '#f87171';
  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.9" fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${score} 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-white">{score}</span>
      </div>
    </div>
  );
}

function RecommendationCard({
  idea,
  index,
  onSelect,
  onCopy,
  copied,
}: {
  idea: RecommendedVideo;
  index: number;
  onSelect?: () => void;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-black">
            {index + 1}
          </div>
          <DifficultyBadge difficulty={idea.difficulty} />
          <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 rounded-full">
            {idea.format}
          </span>
        </div>
        <button
          onClick={onCopy}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          title="Copy title"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Hook */}
      <div className="flex items-start gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Zap size={10} className="text-orange-400" />
        </div>
        <p className="text-xs text-orange-300 leading-snug">{idea.hook}</p>
      </div>

      {/* Title */}
      <h4 className="text-white font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
        {idea.title}
      </h4>

      {/* Reason */}
      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">
        {idea.reason}
      </p>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {idea.keywords.slice(0, 3).map((kw, i) => (
          <span key={i} className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
            {kw}
          </span>
        ))}
        {idea.keywords.length > 3 && (
          <span className="text-[10px] text-gray-500">+{idea.keywords.length - 3}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <BarChart3 size={10} />
          <span>Est: {idea.estimatedViews}</span>
        </div>
        <div className="flex-1" />
        {onSelect && (
          <button
            onClick={onSelect}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
          >
            Use this idea →
          </button>
        )}
      </div>
    </div>
  );
}

export default function ContentRecommendation({
  channelId,
  channelTitle,
  compact = false,
  onSelectIdea,
}: ContentRecommendationProps) {
  const [data, setData] = useState<{
    recommendations: RecommendedVideo[];
    nicheAnalysis: NicheAnalysis;
    competitorGaps: CompetitorGap[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [channelId]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/youtube/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, channelTitle }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch recommendations');
      }
      const result = await res.json();
      setData({
        recommendations: result.recommendations || [],
        nicheAnalysis: result.nicheAnalysis || { currentNiche: 'General', opportunity: 70, competition: 'Medium', trend: 'Stable' },
        competitorGaps: result.competitorGaps || [],
      });
    } catch (err: any) {
      setError(err.message);
      // Generate mock data for demo
      setData({
        recommendations: generateFallbackRecommendations(channelTitle || 'Kênh của bạn').recommendations,
        nicheAnalysis: { currentNiche: 'General', opportunity: 70, competition: 'Medium', trend: 'Stable' },
        competitorGaps: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackRecommendations = (channelName: string) => ({
    recommendations: [
      {
        title: `Top 5 Tips Tăng View X100 Cho Kênh ${channelName}`,
        hook: 'Bạn đang làm video nhưng không ai xem? Đây là lý do...',
        reason: 'Hook question + promise luôn có tỷ lệ CTR cao trên YouTube',
        estimatedViews: '50K - 200K',
        difficulty: 'Easy' as const,
        keywords: ['tăng view youtube', 'seo youtube', 'thuật toán youtube'],
        contentAngle: 'Share actionable tips',
        format: 'Tutorial',
      },
      {
        title: `So Sánh: Tool Tốt Nhất Cho YouTuber Năm 2026`,
        hook: 'Đây là tool mà 90% YouTuber thành công đều dùng...',
        reason: 'Comparison + year keywords = evergreen traffic',
        estimatedViews: '30K - 150K',
        difficulty: 'Medium' as const,
        keywords: ['so sánh youtube tools', 'tool youtube 2026'],
        contentAngle: 'Deep comparison',
        format: 'Comparison',
      },
      {
        title: `Cách Tôi Đạt 10K Subscribers Trong 3 Tháng`,
        hook: 'Shocking statement: 10K subscribers trong 3 tháng...',
        reason: 'Specific numbers + case study = viral potential',
        estimatedViews: '100K - 500K',
        difficulty: 'Medium' as const,
        keywords: ['tăng subcribers', 'case study youtube'],
        contentAngle: 'Storytelling + tactics',
        format: 'Case Study',
      },
      {
        title: 'Những Sai Lầm Nguy Hiểm Khi Làm YouTube',
        hook: 'Warning: Bạn đang tự phá hủy kênh của mình!',
        reason: 'Fear + curiosity = high click rate',
        estimatedViews: '40K - 200K',
        difficulty: 'Easy' as const,
        keywords: ['sai lầm youtube', 'mẹo youtube'],
        contentAngle: 'Educational',
        format: 'Listicle',
      },
      {
        title: 'Xu Hướng Nội Dung: Đây Là Điều Sẽ Bùng Nổ',
        hook: 'Xu hướng này sẽ thay đổi hoàn toàn cách bạn làm content...',
        reason: 'Trend prediction + FOMO = shareability',
        estimatedViews: '60K - 300K',
        difficulty: 'Medium' as const,
        keywords: ['xu hướng youtube 2026', 'youtube trends'],
        contentAngle: 'Data analysis',
        format: 'Trend Analysis',
      },
    ],
    nicheAnalysis: {
      currentNiche: 'YouTube Growth & Monetization',
      opportunity: 72,
      competition: 'Medium',
      trend: 'Rising',
    },
    competitorGaps: [
      { topic: 'Shorts + Long video cross-optimization', reason: 'Algorithm ưu tiên', potential: 85 },
      { topic: 'Niche-specific SEO', reason: 'Content thiếu deep SEO', potential: 70 },
      { topic: 'Community engagement', reason: 'Engagement rate thấp', potential: 65 },
    ],
  });

  const handleCopy = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-purple-400 animate-pulse" size={20} />
          <span className="text-white font-bold">AI Content Ideas</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#111] border border-white/10 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
              <div className="h-3 bg-white/10 rounded w-full mb-2" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const displayedIdeas = compact && !showAll
    ? data.recommendations.slice(0, 3)
    : data.recommendations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="text-purple-400" size={20} />
          <div>
            <h3 className="text-white font-bold">AI Content Ideas</h3>
            {channelTitle && (
              <p className="text-xs text-gray-500">for {channelTitle}</p>
            )}
          </div>
        </div>
        <button
          onClick={fetchRecommendations}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          title="Regenerate"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Niche Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Opportunity Score */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-4 flex flex-col items-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Opportunity</span>
          <OpportunityGauge score={data.nicheAnalysis.opportunity} />
          <span className="text-[10px] text-gray-600 mt-2">{data.nicheAnalysis.currentNiche}</span>
        </div>

        {/* Competition */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Competition</span>
          </div>
          <div className={`text-2xl font-black ${
            data.nicheAnalysis.competition === 'Low' ? 'text-green-400' :
            data.nicheAnalysis.competition === 'Medium' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {data.nicheAnalysis.competition}
          </div>
          <div className="flex gap-1 mt-2">
            {['Low', 'Medium', 'High'].map(level => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full ${
                  (level === 'Low' && data.nicheAnalysis.competition === 'Low') ||
                  (level === 'Medium' && data.nicheAnalysis.competition === 'Medium') ||
                  (level === 'High' && data.nicheAnalysis.competition === 'High')
                    ? level === 'Low' ? 'bg-green-400' : level === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trend */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Trend</span>
          </div>
          <div className={`text-2xl font-black flex items-center gap-2 ${
            data.nicheAnalysis.trend === 'Rising' ? 'text-green-400' :
            data.nicheAnalysis.trend === 'Stable' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {data.nicheAnalysis.trend === 'Rising' && <TrendingUp size={20} />}
            {data.nicheAnalysis.trend}
          </div>
        </div>

        {/* Content Gaps */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Top Gap</span>
          </div>
          <p className="text-sm font-bold text-white line-clamp-2 leading-snug">
            {data.competitorGaps[0]?.topic || 'Loading...'}
          </p>
          <p className="text-[10px] text-gray-600 mt-1">Potential: {data.competitorGaps[0]?.potential || 0}/100</p>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedIdeas.map((idea, i) => (
          <RecommendationCard
            key={i}
            idea={idea}
            index={i}
            onSelect={onSelectIdea ? () => onSelectIdea(idea) : undefined}
            onCopy={() => handleCopy(idea.title, i)}
            copied={copiedIndex === i}
          />
        ))}
      </div>

      {/* Show More / Less */}
      {compact && data.recommendations.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          {showAll ? (
            <><ChevronUp size={16} /> Thu gọn</>
          ) : (
            <><ChevronDown size={16} /> Xem thêm {data.recommendations.length - 3} ideas</>
          )}
        </button>
      )}
    </div>
  );
}

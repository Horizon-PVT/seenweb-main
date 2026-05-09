// components/dashboard/MultiChannelSidebar.tsx
// Phase 2: Multi-Channel Sidebar - Switch between YouTube, TikTok, Facebook channels

import React, { useState } from 'react';
import {
  Youtube,
  Music,
  Facebook,
  Instagram,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Unlink,
} from 'lucide-react';
import { useCreatorHub } from '@/lib/creator-hub-context';

type Platform = 'youtube' | 'tiktok' | 'facebook' | 'instagram';

interface PlatformChannel {
  id: string;
  platform: Platform;
  platformUserId: string;
  displayName: string | null;
  profileImage: string | null;
  followerCount: number;
  isActive: boolean;
  lastSync: string | null;
}

const PLATFORM_CONFIG: Record<Platform, {
  icon: any;
  color: string;
  bgColor: string;
  label: string;
}> = {
  youtube: { icon: Youtube, color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'YouTube' },
  tiktok: { icon: Music, color: 'text-pink-400', bgColor: 'bg-pink-500/20', label: 'TikTok' },
  facebook: { icon: Facebook, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Facebook' },
  instagram: { icon: Instagram, color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Instagram' },
};

function formatFollowers(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function PlatformCard({
  channel,
  isSelected,
  onSelect,
  onSync,
  onDisconnect,
}: {
  channel: PlatformChannel;
  isSelected: boolean;
  onSelect: () => void;
  onSync: () => void;
  onDisconnect: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const config = PLATFORM_CONFIG[channel.platform];
  const Icon = config.icon;

  return (
    <div
      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-white/10 border border-white/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
      onClick={onSelect}
    >
      {/* Platform icon */}
      <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={config.color} />
      </div>

      {/* Channel info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white truncate">
            {channel.displayName || `${config.label} Channel`}
          </p>
          {channel.isActive && (
            <CheckCircle size={12} className="text-green-400 shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500">
          {formatFollowers(channel.followerCount)} followers
        </p>
      </div>

      {/* Actions (show on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onSync(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          title="Sync"
        >
          <RefreshCw size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          title="More"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-12 w-48 bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden py-1">
            <button
              onClick={(e) => { e.stopPropagation(); onSync(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <RefreshCw size={14} className="text-blue-400" />
              Sync Now
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <Settings size={14} className="text-gray-400" />
              Settings
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button
              onClick={(e) => { e.stopPropagation(); onDisconnect(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <Unlink size={14} />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MultiChannelSidebar() {
  const { channels, activeChannel, setActiveChannel } = useCreatorHub();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async (channelId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/channels/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      if (!res.ok) throw new Error('Sync failed');
      // Refresh channels
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (channelId: string) => {
    if (!confirm('Disconnect this channel?')) return;
    try {
      const res = await fetch('/api/channels/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      if (!res.ok) throw new Error('Disconnect failed');
      // Refresh channels
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const handleConnect = () => {
    // Redirect to OAuth flow based on platform
    if (selectedPlatform === 'youtube') {
      window.location.href = '/api/youtube/auth-url';
    } else {
      // TikTok, Facebook OAuth
      window.location.href = `/api/platforms/connect?platform=${selectedPlatform}`;
    }
  };

  // Group channels by platform
  const youtubeChannels = channels.filter(c => (c as any).platform === 'youtube' || !(c as any).platform);
  const tiktokChannels = channels.filter(c => (c as any).platform === 'tiktok');
  const facebookChannels = channels.filter(c => (c as any).platform === 'facebook');
  const instagramChannels = channels.filter(c => (c as any).platform === 'instagram');

  return (
    <div className="w-80 bg-[#111] border-r border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Settings size={16} className="text-gray-500" />
          Connected Channels
        </h2>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* YouTube Section */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Youtube size={14} className="text-red-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">YouTube</span>
            <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full ml-auto">
              {youtubeChannels.length}
            </span>
          </div>
          <div className="space-y-1">
            {youtubeChannels.length === 0 ? (
              <button
                onClick={() => { setSelectedPlatform('youtube'); setShowConnectModal(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Plus size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Connect YouTube</p>
                  <p className="text-xs text-gray-600">Link your channel</p>
                </div>
              </button>
            ) : (
              youtubeChannels.map(channel => (
                <PlatformCard
                  key={channel.id}
                  channel={{ ...channel, platform: 'youtube' } as PlatformChannel}
                  isSelected={activeChannel?.id === channel.id}
                  onSelect={() => setActiveChannel(channel)}
                  onSync={() => handleSync(channel.id)}
                  onDisconnect={() => handleDisconnect(channel.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* TikTok Section */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Music size={14} className="text-pink-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">TikTok</span>
            <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full ml-auto">
              {tiktokChannels.length}
            </span>
          </div>
          <div className="space-y-1">
            {tiktokChannels.length === 0 ? (
              <button
                onClick={() => { setSelectedPlatform('tiktok'); setShowConnectModal(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Plus size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Connect TikTok</p>
                  <p className="text-xs text-gray-600">Coming soon</p>
                </div>
              </button>
            ) : (
              tiktokChannels.map(channel => (
                <PlatformCard
                  key={channel.id}
                  channel={{ ...channel, platform: 'tiktok' } as PlatformChannel}
                  isSelected={activeChannel?.id === channel.id}
                  onSelect={() => setActiveChannel(channel)}
                  onSync={() => handleSync(channel.id)}
                  onDisconnect={() => handleDisconnect(channel.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Facebook Section */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Facebook size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Facebook</span>
            <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full ml-auto">
              {facebookChannels.length}
            </span>
          </div>
          <div className="space-y-1">
            {facebookChannels.length === 0 && (
              <button
                onClick={() => { setSelectedPlatform('facebook'); setShowConnectModal(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Plus size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Connect Facebook</p>
                  <p className="text-xs text-gray-600">Coming soon</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => setShowConnectModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors font-bold text-sm"
        >
          <Plus size={16} />
          Connect New Channel
        </button>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowConnectModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a20] border border-white/10 rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-white mb-4">Connect Platform</h3>
              <p className="text-gray-400 text-sm mb-6">Select a platform to connect your channel</p>

              <div className="space-y-3">
                {(['youtube', 'tiktok', 'facebook', 'instagram'] as Platform[]).map(platform => {
                  const config = PLATFORM_CONFIG[platform];
                  const Icon = config.icon;
                  const isAvailable = platform === 'youtube';

                  return (
                    <button
                      key={platform}
                      onClick={() => { setSelectedPlatform(platform); if (isAvailable) handleConnect(); }}
                      disabled={!isAvailable}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        isAvailable
                          ? 'border-white/10 hover:border-white/20 hover:bg-white/5 cursor-pointer'
                          : 'border-white/5 opacity-50 cursor-not-allowed'
                      } ${selectedPlatform === platform ? 'border-purple-500/50 bg-purple-500/5' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                        <Icon size={22} className={config.color} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{config.label}</p>
                          {!isAvailable && (
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Coming Soon</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {platform === 'youtube' && 'Analytics, video management, auto-publish'}
                          {platform === 'tiktok' && 'Cross-post videos to TikTok'}
                          {platform === 'facebook' && 'Connect Facebook Pages'}
                          {platform === 'instagram' && 'Connect Instagram Professional'}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-600" />
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowConnectModal(false)}
                className="w-full mt-4 py-3 text-gray-500 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

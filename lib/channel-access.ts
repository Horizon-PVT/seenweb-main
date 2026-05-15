// lib/channel-access.ts
// Phase 0: YouTube Channel Access Hook - Check if user has connected channels

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { hasMinRole } from './tab-access';
import { CHANNEL_LIMITS } from './roles';

export interface ConnectedChannel {
  id: string;
  channelId: string;
  title: string | null;
  thumbnail: string | null;
  subCount: number;
  videoCount: number;
  lastSync: string | null;
  healthScore: number | null;
}

export interface ChannelAccessState {
  channels: ConnectedChannel[];
  primaryChannel: ConnectedChannel | null;
  isLoading: boolean;
  hasChannel: boolean;
  channelCount: number;
  maxChannels: number;
  canAddChannel: boolean;
  error: string | null;
}

export function useChannelAccess() {
  const { data: session, status } = useSession();
  const [state, setState] = useState<ChannelAccessState>({
    channels: [],
    primaryChannel: null,
    isLoading: true,
    hasChannel: false,
    channelCount: 0,
    maxChannels: 0,
    canAddChannel: false,
    error: null,
  });

  const userRole = (session?.user as any)?.role || 'FREE';
  const extraSlots = (session?.user as any)?.extraChannelSlots || 0;

  // Calculate max channels based on plan
  const getMaxChannels = (role: string, extra: number): number => {
    return (CHANNEL_LIMITS[role] ?? CHANNEL_LIMITS.FREE) + extra;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchChannels = async () => {
      try {
        const res = await fetch('/api/user/channels');
        const data = await res.json();

        const channels: ConnectedChannel[] = data.channels || [];
        const maxChannels = getMaxChannels(userRole, extraSlots);

        setState({
          channels,
          primaryChannel: channels.find((c: any) => c.isPrimary) || channels[0] || null,
          isLoading: false,
          hasChannel: channels.length > 0,
          channelCount: channels.length,
          maxChannels,
          canAddChannel: channels.length < maxChannels,
          error: null,
        });
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to load channels',
        }));
      }
    };

    fetchChannels();
  }, [session, status, userRole, extraSlots]);

  return state;
}

// Check if user can perform an action on a specific channel
export function canManageChannel(
  userRole: string,
  channelOwnerId: string,
  userId: string
): boolean {
  if (hasMinRole(userRole, 'ADMIN')) return true;
  return channelOwnerId === userId;
}

// Get channel health label
export function getHealthLabel(score: number | null): { label: string; color: string } {
  if (score === null) return { label: 'Chưa đo', color: 'text-gray-400' };
  if (score >= 80) return { label: 'Tuyệt vời', color: 'text-green-400' };
  if (score >= 60) return { label: 'Khá', color: 'text-yellow-400' };
  if (score >= 40) return { label: 'Cần cải thiện', color: 'text-orange-400' };
  return { label: 'Yếu', color: 'text-red-400' };
}

// pages/api/platforms/connect.ts
// Phase 2: Multi-Platform OAuth Connector (TikTok, Facebook, etc.)

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const PLATFORM_CONFIG: Record<string, {
  clientId: string;
  scope: string;
  authUrl: string;
}> = {
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID || '',
    scope: 'user.info.basic,video.list',
    authUrl: 'https://www.tiktok.com/auth/authorize/',
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID || '',
    scope: 'pages_read_engagement,pages_manage_posts,instagram_basic,instagram_manage_posts',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { platform } = req.query;

  if (!platform || !PLATFORM_CONFIG[platform as string]) {
    return res.status(400).json({ error: 'Invalid or unsupported platform' });
  }

  const config = PLATFORM_CONFIG[platform as string];
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/platforms/callback/${platform}`;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scope,
    response_type: 'code',
  });

  if (platform === 'facebook') {
    params.append('auth_type', 'reauthenticate');
  }

  const authUrl = `${config.authUrl}?${params.toString()}`;

  return res.status(200).json({ url: authUrl, platform });
}

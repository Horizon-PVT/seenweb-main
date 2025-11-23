// File: pages/api/channel-discover.ts

import type { NextApiRequest, NextApiResponse } from 'next';

interface Channel {
  title: string;
  subscribers: number;
  views: number;
  joinDate: string;
}

interface Response {
  channels: Channel[];
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ channels: [], error: 'Method not allowed' });
  }

  try {
    const { keyword, category, subRange } = req.body;

    // Mock data (thay bằng YouTube API call)
    const mockChannels: Channel[] = [];
    for (let i = 0; i < 6; i++) {
      mockChannels.push({
        title: `${keyword} Channel ${i + 1}`,
        subscribers: parseInt(subRange.split('-')[0]) + Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 10000),
        joinDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
      });
    }

    res.status(200).json({ channels: mockChannels });
  } catch (err: any) {
    res.status(500).json({ channels: [], error: `Lỗi server: ${err.message || 'Không xác định'}` });
  }
}
// File mới: lib/youtube.ts (Utils Helper)

import { google } from 'googleapis';

export const getYouTubeClient = () => {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY not set');
  }
  return google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
};

// Simple cache (session-based, expand với Redis sau)
const cache = new Map();
export const cacheYouTubeData = (key: string, data: any, ttl = 3600000) => { // 1h
  cache.set(key, { data, expiry: Date.now() + ttl });
};

export const getCachedData = (key: string) => {
  const item = cache.get(key);
  if (item && Date.now() < item.expiry) return item.data;
  cache.delete(key);
  return null;
};
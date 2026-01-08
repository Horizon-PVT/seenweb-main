/**
 * Helper to download videos from various platforms
 * Supports YouTube via @distube/ytdl-core (Vercel friendly)
 * TikTok/Douyin support limited to direct MP4 links or external APIs if added later.
 */

import fs from 'fs';
import ytdl from '@distube/ytdl-core';

export interface DownloadResult {
    success: boolean;
    videoPath?: string;
    error?: string;
}

/**
 * Download video from URL using Vercel-compatible methods
 */
export async function downloadVideo(videoUrl: string, outputPath: string): Promise<DownloadResult> {
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    // 1. YouTube handling
    if (isYouTube) {
        return downloadYouTube(videoUrl, outputPath);
    }

    // 2. Direct MP4 link handling (TikTok/Douyin direct links)
    if (videoUrl.match(/\.mp4(\?|$)/) || videoUrl.includes('tiktokcdn.com') || videoUrl.includes('douyin.com')) {
        return downloadDirect(videoUrl, outputPath);
    }

    return {
        success: false,
        error: 'Hiện tại chỉ hỗ trợ link YouTube hoặc link file .mp4 trực tiếp. Với TikTok/Douyin, vui lòng dùng savetik.io lấy link mp4 rồi dán vào đây.'
    };
}

async function downloadYouTube(url: string, outputPath: string): Promise<DownloadResult> {
    try {
        console.log('[VideoDownloader] Starting YouTube download:', url);

        await new Promise((resolve, reject) => {
            const stream = ytdl(url, {
                quality: 'highest',
                filter: 'audioandvideo'
            });

            stream.pipe(fs.createWriteStream(outputPath));

            stream.on('end', resolve);
            stream.on('error', (err) => {
                console.error('[VideoDownloader] YTDL Error:', err);
                reject(err);
            });
        });

        return { success: true, videoPath: outputPath };
    } catch (error: any) {
        return { success: false, error: 'Lỗi tải YouTube: ' + error.message };
    }
}

async function downloadDirect(url: string, outputPath: string): Promise<DownloadResult> {
    try {
        console.log('[VideoDownloader] Starting direct download:', url);
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

        const buffer = await response.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(buffer));

        return { success: true, videoPath: outputPath };
    } catch (error: any) {
        return { success: false, error: 'Lỗi tải direct file: ' + error.message };
    }
}

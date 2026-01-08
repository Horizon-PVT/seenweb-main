/**
 * Helper to download videos from various platforms
 * Supports YouTube, TikTok, Douyin, and direct URLs
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export interface DownloadResult {
    success: boolean;
    videoPath?: string;
    error?: string;
}

/**
 * Download video from URL using yt-dlp or fallback methods
 */
export async function downloadVideo(videoUrl: string): Promise<DownloadResult> {
    const tempDir = os.tmpdir();
    const videoId = uuidv4();
    const videoPath = path.join(tempDir, `${videoId}.mp4`);

    // Check platform
    const isDouyin = videoUrl.includes('douyin.com') || videoUrl.includes('iesdouyin.com');
    const isTikTok = videoUrl.includes('tiktok.com');
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    console.log(`[VideoDownloader] Detected platform: ${isDouyin ? 'Douyin' : isTikTok ? 'TikTok' : isYouTube ? 'YouTube' : 'Unknown'}`);

    try {
        // For Douyin, try using a workaround with yt-dlp's special options
        if (isDouyin) {
            // First try: Use yt-dlp with impersonation
            const success = await tryYtDlpWithImpersonate(videoUrl, videoPath);
            if (success && fs.existsSync(videoPath)) {
                return { success: true, videoPath };
            }

            // Second try: Fetch redirect URL and try direct download
            const directUrl = await resolveDouyinRedirect(videoUrl);
            if (directUrl) {
                const success2 = await tryYtDlpWithImpersonate(directUrl, videoPath);
                if (success2 && fs.existsSync(videoPath)) {
                    return { success: true, videoPath };
                }
            }

            // If all fails, provide helpful error
            return {
                success: false,
                error: 'Không tải được video Douyin. Vui lòng:\n1) Truy cập savetik.io để lấy link video trực tiếp (.mp4)\n2) Hoặc dùng link TikTok/YouTube thay thế.'
            };
        }

        // For TikTok and YouTube, use standard yt-dlp
        const success = await tryStandardYtDlp(videoUrl, videoPath);
        if (success && fs.existsSync(videoPath)) {
            return { success: true, videoPath };
        }

        return {
            success: false,
            error: 'Không tải được video. Vui lòng kiểm tra link và thử lại.'
        };

    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Try downloading with standard yt-dlp
 */
async function tryStandardYtDlp(url: string, outputPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const cmd = `yt-dlp -f "best[ext=mp4]/best" -o "${outputPath}" "${url}"`;
        console.log('[VideoDownloader] Running:', cmd);

        exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
            if (error) {
                console.error('[VideoDownloader] yt-dlp error:', stderr);
                resolve(false);
            } else {
                console.log('[VideoDownloader] Success:', stdout);
                resolve(true);
            }
        });
    });
}

/**
 * Try downloading with impersonation (for Douyin)
 */
async function tryYtDlpWithImpersonate(url: string, outputPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        // Use --impersonate to mimic a browser
        const cmd = `yt-dlp --impersonate chrome -f "best[ext=mp4]/best" -o "${outputPath}" "${url}"`;
        console.log('[VideoDownloader] Trying with impersonate:', cmd);

        exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
            if (error) {
                console.log('[VideoDownloader] Impersonate failed, trying headers approach...');

                // Fallback: Try with custom headers
                const cmd2 = `yt-dlp -f "best[ext=mp4]/best" -o "${outputPath}" --add-headers "User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" --no-check-certificates "${url}"`;
                exec(cmd2, { timeout: 120000 }, (error2, stdout2, stderr2) => {
                    if (error2) {
                        console.error('[VideoDownloader] Headers approach also failed:', stderr2);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Resolve Douyin short URL to full URL
 */
async function resolveDouyinRedirect(shortUrl: string): Promise<string | null> {
    try {
        // Extract just the URL part if there's extra text
        const urlMatch = shortUrl.match(/https?:\/\/[^\s]+/);
        if (!urlMatch) return null;

        const cleanUrl = urlMatch[0].replace(/[，。！？,./]$/, ''); // Remove trailing punctuation

        console.log('[VideoDownloader] Resolving Douyin redirect:', cleanUrl);

        // Follow redirects to get the actual URL
        const response = await fetch(cleanUrl, {
            method: 'HEAD',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const finalUrl = response.url;
        console.log('[VideoDownloader] Resolved to:', finalUrl);

        return finalUrl !== cleanUrl ? finalUrl : null;
    } catch (error) {
        console.error('[VideoDownloader] Failed to resolve redirect:', error);
        return null;
    }
}

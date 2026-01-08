// lib/ffmpeg.ts - FFmpeg configuration for both local and Vercel serverless
// Using @ffmpeg-installer/ffmpeg which has better cross-platform support

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

/**
 * Get the correct ffmpeg path for the current environment.
 * Tries multiple approaches for maximum compatibility.
 */
function getFFmpegPath(): string | null {
    // Approach 1: Try @ffmpeg-installer/ffmpeg (better for serverless)
    try {
        const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
        if (ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
            console.log('[FFmpeg] Using @ffmpeg-installer path:', ffmpegInstaller.path);
            return ffmpegInstaller.path;
        }
    } catch (e) {
        console.log('[FFmpeg] @ffmpeg-installer/ffmpeg not available');
    }

    // Approach 2: Try ffmpeg-static
    try {
        const ffmpegStatic = require('ffmpeg-static');
        if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
            console.log('[FFmpeg] Using ffmpeg-static path:', ffmpegStatic);
            return ffmpegStatic;
        }
    } catch (e) {
        console.log('[FFmpeg] ffmpeg-static not available');
    }

    // Approach 3: Try common system paths
    const systemPaths = [
        '/usr/bin/ffmpeg',           // Linux
        '/usr/local/bin/ffmpeg',     // macOS Homebrew
        '/opt/bin/ffmpeg',           // Some Alpine/Docker
        'C:\\ffmpeg\\bin\\ffmpeg.exe', // Windows custom
    ];

    for (const sysPath of systemPaths) {
        if (fs.existsSync(sysPath)) {
            console.log('[FFmpeg] Using system path:', sysPath);
            return sysPath;
        }
    }

    // Approach 4: Let fluent-ffmpeg find it in PATH
    console.warn('[FFmpeg] Could not find ffmpeg binary, relying on system PATH');
    return null;
}

const resolvedFFmpegPath = getFFmpegPath();
if (resolvedFFmpegPath) {
    ffmpeg.setFfmpegPath(resolvedFFmpegPath);
    console.log('[FFmpeg] Configured with path:', resolvedFFmpegPath);
} else {
    console.error('[FFmpeg] WARNING: No ffmpeg path found! Audio/video processing will fail.');
}

export default ffmpeg;
export { resolvedFFmpegPath };

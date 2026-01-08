// lib/ffmpeg.ts - FFmpeg configuration for both local and Vercel serverless

import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

/**
 * Get the correct ffmpeg path for the current environment.
 * Handles both local development and Vercel serverless deployment.
 */
function getFFmpegPath(): string | null {
    // 1. Try ffmpeg-static path directly
    if (ffmpegPath) {
        // On Vercel, the path might be relative to node_modules
        if (fs.existsSync(ffmpegPath)) {
            console.log('[FFmpeg] Using ffmpeg-static path:', ffmpegPath);
            return ffmpegPath;
        }

        // Try resolving from project root
        const projectRoot = process.cwd();
        const resolvedPath = path.resolve(projectRoot, 'node_modules', 'ffmpeg-static', 'ffmpeg');
        if (fs.existsSync(resolvedPath)) {
            console.log('[FFmpeg] Using resolved path:', resolvedPath);
            return resolvedPath;
        }

        // Try with .exe extension for Windows
        const resolvedPathExe = resolvedPath + '.exe';
        if (fs.existsSync(resolvedPathExe)) {
            console.log('[FFmpeg] Using resolved path (exe):', resolvedPathExe);
            return resolvedPathExe;
        }
    }

    // 2. Try system ffmpeg
    const systemPaths = [
        '/usr/bin/ffmpeg',           // Linux
        '/usr/local/bin/ffmpeg',     // macOS Homebrew
        'C:\\ffmpeg\\bin\\ffmpeg.exe', // Windows custom
    ];

    for (const sysPath of systemPaths) {
        if (fs.existsSync(sysPath)) {
            console.log('[FFmpeg] Using system path:', sysPath);
            return sysPath;
        }
    }

    console.warn('[FFmpeg] Could not find ffmpeg binary. Audio/video processing may fail.');
    return null;
}

const resolvedFFmpegPath = getFFmpegPath();
if (resolvedFFmpegPath) {
    ffmpeg.setFfmpegPath(resolvedFFmpegPath);
}

export default ffmpeg;
export { resolvedFFmpegPath };

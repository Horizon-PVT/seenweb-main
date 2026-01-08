
import type { NextApiRequest, NextApiResponse } from 'next';
import ffmpeg from '@/lib/ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    // In: projectId, videoUrl, dubbedAudioUrl (relative path from public/temp)
    const { videoUrl, dubbedAudioUrl } = req.body;

    if (!videoUrl || !dubbedAudioUrl) return res.status(400).json({ error: 'Missing inputs' });

    try {
        const publicTempDir = path.join(process.cwd(), 'public', 'temp');
        const audioPath = path.join(publicTempDir, path.basename(dubbedAudioUrl));

        if (!fs.existsSync(audioPath)) return res.status(404).json({ error: 'Audio file not found' });

        const tempDir = os.tmpdir();
        const videoId = uuidv4();
        const inputVideoPath = path.join(tempDir, `vid_${videoId}_in.mp4`);
        const outputVideoName = `final_${videoId}.mp4`;
        const outputVideoPath = path.join(publicTempDir, outputVideoName);

        // 1. Get input video - either from local path or download from URL
        const isLocalFile = videoUrl.startsWith('/temp/') || videoUrl.startsWith('upload://');

        if (isLocalFile) {
            // For uploaded files, use the local path directly
            const localVideoPath = path.join(publicTempDir, path.basename(videoUrl));
            if (fs.existsSync(localVideoPath)) {
                fs.copyFileSync(localVideoPath, inputVideoPath);
                console.log('[Merge] Using local file:', localVideoPath);
            } else {
                throw new Error('Source video file not found: ' + localVideoPath);
            }
        } else {
            // For remote URLs, download using yt-dlp
            await new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                const cmd = `yt-dlp -f "best[ext=mp4]/best" -o "${inputVideoPath}" "${videoUrl}"`;
                console.log('[Merge] Downloading:', cmd);
                exec(cmd, { timeout: 120000 }, (error: any, stdout: any, stderr: any) => {
                    if (error) {
                        console.error('yt-dlp error:', stderr);
                        reject(new Error(`Failed to download: ${stderr.substr(0, 100)}`));
                    } else {
                        resolve(true);
                    }
                });
            });
        }

        // 2. Merge with Ducking
        // Input 0: Video (with original audio)
        // Input 1: Dubbed Audio
        // Filter: [0:a]volume=0.1[bg]; [1:a]volume=1.5[fg]; [bg][fg]amix=inputs=2[a]
        // Map: 0:v, [a]

        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(inputVideoPath)
                .input(audioPath)
                .complexFilter([
                    '[0:a]volume=0.1[bg]', // Lower original audio to 10%
                    '[1:a]volume=1.2[fg]', // Boost dubbed audio
                    '[bg][fg]amix=inputs=2:duration=first[a]' // Mix. Duration follows video (first input)
                ])
                .outputOptions([
                    '-map 0:v',
                    '-map [a]',
                    '-c:v copy', // Copy video stream (FAST RENDER!)
                    '-c:a aac',
                    '-shortest' // Stop when shortest input ends (usually video)
                ])
                .save(outputVideoPath)
                .on('end', resolve)
                .on('error', reject);
        });

        // Cleanup input
        try { fs.unlinkSync(inputVideoPath); } catch { }

        res.status(200).json({ ok: true, videoUrl: `/temp/${outputVideoName}` });

    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}

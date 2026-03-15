
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { EdgeTTS } from '@/lib/edgetts';
import { synthesizeFPT, isFPTVoice } from '@/lib/fptTTS';
import ffmpeg from '@/lib/ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    // Auth check
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId, segments, voice, speed } = req.body;
    // segments: { id, start, end, translated }[]
    // speed: number (e.g., 1.0, 1.2, 0.8)

    if (!projectId || !segments) return res.status(400).json({ error: 'Missing data' });
    
    const userId = (session.user as any)?.id;

    try {
        await checkUserQuota(userId, 'dubbing');
    } catch (error: any) {
        if (error.message === 'PLAN_LOCKED' || error.message === 'FREE_QUOTA_EXCEEDED' || error.message === 'DAILY_QUOTA_EXCEEDED') {
            return res.status(403).json({ error: 'REQUIRE_UPGRADE' } as any);
        }
        return res.status(403).json({ error: error.message });
    }

    try {
        const tempDir = os.tmpdir();
        const outputFilename = `dub_${projectId}_${Date.now()}.mp3`;

        // Ensure public/temp exists for preview serving
        const publicTempDir = path.join(process.cwd(), 'public', 'temp');
        if (!fs.existsSync(publicTempDir)) fs.mkdirSync(publicTempDir, { recursive: true });

        const finalPath = path.join(publicTempDir, outputFilename);

        // 1. Generate individual clips
        const clips: string[] = [];
        const clipPaths: string[] = [];

        // Concat file content
        // file 'path'
        // duration X
        let listContent = '';
        let currentTime = 0;

        // Sort segments by start time
        segments.sort((a: any, b: any) => a.start - b.start);

        const filterScriptPath = path.join(tempDir, `filter_${uuidv4()}.txt`);
        let filterScriptContent = '';
        let amixInputs = '';

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const text = seg.translated;
            if (!text) continue;

            // 1. Generate TTS with segment-specific voice and speed
            const ttsPath = path.join(tempDir, `tts_${uuidv4()}.mp3`);
            const voiceRate = speed || 1.0;
            const segmentVoice = seg.voice || voice || 'vi-VN-HoaiMyNeural';
            console.log(`[Synthesize] Segment ${seg.id}: voice=${segmentVoice}, rate=${voiceRate}`);

            // Route to correct TTS provider
            if (isFPTVoice(segmentVoice)) {
                try {
                    await synthesizeFPT(text, ttsPath, { voice: segmentVoice, speed: voiceRate });
                } catch (fptError: any) {
                    console.warn(`[Synthesize] FPT TTS failed, fallback Edge: ${fptError.message}`);
                    await EdgeTTS.synthesize(text, 'vi-VN-HoaiMyNeural', ttsPath, voiceRate);
                }
            } else {
                await EdgeTTS.synthesize(text, segmentVoice, ttsPath, voiceRate);
            }

            clipPaths.push(ttsPath);

            // Calculate delay in milliseconds
            const delayMs = Math.floor(seg.start * 1000);
            
            // Build Complex Filter padding per stream
            filterScriptContent += `[${i}:a]adelay=${delayMs}|${delayMs}[a${i}];\n`;
            amixInputs += `[a${i}]`;
        }

        // Final mix command combining all padded audio streams
        filterScriptContent += `${amixInputs}amix=inputs=${clipPaths.length}:duration=longest[outa]`;

        // Write the complex filter script to file
        fs.writeFileSync(filterScriptPath, filterScriptContent, 'utf8');

        // Execute ffmpeg with all inputs
        await new Promise((resolve, reject) => {
            const cmd = ffmpeg();
            
            // Add all tts audio files as inputs
            clipPaths.forEach(clip => {
                cmd.input(clip);
            });

            cmd
                .inputOptions([`-filter_complex_script ${filterScriptPath}`])
                .outputOptions(['-map [outa]'])
                .save(finalPath)
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('[Synthesize] FFmpeg amix error:', err);
                    reject(new Error('Failed to synchronize audio timeline (DriftSync).'));
                });
        });

        // Cleanup temp
        clipPaths.forEach(p => { try { fs.unlinkSync(p); } catch { } });
        try { fs.unlinkSync(filterScriptPath); } catch { }

        await incrementUserUsage(userId, 'dubbing');

        res.status(200).json({ ok: true, audioUrl: `/temp/${outputFilename}` });

    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}

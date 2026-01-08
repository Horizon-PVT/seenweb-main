
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { EdgeTTS } from '@/lib/edgetts';
import { synthesizeFPT, isFPTVoice } from '@/lib/fptTTS';
import ffmpeg from '@/lib/ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { projectId, segments, voice, speed } = req.body;
    // segments: { id, start, end, translated }[]
    // speed: number (e.g., 1.0, 1.2, 0.8)

    if (!projectId || !segments) return res.status(400).json({ error: 'Missing data' });

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

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const text = seg.translated;
            if (!text) continue;

            // Gap handling (Silence)
            const gap = seg.start - currentTime;
            if (gap > 0.1) {
                // We handle silence by just telling ffmpeg input directives or complex filter?
                // Actually, for concat demuxer, we can't easily specify "silence" without a file.
                // Alternative: Use a pre-generated 1-second silence and loop it? 
                // Or just use 'anullsrc`?

                // Easier strategy:
                // Generate the TTS file. 
                // Then use ffmpeg to PAD it with 'adelay' (start time) later? No, complex.

                // Let's use the 'adelay' filter approach since we have full start times.
                // Generate all files.
            }
        }

        // Approach 2: ADELAY Filter (Best for Sync)
        // input 1: tts1.mp3 -> adelay=Start1|Start1
        // input 2: tts2.mp3 -> adelay=Start2|Start2
        // mix all

        // LIMIT: Command line length.
        // If too many segments, we Batch them? 
        // 10 minutes = 100 segments? 
        // 100 inputs might crash windows terminal.

        // Approach 3: Sequential Stitching with a Helper Script or loop
        // Let's rely on simple Concat with silence files?
        // We'll generate a 'silence.mp3' of exact duration required?
        // ffmpeg -f lavfi -i anullsrc=r=24000:cl=mono -t <DURATION> -q:a 9 silence.mp3

        // Implementation:
        const fileListPath = path.join(tempDir, `list_${uuidv4()}.txt`);
        const stream = fs.createWriteStream(fileListPath, { flags: 'a' });

        for (const seg of segments) {
            // 1. Calculate Silence needed before this segment
            const gap = seg.start - currentTime;
            if (gap > 0.1) {
                // Generate silence file
                const silencePath = path.join(tempDir, `sil_${uuidv4()}.mp3`);
                await new Promise((resolve) => {
                    ffmpeg()
                        .input('anullsrc=r=24000:cl=mono')
                        .inputFormat('lavfi')
                        .duration(gap)
                        .save(silencePath)
                        .on('end', resolve)
                        .on('error', (e) => { console.error('Silence gen error', e); resolve(null); });
                });
                stream.write(`file '${silencePath.replace(/\\/g, '/')}'\n`);
                clipPaths.push(silencePath);
            }

            // 2. Generate TTS with segment-specific voice and speed
            const ttsPath = path.join(tempDir, `tts_${uuidv4()}.mp3`);
            const voiceRate = speed || 1.0;
            // Use segment-specific voice if set, otherwise use the global voice
            const segmentVoice = seg.voice || voice || 'vi-VN-HoaiMyNeural';
            console.log(`[Synthesize] Segment ${seg.id}: voice=${segmentVoice}, rate=${voiceRate}`);

            // Route to correct TTS provider based on voice
            if (isFPTVoice(segmentVoice)) {
                // Use FPT.AI TTS for premium voices (with fallback to Edge TTS)
                try {
                    await synthesizeFPT(seg.translated, ttsPath, { voice: segmentVoice, speed: voiceRate });
                } catch (fptError: any) {
                    console.warn(`[Synthesize] FPT TTS failed, falling back to Edge TTS: ${fptError.message}`);
                    // Fallback to female Edge voice
                    await EdgeTTS.synthesize(seg.translated, 'vi-VN-HoaiMyNeural', ttsPath, voiceRate);
                }
            } else {
                // Use Edge TTS for free voices
                await EdgeTTS.synthesize(seg.translated, segmentVoice, ttsPath, voiceRate);
            }

            // Get duration to update currentTime
            const duration: number = await new Promise((resolve) => {
                ffmpeg.ffprobe(ttsPath, (err, metadata) => {
                    resolve(metadata?.format?.duration || 0);
                });
            });

            stream.write(`file '${ttsPath.replace(/\\/g, '/')}'\n`);
            clipPaths.push(ttsPath);

            currentTime = seg.start + gap + duration; // Use true timeline
            // Note: If TTS duration > segment duration in original, we naturally just extend. 
            // The next gap calculation will be negative? 
            // If gap < 0, it means overlap. We just append immediately (currentTime is pushed back).
            // Start of next segment: max(seg.next.start, currentTime)
            currentTime = Math.max(currentTime, seg.end); // Or just accumulate?
            // Actually, if we just append, the next `gap = next.start - currentTime`.
            // If next.start < currentTime, gap is negative.
            // We should NOT add silence. We just play immediately.
            // This means the audio will drift (be slower than video). 
            // This is a known issue with Dubbing. 
            // Fix: Speed up audio? `atempo`. For MVP, let's just accept drift or overlap.
            // Better: Reset currentTime to max(currentTime, seg.end) only if we wanted strict sync?
            // Correct logic: currentTime IS the end of the last audio file.
        }

        stream.end();

        // 3. Concat everything
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(fileListPath)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .save(finalPath)
                .on('end', resolve)
                .on('error', reject);
        });

        // Cleanup temp
        clipPaths.forEach(p => { try { fs.unlinkSync(p); } catch { } });
        try { fs.unlinkSync(fileListPath); } catch { }

        res.status(200).json({ ok: true, audioUrl: `/temp/${outputFilename}` });

    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import ffmpeg from '@/lib/ffmpeg';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
    api: {
        bodyParser: true, // JSON body
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { uploadId, originalName } = req.body;

    if (!uploadId || !originalName) {
        return res.status(400).json({ error: 'Missing uploadId or originalName' });
    }

    const userId = (session.user as any).id;

    // Check user credits and role BEFORE processing file
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, dubbingCredits: true }
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // FREE users cannot use dubbing
    if (user.role === 'FREE') {
        return res.status(403).json({
            error: 'Tính năng AI Dubbing chỉ dành cho gói STARTER trở lên. Vui lòng nâng cấp!',
            upgradeRequired: true
        });
    }

    // Check if user has credits
    if (user.dubbingCredits <= 0) {
        return res.status(403).json({
            error: 'Bạn đã hết lượt sử dụng AI Dubbing trong tháng. Vui lòng nâng cấp gói hoặc chờ tháng sau!',
            noCredits: true
        });
    }

    try {
        const tempDir = os.tmpdir();
        const uploadedFilePath = path.join(tempDir, `upload_${uploadId}`);

        if (!fs.existsSync(uploadedFilePath)) {
            return res.status(400).json({ error: 'Upload file not found (maybe expired?)' });
        }

        // Check if ffmpeg is available BEFORE deducting credits
        const { resolvedFFmpegPath } = await import('@/lib/ffmpeg');
        if (!resolvedFFmpegPath) {
            console.error('[Dubbing] FFmpeg not available on this server');
            return res.status(500).json({
                error: 'FFmpeg chưa được cài đặt trên server. Tính năng Dubbing tạm thời không khả dụng. Vui lòng liên hệ admin.'
            });
        }

        console.log('[Process] Processing file:', originalName, 'from', uploadedFilePath);
        console.log('[Process] FFmpeg path:', resolvedFFmpegPath);

        // Deduct 1 credit
        await prisma.user.update({
            where: { id: userId },
            data: { dubbingCredits: { decrement: 1 } }
        });

        // 1. Create Project Entry
        const project = await prisma.dubbingProject.create({
            data: {
                userId,
                videoUrl: `upload://${originalName}`, // Mark as uploaded file
                status: 'PROCESSING',
                title: originalName.replace(/\.[^/.]+$/, ''), // Remove extension
            }
        });

        // 2. Setup paths
        const videoId = uuidv4();
        const videoPath = path.join(tempDir, `${videoId}.mp4`);
        const audioPath = path.join(tempDir, `${videoId}.mp3`);

        // Rename/Move uploaded file to videoPath (handling rename across devices just in case, though tmp is usually same volume)
        // Since we are in os.tmpdir(), rename should work.
        // But to be safe, copy and unlink?
        // Actually, renameSync is atomic.
        fs.renameSync(uploadedFilePath, videoPath);

        // 3. Extract Audio (mp3) - with detailed error handling
        await new Promise<void>((resolve, reject) => {
            console.log('[Dubbing] Extracting audio from:', videoPath);
            ffmpeg(videoPath)
                .toFormat('mp3')
                .on('start', (cmd: string) => {
                    console.log('[FFmpeg] Command:', cmd);
                })
                .on('end', () => {
                    console.log('[FFmpeg] Audio extraction complete');
                    resolve();
                })
                .on('error', (err: Error) => {
                    console.error('[FFmpeg] Error:', err.message);
                    reject(new Error(`Cannot find ffmpeg: ${err.message}. Please ensure ffmpeg is installed on the server.`));
                })
                .save(audioPath);
        });

        // 4. Whisper Transcribe
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: 'whisper-1',
            response_format: 'verbose_json',
            timestamp_granularities: ['segment']
        });

        // 5. Translate Segments (GPT-4o-mini)
        const segments = transcription.segments || [];
        const segmentsText = segments.map((s, i) => `${i}|${s.text}`).join('\n');

        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a professional subtitle translator. Translate the following lines to Vietnamese. Keep the ID prefix (e.g. '0|Text'). Only return the translated lines." },
                { role: "user", content: segmentsText }
            ]
        });

        const translatedTextRaw = gptResponse.choices[0].message.content || "";
        const translatedMap: Record<string, string> = {};

        translatedTextRaw.split('\n').forEach(line => {
            const parts = line.split('|');
            if (parts.length >= 2) {
                const index = parts[0];
                const text = parts.slice(1).join('|').trim();
                translatedMap[index] = text;
            }
        });

        // Merge back
        const finalSegments = segments.map((s, i) => ({
            id: i,
            start: s.start,
            end: s.end,
            original: s.text,
            translated: translatedMap[i.toString()] || s.text
        }));

        const savedVideoName = `src_${project.id}.mp4`;

        // 7. Update DB
        await prisma.dubbingProject.update({
            where: { id: project.id },
            data: {
                status: 'COMPLETED',
                transcript: finalSegments as any,
                duration: Math.round(transcription.duration || 0),
                videoUrl: `/temp/${savedVideoName}` // Update to local path
            }
        });

        // Clean up temp files
        try {
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);
        } catch { }

        res.status(200).json({
            ok: true,
            projectId: project.id,
            segments: finalSegments,
            videoUrl: `/temp/${savedVideoName}`
        });

    } catch (error: any) {
        console.error('Process Error:', error);
        res.status(500).json({ error: error.message });
    }
}

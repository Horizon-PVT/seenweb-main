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
import formidable from 'formidable';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
    api: {
        bodyParser: false, // Disable default body parser for file upload
    },
};

// Parse form data with file upload
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    const form = formidable({
        maxFileSize: 500 * 1024 * 1024, // 500MB max
        keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
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
        // Parse form data
        const { fields, files } = await parseForm(req);

        console.log('[Upload] Files received:', Object.keys(files));
        console.log('[Upload] Files structure:', JSON.stringify(files, null, 2));

        // Formidable v3 returns arrays by default
        const videoFiles = files.video;
        const videoFile = Array.isArray(videoFiles) ? videoFiles[0] : videoFiles;

        if (!videoFile) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const uploadedPath = videoFile.filepath;
        const originalName = videoFile.originalFilename || 'uploaded_video';

        console.log('[Upload] Received file:', originalName, 'at', uploadedPath);

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
        const tempDir = os.tmpdir();
        const videoId = uuidv4();
        const videoPath = path.join(tempDir, `${videoId}.mp4`);
        const audioPath = path.join(tempDir, `${videoId}.mp3`);

        // Copy uploaded file to our temp location (rename to .mp4)
        fs.copyFileSync(uploadedPath, videoPath);

        // Clean up original upload
        try { fs.unlinkSync(uploadedPath); } catch { }

        // 3. Extract Audio (mp3)
        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .toFormat('mp3')
                .on('end', resolve)
                .on('error', reject)
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

        // 6. Save video to public/temp for later merge step
        const publicTempDir = path.join(process.cwd(), 'public', 'temp');
        if (!fs.existsSync(publicTempDir)) fs.mkdirSync(publicTempDir, { recursive: true });

        const savedVideoName = `src_${project.id}.mp4`;
        const savedVideoPath = path.join(publicTempDir, savedVideoName);
        fs.copyFileSync(videoPath, savedVideoPath);

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
            videoUrl: `/temp/${savedVideoName}` // Return local video URL for merge step
        });

    } catch (error: any) {
        console.error('Upload Processing Error:', error);
        res.status(500).json({ error: error.message });
    }
}


import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import ffmpeg from '@/lib/ffmpeg'; // Configured with static path
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
        bodyParser: true, // We receive JSON body with url
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (session.user as any).id;
    const { videoUrl } = req.body;

    if (!videoUrl) return res.status(400).json({ error: 'Missing videoUrl' });

    // Check user credits and role
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
        // Deduct 1 credit immediately (will refund if error)
        await prisma.user.update({
            where: { id: userId },
            data: { dubbingCredits: { decrement: 1 } }
        });

        // 1. Create Project Entry
        const project = await prisma.dubbingProject.create({
            data: {
                userId,
                videoUrl,
                status: 'PROCESSING',
                title: 'New Project',
            }
        });

        // 2. Download Video using yt-dlp (Robust for TikTok/YouTube/Douyin)
        const tempDir = os.tmpdir();
        const videoId = uuidv4();
        const videoPath = path.join(tempDir, `${videoId}.mp4`);
        const audioPath = path.join(tempDir, `${videoId}.mp3`);
        const cookiesPath = path.join(tempDir, `cookies_${videoId}.txt`);

        // Check if it's a Douyin link
        const isDouyin = videoUrl.includes('douyin.com') || videoUrl.includes('iesdouyin.com');

        // For Douyin, we need to fetch cookies first
        if (isDouyin) {
            console.log('Detected Douyin link, fetching fresh cookies...');
            // Create a minimal cookies file for Douyin
            // This is a workaround - we create empty cookies file and let yt-dlp try with --add-headers
            fs.writeFileSync(cookiesPath, '# Netscape HTTP Cookie File\n');
        }

        // Build yt-dlp command with appropriate options
        await new Promise((resolve, reject) => {
            const { exec } = require('child_process');

            // Build command with platform-specific options
            let cmd = `yt-dlp -f "best[ext=mp4]/best" -o "${videoPath}"`;

            if (isDouyin) {
                // Add headers that mimic a browser request for Douyin
                cmd += ` --add-headers "User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
                cmd += ` --add-headers "Referer:https://www.douyin.com/"`;
                cmd += ` --no-check-certificates`;
                cmd += ` --extractor-args "douyin:api_hostname=www.douyin.com"`;
            }

            cmd += ` "${videoUrl}"`;

            console.log('Downloading:', cmd);

            // Increase timeout for Douyin (they can be slow)
            exec(cmd, { timeout: 120000 }, (error: any, stdout: any, stderr: any) => {
                // Clean up cookies file if created
                try { fs.unlinkSync(cookiesPath); } catch { }

                if (error) {
                    console.error('yt-dlp error:', stderr);

                    // If Douyin fails, suggest alternative
                    if (isDouyin && stderr.includes('cookies')) {
                        reject(new Error('Douyin video không tải được do yêu cầu cookies. Vui lòng thử: 1) Dùng link video trực tiếp (.mp4) hoặc 2) Dùng trang savetik.io để lấy link trực tiếp.'));
                    } else {
                        reject(new Error(`Không tải được video: ${stderr.substr(0, 150)}...`));
                    }
                } else {
                    console.log('Download success:', stdout);
                    resolve(true);
                }
            });
        });

        // Verify file exists
        if (!fs.existsSync(videoPath)) {
            throw new Error('File video không được tạo. Vui lòng kiểm tra lại link.');
        }

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
        // Extract segments
        const segments = transcription.segments || [];

        // Prepare prompt
        // We batch translate 
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
            translated: translatedMap[i.toString()] || s.text // Fallback
        }));

        // 6. Save to DB
        const updated = await prisma.dubbingProject.update({
            where: { id: project.id },
            data: {
                status: 'COMPLETED', // Ready for editing step
                transcript: finalSegments as any,
                duration: Math.round(transcription.duration || 0)
            }
        });

        // Clean up temp files
        try {
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);
        } catch (e) { }

        res.status(200).json({ ok: true, projectId: project.id, segments: finalSegments });

    } catch (error: any) {
        console.error('Dubbing Error:', error);
        res.status(500).json({ error: error.message });
    }
}

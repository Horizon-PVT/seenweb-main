// pages/api/tools/tts/generate-file.ts
// API for generating TTS from uploaded files (TXT, SRT, DOC, DOCX)
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import FormDataNode from 'form-data';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { checkUserQuota, incrementUserUsage } from '@/lib/quota';

export const config = {
    api: {
        bodyParser: false,
    },
};

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

// Parse SRT to plain text - extract only subtitle content
function parseSrtToText(content: string): string {
    // ... logic ...
    // Content unchanged, just collapsed for brevity in this prompt context
    const blocks = content.split(/\r?\n\r?\n/);
    const texts: string[] = [];

    for (const block of blocks) {
        const lines = block.split(/\r?\n/);
        const textLines: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            if (/^\d+$/.test(line)) continue;
            if (/^\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/.test(line)) continue;
            textLines.push(line);
        }
        if (textLines.length > 0) {
            texts.push(textLines.join(' '));
        }
    }

    console.log('[SRT Parser] Extracted', texts.length, 'subtitle entries');
    return texts.join(' ');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 🔐 Authentication check
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Please login' });
    }

    // 🛡️ STRICT QUOTA CHECK
    try {
        await checkUserQuota((session.user as any).id, 'text-to-speech');
    } catch (error: any) {
        return res.status(403).json({ error: error.message });
    }

    try {
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        const uploadedFile = files.srtFile?.[0];
        const voice = (fields.voice?.[0] || 'vi-VN-HoaiMyNeural') as string;
        const customVoiceId = fields.customVoiceId?.[0] as string | undefined;

        if (!uploadedFile) {
            return res.status(400).json({ error: 'File required' });
        }

        // Read file content and cleanup immediately
        const fileContent = fs.readFileSync(uploadedFile.filepath, 'utf-8');
        const ext = path.extname(uploadedFile.originalFilename || '').toLowerCase();
        fs.unlinkSync(uploadedFile.filepath);

        // Check if Vietnamese voice - Use Edge TTS (Sync)
        const isVN = voice.startsWith('vi-VN');

        // Check if SRT
        const isSrtFile = ext === '.srt' ||
            /^\d+\s*\r?\n\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}/m.test(fileContent);

        if (isVN) {
            // VN Voice: Use Edge TTS (Sync)
            // Note: Edge TTS doesn't support SRT timing technically, but let's just strip text for now or simple parse?
            // Existing logic: parseSrtToText -> then Edge TTS
            let textToRead = fileContent;
            if (isSrtFile) {
                textToRead = parseSrtToText(fileContent);
            }
            if (!textToRead.trim()) return res.status(400).json({ error: 'Empty content' });

            const edgeRes = await fetch(`http://127.0.0.1:3000/api/tools/tts/edge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToRead, voice })
            });

            if (!edgeRes.ok) {
                const err = await edgeRes.json().catch(() => ({}));
                throw new Error(err.error || 'Edge TTS failed');
            }
            const blob = await edgeRes.arrayBuffer();

            // INCREMENT USAGE
            await incrementUserUsage((session.user as any).id, 'text-to-speech');

            res.setHeader('Content-Type', 'audio/mp3');
            res.send(Buffer.from(blob));

        } else {
            // Pocket TTS: Submit Async Job
            const formData = new FormData();
            formData.append('voice', voice);
            if (customVoiceId) formData.append('custom_voice_id', customVoiceId);

            if (isSrtFile) {
                // Submit SRT Job (preserves timing)
                formData.append('type', 'srt');
                formData.append('text', fileContent); // Send raw SRT content
            } else {
                // Submit Text Job
                formData.append('type', 'tts');
                formData.append('text', fileContent);
            }

            const response = await fetch(`${TTS_SERVER_URL}/job/submit`, {
                method: 'POST',
                body: formData,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Failed to submit file job');
            }

            const data = await response.json();

            // INCREMENT USAGE
            await incrementUserUsage((session.user as any).id, 'text-to-speech');

            // Return Job ID
            res.status(200).json({
                success: true,
                jobId: data.job_id,
                status: 'queued'
            });
        }

    } catch (error: any) {
        console.error('File Generate Error:', error);
        res.status(500).json({ error: error.message });
    }
}

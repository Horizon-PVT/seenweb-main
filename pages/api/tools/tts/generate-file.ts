// pages/api/tools/tts/generate-file.ts
// API for generating TTS from uploaded files (TXT, SRT, DOC, DOCX)
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import FormDataNode from 'form-data';
import axios from 'axios';

export const config = {
    api: {
        bodyParser: false,
    },
};

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

// Parse SRT to plain text - extract only subtitle content
function parseSrtToText(content: string): string {
    // Split by double newline to get each subtitle block
    const blocks = content.split(/\r?\n\r?\n/);
    const texts: string[] = [];

    for (const block of blocks) {
        const lines = block.split(/\r?\n/);
        // Skip first line (index number) and second line (timestamp)
        // Collect remaining lines as subtitle text
        const textLines: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Skip if empty
            if (!line) continue;
            // Skip if it's just a number (index)
            if (/^\d+$/.test(line)) continue;
            // Skip if it's a timestamp line
            if (/^\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/.test(line)) continue;
            // This is actual subtitle text
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

    try {
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        const uploadedFile = files.srtFile?.[0];
        const voice = (fields.voice?.[0] || 'vi-VN-HoaiMyNeural') as string;
        const customVoiceId = fields.customVoiceId?.[0] as string | undefined;

        if (!uploadedFile) {
            return res.status(400).json({ error: 'File required' });
        }

        // Read file content
        const fileContent = fs.readFileSync(uploadedFile.filepath, 'utf-8');
        const ext = path.extname(uploadedFile.originalFilename || '').toLowerCase();
        const originalFilename = uploadedFile.originalFilename || '';

        // Check if this is an SRT file (by extension or content)
        const isSrtFile = ext === '.srt' ||
            /^\d+\s*\r?\n\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}/m.test(fileContent);

        // Check if Vietnamese voice (use Edge TTS API - no timing support)
        const isVN = voice.startsWith('vi-VN');

        // For SRT files with non-Vietnamese voice, use the special /generate-srt endpoint
        // This preserves timing information!
        if (isSrtFile && !isVN) {
            console.log('[SRT Handler] Using /generate-srt endpoint for timing-synced audio');

            // Use Node.js form-data with axios for proper multipart upload
            // Read file as Buffer instead of stream for more reliable upload
            const fileBuffer = fs.readFileSync(uploadedFile.filepath);
            const formData = new FormDataNode();
            formData.append('srt_file', fileBuffer, {
                filename: originalFilename || 'subtitle.srt',
                contentType: 'text/plain'
            });
            formData.append('voice', customVoiceId || voice);
            if (customVoiceId) {
                formData.append('custom_voice_id', customVoiceId);
            }

            // Cleanup temp file before request (we already have the buffer)
            fs.unlinkSync(uploadedFile.filepath);

            try {
                console.log(`[SRT Handler] Sending to: ${TTS_SERVER_URL}/generate-srt`);
                const response = await axios.post(`${TTS_SERVER_URL}/generate-srt`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                        'ngrok-skip-browser-warning': 'true'
                    },
                    responseType: 'arraybuffer',
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: 300000 // 5 minutes timeout
                });

                console.log(`[SRT Handler] Received ${response.data.length} bytes`);
                res.setHeader('Content-Type', 'audio/wav');
                res.setHeader('Content-Disposition', `attachment; filename="srt_synced_${Date.now()}.wav"`);
                res.send(Buffer.from(response.data));
                return;
            } catch (axiosError: any) {
                const errorMsg = axiosError.response?.data
                    ? Buffer.from(axiosError.response.data).toString('utf-8')
                    : axiosError.message;
                console.error('[SRT Handler] Error:', errorMsg);
                throw new Error(`SRT generation failed: ${errorMsg}`);
            }
        }

        // For non-SRT files or Vietnamese voice, extract text content
        let textContent: string;
        if (isSrtFile) {
            textContent = parseSrtToText(fileContent);
        } else if (ext === '.txt') {
            textContent = fileContent;
        } else {
            fs.unlinkSync(uploadedFile.filepath);
            return res.status(400).json({ error: 'Chỉ hỗ trợ file .txt và .srt. Vui lòng Save As .txt nếu dùng Word.' });
        }

        // Cleanup temp file
        fs.unlinkSync(uploadedFile.filepath);

        if (!textContent.trim()) {
            return res.status(400).json({ error: 'File is empty or could not be parsed' });
        }

        if (isVN) {
            // Use Edge TTS for Vietnamese (no timing support available)
            const edgeRes = await fetch(`http://127.0.0.1:3000/api/tools/tts/edge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textContent, voice })
            });

            if (!edgeRes.ok) {
                const errData = await edgeRes.json().catch(() => ({}));
                throw new Error(errData.error || 'Edge TTS failed');
            }

            const audioBuffer = await edgeRes.arrayBuffer();
            res.setHeader('Content-Type', 'audio/mp3');
            res.setHeader('Content-Disposition', `attachment; filename="audio_${Date.now()}.mp3"`);
            res.send(Buffer.from(audioBuffer));
        } else {
            // Use Pocket TTS for regular text
            const formData = new FormData();
            formData.append('text', textContent);
            formData.append('voice', customVoiceId || voice);
            if (customVoiceId) {
                formData.append('custom_voice_id', customVoiceId);
            }

            const response = await fetch(`${TTS_SERVER_URL}/generate`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Server error');
            }

            const audioBuffer = await response.arrayBuffer();
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Content-Disposition', `attachment; filename="audio_${Date.now()}.wav"`);
            res.send(Buffer.from(audioBuffer));
        }

    } catch (error: any) {
        console.error('File Generate Error:', error);
        res.status(500).json({ error: error.message });
    }
}

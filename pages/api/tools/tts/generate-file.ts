// pages/api/tools/tts/generate-file.ts
// API for generating TTS from uploaded files (TXT, SRT, DOC, DOCX)
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

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

        // Parse based on file type
        let textContent: string;
        if (ext === '.srt') {
            textContent = parseSrtToText(fileContent);
        } else if (ext === '.txt') {
            // Check if TXT file actually contains SRT content
            if (/^\d+\s*\r?\n\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/m.test(fileContent)) {
                console.log('[File Parser] Detect SRT content in .txt file');
                textContent = parseSrtToText(fileContent);
            } else {
                textContent = fileContent;
            }
        } else {
            return res.status(400).json({ error: 'Chỉ hỗ trợ file .txt và .srt. Vui lòng Save As .txt nếu dùng Word.' });
        }

        // Cleanup temp file
        fs.unlinkSync(uploadedFile.filepath);

        if (!textContent.trim()) {
            return res.status(400).json({ error: 'File is empty or could not be parsed' });
        }

        // Check if Vietnamese voice (use Edge TTS API)
        const isVN = voice.startsWith('vi-VN');

        if (isVN) {
            // Use Edge TTS for Vietnamese
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
            // Use Pocket TTS (Railway server)
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

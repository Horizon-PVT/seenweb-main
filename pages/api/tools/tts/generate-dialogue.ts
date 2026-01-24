// pages/api/tools/tts/generate-dialogue.ts
// API for 2-person dialogue TTS generation
import type { NextApiRequest, NextApiResponse } from 'next';

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, voice1, voice2, speed } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Parse [A] and [B] markers
        const pattern = /\[(A|B)\]\s*([\s\S]*?)(?=\[[AB]\]|$)/g;
        const segments: { speaker: 'A' | 'B', text: string }[] = [];
        let match;

        while ((match = pattern.exec(text)) !== null) {
            const speaker = match[1] as 'A' | 'B';
            const content = match[2].trim();
            if (content) {
                segments.push({ speaker, text: content });
            }
        }

        if (segments.length === 0) {
            return res.status(400).json({
                error: 'Không tìm thấy markers [A] hoặc [B]. Vui lòng dùng định dạng: [A] text... [B] text...'
            });
        }

        // Check if voices are Vietnamese Edge TTS
        const isVoice1VN = voice1?.startsWith('vi-VN');
        const isVoice2VN = voice2?.startsWith('vi-VN');

        // Generate audio for each segment
        const audioBuffers: ArrayBuffer[] = [];

        for (const segment of segments) {
            const voice = segment.speaker === 'A' ? voice1 : voice2;
            const isVN = segment.speaker === 'A' ? isVoice1VN : isVoice2VN;

            let response;
            if (isVN) {
                // Use Edge TTS for Vietnamese
                response = await fetch(`${TTS_SERVER_URL.replace('seenweb-main-production.up.railway.app', '127.0.0.1:3000')}/api/tools/tts/edge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: segment.text,
                        voice: voice,
                        rate: speed ? Math.round((speed - 1) * 100) : 0
                    })
                });
            } else {
                // Use Pocket TTS
                const formData = new FormData();
                formData.append('text', segment.text);
                formData.append('voice', voice || 'alba');

                response = await fetch(`${TTS_SERVER_URL}/generate`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
            }

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Failed to generate segment: ${errText}`);
            }

            const buffer = await response.arrayBuffer();
            audioBuffers.push(buffer);
        }

        // For now, return just the first segment (TODO: implement audio concatenation)
        // In production, we'd use ffmpeg or similar to concatenate
        if (audioBuffers.length === 1) {
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Content-Disposition', `attachment; filename="dialogue_${Date.now()}.wav"`);
            res.send(Buffer.from(audioBuffers[0]));
        } else {
            // Simple approach: send to server for concatenation
            const formData = new FormData();
            formData.append('text', text);
            formData.append('voice1', voice1);
            formData.append('voice2', voice2);
            if (speed) formData.append('speed', speed.toString());

            const response = await fetch(`${TTS_SERVER_URL}/generate-dialogue`, {
                method: 'POST',
                body: formData,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                throw new Error('Server dialogue generation failed');
            }

            const audioBuffer = await response.arrayBuffer();
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Content-Disposition', `attachment; filename="dialogue_${Date.now()}.wav"`);
            res.send(Buffer.from(audioBuffer));
        }

    } catch (error: any) {
        console.error('Dialogue Generate Error:', error);
        res.status(500).json({ error: error.message });
    }
}

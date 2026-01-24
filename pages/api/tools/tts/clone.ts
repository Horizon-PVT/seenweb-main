// pages/api/tools/tts/clone.ts
// API endpoint to clone a voice from audio file
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import fs from 'fs';

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

export const config = {
    api: {
        bodyParser: false // Disable for file upload
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check auth
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email && process.env.NODE_ENV !== 'development') {
            return res.status(401).json({ error: 'Please login to clone voices' });
        }

        // Check user role
        let user;
        if (session?.user?.email) {
            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true, role: true }
            });
        }

        const isPro = (process.env.NODE_ENV === 'development')
            ? true
            : (user && ['CREATIVE', 'SUPER', 'VIP', 'ADMIN'].includes(user.role));

        if (!isPro) {
            return res.status(403).json({
                error: 'Voice cloning is a PRO feature. Upgrade to unlock!',
                upgrade: true
            });
        }

        // Parse form data
        const form = formidable({ maxFileSize: 50 * 1024 * 1024 }); // 50MB max
        const [fields, files] = await form.parse(req);

        const audioFile = files.audio?.[0];
        const voiceName = fields.name?.[0] || 'My Voice';

        if (!audioFile) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        // Read file
        const fileBuffer = fs.readFileSync(audioFile.filepath);

        // Sanitize WAV using wavefile
        let finalBuffer = fileBuffer;
        try {
            const { WaveFile } = require('wavefile');
            const wav = new WaveFile(fileBuffer);
            wav.toBitDepth('16'); // Normalize to 16-bit
            finalBuffer = wav.toBuffer();
            console.log("Audio sanitized with wavefile");
        } catch (e) {
            console.warn("Wavefile sanitization failed (might not be WAV):", e);
            // Fallback to original buffer
        }

        const formData = new FormData();
        // Append Blob
        const blob = new Blob([finalBuffer], { type: audioFile.mimetype || 'audio/wav' });

        // Normalize filename to use lowercase extension (to avoid server case-sensitivity issues)
        let filename = audioFile.originalFilename || 'voice.wav';
        const extMatch = filename.match(/\.([0-9a-z]+)$/i);
        if (extMatch) {
            const ext = extMatch[1].toLowerCase();
            filename = filename.replace(/\.[0-9a-z]+$/i, `.${ext}`);
        } else {
            // If no extension, append based on mimetype or default to .wav
            const mimeExt = audioFile.mimetype?.split('/')[1] || 'wav';
            filename = `${filename}.${mimeExt === 'mpeg' ? 'mp3' : mimeExt}`;
        }

        formData.append('audio_file', blob, filename);
        formData.append('name', voiceName);

        const cloneResponse = await fetch(`${TTS_SERVER_URL}/clone`, {
            method: 'POST',
            body: formData as any
        });

        if (!cloneResponse.ok) {
            const error = await cloneResponse.text();
            throw new Error(`Clone Error from Server: ${error}`);
        }

        const result = await cloneResponse.json();

        // Save voice to DB for persistence
        if (user) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

            await prisma.userVoice.upsert({
                where: { voiceId: result.voice_id },
                update: {
                    name: voiceName,
                    expiresAt: expiresAt
                },
                create: {
                    userId: user.id,
                    voiceId: result.voice_id,
                    name: voiceName,
                    expiresAt: expiresAt
                }
            });
        }

        res.status(200).json({
            success: true,
            voiceId: result.voice_id,
            name: voiceName,
            message: 'Voice cloned successfully! Saved for 30 days.',
            result: result
        });

    } catch (error: any) {
        console.error('Voice Clone Error:', error);
        res.status(500).json({ error: error.message || 'Voice cloning failed' });
    }
}

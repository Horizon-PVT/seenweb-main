// pages/api/tools/tts/voices.ts
// API endpoint to list available TTS voices
import type { NextApiRequest, NextApiResponse } from 'next';

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'https://seenweb-main-production.up.railway.app';

// Preset voices with Vietnamese descriptions
const VOICE_INFO = {
    alba: { name: 'Alba', gender: 'female', accent: 'Scottish', description: 'Giọng nữ trầm ấm, phong cách tự nhiên' },
    marius: { name: 'Marius', gender: 'male', accent: 'American', description: 'Giọng nam trẻ, năng động' },
    javert: { name: 'Javert', gender: 'male', accent: 'British', description: 'Giọng nam trầm, quyền uy' },
    jean: { name: 'Jean', gender: 'male', accent: 'French', description: 'Giọng nam nhẹ nhàng, thân thiện' },
    fantine: { name: 'Fantine', gender: 'female', accent: 'British', description: 'Giọng nữ thanh, cảm xúc' },
    cosette: { name: 'Cosette', gender: 'female', accent: 'American', description: 'Giọng nữ trẻ, trong sáng' },
    eponine: { name: 'Eponine', gender: 'female', accent: 'British', description: 'Giọng nữ mạnh mẽ, cá tính' },
    azelma: { name: 'Azelma', gender: 'female', accent: 'American', description: 'Giọng nữ chuyên nghiệp, rõ ràng' }
};

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Get Hardcoded Voices
        const hardcodedVoices = Object.entries(VOICE_INFO).map(([id, info]) => ({
            id,
            ...info,
            type: 'preset'
        }));

        // 2. Fetch User's Custom Voices from DB
        let customVoices: any[] = [];
        const session = await getServerSession(req, res, authOptions);

        if (session?.user?.email) {
            // Find user first to get ID
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });

            if (user) {
                const userVoices = await prisma.userVoice.findMany({
                    where: { userId: user.id },
                    orderBy: { createdAt: 'desc' }
                });

                customVoices = userVoices.map(v => ({
                    id: v.voiceId,
                    name: v.name,
                    type: 'custom',
                    expiresAt: v.expiresAt
                }));
            }
        }

        // 3. Merge
        const allVoices = [...customVoices, ...hardcodedVoices];

        res.status(200).json({
            voices: allVoices,
            supportsCloning: true,
            cloningNote: 'Upload 5-10 giây audio để clone giọng nói riêng của bạn'
        });

    } catch (error: any) {
        console.error('Voices API Error:', error);
        res.status(500).json({ error: 'Failed to fetch voices' });
    }
}

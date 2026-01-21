// pages/api/tools/tts/voices.ts
// API endpoint to list available TTS voices
import type { NextApiRequest, NextApiResponse } from 'next';

const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'http://localhost:8000';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Return preset voices with descriptions
        const voices = Object.entries(VOICE_INFO).map(([id, info]) => ({
            id,
            ...info
        }));

        res.status(200).json({
            voices,
            supportsCloning: true,
            cloningNote: 'Upload 5-10 giây audio để clone giọng nói riêng của bạn'
        });

    } catch (error: any) {
        console.error('Voices API Error:', error);
        res.status(500).json({ error: 'Failed to fetch voices' });
    }
}

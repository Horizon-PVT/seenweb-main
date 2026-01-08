// lib/fptTTS.ts - FPT.AI Text-to-Speech Integration (Optimized for Vercel)
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// FPT.AI TTS API endpoint
const FPT_TTS_API_URL = 'https://api.fpt.ai/hmi/tts/v5';

// Available FPT.AI Vietnamese voices
export const FPT_VOICES = [
    // Female voices
    { id: 'banmai', name: '👩 Ban Mai', gender: 'female', region: 'Bắc', description: 'Giọng nữ miền Bắc trẻ trung' },
    { id: 'thuminh', name: '👩 Thu Minh', gender: 'female', region: 'Bắc', description: 'Giọng nữ miền Bắc chuẩn' },
    { id: 'leminh', name: '👩 Lệ Minh', gender: 'female', region: 'Trung', description: 'Giọng nữ miền Trung' },
    { id: 'myan', name: '👩 Mỹ An', gender: 'female', region: 'Nam', description: 'Giọng nữ miền Nam' },
    { id: 'lan', name: '👩 Lan', gender: 'female', region: 'Nam', description: 'Giọng nữ miền Nam trẻ' },
    { id: 'linh', name: '👩 Linh', gender: 'female', region: 'Bắc', description: 'Giọng nữ Hà Nội' },

    // Male voices  
    { id: 'minhquang', name: '👨 Minh Quang', gender: 'male', region: 'Bắc', description: 'Giọng nam miền Bắc' },
    { id: 'linhsan', name: '👨 Linh San', gender: 'male', region: 'Nam', description: 'Giọng nam miền Nam' },
    { id: 'gia_huy', name: '👨 Gia Huy', gender: 'male', region: 'Trung', description: 'Giọng nam miền Trung' },
];

export interface FPTTTSOptions {
    voice?: string;
    speed?: number; // -3 to 3, default 0
}

/**
 * Synthesize text to speech using FPT.AI TTS API
 * Optimized for Vercel serverless with shorter timeouts
 * @param text Text to synthesize
 * @param outputPath Output file path
 * @param options Voice and speed options
 * @returns Path to the generated audio file
 */
export async function synthesizeFPT(
    text: string,
    outputPath: string,
    options: FPTTTSOptions = {}
): Promise<string> {
    const apiKey = process.env.FPT_TTS_API_KEY;

    if (!apiKey) {
        throw new Error('FPT_TTS_API_KEY not configured');
    }

    const voice = options.voice || 'banmai';
    // FPT uses speed from -3 to 3 (0 = normal)
    // Convert from 0.5-2.0 range to -3 to 3
    const speedMultiplier = options.speed || 1.0;
    const fptSpeed = Math.round((speedMultiplier - 1) * 6); // 0.5 -> -3, 1.0 -> 0, 2.0 -> 3

    try {
        console.log(`[FPT TTS] Request: voice=${voice}, speed=${fptSpeed}, text="${text.substring(0, 50)}..."`);

        // Make API request with shorter timeout for serverless
        const response = await axios.post(
            FPT_TTS_API_URL,
            text,
            {
                headers: {
                    'api-key': apiKey,
                    'voice': voice,
                    'speed': fptSpeed.toString(),
                    'Content-Type': 'text/plain; charset=utf-8',
                },
                timeout: 10000, // 10s timeout for initial request
            }
        );

        console.log('[FPT TTS] Response:', JSON.stringify(response.data));

        // FPT returns async URL, need to download
        const audioUrl = response.data?.async;

        if (!audioUrl) {
            // Try getting error message from response
            const errorMsg = response.data?.error || response.data?.message || 'No audio URL returned';
            throw new Error(`FPT TTS error: ${errorMsg}`);
        }

        // Download the audio file with FASTER retry logic for Vercel (max ~6 seconds)
        // Reduced from 8 retries to 4, and shorter wait times
        let audioResponse = null;
        const MAX_RETRIES = 4;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            // Wait times: 1.5s, 2s, 2s, 2s (total max ~7.5s)
            const waitTime = attempt === 0 ? 1500 : 2000;
            await new Promise(resolve => setTimeout(resolve, waitTime));

            try {
                audioResponse = await axios.get(audioUrl, {
                    responseType: 'arraybuffer',
                    timeout: 5000, // 5s timeout per download attempt
                });
                break; // Success, exit loop
            } catch (downloadError: any) {
                console.warn(`[FPT TTS] Download attempt ${attempt + 1}/${MAX_RETRIES} failed: ${downloadError.message}`);
                if (attempt === MAX_RETRIES - 1) {
                    // Last attempt failed - throw specific error for fallback
                    throw new Error(`FPT CDN timeout after ${MAX_RETRIES} attempts`);
                }
            }
        }

        if (!audioResponse) {
            throw new Error('Failed to download audio after retries');
        }

        // Ensure output directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write to file
        fs.writeFileSync(outputPath, Buffer.from(audioResponse.data));

        console.log(`[FPT TTS] Generated audio: ${outputPath}`);
        return outputPath;

    } catch (error: any) {
        console.error('[FPT TTS] Error:', error.message);
        if (error.response) {
            console.error('[FPT TTS] Status:', error.response.status);
            console.error('[FPT TTS] Response Data:', JSON.stringify(error.response.data));
        }
        throw new Error(`FPT TTS failed: ${error.message}`);
    }
}

/**
 * Check if a voice ID is an FPT premium voice
 */
export function isFPTVoice(voiceId: string): boolean {
    return FPT_VOICES.some(v => v.id === voiceId);
}

/**
 * Get all available voices (Edge + FPT)
 */
export function getAllVoices() {
    const edgeVoices = [
        { id: 'vi-VN-HoaiMyNeural', name: '👩 Nữ - Hoài My', gender: 'female', provider: 'edge', isPremium: false },
        { id: 'vi-VN-NamMinhNeural', name: '👨 Nam - Nam Minh', gender: 'male', provider: 'edge', isPremium: false },
    ];

    const fptVoicesFormatted = FPT_VOICES.map(v => ({
        ...v,
        provider: 'fpt',
        isPremium: true,
    }));

    return [...edgeVoices, ...fptVoicesFormatted];
}

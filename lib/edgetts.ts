// File: lib/edgetts.ts - Using edge-tts-universal package
import { EdgeTTS as EdgeTTSClient } from 'edge-tts-universal';
import fs from 'fs';
import path from 'path';

export class EdgeTTS {
    /**
     * Synthesize text to speech using edge-tts-universal package.
     * @param text Text to synthesize
     * @param voice Voice key (e.g., 'vi-VN-HoaiMyNeural')
     * @param outputPath Output file path
     * @param rate Speed multiplier (e.g., 1.0 = normal, 1.2 = 20% faster)
     * @param outputFormat Format string (ignored, always MP3)
     */
    static async synthesize(text: string, voice: string = 'vi-VN-HoaiMyNeural', outputPath: string, rate: number = 1.0, outputFormat: string = 'audio-24khz-48kbitrate-mono-mp3'): Promise<string> {
        // Ensure output dir exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Calculate rate percentage for edge-tts (e.g., +20%, -10%)
        const ratePercent = Math.round((rate - 1) * 100);
        const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

        // Create TTS client with text, voice, and options in constructor
        const tts = new EdgeTTSClient(text, voice, {
            rate: rateStr,
        });

        // Synthesize - returns { audio: Blob, subtitle: [] }
        const result = await tts.synthesize();

        // Convert Blob to Buffer and write to file
        const arrayBuffer = await result.audio.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        fs.writeFileSync(outputPath, audioBuffer);

        return outputPath;
    }

    /**
     * Get available Vietnamese voices
     */
    static async getVoices() {
        return [
            { ShortName: 'vi-VN-HoaiMyNeural', Gender: 'Female' },
            { ShortName: 'vi-VN-NamMinhNeural', Gender: 'Male' }
        ];
    }
}

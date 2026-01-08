// File: lib/edgetts.ts - Using edge-tts-universal Communicate class (more reliable)
import { Communicate } from 'edge-tts-universal';
import fs from 'fs';
import path from 'path';

export class EdgeTTS {
    /**
     * Synthesize text to speech using edge-tts-universal Communicate class.
     * This method streams audio chunks and combines them.
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

        // Use Communicate class which uses streaming (more reliable)
        const communicate = new Communicate(text, {
            voice: voice,
            rate: rateStr,
        });

        // Collect all audio chunks
        const audioChunks: Buffer[] = [];

        try {
            for await (const chunk of communicate.stream()) {
                if (chunk.type === 'audio' && chunk.data) {
                    audioChunks.push(Buffer.from(chunk.data));
                }
            }
        } catch (error: any) {
            console.error('[EdgeTTS] Stream error:', error.message);
            throw new Error(`Edge TTS failed: ${error.message}`);
        }

        if (audioChunks.length === 0) {
            throw new Error('Edge TTS: No audio data received');
        }

        // Combine all chunks and write to file
        const audioBuffer = Buffer.concat(audioChunks);
        fs.writeFileSync(outputPath, audioBuffer);

        console.log(`[EdgeTTS] Generated audio: ${outputPath} (${audioBuffer.length} bytes)`);
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

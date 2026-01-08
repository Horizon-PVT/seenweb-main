
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export class EdgeTTS {
    /**
     * Synthesize text to speech using edge-tts CLI.
     * @param text Text to synthesize
     * @param voice Voice key (e.g., 'vi-VN-HoaiMyNeural')
     * @param outputPath Output file path
     * @param rate Speed multiplier (e.g., 1.0 = normal, 1.2 = 20% faster)
     */
    static async synthesize(text: string, voice: string = 'vi-VN-HoaiMyNeural', outputPath: string, rate: number = 1.0): Promise<string> {
        // Ensure output dir exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Calculate rate percentage (edge-tts uses +X% or -X% format)
        // rate 1.0 = +0%, rate 1.2 = +20%, rate 0.8 = -20%
        const ratePercent = Math.round((rate - 1) * 100);
        const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

        // Build command
        // edge-tts --voice vi-VN-HoaiMyNeural --rate "+20%" --text "Hello" --write-media hello.mp3
        const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
        const command = `edge-tts --voice ${voice} --rate "${rateStr}" --text "${escapedText}" --write-media "${outputPath}"`;

        try {
            const { stdout, stderr } = await execPromise(command);
            return outputPath;
        } catch (error) {
            console.error('TTS Error:', error);
            throw error;
        }
    }

    /**
     * Get available voices
     */
    static async getVoices() {
        // edge-tts --list-voices
        // We can hardcode popular Vietnamese voices to save time
        return [
            { ShortName: 'vi-VN-HoaiMyNeural', Gender: 'Female' },
            { ShortName: 'vi-VN-NamMinhNeural', Gender: 'Male' }
        ];
    }
}

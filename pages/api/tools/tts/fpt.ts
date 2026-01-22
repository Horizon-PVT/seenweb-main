import type { NextApiRequest, NextApiResponse } from 'next';

const FPT_API_URL = 'https://api.fpt.ai/hmi/tts/v5';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
        responseLimit: '50mb',
    },
};

// Helper: Sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Split text into chunks (~200 chars to avoid FPT timeout)
function chunkText(text: string, maxLength: number = 200): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voice = 'banmai', speed = 0, apiKey } = req.body;

    // Use API Key from Request or Env
    const finalApiKey = apiKey || process.env.FPT_TTS_API_KEY;

    if (!finalApiKey) {
        return res.status(500).json({ error: 'Missing FPT_TTS_API_KEY in server environment' });
    }

    if (!text) {
        return res.status(400).json({ error: 'Missing text' });
    }

    try {
        // 1. Chunking
        const chunks = chunkText(text);
        console.log(`[FPT] Split text into ${chunks.length} chunks (max 200 chars)`);

        const audioBuffers: Buffer[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk) continue;

            console.log(`[FPT] Processing chunk ${i + 1}/${chunks.length}: "${chunk.slice(0, 20)}..."`);

            // Call FPT
            const fptRes = await fetch(FPT_API_URL, {
                method: 'POST',
                headers: {
                    'api-key': finalApiKey,
                    'voice': voice,
                    'speed': String(speed),
                    'format': 'mp3'
                },
                body: chunk
            });

            const data = await fptRes.json();

            if (data.error !== 0) {
                console.error(`[FPT] Error chunk ${i}:`, data);
                throw new Error(data.message || `FPT API Error Code: ${data.error}`);
            }

            const audioUrl = data.async;
            if (!audioUrl) throw new Error('No audio URL returned from FPT');
            console.log(`[FPT] Async URL for chunk ${i}: ${audioUrl}`);

            // 3. Download Audio (Wait loop)
            // Timeout 60s
            let downloaded = false;
            let attempts = 0;
            let buffer: ArrayBuffer | null = null;

            while (!downloaded && attempts < 60) { // Max 60s per chunk
                attempts++;
                await sleep(1000); // Wait 1s

                const audioRequest = await fetch(audioUrl);
                if (audioRequest.ok) {
                    buffer = await audioRequest.arrayBuffer();
                    if (buffer && buffer.byteLength > 0) {
                        downloaded = true;
                    }
                }
            }

            if (downloaded && buffer) {
                audioBuffers.push(Buffer.from(buffer));
            } else {
                console.warn(`[FPT] Failed to download chunk ${i} audio after timeout`);
                throw new Error(`Timeout waiting for audio chunk ${i + 1} (FPT took > 60s). Check Console for URL.`);
            }
        }

        // 4. Merge
        const finalBuffer = Buffer.concat(audioBuffers);
        console.log(`[FPT] merged ${audioBuffers.length} chunks. Total size: ${finalBuffer.length}`);

        // 5. Return
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', finalBuffer.length);
        res.send(finalBuffer);

    } catch (err: any) {
        console.error('[FPT Error]', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}

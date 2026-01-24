import type { NextApiRequest, NextApiResponse } from 'next';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import https from 'https';


export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
        responseLimit: '50mb',
    },
};

// CONSTANTS (EDGE)
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const SEC_MS_GEC_VERSION = "1-130.0.2849.68";
const WIN_EPOCH = 11644473600;
const S_TO_NS = 1e9;

// --- Helper: Get Server Time Offset ---
async function getServerTimeOffset(): Promise<number> {
    return new Promise((resolve) => {
        const req = https.request('https://edge.microsoft.com', { method: 'HEAD', timeout: 3000 }, (res) => {
            if (res.headers.date) {
                const serverTime = new Date(res.headers.date).getTime();
                const localTime = Date.now();
                resolve(serverTime - localTime);
            } else {
                resolve(0);
            }
        });
        req.on('error', () => resolve(0));
        req.on('timeout', () => req.abort());
        req.end();
    });
}

// Generate Token
function generateSecMsGec(timeOffset: number) {
    const now = Date.now() + timeOffset;
    let ticks = (now / 1000) + WIN_EPOCH;
    ticks -= ticks % 300;
    ticks *= S_TO_NS / 100;
    const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
    return createHash("sha256").update(strToHash, "ascii").digest("hex").toUpperCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voice = 'vi-VN-HoaiMyNeural' } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Missing text' });
    }

    try {
        // 1. Try Edge TTS First
        try {
            const timeOffset = await getServerTimeOffset();
            const audioBuffer = await generateEdgeAudio(text, voice, timeOffset);

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', audioBuffer.length);
            res.setHeader('X-TTS-Provider', 'Edge');
            res.send(audioBuffer);
            return;

        } catch (edgeError: any) {
            console.warn('[Edge TTS Error] Switch to Fallback:', edgeError.message);
        }

        // 2. Fallback to Google TTS
        // Note: Google TTS API splits long text automatically? Library does.
        // 'google-tts-api' getAllAudioUrls for long text.
        // But we need to fetch and concat buffers.

        console.log('[TTS] Using Google Fallback...');
        // Google doesn't have "HoaiMy", just "vi".
        const googleLang = 'vi';

        // google-tts-api limits 200 chars. We need to split.
        // For simplicity, let's use a function that handles splitting (getAllAudioBase64).
        const { getAllAudioBase64 } = require('google-tts-api');

        const results = await getAllAudioBase64(text, {
            lang: googleLang,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        // results is array of { base64, shortText }.
        const buffers = results.map((r: any) => Buffer.from(r.base64, 'base64'));
        const finalBuffer = Buffer.concat(buffers);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', finalBuffer.length);
        res.setHeader('X-TTS-Provider', 'Google');
        res.send(finalBuffer);

    } catch (err: any) {
        console.error('[TTS Fatal Error]', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}

// --- Edge Logic ---
function generateEdgeAudio(text: string, voice: string, timeOffset: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const requestId = uuidv4().replace(/-/g, '');
        const connectionId = uuidv4().replace(/-/g, '');
        const secMsGec = generateSecMsGec(timeOffset);

        const WSS_URL = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connectionId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`;

        const ws = new WebSocket(WSS_URL, {
            origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
            }
        });

        const audioChunks: Buffer[] = [];

        ws.on('open', () => {
            const configMsg = `X-Timestamp:${new Date(Date.now() + timeOffset).toString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`;
            ws.send(configMsg);
            const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'><voice name='${voice}'>${escapeXml(text)}</voice></speak>`;
            const ssmlMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date(Date.now() + timeOffset).toString()}\r\nPath:ssml\r\n\r\n${ssml}`;
            ws.send(ssmlMsg);
        });

        ws.on('message', (data: Buffer, isBinary) => {
            if (isBinary) {
                const separator = '\r\n\r\n';
                const headerEndIndex = data.indexOf(separator);
                if (headerEndIndex > 0) {
                    const headers = data.slice(0, headerEndIndex).toString();
                    if (headers.includes('Path:audio')) audioChunks.push(data.slice(headerEndIndex + 4));
                }
            } else {
                const str = data.toString();
                if (str.includes('Path:turn.end')) ws.close();
            }
        });

        ws.on('close', () => {
            if (audioChunks.length > 0) resolve(Buffer.concat(audioChunks));
            else reject(new Error('Edge WSS closed without audio'));
        });

        ws.on('error', (err) => reject(err));

        setTimeout(() => {
            if (ws.readyState !== WebSocket.CLOSED) {
                ws.terminate();
                reject(new Error('Edge Timeout'));
            }
        }, 15000); // 15s timeout for Edge, then fallback
    });
}

function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

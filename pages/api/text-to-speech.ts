// File: pages/api/text-to-speech.ts (OpenAI Version)
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

interface TtsResponse {
  audioBase64: string;
}
interface ErrorResponse { error: string; }

const MAX_CHUNK_LENGTH = 4096; // OpenAI limit is 4096 characters per request

/**
 * Chia nhỏ văn bản thành các đoạn < MAX_CHUNK_LENGTH
 */
function splitText(text: string, limit: number): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  const sentences = text.split(/(\n+|[.!?]+\s*)/).filter(Boolean);

  let tempSentence = "";
  for (const part of sentences) {
    if (part.match(/(\n+|[.!?]+\s*)/)) {
      tempSentence += part;
    } else {
      if (tempSentence) {
        processSentence(tempSentence);
        tempSentence = "";
      }
      tempSentence = part;
    }
  }
  if (tempSentence) {
    processSentence(tempSentence);
  }

  function processSentence(sentence: string) {
    if (sentence.length > limit) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      for (let i = 0; i < sentence.length; i += limit) {
        chunks.push(sentence.substring(i, i + limit));
      }
    } else if (currentChunk.length + sentence.length + 1 > limit) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Helper: Tạo Buffer silence
 */
function createSilenceBuffer(durationMs: number): Buffer {
  if (durationMs <= 0) return Buffer.alloc(0);
  // 16-bit PCM, 24kHz => 48 bytes/ms
  const length = Math.floor(durationMs * 48);
  return Buffer.alloc(length);
}

/**
 * Helper: Parse SRT time
 */
function parseTimeStr(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m, s_ms] = timeStr.split(':');
  const [s, ms] = s_ms.split(',');
  return (+h * 3600 + +m * 60 + +s) * 1000 + +ms;
}

/**
 * Helper: Call OpenAI TTS
 */
async function callOpenAITts(openai: OpenAI, text: string, voice: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice as any,
    input: text,
    response_format: 'pcm',
  });
  return Buffer.from(await response.arrayBuffer());
}

// Function Add WAV Header
function addWavHeader(pcmData: Buffer, sampleRate: number, numChannels: number, bitDepth: number): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

// --- Main Handler ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TtsResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { mode, scriptText, srtSegments, selectedVoiceApiName } = req.body;

    if (!selectedVoiceApiName) {
      return res.status(400).json({ error: "Thiếu selectedVoiceApiName." });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Chưa cấu hình OPENAI_API_KEY." });
    }

    const openai = new OpenAI({ apiKey });
    const audioBuffers: Buffer[] = [];

    // Calculate billing
    let totalChars = 0;
    if (mode === 'srt' && Array.isArray(srtSegments)) {
      totalChars = srtSegments.reduce((acc: number, s: any) => acc + (s.text ? s.text.length : 0), 0);
    } else if (scriptText) {
      totalChars = scriptText.length;
    }

    // --- XỬ LÝ SRT (Aggressive Batching for Low Rate Limits) ---
    if (mode === 'srt' && srtSegments && Array.isArray(srtSegments)) {
      let currentAudioTimeMs = 0;

      const batches: { start: string, text: string, segments: typeof srtSegments }[] = [];
      let currentBatch: typeof srtSegments = [];

      for (let i = 0; i < srtSegments.length; i++) {
        const seg = srtSegments[i];

        if (currentBatch.length === 0) {
          currentBatch.push(seg);
          continue;
        }

        const prevSeg = currentBatch[currentBatch.length - 1];
        const prevEnd = parseTimeStr(prevSeg.end);
        const currStart = parseTimeStr(seg.start);
        const gap = currStart - prevEnd;

        // Batching Condition: Gap < 1.5s AND Batch Length < 10
        const currentTextLen = currentBatch.reduce((acc, s) => acc + s.text.length, 0);

        if (gap < 1500 && currentBatch.length < 10) {
          currentBatch.push(seg);
        } else {
          batches.push({
            start: currentBatch[0].start,
            text: currentBatch.map(s => s.text).join(" "),
            segments: currentBatch
          });
          currentBatch = [seg];
        }
      }
      if (currentBatch.length > 0) {
        batches.push({
          start: currentBatch[0].start,
          text: currentBatch.map(s => s.text).join(" "),
          segments: currentBatch
        });
      }

      console.log(`[SRT Batching] ${srtSegments.length} segments -> ${batches.length} batches.`);

      for (const batch of batches) {
        if (!batch.text.trim()) continue;

        const startTimeMs = parseTimeStr(batch.start);
        const silenceNeeded = startTimeMs - currentAudioTimeMs;
        if (silenceNeeded > 0) {
          audioBuffers.push(createSilenceBuffer(silenceNeeded));
          currentAudioTimeMs += silenceNeeded;
        }

        let success = false;
        let retries = 0;
        const MAX_RETRIES = 10;

        while (!success && retries < MAX_RETRIES) {
          try {
            const audioBuffer = await callOpenAITts(openai, batch.text, selectedVoiceApiName);
            audioBuffers.push(audioBuffer);

            const durationMs = audioBuffer.length / 48;
            currentAudioTimeMs += durationMs;
            success = true;
            await new Promise(r => setTimeout(r, 500)); // Delay to be safe

          } catch (error: any) {
            console.error(`Error processing batch ${batch.start}:`, error?.message);
            if (error?.status === 429 || error?.code === 'rate_limit_exceeded' || error?.message?.includes('429')) {
              retries++;
              let waitSeconds = 20;
              const match = error?.message?.match(/try again in (\d+(\.\d+)?)s/);
              if (match) waitSeconds = parseFloat(match[1]);

              const waitMs = (waitSeconds * 1000) + 2000;
              console.warn(`[Rate Limit] Waiting ${waitMs / 1000}s...`);
              await new Promise(r => setTimeout(r, waitMs));
            } else {
              break;
            }
          }
        }
      }
    }
    // --- XỬ LÝ TEXT THƯỜNG ---
    else {
      if (!scriptText) return res.status(400).json({ error: "Thiếu scriptText." });
      const textChunks = splitText(scriptText, MAX_CHUNK_LENGTH);
      for (const chunk of textChunks) {
        const buffer = await callOpenAITts(openai, chunk, selectedVoiceApiName);
        audioBuffers.push(buffer);
      }
    }

    // 3. Merging & Return
    const mergedBuffer = Buffer.concat(audioBuffers);

    // TRACKING USAGE
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.email && totalChars > 0) {
      // Run async, don't block
      prisma.user.update({
        where: { email: session.user.email },
        data: { ttsUsageChars: { increment: totalChars } }
      }).then(() => console.log(`[Billing] +${totalChars} chars for ${session.user.email}`))
        .catch(err => console.error("Billing update failed:", err));
    }

    const wavBuffer = addWavHeader(mergedBuffer, 24000, 1, 16);
    res.status(200).json({ audioBase64: wavBuffer.toString('base64') });

  } catch (err: any) {
    console.error("Lỗi API TTS:", err);
    res.status(500).json({ error: `Lỗi: ${err.message}` });
  }
}
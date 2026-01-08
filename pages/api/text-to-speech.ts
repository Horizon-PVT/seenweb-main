// File: pages/api/text-to-speech.ts (Multi-provider TTS: OpenAI, Edge TTS, FPT.AI)
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { EdgeTTS } from '@/lib/edgetts';
import { synthesizeFPT } from '@/lib/fptTTS';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

/**
 * Helper: Call Edge TTS (Free Vietnamese)
 */
async function callEdgeTts(text: string, voice: string): Promise<Buffer> {
  const tempPath = path.join(os.tmpdir(), `edge_tts_${Date.now()}.mp3`);
  await EdgeTTS.synthesize(text, voice, tempPath, 1.0);
  const audioBuffer = fs.readFileSync(tempPath);
  fs.unlinkSync(tempPath); // Cleanup
  return audioBuffer;
}

/**
 * Helper: Call FPT.AI TTS (Premium Vietnamese)
 */
async function callFptTts(text: string, voice: string): Promise<Buffer> {
  const tempPath = path.join(os.tmpdir(), `fpt_tts_${Date.now()}.mp3`);
  await synthesizeFPT(text, tempPath, { voice });
  const audioBuffer = fs.readFileSync(tempPath);
  fs.unlinkSync(tempPath); // Cleanup
  return audioBuffer;
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
    const { mode, scriptText, srtSegments, selectedVoiceApiName, voiceProvider = 'openai' } = req.body;

    if (!selectedVoiceApiName) {
      return res.status(400).json({ error: "Thiếu selectedVoiceApiName." });
    }

    // Only require OpenAI API key for OpenAI provider
    let openai: OpenAI | null = null;
    if (voiceProvider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Chưa cấu hình OPENAI_API_KEY." });
      }
      openai = new OpenAI({ apiKey });
    }

    const audioBuffers: Buffer[] = [];
    const isMP3Provider = voiceProvider === 'edge' || voiceProvider === 'fpt' || voiceProvider === 'vietnamese'; // These return MP3, not PCM

    // Calculate billing
    let totalChars = 0;
    if (mode === 'srt' && Array.isArray(srtSegments)) {
      totalChars = srtSegments.reduce((acc: number, s: any) => acc + (s.text ? s.text.length : 0), 0);
    } else if (scriptText) {
      totalChars = scriptText.length;
    }

    // --- XỬ LÝ SRT ---
    if (mode === 'srt' && srtSegments && Array.isArray(srtSegments)) {

      // For MP3 providers (Vietnamese), process text in chunks
      // MP3 files returned one by one can be detected by browser, but we need to stay under character limits
      if (isMP3Provider) {
        const allText = srtSegments.map((s: any) => s.text).filter(Boolean).join(' ');

        // Split into chunks of ~1500 chars to stay under FPT/Edge limits
        const MP3_CHUNK_SIZE = 1500;
        const textChunks: string[] = [];
        let remaining = allText;
        while (remaining.length > 0) {
          if (remaining.length <= MP3_CHUNK_SIZE) {
            textChunks.push(remaining);
            break;
          }
          // Find good split point (sentence or word boundary)
          let splitIndex = remaining.lastIndexOf('.', MP3_CHUNK_SIZE);
          if (splitIndex < MP3_CHUNK_SIZE * 0.5) {
            splitIndex = remaining.lastIndexOf(' ', MP3_CHUNK_SIZE);
          }
          if (splitIndex < MP3_CHUNK_SIZE * 0.5) {
            splitIndex = MP3_CHUNK_SIZE;
          }
          textChunks.push(remaining.substring(0, splitIndex + 1).trim());
          remaining = remaining.substring(splitIndex + 1).trim();
        }

        console.log(`[SRT MP3] Splitting ${allText.length} chars into ${textChunks.length} chunks`);

        // For multi-chunk SRT, use Edge TTS (faster, no CDN delays, works better for concatenation)
        // Map FPT voices to Edge equivalents
        const fptToEdgeVoiceMap: { [key: string]: string } = {
          'banmai': 'vi-VN-HoaiMyNeural',    // Female Bắc -> Hoài My
          'thuminh': 'vi-VN-HoaiMyNeural',   // Female Bắc -> Hoài My
          'leminh': 'vi-VN-HoaiMyNeural',    // Female Trung -> Hoài My (no Trung Edge)
          'myan': 'vi-VN-HoaiMyNeural',      // Female Nam -> Hoài My (no Nam Edge)
          'minhquang': 'vi-VN-NamMinhNeural', // Male Bắc -> Nam Minh
          'linhsan': 'vi-VN-NamMinhNeural',   // Male Nam -> Nam Minh
        };

        const fptVoiceIds = ['banmai', 'thuminh', 'leminh', 'myan', 'minhquang', 'linhsan'];
        // User explicitly wants FPT voices for SRT. FPT might be slower/unreliable (CDN) but improved retry logic should handle it.
        const useEdgeTTS = false;

        for (const chunk of textChunks) {
          if (!chunk.trim()) continue;

          let buffer: Buffer;
          if (voiceProvider === 'vietnamese') {
            if (fptVoiceIds.includes(selectedVoiceApiName)) {
              if (useEdgeTTS) {
                // Use Edge TTS with mapped voice for multi-chunk (more reliable)
                const edgeVoice = fptToEdgeVoiceMap[selectedVoiceApiName] || 'vi-VN-HoaiMyNeural';
                console.log(`[SRT MP3] Using Edge TTS (${edgeVoice}) for chunk instead of FPT for reliability`);
                buffer = await callEdgeTts(chunk, edgeVoice);
              } else {
                // Use FPT as requested
                // Note: FPT is slower and has CDN delays. We have 8 retries in fptTTS.ts to handle this.
                try {
                  buffer = await callFptTts(chunk, selectedVoiceApiName);
                } catch (err: any) {
                  console.error(`[SRT MP3] FPT failed for chunk, falling back to Edge TTS: ${err.message}`);
                  const edgeVoice = fptToEdgeVoiceMap[selectedVoiceApiName] || 'vi-VN-HoaiMyNeural';
                  buffer = await callEdgeTts(chunk, edgeVoice);
                }
              }
            } else {
              buffer = await callEdgeTts(chunk, selectedVoiceApiName);
            }
          } else if (voiceProvider === 'edge') {
            buffer = await callEdgeTts(chunk, selectedVoiceApiName);
          } else if (voiceProvider === 'fpt') {
            buffer = await callFptTts(chunk, selectedVoiceApiName);
          } else {
            return res.status(400).json({ error: `Unknown voiceProvider: ${voiceProvider}` });
          }
          audioBuffers.push(buffer);
        }
      } else {
        // OpenAI - use original SRT batching with silence padding (Aggressive Batching for Low Rate Limits)
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
              let audioBuffer: Buffer;

              // Route to correct TTS provider
              if (voiceProvider === 'openai' && openai) {
                audioBuffer = await callOpenAITts(openai, batch.text, selectedVoiceApiName);
              } else if (voiceProvider === 'vietnamese') {
                const fptVoiceIds = ['banmai', 'thuminh', 'leminh', 'myan', 'minhquang', 'linhsan'];
                if (fptVoiceIds.includes(selectedVoiceApiName)) {
                  audioBuffer = await callFptTts(batch.text, selectedVoiceApiName);
                } else {
                  audioBuffer = await callEdgeTts(batch.text, selectedVoiceApiName);
                }
              } else if (voiceProvider === 'edge') {
                audioBuffer = await callEdgeTts(batch.text, selectedVoiceApiName);
              } else if (voiceProvider === 'fpt') {
                audioBuffer = await callFptTts(batch.text, selectedVoiceApiName);
              } else {
                throw new Error(`Unknown voiceProvider: ${voiceProvider}`);
              }

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
    } // End of SRT processing
    // --- XỬ LÝ TEXT THƯỜNG ---
    else {
      if (!scriptText) return res.status(400).json({ error: "Thiếu scriptText." });
      const textChunks = splitText(scriptText, MAX_CHUNK_LENGTH);

      for (const chunk of textChunks) {
        let buffer: Buffer;

        if (voiceProvider === 'openai' && openai) {
          buffer = await callOpenAITts(openai, chunk, selectedVoiceApiName);
        } else if (voiceProvider === 'vietnamese') {
          // Check if voice is FPT or Edge based on voice ID
          const fptVoiceIds = ['banmai', 'thuminh', 'leminh', 'myan', 'minhquang', 'linhsan'];
          if (fptVoiceIds.includes(selectedVoiceApiName)) {
            // Use FPT.AI TTS
            buffer = await callFptTts(chunk, selectedVoiceApiName);
          } else {
            // Use Edge TTS (for vi-VN-HoaiMyNeural, vi-VN-NamMinhNeural)
            buffer = await callEdgeTts(chunk, selectedVoiceApiName);
          }
        } else if (voiceProvider === 'edge') {
          buffer = await callEdgeTts(chunk, selectedVoiceApiName);
        } else if (voiceProvider === 'fpt') {
          buffer = await callFptTts(chunk, selectedVoiceApiName);
        } else {
          return res.status(400).json({ error: `Unknown voiceProvider: ${voiceProvider}` });
        }

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

    // For OpenAI (PCM), add WAV header. For Edge/FPT (MP3), return as-is
    if (isMP3Provider) {
      // Edge/FPT return MP3, convert to base64 directly
      res.status(200).json({ audioBase64: mergedBuffer.toString('base64') });
    } else {
      // OpenAI returns PCM, need WAV header
      const wavBuffer = addWavHeader(mergedBuffer, 24000, 1, 16);
      res.status(200).json({ audioBase64: wavBuffer.toString('base64') });
    }

  } catch (err: any) {
    console.error("Lỗi API TTS:", err);
    res.status(500).json({ error: `Lỗi: ${err.message}` });
  }
}
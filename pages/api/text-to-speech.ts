// File: pages/api/text-to-speech.ts (Multi-provider TTS: OpenAI, Edge TTS, FPT.AI)
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from '@/lib/prisma';
import { EdgeTTS } from '@/lib/edgetts';
import { synthesizeFPT } from '@/lib/fptTTS';
import ffmpeg from '@/lib/ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface TtsResponse {
  audioBase64: string;
}
interface ErrorResponse { error: string; }

const MAX_CHUNK_LENGTH = 4096;

// Split text utility
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
  if (tempSentence) processSentence(tempSentence);

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
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

function createSilenceBuffer(durationMs: number): Buffer {
  if (durationMs <= 0) return Buffer.alloc(0);
  // 16-bit PCM, 24kHz => 48 bytes/ms
  const length = Math.floor(durationMs * 48);
  return Buffer.alloc(length);
}

function parseTimeStr(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m, s_ms] = timeStr.split(':');
  const [s, ms] = s_ms.split(',');
  return (+h * 3600 + +m * 60 + +s) * 1000 + +ms;
}

// OpenAI TTS - returns PCM directly
async function callOpenAITts(openai: OpenAI, text: string, voice: string, speed: number = 1.0): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice as any,
    input: text,
    response_format: 'pcm',
    speed: Math.min(4.0, Math.max(0.25, speed)), // OpenAI speed range: 0.25 - 4.0
  });
  return Buffer.from(await response.arrayBuffer());
}

// Convert any audio file to PCM 24kHz 16bit Mono using ffmpeg
async function convertToPcm(inputPath: string): Promise<Buffer> {
  const pcmPath = inputPath + '.pcm';
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('s16le')
      .audioFrequency(24000)
      .audioChannels(1)
      .save(pcmPath)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err));
  });
  const buffer = fs.readFileSync(pcmPath);
  try { fs.unlinkSync(pcmPath); } catch { }
  return buffer;
}

// Edge TTS - get MP3, convert to PCM
async function callEdgeTts(text: string, voice: string, speed: number = 1.0): Promise<Buffer> {
  const tempMp3Path = path.join(os.tmpdir(), `edge_tts_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);

  try {
    console.log(`[Edge TTS] Synthesizing: voice=${voice}, speed=${speed}, text="${text.substring(0, 50)}..."`);

    // Generate MP3 using Edge TTS
    await EdgeTTS.synthesize(text, voice, tempMp3Path, speed, 'audio-24khz-48kbitrate-mono-mp3');

    // Check if file was created
    if (!fs.existsSync(tempMp3Path)) {
      throw new Error('Edge TTS did not generate audio file');
    }

    const fileSize = fs.statSync(tempMp3Path).size;
    console.log(`[Edge TTS] Generated MP3: ${fileSize} bytes`);

    if (fileSize < 100) {
      throw new Error('Edge TTS generated empty or invalid audio');
    }

    // Convert to PCM
    const pcmBuffer = await convertToPcm(tempMp3Path);
    console.log(`[Edge TTS] Converted to PCM: ${pcmBuffer.length} bytes`);
    return pcmBuffer;
  } catch (error: any) {
    console.error('[Edge TTS] Error:', error.message);
    throw error;
  } finally {
    // Cleanup MP3
    try { fs.unlinkSync(tempMp3Path); } catch { }
  }
}

// FPT TTS - get MP3, convert to PCM
async function callFptTts(text: string, voice: string, speed: number = 1.0): Promise<Buffer> {
  const tempMp3Path = path.join(os.tmpdir(), `fpt_tts_${Date.now()}.mp3`);

  try {
    await synthesizeFPT(text, tempMp3Path, { voice, speed });
    const pcmBuffer = await convertToPcm(tempMp3Path);
    return pcmBuffer;
  } finally {
    try { fs.unlinkSync(tempMp3Path); } catch { }
  }
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<TtsResponse | ErrorResponse>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const session = await getServerSession(req, res, authOptions);

  try {
    const { mode, scriptText, srtSegments, selectedVoiceApiName, voiceProvider = 'openai', speed = 1.0 } = req.body;

    // Hidden TTS character limit (500k) - auto-switch to Edge TTS when exceeded
    const TTS_OPENAI_CHAR_LIMIT = 500000;
    let forceEdgeTts = false;
    let userRole = 'FREE';

    // Check user's TTS usage for hidden limit
    if (session?.user?.email && voiceProvider === 'openai') {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { ttsUsageChars: true, role: true }
      });

      if (user) {
        userRole = user.role;
        // VIP users bypass the 500k limit
        if (user.role !== 'VIP' && user.role !== 'ADMIN') {
          if (user.ttsUsageChars >= TTS_OPENAI_CHAR_LIMIT) {
            // Silently switch to Edge TTS (free) - no notification to user
            forceEdgeTts = true;
          }
        }
      }
    }

    let openai: OpenAI | null = null;
    if (voiceProvider === 'openai' && !forceEdgeTts) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Chưa cấu hình OPENAI_API_KEY." });
      openai = new OpenAI({ apiKey });
    }

    const audioBuffers: Buffer[] = [];
    let currentAudioTimeMs = 0;

    // Billing calculation
    let totalChars = 0;
    if (mode === 'srt' && Array.isArray(srtSegments)) {
      totalChars = srtSegments.reduce((acc: number, s: any) => acc + (s.text ? s.text.length : 0), 0);
    } else if (scriptText) {
      totalChars = scriptText.length;
    }

    // FPT voice IDs
    const fptVoiceIds = ['banmai', 'thuminh', 'leminh', 'myan', 'minhquang', 'linhsan'];
    const fptToEdgeMap: Record<string, string> = {
      'banmai': 'vi-VN-HoaiMyNeural',
      'thuminh': 'vi-VN-HoaiMyNeural',
      'leminh': 'vi-VN-HoaiMyNeural',
      'myan': 'vi-VN-HoaiMyNeural',
      'minhquang': 'vi-VN-NamMinhNeural',
      'linhsan': 'vi-VN-NamMinhNeural',
    };

    // For SRT mode with Vietnamese voices: only use Edge TTS (no FPT - too slow/unreliable)
    // For TEXT mode: allow FPT with Edge fallback
    // If forceEdgeTts is true (user exceeded 500k chars), silently use Edge TTS
    const generateAudio = async (text: string, isSrtMode: boolean): Promise<Buffer | null> => {
      if (!text.trim()) return null;

      try {
        // If OpenAI provider but forceEdgeTts (exceeded 500k limit), fallback to Edge
        if (voiceProvider === 'openai') {
          if (openai && !forceEdgeTts) {
            return await callOpenAITts(openai, text, selectedVoiceApiName, speed);
          } else {
            // Silently fallback to Edge TTS - use English voice for international
            return await callEdgeTts(text, 'en-US-AriaNeural', speed);
          }
        } else if (voiceProvider === 'vietnamese' || voiceProvider === 'edge' || voiceProvider === 'fpt') {
          const isFptVoice = fptVoiceIds.includes(selectedVoiceApiName);
          const edgeVoice = isFptVoice
            ? (fptToEdgeMap[selectedVoiceApiName] || 'vi-VN-HoaiMyNeural')
            : selectedVoiceApiName;

          // SRT mode: Always use Edge TTS for Vietnamese (FPT is too slow/unreliable)
          if (isSrtMode) {
            return await callEdgeTts(text, edgeVoice, speed);
          }

          // TEXT mode: Allow FPT with Edge fallback
          if (isFptVoice) {
            try {
              return await callFptTts(text, selectedVoiceApiName, speed);
            } catch (fptError: any) {
              console.warn('FPT TTS failed, falling back to Edge TTS:', fptError.message);
              // Fallback to Edge TTS
              try {
                return await callEdgeTts(text, edgeVoice, speed);
              } catch (edgeError: any) {
                console.error('Edge TTS fallback also failed:', edgeError.message);
                return null;
              }
            }
          } else {
            return await callEdgeTts(text, selectedVoiceApiName, speed);
          }
        }
      } catch (e: any) {
        console.error('TTS Generation Error:', e.message);
      }
      return null;
    };

    // --- MAIN LOGIC ---

    if (mode === 'srt' && srtSegments && Array.isArray(srtSegments)) {
      // SRT Mode: Process with timestamps
      const batches: { start: string, text: string }[] = [];
      let currentBatch: any[] = [];

      for (const seg of srtSegments) {
        if (currentBatch.length === 0) {
          currentBatch.push(seg);
          continue;
        }
        const prevEnd = parseTimeStr(currentBatch[currentBatch.length - 1].end);
        const currStart = parseTimeStr(seg.start);
        const gap = currStart - prevEnd;

        // Batch if gap is small (< 1.5s) AND batch isn't too long
        if (gap < 1500 && currentBatch.length < 10) {
          currentBatch.push(seg);
        } else {
          batches.push({
            start: currentBatch[0].start,
            text: currentBatch.map(s => s.text).join(" "),
          });
          currentBatch = [seg];
        }
      }
      if (currentBatch.length > 0) {
        batches.push({
          start: currentBatch[0].start,
          text: currentBatch.map(s => s.text).join(" "),
        });
      }

      console.log(`[SRT System] Processing ${batches.length} batches`);

      for (const batch of batches) {
        const startTimeMs = parseTimeStr(batch.start);
        // Insert silence to sync with timeline
        const silenceNeeded = startTimeMs - currentAudioTimeMs;
        if (silenceNeeded > 0) {
          audioBuffers.push(createSilenceBuffer(silenceNeeded));
          currentAudioTimeMs += silenceNeeded;
        }

        const audioBuffer = await generateAudio(batch.text, true);
        if (audioBuffer) {
          audioBuffers.push(audioBuffer);
          // 24kHz 16bit mono = 48 bytes/ms
          currentAudioTimeMs += (audioBuffer.length / 48);
        }
      }

    } else {
      // Normal Script Text
      if (!scriptText) return res.status(400).json({ error: "Missing scriptText" });
      const chunks = splitText(scriptText, MAX_CHUNK_LENGTH);

      for (const chunk of chunks) {
        const buffer = await generateAudio(chunk, false);
        if (buffer) audioBuffers.push(buffer);
      }
    }

    // Wrap in WAV
    const finalPcm = Buffer.concat(audioBuffers);

    if (finalPcm.length === 0) {
      return res.status(500).json({ error: "Không tạo được audio. Vui lòng thử lại." });
    }

    const wavBuffer = addWavHeader(finalPcm, 24000, 1, 16);

    // Update Billing (Async)
    if (session?.user?.email && totalChars > 0) {
      prisma.user.update({
        where: { email: session.user.email },
        data: { ttsUsageChars: { increment: totalChars } }
      }).catch(err => console.error(err));
    }

    res.status(200).json({ audioBase64: wavBuffer.toString('base64') });

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
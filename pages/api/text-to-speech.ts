// File: pages/api/text-to-speech.ts (Bản Nâng Cấp "Pro" - Xử lý kịch bản dài)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Modality } from "@google/genai";

interface TtsResponse {
  audioBase64: string;
}
interface ErrorResponse { error: string; }

const MAX_CHUNK_LENGTH = 4500; // Giới hạn ký tự an toàn (dưới 5000)

/**
 * Chia nhỏ văn bản thành các đoạn < MAX_CHUNK_LENGTH
 * Ưu tiên cắt ở dấu xuống dòng hoặc dấu chấm.
 */
function splitText(text: string, limit: number): string[] {
    const chunks: string[] = [];
    let currentChunk = "";

    // Tách văn bản theo câu hoặc đoạn (dấu chấm, chấm than, chấm hỏi, hoặc xuống dòng)
    // Regex này sẽ giữ lại dấu câu ở cuối câu
    const sentences = text.split(/(\n+|[.!?]+\s*)/).filter(Boolean);
    
    let tempSentence = "";
    for (const part of sentences) {
        // Nếu là dấu câu hoặc xuống dòng, ghép nó vào câu trước đó
        if (part.match(/(\n+|[.!?]+\s*)/)) {
            tempSentence += part;
        } else {
            // Nếu là nội dung text, xử lý nó
            if (tempSentence) {
                // Xử lý câu hoàn chỉnh trước đó (text + dấu câu)
                processSentence(tempSentence);
                tempSentence = ""; // Reset
            }
            tempSentence = part; // Bắt đầu câu mới
        }
    }
    // Xử lý câu cuối cùng
    if (tempSentence) {
        processSentence(tempSentence);
    }
    
    // Hàm nội bộ để xử lý logic thêm câu vào chunk
    function processSentence(sentence: string) {
        if (sentence.length > limit) {
            // Nếu một câu đã quá dài, cắt cứng
            // Đẩy chunk hiện tại (nếu có) vào trước
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }
            // Cắt cứng câu quá dài
            for (let i = 0; i < sentence.length; i += limit) {
                chunks.push(sentence.substring(i, i + limit));
            }
        } else if (currentChunk.length + sentence.length + 1 > limit) {
            // Nếu thêm câu này vào sẽ vượt quá giới hạn, đẩy chunk hiện tại vào mảng
            chunks.push(currentChunk.trim());
            currentChunk = sentence; // Bắt đầu chunk mới với câu này
        } else {
            // Thêm câu này vào chunk hiện tại
            currentChunk += (currentChunk ? " " : "") + sentence;
        }
    }

    // Đẩy chunk cuối cùng còn lại vào mảng
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

/**
 * Hàm helper để gọi API TTS cho một đoạn text
 * Trả về raw audio buffer (Node.js Buffer)
 */
async function callTtsApi(
  ai: GoogleGenAI,
  textChunk: string,
  voiceName: string
): Promise<Buffer> {
  const prompt = textChunk
    .replace(/\[pause=(\d+)ms\]/g, ' (pause for $1 milliseconds) ')
    .replace(/<emphasis>(.*?)<\/emphasis>/g, ' (read with emphasis: "$1") ');

  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${prompt}` }] }],
      config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName as any } },
          },
      },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("API không trả về dữ liệu âm thanh cho một đoạn.");
  }
  // Chuyển base64 (string) thành raw buffer
  return Buffer.from(base64Audio, 'base64');
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

  // Tăng giới hạn body parser cho các request text dài
  // (Lưu ý: Cần cấu hình cho Next.js nếu file quá lớn, nhưng 5000 ký tự thì không sao)
  
  try {
    const { scriptText, selectedVoiceApiName } = req.body;

    if (!scriptText || !selectedVoiceApiName) {
        return res.status(400).json({ error: "Thiếu scriptText hoặc selectedVoiceApiName." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }
    const ai = new GoogleGenAI({ apiKey });

    // 1. Chia nhỏ (Chunking)
    const textChunks = splitText(scriptText, MAX_CHUNK_LENGTH);
    
    // 2. Gọi API lặp lại
    const audioBuffers: Buffer[] = [];
    
    // Dùng Promise.all để gọi song song (nhưng vẫn giữ thứ tự)
    // Điều này nhanh hơn gọi tuần tự
    const audioPromises = textChunks.map(chunk => 
        callTtsApi(ai, chunk, selectedVoiceApiName)
    );
    
    const results = await Promise.all(audioPromises);
    audioBuffers.push(...results);
    
    /* // Cách gọi Tuần tự (chậm hơn nhưng an toàn nếu API rate limit)
    for (const chunk of textChunks) {
        const buffer = await callTtsApi(ai, chunk, selectedVoiceApiName);
        audioBuffers.push(buffer);
        // await new Promise(resolve => setTimeout(resolve, 500)); // Nghỉ 0.5s
    }
    */

    // 3. Ghép file âm thanh (Concatenate raw buffers)
    // Lưu ý: Đây là ghép nối thô (raw audio data).
    // Giải pháp "pro" hơn nữa sẽ cần thư viện (như ffmpeg) để
    // xử lý header của file âm thanh, nhưng với đầu ra PCM/raw
    // từ API, việc nối Buffer thường là đủ.
    const mergedBuffer = Buffer.concat(audioBuffers);

    // 4. Trả về (Convert lại base64 để gửi JSON)
    const mergedBase64 = mergedBuffer.toString('base64');

    res.status(200).json({ audioBase64: mergedBase64 });

  } catch (err: any) {
    console.error("Lỗi trong API route /api/text-to-speech:", err);
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
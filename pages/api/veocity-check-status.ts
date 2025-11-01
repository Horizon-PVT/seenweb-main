// File: pages/api/veocity-check-status.ts (Bản Sửa Lỗi - Log siêu chi tiết + Kiểm tra Key)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

interface CheckResponse {
  done: boolean;
  videoUrl?: string;
  error?: string;
}
interface ErrorResponse { error: string; }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { operationName, userApiKey } = req.body;

  try {
    console.log("[API/check-status] Received operationName:", operationName);

    if (!operationName || typeof operationName !== 'string') {
        console.error("[API/check-status] Invalid or missing operationName:", operationName);
        return res.status(400).json({ error: "Thiếu hoặc sai định dạng operationName." });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("[API/check-status] API Key is missing!");
        return res.status(500).json({ error: "Lỗi cấu hình API Key." });
    } else {
        // Log một phần key để xác nhận nó được load đúng (không log toàn bộ)
        console.log(`[API/check-status] Using API Key ending with: ...${apiKey.slice(-4)}`);
    }

    let ai: GoogleGenAI;
    try {
        ai = new GoogleGenAI({ apiKey });
        // Thử một lệnh gọi đơn giản để xác thực key và kết nối
        console.log("[API/check-status] Attempting to list models to verify API key...");
        await ai.models.list(); // Lệnh gọi nhẹ để kiểm tra key
        console.log("[API/check-status] API Key verified successfully by listing models.");
    } catch (initError: any) {
        console.error("[API/check-status] Error initializing GoogleGenAI or verifying API key:", initError);
        // Cung cấp thông báo lỗi rõ ràng hơn về API key
        if (initError.message.includes("API key not valid")) {
             throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại.");
        }
         throw new Error(`Lỗi khởi tạo Google AI hoặc xác thực API Key: ${initError.message}`);
    }


    if (!ai.operations || typeof ai.operations.getVideosOperation !== 'function') {
        console.error("[API/check-status] Critical Error: ai.operations or getVideosOperation is missing!");
        throw new Error("Lỗi nghiêm trọng: Chức năng kiểm tra video không khả dụng.");
    }

    console.log(`[API/check-status] Preparing to call getVideosOperation for: ${operationName}`);
    let operation;
    try {
        console.time(`[API/check-status] getVideosOperation ${operationName}`); // Bắt đầu đo thời gian
        operation = await ai.operations.getVideosOperation(operationName);
        console.timeEnd(`[API/check-status] getVideosOperation ${operationName}`); // Kết thúc đo thời gian
        console.log(`[API/check-status] Call to getVideosOperation for ${operationName} completed.`);

        // Kiểm tra operation ngay sau khi gọi, trước khi log
        if (!operation) {
            console.error(`[API/check-status] getVideosOperation returned undefined/null immediately after call for ${operationName}.`);
            throw new Error(`Không thể lấy trạng thái cho tác vụ ${operationName} (API trả về rỗng).`);
        }
         console.log("[API/check-status] Got operation status (raw):", JSON.stringify(operation, null, 2)); // Log chi tiết cấu trúc trả về


    } catch (apiError: any) {
        console.timeEnd(`[API/check-status] getVideosOperation ${operationName}`); // Dừng đo thời gian nếu có lỗi
        console.error(`[API/check-status] Error object caught DURING getVideosOperation call for ${operationName}:`, apiError);
        // Phân tích lỗi chi tiết hơn
        let detailedErrorMessage = 'Không rõ nguyên nhân';
        if (apiError instanceof Error) {
            detailedErrorMessage = apiError.message;
            // Kiểm tra các lỗi thường gặp
            if (detailedErrorMessage.includes("reading 'name'")) {
                 detailedErrorMessage += " (Lỗi nội bộ thư viện khi xử lý phản hồi API?)";
            } else if (detailedErrorMessage.includes("FETCH_ERROR") || detailedErrorMessage.includes("network")) {
                 detailedErrorMessage = "Lỗi mạng khi kết nối đến Google API.";
            } else if (apiError.stack) {
                 console.error("[API/check-status] Error Stack:", apiError.stack); // Log stack trace nếu có
            }
        } else {
             try {
                detailedErrorMessage = JSON.stringify(apiError);
             } catch {
                 detailedErrorMessage = String(apiError);
             }
        }
        throw new Error(`Lỗi gọi API getVideosOperation: ${detailedErrorMessage}`);
    }

    // --- Phần xử lý operation.done, operation.error, download link giữ nguyên như trước ---
    if (operation.error) {
        console.error("[API/check-status] Operation error property found:", operation.error);
        const detailedError = operation.error.message || JSON.stringify(operation.error);
        throw new Error(`Lỗi từ tác vụ video: ${detailedError}`);
    }

    if (operation.done) {
        // ... (code xử lý download và trả về videoUrl như cũ) ...
        console.log("[API/check-status] Operation is done. Processing response.");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            console.error("[API/check-status] Operation done but no download link found:", operation.response);
            throw new Error("Tác vụ hoàn thành nhưng không tìm thấy link video.");
        }

        console.log("[API/check-status] Fetching video from:", downloadLink);
        const videoResponse = await fetch(downloadLink);
        if (!videoResponse.ok) {
             console.error(`[API/check-status] Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`);
             throw new Error(`Tải video từ Google thất bại: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        const buffer = await videoBlob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = videoBlob.type || 'video/mp4';
        const videoUrl = `data:${mimeType};base64,${base64}`;
        console.log("[API/check-status] Video processed successfully. Sending URL to frontend.");
        res.status(200).json({ done: true, videoUrl: videoUrl });

    } else {
        console.log("[API/check-status] Operation not done yet.");
        res.status(200).json({ done: false });
    }

  } catch (err: any) {
    console.error(`[API/check-status] Final catch block error for operationName '${operationName}':`, err);
    // ... (code xử lý lỗi cuối cùng và trả về response 500 như cũ) ...
    let errorMessage = "Lỗi không xác định từ máy chủ.";
    if (err instanceof Error) {
        errorMessage = err.message;
        // Giữ nguyên các kiểm tra lỗi API key và not found
        if (errorMessage.includes("API Key không hợp lệ")) {
            // Giữ nguyên
        } else if (errorMessage.includes("Không tìm thấy tác vụ render video")) {
           // Giữ nguyên
        } // Thêm các điều kiện khác nếu cần dựa trên log lỗi mới
    }
     res.status(500).json({ error: `Lỗi từ máy chủ khi kiểm tra trạng thái video: ${errorMessage}` });
  }
}
// File: pages/api/script-writer.ts (Backend cho Viết Kịch Bản)
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth/next"; // Auth import
import { authOptions } from "./auth/[...nextauth]"; // Auth definitions
import { checkUserQuota, incrementUserUsage } from "@/lib/quota"; // Quota logic

interface ErrorResponse {
  error: string;
}

// Lưu ý: Gemini API trả về stream text, không phải JSON ở đây
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | ErrorResponse> // Trả về text hoặc lỗi
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 1. Auth & Quota Check
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: "Bạn cần đăng nhập để sử dụng tính năng này." });
  }

  try {
    // Check quota before calling AI
    await checkUserQuota(session.user.id);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }

  try {
    const { idea, goal, level, tone, style, length, format = 'visual' } = req.body;

    if (!idea || !goal || !level || !tone || !style || length === undefined) {
      return res.status(400).json({ error: "Thiếu thông tin đầu vào (idea, goal, level, tone, style, length)." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được đặt trong file .env.local");
      return res.status(500).json({ error: "Lỗi cấu hình máy chủ." });
    }

    // --- 1. Framework Selection Logic (Tự động chọn khung sườn) ---
    let framework = "";
    let frameworkDesc = "";

    switch (goal) {
      case "Tăng View":
        framework = "The Mystery Box (Chiếc hộp bí ẩn)";
        frameworkDesc = "Tạo ra một câu hỏi lớn ngay từ đầu (Open Loop) và chỉ giải đáp nó ở cuối cùng. Rải rác các manh mối (Breadcrumbs) suốt video.";
        break;
      case "Tăng Chuyển Đổi":
        framework = "PAS (Problem - Agitation - Solution)";
        frameworkDesc = "Nêu vấn đề -> Xát muối vào nỗi đau -> Đưa ra giải pháp (Sản phẩm/Dịch vụ) như cứu cánh duy nhất.";
        break;
      case "Xây dựng Thương Hiệu":
        framework = "Hero's Journey (Hành trình người hùng)";
        frameworkDesc = "Nhân vật gặp biến cố -> Tìm người dẫn đường -> Chiến đấu -> Thay đổi và trở về.";
        break;
      default:
        framework = "AIDA (Attention - Interest - Desire - Action)";
        frameworkDesc = "Gây chú ý -> Tạo hứng thú -> Kích thích mong muốn -> Kêu gọi hành động.";
    }

    // --- 2. Duration Context (Đã có, giữ nguyên nhưng tinh chỉnh văn phong) ---
    let durationContext = "";
    if (Number(length) <= 3) {
      durationContext = "Đây là video NGẮN (Shorts/TikTok). Yêu cầu: Cắt bỏ intro, vào thẳng vấn đề (In Medias Res). Nhịp độ dồn dập.";
    } else {
      durationContext = "Đây là video DÀI. Yêu cầu: Giữ chân người xem bằng cách thay đổi trạng thái cảm xúc (Emotional Rollercoaster) mỗi 3 phút.";
    }

    // --- 3. PROMPT GENERATION BASED ON FORMAT ---
    let prompt = "";

    if (format === 'story') {
      // === MODE: STORYTELLING / PODCAST ===
      prompt = `Bạn là một Nhà Kể Chuyện Đại Tài & Podcaster chuyên nghiệp.
Nhiệm vụ: Viết một kịch bản Audio/Storytelling lôi cuốn, đánh mạnh vào THÍNH GIÁC và TRÍ TƯỞNG TƯỢNG.

**THÔNG SỐ**:
- Ý tưởng: "${idea}"
- Ngôn ngữ: Output trùng Ngôn ngữ Input.
- Mục tiêu: ${goal} -> Framework: ${framework} (${frameworkDesc})
- Tông giọng: ${tone} | Phong cách: ${style}
- Thời lượng: ${length} phút.
- Chiến lược: ${durationContext}

**YÊU CẦU CỐT LÕI (AUDIO-FIRST)**:
1. **Theater of the Mind**: Dùng từ ngữ gợi hình để người nghe tự tưởng tượng ra khung cảnh trong đầu.
2. **Kể chuyện dẫn dắt**: Dùng giọng văn kể chuyện (Narrative), thủ thỉ tâm tình hoặc hùng hồn tùy tông giọng.
3. **Sound Design**: Ghi chú rõ loại âm thanh nền (SFX) hoặc nhạc nền (BGM) cần thiết để tăng cảm xúc.

**ĐỊNH DẠNG OUTPUT**:
Trình bày dạng văn bản chia đoạn rõ ràng:
- **[MỞ ĐẦU - HOOK]**: Câu mở đầu chấn động.
- **[THÂN BÀI - DIỄN BIẾN]**: Kể chi tiết, chia nhỏ thành các ý chính (Key Points).
- **[KẾT THÚC - CTA]**: Đúc kết và kêu gọi.
(Kèm các ghi chú [SFX: Tiếng mưa rơi...] hoặc [Tone: Giọng trầm ấm...] trong ngoặc vuông).`;

    } else {
      // === MODE: VISUAL SCRIPT (DEFAULT) ===
      prompt = `Bạn là Đạo Diễn Hình Ảnh & Chiến Lược Gia YouTube (Top 1% Global).
Nhiệm vụ: Viết một kịch bản Video Viral KHÔNG PHẢI ĐỂ ĐỌC, MÀ ĐỂ XEM.

**THÔNG SỐ ĐẦU VÀO**:
- Ý tưởng gốc: "${idea}"
- Ngôn ngữ Đầu ra: **Detect & Match Input Language** (Nếu Idea là Anh -> Viết Anh).
- Mục tiêu: ${goal} -> **Áp dụng Framework: ${framework}** (${frameworkDesc}).
- Tông giọng: ${tone}
- Thời lượng: ${length} phút.
- Chiến lược độ dài: ${durationContext}

**YÊU CẦU CỐT LÕI (VISUAL-FIRST THINKING)**:
1. **No Talking Heads**: Hạn chế cảnh người ngồi nói. Hãy mô tả B-Roll, Meme, Text Overlay, Chuyển cảnh.
2. **Retention Engineering**: Cứ mỗi 60 giây phải có một "Pattern Interrupt" (Thay đổi góc máy, âm thanh lạ, câu hỏi sốc) để đánh thức não bộ người xem.
3. **Open Loop**: Gieo một bí mật ở đầu video và hứa sẽ tiết lộ ở cuối.

**ĐỊNH DẠNG OUTPUT (BẮT BUỘC DÙNG MARKDOWN TABLE)**:
Hãy trình bày kịch bản dưới dạng Bảng Markdown gồm 2 cột:
| VISUAL (Mắt thấy) | AUDIO (Tai nghe) |
| :--- | :--- |
| [00:00-00:15] Mô tả chi tiết cảnh quay, hành động, text hiện trên màn hình... | Lời thoại (Dialogue) hoặc Lời bình (Voiceover). Kèm chỉ dẫn cảm xúc trong ngoặc đơn (Vd: Hào hứng). |

*Lưu ý: Cột VISUAL phải chiếm 50% trọng lượng kịch bản. Đừng chỉ viết mỗi Audio.*`;
    }
    // --- Hết Prompt ---

    const ai = new GoogleGenAI({ apiKey });

    // Sử dụng generateContent vì API route không dễ xử lý stream trực tiếp trả về client
    // Nếu cần stream, cách làm sẽ phức tạp hơn. Trước mắt lấy full text.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Hoặc model phù hợp
      contents: prompt,
    });

    const scriptText = response.text?.trim() || "";

    // 2. Increment Usage after success
    await incrementUserUsage(session.user.id);

    // Trả về kết quả dạng text
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(scriptText);

  } catch (err: any) {
    console.error("Lỗi trong API route /api/script-writer:", err);
    // Đảm bảo trả về JSON lỗi nếu có lỗi
    res.status(500).json({ error: `Lỗi từ máy chủ: ${err.message || "Không xác định"}` });
  }
}
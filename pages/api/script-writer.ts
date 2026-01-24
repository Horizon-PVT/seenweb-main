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
      // === MODE: VISUAL SCRIPT - OPTIMIZED FOR AI VIDEO GENERATION (RUNWAY/PIKA/KLING) ===
      prompt = `You are an Expert AI Video Director & Prompt Engineer.
Your task: Create a PRODUCTION-READY video script optimized for AI video generation tools (Runway Gen-3, Pika, Kling, etc.).

**INPUT PARAMETERS**:
- Topic: "${idea}"
- Goal: ${goal} → Apply Framework: ${framework}
- Tone: ${tone}
- Duration: ${length} minutes
- Strategy: ${durationContext}

**CRITICAL RULES FOR AI VIDEO TOOLS**:
1. Each visual segment MUST be 5-8 seconds (AI tools limit: ~8s/clip)
2. Visual prompts MUST be in ENGLISH (AI tools work best with English)
3. Audio/Voiceover can be in the SAME LANGUAGE as the input topic
4. ONE main subject per scene (avoid multiple characters/complex compositions)
5. SIMPLE actions only (walk, turn, look, smile - not complex sequences)

**VISUAL PROMPT FORMAT** (Copy-paste ready):
\`[Shot], [Camera], [Subject], [Setting], [Action], [Lighting]. [Style keywords].\`

Example:
\`Medium shot, slow dolly in, young woman in white dress, autumn forest, turns toward camera with gentle smile, golden hour lighting. Cinematic, warm tones, 4K.\`

**SCENE CONTINUITY RULES**:
- Keep SAME character appearance across all scenes (describe clothing, hair, features consistently)
- Use MATCH CUTS: End position of scene N = Start position of scene N+1
- Maintain consistent COLOR PALETTE and LIGHTING STYLE
- Note TRANSITION type: Cut / Fade / Dissolve

**OUTPUT FORMAT** (Markdown Table - 4 columns):

| ⏱️ TIME | 🎬 VISUAL PROMPT (English, AI-Ready) | 🎤 AUDIO | 🔗 CONTINUITY |
|:---|:---|:---|:---|
| 00:00-00:06 | Medium shot, static, [subject], [setting], [action], [lighting]. Cinematic, [style]. | (Voiceover in original language) | → Next: same subject, reverse angle |
| 00:06-00:12 | Close-up, slow zoom in, [continuation]... | ... | ← Match cut from previous |

**IMPORTANT**:
- Visual prompts: MAX 25-30 words, single sentence
- Always specify: shot type, camera movement, subject, setting, action, lighting
- End each prompt with style keywords: "Cinematic, 4K, film grain" etc.
- Character description must be IDENTICAL across ALL scenes
- For ${length} minutes video, create approximately ${Math.ceil(Number(length) * 60 / 7)} segments`;
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
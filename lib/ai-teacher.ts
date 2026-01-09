import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TopicAnalysisResult {
  isViable: boolean;
  viabilityScore: number; // 1-10
  topicSummary: string;
  winningAngles: string[];
  targetAudience: string;
  competitionLevel: "thấp" | "trung bình" | "cao";
  warnings: string[];
  recommendation: string;
  suggestedNiche: string;
}

export interface RoadmapGenerationInput {
  topic: string;
  goal: string;
  availableTime: string;
  contentMix: string;
  channelType: "face" | "faceless"; // face = show face, faceless = no face (AI, slideshow, etc.)
  targetMarket: "vn" | "global"; // vn = Vietnamese audience, global = International
  userLevel: string; // e.g., "Beginner"
}

// Analyze topic viability before creating full roadmap
export async function analyzeTopicViability(
  topic: string,
  goal: string,
  targetMarket: "vn" | "global" = "vn",
  channelType: "face" | "faceless" = "face"
): Promise<TopicAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please add it to your .env file.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  const isGlobal = targetMarket === "global";
  const marketContext = isGlobal
    ? `THỊ TRƯỜNG: QUỐC TẾ (View Ngoại)
    - Phân tích tiềm năng trên YouTube QUỐC TẾ (tiếng Anh)
    - Khán giả Mỹ, Châu Âu, toàn cầu
    - CPM cao (3-15$/1000 views)
    - Trend quốc tế: AI, Tech, Finance, True Crime, Self-improvement`
    : `THỊ TRƯỜNG: VIỆT NAM (View Việt)
    - Phân tích tiềm năng trên YouTube VIỆT NAM (tiếng Việt)
    - Khán giả Việt Nam trong và ngoài nước
    - CPM thấp hơn (0.3-1$/1000 views)
    - Trend VN: Tâm linh, Drama, Giải trí, Reaction, Kiến thức`;

  const prompt = `
    ROLE: Bạn là chuyên gia phân tích YouTube với 10 năm kinh nghiệm. Nhiệm vụ: đánh giá xem chủ đề có tiềm năng hay không.

    ${marketContext}

    CHỦ ĐỀ CẦN PHÂN TÍCH: "${topic}"
    MỤC TIÊU NGƯỜI DÙNG: "${goal}"
    LOẠI KÊNH: ${channelType === "faceless" ? "Không lộ mặt" : "Lộ mặt"}

    PHÂN TÍCH:
    1. Đánh giá tiềm năng tăng trưởng trên ${isGlobal ? "YouTube QUỐC TẾ" : "YouTube VIỆT NAM"}
    2. Xác định các "góc nhìn chiến thắng" (winning angles) - cách tiếp cận độc đáo
    3. Xác định đối tượng mục tiêu cụ thể
    4. Đánh giá mức độ cạnh tranh
    5. Cảnh báo các rủi ro (nếu có)
    6. Đề xuất ngách micro cụ thể hơn

    OUTPUT FORMAT (JSON ONLY):
    Trả về JSON hợp lệ, không có markdown code blocks:
    {
      "isViable": true/false,
      "viabilityScore": 1-10,
      "topicSummary": "Tóm tắt ngắn về chủ đề và tiềm năng trên ${isGlobal ? "thị trường quốc tế" : "YouTube Việt Nam"} (1-2 câu)",
      "winningAngles": ["Góc nhìn 1 cụ thể", "Góc nhìn 2 cụ thể", "Góc nhìn 3 cụ thể"],
      "targetAudience": "Mô tả chi tiết đối tượng mục tiêu (tuổi, quốc gia, sở thích, nhu cầu)",
      "competitionLevel": "thấp" | "trung bình" | "cao",
      "warnings": ["Cảnh báo 1 nếu có", "Cảnh báo 2 nếu có"],
      "recommendation": "Khuyến nghị cụ thể 2-3 câu về cách tiếp cận cho ${isGlobal ? "thị trường quốc tế" : "thị trường Việt Nam"}",
      "suggestedNiche": "Đề xuất ngách micro cụ thể hơn nếu topic quá rộng"
    }

    QUAN TRỌNG:
    - Nếu topic quá chung chung (ví dụ: "gaming", "review"), đề xuất ngách cụ thể hơn
    - Nếu topic có vấn đề pháp lý hoặc đạo đức, isViable = false
    - viabilityScore dựa trên: tiềm năng view + khả năng kiếm tiền + mức cạnh tranh
    - Luôn đưa ra ít nhất 2-3 winning angles cụ thể
    - ${isGlobal ? "Phân tích dựa trên thị trường QUỐC TẾ, không phải Việt Nam!" : "Phân tích dựa trên thị trường VIỆT NAM."}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text) as TopicAnalysisResult;
  } catch (error) {
    console.error("Topic Analysis Error:", error);
    // Return a default "proceed with caution" result
    return {
      isViable: true,
      viabilityScore: 6,
      topicSummary: `Chủ đề "${topic}" có tiềm năng nhưng cần phân tích sâu hơn.`,
      winningAngles: ["Tập trung vào nội dung chất lượng", "Xây dựng thương hiệu cá nhân"],
      targetAudience: "Khán giả quan tâm đến " + topic,
      competitionLevel: "trung bình",
      warnings: ["Không thể phân tích chi tiết. Hãy tiến hành thận trọng."],
      recommendation: "Bắt đầu với những video ngắn để test thị trường trước.",
      suggestedNiche: topic
    };
  }
}



export async function generateTeacherRoadmap(
  input: RoadmapGenerationInput,
  phase: string = "initial",
  previousContext?: any
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please add it to your .env file.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  const isFaceless = input.channelType === "faceless";
  const isGlobal = input.targetMarket === "global";

  const channelTypeContext = isFaceless
    ? `LOẠI KÊNH: YouTube KHÔNG LỘ MẶT (Faceless)
    - Video AI-generated, slideshow, voice-over, compilation
    - KHÔNG cần quay mặt, tập trung vào nội dung và giọng đọc
    - Có thể sử dụng AI Voice, AI Image để tạo nội dung nhanh
    - Phù hợp: Kiến thức, tâm linh, motivation, lịch sử, facts, top 10`
    : `LOẠI KÊNH: YouTube LỘ MẶT (Face-shown)
    - Video quay trực tiếp với khuôn mặt
    - Xây dựng thương hiệu cá nhân, kết nối với khán giả
    - Cần thiết bị quay phim, ánh sáng, bối cảnh
    - Phù hợp: Vlog, review, hướng dẫn, reaction`;

  const targetMarketContext = isGlobal
    ? `THỊ TRƯỜNG: QUỐC TẾ (View Ngoại)
    - Nội dung bằng TIẾNG ANH
    - Khán giả Mỹ, Châu Âu, toàn cầu
    - CPM cao hơn 5-10 lần so với Việt Nam
    - Cạnh tranh khốc liệt hơn, cần chất lượng cao
    - Trend: AI, Tech, Finance, Self-improvement, True Crime
    - Phải nghiên cứu từ khóa tiếng Anh, competitor quốc tế`
    : `THỊ TRƯỜNG: VIỆT NAM (View Việt)
    - Nội dung bằng TIẾNG VIỆT
    - Khán giả Việt Nam trong và ngoài nước
    - CPM thấp hơn nhưng dễ viral trong cộng đồng
    - Trend VN: Tâm linh, Drama, Giải trí, Kiến thức, Reaction
    - Có thể kết hợp bán hàng, affiliate marketing dễ dàng`;

  // PHASE STRATEGY
  let dayStart = 0;
  let dayEnd = 10;

  // Normalize phase input
  const currentPhase = (phase as string) === "initial" ? "phase1" :
    (phase as string) === "advanced" ? "phase2" :
      phase; // phase1, phase2, phase3

  let phaseInstructions = "";

  if (currentPhase === "phase1") {
    dayStart = 0;
    dayEnd = 10;
    phaseInstructions = `
       TASK: Create PHASE 1 of a COMPREHENSIVE 30-Day YouTube Roadmap (Day 0 to 10).
       
       ROLE & TONE (CRITICAL):
       - You are "Thầy YouTube" - a strict but caring mentor.
       - Use "Thầy - Em" tone. Be personal, direct, and motivating.
       - DON'T just list tasks. EXPLAIN THE STRATEGY behind everything.
       - "Hand-holding" style: Don't assume they know how. Guide them step-by-step.
       
       PHASE 1 FOCUS: BUILDING THE FOUNDATION & FIRST CONTENT
       - Day 0 (MANDATORY): Deep Dive Analysis. NO FILMING. Just strategy (Angle, Persona, Competitor).
       - Day 1-3: Setup & Skill Building. Scripting formulas, Thumbnail psychology.
       - Day 4-10: Production of 2-3 High Quality Videos (Quality > Quantity).
       
       CONTENT DEPTH REQUIREMENTS:
       - teacherMessage: Must be 3-4 paragraphs. Start with a hook. Explain the "Philosophy" of today's lesson. End with encouragement.
       - coreLesson: The "Theory" part. Explain concepts like "CTR", "AVD", "Hook-Story-Offer".
       - stepByStepGuide: THIS IS THE MOST IMPORTANT PART.
         * BROKEN: "Step 1: Write a script."
         * FIXED: "Step 1: Write the Hook (0-5s). Use the 'Question' method. Example: 'Have you ever wondered...?'"
         * MUST be granular (5-7 steps).
         * Integrate SeenYT Tools naturally into the workflow (e.g., "Use Rival Scanner to find the best outlier video...").
       - objectives: Clear, measurable goals (e.g., "Finish draft 1 of script", "Find 3 references").`;
  } else if (currentPhase === "phase2") {
    dayStart = 11;
    dayEnd = 20;
    phaseInstructions = `
       TASK: Create PHASE 2 of a COMPREHENSIVE 30-Day YouTube Roadmap (Day 11 to 20).
       CONTEXT: User has completed Phase 1 (Foundation) and published first videos.
       
       PHASE 2 FOCUS: CONSISTENCY & OPTIMIZATION (THE GRIND)
       - Focus on establishing a production workflow.
       - Analyze first videos (CTR, Retention).
       - Optimize Titles and Thumbnails based on data.
       - Begin easier formats (Shorts) to boost traffic.
       
       CONTENT DEPTH:
       - Explain "Iterative Improvement" (Kaizen).
       - Teach how to read Analytics (Impressions vs Views).
       - STRICT schedule enforcement (e.g., "Upload at 19:00 on Mon/Thu").`;
  } else if (currentPhase === "phase3") {
    dayStart = 21;
    dayEnd = 30;
    phaseInstructions = `
       TASK: Create PHASE 3 of a COMPREHENSIVE 30-Day YouTube Roadmap (Day 21 to 30).
       CONTEXT: User is consistent. Now needs Growth & Community.
       
       PHASE 3 FOCUS: SCALING & COMMUNITY & MONETIZATION MAP
       - Community Tab strategies.
       - Comment replies & engagement.
       - Advanced editing tips for retention.
       - Preparing for monetization (1000 subs goal).
       
       CONTENT DEPTH:
       - Advanced storytelling techniques.
       - Building a "Tribe" (Fanbase unique culture).
       - Long-term content planning (Content Calendar).`;
  }

  const prompt = `
    ROLE: You are an expert YouTube Mentor ("Thầy YouTube") with 10 years of experience.
    
    ${channelTypeContext}
    ${targetMarketContext}

    INPUTS:
    - Topic: "${input.topic}"
    - Goal: "${input.goal}"
    - Time/Day: "${input.availableTime}"
    - Mix: "${input.contentMix}"
    
    ${phaseInstructions}

    OUTPUT FORMAT (JSON ONLY):
    Returns a valid JSON object starting with { and ending with }. 
    Keys are day numbers ("${dayStart}" to "${dayEnd}").
    NO COMMENTS. NO TRAILING COMMAS. MINIMIZE WHITESPACE.
    IMPORTANT: Do NOT use unescaped newlines inside strings. Use \\n instead.

    Structure:
    {
      "${dayStart}": {
        "day": ${dayStart},
        "title": "TIÊU ĐỀ: HẤP DẪN & ACTION-ORIENTED",
        "publishPlan": { "type": "none", "notes": "Ghi chú ngắn" },
        "teacherMessage": "Lời tâm sự của Thầy (3-4 đoạn, sâu sắc)...",
        "coreLesson": "Bài giảng lý thuyết (Chi tiết)...",
        "stepByStepGuide": "Hướng dẫn CẦM TAY CHỈ VIỆC (Rất chi tiết):\n1. Bước 1: [Hành động] - [Tại sao] - [Cách làm]...\n2. Bước 2: ...",
        "objectives": ["Mục tiêu 1", "Mục tiêu 2"],
        "checklist": [{ "id": "c1", "text": "Task cụ thể...", "estMinutes": 30 }],
        "seenytToolNudges": [ 
          { "toolKey": "MICRO_NICHE_MINER", "label": "Đào Ngách", "why": "Lý do sâu sắc...", "ctaText": "Dùng Tool Ngay", "deepLink": "/?tool=micro-niche-miner" } 
        ]
      },
      ...
    }

    REQUIRED TOOLS (Select 1 per day relevant to the task):
    - MICRO_NICHE_MINER, RIVAL_SCANNER (Research)
    - SCRIPT_VIRAL_LONG, IMAGE_FORGE (Production)
    - TITLE_OPTIMIZER, HIDDEN_CHANNEL_FINDER (Optimization)

    IMPORTANT:
    - Language: Vietnamese (Natural, Inspiring).
    - Generate JSON for Day ${dayStart} to ${dayEnd} ONLY.
    - PRIORITIZE QUALITY AND DEPTH over speed.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    try {
      // 1. Basic Markdown cleanup
      let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

      // 2. Locate the JSON object (first { to last })
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      // 3. Remove control characters
      cleanText = cleanText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

      // 4. Fix common JSON syntax errors
      cleanText = cleanText.replace(/}\s*\{/g, '}, {');
      cleanText = cleanText.replace(/]\s*\[/g, '], [');
      cleanText = cleanText.replace(/,(\s*[}\]])/g, '$1');

      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.warn("Returning fallback roadmap due to JSON error");
      // Basic fallback structure
      return {
        [dayStart]: {
          "day": dayStart,
          "title": "KHỞI ĐỘNG (Fallback)",
          "teacherMessage": "Hệ thống đang bận, vui lòng thử lại.",
          "coreLesson": "Hãy nghiên cứu chủ đề của bạn.",
          "publishPlan": { "type": "none", "notes": "Hệ thống bận" },
          "stepByStepGuide": "1. Nghiên cứu.\n2. Lên kế hoạch.",
          "objectives": ["Khởi động"],
          "checklist": [{ "id": "fallback", "text": "Nghiên cứu", "estMinutes": 30 }],
          "seenytToolNudges": []
        }
      };
    }
  } catch (error) {
    console.error("AI Generation Error (Gemini):", error);
    throw error;
  }
}

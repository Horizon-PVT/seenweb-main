export interface Niche {
    id: string; // "1", "2"...
    slug: string;
    title: string;
    shortDesc: string;
    longDesc?: string;
    avgDuration: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    isPro: boolean; // True if index >= 5 (ID 6+)
    tags: string[];
}

export const NICHE_LIBRARY: Niche[] = [
    // --- STARTER PACK (1-5) ---
    {
        id: "1",
        slug: "video-essay",
        title: "1. Video Essay / Documentary",
        shortDesc: "Phân tích sâu một sự kiện, hiện tượng hoặc câu chuyện.",
        avgDuration: "15 - 45 phút",
        difficulty: "Medium",
        isPro: false,
        tags: ["Storytelling", "Editing", "Research"]
    },
    {
        id: "2",
        slug: "true-crime",
        title: "2. True Crime / Case File",
        shortDesc: "Kể lại các vụ án có thật, trinh thám và bí ẩn.",
        avgDuration: "20 - 60 phút",
        difficulty: "Medium",
        isPro: false,
        tags: ["Suspense", "Narrative", "Research"]
    },
    {
        id: "3",
        slug: "business-breakdown",
        title: "3. Business Breakdown",
        shortDesc: "Phân tích chiến lược công ty, bài học kinh doanh.",
        avgDuration: "12 - 25 phút",
        difficulty: "Hard",
        isPro: false,
        tags: ["Business", "Analysis", "Data"]
    },
    {
        id: "4",
        slug: "ai-tools",
        title: "4. AI Tools & Workflow",
        shortDesc: "Hướng dẫn thực chiến sử dụng AI vào công việc.",
        avgDuration: "10 - 20 phút",
        difficulty: "Easy",
        isPro: false,
        tags: ["Tech", "Tutorial", "Trending"]
    },
    {
        id: "5",
        slug: "challenge-30-days",
        title: "5. Challenge / Transformation",
        shortDesc: "Thử thách 30 ngày thay đổi bản thân (Gym, Code, No-code...).",
        avgDuration: "15 - 30 phút",
        difficulty: "Medium",
        isPro: false,
        tags: ["Vlog", "Inspiration", "Journey"]
    },

    // --- PRO PACK (6-20) ---
    {
        id: "6",
        slug: "biography",
        title: "6. Phân tích nhân vật lớn",
        shortDesc: "Tiểu sử người thành công, thất bại hoặc gây tranh cãi.",
        avgDuration: "20 - 40 phút",
        difficulty: "Medium",
        isPro: true,
        tags: ["History", "People", "Lesson"]
    },
    {
        id: "7",
        slug: "history-event",
        title: "7. Lịch sử & Sự kiện lạ",
        shortDesc: "Những câu chuyện lịch sử ít người biết đến.",
        avgDuration: "15 - 30 phút",
        difficulty: "Hard",
        isPro: true,
        tags: ["History", "Mystery", "Educational"]
    },
    {
        id: "8",
        slug: "movie-analysis",
        title: "8. Phân tích Phim / Anime",
        shortDesc: "Bóc tách ý nghĩa, thông điệp ẩn trong phim ảnh.",
        avgDuration: "15 - 30 phút",
        difficulty: "Medium",
        isPro: true,
        tags: ["Culture", "Review", "Deep Dive"]
    },
    {
        id: "9",
        slug: "psychology",
        title: "9. Tâm lý học hành vi",
        shortDesc: "Giải mã hành vi con người và các hiệu ứng tâm lý.",
        avgDuration: "10 - 20 phút",
        difficulty: "Hard",
        isPro: true,
        tags: ["Science", "Education", "Self-help"]
    },
    {
        id: "10",
        slug: "storytelling-life",
        title: "10. Storytelling Đời thường",
        shortDesc: "Kể chuyện cuộc sống với bài học sâu sắc (Slice of Life).",
        avgDuration: "10 - 20 phút",
        difficulty: "Medium",
        isPro: true,
        tags: ["Vlog", "Emotion", "Life"]
    },
    {
        id: "11",
        slug: "science-mystery",
        title: "11. Khoa học & Vũ trụ",
        shortDesc: "Bí ẩn vũ trụ, paradox, thuyết khoa học chưa lời giải.",
        avgDuration: "15 - 30 phút",
        difficulty: "Hard",
        isPro: true,
        tags: ["Science", "Space", "Visual"]
    },
    {
        id: "12",
        slug: "personal-finance",
        title: "12. Tài chính cá nhân",
        shortDesc: "Tư duy tiền bạc, đầu tư và quản lý tài sản.",
        avgDuration: "12 - 20 phút",
        difficulty: "Easy",
        isPro: true,
        tags: ["Money", "Education", "Finance"]
    },
    {
        id: "13",
        slug: "internet-culture",
        title: "13. Bóc tách Social Trend",
        shortDesc: "Phân tích hiện tượng mạng, meme, drama dưới góc nhìn sâu.",
        avgDuration: "15 - 25 phút",
        difficulty: "Medium",
        isPro: true,
        tags: ["Culture", "News", "Commentary"]
    },
    {
        id: "14",
        slug: "marketing-strategy",
        title: "14. Chiến lược Marketing",
        shortDesc: "Tại sao thương hiệu này thắng? Chiến dịch này dở ở đâu?",
        avgDuration: "15 - 25 phút",
        difficulty: "Medium",
        isPro: true,
        tags: ["Business", "Marketing", "Brand"]
    },
    {
        id: "15",
        slug: "startup-journey",
        title: "15. Startup Story",
        shortDesc: "Hành trình khởi nghiệp từ Zero đến Hero (hoặc về Zero).",
        avgDuration: "20 - 45 phút",
        difficulty: "Medium",
        isPro: true,
        tags: ["Business", "Story", "Documentary"]
    },
    {
        id: "16",
        slug: "social-commentary",
        title: "16. Phản biện xã hội",
        shortDesc: "Góc nhìn trung lập về các vấn đề xã hội nóng hổi.",
        avgDuration: "15 - 25 phút",
        difficulty: "Medium",
        isPro: true,
        tags: ["Society", "Opinion", "Debate"]
    },
    {
        id: "17",
        slug: "mental-models",
        title: "17. Tư duy & Mental Models",
        shortDesc: "Các mô hình tư duy giúp thông minh hơn.",
        avgDuration: "10 - 15 phút",
        difficulty: "Hard",
        isPro: true,
        tags: ["Education", "Self-help", "Logic"]
    },
    {
        id: "18",
        slug: "gaming-culture",
        title: "18. Văn hóa Game / eSports",
        shortDesc: "Lịch sử game, phân tích cốt truyện game, eSports moments.",
        avgDuration: "20 - 40 phút",
        difficulty: "Easy",
        isPro: true,
        tags: ["Gaming", "Entertainment", "History"]
    },
    {
        id: "19",
        slug: "podcast-monologue",
        title: "19. Podcast Độc thoại",
        shortDesc: "Tâm sự, chia sẻ quan điểm sâu sắc dạng One-man talk.",
        avgDuration: "30 - 60 phút",
        difficulty: "Easy",
        isPro: true,
        tags: ["Podcast", "Talk", "Chill"]
    },
    {
        id: "20",
        slug: "knowledge-hub",
        title: "20. Knowledge Hub",
        shortDesc: "Tổng hợp kiến thức chuyên sâu theo chủ đề (All-in-one).",
        avgDuration: "30 - 90 phút",
        difficulty: "Hard",
        isPro: true,
        tags: ["Education", "Course", "Value"]
    }
];

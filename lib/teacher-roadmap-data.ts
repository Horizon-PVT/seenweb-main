export interface RoadmapDay {
    day: number;
    title: string;
    publishPlan: {
        type: "none" | "short" | "long" | "mix";
        publishTimeLocal: string;
        notes: string;
    };
    teacherMessage: string;
    objectives: string[];
    coreLesson: string;
    checklist: {
        id: string;
        text: string;
        estMinutes: number;
    }[];
    seenytToolNudges: {
        toolKey: string;
        label: string;
        why: string;
        ctaText: string;
        deepLink: string;
    }[];
    completion: {
        confirmText: string;
        ifCompletedReply: string;
        ifSkippedReply: string;
    };
    lockedTier: "starter" | "vvip";
}

const BASE_URL = "https://seenyt.net"; // Or local

export const ROADMAP_DATA: Record<number, RoadmapDay> = {
    0: {
        day: 0,
        title: "KHỞI ĐỘNG & THẨM ĐỊNH KÊNH",
        publishPlan: {
            type: "none",
            publishTimeLocal: "",
            notes: "Hôm nay chưa cần đăng video. Hãy tập trung chuẩn bị tâm thế.",
        },
        teacherMessage: "Chào mừng em. Trước khi cầm máy quay, ta phải cầm 'bản đồ'. Kênh YouTube thành công không đến từ may mắn, nó đến từ sự chuẩn bị kỹ lưỡng. Hôm nay Thầy sẽ giúp em thẩm định lại hướng đi.",
        objectives: [
            "Xác định rõ ngách (Niche) và đối tượng khán giả.",
            "Hiểu rõ luật chơi của YouTube 2026.",
            "Cam kết kỷ luật 30 ngày.",
        ],
        coreLesson: "Tư duy 'Làm đúng ngay từ đầu': Đừng làm video cho tất cả mọi người. Hãy làm cho một nhóm người cụ thể đang có nỗi đau cụ thể.",
        checklist: [
            { id: "c1", text: "Đọc kỹ bản phân tích kênh mà AI vừa tạo cho em.", estMinutes: 10 },
            { id: "c2", text: "Viết xuống 3 kênh đối thủ lớn nhất trong ngách.", estMinutes: 15 },
            { id: "c3", text: "Tham gia cộng đồng Creator của SeenYT (nếu có).", estMinutes: 5 },
        ],
        seenytToolNudges: [
            {
                toolKey: "MICRO_NICHE_MINER",
                label: "Đào Ngách CPM Cao",
                why: "Để chắc chắn chủ đề em chọn có tiền và ít cạnh tranh.",
                ctaText: "Mở Tool Đào Ngách",
                deepLink: "/?tool=micro-niche-miner",
            },
            {
                toolKey: "RIVAL_SCANNER",
                label: "Soi Kênh Đối Thủ",
                why: "Biết người biết ta, xem họ làm gì tốt để học hỏi.",
                ctaText: "Soi Đối Thủ Ngay",
                deepLink: "/?tool=rival-scanner",
            },
        ],
        completion: {
            confirmText: "Em đã hiểu rõ định hướng kênh!",
            ifCompletedReply: "Tốt lắm. Sự rõ ràng là sức mạnh. Ngày mai chúng ta sẽ bắt đầu thực chiến!",
            ifSkippedReply: "Em vội vàng quá. Nếu không xác định rõ hướng, em sẽ lạc đường sớm thôi.",
        },
        lockedTier: "starter",
    },
    1: {
        day: 1,
        title: "VIDEO ĐẦU TIÊN - KHÔNG CẦN HOÀN HẢO",
        publishPlan: {
            type: "short",
            publishTimeLocal: "19:00",
            notes: "Đăng 1 YouTube Shorts giới thiệu kênh hoặc chia sẻ 1 mẹo nhỏ.",
        },
        teacherMessage: "Video đầu tiên luôn là video tệ nhất, và đó là tin vui. Vì từ mai em chỉ có thể tốt hơn. Mục tiêu hôm nay: Phá bỏ nỗi sợ camera (hoặc sợ xuất bản).",
        objectives: [
            "Hoàn thành 1 video Shorts dưới 60s.",
            "Tập làm quen với công cụ Script Writer.",
            "Đăng video lên kênh.",
        ],
        coreLesson: "Done is better than perfect. Thuật toán cần tín hiệu đầu tiên từ em.",
        checklist: [
            { id: "c1", text: "Dùng tool viết kịch bản Shorts chủ đề 'Chào sân'.", estMinutes: 10 },
            { id: "c2", text: "Quay hoặc dùng AI tạo video (Velocity) nếu không lộ mặt.", estMinutes: 45 },
            { id: "c3", text: "Upload lên YouTube với hashtag #shorts.", estMinutes: 5 },
        ],
        seenytToolNudges: [
            {
                toolKey: "SCRIPT_VIRAL_SHORT",
                label: "Viết Kịch Bản Viral",
                why: "Để có cấu trúc Hook - Body - CTA chuẩn chỉnh ngay từ đầu.",
                ctaText: "Viết Kịch Bản Ngay",
                deepLink: "/?tool=scriptwriter",
            },
        ],
        completion: {
            confirmText: "Đã đăng video đầu tiên!",
            ifCompletedReply: "Chúc mừng em! Em đã chính thức là một YouTuber. Giờ thì ngủ ngon để chuẩn bị cho ngày 2.",
            ifSkippedReply: "Sao vậy? Sợ hãi à? Hãy nhớ: không ai quan tâm em nhiều như em nghĩ đâu. Cứ đăng đi!",
        },
        lockedTier: "starter",
    },
    // Day 11 Mock for VVIP
    11: {
        day: 11,
        title: "CHIẾN LƯỢC GIỮ CHÂN KHÁN GIẢ (VVIP)",
        publishPlan: {
            type: "long",
            publishTimeLocal: "20:00",
            notes: "Video dài đầu tiên của Phase 2: Tập trung vào Watch Time.",
        },
        teacherMessage: "Chúc mừng em đã tốt nghiệp gói Starter. Ở gói VVIP này, chúng ta không chơi hệ 'may mắn' nữa. Chúng ta chơi hệ 'số liệu'. Hôm nay học về Retention.",
        objectives: [
            "Phân tích Retention graph của các video trước.",
            "Tối ưu 30s đầu của video dài sắp tới.",
        ],
        coreLesson: "Khán giả rời đi ở giây thứ bao nhiêu? Tại sao? Hãy bịt lỗ hổng đó.",
        checklist: [
            { id: "c1", text: "Xem Analytics các video tuần 1.", estMinutes: 20 },
            { id: "c2", text: "Viết kịch bản Long form với kỹ thuật 'Open Loop'.", estMinutes: 60 },
        ],
        seenytToolNudges: [
            {
                toolKey: "SCRIPT_REFINER",
                label: "Nâng Cấp Kịch Bản",
                why: "Giúp văn phong mượt mà và giữ chân người xem lâu hơn.",
                ctaText: "Refine Script",
                deepLink: "/?tool=script-refiner",
            },
        ],
        completion: {
            confirmText: "Đã nắm vững Retention!",
            ifCompletedReply: "Xuất sắc. Chỉ cần giữ chân họ thêm 10%, YouTube sẽ đề xuất em thêm 100%.",
            ifSkippedReply: "Bỏ qua số liệu là sai lầm của kẻ nghiệp dư. Hãy xem lại đi.",
        },
        lockedTier: "vvip",
    },
};

// Fill other days with placeholder to ensure strict 30 days exist if accessed
for (let i = 2; i <= 30; i++) {
    if (!ROADMAP_DATA[i]) {
        ROADMAP_DATA[i] = {
            day: i,
            title: `NGÀY ${i}: TIẾP TỤC XÂY DỰNG`,
            publishPlan: { type: "mix", publishTimeLocal: "19:00", notes: "Duy trì thói quen đăng bài." },
            teacherMessage: "Sự kiên trì là chìa khóa. Hôm nay hãy làm tốt hơn hôm qua 1%.",
            objectives: ["Hoàn thành checklist ngày hôm nay."],
            coreLesson: "Consistency is King.",
            checklist: [{ id: "c1", text: "Thực hiện nhiệm vụ ngày hôm nay.", estMinutes: 30 }],
            seenytToolNudges: [],
            completion: {
                confirmText: "Đã hoàn thành!",
                ifCompletedReply: "Tuyệt vời, cứ thế phát huy.",
                ifSkippedReply: "Đừng lười biếng nhé.",
            },
            lockedTier: i <= 10 ? "starter" : "vvip",
        };
    }
}

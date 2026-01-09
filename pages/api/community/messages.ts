import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

// HUGE POOL OF MESSAGES (Phân loại theo topic để tự nhiên hơn)
const MESSAGES_POOL = {
    GENERAL: [
        "alo anh em", "mọi người ăn cơm chưa", "hôm nay youtube quét ác quá", "có ai bị tụt view không",
        "chán quá edit cả ngày đau lưng", "bao giờ mới được nút bạc nhỉ", "ae nào chéo sub không",
        "video shorts dạo này lên xu hướng ảo thật", "youtube đổi thuật toán nữa à", "ae dùng premiere hay capcut",
        "xin tut edit video ngắn với", "nhạc bản quyền lấy đâu ngon ae", "ai rảnh cà phê không",
        "hà nội nay mưa buồn thế", "sài gòn nóng quá", "tối nay live stream không ae",
        "kênh mới lập 1 tuần đã 1k sub, vui quá", "ae đánh giá giúp video mới của em",
        "bí ý tưởng quá ae ơi", "làm youtube giờ khó khăn thật", "nhưng mà đam mê thì phải chịu",
        "chúc ae buổi tối vui vẻ", "chào buổi sáng cả nhà", "ngủ muộn thế các bác",
        "mai thứ 2 rồi, chán ghê", "cuối tuần cày video thôi", "view lẹt đẹt quá",
        "có ai nhận edit thuê không", "cần tìm editor fulltime lương cao", "ai biết chỗ mua kênh uy tín không",
        "scam dạo này nhiều thật, ae cẩn thận", "group mình đông vui quá", "admin đẹp trai vãi",
        "seen youtube uy tín số 1", "học được nhiều thứ ở đây quá", "cảm ơn bác Tùng chia sẻ",
        "anh em có ai chơi tiktok không", "reup giờ còn sống được không nhỉ", "content is king ae ạ",
        "làm content sạch cho bền", "chạy quảng cáo youtube ads có hiệu quả không",
        "ae subscribe chéo uy tín inbox", "tương tác tí cho xôm nào", "ai đang onl điểm danh cái",
        "buồn ngủ quá mà chưa xong video", "render video máy hú như máy cày", "cần tư vấn build PC edit 20 củ",
        "màn hình nào làm đồ họa chuẩn màu ae nhỉ", "chuột logitech hay razer ngon hơn", "bàn phím cơ gõ sướng thật",
        "chỗ ngồi làm việc của ae thế nào", "khoe góc setup đi", "mạng lag quá, upload video mãi ko xong",
        "bị gậy bản quyền rồi, chán đời", "kháng nghị youtube bao lâu thì được ae", "mail thông báo bật kiếm tiền, phê quá",
        "tháng này lương youtube đủ tiền cafe", "ước mơ 100k sub", "bao giờ mới nổi tiếng như Mixi",
        "làm youtube vì đam mê hay vì tiền", "cả 2 ae ạ haha", "sống chết với nghề",
        "bỏ phố về quê làm youtube", "làm vlog du lịch tốn kém ko ae", "review đồ ăn thì cần gì",
        "kênh em làm về game, ae ủng hộ nha", "kênh em làm về mèo", "kênh em review sách",
        "có ai làm podcast không", "tương lai là video ngắn", "30 tuổi bắt đầu làm youtube có muộn không",
        "không bao giờ là muộn ae ơi", "cố gắng lên", "kiên trì là chìa khóa",
        "thất bại là mẹ thành công", "video đầu tiên của em, ae gạch đá nhẹ tay", "góp ý chân thành ạ",
        "edit video bằng điện thoại được không", "capcut pc giờ xịn lắm", "davinci resolve khó dùng không",
        "after effect làm intro xịn sò", "photoshop làm thumbnail đỉnh cao", "thumbnail quyết định 80% click",
        "tiêu đề giật tít tí mới có view", "đừng clickbait quá là được", "khán giả giờ thông minh lắm",
        "hãy tôn trọng người xem", "làm video có tâm ắt có tầm", "uy tín đặt lên hàng đầu",
        "cộng đồng mình văn minh quá", "không toxic như chỗ khác", "yêu group này",
        "hôm nay trời đẹp", "đi quay vlog thôi", "setup ánh sáng thế nào cho đẹp",
        "micro thu âm loại nào ngon bổ rẻ", "máy ảnh sony hay canon", "quay bằng iphone cũng nét căng",
        "quan trọng là kịch bản", "kịch bản hay thì quay cùi cũng xem", "nội dung rác thì 4k cũng vứt",
        "đồng ý kiến", "chuẩn cơm mẹ nấu", "bác nói chí phải", "like bác 1 cái",
        "thả tim", "haha hài vãi", "buồn cười quá", "xàm xí", "nghiêm túc đi ông êi",
        "thôi đi ngủ", "bye ae", "G9 cả nhà"
    ],
    TECH: [
        "xin crack premiere mới nhất", "cài win dạo 50k", "màn hình xanh chết chóc", "lỗi này sửa sao ae",
        "update driver chưa bác", "xung đột phần mềm rồi", "cài lại win cho nhanh", "tải bản repack cho nhẹ",
        "link fshare die rồi", "ai có acc vip fshare cho mượn", "google drive ko cho tải",
        "fake ip tải nhanh hơn", "dùng idm mà bắt link", "crack cẩn thận virus",
        "máy em ram 4gb chạy nổi không", "nâng ssd đi bác, khác bọt lắm", "card 1050ti giờ còn chiến tốt không",
        "render video 4k cần máy khủng", "cpu i9 hay ryzen 9", "đội xanh hay đội đỏ",
        "tản nhiệt nước hay khí", "led rgb tăng 100% sức mạnh", "bàn phím blue switch ồn quá",
        "mua macbook edit cho mượt", "nhưng macbook đắt quá", "windows vẫn đa dụng hơn",
        "hackintosh được không nhỉ", "code web dạo này lương cao không", "em muốn học IT",
        "html css dễ mà", "javascript mới lú", "reactjs hay vuejs", "nextjs là tương lai",
        "server sập rồi", "ddos à", "bảo mật kém thế", "website load chậm quá",
        "tối ưu ảnh chưa", "dùng cdn đi", "cache chưa", "database phình to quá",
        "sql hay nosql", "docker tiện thật", "deploy lên vercel cho nhanh",
        "github copilot code hộ sướng phết", "ai thay thế lập trình viên không", "chatgpt code kinh vãi",
        "nhưng vẫn cần người sửa", "fix bug mới đau đầu", "lương 350 củ là thật à",
        "ngành này đào thải ghê lắm", "học cả đời", "công nghệ thay đổi liên tục",
        "blockchain là úp bô à", "ai mua bitcoin không", "đào pi thủ", "lùa gà",
        "thôi quay về làm youtube cho lành", "code mệt não lắm", "bác nào cứu em ca này với",
        "teamviewer giúp em", "ultraview đi", "cảm ơn bác nhiều", "hậu tạ thẻ 50k"
    ]
};

// State giả lập
let lastMessageTime = Date.now();
const MESSAGE_DELAY = 10000;
let messageQueue: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. GET: Lấy tin nhắn
    if (req.method === 'GET') {
        const { channelId } = req.query;

        try {
            // Lấy tin nhắn mới nhất
            const messages = await prisma.chatMessage.findMany({
                where: { channelId: String(channelId) },
                include: {
                    user: { select: { id: true, name: true, image: true, role: true, youtubeSubCount: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });

            // Logic Auto-Chat (Lazy Trigger)
            const settings = await prisma.systemSetting.findUnique({ where: { key: 'AUTO_CHAT_ENABLED' } });
            const isAutoChatOn = settings?.value === 'true';

            if (isAutoChatOn && Date.now() - lastMessageTime > 5000) {
                if (Math.random() > 0.3) {
                    await postBotMessage(String(channelId));
                    lastMessageTime = Date.now();
                }
            }

            return res.status(200).json(messages.reverse());
        } catch (error) {
            console.error("Msg API Error:", error);
            // Fallback empty array if DB fails? Or 500
            return res.status(500).json({ error: "Failed to fetch" });
        }
    }

    // 2. POST: Gửi tin nhắn
    if (req.method === 'POST') {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { channelId, content } = req.body;

        try {
            const user = await prisma.user.findUnique({ where: { email: session.user.email } });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const newMessage = await prisma.chatMessage.create({
                data: {
                    content,
                    channelId,
                    userId: user.id
                },
                include: {
                    user: { select: { id: true, name: true, image: true, role: true, youtubeSubCount: true } }
                }
            });

            return res.status(200).json(newMessage);
        } catch (error) {
            console.error("Post Msg Error:", error);
            return res.status(500).json({ error: "Failed to post" });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

// Hàm Bot Post Message
async function postBotMessage(channelId: string) {
    const bots = await prisma.user.findMany({
        where: { role: 'BOT' },
        select: { id: true }
    });

    if (bots.length === 0) return;

    const randomBot = bots[Math.floor(Math.random() * bots.length)];
    const pool = [...MESSAGES_POOL.GENERAL, ...MESSAGES_POOL.TECH];
    const content = pool[Math.floor(Math.random() * pool.length)];

    try {
        await prisma.chatMessage.create({
            data: {
                content: content,
                channelId: channelId,
                userId: randomBot.id
            }
        });
    } catch (e) {
        console.error("Bot post failed", e);
    }
}

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

async function processEbook() {
    try {
        console.log("Initializing Gemini Client...");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        console.log("Uploading PDF to Gemini...");
        const uploadResult = await ai.files.upload({
            file: 'ebook-vip.pdf.pdf',
            mimeType: 'application/pdf',
            displayName: 'VIP_Ebook_Source',
        });

        console.log(`Uploaded! File URI: ${uploadResult.uri}`);

        // Polling to make sure it's active
        let fileState = await ai.files.get({ name: uploadResult.name });
        while (fileState.state === 'PROCESSING') {
            console.log('Waiting for file processing...');
            await new Promise(r => setTimeout(r, 5000));
            fileState = await ai.files.get({ name: uploadResult.name });
        }

        if (fileState.state === 'FAILED') {
            throw new Error("File processing failed.");
        }

        console.log("File is ready. Generating rewritten VIP Ebook...");

        const prompt = `
Bạn là chuyên gia Copywriting hàng đầu và là một Master trong lĩnh vực YouTube Automation tại Mỹ/Châu Âu.
Tài liệu đính kèm là một Ebook gốc (khoảng 60 trang) chia sẻ các kiến thức YouTube.
Nhiệm vụ của bạn là: Đọc hiểu và chắt lọc toàn bộ tinh hoa, chiến lược từ Ebook gốc này, sau đó VIẾT LẠI thành một Ebook Độc Quyền Bản VIP (Dành cho học viên khóa Zoom 3 Ngày 2026).

YÊU CẦU:
1. Đặt tựa đề: "10 BÍ MẬT YOUTUBE 2026: VỀ ĐÍCH NHANH GẤP 10 LẦN CHO NEWBIE"
2. Giọng văn: "Thôi Miên", sắc bén, đánh thẳng vào tâm lý muốn kiếm tiền đô, lười xuất hiện trên camera (Faceless), thích dùng AI để tự động hóa (Automation). Kích thích khao khát hành động ngay.
3. Cấu trúc Ebook:
- Mở đầu: Lời chào mừng đầy tính "tuyệt mật" từ Mr. Seen (Founder SeenYT) dành riêng cho VIP.
- Phần thân: Chia làm "10 Bí Mật" (Chắt lọc từ tinh hoa tài liệu gốc). Với mỗi bí mật, hãy trình bày: Tiêu đề giật gân, Nỗi đau của Newbie hiện tại -> Giải pháp thông minh từ bí mật này -> Hành động thực tiễn.
- Phần kết: CTA rực lửa, thúc giục họ phải đăng nhập vào hệ thống SeenYT Studio để thực hành ngay kiến thức. (Link: seenyt.net/studio).

HÃY VIẾT BẰNG TIẾNG VIỆT, ĐỊNH DẠNG MARKDOWN CHUYÊN NGHIỆP CÓ TIÊU ĐỀ, IN ĐẬM VÀ EMOJI HẤP DẪN. CHIỀU DÀI: DÀI VÀ CHI TIẾT NHẤT CÓ THỂ ĐỂ ĐẢM BẢO TÍNH PREMIUM CỦA VÉ VIP.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } },
                        { text: prompt }
                    ]
                }
            ]
        });

        console.log("Generation complete! Writing to File...");
        fs.writeFileSync('HOAN_THANH_EBOOK_VIP.md', response.text);
        console.log("Thành công! Xem file HOAN_THANH_EBOOK_VIP.md");

    } catch (error) {
        console.error("Error formatting Ebook via AI:", error);
    }
}

// Load .env
require('dotenv').config();
processEbook();

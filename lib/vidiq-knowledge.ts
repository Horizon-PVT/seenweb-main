// lib/vidiq-knowledge.ts
// Knowledge base content crawled from VidIQ Help Center

export interface VidIQDocument {
    id: string;
    category: string;
    content: string;
    source: string;
}

export const VIDIQ_DOCUMENTS: VidIQDocument[] = [
    // Keyword Research
    {
        id: 'vidiq-keyword-research-1',
        category: 'seo',
        content: `NGHIÊN CỨU TỪ KHÓA YOUTUBE (Keyword Research):

Mỗi ngày có hàng tỷ lượt tìm kiếm trên YouTube. Bằng cách hiểu xu hướng tìm kiếm, bạn có thể cải thiện khả năng hiển thị video và tiếp cận khán giả lớn hơn.

## Cách bắt đầu:
1. Xác định rõ chủ đề video (drone review, vlog, storytelling, tutorial...)
2. Tập trung vào MỘT chủ đề cụ thể để nhắm đúng đối tượng
3. Nghiên cứu các từ mà người xem sẽ dùng để tìm video của bạn

## Keyword Score (Điểm từ khóa) - Thang 0-100:
- Very Low (0-19): 🔴 Rất thấp - Tránh dùng
- Low (20-39): 🟠 Thấp - Cân nhắc
- Medium (40-59): 🟡 Trung bình - Chấp nhận được
- High (60-79): 🟢 Cao - Tốt
- Very High (80-100): ✅ Rất cao - Xuất sắc

## Cách tính Keyword Score:
- Competition (Độ cạnh tranh): Số video đang cạnh tranh cho từ khóa đó
- Search Volume (Lượng tìm kiếm): Ước tính lượng tìm kiếm hàng tháng

## Quy tắc vàng:
Tìm từ khóa có SEARCH VOLUME CAO + COMPETITION THẤP = Keyword Score cao nhất`,
        source: 'https://support.vidiq.com/en/articles/9421214-keywords-research'
    },
    {
        id: 'vidiq-keyword-research-2',
        category: 'seo',
        content: `LOẠI TỪ KHÓA YOUTUBE CẦN BIẾT:

## 1. Top Keyword Opportunities
Từ khóa có tiềm năng cao nhất cho kênh của bạn

## 2. Top Search Terms for Your Channel
Từ khóa mà khán giả đang dùng để tìm kênh bạn

## 3. Rising Keywords
Từ khóa đang tăng trưởng nhanh - cơ hội bắt trend

## 4. Related Keywords
Từ khóa liên quan để mở rộng nội dung

## 5. Matching Keywords
Từ khóa khớp chính xác với chủ đề

## 6. Questions (Câu hỏi)
Các câu hỏi người dùng thường đặt - TUYỆT VỜI cho nội dung FAQ

## Mẹo quan trọng:
- Luôn kiểm tra Top Trending Videos cho từ khóa đó
- Phân tích tại sao video đó thành công
- Học hỏi format, tiêu đề, thumbnail`,
        source: 'https://support.vidiq.com/en/articles/9421214-keywords-research'
    },
    // Outliers
    {
        id: 'vidiq-outliers',
        category: 'strategy',
        content: `OUTLIERS - TÌM VIDEO VIRAL VƯỢT TRỘI:

## Outlier là gì?
Outlier là video đạt lượt xem VƯỢT TRỘI so với hiệu suất thông thường của kênh. Đây là những video đang "nổ".

## Outlier Score (Điểm Outlier):
Đo lường mức độ vượt trội của video so với kênh:
- Score CAO = Video đang perform tốt hơn bình thường
- Màu sắc chỉ mức độ outperform

## Cách sử dụng Outliers:
1. Tìm kiếm theo từ khóa/chủ đề bạn quan tâm
2. Lọc theo thời gian, views, độ dài video
3. Phân tích video có Outlier Score cao
4. Học hỏi format, hook, thumbnail

## TẠI SAO VIDEO ÍT VIEW CÓ THỂ CÓ OUTLIER SCORE CAO HƠN VIDEO NHIỀU VIEW?
Vì Outlier đo TƯƠNG ĐỐI với kênh, không phải tuyệt đối.
- Kênh nhỏ 1000 sub có video 50K views = Outlier cực cao
- Kênh lớn 1M sub có video 50K views = Outlier thấp

## Bí quyết:
Tìm Outliers từ kênh NHỎ HƠN bạn để tìm ý tưởng dễ replicate hơn`,
        source: 'https://support.vidiq.com/en/articles/9660010-outliers'
    },
    // VPH
    {
        id: 'vidiq-vph',
        category: 'metrics',
        content: `VPH (Views Per Hour) - TỐC ĐỘ TĂNG VIEW:

## VPH là gì?
VPH (View Velocity) = Lượt xem mỗi giờ. Đây là cách tuyệt vời để xác định video nào đang TRỞ NÊN VIRAL.

## Tại sao VPH quan trọng?
- YouTube dùng VPH để xác định video TRENDING
- Video có VPH cao được đề xuất nhiều hơn
- Giúp phát hiện video đang "nóng" sớm

## Cách sử dụng:
1. Theo dõi VPH của video bạn trong 48h đầu
2. So sánh với video cũ để đánh giá performance
3. Theo dõi VPH đối thủ để phát hiện xu hướng

## Mẹo Pro:
VPH cập nhật liên tục, nên ngay cả video cũ bạn vẫn thấy khi viewership đang tăng!

## VPH cao là bao nhiêu?
Phụ thuộc vào kênh, nhưng nếu VPH cao gấp 3-5x so với bình thường = Video đang HOT`,
        source: 'https://support.vidiq.com/en/articles/108672-what-is-vph-views-per-hour'
    },
    // Engagement Rate
    {
        id: 'vidiq-engagement-rate',
        category: 'metrics',
        content: `TỶ LỆ TƯƠNG TÁC (Engagement Rate) - THƯỚC ĐO SỨC KHỎE VIDEO:

## Engagement Rate là gì?
TER (True Engagement Rate) = (Likes + Comments + Shares) / Views
Đây là thước đo QUAN TRỌNG NHẤT về sức khỏe video.

## Engagement Rate tốt là bao nhiêu?
- 🔴 Dưới 2%: CẦN CẢI THIỆN
- 🟡 2-5%: TỐT
- 🟢 Trên 5%: XUẤT SẮC

## Tại sao quan trọng?
- Xác nhận video của bạn HIỆU QUẢ
- Viewer engage = Dễ được đề xuất
- Video được share = Nhiều viewer mới

## Cách tăng Engagement Rate:

### 1. Đặt câu hỏi trong video:
- "Bạn muốn xem gì trong video tiếp theo?"
- "Món yêu thích của bạn là gì?"
- "Cho mình xem version của bạn!"

### 2. Kêu gọi Subscribe có lý do:
"Mình đang làm series mới về X, đăng ký để không bỏ lỡ nhé!"

### 3. Sử dụng End Screen và Cards:
Giúp viewer dễ dàng xem video khác hoặc subscribe

### 4. Tối ưu SEO:
Tag, tiêu đề, thumbnail tốt = Nhiều người tìm thấy video

### 5. Edit video shareable:
- Đi thẳng vào vấn đề, không lãng phí thời gian
- Tiêu đề và thumbnail khiến người ta muốn chia sẻ`,
        source: 'https://support.vidiq.com/en/articles/108670-what-s-engagement-rate'
    },
    // Best Time to Post
    {
        id: 'vidiq-best-time-to-post',
        category: 'strategy',
        content: `THỜI ĐIỂM ĐĂNG VIDEO TỐT NHẤT:

## Thời gian đăng ảnh hưởng gì?
- Với nội dung EVERGREEN (search-based): Ảnh hưởng ÍT đến long-term
- Với nội dung TIME-SENSITIVE (tin tức, trend): Ảnh hưởng LỚN

## Quy tắc vàng - ĐĂNG TRƯỚC GIỜ PEAK:

Nếu peak time của khán giả là 12h trưa thứ Sáu, hãy đăng lúc 9h, 10h, hoặc 11h sáng thứ Sáu.

### Tại sao?
- Giống như đầu tư chứng khoán, bạn muốn vào khi đang TĂNG
- Video có thời gian tích lũy momentum
- Khi peak time đến, video đã sẵn sàng "nổ"

## TRÁNH đăng vào:
- Đầu giờ (00, 30) - Quá nhiều video khác cũng đăng
- Đăng 5-10 phút trước hoặc sau để tránh cạnh tranh

## Đối với tin tức/trend:
- Apple ra iPhone 4pm thứ Hai → Đăng ngay, đừng đợi
- Khán giả sẽ tìm nguồn khác nếu bạn chậm

## Mẹo quan trọng:
Thói quen khán giả THAY ĐỔI theo thời gian - kiểm tra lại thường xuyên!`,
        source: 'https://support.vidiq.com/en/articles/108673-best-time-to-post'
    },
    // Thumbnails
    {
        id: 'vidiq-thumbnails',
        category: 'thumbnails',
        content: `THUMBNAIL YOUTUBE - NGHỆ THUẬT THU HÚT CLICK:

## Thumbnails quan trọng như thế nào?
Thumbnail là YẾU TỐ QUYẾT ĐỊNH click. Tiêu đề hay mà thumbnail xấu = Không ai click.

## Tips tạo Thumbnail nổi bật:

### 1. KISS - Keep It Simple, Stupid
- Tập trung vào MỘT thông điệp chính
- Không nhồi nhét quá nhiều elements

### 2. Màu sắc contrast cao
- Dùng màu tương phản
- Text phải nổi bật trên nền

### 3. Text lớn, bold
- 3-5 từ MAX
- Đọc được trên mobile (screen nhỏ!)
- KHÁC với tiêu đề, không trùng lặp

### 4. Khuôn mặt biểu cảm
- Cảm xúc rõ ràng: Shocked, delighted, curious
- Nhìn thẳng camera
- Ảnh chân dung vai trở lên

### 5. Test nhiều version
- Tạo 3-4 thumbnail khác nhau
- Xem cái nào CTR cao nhất
- YouTube cho phép đổi thumbnail sau khi đăng

## Trước khi tạo Thumbnail, chuẩn bị:
1. Promise/Lời hứa: Thumbnail hứa hẹn điều gì?
2. Emotion: Chọn MỘT cảm xúc
3. Assets: Ảnh mặt, sản phẩm, reference thumbnails
4. Text: 3-5 từ, contrast cao

## Lỗi thường gặp:
- Upload ảnh quá rộng 16:9 → AI không detect được chủ thể
- Crop để có subject rõ ràng`,
        source: 'https://support.vidiq.com/en/articles/10152120-thumbnails'
    },
    // Channel Optimization
    {
        id: 'vidiq-optimize',
        category: 'seo',
        content: `TỐI ƯU VIDEO YOUTUBE (Optimize):

## Các yếu tố cần tối ưu:

### 1. TIÊU ĐỀ (Title)
- Keyword chính ở đầu
- Dưới 60 ký tự (hiển thị đầy đủ)
- Gây tò mò nhưng không clickbait

### 2. MÔ TẢ (Description)
- 2-3 câu đầu quan trọng nhất (hiện ở snippet)
- Keyword tự nhiên trong văn bản
- Thêm timestamps cho video dài
- CTA: Sub, like, share

### 3. TAGS
- Tag chính = Tiêu đề
- Tags liên quan đến nội dung
- Tags của đối thủ (học hỏi)

### 4. THUMBNAIL
- Preview trước khi đăng
- Test CTR sau 48h
- Sẵn sàng đổi nếu CTR thấp

### 5. CLOSED CAPTIONS
- YouTube index captions cho SEO
- Tự thêm CC chính xác, không dùng auto

## Optimize Score (Điểm tối ưu):
Thang điểm đánh giá mức độ tối ưu của video:
- Cao = Đã tối ưu tốt
- Thấp = Cần cải thiện metadata`,
        source: 'https://support.vidiq.com/en/articles/8972670-optimize'
    },
    // Ideas Generation
    {
        id: 'vidiq-ideas',
        category: 'strategy',
        content: `TÌM Ý TƯỞNG VIDEO MỚI:

## Nguồn ý tưởng:

### 1. Topic of the Day
Ý tưởng được curate RIÊNG cho kênh của bạn mỗi ngày

### 2. Trending Videos
Video đang hot để bắt trend kịp thời

### 3. Proven Viral Videos
Video đã chứng minh viral - làm "blueprint" cho bạn

### 4. Competitors Analysis
Xem đối thủ đang làm gì thành công

## Workflow tạo nội dung:
1. Chọn ý tưởng từ các nguồn trên
2. Nhập ý tưởng vào công cụ
3. AI generate: Title + Thumbnail + Outline
4. Bạn chỉ cần TẬP TRUNG TẠO VIDEO

## Generate Content:
Từ 1 idea, có thể tự động tạo:
- Compelling title (Tiêu đề hấp dẫn)
- Captivating thumbnail (Thumbnail bắt mắt)
- Video outline (Dàn ý video)

Tiết kiệm thời gian, tập trung vào việc bạn yêu thích: LÀM VIDEO!`,
        source: 'https://support.vidiq.com/en/articles/7993395-personalized-and-customized-video-ideas'
    },
    // Competitor Analysis
    {
        id: 'vidiq-competitors',
        category: 'strategy',
        content: `PHÂN TÍCH ĐỐI THỦ YOUTUBE:

## Tại sao cần phân tích đối thủ?
- Học từ những gì đang HIỆU QUẢ
- Tìm gaps (khoảng trống) trong niche
- Benchmark với các kênh tương tự

## Các metrics cần theo dõi:

### 1. Subscriber Growth
So sánh tốc độ tăng sub với đối thủ

### 2. Views per Video
Trung bình mỗi video được bao nhiêu views

### 3. Upload Frequency
Họ đăng bao nhiêu video/tuần

### 4. Top Performing Videos
Video nào của họ thành công nhất - TẠI SAO?

### 5. Engagement Rate
Họ có engagement tốt không?

## Cách tìm đối thủ phù hợp:
- Kênh trong cùng niche
- Kênh có subscriber TƯƠNG TỰ hoặc cao hơn một chút
- Kênh đang tăng trưởng nhanh

## Học từ đối thủ:
1. Format video nào họ dùng nhiều?
2. Thumbnail style của họ thế nào?
3. Tiêu đề họ viết ra sao?
4. Thời lượng video trung bình?
5. Series hay standalone videos?`,
        source: 'https://support.vidiq.com/en/articles/9456917-competitors'
    },
    // Weight Class
    {
        id: 'vidiq-weight-class',
        category: 'strategy',
        content: `WEIGHT CLASS - KÊNH CÙNG HẠNG CÂN:

## Weight Class là gì?
Hệ thống phân loại kênh theo quy mô để so sánh công bằng.

## Tại sao quan trọng?
- So sánh với kênh cùng cấp
- Đánh giá thực tế hơn
- Tìm đối thủ phù hợp

## Các Weight Class:
- Kênh nhỏ: Dưới 1K subs
- Kênh đang phát triển: 1K-10K subs
- Kênh trung bình: 10K-100K subs
- Kênh lớn: 100K-1M subs
- Mega channel: Trên 1M subs

## Ứng dụng:
1. Tìm outliers trong weight class của bạn
2. Benchmark metrics với kênh cùng hạng
3. Đặt mục tiêu realistic
4. Học hỏi từ kênh vừa vượt lên hạng tiếp theo

## Bí quyết:
Đừng so sánh với MrBeast khi bạn mới có 1K subs!
Tìm những người đi trước bạn một bước để học hỏi.`,
        source: 'https://support.vidiq.com/en/articles/438242-the-weight-class'
    },
    // Shorts
    {
        id: 'vidiq-shorts',
        category: 'shorts',
        content: `YOUTUBE SHORTS - CHIẾN LƯỢC VIDEO NGẮN:

## Shorts là gì?
Video dọc dưới 60 giây, cạnh tranh với TikTok và Reels.

## Shorts Scorecard:
Đánh giá hiệu suất Shorts riêng biệt với video thường.

## Tại sao làm Shorts?
- Reach mới (khán giả không xem video dài)
- Test ý tưởng nhanh
- Tăng subscriber nhanh
- Algorithm riêng, cơ hội mới

## Chiến lược Shorts:

### 1. Repurpose content
Cắt clip hay từ video dài → Shorts

### 2. Hook trong 1 giây đầu
Không có thời gian để "warm up"

### 3. Looping content
Shorts hay khi xem lại nhiều lần

### 4. Text on screen
Nhiều người xem không bật tiếng

### 5. Vertical format
Quay dọc hoặc crop từ ngang

## Shorts Generator:
Tự động tạo Shorts từ video dài của bạn!`,
        source: 'https://support.vidiq.com/en/articles/10453678-the-vidiq-shorts-scorecard'
    }
];

// Get all VidIQ documents
export function getAllVidIQDocuments(): VidIQDocument[] {
    return VIDIQ_DOCUMENTS;
}

// Search VidIQ documents locally
export function searchVidIQDocuments(query: string, limit: number = 3): string[] {
    const queryTerms = query.toLowerCase().split(/\s+/);

    const scored = VIDIQ_DOCUMENTS.map(doc => {
        let score = 0;
        const content = doc.content.toLowerCase();

        queryTerms.forEach(term => {
            if (content.includes(term)) {
                score += (content.match(new RegExp(term, 'g')) || []).length;
            }
        });

        return { doc, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.doc.content);
}

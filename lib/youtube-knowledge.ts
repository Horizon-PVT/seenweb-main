// lib/youtube-knowledge.ts
// YouTube knowledge base for AI Coach RAG

export const YOUTUBE_KNOWLEDGE_BASE = [
    // ======== THUẬT TOÁN YOUTUBE ========
    {
        id: 'algo-ctr-1',
        category: 'algorithm',
        content: `CTR (Click Through Rate) là tỷ lệ nhấp vào video so với số lần hiển thị. CTR tốt trên YouTube là từ 4-10%. CTR cao nhất thường ở 24-48h đầu sau khi đăng. Để tăng CTR: dùng thumbnail bắt mắt với khuôn mặt biểu cảm, tiêu đề gây tò mò nhưng không clickbait, tối ưu thời điểm đăng khi audience online nhiều nhất.`
    },
    {
        id: 'algo-retention-1',
        category: 'algorithm',
        content: `Retention (Tỷ lệ giữ chân) là chỉ số quan trọng nhất của YouTube. Video có average view duration trên 50% sẽ được đề xuất nhiều hơn. Hook 30 giây đầu quyết định 80% retention. Tránh intro dài, đi thẳng vào nội dung. Dùng pattern interrupt mỗi 30-60 giây để giữ người xem.`
    },
    {
        id: 'algo-engagement-1',
        category: 'algorithm',
        content: `Engagement signals gồm: like, comment, share, subscribe after watch. YouTube đánh giá cao video có tỷ lệ engagement cao trong 1-2 giờ đầu. Luôn kêu gọi action cụ thể: "Comment cho mình biết..." thay vì "Nhớ like và subscribe". Reply comment trong 1 giờ đầu giúp boost video.`
    },
    {
        id: 'algo-session-1',
        category: 'algorithm',
        content: `Session time là tổng thời gian người xem ở lại YouTube sau khi xem video của bạn. YouTube ưu tiên video giữ người dùng trên platform. Tạo playlist và end screen dẫn đến video khác của bạn. Video dài 10-15 phút thường có session time tốt nhất.`
    },

    // ======== SEO YOUTUBE ========
    {
        id: 'seo-title-1',
        category: 'seo',
        content: `Tiêu đề video tối ưu SEO: đặt keyword chính ở đầu, giới hạn 60 ký tự để không bị cắt, dùng số và brackets []. Ví dụ: "Cách kiếm 100 triệu/tháng từ YouTube [Hướng dẫn 2024]". Tránh tiêu đề toàn chữ hoa, gây spam feel.`
    },
    {
        id: 'seo-description-1',
        category: 'seo',
        content: `Mô tả video: 2-3 dòng đầu quan trọng nhất (hiển thị trước khi click More). Đặt keyword trong 150 ký tự đầu. Thêm timestamps giúp tăng watch time. Link social media và call to action ở cuối. Tối thiểu 200 chữ, tối ưu 300-500 chữ.`
    },
    {
        id: 'seo-tags-1',
        category: 'seo',
        content: `Tags YouTube: dùng 5-8 tags liên quan, đặt keyword chính đầu tiên. Mix giữa broad tags (Gaming) và specific tags (Minecraft building tutorial). Dùng variations: "hướng dẫn", "tutorial", "cách làm". Tags chiếm khoảng 5% trọng số SEO, không quá quan trọng.`
    },
    {
        id: 'seo-hashtag-1',
        category: 'seo',
        content: `Hashtags trên YouTube: thêm 3-5 hashtags trong mô tả, hashtag đầu tiên hiển thị trên tiêu đề. Dùng hashtag trending trong niche. Ví dụ: #Shorts #YouTubeTips #ContentCreator. Tránh spam quá nhiều hashtags (>15 sẽ bị ignore).`
    },

    // ======== THUMBNAIL ========
    {
        id: 'thumb-face-1',
        category: 'thumbnail',
        content: `Thumbnail có khuôn mặt biểu cảm tăng CTR 30-40%. Biểu cảm nên exaggerated: ngạc nhiên, shock, vui mừng. Ánh mắt nhìn thẳng camera hoặc nhìn vào text/object. Background nên contrast với khuôn mặt. Tránh biểu cảm giả tạo, cringe.`
    },
    {
        id: 'thumb-text-1',
        category: 'thumbnail',
        content: `Text trên thumbnail: tối đa 3-4 chữ lớn, font đậm dễ đọc trên mobile. Dùng màu contrast với background. Text nên bổ sung không lặp lại tiêu đề. Outline text để nổi bật. Vị trí text tránh trùng với duration badge góc phải dưới.`
    },
    {
        id: 'thumb-color-1',
        category: 'thumbnail',
        content: `Màu sắc thumbnail: tông màu sáng (vàng, cam, đỏ) thu hút hơn tông tối. Dùng màu complementary tạo contrast. Tránh xanh dương vì trùng với UI YouTube. Consistent color scheme giúp brand recognition. Test A/B với YouTube Studio.`
    },

    // ======== NICHE & CPM ========
    {
        id: 'niche-cpm-1',
        category: 'niche',
        content: `CPM cao nhất (năm 2024-2025): Finance/Investing ($15-30), Insurance ($20-40), Legal ($15-25), Software/Tech ($10-20), Real Estate ($12-25). CPM thấp: Gaming ($2-5), Entertainment ($1-3), Vlogs ($1-4). CPM Việt Nam thường 1/5 đến 1/10 so với US.`
    },
    {
        id: 'niche-cpm-2',
        category: 'niche',
        content: `Niche trending 2024-2025: AI Tools tutorials, Personal Finance cho Gen Z, Shorts/Reels creation, Faceless channels, ASMR variations, Educational content animated. Niche bão hòa: reaction videos, prank channels, generic vlogs.`
    },
    {
        id: 'niche-micro-1',
        category: 'niche',
        content: `Micro-niche strategy: thay vì "Gaming" làm "Minecraft Redstone Tutorials", thay vì "Cooking" làm "Air Fryer Recipes Under 15 Minutes". Micro-niche ít cạnh tranh, audience loyal hơn, CPM có thể cao hơn broad niche.`
    },
    {
        id: 'niche-faceless-1',
        category: 'niche',
        content: `Faceless channels thành công: lofi music compilations, stock footage compilations, AI voice narration, screen recordings, animation/motion graphics. Ưu điểm: scalable, không phụ thuộc cá nhân. Nhược điểm: khó build personal brand, dễ bị copy.`
    },

    // ======== CONTENT STRATEGY ========
    {
        id: 'content-hook-1',
        category: 'content',
        content: `5 loại hook hiệu quả: 1) Câu hỏi gây tò mò, 2) Số liệu gây shock, 3) Câu chuyện mở đầu, 4) Preview kết quả cuối video, 5) Controversy/unpopular opinion. Hook tốt giữ người xem qua 30 giây đầu - quan trọng nhất cho retention.`
    },
    {
        id: 'content-structure-1',
        category: 'content',
        content: `Cấu trúc video viral: Hook (0-30s) → Introduce problem (30s-1m) → Teases solution (1-2m) → Main content (2m-8m) → CTA + Next video teaser (cuối). Mỗi 2-3 phút có một "mini hook" giữ engagement.`
    },
    {
        id: 'content-series-1',
        category: 'content',
        content: `Series content tăng session time và subscriber. Đánh số trong tiêu đề: "Part 1", "#1". Tạo playlist cho series. End screen dẫn đến episode tiếp. Series hoạt động tốt: challenges, tutorials multi-part, story-based content.`
    },
    {
        id: 'content-consistency-1',
        category: 'content',
        content: `Đăng đều đặn quan trọng hơn đăng nhiều. 1 video/tuần quality > 3 video/tuần rushed. YouTube algorithm ưu tiên channels consistent. Đặt lịch đăng cố định: ví dụ thứ 3 và thứ 6, 7PM. Audience sẽ mong đợi video mới.`
    },

    // ======== SHORTS ========
    {
        id: 'shorts-1',
        category: 'shorts',
        content: `YouTube Shorts tối ưu: vertical 9:16, dưới 60 giây (tốt nhất 30-45s). Hook trong 1-2 giây đầu. Text captions giúp watch time. Trending sounds tăng reach. Đăng 1-3 Shorts/ngày để test, giữ best performers.`
    },
    {
        id: 'shorts-convert-1',
        category: 'shorts',
        content: `Chuyển Shorts viewers thành subscribers: cuối Shorts nói "Follow để xem full video". Pin comment link đến long-form. Làm Shorts teaser cho video dài. Khoảng 1-5% Shorts viewers sẽ subscribe nếu CTA tốt.`
    },

    // ======== MONETIZATION ========
    {
        id: 'money-adsense-1',
        category: 'monetization',
        content: `YouTube Partner Program yêu cầu: 1000 subscribers + 4000 watch hours (12 tháng) hoặc 10 triệu Shorts views (90 ngày). Sau khi được duyệt, bật monetization trong YouTube Studio. Revenue share: YouTube 45%, creator 55%.`
    },
    {
        id: 'money-sponsor-1',
        category: 'monetization',
        content: `Sponsorship rates: $10-50/1000 views cho small creators, $50-200/1000 views cho established channels. Brands thích: consistent upload, engaged audience (comments), niche phù hợp. Cách tìm: email pitch, influencer platforms (AspireIQ, Grapevine).`
    },
    {
        id: 'money-affiliate-1',
        category: 'monetization',
        content: `Affiliate marketing trên YouTube: Amazon Associates (4-10% commission), digital products (20-50% commission). Đặt link trong description, pin comment. Disclosure: phải nói rõ "affiliate link" theo FTC rules. Tech review channels kiếm tốt từ affiliate.`
    },

    // ======== ANALYTICS ========
    {
        id: 'analytics-1',
        category: 'analytics',
        content: `Metrics quan trọng nhất: 1) Average view duration (>50% tốt), 2) CTR (>5% tốt), 3) Subscriber conversion rate, 4) Traffic sources. Check Analytics hàng tuần, focus cải thiện 1 metric tại 1 thời điểm.`
    },
    {
        id: 'analytics-traffic-1',
        category: 'analytics',
        content: `Traffic sources: Browse features (homepage/suggested) là nguồn lớn nhất cho channel đã có momentum. YouTube Search tốt cho new channels với SEO mạnh. External traffic (social, embed) tăng authority. Suggested videos là goal cuối cùng.`
    },

    // ======== YOUTUBE STUDIO ========
    {
        id: 'studio-schedule-1',
        category: 'studio',
        content: `Schedule upload: đăng khi audience online nhiều nhất (check Analytics > Audience). Thường 5PM-9PM theo timezone của target audience. Thứ 3, 4, 5 engagement cao hơn weekend. Nhưng test với audience riêng của bạn.`
    },
    {
        id: 'studio-endscreen-1',
        category: 'studio',
        content: `End screens: thêm trong 5-20 giây cuối video. Đặt video/playlist element + subscribe button. Video element nên là "Best for viewer" hoặc video cụ thể liên quan. End screen tốt tăng session time đáng kể.`
    },
    {
        id: 'studio-cards-1',
        category: 'studio',
        content: `Cards: thêm tối đa 5 cards trong video, xuất hiện ở góc phải. Dùng khi mention video khác hoặc playlist. Đặt card ở moment người xem có thể rời đi (drop-off points trong retention graph). Card CTR trung bình 1-3%.`
    },

    // ======== GROWTH TIPS ========
    {
        id: 'growth-collab-1',
        category: 'growth',
        content: `Collaboration strategy: collab với creators cùng size hoặc lớn hơn một chút, cùng niche hoặc adjacent niche. Mỗi người post video trên channel mình. Tăng exposure cho cả 2 audiences. Reach out qua email, professional và specific.`
    },
    {
        id: 'growth-community-1',
        category: 'growth',
        content: `Community Post: đăng 2-3 posts/tuần giữa các video. Polls có engagement cao nhất. Tease video sắp tới, behind the scenes, ask questions. Community tab giữ audience engaged khi không có video mới.`
    },
    {
        id: 'growth-first1000-1',
        category: 'growth',
        content: `Đạt 1000 subscribers đầu tiên: niche down cụ thể, post consistently (1-2/tuần), SEO mạnh cho search traffic, share trên communities liên quan (Reddit, Facebook groups), reply mọi comment. Thường mất 3-6 tháng.`
    },

    // ======== COMMON MISTAKES ========
    {
        id: 'mistake-1',
        category: 'mistakes',
        content: `Lỗi phổ biến của new creators: 1) Không có niche rõ ràng, 2) Thumbnail chữ quá nhỏ, 3) Intro dài (>10s), 4) Không CTA, 5) Đăng không đều, 6) Copy trend quá chậm, 7) Bỏ cuộc sau 10-20 videos.`
    },
    {
        id: 'mistake-retention-1',
        category: 'mistakes',
        content: `Lỗi giết retention: rambling intro, "Xin chào các bạn..." dài dòng, promise nhưng không deliver, audio/video quality kém, không có visual variety (talking head liên tục), không tóm tắt takeaways.`
    },

    // ======== TRENDS 2024-2025 ========
    {
        id: 'trend-ai-1',
        category: 'trends',
        content: `AI tools cho creators 2025: script writing (ChatGPT, Claude), thumbnail generation (Midjourney, DALL-E), video editing (Descript, Runway), voice cloning (ElevenLabs). Dùng AI tiết kiệm thời gian nhưng cần human touch để authentic.`
    },
    {
        id: 'trend-format-1',
        category: 'trends',
        content: `Content formats đang hot 2025: Long-form podcasts (2-3 hours), Short documentaries (20-40 min), Hybrid Shorts+Long strategy, Live streaming + VOD, Educational entertainment (edutainment). Audience muốn depth hoặc ultra-short, ít interest với middle (5-10 min).`
    },

    // ======== SEENYT TOOLS ========
    {
        id: 'seenyt-tools-1',
        category: 'seenyt',
        content: `SeenYT cung cấp các công cụ: Viết Kịch Bản AI giúp tạo script video viral, SEO & Từ Khóa tối ưu title/tags/description, Đào Ngách CPM Cao tìm niche tiềm năng, Tạo Thumbnail AI, Phân Tích Kênh Đối Thủ. Truy cập tại app.seenyt.com/dashboard.`
    },
    {
        id: 'seenyt-niche-1',
        category: 'seenyt',
        content: `Công cụ Đào Ngách của SeenYT: phân tích xu hướng tìm kiếm, so sánh mức độ cạnh tranh, dự đoán CPM tiềm năng của từng ý tưởng niche. Dùng để tìm micro-niche ít cạnh tranh nhưng CPM cao.`
    },
    {
        id: 'seenyt-script-1',
        category: 'seenyt',
        content: `Công cụ Viết Kịch Bản của SeenYT: tạo script video với cấu trúc hook-content-CTA, tối ưu cho retention. Nhập topic và style, AI sẽ generate script có thể customize. Hỗ trợ nhiều format: tutorial, story, review.`
    },

    // ======== VIETNAMESE MARKET ========
    {
        id: 'vn-market-1',
        category: 'vietnam',
        content: `Thị trường YouTube Việt Nam: CPM trung bình $0.5-2, cao nhất $3-5 (finance, tech). Niche hot tại VN: gaming, entertainment, music, education, food/cooking. Peak hours: 7-10PM. Đối tượng lớn: 18-34 tuổi.`
    },
    {
        id: 'vn-market-2',
        category: 'vietnam',
        content: `Để tăng CPM tại Việt Nam: target audience có thu nhập (25-45 tuổi), niche finance/business/tech, làm content English để có international ads, hoặc mix Vietnamese + English keywords.`
    },
];

// Get all document IDs and content
export function getAllDocuments() {
    return YOUTUBE_KNOWLEDGE_BASE;
}

// Search locally before going to Pinecone (fallback)
export function localSearch(query: string, limit = 5): string[] {
    const queryLower = query.toLowerCase();
    const scored = YOUTUBE_KNOWLEDGE_BASE.map(doc => ({
        doc,
        score: queryLower.split(' ').filter(word =>
            doc.content.toLowerCase().includes(word)
        ).length
    }));

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .filter(s => s.score > 0)
        .map(s => s.doc.content);
}

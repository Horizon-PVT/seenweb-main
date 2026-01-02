/**
 * SEENYT EMAIL ONBOARDING SYSTEM
 * Google Apps Script Engine
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet named "SeenYT_Onboarding_Emails"
 * 2. Rename the first tab to "users"
 * 3. Add headers in Row 1: email, created_at, status, e1_sent_at, e2_sent_at, e3_sent_at, e4_sent_at, e5_sent_at, last_error, updated_at
 * 4. Tools > Script Editor > Paste this code
 * 5. Update SCRIPT_CONFIG with your secret key (must match .env)
 * 6. Run setupTriggers() function once
 * 7. Deploy > New Deployment > Web App > Execute as Me > Access: Anyone
 */

const SCRIPT_CONFIG = {
    WEBHOOK_KEY: "CHANGE_THIS_TO_YOUR_SECURE_RANDOM_STRING_32_CHARS", // Must match .env SHEETS_WEBHOOK_KEY
    SENDER_NAME: "Phạm Tùng - SeenYT",
    BATCH_SIZE: 50, // Process 50 users at a time
};

// ==========================================
// 1. WEBHOOK RECEIVER (doPost)
// ==========================================
function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        // 1. Verify Secret
        const key = e.parameter.key;
        if (key !== SCRIPT_CONFIG.WEBHOOK_KEY) {
            return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
        }

        // 2. Parse Data
        const data = JSON.parse(e.postData.contents);
        const email = data.email;
        const event = data.event;
        const status = data.status || "FREE";
        const ts = data.ts || new Date().toISOString();

        if (!email) throw new Error("Missing email");

        // 3. Upsert to Sheet
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("users");
        const lastRow = sheet.getLastRow();

        // Find existing email (simple search, optimized for <5000 rows)
        // For larger scale, sorting + binary search or dictionary map is better, but this simple loop is fine for MVP
        let foundRow = -1;
        if (lastRow > 1) {
            const emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues(); // Column A
            for (let i = 0; i < emails.length; i++) {
                if (emails[i][0] === email) {
                    foundRow = i + 2; // +2 because 0-index array and header row
                    break;
                }
            }
        }

        if (foundRow > 0) {
            // Update existing
            sheet.getRange(foundRow, 3).setValue(status); // C: status
            sheet.getRange(foundRow, 10).setValue(new Date().toISOString()); // J: updated_at
        } else {
            // Create new
            sheet.appendRow([
                email,              // A: email
                ts,                 // B: created_at
                status,             // C: status
                "",                 // D: e1_sent_at
                "",                 // E: e2_sent_at
                "",                 // F: e3_sent_at
                "",                 // G: e4_sent_at
                "",                 // H: e5_sent_at
                "",                 // I: last_error
                new Date().toISOString() // J: updated_at
            ]);
        }

        // 4. Instant Action (Optional - Send E1 immediately if desired, or let scheduler handle it)
        // Here we let scheduler handle it for consistency and robust error/quota handling.

        return ContentService.createTextOutput(JSON.stringify({ success: true, row: foundRow > 0 ? "updated" : "created" })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// ==========================================
// 2. SCHEDULER (processQueue)
// ==========================================
function setupTriggers() {
    // Clear old triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(t => ScriptApp.deleteTrigger(t));

    // New trigger: Run every 15 minutes
    ScriptApp.newTrigger("processQueue")
        .timeBased()
        .everyMinutes(15)
        .create();
}

function processQueue() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("users");
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    // Get data: Row 2 to Batch Size
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 9); // A to I
    const data = dataRange.getValues();
    const now = new Date();

    let processedCount = 0;

    for (let i = 0; i < data.length; i++) {
        if (processedCount >= SCRIPT_CONFIG.BATCH_SIZE) break;

        const row = data[i];
        const rowIndex = i + 2;

        const email = row[0];
        const createdAtStr = row[1];
        const status = row[2];
        const e1 = row[3];
        const e2 = row[4];
        const e3 = row[5];
        const e4 = row[6];
        const e5 = row[7];

        if (!email || !createdAtStr) continue;

        const createdAt = new Date(createdAtStr);
        const hoursSinceJoin = (now - createdAt) / (1000 * 60 * 60);

        let sentType = null;
        let sentTime = null;
        let errorMsg = null;

        try {
            // Logic Check

            // EMAIL 1: Immediate/Welcome (Wait 0h)
            if (!e1 && hoursSinceJoin >= 0) {
                sendEmail(email, "E1_WELCOME");
                sentType = 4; // Column D
            }

            // EMAIL 2: Instruction (+24h)
            else if (!e2 && hoursSinceJoin >= 24) {
                sendEmail(email, "E2_INSTRUCTION");
                sentType = 5; // Column E
            }

            // EMAIL 3: Mindset (+48h)
            else if (!e3 && hoursSinceJoin >= 48) {
                sendEmail(email, "E3_MINDSET");
                sentType = 6; // Column F
            }

            // EMAIL 4: Upsell (+72h) - ONLY IF FREE. If paid, skip (mark as SKIPPED)
            else if (!e4 && hoursSinceJoin >= 72) {
                if (status === "FREE") {
                    sendEmail(email, "E4_UPSELL");
                    sentType = 7; // Column G
                } else {
                    // Skip for paid users
                    sheet.getRange(rowIndex, 7).setValue("SKIPPED_PAID");
                    continue;
                }
            }

            // EMAIL 5: Founder Note (+120h / Day 5-6)
            else if (!e5 && hoursSinceJoin >= 120) {
                sendEmail(email, "E5_FOUNDER");
                sentType = 8; // Column H
            }

            if (sentType) {
                sheet.getRange(rowIndex, sentType).setValue(new Date().toISOString());
                processedCount++;
            }

        } catch (err) {
            sheet.getRange(rowIndex, 9).setValue(err.message + " | " + new Date().toISOString());
        }
    }
}

function sendEmail(to, type) {
    const tpl = EMAIL_TEMPLATES[type];
    if (!tpl) throw new Error("Template not found: " + type);

    MailApp.sendEmail({
        to: to,
        subject: tpl.subject,
        htmlBody: tpl.body.replace(/\n/g, "<br>"), // Simple newline to BR
        name: SCRIPT_CONFIG.SENDER_NAME
    });
}

// ==========================================
// 3. TEMPLATES (Store Content Here)
// ==========================================
const EMAIL_TEMPLATES = {
    "E1_WELCOME": {
        subject: "Chào mừng bạn đến với SeenYT 👋",
        body: `Chào bạn,

Rất vui vì bạn đã chọn SeenYT để bắt đầu hành trình YouTube của mình.

Tôi là Phạm Tùng, founder của SeenYT. Tôi hiểu rằng khi mới bắt đầu, bạn có thể cảm thấy choáng ngợp vì không biết phải làm gì trước, hay sợ rằng mình không đủ giỏi kỹ năng edit/công nghệ.

Đừng lo. Với SeenYT, bạn không cần phải là chuyên gia. Bạn chỉ cần làm đúng theo một quy trình 3 bước đã được chứng minh hiệu quả:

1.  **Tìm chủ đề dễ làm** (Dùng Micro Niche Miner)
2.  **Viết kịch bản tự động** (Dùng Scriptwriter)
3.  **Tối ưu SEO & đăng** (Dùng SEO Tool)

Gói **FREE** bạn đang dùng đã có đủ quyền truy cập để bạn trải nghiệm trọn vẹn quy trình này mỗi ngày.

Đừng suy nghĩ quá nhiều, hãy thử làm video đầu tiên ngay hôm nay nhé.

<a href="https://seenyt.net/?tool=micro-niche-miner">Bắt đầu với bước 1 ngay ›</a>

Hẹn gặp bạn ở video đầu tiên,
**Phạm Tùng**`
    },
    "E2_INSTRUCTION": {
        subject: "Bạn nên bắt đầu từ đâu trên SeenYT?",
        body: `Chào bạn,

Có một sự thật là: **Chủ đề quyết định 70% thành công của video.**

Nếu bạn quay dựng rất đẹp nhưng chọn sai chủ đề (ngách quá khó, hoặc không ai xem), video vẫn sẽ thất bại. Ngược lại, một chủ đề "ngách" tốt thì dù edit đơn giản vẫn có view.

Đó là lý do tôi đặt công cụ **Micro Niche Miner** ở bước đầu tiên.

Công cụ này sẽ giúp bạn quét thị trường để tìm ra những "khe cửa hẹp" – nơi có nhiều người xem nhưng ít đối thủ cạnh tranh.

Hôm nay, bạn hãy dành 5 phút để thử tìm một ý tưởng nhé. Không cần phải làm video ngay, chỉ cần tìm ra ý tưởng thôi đã là một khởi đầu tuyệt vời rồi.

<a href="https://seenyt.net/?tool=micro-niche-miner">Mở Micro Niche Miner ›</a>

Chúc bạn tìm được ngách vàng,
**Phạm Tùng**`
    },
    "E3_MINDSET": {
        subject: "Vì sao nhiều người bỏ cuộc khi làm YouTube?",
        body: `Chào bạn,

Tôi đã quan sát hàng ngàn người mới bắt đầu làm YouTube, và phần lớn họ dừng lại chỉ sau 1 tháng. Lý do thường xoay quanh 3 điều này:

1.  Không biết hôm nay phải làm video gì (bí ý tưởng).
2.  Làm video không đều (nản chí).
3.  Làm xong đăng lên không ai xem (không biết SEO).

SeenYT được sinh ra chính là để giải quyết 3 vấn đề này cho bạn.

*   AI sẽ gợi ý chủ đề mỗi ngày (không bao giờ bí).
*   AI viết kịch bản giúp bạn (tiết kiệm 90% thời gian).
*   AI tối ưu từ khóa (để video dễ lên top).

Tuy nhiên, AI không thể thay bạn kiên trì. AI giúp bạn đi đúng đường, nhưng bạn là người phải bước đi.

Đừng áp lực phải hoàn hảo. Hãy cứ làm xấu cũng được, nhưng phải làm đều.

<a href="https://seenyt.net">Tiếp tục workflow với SeenYT ›</a>

Vững tin nhé,
**Phạm Tùng**`
    },
    "E4_UPSELL": {
        subject: "Khi nào bạn nên nâng cấp Starter?",
        body: `Chào bạn,

Hy vọng bạn đã quen với workflow trên SeenYT.

Tôi viết email này không phải để ép bạn mua hàng. Tôi chỉ muốn chia sẻ thời điểm phù hợp nhất để bạn cân nhắc gói **Starter**.

Đó là khi:
*   Bạn muốn làm video đều đặn hơn (nhiều hơn 3 lần/ngày).
*   Bạn không muốn mạch sáng tạo bị ngắt quãng vì hết lượt dùng.
*   Bạn thực sự nghiêm túc coi YouTube là một công việc (dù là part-time).

Gói Starter có giá 149.000đ/tháng – chỉ bằng vài ly cà phê, nhưng nó mang lại cho bạn sự **liền mạch** và **tốc độ**.

Nếu bạn cảm thấy đã sẵn sàng để tăng tốc, hãy thử xem qua nhé. Nếu chưa, cứ tiếp tục dùng bản Free, tôi vẫn rất vui khi thấy bạn quay lại mỗi ngày.

<a href="https://seenyt.net/#pricing">Xem gói Starter – 149.000đ ›</a>

**Phạm Tùng**`
    },
    "E5_FOUNDER": {
        subject: "Một lời nhắn nhỏ từ người xây SeenYT",
        body: `Chào bạn,

Đã gần một tuần từ khi bạn biết đến SeenYT. Tôi tò mò không biết trải nghiệm của bạn thế nào?

Tôi xây dựng công cụ này xuất phát từ chính nỗi đau của mình ngày xưa: mất cả ngày trời chỉ để nghĩ ra một ý tưởng, rồi hì hục viết kịch bản, làm SEO mà vẫn mông lung không biết có ai xem không.

Mục tiêu của tôi không chỉ là tạo ra một phần mềm, mà là tạo ra một người bạn đồng hành với các YouTuber mới.

Nếu trong quá trình sử dụng, bạn gặp khó khăn gì, hoặc cần lời khuyên về hướng đi kênh, đừng ngại **Reply email này**. Chính tay tôi sẽ đọc và cố gắng hỗ trợ bạn trong khả năng.

Cảm ơn bạn đã tin tưởng SeenYT.

Thân mến,
**Phạm Tùng**`
    }
};

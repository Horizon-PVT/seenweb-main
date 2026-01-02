# LOGIC MAPPING: WEBSITE ↔ EMAIL SYSTEM

Tài liệu này mô tả logic kích hoạt (trigger) chuỗi email onboarding dựa trên hành vi người dùng trên website SeenYT. Hệ thống backend/email marketing cần được cấu hình theo các quy tắc dưới đây.

---

## 1. Nguyên tắc chung
*   **Unique User**: Logic áp dụng cho mỗi tài khoản người dùng duy nhất (dựa trên email).
*   **Idempotency**: Một email chỉ gửi 1 lần duy nhất cho mỗi user.
*   **Stop Logic**: Nếu user nâng cấp lên gói trả phí (Starter/Pro), **DỪNG** chuỗi email onboarding Free này (chuyển sang chuỗi "Paid User Onboarding" nếu có).

---

## 2. Trigger Flow Chi Tiết

### 🟢 EMAIL 1: Welcome
*   **Sự kiện Web (Web Event)**: `USER_REGISTER_SUCCESS`
*   **Mô tả**: Khi người dùng điền form đăng ký và tài khoản được tạo thành công trong DB.
*   **Thời gian gửi**: `Immediate` (Ngay lập tức).
*   **Điều kiện**: Không.

### 🟡 EMAIL 2: Hướng dẫn dùng (Push Tool)
*   **Sự kiện Web**: `SYSTEM_TIME_CHECK`
*   **Thời gian gửi**: `24 giờ` sau khi đăng ký (After Registration + 24h).
*   **Logic bổ sung (Option)**:
    *   Tốt nhất là gửi cố định sau 24h để nhắc nhớ.
    *   Nếu hệ thống tracking được: "Nếu User CHƯA dùng tool Micro Niche Miner trong 24h đầu -> Gửi email này". (Tuy nhiên, gửi đại trà cho người mới cũng OK).

### 🟠 EMAIL 3: Giáo dục Mindset
*   **Sự kiện Web**: `SYSTEM_TIME_CHECK`
*   **Thời gian gửi**: `48 giờ` sau khi đăng ký (Day 2).
*   **Ngữ cảnh**: Lúc này user thường bắt đầu nản hoặc lười. Email này đến đúng lúc để sốc lại tinh thần.

### 🔴 EMAIL 4: Soft Upsell Starter
*   **Sự kiện Web**:
    *   **Ưu tiên 1 (Behavior Based)**: Khi user chạm giới hạn usage lần đầu tiên (`LIMIT_REACHED_EVENT`). Gửi sau 30 phút hoặc 1 tiếng.
    *   **Ưu tiên 2 (Time Based)**: Nếu không tracking được behavior, gửi vào `Ngày 4` sau khi đăng ký.
*   **Điều kiện chặn**: Nếu user ĐÃ LÀ gói Starter/Pro/VIP -> **KHÔNG GỬI**.

### 🔵 EMAIL 5: Founder Note
*   **Sự kiện Web**: `SYSTEM_TIME_CHECK`
*   **Thời gian gửi**: `Ngày 6` sau khi đăng ký.
*   **Mục đích**: Chăm sóc những user còn lại (chưa mua, nhưng vẫn chưa unsubscribe). Chuyển đổi họ thành lead hội thoại.

---

## 3. Web UI Integration Hints

Để hỗ trợ logic này, Frontend không cần thay đổi code hiển thị, nhưng Backend cần log các mốc thời gian:

1.  `created_at`: Thời gian đăng ký (Dùng cho Email 1, 2, 3, 5).
2.  `plan_status`: Trạng thái gói cước (Dùng để chặn Email 4).
3.  `usage_logs`: (Tùy chọn) Để trigger Email 4 thông minh hơn.

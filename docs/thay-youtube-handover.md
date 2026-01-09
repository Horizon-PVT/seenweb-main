# HỒ SƠ BÀN GIAO: TOOL "THẦY YOUTUBE" (AI TEACHER VERSION)

**Người thực hiện**: Google Antigravity (Senior Fullstack)
**Phiên bản**: V2 (Dynamic AI Roadmap - Gemini Powered)
**Ngày hoàn thành**: 2026-01-09

---

## 1. TỔNG QUAN
Đã nâng cấp từ "Roadmap tĩnh" sang hệ thống **AI Teacher (Mentor)** thực thụ:
- [x] **Dynamic Curriculum**: Giáo án được sinh ra real-time bởi AI dựa trên chủ đề user nhập.
- [x] **Day 0 Analysis**: AI thẩm định chủ đề, chỉ ra "Winning Angle" trước khi bắt đầu.
- [x] **Chiến Lược Video**: Tuân thủ công thức "2 Long + 3 Short" ở tuần đầu để định danh kênh.
- [x] **Lưu Trữ Riêng Biệt**: Mỗi user có một file JSON lộ trình riêng trong Database (`TeacherRoadmap.content`).
- [x] **Kết Nối Tool**: Giáo án tự động dẫn sang các tool khác của SeenYT (Script, Rival Scanner, Title Optimizer).

## 2. DANH SÁCH THAY ĐỔI KỸ THUẬT

### Database (`prisma/schema.prisma`)
- Thêm trường `content Json?` vào bảng `TeacherRoadmap`.
- Dùng để lưu toàn bộ cây giáo án 30 ngày sau khi AI sinh ra.

### AI Logic (`lib/ai-teacher.ts`)
- Đã chuyển sang dùng **Google Gemini** (`gemini-1.5-flash`).
- **Ưu điểm**: Chi phí cực rẻ (gần như miễn phí với tier thấp), tốc độ nhanh.
- **Output**: JSON 30 ngày, mỗi ngày có: Title, TeacherMessage, Lesson, Checklist, ToolNudges.

### API Endpoints
- `POST /api/tools/thay-youtube/init`:
  - Gọi `generateTeacherRoadmap` qua Gemini.
  - Lưu kết quả vào DB.
- `GET /api/tools/thay-youtube/roadmap`:
  - Ưu tiên đọc từ `roadmap.content` (DB).

## 3. LƯU Ý CHO OWNER (CONFIG & COST)

1. **Gemini Key**: Cần set `GEMINI_API_KEY` trong file `.env`. 
2. **Cost**: Rất thấp. Gemini Flash miễn phí 15 RPM (requests per minute), đủ cho giai đoạn đầu.
3. **Latency**: Quá trình sinh mất 10-20 giây.

## 4. CHECKLIST QA
1. **Test Tạo Mới**:
   - Vào tool -> Nhập "Review Phim Kinh Dị".
   - Đợi 15s -> Check xem giáo án Day 0 có nhắc đến "Phim Kinh Dị" không.
2. **Test Database**:
   - Sử dụng `npx prisma studio` để kiểm tra dữ liệu JSON.

---
**Trạng thái hệ thống**: READY TO USE.
Admin có thể test ngay bằng lệnh `npm run dev`.

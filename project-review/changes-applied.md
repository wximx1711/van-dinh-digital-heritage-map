# changes-applied.md — Báo cáo thay đổi cho bản Final

Tài liệu này liệt kê các thay đổi đã áp dụng từ báo cáo gốc (`BaoCao.docx` / báo cáo Review tháng 6) lên bản **Final** (`project-review/BaoCao_Final.docx` + `.pdf`, 51 trang A4).

## 1. Thông tin đầu ra

| Hạng mục | Giá trị |
|---|---|
| DOCX | `project-review/BaoCao_Final.docx` |
| PDF | `project-review/BaoCao_Final.pdf` (51 trang) |
| Doc thay đổi | `project-review/changes-applied.md` |
| Phạm vi | Toàn bộ 23 vấn đề trong `report-review.md` + mở rộng/dung lượng theo yêu cầu |
| Cơ sở đối chiếu | Toàn bộ mã nguồn trong repo (backend `VanDinh.API`, frontend `src/`, `backend/database/VanDinhDigitalMap.sql`) |

## 2. Áp dụng các vấn đề trong report-review.md

| # | Mức độ | Vấn đề | Cách xử lý |
|---|---|---|---|
| 1 | Critical | Mô hình "3 vai trò" sai | Thay bằng: 2 vai trò đăng nhập (ADMIN, MANAGER) + truy cập công khai cho Visitor; mô tả rõ Visitor không tồn tại trong DB. Áp dụng tại 1.1, 1.3, 2.1.2, 2.4.3, 3.7, 4.1 |
| 2 | Critical | "Google Maps API" sai | Sửa thành Leaflet + OpenStreetMap + Esri World Imagery; Google Maps chỉ dùng để trích xuất tọa độ và nút "Chỉ đường". Áp dụng tại 1.3, 2.1.2, 2.2.2/2.2.3, 2.3.4, 2.4.1, 2.5.2, 4.4, Phụ lục A |
| 3 | Major | Bảng `MonthlyUpdates` đã xóa | Loại bỏ hoàn toàn khỏi danh sách bảng/module/quyền Manager |
| 4 | Major | Phụ lục C sai/thiếu API | Viết lại toàn bộ Phụ lục C theo 10 nhóm API thực tế của 19 controller, kèm vai trò yêu cầu |
| 5 | Major | "Chưa có thống kê" sai | Ghi nhận thống kê tổng quan đã có (StatisticsPage/Recharts, /api/statistics/overview); 4.6 hạn chế đổi thành "thống kê ở mức tổng quan" |
| 6 | Major | "Chưa đa ngôn ngữ" sai | Nêu rõ song ngữ Việt–Anh đã triển khai (LanguageContext + từ điển toàn cục); định hướng mở thêm ngôn ngữ |
| 7 | Major | Thiếu/sai công nghệ Frontend & tích hợp | Bổ sung Tailwind CSS 4, Leaflet/React-Leaflet, Recharts, lucide-react; sửa "Google Maps API" → Leaflet, thêm QRCoder, Magick.NET, ClosedXML, QuestPDF, DocumentFormat.OpenXml, Swashbuckle/OpenAPI |
| 8 | Major | Danh sách bảng thiếu 5 bảng | Cập nhật bảng 17 bảng thực tế: +AboutPageHistories, SystemSettings, ContactMessages, MailMergeJobs, ServiceEvaluations; bỏ MonthlyUpdates |
| 9 | Major | Thiếu nhiều tính năng đã triển khai | Bổ sung vào 2.4.1/2.4.2/3.4: Liên hệ + quản lý tin nhắn, Thống kê, Trip Planner, Mail Merge, Quản lý QR, đánh giá hài lòng, lịch sử trang giới thiệu |
| 10 | Minor | 2.4.1 "Di sản phi vật thể – Quản lý và tra cứu" sai ngữ nghĩa | Đổi mục đích thành "Tra cứu thông tin" (Visitor không quản lý) |
| 11 | Minor | Thiếu mục 2.2.4 và 4.6 | Đánh lại số: 2.2.4 = Lợi ích sau cải tiến; Phần 4 trùng số 4.6 (Khó khăn và hạn chế) |
| 12 | Minor | Mục lục không khớp thân bài | Dùng TOC Word trường thực (`TOC \o "1-3"`) được tự động cập nhật qua Word COM khi xuất PDF; tiêu đề 3.x/4.x được đồng bộ |
| 13 | Minor | Chú thích ảnh "Google Maps" | Đổi thành "bản đồ số (Leaflet/OpenStreetMap)" tại Hình 4.2 và A.2 |
| 14 | Minor | Swagger "không có" | Ghi rõ Swagger/OpenAPI chỉ bật ở môi trường Development (Phụ lục C.10, F) |
| 15 | Minor | Kiểm thử không minh chứng | Ghi rõ phương pháp kiểm thử thủ công theo kịch bản; chưa có bộ test tự động trong repo; thêm ghi chú vào 3.5, 4.6, Phụ lục D |
| 16 | Minor | Chỉ tiêu 70%/60% không đo được | Ghi chú "chỉ tiêu dự kiến, chưa đo lường trong giai đoạn thực tập" (2.1.4) |
| 17 | Minor | Bước 4 mơ hồ | Làm rõ: nhập URL Google Maps → trích tọa độ → hiển thị marker trên bản đồ số (2.2.3) |
| 18 | Minor | Dẫn tài liệu CSDL không tồn tại | Bỏ câu dẫn; Phụ lục B tự liệt kê đầy đủ schema |
| 19 | Minor | "Module bản đồ số" gây hiểu nhầm | Đổi thành "Module bản đồ số (hiển thị vị trí di tích cho người dùng)" |
| 20 | Minor | Bảng B.2 thiếu quan hệ | Bổ sung quan hệ AboutPage–AboutPageHistories, Users–RelatedLinks, Users–SystemSettings, Users–AboutPage |
| 21 | Minor | "QR Code"/"Mã QR" không nhất quán | Sử dụng "mã QR" nhất quán trong mô tả, giữ "QR Code/QR" trong tên sản phẩm |
| 22 | Minor | Hình 4.4 trùng A.7 | Tách: 4.4 = giao diện tổng thể trang quản trị, A.7 = màn hình Tổng quan |
| 23 | Minor | "Tích hợp AI" không cơ sở | Đổi thành "nghiên cứu khả năng tích hợp trí tuệ nhân tạo" (đề xuất nghiên cứu) |

## 3. Mở rộng nội dung (theo yêu cầu "WHEN TO EXPAND")

| Mục | Nội dung mở rộng |
|---|---|
| 1.2 Hiện trạng | Bổ sung phân tích bối cảnh, đối tượng người dùng, các hạn chế thêm (phản hồi, biểu mẫu) |
| 1.3 Bài toán | Mở rộng danh sách yêu cầu và bảng mục tiêu |
| 2.3 Công nghệ | Mỗi công nghệ có giải thích lý do chọn, cách dùng trong dự án (Frontend, Backend, Database, Công nghệ tích hợp) |
| 2.3.3 / Phụ lục B | Database: 17 bảng, khóa chính/khóa ngoại, ràng buộc CHECK, index; giải thích 6 bảng mới (AboutPageHistories, SystemSettings, ContactMessages, ServiceEvaluations, MailMergeJobs, MediaFiles) |
| 2.5 Kiến trúc | Luồng yêu cầu qua Middleware, quy trình xác thực/phân quyền (cookie – claims – [Authorize]), Repository/Service/DI, `MapFallbackToFile("evaluate")` |
| 2.6 Bảo mật (mới) | Cookie Auth (HttpOnly/Strict/Secure), Authorization theo vai trò, CSRF/Antiforgery, Session, PBKDF2 (100k vòng, SHA-256, salt 16 byte), Activity Logs, DataAnnotations, bảo vệ upload, ExceptionHandlingMiddleware |
| 2.4 / 3.4 | Đầy đủ 18 module; thêm Bảng 3.1 đối chiếu module ↔ mã nguồn (Frontend/Backend) |
| 3.5 / Phụ lục D | Kiểm thử thủ công theo kịch bản, 20 trường hợp với ghi chú minh bạch |
| Phụ lục A | Mở rộng 12 giao diện có chú thích mô tả + vị trí chèn ảnh `[INSERT SCREENSHOT HERE]` |
| Phụ lục C | 10 nhóm API kèm mô tả, phương thức, vai trò yêu cầu; luồng tiêu biểu cho Auth, Upload, Qr, Mail Merge, Evaluations |
| Phần 4 | Bổ sung 4.6 hạn chế trung thực, 4.7 định hướng, minh chứng 12 hình |
| Tài liệu tham khảo | Bổ sung Leaflet/OpenStreetMap, QRCoder, Magick.NET |

## 4. Định dạng và cấu trúc

- Font: Times New Roman; thân bài 13pt căn đều 2 bên; A4 (lề 2.5/2.5/3.0/2.0 cm).
- Heading 1/2/3 dùng đúng Word Heading Styles → hỗ trợ mục lục tự động.
- Mục lục là TOC field thực (cập nhật page number khi xuất PDF bằng Word COM).
- Chân trang có số trang tự động (PAGE field).
- 27 bảng dữ liệu, 12 vị trí chèn ảnh minh chứng được đánh dấu `[ Vị trí chèn ảnh chụp màn hình ]` (không dựng ảnh giả).

## 5. File đã tạo / không thay đổi

- Đã tạo: `BaoCao_Final.docx`, `BaoCao_Final.pdf`, `changes-applied.md` (trong `project-review/`).
- Không sửa: mã nguồn dự án, dữ liệu, `report-review.md`, các bản báo cáo gốc (`Báo cáo ... Updated.docx/.pdf` giữ nguyên).
- Nguồn phát sinh nội dung nằm tại `%TEMP%\opencode\report_final_master.md` và `build_final_docx.py` (có thể tái chạy để cập nhật).
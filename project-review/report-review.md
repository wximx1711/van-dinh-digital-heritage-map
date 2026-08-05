# Báo cáo rà soát: "Báo cáo đề xuất giải pháp chuyển đổi số – Bản đồ di sản số xã Vân Đình"

- Tài liệu được rà soát: `project-review/Báo cáo Bản đồ di sản số xã Vân Đình.pdf` (39 trang PDF)
- Cơ sở đối chiếu (nguồn duy nhất): toàn bộ mã nguồn trong repository hiện tại (backend `VanDinh.API`, frontend `src/`, DB snapshot `backend/database/VanDinhDigitalMap.sql`, migrations)
- Ngày rà soát: 2026-08-05
- Số vấn đề phát hiện: **23** (2 Critical, 9 Major, 12 Minor)

> Ghi chú về số trang: báo cáo đánh số "N | Page" (4–39). Bên dưới, mỗi mục ghi kèm cả số trang PDF và tiêu đề chương để dễ tra cứu trong file Word gốc.

---

## TÓM TẮT PHÁT HIỆN

| # | Mức độ | Nội dung chính | Vị trí trong báo cáo |
|---|--------|----------------|----------------------|
| 1 | Critical | Mô hình "3 vai trò Visitor, Manager, Admin" không đúng; hệ thống chỉ có 2 vai trò (ADMIN, MANAGER) + truy cập ẩn danh | 1.1, 1.3, 2.1.2, 2.4.3, 3.7, 4.1 |
| 2 | Critical | Bản đồ hiển thị là Leaflet + OpenStreetMap/Esri, KHÔNG phải Google Maps API | 1.3, 2.1.2, 2.2.2, 2.2.3, 2.3.4, 2.4.1, 2.5.2, 4.4, Phụ lục A, 4.5 |
| 3 | Major | Bảng `MonthlyUpdates` và chức năng "quản lý cập nhật theo tháng" đã bị XÓA khỏi hệ thống nhưng vẫn được mô tả | 2.3.3, 2.4.2, 3.4, Phụ lục B.1 |
| 4 | Major | Phụ lục C (danh sách API) sai route và thiếu nhiều endpoint thực tế | Phụ lục C.1–C.4 |
| 5 | Major | Báo cáo nói "Chưa tích hợp chức năng thống kê" trong khi hệ thống đã có trang Thống kê + Dashboard | 4.7, 4.8 |
| 6 | Major | Báo cáo nói "Chưa hỗ trợ đa ngôn ngữ" trong khi toàn bộ giao diện đã song ngữ Việt–Anh | 2.1.3, 4.7 |
| 7 | Major | Mục "Công nghệ/Công cụ" (Frontend + tích hợp) thiếu Tailwind CSS, Leaflet, Recharts; ghi sai "Google Maps API" | 2.3.1, 2.3.4 |
| 8 | Major | Danh sách bảng CSDL không đầy đủ (thiếu 5 bảng thực tế) | 2.3.3, Phụ lục B.1 |
| 9 | Major | Nhiều tính năng đã triển khai không xuất hiện trong báo cáo (Liên hệ, Thống kê, Trip Planner, Điền biểu mẫu tự động, Quản lý tin nhắn liên hệ, đánh giá hài lòng…) | 2.4.1, 2.4.2, 3.4 |
| 10 | Minor | Các mục còn lại: sai tiêu đề TOC, lỗi đánh số mục (2.2.4, 4.6), chú thích ảnh, kết quả kiểm thử không có minh chứng… | nhiều nơi |

---

## PHẦN A — TỪNG VẤN ĐỀ CHI TIẾT (theo định dạng yêu cầu)

---

### VẤN ĐỀ 1 (CRITICAL) — Mô hình phân quyền "ba vai trò"

----------------------------------------
**Section:**
Trang 4 (PDF) – Mục 1.1 "Thông tin sinh viên & đơn vị thực tập" (lặp lại ở trang 7 – 1.3, trang 9 – 2.1.2, trang 14 – 2.4.3, trang 22 – 3.7, trang 23 – 4.1)

**Current report text:**
"Giải pháp được phát triển dưới dạng ứng dụng Web với mô hình phân quyền ba vai trò gồm Visitor, Manager và Admin." … "Thiết lập cơ chế phân quyền người dùng theo ba vai trò: Visitor, Manager và Admin." … "Hỗ trợ phân quyền người dùng theo ba vai trò."

**Problem:**
Không tồn tại vai trò "Visitor" trong hệ thống. Visitor là khái niệm người dùng ẩn danh (không cần đăng nhập), không phải một role trong database. Database chỉ seed đúng 2 vai trò: ADMIN và MANAGER. Đây là khẳng định kiến trúc trọng tâm được lặp lại khoảng 6 lần trong báo cáo và không khớp với hiện thực.

**Evidence from source code:**
- `backend/VanDinh.API/Data/DbInitializer.cs:18-21` — chỉ tạo 2 roles: `ADMIN`, `MANAGER`.
- `src/app/components/AuthContext.tsx:55-57` — frontend chỉ kiểm tra `role === 'ADMIN'` / `role === 'MANAGER'`; không có khái niệm Visitor.
- `backend/VanDinh.API/Controllers/HeritageController.cs:56,95,157` — `[Authorize(Roles = "MANAGER")]`; `UsersController` chỉ cho ADMIN (phân quyền/đổi role).
- Bảng `Roles` trong `backend/database/VanDinhDigitalMap.sql` chỉ có 2 dòng (ADMIN, MANAGER).

**What I should change:**
Thay toàn bộ các câu "phân quyền ba vai trò … Visitor, Manager và Admin" bằng mô tả đúng: 2 vai trò đăng nhập (Manager, Admin) + truy cập công khai không cần tài khoản cho Visitor.

**Suggested replacement:**
"Giải pháp được phát triển dưới dạng ứng dụng Web với cơ chế phân quyền gồm hai vai trò quản trị là Manager và Admin, cùng chế độ truy cập công khai cho Visitor. Visitor truy cập trực tiếp không cần đăng nhập để xem thông tin di sản, bản đồ số và mã QR; Manager chịu trách nhiệm quản lý nội dung; Admin quản lý tài khoản và giám sát hoạt động của hệ thống. Cấu trúc vai trò này phù hợp với đặc tả dự án."

**Severity:** Critical

---

### VẤN ĐỀ 2 (CRITICAL) — "Google Maps" trên thực tế là Leaflet + OpenStreetMap

----------------------------------------
**Section:**
Nhiều vị trí: trang 9 (2.1.2 "Tích hợp Google Maps để hiển thị vị trí các di tích"), trang 10–11 (2.2.2, 2.2.3 "Nhập vị trí Google Maps", "Google Maps + QR Code + Media"), trang 13 (2.3.4 "Google Maps API"), trang 14 (2.4.1 "Google Maps – Hiển thị vị trí di tích"), trang 16–17 (2.5.2, bảng so sánh), trang 25 (4.4 "Hiển thị vị trí: Google Maps"), trang 26 (Hình 4.2 "Chèn ảnh giao diện Google Maps"), trang 29 (Phụ lục A.2 "Trên nền Google Maps")

**Current report text:**
"Tích hợp Google Maps để hiển thị vị trí các di tích." / "Google Maps API" (trong danh sách Công nghệ tích hợp) / "Trang bản đồ số hiển thị vị trí các di tích trên nền Google Maps…"

**Problem:**
Bản đồ tương tác trong ứng dụng được dựng bằng thư viện **Leaflet + react-leaflet** với nền bản đồ **OpenStreetMap** (chế độ roadmap) và **Esri ArcGIS World Imagery** (vệ tinh/hỗn hợp). Google Maps chỉ đóng vai trò: (a) URL Google Maps được nhập trong form quản lý để trích xuất tọa độ (`GoogleMapsCoordinateExtractor`), (b) nút "Chỉ đường" mở liên kết `google.com/maps/dir`. Không có Google Maps JavaScript API, không có API key nào được dùng. Khẳng định "tích hợp Google Maps API" là sai.

**Evidence from source code:**
- `package.json:11-18` — dependencies là `leaflet`, `react-leaflet`, `leaflet.markercluster`, `recharts`, `lucide-react`; **không có** gói Google Maps nào.
- `src/app/components/GoogleMapView.tsx:2-7,92-102` — `MapContainer`/`TileLayer` của react-leaflet, tile URL: `https://{s}.tile.openstreetmap.org/...` và `server.arcgisonline.com/...` (Esri).
- `.env.example:6-7` — "The mapping subsystem uses Leaflet + OpenStreetMap. No API key required for maps or routing."
- `src/app/utils/geo.ts:17-25` — Google Maps chỉ dùng cho nút "Chỉ đường" (`google.com/maps/dir`).
- `src/app/components/HeritageDetail.tsx:40-55,98` — iframe nhúng bản đồ trên trang chi tiết là **OpenStreetMap embed** (`openstreetmap.org/export/embed.html`).
- `backend/VanDinh.API/Services/GoogleMapsCoordinateExtractor.cs` — chỉ parse tọa độ từ chuỗi URL Google Maps (không gọi Google Maps API).
- `README.md:3-5,19,107` (cũng ghi nhầm "Google Maps JavaScript API" — nên sửa kèm).

**What I should change:**
Thay cụm "Google Maps" ở các vị trí mô tả bản đồ hiển thị bằng "Leaflet + OpenStreetMap"; giữ lại Google Maps khi nói về: nhập URL Google Maps để lấy tọa độ và nút "Chỉ đường" mở Google Maps. Trong 2.3.4, bỏ "Google Maps API", thay bằng "Leaflet + OpenStreetMap (bản đồ tương tác)" và "Google Maps URL (trích xuất tọa độ / chỉ đường)".

**Suggested replacement (cho 2.1.2):**
"- Tích hợp bản đồ tương tác dựa trên Leaflet và nền bản đồ OpenStreetMap để hiển thị vị trí các di tích, kèm chế độ vệ tinh (Esri) và liên kết 'Chỉ đường' mở Google Maps."
**Suggested replacement (cho 2.3.4, dòng "Google Maps API"):**
"- Leaflet + OpenStreetMap (bản đồ tương tác)
- Google Maps URL (nhập liên kết Google Maps để tự động trích xuất tọa độ di tích và mở chỉ đường)"

**Severity:** Critical

---

### VẤN ĐỀ 3 (MAJOR) — Bảng `MonthlyUpdates` đã bị xóa, vẫn được mô tả

----------------------------------------
**Section:**
Trang 13 (2.3.3 – danh sách bảng chính: "MonthlyUpdates"), trang 15 (2.4.2 – Manager: "Quản lý dữ liệu cập nhật theo tháng"), trang 20 (3.4 – "Module cập nhật thông tin"), trang 32 (Phụ lục B.1 – "13 MonthlyUpdates Tin tức/Cập nhật")

**Current report text:**
"- MonthlyUpdates" (trong danh sách bảng); "Quản lý dữ liệu cập nhật theo tháng" (quyền Manager); "Module cập nhật thông tin".

**Problem:**
Module và bảng `MonthlyUpdates` đã bị xóa khỏi hệ thống (migration xóa bảng + commit "Remove MonthlyUpdate module"). Bảng này không còn trong database thực tế; giao diện quản trị cũng không có chức năng quản lý cập nhật theo tháng.

**Evidence from source code:**
- `backend/VanDinh.API/Migrations/20260719111342_RemoveMonthlyUpdate.cs:13-15` — `DropTable("MonthlyUpdates")`.
- Git history: commit `be0c452` "Remove MonthlyUpdate module and sync EF Core migration".
- `backend/VanDinh.API/Data/ApplicationDbContext.cs:11-27` — không có DbSet MonthlyUpdates.
- `backend/database/VanDinhDigitalMap.sql` — không có bảng MonthlyUpdates (chỉ có 17 bảng, xem Vấn đề 8).
- `src/app/components/AdminDashboard.tsx:84-102` — menu quản trị không có mục "cập nhật theo tháng".

**What I should change:**
Xóa dòng "MonthlyUpdates" khỏi danh sách bảng (2.3.3, B.1), xóa quyền "Quản lý dữ liệu cập nhật theo tháng" (2.4.2), xóa hoặc đổi tên "Module cập nhật thông tin" (3.4).

**Suggested replacement (2.4.2):** xóa dòng "Quản lý dữ liệu cập nhật theo tháng" — thay bằng "Quản lý tin nhắn liên hệ" (đã triển khai).
**Suggested replacement (3.4):** đổi "Module cập nhật thông tin" thành "Module quản lý tin nhắn liên hệ" hoặc xóa.

**Severity:** Major

---

### VẤN ĐỀ 4 (MAJOR) — Phụ lục C: API sai route và thiếu nhiều endpoint

----------------------------------------
**Section:**
Trang 33–34 (Phụ lục C.1 – C.4)

**Current report text:**
C.3: "/api/intangible GET Danh sách …"; C.4: "/api/media GET Danh sách media", "/api/media/upload POST Upload tệp", "/api/media/{id} DELETE Xóa tệp".

**Problem:**
(1) Route di sản phi vật thể thực tế là `/api/intangible-heritage`, không phải `/api/intangible`. (2) Không tồn tại bất kỳ endpoint `/api/media` nào; thư viện media nằm ở `/api/uploads` với cấu trúc khác hẳn. (3) Phụ lục C thiếu toàn bộ phần lớn API thực tế (14 controller).

**Evidence from source code:**
- `backend/VanDinh.API/Controllers/IntangibleHeritageController.cs:13` — `[Route("api/intangible-heritage")]`.
- `backend/VanDinh.API/Controllers/UploadsController.cs:12,39,77,115,153,185,217,249,308` — `api/uploads` POST `images|videos|documents`, DELETE `images|videos|documents/{mediaFileId}`, GET `list?folder=`, GET `search`.
- Không có file Controller nào route `api/media` (danh sách controller: `grep [Route(` trong `backend/VanDinh.API/Controllers`).

**What I should change:**
Sửa C.3 thành `/api/intangible-heritage`; viết lại C.4 theo `/api/uploads`; bổ sung các nhóm API còn thiếu (xem Phụ lục C gợi ý bên dưới).

**Suggested replacement (C.3):**
| API | Method | Mô tả |
|---|---|---|
| /api/intangible-heritage | GET | Danh sách di sản phi vật thể (hỗ trợ tìm kiếm q, lọc category, phân trang) |
| /api/intangible-heritage/{id} | GET | Chi tiết |
| /api/intangible-heritage | POST | Thêm (Manager) |
| /api/intangible-heritage/{id} | PUT | Cập nhật (Manager) |
| /api/intangible-heritage/{id} | DELETE | Xóa (Manager) |

**Suggested replacement (C.4):**
| API | Method | Mô tả |
|---|---|---|
| /api/uploads/images, /api/uploads/videos, /api/uploads/documents | POST | Upload tệp theo loại (Manager) |
| /api/uploads/list?folder= | GET | Danh sách media (Manager) |
| /api/uploads/search | GET | Tìm kiếm media (Manager) |
| /api/uploads/{images\|videos\|documents}/{mediaFileId} | DELETE | Xóa tệp (Manager) |

**Nên bổ sung thêm các nhóm API đang thiếu:** /api/heritage/{id}/duplicate; /api/heritage/{id}/media/images|videos|documents; /api/heritage-categories; /api/users (gồm role, status, reset-password); /api/about/history; /api/system-settings; /api/related-links; /api/activity-logs; /api/contact; /api/contact-messages; /api/statistics/overview; /api/qr/heritage|intangible|evaluation/...; /api/security/csrf-token; /api/evaluations (gồm export/excel, export/pdf); /api/mail-merge; /api/health.

**Severity:** Major

---

### VẤN ĐỀ 5 (MAJOR) — "Chưa tích hợp chức năng thống kê" nhưng thống kê đã có

----------------------------------------
**Section:**
Trang 28 (4.7 – "Chưa tích hợp chức năng thống kê và báo cáo nâng cao") và (4.8 – "Phát triển bảng điều khiển thống kê (Dashboard) phục vụ công tác quản lý")

**Current report text:**
"Chưa tích hợp chức năng thống kê và báo cáo nâng cao." / "- Phát triển bảng điều khiển thống kê (Dashboard) phục vụ công tác quản lý."

**Problem:**
Hệ thống đã có trang Thống kê công khai (biểu đồ Pie/Bar với Recharts), API `/api/statistics/overview`, và Dashboard quản trị hiển thị số liệu tổng quan. Câu "chưa tích hợp chức năng thống kê" và định hướng "phát triển Dashboard" mâu thuẫn với mã nguồn. (Lưu ý: chức năng này có nhưng trang Thống kê hiện chưa được đặt link trong menu chính — cần thêm hoặc nói rõ.)

**Evidence from source code:**
- `src/app/components/StatisticsPage.tsx` — trang thống kê công khai (Recharts: `PieChart`, `BarChart`…, dòng 14).
- `src/app/components/AdminDashboard.tsx:452-586` — Dashboard quản trị với thẻ số liệu, "Recent Updates", "Heritage Status".
- `backend/VanDinh.API/Controllers/StatisticsController.cs` — `GET /api/statistics/overview`.
- `src/app/App.tsx:21,336` — route `statistics` đã đăng ký (chưa có link điều hướng đến).

**What I should change:**
Sửa 4.7 và 4.8: bỏ khẳng định "chưa tích hợp thống kê"; ghi nhận thống kê cơ bản đã có, định hướng là *mở rộng* thống kê nâng cao (biểu đồ chi tiết, báo cáo xuất Excel/PDF đánh giá).

**Suggested replacement (4.7, sửa dòng):**
"- Chức năng thống kê hiện ở mức tổng quan, chưa có báo cáo chi tiết cho từng nhóm người dùng; các báo cáo nâng cao (xuất Excel/PDF dữ liệu đánh giá) đã có sẵn phía hệ thống đánh giá."
**Suggested replacement (4.8, sửa dòng):**
"- Mở rộng bảng điều khiển thống kê (Dashboard) với các biểu đồ và báo cáo chi tiết hơn phục vụ công tác quản lý."

**Severity:** Major

---

### VẤN ĐỀ 6 (MAJOR) — "Chưa hỗ trợ đa ngôn ngữ" nhưng giao diện đã song ngữ

----------------------------------------
**Section:**
Trang 9 (2.1.3 – mục tiêu trung hạn: "Hỗ trợ đa ngôn ngữ nhằm phục vụ khách du lịch quốc tế"), trang 28 (4.7 – "Chưa hỗ trợ đa ngôn ngữ")

**Current report text:**
"- Hỗ trợ đa ngôn ngữ nhằm phục vụ khách du lịch quốc tế." (trong mục tiêu trung hạn) ; "- Chưa hỗ trợ đa ngôn ngữ." (trong hạn chế)

**Problem:**
Toàn bộ giao diện đã hỗ trợ chuyển đổi Tiếng Việt/Tiếng Anh (nút chọn ngôn ngữ ở header, từ điển dịch toàn cục, mọi màn hình đều hiển thị `lang === 'vi' ? … : …`). Khẳng định "chưa hỗ trợ" là sai và mâu thuẫn với chính báo cáo (2.1.2 đã nói "Website cho phép người dân và du khách tra cứu"…).

**Evidence from source code:**
- `src/app/components/LanguageContext.tsx:3,11-238,258-274` — Provider song ngữ vi/en, lưu lựa chọn vào localStorage.
- `src/app/components/Header.tsx:122-165` — nút chuyển ngôn ngữ 🇻🇳/🇬🇧 trên mọi trang.
- Tất cả component dùng `useLanguage()` (ví dụ `HomePage.tsx`, `MapPage.tsx`, `HeritageDetail.tsx`…).

**What I should change:**
Xóa "Hỗ trợ đa ngôn ngữ" khỏi mục tiêu trung hạn (2.1.3) và xóa "Chưa hỗ trợ đa ngôn ngữ" khỏi hạn chế (4.7). Có thể thay bằng định hướng mở rộng thêm ngôn ngữ khác ngoài Việt–Anh.

**Suggested replacement (2.1.3, thay dòng):**
"- Mở rộng hỗ trợ thêm ngôn ngữ (ngoài Tiếng Việt và Tiếng Anh hiện có) nhằm phục vụ khách du lịch quốc tế."
**Suggested replacement (4.7):** xóa dòng "Chưa hỗ trợ đa ngôn ngữ."

**Severity:** Major

---

### VẤN ĐỀ 7 (MAJOR) — Mục Công nghệ thiếu/sai thư viện frontend và tích hợp

----------------------------------------
**Section:**
Trang 12 (2.3.1 Frontend), trang 13 (2.3.4 Công nghệ tích hợp)

**Current report text:**
"Frontend: React, TypeScript, Vite, HTML5, CSS3." / "Công nghệ tích hợp: Google Maps API, QR Code Generator, Cookie Authentication, CSRF Protection, Activity Logging, Image Processing, Media Upload."

**Problem:**
Danh sách Frontend thiếu các công nghệ chính đang dùng: **Tailwind CSS 4**, **Leaflet/React-Leaflet** (thư viện bản đồ — quan trọng nhất), **Recharts** (biểu đồ thống kê). Mục tích hợp ghi "Google Maps API" sai (xem Vấn đề 2) và thiếu: QRCoder, Magick.NET, ClosedXML, QuestPDF, DocumentFormat.OpenXml, Swashbuckle (Swagger), Leaflet.markercluster.

**Evidence from source code:**
- `package.json:10-26` — react 18.3.1, leaflet, react-leaflet, leaflet.markercluster, recharts, lucide-react, tailwindcss 4.1.12, @tailwindcss/vite, vite 6.3.5.
- `vite.config.ts:24-25` — plugin `tailwindcss()`.
- `backend/VanDinh.API/VanDinh.API.csproj:14-26` — QRCoder, Magick.NET-Q16-AnyCPU, ClosedXML, QuestPDF, DocumentFormat.OpenXml, Swashbuckle.AspNetCore.

**What I should change:**
Bổ sung Tailwind CSS, Leaflet/React-Leaflet, Recharts vào 2.3.1; sửa mục 2.3.4 (bỏ "Google Maps API", thêm QRCoder, ImageMagick/Magick.NET, ClosedXML, QuestPDF, Swagger/OpenAPI, Leaflet.markercluster).

**Suggested replacement (2.3.1):**
"Frontend: React 18, TypeScript, Vite, Tailwind CSS 4, Leaflet/React-Leaflet (bản đồ), Recharts (biểu đồ thống kê), HTML5, CSS3."

**Severity:** Major

---

### VẤN ĐỀ 8 (MAJOR) — Danh sách bảng CSDL không đầy đủ

----------------------------------------
**Section:**
Trang 13 (2.3.3), trang 32 (Phụ lục B.1)

**Current report text:**
Danh sách 13 bảng (Heritage … MonthlyUpdates).

**Problem:**
Database thực tế có 17 bảng: thiếu **AboutPageHistories**, **SystemSettings**, **ContactMessages**, **MailMergeJobs**, **ServiceEvaluations**; và liệt kê nhầm **MonthlyUpdates** (đã xóa). Bảng B.2 (quan hệ) cũng thiếu các quan hệ mới (AboutPage–AboutPageHistories 1–N, Users–RelatedLinks 1–N, …).

**Evidence from source code:**
- `backend/VanDinh.API/Data/ApplicationDbContext.cs:11-27` — 17 DbSet.
- `backend/database/VanDinhDigitalMap.sql` — danh sách CREATE TABLE: Roles, Users, AboutPage, AboutPageHistories, ActivityLogs, ContactMessages, HeritageCategories, Heritage, HeritageDocuments, HeritageImages, HeritageVideos, IntangibleHeritage, MailMergeJobs, MediaFiles, RelatedLinks, ServiceEvaluations, SystemSettings.

**What I should change:**
Cập nhật danh sách bảng + bảng quan hệ theo thực tế.

**Suggested replacement (2.3.3, danh sách bảng chính):**
"- Heritage, HeritageCategories, HeritageImages, HeritageVideos, HeritageDocuments, IntangibleHeritage, Users, Roles, ActivityLogs, AboutPage, AboutPageHistories, SystemSettings, RelatedLinks, ContactMessages, MediaFiles, MailMergeJobs, ServiceEvaluations"

**Severity:** Major

---

### VẤN ĐỀ 9 (MAJOR) — Nhiều tính năng đã triển khai bị thiếu trong báo cáo

----------------------------------------
**Section:**
Trang 14 (2.4.1 – chức năng người dùng), trang 15 (2.4.2 – chức năng Manager), trang 20 (3.4 – danh sách module)

**Current report text:**
Bảng 2.4.1 chỉ có 8 chức năng (Trang chủ … Trang giới thiệu); 2.4.2 chỉ 8 quyền Manager; 3.4 chỉ 9 module.

**Problem:**
Báo cáo bỏ sót nhiều tính năng đã hoàn thiện (xem thêm Phần B): trang **Liên hệ** + quản lý tin nhắn liên hệ; trang **Thống kê** công khai; **Trip Planner** (lên lịch trình tham quan); module **Điền biểu mẫu tự động (Mail Merge)**; **Quản lý QR Code** trong quản trị; lịch sử chỉnh sửa trang giới thiệu; **đánh giá hài lòng dịch vụ công** (QR kiosk, API đánh giá, xuất báo cáo Excel/PDF).

**Evidence from source code:**
- `src/app/components/ContactPage` (trong `App.tsx:120-223`), `ContactMessagesManagement.tsx`, `backend/VanDinh.API/Controllers/ContactController.cs`, `ContactMessagesController.cs`.
- `src/app/components/StatisticsPage.tsx`, `StatisticsController.cs`.
- `src/app/components/TripPlanner.tsx`, `src/app/services/tripPlannerService.ts`.
- `src/app/components/FormFillingManagement.tsx`, `backend/VanDinh.API/Controllers/MailMergeController.cs`, `Services/MailMerge/*`.
- `src/app/components/QrManagement.tsx`.
- `backend/VanDinh.API/Controllers/EvaluationsController.cs`, `Models/DomainModels.cs:320-334` (ServiceEvaluation), `QrController.cs:36-58` (QR đánh giá), `Program.cs:191` (route `/evaluate`).
- `AboutController.cs:26-38` (lịch sử trang giới thiệu).

**What I should change:**
Bổ sung các chức năng trên vào bảng 2.4.1/2.4.2 và danh sách module 3.4.

**Suggested replacement (bổ sung vào 2.4.1):**
"9 Trang liên hệ — Gửi ý kiến/phản hồi | 10 Trang thống kê — Xem số liệu tổng quan di sản | 11 Lập lịch trình — Lên lộ trình tham quan nhiều di tích"
**Suggested replacement (bổ sung vào 2.4.2):**
"- Quản lý mã QR | - Quản lý tin nhắn liên hệ | - Điền biểu mẫu tự động (Mail Merge) | - Theo dõi đánh giá hài lòng dịch vụ công và xuất báo cáo"

**Severity:** Major

---

### VẤN ĐỀ 10 (MINOR) — Bảng 2.4.1: "Di sản phi vật thể — Quản lý và tra cứu" sai ngữ nghĩa cho người dùng công khai

----------------------------------------
**Section:**
Trang 14 (2.4.1, dòng 4)

**Current report text:**
"4 Di sản phi vật thể Quản lý và tra cứu"

**Problem:**
Visitor không quản lý được gì; chức năng công khai chỉ là tra cứu/xem. Từ "Quản lý" gây hiểu nhầm.

**Evidence from source code:**
- `src/app/components/IntangiblePage.tsx` — trang công khai chỉ hiển thị danh sách/chi tiết.

**What I should change:**
Đổi cột "Mục đích" thành "Tra cứu thông tin di sản phi vật thể".

**Severity:** Minor

---

### VẤN ĐỀ 11 (MINOR) — Lỗi đánh số mục: thiếu 2.2.4 và 4.6

----------------------------------------
**Section:**
Trang 11 (sau 2.2.3 nhảy thẳng tới 2.2.5); trang 27 (sau 4.5 nhảy thẳng tới 4.7)

**Current report text:**
"2.2.3. Quy trình hoạt động … 2.2.5. Lợi ích sau cải tiến" ; "4.5. Minh chứng kết quả … 4.7. Những khó khăn và hạn chế"

**Problem:**
Đánh số mục bị nhảy; dễ bị hội đồng đánh giá phát hiện là sót nội dung.

**What I should change:**
Đánh lại số: 2.2.4 cho "Lợi ích sau cải tiến" (hoặc thêm mục 2.2.4 mới); 4.6 cho mục trước "Những khó khăn và hạn chế" (hiện đang gán 4.7).

**Severity:** Minor

---

### VẤN ĐỀ 12 (MINOR) — Mục lục không khớp tiêu đề nội dung (Phần 3 và Phần 4)

----------------------------------------
**Section:**
Trang 3 (MỤC LỤC) so với trang 18–28 (nội dung)

**Current report text:**
Mục lục: "3.1 Lộ trình triển khai; 3.2 Vai trò và đóng góp của sinh viên; 3.3 Phối hợp với đơn vị & kế hoạch duy trì; 4.1 Hiệu quả đạt được / dự kiến đạt được; 4.2 Phản hồi của đơn vị; 4.3 Minh chứng sản phẩm" — trong khi nội dung là "3.1 Kế hoạch triển khai; 3.2 WBS; 3.3 Kế hoạch tiến độ; 3.4 Quá trình phát triển; 3.5 Kiểm thử; 3.6 Khó khăn; 3.7 Đánh giá; 4.1 Kết quả đạt được; 4.2 Đánh giá mức độ hoàn thành; 4.3 Hiệu quả của giải pháp; 4.4 So sánh trước và sau; 4.5 Minh chứng kết quả…"

**Problem:**
Tựa đề các mục trong MỤC LỤC và tiêu đề trong thân bài khác nhau hoàn toàn ở Phần 3 và Phần 4 (có vẻ mục lục chưa cập nhật sau khi đổi cấu trúc).

**What I should change:**
Cập nhật lại MỤC LỤC cho khớp với tiêu đề thực tế trong thân bài.

**Severity:** Minor

---

### VẤN ĐỀ 13 (MINOR) — Chú thích ảnh bản đồ ghi "Google Maps"

----------------------------------------
**Section:**
Trang 26 (Hình 4.2), trang 29 (Hình A.2), trang 37 (Phụ lục F "Bản đồ số")

**Current report text:**
"Hình 4.2. Trang bản đồ số (Chèn ảnh giao diện Google Maps tại đây)" ; "Hình A.2. Trang bản đồ số (Chèn ảnh Google Maps) … hiển thị vị trí các di tích trên nền Google Maps"

**Problem:**
Nếu chèn ảnh chụp thật của trang bản đồ, ảnh sẽ hiển thị nền OpenStreetMap/Leaflet chứ không phải Google Maps — chú thích sai sẽ bị xem là minh chứng không trung thực.

**What I should change:**
Đổi chú thích thành "giao diện bản đồ số" (không ghi thương hiệu), hoặc "giao diện bản đồ Leaflet/OpenStreetMap".

**Suggested replacement (Hình 4.2 / A.2):**
"Chèn ảnh giao diện trang bản đồ số (Leaflet – OpenStreetMap) tại đây"

**Severity:** Minor

---

### VẤN ĐỀ 14 (MINOR) — Chú thích Swagger: chỉ khả dụng ở môi trường Development

----------------------------------------
**Section:**
Trang 37 (Phụ lục F: "Hình C.1 Tài liệu API (Swagger/OpenAPI, nếu có)")

**Current report text:**
"Hình C.1 Tài liệu API (Swagger/OpenAPI, nếu có)"

**Problem:**
Swagger có tồn tại (Swashbuckle) nhưng chỉ được bật trong môi trường Development; khi deploy Production không truy cập được `/swagger`. Nếu minh chứng bằng ảnh Swagger cần chạy môi trường phát triển.

**Evidence from source code:**
- `backend/VanDinh.API/Program.cs:164-177` — `if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(...); } else { app.UseHsts(); }`.

**What I should change:**
Ghi rõ: "Hình C.1 Tài liệu API (Swagger/OpenAPI — chỉ bật ở môi trường phát triển)".

**Severity:** Minor

---

### VẤN ĐỀ 15 (MINOR) — Phụ lục D / 3.5: kết quả kiểm thử không có minh chứng trong repo

----------------------------------------
**Section:**
Trang 21 (3.5 Kiểm thử hệ thống), trang 35 (Phụ lục D – tất cả "Đạt")

**Current report text:**
"Kết quả kiểm thử cho thấy các chức năng cốt lõi của hệ thống hoạt động ổn định…" ; bảng D.1 tất cả 12 dòng "Đạt".

**Problem:**
Trong repository không tồn tại dự án kiểm thử (unit/integration test), thư mục `test-results/` trống, không có bất kỳ script kiểm thử nào. Nếu kiểm thử là thủ công, báo cáo nên ghi rõ là kiểm thử thủ công kèm minh chứng (ảnh/ghi chú) thay vì để mặc định tin được.

**Evidence from source code:**
- Không có project test trong `backend/`; `test-results/` rỗng.
- `package.json:6-9` — không có script test phía frontend.

**What I should change:**
Ghi rõ phương thức kiểm thử (thủ công, kịch bản, ngày thực hiện) và đính kèm minh chứng; nếu có unit test hãy thêm vào repo và nói rõ trong báo cáo.

**Severity:** Minor

---

### VẤN ĐỀ 16 (MINOR) — Chỉ tiêu định lượng không có cơ chế đo lường

----------------------------------------
**Section:**
Trang 9 (2.1.4 – Mục tiêu định lượng)

**Current report text:**
"Tra cứu thông tin: Giảm trên 70% thời gian tìm kiếm; Cập nhật dữ liệu: Giảm trên 60% thao tác thủ công"

**Problem:**
Các con số 70%/60% không có khảo sát trước/sau, không có cơ chế đo lường nào trong hệ thống để chứng minh; phần 4 cũng không có mục nào tổng kết lại các chỉ tiêu này. Báo cáo không tự kiểm chứng được.

**What I should change:**
Hoặc ghi rõ là "mục tiêu dự kiến, chưa đo lường trong giai đoạn này", hoặc bổ sung mục đánh giá kết quả so với chỉ tiêu.

**Severity:** Minor

---

### VẤN ĐỀ 17 (MINOR) — "Bước 4: Nhập vị trí Google Maps" cần nói rõ cơ chế thực tế

----------------------------------------
**Section:**
Trang 11 (2.2.3 – Bước 4) và trang 11 (2.2.2 sơ đồ)

**Current report text:**
"Bước 4: Nhập vị trí Google Maps."

**Problem:**
Thực tế Manager nhập URL Google Maps, hệ thống tự trích xuất tọa độ (lat/lng) và hiển thị trên bản đồ Leaflet. Nên mô tả đúng chuỗi: nhập link → trích tọa độ → chấm marker trên bản đồ.

**Evidence from source code:**
- `backend/VanDinh.API/Services/HeritageService.cs:170,297` — `ExtractCoordinatesAsync(request.GoogleMapUrl)`.
- `src/app/components/HeritageManagement.tsx:279-281,727` — form bắt buộc nhập Google Maps URL hợp lệ.

**Suggested replacement:**
"Bước 4: Nhập liên kết Google Maps của di tích; hệ thống tự trích xuất tọa độ và hiển thị vị trí trên bản đồ số."

**Severity:** Minor

---

### VẤN ĐỀ 18 (MINOR) — Thuật ngữ "tài liệu thiết kế cơ sở dữ liệu" chưa tồn tại trong repo

----------------------------------------
**Section:**
Trang 13 (2.3.3, cuối)

**Current report text:**
"Các thực thể và quan hệ này được mô tả chi tiết trong tài liệu thiết kế cơ sở dữ liệu của dự án."

**Problem:**
Không có tài liệu thiết kế CSDL riêng trong repo (chỉ có `docs/architecture-phase-1-report.md` là báo cáo kiến trúc cũ từ 2026-06-30 — nội dung cũ, nói về kế hoạch chuyển sang Spring Boot + MySQL không còn đúng). Nếu báo cáo dẫn tài liệu, cần đảm bảo tài liệu đó thực sự tồn tại hoặc đính kèm.

**Evidence from source code:**
- `docs/` chỉ có `architecture-phase-1-report.md` (mô tả hiện trạng tháng 6/2026, đã lỗi thời).

**What I should change:**
Đính kèm hoặc tạo tài liệu thiết kế CSDL và dẫn đúng tên; không dẫn tài liệu không tồn tại.

**Severity:** Minor

---

### VẤN ĐỀ 19 (MINOR) — "Module bản đồ số" và "Module quản lý bản đồ" trong quản trị

----------------------------------------
**Section:**
Trang 20 (3.4 – "Module bản đồ số"), trang 15 (2.4.2)

**Current report text:**
"Module bản đồ số."

**Problem:**
Không có màn hình "quản lý bản đồ" riêng trong quản trị: bản đồ chỉ được hiển thị công khai; vị trí được nhập qua form di tích (Google Maps URL). Khái niệm module gây hiểu lầm là có giao diện quản lý bản đồ riêng.

**Evidence from source code:**
- `src/app/components/AdminDashboard.tsx:84-102` — menu quản trị không có mục "Bản đồ" (chỉ có heritage, intangible, categories, about, media, qr, settings, contact-messages, form-filling).
- `LanguageContext.tsx:100` — nhãn `admin.map_mgmt` tồn tại trong từ điển nhưng không được dùng.

**What I should change:**
Đổi thành "Module bản đồ số (hiển thị vị trí di tích cho người dùng)".

**Severity:** Minor

---

### VẤN ĐỀ 20 (MINOR) — Bảng B.2 thiếu quan hệ giữa các bảng mới

----------------------------------------
**Section:**
Trang 32–33 (Phụ lục B.2)

**Current report text:**
5 dòng quan hệ (Roles–Users, HeritageCategories–Heritage, Heritage–HeritageImages/Videos/Documents, Users–ActivityLogs).

**Problem:**
Thiếu quan hệ: AboutPage–AboutPageHistories (1–N), Users–RelatedLinks (1–N, qua CreatedBy), Users–AboutPage/SystemSettings (1–N, qua UpdatedBy), và quan hệ nhiều di tích tham chiếu cùng MediaFiles (usage tracking).

**What I should change:**
Bổ sung các dòng quan hệ còn thiếu.

**Suggested replacement (thêm vào B.2):**
| AboutPage | AboutPageHistories | 1 - N |
| Users | RelatedLinks | 1 - N |
| Users | ActivityLogs | 1 - N (đã có) |
| Heritage | MediaFiles | N - 1 (tham chiếu cùng tệp media) |

**Severity:** Minor

---

### VẤN ĐỀ 21 (MINOR) — Báo cáo dùng cả "QR Code" và "Mã QR" không nhất quán

----------------------------------------
**Section:**
Toàn bộ tài liệu (vd. trang 6, 10, 11, 14, 17, 25)

**Current report text:**
"QR Code" (2.2.5, 2.5.2, 4.4) và "Mã QR" (1.2.2, 1.3, 2.1.2, 2.4.1, 4.3) xen kẽ.

**Problem:**
Thiếu nhất quán thuật ngữ; nên thống nhất một cách dùng xuyên suốt (khuyến nghị "Mã QR (QR Code)" lần đầu, sau đó "mã QR").

**What I should change:**
Thống nhất thuật ngữ trên toàn tài liệu.

**Severity:** Minor

---

### VẤN ĐỀ 22 (MINOR) — Mô tả "Hình 4.4 Trang quản trị (Dashboard)" trùng lặp với Phụ lục A.7

----------------------------------------
**Section:**
Trang 26 (4.5 – Hình 4.4) và trang 31 (Phụ lục A.7)

**Current report text:**
"Hình 4.4. Trang quản trị (Chèn ảnh Dashboard tại đây)" ; "Hình A.7. Dashboard quản trị"

**Problem:**
Hai hình dự kiến cùng chụp một màn hình Dashboard; nên dùng một trong hai để tránh trùng lặp, hoặc 4.4 chụp tổng thể trang quản trị (sidebar) còn A.7 chụp Dashboard.

**What I should change:**
Phân định rõ nội dung hai ảnh (ví dụ 4.4 = giao diện tổng thể trang quản trị, A.7 = màn hình Tổng quan).

**Severity:** Minor

---

### VẤN ĐỀ 23 (MINOR) — Định hướng "tích hợp trí tuệ nhân tạo" không có cơ sở kỹ thuật

----------------------------------------
**Section:**
Trang 28 (4.8 – định hướng phát triển)

**Current report text:**
"- Tích hợp trí tuệ nhân tạo để hỗ trợ tìm kiếm và gợi ý nội dung."

**Problem:**
Không có yếu tố AI nào trong hệ thống hiện tại và cũng không có đặc tả nào trong repo đề cập AI; đây là phát biểu không được hỗ trợ bởi mã nguồn/tài liệu dự án (không sai về bản chất, nhưng không có cơ sở — nếu giữ, nên đổi thành "đề xuất nghiên cứu" thay vì "định hướng phát triển").

**What I should change:**
Giữ như một đề xuất nghiên cứu (không khẳng định là kế hoạch có cơ sở kỹ thuật hiện hữu), hoặc bỏ.

**Severity:** Minor

---

## PHẦN B — ĐỐI CHIẾU THEO YÊU CẦU BỔ SUNG

### 1. Tính năng ĐÃ triển khai nhưng KHÔNG có trong báo cáo

| Tính năng | Bằng chứng mã nguồn | Ghi chú sửa báo cáo |
|---|---|---|
| Trang Liên hệ + quản lý tin nhắn (Contact) | `src/app/App.tsx:120-223`; `backend/.../Controllers/ContactController.cs`, `ContactMessagesController.cs`; `ContactMessagesManagement.tsx` | Bổ sung vào 2.4.1/2.4.2 |
| Trang Thống kê công khai (Recharts) | `StatisticsPage.tsx`; `StatisticsController.cs`; `App.tsx:336` | Bổ sung vào 2.4.1; sửa 4.7/4.8 (Vấn đề 5) |
| Trip Planner (lập lộ trình tham quan) | `TripPlanner.tsx`; `services/tripPlannerService.ts`; `MapPage.tsx:716-727` | Bổ sung vào 2.4.1 |
| Điền biểu mẫu tự động (Mail Merge) | `FormFillingManagement.tsx`; `MailMergeController.cs`; `Services/MailMerge/*`; migration `20260803033515_AddMailMergeJobs` | Bổ sung vào 2.4.2 |
| Quản lý QR trong quản trị | `QrManagement.tsx`; `QrController.cs` | Bổ sung vào 2.4.2 |
| Đánh giá hài lòng dịch vụ công (kiosk QR, thống kê, xuất Excel/PDF) | `EvaluationsController.cs`; `ServiceEvaluation` (DomainModels.cs:320); `QrController.cs:36-58`; `Program.cs:191` | Bổ sung vào 2.4.2 (lưu ý: backend đã có, nhưng chưa có trang frontend cho kiosk `/evaluate`) |
| Lịch sử chỉnh sửa trang giới thiệu | `AboutPageHistories`; `AboutController.cs:26-38` | Có thể nêu trong mô tả tính năng 2.4.2 |
| Song ngữ Việt–Anh | `LanguageContext.tsx`; `Header.tsx:122-165` | Sửa 2.1.3/4.7 (Vấn đề 6) |
| Cài đặt hệ thống gồm cả liên kết liên quan | `SystemSettingsManagement.tsx` (quản lý related-links bên trong); `SystemSettingsController.cs` | 2.4.2 đã có "Quản lý cài đặt hệ thống" — có thể bổ sung ghi chú liên kết nằm trong cài đặt |

### 2. Tính năng có trong báo cáo nhưng KHÔNG triển khai (hoặc đã bị gỡ)

| Mô tả trong báo cáo | Trạng thái | Bằng chứng |
|---|---|---|
| "Quản lý dữ liệu cập nhật theo tháng" (2.4.2), bảng `MonthlyUpdates` (2.3.3, B.1), "Module cập nhật thông tin" (3.4) | **Đã xóa** | Migration `20260719111342_RemoveMonthlyUpdate.cs`; commit `be0c452` |
| "Phân quyền ba vai trò Visitor, Manager, Admin" (1.1, 1.3, 2.1.2, 3.7, 4.1) | **Chưa đúng** — chỉ 2 role + truy cập công khai | `DbInitializer.cs:18-21`; `AuthContext.tsx:55-57` |
| "Mobile App" (2.1.3) | Đúng (chưa có) — giữ nguyên | không có mã nguồn mobile |
| "Đa ngôn ngữ" (2.1.3, 4.7) | **Đã triển khai** — cần sửa | Vấn đề 6 |
| "Thống kê/Dashboard" (4.7, 4.8) | **Đã triển khai** — cần sửa | Vấn đề 5 |

### 3. Công nghệ ghi sai/thiếu

- **Sai:** "Google Maps API" (2.3.4) → thực tế là Leaflet + OpenStreetMap/Esri (Vấn đề 2, 7).
- **Thiếu (Frontend):** Tailwind CSS 4, Leaflet/React-Leaflet, leaflet.markercluster, Recharts (2.3.1).
- **Thiếu (Backend/tích hợp):** QRCoder, Magick.NET (ImageMagick), ClosedXML, QuestPDF, DocumentFormat.OpenXml, Swashbuckle/Swagger, Session (ASP.NET Core) (2.3.4).
- **Đúng:** React, TypeScript, Vite, ASP.NET Core Web API (.NET 10), EF Core (SQL Server), Repository Pattern, Service Layer, Cookie Authentication, CSRF, Activity Logging, Image Processing, Media Upload, SQL Server.

### 4. Mô tả database ghi sai

- `MonthlyUpdates` (đã xóa) — Vấn đề 3.
- Thiếu 5 bảng: AboutPageHistories, SystemSettings, ContactMessages, MailMergeJobs, ServiceEvaluations — Vấn đề 8.
- Bảng B.2 thiếu quan hệ — Vấn đề 20.

### 5. Tài liệu API ghi sai

- `/api/intangible` → `/api/intangible-heritage`; `/api/media*` → `/api/uploads*` — Vấn đề 4.

### 6. Kiến trúc ghi sai

- Mô hình phân quyền 3 vai trò — Vấn đề 1.
- Bản đồ "Google Maps" — Vấn đề 2.
- "Module cập nhật thông tin" — Vấn đề 3.
- "Module bản đồ số" gây hiểu lầm có giao diện quản lý bản đồ riêng — Vấn đề 19.
- Đúng: Client–Server phân tầng (Frontend/Backend/DB), Repository + Service Layer.

### 7. Ảnh chụp / chú thích sai

- Hình 4.2, A.2: chú thích "Google Maps" — nếu chụp màn hình thật sẽ hiển thị OpenStreetMap (Vấn đề 13).
- Hình C.1 Swagger: chỉ khả dụng ở môi trường Development (Vấn đề 14).
- Hình 4.4 trùng nội dung với A.7 (Vấn đề 22).

### 8. Thông tin lỗi thời

- Bảng/Module MonthlyUpdates (Vấn đề 3).
- "Chưa hỗ trợ đa ngôn ngữ", "Chưa tích hợp thống kê" (Vấn đề 5, 6).
- Mục lục cũ chưa cập nhật với thân bài (Vấn đề 12).
- `docs/architecture-phase-1-report.md` trong repo đã lỗi thời (không dùng làm tài liệu dẫn chiếu).

### 9. Khẳng định không được mã nguồn hỗ trợ

- Kết quả kiểm thử 100% "Đạt" (Phụ lục D) — không có dự án test/minh chứng (Vấn đề 15).
- Chỉ tiêu 70%/60% (2.1.4) — không có cơ chế đo (Vấn đề 16).
- "Tích hợp trí tuệ nhân tạo" (4.8) — không có cơ sở trong repo (Vấn đề 23).
- "Tài liệu thiết kế CSDL của dự án" (2.3.3) — không tồn tại trong repo (Vấn đề 18).

---

## DANH SÁCH KIỂM CHỨNG (FILE MÃ NGUỒN SỬ DỤNG)

- `backend/VanDinh.API/Program.cs` — auth cookie, CSRF, session, Swagger (chỉ Development), `MapFallbackToFile("evaluate")`, `/api/health`.
- `backend/VanDinh.API/Data/DbInitializer.cs` — seed roles (chỉ ADMIN/MANAGER), users, categories, settings, about.
- `backend/VanDinh.API/Data/ApplicationDbContext.cs` — 17 DbSet.
- `backend/VanDinh.API/Migrations/20260719111342_RemoveMonthlyUpdate.cs` — xóa bảng MonthlyUpdates.
- `backend/VanDinh.API/Models/DomainModels.cs` — entities (gồm ServiceEvaluation, ContactMessage, MailMergeJob).
- `backend/VanDinh.API/Controllers/*.cs` — route thực tế của 19 controller.
- `backend/VanDinh.API/Services/GoogleMapsCoordinateExtractor.cs`, `HeritageService.cs`, `QrCodeService.cs`, `UploadService.cs` (Magick.NET).
- `backend/VanDinh.API/VanDinh.API.csproj` — gói NuGet (net10.0, EF Core SQL Server, QRCoder, Magick.NET, ClosedXML, QuestPDF…).
- `backend/database/VanDinhDigitalMap.sql` — 17 bảng thực tế.
- `package.json`, `vite.config.ts`, `.env.example`, `index.html`, `README.md`.
- `src/app/components/GoogleMapView.tsx` (Leaflet + OSM/Esri), `MapPage.tsx`, `HeritageDetail.tsx` (OSM embed), `geo.ts` (chỉ đường Google Maps).
- `src/app/components/AuthContext.tsx`, `LanguageContext.tsx`, `AdminDashboard.tsx`, `StatisticsPage.tsx`, `TripPlanner.tsx`, `FormFillingManagement.tsx`, `QrManagement.tsx`, `ContactMessagesManagement.tsx`, `SystemSettingsManagement.tsx`.
- `src/app/App.tsx`, `src/app/services/api.ts`, `src/core/types.ts`.

# Báo cáo tổng kết cập nhật (Update Summary)

- Tài liệu gốc: `project-review/Báo cáo Bản đồ di sản số xã Vân Đình.pdf` (39 trang)
- Kết quả: `project-review/Báo cáo Bản đồ di sản số xã Vân Đình - Updated.docx` → `project-review/Báo cáo Bản đồ di sản số xã Vân Đình - Updated.pdf`
- Nguồn duy nhất (single source of truth): toàn bộ mã nguồn trong repository (backend `VanDinh.API`, frontend `src/`, `package.json`, `backend/database/VanDinhDigitalMap.sql`, `ApplicationDbContext.cs`, các Controller, `Program.cs`, `DbInitializer.cs`)
- Ngày cập nhật: 2026-08-05
- **Tổng số chỉnh sửa: 37** (Công nghệ 16, Vai trò/kiến trúc 4, CSDL 3, API 6, Tính năng 8)

> Nguyên tắc: chỉ sửa các phần thuộc 4 nhóm (Công nghệ, Cơ sở dữ liệu, API, Tính năng đã triển khai) + 2 vấn đề Critical đã được duyệt (mô hình vai trò, Google Maps) để báo cáo khớp 100% với mã nguồn. Không sáng tạo tính năng mới; mọi câu bổ sung/sửa đều có bằng chứng trong mã nguồn hiện tại. Cấu trúc chương, số mục, thứ tự nội dung, bảng biểu và chú thích ảnh được giữ nguyên (số mục như 2.2.5, 4.7–4.9 giữ theo bản gốc).

---

## 1. Danh sách mục đã sửa (Modified sections)

| Mục | Nội dung sửa |
|---|---|
| 1.1 | Mô hình phân quyền "ba vai trò Visitor/Manager/Admin" → 2 vai trò xác thực + truy cập công khai |
| 1.3 | "Phân quyền giữa Admin, Manager và Visitor" → 2 vai trò + truy cập công khai cho Visitor |
| 2.1.2 | Bản đồ "Google Maps" → Leaflet + OpenStreetMap (vệ tinh Esri, chỉ đường Google Maps); phân quyền 2 vai trò |
| 2.1.3 | "Hỗ trợ đa ngôn ngữ" → mở rộng ngôn ngữ khác ngoài Việt–Anh đã có |
| 2.2.2 | Sơ đồ quy trình: "Google Maps + QR Code + Media" → "Bản đồ số (Leaflet/OpenStreetMap) + QR Code + Media" |
| 2.2.3 | Bước 4: "Nhập vị trí Google Maps" → nhập liên kết Google Maps, hệ thống trích xuất tọa độ |
| 2.2.5 | Bảng lợi ích: ô "Google Maps" → "Bản đồ số (Leaflet/OpenStreetMap)" |
| 2.3.1 | Bổ sung Tailwind CSS 4, Leaflet/React-Leaflet, Recharts, React 18 + ghi chú song ngữ |
| 2.3.2 | "ASP.NET Core Web API" → "ASP.NET Core Web API (.NET 10)" |
| 2.3.3 | Danh sách bảng CSDL: bỏ `MonthlyUpdates`, bổ sung 5 bảng thiếu (17 bảng) |
| 2.3.4 | Bỏ "Google Maps API"; bổ sung QRCoder, Magick.NET, ClosedXML, QuestPDF, DocumentFormat.OpenXml, Swagger/OpenAPI, Session |
| 2.4.1 | Bảng chức năng người dùng: sửa dòng bản đồ + bổ sung 4 dòng tính năng (9–12) |
| 2.4.2 | Quyền Manager: bỏ "Quản lý dữ liệu cập nhật theo tháng"; bổ sung mã QR, tin nhắn liên hệ, Mail Merge, đánh giá hài lòng |
| 2.5.1 | Bổ sung nội dung mô tả các tầng kiến trúc (Frontend/Backend/Dữ liệu) |
| 2.5.2 | Bảng điểm khác biệt: "Google Maps tích hợp" → "Bản đồ số (Leaflet/OpenStreetMap) tích hợp" |
| 3.4 | Module: bỏ "Module cập nhật thông tin" → "Module quản lý tin nhắn liên hệ"; bổ sung 5 module đã triển khai |
| 3.7 | "Phân quyền theo ba vai trò" → theo hai vai trò xác thực + truy cập công khai |
| 4.1 | Bổ sung 5 kết quả đạt được (tin nhắn liên hệ, thống kê, lịch trình tham quan, đánh giá hài lòng, song ngữ) |
| 4.2 | Bảng đánh giá: sửa dòng 8 + bổ sung 4 dòng (13–16) |
| 4.4 | Bảng so sánh: "Google Maps" → "Bản đồ số (Leaflet/OpenStreetMap)" |
| 4.5 | Chú thích Hình 4.2: "giao diện Google Maps" → "giao diện bản đồ số Leaflet/OpenStreetMap" |
| 4.7 | Hạn chế: sửa câu "chưa tích hợp thống kê"; bỏ "Chưa hỗ trợ đa ngôn ngữ" |
| 4.8 | Định hướng: "Phát triển Dashboard" → "Mở rộng Dashboard"; "Hỗ trợ đa ngôn ngữ" → mở rộng ngôn ngữ khác |
| Phụ lục A | Hình A.2: chú thích + mô tả "Google Maps" → "bản đồ số Leaflet/OpenStreetMap" |
| Phụ lục B.1 | Bảng CSDL: bỏ `MonthlyUpdates`, bổ sung 5 bảng (13–17) |
| Phụ lục B.2 | Quan hệ dữ liệu: bổ sung 5 quan hệ FK thực tế |
| Phụ lục C | Toàn bộ danh sách API: sửa route sai, bổ sung 6 nhóm API còn thiếu |
| Phụ lục D | Bảng kiểm thử dòng 9: "Google Maps" → "Bản đồ số" |
| Phụ lục F | Hình C.1: Swagger ghi rõ chỉ kích hoạt ở môi trường phát triển |

---

## 2. Tính năng đã triển khai được bổ sung vào báo cáo (Added features)

| Tính năng | Nơi bổ sung | Bằng chứng mã nguồn |
|---|---|---|
| Trang Liên hệ | 2.4.1 (dòng 9), 4.1 | `ContactController.cs` (`api/contact`), `App.tsx` |
| Quản lý tin nhắn liên hệ | 2.4.2, 3.4, 4.1, 4.2 | `ContactMessagesController.cs`, `ContactMessagesManagement.tsx` |
| Trang Thống kê công khai (Recharts) | 2.3.1, 2.4.1 (dòng 10), 4.1, 4.2 | `StatisticsPage.tsx`, `StatisticsController.cs` (`/api/statistics/overview`) |
| Thống kê Dashboard quản trị | 2.5.1, 4.1 | `AdminDashboard.tsx`, `StatisticsController.cs` |
| Trip Planner (lập lịch trình tham quan) | 2.4.1 (dòng 11), 3.4, 4.1 | `TripPlanner.tsx`, `tripPlannerService.ts` |
| Quản lý mã QR | 2.4.2, 3.4, 4.1, 4.2 | `QrManagement.tsx`, `QrController.cs` |
| Điền biểu mẫu tự động (Mail Merge) | 2.4.2, 3.4, 4.1, 4.2 | `MailMergeController.cs`, `Services/MailMerge`, `MailMergeJobs` |
| Đánh giá hài lòng dịch vụ công | 2.4.2, 3.4, 4.1, 4.2 | `EvaluationsController.cs`, `ServiceEvaluations` (xuất Excel/PDF) |
| Lịch sử trang giới thiệu | 2.4.2, B.1 | `AboutController.cs` (`/api/about/history`), `AboutPageHistories` |
| Cài đặt hệ thống nâng cao | B.1, C.8 | `SystemSettingsController.cs`, `SystemSettings` |
| Song ngữ Việt–Anh | 2.3.1, 2.4.1 (dòng 12), 4.1 | `LanguageContext.tsx`, `Header.tsx` |

---

## 3. Công nghệ được sửa/thêm (Technology corrections)

| Công nghệ | Trạng thái | Bằng chứng mã nguồn |
|---|---|---|
| "Google Maps API" (bản đồ hiển thị) | **Sai → sửa** thành Leaflet + OpenStreetMap | `GoogleMapView.tsx` (tile OSM/Esri), `package.json` (leaflet, react-leaflet) |
| Esri World Imagery (chế độ vệ tinh) | **Thêm** | `GoogleMapView.tsx` (ArcGIS tile) |
| Google Maps (trích xuất tọa độ + nút Chỉ đường) | **Giữ đúng vai trò** | `GoogleMapsCoordinateExtractor.cs`, `geo.ts` |
| Tailwind CSS 4 | **Thêm** | `package.json`, `vite.config.ts` (plugin tailwind) |
| Leaflet / React-Leaflet | **Thêm** | `package.json`, `GoogleMapView.tsx` |
| Recharts (biểu đồ thống kê) | **Thêm** | `package.json`, `StatisticsPage.tsx` |
| React 18 | **Thêm số phiên bản** | `package.json` |
| .NET 10 | **Thêm** | `VanDinh.API.csproj` |
| QRCoder | **Thêm** | `VanDinh.API.csproj` |
| Magick.NET / ImageMagick | **Thêm** | `VanDinh.API.csproj`, `UploadService.cs` |
| ClosedXML (Excel) | **Thêm** | `VanDinh.API.csproj`, `EvaluationsController.cs` |
| QuestPDF (PDF) | **Thêm** | `VanDinh.API.csproj` |
| DocumentFormat.OpenXml (Word) | **Thêm** | `VanDinh.API.csproj` |
| Swagger / OpenAPI (Swashbuckle) | **Thêm** (chỉ môi trường phát triển) | `Program.cs:164-177` |
| Session (ASP.NET Core) | **Thêm** | `Program.cs` |

---

## 4. Cơ sở dữ liệu được sửa (Database corrections)

| Thay đổi | Chi tiết |
|---|---|
| Loại bảng không còn tồn tại | `MonthlyUpdates` (đã xóa — `Migrations/20260719111342_RemoveMonthlyUpdate.cs`) |
| Bổ sung 5 bảng thiếu | `AboutPageHistories`, `SystemSettings`, `ContactMessages`, `MailMergeJobs`, `ServiceEvaluations` |
| Tổng số bảng | 17 (khớp `ApplicationDbContext` 17 DbSet + `VanDinhDigitalMap.sql`) |
| Bổ sung quan hệ B.2 | `Users–AboutPage`, `Users–AboutPageHistories`, `Users–Heritage`, `Users–RelatedLinks`, `Users–SystemSettings` (1–N, theo FK thực tế trong `VanDinhDigitalMap.sql`) |

---

## 5. API được sửa/thêm (API corrections)

| Cũ (sai) | Mới (đúng – Phụ lục C) |
|---|---|
| `/api/intangible` | `/api/intangible-heritage` |
| `/api/media`, `/api/media/upload`, `/api/media/{id}` | `/api/uploads/images|videos|documents`, `/api/uploads/list`, `/api/uploads/search`, `/api/uploads/{loại}/{mediaFileId}` |
| — | Thêm `/api/security/csrf-token` |
| — | Thêm `/api/heritage/{id}/duplicate`, `/api/heritage-categories`, `/api/heritage/{heritageId}/media/*` |
| — | Thêm `/api/users/*` (role, status, reset-password) |
| — | Thêm `/api/contact`, `/api/contact-messages/*`, `/api/evaluations/*` (gồm export/excel, export/pdf) |
| — | Thêm `/api/qr/heritage|intangible|evaluation/*` |
| — | Thêm `/api/statistics/overview`, `/api/about/history`, `/api/system-settings`, `/api/related-links`, `/api/activity-logs` |
| — | Thêm `/api/mail-merge/*` (analyze, jobs, progress, download, history) |
| — | Thêm `/api/health` |

Danh sách API mới (C.1–C.10, 10 nhóm) được đối chiếu trực tiếp từ `[Route(...)]` và `[Http...]` của 18 Controller trong `backend/VanDinh.API/Controllers`.

---

## 6. Phân bổ tổng số chỉnh sửa

| Nhóm | Số chỉnh sửa |
|---|---|
| Công nghệ (bao gồm toàn bộ thay thế Google Maps) | 16 |
| Vai trò/kiến trúc (Critical #1 – để báo cáo khớp mã nguồn) | 4 |
| Cơ sở dữ liệu | 3 |
| API | 6 |
| Tính năng đã triển khai (bổ sung/điều chỉnh mô tả) | 8 |
| **Tổng** | **37** |

## 7. Ghi chú

- Phần 4.7 (trước ghi "Chưa tích hợp thống kê", "Chưa hỗ trợ đa ngôn ngữ") và 4.8 (trước ghi "Phát triển Dashboard", "Hỗ trợ đa ngôn ngữ") được sửa cùng lúc với việc bổ sung các tính năng nói trên để báo cáo tự nhất quán.
- Bỏ hoàn toàn nội dung về bảng/module `MonthlyUpdates` đã bị gỡ khỏi hệ thống.
- Không sửa các mục ngoài phạm vi: MỤC LỤC (số trang, tiêu đề con chưa khớp thân bài), cách dùng thuật ngữ "QR Code"/"Mã QR", kết quả kiểm thử 100% "Đạt", chỉ tiêu 70%/60%, định hướng AI, tài liệu thiết kế CSDL (các vấn đề Minor trong `report-review.md` — không thuộc 4 nhóm được chỉ định).
- Chưa thêm ảnh mới; toàn bộ placeholder ảnh được giữ nguyên, chỉ đổi chú thích Hình 4.2 và Hình A.2 (theo công nghệ bản đồ thực tế).

## 8. File đã tạo

- `project-review/Báo cáo Bản đồ di sản số xã Vân Đình - Updated.docx`
- `project-review/Báo cáo Bản đồ di sản số xã Vân Đình - Updated.pdf`
- `project-review/update-summary.md` (file này)

Không có file mã nguồn ứng dụng nào bị thay đổi.
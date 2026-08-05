# Checklist – Sửa 2 vấn đề Critical trong báo cáo

Nguồn đối chiếu duy nhất (single source of truth): mã nguồn của dự án `E:\van-dinh-digital-heritage-map`.
Hồ sơ hiệu chỉnh: `project-review\report-corrected.md` (bản báo cáo đầy đủ sau khi sửa).
Không có dòng mã nguồn nào bị thay đổi.

Tổng cộng **16 lần sửa** thuộc 2 vấn đề Critical:
- Vấn đề 1 – Mô hình vai trò sai: **4 lần** (R1–R4).
- Vấn đề 2 – Khai báo sai Google Maps: **12 lần** (G1–G12).

---

## Phần A. Vấn đề 1 – Mô hình vai trò (Visitor/Manager/Admin)

Thực tế triển khai: hệ thống có **2 vai trò xác thực: MANAGER và ADMIN** (xem `backend/VanDinh.API/Data/DbInitializer.cs:18-21`, chỉ seed `Roles.ADMIN` và `Roles.MANAGER`). **Visitor là người dùng công khai ẩn danh** – không cần đăng nhập, không phải vai trò lưu trong CSDL.

### R1 – Mục 1.1, trang 4 (đoạn mở đầu)
| | Nội dung |
|---|---|
| Trước | «Giải pháp được phát triển dưới dạng ứng dụng Web với **mô hình phân quyền ba vai trò gồm Visitor, Manager và Admin. Visitor có thể truy cập công khai** để xem thông tin di sản, bản đồ số và mã QR; Manager chịu trách nhiệm quản lý nội dung; Admin quản lý tài khoản và giám sát hoạt động của hệ thống. Cấu trúc vai trò này phù hợp với đặc tả dự án.» |
| Sau | «Giải pháp được phát triển dưới dạng ứng dụng Web với mô hình phân quyền gồm **hai vai trò xác thực là Manager và Admin, đồng thời hỗ trợ truy cập công khai cho Visitor. Visitor là người dùng công khai (không cần đăng nhập, không phải vai trò trong cơ sở dữ liệu)** và có thể truy cập để xem thông tin di sản, bản đồ số và mã QR; Manager chịu trách nhiệm quản lý nội dung; Admin quản lý tài khoản và giám sát hoạt động của hệ thống. Cấu trúc vai trò này phù hợp với đặc tả dự án.» |

### R2 – Mục 1.3, trang 7 (danh sách yêu cầu)
| | Nội dung |
|---|---|
| Trước | «Hỗ trợ quản lý nội dung theo cơ chế phân quyền giữa **Admin, Manager và Visitor**, phù hợp với đặc tả của hệ thống.» |
| Sau | «Hỗ trợ quản lý nội dung theo cơ chế phân quyền giữa **hai vai trò Admin và Manager, kết hợp truy cập công khai cho Visitor**, phù hợp với đặc tả của hệ thống.» |

### R3 – Mục 2.1.2, trang 9 (mục tiêu ngắn hạn)
| | Nội dung |
|---|---|
| Trước | «Thiết lập cơ chế phân quyền người dùng **theo ba vai trò: Visitor, Manager và Admin**.» |
| Sau | «Thiết lập cơ chế phân quyền với **hai vai trò xác thực là Manager và Admin; Visitor truy cập công khai không cần đăng nhập**.» |

### R4 – Mục 3.7, trang 22 (đánh giá kết quả triển khai)
| | Nội dung |
|---|---|
| Trước | «Hỗ trợ phân quyền người dùng **theo ba vai trò**.» |
| Sau | «Hỗ trợ phân quyền **theo hai vai trò xác thực (Manager và Admin) và truy cập công khai cho Visitor**.» |

---

## Phần B. Vấn đề 2 – Khai báo sai Google Maps

Thực tế triển khai:
- Bản đồ tương tác: **Leaflet + OpenStreetMap** (`src/app/components/GoogleMapView.tsx:92-102`, TileLayer từ `tile.openstreetmap.org`; trang chi tiết nhúng OSM ở `HeritageDetail.tsx`).
- Chế độ vệ tinh: **Esri World Imagery** (`GoogleMapView.tsx`, nguồn `server.arcgisonline.com/…/World_Imagery`).
- Google Maps **không** được dùng để hiển thị bản đồ. Chỉ dùng để: (a) trích xuất tọa độ từ URL Google Maps khi quản trị viên nhập liên kết (`src/app/utils/geo.ts:23`), (b) mở nút **Chỉ đường** dẫn tới Google Maps.
- Không sử dụng Google Maps JavaScript API (`package.json` không có gói Google Maps; `.env.example` có `VITE_GOOGLE_MAPS_API_KEY` nhưng chỉ phục vụ mục đích trên).

### G1 – Mục 2.1.2, trang 9 (mục tiêu ngắn hạn)
| | Nội dung |
|---|---|
| Trước | «Tích hợp **Google Maps** để hiển thị vị trí các di tích.» |
| Sau | «Tích hợp bản đồ tương tác **Leaflet + OpenStreetMap** để hiển thị vị trí các di tích.» |

### G2 – Mục 2.2.2, trang 10 (sơ đồ quy trình sau cải tiến)
| | Nội dung |
|---|---|
| Trước | `Google Maps + QR Code + Media` |
| Sau | `Bản đồ số (Leaflet/OpenStreetMap) + QR Code + Media` |

### G3 – Mục 2.2.3, trang 11 (Bước 4 của quy trình hoạt động)
| | Nội dung |
|---|---|
| Trước | «Nhập vị trí **Google Maps**.» |
| Sau | «Nhập **liên kết Google Maps của di tích; hệ thống trích xuất tọa độ để hiển thị trên bản đồ**.» |

### G4 – Mục 2.2.5, trang 11 (bảng Lợi ích sau cải tiến, cột Sau)
| | Nội dung |
|---|---|
| Trước | ô «Sau» của hàng Bản đồ: **Google Maps** |
| Sau | ô «Sau» của hàng Bản đồ: **Bản đồ số (Leaflet/OpenStreetMap)** |

### G5 – Mục 2.3.4, trang 13 (danh sách Công nghệ tích hợp)
| | Nội dung |
|---|---|
| Trước | Hạng mục «**Google Maps API**» trong danh sách công nghệ tích hợp. |
| Sau | Thay 1 mục bằng 3 mục mô tả đúng:
- **Leaflet + OpenStreetMap** (bản đồ tương tác)
- **Esri World Imagery** (chế độ vệ tinh)
- **Google Maps URL** (trích xuất tọa độ di tích và mở chỉ đường) |

### G6 – Mục 2.4.1, trang 14 (bảng Chức năng dành cho người dùng, dòng 5)
| | Nội dung |
|---|---|
| Trước | `5 | Google Maps | Hiển thị vị trí di tích` |
| Sau | `5 | Bản đồ số (Leaflet/OpenStreetMap) | Hiển thị vị trí di tích` |

### G7 – Mục 2.5.2, trang 16 (bảng Điểm khác biệt của giải pháp)
| | Nội dung |
|---|---|
| Trước | `Không có bản đồ | Google Maps tích hợp` |
| Sau | `Không có bản đồ | Bản đồ số (Leaflet/OpenStreetMap) tích hợp` |

### G8 – Mục 4.2, trang 24 (bảng Đánh giá các chức năng, dòng 8)
| | Nội dung |
|---|---|
| Trước | `8 | Hiển thị Google Maps | Hoàn thành` |
| Sau | `8 | Hiển thị bản đồ số | Hoàn thành` |

### G9 – Mục 4.4, trang 25 (bảng So sánh hiệu quả, hàng Hiển thị vị trí)
| | Nội dung |
|---|---|
| Trước | `Hiển thị vị trí | Không có | Google Maps` |
| Sau | `Hiển thị vị trí | Không có | Bản đồ số (Leaflet/OpenStreetMap)` |

### G10 – Mục 4.5, trang 26 (chú thích Hình 4.2 – đổi tên chú thích ảnh)
| | Nội dung |
|---|---|
| Trước | `(Chèn ảnh giao diện Google Maps tại đây)` |
| Sau | `(Chèn ảnh giao diện bản đồ số Leaflet/OpenStreetMap tại đây)` |

### G11 – Phụ lục A, trang 29 (Hình A.2 – đổi tên chú thích ảnh + đoạn Mô tả)
| | Nội dung |
|---|---|
| Trước | Chú thích: `(Chèn ảnh Google Maps)` — Mô tả: «Trang bản đồ số hiển thị vị trí các di tích **trên nền Google Maps**, cho phép người dùng quan sát trực quan và lựa chọn địa điểm cần tìm hiểu.» |
| Sau | Chú thích: `(Chèn ảnh giao diện bản đồ số Leaflet/OpenStreetMap)` — Mô tả: «Trang bản đồ số hiển thị vị trí các di tích **trên nền bản đồ Leaflet/OpenStreetMap**, cho phép người dùng quan sát trực quan và lựa chọn địa điểm cần tìm hiểu.» |

### G12 – Phụ lục D, trang 35 (bảng D.1 Kiểm thử chức năng, dòng 9)
| | Nội dung |
|---|---|
| Trước | `9 | Google Maps | Hiển thị vị trí | Đạt` |
| Sau | `9 | Bản đồ số | Hiển thị vị trí | Đạt` |

---

## Phần C. Các vị trí đã kiểm tra nhưng KHÔNG sửa (nội dung đã đúng)

Những đoạn có xuất hiện từ khóa liên quan nhưng phản ánh đúng thực tế, giữ nguyên:

1. Mục 2.2.1, trang 10 – «Hệ thống dành cho người dùng (Visitor)» (Visitor = nhóm người dùng công khai, đúng).
2. Mục 2.1.4, trang 10 – hàng «Bảo mật – Phân quyền theo vai trò» (mô tả chung, đúng).
3. Mục 4.4, trang 26 – hàng «Phân quyền – Chưa rõ ràng – Theo vai trò» (mô tả chung, đúng).
4. Phụ lục E, trang 36 – đề mục «Đối với Visitor» (đúng: Visitor là người truy cập công khai).
5. Phụ lục E, trang 36 – bước «Mở Google Maps để xem vị trí» (đúng: nút Chỉ đường của hệ thống mở Google Maps để dẫn đường — đây chính là mục đích hợp lệ duy nhất còn lại của Google Maps).
6. Phụ lục C, trang 32 – hàng `Roles | Quản lý vai trò` (tên bảng CSDL thực tế, đúng).
7. Mục 3.2, trang 8 (Mục lục) – «3.2. Vai trò và đóng góp của sinh viên» (tiêu đề chương, đúng).
8. Tài liệu tham khảo [12] – «Google, Google Maps Platform Documentation.» (giữ nguyên vì dự án vẫn dùng Google Maps cho trích xuất tọa độ và chỉ đường).

---

## Phần D. Sửa phụ – khôi phục dấu cách bị PDF làm mất (không đổi từ ngữ)

Trong file `report-corrected.md`, các đoạn dưới đây bị mất khoảng trắng do lỗi trích xuất PDF; đã khôi phục dạng gốc của tài liệu Word (chỉ thêm dấu cách, KHÔNG đổi từ ngữ):

| Vị trí | Trước (lỗi trích xuất) | Sau (khôi phục) |
|---|---|---|
| Mục 1.1, trang 4 | `giải phápBản đồ` | `giải pháp Bản đồ` |
| Mục 2.4, trang 14 | `chức năng:người dùng` | `chức năng: người dùng` |
| Tham khảo [1] | `Thủ tướngChínhphủphêduyệtChươngtrìnhChuyểnđổisốquốcgiađếnnăm2025` | `Thủ tướng Chính phủ phê duyệt Chương trình Chuyển đổi số quốc gia đến năm 2025` |
| Tham khảo [1]–[3],[10],[11],[14] | `,Quyết định`, `,Bộ chỉ`, `,Chiến`, `,React`, `,TypeScript`, `,OpenAPI` | thêm dấu cách sau dấu phẩy |
| Tham khảo [15],[16] | `Vân Đình ,tài liệu` | `Vân Đình, tài liệu` |

---

## Tóm tắt thay đổi (Summary)

1. **Mô hình vai trò** – 4 vị trí (R1–R4) hiện mô tả đúng: hệ thống có **2 vai trò xác thực (MANAGER, ADMIN)**; **Visitor là người dùng công khai ẩn danh, không cần đăng nhập, không phải vai trò CSDL**. Không còn cụm từ «ba vai trò Visitor, Manager và Admin» ở bất kỳ đâu.
2. **Google Maps** – 12 vị trí (G1–G12) hiện mô tả đúng: bản đồ tương tác dùng **Leaflet + OpenStreetMap**, chế độ vệ tinh dùng **Esri World Imagery**; **Google Maps chỉ dùng để trích xuất tọa độ từ đường dẫn và mở chỉ đường (nút Chỉ đường)**. Không còn khẳng định hệ thống "dùng Google Maps/lấy Google Maps làm nền bản đồ/dùng Google Maps API".
3. **Chú thích ảnh** – 2 chú thích (Hình 4.2 và Hình A.2) được đổi tên thành giao diện "bản đồ số Leaflet/OpenStreetMap"; bản thân ảnh chụp màn hình không thay đổi.
4. **Không sửa** nội dung của bất kỳ phần nào khác (cấu trúc chương, số mục, bảng biểu, tính năng, CSDL, API… đều giữ nguyên). Các lỗi Major/Minor khác trong `report-review.md` nằm NGOÀI phạm vi lần này.
5. **Khôi phục dấu cách** bị mất khi trích xuất PDF (Phần D) – chỉ thêm khoảng trắng, không đổi từ ngữ.

### File tạo ra
- `project-review\report-corrected.md` – bản báo cáo đầy đủ sau hiệu chỉnh (đánh dấu `Đã sửa (Rx/Gx)` tại đúng vị trí sửa để dễ dò).
- `project-review\report-critical-fixes-checklist.md` – checklist này.

Không file mã nguồn ứng dụng nào bị thay đổi.
# BÁO CÁO ĐỀ XUẤT GIẢI PHÁP CHUYỂN ĐỔI SỐ

*Đây là phiên bản hiệu chỉnh của báo cáo gốc. Chỉ HAI vấn đề nghiêm trọng (Critical) đã được sửa: (1) mô tả mô hình vai trò; (2) mô tả Google Maps. Cấu trúc, số chương, bố cục, bảng biểu và toàn bộ nội dung còn lại được giữ nguyên của bản gốc. Danh sách chi tiết từng điểm sửa kèm văn bản trước/sau nằm trong `report-critical-fixes-checklist.md`.*

## Trang 1

CUỘC THI SÁNG KIẾN CHUYỂN ĐỔI SỐ
BÁO CÁO ĐỀ XUẤT GIẢI PHÁP
CHUYỂN ĐỔI SỐ

Tên đề tài: Bản đồ di sản số xã Vân Đình

Nhóm sinh viên:

| Mã sinh viên | Họ tên |
|---|---|
| HE191363 | Hoàng Minh Đức |
| HE191253 | Hồ Tuấn Minh |

Đơn vị thực tập:

## Trang 2

Thời gian thực hiện: 28-05-2026 đến 21-08-2026

## Trang 3

MỤC LỤC

PHẦN 1: GIỚI THIỆU CHUNG 4
1.1. Thông tin sinh viên & đơn vị thực tập......................................................4
1.2. Phân tích hiện trạng và bối cảnh chuyển đổi số........................................4
1.3. Xác định vấn đề/bài toán cần giải quyết...................................................4
PHẦN 2: ĐỀ XUẤT GIẢI PHÁP 6
2.1. Tầm nhìn và mục tiêu của giải pháp.........................................................6
2.2. Mô tả chi tiết sáng kiến.............................................................................6
2.3. Công nghệ / Công cụ sử dụng...................................................................7
2.4. Tính năng chính của hệ thống/giải pháp...................................................7
2.5. Kiến trúc hệ thống / Điểm khác biệt.........................................................7
PHẦN 3: QUÁ TRÌNH TRIỂN KHAI & ĐÓNG GÓP 8
3.1. Lộ trình triển khai.....................................................................................8
3.2. Vai trò và đóng góp của sinh viên............................................................8
3.3. Phối hợp với đơn vị & kế hoạch duy trì...................................................8
PHẦN 4: KẾT QUẢ & ĐÁNH GIÁ 9
4.1. Hiệu quả đạt được / dự kiến đạt được.......................................................9
4.2. Phản hồi của đơn vị..................................................................................9
4.3. Minh chứng sản phẩm..............................................................................9
PHỤ LỤC 11
TÀI LIỆU THAM KHẢO 12

## Trang 4

PHẦN 1: GIỚI THIỆU CHUNG

1.1. Thông tin sinh viên & đơn vị thực tập
Trong thời gian thực tập, nhóm sinh viên tham gia nghiên cứu, phân tích và xây dựng giải pháp Bản đồ di sản số xã Vân Đình nhằm hỗ trợ công tác chuyển đổi số trong lĩnh vực quản lý và quảng bá di sản văn hóa địa phương. Dự án hướng tới việc xây dựng một hệ thống thông tin tập trung giúp số hóa dữ liệu di tích lịch sử, di sản văn hóa phi vật thể và các tư liệu liên quan, đồng thời cung cấp một nền tảng trực quan để người dân, khách du lịch và cơ quan quản lý dễ dàng tiếp cận, tra cứu và cập nhật thông tin.

> **Đã sửa (R1):** Giải pháp được phát triển dưới dạng ứng dụng Web với mô hình phân quyền gồm **hai vai trò xác thực là Manager và Admin, đồng thời hỗ trợ truy cập công khai cho Visitor. Visitor là người dùng công khai (không cần đăng nhập, không phải vai trò trong cơ sở dữ liệu)** và có thể truy cập để xem thông tin di sản, bản đồ số và mã QR; Manager chịu trách nhiệm quản lý nội dung; Admin quản lý tài khoản và giám sát hoạt động của hệ thống. Cấu trúc vai trò này phù hợp với đặc tả dự án.

1.2. Phân tích hiện trạng và bối cảnh chuyển đổi số

1.2.1. Bối cảnh
Trong những năm gần đây, chuyển đổi số đã trở thành một trong những định hướng phát triển quan trọng của Việt Nam. Đối với lĩnh vực văn hóa, việc ứng dụng công nghệ số không chỉ giúp bảo tồn các giá trị truyền thống mà còn góp phần quảng bá hình ảnh địa phương, thúc đẩy phát triển du lịch và nâng cao hiệu quả quản lý.

Xã Vân Đình sở hữu nhiều di tích lịch sử, công trình tín ngưỡng và các giá trị văn hóa phi vật thể có ý nghĩa. Tuy nhiên, phần lớn dữ liệu hiện nay vẫn được

## Trang 5

lưu trữ theo phương thức truyền thống hoặc phân tán ở nhiều nguồn khác nhau, gây khó khăn cho công tác quản lý, tra cứu và chia sẻ.

Việc xây dựng một hệ thống bản đồ số di sản vì vậy là giải pháp phù hợp nhằm từng bước hình thành kho dữ liệu số tập trung, góp phần thực hiện chủ trương chuyển đổi số trong quản lý văn hóa.

1.2.2. Hiện trạng quản lý
Qua khảo sát thực tế, quy trình quản lý thông tin di sản còn tồn tại nhiều hạn chế:
- Thông tin về di tích được lưu trữ ở nhiều nguồn khác nhau như hồ sơ giấy, văn bản điện tử hoặc các tài liệu rời rạc.
- Hình ảnh, video và tài liệu chưa được quản lý tập trung.
- Việc cập nhật nội dung chủ yếu thực hiện thủ công.
- Người dân và khách tham quan khó tiếp cận thông tin đầy đủ về từng di tích.
- Chưa có hệ thống trực quan thể hiện vị trí các di tích trên nền bản đồ.
- Chưa khai thác mã QR để liên kết thông tin số với địa điểm thực tế.
- Công tác thống kê và theo dõi thay đổi dữ liệu còn hạn chế.

1.2.3. Bảng so sánh hiện trạng đối chiếu với mục tiêu

| Tiêu chí | Hiện trạng |
|---|---|
| Quản lý hồ sơ | Phân tán, thủ công |
| Cập nhật nội dung | Thủ công |
| Tìm kiếm | Khó khăn |
| Chia sẻ thông tin | Hạn chế |
| Quản lý hình ảnh | Chưa tập trung |
| Quản lý video | Chưa tập trung |
| Theo dõi lịch sử | Gần như không có |
| Bản đồ | Chưa trực quan |
| QR Code | Chưa áp dụng |

## Trang 6

## Trang 7

1.3. Xác định vấn đề/bài toán cần giải quyết
Từ kết quả khảo sát hiện trạng, có thể xác định bài toán trọng tâm là xây dựng một hệ thống quản lý và tra cứu di sản văn hóa trên nền tảng số, cho phép lưu trữ tập trung, cập nhật linh hoạt và công khai thông tin một cách trực quan.

Giải pháp cần đáp ứng các yêu cầu chính sau:
- Xây dựng cơ sở dữ liệu tập trung về di tích lịch sử và di sản văn hóa phi vật thể.
- > **Đã sửa (R2):** Hỗ trợ quản lý nội dung theo cơ chế phân quyền giữa **hai vai trò Admin và Manager, kết hợp truy cập công khai cho Visitor**, phù hợp với đặc tả của hệ thống.
- Tích hợp bản đồ số để hiển thị vị trí các di tích.
- Tích hợp mã QR giúp truy cập nhanh thông tin tại địa điểm.
- Quản lý tập trung hình ảnh, video và tài liệu.
- Hỗ trợ tìm kiếm và lọc dữ liệu theo nhiều tiêu chí.
- Ghi nhận lịch sử thao tác để tăng tính minh bạch và khả năng kiểm tra.
- Thiết kế theo hướng mở, thuận lợi cho việc bổ sung dữ liệu và mở rộng trong tương lai.

Mục tiêu của bài toán

| Mục tiêu | Kết quả kỳ vọng |
|---|---|
| Chuẩn hóa dữ liệu | Hình thành kho dữ liệu tập trung về di sản |
| Nâng cao hiệu quả quản lý | Giảm thao tác thủ công, tăng khả năng cập nhật |
| Hỗ trợ quảng bá | Người dân và du khách dễ dàng tra cứu thông tin |

## Trang 8

| Phát triển du lịch | Tăng khả năng tiếp cận các điểm di tích qua bản đồ số và mã QR |

## Trang 9

PHẦN 2: ĐỀ XUẤT GIẢI PHÁP

2.1. Tầm nhìn và mục tiêu của giải pháp

2.1.1. Tầm nhìn
Hệ thống Bản đồ di sản số hướng tới trở thành kênh thông tin tin cậy về di sản văn hóa của xã Vân Đình, kết nối chặt chẽ giữa cơ quan quản lý, người dân và du khách, đồng thời là nền tảng dữ liệu nền tảng cho các hoạt động chuyển đổi số văn hóa của địa phương trong tương lai.

2.1.2. Mục tiêu ngắn hạn
Trong giai đoạn đầu, hệ thống hướng đến các mục tiêu sau:
- Hoàn thiện cơ sở dữ liệu số về các di tích lịch sử và di sản văn hóa phi vật thể trên địa bàn xã Vân Đình.
- Xây dựng Website cho phép người dân và du khách tra cứu thông tin di sản.
- > **Đã sửa (G1):** Tích hợp bản đồ tương tác **Leaflet + OpenStreetMap** để hiển thị vị trí các di tích.
- Tích hợp mã QR cho từng di tích nhằm hỗ trợ truy cập nhanh thông tin.
- Xây dựng hệ thống quản trị phục vụ việc cập nhật dữ liệu.
- > **Đã sửa (R3):** Thiết lập cơ chế phân quyền với **hai vai trò xác thực là Manager và Admin; Visitor truy cập công khai không cần đăng nhập**.

2.1.3. Mục tiêu trung hạn
Trong giai đoạn tiếp theo, giải pháp hướng đến:
- Mở rộng dữ liệu cho toàn bộ các di sản của địa phương.
- Chuẩn hóa quy trình cập nhật và quản lý dữ liệu.
- Kết nối với các chương trình chuyển đổi số của địa phương.
- Tích hợp các chức năng thống kê và báo cáo.
- Xây dựng nền tảng phục vụ quảng bá du lịch văn hóa.
- Phát triển phiên bản Mobile App.
- Hỗ trợ đa ngôn ngữ nhằm phục vụ khách du lịch quốc tế.

2.1.4. Mục tiêu định lượng

| Mục tiêu | Chỉ tiêu dự kiến |
|---|---|
| Chuẩn hóa dữ liệu | 100% dữ liệu quản lý trên hệ thống |
| Tra cứu thông tin | Giảm trên 70% thời gian tìm kiếm |
| Cập nhật dữ liệu | Giảm trên 60% thao tác thủ công |

## Trang 10

| Quản lý hình ảnh | Lưu trữ tập trung |
|---|---|
| Quản lý video | Lưu trữ tập trung |
| Bảo mật | Phân quyền theo vai trò |
| Khả năng mở rộng | Dễ dàng bổ sung dữ liệu và chức năng mới |

2.2. Mô tả chi tiết sáng kiến

2.2.1. Tổng quan giải pháp
Giải pháp được xây dựng dưới dạng hệ thống Web gồm hai nhóm chức năng chính:
- Hệ thống dành cho người dùng (Visitor)
- Hệ thống quản trị dành cho Manager và Admin

Toàn bộ dữ liệu được lưu trữ trong cơ sở dữ liệu tập trung và được truy xuất thông qua các API của hệ thống Backend.

Kiến trúc này giúp dữ liệu luôn được đồng bộ, giảm trùng lặp, đồng thời tạo điều kiện thuận lợi cho việc mở rộng hệ thống trong tương lai.

2.2.2. Quy trình sau cải tiến

```
Cán bộ quản lý
↓
Đăng nhập hệ thống
↓
Quản lý dữ liệu di tích
↓
Lưu vào Database
↓
> **Đã sửa (G2):** Bản đồ số (Leaflet/OpenStreetMap) + QR Code + Media
↓
Website công khai
↓
Người dân và du khách tra cứu
```

## Trang 11

2.2.3. Quy trình hoạt động

Bước 1
Manager đăng nhập hệ thống.

Bước 2
Thêm hoặc chỉnh sửa thông tin di tích.

Bước 3
Tải lên hình ảnh, video và tài liệu.

Bước 4
> **Đã sửa (G3):** Nhập **liên kết Google Maps của di tích; hệ thống trích xuất tọa độ để hiển thị trên bản đồ**.

Bước 5
Hệ thống sinh mã QR cho di tích.

Bước 6
Thông tin được hiển thị trên Website.

Bước 7
Người dùng truy cập và tra cứu.

2.2.5. Lợi ích sau cải tiến

| Trước | Sau |
|---|---|
| Hồ sơ giấy | CSDL tập trung |
| Quản lý thủ công | Quản trị trực tuyến |
| Không có bản đồ | > **Đã sửa (G4):** Bản đồ số (Leaflet/OpenStreetMap) |
| Không có QR | QR Code |
| Hình ảnh rời rạc | Media Library |
| Không lưu lịch sử | Activity Logs |
| Khó tra cứu | Tìm kiếm nhanh |

## Trang 12

2.3. Công nghệ / Công cụ sử dụng
Giải pháp được phát triển theo mô hình Client–Server với kiến trúc phân tầng nhằm đảm bảo tính mở rộng, dễ bảo trì và phù hợp với các ứng dụng quản lý dữ liệu.

2.3.1. Frontend
- React
- TypeScript
- Vite
- HTML5
- CSS3

React được lựa chọn vì khả năng xây dựng giao diện theo mô hình Component, giúp tái sử dụng mã nguồn, tăng hiệu năng và thuận tiện trong việc mở rộng.

2.3.2. Backend
- ASP.NET Core Web API
- Entity Framework Core
- Repository Pattern
- Service Layer

Backend chịu trách nhiệm xử lý nghiệp vụ, xác thực người dùng, phân quyền, quản lý dữ liệu và cung cấp API cho phía giao diện.

Theo tài liệu đặc tả, hệ thống áp dụng Repository và Service Layer nhằm tách biệt tầng nghiệp vụ với tầng truy cập dữ liệu, giúp việc bảo trì và mở rộng thuận lợi hơn.

2.3.3. Database
Hệ thống sử dụng Microsoft SQL Server để lưu trữ dữ liệu.

## Trang 13

Các bảng dữ liệu chính gồm:
- Heritage
- HeritageCategories
- HeritageImages
- HeritageVideos
- HeritageDocuments
- IntangibleHeritage
- Users
- Roles
- ActivityLogs
- AboutPage
- MediaFiles
- RelatedLinks
- MonthlyUpdates

Các thực thể và quan hệ này được mô tả chi tiết trong tài liệu thiết kế cơ sở dữ liệu của dự án.

2.3.4. Công nghệ tích hợp
Giải pháp tích hợp nhiều thành phần hỗ trợ:
- > **Đã sửa (G5):** Leaflet + OpenStreetMap (bản đồ tương tác)
- > **Đã sửa (G5):** Esri World Imagery (chế độ vệ tinh)
- > **Đã sửa (G5):** Google Maps URL (trích xuất tọa độ di tích và mở chỉ đường)
- QR Code Generator
- Cookie Authentication
- CSRF Protection
- Activity Logging
- Image Processing
- Media Upload

Các chức năng nền này giúp tăng tính bảo mật, hỗ trợ quản lý tệp đa phương tiện và nâng cao trải nghiệm người dùng.

## Trang 14

2.4. Tính năng chính của hệ thống/giải pháp
Hệ thống được chia thành hai nhóm chức năng: người dùng công khai và quản trị.

2.4.1. Chức năng dành cho người dùng

| STT | Chức năng | Mục đích |
|---|---|---|
| 1 | Trang chủ | Giới thiệu tổng quan hệ thống |
| 2 | Danh sách di tích | Tra cứu thông tin |
| 3 | Chi tiết di tích | Hiển thị thông tin đầy đủ |
| 4 | Di sản phi vật thể | Quản lý và tra cứu |
| 5 | > **Đã sửa (G6):** Bản đồ số (Leaflet/OpenStreetMap) | > **Đã sửa (G6):** Hiển thị vị trí di tích |
| 6 | QR Code | Truy cập nhanh |
| 7 | Tìm kiếm | Tìm theo tên và bộ lọc |
| 8 | Trang giới thiệu | Cung cấp thông tin về hệ thống |

2.4.2. Chức năng dành cho Manager
Manager có quyền:
- Quản lý di tích

## Trang 15

- Quản lý di sản phi vật thể
- Quản lý danh mục
- Quản lý thư viện media
- Quản lý trang giới thiệu
- Quản lý liên kết
- Quản lý cài đặt hệ thống
- Quản lý dữ liệu cập nhật theo tháng

2.4.3. Chức năng dành cho Admin
Admin có quyền:
- Quản lý tài khoản
- Phân quyền
- Theo dõi nhật ký hoạt động
- Quản lý người dùng

2.5. Kiến trúc hệ thống / Điểm khác biệt

2.5.1. Kiến trúc hệ thống
Kiến trúc tổng thể của hệ thống được tổ chức theo mô hình nhiều tầng:

## Trang 16

2.5.2. Điểm khác biệt của giải pháp

| Phương pháp truyền thống | Giải pháp đề xuất |
|---|---|
| Quản lý hồ sơ giấy | Quản lý số hóa tập trung |
| Tra cứu thủ công | Tìm kiếm trực tuyến |
| Không có bản đồ | > **Đã sửa (G7):** Bản đồ số (Leaflet/OpenStreetMap) tích hợp |
| Không có QR | QR Code cho từng di tích |

## Trang 17

| Không quản lý media tập trung | Thư viện media |
|---|---|
| Không lưu lịch sử | Activity Logs |
| Cập nhật thủ công | Quản trị qua Website |
| Khó mở rộng | Kiến trúc phân tầng, dễ mở rộng |

2.5.3. Khả năng mở rộng
Giải pháp được thiết kế theo hướng mở, cho phép:
- Bổ sung thêm loại hình di sản.
- Mở rộng phạm vi triển khai sang các địa phương khác.
- Tích hợp ứng dụng di động.
- Kết nối với cổng thông tin điện tử hoặc hệ thống quản lý văn hóa.
- Bổ sung các chức năng thống kê, báo cáo và phân tích dữ liệu trong tương lai.

## Trang 18

PHẦN 3: QUÁ TRÌNH TRIỂN KHAI & ĐÓNG GÓP

3.1. Kế hoạch triển khai
Để đảm bảo dự án được thực hiện đúng tiến độ và đáp ứng các yêu cầu nghiệp vụ, nhóm xây dựng kế hoạch triển khai theo phương pháp phát triển phần mềm theo từng giai đoạn. Quá trình thực hiện bao gồm các bước từ khảo sát hiện trạng, phân tích yêu cầu, thiết kế hệ thống, phát triển phần mềm, kiểm thử và hoàn thiện sản phẩm.

Việc chia dự án thành các giai đoạn giúp nhóm dễ dàng kiểm soát tiến độ, phân chia công việc hợp lý giữa các thành viên và kịp thời điều chỉnh khi phát sinh yêu cầu mới.

Quy trình triển khai dự án

```
Khảo sát
↓
Phân tích yêu cầu
↓
Thiết kế hệ thống
↓
Phát triển phần mềm
↓
Kiểm thử
↓
Triển khai thử nghiệm
↓
Hoàn thiện và bàn giao
```

3.2. Phân rã công việc (Work Breakdown Structure – WBS)
Để quản lý hiệu quả tiến độ và nguồn lực, nhóm xây dựng cấu trúc phân rã công việc (WBS), trong đó chia dự án thành các nhóm nhiệm vụ chính và các công việc chi tiết.

## Trang 19

WBS của dự án

```
Bản đồ di sản số xã Vân Đình
│
├── Khảo sát
│   ├── Thu thập tài liệu
│   ├── Khảo sát hiện trạng
│   └── Phân tích yêu cầu
│
├── Thiết kế
│   ├── Thiết kế CSDL
│   ├── Thiết kế giao diện
│   ├── Thiết kế API
│   └── Thiết kế kiến trúc
│
├── Phát triển
│   ├── Frontend
│   ├── Backend
│   ├── Database
│   └── Authentication
│
├── Kiểm thử
│   ├── Unit Test
│   ├── Integration Test
│   └── Fix Bug
│
└── Triển khai
    ├── Demo
    ├── Hoàn thiện tài liệu
    └── Bàn giao
```

3.3. Kế hoạch tiến độ
Nhóm xây dựng kế hoạch triển khai theo từng giai đoạn nhằm đảm bảo sản phẩm được hoàn thành đúng thời hạn.

Kế hoạch thực hiện

| Giai đoạn | Nội dung thực hiện | Kết quả |
|---|---|---|
| Khảo sát | Thu thập thông tin, phân tích hiện trạng | Danh sách yêu cầu |
| Phân tích | Xác định chức năng và mô hình dữ liệu | Tài liệu phân tích |
| Thiết kế | Thiết kế giao diện, cơ sở dữ liệu, API | Thiết kế hệ thống |
| Lập trình | Phát triển Frontend, Backend và Database | Phiên bản thử nghiệm |

## Trang 20

| Kiểm thử | Kiểm tra chức năng, sửa lỗi | Phiên bản ổn định |
|---|---|---|
| Triển khai | Hoàn thiện sản phẩm và tài liệu | Sản phẩm hoàn chỉnh |

Biểu đồ Gantt

| Công việc | Tháng 5 | Tháng 6 | Tháng 7 | Tháng 8 |
|---|---|---|---|---|
| Khảo sát | ███ | | | |
| Phân tích | | ███ | | |
| Thiết kế | | ███ | █ | |
| Lập trình | | | ███ | ███ |
| Kiểm thử | | | | ███ |
| Hoàn thiện | | | | ███ |

3.4. Quá trình phát triển hệ thống
Nhóm áp dụng quy trình phát triển phần mềm theo hướng lặp và cải tiến liên tục. Sau mỗi giai đoạn, các thành viên tiến hành họp nhóm để đánh giá kết quả, thống nhất các yêu cầu cần bổ sung và phân công công việc cho giai đoạn tiếp theo.

Trong quá trình phát triển, hệ thống được chia thành các module độc lập gồm:
- Module quản lý người dùng.
- Module quản lý di tích.
- Module quản lý di sản văn hóa phi vật thể.
- Module quản lý thư viện đa phương tiện.
- Module bản đồ số.
- Module trang giới thiệu.

## Trang 21

- Module liên kết liên quan.
- Module cập nhật thông tin.
- Module ghi nhận lịch sử hoạt động.

Việc chia nhỏ thành các module giúp nhóm dễ dàng phát triển song song, kiểm thử độc lập và thuận tiện trong quá trình bảo trì.

3.5. Kiểm thử hệ thống
Sau khi hoàn thành các chức năng chính, nhóm tiến hành kiểm thử nhằm đánh giá mức độ ổn định của hệ thống.

Các nội dung kiểm thử bao gồm:
- Kiểm thử chức năng đăng nhập và phân quyền.
- Kiểm thử thêm, sửa, xóa dữ liệu.
- Kiểm thử tải lên hình ảnh, video và tài liệu.
- Kiểm thử hiển thị bản đồ và vị trí di tích.
- Kiểm thử chức năng tìm kiếm.
- Kiểm thử khả năng truy cập bằng mã QR.
- Kiểm thử giao diện trên các trình duyệt phổ biến.
- Kiểm thử xử lý lỗi khi dữ liệu không hợp lệ.

Kết quả kiểm thử cho thấy các chức năng cốt lõi của hệ thống hoạt động ổn định, đáp ứng các yêu cầu nghiệp vụ đã xác định trong giai đoạn phân tích.

3.6. Khó khăn trong quá trình thực hiện
Trong quá trình triển khai, nhóm gặp một số khó khăn như:
- Thu thập và chuẩn hóa dữ liệu di sản từ nhiều nguồn khác nhau.
- Đồng bộ dữ liệu giữa giao diện và cơ sở dữ liệu.

## Trang 22

- Xử lý phân quyền giữa các nhóm người dùng.
- Tối ưu việc quản lý và hiển thị tệp đa phương tiện.
- Đảm bảo tính nhất quán của dữ liệu khi nhiều người cùng cập nhật.

Nhóm đã chủ động trao đổi với giảng viên hướng dẫn và các thành viên để thống nhất phương án xử lý, đồng thời thường xuyên kiểm thử nhằm phát hiện và khắc phục lỗi kịp thời.

3.7. Đánh giá kết quả triển khai
Sau quá trình phát triển và kiểm thử, hệ thống đã đạt được các kết quả chính sau:
- Hoàn thiện nền tảng Web quản lý và tra cứu di sản.
- Xây dựng cơ sở dữ liệu tập trung phục vụ lưu trữ thông tin.
- > **Đã sửa (R4):** Hỗ trợ phân quyền **theo hai vai trò xác thực (Manager và Admin) và truy cập công khai cho Visitor**.
- Tích hợp bản đồ số và mã QR nhằm nâng cao khả năng tra cứu.
- Quản lý tập trung hình ảnh, video và tài liệu.
- Đáp ứng các yêu cầu chức năng chính được xác định trong giai đoạn phân tích và thiết kế.

## Trang 23

PHẦN 4: KẾT QUẢ & ĐÁNH GIÁ

4.1. Kết quả đạt được
Sau quá trình khảo sát, phân tích, thiết kế, phát triển và kiểm thử, nhóm đã xây dựng thành công hệ thống Bản đồ di sản số xã Vân Đình trên nền tảng Web. Hệ thống đáp ứng các yêu cầu cơ bản về quản lý thông tin di sản, hỗ trợ tra cứu trực tuyến và góp phần số hóa dữ liệu văn hóa của địa phương.

Giải pháp được xây dựng theo mô hình Client–Server, bao gồm giao diện người dùng (Frontend), hệ thống xử lý nghiệp vụ (Backend) và cơ sở dữ liệu tập trung. Kiến trúc này giúp đảm bảo khả năng mở rộng, bảo trì và tích hợp thêm các chức năng trong tương lai.

Thông qua quá trình triển khai, nhóm đã hoàn thiện các chức năng chính như:
- Quản lý thông tin di tích lịch sử.
- Quản lý di sản văn hóa phi vật thể.
- Quản lý hình ảnh, video và tài liệu.
- Hiển thị vị trí các di tích trên bản đồ số.
- Hỗ trợ tìm kiếm và tra cứu thông tin.
- Quản lý tài khoản và phân quyền người dùng.
- Ghi nhận lịch sử hoạt động của hệ thống.
- Quản lý nội dung trang giới thiệu và các liên kết liên quan.

Các chức năng trên đáp ứng các yêu cầu chức năng đã được xác định trong giai đoạn phân tích và thiết kế của dự án.

4.2. Đánh giá mức độ hoàn thành

Đánh giá các chức năng

## Trang 24

| STT | Chức năng | Kết quả |
|---|---|---|
| 1 | Đăng nhập và phân quyền | Hoàn thành |
| 2 | Quản lý người dùng | Hoàn thành |
| 3 | Quản lý di tích | Hoàn thành |
| 4 | Quản lý di sản phi vật thể | Hoàn thành |
| 5 | Quản lý hình ảnh | Hoàn thành |
| 6 | Quản lý video | Hoàn thành |
| 7 | Quản lý tài liệu | Hoàn thành |
| 8 | > **Đã sửa (G8):** Hiển thị bản đồ số | Hoàn thành |
| 9 | Quản lý trang giới thiệu | Hoàn thành |
| 10 | Quản lý liên kết | Hoàn thành |
| 11 | Ghi nhận nhật ký hoạt động | Hoàn thành |
| 12 | Tra cứu thông tin | Hoàn thành |

4.3. Hiệu quả của giải pháp
Việc triển khai hệ thống mang lại nhiều lợi ích trong công tác quản lý và khai thác thông tin di sản.

Đối với cơ quan quản lý
- Chuẩn hóa dữ liệu theo một hệ thống thống nhất.
- Giảm thời gian cập nhật và tra cứu thông tin.
- Quản lý tập trung toàn bộ dữ liệu di sản.

## Trang 25

- Theo dõi lịch sử thay đổi dữ liệu.
- Phân quyền rõ ràng giữa các nhóm người dùng.

Đối với người dân và khách tham quan
- Dễ dàng tìm kiếm thông tin về các di tích.
- Quan sát vị trí trực tiếp trên bản đồ.
- Truy cập nhanh bằng mã QR.
- Xem hình ảnh, video và tài liệu liên quan.
- Tiếp cận thông tin mọi lúc, mọi nơi thông qua trình duyệt Web.

Đối với địa phương
- Hỗ trợ quá trình chuyển đổi số trong lĩnh vực văn hóa.
- Góp phần quảng bá hình ảnh địa phương.
- Nâng cao khả năng tiếp cận thông tin của cộng đồng.
- Tạo nền tảng cho việc phát triển du lịch thông minh.

4.4. So sánh trước và sau khi áp dụng giải pháp

So sánh hiệu quả

| Tiêu chí | Trước khi triển khai | Sau khi triển khai |
|---|---|---|
| Lưu trữ dữ liệu | Hồ sơ giấy, tài liệu rời rạc | Cơ sở dữ liệu tập trung |
| Cập nhật | Thủ công | Trực tuyến |
| Tra cứu | Mất nhiều thời gian | Nhanh chóng |
| Chia sẻ thông tin | Hạn chế | Qua Website |
| Quản lý hình ảnh | Phân tán | Thư viện tập trung |
| Hiển thị vị trí | Không có | > **Đã sửa (G9):** Bản đồ số (Leaflet/OpenStreetMap) |

## Trang 26

| Mã QR | Chưa áp dụng | Có |
|---|---|---|
| Phân quyền | Chưa rõ ràng | Theo vai trò |
| Theo dõi thay đổi | Không có | Activity Logs |

4.5. Minh chứng kết quả

Hình 4.1. Trang chủ hệ thống
(Chèn ảnh giao diện Trang chủ tại đây)

Hình 4.2. Trang bản đồ số
> **Đã sửa (G10):** (Chèn ảnh giao diện bản đồ số Leaflet/OpenStreetMap tại đây)

Hình 4.3. Trang chi tiết di tích
(Chèn ảnh giao diện Heritage Detail tại đây)

Hình 4.4. Trang quản trị
(Chèn ảnh Dashboard tại đây)

Hình 4.5. Quản lý di tích
(Chèn ảnh chức năng Heritage Management tại đây)

Hình 4.6. Quản lý thư viện media
(Chèn ảnh Media Library tại đây)

## Trang 27

Hình 4.7. Quản lý di sản phi vật thể
(Chèn ảnh Intangible Heritage tại đây)

Hình 4.8. Quản lý người dùng
(Chèn ảnh User Management tại đây)

4.7. Những khó khăn và hạn chế
Trong quá trình triển khai, nhóm gặp một số khó khăn như:
- Việc thu thập và chuẩn hóa dữ liệu di sản từ nhiều nguồn khác nhau.
- Khối lượng dữ liệu đa phương tiện lớn, cần được tổ chức và quản lý hợp lý.
- Đảm bảo tính đồng bộ giữa giao diện, API và cơ sở dữ liệu trong quá trình phát triển.
- Thời gian thực hiện dự án có hạn nên chưa thể triển khai tất cả các tính năng mở rộng.

Bên cạnh đó, hệ thống vẫn còn một số hạn chế:
- Chưa có ứng dụng trên thiết bị di động.
- Chưa tích hợp chức năng thống kê và báo cáo nâng cao.
- Chưa hỗ trợ đa ngôn ngữ.
- Chưa tích hợp với các hệ thống quản lý của cấp huyện hoặc thành phố.

4.8. Định hướng phát triển
Trong thời gian tới, nhóm đề xuất phát triển hệ thống theo các hướng sau:
- Xây dựng ứng dụng di động trên Android và iOS.
- Tích hợp trí tuệ nhân tạo để hỗ trợ tìm kiếm và gợi ý nội dung.
- Hỗ trợ đa ngôn ngữ nhằm phục vụ khách du lịch quốc tế.
- Phát triển bảng điều khiển thống kê (Dashboard) phục vụ công tác quản lý.
- Mở rộng phạm vi dữ liệu sang các địa phương lân cận.
- Tích hợp với cổng thông tin điện tử và các nền tảng chuyển đổi số khác.

## Trang 28

4.9. Kết luận
Dự án Bản đồ di sản số xã Vân Đình đã hoàn thành các mục tiêu đề ra trong giai đoạn thực hiện, xây dựng được một hệ thống quản lý và tra cứu thông tin di sản trên nền tảng Web với kiến trúc mở, dữ liệu tập trung và khả năng mở rộng trong tương lai.

Giải pháp góp phần số hóa dữ liệu văn hóa địa phương, hỗ trợ công tác quản lý của cơ quan chuyên môn, đồng thời tạo điều kiện để người dân và du khách tiếp cận thông tin về các di sản một cách thuận tiện và trực quan. Mặc dù vẫn còn một số nội dung có thể tiếp tục phát triển, hệ thống đã đáp ứng các yêu cầu cốt lõi của dự án và là nền tảng phù hợp để mở rộng trong các giai đoạn tiếp theo.

## Trang 29

PHỤ LỤC

PHỤ LỤC A. Giao diện hệ thống
Phụ lục này trình bày các giao diện chính của hệ thống nhằm minh họa kết quả triển khai và hỗ trợ người đọc hình dung trực quan về các chức năng đã được xây dựng.

Hình A.1. Trang chủ
(Chèn ảnh Homepage)

Mô tả:
Trang chủ là giao diện đầu tiên khi người dùng truy cập hệ thống. Giao diện hiển thị thông tin giới thiệu về dự án, các di tích tiêu biểu, liên kết nhanh đến bản đồ số và các chuyên mục chính.

Hình A.2. Trang bản đồ số
> **Đã sửa (G11):** (Chèn ảnh giao diện bản đồ số Leaflet/OpenStreetMap)

Mô tả:
> **Đã sửa (G11):** Trang bản đồ số hiển thị vị trí các di tích trên nền bản đồ Leaflet/OpenStreetMap, cho phép người dùng quan sát trực quan và lựa chọn địa điểm cần tìm hiểu.

Hình A.3. Trang chi tiết di tích

## Trang 30

(Chèn ảnh Heritage Detail)

Mô tả:
Trang chi tiết hiển thị đầy đủ thông tin về di tích bao gồm tên, loại hình, địa chỉ, mô tả, hình ảnh, video, tài liệu và vị trí trên bản đồ.

Hình A.4. Trang quản lý di tích
(Chèn ảnh Heritage Management)

Mô tả:
Cho phép Manager thực hiện thêm, sửa, xóa và cập nhật thông tin các di tích lịch sử.

Hình A.5. Quản lý di sản văn hóa phi vật thể
(Chèn ảnh Intangible Heritage)

Mô tả:
Cho phép quản lý danh sách di sản văn hóa phi vật thể, cập nhật nội dung và tài liệu liên quan.

Hình A.6. Quản lý thư viện Media
(Chèn ảnh Media Library)

Mô tả:
Cho phép tải lên, cập nhật và quản lý hình ảnh, video và tài liệu của hệ thống.

## Trang 31

Hình A.7. Dashboard quản trị
(Chèn ảnh Dashboard)

Mô tả:
Hiển thị các chức năng quản trị và thống kê tổng quan của hệ thống.

Hình A.8. Quản lý người dùng
(Chèn ảnh User Management)

Mô tả:
Cho phép Admin quản lý tài khoản, phân quyền và cập nhật thông tin người dùng.

PHỤ LỤC B. Thiết kế cơ sở dữ liệu
Phụ lục này trình bày mô hình dữ liệu của hệ thống.

Hình B.1. Sơ đồ ERD
(Chèn sơ đồ ERD từ dbdiagram.io hoặc SQL Server)

Mô tả:
Sơ đồ ERD thể hiện mối quan hệ giữa các bảng dữ liệu trong hệ thống.

## Trang 32

Bảng B.1. Danh sách bảng dữ liệu

| STT | Bảng | Chức năng |
|---|---|---|
| 1 | Users | Quản lý người dùng |
| 2 | Roles | Quản lý vai trò |
| 3 | Heritage | Quản lý di tích |
| 4 | HeritageCategories | Danh mục di tích |
| 5 | HeritageImages | Hình ảnh di tích |
| 6 | HeritageVideos | Video di tích |
| 7 | HeritageDocuments | Tài liệu |
| 8 | IntangibleHeritage | Di sản phi vật thể |
| 9 | MediaFiles | Thư viện media |
| 10 | ActivityLogs | Nhật ký hệ thống |
| 11 | AboutPage | Trang giới thiệu |
| 12 | RelatedLinks | Liên kết |
| 13 | MonthlyUpdates | Tin tức/Cập nhật |

Bảng B.2. Quan hệ dữ liệu

| Bảng cha | Bảng con | Quan hệ |
|---|---|---|
| Roles | Users | 1 - N |
| HeritageCategories | Heritage | 1 - N |

## Trang 33

| Heritage | HeritageImages | 1 - N |
|---|---|---|
| Heritage | HeritageVideos | 1 - N |
| Heritage | HeritageDocuments | 1 - N |
| Users | ActivityLogs | 1 - N |

PHỤ LỤC C. Danh sách API

C.1. API xác thực

| API | Method | Mô tả |
|---|---|---|
| /api/auth/login | POST | Đăng nhập |
| /api/auth/logout | POST | Đăng xuất |
| /api/auth/me | GET | Lấy thông tin người dùng |

C.2. API quản lý di tích

| API | Method | Mô tả |
|---|---|---|
| /api/heritage | GET | Danh sách di tích |
| /api/heritage/{id} | GET | Chi tiết di tích |

## Trang 34

| /api/heritage | POST | Thêm di tích |
|---|---|---|
| /api/heritage/{id} | PUT | Cập nhật |
| /api/heritage/{id} | DELETE | Xóa |

C.3. API quản lý di sản phi vật thể

| API | Method | Mô tả |
|---|---|---|
| /api/intangible | GET | Danh sách |
| /api/intangible | POST | Thêm |
| /api/intangible/{id} | PUT | Cập nhật |
| /api/intangible/{id} | DELETE | Xóa |

C.4. API Media

| API | Method | Mô tả |
|---|---|---|
| /api/media | GET | Danh sách media |
| /api/media/upload | POST | Upload tệp |
| /api/media/{id} | DELETE | Xóa tệp |

## Trang 35

PHỤ LỤC D. Kết quả kiểm thử

Bảng D.1. Kiểm thử chức năng

| STT | Chức năng | Kết quả mong đợi | Kết quả |
|---|---|---|---|
| 1 | Đăng nhập | Đăng nhập thành công | Đạt |
| 2 | Đăng xuất | Quay về trang chủ | Đạt |
| 3 | Thêm di tích | Lưu dữ liệu | Đạt |
| 4 | Sửa di tích | Cập nhật thành công | Đạt |
| 5 | Xóa di tích | Xóa khỏi CSDL | Đạt |
| 6 | Upload ảnh | Hiển thị ảnh | Đạt |
| 7 | Upload video | Hiển thị video | Đạt |
| 8 | Upload tài liệu | Lưu thành công | Đạt |
| 9 | > **Đã sửa (G12):** Bản đồ số | Hiển thị vị trí | Đạt |
| 10 | Tìm kiếm | Hiển thị kết quả | Đạt |
| 11 | Quản lý người dùng | Cập nhật thành công | Đạt |
| 12 | Phân quyền | Đúng quyền truy cập | Đạt |

## Trang 36

PHỤ LỤC E. Hướng dẫn sử dụng

Đối với Visitor
1. Truy cập Website.
2. Chọn chuyên mục hoặc tìm kiếm di tích.
3. Xem thông tin chi tiết.
4. Mở Google Maps để xem vị trí.
5. Quét mã QR tại điểm tham quan để truy cập nhanh.

Đối với Manager
1. Đăng nhập hệ thống.
2. Chọn chức năng quản lý.
3. Thêm hoặc cập nhật thông tin di tích.
4. Tải lên hình ảnh, video và tài liệu.
5. Lưu thay đổi để hiển thị trên Website.

Đối với Admin
1. Đăng nhập hệ thống.
2. Quản lý tài khoản người dùng.
3. Phân quyền.
4. Theo dõi nhật ký hoạt động.
5. Cập nhật thông tin khi cần thiết.

PHỤ LỤC F. Danh sách hình minh chứng

| Hình | Nội dung |
|---|---|
| Hình A.1 | Trang chủ |

## Trang 37

| Hình A.2 | Bản đồ số |
|---|---|
| Hình A.3 | Chi tiết di tích |
| Hình A.4 | Quản lý di tích |
| Hình A.5 | Quản lý di sản phi vật thể |
| Hình A.6 | Media Library |
| Hình A.7 | Dashboard |
| Hình A.8 | Quản lý người dùng |
| Hình B.1 | ERD hệ thống |
| Hình C.1 | Tài liệu API (Swagger/OpenAPI, nếu có) |

## Trang 38

TÀI LIỆU THAM KHẢO

[1] Chính phủ Việt Nam, Quyết định số 749/QĐ-TTg ngày 03/6/2020 của Thủ tướng Chính phủ phê duyệt Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến năm 2030.

[2] Bộ Thông tin và Truyền thông, Bộ chỉ số đánh giá chuyển đổi số (DTI) cấp bộ, cấp tỉnh và quốc gia, Hà Nội, 2022.

[3] Bộ Văn hóa, Thể thao và Du lịch, Chiến lược phát triển văn hóa đến năm 2030, Hà Nội, 2021.

[4] G. Vial, "Understanding Digital Transformation: A Review and a Research Agenda," The Journal of Strategic Information Systems, vol. 28, no. 2, pp. 118–144, 2019.

[5] M. Fowler, Patterns of Enterprise Application Architecture. Boston, MA, USA: Addison-Wesley, 2002.

[6] M. Richards and N. Ford, Fundamentals of Software Architecture: An Engineering Approach. Sebastopol, CA, USA: O'Reilly Media, 2020.

[7] Microsoft, ASP.NET Core Documentation. Microsoft Learn.

[8] Microsoft, Entity Framework Core Documentation. Microsoft Learn.

[9] Microsoft, SQL Server Documentation. Microsoft Learn.

[10] React Team, React Documentation.

[11] TypeScript Team, TypeScript Handbook.

[12] Google, Google Maps Platform Documentation.

[13] OpenJS Foundation, Node.js Documentation.

[14] OpenAPI Initiative, OpenAPI Specification.

## Trang 39

[15] Tài liệu Requirement & Design Specification – Bản đồ số xã Vân Đình, tài liệu nội bộ của dự án. Đây chính là tài liệu SRS mà nhóm sử dụng để phân tích yêu cầu, thiết kế chức năng, kiến trúc và cơ sở dữ liệu.

[16] Tài liệu Mẫu báo cáo cuộc thi Bản đồ di sản số xã Vân Đình, tài liệu hướng dẫn cấu trúc và nội dung báo cáo do đơn vị tổ chức cung cấp.
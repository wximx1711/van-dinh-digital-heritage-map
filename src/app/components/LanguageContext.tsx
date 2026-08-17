import React, { createContext, useCallback, useContext, useState } from 'react';

export type Lang = 'vi' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  'nav.home': { vi: 'Trang chủ', en: 'Home' },
  'nav.memorialSites': { vi: 'Điểm lưu niệm SKCMKC', en: 'Điểm lưu niệm SKCMKC' },
  'nav.relics': { vi: 'Di tích', en: 'Relics' },
  'nav.intangible': { vi: 'Di sản phi vật thể', en: 'Intangible Heritage' },
  'nav.map': { vi: 'Bản đồ', en: 'Map' },
  'nav.about': { vi: 'Giới thiệu', en: 'About' },
  'nav.contact': { vi: 'Liên hệ', en: 'Contact' },
  'nav.login': { vi: 'Đăng nhập', en: 'Login' },
  // Site title
  'site.title': { vi: 'Bản đồ di sản số', en: 'Van Dinh Digital Heritage Map' },
  'site.subtitle': { vi: 'Hệ thống quản lý và bảo tồn di sản văn hóa xã Vân Đình, Thành phố Hà Nội', en: 'Heritage Management and Preservation System for Van Dinh Commune, Hanoi' },
  // Hero
  'hero.search.placeholder': { vi: 'Tìm kiếm di tích, di sản...', en: 'Search relics, heritage...' },
  'hero.search.btn': { vi: 'Tìm kiếm', en: 'Search' },
  // Stats
  'stats.total': { vi: 'Tổng số di tích', en: 'Total Relics' },
  'stats.national': { vi: 'Di tích Quốc gia', en: 'National Relics' },
  'stats.city': { vi: 'Di tích Thành phố', en: 'City Relics' },
  'stats.unranked': { vi: 'Chưa xếp hạng', en: 'Unranked' },
  'stats.intangible': { vi: 'Di sản phi vật thể', en: 'Intangible Heritage' },
  // Map
  'map.title': { vi: 'Bản đồ di sản', en: 'Heritage Map' },
  'map.filter.classification': { vi: 'Tìm theo xếp hạng', en: 'Filter by Classification' },
  'map.filter.type': { vi: 'Tìm theo loại hình', en: 'Filter by Type' },
  'map.national': { vi: 'Di tích Quốc gia', en: 'National Relic' },
  'map.city': { vi: 'Di tích Thành phố', en: 'City Relic' },
  'map.unranked': { vi: 'Chưa xếp hạng', en: 'Unranked' },
  'map.type.dinh': { vi: 'Đình', en: 'Communal House (Đình)' },
  'map.type.chua': { vi: 'Chùa', en: 'Pagoda (Chùa)' },
  'map.type.den': { vi: 'Đền', en: 'Temple (Đền)' },
  'map.type.mieu': { vi: 'Miếu', en: 'Shrine (Miếu)' },
  'map.type.phu': { vi: 'Phủ', en: 'Palace (Phủ)' },
  'map.type.quan': { vi: 'Quán', en: 'Taoist Temple (Quán)' },
  'map.type.nhacu': { vi: 'Nhà cổ', en: 'Ancient House' },
  'map.type.nhatho': { vi: 'Nhà thờ họ', en: 'Clan House' },
  'map.type.lang': { vi: 'Lăng Mộ', en: 'Mausoleum' },
  'map.viewdetail': { vi: 'Xem chi tiết', en: 'View Details' },
  'map.share': { vi: 'Chia sẻ', en: 'Share' },
  'map.qr': { vi: 'Mã QR', en: 'QR Code' },
  'map.directions': { vi: 'Chỉ đường', en: 'Get Directions' },
  'map.coordinates': { vi: 'Tọa độ', en: 'Coordinates' },
  'map.address': { vi: 'Địa chỉ', en: 'Address' },
  'map.resetfilter': { vi: 'Đặt lại bộ lọc', en: 'Reset Filters' },
  // Featured
  'featured.title': { vi: 'Di tích nổi bật', en: 'Featured Heritage Sites' },
  'featured.subtitle': { vi: 'Khám phá các di tích lịch sử - văn hóa tiêu biểu của Vân Đình', en: 'Explore the outstanding historical and cultural relics of Van Dinh' },
  'featured.viewprofile': { vi: 'Xem hồ sơ', en: 'View Profile' },
  'featured.viewall': { vi: 'Xem tất cả di tích', en: 'View All Heritage Sites' },
  // Intangible
  'intangible.title': { vi: 'Di sản văn hóa phi vật thể', en: 'Intangible Cultural Heritage' },
  'intangible.subtitle': { vi: 'Bảo tồn và phát huy các giá trị văn hóa phi vật thể của cộng đồng', en: 'Preserving and promoting intangible cultural values of the community' },
  'intangible.video': { vi: 'Xem video', en: 'Watch Video' },
  'intangible.detail': { vi: 'Chi tiết', en: 'Details' },
  'intangible.knowledge': { vi: 'Tri thức dân gian', en: 'Folk Knowledge' },
  'intangible.festival': { vi: 'Lễ hội truyền thống', en: 'Traditional Festival' },
  'intangible.belief': { vi: 'Tập quán tín ngưỡng', en: 'Religious Customs' },
  'intangible.craft': { vi: 'Nghề thủ công truyền thống', en: 'Traditional Craft' },
  'intangible.performance': { vi: 'Tri thức dân gian', en: 'Folk Knowledge' },
  'intangible.ritual': { vi: 'Tập quán tín ngưỡng', en: 'Religious Customs' },
  'intangible.story': { vi: 'Tri thức dân gian', en: 'Folk Knowledge' },
  // Detail page
  'detail.gallery': { vi: 'Thư viện ảnh', en: 'Photo Gallery' },
  'detail.panorama': { vi: 'Xem 360°', en: '360° View' },
  'detail.info': { vi: 'Thông tin chung', en: 'General Information' },
  'detail.code': { vi: 'Mã di tích', en: 'Heritage Code' },
  'detail.type': { vi: 'Loại hình', en: 'Heritage Type' },
  'detail.classification': { vi: 'Xếp hạng', en: 'Classification' },
  'detail.history': { vi: 'Lịch sử & Kiến trúc', en: 'History & Architecture' },
  'detail.documents': { vi: 'Tài liệu đính kèm', en: 'Attached Documents' },
  'detail.download': { vi: 'Tải xuống', en: 'Download' },
  'detail.share_qr': { vi: 'Chia sẻ QR Code', en: 'Share QR Code' },
  'detail.route': { vi: 'Chỉ đường đến đây', en: 'Get Directions' },
  'detail.related': { vi: 'Hình ảnh liên quan', en: 'Related Images' },
  'detail.back': { vi: 'Quay lại', en: 'Back' },
  'detail.location': { vi: 'Vị trí trên bản đồ', en: 'Location on Map' },
  // Login
  'login.title': { vi: 'Đăng nhập hệ thống', en: 'System Login' },
  'login.subtitle': { vi: 'Bản đồ di sản số', en: 'Van Dinh Digital Heritage Map' },
  'login.username': { vi: 'Tên đăng nhập', en: 'Username' },
  'login.password': { vi: 'Mật khẩu', en: 'Password' },
  'login.remember': { vi: 'Ghi nhớ đăng nhập', en: 'Remember me' },
  'login.btn': { vi: 'Đăng nhập', en: 'Login' },
  'login.forgot': { vi: 'Quên mật khẩu?', en: 'Forgot password?' },
  'login.back_home': { vi: 'Về trang chủ', en: 'Back to Home' },
  // Admin
  'admin.dashboard': { vi: 'Tổng quan', en: 'Dashboard' },
  'admin.heritage_mgmt': { vi: 'Quản lý di tích', en: 'Heritage Management' },
  'admin.intangible_mgmt': { vi: 'Di sản phi vật thể', en: 'Intangible Heritage' },
  'admin.memorial_mgmt': { vi: 'Điểm lưu niệm SKCMKC', en: 'Memorial Sites' },
  'admin.map_mgmt': { vi: 'Quản lý bản đồ', en: 'Map Management' },
  'admin.media': { vi: 'Thư viện ảnh', en: 'Media Library' },
  'admin.users': { vi: 'Tài khoản người dùng', en: 'User Accounts' },
  'admin.settings': { vi: 'Cài đặt', en: 'Settings' },
  'admin.categories': { vi: 'Danh mục di tích', en: 'Heritage Categories' },
  'admin.about': { vi: 'Trang giới thiệu', en: 'About Page' },
  'admin.activity_logs': { vi: 'Nhật ký hoạt động', en: 'Activity Logs' },
  'admin.contact_messages': { vi: 'Tin nhắn liên hệ', en: 'Contact Messages' },
  'admin.form_filling': { vi: 'Điền biểu mẫu tự động', en: 'Automatic Form Filling' },
  'admin.recent_updates': { vi: 'Cập nhật gần đây', en: 'Recent Updates' },
  'admin.welcome': { vi: 'Xin chào, Quản trị viên', en: 'Welcome, Administrator' },
  // Heritage management table
  'hm.id': { vi: 'Mã di tích', en: 'Heritage ID' },
  'hm.name': { vi: 'Tên di tích', en: 'Heritage Name' },
  'hm.classification': { vi: 'Xếp hạng', en: 'Classification' },
  'hm.type': { vi: 'Loại hình', en: 'Type' },
  'hm.status': { vi: 'Trạng thái', en: 'Status' },
  'hm.updated': { vi: 'Cập nhật', en: 'Last Updated' },
  'hm.actions': { vi: 'Thao tác', en: 'Actions' },
  'hm.add': { vi: 'Thêm di tích', en: 'Add Heritage' },
  'hm.edit': { vi: 'Chỉnh sửa', en: 'Edit' },
  'hm.delete': { vi: 'Xóa', en: 'Delete' },
  'hm.view': { vi: 'Xem', en: 'View' },
  'hm.duplicate': { vi: 'Nhân bản', en: 'Duplicate' },
  'hm.search': { vi: 'Tìm kiếm di tích...', en: 'Search heritage...' },
  'hm.status_active': { vi: 'Đang hoạt động', en: 'Active' },
  'hm.status_maintenance': { vi: 'Đang trùng tu', en: 'Under Renovation' },
  'hm.status_closed': { vi: 'Tạm đóng cửa', en: 'Temporarily Closed' },
  // Footer
  'footer.authority': { vi: 'Ban Quản lý Di sản Văn hóa xã Vân Đình', en: 'Van Dinh Cultural Heritage Management Board' },
  'footer.address': { vi: 'Xã Vân Đình, Thành phố Hà Nội', en: 'Van Dinh Commune, Hanoi City' },
  'footer.phone': { vi: 'Điện thoại: (024) 1234 5678', en: 'Phone: (024) 1234 5678' },
  'footer.email': { vi: 'Email: disanvandinh@hanoi.gov.vn', en: 'Email: disanvandinh@hanoi.gov.vn' },
  'footer.copyright': { vi: `© ${new Date().getFullYear()} Bản đồ di sản số. Bảo lưu mọi quyền.`, en: `© ${new Date().getFullYear()} Van Dinh Digital Heritage Map. All rights reserved.` },
  'footer.quick_links': { vi: 'Liên kết nhanh', en: 'Quick Links' },
  'footer.contact_info': { vi: 'Thông tin liên hệ', en: 'Contact Information' },
  'footer.related': { vi: 'Liên kết liên quan', en: 'Related Links' },
  'footer.ministry': { vi: 'Bộ Văn hóa, Thể thao và Du lịch', en: 'Ministry of Culture, Sports and Tourism' },
  'footer.hanoi_culture': { vi: 'Sở Văn hóa Hà Nội', en: 'Hanoi Department of Culture' },
  // Common
  'common.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'common.error': { vi: 'Có lỗi xảy ra', en: 'An error occurred' },
  'common.nodata': { vi: 'Không có dữ liệu', en: 'No data available' },
  'common.viewmore': { vi: 'Xem thêm', en: 'View More' },
  'common.close': { vi: 'Đóng', en: 'Close' },
  'common.save': { vi: 'Lưu', en: 'Save' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.confirm': { vi: 'Xác nhận', en: 'Confirm' },
  'common.search': { vi: 'Tìm kiếm', en: 'Search' },
  'common.filter': { vi: 'Bộ lọc', en: 'Filter' },
  'common.all': { vi: 'Tất cả', en: 'All' },
  'common.logout': { vi: 'Đăng xuất', en: 'Logout' },
  'common.notification': { vi: 'Thông báo', en: 'Notifications' },
  'common.profile': { vi: 'Hồ sơ', en: 'Profile' },
  'common.description': { vi: 'Mô tả', en: 'Description' },
  'common.address': { vi: 'Địa chỉ', en: 'Address' },
  'common.latitude': { vi: 'Vĩ độ', en: 'Latitude' },
  'common.longitude': { vi: 'Kinh độ', en: 'Longitude' },
  'common.upload_image': { vi: 'Tải ảnh lên', en: 'Upload Image' },
  'common.upload_doc': { vi: 'Tải tài liệu lên', en: 'Upload Document' },
  'common.gen_qr': { vi: 'Tạo mã QR', en: 'Generate QR Code' },
  'common.select_map': { vi: 'Chọn vị trí trên bản đồ', en: 'Select Location on Map' },
  // Intangible management
  'im.name_vi': { vi: 'Tên (Tiếng Việt)', en: 'Name (Vietnamese)' },
  'im.name_en': { vi: 'Tên (Tiếng Anh)', en: 'Name (English)' },
  'im.category': { vi: 'Thể loại', en: 'Category' },
  'im.description_vi': { vi: 'Mô tả (Tiếng Việt)', en: 'Description (Vietnamese)' },
  'im.description_en': { vi: 'Mô tả (Tiếng Anh)', en: 'Description (English)' },
  'im.image': { vi: 'Ảnh đại diện', en: 'Representative Image' },
  'im.video_url': { vi: 'Video URL', en: 'Video URL' },
  'im.add': { vi: 'Thêm di sản phi vật thể', en: 'Add Intangible Heritage' },
  'im.edit': { vi: 'Chỉnh sửa di sản phi vật thể', en: 'Edit Intangible Heritage' },
  'im.search': { vi: 'Tìm kiếm...', en: 'Search...' },
  'im.filter_category': { vi: 'Lọc theo thể loại', en: 'Filter by Category' },
  'im.delete_confirm': { vi: 'Xác nhận xóa di sản phi vật thể này?', en: 'Are you sure you want to delete this intangible heritage item?' },
  'im.created': { vi: 'Ngày tạo', en: 'Created Date' },
  'im.updated': { vi: 'Cập nhật', en: 'Last Updated' },
  'im.upload': { vi: 'Tải ảnh lên', en: 'Upload Image' },
  'im.upload_hint': { vi: 'PNG, JPG, JPEG, WebP, HEIC, HEIF — tối đa 5MB', en: 'PNG, JPG, JPEG, WebP, HEIC, HEIF — max 5MB' },
  'im.upload_btn': { vi: 'Chọn ảnh', en: 'Choose Image' },
  'im.replace_image': { vi: 'Thay đổi ảnh', en: 'Replace Image' },
  'im.no_image': { vi: 'Chưa có ảnh', en: 'No image yet' },
  // Section headers
  'im.section_basic': { vi: 'Thông tin cơ bản', en: 'Basic Information' },
  'im.section_description': { vi: 'Mô tả tổng quan', en: 'General Description' },
  'im.section_additional': { vi: 'Thông tin bổ sung', en: 'Additional Information' },
  'im.section_references': { vi: 'Tài liệu tham khảo', en: 'References & Documents' },
  // Basic info fields
  'im.other_names': { vi: 'Tên gọi khác', en: 'Other Names' },
  'im.location': { vi: 'Địa điểm', en: 'Location' },
  'im.cultural_space': { vi: 'Không gian văn hóa', en: 'Cultural Space' },
  'im.community': { vi: 'Cộng đồng / Chủ thể văn hóa', en: 'Community / Cultural Owner' },
  'im.representative_persons': { vi: 'Cá nhân đại diện', en: 'Representative Persons' },
  // Origin & History fields
  'im.origin': { vi: 'Nguồn gốc', en: 'Origin' },
  'im.formation_history': { vi: 'Lịch sử hình thành', en: 'Formation History' },
  'im.historical_development': { vi: 'Quá trình phát triển', en: 'Historical Development' },
  // Practice fields
  'im.worship_objects': { vi: 'Đồ thờ tự', en: 'Worship Objects' },
  'im.festival_time': { vi: 'Thời gian lễ hội', en: 'Festival Time' },
  'im.festival_duration': { vi: 'Thời gian tổ chức', en: 'Festival Duration' },
  'im.festival_location': { vi: 'Địa điểm lễ hội', en: 'Festival Location' },
  'im.ritual_participants': { vi: 'Thành phần tham gia', en: 'Ritual Participants' },
  'im.ritual_process': { vi: 'Quy trình nghi lễ', en: 'Ritual Process' },
  'im.customs_offerings': { vi: 'Tập tục & Lễ vật', en: 'Customs & Offerings' },
  'im.folk_games': { vi: 'Trò chơi dân gian', en: 'Folk Games' },
  'im.traditional_performances': { vi: 'Trình diễn truyền thống', en: 'Traditional Performances' },
  'im.ritual_objects': { vi: 'Vật phẩm nghi lễ', en: 'Ritual Objects' },
  'im.related_documents': { vi: 'Tài liệu liên quan', en: 'Related Documents' },
  // Status fields
  'im.existing_artisans': { vi: 'Nghệ nhân hiện có', en: 'Existing Artisans' },
  'im.teaching_artisans': { vi: 'Nghệ nhân truyền dạy', en: 'Teaching Artisans' },
  'im.practitioners': { vi: 'Người thực hành', en: 'Practitioners' },
  'im.learners': { vi: 'Người học', en: 'Learners' },
  'im.other_human_resources': { vi: 'Nguồn nhân lực khác', en: 'Other Human Resources' },
  'im.transmission_method': { vi: 'Phương thức truyền dạy', en: 'Transmission Method' },
  'im.current_status': { vi: 'Hiện trạng chung', en: 'Current Status' },
  'im.preservation_status': { vi: 'Tình trạng bảo tồn', en: 'Preservation Status' },
  // Risk fields
  'im.threat_level': { vi: 'Mức độ đe dọa', en: 'Threat Level' },
  'im.risk_description': { vi: 'Mô tả nguy cơ', en: 'Risk Description' },
  // Value
  'im.heritage_value': { vi: 'Giá trị di sản', en: 'Heritage Value' },
  // Protection
  'im.existing_protection': { vi: 'Biện pháp bảo vệ hiện có', en: 'Existing Protection Measures' },
  'im.proposed_protection': { vi: 'Biện pháp bảo vệ đề xuất', en: 'Proposed Protection Measures' },
  // Media
  'im.gallery': { vi: 'Thư viện ảnh', en: 'Gallery Images' },
  // Intangible detail sections
  'intangible.section_description': { vi: 'Mô tả tổng quan', en: 'General Description' },
  'intangible.section_origin': { vi: 'Nguồn gốc / Lịch sử', en: 'Origin / History' },
  'intangible.section_cultural_value': { vi: 'Giá trị văn hóa', en: 'Cultural Value' },
  'intangible.section_current_status': { vi: 'Hiện trạng', en: 'Current Status' },
  'intangible.section_preservation': { vi: 'Bảo tồn', en: 'Preservation' },
  'intangible.section_documents': { vi: 'Tài liệu liên quan', en: 'Related Documents' },
  'intangible.section_video': { vi: 'Video', en: 'Video' },
  'intangible.related': { vi: 'Di sản phi vật thể liên quan', en: 'Related Intangible Heritage' },
  'intangible.status': { vi: 'Trạng thái', en: 'Status' },
  // Memorial Sites
  'memorial.title': { vi: 'Điểm lưu niệm SKCMKC', en: 'Memorial Sites of Revolutionary Events and Resistance' },
  'memorial.subtitle': { vi: 'Các địa điểm ghi dấu sự kiện lịch sử, cách mạng và kháng chiến của quân dân Vân Đình', en: 'Sites marking historic, revolutionary and resistance events of Van Dinh' },
  'memorial.searchPlaceholder': { vi: 'Tìm kiếm điểm lưu niệm...', en: 'Search memorial sites...' },
  'memorial.detail': { vi: 'Chi tiết', en: 'Details' },
  'memorial.category.memorial': { vi: 'Điểm tưởng niệm', en: 'Memorial Site' },
  'memorial.category.victory': { vi: 'Chiến thắng', en: 'Victory' },
  'memorial.category.military_camp': { vi: 'Căn cứ quân sự', en: 'Military Camp' },
  'memorial.category.secret_base': { vi: 'Căn cứ bí mật', en: 'Secret Base' },
  'memorial.category.battlefield': { vi: 'Chiến trường', en: 'Battlefield' },
  'memorial.category.revolutionary_event': { vi: 'Sự kiện cách mạng', en: 'Revolutionary Event' },
  'memorial.category.other': { vi: 'Khác', en: 'Other' },
  'memorial.classification.national': { vi: 'Quốc gia', en: 'National' },
  'memorial.classification.provincial': { vi: 'Cấp tỉnh', en: 'Provincial' },
  'memorial.classification.city': { vi: 'Cấp thành phố', en: 'City' },
  'memorial.classification.unranked': { vi: 'Chưa xếp hạng', en: 'Unranked' },
  'memorial.status.active': { vi: 'Đang hoạt động', en: 'Active' },
  'memorial.status.maintenance': { vi: 'Đang trùng tu', en: 'Under Renovation' },
  'memorial.status.closed': { vi: 'Tạm đóng cửa', en: 'Temporarily Closed' },
  'memorial.section_description': { vi: 'Mô tả tổng quan', en: 'General Description' },
  'memorial.section_history': { vi: 'Lịch sử', en: 'History' },
  'memorial.section_commemoration': { vi: 'Tưởng niệm', en: 'Commemoration' },
  'memorial.section_video': { vi: 'Video', en: 'Video' },
  'memorial.section_map': { vi: 'Vị trí trên Google Maps', en: 'Location on Google Maps' },
  'memorial.openMap': { vi: 'Mở Google Maps', en: 'Open Google Maps' },
  'memorial.code': { vi: 'Mã điểm', en: 'Code' },
  'memorial.eventDate': { vi: 'Thời gian sự kiện', en: 'Event Date' },
  'memorial.address': { vi: 'Địa chỉ', en: 'Address' },
  'memorial.created': { vi: 'Ngày tạo', en: 'Created' },
  'memorial.related': { vi: 'Điểm lưu niệm liên quan', en: 'Related Memorial Sites' },
  'memorial.empty': { vi: 'Chưa có dữ liệu điểm lưu niệm', en: 'No memorial site data available' },
  'memorial.errorTitle': { vi: 'Không thể tải dữ liệu', en: 'Failed to load data' },
  'memorial.retry': { vi: 'Thử lại', en: 'Retry' },
  'memorial.notFound': { vi: 'Không tìm thấy điểm lưu niệm', en: 'Memorial site not found' },
  'memorial.notFoundDesc': { vi: 'Điểm lưu niệm bạn đang tìm không tồn tại hoặc đã bị xóa.', en: 'The memorial site you are looking for does not exist or has been deleted.' },
  'memorial.backToList': { vi: 'Quay lại danh sách', en: 'Back to list' },
  'memorial.noDetail': { vi: 'Chưa có thông tin chi tiết', en: 'No detailed information available' },
  // Memorial management
  'mm.add': { vi: 'Thêm điểm lưu niệm', en: 'Add Memorial Site' },
  'mm.edit': { vi: 'Chỉnh sửa điểm lưu niệm', en: 'Edit Memorial Site' },
  'mm.search': { vi: 'Tìm kiếm điểm lưu niệm...', en: 'Search memorial sites...' },
  'mm.delete_confirm': { vi: 'Xác nhận xóa điểm lưu niệm này?', en: 'Are you sure you want to delete this memorial site?' },
  'mm.name_vi': { vi: 'Tên (Tiếng Việt)', en: 'Name (Vietnamese)' },
  'mm.name_en': { vi: 'Tên (Tiếng Anh)', en: 'Name (English)' },
  'mm.category': { vi: 'Loại hình', en: 'Category' },
  'mm.classification': { vi: 'Xếp hạng', en: 'Classification' },
  'mm.status': { vi: 'Trạng thái', en: 'Status' },
  'mm.other_names': { vi: 'Tên gọi khác', en: 'Other Names' },
  'mm.address_vi': { vi: 'Địa chỉ (Tiếng Việt)', en: 'Address (Vietnamese)' },
  'mm.address_en': { vi: 'Địa chỉ (Tiếng Anh)', en: 'Address (English)' },
  'mm.google_map_url': { vi: 'URL Google Maps', en: 'Google Maps URL' },
  'mm.description_vi': { vi: 'Mô tả (Tiếng Việt)', en: 'Description (Vietnamese)' },
  'mm.description_en': { vi: 'Mô tả (Tiếng Anh)', en: 'Description (English)' },
  'mm.history_vi': { vi: 'Lịch sử (Tiếng Việt)', en: 'History (Vietnamese)' },
  'mm.history_en': { vi: 'Lịch sử (Tiếng Anh)', en: 'History (English)' },
  'mm.commemoration_vi': { vi: 'Tưởng niệm (Tiếng Việt)', en: 'Commemoration (Vietnamese)' },
  'mm.commemoration_en': { vi: 'Tưởng niệm (Tiếng Anh)', en: 'Commemoration (English)' },
  'mm.video_url': { vi: 'Video URL', en: 'Video URL' },
  'mm.image': { vi: 'Ảnh đại diện', en: 'Cover Image' },
  'mm.gallery': { vi: 'Thư viện ảnh', en: 'Gallery Images' },
  'mm.upload_hint': { vi: 'PNG, JPG, JPEG, WebP, HEIC, HEIF — tối đa 5MB', en: 'PNG, JPG, JPEG, WebP, HEIC, HEIF — max 5MB' },
  'mm.upload_btn': { vi: 'Chọn ảnh', en: 'Choose Image' },
  'mm.replace_image': { vi: 'Thay đổi ảnh', en: 'Replace Image' },
  'mm.no_image': { vi: 'Chưa có ảnh', en: 'No image yet' },
  'mm.section_basic': { vi: 'Thông tin cơ bản', en: 'Basic Information' },
  'mm.section_location': { vi: 'Vị trí & Bản đồ', en: 'Location & Map' },
  'mm.section_description': { vi: 'Mô tả tổng quan', en: 'General Description' },
  'mm.section_history': { vi: 'Lịch sử', en: 'History' },
  'mm.section_commemoration': { vi: 'Tưởng niệm', en: 'Commemoration' },
  'mm.section_video': { vi: 'Video', en: 'Video' },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  setLang: () => {},
  t: (key) => key,
});

const STORAGE_KEY = 'van-dinh-language';

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'vi') return stored;
  } catch {
    // localStorage unavailable (e.g. private browsing in some browsers)
  }
  return 'vi';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // silent
    }
  }, []);
  const t = (key: string) => translations[key]?.[lang] ?? key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

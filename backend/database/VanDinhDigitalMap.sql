/*==========================================================
    PROJECT : VAN DINH DIGITAL HERITAGE MAP
    DATABASE: VanDinhDigitalMap
    PURPOSE : SQL Server schema + seed data for this project

    Run:
    sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql
==========================================================*/

USE master;
GO

IF DB_ID(N'VanDinhDigitalMap') IS NOT NULL
BEGIN
    ALTER DATABASE VanDinhDigitalMap
    SET SINGLE_USER
    WITH ROLLBACK IMMEDIATE;

    DROP DATABASE VanDinhDigitalMap;
END
GO

CREATE DATABASE VanDinhDigitalMap;
GO

USE VanDinhDigitalMap;
GO

CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE Users (
    UserId BIGINT IDENTITY(1,1) PRIMARY KEY,
    RoleId INT NOT NULL,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100),
    Email NVARCHAR(100),
    Status BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Users_Roles
        FOREIGN KEY(RoleId)
        REFERENCES Roles(RoleId)
);
GO

CREATE TABLE HeritageCategories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(30) NOT NULL UNIQUE,
    NameVi NVARCHAR(100) NOT NULL,
    NameEn NVARCHAR(100) NOT NULL,
    IconUrl NVARCHAR(255)
);
GO

CREATE TABLE Heritage (
    HeritageId BIGINT IDENTITY(1,1) PRIMARY KEY,
    PublicId NVARCHAR(20) NOT NULL UNIQUE,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    CategoryId INT NOT NULL,
    NameVi NVARCHAR(255) NOT NULL,
    NameEn NVARCHAR(255) NOT NULL,
    Slug NVARCHAR(255) NOT NULL UNIQUE,
    Classification NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    AddressVi NVARCHAR(500),
    AddressEn NVARCHAR(500),
    Latitude DECIMAL(10,8),
    Longitude DECIMAL(11,8),
    DescriptionVi NVARCHAR(MAX),
    DescriptionEn NVARCHAR(MAX),
    HistoryVi NVARCHAR(MAX),
    HistoryEn NVARCHAR(MAX),
    ThumbnailUrl NVARCHAR(500),
    YearBuilt NVARCHAR(100),
    Guardian NVARCHAR(255),
    QrCodeUrl NVARCHAR(500),
    GoogleMapUrl NVARCHAR(1000),
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME2 NULL,
    CreatedBy BIGINT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_Heritage_Classification
        CHECK (Classification IN (N'national', N'city', N'unranked')),
    CONSTRAINT CK_Heritage_Status
        CHECK (Status IN (N'active', N'maintenance', N'closed')),
    CONSTRAINT FK_Heritage_Category
        FOREIGN KEY(CategoryId)
        REFERENCES HeritageCategories(CategoryId),
    CONSTRAINT FK_Heritage_User
        FOREIGN KEY(CreatedBy)
        REFERENCES Users(UserId)
);
GO

CREATE TABLE HeritageImages (
    ImageId BIGINT IDENTITY(1,1) PRIMARY KEY,
    HeritageId BIGINT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    Caption NVARCHAR(255),
    SortOrder INT NOT NULL DEFAULT 0,
    UploadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_HeritageImages_Heritage
        FOREIGN KEY(HeritageId)
        REFERENCES Heritage(HeritageId)
        ON DELETE CASCADE
);
GO

CREATE TABLE HeritageVideos (
    VideoId BIGINT IDENTITY(1,1) PRIMARY KEY,
    HeritageId BIGINT NOT NULL,
    Title NVARCHAR(255),
    VideoType NVARCHAR(20),
    VideoUrl NVARCHAR(500),
    ThumbnailUrl NVARCHAR(500),
    UploadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_HeritageVideos_Heritage
        FOREIGN KEY(HeritageId)
        REFERENCES Heritage(HeritageId)
        ON DELETE CASCADE
);
GO

CREATE TABLE HeritageDocuments (
    DocumentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    HeritageId BIGINT NOT NULL,
    FileName NVARCHAR(255),
    FileUrl NVARCHAR(500),
    FileType NVARCHAR(20),
    FileSize BIGINT,
    UploadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_HeritageDocuments_Heritage
        FOREIGN KEY(HeritageId)
        REFERENCES Heritage(HeritageId)
        ON DELETE CASCADE
);
GO

CREATE TABLE IntangibleHeritage (
    IntangibleId BIGINT IDENTITY(1,1) PRIMARY KEY,
    PublicId NVARCHAR(20) NOT NULL UNIQUE,
    NameVi NVARCHAR(255) NOT NULL,
    NameEn NVARCHAR(255) NOT NULL,
    Category NVARCHAR(30) NOT NULL,
    DescriptionVi NVARCHAR(MAX),
    DescriptionEn NVARCHAR(MAX),
    ImageUrl NVARCHAR(500),
    VideoUrl NVARCHAR(500),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_IntangibleHeritage_Category
        CHECK (Category IN (N'festival', N'performance', N'craft', N'ritual', N'story'))
);
GO

CREATE TABLE MonthlyUpdates (
    UpdateId INT IDENTITY(1,1) PRIMARY KEY,
    MonthLabel NVARCHAR(20) NOT NULL,
    DisplayVi NVARCHAR(50) NOT NULL,
    DisplayEn NVARCHAR(50) NOT NULL,
    UpdateCount INT NOT NULL DEFAULT 0
);
GO

CREATE TABLE AboutPage (
    AboutId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255),
    Content NVARCHAR(MAX),
    BannerImage NVARCHAR(500),
    UpdatedBy BIGINT NOT NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_AboutPage_User
        FOREIGN KEY(UpdatedBy)
        REFERENCES Users(UserId)
);
GO

CREATE TABLE ActivityLogs (
    LogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    Action NVARCHAR(50),
    EntityName NVARCHAR(100),
    EntityId BIGINT,
    Description NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ActivityLogs_User
        FOREIGN KEY(UserId)
        REFERENCES Users(UserId)
);
GO

CREATE TABLE SystemSettings (
    SettingId INT IDENTITY(1,1) PRIMARY KEY,
    WebsiteName NVARCHAR(255),
    LogoUrl NVARCHAR(500),
    FooterText NVARCHAR(500),
    ContactEmail NVARCHAR(255),
    Phone NVARCHAR(50),
    Address NVARCHAR(255),
    FacebookUrl NVARCHAR(500),
    TiktokUrl NVARCHAR(500),
    UpdatedBy BIGINT NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_SystemSettings_User
        FOREIGN KEY(UpdatedBy)
        REFERENCES Users(UserId)
);
GO

CREATE INDEX IX_Heritage_Category ON Heritage(CategoryId);
CREATE INDEX IX_Heritage_Classification ON Heritage(Classification);
CREATE INDEX IX_Heritage_Status ON Heritage(Status);
CREATE INDEX IX_Heritage_IsDeleted ON Heritage(IsDeleted);
CREATE INDEX IX_HeritageImages_Heritage ON HeritageImages(HeritageId);
CREATE INDEX IX_HeritageVideos_Heritage ON HeritageVideos(HeritageId);
CREATE INDEX IX_HeritageDocuments_Heritage ON HeritageDocuments(HeritageId);
CREATE INDEX IX_IntangibleHeritage_Category ON IntangibleHeritage(Category);
CREATE INDEX IX_ActivityLogs_User ON ActivityLogs(UserId);
GO

INSERT INTO Roles(RoleName)
VALUES (N'ADMIN'), (N'MANAGER');
GO

INSERT INTO Users(RoleId, Username, PasswordHash, FullName, Email)
VALUES (1, N'admin', N'admin123', N'Quan tri vien he thong', N'admin@vandinh.vn');
GO

INSERT INTO HeritageCategories(Code, NameVi, NameEn, IconUrl)
VALUES
(N'dinh', N'Dinh', N'Communal House', N'/icons/dinh.png'),
(N'chua', N'Chua', N'Pagoda', N'/icons/chua.png'),
(N'den', N'Den', N'Temple', N'/icons/den.png'),
(N'mieu', N'Mieu', N'Shrine', N'/icons/mieu.png'),
(N'phu', N'Phu', N'Palace', N'/icons/phu.png'),
(N'quan', N'Quan', N'Taoist Temple', N'/icons/quan.png'),
(N'nhacu', N'Nha co', N'Ancient House', N'/icons/nhacu.png'),
(N'nhatho', N'Nha tho ho', N'Clan House', N'/icons/nhatho.png'),
(N'lang', N'Lang mo', N'Mausoleum', N'/icons/lang.png');
GO

INSERT INTO Heritage
(
    PublicId,
    Code,
    CategoryId,
    NameVi,
    NameEn,
    Slug,
    Classification,
    Status,
    AddressVi,
    AddressEn,
    Latitude,
    Longitude,
    DescriptionVi,
    DescriptionEn,
    HistoryVi,
    HistoryEn,
    ThumbnailUrl,
    YearBuilt,
    Guardian,
    QrCodeUrl,
    GoogleMapUrl,
    CreatedBy,
    CreatedAt,
    UpdatedAt
)
VALUES
(N'h001', N'VDHN-DT-001', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'dinh'), N'Đình Vân Đình', N'Van Dinh Communal House', N'dinh-van-dinh', N'national', N'active', N'Thôn Vân Đình, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'Van Dinh Village, Van Dinh Commune, Ung Hoa District, Hanoi', 20.756, 105.853, N'Đình Vân Đình là công trình kiến trúc nghệ thuật đặc sắc, được xây dựng từ thế kỷ 17 và được Nhà nước xếp hạng Di tích Quốc gia năm 1994.', N'Van Dinh Communal House is a unique architectural masterpiece built in the 17th century, designated as a National Relic in 1994.', N'Đình Vân Đình được xây dựng vào khoảng thế kỷ 17, thờ Thành hoàng làng - đức thánh Tản Viên Sơn. Công trình mang đậm dấu ấn kiến trúc thời Lê Trung Hưng với hệ thống chạm khắc gỗ tinh xảo trên các đầu dư, kẻ, bẩy. Đình trải qua nhiều lần tu sửa vào các thời Nguyễn nhưng vẫn giữ được giá trị nghệ thuật nguyên bản. Năm 1994, Đình Vân Đình được Bộ Văn hóa - Thông tin xếp hạng Di tích Lịch sử - Văn hóa Quốc gia.', N'Van Dinh Communal House was built around the 17th century, dedicated to the village deity - the Holy Tan Vien Mountain Spirit. The structure bears the architectural marks of the Late Le period with intricate wood carvings on brackets and beams. The communal house underwent several restorations during the Nguyen dynasty while retaining its original artistic value. In 1994, it was designated a National Historical-Cultural Relic by the Ministry of Culture and Information.', N'https://images.unsplash.com/photo-1571842533456-9b0d746c5a9b?w=800&h=500&fit=crop&auto=format', N'Thế kỷ XVII', N'Ban Quản lý Di tích Vân Đình', N'/api/qr/heritage/h001', N'https://www.google.com/maps?q=20.756,105.853', 1, GETDATE(), NULL),
(N'h002', N'VDHN-DT-002', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'chua'), N'Chùa Bối Khê', N'Boi Khe Pagoda', N'chua-boi-khe', N'national', N'active', N'Thôn Bối Khê, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'Boi Khe Village, Van Dinh Commune, Ung Hoa District, Hanoi', 20.748, 105.849, N'Chùa Bối Khê được xây dựng từ thời Trần, là một trong những ngôi chùa cổ nhất của vùng đất Ứng Hòa với nhiều tượng Phật quý giá.', N'Boi Khe Pagoda was built during the Tran dynasty and is one of the oldest pagodas in the Ung Hoa region with many precious Buddhist statues.', N'Chùa Bối Khê có lịch sử hơn 700 năm, được xây dựng từ thời Trần thế kỷ XIII-XIV. Chùa lưu giữ nhiều hiện vật quý như tượng Phật Thích Ca, tượng Quan Âm nghìn tay và nhiều đồ tế tự bằng đồng. Công trình được trùng tu lớn vào thời Lê và thời Nguyễn. Năm 1991, chùa được xếp hạng Di tích Quốc gia.', N'Boi Khe Pagoda has a history of over 700 years, built during the Tran dynasty in the 13th-14th centuries. The pagoda preserves many precious artifacts including statues of Shakyamuni Buddha, thousand-armed Guanyin, and bronze ritual objects. Major renovations were carried out during the Le and Nguyen dynasties. In 1991, the pagoda was designated a National Relic.', N'https://images.unsplash.com/photo-1568775791746-bcc117bcb312?w=800&h=500&fit=crop&auto=format', N'Thế kỷ XIII-XIV', N'Hội Phật giáo xã Vân Đình', N'/api/qr/heritage/h002', N'https://www.google.com/maps?q=20.748,105.849', 1, GETDATE(), NULL),
(N'h003', N'VDHN-DT-003', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'den'), N'Đền Vân Đình', N'Van Dinh Temple', N'den-van-dinh', N'city', N'active', N'Khu phố Vân Đình, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'Van Dinh Quarter, Van Dinh Commune, Ung Hoa District, Hanoi', 20.762, 105.858, N'Đền Vân Đình thờ Mẫu Liễu Hạnh - một trong Tứ bất tử của tín ngưỡng dân gian Việt Nam, là điểm du lịch tâm linh nổi tiếng của vùng.', N'Van Dinh Temple is dedicated to Mother Lieu Hanh, one of the Four Immortals in Vietnamese folk belief, and is a famous spiritual tourism destination.', N'Đền Vân Đình được xây dựng vào thời Hậu Lê, thờ Thánh Mẫu Liễu Hạnh - vị thần bảo hộ phụ nữ và gia đình trong tín ngưỡng thờ Mẫu của người Việt. Hàng năm, lễ hội đền Vân Đình được tổ chức vào tháng 3 âm lịch thu hút hàng nghìn du khách thập phương về hành hương.', N'Van Dinh Temple was built during the Later Le dynasty, dedicated to Holy Mother Lieu Hanh, the guardian deity of women and families in Vietnamese Mother Goddess worship. Every year, the Van Dinh Temple Festival held in the 3rd lunar month attracts thousands of pilgrims from near and far.', N'https://images.unsplash.com/photo-1724533815121-ca09833513ee?w=800&h=500&fit=crop&auto=format', N'Thế kỷ XVII', N'Ban Quản lý Di tích Vân Đình', N'/api/qr/heritage/h003', N'https://www.google.com/maps?q=20.762,105.858', 1, GETDATE(), NULL),
(N'h004', N'VDHN-DT-004', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'mieu'), N'Miếu Thôn Giữa', N'Middle Village Shrine', N'mieu-thon-giua', N'unranked', N'active', N'Thôn Giữa, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'Middle Village, Van Dinh Commune, Ung Hoa District, Hanoi', 20.752, 105.851, N'Miếu Thôn Giữa là nơi thờ phụng các vị thần bảo hộ của làng, được xây dựng vào cuối thời Nguyễn và là điểm sinh hoạt văn hóa tâm linh của cộng đồng địa phương.', N'Middle Village Shrine is dedicated to the village protective deities, built in the late Nguyen dynasty period, serving as a spiritual and cultural center for the local community.', N'Miếu Thôn Giữa được xây dựng vào đầu thế kỷ XX, thờ các vị thần thổ địa và thổ công bảo vệ làng xóm. Công trình được dân làng đóng góp xây dựng và tu sửa qua nhiều thế hệ.', N'Middle Village Shrine was built in the early 20th century, dedicated to local earth deities protecting the village. The structure was built and maintained by villagers across generations.', N'https://images.unsplash.com/photo-1677607220717-20d71984a207?w=800&h=500&fit=crop&auto=format', N'Đầu thế kỷ XX', N'Ủy ban nhân dân xã Vân Đình', N'/api/qr/heritage/h004', N'https://www.google.com/maps?q=20.752,105.851', 1, GETDATE(), NULL),
(N'h005', N'VDHN-DT-005', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'nhatho'), N'Nhà thờ họ Đặng', N'Dang Clan Ancestral House', N'nha-tho-ho-dang', N'unranked', N'active', N'Thôn Đông, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'East Village, Van Dinh Commune, Ung Hoa District, Hanoi', 20.746, 105.847, N'Nhà thờ họ Đặng là công trình kiến trúc truyền thống của dòng họ Đặng có lịch sử trên 300 năm tại vùng đất Vân Đình.', N'Dang Clan Ancestral House is a traditional architectural structure of the Dang family with over 300 years of history in the Van Dinh area.', N'Nhà thờ họ Đặng được xây dựng vào khoảng thế kỷ XVIII, là nơi thờ phụng tổ tiên dòng họ Đặng - một trong những dòng họ lớn và có nhiều đóng góp cho sự phát triển của vùng đất Vân Đình.', N'The Dang Clan Ancestral House was built around the 18th century as a place to worship the ancestors of the Dang family, one of the prominent families contributing to the development of Van Dinh.', N'https://images.unsplash.com/photo-1708464682068-58807c2d0538?w=800&h=500&fit=crop&auto=format', N'Thế kỷ XVIII', N'Dòng họ Đặng xã Vân Đình', N'/api/qr/heritage/h005', N'https://www.google.com/maps?q=20.746,105.847', 1, GETDATE(), NULL),
(N'h006', N'VDHN-DT-006', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'chua'), N'Chùa Thanh Đình', N'Thanh Dinh Pagoda', N'chua-thanh-dinh', N'city', N'maintenance', N'Thôn Thanh Đình, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'Thanh Dinh Village, Van Dinh Commune, Ung Hoa District, Hanoi', 20.759, 105.862, N'Chùa Thanh Đình là một trong những ngôi chùa lớn của xã Vân Đình, được xây dựng vào thời Lê và đang được tu bổ, tôn tạo.', N'Thanh Dinh Pagoda is one of the largest pagodas in Van Dinh Commune, built during the Le dynasty and currently undergoing restoration.', N'Chùa Thanh Đình được xây dựng vào cuối thế kỷ XVII, lưu giữ nhiều hiện vật Phật giáo quý giá. Hiện chùa đang trong giai đoạn trùng tu với nguồn vốn từ ngân sách nhà nước và đóng góp của phật tử.', N'Thanh Dinh Pagoda was built in the late 17th century, preserving many precious Buddhist artifacts. The pagoda is currently undergoing restoration funded by the state budget and devotee contributions.', N'https://images.unsplash.com/photo-1723065195938-30a5e64036e8?w=800&h=500&fit=crop&auto=format', N'Cuối thế kỷ XVII', N'Hội Phật giáo xã Vân Đình', N'/api/qr/heritage/h006', N'https://www.google.com/maps?q=20.759,105.862', 1, GETDATE(), NULL),
(N'h007', N'VDHN-DT-007', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'lang'), N'Lăng Mộ Cụ Nguyễn Văn Thọ', N'Nguyen Van Tho Mausoleum', N'lang-mo-cu-nguyen-van-tho', N'unranked', N'active', N'Thôn Tây, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'West Village, Van Dinh Commune, Ung Hoa District, Hanoi', 20.744, 105.845, N'Lăng Mộ Cụ Nguyễn Văn Thọ là nơi an nghỉ của vị tiến sĩ thời Lê - người có nhiều đóng góp cho sự phát triển văn hóa và giáo dục của vùng đất Ứng Hòa.', N'Nguyen Van Tho Mausoleum is the resting place of a Le dynasty scholar who contributed significantly to cultural and educational development in the Ung Hoa region.', N'Lăng mộ được xây dựng vào cuối thế kỷ XVIII, thờ tiến sĩ Nguyễn Văn Thọ - người đỗ tiến sĩ năm 1772 dưới triều Lê. Ông có nhiều đóng góp cho sự nghiệp giáo dục và văn hóa của địa phương.', N'The mausoleum was built in the late 18th century for Scholar Nguyen Van Tho, who passed the doctoral examination in 1772 during the Le dynasty. He made significant contributions to local education and culture.', N'https://images.unsplash.com/photo-1696147861399-93bdb59749dd?w=800&h=500&fit=crop&auto=format', N'Cuối thế kỷ XVIII', N'Dòng họ Nguyễn xã Vân Đình', N'/api/qr/heritage/h007', N'https://www.google.com/maps?q=20.744,105.845', 1, GETDATE(), NULL),
(N'h008', N'VDHN-DT-008', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'dinh'), N'Đình Hương Tảo', N'Huong Tao Communal House', N'dinh-huong-tao', N'city', N'active', N'Thôn Hương Tảo, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'Huong Tao Village, Van Dinh Commune, Ung Hoa District, Hanoi', 20.765, 105.864, N'Đình Hương Tảo thờ Thành hoàng làng và lưu giữ nhiều hiện vật lịch sử quý báu, được công nhận là Di tích Thành phố Hà Nội.', N'Huong Tao Communal House is dedicated to the village guardian deity and preserves many historical artifacts, recognized as a Hanoi City Relic.', N'Đình Hương Tảo được xây dựng vào thế kỷ XVIII trên vùng đất cao ráo, thoáng đãng. Kiến trúc đình theo kiểu "chữ Đinh" với đại đình và hậu cung, có nhiều mảng chạm khắc giá trị thể hiện đề tài tứ linh, tứ quý.', N'Huong Tao Communal House was built in the 18th century on an elevated, airy location. The architecture follows the "Dinh" style with the main hall and inner sanctuary, featuring many valuable carvings depicting the Four Sacred Animals and Four Seasons.', N'https://images.unsplash.com/photo-1758298134870-f14bef5debcc?w=800&h=500&fit=crop&auto=format', N'Thế kỷ XVIII', N'Ban Quản lý Di tích Vân Đình', N'/api/qr/heritage/h008', N'https://www.google.com/maps?q=20.765,105.864', 1, GETDATE(), NULL),
(N'h009', N'VDHN-DT-009', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'phu'), N'Phủ Vân Đình', N'Van Dinh Palace', N'phu-van-dinh', N'unranked', N'active', N'Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'Van Dinh Commune, Ung Hoa District, Hanoi', 20.757, 105.848, N'Phủ Vân Đình là công trình thờ Mẫu theo truyền thống Đạo Mẫu của người Việt, là trung tâm sinh hoạt tín ngưỡng dân gian của cộng đồng địa phương.', N'Van Dinh Palace is dedicated to Mother Goddess worship following Vietnamese Mother Goddess tradition, serving as a folk belief center for the local community.', N'Phủ Vân Đình được xây dựng vào thời Nguyễn, thờ Tam Tòa Thánh Mẫu theo tín ngưỡng thờ Mẫu của người Việt. Đây là nơi diễn ra các nghi lễ hầu đồng vào các dịp lễ lớn trong năm.', N'Van Dinh Palace was built during the Nguyen dynasty, dedicated to the Three Holy Mothers according to Vietnamese Mother Goddess beliefs. This is where ceremonial spirit medium rituals take place during major annual festivals.', N'https://images.unsplash.com/photo-1578409682213-e27b3355cad7?w=800&h=500&fit=crop&auto=format', N'Thế kỷ XIX', N'Uy ban nhan dan xa Van Dinh', N'/api/qr/heritage/h009', N'https://www.google.com/maps?q=20.757,105.848', 1, GETDATE(), NULL),
(N'h010', N'VDHN-DT-010', (SELECT CategoryId FROM HeritageCategories WHERE Code = N'quan'), N'Quán Thị Cầu', N'Thi Cau Taoist Temple', N'quan-thi-cau', N'unranked', N'closed', N'Thôn Cầu Đông, Xã Vân Đình, Huyện Ứng Hòa, Hà Nội', N'Cau Dong Village, Van Dinh Commune, Ung Hoa District, Hanoi', 20.749, 105.857, N'Quán Thị Cầu là công trình thờ theo Đạo giáo dân gian, thờ các vị thần trong hệ thống tín ngưỡng dân gian vùng đồng bằng Bắc Bộ.', N'Thi Cau Taoist Temple is dedicated to deities in the folk belief system of the Red River Delta region.', N'Quán Thị Cầu được xây dựng vào cuối thế kỷ XIX, hiện đang trong tình trạng xuống cấp và đã được đóng cửa để chờ phương án tu bổ. Công trình thờ Tứ Vị Thánh Nương và các vị thần thuộc hệ thống Đạo giáo dân gian.', N'Thi Cau Taoist Temple was built in the late 19th century and is currently in a state of deterioration, temporarily closed pending a restoration plan. The temple is dedicated to the Four Holy Ladies and deities of the folk Taoist belief system.', N'https://images.unsplash.com/photo-1600094338409-9d6754d3e83c?w=800&h=500&fit=crop&auto=format', N'Cuối thế kỷ XIX', N'Uy ban nhân dân xa Van Dinh', N'/api/qr/heritage/h010', N'https://www.google.com/maps?q=20.749,105.857', 1, GETDATE(), NULL);
GO

INSERT INTO HeritageImages(HeritageId, ImageUrl, SortOrder)
SELECT HeritageId, ThumbnailUrl, 1
FROM Heritage;
GO

INSERT INTO IntangibleHeritage(PublicId, NameVi, NameEn, Category, DescriptionVi, DescriptionEn, ImageUrl)
VALUES
(N'i001', N'Le hoi Dinh Van Dinh', N'Van Dinh Communal House Festival', N'festival', N'Le hoi duoc to chuc hang nam voi nghi thuc te le va tro choi dan gian.', N'The annual festival includes ceremonial rituals and folk games.', N'https://images.unsplash.com/photo-1765510103179-0c2f628d2ff2?w=800&h=500&fit=crop&auto=format'),
(N'i002', N'Hat Cheo Van Dinh', N'Van Dinh Cheo Folk Opera', N'performance', N'Cheo la loai hinh nghe thuat san khau dan gian truyen thong.', N'Cheo is a traditional folk performance art form.', N'https://images.unsplash.com/photo-1727402528763-af11a02966f0?w=800&h=500&fit=crop&auto=format'),
(N'i003', N'Nghe det lua truyen thong', N'Traditional Silk Weaving', N'craft', N'Nghe det lua la nghe thu cong duoc bao ton qua nhieu the he.', N'Silk weaving is a craft preserved across generations.', N'https://images.unsplash.com/photo-1592473858143-790cde951b1a?w=800&h=500&fit=crop&auto=format'),
(N'i004', N'Le gio to dong ho', N'Clan Ancestor Commemoration', N'ritual', N'Le gio to the hien truyen thong uong nuoc nho nguon cua cong dong.', N'Clan ancestor commemoration expresses remembrance of family roots.', N'https://images.unsplash.com/photo-1578409682213-e27b3355cad7?w=800&h=500&fit=crop&auto=format'),
(N'i005', N'Truyen thuyet Than song Day', N'Legend of the Day River Spirit', N'story', N'Cau chuyen dan gian ve vi than song bao ho lang xom.', N'A folk story about the river spirit protecting local villages.', N'https://images.unsplash.com/photo-1758298135151-e1283f571030?w=800&h=500&fit=crop&auto=format');
GO

INSERT INTO MonthlyUpdates(MonthLabel, UpdateCount, DisplayVi, DisplayEn)
VALUES
(N'01/2024', 3, N'Thang 1', N'Jan'),
(N'02/2024', 5, N'Thang 2', N'Feb'),
(N'03/2024', 7, N'Thang 3', N'Mar'),
(N'04/2024', 4, N'Thang 4', N'Apr'),
(N'05/2024', 6, N'Thang 5', N'May'),
(N'06/2024', 2, N'Thang 6', N'Jun');
GO

INSERT INTO AboutPage(Title, Content, UpdatedBy)
VALUES
(N'Gioi thieu Xa Van Dinh', N'Noi dung gioi thieu se duoc cap nhat tai day.', 1);
GO

INSERT INTO SystemSettings(WebsiteName, FooterText, ContactEmail, Phone, Address, UpdatedBy)
VALUES
(N'Ban do so Xa Van Dinh', N'Ban do so Xa Van Dinh', N'contact@vandinh.vn', N'0123456789', N'Xa Van Dinh, Thanh pho Ha Noi', 1);
GO

CREATE VIEW vw_HeritageSites
AS
SELECT
    h.PublicId AS id,
    h.Code AS code,
    h.NameVi AS nameVi,
    h.NameEn AS nameEn,
    c.Code AS [type],
    h.Classification AS classification,
    h.Status AS [status],
    h.AddressVi AS addressVi,
    h.AddressEn AS addressEn,
    CAST(h.Latitude AS FLOAT) AS lat,
    CAST(h.Longitude AS FLOAT) AS lon,
    h.DescriptionVi AS descriptionVi,
    h.DescriptionEn AS descriptionEn,
    h.HistoryVi AS historyVi,
    h.HistoryEn AS historyEn,
    h.ThumbnailUrl AS [image],
    h.YearBuilt AS yearBuilt,
    h.Guardian AS guardian,
    CONVERT(VARCHAR(10), COALESCE(h.UpdatedAt, h.CreatedAt), 23) AS updatedAt
FROM Heritage h
INNER JOIN HeritageCategories c ON c.CategoryId = h.CategoryId
WHERE h.IsDeleted = 0;
GO

CREATE VIEW vw_HeritageImages
AS
SELECT
    h.PublicId AS heritageId,
    i.ImageUrl AS imageUrl,
    i.Caption AS caption,
    i.SortOrder AS sortOrder
FROM HeritageImages i
INNER JOIN Heritage h ON h.HeritageId = i.HeritageId
WHERE h.IsDeleted = 0;
GO

CREATE VIEW vw_IntangibleHeritage
AS
SELECT
    PublicId AS id,
    NameVi AS nameVi,
    NameEn AS nameEn,
    Category AS category,
    DescriptionVi AS descriptionVi,
    DescriptionEn AS descriptionEn,
    ImageUrl AS [image],
    VideoUrl AS videoUrl
FROM IntangibleHeritage
WHERE IsDeleted = 0;
GO

CREATE VIEW vw_MonthlyUpdates
AS
SELECT
    MonthLabel AS [month],
    UpdateCount AS [count],
    DisplayVi AS vi,
    DisplayEn AS en
FROM MonthlyUpdates;
GO

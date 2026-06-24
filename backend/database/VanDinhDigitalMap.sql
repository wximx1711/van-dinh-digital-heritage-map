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
VALUES (N'ADMIN'), (N'MANAGER'), (N'VISITOR');
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
    CreatedBy
)
VALUES
(N'h001', N'VDHN-DT-001', 1, N'Dinh Van Dinh', N'Van Dinh Communal House', N'dinh-van-dinh', N'national', N'active', N'Thon Van Dinh, Xa Van Dinh, Ha Noi', N'Van Dinh Village, Van Dinh Commune, Hanoi', 20.75600000, 105.85300000, N'Dinh Van Dinh la cong trinh kien truc nghe thuat dac sac.', N'Van Dinh Communal House is a distinctive architectural heritage site.', N'Duoc xay dung vao khoang the ky 17 va duoc xep hang di tich quoc gia nam 1994.', N'Built around the 17th century and designated as a national relic in 1994.', N'https://images.unsplash.com/photo-1571842533456-9b0d746c5a9b?w=800&h=500&fit=crop&auto=format', N'The ky XVII', N'Ban Quan ly Di tich Van Dinh', 1),
(N'h002', N'VDHN-DT-002', 2, N'Chua Boi Khe', N'Boi Khe Pagoda', N'chua-boi-khe', N'national', N'active', N'Thon Boi Khe, Xa Van Dinh, Ha Noi', N'Boi Khe Village, Van Dinh Commune, Hanoi', 20.74800000, 105.84900000, N'Chua Boi Khe la mot trong nhung ngoi chua co cua vung Ung Hoa.', N'Boi Khe Pagoda is one of the old pagodas of the Ung Hoa region.', N'Chua co lich su hon 700 nam, luu giu nhieu hien vat Phat giao quy.', N'The pagoda has more than 700 years of history and preserves Buddhist artifacts.', N'https://images.unsplash.com/photo-1568775791746-bcc117bcb312?w=800&h=500&fit=crop&auto=format', N'The ky XIII-XIV', N'Hoi Phat giao xa Van Dinh', 1),
(N'h003', N'VDHN-DT-003', 3, N'Den Van Dinh', N'Van Dinh Temple', N'den-van-dinh', N'city', N'active', N'Khu pho Van Dinh, Xa Van Dinh, Ha Noi', N'Van Dinh Quarter, Van Dinh Commune, Hanoi', 20.76200000, 105.85800000, N'Den Van Dinh la diem sinh hoat tin nguong tam linh cua dia phuong.', N'Van Dinh Temple is a local spiritual heritage destination.', N'Den gan voi tin nguong tho Mau va cac le hoi truyen thong trong nam.', N'The temple is associated with Mother Goddess worship and annual festivals.', N'https://images.unsplash.com/photo-1724533815121-ca09833513ee?w=800&h=500&fit=crop&auto=format', N'The ky XVII', N'Ban Quan ly Di tich Van Dinh', 1),
(N'h004', N'VDHN-DT-004', 4, N'Mieu Thon Giua', N'Middle Village Shrine', N'mieu-thon-giua', N'unranked', N'active', N'Thon Giua, Xa Van Dinh, Ha Noi', N'Middle Village, Van Dinh Commune, Hanoi', 20.75200000, 105.85100000, N'Mieu Thon Giua la noi tho cac vi than bao ho cua lang.', N'Middle Village Shrine is dedicated to local protective deities.', N'Cong trinh duoc cong dong dia phuong bao ton qua nhieu the he.', N'The shrine has been maintained by the local community across generations.', N'https://images.unsplash.com/photo-1677607220717-20d71984a207?w=800&h=500&fit=crop&auto=format', N'Dau the ky XX', N'Uy ban nhan dan xa Van Dinh', 1),
(N'h005', N'VDHN-DT-005', 8, N'Nha tho ho Dang', N'Dang Clan Ancestral House', N'nha-tho-ho-dang', N'unranked', N'active', N'Thon Dong, Xa Van Dinh, Ha Noi', N'East Village, Van Dinh Commune, Hanoi', 20.74600000, 105.84700000, N'Nha tho ho Dang la cong trinh kien truc truyen thong cua dong ho Dang.', N'Dang Clan Ancestral House is a traditional clan heritage site.', N'Noi day gan voi lich su hon 300 nam cua dong ho tai Van Dinh.', N'The site is connected with more than 300 years of Dang family history in Van Dinh.', N'https://images.unsplash.com/photo-1708464682068-58807c2d0538?w=800&h=500&fit=crop&auto=format', N'The ky XVIII', N'Dong ho Dang xa Van Dinh', 1),
(N'h006', N'VDHN-DT-006', 2, N'Chua Thanh Dinh', N'Thanh Dinh Pagoda', N'chua-thanh-dinh', N'city', N'maintenance', N'Thon Thanh Dinh, Xa Van Dinh, Ha Noi', N'Thanh Dinh Village, Van Dinh Commune, Hanoi', 20.75900000, 105.86200000, N'Chua Thanh Dinh la mot ngoi chua lon dang trong qua trinh trung tu.', N'Thanh Dinh Pagoda is a large pagoda currently under restoration.', N'Chua luu giu nhieu gia tri Phat giao va kien truc dia phuong.', N'The pagoda preserves Buddhist and local architectural values.', N'https://images.unsplash.com/photo-1723065195938-30a5e64036e8?w=800&h=500&fit=crop&auto=format', N'Cuoi the ky XVII', N'Hoi Phat giao xa Van Dinh', 1),
(N'h007', N'VDHN-DT-007', 9, N'Lang Mo Cu Nguyen Van Tho', N'Nguyen Van Tho Mausoleum', N'lang-mo-cu-nguyen-van-tho', N'unranked', N'active', N'Thon Tay, Xa Van Dinh, Ha Noi', N'West Village, Van Dinh Commune, Hanoi', 20.74400000, 105.84500000, N'Lang mo la noi tuong niem mot nhan vat co dong gop cho giao duc dia phuong.', N'The mausoleum commemorates a figure who contributed to local education.', N'Cong trinh duoc xay dung vao cuoi the ky XVIII.', N'The mausoleum was built in the late 18th century.', N'https://images.unsplash.com/photo-1696147861399-93bdb59749dd?w=800&h=500&fit=crop&auto=format', N'Cuoi the ky XVIII', N'Dong ho Nguyen xa Van Dinh', 1),
(N'h008', N'VDHN-DT-008', 1, N'Dinh Huong Tao', N'Huong Tao Communal House', N'dinh-huong-tao', N'city', N'active', N'Thon Huong Tao, Xa Van Dinh, Ha Noi', N'Huong Tao Village, Van Dinh Commune, Hanoi', 20.76500000, 105.86400000, N'Dinh Huong Tao tho thanh hoang lang va luu giu hien vat lich su.', N'Huong Tao Communal House worships the village deity and preserves historical artifacts.', N'Kien truc dinh mang nhieu dau an nghe thuat truyen thong.', N'The communal house reflects traditional architectural and artistic values.', N'https://images.unsplash.com/photo-1758298134870-f14bef5debcc?w=800&h=500&fit=crop&auto=format', N'The ky XVIII', N'Ban Quan ly Di tich Van Dinh', 1),
(N'h009', N'VDHN-DT-009', 5, N'Phu Van Dinh', N'Van Dinh Palace', N'phu-van-dinh', N'unranked', N'active', N'Xa Van Dinh, Ha Noi', N'Van Dinh Commune, Hanoi', 20.75700000, 105.84800000, N'Phu Van Dinh la cong trinh tho Mau cua dia phuong.', N'Van Dinh Palace is a local Mother Goddess worship site.', N'Noi day dien ra cac nghi le tin nguong truyen thong trong nam.', N'Traditional folk belief rituals take place here throughout the year.', N'https://images.unsplash.com/photo-1578409682213-e27b3355cad7?w=800&h=500&fit=crop&auto=format', N'The ky XIX', N'Uy ban nhan dan xa Van Dinh', 1),
(N'h010', N'VDHN-DT-010', 6, N'Quan Thi Cau', N'Thi Cau Taoist Temple', N'quan-thi-cau', N'unranked', N'closed', N'Thon Cau Dong, Xa Van Dinh, Ha Noi', N'Cau Dong Village, Van Dinh Commune, Hanoi', 20.74900000, 105.85700000, N'Quan Thi Cau la cong trinh tho theo tin nguong dan gian.', N'Thi Cau Taoist Temple is a folk belief heritage site.', N'Hien cong trinh tam dong cua de cho phuong an tu bo.', N'The site is temporarily closed pending restoration planning.', N'https://images.unsplash.com/photo-1600094338409-9d6754d3e83c?w=800&h=500&fit=crop&auto=format', N'Cuoi the ky XIX', N'Uy ban nhan dan xa Van Dinh', 1);
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

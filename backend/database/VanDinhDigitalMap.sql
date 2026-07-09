/*==========================================================
    PROJECT : VAN DINH DIGITAL HERITAGE MAP
    DATABASE: VanDinhDigitalMap
    GENERATED: 2026-07-09T13:12:15Z
    SOURCE  : Auto-generated database snapshot
    PURPOSE : Complete database recreation script

    Run:
        sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql
==========================================================*/

USE master;
GO

IF DB_ID(N'VanDinhDigitalMap') IS NOT NULL
BEGIN
    ALTER DATABASE [VanDinhDigitalMap]
    SET SINGLE_USER
    WITH ROLLBACK IMMEDIATE;

    DROP DATABASE [VanDinhDigitalMap];
END
GO

CREATE DATABASE [VanDinhDigitalMap];
GO

USE [VanDinhDigitalMap];
GO

-- ========================================
-- TABLES
-- ========================================

CREATE TABLE [__EFMigrationsHistory] (
    [MigrationId] nvarchar(300) NOT NULL,
    [ProductVersion] nvarchar(64) NOT NULL,
    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED ([MigrationId])
);
GO

CREATE TABLE [Roles] (
    [RoleId] int IDENTITY(1,1),
    [RoleName] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([RoleId]),
    CONSTRAINT [IX_Roles_RoleName] UNIQUE ([RoleName])
);
GO

CREATE TABLE [Users] (
    [UserId] bigint IDENTITY(1,1),
    [RoleId] int NOT NULL,
    [Username] nvarchar(100) NOT NULL,
    [PasswordHash] nvarchar(510) NOT NULL,
    [FullName] nvarchar(200) NULL,
    [Email] nvarchar(200) NULL,
    [Status] bit NOT NULL CONSTRAINT [DF_Users_Status] DEFAULT (CONVERT([bit],(1))),
    [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_Users_CreatedAt] DEFAULT (sysutcdatetime()),
    [UpdatedAt] datetime2(7) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([UserId]),
    CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles]([RoleId]),
    CONSTRAINT [IX_Users_Username] UNIQUE ([Username])
);
GO

CREATE TABLE [AboutPage] (
    [AboutId] int IDENTITY(1,1),
    [BannerImage] nvarchar(1000) NULL,
    [UpdatedBy] bigint NOT NULL,
    [UpdatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_AboutPage_UpdatedAt] DEFAULT (sysutcdatetime()),
    [ContactInfo] nvarchar(MAX) NULL,
    [IntroductionEn] nvarchar(MAX) NOT NULL CONSTRAINT [DF_AboutPage_IntroductionEn] DEFAULT (N''),
    [IntroductionVi] nvarchar(MAX) NOT NULL CONSTRAINT [DF_AboutPage_IntroductionVi] DEFAULT (N''),
    [MainContentEn] nvarchar(MAX) NOT NULL CONSTRAINT [DF_AboutPage_MainContentEn] DEFAULT (N''),
    [MainContentVi] nvarchar(MAX) NOT NULL CONSTRAINT [DF_AboutPage_MainContentVi] DEFAULT (N''),
    [TitleEn] nvarchar(400) NOT NULL CONSTRAINT [DF_AboutPage_TitleEn] DEFAULT (N''),
    [TitleVi] nvarchar(400) NOT NULL CONSTRAINT [DF_AboutPage_TitleVi] DEFAULT (N''),
    CONSTRAINT [PK_AboutPage] PRIMARY KEY CLUSTERED ([AboutId]),
    CONSTRAINT [FK_AboutPage_Users_UpdatedBy] FOREIGN KEY ([UpdatedBy]) REFERENCES [Users]([UserId])
);
GO

CREATE TABLE [AboutPageHistories] (
    [HistoryId] bigint IDENTITY(1,1),
    [AboutId] int NOT NULL,
    [TitleVi] nvarchar(400) NULL,
    [TitleEn] nvarchar(400) NULL,
    [IntroductionVi] nvarchar(MAX) NULL,
    [IntroductionEn] nvarchar(MAX) NULL,
    [MainContentVi] nvarchar(MAX) NULL,
    [MainContentEn] nvarchar(MAX) NULL,
    [BannerImage] nvarchar(1000) NULL,
    [ContactInfo] nvarchar(MAX) NULL,
    [UpdatedBy] bigint NOT NULL,
    [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_AboutPageHistories_CreatedAt] DEFAULT (sysutcdatetime()),
    CONSTRAINT [PK_AboutPageHistories] PRIMARY KEY CLUSTERED ([HistoryId]),
    CONSTRAINT [FK_AboutPageHistories_Users_UpdatedBy] FOREIGN KEY ([UpdatedBy]) REFERENCES [Users]([UserId])
);
GO

CREATE TABLE [ActivityLogs] (
    [LogId] bigint IDENTITY(1,1),
    [UserId] bigint NOT NULL,
    [Action] nvarchar(100) NULL,
    [EntityName] nvarchar(200) NULL,
    [EntityId] bigint NULL,
    [Description] nvarchar(MAX) NULL,
    [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_ActivityLogs_CreatedAt] DEFAULT (sysutcdatetime()),
    [IpAddress] nvarchar(90) NULL,
    CONSTRAINT [PK_ActivityLogs] PRIMARY KEY CLUSTERED ([LogId]),
    CONSTRAINT [FK_ActivityLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId])
);
GO

CREATE TABLE [HeritageCategories] (
    [CategoryId] int IDENTITY(1,1),
    [Code] nvarchar(60) NOT NULL,
    [NameVi] nvarchar(200) NOT NULL,
    [NameEn] nvarchar(200) NOT NULL,
    [IconUrl] nvarchar(510) NULL,
    CONSTRAINT [PK_HeritageCategories] PRIMARY KEY CLUSTERED ([CategoryId]),
    CONSTRAINT [IX_HeritageCategories_Code] UNIQUE ([Code])
);
GO

CREATE TABLE [Heritage] (
    [HeritageId] bigint IDENTITY(1,1),
    [PublicId] nvarchar(40) NOT NULL,
    [Code] nvarchar(100) NOT NULL,
    [CategoryId] int NOT NULL,
    [NameVi] nvarchar(510) NOT NULL,
    [NameEn] nvarchar(510) NOT NULL,
    [Slug] nvarchar(510) NOT NULL,
    [Classification] nvarchar(40) NOT NULL,
    [Status] nvarchar(40) NOT NULL,
    [AddressVi] nvarchar(1000) NULL,
    [AddressEn] nvarchar(1000) NULL,
    [Latitude] decimal(10,8) NULL,
    [Longitude] decimal(11,8) NULL,
    [DescriptionVi] nvarchar(MAX) NULL,
    [DescriptionEn] nvarchar(MAX) NULL,
    [HistoryVi] nvarchar(MAX) NULL,
    [HistoryEn] nvarchar(MAX) NULL,
    [ThumbnailUrl] nvarchar(1000) NULL,
    [YearBuilt] nvarchar(200) NULL,
    [Guardian] nvarchar(510) NULL,
    [QrCodeUrl] nvarchar(1000) NULL,
    [GoogleMapUrl] nvarchar(2000) NULL,
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_Heritage_IsDeleted] DEFAULT (CONVERT([bit],(0))),
    [DeletedAt] datetime2(7) NULL,
    [CreatedBy] bigint NOT NULL,
    [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_Heritage_CreatedAt] DEFAULT (sysutcdatetime()),
    [UpdatedAt] datetime2(7) NULL,
    CONSTRAINT [PK_Heritage] PRIMARY KEY CLUSTERED ([HeritageId]),
    CONSTRAINT [FK_Heritage_HeritageCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [HeritageCategories]([CategoryId]),
    CONSTRAINT [FK_Heritage_Users_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [Users]([UserId]),
    CONSTRAINT [CK_Heritage_Classification] CHECK ([Classification]='unranked' OR [Classification]='city' OR [Classification]='national'),
    CONSTRAINT [CK_Heritage_Status] CHECK ([Status]='closed' OR [Status]='maintenance' OR [Status]='active'),
    CONSTRAINT [IX_Heritage_Slug] UNIQUE ([Slug]),
    CONSTRAINT [IX_Heritage_PublicId] UNIQUE ([PublicId])
);
GO

CREATE TABLE [HeritageDocuments] (
    [DocumentId] bigint IDENTITY(1,1),
    [HeritageId] bigint NOT NULL,
    [FileName] nvarchar(510) NULL,
    [FileUrl] nvarchar(1000) NULL,
    [FileType] nvarchar(40) NULL,
    [FileSize] bigint NULL,
    [UploadedAt] datetime2(7) NOT NULL CONSTRAINT [DF_HeritageDocuments_UploadedAt] DEFAULT (sysutcdatetime()),
    CONSTRAINT [PK_HeritageDocuments] PRIMARY KEY CLUSTERED ([DocumentId]),
    CONSTRAINT [FK_HeritageDocuments_Heritage_HeritageId] FOREIGN KEY ([HeritageId]) REFERENCES [Heritage]([HeritageId])
);
GO

CREATE TABLE [HeritageImages] (
    [ImageId] bigint IDENTITY(1,1),
    [HeritageId] bigint NOT NULL,
    [ImageUrl] nvarchar(1000) NOT NULL,
    [Caption] nvarchar(510) NULL,
    [SortOrder] int NOT NULL CONSTRAINT [DF_HeritageImages_SortOrder] DEFAULT ((0)),
    [UploadedAt] datetime2(7) NOT NULL CONSTRAINT [DF_HeritageImages_UploadedAt] DEFAULT (sysutcdatetime()),
    CONSTRAINT [PK_HeritageImages] PRIMARY KEY CLUSTERED ([ImageId]),
    CONSTRAINT [FK_HeritageImages_Heritage_HeritageId] FOREIGN KEY ([HeritageId]) REFERENCES [Heritage]([HeritageId])
);
GO

CREATE TABLE [HeritageVideos] (
    [VideoId] bigint IDENTITY(1,1),
    [HeritageId] bigint NOT NULL,
    [Title] nvarchar(510) NULL,
    [VideoType] nvarchar(40) NULL,
    [VideoUrl] nvarchar(1000) NULL,
    [ThumbnailUrl] nvarchar(1000) NULL,
    [UploadedAt] datetime2(7) NOT NULL CONSTRAINT [DF_HeritageVideos_UploadedAt] DEFAULT (sysutcdatetime()),
    CONSTRAINT [PK_HeritageVideos] PRIMARY KEY CLUSTERED ([VideoId]),
    CONSTRAINT [FK_HeritageVideos_Heritage_HeritageId] FOREIGN KEY ([HeritageId]) REFERENCES [Heritage]([HeritageId])
);
GO

CREATE TABLE [IntangibleHeritage] (
    [IntangibleId] bigint IDENTITY(1,1),
    [PublicId] nvarchar(40) NOT NULL,
    [NameVi] nvarchar(510) NOT NULL,
    [NameEn] nvarchar(510) NOT NULL,
    [Category] nvarchar(60) NOT NULL,
    [DescriptionVi] nvarchar(MAX) NULL,
    [DescriptionEn] nvarchar(MAX) NULL,
    [ImageUrl] nvarchar(1000) NULL,
    [VideoUrl] nvarchar(1000) NULL,
    [IsDeleted] bit NOT NULL CONSTRAINT [DF_IntangibleHeritage_IsDeleted] DEFAULT (CONVERT([bit],(0))),
    [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_IntangibleHeritage_CreatedAt] DEFAULT (sysutcdatetime()),
    [UpdatedAt] datetime2(7) NULL,
    [CreatedBy] bigint NOT NULL CONSTRAINT [DF_IntangibleHeritage_CreatedBy] DEFAULT (CONVERT([bigint],(1))),
    [UpdatedBy] bigint NULL,
    CONSTRAINT [PK_IntangibleHeritage] PRIMARY KEY CLUSTERED ([IntangibleId]),
    CONSTRAINT [CK_IntangibleHeritage_Category] CHECK ([Category]='story' OR [Category]='ritual' OR [Category]='craft' OR [Category]='performance' OR [Category]='festival'),
    CONSTRAINT [IX_IntangibleHeritage_PublicId] UNIQUE ([PublicId])
);
GO

CREATE TABLE [MediaFiles] (
    [MediaFileId] bigint IDENTITY(1,1),
    [Url] nvarchar(1000) NOT NULL,
    [FileName] nvarchar(510) NOT NULL,
    [FileSize] bigint NOT NULL,
    [MediaType] nvarchar(40) NOT NULL,
    [UploadedAt] datetime2(7) NOT NULL CONSTRAINT [DF_MediaFiles_UploadedAt] DEFAULT (sysutcdatetime()),
    CONSTRAINT [PK_MediaFiles] PRIMARY KEY CLUSTERED ([MediaFileId])
);
GO

CREATE TABLE [MonthlyUpdates] (
    [UpdateId] int IDENTITY(1,1),
    [MonthLabel] nvarchar(40) NOT NULL,
    [DisplayVi] nvarchar(100) NOT NULL,
    [DisplayEn] nvarchar(100) NOT NULL,
    [UpdateCount] int NOT NULL CONSTRAINT [DF_MonthlyUpdates_UpdateCount] DEFAULT ((0)),
    CONSTRAINT [PK_MonthlyUpdates] PRIMARY KEY CLUSTERED ([UpdateId])
);
GO

CREATE TABLE [RelatedLinks] (
    [LinkId] int IDENTITY(1,1),
    [Title] nvarchar(400) NOT NULL,
    [Url] nvarchar(1000) NOT NULL,
    [DisplayOrder] int NOT NULL CONSTRAINT [DF_RelatedLinks_DisplayOrder] DEFAULT ((0)),
    [IsEnabled] bit NOT NULL CONSTRAINT [DF_RelatedLinks_IsEnabled] DEFAULT (CONVERT([bit],(1))),
    [CreatedBy] bigint NOT NULL,
    [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_RelatedLinks_CreatedAt] DEFAULT (sysutcdatetime()),
    [UpdatedBy] bigint NULL,
    [UpdatedAt] datetime2(7) NULL,
    CONSTRAINT [PK_RelatedLinks] PRIMARY KEY CLUSTERED ([LinkId]),
    CONSTRAINT [FK_RelatedLinks_Users_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [Users]([UserId]),
    CONSTRAINT [FK_RelatedLinks_Users_UpdatedBy] FOREIGN KEY ([UpdatedBy]) REFERENCES [Users]([UserId])
);
GO

CREATE TABLE [SystemSettings] (
    [SettingId] int IDENTITY(1,1),
    [WebsiteName] nvarchar(510) NULL,
    [LogoUrl] nvarchar(1000) NULL,
    [FooterText] nvarchar(1000) NULL,
    [ContactEmail] nvarchar(510) NULL,
    [Phone] nvarchar(100) NULL,
    [Address] nvarchar(510) NULL,
    [FacebookUrl] nvarchar(1000) NULL,
    [TiktokUrl] nvarchar(1000) NULL,
    [UpdatedBy] bigint NULL,
    [UpdatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_SystemSettings_UpdatedAt] DEFAULT (sysutcdatetime()),
    [YoutubeUrl] nvarchar(1000) NULL,
    CONSTRAINT [PK_SystemSettings] PRIMARY KEY CLUSTERED ([SettingId]),
    CONSTRAINT [FK_SystemSettings_Users_UpdatedBy] FOREIGN KEY ([UpdatedBy]) REFERENCES [Users]([UserId])
);
GO

-- ========================================
-- INDEXES (NON-CLUSTERED)
-- ========================================

CREATE NONCLUSTERED INDEX [IX_Users_RoleId] ON [Users]([RoleId]);
GO

CREATE NONCLUSTERED INDEX [IX_AboutPage_UpdatedBy] ON [AboutPage]([UpdatedBy]);
GO

CREATE NONCLUSTERED INDEX [IX_AboutPageHistories_AboutId] ON [AboutPageHistories]([AboutId]);
GO

CREATE NONCLUSTERED INDEX [IX_AboutPageHistories_UpdatedBy] ON [AboutPageHistories]([UpdatedBy]);
GO

CREATE NONCLUSTERED INDEX [IX_ActivityLogs_UserId] ON [ActivityLogs]([UserId]);
GO

CREATE NONCLUSTERED INDEX [IX_ActivityLogs_EntityName] ON [ActivityLogs]([EntityName]);
GO

CREATE NONCLUSTERED INDEX [IX_ActivityLogs_CreatedAt] ON [ActivityLogs]([CreatedAt]);
GO

CREATE NONCLUSTERED INDEX [IX_Heritage_Classification] ON [Heritage]([Classification]);
GO

CREATE NONCLUSTERED INDEX [IX_Heritage_CategoryId] ON [Heritage]([CategoryId]);
GO

CREATE NONCLUSTERED INDEX [IX_Heritage_Status] ON [Heritage]([Status]);
GO

CREATE NONCLUSTERED INDEX [IX_Heritage_IsDeleted] ON [Heritage]([IsDeleted]);
GO

CREATE NONCLUSTERED INDEX [IX_Heritage_CreatedBy] ON [Heritage]([CreatedBy]);
GO

CREATE NONCLUSTERED INDEX [IX_Heritage_Code] ON [Heritage]([Code]);
GO

CREATE NONCLUSTERED INDEX [IX_HeritageDocuments_HeritageId] ON [HeritageDocuments]([HeritageId]);
GO

CREATE NONCLUSTERED INDEX [IX_HeritageImages_HeritageId] ON [HeritageImages]([HeritageId]);
GO

CREATE NONCLUSTERED INDEX [IX_HeritageVideos_HeritageId] ON [HeritageVideos]([HeritageId]);
GO

CREATE NONCLUSTERED INDEX [IX_IntangibleHeritage_Category] ON [IntangibleHeritage]([Category]);
GO

CREATE NONCLUSTERED INDEX [IX_IntangibleHeritage_CreatedBy] ON [IntangibleHeritage]([CreatedBy]);
GO

CREATE NONCLUSTERED INDEX [IX_IntangibleHeritage_UpdatedBy] ON [IntangibleHeritage]([UpdatedBy]);
GO

CREATE NONCLUSTERED INDEX [IX_MediaFiles_Url] ON [MediaFiles]([Url]);
GO

CREATE NONCLUSTERED INDEX [IX_MediaFiles_MediaType] ON [MediaFiles]([MediaType]);
GO

CREATE NONCLUSTERED INDEX [IX_RelatedLinks_CreatedBy] ON [RelatedLinks]([CreatedBy]);
GO

CREATE NONCLUSTERED INDEX [IX_RelatedLinks_UpdatedBy] ON [RelatedLinks]([UpdatedBy]);
GO

CREATE NONCLUSTERED INDEX [IX_SystemSettings_UpdatedBy] ON [SystemSettings]([UpdatedBy]);
GO

-- ========================================
-- SEED AND CURRENT DATA
-- ========================================

-- [__EFMigrationsHistory]: 13 rows
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260701052754_InitialCreate', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260702054259_UpdateDatabaseSchema', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260703000000_AddAuditFieldsToIntangibleHeritage', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260703000001_UpdateAboutPageModel', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260704000000_AddAboutPageHistory', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260705000000_MakeActivityLogActionAndEntityNameNullable', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260706000000_MakeHeritageNullableFieldsOptional', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260707000000_AddRelatedLinksAndYoutubeUrl', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260707105710_TempCheckMigration', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260707111053_TestMigration', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260707112615_VerifySnapshot', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260707120039_VerifyMigration', N'10.0.9');
INSERT [__EFMigrationsHistory] ([MigrationId],[ProductVersion]) VALUES (N'20260708000000_RemoveHeritageCodeUniqueConstraint', N'10.0.9');
GO

-- [Roles]: 2 rows
SET IDENTITY_INSERT [Roles] ON;
INSERT [Roles] ([RoleId],[RoleName]) VALUES (1, N'ADMIN');
INSERT [Roles] ([RoleId],[RoleName]) VALUES (2, N'MANAGER');
SET IDENTITY_INSERT [Roles] OFF;
GO
DBCC CHECKIDENT ([Roles], RESEED, 2);
GO

-- [Users]: 2 rows
SET IDENTITY_INSERT [Users] ON;
INSERT [Users] ([UserId],[RoleId],[Username],[PasswordHash],[FullName],[Email],[Status],[CreatedAt],[UpdatedAt]) VALUES (1, 1, N'admin', N'PBKDF2$FH7WhtH1lpHX2QWzQNnVuw==$Erw2DbU900h9bPw42Wbt7cFxpCfyeCn+dA5+V7zxkeU=', N'System Administrator', N'admin@vandinh.gov.vn', 1, '2026-07-09T05:55:06.3777988', NULL);
INSERT [Users] ([UserId],[RoleId],[Username],[PasswordHash],[FullName],[Email],[Status],[CreatedAt],[UpdatedAt]) VALUES (2, 2, N'manager', N'PBKDF2$KzQprL/FIwjmy1YVBOR+ww==$ijh3XI32z4rXxlJszBPabDGffphTR/3cMnoeexNWHQ8=', N'Heritage Manager', N'manager@vandinh.gov.vn', 1, '2026-07-09T05:55:06.4336254', NULL);
SET IDENTITY_INSERT [Users] OFF;
GO
DBCC CHECKIDENT ([Users], RESEED, 2);
GO

-- [AboutPage]: 1 rows
SET IDENTITY_INSERT [AboutPage] ON;
INSERT [AboutPage] ([AboutId],[BannerImage],[UpdatedBy],[UpdatedAt],[ContactInfo],[IntroductionEn],[IntroductionVi],[MainContentEn],[MainContentVi],[TitleEn],[TitleVi]) VALUES (1, NULL, 1, '2026-07-09T05:55:06.5843869', NULL, N'The Van Dinh Digital Heritage Map System is a project for digitizing and preserving cultural heritage of Van Dinh Commune, Ung Hoa District, Hanoi City.', N'Hệ thống Bản đồ số Di sản Văn hóa Vân Đình là dự án số hóa và bảo tồn di sản văn hóa của xã Vân Đình, huyện Ứng Hòa, thành phố Hà Nội.', N'With over 10 tangible heritage sites and 5 intangible heritage items documented and digitized, the system provides comprehensive information on history, architecture, coordinates, and images of each heritage site.', N'Với tổng số hơn 10 di tích vật thể và 5 di sản phi vật thể được ghi nhận và số hóa, hệ thống cung cấp đầy đủ thông tin lịch sử, kiến trúc, tọa độ và hình ảnh của từng di sản.', N'About Van Dinh Commune', N'Giới thiệu xã Vân Đình');
SET IDENTITY_INSERT [AboutPage] OFF;
GO
DBCC CHECKIDENT ([AboutPage], RESEED, 1);
GO

-- [AboutPageHistories]: 0 rows
GO

-- [ActivityLogs]: 0 rows
GO

-- [HeritageCategories]: 9 rows
SET IDENTITY_INSERT [HeritageCategories] ON;
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (1, N'dinh', N'Dinh', N'Communal House', N'/icons/dinh.png');
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (2, N'chua', N'Chua', N'Pagoda', N'/icons/chua.png');
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (3, N'den', N'Den', N'Temple', N'/icons/den.png');
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (4, N'mieu', N'Mieu', N'Shrine', N'/icons/mieu.png');
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (5, N'phu', N'Phu', N'Palace', N'/icons/phu.png');
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (6, N'quan', N'Quan', N'Taoist Temple', N'/icons/quan.png');
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (7, N'nhacu', N'Nha co', N'Ancient House', N'/icons/nhacu.png');
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (8, N'nhatho', N'Nha tho ho', N'Clan House', N'/icons/nhatho.png');
INSERT [HeritageCategories] ([CategoryId],[Code],[NameVi],[NameEn],[IconUrl]) VALUES (9, N'lang', N'Lang mo', N'Mausoleum', N'/icons/lang.png');
SET IDENTITY_INSERT [HeritageCategories] OFF;
GO
DBCC CHECKIDENT ([HeritageCategories], RESEED, 9);
GO

-- [Heritage]: 0 rows
GO

-- [HeritageDocuments]: 0 rows
GO

-- [HeritageImages]: 0 rows
GO

-- [HeritageVideos]: 0 rows
GO

-- [IntangibleHeritage]: 0 rows
GO

-- [MediaFiles]: 0 rows
GO

-- [MonthlyUpdates]: 0 rows
GO

-- [RelatedLinks]: 0 rows
GO

-- [SystemSettings]: 1 rows
SET IDENTITY_INSERT [SystemSettings] ON;
INSERT [SystemSettings] ([SettingId],[WebsiteName],[LogoUrl],[FooterText],[ContactEmail],[Phone],[Address],[FacebookUrl],[TiktokUrl],[UpdatedBy],[UpdatedAt],[YoutubeUrl]) VALUES (1, N'Ban do so Xa Van Dinh', NULL, N'Ban do so Xa Van Dinh', N'contact@vandinh.vn', N'0123456789', N'Xa Van Dinh, Thanh pho Ha Noi', NULL, NULL, 1, '2026-07-09T05:55:06.5425972', NULL);
SET IDENTITY_INSERT [SystemSettings] OFF;
GO
DBCC CHECKIDENT ([SystemSettings], RESEED, 1);
GO

PRINT 'Database [VanDinhDigitalMap] has been recreated successfully.';
GO

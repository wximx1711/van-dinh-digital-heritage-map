/*==========================================================
    PROJECT : VAN DINH DIGITAL HERITAGE MAP
    DATABASE: VanDinhDigitalMap
    GENERATED: 2026-07-09T14:12:42Z
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

-- [Users]: 3 rows
SET IDENTITY_INSERT [Users] ON;
INSERT [Users] ([UserId],[RoleId],[Username],[PasswordHash],[FullName],[Email],[Status],[CreatedAt],[UpdatedAt]) VALUES (1, 1, N'admin', N'PBKDF2$FH7WhtH1lpHX2QWzQNnVuw==$Erw2DbU900h9bPw42Wbt7cFxpCfyeCn+dA5+V7zxkeU=', N'System Administrator', N'admin@vandinh.gov.vn', 1, '2026-07-09T05:55:06.3777988', NULL);
INSERT [Users] ([UserId],[RoleId],[Username],[PasswordHash],[FullName],[Email],[Status],[CreatedAt],[UpdatedAt]) VALUES (2, 2, N'manager', N'PBKDF2$KzQprL/FIwjmy1YVBOR+ww==$ijh3XI32z4rXxlJszBPabDGffphTR/3cMnoeexNWHQ8=', N'Heritage Manager', N'manager@vandinh.gov.vn', 1, '2026-07-09T05:55:06.4336254', NULL);
INSERT [Users] ([UserId],[RoleId],[Username],[PasswordHash],[FullName],[Email],[Status],[CreatedAt],[UpdatedAt]) VALUES (3, 2, N'kiki', N'PBKDF2$fIB2fe6IrC7gIbAyXQso0g==$kbOOjNUFqU7hz0cATwWJ7UncPCLehKC/HBSfIPBrpjI=', N'kikii', N'kiki@gmail.com', 1, '2026-07-09T13:29:39.3230205', NULL);
SET IDENTITY_INSERT [Users] OFF;
GO
DBCC CHECKIDENT ([Users], RESEED, 3);
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

-- [ActivityLogs]: 13 rows
SET IDENTITY_INSERT [ActivityLogs] ON;
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (2, 1, N'LOGIN', N'Users', 1, N'User logged in.', '2026-07-09T13:29:05.8477811', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (3, 1, N'CREATE', N'Users', 3, N'kiki', '2026-07-09T13:29:39.3506524', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (4, 1, N'LOGOUT', N'Users', NULL, N'User logged out.', '2026-07-09T13:29:48.1594444', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (5, 3, N'LOGIN', N'Users', 3, N'User logged in.', '2026-07-09T13:29:53.1436808', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (6, 3, N'CREATE', N'Heritage', 1, N'VĐHN-DT-001', '2026-07-09T13:35:05.4753726', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (7, 3, N'CREATE', N'HeritageDocuments', 1, N'heff617cc', '2026-07-09T13:35:15.6441003', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (8, 3, N'UPDATE', N'Heritage', 1, N'VĐHN-DT-001', '2026-07-09T13:35:17.4080865', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (9, 3, N'CREATE', N'Heritage', 2, N'VĐHN-DT-002', '2026-07-09T13:49:50.2610308', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (10, 3, N'CREATE', N'HeritageDocuments', 2, N'h0d0c0cbc', '2026-07-09T13:53:27.9999176', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (11, 3, N'UPDATE', N'Heritage', 2, N'VĐHN-DT-002', '2026-07-09T13:53:31.1942689', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (12, 3, N'UPDATE', N'Heritage', 1, N'VĐHN-DT-001', '2026-07-09T13:55:38.2536852', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (13, 3, N'LOGOUT', N'Users', NULL, N'User logged out.', '2026-07-09T13:56:05.9205638', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (14, 3, N'LOGIN', N'Users', 3, N'User logged in.', '2026-07-09T13:58:55.1516722', NULL);
SET IDENTITY_INSERT [ActivityLogs] OFF;
GO
DBCC CHECKIDENT ([ActivityLogs], RESEED, 14);
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

-- [Heritage]: 2 rows
SET IDENTITY_INSERT [Heritage] ON;
INSERT [Heritage] ([HeritageId],[PublicId],[Code],[CategoryId],[NameVi],[NameEn],[Slug],[Classification],[Status],[AddressVi],[AddressEn],[Latitude],[Longitude],[DescriptionVi],[DescriptionEn],[HistoryVi],[HistoryEn],[ThumbnailUrl],[YearBuilt],[Guardian],[QrCodeUrl],[GoogleMapUrl],[IsDeleted],[DeletedAt],[CreatedBy],[CreatedAt],[UpdatedAt]) VALUES (1, N'heff617cc', N'VĐHN-DT-001', 2, N'CHÙA BA CHÈ (BÀ CHÈ - BÀ TRÀ TỰ)', N'CHÙA BA CHÈ (BÀ CHÈ - BÀ TRÀ TỰ)', N'chùa-ba-chè-bà-chè-bà-trà-tự', N'city', N'active', N'63 Đ. Quang Trung, Vân Đình, Hà Nội, Việt Nam', N'63 Đ. Quang Trung, Vân Đình, Hà Nội, Việt Nam', 20.72903680, 105.77182720, N'1. Thông tin hành chính & Xếp hạng pháp lý
Tên di tích thống nhất: Chùa Ba Chè (hoặc Chùa Bà Chè).
Tên chữ: Bà Trà Tự.
Địa điểm: Thôn Hoàng Xá, xã Liên Bạt, huyện Ứng Hòa, tỉnh Hà Tây (nay thuộc thành phố Hà Nội).
Lịch sử địa giới: Thời Lê thuộc xã Hoa Đình, tổng Phương Đình, huyện Sơn Minh, phủ Ứng Thiên, trấn Sơn Nam Thượng. Đến giữa thế kỷ XIX, huyện Sơn Minh đổi thành huyện Sơn Lãng, thuộc tỉnh Hà Nội. Trước Cách mạng tháng Tám thuộc phủ Ứng Hòa, tỉnh Hà Đông. Sau đó thuộc xã Mai Đình và nay ổn định tại xã Liên Bạt.
Loại hình di tích: Di tích Kiến trúc - Nghệ thuật Tôn giáo dạng chùa.
Hành lang xếp hạng: Hồ sơ khoa học được thiết lập đồng bộ vào các năm 1993 và hoàn thiện pháp lý năm 1999. Di tích được bảo vệ nghiêm ngặt bằng văn bản theo quy chế Di sản văn hóa.', N'1. Administrative Information & Legal Ranking
Unified name of the monument: Ba Chè Pagoda (or Bà Chè Pagoda).

Vietnamese name: Bà Trà Tự.

Location: Hoàng Xá village, Liên Bạt commune, Ứng Hòa district, Hà Tây province (now part of Hanoi city).

Historical boundaries: During the Lê dynasty, it belonged to Hoa Đình commune, Phương Đình district, Sơn Minh county, Ứng Thiên prefecture, Sơn Nam Thượng town. In the mid-19th century, Sơn Minh county was renamed Sơn Lãng county, belonging to Hanoi province. Before the August Revolution, it belonged to Ứng Hòa prefecture, Hà Đông province. Later, it belonged to Mai Đình commune and is now located in Liên Bạt commune.

Type of monument: Architectural - Artistic religious monument in the form of a pagoda.

Ranking framework: Scientific documentation was established comprehensively in 1993 and legal documentation was completed in 1999. The monument is strictly protected by written regulations under the Cultural Heritage regulations.', N'Nguồn gốc lịch sử & Giá trị Cách mạng
Nguồn gốc tên gọi: Tương truyền, chùa được khởi dựng rất sớm từ thời nhà Lý (thế kỷ XI). Đến thế kỷ XVIII, trong một lần du ngoạn chùa Hương, Chúa Trịnh Sâm và Tuyên phi Đặng Thị Huệ đã dừng chân bái Phật tại đây. Trước cảnh chùa hoang sơ, Chúa và Tuyên phi đã xuất tiền vàng cung tiến để cùng dân làng đại trùng tu. Do đương thời Tuyên phi Đặng Thị Huệ được dân gian gọi là "Bà chúa Chè", nhân dân đã cảm kích gọi tên di tích là chùa Bà Chè (chùa Ba Chè) để tri ân công đức của bà.
Dấu ấn Cách mạng kiên cường: Chùa Ba Chè là một "địa chỉ đỏ" chứng kiến nhiều sự kiện lịch sử trọng đại của huyện Ứng Hòa:
Tháng 7/1945: Chi bộ Việt Minh và UBND cách mạng lâm thời phủ Đội Bình được thành lập ngay tại chùa.
Ngày 17/8/1945: Dưới sự chỉ huy trực tiếp của đồng chí Đỗ Mười, lực lượng tự vệ vũ trang địa phương đã tập hợp xuất phát từ chùa để tiến đánh cướp chính quyền, chiếm phủ đường Ứng Hòa.
Giai đoạn 1946 - 1949: Chùa là trụ sở hoạt động của Ủy ban hành chính kháng chiến tổng Phương Đình. Chi bộ Đảng Cộng sản Đông Dương tổng Phương Đình cũng được thành lập tại đây vào tháng 6/1946.
Thời kỳ kháng chiến chống Pháp: Chùa là một phân hiệu của Bệnh viện Quân khu I thuộc tỉnh Lưỡng Hà. Tháng 1/1947, Đại tướng Võ Nguyên Giáp, đồng chí Đỗ Mười cùng bác sĩ Hồ Đắc Di đã về thăm và động viên thương binh tại đây. Nơi đây cũng là trung tâm tiếp nhận "Tuần lễ vàng" với 73 lạng vàng bạc và 63 bộ đỉnh đồng do nhân dân đóng góp cúng kháng chiến.
Ngày giỗ trận sinh linh (18/8 Âm lịch): Ngày 19/9/1948, thực dân Pháp đổ bộ máy bay càn quét quy mô lớn vào khu vực chùa, sát hại hơn 100 người dân vô tội và Sư cụ trụ trì Đàm Mười do che giấu cán bộ. Từ đó, hằng năm chùa đều tổ chức đại lễ cầu siêu long trọng vào ngày 18/8 Âm lịch để tưởng niệm sự kiện đau thương này.
3. Quy mô bố cục & Kiến trúc nghệ thuật
Căn cứ theo bản vẽ mặt bằng tổng thể hiện trạng, di tích tọa lạc trên khu đất bằng phẳng, rộng rãi ở phía Tây Bắc của làng, kiến trúc mang lối quy chuẩn truyền thống và sắc thái thanh tịnh:
Cổng Tam quan: Kiến trúc cung đình xây chồng diêm 2 tầng 4 mái, đầu hồi bít đốc, các góc đao uốn cong vút tạc hình rồng lá hướng về nóc. Điểm độc đáo nổi bật là hệ thống hàng cột hiên trước được cổ nhân tạo dựng bằng đá xanh liền khối xẻ vuông chịu lực, có khắc niên đại rõ ràng vào năm Minh Mạng thứ 12 (1831). Cổ diêm đắp nổi ba chữ chữ Hán lớn: "Bà Trà Tự".
Tòa Tiền đường (Bái đường): Là nếp nhà ngang gồm 5 gian (chiều dài mặt bằng tổng thể cụm chính là 15,72m) xây kiểu bít đốc hồi. Bộ khung chịu lực bằng gỗ tứ thiết với kết cấu kèo theo lối "Giá chiêng - rường cụt" vững chãi, kỹ thuật bào trơn đóng bén ăn mộng khít khao. Trên xà gồ còn lưu dòng chữ Hán ghi nhận đợt đại trùng tu thời Tây Sơn: "Cảnh Thịnh sáng niên... trùng tu đại cát lợi" (1793 hoặc 1800).
Tòa Thượng điện: Kết cấu nhà dọc gồm 3 gian nối liên hoàn với gian giữa Tiền đường tạo thành bố cục chữ Đinh ($\mathbf{J}$). Thượng điện thâm nghiêm với hệ bệ thờ xây dật cấp cao dần từ ngoài vào trong làm nơi tôn trí hệ thống tượng pháp.
Các công trình phụ trợ: Khuôn viên nội tự bao quanh gồm có dãy nhà Mẫu, nhà Tổ (kiểu nhà ngang nằm phía sau Tam bảo) và khu vườn tháp mộ cổ bảo lưu tháp cổ "Hoàng Hà bảo tháp" chứa hài cốt vị sư tổ từ thời Lê - Trịnh.
4. Hệ thống cổ vật, tự khí và Tượng pháp đặc trưng
Chùa Ba Chè lưu giữ hệ thống tượng tròn gỗ mít và đất luyện vô cùng giá trị, phong phú (khoảng trên 20 pho) bao gồm:
Hệ thống tượng Phật trên điện thờ:
Lớp 1 (Cao nhất): Bộ tượng Tam Thế Phật ngồi kiết già tọa thiền trên đài sen cổ, đầu tạc nhục khấu, áo la bào cánh sen thả nếp mềm mại mang phong cách điêu khắc thế kỷ XIX.
Lớp 2: Bộ tượng Di Đà Tam Tôn tạc thời Lê (thế kỷ XVIII) dáng thấm lùn mập mạp, diện tượng từ bi kề cận tượng đứng của Đại Thế Chí Bồ Tát và Quan Thế Âm Bồ Tát đội mũ thiên quan cẩn hoa cúc.
Lớp 3: Bộ Hoa Nghiêm Tam Thánh có niên đại sớm nhất Phật điện (nửa sau thế kỷ XVII - đầu XVIII) gồm pho Thích Ca Niêm Hoa ở giữa, hai bên là Văn Thù và Phổ Hiền dáng thon thả, co thon đạt đỉnh cao về thẩm mỹ tạo hình gỗ.
Lớp 4: Tượng Quan Âm Chuẩn Đề sơn son thếp vàng có 11 đôi tay (22 cánh tay) mềm mại tỏa đều sang hai bên trong các thế ấn mật tông hoặc nâng đỡ pháp bảo, hai bên có tượng hầu Kim Đồng và Ngọc Nữ tạc sinh động như người thực.
Lớp 5: Tượng Phật Di Lặc tạc ngồi tự nhiên đầy đặn, khuôn mặt hớn hở từ bi.
Lớp 6: Tòa Cửu Long bằng gỗ chạm lộng rồng phun nước tắm cho tượng Thích Ca sơ sinh chỉ tay lên trời chỉ tay xuống đất. Phía ngoài bài trí cặp võ tướng Hộ Pháp cưỡi mãnh sư, tượng Đức Ông và ban thờ Quan Âm Tống Tử (tạc gắn liền tích Bà Thị Kính mang diện mạo mộc mạc của cô thôn nữ Bắc Bộ).
Hiện vật quý hiếm khác:
01 quả chuông đồng cổ đúc năm Quý Tỵ (1953) bám triện gấm sắc nét.
01 tấm văn bia đá cổ do tướng công họ Đỗ (tước Nhân hầu) trực tiếp phụng soạn và triết văn ghi chép sử liệu trùng tu chùa từ thời Vĩnh Hựu.
02 khối phù điêu đá xanh tạc rồng, lân cổ thế kỷ XV cùng 14 viên gạch hòm sớ thời Lê - Mạc chạm nổi hoa lá cách điệu, nghê thần và rồng uốn kiểu "yên ngựa" đặc trưng.
5. Chỉ giới pháp lý & Địa chính khoanh vùng bảo vệ
Căn cứ theo bản đồ địa chính trích lục vẽ năm 1992 (Tờ số 12, tỷ lệ 1/1000) và biên bản khoanh vùng lập ngày 02/07/1999, ranh giới quản lý của di tích được phân định nghiêm ngặt:
Khu vực I (Vùng cốt lõi gốc bất khả xâm phạm - Màu đỏ):
Phạm vi hành chính: Bao gồm tòa Tam bảo chính điện, nhà Tổ, nhà Mẫu, khu hành lang sân gạch nội tự và vườn tháp mộ.
Diện tích đất cốt lõi: Đạt 7.995,0 $m^2$ (trong đó đã tính bao gồm 13,0 $m^2$ diện tích dải đất lưu không bảo vệ ven rìa).
Vị trí ranh giới tiếp giáp thửa đất số 600:
Phía Đông: Tiếp giáp lối Đường đồng trục chính và các thửa đất giải thửa số 377, 389, 388.
Phía Tây: Tiếp giáp hành lang mương nước rãnh thoát của thửa đất số 505 dốc ra hướng bờ sông Đáy.
Phía Nam: Tiếp giáp trực tiếp trục Đường làng liên thôn và giáp các thửa đất số 601, 674, 616, 617, 619.
Phía Bắc: Tiếp giáp liền kề hành lang ranh giới của hai thửa đất số 595 và 596.
Khu vực II (Vùng điều chỉnh xây dựng bảo tồn cảnh quan - Màu xanh):
Diện tích: Rộng 130,0 $m^2$ nằm trên bãi đất trống phía rìa giáp đất lưu không của HTXNN cũ.
Ranh giới tiếp giáp: Đông giáp thửa đất cốt lõi 600; Tây giáp Đường làng; Nam giáp Đường làng; Bắc giáp hành lang thửa đất số 545.
Mọi hành vi tự ý phá dỡ, cơi nới công trình, tháo gỡ hệ khung gỗ "giá chiêng" hoặc tự ý dịch chuyển các phù điêu đá xanh thế kỷ XV, gạch hòm sớ thời Mạc ra khỏi hành lang hai vùng khoanh mốc của thửa đất số 600 đều bị pháp luật xử lý nghiêm khắc theo Luật Di sản văn hóa.', N'Historical Origins & Revolutionary Value
Origin of the name: Legend has it that the pagoda was built very early during the Ly Dynasty (11th century). In the 18th century, during a trip to Huong Pagoda, Lord Trinh Sam and his consort Dang Thi Hue stopped to worship Buddha here. Seeing the pagoda in its dilapidated state, the Lord and his consort donated gold and money to help the villagers with its major restoration. Because Consort Dang Thi Hue was known as "Lady of Tea" at the time, the people gratefully named the site Ba Che Pagoda (Ba Che Pagoda) to honor her meritorious deeds.
A mark of unwavering revolutionary spirit: Ba Che Pagoda is a "red address" that witnessed many important historical events in Ung Hoa district:
July 1945: The Viet Minh branch and the provisional revolutionary People''s Committee of Doi Binh district were established right at the pagoda.
August 17, 1945: Under the direct command of Comrade Do Muoi, local armed self-defense forces assembled and set out from the pagoda to attack and seize power, occupying the Ung Hoa district headquarters.

1946-1949: The pagoda served as the headquarters of the Phuong Dinh District Resistance Administrative Committee. The Phuong Dinh District branch of the Indochinese Communist Party was also established here in June 1946.

During the resistance against the French: The pagoda was a branch of the Military Hospital of Military Region I in Luong Ha province. In January 1947, General Vo Nguyen Giap, Comrade Do Muoi, and Doctor Ho Dac Di visited and encouraged wounded soldiers here. This place also served as a center for receiving the "Gold Week" donations, with 73 taels of gold and silver and 63 sets of bronze incense burners contributed by the people to the resistance.

Commemoration Day of the Battle of the Dead (August 18th of the Lunar Calendar): On September 19, 1948, the French colonialists launched a large-scale air raid on the temple area, killing more than 100 innocent civilians and the abbot, Venerable Dam Muoi, for harboring French cadres. Since then, the temple has held a grand memorial service on August 18th of the Lunar Calendar every year to commemorate this tragic event.
3. Scale, Layout & Architectural Art
Based on the overall site plan, the monument is located on a flat, spacious plot of land in the northwest of the village. The architecture reflects traditional standards and a serene atmosphere:
The Three-Gate Entrance: A two-story, four-roofed palace-style structure with gable ends and curved eaves carved with dragon motifs facing towards the roof. A unique and striking feature is the system of columns in the front porch, constructed by ancient people from solid blocks of square-cut blue stone, bearing a clear date of the 12th year of Minh Mạng''s reign (1831). The eaves are embossed with three large Chinese characters: "Bà Trà Tự".

The Front Hall (Bai Duong): This is a horizontal building consisting of 5 bays (the total length of the main complex is 15.72m) built in the gable-end style. The load-bearing frame is made of ironwood with a sturdy "gong-shaped beam - truncated beam" truss structure, with smooth planing and precise mortise and tenon joints. The rafters still bear a Chinese inscription recording the major renovation during the Tây Sơn dynasty: "Cảnh Thịnh sáng niên... auspicious renovation" (1793 or 1800).

The Upper Hall: The vertical structure consists of 3 bays connected to the central bay of the Front Hall, forming a T-shaped layout ($\mathbf{J}$). The main hall is solemn and majestic, with a tiered altar system built progressively higher from the outside in, serving as a place to enshrine the system of statues.

Auxiliary structures: The inner courtyard includes a row of Mother''s houses, an Ancestor''s house (a horizontal house located behind the Three Treasures), and an ancient stupa garden preserving the ancient "Hoang Ha stupa" containing the remains of the founding master from the Le-Trinh era.

4. Characteristic system of ancient artifacts, ritual objects, and statues
Ba Che Pagoda preserves an extremely valuable and rich system of round statues made of jackfruit wood and fired clay (approximately over 20 statues), including:
The system of Buddha statues in the main hall:
Layer 1 (Highest): A set of Three Buddha statues seated in the lotus position meditating on an ancient lotus pedestal, with carved heads and flowing lotus-petal robes, reflecting the sculptural style of the 19th century.
Layer 2: The Amitabha Triad statues, carved during the Le Dynasty (18th century), are short and plump, with compassionate faces, standing next to the statues of Mahasthamaprapta Bodhisattva and Avalokiteshvara Bodhisattva, wearing chrysanthemum-adorned crowns.

Layer 3: The Avatamsaka Triad, dating from the earliest period in Buddhist temples (late 17th - early 18th century), consists of a Shakyamuni Buddha holding a flower in the center, flanked by slender Manjushri and Samantabhadra Bodhisattvas, representing the pinnacle of aesthetic wood carving.

Layer 4: The gilded Avalokiteshvara Cundi statue has 11 pairs of hands (22 arms) gracefully extending to both sides in various Tantric mudras or supporting Dharma treasures; on either side are lifelike statues of Kim Dong and Ngoc Nu.

Layer 5: The Maitreya Buddha statue is carved in a natural, full-bodied seated position, with a joyful and compassionate face.

Layer 6: The Nine Dragon Altar is carved from wood with dragons spraying water to bathe the infant Shakyamuni Buddha, pointing to the sky and down to the earth. Outside, there are decorations including a pair of guardian generals riding lions, a statue of the Venerable Master, and an altar dedicated to the Goddess of Mercy (a carving depicting the story of Lady Thi Kinh with the simple appearance of a Northern Vietnamese village girl).
Other rare artifacts:
01 ancient bronze bell cast in the year Quy Ty (1953) with a finely engraved brocade seal.
01 ancient stone stele composed by General Do (title of Nhan Hau) and containing philosophical and historical records of the temple''s restoration from the Vinh Huu era.
02 blocks of ancient green stone reliefs depicting dragons and unicorns from the 15th century, along with 14 bricks from the Le-Mac period with embossed stylized flowers, mythical creatures, and dragons.', N'/uploads/images/a7a2d72840c6457cbfa54f0118ef1981.jpg', N'1403', N'xã Vân Đình', N'/api/qr/heritage/heff617cc', N'https://maps.app.goo.gl/3ddEcNYLoH31G9DV8', 0, NULL, 3, '2026-07-09T13:35:05.1690537', '2026-07-09T13:55:38.2254948');
INSERT [Heritage] ([HeritageId],[PublicId],[Code],[CategoryId],[NameVi],[NameEn],[Slug],[Classification],[Status],[AddressVi],[AddressEn],[Latitude],[Longitude],[DescriptionVi],[DescriptionEn],[HistoryVi],[HistoryEn],[ThumbnailUrl],[YearBuilt],[Guardian],[QrCodeUrl],[GoogleMapUrl],[IsDeleted],[DeletedAt],[CreatedBy],[CreatedAt],[UpdatedAt]) VALUES (2, N'h0d0c0cbc', N'VĐHN-DT-002', 2, N'CHÙA CAO LÃM (DIÊN KHÁNH TỰ)', N'CHÙA CAO LÃM (DIÊN KHÁNH TỰ)', N'chùa-cao-lãm-diên-khánh-tự', N'city', N'active', N'QP5Q+HHJ, Cao Lãm, Vân Đình, Hà Nội, Việt Nam', N'QP5Q+HHJ, Cao Lãm, Vân Đình, Hà Nội, Việt Nam', 20.75896640, 105.73630870, N'1. Thông tin hành chính & Xếp hạng pháp lý
Tên di tích thống nhất: Chùa Cao Lãm.
Tên chữ: Diên Khánh Tự.
Địa điểm phân bố: Thôn Cao Lãm, xã Cao Thành, huyện Ứng Hòa, tỉnh Hà Tây (nay thuộc thành phố Hà Nội).
Lịch sử địa giới: Trước năm 1945 có tên gọi là thôn Khả Lãm, tổng Bạch Sam, huyện Sơn Minh, phủ Ứng Thiên. Đến năm 1948 hợp nhất với 5 làng xung quanh thành liên xã Cao Sơn, rồi tách ra thành xã Cao Thành từ tháng 3 năm 1956.
Loại hình di tích: Di tích Kiến trúc - Nghệ thuật tôn giáo dạng chùa.
Cấp xếp hạng: Được Ủy ban nhân dân tỉnh Hà Tây ban hành Quyết định xếp hạng số 169/QĐ-UBND ngày 22/01/2008 công nhận là Di tích Lịch sử - Văn hóa cấp Tỉnh (Ủy ban nhân dân huyện Ứng Hòa sao y bản chính ngày 13/02/2008).', N'1. Administrative Information & Legal Ranking
Unified Monument Name: Cao Lam Pagoda.
Text Name: Dien Khanh Tu.
Location: Cao Lam Hamlet, Cao Thanh Commune, Ung Hoa District, Ha Tay Province (now part of Hanoi City).

Historical Geography: Before 1945, it was known as Kha Lam Hamlet, Bach Sam Township, Son Minh District, Ung Thien Prefecture. In 1948, it merged with 5 surrounding villages to form Cao Son commune, then separated to become Cao Thanh commune in March 1956.
Type of Monument: Religious Architectural and Artistic Monument in the form of a pagoda.
Ranking Level: Recognized as a Provincial-level Historical and Cultural Monument by Decision No. 169/QD-UBND dated January 22, 2008, issued by the People''s Committee of Ha Tay Province (Ung Hoa District People''s Committee certified the original on February 13, 2008).', N'2. Giá trị lịch sử văn hóa & Dấu ấn cách mạng
Ý nghĩa tâm linh: Chùa là nơi phụng thờ Phật và chư vị Bồ tát theo phái Đại Thừa (Bắc Tông) nhằm giải thoát cõi khổ, đề cao trí tuệ hướng thiện cho phật tử địa phương.
Dấu ấn cách mạng & Kháng chiến:
Trong những năm Tiền khởi nghĩa, cụm Đình - Miếu - Chùa Cao Lãm là nơi lực lượng cách mạng nổ súng đánh đuổi chính quyền phong kiến, cắm Quốc kỳ, lập Ủy ban hành chính lâm thời và cử Chủ tịch lâm thời.
Giai đoạn 1948 – 1950, Trung đoàn 48 thuộc Sư đoàn 320 do ông Phùng Thế Tài làm Trung đoàn trưởng đã chọn làng Cao Lãm để đóng quân chỉ huy kháng chiến.
Năm 1950, di tích bị máy bay thực dân Pháp ném bom và bắn phá dữ dội, chịu tổn thất và hư hỏng nặng. Dù vậy, nơi đây vẫn tiếp tục duy trì làm cơ sở bí mật nuôi giấu cán bộ cách mạng an toàn.
3. Quy mô kiến trúc nghệ thuật hiện trạng
Chùa Cao Lãm nằm chung không gian linh thiêng của cụm di tích Đình - Miếu tại trung tâm làng, phía trước hướng ra giếng mắt rồng và cây đa cổ thụ. Mặt bằng công trình gồm có:
Tam quan: Thiết kế nề ngõa gồm 3 lối đi (Không quan, Trung quan, Giả quan) liên kết bởi hệ thống tường bao đắp nổi hoa văn chữ "Thọ" ($\mathbf{\text{壽}}$). Hai bên cột trụ biểu lớn đắp hình búp sen, soi gờ kẻ chỉ và trang trí cốn ô lồng đèn đề tài Tứ linh. Phía trên đắp biển tên chữ chữ Hán "Diên Khánh Tự" đi kèm hình hổ phù đội lửa tam muội.
Tòa Tiền đường: Thiết kế gồm 3 gian 2 chái xây theo lối đầu hồi bít đốc tay ngai nối trụ biểu. Cấu trúc rầm đỡ mái dựa trên 5 hàng chân cột. Điểm độc đáo là hàng cột hiên phía trước được làm hoàn toàn bằng đá xanh nguyên khối, hệ cột cái bằng gỗ lim vuông đặt trên chân tảng đá. Vì kèo làm theo hai kiểu kết hợp: "Thượng chồng rường con nhị, trung kẻ, hạ tiên kẻ hậu bẩy" và "Thượng giá chiêng chồng rường nách, trung cốn chồng rường" trang trí họa tiết chạm thủng hình hoa quý và linh vật.
Tòa Thượng điện: Là nếp nhà dọc gồm 3 gian bít đốc hồi liên hoàn với Tiền đường tạo thành hình chữ Đinh ($\mathbf{J}$). Vì nóc cấu trúc kiểu giá chiêng con nhị, phía trên các xà ngang gác các cấu kiện chạm thủng đề tài Lưỡng long chầu nhật có công năng mềm mại như hệ thống y môn.
Nhà Tổ & Nhà Mẫu: Nằm quy hoạch đồng bộ ở phía sau. Đáng chú ý, hạng mục Nhà thờ Tổ được đầu tư xây mới đồng bộ từ nguồn kinh phí xã hội hóa vào tháng 8 năm 2010 với kinh phí 920.233.000 đồng.
4. Hệ thống cổ vật, tự khí và Tượng pháp
Hồ sơ kiểm kê của Ban Quản lý di tích ghi nhận chùa lưu giữ được nhiều hiện vật giá trị:
Hệ thống tượng tròn cổ: Phật điện dật cấp trang nghiêm bài trí nhiều pho tượng gỗ cổ thời Lê - Nguyễn. Thượng điện đặt bộ tượng Tam Thế Phật ngồi kiết già toàn phần trên bệ đài sen 4 lớp cánh chạm khắc cánh sen uốn lượn phong cách thời Lê, ngực lộ chữ "Vạn". Tiếp sau là tượng A Di Đà gỗ ngự tọa trên đài sen hai lớp cánh ngửa cùng tượng đứng Bồ tát Quan Thế Âm và Đại Thế Chí. Lớp dưới đặt tượng Quan Âm Chuẩn Đề sáu đôi tay mềm mại, tượng Phạm Thiên, Đế Thích, Ngọc Hoàng cầm lệnh chỉ bên cạnh tượng Nam Tào, Bắc Đẩu triều phục đi hia. Phía ngoài đặt tòa Cửu Long gỗ chạm rồng chầu vây quanh Thích Ca sơ sinh cùng hệ thống tượng võ tướng Hộ Pháp.
Hiện vật quý khác: 01 quả chuông đồng đúc năm Thiệu Trị nguyên niên (1841) bám triện gấm tinh xảo; kết hợp hệ thống 04 bức hoành phi gỗ cổ, 03 bức cửa võng sơn son thếp vàng, 03 chiếc đỉnh đồng thờ tự và hệ thống 06 chiếc bát hương cổ (trong đó có 01 bát hương dòng gốm Thổ Hà cổ quý hiếm).
5. Công tác khoanh vùng địa chính & Chỉ giới bảo vệ di tích
Căn cứ theo bản trích lục bản đồ giải thửa Tờ số 8 (Bản đồ 299) do địa chính xã thực hiện đo vẽ năm 1985, tổng diện tích cụm di tích được phân định pháp lý cho Khu vực bảo vệ I (Vùng bất khả xâm phạm) như sau:
Chỉ giới khoanh vùng đất Chùa (Thửa đất số 164E): Diện tích vùng lõi bất khả xâm phạm của riêng hạng mục Chùa Cao Lãm là 160 $m^2$.
Ranh giới tiếp giáp: Cả bốn phía Đông, Tây, Nam, Bắc của thửa đất cốt lõi 164E đều được bao bọc khép kín bởi thửa đất hành lang 164F.
Chỉ giới Khu vực bảo vệ II đất Chùa (Thửa đất số 164F): Có diện tích 1.440 $m^2$ bao quanh tiếp giáp thửa 164E.
Ranh giới tiếp giáp tổng thể khu đất chùa: Phía Đông và phía Tây giáp trục Đường thôn; Phía Nam giáp thửa đất đình 164B; Phía Bắc giáp phần đất trống còn lại của thửa 164F.
Mọi hành vi tự ý đào bới nền móng cổ, tháo dỡ các cấu kiện chạm khắc cốn mê gỗ lim hoặc di chuyển chuông cổ Thiệu Trị, bát hương gốm Thổ Hà ra khỏi hành lang khoanh vùng của các thửa đất trên đều bị pháp luật nghiêm cấm và xử lý xử phạt nghiêm khắc.', N'2. Historical and Cultural Value & Revolutionary Imprint

Spiritual Significance: The pagoda is a place of worship for Buddha and Bodhisattvas of the Mahayana (Northern School) tradition, aiming to liberate people from suffering and promote wisdom and virtuous conduct among local Buddhists.

Revolutionary Imprint & Resistance:
During the pre-revolutionary years, the Cao Lam complex of communal house, temple, and pagoda was where revolutionary forces fired upon the feudal government, planted the national flag, established a provisional administrative committee, and appointed a provisional chairman.

From 1948 to 1950, the 48th Regiment of the 320th Division, commanded by Mr. Phung The Tai, chose Cao Lam village as its base to command the resistance.

In 1950, the site was heavily bombed and shelled by French colonial aircraft, suffering significant damage. Despite this, it continued to serve as a secret base for safely sheltering revolutionary cadres.

3. Existing Architectural and Artistic Scale
Cao Lam Pagoda is located within the sacred space of the communal house and temple complex in the center of the village, facing the dragon''s eye well and an ancient banyan tree. The building''s layout includes:
The Three-Gate Entrance: Designed with three entrances (Empty Gate, Middle Gate, and False Gate) connected by a system of embossed walls with the character "Thọ" (longevity) ($\mathbf{\text{壽}}$). On both sides are large pillars sculpted with lotus bud motifs, grooved edges, and decorative brackets with lantern motifs of the Four Sacred Animals. Above is a plaque in Chinese characters "Diên Khánh Tự" accompanied by a tiger-shaped figure holding a flame of the Threefold Samadhi.
The Front Hall: Designed with three bays and two wings, built in the style of a gable with a closed gable and connected pillars. The roof support structure rests on five rows of columns. A unique feature is that the front porch columns are made entirely of solid green stone, with the main columns made of square ironwood placed on stone bases. The roof trusses are constructed in two combined styles: "Upper truss with secondary beams, middle purlins, lower purlins with front and rear purlins" and "Upper truss with supporting beams, middle purlins with supporting beams," decorated with carved and perforated motifs of precious flowers and mythical creatures.

Upper Hall: A long, continuous building consisting of three bays with gable ends, connected to the front hall to form the shape of the Chinese character ($\mathbf{J}$). The roof structure is of the secondary truss type, with perforated carved elements depicting two dragons worshipping the sun above the crossbeams, serving a soft function similar to a system of decorative panels.
Ancestral Hall & Mother Hall: Located in a planned area at the rear. Notably, the Ancestral Hall was newly constructed with socialized funding in August 2010 at a cost of 920,233,000 VND.

4. System of Ancient Artifacts, Sacred Objects, and Statues
The inventory records of the Monument Management Board indicate that the pagoda preserves many valuable artifacts:
Ancient round statue system: The solemn, tiered Buddha hall is decorated with many ancient wooden statues from the Le and Nguyen dynasties. The upper hall houses a set of Three Buddhas seated in full lotus position on a four-layered lotus pedestal with intricately carved lotus petals in the Le dynasty style, revealing the character "Wan" (萬). Following this is a wooden Amitabha Buddha seated on a two-layered lotus pedestal with upward-facing petals, along with standing statues of Bodhisattva Avalokiteshvara and Mahasthamaprapta. The lower layer houses a statue of Avalokiteshvara Cundi with six pairs of graceful hands, statues of Brahma, Indra, and the Jade Emperor holding ceremonial decrees, alongside statues of Nam Tao and Bac Dau in court attire and robes. Outside is a wooden Nine Dragons altar with dragons surrounding the infant Buddha, along with a system of statues of guardian generals.
Other valuable artifacts: 01 bronze bell cast in the first year of the Thieu Tri reign (1841) with an exquisite brocade seal; The complex includes a system of 4 ancient wooden horizontal plaques, 3 gilded and lacquered arched doorways, 3 bronze incense burners, and a system of 6 ancient incense bowls (including 1 rare and precious Tho Ha pottery incense bowl).
5. Land Demarcation and Protection Boundaries of the Monument
Based on the land plot map extract No. 8 (Map 299) surveyed by the commune''s land administration in 1985, the total area of ​​the monument complex legally defined for Protection Zone I (Inviolable Zone) is as follows:
Land boundary of the Pagoda (Plot No. 164E): The area of ​​the inviolable core zone of the Cao Lam Pagoda is 160 m².

Adjacent boundaries: All four sides (East, West, South, North) of the core plot 164E are completely enclosed by the corridor plot 164F.
The boundaries of the protected area II of the temple land (Plot No. 164F): Covers an area of ​​1,440 m² and is adjacent to plot 164E.

The overall boundaries of the temple land are: East and West bordering the village road; South bordering plot 164B; North bordering the remaining vacant land of plot 164F.

Any unauthorized excavation of ancient foundations, dismantling of carved wooden brackets or moving the ancient Thieu Tri bell or Tho Ha ceramic incense burner outside the designated corridor of the above plots is strictly prohibited and will be severely punished by law.', N'/uploads/images/b23911a7876d4bb3aa94951845935724.jpg', N'1702', N'xã Vân Đình', N'/api/qr/heritage/h0d0c0cbc', N'https://maps.app.goo.gl/HmaBmvZU9Jpfp2Sk8', 0, NULL, 3, '2026-07-09T13:49:50.2184218', '2026-07-09T13:53:31.1454899');
SET IDENTITY_INSERT [Heritage] OFF;
GO
DBCC CHECKIDENT ([Heritage], RESEED, 2);
GO

-- [HeritageDocuments]: 2 rows
SET IDENTITY_INSERT [HeritageDocuments] ON;
INSERT [HeritageDocuments] ([DocumentId],[HeritageId],[FileName],[FileUrl],[FileType],[FileSize],[UploadedAt]) VALUES (1, 1, N'lý lịch.pdf', N'/uploads/documents/0089b523886646bc984445edd6a517f4.pdf', N'PDF', 5419292, '2026-07-09T13:35:15.6084942');
INSERT [HeritageDocuments] ([DocumentId],[HeritageId],[FileName],[FileUrl],[FileType],[FileSize],[UploadedAt]) VALUES (2, 2, N'Lý lịch.pdf', N'/uploads/documents/a31c8af906e242fb94bfa3b74ca3fb3c.pdf', N'PDF', 4180811, '2026-07-09T13:53:27.9933011');
SET IDENTITY_INSERT [HeritageDocuments] OFF;
GO
DBCC CHECKIDENT ([HeritageDocuments], RESEED, 2);
GO

-- [HeritageImages]: 22 rows
SET IDENTITY_INSERT [HeritageImages] ON;
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (1, 1, N'/uploads/images/a7a2d72840c6457cbfa54f0118ef1981.jpg', NULL, 1, '2026-07-09T13:35:05.3147378');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (2, 1, N'/uploads/images/532b8cf854bf4208ab48161ce7439a60.jpg', NULL, 2, '2026-07-09T13:35:05.4034413');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (3, 1, N'/uploads/images/9478b1f012c44f4b832aa73a7200a648.jpg', NULL, 3, '2026-07-09T13:35:05.4129183');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (4, 1, N'/uploads/images/0ec38c2b4f684a3ba2b07a6b6eac2ca8.jpg', NULL, 4, '2026-07-09T13:35:05.4157413');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (5, 2, N'/uploads/images/b23911a7876d4bb3aa94951845935724.jpg', NULL, 1, '2026-07-09T13:49:50.2348519');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (6, 2, N'/uploads/images/732584ed4c3d4ec4b0fa3fde6dc92c30.jpg', NULL, 2, '2026-07-09T13:53:31.1503527');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (7, 2, N'/uploads/images/1fa47054afe447e08928f0f1259ad123.jpg', NULL, 3, '2026-07-09T13:53:31.1593221');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (8, 2, N'/uploads/images/59daa6afe0b34cdeb12c596d4e2371fc.jpg', NULL, 4, '2026-07-09T13:53:31.1622345');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (9, 2, N'/uploads/images/93ab7a827d3a469ca492753302c41567.jpg', NULL, 5, '2026-07-09T13:53:31.1651199');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (10, 2, N'/uploads/images/1e0fe5c22b3742848d0ebf91a63b78c4.jpg', NULL, 6, '2026-07-09T13:53:31.1679328');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (11, 2, N'/uploads/images/150009c4e19049b68fd6b8705252d3b2.jpg', NULL, 7, '2026-07-09T13:53:31.1704761');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (12, 2, N'/uploads/images/20fc372dd402482ab75f75fb4e0dd58f.jpg', NULL, 8, '2026-07-09T13:53:31.1729905');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (13, 2, N'/uploads/images/5fcc12725a4149a2b7e1bf95260ce5da.jpg', NULL, 9, '2026-07-09T13:53:31.1756341');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (14, 2, N'/uploads/images/14bf25e0fa334e7abfd898d72f605e98.jpg', NULL, 10, '2026-07-09T13:53:31.1783361');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (15, 2, N'/uploads/images/255e7b7917e742269b482b4872d8a1ad.jpg', NULL, 11, '2026-07-09T13:53:31.1825396');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (16, 2, N'/uploads/images/6fdf12fd28a948f786ccda068e32440d.jpg', NULL, 12, '2026-07-09T13:53:31.1855058');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (17, 2, N'/uploads/images/39ed31a8d29440ed82cbde9690869b9a.jpg', NULL, 13, '2026-07-09T13:53:31.1883239');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (18, 1, N'/uploads/images/e8ecd4b7d4a3406a92565fc92ecb9c6c.jpg', NULL, 5, '2026-07-09T13:55:38.2305037');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (19, 1, N'/uploads/images/70673df89be848cd81cf08e9c9539376.jpg', NULL, 6, '2026-07-09T13:55:38.2378783');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (20, 1, N'/uploads/images/606f700e26084a859ff3dc20d9a4c48a.jpg', NULL, 7, '2026-07-09T13:55:38.2407588');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (21, 1, N'/uploads/images/aa485bc5c78843dfa6240191985df4e6.jpg', NULL, 8, '2026-07-09T13:55:38.2435553');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (22, 1, N'/uploads/images/55343770f9324163b7fc8029d3bd48d0.jpg', NULL, 9, '2026-07-09T13:55:38.2464283');
SET IDENTITY_INSERT [HeritageImages] OFF;
GO
DBCC CHECKIDENT ([HeritageImages], RESEED, 22);
GO

-- [HeritageVideos]: 0 rows
GO

-- [IntangibleHeritage]: 0 rows
GO

-- [MediaFiles]: 20 rows
SET IDENTITY_INSERT [MediaFiles] ON;
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (1, N'/uploads/documents/0089b523886646bc984445edd6a517f4.pdf', N'lý lịch.pdf', 5419292, N'document', '2026-07-09T13:35:15.5911208');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (2, N'/uploads/images/b23911a7876d4bb3aa94951845935724.jpg', N'IMG_6046.JPG', 3008935, N'image', '2026-07-09T13:49:30.7601993');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (3, N'/uploads/images/14bf25e0fa334e7abfd898d72f605e98.jpg', N'IMG_6051.JPG', 4181229, N'image', '2026-07-09T13:50:02.7846472');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (4, N'/uploads/images/255e7b7917e742269b482b4872d8a1ad.jpg', N'IMG_6052.JPG', 3344431, N'image', '2026-07-09T13:50:10.2687591');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (5, N'/uploads/images/6fdf12fd28a948f786ccda068e32440d.jpg', N'IMG_6054.JPG', 3783522, N'image', '2026-07-09T13:50:15.1654780');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (6, N'/uploads/images/39ed31a8d29440ed82cbde9690869b9a.jpg', N'IMG_6056.JPG', 3123647, N'image', '2026-07-09T13:50:21.2172755');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (7, N'/uploads/images/5fcc12725a4149a2b7e1bf95260ce5da.jpg', N'IMG_6059.JPG', 2795221, N'image', '2026-07-09T13:50:27.4269889');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (8, N'/uploads/images/20fc372dd402482ab75f75fb4e0dd58f.jpg', N'IMG_6060.JPG', 2948857, N'image', '2026-07-09T13:50:34.9048181');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (9, N'/uploads/images/150009c4e19049b68fd6b8705252d3b2.jpg', N'IMG_6061.JPG', 2760745, N'image', '2026-07-09T13:50:41.4213197');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (10, N'/uploads/images/1e0fe5c22b3742848d0ebf91a63b78c4.jpg', N'IMG_6062.JPG', 2646157, N'image', '2026-07-09T13:50:46.4015905');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (11, N'/uploads/images/93ab7a827d3a469ca492753302c41567.jpg', N'IMG_6063.JPG', 3085677, N'image', '2026-07-09T13:50:55.9910904');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (12, N'/uploads/images/59daa6afe0b34cdeb12c596d4e2371fc.jpg', N'IMG_6068.JPG', 3614816, N'image', '2026-07-09T13:51:07.8719323');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (13, N'/uploads/images/1fa47054afe447e08928f0f1259ad123.jpg', N'IMG_6071.JPG', 3779390, N'image', '2026-07-09T13:51:13.8608504');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (14, N'/uploads/images/732584ed4c3d4ec4b0fa3fde6dc92c30.jpg', N'IMG_6069.JPG', 3227793, N'image', '2026-07-09T13:51:26.0956341');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (15, N'/uploads/documents/a31c8af906e242fb94bfa3b74ca3fb3c.pdf', N'Lý lịch.pdf', 4180811, N'document', '2026-07-09T13:53:27.9904194');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (16, N'/uploads/images/55343770f9324163b7fc8029d3bd48d0.jpg', N'IMG_5472.JPG', 4678358, N'image', '2026-07-09T13:54:28.2924610');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (17, N'/uploads/images/aa485bc5c78843dfa6240191985df4e6.jpg', N'IMG_5471.JPG', 4423317, N'image', '2026-07-09T13:54:45.3268017');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (18, N'/uploads/images/606f700e26084a859ff3dc20d9a4c48a.jpg', N'IMG_5470.JPG', 3509335, N'image', '2026-07-09T13:54:51.3634060');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (19, N'/uploads/images/70673df89be848cd81cf08e9c9539376.jpg', N'IMG_5466.JPG', 4199247, N'image', '2026-07-09T13:54:56.9481913');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (20, N'/uploads/images/e8ecd4b7d4a3406a92565fc92ecb9c6c.jpg', N'IMG_5463.JPG', 4020179, N'image', '2026-07-09T13:55:08.8070044');
SET IDENTITY_INSERT [MediaFiles] OFF;
GO
DBCC CHECKIDENT ([MediaFiles], RESEED, 20);
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

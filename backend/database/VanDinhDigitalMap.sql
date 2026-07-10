/*==========================================================
    PROJECT : VAN DINH DIGITAL HERITAGE MAP
    DATABASE: VanDinhDigitalMap
    GENERATED: 2026-07-10T10:56:46Z
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

-- [ActivityLogs]: 29 rows
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
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (15, 3, N'LOGIN', N'Users', 3, N'User logged in.', '2026-07-10T05:47:41.1455945', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (16, 3, N'CREATE', N'Heritage', 3, N'VĐHN-DT-003', '2026-07-10T06:01:23.1038260', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (17, 3, N'CREATE', N'HeritageDocuments', 3, N'heba4c83e', '2026-07-10T06:07:05.2582409', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (18, 3, N'UPDATE', N'Heritage', 3, N'VĐHN-DT-003', '2026-07-10T06:07:11.2619787', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (19, 3, N'UPDATE', N'Heritage', 3, N'VĐHN-DT-003', '2026-07-10T06:12:56.7249192', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (20, 3, N'CREATE', N'Heritage', 4, N'VĐHN-DT-004', '2026-07-10T08:39:26.9943790', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (21, 3, N'CREATE', N'HeritageDocuments', 4, N'h77221b53', '2026-07-10T08:41:01.0082373', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (22, 3, N'UPDATE', N'Heritage', 4, N'VĐHN-DT-004', '2026-07-10T08:41:10.8900961', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (23, 3, N'UPDATE', N'Heritage', 4, N'VĐHN-DT-004', '2026-07-10T08:43:42.2768987', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (24, 3, N'CREATE', N'Heritage', 5, N'VĐHN-DT-005', '2026-07-10T08:58:29.7105038', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (25, 3, N'CREATE', N'HeritageDocuments', 5, N'h8f0c9440', '2026-07-10T09:02:09.1939435', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (26, 3, N'UPDATE', N'Heritage', 5, N'VĐHN-DT-005', '2026-07-10T09:02:12.3955548', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (27, 3, N'CREATE', N'Heritage', 6, N'VĐHN-DT-006', '2026-07-10T09:09:38.8418889', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (28, 3, N'CREATE', N'HeritageDocuments', 6, N'h04c50ed4', '2026-07-10T09:11:59.8961951', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (29, 3, N'UPDATE', N'Heritage', 6, N'VĐHN-DT-006', '2026-07-10T09:12:03.6323280', NULL);
INSERT [ActivityLogs] ([LogId],[UserId],[Action],[EntityName],[EntityId],[Description],[CreatedAt],[IpAddress]) VALUES (30, 3, N'CREATE', N'Heritage', 7, N'VĐHN-DT-007', '2026-07-10T10:22:10.9280097', NULL);
SET IDENTITY_INSERT [ActivityLogs] OFF;
GO
DBCC CHECKIDENT ([ActivityLogs], RESEED, 30);
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

-- [Heritage]: 7 rows
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
INSERT [Heritage] ([HeritageId],[PublicId],[Code],[CategoryId],[NameVi],[NameEn],[Slug],[Classification],[Status],[AddressVi],[AddressEn],[Latitude],[Longitude],[DescriptionVi],[DescriptionEn],[HistoryVi],[HistoryEn],[ThumbnailUrl],[YearBuilt],[Guardian],[QrCodeUrl],[GoogleMapUrl],[IsDeleted],[DeletedAt],[CreatedBy],[CreatedAt],[UpdatedAt]) VALUES (3, N'heba4c83e', N'VĐHN-DT-003', 2, N'CHÙA ĐÔNG DƯƠNG (Thiên Phúc Tự - Vĩnh Thọ Tự)', N'CHÙA ĐÔNG DƯƠNG', N'chùa-đông-dương', N'national', N'active', N'Đông Dương, Vân Đình, Hà Nội, Việt Nam', N'Đông Dương, Vân Đình, Hà Nội, Việt Nam', 20.70736230, 105.78912930, N'1. Thông tin hành chính và Xếp hạng di tích
Tên di tích thống nhất: Chùa Đông Dương.
Tên chữ qua các thời kỳ:
Thời Lê: Thiên Phúc Tự (Chùa Thiên Phúc).
Từ sau triều vua Bảo Đại đến nay: Vĩnh Thọ Tự (Chùa Vĩnh Thọ).
Địa điểm phân bố: Thôn Đông Dương, xã Tảo Dương Văn, huyện Ứng Hòa, thành phố Hà Nội. (Trước thế kỷ XIX là xã Đông Dương, tổng Phương Đình, huyện Sơn Minh, phủ Ứng Hòa, trấn Sơn Nam).
Loại hình di tích: Kiến trúc - Nghệ thuật tôn giáo dạng chùa.
Cấp xếp hạng: Được Thứ trưởng Bộ Văn hóa Thông tin Lưu Trần Tiêu ký Quyết định số 65-QD/BT ngày 16/01/1994 chính thức công nhận và xếp hạng là Di tích Nghệ thuật cấp Quốc gia.', N'1. Administrative Information and Monument Ranking
Unified Monument Name: Dong Duong Pagoda.
Classified Names Through the Ages:
During the Le Dynasty: Thien Phuc Tu (Thien Phuc Pagoda).

From the reign of Emperor Bao Dai to the present: Vinh Tho Tu (Vinh Tho Pagoda).

Location: Dong Duong Hamlet, Tao Duong Van Commune, Ung Hoa District, Hanoi City. (Before the 19th century, it was Dong Duong Commune, Phuong Dinh Township, Son Minh District, Ung Hoa Prefecture, Son Nam Province).

Type of Monument: Religious architectural and artistic structure in the form of a pagoda.
Ranking Level: Officially recognized and ranked as a National Artistic Monument by Deputy Minister of Culture and Information Luu Tran Tieu in Decision No. 65-QD/BT dated January 16, 1994.', N'2. Lịch sử hình thành và Tín ngưỡng thờ phụng
Niên đại khởi dựng: Chùa được hưng công khởi dựng vào năm Hồng Đức nguyên niên (1470) thời vua Lê Thánh Tông. Cứ liệu lịch sử này được xác tín thông qua tấm bia đá cổ "Thiên Phúc tự bi ký" còn bảo tồn tại di tích.
Lịch sử tu sửa: Chùa có lịch sử trùng tu liên tục qua các triều đại. Văn bia cổ ghi nhận đợt tái tạo lớn vào năm Cảnh Hưng nguyên niên (1740) do Cung phi Trần Thị Ngọc hưng công. Đến thời Nguyễn, công trình tiếp tục được đại tu vào năm Thành Thái nguyên niên (1889), triều vua Khải Định (1918) và triều vua Bảo Đại để bảo lưu diện mạo khang trang, bề thế.
Ý nghĩa thờ phụng: Chùa thờ Phật theo phái Đại Thừa, hướng con người tới tư tưởng từ bi, khuyến thiện, trừng ác, giáo dục lòng nhân nghĩa và gắn kết mật thiết với đời sống tinh thần của cư dân làng xã.
Dấu ấn cách mạng: Trong thời kỳ hoạt động bí mật tiền khởi nghĩa và kháng chiến chống thực dân Pháp, chùa Đông Dương là cơ sở nuôi giấu và che chở an toàn cho nhiều cán bộ cách mạng cấp cao của Đảng và Nhà nước như các đồng chí Đỗ Mười, Hoàng Quốc Việt, Văn Tiến Dũng, Nguyễn Văn Lộc....
3. Quy mô kiến trúc hiện trạng
Căn cứ theo bản vẽ trích đo hiện trạng, quần thể chùa phân bố khoa học, khép kín trong khuôn viên phong quang:
Chùa chính (Tam bảo): Kết cấu mặt bằng dạng chữ Đinh ($\mathbf{J}$) gồm tòa Tiền đường và Thượng điện liên hoàn.
Tiền đường: Là ngôi nhà ngang gồm 5 gian phân chia cân đối, chiều dài 10,50m và rộng 1,30m. Hệ thống chịu lực dựa trên 4 bộ vì kèo chính tương ứng 4 hàng chân cột gỗ lim tròn nhẵn bóng (đường kính cột từ 38–42cm) đặt trên chân tảng đá tạc hình vuông, bát giác. Vì kèo kết cấu kiểu "Thượng chồng rường giá chiêng, hạ kẻ bẩy" và "Thượng kẻ hạ rường kẻ bẩy" vững chãi.
Thượng điện (Hậu cung): Làm dọc kiểu chuôi vồ đâm sâu vào gian giữa Tiền đường, chiều dài 6,0m và rộng 5,0m, chia làm 3 gian. Không gian được thiết kế thâm nghiêm, tĩnh mịch làm bệ dật cấp dốc về phía sau để đặt Phật điện.
Hạng mục phụ trợ: Bao gồm nếp nhà Tổ (kiêm thờ Mẫu), nhà trai, nhà ở của ni sư trụ trì nối tiếp nhau hài hòa.
4. Hệ thống cổ vật, tự khí và Tượng pháp
Chùa bảo lưu hệ thống hiện vật cổ phong phú về chủng loại và đạt giá trị thẩm mỹ điêu khắc cao:
Tượng đồng cổ quý hiếm: Pho tượng Giáo chủ Thích Ca bằng đồng tạc vào đầu thế kỷ XVI (nhân dân địa phương quen gọi là pho Tam Thế). Tượng tạc dáng thiền định thanh thoát, sọ nở u nhục kháo tinh tú, tai chảy dài, cổ ba ngấn, là tác phẩm tượng đồng cổ cực kỳ quý hiếm của địa phương.
Hệ thống tượng gỗ (16 pho thời Lê - Nguyễn):
Tại Thượng điện: Lớp cao nhất đặt bộ Tam Thế Phật ngồi thiền định. Lớp hai đặt bộ Di đà Tam tôn thời Lê thế kỷ XVII (tượng A Di Đà giữa ngực nổi chữ Vạn, tay kết ấn đặt ngửa nâng viên ngọc lưu ly kề cận tượng đứng của Quan Thế Âm và Đại Thế Chí Bồ tát đội mũ sen hoa). Lớp ba đặt tượng A Di Đà Liên Hoa kề cạnh tượng Văn Thù, Phổ Hiền. Tầng dưới đặt pho Thích Ca sơ sinh đứng trong Tòa Cửu Long gỗ chạm bong kênh tinh xảo mô phỏng rồng phun nước.
Tại Tiền đường: Hai bên bài trí ban thờ Đức Ông và ban thờ Đức Thánh Hiền, phía ngoài đặt cặp tượng Hộ Pháp (Khuyến Thiện và Trừng Ác) lớn tạc bằng đất luyện giấy dó đầu thế kỷ XX.
Tự khí cổ tiêu biểu:
01 quả chuông đồng cổ đúc năm Thiệu Trị thứ 3 (1843): Thân chuông trụ tròn bám triện gấm, ghi bài Minh chữ Hán ca ngợi Phật pháp giáo hóa chúng sinh.
01 tấm văn bia đá cổ "Thiên Phúc tự bi ký" dựng thời Lê.
01 chiếc hương án gỗ thời Nguyễn chạm bong kênh tứ linh, bốn góc tạc bốn phượng xòe cánh, chính giữa chạm rồng múa quanh vòng ngọc.
01 chiếc bát hương gốm men xanh thời Lê (cao 30cm, đường kính 35cm) vẽ đề tài Lưỡng long chầu nguyệt cổ kính.
5. Chỉ giới pháp lý và Khoanh vùng bảo vệ di tích
Căn cứ theo bản đồ địa chính trích đo xã Tảo Dương Văn vẽ năm 1988 (Tờ số 07, tỷ lệ 1/1000) và biên bản thống nhất liên ngành ngày 28/11/1993, ranh giới địa chính của di tích được phân vùng quản lý như sau:
Khu vực I (Vùng bất khả xâm phạm - Màu đỏ):
Phạm vi: Bao gồm Chùa chính (Tiền đường, Thượng điện), Miếu thờ kề cận, nhà Tổ, sân gạch bồn hoa và giếng nước nội tự.
Diện tích: 3.185 $m^2$ đặt trọn vẹn trên thửa đất số 378.
Ranh giới tiếp giáp:
Phía Đông: Tiếp giáp lối trục Đường đồng và các thửa đất số 377, 389, 388.
Phía Tây: Tiếp giáp thửa đất số 505 (thửa đất miếu giáp mương nước).
Phía Nam: Giáp các thửa đất số 374, 381, 385 và hành lang Đường làng.
Phía Bắc: Tiếp giáp thửa đất số 505 chạy gian ra phía cánh đồng.
Quy định nghiêm cấm: Nghiêm cấm tuyệt đối mọi hoạt động xây dựng, cơi nới hoặc đào bới làm thay đổi nguyên trạng cấu kiện chịu lực gỗ lim của công trình; nghiêm cấm tự ý di chuyển pho tượng đồng cổ Thích Ca thế kỷ XVI và các cổ vật, chuông sành ra khỏi chỉ giới khoanh vùng của thửa đất di tích.', N'2. History of Formation and Worship
Date of Construction: The pagoda was built in the first year of Hong Duc (1470) during the reign of King Le Thanh Tong. This historical fact is confirmed by the ancient stone stele "Thien Phuc Pagoda Inscription" still preserved at the site.

History of Renovation: The pagoda has a history of continuous renovations throughout various dynasties. Ancient stele records a major reconstruction in the first year of Canh Hung (1740) by Concubine Tran Thi Ngoc. During the Nguyen dynasty, the structure was further renovated in the first year of Thanh Thai (1889), during the reign of King Khai Dinh (1918), and during the reign of King Bao Dai to preserve its grand and imposing appearance.

Meaning of Worship: The pagoda worships Mahayana Buddhism, guiding people towards compassion, encouraging good deeds, punishing evil, educating them in righteousness, and closely connected to the spiritual life of the villagers. Revolutionary significance: During the period of clandestine activities before the uprising and the resistance against French colonialism, Dong Duong Pagoda served as a safe haven and shelter for many high-ranking revolutionary cadres of the Party and State, such as comrades Do Muoi, Hoang Quoc Viet, Van Tien Dung, Nguyen Van Loc, etc.
3. Current architectural scale
Based on the current survey drawing, the pagoda complex is scientifically distributed and enclosed within a spacious area:
Main Pagoda (Tam Bao): The floor plan is in the shape of the letter J, consisting of a connected front hall and main hall.
Front Hall: This is a horizontal building with 5 symmetrically divided bays, 10.50m long and 1.30m wide. The load-bearing system is based on 4 main truss sets corresponding to 4 rows of smooth, round lim wood columns (column diameter from 38–42cm) placed on square and octagonal carved stone bases. The roof structure is built in the "Upper beam and lower purlin" and "Upper purlin and lower beam" styles, making it sturdy.

The Upper Hall (Rear Hall): Built vertically in the shape of a mallet handle, extending deep into the central section of the Front Hall, measuring 6.0m in length and 5.0m in width, divided into three sections. The space is designed to be solemn and tranquil, with a stepped platform sloping towards the back to accommodate the Buddha statue.
Auxiliary structures: Including the Ancestral Hall (also dedicated to the Mother Goddess), the monks'' quarters, and the residence of the abbess, harmoniously connected.
4. System of ancient artifacts, ritual objects, and statues
The pagoda preserves a rich system of ancient artifacts of high sculptural aesthetic value:
Rare and precious ancient bronze statues: A bronze statue of the Buddha Shakyamuni, sculpted in the early 16th century (locally known as the Three Worlds statue). The statue depicts a serene meditative posture, with a skull that is swollen and fleshy, resembling a star, elongated ears, and a neck with three creases; it is an extremely rare ancient bronze statue of the locality.

The system of wooden statues (16 statues from the Le-Nguyen period):
In the Upper Hall: The highest layer houses the Three Buddhas seated in meditation. The second layer houses the Amitabha Triad from the 17th century Le dynasty (the Amitabha statue has a swastika symbol on its chest, its hands forming a mudra and facing upwards, holding a lapis lazuli jewel, next to the standing statues of Avalokiteshvara and Mahasthamaprapta Bodhisattvas wearing lotus flower crowns). The third layer houses the Lotus Amitabha statue next to the statues of Manjushri and Samantabhadra. The lower layer houses the infant Buddha Shakyamuni standing in an exquisitely carved wooden Nine Dragon throne depicting dragons spouting water.

In the Front Hall: On either side are altars dedicated to the Venerable Master and the Holy Sages; outside are a pair of large Guardian statues (Encouraging Goodness and Punishing Evil) carved from clay and made of dó paper in the early 20th century.
Representative artifacts:
01 ancient bronze bell cast in the 3rd year of the Thieu Tri reign (1843): The bell''s body is a round pillar with a brocade seal, inscribed with a Chinese text praising Buddhist teachings and the enlightenment of sentient beings.
01 ancient stone stele "Thien Phuc Temple Inscription" erected during the Le Dynasty.

01 wooden incense altar from the Nguyen Dynasty, carved in relief with four mythical creatures; the four corners are carved with four phoenixes spreading their wings, and the center is carved with a dragon dancing around a jade circle.

01 ancient blue glazed ceramic incense bowl from the Le Dynasty (30cm high, 35cm in diameter) depicting two dragons worshipping the moon.
5. Legal Boundaries and Protection Zones of the Monument
Based on the cadastral map of Tao Duong Van commune drawn in 1988 (Sheet No. 07, scale 1/1000) and the inter-agency agreement dated November 28, 1993, the cadastral boundaries of the monument are divided into management zones as follows:
Area I (Inviolable Zone - Red):
Scope: Includes the main temple (Front Hall, Upper Hall), adjacent shrine, ancestral house, brick courtyard with flowerbeds, and the inner well.

Area: 3,185 m² located entirely on plot No. 378.
Adjacent boundaries:
East: Adjacent to the main road and plots No. 377, 389, and 388.
West: Adjacent to plot No. 505 (the shrine plot bordering the water ditch).
South: Bordered by plots 374, 381, 385 and the village road corridor.

North: Bordered by plot 505 extending towards the field.

Strict prohibitions: Absolutely no construction, expansion, or excavation that alters the original state of the lim wood load-bearing components of the structure is permitted; unauthorized removal of the 16th-century bronze statue of Shakyamuni Buddha and other artifacts, including ceramic bells, from the boundaries of the historical site is strictly prohibited.', N'/uploads/images/8ab46954327d4f8a900f512ed8890ca3.jpg', N'1470', N'xã Vân Đình', N'/api/qr/heritage/heba4c83e', N'https://maps.app.goo.gl/wHiFR4bWhg73M5vZ7', 0, NULL, 3, '2026-07-10T06:01:22.8000117', '2026-07-10T06:12:56.6217564');
INSERT [Heritage] ([HeritageId],[PublicId],[Code],[CategoryId],[NameVi],[NameEn],[Slug],[Classification],[Status],[AddressVi],[AddressEn],[Latitude],[Longitude],[DescriptionVi],[DescriptionEn],[HistoryVi],[HistoryEn],[ThumbnailUrl],[YearBuilt],[Guardian],[QrCodeUrl],[GoogleMapUrl],[IsDeleted],[DeletedAt],[CreatedBy],[CreatedAt],[UpdatedAt]) VALUES (4, N'h77221b53', N'VĐHN-DT-004', 2, N'CHÙA DƯƠNG KHÊ (Dương Phúc Tự)', N'CHÙA DƯƠNG KHÊ', N'chùa-dương-khê', N'national', N'active', N'PQGR+7MW, Vân Đình, Hà Nội, Việt Nam', N'PQGR+7MW, Vân Đình, Hà Nội, Việt Nam', 20.72866970, 105.79020250, N'1. Thông tin chung và Địa vị Pháp lý
Tên di tích: Chùa Dương Khê.
Tên chữ: Dương Phúc Tự.
Địa điểm: Thôn Dương Khê, xã Phương Tú, huyện Ứng Hòa, tỉnh Hà Tây (nay thuộc thành phố Hà Nội). (Trước cách mạng, địa danh này là xã Dương Khê, tổng Đạo Tú, huyện Sơn Minh, phủ Ứng Hòa).
Loại hình di tích: Di tích Kiến trúc - Nghệ thuật Tôn giáo dạng chùa.
Cấp xếp hạng: Được Thứ trưởng Bộ Văn hóa Thông tin Lưu Trần Tiêu ký Quyết định số 1811/1998-QĐ-BVHTT ngày 31/08/1998 chính thức công nhận và sếp hạng là Di tích Kiến trúc - Nghệ thuật cấp Quốc gia.', N'1. General Information and Legal Status
Name of the monument: Duong Khe Pagoda.

Name in Chinese characters: Duong Phuc Tu.

Location: Duong Khe village, Phuong Tu commune, Ung Hoa district, Ha Tay province (now part of Hanoi city). (Before the revolution, this place was Duong Khe commune, Dao Tu district, Son Minh county, Ung Hoa prefecture).

Type of monument: Religious architectural and artistic monument in the form of a pagoda.

Classification level: Officially recognized and classified as a National Architectural and Artistic Monument by Deputy Minister of Culture and Information Luu Tran Tieu, Decision No. 1811/1998-QD-BVHTT dated August 31, 1998.', N'2. Lịch sử hình thành và Giá trị văn hóa
Niên đại khởi dựng: Ngôi chùa được khởi dựng từ xa xưa vào thời Lê - Mạc (thế kỷ XVI). Đến giai đoạn thời Nguyễn sớm, quần thể chùa được đại tu, tôn tạo lại với quy mô lớn, khang trang và vững chắc như diện mạo ngày nay.
Chức năng tín ngưỡng: Chùa là nơi phụng thờ Phật và chư vị Bồ tát theo phái Đại Thừa nhằm đáp ứng nhu cầu tâm linh, di dưỡng tình yêu đồng loại và tính khuyến thiện, trừ ác cho cư dân làng xã qua nhiều thế kỷ. Do có sự hưng công gom dồn từ hai ngôi chùa cổ xưa trong vùng lại, hệ thống tượng tròn và đồ thờ tự tại đây vô cùng phong phú, quý hiếm.
3. Quy mô bố cục và Khảo tả Kiến trúc
Chùa tọa lạc biệt lập trên gò đất cao mang hình dáng con rùa nằm ngoài cánh đồng phía sau làng, tạo cảnh không gian thanh tịnh, thâm nghiêm. Mặt bằng các hạng mục phân bố tuần tự gồm:
Cổng chùa (Tam quan): Kiến trúc đồ sộ xây theo lối mai cua vòm cuốn rộng 3m, cao 4m. Tầng trên xây bức cuốn thư vôi vữa ghi bài văn chữ Hán ca ngợi Phật pháp. Hai bên là cổng phụ làm kiểu mái đao cong ngói ống kết nối dãy cột đồng trụ uy nghi.
Gác chuông: Công trình liên sau cổng, mặt bằng hình chữ nhật gồm 3 gian. Gian giữa xây 2 tầng mái đao cong uốn lượn có đắp nổi Lưỡng long chầu nguyệt tôn nghiêm, bên trong treo quả chuông đồng cổ đại tự. Hai gian bên có một tầng và hàng lan can con tiện bao quanh bảo vệ.
Tòa Bái đường (Tiền đường): Ngôi nhà ngang gồm 5 gian xây bít đốc hồi, mái dốc lợp ngói ri. Hệ khung gỗ lim chắc chắn liên kết mông mác bén khít chịu lực trên bốn hàng chân cột, chân cột kê tảng đá tròn. Gian đầu hồi bên tả đặt khám thờ gỗ chạm đầu rồng và tượng Đức Ông.
Tòa Thượng điện (Hậu điện): Nằm song song với tòa Bái đường phía sau qua khoảng sân hẹp chưa đầy 1m (mặt bằng kiến trúc tổng thể tạo thành hình chữ Nhị ($\mathbf{=}$)). Thượng điện gồm 3 gian rộng rãi, vách ngăn tường hậu chia thành các ban thờ dật cấp thoải dần để bài trí phật điện khang trang.
Hạng mục phụ trợ: Phía sau và bên cạnh được quy hoạch đồng bộ dãy nhà Mẫu, nhà Tổ và khu bảo tháp mộ sư lưu giữ xá lị các vị trụ trì qua các đời.
4. Hệ thống di vật, cổ vật quý hiếm
Chùa Dương Khê lưu giữ một bộ sưu tập di vật phong phú có niên đại trải dài trải dài từ thời Lê - Mạc đến thời Nguyễn:
Hiện vật đá và đất nung cổ: 01 tấm bia đá cổ niên hiệu Vĩnh Tộ thứ V (1623) đặt tại sân chùa, trán bia chạm nổi hình rồng và sóng nước hình sin tinh xảo ghi danh các vị có công cúng ruộng đất xây chùa; và đôi chân đèn gốm cổ men rạn thời Lê - Mạc là cổ vật mỹ thuật cực kỳ quý hiếm.
Hệ thống tượng tròn (45 pho tượng gỗ sơn son thếp vàng):
Tầng 1 (Trên cùng): 3 pho Tam Thế Phật tạc thời Lê, ngồi kết định ấn trên tòa sen 3 lớp cánh đơn chạm khắc chìm nét móc xoáy cổ kính.
Tầng 2: Bộ tượng Di đà Tam tôn to lớn nhất phật điện (tượng A Di Đà giữa ngực nổi chữ Vạn, hai bên là pho tượng đứng của đức A Nan và Ca Diếp).
Tầng 3: Tượng Thích Ca Niệm Hoa thời Lê Trung Hưng tay hữu cầm bông hoa sen giơ cao ngang mặt, nếp áo dải mắc mây tinh tế.
Tầng 4: Tượng Quan Âm Thiên Thủ Thiên Nhãn (6 đôi tay cầm pháp bảo kết ấn) ngự trên bệ sen do khối tượng đầu quỷ Dạ xoa Ma xoa dùng hai tay nâng đội.
Tầng 5: Tượng Ngọc Hoàng ngồi ngai chạm rồng cầm hốt chắp trước ngực, hai bên có tượng quan văn Thổ địa chân chống và ban thờ Thánh Tăng mặc áo thắt dải phướn, ban Quan Âm tọa sơn ngự trên hòn giả sơn gỗ thế kỷ XVIII.
Phía ngoài: Cặp tượng võ tướng Hộ Pháp Khuyến Thiện và Trừng Ác lớn ngồi trên lưng mãnh sư giữ cửa. Đặc biệt tại gian bên còn bảo lưu Khám thờ và Long ngai bài vị Thành hoàng làng (Thiên Cương đại vương) thế kỷ XIX chạm khắc long mã, hổ phù tinh xảo.
Hiện vật kim loại quý: 01 quả chuông đồng lớn đúc niên hiệu Tự Đức thứ 4 (1851) gác tại lầu chuông, quai chuông hình rồng gồng mình gánh sức nặng, thân chia 8 khoang nổi núm đánh hình bông cúc.
Đồ gỗ đồ sứ khác: 04 bức cửa võng sơn son chạm thủng, 03 đôi câu đối chữ Hán khảm trai, hệ thống bát hương sành sứ vẽ lam cổ.
5. Công tác khoanh vùng và Chỉ giới bảo vệ nghiêm ngặt
Căn cứ theo bản đồ giải thửa vẽ năm 1985 (Tờ số 02, tỷ lệ 1/1000) và biên bản khoanh vùng địa chính lập ngày 17/03/1998, khu vực bảo vệ di tích được xác lập hành lang pháp lý nghiêm cấm xâm hại:
Khu vực bảo vệ I (Vùng lõi gốc - Màu đỏ): Bao gồm toàn bộ kiến trúc cổng, gác chuông, Tam bảo, bệ thờ, nhà Tổ, nhà Mẫu, tháp mộ sư và toàn bộ khu vườn nội tự. Chỉ giới khoanh vùng đất được xác định khép kín bám sát chân tường bao bảo vệ di tích hiện trạng.
Mọi hoạt động tháo dỡ cấu kiện kiến trúc gỗ cổ, lấn chiếm bồi lấp gò đất hình rùa, hoán đổi hoặc di dời 45 pho tượng pháp và các cổ vật đá, gốm thời Lê ra khỏi chỉ giới khoanh vùng đỏ của di tích đều bị pháp luật nghiêm cấm xử lý hình sự theo Luật Di sản văn hóa.', N'2. History and Cultural Value
Date of Construction: The temple was built in ancient times during the Le-Mac dynasty (16th century). During the early Nguyen dynasty, the temple complex was extensively renovated and restored on a large scale, becoming spacious and sturdy as it is today.

Religious Function: The temple is a place of worship for Buddha and Bodhisattvas of the Mahayana school, fulfilling the spiritual needs, fostering love for humanity, and promoting good deeds and the eradication of evil for the villagers over many centuries. Due to the consolidation of materials from two ancient temples in the area, the system of statues and religious artifacts here is extremely rich and rare.

3. Scale, Layout, and Architectural Description
The temple is located in isolation on a high mound shaped like a turtle in the fields behind the village, creating a serene and solemn atmosphere. The layout of the structures is arranged sequentially as follows:

Temple Gate (Tam Quan): A massive structure built in the style of a wide, arched vault, 3m wide and 4m high. The upper level features a plaster scroll inscribed with a text in Chinese characters praising Buddhism. On either side are secondary gates with curved tile roofs connecting to a row of majestic bronze pillars.

Bell Tower: Located behind the gate, the rectangular structure consists of three bays. The central bay has two levels with curved roofs and a sculpted relief of two dragons flanking the moon, symbolizing solemnity. Inside hangs an ancient bronze bell. The two side bays each have a level and a surrounding balustrade with decorative spindles for protection.

Front Hall (Bai Duong): A horizontal building with five bays, built with gable ends and a sloping tile roof. The sturdy ironwood frame is tightly connected and supports four rows of columns, each column resting on a round stone base. The left gable contains a wooden altar carved with dragon heads and a statue of the Venerable Master.
The Upper Hall (Rear Hall): Located parallel to the rear worship hall across a narrow courtyard less than 1 meter wide (the overall architectural plan forms the shape of the Chinese character ''二'' ($\mathbf{=}$)). The Upper Hall consists of 3 spacious bays, with rear walls dividing the altars into tiered, sloping sections to create a dignified Buddhist space.

Auxiliary facilities: Behind and to the side are a comprehensively planned complex of Mother''s House, Ancestor''s House, and a stupa containing the relics of abbots from various generations.

4. System of rare and valuable artifacts
Duong Khe Pagoda preserves a rich collection of artifacts dating from the Le-Mac period to the Nguyen period:
Ancient stone and terracotta artifacts: 01 ancient stone stele dated the 5th year of the Vinh To era (1623) placed in the pagoda courtyard, the top of the stele is carved with an exquisitely detailed dragon and sinusoidal wave pattern, recording the names of those who contributed land to build the pagoda; And the antique ceramic candlesticks with cracked glaze from the Le-Mac period are extremely rare and valuable art artifacts.

The system of round statues (45 gilded wooden statues):
Tier 1 (Top): 3 statues of the Three Buddhas carved during the Le Dynasty, seated in meditation on a lotus throne with three layers of single petals carved with ancient swirling patterns.

Tier 2: The largest set of Amitabha Triad statues in the temple (Amitabha Buddha statue with a Swastika symbol on the chest, flanked by standing statues of Ananda and Kasyapa).

Tier 3: Statue of Shakyamuni Buddha in meditation during the Le Trung Hung period, holding a lotus flower in his right hand raised to face level, his robe draped with delicate cloud patterns.

Tier 4: Statue of Avalokiteśvara with a Thousand Hands and a Thousand Eyes (6 pairs of hands holding sacred objects in a mudra) seated on a lotus pedestal supported by a block of demon heads (Yaksha and Mātā).

Fifth floor: A seated statue of the Jade Emperor, holding a scepter in his hand, flanked by statues of the Earth God and other civil officials, and an altar dedicated to a Buddhist monk wearing a robe with a banner. A statue of the Bodhisattva Avalokiteshvara sits atop a 18th-century wooden artificial mountain.

Outside: A pair of large statues of the Guardian Deities, the Encouraging Goodness and the Punishing Evil, seated on the backs of lions, guard the entrance. Notably, the side chamber preserves a shrine and a dragon throne with the ancestral tablet of the village''s tutelary deity (Thiên Cương Đại Vương) from the 19th century, intricately carved with dragon-horses and tiger motifs.

Precious metal artifacts: One large bronze bell cast in the 4th year of the reign of Emperor Tự Đức (1851), housed in the bell tower. The bell''s handle is shaped like a dragon struggling to bear its weight, and the body is divided into eight sections with chrysanthemum-shaped knobs.

Other wooden and porcelain items: Four ornate, openworked lacquered wooden doors, three pairs of mother-of-pearl inlaid Chinese couplets, and a system of antique blue-painted ceramic incense burners.
5. Strictly Enclosing and Defining the Protection Zone
Based on the 1985 cadastral map (Sheet No. 02, scale 1/1000) and the cadastral zoning record dated March 17, 1998, the protected area of ​​the relic site has been established with a legal framework strictly prohibiting encroachment:
Protection Zone I (Core Zone - Red): Includes all structures including the gate, bell tower, Three Treasures Hall, altar, Ancestor''s House, Mother''s House, monk''s tomb tower, and the entire inner garden area. The boundary of the land is defined as a closed zone closely following the existing protective wall of the relic site.
Any activities involving the dismantling of ancient wooden architectural components, encroachment on and filling in the turtle-shaped mound, or the exchange or relocation of 45 Buddhist statues and stone and ceramic artifacts from the Le Dynasty outside the red boundary of the relic site are strictly prohibited and subject to criminal prosecution under the Law on Cultural Heritage.', N'/uploads/images/7399aa122c7a4e12a4beca859ed87a99.jpg', N'1620', N'xã Vân Đình', N'/api/qr/heritage/h77221b53', N'https://maps.app.goo.gl/tGhR7g7tFgHRCDEH7', 0, NULL, 3, '2026-07-10T08:39:26.9346343', '2026-07-10T08:43:42.2217051');
INSERT [Heritage] ([HeritageId],[PublicId],[Code],[CategoryId],[NameVi],[NameEn],[Slug],[Classification],[Status],[AddressVi],[AddressEn],[Latitude],[Longitude],[DescriptionVi],[DescriptionEn],[HistoryVi],[HistoryEn],[ThumbnailUrl],[YearBuilt],[Guardian],[QrCodeUrl],[GoogleMapUrl],[IsDeleted],[DeletedAt],[CreatedBy],[CreatedAt],[UpdatedAt]) VALUES (5, N'h8f0c9440', N'VĐHN-DT-005', 2, N'CHÙA HẬU XÁ (THÁI BÌNH TỰ)', N'CHÙA HẬU XÁ (THÁI BÌNH TỰ)', N'chùa-hậu-xá-thái-bình-tự', N'city', N'active', N'PQGM+R7W, Hậu Xá, Vân Đình, Hà Nội, Việt Nam', N'PQGM+R7W, Hậu Xá, Vân Đình, Hà Nội, Việt Nam', 20.72722690, 105.78054630, N'1. Thông tin hành chính & Xếp hạng
Tên di tích: Chùa Hậu Xá.
Tên chữ (Tên gọi khác): Thái Bình Tự.
Địa điểm: Thôn Hậu Xá, xã Phương Tú, huyện Ứng Hòa, thành phố Hà Nội. (Thời phong kiến thuộc xã Bạch Xá, tổng Phương Đình, huyện Sơn Minh, phủ Ứng Thiên, tỉnh Hà Đông).
Loại hình di tích: Kiến trúc - Nghệ thuật dạng chùa.
Hành lang xếp hạng: Hồ sơ khoa học được thiết lập và thông qua liên ngành năm 2004. Di tích được bảo vệ nghiêm ngặt theo các quy định của Luật Di sản văn hóa.', N'1. Administrative Information & Ranking
Name of the monument: Hau Xa Pagoda.

Name in Chinese characters (Other names): Thai Binh Tu.

Location: Hau Xa village, Phuong Tu commune, Ung Hoa district, Hanoi city. (During the feudal period, it belonged to Bach Xa commune, Phuong Dinh district, Son Minh county, Ung Thien prefecture, Ha Dong province).

Type of monument: Architectural - Artistic pagoda.
Ranking framework: Scientific dossier established and approved by inter-agency in 2004. The monument is strictly protected according to the regulations of the Law on Cultural Heritage.', N'2. Giá trị lịch sử, văn hóa & Dấu ấn kháng chiến
Ý nghĩa tâm linh: Chùa thờ Phật theo phái Đại thừa. Di tích đóng vai trò là trung tâm sinh hoạt tôn giáo, tín ngưỡng truyền thống của cộng đồng làng xã Hậu Xá, hướng con người tới tư tưởng từ bi, khuyến thiện, trừng ác và tình yêu đồng loại.
Nghệ thuật điêu khắc: Phật điện lưu giữ hệ thống tượng tròn đa dạng, phong phú với các niên đại tạo tác trải dài từ thế kỷ XIX - XX. Mỗi pho tượng đều được chế tác công phu, tỉ mỉ, đạt giá trị thẩm mỹ cao và mang đặc trưng riêng cho từng nhân vật cụ thể.
Dấu ấn kháng chiến:
Thời kỳ chống Pháp: Chùa Hậu Xá là cơ sở nuôi giấu cán bộ cách mạng, bảo vệ an toàn cho các cuộc họp quan trọng của địa phương. Hiện tại, phía bên phải tòa Tiền đường vẫn còn lưu giữ nguyên vẹn dấu tích hầm bí mật.
Thời kỳ chống Mỹ: Chùa là địa điểm sơ tán của nhiều cơ quan ban ngành thuộc huyện Ứng Hòa, đồng thời là nơi tổ chức các lớp học và là trụ sở họp chi bộ thôn.
3. Khảo tả công trình kiến trúc hiện trạng Quần thể kiến trúc của di tích tương đối nguyên vẹn, được bài trí trang nhã và u tịch dưới bóng các cây cổ thụ. Hướng chùa quay về phía Tây - Nam nhìn ra giếng mắt rồng.
Cổng chùa (Tam quan): Xây dựng theo lối chồng diêm giả 8 mái với các góc đao cong ngược lên trang trí hình rồng chạy về nóc, phần giữa hai tầng mái đắp nổi 3 chữ Hán tên chữ của chùa. Lối đi cấu tạo theo kiểu cuốn vòm.
Tòa Tiền đường: Kiến trúc hình chữ Đinh ($\mathbf{J}$) liên hoàn với Thượng điện, xây hồi bít đốc gồm 5 gian 2 dĩ lợp ngói ri cổ. Hệ kết cấu khung đỡ mái chịu lực trên 5 hàng chân cột. Hàng cột hiên phía trước được làm hoàn toàn bằng đá xanh nguyên khối, hàng cột cái bằng gỗ chịu lực đặt trên các chân đá tảng. Vì kèo kết cấu kiểu "Thượng giá chiêng rường nách, hạ kẻ ngồi xà nách, bẩy" vững chãi.
Tòa Thượng điện: Nối vuông góc từ gian giữa Tiền đường chạy dọc ra phía sau, kết cấu vì kèo kiểu "Thượng kèo kẻ giá chiêng, hạ rường nách". Hệ thống bệ gạch được xây dật cấp cao dần từ ngoài vào trong để đặt Phật điện.
Các công trình phụ trợ: Phía sau và hai bên được quy hoạch đồng bộ bao gồm nhà Mẫu (kiểu nhà ngang), nhà Tổ, nhà khách và hệ thống vườn tháp mộ sư.
4. Hệ thống cổ vật, tự khí & Tượng pháp
Bộ sưu tập tượng tròn thời Nguyễn:
Tại Tiền đường: Hai bên hồi bài trí ban thờ Đức Ông (Đức chúa tạc dáng quan võ cầm bút và sách) và ban thờ Thánh Tăng, kết hợp cặp tượng Hộ Pháp Khuyến Thiện và Trừng Ác cưỡi trên linh thú oai nghiêm.
Tại Thượng điện: Tầng cao nhất tôn trí 3 pho Tam Thế Phật ngồi kiết già trên đài sen mãn khai 3 lớp cánh đơn múp dày; tầng hai đặt bộ tượng Di đà Tam tôn (tượng A Di Đà lớn nhất ở giữa, ngực nổi chữ Vạn, hai bên là Đại Thế Chí và Quan Thế Âm đứng trên bệ sen tròn 5 lớp cánh); tầng ba đặt tượng Thích Ca Niêm Hoa tay hữu cầm hoa sen giơ cao kề cận tượng thị giả Anan và Cadiếp chắp tay; tầng bốn tôn trí tượng Quan Âm Chuẩn Đề (có 12 đôi tay mềm mại kết ấn cầm pháp bảo) cùng tượng Quan Âm tọa sơn trên hòn giả sơn; tầng năm đặt tượng Phật Di Lặc bụng phệ đang mỉm cười tự tại; tầng cuối là Tòa Cửu Long điêu khắc vòm cầu gỗ chạm rồng phun nước bao quanh Thích Ca sơ sinh cùng hệ thống chư thiên nhỏ chầu quanh.
Cổ vật tự khí tiêu biểu:
01 quả chuông đồng đúc năm Minh Mệnh thứ 2 (1821): Cao 70cm, đường kính miệng 40cm, quai chuông hình rồng đấu đuôi, thân chuông bổ 8 khoang nổi hạt văn và triện gấm sắc nét.
02 bức hoành phi gỗ sơn son thếp vàng, 03 đôi câu đối chữ Hán tại Thượng điện, 01 bức cửa võng chạm lộng hoa văn Tứ quý, 03 chiếc bát hương sành gốm Thổ Hà cổ và 01 tấm văn bia đá đặt trang trọng tại Tiền đường.
5. Chỉ giới pháp lý & Khoanh vùng bảo vệ di tích Căn cứ theo bản đồ giải thửa vẽ năm 2003 (Tờ số 01, tỷ lệ 1/1000) và biên bản thống nhất liên ngành ngày 23/10/2004, địa giới địa chính di tích được hoạch định rõ ràng như sau:
Khu vực I (Vùng bất khả xâm phạm cốt lõi - Màu đỏ):
Diện tích: 1.578,9 $m^2$.
Vị trí địa chính: Nằm trọn vẹn trên thửa đất số 211.
Ranh giới tiếp giáp: Phía Đông giáp thửa đất số 532; Phía Tây giáp đường ngõ đi vào Thiên; Phía Nam giáp thửa đất số 532; Phía Bắc giáp khu dân cư hiện trạng.
Khu vực II (Vùng điều chỉnh xây dựng bảo vệ cảnh quan - Màu xanh):
Diện tích: 2.207,9 $m^2$.
Vị trí địa chính: Nằm trên thửa đất số 532.
Ranh giới tiếp giáp: Phía Đông giáp các thửa đất số 202, 221 và ngõ xóm; Phía Tây giáp đường bê tông vào thôn; Phía Nam giáp các thửa đất số 232 và 233; Phía Bắc giáp thửa đất số 211 và thửa số 533.
Một vùng diện tích đất canh tác phụ trợ rộng 2.926,3 $m^2$ kề cận tiếp giáp (Đông giáp đường vào thôn; Tây giáp đất lúa HTX; Nam giáp ao tập thể thửa 312; Bắc giáp các thửa 210, 158, 534) cũng được đưa vào hành lanh giám sát quy hoạch.
Mọi hoạt động đào bới, tháo dỡ cấu kiện gốc hoặc tự ý cơi nới xâm lấn ranh giới của các thửa đất trên đều bị nghiêm cấm theo Luật Di sản văn hóa.', N'2. Historical and Cultural Value & Remnants of the Resistance
Spiritual Significance: The pagoda is dedicated to Mahayana Buddhism. The site serves as a center for traditional religious and spiritual activities in the Hau Xa village community, guiding people towards compassion, promoting good deeds, punishing evil, and fostering love for humanity.
Sculptural Art: The Buddha Hall houses a diverse and rich collection of round statues dating from the 19th to 20th centuries. Each statue is meticulously crafted, possessing high aesthetic value and reflecting the unique characteristics of each specific figure.
Remnants of the Resistance:
During the French colonial period: Hau Xa Pagoda served as a hiding place for revolutionary cadres and provided security for important local meetings. Currently, the secret tunnel on the right side of the main hall remains intact.

During the American War: The pagoda served as an evacuation site for many government agencies in Ung Hoa district, as well as a venue for classes and a meeting place for the village Party branch. 3. Description of the existing architectural structure: The architectural complex of the monument is relatively intact, elegantly and peacefully arranged under the shade of ancient trees. The temple faces southwest, overlooking the dragon''s eye well.

Temple Gate (Tam Quan): Built in the style of a double-tiered roof with eight gables, the corners of which curve upwards, decorated with dragon figures running towards the roof. Between the two roof tiers are three Chinese characters, the temple''s name, in relief. The walkway is constructed in an arched style.

Front Hall: The architecture is in the shape of the Chinese character ($\mathbf{J}$), connected to the Upper Hall. It is a gabled structure with five bays and two aisles, covered with ancient tiles. The roof support frame is supported by five rows of columns. The columns in the front porch are made entirely of solid green stone, while the main columns are made of wood and placed on stone foundations. The truss structure is of the sturdy "Upper beam and purlin, lower supporting beam and purlin" type.

The Main Hall: Connected perpendicularly from the central bay of the Front Hall, running lengthwise to the back, the truss structure is of the "Upper truss with supporting beams, lower purlins with supporting rafters" type. The brick platform system is built in gradually increasing levels from the outside to the inside to place the Buddha Hall.

Auxiliary structures: The rear and sides are planned in a coordinated manner, including the Mother''s House (horizontal house style), the Ancestor''s House, the guest house, and a system of gardens with stupas and tombs of monks.

4. System of artifacts, religious objects & statues
Collection of round statues from the Nguyen Dynasty:
In the Front Hall: On both sides are altars dedicated to the Lord (the Lord is sculpted in the form of a military official holding a pen and book) and altars dedicated to the Holy Monks, combined with a pair of statues of the Guardian Deities Encouraging Goodness and Punishing Evil riding on majestic mythical beasts.

In the Main Hall: The highest level enshrines three statues of the Three Buddhas seated in the lotus position on a lotus pedestal with three layers of thick, plump petals; The second floor houses the Amitabha Triad (the largest Amitabha statue in the center, with a Swastika symbol on its chest; flanked by Mahasthamaprapta and Avalokiteshvara statues standing on a five-layered lotus pedestal); the third floor features a statue of Shakyamuni Buddha holding a lotus flower in his right hand, raised high, next to statues of his attendants Ananda and Kasyapa with clasped hands; the fourth floor enshrines a statue of Avalokiteshvara Bodhisattva (with 12 pairs of graceful hands forming mudras holding sacred objects) and a statue of Avalokiteshvara seated on a rockery; the fifth floor houses a statue of the chubby-bellied Maitreya Buddha smiling serenely; the final floor is the Nine Dragons Hall, a sculpted wooden archway with dragons spouting water surrounding the infant Shakyamuni Buddha, along with a system of small celestial beings surrounding him.
Representative artifacts:
01 bronze bell cast in the 2nd year of Minh Mệnh (1821): 70cm high, 40cm in diameter at the mouth, the bell handle is shaped like a dragon with its tail intertwined, the bell body is divided into 8 compartments with raised bead patterns and intricate brocade seals.
02 gilded wooden horizontal plaques, 03 pairs of Chinese couplets in the main hall, 01 ornate archway with Four Seasons motifs, 03 ancient Tho Ha ceramic incense burners and 01 stone stele placed solemnly in the front hall.
5. Legal Boundaries & Protection Zone of the Monument Based on the 2003 cadastral map (Sheet No. 01, scale 1/1000) and the inter-agency agreement dated October 23, 2004, the cadastral boundaries of the monument are clearly defined as follows:
Area I (Core Inviolable Zone - Red):
Area: 1,578.9 m².
Catalytical location: Located entirely on plot number 211.
Adjacent boundaries: East bordering plot number 532; West bordering the alley leading to Thien; South bordering plot number 532; The northern boundary adjoins the existing residential area.

Area II (Landscape Protection Construction Adjustment Zone - Green):
Area: 2,207.9 m².
Catalog location: Located on plot number 532.
Adjacent boundaries: East: borders plots number 202, 221 and the village alley; West: borders the concrete road into the village; South: borders plots number 232 and 233; North: borders plot number 211 and plot number 533.
An adjacent area of ​​2,926.3 m² of auxiliary agricultural land (East: borders the road into the village; West: borders the cooperative''s rice land; South: borders the collective pond of plot 312; North: borders plots 210, 158, and 534) is also included in the planning monitoring corridor.
All activities involving excavation, dismantling of original structures, or unauthorized expansion that encroaches on the boundaries of the land plots are strictly prohibited under the Law on Cultural Heritage.', N'/uploads/images/e300e9d46a99489abe98f69ab9435013.jpg', N'1822', N'xã Vân Đình', N'/api/qr/heritage/h8f0c9440', N'https://maps.app.goo.gl/AhMjew2aKCX5xfPD7', 0, NULL, 3, '2026-07-10T08:58:29.6621554', '2026-07-10T09:02:12.3550089');
INSERT [Heritage] ([HeritageId],[PublicId],[Code],[CategoryId],[NameVi],[NameEn],[Slug],[Classification],[Status],[AddressVi],[AddressEn],[Latitude],[Longitude],[DescriptionVi],[DescriptionEn],[HistoryVi],[HistoryEn],[ThumbnailUrl],[YearBuilt],[Guardian],[QrCodeUrl],[GoogleMapUrl],[IsDeleted],[DeletedAt],[CreatedBy],[CreatedAt],[UpdatedAt]) VALUES (6, N'h04c50ed4', N'VĐHN-DT-006', 2, N'CHÙA NGHI LỘC (Động Hoa Tự)', N'CHÙA NGHI LỘC', N'chùa-nghi-lộc', N'city', N'active', N'PPXF+J5, Nghi Lộc, Vân Đình, Hà Nội, Việt Nam', N'PPXF+J5, Nghi Lộc, Vân Đình, Hà Nội, Việt Nam', 20.74912040, 105.72029390, N'1. Thông tin hành chính và Xếp hạng
Tên di tích thống nhất: Chùa Nghi Lộc.
Tên chữ (Tên gọi khác): Động Hoa Tự.
Địa điểm phân bố: Thôn Nghi Lộc, xã Sơn Công, huyện Ứng Hòa, thành phố Hà Nội. (Thời phong kiến phong kiến, vùng đất này thuộc xã Vĩnh Lộc, tổng Sơn Lãng, huyện Sơn Minh, phủ Ứng Thiên, trấn Sơn Nam).
Loại hình di tích: Kiến trúc - Nghệ thuật tôn giáo.
Cấp xếp hạng: Được Ủy ban nhân dân tỉnh Hà Tây ban hành Quyết định số 664/1998/QĐ/UB ngày 30/06/1998 công nhận và xếp hạng là Di tích lịch sử - văn hóa cấp Tỉnh.', N'1. Administrative Information and Ranking
Unified Name of Monument: Nghi Loc Pagoda.
Text Name (Other Names): Hoa Tu Cave.

Location: Nghi Loc Hamlet, Son Cong Commune, Ung Hoa District, Hanoi City. (During the feudal period, this area belonged to Vinh Loc Commune, Son Lang Township, Son Minh District, Ung Thien Prefecture, Son Nam Province).

Type of Monument: Religious Architecture - Art.

Ranking Level: Recognized and ranked as a Provincial-level Historical and Cultural Monument by Decision No. 664/1998/QD/UB dated June 30, 1998, issued by the People''s Committee of Ha Tay Province.', N'2. Ý nghĩa lịch sử và Đặc trưng tư tưởng Thờ phụng
Tư tưởng chủ đạo: Khác biệt với phần lớn các ngôi chùa làng truyền thống thuần túy thờ Phật theo phái Bắc tông, chùa Nghi Lộc là một sản phẩm văn hóa - tôn giáo đặc sắc được xây dựng và tôn tạo theo tư tưởng "Tam giáo nhất nguyên" (Hợp nhất ba đạo: Phật giáo - Đạo giáo - Nho giáo).
Lịch sử tôn tạo: Đầu thế kỷ XX (thời vua Khải Định và Bảo Đại), do đời sống nhân dân vùng nửa chiêm trũng Sơn Công rên xiết dưới ách sưu thuế và khủng hoảng kinh tế, ngôi chùa cũ bị đổ nát. Khi dân làng hợp lực trùng tu lại chùa vào năm Bảo Đại thứ 9, các tầng lớp trí thức và bô lão địa phương đã đưa tư tưởng Tam giáo hợp nhất lồng ghép vào hệ thống kinh bổn và thần điện.
Triết lý kinh bổn: Hệ thống văn tự chữ Hán của chùa mang đậm tinh thần tự tỉnh, hướng thiện và khát vọng thái bình nông nghiệp, cầu mong quốc thái dân an, người nghèo hèn được no ấm. Đạo Phật đóng vai trò là chủ thể dung hòa, đề cao tính vô vi của Lão giáo và tính trung quân ái quốc của Nho giáo.
Giá trị kháng chiến: Trong những năm tháng kháng chiến chống Mỹ cứu nước, khuôn viên cụm Đình và Chùa Nghi Lộc kề cận được quân đội sử dụng làm kho tàng chiến lược và là địa điểm hội họp quân dân an toàn.
3. Khảo tả công trình Kiến trúc nghệ thuật
Dựa trên tài liệu trích đo bản vẽ hiện trạng, chùa Nghi Lộc tọa lạc liền kề với ngôi đình cổ của làng, nhìn theo hướng Tây - Nam:
Tòa Bái đường (Tiền đường): Ngôi nhà ngang gồm 5 gian vững chãi, chiều dài 12,60m, rộng 6,80m. Tường xây bằng gạch cổ bít đốc hồi, mái lợp ngói ta, hệ thống cột trụ biểu phía trước đắp nổi ô lồng đèn và đôi nghê chầu kiểm soát. Khung vì kèo gỗ lim xẻ vuông, bào trơn đóng bén theo kết cấu kiểu "Giá chiêng con Nhị" thời Nguyễn muộn.
Tòa Thượng điện: Nối vuông góc với gian giữa Bái đường theo kết cấu chữ Đinh ($\mathbf{J}$) thâm nghiêm gồm 3 gian dọc. Điểm đặc biệt nhất về mặt kiến trúc tại đây là cổ nhân đã xây dựng hệ thống cuốn vòm bằng gạch chịu lực để thay thế cho hệ thống xà gỗ thông thường, phía trên vẫn gác hệ rui hoành gỗ lợp ngói ta mộc mạc. Phía trên chính giữa Thượng điện treo bức hoành phi sơn mài thếp vàng chạm nổi Lưỡng long triều nguyệt đề bốn chữ lớn: "Tam giáo nhất nguyên".
4. Thần điện và Bộ sưu tập Tượng pháp "Tam giáo nhất nguyên"
Chùa bảo lưu tổng cộng 29 pho tượng tròn (trong đó có 9 pho thuộc hệ thống tư tưởng Tam giáo) được tạo tác tinh xảo bằng gỗ sơn son thếp vàng đồng bộ ở đầu thế kỷ XX:
Hàng dọc trung tâm Thượng điện:
Bậc 1 (Cao nhất): Tượng Ngọc Hoàng Đại Đế (đại diện Đạo giáo) cao 1,25m ngồi trang nghiêm trên Long ngai, đầu đội mũ bình thiên, hai tay chắp cầm hốt chỉ, khoác hoàng bào tạc nổi hoa văn long vân. Hai bên có tượng Nam Tào cầm sổ sinh tử và Bắc Đẩu điềm tĩnh.
Bậc 2: Tượng danh tướng Quan Vân Trường (đại diện Nho giáo) ngồi trên ngai oai phong, hai bên có tượng Đế Quân và Văn Xương Đế Quân.
Bậc 3: Tượng Quan Công hiển thánh mặc áo cổn mãng xà màu xanh, đầu đội mũ miện, hai bên tả hữu là bộ tượng thị giả Chu Thương và Quan Bình.
Bậc 4: Tòa Cửu Long bằng gỗ chạm trổ tinh vi, vòm cầu tạc 9 đầu rồng phun nước uốn lượn, bên trong đặt tượng Thích Ca sơ sinh một tay chỉ trời một tay chỉ đất kề cận 12 pho tượng chư phật, thiên nữ nhạc công và kim cương chầu quanh.
Bài trí ban thờ tòa Bái đường:
Bên hữu: Đặt ban thờ Thổ Địa cùng tượng Thái Thượng Lão Quân (Lão giáo) và hai vị Long Thần.
Bên tả: Đặt ban thờ Thánh Tăng cùng hai pho tượng Thiên Vương oai nghiêm giữ cửa.
5. Hệ thống di vật tự khí kiểm kê
Ngoài hệ thống tượng pháp độc đáo, di tích còn lưu giữ nhiều hiện vật cổ, cổ vật bern chắc:
Tài liệu và Đồ mộc gỗ: 05 bức hoành phi cổ sơn son đề chữ "Đông Hoa Tự", "Long Đức chính Trung"; hệ thống 03 đôi câu đối chữ Hán phẳng chạm nổi hoa dây hình học ca ngợi triết lý Thiền tông; 01 chiếc mõ gỗ lớn.
Cổ vật gốm sứ và đá quý: 01 chiếc lọ hoa gốm cổ niên đại thời Lê - Mạc (Thế kỷ XVI) cao 0,22m; kết hợp 02 bát hương bằng đồng cổ, 04 chiếc bát hương sứ vẽ lam.
Hiện vật kim loại: 01 chiếc khánh đồng tế lễ, 01 chiếc chuông đồng thời Nguyễn đúc nổi hoa văn triện gấm sắc nét, và 01 bộ tam sự bằng đồng nguyên khối đặt tại ban thờ chính.
6. Chỉ giới hành chính khoanh vùng bảo vệ di tích
Căn cứ theo bản đồ địa chính trích lục vẽ năm 1986 (Tờ số 1 và số 88, tỷ lệ 1/2000) và biên bản khoanh vùng lập ngày 28/11/1992, ranh giới địa chính cụm di tích được phân định bất khả xâm phạm:
Khu vực bảo vệ I (Vùng cốt lõi gốc - Màu đỏ):
Phạm vi: Bao gồm Chùa chính, ngôi Đình cổ, Quán Nghi Lộc liền kề cùng toàn bộ phần sân gạch nội tự và giếng chùa.
Diện tích: 2.903 $m^2$ đặt trọn vẹn trên các thửa đất số 188, 187 và thửa 63.
Ranh giới tiếp giáp: Phía Đông giáp đê Sông Đáy cổ; Phía Tây giáp thửa đất số 186; Phía Nam giáp các thửa đất số 189 và thửa 1584; Phía Bắc giáp trục Đường làng hiện hữu.
Khu vực bảo vệ II (Vùng điều chỉnh xây dựng phụ trợ - Màu xanh):
Phạm vi: Vùng bãi ao, đất thổ canh bao quanh nâng đỡ cảnh quan cho vùng lõi.
Diện tích: Đặt trên thửa đất số 181 và một phần thửa 187/1577 (Trường học cũ).
Ranh giới tiếp giáp: Phía Đông giáp Ao HTX cũ; Phía Tây giáp thửa đất số 186/7690; Phía Nam giáp thửa 194/888; Phía Bắc giáp thửa đất số 15/3215 (Sân kho).
Mọi hành vi đào bới, xâm lấn đất đai, tháo dỡ các cấu kiện gạch cuốn vòm hoặc di dời tượng pháp Tam giáo ra khỏi hành lanh chỉ giới đỏ của các thửa đất nêu trên đều bị pháp luật nghiêm cấm và xử lý theo Pháp lệnh bảo vệ di tích.', N'2. Historical Significance and Ideological Characteristics of Worship
Main Ideology: Unlike most traditional village temples purely dedicated to Northern Buddhism, Nghi Loc Pagoda is a unique cultural and religious product built and renovated according to the "Three Religions in One" ideology (unifying the three religions: Buddhism, Taoism, and Confucianism).

Renovation History: In the early 20th century (during the reigns of Emperors Khai Dinh and Bao Dai), due to the suffering of the people in the Son Cong lowland region under the yoke of taxes and economic crisis, the old pagoda fell into disrepair. When the villagers jointly rebuilt the pagoda in the 9th year of Bao Dai''s reign, the local intellectuals and elders incorporated the ideology of the unification of the Three Religions into the system of scriptures and shrines.
Philosophy of the Scriptures: The pagoda''s system of Chinese characters is imbued with a spirit of self-reflection, goodness, and a yearning for peaceful agriculture, praying for national prosperity and peace, and for the poor to be well-fed. Buddhism played a harmonizing role, emphasizing the non-action (wu-wei) of Taoism and the loyalty to the monarch and patriotism of Confucianism.

Resistance Value: During the years of resistance against the American invasion, the Nghi Loc Temple and Pagoda complex was used by the army as a strategic warehouse and a safe meeting place for the military and civilians.

3. Architectural and Artistic Description
Based on the existing survey drawings, Nghi Loc Pagoda is located adjacent to the ancient village temple, facing southwest:
The Main Hall (Front Hall): A sturdy horizontal building with 5 bays, 12.60m long and 6.80m wide. The walls are built of ancient bricks with gable ends, the roof is covered with traditional tiles, and the front pillars are decorated with embossed lantern-shaped motifs and a pair of guardian lions. The truss frame is made of square-cut, planed, and neatly fitted lim wood in the "Chieng-shaped frame" style of the late Nguyen Dynasty.

The Main Hall: Connected perpendicularly to the central section of the Prayer Hall in a solemn, three-bay structure resembling the character ''Đinh'' ($\mathbf{J}$). The most distinctive architectural feature here is the ancient construction of a load-bearing brick vault system to replace the conventional wooden beams, while the wooden rafters and purlins with traditional Vietnamese tiles still rest above. Above the center of the Main Hall hangs a gilded lacquered horizontal plaque with a relief carving of two dragons facing the moon, bearing the four large characters: "Three Religions, One Origin".

4. The Temple and the Collection of Statues of the "Three Religions in One"
The temple preserves a total of 29 round statues (including 9 belonging to the Three Religions'' philosophical system) exquisitely crafted from gilded and lacquered wood in the early 20th century:
Central Vertical Hall:
Level 1 (Highest): Statue of the Jade Emperor (representing Taoism) 1.25m tall, seated solemnly on a dragon throne, wearing a celestial crown, hands clasped holding a scepter, draped in a yellow robe with embossed dragon and cloud patterns. On either side are statues of Nam Tao holding the Book of Life and Death and Bac Dau calmly seated.

Level 2: Statue of the famous general Guan Yu (representing Confucianism) seated majestically on a throne, flanked by statues of the Emperor and Wen Chang Emperor.

Level 3: Statue of Guan Yu in his divine form, wearing a green serpent-patterned robe, a crown on his head, flanked by statues of his attendants Zhou Cang and Guan Ping.

Level 4: The Nine Dragons Pagoda, intricately carved in wood, features a vaulted arch carved with nine dragon heads spouting water in a winding pattern. Inside, a statue of the infant Buddha, one hand pointing to the sky and the other to the earth, is placed alongside twelve statues of other Buddhas, celestial maidens, musicians, and Vajra deities surrounding it.

Arrangement of the altar in the main hall:

Right side: Altar of the Earth God, along with a statue of the Supreme Venerable Lao Tzu (Taoist) and two Dragon Gods.

Left side: Altar of the Holy Monk, along with two majestic statues of Heavenly Kings guarding the entrance.

5. Inventory of artifacts and relics
In addition to the unique system of statues, the site also preserves many ancient artifacts and relics:
Documents and wooden objects: Five ancient red-painted horizontal plaques inscribed with "Dong Hoa Temple" and "Long Duc Chinh Trung"; a system of three pairs of flat, embossed Chinese couplets praising Zen philosophy; one large wooden gong.

Ceramic and Precious Stone Artifacts: 01 ancient ceramic vase dating back to the Le-Mac period (16th century), 0.22m high; combined with 02 ancient bronze incense burners, 04 blue-painted porcelain incense burners.

Metal Artifacts: 01 bronze ceremonial chime, 01 bronze bell from the Nguyen dynasty with embossed brocade patterns, and 01 set of three solid bronze ritual objects placed at the main altar.

6. Administrative Boundaries of the Protected Area
Based on the cadastral map extracted in 1986 (Pages 1 and 88, scale 1/2000) and the boundary demarcation record dated November 28, 1992, the cadastral boundary of the relic cluster is defined as inviolable:
Protection Area I (Core Area - Red):
Scope: Includes the main pagoda, the ancient communal house, the adjacent Nghi Loc shrine, along with the entire inner courtyard and the pagoda well.

Area: 2,903 m² entirely located on land parcels No. 188, 187, and 63.
Boundaries: East: bordering the ancient Day River dike; West: bordering land parcel No. 186; South: bordering land parcels No. 189 and 1584; North: bordering the existing village road.
Protection Zone II (Auxiliary Construction Adjustment Zone - Green):
Scope: The pond area and cultivated land surrounding and supporting the landscape of the core zone.
Area: Located on land parcel No. 181 and part of parcels 187/1577 (former school).
Boundaries: East: bordering the pond.', N'/uploads/images/0c0967608cd44b25ab51295f6ee42e02.jpg', N'1577', N'xã Vân Đình', N'/api/qr/heritage/h04c50ed4', N'https://maps.app.goo.gl/weAujc2ABnzpJ9r29', 0, NULL, 3, '2026-07-10T09:09:38.8022619', '2026-07-10T09:12:03.6012411');
INSERT [Heritage] ([HeritageId],[PublicId],[Code],[CategoryId],[NameVi],[NameEn],[Slug],[Classification],[Status],[AddressVi],[AddressEn],[Latitude],[Longitude],[DescriptionVi],[DescriptionEn],[HistoryVi],[HistoryEn],[ThumbnailUrl],[YearBuilt],[Guardian],[QrCodeUrl],[GoogleMapUrl],[IsDeleted],[DeletedAt],[CreatedBy],[CreatedAt],[UpdatedAt]) VALUES (7, N'hb9071290', N'VĐHN-DT-007', 2, N'CHÙA NGUYỄN XÁ ( Phổ Ứng Tự , Phả Ứng Tự)', N'CHÙA NGUYỄN XÁ', N'chùa-nguyễn-xá', N'city', N'active', N'Vân Đình, Hà Nội, Việt Nam', N'Vân Đình, Hà Nội, Việt Nam', 20.72914850, 105.79171110, N'1. Thông tin hành chính & Xếp hạng
Tên di tích thống nhất: Chùa Nguyễn Xá (nằm trong quần thể cụm di tích Đình - Chùa Nguyễn Xá).
Tên chữ: Phổ Ứng Tự hoặc Phả Ứng Tự.
Địa điểm: Thôn Nguyễn Xá, xã Phương Tú, huyện Ứng Hòa, thành phố Hà Nội. (Trước Cách mạng tháng Tám, thôn Nguyễn Xá thuộc tổng Đạo Tú, phủ Ứng Hòa, tỉnh Hà Đông).
Loại hình di tích: Kiến trúc - Nghệ thuật tôn giáo dạng đền chùa.
Cấp xếp hạng: Được UBND Thành phố Hà Nội ban hành Quyết định số 107/QĐ-UBND ngày 08/01/2019 xếp hạng là Di tích Kiến trúc - Nghệ thuật cấp Thành phố.', N'1. Administrative Information & Ranking
Unified name of the monument: Nguyen Xa Pagoda (located within the Nguyen Xa Temple-Pagoda complex).

Name in Chinese characters: Pho Ung Tu or Pha Ung Tu.

Location: Nguyen Xa village, Phuong Tu commune, Ung Hoa district, Hanoi city. (Before the August Revolution, Nguyen Xa village belonged to Dao Tu commune, Ung Hoa prefecture, Ha Dong province).

Type of monument: Religious architectural and artistic monument in the form of a temple.

Ranking level: Ranked as a City-level Architectural and Artistic Monument by Decision No. 107/QD-UBND dated January 8, 2019, issued by the Hanoi People''s Committee.', N'2. Giá trị lịch sử văn hóa & Dấu ấn cách mạng
Thần tích & Thờ phụng: Chùa thờ Phật theo phái Đại Thừa, phối hợp cùng các ban thờ Tổ (Tổ sư Bồ Đề Đạt Ma) và nhà Mẫu (Tam tòa Thánh Mẫu, Đức Thánh Trần). Thần tích ghi nhận chùa là nơi vua Đinh Tiên Hoàng từng dừng chân và ngự lại trong hành trình kinh lược dẹp loạn 12 sứ quân qua trang Nguyễn Xá.
Dấu ấn kháng chiến: Trong thời kỳ kháng chiến chống thực dân Pháp, cụm di tích là điểm di tích cách mạng quan trọng. Năm 1848, Công binh xưởng Phan Đình Phùng đã chọn địa điểm chính tại Đình và Chùa Nguyễn Xá để làm nơi sản xuất vũ khí, đúc súng phục vụ tiền tuyến. Nơi đây cũng đồng thời được trưng dụng làm kho quân nhu tối mật phục vụ kháng chiến.
3. Quy mô kiến trúc nghệ thuật hiện trạng
Căn cứ theo bản vẽ hiện trạng (bản vẽ Chùa Tảo Khê.pdf), cụm di tích nằm liền kề nhau trên một dải đất cao rộng đầu làng nhìn về hướng Nam, phía trước có hồ nước lớn tụ thủy. Chùa chính có bố cục hình chữ Đinh ($\mathbf{J}$) gồm Tiền đường và Thượng điện:
Tòa Tiền đường: Ngôi nhà ngang gồm 3 gian bít đốc tay ngai nối trụ biểu, bờ nóc đắp kiểu bờ đinh, lợp ngói mũi hài. Bộ khung làm bằng gỗ với bốn hàng chân cột tròn vững chắc, sơn son. Hiện trạng tòa Tiền đường chủ yếu dùng làm không gian chuẩn bị lễ và hành lễ phụ.
Tòa Thượng điện: Kết cấu dọc gồm 4 gian 1 dĩ nối liên hoàn với Tiền đường, khung chịu lực lim gụ sơn son, vì kèo kiểu "Thượng chồng rường, hạ kẻ ngồi" mộc mạc làm bệ đỡ nâng các tầng mái dột ngói mũi. Thượng điện xây các bệ dật cấp dốc thoải từ trên xuống để đặt phật điện.
Nhà Tổ và Nhà Mẫu: Quy hoạch khang trang phía sau tòa Thượng điện. Nhà Tổ có kết cấu ngang gồm 5 gian xây bít đốc. Nhà Mẫu kết cấu chữ Đinh với bộ vì kiểu quá giang trốn cột mộc mạc bám hiên. Bên cạnh còn có cấu trúc Tháp mộ sư bằng gạch chỉ miết mạch thắt cổ bồng tôn nghiêm.
4. Hệ thống cổ vật, tượng pháp quý hiếm
Hồ sơ kiểm kê của Ban Quản lý di tích ghi nhận chùa lưu giữ được một số lượng lớn hiện vật nghệ thuật đặc trưng, tiêu biểu bao gồm:
Cổ vật kim loại vô giá: 01 quả chuông đồng cổ đúc niên hiệu Cảnh Thịnh thứ 6 (1798) dưới triều Tây Sơn. Thân chuông hình trụ, miệng loe vẽ chấn song, quai chuông tạc đôi rồng đấu lưng gánh sức nặng, bốn núm chuông đúc nổi hình bông cúc mãn khai đặt trong ô lá đề, thân chuông khắc bài Minh chữ Hán (minh chứng ảnh chụp tại ảnh chùa Tảo khê.pdf).
Hệ thống tượng tròn thời Nguyễn (22 pho tượng):
Phật điện Thượng điện: Tầng cao nhất đặt 3 pho Tam Thế Phật ngồi thiền kết ấn tam muội sơn son thếp vàng trên bệ đài sen dầy cánh. Tiếp theo là bộ tượng Di đà Tam tôn gồm pho A Di Đà lớn ở giữa (ngực không khắc chữ Vạn) và hai trợ thủ Quan Thế Âm, Đại Thế Chí Bồ tát đứng chầu. Lớp dưới đặt pho Quan Âm Chuẩn Đề có 6 đôi tay tỏa rộng cầm pháp bảo tinh xảo, hai bên có tượng hầu Tiên Đồng và Ngọc Nữ. Phía dưới bài trí tượng Ngọc Hoàng, Thổ địa, Sơn thần và tòa Cửu Long gỗ chạm chín đầu rồng phun nước uốn lượn quanh tượng Thích Ca sơ sinh.
Tòa Tiền đường: Đặt tượng Đức Ông (Ngài Cấp Cô Độc quan văn mặt đỏ đội mũ cánh chuồn ngồi khám thờ cổ) và tượng Đức Thánh Hiền kết ấn tĩnh tại.
Nhà Tổ & Nhà Mẫu: Đặt tượng Tổ Bồ Đề Đạt Ma mặt trắng râu quai nón; tượng Tam tòa Thánh Mẫu mặc áo choàng ba màu (Thượng Thiên mặc áo vàng ở giữa, mẫu Địa, mẫu Thoải) và tượng Đức Thánh Trần mặc vương phục cầm bài vị.
Hiện vật quý khác: 01 chiếc bát hương gốm cổ Phù Lãng men da lươn thế kỷ XIX (chạm hai tai rồng); kết hợp các bức cửa võng chạm lộng tích Tứ quý hóa long, Phượng chầu, hoành phi đề chữ "Phổ Ứng tự", các bức cuốn thư gấm chữ Vạn nền đen khảm trai tinh xảo.
5. Công tác khoanh vùng địa chính & Chỉ giới bảo vệ di tích
Căn cứ theo bản đồ giải thửa và biên bản thống nhất liên ngành ngày 27/12/2016, tổng diện tích đất khoanh vùng bảo vệ của cụm di tích Đình - Chùa Nguyễn Xá là 5.317,1 $m^2$ nằm hoàn toàn trong Khu vực bảo vệ I (Vùng bất khả xâm phạm, không có Khu vực bảo vệ II):
Phân định bản đồ đất (Số bản đồ XN5-16.418 L2, tỷ lệ 1/500):
Khu 1 (Diện tích 3.718,1 $m^2$): Giới hạn bởi các điểm mốc từ 1 đến 27, 1 (Vùng lõi chứa Chùa chính, nhà Tổ, nhà Mẫu, nghi môn và sân vườn nội tự).
Khu 2 (Diện tích 1.599,0 $m^2$): Giới hạn bởi các điểm từ 28 đến 51 và các điểm nối giao nhau (Vùng chứa Đình chính và các hạng mục kề cận).
Ranh giới tiếp giáp tổng thể cụm:
Phía Đông và phía Bắc: Tiếp giáp với tường bao khu đất thổ cư của nhân dân xã Phương Tú.
Phía Tây: Tiếp giáp liền kề đất thổ cư dân sinh xã Phương Tú.
Phía Nam: Giáp hành lang an toàn trục đường nhựa liên tỉnh (Tỉnh lộ 428).
Quy định nghiêm cấm: Nghiêm cấm tuyệt đối mọi hành vi xây dựng, đào bới, cơi nới xâm hại trái phép làm biến dạng cấu kiện kiến trúc lim bê tông cổ hoặc di dời tượng pháp ra khỏi phạm vi ranh giới màu đỏ của di tích. Ban Quản lý di tích yêu cầu địa phương có phương án chấm dứt, không sử dụng tòa Tiền đường làm nơi hội họp dân chính để trả lại không gian tâm linh thuần túy cho chùa.', N'2. Historical and Cultural Value & Revolutionary Imprint
Legends & Worship: The temple worships Mahayana Buddhism, along with ancestral altars (Bodhidharma) and Mother Goddess altars (Three Holy Mothers, Saint Tran). Legend records that the temple was where King Dinh Tien Hoang once stopped and resided during his journey to quell the rebellion of the 12 warlords through Nguyen Xa village.

Imprint of the Resistance War: During the resistance war against French colonialism, the complex of relics was an important revolutionary site. In 1848, the Phan Dinh Phung Engineering Workshop chose the main location at Nguyen Xa Temple and Shrine to produce weapons and cast guns for the front lines. This place was also simultaneously used as a top-secret military supply depot for the resistance.

3. Current Architectural and Artistic Scale
Based on the current drawing (Tao Khe Temple drawing.pdf), the complex of relics is located adjacent to each other on a wide, elevated strip of land at the head of the village facing south, with a large lake in front. The main temple has a T-shaped layout ($\mathbf{J}$) consisting of the Front Hall ($\mathbf{J}$) and the Main Hall:
The Front Hall: A horizontal building with three bays, enclosed gables, and connecting pillars. The roof ridge is decorated in the style of a nail, and covered with curved tiles. The frame is made of wood with four rows of sturdy round columns, painted red. Currently, the Front Hall is mainly used as a space for preparing and conducting ceremonies.
The Main Hall: A vertical structure consisting of four bays and one side, connected to the Front Hall. The load-bearing frame is made of red-painted mahogany, with a simple "upper beam, lower rafter" truss supporting the tiled roof layers. The Main Hall has stepped platforms sloping gently from top to bottom to place the Buddha statue.
The Ancestor''s House and the Mother''s House: Spaciously planned behind the Main Hall. The Ancestor''s House has a horizontal structure with five bays, enclosed. The Mother''s House has a T-shaped structure with a simple truss system of hidden columns attached to the veranda. Next to it is the structure of the monk''s tomb tower, made of brick with a solemn, constricted neck.
4. System of rare artifacts and statues
The inventory records of the Relic Management Board show that the pagoda preserves a large number of characteristic and typical art artifacts, including:
Priceless metal artifacts: 01 ancient bronze bell cast in the 6th year of the Canh Thinh era (1798) under the Tay Son dynasty. The bell body is cylindrical, with a flared mouth decorated with railings, the bell handle is carved with two dragons fighting on their backs, bearing the weight, four bell knobs are cast in the shape of fully bloomed chrysanthemums placed in Bodhi leaf-shaped compartments, the bell body is inscribed with a Chinese inscription (evidence in the photo of Tao Khe pagoda.pdf).
System of round statues from the Nguyen dynasty (22 statues):
Upper Buddha Hall: The highest level houses 3 statues of the Three Buddhas meditating in the Samadhi mudra, painted in red and gold on a thick lotus pedestal. Next is the Amitabha Triad, consisting of a large Amitabha Buddha statue in the center (without the Swastika symbol carved on his chest) and two assistants, Avalokiteshvara and Mahasthamaprapta Bodhisattvas, standing in attendance. Below is a statue of Avalokiteshvara Cundi with six pairs of outstretched arms holding exquisitely crafted Dharma treasures, flanked by statues of celestial attendants, a young boy and a young girl. Below are statues of the Jade Emperor, the Earth God, the Mountain God, and a Nine Dragon altar carved from wood with nine dragon heads spouting water, winding around a statue of the infant Buddha.
Front Hall: Features a statue of the Venerable Master (the red-faced, dragonfly-winged scholar sitting in an ancient shrine) and a statue of the Sage making a serene mudra.
Ancestral Hall & Mother Goddess Hall: Features a statue of Bodhidharma with a white face and sideburns; statues of the Three Holy Mothers wearing three-colored robes (the Heavenly Mother in yellow in the middle, the Earth Mother, and the Water Mother); and a statue of Saint Tran in royal robes holding an ancestral tablet.
Other valuable artifacts: 01 ancient Phù Lãng ceramic incense burner with eel-skin glaze from the 19th century (carved with two dragon ears). Combining ornate archways with carvings of the Four Seasons transforming into dragons and phoenixes, horizontal plaques inscribed with the words "Phổ Ứng Temple," and exquisite mother-of-pearl inlaid brocade scrolls with the Swastika symbol on a black background.
5. Land Demarcation and Boundary Protection of the Monument
Based on the land parcel map and the inter-agency agreement dated December 27, 2016, the total area of ​​land demarcated for protection of the Nguyễn Xá Temple and Pagoda complex is 5,317.1 m², located entirely within Protection Zone I (Inviolable Zone, no Protection Zone II):
Land Map Demarcation (Map number XN5-16.418 L2, scale 1/500):
Zone 1 (Area 3,718.1 m²): Bounded by markers 1 to 27, 1 (Core zone containing the main pagoda, ancestral house, mother''s house, ceremonial gate, and inner courtyard).
Zone 2 (Area 1,599.0 m²): Bounded by points 28 to 51 and their intersections (Area containing the main temple and adjacent structures).

Overall boundary of the complex:

East and North: Adjacent to the boundary wall of the residential land of Phuong Tu commune.

West: Adjacent to the residential land of Phuong Tu commune.

South: Adjacent to the safety corridor of the inter-provincial asphalt road (Provincial Road 428).

Prohibited regulations: Absolutely no construction, excavation, or expansion that illegally damages or distorts the ancient concrete and lim wood architectural components or moves statues outside the red boundary of the monument is permitted. The Monument Management Board requests the local authorities to develop a plan to cease using the front hall as a public meeting place to restore the purely spiritual space of the temple.', N'/uploads/images/e33521c313304d3bacdd71e01c33a1d3.jpg', N'1783', N'xã Vân Đình', N'/api/qr/heritage/hb9071290', N'https://maps.app.goo.gl/WbiEZKKn4kK8dA7X7', 0, NULL, 3, '2026-07-10T10:22:10.8893110', NULL);
SET IDENTITY_INSERT [Heritage] OFF;
GO
DBCC CHECKIDENT ([Heritage], RESEED, 7);
GO

-- [HeritageDocuments]: 6 rows
SET IDENTITY_INSERT [HeritageDocuments] ON;
INSERT [HeritageDocuments] ([DocumentId],[HeritageId],[FileName],[FileUrl],[FileType],[FileSize],[UploadedAt]) VALUES (1, 1, N'lý lịch.pdf', N'/uploads/documents/0089b523886646bc984445edd6a517f4.pdf', N'PDF', 5419292, '2026-07-09T13:35:15.6084942');
INSERT [HeritageDocuments] ([DocumentId],[HeritageId],[FileName],[FileUrl],[FileType],[FileSize],[UploadedAt]) VALUES (2, 2, N'Lý lịch.pdf', N'/uploads/documents/a31c8af906e242fb94bfa3b74ca3fb3c.pdf', N'PDF', 4180811, '2026-07-09T13:53:27.9933011');
INSERT [HeritageDocuments] ([DocumentId],[HeritageId],[FileName],[FileUrl],[FileType],[FileSize],[UploadedAt]) VALUES (3, 3, N'Lý lịch di tích.pdf', N'/uploads/documents/9f3ed517916a4fcfb716a9552e992a18.pdf', N'PDF', 4862918, '2026-07-10T06:07:05.2119762');
INSERT [HeritageDocuments] ([DocumentId],[HeritageId],[FileName],[FileUrl],[FileType],[FileSize],[UploadedAt]) VALUES (4, 4, N'Hồ sơ di tích.pdf', N'/uploads/documents/5fec343d4c354f3c97ad57e30042f56d.pdf', N'PDF', 5045952, '2026-07-10T08:41:00.9999850');
INSERT [HeritageDocuments] ([DocumentId],[HeritageId],[FileName],[FileUrl],[FileType],[FileSize],[UploadedAt]) VALUES (5, 5, N'Lý lịch.pdf', N'/uploads/documents/daa4cefee62f4223ad2db0c7c6bee943.pdf', N'PDF', 6740131, '2026-07-10T09:02:09.1858937');
INSERT [HeritageDocuments] ([DocumentId],[HeritageId],[FileName],[FileUrl],[FileType],[FileSize],[UploadedAt]) VALUES (6, 6, N'Lý lịch.pdf', N'/uploads/documents/481851a09845409bb220e6554e9644ae.pdf', N'PDF', 4734778, '2026-07-10T09:11:59.8882829');
SET IDENTITY_INSERT [HeritageDocuments] OFF;
GO
DBCC CHECKIDENT ([HeritageDocuments], RESEED, 6);
GO

-- [HeritageImages]: 69 rows
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
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (23, 3, N'/uploads/images/8ab46954327d4f8a900f512ed8890ca3.jpg', NULL, 1, '2026-07-10T06:01:22.9614740');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (24, 3, N'/uploads/images/87dc37472df6451abef98e3455b419ec.jpg', NULL, 2, '2026-07-10T06:12:56.6326673');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (25, 3, N'/uploads/images/85464ce372154f90b4f26c9fea15f19e.jpg', NULL, 3, '2026-07-10T06:12:56.6567116');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (26, 3, N'/uploads/images/7c840b7cc80f40d183a94d833d0ab890.jpg', NULL, 4, '2026-07-10T06:12:56.6622015');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (27, 3, N'/uploads/images/2f3ac657cd63485fb4406ccb36c913ff.jpg', NULL, 5, '2026-07-10T06:12:56.6674739');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (28, 3, N'/uploads/images/d4edf94177c8434080468f46c72bbffa.jpg', NULL, 6, '2026-07-10T06:12:56.6702317');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (29, 3, N'/uploads/images/75a10572ae81481ab434d39bb7f5fcae.jpg', NULL, 7, '2026-07-10T06:12:56.6732978');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (30, 3, N'/uploads/images/ed0c8b0134314b50a1cd535d03a13673.jpg', NULL, 8, '2026-07-10T06:12:56.6763971');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (31, 3, N'/uploads/images/3c34b5201d0942f8ac220d66ffdb1602.jpg', NULL, 9, '2026-07-10T06:12:56.6802769');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (32, 3, N'/uploads/images/49a99e9446ee4ff9a33f72b7704e725d.jpg', NULL, 10, '2026-07-10T06:12:56.6834739');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (33, 3, N'/uploads/images/2304806dc89f422daef66168111590b8.jpg', NULL, 11, '2026-07-10T06:12:56.6883347');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (34, 3, N'/uploads/images/8eb05a001f9c4bc49826a40d2634b753.jpg', NULL, 12, '2026-07-10T06:12:56.6930117');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (35, 3, N'/uploads/images/cf5aca640a5446aa824509a87f1d2300.jpg', NULL, 13, '2026-07-10T06:12:56.6956682');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (36, 3, N'/uploads/images/1c4f05e8d84043f98a14c5b0b04eda6b.jpg', NULL, 14, '2026-07-10T06:12:56.6996272');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (37, 3, N'/uploads/images/bda366dfa92144508ecb01daa697e384.jpg', NULL, 15, '2026-07-10T06:12:56.7026494');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (38, 3, N'/uploads/images/9fa02569d08b46d2b2a05cf2a141ed0b.jpg', NULL, 16, '2026-07-10T06:12:56.7059010');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (39, 3, N'/uploads/images/0f1856104c764fce8dbc21e66392012a.jpg', NULL, 17, '2026-07-10T06:12:56.7088132');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (40, 3, N'/uploads/images/eebe69dba41f42ea8a45e3ca10ce79e7.jpg', NULL, 18, '2026-07-10T06:12:56.7117137');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (41, 3, N'/uploads/images/cd1b8a3d2f4f4f08bc5265a537d8b478.jpg', NULL, 19, '2026-07-10T06:12:56.7160043');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (42, 4, N'/uploads/images/7399aa122c7a4e12a4beca859ed87a99.jpg', NULL, 1, '2026-07-10T08:39:26.9672023');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (43, 4, N'/uploads/images/de955df7db6b4e459de878bd09c568a0.jpg', NULL, 2, '2026-07-10T08:43:42.2289662');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (44, 4, N'/uploads/images/bd61fc84434141c8b7fd5917ae9a15ae.jpg', NULL, 3, '2026-07-10T08:43:42.2435857');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (45, 4, N'/uploads/images/7d70ce95e9da45a19155475b13293394.jpg', NULL, 4, '2026-07-10T08:43:42.2490465');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (46, 4, N'/uploads/images/f19ee280f77c4482add311314efe8b66.jpg', NULL, 5, '2026-07-10T08:43:42.2518345');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (47, 4, N'/uploads/images/7ebaed9b7a6e4667b79e840463bb4bd9.jpg', NULL, 6, '2026-07-10T08:43:42.2548927');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (48, 4, N'/uploads/images/edd098c221674f338482275b16e0d7af.jpg', NULL, 7, '2026-07-10T08:43:42.2590337');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (49, 4, N'/uploads/images/9e0069adfe094a91ac722a6016c0348a.jpg', NULL, 8, '2026-07-10T08:43:42.2621286');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (50, 4, N'/uploads/images/aaac838ef4854f278041ecff3341de99.jpg', NULL, 9, '2026-07-10T08:43:42.2665556');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (51, 4, N'/uploads/images/fe91dbd26fbf46a290f9535332aea8b0.jpg', NULL, 10, '2026-07-10T08:43:42.2697623');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (52, 5, N'/uploads/images/e300e9d46a99489abe98f69ab9435013.jpg', NULL, 1, '2026-07-10T08:58:29.6778622');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (53, 5, N'/uploads/images/710184d2ece640d5a50abbe8c750ce86.jpg', NULL, 2, '2026-07-10T09:02:12.3597046');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (54, 5, N'/uploads/images/0dbadef8326b40229411016fbf4fdec2.jpg', NULL, 3, '2026-07-10T09:02:12.3662420');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (55, 5, N'/uploads/images/797bc76c5d69446bb4bb43238eac2b80.jpg', NULL, 4, '2026-07-10T09:02:12.3684871');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (56, 5, N'/uploads/images/cb75d1dcf326493188581eabfb48218a.jpg', NULL, 5, '2026-07-10T09:02:12.3722654');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (57, 5, N'/uploads/images/3d7866179a2e44d5824d5aee559b2f32.jpg', NULL, 6, '2026-07-10T09:02:12.3782357');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (58, 5, N'/uploads/images/b3bc8e44e78c42b9802cf78f0a722fb5.jpg', NULL, 7, '2026-07-10T09:02:12.3817045');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (59, 5, N'/uploads/images/019e289e919e475d852060ec8ea07feb.jpg', NULL, 8, '2026-07-10T09:02:12.3851089');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (60, 5, N'/uploads/images/9fb03d1a15774206a7b622aa45a779dd.jpg', NULL, 9, '2026-07-10T09:02:12.3874399');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (61, 5, N'/uploads/images/493bffa2070a4a55bd63515cfe07d1ed.jpg', NULL, 10, '2026-07-10T09:02:12.3903569');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (62, 6, N'/uploads/images/0c0967608cd44b25ab51295f6ee42e02.jpg', NULL, 1, '2026-07-10T09:09:38.8214398');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (63, 6, N'/uploads/images/5031e00d3ca1483285443868132ebb6d.jpg', NULL, 2, '2026-07-10T09:12:03.6065914');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (64, 6, N'/uploads/images/bb96e594471e42e7a84500be8648f06f.jpg', NULL, 3, '2026-07-10T09:12:03.6164309');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (65, 6, N'/uploads/images/b98d53d20e9443629e8aefb1c7bddbe4.jpg', NULL, 4, '2026-07-10T09:12:03.6186214');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (66, 6, N'/uploads/images/44dce9d0b20f420ea64ee71374ca408b.jpg', NULL, 5, '2026-07-10T09:12:03.6206736');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (67, 6, N'/uploads/images/31cad23b91c3457d81873fdb885f3e9d.jpg', NULL, 6, '2026-07-10T09:12:03.6239044');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (68, 6, N'/uploads/images/2196c0824eaf48048394e970efc55c92.jpg', NULL, 7, '2026-07-10T09:12:03.6265323');
INSERT [HeritageImages] ([ImageId],[HeritageId],[ImageUrl],[Caption],[SortOrder],[UploadedAt]) VALUES (69, 7, N'/uploads/images/e33521c313304d3bacdd71e01c33a1d3.jpg', NULL, 1, '2026-07-10T10:22:10.9088243');
SET IDENTITY_INSERT [HeritageImages] OFF;
GO
DBCC CHECKIDENT ([HeritageImages], RESEED, 69);
GO

-- [HeritageVideos]: 0 rows
GO

-- [IntangibleHeritage]: 0 rows
GO

-- [MediaFiles]: 75 rows
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
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (21, N'/uploads/images/a7a2d72840c6457cbfa54f0118ef1981.jpg', N'a7a2d72840c6457cbfa54f0118ef1981.jpg', 0, N'image', '2026-07-09T13:35:05.3147378');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (22, N'/uploads/images/532b8cf854bf4208ab48161ce7439a60.jpg', N'532b8cf854bf4208ab48161ce7439a60.jpg', 0, N'image', '2026-07-09T13:35:05.4034413');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (23, N'/uploads/images/9478b1f012c44f4b832aa73a7200a648.jpg', N'9478b1f012c44f4b832aa73a7200a648.jpg', 0, N'image', '2026-07-09T13:35:05.4129183');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (24, N'/uploads/images/0ec38c2b4f684a3ba2b07a6b6eac2ca8.jpg', N'0ec38c2b4f684a3ba2b07a6b6eac2ca8.jpg', 0, N'image', '2026-07-09T13:35:05.4157413');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (25, N'/uploads/images/8ab46954327d4f8a900f512ed8890ca3.jpg', N'IMG_5760.JPG', 3431870, N'image', '2026-07-10T06:01:17.0178153');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (26, N'/uploads/documents/9f3ed517916a4fcfb716a9552e992a18.pdf', N'Lý lịch di tích.pdf', 4862918, N'document', '2026-07-10T06:07:05.2083540');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (27, N'/uploads/images/9fa02569d08b46d2b2a05cf2a141ed0b.jpg', N'IMG_1056.jpg', 2659753, N'image', '2026-07-10T06:08:33.6539890');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (28, N'/uploads/images/cd1b8a3d2f4f4f08bc5265a537d8b478.jpg', N'IMG_1057.jpg', 2432005, N'image', '2026-07-10T06:09:33.1554001');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (29, N'/uploads/images/1c4f05e8d84043f98a14c5b0b04eda6b.jpg', N'IMG_1058.jpg', 3227839, N'image', '2026-07-10T06:09:41.3835158');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (30, N'/uploads/images/bda366dfa92144508ecb01daa697e384.jpg', N'IMG_1059.jpg', 2639308, N'image', '2026-07-10T06:09:50.8283505');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (31, N'/uploads/images/0f1856104c764fce8dbc21e66392012a.jpg', N'IMG_1060.jpg', 2569294, N'image', '2026-07-10T06:10:06.6213568');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (32, N'/uploads/images/eebe69dba41f42ea8a45e3ca10ce79e7.jpg', N'IMG_1062.jpg', 2779567, N'image', '2026-07-10T06:10:14.9861843');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (33, N'/uploads/images/cf5aca640a5446aa824509a87f1d2300.jpg', N'IMG_1064.jpg', 3862521, N'image', '2026-07-10T06:10:20.2634910');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (34, N'/uploads/images/8eb05a001f9c4bc49826a40d2634b753.jpg', N'IMG_1066.jpg', 3678464, N'image', '2026-07-10T06:10:35.9277533');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (35, N'/uploads/images/2304806dc89f422daef66168111590b8.jpg', N'IMG_1068.jpg', 4686127, N'image', '2026-07-10T06:10:41.1656916');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (36, N'/uploads/images/49a99e9446ee4ff9a33f72b7704e725d.jpg', N'IMG_1070.jpg', 2179333, N'image', '2026-07-10T06:10:52.5543015');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (37, N'/uploads/images/d4edf94177c8434080468f46c72bbffa.jpg', N'IMG_1072.jpg', 1708843, N'image', '2026-07-10T06:10:58.2172651');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (38, N'/uploads/images/75a10572ae81481ab434d39bb7f5fcae.jpg', N'IMG_1074.jpg', 3302879, N'image', '2026-07-10T06:11:02.2306696');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (39, N'/uploads/images/ed0c8b0134314b50a1cd535d03a13673.jpg', N'IMG_1078.jpg', 3598876, N'image', '2026-07-10T06:11:06.5282177');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (40, N'/uploads/images/3c34b5201d0942f8ac220d66ffdb1602.jpg', N'IMG_5537.JPG', 2061271, N'image', '2026-07-10T06:11:33.2687761');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (41, N'/uploads/images/2f3ac657cd63485fb4406ccb36c913ff.jpg', N'IMG_5535.JPG', 2666351, N'image', '2026-07-10T06:11:37.9670731');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (42, N'/uploads/images/7c840b7cc80f40d183a94d833d0ab890.jpg', N'IMG_5533.JPG', 2349532, N'image', '2026-07-10T06:11:42.9636775');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (43, N'/uploads/images/85464ce372154f90b4f26c9fea15f19e.jpg', N'IMG_5758.JPG', 3646372, N'image', '2026-07-10T06:11:51.0476820');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (44, N'/uploads/images/87dc37472df6451abef98e3455b419ec.jpg', N'IMG_5764.JPG', 3418356, N'image', '2026-07-10T06:11:57.3353559');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (45, N'/uploads/images/7399aa122c7a4e12a4beca859ed87a99.jpg', N'IMG_0980.JPG', 635001, N'image', '2026-07-10T08:39:22.2392376');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (46, N'/uploads/documents/5fec343d4c354f3c97ad57e30042f56d.pdf', N'Hồ sơ di tích.pdf', 5045952, N'document', '2026-07-10T08:41:00.9968158');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (47, N'/uploads/images/fe91dbd26fbf46a290f9535332aea8b0.jpg', N'IMG_0980.JPG', 635001, N'image', '2026-07-10T08:41:51.6761793');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (48, N'/uploads/images/7ebaed9b7a6e4667b79e840463bb4bd9.jpg', N'IMG_5431.JPG', 2722516, N'image', '2026-07-10T08:41:59.4907026');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (49, N'/uploads/images/edd098c221674f338482275b16e0d7af.jpg', N'IMG_5432.JPG', 2889102, N'image', '2026-07-10T08:42:05.3393450');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (50, N'/uploads/images/9e0069adfe094a91ac722a6016c0348a.jpg', N'IMG_5433.JPG', 1283417, N'image', '2026-07-10T08:42:13.9875308');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (51, N'/uploads/images/aaac838ef4854f278041ecff3341de99.jpg', N'IMG_5434.JPG', 3464256, N'image', '2026-07-10T08:42:38.8655156');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (52, N'/uploads/images/f19ee280f77c4482add311314efe8b66.jpg', N'IMG_5436.JPG', 3900491, N'image', '2026-07-10T08:42:46.3266299');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (53, N'/uploads/images/7d70ce95e9da45a19155475b13293394.jpg', N'IMG_5438.JPG', 4941233, N'image', '2026-07-10T08:42:52.8163278');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (54, N'/uploads/images/bd61fc84434141c8b7fd5917ae9a15ae.jpg', N'IMG_5630.JPG', 5125860, N'image', '2026-07-10T08:43:09.8837571');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (55, N'/uploads/images/de955df7db6b4e459de878bd09c568a0.jpg', N'IMG_5631.JPG', 4716346, N'image', '2026-07-10T08:43:14.8198488');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (58, N'/uploads/images/e300e9d46a99489abe98f69ab9435013.jpg', N'IMG_5463.JPG', 2065279, N'image', '2026-07-10T08:58:26.4757834');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (59, N'/uploads/images/493bffa2070a4a55bd63515cfe07d1ed.jpg', N'IMG_5393.JPG', 2330288, N'image', '2026-07-10T08:59:06.6614992');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (60, N'/uploads/images/3d7866179a2e44d5824d5aee559b2f32.jpg', N'IMG_5394.JPG', 1695047, N'image', '2026-07-10T08:59:10.9783580');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (61, N'/uploads/images/b3bc8e44e78c42b9802cf78f0a722fb5.jpg', N'IMG_5461.JPG', 2127939, N'image', '2026-07-10T08:59:14.9049283');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (62, N'/uploads/images/019e289e919e475d852060ec8ea07feb.jpg', N'IMG_5638.JPG', 2239838, N'image', '2026-07-10T08:59:38.4119118');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (63, N'/uploads/images/9fb03d1a15774206a7b622aa45a779dd.jpg', N'IMG_5639.JPG', 2768770, N'image', '2026-07-10T08:59:55.4977679');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (64, N'/uploads/images/cb75d1dcf326493188581eabfb48218a.jpg', N'IMG_5641.JPG', 2938179, N'image', '2026-07-10T09:00:02.9258508');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (65, N'/uploads/images/797bc76c5d69446bb4bb43238eac2b80.jpg', N'IMG_5645.JPG', 3083826, N'image', '2026-07-10T09:00:38.9784217');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (66, N'/uploads/images/0dbadef8326b40229411016fbf4fdec2.jpg', N'IMG_5646.JPG', 3553138, N'image', '2026-07-10T09:00:44.7195047');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (67, N'/uploads/images/710184d2ece640d5a50abbe8c750ce86.jpg', N'IMG_5637.JPG', 1974953, N'image', '2026-07-10T09:00:58.1131811');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (68, N'/uploads/documents/daa4cefee62f4223ad2db0c7c6bee943.pdf', N'Lý lịch.pdf', 6740131, N'document', '2026-07-10T09:02:09.1837291');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (69, N'/uploads/images/0c0967608cd44b25ab51295f6ee42e02.jpg', N'IMG_1344.JPG', 1105526, N'image', '2026-07-10T09:09:35.4307896');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (70, N'/uploads/images/2196c0824eaf48048394e970efc55c92.jpg', N'IMG_1341.JPG', 978488, N'image', '2026-07-10T09:10:52.2716537');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (71, N'/uploads/images/31cad23b91c3457d81873fdb885f3e9d.jpg', N'IMG_1352.JPG', 914660, N'image', '2026-07-10T09:10:56.5661812');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (72, N'/uploads/images/44dce9d0b20f420ea64ee71374ca408b.jpg', N'IMG_1342.JPG', 1047117, N'image', '2026-07-10T09:11:01.0761147');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (73, N'/uploads/images/bb96e594471e42e7a84500be8648f06f.jpg', N'IMG_1343.JPG', 671523, N'image', '2026-07-10T09:11:05.0016372');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (74, N'/uploads/images/5031e00d3ca1483285443868132ebb6d.jpg', N'IMG_1346.JPG', 915850, N'image', '2026-07-10T09:11:21.3423094');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (75, N'/uploads/images/b98d53d20e9443629e8aefb1c7bddbe4.jpg', N'IMG_1348.JPG', 564259, N'image', '2026-07-10T09:11:25.9774614');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (76, N'/uploads/documents/481851a09845409bb220e6554e9644ae.pdf', N'Lý lịch.pdf', 4734778, N'document', '2026-07-10T09:11:59.8850734');
INSERT [MediaFiles] ([MediaFileId],[Url],[FileName],[FileSize],[MediaType],[UploadedAt]) VALUES (77, N'/uploads/images/e33521c313304d3bacdd71e01c33a1d3.jpg', N'IMG_5439.JPG', 3160408, N'image', '2026-07-10T10:21:53.8330259');
SET IDENTITY_INSERT [MediaFiles] OFF;
GO
DBCC CHECKIDENT ([MediaFiles], RESEED, 77);
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

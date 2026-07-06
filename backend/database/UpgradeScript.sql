IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [HeritageCategories] (
    [CategoryId] int NOT NULL IDENTITY,
    [Code] nvarchar(30) NOT NULL,
    [NameVi] nvarchar(100) NOT NULL,
    [NameEn] nvarchar(100) NOT NULL,
    [IconUrl] nvarchar(255) NULL,
    CONSTRAINT [PK_HeritageCategories] PRIMARY KEY ([CategoryId])
);

CREATE TABLE [IntangibleHeritage] (
    [IntangibleId] bigint NOT NULL IDENTITY,
    [PublicId] nvarchar(20) NOT NULL,
    [NameVi] nvarchar(255) NOT NULL,
    [NameEn] nvarchar(255) NOT NULL,
    [Category] nvarchar(30) NOT NULL,
    [DescriptionVi] nvarchar(max) NULL,
    [DescriptionEn] nvarchar(max) NULL,
    [ImageUrl] nvarchar(500) NULL,
    [VideoUrl] nvarchar(500) NULL,
    [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_IntangibleHeritage] PRIMARY KEY ([IntangibleId]),
    CONSTRAINT [CK_IntangibleHeritage_Category] CHECK (Category IN ('festival', 'performance', 'craft', 'ritual', 'story'))
);

CREATE TABLE [MonthlyUpdates] (
    [UpdateId] int NOT NULL IDENTITY,
    [MonthLabel] nvarchar(20) NOT NULL,
    [DisplayVi] nvarchar(50) NOT NULL,
    [DisplayEn] nvarchar(50) NOT NULL,
    [UpdateCount] int NOT NULL DEFAULT 0,
    CONSTRAINT [PK_MonthlyUpdates] PRIMARY KEY ([UpdateId])
);

CREATE TABLE [Roles] (
    [RoleId] int NOT NULL IDENTITY,
    [RoleName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([RoleId])
);

CREATE TABLE [Users] (
    [UserId] bigint NOT NULL IDENTITY,
    [RoleId] int NOT NULL,
    [Username] nvarchar(50) NOT NULL,
    [PasswordHash] nvarchar(255) NOT NULL,
    [FullName] nvarchar(100) NULL,
    [Email] nvarchar(100) NULL,
    [Status] bit NOT NULL DEFAULT CAST(1 AS bit),
    [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]),
    CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([RoleId]) ON DELETE NO ACTION
);

CREATE TABLE [AboutPage] (
    [AboutId] int NOT NULL IDENTITY,
    [TitleVi] nvarchar(200) NOT NULL,
    [TitleEn] nvarchar(200) NOT NULL,
    [IntroductionVi] nvarchar(max) NOT NULL,
    [IntroductionEn] nvarchar(max) NOT NULL,
    [MainContentVi] nvarchar(max) NOT NULL,
    [MainContentEn] nvarchar(max) NOT NULL,
    [BannerImage] nvarchar(500) NULL,
    [ContactInfo] nvarchar(max) NULL,
    [UpdatedBy] bigint NOT NULL,
    [UpdatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_AboutPage] PRIMARY KEY ([AboutId]),
    CONSTRAINT [FK_AboutPage_Users_UpdatedBy] FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);

CREATE TABLE [ActivityLogs] (
    [LogId] bigint NOT NULL IDENTITY,
    [UserId] bigint NOT NULL,
    [Action] nvarchar(50) NOT NULL,
    [EntityName] nvarchar(100) NOT NULL,
    [EntityId] bigint NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_ActivityLogs] PRIMARY KEY ([LogId]),
    CONSTRAINT [FK_ActivityLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);

CREATE TABLE [Heritage] (
    [HeritageId] bigint NOT NULL IDENTITY,
    [PublicId] nvarchar(20) NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [CategoryId] int NOT NULL,
    [NameVi] nvarchar(255) NOT NULL,
    [NameEn] nvarchar(255) NOT NULL,
    [Slug] nvarchar(255) NOT NULL,
    [Classification] nvarchar(20) NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [AddressVi] nvarchar(500) NULL,
    [AddressEn] nvarchar(500) NULL,
    [Latitude] decimal(10,8) NULL,
    [Longitude] decimal(11,8) NULL,
    [DescriptionVi] nvarchar(max) NULL,
    [DescriptionEn] nvarchar(max) NULL,
    [HistoryVi] nvarchar(max) NULL,
    [HistoryEn] nvarchar(max) NULL,
    [ThumbnailUrl] nvarchar(500) NULL,
    [YearBuilt] nvarchar(100) NULL,
    [Guardian] nvarchar(255) NULL,
    [QrCodeUrl] nvarchar(500) NULL,
    [GoogleMapUrl] nvarchar(1000) NULL,
    [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit),
    [DeletedAt] datetime2 NULL,
    [CreatedBy] bigint NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Heritage] PRIMARY KEY ([HeritageId]),
    CONSTRAINT [CK_Heritage_Classification] CHECK (Classification IN ('national', 'city', 'unranked')),
    CONSTRAINT [CK_Heritage_Status] CHECK (Status IN ('active', 'maintenance', 'closed')),
    CONSTRAINT [FK_Heritage_HeritageCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [HeritageCategories] ([CategoryId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Heritage_Users_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);

CREATE TABLE [SystemSettings] (
    [SettingId] int NOT NULL IDENTITY,
    [WebsiteName] nvarchar(255) NULL,
    [LogoUrl] nvarchar(500) NULL,
    [FooterText] nvarchar(500) NULL,
    [ContactEmail] nvarchar(255) NULL,
    [Phone] nvarchar(50) NULL,
    [Address] nvarchar(255) NULL,
    [FacebookUrl] nvarchar(500) NULL,
    [TiktokUrl] nvarchar(500) NULL,
    [UpdatedBy] bigint NULL,
    [UpdatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_SystemSettings] PRIMARY KEY ([SettingId]),
    CONSTRAINT [FK_SystemSettings_Users_UpdatedBy] FOREIGN KEY ([UpdatedBy]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);

CREATE TABLE [HeritageDocuments] (
    [DocumentId] bigint NOT NULL IDENTITY,
    [HeritageId] bigint NOT NULL,
    [FileName] nvarchar(255) NULL,
    [FileUrl] nvarchar(500) NULL,
    [FileType] nvarchar(20) NULL,
    [FileSize] bigint NULL,
    [UploadedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_HeritageDocuments] PRIMARY KEY ([DocumentId]),
    CONSTRAINT [FK_HeritageDocuments_Heritage_HeritageId] FOREIGN KEY ([HeritageId]) REFERENCES [Heritage] ([HeritageId]) ON DELETE CASCADE
);

CREATE TABLE [HeritageImages] (
    [ImageId] bigint NOT NULL IDENTITY,
    [HeritageId] bigint NOT NULL,
    [ImageUrl] nvarchar(500) NOT NULL,
    [Caption] nvarchar(255) NULL,
    [SortOrder] int NOT NULL DEFAULT 0,
    [UploadedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_HeritageImages] PRIMARY KEY ([ImageId]),
    CONSTRAINT [FK_HeritageImages_Heritage_HeritageId] FOREIGN KEY ([HeritageId]) REFERENCES [Heritage] ([HeritageId]) ON DELETE CASCADE
);

CREATE TABLE [HeritageVideos] (
    [VideoId] bigint NOT NULL IDENTITY,
    [HeritageId] bigint NOT NULL,
    [Title] nvarchar(255) NULL,
    [VideoType] nvarchar(20) NULL,
    [VideoUrl] nvarchar(500) NULL,
    [ThumbnailUrl] nvarchar(500) NULL,
    [UploadedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_HeritageVideos] PRIMARY KEY ([VideoId]),
    CONSTRAINT [FK_HeritageVideos_Heritage_HeritageId] FOREIGN KEY ([HeritageId]) REFERENCES [Heritage] ([HeritageId]) ON DELETE CASCADE
);

CREATE INDEX [IX_AboutPage_UpdatedBy] ON [AboutPage] ([UpdatedBy]);

CREATE INDEX [IX_ActivityLogs_CreatedAt] ON [ActivityLogs] ([CreatedAt]);

CREATE INDEX [IX_ActivityLogs_EntityName] ON [ActivityLogs] ([EntityName]);

CREATE INDEX [IX_ActivityLogs_UserId] ON [ActivityLogs] ([UserId]);

CREATE INDEX [IX_Heritage_CategoryId] ON [Heritage] ([CategoryId]);

CREATE INDEX [IX_Heritage_Classification] ON [Heritage] ([Classification]);

CREATE UNIQUE INDEX [IX_Heritage_Code] ON [Heritage] ([Code]);

CREATE INDEX [IX_Heritage_CreatedBy] ON [Heritage] ([CreatedBy]);

CREATE INDEX [IX_Heritage_IsDeleted] ON [Heritage] ([IsDeleted]);

CREATE UNIQUE INDEX [IX_Heritage_PublicId] ON [Heritage] ([PublicId]);

CREATE UNIQUE INDEX [IX_Heritage_Slug] ON [Heritage] ([Slug]);

CREATE INDEX [IX_Heritage_Status] ON [Heritage] ([Status]);

CREATE UNIQUE INDEX [IX_HeritageCategories_Code] ON [HeritageCategories] ([Code]);

CREATE INDEX [IX_HeritageDocuments_HeritageId] ON [HeritageDocuments] ([HeritageId]);

CREATE INDEX [IX_HeritageImages_HeritageId] ON [HeritageImages] ([HeritageId]);

CREATE INDEX [IX_HeritageVideos_HeritageId] ON [HeritageVideos] ([HeritageId]);

CREATE INDEX [IX_IntangibleHeritage_Category] ON [IntangibleHeritage] ([Category]);

CREATE UNIQUE INDEX [IX_IntangibleHeritage_PublicId] ON [IntangibleHeritage] ([PublicId]);

CREATE UNIQUE INDEX [IX_Roles_RoleName] ON [Roles] ([RoleName]);

CREATE INDEX [IX_SystemSettings_UpdatedBy] ON [SystemSettings] ([UpdatedBy]);

CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);

CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260701052754_InitialCreate', N'10.0.9');

COMMIT;
GO

BEGIN TRANSACTION;

ALTER TABLE [IntangibleHeritage] ADD [CreatedBy] bigint NOT NULL DEFAULT 1;
ALTER TABLE [IntangibleHeritage] ADD [UpdatedBy] bigint NULL;

CREATE INDEX [IX_IntangibleHeritage_CreatedBy] ON [IntangibleHeritage] ([CreatedBy]);
CREATE INDEX [IX_IntangibleHeritage_UpdatedBy] ON [IntangibleHeritage] ([UpdatedBy]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260703000000_AddAuditFieldsToIntangibleHeritage', N'10.0.9');

COMMIT;
GO


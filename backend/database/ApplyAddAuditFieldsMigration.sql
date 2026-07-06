-- Apply the missing AddAuditFieldsToIntangibleHeritage migration
-- Run this against the VanDinhDigitalMap database

BEGIN TRANSACTION;

ALTER TABLE [IntangibleHeritage] ADD [CreatedBy] bigint NOT NULL DEFAULT 1;
ALTER TABLE [IntangibleHeritage] ADD [UpdatedBy] bigint NULL;

CREATE INDEX [IX_IntangibleHeritage_CreatedBy] ON [IntangibleHeritage] ([CreatedBy]);
CREATE INDEX [IX_IntangibleHeritage_UpdatedBy] ON [IntangibleHeritage] ([UpdatedBy]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260703000000_AddAuditFieldsToIntangibleHeritage', N'10.0.9');

COMMIT;
GO

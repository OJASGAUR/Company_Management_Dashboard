-- Tester-feedback schema migration.
-- This migration is intentionally idempotent because the deployed college-project database
-- may have been created with `prisma db push` before migration history was introduced.
-- The deployment runner should use `prisma db push` for this legacy database; this SQL
-- remains available for environments that already use Prisma migration history.

CREATE TABLE IF NOT EXISTS "UserPermission" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "permission" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserPermission_userId_permission_key" ON "UserPermission"("userId", "permission");
CREATE INDEX IF NOT EXISTS "UserPermission_permission_enabled_idx" ON "UserPermission"("permission", "enabled");

ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "attachmentName" TEXT;

CREATE TABLE IF NOT EXISTS "MessageGroup" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MessageGroup_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MessageGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "MessageGroup_createdById_idx" ON "MessageGroup"("createdById");

CREATE TABLE IF NOT EXISTS "MessageGroupMember" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MessageGroupMember_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MessageGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MessageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MessageGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "MessageGroupMember_groupId_userId_key" ON "MessageGroupMember"("groupId", "userId");
CREATE INDEX IF NOT EXISTS "MessageGroupMember_userId_idx" ON "MessageGroupMember"("userId");
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
DO $$ BEGIN
  ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MessageGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "Message_groupId_timestamp_idx" ON "Message"("groupId", "timestamp");

ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 18;
DO $$ BEGIN
  ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL,
  "paidAt" TIMESTAMP(3),
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Payment_invoiceId_paidAt_idx" ON "Payment"("invoiceId", "paidAt");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");

ALTER TABLE "Domain" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS "Domain_url_idx" ON "Domain"("url");
CREATE INDEX IF NOT EXISTS "Domain_status_idx" ON "Domain"("status");
CREATE INDEX IF NOT EXISTS "FileRecord_fileName_idx" ON "FileRecord"("fileName");
CREATE INDEX IF NOT EXISTS "Project_name_idx" ON "Project"("name");
CREATE INDEX IF NOT EXISTS "Project_clientName_idx" ON "Project"("clientName");
CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");
CREATE INDEX IF NOT EXISTS "Task_title_idx" ON "Task"("title");
CREATE INDEX IF NOT EXISTS "Task_priority_idx" ON "Task"("priority");
CREATE INDEX IF NOT EXISTS "User_dateOfBirth_idx" ON "User"("dateOfBirth");
CREATE INDEX IF NOT EXISTS "User_joiningDate_idx" ON "User"("joiningDate");

ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "dedupeKey" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Notification_dedupeKey_key" ON "Notification"("dedupeKey");

CREATE TABLE IF NOT EXISTS "OfferLetterTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OfferLetterTemplate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OfferLetterTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "OfferLetterTemplate_isActive_idx" ON "OfferLetterTemplate"("isActive");

CREATE TABLE IF NOT EXISTS "BackupSnapshot" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "format" TEXT NOT NULL DEFAULT 'JSON',
  "data" JSONB NOT NULL,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BackupSnapshot_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BackupSnapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "BackupSnapshot_period_key" ON "BackupSnapshot"("period");
CREATE INDEX IF NOT EXISTS "BackupSnapshot_createdAt_idx" ON "BackupSnapshot"("createdAt");

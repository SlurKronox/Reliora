/*
  # Add Production Features (Credits, GA4, Public Links, Branding, Billing)
  
  Tables use TEXT ids with CUID, so we cast auth.uid() to TEXT in policies
*/

-- Add new columns to Workspace table
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "brandPrimary" TEXT;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "brandAccent" TEXT;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "brandLogoUrl" TEXT;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "creditLimit" INTEGER DEFAULT 1000;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "creditUsed" INTEGER DEFAULT 0;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "creditPeriodStart" TIMESTAMPTZ DEFAULT now();
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "plan" TEXT;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;

-- Update existing rows to have default values
UPDATE "Workspace" SET "creditLimit" = 1000 WHERE "creditLimit" IS NULL;
UPDATE "Workspace" SET "creditUsed" = 0 WHERE "creditUsed" IS NULL;
UPDATE "Workspace" SET "creditPeriodStart" = now() WHERE "creditPeriodStart" IS NULL;

-- Add NOT NULL constraints after setting defaults
ALTER TABLE "Workspace" ALTER COLUMN "creditLimit" SET NOT NULL;
ALTER TABLE "Workspace" ALTER COLUMN "creditUsed" SET NOT NULL;
ALTER TABLE "Workspace" ALTER COLUMN "creditPeriodStart" SET NOT NULL;

-- Add new columns to Report table
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "aiModel" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "costCredits" INTEGER;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "useRealData" BOOLEAN DEFAULT false;

UPDATE "Report" SET "useRealData" = false WHERE "useRealData" IS NULL;
ALTER TABLE "Report" ALTER COLUMN "useRealData" SET NOT NULL;

-- Add new columns to Client table
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "ga4PropertyId" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "ga4PropertyDisplay" TEXT;

-- Create GoogleConnection table
CREATE TABLE IF NOT EXISTS "GoogleConnection" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "workspaceId" TEXT NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE("workspaceId")
);

-- Create Ga4ReportCache table
CREATE TABLE IF NOT EXISTS "Ga4ReportCache" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "workspaceId" TEXT NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "clientId" TEXT NOT NULL REFERENCES "Client"(id) ON DELETE CASCADE,
  "ga4PropertyId" TEXT NOT NULL,
  "periodStart" DATE NOT NULL,
  "periodEnd" DATE NOT NULL,
  "payloadJson" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE("workspaceId", "clientId", "ga4PropertyId", "periodStart", "periodEnd")
);

-- Create PublicReport table
CREATE TABLE IF NOT EXISTS "PublicReport" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "reportId" TEXT NOT NULL REFERENCES "Report"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  UNIQUE("reportId")
);

-- Create CreditLedger table
CREATE TABLE IF NOT EXISTS "CreditLedger" (
  id TEXT PRIMARY KEY DEFAULT generate_cuid(),
  "workspaceId" TEXT NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "reportId" TEXT REFERENCES "Report"(id) ON DELETE SET NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE "GoogleConnection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ga4ReportCache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PublicReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditLedger" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own workspace Google connection" ON "GoogleConnection";
DROP POLICY IF EXISTS "Users can manage own workspace Google connection" ON "GoogleConnection";
DROP POLICY IF EXISTS "Users can view own workspace GA4 cache" ON "Ga4ReportCache";
DROP POLICY IF EXISTS "Users can manage own workspace GA4 cache" ON "Ga4ReportCache";
DROP POLICY IF EXISTS "Anyone can view non-revoked public reports" ON "PublicReport";
DROP POLICY IF EXISTS "Users can manage own workspace public reports" ON "PublicReport";
DROP POLICY IF EXISTS "Users can view own workspace credit ledger" ON "CreditLedger";

-- RLS Policies for GoogleConnection
CREATE POLICY "Users can view own workspace Google connection"
  ON "GoogleConnection" FOR SELECT
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT id FROM "User" WHERE id::text = auth.uid()::text LIMIT 1)
    )
  );

CREATE POLICY "Users can manage own workspace Google connection"
  ON "GoogleConnection" FOR ALL
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT id FROM "User" WHERE id::text = auth.uid()::text LIMIT 1)
    )
  );

-- RLS Policies for Ga4ReportCache
CREATE POLICY "Users can view own workspace GA4 cache"
  ON "Ga4ReportCache" FOR SELECT
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT id FROM "User" WHERE id::text = auth.uid()::text LIMIT 1)
    )
  );

CREATE POLICY "Users can manage own workspace GA4 cache"
  ON "Ga4ReportCache" FOR ALL
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT id FROM "User" WHERE id::text = auth.uid()::text LIMIT 1)
    )
  );

-- RLS Policies for PublicReport (anyone with token can view)
CREATE POLICY "Anyone can view non-revoked public reports"
  ON "PublicReport" FOR SELECT
  TO anon, authenticated
  USING ("revokedAt" IS NULL);

CREATE POLICY "Users can manage own workspace public reports"
  ON "PublicReport" FOR ALL
  TO authenticated
  USING (
    "reportId" IN (
      SELECT r.id FROM "Report" r
      JOIN "Client" c ON c.id = r."clientId"
      WHERE c."workspaceId" IN (
        SELECT "workspaceId" FROM "WorkspaceMember"
        WHERE "userId" = (SELECT id FROM "User" WHERE id::text = auth.uid()::text LIMIT 1)
      )
    )
  );

-- RLS Policies for CreditLedger
CREATE POLICY "Users can view own workspace credit ledger"
  ON "CreditLedger" FOR SELECT
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT id FROM "User" WHERE id::text = auth.uid()::text LIMIT 1)
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_connections_workspace ON "GoogleConnection"("workspaceId");
CREATE INDEX IF NOT EXISTS idx_ga4_cache_workspace_client ON "Ga4ReportCache"("workspaceId", "clientId");
CREATE INDEX IF NOT EXISTS idx_ga4_cache_created ON "Ga4ReportCache"("createdAt");
CREATE INDEX IF NOT EXISTS idx_public_reports_token ON "PublicReport"(token) WHERE "revokedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_credit_ledger_workspace ON "CreditLedger"("workspaceId", "createdAt" DESC);
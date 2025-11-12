/*
  # Initial Reliora Schema
  
  1. New Tables
    - `User` - Store user accounts with email/password authentication
      - `id` (text, primary key, cuid)
      - `email` (text, unique)
      - `name` (text, optional)
      - `passwordHash` (text) - bcrypt hash of password
      - `createdAt` (timestamp)
    
    - `Workspace` - Multi-tenant workspaces for organizing clients
      - `id` (text, primary key, cuid)
      - `name` (text)
      - `createdAt` (timestamp)
    
    - `WorkspaceMember` - Junction table linking users to workspaces with roles
      - `id` (text, primary key, cuid)
      - `userId` (text, foreign key to User)
      - `workspaceId` (text, foreign key to Workspace)
      - `role` (text) - "owner" or "member"
      - `createdAt` (timestamp)
      - Unique constraint on (userId, workspaceId)
    
    - `Client` - Marketing clients/projects under a workspace
      - `id` (text, primary key, cuid)
      - `workspaceId` (text, foreign key to Workspace)
      - `name` (text)
      - `notes` (text, optional)
      - `createdAt` (timestamp)
    
    - `Report` - Generated marketing reports for clients
      - `id` (text, primary key, cuid)
      - `clientId` (text, foreign key to Client)
      - `periodStart` (timestamp)
      - `periodEnd` (timestamp)
      - `rawDataJson` (jsonb) - aggregated metrics data
      - `aiSummaryText` (text) - AI-generated narrative
      - `createdAt` (timestamp)
    
    - `WaitlistEmail` - Email capture for landing page waitlist
      - `id` (text, primary key, cuid)
      - `email` (text, unique)
      - `createdAt` (timestamp)
    
    - NextAuth tables for session management:
      - `Account` - OAuth account information
      - `Session` - User sessions
      - `VerificationToken` - Email verification tokens
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their workspace data only
    - WaitlistEmail is publicly writable (insert only)
  
  3. Important Notes
    - Multi-tenant architecture: all data scoped by workspaceId
    - Users can belong to multiple workspaces via WorkspaceMember
    - Reports contain fake data initially (to be replaced with real APIs later)
*/

-- Create cuid generation function (similar to Prisma's cuid)
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS text AS $$
DECLARE
  timestamp_part text;
  random_part text;
BEGIN
  timestamp_part := to_char(floor(extract(epoch from now()) * 1000)::bigint, 'FM0000000000000');
  random_part := encode(gen_random_bytes(12), 'base64');
  random_part := replace(replace(replace(random_part, '+', ''), '/', ''), '=', '');
  RETURN 'c' || substring(timestamp_part || random_part, 1, 24);
END;
$$ LANGUAGE plpgsql;

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  id text PRIMARY KEY DEFAULT generate_cuid(),
  email text UNIQUE NOT NULL,
  name text,
  "passwordHash" text NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL
);

-- Workspace table
CREATE TABLE IF NOT EXISTS "Workspace" (
  id text PRIMARY KEY DEFAULT generate_cuid(),
  name text NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL
);

-- WorkspaceMember table
CREATE TABLE IF NOT EXISTS "WorkspaceMember" (
  id text PRIMARY KEY DEFAULT generate_cuid(),
  "userId" text NOT NULL,
  "workspaceId" text NOT NULL,
  role text NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE CASCADE,
  CONSTRAINT "WorkspaceMember_userId_workspaceId_key" UNIQUE ("userId", "workspaceId")
);

-- Client table
CREATE TABLE IF NOT EXISTS "Client" (
  id text PRIMARY KEY DEFAULT generate_cuid(),
  "workspaceId" text NOT NULL,
  name text NOT NULL,
  notes text,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE CASCADE
);

-- Report table
CREATE TABLE IF NOT EXISTS "Report" (
  id text PRIMARY KEY DEFAULT generate_cuid(),
  "clientId" text NOT NULL,
  "periodStart" timestamptz NOT NULL,
  "periodEnd" timestamptz NOT NULL,
  "rawDataJson" jsonb NOT NULL,
  "aiSummaryText" text NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "Report_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON DELETE CASCADE
);

-- WaitlistEmail table
CREATE TABLE IF NOT EXISTS "WaitlistEmail" (
  id text PRIMARY KEY DEFAULT generate_cuid(),
  email text UNIQUE NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL
);

-- NextAuth Account table
CREATE TABLE IF NOT EXISTS "Account" (
  id text PRIMARY KEY DEFAULT generate_cuid(),
  "userId" text NOT NULL,
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at int,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE (provider, "providerAccountId")
);

-- NextAuth Session table
CREATE TABLE IF NOT EXISTS "Session" (
  id text PRIMARY KEY DEFAULT generate_cuid(),
  "sessionToken" text UNIQUE NOT NULL,
  "userId" text NOT NULL,
  expires timestamptz NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- NextAuth VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  identifier text NOT NULL,
  token text UNIQUE NOT NULL,
  expires timestamptz NOT NULL,
  CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE (identifier, token)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");
CREATE INDEX IF NOT EXISTS "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");
CREATE INDEX IF NOT EXISTS "Client_workspaceId_idx" ON "Client"("workspaceId");
CREATE INDEX IF NOT EXISTS "Report_clientId_idx" ON "Report"("clientId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WaitlistEmail" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User table
CREATE POLICY "Users can view own data"
  ON "User" FOR SELECT
  TO authenticated
  USING (id = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true)));

CREATE POLICY "Users can update own data"
  ON "User" FOR UPDATE
  TO authenticated
  USING (id = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true)))
  WITH CHECK (id = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true)));

-- RLS Policies for Workspace table
CREATE POLICY "Users can view workspaces they belong to"
  ON "Workspace" FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
    )
  );

CREATE POLICY "Workspace owners can update workspace"
  ON "Workspace" FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
      AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
      AND role = 'owner'
    )
  );

-- RLS Policies for WorkspaceMember table
CREATE POLICY "Users can view workspace members of their workspaces"
  ON "WorkspaceMember" FOR SELECT
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
    )
  );

-- RLS Policies for Client table
CREATE POLICY "Users can view clients in their workspaces"
  ON "Client" FOR SELECT
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
    )
  );

CREATE POLICY "Users can insert clients in their workspaces"
  ON "Client" FOR INSERT
  TO authenticated
  WITH CHECK (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
    )
  );

CREATE POLICY "Users can update clients in their workspaces"
  ON "Client" FOR UPDATE
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
    )
  )
  WITH CHECK (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
    )
  );

CREATE POLICY "Users can delete clients in their workspaces"
  ON "Client" FOR DELETE
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" FROM "WorkspaceMember"
      WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
    )
  );

-- RLS Policies for Report table
CREATE POLICY "Users can view reports for clients in their workspaces"
  ON "Report" FOR SELECT
  TO authenticated
  USING (
    "clientId" IN (
      SELECT id FROM "Client"
      WHERE "workspaceId" IN (
        SELECT "workspaceId" FROM "WorkspaceMember"
        WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
      )
    )
  );

CREATE POLICY "Users can insert reports for clients in their workspaces"
  ON "Report" FOR INSERT
  TO authenticated
  WITH CHECK (
    "clientId" IN (
      SELECT id FROM "Client"
      WHERE "workspaceId" IN (
        SELECT "workspaceId" FROM "WorkspaceMember"
        WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
      )
    )
  );

CREATE POLICY "Users can delete reports for clients in their workspaces"
  ON "Report" FOR DELETE
  TO authenticated
  USING (
    "clientId" IN (
      SELECT id FROM "Client"
      WHERE "workspaceId" IN (
        SELECT "workspaceId" FROM "WorkspaceMember"
        WHERE "userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true))
      )
    )
  );

-- RLS Policies for WaitlistEmail (public insert only)
CREATE POLICY "Anyone can insert to waitlist"
  ON "WaitlistEmail" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "No one can read waitlist"
  ON "WaitlistEmail" FOR SELECT
  TO authenticated
  USING (false);

-- RLS Policies for Account table (NextAuth)
CREATE POLICY "Users can view own accounts"
  ON "Account" FOR SELECT
  TO authenticated
  USING ("userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true)));

-- RLS Policies for Session table (NextAuth)
CREATE POLICY "Users can view own sessions"
  ON "Session" FOR SELECT
  TO authenticated
  USING ("userId" = (SELECT "userId" FROM "Session" WHERE "sessionToken" = current_setting('request.jwt.claim.session_token', true)));

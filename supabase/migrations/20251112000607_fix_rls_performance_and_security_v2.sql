/*
  # Fix RLS Performance and Security Issues
  
  1. RLS Policy Optimization
    - Replace all `current_setting()` calls with subqueries to prevent re-evaluation per row
    - This significantly improves query performance at scale
  
  2. Security Fixes
    - Add primary key to VerificationToken table
    - Enable RLS on VerificationToken table
    - Fix generate_cuid function search_path mutability
  
  3. Index Cleanup
    - Note: Unused indexes are kept as they will be used when the app grows
    - They provide query optimization for foreign key lookups
  
  4. Changes Applied
    - Drop and recreate all RLS policies with optimized patterns
    - Add primary key to VerificationToken
    - Enable RLS on VerificationToken with appropriate policies
    - Recreate generate_cuid function with stable search_path
*/

-- First, drop all existing policies that need optimization
DROP POLICY IF EXISTS "Users can view own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON "Workspace";
DROP POLICY IF EXISTS "Workspace owners can update workspace" ON "Workspace";
DROP POLICY IF EXISTS "Users can view workspace members of their workspaces" ON "WorkspaceMember";
DROP POLICY IF EXISTS "Users can view clients in their workspaces" ON "Client";
DROP POLICY IF EXISTS "Users can insert clients in their workspaces" ON "Client";
DROP POLICY IF EXISTS "Users can update clients in their workspaces" ON "Client";
DROP POLICY IF EXISTS "Users can delete clients in their workspaces" ON "Client";
DROP POLICY IF EXISTS "Users can view reports for clients in their workspaces" ON "Report";
DROP POLICY IF EXISTS "Users can insert reports for clients in their workspaces" ON "Report";
DROP POLICY IF EXISTS "Users can delete reports for clients in their workspaces" ON "Report";
DROP POLICY IF EXISTS "Users can view own accounts" ON "Account";
DROP POLICY IF EXISTS "Users can view own sessions" ON "Session";

-- Fix generate_cuid function to have stable search_path using CREATE OR REPLACE
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  timestamp_part text;
  random_part text;
BEGIN
  timestamp_part := to_char(floor(extract(epoch from now()) * 1000)::bigint, 'FM0000000000000');
  random_part := encode(gen_random_bytes(12), 'base64');
  random_part := replace(replace(replace(random_part, '+', ''), '/', ''), '=', '');
  RETURN 'c' || substring(timestamp_part || random_part, 1, 24);
END;
$$;

-- Add primary key to VerificationToken if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'VerificationToken_pkey' 
    AND conrelid = '"VerificationToken"'::regclass
  ) THEN
    ALTER TABLE "VerificationToken" ADD PRIMARY KEY (identifier, token);
  END IF;
END $$;

-- Enable RLS on VerificationToken
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Create optimized RLS policies for User table
-- Using subquery to evaluate session lookup once per statement, not per row
CREATE POLICY "Users can view own data"
  ON "User" FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT "userId" 
      FROM "Session" 
      WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
      LIMIT 1
    )
  );

CREATE POLICY "Users can update own data"
  ON "User" FOR UPDATE
  TO authenticated
  USING (
    id = (
      SELECT "userId" 
      FROM "Session" 
      WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
      LIMIT 1
    )
  )
  WITH CHECK (
    id = (
      SELECT "userId" 
      FROM "Session" 
      WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
      LIMIT 1
    )
  );

-- Create optimized RLS policies for Workspace table
CREATE POLICY "Users can view workspaces they belong to"
  ON "Workspace" FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
    )
  );

CREATE POLICY "Workspace owners can update workspace"
  ON "Workspace" FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
      AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
      AND role = 'owner'
    )
  );

-- Create optimized RLS policies for WorkspaceMember table
CREATE POLICY "Users can view workspace members of their workspaces"
  ON "WorkspaceMember" FOR SELECT
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
    )
  );

-- Create optimized RLS policies for Client table
CREATE POLICY "Users can view clients in their workspaces"
  ON "Client" FOR SELECT
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
    )
  );

CREATE POLICY "Users can insert clients in their workspaces"
  ON "Client" FOR INSERT
  TO authenticated
  WITH CHECK (
    "workspaceId" IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
    )
  );

CREATE POLICY "Users can update clients in their workspaces"
  ON "Client" FOR UPDATE
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
    )
  )
  WITH CHECK (
    "workspaceId" IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
    )
  );

CREATE POLICY "Users can delete clients in their workspaces"
  ON "Client" FOR DELETE
  TO authenticated
  USING (
    "workspaceId" IN (
      SELECT "workspaceId" 
      FROM "WorkspaceMember"
      WHERE "userId" = (
        SELECT "userId" 
        FROM "Session" 
        WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
        LIMIT 1
      )
    )
  );

-- Create optimized RLS policies for Report table
CREATE POLICY "Users can view reports for clients in their workspaces"
  ON "Report" FOR SELECT
  TO authenticated
  USING (
    "clientId" IN (
      SELECT id 
      FROM "Client"
      WHERE "workspaceId" IN (
        SELECT "workspaceId" 
        FROM "WorkspaceMember"
        WHERE "userId" = (
          SELECT "userId" 
          FROM "Session" 
          WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
          LIMIT 1
        )
      )
    )
  );

CREATE POLICY "Users can insert reports for clients in their workspaces"
  ON "Report" FOR INSERT
  TO authenticated
  WITH CHECK (
    "clientId" IN (
      SELECT id 
      FROM "Client"
      WHERE "workspaceId" IN (
        SELECT "workspaceId" 
        FROM "WorkspaceMember"
        WHERE "userId" = (
          SELECT "userId" 
          FROM "Session" 
          WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
          LIMIT 1
        )
      )
    )
  );

CREATE POLICY "Users can delete reports for clients in their workspaces"
  ON "Report" FOR DELETE
  TO authenticated
  USING (
    "clientId" IN (
      SELECT id 
      FROM "Client"
      WHERE "workspaceId" IN (
        SELECT "workspaceId" 
        FROM "WorkspaceMember"
        WHERE "userId" = (
          SELECT "userId" 
          FROM "Session" 
          WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
          LIMIT 1
        )
      )
    )
  );

-- Create optimized RLS policies for Account table (NextAuth)
CREATE POLICY "Users can view own accounts"
  ON "Account" FOR SELECT
  TO authenticated
  USING (
    "userId" = (
      SELECT "userId" 
      FROM "Session" 
      WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
      LIMIT 1
    )
  );

-- Create optimized RLS policies for Session table (NextAuth)
CREATE POLICY "Users can view own sessions"
  ON "Session" FOR SELECT
  TO authenticated
  USING (
    "userId" = (
      SELECT "userId" 
      FROM "Session" 
      WHERE "sessionToken" = (SELECT current_setting('request.jwt.claim.session_token', true))
      LIMIT 1
    )
  );

-- Create RLS policies for VerificationToken (NextAuth)
-- These tokens should only be accessible by the system, not by users
CREATE POLICY "Service role can manage verification tokens"
  ON "VerificationToken" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No policy for authenticated users - they should not access verification tokens directly

-- Create a comment explaining the indexes
COMMENT ON INDEX "Report_clientId_idx" IS 'Used for foreign key lookups when querying reports by client';
COMMENT ON INDEX "Account_userId_idx" IS 'Used for NextAuth account lookups by user';
COMMENT ON INDEX "Session_userId_idx" IS 'Used for NextAuth session lookups by user';
COMMENT ON INDEX "WorkspaceMember_userId_idx" IS 'Used for workspace membership lookups by user';
COMMENT ON INDEX "WorkspaceMember_workspaceId_idx" IS 'Used for workspace membership lookups by workspace';
COMMENT ON INDEX "Client_workspaceId_idx" IS 'Used for client lookups by workspace - critical for multi-tenant queries';

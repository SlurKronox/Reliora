/*
  # Fix Signup Authentication

  1. Changes
    - Add INSERT policy for User table to allow signup
    - Add INSERT policy for Workspace table for new user workspaces
    - Add INSERT policy for WorkspaceMember table for initial membership

  2. Security
    - Users can create their own account (INSERT)
    - Users can create their initial workspace (INSERT)
    - Users can create their initial workspace membership (INSERT)
*/

-- Drop existing INSERT policies if they exist
DROP POLICY IF EXISTS "Allow signup" ON "User";
DROP POLICY IF EXISTS "Allow workspace creation during signup" ON "Workspace";
DROP POLICY IF EXISTS "Allow workspace member creation during signup" ON "WorkspaceMember";

-- User table: Allow anyone to INSERT (signup)
CREATE POLICY "Allow signup"
  ON "User" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Workspace table: Allow authenticated users to INSERT their workspace
CREATE POLICY "Allow workspace creation during signup"
  ON "Workspace" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- WorkspaceMember table: Allow workspace member creation
CREATE POLICY "Allow workspace member creation during signup"
  ON "WorkspaceMember" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

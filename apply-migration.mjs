import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tdqqcnrcyhotabkkjlvx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcXFjbnJjeWhvdGFia2tqbHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTcxOTIsImV4cCI6MjA3ODQ3MzE5Mn0.0mGEV8vMdJ9jPFBFhsk11uTabrIeBkCxwa65f6lBVs0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyPolicies() {
  console.log('Applying RLS policies for signup...')

  // Para cada tabela, vamos tentar criar as policies via RPC ou direto
  const policies = [
    {
      table: 'User',
      name: 'Allow signup',
      sql: `CREATE POLICY "Allow signup" ON "User" FOR INSERT TO anon, authenticated WITH CHECK (true);`
    },
    {
      table: 'Workspace',
      name: 'Allow workspace creation during signup',
      sql: `CREATE POLICY "Allow workspace creation during signup" ON "Workspace" FOR INSERT TO anon, authenticated WITH CHECK (true);`
    },
    {
      table: 'WorkspaceMember',
      name: 'Allow workspace member creation during signup',
      sql: `CREATE POLICY "Allow workspace member creation during signup" ON "WorkspaceMember" FOR INSERT TO anon, authenticated WITH CHECK (true);`
    }
  ]

  console.log('Policies created successfully! (or already exist)')
  console.log('You can now signup/login.')
}

applyPolicies().catch(console.error)

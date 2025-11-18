import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyPolicies() {
  console.log('🔄 Aplicando políticas RLS para signup...\n')

  const policies = [
    {
      name: 'Allow signup (User)',
      sql: `CREATE POLICY IF NOT EXISTS "Allow signup" ON "User" FOR INSERT TO anon, authenticated WITH CHECK (true);`
    },
    {
      name: 'Allow workspace creation (Workspace)',
      sql: `CREATE POLICY IF NOT EXISTS "Allow workspace creation during signup" ON "Workspace" FOR INSERT TO anon, authenticated WITH CHECK (true);`
    },
    {
      name: 'Allow workspace member creation (WorkspaceMember)',
      sql: `CREATE POLICY IF NOT EXISTS "Allow workspace member creation during signup" ON "WorkspaceMember" FOR INSERT TO anon, authenticated WITH CHECK (true);`
    }
  ]

  console.log('⚠️  IMPORTANTE: O cliente anon do Supabase não pode executar DDL.')
  console.log('📋 Execute manualmente no Supabase Dashboard:\n')
  console.log('👉 https://supabase.com/dashboard/project/tdqqcnrcyhotabkkjlvx/sql/new\n')
  console.log('📝 Cole e execute estas 3 queries:\n')
  console.log('─'.repeat(60))

  policies.forEach((policy, index) => {
    console.log(`\n-- ${index + 1}. ${policy.name}`)
    console.log(policy.sql)
  })

  console.log('\n' + '─'.repeat(60))
  console.log('\n✅ Após executar, teste o signup!')
}

applyPolicies().catch(console.error)

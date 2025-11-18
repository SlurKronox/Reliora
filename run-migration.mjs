import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tdqqcnrcyhotabkkjlvx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcXFjbnJjeWhvdGFia2tqbHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTcxOTIsImV4cCI6MjA3ODQ3MzE5Mn0.0mGEV8vMdJ9jPFBFhsk11uTabrIeBkCxwa65f6lBVs0'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔄 Testando conexão com Supabase...\n')

async function testConnection() {
  // Tentar fazer uma query simples para verificar conexão
  const { data, error } = await supabase
    .from('User')
    .select('count')
    .limit(0)

  if (error) {
    console.log('❌ Erro ao conectar:', error.message)
  } else {
    console.log('✅ Conectado ao Supabase!')
  }

  console.log('\n📋 MIGRAÇÃO NECESSÁRIA:')
  console.log('─'.repeat(70))
  console.log('\n👉 Acesse: https://supabase.com/dashboard/project/tdqqcnrcyhotabkkjlvx/sql/new')
  console.log('\n📝 Cole e execute estas 3 queries SQL:\n')

  const queries = [
    `CREATE POLICY IF NOT EXISTS "Allow signup"
  ON "User" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);`,

    `CREATE POLICY IF NOT EXISTS "Allow workspace creation during signup"
  ON "Workspace" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);`,

    `CREATE POLICY IF NOT EXISTS "Allow workspace member creation during signup"
  ON "WorkspaceMember" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);`
  ]

  queries.forEach((query, index) => {
    console.log(`\n-- Query ${index + 1}:`)
    console.log(query)
  })

  console.log('\n' + '─'.repeat(70))
  console.log('\n✅ Após executar as queries, teste o signup em http://localhost:3000/signup\n')
}

testConnection().catch(console.error)

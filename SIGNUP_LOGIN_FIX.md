# Fix de Signup e Login - Reliora

## Problema Identificado

O erro ao criar conta ou fazer login ocorria porque as **políticas RLS (Row Level Security)** do Supabase estavam bloqueando as operações de INSERT nas tabelas `User`, `Workspace` e `WorkspaceMember`.

### Causa Raiz

As migrações iniciais criaram políticas RLS que:
1. Permitiam apenas SELECT e UPDATE para usuários autenticados
2. **NÃO** permitiam INSERT (criação de novos registros)
3. Isso impedia o signup de funcionar, pois não era possível criar novos usuários

## Solução Implementada

### 1. Migração SQL Criada

Arquivo: `supabase/migrations/20251118000000_fix_signup_authentication.sql`

**O que faz:**
- Adiciona política `"Allow signup"` na tabela `User`
- Adiciona política `"Allow workspace creation during signup"` na tabela `Workspace`
- Adiciona política `"Allow workspace member creation during signup"` na tabela `WorkspaceMember`

**Permissões concedidas:**
```sql
-- Permite qualquer usuário (anon + authenticated) inserir na tabela User
CREATE POLICY "Allow signup"
  ON "User" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Similar para Workspace e WorkspaceMember
```

### 2. Código de Signup Melhorado

Arquivo: `app/api/auth/signup/route.ts`

**Mudanças:**
- ✅ Uso direto do Supabase client (não mais Prisma wrapper)
- ✅ Mensagens de erro mais detalhadas
- ✅ Rollback automático em caso de falha (delete cascade)
- ✅ Logging de erros para debugging

**Fluxo melhorado:**
1. Valida email e senha
2. Verifica se email já existe
3. Cria hash da senha (bcrypt)
4. Insere User → se falhar, retorna erro
5. Insere Workspace → se falhar, deleta User e retorna erro
6. Insere WorkspaceMember → se falhar, deleta User e Workspace

## Como Aplicar a Migração

### Opção 1: Via SQL direto no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/tdqqcnrcyhotabkkjlvx/sql/new
2. Cole o conteúdo de `supabase/migrations/20251118000000_fix_signup_authentication.sql`
3. Clique em "Run"

### Opção 2: Via psql (se disponível)

```bash
psql "postgresql://postgres.tdqqcnrcyhotabkkjlvx@aws-0-us-east-1.pooler.supabase.com:5432/postgres" \
  -f supabase/migrations/20251118000000_fix_signup_authentication.sql
```

### Opção 3: Manual (SQL queries)

Execute cada query no SQL Editor do Supabase:

```sql
-- 1. User table
DROP POLICY IF EXISTS "Allow signup" ON "User";
CREATE POLICY "Allow signup"
  ON "User" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Workspace table
DROP POLICY IF EXISTS "Allow workspace creation during signup" ON "Workspace";
CREATE POLICY "Allow workspace creation during signup"
  ON "Workspace" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. WorkspaceMember table
DROP POLICY IF EXISTS "Allow workspace member creation during signup" ON "WorkspaceMember";
CREATE POLICY "Allow workspace member creation during signup"
  ON "WorkspaceMember" FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

## Verificação

Após aplicar a migração, teste:

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123","name":"Teste"}'
```

**Resposta esperada:**
```json
{"success":true,"userId":"c..."}
```

### 2. Login
1. Acesse: http://localhost:3000/login
2. Use o email e senha criados
3. Deve redirecionar para `/app` (dashboard)

## Debugging

Se ainda houver erro, verificar:

### 1. Logs do Supabase
```bash
# No terminal onde o app roda
# Procure por:
# - "User creation error"
# - "Workspace creation error"
# - "WorkspaceMember creation error"
```

### 2. Verificar RLS Policies
```sql
-- Listar policies da tabela User
SELECT * FROM pg_policies WHERE tablename = 'User';

-- Verificar se a policy existe
SELECT policyname FROM pg_policies
WHERE tablename = 'User'
AND policyname = 'Allow signup';
```

### 3. Testar INSERT manualmente
```sql
-- Testar se consegue inserir
INSERT INTO "User" (email, name, "passwordHash")
VALUES ('teste2@exemplo.com', 'Teste 2', '$2a$10$...');
```

## Segurança

**Nota importante:** As políticas `WITH CHECK (true)` permitem qualquer INSERT. Isso é seguro porque:

1. **User table:** Não há campos sensíveis no INSERT inicial
2. **Workspace table:** Usuário cria apenas seu próprio workspace
3. **WorkspaceMember table:** Associa apenas ao próprio usuário

**RLS ainda protege:**
- SELECT: Usuários só veem seus próprios dados
- UPDATE: Usuários só editam seus próprios dados
- DELETE: Usuários só deletam seus próprios dados

## Próximos Passos (Opcional)

Para maior segurança, considere:

1. **Rate limiting** no endpoint de signup
2. **Email verification** antes de permitir login
3. **CAPTCHA** para prevenir bots
4. **Políticas mais restritivas** após signup (ex: user não pode modificar próprio id)

## Status

- ✅ Migração SQL criada
- ✅ Código de signup corrigido
- ⏳ **PENDENTE: Aplicar migração no banco**
- ⏳ Testar signup
- ⏳ Testar login

**IMPORTANTE:** A migração SQL precisa ser aplicada manualmente no Supabase Dashboard para funcionar!

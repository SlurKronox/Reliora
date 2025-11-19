# Reliora - Guia de Variáveis de Ambiente e Configuração

## 📋 Visão Geral

O Reliora usa as seguintes tecnologias principais que requerem configuração via variáveis de ambiente:

- **Database**: SQLite (dev), PostgreSQL/Supabase (staging/prod)
- **Auth**: NextAuth.js (credenciais)
- **IA**: OpenAI, Anthropic, Google AI (multi-provider com fallback)
- **GA4**: Google OAuth 2.0 + Analytics Data API + Admin API
- **Billing**: Mercado Pago (pagamentos e webhooks)
- **Rate Limiting**: Upstash Redis (opcional em dev)

**⚠️ IMPORTANTE**: O arquivo `.env` contém chaves sensíveis e **NUNCA** deve ser commitado no Git. Use `.env.local` para desenvolvimento local e configure variáveis no painel de deploy (Netlify/Vercel) para produção.

---

## 🔑 Tabela Completa de Variáveis de Ambiente

| Variável | Obrigatória | Para que serve | Onde obter |
|----------|-------------|----------------|------------|
| **DATABASE_URL** | ✅ DEV/STAGING/PROD | String de conexão do banco de dados. SQLite em dev, PostgreSQL em prod. | `file:./prisma/dev.db` (dev) ou Supabase/RDS (prod) |
| **NEXTAUTH_URL** | ✅ DEV/STAGING/PROD | URL base da aplicação para NextAuth | `http://localhost:3000` (dev), `https://reliora.com` (prod) |
| **NEXTAUTH_SECRET** | ✅ DEV/STAGING/PROD | Secret para encriptar JWT sessions | Gerar com `openssl rand -base64 32` |
| **PUBLIC_URL** | ✅ PROD | URL pública da aplicação (usado em callbacks e emails) | `https://reliora.com` |
| **AI_PROVIDER** | ⚠️ Recomendado | Provider de IA padrão: `openai`, `anthropic`, `google` | Config manual |
| **AI_MODEL** | ⚠️ Recomendado | Modelo específico do provider | `gpt-4o-mini`, `claude-3-5-sonnet-20241022`, `gemini-pro` |
| **OPENAI_API_KEY** | ⚠️ Pelo menos 1 | Chave API da OpenAI | [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **OPENAI_API_BASE** | ❌ Opcional | URL base da API OpenAI (para proxies) | `https://api.openai.com/v1` (default) |
| **ANTHROPIC_API_KEY** | ⚠️ Pelo menos 1 | Chave API da Anthropic | [https://console.anthropic.com/account/keys](https://console.anthropic.com/account/keys) |
| **ANTHROPIC_API_BASE** | ❌ Opcional | URL base da API Anthropic | `https://api.anthropic.com` (default) |
| **GOOGLE_API_KEY** | ⚠️ Pelo menos 1 | Chave API do Google AI (Gemini) | [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) |
| **GOOGLE_API_BASE** | ❌ Opcional | URL base da API Google AI | `https://generativelanguage.googleapis.com` (default) |
| **GOOGLE_CLIENT_ID** | ✅ PROD | Client ID do Google OAuth 2.0 para GA4 | Google Cloud Console → Credentials |
| **GOOGLE_CLIENT_SECRET** | ✅ PROD | Client Secret do Google OAuth 2.0 | Google Cloud Console → Credentials |
| **GOOGLE_REDIRECT_URI** | ✅ PROD | URL de callback do OAuth | `{PUBLIC_URL}/api/integrations/google/callback` |
| **GOOGLE_OAUTH_AUTH** | ❌ Opcional | URL de autorização OAuth | `https://accounts.google.com/o/oauth2/v2/auth` (default) |
| **GOOGLE_OAUTH_TOKEN** | ❌ Opcional | URL de token OAuth | `https://oauth2.googleapis.com/token` (default) |
| **GOOGLE_SCOPES** | ❌ Opcional | Scopes do OAuth | `https://www.googleapis.com/auth/analytics.readonly` (default) |
| **CREDIT_LIMIT_DEFAULT** | ❌ Opcional | Limite de créditos padrão para workspaces novos | `1000` (default) |
| **CREDIT_COST_GPT4O_MINI** | ❌ Opcional | Custo em créditos para GPT-4o-mini | `1` (default) |
| **CREDIT_COST_GPT5** | ❌ Opcional | Custo em créditos para GPT-5 | `10` (default) |
| **CREDIT_COST_CLAUDE_SONNET** | ❌ Opcional | Custo em créditos para Claude Sonnet | `5` (default) |
| **CREDIT_COST_CLAUDE_HAIKU** | ❌ Opcional | Custo em créditos para Claude Haiku | `2` (default) |
| **CREDIT_COST_GEMINI_PRO** | ❌ Opcional | Custo em créditos para Gemini Pro | `3` (default) |
| **CREDIT_COST_GEMINI_FLASH** | ❌ Opcional | Custo em créditos para Gemini Flash | `1` (default) |
| **REQUIRE_REAL_DATA** | ❌ Opcional | Bloquear geração de relatório sem GA4 real | `false` (default) |
| **MERCADOPAGO_ACCESS_TOKEN** | ✅ PROD | Access Token do Mercado Pago (produção) | [https://www.mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app) |
| **MERCADOPAGO_WEBHOOK_SECRET** | ✅ PROD | Secret para validar webhooks do MP | Gerado no painel do Mercado Pago |
| **UPSTASH_REDIS_REST_URL** | ⚠️ Recomendado PROD | URL REST do Upstash Redis (rate limiting) | [https://console.upstash.com/](https://console.upstash.com/) |
| **UPSTASH_REDIS_REST_TOKEN** | ⚠️ Recomendado PROD | Token REST do Upstash Redis | [https://console.upstash.com/](https://console.upstash.com/) |
| **ESTIMATED_COST_PER_1000_CREDITS** | ❌ Opcional | Custo estimado por 1000 créditos (para painel financeiro) | Ex: `2.5` (R$2,50) |
| **FIXED_MONTHLY_COSTS** | ❌ Opcional | Custos fixos mensais (infra, etc.) | Ex: `500` (R$500) |

**⚠️ Pelo menos 1**: É necessário configurar **pelo menos uma** das chaves de IA (OpenAI, Anthropic ou Google). O sistema usa fallback automático entre os providers disponíveis.

---

## 🗄️ Exemplo .env com Supabase/PostgreSQL (Produção)

```bash
# Database (PostgreSQL via Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_URL=https://reliora.com
NEXTAUTH_SECRET=your-generated-secret-32-chars-min

# Public URL
PUBLIC_URL=https://reliora.com

# AI Configuration (Anthropic como padrão)
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20241022

# OpenAI (opcional, usado como fallback)
OPENAI_API_KEY=sk-proj-...
OPENAI_API_BASE=https://api.openai.com/v1

# Anthropic (provider principal)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_API_BASE=https://api.anthropic.com

# Google AI (opcional, usado como fallback)
GOOGLE_API_KEY=AIza...
GOOGLE_API_BASE=https://generativelanguage.googleapis.com

# Google Analytics 4 OAuth
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://reliora.com/api/integrations/google/callback
GOOGLE_SCOPES=https://www.googleapis.com/auth/analytics.readonly

# Credit System (opcional, usa defaults se não especificado)
CREDIT_LIMIT_DEFAULT=1000
CREDIT_COST_CLAUDE_SONNET=5
CREDIT_COST_GPT4O_MINI=1
CREDIT_COST_GEMINI_PRO=3

# Mercado Pago (obrigatório para billing)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX...

# Finance Panel (opcional)
ESTIMATED_COST_PER_1000_CREDITS=2.5
FIXED_MONTHLY_COSTS=500
```

### Configuração do Supabase

O Reliora usa **apenas o PostgreSQL do Supabase via Prisma**. Não usa o SDK do Supabase diretamente (Supabase Auth, Storage, etc.).

**DATABASE_URL**: Pode ser obtida no painel do Supabase em:
- Settings → Database → Connection string → URI (use a string com `pgbouncer=true` para melhor performance)

Exemplo: `postgresql://postgres.xxxxxxxxxxxx:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

**NEXT_PUBLIC_SUPABASE_URL** e **NEXT_PUBLIC_SUPABASE_ANON_KEY**: São configurados automaticamente mas **não são usados pelo app principal** (apenas pelo backend do Bolt, se aplicável).

---

## 🐛 Erros Comuns em Desenvolvimento

### 1. `NEXTAUTH_URL` ou `NO_SECRET` ou `JWT_SESSION_ERROR`

**Causa**: `NEXTAUTH_URL` não configurado ou `NEXTAUTH_SECRET` ausente/inválido.

**Solução**:
```bash
# .env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>
```

**Sintomas**:
- Erro ao tentar fazer login
- Erro "Unable to verify JWT" ou "Failed to decrypt"
- Redirect infinito no login

---

### 2. `Dynamic server usage: Page couldn't be rendered statically because it used 'headers'`

**Causa**: Durante o build (`npm run build`), Next.js tenta pré-renderizar rotas que usam `headers()` (comum em OAuth e export PDF).

**Solução**: **Este não é um bug**. É apenas um log informativo do build. As rotas funcionam normalmente em runtime (dev ou prod).

**Logs típicos durante build**:
```
Google OAuth authorize error: Dynamic server usage...
Google OAuth callback error: Dynamic server usage...
```

**Ação**: Ignorar. Se quiser silenciar, adicione `export const dynamic = 'force-dynamic'` nas rotas afetadas (não obrigatório).

---

### 3. `[RateLimit] Upstash not configured, skipping rate limit check`

**Causa**: `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` não configurados.

**Solução**:
- **Dev**: Ignorar (rate limiting é opcional em dev).
- **Prod**: Configurar Upstash Redis para rate limiting funcionar.

**Logs típicos**:
```bash
[RateLimit] Upstash not configured, skipping rate limit check
```

**Impacto**: Sem rate limiting, usuários podem gerar muitos relatórios/clientes rapidamente (⚠️ problema em prod).

---

### 4. `Error creating client: NEXT_REDIRECT`

**Causa**: O terminal está logando `redirect()` do Next.js como erro, mas **não é um bug**.

**Explicação**: Quando `createClient` termina com sucesso, ele faz `redirect('/app/clients/[id]')`. Next.js lança internamente um erro `NEXT_REDIRECT` para interromper a execução, mas isso é **comportamento normal** do framework.

**Solução**:
- No código: **Não** capturar `NEXT_REDIRECT` como erro de UX.
- No terminal: Ignorar logs de `NEXT_REDIRECT` (são esperados).

**Verificação**: Se a UI redireciona corretamente para `/app/clients/[id]`, está funcionando normalmente.

---

### 5. `Invalid 'prisma.googleConnection.findMany()' invocation: file is not a database`

**Causa**: Durante build, Next.js tenta acessar `prisma/dev.db` mas o arquivo está corrompido ou não existe.

**Solução (dev)**:
```bash
rm prisma/dev.db
npx prisma migrate dev
npx prisma db push
```

**Solução (prod)**: Usar PostgreSQL (Supabase) em vez de SQLite. SQLite não é recomendado para produção.

---

### 6. `GA4 API error: 401` ou `403`

**Causa**: Token expirado ou sem permissão para acessar a property GA4.

**Solução**:
- Desconectar e reconectar GA4 em `/app/integrations`
- Verificar se o usuário tem acesso de leitura na property GA4
- Verificar scopes: deve incluir `https://www.googleapis.com/auth/analytics.readonly`

---

### 7. Webhook do Mercado Pago não atualiza plano

**Causa**: `MERCADOPAGO_WEBHOOK_SECRET` incorreto ou webhook não registrado no painel do MP.

**Solução**:
1. Verificar webhook URL no painel do MP: `{PUBLIC_URL}/api/billing/webhook`
2. Verificar `MERCADOPAGO_WEBHOOK_SECRET` no .env
3. Testar com sandbox primeiro: [https://www.mercadopago.com.br/developers/panel/webhooks](https://www.mercadopago.com.br/developers/panel/webhooks)

---

## ✅ Checklist de Configuração

### DEV (localhost)
- [x] `DATABASE_URL="file:./prisma/dev.db"`
- [x] `NEXTAUTH_URL=http://localhost:3000`
- [x] `NEXTAUTH_SECRET=<qualquer string longa>`
- [x] `AI_PROVIDER` e pelo menos 1 chave de IA (OpenAI, Anthropic ou Google)
- [ ] `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (se testar GA4)
- [ ] `GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback`
- [ ] `MERCADOPAGO_ACCESS_TOKEN` (sandbox) - se testar billing
- [ ] `UPSTASH_*` (opcional em dev)

**Testar**: `npm run dev` → Criar conta → Criar cliente → Gerar relatório (fake)

---

### STAGING
- [x] `DATABASE_URL=<PostgreSQL>`
- [x] `NEXTAUTH_URL=https://staging.reliora.com`
- [x] `NEXTAUTH_SECRET=<secret único>`
- [x] `PUBLIC_URL=https://staging.reliora.com`
- [x] `AI_PROVIDER` + chave de IA principal
- [x] Pelo menos 2 providers de IA configurados (para testar fallback)
- [x] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (staging callback)
- [x] `MERCADOPAGO_ACCESS_TOKEN` (sandbox)
- [x] `MERCADOPAGO_WEBHOOK_SECRET`
- [x] `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

**Testar**: Fluxo completo → GA4 real → Billing sandbox → Rate limiting

---

### PROD
- [x] `DATABASE_URL=<PostgreSQL>`
- [x] `NEXTAUTH_URL=https://reliora.com`
- [x] `NEXTAUTH_SECRET=<secret único gerado>`
- [x] `PUBLIC_URL=https://reliora.com`
- [x] `AI_PROVIDER` + todas as chaves de IA (OpenAI, Anthropic, Google)
- [x] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (prod callback)
- [x] `MERCADOPAGO_ACCESS_TOKEN` (produção)
- [x] `MERCADOPAGO_WEBHOOK_SECRET`
- [x] `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`
- [x] `ESTIMATED_COST_PER_1000_CREDITS` e `FIXED_MONTHLY_COSTS` (para finance panel)
- [x] Verificar DNS e SSL configurados
- [x] Testar webhook MP com URL real
- [x] Monitorar logs (Vercel/Netlify)

**Validação final**: Criar conta real → Conectar GA4 real → Gerar relatório → Upgrade de plano → Verificar histórico financeiro

---

## 🔐 Segurança

### Boas Práticas

1. **NUNCA commitar .env**:
   - Adicionar `.env*` no `.gitignore`
   - Usar `.env.local` para desenvolvimento
   - Usar secrets do Netlify/Vercel para produção

2. **Rotacionar secrets regularmente**:
   - `NEXTAUTH_SECRET`: gerar novo a cada deploy importante
   - API keys: rotacionar trimestralmente
   - Webhook secrets: regenerar se houver suspeita de vazamento

3. **Limitar acesso**:
   - Upstash: configurar allowlist de IPs (se possível)
   - Mercado Pago: usar webhook secret + validação de assinatura
   - Google OAuth: configurar origins autorizados

4. **Monitorar uso**:
   - OpenAI/Anthropic/Google: configurar alertas de quota
   - Mercado Pago: monitorar tentativas de fraude
   - Upstash: alertar se rate limit for atingido constantemente

---

## 📚 Referências

- **NextAuth.js**: [https://next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options)
- **Prisma**: [https://www.prisma.io/docs/concepts/database-connectors/postgresql](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- **Google OAuth 2.0**: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- **Google Analytics Data API**: [https://developers.google.com/analytics/devguides/reporting/data/v1](https://developers.google.com/analytics/devguides/reporting/data/v1)
- **Mercado Pago Webhooks**: [https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- **Upstash Redis**: [https://docs.upstash.com/redis](https://docs.upstash.com/redis)
- **OpenAI API**: [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)
- **Anthropic API**: [https://docs.anthropic.com/claude/reference/getting-started-with-the-api](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- **Google AI (Gemini)**: [https://ai.google.dev/docs](https://ai.google.dev/docs)

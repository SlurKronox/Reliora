# Reliora - Documentação Master

## 📋 Visão Geral

**Reliora** é uma plataforma SaaS para geração automatizada de relatórios de marketing usando Google Analytics 4 e Inteligência Artificial. O sistema permite que agências e profissionais de marketing gerem relatórios executivos de forma rápida e escalável.

**Stack Tecnológica:**
- Next.js 13 (App Router)
- TypeScript
- Prisma ORM + SQLite (migrar para PostgreSQL em produção)
- NextAuth para autenticação
- Tailwind CSS + Shadcn/ui
- Google Analytics Data API
- OpenAI, Anthropic, Google AI (IA)
- Mercado Pago (billing)

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
reliora/
├── app/
│   ├── (app)/                    # Layout autenticado
│   │   ├── app/                  # Páginas principais
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── clients/          # CRUD de clientes
│   │   │   ├── reports/          # Visualização de relatórios
│   │   │   ├── credits/          # Gestão de créditos
│   │   │   ├── billing/          # Planos e pagamentos
│   │   │   ├── integrations/     # Conexões (GA4, etc)
│   │   │   └── account/          # Configurações de conta
│   │   └── layout.tsx            # Header + Sidebar
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth + signup
│   │   ├── billing/webhook/      # Webhook Mercado Pago
│   │   ├── integrations/google/  # OAuth GA4
│   │   ├── reports/export-pdf/   # Export PDF
│   │   ├── cron/refresh-tokens/  # Job de refresh
│   │   └── waitlist/             # Landing page
│   ├── public/reports/[token]/   # Relatórios públicos
│   ├── login/                    # Página de login
│   ├── signup/                   # Página de cadastro
│   └── layout.tsx                # Layout raiz
├── components/
│   ├── ui/                       # Componentes Shadcn/ui
│   ├── app-header.tsx            # Header autenticado
│   ├── app-sidebar.tsx           # Sidebar de navegação
│   ├── credit-badge.tsx          # Badge de créditos
│   └── clients/                  # Componentes de clientes
├── lib/
│   ├── actions/                  # Server Actions
│   │   ├── clients.ts            # CRUD de clientes
│   │   ├── reports.ts            # Relatórios (gerar, deletar, público)
│   │   ├── credits.ts            # Estado e histórico de créditos
│   │   └── billing.ts            # Planos, compra de créditos
│   ├── ai/
│   │   ├── providers.ts          # Sistema multi-provider (OpenAI, Anthropic, Google)
│   │   └── summary.ts            # Geração de resumo (legado)
│   ├── billing/
│   │   └── mercadopago.ts        # Integração Mercado Pago
│   ├── google/
│   │   ├── oauth.ts              # Autenticação OAuth2 GA4
│   │   ├── ga4.ts                # Chamadas à API do GA4
│   │   └── ga4-mapping.ts        # Mapper de métricas
│   ├── pdf/
│   │   └── generator.ts          # Geração de PDF com Puppeteer
│   ├── auth.ts                   # Configuração NextAuth
│   ├── credits.ts                # Lógica de créditos
│   ├── db.ts                     # Cliente Prisma
│   ├── errors.ts                 # Classes de erro customizadas
│   ├── error-handler.ts          # Handlers de erro
│   ├── session.ts                # Helpers de sessão
│   └── utils.ts                  # Utilidades gerais
├── prisma/
│   ├── schema.prisma             # Schema do banco
│   └── migrations/               # Migrações
└── .env                          # Variáveis de ambiente
```

### Fluxo de Dados

```
Cliente (Browser)
    ↓
Next.js App Router (RSC)
    ↓
Server Actions (lib/actions/*.ts)
    ↓
Prisma ORM
    ↓
SQLite Database
    ↓
External APIs (GA4, OpenAI, Mercado Pago)
```

---

## 🔐 Fluxos Principais

### 1. Autenticação (NextAuth)

**Fluxo de Signup:**
1. Usuário acessa `/signup`
2. Preenche email, nome e senha
3. POST para `/api/auth/signup`
4. Sistema:
   - Valida dados com Zod
   - Verifica se email já existe
   - Hash de senha com bcrypt (10 rounds)
   - Cria `User`, `Workspace` e `WorkspaceMember`
   - Retorna sucesso
5. Redirect para `/login`

**Fluxo de Login:**
1. Usuário acessa `/login`
2. Preenche email e senha
3. NextAuth valida credenciais:
   - Busca usuário por email
   - Compara hash com bcrypt
   - Cria sessão JWT
4. Redirect para `/app` (dashboard)

**Proteção de Rotas:**
- Middleware do Next.js protege `/app/*`
- Server Actions verificam sessão com `getCurrentUser()`
- Workspaces isolados por RLS (workspace ownership)

---

### 2. Google Analytics 4 (OAuth + Vínculo)

**Fluxo de Conexão:**
1. Usuário acessa `/app/integrations`
2. Clica em "Conectar Google Analytics"
3. Redirect para `/api/integrations/google/authorize`
4. Sistema gera URL do Google OAuth com scopes:
   - `https://www.googleapis.com/auth/analytics.readonly`
5. Usuário autoriza no Google
6. Callback em `/api/integrations/google/callback`:
   - Troca code por access_token e refresh_token
   - Salva na tabela `GoogleConnection`
   - Calcula `expiresAt` (agora + expires_in)
7. Redirect de volta para `/app/integrations`

**Fluxo de Vínculo GA4 por Cliente:**
1. Usuário acessa `/app/clients/[clientId]`
2. Sistema busca properties GA4 via `listGA4Properties()`
3. Usuário seleciona property no dropdown
4. Salva `ga4PropertyId` e `ga4PropertyDisplay` no cliente
5. Ao gerar relatório, usa o property vinculado

**Refresh de Token:**
- Antes de cada chamada GA4, verifica `expiresAt`
- Se `expiresAt < now + 5 minutos`, chama `refreshAccessToken()`
- Atualiza `accessToken` e `expiresAt` no banco
- Se refresh falhar, usuário precisa reconectar

---

### 3. Geração de Relatório (GA4 + IA + Créditos)

**Fluxo Completo:**
1. Usuário acessa `/app/clients/[clientId]/reports/new`
2. Preenche datas (periodStart, periodEnd)
3. Submete formulário
4. Action `createReportAction()`:
   - Valida sessão e workspace
   - Valida datas (Zod)
   - Verifica se cliente existe e pertence ao workspace
   - Gera métricas:
     - Se cliente tem `ga4PropertyId` → chama `fetchGA4Metrics()` (PENDENTE)
     - Caso contrário → `generateFakeMetrics()`
   - Verifica créditos disponíveis:
     ```typescript
     const estimatedCost = 5
     const creditsAvailable = workspace.creditLimit - workspace.creditUsed
     if (creditsAvailable < estimatedCost) {
       throw new InsufficientCreditsError(...)
     }
     ```
   - Gera resumo com IA:
     - Chama `generateWithFallback(metrics, periodStart, periodEnd)`
     - Tenta providers na ordem: OpenAI → Anthropic → Google
     - Se um falha, automaticamente tenta o próximo
     - Retorna: { summary, provider, cost }
   - Salva relatório:
     ```typescript
     await prisma.report.create({
       data: {
         clientId,
         periodStart,
         periodEnd,
         rawDataJson: JSON.stringify(metrics),
         aiSummaryText: summary,
         aiModel: provider,
         costCredits: cost,
         useRealData: false  // true quando GA4 real
       }
     })
     ```
   - Consome créditos:
     ```typescript
     await prisma.workspace.update({
       where: { id: workspace.id },
       data: { creditUsed: { increment: cost } }
     })
     await prisma.creditLedger.create({
       data: {
         workspaceId: workspace.id,
         reportId: report.id,
         delta: -cost,
         reason: `Relatório gerado com ${provider}`
       }
     })
     ```
5. Redirect para `/app/reports/[reportId]`

**Visualização:**
- Página `/app/reports/[reportId]` mostra:
  - Período analisado
  - Métricas principais (sessões, usuários, conversões)
  - Resumo executivo da IA
  - Botões: "Exportar PDF", "Compartilhar", "Voltar"

---

### 4. Billing com Mercado Pago

**Estrutura de Planos:**
```typescript
const PLANS = {
  free: { name: 'Free', credits: 1000, price: 0 },
  pro: { name: 'Pro', credits: 5000, price: 97 },
  business: { name: 'Business', credits: 20000, price: 297 }
}
```

**Fluxo de Upgrade:**
1. Usuário acessa `/app/billing`
2. Clica em "Assinar Pro"
3. Action `upgradePlan('pro')`:
   - Cria preferência no Mercado Pago:
     ```typescript
     const preference = await createPreference({
       title: 'Reliora Pro - Assinatura Mensal',
       amount: 97,
       metadata: {
         workspaceId,
         type: 'subscription',
         plan: 'pro'
       }
     })
     ```
   - Retorna `init_point` (URL de pagamento)
4. Redirect para Mercado Pago
5. Usuário completa pagamento
6. Mercado Pago envia webhook para `/api/billing/webhook`:
   - Valida assinatura com `validateWebhookSignature()`
   - Busca payment info via `getPaymentInfo(paymentId)`
   - Se `status === 'approved'`:
     - Atualiza workspace:
       ```typescript
       await prisma.workspace.update({
         where: { id: metadata.workspaceId },
         data: {
           plan: 'pro',
           creditLimit: 5000,
           creditUsed: 0,
           creditPeriodStart: new Date()
         }
       })
       ```
     - Registra no `PaymentHistory`
     - Cria entry no `CreditLedger`
7. Usuário retorna para `/app/billing` e vê plano atualizado

**Compra Avulsa de Créditos:**
- Similar ao upgrade, mas `type: 'credits'`
- Incrementa `creditLimit` ao invés de resetar
- Não altera `plan`

---

## 🗄️ Banco de Dados (Prisma Schema)

### Tabelas Principais

#### User
```prisma
model User {
  id               String
  email            String @unique
  name             String?
  passwordHash     String
  createdAt        DateTime
}
```
- Usuários do sistema
- Hash de senha com bcrypt
- Relacionamento 1:N com WorkspaceMember

#### Workspace
```prisma
model Workspace {
  id                   String
  name                 String
  creditLimit          Int @default(1000)
  creditUsed           Int @default(0)
  creditPeriodStart    DateTime @default(now())
  plan                 String?  # 'free', 'pro', 'business'
  stripeCustomerId     String?
  stripeSubscriptionId String?
}
```
- Multi-tenant: cada workspace é isolado
- Controle de créditos (limite, usado, período)
- Plano atual

#### Client
```prisma
model Client {
  id                  String
  workspaceId         String
  name                String
  notes               String?
  ga4PropertyId       String?  # Vínculo com GA4
  ga4PropertyDisplay  String?  # Nome da property
  createdAt           DateTime
}
```
- Clientes do workspace
- Vínculo opcional com property GA4

#### Report
```prisma
model Report {
  id            String
  clientId      String
  periodStart   DateTime
  periodEnd     DateTime
  rawDataJson   String      # Métricas em JSON
  aiSummaryText String      # Resumo da IA
  aiModel       String?     # 'OpenAI', 'Anthropic', 'Google'
  costCredits   Int?        # Custo em créditos
  useRealData   Boolean @default(false)
  createdAt     DateTime
}
```
- Relatórios gerados
- Armazena métricas e resumo

#### GoogleConnection
```prisma
model GoogleConnection {
  id           String @id
  workspaceId  String @unique
  accessToken  String
  refreshToken String
  expiresAt    DateTime
}
```
- Tokens OAuth2 do Google
- Um por workspace

#### CreditLedger
```prisma
model CreditLedger {
  id          String
  workspaceId String
  reportId    String?
  delta       Int        # Negativo = consumo, positivo = adição
  reason      String     # Ex: "Relatório gerado com OpenAI"
  createdAt   DateTime
}
```
- Histórico de consumo/adição de créditos
- Auditoria completa

#### PaymentHistory
```prisma
model PaymentHistory {
  id                String
  workspaceId       String
  type              String     # 'subscription', 'credits'
  amount            Float
  currency          String @default("BRL")
  status            String     # 'pending', 'approved', 'cancelled'
  externalId        String?    # ID do Mercado Pago
  plan              String?
  creditsAdded      Int?
  metadata          String?    # JSON
  createdAt         DateTime
}
```
- Histórico de pagamentos
- Rastreamento de transações do Mercado Pago

#### PublicReport
```prisma
model PublicReport {
  id        String
  reportId  String @unique
  token     String @unique  # UUID aleatório
  createdAt DateTime
  revokedAt DateTime?       # Null = ativo
}
```
- Links públicos de relatórios
- Acesso sem autenticação via token

---

## 🛣️ Rotas do App Router

### Páginas Públicas
- `/` - Landing page
- `/login` - Login
- `/signup` - Cadastro
- `/public/reports/[token]` - Relatório público (sem auth)

### Páginas Autenticadas (`/app/*`)
- `/app` - Dashboard
- `/app/clients` - Listagem de clientes
- `/app/clients/new` - Criar cliente
- `/app/clients/[clientId]` - Detalhes do cliente
- `/app/clients/[clientId]/reports/new` - Gerar relatório
- `/app/reports/[reportId]` - Visualizar relatório
- `/app/credits` - Gestão de créditos
- `/app/billing` - Planos e pagamentos
- `/app/integrations` - Conexões (GA4)
- `/app/account` - Configurações de conta

### API Routes
- `/api/auth/[...nextauth]` - NextAuth (login, logout, session)
- `/api/auth/signup` - Criar conta
- `/api/waitlist` - Landing page (newsletter)
- `/api/integrations/google/authorize` - Iniciar OAuth GA4
- `/api/integrations/google/callback` - Callback OAuth GA4
- `/api/integrations/google/disconnect` - Desconectar GA4
- `/api/billing/webhook` - Webhook Mercado Pago
- `/api/reports/[reportId]/export-pdf` - Exportar PDF
- `/api/cron/refresh-tokens` - Job de refresh de tokens GA4

---

## 🚀 Guia de Deploy

### Pré-requisitos

1. **Conta Netlify** (ou Vercel)
2. **Banco de dados PostgreSQL** (Supabase recomendado)
3. **Contas de serviços:**
   - Google Cloud (OAuth + GA4 API)
   - OpenAI / Anthropic / Google AI (pelo menos uma)
   - Mercado Pago (produção)

### Passos de Deploy

#### 1. Configurar Google OAuth
```bash
# Google Cloud Console
1. Criar projeto
2. Habilitar APIs:
   - Google Analytics Data API
   - Google Analytics Admin API
3. Criar credenciais OAuth 2.0:
   - Tipo: Web application
   - Redirect URI: https://seu-dominio.com/api/integrations/google/callback
4. Copiar Client ID e Client Secret
```

#### 2. Configurar Mercado Pago
```bash
# Mercado Pago Dashboard
1. Criar aplicação
2. Copiar Access Token (produção)
3. Configurar Webhook URL:
   - https://seu-dominio.com/api/billing/webhook
4. Gerar Webhook Secret
```

#### 3. Migrar Banco de Dados
```bash
# Atualizar schema do Prisma para PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Rodar migrações
npx prisma migrate deploy
npx prisma generate
```

#### 4. Configurar Variáveis de Ambiente
```bash
# No Netlify/Vercel, adicionar:
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>

# IA (pelo menos uma)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Google OAuth
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://seu-dominio.com/api/integrations/google/callback

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=...

# App
PUBLIC_URL=https://seu-dominio.com
```

#### 5. Build e Deploy
```bash
# Local
npm run build
npm run typecheck

# Push para Git
git push origin main

# Netlify/Vercel faz deploy automático
```

#### 6. Configurar Domínio
```bash
# Netlify
1. Adicionar domínio customizado
2. Configurar DNS (CNAME ou A record)
3. Habilitar HTTPS (automático)
```

#### 7. Testar em Produção
```bash
# Checklist
- [ ] Criar conta
- [ ] Login/logout
- [ ] Conectar GA4
- [ ] Criar cliente
- [ ] Gerar relatório
- [ ] Comprar créditos (sandbox primeiro)
- [ ] Webhook recebido e processado
- [ ] Export PDF funcional
```

---

## 🔧 Variáveis de Ambiente

### Essenciais (Obrigatórias)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/reliora"

# NextAuth
NEXTAUTH_URL="https://reliora.com"
NEXTAUTH_SECRET="<secret-unico-32-chars>"

# IA (pelo menos uma)
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-api03-..."
GOOGLE_API_KEY="AIzaSy..."

# Google OAuth
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_REDIRECT_URI="https://reliora.com/api/integrations/google/callback"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
MERCADOPAGO_WEBHOOK_SECRET="<webhook-secret>"

# App
PUBLIC_URL="https://reliora.com"
```

### Opcionais (Configuração Avançada)

```bash
# IA - Modelos específicos
AI_PROVIDER="anthropic"  # 'openai' | 'anthropic' | 'google'
AI_MODEL="claude-3-5-sonnet-20241022"
OPENAI_MODEL="gpt-4o-mini"
ANTHROPIC_MODEL="claude-3-haiku-20240307"
GOOGLE_AI_MODEL="gemini-pro"

# IA - URLs customizadas (proxies)
OPENAI_API_BASE="https://api.openai.com/v1"
ANTHROPIC_API_BASE="https://api.anthropic.com"
GOOGLE_API_BASE="https://generativelanguage.googleapis.com"

# Google OAuth
GOOGLE_OAUTH_AUTH="https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_OAUTH_TOKEN="https://oauth2.googleapis.com/token"
GOOGLE_SCOPES="https://www.googleapis.com/auth/analytics.readonly"

# Créditos - Custos por modelo
CREDIT_LIMIT_DEFAULT="1000"
CREDIT_COST_GPT4O_MINI="1"
CREDIT_COST_GPT4="10"
CREDIT_COST_CLAUDE_SONNET="5"
CREDIT_COST_CLAUDE_HAIKU="2"
CREDIT_COST_GEMINI_PRO="3"
CREDIT_COST_GEMINI_FLASH="1"

# Produção
REQUIRE_REAL_DATA="false"  # true = bloqueia geração sem GA4 real
NODE_ENV="production"
```

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev           # Iniciar dev server (localhost:3000)
npm run build         # Build para produção
npm run start         # Rodar build localmente
npm run typecheck     # Verificar erros TypeScript
npm run lint          # ESLint
```

### Prisma
```bash
npx prisma studio              # Interface visual do banco
npx prisma migrate dev         # Criar migração (dev)
npx prisma migrate deploy      # Aplicar migrações (prod)
npx prisma generate            # Gerar cliente Prisma
npx prisma db push             # Push schema sem migração (dev)
npx prisma db seed             # Rodar seed (se configurado)
```

### Debug
```bash
# Logs do Next.js
npm run dev -- --turbo  # Usar Turbopack (mais rápido)

# Logs de produção (Netlify)
netlify logs:function webhook  # Ver logs da função

# Inspecionar banco
psql $DATABASE_URL
```

---

## 📚 Referências

### Documentação Oficial
- [Next.js 13 App Router](https://nextjs.org/docs/app)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Mercado Pago API](https://www.mercadopago.com.br/developers/pt/docs)
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Anthropic API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Google AI (Gemini)](https://ai.google.dev/docs)

### Ferramentas
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Zod Validation](https://zod.dev)

---

## 🆘 Troubleshooting

### Build falhando
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Tokens GA4 expirando
```bash
# Verificar no banco
SELECT * FROM "GoogleConnection" WHERE "expiresAt" < NOW();

# Implementar refresh automático (TODO)
```

### Webhook não recebendo
```bash
# Testar localmente com ngrok
ngrok http 3000
# Atualizar URL no Mercado Pago Dashboard
```

### Créditos não sendo consumidos
```bash
# Verificar CreditLedger
SELECT * FROM "CreditLedger" WHERE "workspaceId" = '...';

# Verificar Workspace
SELECT "creditUsed", "creditLimit" FROM "Workspace" WHERE id = '...';
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consultar esta documentação
2. Verificar logs de produção
3. Revisar issues no GitHub (se aplicável)
4. Contatar equipe de desenvolvimento

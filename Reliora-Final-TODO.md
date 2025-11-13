# Reliora - TODO para MVP

## 📊 Status Atual

### ✅ Implementado (Base Sólida)

**Autenticação e Multi-tenant**
- Auth completo (NextAuth + bcrypt + validação)
- Multi-tenant com RLS (Workspace, WorkspaceMember)
- Pages: login, signup, dashboard, clients, account, integrations

**Estrutura de Dados**
- Schema Supabase completo com RLS ativo
- Tabelas: Workspace, Client, Report, GoogleConnection, Ga4ReportCache, PublicReport, CreditLedger

**Funcionalidades Core**
- CRUD de clientes (server actions)
- Sistema de créditos básico
- Multi-provider IA (OpenAI, Anthropic, Google)
- Google OAuth flow (authorize, callback, disconnect)
- API /api/waitlist funcional
- Build sem erros TypeScript

**Placeholders**
- Dashboard com métricas fake
- Relatórios com dados simulados
- Estrutura de integração GA4 preparada

---

## 🎯 Checklist MVP - 20 Passos Críticos

### 🔴 Fase 1: Core Funcional (Passos 1-7)

- [ ] **1. IA Real Funcionando**
  - Melhorar prompt em `lib/ai/summary.ts`
  - Testar com GPT-4, Claude e Gemini
  - Adicionar tratamento de erro e fallback

- [ ] **2. GA4 API Real**
  - Implementar `fetchGA4Metrics()` em `lib/google/ga4.ts`
  - Usar Google Analytics Data API
  - Mapper de métricas GA4 → formato interno

- [ ] **3. Geração de Relatório Completa**
  - Atualizar `app/(app)/app/clients/[clientId]/reports/new/actions.ts`
  - Verificar ga4PropertyId do cliente
  - Chamar GA4 real ou fake (com fallback)
  - Consumir créditos via `ensureCreditsAndConsume()`
  - Salvar Report com `useRealData=true`

- [ ] **4. Vínculo GA4 por Cliente**
  - Campo "GA4 Property ID" em `/app/clients/[clientId]`
  - Dropdown com properties do workspace
  - Salvar `ga4PropertyId` e `ga4PropertyDisplay`

- [ ] **5. Sistema de Créditos**
  - **Criar:** `app/(app)/app/credits/page.tsx`
  - Mostrar: uso atual, limite, data de reset
  - Histórico de consumo (CreditLedger)
  - Botão "Comprar mais créditos"

- [ ] **6. Billing Mercado Pago**
  - **Criar:** `app/(app)/app/billing/page.tsx`
  - Planos: Free (1K créditos), Pro (5K/R$97), Business (20K/R$297)
  - **APIs:** create-subscription, webhook, history
  - **Tabela:** PaymentHistory no Supabase
  - Webhook atualiza plan e créditos

- [ ] **7. Dashboard Real**
  - Métricas reais: total clientes, relatórios, créditos usados
  - Últimos 5 relatórios
  - Alertas: créditos baixos, GA4 desconectado
  - Botão "Gerar novo relatório"

### 🟡 Fase 2: UX Profissional (Passos 8-11)

- [ ] **8. Loading States**
  - Spinners em botões de submit
  - Skeleton loaders em listas
  - Progress na geração de relatório (3-10s)

- [ ] **9. Toast Notifications**
  - Sucesso (verde), erro (vermelho), info (azul)
  - Feedback em todas as ações
  - Consistência visual

- [ ] **10. Empty States**
  - "Nenhum cliente" → "Adicionar primeiro cliente"
  - "GA4 desconectado" → "Conectar agora"
  - CTAs claros em estados vazios

- [ ] **11. Confirmações**
  - Confirmar antes de deletar cliente/relatório
  - Avisar se cliente tem relatórios vinculados

### 🔒 Fase 3: Segurança e Validação (Passos 12-14)

- [ ] **12. Validação Zod**
  - Schemas em todas as server actions
  - Validação client-side em forms
  - Sanitização de inputs

- [ ] **13. Verificação de Permissões**
  - `getServerSession()` em todas as actions
  - Verificar workspace ownership
  - Logs de tentativas não autorizadas

- [ ] **14. Rate Limiting**
  - **Instalar:** `@upstash/ratelimit` + Upstash Redis
  - 10 relatórios/hora por workspace
  - 50 clientes/hora por workspace

### 🔗 Fase 4: Integrações (Passos 15-17)

- [ ] **15. Refresh Automático GA4**
  - Verificar `expiresAt` antes de cada chamada
  - `refreshAccessToken()` se < 5min
  - **Criar:** `lib/google/refresh-token.ts`

- [ ] **16. Webhook Mercado Pago**
  - Validar signature do MP
  - Atualizar Workspace.plan
  - Adicionar créditos se compra avulsa
  - Inserir em PaymentHistory

- [ ] **17. Listagem Properties GA4**
  - Implementar `listGA4Properties()` em `lib/google/ga4.ts`
  - Mostrar em `/app/integrations`
  - Google Analytics Admin API

### 🚀 Fase 5: Extras MVP (Passos 18-20)

- [ ] **18. Relatório Público**
  - **Criar:** `app/public/reports/[token]/page.tsx`
  - `generatePublicLink(reportId)` → UUID token
  - Página sem header/sidebar
  - Botão "Compartilhar" e "Revogar"

- [ ] **19. Export PDF**
  - **Instalar:** `puppeteer-core` ou `jspdf`
  - Botão "Exportar PDF"
  - **API:** `/api/reports/[reportId]/export-pdf`

- [ ] **20. Deploy Produção**
  - Configurar variáveis na Netlify
  - Domínio customizado + SSL
  - Testar: `npm run build && npm run typecheck`
  - Google OAuth redirect_uri correto
  - MP webhook URL correto

---

## 📂 Arquivos a Criar

### Alta Prioridade

```
app/(app)/app/
├── credits/page.tsx              # Sistema de créditos
├── billing/page.tsx              # Planos e pagamentos
└── logs/page.tsx                 # Auditoria (opcional)

app/public/reports/
├── [token]/page.tsx              # Relatório público
└── [token]/not-found.tsx

app/api/
├── billing/
│   ├── create-subscription/route.ts
│   ├── webhook/route.ts
│   └── history/route.ts
├── reports/[reportId]/
│   └── export-pdf/route.ts
└── cron/
    └── refresh-tokens/route.ts

lib/
├── actions/
│   ├── credits.ts                # getCreditHistory, getCreditState
│   ├── billing.ts                # upgradePlan, buyCredits
│   └── reports.ts                # generatePublicLink, getPublicReport
├── billing/
│   └── mercadopago.ts            # Helpers MP
├── google/
│   └── refresh-token.ts          # Refresh automático
├── pdf/
│   └── generator.ts              # Puppeteer helper
├── errors.ts                     # Classes de erro
└── audit.ts                      # Logs de auditoria

components/
└── credit-badge.tsx              # Badge de créditos no header

supabase/migrations/
├── add_payment_history.sql
└── add_audit_log.sql
```

---

## 🔧 Arquivos a Modificar

### Críticos

- `app/(app)/app/page.tsx` - Dashboard com métricas reais
- `app/(app)/app/clients/[clientId]/page.tsx` - Vínculo GA4
- `app/(app)/app/clients/[clientId]/reports/new/actions.ts` - IA + GA4 real
- `app/(app)/app/integrations/page.tsx` - Listar properties GA4
- `lib/ai/summary.ts` - Prompt melhorado
- `lib/google/ga4.ts` - fetchGA4Metrics + listGA4Properties
- `lib/actions/clients.ts` - updateClientGA4

### Todos os componentes com forms/actions
- Adicionar loading states
- Adicionar validação Zod
- Adicionar verificação de permissões

---

## 🌍 Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=https://reliora.com
NEXTAUTH_SECRET=

# IA (pelo menos uma)
AI_PROVIDER=google
GOOGLE_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
AI_MODEL=gemini-2.0-flash-exp

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# App
NEXT_PUBLIC_APP_URL=https://reliora.com

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 📦 Dependências a Instalar

```bash
# Validação e segurança
npm install zod @upstash/ratelimit @upstash/redis

# PDF (escolher uma)
npm install puppeteer-core @sparticuz/chromium
# OU
npm install jspdf html2canvas

# Mercado Pago SDK
npm install mercadopago
```

---

## 🎨 Melhorias de UX

### Loading States
- [ ] Spinner em botões durante submit
- [ ] Skeleton loaders em: clientes, relatórios, dashboard
- [ ] Progress indicator na geração de relatório
- [ ] Disable de botões durante loading

### Feedback Visual
- [ ] Toast verde (sucesso)
- [ ] Toast vermelho (erro)
- [ ] Toast azul (info)
- [ ] Animações suaves (fade in/out)

### Estados Vazios
- [ ] Empty state com ilustração + CTA
- [ ] "Nenhum cliente cadastrado"
- [ ] "Nenhum relatório gerado"
- [ ] "GA4 não conectado"

### Navegação
- [ ] Breadcrumbs em todas as páginas
- [ ] Página 404 customizada
- [ ] Página de erro customizada

---

## 🔒 Segurança - Checklist

- [ ] Senhas com bcrypt (10 rounds) ✅
- [ ] Sessões NextAuth seguras ✅
- [ ] RLS ativo em todas as tabelas ✅
- [ ] Validação Zod em server actions
- [ ] Verificação de workspace em actions
- [ ] Rate limiting em endpoints críticos
- [ ] API keys apenas server-side ✅
- [ ] HTTPS forçado em produção
- [ ] CORS configurado
- [ ] Sanitização de inputs
- [ ] Logs de acesso não autorizado

---

## 🧪 Testes Antes do Deploy

### Build e Type Check
```bash
npm run build
npm run typecheck
npm run lint
```

### Testes Funcionais
- [ ] Signup → Login → Dashboard
- [ ] Criar cliente → Gerar relatório
- [ ] Conectar GA4 → Vincular property
- [ ] Comprar créditos → Upgrade de plano
- [ ] Compartilhar relatório → Acessar link público
- [ ] Export PDF do relatório
- [ ] Desconectar GA4

### Testes de Segurança
- [ ] Tentar acessar workspace de outro usuário
- [ ] Gerar 20 relatórios seguidos (rate limit)
- [ ] Acessar relatório sem permissão
- [ ] Token público expirado/inválido

---

## 📊 Priorização por Impacto

### 🔥 Imprescindível (Bloqueia MVP)
1-7, 12-14, 20

### ⚡ Importante (Melhora MVP)
8-11, 15-17

### 💡 Bom ter (Pós-lançamento)
18-19, logs/auditoria, página 404/error customizada

---

## 🚀 Roteiro de Implementação

### Sprint 1 (1 semana)
- Passos 1-7: Core funcional
- IA + GA4 + Créditos + Billing + Dashboard

### Sprint 2 (3 dias)
- Passos 8-14: UX + Segurança
- Loading, toast, validação, rate limit

### Sprint 3 (2 dias)
- Passos 15-17: Integrações
- Refresh GA4, webhook MP, listagem properties

### Sprint 4 (2 dias)
- Passos 18-20: Extras + Deploy
- Relatório público, PDF, produção

**Total estimado: 12 dias úteis para MVP completo**

---

## ✅ Critério de Sucesso

**MVP pronto quando:**
- ✅ User pode gerar relatório real com GA4 + IA
- ✅ User pode comprar créditos e fazer upgrade
- ✅ User pode vincular propriedades GA4
- ✅ Sistema seguro e validado
- ✅ UX profissional com feedback claro
- ✅ Deploy em produção estável
- ✅ Todos os 20 passos concluídos

---

**Status:** 📍 Base implementada | 🎯 20 passos para MVP | 🚀 12 dias para lançamento
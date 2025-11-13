# Reliora - TODO Final para MVP

## 1. Resumo do que está pronto

✅ Landing page completa com seções hero, benefícios, público-alvo, CTA, FAQ
✅ Auth com NextAuth (signup/login/logout) + bcrypt + validação de senha
✅ Multi-tenant com RLS completo (Workspace, WorkspaceMember)
✅ CRUD de clientes com server actions
✅ Páginas /app: dashboard, /app/clients, /app/clients/[clientId], /app/account, /app/integrations
✅ Schema Supabase completo: Workspace, Client, Report, GoogleConnection, Ga4ReportCache, PublicReport, CreditLedger
✅ RLS ativo em todas as tabelas
✅ API /api/waitlist funcional
✅ Dashboard básico com métricas fake
✅ Placeholder de relatórios com métricas fake e IA fake
✅ Multi-provider IA configurado (OpenAI, Anthropic, Google) em lib/ai/summary.ts
✅ Sistema de créditos básico (getCurrentCreditState, ensureCreditsAndConsume, maybeResetCreditPeriod)
✅ Google OAuth flow (/api/integrations/google/authorize, callback, disconnect)
✅ Estrutura de integração GA4 (lib/google/ga4.ts, ga4-mapping.ts)
✅ Build funcional sem erros TypeScript

---

## 2. Lista completa do que falta implementar

### 2.1 Geração Real de Relatórios

**Arquivos a modificar:**
- `app/(app)/app/clients/[clientId]/reports/new/actions.ts` - substituir fake por real
- `lib/ai/summary.ts` - prompt melhorado e real
- `lib/google/ga4.ts` - implementar fetchGA4Metrics completo

**O que fazer:**
1. Implementar fetchGA4Metrics real usando Google Analytics Data API
2. Criar ga4-to-metrics mapper real (lib/google/ga4-mapping.ts já existe)
3. Atualizar generateReport action para:
   - Verificar se cliente tem ga4PropertyId
   - Buscar connection do workspace
   - Chamar GA4 real ou fake (fallback)
   - Chamar IA real com prompt melhorado
   - Consumir créditos via ensureCreditsAndConsume
   - Salvar Report com aiModel, costCredits, useRealData=true
4. Adicionar loading state na UI durante geração (3-10s)
5. Tratamento de erro se GA4 falhar (fallback para fake + aviso)

### 2.2 Sistema de Créditos Completo

**Já existe em lib/credits.ts, mas falta:**
1. Página /app/credits para visualizar:
   - Uso atual vs limite
   - Data de reset
   - Histórico de consumo (CreditLedger)
   - Botão "Comprar mais créditos"
2. Componente CreditBadge no header mostrando saldo
3. Bloqueio de geração quando créditos acabarem
4. Notificação quando < 20% de créditos

**Arquivos a criar:**
- `app/(app)/app/credits/page.tsx`
- `components/credit-badge.tsx`
- `lib/actions/credits.ts` (getCreditHistory)

### 2.3 Página Pública do Relatório

**O que fazer:**
1. Criar rota `app/public/reports/[token]/page.tsx`
2. Criar action generatePublicLink(reportId) em lib/actions/reports.ts
   - Gera token UUID
   - Insere em PublicReport
   - Retorna URL pública
3. Criar action getPublicReport(token)
   - Busca PublicReport + Report + Client (sem workspace check)
   - Retorna dados públicos (sem custos, sem info sensível)
4. Adicionar botão "Compartilhar" no relatório
5. Página pública com:
   - Branding do workspace (logo, cores)
   - Métricas do relatório
   - Resumo da IA
   - Rodapé "Powered by Reliora"
   - Sem header/sidebar
6. Adicionar botão "Revogar link" no relatório privado

**Arquivos a criar:**
- `app/public/reports/[token]/page.tsx`
- `app/public/reports/[token]/not-found.tsx`
- `lib/actions/reports.ts` (generatePublicLink, revokePublicLink, getPublicReport)

### 2.4 Dashboard Finalizado

**Melhorar app/(app)/app/page.tsx:**
1. Cards com métricas reais do workspace:
   - Total de clientes
   - Total de relatórios
   - Créditos usados este mês
   - Último relatório gerado
2. Gráfico de consumo de créditos (últimos 30 dias)
3. Lista de últimos 5 relatórios gerados
4. Botão rápido "Gerar novo relatório"
5. Alertas:
   - Se créditos < 20%
   - Se GA4 desconectado
   - Se nenhum cliente cadastrado

**Arquivos a modificar:**
- `app/(app)/app/page.tsx`

### 2.5 Billing com Mercado Pago

**O que fazer:**
1. Criar página /app/billing
   - Plano atual
   - Histórico de pagamentos
   - Botão "Alterar plano"
   - Botão "Comprar créditos avulsos"
2. Criar planos em config:
   - Free: 1000 créditos/mês, 3 clientes
   - Pro: 5000 créditos/mês, ilimitado, R$ 97/mês
   - Business: 20000 créditos/mês, ilimitado, R$ 297/mês
3. Integração Mercado Pago:
   - POST /api/billing/create-subscription (cria preferência MP)
   - POST /api/billing/webhook (recebe notificações MP)
   - GET /api/billing/history (lista pagamentos)
4. Criar tabela PaymentHistory no Supabase:
   - workspaceId, amount, status, mpPaymentId, type (subscription|credits), createdAt
5. Webhook MP atualiza:
   - Workspace.plan
   - Workspace.stripeCustomerId → mpCustomerId
   - Workspace.creditLimit (se compra avulsa: +créditos)
   - Insere em PaymentHistory
6. Server action upgradePlan(plan) e buyCredits(amount)

**Arquivos a criar:**
- `app/(app)/app/billing/page.tsx`
- `app/api/billing/create-subscription/route.ts`
- `app/api/billing/webhook/route.ts`
- `app/api/billing/history/route.ts`
- `lib/billing/mercadopago.ts` (helpers)
- `lib/actions/billing.ts`
- Migration: `supabase/migrations/add_payment_history.sql`

**Variáveis de ambiente necessárias:**
```
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
NEXT_PUBLIC_APP_URL=https://reliora.com
```

### 2.6 GA4 OAuth + Conexão + Vínculo por Cliente

**Já existe OAuth flow, mas falta:**
1. Melhorar /app/integrations:
   - Mostrar se conectado
   - Listar propriedades GA4 disponíveis
   - Botão "Desconectar"
2. Implementar listGA4Properties(workspaceId) em lib/google/ga4.ts
   - Usa accessToken do GoogleConnection
   - Chama Google Analytics Admin API
   - Retorna lista de properties
3. Em /app/clients/[clientId]:
   - Campo "Vincular GA4 Property"
   - Dropdown com properties disponíveis
   - Salva ga4PropertyId e ga4PropertyDisplay no Client
4. Refresh automático do token:
   - Criar lib/google/refresh-token.ts
   - Antes de cada chamada GA4, verificar expiresAt
   - Se < 5min, refresh token

**Arquivos a modificar:**
- `app/(app)/app/integrations/page.tsx`
- `app/(app)/app/clients/[clientId]/page.tsx`
- `lib/google/ga4.ts` (adicionar listGA4Properties)
- `lib/google/oauth.ts` (adicionar refreshAccessToken)
- `lib/actions/clients.ts` (adicionar updateClientGA4)

### 2.7 Webhooks

**Webhooks necessários:**
1. Mercado Pago (já mencionado em 2.5)
2. Google Token Refresh via cron:
   - Criar edge function no Supabase ou route /api/cron/refresh-tokens
   - Roda a cada 30min
   - Busca GoogleConnections com expiresAt < 1h
   - Faz refresh preventivo

**Arquivos a criar:**
- `app/api/cron/refresh-tokens/route.ts`

### 2.8 Exportar Relatório em PDF

**O que fazer:**
1. Instalar: `npm install puppeteer-core @sparticuz/chromium`
2. Criar API route POST /api/reports/[reportId]/export-pdf
   - Recebe reportId
   - Verifica permissão (workspace do user = workspace do report)
   - Gera HTML do relatório (server-side)
   - Usa puppeteer + chromium para renderizar PDF
   - Retorna PDF como download
3. Adicionar botão "Exportar PDF" na página do relatório
4. Considerar usar link público temporário (gera token, puppeteer acessa /public/reports/[token])

**Arquivos a criar:**
- `app/api/reports/[reportId]/export-pdf/route.ts`
- `lib/pdf/generator.ts` (helper puppeteer)

**Alternativa mais simples:**
- Usar lib client-side como `jspdf` ou `html2canvas`
- Botão exporta no browser (sem custo servidor)

### 2.9 Logs e Auditoria

**O que fazer:**
1. Criar tabela AuditLog:
   - id, workspaceId, userId, action, entity, entityId, details (JSONB), createdAt
2. Middleware para registrar ações:
   - report_generated
   - client_created, client_updated, client_deleted
   - credits_consumed
   - plan_upgraded
   - ga4_connected, ga4_disconnected
3. Página /app/logs para admin:
   - Filtrar por ação, período
   - Visualizar detalhes JSON

**Arquivos a criar:**
- Migration: `supabase/migrations/add_audit_log.sql`
- `lib/audit.ts` (logAction helper)
- `app/(app)/app/logs/page.tsx` (opcional)

### 2.10 Melhorias de UX

**O que fazer:**
1. Loading states em todas as ações:
   - Botões com spinner durante submit
   - Skeleton loaders em listas
2. Toast notifications consistentes:
   - Sucesso (verde)
   - Erro (vermelho)
   - Info (azul)
3. Empty states:
   - "Nenhum cliente cadastrado" com botão "Adicionar primeiro cliente"
   - "Nenhum relatório gerado" com botão "Gerar primeiro relatório"
   - "GA4 não conectado" com botão "Conectar agora"
4. Confirmação antes de deletar:
   - Cliente (avisa se tem relatórios)
   - Relatório
5. Breadcrumbs em todas as páginas internas
6. Página 404 customizada
7. Página de erro customizada

**Arquivos a modificar:**
- Todos os componentes client com forms/buttons
- `app/not-found.tsx`
- `app/error.tsx`
- `components/ui/breadcrumb.tsx` (já existe)

### 2.11 Segurança, Validação e Proteção de Server Actions

**O que fazer:**
1. Validação com Zod em todas as server actions:
   - createClient, updateClient, deleteClient
   - generateReport
   - upgradePlan, buyCredits
2. Rate limiting:
   - Instalar `@upstash/ratelimit` + Upstash Redis (gratuito)
   - Limitar geração de relatórios: 10/hora por workspace
   - Limitar criação de clientes: 50/hora por workspace
3. CSRF protection:
   - Next.js já protege forms com actions
   - Garantir que POST APIs verificam origin
4. Sanitização de inputs:
   - Nomes de clientes (limitar caracteres especiais)
   - Notas de clientes (prevenir XSS se renderizadas)
5. Verificar permissões em TODAS as actions:
   - getServerSession → pegar workspaceId via WorkspaceMember
   - Verificar que recurso pertence ao workspace
6. Logs de tentativas de acesso não autorizado

**Arquivos a modificar:**
- Todas as server actions em lib/actions/
- Todas as API routes em app/api/

**Instalar:**
```bash
npm install @upstash/ratelimit @upstash/redis zod
```

### 2.12 Centralização dos Providers de IA

**Já está em lib/ai/summary.ts, mas melhorar:**
1. Criar lib/ai/providers.ts:
   - getProvider(provider: string) → retorna classe Provider
   - Interface Provider com método .generateSummary()
   - Classes OpenAIProvider, AnthropicProvider, GoogleProvider
2. Adicionar fallback automático:
   - Se provider principal falhar, tentar segundo provider
   - Ordem: google → anthropic → openai
3. Logging de qual provider foi usado
4. Custo estimado em créditos por provider/modelo

**Arquivos a modificar:**
- `lib/ai/summary.ts`

**Arquivos a criar:**
- `lib/ai/providers.ts`
- `lib/ai/costs.ts` (tabela de custos por modelo)

### 2.13 Tratamento Global de Erros

**O que fazer:**
1. Criar error boundary global em app/error.tsx
2. Criar lib/errors.ts com classes de erro:
   - AppError (base)
   - UnauthorizedError
   - NotFoundError
   - ValidationError
   - RateLimitError
   - InsufficientCreditsError
   - ExternalAPIError (GA4, IA, etc)
3. Handler global de erros em server actions:
   - Captura erro
   - Loga no console com contexto
   - Retorna mensagem amigável ao user
   - Se crítico, notifica admin (email/Slack)
4. Sentry ou similar para produção (opcional)

**Arquivos a criar:**
- `lib/errors.ts`
- `lib/error-handler.ts`

**Arquivos a modificar:**
- `app/error.tsx`
- Todas as server actions

### 2.14 Requisitos de Produção

**Variáveis de ambiente obrigatórias:**
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=https://reliora.com
NEXTAUTH_SECRET=

# IA (pelo menos um)
AI_PROVIDER=google
GOOGLE_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Google OAuth (GA4)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# App
NEXT_PUBLIC_APP_URL=https://reliora.com

# Rate Limiting (opcional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**Checklist produção:**
- [ ] Todas as variáveis configuradas no Netlify
- [ ] HTTPS forçado
- [ ] CORS configurado (se necessário)
- [ ] Rate limiting ativo
- [ ] Logs de erro configurados
- [ ] Backup do Supabase ativo
- [ ] Domínio customizado
- [ ] SSL válido
- [ ] Google OAuth redirect_uri correto
- [ ] Mercado Pago webhook URL correto
- [ ] Testar build: `npm run build`
- [ ] Testar typecheck: `npm run typecheck`

---

## 3. Separação por nível de urgência

### 🔴 URGÊNCIA ALTA (necessário para lançar)

1. Geração real de relatórios com IA real (2.1)
2. GA4 OAuth funcionando + vincular property no cliente (2.6)
3. Sistema de créditos completo com página (2.2)
4. Billing com Mercado Pago (2.5)
5. Dashboard finalizado com métricas reais (2.4)
6. Validação e segurança em server actions (2.11)
7. Loading states e toast notifications (2.10 - parcial)
8. Requisitos de produção: variáveis + build (2.14)
9. Tratamento de erros básico (2.13 - parcial)
10. Refresh automático do token GA4 (2.6 - parcial)

### 🟡 URGÊNCIA MÉDIA (melhora o MVP)

11. Página pública do relatório (2.3)
12. Exportar relatório em PDF (2.8)
13. Melhorias de UX: empty states, confirmações (2.10 - restante)
14. Centralização dos providers de IA com fallback (2.12)
15. Rate limiting (2.11 - parcial)
16. Página de créditos com histórico detalhado (2.2 - parcial)
17. Webhook de refresh de tokens via cron (2.7)

### 🟢 URGÊNCIA BAIXA (pós-lançamento)

18. Logs e auditoria completos com página (2.9)
19. Página 404 e error customizadas (2.10 - parcial)
20. Integração com Sentry (2.13 - parcial)
21. Melhorias de performance (caching de GA4, otimização de queries)
22. Testes automatizados
23. Documentação interna para devs

---

## 4. Lista das páginas e rotas que ainda precisam existir

### Páginas frontend que faltam:

**ALTA URGÊNCIA:**
- ✅ `app/(app)/app/page.tsx` - existe mas precisa de melhorias
- 🔴 `app/(app)/app/credits/page.tsx` - CRIAR
- 🔴 `app/(app)/app/billing/page.tsx` - CRIAR
- ✅ `app/(app)/app/integrations/page.tsx` - existe mas precisa melhorar
- ✅ `app/(app)/app/clients/[clientId]/page.tsx` - existe mas precisa adicionar vínculo GA4

**MÉDIA URGÊNCIA:**
- 🟡 `app/public/reports/[token]/page.tsx` - CRIAR
- 🟡 `app/public/reports/[token]/not-found.tsx` - CRIAR

**BAIXA URGÊNCIA:**
- 🟢 `app/(app)/app/logs/page.tsx` - CRIAR (opcional)
- 🟢 `app/(app)/app/settings/page.tsx` - CRIAR (branding, configurações)

### API Routes que faltam:

**ALTA URGÊNCIA:**
- 🔴 `app/api/billing/create-subscription/route.ts` - CRIAR
- 🔴 `app/api/billing/webhook/route.ts` - CRIAR
- 🔴 `app/api/billing/history/route.ts` - CRIAR

**MÉDIA URGÊNCIA:**
- 🟡 `app/api/reports/[reportId]/export-pdf/route.ts` - CRIAR
- 🟡 `app/api/cron/refresh-tokens/route.ts` - CRIAR

**Já existem e funcionam:**
- ✅ `app/api/auth/[...nextauth]/route.ts`
- ✅ `app/api/auth/signup/route.ts`
- ✅ `app/api/integrations/google/authorize/route.ts`
- ✅ `app/api/integrations/google/callback/route.ts`
- ✅ `app/api/integrations/google/disconnect/route.ts`
- ✅ `app/api/waitlist/route.ts`

### Server Actions que faltam:

**ALTA URGÊNCIA:**
- 🔴 Melhorar `app/(app)/app/clients/[clientId]/reports/new/actions.ts` (IA real + GA4 real)
- 🔴 `lib/actions/credits.ts` - CRIAR (getCreditHistory, getCreditState)
- 🔴 `lib/actions/billing.ts` - CRIAR (upgradePlan, buyCredits, getPaymentHistory)
- 🔴 `lib/actions/clients.ts` - adicionar updateClientGA4

**MÉDIA URGÊNCIA:**
- 🟡 `lib/actions/reports.ts` - CRIAR (generatePublicLink, revokePublicLink, getPublicReport)

**Já existem:**
- ✅ `lib/actions/clients.ts` (getClients, createClient, updateClient, deleteClient)

---

## 5. Melhorias técnicas obrigatórias

### 5.1 Loading States
- [ ] Spinner em todos os botões de submit durante ação
- [ ] Skeleton loaders em listas (clientes, relatórios)
- [ ] Loading state na geração de relatório (3-10s)
- [ ] Progress indicator no dashboard

### 5.2 Tratamento de Erros
- [ ] Toast de erro em todas as ações falhadas
- [ ] Mensagens de erro amigáveis (não expor stack traces)
- [ ] Fallback de IA se provider principal falhar
- [ ] Fallback de GA4 para métricas fake se GA4 falhar + aviso ao user
- [ ] Error boundary global

### 5.3 Abstração dos Providers
- [ ] Criar interface Provider para IA
- [ ] Implementar OpenAIProvider, AnthropicProvider, GoogleProvider
- [ ] Fallback automático entre providers
- [ ] Logging de qual provider foi usado em cada relatório
- [ ] Custo em créditos diferente por modelo

### 5.4 Otimização de Queries
- [ ] Cache de GA4 (Ga4ReportCache já existe, usar!)
- [ ] Limitar queries Supabase com .limit() e paginação
- [ ] Índices no Supabase para queries comuns:
  - GoogleConnection.workspaceId
  - CreditLedger.workspaceId, createdAt
  - Report.clientId, createdAt
- [ ] Usar .select() específico ao invés de select('*')

### 5.5 Validação
- [ ] Zod schemas para todas as server actions
- [ ] Validação client-side em forms (react-hook-form já usado)
- [ ] Sanitização de inputs (nomes, notas)
- [ ] Validação de GA4 propertyId format
- [ ] Validação de datas (periodStart < periodEnd)

### 5.6 Limpeza de Código
- [ ] Remover console.logs desnecessários (deixar só logs importantes)
- [ ] Remover imports não usados
- [ ] Remover código comentado
- [ ] Padronizar nomes de variáveis
- [ ] Adicionar JSDoc em funções complexas
- [ ] Extrair magic numbers para constantes (ex: CREDIT_COSTS)

### 5.7 Segurança
- [ ] Verificar permissões em TODAS as server actions
- [ ] Rate limiting em geração de relatórios
- [ ] HTTPS forçado em produção
- [ ] CORS configurado corretamente
- [ ] Secrets nunca expostos no client
- [ ] Validação de origin em webhooks (MP)
- [ ] Logs de tentativas de acesso não autorizado

### 5.8 Monitoramento Simples
- [ ] Logs estruturados com contexto (workspaceId, userId, action)
- [ ] Erro crítico = notificação (email ou Slack - opcional)
- [ ] Dashboard interno de uso (total de reports gerados, créditos consumidos)
- [ ] Alertas: créditos acabando, GA4 token expirado, provider de IA com erro

---

## 6. Checklist final de 20 passos para MVP pronto

### Implementação Core

- [ ] **1. IA real funcionando** - lib/ai/summary.ts chamando GPT-4/Claude/Gemini real, prompt melhorado
- [ ] **2. GA4 real funcionando** - lib/google/ga4.ts fetchando métricas reais via Data API
- [ ] **3. Geração de relatório completa** - actions.ts usando IA real + GA4 real + consumindo créditos
- [ ] **4. Vínculo GA4 por cliente** - Campo no cliente para vincular property ID
- [ ] **5. Sistema de créditos funcional** - Página /app/credits com uso, limite, histórico
- [ ] **6. Billing Mercado Pago** - Página /app/billing + webhooks funcionando
- [ ] **7. Dashboard com métricas reais** - Cards com totais reais do workspace

### UX e Feedback

- [ ] **8. Loading states em tudo** - Spinners, skeletons, progress indicators
- [ ] **9. Toast notifications consistentes** - Sucesso/erro/info em todas as ações
- [ ] **10. Empty states com CTAs** - "Nenhum cliente" → "Adicionar primeiro cliente"
- [ ] **11. Confirmações antes de deletar** - Cliente, relatório

### Segurança e Validação

- [ ] **12. Validação Zod em todas as actions** - createClient, generateReport, etc
- [ ] **13. Verificação de permissões em tudo** - Sempre verificar workspace ownership
- [ ] **14. Rate limiting ativo** - 10 reports/hora, 50 clientes/hora por workspace

### Integrações

- [ ] **15. Refresh automático de token GA4** - Verificar expiresAt antes de cada chamada
- [ ] **16. Webhook Mercado Pago funcionando** - Atualiza plan, créditos, histórico
- [ ] **17. Listagem de properties GA4** - /app/integrations mostra properties disponíveis

### Extras Importantes

- [ ] **18. Página pública do relatório** - /public/reports/[token] funcionando
- [ ] **19. Export PDF do relatório** - Botão "Exportar PDF" funcionando
- [ ] **20. Deploy em produção** - Netlify configurado, variáveis setadas, build OK, domínio custom

---

**Conclusão:** Completando estes 20 passos, o Reliora estará pronto para vender como MVP funcional e seguro.

# Reliora - Roadmap Pós-MVP

## 🎯 Visão Geral

Este roadmap define as funcionalidades e melhorias a serem implementadas após o lançamento do MVP. Prioridades divididas em: **Crítico**, **Importante** e **Opcional**.

---

## 🔴 Crítico (V1.1 - Primeiras 2 semanas pós-MVP)

### GA4 API Real
- Implementar `fetchGA4Metrics()` usando Google Analytics Data API
- Mapper de métricas GA4 → formato interno padrão
- Fallback inteligente (GA4 real → cache → dados fake)
- Tratamento de erros de API (quota exceeded, unauthorized)
- Testes com contas reais do GA4

### Refresh Automático de Tokens
- Implementar `lib/google/refresh-token.ts`
- Verificar `expiresAt` antes de cada requisição GA4
- Refresh automático se token < 5 minutos para expirar
- Cron job `/api/cron/refresh-tokens` (a cada 30 minutos)
- Notificar usuário se refresh falhar (requer reconexão)

### Rate Limiting
- Instalar `@upstash/ratelimit` + Upstash Redis
- Limites por workspace:
  - 10 relatórios/hora
  - 50 clientes/hora
  - 100 requisições API/hora
- Mensagens de erro claras quando limite atingido
- Dashboard para admins visualizarem rate limits

### Listagem de Properties GA4
- Implementar `listGA4Properties()` em `lib/google/ga4.ts`
- Google Analytics Admin API v1
- Dropdown na página de cliente com properties disponíveis
- Filtrar apenas properties com permissão de leitura
- Cache de properties (TTL: 1 hora)

### Migração PostgreSQL
- Migrar de SQLite para PostgreSQL (Supabase)
- Atualizar schema do Prisma
- Testar migrações em staging
- Script de backup/restore
- Monitorar performance após migração

---

## 🟡 Importante (V1.2 - 1 mês pós-MVP)

### UX e Loading States
- Skeleton loaders em:
  - Dashboard (métricas, últimos relatórios)
  - Listagem de clientes
  - Listagem de relatórios
  - Histórico de créditos
- Progress indicator na geração de relatório (0-100%)
- Spinners em todos os botões de submit
- Animações de transição suaves (fade in/out)

### Confirmações de Deleção
- AlertDialog antes de deletar cliente
- Verificar se cliente tem relatórios vinculados
- Mostrar contagem de relatórios vinculados
- AlertDialog antes de deletar relatório
- Confirmar antes de revogar link público
- Toast de sucesso após deleção

### Empty States Melhorados
- Página de clientes vazia:
  - Ilustração + CTA "Adicionar primeiro cliente"
  - Dicas de como conectar GA4
- Dashboard sem relatórios:
  - Onboarding visual
  - Botão "Gerar primeiro relatório"
- GA4 desconectado:
  - Alert no topo da página
  - Botão "Conectar agora"

### Dashboard com Métricas Reais
- Remover dados fake
- Queries otimizadas com agregações
- Cards:
  - Total de clientes ativos
  - Relatórios gerados (mês atual)
  - Créditos usados (% do limite)
  - Taxa de sucesso de geração
- Gráfico de consumo de créditos (últimos 30 dias)
- Últimos 5 relatórios com links diretos

### Cache de GA4
- Implementar uso da tabela `Ga4ReportCache`
- Cache por: workspaceId + clientId + ga4PropertyId + período
- TTL: 24 horas para dados históricos
- Bypass de cache com parâmetro `?force=true`
- Indicador visual "Dados de cache" vs "Dados reais"

### Notificações por Email
- Integrar serviço de email (SendGrid, Resend, ou similar)
- Templates:
  - Créditos baixos (≥80% usado)
  - Créditos críticos (<10 restantes)
  - Relatório gerado com sucesso
  - Falha na geração de relatório
  - Pagamento aprovado
  - Plano atualizado
- Configuração de preferências de notificação

---

## 🟢 Opcional (V2.0 - 3-6 meses pós-MVP)

### Analytics e Auditoria
- Tabela `AuditLog` para registrar ações:
  - Login/logout
  - Criação/edição/deleção de clientes
  - Geração de relatórios
  - Alterações de plano
- Página `/app/logs` para visualizar auditoria
- Filtros por tipo de ação, usuário, data
- Export de logs (CSV)

### Gestão de Equipe
- Adicionar membros ao workspace
- Roles: Owner, Admin, Member, Viewer
- Permissões por role:
  - Owner: controle total
  - Admin: gerenciar clientes e relatórios
  - Member: criar relatórios
  - Viewer: apenas visualizar
- Página `/app/team` para gerenciar membros

### Comparação de Períodos
- Adicionar campos `compareStart` e `compareEnd` no form
- IA comparar período atual vs anterior
- Destacar variações (% de crescimento/queda)
- Gráficos side-by-side

### Templates de Relatório
- Criar templates customizáveis
- Variáveis: {{client_name}}, {{period}}, {{metrics}}
- Editor visual de templates
- Biblioteca de templates pré-prontos
- Aplicar template na geração

### White Label
- Configuração de marca no workspace:
  - Logo customizado
  - Cores primária/secundária
  - Domínio customizado
- Remover branding "Reliora" em relatórios públicos
- Email com marca do cliente

### Integrações Adicionais
- Meta Ads (Facebook/Instagram)
- Google Ads
- LinkedIn Ads
- TikTok Ads
- Unified dashboard com métricas de todas as fontes

### Webhooks Customizados
- Permitir usuário configurar webhooks
- Eventos:
  - `report.generated`
  - `credit.low`
  - `payment.approved`
- Headers customizados
- Retry automático em caso de falha

### API Pública
- Endpoints REST para:
  - Listar clientes
  - Gerar relatório (async)
  - Consultar status de relatório
  - Obter dados de créditos
- Autenticação via API Key
- Rate limiting por API Key
- Documentação interativa (Swagger/OpenAPI)

### Dashboard com Gráficos Avançados
- Biblioteca de charts (Recharts ou Chart.js)
- Gráficos:
  - Consumo de créditos ao longo do tempo
  - Relatórios gerados por cliente
  - Taxa de sucesso por provider de IA
  - Custos por relatório
- Filtros por período, cliente, tipo

### Relatórios Agendados
- Agendamento recorrente (diário, semanal, mensal)
- Envio automático por email
- Notificação quando relatório estiver pronto
- Histórico de relatórios agendados
- Gerenciamento de agendamentos em `/app/schedules`

### Export Avançado
- Múltiplos formatos:
  - PDF (já implementado)
  - Excel (XLSX)
  - PowerPoint (PPTX)
  - Google Sheets (via API)
- Customização de layout
- Branding do cliente no export

### Multi-idioma (i18n)
- Suporte para Português, Inglês, Espanhol
- Seletor de idioma no header
- Traduções em arquivo JSON
- Relatórios gerados no idioma selecionado

### Planos Corporativos
- Plano Enterprise:
  - Créditos ilimitados (ou 100K+)
  - SLA garantido
  - Suporte prioritário
  - Onboarding dedicado
- Plano Custom:
  - Pricing sob demanda
  - Contrato anual
  - Features exclusivas

### Otimizações de Performance
- Redis para cache de sessões
- CDN para assets estáticos
- Lazy loading de componentes pesados
- Otimização de queries com índices
- Server-side pagination em todas as listas
- Compressão de responses (gzip/brotli)

### Testes Automatizados
- Unit tests (Vitest/Jest)
- Integration tests (Playwright)
- E2E tests para fluxos críticos:
  - Signup → login → criar cliente → gerar relatório
  - Conectar GA4 → vincular property
  - Upgrade de plano → verificar webhook
- CI/CD com GitHub Actions
- Coverage mínimo: 70%

---

## 📅 Cronograma Sugerido

### V1.1 (Semanas 1-2 pós-MVP)
- GA4 API real
- Refresh automático de tokens
- Rate limiting
- Listagem de properties GA4
- Migração PostgreSQL

### V1.2 (Semanas 3-6 pós-MVP)
- UX e loading states
- Confirmações de deleção
- Empty states melhorados
- Dashboard com métricas reais
- Cache de GA4
- Notificações por email

### V2.0 (Meses 3-6 pós-MVP)
- Analytics e auditoria
- Gestão de equipe
- Comparação de períodos
- Templates de relatório
- White label
- Integrações adicionais

### V2.1+ (6+ meses)
- Webhooks customizados
- API pública
- Dashboard com gráficos avançados
- Relatórios agendados
- Export avançado
- Multi-idioma
- Planos corporativos

---

## 🎯 Métricas de Sucesso

### KPIs V1.1
- 100% dos relatórios usando dados reais do GA4
- Taxa de sucesso de geração: >95%
- Tempo médio de geração: <10 segundos
- Zero downtime de tokens expirados

### KPIs V1.2
- Redução de 50% em suporte sobre "onde está meu relatório?"
- Net Promoter Score (NPS): >40
- Taxa de retenção (30 dias): >80%
- Upgrade para plano pago: >10% dos usuários free

### KPIs V2.0
- 5+ integrações ativas por workspace (em média)
- 20% dos usuários usando templates customizados
- White label ativo em 10+ workspaces
- API pública com 100+ chamadas/dia

---

## 📌 Notas Finais

**Prioridade #1:** Focar na estabilidade e experiência do usuário antes de adicionar features complexas.

**Prioridade #2:** Coletar feedback de early adopters após MVP para ajustar roadmap.

**Prioridade #3:** Monitorar métricas de uso para identificar quais features são mais valiosas.

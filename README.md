# Reliora

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-13.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

**Plataforma SaaS para geração de relatórios de marketing com análise automatizada por IA**

Transforme dados de marketing em insights acionáveis com análise inteligente em segundos.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#️-stack-tecnológica)
- [Começando](#-começando)
- [Deploy](#-deploy)
- [Uso](#-uso)
- [Arquitetura](#-arquitetura)
- [Segurança](#-segurança)
- [Contribuindo](#-contribuindo)

---

## 🎯 Visão Geral

Reliora é uma plataforma completa para agências e profissionais de marketing que precisam:

- Gerar relatórios automatizados com análise por IA
- Consolidar métricas de múltiplas fontes
- Gerenciar portfólio de clientes
- Obter insights rápidos e acionáveis

### Demo Rápido

1. Crie sua conta em `/signup`
2. Adicione um cliente
3. Gere um relatório em 10 segundos
4. Visualize métricas + análise da IA

---

## ✨ Funcionalidades

### Core
- 🤖 **Análise por IA** - Suporte para GPT-4, Claude e Gemini
- 📊 **Métricas Consolidadas** - Impressões, Cliques, CTR, Conversões, Custo
- 👥 **Multi-cliente** - Gestão organizada de múltiplos clientes
- 📈 **Visualizações** - Gráficos e cards informativos

### Técnicas
- 🔐 **Segurança Enterprise** - Auth robusta + RLS multi-tenant
- 🌐 **Multi-provedor IA** - Troque entre OpenAI, Anthropic e Google
- 📱 **Responsivo** - Mobile-first design
- ⚡ **Performance** - Otimizado para velocidade

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: Next.js 13 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Design**: Sistema de cores Teal (#14B8A6), WCAG 2.1 AA

### Backend
- **API**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js com sessões seguras

### IA
- **OpenAI**: GPT-4 / GPT-4 Turbo
- **Anthropic**: Claude 3.5 Sonnet
- **Google**: Gemini 2.0 Flash

### Deploy
- **Pronto para**: Netlify, Vercel, plataformas Next.js

---

## 🚀 Começando

### Pré-requisitos

```bash
Node.js 18+
npm ou yarn
Conta Supabase (gratuita)
API Key de IA (Google Gemini é gratuito para teste)
```

### Instalação

**1. Clone e instale**
```bash
git clone https://github.com/seu-usuario/reliora.git
cd reliora
npm install
```

**2. Configure variáveis de ambiente**

Edite `.env`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
DATABASE_URL=sua-connection-string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-chave-forte  # openssl rand -base64 32

# IA (escolha uma)
AI_PROVIDER=google  # ou anthropic ou openai
AI_MODEL=gemini-2.0-flash-exp
GOOGLE_API_KEY=sua-chave-google
```

**3. Execute**
```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📦 Deploy

### Netlify (Recomendado)

O projeto está pré-configurado. Consulte [`DEPLOY_NETLIFY.md`](./DEPLOY_NETLIFY.md) para guia completo.

**Resumo:**
1. Conecte GitHub à Netlify
2. Configure variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

Compatível com Vercel e qualquer plataforma Next.js 13+.

---

## 💡 Uso

### 1. Criar Conta
- Navegue para `/signup`
- Senha forte com validação em tempo real
- Login automático após cadastro

### 2. Adicionar Cliente
- Dashboard → "Clientes" → "Adicionar cliente"
- Preencha nome e notas (opcional)

### 3. Gerar Relatório
- Entre no cliente
- "Gerar relatório" → Selecione período (padrão: 30 dias)
- Aguarde 3-10 segundos
- Visualize métricas + análise IA

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
reliora/
├── app/
│   ├── (app)/app/          # Rotas autenticadas
│   │   ├── clients/        # CRUD clientes
│   │   │   └── [clientId]/reports/new/
│   │   └── reports/[reportId]/
│   ├── login/              # Auth pages
│   ├── signup/
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── clients/            # Cliente components
│   └── landing/            # Landing page
├── lib/
│   ├── ai/                 # Multi-provider IA
│   ├── fakeMetrics.ts      # Gerador métricas
│   ├── db.ts               # Supabase client
│   └── auth.ts             # NextAuth config
├── supabase/migrations/    # SQL migrations
└── netlify.toml            # Deploy config
```

### Sistema de IA - Multi-Provedor

| Provedor | Modelo | Latência | Custo | Recomendação |
|----------|--------|----------|-------|--------------|
| **Google Gemini** | gemini-2.0-flash-exp | 2-4s | Gratuito (1M tokens/mês) | **Teste** |
| **Anthropic Claude** | claude-3-5-sonnet | 3-6s | $3/$15 por 1M tokens | **Produção** |
| **OpenAI GPT-4** | gpt-4-turbo | 4-8s | $10/$30 por 1M tokens | **Premium** |

**Trocar provedor:** Altere `AI_PROVIDER` no `.env` e reinicie.

### Métricas

**Atual:** Dados sintéticos plausíveis para demonstração

**Futuro:** Integração com:
- Google Analytics 4
- Meta Ads API
- Google Ads API
- LinkedIn Ads

**Métricas geradas:**
- Impressões: 10K-100K
- CTR: 2%-8%
- Conversões: 5%-20% dos cliques
- Custo: R$ 1K-10K
- Distribuição diária com variação natural

---

## 🔐 Segurança

### Implementações

✅ Hash bcrypt (10 rounds) para senhas  
✅ Sessões seguras NextAuth  
✅ Row Level Security (RLS) no Supabase  
✅ Multi-tenant isolado por workspace  
✅ API keys apenas server-side  
✅ HTTPS obrigatório em produção  
✅ Validação senha forte no signup  

### Best Practices

- Chaves de API nunca expostas no cliente
- Validação de entrada em todas as rotas
- Rate limiting em endpoints críticos
- Logs de auditoria em operações sensíveis

---

## 🎨 Design System

### Cores
- **Primária**: Teal/Turquesa (#14B8A6)
- **Neutros**: Escala de cinza

### Componentes
- **Base**: shadcn/ui + Radix UI
- **Tipografia**: System fonts (performance)
- **Responsividade**: Mobile-first
- **Acessibilidade**: WCAG 2.1 AA

### UX Features
- Split screen em login/signup
- Validação em tempo real
- Indicador de força de senha
- Loading states consistentes
- Feedback visual instantâneo

---

## 🧪 Scripts

```bash
npm run dev         # Desenvolvimento
npm run build       # Build produção
npm run start       # Servidor produção
npm run lint        # Linter
npm run typecheck   # Verificação tipos
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Add: MinhaFeature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 💬 Suporte

- 📧 **Email**: contato@reliora.com
- 📚 **Documentação**: Consulte arquivos `.md` no repositório
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/reliora/issues)

---

## 🎉 Créditos

Desenvolvido com ❤️ usando as melhores tecnologias do mercado.

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub!**
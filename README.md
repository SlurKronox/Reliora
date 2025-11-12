# Reliora - Plataforma de Relatórios de Marketing com IA

![Reliora](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-13.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

> Transforme dados de marketing em decisões inteligentes com análise automatizada por IA

## 🚀 Sobre o Projeto

Reliora é uma plataforma SaaS completa para geração de relatórios de marketing automatizados com análise por Inteligência Artificial. Ideal para agências e profissionais de marketing que precisam gerar insights rápidos e acionáveis.

### ✨ Funcionalidades

- 🤖 **Análise por IA Real** - Suporte para GPT-4, Claude e Gemini
- 📊 **Métricas Consolidadas** - Impressões, Cliques, CTR, Conversões e Custo
- 👥 **Multi-cliente** - Gerencie múltiplos clientes de forma organizada
- 📈 **Visualizações Intuitivas** - Gráficos e cards informativos
- 🔐 **100% Seguro** - Autenticação robusta e multi-tenant com RLS
- 🌐 **Multi-provedor de IA** - Troque entre OpenAI, Anthropic e Google
- 📱 **Responsivo** - Funciona perfeitamente em todos os dispositivos

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 13, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Server Actions
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: NextAuth.js
- **IA**: OpenAI GPT-4 / Anthropic Claude / Google Gemini
- **Deploy**: Netlify Ready

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase (gratuita)
- API Key de IA (escolha uma):
  - Google Gemini (gratuito para teste)
  - Anthropic Claude
  - OpenAI GPT-4

## 🚀 Instalação Local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/reliora.git
cd reliora
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Edite o arquivo `.env` e configure suas chaves:

```env
# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
DATABASE_URL=sua-connection-string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-uma-chave-secreta-forte

# IA (escolha uma)
AI_PROVIDER=google  # ou anthropic ou openai
AI_MODEL=gemini-2.0-flash-exp
GOOGLE_API_KEY=sua-chave-aqui
```

Gere uma chave secreta forte:
```bash
openssl rand -base64 32
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📦 Deploy na Netlify

Siga o guia completo em [`DEPLOY_NETLIFY.md`](./DEPLOY_NETLIFY.md)

**Resumo rápido:**

1. Conecte seu repositório GitHub à Netlify
2. Configure as variáveis de ambiente
3. Deploy automático em cada push!

O arquivo `netlify.toml` já está configurado.

## 🎯 Como Usar

### 1. Criar Conta

1. Acesse `/signup`
2. Preencha seus dados
3. Senha forte com validação em tempo real
4. Login automático após criar conta

### 2. Adicionar Cliente

1. Dashboard → "Clientes"
2. Clique em "Adicionar cliente"
3. Preencha nome e notas (opcional)

### 3. Gerar Relatório

1. Entre no cliente
2. Clique em "Gerar relatório"
3. Selecione o período (padrão: últimos 30 dias)
4. Aguarde 3-10 segundos
5. Visualize métricas + análise da IA!

## 🔐 Segurança

- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ Sessões seguras com NextAuth
- ✅ Row Level Security (RLS) no Supabase
- ✅ Multi-tenant isolado por workspace
- ✅ Chaves de API apenas no servidor
- ✅ HTTPS obrigatório em produção
- ✅ Validação de senha forte no cadastro

## 🎨 Design System

- **Cores**: Teal/Turquesa (#14B8A6) como cor primária
- **Tipografia**: System fonts para performance
- **Componentes**: shadcn/ui + Radix UI
- **Responsividade**: Mobile-first approach
- **Acessibilidade**: WCAG 2.1 AA compliant
- **UX**: Split screen em login/signup com branding

## 📊 Estrutura do Projeto

```
reliora/
├── app/                    # Next.js 13 App Router
│   ├── (app)/             # Rotas autenticadas
│   │   └── app/           # Dashboard e páginas internas
│   │       ├── clients/   # CRUD de clientes
│   │       │   └── [clientId]/
│   │       │       └── reports/
│   │       │           └── new/  # Gerar relatório
│   │       └── reports/
│   │           └── [reportId]/   # Visualizar relatório
│   ├── login/             # Página de login melhorada
│   ├── signup/            # Página de cadastro melhorada
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── clients/          # Componentes de clientes
│   └── landing/          # Componentes da landing
├── lib/                   # Utilidades
│   ├── ai/               # Abstração multi-provedor de IA
│   │   └── summary.ts    # Geração de resumos
│   ├── fakeMetrics.ts    # Gerador de métricas plausíveis
│   ├── db.ts             # Cliente Supabase
│   └── auth.ts           # Configuração NextAuth
├── supabase/             # Migrations do banco
│   └── migrations/       # SQL migrations
├── netlify.toml          # Configuração Netlify
├── DEPLOY_NETLIFY.md     # Guia de deploy
└── public/               # Assets estáticos
```

## 🤖 IA - Multi-Provedor

O sistema suporta 3 provedores de IA configuráveis por `.env`:

### Google Gemini (Recomendado para Teste)
- **Gratuito**: 60 requisições/minuto
- **Modelo**: `gemini-2.0-flash-exp`
- **Latência**: ~2-4s
- **Custo**: Gratuito até 1M tokens/mês

### Anthropic Claude (Melhor Custo-Benefício)
- **Modelo**: `claude-3-5-sonnet-20241022`
- **Latência**: ~3-6s
- **Custo**: $3/$15 por 1M tokens (in/out)
- **Qualidade**: Excelente

### OpenAI GPT-4 (Máxima Qualidade)
- **Modelo**: `gpt-4` ou `gpt-4-turbo`
- **Latência**: ~4-8s
- **Custo**: $10/$30 por 1M tokens (in/out)
- **Qualidade**: Melhor disponível

**Troca de provedor**: Basta mudar `AI_PROVIDER` no `.env` e reiniciar!

## 📈 Métricas Geradas

Atualmente usa métricas fake plausíveis. Futuro: integração real com:
- Google Analytics 4
- Meta Ads API
- Google Ads API
- LinkedIn Ads

### Métricas Atuais:
- **Impressões**: 10.000 - 100.000
- **CTR**: 2% - 8%
- **Conversões**: 5% - 20% dos cliques
- **Custo**: R$ 1.000 - R$ 10.000
- **Distribuição diária**: Com variação natural

## 🧪 Testes

```bash
# Build de produção
npm run build

# Type checking
npm run typecheck

# Lint
npm run lint
```

## 🎨 Melhorias Visuais

### Login & Signup
- ✅ Split screen com branding lado esquerdo
- ✅ Validação de senha em tempo real
- ✅ Indicador de força da senha
- ✅ Toggle mostrar/ocultar senha
- ✅ Feedback visual instantâneo
- ✅ Design moderno e profissional
- ✅ Responsivo mobile-first

### Dashboard
- ✅ Cards com métricas principais
- ✅ Lista de clientes organizada
- ✅ Navegação intuitiva
- ✅ Loading states bem definidos

### Relatórios
- ✅ Cards de métricas destacados
- ✅ Gráfico de barras horizontal
- ✅ Resumo da IA destacado
- ✅ Navegação entre relatórios

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Linter
- `npm run typecheck` - Verificação de tipos

## 🚀 Deploy

### Netlify (Recomendado)
1. Conecte ao GitHub
2. Configure variáveis de ambiente
3. Deploy automático

### Vercel
1. Importe do GitHub
2. Configure variáveis de ambiente
3. Deploy

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js 13+

## 📝 License

Este projeto está sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 💬 Suporte

- 📧 Email: contato@reliora.com
- 📚 Docs: Consulte os arquivos .md no repositório

## 🎉 Créditos

Desenvolvido com ❤️ usando as melhores tecnologias do mercado.

---

**⭐ Se este projeto foi útil, deixe uma estrela!**

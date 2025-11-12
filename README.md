# Reliora - Relatórios de Marketing com IA

Sistema B2B SaaS para geração automática de relatórios de marketing usando IA.

## Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Auth**: NextAuth.js com credentials provider
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma

## Estrutura do Projeto

```
.
├── app/
│   ├── (app)/              # Área autenticada (rotas protegidas)
│   │   ├── app/            # Dashboard principal
│   │   │   ├── page.tsx    # Overview
│   │   │   ├── clients/    # Gestão de clientes
│   │   │   └── account/    # Conta do usuário
│   │   └── layout.tsx      # Layout com sidebar
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/  # NextAuth routes
│   │   │   └── signup/         # Registro de usuário
│   │   └── waitlist/       # Captura de emails
│   ├── login/              # Página de login
│   ├── signup/             # Página de cadastro
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   └── globals.css
├── components/
│   ├── landing/            # Componentes da landing page
│   ├── ui/                 # shadcn/ui components
│   ├── app-header.tsx      # Header da área autenticada
│   ├── app-sidebar.tsx     # Sidebar da área autenticada
│   ├── site-header.tsx     # Header da landing
│   └── site-footer.tsx     # Footer da landing
├── lib/
│   ├── auth.ts             # Configuração NextAuth
│   ├── db.ts               # Prisma client singleton
│   ├── session.ts          # Helpers de sessão
│   └── utils.ts
├── prisma/
│   └── schema.prisma       # Schema do banco de dados
└── types/
    └── next-auth.d.ts      # Type definitions NextAuth
```

## Modelo de Dados

### Multi-tenancy (Workspace-based)

- **User**: usuários do sistema
- **Workspace**: espaços de trabalho (1 criado automaticamente no signup)
- **WorkspaceMember**: relacionamento usuário-workspace com roles
- **Client**: clientes/projetos de marketing dentro de um workspace
- **Report**: relatórios gerados para cada cliente
- **WaitlistEmail**: emails capturados na landing page

## Como Rodar Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env` já está configurado com:

```env
# Supabase (Database)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
```

**Importante**: Em produção, gere um secret seguro:
```bash
openssl rand -base64 32
```

### 3. Rodar a aplicação

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Funcionalidades Implementadas

### Landing Page (/)
- Hero section com CTAs
- Como funciona (3 passos)
- Público-alvo
- Benefícios (cards)
- Explicação da IA
- Planos e preços
- FAQ (accordion)
- CTA final com captura de email para waitlist

### Autenticação
- **Signup** (`/signup`): cria usuário + workspace + workspace_member
- **Login** (`/login`): autenticação com email/password
- **Logout**: via dropdown do header

### Área Autenticada (/app)
- **Dashboard**: overview com contadores de clientes e relatórios
- **Clients** (`/app/clients`): placeholder para gestão de clientes
- **Account** (`/app/account`): exibe informações do usuário
- Layout com sidebar e header
- Proteção de rotas (redirect para /login se não autenticado)

## Decisões de Implementação

### Auth
- **NextAuth v4** com credentials provider
- Sessão JWT (não usa database sessions)
- Passwords com bcrypt (10 rounds)
- Auto-criação de workspace no signup
- User é sempre "owner" do workspace criado

### Multi-tenancy
- Workspace-scoped: todas as queries filtram por workspaceId
- RLS policies no Supabase garantem isolamento de dados
- Usuário acessa o primeiro workspace encontrado (pode ser expandido depois)

### UI/UX
- Design limpo e profissional
- Cores principais: #0F172A (dark blue) e #14B8A6 (teal)
- Fonte: Inter
- Mobile-responsive
- Toast notifications para feedback

## Próximos Passos (Bloco 2+)

1. **Clients CRUD completo**: criar, editar, deletar clientes
2. **Reports**: gerar relatórios com dados fake e IA fake
3. **Integrações**: Google Analytics, Meta Ads, etc.
4. **IA real**: OpenAI GPT-4 para summaries
5. **Billing**: Stripe + subscription management
6. **Features avançadas**: branding customizado, export PDF, etc.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Roda o linter
- `npm run typecheck` - Checa os tipos TypeScript

## Observações

- O projeto usa Next.js 13.5.1 com App Router
- Todas as páginas protegidas usam Server Components
- Client Components marcados com 'use client' apenas onde necessário
- RLS habilitado em todas as tabelas no Supabase

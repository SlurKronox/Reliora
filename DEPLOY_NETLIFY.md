# 🚀 Guia de Deploy na Netlify

## ✅ Pré-requisitos

1. Conta na Netlify (gratuita): https://app.netlify.com/signup
2. Conta no GitHub (para conectar o repositório)
3. API Key de IA configurada (Google Gemini, OpenAI ou Anthropic)

---

## 📦 Passo 1: Preparar o Repositório

### Opção A: Usando GitHub

1. Crie um repositório no GitHub
2. Faça commit e push do código:

```bash
git init
git add .
git commit -m "Initial commit - Reliora"
git branch -M main
git remote add origin https://github.com/seu-usuario/reliora.git
git push -u origin main
```

### Opção B: Deploy Direto (sem Git)

Use o Netlify CLI:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 🌐 Passo 2: Deploy na Netlify

### Via GitHub (Recomendado)

1. Acesse https://app.netlify.com/
2. Clique em **"Add new site" → "Import an existing project"**
3. Conecte com GitHub e selecione o repositório
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 18

### Configuração Automática

O arquivo `netlify.toml` já está configurado! A Netlify vai:
- Instalar dependências automaticamente
- Rodar `npm run build`
- Publicar o diretório `.next`

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

Na Netlify Dashboard:

1. Vá em **Site settings → Environment variables**
2. Adicione TODAS as variáveis do `.env`:

### Obrigatórias (Supabase):
```
NEXT_PUBLIC_SUPABASE_URL=https://tdqqcnrcyhotabkkjlvx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres.tdqqcnrcyhotabkkjlvx:postgres@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Obrigatórias (NextAuth):
```
NEXTAUTH_URL=https://seu-site.netlify.app
NEXTAUTH_SECRET=sua-chave-secreta-aleatoria-aqui
```

**IMPORTANTE**: Gere uma chave secreta forte para `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Obrigatórias (IA - escolha uma):

**Opção 1: Google Gemini (Gratuito)**
```
AI_PROVIDER=google
AI_MODEL=gemini-2.0-flash-exp
GOOGLE_API_KEY=sua-chave-aqui
GOOGLE_API_BASE=https://generativelanguage.googleapis.com
```

**Opção 2: Anthropic Claude**
```
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=sua-chave-aqui
ANTHROPIC_API_BASE=https://api.anthropic.com
```

**Opção 3: OpenAI**
```
AI_PROVIDER=openai
AI_MODEL=gpt-4
OPENAI_API_KEY=sua-chave-aqui
OPENAI_API_BASE=https://api.openai.com/v1
```

---

## 🎯 Passo 4: Deploy

### Via GitHub
- Qualquer push para a branch `main` fará deploy automático

### Via CLI
```bash
netlify deploy --prod
```

---

## ✅ Passo 5: Testar

1. Acesse seu site: `https://seu-site.netlify.app`
2. Crie uma conta em `/signup`
3. Faça login em `/login`
4. Crie um cliente
5. Gere um relatório com IA

---

## 🔧 Troubleshooting

### Erro: "Database connection failed"
- Verifique se `DATABASE_URL` está correta
- Certifique-se que o Supabase está ativo

### Erro: "NextAuth configuration error"
- Configure `NEXTAUTH_URL` com a URL do Netlify
- Gere nova `NEXTAUTH_SECRET` forte

### Erro: "AI provider not configured"
- Adicione as variáveis de IA correspondentes
- Teste a API key localmente primeiro

### Build falha
- Verifique os logs no Netlify Dashboard
- Teste localmente: `npm run build`

---

## 📊 Monitoramento

A Netlify fornece:
- ✅ Analytics automático
- ✅ Logs de build e runtime
- ✅ Alertas de erro
- ✅ HTTPS automático

---

## 🚀 Próximos Passos

1. **Domínio Customizado**: Configure em Site settings → Domain management
2. **Preview Deploys**: Cada branch terá uma URL de preview
3. **Formulários**: Netlify Forms integrado
4. **Functions**: Suporta serverless functions nativas

---

## 💡 Dicas de Produção

✅ **Sempre use HTTPS** (Netlify fornece automaticamente)
✅ **Configure alertas** para erros críticos
✅ **Monitore uso de IA** para controlar custos
✅ **Backup do Supabase** configurado
✅ **Variables de ambiente** nunca no código

---

## 📞 Suporte

- Netlify Docs: https://docs.netlify.com/
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**🎉 Pronto! Seu sistema Reliora está no ar!**

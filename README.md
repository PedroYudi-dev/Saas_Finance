# Fintra — SaaS de Controle Financeiro Pessoal

Sistema completo de controle financeiro pessoal construído com Next.js 14, Better Auth, Drizzle ORM e PostgreSQL (Neon).

## Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript 5
- **UI**: Tailwind CSS 3 + shadcn/ui
- **Autenticação**: Better Auth
- **ORM**: Drizzle ORM
- **Banco de dados**: PostgreSQL (Neon)
- **Gráficos**: Recharts
- **Validação**: Zod
- **Deploy**: Vercel

## Funcionalidades

- ✅ Autenticação completa (registro, login, logout, sessão persistente)
- ✅ Dashboard com cards de resumo financeiro
- ✅ Renda mensal com cálculo de orçamento
- ✅ CRUD completo de gastos (com filtros por mês, categoria e busca)
- ✅ CRUD completo de contas a pagar (com status e alertas de vencimento)
- ✅ Gerenciamento de categorias com cores personalizadas
- ✅ Gráficos de gastos por categoria e evolução mensal
- ✅ Progress bar do orçamento com alertas
- ✅ Dados isolados por usuário
- ✅ Configurações de perfil e renda histórica

## Setup Local

### 1. Clone e instale

```bash
git clone <repo>
cd finance-saas
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha no `.env.local`:

```env
# Banco de dados (Neon: https://neon.tech)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Better Auth (gere um secret com: openssl rand -base64 32)
BETTER_AUTH_SECRET=seu-secret-aqui-minimo-32-chars
BETTER_AUTH_URL=http://localhost:3000

# URL pública
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure o banco de dados

```bash
# Gerar migrations
npm run db:generate

# Aplicar ao banco
npm run db:push
```

### 4. Rode em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Deploy na Vercel

### 1. Configure o banco (Neon)

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a `DATABASE_URL` da aba Connection String

### 2. Deploy na Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Configure as variáveis de ambiente na Vercel

No painel da Vercel → Settings → Environment Variables:

```
DATABASE_URL         = sua-url-do-neon
BETTER_AUTH_SECRET   = seu-secret-32-chars
BETTER_AUTH_URL      = https://seu-app.vercel.app
NEXT_PUBLIC_APP_URL  = https://seu-app.vercel.app
```

### 4. Rode as migrations em produção

```bash
# Configure DATABASE_URL localmente apontando para o Neon
DATABASE_URL=sua-url-neon npm run db:push
```

## Estrutura do Projeto

```
finance-saas/
├── app/
│   ├── (auth)/           # Login e registro (layout sem sidebar)
│   │   ├── login/
│   │   └── register/
│   ├── (app)/            # Área protegida (layout com sidebar)
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── bills/
│   │   ├── categories/
│   │   └── settings/
│   ├── api/auth/         # Better Auth handler
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── auth/             # Formulários de login/registro
│   ├── bills/            # CRUD de contas a pagar
│   ├── categories/       # CRUD de categorias
│   ├── charts/           # Recharts (pizza, área)
│   ├── dashboard/        # Cards, progresso, listas
│   ├── expenses/         # CRUD de gastos
│   ├── layout/           # Sidebar e Header
│   ├── settings/         # Configurações de perfil
│   └── ui/               # shadcn/ui components
├── actions/
│   ├── expenses/         # Server actions de gastos
│   ├── income/           # Server actions de renda
│   ├── bills/            # Server actions de contas
│   └── categories/       # Server actions de categorias
├── db/
│   └── schema/           # Schema Drizzle ORM
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── auth/             # Better Auth config (server + client)
│   ├── db.ts             # Conexão Neon + Drizzle
│   └── utils.ts          # Utilitários e formatação
├── types/
│   └── index.ts          # TypeScript types
├── middleware.ts
├── drizzle.config.ts
├── next.config.js
├── tailwind.config.ts
└── .env.example
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento local |
| `npm run build` | Build de produção |
| `npm run db:generate` | Gerar migrations Drizzle |
| `npm run db:push` | Aplicar schema ao banco |
| `npm run db:studio` | Interface visual do banco |
| `npm run db:migrate` | Rodar migrations |

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | URL PostgreSQL (Neon/Supabase) |
| `BETTER_AUTH_SECRET` | ✅ | Secret de 32+ chars para JWT |
| `BETTER_AUTH_URL` | ✅ | URL base da aplicação |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL pública (client-side) |

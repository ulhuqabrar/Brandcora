# Product-Agnostic React SaaS Foundation

A production-ready, reusable SaaS foundation built with React, TypeScript, Vite, Express, PostgreSQL, and Stripe.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Phosphor Icons
- **Backend**: Express, Better Auth, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Payments**: Stripe
- **Validation**: Zod
- **Monorepo**: pnpm workspaces

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Neon account (or any PostgreSQL provider)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/saas-foundation.git
cd saas-foundation

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development servers
pnpm dev
```

### Environment Variables

1. **Database**: Create a Neon project and copy the connection strings
2. **Better Auth**: Generate a random secret (min 32 characters)
3. **GitHub OAuth** (optional): Create a GitHub OAuth app at https://github.com/settings/developers
4. **Stripe**: Create a Stripe account and get API keys from the dashboard

## Project Structure

```
saas-foundation/
├── apps/
│   ├── web/          # React frontend with shadcn/ui
│   └── api/          # Express backend
├── packages/
│   ├── database/     # Prisma schema and client
│   ├── shared/       # Shared types and schemas
│   ├── config/       # Environment validation
│   └── ui/           # Reusable UI components (legacy)
├── apps/web/src/components/ui/  # shadcn/ui components
├── .github/
│   └── workflows/    # GitHub Actions CI
├── docs/             # Documentation
└── pnpm-workspace.yaml
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both web and API servers |
| `pnpm dev:web` | Start only the web server |
| `pnpm dev:api` | Start only the API server |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |

## GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3001/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Create products and prices in the dashboard
3. Copy the price IDs to `.env`
4. Set up a webhook endpoint pointing to `http://localhost:3001/api/v1/webhooks/stripe`

For local development, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe
```

## Adding Product-Specific Features

This foundation is designed to be extended. See [docs/ADDING_PRODUCT_FEATURES.md](docs/ADDING_PRODUCT_FEATURES.md) for detailed instructions.

### Key Extension Points

- **Database models**: Add to `packages/database/prisma/schema.prisma`
- **API routes**: Add to `apps/api/src/modules/product/`
- **React features**: Add to `apps/web/src/features/product/`
- **Plan features**: Configure in `apps/api/src/modules/entitlements/service.ts`

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components. Components are located in `apps/web/src/components/ui/`.

To add new shadcn components:
```bash
cd apps/web
npx shadcn@latest add [component-name]
```

## Production Deployment

### Vercel (Frontend)

```bash
# Set environment variables in Vercel dashboard
# Build command: pnpm build --filter=@saas/web
# Output directory: apps/web/dist
```

### Railway / Render / Fly.io (Backend)

```bash
# Set environment variables
# Build command: pnpm build --filter=@saas/api
# Start command: node apps/api/dist/index.js
```

### Database

```bash
# Run production migrations
pnpm db:migrate:prod
```

## License

MIT

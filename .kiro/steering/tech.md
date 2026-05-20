# Tech Stack & Build System

## Monorepo Tooling

- **Package Manager**: pnpm 9.15 (workspaces)
- **Build Orchestration**: Turborepo 2.3
- **Node.js**: ≥ 20
- **TypeScript**: 5.7+ (strict mode)
- **Linting**: ESLint 9 + Prettier 3.4

## Backend (apps/api)

- **Framework**: NestJS 10 on **Fastify** (not Express)
- **ORM**: Prisma 6 with PostgreSQL 16
- **Cache**: Redis 7 via ioredis
- **Queues**: BullMQ (async domain events, jobs)
- **Auth**: passport-jwt + Argon2 hashing
- **Validation**: Zod (env config + DTOs parsed in controllers)
- **Docs**: @nestjs/swagger (OpenAPI)
- **Rate Limiting**: @nestjs/throttler
- **Search**: Meilisearch v1.11
- **Events**: @nestjs/event-emitter (sync) + BullMQ (async)

## Frontend (apps/web)

- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **Styling**: TailwindCSS 3.4
- **Components**: shadcn/ui (via @community-os/ui)
- **Data Fetching**: TanStack Query v5
- **Tables**: TanStack Table v8
- **Forms**: React Hook Form + Zod
- **State**: Zustand 5
- **Charts**: Recharts
- **Graphs**: ReactFlow + dagre
- **Icons**: Lucide React
- **Toasts**: Sonner

## Infrastructure (Docker Compose)

- PostgreSQL 16 Alpine (port 5432)
- Redis 7 Alpine (port 6379)
- Maildev (SMTP 1025, Web 1080)
- Meilisearch v1.11 (port 7700)

## Common Commands

```bash
# Setup
pnpm install
pnpm docker:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Development
pnpm dev                              # All apps via Turborepo
pnpm --filter @community-os/api dev   # API only (port 4000)
pnpm --filter @community-os/web dev   # Web only (port 3000)

# Quality
pnpm lint
pnpm type-check
pnpm test

# Database
pnpm db:generate    # Regenerate Prisma client
pnpm db:migrate     # Run pending migrations
pnpm db:seed        # Seed dev data

# Docker
pnpm docker:up      # Start services
pnpm docker:down    # Stop services
pnpm docker:logs    # Tail logs
```

## URLs (Development)

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- Swagger: http://localhost:4000/api/docs
- Prisma Studio: `pnpm --filter @community-os/database db:studio`
- Maildev: http://localhost:1080

# Project Structure

## Monorepo Layout

```
kiro/kiro-bootstrap-2026/
├── apps/
│   ├── api/              # NestJS backend (Fastify)
│   ├── web/              # Next.js 15 frontend
│   ├── admin/            # Admin panel (planned)
│   └── mobile/           # Mobile app (planned)
├── packages/
│   ├── config/           # Shared ESLint/TS configuration
│   ├── database/         # Prisma schema, migrations, seed
│   ├── types/            # Shared TypeScript types (@community-os/types)
│   └── ui/              # Shared UI components - shadcn/ui (@community-os/ui)
├── docker-compose.yml
├── turbo.json            # Turborepo task config
└── package.json          # Workspace root
```

## Backend Architecture (apps/api/src/)

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Bootstrap (Fastify)
├── config/                    # Env validation with Zod
├── common/                    # Cross-cutting concerns
│   ├── events/                # Domain events service
│   ├── filters/               # Global exception filter
│   ├── interceptors/          # HTTP logging, audit
│   ├── logger/                # Structured logging + async context
│   ├── middleware/            # Trace ID, security headers
│   ├── pagination/            # Cursor pagination utilities
│   └── services/              # Hierarchy visibility
├── domains/                   # Domain modules (DDD-lite)
│   ├── admin/                 # Queue management
│   ├── analytics/             # KPIs, metrics
│   ├── audit/                 # Audit log service
│   ├── auth/                  # JWT, guards, decorators, sessions
│   ├── discipleship/          # Mentor-disciple relationships
│   ├── groups/                # Cell groups, hierarchy
│   ├── invitations/           # Email invitations
│   ├── memberships/           # Membership tracking
│   ├── networks/              # Organizational networks
│   ├── permissions/           # RBAC/ABAC
│   ├── reporting/             # Cell reports, exports
│   └── users/                 # Profiles, org chart, stages
├── health/                    # Health check endpoints
└── infrastructure/            # Technical adapters
    ├── cache/                 # Redis cache module
    ├── database/              # Prisma database module
    ├── queue/                 # BullMQ queue module
    └── search/                # Meilisearch module
```

## Domain Module Pattern

Each domain module follows this structure:

```
domains/{name}/
├── {name}.module.ts           # NestJS module definition
├── {name}.controller.ts       # HTTP endpoints (Zod parsing in controller)
├── {name}.service.ts          # Business logic
├── {name}.repository.ts       # Prisma data access
├── dto/
│   └── {name}.dto.ts          # Zod schemas + inferred types
├── guards/                    # Domain-specific guards (optional)
├── decorators/                # Custom decorators (optional)
└── processors/                # BullMQ job processors (optional)
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `groups.service.ts`, `jwt-auth.guard.ts` |
| Classes | PascalCase | `GroupsService`, `JwtAuthGuard` |
| DB tables | snake_case (@@map) | `group_members`, `audit_logs` |
| API routes | kebab-case, plural | `/api/v1/groups`, `/api/v1/cell-reports` |
| Packages | `@community-os/*` | `@community-os/database` |
| IDs | UUID v4 | All primary keys |

## Key Patterns

- **Repository pattern**: Services never call Prisma directly; they use `*.repository.ts`
- **Zod validation**: DTOs defined as Zod schemas, parsed in controllers
- **Event-driven**: Mutations emit events via EventEmitter2; async work via BullMQ
- **Audit trail**: All create/update/delete operations logged via AuditInterceptor
- **Soft deletes**: Entities have `deletedAt` field, queries filter by default
- **Hierarchy visibility**: Data access scoped by leadership hierarchy

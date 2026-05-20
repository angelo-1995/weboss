# SYSTEM ARCHITECTURE

## Patrón Principal

**Domain Driven Design (DDD) + Modular + Event-Driven**

## Estructura Monorepo (Turborepo)

```
apps/
  ├── web/          # Next.js 15 App Router — app principal
  ├── admin/        # Next.js 15 — panel administrativo
  ├── api/          # NestJS — backend principal
  └── mobile/       # React Native / Expo
packages/
  ├── ui/           # shadcn/ui + componentes compartidos
  ├── auth/         # JWT, sesiones, guards
  ├── database/     # Prisma schema, migrations, seeds
  ├── shared/       # Utilidades, helpers, constants
  ├── types/        # Tipos TypeScript compartidos
  └── config/       # ESLint, TS, Tailwind configs
```

## Arquitectura Backend (NestJS)

```
src/
  ├── domains/
  │   ├── auth/
  │   ├── users/
  │   ├── groups/
  │   ├── discipleship/
  │   ├── memberships/
  │   ├── reporting/
  │   ├── analytics/
  │   ├── permissions/
  │   ├── audit/
  │   ├── campuses/
  │   └── ministries/
  ├── infrastructure/
  │   ├── database/     # Prisma
  │   ├── cache/        # Redis
  │   ├── queue/        # BullMQ
  │   ├── events/       # Event bus
  │   └── search/       # PostgreSQL FTS / Meilisearch
  └── shared/
      ├── guards/
      ├── decorators/
      ├── filters/
      └── interceptors/
```

## Arquitectura Frontend (Next.js 15)

```
src/
  ├── app/              # App Router pages
  ├── features/         # Feature modules
  │   ├── auth/
  │   ├── users/
  │   ├── groups/
  │   └── ...
  ├── components/       # Componentes reutilizables
  ├── hooks/            # Custom hooks
  ├── services/         # API clients
  ├── schemas/          # Zod schemas
  ├── types/            # Tipos locales
  └── stores/           # Zustand stores
```

## Event-Driven Patterns

Eventos del sistema:
- `UserCreated`
- `InvitationSent`
- `ReportSubmitted`
- `MembershipAdded`
- `AnalyticsUpdated`
- `NotificationTriggered`

Implementados via BullMQ + Redis pub/sub.

## Search Engine

Arquitectura compatible con:
- **PostgreSQL FTS** (default, sin dependencias extra)
- **Meilisearch** (upgrade path para búsqueda avanzada)

No hardcodear búsquedas simples — usar abstracción de search service.

## Infraestructura

- Docker + Docker Compose para desarrollo local
- Variables de entorno via `.env` (nunca hardcoded)
- Health checks en todos los servicios
- Logs estructurados (JSON) con niveles: debug, info, warn, error
- CI/CD ready (GitHub Actions)

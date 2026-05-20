# KIRO BOOTSTRAP 2026 — Enterprise Community Operating System

Plataforma enterprise-grade moderna para gestión organizacional, discipulado, liderazgo, memberships, analytics e IAM.

## Inicio rápido

Ver [SETUP.md](./SETUP.md) para instrucciones completas.

```bash
# TL;DR
pnpm install
cp .env.example .env
pnpm docker:up
pnpm db:generate && pnpm db:migrate && pnpm db:seed

# Terminal 1
pnpm --filter @community-os/api dev

# Terminal 2
pnpm --filter @community-os/web dev
```

**URLs**: Web → http://localhost:3000 | API → http://localhost:4000/api/v1 | Swagger → http://localhost:4000/api/docs

## Stack

- **Frontend**: Next.js 15 App Router + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: NestJS + Prisma ORM + PostgreSQL + Redis + BullMQ
- **Infra**: Docker + Docker Compose + CI/CD ready

## Estructura Monorepo

```
apps/
  ├── web        # App principal (Next.js)
  ├── admin      # Panel administrativo
  ├── api        # Backend NestJS
  └── mobile     # App móvil
packages/
  ├── ui         # Componentes compartidos
  ├── auth       # Lógica de autenticación
  ├── database   # Prisma schema + migrations
  ├── shared     # Utilidades comunes
  ├── types      # Tipos TypeScript compartidos
  └── config     # Configuración global
```

## Fases MVP

| Fase | Contenido |
|------|-----------|
| 1 | Auth, Users, Groups, Discipleship, Memberships, Roles, Permissions, Reports, Audit, Search |
| 2 | Dashboards, KPIs, Charts, Leaderboards, Growth metrics |
| 3 | Streaming, Eventos, Sermones, Mensajería, Notificaciones |
| 4 | IA Insights, Predicciones, WhatsApp, Asistente IA |

## Reglas críticas

- NO regenerar archivos completos innecesariamente
- Trabajar incrementalmente — cambios mínimos y precisos
- NO arquitectura monolítica
- Validar seguridad, performance y escalabilidad antes de cada cambio

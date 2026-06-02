# J-PDVE Conexiones — Arquitectura y Diseño

> Documentación completa de arquitectura generada a partir del PRD oficial.
> **Estado:** Diseño completado, pendiente de implementación.

---

## Índice de Documentos

| # | Documento | Descripción | Versión |
|---|-----------|-------------|---------|
| 1 | [Validación del PRD](./01-prd-validation.md) | Inconsistencias, ambigüedades, riesgos, dependencias | v1.0 |
| 2 | [Dominios de Negocio](./02-business-domains.md) | 13 dominios con responsabilidades, entidades y casos de uso | v1.0 |
| 3 | [Arquitectura del Sistema](./03-system-architecture.md) | Frontend, backend, DB, cache, storage, queues, observability | v1.0 |
| 4 | [Modelo de Datos](./04-data-model.md) | Conceptual, lógico y relacional con cardinalidades e índices | v1.0 |
| 5 | [Esquema Prisma Preliminar](./05-prisma-schema.md) | Diseño Prisma completo con decisiones de diseño | v1.0 |
| 6 | [Casos de Uso](./06-use-cases.md) | Auth, Personas, Teams, Reportes, Recursos, Dashboard, Notificaciones | v1.0 |
| 7 | [Wireframes Textuales](./07-wireframes.md) | Todas las pantallas MVP con componentes y estados | v1.0 |
| 8 | [Mapa de Navegación](./08-navigation-map.md) | Flujos completos con diagramas Mermaid | v1.0 |
| 9 | [Seguridad](./09-security.md) | Roles, permisos, auditoría, sesiones, protección de APIs | v1.0 |
| 10 | [Roadmap Técnico](./10-roadmap.md) | 4 sprints MVP + planificación V2/Futuro | v1.0 |
| 11 | [Modelo Crecimiento Espiritual](./11-spiritual-growth-model.md) | Pipeline history, separación rol/posición, timeline UI | **v1.1 NEW** |
| 12 | [Módulo de Eventos](./12-events-module.md) | Events + attendance MVP para V2 | **v1.1 NEW** |
| 13 | [Análisis Final de Brechas](./13-final-gap-analysis.md) | Validación, conflictos resueltos, planificación por fase | **v1.1 NEW** |

---

## Fuente de Requerimientos

- **PRD:** `.kiro/specs/README_PRD_JPDVE_CONEXIONES.md`
- **Versión:** 1.0
- **Estado:** Approved for Development

---

## Reglas No Negociables (del PRD)

1. ✅ Ministry Team es la unidad organizacional principal
2. ✅ Person y User son entidades separadas
3. ✅ Cada persona pertenece a un Ministry Team
4. ✅ Códigos ministeriales asignados manualmente
5. ✅ Reportes se bloquean después del miércoles
6. ✅ Auditoría obligatoria en todas las mutaciones
7. ✅ Soporte GPS desde día 1
8. ✅ Arquitectura preparada para expansión multi-church
9. ✅ Mobile-first
10. ✅ Arquitectura modular

---

## Stack Técnico Seleccionado

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js 15 (App Router) + PWA | SSR + offline + mobile-first |
| UI | TailwindCSS + shadcn/ui | Consistencia + rapidez |
| State | Zustand + TanStack Query | Lightweight + cache inteligente |
| Backend | NestJS 10 + Fastify | Modular + performante |
| ORM | Prisma 6 | Type-safe + migrations |
| Database | PostgreSQL 16 + ltree | Hierarchy support nativo |
| Cache | Redis 7 | KPI cache + queues |
| Queues | BullMQ | Alert detection + async jobs |
| Search | Meilisearch | Fuzzy search sin costo por query |
| Storage | AWS S3 | Photos + resources |
| CDN | Cloudflare | WAF + CDN + DDoS |
| Auth | JWT + Argon2 | Stateless + seguro |

---

## Cambios v1.1 (Evolución Post-PRD)

| # | Cambio | Fase | Impacto |
|---|--------|------|---------|
| 1 | PersonPipelineHistory (historial completo de avances) | MVP Sprint 2 | Schema + Backend + UI |
| 2 | TeamHistory (event log de equipos) | MVP Sprint 2 | Schema + Backend |
| 3 | TeamMultiplication (registro formal) | MVP Sprint 2 | Schema + Backend |
| 4 | MinistryPosition (separar rol de posición) | V2 Sprint 5 | Schema + Security + ABAC |
| 5 | Events + EventAttendance (módulo básico) | V2 Sprint 5-6 | Full module |
| 6 | Timeline Espiritual (UI) | V2 Sprint 5 | Frontend |
| 7 | Funnel Ministerial (dashboard) | MVP Sprint 4 | Analytics |
| 8 | Nuevas notificaciones (pipeline, events, multiplication) | MVP/V2 | Notifications |

**Principio:** Todo cambio es ADITIVO. No se eliminó ni refactorizó nada del diseño v1.0.

---

## Próximos Pasos

1. ⬜ Resolver ambigüedades del PRD con stakeholders
2. ⬜ Aprobar modelo de datos actualizado (v1.1)
3. ⬜ Configurar monorepo + CI/CD
4. ⬜ Implementar Sprint 1 (Foundation)
5. ⬜ Integrar PersonPipelineHistory en Sprint 2
6. ⬜ Planificar Sprint 5-6 (V2: Events + MinistryPosition)

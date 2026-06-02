# PROJECT_AUDIT.md — Auditoría del Proyecto Existente

> **Proyecto:** Community OS (kiro-bootstrap-2026)
> **Ubicación:** C:\Users\perez\webb_PDVE\kiro\kiro-bootstrap-2026
> **Objetivo:** Evolucionar hacia J-PDVE Conexiones

---

## 1. Arquitectura Actual Encontrada

### Stack Confirmado
| Capa | Tecnología | Estado |
|------|-----------|--------|
| Monorepo | pnpm 9.15 + Turborepo 2.3 | ✅ Funcional |
| Backend | NestJS + Fastify | ✅ Funcional |
| Frontend | Next.js 15 (App Router) | ✅ Funcional |
| Database | PostgreSQL (Prisma 6) | ✅ 3 migraciones aplicadas |
| Cache | Redis (ioredis) | ✅ Configurado |
| Queue | BullMQ | ✅ Configurado |
| Search | Meilisearch | ✅ Configurado |
| Email | Template-based (Handlebars) | ✅ Básico |
| Docker | docker-compose.yml | ✅ Funcional |

### Estructura del Monorepo
```
kiro-bootstrap-2026/
├── apps/
│   ├── api/          # NestJS backend — 14 domain modules
│   └── web/          # Next.js frontend — 15 feature modules
├── packages/
│   ├── config/       # ESLint/TS configs compartidos
│   ├── database/     # Prisma schema + migrations + seed
│   ├── types/        # Tipos compartidos
│   └── ui/           # shadcn/ui components
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## 2. Módulos Backend Encontrados (14)

| # | Módulo | Ubicación | Estado | Mapeo J-PDVE |
|---|--------|-----------|--------|--------------|
| 1 | **auth** | domains/auth/ | ✅ Completo | Auth → Se conserva |
| 2 | **users** | domains/users/ | ✅ Completo | Users → Se conserva |
| 3 | **groups** | domains/groups/ | ✅ Completo | Equipos Ministeriales → Se renombra conceptualmente |
| 4 | **networks** | domains/networks/ | ✅ Completo | Redes → Se conserva |
| 5 | **reporting** | domains/reporting/ | ✅ Completo | Reportes de Célula → Se conserva y extiende |
| 6 | **discipleship** | domains/discipleship/ | ✅ Completo | Discipulado → Se conserva |
| 7 | **memberships** | domains/memberships/ | ✅ Parcial | Membresías → Se conserva |
| 8 | **permissions** | domains/permissions/ | ✅ Parcial | Permisos → Se conserva y extiende |
| 9 | **analytics** | domains/analytics/ | ⚠️ Parcial | Dashboard → Se extiende |
| 10 | **audit** | domains/audit/ | ✅ Completo | Auditoría → Se conserva |
| 11 | **invitations** | domains/invitations/ | ✅ Básico | Se conserva (no prioritario) |
| 12 | **sermons** | domains/sermons/ | ✅ Completo | Recursos → Se generaliza |
| 13 | **notifications** | domains/notifications/ | ✅ Básico | Notificaciones → Se extiende |
| 14 | **admin** | domains/admin/ | ⚠️ Parcial | Administración → Se extiende |

---

## 3. Entidades de Base de Datos (Schema Prisma)

### Entidades Core (ya implementadas)

| Entidad | Tabla | Campos | Estado | Mapeo J-PDVE |
|---------|-------|--------|--------|--------------|
| User | users | 25+ campos | ✅ | User (se simplifica role) |
| UserProfile | user_profiles | 11 campos | ✅ | Se conserva |
| Session | sessions | 8 campos | ✅ | Se conserva |
| Campus | campuses | 7 campos | ✅ | → Church (renombrar) |
| Ministry | ministries | 7 campos | ⚠️ | Evaluar: ¿se necesita? |
| Network | networks | 6 campos | ✅ | Se conserva |
| NetworkLeader | network_leaders | 5 campos | ✅ | Se conserva |
| Group | groups | 20+ campos | ✅ | → MinistryTeam conceptual |
| GroupMember | group_members | 5 campos | ✅ | → TeamMember |
| Membership | memberships | 8 campos | ✅ | Se conserva |
| Invitation | invitations | 8 campos | ✅ | Se conserva |
| DiscipleshipRelationship | discipleship_relationships | 12 campos | ✅ | Se conserva |
| DiscipleshipMilestone | discipleship_milestones | 6 campos | ✅ | Se conserva |
| DiscipleshipCheckIn | discipleship_check_ins | 7 campos | ✅ | Se conserva |
| Permission | permissions | 5 campos | ✅ | Se conserva |
| RolePermission | role_permissions | 4 campos | ✅ | Se conserva |
| UserPermission | user_permissions | 7 campos | ✅ | Se conserva |
| AuditLog | audit_logs | 10 campos | ✅ | Se conserva |
| CellReport | cell_reports | 28 campos | ✅ | Se conserva y extiende |
| StageTransition | stage_transitions | 6 campos | ✅ | → PersonPipelineHistory |
| Sermon | sermons | 13 campos | ✅ | → Resource (generalizar) |
| SermonFile | sermon_files | 6 campos | ✅ | → ResourceFile |
| SermonView | sermon_views | 4 campos | ✅ | → ResourceView |
| Notification | notifications | 8 campos | ✅ | Se extiende |

**Total: 23 entidades, 3 migraciones aplicadas.**

---

## 4. Pantallas Frontend Encontradas (15 rutas)

| # | Ruta | Feature | Estado |
|---|------|---------|--------|
| 1 | /login, /register | auth | ✅ |
| 2 | /dashboard | dashboard | ✅ |
| 3 | /users, /users/:id | users | ✅ |
| 4 | /groups, /groups/:id | groups | ✅ |
| 5 | /networks | networks | ✅ |
| 6 | /discipleship, /discipleship/:id | discipleship | ✅ |
| 7 | /reports | reporting | ✅ |
| 8 | /reports/analytics | reporting | ✅ |
| 9 | /analytics | analytics | ✅ |
| 10 | /audit | audit | ✅ |
| 11 | /invitations | invitations | ✅ |
| 12 | /sermons, /sermons/:id, /sermons/admin | sermons | ✅ |
| 13 | /organigrama | organigrama | ✅ |
| 14 | /pipeline | pipeline | ✅ |
| 15 | /settings, /profile, /cobertura | settings | ✅ |

---

## 5. Duplicidades Encontradas

| # | Área | Duplicidad | Recomendación |
|---|------|-----------|---------------|
| 1 | **User.spiritualStage** vs **StageTransition** | El stage actual está EN el User (campo enum) Y existe historial en StageTransition. Correcto como denormalización. | ✅ Ya correcto — es cache + historial |
| 2 | **User.ministerialRole** vs **UserRole** | MinisterialRole (PASTOR_GENERAL, LIDER, etc.) está como campo en User. UserRole (SUPER_ADMIN, ADMIN, LEADER, MEMBER, GUEST) es el enum de permisos. | ⚠️ Parcialmente separados, pero ambos en User |
| 3 | **Campus** vs concepto de **Church** | Campus es el equivalente actual de Church en J-PDVE. | Renombrar conceptualmente o mapear 1:1 |
| 4 | **Group** como entidad genérica | Group soporta: CELL, MINISTRY, CAMPUS, DEPARTMENT, TEAM, SPECIAL. Esto ya cubre el concepto de MinistryTeam. | ✅ Usar Group type=CELL como MinistryTeam |
| 5 | **Sermons** vs **Resources** | Sermons es un tipo específico de Resource. J-PDVE necesita Resources genérico. | Generalizar: Sermon → Resource con type |

---

## 6. Problemas Encontrados

### Problemas de Diseño

| # | Problema | Impacto | Solución |
|---|----------|---------|----------|
| 1 | **No existe entidad Person separada de User** | El PRD exige Person ≠ User. Actualmente toda persona ES un User. | Crear entidad Person. User referencia a Person. |
| 2 | **No existe concepto de "Church" como tenant** | Multi-church no es posible sin churchId. Campus existe pero no funciona como tenant. | Promover Campus a Church o crear Church como wrapper |
| 3 | **SpiritualStage es un enum hardcoded (4 valores)** | El PRD requiere pipeline configurable (Visitante → ... → Cobertura, 10+ stages). | Migrar de enum a tabla pipeline_stage_configs |
| 4 | **CellReport no tiene period locking** | No hay validación de domingo/lun-mié/jueves+ | Agregar lógica de período en service |
| 5 | **No hay drafts de reportes** | Sin autosave server-side | Agregar CellReportDraft |
| 6 | **No hay fotos en reportes** | Sin upload de evidencia | Agregar ReportPhoto |
| 7 | **No hay comentarios en reportes** | Sin feedback de liderazgo | Agregar ReportComment |

### Problemas Técnicos

| # | Problema | Impacto |
|---|----------|---------|
| 1 | El campo `roles` en User es un ARRAY (multi-role) | Funcional pero inconsistente con RBAC simple |
| 2 | `Group.code` existe pero no usa ltree | Queries de jerarquía no optimizadas |
| 3 | No hay Service Worker ni offline support | Mobile sin offline |
| 4 | No hay PWA manifest | No instalable en móvil |

---

## 7. Deuda Técnica

| # | Deuda | Severidad | Sprint para resolver |
|---|-------|-----------|---------------------|
| 1 | Person ≠ User no implementado | Alta | Sprint 1 (migration) |
| 2 | Pipeline como enum vs configurable | Alta | Sprint 1 (migration) |
| 3 | No hay churchId/tenantId en entidades | Alta | Sprint 1 (si se quiere multi-church) |
| 4 | Sermons hardcoded vs Resources genérico | Media | Sprint 3 |
| 5 | No hay tests E2E | Media | Ongoing |
| 6 | No hay rate limiting granular por endpoint | Baja | Sprint 2 |

---

## 8. Compatibilidad con Nueva Visión (J-PDVE Conexiones)

### Lo que YA está alineado ✅

| Concepto J-PDVE | Implementación Existente |
|-----------------|-------------------------|
| Auth (JWT + Argon2 + Sessions) | ✅ Completo: auth module, guards, decorators |
| Users module | ✅ Completo: CRUD, roles, profile |
| Groups/Equipos | ✅ Group con code, hierarchy, members |
| Networks/Redes | ✅ Network con hierarchy, leaders |
| Cell Reports | ✅ CellReport con todos los campos del PRD |
| Discipleship | ✅ Relationships, milestones, check-ins |
| Permissions (RBAC + ABAC) | ✅ Permission, RolePermission, UserPermission |
| Audit | ✅ AuditLog con before/after values |
| Stage Transitions | ✅ StageTransition (historial básico) |
| Notifications | ✅ Básico funcional |
| Search (Meilisearch) | ✅ Integrado |
| Queue (BullMQ) | ✅ Integrado |
| Cache (Redis) | ✅ Integrado |
| MinisterialRole | ✅ Enum con PASTOR_GENERAL hasta MIEMBRO |
| Hierarchy visibility | ✅ Service implementado |
| Organigrama | ✅ Página existente |
| Pipeline (vista) | ✅ Página existente |

### Lo que FALTA para J-PDVE Conexiones ❌

| Concepto | Estado | Prioridad |
|----------|--------|-----------|
| Person como entidad separada de User | ❌ No existe | Alta (MVP) |
| Church como tenant (multi-church ready) | ❌ Campus no es tenant | Alta (MVP) |
| Pipeline configurable (no enum) | ❌ Hardcoded 4 stages | Alta (MVP) |
| Report period locking (dom/lun-mié/jue+) | ❌ No validado | Alta (MVP) |
| Report drafts (autosave server) | ❌ No existe | Alta (MVP) |
| Report photos (evidence) | ❌ No existe | Media (MVP) |
| Report comments | ❌ No existe | Media (MVP) |
| Resources genérico (vs solo Sermons) | ⚠️ Parcial (sermons) | Media (MVP) |
| Events module | ❌ No existe | Media (V2) |
| Offline sync (Service Worker) | ❌ No existe | Alta (MVP) |
| PWA manifest | ❌ No existe | Alta (MVP) |
| TeamMultiplication entity | ❌ No existe | Media (MVP) |
| TeamHistory event log | ❌ No existe | Media (MVP) |
| MinistryPosition (separar de role) | ❌ No existe | Media (V2) |
| Operational Alerts (auto-generated) | ⚠️ Básico en reporting | Alta (MVP) |
| Dashboard KPIs con cache | ⚠️ Analytics existe pero parcial | Alta (MVP) |
| Map integration (Leaflet) | ❌ No existe | Baja (V2) |
| QR attendance | ❌ No existe | Futuro |

---

## 9. Plan de Integración

### Fase 1: Foundation Fixes (antes de nuevas features)

1. **Crear modelo Person** — Separar de User. User.personId FK.
2. **Promover Campus a Church** — Agregar churchId como tenant a todas las entidades.
3. **Migrar SpiritualStage enum → PipelineStageConfig tabla** — Configurable.
4. **Renombrar StageTransition → PersonPipelineHistory** — Agregar fromStageId/toStageId FK a config.

### Fase 2: Extender lo existente (MVP features)

5. **Extender CellReport** — Report locking, drafts, photos, comments.
6. **Extender Analytics** — KPIs, materialized views, Redis cache.
7. **Extender Notifications** — Más tipos, templates.
8. **Agregar TeamHistory + TeamMultiplication** en Groups module.
9. **Generalizar Sermons → Resources** — Ampliar para PDF, manuales, etc.

### Fase 3: Nuevas capacidades (V2)

10. **Events module** — Nuevo.
11. **MinistryPosition entity** — Separar de UserRole.
12. **Offline sync + PWA** — Frontend infrastructure.
13. **Map integration** — Leaflet en Groups.

---

## 10. Plan de Migración de Datos

| Entidad Actual | Migración | Nueva Estructura |
|---------------|-----------|-----------------|
| Campus | Rename conceptual → Church. Agregar settings, timezone. | Church |
| User.spiritualStage (enum) | Migrar valor a FK → pipeline_stage_configs | User.pipelineStageId |
| StageTransition | Agregar fromStageId/toStageId como FK | PersonPipelineHistory |
| Group (type=CELL) | Ya funciona como MinistryTeam. Sin cambio de tabla. | Group (mantener) |
| Sermon + SermonFile | Generalizar: agregar campo `resourceType`, no eliminar tabla | Resource wrapper o mantener |

---

## 11. Plan de Refactor

| # | Refactor | Impacto | Breaking? |
|---|----------|---------|-----------|
| 1 | Crear Person model | Migration + service layer | Sí (requiere migration) |
| 2 | SpiritualStage enum → tabla | Migration + frontend | Sí (requiere migration) |
| 3 | Agregar churchId a entidades | Migration + middleware | No (se puede hacer nullable primero) |
| 4 | Report period validation | Service logic only | No |
| 5 | Generalizar Sermons | Additive (nueva tabla o extender) | No |
| 6 | TeamHistory + TeamMultiplication | Additive (nuevas tablas) | No |

---

## Conclusión

El proyecto está **muy avanzado** con 14 módulos backend, 15 rutas frontend, y 23 entidades en DB. La arquitectura es sólida (NestJS + Next.js + Prisma + Redis + BullMQ + Meilisearch).

**GAP principal:** La falta de la entidad Person separada de User y el pipeline como enum hardcoded son los únicos cambios estructurales necesarios. Todo lo demás es **extensión aditiva** sobre lo existente.

**Recomendación:** NO reescribir. Evolucionar con migraciones incrementales.

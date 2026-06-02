# 13. Análisis Final de Brechas — J-PDVE Conexiones

> **NUEVO** — Documento de validación final: cambios realizados, conflictos resueltos, y planificación de fases.

---

## Documentos Modificados

| Documento | Tipo de Cambio | Detalle |
|-----------|---------------|---------|
| 04-data-model.md | Pendiente de integrar | Nuevas tablas: person_pipeline_history, ministry_positions, team_history, team_multiplications, events, event_attendances |
| 05-prisma-schema.md | Pendiente de integrar | Nuevos models + UserRole simplificado + nuevos enums |
| 06-use-cases.md | Pendiente de integrar | UC nuevos: Pipeline History, Team History, Events, Ministry Position |
| 07-wireframes.md | Pendiente de integrar | Nuevo tab Timeline en detalle persona, pantalla Eventos |
| 08-navigation-map.md | Pendiente de integrar | Ruta /app/events + sub-rutas |
| 09-security.md | Pendiente de integrar | UserRole simplificado, MinistryPosition para ABAC |
| 10-roadmap.md | Pendiente de integrar | Reorganización: Pipeline History en Sprint 2, Events en Sprint 5 |
| 11-spiritual-growth-model.md | **NUEVO** | Historial pipeline, separación rol/posición, timeline UI |
| 12-events-module.md | **NUEVO** | Módulo completo de eventos MVP |
| 13-final-gap-analysis.md | **NUEVO** | Este documento |

---

## Nuevas Decisiones Arquitectónicas

| # | Decisión | Justificación |
|---|----------|---------------|
| 1 | PersonPipelineHistory como tabla append-only | Inmutabilidad para analytics y compliance |
| 2 | Separar UserRole (3 valores) de MinistryPosition (entidad) | Desacoplar permisos técnicos de jerarquía ministerial |
| 3 | TeamHistory como event sourcing ligero | Trazabilidad completa de cambios en equipos sin sobrecargar audit_logs |
| 4 | TeamMultiplication como entidad formal | Registro histórico de multiplicaciones para analytics de crecimiento |
| 5 | Events como módulo V2 (no MVP) | Reducir scope del MVP, pero diseñar schema desde ahora |
| 6 | MinistryPosition con scope (networkId/teamId) | Un usuario puede tener múltiples posiciones en diferentes contextos |

---

## Conflictos Encontrados y Resolución

### Conflicto 1: UserRole actual vs nuevo modelo simplificado

**Problema:** El diseño actual usa 6 valores en UserRole que mezclan permisos y jerarquía. El cambio a 3 valores rompe toda la lógica ABAC existente.

**Resolución:**
- **MVP (Sprint 1-4):** Mantener UserRole con los 6 valores existentes. Es funcional y no bloquea.
- **V2 (Sprint 5):** Introducir MinistryPosition en paralelo. Migrar la lógica ABAC gradualmente.
- **Justificación:** No retrasar el MVP por un refactoring de permisos que no aporta funcionalidad visible al usuario.

### Conflicto 2: Pipeline History vs Audit Log

**Problema:** El audit_logs ya captura cambios en `persons.pipeline_stage_id`. ¿Es redundante tener `person_pipeline_history`?

**Resolución:**
- **Mantener ambos.** Audit log es genérico (JSON before/after). Pipeline history es una tabla optimizada para queries de analytics (funnel, velocity, timeline). Son complementarias.
- Pipeline history se consulta frecuentemente (dashboard, timeline UI). Audit log se consulta raramente (investigación).

### Conflicto 3: TeamHistory vs Audit Log

**Problema:** Similar al anterior. ¿Team changes ya están en audit_logs?

**Resolución:**
- **TeamHistory** es un event log estructurado con `eventType` tipado. Permite queries como "todos los cambios de líder en la red X". Audit log no tiene esa granularidad sin parsear JSON.
- Se implementa en Sprint 2 junto con Teams.

### Conflicto 4: Events en MVP vs Phase 3 del PRD

**Problema:** El PRD marca Events como Phase 3. Pero el prompt pide "Agregar módulo MVP básico".

**Resolución:**
- **Schema se diseña ahora** (incluido en Prisma schema).
- **Implementación se planifica para V2 (Sprint 5-6)**, no en MVP.
- **No incluye QR** — eso sigue siendo Phase 3.

---

## Nuevas Entidades Pendientes de Integrar

### team_history (TeamHistory)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| team_id | UUID | FK → ministry_teams.id, NOT NULL | |
| church_id | UUID | FK → churches.id, NOT NULL | |
| event_type | ENUM | NOT NULL | Tipo de evento |
| old_value | JSONB | NULL | Valor anterior |
| new_value | JSONB | NULL | Valor nuevo |
| performed_by | UUID | FK → users.id, NOT NULL | Quién realizó el cambio |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Enums:**
```prisma
enum TeamHistoryEventType {
  CREATED
  LEADER_CHANGED
  CO_LEADER_CHANGED
  COVERAGE_CHANGED
  NETWORK_CHANGED
  CODE_CHANGED
  MULTIPLIED
  INACTIVATED
  REACTIVATED

  @@map("team_history_event_type")
}
```

**Índices:** `idx_team_history_team` (team_id, created_at DESC), `idx_team_history_church` (church_id, created_at)

---

### team_multiplications (TeamMultiplication)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| church_id | UUID | FK → churches.id, NOT NULL | |
| parent_team_id | UUID | FK → ministry_teams.id, NOT NULL | Equipo origen |
| new_team_id | UUID | FK → ministry_teams.id, NOT NULL | Equipo nuevo |
| multiplied_by | UUID | FK → users.id, NOT NULL | Quién autorizó |
| multiplied_at | TIMESTAMPTZ | DEFAULT NOW() | |
| notes | VARCHAR(500) | NULL | |
| persons_transferred | INTEGER | DEFAULT 0 | Cantidad de personas movidas |

**Índices:** `idx_multiplication_parent` (parent_team_id), `idx_multiplication_church` (church_id, multiplied_at)

---

## Prisma Additions (a integrar en 05-prisma-schema.md)

```prisma
// Agregar al enum existente NotificationType:
// EVENT_PUBLISHED, EVENT_REMINDER, EVENT_CANCELLED,
// PIPELINE_ADVANCEMENT, TEAM_MULTIPLIED

model TeamHistory {
  id          String                @id @default(uuid())
  teamId      String                @map("team_id")
  churchId    String                @map("church_id")
  eventType   TeamHistoryEventType  @map("event_type")
  oldValue    Json?                 @map("old_value")
  newValue    Json?                 @map("new_value")
  performedBy String                @map("performed_by")
  createdAt   DateTime              @default(now()) @map("created_at")

  team      MinistryTeam @relation(fields: [teamId], references: [id])
  church    Church       @relation(fields: [churchId], references: [id])
  performer User         @relation("TeamHistoryPerformer", fields: [performedBy], references: [id])

  @@index([teamId, createdAt(sort: Desc)])
  @@index([churchId, createdAt])
  @@map("team_history")
}

model TeamMultiplication {
  id                 String   @id @default(uuid())
  churchId           String   @map("church_id")
  parentTeamId       String   @map("parent_team_id")
  newTeamId          String   @map("new_team_id")
  multipliedBy       String   @map("multiplied_by")
  multipliedAt       DateTime @default(now()) @map("multiplied_at")
  notes              String?  @db.VarChar(500)
  personsTransferred Int      @default(0) @map("persons_transferred")

  church     Church       @relation(fields: [churchId], references: [id])
  parentTeam MinistryTeam @relation("MultiplicationParent", fields: [parentTeamId], references: [id])
  newTeam    MinistryTeam @relation("MultiplicationChild", fields: [newTeamId], references: [id])
  actor      User         @relation("MultipliedBy", fields: [multipliedBy], references: [id])

  @@index([parentTeamId])
  @@index([churchId, multipliedAt])
  @@map("team_multiplications")
}
```

---

## Notificaciones Nuevas (a integrar)

| Tipo | Trigger | Destinatarios |
|------|---------|---------------|
| `PIPELINE_ADVANCEMENT` | Persona avanza de stage | Líder del team + Cobertura |
| `TEAM_MULTIPLIED` | Equipo se multiplica | Todos los miembros de ambos teams |
| `EVENT_PUBLISHED` | Evento publicado | Usuarios en scope |
| `EVENT_REMINDER` | 24h antes del evento | Personas registradas |
| `STAGE_CHANGE` | Cambio de stage pastoral | La persona (si tiene user) + líder |

---

## Roadmap Actualizado

### MVP (Sprints 1-4) — SIN CAMBIOS FUNCIONALES

El MVP se mantiene exactamente como estaba. Los nuevos cambios se integran así:

| Sprint | Adición | Impacto |
|--------|---------|---------|
| Sprint 1 | Ninguna | Sin cambios |
| Sprint 2 | PersonPipelineHistory + TeamHistory + TeamMultiplication (schema + backend) | Se incluye en el trabajo de Persons y Teams ya planificado |
| Sprint 3 | Ninguna | Sin cambios |
| Sprint 4 | Funnel ministerial en dashboard + alertas de estancamiento | Se incluye en trabajo de Analytics ya planificado |

### V2 (Sprints 5-6) — NUEVAS FUNCIONALIDADES

| Sprint | Funcionalidad | Dependencia |
|--------|---------------|-------------|
| Sprint 5 | MinistryPosition entity + migración de ABAC | Sprint 2 (Teams + Users) |
| Sprint 5 | Timeline espiritual UI (tab en detalle persona) | Sprint 2 (PipelineHistory) |
| Sprint 5 | Events module: CRUD + publicación | Sprint 1 (Auth + Church) |
| Sprint 6 | Event attendance + check-in manual | Sprint 5 (Events) |
| Sprint 6 | Dashboard de crecimiento espiritual (funnel completo) | Sprint 4 (Dashboard base) |
| Sprint 6 | Organigrama interactivo | Sprint 2 (Hierarchy) |

### Futuro (Phase 3+)

| Funcionalidad | Sprint Estimado |
|---------------|----------------|
| QR per person + auto check-in | Sprint 9-10 |
| Academy module (levels, progress) | Sprint 7-8 |
| Multi-church (tenant isolation) | Sprint 11+ |
| SaaS billing | Sprint 12+ |
| MinistryPosition full ABAC migration | Sprint 7 |
| Communication/announcements module | Sprint 8 |
| Goals & recognition system | Sprint 9 |

---

## Qué Queda para V2

1. ✅ MinistryPosition como entidad separada (Sprint 5)
2. ✅ Timeline espiritual UI (Sprint 5)
3. ✅ Events module CRUD (Sprint 5)
4. ✅ Event attendance (Sprint 6)
5. ✅ Funnel ministerial avanzado (Sprint 6)
6. ✅ ABAC refactoring (usar MinistryPosition en vez de UserRole) (Sprint 5-7)

## Qué Queda para Futuro

1. QR codes + auto check-in
2. Academy module completo
3. Multi-church / SaaS
4. Communications module
5. Goals & recognition
6. Advanced analytics (cohort, predictive)

---

## Validación de Compatibilidad

| Principio Original | ¿Se Mantiene? | Notas |
|-------------------|:-------------:|-------|
| Ministry Team como unidad principal | ✅ | Sin cambios |
| Person ≠ User | ✅ | Sin cambios |
| Architecture multi-church ready | ✅ | churchId en todas las nuevas entidades |
| Mobile-first | ✅ | Wireframes de timeline y eventos son responsive |
| NestJS + Next.js + PostgreSQL + Redis | ✅ | Sin cambios de stack |
| DDD-lite + Repository pattern | ✅ | Nuevos módulos siguen el patrón |
| Audit en todas las mutaciones | ✅ | Pipeline changes y team changes se auditan |
| Soft deletes | ✅ | Nuevas entidades con deletedAt donde aplica |
| ltree para hierarchy | ✅ | Sin cambios |
| Pipeline stages configurables | ✅ | Pipeline history usa FK a pipeline_stage_configs |

---

## Resumen Ejecutivo

Se introdujeron **6 cambios principales** sobre el diseño existente:

1. **PersonPipelineHistory** — Historial completo de avances en el pipeline pastoral
2. **TeamHistory** — Event log de cambios en equipos ministeriales
3. **TeamMultiplication** — Registro formal de multiplicaciones
4. **MinistryPosition** — Separación de rol técnico vs posición ministerial (V2)
5. **Events + EventAttendance** — Módulo básico de eventos (V2)
6. **Nuevas notificaciones** — Pipeline advancement, team multiplied, events

Ningún cambio rompe la arquitectura existente. Todo es **aditivo** y se integra sin refactoring del MVP.

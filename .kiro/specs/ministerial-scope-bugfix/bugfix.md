# Bugfix Requirements Document

## Introduction

The J-PDVE Conexiones platform (deployed pilot) exposes ALL organizational data to ALL authenticated users regardless of their ministerial role. This is a critical security and business logic failure affecting 9+ endpoints/features across the system. The platform must enforce hierarchical filtering ("Ministerial Scope") so that each user sees only the data corresponding to their position in the church's organizational hierarchy: Líder → Cobertura → Pastor de Red → Pastor General.

Additionally, two functional errors prevent core features from working: user detail view returns an error, and invitation sending fails due to missing SMTP configuration. A mobile UX issue in Pipeline (H-015) prevents effective use on small screens.

**Reference:** ADR-010 Ministerial Scope (docs/adr/ADR-010-ministerial-scope.md)

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN any authenticated user (Líder, Cobertura, Pastor de Red) requests `GET /api/v1/groups` THEN the system returns ALL groups across the entire organization without applying hierarchical filtering

1.2 WHEN any authenticated user requests `GET /api/v1/analytics/dashboard` THEN the system returns global KPIs (total attendance, total visitors, total offerings, total teams) calculated across ALL groups regardless of the user's ministerial scope — metrics are NOT recalculated by scope

1.3 WHEN a Líder requests `GET /api/v1/persons` THEN the system returns ALL persons in the database including those belonging to other leaders' cells and coverages

1.4 WHEN a Líder requests the Pipeline view (persons by spiritual stage) THEN the system shows persons from other leaders' groups who are outside the user's ministerial scope

1.5 WHEN a Líder user views the navigation sidebar THEN the system displays "Acceso al Sistema" (users management) and "Gestión de Predicaciones" (sermons admin) menu items which should be restricted to Pastor de Red and Pastor General roles

1.6 WHEN any user requests `GET /api/v1/users/:id` THEN the system returns "Error al cargar el usuario" instead of the user detail

1.7 WHEN an administrator sends `POST /api/v1/invitations` THEN the system returns "Error al enviar la invitación" because SMTP is not configured in the production environment

1.8 WHEN a non-admin user accesses any endpoint THEN the system performs no backend validation of ministerial scope at the query/repository level — only some frontend views are conditionally rendered by role

1.9 WHEN a Líder or Cobertura user accesses reporting or alertas pastorales endpoints THEN the system returns data from groups outside the user's hierarchical scope

1.10 WHEN a Líder views "Alertas Pastorales" THEN the system shows alerts about other leaders' cells that are outside the user's ministerial scope

1.11 WHEN a user views the Pipeline on a mobile device THEN the system renders horizontal Kanban columns that require excessive scrolling, causing the user to lose context of which stage they are viewing

### Expected Behavior (Correct)

2.1 WHEN any authenticated user requests `GET /api/v1/groups` THEN the system SHALL return only groups within the user's ministerial scope: own cell for Líder, child cells for Cobertura, entire network for Pastor de Red, all groups for Pastor General

2.2 WHEN any authenticated user requests `GET /api/v1/analytics/dashboard` THEN the system SHALL RECALCULATE all KPIs (Asistencia, Visitantes, Ofrendas, Equipos, Cumplimiento, Pipeline) using EXCLUSIVELY data from groups within the user's ministerial scope (via `HierarchyVisibilityService.getVisibleGroupIds`) — not merely filter a global list

2.3 WHEN any authenticated user requests `GET /api/v1/persons` THEN the system SHALL return only persons whose `currentGroupId` belongs to the user's visible groups as determined by `HierarchyVisibilityService`

2.4 WHEN any authenticated user views Pipeline THEN the system SHALL show only persons from groups within the user's ministerial scope, filtered at the backend query level

2.5 WHEN a Líder or Cobertura user views the navigation sidebar THEN the system SHALL hide "Acceso al Sistema" (visible only to Pastor de Red and Pastor General) and SHALL hide "Gestión de Predicaciones" admin (visible only to Pastor de Red and Pastor General)

2.6 WHEN any user requests `GET /api/v1/users/:id` THEN the system SHALL return the user detail successfully, validating the ID parameter and handling null Person relationships gracefully

2.7 WHEN an administrator sends `POST /api/v1/invitations` THEN the system SHALL send the invitation email successfully using properly configured SMTP credentials (App Password for Gmail) in the production environment

2.8 WHEN any non-admin user accesses any data endpoint THEN the system SHALL validate ministerial scope at the backend query/repository level using `HierarchyVisibilityService` as the single source of truth — not only at the frontend layer

2.9 WHEN a Líder or Cobertura user accesses reporting or alertas pastorales endpoints THEN the system SHALL return only reports and alerts from groups within the user's hierarchical scope

2.10 WHEN a Líder views "Alertas Pastorales" THEN the system SHALL show ONLY alerts related to cells within the user's ministerial scope — never alerts about other leaders' cells

2.11 WHEN a user views the Pipeline on a mobile device THEN the system SHALL present a tabs-by-stage interface (Ganados | Consolidados | Discipulado | Enviados) instead of horizontal Kanban columns, preventing excessive scrolling and preserving stage context

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a Pastor General (ADMIN/SUPER_ADMIN) requests any endpoint THEN the system SHALL CONTINUE TO return all data across the entire organization without filters

3.2 WHEN any user requests `GET /api/v1/users/organigrama` THEN the system SHALL CONTINUE TO return the full organizational chart (read-only for all roles)

3.3 WHEN any user requests `GET /api/v1/sermons` (sermon list, not admin) THEN the system SHALL CONTINUE TO return all sermons visible to all authenticated users (read-only)

3.4 WHEN an ADMIN/SUPER_ADMIN user views the navigation sidebar THEN the system SHALL CONTINUE TO display all menu items including "Acceso al Sistema", "Gestión Predicaciones", "Invitaciones", "Analytics", and "Auditoría"

3.5 WHEN a user updates their own profile via `PATCH /api/v1/users/me/profile` THEN the system SHALL CONTINUE TO allow the update regardless of ministerial scope

3.6 WHEN the invitation activation endpoint `POST /api/v1/invitations/activate` is called with a valid token THEN the system SHALL CONTINUE TO create the user account correctly

3.7 WHEN existing RBAC role checks (JwtAuthGuard + RolesGuard) validate endpoint access THEN the system SHALL CONTINUE TO enforce role-based access control alongside the new hierarchical scope filtering

3.8 WHEN an authenticated user accesses `GET /api/v1/users/cobertura` THEN the system SHALL CONTINUE TO return the coverage tree (read-only for all roles)

3.9 WHEN a user views the Pipeline on desktop THEN the system SHALL CONTINUE TO display the Kanban column layout (unchanged for large screens)

---

## Ministerial Scope Definition (ADR-010)

### Visibility Matrix by Role

| Rol | VE (datos visibles) | NO VE (datos ocultos) |
|-----|--------------------|-----------------------|
| **Líder** | Su célula, sus discípulos, sus visitantes, sus co-líderes | Otras células, otras coberturas, otras redes |
| **Cobertura** | Todas las células hijas, todos los discípulos de sus células hijas | Otras coberturas, otras redes, células no descendientes |
| **Pastor de Red** | Toda la red asignada (todos los descendientes de su código) | Otras redes, células fuera de su red |
| **Pastor General** | Toda la organización sin restricciones | N/A — acceso total |

### VIEW_PERMISSION vs MANAGE_PERMISSION Matrix

| Funcionalidad | Pastor General | Pastor de Red | Cobertura | Líder |
|---------------|:-:|:-:|:-:|:-:|
| **VIEW — Dashboard (scoped KPIs)** | ✓ All | ✓ Su red | ✓ Sus células hijas | ✓ Su célula |
| **VIEW — Equipos (lista)** | ✓ All | ✓ Su red | ✓ Sus células hijas | ✓ Su célula |
| **VIEW — Personas** | ✓ All | ✓ Su red | ✓ Sus células hijas | ✓ Su célula |
| **VIEW — Pipeline** | ✓ All | ✓ Su red | ✓ Sus células hijas | ✓ Su célula |
| **VIEW — Reportes** | ✓ All | ✓ Su red | ✓ Sus células hijas | ✓ Su célula |
| **VIEW — Discipulado** | ✓ All | ✓ Su red | ✓ Sus células hijas | ✓ Su célula |
| **VIEW — Organigrama** | ✓ All | ✓ All | ✓ All | ✓ All |
| **VIEW — Predicaciones (lista)** | ✓ All | ✓ All | ✓ All | ✓ All |
| **VIEW — Alertas Pastorales** | ✓ All | ✓ Su red | ✓ Sus células hijas | ✓ Su célula |
| **MANAGE — Usuarios (CRUD)** | ✓ | ✓ | ✗ | ✗ |
| **MANAGE — Predicaciones (admin)** | ✓ | ✓ | ✗ | ✗ |
| **MANAGE — Invitaciones** | ✓ | ✓ | ✗ | ✗ |
| **MANAGE — Configuración global** | ✓ | ✗ | ✗ | ✗ |
| **MANAGE — Auditoría (ver logs)** | ✓ | ✓ | ✗ | ✗ |

### Dashboard KPI Recalculation Requirement

The dashboard MUST RECALCULATE (not merely filter) the following KPIs using EXCLUSIVELY the user's visible scope:

| KPI | Cálculo | Scope Source |
|-----|---------|--------------|
| **Asistencia** | SUM(attendance) de reportes de células visibles | `getVisibleGroupIds` |
| **Visitantes** | COUNT(visitors) de reportes de células visibles | `getVisibleGroupIds` |
| **Ofrendas** | SUM(offerings) de reportes de células visibles | `getVisibleGroupIds` |
| **Equipos** | COUNT(groups) visibles activos | `getVisibleGroupIds` |
| **Cumplimiento** | (reportes entregados / reportes esperados) de células visibles | `getVisibleGroupIds` |
| **Pipeline** | COUNT(persons) por stage en grupos visibles | `getVisibleGroupIds` → persons |

If the system only filters a global aggregation list, it will continue showing global metrics — this is explicitly incorrect.

### Alertas Pastorales Scope Filtering

Alertas Pastorales MUST be filtered by the user's ministerial scope:
- A Líder receives alerts ONLY about their own cell (missed reports, declining attendance, etc.)
- A Cobertura receives alerts ONLY about their child cells
- A Pastor de Red receives alerts ONLY about their network
- A Pastor General receives all alerts

A Líder MUST NOT receive alerts about other leaders' cells under any circumstance.

---

## E2E Acceptance Scenarios (Mandatory Automated Tests)

### Scenario 1: Líder E5.8 — Daphne Camarena

**Role:** Líder
**Leader Code:** E5.8

| Assertion | Expected |
|-----------|----------|
| MUST see — Groups | "Daphne & Erick" (E5.8) |
| MUST see — Persons | Disciples and visitors of E5.8 |
| MUST see — Reports | Reports from E5.8 only |
| MUST see — Pipeline | Persons in E5.8 by stage |
| MUST see — Dashboard KPIs | Recalculated from E5.8 data only |
| MUST see — Alertas | Only alerts for E5.8 |
| MUST NOT see — Groups | E5.1, E5.2, E5.3, E5.4, E5.5, E5.6, E5.7 |
| MUST NOT see — Persons | Any person from E5.1–E5.7 |
| MUST NOT see — Menu | "Acceso al Sistema", "Gestión Predicaciones" admin |

### Scenario 2: Cobertura E5.6 — Augusto Monterrey

**Role:** Cobertura
**Leader Code:** E5.6

| Assertion | Expected |
|-----------|----------|
| MUST see — Groups | E5.6, E5.6.1, E5.6.2, E5.6.3 |
| MUST see — Persons | All persons in E5.6, E5.6.1, E5.6.2, E5.6.3 |
| MUST see — Reports | Reports from E5.6.* |
| MUST see — Pipeline | Persons in E5.6.* by stage |
| MUST see — Dashboard KPIs | Recalculated from E5.6.* data only |
| MUST see — Alertas | Only alerts for E5.6.* cells |
| MUST NOT see — Groups | E5.1, E5.2, E5.3, E5.4, E5.5, E5.7, E5.8 |
| MUST NOT see — Persons | Any person outside E5.6.* |
| MUST NOT see — Menu | "Acceso al Sistema", "Gestión Predicaciones" admin |

### Scenario 3: Pastor de Red E5 — Oris Alvarez

**Role:** Pastor de Red
**Leader Code:** E5

| Assertion | Expected |
|-----------|----------|
| MUST see — Groups | E5.1, E5.2, E5.3, E5.4, E5.5, E5.6, E5.7, E5.8 (and all descendants) |
| MUST see — Persons | All persons in E5.* |
| MUST see — Reports | Reports from all E5.* cells |
| MUST see — Pipeline | Persons in E5.* by stage |
| MUST see — Dashboard KPIs | Recalculated from E5.* data only |
| MUST see — Alertas | Alerts for all E5.* cells |
| MUST see — Menu | "Acceso al Sistema", "Gestión Predicaciones" admin |
| MUST NOT see — Groups | E4, E3, E2, E1 (other networks) |
| MUST NOT see — Persons | Any person from E4, E3, E2, E1 |

### Scenario 4: Pastor General — admin@jpdve.local

**Role:** Pastor General (ADMIN/SUPER_ADMIN)

| Assertion | Expected |
|-----------|----------|
| MUST see — Groups | ALL groups in the organization |
| MUST see — Persons | ALL persons |
| MUST see — Dashboard KPIs | Global metrics (entire organization) |
| MUST see — Menu | ALL menu items without restriction |

---

## H-015: Mobile Pipeline UX (New Hallazgo)

### Current Behavior (Defect)

1.11 (see above) — Pipeline renders as horizontal Kanban columns on mobile, requiring excessive horizontal scrolling. Users lose context of which spiritual stage they are viewing.

### Expected Behavior (Correct)

2.11 (see above) — On mobile viewports (≤ 768px), Pipeline SHALL render as a tab-based interface with tabs for each spiritual stage:

```
[Ganados] [Consolidados] [Discipulado] [Enviados]
```

- Each tab shows a vertical list of persons in that stage
- Active tab is visually highlighted
- Swipe gesture between tabs is supported
- Person count badge on each tab
- Desktop (> 768px) continues to show the Kanban column layout

---

## Bug Condition Derivation

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type { userId: string, roles: string[], endpoint: string, viewport: string }
  OUTPUT: boolean
  
  // C1: Hierarchical scope not enforced
  LET scopedEndpoints = [
    "GET /groups", "GET /persons", "GET /analytics/dashboard",
    "GET /pipeline", "GET /reporting", "GET /alerts",
    "GET /alertas-pastorales", "GET /users" (list)
  ]
  
  LET isHierarchyBug = NOT isFullAccess(X.roles) AND X.endpoint IN scopedEndpoints
  
  // C2: Mobile Pipeline UX
  LET isMobilePipelineBug = X.endpoint = "GET /pipeline" AND X.viewport <= 768
  
  // C3: Functional errors
  LET isFunctionalBug = X.endpoint IN ["GET /users/:id", "POST /invitations"]
  
  RETURN isHierarchyBug OR isMobilePipelineBug OR isFunctionalBug
END FUNCTION
```

### Property Specification — Fix Checking (Hierarchical Scope)

```pascal
// Property: Hierarchical Scope Enforcement
FOR ALL X WHERE NOT isFullAccess(X.roles) AND X.endpoint IN scopedEndpoints DO
  visibleGroupIds ← HierarchyVisibilityService.getVisibleGroupIds(X.userId, X.roles)
  result ← F'(X)
  
  // Every item in the response belongs to the user's visible scope
  FOR ALL item IN result.data DO
    ASSERT item.groupId IN visibleGroupIds OR item.id IN getVisibleUserIds(X.userId, X.roles)
  END FOR
END FOR
```

### Property Specification — Dashboard KPI Recalculation

```pascal
// Property: Dashboard KPIs are recalculated by scope, not filtered from global
FOR ALL X WHERE NOT isFullAccess(X.roles) AND X.endpoint = "GET /analytics/dashboard" DO
  visibleGroupIds ← HierarchyVisibilityService.getVisibleGroupIds(X.userId, X.roles)
  result ← F'(X)
  
  // KPIs are computed from scoped data only
  ASSERT result.attendance = SUM(reports.attendance WHERE groupId IN visibleGroupIds)
  ASSERT result.visitors = COUNT(reports.visitors WHERE groupId IN visibleGroupIds)
  ASSERT result.offerings = SUM(reports.offerings WHERE groupId IN visibleGroupIds)
  ASSERT result.teams = COUNT(groups WHERE id IN visibleGroupIds AND active = true)
  ASSERT result.compliance = (delivered / expected) WHERE groupId IN visibleGroupIds
  ASSERT result.pipeline = COUNT(persons BY stage WHERE currentGroupId IN visibleGroupIds)
END FOR
```

### Property Specification — Alertas Pastorales Scope

```pascal
// Property: Alertas Pastorales respect ministerial scope
FOR ALL X WHERE NOT isFullAccess(X.roles) AND X.endpoint = "GET /alertas-pastorales" DO
  visibleGroupIds ← HierarchyVisibilityService.getVisibleGroupIds(X.userId, X.roles)
  result ← F'(X)
  
  FOR ALL alert IN result.data DO
    ASSERT alert.groupId IN visibleGroupIds
  END FOR
END FOR
```

### Property Specification — Menu Visibility

```pascal
// Property: Menu items respect role restrictions (VIEW vs MANAGE)
FOR ALL X WHERE X.roles = ['LEADER'] (Líder or Cobertura level) DO
  visibleMenuItems ← getMenuItems(X.roles)
  ASSERT "Acceso al Sistema" NOT IN visibleMenuItems
  ASSERT "Gestión Predicaciones" NOT IN visibleMenuItems
  ASSERT "Invitaciones" NOT IN visibleMenuItems
  ASSERT "Auditoría" NOT IN visibleMenuItems
END FOR
```

### Property Specification — Mobile Pipeline UX

```pascal
// Property: Pipeline renders tabs on mobile
FOR ALL X WHERE X.endpoint = "GET /pipeline" AND X.viewport <= 768 DO
  ui ← renderPipeline(X)
  ASSERT ui.layout = "tabs"
  ASSERT ui.tabs = ["Ganados", "Consolidados", "Discipulado", "Enviados"]
  ASSERT ui.horizontalScroll = false
END FOR
```

### Preservation Goal

```pascal
// Property: Preservation Checking — Admin full access unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR

// Specifically:
FOR ALL X WHERE isFullAccess(X.roles) DO
  ASSERT F'(X).data = F(X).data  // Same results, no filtering applied
END FOR

// Desktop Pipeline layout unchanged
FOR ALL X WHERE X.endpoint = "GET /pipeline" AND X.viewport > 768 DO
  ASSERT F'(X).layout = F(X).layout  // Kanban columns preserved
END FOR
```

---

---

## RF-PIPE-009: Ministerial Ownership (ADR-011)

### Problem

The system currently models only hierarchical VISIBILITY (`currentGroupId` → who can SEE a person). However, J-PDVE distinguishes between:
- **VISIBILITY**: Who can see a person (determined by `currentGroupId` + hierarchy)
- **OWNERSHIP**: Who is RESPONSIBLE for that person's spiritual advancement (determined by `ownerLeaderId`)

These are NOT the same rule. Seeing ≠ Administering.

### Required Model

Every Person SHALL have:

| Field | Meaning | Example |
|-------|---------|---------|
| `currentGroupId` | Which cell/team the person currently belongs to | E5.6.1 |
| `ownerLeaderId` | Which leader is directly responsible for this person | Angelo (userId) |

### Ownership Permission Matrix

| Role relative to Person | VER | EDITAR | DISCIPULAR | PROMOVER ETAPAS | SEGUIMIENTO | REASIGNAR |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Owner (ownerLeaderId)** | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Cobertura (parent of currentGroup)** | ✓ | ✗ | ✗ | ✗ | ✗ Supervisar/Comentar | ✗ |
| **Pastor de Red** | ✓ | ✗ | ✗ | ✗ | ✗ Supervisar | ✓ (excepcional) |
| **Pastor General** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Transfer Rule

**Principle:** Ownership follows current discipleship, NOT the leader who originally won the person.

WHEN a person is transferred to a different cell:
- `currentGroupId` → new group
- `ownerLeaderId` → leader of new group (automatic)
- Previous leader retains: History, Timeline, Audit trail
- Previous leader loses: Edit, Follow-up, Stage promotion, Administration

### Transfer Event

The system SHALL automatically register `PERSON_TRANSFERRED`:
```
{
  personId, fromGroupId, toGroupId,
  previousOwnerLeaderId, newOwnerLeaderId,
  transferredBy, transferredAt, reason?
}
```

Timeline Espiritual SHALL show: "Transferido de [fromGroup] a [toGroup]"

### Impact on Existing Hallazgos

| Module | Ownership Impact |
|--------|-----------------|
| H-005 Personas | Filter by visibility, but ACTIONS restricted by ownership |
| H-006 Pipeline | Promote/edit only by owner; view by scope |
| Discipulado | Only owner can register follow-up sessions |
| Dashboard KPIs | Ownership doesn't affect KPIs (calculated by visibility scope) |
| Alertas | Follow-up alerts directed to owner, not just visible users |

### E2E Scenarios for Ownership

**Scenario A: Owner Actions**
```
Person: Juan Pérez
currentGroupId = E5.6.1, ownerLeaderId = Angelo

Angelo → CAN: Edit, Disciple, Promote stage, Register follow-up
Augusto (Cobertura E5.6) → CAN: View, Supervise, Comment. CANNOT: Promote
Oris (Pastor Red E5) → CAN: View, Supervise, Reassign ownership
Admin → CAN: Everything
```

**Scenario B: Transfer**
```
Juan transfers from E5.6.1 → E5.7.2

AFTER:
  currentGroupId = E5.7.2
  ownerLeaderId = Leader of E5.7.2
  Event: PERSON_TRANSFERRED logged
  Timeline: "Transferido de E5.6.1 a E5.7.2"
  Angelo: loses admin, keeps history read-only
```

---

## Implementation Constraints

- **No new modules** — evolve existing code incrementally
- **No architecture changes** — use existing patterns (Repository → Service → Controller)
- **Single source of truth** — `HierarchyVisibilityService` for VISIBILITY scope resolution
- **Ownership source of truth** — `ownerLeaderId` field on Person for ACTION permissions
- **ADR-010** governs VISIBILITY (who can see)
- **ADR-011** governs OWNERSHIP (who can act)
- **Backend-first** — all filtering MUST happen at the query/repository level
- **Frontend complementary** — UI filters are for UX only, never for security
- **Additive migrations only** — `ownerLeaderId` added as nullable, backfilled from group leader

# 11. Modelo de Crecimiento Espiritual — J-PDVE Conexiones

> **NUEVO** — Este documento formaliza el historial del pipeline pastoral, la separación Rol/Posición Ministerial, y el timeline espiritual.

---

## Problema Identificado

La versión anterior del diseño solo registra el **stage actual** de una persona (`pipeline_stage_id` en Person). No existe historial de transiciones ni la capacidad de construir una línea de tiempo espiritual completa.

Además, los roles del sistema (UserRole) mezclan **permisos técnicos** con **posiciones ministeriales**, lo cual genera acoplamiento innecesario.

---

## Cambio 1: Historial del Pipeline Pastoral (PersonPipelineHistory)

### Propósito

Registrar cada transición de pipeline de una persona, permitiendo:
- Construir una línea de tiempo espiritual completa
- Analytics de velocidad de progresión
- Auditoría de quién promovió a quién y cuándo
- Funnel ministerial con datos reales

### Entidad: person_pipeline_history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| person_id | UUID | FK → persons.id, NOT NULL | Persona que avanzó |
| from_stage_id | UUID | FK → pipeline_stage_configs.id, NULL | Stage anterior (NULL si es asignación inicial) |
| to_stage_id | UUID | FK → pipeline_stage_configs.id, NOT NULL | Nuevo stage |
| changed_by | UUID | FK → users.id, NOT NULL | Quién realizó el cambio |
| changed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Cuándo ocurrió |
| notes | VARCHAR(500) | NULL | Notas del cambio |
| church_id | UUID | FK → churches.id, NOT NULL | Tenant |

**Índices:**
- `idx_pipeline_history_person` (person_id, changed_at DESC)
- `idx_pipeline_history_church_date` (church_id, changed_at)
- `idx_pipeline_history_to_stage` (to_stage_id, changed_at)

### Prisma Model

```prisma
model PersonPipelineHistory {
  id          String   @id @default(uuid())
  personId    String   @map("person_id")
  fromStageId String?  @map("from_stage_id")
  toStageId   String   @map("to_stage_id")
  changedBy   String   @map("changed_by")
  changedAt   DateTime @default(now()) @map("changed_at")
  notes       String?  @db.VarChar(500)
  churchId    String   @map("church_id")

  // Relations
  person    Person              @relation(fields: [personId], references: [id])
  fromStage PipelineStageConfig? @relation("FromStage", fields: [fromStageId], references: [id])
  toStage   PipelineStageConfig  @relation("ToStage", fields: [toStageId], references: [id])
  actor     User                @relation("PipelineChangedBy", fields: [changedBy], references: [id])
  church    Church              @relation(fields: [churchId], references: [id])

  @@index([personId, changedAt(sort: Desc)])
  @@index([churchId, changedAt])
  @@index([toStageId, changedAt])
  @@map("person_pipeline_history")
}
```

### Comportamiento

1. Al crear una Person con stage inicial → INSERT en `person_pipeline_history` con `from_stage_id = NULL`
2. Al avanzar/retroceder stage → INSERT nuevo registro + UPDATE `person.pipeline_stage_id`
3. La tabla es **append-only** (nunca se edita ni elimina un registro)
4. Audit log registra el cambio además (redundancia intencional para compliance)

### Impacto en Pipeline Stages Existentes

```
Visitante → Consolidado → Academia N1 → Academia N2 → Academia N3 → Servidor → Líder Potencial → Líder → Cobertura
```

Los stages configurables (`pipeline_stage_configs`) no cambian. El historial solo registra movimientos entre ellos.

---

## Cambio 2: Separación Rol Técnico vs Posición Ministerial

### Problema

Actualmente `UserRole` incluye:
```
SUPER_ADMIN, PASTOR_GENERAL, PASTOR_RED, COBERTURA, MINISTRY_TEAM, MEMBER
```

Esto mezcla:
- **Permisos técnicos** (qué puede hacer en el sistema)
- **Posición ministerial** (qué es en la jerarquía del ministerio)

### Solución: Dos conceptos separados

#### Roles Técnicos (UserRole) — SIMPLIFICADOS

```prisma
enum UserRole {
  SUPER_ADMIN   // Admin técnico del sistema
  ADMIN         // Pastor General (full access a su iglesia)
  USER          // Cualquier otro usuario autenticado

  @@map("user_role")
}
```

#### Posiciones Ministeriales (MinistryPosition) — NUEVA ENTIDAD

```prisma
enum MinistryPositionType {
  PASTOR_GENERAL
  PASTOR_RED
  COBERTURA
  LIDER
  CO_LIDER
  DISCIPULO
  MIEMBRO

  @@map("ministry_position_type")
}

model MinistryPosition {
  id           String               @id @default(uuid())
  userId       String               @map("user_id")
  churchId     String               @map("church_id")
  positionType MinistryPositionType @map("position_type")
  networkId    String?              @map("network_id")     // Scope: a qué red aplica
  teamId       String?              @map("team_id")        // Scope: a qué equipo aplica
  assignedBy   String               @map("assigned_by")
  assignedAt   DateTime             @default(now()) @map("assigned_at")
  removedAt    DateTime?            @map("removed_at")
  notes        String?              @db.VarChar(300)

  // Relations
  user       User         @relation(fields: [userId], references: [id])
  church     Church       @relation(fields: [churchId], references: [id])
  network    Network?     @relation(fields: [networkId], references: [id])
  team       MinistryTeam? @relation(fields: [teamId], references: [id])
  assigner   User         @relation("PositionAssignedBy", fields: [assignedBy], references: [id])

  @@index([userId, removedAt])
  @@index([churchId, positionType])
  @@index([networkId])
  @@index([teamId])
  @@map("ministry_positions")
}
```

### Cómo se Determina la Visibilidad (ABAC Actualizado)

```typescript
// El scope de visibilidad se deriva de MinistryPosition, no de UserRole
function getVisibilityScope(user: User, positions: MinistryPosition[]): VisibilityScope {
  // Obtener la posición activa más alta
  const activePositions = positions.filter(p => p.removedAt === null);
  const highest = getHighestPosition(activePositions);
  
  switch (highest.positionType) {
    case 'PASTOR_GENERAL':
      return { scope: 'church', churchId: user.churchId };
    case 'PASTOR_RED':
      return { scope: 'network', networkId: highest.networkId };
    case 'COBERTURA':
      return { scope: 'teams', teamIds: getSupervisionTeamIds(highest) };
    case 'LIDER':
    case 'CO_LIDER':
      return { scope: 'team', teamId: highest.teamId };
    default:
      return { scope: 'self', userId: user.id };
  }
}
```

### Beneficios

| Antes | Después |
|-------|---------|
| Cambiar de líder a cobertura requiere cambiar UserRole | Solo agregar nueva MinistryPosition |
| Un user solo puede tener un rol | Un user puede tener múltiples posiciones (Pastor de Red + Líder en otro team) |
| Permisos y jerarquía acoplados | Permisos técnicos simples, jerarquía flexible |
| No hay historial de posiciones | Historial completo con `removedAt` |

### Migración de Datos (Estrategia)

1. Los `UserRole` existentes (PASTOR_GENERAL, PASTOR_RED, COBERTURA, MINISTRY_TEAM) se migran a `MinistryPosition`
2. `UserRole` se simplifica a SUPER_ADMIN / ADMIN / USER
3. La lógica ABAC usa `MinistryPosition` en lugar de `UserRole` para scope
4. Los guards existentes se adaptan: `@Roles('ADMIN')` + `@MinistryPosition('COBERTURA')`

---

## Cambio 3: Timeline Espiritual (UI)

### Wireframe: Detalle de Persona → Tab Timeline

```
┌───────────────────────────────────────────────────────────┐
│ [←] Carlos Gómez                                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  [Perfil] [Timeline] [Equipo] [Historial]                │
│            ~~~~~~~~                                       │
│                                                           │
│  ─── Timeline Espiritual ───                             │
│                                                           │
│  ┌─────────────────────────────────────────────┐         │
│  │                                             │         │
│  │  ● 12/08/2026 · Líder                      │         │
│  │  │  Promovido por: Pastor Carlos            │         │
│  │  │  "Completó todos los requisitos"         │         │
│  │  │                                          │         │
│  │  ● 03/05/2026 · Servidor                   │         │
│  │  │  Promovido por: Cobertura Juan           │         │
│  │  │                                          │         │
│  │  ● 15/02/2026 · Academia Nivel 1           │         │
│  │  │  Promovido por: Sistema                  │         │
│  │  │  "Graduado de Academia N1"               │         │
│  │  │                                          │         │
│  │  ● 22/01/2026 · Consolidado                │         │
│  │  │  Promovido por: Líder María              │         │
│  │  │                                          │         │
│  │  ○ 15/01/2026 · Visitante                  │         │
│  │     Registrado por: Líder María             │         │
│  │                                             │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  ─── Tiempo en cada etapa ───                            │
│  Visitante:    7 días                                    │
│  Consolidado:  24 días                                   │
│  Academia N1:  77 días                                   │
│  Servidor:     97 días                                   │
│  Líder:        (actual)                                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Datos que alimenta

- **Dashboard KPI**: "Personas promovidas esta semana/mes"
- **Funnel ministerial**: Porcentaje en cada stage, velocidad de transición
- **Analytics**: Tiempo promedio en cada stage, comparativa por red
- **Alertas**: Personas estancadas (6+ meses sin movimiento)

---

## Cambio 4: Dashboard de Crecimiento Espiritual

### Nuevos KPIs (agregar al Dashboard Ejecutivo)

| KPI | Cálculo | Ubicación |
|-----|---------|-----------|
| Visitantes esta semana | COUNT persons WHERE current_stage = 'VISITANTE' AND created_at en esta semana | Dashboard |
| Consolidados este mes | COUNT pipeline_history WHERE to_stage = 'CONSOLIDADO' AND changed_at este mes | Dashboard |
| En Academia | COUNT persons WHERE current_stage LIKE 'ACADEMIA%' | Dashboard |
| Servidores activos | COUNT persons WHERE current_stage = 'SERVIDOR' | Dashboard |
| Nuevos Líderes este trimestre | COUNT pipeline_history WHERE to_stage = 'LIDER' AND changed_at este trimestre | Dashboard |

### Funnel Ministerial (nueva visualización)

```
┌──────────────────────────────────────────────┐
│  Funnel Ministerial (últimos 12 meses)       │
│                                              │
│  Visitantes          ████████████████  156   │
│  Consolidados        ██████████████    98    │
│  Academia            ██████████        67    │
│  Servidores          ██████            42    │
│  Líderes Potenciales ████              28    │
│  Líderes             ███               18    │
│  Coberturas          █                  5    │
│                                              │
│  Conversión total: 3.2% (Visitante→Líder)    │
│  Tiempo promedio: 14 meses                   │
└──────────────────────────────────────────────┘
```

---

## Auditoría Específica

Eventos nuevos para audit:
- `PIPELINE_ADVANCEMENT` — persona avanzó de stage
- `PIPELINE_REGRESSION` — persona retrocedió (raro, pero posible)
- `MINISTRY_POSITION_ASSIGNED` — nueva posición ministerial asignada
- `MINISTRY_POSITION_REMOVED` — posición removida

---

## Relación con Diseño Existente

| Componente Existente | Impacto |
|---------------------|---------|
| `persons.pipeline_stage_id` | Se mantiene como cache del stage actual (denormalización intencional) |
| `persons.pipeline_stage_date` | Se mantiene, se actualiza al crear registro en history |
| `pipeline_stage_configs` | Sin cambios, sigue siendo configurable por iglesia |
| `person_team_history` | Sin cambios, es ortogonal al pipeline history |
| Dashboard KPIs | Se agregan nuevos KPIs de crecimiento espiritual |
| UserRole enum | Se simplifica a SUPER_ADMIN / ADMIN / USER |
| ABAC visibility | Se refactora para usar MinistryPosition en lugar de UserRole |

---

## Decisiones de Diseño

| Decisión | Justificación |
|----------|---------------|
| `person_pipeline_history` separada de `person_team_history` | Son dimensiones ortogonales: una persona puede cambiar de equipo sin cambiar de stage, y viceversa |
| `from_stage_id` nullable | El primer registro (ingreso como visitante) no tiene "from" |
| `changed_by` obligatorio | Trazabilidad absoluta de quién promovió |
| Historial append-only | Inmutabilidad para compliance y analytics confiables |
| MinistryPosition como entidad separada de User | Permite historial, múltiples posiciones, y desacoplamiento de permisos |
| UserRole simplificado a 3 valores | Los permisos granulares se derivan de MinistryPosition + ABAC |

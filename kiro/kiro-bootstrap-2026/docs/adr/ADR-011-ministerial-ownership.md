# ADR-011: Ministerial Ownership — Separación de Visibilidad y Responsabilidad

## Estado
APROBADO

## Fecha
2026-06-02

## Contexto

El piloto reveló que el sistema confunde dos conceptos distintos:
- **VISIBILIDAD** (quién puede VER una persona)
- **OWNERSHIP** (quién es RESPONSABLE de esa persona)

Actualmente solo modelamos `currentGroupId` que resuelve visibilidad jerárquica. Pero en J-PDVE, las acciones sobre el pipeline espiritual de una persona (promover etapas, registrar seguimiento, discipular) pertenecen únicamente al **líder responsable**, no a todos los que pueden ver la persona.

## Decisión

### 1. Modelo de Datos

Toda Persona tendrá dos campos clave:

| Campo | Significado | Ejemplo |
|-------|-------------|---------|
| `currentGroupId` | ¿En qué célula está actualmente? | E5.6.1 |
| `ownerLeaderId` | ¿Quién es su líder responsable directo? | Angelo (userId) |

### 2. Separación Formal: VISIBILITY vs OWNERSHIP

#### VISIBILITY (¿quién puede VER?)

Se calcula mediante `HierarchyVisibilityService` basado en `currentGroupId`:

```
Persona en E5.6.1 → Visible para:
  - Líder E5.6.1 (directo)
  - Cobertura E5.6 (padre)
  - Pastor Red E5 (abuelo)
  - Pastor General (todos)
```

#### OWNERSHIP (¿quién puede ADMINISTRAR?)

Se calcula mediante `ownerLeaderId`:

| Rol | Puede VER | Puede ADMINISTRAR |
|-----|-----------|-------------------|
| **Owner (ownerLeaderId)** | ✓ | ✓ Editar, Discipular, Promover etapas, Registrar seguimiento |
| **Cobertura** | ✓ | ✗ Solo supervisar y comentar. NO puede promover etapas |
| **Pastor de Red** | ✓ | ⚡ Reasignar ownership, intervenir excepcionalmente |
| **Pastor General** | ✓ | ✓ Todo |

### 3. Regla de Transferencia

**Principio: Ownership sigue al discipulado actual, NO al líder que ganó originalmente.**

Cuando una persona cambia de célula:

```
ANTES:
  currentGroupId = E5.6.1
  ownerLeaderId = Angelo

TRANSFERENCIA → E5.7.2

DESPUÉS:
  currentGroupId = E5.7.2
  ownerLeaderId = Nuevo líder de E5.7.2 (automático)
```

El líder anterior conserva:
- ✓ Historial
- ✓ Timeline
- ✓ Auditoría

El líder anterior pierde:
- ✗ Edición
- ✗ Seguimiento
- ✗ Promoción de etapas
- ✗ Administración

### 4. Evento de Transferencia

Registrar evento automático `PERSON_TRANSFERRED`:

```typescript
{
  personId: string;
  fromGroupId: string;
  toGroupId: string;
  previousOwnerLeaderId: string;
  newOwnerLeaderId: string;
  transferredBy: string;  // userId que ejecutó
  transferredAt: Date;
  reason?: string;
}
```

Timeline Espiritual muestra: "Transferido de E5.6.1 a E5.7.2"

### 5. Impacto en Módulos

| Módulo | Impacto |
|--------|---------|
| Personas | Agregar `ownerLeaderId` |
| Pipeline | Acciones (promover) solo por owner |
| Discipulado | Solo owner puede registrar seguimiento |
| Timeline | Evento de transferencia visible |
| Reportes | Owner reporta sobre sus personas |
| Dashboard | KPIs por ownership y por visibilidad |
| Alertas | Alertas de seguimiento dirigidas al owner |

## Consecuencias

- Se agrega campo `ownerLeaderId` al modelo Person (migración additive)
- Pipeline diferencia entre VER (scope) y ACTUAR (ownership)
- Transferencias actualizan ambos campos automáticamente
- ADR-010 (Ministerial Scope) maneja VISIBILIDAD
- ADR-011 (este) maneja OWNERSHIP/RESPONSABILIDAD
- No se crean módulos nuevos; se evoluciona el modelo existente

## Casos E2E

### Caso 1: Acciones por rol

```
Persona: Juan Pérez
currentGroupId = E5.6.1
ownerLeaderId = Angelo

Angelo (Owner):      ✓ Promover etapas ✓ Editar ✓ Discipular ✓ Seguimiento
Cobertura E5.6:      ✓ Ver ✓ Supervisar ✓ Comentar ✗ Promover
Pastor Red E5:       ✓ Ver ✓ Supervisar ✓ Reasignar ownership
Pastor General:      ✓ Todo
```

### Caso 2: Transferencia

```
Juan pasa de E5.6.1 → E5.7.2

Resultado:
  currentGroupId = E5.7.2
  ownerLeaderId = Líder de E5.7.2 (automático)
  Evento: PERSON_TRANSFERRED registrado
  Timeline: "Transferido de E5.6.1 a E5.7.2"
  Angelo: pierde administración, conserva historial
```

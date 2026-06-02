# ADR-011A: Hybrid Discipleship Model

## Estado
APROBADO (implementación V2)

## Fecha
2026-06-02

## Contexto

El módulo Discipulado tiene valor funcional real (check-ins, milestones, seguimiento 1:1) pero su modelo actual requiere creación manual de relaciones mentor-discípulo, lo cual duplica información que ya existe implícitamente en la estructura ministerial (`ownerLeaderId`, `currentGroupId`, jerarquía de liderazgo).

## Decisión

El módulo operará bajo un **modelo híbrido** con dos tipos de relaciones:

### Tipo 1: AUTO_DISCIPLESHIP

| Aspecto | Detalle |
|---------|---------|
| **Derivación** | Automática desde `ownerLeaderId` + `currentGroupId` |
| **Creación** | No requiere acción manual |
| **Mantención** | Se actualiza automáticamente cuando ownership cambia |
| **Ejemplo** | Angelo es owner de Juan → aparece como su mentor automático |

### Tipo 2: SPECIAL_DISCIPLESHIP

| Aspecto | Detalle |
|---------|---------|
| **Derivación** | Manual — creada por pastor o líder autorizado |
| **Caso de uso** | Relaciones fuera de la jerarquía ministerial |
| **Ejemplo** | Oris discipula personalmente a Kevin (que está bajo E5.7) |
| **Campos** | mentorId, discipleId, relationshipType, notes, startDate, endDate, active |

### Reglas de coexistencia

1. Un usuario puede existir en **ambos contextos** simultáneamente
2. Los **check-ins** funcionan para ambos tipos
3. Los **milestones** funcionan para ambos tipos
4. El **árbol ministerial** se genera desde ownership (auto)
5. Las **relaciones especiales** se superponen sin alterar ownership
6. Si ownership cambia (transferencia), AUTO_DISCIPLESHIP se actualiza; SPECIAL permanece

### UI (V2)

```
┌─────────────────────────────────────┐
│ Discipulado de Angelo               │
├─────────────────────────────────────┤
│ 📋 Discípulos Automáticos (3)      │
│   • Juan Pérez (E5.6.1)            │
│   • María López (E5.6.1)           │
│   • Carlos Ruiz (E5.6.1)           │
├─────────────────────────────────────┤
│ ⭐ Discipulados Especiales (1)      │
│   • Kevin Ismare (E5.7.1) — Mentor │
│     personal asignado por Oris      │
└─────────────────────────────────────┘
```

## Consecuencias

- **MVP:** Mantener DiscipleshipRelationship como está (funcional)
- **V2:** Implementar derivación automática + UI diferenciada
- **No requiere migración** — el modelo actual soporta ambos tipos con un campo `type` adicional
- **Reduce carga administrativa** — líderes no necesitan crear relaciones manualmente para su célula

## Implementación (V2)

1. Agregar campo `type` a DiscipleshipRelationship: `AUTO | SPECIAL`
2. Job que sincroniza relaciones AUTO desde `ownerLeaderId`
3. UI diferenciada por tipo
4. Preservar relaciones SPECIAL al transferir personas

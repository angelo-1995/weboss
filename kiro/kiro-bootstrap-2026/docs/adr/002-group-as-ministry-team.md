# ADR-002: Group como Representación de Ministry Team

**Estado:** Aprobado
**Fecha:** 2026-06-01
**Contexto:** Evolución Community OS → J-PDVE Conexiones

---

## Contexto

El PRD establece que "Ministry Team is the primary organizational unit". El sistema actual ya tiene una entidad `Group` con:
- Jerarquía (parentId, self-reference)
- Tipos (CELL, MINISTRY, CAMPUS, DEPARTMENT, TEAM, SPECIAL)
- Código jerárquico (`code` field)
- Ubicación GPS (latitude, longitude)
- Miembros con roles (GroupMember: LEADER, CO_LEADER, MEMBER)
- Relación con Network

Esto cubre el 95% de lo que un MinistryTeam necesita en J-PDVE.

## Decisión

**NO crear una nueva entidad MinistryTeam.** Reutilizar `Group` con `type = 'CELL'` como el equivalente funcional de Ministry Team.

- Los equipos ministeriales son Groups con type=CELL
- El campo `code` ya almacena el código jerárquico (E4.1.2)
- GroupMember con role=LEADER/CO_LEADER son los líderes del equipo
- La jerarquía ya existe via parentId

## Consecuencias

### Positivas
- Cero migraciones estructurales para este concepto
- Todo el código existente (Groups module, endpoints, UI) sigue funcionando
- No se duplican entidades
- La flexibilidad de tipos permite otros usos futuros (departamentos, ministerios)

### Negativas
- El nombre "Group" es genérico — el frontend puede mostrar "Equipo Ministerial" sin cambiar la entidad
- Algún código asume que todos los Groups son equipos (filtrar por type cuando sea necesario)

## Mejoras Aditivas Planificadas

Sin cambiar la tabla `groups`, se agregarán:
- `team_history` — event log de cambios del equipo
- `team_multiplications` — registro formal de multiplicaciones
- Campos opcionales si se necesitan (via migration additive)

## Alternativas Consideradas

| Alternativa | Razón de descarte |
|------------|-------------------|
| Crear tabla `ministry_teams` nueva | Duplica Group. Mismos campos, mismas relaciones. Desperdicio. |
| Renombrar tabla `groups` a `ministry_teams` | Breaking change masivo. Rompe todos los imports, queries, endpoints, frontend. |
| Crear vista SQL `ministry_teams` sobre `groups` | Agrega complejidad sin beneficio real. Prisma no soporta views como models. |

## Mapeo Conceptual

| Concepto J-PDVE | Implementación Existente |
|-----------------|-------------------------|
| Ministry Team | Group (type=CELL) |
| Código ministerial | Group.code |
| Líderes del equipo | GroupMember (role=LEADER, CO_LEADER) |
| Jerarquía | Group.parentId |
| Red | Group.networkId |
| Ubicación | Group.latitude, Group.longitude |
| Personas del equipo | Person.currentTeamId → Group.id |

## Referencias
- PRD: "Ministry Team is the primary organizational unit"
- PROJECT_AUDIT.md: Sección 5, item 4

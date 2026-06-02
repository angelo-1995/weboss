# ADR-005: Estrategia de Coexistencia Enum + Config Table

**Estado:** Aprobado
**Fecha:** 2026-06-01
**Contexto:** Evolución Community OS → J-PDVE Conexiones

---

## Contexto

La migración de `SpiritualStage` (enum hardcoded) a `pipeline_stage_configs` (tabla configurable) es la migración de mayor riesgo del proyecto. Eliminar el enum inmediatamente rompería:
- Columna `users.spiritual_stage` (datos existentes)
- Columnas `stage_transitions.from_stage` / `to_stage`
- Queries en analytics, dashboard, frontend filters
- Frontend badges y color mappings

## Decisión

**Coexistencia indefinida.** El enum y la tabla configuraciones viven en paralelo. No hay fecha forzada de eliminación del enum.

### Reglas de Coexistencia

| Flujo | Usa Enum | Usa Config Table |
|-------|:--------:|:----------------:|
| User.spiritualStage (legacy) | ✅ (read-only) | — |
| Person.pipelineStageId (nuevo) | — | ✅ |
| StageTransition.fromStage/toStage (legacy) | ✅ (read-only) | — |
| PersonPipelineHistory (nuevo) | — | ✅ |
| Frontend: badge de User | ✅ (fallback) | ✅ (preferido) |
| Dashboard KPIs (nuevo) | — | ✅ |
| Crear nueva persona | — | ✅ |
| Avanzar persona en pipeline | — | ✅ |

### Mapping Table

Para queries que necesiten cruzar ambos mundos:

```typescript
const ENUM_TO_CONFIG_MAP: Record<SpiritualStage, string> = {
  GANADO: 'VISITANTE',       // Closest match
  CONSOLIDADO: 'CONSOLIDADO',
  DISCIPULADO: 'ACADEMIA_N1', // Approximate
  ENVIADO: 'LIDER',           // Approximate
};
```

Este mapping se usa SOLO para migraciones de datos y queries de compatibilidad. No para lógica nueva.

## Consecuencias

### Positivas
- Zero risk de romper funcionalidad existente
- Migración gradual sin presión de deadline
- Frontend puede adoptar config table cuando esté listo
- Si la config table tiene bugs, el enum sigue funcionando como fallback
- No requiere coordinación de deploy entre backend y frontend

### Negativas
- Dos fuentes de verdad temporalmente (confusión potencial para devs)
- Código de compatibilidad necesario (mapping functions)
- Documentar claramente qué es legacy y qué es nuevo

## Criterios para Eliminar el Enum (futuro, no obligatorio)

Solo considerar eliminación cuando:
- [ ] 100% de personas nuevas usan Person.pipelineStageId
- [ ] Dashboard consume exclusivamente de config table
- [ ] Frontend no tiene referencias directas al enum
- [ ] Min. 1 mes en producción sin incidentes
- [ ] Backup completo de datos pre-eliminación

## Patrón de Código

```typescript
// Service: Obtener stage de una persona (compatible con ambos)
function getPersonStage(person: Person, user?: User): PipelineStageInfo {
  // Preferir Person.pipelineStageId (nuevo)
  if (person.pipelineStageId) {
    return getStageFromConfig(person.pipelineStageId);
  }
  // Fallback: User.spiritualStage (legacy)
  if (user?.spiritualStage) {
    return mapEnumToStageInfo(user.spiritualStage);
  }
  return DEFAULT_STAGE;
}
```

## Alternativas Consideradas

| Alternativa | Razón de descarte |
|------------|-------------------|
| Big-bang migration (eliminar enum de golpe) | Demasiado riesgo. Sin rollback fácil. |
| Deadline fijo para eliminar enum | Presión artificial. Si funciona, no hay urgencia. |
| Shadow writes (escribir en ambos siempre) | Complejidad innecesaria para un campo que eventualmente desaparece. |

## Referencias
- ADR-004: Pipeline Configurable
- RISK_REGISTER.md: Riesgo 2.1 (🔴 Crítico) — "NUNCA eliminar enum. Coexistencia indefinida."

# ADR-003: Campus Evolucionado a Church

**Estado:** Aprobado
**Fecha:** 2026-06-01
**Contexto:** Evolución Community OS → J-PDVE Conexiones

---

## Contexto

El PRD requiere soporte multi-church desde la arquitectura: "Architecture must support [daughter churches] from day one." El sistema actual tiene `Campus` como entidad organizacional raíz con: name, slug, description, address, isActive.

El concepto de `Church` en J-PDVE es equivalente al de Campus actual, con campos adicionales necesarios (timezone, settings, code).

## Decisión

**Evolucionar `Campus` in-place agregando campos.** NO renombrar tabla, NO crear nueva entidad Church.

Campos a agregar a `campuses`:
- `timezone` VARCHAR(50) DEFAULT 'America/Panama'
- `settings` JSONB DEFAULT '{}'
- `code` VARCHAR(20) UNIQUE (identificador corto)

La tabla sigue llamándose `campuses` en la base de datos. En el código, el concepto se puede referenciar como "Church" en documentación y UI, pero el modelo Prisma sigue siendo `Campus`.

## Consecuencias

### Positivas
- Zero breaking changes: todos los FK `campus_id` siguen funcionando
- El HierarchyVisibilityService ya filtra por campusId — sigue operando
- No hay rename masivo de imports/variables
- Multi-church listo: cada Campus = una iglesia
- Aditivo: solo se agregan 3 columnas

### Negativas
- Inconsistencia nominal: el código dice "campus" pero conceptualmente es "church"
- Documentación nueva usa "Church" mientras código usa "Campus" (aceptable: la abstracción es clara)

## Reglas de Uso

1. **En código:** `Campus` (modelo Prisma, variables, types)
2. **En UI:** "Iglesia" (lo que ve el usuario)
3. **En documentación:** "Church" (concepto de negocio)
4. **En DB:** tabla `campuses` (no se renombra)

## Multi-Church Strategy

```
Fase actual: Single campus (Ministerio PDVE)
Fase futura: Múltiples campuses, cada uno = una iglesia hija
             campus_id en entidades actúa como tenant discriminator
             Ya implementado: User.campusId, Group.campusId
```

## Alternativas Consideradas

| Alternativa | Razón de descarte |
|------------|-------------------|
| Crear tabla `churches` nueva y migrar datos | Breaking change: todos los FK campus_id se rompen. 15+ tablas afectadas. |
| Renombrar tabla `campuses` → `churches` | Prisma migration destructiva. Todos los queries, seeds, tests se rompen. |
| Crear `Church` como wrapper sobre `Campus` | Overengineering. Abstracción sin beneficio. |

## Referencias
- PRD: "Architecture must support [multi-church] from day one"
- RISK_REGISTER.md: Riesgos 3.1-3.5

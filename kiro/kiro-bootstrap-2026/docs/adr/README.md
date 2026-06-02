# Architecture Decision Records (ADR)

> Registro de decisiones arquitectónicas para la evolución Community OS → J-PDVE Conexiones.

## Índice

| # | Decisión | Estado | Fecha |
|---|----------|--------|-------|
| [001](./001-person-separated-from-user.md) | Person separado de User | Aprobado | 2026-06-01 |
| [002](./002-group-as-ministry-team.md) | Group como representación de Ministry Team | Aprobado | 2026-06-01 |
| [003](./003-campus-evolved-to-church.md) | Campus evolucionado a Church | Aprobado | 2026-06-01 |
| [004](./004-configurable-pipeline.md) | Pipeline pastoral configurable | Aprobado | 2026-06-01 |
| [005](./005-enum-config-coexistence.md) | Estrategia de coexistencia Enum + Config Table | Aprobado | 2026-06-01 |
| [006](./006-ltree-hierarchy.md) | Uso de LTREE para jerarquía ministerial | Aprobado | 2026-06-01 |

## Formato

Cada ADR sigue la estructura:
1. **Contexto** — Por qué se necesita esta decisión
2. **Decisión** — Qué se decidió
3. **Consecuencias** — Positivas y negativas
4. **Alternativas** — Qué se descartó y por qué
5. **Referencias** — Documentos relacionados

## Principios Guía

- Evolucionar, no reiniciar
- Migraciones aditivas (no destructivas)
- Compatibilidad con código existente
- Coexistencia sobre reemplazo
- Rollback posible en todo momento

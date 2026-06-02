# ADR-004: Pipeline Pastoral Configurable

**Estado:** Aprobado
**Fecha:** 2026-06-01
**Contexto:** Evolución Community OS → J-PDVE Conexiones

---

## Contexto

El sistema actual define el pipeline pastoral como un enum `SpiritualStage` con 4 valores hardcoded:
```
GANADO, CONSOLIDADO, DISCIPULADO, ENVIADO
```

El PRD requiere un pipeline configurable con ~10 stages:
```
Visitante → Consolidado → Academia N1 → Academia N2 → Academia N3 → Servidor → Líder Potencial → Líder → Cobertura
```

Además, la regla "Pipeline stages must be configurable" exige que cada iglesia pueda definir sus propios stages.

## Decisión

Crear una tabla `pipeline_stage_configs` que almacene los stages configurables por iglesia. Mantener el enum `SpiritualStage` existente sin eliminarlo (estrategia de coexistencia).

### Nuevo modelo:
```
pipeline_stage_configs:
  id, campus_id, name, code, order_index, color, description, is_active
```

### En Person:
```
person.pipeline_stage_id → FK a pipeline_stage_configs.id
```

### Historial:
```
person_pipeline_history:
  id, person_id, from_stage_id, to_stage_id, changed_by, changed_at, notes
```

## Estrategia de Coexistencia

```
┌─────────────────────────────────────────────────┐
│ FASE 1 (Sprint 1): Crear tabla + FK nuevos      │
│   - pipeline_stage_configs creada                │
│   - persons.pipeline_stage_id agregado (nullable)│
│   - users.spiritual_stage INTACTO               │
│   - Ambos coexisten                             │
├─────────────────────────────────────────────────┤
│ FASE 2 (Sprint 2-4): Nuevas features usan FK   │
│   - Person creation usa pipeline_stage_id       │
│   - Pipeline advancement usa historial          │
│   - Dashboard lee de tabla configurable         │
│   - Frontend consume endpoint dinámico          │
├─────────────────────────────────────────────────┤
│ FASE 3 (Sprint 5+): Deprecation del enum       │
│   - Documentar como deprecated                  │
│   - Código legacy sigue funcionando             │
│   - Opcionalmente eliminar en v2                │
└─────────────────────────────────────────────────┘
```

## Consecuencias

### Positivas
- Cada iglesia puede configurar su propio pipeline
- Se pueden agregar/reordenar stages sin deploy
- Historial completo de transiciones (analytics, timeline)
- No hay breaking change: enum sigue existiendo
- Frontend puede mostrar stages dinámicamente

### Negativas
- Coexistencia temporal: dos fuentes de verdad para "stage" (enum en User, FK en Person)
- Queries legacy necesitan adaptarse gradualmente
- Seed data necesita crear las configs iniciales

## Seed Data Inicial

```
| order | code          | name               | color   |
|-------|---------------|--------------------|---------|
| 1     | VISITANTE     | Visitante          | #9CA3AF |
| 2     | CONSOLIDADO   | Consolidado        | #60A5FA |
| 3     | ACADEMIA_N1   | Academia Nivel 1   | #34D399 |
| 4     | ACADEMIA_N2   | Academia Nivel 2   | #34D399 |
| 5     | ACADEMIA_N3   | Academia Nivel 3   | #34D399 |
| 6     | SERVIDOR      | Servidor           | #FBBF24 |
| 7     | LIDER_POT     | Líder Potencial    | #F97316 |
| 8     | LIDER         | Líder              | #EF4444 |
| 9     | COBERTURA     | Cobertura          | #8B5CF6 |
```

## Alternativas Consideradas

| Alternativa | Razón de descarte |
|------------|-------------------|
| Eliminar enum y migrar datos inmediatamente | Punto de no retorno. Frontend se rompe. Queries se rompen. Riesgo alto. |
| Expandir enum de 4 a 10 valores | Requiere migration destructiva. No es configurable por iglesia. |
| Usar JSONB field con stages | Sin type safety. Sin FK. Sin queries eficientes. |
| Tabla separada por iglesia (multi-table) | Overengineering. Una tabla con campus_id es suficiente. |

## Referencias
- PRD: "Pipeline stages must be configurable"
- RISK_REGISTER.md: Riesgos 2.1-2.5
- ADR-003: Campus como tenant para campus_id en pipeline_stage_configs

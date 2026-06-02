# PIPELINE_EVOLUTION_PLAN.md — Propuesta de Actualización del Pipeline

> **Estado:** Propuesta (NO aplicar hasta después del piloto)
> **Decisión:** Post-piloto, basada en feedback real
> **Principio:** El pipeline es configurable via DB, no requiere deploy de código

---

## 1. Pipeline Actual (MVP)

| # | Código | Nombre | Color |
|---|--------|--------|-------|
| 1 | VISITANTE | Visitante | #9CA3AF |
| 2 | CONSOLIDADO | Consolidado | #60A5FA |
| 3 | ACADEMIA_N1 | Academia Nivel 1 | #34D399 |
| 4 | ACADEMIA_N2 | Academia Nivel 2 | #10B981 |
| 5 | ACADEMIA_N3 | Academia Nivel 3 | #059669 |
| 6 | SERVIDOR | Servidor | #FBBF24 |
| 7 | LIDER_POTENCIAL | Líder Potencial | #F97316 |
| 8 | LIDER | Líder | #EF4444 |
| 9 | COBERTURA | Cobertura | #8B5CF6 |

**Total: 9 stages**

---

## 2. Pipeline Propuesto (Libro Maestro)

| # | Código | Nombre | Color Propuesto | Notas |
|---|--------|--------|-----------------|-------|
| 1 | VISITANTE | Visitante | #9CA3AF | Sin cambio |
| 2 | CONVERTIDO | Convertido | #6EE7B7 | **NUEVO** — Primera decisión de fe |
| 3 | ENCUENTRO | Encuentro | #67E8F9 | **NUEVO** — Retiro/encuentro espiritual |
| 4 | BAUTIZADO | Bautizado | #60A5FA | **NUEVO** — Bautismo en aguas |
| 5 | ACADEMIA | Academia | #34D399 | Fusión de N1/N2/N3 en un solo stage |
| 6 | LANZAMIENTO | Lanzamiento | #10B981 | **NUEVO** — Ceremonia de lanzamiento ministerial |
| 7 | DISCIPULO_ACTIVO | Discípulo Activo | #FBBF24 | Reemplaza "Servidor" |
| 8 | CO_LIDER_POTENCIAL | Co-Líder Potencial | #FB923C | **NUEVO** |
| 9 | LIDER_POTENCIAL | Líder Potencial | #F97316 | Sin cambio |
| 10 | LIDER | Líder | #EF4444 | Sin cambio |
| 11 | COBERTURA | Cobertura | #8B5CF6 | Sin cambio |

**Total: 11 stages**

---

## 3. Diferencias (Actual → Propuesto)

| Cambio | Tipo | Detalle |
|--------|------|---------|
| Agregar CONVERTIDO (#2) | Inserción | Entre Visitante y Encuentro |
| Agregar ENCUENTRO (#3) | Inserción | Retiro/encuentro espiritual |
| Agregar BAUTIZADO (#4) | Inserción | Hito de bautismo |
| Fusionar ACADEMIA_N1/N2/N3 → ACADEMIA | Fusión | Un solo stage (niveles se gestionan fuera del pipeline) |
| Agregar LANZAMIENTO (#6) | Inserción | Post-academia, pre-servicio |
| Renombrar SERVIDOR → DISCIPULO_ACTIVO | Rename | Alineado con Libro Maestro |
| Agregar CO_LIDER_POTENCIAL (#8) | Inserción | Paso intermedio |

---

## 4. Impacto en Datos

### Personas existentes

| Stage actual | Personas (demo) | Acción propuesta |
|-------------|:--------------:|-----------------|
| VISITANTE | 5 | Sin cambio |
| CONSOLIDADO | 4 | Migrar a CONVERTIDO (closest match) |
| ACADEMIA_N1 | 3 | Migrar a ACADEMIA |
| ACADEMIA_N2 | 2 | Migrar a ACADEMIA |
| ACADEMIA_N3 | 1 | Migrar a ACADEMIA |
| SERVIDOR | 3 | Migrar a DISCIPULO_ACTIVO |
| LIDER_POTENCIAL | 2 | Sin cambio |
| LIDER | 0 (son Users) | Sin cambio |
| COBERTURA | 0 (son Users) | Sin cambio |

### Script de migración (conceptual, NO ejecutar)

```sql
-- 1. Crear nuevos stages
INSERT INTO pipeline_stage_configs (campus_id, code, name, order_index, color) VALUES
  ('<campus_id>', 'CONVERTIDO', 'Convertido', 2, '#6EE7B7'),
  ('<campus_id>', 'ENCUENTRO', 'Encuentro', 3, '#67E8F9'),
  ('<campus_id>', 'BAUTIZADO', 'Bautizado', 4, '#60A5FA'),
  ('<campus_id>', 'LANZAMIENTO', 'Lanzamiento', 6, '#10B981'),
  ('<campus_id>', 'DISCIPULO_ACTIVO', 'Discípulo Activo', 7, '#FBBF24'),
  ('<campus_id>', 'CO_LIDER_POTENCIAL', 'Co-Líder Potencial', 8, '#FB923C');

-- 2. Fusionar academias
UPDATE pipeline_stage_configs SET name = 'Academia', code = 'ACADEMIA', order_index = 5
  WHERE code = 'ACADEMIA_N1';
DELETE FROM pipeline_stage_configs WHERE code IN ('ACADEMIA_N2', 'ACADEMIA_N3');

-- 3. Renombrar SERVIDOR → DISCIPULO_ACTIVO
-- (usar el nuevo stage, migrar personas)

-- 4. Reordenar order_index de todos los stages

-- 5. Migrar personas
UPDATE persons SET pipeline_stage_id = '<new_convertido_id>'
  WHERE pipeline_stage_id = '<old_consolidado_id>';
UPDATE persons SET pipeline_stage_id = '<new_academia_id>'
  WHERE pipeline_stage_id IN ('<old_n1_id>', '<old_n2_id>', '<old_n3_id>');
UPDATE persons SET pipeline_stage_id = '<new_discipulo_id>'
  WHERE pipeline_stage_id = '<old_servidor_id>';
```

---

## 5. Impacto en Dashboards

| Componente | Impacto | Acción |
|-----------|---------|--------|
| KPI "Pipeline Espiritual" (admin dashboard) | Los conteos cambian de nombre | Automático (lee de config) |
| Funnel de pipeline | Más stages = funnel más detallado | Automático |
| Badges de persona | Colores y nombres nuevos | Automático (colores en DB) |
| Filtros por stage | Más opciones en dropdowns | Automático |
| Timeline espiritual | Historial preservado (from_stage → to_stage) | Sin impacto (FK intactas) |

**Impacto real: MÍNIMO.** Todo se lee dinámicamente de `pipeline_stage_configs`. No hay nada hardcodeado.

---

## 6. Impacto en Reportes

| Aspecto | Impacto |
|---------|---------|
| Reportes existentes | CERO impacto (reportes no referencian pipeline stages) |
| Dashboard KPIs | Se recalculan automáticamente |
| Alertas | Sin impacto (alertas se basan en reportes, no en pipeline) |

---

## 7. Impacto en Pipeline History

| Aspecto | Detalle |
|---------|---------|
| Historial existente | Se preserva intacto (FK a stage IDs que siguen existiendo) |
| Nuevas transiciones | Usarán los nuevos stage IDs |
| Timeline UI | Mostrará nombres correctos para entries antiguas (via FK join) |

**Riesgo:** Si se ELIMINA un stage que tiene historial, se rompen los FKs.
**Mitigación:** NUNCA eliminar stages. Marcar como `is_active = false`.

---

## 8. Riesgos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|:------------:|:-------:|-----------|
| 1 | Personas quedan en stage obsoleto | Media | Medio | Migration script asigna nuevo stage equivalente |
| 2 | Historial muestra stages "fantasma" | Baja | Bajo | FK preserva nombres. Stages inactivos siguen en DB. |
| 3 | Academia como stage único pierde granularidad | Media | Medio | Crear módulo Academia separado (V2) para tracking de niveles |
| 4 | Confusión durante transición | Media | Medio | Hacer el cambio en un solo momento, notificar a líderes |
| 5 | Dashboard temporalmente inconsistente | Baja | Bajo | Ejecutar en horario sin actividad (madrugada) |

---

## 9. Recomendación Final

### Cuándo aplicar: **Después del Piloto Oficial (Fase 2)**

**Razones:**
1. El piloto validará si los líderes necesitan los stages adicionales o si los 9 actuales son suficientes
2. No introducir cambios durante la fase de validación — confunde a usuarios
3. El feedback del piloto puede revelar stages diferentes a los del Libro Maestro
4. La migración es trivial (INSERT + UPDATE, 5 minutos) — no hay urgencia

### Momento ideal: **Entre Fase 2 y Fase 3**

```
Fase 2 (Piloto 2 semanas) → Recoger feedback
                           → ¿Los stages actuales son suficientes?
                           → ¿Falta "Convertido"? ¿Falta "Encuentro"?
                           
Si SÍ falta → Aplicar evolución del pipeline
Si NO falta → Mantener los 9 stages actuales

Fase 3 (Red de Jóvenes) → Operar con pipeline definitivo
```

### Criterios para aplicar

- [ ] Piloto completado exitosamente
- [ ] Feedback confirma necesidad de stages adicionales
- [ ] Pastor aprueba el nuevo pipeline específicamente
- [ ] Se acuerda mapping (¿Consolidado = Convertido o Encuentro?)
- [ ] Se programa ventana de mantenimiento (5 min)

---

## 10. Decisión Pendiente (para el Pastor)

Antes de aplicar, el pastor debe responder:

1. **¿"Consolidado" es lo mismo que "Convertido"?** ¿O son pasos diferentes?
2. **¿"Encuentro" es obligatorio?** ¿O algunas personas van directo a Academia?
3. **¿"Bautizado" es un stage o un milestone?** (podría ser un checkbox en Person, no un stage)
4. **¿Academia debe ser 1 stage o mantener N1/N2/N3?** (Si hay módulo Academia separado, 1 stage basta)
5. **¿"Lanzamiento" existe en la Red de Jóvenes?** ¿O es solo de adultos?

Estas preguntas se responderán naturalmente durante el piloto.

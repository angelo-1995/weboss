# RISK_REGISTER.md — Registro de Riesgos de Migración

> **Proyecto:** Community OS → J-PDVE Conexiones
> **Estrategia:** Evolución incremental (NO reescritura)
> **Fecha:** Junio 2026

---

## Matriz de Severidad

| Probabilidad \ Impacto | Bajo | Medio | Alto | Crítico |
|------------------------|------|-------|------|---------|
| **Alta** | ⚠️ | 🟧 | 🔴 | 🔴 |
| **Media** | ✅ | ⚠️ | 🟧 | 🔴 |
| **Baja** | ✅ | ✅ | ⚠️ | 🟧 |

---

## Migración 1: Person Separado de User

### Descripción
Crear entidad `persons` independiente de `users`. Un User PUEDE tener un personId asociado. Una Person PUEDE existir sin User.

### Riesgos

| # | Riesgo | Prob. | Impacto | Severidad | Mitigación | Rollback |
|---|--------|-------|---------|-----------|------------|----------|
| 1.1 | **Datos huérfanos**: Users existentes sin Person asociada | Alta | Medio | 🟧 | Migration script que crea un Person automáticamente por cada User existente, copiando firstName, lastName, phone, email | Revertir migration: DROP TABLE persons, eliminar FK de users |
| 1.2 | **Queries rotas**: Services que asumen que firstName/lastName están en User | Alta | Alto | 🔴 | Mantener firstName/lastName en User como campos existentes. Person es ADICIONAL, no reemplaza campos en User inmediatamente. Deprecar gradualmente. | No hay rollback necesario: User no pierde campos |
| 1.3 | **Performance**: JOIN adicional User→Person en queries | Media | Bajo | ✅ | person_id tiene índice UNIQUE. JOIN 1:1 es O(1). Negligible. | N/A |
| 1.4 | **Frontend breakage**: Componentes que muestran User.firstName sin pasar por Person | Alta | Medio | 🟧 | Fase 1: User conserva sus campos. Fase 2: UI usa Person cuando disponible, fallback a User. | Mantener campos en User indefinidamente como cache |
| 1.5 | **Seed/Test data inconsistency**: Tests que crean Users sin Person | Media | Bajo | ✅ | Actualizar seed para crear Person + User juntos. Tests unitarios no afectados (mock). | N/A |

### Estrategia de Rollback Completa

```sql
-- ROLLBACK Migration 1 (si es necesario)
-- 1. Eliminar FK de users
ALTER TABLE users DROP COLUMN person_id;
-- 2. Eliminar tabla persons
DROP TABLE IF EXISTS persons;
-- 3. Eliminar tabla person_team_history
DROP TABLE IF EXISTS person_team_history;
```

**Punto de no retorno:** Cuando el frontend empiece a crear Person sin User (visitantes). Antes de eso, rollback es trivial.

---

## Migración 2: Pipeline Configurable (Enum → Table)

### Descripción
Reemplazar el enum `SpiritualStage` (4 valores hardcoded: GANADO, CONSOLIDADO, DISCIPULADO, ENVIADO) por una tabla `pipeline_stage_configs` con stages configurables por iglesia.

### Riesgos

| # | Riesgo | Prob. | Impacto | Severidad | Mitigación | Rollback |
|---|--------|-------|---------|-----------|------------|----------|
| 2.1 | **Enum removal breaks existing data**: Columna `spiritual_stage` en users tiene valores del enum | Alta | Crítico | 🔴 | NO eliminar el enum ni la columna. Agregar nueva columna `pipeline_stage_id` como FK nullable. Migración de datos: mapear GANADO→stage_config_id donde code='GANADO', etc. | Eliminar columna pipeline_stage_id, enum intacto |
| 2.2 | **StageTransition references enum**: Tabla actual usa enum para fromStage/toStage | Alta | Alto | 🔴 | Agregar columnas `from_stage_config_id` y `to_stage_config_id` nullable. Backfill con mapping. NO eliminar columnas originales del enum. | DROP columnas nuevas |
| 2.3 | **Frontend muestra stages hardcodeados**: Badges, filters, dropdowns usan enum | Alta | Medio | 🟧 | Crear endpoint GET /pipeline-stages que retorna la config. Frontend consume dinámicamente. Fallback: si falla endpoint, usar constantes hardcoded. | Revertir frontend a constantes |
| 2.4 | **Queries de analytics usan enum values**: Aggregations como `WHERE spiritual_stage = 'GANADO'` | Media | Medio | ⚠️ | Mantener enum column como deprecated. Nuevos queries usan FK. Migrar queries una por una. | N/A (ambas columnas coexisten) |
| 2.5 | **Pipeline stages con order_index incorrecto**: Si se inserta un stage en medio del pipeline | Baja | Medio | ✅ | Validación en service: no permitir order_index duplicado. Reordenar automáticamente. | N/A |

### Estrategia de Rollback Completa

```sql
-- ROLLBACK Migration 2 (si es necesario)
-- 1. Eliminar FK nuevos
ALTER TABLE users DROP COLUMN pipeline_stage_id;
ALTER TABLE stage_transitions DROP COLUMN from_stage_config_id;
ALTER TABLE stage_transitions DROP COLUMN to_stage_config_id;
-- 2. Eliminar tabla de config
DROP TABLE IF EXISTS pipeline_stage_configs;
-- 3. Enum original sigue intacto (nunca se eliminó)
```

**Punto de no retorno:** Cuando se elimine la columna `spiritual_stage` del User. Planificado para Sprint 5+ (después de validar que todo funciona con FK).

### Estrategia de Coexistencia

```
Sprint 1: Crear tabla + FK nuevos (ambas coexisten)
Sprint 2-3: Nuevos features usan FK
Sprint 4: Validar que todo funciona
Sprint 5: Deprecated warning en enum column
Sprint 6+: Eliminar enum column (PUNTO DE NO RETORNO)
```

---

## Migración 3: Church como Tenant

### Descripción
Evolucionar `Campus` (existente) para funcionar como tenant principal. Agregar `church_id` a entidades que lo necesiten para multi-church futuro.

### Riesgos

| # | Riesgo | Prob. | Impacto | Severidad | Mitigación | Rollback |
|---|--------|-------|---------|-----------|------------|----------|
| 3.1 | **Massive schema change**: Agregar church_id a 15+ tablas | Media | Alto | 🟧 | NO agregar church_id a todas las tablas inmediatamente. Solo a: pipeline_stage_configs, persons, operational_alerts. Resto hereda via relación (Group→Campus→Church). | DROP columnas church_id agregadas |
| 3.2 | **Campus rename disrupts code**: Renombrar campus_id a church_id en todas partes | Alta | Alto | 🔴 | NO renombrar. Mantener `campus_id` en código. Campus ES el church conceptualmente. Solo agregar campos (timezone, settings, code) a la tabla existente. | Eliminar campos nuevos de campuses |
| 3.3 | **Multi-tenant queries sin middleware**: Olvidar filtrar por campus/church | Media | Crítico | 🔴 | El HierarchyVisibilityService YA filtra por campusId. Mantener esa lógica. Para tablas nuevas: repository base class que inyecta filter. | N/A (ya existe el patrón) |
| 3.4 | **Single-campus assumption en seed**: Seed actual asume un solo campus | Baja | Bajo | ✅ | Mantener single campus en seed. Multi-church es futuro. | N/A |
| 3.5 | **Timezone logic en report locking**: Necesita timezone del church para calcular período | Media | Medio | ⚠️ | Agregar campo `timezone` a campuses con default 'America/Panama'. Service de período usa timezone del campus del user. | Hardcodear timezone como fallback |

### Estrategia de Rollback Completa

```sql
-- ROLLBACK Migration 3
-- Solo se agregan campos a campuses, nada se renombra
ALTER TABLE campuses DROP COLUMN IF EXISTS timezone;
ALTER TABLE campuses DROP COLUMN IF EXISTS settings;
ALTER TABLE campuses DROP COLUMN IF EXISTS code;
```

**Punto de no retorno:** Nunca para MVP. La migración es puramente aditiva. Campus sigue siendo Campus.

---

## Migración 4: Cell Report Evolution

### Descripción
Agregar: period_status, week_start, meeting_type, spiritual_health. Crear tablas: cell_report_drafts, report_photos, report_comments.

### Riesgos

| # | Riesgo | Prob. | Impacto | Severidad | Mitigación | Rollback |
|---|--------|-------|---------|-----------|------------|----------|
| 4.1 | **period_status calculation incorrecta**: Timezone edge cases | Media | Medio | ⚠️ | Usar date-fns-tz con timezone de campus. Logging en cálculo de período. Default: NORMAL si cálculo falla. | Eliminar columna, logic no-op |
| 4.2 | **week_start backfill**: Reportes existentes sin week_start | Alta | Bajo | ✅ | Migration script: `UPDATE cell_reports SET week_start = date_trunc('week', meeting_date + interval '1 day') - interval '1 day'` (lunes) | SET week_start = NULL |
| 4.3 | **Unique constraint conflict**: (group_id, week_start) puede romper con datos existentes | Media | Alto | 🟧 | Antes de agregar UNIQUE constraint: verificar datos existentes, resolver duplicados manualmente. Crear constraint AFTER backfill. | DROP constraint |
| 4.4 | **Draft storage grows indefinitely**: Sin cleanup automático | Media | Bajo | ✅ | Expiry: drafts > 30 días se eliminan por cron job. Max 1 draft per user per group. | N/A |
| 4.5 | **Photo upload quota abuse**: Usuarios suben muchas fotos grandes | Baja | Medio | ✅ | Max 3 fotos × 5MB = 15MB por reporte. Validación en presigned URL generation. S3 lifecycle policy. | Desactivar upload, borrar tabla |
| 4.6 | **Report locking breaks mobile UX**: Líder no puede enviar jueves por horario | Media | Alto | 🟧 | Grace period: locking se aplica jueves 6AM hora local (no midnight). Warning banner 24h antes. | Desactivar validation temporalmente (flag) |

### Estrategia de Rollback Completa

```sql
-- ROLLBACK Migration 4
ALTER TABLE cell_reports DROP COLUMN IF EXISTS period_status;
ALTER TABLE cell_reports DROP COLUMN IF EXISTS week_start;
ALTER TABLE cell_reports DROP COLUMN IF EXISTS meeting_type;
ALTER TABLE cell_reports DROP COLUMN IF EXISTS spiritual_health;
DROP TABLE IF EXISTS cell_report_drafts;
DROP TABLE IF EXISTS report_photos;
DROP TABLE IF EXISTS report_comments;
```

---

## Migración 5: Team History & Multiplication

### Descripción
Crear tablas: team_history (event log), team_multiplications (registro formal).

### Riesgos

| # | Riesgo | Prob. | Impacto | Severidad | Mitigación | Rollback |
|---|--------|-------|---------|-----------|------------|----------|
| 5.1 | **TeamHistory crece rápidamente**: Cada cambio genera registro | Baja | Bajo | ✅ | Event types limitados (8 tipos). Index por team_id + created_at. Partitioning si > 100K rows (futuro). | N/A |
| 5.2 | **Multiplication workflow incorrecta**: Personas se pierden en transferencia | Media | Alto | 🟧 | Transacción atómica: crear nuevo team + mover personas + crear registro. Si falla cualquier paso, rollback completo. | DELETE multiplication record, revert person_team assignments |
| 5.3 | **Group.status = MULTIPLIED no es claro**: ¿El grupo original sigue activo? | Media | Medio | ⚠️ | Un grupo multiplicado sigue ACTIVE por default. Solo se marca MULTIPLIED si se desactiva el equipo original. Decisión del liderazgo. | N/A |

### Estrategia de Rollback Completa

```sql
-- ROLLBACK Migration 5
DROP TABLE IF EXISTS team_history;
DROP TABLE IF EXISTS team_multiplications;
```

**Impacto de rollback:** Cero. Son tablas puramente aditivas sin FK críticas.

---

## Migración 6: Dashboard & Alerts

### Descripción
Crear tabla operational_alerts. Materialized views para KPIs. Redis cache layer.

### Riesgos

| # | Riesgo | Prob. | Impacto | Severidad | Mitigación | Rollback |
|---|--------|-------|---------|-----------|------------|----------|
| 6.1 | **Materialized views stale data**: KPIs muestran datos de hace 15min | Alta | Bajo | ✅ | Aceptable: Dashboard muestra "Actualizado hace X min". Refresh cada 15min via BullMQ. Manual refresh button. | DROP materialized views, queries directas (más lentas pero correctas) |
| 6.2 | **Alert fatigue**: Demasiadas alertas sin valor | Media | Medio | ⚠️ | Umbrales conservadores: 2 semanas sin reporte (no 1). Deduplicate: no crear alerta si ya existe una activa para el mismo team. | Desactivar job de detección |
| 6.3 | **Redis cache inconsistency**: Cache muestra valores diferentes a DB | Media | Medio | ⚠️ | TTL corto (5min). Event-driven invalidation cuando se crea un reporte. Endpoint /admin/cache/clear para emergencias. | Desactivar cache (queries directas) |
| 6.4 | **BullMQ job failure silenciosa**: Alert detection falla sin notificar | Media | Alto | 🟧 | Dead letter queue. Logging con alertas en Grafana si job falla 3 veces. Health check que verifica last run. | Manual execution via admin endpoint |
| 6.5 | **Dashboard slow para grandes volúmenes**: > 10K reportes | Baja | Medio | ✅ | Materialized views + indexes. Si insuficiente: agregar partitioning en cell_reports por year. | N/A |

### Estrategia de Rollback Completa

```sql
-- ROLLBACK Migration 6
DROP TABLE IF EXISTS operational_alerts;
DROP MATERIALIZED VIEW IF EXISTS mv_weekly_attendance;
-- Redis: FLUSHDB (solo dev) o eliminar keys con pattern kpi:*
```

---

## Riesgos Transversales

| # | Riesgo | Prob. | Impacto | Severidad | Mitigación |
|---|--------|-------|---------|-----------|------------|
| T.1 | **Migration order dependency**: Una migración depende de otra que falló | Media | Alto | 🟧 | Migrations numeradas secuencialmente. CI verifica que cada migration se puede aplicar limpiamente. No merge PR si migration falla. |
| T.2 | **Downtime durante migration**: ALTER TABLE en tabla grande bloquea | Baja | Alto | ⚠️ | Todas las migrations son additive (ADD COLUMN nullable, CREATE TABLE). No hay ALTER COLUMN ni DROP COLUMN en MVP. Zero-downtime. |
| T.3 | **Data loss en rollback**: Se pierden datos creados post-migración | Media | Crítico | 🔴 | Backup RDS automático antes de cada sprint. Point-in-time recovery disponible. Export CSV de datos nuevos antes de rollback. |
| T.4 | **Frontend deploy desincronizado del backend**: API cambia pero UI no se actualiza | Media | Medio | ⚠️ | Backward-compatible API changes. Nuevos campos son NULLABLE. Nuevos endpoints no reemplazan existentes. Feature flags para UI nueva. |
| T.5 | **Test coverage insufficient post-migration**: Bugs en flujos migrados | Alta | Medio | 🟧 | Integration tests para flujos críticos: crear reporte, crear persona, avanzar pipeline. Smoke test suite post-deploy. |

---

## Decisiones de Mitigación Global

### 1. Feature Flags

```typescript
// Env-based feature flags para activar features gradualmente
const FEATURES = {
  PERSON_ENTITY: process.env.FF_PERSON_ENTITY === 'true',      // Sprint 1
  PIPELINE_CONFIG: process.env.FF_PIPELINE_CONFIG === 'true',  // Sprint 1
  REPORT_LOCKING: process.env.FF_REPORT_LOCKING === 'true',    // Sprint 2
  REPORT_DRAFTS: process.env.FF_REPORT_DRAFTS === 'true',      // Sprint 2
  OPERATIONAL_ALERTS: process.env.FF_ALERTS === 'true',         // Sprint 3
};
```

**Beneficio:** Si una feature causa problemas en producción, se desactiva con un env change sin deploy.

### 2. Database Backup Strategy

| Momento | Acción |
|---------|--------|
| Antes de cada sprint | Snapshot manual de RDS |
| Diariamente | RDS automated backup (7 días retención) |
| Antes de cada migration | pg_dump de tablas afectadas |
| Post-rollback | Verificar integridad con checksums |

### 3. Canary Deployment

```
1. Deploy migration a staging
2. Run smoke tests (automated)
3. Manual QA por 24h
4. Deploy a production
5. Monitor métricas por 2h
6. Si anomalía → rollback inmediato
```

### 4. Communication Plan

| Evento | Quién notificar | Canal |
|--------|----------------|-------|
| Migration programada | Equipo dev | Slack/Discord |
| Downtime esperado | Usuarios líderes | In-app banner 24h antes |
| Rollback ejecutado | Equipo dev + PM | Incident channel |
| Feature flag toggled | Equipo dev | Deploy log |

---

## Prioridad de Riesgo (Top 5)

| # | Riesgo | Acción Inmediata |
|---|--------|-----------------|
| 1 | 🔴 2.1: Enum removal breaks data | NUNCA eliminar enum. Coexistencia indefinida. |
| 2 | 🔴 1.2: Services asumen firstName en User | Mantener campos en User. Person es additive. |
| 3 | 🔴 3.3: Multi-tenant queries sin filter | Aprovechar HierarchyVisibilityService existente. |
| 4 | 🟧 4.3: Unique constraint conflict en reports | Verificar datos existentes ANTES de crear constraint. |
| 5 | 🟧 5.2: Personas perdidas en multiplicación | Transacción atómica obligatoria. |

---

## Conclusión

**Nivel de riesgo general: MEDIO-BAJO.**

Todas las migraciones son aditivas (nuevas tablas, nuevas columnas nullable). No hay renaming, no hay DROP COLUMN, no hay cambios destructivos en MVP.

El punto de no retorno más lejano es Sprint 5+ (eliminación del enum SpiritualStage). Hasta ese punto, cualquier migración se puede revertir con un simple DROP TABLE/COLUMN sin pérdida de funcionalidad existente.

**Recomendación:** Proceder con confianza. La estrategia de coexistencia (enum + config table) elimina el mayor riesgo técnico.

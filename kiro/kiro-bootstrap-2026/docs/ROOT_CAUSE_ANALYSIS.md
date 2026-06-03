# ROOT_CAUSE_ANALYSIS.md — H-022, H-023, H-024

> **Fecha:** 02-Jun-2026
> **Sprint:** Ministerial Scope Bugfix — Pre-Production
> **Bloqueantes:** 3 hallazgos CRITICAL deben resolverse antes del piloto

---

## H-022: SMTP sigue fallando (PRE-001 FAIL)

### Causa Raíz

El `EmailService` no falla explícitamente — catch silencioso. El email no llega pero la app no lanza error visible al frontend. La invitación se crea en DB pero el correo no se envía.

Posibles causas:
1. **Gmail bloquea la conexión** porque `SMTP_SECURE = 'false'` pero Gmail 587 requiere STARTTLS
2. **App Password con espacios** — el valor `jwjg diqw kaks ddav` tiene espacios que pueden causar problemas dependiendo de cómo Railway inyecta las env vars
3. **`SMTP_FROM`** usa `noreply@communityos.app` — Gmail puede rechazar envíos con un FROM diferente al SMTP_USER

### Impacto
- Invitaciones se crean en DB con status PENDING pero email nunca llega
- El usuario ve "Invitación enviada" (éxito falso)
- No hay feedback del error real

### Solución

```typescript
// 1. En email.service.ts: Cambiar config para Gmail 587
this.transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true solo para 465, false para 587
  auth: user && pass ? { user, pass } : undefined,
  // Gmail 587 usa STARTTLS automáticamente cuando secure=false
});

// 2. Cambiar SMTP_FROM en Railway a:
// SMTP_FROM=J-PDVE Conexiones <juventudpdve@gmail.com>
// (debe coincidir con SMTP_USER para que Gmail no rechace)

// 3. Agregar verificación al startup:
if (this.transporter) {
  this.transporter.verify().then(() => {
    this.logger.log('SMTP connection verified ✓');
  }).catch((err) => {
    this.logger.error(`SMTP verification FAILED: ${err.message}`);
  });
}
```

### Variables Railway requeridas:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=juventudpdve@gmail.com
SMTP_PASS=jwjgdiqwkaksddav  ← SIN ESPACIOS
SMTP_FROM=J-PDVE Conexiones <juventudpdve@gmail.com>
```

**NOTA IMPORTANTE:** La App Password de Gmail son 16 caracteres SIN espacios. Google la muestra con espacios para legibilidad pero se debe ingresar sin ellos: `jwjgdiqwkaksddav`

---

## H-023: Dashboard KPI no refleja nuevo reporte (PRE-003 FAIL)

### Causa Raíz

**Cache no se invalida al crear un reporte.** El `DashboardKpisService` usa cache de 5 minutos:

```typescript
const KPI_CACHE_TTL = 300; // 5 minutes
```

Cuando `CellReportService.create()` guarda un nuevo reporte, **NO invalida** el cache de KPIs. El dashboard sigue mostrando datos cacheados hasta que expira el TTL.

### Evidencia SQL

```sql
-- El reporte SÍ se guarda:
SELECT * FROM cell_reports WHERE created_at > NOW() - INTERVAL '10 minutes';
-- → Muestra el reporte recién creado ✓

-- Pero el dashboard lee del cache (Redis):
-- Key: dashboard:kpis:{campusId}:all:{leaderCode}
-- TTL: 300 segundos
-- → Devuelve valor viejo hasta que expire
```

### Impacto
- Líder crea reporte → dashboard no cambia → piensa que no se guardó
- Confusión funcional crítica para el piloto

### Solución

Invalidar cache de dashboard después de crear un reporte:

```typescript
// En cell-report.service.ts, después de this.db.cellReport.create():
// Invalidar todas las keys de dashboard que podrían estar afectadas
await this.cache.delPattern('dashboard:kpis:*');
await this.cache.delPattern('dashboard:trend:*');
```

O más granular:
```typescript
// Invalidar solo el cache del campus del reporte
const campusId = group.campusId;
await this.cache.delPattern(`dashboard:kpis:${campusId}:*`);
await this.cache.delPattern(`dashboard:trend:${campusId}:*`);
```

Requiere inyectar `CacheService` en `CellReportService`.

---

## H-024: Pipeline no refleja promoción realizada (PRE-004 FAIL)

### Causa Raíz

Similar a H-023 — pero aquí el problema puede ser doble:

1. **Frontend no refresca la lista** después de la mutación (no invalida query cache de TanStack Query)
2. **Backend sí actualiza `pipelineStageId`** pero el frontend hace GET con datos cacheados

### Evidencia SQL

```sql
-- La promoción SÍ se guarda:
SELECT p.first_name, p.last_name, ps.name as stage
FROM persons p
JOIN pipeline_stage_configs ps ON p.pipeline_stage_id = ps.id
WHERE p.id = '{personId}';
-- → Muestra la nueva etapa ✓

-- El historial SÍ se registra:
SELECT * FROM person_pipeline_history WHERE person_id = '{personId}' ORDER BY changed_at DESC;
-- → Muestra la transición ✓
```

### Impacto
- Líder promueve persona → pipeline no se actualiza visualmente → confusión
- El dato SÍ está guardado pero no se muestra

### Solución

**Frontend:** Después de `POST /persons/advance-pipeline`, invalidar la query de personas/pipeline:
```typescript
// En el frontend mutation hook:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['persons'] });
  queryClient.invalidateQueries({ queryKey: ['pipeline'] });
}
```

**Backend (si hay cache):** El endpoint de personas no tiene cache en Redis (solo el dashboard), así que el problema es puramente de frontend query cache.

---

## Resumen de Correcciones

| Hallazgo | Tipo | Corrección | Esfuerzo |
|----------|------|-----------|----------|
| **H-022** | Backend config | Fix SMTP config + verify() + SMTP_FROM | Bajo |
| **H-023** | Backend cache | Invalidar `dashboard:kpis:*` al crear reporte | Bajo |
| **H-024** | Frontend cache | `invalidateQueries` después de mutación pipeline | Bajo |
| **H-021** | Frontend UX | Autocompletar datos del grupo (lookupByGroup ya existe) | Medio |

---

## Plan de Corrección

### Paso 1: Fix SMTP (H-022)
1. Quitar espacios de SMTP_PASS en Railway: `jwjgdiqwkaksddav`
2. Agregar `SMTP_FROM=J-PDVE Conexiones <juventudpdve@gmail.com>` en Railway
3. Agregar `transporter.verify()` en EmailService para log en startup
4. Push y redeploy

### Paso 2: Fix Cache Dashboard (H-023)
1. Inyectar CacheService en CellReportService
2. Después de `create()`: `await this.cache.delPattern('dashboard:*')`
3. Push y redeploy

### Paso 3: Fix Pipeline Refresh (H-024)
1. Encontrar el mutation hook de advance-pipeline en frontend
2. Agregar `invalidateQueries` en onSuccess
3. Push y redeploy (Vercel)

### Paso 4: Autocompletar Reporte (H-021)
1. El endpoint `lookupByGroup` YA EXISTE en CellReportService
2. El frontend debe llamarlo al seleccionar grupo y prellenar campos
3. Implementación puramente frontend

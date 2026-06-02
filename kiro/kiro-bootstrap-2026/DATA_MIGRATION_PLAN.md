# DATA_MIGRATION_PLAN.md — Carga de Datos Reales para Piloto

> **Objetivo:** Que J-PDVE Conexiones llegue al piloto con datos reales del ministerio, no vacío.
> **Responsable:** Admin técnico
> **Tiempo estimado:** 1-2 horas

---

## 1. Redes Ministeriales (Networks)

Crear las redes reales del Ministerio Palabras de Vida Eterna:

| # | Código | Nombre | Pastor de Red |
|---|--------|--------|---------------|
| 1 | CAB | Red de Caballeros | [Nombre] |
| 2 | DAM | Red de Damas | [Nombre] |
| 3 | JOV | Red de Jóvenes | [Nombre] |
| 4 | JOC | Red de Jovencitas | [Nombre] |
| 5 | MAT | Red de Matrimonios | [Nombre] |
| 6 | NIN | Red de Niños | [Nombre] |

**Método:** UI → /networks → Crear, o via seed script (ya existen 6 redes demo en seed).

**Acción:** Verificar que las 6 redes del seed coinciden con la realidad. Si no, actualizar nombres.

---

## 2. Coberturas Reales

Para cada red, identificar las coberturas (líderes que supervisan equipos):

| # | Red | Nombre Cobertura | Código | Equipos que supervisa |
|---|-----|-----------------|--------|----------------------|
| 1 | CAB | [Nombre] | [C1] | E1.1, E1.2, E1.3 |
| 2 | DAM | [Nombre] | [C2] | E2.1, E2.2 |
| 3 | JOV | [Nombre] | [C3] | E3.1, E3.2, E3.3 |
| ... | ... | ... | ... | ... |

**Método:** Crear como Users con rol LEADER + asignar como parent de los equipos.

---

## 3. Equipos Ministeriales Reales (para el piloto)

Cargar al menos los equipos de los líderes piloto:

| # | Código | Nombre | Red | Líder | Co-Líder | Día | Hora | Ubicación |
|---|--------|--------|-----|-------|----------|-----|------|-----------|
| 1 | E_._ | [Nombre] | [Red] | [Líder 1] | [Co-líder] | [Día] | [Hora] | [Dirección] |
| 2 | E_._ | [Nombre] | [Red] | [Líder 2] | [Co-líder] | [Día] | [Hora] | [Dirección] |
| 3 | E_._ | [Nombre] | [Red] | [Líder 3] | — | [Día] | [Hora] | [Dirección] |

**Datos requeridos por equipo:**
- [ ] Nombre del equipo (formato "Líder & Co-líder")
- [ ] Código ministerial (asignado por liderazgo)
- [ ] Red a la que pertenece
- [ ] Líder y co-líder (nombres + emails para crear cuentas)
- [ ] Día y hora de reunión
- [ ] Dirección (barriada, calle, casa #)
- [ ] GPS (opcional — se puede agregar después)

**Método:** UI → /groups → Crear grupo tipo CELL, asignar código, red, y miembros como LEADER.

---

## 4. Personas Iniciales

Por cada equipo piloto, registrar al menos 5-10 personas reales:

| # | Nombre | Apellido | Teléfono | Equipo | Stage |
|---|--------|----------|----------|--------|-------|
| 1 | [Nombre] | [Apellido] | [Tel] | E_._ | Visitante |
| 2 | [Nombre] | [Apellido] | [Tel] | E_._ | Consolidado |
| 3 | [Nombre] | [Apellido] | — | E_._ | Academia N1 |
| ... | ... | ... | ... | ... | ... |

**Fuente de datos:** Lista actual en papel/Excel de los equipos piloto.

**Método:** UI → /personas → Nueva Persona, asignar equipo y stage.

**Beneficio:** Permite probar:
- Timeline espiritual (si se avanza alguno de stage durante el piloto)
- Búsqueda de personas
- Asignación a equipos
- Pipeline stages con datos reales

---

## 5. Campus/Iglesia

| Campo | Valor |
|-------|-------|
| Nombre | Ministerio Palabras de Vida Eterna |
| Slug | sede-central (ya existe en seed) |
| Timezone | America/Panama |
| Church Code | JPDVE |
| Dirección | [Dirección real del templo] |

**Acción:** Actualizar el campus existente con datos reales via UI → /settings o directamente en DB:

```sql
UPDATE campuses
SET name = 'Ministerio Palabras de Vida Eterna',
    church_code = 'JPDVE',
    timezone = 'America/Panama',
    address = '[Dirección real]'
WHERE slug = 'sede-central';
```

---

## 6. Orden de Carga (Secuencia)

```
1. Verificar/actualizar Campus (iglesia)
2. Verificar/actualizar Redes (6 redes)
3. Crear Usuarios (pastor + cobertura + líderes)
4. Crear Equipos Ministeriales (con código, red, ubicación)
5. Asignar Usuarios como LEADER de sus equipos
6. Registrar Personas (5-10 por equipo)
7. Asignar Pipeline Stage a personas
8. Verificar jerarquía (pastor ve todo, cobertura ve sus equipos)
```

---

## 7. Validación Post-Carga

| Verificación | Cómo | Esperado |
|-------------|------|----------|
| Redes visibles | /networks | 6 redes con nombres reales |
| Equipos con código | /groups | Equipos con E_._ visibles |
| Jerarquía | Login como cobertura | Ve solo sus equipos |
| Personas asignadas | /personas filtrar por equipo | 5-10 personas por equipo |
| Pipeline | /pipeline | Distribución real de stages |
| Dashboard | /dashboard | KPIs en 0 (aún no hay reportes — correcto) |

---

## 8. Datos que NO se cargan (fuera del piloto)

- ❌ Reportes históricos (los líderes crearán durante el piloto)
- ❌ Fotos de evidencia (feature no conectada aún)
- ❌ Comentarios de cobertura (feature no conectada aún)
- ❌ Historial de multiplicaciones (no ha habido aún)
- ❌ Eventos (módulo V2)

---

## 9. Rollback Plan

Si la carga de datos tiene problemas:

```bash
# Resetear base de datos y re-seed
pnpm db:migrate reset
pnpm db:seed

# Luego recargar datos reales manualmente
```

**Importante:** Tomar un snapshot de la DB después de la carga exitosa para poder restaurar rápidamente si es necesario durante el piloto.

```bash
# Backup
pg_dump community_os_dev > backup_pilot_data.sql

# Restore
psql community_os_dev < backup_pilot_data.sql
```

# PILOT_0_SMOKE_TEST.md — Piloto 0: Smoke Test Operativo

> **Duración:** 2-3 días
> **Participantes:** 5 personas (1 Pastor + 1 Cobertura + 2 Líderes + 1 Admin)
> **Objetivo:** Validar con datos reales que todo funciona antes del piloto oficial de 2 semanas.

---

## Propósito

El Piloto 0 NO es para evaluar adopción ni satisfacción. Es un **smoke test operativo** para verificar:

1. ✅ Los datos reales del ministerio se cargan correctamente
2. ✅ La jerarquía ministerial funciona (quién ve qué)
3. ✅ Los reportes se envían, guardan, y aparecen en el dashboard
4. ✅ Las alertas se generan con datos reales
5. ✅ No hay bugs bloqueantes con datos de producción

---

## Participantes

| # | Rol | Nombre | Responsabilidad en el test |
|---|-----|--------|---------------------------|
| 1 | **Pastor** | [A definir] | Verificar dashboard KPIs + alertas + organigrama |
| 2 | **Cobertura** | [A definir] | Verificar que ve solo SUS equipos + reportes de sus líderes |
| 3 | **Líder 1** | [A definir] | Enviar reporte completo (domingo/lunes) |
| 4 | **Líder 2** | [A definir] | Enviar reporte + registrar personas/visitantes |
| 5 | **Admin técnico** | [Tú] | Monitorear, resolver issues en tiempo real |

---

## Cronograma (3 días)

### Día 1: Setup + Carga de Datos

| Hora | Actividad | Responsable |
|------|-----------|-------------|
| AM | Cargar datos reales (ver DATA_MIGRATION_PLAN.md) | Admin |
| AM | Crear cuentas de los 4 participantes | Admin |
| PM | Verificar: cada usuario puede hacer login | Admin |
| PM | Verificar: jerarquía correcta (cobertura ve sus equipos, pastor ve todo) | Admin |
| PM | Enviar credenciales a participantes | Admin |

### Día 2: Test de Flujo Completo

| # | Caso | Actor | Validación |
|---|------|-------|-----------|
| 1 | Login exitoso | Todos | ¿Cada rol accede a su dashboard correcto? |
| 2 | Crear reporte (período normal) | Líder 1 | ¿Wizard funciona? ¿Autosave? ¿Period status correcto? |
| 3 | Crear reporte (período tardío) | Líder 2 | ¿Banner amarillo "Envío Tardío" visible? |
| 4 | Registrar persona visitante | Líder 2 | ¿Persona aparece en /personas con stage? |
| 5 | Ver jerarquía | Cobertura | ¿Solo ve sus equipos, no los de otra cobertura? |
| 6 | **Líder NO reporta** | — (inacción) | **Alerta generada → visible para cobertura y pastor** |
| 7 | Dashboard actualizado | Pastor | ¿KPIs reflejan los reportes del día 2? |

### Día 3: Validación + Correcciones

| Hora | Actividad |
|------|-----------|
| AM | Reunión rápida (15 min): ¿Qué falló? ¿Qué confundió? |
| AM | Admin aplica hotfixes si necesario |
| PM | Re-test de lo que falló |
| PM | Decisión: ¿Listo para piloto oficial? ¿Qué ajustar? |

---

### Detalle Caso 6: Validación de No-Reporte

**Escenario:** Un líder NO envía su reporte. El sistema debe detectarlo y alertar.

**Precondición:** Al menos 1 líder reporta (Caso 2) y 1 líder NO reporta (inacción deliberada o simulada).

**Pasos para validar:**
1. Admin ejecuta detección manual: `POST /dashboard/alerts/detect`
2. Sistema analiza equipos sin reporte en las últimas 2+ semanas
3. Para el test: si no hay 2 semanas de historia, admin puede crear un dato simulado o verificar que el equipo sin reporte aparece en `GET /reports/cell/pending`

**Validaciones obligatorias:**
- [ ] Endpoint `GET /reports/cell/pending` muestra el equipo que no reportó
- [ ] Alerta tipo `MISSING_REPORT` se genera (o se confirma que se generaría con datos acumulados)
- [ ] Dashboard del pastor muestra KPI "Cumplimiento" < 100%
- [ ] Dashboard de cobertura muestra indicador del equipo faltante
- [ ] Si la alerta existe: botón "Atender" la marca como acknowledged

**Nota:** Si el piloto 0 dura solo 3 días, es posible que la detección automática de 2+ semanas no aplique. En ese caso, validar con:
- El endpoint `GET /reports/cell/pending` (muestra faltantes de la semana actual)
- Verificar que el KPI de cumplimiento refleja correctamente quién reportó y quién no

---

## Checklist de Validación

### Jerarquía y Permisos

- [ ] Pastor ve TODOS los equipos, reportes, personas
- [ ] Cobertura ve SOLO los equipos bajo su supervisión
- [ ] Líder ve SOLO su equipo y sus personas
- [ ] Líder NO puede ver reportes de otro equipo
- [ ] Códigos ministeriales se muestran correctamente (E4.1, E5.2, etc.)

### Reportes

- [ ] Líder puede crear reporte con wizard (4 pasos)
- [ ] Auto-lookup funciona (seleccionar grupo → rellena líder, código, cobertura)
- [ ] Period locking funciona (banner correcto según día de la semana)
- [ ] Autosave funciona (cerrar → reabrir → restaura)
- [ ] Submit funciona (confirmation screen)
- [ ] Reporte aparece en dashboard del pastor
- [ ] Reporte aparece en listado de la cobertura
- [ ] Duplicado detectado si se intenta enviar 2x misma semana

### Dashboard

- [ ] KPIs muestran datos reales (no ceros)
- [ ] Tendencia muestra al menos 1 punto de dato
- [ ] Alertas: si un equipo no reportó, aparece alerta

### Personas

- [ ] Líder puede registrar una persona (visitante)
- [ ] Pipeline stage se asigna correctamente
- [ ] Timeline muestra el registro inicial
- [ ] Persona aparece asociada al equipo correcto

### Móvil

- [ ] Login funciona en celular
- [ ] Bottom nav es accesible
- [ ] Wizard de reporte usable con taps (steppers ±)
- [ ] No hay overflow horizontal

---

## Criterios de Éxito (Go/No-Go para Piloto Oficial)

| Criterio | Go | No-Go |
|----------|:--:|:-----:|
| Los 2 líderes pudieron enviar reporte sin ayuda | ✅ | ❌ |
| KPIs reflejan datos reales en < 5 min | ✅ | ❌ |
| Jerarquía funciona correctamente (nadie ve data ajena) | ✅ | ❌ |
| 0 bugs bloqueantes en flujo de reporte | ✅ | ❌ |
| Tiempo de reporte < 5 min (aceptable para smoke test) | ✅ | ❌ |
| Autosave restaura correctamente | ✅ | ❌ |

Si TODOS los criterios son "Go" → Iniciar piloto oficial.
Si alguno es "No-Go" → Fix + re-test antes de pilotar.

---

## Notas Operativas

- **Ambiente:** Dev local (mismo que desarrollo). NO producción todavía.
- **URL:** http://localhost:3000 (o IP local de red si se comparte)
- **Base de datos:** community_os_dev con datos reales cargados
- **Soporte:** Admin disponible en persona o WhatsApp durante los 3 días
- **Rollback:** Si algo sale mal, se puede resetear la DB y recargar datos

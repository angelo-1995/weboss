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

| Hora | Actividad | Quién | Validación |
|------|-----------|-------|-----------|
| AM | Líder 1 envía reporte | Líder 1 | ¿Wizard funciona? ¿Autosave? ¿Period status correcto? |
| AM | Líder 2 envía reporte + registra 2 personas | Líder 2 | ¿Personas se crean? ¿Pipeline stage asignado? |
| PM | Cobertura revisa dashboard | Cobertura | ¿Ve los 2 reportes? ¿KPIs actualizados? |
| PM | Pastor revisa dashboard completo | Pastor | ¿Ve todo? ¿Alertas correctas? ¿Organigrama? |
| PM | Admin verifica audit logs | Admin | ¿Todas las acciones quedaron registradas? |

### Día 3: Validación + Correcciones

| Hora | Actividad |
|------|-----------|
| AM | Reunión rápida (15 min): ¿Qué falló? ¿Qué confundió? |
| AM | Admin aplica hotfixes si necesario |
| PM | Re-test de lo que falló |
| PM | Decisión: ¿Listo para piloto oficial? ¿Qué ajustar? |

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

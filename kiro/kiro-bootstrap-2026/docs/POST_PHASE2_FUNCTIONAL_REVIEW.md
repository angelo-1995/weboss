# POST_PHASE2_FUNCTIONAL_REVIEW.md

> **Fecha:** 02-Jun-2026
> **Sprint:** Ministerial Scope Bugfix
> **Fase:** Post-FASE 2, Pre-FASE 3
> **Objetivo:** Consolidar decisiones funcionales, definir qué se corrige ahora, qué va a V2, y evaluar si FASE 3 puede iniciarse sin riesgo de rediseño.

---

## Tema 1 — Módulo Discipulado

### Conclusión

El módulo Discipulado **NO es redundante**. Cada módulo responde una pregunta diferente:

| Módulo | Pregunta que responde |
|--------|----------------------|
| Ownership (ADR-011) | ¿Quién es responsable de esta persona? |
| Pipeline | ¿En qué etapa espiritual está? |
| Discipulado | ¿Qué seguimiento personalizado se ha realizado? |

### Decisión: Mantener en MVP

El módulo permanece. Los check-ins y milestones no tienen equivalente en ningún otro módulo.

### ADR-011A — Hybrid Discipleship Model

**Decisión aprobada:** El módulo Discipulado operará bajo un modelo híbrido.

| Tipo | Descripción | Creación |
|------|-------------|----------|
| **AUTO_DISCIPLESHIP** | Derivado automáticamente de `ownerLeaderId` + `currentGroupId` + estructura ministerial | Automática — no requiere acción manual |
| **SPECIAL_DISCIPLESHIP** | Relaciones manuales para casos fuera de la jerarquía ministerial | Manual — creada por pastor/líder |

**Campos del modelo SPECIAL_DISCIPLESHIP:**
```
mentorId, discipleId, relationshipType, notes, startDate, endDate, active
```

**UI requerida (V2):**
- Sección: "Discípulos Automáticos" (derivados de ownership)
- Sección: "Discipulados Especiales" (manuales)

**Reglas:**
- Un usuario puede existir en ambos contextos simultáneamente
- Los check-ins funcionan para ambos tipos
- Los milestones funcionan para ambos tipos
- El árbol ministerial se genera desde ownership
- Las relaciones especiales se superponen sin alterar ownership

**Objetivo:** Eliminar trabajo administrativo innecesario mientras se mantiene flexibilidad pastoral.

### V2-DISC-001: Rediseño UX Discipulado

**Prioridad:** HIGH (V2)
**No implementar ahora.**

Capacidades requeridas:
- Dashboard de discipulado por líder
- Check-ins pendientes (vista de tareas)
- Timeline por persona
- Hitos completados vs pendientes
- Seguimiento pastoral visual (tarjetas)
- Diferenciación visual AUTO vs SPECIAL

---

## Tema 2 — Cobertura

### Estado actual

La vista `/cobertura` es funcional para el piloto pero presenta una estética técnica que no comunica valor pastoral.

### V2-COV-001: Rediseño Vista de Cobertura

**Prioridad:** MEDIUM (V2)
**No implementar ahora.**

Alternativas a evaluar:

| Vista | Descripción |
|-------|-------------|
| **Vista Organigrama** | Árbol jerárquico interactivo (ReactFlow) |
| **Vista Supervisión** | Tarjetas por cobertura con métricas |

Cada tarjeta de cobertura mostraría:
- Nombre del líder
- Cantidad de células
- Cantidad de discípulos
- % Cumplimiento de reportes
- Alertas activas
- Último reporte entregado
- Estado (saludable / requiere atención / crítico)

---

## Tema 3 — Error al editar grupos

### H-016: Error genérico al actualizar grupo

**Síntoma:** Mensaje "Error al actualizar el grupo" sin detalle funcional.
**Prioridad:** ALTA
**Debe investigarse en FASE 3.**

**Diagnóstico requerido:**
- [ ] Endpoint involucrado: `PATCH /api/v1/groups/:id`
- [ ] Payload enviado desde frontend
- [ ] Respuesta exacta del backend (status code + body)
- [ ] Root cause (¿validación Zod? ¿constraint DB? ¿permiso faltante?)
- [ ] Verificar si el error ocurre solo para ciertos roles

**Hipótesis iniciales:**
1. El DTO de update incluye campos que el schema Zod no acepta
2. El slug ya existe (ConflictException)
3. Permiso insuficiente (el LEADER puede hacer PATCH pero quizás el guard no lo permite)
4. Campo `location` o `parentId` con formato incorrecto

---

## Tema 4 — Centro de Reportes Ministeriales

### RF-REP-021: Centro de Reportes Ministeriales

**Prioridad:** HIGH (Post-Piloto)
**No implementar ahora.**

**Capacidades:**

| Vista | Descripción |
|-------|-------------|
| Semanal | Reportes de la semana actual por célula |
| Mensual | Consolidado mensual con comparativas |
| Por red | Métricas consolidadas por red ministerial |
| Por cobertura | Métricas por líder de cobertura |
| Por líder | Vista individual de cada líder |
| Por célula | Historial completo de una célula |

**Filtros avanzados:**
- Rango de fechas
- Red / Cobertura / Líder / Célula
- Estado (entregado / pendiente / atrasado)
- Tipo (asistencia / ofrenda / visitantes / convertidos)

**Exportación:**
- Excel (.xlsx)
- PDF (formato reporte pastoral)
- CSV (datos crudos)

**Aplica:**
- ADR-010 (filtrado jerárquico)
- ADR-011 (ownership de reportes)
- RBAC (roles determinan qué se puede exportar)

---

## Tema 5 — Evaluación de MVP

### Clasificación de Módulos

| Módulo | Clasificación | Justificación |
|--------|---------------|---------------|
| Auth + JWT | ✅ MVP ESTABLE | Login funcional, roles, sesiones |
| Dashboard KPIs | ✅ MVP FUNCIONAL | Scope implementado (FASE 2), recalcula correctamente |
| Equipos (Groups) | ✅ MVP FUNCIONAL | Scope implementado, CRUD funcional |
| Personas | ✅ MVP FUNCIONAL | Scope implementado, ownership asignado |
| Pipeline | ✅ MVP FUNCIONAL | Scope via personas, promoción funcional |
| Cell Reports | ✅ MVP ESTABLE | Wizard funcional, historial de 12 meses |
| Organigrama | ✅ MVP ESTABLE | Read-only, sin scope (todos ven todo) |
| Cobertura | ⚠️ MVP FUNCIONAL PERO MEJORABLE | Vista técnica, funcional para piloto |
| Alertas | ✅ MVP FUNCIONAL | Scope implementado |
| Discipulado | ⚠️ MVP FUNCIONAL PERO MEJORABLE | Funciona pero UX no comunica valor |
| Invitaciones | ❌ BLOQUEANTE | SMTP no configurado — fix en FASE 4 |
| Sidebar/Menú | ❌ PENDIENTE FASE 3 | Menú no filtrado por rol todavía |
| Predicaciones | ✅ MVP ESTABLE | CRUD funcional, read-only para todos |
| Analytics | ⚠️ POST-PILOTO | Métricas globales, no scoped todavía |
| Centro de Reportes | ❌ V2 | No existe aún (RF-REP-021) |

### Riesgos Abiertos

| # | Riesgo | Impacto | Mitigación |
|---|--------|---------|------------|
| 1 | SMTP no configurado → invitaciones fallan | ALTO | Fix en FASE 4 (App Password Gmail) |
| 2 | Menú muestra items de admin a líderes | MEDIO | Fix en FASE 3 (frontend) |
| 3 | Error al editar grupos (H-016) | ALTO | Diagnosticar en FASE 3 |
| 4 | Mobile Pipeline UX (H-015) | MEDIO | Fix en FASE 3 |
| 5 | Cache puede tener stale data cross-user | BAJO | Mitigado con leaderCode en cache key |

### Hallazgos Abiertos

| ID | Descripción | Prioridad | Fase |
|----|-------------|-----------|------|
| H-001 | Error detalle usuario | CRÍTICA | FASE 3 |
| H-002 | Invitaciones SMTP | CRÍTICA | FASE 4 |
| H-007 | Menú por rol | ALTA | FASE 3 |
| H-010 | Pipeline móvil | ALTA | FASE 3 |
| H-015 | Mobile Pipeline tabs | ALTA | FASE 3 |
| H-016 | Error editar grupo | ALTA | FASE 3 |

### Deuda Funcional

| ID | Descripción | Clasificación |
|----|-------------|---------------|
| V2-DISC-001 | Rediseño UX Discipulado | V2 |
| V2-COV-001 | Rediseño Vista Cobertura | V2 |
| RF-REP-021 | Centro de Reportes Ministeriales | Post-Piloto |
| ADR-011A | Hybrid Discipleship Model | V2 |

### Deuda UX

| # | Área | Problema | Fase |
|---|------|----------|------|
| 1 | Dashboard | Labels genéricos ("Dashboard" vs "Mi Ministerio") | FASE 3 |
| 2 | Pipeline móvil | Kanban horizontal inutilizable | FASE 3 |
| 3 | Responsive | Botones cortados en móvil | FASE 3 |
| 4 | Discipulado | No comunica valor pastoral | V2 |
| 5 | Cobertura | Vista técnica, no pastoral | V2 |

---

## Evaluación: ¿Puede iniciarse FASE 3?

### Respuesta: **SÍ, con condiciones**

| Condición | Justificación |
|-----------|---------------|
| ✅ Backend scope está completo | FASE 2 implementó filtrado en todos los endpoints |
| ✅ No hay rediseño arquitectónico pendiente | ADR-010, ADR-011, ADR-011A solo documentan V2 |
| ✅ FASE 3 es solo frontend + correcciones | No toca la lógica de scope backend |
| ⚠️ H-016 debe diagnosticarse | Puede requerir fix backend mínimo |
| ⚠️ H-001 (detalle usuario) puede necesitar fix backend | Null Person handling |

### FASE 3 Scope Confirmado

| Tarea | Tipo | Riesgo |
|-------|------|--------|
| Menú dinámico por rol | Frontend only | Bajo |
| Dashboard labels contextuales | Frontend only | Bajo |
| Pipeline tabs mobile | Frontend only | Bajo |
| Fix detalle usuario (H-001) | Backend + Frontend | Bajo |
| Diagnóstico H-016 (editar grupo) | Investigación | Medio |

### Lo que NO se toca en FASE 3

- ❌ Discipulado UX (V2)
- ❌ Cobertura rediseño (V2)
- ❌ Centro de Reportes (Post-Piloto)
- ❌ ADR-011A Hybrid Model (V2)
- ❌ Analytics scope (Post-Piloto)
- ❌ SMTP / Invitaciones (FASE 4)

---

## Resumen Ejecutivo

El sistema está **funcionalmente listo para piloto controlado** después de completar FASE 3 y FASE 4. Los cambios restantes son:

1. **FASE 3 (Frontend):** Menú por rol, labels contextuales, Pipeline mobile, fix detalle usuario, diagnóstico error grupo
2. **FASE 4 (Operación):** SMTP config, invitaciones, smoke test final, E2E validation por rol

El filtrado jerárquico (ADR-010) y ownership (ADR-011) están implementados en backend. No hay riesgo de rediseño posterior si FASE 3 se ejecuta según lo definido.

**Decisión:** Autorizar FASE 3 con los alcances documentados arriba.

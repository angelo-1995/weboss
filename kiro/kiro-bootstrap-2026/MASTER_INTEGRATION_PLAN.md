# MASTER_INTEGRATION_PLAN.md — Plan Maestro de Integración

> **De:** Community OS (actual)
> **Hacia:** J-PDVE Conexiones (plataforma ministerial definitiva)
> **Principio:** Evolucionar, NO reiniciar.

---

## Resumen Ejecutivo

El proyecto actual tiene **85% del MVP implementado** en estructura. Los gaps son:
- Person como entidad separada (migration)
- Pipeline configurable (migration)
- Report period locking + drafts (service logic)
- Church como tenant (migration incremental)
- Nuevos módulos aditivos (Events, Resources genérico)

**Tiempo estimado para completar MVP J-PDVE:** 4-5 semanas de trabajo incremental.

---

## 1. QUÉ SE CONSERVA (sin cambios)

| Componente | Justificación |
|-----------|---------------|
| Monorepo structure (pnpm + turbo) | Funcional, bien configurado |
| NestJS app bootstrap (Fastify) | Completo con pipes, filters, interceptors |
| Auth module (JWT + sessions + refresh) | Completo y seguro |
| Users module (CRUD + profile) | Funcional |
| Groups module (hierarchy, members) | Equivale a MinistryTeam |
| Networks module (hierarchy, leaders) | Alineado con PRD |
| Discipleship module | Completo (milestones, check-ins) |
| Permissions module (RBAC + ABAC) | Funcional |
| Audit module + interceptor | Completo |
| CellReport entity + controller | Campos alineados con PRD |
| StageTransition entity | Base para PersonPipelineHistory |
| Notifications entity + module | Base funcional |
| Infrastructure (DB, Cache, Queue, Search, Email) | Todo configurado |
| Docker Compose | Funcional |
| Frontend layout + routing | 15 rutas funcionales |
| shadcn/ui components | Bien integrado |
| TanStack Query setup | Configurado |
| Framer Motion setup | Configurado |
| Hierarchy visibility service | Implementado |
| Organigrama page | Existente |
| Pipeline page | Existente |

**Total conservado: ~90% del código existente.**

---

## 2. QUÉ SE MEJORA (refactor incremental)

| Componente | Mejora | Tipo | Sprint |
|-----------|--------|------|--------|
| User model | Agregar `personId` FK, simplificar: user = cuenta de acceso | Migration | S1 |
| SpiritualStage enum | Migrar a `pipeline_stage_configs` tabla configurable | Migration | S1 |
| StageTransition | Renombrar a PersonPipelineHistory, agregar FK a config table | Migration | S1 |
| Campus model | Evolucionar a Church (agregar timezone, settings, code) | Migration | S1 |
| CellReport | Agregar: period_status, week_start, meeting_type, spiritual_health | Migration | S2 |
| CellReport service | Agregar: period locking validation, duplicate check | Code | S2 |
| Groups module | Agregar: TeamHistory, TeamMultiplication tracking | Migration + Code | S2 |
| Analytics module | Agregar: materialized views, Redis cache, más KPIs | Code + SQL | S3 |
| Notifications | Agregar: más tipos (pipeline_change, team_multiply, event) | Code | S3 |
| Sermons module | Generalizar a Resources (mantener sermons como subtipo) | Code | S3 |
| MinisterialRole | Mantener enum por ahora, migrar a MinistryPosition en V2 | V2 | S5 |

---

## 3. QUÉ SE ELIMINA

| Componente | Razón | Acción |
|-----------|-------|--------|
| **Nada se elimina** | Todo el código existente es funcional y alineado | Mantener todo |

> **Nota:** No hay código que sobra. El proyecto está bien construido. La evolución es puramente aditiva.

---

## 4. QUÉ SE FUSIONA

| Componente A | Componente B | Resultado | Sprint |
|-------------|-------------|-----------|--------|
| Campus | Church (nuevo concepto) | Church entity (campus fields + tenant features) | S1 |
| Sermons + SermonFile | Resources (nuevo concepto) | Resources con `type` field. Sermons es un type. | S3 |
| User.spiritualStage (enum) | PipelineStageConfig (nueva tabla) | FK a config table + historial | S1 |

---

## 5. QUÉ SE CREA (nuevo)

| Entidad/Módulo | Descripción | Sprint |
|---------------|-------------|--------|
| **Person** model | Individuo sin cuenta. FK desde User. | S1 |
| **PipelineStageConfig** table | Stages configurables por church | S1 |
| **PersonPipelineHistory** table | Historial de avances (evolución de StageTransition) | S1 |
| **Church** entity | Evolución de Campus como tenant | S1 |
| **CellReportDraft** table | Autosave de reportes (server-side) | S2 |
| **ReportPhoto** table | Fotos de evidencia | S2 |
| **ReportComment** table | Feedback de liderazgo | S2 |
| **TeamHistory** table | Event log de cambios en equipos | S2 |
| **TeamMultiplication** table | Registro formal de multiplicaciones | S2 |
| **OperationalAlert** table | Alertas auto-generadas | S3 |
| **Event** entity + module | Eventos del ministerio (V2) | S5 |
| **EventAttendance** entity | Registro de asistencia (V2) | S5 |
| **MinistryPosition** entity | Separar posición de rol (V2) | S5 |
| Service Worker + offline queue | PWA offline support | S3 |
| PWA manifest | Instalable en móvil | S3 |

---

## 6. QUÉ PASA A V2

| Feature | Razón | Sprint Estimado |
|---------|-------|----------------|
| Events module (CRUD + attendance) | No es MVP según PRD | S5-S6 |
| MinistryPosition (separar de UserRole) | Funciona con enum actual, refactor no urgente | S5 |
| Map integration (Leaflet) | Nice-to-have, no bloquea | S6 |
| Timeline espiritual (UI tab) | Requiere PersonPipelineHistory estable | S5 |
| Funnel ministerial avanzado | Requiere datos de historial acumulados | S5 |
| QR per person (auto check-in) | Phase 3 del PRD | S9+ |

---

## 7. QUÉ PASA A FUTURO

| Feature | Phase PRD |
|---------|-----------|
| Multi-church SaaS | Phase 4 |
| Academy module (levels, progress, graduation) | Phase 2 |
| QR check-in kiosk mode | Phase 3 |
| Communications/Announcements | Phase 2 |
| Goals & recognition system | Phase 3 |
| Advanced predictive analytics | Phase 3 |
| Mobile native app (React Native) | Phase 4 |

---

## 8. Orden de Ejecución

### Sprint 1: Data Model Evolution (Semana 1-2)

**Objetivo:** Alinear el modelo de datos con J-PDVE sin romper funcionalidad existente.

| # | Tarea | Tipo | Breaking? |
|---|-------|------|-----------|
| 1 | Crear tabla `persons` (firstName, lastName, phone, email, gender, etc.) | Migration | No |
| 2 | Agregar `person_id` FK nullable en `users` | Migration | No |
| 3 | Crear tabla `pipeline_stage_configs` (name, code, order, church_id) | Migration | No |
| 4 | Seed pipeline_stage_configs con los stages del PRD | Seed | No |
| 5 | Agregar `pipeline_stage_id` FK en `persons` | Migration | No |
| 6 | Evolucionar `stage_transitions` → agregar FK a stage configs | Migration | No |
| 7 | Agregar campos tenant a `campuses` (timezone, settings, code) | Migration | No |
| 8 | Crear tabla `person_team_history` | Migration | No |
| 9 | Backend: Persons module (CRUD + pipeline advancement) | Code | No |
| 10 | Frontend: Personas page (list + detail + pipeline) | Code | No |

### Sprint 2: Reports Evolution (Semana 3-4)

| # | Tarea | Tipo |
|---|-------|------|
| 1 | Agregar campos a cell_reports: period_status, week_start, meeting_type | Migration |
| 2 | Crear tabla `cell_report_drafts` | Migration |
| 3 | Crear tabla `report_photos` | Migration |
| 4 | Crear tabla `report_comments` | Migration |
| 5 | Crear tabla `team_history` | Migration |
| 6 | Crear tabla `team_multiplications` | Migration |
| 7 | Service: Report period locking logic | Code |
| 8 | Service: Draft save/restore/delete | Code |
| 9 | Service: Duplicate report check | Code |
| 10 | Service: Team multiplication workflow | Code |
| 11 | Frontend: Report wizard improvements | Code |
| 12 | Frontend: Photo upload component | Code |

### Sprint 3: Intelligence (Semana 5-6)

| # | Tarea | Tipo |
|---|-------|------|
| 1 | Crear tabla `operational_alerts` | Migration |
| 2 | Materialized views: weekly attendance | SQL |
| 3 | Redis cache for KPIs | Code |
| 4 | BullMQ jobs: alert detection (missing reports, decline) | Code |
| 5 | Dashboard: KPI cards + trend chart | Code |
| 6 | Extend Notifications (más tipos) | Code |
| 7 | Generalizar Sermons → Resources | Code/Migration |
| 8 | Service Worker + offline queue | Code |
| 9 | PWA manifest + install | Code |
| 10 | Frontend: Alerts panel | Code |

### Sprint 4: Polish + Production (Semana 7-8)

| # | Tarea | Tipo |
|---|-------|------|
| 1 | Dashboard avanzado: Top 10, network comparison | Code |
| 2 | Report export (CSV) | Code |
| 3 | Settings pages completion | Code |
| 4 | Empty states + error states (all pages) | Code |
| 5 | Mobile responsive polish | Code |
| 6 | Page transitions (Framer Motion) | Code |
| 7 | Production deployment (AWS) | Infra |
| 8 | Monitoring (Grafana basic) | Infra |
| 9 | SSL + CDN (Cloudflare) | Infra |
| 10 | Final QA + bug fixes | QA |

---

## 9. Renaming Strategy

El proyecto internamente se llama `community-os`. Para convertirlo en J-PDVE Conexiones:

| Aspecto | Cambio | Cuándo |
|---------|--------|--------|
| package.json name | `community-os` → mantener (internal) | No cambiar |
| UI branding | Logo, colores (#1565FF, #FFB400), tipografía (Anton, Montserrat) | Sprint 1 |
| Page titles | "Community OS" → "J-PDVE Conexiones" | Sprint 1 |
| Login page | Agregar branding J-PDVE | Sprint 1 |
| @community-os/* packages | Mantener scope interno | No cambiar |

**Razonamiento:** El scope `@community-os` es un nombre interno de paquete. Cambiarlo requiere actualizar todos los imports. No vale la pena. El branding visible al usuario es lo que importa.

---

## 10. Resultado Final

Después de los 4 sprints, el proyecto en `C:\Users\perez\webb_PDVE\kiro\kiro-bootstrap-2026` será:

✅ J-PDVE Conexiones — plataforma ministerial completa
✅ Con Person ≠ User
✅ Con Pipeline pastoral configurable + historial
✅ Con Equipos ministeriales con multiplicación + historial
✅ Con Reportes de célula con wizard + drafts + photos + locking
✅ Con Dashboard ejecutivo con KPIs + alertas
✅ Con Recursos generalizados
✅ Con Notificaciones extendidas
✅ Con PWA offline support
✅ Con toda la infraestructura actual preservada
✅ Con todas las pantallas actuales funcionando
✅ Sin código duplicado ni módulos aislados
✅ Listo para producción

---

## Decisión Clave

> **El proyecto NO se reescribe. Se EVOLUCIONA.**
> Cada sprint agrega capacidad sin romper lo existente.
> Las migraciones son aditivas (nuevas tablas, nuevos campos).
> Los módulos existentes se extienden, no se reemplazan.

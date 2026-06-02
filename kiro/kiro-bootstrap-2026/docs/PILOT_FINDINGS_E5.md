# Informe de Hallazgos del Piloto — Red E5

> **Fecha:** 02-Jun-2026
> **Revisión:** Product Owner
> **Ambiente:** weboss-beta.vercel.app + weboss-production.up.railway.app
> **Dataset:** Organigrama E5 completo (35 usuarios, 19 equipos, 97 personas, 702 reportes)

---

## Resumen Ejecutivo

Durante la primera revisión funcional del piloto se identificaron **14 hallazgos** categorizados en:

| Categoría | Críticos | Altos | Medios |
|-----------|----------|-------|--------|
| Filtrado jerárquico | 4 | 0 | 0 |
| Permisos y RBAC | 2 | 1 | 0 |
| Errores funcionales | 2 | 0 | 0 |
| Experiencia móvil | 0 | 2 | 2 |
| Modelo ministerial | 0 | 0 | 1 |
| **Total** | **8** | **3** | **3** |

**Hallazgo estratégico:** El sistema funciona como plataforma administrativa global. J-PDVE requiere una plataforma ministerial **jerárquica**. La siguiente fase debe resolver filtrado + RBAC antes del piloto masivo.

---

## Hallazgos Críticos (Bloqueantes para piloto masivo)

### H-001: Error al abrir detalle de usuario

**Módulo:** Acceso al Sistema
**Síntoma:** Al presionar "Ver", muestra "Error al cargar el usuario"
**Impacto:** Impide revisar información del usuario
**Endpoint:** `GET /api/v1/users/:id`

**Acción requerida:**
- [ ] Validar ID recibido en controller
- [ ] Verificar permisos del solicitante
- [ ] Validar relación User ↔ Person (puede ser null)
- [ ] Mejorar manejo de errores en frontend

---

### H-002: Envío de invitaciones falla

**Módulo:** Invitaciones
**Síntoma:** "Error al enviar la invitación"
**Impacto:** Impide incorporar nuevos usuarios

**Acción requerida:**
- [ ] Verificar configuración SMTP (Gmail requiere App Password)
- [ ] Agregar variables: SMTP_USER, SMTP_PASS
- [ ] Validar endpoint POST /api/v1/invitations
- [ ] Verificar logs del backend para error específico

---

### H-003: Dashboard muestra información global

**Síntoma:** Un líder visualiza asistencia total, visitantes totales, ofrenda total de TODA la organización.
**Impacto:** Muy alto. No respeta modelo ministerial.

**Regla de negocio:**
| Rol | Alcance Dashboard |
|-----|-------------------|
| Líder | Solo su célula |
| Cobertura | Sus células hijas |
| Pastor Red | Su red completa |
| Pastor General | Toda la organización |

**Acción requerida:**
- [ ] Endpoint `/api/v1/analytics/dashboard` debe recibir contexto del usuario
- [ ] Filtrar KPIs por `HierarchyVisibilityService.getVisibleGroupIds(userId)`
- [ ] Frontend: mostrar "Mi Ministerio" o "Mi Cobertura" según rol

---

### H-004: Equipos no filtrados por liderazgo

**Síntoma:** Un líder visualiza TODAS las células (E5.1, E5.2, E5.3...) cuando solo debería ver la suya y sus hijas.

**Acción requerida:**
- [ ] `GET /api/v1/groups` debe filtrar por jerarquía del usuario autenticado
- [ ] Usar `HierarchyVisibilityService` en GroupsRepository

---

### H-005: Personas no filtradas por jerarquía

**Síntoma:** La vista Personas muestra miembros fuera del alcance ministerial.

**Regla:**
- Líder: sus discípulos + visitantes de su célula
- Cobertura: todas las personas de sus células hijas
- Pastor Red: toda su red

**Acción requerida:**
- [ ] `GET /api/v1/persons` filtrar por grupos visibles
- [ ] `GET /api/v1/users` aplicar mismo filtro

---

### H-006: Pipeline no filtrado por liderazgo

**Síntoma:** Pipeline muestra personas ajenas al liderazgo del usuario.
**Impacto:** Muy alto. Rompe confidencialidad del proceso pastoral.

**Acción requerida:**
- [ ] Pipeline endpoint debe filtrar por jerarquía
- [ ] Solo mostrar personas de grupos visibles

---

### H-008: Falta RBAC completo

**Estado actual:** Solo se limitan algunas vistas por rol.
**Requerido:** Validación en TODOS los niveles:
- Menús (frontend)
- Pantallas (frontend guards)
- Endpoints (backend guards)
- Queries (repository layer)

**Nuevo requisito:** RF-RBAC-003 — Todo acceso debe validarse en frontend Y backend.

---

### H-014: Falta filtrado jerárquico global

**Regla maestra:**
```
Líder → Su célula, sus discípulos, sus visitantes
Cobertura → Sus células hijas
Pastor Red → Su red
Pastor General → Toda la organización
```

**Aplica a:** Dashboard, Pipeline, Personas, Equipos, Discipulado, Reportes, Alertas, KPIs

---

## Hallazgos Altos

### H-007: Menú visible para roles incorrectos

**Síntoma:** Líderes ven "Acceso al Sistema" y "Gestión de Predicaciones"

**Visibilidad correcta por rol:**
| Menú | Pastor General | Pastor Red | Cobertura | Líder |
|------|:-:|:-:|:-:|:-:|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Equipos | ✓ | ✓ | ✓ | ✓ |
| Personas | ✓ | ✓ | ✓ | ✓ |
| Pipeline | ✓ | ✓ | ✓ | ✓ |
| Reportes | ✓ | ✓ | ✓ | ✓ |
| Discipulado | ✓ | ✓ | ✓ | ✓ |
| Organigrama | ✓ | ✓ | ✓ | ✓ |
| Predicaciones (ver) | ✓ | ✓ | ✓ | ✓ |
| Predicaciones (admin) | ✓ | ✓ | ✗ | ✗ |
| Acceso al Sistema | ✓ | ✓* | ✗ | ✗ |
| Configuración | ✓ | ✓ | ✓ | ✓ |

*Solo pastores de red autorizados

---

### H-010: Pipeline móvil poco intuitivo

**Síntoma:** Columnas horizontales requieren desplazamiento excesivo. Usuario pierde contexto.

**Mejoras propuestas:**
- Opción A: Kanban simplificado (scroll horizontal suave)
- Opción B: Tabs por etapa: `[Ganados] [Consolidados] [Discipulado] [Enviados]`

---

### H-011: Responsive roto en Usuarios

**Síntoma:** Botones cortados, encabezados partidos, scroll horizontal en móvil.

---

## Hallazgos Medios

### H-009: Dashboard no contextualizado

**Mejora:** Mostrar "Mi Ministerio" o "Mi Cobertura" según rol, no "Dashboard" genérico.

### H-012: Botones cortados en Dashboard móvil

**Síntoma:** Botón "Atender" aparece parcialmente oculto en pantallas pequeñas.

### H-013: Gestión de usuarios no adaptada al modelo ministerial

**Recomendación:** Enfatizar `Person` como entidad principal. El sistema administra personas/discípulos, no "usuarios técnicos".

---

## Plan de Acción Priorizado

### Sprint Inmediato (Pre-piloto masivo)

| # | Hallazgo | Esfuerzo | Impacto |
|---|----------|----------|---------|
| 1 | H-014 Filtrado jerárquico global | Alto | Crítico |
| 2 | H-003 Dashboard contextualizado | Medio | Crítico |
| 3 | H-008 RBAC backend guards | Alto | Crítico |
| 4 | H-007 Menú por rol (frontend) | Bajo | Alto |
| 5 | H-001 Fix detalle usuario | Bajo | Crítico |
| 6 | H-002 Fix invitaciones SMTP | Bajo | Crítico |

### Sprint Siguiente

| # | Hallazgo | Esfuerzo | Impacto |
|---|----------|----------|---------|
| 7 | H-010 Pipeline móvil (tabs) | Medio | Alto |
| 8 | H-011 Responsive usuarios | Bajo | Alto |
| 9 | H-012 Botones móvil | Bajo | Medio |
| 10 | H-009 Labels contextuales | Bajo | Medio |
| 11 | H-013 UX modelo ministerial | Medio | Medio |

---

## Componente Clave: HierarchyVisibilityService

El servicio `HierarchyVisibilityService` ya existe en el backend. La implementación requiere:

1. **En cada Repository:** Agregar filtro `groupId IN (visibleGroupIds)`
2. **En cada Controller:** Inyectar userId del token JWT
3. **En frontend:** Sidebar items condicionados por `user.roles`

```typescript
// Uso esperado en cualquier service:
const visibleGroupIds = await this.hierarchy.getVisibleGroupIds(userId);
return this.prisma.person.findMany({
  where: { currentGroupId: { in: visibleGroupIds } }
});
```

---

## Conclusión

El sistema **funciona técnicamente** (API responde, login funciona, datos cargados). Pero **no está listo para piloto masivo** porque no implementa el modelo ministerial jerárquico. Un líder de célula no debe ver datos de otros líderes.

**Prioridad #1:** Implementar filtrado jerárquico en todos los endpoints antes de abrir acceso a los 35 líderes.

# UX_REVIEW_MVP.md — Validación Funcional del MVP

> **Fecha:** Junio 2026
> **Objetivo:** Determinar si J-PDVE Conexiones está listo para una prueba piloto real con líderes.

---

## 1. Flujo Líder → Reporte (Paso a Paso)

### 1.1 Login

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Abre la app | ✅ | Ninguna |
| 2 | Ve login con branding J-PDVE | ✅ | Ninguna |
| 3 | Ingresa email + password | ✅ | Ninguna |
| 4 | Click "Iniciar Sesión" | ✅ | Ninguna |
| 5 | Redirect a /dashboard | ✅ | Ninguna |

**Fricciones detectadas:** Ninguna. El login funciona end-to-end.

---

### 1.2 Dashboard → Ir a Reportes

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Líder ve Dashboard con KPIs | ✅ | Ninguna |
| 2 | Navega a Reportes via sidebar o bottom nav | ✅ | Ninguna |
| 3 | Ve la página de reportes con el wizard | ✅ | Ninguna |

**Fricciones detectadas:**
- ⚠️ **MEDIA**: En el sidebar, el item se llama "Informes" pero la bottom nav dice "Reportes". Inconsistencia de nomenclatura.
- ⚠️ **BAJA**: No hay un botón prominente "Nuevo Reporte" en el dashboard (existe en /reports directamente).

---

### 1.3 Crear Reporte (Wizard)

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Ve status banner (Abierto/Tardío/Cerrado) | ✅ | Ninguna |
| 2 | Selecciona equipo del dropdown | ✅ | ⚠️ Ver abajo |
| 3 | Campos se auto-rellenan (líder, código, cobertura) | ✅ | Ninguna (magia UX) |
| 4 | Selecciona fecha de reunión | ✅ | Ninguna |
| 5 | Click "Siguiente" → Step 2 (Asistencia) | ✅ | Ninguna |
| 6 | Usa steppers ± para asistencia | ✅ | Ninguna (touch optimizado) |
| 7 | Ve total calculado en tiempo real | ✅ | Ninguna |
| 8 | Click "Siguiente" → Step 3 (Reunión) | ✅ | Ninguna |
| 9 | Llena tema, ofrenda, ubicación | ✅ | Ninguna |
| 10 | Click "Revisar" → Step 4 (Resumen) | ✅ | Ninguna |
| 11 | Ve resumen completo con opción de editar cada sección | ✅ | Ninguna |
| 12 | Click "Enviar Reporte" | ✅ | Ninguna |
| 13 | Ve confirmación de éxito | ✅ | Ninguna |

**Fricciones detectadas:**
- ⚠️ **MEDIA**: Si el líder tiene múltiples equipos, el dropdown muestra todos. Podría pre-seleccionar el equipo principal.
- ⚠️ **BAJA**: Los steppers de asistencia no tienen long-press para incremento rápido (solo ± de 1 en 1).
- ✅ **RESUELTO**: Period locking bloquea envío visualmente si está cerrado.

---

### 1.4 Guardar Borrador

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Líder empieza a llenar el wizard | ✅ | Ninguna |
| 2 | Autosave a localStorage cada 30s | ✅ | Ninguna |
| 3 | Indicador "Borrador guardado: HH:MM" visible | ✅ | Ninguna |
| 4 | Líder cierra la app o navega | ✅ | Borrador persiste |

**Fricciones detectadas:**
- ⚠️ **MEDIA**: No hay autosave al servidor (solo localStorage). Si el líder cambia de dispositivo, pierde el borrador. Backend `POST /dashboard/drafts` existe pero no está conectado en el wizard.
- ⚠️ **BAJA**: No hay acción explícita "Guardar como borrador" — solo autosave silencioso. Algunos usuarios podrían no confiar en que se guardó.

---

### 1.5 Reabrir Borrador

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Líder vuelve a /reports | ✅ | Ninguna |
| 2 | Toast: "Borrador restaurado" | ✅ | Ninguna |
| 3 | Wizard restaura step + datos | ✅ | Ninguna |
| 4 | Si borrador > 7 días → se descarta | ✅ | Ninguna |

**Fricciones detectadas:** Ninguna significativa.

---

### 1.6 Enviar + Confirmación

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Click "Enviar Reporte" en step 4 | ✅ | Ninguna |
| 2 | Loading state (disabled button) | ✅ | Ninguna |
| 3 | Success: ícono ✓ + "¡Reporte Enviado!" | ✅ | Ninguna |
| 4 | Opciones: "Nuevo Reporte" / "Ver Historial" | ✅ | Ninguna |

**Fricciones detectadas:**
- ⚠️ **BAJA**: No hay celebración animada (confetti). Es un simple estado estático. Funcional pero no emocional.
- ⚠️ **BAJA**: No muestra comparativa vs semana anterior (microanalytics post-submit).

---

## 2. Flujo Cobertura

### 2.1 Ver Reportes

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Login como Cobertura | ✅ | Ninguna |
| 2 | Dashboard muestra KPIs de SUS equipos | ✅ | Filtrado por hierarchy |
| 3 | Navega a Informes | ✅ | Ve reportes de sus equipos |
| 4 | Filtra por equipo/fecha | ✅ | Funcional |

**Fricciones detectadas:**
- ⚠️ **ALTA**: No existe UI para **comentar un reporte** específico. El backend (`report_comments`) existe pero no hay interfaz. La cobertura no puede dar feedback directo sobre un reporte.
- ⚠️ **MEDIA**: No hay vista de "reportes de esta semana" agrupados por equipo para review rápido.

---

### 2.2 Detectar Faltantes

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Dashboard muestra alertas "sin reporte" | ✅ | Panel de alertas |
| 2 | Click "Atender" en alerta | ✅ | Marca como acknowledged |
| 3 | Navega al equipo faltante | ⚠️ | No hay link directo desde alerta al equipo |

**Fricciones detectadas:**
- ⚠️ **MEDIA**: Las alertas no tienen navegación directa al equipo/grupo. Solo se pueden "Atender" (acknowledge) pero no navegar al contexto.
- ⚠️ **BAJA**: El endpoint `GET /reports/cell/pending` existe y muestra pendientes, pero no está conectado visualmente de forma prominente para la cobertura.

---

### 2.3 Revisar Equipos

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Navega a "Grupos" | ✅ | Lista de equipos |
| 2 | Ve cards de equipos con info | ✅ | Nombre, tipo, miembros |
| 3 | Click en equipo → detalle | ✅ | Miembros, personas |

**Fricciones detectadas:**
- ⚠️ **MEDIA**: Las cards de grupo no muestran sparkline de asistencia (últimas 4 semanas). Solo info estática.
- ⚠️ **BAJA**: El label "Grupos" puede confundir — en J-PDVE son "Equipos Ministeriales". Renaming pendiente en sidebar.

---

## 3. Flujo Pastor

### 3.1 Dashboard

| Paso | Acción | Estado | Fricción |
|------|--------|--------|----------|
| 1 | Login como Admin/Pastor | ✅ | Ninguna |
| 2 | Ve 6 KPI cards (asistencia, visitantes, etc.) | ✅ | Funcional |
| 3 | Ve gráfica de tendencia | ✅ | GrowthChart 12 meses |
| 4 | Ve alertas pastorales | ✅ | Panel con tipos |

**Fricciones detectadas:**
- ⚠️ **BAJA**: No hay drill-down al clickear un KPI (muestra el valor pero no navega a detalles).
- ⚠️ **BAJA**: Los KPIs no muestran semana/período explícito ("Semana 23 · Jun 2-8").

---

### 3.2 KPIs

| KPI | Funcional | Fuente | Notas |
|-----|:---------:|--------|-------|
| Asistencia total | ✅ | /dashboard/kpis | Con trend % |
| Visitantes | ✅ | /dashboard/kpis | Con diferencia absoluta |
| Consolidados | ✅ | /dashboard/kpis | Solo valor |
| Ofrenda | ✅ | /dashboard/kpis | Con trend % y B/ |
| Equipos activos | ✅ | /dashboard/kpis | X/total |
| Cumplimiento | ✅ | /dashboard/kpis | Porcentaje |

**Evaluación:** KPIs funcionales y útiles para un pastor. Suficientes para piloto.

---

### 3.3 Alertas

| Tipo | Detección | Visualización | Acción |
|------|:---------:|:-------------:|:------:|
| Equipos sin reporte (2+ sem) | ✅ | ✅ | ⚠️ Solo acknowledge |
| Declive asistencia (3+ sem) | ✅ | ✅ | ⚠️ Solo acknowledge |
| Zero visitantes (4+ sem) | ✅ | ✅ | ⚠️ Solo acknowledge |

**Fricciones:**
- ⚠️ **MEDIA**: "Atender" solo marca como leída. No navega al contexto ni abre una acción pastoral.

---

### 3.4 Seguimiento

| Función | Estado | Notas |
|---------|--------|-------|
| Ver personas por equipo | ✅ | /personas con filtros |
| Timeline espiritual | ✅ | Tab en detalle de persona |
| Pipeline overview | ✅ | /pipeline con stages |
| Organigrama | ✅ | Árbol jerárquico |

**Evaluación:** El pastor puede hacer seguimiento básico. Para piloto es suficiente.

---

## 4. Usuarios vs Personas — Análisis de Confusión

### Estado Actual

| Concepto | Ruta | Sidebar Label | Quién aparece |
|----------|------|---------------|---------------|
| Usuarios | /users | "Usuarios" | Solo personas con cuenta de acceso |
| Personas | /personas | (no está en sidebar) | Todos (con o sin cuenta) |

### Riesgo de Confusión: 🟠 ALTO

**Problemas identificados:**

1. **"Personas" no está en el sidebar.** Solo se accede por bottom nav mobile o URL directa. Un admin en desktop NO ve la sección "Personas" en la navegación lateral.

2. **"Usuarios" muestra a todos los que tienen login.** Pero un líder podría pensar que "Usuarios" = "miembros del ministerio" y no encontrar a sus visitantes ahí.

3. **Las personas del ministerio que NO tienen login** solo existen en `/personas`. Si un líder busca a un visitante en `/users`, no lo encontrará.

4. **Overlap visual:** Tanto `/users` como `/personas` muestran nombre, avatar, y datos de contacto. Sin contexto claro de por qué existen dos secciones.

### Propuesta de Mejora

| Cambio | Impacto | Dificultad |
|--------|---------|-----------|
| **Agregar "Personas" al sidebar** bajo sección PERSONAS | Elimina invisibilidad | Baja (1 línea) |
| **Renombrar "Usuarios" → "Acceso al Sistema"** o moverlo a Settings | Reduce confusión semántica | Baja |
| **Banner explicativo** en /personas: "Aquí están todos los miembros del ministerio, tengan o no acceso al sistema" | Claridad inmediata | Baja |
| **Banner en /users:** "Estas son las cuentas con acceso al sistema. Para ver todos los miembros, ve a Personas." | Claridad | Baja |
| **A largo plazo:** Fusionar la vista. Mostrar Personas con un badge "Tiene acceso" si tienen User asociado | Elimina dualidad | Media |

### Recomendación Inmediata (pre-piloto)

1. Agregar "Personas" al sidebar bajo PERSONAS (entre Usuarios y Grupos)
2. Agregar subtitle en /users: "Cuentas con acceso al sistema"
3. Agregar subtitle en /personas: "Todos los miembros del ministerio"

Esto es suficiente para diferenciar sin refactorizar.

---

## 5. MVP GAP ANALYSIS

### 🔴 CRÍTICO (Bloquea piloto)

| # | Item | Razón | Estimación |
|---|------|-------|-----------|
| — | **Ninguno** | Todo lo crítico ya fue implementado | — |

### 🟠 ALTO (Impacta calidad del piloto)

| # | Item | Razón | Estimación |
|---|------|-------|-----------|
| 1 | "Personas" visible en sidebar | Sin esto, nadie encontrará la sección | 5 min |
| 2 | Labels claros Users vs Personas | Confusión operativa | 10 min |
| 3 | Sidebar: "Informes" → "Reportes" (consistencia con bottom nav) | Confusión nomenclatura | 5 min |
| 4 | Alertas con link al equipo | Sin contexto, la alerta no sirve | 30 min |
| 5 | Autosave al servidor (no solo localStorage) | Cambio de dispositivo pierde draft | 1h |

### 🟡 MEDIO (Mejoraría la experiencia pero no bloquea)

| # | Item | Razón | Estimación |
|---|------|-------|-----------|
| 6 | Comentarios en reportes (UI) | Backend existe, falta frontend | 2h |
| 7 | Sparklines en cards de equipos | Contexto visual de salud | 2h |
| 8 | Drill-down desde KPIs | Exploración de datos | 3h |
| 9 | Período/semana visible en dashboard | Contexto temporal | 30min |
| 10 | Celebración animada post-submit | Engagement emocional | 1h |
| 11 | Fotos de evidencia (upload UI) | Backend soporta, falta UI | 2h |

### 🟢 BAJO (Post-piloto, V2)

| # | Item | Estimación |
|---|------|-----------|
| 12 | Long-press en steppers | 1h |
| 13 | Swipe entre pasos del wizard | 2h |
| 14 | Quick Report Mode (pre-fill semana anterior) | 2h |
| 15 | Offline sync (Service Worker) | 4h |
| 16 | Map view de equipos | 4h |
| 17 | Export PDF/CSV desde dashboard | 2h |

---

## 6. Ready For Pilot Assessment

### ¿Puede un grupo pequeño de líderes comenzar a usar el sistema HOY?

## ✅ SÍ — CON CONDICIONES

El sistema es **funcionalmente viable** para un piloto con las siguientes capacidades confirmadas:

| Capacidad | Estado | Notas |
|-----------|:------:|-------|
| Login seguro | ✅ | JWT + refresh + sessions |
| Crear reporte de célula | ✅ | Wizard 4 pasos + autosave local |
| Period locking (dom/lun-mié/jue) | ✅ | Visual + backend enforced |
| Ver dashboard con KPIs | ✅ | 6 métricas + trend |
| Ver alertas pastorales | ✅ | Auto-generadas |
| Registrar personas (visitantes) | ✅ | CRUD + pipeline stages |
| Ver timeline espiritual | ✅ | Historial de avances |
| Organigrama | ✅ | Árbol jerárquico visual |
| Auditoría | ✅ | Todas las mutaciones |
| Mobile-first | ✅ | Bottom nav + responsive |
| Branding J-PDVE | ✅ | Login + sidebar + colors + fonts |

### Condiciones para iniciar piloto:

**MUST-DO antes del piloto (30 minutos de trabajo):**

1. ✏️ Agregar "Personas" al sidebar navigation
2. ✏️ Cambiar label "Informes" → "Reportes" en sidebar
3. ✏️ Agregar subtitles diferenciadores en /users y /personas

**NICE-TO-HAVE antes del piloto (2-3 horas):**

4. Links en alertas hacia el equipo afectado
5. Conectar autosave al servidor (no solo localStorage)

### Grupo piloto recomendado:

- **Tamaño:** 3-5 líderes de célula + 1 cobertura + 1 pastor
- **Duración:** 2 semanas (2 ciclos de reporte)
- **Objetivo:** Validar flujo reporte end-to-end + dashboard + personas
- **Feedback:** Formulario de satisfacción + sesión de retroalimentación

### Datos necesarios antes del piloto:

1. Crear campus/iglesia en el sistema
2. Crear cuentas de usuario para los líderes piloto
3. Crear los grupos/equipos ministeriales con códigos
4. Configurar los pipeline stages (seed ya existe con 9 stages)
5. Opcional: registrar algunas personas de prueba

### Riesgos del piloto:

| Riesgo | Mitigación |
|--------|-----------|
| Líder pierde borrador al cambiar de cel | Agregar autosave server antes del piloto |
| Confusión Usuarios vs Personas | Fix labels antes del piloto (5 min) |
| Período cerrado sin entender por qué | Banner ya explica, pero agregar fecha límite visible |
| No saben navegar en desktop (sidebar largo) | Capacitación de 15 min + video tutorial |

---

## Veredicto Final

> **El MVP de J-PDVE Conexiones está LISTO para piloto** con 30 minutos de ajustes menores (sidebar labels + personas visible).
>
> El núcleo ministerial funciona: un líder puede enviar reportes, un pastor puede ver KPIs y alertas, y las personas se gestionan con timeline espiritual.
>
> Los items pendientes (comentarios, fotos, drill-down, celebraciones) son mejoras de experiencia, no bloqueadores funcionales.

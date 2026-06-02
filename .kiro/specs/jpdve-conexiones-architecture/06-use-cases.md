# 6. Casos de Uso — J-PDVE Conexiones

---

## UC-01: Autenticación

### UC-01.1: Login

| Campo | Valor |
|-------|-------|
| **Actor** | User (cualquier rol) |
| **Precondición** | User existe y está ACTIVE |
| **Postcondición** | Sesión creada, tokens emitidos |

**Flujo Principal:**
1. User ingresa email + password
2. Sistema valida formato (Zod)
3. Sistema busca user por email
4. Sistema verifica password con Argon2
5. Sistema genera access token (JWT, 15min) + refresh token (7 días)
6. Sistema crea registro en `sessions`
7. Sistema registra audit log (LOGIN)
8. Sistema retorna tokens + user profile

**Flujos Alternos:**
- 3a. Email no existe → Error 401 "Credenciales inválidas"
- 4a. Password incorrecto → Error 401 "Credenciales inválidas" + incrementar contador
- 4b. Cuenta SUSPENDED → Error 403 "Cuenta suspendida"
- 4c. Cuenta PENDING_VERIFICATION → Error 403 "Verificación pendiente"
- 4d. 5 intentos fallidos en 15min → Rate limit, bloqueo temporal

**Validaciones:**
- Email: formato válido, max 255 chars
- Password: min 8 chars

---

### UC-01.2: Refresh Token

| Campo | Valor |
|-------|-------|
| **Actor** | Sistema (automático) |
| **Precondición** | Refresh token válido y no expirado |

**Flujo Principal:**
1. Cliente envía refresh token
2. Sistema busca sesión por refresh token
3. Sistema verifica no expirado
4. Sistema genera nuevo access token
5. Sistema rota refresh token (invalida el anterior, emite nuevo)
6. Sistema retorna nuevos tokens

**Flujos Alternos:**
- 2a. Token no encontrado → Error 401 (sesión invalidada)
- 3a. Token expirado → Error 401, eliminar sesión

---

### UC-01.3: Logout

| Campo | Valor |
|-------|-------|
| **Actor** | User autenticado |

**Flujo Principal:**
1. User solicita logout
2. Sistema elimina sesión de la tabla `sessions`
3. Sistema registra audit log (LOGOUT)
4. Sistema retorna confirmación

---

### UC-01.4: Recuperación de Contraseña

| Campo | Valor |
|-------|-------|
| **Actor** | User con cuenta existente |

**Flujo Principal:**
1. User ingresa email
2. Sistema genera token temporal (UUID, 1 hora de expiración)
3. Sistema envía email con link de reset (queue async)
4. User accede al link
5. User ingresa nueva contraseña (2 veces)
6. Sistema valida token no expirado
7. Sistema actualiza password hash
8. Sistema invalida todas las sesiones activas
9. Sistema registra audit log (PASSWORD_RESET)

**Flujos Alternos:**
- 2a. Email no existe → NO revelar que no existe (seguridad), mostrar mismo mensaje
- 6a. Token expirado → Error "Link expirado, solicitar nuevo"
- 6b. Token ya usado → Error "Link ya utilizado"

---

## UC-02: Gestión de Personas

### UC-02.1: Registrar Nueva Persona

| Campo | Valor |
|-------|-------|
| **Actor** | MINISTRY_TEAM, COBERTURA, PASTOR_RED, PASTOR_GENERAL |
| **Precondición** | Actor tiene un Ministry Team asignado |

**Flujo Principal:**
1. Actor abre formulario de nueva persona
2. Actor ingresa: nombre, apellido, teléfono (opcional), email (opcional), género, fecha nacimiento (opcional)
3. Actor selecciona Ministry Team destino (default: su propio team)
4. Sistema valida campos
5. Sistema crea Person con stage inicial "VISITANTE"
6. Sistema crea registro en `person_team_history`
7. Sistema registra audit log (CREATE PERSON)
8. Sistema retorna confirmación

**Flujos Alternos:**
- 3a. Actor intenta asignar a team que no supervisa → Error 403
- 4a. Validación falla → Error 400 con campos específicos

**Validaciones:**
- firstName: 1-100 chars, no vacío
- lastName: 1-100 chars, no vacío
- phone: formato internacional o panameño
- email: formato válido si se provee
- teamId: debe existir y estar activo

---

### UC-02.2: Avanzar Persona en Pipeline

| Campo | Valor |
|-------|-------|
| **Actor** | MINISTRY_TEAM (su equipo), COBERTURA (sus equipos), PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor selecciona persona
2. Actor selecciona nuevo stage del pipeline
3. Sistema valida que el nuevo stage es siguiente al actual (orden secuencial)
4. Sistema actualiza `pipeline_stage_id` y `pipeline_stage_date`
5. Sistema registra audit log (UPDATE PERSON STAGE)
6. Sistema retorna confirmación con animación de avance

**Flujos Alternos:**
- 3a. Stage no es siguiente secuencial → Warning "¿Estás seguro de saltar stages?" + confirmación
- Actor no tiene permiso sobre esa persona → Error 403

---

### UC-02.3: Transferir Persona

| Campo | Valor |
|-------|-------|
| **Actor** | COBERTURA, PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor selecciona persona(s)
2. Actor selecciona Ministry Team destino
3. Sistema valida que actor supervisa origen Y destino
4. Sistema actualiza `current_team_id` en Person
5. Sistema cierra registro actual en `person_team_history` (set removed_at)
6. Sistema crea nuevo registro en `person_team_history`
7. Sistema registra audit log (TRANSFER PERSON)
8. Sistema notifica a ambos teams

**Flujos Alternos:**
- 3a. Actor no supervisa destino → Error 403 "No tienes autoridad sobre el equipo destino"
- 2a. Team destino inactivo → Error 400 "El equipo destino no está activo"

---

### UC-02.4: Buscar Personas

| Campo | Valor |
|-------|-------|
| **Actor** | Cualquier user autenticado |

**Flujo Principal:**
1. Actor ingresa texto de búsqueda (nombre, apellido)
2. Sistema busca en Meilisearch (fuzzy)
3. Sistema filtra por visibilidad jerárquica del actor
4. Sistema retorna lista paginada con: nombre, stage, team, teléfono

**Filtros disponibles:**
- Pipeline stage
- Ministry Team
- Red
- Fecha de ingreso (rango)

---

## UC-03: Gestión de Equipos Ministeriales

### UC-03.1: Crear Ministry Team

| Campo | Valor |
|-------|-------|
| **Actor** | COBERTURA, PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor ingresa: nombre del equipo, dirección de reunión, día y hora
2. Actor asigna código ministerial (manual)
3. Actor selecciona red y cobertura padre
4. Sistema valida unicidad del código dentro de la iglesia
5. Sistema crea MinistryTeam
6. Sistema crea ltree path basado en parent
7. Sistema registra audit log (CREATE TEAM)
8. Sistema retorna confirmación

**Flujos Alternos:**
- 4a. Código duplicado → Error 400 "Código ya asignado a otro equipo"
- 3a. Red no existe → Error 400
- GPS: Actor puede opcionalmente capturar coordenadas

**Validaciones:**
- name: 1-200 chars
- ministryCode: 1-50 chars, formato alfanumérico con puntos
- meetingDay: enum válido
- meetingTime: formato HH:mm

---

### UC-03.2: Asignar Líderes al Team

| Campo | Valor |
|-------|-------|
| **Actor** | COBERTURA (sus teams), PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor selecciona Ministry Team
2. Actor busca usuario(s) para asignar como líder/co-líder
3. Sistema valida que el user existe y está activo
4. Sistema crea TeamMember con role LEADER o CO_LEADER
5. Sistema registra audit log

**Flujos Alternos:**
- User ya es member del team → Error 400 "Ya es miembro del equipo"
- Team ya tiene 2 leaders → Warning "¿Agregar un tercer líder?"

---

### UC-03.3: Multiplicar Ministry Team

| Campo | Valor |
|-------|-------|
| **Actor** | COBERTURA, PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor selecciona team a multiplicar
2. Actor define nombre del nuevo team
3. Actor asigna nuevo código ministerial
4. Actor selecciona personas a mover al nuevo team
5. Actor selecciona nuevos líderes del team hijo
6. Sistema crea nuevo MinistryTeam bajo misma cobertura
7. Sistema transfiere personas seleccionadas
8. Sistema actualiza status del team original si necesario
9. Sistema registra audit log (MULTIPLY TEAM)
10. Sistema notifica a involucrados

**Flujos Alternos:**
- Código nuevo duplicado → Error 400
- No se seleccionan líderes → Error 400 "El nuevo equipo necesita al menos un líder"

---

## UC-04: Informes de Célula

### UC-04.1: Crear Reporte Semanal

| Campo | Valor |
|-------|-------|
| **Actor** | MINISTRY_TEAM (su team), COBERTURA (sus teams) |
| **Precondición** | No existe reporte para ese team+semana |

**Flujo Principal:**
1. Actor abre formulario de reporte
2. Sistema verifica período (domingo=NORMAL, lun-mié=LATE)
3. Sistema verifica no existe duplicado para esa semana
4. Actor llena campos del wizard (5 pasos)
5. Actor revisa resumen
6. Actor envía reporte
7. Sistema calcula totalAttendance
8. Sistema calcula weekStart (lunes de la semana)
9. Sistema persiste CellReport
10. Sistema invalida cache de dashboard
11. Sistema emite evento REPORT_SUBMITTED
12. Sistema registra audit log
13. Sistema muestra celebración + trends

**Flujos Alternos:**
- 2a. Período cerrado (jueves+) → Error 403 "El período de reporte está cerrado"
- 3a. Duplicado detectado → Warning banner con link al reporte existente
- 6a. Sin conexión → Queue offline + confirmación local
- 6b. Error de servidor → Preservar datos, habilitar retry

**Validaciones:**
- reportDate: no futuro, no mayor a 7 días atrás
- Attendance counts: 0-999, integer
- offeringAmount: >= 0, decimal(10,2)
- topic: max 300 chars
- notes: max text
- photos: max 3, max 5MB cada una, JPEG/PNG

---

### UC-04.2: Guardar Borrador

| Campo | Valor |
|-------|-------|
| **Actor** | Sistema (automático) |

**Flujo Principal:**
1. Cada 30 segundos, sistema persiste form state a localStorage
2. Si online, sistema sincroniza a servidor (debounced 10s)
3. Al cerrar/navegar, sistema persiste inmediatamente

**Flujos Alternos:**
- localStorage lleno → Warning "Autosave no disponible"
- Server sync falla → Continuar solo con localStorage

---

### UC-04.3: Comentar Reporte

| Campo | Valor |
|-------|-------|
| **Actor** | COBERTURA, PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor abre reporte de un team bajo su supervisión
2. Actor escribe comentario
3. Sistema persiste ReportComment
4. Sistema notifica al Ministry Team
5. Sistema registra audit log

---

### UC-04.4: Editar Reporte

| Campo | Valor |
|-------|-------|
| **Actor** | MINISTRY_TEAM (su reporte), COBERTURA (sus teams) |
| **Precondición** | Reporte no está LOCKED (período no cerrado) |

**Flujo Principal:**
1. Actor abre reporte existente
2. Sistema verifica que período no está cerrado
3. Actor modifica campos
4. Sistema persiste cambios
5. Sistema registra audit log con before/after values
6. Sistema invalida cache

**Flujos Alternos:**
- Período cerrado → Solo lectura, botones deshabilitados

---

## UC-05: Recursos

### UC-05.1: Subir Recurso

| Campo | Valor |
|-------|-------|
| **Actor** | PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor selecciona archivo (PDF, imagen)
2. Actor ingresa título, descripción, categoría
3. Actor define visibilidad mínima (qué roles pueden ver)
4. Sistema valida archivo (tipo, tamaño)
5. Sistema genera presigned URL para S3
6. Sistema sube archivo directamente a S3
7. Sistema persiste metadata en Resource
8. Sistema indexa en Meilisearch
9. Sistema genera notificación para usuarios elegibles (async)
10. Sistema registra audit log

**Validaciones:**
- Archivo: PDF, JPEG, PNG; max 50MB
- Título: 1-300 chars
- Descripción: max 2000 chars

---

### UC-05.2: Listar Recursos

| Campo | Valor |
|-------|-------|
| **Actor** | Cualquier user autenticado |

**Flujo Principal:**
1. Actor abre centro de recursos
2. Sistema filtra por visibilidad del rol del actor
3. Sistema retorna lista paginada con: título, categoría, fecha, tipo archivo
4. Actor puede filtrar por categoría, buscar por texto

---

### UC-05.3: Descargar Recurso

| Campo | Valor |
|-------|-------|
| **Actor** | User con visibilidad suficiente |

**Flujo Principal:**
1. Actor solicita descarga
2. Sistema verifica permiso
3. Sistema genera presigned URL temporal (5 min)
4. Sistema retorna URL para descarga directa

---

## UC-06: Dashboard

### UC-06.1: Ver Dashboard Ejecutivo

| Campo | Valor |
|-------|-------|
| **Actor** | COBERTURA, PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor accede al dashboard
2. Sistema determina scope de visibilidad (hierarchy)
3. Sistema consulta KPIs desde cache/materialized views
4. Sistema retorna: asistencia semanal, ofrendas, visitantes, consolidados, teams activos, reportes faltantes
5. Actor puede cambiar período (semana actual, anterior, rango)

**KPIs mostrados:**
- Total asistencia (sum de todos los reports en scope)
- Total ofrenda (sum)
- Visitantes nuevos (sum)
- Consolidados (sum)
- Teams activos (que reportaron en las últimas 4 semanas)
- Reportes faltantes (teams sin report esta semana)

---

### UC-06.2: Ver Dashboard Avanzado

| Campo | Valor |
|-------|-------|
| **Actor** | PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor selecciona vista avanzada
2. Sistema calcula rankings:
   - Top 10 Teams (por asistencia)
   - Top 10 Coberturas (por asistencia de sus teams)
   - Top 10 Redes (por asistencia total)
3. Sistema calcula tendencias (12 semanas)
4. Actor puede drill-down en cualquier métrica

---

### UC-06.3: Drill-Down de KPI

| Campo | Valor |
|-------|-------|
| **Actor** | COBERTURA+ |

**Flujo Principal:**
1. Actor clickea un KPI card
2. Sistema muestra lista filtrada de registros que componen el KPI
3. Actor puede ordenar, filtrar, paginar
4. Actor puede navegar al detalle de un registro específico

---

## UC-07: Notificaciones

### UC-07.1: Recibir Notificación

| Campo | Valor |
|-------|-------|
| **Actor** | Sistema (generador) → User (receptor) |

**Flujo Principal:**
1. Evento ocurre (report submitted, resource uploaded, alert generated)
2. Sistema determina destinatario(s) basado en jerarquía
3. Sistema crea Notification para cada destinatario
4. Frontend muestra badge de notificación no leída

**Tipos de notificación:**
- REPORT_PENDING: "Tu equipo no ha enviado el reporte esta semana"
- REPORT_COMMENTED: "Tu cobertura comentó tu reporte"
- NEW_RESOURCE: "Nuevo recurso disponible: {título}"
- ALERT_GENERATED: "Alerta: {equipo} no ha reportado en 2 semanas"

---

### UC-07.2: Listar y Marcar Notificaciones

| Campo | Valor |
|-------|-------|
| **Actor** | User autenticado |

**Flujo Principal:**
1. Actor abre panel de notificaciones
2. Sistema retorna lista paginada (más recientes primero)
3. Actor puede marcar individual como leída
4. Actor puede marcar todas como leídas
5. Actor puede clickear para navegar al contexto

---

## UC-08: Alertas Pastorales

### UC-08.1: Generar Alertas Automáticas

| Campo | Valor |
|-------|-------|
| **Actor** | Sistema (BullMQ cron job) |

**Flujo Principal:**
1. Job se ejecuta cada 15 minutos
2. Sistema consulta teams sin reporte en 2+ semanas consecutivas
3. Sistema consulta teams con declive de asistencia (3+ semanas)
4. Sistema consulta teams con 0 visitantes (4+ semanas)
5. Para cada anomalía detectada, sistema verifica si ya existe alerta activa
6. Si no existe, sistema crea OperationalAlert
7. Sistema genera notificación al responsable (cobertura del team)

**Flujos Alternos:**
- Alerta ya existe y no está acknowledged → No duplicar
- Team fue inactivado → No generar alerta

---

### UC-08.2: Atender Alerta

| Campo | Valor |
|-------|-------|
| **Actor** | COBERTURA, PASTOR_RED, PASTOR_GENERAL |

**Flujo Principal:**
1. Actor ve alerta en panel
2. Actor clickea para ver detalle/contexto
3. Actor marca como atendida (acknowledged)
4. Sistema registra acknowledged_by y acknowledged_at
5. Alerta se mueve a sección de "atendidas"

# Requirements Document — Frontend CRUD, UX & Reporting

## Introduction

Este documento define los requisitos para completar las funcionalidades faltantes del frontend de Enterprise Community OS. La plataforma ya cuenta con un backend NestJS funcional (auth, users, groups, discipleship, memberships, permissions, reporting, audit, search, analytics) y un frontend Next.js 15 con páginas base. Los módulos aquí descritos corresponden a los 10 flujos operativos críticos que necesita la organización para funcionar día a día.

**Stack**: Next.js 15 · shadcn/ui · React Hook Form · Zod · Tailwind · Zustand · React Query · NestJS · Prisma · PostgreSQL · Redis · BullMQ

**Estilo visual**: Linear / Stripe Dashboard / Notion — cards modernas, spacing limpio, dark mode, mobile-first.

---

## Glossary

- **Sistema_Frontend**: Aplicación Next.js 15 que consume la API REST
- **API_Backend**: Servidor NestJS en puerto 4000
- **Líder_Célula**: Usuario con rol LEADER responsable de un grupo tipo CELL
- **Admin_Pastor**: Usuario con rol ADMIN o SUPER_ADMIN que supervisa múltiples células
- **Informe_Semanal**: Registro semanal de actividad de una célula (asistencia, visitantes, oración, notas)
- **Onboarding**: Proceso de invitación, activación de cuenta y definición de contraseña
- **Command_Palette**: Componente de búsqueda global tipo Cmd+K
- **Optimistic_Update**: Actualización inmediata de UI antes de confirmación del servidor

---

## Requirements

### Requirement 1: Actualizar Contraseña (Módulo Moderno)

**User Story:** Como usuario autenticado, quiero cambiar mi contraseña de forma segura con feedback visual en tiempo real, para mantener la seguridad de mi cuenta.

#### Acceptance Criteria

1. WHEN el usuario accede a la sección de seguridad en su perfil, THE Sistema_Frontend SHALL mostrar un formulario con: contraseña actual, nueva contraseña, confirmar contraseña
2. WHILE el usuario escribe la nueva contraseña, THE Sistema_Frontend SHALL mostrar un indicador de fortaleza (débil/media/fuerte) con barra de progreso visual y criterios cumplidos (mínimo 8 chars, mayúscula, número, símbolo)
3. WHEN el usuario hace clic en el ícono de ojo en cualquier campo de contraseña, THE Sistema_Frontend SHALL alternar entre mostrar/ocultar el texto
4. WHEN el usuario envía el formulario con datos válidos, THE Sistema_Frontend SHALL enviar PATCH a /api/v1/auth/password con { currentPassword, newPassword }
5. IF la contraseña actual es incorrecta, THEN THE API_Backend SHALL responder 401 y el formulario mostrará "Contraseña actual incorrecta"
6. WHEN la contraseña se actualiza exitosamente, THE Sistema_Frontend SHALL mostrar un toast de éxito, limpiar el formulario y registrar el evento en audit log
7. THE API_Backend SHALL aplicar rate limiting de 5 intentos por minuto en el endpoint de cambio de contraseña
8. THE API_Backend SHALL hashear la nueva contraseña con Argon2id antes de almacenarla

---

### Requirement 2: Crear y Buscar Persona

**User Story:** Como administrador o líder, quiero crear nuevos miembros y buscarlos con filtros avanzados, para gestionar el directorio de la comunidad de forma eficiente.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Nuevo Miembro" en la página /users, THE Sistema_Frontend SHALL abrir un modal/drawer con formulario: nombre, apellido, email, teléfono, fecha de nacimiento, campus, rol
2. WHEN el formulario se envía con datos válidos, THE Sistema_Frontend SHALL enviar POST a /api/v1/users y al recibir 201, cerrar el modal, mostrar toast de éxito y refrescar la tabla
3. IF el email ya existe (409), THEN THE Sistema_Frontend SHALL mostrar "Este email ya está registrado" junto al campo de email
4. WHEN el usuario escribe en el campo de búsqueda de la tabla de usuarios, THE Sistema_Frontend SHALL aplicar debounce de 300ms y buscar via GET /api/v1/search?q=&type=users
5. THE tabla de usuarios SHALL soportar filtros por: estado (activo/inactivo/suspendido), campus, rol, y ordenamiento por nombre o fecha de creación
6. WHEN el usuario hace clic en una fila de la tabla, THE Sistema_Frontend SHALL navegar al perfil detallado del usuario (/users/:id)
7. THE tabla SHALL usar paginación cursor-based con máximo 20 registros por página y botones "Anterior"/"Siguiente"
8. THE formulario de creación SHALL validar con Zod: email formato válido, nombre/apellido mínimo 2 chars, teléfono formato opcional

---

### Requirement 3: Actualizar Información de Personas (Perfil Modular)

**User Story:** Como administrador, quiero editar la información de un miembro de forma modular por secciones, para mantener perfiles completos y actualizados.

#### Acceptance Criteria

1. WHEN el usuario navega a /users/:id, THE Sistema_Frontend SHALL mostrar el perfil del usuario con tabs: General, Contacto, Ministerio, Grupos, Discipulado, Redes Sociales
2. WHEN el usuario edita un campo en cualquier tab y hace clic en "Guardar", THE Sistema_Frontend SHALL enviar PATCH a /api/v1/users/:id con solo los campos modificados (partial update)
3. WHILE la actualización se procesa, THE Sistema_Frontend SHALL mostrar loading skeleton en la sección editada
4. WHEN la actualización es exitosa, THE Sistema_Frontend SHALL mostrar toast de éxito y aplicar optimistic update en la UI
5. THE tab "General" SHALL mostrar: nombre, apellido, email, teléfono, fecha de nacimiento, avatar, bio
6. THE tab "Contacto" SHALL mostrar: dirección, ciudad, país, código postal
7. THE tab "Ministerio" SHALL mostrar: campus asignado, ministerios, roles en la organización
8. THE tab "Grupos" SHALL mostrar: lista de grupos donde es miembro con su rol contextual
9. THE tab "Discipulado" SHALL mostrar: relaciones de mentoría activas (como mentor y como discípulo)
10. THE tab "Redes Sociales" SHALL mostrar: Instagram, Facebook, Twitter/X, LinkedIn, WhatsApp
11. WHEN cualquier campo se actualiza, THE API_Backend SHALL registrar el cambio en audit_logs con oldValues y newValues

---

### Requirement 4: Crear Discipulado

**User Story:** Como líder o pastor, quiero crear relaciones de discipulado jerárquicas, para estructurar el crecimiento espiritual de los miembros.

#### Acceptance Criteria

1. WHEN el usuario accede a /discipleship y hace clic en "Nueva Relación", THE Sistema_Frontend SHALL abrir un formulario con: mentor (búsqueda), discípulo (búsqueda), tipo de relación (Mentor-Discípulo, Líder-Miembro, Accountability, Pastoral), grupo asociado (opcional), notas
2. WHEN el formulario se envía, THE Sistema_Frontend SHALL enviar POST a /api/v1/discipleship/relationships
3. IF se detecta un ciclo en la jerarquía (409), THEN THE Sistema_Frontend SHALL mostrar "No se puede crear esta relación: generaría un ciclo en la jerarquía"
4. THE página /discipleship SHALL mostrar un árbol visual de jerarquía (hierarchy view) con las relaciones del usuario actual
5. WHEN el usuario hace clic en un nodo del árbol, THE Sistema_Frontend SHALL mostrar un panel lateral con detalles de la relación: mentor, discípulo, tipo, fecha inicio, milestones, check-ins
6. THE árbol SHALL usar colores por tipo de relación y mostrar el conteo de discípulos por nodo

---

### Requirement 5: Crear Grupo

**User Story:** Como administrador o líder, quiero crear nuevos grupos (células, ministerios, equipos) desde la interfaz, para organizar la estructura de la iglesia.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Crear Grupo" en /groups, THE Sistema_Frontend SHALL abrir un modal con formulario: nombre, descripción, tipo (CELL, MINISTRY, TEAM, DEPARTMENT, CAMPUS, SPECIAL), campus, ministerio asociado, grupo padre (opcional para jerarquía)
2. WHEN el formulario se envía con datos válidos, THE Sistema_Frontend SHALL enviar POST a /api/v1/groups
3. WHEN la API responde 201, THE Sistema_Frontend SHALL cerrar el modal, mostrar toast de éxito, y agregar el nuevo grupo a la lista con animación
4. THE lista de grupos SHALL mostrar cards agrupadas por tipo con: nombre, tipo (badge color), cantidad de miembros, líder asignado
5. THE lista SHALL soportar filtros por: tipo de grupo, campus, ministerio, estado (activo/inactivo)
6. WHEN el usuario hace clic en una card de grupo, THE Sistema_Frontend SHALL navegar a /groups/:id con detalle del grupo y sus miembros
7. THE formulario SHALL validar: nombre mínimo 3 chars, tipo requerido

---

### Requirement 6: Agregar Persona a Discipulado

**User Story:** Como mentor, quiero agregar miembros a mis relaciones de discipulado con búsqueda dinámica, para gestionar mi red de discipulado.

#### Acceptance Criteria

1. WHEN el usuario está en el detalle de una relación de discipulado y hace clic en "Agregar Milestone", THE Sistema_Frontend SHALL mostrar un formulario con: título, descripción, orden
2. WHEN el usuario hace clic en "Registrar Check-in", THE Sistema_Frontend SHALL mostrar un formulario con: fecha, notas, rating (1-5), asistentes
3. THE detalle de relación SHALL mostrar: timeline de milestones (completados y pendientes), historial de check-ins con rating visual
4. WHEN un milestone se marca como completado, THE Sistema_Frontend SHALL enviar PATCH y actualizar la UI con animación de éxito
5. THE búsqueda de personas para asignar a discipulado SHALL usar command palette (Cmd+K style) con búsqueda async y multi-select

---

### Requirement 7: Agregar Persona a Grupo

**User Story:** Como líder de grupo, quiero agregar y remover miembros de mi grupo con roles contextuales, para gestionar la membresía del grupo.

#### Acceptance Criteria

1. WHEN el usuario está en /groups/:id y hace clic en "Agregar Miembro", THE Sistema_Frontend SHALL abrir un modal con búsqueda dinámica de usuarios (debounce 300ms)
2. WHEN el usuario selecciona una persona, THE Sistema_Frontend SHALL mostrar un selector de rol contextual: LEADER, CO_LEADER, MEMBER, GUEST
3. WHEN se confirma, THE Sistema_Frontend SHALL enviar POST a /api/v1/groups/:id/members con { userId, role }
4. THE tabla de miembros del grupo SHALL mostrar: nombre, rol (badge), fecha de ingreso, acciones (cambiar rol, remover)
5. WHEN el usuario hace clic en "Remover" en un miembro, THE Sistema_Frontend SHALL pedir confirmación y enviar DELETE a /api/v1/groups/:id/members/:userId
6. IF se intenta remover al último líder del grupo, THEN THE Sistema_Frontend SHALL mostrar "No se puede remover al último líder del grupo"
7. THE tabla SHALL soportar bulk actions: seleccionar múltiples miembros y cambiar rol o remover en lote

---

### Requirement 8: Enviar Credenciales y Activar Usuario (Onboarding)

**User Story:** Como administrador, quiero enviar invitaciones por email a nuevos usuarios para que activen su cuenta y definan su contraseña.

#### Acceptance Criteria

1. WHEN el administrador crea un nuevo usuario, THE Sistema_Frontend SHALL mostrar opción "Enviar invitación por email" con checkbox
2. WHEN la invitación se envía, THE API_Backend SHALL generar un token único con expiración de 72 horas y enviar email con link de activación
3. WHEN el usuario invitado accede al link de activación, THE Sistema_Frontend SHALL mostrar una página de onboarding con: bienvenida personalizada, formulario para definir contraseña, indicador de fortaleza
4. WHEN el usuario define su contraseña y envía el formulario, THE API_Backend SHALL activar la cuenta (status: ACTIVE), hashear la contraseña con Argon2id, invalidar el token de invitación
5. IF el token de invitación ha expirado, THEN THE Sistema_Frontend SHALL mostrar "Esta invitación ha expirado. Contacta a tu administrador."
6. THE página /users SHALL mostrar el estado de invitación de cada usuario: PENDING (invitación enviada), ACTIVE (cuenta activada)
7. WHEN el administrador hace clic en "Reenviar invitación" en un usuario PENDING, THE API_Backend SHALL generar un nuevo token y reenviar el email

---

### Requirement 9: Ingresar Reporte de Discipulado

**User Story:** Como mentor, quiero registrar reportes periódicos de mis relaciones de discipulado, para documentar el progreso y facilitar el seguimiento pastoral.

#### Acceptance Criteria

1. WHEN el mentor accede a /discipleship/:id/report, THE Sistema_Frontend SHALL mostrar un formulario con: fecha de reunión, asistencia (sí/no por discípulo), temas tratados, compromisos, próxima reunión, rating general (1-5)
2. WHEN el formulario se envía, THE Sistema_Frontend SHALL enviar POST a /api/v1/discipleship/:id/check-ins con los datos
3. THE página de detalle de discipulado SHALL mostrar un historial de reportes con: fecha, rating visual (estrellas), resumen de notas
4. WHEN el Admin_Pastor accede a /discipleship/reports, THE Sistema_Frontend SHALL mostrar métricas agregadas: total check-ins este mes, promedio de rating, relaciones sin check-in en 2+ semanas
5. THE Sistema_Frontend SHALL mostrar alertas visuales para relaciones que no tienen check-in en más de 14 días

---

### Requirement 10: Ingresar Reporte de Grupo (Informe Semanal de Célula)

**User Story:** Como líder de célula, quiero enviar un informe semanal sobre la reunión de mi célula, para que los pastores puedan dar seguimiento a la actividad de cada grupo.

#### Acceptance Criteria

1. WHEN el Líder_Célula accede a /reports, THE Sistema_Frontend SHALL mostrar: botón "Nuevo Informe", lista de informes previos, indicador de informes pendientes
2. WHEN el Líder_Célula hace clic en "Nuevo Informe", THE Sistema_Frontend SHALL mostrar formulario con: grupo (preseleccionado si solo tiene uno), fecha de reunión, cantidad de asistentes, cantidad de visitantes nuevos, peticiones de oración (textarea), notas/destacados (textarea), ofrenda (opcional, numérico)
3. WHEN el formulario se envía con datos válidos, THE Sistema_Frontend SHALL enviar POST a /api/v1/reports/weekly
4. WHEN la API responde 201, THE Sistema_Frontend SHALL mostrar toast de éxito y actualizar la lista
5. THE formulario SHALL validar: asistentes ≥ 0, visitantes ≥ 0, fecha no futura, grupo requerido
6. WHEN el Admin_Pastor accede a /reports, THE Sistema_Frontend SHALL mostrar tabla con TODOS los informes: grupo, líder, fecha, asistentes, visitantes, fecha de envío
7. THE Vista_Informes SHALL permitir filtrar por: rango de fechas, grupo, estado (entregado/pendiente)
8. WHEN el Admin_Pastor selecciona "Pendientes", THE Sistema_Frontend SHALL mostrar grupos cuyos líderes NO han enviado informe esta semana
9. THE Sistema_Frontend SHALL mostrar badge de notificación en el sidebar "Informes" cuando el líder tiene informes pendientes
10. THE API_Backend SHALL crear modelo WeeklyReport con: groupId, reporterId, meetingDate, attendanceCount, newVisitorsCount, prayerRequests, notes, offeringAmount, createdAt

---

### Requirement 11: Perfil del Usuario y Logout en Sidebar

**User Story:** Como usuario autenticado, quiero ver mi nombre y rol en el sidebar con acceso rápido a cerrar sesión.

#### Acceptance Criteria

1. WHEN el usuario está autenticado, THE Sistema_Frontend SHALL mostrar en la parte inferior del sidebar: avatar (iniciales si no hay foto), nombre completo, rol principal
2. WHEN el usuario hace clic en su nombre/avatar, THE Sistema_Frontend SHALL mostrar un dropdown con: "Mi Perfil", "Seguridad" (cambio de contraseña), "Cerrar Sesión"
3. WHEN el usuario hace clic en "Cerrar Sesión", THE Sistema_Frontend SHALL enviar POST a /api/v1/auth/logout, limpiar tokens del store y redirigir a /login
4. IF la petición de logout falla, THEN THE Sistema_Frontend SHALL limpiar tokens locales y redirigir igualmente
5. WHEN la app se carga, THE Sistema_Frontend SHALL obtener datos del usuario desde GET /api/v1/auth/me y almacenarlos en Zustand

---

### Requirement 12: Navegación Actualizada

**User Story:** Como usuario, quiero una navegación completa que incluya todos los módulos disponibles según mi rol.

#### Acceptance Criteria

1. THE sidebar SHALL incluir los enlaces: Dashboard, Usuarios, Grupos, Discipulado, Informes, Analytics, Auditoría
2. WHEN el usuario tiene rol LEADER, THE Sistema_Frontend SHALL mostrar badge en "Informes" con conteo de informes pendientes
3. WHEN el usuario tiene rol MEMBER o GUEST, THE Sistema_Frontend SHALL ocultar los enlaces de Auditoría y Analytics
4. THE sidebar SHALL resaltar el enlace activo con estilo visual diferenciado

---

## Technical Notes

- Todos los formularios usan React Hook Form + Zod para validación
- Todos los modales usan shadcn/ui Dialog component
- Todas las tablas usan TanStack Table con sorting y filtering
- Búsquedas usan debounce 300ms + React Query
- Optimistic updates donde sea posible
- Toast notifications con sonner
- Loading states con skeletons de shadcn/ui
- Mobile-first responsive design
- Dark mode support via Tailwind CSS
- Audit logging automático via AuditInterceptor del backend

## Backend Changes Required

- PATCH /api/v1/auth/password — cambio de contraseña
- POST /api/v1/reports/weekly — crear informe semanal
- GET /api/v1/reports/weekly — listar informes (filtros)
- GET /api/v1/reports/weekly/pending — informes pendientes
- POST /api/v1/invitations — enviar invitación
- GET /api/v1/invitations/activate/:token — activar cuenta
- Modelo Prisma: WeeklyReport

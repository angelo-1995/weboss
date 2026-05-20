# Requirements Document

## Introduction

El **Enterprise Community Operating System 2026 (ECOS)** es una plataforma modular orientada a iglesias, organizaciones de liderazgo y comunidades. La Fase 1.1 — Core Platform — establece la infraestructura base, los dominios de identidad/autenticación, gestión de usuarios, grupos, discipulado, permisos, reportes y auditoría. La arquitectura sigue principios DDD, es modular y event-driven, desplegada como monorepo con Turborepo.

---

## Glossary

- **ECOS**: Enterprise Community Operating System — el sistema completo.
- **Platform**: El conjunto de aplicaciones y paquetes del monorepo.
- **API**: La aplicación NestJS que expone los endpoints REST/GraphQL.
- **Web**: La aplicación Next.js 15 orientada a miembros y líderes.
- **Admin**: La aplicación Next.js 15 orientada a administradores del sistema.
- **Auth_Service**: Módulo responsable de autenticación JWT, refresh tokens y sesiones.
- **User_Service**: Módulo responsable del CRUD de usuarios y perfiles.
- **Group_Service**: Módulo responsable de grupos, membresías y roles contextuales.
- **Discipleship_Service**: Módulo responsable de estructuras jerárquicas y mentoría.
- **Permission_Service**: Módulo responsable de RBAC + ABAC.
- **Reporting_Service**: Módulo responsable de reportes grupales y analíticas.
- **Audit_Service**: Módulo responsable de logs de auditoría inmutables.
- **Search_Service**: Módulo responsable de búsqueda full-text.
- **Notification_Service**: Módulo responsable de notificaciones y eventos del sistema.
- **Campus**: Sede física o virtual de una organización.
- **Ministry**: Ministerio o área funcional dentro de una organización.
- **Role**: Conjunto de permisos asignado a un usuario en un contexto dado.
- **Permission**: Acción específica que puede realizarse sobre un recurso.
- **Soft_Delete**: Marcado lógico de eliminación mediante campo `deleted_at`.
- **UUID**: Identificador único universal usado como PK en todas las entidades.
- **JWT**: JSON Web Token usado para autenticación stateless.
- **Refresh_Token**: Token de larga duración para renovar access tokens.
- **RBAC**: Role-Based Access Control.
- **ABAC**: Attribute-Based Access Control.
- **BullMQ**: Cola de trabajos asíncronos sobre Redis.
- **FTS**: Full-Text Search — búsqueda de texto completo en PostgreSQL.
- **Cursor_Pagination**: Paginación basada en cursor para listas grandes.
- **Audit_Log**: Registro inmutable de acciones realizadas en el sistema.
- **Seed**: Datos iniciales de desarrollo cargados en la base de datos.
- **Health_Check**: Endpoint que verifica el estado operativo de un servicio.
- **Structured_Log**: Log en formato JSON con niveles debug/info/warn/error.

---

## Requirements

### Requirement 1: Monorepo Setup con Turborepo

**User Story:** Como desarrollador, quiero un monorepo configurado con Turborepo, para que pueda desarrollar, construir y desplegar todas las aplicaciones y paquetes de forma coordinada y eficiente.

#### Acceptance Criteria

1. THE Platform SHALL organizar el código en la estructura `apps/` (web, admin, api, mobile) y `packages/` (ui, auth, database, shared, types, config).
2. WHEN un desarrollador ejecuta el comando de build, THE Platform SHALL construir todas las aplicaciones y paquetes en el orden correcto de dependencias usando Turborepo.
3. WHEN un desarrollador ejecuta el comando de lint, THE Platform SHALL ejecutar ESLint en todos los workspaces usando la configuración compartida de `packages/config`.
4. WHEN un desarrollador ejecuta el comando de test, THE Platform SHALL ejecutar los tests de todos los workspaces en paralelo.
5. THE Platform SHALL compartir configuraciones de TypeScript, ESLint y Tailwind desde `packages/config` hacia todas las aplicaciones.
6. IF una dependencia entre paquetes forma un ciclo, THEN THE Platform SHALL reportar el error y detener el build.

---

### Requirement 2: Docker y Docker Compose

**User Story:** Como DevOps engineer, quiero un entorno Docker completo, para que pueda levantar toda la infraestructura localmente con un solo comando.

#### Acceptance Criteria

1. THE Platform SHALL proveer un `docker-compose.yml` que levante PostgreSQL, Redis, la API (NestJS) y la Web (Next.js) como servicios independientes.
2. WHEN un servicio depende de otro, THE Platform SHALL configurar `depends_on` con condición `service_healthy` para garantizar el orden de arranque.
3. THE Platform SHALL exponer PostgreSQL en el puerto 5432, Redis en 6379, la API en 3001 y la Web en 3000.
4. WHEN el contenedor de PostgreSQL arranca, THE Platform SHALL ejecutar las migraciones de Prisma automáticamente antes de aceptar conexiones de la API.
5. THE Platform SHALL montar volúmenes persistentes para los datos de PostgreSQL y Redis.
6. IF un contenedor falla al iniciar, THEN THE Platform SHALL registrar el error en los logs estructurados y detener el proceso de arranque.

---

### Requirement 3: Variables de Entorno

**User Story:** Como desarrollador, quiero archivos `.env.example` por aplicación, para que pueda configurar el entorno local sin exponer secretos en el repositorio.

#### Acceptance Criteria

1. THE Platform SHALL proveer un archivo `.env.example` en cada aplicación (`apps/web`, `apps/admin`, `apps/api`) con todas las variables requeridas documentadas.
2. THE Platform SHALL validar las variables de entorno al arrancar cada aplicación usando un schema Zod, y fallar con un mensaje descriptivo si alguna variable requerida falta.
3. IF una variable de entorno requerida no está definida al arrancar la API, THEN THE API SHALL lanzar un error descriptivo y detener el proceso.
4. THE Platform SHALL separar variables por entorno: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ARGON2_PEPPER`, `APP_PORT`, `NODE_ENV`.
5. WHERE el entorno es producción, THE Platform SHALL requerir que `NODE_ENV=production` esté definido y rechazar valores de desarrollo.

---

### Requirement 4: CI/CD Pipeline Base

**User Story:** Como desarrollador, quiero un pipeline de CI/CD en GitHub Actions, para que cada push valide automáticamente la calidad del código.

#### Acceptance Criteria

1. WHEN un desarrollador hace push a cualquier rama, THE Platform SHALL ejecutar lint, type-check y tests en GitHub Actions.
2. WHEN un pull request es creado hacia `main`, THE Platform SHALL ejecutar el pipeline completo incluyendo build de Docker.
3. THE Platform SHALL cachear las dependencias de Node.js y los artefactos de Turborepo entre ejecuciones del pipeline para reducir el tiempo de CI.
4. IF algún paso del pipeline falla, THEN THE Platform SHALL marcar el check como fallido y bloquear el merge del pull request.
5. THE Platform SHALL ejecutar los tests con cobertura mínima del 80% en los módulos de dominio críticos (auth, users, permissions).

---

### Requirement 5: Logs Estructurados

**User Story:** Como operador, quiero logs en formato JSON con niveles de severidad, para que pueda monitorear y depurar el sistema en producción.

#### Acceptance Criteria

1. THE API SHALL emitir todos los logs en formato JSON con los campos: `timestamp`, `level`, `message`, `context`, `traceId`, `userId` (cuando aplique).
2. THE API SHALL soportar los niveles de log: `debug`, `info`, `warn`, `error`.
3. WHEN una request HTTP es recibida, THE API SHALL registrar un log de nivel `info` con método, path, statusCode y duración en ms.
4. WHEN un error no manejado ocurre, THE API SHALL registrar un log de nivel `error` con el stack trace completo.
5. WHERE el entorno es producción, THE API SHALL omitir logs de nivel `debug`.
6. THE API SHALL incluir un `traceId` único por request para correlacionar logs de la misma operación.

---

### Requirement 6: Health Checks

**User Story:** Como operador, quiero endpoints de health check en todos los servicios, para que pueda verificar el estado operativo del sistema.

#### Acceptance Criteria

1. THE API SHALL exponer un endpoint `GET /health` que retorne el estado de todos los servicios dependientes (PostgreSQL, Redis, BullMQ).
2. WHEN todos los servicios dependientes están operativos, THE API SHALL retornar HTTP 200 con `{ status: "ok", services: { db: "ok", redis: "ok", queue: "ok" } }`.
3. IF algún servicio dependiente no está disponible, THEN THE API SHALL retornar HTTP 503 con el detalle del servicio fallido.
4. THE API SHALL exponer un endpoint `GET /health/live` que retorne HTTP 200 si el proceso está vivo, independientemente de las dependencias.
5. THE API SHALL exponer un endpoint `GET /health/ready` que retorne HTTP 200 solo cuando todos los servicios dependientes estén listos.
6. WHEN Docker Compose ejecuta el health check, THE Platform SHALL usar `GET /health/live` con intervalo de 30s y 3 reintentos.

---

### Requirement 7: Prisma Schema Inicial

**User Story:** Como desarrollador, quiero un schema de Prisma con las entidades base del sistema, para que pueda iniciar el desarrollo con una base de datos bien estructurada.

#### Acceptance Criteria

1. THE Database SHALL definir las entidades: `User`, `Role`, `Permission`, `RolePermission`, `UserRole`, `Session`, `AuditLog`, `Group`, `GroupMembership`, `DiscipleshipRelationship`, `Campus`, `Ministry`.
2. THE Database SHALL usar UUIDs como primary keys en todas las entidades.
3. THE Database SHALL incluir campos `created_at`, `updated_at` y `deleted_at` en todas las entidades principales para soft delete.
4. THE Database SHALL definir índices en todas las foreign keys y en campos de búsqueda frecuente (`email`, `username`, `name`).
5. WHEN se ejecuta `prisma migrate dev`, THE Database SHALL aplicar las migraciones sin errores en un entorno limpio.
6. THE Database SHALL definir relaciones con integridad referencial entre todas las entidades relacionadas.

---

### Requirement 8: Migrations y Seeds

**User Story:** Como desarrollador, quiero migraciones base y seeds de desarrollo, para que pueda iniciar con datos de prueba realistas.

#### Acceptance Criteria

1. THE Database SHALL proveer una migración inicial que cree todas las tablas del schema con sus índices y constraints.
2. WHEN se ejecuta el comando de seed, THE Database SHALL crear: 1 organización base, 3 roles (super_admin, admin, member), permisos base para cada módulo, y 1 usuario super_admin.
3. THE Database SHALL ejecutar seeds de forma idempotente — ejecutar el seed múltiples veces no debe crear duplicados.
4. IF una migración falla, THEN THE Database SHALL revertir los cambios y reportar el error con el SQL que falló.
5. THE Database SHALL proveer un comando para resetear la base de datos de desarrollo y re-ejecutar seeds.

---

### Requirement 9: Autenticación Base — JWT + Refresh Tokens

**User Story:** Como usuario, quiero autenticarme de forma segura con email y contraseña, para que pueda acceder al sistema con mis credenciales.

#### Acceptance Criteria

1. WHEN un usuario envía credenciales válidas a `POST /auth/login`, THE Auth_Service SHALL retornar un access token JWT (TTL 15 minutos) y un refresh token (TTL 7 días).
2. WHEN un usuario envía un refresh token válido a `POST /auth/refresh`, THE Auth_Service SHALL retornar un nuevo access token y rotar el refresh token (invalidar el anterior).
3. IF un usuario envía credenciales inválidas, THEN THE Auth_Service SHALL retornar HTTP 401 con mensaje genérico sin revelar si el email existe.
4. IF un refresh token ya fue usado (replay attack), THEN THE Auth_Service SHALL invalidar toda la familia de tokens del usuario y retornar HTTP 401.
5. WHEN un usuario hace `POST /auth/logout`, THE Auth_Service SHALL invalidar el refresh token activo en Redis.
6. THE Auth_Service SHALL hashear contraseñas usando Argon2id con parámetros de seguridad recomendados (memory: 65536, iterations: 3, parallelism: 4).
7. WHEN un access token expira, THE Auth_Service SHALL retornar HTTP 401 con código `TOKEN_EXPIRED` para que el cliente pueda renovarlo.
8. THE Auth_Service SHALL almacenar refresh tokens en Redis con TTL de 7 días y en la tabla `Session` para auditoría.

---

### Requirement 10: CRUD de Usuarios con Perfiles Avanzados

**User Story:** Como administrador, quiero gestionar usuarios con perfiles completos, para que pueda mantener un directorio actualizado de la comunidad.

#### Acceptance Criteria

1. WHEN un administrador envía datos válidos a `POST /users`, THE User_Service SHALL crear un usuario con perfil, asignar UUID, y emitir el evento `UserCreated`.
2. WHEN se crea un usuario, THE User_Service SHALL validar que el email sea único en el sistema (case-insensitive).
3. THE User_Service SHALL soportar los campos de perfil: `firstName`, `lastName`, `email`, `phone`, `birthDate`, `address`, `profilePhoto`, `bio`, `socialLinks`, `customFields`.
4. WHEN un administrador solicita `GET /users` con parámetros de paginación, THE User_Service SHALL retornar resultados usando cursor-based pagination con un máximo de 100 registros por página.
5. WHEN un administrador actualiza un usuario con `PATCH /users/:id`, THE User_Service SHALL aplicar solo los campos enviados (partial update) y registrar el cambio en AuditLog.
6. WHEN un administrador elimina un usuario con `DELETE /users/:id`, THE User_Service SHALL aplicar soft delete (setear `deleted_at`) sin eliminar el registro físicamente.
7. IF un usuario intenta acceder a datos de otro usuario sin permisos, THEN THE User_Service SHALL retornar HTTP 403.
8. THE User_Service SHALL soportar búsqueda por nombre, email y campos de perfil usando FTS de PostgreSQL.

---

### Requirement 11: Grupos — Creación, Membresías y Roles Contextuales

**User Story:** Como líder, quiero crear y gestionar grupos con roles específicos, para que pueda organizar a los miembros de la comunidad en estructuras funcionales.

#### Acceptance Criteria

1. WHEN un líder envía datos válidos a `POST /groups`, THE Group_Service SHALL crear un grupo con nombre, descripción, tipo, campus y ministerio asociado.
2. THE Group_Service SHALL soportar tipos de grupo: `cell`, `ministry`, `department`, `campus`, `special`.
3. WHEN un líder agrega un miembro a un grupo con `POST /groups/:id/members`, THE Group_Service SHALL crear la membresía y emitir el evento `MembershipAdded`.
4. THE Group_Service SHALL soportar roles contextuales dentro de un grupo: `leader`, `co_leader`, `member`, `guest`.
5. WHEN un miembro es removido de un grupo, THE Group_Service SHALL aplicar soft delete en la membresía y registrar en AuditLog.
6. THE Group_Service SHALL soportar grupos anidados (un grupo puede tener un grupo padre).
7. WHEN se solicita `GET /groups/:id/members`, THE Group_Service SHALL retornar la lista de miembros con sus roles contextuales usando cursor-based pagination.
8. IF un usuario intenta crear un grupo sin el permiso `groups:create`, THEN THE Group_Service SHALL retornar HTTP 403.

---

### Requirement 12: Discipulado — Estructuras Jerárquicas y Mentoría

**User Story:** Como pastor, quiero gestionar relaciones de discipulado y mentoría, para que pueda hacer seguimiento del crecimiento espiritual de los miembros.

#### Acceptance Criteria

1. WHEN un líder crea una relación de discipulado con `POST /discipleship/relationships`, THE Discipleship_Service SHALL registrar la relación mentor-discípulo con fecha de inicio y tipo de relación.
2. THE Discipleship_Service SHALL soportar tipos de relación: `mentoring`, `discipleship`, `coaching`, `accountability`.
3. WHEN se solicita `GET /discipleship/tree/:userId`, THE Discipleship_Service SHALL retornar el árbol jerárquico completo de discipulado del usuario (ascendentes y descendentes).
4. THE Discipleship_Service SHALL prevenir ciclos en la jerarquía de discipulado — un usuario no puede ser mentor de su propio mentor.
5. WHEN una relación de discipulado es finalizada, THE Discipleship_Service SHALL registrar la fecha de fin y el motivo, sin eliminar el historial.
6. THE Discipleship_Service SHALL soportar notas y seguimiento por relación con campos: `notes`, `nextMeetingDate`, `status`.

---

### Requirement 13: Permisos — RBAC + ABAC

**User Story:** Como administrador, quiero un sistema de permisos granular, para que pueda controlar exactamente qué puede hacer cada usuario en el sistema.

#### Acceptance Criteria

1. THE Permission_Service SHALL implementar RBAC: cada usuario tiene uno o más roles, cada rol tiene un conjunto de permisos.
2. THE Permission_Service SHALL implementar ABAC: los permisos pueden ser condicionados por atributos del recurso (ej: solo puede editar grupos de su propio campus).
3. WHEN se evalúa un permiso, THE Permission_Service SHALL verificar primero RBAC y luego ABAC, retornando `true` solo si ambas condiciones se cumplen.
4. THE Permission_Service SHALL cachear los permisos del usuario en Redis con TTL de 5 minutos para reducir consultas a la base de datos.
5. WHEN un rol es modificado, THE Permission_Service SHALL invalidar el caché de permisos de todos los usuarios con ese rol.
6. THE Permission_Service SHALL soportar permisos con formato `resource:action` (ej: `users:create`, `groups:delete`, `reports:view`).
7. IF un usuario no tiene el permiso requerido, THEN THE Permission_Service SHALL retornar HTTP 403 con el permiso faltante en el mensaje de error.
8. THE Permission_Service SHALL soportar herencia de permisos entre roles (un rol puede extender otro rol).

---

### Requirement 14: Reportes Grupales Básicos

**User Story:** Como líder, quiero ver reportes básicos de mi grupo, para que pueda tomar decisiones informadas sobre el crecimiento y la participación.

#### Acceptance Criteria

1. WHEN un líder solicita `GET /reports/groups/:id`, THE Reporting_Service SHALL retornar métricas del grupo: total de miembros, miembros activos, crecimiento mensual, asistencia promedio.
2. THE Reporting_Service SHALL soportar filtros por rango de fechas, campus y ministerio.
3. WHEN se genera un reporte, THE Reporting_Service SHALL emitir el evento `ReportSubmitted` con los metadatos del reporte.
4. THE Reporting_Service SHALL cachear reportes en Redis con TTL de 15 minutos para reducir carga en la base de datos.
5. WHEN el caché de un reporte expira o los datos subyacentes cambian, THE Reporting_Service SHALL regenerar el reporte de forma asíncrona usando BullMQ.
6. IF un usuario solicita un reporte de un grupo al que no pertenece o no tiene permisos, THEN THE Reporting_Service SHALL retornar HTTP 403.

---

### Requirement 15: Audit Logs Automáticos e Inmutables

**User Story:** Como administrador, quiero que todas las acciones críticas queden registradas automáticamente, para que pueda auditar el sistema y cumplir con requisitos de compliance.

#### Acceptance Criteria

1. THE Audit_Service SHALL registrar automáticamente en `AuditLog` toda operación de escritura (CREATE, UPDATE, DELETE) en las entidades: User, Group, GroupMembership, Role, Permission, DiscipleshipRelationship.
2. THE Audit_Log SHALL incluir los campos: `id`, `userId`, `action`, `entityType`, `entityId`, `oldValues`, `newValues`, `ipAddress`, `userAgent`, `timestamp`.
3. THE Audit_Service SHALL garantizar que los registros de AuditLog sean inmutables — no se permite UPDATE ni DELETE sobre la tabla `audit_logs`.
4. WHEN se solicita `GET /audit-logs` con filtros, THE Audit_Service SHALL retornar los logs usando cursor-based pagination.
5. THE Audit_Service SHALL registrar los logs de auditoría de forma asíncrona usando BullMQ para no impactar la latencia de las operaciones principales.
6. IF la cola de BullMQ falla, THEN THE Audit_Service SHALL escribir el log directamente en la base de datos de forma síncrona como fallback.

---

### Requirement 16: Búsqueda Full-Text con PostgreSQL FTS

**User Story:** Como usuario, quiero buscar usuarios y grupos por nombre o descripción, para que pueda encontrar rápidamente lo que necesito.

#### Acceptance Criteria

1. WHEN un usuario envía `GET /search?q=texto&type=users`, THE Search_Service SHALL retornar usuarios cuyo nombre, email o bio contengan el texto buscado usando PostgreSQL FTS.
2. WHEN un usuario envía `GET /search?q=texto&type=groups`, THE Search_Service SHALL retornar grupos cuyo nombre o descripción contengan el texto buscado.
3. THE Search_Service SHALL soportar búsqueda combinada `type=all` que retorne resultados de usuarios y grupos ordenados por relevancia.
4. THE Search_Service SHALL usar índices `tsvector` en PostgreSQL para optimizar las búsquedas.
5. WHEN la búsqueda no retorna resultados, THE Search_Service SHALL retornar un array vacío con HTTP 200, no HTTP 404.
6. THE Search_Service SHALL limitar los resultados a 50 por tipo en búsquedas combinadas para mantener el rendimiento.

---

### Requirement 17: Rate Limiting y Seguridad

**User Story:** Como administrador de seguridad, quiero protección contra abuso de la API, para que el sistema sea resistente a ataques de fuerza bruta y DDoS.

#### Acceptance Criteria

1. THE API SHALL aplicar rate limiting global de 1000 requests por minuto por IP.
2. THE API SHALL aplicar rate limiting específico en endpoints de autenticación: 10 intentos de login por minuto por IP.
3. WHEN el rate limit es excedido, THE API SHALL retornar HTTP 429 con el header `Retry-After` indicando cuándo puede reintentar.
4. THE API SHALL incluir headers de seguridad en todas las respuestas: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`.
5. THE API SHALL validar y sanitizar todos los inputs usando class-validator y class-transformer en NestJS.
6. IF una request contiene un payload mayor a 10MB, THEN THE API SHALL retornar HTTP 413 sin procesar el body.

---

### Requirement 18: Eventos del Sistema

**User Story:** Como arquitecto, quiero un sistema de eventos interno, para que los módulos puedan comunicarse de forma desacoplada.

#### Acceptance Criteria

1. THE Platform SHALL implementar los eventos: `UserCreated`, `InvitationSent`, `ReportSubmitted`, `MembershipAdded`, `AnalyticsUpdated`, `NotificationTriggered`.
2. WHEN un evento es emitido, THE Platform SHALL procesarlo de forma asíncrona usando BullMQ sin bloquear la respuesta HTTP.
3. THE Platform SHALL garantizar que cada evento sea procesado al menos una vez (at-least-once delivery) con reintentos automáticos en caso de fallo.
4. IF un evento falla después de 3 reintentos, THEN THE Platform SHALL mover el job a una dead-letter queue y registrar el error en los logs.
5. THE Platform SHALL proveer un endpoint `GET /admin/queues` para monitorear el estado de las colas de BullMQ (solo accesible con rol `super_admin`).

# Implementation Plan: Enterprise Community OS — Fase 1.1

## Overview

Este plan completa y mejora la implementación existente del monorepo ECOS para cumplir con los 18 requisitos de la especificación. Las tareas están organizadas en ondas (waves) con dependencias claras. El código base ya tiene la estructura de módulos, Prisma schema, auth básico, y servicios de dominio parciales. Las tareas se enfocan en cerrar las brechas: validación de entorno con Zod, logging estructurado con traceId, health checks completos, RBAC+ABAC con guard, cursor pagination, FTS con tsvector, BullMQ queues, audit interceptor, y refresh token family invalidation.

## Tasks

- [x] 1. Infraestructura base — Environment validation y Structured Logging
  - [x] 1.1 Implementar validación de variables de entorno con Zod
    - Crear `apps/api/src/config/env.schema.ts` con schema Zod que valide: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ARGON2_PEPPER`, `APP_PORT`, `NODE_ENV`
    - Crear `apps/api/src/config/env.config.ts` que parsee `process.env` con el schema y lance error descriptivo si falla
    - Integrar la validación en `app.module.ts` usando `ConfigModule.forRoot({ validate })` 
    - Agregar regla: WHERE `NODE_ENV=production`, rechazar valores de desarrollo para secrets
    - Actualizar `.env.example` con todas las variables documentadas
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.2 Implementar Structured Logging con traceId
    - Crear `apps/api/src/common/logger/structured-logger.service.ts` — custom NestJS Logger que emite JSON con campos: `timestamp`, `level`, `message`, `context`, `traceId`, `userId`
    - Crear `apps/api/src/common/middleware/trace-id.middleware.ts` — middleware que genera UUID `traceId` por request y lo almacena en `AsyncLocalStorage`
    - Crear `apps/api/src/common/logger/async-context.service.ts` — servicio que expone `getTraceId()` y `getUserId()` desde AsyncLocalStorage
    - Crear `apps/api/src/common/interceptors/http-logging.interceptor.ts` — interceptor que logea método, path, statusCode y duración en ms a nivel `info`
    - Configurar supresión de logs `debug` cuando `NODE_ENV=production`
    - Registrar el middleware y el interceptor globalmente en `app.module.ts`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 1.3 Write unit tests para env validation y logger
    - Test que schema Zod rechaza variables faltantes con mensaje descriptivo
    - Test que structured logger emite JSON con todos los campos requeridos
    - Test que traceId se propaga correctamente en AsyncLocalStorage
    - _Requirements: 3.2, 3.3, 5.1, 5.6_

- [x] 2. Health Checks completos
  - [x] 2.1 Expandir HealthController con endpoints /live, /ready y /health completo
    - Modificar `apps/api/src/health/health.controller.ts` para agregar `GET /health/live` (solo verifica que el proceso está vivo, retorna 200)
    - Agregar `GET /health/ready` que verifica PostgreSQL + Redis + BullMQ, retorna 200 o 503
    - Modificar `GET /health` para retornar estado detallado de todos los servicios: `{ status, services: { db, redis, queue } }`
    - Agregar verificación de Redis (ping) y BullMQ (queue connection check)
    - Retornar HTTP 503 con detalle del servicio fallido si alguno no responde
    - Actualizar `docker-compose.yml` para usar `/health/live` como healthcheck con intervalo 30s y 3 reintentos
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 2.2 Write unit tests para health checks
    - Test que /health/live retorna 200 siempre
    - Test que /health/ready retorna 503 cuando Redis está caído (mock)
    - Test que /health retorna estructura correcta con todos los servicios
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 3. Checkpoint — Validar infraestructura base
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. BullMQ Queue Infrastructure y Event System
  - [x] 4.1 Crear módulo de colas BullMQ
    - Crear `apps/api/src/infrastructure/queue/queue.module.ts` — configura BullModule con conexión Redis
    - Crear `apps/api/src/infrastructure/queue/queue.service.ts` — servicio genérico para agregar jobs a colas nombradas
    - Definir colas: `audit`, `notifications`, `reports`, `events`
    - Configurar reintentos: 3 attempts con backoff exponencial
    - Configurar dead-letter queue para jobs que fallan después de 3 reintentos
    - Registrar QueueModule en `app.module.ts`
    - _Requirements: 18.2, 18.3, 18.4_

  - [x] 4.2 Implementar Domain Event Bus con BullMQ
    - Crear `apps/api/src/common/events/domain-events.service.ts` — servicio que emite eventos tipados a BullMQ
    - Definir tipos de eventos: `UserCreated`, `InvitationSent`, `ReportSubmitted`, `MembershipAdded`, `AnalyticsUpdated`, `NotificationTriggered`
    - Crear `apps/api/src/common/events/event-types.ts` con interfaces para cada evento
    - Crear `apps/api/src/infrastructure/queue/processors/event.processor.ts` — consumer que procesa eventos de la cola `events`
    - Implementar at-least-once delivery con acknowledgment después de procesamiento exitoso
    - _Requirements: 18.1, 18.2, 18.3_

  - [x] 4.3 Implementar dead-letter queue y endpoint de monitoreo
    - Configurar dead-letter queue en cada cola para jobs que fallan 3 veces
    - Registrar error en logs estructurados cuando un job se mueve a DLQ
    - Crear `apps/api/src/domains/admin/queues.controller.ts` con `GET /admin/queues` que retorna estado de todas las colas (solo `SUPER_ADMIN`)
    - Proteger endpoint con guard de roles
    - _Requirements: 18.4, 18.5_

  - [ ]* 4.4 Write unit tests para queue infrastructure
    - Test que jobs se agregan correctamente a la cola
    - Test que reintentos se ejecutan con backoff exponencial
    - Test que jobs fallidos se mueven a DLQ después de 3 intentos
    - _Requirements: 18.3, 18.4_

- [x] 5. Audit Log — Interceptor automático y procesamiento asíncrono
  - [x] 5.1 Crear AuditInterceptor para captura automática de operaciones de escritura
    - Crear `apps/api/src/common/interceptors/audit.interceptor.ts` — NestJS interceptor que detecta operaciones POST/PATCH/PUT/DELETE
    - Capturar automáticamente: `userId`, `action`, `entityType`, `entityId`, `oldValues`, `newValues`, `ipAddress`, `userAgent`, `timestamp`
    - Crear decorator `@Auditable(entityType)` para marcar controllers que deben auditarse
    - El interceptor debe enviar el log a la cola BullMQ `audit` en lugar de escribir directamente a DB
    - _Requirements: 15.1, 15.2, 15.5_

  - [x] 5.2 Implementar AuditProcessor con fallback síncrono
    - Crear `apps/api/src/infrastructure/queue/processors/audit.processor.ts` — consumer de la cola `audit` que escribe en la tabla `audit_logs`
    - Implementar fallback: si la cola BullMQ falla, escribir directamente a DB de forma síncrona
    - Modificar `AuditService.log()` para usar la cola como canal primario
    - _Requirements: 15.5, 15.6_

  - [x] 5.3 Migrar AuditService a cursor-based pagination
    - Modificar `AuditService.findMany()` para usar cursor-based pagination en lugar de offset
    - Aceptar parámetros `cursor` (último ID visto) y `limit` (máx 100)
    - Retornar `{ data, nextCursor, hasMore }`
    - Garantizar inmutabilidad: no permitir UPDATE/DELETE en audit_logs (agregar constraint o policy en Prisma)
    - _Requirements: 15.3, 15.4_

  - [ ]* 5.4 Write unit tests para audit interceptor
    - Test que interceptor captura operaciones de escritura correctamente
    - Test que fallback síncrono funciona cuando la cola falla
    - Test que cursor pagination retorna resultados correctos
    - _Requirements: 15.1, 15.5, 15.6_

- [ ] 6. Checkpoint — Validar event system y audit
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Auth — Refresh Token Rotation con Family Invalidation
  - [x] 7.1 Implementar token family tracking y replay detection
    - Agregar campo `familyId` a la tabla `Session` en Prisma schema (migración)
    - Modificar `SessionService.create()` para asignar `familyId` (UUID) al crear la primera sesión de un login
    - Al rotar refresh token, el nuevo session hereda el `familyId` del anterior
    - Crear método `SessionService.revokeFamily(familyId)` que invalida TODAS las sesiones de una familia
    - _Requirements: 9.2, 9.4_

  - [x] 7.2 Implementar detección de replay attack
    - Modificar `AuthService.refresh()`: si el refresh token ya fue usado (session con `revokedAt` no null), invocar `revokeFamily(familyId)` para invalidar toda la familia
    - Retornar HTTP 401 con código `TOKEN_FAMILY_COMPROMISED`
    - Registrar evento de seguridad en audit log
    - _Requirements: 9.4_

  - [x] 7.3 Agregar almacenamiento de refresh tokens en Redis con TTL
    - Modificar `SessionService.create()` para almacenar el hash del refresh token en Redis con TTL de 7 días
    - Modificar `SessionService.findByRefreshToken()` para verificar primero en Redis antes de consultar DB
    - Al revocar, eliminar de Redis inmediatamente
    - _Requirements: 9.5, 9.8_

  - [x] 7.4 Agregar código TOKEN_EXPIRED en respuesta de access token expirado
    - Modificar `JwtAuthGuard` para capturar `TokenExpiredError` y retornar `{ statusCode: 401, code: 'TOKEN_EXPIRED', message: 'Access token expired' }`
    - Asegurar que el mensaje de credenciales inválidas sea genérico (no revela si email existe)
    - _Requirements: 9.3, 9.7_

  - [ ]* 7.5 Write unit tests para token family invalidation
    - Test que refresh token rotation genera nueva sesión con mismo familyId
    - Test que replay attack invalida toda la familia
    - Test que TOKEN_EXPIRED se retorna correctamente
    - _Requirements: 9.2, 9.4, 9.7_

- [x] 8. Permissions — RBAC + ABAC Guard completo
  - [x] 8.1 Crear PermissionsGuard con evaluación RBAC + ABAC
    - Crear `apps/api/src/domains/permissions/guards/permissions.guard.ts` — NestJS guard que evalúa permisos
    - Crear decorator `@RequirePermission(resource, action)` para anotar endpoints
    - El guard debe: verificar RBAC primero (rol tiene permiso), luego ABAC (atributos del recurso, ej: mismo campus)
    - Retornar HTTP 403 con el permiso faltante en el mensaje de error
    - _Requirements: 13.1, 13.2, 13.3, 13.7_

  - [x] 8.2 Implementar herencia de roles y caché con invalidación
    - Agregar soporte para herencia de roles en `PermissionsService`: un rol puede extender otro (ej: ADMIN extiende LEADER)
    - Modificar `PermissionsService.can()` para resolver la cadena de herencia
    - Implementar invalidación de caché cuando un rol es modificado: `invalidateRoleCache(role)` borra caché de todos los usuarios con ese rol
    - Configurar TTL de 5 minutos para caché de permisos
    - _Requirements: 13.4, 13.5, 13.6, 13.8_

  - [ ] 8.3 Integrar PermissionsGuard en controllers existentes
    - Agregar `@RequirePermission('users', 'create')` en `UsersController.create()`
    - Agregar `@RequirePermission('groups', 'create')` en `GroupsController.create()`
    - Agregar `@RequirePermission('reports', 'read')` en `ReportingController`
    - Agregar verificación ABAC: usuarios solo pueden editar grupos de su propio campus
    - Proteger todos los endpoints de escritura con permisos apropiados
    - _Requirements: 10.7, 11.8, 13.1, 13.2, 14.6_

  - [ ]* 8.4 Write unit tests para permissions guard
    - Test que SUPER_ADMIN bypasses todo
    - Test que RBAC deniega sin permiso correcto
    - Test que ABAC deniega acceso cross-campus
    - Test que herencia de roles funciona correctamente
    - Test que caché se invalida al modificar rol
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.8_

- [x] 9. Cursor-Based Pagination — Implementación transversal
  - [x] 9.1 Crear utilidad de cursor pagination reutilizable
    - Crear `apps/api/src/common/pagination/cursor-pagination.ts` con tipos: `CursorPaginationParams { cursor?: string; limit?: number }` y `CursorPaginatedResponse<T> { data: T[]; nextCursor: string | null; hasMore: boolean }`
    - Crear helper `buildCursorQuery(params)` que genera la cláusula Prisma `where: { id: { gt: cursor } }, take: limit + 1`
    - Crear DTO base `CursorPaginationDto` con validación (limit máx 100, default 20)
    - _Requirements: 10.4, 11.7, 15.4_

  - [ ] 9.2 Migrar UsersService a cursor pagination
    - Modificar `GET /users` para aceptar `cursor` y `limit` en query params
    - Reemplazar offset pagination por cursor-based usando el helper
    - Mantener máximo de 100 registros por página
    - _Requirements: 10.4_

  - [ ] 9.3 Migrar GroupsService y MembersService a cursor pagination
    - Modificar `GET /groups/:id/members` para usar cursor pagination
    - Modificar `GET /groups` para usar cursor pagination
    - _Requirements: 11.7_

  - [ ] 9.4 Migrar AuditService a cursor pagination (si no se hizo en 5.3)
    - Verificar que `GET /audit-logs` usa cursor pagination
    - _Requirements: 15.4_

  - [ ]* 9.5 Write unit tests para cursor pagination
    - Test que cursor pagination retorna resultados correctos con cursor válido
    - Test que limit se respeta (máx 100)
    - Test que hasMore es correcto en última página
    - _Requirements: 10.4, 11.7_

- [ ] 10. Checkpoint — Validar auth, permissions y pagination
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Full-Text Search con PostgreSQL tsvector
  - [x] 11.1 Crear migración para índices tsvector
    - Crear migración Prisma que agrega columnas `search_vector tsvector` a tablas `users` y `groups`
    - Crear trigger que actualiza `search_vector` automáticamente en INSERT/UPDATE
    - Para `users`: concatenar `first_name`, `last_name`, `email`, `bio` (de profile)
    - Para `groups`: concatenar `name`, `description`
    - Crear índice GIN en `search_vector` para ambas tablas
    - _Requirements: 16.4_

  - [x] 11.2 Reescribir SearchService para usar tsvector
    - Modificar `SearchService.searchUsers()` para usar `to_tsquery` con el `search_vector` en lugar de ILIKE
    - Modificar `SearchService.searchGroups()` para usar tsvector
    - Implementar ranking por relevancia usando `ts_rank()`
    - Soportar búsqueda combinada `type=all` con resultados ordenados por relevancia
    - Limitar resultados a 50 por tipo en búsquedas combinadas
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6_

  - [x] 11.3 Actualizar SearchController con endpoint unificado
    - Modificar `GET /search` para aceptar `q` (query), `type` (users|groups|all)
    - Retornar array vacío con HTTP 200 cuando no hay resultados (no 404)
    - Agregar validación: query mínimo 2 caracteres
    - _Requirements: 16.1, 16.2, 16.3, 16.5_

  - [ ]* 11.4 Write unit tests para FTS
    - Test que búsqueda por nombre parcial retorna resultados relevantes
    - Test que búsqueda combinada ordena por relevancia
    - Test que búsqueda vacía retorna array vacío con 200
    - _Requirements: 16.1, 16.3, 16.5_

- [x] 12. Rate Limiting y Security Headers
  - [x] 12.1 Configurar rate limiting granular
    - Modificar `ThrottlerModule` en `app.module.ts` para configurar: global 1000 req/min por IP
    - Crear `@Throttle()` override en auth endpoints: 10 intentos/min por IP para login
    - Configurar respuesta HTTP 429 con header `Retry-After`
    - Agregar payload size limit de 10MB con respuesta HTTP 413
    - _Requirements: 17.1, 17.2, 17.3, 17.6_

  - [x] 12.2 Agregar security headers globales
    - Crear `apps/api/src/common/middleware/security-headers.middleware.ts`
    - Agregar headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`
    - Registrar middleware globalmente
    - Configurar validación y sanitización de inputs con class-validator pipes globales
    - _Requirements: 17.4, 17.5_

  - [ ]* 12.3 Write unit tests para rate limiting
    - Test que rate limit global se aplica correctamente
    - Test que auth endpoints tienen límite más restrictivo
    - Test que HTTP 429 incluye header Retry-After
    - _Requirements: 17.1, 17.2, 17.3_

- [x] 13. Reporting Service — Mejoras con BullMQ y caché
  - [x] 13.1 Integrar ReportingService con BullMQ para regeneración asíncrona
    - Modificar `ReportingService` para emitir evento `ReportSubmitted` cuando se genera un reporte
    - Crear `apps/api/src/infrastructure/queue/processors/report.processor.ts` — consumer que regenera reportes cuando el caché expira
    - Implementar invalidación de caché cuando datos subyacentes cambian (escuchar eventos `MembershipAdded`, `UserCreated`)
    - Cambiar TTL de caché de reportes a 15 minutos (actualmente 5 min)
    - _Requirements: 14.3, 14.4, 14.5_

  - [x] 13.2 Agregar filtros avanzados al reporte de grupo
    - Modificar `GET /reports/groups/:id` para aceptar filtros: `startDate`, `endDate`, `campusId`, `ministryId`
    - Agregar métrica de crecimiento mensual (comparar miembros actuales vs mes anterior)
    - Agregar métrica de asistencia promedio (basada en check-ins completados)
    - Verificar permisos: solo miembros del grupo o usuarios con `reports:read` pueden acceder
    - _Requirements: 14.1, 14.2, 14.6_

  - [ ]* 13.3 Write unit tests para reporting
    - Test que filtros por fecha funcionan correctamente
    - Test que caché se invalida cuando datos cambian
    - Test que usuario sin permisos recibe 403
    - _Requirements: 14.1, 14.2, 14.6_

- [x] 14. Discipleship — Cycle Prevention y Tree completo
  - [x] 14.1 Implementar detección de ciclos en jerarquía de discipulado
    - Modificar `DiscipleshipService.create()` para verificar que no se crea un ciclo
    - Implementar BFS/DFS en la cadena de mentores: antes de crear relación mentor→discípulo, verificar que el discípulo no es mentor (directo o transitivo) del mentor
    - Retornar HTTP 409 con mensaje descriptivo si se detecta ciclo
    - _Requirements: 12.4_

  - [x] 14.2 Implementar endpoint de árbol jerárquico completo
    - Modificar `GET /discipleship/tree/:userId` para retornar árbol completo (ascendentes y descendentes)
    - Usar CTE recursivo en PostgreSQL para obtener toda la cadena
    - Incluir información de cada nodo: userId, nombre, tipo de relación, status
    - Limitar profundidad a 10 niveles para evitar queries costosos
    - _Requirements: 12.3_

  - [x] 14.3 Agregar soporte para finalización de relaciones con historial
    - Modificar `DiscipleshipService.update()` para soportar finalización: setear `endDate` y `status: COMPLETED`
    - Registrar motivo de finalización en campo `notes`
    - No eliminar el registro — mantener historial completo
    - Agregar campos `nextMeetingDate` y `status` al DTO de actualización
    - _Requirements: 12.5, 12.6_

  - [ ]* 14.4 Write property test para cycle prevention
    - **Property 1: Cycle Prevention Invariant**
    - *For any* discipleship tree, creating a new relationship SHALL never produce a cycle in the mentor hierarchy
    - **Validates: Requirements 12.4**

  - [ ]* 14.5 Write unit tests para discipleship tree
    - Test que árbol retorna ascendentes y descendentes correctamente
    - Test que finalización preserva historial
    - Test que self-discipleship es rechazado
    - _Requirements: 12.3, 12.4, 12.5_

- [ ] 15. Checkpoint — Validar search, reporting y discipleship
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Users — Completar CRUD con eventos y soft delete
  - [ ] 16.1 Completar UserService con emisión de eventos y validaciones
    - Verificar que `POST /users` emite evento `UserCreated` via BullMQ (no solo EventEmitter)
    - Verificar validación de email único case-insensitive
    - Verificar que `PATCH /users/:id` registra cambio en AuditLog automáticamente (via interceptor)
    - Verificar que `DELETE /users/:id` aplica soft delete (setear `deleted_at`)
    - Agregar campos faltantes al perfil si no existen: `socialLinks`, `customFields` (JSON)
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_

  - [ ] 16.2 Integrar búsqueda FTS en endpoint de usuarios
    - Agregar parámetro `search` a `GET /users` que usa el SearchService con tsvector
    - Combinar con cursor pagination
    - _Requirements: 10.8_

  - [ ]* 16.3 Write unit tests para users CRUD
    - Test que email duplicado case-insensitive retorna 409
    - Test que soft delete setea deleted_at sin eliminar registro
    - Test que evento UserCreated se emite correctamente
    - _Requirements: 10.1, 10.2, 10.6_

- [ ] 17. Groups — Completar con tipos y eventos
  - [ ] 17.1 Verificar y completar GroupService
    - Verificar que `POST /groups` soporta tipo `special` (agregar al enum si falta)
    - Verificar que `POST /groups/:id/members` emite evento `MembershipAdded` via BullMQ
    - Verificar que soft delete en membresía registra en AuditLog
    - Verificar soporte de grupos anidados (parentId ya existe en schema)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 17.2 Write unit tests para groups
    - Test que grupo se crea con todos los campos requeridos
    - Test que membresía emite evento MembershipAdded
    - Test que usuario sin permiso groups:create recibe 403
    - _Requirements: 11.1, 11.3, 11.8_

- [x] 18. Seeds — Completar con permisos base
  - [x] 18.1 Actualizar seed para incluir permisos granulares
    - Agregar seed de permisos base para cada módulo: `users:create`, `users:read`, `users:update`, `users:delete`, `groups:create`, etc.
    - Agregar seed de `RolePermission` mappings para los 3 roles base (super_admin, admin, member)
    - Verificar idempotencia: ejecutar seed múltiples veces no debe crear duplicados
    - Agregar comando `db:reset` en package.json que resetea DB y re-ejecuta seeds
    - _Requirements: 8.2, 8.3, 8.5_

- [x] 19. Notifications Module — Scaffold básico
  - [x] 19.1 Crear NotificationsModule con procesador BullMQ
    - Crear `apps/api/src/domains/notifications/notifications.module.ts`
    - Crear `apps/api/src/domains/notifications/notifications.service.ts` — escucha eventos y encola notificaciones
    - Crear `apps/api/src/infrastructure/queue/processors/notification.processor.ts` — consumer que procesa notificaciones (email placeholder)
    - Registrar listeners para eventos: `UserCreated` → welcome email, `InvitationSent` → invite email
    - _Requirements: 18.1, 18.2_

- [x] 20. Global Exception Filter y Validation Pipe
  - [x] 20.1 Crear filtro global de excepciones con logging estructurado
    - Crear `apps/api/src/common/filters/global-exception.filter.ts` — captura excepciones no manejadas
    - Logear a nivel `error` con stack trace completo usando el structured logger
    - Retornar respuesta consistente: `{ statusCode, message, code, traceId, timestamp }`
    - Crear `apps/api/src/common/pipes/zod-validation.pipe.ts` — pipe global que valida DTOs
    - Registrar filter y pipe globalmente en `main.ts`
    - _Requirements: 5.4, 17.5_

- [ ] 21. Final Checkpoint — Integration completa
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que todos los módulos están registrados en `app.module.ts`
  - Verificar que `docker-compose up` levanta todos los servicios correctamente
  - Verificar que el pipeline CI ejecuta lint, type-check y tests

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The existing codebase already has: Prisma schema, auth flow, basic services, Docker compose, CI workflow
- Key gaps addressed: Zod env validation, structured logging, BullMQ queues, cursor pagination, tsvector FTS, audit interceptor, token family invalidation, ABAC guard
- Property test (14.4) validates the cycle prevention invariant which is the most critical algorithmic correctness property in this system

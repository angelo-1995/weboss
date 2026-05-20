# ROADMAP — Enterprise Community Operating System 2026

## Fase 1 — Core Platform

Prioridad máxima. Sin esto no hay sistema.

### 1.1 Infraestructura Base
- [x] Monorepo setup (Turborepo)
- [x] Docker + Docker Compose
- [x] Variables de entorno (.env.example)
- [x] CI/CD pipeline base (GitHub Actions)
- [x] Logs estructurados (NestJS Logger)
- [x] Prisma schema base (users, groups, memberships, audit)
- [x] DatabaseService + CacheService (Redis)
- [x] Health check endpoint
- [x] Next.js 15 scaffold + Providers
- [x] packages/types, packages/ui, packages/database
- [x] Validación de env con Zod (schema + fail descriptivo)
- [x] Structured Logging con traceId (AsyncLocalStorage + JSON)
- [x] Health checks completos (/live, /ready, /health con servicios)
- [x] Global Exception Filter con stack trace en logs
- [x] Security headers middleware
- [x] Rate limiting granular (global + auth endpoints)

### 1.2 Base de Datos
- [x] Prisma schema inicial (users, roles, permissions, groups, memberships, audit, discipleship)
- [x] Migrations base
- [x] Seeds de desarrollo (organización, roles, super_admin)
- [x] Seeds de permisos granulares por módulo (resource:action)
- [x] Índices tsvector para FTS en users y groups
- [x] Comando db:reset idempotente

### 1.3 Auth (IAM)
- [x] Login con JWT + Refresh tokens (rotación)
- [x] Registro con Argon2id
- [x] Gestión de sesiones (create, revoke, revoke-all)
- [x] JwtStrategy + JwtRefreshStrategy (Passport)
- [x] JwtAuthGuard + RolesGuard
- [x] Decoradores: @Public, @Roles, @CurrentUser
- [x] AuthController: /login /register /refresh /logout /logout-all /me
- [x] Frontend: authService, useAuthStore (Zustand), useLogin/useRegister/useLogout hooks
- [x] LoginForm + página /login
- [x] Token family tracking (familyId en Session)
- [x] Replay attack detection (invalidar familia completa)
- [x] Refresh tokens en Redis con TTL 7d
- [x] Código TOKEN_EXPIRED en respuesta de access token expirado
- [ ] Invitaciones
- [ ] Activación de cuenta por email
- [ ] Recuperación de contraseña

### 1.4 Users
- [x] CRUD usuarios (create, findMany, findById, update, softDelete)
- [x] UsersRepository con select seguro (sin password)
- [x] Paginación + búsqueda + filtros (status, campusId, role)
- [x] Perfiles avanzados (bio, birthDate, address, redes sociales)
- [x] updateProfile con upsert
- [x] Protección: no auto-eliminación, roles requeridos
- [x] Frontend: usersService, useUsers/useMe/useUpdateUser hooks
- [x] UsersTable con TanStack Table + estados visuales
- [x] Página /users en dashboard
- [x] Emisión de evento UserCreated via BullMQ
- [x] Cursor-based pagination (reemplazar offset)
- [x] Integración FTS con tsvector en GET /users

### 1.5 Groups
- [x] CRUD grupos con jerarquías (parentId, getChildren, getAncestors)
- [x] Tipos: CELL, MINISTRY, CAMPUS, DEPARTMENT, TEAM
- [x] GroupsRepository con select optimizado + _count members
- [x] Validación: no eliminar grupo con sub-grupos activos
- [x] Auto-asignar creador como LEADER
- [x] MembersService: addMember, updateMemberRole, removeMember
- [x] Protección: no remover último líder del grupo
- [x] Roles contextuales: LEADER, CO_LEADER, MEMBER, GUEST
- [x] GET /groups/:id/hierarchy (grupo + ancestros + hijos)
- [x] GET /groups/:groupId/members/leaders
- [x] Eventos: group.created, group.member.added, group.member.removed
- [x] Frontend: groupsService, hooks (useGroups, useGroupMembers, useAddMember...)
- [x] GroupsList con cards por tipo + skeleton loading
- [x] Página /groups en dashboard
- [x] Tipo SPECIAL en enum
- [x] Emisión de evento MembershipAdded via BullMQ
- [x] Cursor-based pagination en members y groups list

### 1.6 Discipleship
- [x] Schema: DiscipleshipRelationship, DiscipleshipMilestone, DiscipleshipCheckIn
- [x] Enums: DiscipleshipStatus, RelationshipType
- [x] Relaciones inversas en User (mentorOf, discipleOf) y Group
- [x] DiscipleshipRepository: findMany, findById, tree recursivo (max depth 5)
- [x] DiscipleshipService: create con validaciones (no auto-discipulado, no duplicados activos)
- [x] Milestones: add, complete, delete
- [x] Check-ins: add, complete con rating 1-5
- [x] getStats(userId): asMentor, asDisciple, completedMilestones
- [x] getDiscipleTree: árbol recursivo de discípulos
- [x] Eventos: discipleship.relationship.created
- [x] Frontend: discipleshipService, hooks, DiscipleTree component
- [x] Página /discipleship en dashboard
- [x] Detección de ciclos (BFS/DFS antes de crear relación)
- [x] Árbol jerárquico completo con CTE recursivo (ascendentes + descendentes)
- [x] Finalización de relaciones con historial (endDate, motivo, status)

### 1.7 Memberships
- [x] CRUD membresías con ciclo de vida (ACTIVE, INACTIVE, SUSPENDED, PENDING)
- [x] Validación: no duplicar membresía activa en mismo grupo
- [x] getStats: conteo por status + growth por mes (raw SQL)
- [x] findActiveByUser para perfil de usuario
- [x] Evento: membership.created
- [x] GET /memberships/stats con cache Redis

### 1.8 Permissions
- [x] Schema: Permission, RolePermission, UserPermission (ABAC overrides)
- [x] PermissionsService: can() con orden SUPER_ADMIN → deny → grant → role default
- [x] ROLE_DEFAULTS map: permisos por rol sin DB (performance)
- [x] Cache Redis 5min por userId:resource:action
- [x] PermissionsGuard: @RequirePermission('users', 'read')
- [x] Invalidación de cache al cambiar permisos
- [x] GET /permissions/users/:id/effective
- [x] POST /permissions/grant (grant o deny)
- [x] ABAC completo: verificar atributos del recurso (ej: mismo campus)
- [x] Herencia de roles (un rol extiende otro)
- [x] Integrar PermissionsGuard en todos los controllers de escritura

### 1.9 Reporting
- [x] getOverview: KPIs globales (users, groups, memberships, discipleships) con cache
- [x] getGroupReport: métricas por grupo (miembros, roles, check-ins 30d)
- [x] getDiscipleshipReport: byStatus, byType, milestones, check-ins pendientes
- [x] getGrowthMetrics: series temporales por mes (raw SQL, 3 dimensiones)
- [x] Cache Redis 5 min en todos los reportes
- [x] Frontend: reportingService, hooks, OverviewCards, GrowthChart (Recharts)
- [x] Dashboard page con KPIs + gráfico de crecimiento
- [x] SideNav con navegación completa
- [x] DashboardLayout con sidebar
- [x] Integración con BullMQ para regeneración asíncrona de reportes
- [x] Filtros avanzados: startDate, endDate, campusId, ministryId
- [x] Evento ReportSubmitted
- [x] TTL de caché a 15 min
- [ ] Export (PDF/CSV)

### 1.10 Audit
- [x] AuditService.log() — fire-and-forget, nunca rompe el flujo
- [x] AuditController GET /audit con filtros
- [x] Integrado en Users (created, updated, deleted)
- [x] AuditInterceptor automático para todas las operaciones de escritura
- [x] Procesamiento asíncrono via BullMQ con fallback síncrono
- [x] Cursor-based pagination en GET /audit-logs
- [x] Inmutabilidad garantizada (no UPDATE/DELETE en audit_logs)

### 1.11 Search
- [x] SearchService: globalSearch + searchUsers + searchGroups + searchDiscipleship
- [x] PostgreSQL ILIKE — upgrade path a Meilisearch via abstracción
- [x] GET /search?q=&type=&limit= con throttle 30/min
- [x] Frontend: useSearch con debounce 300ms
- [x] CommandSearch: Cmd+K palette con navegación por tipo
- [x] Migrar a PostgreSQL tsvector con índices GIN
- [x] Ranking por relevancia con ts_rank()
- [x] Búsqueda combinada type=all con límite 50 por tipo

### 1.12 Event System (BullMQ)
- [x] QueueModule con colas: audit, notifications, reports, events
- [x] Domain Event Bus tipado (UserCreated, MembershipAdded, etc.)
- [x] Dead-letter queue con logging
- [x] Endpoint GET /admin/queues (solo SUPER_ADMIN)
- [x] At-least-once delivery con reintentos exponenciales

### 1.13 Notifications (Scaffold)
- [x] NotificationsModule con procesador BullMQ
- [x] Listeners: UserCreated → welcome email, InvitationSent → invite email
- [x] Email placeholder (Nodemailer/SES ready)

---

## Fase 2 — Analytics
- [x] AnalyticsService: getKPIs con % crecimiento MoM
- [x] getLeaderboard: top líderes por discípulos (groupBy)
- [x] getGroupAnalytics: byType + topByMembers
- [x] getRetention: ventanas 7/30/90 días
- [x] Cache Redis 10min en todos los endpoints
- [x] Frontend: analyticsService, hooks (useKPIs, useLeaderboard, useGroupAnalytics)
- [x] KPICards con indicadores de tendencia (↑↓ %)
- [x] Leaderboard con medallas 🥇🥈🥉
- [x] GroupsChart (BarChart Recharts con colores por tipo)
- [x] Página /analytics completa

---

## Fase 3 — Community

### 3.1 Notificaciones Avanzadas
- [ ] Push notifications
- [ ] Email notifications (templates)
- [ ] In-app notifications con badge

### 3.2 Eventos
- [ ] Creación y gestión de eventos
- [ ] RSVP y asistencia
- [ ] Calendario

### 3.3 Mensajería
- [ ] Chat básico por grupo
- [ ] Anuncios

---

## Fase 4 — IA

### 4.1 Insights
- [ ] Análisis automático de tendencias
- [ ] Predicciones de crecimiento
- [ ] Alertas inteligentes

### 4.2 Automatización
- [ ] Workflows automáticos
- [ ] WhatsApp integration
- [ ] Asistente IA contextual

---

## Estado Actual

**Fase activa**: 1 — Core Platform ✅ COMPLETADA (excepto: invitaciones, activación email, recuperación contraseña, export PDF/CSV)  
**Fase 2**: Analytics — COMPLETADA ✓  
**Próximo paso**: Fase 3 — Community (Notificaciones avanzadas, Eventos, Mensajería)

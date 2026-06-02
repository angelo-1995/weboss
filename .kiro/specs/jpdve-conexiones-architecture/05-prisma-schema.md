# 5. Esquema Prisma Preliminar — J-PDVE Conexiones

> **NOTA:** Este es un diseño preliminar. NO implementar todavía. Solo documenta la estructura propuesta.

---

## Decisiones de Diseño

| Decisión | Justificación |
|----------|---------------|
| UUID como PK | Evita colisiones en multi-tenant futuro, compatible con distributed systems |
| `churchId` en todas las entidades | Preparación multi-church desde día 1 (discriminator de tenant) |
| Soft delete con `deletedAt` | Recuperabilidad, auditoría, compliance |
| `@@map()` para snake_case en DB | Convención PostgreSQL, Prisma maneja la conversión |
| Enums como Prisma enums | Type safety en queries, validación a nivel DB |
| JSONB para datos flexibles | Structured notes, alert metadata, settings |
| Separate Person/User models | Regla de negocio: persona ≠ usuario del sistema |
| `ltree` via raw SQL | Prisma no soporta ltree nativamente, se maneja con raw queries para hierarchy |
| Timestamps con timezone | TIMESTAMPTZ para evitar ambigüedades con timezone de Panamá |

---

## Esquema Propuesto

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===========================
// ENUMS
// ===========================

enum UserRole {
  SUPER_ADMIN
  PASTOR_GENERAL
  PASTOR_RED
  COBERTURA
  MINISTRY_TEAM
  MEMBER

  @@map("user_role")
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_VERIFICATION

  @@map("user_status")
}

enum Gender {
  MALE
  FEMALE

  @@map("gender")
}

enum TeamStatus {
  ACTIVE
  INACTIVE
  MULTIPLIED

  @@map("team_status")
}

enum TeamMemberRole {
  LEADER
  CO_LEADER
  MEMBER

  @@map("team_member_role")
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY

  @@map("day_of_week")
}

enum ReportPeriodStatus {
  NORMAL
  LATE

  @@map("report_period_status")
}

enum MeetingType {
  PRESENCIAL
  VIRTUAL
  HIBRIDA

  @@map("meeting_type")
}

enum AlertType {
  MISSING_REPORT
  DECLINING_ATTENDANCE
  ZERO_VISITORS
  NO_FOLLOW_UP
  STAGNANT_GROWTH

  @@map("alert_type")
}

enum NotificationType {
  REPORT_PENDING
  REPORT_APPROVED
  REPORT_COMMENTED
  NEW_RESOURCE
  ALERT_GENERATED
  SYSTEM

  @@map("notification_type")
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE

  @@map("audit_action")
}

enum ResourceVisibility {
  ALL
  PASTOR_GENERAL
  PASTOR_RED
  COBERTURA
  MINISTRY_TEAM

  @@map("resource_visibility")
}

// ===========================
// CORE MODELS
// ===========================

model Church {
  id        String    @id @default(uuid())
  name      String    @db.VarChar(200)
  code      String    @unique @db.VarChar(20)
  timezone  String    @default("America/Panama") @db.VarChar(50)
  logoUrl   String?   @map("logo_url") @db.VarChar(500)
  isActive  Boolean   @default(true) @map("is_active")
  settings  Json      @default("{}")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  users              User[]
  persons            Person[]
  ministryTeams      MinistryTeam[]
  networks           Network[]
  pipelineStages     PipelineStageConfig[]
  resources          Resource[]
  resourceCategories ResourceCategory[]
  cellReports        CellReport[]
  alerts             OperationalAlert[]
  auditLogs          AuditLog[]

  @@map("churches")
}

model User {
  id           String     @id @default(uuid())
  churchId     String     @map("church_id")
  personId     String?    @unique @map("person_id")
  email        String     @unique @db.VarChar(255)
  passwordHash String     @map("password_hash") @db.VarChar(255)
  role         UserRole
  status       UserStatus @default(ACTIVE)
  lastLoginAt  DateTime?  @map("last_login_at")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  deletedAt    DateTime?  @map("deleted_at")

  // Relations
  church          Church            @relation(fields: [churchId], references: [id])
  person          Person?           @relation(fields: [personId], references: [id])
  teamMemberships TeamMember[]
  submittedReports CellReport[]     @relation("SubmittedBy")
  reportComments  ReportComment[]
  sessions        Session[]
  notifications   Notification[]
  uploadedResources Resource[]      @relation("UploadedBy")
  auditLogs       AuditLog[]
  networksPastored Network[]        @relation("NetworkPastor")
  alertsResponsible OperationalAlert[] @relation("AlertResponsible")
  personAssignments PersonTeamHistory[] @relation("AssignedBy")

  @@index([churchId, role])
  @@map("users")
}

model Person {
  id               String    @id @default(uuid())
  churchId         String    @map("church_id")
  firstName        String    @map("first_name") @db.VarChar(100)
  lastName         String    @map("last_name") @db.VarChar(100)
  email            String?   @db.VarChar(255)
  phone            String?   @db.VarChar(20)
  birthDate        DateTime? @map("birth_date") @db.Date
  gender           Gender?
  address          String?   @db.VarChar(500)
  avatarUrl        String?   @map("avatar_url") @db.VarChar(500)
  pipelineStageId  String?   @map("pipeline_stage_id")
  pipelineStageDate DateTime? @map("pipeline_stage_date") @db.Date
  currentTeamId    String?   @map("current_team_id")
  notes            String?   @db.Text
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")

  // Relations
  church        Church               @relation(fields: [churchId], references: [id])
  pipelineStage PipelineStageConfig? @relation(fields: [pipelineStageId], references: [id])
  currentTeam   MinistryTeam?        @relation("PersonCurrentTeam", fields: [currentTeamId], references: [id])
  user          User?
  teamHistory   PersonTeamHistory[]

  @@index([churchId])
  @@index([currentTeamId])
  @@index([pipelineStageId])
  @@index([churchId, firstName, lastName])
  @@map("persons")
}

model MinistryTeam {
  id              String     @id @default(uuid())
  churchId        String     @map("church_id")
  name            String     @db.VarChar(200)
  ministryCode    String     @map("ministry_code") @db.VarChar(50)
  // Note: ministry_code_path (ltree) managed via raw SQL migration
  parentTeamId    String?    @map("parent_team_id")
  networkId       String?    @map("network_id")
  meetingDay      DayOfWeek? @map("meeting_day")
  meetingTime     String?    @map("meeting_time") @db.VarChar(5) // "19:00" format
  latitude        Decimal?   @db.Decimal(10, 8)
  longitude       Decimal?   @db.Decimal(11, 8)
  address         String?    @db.VarChar(500)
  status          TeamStatus @default(ACTIVE)
  createdAt       DateTime   @default(now()) @map("created_at")
  updatedAt       DateTime   @updatedAt @map("updated_at")
  deletedAt       DateTime?  @map("deleted_at")

  // Relations
  church      Church         @relation(fields: [churchId], references: [id])
  parentTeam  MinistryTeam?  @relation("TeamHierarchy", fields: [parentTeamId], references: [id])
  childTeams  MinistryTeam[] @relation("TeamHierarchy")
  network     Network?       @relation(fields: [networkId], references: [id])
  members     TeamMember[]
  persons     Person[]       @relation("PersonCurrentTeam")
  cellReports CellReport[]
  reportDrafts CellReportDraft[]
  alerts      OperationalAlert[]
  personHistory PersonTeamHistory[]

  @@unique([churchId, ministryCode])
  @@index([parentTeamId])
  @@index([networkId])
  @@index([churchId, status])
  @@map("ministry_teams")
}

model TeamMember {
  id         String         @id @default(uuid())
  teamId     String         @map("team_id")
  userId     String         @map("user_id")
  roleInTeam TeamMemberRole @map("role_in_team")
  joinedAt   DateTime       @default(now()) @map("joined_at")
  leftAt     DateTime?      @map("left_at")

  // Relations
  team MinistryTeam @relation(fields: [teamId], references: [id])
  user User         @relation(fields: [userId], references: [id])

  @@unique([teamId, userId, leftAt])
  @@index([teamId])
  @@index([userId])
  @@map("team_members")
}

model Network {
  id           String    @id @default(uuid())
  churchId     String    @map("church_id")
  name         String    @db.VarChar(200)
  pastorUserId String?   @map("pastor_user_id")
  color        String?   @db.VarChar(7)
  status       TeamStatus @default(ACTIVE)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  // Relations
  church Church        @relation(fields: [churchId], references: [id])
  pastor User?         @relation("NetworkPastor", fields: [pastorUserId], references: [id])
  teams  MinistryTeam[]

  @@index([churchId])
  @@map("networks")
}

// ===========================
// PIPELINE & HISTORY
// ===========================

model PipelineStageConfig {
  id          String  @id @default(uuid())
  churchId    String  @map("church_id")
  name        String  @db.VarChar(100)
  code        String  @db.VarChar(50)
  orderIndex  Int     @map("order_index") @db.SmallInt
  color       String? @db.VarChar(7)
  description String? @db.VarChar(500)
  isActive    Boolean @default(true) @map("is_active")

  // Relations
  church  Church   @relation(fields: [churchId], references: [id])
  persons Person[]

  @@unique([churchId, code])
  @@index([churchId, orderIndex])
  @@map("pipeline_stage_configs")
}

model PersonTeamHistory {
  id         String    @id @default(uuid())
  personId   String    @map("person_id")
  teamId     String    @map("team_id")
  assignedAt DateTime  @map("assigned_at")
  removedAt  DateTime? @map("removed_at")
  reason     String?   @db.VarChar(200)
  assignedBy String?   @map("assigned_by")

  // Relations
  person     Person       @relation(fields: [personId], references: [id])
  team       MinistryTeam @relation(fields: [teamId], references: [id])
  assignedByUser User?    @relation("AssignedBy", fields: [assignedBy], references: [id])

  @@index([personId])
  @@index([teamId])
  @@map("person_team_history")
}

// ===========================
// REPORTING
// ===========================

model CellReport {
  id              String             @id @default(uuid())
  churchId        String             @map("church_id")
  teamId          String             @map("team_id")
  submittedBy     String             @map("submitted_by")
  reportDate      DateTime           @map("report_date") @db.Date
  weekStart       DateTime           @map("week_start") @db.Date
  periodStatus    ReportPeriodStatus @map("period_status")
  address         String?            @db.VarChar(500)
  startTime       String?            @map("start_time") @db.VarChar(5)
  endTime         String?            @map("end_time") @db.VarChar(5)
  menCount        Int                @default(0) @map("men_count") @db.SmallInt
  womenCount      Int                @default(0) @map("women_count") @db.SmallInt
  childrenCount   Int                @default(0) @map("children_count") @db.SmallInt
  visitorsCount   Int                @default(0) @map("visitors_count") @db.SmallInt
  consolidatedCount Int              @default(0) @map("consolidated_count") @db.SmallInt
  totalAttendance Int                @default(0) @map("total_attendance") @db.SmallInt
  offeringAmount  Decimal            @default(0) @map("offering_amount") @db.Decimal(10, 2)
  offeringCurrency String           @default("PAB") @map("offering_currency") @db.VarChar(3)
  topic           String?            @db.VarChar(300)
  notes           String?            @db.Text
  meetingType     MeetingType        @default(PRESENCIAL) @map("meeting_type")
  spiritualHealth Int?               @map("spiritual_health") @db.SmallInt
  isSupervised    Boolean            @default(false) @map("is_supervised")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")
  deletedAt       DateTime?          @map("deleted_at")

  // Relations
  church    Church          @relation(fields: [churchId], references: [id])
  team      MinistryTeam    @relation(fields: [teamId], references: [id])
  submitter User            @relation("SubmittedBy", fields: [submittedBy], references: [id])
  photos    ReportPhoto[]
  comments  ReportComment[]

  @@unique([teamId, weekStart, deletedAt])
  @@index([churchId, weekStart])
  @@index([reportDate])
  @@index([submittedBy])
  @@map("cell_reports")
}

model CellReportDraft {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  teamId      String   @map("team_id")
  formData    Json     @map("form_data")
  currentStep Int      @default(0) @map("current_step") @db.SmallInt
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  team MinistryTeam @relation(fields: [teamId], references: [id])

  @@unique([userId, teamId])
  @@map("cell_report_drafts")
}

model ReportPhoto {
  id        String   @id @default(uuid())
  reportId  String   @map("report_id")
  url       String   @db.VarChar(500)
  filename  String   @db.VarChar(255)
  sizeBytes Int      @map("size_bytes")
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  report CellReport @relation(fields: [reportId], references: [id])

  @@index([reportId])
  @@map("report_photos")
}

model ReportComment {
  id        String    @id @default(uuid())
  reportId  String    @map("report_id")
  authorId  String    @map("author_id")
  content   String    @db.Text
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  report CellReport @relation(fields: [reportId], references: [id])
  author User       @relation(fields: [authorId], references: [id])

  @@index([reportId])
  @@map("report_comments")
}

// ===========================
// RESOURCES
// ===========================

model ResourceCategory {
  id        String   @id @default(uuid())
  churchId  String   @map("church_id")
  name      String   @db.VarChar(100)
  slug      String   @db.VarChar(100)
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  church    Church     @relation(fields: [churchId], references: [id])
  resources Resource[]

  @@unique([churchId, slug])
  @@map("resource_categories")
}

model Resource {
  id            String             @id @default(uuid())
  churchId      String             @map("church_id")
  title         String             @db.VarChar(300)
  description   String?            @db.Text
  categoryId    String?            @map("category_id")
  fileUrl       String             @map("file_url") @db.VarChar(500)
  fileType      String             @map("file_type") @db.VarChar(50)
  fileSize      Int                @map("file_size")
  uploadedBy    String             @map("uploaded_by")
  visibility    ResourceVisibility @default(ALL)
  createdAt     DateTime           @default(now()) @map("created_at")
  updatedAt     DateTime           @updatedAt @map("updated_at")
  deletedAt     DateTime?          @map("deleted_at")

  // Relations
  church   Church            @relation(fields: [churchId], references: [id])
  category ResourceCategory? @relation(fields: [categoryId], references: [id])
  uploader User              @relation("UploadedBy", fields: [uploadedBy], references: [id])

  @@index([churchId, visibility])
  @@map("resources")
}

// ===========================
// NOTIFICATIONS & ALERTS
// ===========================

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  type      NotificationType
  title     String           @db.VarChar(200)
  body      String?          @db.VarChar(500)
  metadata  Json?
  readAt    DateTime?        @map("read_at")
  createdAt DateTime         @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id])

  @@index([userId, readAt])
  @@index([createdAt])
  @@map("notifications")
}

model OperationalAlert {
  id                String    @id @default(uuid())
  churchId          String    @map("church_id")
  type              AlertType
  targetTeamId      String?   @map("target_team_id")
  targetUserId      String?   @map("target_user_id")
  responsibleUserId String    @map("responsible_user_id")
  message           String    @db.VarChar(500)
  metadata          Json?
  acknowledged      Boolean   @default(false)
  acknowledgedAt    DateTime? @map("acknowledged_at")
  acknowledgedBy    String?   @map("acknowledged_by")
  createdAt         DateTime  @default(now()) @map("created_at")

  // Relations
  church      Church        @relation(fields: [churchId], references: [id])
  targetTeam  MinistryTeam? @relation(fields: [targetTeamId], references: [id])
  responsible User          @relation("AlertResponsible", fields: [responsibleUserId], references: [id])

  @@index([churchId, type, acknowledged])
  @@index([targetTeamId])
  @@index([responsibleUserId])
  @@index([createdAt])
  @@map("operational_alerts")
}

// ===========================
// AUTH & SESSIONS
// ===========================

model Session {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  refreshToken String   @unique @map("refresh_token")
  userAgent    String?  @map("user_agent") @db.VarChar(500)
  ipAddress    String?  @map("ip_address") @db.VarChar(45)
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

// ===========================
// AUDIT
// ===========================

model AuditLog {
  id          String      @id @default(uuid())
  churchId    String      @map("church_id")
  actorId     String      @map("actor_id")
  action      AuditAction
  entityType  String      @map("entity_type") @db.VarChar(100)
  entityId    String      @map("entity_id")
  beforeValue Json?       @map("before_value")
  afterValue  Json?       @map("after_value")
  ipAddress   String?     @map("ip_address") @db.VarChar(45)
  userAgent   String?     @map("user_agent") @db.VarChar(500)
  createdAt   DateTime    @default(now()) @map("created_at")

  // Relations
  actor User @relation(fields: [actorId], references: [id])

  // Note: Partition by month via raw SQL migration
  @@index([entityType, entityId])
  @@index([actorId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## Notas de Implementación Pendientes

1. **ltree extension**: Requiere migration manual `CREATE EXTENSION IF NOT EXISTS ltree;` y columna `ministry_code_path ltree` en ministry_teams. Prisma no soporta ltree nativamente, se gestiona con `$queryRaw`.

2. **Audit log partitioning**: Requiere migration manual para particionar por mes. La tabla Prisma es la "parent", las particiones se crean con SQL raw.

3. **Generated column**: `total_attendance` idealmente sería GENERATED ALWAYS AS, pero Prisma no lo soporta. Se calcula en el service layer antes del INSERT.

4. **Unique constraint con NULL**: `@@unique([teamId, weekStart, deletedAt])` en Prisma trata NULL como valor distinto, lo cual permite múltiples soft-deleted reports para el mismo team/week. Esto es el comportamiento deseado.

5. **Multi-tenant queries**: Todos los repositories DEBEN filtrar por `churchId`. Se implementará un middleware/interceptor que inyecta el `churchId` del usuario autenticado.

# Design Document: Networks, CellReport & Organigrama

## Architecture Overview

This feature spans three layers of the monorepo:

1. **Database** (`packages/database/prisma/schema.prisma`) — New `CellReport` and `Network` models, extended `User` and `Group` models, `COVERAGE` enum value, migration from `WeeklyReport`.
2. **Backend API** (`apps/api/src/domains/`) — New `networks` module, refactored `reporting` module (CellReport replaces WeeklyReport), new `organigrama` endpoint in users domain.
3. **Frontend** (`apps/web/src/`) — CellReport form at `/reports`, organigrama visualization at `/organigrama` using React Flow.

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 15)                                          │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ /reports     │  │ /organigrama     │  │ Sidebar Nav      │  │
│  │ CellReport   │  │ React Flow Graph │  │ + Organigrama    │  │
│  │ Form         │  │ + Legend + Tooltip│  │   link           │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────────────────┘  │
│         │                    │                                   │
└─────────┼────────────────────┼───────────────────────────────────┘
          │ POST/GET           │ GET /organigrama
          │ /reports/cell      │ GET /networks
          ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (NestJS)                                           │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ReportingModule   │  │ UsersModule  │  │ NetworksModule   │  │
│  │ CellReportCtrl    │  │ +organigrama │  │ GET /networks    │  │
│  │ CellReportService │  │  endpoint    │  │ (tree response)  │  │
│  └──────┬────────────┘  └──────┬───────┘  └──────┬───────────┘  │
│         │                      │                  │              │
└─────────┼──────────────────────┼──────────────────┼──────────────┘
          │                      │                  │
          ▼                      ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  Database (PostgreSQL + Prisma)                                  │
│  ┌────────────┐ ┌────────┐ ┌─────────┐ ┌───────────────────┐   │
│  │ CellReport │ │ Network│ │ User    │ │ DiscipleshipRel   │   │
│  │ (replaces  │ │ (tree) │ │+spouse  │ │ +COVERAGE type    │   │
│  │ WeeklyRpt) │ │        │ │+leader  │ │                   │   │
│  └────────────┘ └────────┘ │+network │ └───────────────────┘   │
│                             └─────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### CellReport (replaces WeeklyReport)

```prisma
model CellReport {
  id                String   @id @default(uuid())
  groupId           String   @map("group_id")
  reporterId        String   @map("reporter_id")

  // Información General
  cellCode          String   @map("cell_code")
  meetingDate       DateTime @map("meeting_date")
  coverageName      String   @map("coverage_name")       // nombre del líder de cobertura
  leaderName        String   @map("leader_name")
  coLeaderName      String?  @map("co_leader_name")
  contactPhone      String?  @map("contact_phone")

  // Asistencia desglosada
  menCount          Int      @default(0) @map("men_count")
  womenCount        Int      @default(0) @map("women_count")
  youthMaleCount    Int      @default(0) @map("youth_male_count")
  youthFemaleCount  Int      @default(0) @map("youth_female_count")
  childrenCount     Int      @default(0) @map("children_count")
  totalAttendance   Int      @map("total_attendance")     // computed: sum of above

  // Métricas de crecimiento
  visitorsCount     Int      @default(0) @map("visitors_count")
  convertsCount     Int      @default(0) @map("converts_count")
  reconciledCount   Int      @default(0) @map("reconciled_count")

  // Reunión
  messageTopic      String?  @map("message_topic")
  startTime         DateTime @map("start_time")
  endTime           DateTime @map("end_time")
  offeringAmount    Decimal? @map("offering_amount") @db.Decimal(10, 2)

  // Ubicación
  district          String?                               // corregimiento
  neighborhood      String?                               // barriada
  sector            String?
  street            String?                               // calle
  houseNumber       String?  @map("house_number")         // casa

  // Supervisión
  wasSupervised     Boolean  @default(false) @map("was_supervised")
  observations      String?

  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  group    Group @relation(fields: [groupId], references: [id])
  reporter User  @relation("CellReportReporter", fields: [reporterId], references: [id])

  @@unique([groupId, meetingDate])
  @@index([groupId])
  @@index([reporterId])
  @@index([meetingDate])
  @@index([groupId, meetingDate])
  @@map("cell_reports")
}
```

**Week uniqueness strategy:** The `@@unique([groupId, meetingDate])` constraint combined with application-level week boundary validation ensures one report per group per calendar week. The service calculates the Monday-Sunday boundaries for the given `meetingDate` and checks for existing reports in that range before insert.

### Network (Hierarchical, seed-only)

```prisma
model Network {
  id              String    @id @default(uuid())
  code            String    @unique
  name            String
  parentNetworkId String?   @map("parent_network_id")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  parent   Network?  @relation("NetworkHierarchy", fields: [parentNetworkId], references: [id])
  children Network[] @relation("NetworkHierarchy")
  users    User[]
  groups   Group[]

  @@index([parentNetworkId])
  @@index([code])
  @@map("networks")
}
```

### User Extensions

```prisma
model User {
  // ... existing fields ...

  spouseId    String?  @map("spouse_id")
  leaderId    String?  @map("leader_id")
  networkId   String?  @map("network_id")

  // New relations
  spouse      User?    @relation("SpouseRelation", fields: [spouseId], references: [id])
  spouseOf    User?    @relation("SpouseRelation")
  leader      User?    @relation("LeaderRelation", fields: [leaderId], references: [id])
  subordinates User[] @relation("LeaderRelation")
  network     Network? @relation(fields: [networkId], references: [id])

  // Replace weeklyReports relation
  cellReports CellReport[] @relation("CellReportReporter")
}
```

### Group Extension

```prisma
model Group {
  // ... existing fields ...

  networkId   String?  @map("network_id")

  // New relation
  network     Network? @relation(fields: [networkId], references: [id])
  cellReports CellReport[]
}
```

### RelationshipType Enum Extension

```prisma
enum RelationshipType {
  MENTOR_MENTEE
  LEADER_MEMBER
  ACCOUNTABILITY
  PASTORAL
  COVERAGE          // NEW: cobertura pastoral entre líderes

  @@map("relationship_type")
}
```

---

## Components & Interfaces

### Backend: CellReport Module

#### Controller: `CellReportController`

```typescript
// apps/api/src/domains/reporting/cell-report.controller.ts
@Controller('reports/cell')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CellReportController {
  @Post()
  @Roles('LEADER', 'CO_LEADER', 'ADMIN', 'SUPER_ADMIN')
  create(@Body() dto: CreateCellReportDto, @CurrentUser() user: CurrentUserData): Promise<CellReportResponse>;

  @Get()
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  findAll(@Query() query: CellReportQueryDto, @CurrentUser() user: CurrentUserData): Promise<PaginatedResponse<CellReportResponse>>;

  @Get('pending')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  findPending(@CurrentUser() user: CurrentUserData): Promise<PendingGroupResponse[]>;
}
```

#### Service: `CellReportService`

```typescript
// apps/api/src/domains/reporting/cell-report.service.ts
@Injectable()
export class CellReportService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateCellReportDto, reporterId: string): Promise<CellReport> {
    // 1. Validate meetingDate is not future
    // 2. Validate reporter is LEADER or CO_LEADER in the group
    // 3. Calculate week boundaries (Monday 00:00 - Sunday 23:59:59)
    // 4. Check no existing report for same group in same week
    // 5. Compute totalAttendance = men + women + youthMale + youthFemale + children
    // 6. Create and return with relations
  }

  async findAll(query: CellReportQueryDto, userId: string, roles: string[]): Promise<PaginatedResult> {
    // Admin/SuperAdmin: all reports
    // Leader: only reports from groups where user is LEADER/CO_LEADER
    // Apply filters: groupId, networkId, startDate, endDate
  }

  async findPending(userId: string, roles: string[]): Promise<PendingGroup[]> {
    // Get current week boundaries
    // Get relevant groups (all for admin, own for leader)
    // Return groups without a CellReport in current week
  }
}
```

#### DTOs

```typescript
// apps/api/src/domains/reporting/dto/cell-report.dto.ts
export class CreateCellReportDto {
  @IsString() groupId: string;
  @IsString() cellCode: string;
  @IsDateString() meetingDate: string;
  @IsString() coverageName: string;
  @IsString() leaderName: string;
  @IsOptional() @IsString() coLeaderName?: string;
  @IsOptional() @IsString() contactPhone?: string;

  @IsInt() @Min(0) menCount: number;
  @IsInt() @Min(0) womenCount: number;
  @IsInt() @Min(0) youthMaleCount: number;
  @IsInt() @Min(0) youthFemaleCount: number;
  @IsInt() @Min(0) childrenCount: number;

  @IsInt() @Min(0) visitorsCount: number;
  @IsInt() @Min(0) convertsCount: number;
  @IsInt() @Min(0) reconciledCount: number;

  @IsOptional() @IsString() messageTopic?: string;
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
  @IsOptional() @IsNumber() @Min(0) offeringAmount?: number;

  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @IsString() sector?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() houseNumber?: string;

  @IsOptional() @IsBoolean() wasSupervised?: boolean;
  @IsOptional() @IsString() observations?: string;
}

export class CellReportQueryDto {
  @IsOptional() @IsString() groupId?: string;
  @IsOptional() @IsString() networkId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsOptional() @IsInt() @Min(1) pageSize?: number;
}
```

### Backend: Networks Module

```typescript
// apps/api/src/domains/networks/networks.controller.ts
@Controller('networks')
@UseGuards(JwtAuthGuard)
export class NetworksController {
  @Get()
  findAll(): Promise<NetworkTreeResponse[]>;
}

// apps/api/src/domains/networks/networks.service.ts
@Injectable()
export class NetworksService {
  constructor(private readonly db: DatabaseService) {}

  async findAllTree(): Promise<NetworkTree[]> {
    // Fetch all networks, build tree in memory
    // Return hierarchical structure
  }
}
```

#### Network Tree Response

```typescript
interface NetworkTreeNode {
  id: string;
  code: string;
  name: string;
  children: NetworkTreeNode[];
}
```

### Backend: Organigrama Endpoint

```typescript
// Added to apps/api/src/domains/users/users.controller.ts
@Get('organigrama')
@Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
getOrganigrama(): Promise<OrganigramaResponse>;

// Response interfaces
interface OrganigramaNode {
  id: string;
  fullName: string;
  role: string;        // UserRole
  networkId: string | null;
  networkName: string | null;
  phone: string | null;
}

interface OrganigramaEdge {
  id: string;          // DiscipleshipRelationship.id
  source: string;      // mentorId (líder de cobertura)
  target: string;      // discipleId (líder cubierto)
}

interface OrganigramaResponse {
  nodes: OrganigramaNode[];
  edges: OrganigramaEdge[];
}
```

### Backend: User Update Extension

```typescript
// Extended in apps/api/src/domains/users/dto/update-user.dto.ts
export class UpdateUserDto {
  // ... existing fields ...
  @IsOptional() @IsUUID() spouseId?: string | null;
  @IsOptional() @IsUUID() leaderId?: string | null;
  @IsOptional() @IsUUID() networkId?: string | null;
}
```

Validation in `UsersService.update()`:
- If `spouseId` provided and not null → verify user exists, else 400
- If `leaderId` provided and not null → verify user exists, else 400
- If `networkId` provided and not null → verify network exists, else 400

### Backend: Group Update Extension

```typescript
// Extended in apps/api/src/domains/groups/dto/update-group.dto.ts
export class UpdateGroupDto {
  // ... existing fields ...
  @IsOptional() @IsUUID() networkId?: string | null;
}
```

Validation in `GroupsService.update()`:
- If `networkId` provided and not null → verify network exists, else 400

---

## Frontend Components

### Organigrama Page (`/organigrama`)

```typescript
// apps/web/src/app/(dashboard)/organigrama/page.tsx
// Feature: apps/web/src/features/organigrama/

// Component tree:
// OrganigramaPage
//   ├── OrganigramaGraph (React Flow wrapper)
//   │     ├── CustomNode (user card with name + role + color)
//   │     └── CustomEdge (directed arrow)
//   ├── OrganigramaLegend (network color legend)
//   └── OrganigramaTooltip (hover info: phone, network, subordinate count)
```

#### React Flow Configuration

```typescript
// apps/web/src/features/organigrama/components/OrganigramaGraph.tsx
import ReactFlow, { Node, Edge, useNodesState, useEdgesState } from 'reactflow';
import dagre from 'dagre';

// Layout: top-to-bottom hierarchical using dagre
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
dagreGraph.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });

// Color mapping: network_id → hex color
const NETWORK_COLORS: Record<string, string> = {
  // Populated from GET /networks response
};
```

#### Data Transformation (API → React Flow)

```typescript
// apps/web/src/features/organigrama/utils/transform-organigrama.ts
export function transformToReactFlow(data: OrganigramaResponse, networks: NetworkTree[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const colorMap = buildNetworkColorMap(networks);

  const nodes: Node[] = data.nodes.map(n => ({
    id: n.id,
    type: 'orgNode',
    data: { ...n, color: colorMap[n.networkId ?? ''] ?? '#gray' },
    position: { x: 0, y: 0 }, // dagre will compute
  }));

  const edges: Edge[] = data.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: false,
  }));

  return applyDagreLayout(nodes, edges);
}
```

#### Expand/Collapse Logic

```typescript
// apps/web/src/features/organigrama/hooks/useOrganigramaState.ts
export function useOrganigramaState(initialNodes: Node[], initialEdges: Edge[]) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  };

  // Filter visible nodes/edges based on collapsed state
  const visibleNodes = useMemo(() => filterVisibleNodes(initialNodes, initialEdges, collapsedNodes), [initialNodes, initialEdges, collapsedNodes]);
  const visibleEdges = useMemo(() => filterVisibleEdges(initialEdges, visibleNodes), [initialEdges, visibleNodes]);

  return { visibleNodes, visibleEdges, toggleNode, collapsedNodes };
}
```

### CellReport Form (`/reports`)

```typescript
// apps/web/src/features/reporting/components/CellReportForm.tsx
// Sections:
// 1. Información General: cellCode, meetingDate, coverageName, leaderName, coLeaderName, contactPhone
// 2. Asistencia: menCount, womenCount, youthMaleCount, youthFemaleCount, childrenCount (auto-sum displayed)
// 3. Métricas de Crecimiento: visitorsCount, convertsCount, reconciledCount
// 4. Reunión: messageTopic, startTime, endTime, offeringAmount
// 5. Ubicación: district, neighborhood, sector, street, houseNumber
// 6. Observaciones: wasSupervised (checkbox), observations (textarea)

// Validation schema (Zod)
// apps/web/src/features/reporting/schemas/cell-report.schema.ts
```

#### API Service

```typescript
// apps/web/src/features/reporting/services/cell-report.service.ts
export const cellReportService = {
  create: (data: CreateCellReportPayload) => api.post('/reports/cell', data),
  findAll: (params: CellReportQueryParams) => api.get('/reports/cell', { params }),
  findPending: () => api.get('/reports/cell/pending'),
};
```

---

## Migration Strategy

### WeeklyReport → CellReport Migration

1. **Create migration** that:
   - Creates `cell_reports` table with all new fields
   - Migrates existing `weekly_reports` data into `cell_reports` (mapping `attendanceCount` → `totalAttendance`, other fields as defaults/nulls)
   - Drops `weekly_reports` table
2. **Update Prisma schema**: Remove `WeeklyReport` model, add `CellReport` model
3. **Update code references**: Replace `WeeklyReportService`/`WeeklyReportController` with `CellReportService`/`CellReportController`
4. **Update frontend**: Replace existing report form with new CellReport form

### Database Migration Order

1. Add `Network` model + seed data
2. Add `COVERAGE` to `RelationshipType` enum
3. Add `spouse_id`, `leader_id`, `network_id` to `users` table
4. Add `network_id` to `groups` table
5. Create `cell_reports` table, migrate data from `weekly_reports`, drop `weekly_reports`

---

## Network Seed Data

```typescript
// packages/database/src/seed/networks.seed.ts
const NETWORKS = [
  { code: 'CAB', name: 'Red de Caballeros' },
  { code: 'DAM', name: 'Red de Damas' },
  { code: 'JOV', name: 'Red de Jóvenes' },
  { code: 'JOC', name: 'Red de Jovencitas' },
  { code: 'MAT', name: 'Red de Matrimonios' },
  { code: 'NIN', name: 'Red de Niños' },
];
// Flat structure initially; hierarchy can be extended via parentNetworkId
```

---

## Error Handling

| Scenario | HTTP Code | Message |
|----------|-----------|---------|
| User not LEADER/CO_LEADER in group | 403 | "Solo el líder o co-líder de la célula puede enviar el reporte" |
| Duplicate report in same week | 409 | "Ya existe un reporte para esta célula en la semana indicada" |
| Future meeting date | 400 | "La fecha de reunión no puede ser futura" |
| Invalid spouse_id reference | 400 | "El usuario cónyuge especificado no existe" |
| Invalid leader_id reference | 400 | "El usuario líder de cobertura especificado no existe" |
| Invalid network_id reference | 400 | "La red especificada no existe" |
| Unauthorized organigrama access | 403 | "No tiene permisos para acceder al organigrama" |

---

## Week Boundary Calculation

```typescript
// Utility: get Monday-Sunday boundaries for a given date
export function getWeekBoundaries(date: Date): { monday: Date; sunday: Date } {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: CellReport Data Round-Trip

*For any* valid CellReport payload with all required fields populated, creating the report and then retrieving it by ID should return an object where every field matches the original input values.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Total Attendance Computation Invariant

*For any* CellReport, the `totalAttendance` field must always equal the sum of `menCount + womenCount + youthMaleCount + youthFemaleCount + childrenCount`.

**Validates: Requirements 1.4**

### Property 3: Authorization — Only LEADER/CO_LEADER Can Create Reports

*For any* user and any group, if the user does not have role LEADER or CO_LEADER in that group, attempting to create a CellReport for that group should be rejected with HTTP 403 and the message "Solo el líder o co-líder de la célula puede enviar el reporte".

**Validates: Requirements 2.1, 2.2**

### Property 4: One Report Per Group Per Calendar Week

*For any* group and any calendar week (Monday 00:00:00 to Sunday 23:59:59), at most one CellReport can exist. Attempting to create a second report for the same group in the same week should be rejected with HTTP 409 and the message "Ya existe un reporte para esta célula en la semana indicada".

**Validates: Requirements 2.3, 2.4**

### Property 5: Future Date Rejection

*For any* meetingDate that is strictly in the future relative to the server's current time, attempting to create a CellReport should be rejected with HTTP 400.

**Validates: Requirements 2.5**

### Property 6: Report Listing Filter Correctness

*For any* combination of filters (groupId, networkId, startDate, endDate) applied to GET /reports/cell, every report in the response must satisfy all active filter criteria simultaneously.

**Validates: Requirements 3.2**

### Property 7: Admin Sees All Reports

*For any* user with role ADMIN or SUPER_ADMIN, the GET /reports/cell endpoint should return reports from all groups regardless of the user's group membership.

**Validates: Requirements 3.3**

### Property 8: Leader Sees Only Own Group Reports

*For any* user with role LEADER (without ADMIN/SUPER_ADMIN), the GET /reports/cell endpoint should return only reports from groups where the user holds LEADER or CO_LEADER membership.

**Validates: Requirements 3.4**

### Property 9: Pending Reports Completeness

*For any* set of active groups and existing CellReports, the GET /reports/cell/pending endpoint should return exactly those groups that do not have a CellReport in the current calendar week.

**Validates: Requirements 3.5**

### Property 10: Network Hierarchy Arbitrary Depth

*For any* depth N ≥ 1, a chain of N networks linked via parentNetworkId should be retrievable as a nested tree of depth N from the GET /networks endpoint.

**Validates: Requirements 4.2**

### Property 11: Invalid Foreign Key Reference Rejection

*For any* UUID that does not correspond to an existing record in the target table, setting `spouse_id`, `leader_id`, or `network_id` (on User or Group) to that UUID should be rejected with HTTP 400 and the appropriate error message.

**Validates: Requirements 5.5, 5.6, 7.3**

### Property 12: Organigrama Node-Edge Mapping Consistency

*For any* set of DiscipleshipRelationship records of type COVERAGE, the GET /organigrama endpoint should return exactly one edge per COVERAGE relationship (with source=mentorId, target=discipleId) and include both the mentor and disciple as nodes.

**Validates: Requirements 8.2, 8.3, 9.1**

### Property 13: Organigrama Response Completeness

*For any* node in the organigrama response, the fields id, fullName, and role must be non-null. For any edge, the fields id, source, and target must be non-null and reference existing nodes in the same response.

**Validates: Requirements 9.2, 9.3**

### Property 14: Network Color Assignment Consistency

*For any* two nodes in the organigrama with the same networkId, they must be assigned the same color. For any two distinct networkIds, they must be assigned different colors.

**Validates: Requirements 8.4**

### Property 15: Organigrama Access Control

*For any* user without role ADMIN, SUPER_ADMIN, or LEADER, the GET /organigrama endpoint should return HTTP 403.

**Validates: Requirements 9.4**

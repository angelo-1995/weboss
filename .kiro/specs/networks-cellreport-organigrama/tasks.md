# Implementation Plan: Networks, CellReport & Organigrama

## Overview

This plan replaces the existing WeeklyReport model with a comprehensive CellReport system, introduces hierarchical Networks, extends User/Group models with organizational fields, and adds an interactive organigrama visualization using React Flow. Implementation follows an incremental order: Database → Backend → Frontend → Seed/Navigation.

## Tasks

- [ ] 1. Database schema changes and migration
  - [ ] 1.1 Add Network model and COVERAGE enum value to Prisma schema
    - Add the `Network` model with `id`, `code`, `name`, `parentNetworkId`, `createdAt`, `updatedAt`
    - Add self-relation `NetworkHierarchy` for parent/children
    - Add `COVERAGE` value to the `RelationshipType` enum
    - Add indexes on `parentNetworkId` and `code`
    - _Requirements: 4.1, 4.2, 6.1_

  - [ ] 1.2 Extend User model with organizational fields
    - Add `spouseId`, `leaderId`, `networkId` optional fields to the `User` model
    - Add relations: `spouse`/`spouseOf` (SpouseRelation), `leader`/`subordinates` (LeaderRelation), `network`
    - Remove `weeklyReports` relation, add `cellReports` relation with name `CellReportReporter`
    - _Requirements: 5.1, 5.2, 5.3, 1.3_

  - [ ] 1.3 Extend Group model with networkId and CellReport relation
    - Add `networkId` optional field to `Group` model
    - Add `network` relation to `Network`
    - Replace `weeklyReports` relation with `cellReports CellReport[]`
    - _Requirements: 7.1, 1.2_

  - [ ] 1.4 Create CellReport model and remove WeeklyReport
    - Add the full `CellReport` model with all fields as defined in the design (información general, asistencia, métricas, reunión, ubicación, supervisión)
    - Add `@@unique([groupId, meetingDate])` constraint and all indexes
    - Remove the `WeeklyReport` model entirely from the schema
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ] 1.5 Generate and apply Prisma migration
    - Run `npx prisma migrate dev --name add-networks-cellreport-organigrama` to generate the migration SQL
    - Verify the migration creates `networks` table, alters `users` and `groups`, creates `cell_reports`, and drops `weekly_reports`
    - _Requirements: 1.5, 4.1_

- [ ] 2. Backend: Networks module
  - [ ] 2.1 Create Networks module, service, and controller
    - Create `apps/api/src/domains/networks/networks.module.ts`
    - Create `apps/api/src/domains/networks/networks.service.ts` with `findAllTree()` method that fetches all networks and builds a hierarchical tree in memory
    - Create `apps/api/src/domains/networks/networks.controller.ts` with `GET /networks` endpoint protected by JwtAuthGuard
    - Register `NetworksModule` in `app.module.ts`
    - _Requirements: 4.3, 4.2_

  - [ ]* 2.2 Write property test for Network hierarchy arbitrary depth
    - **Property 10: Network Hierarchy Arbitrary Depth**
    - **Validates: Requirements 4.2**

- [ ] 3. Backend: CellReport service and controller
  - [ ] 3.1 Create CellReport DTOs
    - Create `apps/api/src/domains/reporting/dto/cell-report.dto.ts` with `CreateCellReportDto` and `CellReportQueryDto`
    - Include all validation decorators (IsString, IsInt, Min, IsDateString, IsOptional, IsBoolean, IsNumber)
    - _Requirements: 1.1, 3.1, 3.2_

  - [ ] 3.2 Create CellReport service with week boundary logic
    - Create `apps/api/src/domains/reporting/cell-report.service.ts`
    - Implement `getWeekBoundaries(date)` utility for Monday-Sunday calculation
    - Implement `create()`: validate future date, verify LEADER/CO_LEADER role in group, check week uniqueness, compute totalAttendance, persist
    - Implement `findAll()`: admin sees all, leader sees own groups only, apply filters (groupId, networkId, startDate, endDate), paginate
    - Implement `findPending()`: return groups without a report in the current calendar week
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.3 Create CellReport controller
    - Create `apps/api/src/domains/reporting/cell-report.controller.ts`
    - Implement `POST /reports/cell` with roles guard (LEADER, CO_LEADER, ADMIN, SUPER_ADMIN)
    - Implement `GET /reports/cell` with pagination and filters
    - Implement `GET /reports/cell/pending`
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 3.4 Refactor ReportingModule to replace WeeklyReport with CellReport
    - Remove `WeeklyReportController` and `WeeklyReportService` imports from `reporting.module.ts`
    - Add `CellReportController` and `CellReportService` to the module
    - Delete `weekly-report.controller.ts` and `weekly-report.service.ts` files
    - _Requirements: 1.5_

  - [ ]* 3.5 Write property test for total attendance computation
    - **Property 2: Total Attendance Computation Invariant**
    - **Validates: Requirements 1.4**

  - [ ]* 3.6 Write property test for authorization (only LEADER/CO_LEADER can create)
    - **Property 3: Authorization — Only LEADER/CO_LEADER Can Create Reports**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 3.7 Write property test for one report per group per calendar week
    - **Property 4: One Report Per Group Per Calendar Week**
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 3.8 Write property test for future date rejection
    - **Property 5: Future Date Rejection**
    - **Validates: Requirements 2.5**

- [ ] 4. Checkpoint - Ensure database and backend compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Backend: User and Group extensions for organizational fields
  - [ ] 5.1 Extend UpdateUserDto with spouseId, leaderId, networkId
    - Add `@IsOptional() @IsUUID() spouseId`, `leaderId`, `networkId` fields to `apps/api/src/domains/users/dto/update-user.dto.ts`
    - Add validation in `UsersService.update()`: verify referenced users/network exist, return 400 with appropriate Spanish messages if not
    - _Requirements: 5.4, 5.5, 5.6_

  - [ ] 5.2 Extend UpdateGroupDto with networkId
    - Add `@IsOptional() @IsUUID() networkId` field to `apps/api/src/domains/groups/dto/update-group.dto.ts`
    - Add validation in `GroupsService.update()` (or create): verify network exists, return 400 with "La red especificada no existe" if not
    - _Requirements: 7.2, 7.3_

  - [ ]* 5.3 Write property test for invalid foreign key reference rejection
    - **Property 11: Invalid Foreign Key Reference Rejection**
    - **Validates: Requirements 5.5, 5.6, 7.3**

- [ ] 6. Backend: Organigrama endpoint
  - [ ] 6.1 Add organigrama endpoint to UsersController
    - Add `GET /users/organigrama` endpoint in `apps/api/src/domains/users/users.controller.ts`
    - Protect with `@Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')`
    - Implement service method that queries all `DiscipleshipRelationship` with type `COVERAGE` and status `ACTIVE`
    - Return `OrganigramaResponse` with nodes (id, fullName, role, networkId, networkName, phone) and edges (id, source=mentorId, target=discipleId)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 6.2 Write property test for organigrama node-edge mapping consistency
    - **Property 12: Organigrama Node-Edge Mapping Consistency**
    - **Validates: Requirements 8.2, 8.3, 9.1**

  - [ ]* 6.3 Write property test for organigrama access control
    - **Property 15: Organigrama Access Control**
    - **Validates: Requirements 9.4**

- [ ] 7. Checkpoint - Ensure all backend endpoints work and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Frontend: CellReport form
  - [ ] 8.1 Create CellReport Zod validation schema
    - Create `apps/web/src/features/reporting/schemas/cell-report.schema.ts`
    - Define Zod schema with all fields, Spanish error messages, and computed totalAttendance
    - _Requirements: 10.1, 10.2_

  - [ ] 8.2 Create CellReport API service
    - Create/update `apps/web/src/features/reporting/services/cell-report.service.ts`
    - Implement `create()`, `findAll()`, `findPending()` methods calling the backend endpoints
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 8.3 Create CellReportForm component
    - Create `apps/web/src/features/reporting/components/CellReportForm.tsx`
    - Organize fields in sections: Información General, Asistencia (with auto-sum display), Métricas de Crecimiento, Reunión, Ubicación, Observaciones
    - All labels and placeholders in Spanish
    - Use react-hook-form with Zod resolver
    - Handle success toast "Reporte de célula enviado correctamente"
    - Handle 409 error: "Ya existe un reporte para esta célula en la semana indicada"
    - Handle 403 error: "Solo el líder o co-líder de la célula puede enviar el reporte"
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 8.4 Update /reports page to use CellReportForm
    - Replace existing content in `apps/web/src/app/(dashboard)/reports/page.tsx` with the new CellReportForm component
    - Remove old WeeklyReport form components from `apps/web/src/features/reporting/components/`
    - _Requirements: 1.5, 10.1_

- [ ] 9. Frontend: Organigrama page with React Flow
  - [ ] 9.1 Install dagre and create organigrama feature structure
    - Install `dagre` and `@types/dagre` in the web app
    - Create directory `apps/web/src/features/organigrama/` with subdirectories: `components/`, `hooks/`, `utils/`, `services/`
    - _Requirements: 8.6_

  - [ ] 9.2 Create organigrama API service and data transformation utilities
    - Create `apps/web/src/features/organigrama/services/organigrama.service.ts` calling `GET /users/organigrama` and `GET /networks`
    - Create `apps/web/src/features/organigrama/utils/transform-organigrama.ts` with `transformToReactFlow()` function
    - Implement dagre layout (top-to-bottom, rankdir: 'TB', nodesep: 80, ranksep: 120)
    - Build network color map from networks response
    - _Requirements: 8.6, 9.1, 8.4_

  - [ ] 9.3 Create custom React Flow node and legend components
    - Create `apps/web/src/features/organigrama/components/OrganigramaNode.tsx` — custom node showing name, role, colored by network
    - Create `apps/web/src/features/organigrama/components/OrganigramaLegend.tsx` — color legend for each network
    - Create `apps/web/src/features/organigrama/components/OrganigramaTooltip.tsx` — hover tooltip with phone, network name, subordinate count
    - _Requirements: 8.2, 8.4, 8.7, 8.8_

  - [ ] 9.4 Create expand/collapse hook and main OrganigramaGraph component
    - Create `apps/web/src/features/organigrama/hooks/useOrganigramaState.ts` with collapse/expand logic filtering visible nodes/edges
    - Create `apps/web/src/features/organigrama/components/OrganigramaGraph.tsx` — React Flow wrapper integrating custom nodes, edges, layout, tooltip, and expand/collapse
    - _Requirements: 8.1, 8.5, 8.6_

  - [ ] 9.5 Create organigrama page route
    - Create `apps/web/src/app/(dashboard)/organigrama/page.tsx`
    - Compose OrganigramaGraph + OrganigramaLegend
    - Fetch data with React Query on mount
    - _Requirements: 8.1_

  - [ ]* 9.6 Write unit tests for transform-organigrama utility
    - Test dagre layout produces valid positions for all nodes
    - Test color map assigns consistent colors per network
    - **Property 14: Network Color Assignment Consistency**
    - **Validates: Requirements 8.4**

- [ ] 10. Seed data and navigation updates
  - [ ] 10.1 Create networks seed script
    - Create `packages/database/src/seed/networks.seed.ts` with the 6 predefined networks (CAB, DAM, JOV, JOC, MAT, NIN)
    - Integrate into `packages/database/src/seed/index.ts` to run as part of `prisma db seed`
    - _Requirements: 4.4_

  - [ ] 10.2 Add Organigrama link to sidebar navigation
    - Add "Organigrama" link in the sidebar navigation component, visible for ADMIN, SUPER_ADMIN, and LEADER roles
    - Ensure existing "Informes" link points to `/reports` with the updated CellReport form
    - _Requirements: 11.1, 11.2_

- [ ] 11. Final checkpoint - Ensure all tests pass and application compiles
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The WeeklyReport model is fully replaced (not extended) — old files are deleted in task 3.4
- `reactflow` is already installed; only `dagre` + `@types/dagre` need to be added
- All UI text must be in Spanish
- The Networks module is seed-only (no user CRUD)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4"] },
    { "id": 3, "tasks": ["1.5"] },
    { "id": 4, "tasks": ["2.1", "3.1", "5.1", "5.2"] },
    { "id": 5, "tasks": ["2.2", "3.2", "5.3"] },
    { "id": 6, "tasks": ["3.3", "3.4"] },
    { "id": 7, "tasks": ["3.5", "3.6", "3.7", "3.8", "6.1"] },
    { "id": 8, "tasks": ["6.2", "6.3", "8.1", "8.2"] },
    { "id": 9, "tasks": ["8.3", "9.1"] },
    { "id": 10, "tasks": ["8.4", "9.2"] },
    { "id": 11, "tasks": ["9.3", "9.4"] },
    { "id": 12, "tasks": ["9.5", "9.6"] },
    { "id": 13, "tasks": ["10.1", "10.2"] }
  ]
}
```

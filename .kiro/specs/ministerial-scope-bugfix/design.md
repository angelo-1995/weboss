# Ministerial Scope Bugfix Design

## Overview

The J-PDVE Conexiones platform currently exposes all organizational data to all authenticated users regardless of their ministerial role. The core defect is that `HierarchyVisibilityService` exists but is NOT integrated into most data-fetching paths (groups, persons, analytics/dashboard KPIs, alerts, reporting). Only `UsersController.findMany()` uses it. Additionally, the sidebar exposes admin-only menu items (Acceso al Sistema, Gestión Predicaciones) to non-admin users, `GET /users/:id` fails due to unhandled null Person relationships, SMTP is misconfigured for invitations, and the Pipeline view lacks mobile-responsive design.

The fix strategy is to inject `HierarchyVisibilityService` into each affected repository/service and pass `visibleGroupIds` into WHERE clauses at the query level, ensuring the single source of truth for scope resolution. Frontend changes complement but never replace backend enforcement.

## Glossary

- **Bug_Condition (C)**: Any request by a non-admin user to a scoped endpoint that currently returns unfiltered global data
- **Property (P)**: The desired behavior — all scoped endpoints return ONLY data within the user's ministerial scope (determined by `HierarchyVisibilityService.getVisibleGroupIds`)
- **Preservation**: Admin full-access behavior, organigrama, cobertura, sermons list, profile updates, invitation activation, existing RBAC guards, and desktop Pipeline layout must remain unchanged
- **HierarchyVisibilityService**: Global service in `apps/api/src/common/services/` that resolves visible user/group IDs from a user's `leaderCode` (prefix-based tree traversal)
- **leaderCode**: A dot-separated hierarchical code on User (e.g., `E5`, `E5.6`, `E5.6.1`) used as the prefix for descendant resolution
- **Ministerial Scope**: The set of groups and their data visible to a user based on their position in the organizational hierarchy (ADR-010)
- **DashboardKpisService**: Service in `apps/api/src/domains/reporting/` that calculates pastoral KPIs (attendance, visitors, offerings, compliance) from `cellReport` data
- **AlertDetectionService**: Service that creates `OperationalAlert` records for groups with anomalies (missing reports, declining attendance, zero visitors)
- **CurrentUserData**: JWT payload interface: `{ id, email, roles, status, sessionId, campusId }`

## Bug Details

### Bug Condition

The bug manifests when any non-admin authenticated user (Líder, Cobertura, Pastor de Red) requests data from scoped endpoints. The system returns ALL data across the entire organization because the repository queries do not incorporate `HierarchyVisibilityService` filtering. Additionally, the frontend sidebar renders admin-only items to LEADER-role users, `GET /users/:id` crashes on null Person relationships, and `POST /invitations` fails due to missing SMTP App Password configuration.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { userId: string, roles: string[], endpoint: string, viewport: number }
  OUTPUT: boolean
  
  LET scopedEndpoints = [
    "GET /groups",
    "GET /persons", 
    "GET /dashboard/kpis",
    "GET /dashboard/attendance-trend",
    "GET /dashboard/alerts",
    "GET /pipeline",
    "GET /reporting",
    "GET /cell-reports"
  ]
  
  LET isHierarchyScopeBug = 
    NOT roles.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r))
    AND input.endpoint IN scopedEndpoints
    
  LET isSidebarBug =
    NOT roles.some(r => ['ADMIN', 'SUPER_ADMIN', 'PASTOR_RED'].includes(r))
    AND sidebar.shows("Acceso al Sistema" OR "Gestión Predicaciones")
    
  LET isUserDetailBug = input.endpoint = "GET /users/:id"
    AND targetUser.person = null
    
  LET isInvitationBug = input.endpoint = "POST /invitations"
    AND smtp.appPassword NOT configured
    
  LET isMobilePipelineBug = input.endpoint = "GET /pipeline"
    AND input.viewport <= 768
    
  RETURN isHierarchyScopeBug OR isSidebarBug OR isUserDetailBug 
         OR isInvitationBug OR isMobilePipelineBug
END FUNCTION
```

### Examples

- **Líder E5.8 (Daphne)** requests `GET /groups` → currently returns 30+ groups across all networks; SHOULD return only "Daphne & Erick" (E5.8)
- **Cobertura E5.6 (Augusto)** requests `GET /dashboard/kpis` → currently returns global KPIs across 50+ cells; SHOULD return KPIs recalculated from E5.6, E5.6.1, E5.6.2, E5.6.3 data only
- **Líder E5.8** requests `GET /dashboard/alerts` → currently returns alerts for ALL groups; SHOULD return only alerts for E5.8
- **Líder E5.8** views sidebar → currently shows "Acceso al Sistema" and "Gestión Predicaciones"; SHOULD NOT show these items
- **Any user** requests `GET /users/:id` for a user without a Person record → returns HTTP 500; SHOULD return user detail with null person gracefully
- **Admin** sends `POST /invitations` → returns "Error al enviar invitación" because SMTP uses basic password instead of Gmail App Password
- **Líder on mobile** views Pipeline → renders horizontal Kanban requiring excessive scrolling; SHOULD render tabs-by-stage

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `ADMIN`/`SUPER_ADMIN` users continue to see ALL data across the entire organization without any scope filtering
- `GET /users/organigrama` continues to return the full organizational chart (read-only for all roles)
- `GET /users/cobertura` continues to return the coverage tree (read-only for all roles)
- `GET /sermons` (list, not admin) continues to return all sermons visible to all authenticated users
- `PATCH /users/me/profile` continues to allow self-profile updates regardless of scope
- `POST /invitations/activate` continues to create user accounts correctly with valid tokens
- Existing RBAC role checks (JwtAuthGuard + RolesGuard) continue to enforce role-based access alongside scope filtering
- Desktop Pipeline layout (> 768px) continues to display Kanban columns unchanged
- Audit logging, event emission, and all mutation workflows remain unchanged

**Scope:**
All inputs where `HierarchyVisibilityService.isFullAccess(roles)` returns `true` should be completely unaffected by this fix. This includes:
- All requests from ADMIN/SUPER_ADMIN users
- All read-only endpoints that are intentionally unscoped (organigrama, cobertura, sermons list)
- All mutation endpoints that don't involve data listing
- Desktop viewport rendering of Pipeline

## Hypothesized Root Cause

Based on the codebase analysis, the root causes are:

1. **Missing HierarchyVisibilityService Integration in Repositories**: The `GroupsRepository.findMany()`, `PersonsRepository.findAll()`, `DashboardKpisService.getKPIs()`, and `DashboardController.getAlerts()` do not call `HierarchyVisibilityService.getVisibleGroupIds()`. They query globally by `campusId` only, which includes all groups in the campus regardless of hierarchy.

2. **DashboardKpisService Calculates Globally**: `DashboardKpisService.getKPIs(campusId, networkId?)` fetches ALL active CELL groups in the campus and aggregates their reports. It has no parameter for `visibleGroupIds` and no concept of per-user scope.

3. **DashboardController.getAlerts() Queries Unscoped**: The alerts endpoint queries `operationalAlert` by `campusId` only, returning alerts for all groups in the campus regardless of the requesting user's hierarchy position.

4. **Sidebar Role Check Too Permissive**: The `NAV_SECTIONS` in `side-nav.tsx` assigns `roles: ['LEADER', 'ADMIN', 'SUPER_ADMIN']` to items like "Gestión Predicaciones" and shows "Acceso al Sistema" (`/users`) without any role restriction. Per ADR-010, only ADMIN/SUPER_ADMIN and Pastor de Red should see management items.

5. **UsersService.findById() Null Person Handling**: The `findById` method calls `repo.findLeaderInfo(user.leaderId)` and `repo.findUserGroups(id)` — if the repository's SELECT includes a `person` relation that can be null and the code doesn't handle it, it throws.

6. **SMTP Configuration**: Production environment uses basic Gmail password instead of App Password, causing nodemailer to fail authentication with Gmail's security requirements.

7. **PersonsController Uses campusId Only**: `PersonsController.findAll()` passes `user.campusId` to the service/repository but never passes visible group IDs for hierarchical filtering.

## Correctness Properties

Property 1: Bug Condition - Hierarchical Scope Enforcement on Groups

_For any_ authenticated user with roles NOT including ADMIN or SUPER_ADMIN, when requesting `GET /groups`, the fixed `GroupsService.findMany` SHALL return only groups whose IDs are contained in the set returned by `HierarchyVisibilityService.getVisibleGroupIds(userId, roles)`.

**Validates: Requirements 2.1, 2.8**

Property 2: Bug Condition - Dashboard KPI Recalculation by Scope

_For any_ authenticated user with roles NOT including ADMIN or SUPER_ADMIN, when requesting `GET /dashboard/kpis`, the fixed `DashboardKpisService` SHALL recalculate ALL KPIs (attendance, visitors, offerings, teams, compliance) using EXCLUSIVELY cellReport data from groups within `HierarchyVisibilityService.getVisibleGroupIds(userId, roles)`.

**Validates: Requirements 2.2, 2.8**

Property 3: Bug Condition - Persons Filtered by Visible Groups

_For any_ authenticated user with roles NOT including ADMIN or SUPER_ADMIN, when requesting `GET /persons`, the fixed `PersonsRepository.findAll` SHALL return only persons whose `currentGroupId` is contained in `HierarchyVisibilityService.getVisibleGroupIds(userId, roles)`.

**Validates: Requirements 2.3, 2.4, 2.8**

Property 4: Bug Condition - Alertas Pastorales Filtered by Scope

_For any_ authenticated user with roles NOT including ADMIN or SUPER_ADMIN, when requesting `GET /dashboard/alerts`, the fixed endpoint SHALL return only alerts whose `targetGroupId` is contained in `HierarchyVisibilityService.getVisibleGroupIds(userId, roles)`.

**Validates: Requirements 2.9, 2.10**

Property 5: Bug Condition - Sidebar Menu Visibility by Role

_For any_ user whose effective ministerial role is Líder or Cobertura (no ADMIN, SUPER_ADMIN, or PASTOR_RED role), the fixed sidebar SHALL NOT render "Acceso al Sistema" (`/users`) or "Gestión Predicaciones" (`/sermons/admin`) menu items.

**Validates: Requirements 2.5**

Property 6: Bug Condition - User Detail Null Safety

_For any_ valid user ID where the user exists but has no associated Person record, the fixed `GET /users/:id` SHALL return the user detail with null/empty person fields gracefully, without throwing an error.

**Validates: Requirements 2.6**

Property 7: Preservation - Admin Full Access Unchanged

_For any_ authenticated user with ADMIN or SUPER_ADMIN role, requesting any endpoint, the fixed code SHALL produce the same results as the original code — no scope filtering applied, all data visible.

**Validates: Requirements 3.1, 3.4, 3.7**

Property 8: Preservation - Read-Only Endpoints Unscoped

_For any_ authenticated user (regardless of role) requesting `GET /users/organigrama`, `GET /users/cobertura`, or `GET /sermons` (list), the fixed code SHALL continue to return all data without hierarchical filtering.

**Validates: Requirements 3.2, 3.3, 3.8**

Property 9: Preservation - Desktop Pipeline Layout Unchanged

_For any_ viewport width > 768px, the Pipeline view SHALL continue to render using the Kanban column layout, unchanged from the current behavior.

**Validates: Requirements 3.9**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `apps/api/src/domains/groups/groups.controller.ts`

**Function**: `findMany`

**Specific Changes**:
1. **Inject CurrentUser and HierarchyVisibilityService**: Add `@CurrentUser()` parameter to `findMany`, call `getVisibleGroupIds(user.id, user.roles)`, pass result as optional filter to service/repository.

---

**File**: `apps/api/src/domains/groups/groups.repository.ts`

**Function**: `findMany`

**Specific Changes**:
2. **Add visibleGroupIds parameter**: Accept optional `visibleGroupIds: string[] | null` parameter. When non-null, add `id: { in: visibleGroupIds }` to the WHERE clause.

---

**File**: `apps/api/src/domains/persons/persons.controller.ts`

**Function**: `findAll`

**Specific Changes**:
3. **Inject HierarchyVisibilityService**: Call `getVisibleGroupIds(user.id, user.roles)`, pass to service. When non-null, filter `currentGroupId: { in: visibleGroupIds }`.

---

**File**: `apps/api/src/domains/persons/persons.repository.ts`

**Function**: `findAll`

**Specific Changes**:
4. **Add visibleGroupIds parameter**: Accept optional parameter. When non-null, add `currentGroupId: { in: visibleGroupIds }` to the WHERE clause alongside existing campusId filter.

---

**File**: `apps/api/src/domains/reporting/dashboard-kpis.service.ts`

**Function**: `getKPIs`

**Specific Changes**:
5. **Accept visibleGroupIds parameter**: Instead of querying ALL groups by campusId, accept `visibleGroupIds: string[] | null`. When non-null, use these IDs directly instead of querying all groups. When null (admin), query all groups as before. Apply same logic to `getAttendanceTrend`.

---

**File**: `apps/api/src/domains/reporting/dashboard.controller.ts`

**Function**: `getKPIs`, `getAlerts`, `getAttendanceTrend`

**Specific Changes**:
6. **Inject HierarchyVisibilityService**: Call `getVisibleGroupIds(user.id, user.roles)` and pass to KPI service and alerts query. For alerts, add `targetGroupId: { in: visibleGroupIds }` when non-null.

---

**File**: `apps/api/src/domains/reporting/dashboard.controller.ts`

**Function**: `getAlerts`

**Specific Changes**:
7. **Scope alerts by visible groups**: When `visibleGroupIds` is non-null, add `targetGroupId: { in: visibleGroupIds }` to the WHERE clause on `operationalAlert.findMany`.

---

**File**: `apps/web/src/components/layout/side-nav.tsx`

**Constant**: `NAV_SECTIONS`

**Specific Changes**:
8. **Restrict menu item roles**: 
   - `/users` ("Acceso al Sistema"): Add `roles: ['ADMIN', 'SUPER_ADMIN']`
   - `/sermons/admin` ("Gestión Predicaciones"): Change from `['LEADER', 'ADMIN', 'SUPER_ADMIN']` to `['ADMIN', 'SUPER_ADMIN']`
   - The `LEADER` role alone does NOT grant manage access; only ADMIN/SUPER_ADMIN (and effectively Pastor de Red who has ADMIN) can see these

---

**File**: `apps/api/src/domains/users/users.service.ts` (or `users.repository.ts`)

**Function**: `findById`

**Specific Changes**:
9. **Null-safe Person handling**: Ensure the SELECT/include for `GET /users/:id` handles null `person` relation gracefully. Wrap optional relation access with null checks.

---

**File**: Production environment configuration (`.env.production` or deployment secrets)

**Specific Changes**:
10. **SMTP App Password**: Configure `SMTP_PASSWORD` with a Gmail App Password instead of the regular account password. Document the requirement in deployment docs.

---

**File**: `apps/web/src/features/users/components/pipeline-view.tsx`

**Specific Changes**:
11. **Mobile tabs layout**: Add responsive breakpoint detection (≤ 768px). On mobile, render Pipeline as tabs (Ganados | Consolidados | Discipulado | Enviados) with vertical card lists per tab. On desktop, preserve existing Kanban columns.

---

**File**: `apps/api/src/common/services/hierarchy-visibility.service.ts`

**Specific Changes**:
12. **Cache key integration**: When `getVisibleGroupIds` is called with scope parameters that will be used as cache keys for KPIs, include userId in cache key to prevent cross-user cache leaks. DashboardKpisService cache keys must include userId.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write integration tests that authenticate as users with specific leaderCodes (E5.8 = Líder, E5.6 = Cobertura, E5 = Pastor de Red) and assert that scoped endpoints return only data within their hierarchy. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **Groups Scope Test**: Authenticate as Líder E5.8, request `GET /groups` → assert returns ONLY groups where leader is E5.8 or descendant (will fail on unfixed code — returns all groups)
2. **Persons Scope Test**: Authenticate as Líder E5.8, request `GET /persons` → assert all returned persons have `currentGroupId` in visible groups (will fail on unfixed code — returns all persons in campus)
3. **Dashboard KPI Scope Test**: Authenticate as Cobertura E5.6, request `GET /dashboard/kpis` → assert attendance value matches SUM only from E5.6.* reports (will fail on unfixed code — returns global sum)
4. **Alerts Scope Test**: Authenticate as Líder E5.8, request `GET /dashboard/alerts` → assert all alerts have `targetGroupId` matching E5.8's group (will fail on unfixed code — returns all alerts)
5. **Sidebar Test**: Render sidebar as Líder role → assert "Acceso al Sistema" and "Gestión Predicaciones" are NOT visible (will fail on unfixed code)
6. **User Detail Null Person**: Request `GET /users/:id` for a user without Person record → assert HTTP 200 (will fail on unfixed code — HTTP 500)

**Expected Counterexamples**:
- Groups endpoint returns 30+ groups instead of 1 for Líder E5.8
- KPIs show global attendance of 200+ instead of scoped attendance of 12 for a single cell
- Alerts include targetGroupIds outside the user's visible scope
- Possible causes: missing WHERE clause on groupId, missing integration with HierarchyVisibilityService

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE NOT isFullAccess(input.roles) AND input.endpoint IN scopedEndpoints DO
  visibleGroupIds ← HierarchyVisibilityService.getVisibleGroupIds(input.userId, input.roles)
  result ← F'(input)
  
  // Every item in the response belongs to the user's visible scope
  FOR ALL item IN result.data DO
    ASSERT item.groupId IN visibleGroupIds 
           OR item.currentGroupId IN visibleGroupIds
           OR item.targetGroupId IN visibleGroupIds
  END FOR
END FOR

// KPI recalculation check
FOR ALL input WHERE NOT isFullAccess(input.roles) AND input.endpoint = "GET /dashboard/kpis" DO
  visibleGroupIds ← HierarchyVisibilityService.getVisibleGroupIds(input.userId, input.roles)
  result ← F'(input)
  expectedAttendance ← SUM(cellReport.totalAttendance WHERE groupId IN visibleGroupIds AND meetingDate >= thisWeekStart)
  ASSERT result.attendance.value = expectedAttendance
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE isFullAccess(input.roles) DO
  ASSERT F(input) = F'(input)  // Admin results unchanged
END FOR

FOR ALL input WHERE input.endpoint IN ["GET /users/organigrama", "GET /users/cobertura", "GET /sermons"] DO
  ASSERT F(input) = F'(input)  // Unscoped endpoints unchanged
END FOR

FOR ALL input WHERE input.endpoint = "pipeline" AND input.viewport > 768 DO
  ASSERT F'(input).layout = "kanban"  // Desktop layout preserved
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random user/role combinations to verify admin access remains unrestricted
- It catches edge cases like users with null leaderCode, users with very deep hierarchy codes
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for admin users and unscoped endpoints, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Admin Full Access Preservation**: Authenticate as ADMIN, request all scoped endpoints → verify returns all data (same result before and after fix)
2. **Organigrama Preservation**: Authenticate as LEADER, request `GET /users/organigrama` → verify returns full org chart (no filtering applied)
3. **Sermons List Preservation**: Authenticate as LEADER, request `GET /sermons` → verify returns all sermons
4. **Self-Profile Update Preservation**: Authenticate as any role, `PATCH /users/me/profile` → verify succeeds regardless of scope
5. **Desktop Pipeline Preservation**: Render Pipeline at viewport > 768px → verify Kanban columns remain unchanged

### Unit Tests

- Test `HierarchyVisibilityService.getVisibleGroupIds` with various leaderCodes (E5, E5.6, E5.6.1) and verify correct descendant resolution
- Test `GroupsRepository.findMany` with visibleGroupIds filter returns only matching groups
- Test `PersonsRepository.findAll` with visibleGroupIds filter returns only persons in those groups
- Test `DashboardKpisService.getKPIs` with visibleGroupIds recalculates correctly
- Test `DashboardController.getAlerts` with scope filter returns only scoped alerts
- Test `UsersService.findById` with user that has null Person relation returns 200
- Test sidebar `NAV_SECTIONS` filtering logic with different role arrays

### Property-Based Tests

- Generate random leaderCode hierarchies (depth 1-4) and verify `getVisibleGroupIds` returns exactly the correct set of descendant groups
- Generate random group/person associations and verify that scope filtering is a proper subset (no data outside scope leaks through)
- Generate random admin vs non-admin user combinations and verify admin always gets unfiltered results
- Generate random KPI data across multiple groups and verify scoped recalculation matches manual sum

### Integration Tests

- Full E2E: Seed database with known hierarchy (E5 → E5.6 → E5.6.1, E5.8). Authenticate as each role and verify correct scoped data on all endpoints
- Test cache key isolation: Two users with different scopes requesting KPIs don't get each other's cached results
- Test sidebar rendering with different role combinations across all breakpoints
- Test invitation flow with correctly configured SMTP (Maildev in test environment)
- Test Pipeline mobile tabs rendering and interaction (swipe, tab switching, person counts)

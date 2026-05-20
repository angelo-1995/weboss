# Implementation Tasks — Frontend CRUD, UX & Reporting

## Wave 1: Foundation (Shared Components, API Client, Sidebar)

- [ ] 1. Create API Client base class with auth interceptor
  - [ ] 1.1 Create `apps/web/src/lib/api-client.ts` with typed GET/POST/PATCH/DELETE methods, Bearer token injection from Zustand, 401 auto-refresh logic, and `ApiError` class (Req 2–12)
  - [ ] 1.2 Enhance `features/auth/stores/auth.store.ts` — add `user: CurrentUser | null`, `setUser()`, `logout()` (calls POST /auth/logout + clears store + redirect) (Req 11)
  - [ ] 1.3 Create `features/auth/hooks/use-current-user.ts` — React Query hook calling GET /api/v1/auth/me on app load, stores result in Zustand (Req 11.5)

- [ ] 2. Build shared DataTable component system
  - [ ] 2.1 Create `components/data-table/data-table.tsx` — generic TanStack Table wrapper with shadcn/ui Table, column definitions, row click handler (Req 2, 7, 10)
  - [ ] 2.2 Create `components/data-table/data-table-pagination.tsx` — cursor-based prev/next buttons with hasMore logic (Req 2.7)
  - [ ] 2.3 Create `components/data-table/data-table-toolbar.tsx` — search input (debounce 300ms) + filter dropdowns + action buttons slot (Req 2.4, 2.5)
  - [ ] 2.4 Create `components/data-table/data-table-skeleton.tsx` — loading skeleton matching table layout (Req 3.3)

- [ ] 3. Build shared Form components
  - [ ] 3.1 Create `components/forms/form-modal.tsx` — shadcn Dialog + React Hook Form wrapper with open/close state, submit handler, loading/disabled states (Req 2, 5, 7)
  - [ ] 3.2 Create `components/forms/password-input.tsx` — input with eye toggle (show/hide) + strength indicator bar (weak/medium/strong) + criteria checklist (Req 1.2, 1.3)
  - [ ] 3.3 Create `components/forms/user-search-input.tsx` — async combobox with debounce 300ms, fetches from /search?type=users, supports single and multi-select (Req 4.1, 6.5, 7.1)

- [ ] 4. Build shared Layout & Feedback components
  - [ ] 4.1 Create `components/layout/page-header.tsx` — title + description + right-side action buttons (Req 2–12)
  - [ ] 4.2 Create `components/layout/tabs-layout.tsx` — shadcn Tabs container with lazy-loaded tab panels (Req 3.1)
  - [ ] 4.3 Create `components/layout/user-menu.tsx` — avatar (initials fallback) + name + role + dropdown (Mi Perfil, Seguridad, Cerrar Sesión) (Req 11.1, 11.2)
  - [ ] 4.4 Create `components/feedback/confirm-dialog.tsx` — destructive action confirmation with title, description, cancel/confirm buttons (Req 7.5)
  - [ ] 4.5 Create `components/feedback/empty-state.tsx` — illustration + message + CTA button (Req 10)
  - [ ] 4.6 Create `components/feedback/badge-count.tsx` — notification badge number overlay for sidebar items (Req 10.9, 12.2)

- [ ] 5. Update Sidebar navigation and layout
  - [ ] 5.1 Update `components/layout/side-nav.tsx` — add all nav items (Dashboard, Usuarios, Grupos, Discipulado, Informes, Analytics, Auditoría), role-based visibility, active link highlight (Req 12.1, 12.3, 12.4)
  - [ ] 5.2 Integrate `user-menu.tsx` in sidebar footer with current user data from Zustand (Req 11.1, 11.2)
  - [ ] 5.3 Add badge-count to "Informes" nav item — React Query polling every 5min for pending reports count (Req 10.9, 12.2)
  - [ ] 5.4 Implement logout flow in user-menu: POST /auth/logout → clear store → redirect /login; handle failure gracefully (Req 11.3, 11.4)

---

## Wave 2: Core CRUD (Create User, Create Group, Add Members)

- [ ] 6. Implement Create User flow
  - [ ] 6.1 Create `features/users/schemas/user.schema.ts` — Zod schemas: `createUserSchema` (email, firstName min 2, lastName min 2, phone optional, birthDate, campusId, role), `updateUserSchema` (partial) (Req 2.8)
  - [ ] 6.2 Create `features/users/services/users.service.ts` — API functions: create, list (cursor pagination + filters), getById, update (partial) using api-client (Req 2, 3)
  - [ ] 6.3 Create `features/users/hooks/use-create-user.ts` — React Query mutation with invalidateQueries(['users']) on success (Req 2.2)
  - [ ] 6.4 Create `features/users/components/create-user-modal.tsx` — FormModal with fields: nombre, apellido, email, teléfono, fecha nacimiento, campus, rol; handles 409 duplicate email error inline (Req 2.1, 2.2, 2.3)
  - [ ] 6.5 Enhance `/users/page.tsx` — integrate DataTable with search (debounce), filters (status, campus, role), sorting, cursor pagination, row click → navigate to /users/:id, "Nuevo Miembro" button opens create modal (Req 2.4, 2.5, 2.6, 2.7)

- [ ] 7. Implement Create Group flow
  - [ ] 7.1 Create `features/groups/schemas/group.schema.ts` — Zod: `createGroupSchema` (name min 3, description, type enum, campusId, ministryId optional, parentGroupId optional) (Req 5.7)
  - [ ] 7.2 Create `features/groups/services/groups.service.ts` — API functions: create, list (filters), getById, getMembers, addMember, removeMember, updateMemberRole (Req 5, 7)
  - [ ] 7.3 Create `features/groups/hooks/use-create-group.ts` — mutation with cache invalidation (Req 5.3)
  - [ ] 7.4 Create `features/groups/components/create-group-modal.tsx` — FormModal with fields: nombre, descripción, tipo (select), campus, ministerio, grupo padre; validates with Zod (Req 5.1, 5.2)
  - [ ] 7.5 Enhance `/groups/page.tsx` — cards view grouped by type (badge color), filters (type, campus, ministry, status), "Crear Grupo" button opens modal, card click → /groups/:id (Req 5.4, 5.5, 5.6)

- [ ] 8. Implement Group Detail & Add Members
  - [ ] 8.1 Create `/groups/[id]/page.tsx` — group detail page with header (name, type badge, description) + members DataTable (Req 5.6, 7.4)
  - [ ] 8.2 Create `features/groups/components/add-member-modal.tsx` — modal with user-search-input (debounce) + role selector (LEADER, CO_LEADER, MEMBER, GUEST) + confirm (Req 7.1, 7.2, 7.3)
  - [ ] 8.3 Create `features/groups/components/group-members-table.tsx` — DataTable showing name, role badge, join date, actions (change role, remove); bulk select support (Req 7.4, 7.7)
  - [ ] 8.4 Implement remove member with confirm-dialog; show error if last leader (Req 7.5, 7.6)
  - [ ] 8.5 Implement bulk actions: multi-select → change role or remove batch (Req 7.7)

---

## Wave 3: Profiles & Security (User Profile Tabs, Change Password, Onboarding)

- [ ] 9. Implement User Profile page with tabs
  - [ ] 9.1 Create `/users/[id]/page.tsx` — fetch user by ID, render tabs-layout with 6 tabs (Req 3.1)
  - [ ] 9.2 Create `features/users/components/user-general-tab.tsx` — editable fields: nombre, apellido, email, teléfono, fecha nacimiento, avatar, bio; PATCH on save with optimistic update (Req 3.5, 3.2, 3.4)
  - [ ] 9.3 Create `features/users/components/user-contact-tab.tsx` — dirección, ciudad, país, código postal; partial update (Req 3.6)
  - [ ] 9.4 Create `features/users/components/user-ministry-tab.tsx` — campus, ministerios, roles organizacionales (Req 3.7)
  - [ ] 9.5 Create `features/users/components/user-groups-tab.tsx` — list of groups with contextual role (read-only, links to group) (Req 3.8)
  - [ ] 9.6 Create `features/users/components/user-discipleship-tab.tsx` — active mentoring relationships (as mentor and disciple) (Req 3.9)
  - [ ] 9.7 Create `features/users/components/user-social-tab.tsx` — Instagram, Facebook, Twitter/X, LinkedIn, WhatsApp fields; partial update (Req 3.10)

- [ ] 10. Implement Change Password page
  - [ ] 10.1 Create `features/auth/schemas/password.schema.ts` — Zod: currentPassword required, newPassword min 8 + uppercase + number + symbol, confirmPassword must match (Req 1.1)
  - [ ] 10.2 Create `features/auth/components/change-password-form.tsx` — form with 3 password-input fields, strength indicator, submit → PATCH /auth/password; handle 401 "Contraseña actual incorrecta", success toast + clear form (Req 1.1–1.6)
  - [ ] 10.3 Create `/settings/security/page.tsx` — page-header + change-password-form (Req 1)
  - [ ] 10.4 *Backend: Add PATCH /auth/password endpoint with rate limit 5/min, verify current password, hash new with Argon2id, audit log (Req 1.4–1.8)

- [ ] 11. Implement Onboarding / Invitation flow
  - [ ] 11.1 Add "Enviar invitación por email" checkbox to create-user-modal; when checked, triggers POST /invitations after user creation (Req 8.1)
  - [ ] 11.2 *Backend: Create invitations module — POST /invitations (generate token, 72h TTL, send email), POST /invitations/activate (validate token, set password, activate user), POST /invitations/resend/:id (Req 8.2, 8.4, 8.7)
  - [ ] 11.3 Create `features/auth/components/onboarding-form.tsx` — welcome message + password-input with strength indicator + submit (Req 8.3)
  - [ ] 11.4 Create `/activate/[token]/page.tsx` — public page, validates token on load, shows onboarding-form or expired message (Req 8.3, 8.5)
  - [ ] 11.5 Show invitation status badge (PENDING/ACTIVE) in users table (Req 8.6)
  - [ ] 11.6 Add "Reenviar invitación" action button for PENDING users in users table (Req 8.7)

---

## Wave 4: Discipleship UX (Create Relationship, Milestones, Check-ins, Tree)

- [ ] 12. Implement Create Discipleship Relationship
  - [ ] 12.1 Create `features/discipleship/services/discipleship.service.ts` — API functions: createRelationship, getRelationships, getRelationshipById, addMilestone, completeMilestone, addCheckIn (Req 4, 6, 9)
  - [ ] 12.2 Create `features/discipleship/schemas/discipleship.schema.ts` — Zod: createRelationshipSchema (mentorId, discipleId, type enum, groupId optional, notes) (Req 4.1)
  - [ ] 12.3 Create `features/discipleship/components/create-relationship-modal.tsx` — FormModal with user-search for mentor/disciple, type selector, optional group, notes; handle 409 cycle error (Req 4.1, 4.2, 4.3)
  - [ ] 12.4 Enhance `/discipleship/page.tsx` — add "Nueva Relación" button, integrate create modal (Req 4.1)

- [ ] 13. Implement Discipleship Tree visualization
  - [ ] 13.1 Create `components/hierarchy/tree-view.tsx` — recursive tree component with expand/collapse, color-coded by relationship type, disciple count per node (Req 4.4, 4.6)
  - [ ] 13.2 Integrate tree-view in `/discipleship/page.tsx` — fetch hierarchy data, render tree, node click opens side panel with relationship details (Req 4.4, 4.5)

- [ ] 14. Implement Discipleship Detail page (Milestones & Check-ins)
  - [ ] 14.1 Create `/discipleship/[id]/page.tsx` — relationship detail: mentor, disciple, type, start date, milestones timeline, check-in history (Req 4.5, 6.3)
  - [ ] 14.2 Create `features/discipleship/components/milestone-form.tsx` — form: título, descripción, orden; POST to add milestone (Req 6.1)
  - [ ] 14.3 Create `features/discipleship/components/checkin-form.tsx` — form: fecha, notas, rating 1-5, asistentes; POST to add check-in (Req 6.2)
  - [ ] 14.4 Implement milestone completion — PATCH with optimistic update + success animation (Req 6.4)
  - [ ] 14.5 Render milestones timeline (completed vs pending) and check-in history with star rating (Req 6.3)

- [ ] 15. Implement Discipleship Report (Check-in form page)
  - [ ] 15.1 Create `/discipleship/[id]/report/page.tsx` — full-page form: fecha reunión, asistencia per disciple, temas, compromisos, próxima reunión, rating 1-5 (Req 9.1)
  - [ ] 15.2 Submit form → POST /discipleship/:id/check-ins; success toast + redirect to detail (Req 9.2)
  - [ ] 15.3 Show check-in history on detail page with date, star rating, notes summary (Req 9.3)
  - [ ] 15.4 *Create `/discipleship/reports/page.tsx` — admin view with aggregated metrics: total check-ins this month, avg rating, relationships without check-in 14+ days (Req 9.4, 9.5)

---

## Wave 5: Weekly Reports (Backend Model, API, Frontend Form + Table)

- [ ] 16. Backend: WeeklyReport model and API
  - [ ] 16.1 Add `WeeklyReport` model to `packages/database/prisma/schema.prisma` with fields: id, groupId, reporterId, meetingDate, attendanceCount, newVisitorsCount, prayerRequests, notes, offeringAmount, timestamps, indexes (Req 10.10)
  - [ ] 16.2 Add relations: `User.weeklyReports`, `Group.weeklyReports` (Req 10.10)
  - [ ] 16.3 Run `prisma migrate dev --name add-weekly-reports` (Req 10.10)
  - [ ] 16.4 Create `apps/api/src/domains/reporting/dto/weekly-report.dto.ts` — CreateWeeklyReportDto with class-validator: attendanceCount ≥ 0, newVisitorsCount ≥ 0, meetingDate not future, groupId required (Req 10.5)
  - [ ] 16.5 Create `apps/api/src/domains/reporting/weekly-report.service.ts` — create, findAll (filters: dateRange, groupId, reporterId), findPending (groups without report this week) (Req 10.3, 10.6, 10.8)
  - [ ] 16.6 Create `apps/api/src/domains/reporting/weekly-report.controller.ts` — POST /reports/weekly, GET /reports/weekly, GET /reports/weekly/pending; role guards (LEADER+ for create, ADMIN for pending) (Req 10.3, 10.6, 10.8)

- [ ] 17. Frontend: Weekly Reports page
  - [ ] 17.1 Create `features/reporting/schemas/weekly-report.schema.ts` — Zod: groupId required, meetingDate not future, attendanceCount ≥ 0, newVisitorsCount ≥ 0, prayerRequests optional, notes optional, offeringAmount optional numeric (Req 10.5)
  - [ ] 17.2 Create `features/reporting/services/weekly-reports.service.ts` — API functions: create, list (filters), getPending (Req 10)
  - [ ] 17.3 Create `features/reporting/hooks/use-weekly-reports.ts` — React Query hooks: useWeeklyReports (list), useCreateWeeklyReport (mutation), usePendingReports (Req 10)
  - [ ] 17.4 Create `features/reporting/components/weekly-report-form.tsx` — FormModal: grupo (preselected if only one), fecha reunión, asistentes, visitantes, peticiones oración, notas, ofrenda; Zod validation (Req 10.2, 10.5)
  - [ ] 17.5 Create `features/reporting/components/weekly-reports-table.tsx` — DataTable: grupo, líder, fecha, asistentes, visitantes, fecha envío; filters by date range, group, status (Req 10.6, 10.7)
  - [ ] 17.6 Create `/reports/page.tsx` — page with "Nuevo Informe" button (leaders), reports table, pending indicator; admins see all reports + "Pendientes" filter showing groups without report this week (Req 10.1, 10.6, 10.8)

- [ ] 18. *Integration & Polish
  - [ ] 18.1 *Add invitation status column to users DataTable (PENDING badge, ACTIVE badge) (Req 8.6)
  - [ ] 18.2 *Add "Reenviar invitación" action in users table row actions for PENDING users (Req 8.7)
  - [ ] 18.3 *Add pending reports badge polling (5min interval) to sidebar "Informes" link (Req 10.9, 12.2)
  - [ ] 18.4 *Implement role-based sidebar visibility: hide Analytics + Auditoría for MEMBER/GUEST roles (Req 12.3)
  - [ ] 18.5 *Add dark mode toggle support across all new components (Technical Notes)
  - [ ] 18.6 *Mobile responsive review: test all modals, tables, and forms on mobile breakpoints (Technical Notes)
  - [ ] 18.7 *End-to-end smoke test: create user → invite → activate → create group → add member → submit weekly report (Req 2, 5, 7, 8, 10)

---

## Dependency Graph

```
Wave 1 (Tasks 1–5) → Foundation for all subsequent waves
  Task 1 (API Client) → required by Tasks 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17
  Task 2 (DataTable) → required by Tasks 6.5, 8.3, 17.5
  Task 3 (FormModal, PasswordInput, UserSearch) → required by Tasks 6.4, 7.4, 8.2, 10.2, 11.3, 12.3, 14.2, 14.3, 17.4
  Task 4 (Layout components) → required by Tasks 5, 9, 10.3
  Task 5 (Sidebar) → required by Task 18.3, 18.4

Wave 2 (Tasks 6–8) → depends on Wave 1
  Task 6 (Users CRUD) → required by Task 9 (profile), Task 11 (onboarding)
  Task 7 (Groups CRUD) → required by Task 8 (group detail)
  Task 8 (Group members) → standalone after Task 7

Wave 3 (Tasks 9–11) → depends on Wave 1 + partial Wave 2
  Task 9 (Profile) → depends on Task 6.2 (users service)
  Task 10 (Password) → depends on Task 3.2 (password-input)
  Task 11 (Onboarding) → depends on Task 6.4 (create-user-modal), Task 3.2

Wave 4 (Tasks 12–15) → depends on Wave 1
  Task 12 (Create relationship) → required by Tasks 13, 14, 15
  Task 13 (Tree) → depends on Task 12.1 (service)
  Task 14 (Detail) → depends on Task 12.1
  Task 15 (Report) → depends on Task 14

Wave 5 (Tasks 16–18) → Backend (16) before Frontend (17)
  Task 16 (Backend) → required by Task 17
  Task 17 (Frontend) → depends on Task 16, Task 2 (DataTable), Task 3.1 (FormModal)
  Task 18 (Polish) → depends on all previous waves
```

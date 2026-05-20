# Tasks: Network Sermons

## Task 1: Database Schema and Migration

### Description
Add the Sermon, SermonFile, SermonView, and Notification models to the Prisma schema. Create and run the migration. Update existing models (User, Network) with new relations.

### Steps
- [x] 1.1 Add `SermonStatus` enum to `schema.prisma`
- [x] 1.2 Add `Sermon` model with all fields, indexes, and relations
- [x] 1.3 Add `SermonFile` model with cascade delete from Sermon
- [x] 1.4 Add `SermonView` model with unique constraint on `[sermonId, userId]`
- [x] 1.5 Add `Notification` model with indexes on `[userId, isRead]` and `[userId, createdAt]`
- [x] 1.6 Add `sermonViews`, `sermonsCreated`, and `notifications` relations to the `User` model
- [x] 1.7 Add `sermons` relation to the `Network` model
- [x] 1.8 Run `pnpm db:generate` and `pnpm db:migrate` to apply changes
- [x] 1.9 Verify migration applied correctly with Prisma Studio

---

## Task 2: Backend Domain Module Scaffold

### Description
Create the `sermons` domain module following the project's DDD-lite pattern with controller, service, repository, DTOs, guard, and processor files.

### Steps
- [x] 2.1 Create `domains/sermons/sermons.module.ts` with module definition
- [x] 2.2 Create `domains/sermons/dto/create-sermon.dto.ts` with Zod schema (title, description, sermonDate, videoUrl, externalLink, publishAt)
- [x] 2.3 Create `domains/sermons/dto/update-sermon.dto.ts` with partial Zod schema
- [x] 2.4 Create `domains/sermons/dto/sermon-query.dto.ts` with pagination and filter schema
- [x] 2.5 Create `domains/sermons/sermons.repository.ts` with Prisma data access methods
- [x] 2.6 Create `domains/sermons/sermons.service.ts` with business logic skeleton
- [x] 2.7 Create `domains/sermons/sermons.controller.ts` with route definitions and Zod parsing
- [x] 2.8 Create `domains/sermons/guards/network-pastor.guard.ts` validating NetworkLeader + PASTOR role
- [x] 2.9 Register `SermonsModule` in `app.module.ts`
- [x] 2.10 Verify the module compiles with `pnpm type-check`

---

## Task 3: Sermon CRUD Implementation

### Description
Implement the full create, read, update, and soft-delete logic for sermons with proper authorization, audit events, and network scoping.

### Steps
- [x] 3.1 Implement `SermonsRepository.create()` — insert sermon with status logic (PUBLISHED if no publishAt, SCHEDULED if future publishAt)
- [x] 3.2 Implement `SermonsRepository.findById()` — fetch sermon with files and view count, excluding soft-deleted
- [x] 3.3 Implement `SermonsRepository.findByNetwork()` — cursor-based pagination with date/search filters
- [x] 3.4 Implement `SermonsRepository.update()` — partial update with old values capture for audit
- [x] 3.5 Implement `SermonsRepository.softDelete()` — set `deletedAt` timestamp
- [x] 3.6 Implement `SermonsService.create()` — validate authorization, call repository, emit `sermon.created` event
- [x] 3.7 Implement `SermonsService.update()` — validate ownership, call repository, emit `sermon.updated` event
- [x] 3.8 Implement `SermonsService.softDelete()` — validate ownership, call repository, emit `sermon.deleted` event
- [x] 3.9 Implement `SermonsService.findById()` — validate network access (member's networkId or ADMIN)
- [x] 3.10 Implement `SermonsService.findByNetwork()` — scope to user's network or allow ADMIN access
- [x] 3.11 Wire controller endpoints: POST, GET list, GET detail, PATCH, DELETE
- [x] 3.12 Add Swagger decorators to all endpoints

---

## Task 4: File Upload Implementation

### Description
Implement multipart file upload for cover images and attachments with validation, storage, and serving.

### Steps
- [x] 4.1 Configure `@fastify/multipart` in the API bootstrap if not already registered
- [x] 4.2 Create file upload utility: validate MIME type, file size, generate UUID filename
- [x] 4.3 Implement cover image upload in sermon creation (JPEG/PNG/WebP, max 5 MB)
- [x] 4.4 Implement file attachments upload (PDF/DOCX/TXT, max 20 MB each, max 10 per sermon)
- [x] 4.5 Create `uploads/sermons/` directory structure with sermon ID subdirectories
- [x] 4.6 Implement `POST /sermons/:id/files` endpoint for adding files after creation
- [x] 4.7 Implement `DELETE /sermons/:id/files/:fileId` endpoint for removing attachments
- [x] 4.8 Implement static file serving route with auth middleware (network member or admin only)
- [x] 4.9 Add file size and format validation error messages in Spanish

---

## Task 5: Scheduled Publishing

### Description
Implement the BullMQ cron job that checks for scheduled sermons and publishes them when their `publishAt` time arrives.

### Steps
- [x] 5.1 Add `SERMONS` to `QUEUE_NAMES` constant and register the queue in `QueueModule`
- [x] 5.2 Create `sermon-scheduler.service.ts` with a repeatable BullMQ job (every 30 seconds)
- [x] 5.3 Implement `SermonsRepository.findScheduledReady()` — query SCHEDULED sermons where `publishAt <= now`
- [~] 5.4 Implement `SermonsRepository.updateStatus()` — transition status and set `publishedAt`
- [~] 5.5 Implement scheduler logic: find ready sermons → update status → trigger notifications
- [~] 5.6 Handle edge case: if `publishAt` is set to a past time during update, publish immediately
- [~] 5.7 Add logging for each scheduled sermon published
- [~] 5.8 Test scheduler with a sermon scheduled 1 minute in the future

---

## Task 6: Notification System

### Description
Implement in-site notifications and email notification fan-out when a sermon is published.

### Steps
- [~] 6.1 Implement `SermonNotificationService.notifyNetworkMembers()` — fetch active members, batch-insert Notification records
- [~] 6.2 Implement email job enqueue: add one `sermon-email` job per member to the notifications queue
- [~] 6.3 Add `sermon-email` handler to `NotificationProcessor` — render email template and send via SMTP
- [~] 6.4 Create Handlebars email template for sermon notification (title, excerpt, date, CTA link)
- [~] 6.5 Implement retry logic: 3 attempts with exponential backoff (already configured in BullMQ defaults)
- [~] 6.6 Implement `GET /api/v1/notifications` endpoint — list user's notifications (paginated, newest first)
- [~] 6.7 Implement `PATCH /api/v1/notifications/:id/read` endpoint — mark notification as read
- [~] 6.8 Implement `GET /api/v1/notifications/unread-count` endpoint — return unread count for badge
- [~] 6.9 Add rate limiting for notification fan-out (batch inserts of 100, 50ms delay between batches)

---

## Task 7: View Tracking

### Description
Implement sermon view recording and analytics for pastors.

### Steps
- [~] 7.1 Implement `SermonsRepository.createView()` — upsert SermonView (unique constraint handles duplicates)
- [~] 7.2 Implement `SermonsService.recordView()` — called when member opens sermon detail
- [~] 7.3 Implement `SermonsRepository.getViewsBySermon()` — return all views with user info
- [~] 7.4 Implement `SermonsService.getViewAnalytics()` — return viewed members, not-viewed members, total counts
- [~] 7.5 Implement `GET /sermons/:id/views` endpoint with NetworkPastor guard
- [~] 7.6 Implement `SermonsRepository.getUnviewedCount()` — count PUBLISHED sermons without a view for user
- [~] 7.7 Integrate view recording into `GET /sermons/:id` (record view on detail fetch)
- [~] 7.8 Add unread indicator to sermon list response

---

## Task 8: Admin Stats Endpoint

### Description
Implement the admin dashboard statistics endpoint for network pastors.

### Steps
- [~] 8.1 Implement `SermonsRepository.getAdminStats()` — aggregate queries for total published, total views, pending scheduled
- [~] 8.2 Implement `SermonsService.getAdminStats()` — compute average views per sermon
- [~] 8.3 Implement `GET /sermons/admin/stats` endpoint with NetworkPastor guard
- [~] 8.4 Return stats: totalPublished, totalViews, pendingScheduled, avgViewsPerSermon

---

## Task 9: Meilisearch Integration

### Description
Index sermons in Meilisearch for full-text search on title and description.

### Steps
- [~] 9.1 Create sermon search index in Meilisearch with filterable attributes (networkId, status, sermonDate)
- [~] 9.2 Add sermon to Meilisearch index on creation/publish
- [~] 9.3 Update Meilisearch document on sermon update
- [~] 9.4 Remove from Meilisearch on soft delete
- [~] 9.5 Integrate Meilisearch search into `findByNetwork()` when `search` query param is provided
- [~] 9.6 Ensure search results respect network isolation (filter by networkId)

---

## Task 10: Frontend — Sermon Admin Panel

### Description
Build the pastor's administrative interface for managing sermons.

### Steps
- [~] 10.1 Create `features/sermons/types/sermon.types.ts` with TypeScript interfaces
- [~] 10.2 Create `features/sermons/hooks/use-sermons.ts` with TanStack Query hooks (list, detail, stats)
- [~] 10.3 Create `features/sermons/hooks/use-sermon-mutations.ts` (create, update, delete)
- [~] 10.4 Create sermon admin dashboard page at `app/(dashboard)/sermons/admin/page.tsx`
- [~] 10.5 Build stats cards component (Total Published, Total Views, Pending, Avg Views)
- [~] 10.6 Build sermon table with TanStack Table (title, date, status badge, views, actions)
- [~] 10.7 Create sermon form component with file upload (cover image + attachments dropzone)
- [~] 10.8 Create new sermon page at `app/(dashboard)/sermons/admin/new/page.tsx`
- [~] 10.9 Create edit sermon page at `app/(dashboard)/sermons/admin/[id]/edit/page.tsx`
- [~] 10.10 Build sermon analytics view at `app/(dashboard)/sermons/admin/[id]/analytics/page.tsx`
- [~] 10.11 Add schedule toggle (publish now vs schedule) with datetime picker
- [~] 10.12 Add "Predicaciones" and "Gestión Predicaciones" to side navigation

---

## Task 11: Frontend — Member Sermon Feed

### Description
Build the member-facing sermon feed with card layout, detail view, and unread indicators.

### Steps
- [~] 11.1 Create sermon feed page at `app/(dashboard)/sermons/page.tsx`
- [~] 11.2 Build sermon card component (cover image, title, date, excerpt, unread badge)
- [~] 11.3 Implement infinite scroll with cursor pagination using TanStack Query
- [~] 11.4 Create sermon detail page at `app/(dashboard)/sermons/[id]/page.tsx`
- [~] 11.5 Build sermon detail view (video embed, full description, file download links)
- [~] 11.6 Implement filter bar (date range picker, search input)
- [~] 11.7 Create `features/sermons/stores/sermon-filters.store.ts` with Zustand
- [~] 11.8 Add unread sermon badge count to notification bell in header

---

## Task 12: Frontend — Notification Integration

### Description
Integrate sermon notifications into the existing notification UI (bell icon, dropdown).

### Steps
- [~] 12.1 Create `features/notifications/hooks/use-notifications.ts` with TanStack Query hooks
- [~] 12.2 Build notification dropdown component (list of recent notifications)
- [~] 12.3 Implement mark-as-read on notification click
- [~] 12.4 Add unread count badge to notification bell icon in header
- [~] 12.5 Navigate to sermon detail when sermon notification is clicked
- [~] 12.6 Add notification bell to the app header/nav bar

---

## Task 13: End-to-End Testing and Polish

### Description
Verify the complete flow works end-to-end and fix any integration issues.

### Steps
- [~] 13.1 Test full flow: pastor creates sermon → members receive notification → member views sermon → pastor sees view analytics
- [~] 13.2 Test scheduled publishing: create scheduled sermon → wait for cron → verify publish + notifications
- [~] 13.3 Test file upload: upload cover image + PDF attachments → verify serving and download
- [~] 13.4 Test access control: member from different network cannot access sermon
- [~] 13.5 Test edge cases: empty network (no members), sermon with no files, very long description
- [~] 13.6 Verify audit logs are created for all sermon mutations
- [~] 13.7 Run `pnpm lint` and `pnpm type-check` to ensure no errors
- [~] 13.8 Add seed data: sample sermons for development testing

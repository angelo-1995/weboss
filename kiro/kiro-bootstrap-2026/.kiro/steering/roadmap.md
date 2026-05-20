# Technical & Functional Roadmap — Community OS

This document captures all pending recommendations, prioritized for implementation.
When the user says "apply the recommendations", follow this order.

---

## Priority 1 — Stability & Confidence

### 1.1 Configure Test Framework
- Install Vitest + @nestjs/testing for API
- Install React Testing Library + Vitest for Web
- Configure turbo test task properly
- Add test scripts to each app's package.json

### 1.2 Write Tests for Critical Flows
- Auth: login, register, refresh token rotation, replay attack detection
- Permissions: RBAC guard, hierarchy visibility
- Users: CRUD, soft delete, stage transitions
- Groups: CRUD, member management, hierarchy constraints
- Cell Reports: creation, validation, pending reports

### 1.3 Integrate Real Email Sending
- Install Nodemailer
- Create EmailService in infrastructure/
- Configure SMTP (Maildev in dev, SES/SendGrid in prod)
- Replace all TODO email logs in:
  - `invitations.service.ts`
  - `password-recovery.service.ts`
  - `notification.processor.ts` (welcome + invitation emails)
- Add email templates (HTML + plain text)

---

## Priority 2 — Complete Core Functionality

### 2.1 Invitations Management UI
- Frontend page: `/invitations` (or within admin)
- Table: list all invitations with status, date, actions
- Create invitation modal (email, group, role)
- Resend/cancel actions
- Connect to existing backend endpoints

### 2.2 Audit Log UI
- Frontend page: `/audit`
- Table with filters: user, action, resource, date range
- Detail view showing old/new values diff
- Export to CSV
- Connect to existing backend endpoint

### 2.3 Networks Management UI
- Frontend page: `/networks`
- Tree visualization of network hierarchy
- CRUD modals for networks
- Leader assignment interface
- Connect to existing backend endpoints

### 2.4 Settings Page
- Change password (connected to auth/change-password endpoint)
- Profile preferences
- Notification preferences
- Theme toggle (if applicable)

---

## Priority 3 — Production Readiness

### 3.1 Dockerfiles
- Create `apps/api/Dockerfile` (multi-stage: build + runtime)
- Create `apps/web/Dockerfile` (Next.js standalone output)
- Uncomment and update docker-compose API service
- Add web service to docker-compose

### 3.2 CI/CD Pipeline
- GitHub Actions workflow:
  - lint → type-check → test → build → deploy
- Environment-specific configs (dev/staging/prod)
- Secrets management

### 3.3 Error Boundaries (React)
- Global error boundary at app level
- Per-feature error boundaries
- Fallback UI components
- Error reporting (Sentry or similar)

### 3.4 Responsive Audit
- Verify all pages on mobile viewports
- Add mobile navigation (hamburger menu or bottom nav)
- Test tables on small screens (horizontal scroll or card view)
- Touch-friendly interactions

### 3.5 Production Environment Variables
- Separate .env.production template
- Document all required env vars
- Add validation for production-only vars (e.g., real SMTP, real DB URL)

---

## Priority 4 — Quality Improvements

### 4.1 Migrate UI Components to @community-os/ui Package
- Move shared components from apps/web/src/components/ui/ to packages/ui/
- Update imports across the web app
- Prepare for future admin panel reuse

### 4.2 Meilisearch Integration
- Either integrate Meilisearch properly for full-text search
- Or remove it from docker-compose to reduce resource usage
- If integrating: index users, groups, sermons on create/update

### 4.3 Standardize Repository Pattern
- Add repository files to: networks, analytics, audit, invitations, permissions
- Remove direct DatabaseService usage from services in those domains

### 4.4 Internationalization (i18n)
- Evaluate need (single-language vs multi-language)
- If needed: install next-intl or similar
- Extract hardcoded strings to translation files
- Standardize: UI in Spanish, code in English

### 4.5 Loading States & Skeletons
- Ensure all data-fetching pages have skeleton loaders
- Add Suspense boundaries where appropriate
- Consistent empty state components

### 4.6 PWA / Offline Support (Future)
- Service worker for offline access
- Push notifications via Web Push API
- Cache critical assets

---

## Technical Debt Tracker

| Item | Location | Severity | Status |
|------|----------|----------|--------|
| No tests | Entire project | 🔴 Critical | ✅ Framework configured (Vitest), placeholder tests added |
| Emails not sent | 4 TODOs in services | 🔴 Critical | ✅ FIXED — Nodemailer integrated, all TODOs replaced |
| Repository pattern inconsistent | networks, analytics, audit | 🟡 Medium | ✅ FIXED — All 5 domains now use repository pattern |
| UI package empty | packages/ui | 🟡 Medium | Pending |
| Meilisearch unused | docker-compose + search module | 🟡 Medium | Pending |
| No error boundaries | apps/web | 🟡 Medium | ✅ FIXED — Global + dashboard + 404 error pages |
| No Dockerfile | apps/api, apps/web | 🟡 Medium | ✅ FIXED — Multi-stage Dockerfiles created |
| Mixed languages in UI | Various components | 🟢 Low | Pending |
| No i18n system | apps/web | 🟢 Low | Pending |

## Completed in Latest Session

- ✅ P1.1 — Test framework (Vitest) configured for API + Web
- ✅ P1.3 — Real email sending (Nodemailer + templates)
- ✅ P2.1 — Invitations Management UI
- ✅ P2.2 — Audit Log UI
- ✅ P2.3 — Networks Management UI
- ✅ P2.4 — Settings Page (change password + notification preferences)
- ✅ P3.1 — Dockerfiles (API + Web + docker-compose updated)
- ✅ P3.2 — CI/CD Pipeline (GitHub Actions)
- ✅ P3.3 — Error Boundaries (global + dashboard + 404)
- ✅ P3.5 — Production environment variables template
- ✅ P4.3 — Repository pattern standardized (5 domains)
- ✅ P4.5 — Loading states & skeletons

---

## Notes

- Always run `pnpm lint && pnpm type-check` after changes
- Follow existing patterns: Zod DTOs, event-driven mutations, audit logging
- New features should include: controller + service + repository + DTOs + tests
- Frontend features should include: service + hooks + components + types

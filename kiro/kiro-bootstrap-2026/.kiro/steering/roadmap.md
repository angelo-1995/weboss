# Technical & Functional Roadmap — WebOSS (Community OS)

This document captures all pending recommendations aligned with the Master Guide vision.
When the user says "apply the recommendations", follow this order.

The platform must feel: modern, premium, spiritual, fast, warm, elegant — NOT cold/corporate.

---

## Phase 0 — Hardening & Polish (Master Guide Alignment)

### 0.1 UX Premium Experience
- Add Framer Motion for page transitions and micro-animations
- Implement smooth route transitions (fade-in, slide-up)
- Add hover micro-interactions on cards and buttons
- Improve dark mode with proper color tokens (warm tones, not pure black)
- Add command palette (Cmd+K) for quick navigation (already exists via CommandSearch, verify quality)
- Ensure consistent spacing system (8px grid)
- Typography audit: ensure Inter/clean font, proper hierarchy

### 0.2 Server Components Optimization
- Audit all pages for unnecessary `'use client'` directives
- Convert data-fetching pages to Server Components where possible
- Move client interactivity to leaf components only
- Add React Suspense boundaries with streaming
- Reduce JS bundle size by eliminating client-side data fetching where RSC can handle it

### 0.3 Design System Formalization
- Create design tokens file (colors, spacing, radii, shadows)
- Document component library (Button variants, Card styles, Badge colors)
- Create Storybook or similar for component documentation
- Ensure all components follow the warm/spiritual/modern aesthetic
- Add gradient accents and subtle spiritual motifs (not religious icons, but warmth)

### 0.4 Table Performance
- Verify all tables use server-side pagination (not client-side)
- Add TanStack Virtual for tables with 100+ rows
- Ensure all search inputs have 300ms debounce
- Add column sorting via API (not client-side sort)
- Implement table state persistence (filters saved in URL params)

### 0.5 Structured Logging Enhancement
- Verify all logs are JSON structured with traceId
- Add request duration logging to all endpoints
- Add slow query detection (log queries > 500ms)
- Suppress debug logs in production
- Add user context (userId) to all log entries

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
- ✅ P3.4 — Mobile Navigation (hamburger + slide-over sidebar)
- ✅ P3.5 — Production environment variables template
- ✅ P4.3 — Repository pattern standardized (5 domains)
- ✅ P4.5 — Loading states & skeletons

---

## Phase 1 — Performance & Security (from Master Guide)

### 1.1 Server-Side Rendering Optimization
- Convert dashboard pages to use RSC data fetching
- Implement streaming with Suspense for slow data
- Add `loading.tsx` to all remaining route segments
- Reduce client-side JavaScript by 40%+

### 1.2 Security Hardening
- Add CSRF protection (double-submit cookie pattern)
- Implement account lockout after 5 failed login attempts
- Add IP-based suspicious activity detection
- Implement session fingerprinting (device + IP)
- Add Content-Security-Policy headers (already have basic, need strict)
- Add Subresource Integrity for external scripts

### 1.3 Caching Strategy
- Implement Redis caching for:
  - User permissions (TTL 5min) — already done
  - Network tree (TTL 10min)
  - Analytics KPIs (TTL 15min)
  - Sermon lists (TTL 2min, invalidate on publish)
- Add HTTP cache headers (ETag, Cache-Control) for static API responses
- Implement stale-while-revalidate pattern on frontend

### 1.4 Database Optimization
- Add missing indexes based on query patterns
- Implement connection pooling (PgBouncer or Prisma connection pool)
- Add slow query logging (> 500ms)
- Optimize N+1 queries in discipleship tree and organigrama
- Add database query monitoring

---

## Phase 2 — Real-time & Analytics (from Master Guide)

### 2.1 Real-time Notifications
- Implement Server-Sent Events (SSE) for live notifications
- Add WebSocket fallback for older browsers
- Real-time notification count update (no polling)
- Live sermon publish notification

### 2.2 Advanced Analytics Dashboard
- Add time-series charts (growth over time)
- Implement cohort analysis (retention by join month)
- Add funnel visualization (GANADO → CONSOLIDADO → DISCIPULADO → ENVIADO)
- Export analytics to PDF/Excel
- Add comparative metrics (this month vs last month)

### 2.3 Redis Integration Enhancement
- Move session storage to Redis (faster than DB)
- Implement rate limiting with Redis (sliding window)
- Add real-time online user count
- Implement distributed locks for concurrent operations

---

## Phase 3 — AI & Automation (from Master Guide)

### 3.1 AI Assistant
- Integrate OpenAI/Claude for intelligent search
- Smart sermon recommendations based on topics
- Automated report summaries
- Natural language queries ("¿cuántos miembros nuevos este mes?")
- AI-powered content suggestions for pastors

### 3.2 Automation Engine
- Automated welcome sequences (new member → email series)
- Birthday/anniversary notifications
- Inactive member alerts (no attendance in 30 days)
- Automated report reminders (cell leaders who haven't submitted)
- Scheduled announcements

### 3.3 Multimedia Module
- Video upload and transcoding (S3 + CloudFront)
- Podcast hosting
- Sermon audio extraction
- Image optimization pipeline
- Media library with tagging

---

## Phase 4 — Mobile & Ecosystem (from Master Guide)

### 4.1 Progressive Web App (PWA)
- Service worker for offline access
- Push notifications via Web Push API
- Install prompt (Add to Home Screen)
- Offline sermon reading
- Background sync for reports

### 4.2 Mobile App (React Native / Flutter)
- Native mobile experience
- Push notifications
- Offline-first architecture
- Camera integration (attendance QR codes)
- Location-based check-in

### 4.3 Public API & Integrations
- REST API documentation (OpenAPI/Swagger) — already exists
- Webhook system for external integrations
- Integration with Planning Center
- Integration with YouTube Live
- Integration with payment processors (donations)

---

## AWS Deployment Roadmap

### Phase A (Current — Development)
- Local Docker Compose ✅
- Maildev for emails ✅
- PostgreSQL local ✅

### Phase B (Staging)
- EC2 t3.medium (API + Web)
- RDS PostgreSQL (db.t3.micro)
- ElastiCache Redis (cache.t3.micro)
- S3 for file uploads
- Cloudflare for CDN + DNS
- Estimated cost: ~$50-80/month

### Phase C (Production)
- ECS Fargate (auto-scaling)
- RDS Multi-AZ
- ElastiCache cluster
- S3 + CloudFront
- SES for emails
- CloudWatch + Grafana
- Estimated cost: ~$150-300/month

### Phase D (Scale)
- ECS with multiple services
- Aurora PostgreSQL
- Redis cluster
- Lambda for async processing
- Step Functions for workflows
- Estimated cost: ~$500+/month

---

## Notes

- Always run `pnpm lint && pnpm type-check` after changes
- Follow existing patterns: Zod DTOs, event-driven mutations, audit logging
- New features should include: controller + service + repository + DTOs + tests
- Frontend features should include: service + hooks + components + types

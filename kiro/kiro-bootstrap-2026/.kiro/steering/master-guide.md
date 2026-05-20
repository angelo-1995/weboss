---
inclusion: auto
---

# WebOSS Master Guide

## Identity

WebOSS is a modern church platform — NOT a corporate/telco system.
It must feel: human, spiritual, modern, fast, clean, organized, emotionally pleasant.

## Language Rules

- Internal code, variables, architecture, docs: ENGLISH
- User-facing UI, messages, errors, responses: SPANISH

## Design Inspiration

Notion, Linear, Stripe Dashboard, Vercel, Discord, Slack, Spotify, Apple, Church Center, Planning Center

## UX Principles

- Premium, smooth, fast, spiritual, modern
- Transitions, micro-animations, skeleton loaders
- Command palette, dark mode, clean typography
- Consistent spacing, responsive-first
- Never cold/corporate — always warm/elegant/technological

## Performance Rules

- Minimize hydration (Server Components first)
- Lazy loading, Suspense, streaming
- Server-side pagination always
- TanStack Table + Virtual for large datasets
- Debounce all search inputs
- Never load full tables client-side
- Detect: loops, RAM, unnecessary renders, slow queries, overfetching

## Backend Rules

- Clean Architecture: controllers → services → repositories → domain
- Small services (single responsibility)
- Strict DTOs with Zod validation
- Structured JSON logging with correlation IDs
- Event-driven: Redis queues for heavy processing
- Never God Services or giant controllers

## Database Rules

- Minimal selects (never `include: { everything: true }`)
- Proper indexes on all filtered/sorted columns
- Cursor-based pagination
- Batch operations for bulk writes
- Raw SQL for complex aggregations
- Avoid N+1 queries

## Security Rules

- Helmet + CSP + Rate limiting
- JWT rotation + Refresh tokens
- CSRF protection
- Audit logs on all mutations
- Never hardcoded secrets
- Input validation on every endpoint

## AWS Strategy

- Phase 1: EC2 + Docker + RDS + S3 + Cloudflare
- Phase 2: ECS Fargate + Redis + ALB + CloudWatch
- Avoid early: Kubernetes, EKS, unnecessary microservices
- Always optimize for cost efficiency

## Observability

- Grafana + Prometheus + Loki + OpenTelemetry
- Track: response time, DB latency, memory, CPU, active users, errors, queue depth

## AI Integration

- Minimize tokens, reuse prompts
- Cache AI responses when possible
- Use for: search, organization, automation, content, analytics

## Spec Rules

Before building anything complex: think → analyze → create spec → validate → then code.
Every spec must answer: Does it scale? RAM impact? Query count? AWS cost? JS bundle size? Can it be simpler?

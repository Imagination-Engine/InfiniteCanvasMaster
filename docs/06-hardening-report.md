# 06 Hardening Report

*This document will be updated continuously as hardening tasks are completed.*

## Security Hardening
- [ ] Implement zero-trust boundaries between frontend and Hono API.
- [ ] Enforce JWT validation and strict CORS.
- [ ] Implement AES-256-GCM encryption for OAuth tokens.

## Data Hardening
- [ ] Validate Drizzle schema migrations.
- [ ] Configure `pgvector` indexes (HNSW or IVFFlat) for performance.

## UI/UX Hardening
- [ ] Keyboard navigation check on all `shadcn/ui` components.
- [ ] Implement Skeleton loaders for lazy-loaded Surface packages.

## Observability
- [ ] Introduce structured logging in Hono.
- [ ] Wire Vercel AI SDK telemetry for token usage tracking.
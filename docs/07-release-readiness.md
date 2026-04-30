# 07 Release Readiness

## Criteria for Production
1. **Zero High-Severity Issues** in Observation Ledger.
2. **100% Core Test Coverage** across `packages/core` and `packages/db`.
3. **Successful Edge Deployment** to Cloudflare without size/CPU limit errors.
4. **Secret Scanning Passing** on `main` branch.
5. **No Placeholders** or mock endpoints in core execution paths (unless explicitly for third-party unavailability fallback).

### Current Status
**NOT READY**. The project is currently in Phase 0 / Phase 1 planning and repository scaffolding. Structural refactoring (monorepo transition) must be completed before feature work begins.
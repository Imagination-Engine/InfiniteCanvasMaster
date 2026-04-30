# 03 Observation Ledger

| ID | Title | Area | Severity | Description | Fix Strategy | Status |
|---|---|---|---|---|---|---|
| OBS-001 | Incomplete Monorepo Migration | Architecture | High | `imagination-canvas/` exists alongside `apps/` and `packages/`, indicating a partial migration. | Move logic from `imagination-canvas` to `apps/web` and `apps/server`. | Open |
| OBS-002 | Legacy Python Runtime | Agent Runtime | Medium | `autogen_exploration/` exists but specs dictate TS + Vercel AI SDK. | Deprecate and port to `packages/agents`. | Open |
| OBS-003 | Missing Package Descriptions | Documentation | Low | `docs/MAP.md` has placeholder descriptions for all packages. | Run documentation primer system / `scripts/docs-map.ts`. | Open |
| OBS-004 | Dual Canvas Engines | Frontend | Medium | Spec mentions both React Flow and tldraw. | Define a strict state abstraction layer in `packages/core` to prevent vendor lock-in to either. | Open |
| OBS-005 | WebContainers Sandbox Limits | Surface Forge | High | WebContainers require specific headers (`Cross-Origin-Isolator`) which may conflict with other surfaces or Cloudflare settings. | Enforce isolation headers at the route/proxy level for Surface D. | Open |
# Simple Edit Failure Diagnosis

## 1. TypeScript / Build Breakage
- **Broken Path Aliases:** `apps/web/tsconfig.app.json` is missing aliases for `@iem/imagination-canvas-kit` and `@iem/chat-interaction-kit`. It relies on standard workspace resolution which may fail if `dist` is missing or `package.json` exports are wrong.
- **Absolute Paths in Vite:** `apps/web/vite.config.ts` uses absolute paths for aliases. This is extremely brittle and can lead to mismatches if the workspace structure is even slightly off in the build environment.
- **Verbatim Module Syntax:** `apps/web` has `verbatimModuleSyntax: true` but imports are inconsistent (some use `import type`, others don't), causing a flood of TS1484 errors during the build.
- **Missing Dependencies:** `@iem/chat-interaction-kit` is missing `lucide-react`, `vitest`, and `framer-motion` from its `package.json`, causing it to fail every build.

## 2. Package / Workspace Breakage
- **Shadowing:** The presence of `dist/` folders in workspace packages sometimes causes Vite or TS to resolve the stale compiled files instead of the live `src/` files.
- **Symlink Health:** `pnpm install` warnings about missing binaries suggest that the workspace symlinks are degraded or corrupted.

## 3. Agent Overwrite / Duplication
- **Fabric vs Bus:** There is a significant architectural overlap/duplication between `packages/core/src/bus` and `packages/core/src/fabric`. Both define similar protocols for message routing.
- **Registry Collision:** `BlockRegistry` exists in both `core` and `imagination-canvas-kit`. The web app might be populating one while the UI components are reading from the other.

## 4. Unsafe Placeholder / Stub Accumulation
- **Demo Mode Bloat:** The `blockRegistry.ts` in `core` has dozens of blocks marked with `demoMode: true`. These are currently "UI-only" with dummy MCP bindings.
- **"For Now" Logic:** Core fabric routing and policy components contain multiple `// For now` blocks that bypass security and filtering logic.
- **Runtime Placeholders:** `packages/core/src/agent/runtime.ts` uses placeholders for latency and resource metrics.

## 5. Broken Tests
- **Module Not Found:** Vitest itself is failing to resolve its own internal CLI in some packages. This points back to `node_modules` corruption.
- **Stale Mocks:** Many React component tests use `vi.mock` for stores that have since changed their internal structure (e.g., `viewportStore` changing from `viewport: {x,y,zoom}` to root `x,y,zoom`).

## Conclusion
The "Simple Edit Failure" is caused by a **Compounding Build Blockade**. One small type error in a core package prevents it from building, which then breaks the aliased import in `apps/web`. Because `apps/web` can no longer compile, Vite serves a stale cached version, making it appear as if the agent is "going in circles" or "not implementing changes".

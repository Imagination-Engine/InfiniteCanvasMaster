# Repo Integration Map — OpenClaw + Mastra + Imagination Canvas

This document maps the OpenClaw + Mastra integration requirements to the existing `imagination-engine` monorepo.

## 1. Frontend Framework

- **Tech:** React 19, Vite, TypeScript.
- **Location:** `apps/web`
- **Notes:** Uses modern React features and Tailwind CSS V4 for styling.

## 2. Canvas Package or Surface

- **Package:** `@iem/imagination-canvas-kit`
- **Location:** `packages/imagination-canvas-kit`
- **Base Tech:** `tldraw` (v3+), `yjs` (shared state), `lucide-react`.
- **Key Files:**
  - `src/contracts/index.ts`: Block kind and object schema.
  - `src/components/ObjectRenderer.tsx`: Registry-based block rendering.
  - `src/state/canvasStore.ts`: Zustand store for canvas objects.

## 3. State Management

- **Primary:** `zustand`
- **Scope:** Canvas objects, selection, viewport, history, expansion, connection, presence.
- **Location:** `packages/imagination-canvas-kit/src/state/`

## 4. Routing / App Shell

- **Library:** `react-router-dom` (V7)
- **Location:** `apps/web/src/main.tsx` and `apps/web/src/App.tsx`

## 5. Design System

- **Framework:** Tailwind CSS (V4)
- **Icons:** `lucide-react`
- **Animation:** `framer-motion`
- **Tokens:** `packages/imagination-canvas-kit/src/tokens/`

## 6. Test Framework

- **Unit/Integration:** `vitest`
- **E2E:** `playwright`
- **Config:** `vitest.config.ts`, `playwright.config.ts`.

## 7. Existing Agents

- **Package:** `@iem/agents`
- **Location:** `packages/agents/src/agents/`
- **Key Agents:** `orchestrator.ts`

## 8. Existing Mastra Usage

- **Package:** `@mastra/core`, `@mastra/pg`, `@mastra/memory`, `@mastra/observability`.
- **Location:** `packages/agents/`
- **Config:** `packages/agents/src/mastra.config.ts`

## 9. Existing OpenClaw Usage

- **Status:** **None found.** This integration introduces the OpenClaw block and runtime binding to the repository.

## 10. Existing Model Routing / Local Inference

- **Libraries:** `@ai-sdk/google`, `@mastra/core`.
- **Status:** Basic model routing exists via AI SDK providers. This integration will formalize the "Compute Policy" for local vs cloud routing.

## 11. Existing Edge Twin / Device Mesh Code

- **Status:** Referenced in docs and as canvas block types (`edge-twin`, `device-mesh`). Actual implementation logic is minimal or reserved for future phases.

## 12. Existing Security / Provenance Primitives

- **Provenance:** `plog-provenance` block kind and `ProvenanceDescriptor` interface found in `@iem/imagination-canvas-kit`.
- **Sandboxing:** `WebContainers` API utilized in `packages/surface-forge` for secure Node.js execution.

## 13. Recommended Integration Path

1. **Extend Contracts:** Add `OpenClawBlock` and related types to `packages/imagination-canvas-kit/src/contracts/`.
2. **Register Block:** Update `BalnceBlockKindSchema` in `@iem/imagination-canvas-kit`.
3. **Implement Adapter:** Create `OpenClawBlockAdapter` in a new package or within `@iem/core` / `@iem/agents`.
4. **Build UI:** Create `OpenClawBlock` components in `packages/imagination-canvas-kit/src/components/blocks/`.
5. **Bind Mastra:** Create Mastra tools and workflows in `packages/agents` that interface with the OpenClaw adapter.
6. **Integrate Policy:** Use the existing sandbox (WebContainers) or define new boundaries for OpenClaw-specific tools.

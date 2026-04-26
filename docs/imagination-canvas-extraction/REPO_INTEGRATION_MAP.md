# Repo Integration Map: Imagination Canvas

This document maps the integration of the new `@iem/imagination-canvas-kit` into the existing Balnce monorepo.

## Existing Architecture

### App Structure

- **apps/web**: React + Vite SPA. Contains the primary UI.
- **apps/server**: Node + Hono backend.
- **packages/core**: Shared logic and block protocols.
- **packages/db**: Drizzle schema and migrations.
- **packages/agents**: Mastra configuration and orchestrator logic.

### Design System

- **Tailwind CSS v4**: Theme variables defined in `apps/web/src/index.css`.
- **Glassmorphism**: Primary aesthetic utilizing `backdrop-blur` and low-opacity borders.
- **Framer Motion**: Utilized for kinetic UI transitions.

### State Management

- **Zustand**: Used in `apps/web/src/store/` for session, user, and view state.
- **React Flow (Legacy)**: Used for the initial prototype canvas (being phased out).
- **Tldraw (Partial)**: Existing partial integration in `apps/web/src/Components/Canvas.tsx`.

## Integration Targets

### Package Location

The new kit will live in `/packages/imagination-canvas-kit/`.

### Consumption Points

1. **Primary Route**: `apps/web/src/Pages/SessionPage.tsx` will be refactored to use the new `CanvasShell` from the kit.
2. **Dashboard**: Canvas previews will be integrated into the creations drawer.
3. **Intent Navigator**: Chat outputs will be wired to the kit's `useCanvasEvents` to trigger object creation.

### Reused vs. Replaced

- **Reused**: `NODE_CATALOG` and `@iem/core` block definitions will drive the `CanvasBlock` metadata.
- **Replaced**: `apps/web/src/Components/Canvas.tsx` will be completely replaced by the kit's `InfiniteViewport`.
- **Replaced**: Existing `scheduler.ts` will be replaced by the kit's execution pipeline.

## Constraints

- **React 19 Compatibility**: Must ensure all kit hooks are compatible with the current React version.
- **Tldraw SDK**: The kit will build upon Tldraw but must wrap its store to support Balnce-specific semantic metadata.
- **No Prop-Drilling**: State must be shared via a dedicated provider or Zustand store within the kit.

## Recommended Integration Path

1. **Parallel Implementation**: Build the kit in the new package directory without touching `apps/web` components initially.
2. **Surface Scaffolding**: Create a internal "Lab" or "Sandbox" route in `apps/web` to test the kit in isolation.
3. **Cutover**: Once Phase 4 is complete, replace the legacy `Canvas.tsx` with the kit's component.

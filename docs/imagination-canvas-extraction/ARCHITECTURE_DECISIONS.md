# Balnce Imagination Canvas Architecture Decisions

This file documents major implementation decisions for the Imagination Canvas.

## ADR-0001: Standalone Package Architecture

### Status

Accepted

### Context

We need to transition from a single-file Tldraw component in `apps/web` to a robust, reusable, and heavily typed spatial system that can eventually support multiple surfaces and agentic co-creation.

### Decision

We will create a standalone package `@iem/imagination-canvas-kit` at `/packages/imagination-canvas-kit/`. This package will house the foundational engine, specialized Balnce blocks, and hooks. The main app will consume this kit via pnpm workspaces.

### Alternatives Considered

- **Direct Refactor:** Modifying `apps/web/src/Components/Canvas.tsx` in place. Rejected because it risks destabilizing the main app during the massive 17-phase overhaul.
- **Custom Canvas from Scratch:** Building a WebGL/Canvas2D engine without Tldraw. Rejected due to the extreme complexity of building pan/zoom and spatial math from zero; Tldraw provides a mature foundation to build upon.

### Consequences

- **Positive:** Clean separation of concerns, easier testing in isolation, future-proof for other "surfaces".
- **Negative:** Initial overhead of package scaffolding and dependency management.

---

## ADR-0002: State Management Strategy

### Status

Proposed

### Context

The canvas requires extremely high-performance state updates for 1,000+ objects and real-time cursor/presence synchronization.

### Decision

We will utilize **Zustand** for transient UI state (selection, camera) and investigate Tldraw's native **TLStore** (using `Signia`) for the core object graph to ensure atomic, reactive updates and deterministic history.

### Alternatives Considered

- **React Context:** Rejected due to performance bottlenecks with frequent updates.
- **Redux:** Rejected as being too verbose for a high-frequency spatial environment.

---

## ADR-0003: Real-Time Synchronization

### Status

Accepted

### Context

The prompt mandates Yjs for real-time collaboration.

### Decision

We will implement a **pure Yjs** provider (self-hosted or P2P) to sync the `TLStore`. We will strictly avoid proprietary cloud backends like Liveblocks as per previous user guidance, ensuring Balnce remains sovereign.

### Alternatives Considered

- **Liveblocks:** Rejected per user's explicit preference for pure Yjs.
- **WebSockets + Manual JSON patches:** Rejected due to the high likelihood of synchronization conflicts; CRDTs (Yjs) are required for spatial robustness.

# Balnce Imagination Canvas Execution Task List

This is the living execution tracker for the full Imagination Canvas implementation. It is updated after every phase.

## Phase 0: Repo Scan, Integration Map, and Reality Check

### TASK: CANVAS-0-1

#### Title

Architecture & Integration Audit

#### Phase

Phase 0

#### Goal

Identify existing frontend/backend boundaries and define the cleanest path for package integration.

#### Files / Areas Expected

- /docs/imagination-canvas-extraction/REPO_INTEGRATION_MAP.md
- /packages/
- apps/web/src/Components/Canvas.tsx

#### Implementation Details

Scan the monorepo for existing state management (e.g., Zustand), design tokens, and the existing Tldraw integration. Map how `@iem/imagination-canvas-kit` will consume these and eventually replace the legacy canvas.

#### Dependencies

None.

#### Acceptance Criteria

- [ ] REPO_INTEGRATION_MAP.md created.
- [ ] Integration path documented.
- [ ] Package boundary defined.

#### Tests Required

- [ ] Static analysis of existing exports.

#### No-Stub Verification

- [ ] No fake integration paths.
- [ ] Reality check confirmed by user.

---

## Phase 1: Canvas Foundation Slice

### TASK: CANVAS-1-1

#### Title

Package & Contract Scaffolding

#### Phase

Phase 1

#### Goal

Initialize the new canvas kit package and core type contracts.

#### Files / Areas Expected

- /packages/imagination-canvas-kit/
- /packages/imagination-canvas-kit/src/contracts/index.ts

#### Implementation Details

Scaffold the package using pnpm. Define base interfaces for `CanvasObject`, `CanvasViewport`, and `CanvasEvent`.

#### Dependencies

TASK: CANVAS-0-1

#### Acceptance Criteria

- [ ] Package compiles.
- [ ] Typed object model exists.

#### Tests Required

- [ ] Unit tests for object schemas (Zod).

#### No-Stub Verification

- [ ] No mock object data hidden in production path.

---

## Phase 2: Camera, Viewport, Pan, Zoom

### TASK: CANVAS-2-1

#### Title

Spatial Engine Implementation

#### Phase

Phase 2

#### Goal

Implement fluid, stable panning and zooming.

#### Files / Areas Expected

- /packages/imagination-canvas-kit/src/hooks/useViewportCamera.ts
- /packages/imagination-canvas-kit/src/components/InfiniteViewport.tsx

#### Implementation Details

Implement math for pointer-anchored zooming and momentum-based panning.

#### Dependencies

TASK: CANVAS-1-1

#### Acceptance Criteria

- [ ] Zooming anchors under pointer.
- [ ] Panning feels smooth (60fps).

#### Tests Required

- [ ] Unit tests for coordinate transformation math.

---

## Phase 3: Object Model, Renderer, Layering

### TASK: CANVAS-3-1

#### Title

Renderer & Layering System

#### Phase

Phase 3

#### Goal

Implement the dispatching renderer and z-index management.

#### Files / Areas Expected

- /packages/imagination-canvas-kit/src/components/ObjectRenderer.tsx
- /packages/imagination-canvas-kit/src/utils/layering.ts

#### Implementation Details

Build a registry of renderers by object type. Implement z-index stable sorting.

#### Dependencies

TASK: CANVAS-2-1

#### Acceptance Criteria

- [ ] Multiple object types render correctly.
- [ ] Layering order is preserved.

#### Tests Required

- [ ] Hit-testing accuracy tests.

---

## Phase 4: Selection, Manipulation, Dragging

### TASK: CANVAS-4-1

#### Title

Interaction Motor Cortex

#### Phase

Phase 4

#### Goal

Implement single/multi selection and direct manipulation handles.

#### Files / Areas Expected

- /packages/imagination-canvas-kit/src/hooks/useCanvasSelection.ts
- /packages/imagination-canvas-kit/src/components/SelectionOverlay.tsx

#### Implementation Details

Implement marquee selection and object dragging with nudge support.

#### Dependencies

TASK: CANVAS-3-1

#### Acceptance Criteria

- [ ] Marquee selection works.
- [ ] Objects can be dragged accurately.

#### Tests Required

- [ ] Selection state transition tests.

---

## [Phases 5 - 17 Summaries]

_Detailed tasks to be expanded upon completion of Phase 4._

- **Phase 5:** Insertion/Clipboard/Drag-Drop.
- **Phase 6:** History/Undo/Persistence.
- **Phase 7:** Core Rich Blocks.
- **Phase 8:** Balnce-Native Blocks (Specialized OS primitives).
- **Phase 9:** Expansion/App-Surface transitions.
- **Phase 10:** Semantic Graph/Clusters.
- **Phase 11:** AI/Agent spatial behaviors.
- **Phase 12:** Presence/Collaboration.
- **Phase 13:** Mobile/Touch/Stylus rules.
- **Phase 14:** Accessibility/Interaction completeness.
- **Phase 15:** Virtualization/Stress testing.
- **Phase 16:** Final Main Product Integration.
- **Phase 17:** No-Stub Audit and Hardening.

# 15 — Gap List and Production Readiness Tracker

## Purpose

This document is the running gap list for the Imagination Canvas. It should be used as the implementation team's source of truth for missing, weak, stubbed, mocked, or immature behavior.

## Usage rules

1. Every discovered gap must be recorded here.
2. Every gap must have owner, severity, affected surface, and acceptance criteria.
3. No gap is closed until verified in product.
4. “Looks done” is not sufficient.
5. Mocked behavior must be treated as incomplete.
6. This document should be updated continuously by humans and agents.

## Gap schema

```md
## GAP-[number]: [Short title]

**Surface:** Canvas / Object / Agent / Mobile / History / etc.  
**Severity:** Critical / High / Medium / Low  
**Status:** Open / In Progress / Blocked / Verified  
**Owner:**  
**Detected by:**  
**Description:**  
**Why it matters:**  
**Required fix:**  
**Acceptance criteria:**  
**Test coverage:**  
**Notes:**
```

## Initial gap categories

### A. Canvas shell gaps

- Missing anchored shell layout.
- Toolbar behavior inconsistent across screen sizes.
- Inspector opens without preserving object visibility.
- No focus mode.
- No presentation mode.
- No split page/canvas mode.
- No minimap/outline alternative for large canvases.
- Mobile shell is compressed desktop.

### B. Camera and viewport gaps

- Pan/zoom not anchored under pointer.
- Trackpad gesture feels unnatural.
- Pinch zoom conflicts with browser.
- No zoom-to-selection.
- No fit-to-content.
- No viewport restoration.
- AI or programmatic changes move camera unexpectedly.
- Large canvas performance degrades.

### C. Object model gaps

- Objects modeled as visual cards only.
- No typed contracts for block capabilities.
- No bindings or semantic connections.
- No expansion descriptor.
- No provenance descriptor.
- No permission model at object level.
- No distinction between shape, block, app, agent, artifact, and memory object.

### D. Selection/manipulation gaps

- Multi-select missing or unstable.
- Marquee selection missing.
- Handles too small.
- Transform behavior inconsistent by object type.
- Group/ungroup missing.
- Locking missing.
- Nested selection undefined.
- Connectors do not follow objects.

### E. Creation gaps

- No slash creation.
- No paste-to-create intelligence.
- No drag/drop semantic conversion.
- No chat-to-canvas placement.
- No AI-generated block insertion.
- No template system.
- Newly created objects are not selected or ready to edit.

### F. Rich editing gaps

- Inline editing conflicts with canvas drag.
- Text editing does not preserve selection.
- Rich blocks cannot expand.
- Embedded media controls interfere with pan/zoom.
- No autosave status.
- Mobile keyboard disrupts canvas.

### G. Connections/organization gaps

- Arrows are decorative only.
- No semantic links.
- No cluster model.
- No AI-assisted clustering.
- No frames/presentation sections.
- No graph overlay.
- No spatial search.

### H. Expansion/app block gaps

- Blocks cannot expand into app surfaces.
- Expansion loses canvas context.
- No breadcrumb return path.
- Fullscreen modes are disconnected routes.
- App runtime state not modeled.
- Failure/loading states blank.

### I. Agent/AI gaps

- AI output appears only in chat, not as spatial blocks.
- Agent actions are not scoped to selected region.
- No mutation previews.
- No human checkpoints.
- No background agent status.
- No execution scope language for local/device mesh/Edge Twin.
- No provenance for generated blocks.

### J. History/persistence gaps

- Undo/redo incomplete.
- Autosave not reliable.
- No snapshots before large transformations.
- No branch/fork.
- No recovery flow.
- Agent changes not auditable.
- Provenance-sensitive blocks lack audit trail.

### K. Collaboration gaps

- No presence model.
- No comments bound to objects/regions.
- No follow mode.
- Permissions too coarse.
- Agent presence indistinct.
- Conflict handling undefined.

### L. Mobile/touch gaps

- Touch targets too small.
- Pinch/pan unreliable.
- Transform handles not touch-friendly.
- No mobile mode simplification.
- No share-sheet/capture flow.
- Inspector not bottom-sheet optimized.
- Multi-select and editing conflicts unresolved.

## Priority order

### Phase 0 — Blockers

- Define object model.
- Define canvas store.
- Define viewport/camera state.
- Implement local persistence.
- Implement basic selection and creation.
- Remove mocks/stubs from critical paths.

### Phase 1 — Core canvas

- Pan/zoom.
- Object rendering.
- Selection.
- Transform.
- Creation.
- Undo/redo.
- Autosave.

### Phase 2 — Rich blocks

- Note.
- Rich text.
- Artifact.
- Chat.
- Agent.
- Goal.
- Memory cluster.

### Phase 3 — Organization

- Connectors.
- Frames.
- Groups.
- Clusters.
- Search.
- AI summarize/cluster.

### Phase 4 — Expansion

- Side inspector.
- Focus mode.
- Fullscreen app block.
- Breadcrumb return.
- Presentation mode.

### Phase 5 — Agentic depth

- Agent tasks.
- Mutation previews.
- Human checkpoints.
- Device mesh/Edge Twin status.
- Background agents.

### Phase 6 — Mobile/collab/polish

- Mobile gestures.
- Bottom sheets.
- Presence.
- Comments.
- Accessibility.
- Reduced motion.
- Performance hardening.

## Definition of verified

A gap can be marked verified only when:

- The behavior is implemented in real code.
- Tests cover the main success and failure path.
- It has been checked on desktop and mobile if applicable.
- It does not rely on mock or placeholder state.
- It meets the acceptance criteria in the relevant spec doc.

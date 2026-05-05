# Specification: Vertical Slice Implementation: Writer's Studio

## Overview

This is Track 6 of the "Studio Capability Manifest" implementation, executing Phase 7 of the master prompt. The objective is to build one complete vertical slice through the new studio architecture to prove out the manifest, registry, and interop patterns. The Writer's Studio is selected for this slice.

## Functional Requirements

1. **Studio Concrete Implementation:**
   - Fully implement the `writersStudio` manifest.
   - Refactor the core `NoteBlock` (or `ProseBlock`) to fully utilize the `BlockComponentProps` including `mode` (`compact`, `fullscreen`).
2. **Artifact Generation & Handling:**
   - Define a `ManuscriptArtifact` type.
   - Ensure the block can produce this artifact and the `StudioInteropResolver` allows it to be passed to a compatible generic tool (like an Export block).
3. **Immersive Runtime View:**
   - Implement the "Deep Surface Runtime" for the Writer's Studio (the immersive fullscreen editor) inside `ImmersiveBlockModal`.

## Acceptance Criteria

- [ ] The Writer's Studio manifest is fully wired and registered.
- [ ] A user can double-click a Writer's Studio block to enter a specialized fullscreen editor.
- [ ] The block correctly declares its inputs and outputs via the `ArtifactRegistry`.

## Out of Scope

- Implementing other studios (Video, Game, etc.).

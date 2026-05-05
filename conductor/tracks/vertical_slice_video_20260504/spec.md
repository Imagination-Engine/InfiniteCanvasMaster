# Specification: Vertical Slice Implementation: Video Studio

## Overview

This track implements the "Deep Surface Runtime" (immersive UI) and specific artifact handling for the Video Studio. It builds upon the foundational registry and interop engines established in prior tracks.

## Functional Requirements

1. **Immersive Runtime View:** Implement the fullscreen/side-panel specialized UI for this studio within `ImmersiveBlockModal`.
2. **Artifact Generation:** Ensure the block correctly implements its specific `ArtifactContract` and produces the expected output payload.
3. **Tool Execution:** Wire the specific tools (if applicable and safe) required for this studio's primary function.

## Acceptance Criteria

- [ ] A user can double-click a Video Studio block to enter its specialized editor.
- [ ] The block successfully produces its designated artifact.

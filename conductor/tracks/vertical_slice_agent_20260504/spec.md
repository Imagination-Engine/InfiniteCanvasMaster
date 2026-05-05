# Specification: Vertical Slice Implementation: Agent Automation Studio

## Overview

This track implements the "Deep Surface Runtime" (immersive UI) and specific artifact handling for the Agent Automation Studio. It builds upon the foundational registry and interop engines established in prior tracks.

## Functional Requirements

1. **Immersive Runtime View:** Implement the fullscreen/side-panel specialized UI for this studio within `ImmersiveBlockModal`.
2. **Artifact Generation:** Ensure the block correctly implements its specific `ArtifactContract` and produces the expected output payload.
3. **Tool Execution:** Wire the specific tools (if applicable and safe) required for this studio's primary function.

## Acceptance Criteria

- [ ] A user can double-click an Agent Automation Studio block to enter its specialized editor.
- [ ] The block successfully produces its designated artifact.

# Specification: Cross-Studio Interoperability & Compatibility Engine

## Overview

This is Track 5 of the "Studio Capability Manifest" implementation, executing Phase 6 of the master prompt. The objective is to build the engines that enforce compatibility rules when users attempt to connect blocks from different studios.

## Functional Requirements

1. **Artifact & Capability Registries:**
   - Implement `ArtifactRegistry` and `CapabilityRegistry` to index all globally available data shapes and behaviors.
2. **Compatibility Resolver:**
   - Implement `StudioInteropResolver` with core functions:
     - `canConnectBlocks(sourceId, targetId)`: Validates if the source's `produces` contract matches the target's `accepts` contract.
     - `suggestCompatibleBlocks(sourceId)`: Returns a list of blocks that can accept the source's output.
3. **Canvas Integration:**
   - Wire `canConnectBlocks` into the `onDrop` edge creation handler to prevent invalid connections and provide visual feedback.

## Acceptance Criteria

- [ ] Resolvers exist and have exhaustive unit test coverage.
- [ ] Attempting to connect a "Text" output to an "Audio" input block fails gracefully.
- [ ] The engine can successfully query for compatible next steps.

## Out of Scope

- Orchestrator UI integration for suggestions (Track 7).

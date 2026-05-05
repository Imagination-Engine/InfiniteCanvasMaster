# Specification: Studio Manifest Type Definitions

## Overview

This is Track 2 of the "Studio Capability Manifest" implementation, corresponding to Phase 2 of the master prompt. The objective is to define the strict TypeScript interfaces and Zod schemas that will form the backbone of the studio ecosystem.

## Functional Requirements

1. **Core Type Definitions:**
   - Define `StudioManifest` interface covering capabilities, tools, runtimes, and artifacts.
   - Define `ToolMount` interface for strict tool registration.
   - Define `ArtifactContract` and `StudioArtifact` interfaces.
   - Define `CapabilityDefinition` and `ModelAlias` types.
   - Define `StudioRuntimeAdapter` and `RuntimeReadiness` states.
   - Define `StudioPermissionPolicy` (sandbox boundaries).

2. **Zod Schema Alignment:**
   - Provide Zod schema equivalents for the core types to enable runtime validation during manifest registration.

## Acceptance Criteria

- [ ] A dedicated `contracts/studio.ts` (or similar) file exists.
- [ ] All required types from Phase 2 are strictly typed and exported.
- [ ] Zod schemas accompany the TypeScript interfaces for runtime validation.

## Out of Scope

- Implementing the actual concrete manifests for specific studios (e.g., Writer's Studio). This is strictly the type definitions.

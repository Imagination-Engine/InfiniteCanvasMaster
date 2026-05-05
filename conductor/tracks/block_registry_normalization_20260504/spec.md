# Specification: Block Registry Normalization & Alignment

## Overview

This is Track 3 of the "Studio Capability Manifest" implementation, corresponding to Phase 3 of the master prompt. The objective is to refactor the core `BlockRegistry` and the definitions of all existing blocks to utilize the new TypeScript contracts introduced in Track 2.

## Functional Requirements

1. **Registry Upgrade:**
   - Update `BlockDefinition` in `@iem/core` to include new mandatory fields: `studioAffinity`, `category`, `capabilities`, `accepts`, `produces`, `modelAliases`, `toolMountIds`, `runtimeKind`, `fabricLanes`, `demoMode`, `securityClass`.
   - Update the validation schemas.
2. **Block Normalization:**
   - Refactor the 51 existing block registrations (across Scribe, Playable, Atlas, Reel, Core) to populate these new fields accurately based on the Discovery Audit (Track 1).
3. **Strict Validation:**
   - Ensure the `register` function rejects blocks that do not adhere to the new strict typing.

## Acceptance Criteria

- [ ] `BlockDefinition` interface and schema are fully upgraded.
- [ ] All existing blocks compile successfully with the new required fields.
- [ ] The core registry correctly validates the new shape.

## Out of Scope

- Building new UI to display these fields on the canvas (this will happen in later tracks).

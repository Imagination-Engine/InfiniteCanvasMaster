# Track Risk Register

> Generated: 2026-05-18 | Track: `studio_capability_discovery_20260504`

---

## Critical Risks (High Impact, High Probability)

### R1: `@ts-nocheck` Disables All Type Safety

- **Location:** `packages/core/src/block/protocol.ts` (line 1), `packages/core/src/block/registry.ts` (line 1)
- **Impact:** HIGH — Removing `@ts-nocheck` will surface potentially hundreds of type errors across the entire block ecosystem. Every `BlockDefinition<any, any>` instantiation bypasses generics.
- **Mitigation:** Remove `@ts-nocheck` gradually. First add new fields as optional, then tighten once all blocks comply. Run `tsc --noEmit` iteratively.

### R2: Duplicate Block IDs Across Packages

- **Location:** Core `registry.ts` registers blocks like `iem.reel.camera`; `surface-reel/mediaBlocks.ts` exports its own `cameraBlock` with the same ID pattern. Same duplication exists for playable, atlas, conductor blocks.
- **Impact:** HIGH — Last-write-wins in the registry. Import order determines which definition is active. Could cause runtime inconsistencies.
- **Mitigation:** Establish a single source of truth. Surface packages should either (a) register into the global `blockRegistry` and not re-export, or (b) the core registry should delegate to surfaces. Pick one pattern.

### R3: Surface Blocks Use Non-Standard Categories

- **Location:** `surface-reel` uses `"media"`, `surface-conductor` uses `"control"`, `"trigger"`, `"io"`, `"data"`, `"web"`, `"productivity"`, `"ai"`. `surface-atlas` uses `"knowledge"`.
- **Impact:** MEDIUM — These don't match the `BlockDefinition.category` union defined in `protocol.ts`. Currently masked by `| string` escape hatch.
- **Mitigation:** Either expand the official category union or normalize surface blocks to use existing categories.

---

## Moderate Risks (Medium Impact)

### R4: No Formal Block Registration Pipeline

- **Impact:** MEDIUM — Blocks are registered via side effects (importing `registry.ts` triggers all `createBlock` calls). Surface blocks are exported but never registered with the global registry unless explicitly imported.
- **Mitigation:** Create a formal `initializeBlocks()` entry point that registers all blocks from all surfaces.

### R5: Agent/Tool Bindings Are Mostly Mocks

- **Impact:** MEDIUM — Of the ~160 blocks, only 3 have real API integrations (NanoBanana, ElevenLabs, Gemini via agentRuntime). The `ToolMountRegistry` will need to bridge mock bindings to real tool providers.
- **Mitigation:** The `ToolMount` system should explicitly mark mounts as `mock | configured | active`. The manifest verification (Track 8) should flag unimplemented mounts.

### R6: Missing `ImmersiveBlockModal` Foundation

- **Impact:** MEDIUM — The vertical slice specs reference `ImmersiveBlockModal` for fullscreen studio editing. This component may not exist yet.
- **Mitigation:** Verify existence in `apps/web`. If missing, add as a prerequisite before Track 6.

### R7: No Existing `contracts/` or `studio/` Directory in Core

- **Impact:** LOW — Track 2 creates new files. No merge conflicts expected, but the export path needs to be wired into `packages/core/src/index.ts`.
- **Mitigation:** Standard file creation, just ensure barrel exports are updated.

---

## Low Risks

### R8: Core Creative Blocks Are Loosely Typed

- **Location:** `packages/core/src/blocks/creative/*.ts` (9 blocks)
- **Impact:** LOW — These blocks predate the `BlockDefinition` interface evolution. They may use an older shape.
- **Mitigation:** Normalize during Track 3.

### R9: Build System Compatibility

- **Impact:** LOW — Adding new TypeScript files and Zod schemas should be compatible with existing Vite/TSC pipeline.
- **Mitigation:** Monitor `pnpm build` after each track.

---

## Risk Summary Matrix

| Risk                            | Impact | Probability | Priority |
| ------------------------------- | ------ | ----------- | -------- |
| R1: `@ts-nocheck` removal       | High   | High        | **P0**   |
| R2: Duplicate block IDs         | High   | High        | **P0**   |
| R3: Non-standard categories     | Medium | High        | **P1**   |
| R4: No registration pipeline    | Medium | Medium      | **P1**   |
| R5: Mock agent bindings         | Medium | Medium      | **P2**   |
| R6: Missing ImmersiveBlockModal | Medium | Low         | **P2**   |
| R7: No contracts directory      | Low    | Low         | **P3**   |
| R8: Loose creative block types  | Low    | Medium      | **P3**   |
| R9: Build compatibility         | Low    | Low         | **P3**   |

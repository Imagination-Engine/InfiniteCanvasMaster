# 20 — Track / Task / Subtask Queue

## Track 0 — Discovery

- T0.1 Read specs and current canvas/block code.
- T0.2 Inventory all blocks and registry fields.
- T0.3 Inventory existing dependencies.
- T0.4 Inventory fabric/orchestrator/runtime hooks.
- T0.5 Create `26-current-capability-matrix.md`, `27-generated-task-breakdown.md`, `28-track-risk-register.md`.

## Track 1 — Manifest Types

- T1.1 StudioManifest.
- T1.2 ToolMount.
- T1.3 ArtifactContract.
- T1.4 CapabilityRegistry.
- T1.5 ModelAlias.
- T1.6 RuntimeAdapter.
- T1.7 Tests.

## Track 2 — Registry Normalization

- Add studioAffinity, capabilities, accepts/produces, modelAliases, toolMountIds, runtimeKind, fabricLanes, securityClass to all existing blocks.

## Track 3 — Studio Manifests

- Create seven manifests and validation tests.

## Track 4 — Tool Mount Registry

- Register all candidate tools with status, adapter name, permissions, mount mode.

## Track 5 — Cross-Studio Resolver

- Implement compatibility and suggestions.

## Tracks 6-12 — Vertical Studio Slices

Each slice includes one rich minimized block, one expanded surface, one artifact output, one runtime readiness panel, one orchestrator command/suggestion, one test.

## Track 13 — Cross-Studio Demo

Flow: Intent Chat → Research Brief → Writer Script → Video Storyboard → App Landing Page → Commerce Intentcast Demo → Output Compiler.

## Track 14 — Hardening

Search for fake live runtime, missing manifest data, hardcoded model strings, direct tool imports, unsafe shell/network access, generic cards, untested resolver logic.

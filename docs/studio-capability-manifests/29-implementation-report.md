# Studio Capability Manifest — Implementation Report

> Generated: 2026-05-19 | Tracks 1–14 (Studio Capability Manifest program)

## Summary

Tracks 1–5 established the studio manifest substrate (types, registry normalization, manifest registration, cross-studio interop). Tracks 6–14 completed vertical studio slices, orchestrator awareness, and verification of the integrated stack.

## Architectural Changes

### Core (`packages/core`)

| Module                              | Purpose                                                              |
| ----------------------------------- | -------------------------------------------------------------------- |
| `src/studio/contracts.ts`           | `StudioManifest`, `ArtifactContract`, `ToolMount`, `StudioId`        |
| `src/studio/schemas.ts`             | Zod validation for manifests                                         |
| `src/studio/manifests/index.ts`     | All 12 studio manifests + `ToolMountRegistry`                        |
| `src/studio/interop.ts`             | `ArtifactRegistry`, `CapabilityRegistry`, `StudioInteropResolver`    |
| `src/studio/artifacts.ts`           | Typed artifact payloads + builders (manuscript, video-project, etc.) |
| `src/studio/orchestratorContext.ts` | Capability summaries and connectability helpers for the orchestrator |
| `src/block/registry.ts`             | Normalized `accepts` / `produces` / `capabilities` for 87+ blocks    |

### Canvas Kit (`packages/imagination-canvas-kit`)

| Module                                        | Purpose                                                 |
| --------------------------------------------- | ------------------------------------------------------- |
| `src/components/blocks/studio/`               | Dual-mode studio block components (compact + immersive) |
| `src/components/blocks/NoteBlock.tsx`         | Dual-mode note editor with `ManuscriptArtifact` export  |
| `src/hooks/useOrchestratorContext.ts`         | Registry-aware selection context                        |
| `src/utils/orchestratorSuggestions.ts`        | Connectability Q&A + suggestion chips                   |
| `src/components/ObjectRenderer.tsx`           | `canConnectBlocks` enforcement on edge drop             |
| `src/components/FloatingOrchestratorChat.tsx` | Suggestion chips + registry-aware replies               |

### Agents (`packages/agents`)

| Module                       | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `src/agents/orchestrator.ts` | Dynamic studio capability summary in system prompt |

## Vertical Slices Delivered (Tracks 6–12)

| Studio                  | Block ID                | Artifact Contract | Immersive Editor |
| ----------------------- | ----------------------- | ----------------- | ---------------- |
| Writer's Studio         | `iem.studio.writer`     | `manuscript`      | Yes              |
| Video Studio            | `iem.studio.video`      | `video-project`   | Yes              |
| Game Studio             | `iem.studio.game`       | `game-project`    | Yes              |
| App Creation Studio     | `iem.studio.app`        | `app-project`     | Yes              |
| Commerce Studio         | `iem.studio.commerce`   | `storefront`      | Yes              |
| Agent Automation Studio | `iem.studio.automation` | `workflow-config` | Yes              |
| Research Studio         | `iem.studio.research`   | `research-brief`  | Yes              |

Double-click / expand opens the studio editor inside `ImmersiveBlockModal` via `BlockRegistry` resolution with `mode: "fullscreen"`.

## Orchestrator Awareness (Track 13)

- `useOrchestratorContext` exposes `blockContext`, `compatibleBlocks`, and `missingToolMounts`.
- Floating orchestrator answers “What can I connect to this block?” using `StudioInteropResolver`.
- Suggestion chips surface compatible downstream blocks for the selected block.
- Mastra orchestrator system prompt includes `buildStudioCapabilitySummary()`.

## Verification (Track 14)

| Check                               | Result                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `@iem/core` build                   | Pass                                                                         |
| `@iem/core` tests (73)              | Pass                                                                         |
| `@iem/imagination-canvas-kit` build | Pass                                                                         |
| `@iem/agents` build                 | Pass                                                                         |
| New track unit tests                | Pass (artifacts, interop, studio blocks, orchestrator context)               |
| Full monorepo `vitest`              | Pre-existing failures in legacy canvas-kit tests (localStorage persist mock) |

## Registry State

- **Studios registered:** 12 manifests in `ALL_STUDIO_MANIFESTS`
- **Tool mounts:** 8 seeded (`gemini-chat`, `elevenlabs-tts`, etc.); most external mounts remain `mock`
- **Interop:** `canConnectBlocks` uses block-level `produces` / `accepts` with `any` wildcard support

## Technical Debt / Follow-ups

1. **Canvas connection UX:** Invalid drops are rejected silently; add red highlight + tooltip (T5-7).
2. **Tool mount configuration UI:** Orchestrator warns about mock mounts; no settings drawer yet.
3. **Legacy canvas-kit test suite:** Many tests fail under Node 22 `localStorage` experimental flag; needs shared vitest setup mock.
4. **Agent Automation vs Agent Studio:** Vertical slice uses `iem.studio.automation` (workflow-config); `agent-studio` manifest blocks (`iem.agent.*`) share immersive patterns via existing `AgentBlock`.
5. **Full monorepo CI green:** Run `npx turbo run build test lint typecheck` after addressing legacy test infrastructure.

## Files Touched (Tracks 6–14)

- `packages/core/src/studio/artifacts.ts`
- `packages/core/src/studio/orchestratorContext.ts`
- `packages/core/src/studio/*.test.ts`
- `packages/imagination-canvas-kit/src/components/blocks/studio/*`
- `packages/imagination-canvas-kit/src/components/blocks/NoteBlock.tsx`
- `packages/imagination-canvas-kit/src/hooks/useOrchestratorContext.ts`
- `packages/imagination-canvas-kit/src/utils/orchestratorSuggestions.ts`
- `packages/imagination-canvas-kit/src/components/ObjectRenderer.tsx`
- `packages/imagination-canvas-kit/src/components/FloatingOrchestratorChat.tsx`
- `packages/agents/src/agents/orchestrator.ts`
- `conductor/tracks.md`

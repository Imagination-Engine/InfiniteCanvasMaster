# 21 — Master Implementation Prompt

You are working inside the Balnce / Imagination Canvas repository.

Your mission is to implement the Studio Capability Manifest layer that sits on top of the canvas remediation work.

The canvas can mix elements from any studio. Each studio has a manifest, but studios are not silos. The manifests define capabilities, tools, models, runtime adapters, artifact outputs, security boundaries, and UI surfaces. The canvas composes them.

## Required Reading

Read:

```txt
/docs/studio-capability-manifests/
/docs/imagination-canvas-block-runtime-library/
/docs/balnce-message-fabric-refactor/
/docs/imagination-canvas-extraction/
```

Inspect:

```txt
packages/**/block*
packages/**/registry*
packages/**/canvas*
packages/**/studio*
packages/**/fabric*
packages/**/mastra*
package.json
pnpm-workspace.yaml
tsconfig*
```

## Hard Rules

1. Do not install new dependencies until ToolMount evaluation exists.
2. Do not create fake live runtimes.
3. Do not make studios isolated apps.
4. Do not bypass the block registry.
5. Do not hardcode Gemini model names in block code.
6. Use model aliases.
7. Use Message Fabric lanes correctly.
8. Every tool must mount through ToolMount registry.
9. Every studio must produce/accept artifact contracts.
10. Every block remains composable on the canvas with blocks from other studios.
11. Do not expose OpenCove as product-facing name.
12. Use ImagiClaw as product-facing name for OpenClaw-inspired blocks.
13. Do not expose Aura, Device Mesh, Edge Twin, Identity as current product UI.
14. Commerce/Wallet/Checkout/Intentcasting are demo-choreographed unless real connectors exist.

## Phase 1 — Discovery Only

Create:

```txt
/docs/studio-capability-manifests/26-current-capability-matrix.md
/docs/studio-capability-manifests/27-generated-task-breakdown.md
/docs/studio-capability-manifests/28-track-risk-register.md
```

The matrix must include:

| Studio | Block | Current UI | Needed UI | Current Runtime | Needed Runtime | Model Aliases | Tool Mounts | Accepts | Produces | Status | Risk | Priority |
| ------ | ----- | ---------- | --------- | --------------- | -------------- | ------------- | ----------- | ------- | -------- | ------ | ---- | -------- |

Do not implement code until these exist.

## Phase 2 — Manifest Types Only

Implement TypeScript contracts for StudioManifest, ToolMount, ArtifactContract, StudioArtifact, CapabilityDefinition, ModelAlias, StudioRuntimeAdapter, RuntimeReadiness, StudioPermissionPolicy.

## Phase 3 — Registry Normalization

Normalize existing blocks to include studioAffinity, category, capabilities, accepts, produces, modelAliases, toolMountIds, runtimeKind, fabricLanes, demoMode, securityClass.

## Phase 4 — Studio Manifests

Create manifest files for Writer, Video, Game, App Creation, Commerce, Agent, Research.

## Phase 5 — Tool Mount Registry

Register researched tools. Do not fully integrate them unless already present and low-risk.

## Phase 6 — Cross-Studio Compatibility

Implement ArtifactRegistry, CapabilityRegistry, StudioInteropResolver, suggestCompatibleBlocks, getBlocksByCapability, getStudiosForArtifact, canConnectBlocks.

## Phase 7 — One Vertical Slice

Choose one studio slice based on existing repo readiness. Prefer Writer's Studio if no strong video/app dependencies exist yet.

The slice must include one rich minimized block, one expanded surface, one artifact output, one runtime readiness panel, one block chat/control affordance, and one cross-studio export path.

## Phase 8 — Orchestrator Awareness

The orchestrator must read studio manifests, block capabilities, accepts/produces, runtime readiness, compatible next blocks, and missing tool mounts. It should suggest, not over-execute.

## Phase 9 — Verification

Run typecheck, lint, tests, build. Create `/docs/studio-capability-manifests/29-implementation-report.md`.

## Final Goal

The user should be able to open the canvas, drag blocks from any studio, see what each block can do, and trust that each block has a real capability manifest behind it, even when runtime is not connected.

The point is not pretty cards. The point is to encode creative power into the canvas.

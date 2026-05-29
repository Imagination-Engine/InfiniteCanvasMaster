# Generated Task Breakdown

> Generated: 2026-05-18 | Track: `studio_capability_discovery_20260504`
> Based on gaps identified in `26-current-capability-matrix.md`

---

## Phase 2: Studio Manifest Type Definitions (Track 2)

- [ ] **T2-1:** Create `packages/core/src/studio/contracts.ts`
  - [ ] Define `StudioId` string literal union (all 12 studios)
  - [ ] Define `StudioManifest` interface: `id`, `name`, `description`, `icon`, `accent`, `blocks`, `capabilities`, `toolMounts`, `artifactContracts`, `runtimeAdapter`, `permissions`
  - [ ] Define `ToolMount` interface: `id`, `name`, `description`, `provider`, `configSchema`, `execute`
  - [ ] Define `ArtifactContract` interface: `id`, `mimeType`, `schema`, `producedBy`, `acceptedBy`
  - [ ] Define `StudioArtifact` interface: `contractId`, `data`, `metadata`, `timestamp`
  - [ ] Define `CapabilityDefinition` type: `id`, `name`, `description`, `requiresToolMounts`
  - [ ] Define `ModelAlias` type: `alias`, `provider`, `model`, `fallbacks`
  - [ ] Define `StudioRuntimeAdapter` interface: `kind`, `initialize`, `dispose`, `getReadiness`
  - [ ] Define `RuntimeReadiness` enum: `ready`, `degraded`, `unavailable`, `configuring`
  - [ ] Define `StudioPermissionPolicy` interface: `sandboxLevel`, `networkAccess`, `fileSystemAccess`, `maxConcurrency`
- [ ] **T2-2:** Create Zod schemas in `packages/core/src/studio/schemas.ts`
  - [ ] `StudioManifestSchema`
  - [ ] `ToolMountSchema`
  - [ ] `ArtifactContractSchema`
  - [ ] `CapabilityDefinitionSchema`
  - [ ] `ModelAliasSchema`
  - [ ] `StudioPermissionPolicySchema`
- [ ] **T2-3:** Export from `packages/core/src/index.ts`

---

## Phase 3: Block Registry Normalization (Track 3)

- [ ] **T3-1:** Remove `@ts-nocheck` from `packages/core/src/block/protocol.ts`
- [ ] **T3-2:** Add new mandatory fields to `BlockDefinition` interface:
  - [ ] `studioAffinity: StudioId | StudioId[]` — replaces loose `studio?: string`
  - [ ] `modelAliases?: ModelAlias[]`
  - [ ] `toolMountIds?: string[]`
  - [ ] `runtimeKind: RuntimeKind` (stricter union than current `runtime`)
  - [ ] `fabricLanes?: string[]`
  - [ ] `securityClass?: 'public' | 'internal' | 'sandbox' | 'isolated'`
- [ ] **T3-3:** Update `createBlock` helper to require new fields with sensible defaults
- [ ] **T3-4:** Normalize all 87 core registry blocks with populated `accepts`, `produces`, `studioAffinity`
- [ ] **T3-5:** Normalize surface-reel 12 blocks with correct `category` enum values
- [ ] **T3-6:** Normalize surface-conductor 14 blocks with correct `category` enum values
- [ ] **T3-7:** Normalize surface-atlas 12 blocks with correct `category` enum values
- [ ] **T3-8:** Normalize surface-playable 15 blocks with correct `category` enum values
- [ ] **T3-9:** Normalize surface-scribe 7 blocks with typed schemas
- [ ] **T3-10:** Normalize surface-forge 4 blocks with correct fields
- [ ] **T3-11:** Add validation in `BlockRegistry.register()` to reject malformed definitions
- [ ] **T3-12:** Remove duplicate block registrations across core and surface packages

---

## Phase 4–5: Studio Manifest Registration (Track 4)

- [ ] **T4-1:** Create `packages/core/src/studio/manifests/` directory
- [ ] **T4-2:** Implement `writerStudioManifest` — blocks, toolMounts, artifacts
- [ ] **T4-3:** Implement `videoStudioManifest`
- [ ] **T4-4:** Implement `gameStudioManifest`
- [ ] **T4-5:** Implement `appCreationStudioManifest`
- [ ] **T4-6:** Implement `commerceStudioManifest`
- [ ] **T4-7:** Implement `agentStudioManifest`
- [ ] **T4-8:** Implement `researchStudioManifest`
- [ ] **T4-9:** Implement `knowledgeStudioManifest`
- [ ] **T4-10:** Implement `automationStudioManifest`
- [ ] **T4-11:** Implement `launchStudioManifest`
- [ ] **T4-12:** Implement `mediaStudioManifest`
- [ ] **T4-13:** Implement `brandStudioManifest`
- [ ] **T4-14:** Create `ToolMountRegistry` class with `register()`, `get()`, `list()`, `validate()`
- [ ] **T4-15:** Seed `ToolMountRegistry` with discovered tools (ElevenLabs, NanoBanana, OpenAI Embeddings, Pinecone, Gemini)

---

## Phase 6: Cross-Studio Interop (Track 5)

- [ ] **T5-1:** Create `ArtifactRegistry` — indexes all `ArtifactContract` instances
- [ ] **T5-2:** Create `CapabilityRegistry` — indexes all `CapabilityDefinition` instances
- [ ] **T5-3:** Implement `StudioInteropResolver.canConnectBlocks(sourceId, targetId)`
- [ ] **T5-4:** Implement `StudioInteropResolver.suggestCompatibleBlocks(sourceId)`
- [ ] **T5-5:** Write unit tests: text→audio connection fails, text→text connection succeeds
- [ ] **T5-6:** Wire `canConnectBlocks` into canvas edge creation handler (frontend)
- [ ] **T5-7:** Add visual feedback for invalid connections (red highlight, tooltip)

---

## Phase 7: Vertical Slices (Track 6)

- [ ] **T6-1:** Writer's Studio — implement `ManuscriptArtifact` type
- [ ] **T6-2:** Writer's Studio — dual-mode NoteBlock (compact vs fullscreen)
- [ ] **T6-3:** Writer's Studio — immersive fullscreen editor in `ImmersiveBlockModal`
- [ ] **T6-4:** Video Studio — implement `VideoProjectArtifact` type
- [ ] **T6-5:** Video Studio — immersive timeline editor
- [ ] **T6-6:** Game Studio — implement `GameProjectArtifact` type
- [ ] **T6-7:** Game Studio — immersive game editor
- [ ] **T6-8:** App Creation Studio — implement `AppProjectArtifact` type
- [ ] **T6-9:** Commerce Studio — implement `StorefrontArtifact` type
- [ ] **T6-10:** Agent Studio — implement `AgentConfigArtifact` type
- [ ] **T6-11:** Research Studio — implement `ResearchBriefArtifact` type

---

## Phase 8: Orchestrator Awareness (Track 7)

- [ ] **T7-1:** Expand `useOrchestratorContext` to query `StudioInteropResolver`
- [ ] **T7-2:** Inject studio capability summaries into orchestrator system prompt
- [ ] **T7-3:** Implement "What can I connect to this block?" response logic
- [ ] **T7-4:** Implement missing tool mount detection and guidance messaging
- [ ] **T7-5:** Add suggestion chips UI for compatible next-step blocks

---

## Phase 9: Final Verification (Track 8)

- [ ] **T8-1:** Full `pnpm build` — 0 errors
- [ ] **T8-2:** Full `pnpm vitest run` — 0 failures
- [ ] **T8-3:** Full `pnpm lint` — 0 errors
- [ ] **T8-4:** Full `pnpm typecheck` — 0 errors
- [ ] **T8-5:** Generate `29-implementation-report.md`

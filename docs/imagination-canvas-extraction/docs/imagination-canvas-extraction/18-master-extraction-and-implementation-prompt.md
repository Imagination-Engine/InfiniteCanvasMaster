# 18 — Master Extraction and Implementation Prompt

Use this prompt with a human team, coding agent, or agentic IDE/CLI.

---

# Imagination Canvas Extraction and Implementation Mission

You are implementing the Balnce Imagination Canvas: an infinite, agentic, spatial creation environment where every object can become a note, artifact, app, workflow, agent, goal, memory cluster, or commerce relationship.

Your job is to extract mature interaction grammar from tldraw-style infinite canvas systems and AFFiNE-style edgeless/page hybrid workspaces, then translate that into a production-grade Balnce-native implementation.

This is not a cloning task.
This is not a visual mimicry task.
This is not a prototype-only task.
This is a production interaction-systems task.

## Reference interpretation

Use tldraw as a reference for:

- Infinite canvas engine behavior.
- Camera/pan/zoom.
- Shapes and custom shape model.
- Selection and transforms.
- Bindings between objects.
- Tools and direct manipulation.
- Light, fast spatial editing.

Use AFFiNE as a reference for:

- Edgeless canvas + page mode hybrid.
- Block-based documents.
- Rich content on canvas.
- Linked pages, embeds, databases, notes, and whiteboard behavior.
- Switching between structured writing and spatial thinking.

Do not copy either product's brand, exact UI, or visual identity.
Extract interaction laws and rebuild them for Balnce.

## Balnce-specific product intent

The Imagination Canvas is:

- The infinite space where users create anything.
- The visual counterpart to the Intent Navigator.
- A canvas where chat outputs become blocks.
- A place where every block can become a mini-app or full app.
- A place where agents can work visibly and safely.
- A personal AI OS surface for memory, goals, artifacts, commerce, and identity.
- A sovereign, local-first, agentic workspace.

## Required doc set

Create and maintain:

```txt
/docs/imagination-canvas-extraction/
  01-canvas-philosophy-and-target-state.md
  02-shell-and-layout-audit.md
  03-viewport-and-camera-behavior.md
  04-object-model-and-content-grammar.md
  05-selection-manipulation-and-transformations.md
  06-object-creation-and-insertion-flows.md
  07-rich-editing-and-embedded-content.md
  08-connections-clusters-and-spatial-organization.md
  09-expansion-transitions-and-app-blocks.md
  10-agent-and-ai-behaviors-on-canvas.md
  11-history-persistence-and-versioning.md
  12-collaboration-presence-and-comments.md
  13-mobile-touch-and-stylus-rules.md
  14-design-token-map.md
  15-gap-list.md
  16-component-implementation-plan.md
  17-balnce-native-blocks.md
```

Do not skip the gap list. It is the anti-drift artifact.

## Required package target

Create or implement:

```txt
/packages/imagination-canvas-kit
```

With:

### Components

- CanvasShell
- InfiniteViewport
- CanvasToolbar
- FloatingInspector
- SideInspector
- LayerPanel
- Minimap
- SelectionOverlay
- TransformHandles
- ObjectRenderer
- ConnectorLayer
- ContextMenu
- QuickAddMenu
- CanvasCommandPalette
- CanvasBreadcrumbs
- ExpandableBlockFrame
- PresenceLayer
- NoteCard
- RichTextBlock
- ArtifactBlock
- ChatBlock
- AgentBlock
- GoalBlock
- MemoryClusterBlock
- ResearchStreamBlock
- IntentBlock
- OfferCommerceBlock
- IdentityWalletBlock
- WorkflowBlock
- KnowledgePodBlock
- AppBlock
- AuraBlock
- PlogProvenanceBlock
- EdgeTwinBlock
- DeviceMeshBlock

### Hooks

- useViewportCamera
- useCanvasSelection
- useTransformHandles
- useObjectCreation
- useCanvasClipboard
- useCanvasDragDrop
- useCanvasShortcuts
- useBlockExpansion
- useCanvasHistory
- useSpatialNavigation
- useSemanticGrouping
- usePresenceLayer
- useAgentOnCanvas

### Stores

- canvasStore
- viewportStore
- selectionStore
- objectGraphStore
- historyStore
- presenceStore
- inspectorStore

### Contracts

- CanvasObject
- CanvasBlock
- CanvasConnection
- CanvasBinding
- CanvasViewport
- CanvasSelection
- CanvasEvent
- ExpansionSurface
- AgentCanvasTask
- BalnceBlock

## Non-negotiable rules

1. No production path may rely on mocks, stubs, fake state, or placeholder behavior.
2. Every object must have a typed record.
3. Every relationship must be a connection or binding.
4. Every mutation must be undoable or explicitly non-undoable by design.
5. Every agent action must be scoped, inspectable, and reversible or checkpointed.
6. Every expansion must preserve return context.
7. Every mobile behavior must be designed intentionally, not inherited accidentally from desktop.
8. Every consequential action involving identity, commerce, memory, data sharing, or AURA must require a human checkpoint.
9. Every AI-created object must include source/provenance metadata.
10. Every feature must have acceptance criteria and tests.

## Implementation sequence

### Phase 0 — Audit and map

- Read the existing frontend implementation.
- Create `/docs/imagination-canvas-extraction/15-gap-list.md`.
- Record every missing, weak, mocked, stubbed, or immature interaction.
- Identify all current canvas-like surfaces, chat-to-artifact flows, block systems, and app containers.
- Map current implementation against this document set.

### Phase 1 — Core architecture

Implement:

- Canvas object contracts.
- Canvas store.
- Viewport/camera store.
- Selection store.
- Mutation/history model.
- Base rendering layer.
- Local persistence.

Acceptance:

- Objects can be created, selected, moved, updated, deleted, persisted, and restored.
- Camera state persists.
- Mutations are typed.

### Phase 2 — Viewport and manipulation

Implement:

- Pan/zoom.
- Pointer-anchored zoom.
- Fit-to-content.
- Zoom-to-selection.
- Marquee selection.
- Multi-select.
- Transform handles.
- Group/ungroup.
- Lock/unlock.
- Snapping/guides.

Acceptance:

- Manipulation feels precise on desktop.
- Touch path is not broken.
- Connectors and bindings can follow moved objects.
- Transform operations are undoable.

### Phase 3 — Creation flows

Implement:

- Toolbar create.
- Quick-add.
- Slash command.
- Type-to-create.
- Paste-to-create.
- Drag/drop.
- Chat-to-canvas.
- AI-generated block insertion.

Acceptance:

- User can create objects from all primary channels.
- Newly created objects appear in expected location and are selected.
- Batch creation is undoable.
- Unsupported inputs fail gracefully.

### Phase 4 — Core Balnce blocks

Implement at least:

- NoteCard.
- RichTextBlock.
- ArtifactBlock.
- ChatBlock.
- AgentBlock.
- GoalBlock.
- MemoryClusterBlock.
- IntentBlock.
- OfferCommerceBlock.
- AppBlock.
- EdgeTwinBlock.
- DeviceMeshBlock.

Acceptance:

- Each block has compact, selected, inspect, expanded, loading, error, and activity states.
- Consequential blocks have permission/provenance affordances.
- Blocks can connect to each other semantically.

### Phase 5 — Expansion system

Implement:

- Peek.
- Inline expansion.
- Side inspector.
- Focus region.
- Fullscreen app expansion.
- Breadcrumb return.
- Loading/error/recovery states.

Acceptance:

- Block opens from canvas position.
- User can return to previous camera.
- Fullscreen surfaces keep object identity.
- Mobile uses bottom sheets or routes appropriately.

### Phase 6 — Agentic canvas

Implement:

- useAgentOnCanvas.
- Selection-scoped AI actions.
- Region-scoped AI actions.
- AI-generated block streaming.
- Mutation previews.
- Human checkpoints.
- Background agent status.
- Local/device mesh/Edge Twin execution scope display.

Acceptance:

- AI can create, organize, summarize, and transform canvas regions.
- Large changes require preview.
- User can cancel/undo.
- Agent actions have source/provenance.

### Phase 7 — History, recovery, and versioning

Implement:

- Undo/redo.
- Autosave.
- Snapshots.
- Branch/fork.
- Recovery drafts.
- Agent audit trail.
- Provenance-sensitive history.

Acceptance:

- Work feels impossible to lose.
- Major AI transformations can be restored.
- Offline work is preserved.
- Conflicts are visible and recoverable.

### Phase 8 — Mobile, accessibility, and polish

Implement:

- Mobile navigate/create/edit/inspect modes.
- Touch-friendly handles.
- Pinch zoom.
- Bottom sheet inspector.
- Share/capture flows.
- Keyboard accessibility.
- Screen-reader labels.
- Reduced motion.
- Performance pass.

Acceptance:

- Mobile is intentionally designed.
- Controls meet hit target requirements.
- Reduced motion path exists.
- Large canvases remain performant.

## Quality bar

The final experience must feel:

- tldraw-level fluid in spatial manipulation.
- AFFiNE-level flexible in block/document hybrid thinking.
- Claude/ChatGPT-level calm in AI interaction.
- Balnce-native in agentic depth, memory, identity, commerce, and imagination.

The canvas should feel like thought made tangible.

## Final verification checklist

Before claiming completion, verify:

- No `TODO: real implementation`.
- No `mock`.
- No `stub`.
- No fake backend claims.
- No one-off component that bypasses contracts.
- No untyped object mutation.
- No AI action without scope.
- No consequential action without checkpoint.
- No expansion without return path.
- No mobile path left undesigned.
- No accessibility path ignored.
- Gap list updated.
- Tests pass.
- Docs reflect actual implementation.
